const letters = [
  { letter: 'A', sound: '/eɪ/', word: 'Apple', meaning: 'Quả táo', emoji: '🍎' },
  { letter: 'B', sound: '/biː/', word: 'Ball', meaning: 'Quả bóng', emoji: '⚽' },
  { letter: 'C', sound: '/siː/', word: 'Cat', meaning: 'Con mèo', emoji: '🐱' },
  { letter: 'D', sound: '/diː/', word: 'Dog', meaning: 'Con chó', emoji: '🐶' },
  { letter: 'E', sound: '/iː/', word: 'Egg', meaning: 'Quả trứng', emoji: '🥚' },
  { letter: 'F', sound: '/ɛf/', word: 'Fish', meaning: 'Con cá', emoji: '🐟' },
  { letter: 'G', sound: '/dʒiː/', word: 'Grape', meaning: 'Quả nho', emoji: '🍇' },
  { letter: 'H', sound: '/eɪtʃ/', word: 'Hat', meaning: 'Cái mũ', emoji: '🧢' },
  { letter: 'I', sound: '/aɪ/', word: 'Ice cream', meaning: 'Kem', emoji: '🍦' },
  { letter: 'J', sound: '/dʒeɪ/', word: 'Juice', meaning: 'Nước ép', emoji: '🧃' },
  { letter: 'K', sound: '/keɪ/', word: 'Kite', meaning: 'Cánh diều', emoji: '🪁' },
  { letter: 'L', sound: '/ɛl/', word: 'Lion', meaning: 'Sư tử', emoji: '🦁' },
  { letter: 'M', sound: '/ɛm/', word: 'Moon', meaning: 'Mặt trăng', emoji: '🌙' },
  { letter: 'N', sound: '/ɛn/', word: 'Nose', meaning: 'Cái mũi', emoji: '👃' },
  { letter: 'O', sound: '/oʊ/', word: 'Orange', meaning: 'Quả cam', emoji: '🍊' },
  { letter: 'P', sound: '/piː/', word: 'Pencil', meaning: 'Bút chì', emoji: '✏️' },
  { letter: 'Q', sound: '/kjuː/', word: 'Queen', meaning: 'Nữ hoàng', emoji: '👑' },
  { letter: 'R', sound: '/ɑːr/', word: 'Rainbow', meaning: 'Cầu vồng', emoji: '🌈' },
  { letter: 'S', sound: '/ɛs/', word: 'Sun', meaning: 'Mặt trời', emoji: '☀️' },
  { letter: 'T', sound: '/tiː/', word: 'Tree', meaning: 'Cái cây', emoji: '🌳' },
  { letter: 'U', sound: '/juː/', word: 'Umbrella', meaning: 'Cái ô', emoji: '☂️' },
  { letter: 'V', sound: '/viː/', word: 'Violin', meaning: 'Đàn vĩ cầm', emoji: '🎻' },
  { letter: 'W', sound: '/ˈdʌbəl.juː/', word: 'Whale', meaning: 'Cá voi', emoji: '🐋' },
  { letter: 'X', sound: '/ɛks/', word: 'Xylophone', meaning: 'Đàn mộc cầm', emoji: '🎼' },
  { letter: 'Y', sound: '/waɪ/', word: 'Yellow', meaning: 'Màu vàng', emoji: '💛' },
  { letter: 'Z', sound: '/ziː/', word: 'Zebra', meaning: 'Ngựa vằn', emoji: '🦓' }
];

