/* =========================================================
   Tanuljunk Magyarul! — shared interactivity
   No build tools, no dependencies: plain JS for GitHub Pages.
   ========================================================= */

/* ---------- Hungarian pronunciation (best effort) ----------
   Uses the browser's built-in Web Speech API. Many browsers
   don't ship a Hungarian voice, so this fails silently and the
   printed word is still there to read — audio is a bonus, not
   a requirement. */
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

/* ---------- Tiles: click to reveal English + hear the word ---------- */
function initTiles() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    const word = tile.dataset.word;
    tile.addEventListener('click', () => {
      tile.classList.toggle('revealed');
      tile.classList.add('playing');
      setTimeout(() => tile.classList.remove('playing'), 500);
      if (word) speakHungarian(word);
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
    btn.addEventListener('click', () => {
      const wasFlipped = card.classList.contains('flipped');
      card.classList.toggle('flipped');
      if (!wasFlipped && word) speakHungarian(word);
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

document.addEventListener('DOMContentLoaded', () => {
  initTiles();
  initFlashcards();
  initTabs();
  // Chrome loads voices asynchronously — this just warms the list up.
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
});
