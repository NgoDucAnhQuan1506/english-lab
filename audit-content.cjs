const fs=require('node:fs');
const F=require('./public/foundation'),E=require('./public/study-engine');
const M=require('./public/course-method');
const S=require('./public/scenarios');
const failures=[...F.lessons.flatMap(l=>F.validate(l).map(error=>({lesson:l.day,error}))),...M.validate().map(error=>({edition:M.edition,error})),...S.validate(F.lessons).map(error=>({edition:S.edition,error}))];
if(failures.length){console.error(failures);process.exitCode=1;}else{
  const escape=value=>String(value).replace(/\|/g,'\\|').replace(/\n/g,' ');
  const rows=['# Foundation v2 — bản đồ nội dung và kiểm tra','',
    'Sinh bằng `npm run audit:content`. Đây là truy nguyên và kiểm tra dữ liệu; không thay thế thẩm định sư phạm hoặc nghe âm thanh thật.','',
    `Khóa có ${F.lessons.length} bài, ${F.lessons.reduce((n,l)=>n+l.practice.length,0)} câu luyện, ${F.lessons.reduce((n,l)=>n+l.test.length,0)} câu kiểm tra và ${F.lessons.reduce((n,l)=>n+l.vocab.length,0)} thẻ từ trong ngữ cảnh. Số lượng không phải thước đo chất lượng.`,''
  ];
  for(const l of F.lessons){
    rows.push(`## Bài ${l.day} — ${l.title}`,'',`- Mục tiêu: ${l.goal}`,`- Tiên quyết: ${l.prerequisites.length?l.prerequisites.join(', '):'không cần'}.`,`- Vận dụng: ${l.mission}`,'','| ID kiểm tra | Đề / đáp án được chấp nhận | Nội dung được dạy ở đâu |','|---|---|---|');
    for(const q of l.test){
      const evidence=q.refs.map(ref=>{const m=/^(\d+):(.*)$/.exec(ref),source=m?F.lessons[+m[1]-1]:l,id=m?m[2]:ref;return `Bài ${source.day}, ${id}: ${source.concepts.find(v=>v.id===id).text}`;}).join(' / ');
      rows.push(`| ${q.id} | ${escape(q.prompt)} → ${escape(q.answers.join(' / '))} | ${escape(evidence)} |`);
    }
    rows.push('');
  }
  fs.writeFileSync('CONTENT-MAP.md',rows.join('\n')+'\n');
  const methodRows=['# Method v1 — hướng dẫn và truy nguyên từng bài','','Không thay ID/điểm cũ. Các mốc 1/3/7 là quy tắc sản phẩm; kiểm thử thời gian giả lập không thay thử nghiệm người học thật.',''];
  for(const l of M.lessons){methodRows.push(`## Bài ${l.day} — ${l.title}`,'',l.method.outcome,'',`Hướng dẫn: ${l.method.focus}`,'',`Lỗi: ${l.method.error} → ${l.method.correction}. ${l.method.reason}`,'',`Nhiệm vụ: ${l.method.task}`,'',`Mẫu đối chiếu: ${l.method.model}`,'',...l.method.checks.map(c=>`- ${c}`),'','| ID mới | Mục đích / câu hỏi | Đáp án hợp lệ | Nguồn đã dạy |','|---|---|---|---|');for(const q of [...l.transfer,...l.retention])methodRows.push(`| ${q.id} | ${q.delayDays?`Nhớ lại +${q.delayDays} ngày`:'Đổi tình huống'} · ${escape(q.prompt)} | ${escape(q.answers.join(' / '))} | ${escape(q.refs.join(', '))} |`);methodRows.push('');}
  fs.writeFileSync('METHOD-CONTENT-MAP.md',methodRows.join('\n')+'\n');
  const studioRows=['# Xưởng vận dụng — nội dung từng bước','','Sinh bằng npm run audit:content. Đây là mẫu tự đối chiếu, không phải đáp án duy nhất hoặc bài chấm tự động. Lời đáp cá nhân ở thiết bị; mã bước/trạng thái có thể đồng bộ.',''];
  for(const scene of S.scenes){studioRows.push(`## ${scene.id} · ${scene.title}`,'',`Chặng ${scene.stage}, sau bài ${scene.day}. ${scene.brief}`,'');for(const [i,t]of scene.turns.entries())studioRows.push(`### Bước ${i+1} · ${t.id}`,'',t.prompt,'',...(t.audio?[`Âm thanh cả từ/câu hoặc tên chữ (${t.audio.kind}): ${t.audio.text}`,'']:[]),`Mẫu: ${t.model}`,'',t.why,'',...t.checks.map(c=>`- ${c}`),'',`Nguồn đã dạy: ${t.refs.join(', ')}.`,'');}
  fs.writeFileSync('STUDIO-CONTENT-MAP.md',studioRows.join('\n')+'\n');
  const gaps=[];
  for(const l of F.lessons){
    const taught=E.normalize(F.lessons.filter(v=>v.day<=l.day).flatMap(v=>[...v.teaching,...v.guided.map(g=>g.answer)]).join(' '));
    for(const q of [...l.test,...M.lessons[l.day-1].transfer,...M.lessons[l.day-1].retention])for(const answer of q.answers){
      const normalized=E.normalize(answer);
      if(!/^[a-z'\s-]+$/.test(normalized))continue;
      for(const word of normalized.match(/[a-z]+(?:'[a-z]+)?/g)||[])if(word.length>1&&!taught.includes(word))gaps.push({id:q.id,word});
    }
  }
  console.log(JSON.stringify({lessons:F.lessons.length,assessmentRefs:'all valid',possibleUntaughtAnswerTokens:gaps},null,2));
  if(gaps.length)process.exitCode=1;
}
