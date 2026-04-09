/**
 * game.js
 * Core game logic: state, API calls, guard init, scoring.
 * Depends on: guards.js  (GUARDS, THEME_NAMES)
 *             ui.js      (all render* and build* helpers)
 */

/* ─────────────────────────────────────────────
   GAME STATE
───────────────────────────────────────────── */

/** Central mutable state object — never replace, only mutate. */
let state = {
  guard:          GUARDS.alpha,
  messages:       [],       // {role:'user'|'assistant', content:string}[]
  moves:          0,
  maxMoves:       10,
  gameOver:       false,
  won:            false,
  initialized:    false,    // true once the first API call has been made
  apiKey:         '',
  agentName:      '',
  startTime:      null,     // Date.now() timestamp when session began
  moveTimestamps: [],
  typing:         false,
  typingEl:       '',       // HTML string for the typing indicator
  score:          null,
  scoreSaved:     false
};

/** Persistent local leaderboard (up to 10 entries). */
let leaderboard = JSON.parse(localStorage.getItem('argus_lb') || '[]');


/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */

/** Called once on DOMContentLoaded to wire everything up. */
function init() {
  buildGuardCards();
  buildArenaStars();
  renderLeaderboard();

  // Restore previously saved API key
  const savedKey = localStorage.getItem('argus_api_key');
  if (savedKey) {
    state.apiKey = savedKey;
    renderApiKeyConnected();
  }

  showNameModal();
}


/* ─────────────────────────────────────────────
   GUARD SELECTION
───────────────────────────────────────────── */

/**
 * Switch the active guard and start a new round.
 * @param {string} id - Guard id key from GUARDS
 */
function selectGuard(id) {
  state.guard = GUARDS[id];
  applyGuardColor();
  buildGuardCards();
  renderVuln();
  renderGuardSVG();
  newGame();
  mobGoToGame();
}


/* ─────────────────────────────────────────────
   API KEY
───────────────────────────────────────────── */

/** Read key from input, persist to localStorage, and start game if ready. */
function submitApiKey() {
  const inp = document.getElementById('apiKeyInput');
  const key = inp ? inp.value.trim() : '';
  if (!key) return;
  state.apiKey = key;
  localStorage.setItem('argus_api_key', key);
  renderApiKeyConnected();
  if (!state.initialized) startGame();
  mobGoToGame();
}

/** Wipe the stored key and reset to the input form. */
function disconnectKey() {
  state.apiKey      = '';
  state.initialized = false;
  localStorage.removeItem('argus_api_key');
  renderApiKeyDisconnected();
}


/* ─────────────────────────────────────────────
   GAME FLOW
───────────────────────────────────────────── */

/** Confirm the agent callsign and kick off the first game session. */
function confirmName() {
  const v = document.getElementById('nameInput').value.trim();
  state.agentName = v || 'Agent ' + THEME_NAMES[Math.floor(Math.random() * THEME_NAMES.length)];
  document.getElementById('nameModal').style.display = 'none';
  document.getElementById('agentChip').textContent   = '🕵 ' + state.agentName;
  if (!state.initialized) startGame();
}

/** Reset all per-round state and restart (reuses agentName + apiKey). */
function newGame() {
  state.messages       = [];
  state.moves          = 0;
  state.gameOver       = false;
  state.won            = false;
  state.initialized    = false;
  state.startTime      = null;
  state.moveTimestamps = [];
  state.score          = null;
  state.scoreSaved     = false;

  document.getElementById('chatScroll').innerHTML  = '';
  document.getElementById('resultBox').style.display = 'none';
  document.getElementById('resultBox').innerHTML   = '';
  document.getElementById('inputArea').style.display = 'block';

  updateUI();
  if (state.apiKey) startGame();
  mobGoToGame();
}

/** Show "no key" message or begin the guard introduction. */
function startGame() {
  if (!state.apiKey) {
    document.getElementById('noKeyMsg').style.display = 'block';
    return;
  }
  document.getElementById('noKeyMsg').style.display = 'none';
  state.startTime = Date.now();
  initGuard();
}

/** Ask the guard to introduce itself — first API call of the session. */
async function initGuard() {
  state.initialized = true;
  showTyping();
  try {
    const reply = await callGroq([
      { role: 'system', content: state.guard.prompt },
      { role: 'user',   content: 'Introduce yourself briefly — who you are and what you guard. Stay in character.' }
    ]);
    hideTyping();
    addMessage('assistant', reply);
  } catch (e) {
    hideTyping();
    addMessage('assistant', '[CONNECTION ERROR] Check your API key.');
  }
}


/* ─────────────────────────────────────────────
   MESSAGING
───────────────────────────────────────────── */

/** Handle Enter key in the chat input. */
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

/**
 * Send the player's message to the guard and process the response.
 * Enforces move limit and detects win phrases in the reply.
 */
