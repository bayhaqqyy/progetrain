const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const root = document.documentElement;
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('kodekita-theme');
if (savedTheme) root.dataset.theme = savedTheme;
themeToggle.textContent = root.dataset.theme === 'dark' ? '☀' : '☾';

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('kodekita-theme', nextTheme);
  themeToggle.textContent = nextTheme === 'dark' ? '☀' : '☾';
  showToast(nextTheme === 'dark' ? 'Dark mode aktif 🌙' : 'Light mode aktif ☀️');
});

const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '×' : '☰';
});
$$('#navLinks a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
}));

const filters = $$('.filter');
const cards = $$('.course-card');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  cards.forEach(card => {
    card.classList.toggle('is-hidden', button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
  });
}));

const lessons = {
  HTML: {
    title: 'HTML: Struktur halaman',
    text: 'HTML (HyperText Markup Language) memberi struktur dan makna pada konten web melalui elemen seperti heading, paragraph, link, image, list, table, dan form.',
    code: '<main>\n  <h1>Halo, KodeKita!</h1>\n  <p>Aku belajar HTML.</p>\n</main>'
  },
  CSS: {
    title: 'CSS: Tampilan halaman',
    text: 'CSS (Cascading Style Sheets) mengatur warna, ukuran, jarak, posisi, layout, hingga tampilan responsif untuk berbagai ukuran layar.',
    code: '.card {\n  display: flex;\n  padding: 24px;\n  border-radius: 16px;\n}'
  },
  JavaScript: {
    title: 'JavaScript: Interaksi halaman',
    text: 'JavaScript memberi perilaku pada website. Kita bisa membaca input, merespons klik, mengubah DOM, melakukan validasi, dan menjalankan logika.',
    code: "button.addEventListener('click', () => {\n  alert('Halo, KodeKita!');\n});"
  }
};

let activeLesson = '';
const lessonPanel = $('#lessonPanel');
$$('.lesson-button').forEach(button => button.addEventListener('click', () => {
  activeLesson = button.dataset.lesson;
  const lesson = lessons[activeLesson];
  $('#lessonBadge').textContent = activeLesson;
  $('#lessonTitle').textContent = lesson.title;
  $('#lessonText').textContent = lesson.text;
  $('#lessonCode code').textContent = lesson.code;
  lessonPanel.hidden = false;
  lessonPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

const progressKey = 'kodekita-progress';
const completed = new Set(JSON.parse(localStorage.getItem(progressKey) || '[]'));
function updateProgress() {
  const percent = Math.round((completed.size / 3) * 100);
  $('#progressBar').style.width = `${percent}%`;
  $('#progressLabel').textContent = `${percent}%`;
  $('#progressMessage').textContent = completed.size === 3 ? 'Mantap! Semua learning path dasar sudah kamu selesaikan.' : `${completed.size} dari 3 materi ditandai selesai.`;
}
$('#completeLesson').addEventListener('click', () => {
  if (!activeLesson) return;
  completed.add(activeLesson);
  localStorage.setItem(progressKey, JSON.stringify([...completed]));
  updateProgress();
  showToast(`${activeLesson} ditandai selesai! 🎉`);
});
updateProgress();

const quizData = [
  { question: 'Tag HTML mana yang digunakan untuk membuat hyperlink?', options: ['<link>', '<a>', '<href>', '<nav>'], answer: 1 },
  { question: 'Properti CSS untuk mengubah warna teks adalah...', options: ['background', 'font-style', 'color', 'text-fill'], answer: 2 },
  { question: 'Metode JavaScript untuk memilih elemen berdasarkan CSS selector adalah...', options: ['querySelector()', 'getStyle()', 'selectElement()', 'findNode()'], answer: 0 },
  { question: 'Layout CSS dua dimensi yang cocok untuk baris dan kolom disebut...', options: ['Float', 'Position', 'Flexbox', 'Grid'], answer: 3 },
  { question: 'Event JavaScript yang umum digunakan saat tombol ditekan adalah...', options: ['hover', 'click', 'changeText', 'pressButton'], answer: 1 }
];
let currentQuestion = 0;
const quizAnswers = Array(quizData.length).fill(null);

function renderQuestion() {
  const item = quizData[currentQuestion];
  $('#questionCount').textContent = `Pertanyaan ${currentQuestion + 1} dari ${quizData.length}`;
  $('#questionDots').innerHTML = quizData.map((_, index) => `<span class="${index === currentQuestion ? 'active' : ''}"></span>`).join('');
  $('#quizContent').innerHTML = `<div class="quiz-question"><h3>${item.question}</h3>${item.options.map((option, index) => `<label class="option"><input type="radio" name="quizAnswer" value="${index}" ${quizAnswers[currentQuestion] === index ? 'checked' : ''}><span>${option.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</span></label>`).join('')}</div>`;
  $('#prevQuestion').disabled = currentQuestion === 0;
  $('#nextQuestion').textContent = currentQuestion === quizData.length - 1 ? 'Lihat hasil ✓' : 'Selanjutnya →';
  $('#quizResult').hidden = true;
  $$('input[name="quizAnswer"]', $('#quizContent')).forEach(input => input.addEventListener('change', event => { quizAnswers[currentQuestion] = Number(event.target.value); }));
}

$('#prevQuestion').addEventListener('click', () => { if (currentQuestion > 0) { currentQuestion--; renderQuestion(); } });
$('#nextQuestion').addEventListener('click', () => {
  if (quizAnswers[currentQuestion] === null) { showToast('Pilih satu jawaban dulu ya.'); return; }
  if (currentQuestion < quizData.length - 1) { currentQuestion++; renderQuestion(); return; }
  const score = quizAnswers.reduce((total, answer, index) => total + (answer === quizData[index].answer ? 1 : 0), 0);
  const percent = score * 20;
  const result = $('#quizResult');
  result.hidden = false;
  result.innerHTML = `<strong>${percent}/100</strong>${score === 5 ? 'Perfect! Fondasi kamu sudah kuat. 🔥' : score >= 3 ? 'Bagus! Tinggal sedikit latihan lagi.' : 'Yuk baca ulang materinya lalu coba lagi.'}`;
});
renderQuestion();

const feedbackForm = $('#feedbackForm');
feedbackForm.addEventListener('submit', event => {
  event.preventDefault();
  $$('.field-error', feedbackForm).forEach(field => field.classList.remove('field-error'));
  const message = $('#formMessage');
  const requiredFields = $$('[required]', feedbackForm);
  let isValid = true;
  requiredFields.forEach(field => {
    const valid = field.type === 'radio' ? !!$(`input[name="${field.name}"]:checked`, feedbackForm) : field.type === 'checkbox' ? field.checked : field.checkValidity();
    if (!valid) { field.classList.add('field-error'); isValid = false; }
  });
  if (!isValid) {
    message.textContent = 'Lengkapi semua data dengan format yang benar.';
    message.className = 'form-message error';
    return;
  }
  message.textContent = `Terima kasih, ${feedbackForm.elements.name.value}! Feedback kamu berhasil dicatat. ✓`;
  message.className = 'form-message';
  feedbackForm.reset();
  showToast('Feedback berhasil dikirim! 💙');
});

let toastTimer;
function showToast(text) {
  const toast = $('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .08 });
$$('.reveal').forEach(element => observer.observe(element));

$('#year').textContent = new Date().getFullYear();
