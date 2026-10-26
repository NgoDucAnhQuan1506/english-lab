(() => {
  'use strict';
  let dispose=()=>{},pausePlayback=()=>{};
  function panel() {
    dispose();
    const box=document.createElement('section'); box.className='study-card recording-panel';
    const h=document.createElement('h2'); h.textContent='Tự nghe giọng của mình';
    const note=document.createElement('p'); note.textContent='Chỉ mở microphone khi bạn bấm ghi. Bản ghi tạm trong tab này, không tải lên máy chủ; rời phần này sẽ xóa. Có thể tải bản ghi về máy. Không có điểm phát âm.';
    const status=document.createElement('p');status.setAttribute('role','status');
    const controls=document.createElement('div');controls.className='audio-tools';
    const create=label=>{const b=document.createElement('button');b.type='button';b.className='secondary-button';b.textContent=label;controls.append(b);return b;};
    const record=create('● Ghi âm'),stop=create('■ Kết thúc ghi'),remove=create('Xóa bản ghi');
    const player=document.createElement('audio');player.controls=true;player.hidden=true;player.setAttribute('aria-label','Nghe lại bản ghi của bạn');
    pausePlayback=()=>player.pause();
    const download=document.createElement('a');download.textContent='Tải bản ghi';download.hidden=true;
    let stream=null,recorder=null,url=null,alive=true,request=0,timer=null;
    stop.disabled=true;remove.disabled=true;
    const closeMic=()=>{clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;};
    const clear=()=>{player.pause();player.removeAttribute('src');player.hidden=true;download.hidden=true;download.removeAttribute('href');if(url)URL.revokeObjectURL(url);url=null;remove.disabled=true;};
    record.onclick=async()=>{
      if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status.textContent='Thiết bị chưa hỗ trợ ghi âm trong trình duyệt này. Bạn vẫn có thể tự nói và đối chiếu văn bản.';return;}
      const token=++request;record.disabled=true;status.textContent='Đang xin quyền microphone…';
      try{
        const received=await navigator.mediaDevices.getUserMedia({audio:true});
        if(!alive||token!==request){received.getTracks().forEach(t=>t.stop());return;}
        clear();stream=received;recorder=new MediaRecorder(stream);const chunks=[];
        recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        recorder.onstop=()=>{
          closeMic();if(!alive)return;
          const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});url=URL.createObjectURL(blob);player.src=url;player.hidden=false;download.href=url;download.download=`english-lab-${Date.now()}.${blob.type.includes('mp4')?'m4a':'webm'}`;download.hidden=false;
          record.disabled=false;stop.disabled=true;remove.disabled=false;status.textContent='Microphone đã tắt. Nghe lại và so với mẫu; đây là tự đối chiếu, không phải chấm phát âm.';
        };
        recorder.onerror=()=>{closeMic();record.disabled=false;stop.disabled=true;status.textContent='Ghi âm gặp lỗi. Thử ghi lại.';};
        recorder.start();stop.disabled=false;status.textContent='Đang ghi; tối đa 60 giây. Bấm Kết thúc ghi khi nói xong.';
        timer=setTimeout(()=>{if(recorder?.state==='recording'){recorder.stop();closeMic();}},60000);
      }catch(error){closeMic();if(alive){record.disabled=false;status.textContent=error.name==='NotAllowedError'?'Bạn chưa cho phép microphone. Có thể bật quyền trong trình duyệt rồi bấm ghi lại; bài học vẫn tiếp tục được.':'Không mở được microphone. Kiểm tra thiết bị rồi thử lại.';}}
    };
    stop.onclick=()=>{if(recorder?.state==='recording')recorder.stop();closeMic();};
    remove.onclick=()=>{clear();status.textContent='Đã xóa bản ghi tạm.';};
    player.onplay=()=>window.AudioLab?.stop(true);
    player.onerror=()=>{if(alive)status.textContent='Không phát được bản ghi này. Thử ghi lại và kiểm tra microphone; bản ghi không được tải lên máy chủ.';};
    dispose=()=>{alive=false;request++;if(recorder?.state==='recording')recorder.stop();closeMic();clear();};
    box.append(h,note,controls,player,download,status);return box;
  }
  window.LocalRecorder={panel,dispose:()=>dispose(),pausePlayback:()=>pausePlayback()};
  window.addEventListener('pagehide',()=>dispose());
})();
