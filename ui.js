/**
 * ui.js
 * Pure DOM/rendering helpers — no game logic here.
 * Depends on: guards.js (GUARDS, GUARD_DIFFICULTY, THEME_NAMES, guardSVG)
 *             game.js  (state, leaderboard)
 */

/* ─────────────────────────────────────────────
   GUARD CARDS (sidebar)
───────────────────────────────────────────── */

/** Rebuild the sidebar guard-selection cards. */
function buildGuardCards() {
  const el = document.getElementById('guardCards');
  el.innerHTML = Object.values(GUARDS).map(g => {
    const d = GUARD_DIFFICULTY[g.id] || { stars: '★☆☆', label: '', col: g.color };
    const active = state.guard.id === g.id ? ' active' : '';
    return `<div class="guard-card${active}" style="--gc:${g.color}" onclick="selectGuard('${g.id}')">
      <div class="gc-emoji">${g.emoji}</div>
      <div class="gc-info">
        <div class="gc-name">${g.name}</div>
        <div class="gc-desc">${g.desc}</div>
        <div class="diff-stars" style="color:${d.col}">${d.stars}</div>
      </div>
      <div class="gc-active"></div>
    </div>`;
  }).join('');
}

/** Apply the current guard's accent colour as --gc CSS variable. */
function applyGuardColor() {
  document.documentElement.style.setProperty('--gc', state.guard.color);
}

/** Update vulnerability chip text and colour. */
function renderVuln() {
  const chip = document.getElementById('vulnChip');
  chip.style.borderLeftColor = state.guard.color;
  chip.style.color = state.guard.color;
  chip.textContent = state.guard.vuln;
}

/** Inject the SVG guard into the arena stage. */
function renderGuardSVG() {
  document.getElementById('guardStage').innerHTML = guardSVG(state.guard.color);
  document.getElementById('guardNameplate').textContent  = state.guard.name;
  document.getElementById('guardNameplate').style.color  = state.guard.color;

  // Colour arena alert dots to match guard
  ['alertL', 'alertR'].forEach(id => {
    const el = document.getElementById(id);
    el.style.background  = state.guard.color;
    el.style.boxShadow   = `0 0 16px ${state.guard.color}`;
  });

  // Pulse rings around guard feet
  ['pulseRing1','pulseRing2','pulseRing3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.borderColor = state.guard.color;
  });
}


/* ─────────────────────────────────────────────
   ARENA DECORATIONS
───────────────────────────────────────────── */

/** Generate random twinkling star elements inside the arena. */
function buildArenaStars() {
  const el = document.getElementById('arenaStars');
  let html = '';
  for (let i = 0; i < 40; i++) {
    const x  = Math.random() * 100;
    const y  = Math.random() * 75;
    const s  = Math.random() * 2.5 + 0.5;
    const d  = Math.random() * 4 + 2;
    const dl = Math.random() * 3;
    const o  = Math.random() * 0.5 + 0.1;
    html += `<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;--d:${d}s;--delay:-${dl}s;--o:${o}"></div>`;
  }
  el.innerHTML = html;
  spawnDataFrags();
}

/** Spawn floating hex/binary text fragments in the arena background. */
function spawnDataFrags() {
  const el = document.getElementById('dataFrags');
  if (!el) return;
  const pool = ['0xFF','01001','ARGUS','Ω-7','ERR','LOCK','AUTH','0x4A','DENY','PASS','///','---'];
  let html = '';
  for (let i = 0; i < 12; i++) {
    const x  = Math.random() * 90;
    const y  = 20 + Math.random() * 60;
    const d  = Math.random() * 8 + 6;
    const dl = Math.random() * 6;
    const t  = pool[Math.floor(Math.random() * pool.length)];
    html += `<div class="data-frag" style="left:${x}%;top:${y}%;animation-duration:${d}s;animation-delay:-${dl}s">${t}</div>`;
  }
  el.innerHTML = html;
}


/* ─────────────────────────────────────────────
   API KEY UI
───────────────────────────────────────────── */

/** Switch sidebar API bar to "connected" state. */
function renderApiKeyConnected() {
  const bar = document.getElementById('apiKeyBar');
  if (!bar) return;
  bar.className = 'sb-api-connected';
  bar.innerHTML = `
    <div class="sb-api-status"><span class="dot"></span>CONNECTED</div>
    <button class="sb-api-disconnect-btn" onclick="disconnectKey()">✕ DISCONNECT</button>`;
}

/** Switch sidebar API bar back to the input form. */
function renderApiKeyDisconnected() {
  const bar = document.getElementById('apiKeyBar');
  if (!bar) return;
  bar.className = 'sb-api-disconnected';
  bar.innerHTML = `
    <div class="sb-api-input-wrap">
      <input class="api-input" id="apiKeyInput" type="password" placeholder="gsk_..." autocomplete="off" onkeydown="if(event.key==='Enter')submitApiKey()">
      <button class="sb-api-connect-btn" onclick="submitApiKey()">▶</button>
    </div>
    <a href="https://console.groq.com/keys" target="_blank" class="api-link">→ Get a free Groq API key</a>`;
}


