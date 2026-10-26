const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { store, db, ready } = require('./database');
const Curriculum = require('./public/curriculum');
const FoundationBase = require('./public/foundation');
const Method = require('./public/course-method');
const Foundation = {...FoundationBase,lessons:Method.lessons};
const Engine = require('./public/study-engine');
const scrypt = promisify(crypto.scrypt);
const initialProgress = () => ({ currentIndex: 0, learned: [], favorites: [], attempts: 0, correct: 0, days: [], viewed: [], letterScores: {}, answerIds: [] });
const publicDir = path.join(__dirname, 'public');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');
const expose = user => ({ id: user.id, name: user.name, email: user.email, role: user.role, disabled: !!user.disabled, progress: JSON.parse(user.progress) });
const failures = new Map();
const dummySalt = crypto.randomBytes(16).toString('hex');
function reject(message, status = 400) { throw Object.assign(new Error(message), { status }); }
async function sessionUser(req) {
  const token = /(?:^|;\s*)session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  return token ? store.get('SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE token = ? AND expires > ? AND users.disabled = 0', tokenHash(token), Date.now()) : null;
}
function cookie(token, age) { return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
async function startSession(user, res) {
  await store.run('DELETE FROM sessions WHERE expires <= ?', Date.now());
  const token = crypto.randomBytes(32).toString('hex');
  await store.run('INSERT INTO sessions VALUES (?, ?, ?)', tokenHash(token), user.id, Date.now() + 7 * 86400000);
  res.setHeader('Set-Cookie', cookie(token, 7 * 86400));
}
async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 2000000) reject('Dữ liệu quá lớn.', 413); chunks.push(chunk); }
  try { const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) reject('Dữ liệu không hợp lệ.'); return parsed; }
  catch { reject('Dữ liệu không hợp lệ.'); }
}
function rateLimit(req) {
  const now = Date.now(); for (const [key, item] of failures) if (item.until < now) failures.delete(key);
  const key = req.socket.remoteAddress, item = failures.get(key) || { count: 0, until: now + 15 * 60000 };
  if (++item.count > 30) reject('Bạn thử quá nhiều lần. Vui lòng chờ 15 phút.', 429); failures.set(key, item);
}
async function course() {
  const overrides = await store.all('SELECT day, published FROM lessons WHERE published IS NOT NULL');
  return Curriculum.lessons.map(lesson => { const found = overrides.find(row => row.day === lesson.day); return found ? JSON.parse(found.published) : lesson; });
}
function canPersist() { if (process.env.NODE_ENV === 'production' && !store.persistent) reject('Máy chủ chưa cấu hình DATABASE_URL hoặc DATA_DIR bền vững. Bạn vẫn có thể học ở chế độ khách.', 503); }
const server = http.createServer(async (req, res) => {
  const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(value)); };
  try {
    await ready;
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      if (!['GET', 'POST'].includes(req.method)) return json(405, { error: 'Phương thức không hỗ trợ.' });
      if (req.method === 'POST') {
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) reject('Yêu cầu không hợp lệ.', 403);
        if (!req.headers['content-type']?.startsWith('application/json')) reject('Cần dữ liệu JSON.', 415);
      }
      if (url.pathname === '/api/settings' && req.method === 'GET') return json(200,{courseEdition:process.env.COURSE_EDITION==='legacy-v1'?'legacy-v1':Foundation.version});
      if (url.pathname === '/api/course' && req.method === 'GET') {
        const version=url.searchParams.get('version') || 'legacy-v1';
        if (!['legacy-v1',Foundation.version].includes(version)) reject('Không có phiên bản khóa học này.',404);
        return json(200, { version, lessons:version===Foundation.version?Foundation.lessons:await course(), storage: store.persistent ? 'configured' : 'local-only' });
      }
      if (['/api/register', '/api/login'].includes(url.pathname) && req.method === 'POST') {
        canPersist(); rateLimit(req);
        const input = await body(req);
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof input.password !== 'string' || input.password.length < 8 || input.password.length > 128) reject('Nhập email hợp lệ và mật khẩu từ 8–128 ký tự.');
        let user = await store.get('SELECT * FROM users WHERE email = ?', email);
        if (url.pathname === '/api/register') {
          const name = typeof input.name === 'string' ? input.name.trim() : '';
          if (!name || name.length > 60) reject('Tên cần từ 1–60 ký tự.');
          if (user) reject('Email này đã được đăng ký.', 409);
          const salt = crypto.randomBytes(16).toString('hex'), password = (await scrypt(input.password, salt, 64)).toString('hex');
          try { await store.run('INSERT INTO users (id, name, email, password, salt, progress) VALUES (?, ?, ?, ?, ?, ?)', crypto.randomUUID(), name, email, password, salt, JSON.stringify(initialProgress())); }
          catch (error) { if (await store.get('SELECT id FROM users WHERE email = ?', email)) reject('Email này đã được đăng ký.', 409); throw error; }
          user = await store.get('SELECT * FROM users WHERE email = ?', email);
        } else {
          const hash = await scrypt(input.password, user?.salt || dummySalt, 64);
          if (!user || !crypto.timingSafeEqual(hash, Buffer.from(user.password, 'hex'))) reject('Email hoặc mật khẩu chưa đúng.', 401);
        }
        user = await store.transaction(async () => {
          const fresh = await store.get('SELECT * FROM users WHERE id = ?' + store.lock, user.id);
          if (!fresh || fresh.disabled) reject('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
          await startSession(fresh, res); return fresh;
        });
        return json(200, { user: expose(user) });
      }
      const user = await sessionUser(req);
      if (!user) reject('Vui lòng đăng nhập để tiếp tục.', 401);
      canPersist();
      if (url.pathname === '/api/bootstrap-admin' && req.method === 'POST') {
        rateLimit(req);
        const input = await body(req);
        const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase(), secret = process.env.ADMIN_SETUP_KEY || '';
        if (secret.length < 32 || user.email !== email || typeof input.key !== 'string' || input.key.length > 256 || !crypto.timingSafeEqual(Buffer.from(tokenHash(input.key), 'hex'), Buffer.from(tokenHash(secret), 'hex'))) reject('Email hoặc mã cấp quyền không hợp lệ, hoặc máy chủ chưa bật thiết lập quản trị.', 403);
        const promoted = await store.transaction(async () => {
          const actor = await sessionUser(req); if (!actor || actor.email !== email) reject('Phiên đăng nhập đã hết hạn.', 401);
          await store.run("UPDATE users SET role = 'admin' WHERE id = ?", actor.id);
          await store.run('DELETE FROM sessions WHERE user_id = ?', actor.id);
          actor.role = 'admin'; await startSession(actor, res); return actor;
        });
        return json(200, { user: expose(promoted) });
      }
      if (url.pathname === '/api/me' && req.method === 'GET') return json(200, { user: expose(user) });
      if (url.pathname === '/api/logout' && req.method === 'POST') {
        const token = /(?:^|;\s*)session=([a-f0-9]{64})/.exec(req.headers.cookie || '')?.[1];
        if (token) await store.run('DELETE FROM sessions WHERE token = ?', tokenHash(token));
        res.setHeader('Set-Cookie', cookie('', 0)); return json(200, { ok: true });
      }
      if (url.pathname === '/api/study' && req.method === 'GET') return json(200, { events: JSON.parse(user.study).events });
      if (url.pathname === '/api/study' && req.method === 'POST') {
        const input = await body(req);
        if (!Array.isArray(input.events) || input.events.length > 1000) reject('Mỗi lần lưu tối đa 1000 hoạt động.');
        const lessons = [...await course(),...Foundation.lessons];
        let events;
        try { events = input.events.map(e => Engine.event(e, lessons)); } catch (error) { reject(error.message); }
        const merged = await store.transaction(async () => {
          const actor = await sessionUser(req); if (!actor) reject('Phiên đăng nhập đã hết hạn.', 401);
          const fresh = await store.get('SELECT study FROM users WHERE id = ?' + store.lock, actor.id);
          const all = Engine.merge(JSON.parse(fresh.study).events, events);
          if (all.length > 50000) reject('Nhật ký đã đạt giới hạn 50.000 hoạt động. Liên hệ quản trị để lưu trữ lịch sử.', 413);
          await store.run('UPDATE users SET study = ? WHERE id = ?', JSON.stringify({ events: all }), actor.id); return all;
        });
        return json(200, { events: merged });
      }
      if (url.pathname.startsWith('/api/admin/')) {
        if (user.role !== 'admin') reject('Bạn không có quyền quản trị.', 403);
        if (url.pathname === '/api/admin/users' && req.method === 'GET') {
          const q = (url.searchParams.get('q') || '').trim().toLowerCase(), status = url.searchParams.get('status') || 'all', page = Number(url.searchParams.get('page') || 1);
          if (q.length > 100 || !['all', 'active', 'disabled'].includes(status) || !Number.isSafeInteger(page) || page < 1 || page > 1000000) reject('Bộ lọc không hợp lệ.');
          const all = await store.all('SELECT * FROM users');
          const found = all.filter(row => (row.name.toLowerCase().includes(q) || row.email.includes(q)) && (status === 'all' || !!row.disabled === (status === 'disabled'))).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
          const lessons = Foundation.lessons;
          const mapped = found.slice((page - 1) * 20, page * 20).map(row => ({ ...expose(row), studySummary: summarize(row, lessons) }));
          return json(200, { users: mapped, total: found.length, page, pageSize: 20, stats: { total: all.length, admins: all.filter(u => u.role === 'admin').length, disabled: all.filter(u => u.disabled).length, completed: all.filter(u => Engine.state(JSON.parse(u.study).events, lessons).completed.length === lessons.length).length } });
        }
        const contentMatch = /^\/api\/admin\/lessons\/(\d+)$/.exec(url.pathname);
        if (contentMatch) {
          const day = Number(contentMatch[1]); if (day < 1 || day > 30) reject('Ngày không hợp lệ.');
          const existing = await store.get('SELECT * FROM lessons WHERE day = ?', day);
          if (req.method === 'GET') return json(200, { lesson: JSON.parse(existing?.draft || existing?.published || JSON.stringify(Curriculum.lessons[day - 1])), version: existing?.version || 0 });
          const input = await body(req);
          const actor = await sessionUser(req); if (actor?.role !== 'admin') reject('Bạn không có quyền quản trị.', 403);
          let errors; try { errors = Curriculum.validate(input.lesson); } catch { reject('Cấu trúc bài học không hợp lệ.'); }
          if (input.lesson?.day !== day) errors.push('Ngày trong nội dung không khớp.');
          // The archived edition has no destructive content migration. Editing explanations
          // or headings is safe; changing a question's meaning needs a new edition/ID.
          const previous=JSON.parse(existing?.published || JSON.stringify(Curriculum.lessons[day-1]));
          const semantics=q=>JSON.stringify([q.id,q.type,q.prompt,q.answers,q.options,q.audio,q.caseSensitive,q.skill,q.word]);
          if (['practice','test'].some(section=>JSON.stringify((previous[section]||[]).map(semantics))!==JSON.stringify((input.lesson?.[section]||[]).map(semantics)))) errors.push('Khóa cũ đã lưu lịch sử: không thay câu hỏi/đáp án hoặc ID đã dùng. Tạo phiên bản mới trong mã nguồn.');
          if (JSON.stringify(previous.vocab.map(v=>[v.id,v.term,v.meaning]))!==JSON.stringify((input.lesson?.vocab||[]).map(v=>[v.id,v.term,v.meaning]))) errors.push('Không đổi ý nghĩa ID từ trong khóa cũ.');
          if (!['draft', 'publish'].includes(input.action)) errors.push('Chọn lưu nháp hoặc xuất bản.');
          if (errors.length) return json(400, { error: errors.join(' '), errors });
          await store.transaction(async () => {
            const row = await store.get('SELECT * FROM lessons WHERE day = ?' + store.lock, day);
            if ((row?.version || 0) !== input.version) reject('Bài đã được sửa ở nơi khác. Tải lại trước khi lưu.', 409);
            await store.run('INSERT INTO lessons (day, draft, published, version) VALUES (?, ?, ?, ?) ON CONFLICT(day) DO UPDATE SET draft = excluded.draft, published = excluded.published, version = excluded.version', day, JSON.stringify(input.lesson), input.action === 'publish' ? JSON.stringify(input.lesson) : row?.published || null, input.version + 1);
          });
          return json(200, { ok: true, version: input.version + 1 });
        }
        const match = /^\/api\/admin\/users\/([a-f0-9-]+)(\/status)?$/.exec(url.pathname);
        if (match && !match[2] && req.method === 'GET') {
          const target = await store.get('SELECT * FROM users WHERE id = ?', match[1]); if (!target) reject('Không tìm thấy người dùng.', 404);
          return json(200, { user: { ...expose(target), studySummary: summarize(target, Foundation.lessons) } });
        }
        if (match?.[2] && req.method === 'POST') {
          const input = await body(req); if (typeof input.disabled !== 'boolean') reject('Trạng thái không hợp lệ.');
          const target = await store.transaction(async () => {
            const actor = await sessionUser(req); if (actor?.role !== 'admin') reject('Bạn không có quyền quản trị.', 403);
            const row = await store.get('SELECT * FROM users WHERE id = ?' + store.lock, match[1]); if (!row) reject('Không tìm thấy người dùng.', 404);
            if (row.id === actor.id || row.role === 'admin') reject('Không thể khóa hoặc thay đổi trạng thái tài khoản quản trị.', 403);
            await store.run('UPDATE users SET disabled = ? WHERE id = ?', input.disabled ? 1 : 0, row.id);
            if (input.disabled) await store.run('DELETE FROM sessions WHERE user_id = ?', row.id);
            return { ...row, disabled: input.disabled };
          });
          return json(200, { user: expose(target) });
        }
        return json(404, { error: 'Không tìm thấy chức năng quản trị.' });
      }
      if (url.pathname === '/api/progress' && req.method === 'POST') {
        const input = await body(req);
        const progress = await store.transaction(async () => {
          if (!await sessionUser(req)) reject('Phiên đăng nhập đã hết hạn.', 401);
          const fresh = await store.get('SELECT progress FROM users WHERE id = ?' + store.lock, user.id);
          const p = { ...initialProgress(), ...JSON.parse(fresh.progress) };
          const valid = n => Number.isInteger(n) && n >= 0 && n < 26;
          if (input.action === 'view' && valid(input.index)) { p.currentIndex = input.index; p.viewed = [...new Set([...p.viewed, input.index])]; }
          else if (input.action === 'learn' && valid(input.index)) p.viewed = [...new Set([...p.viewed, input.index])];
          else if (input.action === 'favorite' && valid(input.index)) p.favorites = p.favorites.includes(input.index) ? p.favorites.filter(n => n !== input.index) : [...p.favorites, input.index];
          else if (input.action === 'answer' && valid(input.index) && valid(input.answer)) {
            const id = input.id || crypto.randomUUID();
            if (!p.answerIds.includes(id)) {
              p.answerIds.push(id); p.attempts++;
              if (input.index === input.answer) { p.correct++; p.letterScores[input.index] = (p.letterScores[input.index] || 0) + 1; if (p.letterScores[input.index] >= 2) p.learned = [...new Set([...p.learned, input.index])]; }
              const day = Engine.dateKey(Date.now()); p.days = [...new Set([...p.days, day])];
            }
          } else reject('Thao tác không hợp lệ.');
          await store.run('UPDATE users SET progress = ? WHERE id = ?', JSON.stringify(p), user.id); return p;
        });
        return json(200, { progress });
      }
      return json(404, { error: 'Không tìm thấy chức năng.' });
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const file = path.resolve(publicDir, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(publicDir + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => { res.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); res.end(req.method === 'HEAD' ? undefined : error ? 'Not found' : data); });
  } catch (error) {
    if (!error.status) console.error('Request failed:', error.code || error.name);
    json(error.status || 500, { error: error.status ? error.message : 'Máy chủ gặp lỗi. Vui lòng thử lại.' });
  }
});
function summarize(user, lessons) {
  const state = Engine.state(JSON.parse(user.study).events, lessons);
  return { completed: state.completed.length, attempts: state.attempts, correct: state.correct, seconds: state.seconds, days: Object.keys(state.daily).length, skills: state.skills, resume: state.resume };
}
if (require.main === module) ready.then(() => server.listen(process.env.PORT || 3000, () => console.log(`English Lab: http://localhost:${process.env.PORT || 3000}`))).catch(() => { console.error('Không kết nối được database; kiểm tra cấu hình.'); process.exitCode = 1; });
module.exports = { server, db, store, ready };
