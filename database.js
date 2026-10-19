const fs = require('node:fs');
const path = require('node:path');
const { AsyncLocalStorage } = require('node:async_hooks');
const context = new AsyncLocalStorage();
let db, pool;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, max: 5 });
} else {
  const { DatabaseSync } = require('node:sqlite');
  const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
  fs.mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(path.join(dir, 'english-lab.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
}
let queue = Promise.resolve();
async function query(sql, values = []) {
  if (pool) {
    let index = 0;
    const text = sql.replace(/\?/g, () => '$' + ++index);
    return (context.getStore() || pool).query(text, values);
  }
  const stmt = db.prepare(sql);
  if (/^\s*(SELECT|PRAGMA)/i.test(sql)) return { rows: stmt.all(...values) };
  return { rows: [], ...stmt.run(...values) };
}
const store = {
  async all(sql, ...values) { return (await query(sql, values)).rows; },
  async get(sql, ...values) { return (await query(sql, values)).rows[0]; },
  async run(sql, ...values) { return query(sql, values); },
  async transaction(work) {
    const execute = async () => {
      const client = pool ? await pool.connect() : null;
      const exec = sql => client ? client.query(sql) : db.exec(sql);
      try {
        await exec(pool ? 'BEGIN' : 'BEGIN IMMEDIATE');
        const result = await context.run(client, work);
        await exec('COMMIT');
        return result;
      } catch (error) { await exec('ROLLBACK'); throw error; }
      finally { client?.release(); }
    };
    // Serialize writes in this process; PostgreSQL also locks rows for other instances.
    const result = queue.then(execute);
    queue = result.catch(() => {});
    return result;
  },
  lock: pool ? ' FOR UPDATE' : '',
  persistent: !!pool || !!process.env.DATA_DIR,
  async close() { if (pool) await pool.end(); else db.close(); }
};
const ready = (async () => {
  await store.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, salt TEXT NOT NULL, progress TEXT NOT NULL)`);
  await store.run('CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires BIGINT NOT NULL)');
  const columns = pool ? (await store.all("SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'users'")) : await store.all('PRAGMA table_info(users)');
  for (const [name, definition] of [['role', "TEXT NOT NULL DEFAULT 'student'"], ['disabled', 'INTEGER NOT NULL DEFAULT 0'], ['study', "TEXT NOT NULL DEFAULT '{\"events\":[]}'"]]) {
    if (!columns.some(column => column.name === name)) await store.run(`ALTER TABLE users ADD COLUMN ${name} ${definition}`);
  }
  await store.run('CREATE TABLE IF NOT EXISTS lessons (day INTEGER PRIMARY KEY, draft TEXT, published TEXT, version INTEGER NOT NULL DEFAULT 0)');
})();
module.exports = { store, db, ready };
