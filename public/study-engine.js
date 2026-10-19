(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.StudyEngine = factory();
})(globalThis, function () {
  'use strict';
  const intervals = [1, 3, 7, 14];
  const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const grade = (question, answer) => question.answers.some(expected => question.caseSensitive ? String(expected).trim() === String(answer).trim() : normalize(expected) === normalize(answer));
  const dateKey = (at, timezone = 'Asia/Ho_Chi_Minh') => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(at));
  function index(course) {
    const questions = Object.create(null), words = Object.create(null);
    for (const lesson of course) {
      for (const section of ['practice', 'test']) for (const q of lesson[section]) questions[q.id] = { ...q, day: lesson.day, section };
      for (const word of lesson.vocab) words[word.id] = { ...word, day: lesson.day };
    }
    return { questions, words };
  }
  function event(input, course, now = Date.now()) {
    if (!input || typeof input !== 'object' || !/^[a-f0-9-]{36}$/i.test(input.id || '') || !Number.isFinite(input.at) || input.at < 0 || input.at > now + 300000) throw new Error('Mã hoặc thời điểm hoạt động không hợp lệ.');
    const { questions, words } = index(course);
    const e = { id: input.id, at: input.at, type: input.type };
    if (input.type === 'answer') {
      const q = questions[input.question];
      if (!q || typeof input.answer !== 'string' || input.answer.length > 500 || !/^[a-f0-9-]{36}$/i.test(input.run || '')) throw new Error('Lượt trả lời không hợp lệ.');
      Object.assign(e, { question: q.id, run: input.run, answer: input.answer, correct: grade(q, input.answer), day: q.day, section: q.section, skill: q.skill });
      if (q.word) e.item = q.word;
    } else if (input.type === 'view') {
      if (!course.some(l => l.day === input.day) || !['intro', 'vocab', 'listen', 'practice', 'test', 'summary'].includes(input.step)) throw new Error('Vị trí học không hợp lệ.');
      Object.assign(e, { day: input.day, step: input.step });
    } else if (input.type === 'favorite' || input.type === 'rating') {
      if (!words[input.item] && !questions[input.item]) throw new Error('Nội dung ôn không hợp lệ.');
      e.item = input.item;
      if (input.type === 'favorite') { if (typeof input.value !== 'boolean' || !words[input.item]) throw new Error('Yêu thích không hợp lệ.'); e.value = input.value; }
      else { if (!['again', 'hard', 'good'].includes(input.value)) throw new Error('Mức nhớ không hợp lệ.'); e.value = input.value; }
    } else if (input.type === 'time') {
      if (!Number.isInteger(input.seconds) || input.seconds < 1 || input.seconds > 60 || !course.some(l => l.day === input.day)) throw new Error('Thời gian học không hợp lệ.');
      Object.assign(e, { seconds: input.seconds, day: input.day });
    } else throw new Error('Loại hoạt động không hợp lệ.');
    return e;
  }
  function merge(left = [], right = []) {
    const map = new Map(left.map(e => [e.id, e]));
    // Existing server events win when an ID is reused with a different payload.
    for (const e of right) if (!map.has(e.id)) map.set(e.id, e);
    return [...map.values()].sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  }
  function state(events = [], course, timezone = 'Asia/Ho_Chi_Minh') {
    const lookup = index(course);
    const dict = () => Object.create(null);
    const result = { resume: { day: 1, step: 'intro' }, favorites: dict(), reviews: dict(), runs: dict(), skills: dict(), daily: dict(), completed: [], mistakes: dict(), seen: [], seconds: 0, attempts: 0, correct: 0 };
    const answered = new Set();
    const timeCounts = new Map();
    function schedule(item, value, at) {
      const old = result.reviews[item] || { level: -1, due: 0, value: 'again' };
      const level = value === 'again' ? 0 : value === 'hard' ? Math.max(0, old.level) : Math.min(3, old.level + 1);
      result.reviews[item] = { level, due: at + intervals[level] * 86400000, value };
    }
    for (const e of merge(events)) {
      if (e.type === 'view') { result.resume = { day: e.day, step: e.step }; if (!result.seen.includes(e.day)) result.seen.push(e.day); }
      if (e.type === 'favorite') result.favorites[e.item] = e.value;
      if (e.type === 'rating') schedule(e.item, e.value, e.at);
      if (e.type === 'time') {
        const key = dateKey(e.at, timezone); result.daily[key] ||= { answers: 0, seconds: 0 };
        // At most one minute of time per real clock minute, even across tabs/merged ledgers.
        const bucket = `time-${Math.floor(e.at / 60000)}`;
        const recorded = timeCounts.get(bucket) || 0, addition = Math.min(e.seconds, 60 - recorded);
        result.seconds += addition; result.daily[key].seconds += addition; timeCounts.set(bucket, recorded + addition);
      }
      if (e.type !== 'answer' || !lookup.questions[e.question]) continue;
      const key = `${e.run}:${e.question}`;
      if (answered.has(key)) continue;
      answered.add(key);
      const q = lookup.questions[e.question];
      result.attempts++; if (e.correct) result.correct++;
      const day = dateKey(e.at, timezone); result.daily[day] ||= { answers: 0, seconds: 0 }; result.daily[day].answers++;
      result.skills[e.skill] ||= { correct: 0, total: 0 }; result.skills[e.skill].total++; if (e.correct) result.skills[e.skill].correct++;
      result.runs[e.run] ||= { day: e.day, at: e.at, answers: dict() }; result.runs[e.run].answers[q.id] = e;
      result.mistakes[q.id] = !e.correct;
      schedule(q.id, e.correct ? 'good' : 'again', e.at);
      if (e.item && lookup.words[e.item]) schedule(e.item, e.correct ? 'good' : 'again', e.at);
    }
    for (const lesson of course) {
      const passed = Object.values(result.runs).some(run => run.day === lesson.day && lesson.practice.every(q => run.answers[q.id]) && lesson.test.every(q => run.answers[q.id]) && lesson.practice.filter(q => run.answers[q.id]?.correct).length >= Math.ceil(lesson.practice.length * .75) && lesson.test.filter(q => run.answers[q.id]?.correct).length >= Math.ceil(lesson.test.length * 2 / 3));
      if (passed) result.completed.push(lesson.day);
    }
    return result;
  }
  return { intervals, normalize, grade, dateKey, index, event, merge, state };
});
