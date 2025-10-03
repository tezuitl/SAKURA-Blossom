/* ========== Pastel Calm — Mental Wellness Website Script ========== */

const pages = {
  home: document.getElementById('page-home'),
  mood: document.getElementById('page-mood'),
  calm: document.getElementById('page-calm'),
  jar: document.getElementById('page-jar'),
  relax: document.getElementById('page-relax'),
};

const bottomBtns = document.querySelectorAll('.nav-btn');
const bigBtns = document.querySelectorAll('.big-btn');
const backBtns = document.querySelectorAll('[data-back]');

function openPage(idKey) {
  Object.values(pages).forEach(p => {
    if (p.id === idKey) {
      p.classList.add('slide-in');
      p.classList.remove('slide-page');
      p.setAttribute('aria-hidden', 'false');
    } else if (p !== pages.home) {
      p.classList.remove('slide-in');
      p.classList.add('slide-page');
      p.setAttribute('aria-hidden', 'true');
    }
  });
  bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.target === idKey));
}

function goHome() {
  Object.values(pages).forEach(p => {
    if (p !== pages.home) {
      p.classList.remove('slide-in');
      p.classList.add('slide-page');
      p.setAttribute('aria-hidden', 'true');
    }
  });
  bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.target === 'page-home'));
}

bigBtns.forEach(btn => {
  btn.addEventListener('click', () => openPage(btn.dataset.target));
});

bottomBtns.forEach(b => {
  b.addEventListener('click', () => {
    const target = b.dataset.target;
    if (target === 'page-home') { 
      goHome(); 
    } else {
      openPage(target);
    }
  });
});

backBtns.forEach(b => b.addEventListener('click', goHome));

/* ========== MOOD TRACKER ========== */
const moodLogEl = document.getElementById('mood-log');
const moodSelectBtns = document.querySelectorAll('.m-emoji');
const moodNoteInput = document.getElementById('mood-note');
const saveMoodBtn = document.getElementById('save-mood');
const clearMoodBtn = document.getElementById('clear-mood');

let selectedMood = null;
let moodLog = JSON.parse(localStorage.getItem('pastel_moods_v1') || '[]');
let blossomPoints = Number(localStorage.getItem('pastel_points_v1') || 0);

document.getElementById('points').textContent = blossomPoints;

function renderMoodLog() {
  moodLogEl.innerHTML = '';
  if (moodLog.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No mood entries yet. Start tracking your mood!';
    li.style.fontStyle = 'italic';
    moodLogEl.appendChild(li);
    return;
  }
  
  moodLog.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    li.textContent = `${dateStr} — ${entry.mood} ${entry.note ? '- ' + entry.note : ''}`;
    moodLogEl.appendChild(li);
  });
}

renderMoodLog();

moodSelectBtns.forEach(b => {
  b.addEventListener('click', () => {
    moodSelectBtns.forEach(x => x.classList.remove('active-emoji'));
    b.classList.add('active-emoji');
    selectedMood = b.dataset.mood;
  });
});

saveMoodBtn.addEventListener('click', () => {
  if (!selectedMood) {
    alert('Please select an emotion first.');
    return;
  }
  
  const note = moodNoteInput.value.trim();
  const entry = { date: new Date().toISOString(), mood: selectedMood, note };
  moodLog.push(entry);
  
  if (moodLog.length > 100) moodLog.shift();
  
  localStorage.setItem('pastel_moods_v1', JSON.stringify(moodLog));
  moodNoteInput.value = '';
  selectedMood = null;
  moodSelectBtns.forEach(x => x.classList.remove('active-emoji'));
  renderMoodLog();
  renderChart();

  if (['gembira', 'tenang'].includes(entry.mood)) {
    blossomPoints += 2;
    localStorage.setItem('pastel_points_v1', String(blossomPoints));
    document.getElementById('points').textContent = blossomPoints;
    triggerFlower();
  }
  
  alert('Mood saved successfully! 🌸');
});

clearMoodBtn.addEventListener('click', () => {
  moodNoteInput.value = '';
  selectedMood = null;
  moodSelectBtns.forEach(x => x.classList.remove('active-emoji'));
});

function moodScore(moodKey) {
  const map = { gembira: 5, tenang: 4, letih: 2, marah: 1, sedih: 1 };
  return map[moodKey] || 3;
}

function renderChart() {
  const chart = document.getElementById('mood-chart');
  const last7 = moodLog.slice(-7);
  
  if (!last7.length) {
    chart.innerHTML = '<p>No data yet — log your mood to see patterns.</p>';
    return;
  }
  
  const points = last7.map((e, i) => {
    const score = moodScore(e.mood);
    const x = 10 + i * (280 / Math.max(1, last7.length - 1));
    const y = 80 - (score / 5) * 60;
    return `${x},${y}`;
  }).join(' ');
  
  chart.innerHTML = `
    <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet">
      <polyline fill="none" stroke="#6c5ce7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
    </svg>
  `;
}

renderChart();

function triggerFlower() {
  const container = document.querySelector('#page-mood .page-content');
  if (!container) return;
  
  const el = document.createElement('div');
  el.className = 'flower';
  el.textContent = '🌸';
  el.style.position = 'absolute';
  el.style.left = `${20 + Math.random() * 60}%`;
  el.style.top = `${140 + Math.random() * 40}px`;
  container.style.position = 'relative';
  container.appendChild(el);
  
  setTimeout(() => el.remove(), 1200);
}

