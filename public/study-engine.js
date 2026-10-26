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
      for (const section of ['practice', 'test']) for (const q of lesson[section]) questions[q.id] = { ...q, day: lesson.day, course:lesson.course || 'legacy-v1', section };
      for (const word of lesson.vocab) words[word.id] = { ...word, day: lesson.day, course:lesson.course || 'legacy-v1' };
    }
    return { questions, words };
  }
  function event(input, course, now = Date.now()) {
    if (!input || typeof input !== 'object' || !/^[a-f0-9-]{36}$/i.test(input.id || '') || !Number.isFinite(input.at) || input.at < 0 || input.at > now + 300000) throw new Error('Mã hoặc thời điểm hoạt động không hợp lệ.');
    const { questions, words } = index(course);
    const e = { id: input.id, at: input.at, type: input.type };
    const scope = input.course || questions[input.question]?.course || words[input.item]?.course || questions[input.item]?.course || 'legacy-v1';
    const scoped = course.filter(l => (l.course || 'legacy-v1') === scope);
    if (!scoped.length) throw new Error('Phiên bản khóa học không hợp lệ.');
    e.course = scope;
    if (input.type === 'answer') {
      const q = questions[input.question];
      if (!q || q.course !== scope || typeof input.answer !== 'string' || input.answer.length > 500 || !/^[a-f0-9-]{36}$/i.test(input.run || '') || (input.assisted !== undefined && typeof input.assisted !== 'boolean')) throw new Error('Lượt trả lời không hợp lệ.');
      Object.assign(e, { question: q.id, run: input.run, answer: input.answer, correct: grade(q, input.answer), day: q.day, section: q.section, skill: q.skill });
      if (q.word) e.item = q.word;
      if (input.assisted) e.assisted = true;
      if (input.context !== undefined && !['lesson','review'].includes(input.context)) throw new Error('Ngữ cảnh trả lời không hợp lệ.');
      if (input.context === 'review') e.context = 'review';
    } else if (input.type === 'view') {
      if (!scoped.some(l => l.day === input.day) || !['intro', 'vocab', 'listen', 'practice', 'test', 'summary'].includes(input.step)) throw new Error('Vị trí học không hợp lệ.');
      Object.assign(e, { day: input.day, step: input.step });
    } else if (input.type === 'favorite' || input.type === 'rating') {
      if ((!words[input.item] && !questions[input.item]) || (words[input.item] || questions[input.item]).course !== scope) throw new Error('Nội dung ôn không hợp lệ.');
      e.item = input.item;
      if (input.type === 'favorite') { if (typeof input.value !== 'boolean' || !words[input.item]) throw new Error('Yêu thích không hợp lệ.'); e.value = input.value; }
      else { if (!['again', 'hard', 'good'].includes(input.value)) throw new Error('Mức nhớ không hợp lệ.'); e.value = input.value; }
    } else if (input.type === 'time') {
      if (!Number.isInteger(input.seconds) || input.seconds < 1 || input.seconds > 60 || !scoped.some(l => l.day === input.day)) throw new Error('Thời gian học không hợp lệ.');
      Object.assign(e, { seconds: input.seconds, day: input.day });
    } else if (input.type === 'reflection') {
      if (!scoped.some(l=>l.day===input.day) || !['checked','retry'].includes(input.value)) throw new Error('Tự đối chiếu không hợp lệ.');
      Object.assign(e,{day:input.day,value:input.value});
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
    const result = { resume: { day: 1, step: 'intro' }, favorites: dict(), reviews: dict(), runs: dict(), skills: dict(), daily: dict(), completed: [], finished:[], started:[], reflections:dict(), mistakes: dict(), seen: [], seconds: 0, attempts: 0, correct: 0, assisted:0, lastAnswer:0 };
    const answered = new Set();
    let timeEnd = 0;
    function schedule(item, value, at) {
      const old = result.reviews[item] || { level: -1, due: 0, value: 'again' };
      const level = value === 'again' ? 0 : value === 'hard' ? Math.max(0, old.level) : Math.min(3, old.level + 1);
      result.reviews[item] = { level, due: at + intervals[level] * 86400000, value };
    }
    const scope = course[0]?.course || 'legacy-v1';
    for (const stored of merge(events)) {
      const known = lookup.questions[stored.question];
      if ((stored.course || known?.course || 'legacy-v1') !== scope) continue;
      const e = known && stored.type==='answer' ? {...stored,correct:grade(known,stored.answer),skill:known.skill,day:known.day,section:known.section} : stored;
      if (e.type === 'view') { result.resume = { day: e.day, step: e.step }; if (!result.seen.includes(e.day)) result.seen.push(e.day); }
      if (e.type==='view' && e.step!=='intro' && !result.started.includes(e.day)) result.started.push(e.day);
      if (e.type==='reflection') result.reflections[e.day]=e.value;
      if (e.type === 'favorite') { result.favorites[e.item] = e.value; if(e.value && !result.reviews[e.item])schedule(e.item,'again',e.at); }
      if (e.type === 'rating') schedule(e.item, e.value, e.at);
      if (e.type === 'time') {
        const key = dateKey(e.at, timezone); result.daily[key] ||= { answers: 0, seconds: 0 };
        // Sum the union of active intervals, not the sum of each tab's timer.
        // Events are sorted by end time. Two tabs covering the same 30 seconds add 30.
        const from = Math.max(e.at - e.seconds * 1000, timeEnd);
        const addition = Math.max(0, e.at - from) / 1000;
        timeEnd = Math.max(timeEnd, e.at);
        result.seconds += addition; result.daily[key].seconds += addition;
      }
      if (e.type !== 'answer' || !lookup.questions[e.question]) continue;
      const key = `${e.run}:${e.question}`;
      if (answered.has(key)) continue;
      answered.add(key);
      const q = lookup.questions[e.question];
      if (!result.started.includes(e.day)) result.started.push(e.day);
      result.lastAnswer = Math.max(result.lastAnswer,e.at);
      result.attempts++; if (e.correct) result.correct++;
      const day = dateKey(e.at, timezone); result.daily[day] ||= { answers: 0, seconds: 0 }; result.daily[day].answers++;
      result.skills[e.skill] ||= { correct: 0, total: 0, assisted:0, uniqueQuestions:[] };
      if (e.assisted) { result.assisted++; result.skills[e.skill].assisted++; }
      else { result.skills[e.skill].total++; if(e.correct) result.skills[e.skill].correct++; if(!result.skills[e.skill].uniqueQuestions.includes(q.id))result.skills[e.skill].uniqueQuestions.push(q.id); }
      if (e.context !== 'review') {
        result.runs[e.run] ||= { day: e.day, at: e.at, answers: dict() };
        if (result.runs[e.run].day === e.day) result.runs[e.run].answers[q.id] = e;
      }
      result.mistakes[q.id] = !e.correct;
      schedule(q.id, e.correct && !e.assisted ? 'good' : 'again', e.at);
      if (e.item && lookup.words[e.item]) schedule(e.item, e.correct && !e.assisted ? 'good' : 'again', e.at);
    }
    for (const lesson of course) {
      const full = Object.values(result.runs).filter(run => run.day === lesson.day && lesson.practice.every(q => run.answers[q.id]) && lesson.test.every(q => run.answers[q.id]));
      if(full.length) result.finished.push(lesson.day);
      const passed = full.some(run => lesson.practice.filter(q => run.answers[q.id]?.correct && !run.answers[q.id].assisted).length >= Math.ceil(lesson.practice.length * .75) && lesson.test.filter(q => run.answers[q.id]?.correct && !run.answers[q.id].assisted).length >= Math.ceil(lesson.test.length * 2 / 3));
      if (passed) result.completed.push(lesson.day);
    }
    return result;
  }
  function sessionPlan(minutes=20) {
    const valid=[10,20,30].includes(minutes)?minutes:20;
    return {minutes:valid, questions:valid===10?3:valid===20?6:9, reviews:valid===10?3:valid===20?6:10, words:valid===10?3:valid===20?5:8};
  }
  function recommend(s, course, now=Date.now()) {
    const next=course.find(l=>!s.completed.includes(l.day));
    const active=s.started.includes(s.resume.day) && !s.completed.includes(s.resume.day);
    const wrong=Object.values(s.mistakes).filter(Boolean).length;
    const overdue=Object.values(s.reviews).filter(r=>r.due<=now).length;
    const returning=s.lastAnswer && now-s.lastAnswer>=4*86400000;
    if ((wrong>=3 || returning) && (wrong || overdue)) return {action:'review',reason:returning?'Bạn đã nghỉ ít nhất 4 ngày; nhớ lại vài mục trước khi học tiếp.':`${wrong} câu còn sai; ôn ngắn giúp sửa đúng chỗ.`,day:s.resume.day};
    if(active) return {action:'resume',day:s.resume.day,step:s.resume.step,reason:'Bài này đang dở; tiếp tục đúng phần đã lưu.'};
    if(next) return {action:'learn',day:next.day,step:'intro',reason:next.day===1?'Bắt đầu từ A–F, không cần biết tiếng Anh trước.':`Bài ${next.day-1} đã đạt; tiếp tục theo lộ trình.`};
    return {action:'review',day:course.at(-1).day,reason:'Bạn đã đạt các kiểm tra của khóa; giữ nhịp ôn theo lịch.'};
  }
  function reviewQueue(s, course, mode='due', limit=6, now=Date.now()) {
    const lookup=index(course);
    const ids=mode==='favorites'?Object.keys(s.favorites).filter(id=>s.favorites[id]):mode==='wrong'?Object.keys(s.mistakes).filter(id=>s.mistakes[id]):Object.keys(s.reviews).filter(id=>s.reviews[id].due<=now);
    return ids.filter(id=>lookup.questions[id]||lookup.words[id]).sort((a,b)=>Number(!!s.mistakes[b])-Number(!!s.mistakes[a]) || (s.reviews[a]?.due||0)-(s.reviews[b]?.due||0) || a.localeCompare(b)).slice(0,limit);
  }
  return { intervals, normalize, grade, dateKey, index, event, merge, state, sessionPlan, recommend, reviewQueue };
});
