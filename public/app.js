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
let quizRound = 0;
const quizWords = [letters[0], letters[3], letters[14]];

const $ = (id) => document.getElementById(id);
const speak = (text) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.82;
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
  $('progressText').textContent = `${currentIndex + 1} / 26 chữ cái`;
  $('progressPercent').textContent = `${Math.round(((currentIndex + 1) / 26) * 100)}%`;
  $('progressBar').style.width = `${((currentIndex + 1) / 26) * 100}%`;
  document.querySelectorAll('.alphabet-card').forEach((card, index) => card.classList.toggle('selected', index === currentIndex));
}

function renderAlphabet() {
  $('alphabetGrid').innerHTML = letters.map((item, index) => `<button class="alphabet-card ${learned.has(index) ? 'learned' : ''} ${index === currentIndex ? 'selected' : ''}" data-index="${index}" aria-label="Chọn chữ ${item.letter}">${item.letter}</button>`).join('');
  document.querySelectorAll('.alphabet-card').forEach((card) => card.addEventListener('click', () => { currentIndex = Number(card.dataset.index); renderLetter(); }));
}

function renderQuiz() {
  const item = quizWords[quizRound];
  const wrongLetters = letters.filter((letter) => letter.letter !== item.letter).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [item, ...wrongLetters].sort(() => Math.random() - 0.5);
  $('quizWord').textContent = item.word;
  $('questionCount').textContent = `Câu ${quizRound + 1}/3`;
  $('feedback').textContent = 'Chọn một đáp án để kiểm tra nhé.';
  $('feedback').className = 'feedback';
  $('quizOptions').innerHTML = options.map((option) => `<button class="quiz-option" data-letter="${option.letter}">${option.letter}</button>`).join('');
  document.querySelectorAll('.quiz-option').forEach((button) => button.addEventListener('click', () => checkAnswer(button, item.letter)));
}

function checkAnswer(button, answer) {
  const isCorrect = button.dataset.letter === answer;
  document.querySelectorAll('.quiz-option').forEach((option) => { option.disabled = true; if (option.dataset.letter === answer) option.classList.add('correct'); });
  if (isCorrect) {
    learned.add(currentIndex);
    button.classList.add('correct');
    $('feedback').textContent = quizRound < 2 ? 'Chính xác! Bạn làm tốt lắm. Câu tiếp theo đang chờ.' : 'Tuyệt vời! Bạn đã hoàn thành phần luyện tập.';
    $('feedback').className = 'feedback success';
    quizRound = (quizRound + 1) % 3;
    setTimeout(renderQuiz, 850);
    renderAlphabet();
  } else {
    button.classList.add('wrong');
    $('feedback').textContent = `Gần đúng rồi. Đáp án là chữ ${answer}. Hãy thử lại nhé.`;
    $('feedback').className = 'feedback error';
    document.querySelectorAll('.quiz-option').forEach((option) => { if (option.dataset.letter !== answer) option.disabled = false; });
  }
}

$('prevButton').addEventListener('click', () => { currentIndex = (currentIndex + letters.length - 1) % letters.length; renderLetter(); });
$('nextButton').addEventListener('click', () => { learned.add(currentIndex); currentIndex = (currentIndex + 1) % letters.length; renderLetter(); renderAlphabet(); });
$('speakButton').addEventListener('click', () => speak(letters[currentIndex].letter));
$('wordSpeakButton').addEventListener('click', () => speak(letters[currentIndex].word));
$('favoriteButton').addEventListener('click', (event) => { event.currentTarget.classList.toggle('favorited'); event.currentTarget.textContent = event.currentTarget.classList.contains('favorited') ? '♥' : '♡'; });
$('resetQuizButton').addEventListener('click', () => { quizRound = 0; renderQuiz(); });
renderAlphabet();
renderLetter();
renderQuiz();
