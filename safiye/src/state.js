import { CASES, NAMES, PAY, SPECIES_WEIGHTS, CLINICS, TREATMENTS, MIN, H } from './data.js';

const KEY = 'safiye-911-save-v1';
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function felicidad(ale) {
  return clamp(15 + 0.45 * ale.sac + 0.4 * ale.relax + ale.bonus, 0, 100);
}
export function mood(f) {
  if (f >= 80) return { emoji: '😄', label: 'Feliz como una perdiz' };
  if (f >= 60) return { emoji: '🙂', label: 'Contento' };
  if (f >= 40) return { emoji: '😐', label: 'Regular' };
  if (f >= 20) return { emoji: '😢', label: 'Triste' };
  return { emoji: '😭', label: 'Muy triste' };
}

export function newGame(now) {
  const s = {
    v: 1, created: now, last: now, money: 600, rep: 3, location: 'casa', porscheColor: '#c8102e',
    unlocked: { stuttgart: true, estambul: false, barcelona: false }, closed: {}, upgrades: {},
    patients: [], nextArrival: { stuttgart: now + 45 * MIN }, emilioNext: null,
    ale: { sac: 55, relax: 30, bonus: 0 },
    stats: { cured: 0, died: 0, happyMs: 0, trackedMs: 0, meals: 0, massages: 0, earned: 0 },
    log: [], seq: 1, settings: { sound: true, theme: 'light', light: 'real' }, onboarded: false, memorial: [],
  };
  spawn(s, 'stuttgart', now, 'miope');
  spawn(s, 'stuttgart', now, 'sol');
  spawn(s, 'stuttgart', now - 20 * MIN, null, 'gato');
  addLog(s, now, '🏥', 'La clínica de Stuttgart abre sus puertas. ¡Bienvenida, Dra. Safiye!');
  return s;
}

export function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* sin almacenamiento */ }
  return null;
}
export function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sin almacenamiento */ } }
export function wipe() { try { localStorage.removeItem(KEY); } catch (e) { /* nada */ } }

export function addLog(s, t, icon, text) {
  s.log.unshift({ t, icon, text });
  if (s.log.length > 120) s.log.length = 120;
}

function chooseSpecies() {
  let r = Math.random();
  for (const [sp, w] of SPECIES_WEIGHTS) { if ((r -= w) <= 0) return sp; }
  return 'gato';
}
export function hoursFor(s, c) {
  let h = c.h;
  if (s.upgrades.musica) h *= 1.15;
  if (s.upgrades.hierba && c.sp === 'gato') h *= 1.25;
  return h;
}
export function spawn(s, clinic, t, caseId = null, species = null) {
  let c;
  if (caseId) c = CASES.find(x => x.id === caseId);
  else {
    const sp = species || chooseSpecies();
    const busy = new Set(s.patients.map(p => p.caseId));
    const pool = CASES.filter(x => x.sp === sp && !busy.has(x.id));
    c = pick(pool.length ? pool : CASES.filter(x => x.sp === sp));
  }
  const used = new Set(s.patients.map(p => p.name));
  const names = NAMES[c.sp].filter(n => !used.has(n));
  const p = {
    id: s.seq++, clinic, caseId: c.id, species: c.sp, name: pick(names.length ? names : NAMES[c.sp]),
    variant: c.v ?? Math.floor(Math.random() * 6), arrivedAt: t, deadline: t + hoursFor(s, c) * H,
    status: 'waiting', reviewAt: null, reviewDeadline: null,
  };
  s.patients.push(p);
  return p;
}
export const caseOf = (p) => CASES.find(c => c.id === p.caseId);
export const payFor = (s, p) => Math.round(PAY[p.species] * (0.7 + s.rep * 0.1) * (s.upgrades.cafetera ? 1.1 : 1));

