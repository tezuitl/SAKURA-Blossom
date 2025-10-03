/* ========== script.js ========== */
/* Handles slide navigation, interactions, mood tracker, affirmations, audio, timers */

/* ------- Navigation: slide-in pages (swipe-like) ------- */
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
// idKey e.g. 'page-mood'
// Hide all slide pages to right
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
// highlight bottom nav
bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.target === idKey));
}

function goHome() {
// slide all pages out
Object.values(pages).forEach(p => {
if (p !== pages.home) {
p.classList.remove('slide-in');
p.classList.add('slide-page');
p.setAttribute('aria-hidden', 'true');
}
});
bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.target === 'page-home'));
}

/* wire big buttons */
bigBtns.forEach(btn => {
btn.addEventListener('click', () => openPage(btn.dataset.target));
});

/* bottom nav */
bottomBtns.forEach(b => {
b.addEventListener('click', () => {
const target = b.dataset.target;
if (target === 'page-home') { goHome(); }
else openPage(target);
});
});

/* back buttons */
backBtns.forEach(b => b.addEventListener('click', goHome));

/* ------- Mood Tracker logic ------- */
const moodLogEl = document.getElementById('mood-log');
const moodSelectBtns = document.querySelectorAll('.m-emoji');
const moodNoteInput = document.getElementById('mood-note');
const saveMoodBtn = document.getElementById('save-mood');
const clearMoodBtn = document.getElementById('clear-mood');
let selectedMood = null;
let moodLog = JSON.parse(localStorage.getItem('pastel_moods_v1') || '[]');
let blossomPoints = Number(localStorage.getItem('pastel_points_v1') || 0);
document.getElementById('points').textContent = blossomPoints;

function renderMoodLog(){
moodLogEl.innerHTML = '';
moodLog.slice().reverse().forEach(entry => {
const li = document.createElement('li');
const d = new Date(entry.date);
li.textContent = `${d.toLocaleString()} — ${entry.mood} ${entry.note ? '- ' + entry.note : ''}`;
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
alert('Sila pilih emosi dahulu.');
return;
}
const note = moodNoteInput.value.trim();
const entry = { date: new Date().toISOString(), mood: selectedMood, note };
moodLog.push(entry);
if (moodLog.length > 100) moodLog.shift();
localStorage.setItem('pastel_moods_v1', JSON.stringify(moodLog));
moodNoteInput.value = '';
selectedMood = null;
document.querySelectorAll('.m-emoji').forEach(x => x.classList.remove('active-emoji'));
renderMoodLog();

// blossom points & flower bloom for positive moods
if (['gembira','tenang'].includes(entry.mood)) {
blossomPoints += 2;
localStorage.setItem('pastel_points_v1', String(blossomPoints));
document.getElementById('points').textContent = blossomPoints;
triggerFlower();
}
});

/* Cancel */
clearMoodBtn.addEventListener('click', () => {
moodNoteInput.value = '';
selectedMood = null;
document.querySelectorAll('.m-emoji').forEach(x => x.classList.remove('active-emoji'));
});

/* simple chart placeholder (render average score) */
function moodScore(moodKey){
const map = { gembira: 5, tenang: 4, letih: 2, marah: 1, sedih: 1 };
return map[moodKey] || 3;
}
function renderChart(){
const chart = document.getElementById('mood-chart');
const last7 = moodLog.slice(-7);
if (!last7.length) { chart.textContent = 'Tiada data lagi — log mood untuk melihat corak.'; return; }
// make simple sparkline using svg
const points = last7.map((e,i) => {
const score = moodScore(e.mood);
const x = 10 + i * (120 / Math.max(1,last7.length-1));
const y = 60 - (score/5)*48;
return `${x},${y}`;
}).join(' ');
chart.innerHTML = `<svg width="100%" height="80" viewBox="0 0 140 80" preserveAspectRatio="none"><polyline fill="none" stroke="#9f7aea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" /></svg>`;
}
renderChart();

/* Flower bloom effect */
function triggerFlower(){
const container = document.querySelector('#page-mood .page-content');
if (!container) return;
const el = document.createElement('div');
el.className = 'flower';
el.style.position = 'absolute';
el.style.left = `${20 + Math.random()*60}%`;
el.style.top = `${140 + Math.random()*40}px`;
container.appendChild(el);
setTimeout(()=> el.remove(), 1200);
}