/* ========== AFFIRMATION JAR ========== */
const affirmations = [
  "Layu sebentar tidak bermakna kau gagal, kau hanya sedang rehat untuk mekar semula.",
  "Menangis tidak menjadikanmu lemah, ia menjadikanmu manusia.",
  "Aku layak untuk rehat dan sayang pada diri sendiri.",
  "Setiap hari adalah peluang baru untuk belajar.",
  "Ruang kosong dalam hati adalah tempat untuk harapan baru tumbuh.",
  "You am capable of achieving great things.",
  "Every challenge helps me grow stronger.",
  "I deserve happiness and peace.",
  "Today is a fresh start full of possibilities.",
  "I am proud of my progress, no matter how small.",
  "Gelap malam hanya sementara, fajar tetap akan menyapa.",
  "Kesilapan bukan kegagalan, ia adalah guru.",
  "",
];

const affirmText = document.getElementById('affirm-text');
const shakeBtn = document.getElementById('shake-btn');
const saveAffBtn = document.getElementById('save-affirm');

let currentAff = '';
let favorites = JSON.parse(localStorage.getItem('pastel_favs_v1') || '[]');

document.getElementById('fav-count').textContent = favorites.length;

shakeBtn.addEventListener('click', () => {
  currentAff = affirmations[Math.floor(Math.random() * affirmations.length)];
  affirmText.textContent = currentAff;
  affirmText.classList.add('pop');
  setTimeout(() => affirmText.classList.remove('pop'), 420);
});

saveAffBtn.addEventListener('click', () => {
  if (!currentAff) {
    alert('No affirmation selected. Shake the jar first!');
    return;
  }
  
  if (!favorites.includes(currentAff)) {
    favorites.push(currentAff);
    localStorage.setItem('pastel_favs_v1', JSON.stringify(favorites));
    document.getElementById('fav-count').textContent = favorites.length;
    alert('Saved to favorites! 💖');
  } else {
    alert('Already in favorites!');
  }
});

/* ========== QUICK CALM ========== */
const bubbleEl = document.getElementById('bubble');
const breathText = document.getElementById('breath-text');
const startBreath = document.getElementById('start-breath');
const skipBreath = document.getElementById('skip-breath');

let breathInterval = null;
let breathTimeout = null;

function startBreathingSession() {
  let step = 0;
  const steps = [
    { text: 'Breathe in slowly (4s)', ms: 4000 },
    { text: 'Hold your breath (2s)', ms: 2000 },
    { text: 'Breathe out gently (6s)', ms: 6000 },
    { text: 'Rest...', ms: 2000 }
  ];
  
  if (breathInterval) clearInterval(breathInterval);
  if (breathTimeout) clearTimeout(breathTimeout);
  
  breathText.textContent = steps[0].text;
  step = 0;
  
  function nextStep() {
    step = (step + 1) % steps.length;
    breathText.textContent = steps[step].text;
  }
  
  breathInterval = setInterval(nextStep, 4000);
  bubbleEl.style.animation = 'breathe 6s ease-in-out infinite';
  
  breathTimeout = setTimeout(stopBreathingSession, 60000);
}

function stopBreathingSession() {
  if (breathInterval) {
    clearInterval(breathInterval);
    breathInterval = null;
  }
  if (breathTimeout) {
    clearTimeout(breathTimeout);
    breathTimeout = null;
  }
  breathText.textContent = 'Session complete. Well done! 🌸';
  bubbleEl.style.animation = 'none';
}

startBreath.addEventListener('click', startBreathingSession);
skipBreath.addEventListener('click', stopBreathingSession);

document.getElementById('mindful-btn').addEventListener('click', () => {
  alert('Mindful Exercise: Name 3 things you can see right now. Take your time and really observe them.');
});

document.getElementById('muscle-btn').addEventListener('click', () => {
  alert('30-second Muscle Relaxation: Gently stretch your neck, roll your shoulders, and take deep breaths. Feel the tension release.');
});

/* ========== RELAX ZONE ========== */
const player = document.getElementById('player');
const sounds = {
  rain: 'https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/rain.mp3',
  waves: 'https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/waves.mp3',
  forest: 'https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/forest.mp3',
  piano: 'https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/piano.mp3'
};

let timerHandle = null;

document.querySelectorAll('.sound-btn').forEach(b => {
  b.addEventListener('click', () => {
    const key = b.dataset.sound;
    player.src = sounds[key] || '';
    player.play().catch(() => {
      alert('Could not play audio. Please check your browser settings.');
    });
    document.querySelectorAll('.sound-btn').forEach(x => x.classList.toggle('active', x === b));
  });
});

document.getElementById('stop-sound').addEventListener('click', () => {
  player.pause();
  player.currentTime = 0;
  if (timerHandle) {
    clearTimeout(timerHandle);
    timerHandle = null;
  }
  document.querySelectorAll('.sound-btn').forEach(x => x.classList.remove('active'));
});

document.getElementById('set-timer').addEventListener('click', () => {
  const mins = Number(document.getElementById('timer').value || 0);
  if (mins <= 0) {
    alert('Please enter a duration in minutes (greater than 0)');
    return;
  }
  
  if (timerHandle) clearTimeout(timerHandle);
  
  timerHandle = setTimeout(() => {
    player.pause();
    player.currentTime = 0;
    alert('Timer complete — sound stopped. 🌙');
  }, mins * 60 * 1000);
  
  alert(`Timer set for ${mins} minute(s)`);
});

document.getElementById('guided-btn').addEventListener('click', () => {
  player.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
  player.play().catch(() => {
    alert('Could not play audio. Please check your browser settings.');
  });
});

/* ========== KEYBOARD SHORTCUTS ========== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') goHome();
});

bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.target === 'page-home'));
