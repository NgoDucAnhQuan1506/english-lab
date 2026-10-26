const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const C = require('./public/curriculum');
const E = require('./public/study-engine');
const at = Date.UTC(2026, 0, 1, 12);
const make = (type, values = {}, time = at) => E.event({ id: randomUUID(), type, at: time, ...values }, C.lessons, at + 86400000 * 30);
test('all 30 lessons are complete, uniquely identified and grade their own answers', () => {
  assert.deepEqual(C.lessons.map(l => l.day), Array.from({ length: 30 }, (_, i) => i + 1));
  const ids = new Set();
  for (const l of C.lessons) {
    assert.deepEqual(C.validate(l), [], `Day ${l.day}`);
    assert.equal(l.practice.length, 8); assert.equal(l.test.length, 3);
    for (const q of [...l.practice, ...l.test]) { assert(!ids.has(q.id)); ids.add(q.id); assert(E.grade(q, q.answers[0])); assert(!E.grade(q, 'answer-not-in-the-lesson')); }
  }
  assert.deepEqual(C.lessons.filter(l => l.consolidation).map(l => l.day), [7, 14, 21, 30]);
  assert.equal(ids.size, 330);
});
test('grading accepts only defined variants; letter case can be required', () => {
  const q = { answers: ['I am fine.'] };
  assert(E.grade(q, ' i AM  fine! ')); assert(!E.grade(q, 'I fine')); assert(!E.grade(q, "I'm fine"));
  assert(!E.grade({ answers: ['d'], caseSensitive: true }, 'D'));
  assert(E.grade({ answers: ['d'], caseSensitive: true }, 'd'));
});
test('viewing never completes a day; one full qualified run does; attempts deduplicate', () => {
  const l = C.lessons[0], run = randomUUID();
  const view = make('view', { day: 1, step: 'summary' });
  assert.deepEqual(E.state([view], C.lessons).completed, []);
  const answers = [...l.practice, ...l.test].map(q => make('answer', { question: q.id, run, answer: q.answers[0] }));
  const state = E.state([view, ...answers, ...answers], C.lessons);
  assert.deepEqual(state.completed, [1]); assert.equal(state.attempts, 11); assert.equal(state.correct, 11);
  const duplicate = make('answer', { question: l.practice[0].id, run, answer: 'wrong' }, at + 1000);
  assert.equal(E.state([...answers, duplicate], C.lessons).attempts, 11);
  assert.deepEqual(E.state(answers.slice(0, 8), C.lessons).completed, []);
});
test('merge retains both histories, preserves server results and is idempotent', () => {
  const one = make('view', { day: 1, step: 'vocab' });
  const two = make('favorite', { item: 'd1-v1', value: true });
  const merged = E.merge([one], [one, two]); assert.equal(merged.length, 2);
  assert.deepEqual(E.merge(merged, [one, two]), merged);
  assert.equal(E.merge([one], [{ ...one, day: 30 }])[0].day, 1);
});
test('reviews follow 1,3,7,14 days and reset for forgotten items', () => {
  const events = [];
  for (let i = 0; i < 4; i++) {
    const e = make('rating', { item: 'd1-v1', value: 'good' }, at + i * 1000); events.push(e);
    assert.equal(E.state(events, C.lessons).reviews['d1-v1'].due, e.at + E.intervals[i] * 86400000);
  }
  const forgotten = make('rating', { item: 'd1-v1', value: 'again' }, at + 5000); events.push(forgotten);
  assert.equal(E.state(events, C.lessons).reviews['d1-v1'].due, forgotten.at + 86400000);
});
test('timezone and active time account for date boundaries and concurrent tabs', () => {
  assert.equal(E.dateKey(Date.UTC(2026, 0, 1, 18)), '2026-01-02');
  const times = [0, 1, 2].map(i => make('time', { day: 1, seconds: 30 }, at + i * 1000));
  assert.equal(E.state(times, C.lessons).seconds, 32, '30-second intervals ending a second apart have a 32-second union');
});
test('invalid events and malformed content cannot insert arbitrary question keys', () => {
  assert.throws(() => make('answer', { question: '__proto__', run: randomUUID(), answer: 'true' }));
  assert.throws(() => make('time', { day: 1, seconds: 3000 }));
  const invalid = structuredClone(C.lessons[0]); invalid.practice[0].answers = ['missing-option']; assert(C.validate(invalid).length);
  invalid.practice[0].id = 'd30-p1'; assert(C.validate(invalid).some(e => e.includes('Mã câu')));
});
