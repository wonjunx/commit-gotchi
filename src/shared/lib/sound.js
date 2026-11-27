// 8비트 사운드 (Web Audio API로 직접 합성, 소리 파일 없음)
//   initSound()            앱 시작 시 한 번. 첫 클릭 이후 BGM 시작 (브라우저 자동재생 제한)
//   playSfx(name)          'hatch' | 'evolve' | 'levelUp' | 'feed'
//   setVolumes({ music, effect })   0~100, 설정 화면 AUDIO 값
//   setMuted(bool) · isMuted() · subscribeSound(fn)   헤더 음소거 버튼용

const SETTINGS_KEY = 'commitgotchi_settings';
const MUTED_KEY = 'commitgotchi_muted';

let ctx = null;
let master, bgmGain, sfxGain, pulse25, noiseBuf;
let unlocked = false;
let muted = readMuted();
let volumes = readVolumes();
const listeners = new Set();

function readVolumes() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { music: s.musicVolume ?? 70, effect: s.effectVolume ?? 50 };
  } catch {
    return { music: 70, effect: 50 };
  }
}

function readMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === 'true';
  } catch {
    return false;
  }
}

function setup() {
  if (ctx) return true;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.connect(ctx.destination);
  bgmGain = ctx.createGain();
  bgmGain.connect(master);
  sfxGain = ctx.createGain();
  sfxGain.connect(master);

  // 25% 펄스파
  const n = 32;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
  pulse25 = ctx.createPeriodicWave(real, imag);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  applyGain();
  return true;
}

function applyGain() {
  if (!ctx) return;
  master.gain.value = muted ? 0 : 0.6;
  bgmGain.gain.value = 0.35 * (volumes.music / 100);
  sfxGain.gain.value = 0.8 * (volumes.effect / 100);
}

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(name) {
  const [, n, o] = name.match(/^([A-G]#?)(\d)$/);
  return 440 * Math.pow(2, (NOTE[n] + (Number(o) + 1) * 12 - 69) / 12);
}

function tone(out, wave, f, t, dur, vol, slideTo) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  if (wave === 'pulse') o.setPeriodicWave(pulse25);
  else o.type = wave;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(out, t, dur, vol, hp = 6000) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(out);
  s.start(t);
  s.stop(t + dur);
}

// BGM: C장조 112BPM 8마디 반복
const STEP = 60 / 112 / 2;
const MELODY = [
  'E5', '-', 'G5', '-', 'C6', '-', 'G5', 'E5',
  'A5', '-', 'C6', '-', 'E5', '-', 'C6', 'A5',
  'F5', '-', 'A5', '-', 'C6', '-', 'A5', 'F5',
  'G5', '-', 'B5', '-', 'D6', '-', 'B5', 'G5',
  'E5', 'G5', 'C6', 'E6', 'D6', 'C6', 'B5', 'G5',
  'A5', 'C6', 'E6', 'D6', 'C6', 'B5', 'A5', 'E5',
  'F5', 'A5', 'C6', 'F6', 'E6', 'D6', 'C6', 'A5',
  'G5', '-', 'B5', 'D6', '-', 'C6', '-', '-',
];
const BASS = ['C3', 'A2', 'F2', 'G2', 'C3', 'A2', 'F2', 'G2'];
const ARP = [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']];

let bgmTimer = null;
let step = 0;
let nextTime = 0;

function scheduleStep(i, t) {
  const bar = Math.floor(i / 8);
  const beat = i % 8;
  if (MELODY[i] !== '-') tone(bgmGain, 'pulse', freq(MELODY[i]), t, STEP * 0.9, 0.16);
  if (beat % 2 === 0) {
    const root = BASS[bar];
    const note = beat % 4 === 2 ? root.replace(/\d/, (o) => String(Number(o) + 1)) : root;
    tone(bgmGain, 'triangle', freq(note), t, STEP * 1.8, 0.38);
  }
  tone(bgmGain, 'square', freq(ARP[bar % 4][beat % 3]), t, STEP * 0.45, 0.035);
  if (beat % 2 === 1) noise(bgmGain, t, 0.05, 0.07);
  if (beat === 4) noise(bgmGain, t, 0.12, 0.12, 1500);
}

function startBgm() {
  if (bgmTimer || !unlocked || muted || volumes.music === 0 || !setup()) return;
  step = 0;
  nextTime = ctx.currentTime + 0.05;
  bgmTimer = setInterval(() => {
    while (nextTime < ctx.currentTime + 0.12) {
      scheduleStep(step, nextTime);
      nextTime += STEP;
      step = (step + 1) % MELODY.length;
    }
  }, 25);
}

function stopBgm() {
  clearInterval(bgmTimer);
  bgmTimer = null;
}

// 효과음 (타이밍은 부화 · 진화 화면 연출에 맞춤)
const SFX = {
  // 알 흔들림 1.4초 → 깨짐
  hatch(t) {
    [0, 0.25, 0.5, 0.75, 1.0, 1.15, 1.28].forEach((d, i) =>
      tone(sfxGain, 'square', freq(i % 2 ? 'D5' : 'C5'), t + d, 0.05, 0.18),
    );
    noise(sfxGain, t + 1.4, 0.25, 0.35, 800);
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(sfxGain, 'pulse', freq(n), t + 1.42 + i * 0.06, 0.12, 0.25));
  },
  // 0.9초 동안 차오르다 새 모습 공개와 함께 팡파르
  evolve(t) {
    const up = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
    up.forEach((n, i) => tone(sfxGain, 'square', freq(n), t + i * 0.09, 0.09, 0.12 + i * 0.015));
    const f = t + 0.9;
    tone(sfxGain, 'pulse', freq('G5'), f, 0.12, 0.28);
    tone(sfxGain, 'pulse', freq('G5'), f + 0.14, 0.12, 0.28);
    tone(sfxGain, 'pulse', freq('C6'), f + 0.28, 0.55, 0.3);
    tone(sfxGain, 'triangle', freq('C4'), f + 0.28, 0.55, 0.4);
    noise(sfxGain, f + 0.28, 0.3, 0.2, 3000);
  },
  levelUp(t) {
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(sfxGain, 'pulse', freq(n), t + i * 0.07, 0.09, 0.25));
    tone(sfxGain, 'pulse', freq('E6'), t + 0.3, 0.22, 0.25);
  },
  feed(t) {
    tone(sfxGain, 'square', 880, t, 0.08, 0.2, 520);
    tone(sfxGain, 'square', 700, t + 0.11, 0.1, 0.2, 380);
  },
};

export function playSfx(name) {
  if (muted || volumes.effect === 0 || !SFX[name] || !setup()) return;
  if (ctx.state === 'suspended') ctx.resume();
  SFX[name](ctx.currentTime + 0.02);
}

export function initSound() {
  if (typeof window === 'undefined' || initSound.done) return;
  initSound.done = true;

  const unlock = () => {
    if (!setup()) return;
    ctx.resume();
    unlocked = true;
    startBgm();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  // 탭을 떠나면 잠시 멈춤
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
}

export function setVolumes({ music, effect }) {
  volumes = { music: music ?? volumes.music, effect: effect ?? volumes.effect };
  applyGain();
  if (volumes.music === 0) stopBgm();
  else startBgm();
}

export function isMuted() {
  return muted;
}

export function setMuted(next) {
  muted = next;
  try {
    localStorage.setItem(MUTED_KEY, String(next));
  } catch {
    /* 저장 실패는 무시 */
  }
  applyGain();
  if (muted) stopBgm();
  else startBgm();
  listeners.forEach((fn) => fn());
}

export function subscribeSound(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