/* ─────────────────────────────────────────────
   NAME MODAL
───────────────────────────────────────────── */

/** Show the agent callsign modal with randomised name suggestions. */
function showNameModal() {
  const modal = document.getElementById('nameModal');
  modal.style.display = 'flex';

  // Pick 6 random name suggestions from the pool
  const shuffled = [...THEME_NAMES].sort(() => Math.random() - 0.5).slice(0, 8);
  const suggestions = [
    'Agent '    + shuffled[0],
    'Major '    + shuffled[1],
    shuffled[2] + '-' + Math.floor(Math.random() * 99 + 1),
    'Operative '+ shuffled[3],
    shuffled[4],
    shuffled[5] + ' ' + Math.floor(Math.random() * 9 + 1)
  ];
  document.getElementById('randomNames').innerHTML =
    suggestions.map(n => `<div class="name-pill" onclick="selectName('${n}')">${n}</div>`).join('');

  const inp = document.getElementById('nameInput');
  inp.value = state.agentName || '';
  setTimeout(() => inp.focus(), 100);
}

/** Fill the name input when a pill is clicked. */
function selectName(n) {
  document.getElementById('nameInput').value = n;
}


/* ─────────────────────────────────────────────
   CHAT MESSAGES
───────────────────────────────────────────── */

/**
 * Re-render all messages from state.messages.
 * Appends the typing indicator HTML if present.
 */
function renderMessages() {
  const scroll = document.getElementById('chatScroll');
  let html = '';

  state.messages.forEach(m => {
    if (m.role === 'user') {
      html += `<div class="msg user">
        <div class="m-av user-av">👤</div>
        <div class="m-content">
          <div class="m-name" style="color:var(--c);text-align:right">${state.agentName || 'YOU'}</div>
          <div class="m-bub bub-user">${escHtml(m.content)}</div>
        </div></div>`;
    } else {
      html += `<div class="msg">
        <div class="m-av guard-av" style="border-color:rgba(${hexToRgb(state.guard.color)},.25)">
          ${state.guard.emoji}
          <div class="m-av-pulse" style="border-color:${state.guard.color}"></div>
        </div>
        <div class="m-content">
          <div class="m-name" style="color:${state.guard.color}">${state.guard.name}</div>
          <div class="m-bub bub-guard" style="border-left-color:${state.guard.color}">${escHtml(m.content)}</div>
        </div></div>`;
    }
  });

  scroll.innerHTML = html + (state.typingEl || '');
  // Delay scroll so the browser has painted the new content
  setTimeout(() => { scroll.scrollTop = scroll.scrollHeight; }, 50);
}

/** Show the guard "typing…" indicator and disable the send button. */
function showTyping() {
  state.typing   = true;
  document.getElementById('sendBtn').disabled = true;
  state.typingEl = `<div class="msg">
    <div class="m-av guard-av" style="border-color:rgba(${hexToRgb(state.guard.color)},.25)">${state.guard.emoji}</div>
    <div class="m-content">
      <div class="m-name" style="color:${state.guard.color}">${state.guard.name}</div>
      <div class="typing-wrap"><div class="typing-dots"><span></span><span></span><span></span></div></div>
    </div></div>`;
  renderMessages();
}

/** Hide the typing indicator and re-enable the send button. */
function hideTyping() {
  state.typing   = false;
  state.typingEl = '';
  document.getElementById('sendBtn').disabled = false;
}


/* ─────────────────────────────────────────────
   INFO BAR & STATUS
───────────────────────────────────────────── */

/** Sync moves chip, progress bar, and status chip with current state. */
function updateUI() {
  const remaining = state.maxMoves - state.moves;
  document.getElementById('movesChip').textContent = `⏱ MOVES: ${remaining}/${state.maxMoves}`;

  // Progress bar colour shifts red as moves run out
  const pct  = (remaining / state.maxMoves) * 100;
  const fill = document.getElementById('movesFill');
  fill.style.width      = pct + '%';
  fill.style.background = pct > 50
    ? 'linear-gradient(90deg,var(--c),var(--c2))'
    : pct > 30
      ? 'linear-gradient(90deg,#ffaa00,#ff6600)'
      : 'linear-gradient(90deg,#ff2244,#ff6600)';

  // Status chip
  const chip = document.getElementById('statusChip');
  if (state.won) {
    chip.textContent   = '◈ VICTORY ✓';
    chip.style.color   = 'var(--c2)';
    chip.style.borderColor = 'rgba(0,255,157,.3)';
  } else if (state.gameOver) {
    chip.textContent   = '◈ FAILED ✗';
    chip.style.color   = 'var(--red)';
    chip.style.borderColor = 'rgba(255,34,68,.3)';
  } else {
    chip.textContent   = '◈ ACTIVE';
    chip.style.color   = 'var(--amber)';
    chip.style.borderColor = 'rgba(255,170,0,.25)';
  }
}


/* ─────────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────────── */