/* ------- Affirmation Jar ------- */
const affirmations = [
"Aku lebih kuat daripada cabaran ini.",
"Langkah kecil hari ini membawa perubahan besar.",
"Aku layak untuk rehat dan sayang pada diri sendiri.",
"Setiap hari adalah peluang baru untuk belajar.",
"Tarik nafas — semuanya akan baik."
];
const affirmText = document.getElementById('affirm-text');
const shakeBtn = document.getElementById('shake-btn');
const saveAffBtn = document.getElementById('save-affirm');
let currentAff = '';
let favorites = JSON.parse(localStorage.getItem('pastel_favs_v1') || '[]');
document.getElementById('fav-count').textContent = favorites.length;

shakeBtn.addEventListener('click', () => {
currentAff = affirmations[Math.floor(Math.random()*affirmations.length)];
affirmText.textContent = currentAff;
affirmText.classList.add('pop');
setTimeout(()=> affirmText.classList.remove('pop'), 420);
});
saveAffBtn.addEventListener('click', () => {
if (!currentAff) return alert('Tiada affirmation dipilih.');
if (!favorites.includes(currentAff)) {
favorites.push(currentAff);
localStorage.setItem('pastel_favs_v1', JSON.stringify(favorites));
document.getElementById('fav-count').textContent = favorites.length;
alert('Disimpan ke favorit.');
} else alert('Sudah disimpan.');
});

/* ------- Quick Calm interactions ------- */
const bubbleEl = document.getElementById('bubble');
const breathText = document.getElementById('breath-text');
const startBreath = document.getElementById('start-breath');
const skipBreath = document.getElementById('skip-breath');
let breathInterval = null;

function startBreathingSession(){
let step = 0;
const steps = [
{text:'Tarik nafas (4s)', ms:4000},
{text:'Tahan (2s)', ms:2000},
{text:'Hembus (6s)', ms:6000},
{text:'Berehat', ms:2000}
];
if (breathInterval) clearInterval(breathInterval);
breathText.textContent = steps[0].text;
step = 0;
breathInterval = setInterval(()=> {
step = (step+1) % steps.length;
breathText.textContent = steps[step].text;
}, steps[0].ms);
// simple timed bubble animation change by toggling class
bubbleEl.style.animation = 'breathe 6s ease-in-out infinite';
}
function stopBreathingSession(){
if (breathInterval) { clearInterval(breathInterval); breathInterval = null; }
breathText.textContent = 'Selesai';
bubbleEl.style.animation = 'none';
}
startBreath.addEventListener('click', () => {
startBreathingSession();
// auto-stop after 60s (one full short session)
setTimeout(stopBreathingSession, 60000);
});
skipBreath.addEventListener('click', stopBreathingSession);

/* Mindful & Muscle prompts */
document.getElementById('mindful-btn').addEventListener('click', () => {
alert('Sebut 3 perkara yang kamu nampak sekarang.');
});
document.getElementById('muscle-btn').addEventListener('click', () => {
alert('Mulakan 30 saat regangan: regangkan leher, lengan, dan tarik nafas panjang.');
});

/* ------- Relax Zone: audio and timer ------- */
const player = document.getElementById('player');
const sounds = {
rain: '[https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/rain.mp3](https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/rain.mp3)',
waves: '[https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/waves.mp3](https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/waves.mp3)',
forest: '[https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/forest.mp3](https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/forest.mp3)',
piano: '[https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/piano.mp3](https://cdn.jsdelivr.net/gh/johnjleider/soundfiles@main/piano.mp3)'
};
let timerHandle = null;
document.querySelectorAll('.sound-btn').forEach(b => {
b.addEventListener('click', () => {
const key = b.dataset.sound;
player.src = sounds[key] || '';
player.play().catch(()=>{ /* autoplay policies */ });
// highlight active
document.querySelectorAll('.sound-btn').forEach(x => x.classList.toggle('active', x===b));
});
});
document.getElementById('stop-sound').addEventListener('click', ()=> {
player.pause(); player.currentTime = 0;
if (timerHandle) { clearTimeout(timerHandle); timerHandle = null; }
});
document.getElementById('set-timer').addEventListener('click', ()=> {
const mins = Number(document.getElementById('timer').value || 0);
if (mins <= 0) return alert('Masukkan tempoh dalam minit ( > 0 )');
if (timerHandle) clearTimeout(timerHandle);
timerHandle = setTimeout(()=> { player.pause(); player.currentTime=0; alert('Timer selesai — bunyi dihentikan.'); }, mins * 60 * 1000);
});

/* guided sample */
document.getElementById('guided-btn').addEventListener('click', ()=> {
// replace with real guided audio by counselor when available
player.src = '[https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3](https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3)';
player.play().catch(()=>{});
});

/* ------- small UX polish: keyboard back (Esc) ------- */
document.addEventListener('keydown', (e)=> {
if (e.key === 'Escape') goHome();
});

/* ------- initialize bottom nav highlight to home ------- */
bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.target === 'page-home'));
