// Optional real-browser smoke test. Uses an isolated database and browser profile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const candidates = [process.env.BROWSER_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean);
const binary = candidates.find(file => fs.existsSync(file));
if (!binary) throw new Error('Đặt BROWSER_PATH tới Chrome/Edge để chạy kiểm tra trình duyệt.');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'english-course-browser-'));
delete process.env.DATABASE_URL; delete process.env.ADMIN_EMAIL; process.env.NODE_ENV = 'development'; process.env.DATA_DIR = path.join(temporary, 'db');
const { server, store, ready } = require('./server');
let browser, socket;
const deadline = setTimeout(() => { console.error('Browser smoke timeout'); browser?.kill(); process.exit(1); }, 90000);
(async () => {
  await ready; await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = spawn(binary, ['--headless=new', '--no-sandbox', '--disable-extensions', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + path.join(temporary, 'profile'), 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => { let output = ''; browser.on('error', reject); browser.stderr.on('data', data => { output += data; const match = /DevTools listening on (ws:\/\/\S+)/.exec(output); if (match) resolve(match[1]); }); });
  const target = await (await fetch('http://' + new URL(endpoint).host + '/json/new?about:blank', { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0; const pending = new Map(), errors = [];
  function send(method, params = {}) {
    return new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 10000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params })); });
  }
  socket.addEventListener('message', message => {
    const data = JSON.parse(message.data), waiter = pending.get(data.id);
    if (waiter) { clearTimeout(waiter.timer); pending.delete(data.id); data.error ? waiter.reject(new Error(data.error.message)) : waiter.resolve(data.result); }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    if (data.method === 'Page.javascriptDialogOpening') void send('Page.handleJavaScriptDialog', { accept: true });
  });
  async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; }
  async function wait(expression) { for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 40)); } throw new Error('UI timeout: ' + expression + '\n' + JSON.stringify(errors)); }
  const clickText = text => evaluate(`[...document.querySelectorAll('#courseRoot button')].find(b=>b.textContent===${JSON.stringify(text)}).click()`);
  const step = label => evaluate(`[...document.querySelectorAll('.step-nav button')].find(b=>b.textContent.includes(${JSON.stringify(label)})).click()`);
  async function load() { await send('Page.navigate', { url: base }); await wait("typeof CourseUI !== 'undefined' && !document.querySelector('#loginButton').disabled && document.querySelector('#courseRoot h1')"); }
  const guestEvents = () => evaluate("JSON.parse(localStorage.getItem('englishlab.study.guest.v1')||'{}').events||[]");
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await load();
  await evaluate("CourseUI.show('roadmap')"); assert.equal(await evaluate("document.querySelectorAll('.roadmap-grid .study-card').length"), 30);
  await evaluate("document.querySelectorAll('.roadmap-grid .primary-button')[29].click()");
  assert.match(await evaluate("document.querySelector('#courseRoot h1').textContent"), /30/);
  await evaluate("CourseUI.show('roadmap');document.querySelector('.roadmap-grid .primary-button').click()");
  await step('5.'); assert.match(await evaluate("document.querySelector('#courseRoot').textContent"), /Chưa mở kiểm tra/);
  await step('2.'); await clickText('♡ Yêu thích');
  await evaluate("CourseUI.show('notebook'); document.querySelector('#courseRoot select').value='favorites'; document.querySelector('#courseRoot form').requestSubmit()");
  assert.match(await evaluate("document.querySelector('#courseRoot').textContent"), /apple/);
  await evaluate("CourseUI.show('roadmap');document.querySelector('.roadmap-grid .primary-button').click()"); await step('4.');
  await evaluate("(()=>{const n=document.querySelector('[data-question]');const q=Curriculum.lessons.flatMap(l=>l.practice).find(q=>q.id===n.dataset.question);if(q.type==='choice')[...n.querySelectorAll('.study-options button')].find(b=>b.textContent===q.answers[0]).click();else{n.querySelector('input').value=q.answers[0];n.querySelector('form').requestSubmit();}})()");
  assert.match(await evaluate("document.querySelector('.question-feedback').textContent"), /Đúng/);
  const before = (await guestEvents()).filter(e => e.type === 'answer').length;
  await evaluate("document.querySelector('[data-question] button').click()");
  assert.equal((await guestEvents()).filter(e => e.type === 'answer').length, before);
  await clickText('Câu tiếp theo →');
  await evaluate("(()=>{const n=document.querySelector('[data-question]');const q=Curriculum.lessons.flatMap(l=>l.practice).find(q=>q.id===n.dataset.question);if(q.type==='choice')[...n.querySelectorAll('.study-options button')].find(b=>b.textContent!==q.answers[0]).click();else{n.querySelector('input').value='not the expected answer';n.querySelector('form').requestSubmit();}})()");
  assert.match(await evaluate("document.querySelector('.question-feedback').textContent"), /Chưa đúng/);
  const saved = (await guestEvents()).length;
  await load(); assert((await guestEvents()).length >= saved);
  await evaluate("CourseUI.show('progress')"); assert.match(await evaluate("document.querySelector('#courseRoot').textContent"), /50%/);
  await evaluate("CourseUI.show('review')"); await clickText('Ôn câu sai'); assert(await evaluate("!!document.querySelector('[data-question]')"));
  // Finish the first lesson through the actual choice/text controls and final test.
  await evaluate("CourseUI.show('roadmap');document.querySelector('.roadmap-grid .primary-button').click()"); await step('4.');
  async function answerVisible() {
    await evaluate(`(() => {
      const node = document.querySelector('[data-question]');
      const q = Curriculum.lessons.flatMap(l=>[...l.practice,...l.test]).find(q=>q.id===node.dataset.question);
      if(q.type==='choice') [...node.querySelectorAll('.study-options button')].find(b=>b.textContent===q.answers[0]).click();
      else { node.querySelector('input').value=q.answers[0]; node.querySelector('form').requestSubmit(); }
    })()`);
    await clickText('Câu tiếp theo →');
  }
  for (let i = 0; i < 6; i++) await answerVisible();
  await clickText('Làm kiểm tra →');
  for (let i = 0; i < 3; i++) await answerVisible();
  await clickText('Xem tổng kết →');
  assert.match(await evaluate("document.querySelector('#courseRoot').textContent"), /✓ Đã đạt tiêu chí/);
  await evaluate("document.querySelector('#loginButton').click();document.querySelector('#signUpTab').click();document.querySelector('#authName').value='Course Tester';document.querySelector('#authEmail').value='course@example.com';document.querySelector('#authPassword').value='password123';document.querySelector('#authForm').requestSubmit()");
  await wait("currentUser && !document.querySelector('#logoutButton').disabled && document.querySelector('#courseRoot').textContent.includes('Hợp nhất vào tài khoản')");
  await clickText('Hợp nhất vào tài khoản');
  await wait("!localStorage.getItem('englishlab.study.guest.v1') && document.querySelector('#saveStatus').textContent.includes('Đã lưu')");
  const accountCount = await evaluate("api('study').then(result=>result.events.length)"); assert(accountCount >= saved);
  await evaluate("CourseUI.show('roadmap');document.querySelector('.roadmap-grid .primary-button').click()"); await step('2.');
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await clickText('♥ Đã yêu thích'); await wait("document.querySelector('#saveStatus').textContent.includes('thất bại')");
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await evaluate("document.querySelector('#saveStatus button').click()"); await wait("document.querySelector('#saveStatus').textContent.includes('Đã lưu')");
  assert((await evaluate("api('study').then(result=>result.events.length)")) > accountCount);
  await evaluate("CourseUI.show('today');document.querySelector('#themeButton').click()");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), 'light');
  await load(); assert.equal(await evaluate("document.documentElement.dataset.theme"), 'light');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (const page of ['today', 'roadmap', 'notebook', 'review', 'progress', 'account', 'alphabet']) { await evaluate(`CourseUI.show(${JSON.stringify(page)})`); assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Overflow: ' + page); }
  await evaluate("CourseUI.show('today');document.querySelector('#themeButton').click()");
  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); fs.writeFileSync(path.join(temporary, 'today-mobile.png'), Buffer.from(screenshot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const desktop = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); fs.writeFileSync(path.join(temporary, 'today-desktop.png'), Buffer.from(desktop.data, 'base64'));
  await evaluate("document.querySelector('#logoutButton').click()"); await wait("!currentUser && !document.querySelector('#loginButton').disabled");
  assert.equal(await evaluate("document.querySelector('#adminTab').hidden"), true);
  // Shell-free admin bootstrap and content editor, using a secret only in this isolated test.
  process.env.ADMIN_EMAIL = 'course@example.com'; process.env.ADMIN_SETUP_KEY = require('node:crypto').randomBytes(32).toString('hex');
  await evaluate("document.querySelector('#loginButton').click();document.querySelector('#authEmail').value='course@example.com';document.querySelector('#authPassword').value='password123';document.querySelector('#authForm').requestSubmit()");
  await wait("currentUser && !document.querySelector('#logoutButton').disabled");
  await evaluate("CourseUI.show('account')");
  await evaluate(`document.querySelector('#courseRoot details').open=true;document.querySelector('#courseRoot details input').value=${JSON.stringify(process.env.ADMIN_SETUP_KEY)};document.querySelector('#courseRoot details form').requestSubmit()`);
  await wait("currentUser?.role==='admin' && !document.querySelector('#adminTab').hidden");
  await evaluate("document.querySelector('#adminTab').click()"); await wait("document.querySelectorAll('#adminUsers tr').length===1 && !document.querySelector('#adminTab').disabled");
  await evaluate("CourseUI.show('account')"); await clickText('Biên tập nội dung bài học'); await clickText('Tải bài để sửa'); await wait("!!document.querySelector('#courseRoot textarea')");
  await evaluate("(()=>{const area=document.querySelector('#courseRoot textarea');const value=JSON.parse(area.value);value.title='Browser draft test';area.value=JSON.stringify(value)})()");
  await clickText('Kiểm tra và xem trước'); await clickText('Lưu nháp'); await wait("document.querySelector('#courseRoot').textContent.includes('Đã lưu nháp')");
  assert.notEqual(await evaluate("api('course').then(r=>r.lessons[0].title)"), 'Browser draft test');
  await clickText('Xuất bản'); await wait("document.querySelector('#courseRoot').textContent.includes('Đã xuất bản')");
  assert.equal(await evaluate("api('course').then(r=>r.lessons[0].title)"), 'Browser draft test');
  assert.deepEqual(errors, []);
  console.log('PASS: 30 lesson access, guest reload, grading, duplicate clicks, complete lesson/test, favorites, wrong-answer review, account merge, offline retry, theme persistence, seven mobile screens, logout, secure admin bootstrap, admin list and content draft/preview/publish.');
  console.log('Screenshots: ' + temporary);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { clearTimeout(deadline); socket?.close(); browser?.kill(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await store.close(); });