let currentIndex = 0;
let learned = new Set();
let favorites = new Set();
let quizRound = 0;
let quizTimer;
let quizLocked = false;
let currentUser = null;
let busy = false;
let registering = false;
let progress = emptyProgress();
const quizWords = [letters[0], letters[3], letters[14]];
const $ = id => document.getElementById(id);
function emptyProgress() { return { currentIndex: 0, learned: [], favorites: [], attempts: 0, correct: 0, days: [] }; }
async function api(route, data) {
  const response = await fetch(`/api/${route}`, { method: data === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error || 'Không thể thực hiện yêu cầu.'), { status: response.status });
  return result;
}
function setBusy(value) {
  busy = value;
  document.querySelectorAll('#lessonView button, .account-bar button, #dashboardView button, #authForm button, #closeAuth, .auth-tabs button').forEach(button => { button.disabled = value; });
}
function applyProgress(value) {
  progress = value;
  currentIndex = value.currentIndex;
  learned = new Set(value.learned);
  favorites = new Set(value.favorites);
  renderAlphabet(); renderLetter(); renderDashboard();
}
async function record(action, details) {
  if (busy) return false;
  setBusy(true);
  try {
    if (currentUser) {
      const result = await api('progress', { action, ...details });
      applyProgress(result.progress);
      $('saveStatus').textContent = 'Đã lưu tiến độ vào tài khoản.';
    } else {
      const value = structuredClone(progress);
      if (action === 'view') value.currentIndex = details.index;
      if (action === 'learn') value.learned = [...new Set([...value.learned, details.index])];
      if (action === 'favorite') value.favorites = value.favorites.includes(details.index) ? value.favorites.filter(n => n !== details.index) : [...value.favorites, details.index];
      if (action === 'answer') {
        value.attempts++;
        if (details.index === details.answer) { value.correct++; value.learned = [...new Set([...value.learned, details.index])]; }
      }
      applyProgress(value);
    }
    return true;
  } catch (error) {
    $('saveStatus').textContent = error.status === 401 ? 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục lưu.' : 'Chưa lưu được. Kiểm tra kết nối rồi thử lại thao tác.';
    if (error.status === 401) openAuth();
    return false;
  } finally { setBusy(false); }
}
const speak = text => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
};
function renderLetter() {
  const item = letters[currentIndex];
  $('letterTitle').textContent = `${item.letter} ${item.letter.toLowerCase()}`;
  $('bigLetter').textContent = item.letter;
  $('soundText').textContent = item.sound;
  $('wordEmoji').textContent = item.emoji;
  $('wordText').textContent = item.word;
  $('wordMeaning').textContent = item.meaning;
  $('cardCount').textContent = `${String(currentIndex + 1).padStart(2, '0')} / 26`;
  $('progressText').textContent = `${learned.size} / 26 chữ cái đã học`;
  $('progressPercent').textContent = `${Math.round(learned.size / 26 * 100)}%`;
  $('progressBar').style.width = `${learned.size / 26 * 100}%`;
  $('favoriteButton').classList.toggle('favorited', favorites.has(currentIndex));
  $('favoriteButton').textContent = favorites.has(currentIndex) ? '♥' : '♡';
  $('favoriteButton').setAttribute('aria-pressed', favorites.has(currentIndex));
}
function letterButton(index) {
  const button = document.createElement('button');
  button.className = `alphabet-card ${learned.has(index) ? 'learned' : ''} ${index === currentIndex ? 'selected' : ''}`;
  button.textContent = letters[index].letter;
  button.setAttribute('aria-label', `Học chữ ${letters[index].letter}${learned.has(index) ? ', đã học' : ''}`);
  button.addEventListener('click', async () => { if (await record('view', { index })) showView(false); });
  return button;
}
function renderAlphabet() { $('alphabetGrid').replaceChildren(...letters.map((_, index) => letterButton(index))); }
function renderQuiz() {
  clearTimeout(quizTimer);
  quizLocked = false;
  const item = quizWords[quizRound];
  const options = [item, ...letters.filter(letter => letter !== item).sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
  $('quizWord').textContent = item.word;
  $('questionCount').textContent = `Câu ${quizRound + 1}/3`;
  $('feedback').textContent = 'Chọn một đáp án để kiểm tra nhé.';
  $('feedback').className = 'feedback';
  $('quizOptions').replaceChildren(...options.map(option => {
    const button = document.createElement('button');
    button.className = 'quiz-option'; button.textContent = option.letter;
    button.addEventListener('click', () => checkAnswer(button, item.letter, option.letter));
    return button;
  }));
}
async function checkAnswer(button, answer, chosen) {
  if (busy || quizLocked) return;
  quizLocked = true;
  if (!await record('answer', { index: letters.findIndex(item => item.letter === answer), answer: letters.findIndex(item => item.letter === chosen) })) { quizLocked = false; return; }
  document.querySelectorAll('.quiz-option').forEach(option => { option.disabled = true; });
  const correct = chosen === answer;
  button.classList.add(correct ? 'correct' : 'wrong');
  $('feedback').className = `feedback ${correct ? 'success' : 'error'}`;
  $('feedback').textContent = correct ? 'Chính xác! Tiếp tục luyện tập nhé.' : `Đáp án đúng là ${answer}. Cùng thử câu tiếp theo nhé.`;
  quizRound = (quizRound + 1) % quizWords.length;
  quizTimer = setTimeout(renderQuiz, 1100);
}
function renderDashboard() {
  $('statLearned').textContent = `${learned.size} / 26`;
  $('statAccuracy').textContent = progress.attempts ? `${Math.round(progress.correct / progress.attempts * 100)}%` : '—';
  $('statAttempts').textContent = progress.attempts;
  $('statDays').textContent = progress.days.length;
  $('dashboardProgress').textContent = `${Math.round(learned.size / 26 * 100)}% hoàn thành · ${26 - learned.size} chữ cái chưa học. Chọn “Tiếp theo” sau khi học để đánh dấu hoàn thành.`;
  $('dashboardMeter').value = learned.size;
  $('favoriteEmpty').hidden = favorites.size > 0;
  $('favoriteLetters').replaceChildren(...[...favorites].sort((a, b) => a - b).map(letterButton));
  $('activityEmpty').hidden = progress.days.length > 0;
  $('activityList').replaceChildren(...progress.days.slice(-7).reverse().map(day => {
    const li = document.createElement('li');
    li.textContent = `${day.split('-').reverse().join('/')} · Đã học tập trên English Lab`;
    return li;
  }));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  let streak = 0;
  const day = new Date(`${today}T00:00:00Z`);
  if (!progress.days.includes(today)) day.setUTCDate(day.getUTCDate() - 1);
  while (progress.days.includes(day.toISOString().slice(0, 10))) { streak++; day.setUTCDate(day.getUTCDate() - 1); }
  document.querySelector('.streak b').textContent = `${streak} ngày`;
}
function showView(dashboard) {
  if (dashboard && !currentUser) { openAuth(); return; }
  $('dashboardView').hidden = !dashboard;
  $('lessonView').hidden = dashboard;
  $('lessonTab').setAttribute('aria-pressed', !dashboard);
  $('dashboardTab').setAttribute('aria-pressed', dashboard);
}
function updateAccount(user) {
  currentUser = user;
  clearTimeout(quizTimer); quizRound = 0;
  applyProgress(user?.progress || emptyProgress()); renderQuiz();
  $('accountName').textContent = user?.name || 'Học thử';
  $('profileName').textContent = user?.name || 'Khách';
  $('profileHint').textContent = user?.email || 'Đăng nhập để lưu tiến độ';
  $('profileAvatar').textContent = user ? user.name.slice(0, 2).toUpperCase() : 'TA';
  $('dashboardGreeting').textContent = user ? `Chào ${user.name}, đây là hành trình học của bạn.` : '';
  $('loginButton').hidden = !!user;
  $('logoutButton').hidden = !user;
  $('saveStatus').textContent = user ? 'Tiến độ được lưu tự động theo tài khoản.' : 'Đăng nhập để lưu và theo dõi tiến độ học. Tiến độ học thử chỉ có trong phiên này.';
  showView(!!user);
}
function authMode(signUp) {
  registering = signUp;
  $('nameField').hidden = !signUp; $('authName').required = signUp;
  $('authTitle').textContent = signUp ? 'Tạo tài khoản học tập' : 'Chào mừng trở lại';
  $('authSubmit').textContent = signUp ? 'Tạo tài khoản' : 'Đăng nhập';
  $('authPassword').autocomplete = signUp ? 'new-password' : 'current-password';
  $('signInTab').setAttribute('aria-pressed', !signUp); $('signUpTab').setAttribute('aria-pressed', signUp);
  $('authError').textContent = '';
}
function openAuth() { if (!$('authDialog').open) { authMode(false); $('authDialog').showModal(); } }
$('prevButton').addEventListener('click', () => record('view', { index: (currentIndex + 25) % 26 }));
$('nextButton').addEventListener('click', async () => { if (await record('learn', { index: currentIndex })) await record('view', { index: (currentIndex + 1) % 26 }); });
$('speakButton').addEventListener('click', () => speak(letters[currentIndex].letter));
$('wordSpeakButton').addEventListener('click', () => speak(letters[currentIndex].word));
$('favoriteButton').addEventListener('click', () => record('favorite', { index: currentIndex }));
$('resetQuizButton').addEventListener('click', () => { quizRound = 0; renderQuiz(); });
$('lessonTab').addEventListener('click', () => showView(false));
$('dashboardTab').addEventListener('click', () => showView(true));
$('continueButton').addEventListener('click', () => showView(false));
$('loginButton').addEventListener('click', openAuth);
$('closeAuth').addEventListener('click', () => $('authDialog').close());
$('authDialog').addEventListener('cancel', event => { if (busy) event.preventDefault(); });
$('signInTab').addEventListener('click', () => authMode(false));
$('signUpTab').addEventListener('click', () => authMode(true));
$('authForm').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  setBusy(true); $('authError').textContent = '';
  try {
    const result = await api(registering ? 'register' : 'login', { name: $('authName').value, email: $('authEmail').value, password: $('authPassword').value });
    updateAccount(result.user); $('authForm').reset(); $('authDialog').close();
  } catch (error) { $('authError').textContent = error.message; }
  finally { setBusy(false); }
});
$('logoutButton').addEventListener('click', async () => {
  if (busy) return; setBusy(true);
  try { await api('logout', {}); updateAccount(null); }
  catch (error) { if (error.status === 401) updateAccount(null); else $('saveStatus').textContent = 'Chưa đăng xuất được. Vui lòng thử lại.'; }
  finally { setBusy(false); }
});
async function init() {
  updateAccount(null); setBusy(true);
  try { const result = await api('me'); updateAccount(result.user); }
  catch (error) { if (error.status !== 401) $('saveStatus').textContent = 'Không kết nối được máy chủ. Tải lại trang để thử kết nối lại.'; }
  finally { setBusy(false); }
}
init();
