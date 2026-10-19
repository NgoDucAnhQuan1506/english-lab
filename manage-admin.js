// Run from the server terminal; no public HTTP endpoint can grant admin access.
const { store, ready } = require('./database');
(async () => { try {
  await ready;
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email || process.argv.length !== 3) throw new Error('Cách dùng: node manage-admin.js email-da-dang-ky@example.com');
  const user = await store.get('SELECT id, disabled FROM users WHERE email = ?', email);
  if (!user) throw new Error('Email chưa có tài khoản. Đăng ký trên web trước, sau đó chạy lại lệnh.');
  if (user.disabled) throw new Error('Tài khoản đang bị khóa. Hãy mở khóa trước khi cấp quyền quản trị.');
  await store.transaction(async () => {
    await store.run("UPDATE users SET role = 'admin' WHERE id = ?", user.id);
    await store.run('DELETE FROM sessions WHERE user_id = ?', user.id);
  });
  console.log('Đã cấp quyền admin. Đăng nhập lại trên web để mở trang Quản trị.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { await store.close(); } })();
