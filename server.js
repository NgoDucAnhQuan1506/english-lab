const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');
const scrypt = promisify(crypto.scrypt);
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'english-lab.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, salt TEXT NOT NULL, progress TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);`);
const initialProgress = () => ({ currentIndex: 0, learned: [], favorites: [], attempts: 0, correct: 0, days: [] });
const publicDir = path.join(__dirname, 'public');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');
const expose = user => ({ id: user.id, name: user.name, email: user.email, progress: JSON.parse(user.progress) });
const failures = new Map();
const dummySalt = crypto.randomBytes(16).toString('hex');
function sessionUser(req) {
  const token = /(?:^|;\s*)session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return null;
  return db.prepare('SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE token = ? AND expires > ?').get(tokenHash(token), Date.now());
}
function cookie(token, age) {
  return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
function startSession(user, res) {
  db.prepare('DELETE FROM sessions WHERE expires <= ?').run(Date.now());
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(tokenHash(token), user.id, Date.now() + 7 * 86400000);
  res.setHeader('Set-Cookie', cookie(token, 7 * 86400));
}
async function body(req) {
  let value = '';
  for await (const chunk of req) {
    value += chunk;
    if (Buffer.byteLength(value) > 16384) reject('Dữ liệu quá lớn.', 413);
  }
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) reject('Dữ liệu không hợp lệ.');
    return parsed;
  } catch { reject('Dữ liệu không hợp lệ.'); }
}
function reject(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date()); }
const server = http.createServer(async (req, res) => {
  const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      if (!['GET', 'POST'].includes(req.method)) return json(405, { error: 'Phương thức không hỗ trợ.' });
      if (req.method === 'POST') {
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) reject('Yêu cầu không hợp lệ.', 403);
        if (!req.headers['content-type']?.startsWith('application/json')) reject('Cần dữ liệu JSON.', 415);
      }
      if (['/api/register', '/api/login'].includes(url.pathname) && req.method === 'POST') {
        const key = req.socket.remoteAddress;
        const now = Date.now();
        for (const [ip, entry] of failures) if (entry.until < now) failures.delete(ip);
        const rate = failures.get(key) || { count: 0, until: now + 15 * 60000 };
        if (++rate.count > 30) reject('Bạn thử quá nhiều lần. Vui lòng chờ 15 phút.', 429);
        failures.set(key, rate);
        const input = await body(req);
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof input.password !== 'string' || input.password.length < 8 || input.password.length > 128) reject('Nhập email hợp lệ và mật khẩu từ 8–128 ký tự.');
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (url.pathname === '/api/register') {
          const name = typeof input.name === 'string' ? input.name.trim() : '';
          if (!name || name.length > 60) reject('Tên cần từ 1–60 ký tự.');
          if (user) reject('Email này đã được đăng ký.', 409);
          const salt = crypto.randomBytes(16).toString('hex');
          const password = (await scrypt(input.password, salt, 64)).toString('hex');
          try { db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)').run(crypto.randomUUID(), name, email, password, salt, JSON.stringify(initialProgress())); }
          catch (error) { if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) reject('Email này đã được đăng ký.', 409); throw error; }
          user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        } else {
          const hash = await scrypt(input.password, user?.salt || dummySalt, 64);
          if (!user || !crypto.timingSafeEqual(hash, Buffer.from(user.password, 'hex'))) reject('Email hoặc mật khẩu chưa đúng.', 401);
        }
        startSession(user, res);
        return json(200, { user: expose(user) });
      }
      const user = sessionUser(req);
      if (!user) reject('Vui lòng đăng nhập để tiếp tục.', 401);
      if (url.pathname === '/api/me' && req.method === 'GET') return json(200, { user: expose(user) });
      if (url.pathname === '/api/logout' && req.method === 'POST') {
        const token = /(?:^|;\s*)session=([a-f0-9]{64})/.exec(req.headers.cookie || '')?.[1];
        if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(tokenHash(token));
        res.setHeader('Set-Cookie', cookie('', 0));
        return json(200, { ok: true });
      }
      if (url.pathname === '/api/progress' && req.method === 'POST') {
        const input = await body(req);
        const freshUser = sessionUser(req);
        if (!freshUser) reject('Vui lòng đăng nhập để tiếp tục.', 401);
        const progress = JSON.parse(freshUser.progress);
        const validIndex = n => Number.isInteger(n) && n >= 0 && n < 26;
        if (input.action === 'view' && validIndex(input.index)) progress.currentIndex = input.index;
        else if (input.action === 'learn' && validIndex(input.index)) progress.learned = [...new Set([...progress.learned, input.index])];
        else if (input.action === 'favorite' && validIndex(input.index)) progress.favorites = progress.favorites.includes(input.index) ? progress.favorites.filter(n => n !== input.index) : [...progress.favorites, input.index];
        else if (input.action === 'answer' && [0, 3, 14].includes(input.index) && validIndex(input.answer)) {
          progress.attempts++;
          if (input.index === input.answer) { progress.correct++; progress.learned = [...new Set([...progress.learned, input.index])]; }
        } else reject('Thao tác không hợp lệ.');
        progress.days = [...new Set([...progress.days, today()])];
        db.prepare('UPDATE users SET progress = ? WHERE id = ?').run(JSON.stringify(progress), user.id);
        return json(200, { progress });
      }
      return json(404, { error: 'Không tìm thấy chức năng.' });
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const file = path.resolve(publicDir, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(publicDir + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      res.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : error ? 'Not found' : data);
    });
  } catch (error) {
    if (!error.status) console.error(error);
    json(error.status || 500, { error: error.status ? error.message : 'Máy chủ gặp lỗi. Vui lòng thử lại.' });
  }
});
if (require.main === module) server.listen(process.env.PORT || 3000, () => console.log(`English Lab: http://localhost:${process.env.PORT || 3000}`));
module.exports = { server, db };
