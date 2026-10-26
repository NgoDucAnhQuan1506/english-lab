const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const F=require('./public/foundation'),M=require('./public/course-method'),E=require('./public/study-engine');
const DAY=86400000,T=Date.UTC(2026,8,1,9);
const make=(type,payload,at=T)=>E.event({id:randomUUID(),at,type,course:F.version,...payload},M.lessons,at+1000);
const answers=(questions,at=T,extra={})=>{const run=randomUUID();return questions.map(q=>make('answer',{run,question:q.id,answer:q.answers[0],...extra},at));};
const base=(day=20)=>answers([...M.lessons[day-1].practice,...M.lessons[day-1].test]);
const evidence=(events,at=T+10*DAY,day=20)=>M.evidence(E.state(events,M.lessons),at)[day];

test('all 42 teaching packets have authored targets, error repair, personal task and sourced probes; old content is unchanged',()=>{
  assert.equal(M.packets.length,42);assert.deepEqual(M.validate(),[]);
  const previous=E.index(F.lessons).questions,ids=new Set(Object.keys(previous));
  for(const lesson of M.lessons){
    assert.equal(lesson.practice,F.lessons[lesson.day-1].practice);assert.equal(lesson.test,F.lessons[lesson.day-1].test);
    assert(lesson.method.task&&lesson.method.model&&lesson.method.reason&&lesson.method.error!==lesson.method.correction);
    assert.equal(lesson.method.sessions.length,3);assert.deepEqual([...new Set(lesson.retention.map(q=>q.delayDays))],[1,3,7]);
    for(const q of [...lesson.transfer,...lesson.retention]){assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.type,'text');assert(E.grade(q,q.answers[0]));}
  }
});
test('alphabet practice covers all 26 letters by independent hearing and matching, not a few samples',()=>{
  const lessons=M.lessons.slice(0,4),heard=new Set(lessons.flatMap(l=>l.transfer.filter(q=>q.audio).map(q=>q.audio.text)));
  assert.deepEqual([...heard],F.alphabet.map(a=>a.letter));
  assert.equal(lessons.flatMap(l=>l.transfer.filter(q=>q.caseSensitive)).length,26);
  const q=lessons[0].transfer[0];assert(E.grade(q,'a'));assert(!E.grade(q,'A'));
  assert.equal(new Set(lessons[0].retention.map(q=>q.answers[0].toLowerCase())).size,6);
});
test('historical sample passes and old reflections never become new application or long-term evidence',()=>{
  const events=[...base(),make('reflection',{day:20,value:'checked'})],s=E.state(events,M.lessons),v=M.evidence(s,T+10*DAY)[20];
  assert(s.completed.includes(20));assert.equal(v.applicationPassed,false);assert.equal(v.independentWritingChecked,false);assert(v.milestones.every(m=>m.due===null&&!m.passed));
});
test('application needs a complete authored form; immediate repetition after support cannot substitute',()=>{
  const lesson=M.lessons[19],first=lesson.transfer.slice(0,2),supported=[...base(),...answers(first,T,{assisted:true})];assert.equal(evidence(supported).applicationPassed,false);
  assert.equal(evidence([...supported,...answers(first,T+1000)]).applicationPassed,false);
  assert.equal(evidence([...supported,...answers(first,T+DAY)]).applicationPassed,true);
  const complete=[...supported,...answers(lesson.transfer.slice(2,4),T+1000)];assert.equal(evidence(complete).applicationPassed,true);
  assert.deepEqual(E.state(complete,M.lessons).completed,[20]);
  const split=[...base(),...answers(first.slice(0,1)),...answers(first.slice(1))];assert.equal(evidence(split).applicationPassed,false);
});
test('same-day and three groups on one later day cannot fake spaced occasions',()=>{
  const lesson=M.lessons[19],foundation=[...base(),...answers(lesson.transfer)];
  const early=[...foundation,...answers(lesson.retention,T+3600000)];assert(evidence(early).milestones.every(m=>!m.passed));
  const cram=[...foundation,...answers(lesson.retention,T+7*DAY)];const v=evidence(cram,T+7*DAY);
  assert.equal(v.milestones[0].passed,true);assert.equal(v.milestones[0].elapsedDays,7);
  assert.equal(v.milestones[1].passed,false);assert.equal(v.milestones[1].due,T+8*DAY);assert.equal(v.milestones[2].passed,false);
});
test('1/3/7-day independent recalls qualify in sequence; future-dated records do not count early',()=>{
  const lesson=M.lessons[19],events=[...base(),...answers(lesson.transfer)];
  for(const days of [1,3,7])events.push(...answers(lesson.retention.filter(q=>q.delayDays===days),T+days*DAY));
  assert.deepEqual(evidence(events,T+7*DAY).milestones.map(m=>m.passed),[true,true,true]);
  assert.deepEqual(evidence(events,T).milestones.map(m=>m.passed),[false,false,false]);
});
test('reviews and assisted delayed answers remain practice, not verified delayed checkups',()=>{
  const lesson=M.lessons[19],events=[...base(),...answers(lesson.transfer)];
  const delayed=lesson.retention.filter(q=>q.delayDays===1);
  events.push(...answers(delayed,T+DAY,{context:'review'}),...answers(delayed,T+DAY,{assisted:true}));
  assert.equal(evidence(events).milestones[0].passed,false);
  const forged=answers(delayed,T+DAY).map(e=>({...e,answer:'incorrect',correct:true}));
  assert.equal(evidence([...events,...forged]).milestones[0].passed,false);
  const reviewed=[...base(),...answers(lesson.transfer.slice(0,2),T,{context:'review',assisted:true})];
  assert.equal(evidence([...reviewed,...answers(lesson.transfer.slice(0,2),T+1000)]).applicationPassed,false);
  assert.equal(evidence([...reviewed,...answers(lesson.transfer.slice(0,2),T+DAY)]).applicationPassed,true);
});
test('checkup duplicates deduplicate and new rubric confirmation remains self-assessment',()=>{
  const lesson=M.lessons[19],events=[...base(),...answers(lesson.transfer),make('reflection',{day:20,value:'checked',rubric:'method1'})];
  const s=E.state(E.merge(events,events),M.lessons);assert.equal(s.attempts,lesson.practice.length+lesson.test.length+lesson.transfer.length);
  assert.equal(M.evidence(s,T)[20].independentWritingChecked,true);assert(M.evidence(s,T)[20].milestones.every(m=>!m.passed));
});
test('clock answers preserve meaningful punctuation and short-form requests stay constrained',()=>{
  const clock=M.lessons[36].transfer.find(q=>q.format==='clock');assert(E.grade(clock,'08:30'));assert(!E.grade(clock,'83:0'));assert(!E.grade(clock,'830'));
  const contraction=M.lessons[33].retention.find(q=>q.prompt.includes('dạng gọn'));assert(E.grade(contraction,"don't"));assert(!E.grade(contraction,'do not'));
  const repair=M.lessons[28].transfer.find(q=>q.prompt.includes('Tôi chưa hiểu'));assert(E.grade(repair,"I don't understand."));
});
test('every lesson and every authored application form can complete the full spaced pathway without changing old grades',()=>{
  for(const lesson of M.lessons){
    for(const form of lesson.transferForms){
      const questions=lesson.transfer.filter(q=>form.includes(q.id)),events=[...base(lesson.day),...answers(questions)];
      for(const days of [1,3,7])events.push(...answers(lesson.retention.filter(q=>q.delayDays===days),T+days*DAY));
      const v=evidence(events,T+7*DAY,lesson.day);assert(v.applicationPassed,`application ${lesson.day}`);assert(v.milestones.every(m=>m.passed),`recall ${lesson.day}`);
      assert.deepEqual(E.state(events,M.lessons).completed,[lesson.day]);
    }
  }
});