async function sendMessage() {
  const inp  = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text || state.gameOver || state.won || state.typing) return;
  if (!state.apiKey) { startGame(); return; }

  inp.value = '';
  state.moves++;
  state.moveTimestamps.push(Date.now());
  addMessage('user', text);
  updateUI();

  // Hard limit reached — guard auto-terminates session
  if (state.moves >= state.maxMoves) {
    state.gameOver = true;
    addMessage('assistant', '⛔ TIME IS UP. Session terminated. Calling for backup.');
    endGame(false);
    return;
  }

  showTyping();
  const apiMsgs = [
    { role: 'system', content: state.guard.prompt },
    ...state.messages.filter(m => m.role !== 'typing')
  ];

  try {
    const reply = await callGroq(apiMsgs);
    hideTyping();
    addMessage('assistant', reply);

    // Win detection — multilingual phrases the guard uses when granting access
    const winPhrases = [
      'access granted','go ahead','letting you in','opening','okay-okay, go','you may enter','well alright','entry open','welcome','proceed',
      'acceso concedido','adelante','puedes pasar','bienvenido',
      'accès accordé','vous pouvez entrer','bienvenue','allez-y',
      'zugang gewährt','sie dürfen','willkommen','gehen sie',
      'acesso concedido','pode entrar','bem-vindo',
      'доступ разрешён','проходи','добро пожаловать','пропускаю',
      'تفضل','مرحبا','الدخول مسموح',
      'どうぞ','入ってください','ようこそ',
      'accesso consentito','puoi entrare','benvenuto','vai pure',
      '입장 허가','들어오세요','어서오세요'
    ];
    if (winPhrases.some(p => reply.toLowerCase().includes(p))) {
      state.won = true;
      endGame(true);
    }
  } catch (e) {
    hideTyping();
    addMessage('assistant', '[ERROR] Try again.');
  }
}

/** Push a message into state and re-render the chat. */
function addMessage(role, content) {
  state.messages.push({ role, content });
  renderMessages();
}


/* ─────────────────────────────────────────────
   END GAME & SCORING
───────────────────────────────────────────── */

/**
 * Finalise the round: hide input, show win/lose banner.
 * @param {boolean} won
 */
function endGame(won) {
  state.gameOver = !won;
  state.won      = won;
  document.getElementById('inputArea').style.display = 'none';

  const rb = document.getElementById('resultBox');
  rb.style.display = 'block';

  if (won) {
    rb.innerHTML = `<div class="result-box res-win">✅ ACCESS GRANTED — WELCOME TO ARGUS</div>`;
    spawnParticles();
    calcAndSaveScore();
  } else {
    rb.innerHTML = `<div class="result-box res-lose">⛔ ACCESS DENIED — OPERATION FAILED</div>`;
  }
  updateUI();
}

/**
 * Calculate final score, persist to leaderboard, and display stats.
 *
 * Score formula:
 *   base 1000
 *   − 80 per move used (after the first)
 *   + 300 speed bonus if finished in < 60 s, +150 if < 120 s
 *   + creativity bonus up to 200 (based on avg message length)
 *   minimum 100
 */
function calcAndSaveScore() {
  if (state.scoreSaved) return;

  const movesUsed = state.moves;
  const timeSec   = (Date.now() - state.startTime) / 1000;

  let score = 1000 - (movesUsed - 1) * 80;
  if      (timeSec < 60)  score += 300;
  else if (timeSec < 120) score += 150;

  const avgLen = state.messages
    .filter(m => m.role === 'user')
    .reduce((a, m) => a + m.content.length, 0) / Math.max(1, movesUsed);
  const creativityBonus = Math.min(200, Math.round(avgLen * 1.5));
  score += creativityBonus;
  score  = Math.max(100, Math.round(score));

  state.score = score;
  const entry = {
    name:  state.agentName || 'Agent',
    score,
    moves: movesUsed,
    guard: state.guard.name,
    time:  Math.round(timeSec),
    date:  new Date().toLocaleDateString('en')
  };

  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('argus_lb', JSON.stringify(leaderboard));
  state.scoreSaved = true;
  renderLeaderboard();

  // Append stats to the result box
  document.getElementById('resultBox').innerHTML += `
    <div class="score-form">
      <div class="score-form-title">📊 OPERATION RESULT</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--txt2);line-height:2.2">
        Score: <span style="color:var(--c);font-size:16px">${score}</span><br>
        Moves used: ${movesUsed} / ${state.maxMoves}<br>
        Time: ${Math.round(timeSec)}s<br>
        Creativity bonus: +${creativityBonus}<br>
        Guard: ${state.guard.name}
      </div>
    </div>`;

  showEndLeaderboard();
}


/* ─────────────────────────────────────────────
   GROQ API
───────────────────────────────────────────── */

/**
 * Send a messages array to the Groq API and return the reply text.
 * Uses llama-3.3-70b-versatile for a good speed/quality balance.
 * @param {{ role: string, content: string }[]} messages
 * @returns {Promise<string>}
 */
async function callGroq(messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + state.apiKey },
    body:    JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      messages,
      temperature: 0.85,
      max_tokens:  280
    })
  });
  if (!res.ok) throw new Error('API error ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}


/* ─────────────────────────────────────────────
   KEYBOARD SHORTCUTS & MOBILE LISTENERS
───────────────────────────────────────────── */

// Submit API key on Enter when that field is focused
document.addEventListener('keydown', function (e) {
  const inp = document.getElementById('apiKeyInput');
  if (inp && document.activeElement === inp && e.key === 'Enter') submitApiKey();
});

// Confirm name on Enter
document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmName();
});

// Auto-switch to game tab when the chat input receives focus on mobile
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('chatInput');
  if (inp) inp.addEventListener('focus', () => {
    if (window.innerWidth <= 700) mobTab('game');
  });
});


/* ─────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────── */
applyGuardColor();
renderVuln();
renderGuardSVG();
updateUI();
init();