function kill(s, p, t, events) {
  p.status = 'dead';
  s.stats.died++; s.rep = clamp(s.rep - 0.35, 1, 5);
  const txt = p.species === 'gato' ? `${p.name} se ha ido al cielo de los gatos 🌈 (${CLINICS[p.clinic].name})` : `${p.name} (${p.species}) ha cruzado el arcoíris 🌈 (${CLINICS[p.clinic].name})`;
  addLog(s, t, '🕊️', txt);
  s.memorial.unshift({ name: p.name, species: p.species, t });
  events.push({ type: 'dead', p, text: txt });
}

/** Avanza la simulación en tiempo real hasta `now` (también lo que pasó con el juego cerrado). */
export function advance(s, now) {
  const events = [];
  let t = s.last;
  if (now <= t) return events;
  const STEP = 5 * MIN;
  while (t < now) {
    const t2 = Math.min(now, t + STEP), dtH = (t2 - t) / H;
    // Alejandro
    const f0 = felicidad(s.ale);
    s.ale.sac = clamp(s.ale.sac - 16 * dtH, 0, 100);
    s.ale.relax = clamp(s.ale.relax - 10 * dtH, 0, 100);
    s.ale.bonus = s.ale.bonus > 0 ? Math.max(0, s.ale.bonus - 6 * dtH) : Math.min(0, s.ale.bonus + 6 * dtH);
    const f1 = felicidad(s.ale);
    s.stats.trackedMs += t2 - t;
    if ((f0 + f1) / 2 >= 60) s.stats.happyMs += t2 - t;
    if (f0 >= 40 && f1 < 40) { addLog(s, t2, '😢', 'Alejandro se está poniendo triste. Necesita comida rica o un masaje.'); events.push({ type: 'ale', text: 'Alejandro se está poniendo triste' }); }
    // llegadas
    for (const k of Object.keys(CLINICS)) {
      if (!s.unlocked[k] || s.closed[k]) { if (s.closed[k]) s.nextArrival[k] = Math.max(s.nextArrival[k] || 0, t2); continue; }
      while (s.nextArrival[k] && s.nextArrival[k] <= t2) {
        const at = s.nextArrival[k];
        const n = s.patients.filter(p => p.clinic === k && (p.status === 'waiting' || p.status === 'obs')).length;
        if (n < CLINICS[k].cap) {
          const p = spawn(s, k, at);
          addLog(s, at, '🚪', `Llega ${p.name} a ${CLINICS[k].name}: ${caseOf(p).title}.`);
          events.push({ type: 'arrive', p });
        }
        s.nextArrival[k] = at + CLINICS[k].every * MIN * (0.7 + Math.random() * 0.6) * (1.4 - s.rep * 0.08);
      }
    }
    // Emilio en Barcelona
    if (s.unlocked.barcelona && s.emilioNext && s.emilioNext <= t2) {
      const cand = s.patients.filter(p => p.clinic === 'barcelona' && p.status === 'waiting' && !caseOf(p).rev && p.deadline > s.emilioNext)
        .sort((a, b) => a.deadline - b.deadline)[0];
      if (cand) {
        cand.status = 'gone'; const pay = Math.round(payFor(s, cand) * 0.8);
        s.money += pay; s.stats.cured++; s.stats.earned += pay;
        addLog(s, s.emilioNext, '🧑‍⚕️', `Emilio ha curado a ${cand.name} en Barcelona (+${pay} €). «Arte catalán», dice.`);
        events.push({ type: 'emilio', p: cand });
      }
      s.emilioNext += 90 * MIN;
    }
    // plazos
    for (const p of s.patients) {
      if (p.status === 'waiting' && p.deadline <= t2) kill(s, p, p.deadline, events);
      else if (p.status === 'obs' && p.reviewDeadline <= t2) kill(s, p, p.reviewDeadline, events);
    }
    t = t2;
  }
  s.patients = s.patients.filter(p => p.status === 'waiting' || p.status === 'obs');
  s.last = now;
  return events;
}

