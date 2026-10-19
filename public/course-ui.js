/* The course UI shares auth/admin with app.js. Content and grading stay in separate modules. */
(() => {
  'use strict';
  const E = StudyEngine;
  let lessons = Curriculum.lessons;
  let user = null, events = [], pending = [], runs = {}, screen = 'today', selectedDay = 1, step = 'intro', syncing = false, accountGeneration = 0;
  let filter = '', topic = 'all', reviewMode = 'due', lastInteraction = Date.now(), lastTick = Date.now(), audioGeneration = 0;
  let syncDrain = Promise.resolve();
  const root = document.getElementById('courseRoot');
  const status = document.getElementById('saveStatus');
  const el = (tag, text, cls) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; };
  const button = (label, handler, cls = 'secondary-button') => { const b = el('button', label, cls); b.type = 'button'; b.addEventListener('click', handler); return b; };
  const paragraph = text => el('p', text);
  const card = (title, ...nodes) => { const c = el('section', undefined, 'study-card'); if (title) c.append(el('h2', title)); c.append(...nodes); return c; };
  const key = () => `englishlab.study.${user ? user.id : 'guest'}.v1`;
  const state = () => E.state(events, lessons, timezone());
  function timezone() { try { const value = localStorage.getItem('englishlab.timezone') || 'Asia/Ho_Chi_Minh'; E.dateKey(Date.now(), value); return value; } catch { return 'Asia/Ho_Chi_Minh'; } }
  function readStorage(storageKey) {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const valid = items => (Array.isArray(items) ? items : []).filter(item => { try { E.event(item, lessons); return true; } catch { return false; } });
      return { events: valid(value.events), pending: valid(value.pending), runs: value.runs && typeof value.runs === 'object' && !Array.isArray(value.runs) ? value.runs : {} };
    }
    catch { return { events: [], pending: [], runs: {} }; }
  }
  function persist() {
    try { localStorage.setItem(key(), JSON.stringify({ events, pending, runs })); return true; }
    catch { status.textContent = 'Trình duyệt không cho lưu hoặc đã đầy bộ nhớ. Tiến độ mới chưa được lưu trên thiết bị; đừng đóng trang.'; return false; }
  }
  function saveMessage(text, retry = false, handler = sync, label = 'Thử lưu lại') {
    status.replaceChildren(document.createTextNode(text));
    if (retry) status.append(button(label, handler, 'text-button'));
  }
  function log(type, payload = {}) {
    const raw = { id: crypto.randomUUID(), at: Math.max(Date.now(), (events.at(-1)?.at || 0) + 1), type, ...payload };
    const e = E.event(raw, lessons);
    events = E.merge(events, [e]); if (user) pending.push(e);
    const saved = persist();
    if (saved) saveMessage(user ? 'Đang chờ lưu vào tài khoản…' : 'Đã lưu trên thiết bị. Xóa dữ liệu trình duyệt có thể làm mất tiến độ khách.');
    if (user) void sync();
    return e;
  }
  async function sync() {
    if (!user) return;
    if (syncing) { await syncDrain; return; }
    const generation = accountGeneration;
    let finishSync;
    syncDrain = new Promise(resolve => { finishSync = resolve; });
    syncing = true;
    try {
      if (!pending.length) {
        const snapshot = await api('study');
        if (generation !== accountGeneration) return;
        events = E.merge(snapshot.events, events); persist();
      }
      while (pending.length && generation === accountGeneration) {
        const batch = pending.slice(0, 500);
        const result = await api('study', { events: batch });
        if (generation !== accountGeneration) return;
        const sent = new Set(batch.map(e => e.id)); pending = pending.filter(e => !sent.has(e.id));
        events = E.merge(result.events, events); persist();
      }
      if (generation === accountGeneration) saveMessage('Đã lưu tiến độ vào tài khoản.');
    } catch (error) {
      if (generation === accountGeneration) saveMessage(error.status === 401 ? 'Phiên đăng nhập đã hết hạn. Tiến độ đang được giữ trên thiết bị; đăng nhập lại để đồng bộ.' : 'Lưu máy chủ thất bại. Tiến độ đang được giữ trên thiết bị.', true);
    } finally { if (generation === accountGeneration) syncing = false; finishSync(); }
  }
  async function account(value) {
    const generation = ++accountGeneration;
    user = value; syncing = false;
    const cached = readStorage(key()); events = cached.events; pending = cached.pending; runs = cached.runs;
    screen = 'today'; render();
    if (!user) { saveMessage('Chế độ khách: tiến độ chỉ nằm trên thiết bị này.'); return; }
    saveMessage('Đang tải tiến độ tài khoản…');
    try {
      const result = await api('study'); if (generation !== accountGeneration) return;
      events = E.merge(result.events, events); persist(); render();
      await sync();
    } catch { if (generation === accountGeneration) saveMessage('Chưa tải được tiến độ tài khoản. Dùng bản lưu trên thiết bị và thử lại.', true); }
  }
  function due(s = state()) { return Object.entries(s.reviews).filter(([, review]) => review.due <= Date.now()); }
  function title(text, subtitle) { root.append(el('h1', text), paragraph(subtitle)); }
  function show(value) {
    if (value === 'alphabet') {
      root.hidden = true; document.getElementById('adminView').hidden = true; document.getElementById('dashboardView').hidden = true; document.getElementById('lessonView').hidden = false; return;
    }
    screen = value; root.hidden = false;
    document.getElementById('lessonView').hidden = true; document.getElementById('dashboardView').hidden = true; document.getElementById('adminView').hidden = true;
    document.querySelectorAll('[data-screen]').forEach(b => { b.classList.toggle('active', b.dataset.screen === value); b.setAttribute('aria-current', b.dataset.screen === value ? 'page' : 'false'); });
    document.getElementById('adminTab').setAttribute('aria-pressed', false);
    document.getElementById('lessonTab').setAttribute('aria-pressed', value === 'today');
    document.getElementById('dashboardTab').setAttribute('aria-pressed', value === 'progress');
    render();
  }
  function openLesson(day, where = 'intro') {
    selectedDay = day; step = where; screen = 'lesson'; log('view', { day, step }); show('lesson');
  }
  function stats(items) {
    const grid = el('div', undefined, 'stats-grid');
    for (const [label, value] of items) { const item = el('div', undefined, 'stat-card'); item.append(el('span', label), el('strong', value)); grid.append(item); }
    return grid;
  }
  function streak(s) {
    const d = new Date(`${E.dateKey(Date.now(), timezone())}T00:00:00Z`); let count = 0;
    const active = day => s.daily[day]?.answers > 0;
    if (!active(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() - 1);
    while (active(d.toISOString().slice(0, 10))) { count++; d.setUTCDate(d.getUTCDate() - 1); }
    return count;
  }
  function today() {
    const s = state(), next = lessons.find(l => !s.completed.includes(l.day)) || lessons[29], resume = s.resume;
    title('Mỗi ngày một bước nhỏ', '30 ngày xây nền tảng tiếng Anh, không hứa thành thạo sau 30 ngày.');
    const todayData = s.daily[E.dateKey(Date.now(), timezone())] || { seconds: 0, answers: 0 };
    const summaryStats = stats([['Ngày đạt', `${s.completed.length}/30`], ['Chuỗi học (có trả lời)', `${streak(s)} ngày`], ['Đến hạn ôn', due(s).length], ['Hôm nay hoạt động', `${Math.floor(todayData.seconds / 60)} phút`]]);
    const hero = card(`Ngày ${next.day} · ${next.title}`, paragraph(next.goal), paragraph(`${next.minutes} phút dự kiến · Mục tiêu: 1 bài, 8 câu luyện và 3 câu kiểm tra. Thời lượng thực tế tùy tốc độ của bạn.`), button('Học bài được đề xuất', () => openLesson(next.day), 'primary-button'), button(`Tiếp tục ngày ${resume.day} đang dở`, () => openLesson(resume.day, resume.step)));
    root.append(hero, summaryStats);
    const guest = readStorage('englishlab.study.guest.v1');
    if (user && guest.events.length) root.append(card('Bạn có tiến độ khách trên thiết bị', paragraph(`${guest.events.length} hoạt động khách. Hợp nhất theo mã hoạt động; giữ cả dữ liệu tài khoản và dữ liệu khách, không cộng trùng cùng một lượt.`), button('Hợp nhất vào tài khoản', async () => {
      const known = new Set(events.map(e => e.id)); const fresh = guest.events.filter(e => !known.has(e.id)); events = E.merge(events, fresh); pending.push(...fresh); persist(); await sync();
      if (!pending.length) { try { localStorage.removeItem('englishlab.study.guest.v1'); } catch {} } render();
    }, 'primary-button'), paragraph('Bạn có thể bỏ qua và giữ dữ liệu khách riêng bằng cách tiếp tục học tài khoản.')));
    const recent = Object.entries(s.daily).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7);
    root.append(card('Hoạt động gần đây', ...(recent.length ? recent.map(([day, activity]) => paragraph(`${day.split('-').reverse().join('/')} · ${activity.answers} câu · ${Math.floor(activity.seconds / 60)} phút hoạt động`)) : [paragraph('Chưa có hoạt động. Bắt đầu bằng bài ngày 1.')])), button('Luyện thêm bảng chữ cái', () => show('alphabet')));
  }
  function roadmap() {
    title('Lộ trình 30 ngày', 'Tất cả 30 ngày đều có nội dung và mở để bạn xem. Nên học theo thứ tự; ngày 7, 14, 21, 30 ưu tiên ôn tập.');
    const s = state(), grid = el('div', undefined, 'roadmap-grid');
    for (const lesson of lessons) {
      const label = s.completed.includes(lesson.day) ? '✓ Đã đạt' : s.seen.includes(lesson.day) ? '◉ Đang học' : 'Chưa học';
      grid.append(card(`Ngày ${lesson.day} · ${lesson.title}`, el('span', `${label} · ${lesson.minutes} phút`, 'badge'), paragraph(lesson.goal), button('Mở bài học', () => openLesson(lesson.day), 'primary-button')));
    }
    root.append(grid);
  }
  function audio(text, slow = false) {
    const output = document.getElementById('audioStatus');
    const report = message => { if (output) output.textContent = message; else status.textContent = message; };
    if (!('speechSynthesis' in window)) { report('Trình duyệt không hỗ trợ giọng đọc. Đọc văn bản đối chiếu; bài nghe chưa thể phát trên thiết bị này.'); return; }
    const voices = speechSynthesis.getVoices().filter(v => /^en(?:[-_]|$)/i.test(v.lang));
    if (!voices.length) { report('Chưa có giọng tiếng Anh. Hãy cài giọng tiếng Anh trên thiết bị, chờ tải giọng rồi thử lại. Văn bản vẫn dùng được; chưa thể đánh giá khả năng nghe bằng âm thanh.'); return; }
    const generation = ++audioGeneration; speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text); utterance.voice = voices.find(v => v.lang === 'en-US') || voices[0]; utterance.lang = utterance.voice.lang; utterance.rate = slow ? .65 : .9;
    utterance.onstart = () => { if (generation === audioGeneration) report('Đang phát bằng giọng của thiết bị…'); };
    utterance.onend = () => { if (generation === audioGeneration) report('Đã phát xong.'); };
    utterance.onerror = () => { if (generation === audioGeneration) report('Không phát được âm thanh. Thử lại hoặc dùng văn bản đối chiếu.'); };
    speechSynthesis.speak(utterance);
  }
  function audioTools(text) {
    const bar = el('div', undefined, 'audio-tools'); bar.append(button('▶ Nghe', () => audio(text)), button('▷ Nghe chậm', () => audio(text, true)), button('■ Dừng', () => { audioGeneration++; window.speechSynthesis?.cancel(); const node = document.getElementById('audioStatus'); if (node) node.textContent = 'Đã dừng.'; })); return bar;
  }
  function favorite(word) { const s = state(); return button(s.favorites[word.id] ? '♥ Đã yêu thích' : '♡ Yêu thích', () => { log('favorite', { item: word.id, value: !s.favorites[word.id] }); render(); }); }
  function memory(item) {
    const bar = el('div', undefined, 'memory-tools');
    for (const [value, label] of [['again', 'Chưa nhớ'], ['hard', 'Khó'], ['good', 'Đã nhớ']]) bar.append(button(label, () => { log('rating', { item, value }); render(); }));
    return bar;
  }
  function vocabCard(word) { return card(`${word.term} ${word.ipa}`, paragraph(word.meaning), paragraph(`${word.example} — ${word.translation}`), audioTools(word.term), favorite(word), memory(word.id)); }
  function currentRun(day) {
    if (!runs[day]) { const last = [...events].reverse().find(e => e.type === 'answer' && e.day === day); runs[day] = last?.run || crypto.randomUUID(); persist(); }
    return runs[day];
  }
  function lesson() {
    const l = lessons[selectedDay - 1], s = state();
    title(`Ngày ${l.day} · ${l.title}`, `${l.minutes} phút · ${l.consolidation ? 'Buổi ôn tập và vận dụng' : 'Buổi học nền tảng'}`);
    const steps = [['intro', '1. Bài giảng'], ['vocab', '2. Từ vựng'], ['listen', '3. Nghe–nói'], ['practice', '4. Luyện tập'], ['test', '5. Kiểm tra'], ['summary', '6. Tổng kết']];
    const nav = el('nav', undefined, 'step-nav'); nav.setAttribute('aria-label', 'Các phần bài học');
    for (const [id, label] of steps) { const b = button(label, () => openLesson(l.day, id)); b.setAttribute('aria-pressed', step === id); nav.append(b); } root.append(nav);
    if (l.day > 1 && !s.completed.includes(l.day - 1)) root.append(paragraph(`Gợi ý: hoàn thành ngày ${l.day - 1} trước để có kiến thức nền. Bạn vẫn có thể xem bài này.`));
    if (step === 'intro') {
      root.append(card('Học xong bạn làm được gì?', paragraph(l.goal), paragraph('Nhịp học gợi ý: ôn 1 phút · bài giảng 4 phút · từ 3 phút · nghe–nói 3 phút · luyện 4 phút · kiểm tra/tổng kết 3 phút. Có thể dừng và tiếp tục.')));
      if (l.review) root.append(card('Nhớ lại trước khi học (1 phút)', paragraph(l.review)));
      root.append(card('Bài giảng', ...l.teaching.map(paragraph)), button('Học từ vựng →', () => openLesson(l.day, 'vocab'), 'primary-button'));
    } else if (step === 'vocab') root.append(...l.vocab.map(vocabCard), button('Sang nghe–nói →', () => openLesson(l.day, 'listen'), 'primary-button'));
    else if (step === 'listen') {
      root.append(card('Nghe, dừng, nói theo', paragraph(l.speaking), paragraph('Âm thanh dùng giọng đọc tiếng Anh của trình duyệt/thiết bị, chưa có bản thu người thật. Không có chấm điểm phát âm. Khi thiếu giọng, bạn vẫn đọc và luyện nói theo văn bản.')));
      for (const [english, vietnamese] of l.dialogue) root.append(card(english, audioTools(english), paragraph(vietnamese)));
      root.append(button('Bắt đầu luyện tập →', () => openLesson(l.day, 'practice'), 'primary-button'));
    } else if (step === 'practice' || step === 'test') {
      const run = currentRun(l.day), answers = s.runs[run]?.answers || {};
      if (step === 'test' && !l.practice.every(q => answers[q.id])) root.append(card('Chưa mở kiểm tra trong lượt này', paragraph('Hãy trả lời đủ 8 câu luyện trước. Không yêu cầu trả lời đúng hết; mỗi câu đều có lời giải.'), button('Về phần luyện tập', () => openLesson(l.day, 'practice'), 'primary-button')));
      else exerciseList(l[step], run, l);
    } else {
      root.append(card('Kiến thức chốt lại', paragraph(l.summary), paragraph(`Nhiệm vụ ôn: ${l.homework}`), paragraph(s.completed.includes(l.day) ? '✓ Đã đạt tiêu chí của bài: đủ 8 câu luyện và 3 câu kiểm tra; đúng ít nhất 6/8 câu luyện và 2/3 câu kiểm tra trong cùng lượt.' : 'Chưa đạt hoặc chưa làm đủ. Để đạt: đúng ít nhất 6/8 câu luyện và 2/3 câu kiểm tra trong cùng lượt. Xem lời giải, ôn câu sai rồi thử lượt mới.'), button('Ôn câu sai', () => { reviewMode = 'wrong'; show('review'); }), button('Làm lại lượt mới', () => { runs[l.day] = crypto.randomUUID(); persist(); openLesson(l.day, 'practice'); })));
      root.append(button(l.day < 30 ? `Xem ngày ${l.day + 1} →` : 'Xem tiến độ và kế hoạch ôn', () => l.day < 30 ? openLesson(l.day + 1) : show('progress'), 'primary-button'));
    }
  }
  function shuffled(values) { const copy = [...values]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
  function exerciseList(questions, run, lesson) {
    const hash = value => { let n = 2166136261; for (const character of value) n = Math.imul(n ^ character.charCodeAt(0), 16777619); return n >>> 0; };
    const ordered = [...questions].sort((a, b) => hash(run + a.id) - hash(run + b.id));
    const s = state(), answers = s.runs[run]?.answers || {}, first = ordered.find(q => !answers[q.id]);
    const count = questions.filter(q => answers[q.id]).length;
    root.append(paragraph(`${step === 'test' ? 'Kiểm tra' : 'Luyện tập'}: ${count}/${questions.length} câu đã trả lời. Chấm theo đáp án xác định; bỏ qua hoa/thường, dấu câu và khoảng trắng, không đoán từ gần giống.`));
    if (first) renderQuestion(first, run);
    else {
      const correct = questions.filter(q => answers[q.id]?.correct).length;
      root.append(card(`Kết quả ${correct}/${questions.length}`, ...questions.map(q => paragraph(`${answers[q.id].correct ? '✓ Đúng' : '✕ Sai'} · ${q.prompt} · Bạn chọn: ${answers[q.id].answer} · Đáp án: ${q.answers.join(' / ')}. ${q.explanation}`)), button(step === 'test' ? 'Xem tổng kết →' : 'Làm kiểm tra →', () => openLesson(lesson.day, step === 'test' ? 'summary' : 'test'), 'primary-button')));
    }
  }
  function renderQuestion(q, run, review = false) {
    const c = card(q.prompt); c.dataset.question = q.id;
    if (q.passage) c.append(el('blockquote', q.passage));
    if (q.audio) { c.append(audioTools(q.audio)); const details = el('details'); details.append(el('summary', 'Văn bản hỗ trợ (mở sau khi nghe; nếu thiếu âm thanh có thể dùng để luyện đọc)'), paragraph(q.audio)); c.append(details); }
    const result = el('div', '', 'question-feedback'); result.setAttribute('role', 'status');
    if (q.caseSensitive) c.append(paragraph('Câu này phân biệt chữ hoa/chữ thường: nhập đúng dạng chữ được yêu cầu.'));
    let locked = false;
    const submit = answer => {
      if (locked) return; locked = true;
      let record;
      try { record = log('answer', { question: q.id, run, answer }); } catch { locked = false; result.textContent = 'Không lưu được lượt trả lời. Thử lại.'; return; }
      c.querySelectorAll('button,input').forEach(node => { node.disabled = true; });
      result.textContent = `${record.correct ? '✓ Đúng.' : '✕ Chưa đúng.'} Đáp án: ${q.answers.join(' / ')}. ${q.explanation}`;
      result.classList.add(record.correct ? 'answer-correct' : 'answer-wrong');
      if (review) c.append(memory(q.id), button('Câu ôn tiếp theo', render, 'primary-button'));
      else c.append(button('Câu tiếp theo →', render, 'primary-button'));
    };
    if (q.type === 'choice') { const options = el('div', undefined, 'study-options'); for (const option of shuffled(q.options)) options.append(button(option, () => submit(option))); c.append(options); }
    else {
      const form = el('form'); const label = el('label', 'Câu trả lời của bạn'); const input = el('input'); input.name = 'answer'; input.autocomplete = 'off'; input.required = true; input.maxLength = 500; label.append(input); form.append(label);
      if (q.type === 'order') {
        const pieces = el('div', undefined, 'word-pieces');
        for (const word of shuffled(q.words)) { const b = button(word, () => { input.value = `${input.value} ${word}`.trim(); b.disabled = true; }); pieces.append(b); }
        pieces.append(button('Xóa và xếp lại', () => { input.value = ''; pieces.querySelectorAll('button').forEach(b => { b.disabled = false; }); })); form.append(pieces);
      }
      const send = el('button', 'Kiểm tra', 'primary-button'); send.type = 'submit'; form.append(send); form.addEventListener('submit', event => { event.preventDefault(); if (input.value.trim()) submit(input.value); }); c.append(form);
    }
    c.append(result); root.append(c);
  }
  function review() {
    title('Ôn tập theo kết quả thật', 'Sau lần luyện/đánh giá, lịch ôn tăng 1 → 3 → 7 → 14 ngày khi nhớ tốt; “Chưa nhớ” về 1 ngày, “Khó” giữ mức hiện tại.');
    const tabs = el('div', undefined, 'step-nav');
    for (const [id, label] of [['due', 'Đến hạn ôn'], ['wrong', 'Ôn câu sai'], ['favorites', 'Từ yêu thích']]) { const b = button(label, () => { reviewMode = id; render(); }); b.setAttribute('aria-pressed', reviewMode === id); tabs.append(b); } root.append(tabs);
    const s = state(), lookup = E.index(lessons);
    const ids = reviewMode === 'due' ? due(s).map(([id]) => id) : reviewMode === 'wrong' ? Object.keys(s.mistakes).filter(id => s.mistakes[id]) : Object.keys(s.favorites).filter(id => s.favorites[id]);
    if (!ids.length) { root.append(card('Chưa có nội dung ở mục này', paragraph('Hoàn thành bài luyện, đánh dấu từ yêu thích hoặc quay lại khi đến hạn. Bạn vẫn có thể ôn tự chọn trong Sổ tay.'))); return; }
    const item = ids[0];
    root.append(paragraph(`${ids.length} nội dung trong mục này.`));
    if (lookup.words[item]) root.append(vocabCard(lookup.words[item]));
    else if (lookup.questions[item]) renderQuestion(lookup.questions[item], crypto.randomUUID(), true);
  }
  function notebook() {
    title('Sổ tay của bạn', 'Từ vựng có nghĩa, IPA, câu mẫu và lịch ôn riêng. Không có đánh giá phát âm tự động.');
    const form = el('form', undefined, 'notebook-search'); const label = el('label', 'Tìm từ hoặc nghĩa'); const input = el('input'); input.value = filter; input.type = 'search'; label.append(input);
    const selectLabel = el('label', 'Lọc bài'); const select = el('select'); const all = el('option', 'Tất cả bài'); all.value = 'all'; select.append(all);
    const fav = el('option', 'Từ yêu thích'); fav.value = 'favorites'; select.append(fav);
    lessons.forEach(l => { const o = el('option', `Ngày ${l.day} · ${l.title}`); o.value = String(l.day); select.append(o); }); select.value = topic; selectLabel.append(select);
    const search = el('button', 'Tìm', 'primary-button'); search.type = 'submit'; form.append(label, selectLabel, search);
    form.addEventListener('submit', e => { e.preventDefault(); filter = input.value.trim(); topic = select.value; render(); }); root.append(form);
    const s = state(), items = lessons.flatMap(l => l.vocab.map(v => ({ ...v, day: l.day }))).filter(v => (topic === 'all' || topic === 'favorites' && s.favorites[v.id] || String(v.day) === topic) && `${v.term} ${v.meaning}`.toLowerCase().includes(filter.toLowerCase()));
    root.append(paragraph(`${items.length} mục (cùng một từ có thể xuất hiện ở nhiều bài để ôn trong ngữ cảnh).`));
    if (!items.length) root.append(paragraph('Không tìm thấy từ phù hợp.'));
    for (const word of items.slice(0, notebookLimit)) { const c = vocabCard(word); c.prepend(el('span', `Ngày ${word.day}`, 'eyebrow')); root.append(c); }
    if (items.length > notebookLimit) root.append(button('Xem thêm 20 từ', () => { notebookLimit += 20; render(); }));
    if ((topic === 'all' || topic === 'favorites') && typeof favorites !== 'undefined' && favorites.size) {
      const legacy = [...favorites].map(i => ({ ...letters[i], index: i })).filter(v => `${v.word} ${v.meaning}`.toLowerCase().includes(filter.toLowerCase()));
      if (legacy.length) root.append(card('Yêu thích từ công cụ bảng chữ cái', ...legacy.map(v => {
        const row = el('div'); row.append(paragraph(`${v.word} — ${v.meaning}`), audioTools(v.word), button('Bỏ yêu thích', async () => { await record('favorite', { index: v.index }); render(); })); return row;
      })));
    }
  }
  let notebookLimit = 20;
  function progressPage() {
    const s = state(); title('Tiến độ và nội dung cần ôn', 'Ngày đạt khi cùng một lượt có đủ 8 câu luyện + 3 câu kiểm tra, đúng ít nhất 6/8 và 2/3. Tự đánh giá từ không được tính thành điểm phát âm.');
    const lookup = E.index(lessons), wordReviews = Object.entries(s.reviews).filter(([id]) => lookup.words[id]);
    root.append(stats([['Ngày đạt', `${s.completed.length}/30`], ['Độ chính xác câu đã làm', s.attempts ? `${Math.round(s.correct / s.attempts * 100)}%` : 'Chưa làm'], ['Từ đã luyện / mức nhớ ≥7 ngày', `${wordReviews.length} / ${wordReviews.filter(([,r]) => r.level >= 2).length}`], ['Thời gian hoạt động ghi nhận', `${Math.floor(s.seconds / 60)} phút`]]));
    const skills = Object.entries(s.skills).sort((a,b)=>a[1].correct/a[1].total-b[1].correct/b[1].total);
    const names = { grammar:'Ngữ pháp', vocabulary:'Từ vựng', listening:'Nghe (có văn bản hỗ trợ)', writing:'Viết/sắp xếp', reading:'Đọc', letters:'Tên chữ', sounds:'Nhận diện âm', numbers:'Số', conversation:'Giao tiếp' };
    root.append(card('Theo kỹ năng (chỉ các câu đã làm)', ...(skills.length ? skills.map(([skill,value])=>paragraph(`${names[skill] || skill}: ${value.correct}/${value.total} đúng · ${Math.round(value.correct/value.total*100)}%`)) : [paragraph('Chưa có câu trả lời để thống kê.')])), card('Đề xuất ôn', paragraph(skills.length ? `Ưu tiên ${names[skills[0][0]] || skills[0][0]} vì có tỷ lệ đúng thấp nhất trong dữ liệu hiện có. Kết quả ít câu có thể chưa ổn định.` : 'Bắt đầu ngày 1 để có dữ liệu thực tế.'), button('Ôn câu sai',()=>{reviewMode='wrong';show('review');},'primary-button')));
    root.append(card('Theo chủ đề / ngày', ...lessons.filter(l=>s.seen.includes(l.day)||s.completed.includes(l.day)).map(l=>{
      const answers=Object.values(s.runs).filter(run=>run.day===l.day).flatMap(run=>Object.values(run.answers)); return paragraph(`Ngày ${l.day} · ${l.title}: ${s.completed.includes(l.day)?'Đã đạt':'Đang học'} · ${answers.filter(e=>e.correct).length}/${answers.length} lượt đúng`);
    })), card('Cách tính thời gian', paragraph('Chỉ ghi khi trang học đang hiển thị, tab có tiêu điểm và có tương tác trong 60 giây gần đây. Không cộng thời gian chỉ để tab nền. Tối đa một bản ghi mỗi phút; thống kê có thể thấp hơn thời gian thực.')));
  }
  function accountPage() {
    title('Tài khoản và tùy chọn', user ? `Đang đăng nhập: ${user.name} · ${user.email}` : 'Khách: tiến độ lưu trên thiết bị, không đồng bộ sang thiết bị khác.');
    root.append(card('Lưu và đồng bộ', paragraph(user ? 'Mỗi hoạt động có mã riêng để tránh cộng trùng khi thử lưu lại. Dữ liệu chờ lưu nằm trên thiết bị; đăng nhập cùng tài khoản để gửi lại.' : 'Bạn có thể học ngay không cần tài khoản. Khi đăng nhập, trang Hôm nay cho phép hợp nhất tiến độ khách theo mã hoạt động.'), button(user ? 'Thử đồng bộ lại' : 'Đăng nhập / Đăng ký', () => user ? sync() : document.getElementById('loginButton').click(), 'primary-button')));
    const label = el('label', 'Múi giờ thống kê của bạn'); const input = el('input'); input.value = timezone(); label.append(input);
    root.append(card('Múi giờ', label, button('Lưu múi giờ', () => { try { E.dateKey(Date.now(), input.value); localStorage.setItem('englishlab.timezone', input.value); render(); } catch { status.textContent='Múi giờ không hợp lệ. Ví dụ Asia/Ho_Chi_Minh.'; } }), paragraph('Mặc định Asia/Ho_Chi_Minh. Thống kê ngày và chuỗi học được tính lại từ thời điểm hoạt động.')));
    root.append(card('Giới hạn hiện tại', paragraph('Chưa có xác minh email, đặt lại mật khẩu, bản thu người thật hay chấm phát âm. Nội dung 30 ngày đã có đủ. Không dùng điểm khóa học thay cho chứng chỉ.')));
    if(user?.role==='admin') root.append(button('Biên tập nội dung bài học',()=>show('editor'),'primary-button'));
    else if (user) {
      const details = el('details'); details.append(el('summary', 'Thiết lập quản trị viên (chỉ dành cho chủ website)'));
      const form = el('form'), label = el('label', 'Mã cấp quyền riêng của chủ website'), input = el('input');
      input.type = 'password'; input.autocomplete = 'off'; input.required = true; input.maxLength = 256; label.append(input);
      const submit = el('button', 'Xác nhận cấp quyền', 'primary-button'); submit.type = 'submit'; const feedback = paragraph('Cần đúng tài khoản email và mã bí mật đã cấu hình trên máy chủ. Không cần Shell.'); feedback.setAttribute('role', 'status'); form.append(label, submit, feedback);
      form.addEventListener('submit', async event => { event.preventDefault(); if (submit.disabled) return; submit.disabled = true; try { const result = await api('bootstrap-admin', { key: input.value }); input.value = ''; updateAccount(result.user); } catch (error) { input.value = ''; feedback.textContent = error.message; } finally { submit.disabled = false; } });
      details.append(form); root.append(details);
    }
  }
  let editorDay=1, editorVersion=0, editorLesson=null;
  function editor() {
    title('Biên tập bài học', 'Admin: tải bài, sửa JSON, kiểm tra dữ liệu, xem trước rồi lưu nháp hoặc xuất bản. Nội dung nháp không thay đổi bài người học.');
    if(user?.role!=='admin'){root.append(paragraph('Bạn không có quyền quản trị.'));return;}
    const label=el('label','Ngày học');const input=el('input');input.type='number';input.min=1;input.max=30;input.value=editorDay;label.append(input);root.append(label);
    root.append(button('Tải bài để sửa',async()=>{editorDay=Number(input.value);try{const result=await api(`admin/lessons/${editorDay}`);editorVersion=result.version;editorLesson=result.lesson;render();}catch(e){status.textContent=e.message;}},'primary-button'));
    if(!editorLesson||editorLesson.day!==editorDay)return;
    const area=el('textarea');area.rows=24;area.value=JSON.stringify(editorLesson,null,2);area.setAttribute('aria-label','JSON bài học và câu hỏi');root.append(area);
    const feedback=el('p');feedback.setAttribute('role','status');root.append(feedback);
    const parse=()=>{let value;try{value=JSON.parse(area.value);}catch{throw new Error('JSON sai cú pháp.');}const errors=Curriculum.validate(value);if(value.day!==editorDay)errors.push('Ngày không khớp.');if(errors.length)throw new Error(errors.join(' '));return value;};
    root.append(button('Kiểm tra và xem trước',()=>{try{const value=parse();feedback.textContent='✓ Dữ liệu hợp lệ. Bản xem trước ở dưới.';preview.replaceChildren(card(value.title,paragraph(value.goal),...value.teaching.map(paragraph),...value.vocab.map(v=>paragraph(`${v.term} ${v.ipa}: ${v.meaning} · ${v.example}`)),...value.practice.concat(value.test).map(q=>paragraph(`${q.prompt} → ${q.answers.join(' / ')} · ${q.explanation}`))));}catch(e){feedback.textContent=e.message;}}));
    for(const [action,label]of[['draft','Lưu nháp'],['publish','Xuất bản']])root.append(button(label,async event=>{const b=event.currentTarget;b.disabled=true;try{const value=parse();const result=await api(`admin/lessons/${editorDay}`,{action,lesson:value,version:editorVersion});editorVersion=result.version;editorLesson=value;feedback.textContent=action==='publish'?'✓ Đã xuất bản.':'✓ Đã lưu nháp.';if(action==='publish')lessons=lessons.map(l=>l.day===value.day?value:l);}catch(e){feedback.textContent=e.message;}finally{b.disabled=false;}},'primary-button'));
    const preview=el('div');root.append(preview);
  }
  function render() {
    root.replaceChildren();
    const handlers={today,roadmap,lesson,review,notebook,progress:progressPage,account:accountPage,editor};
    (handlers[screen]||today)();
    const audioStatus=el('p','','audio-status');audioStatus.id='audioStatus';audioStatus.setAttribute('role','status');root.append(audioStatus);
  }
  window.CourseUI={show,account,audio};
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
  document.getElementById('themeButton').addEventListener('click',()=>{const light=document.documentElement.dataset.theme!=='light';document.documentElement.dataset.theme=light?'light':'dark';try{localStorage.setItem('englishlab.theme',light?'light':'dark');}catch{}});
  try{document.documentElement.dataset.theme=localStorage.getItem('englishlab.theme')||'dark';}catch{}
  root.addEventListener('pointerdown',()=>{lastInteraction=Date.now();});root.addEventListener('keydown',()=>{lastInteraction=Date.now();});
  window.addEventListener('online',()=>sync());
  document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(document.hidden){audioGeneration++;window.speechSynthesis?.cancel();}});
  setInterval(()=>{const now=Date.now(),seconds=Math.min(30,Math.floor((now-lastTick)/1000));lastTick=now;if(!document.hidden&&document.hasFocus()&&!root.hidden&&screen==='lesson'&&now-lastInteraction<60000&&seconds>0)log('time',{day:selectedDay,seconds});},30000);
  void account(typeof currentUser==='undefined'?null:currentUser);show('today');
  function loadCourse() { return api('course').then(result=>{lessons=result.lessons;render();}).catch(()=>saveMessage('Nội dung tích hợp 30 ngày vẫn học được. Chưa tải được các bản cập nhật từ máy chủ.',true,loadCourse,'Thử tải bản cập nhật')); }
  void loadCourse();
})();
