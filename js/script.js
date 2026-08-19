/* =========================================================
   Tanuljunk Magyarul! — shared interactivity
   No build tools, no dependencies: plain JS for GitHub Pages.
   ========================================================= */

/* ---------- Hungarian pronunciation ----------
   Two ways a tile can be "spoken":
   1. A real recorded mp3 (data-audio="audio/abc/á.mp3") — always
      preferred, since it's an actual human voice.
   2. The browser's built-in Web Speech API as a fallback, for any
      word that doesn't have a recording yet. Many browsers don't
      ship a Hungarian voice, so this fails silently and the printed
      word is still there to read — audio is a bonus, not a
      requirement. */
function speakHungarian(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hu-HU';
    utter.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const huVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hu'));
    if (huVoice) utter.voice = huVoice;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    /* silently ignore — not every browser supports this */
  }
}

/* Plays a recorded mp3 if one is given; falls back to the
   browser's spoken-word guess if the file is missing or the
   audio fails to load (e.g. a typo in the filename).

   Accented filenames (á, é, ő...) can be stored on disk in two
   different but visually-identical Unicode forms — precomposed
   (NFC) or decomposed (NFD) — and the browser doesn't always
   percent-encode them correctly on its own when building the
   request. So we try both Unicode forms, AND make sure each one
   is explicitly percent-encoded (encodeURIComponent) before
   asking the browser to fetch it, and only fall back to spoken
   text if every combination fails. */
function playPronunciation(word, audioPath) {
  if (!audioPath) {
    if (word) speakHungarian(word);
    return;
  }

  const folder = audioPath.substring(0, audioPath.lastIndexOf('/') + 1);
  const filename = audioPath.substring(audioPath.lastIndexOf('/') + 1);

  const nameForms = [filename];
  try {
    const nfc = filename.normalize('NFC');
    const nfd = filename.normalize('NFD');
    if (!nameForms.includes(nfc)) nameForms.push(nfc);
    if (!nameForms.includes(nfd)) nameForms.push(nfd);
  } catch (e) {
    /* normalize() unsupported — just use the one form we have */
  }

  const candidates = [];
  nameForms.forEach(name => {
    const encoded = folder + encodeURIComponent(name);
    const raw = folder + name;
    if (!candidates.includes(encoded)) candidates.push(encoded);
    if (!candidates.includes(raw)) candidates.push(raw);
  });

  tryAudioCandidates(candidates, 0, word);
}

function tryAudioCandidates(paths, index, word) {
  if (index >= paths.length) {
    if (word) speakHungarian(word);
    return;
  }
  const player = new Audio(paths[index]);
  player.addEventListener('error', () => tryAudioCandidates(paths, index + 1, word), { once: true });
  player.play().catch(() => {
    /* play() can reject for reasons unrelated to a missing file
       (e.g. a very fast double-click); the 'error' listener above
       is what actually detects a genuinely missing file. */
  });
}

/* ---------- Tiles: click to reveal English + hear the word ---------- */
function initTiles() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    const word = tile.dataset.word;
    const audioPath = tile.dataset.audio;
    tile.addEventListener('click', () => {
      tile.classList.toggle('revealed');
      tile.classList.add('playing');
      setTimeout(() => tile.classList.remove('playing'), 500);
      playPronunciation(word, audioPath);
    });
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tile.click();
      }
    });
  });
}

/* ---------- Flashcards: click to flip + hear the Hungarian word ---------- */
function initFlashcards() {
  document.querySelectorAll('.flashcard').forEach(card => {
    const btn = card.querySelector('button');
    const word = card.dataset.word;
    const audioPath = card.dataset.audio;
    btn.addEventListener('click', () => {
      const wasFlipped = card.classList.contains('flipped');
      card.classList.toggle('flipped');
      if (!wasFlipped) playPronunciation(word, audioPath);
    });
  });
}

/* ---------- Tabs ---------- */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabButtons.forEach(b => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });
    });
  });
}

/* ---------- Simple multiple-choice quiz engine ----------
   Reads a `quizData` array (defined per-page) of the shape:
   { visual: '🍎🍎🍎', answer: 'három', options: ['egy','három','öt'] }
   Renders one question at a time into #quiz-box. */
function initQuiz(quizData, opts) {
  const box = document.getElementById('quiz-box');
  if (!box || !quizData || !quizData.length) return;
  opts = opts || {};
  let index = 0;
  let score = 0;
  let order = shuffle([...quizData.keys()]);

  function render() {
    const q = quizData[order[index]];
    const optionsShuffled = shuffle([...q.options]);
    box.innerHTML = `
      <p class="quiz-prompt">${opts.prompt || 'Melyik a helyes szó?'}</p>
      <div class="quiz-visual" aria-hidden="true">${q.visual}</div>
      <div class="quiz-options">
        ${optionsShuffled.map(opt => `<button type="button" data-opt="${opt}">${opt}</button>`).join('')}
      </div>
      <p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p>
      <p class="quiz-score">Pont: ${score} / ${quizData.length} &nbsp;•&nbsp; Kérdés ${index + 1} / ${quizData.length}</p>
    `;
    box.querySelectorAll('.quiz-options button').forEach(b => {
      b.addEventListener('click', () => handleAnswer(b, q));
    });
  }

  function handleAnswer(button, q) {
    const chosen = button.dataset.opt;
    const feedback = document.getElementById('quiz-feedback');
    const allButtons = box.querySelectorAll('.quiz-options button');
    allButtons.forEach(b => b.disabled = true);

    speakHungarian(q.answer);

    if (chosen === q.answer) {
      button.classList.add('correct');
      feedback.textContent = 'Ügyes vagy! 🎉 (Well done!)';
      feedback.className = 'quiz-feedback good';
      score++;
    } else {
      button.classList.add('wrong');
      feedback.textContent = `Majdnem! A helyes válasz: ${q.answer}`;
      feedback.className = 'quiz-feedback bad';
      allButtons.forEach(b => { if (b.dataset.opt === q.answer) b.classList.add('correct'); });
    }

    setTimeout(() => {
      index++;
      if (index < order.length) {
        render();
      } else {
        box.innerHTML = `
          <p class="quiz-prompt">Kész vagy! You finished the quiz! 🌻</p>
          <p class="quiz-score" style="font-size:1.3rem;">Végeredmény: ${score} / ${quizData.length}</p>
          <button class="btn btn-green" id="quiz-restart" type="button">Újra! (Play again)</button>
        `;
        document.getElementById('quiz-restart').addEventListener('click', () => {
          index = 0; score = 0; order = shuffle([...quizData.keys()]);
          render();
        });
      }
    }, 1400);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  render();
}

/* ---------- Standalone speak buttons (e.g. phrase cards) ---------- */
function initSpeakButtons() {
  document.querySelectorAll('.speak-btn').forEach(btn => {
    const text = btn.dataset.text;
    const audioPath = btn.dataset.audio;
    btn.addEventListener('click', () => playPronunciation(text, audioPath));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTiles();
  initFlashcards();
  initTabs();
  initSpeakButtons();
  // Chrome loads voices asynchronously — this just warms the list up.
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
});
