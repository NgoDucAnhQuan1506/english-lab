(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./study-engine'));else root.ReviewCoach=factory(root.StudyEngine);})(globalThis,function(E){
  'use strict';
  const refs=q=>(q.refs||[]).map(ref=>/^\d+:/.test(ref)?ref:`${q.day}:${ref}`);
  const signature=q=>`${q.type}:${(q.answers||[]).map(E.normalize).sort().join('|')}:${q.audio?.text||''}`;
  function plan(events,lessons,mode='due',limit=6,now=Date.now()){
    const past=events.filter(e=>e.at<=now),s=E.state(past,lessons),lookup=E.index(lessons),history=E.merge(past).filter(e=>e.type==='answer'&&lookup.questions[e.question]),counts=new Map(),last=new Map();
    for(const e of history){counts.set(e.question,(counts.get(e.question)||0)+1);last.set(e.question,e.at);}
    const used=new Set(),chosen=[];
    for(const source of E.reviewQueue(s,lessons,mode,Math.min(100,Math.max(1,limit)*8),now)){
      if(chosen.length>=limit)break;
      const original=lookup.questions[source],word=lookup.words[source],why=s.mistakes[source]?'câu gốc còn sai ở lần gần nhất':mode==='favorites'?'bạn đã lưu từ này':'mục gốc đã đến lịch ôn';
      if(word){if(used.has(`word:${E.normalize(word.term)}`))continue;used.add(`word:${E.normalize(word.term)}`);chosen.push({source,item:source,type:'word',day:word.day,changed:false,reason:`Bài ${word.day}: ${why}.`});continue;}
      if(!original)continue;
      const shared=candidate=>refs(candidate).filter(ref=>refs(original).includes(ref));
      const candidates=Object.values(lookup.questions).filter(q=>q.day<=original.day&&q.section!=='retention'&&q.id!==source&&shared(q).length&&!used.has(signature(q))&&signature(q)!==signature(original));
      candidates.sort((a,b)=>Number((last.get(a.id)||0)>now-86400000)-Number((last.get(b.id)||0)>now-86400000)||(counts.get(a.id)||0)-(counts.get(b.id)||0)||shared(b).length-shared(a).length||(last.get(a.id)||0)-(last.get(b.id)||0)||a.id.localeCompare(b.id));
      const successes=new Set(history.filter(e=>e.context==='review'&&e.question!==source&&e.at>(last.get(source)||0)&&!e.assisted&&E.grade(lookup.questions[e.question],e.answer)&&shared(lookup.questions[e.question]).length).map(e=>e.question));
      const candidate=successes.size>=2?original:candidates[0]||original;if(used.has(signature(candidate)))continue;used.add(signature(candidate));
      chosen.push({source,item:candidate.id,type:'question',day:candidate.day,changed:candidate.id!==source,concepts:shared(candidate),reason:`Bài ${original.day}: ${why}.${candidate.id!==source?' Thử cách dùng khác của kiến thức này; chưa tự xóa lỗi ở câu gốc.':successes.size>=2?' Sau hai câu ôn liên quan đúng độc lập, quay lại kiểm tra câu gốc.':' Thử lại câu gốc vì chưa có biến thể phù hợp.'}`});
    }
    return chosen;
  }
  function feedback(q,answer,lessons){
    if(E.grade(q,answer))return null;
    const text=E.normalize(answer),expected=q.answers.map(E.normalize).join(' | '),lesson=lessons.find(l=>l.day===q.day);
    if(q.caseSensitive&&q.answers.some(a=>String(a).toLowerCase()===String(answer).trim().toLowerCase()))return {title:'Đúng chữ, cần đổi dạng viết',explanation:'Câu này yêu cầu phân biệt hoa–thường. Đối chiếu hình viết của chữ, giữ nguyên tên chữ.'};
    if(/\ba my\b/.test(text))return {title:'Kiểm tra a và my',explanation:'Trong mẫu đã học, dùng my book hoặc a book; không ghép a my book. Hãy giữ đúng ý “của tôi”.'};
    if(/\bi'm am\b/.test(text))return {title:'I’m đã có am',explanation:'I’m là dạng gọn của I am. Giữ một cách viết, rồi thêm tên/trạng thái/nghề.'};
    if(/\b(?:does|doesn't|does not) (?:he |she |it )?(?:works|studies|reads|likes|goes|has)\b/.test(text))return {title:'Kiểm tra từ sau does/doesn’t',explanation:'Sau does/doesn’t dùng hành động cơ bản: work, study, read, like, go, have. Đừng giữ dạng thêm s hoặc has.'};
    if(/\b(?:am|is|are) (?:not )?(?:work|study|read|like|get|go)\b/.test(text)&&!/(?:am|is|are) (?:not )?(?:work|study|read|like|get|go)\b/.test(expected))return {title:'Kiểm tra be trước hành động',explanation:'Với mẫu hành động đang học, ghép người + hành động. I study English; không thêm am trước study. So lại mẫu cụ thể phía trên.'};
    if(q.format==='clock')return {title:'Giữ dấu hai chấm của giờ',explanation:'Nhập giờ:phút, ví dụ 8:30. Kiểm tra lại số giờ và phút; 830 không phải cùng định dạng.'};
    return {title:'Đối chiếu điều cần dùng',explanation:q.explanation||lesson?.method?.reason||'Xem lại mẫu và tự thử với thông tin khác.'};
  }
  return {plan,feedback,refs,signature};
});
