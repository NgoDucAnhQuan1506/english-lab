const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
let database;
try {
  if (process.argv.length !== 4) throw new Error('Cách dùng: node backup-sqlite.js data/english-lab.sqlite backups/english-lab.sqlite');
  const source = path.resolve(process.argv[2]), destination = path.resolve(process.argv[3]);
  if (!fs.existsSync(source)) throw new Error('Không tìm thấy database nguồn.');
  if (fs.existsSync(destination)) throw new Error('Tệp đích đã tồn tại; chọn tên mới để không ghi đè.');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  database = new DatabaseSync(source);
  database.prepare('VACUUM INTO ?').run(destination);
  console.log('Đã sao lưu SQLite nhất quán (gồm dữ liệu trong WAL).');
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { database?.close(); }
