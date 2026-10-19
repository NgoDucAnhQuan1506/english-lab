// Additive import only: never overwrite a cloud account or delete local data.
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
if (!process.env.DATABASE_URL || !process.argv[2]) {
  console.error('Đặt DATABASE_URL, rồi chạy: node migrate-to-postgres.js duong-dan/english-lab.sqlite'); process.exitCode = 1;
} else {
  const { store, ready } = require('./database');
  let source;
  (async () => { try {
    await ready;
    const filename = path.resolve(process.argv[2]); if (!fs.existsSync(filename)) throw new Error('Không tìm thấy tệp nguồn.');
    source = new DatabaseSync(filename, { readOnly: true });
    const users = source.prepare('SELECT * FROM users').all();
    const hasLessons = source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lessons'").get();
    const lessons = hasLessons ? source.prepare('SELECT * FROM lessons').all() : [];
    let added = 0, skipped = 0;
    await store.transaction(async () => {
      for (const user of users) {
        const existing = await store.get('SELECT id FROM users WHERE id = ? OR email = ?', user.id, user.email);
        if (existing) { skipped++; continue; }
        await store.run('INSERT INTO users (id, name, email, password, salt, progress, role, disabled, study) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', user.id, user.name, user.email, user.password, user.salt, user.progress, user.role || 'student', user.disabled || 0, user.study || '{"events":[]}'); added++;
      }
      for (const lesson of lessons) await store.run('INSERT INTO lessons (day, draft, published, version) VALUES (?, ?, ?, ?) ON CONFLICT(day) DO NOTHING', lesson.day, lesson.draft, lesson.published, lesson.version);
    });
    console.log(`Đã nhập ${added} tài khoản; bỏ qua ${skipped} tài khoản trùng ID/email. Không chuyển phiên đăng nhập. Nguồn SQLite giữ nguyên.`);
  } catch (error) { console.error('Không nhập được dữ liệu:', error.code || error.message); process.exitCode = 1; }
  finally { source?.close(); await store.close(); } })();
}
