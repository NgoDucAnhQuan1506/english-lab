/* Native JS UI. Event history belongs to an account; drafts never cross identities. */
(() => {
  'use strict';
  const E=StudyEngine,M=CourseMethod,F={...Foundation,lessons:CourseMethod.lessons},root=document.getElementById('courseRoot'),status=document.getElementById('saveStatus');
  function cachedLegacy(){try{const value=JSON.parse(localStorage.getItem('englishlab.content.legacy.v1')||'null');if(Array.isArray(value)&&value.length===30&&value.every(l=>!Curriculum.validate(l).length))return value;}catch{}return Curriculum.lessons;}
  let legacy=cachedLegacy(),course=F.version,lessons=F.lessons,compatibilityMode=false;
  function cacheLegacy(){try{localStorage.setItem('englishlab.content.legacy.v1',JSON.stringify(legacy));}catch{/* Optional public content cache must not block progress. */}}
  let user=null,events=[],pending=[],runs={},drafts={},cursor={},session=null,minutes=20;
  let screen='today',selectedDay=1,step='intro',generation=0,syncing=null;
  let filter='',topic='all',notebookLimit=20,reviewMode='due',reviewSession=null,lastInteraction=Date.now(),lastTick=Date.now();
  let translated=false,role='both',wordLimit=5,editorDay=1,editorVersion=0,editorLesson=null;
  let studioScene=null,studioTurn=null;
  const all=()=>[...legacy,...F.lessons];
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const p=text=>el('p',text);
  const button=(text,action,cls='secondary-button')=>{const b=el('button',text,cls);b.type='button';b.onclick=action;return b;};
  const card=(heading,...nodes)=>{const n=el('section',undefined,'study-card');if(heading)n.append(el('h2',heading));n.append(...nodes);return n;};
  const key=()=>`englishlab.study.${user?user.id:'guest'}.v1`;
  const state=()=>E.state(events,lessons,timezone());
  const runKey=day=>`${course}:${day}`;
  const plan=()=>E.sessionPlan(session?.minutes||minutes);
  function timezone(){try{const v=localStorage.getItem('englishlab.timezone')||'Asia/Ho_Chi_Minh';E.dateKey(Date.now(),v);return v;}catch{return 'Asia/Ho_Chi_Minh';}}
  function readStorage(storageKey){
    try{const value=JSON.parse(localStorage.getItem(storageKey)||'{}');
      if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid storage');
      for(const list of [value.events,value.pending])if(list!==undefined&&(!Array.isArray(list)||list.some(e=>!e||typeof e.id!=='string'||!Number.isFinite(e.at)||typeof e.type!=='string')))throw new Error('Invalid ledger');
      return {...value,events:value.events||[],pending:value.pending||[],runs:value.runs&&typeof value.runs==='object'&&!Array.isArray(value.runs)?value.runs:{},drafts:value.drafts&&typeof value.drafts==='object'&&!Array.isArray(value.drafts)?value.drafts:{}};}
    catch{return {events:[],pending:[],runs:{},drafts:{},corrupt:true};}
  }
  function mergeDrafts(left,right){const result={...left};for(const [k,v]of Object.entries(right))if(!['__proto__','constructor','prototype'].includes(k)&&v&&typeof v==='object'&&(!result[k]||(v.updated||0)>=(result[k].updated||0)))result[k]=v;return result;}
  function saveMessage(text,retry=false){status.replaceChildren(document.createTextNode(text));if(retry)status.append(button('Thử lưu lại',()=>sync(),'text-button'));}
  function persist(){
    try{const other=readStorage(key());if(other.corrupt){saveMessage('Bản lưu hiện có không đọc được; chưa ghi đè. Giữ trang và xuất bản sao để khôi phục.');return false;}events=E.merge(other.events,events);pending=E.merge(other.pending,pending);drafts=mergeDrafts(other.drafts,drafts);
      localStorage.setItem(key(),JSON.stringify({...other,schema:2,events,pending,runs:{...other.runs,...runs},drafts,minutes,course,cursor,session}));return true;
    }catch{saveMessage('Không lưu được trên thiết bị (bộ nhớ đầy hoặc bị chặn). Giữ trang mở và xuất bản sao ngay.');return false;}
  }
  function log(type,payload={}){
    const value=E.event({id:crypto.randomUUID(),at:Math.max(Date.now(),(events.at(-1)?.at||0)+1),type,course,...payload},all());
    events=E.merge(events,[value]);if(user)pending=E.merge(pending,[value]);
    if(persist())saveMessage(user?'Đã lưu trên thiết bị · đang chờ đồng bộ…':'Đã lưu trên thiết bị · chế độ khách.');
    if(user)void sync();return value;
  }
  async function sync(){
    if(!user)return false;if(syncing)return syncing;
    const token=generation;
    const task=(async()=>{
      try{
        if(!pending.length){const snapshot=await api('study');if(token!==generation)return false;events=E.merge(snapshot.events,events);}
        while(pending.length&&token===generation){
          const batch=pending.slice(0,300),result=await api('study',{events:batch});if(token!==generation)return false;
          const sent=new Set(batch.map(e=>e.id)),cached=readStorage(key());events=E.merge(result.events,events);pending=E.merge(cached.pending,pending).filter(e=>!sent.has(e.id));
          // Persist acknowledgements before merging another tab's pending changes.
          try{localStorage.setItem(key(),JSON.stringify({...cached,pending}));}catch{}
          persist();
        }
        if(token!==generation)return false;
        const saved=persist();if(saved)saveMessage('Đã lưu tiến độ vào tài khoản. Bản nháp câu nhập vẫn lưu riêng trên thiết bị.');return saved;
      }catch(error){if(token===generation)saveMessage(error.status===401?'Phiên đã hết hạn. Dữ liệu chờ vẫn ở thiết bị; đăng nhập lại cùng tài khoản để lưu.':'Đồng bộ thất bại. Tiến độ vẫn ở thiết bị; kết nối lại rồi thử lưu.',true);return false;}
      finally{if(token===generation)syncing=null;}
    })();syncing=task;return task;
  }
  async function account(value){
    const token=++generation;user=value;syncing=null;const cached=readStorage(key());events=cached.events;pending=cached.pending;runs=cached.runs;drafts=cached.drafts;
    minutes=[10,20,30].includes(cached.minutes)?cached.minutes:20;session=cached.session||null;course=compatibilityMode||cached.course==='legacy-v1'?'legacy-v1':F.version;lessons=course===F.version?F.lessons:legacy;
    cursor=cached.cursor||{};screen=['today','roadmap','lesson','review','studio','notebook','progress','account'].includes(cursor.screen)?cursor.screen:'today';selectedDay=lessons.some(l=>l.day===cursor.day)?cursor.day:1;step=['intro','vocab','listen','practice','test','summary','transfer','retention'].includes(cursor.step)?cursor.step:'intro';reviewSession=null;reviewMode=['due','wrong','favorites'].includes(cursor.reviewMode)?cursor.reviewMode:'due';studioScene=CourseScenarios.scenes.some(s=>s.id===cursor.scene)?cursor.scene:null;studioTurn=typeof cursor.turn==='string'?cursor.turn:null;
    show(screen,false);saveMessage(user?'Đang tải tiến độ tài khoản…':'Khách · tiến độ và câu nhập dở được giữ trên thiết bị này.');if(!user)return;
    try{const result=await api('study');if(token!==generation)return;events=E.merge(result.events,events);persist();if(!['lesson','studio'].includes(screen))render();await sync();}
    catch{if(token===generation)saveMessage('Chưa tải được tài khoản. Bản chờ của tài khoản này vẫn lưu trên thiết bị.',true);}
  }
  function title(text,subtitle){root.append(el('span',course===F.version?'ENGLISH LAB / FOUNDATION V2':'ENGLISH LAB / KHÓA CŨ 30 BÀI','eyebrow'),el('h1',text),p(subtitle));}
  function stats(items){const grid=el('div',undefined,'stats-grid');for(const [label,value]of items){const box=el('div',undefined,'stat-card');box.append(el('span',label),el('strong',value));grid.append(box);}return grid;}
  function stopMedia(){AudioLab.stop(true);LocalRecorder.dispose();}
  function show(value,save=true){
    stopMedia();document.body.dataset.screen=value;if(value==='alphabet'){screen=value;root.hidden=true;document.getElementById('lessonView').hidden=false;document.getElementById('dashboardView').hidden=true;document.getElementById('adminView').hidden=true;return;}
    if(screen!=='review'&&value==='review')reviewSession=null;screen=value;root.hidden=false;['lessonView','dashboardView','adminView'].forEach(id=>document.getElementById(id).hidden=true);
    document.querySelectorAll('[data-screen]').forEach(b=>{const active=b.dataset.screen===(value==='lesson'?'roadmap':value);b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');});
    document.getElementById('adminTab').setAttribute('aria-pressed','false');document.getElementById('lessonTab').setAttribute('aria-pressed',value==='today');document.getElementById('dashboardTab').setAttribute('aria-pressed',value==='progress');
    if(save){cursor={screen,day:selectedDay,step,scene:studioScene,turn:studioTurn,reviewMode};persist();}render();
  }
  function openLesson(day,where='intro'){if(!lessons.some(l=>l.day===day))return;selectedDay=day;step=where;wordLimit=plan().words;log('view',{day,step});show('lesson');}
  function switchCourse(value){if(compatibilityMode&&value===F.version){saveMessage('Khóa mới tạm bảo trì. Dữ liệu của bạn vẫn được giữ, bạn có thể xem lại khóa cũ.');return;}course=value==='legacy-v1'?'legacy-v1':F.version;lessons=course===F.version?F.lessons:legacy;selectedDay=1;step='intro';session=null;reviewSession=null;filter='';topic='all';show('today');}
  function beginSession(){session={id:crypto.randomUUID(),at:Date.now(),minutes};persist();reviewSession=null;}
  const sessionCount=()=>session?new Set(events.filter(e=>['answer','studio'].includes(e.type)&&(e.course||'legacy-v1')===course&&e.at>=session.at).map(e=>`${e.run}:${e.question||e.turn}`)).size:0;
  const due=(s=state())=>Object.entries(s.reviews).filter(([,r])=>r.due<=Date.now());
  function today(){
    const s=state(),rec=E.recommend(s,lessons);let next=lessons.find(l=>l.day===rec.day)||lessons[0];
    const learning=course===F.version?M.evidence(s):{};
    const returnDue=Object.entries(learning).flatMap(([day,v])=>v.milestones.filter(m=>m.ready&&!m.passed).map(m=>({day:+day,...m}))).sort((a,b)=>a.due-b.due)[0];
    const pendingApplication=lessons.find(l=>s.completed.includes(l.day)&&learning[l.day]&&!learning[l.day].applicationPassed);
    if(pendingApplication&&rec.action==='learn'){rec.action='application';rec.day=pendingApplication.day;rec.step='transfer';next=pendingApplication;rec.reason='Bạn đã đạt kiểm tra mẫu. Thử đổi thông tin để biết mình có dùng lại được; điểm cũ vẫn giữ.';}
    if(returnDue){rec.action='return';rec.day=returnDue.day;rec.step='retention';next=lessons.find(l=>l.day===rec.day);rec.reason=`Bài ${rec.day} đã đến lần nhớ lại sau nghỉ. Làm trước khi mở mẫu để biết điều gì còn nhớ.`;}
    if(course===F.version&&['transfer','retention'].includes(s.resume.step)){
      const active=lessons.find(l=>l.day===s.resume.day),delay=s.resume.step==='retention'?learning[active?.day]?.milestones.find(m=>!m.passed&&m.ready)?.delay:0,k=`${course}:method1:${active?.day}:${s.resume.step}:${delay}`,run=runs[k];
      if(active&&run&&delay!==undefined){const form=Number(drafts[`method-form:${k}:${run}`]?.value)||0,qs=s.resume.step==='retention'?active.retention.filter(q=>q.delayDays===delay):active.transfer.filter(q=>active.transferForms[form]?.includes(q.id)),answers=s.checkups[run]?.answers||{};
        if(qs.some(q=>!answers[q.id])&&qs.some(q=>answers[q.id]||drafts[`${run}:${q.id}`])){rec.action='resume';rec.day=active.day;rec.step=s.resume.step;rec.reason='Phần tự thử đang dở. Tiếp tục đúng nhóm dữ kiện và câu đã lưu.';next=active;}
      }
    }
    title(s.attempts?'Mình học tiếp nhé.':'Bắt đầu nhỏ. Xây nền vững.','Tiếng Anh từ bảng chữ cái, hướng dẫn bằng tiếng Việt. Một bài có thể học trong nhiều buổi.');
    const duration=el('div',undefined,'duration-picker');duration.setAttribute('role','group');duration.setAttribute('aria-label','Thời lượng buổi học');
    for(const n of [10,20,30]){const b=button(`${n} phút`,()=>{minutes=n;session=null;persist();render();});b.setAttribute('aria-pressed',minutes===n);duration.append(b);}
    const amount=E.sessionPlan(minutes),hero=card(rec.action==='review'?'Nhớ lại trước, rồi bước tiếp':`Bài ${next.day} · ${next.title}`,el('span',rec.action==='resume'?'TIẾP TỤC ĐÚNG CHỖ':rec.action==='review'?'ÔN NGẮN CÓ LÝ DO':`CHẶNG ${next.stage||'CŨ'} / ${F.stages[(next.stage||1)-1]}`,'badge'),p(rec.reason),p(next.method?.outcome||next.goal),duration,p(`Buổi ${minutes} phút: tối đa ${amount.questions} câu luyện hoặc ${amount.reviews} mục ôn; ${amount.words} thẻ mỗi lượt. Có thể dừng và tiếp tục bài sau.`),button(rec.action==='resume'?'Tiếp tục bài đang dở':rec.action==='review'?'Bắt đầu ôn ngắn':'Bắt đầu bài học',()=>{beginSession();if(rec.action==='review'){reviewMode=Object.values(s.mistakes).some(Boolean)?'wrong':'due';show('review');}else openLesson(rec.day,rec.step);},'primary-button'));
    hero.classList.add('today-hero');root.append(hero);
    if(rec.action==='application'){hero.querySelector('h2').textContent=`Thử dùng lại bài ${next.day} · ${next.title}`;hero.querySelector('.primary-button').textContent='Thử đổi tình huống';}
    if(rec.action==='return'){hero.querySelector('h2').textContent=`Nhớ lại bài ${returnDue.day} sau nghỉ`;const action=hero.querySelector('.primary-button');action.textContent='Bắt đầu nhớ lại';action.onclick=()=>{beginSession();openLesson(returnDue.day,'retention');};}
    if(course===F.version)root.append(card('Dùng tiếng Anh cho một việc cụ thể',p('Bảy chặng có tình huống để nghe, tự nói/viết rồi đối chiếu. Lời đáp nháp ở thiết bị; chỉ trạng thái tự đối chiếu được đồng bộ nếu đăng nhập.'),button('Mở xưởng vận dụng',()=>{studioScene=null;studioTurn=null;show('studio');})));
    const activity=s.daily[E.dateKey(Date.now(),timezone())]||{answers:0,seconds:0};root.append(stats([['Bài đạt kiểm tra',`${s.completed.length}/${lessons.length}`],['Mục đến hạn',due(s).length],['Hôm nay đã thực hành',`${activity.answers} câu`],['Thời gian có hoạt động',`${Math.floor(activity.seconds/60)} phút`]]));
    if(!s.attempts)root.append(card('Bạn sẽ học như thế nào?',p('01 · Nghe và nhận mặt chữ. 02 · Làm theo mẫu rồi tự thử. 03 · Sửa lỗi ngay cạnh câu trả lời. 04 · Quay lại ôn sau vài ngày.'),p('Học ngay không cần tài khoản. Mở bài chưa được tính là đạt.')));
    const guest=readStorage('englishlab.study.guest.v1');if(user&&guest.events.length)root.append(card('Có tiến độ khách cần giữ',p(`${guest.events.length} hoạt động trên thiết bị. Hợp nhất theo mã duy nhất, không cộng trùng khi thử lại.`),button('Hợp nhất vào tài khoản',async e=>{
      e.currentTarget.disabled=true;const token=generation,fresh=guest.events.filter(g=>!events.some(v=>v.id===g.id));events=E.merge(events,fresh);pending=E.merge(pending,fresh);runs={...guest.runs,...runs};drafts=mergeDrafts(guest.drafts,drafts);persist();
      const saved=await sync();if(token!==generation)return;const latest=readStorage('englishlab.study.guest.v1');
      if(saved&&!pending.length&&latest.events.every(g=>events.some(e=>e.id===g.id))&&Object.entries(latest.drafts).every(([k,v])=>drafts[k]&&(drafts[k].updated||0)>=(v.updated||0))){try{localStorage.removeItem('englishlab.study.guest.v1');}catch{}}render();
    },'primary-button'),p('Có thể giữ khách riêng bằng cách tiếp tục học tài khoản mà không bấm hợp nhất.')));
    const recent=Object.entries(s.daily).sort(([a],[b])=>b.localeCompare(a)).slice(0,5);root.append(card('Dấu chân học tập',...(recent.length?recent.map(([day,a])=>p(`${day.split('-').reverse().join('/')} · ${a.answers} câu · ${Math.floor(a.seconds/60)} phút`)):[p('Chưa có câu trả lời. Bài 1 bắt đầu với A–F, không có kiểm tra đầu vào.')])),button('Xem toàn bộ lộ trình',()=>show('roadmap')));
  }
  function lessonStatus(l,s){if(l.method){const v=M.evidence(s)[l.day];if(v.milestones.every(m=>m.passed))return '✓ Đã kiểm tra nhớ lại qua ba buổi';if(v.applicationPassed)return 'Đã vận dụng · tiếp tục ôn sau nghỉ';}return s.completed.includes(l.day)?'✓ Đạt kiểm tra mẫu':s.finished.includes(l.day)?'Hoàn thành lượt · cần luyện lại':s.started.includes(l.day)?'Đang học':s.seen.includes(l.day)?'Đã xem':'Chưa học';}
  function roadmap(){
    title(course===F.version?'42 bài. Đi từ điều cơ bản.':'Khóa cũ · 30 bài','Học theo thứ tự gợi ý. Mỗi bài có thể chia nhiều buổi; mở bài không làm tăng số bài đạt.');const s=state(),groups=course===F.version?F.stages:['Nội dung và lịch sử được giữ lại'];
    groups.forEach((name,index)=>{root.append(el('h2',course===F.version?`Chặng ${index+1} · ${name}`:name));if(course===F.version)root.append(p(`Đích chặng: ${M.projects[index][1]}`));const grid=el('div',undefined,'roadmap-grid');for(const l of lessons.filter(l=>course!==F.version||l.stage===index+1))grid.append(card(`Bài ${l.day} · ${l.title}`,el('span',lessonStatus(l,s),'badge'),p(l.method?.outcome||l.goal),button('Mở bài học',()=>openLesson(l.day),'primary-button')));root.append(grid);});
  }
  function audioTools(spec){const bar=el('div',undefined,'audio-tools'),feedback=el('p','','audio-feedback');feedback.setAttribute('role','status');bar.append(button('▶ Nghe',()=>AudioLab.play(spec,false,feedback)),button('▷ Chậm',()=>AudioLab.play(spec,true,feedback)),button('↻ Nghe lại',()=>AudioLab.play(spec,false,feedback)),button('■ Dừng',()=>AudioLab.stop()),feedback);return bar;}
  function favorite(word){const saved=!!state().favorites[word.id];return button(saved?'♥ Đã lưu từ':'♡ Lưu từ',()=>{log('favorite',{item:word.id,value:!saved});render();});}
  function memory(id,after=render){const bar=el('div',undefined,'memory-tools');for(const [value,label]of [['again','Chưa nhớ'],['hard','Còn khó'],['good','Tự đánh giá: đã nhớ']])bar.append(button(label,()=>{log('rating',{item:id,value});after();}));return bar;}
  const colors={red:'#bb3d3d',blue:'#3677b4',green:'#47835f',black:'#272c28',white:'#eee'};
  function vocabCard(word,recall=false,after=render){
    const c=card(word.term,el('span',word.ipa,'ipa'),audioTools(word.audio||word.term)),content=el('details');content.append(el('summary',recall?'Tự nhớ nghĩa và ví dụ, rồi mở đối chiếu':'Xem nghĩa và câu mẫu'),p(word.meaning),p(`${word.example} — ${word.translation}`));c.append(content,favorite(word));
    if(recall)content.append(p('Tự đánh giá trí nhớ, không cộng vào điểm kiểm tra.'),memory(word.id,after));if(word.term in colors){const chip=el('div',word.meaning,'color-sample');chip.style.borderLeftColor=colors[word.term];c.prepend(chip);}return c;
  }
  function currentRun(day){const k=runKey(day);if(!runs[k]){runs[k]=readStorage(key()).runs[k]||[...events].reverse().find(e=>e.type==='answer'&&e.day===day&&(e.course||'legacy-v1')===course)?.run||crypto.randomUUID();persist();}return runs[k];}
  function alphabetTools(l){const grid=el('div',undefined,'letter-grid');for(const item of F.alphabet.filter(a=>(l.letters||[]).includes(a.letter))){const c=el('section',undefined,'letter-tile');c.append(el('strong',`${item.letter} ${item.lower}`),p(item.ipa),button(`Nghe ${item.letter}`,()=>AudioLab.play(item.audio)));grid.append(c);}return grid;}
  function spellingTool(){
    const c=card('Đánh vần tên của bạn'),label=el('label','Tên không dấu để luyện (A–Z)'),input=el('input');input.maxLength=40;input.autocomplete='off';label.append(input);const result=el('div',undefined,'word-pieces');
    c.append(label,button('Tách thành từng chữ',()=>{result.replaceChildren();const sequence=input.value.toUpperCase().replace(/[^A-Z]/g,'');if(!sequence){result.append(p('Nhập tên bằng chữ A–Z, ví dụ LAN.'));return;}for(const letter of sequence)result.append(button(letter,()=>AudioLab.play({kind:'letter',text:letter})));}),result,p('Bấm từng chữ theo thứ tự, rồi tự đánh vần mà không nhìn.'));return c;
  }
  function missionPanel(l){
    if(!l.mission)return card('Vận dụng',p(l.homework));const oldKey=`mission:${course}:${l.day}`,k=l.method?`${oldKey}:method1`:oldKey,value=drafts[k]||{value:drafts[oldKey]?.value||''},criteria=l.method?.checks||l.checklist,c=card('Đến lượt bạn vận dụng',p(l.method?.task||l.mission)),label=el('label','Câu hoặc ghi chú của bạn'),area=el('textarea');area.rows=4;area.value=value.value||'';area.maxLength=3000;label.append(area);area.oninput=()=>{drafts[k]={...drafts[k],value:area.value,updated:Date.now()};persist();};c.append(label);
    if(l.method){const model=el('details');model.append(el('summary','Đối chiếu sau khi tự thử'),p(l.method.model),p('Thông tin cá nhân của bạn có thể khác mẫu. Kiểm tra đủ ý và các tiêu chí, không cần chép y hệt.'));c.append(model);}
    const checks=el('div',undefined,'self-checks');for(const [i,text]of criteria.entries()){const row=el('label'),input=el('input');input.type='checkbox';input.checked=!!value.checks?.[i];input.onchange=()=>{const old=drafts[k]||{};drafts[k]={...old,checks:{...old.checks,[i]:input.checked},updated:Date.now()};persist();};row.append(input,document.createTextNode(text));checks.append(row);}
    const feedback=p('Tự đối chiếu không có nghĩa giáo viên đã chấm đúng. Phần nói cần người khác nghe khi bạn chưa chắc.');feedback.setAttribute('role','status');c.append(checks,button('Tôi đã tự đối chiếu',()=>{if(!area.value.trim()||criteria.some((_,i)=>!checks.querySelectorAll('input')[i].checked)){feedback.textContent='Viết câu/ghi chú và kiểm tra từng tiêu chí trước khi xác nhận.';return;}log('reflection',{day:l.day,value:'checked',...(l.method?{rubric:'method1'}:{})});feedback.textContent='Đã ghi nhận tự đối chiếu, tách khỏi kiểm tra tự động và đánh giá của giáo viên.';}),feedback);return c;
  }
  function lesson(){
    const l=lessons.find(v=>v.day===selectedDay),s=state();root.append(button('← Lộ trình',()=>show('roadmap'),'text-button lesson-back'));title(`Bài ${l.day} · ${l.title}`,`${l.stage?`Chặng ${l.stage} · ${F.stages[l.stage-1]} · `:''}${lessonStatus(l,s)}`);
    const nav=el('nav',undefined,'step-nav');nav.setAttribute('aria-label','Các phần bài học');for(const [id,text]of [['intro','1. Hiểu bài'],['vocab',l.kind==='alphabet'?'2. Thẻ chữ':'2. Từ trong bài'],['listen','3. Nghe và nói'],['practice','4. Tự luyện'],['test','5. Kiểm tra'],['summary','6. Tổng kết']]){const b=button(text,()=>openLesson(l.day,id));b.setAttribute('aria-pressed',step===id);nav.append(b);}root.append(nav);
    if(l.method){const more=el('nav',undefined,'method-nav');more.setAttribute('aria-label','Vận dụng và nhớ lại');for(const [name,label]of [['transfer','7. Đổi tình huống'],['retention','8. Nhớ lại sau nghỉ']]){const b=button(label,()=>openLesson(l.day,name));b.setAttribute('aria-pressed',step===name);more.append(b);}root.append(more);}
    if(course==='legacy-v1')root.append(p('Khóa cũ được giữ để xem lại nội dung và lịch sử. Chuyển khóa tại Tài khoản.'));
    if(step==='intro'){
      if(l.method){root.append(card('Đích đến của bài',p(l.method.outcome),p(l.method.focus),p(l.day===1?'Không cần biết tiếng Anh trước.':`Cần trước: ${l.prerequisites.map(d=>`bài ${d}`).join(', ')}. Chưa chắc có thể xem lại trước.`)));const rhythm=el('details');rhythm.append(el('summary','Gợi ý chia bài thành nhiều buổi'));for(const [name,description]of l.method.sessions)rhythm.append(el('h3',name),p(description));root.append(rhythm);if(l.day>1){const old=M.packets[l.day-2],warm=el('details');warm.append(el('summary','Tự thử rồi mở đối chiếu'),p(old.pool[0].answers.join(' / ')),p(old.pool[0].explanation));const recall=card('Khởi động không nhìn mẫu',p(old.pool[0].prompt));if(old.pool[0].audio)recall.append(audioTools(old.pool[0].audio));recall.append(warm);root.append(recall);}}
      if(!l.method){root.append(card('Học xong bạn làm được gì?',p(l.goal)));if(l.review)root.append(card('Nhớ lại trước khi xem',p(l.review)));}root.append(card('Hiểu từng ý nhỏ',...l.teaching.map(p)));
      for(const model of l.guided||[]){const list=el('ol');model.steps.forEach(v=>list.append(el('li',v)));root.append(card(`Cùng làm mẫu · ${model.prompt}`,list,el('blockquote',model.answer)));}if(l.method)root.append(card('Một lỗi dễ mắc sau khi tự thử',el('blockquote',l.method.error),p(`Sửa: ${l.method.correction}`),p(l.method.reason)));root.append(button(l.kind==='alphabet'?'Mở thẻ chữ →':'Xem từ trong bài →',()=>openLesson(l.day,'vocab'),'primary-button'));
    }else if(step==='vocab'){
      if(l.kind==='alphabet'){root.append(p('Nghe tên chữ. Dạng hoa–thường có cùng tên. Ký hiệu / / để tham khảo; không cần thuộc IPA.'),alphabetTools(l));if(l.day===6)root.append(spellingTool());}
      else{root.append(p('Nhớ lại trước khi mở thẻ; nghĩa và câu mẫu ở phần đối chiếu.'),...l.vocab.slice(0,wordLimit).map(v=>vocabCard(v,true)));if(l.vocab.length>wordLimit)root.append(button('Thêm một nhóm từ',()=>{wordLimit+=plan().words;render();}));}root.append(button('Sang nghe và nói →',()=>openLesson(l.day,'listen'),'primary-button'));
    }else if(step==='listen'){
      root.append(card('Nghe, dừng, nói theo',p(l.speaking),p('Giọng đọc phụ thuộc thiết bị. Tên chữ có nhãn “The letter …”; IPA chỉ để tham khảo, không phát trực tiếp ký hiệu âm.')));if(l.kind==='alphabet')root.append(alphabetTools(l));else renderDialogue(l);root.append(LocalRecorder.panel(),missionPanel(l),button('Bắt đầu tự luyện →',()=>openLesson(l.day,'practice'),'primary-button'));
    }else if(step==='transfer'||step==='retention'){
      checkup(l);
    }else if(step==='practice'||step==='test'){
      const run=currentRun(l.day),answers=s.runs[run]?.answers||{};if(step==='test'&&!l.practice.every(q=>answers[q.id]))root.append(card('Chưa mở kiểm tra trong lượt này',p(`Trả lời đủ ${l.practice.length} câu luyện trước; không cần đúng hết để mở kiểm tra.`),button('Về phần tự luyện',()=>openLesson(l.day,'practice'),'primary-button')));else exerciseList(l[step],run,l);
    }else{
      const need=Math.ceil(l.practice.length*.75),testNeed=Math.ceil(l.test.length*2/3);root.append(card('Bạn vừa luyện được gì?',p(l.summary),p(`Kế hoạch ôn: ${l.homework}`),p(s.completed.includes(l.day)?`✓ Đã đạt tiêu chí của bài: ít nhất ${need}/${l.practice.length} câu luyện và ${testNeed}/${l.test.length} câu kiểm tra đúng độc lập cùng lượt. Đây là kiểm tra mẫu; còn phần đổi tình huống và nhớ lại sau nghỉ.`:`${s.finished.includes(l.day)?'Đã hoàn thành lượt, cần luyện lại.':'Chưa làm đủ lượt.'} Để đạt: làm đủ câu, đúng độc lập ít nhất ${need}/${l.practice.length} câu luyện và ${testNeed}/${l.test.length} câu kiểm tra cùng lượt.`),button('Ôn câu sai',()=>{reviewMode='wrong';reviewSession=null;show('review');}),button('Làm lại lượt mới',()=>{runs[runKey(l.day)]=crypto.randomUUID();beginSession();persist();openLesson(l.day,'practice');})));if(l.method)root.append(learningPanel(l),button('Thử dùng lại trong tình huống khác',()=>{beginSession();openLesson(l.day,'transfer');},'primary-button'));root.append(missionPanel(l),button(l.day<lessons.length?`Xem bài ${l.day+1} →`:'Xem tiến độ và kế hoạch ôn',()=>l.day<lessons.length?openLesson(l.day+1):show('progress'),'primary-button'));
    }
  }
  function learningPanel(l){
    const v=M.evidence(state())[l.day],c=card('Bằng chứng học được · từng bước');
    c.append(p(`${v.applicationPassed?'✓ Đã đạt lượt đổi tình huống':'Chưa đạt lượt đổi tình huống'} · ${v.covered}/${v.total} câu mới từng làm đúng không mở hỗ trợ. Để đạt lượt, cần làm đúng độc lập một nhóm trong cùng lượt; có thể chia nhiều buổi.`),p('Sau khi xem lời giải, thử nhóm có dữ kiện khác. Cùng câu vừa sai hoặc mở hỗ trợ cần cách ít nhất 24 giờ mới tính độc lập. Đây là bằng chứng của mẫu đã thử, chưa phải khả năng dùng mọi tình huống.'));
    for(const m of v.milestones)c.append(p(m.passed?`✓ Đã nhớ lại ở buổi khác, sau ${m.elapsedDays} ngày kể từ vận dụng.`:m.due?`Mốc +${m.delay} ngày: ${m.ready?'đã đến hạn':'sớm nhất '+new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:timezone()}).format(m.due)}.`:`Mốc +${m.delay} ngày: hoàn thành mốc trước để mở.`));
    c.append(p('Mỗi mốc kiểm tra hai câu, chỉ cho biết kết quả mẫu đó. Các mốc phải cách nhau ít nhất 24 giờ; làm ba nhóm cùng buổi không tạo ba bằng chứng nhớ lâu.'),button('Xem lịch nhớ lại',()=>openLesson(l.day,'retention')));
    if(l.day%6===0){const project=M.projects[l.stage-1];c.append(el('h3',`Sơ kết chặng · ${project[0]}`),p(project[1]),...project[2].map(p),p('Đây là nhiệm vụ nói/viết để tự đối chiếu hoặc nhờ giáo viên. Ứng dụng không tự xác nhận năng lực thực tế.'),button('Thực hành tình huống chặng này',()=>openStudio(l.scenarios[0].id)));}
    return c;
  }
  function checkup(l){
    if(!l.method){root.append(p('Phần này chỉ có ở khóa Foundation.'));return;}
    const s=state(),e=M.evidence(s)[l.day];
    if(!s.completed.includes(l.day)){root.append(card('Làm phần kiểm tra mẫu trước',p('Điểm cũ của bạn được giữ. Phần này kiểm tra thêm việc dùng lại kiến thức, không thay điểm đã có.'),button('Về tự luyện',()=>openLesson(l.day,'practice'))));return;}
    const milestone=e.milestones.find(m=>!m.passed),delay=step==='retention'?milestone?.delay:0;
    if(step==='retention'&&(!milestone||!milestone.ready)){root.append(learningPanel(l),card(milestone?'Chưa đến buổi nhớ lại tiếp theo':'Đã đi qua ba buổi nhớ lại',p(milestone?'Bạn có thể học bài tiếp theo hoặc luyện vận dụng ngay. Lượt làm sớm không tính như nhớ lại sau nghỉ.':'Tiếp tục ôn theo mục đến hạn. Các kết quả trên không thay kiểm tra nói/viết trực tiếp.'),button('Luyện vận dụng ngay',()=>{beginSession();openLesson(l.day,'transfer');})));return;}
    const k=`${course}:method1:${l.day}:${step}:${delay}`;
    if(!runs[k]){runs[k]=crypto.randomUUID();persist();}
    const formKey=`method-form:${k}:${runs[k]}`,form=Math.max(0,Math.min(l.transferForms.length-1,Number(drafts[formKey]?.value)||0));
    const questions=step==='retention'?l.retention.filter(q=>q.delayDays===delay):l.transfer.filter(q=>l.transferForms[form].includes(q.id));
    const run=runs[k],answers=s.checkups[run]?.answers||{},first=questions.find(q=>!answers[q.id]);
    root.append(card(step==='retention'?'Tự nhớ trước khi mở hỗ trợ':'Đổi dữ kiện, giữ điều đã học',p(step==='retention'?'Không mở lại bài giảng trước khi tự thử. Nếu cần gợi ý, cứ mở; kết quả sẽ ghi riêng và bạn có thể quay lại lượt khác.':'Phần này yêu cầu tự nhập, không đoán vị trí đáp án. Với chữ cái, mỗi chữ có cả nhìn–viết và nghe–viết.'),p(`${questions.filter(q=>answers[q.id]).length}/${questions.length} câu trong lượt này.`)));
    if(first){
      if(session&&sessionCount()>=plan().questions){root.append(card('Một buổi nhỏ đã đủ',p('Lượt này được giữ. Bạn có thể dừng, hoặc tiếp tục một phần vừa sức.'),button('Tiếp tục một buổi nữa',()=>{beginSession();render();},'primary-button'),button('Về Hôm nay',()=>show('today'))));return;}
      renderQuestion(first,run);return;
    }
    const passed=questions.every(q=>answers[q.id]?.correct&&!answers[q.id].assisted);
    root.append(card(passed?'Đã làm đúng không mở hỗ trợ nhóm này':'Cần tự thử lại sau khi sửa',...questions.map(q=>p(`${answers[q.id].correct?'✓':'✕'} ${q.prompt} · ${answers[q.id].answer}${answers[q.id].assisted?' (có hỗ trợ)':''} · ${q.explanation}`)),button('Lượt mới cho nhóm này',()=>{runs[k]=crypto.randomUUID();drafts[`method-form:${k}:${runs[k]}`]={value:String((form+1)%l.transferForms.length),updated:Date.now()};beginSession();persist();render();}),button('Về tổng kết bài',()=>openLesson(l.day,'summary'))),learningPanel(l));
  }
  function renderDialogue(l){
    if(l.method&&l.kind!=='dialogue'){
      root.append(p('Nghe từng mẫu riêng, dừng và nói theo. Ở lượt sau, thay một thông tin theo nhiệm vụ vận dụng.'));
      for(const [english,vietnamese]of l.dialogue){const c=card(english,audioTools(english)),translation=el('details');translation.append(el('summary','Đối chiếu nghĩa'),p(vietnamese));c.append(translation);root.append(c);}return;
    }
    const toolbar=el('div',undefined,'dialogue-tools');toolbar.append(button(translated?'Ẩn bản dịch':'Hiện bản dịch',()=>{translated=!translated;render();}));for(const [id,label]of [['both','Nghe hai vai'],['A','Tôi luyện vai A'],['B','Tôi luyện vai B']]){const b=button(label,()=>{role=id;render();});b.setAttribute('aria-pressed',role===id);toolbar.append(b);}root.append(toolbar);
    l.dialogue.forEach(([english,vietnamese],i)=>{const turn=i%2===0?'A':'B',mine=role===turn,c=card(`Vai ${turn}`,p(mine?'Đến lượt bạn: nói trước rồi mở mẫu.':english));c.classList.add('dialogue-turn');if(mine){const details=el('details');details.append(el('summary','Xem câu mẫu'),p(english),audioTools(english));c.append(details);}else c.append(audioTools(english));if(translated)c.append(p(vietnamese));root.append(c);});
  }
  function shuffled(values){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
  function exerciseList(questions,run,l){
    const answers=state().runs[run]?.answers||{},first=questions.find(q=>!answers[q.id]),count=questions.filter(q=>answers[q.id]).length;root.append(p(`${step==='test'?'Kiểm tra cuối bài':'Tự luyện giảm gợi ý'} · ${count}/${questions.length} câu đã trả lời. Đúng có hỗ trợ được ghi riêng.`));
    if(first){if(session&&sessionCount()>=plan().questions){root.append(card('Một buổi nhỏ đã đủ',p(`Bạn đã làm ${sessionCount()} câu trong phần gợi ý ${session.minutes} phút. Tiến độ đã giữ, bài chưa bị đánh dấu hoàn thành.`),button('Tiếp tục một buổi nữa',()=>{beginSession();render();},'primary-button'),button('Về Hôm nay',()=>show('today'))));return;}renderQuestion(first,run);}
    else{const independent=questions.filter(q=>answers[q.id]?.correct&&!answers[q.id]?.assisted).length;root.append(card(`Đúng độc lập ${independent}/${questions.length}`,...questions.map(q=>p(`${answers[q.id].correct?'✓ Đúng':'✕ Cần sửa'}${answers[q.id].assisted?' · có hỗ trợ':''} · ${q.prompt} · Bạn trả lời: ${answers[q.id].answer} · Mẫu đúng: ${q.answers.join(' / ')}. ${q.explanation}`)),button(step==='test'?'Xem tổng kết →':'Làm kiểm tra →',()=>openLesson(l.day,step==='test'?'summary':'test'),'primary-button')));}
  }
  function supportText(q){const l=lessons.find(l=>l.day===selectedDay);return q.refs?q.refs.map(ref=>{const m=/^(\d+):(.*)$/.exec(ref);return (m?lessons.find(v=>v.day===+m[1]):l)?.concepts?.find(c=>c.id===(m?m[2]:ref))?.text;}).filter(Boolean).join('\n'):q.explanation;}
  function renderQuestion(q,run,review=false){
    const k=`${run}:${q.id}`,saved=drafts[k]||{},c=card(q.prompt);c.dataset.question=q.id;let locked=false,assisted=!!saved.assisted;
    const result=el('div','','question-feedback');result.setAttribute('role','status');const note=p(assisted?'Lượt này có hỗ trợ, không tính là đúng độc lập.':'Thử tự nhớ trước. Mở gợi ý/văn bản sẽ ghi là có hỗ trợ.');note.className='support-note';
    const saveDraft=value=>{drafts[k]={value,assisted,updated:Date.now()};persist();};const markSupport=()=>{assisted=true;saveDraft(c.querySelector('input')?.value||saved.value||'');note.textContent='Lượt này có hỗ trợ, không tính là đúng độc lập.';};c.append(note);if(q.passage)c.append(el('blockquote',q.passage));
    if(q.audio){c.append(audioTools(q.audio));const details=el('details');details.append(el('summary','Mở văn bản hỗ trợ'),p(typeof q.audio==='string'?q.audio:q.audio.kind==='letter'?`Tên chữ ${q.audio.text}`:q.audio.text));details.ontoggle=()=>{if(details.open&&!locked)markSupport();};c.append(details);}
    const help=el('details');help.append(el('summary',step==='test'?'Cần hỗ trợ? Xem lại điều đã học':'Gợi ý: xem lại cách làm'),p(supportText(q)||q.explanation));help.ontoggle=()=>{if(help.open&&!locked)markSupport();};c.append(help);if(q.caseSensitive)c.append(p('Câu này phân biệt chữ hoa/chữ thường. Nhập đúng dạng được yêu cầu.'));
    const submit=answer=>{
      if(locked)return;locked=true;let record;try{record=log('answer',{question:q.id,run,answer,assisted,context:review?'review':'lesson'});}catch{locked=false;result.textContent='Chưa ghi được câu trả lời. Thử lại.';return;}
      saveDraft(answer);c.querySelectorAll('.study-options button,form input,form button').forEach(n=>n.disabled=true);c.querySelectorAll('.study-options button').forEach(b=>{if(b.textContent===answer)b.classList.add(record.correct?'choice-right':'choice-wrong');});result.textContent=`${record.correct?'✓ Đúng.':'✕ Chưa đúng.'}${assisted?' Có hỗ trợ.':''} Bạn trả lời: ${answer}. Mẫu đúng: ${q.answers.join(' / ')}. ${q.explanation}`;result.classList.add(record.correct?'answer-correct':'answer-wrong');
      const coaching=ReviewCoach.feedback({...q,day:lessons.find(l=>[...l.practice,...l.test,...(l.transfer||[]),...(l.retention||[])].some(v=>v.id===q.id))?.day},answer,lessons);if(coaching)c.append(card(coaching.title,p(coaching.explanation)));
      const next=()=>{if(review){reviewSession.index++;saveReview();}render();};if(review)c.append(p('Lịch ôn đã được cập nhật từ câu trả lời. Lượt ôn không thay điểm kiểm tra cuối bài.'),button('Câu ôn tiếp theo',next,'primary-button'));else c.append(button('Câu tiếp theo →',render,'primary-button'));
    };
    if(q.type==='choice'){const options=el('div',undefined,'study-options');for(const option of shuffled(q.options))options.append(button(option,()=>submit(option)));c.append(options);}
    else{const form=el('form'),label=el('label','Câu trả lời của bạn'),input=el('input');input.name='answer';input.autocomplete='off';input.required=true;input.maxLength=500;input.value=saved.value||'';input.oninput=()=>saveDraft(input.value);label.append(input);form.append(label);
      if(q.type==='order'){const pieces=el('div',undefined,'word-pieces'),selected=[];for(const word of shuffled(q.words)){const b=button(word,()=>{input.value=`${input.value} ${word}`.trim();selected.push(b);b.disabled=true;saveDraft(input.value);});pieces.append(b);}pieces.append(button('Xóa và xếp lại',()=>{input.value='';selected.forEach(b=>b.disabled=false);selected.length=0;saveDraft('');}));form.append(p('Bấm từ theo thứ tự hoặc nhập bằng bàn phím. Sau F5 có thể tiếp tục nhập hoặc xếp lại.'),pieces);}
      const send=el('button','Kiểm tra','primary-button');send.type='submit';form.append(send);form.onsubmit=e=>{e.preventDefault();if(input.value.trim())submit(input.value);};c.append(form);}
    c.append(result);root.append(c);
  }
  function saveReview(){if(!reviewSession)return;drafts[`review-session:${course}:${reviewMode}`]={value:JSON.stringify({items:reviewSession.items.map(t=>[t.source,t.item]),index:reviewSession.index,run:reviewSession.run}),updated:Date.now()};persist();}
  function review(){
    title('Nhớ lại, từng chút một.','Ôn dựa trên lịch đến hạn và câu sai. Mỗi buổi có giới hạn; tự đánh giá tách khỏi điểm kiểm tra.');const tabs=el('div',undefined,'review-tabs');for(const [id,label]of [['due','Đến hạn ôn'],['wrong','Ôn câu sai'],['favorites','Từ đã lưu']]){const b=button(label,()=>{reviewMode=id;reviewSession=null;show('review');});b.setAttribute('aria-pressed',reviewMode===id);tabs.append(b);}root.append(tabs);
    const lookup=E.index(lessons),s=state();
    if(!reviewSession){try{const saved=JSON.parse(drafts[`review-session:${course}:${reviewMode}`]?.value||'null');if(saved&&/^[a-f\d-]{36}$/i.test(saved.run)&&Array.isArray(saved.items)&&saved.items.length<=plan().reviews&&saved.items.every(pair=>Array.isArray(pair)&&pair.length===2&&(lookup.questions[pair[0]]||lookup.words[pair[0]])&&(lookup.questions[pair[1]]||lookup.words[pair[1]]))&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<=saved.items.length)reviewSession={items:saved.items.map(([source,item])=>({source,item,changed:source!==item,reason:`Bài ${(lookup.questions[source]||lookup.words[source]).day}: tiếp tục nhóm ôn đã lưu.${source!==item?' Đây là cách dùng khác; lỗi ở câu gốc được giữ riêng.':''}`})),index:saved.index,run:saved.run};}catch{}}
    if(!reviewSession){reviewSession={items:ReviewCoach.plan(events,lessons,reviewMode,plan().reviews),index:0,run:crypto.randomUUID()};saveReview();}
    const task=reviewSession.items[reviewSession.index],item=task?.item;root.append(p(`Buổi ${plan().minutes} phút · ${reviewSession.index}/${reviewSession.items.length} mục đã ôn · tối đa ${plan().reviews} mục. Nhớ tốt: 1 → 3 → 7 → 14 ngày; chưa nhớ về 1 ngày.`));
    if(!item){root.append(card(reviewSession.items.length?'Đã kết thúc buổi ôn':'Chưa có mục cần ôn ở đây',p(reviewSession.items.length?'Đã đi hết hàng ôn. Kết quả ở biến thể không tự xóa lỗi câu gốc. Quay lại theo lịch hoặc chọn từ trong Sổ tay.':'Câu sai và nội dung đến hạn xuất hiện sau thực hành. Bạn có thể tự chọn từ trong Sổ tay.'),button('Tạo buổi ôn mới',()=>{drafts[`review-session:${course}:${reviewMode}`]={value:'',updated:Date.now()};beginSession();render();}),button('Về Hôm nay',()=>show('today'))));return;}
    root.append(p(`Lý do: ${task.reason}`));const next=()=>{reviewSession.index++;saveReview();render();};if(lookup.words[item])root.append(vocabCard(lookup.words[item],true,next),button('Bỏ qua mục này',next));else{selectedDay=lookup.questions[item].day;const recorded=events.find(e=>e.type==='answer'&&e.run===reviewSession.run&&e.question===item);if(recorded)root.append(card('Câu này đã được lưu',p(`Bạn trả lời: ${recorded.answer}. ${E.grade(lookup.questions[item],recorded.answer)?'Đúng theo đáp án.':'Cần sửa.'} ${lookup.questions[item].explanation}`),button('Câu ôn tiếp theo',next,'primary-button')));else renderQuestion(lookup.questions[item],reviewSession.run,true);}
  }
  function openStudio(id,turn=null){studioScene=id;studioTurn=turn;const scene=CourseScenarios.scenes.find(s=>s.id===id);if(scene)selectedDay=scene.day;beginSession();show('studio');}
  function studioHistory(scene,s){
    const history=el('details'),entries=Object.entries(s.studioRuns).filter(([,r])=>r.scene===scene.id).map(([run,r])=>({run,...r,at:Math.max(...Object.values(r.turns).map(t=>t.at))})).sort((a,b)=>b.at-a.at);
    history.append(el('summary',`Nhật ký tình huống · ${entries.length} lượt đã ghi`));
    if(!entries.length)history.append(p('Khi bạn tự đối chiếu một bước, lượt thực hành sẽ xuất hiện ở đây.'));
    for(const entry of entries.slice(0,10)){const detail=el('details'),date=new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:timezone()}).format(entry.at);detail.append(el('summary',`${date} · ${Object.keys(entry.turns).length}/4 bước đã đối chiếu`));for(const [i,t]of scene.turns.entries()){const recorded=entry.turns[t.id];if(!recorded)continue;detail.append(p(`Bước ${i+1}: ${recorded.value==='retry'?'còn cần luyện':'đã tự đối chiếu'}${recorded.assisted?' · mở văn bản hỗ trợ':''}.`));const note=drafts[`studio:${entry.run}:${t.id}`]?.value;if(note)detail.append(el('blockquote',note));}history.append(detail);}
    if(entries.length>10)history.append(p('Đang hiển thị 10 lượt gần nhất. Xuất bản sao JSON để giữ toàn bộ lịch sử.'));return history;
  }
  function studio(){
    title('Xưởng vận dụng','Nghe, tự nói hoặc viết rồi đối chiếu. Một tình huống có thể học qua nhiều buổi.');
    if(course!==F.version){root.append(card('Tình huống thuộc Foundation 42 bài',p('Khóa cũ và lịch sử vẫn giữ. Chọn Foundation tại Tài khoản để dùng xưởng vận dụng.'),button('Mở Tài khoản',()=>show('account'))));return;}
    const scene=CourseScenarios.scenes.find(s=>s.id===studioScene),s=state();
    if(!scene){
      for(let stage=1;stage<=7;stage++){
        const box=card(`Chặng ${stage} · ${F.stages[stage-1]}`,p(`Nên học tới bài ${stage*6} trước. ${M.projects[stage-1][1]}`));
        for(const choice of CourseScenarios.scenes.filter(v=>v.stage===stage)){const k=`${course}:studio:${choice.id}`,run=s.studioRuns[runs[k]],count=Object.keys(run?.turns||{}).length,action=button(count&&count<4?'Tiếp tục tình huống':'Mở tình huống',()=>openStudio(choice.id),'primary-button');action.setAttribute('aria-label',`${count&&count<4?'Tiếp tục':'Mở'}: ${choice.title}`);box.append(el('h3',choice.title),p(choice.brief),p(count?`${count}/4 bước đã tự đối chiếu ở lượt hiện tại; chưa phải được chấm đúng.`:'Chưa tự đối chiếu tình huống này.'),action);}root.append(box);
      }return;
    }
    const privacy=el('details');privacy.append(el('summary','Lưu bài và quyền riêng tư'),p('Có thể dùng thông tin tưởng tượng. Lời đáp/ghi chú chỉ ở thiết bị và trong bản sao bạn xuất. Nhật ký tự đối chiếu được đồng bộ khi đăng nhập. Phần nói/viết mở không được chấm tự động.'));
    root.append(button('← Các tình huống',()=>{studioScene=null;studioTurn=null;show('studio');},'text-button'),card(scene.title,p(scene.brief),privacy));
    const k=`${course}:studio:${scene.id}`;if(!runs[k]){runs[k]=crypto.randomUUID();persist();}const run=runs[k],done=s.studioRuns[run]?.turns||{},next=scene.turns.find(t=>!done[t.id]),active=scene.turns.find(t=>t.id===studioTurn)||next;
    const nav=el('nav',undefined,'studio-steps');nav.setAttribute('aria-label','Các bước tình huống');scene.turns.forEach((t,i)=>{const b=button(`${i+1}. ${done[t.id]?'Đã đối chiếu':'Tự thử'}`,()=>{studioTurn=t.id;show('studio');});b.setAttribute('aria-pressed',active?.id===t.id);nav.append(b);});root.append(nav,p(`${Object.keys(done).length}/4 bước đã tự đối chiếu · giới hạn buổi ${plan().minutes} phút: ${plan().questions} bước/câu thực hành.`));
    if(!active){root.append(card('Bạn vừa tự đối chiếu một tình huống',...scene.turns.map((t,i)=>p(`Bước ${i+1}: ${done[t.id]?.value==='retry'?'còn cần luyện':'đã tự đối chiếu'}${done[t.id]?.assisted?' · có mở văn bản nghe hỗ trợ':''}.`)),p('Không tự chuyển thành bài đạt hoặc phát âm chuẩn. Chọn một bước còn khó để làm lại, hoặc đổi tình huống để dùng thông tin khác.'),button('Đổi dữ kiện, thử tình huống còn lại',()=>openStudio(CourseScenarios.scenes.find(v=>v.stage===scene.stage&&v.id!==scene.id).id),'primary-button'),button('Tạo lượt mới, giữ lịch sử',()=>{runs[k]=crypto.randomUUID();studioTurn=null;beginSession();show('studio');}),button('Xem bài cuối chặng',()=>openLesson(scene.day,'summary'))),studioHistory(scene,s));return;}
    if(!done[active.id]&&session&&sessionCount()>=plan().questions){root.append(card('Một buổi nhỏ đã đủ',p('Bước và lời đáp đã được giữ. Có thể dừng hoặc mở một buổi tiếp theo.'),button('Tiếp tục một buổi nữa',()=>{beginSession();render();},'primary-button'),button('Về Hôm nay',()=>show('today'))));return;}
    const dk=`studio:${run}:${active.id}`,saved=drafts[dk]||{value:''},c=card(`Bước ${scene.turns.indexOf(active)+1} · ${active.prompt}`),notice=p('Thử trước khi mở mẫu. Bạn có thể tự nói, viết ra giấy rồi ghi ngắn điều mình đã làm.');c.dataset.studioTurn=active.id;notice.setAttribute('role','status');
    const save=patch=>{drafts[dk]={...drafts[dk],value:area.value,...patch,updated:Date.now()};persist();};
    if(active.audio){c.append(audioTools(active.audio));const transcript=el('details');transcript.append(el('summary','Mở lời vừa nghe (hỗ trợ)'),p(active.transcript));transcript.ontoggle=()=>{if(transcript.open){save({usedSupport:true});notice.textContent='Đã mở lời nghe hỗ trợ; trạng thái này được giữ riêng.';}};c.append(transcript);}
    const label=el('label','Lời đáp hoặc ghi chú sau khi tự nói'),area=el('textarea');area.rows=4;area.maxLength=3000;area.value=saved.value;label.append(area);area.oninput=()=>save({});c.append(label,notice);
    const model=card('Đối chiếu sau khi đã thử',el('blockquote',active.model),p(active.why)),checks=el('div',undefined,'self-checks');
    model.classList.add('studio-model');
    model.hidden=!saved.shown;
    for(const [i,text]of active.checks.entries()){const row=el('label'),input=el('input');input.type='checkbox';input.checked=!!saved.checks?.[i];input.onchange=()=>save({checks:{...drafts[dk]?.checks,[i]:input.checked}});row.append(input,document.createTextNode(text));checks.append(row);}model.append(checks);
    c.append(button('Mở mẫu để tự đối chiếu',()=>{if(!area.value.trim()){notice.textContent='Hãy tự thử và ghi câu hoặc điều chưa làm được trước khi mở mẫu.';return;}save({shown:true});model.hidden=false;notice.textContent='Đây là một mẫu; câu hợp lệ khác vẫn có thể đúng. Đối chiếu ý nghĩa và từng tiêu chí.';}),model);
    for(const [value,label]of [['checked','Đã tự đối chiếu bước này'],['retry','Còn cần luyện bước này']])c.append(button(label,()=>{if(!area.value.trim()||!drafts[dk]?.shown||(value==='checked'&&active.checks.some((_,i)=>!checks.querySelectorAll('input')[i].checked))){notice.textContent='Cần ghi lời đáp/điều còn khó, mở mẫu rồi đối chiếu từng tiêu chí. Nếu còn khó, chọn Còn cần luyện.';return;}log('studio',{scene:scene.id,turn:active.id,run,value,assisted:!!drafts[dk]?.usedSupport});studioTurn=active.id;show('studio');}));
    if(done[active.id])c.append(p(`Đã lưu: ${done[active.id].value==='retry'?'còn cần luyện':'đã tự đối chiếu'}. Ứng dụng không chấm câu mở đúng/sai.`),button(next?'Bước tiếp theo →':'Xem tổng kết tình huống',()=>{studioTurn=next?.id||null;show('studio');},'primary-button'));
    root.append(c,p('Có nhiều cách trả lời đúng. Khi chưa chắc, ghi lại điều cần hỏi người hướng dẫn.'),LocalRecorder.panel(),studioHistory(scene,s));
  }
  function notebook(){
    title('Sổ tay để dùng lại.','Tìm từ hoặc nghĩa, nghe lại và nhớ trong câu. Bấm Lưu từ trong bài để giữ mục cần học.');const form=el('form',undefined,'notebook-search'),label=el('label','Tìm từ hoặc nghĩa'),input=el('input');input.type='search';input.value=filter;label.append(input);
    const selectLabel=el('label','Lọc bài'),select=el('select');for(const [value,text]of [['all','Tất cả bài'],['favorites','Từ đã lưu'],...lessons.filter(l=>l.vocab.length).map(l=>[String(l.day),`Bài ${l.day} · ${l.title}`])]){const option=el('option',text);option.value=value;select.append(option);}select.value=topic;selectLabel.append(select);const search=el('button','Tìm','primary-button');search.type='submit';form.append(label,selectLabel,search);form.onsubmit=e=>{e.preventDefault();filter=input.value.trim();topic=select.value;notebookLimit=20;render();};root.append(form);
    const s=state(),items=lessons.flatMap(l=>l.vocab.map(v=>({...v,day:l.day}))).filter(v=>(topic==='all'||topic==='favorites'&&s.favorites[v.id]||String(v.day)===topic)&&E.normalize(`${v.term} ${v.meaning}`).includes(E.normalize(filter)));root.append(p(`${items.length} mục. Một từ có thể xuất hiện ở nhiều bài để ôn trong ngữ cảnh.`));if(!items.length)root.append(card('Chưa có từ phù hợp',p(topic==='favorites'?'Bấm Lưu từ trong bài rồi quay lại đây.':'Thử từ tiếng Anh hoặc một phần nghĩa tiếng Việt.')));
    for(const word of items.slice(0,notebookLimit)){const c=vocabCard(word,true);c.prepend(el('span',`Bài ${word.day}`,'eyebrow'));root.append(c);}if(items.length>notebookLimit)root.append(button('Xem thêm 20 mục',()=>{notebookLimit+=20;render();}));
    if(typeof favorites!=='undefined'&&favorites.size&&['all','favorites'].includes(topic)){const old=[...favorites].map(i=>letters[i]).filter(v=>E.normalize(`${v.word} ${v.meaning}`).includes(E.normalize(filter)));if(old.length)root.append(card('Từ đã lưu từ công cụ bảng chữ cũ',...old.map(v=>{const row=el('div');row.append(p(`${v.word} — ${v.meaning}`),audioTools(v.word));return row;})));}
  }
  function progressPage(){
    const s=state();title('Bạn đã làm được gì?','Phản ánh câu đã làm, không phải chứng nhận trình độ. Mở gợi ý/văn bản được ghi riêng.');root.append(stats([['Bài đạt kiểm tra',`${s.completed.length}/${lessons.length}`],['Hoàn thành lượt',s.finished.length],['Câu đúng / đã trả lời',`${s.correct}/${s.attempts}`],['Lượt có hỗ trợ',s.assisted]]));
    if(course===F.version){const values=Object.values(M.evidence(s));root.append(card('Đã làm được khi đổi bài?',p(`${values.filter(v=>v.applicationPassed).length}/42 bài đã đạt lượt đổi tình huống; ${values.filter(v=>v.milestones.some(m=>m.passed)).length}/42 bài có ít nhất một lần nhớ lại sau nghỉ; ${values.filter(v=>v.milestones.every(m=>m.passed)).length}/42 bài có ba buổi kiểm tra cách nhau.`),p(`${values.filter(v=>v.independentWritingChecked).length} nhiệm vụ đã tự đối chiếu theo tiêu chí của bài. Đây không phải số bài được giáo viên chấm.`),p('Điểm kiểm tra mẫu trước nâng cấp vẫn giữ. Không tự chuyển điểm đó thành bằng chứng vận dụng hoặc nhớ lâu.')));}
    if(course===F.version){const tried=new Set(Object.values(s.studioRuns).map(r=>r.scene));root.append(card('Tình huống đã tự thực hành',p(`${tried.size}/14 tình huống có bước đã đối chiếu, trên ${Object.keys(s.studioRuns).length} lượt. Mỗi chặng có hai bộ dữ kiện. Chỉ là nhật ký tự học, không phải điểm câu mở hoặc phát âm.`),button('Mở xưởng vận dụng',()=>{studioScene=null;studioTurn=null;show('studio');})));}
    const names={letters:'Tên chữ',sounds:'Âm trong từ',vocabulary:'Từ vựng',grammar:'Ngữ pháp',listening:'Nghe',reading:'Đọc',writing:'Viết/xếp câu',numbers:'Số',conversation:'Chọn lời đáp'},skills=Object.entries(s.skills),box=card('Theo kỹ năng · chỉ tính lượt độc lập');for(const [id,v]of skills)box.append(p(`${names[id]||id}: ${v.correct}/${v.total} lượt đúng độc lập${v.total?` (${Math.round(v.correct/v.total*100)}%)`:''}, trên ${v.uniqueQuestions.length} câu khác nhau; ${v.assisted} lượt có hỗ trợ. ${v.uniqueQuestions.length>=10?'Chỉ phản ánh nhóm câu đã luyện, chưa đo năng lực tổng quát.':'Chưa đủ 10 câu khác nhau; chưa kết luận mạnh/yếu.'}`));if(!skills.length)box.append(p('Chưa có câu trả lời. Bắt đầu bài 1 để có dữ liệu.'));
    root.append(box,card('Cách đọc trạng thái',p('Đã xem: mở bài. Đang học: vào phần học hoặc trả lời. Hoàn thành lượt: làm đủ luyện và kiểm tra cùng lượt. Đạt kiểm tra: đủ câu đúng độc lập. Cần ôn: câu sai hoặc đến lịch. Tự đánh giá đã nhớ: dùng để xếp lịch, không thay điểm.'),p('Đạt bài: làm đủ câu; đúng độc lập ít nhất 75% câu luyện và 2/3 câu kiểm tra cùng lượt.')));
    const rows=lessons.filter(l=>s.seen.includes(l.day)||s.started.includes(l.day));root.append(card('Theo bài',...(rows.length?rows.map(l=>p(`Bài ${l.day} · ${l.title}: ${lessonStatus(l,s)}${s.reflections[l.day]?' · đã tự đối chiếu vận dụng':''}`)):[p('Chưa mở bài nào.')])),card('Ôn từ dữ liệu thật',p(`${Object.values(s.mistakes).filter(Boolean).length} câu còn sai · ${due(s).length} mục đến hạn. Tự chọn Đã nhớ không xác nhận phát âm đúng.`),button('Mở buổi ôn',()=>{reviewSession=null;show('review');},'primary-button')),card('Thời gian có hoạt động',p(`${Math.floor(s.seconds/60)} phút đã ghi. Chỉ ghi ở bài học có focus và tương tác trong 60 giây gần đây. Nhiều tab không cộng quá 60 giây cho cùng phút thực.`)));
  }
  function exportProgress(){let recovery;try{if(readStorage(key()).corrupt)recovery=localStorage.getItem(key());}catch{}const value={format:'englishlab-progress',version:2,exportedAt:new Date().toISOString(),data:{events,runs,drafts,minutes,course,cursor},...(recovery?{recoveryRaw:recovery}:{})},blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=`english-lab-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return value;}
  function importProgress(value){
    if(value?.format!=='englishlab-progress'||value.version!==2||!Array.isArray(value.data?.events)||value.data.events.length>50000)throw new Error('Bản sao không đúng định dạng English Lab v2.');
    const incoming=value.data.events.map(e=>E.event(e,all())),fresh=incoming.filter(e=>!events.some(old=>old.id===e.id));events=E.merge(events,incoming);if(user)pending=E.merge(pending,fresh);
    if(value.data.drafts&&typeof value.data.drafts==='object'&&!Array.isArray(value.data.drafts))for(const [k,v]of Object.entries(value.data.drafts))if(k.length<180&&typeof v?.value==='string'&&v.value.length<=3000)drafts=mergeDrafts(drafts,{[k]:v});
    if(value.data.runs&&typeof value.data.runs==='object')for(const [k,v]of Object.entries(value.data.runs))if(/^[a-f\d-]{36}$/i.test(v)&&/^(?:(?:(?:foundation-v2|legacy-v1):)?[1-9]\d?|foundation-v2:method1:[1-9]\d?:(?:transfer|retention):[0137]|foundation-v2:studio:studio1-s[1-7][ab])$/.test(k)&&!runs[k])runs[k]=v;
    persist();if(user)void sync();return fresh.length;
  }
  function accountPage(){
    title('Góc học của bạn',user?`${user.name} · ${user.email}`:'Khách · tiến độ chỉ ở trình duyệt này. Có thể xuất bản sao trước khi đổi máy.');root.append(card('Lưu và đồng bộ',p(user?'Hoạt động đồng bộ theo tài khoản. Câu nhập dở và ghi chú lưu trên thiết bị; xuất bản sao nếu cần chuyển chúng sang máy khác.':'F5 hoặc đóng/mở lại vẫn giữ dữ liệu khi trình duyệt cho lưu. Xóa dữ liệu trình duyệt sẽ mất khách nếu chưa sao lưu.'),button(user?'Thử đồng bộ lại':'Đăng nhập / Đăng ký',()=>user?sync():document.getElementById('loginButton').click(),'primary-button')));
    const backup=card('Bản sao tiến độ',p('JSON chứa lịch sử cả hai khóa và câu nhập dở. Nhập hợp nhất theo mã hoạt động, không cộng trùng hoặc xóa lịch sử đang có.'),button('Xuất bản sao tiến độ',exportProgress)),label=el('label','Nhập bản sao JSON'),file=el('input');file.type='file';file.accept='.json,application/json';label.append(file);const feedback=p('Bản sao không chứa mật khẩu hoặc cookie phiên.');feedback.setAttribute('role','status');file.onchange=async()=>{try{const selected=file.files[0];if(!selected)return;if(selected.size>20000000)throw new Error('Bản sao quá 20 MB.');const count=importProgress(JSON.parse(await selected.text()));feedback.textContent=`Đã hợp nhất ${count} hoạt động mới. Không cộng lại mã đã có.`;}catch(error){feedback.textContent=error.message;}finally{file.value='';}};backup.append(label,feedback);root.append(backup);
    const edition=card('Phiên bản khóa học',p(course===F.version?'Đang học Foundation v2 · 42 bài. Khóa cũ và lịch sử vẫn giữ riêng.':'Đang xem khóa cũ · 30 bài.'));if(compatibilityMode)edition.append(p('Khóa mới tạm bảo trì. Tiến độ của cả hai khóa vẫn được giữ.'));else edition.append(button(course===F.version?'Xem khóa cũ và lịch sử':'Học Foundation v2 · 42 bài',()=>switchCourse(course===F.version?'legacy-v1':F.version)));root.append(edition);
    const tzLabel=el('label','Múi giờ thống kê'),tzInput=el('input');tzInput.value=timezone();tzLabel.append(tzInput);root.append(card('Múi giờ',tzLabel,button('Lưu múi giờ',()=>{try{E.dateKey(Date.now(),tzInput.value);localStorage.setItem('englishlab.timezone',tzInput.value);saveMessage('Đã lưu múi giờ.');}catch{saveMessage('Múi giờ không hợp lệ hoặc không thể lưu. Ví dụ Asia/Ho_Chi_Minh.');}})),card('Âm thanh và quyền riêng tư',p('Chưa có bản thu người thật hoặc chấm phát âm. Ghi âm chỉ ở tab, không tự gửi máy chủ. Chưa có xác minh email/khôi phục mật khẩu.')));
    if(user?.role==='admin')root.append(button('Biên tập nội dung khóa cũ',()=>show('editor'),'primary-button'));
    else if(user){const details=el('details');details.append(el('summary','Thiết lập quản trị viên (chủ website)'));const form=el('form'),label=el('label','Mã cấp quyền riêng'),input=el('input');input.type='password';input.autocomplete='off';input.required=true;input.maxLength=256;label.append(input);const submit=el('button','Xác nhận cấp quyền','primary-button');submit.type='submit';const feedback=p('Cần đúng email và mã đã cấu hình trên máy chủ.');feedback.setAttribute('role','status');form.append(label,submit,feedback);form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{const result=await api('bootstrap-admin',{key:input.value});input.value='';updateAccount(result.user);}catch(error){input.value='';feedback.textContent=error.message;}finally{submit.disabled=false;}};details.append(form);root.append(details);}
  }
  function editor(){
    title('Biên tập khóa cũ · 30 bài','Foundation v2 được quản lý bằng mã nguồn và kiểm tra nội dung. Trình biên tập này giữ chức năng khóa cũ.');if(user?.role!=='admin'){root.append(p('Bạn không có quyền biên tập.'));return;}
    const label=el('label','Bài khóa cũ'),input=el('input');input.type='number';input.min=1;input.max=30;input.value=editorDay;label.append(input);root.append(label,button('Tải bài để sửa',async()=>{editorDay=Number(input.value);try{const result=await api(`admin/lessons/${editorDay}`);editorVersion=result.version;editorLesson=result.lesson;render();}catch(error){saveMessage(error.message);}},'primary-button'));if(!editorLesson||editorLesson.day!==editorDay)return;
    const area=el('textarea');area.rows=24;area.value=JSON.stringify(editorLesson,null,2);area.setAttribute('aria-label','JSON nội dung khóa cũ');const feedback=p(''),preview=el('div');feedback.setAttribute('role','status');root.append(area,feedback);
    const parse=()=>{let value;try{value=JSON.parse(area.value);}catch{throw new Error('JSON sai cú pháp.');}const errors=Curriculum.validate(value);if(value.day!==editorDay)errors.push('Số bài không khớp.');if(errors.length)throw new Error(errors.join(' '));return value;};root.append(button('Kiểm tra và xem trước',()=>{try{const value=parse();feedback.textContent='✓ Cấu trúc hợp lệ; vẫn cần kiểm tra chất lượng giảng dạy.';preview.replaceChildren(card(value.title,p(value.goal),...value.teaching.map(p),...value.practice.concat(value.test).map(q=>p(`${q.prompt} → ${q.answers.join(' / ')} · ${q.explanation}`))));}catch(error){feedback.textContent=error.message;}}));
    for(const [action,text]of [['draft','Lưu nháp'],['publish','Xuất bản']])root.append(button(text,async e=>{const b=e.currentTarget;b.disabled=true;try{const value=parse(),result=await api(`admin/lessons/${editorDay}`,{action,lesson:value,version:editorVersion});editorVersion=result.version;editorLesson=value;feedback.textContent=action==='publish'?'✓ Đã xuất bản.':'✓ Đã lưu nháp.';if(action==='publish'){legacy=legacy.map(l=>l.day===value.day?value:l);cacheLegacy();if(course==='legacy-v1')lessons=legacy;}}catch(error){feedback.textContent=error.message;}finally{b.disabled=false;}},'primary-button'));root.append(preview);
  }
  function render(){stopMedia();root.replaceChildren();({today,roadmap,lesson,review,studio,notebook,progress:progressPage,account:accountPage,editor}[screen]||today)();}
  const audioStatus=el('p','','audio-status');audioStatus.id='audioStatus';audioStatus.setAttribute('role','status');root.after(audioStatus);
  window.CourseUI={show,account,audio:(text,slow)=>AudioLab.play(text,slow),openLesson,openStudio,switchCourse,exportProgress,importProgress};
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
  document.getElementById('themeButton').onclick=()=>{const theme=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=theme;try{localStorage.setItem('englishlab.theme',theme);}catch{}};
  try{document.documentElement.dataset.theme=localStorage.getItem('englishlab.theme')||'light';}catch{document.documentElement.dataset.theme='light';}
  root.addEventListener('pointerdown',()=>lastInteraction=Date.now());root.addEventListener('keydown',()=>lastInteraction=Date.now());
  window.addEventListener('online',()=>{saveMessage(user?'Kết nối đã trở lại; đang thử đồng bộ…':'Kết nối đã trở lại. Tiến độ khách vẫn ở thiết bị.');void sync();});window.addEventListener('offline',()=>saveMessage('Đang mất mạng · học tiếp nội dung đã tải; tiến độ ở thiết bị, chưa đồng bộ máy chủ.'));
  window.addEventListener('storage',e=>{if(e.key!==key())return;const other=readStorage(key());events=E.merge(events,other.events);pending=E.merge(pending,other.pending);drafts=mergeDrafts(drafts,other.drafts);if(!['lesson','studio','editor'].includes(screen))render();});
  document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(document.hidden)stopMedia();});window.addEventListener('pagehide',()=>{persist();stopMedia();});
  setInterval(()=>{const now=Date.now(),seconds=Math.min(30,Math.floor((now-lastTick)/1000));lastTick=now;if(!document.hidden&&document.hasFocus()&&!root.hidden&&(screen==='lesson'||screen==='studio'&&studioScene)&&now-lastInteraction<60000&&seconds>0)log('time',{day:selectedDay,seconds});},30000);
  void account(typeof currentUser==='undefined'?null:currentUser);
  api('course').then(result=>{legacy=result.lessons;cacheLegacy();if(course==='legacy-v1'){lessons=legacy;if(screen!=='lesson'&&screen!=='editor')render();}}).catch(()=>saveMessage('Chưa tải được cập nhật khóa cũ. Dùng bản nội dung công khai đã giữ trên thiết bị.'));
  api('settings').then(result=>{if(result.courseEdition==='legacy-v1'){compatibilityMode=true;switchCourse('legacy-v1');saveMessage('Khóa mới tạm bảo trì. Tiến độ được giữ; bạn có thể xem lại khóa cũ.');}}).catch(()=>{/* Optional setting: the bundled edition remains available. */});
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{/* Optional: loaded lessons and local progress still work. */});
})();
