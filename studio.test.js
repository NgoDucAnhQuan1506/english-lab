const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const F=require('./public/foundation'),M=require('./public/course-method'),S=require('./public/scenarios'),E=require('./public/study-engine'),C=require('./public/review-coach');
const T=Date.UTC(2026,9,26),DAY=86400000;
const event=(type,body,at=T)=>E.event({id:randomUUID(),at,type,course:F.version,...body},M.lessons,at+1);
const answer=(q,at=T,extra={})=>event('answer',{question:q.id,run:randomUUID(),answer:q.answers[0],...extra},at);
test('all seven stages have two complete authored four-step scenes with earlier teaching evidence',()=>{
  assert.equal(S.scenes.length,14);assert.deepEqual(S.validate(F.lessons),[]);
  for(let i=1;i<=7;i++)assert.equal(S.scenes.filter(s=>s.stage===i).length,2);
  assert.equal(Object.keys(E.index(M.lessons).scenarios).length,14);
  for(const s of S.scenes)for(const t of s.turns){assert(t.model&&t.why&&t.checks.length);if(t.audio)assert(t.transcript&&t.audio.text&&!/^\//.test(t.audio.text));}
});
test('studio history validates IDs, separates courses and drops private drafts and claimed grades',()=>{
  const scene=S.scenes[0],run=randomUUID(),records=scene.turns.map(t=>event('studio',{scene:scene.id,turn:t.id,run,value:'checked',answer:'Private response',correct:true,assisted:true}));
  assert(records.every(r=>!('answer'in r)&&!('correct'in r)));
  const s=E.state(E.merge(records,records),M.lessons);assert.equal(Object.keys(s.studioRuns[run].turns).length,4);assert.equal(s.attempts,0);assert.deepEqual(s.completed,[]);assert.equal(M.evidence(s,T)[6].applicationPassed,false);
  for(const body of [{scene:'__proto__'},{turn:S.scenes[1].turns[0].id},{run:'invalid'},{value:'passed'},{course:'legacy-v1'}])assert.throws(()=>event('studio',{scene:scene.id,turn:scene.turns[0].id,run,value:'checked',...body}));
  assert.equal(Object.keys(E.state(records,require('./public/curriculum').lessons).studioRuns).length,0);
});
test('studio keeps separate runs, retry feedback and latest self-reflection without inflating scores',()=>{
  const scene=S.scenes[4],run=randomUUID(),body={scene:scene.id,turn:scene.turns[0].id,run};
  const s=E.state([event('studio',{...body,value:'retry'}),event('studio',{...body,value:'checked'},T+1),event('studio',{...body,run:randomUUID(),value:'retry'},T+2)],M.lessons);
  assert.equal(s.studioRuns[run].turns[body.turn].value,'checked');assert.equal(Object.keys(s.studioRuns).length,2);assert.equal(s.correct,0);
});
test('review uses known same-concept variants, preserves original error and limits duplicate content',()=>{
  const q=E.index(M.lessons).questions['f2-l20-p1'],events=[answer(q,T,{answer:'wrong'})],tasks=C.plan(events,M.lessons,'wrong',3,T+1),first=tasks[0];
  assert(first.changed);assert.notEqual(first.source,first.item);const lookup=E.index(M.lessons),target=lookup.questions[first.item];assert(target.day<=q.day);assert(C.refs(target).some(r=>C.refs(q).includes(r)));
  const reviewed=answer(target,T+1,{context:'review'});assert.equal(E.state([...events,reviewed],M.lessons).mistakes[q.id],true);assert.equal(M.evidence(E.state([...events,reviewed],M.lessons),T+1)[20].applicationPassed,false);
  const many=[...events,...M.lessons[19].transfer.map(v=>answer(v,T,{answer:'wrong'}))],batch=C.plan(many,M.lessons,'wrong',6,T+1);
  assert(batch.length<=6);assert.equal(new Set(batch.map(t=>C.signature(lookup.questions[t.item]))).size,batch.length);
});
test('review rotates with real history and returns to the source after two independent related recalls',()=>{
  const lookup=E.index(M.lessons),q=lookup.questions['f2-l20-p1'],events=[answer(q,T,{answer:'wrong'})];
  const one=C.plan(events,M.lessons,'wrong',1,T+1)[0];events.push(answer(lookup.questions[one.item],T+1,{context:'review'}));
  const two=C.plan(events,M.lessons,'wrong',1,T+2)[0];assert.notEqual(two.item,one.item);events.push(answer(lookup.questions[two.item],T+2,{context:'review'}));
  const three=C.plan(events,M.lessons,'wrong',1,T+3)[0];assert.equal(three.item,q.id);events.push(answer(q,T+3,{context:'review'}));assert.equal(E.state(events,M.lessons).mistakes[q.id],false);
});
test('review preserves word favorites and legacy fallback, ignores future answers when rotating',()=>{
  const legacy=require('./public/curriculum').lessons,q=M.lessons[19].practice[0],events=[answer(q,T,{answer:'wrong'})],a=C.plan(events,M.lessons,'wrong',1,T+1)[0];
  const b=C.plan([...events,answer(E.index(M.lessons).questions[a.item],T+DAY)],M.lessons,'wrong',1,T+1)[0];assert.equal(a.item,b.item);
  const word=M.lessons[6].vocab[0],fav=event('favorite',{item:word.id,value:true});assert.equal(C.plan([fav],M.lessons,'favorites',3,T)[0].item,word.id);
  assert.deepEqual(C.plan([],legacy,'wrong',3,T),[]);
});
test('feedback addresses bounded actual error patterns and does not diagnose valid variants',()=>{
  const lookup=E.index(M.lessons),q=lookup.questions['f2-method1-l34-x3'];assert.match(C.feedback(q,"She doesn't has breakfast.",M.lessons).explanation,/have/);
  const letter=lookup.questions['f2-method1-l1-x1'];assert.match(C.feedback(letter,'A',M.lessons).title,/dạng viết/);
  assert.equal(C.feedback(q,q.answers[0],M.lessons),null);
});
