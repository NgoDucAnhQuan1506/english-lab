// Run from the server terminal; no public HTTP endpoint can grant admin access.
const { db } = require('./server');
try {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email || process.argv.length !== 3) throw new Error('Cách dùng: node manage-admin.js email-da-dang-ky@example.com');
  const user = db.prepare('SELECT id, disabled FROM users WHERE email = ?').get(email);
  if (!user) throw new Error('Email chưa có tài khoản. Đăng ký trên web trước, sau đó chạy lại lệnh.');
  if (user.disabled) throw new Error('Tài khoản đang bị khóa. Hãy mở khóa trước khi cấp quyền quản trị.');
  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
  // Require a fresh login after the privilege change.
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
  console.log('Đã cấp quyền admin. Đăng nhập lại trên web để mở trang Quản trị.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { db.close(); }