export function treat(s, p, tid, now) {
  const c = caseOf(p);
  if (tid !== c.t) {
    p.deadline -= Math.max(0, (p.deadline - now) * 0.25);
    s.rep = clamp(s.rep - 0.05, 1, 5);
    return { ok: false };
  }
  const pay = payFor(s, p);
  s.rep = clamp(s.rep + 0.06, 1, 5);
  if (c.rev) {
    const half = Math.round(pay * 0.5);
    p.status = 'obs'; p.reviewAt = now + c.rev * H; p.reviewDeadline = p.reviewAt + 3 * H;
    s.money += half; s.stats.earned += half;
    addLog(s, now, '🩺', `${p.name} tratado/a con ${TREATMENTS[c.t][0].toLowerCase()}. Toca ${c.revTxt} en ${c.rev} h (+${half} €).`);
    return { ok: true, pay: half, review: true };
  }
  p.status = 'gone'; s.money += pay; s.stats.cured++; s.stats.earned += pay;
  s.patients = s.patients.filter(x => x !== p);
  addLog(s, now, '💚', `${p.name} sale curado/a de ${CLINICS[p.clinic].name} (+${pay} €).`);
  return { ok: true, pay };
}
export function review(s, p, now) {
  if (now < p.reviewAt) return { ok: false };
  const pay = Math.round(payFor(s, p) * 0.75);
  p.status = 'gone'; s.money += pay; s.stats.cured++; s.stats.earned += pay; s.rep = clamp(s.rep + 0.08, 1, 5);
  s.patients = s.patients.filter(x => x !== p);
  addLog(s, now, '✅', `Revisión superada: ${p.name} se va a casa feliz (+${pay} €).`);
  return { ok: true, pay };
}

export function feed(s, food, now) {
  s.money -= food.price; s.ale.sac = clamp(s.ale.sac + food.sac, 0, 100);
  s.ale.bonus = clamp(s.ale.bonus + food.feli, -35, 45); s.stats.meals++;
  addLog(s, now, food.emoji, `Safiye le prepara ${food.name.toLowerCase()} a Alejandro. «${food.line}»`);
}
export function massage(s, quality, now) {
  s.ale.relax = clamp(s.ale.relax + 50 + 15 * quality, 0, 100);
  s.ale.bonus = clamp(s.ale.bonus + 6, -35, 45); s.stats.massages++;
  addLog(s, now, '💆‍♂️', 'Masaje para Alejandro. Ronronea más que los gatos de la clínica.');
}
export function unlock(s, k, now) {
  const c = CLINICS[k];
  if (s.unlocked[k] || s.money < c.cost) return false;
  s.money -= c.cost; s.unlocked[k] = true; s.nextArrival[k] = now + 25 * MIN;
  if (k === 'barcelona') s.emilioNext = now + 90 * MIN;
  spawn(s, k, now);
  addLog(s, now, '🎉', `¡Nueva clínica en ${c.name}!` + (k === 'barcelona' ? ' Emilio ya está al mando.' : ''));
  return true;
}

/** Qué hace Alejandro según la hora real. */
export function aleActivity(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60, dow = date.getDay(), weekend = dow === 0 || dow === 6;
  if (h < 7.5 || h >= 23.75) return 'dormir';
  if (!weekend && ((h >= 9 && h < 13.5) || (h >= 14.5 && h < 18))) return 'trabajo';
  const slot = Math.floor(date.getTime() / (45 * MIN));
  const r = ((Math.sin(slot * 12.9898) * 43758.5453) % 1 + 1) % 1;
  if (h >= 11 && h < 21) { if (r < 0.25) return 'piscina'; if (r < 0.55) return 'barbacoa'; }
  return 'play';
}

export function fmtLeft(ms) {
  if (ms <= 0) return '¡ya!';
  const m = Math.ceil(ms / MIN);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