/** Render the sidebar leaderboard from the in-memory array. */
function renderLeaderboard() {
  const el = document.getElementById('leaderboard');
  if (!leaderboard.length) {
    el.innerHTML = `<div class="lb-empty">— EMPTY —<br><span style="font-size:10px">Be the first!</span></div>`;
    return;
  }
  const medals = ['gold','silver','bronze'];
  el.innerHTML = leaderboard.slice(0, 8).map((e, i) => `
    <div class="lb-row">
      <div class="lb-rank ${medals[i] || ''}">${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
      <div class="lb-name" title="${e.guard} | ${e.moves} moves | ${e.time}s">${e.name}</div>
      <div class="lb-score">${e.score}</div>
    </div>`).join('');
}

/**
 * Show the end-game leaderboard modal with the player's rank highlighted.
 * Called 600 ms after endGame() so the result box renders first.
 */
function showEndLeaderboard() {
  setTimeout(() => {
    const myName = state.agentName || 'Agent';
    const rows = leaderboard.slice(0, 10).map((e, i) => {
      const isYou     = e.name === myName && e.score === state.score;
      const rank      = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      const rankColor = i === 0 ? '#ffd700' : i === 1 ? '#c8d8e8' : i === 2 ? '#e0a060' : 'var(--txt3)';
      return `<div class="end-lb-entry${isYou ? ' is-you' : ''}">
        <div class="end-lb-rank" style="color:${rankColor}">${rank}</div>
        <div class="end-lb-info">
          <div class="end-lb-name">${e.name}${isYou ? ' <span style="font-size:10px;color:var(--c);opacity:.7">← YOU</span>' : ''}</div>
          <div class="end-lb-meta">${e.guard} · ${e.moves} moves · ${e.time}s</div>
        </div>
        <div class="end-lb-score">${e.score}</div>
      </div>`;
    }).join('');

    const myRank  = leaderboard.findIndex(e => e.name === myName && e.score === state.score) + 1;
    const rankMsg = myRank === 1 ? '🏆 TOP OF THE BOARD!' : myRank <= 3 ? `🎖 RANK #${myRank} — EXCELLENT!` : `RANK #${myRank}`;

    const overlay = document.createElement('div');
    overlay.className = 'end-modal-overlay';
    overlay.id        = 'endModal';
    overlay.innerHTML = `
      <div class="end-modal-box">
        <div class="end-modal-title">🏆 LEADERBOARD</div>
        <div class="end-modal-subtitle">${rankMsg}</div>
        <div class="end-modal-divider"></div>
        ${rows || '<div class="lb-empty">No entries yet</div>'}
        <button class="btn btn-primary btn-full end-modal-close" onclick="document.getElementById('endModal').remove()">▶ CLOSE</button>
      </div>`;
    document.body.appendChild(overlay);
  }, 600);
}


/* ─────────────────────────────────────────────
   PARTICLE WIN EFFECT
───────────────────────────────────────────── */

/** Burst coloured particles on win. */
function spawnParticles() {
  const c = document.getElementById('particles');
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
      `width:${Math.random() * 6 + 2}px;height:${Math.random() * 6 + 2}px;` +
      `background:${Math.random() > 0.5 ? 'var(--c2)' : 'var(--c)'};` +
      `animation-duration:${Math.random() * 2 + 1}s;animation-delay:${Math.random() * 0.5}s`;
    c.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }
}


/* ─────────────────────────────────────────────
   MOBILE TABS
───────────────────────────────────────────── */

/**
 * Switch between game / guards / score tabs on mobile.
 * @param {'game'|'guard'|'score'} tab
 */
function mobTab(tab) {
  if (window.innerWidth > 700) return;
  const sidebar  = document.querySelector('.sidebar');
  const mainEl   = document.querySelector('.main');
  const sections = document.querySelectorAll('.sb-section');

  document.querySelectorAll('.mob-tab').forEach(t => t.classList.remove('active'));

  if (tab === 'game') {
    document.getElementById('tabGame').classList.add('active');
    sidebar.classList.remove('mob-open');
    mainEl.classList.remove('mob-hidden');
  } else if (tab === 'guard') {
    document.getElementById('tabGuard').classList.add('active');
    mainEl.classList.remove('mob-hidden');
    sidebar.classList.add('mob-open');
    // Show only guard + vulnerability sections
    sections.forEach((s, i) => s.style.display = i < 4 ? '' : 'none');
  } else if (tab === 'score') {
    document.getElementById('tabScore').classList.add('active');
    // Hide main area entirely; show only leaderboard section
    mainEl.classList.add('mob-hidden');
    sidebar.classList.add('mob-open');
    sections.forEach((s, i) => s.style.display = i === 4 ? '' : 'none');
  }
}

/** Auto-switch to game tab after guard selection on mobile. */
function mobGoToGame() {
  if (window.innerWidth <= 700) setTimeout(() => mobTab('game'), 150);
}


/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */

/** Escape HTML special characters for safe injection into innerHTML. */
function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/**
 * Convert a 6-digit hex colour to an "r,g,b" string.
 * Used when building rgba() values dynamically.
 * @param {string} hex - e.g. "#ff2244"
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
