// Sonidos sintetizados con WebAudio (sin archivos externos).
let ctx = null, on = true;
export function setSound(v) { on = v; }
function ac() { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
function tone(f1, f2, dur, type = 'sine', vol = 0.12, delay = 0) {
  if (!on) return; const c = ac(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 2400;
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp); lp.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
export const sfx = {
  tap: () => tone(660, 880, 0.08, 'triangle', 0.08),
  key: () => tone(520, 520, 0.07, 'square', 0.04),
  ok: () => { tone(523, 523, 0.12, 'triangle'); tone(659, 659, 0.12, 'triangle', 0.12, 0.1); tone(784, 784, 0.2, 'triangle', 0.12, 0.2); },
  bad: () => { tone(300, 180, 0.25, 'sawtooth', 0.06); },
  coin: () => { tone(988, 988, 0.08, 'square', 0.05); tone(1319, 1319, 0.2, 'square', 0.05, 0.08); },
  meow: () => { tone(700, 520, 0.35, 'sawtooth', 0.05); tone(900, 600, 0.3, 'sine', 0.05, 0.02); },
  sad: () => { tone(440, 330, 0.4, 'sine', 0.08); tone(330, 247, 0.6, 'sine', 0.08, 0.35); },
  ding: () => tone(1200, 1180, 0.4, 'sine', 0.08),
  engine: (dur = 3) => {
    if (!on) return; const c = ac(); if (!c) return; const t = c.currentTime;
    for (const [m, v] of [[1, 0.05], [1.5, 0.03], [2, 0.02]]) {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(55 * m, t); o.frequency.exponentialRampToValueAtTime(140 * m, t + dur * 0.6); o.frequency.exponentialRampToValueAtTime(110 * m, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
      o.connect(lp); lp.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.1);
    }
  },
};
