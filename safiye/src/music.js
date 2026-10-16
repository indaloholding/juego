// Música latina generada en tiempo real con WebAudio (sin archivos ni derechos de autor):
// bachata, salsa, reguetón y una pieza lenta de saxo para la noche romántica.
let ctx = null, master = null, timer = null, style = null, step = 0, nextT = 0;
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

function ac() {
  if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination); }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function env(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function pluck(m, t, v = 0.18, d = 0.35, type = 'sawtooth', cutoff = 2600) {
  const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  o.type = type; o.frequency.value = midi(m); f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff, t); f.frequency.exponentialRampToValueAtTime(500, t + d);
  env(g, t, 0.004, d, v); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
}
function bass(m, t, d = 0.3, v = 0.35) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = midi(m);
  env(g, t, 0.01, d, v); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
}
let noiseBuf = null;
function noise(t, d, v, hp = 7000) {
  if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp; env(g, t, 0.002, d, v);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + d + 0.02);
}
function drum(t, f0, f1, d, v) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); env(g, t, 0.002, d, v);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
}
function sax(m, t, d, v = 0.12) {
  const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.value = midi(m); lfo.frequency.value = 5.5; lg.gain.value = 6; lfo.connect(lg); lg.connect(o.frequency);
  f.type = 'lowpass'; f.frequency.value = 1500; f.Q.value = 4;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.08); g.gain.setValueAtTime(v, t + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); lfo.start(t); o.stop(t + d + 0.05); lfo.stop(t + d + 0.05);
}

// Progresiones: [raíz midi, intervalos del acorde]
const MIN = [0, 3, 7], MAJ = [0, 4, 7], DOM = [0, 4, 7, 10], M7 = [0, 3, 7, 10];
const STYLES = {
  bachata: { bpm: 128, chords: [[57, MIN], [55, MAJ], [53, MAJ], [52, MAJ]] }, // Am G F E
  salsa: { bpm: 180, chords: [[50, M7], [55, DOM], [48, MAJ], [57, DOM]] }, // Dm7 G7 C A7
  reggaeton: { bpm: 95, chords: [[56, MAJ], [58, MAJ], [51, MIN], [53, MIN]] }, // Ab Bb Eb- Fm
  romance: { bpm: 84, chords: [[50, M7], [50, M7], [55, DOM], [57, DOM]] },
};
function playStep(st, s, t, dur) {
  const bar = Math.floor(s / 16) % 4, i = s % 16, [root, iv] = STYLES[st].chords[bar];
  const tones = iv.map(x => root + x);
  if (st === 'bachata') {
    // requinto: arpegio rápido sobre el acorde
    const arp = [0, 1, 2, 1, 2, 3, 2, 1];
    if (i % 2 === 0) pluck(tones[arp[(i / 2) % 8] % tones.length] + 12 + (i % 8 === 6 ? 12 : 0), t, 0.13, 0.28, 'triangle', 3200);
    if (i % 4 === 2) pluck(tones[0] + 24, t, 0.06, 0.2, 'square', 2200);
    // bajo de bachata (1 y anticipaciones)
    if (i === 0 || i === 8) bass(root - 12, t, 0.35); if (i === 6 || i === 14) bass(root - 12 + 7, t, 0.2, 0.25);
    // güira
    if (i % 2 === 0) noise(t, i % 4 === 0 ? 0.07 : 0.035, i % 4 === 0 ? 0.09 : 0.05);
    else noise(t, 0.02, 0.03);
    // bongó (martillo)
    if (i % 4 === 0) drum(t, 420, 300, 0.12, 0.25); if (i % 4 === 2) drum(t, 300, 220, 0.1, 0.18);
    if (i === 12) drum(t, 160, 70, 0.25, 0.35);
  } else if (st === 'salsa') {
    const mont = [0, 2, 1, 2, 0, 2, 1, 3];
    if (i % 2 === 1 || i === 0) pluck(tones[mont[i % 8] % tones.length] + 12, t, 0.1, 0.18, 'square', 2600);
    if (i === 6 || i === 12) bass(root - 12 + (i === 12 ? 7 : 0), t, 0.3);
    const clave = bar % 2 === 0 ? [0, 6, 12] : [4, 8]; if (clave.includes(i)) drum(t, 2400, 2200, 0.05, 0.18);
    if (i % 4 === 2) noise(t, 0.05, 0.05, 4000);
    if (i === 14 || i === 15) drum(t, 330, 250, 0.1, 0.2);
  } else if (st === 'reggaeton') {
    if (i % 4 === 0) drum(t, 140, 45, 0.25, 0.55);
    if ([3, 6, 11, 14].includes(i)) noise(t, 0.09, 0.14, 1800);
    if (i % 2 === 0) noise(t, 0.02, 0.03);
    if (i === 0 || i === 3 || i === 6 || i === 10) bass(root - 12, t, 0.25, 0.4);
    if (i % 8 === 0) tones.forEach(m => pluck(m + 12, t, 0.05, 0.6, 'triangle', 1500));
  } else { // romance: saxo lento, bajo caminante y escobillas
    if (i % 4 === 0) bass(root - 12 + [0, 7, 5, 3][i / 4], t, 0.4, 0.35);
    if (i % 4 === 2 || i % 4 === 3) noise(t, 0.08, 0.025, 3000);
    const mel = [[0, 74, 6], [6, 72, 2], [8, 69, 4], [12, 67, 4]];
    const alt = [[0, 69, 3], [3, 72, 3], [6, 74, 4], [12, 77, 4]];
    for (const [pos, m, len] of (bar % 2 ? alt : mel)) if (pos === i) sax(m - (bar === 2 ? 2 : 0), t, len * dur * 1.1);
    if (i === 0) tones.forEach(m => pluck(m, t, 0.04, 1.4, 'triangle', 900));
  }
}
function tick() {
  if (!style || !ctx) return;
  const dur = 60 / STYLES[style].bpm / 4;
  const ahead = document.hidden ? 1.6 : 0.15;
  if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.02;
  while (nextT < ctx.currentTime + ahead) {
    const swing = style === 'romance' && step % 2 ? dur * 0.25 : 0;
    playStep(style, step, nextT + swing, dur);
    nextT += dur; step++;
  }
}
export const music = {
  styles: { bachata: 'Bachata', salsa: 'Salsa', reggaeton: 'Reguetón' },
  play(st) {
    if (!ac()) return; style = st; step = 0; nextT = ctx.currentTime + 0.05;
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(st === 'romance' ? 0.4 : 0.3, ctx.currentTime);
    if (!timer) timer = setInterval(tick, 25);
  },
  stop() { style = null; if (timer) { clearInterval(timer); timer = null; } },
  get playing() { return style; },
};
