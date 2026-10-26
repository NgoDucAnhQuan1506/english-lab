/* Device speech and optional licensed files share one owner and one stop button. */
(() => {
  'use strict';
  let generation=0, currentFile=null, last=null, feedback=null;
  const files=new Map();
  const announce = message => { const node=feedback?.isConnected?feedback:document.getElementById('audioStatus'); if(node) node.textContent=message; };
  function stop(quiet=false) { generation++; currentFile?.pause(); currentFile=null; window.speechSynthesis?.cancel(); announce(quiet?'':'Đã dừng âm thanh.'); }
  const specification = input => typeof input==='string'?{kind:input.length===1&&/[A-Za-z]/.test(input)?'letter':'phrase',text:input}:input;
  async function play(input, slow=false, output=null) {
    window.LocalRecorder?.pausePlayback();stop(true); feedback=output; const token=generation; const spec=specification(input); last={spec,slow};
    if(!spec?.text || /^\/.*\/$/.test(spec.text.trim())) { announce('Hãy nghe từ mẫu, không phát trực tiếp ký hiệu IPA.'); return false; }
    announce('Đang chuẩn bị giọng đọc…');
    const file=files.get(`${spec.kind}:${spec.text}`);
    if(file) {
      const player=new Audio(file.src); currentFile=player; player.playbackRate=slow?.75:1;
      player.onended=()=>{if(token===generation)announce('Đã phát xong.');};
      player.onerror=()=>{if(token===generation)announce('Không tải được bản thu. Kiểm tra kết nối rồi thử lại.');};
      try{await player.play();if(token!==generation){player.pause();return false;}announce('Đang phát bản thu…');return true;}
      catch{if(token===generation)announce('Chưa phát được bản thu; bấm Nghe để thử lại.');return false;}
    }
    if(!('speechSynthesis' in window)) { announce('Trình duyệt không hỗ trợ đọc. Mở văn bản hỗ trợ để luyện đọc; lượt đó được ghi có hỗ trợ.'); return false; }
    const english=()=>speechSynthesis.getVoices().filter(v=>/^en(?:[-_]|$)/i.test(v.lang));
    let voices=english();
    if(!voices.length) voices=await new Promise(resolve=>{
      const finish=()=>{clearTimeout(timer);speechSynthesis.removeEventListener('voiceschanged',changed);resolve(english());};
      const changed=()=>{if(english().length)finish();};
      const timer=setTimeout(finish,1200);speechSynthesis.addEventListener('voiceschanged',changed);
    });
    if(token!==generation)return false;
    if(!voices.length) { announce('Chưa có giọng tiếng Anh. Cài giọng English trong thiết bị rồi thử lại. Bạn có thể mở văn bản để luyện đọc có hỗ trợ; chưa thể kiểm tra nghe độc lập.'); return false; }
    // A in a sentence can become an article. A letter label makes the intention explicit.
    const spoken=spec.kind==='letter'?`The letter ${spec.text.toUpperCase()}.`:spec.text;
    const utterance=new SpeechSynthesisUtterance(spoken); utterance.voice=voices.find(v=>/^en-US$/i.test(v.lang))||voices[0]; utterance.lang=utterance.voice.lang; utterance.rate=slow?.65:.9;
    utterance.onstart=()=>{if(token===generation)announce(spec.kind==='letter'?'Đang nghe nhãn “The letter …” và tên chữ.':'Đang phát bằng giọng tiếng Anh của thiết bị…');};
    utterance.onend=()=>{if(token===generation)announce('Đã phát xong.');};
    utterance.onerror=event=>{if(token===generation && !['canceled','interrupted'].includes(event.error))announce('Giọng đọc gặp lỗi. Thử lại hoặc mở văn bản hỗ trợ.');};
    speechSynthesis.speak(utterance); return true;
  }
  window.AudioLab={play,stop,replay:()=>last&&play(last.spec,last.slow),register:(id,entry)=>{
    if(!entry?.license||!entry?.src||!entry.src.startsWith('/')||entry.src.startsWith('//'))throw new Error('Bản thu cần nguồn nội bộ và thông tin quyền sử dụng.'); files.set(id,entry);
  }};
  window.addEventListener('pagehide',()=>stop(true));
})();
