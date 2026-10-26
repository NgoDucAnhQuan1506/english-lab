const {test}=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const F=require('./public/foundation');
const C=require('./public/curriculum');
const E=require('./public/study-engine');
const all=[...C.lessons,...F.lessons],now=Date.now();
const make=(type,payload={},at=now)=>E.event({id:randomUUID(),at,type,course:F.version,...payload},all,now+10000);

test('42 authored lessons follow the requested seven stages; every assessment has earlier teaching evidence',()=>{
  assert.equal(F.lessons.length,42);
  assert.deepEqual(F.lessons.slice(0,4).map(l=>l.title),['A–F','G–L','M–R','S–Z']);
  const ids=new Set(Object.keys(E.index(C.lessons).questions));
  for(const [i,l]of F.lessons.entries()){
    assert.equal(l.day,i+1);assert.equal(l.stage,Math.ceil((i+1)/6));assert.deepEqual(F.validate(l),[],`lesson ${l.day}`);
    assert(l.guided.every(m=>m.prompt&&m.steps.length>=2&&m.answer));assert(l.checklist.length>=2);
    for(const q of [...l.practice,...l.test]){
      assert(!ids.has(q.id));ids.add(q.id);assert(E.grade(q,q.answers[0]));assert(!E.grade(q,'unrelated-answer'));
      if(q.type==='order')assert(E.grade(q,q.words.join(' ')),`word pieces ${q.id}`);
    }
  }
  assert.equal(F.lessons[41].title,'Tổng ôn và kế hoạch học tiếp');
  const malformed=structuredClone(F.lessons[0]);malformed.test[0].refs=['42:next'];assert(F.validate(malformed).some(v=>v.includes('Nguồn dạy')));
});
test('legacy and Foundation histories coexist without reusing meaning or completing each other',()=>{
  const legacy=E.event({id:randomUUID(),at:now,type:'view',day:30,step:'summary'},all);
  const foundation=make('view',{day:1,step:'intro'});
  const mixed=[legacy,foundation];assert.deepEqual(E.state(mixed,C.lessons).seen,[30]);assert.deepEqual(E.state(mixed,F.lessons).seen,[1]);assert.deepEqual(E.state(mixed,F.lessons).completed,[]);
  assert.throws(()=>make('answer',{question:'d1-p1',run:randomUUID(),answer:'apple'}));
});
test('opening support never counts as independent evidence; full attempt differs from passing',()=>{
  const l=F.lessons[0],run=randomUUID(),responses=[...l.practice,...l.test].map(q=>make('answer',{run,question:q.id,answer:q.answers[0],assisted:true}));
  let s=E.state(responses,F.lessons);assert.deepEqual(s.finished,[1]);assert.deepEqual(s.completed,[]);assert.equal(s.assisted,responses.length);assert.equal(Object.values(s.skills).reduce((n,v)=>n+v.total,0),0);
  const independent=randomUUID(),other=[...l.practice,...l.test].map(q=>make('answer',{run:independent,question:q.id,answer:q.answers[0]}));
  s=E.state([...responses,...other,...other],F.lessons);assert.deepEqual(s.completed,[1]);assert.equal(s.attempts,responses.length+other.length);
  assert.equal(E.state(other.map(e=>({...e,correct:false})),F.lessons).correct,other.length,'recompute from answer, not client flag');
});
test('legal contractions, smart apostrophes, case-sensitive letters and defined variants grade correctly',()=>{
  const q=F.lessons[21].test[2];assert(E.grade(q,"She's not tired!"));assert(E.grade(q,'She isn’t tired.'));assert(E.grade(q,'She is not tired.'));assert(!E.grade(q,'She not tired.'));
  const lower=F.lessons[0].practice[2];assert(!E.grade(lower,'F'));assert(E.grade(lower,'f'));
  assert(E.grade(F.lessons[19].test[1],"I'm a student."));
  assert(E.grade(F.lessons[36].test[2],"It's seven o'clock."));
  assert(E.grade(F.lessons[38].test[1],'I would like a cup of tea.'));
  assert(!E.grade(F.lessons[19].practice[3],'I am'),'explicit request to write the short form stays constrained');
});
test('10/20/30 minutes change actual question, review and vocabulary budgets',()=>{
  const plans=[10,20,30].map(E.sessionPlan);assert.deepEqual(plans.map(p=>p.questions),[3,6,9]);assert.deepEqual(plans.map(p=>p.reviews),[3,6,10]);assert.deepEqual(plans.map(p=>p.words),[3,5,8]);
  assert.equal(E.sessionPlan(999).minutes,20);
});
test('today recommends beginning, resuming, next lesson or a reasoned short review from real events',()=>{
  assert.equal(E.recommend(E.state([],F.lessons),F.lessons).day,1);
  let history=[make('view',{day:1,step:'practice'})];assert.equal(E.recommend(E.state(history,F.lessons),F.lessons).action,'resume');
  const run=randomUUID();history.push(...[...F.lessons[0].practice,...F.lessons[0].test].map(q=>make('answer',{run,question:q.id,answer:q.answers[0]})));
  let rec=E.recommend(E.state(history,F.lessons),F.lessons);assert.equal(rec.action,'learn');assert.equal(rec.day,2);
  history.push(...F.lessons[1].practice.slice(0,3).map(q=>make('answer',{run:randomUUID(),question:q.id,answer:'wrong'})));rec=E.recommend(E.state(history,F.lessons),F.lessons);assert.equal(rec.action,'review');assert.match(rec.reason,/3 câu/);
});
test('review queue is finite, prioritizes wrong/due items and handles both question and word recalls',()=>{
  const history=F.lessons.slice(0,3).flatMap(l=>l.practice.map(q=>make('answer',{run:randomUUID(),question:q.id,answer:'wrong'},now-5*86400000)));
  history.push(make('favorite',{item:'f2-l7-v1',value:true}));const s=E.state(history,F.lessons);
  const queue=E.reviewQueue(s,F.lessons,'due',3,now);assert.equal(queue.length,3);assert.equal(new Set(queue).size,3);assert(queue.every(q=>s.mistakes[q]));
  assert.deepEqual(E.reviewQueue(s,F.lessons,'favorites',3),['f2-l7-v1']);
  assert.equal(s.reviews['f2-l7-v1'].due,now+86400000,'saving a word schedules an initial recall');
});
test('cross-tab time and merge retries cannot inflate totals; reflections never pass a test',()=>{
  const history=[make('time',{day:1,seconds:40}),make('time',{day:1,seconds:40}),make('reflection',{day:1,value:'checked'})];
  const s=E.state(E.merge(history,history),F.lessons);assert.equal(s.seconds,40);assert.deepEqual(s.completed,[]);assert.equal(s.reflections[1],'checked');
});

test('reviewing a full question set never substitutes for the lesson assessment',()=>{
  const run=randomUUID(),l=F.lessons[0],events=[...l.practice,...l.test].map(q=>make('answer',{run,question:q.id,answer:q.answers[0],context:'review'}));
  const s=E.state(events,F.lessons);assert.equal(s.attempts,events.length);assert.deepEqual(s.completed,[]);assert.deepEqual(s.finished,[]);
});
test('all 42 complete independent runs can pass without missing content or impossible word pieces',()=>{
  const history=F.lessons.flatMap(l=>{const run=randomUUID();return [...l.practice,...l.test].map(q=>make('answer',{run,question:q.id,answer:q.answers[0]}));});
  assert.deepEqual(E.state(history,F.lessons).completed,Array.from({length:42},(_,i)=>i+1));
});
test('active intervals merge across clock-minute boundaries and keep non-overlapping time',()=>{
  const at=Date.UTC(2026,0,1,12,1,5);
  const times=[make('time',{day:1,seconds:30},at-1000),make('time',{day:1,seconds:30},at),make('time',{day:1,seconds:30},at+60000)];
  assert.equal(E.state(times,F.lessons).seconds,61);
});
