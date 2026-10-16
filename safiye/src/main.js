import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './style.css';
import * as THREE from 'three';
import { Engine } from './engine.js';
import { buildHouse } from './house.js';
import { buildClinic } from './clinic.js';
import { buildDrive } from './drive.js';
import { CASES, TREATMENTS, CLINICS, FOODS, UPGRADES, PORSCHE_COLORS, ALE_ACTIVITY, SPECIES_EMOJI, EMILIO_LINES, H, MIN } from './data.js';
import * as G from './state.js';
import { legalHTML } from './legal.js';
import { sfx, setSound } from './sfx.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtTime = (t) => new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const fmtDT = (t) => new Date(t).toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
const eur = (n) => `${Math.round(n).toLocaleString('es-ES')} €`;
const ACCESS = 'safiye-911-access';
const CODE = '911';
const LOC_LABEL = { casa: '🏠 Casa · Stuttgart', stuttgart: '🇩🇪 Clínica Stuttgart', estambul: '🇹🇷 Clínica Estambul', barcelona: '🇪🇸 Clínica Barcelona' };

let S, engine, house = null, clinic = null, busy = false, traveling = false;
const cured = new Set();

/* ============ Acceso con código 911 ============ */
function gate() {
  let ok = false; try { ok = localStorage.getItem(ACCESS) === 'ok'; } catch (e) { /* privado */ }
  if (ok) return start();
  let code = '';
  const cells = [...document.querySelectorAll('#code i')];
  const draw = () => cells.forEach((c, i) => { c.textContent = code[i] ? '•' : ''; c.classList.toggle('on', i === code.length); });
  draw();
  const press = (k) => {
    if (k === 'del') { code = code.slice(0, -1); draw(); return; }
    if (k === 'hint') { $('#hint').textContent = 'Pista: el modelo de su coche favorito 🏎️'; return; }
    if (code.length >= 3) return;
    code += k; sfx.key(); draw();
    if (code.length === 3) {
      if (code === CODE) {
        $('#code').classList.add('ok'); cells.forEach((c, i) => (c.textContent = CODE[i])); sfx.engine(2.2);
        try { localStorage.setItem(ACCESS, 'ok'); } catch (e) { /* nada */ }
        setTimeout(start, 900);
      } else {
        $('#code').classList.add('shake'); sfx.bad(); $('#hint').textContent = 'Código incorrecto. Piensa en un Porsche…';
        setTimeout(() => { $('#code').classList.remove('shake'); code = ''; draw(); }, 450);
      }
    }
  };
  $('#keypad').addEventListener('click', e => { const b = e.target.closest('button'); if (b) press(b.dataset.k || b.textContent); });
  addEventListener('keydown', e => { if ($('#gate').hidden) return; if (/^\d$/.test(e.key)) press(e.key); if (e.key === 'Backspace') press('del'); });
}

/* ============ Arranque ============ */
function start() {
  $('#gate').hidden = true; $('#game').hidden = false;
  const now = Date.now();
  S = G.load() || G.newGame(now);
  const away = now - S.last;
  const events = G.advance(S, now);
  applySettings();
  engine = new Engine($('#c'), $('#labels'));
  engine.onMiss = closePop;
  loadScene(S.location);
  bindUI();
  tick();
  setInterval(tick, 1000);
  if (!S.onboarded) onboarding();
  else if (away > 2 * MIN && events.length) awaySummary(events, away);
  G.save(S);
  if (import.meta.env.DEV) window.__safiye = { get S() { return S; }, get engine() { return engine; }, travelTo, loadScene, tick, massageGame };
  addEventListener('visibilitychange', () => { if (document.hidden) G.save(S); });
  addEventListener('pagehide', () => G.save(S));
}
function applySettings() {
  document.documentElement.dataset.theme = S.settings.theme;
  setSound(S.settings.sound);
}

/* ============ Escenas ============ */
function loadScene(loc) {
  closePop(); engine.clear(); house = clinic = null;
  if (loc === 'casa') {
    house = buildHouse(engine, {
      porscheColor: S.porscheColor, atHome: true,
      onAle: (pt) => openAle(), onAleSpot: (a) => { if (house.activity === a) openAle(); },
      onKitchen: () => openCook(house.saf.root), onPorsche: () => openTravel(),
      onTV: () => bubble(house.ale.head, house.activity === 'play' ? '¡Ahora no, Safi, que estoy en la prórroga! 🎮' : 'La PlayStation descansa. Por ahora.', 3500),
      onSafiye: () => bubble(house.saf.head, ['¡A por el día! 💪', 'Alejandro, ¿has comido?', 'Echo de menos a mis gatitos de la clínica.'][Math.floor(Math.random() * 3)], 2500),
    });
    house.setActivity(G.aleActivity());
  } else {
    clinic = buildClinic(engine, loc, {
      porscheColor: S.porscheColor, present: true,
      onPatient: (id) => openPatient(id), onPorsche: () => openTravel(),
      onEmilio: (pt, em) => bubble(em.head, EMILIO_LINES[Math.floor(Math.random() * EMILIO_LINES.length)], 3500),
      onSafiye: () => bubble(clinic.saf.head, '¿Quién es el siguiente? 🩺', 2200),
    });
    clinic.sync(S.patients, cured);
  }
  lighting();
}
function lighting() { const d = new Date(); engine.setLighting(d.getHours() + d.getMinutes() / 60, S.settings.light === 'day'); }

/* ============ Bucle en tiempo real ============ */
let lastSave = 0;
function tick() {
  const now = Date.now();
  const ev = G.advance(S, now);
  for (const e of ev) {
    if (e.type === 'dead') { toast(e.text, 'bad'); sfx.sad(); }
    else if (e.type === 'arrive') { toast(`${SPECIES_EMOJI[e.p.species]} Nuevo paciente en ${CLINICS[e.p.clinic].name}: ${e.p.name} · ${G.caseOf(e.p).title}`); sfx.ding(); }
    else if (e.type === 'emilio') { cured.add(e.p.id); toast(`🧑‍⚕️ Emilio ha curado a ${e.p.name} en Barcelona`, 'good'); }
    else if (e.type === 'ale') { toast('😢 Alejandro se está poniendo triste…', 'bad'); }
  }
  if (clinic) {
    clinic.sync(S.patients, cured);
    clinic.updateLabels(now, labelFor);
  }
  if (house) house.setActivity(G.aleActivity(new Date(now)));
  if (now - lastSave > 5000) { G.save(S); lastSave = now; }
  if (new Date(now).getSeconds() === 0) lighting();
  renderHUD(now);
  if (popRefresh) popRefresh();
}
function labelFor(p, now) {
  const em = SPECIES_EMOJI[p.species];
  if (p.status === 'obs') {
    if (now >= p.reviewAt) return { html: `${em} ${esc(p.name)} · 🩺 ¡Revisión! (${G.fmtLeft(p.reviewDeadline - now)})`, cls: 'ready' };
    return { html: `${em} ${esc(p.name)} · 🩺 en ${G.fmtLeft(p.reviewAt - now)}`, cls: 'obs' };
  }
  const left = p.deadline - now;
  return { html: `${em} ${esc(p.name)} · ⏳ ${G.fmtLeft(left)}`, cls: left < H ? 'urgent' : '' };
}

function renderHUD(now) {
  $('#money').textContent = eur(S.money);
  $('#rep').textContent = S.rep.toFixed(1);
  $('#clock').textContent = fmtTime(now);
  $('#loc').textContent = LOC_LABEL[S.location];
  const f = G.felicidad(S.ale), m = G.mood(f);
  $('#aleFace').textContent = m.emoji; $('#aleMood').textContent = `${m.label} · ${Math.round(f)} %`;
  const bar = $('#aleBar'); bar.style.width = f + '%'; bar.style.background = f >= 60 ? 'var(--teal)' : f >= 40 ? 'var(--warn)' : 'var(--bad)';
  // panel de pacientes
  const list = S.patients.slice().sort((a, b) => urgencyOf(a, now) - urgencyOf(b, now));
  const urgent = list.filter(p => (p.status === 'waiting' && p.deadline - now < H) || (p.status === 'obs' && now >= p.reviewAt)).length;
  const badge = $('#sideBadge'); badge.textContent = list.length; badge.classList.toggle('zero', urgent === 0);
  document.title = urgent ? `(${urgent}) 🚨 Safiye · The Videogame` : 'Safiye · The Videogame';
  let html = '';
  for (const k of Object.keys(CLINICS)) {
    if (!S.unlocked[k]) continue;
    const ps = list.filter(p => p.clinic === k);
    html += `<div class="grp"><span>${CLINICS[k].flag} ${CLINICS[k].name}${S.closed[k] ? ' · cerrada 🏖️' : ''}</span><span>${ps.length}/${CLINICS[k].cap}</span></div>`;
    if (!ps.length) html += `<div class="empty">Sin pacientes ahora mismo.</div>`;
    for (const p of ps) {
      const c = G.caseOf(p); let tm, cls = '';
      if (p.status === 'obs') { if (now >= p.reviewAt) { tm = '🩺 ¡Ya!'; cls = 'ready'; } else tm = '🩺 ' + G.fmtLeft(p.reviewAt - now); }
      else { tm = '⏳ ' + G.fmtLeft(p.deadline - now); if (p.deadline - now < H) cls = 'urgent'; }
      html += `<button class="pt" data-pid="${p.id}"><span class="em">${SPECIES_EMOJI[p.species]}</span><span class="tx"><b>${esc(p.name)}</b><small>${esc(c.title)}</small></span><span class="tm ${cls}">${tm}</span></button>`;
    }
  }
  if ($('#sideBody').dataset.h !== html) { $('#sideBody').innerHTML = html; $('#sideBody').dataset.h = html; }
}
const urgencyOf = (p, now) => p.status === 'obs' ? (now >= p.reviewAt ? p.reviewDeadline - now - 10 * H : p.reviewAt - now + 2 * H) : p.deadline - now;

/* ============ UI general ============ */
function bindUI() {
  $('#sideToggle').onclick = () => { $('#side').classList.toggle('collapsed'); sfx.tap(); };
  if (innerWidth < 760) $('#side').classList.add('collapsed');
  $('#sideBody').onclick = (e) => {
    const b = e.target.closest('[data-pid]'); if (!b) return;
    const p = S.patients.find(x => x.id === +b.dataset.pid); if (!p) return;
    if (S.location === p.clinic) { if (innerWidth < 760) $('#side').classList.add('collapsed'); openPatient(p.id); }
    else confirmTravel(p.clinic, `${p.name} está en ${CLINICS[p.clinic].name}.`);
  };
  $('#ale').onclick = () => { if (S.location === 'casa') openAle(); else confirmTravel('casa', 'Alejandro está en casa, en Stuttgart.'); };
  $('#dock').onclick = (e) => {
    const b = e.target.closest('[data-go]'); if (!b) return; sfx.tap();
    const g = b.dataset.go;
    if (g === 'casa') { if (S.location === 'casa') { toast('Ya estás en casa 🏠'); } else travelTo('casa'); }
    else if (g === 'viajar') openTravel(); else if (g === 'mejoras') openUpgrades(); else if (g === 'diario') openDiary(); else openSettings();
  };
  $('#modalClose').onclick = closeModal;
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closePop(); } });
  $('#skip').onclick = () => driveCtl && driveCtl.skip();
}

function toast(text, cls = '') {
  const t = document.createElement('div'); t.className = 'toast ' + cls; t.textContent = text;
  $('#toasts').appendChild(t);
  while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
  setTimeout(() => t.remove(), 4200);
}
function bubble(obj, text, ms = 3000, cls = 'bubble') {
  const l = engine.label(obj, esc(text), cls, 0.55);
  setTimeout(() => engine.removeLabel(l), ms);
  return l;
}

/* ---------- Popover anclado al elemento pulsado ---------- */
let popRefresh = null;
const tmpV = new THREE.Vector3();
function openPop(anchor, render, onAct, dy = 1.8, live = false) {
  const el = $('#pop'); el.hidden = false;
  const paint = () => { el.innerHTML = `<button class="x" data-act="close" aria-label="Cerrar">✕</button>` + render(); };
  paint(); popRefresh = live ? paint : null;
  const sheet = innerWidth < 760; el.classList.toggle('sheet', sheet);
  engine.followPop = sheet ? null : () => {
    anchor.getWorldPosition(tmpV); tmpV.y += dy;
    const p = engine.project(tmpV), w = el.offsetWidth, h = el.offsetHeight;
    let x = p.x + 30, y = p.y - h / 2;
    if (x + w > innerWidth - 12) x = p.x - w - 30;
    x = Math.max(12, Math.min(innerWidth - w - 12, x)); y = Math.max(76, Math.min(innerHeight - h - 90, y));
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  if (sheet) el.style.transform = '';
  el.onclick = (e) => { const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; if (b.dataset.act === 'close') return closePop(); onAct(b.dataset.act, b); };
}
function closePop() { const el = $('#pop'); el.hidden = true; el.innerHTML = ''; if (engine) engine.followPop = null; popRefresh = null; }

/* ---------- Modal ---------- */
function openModal(html, bind) {
  $('#modalBody').innerHTML = html; $('#modal').hidden = false; closePop();
  $('#modalBody').onclick = (e) => { const b = e.target.closest('[data-act],[data-legal]'); if (!b) return; e.preventDefault(); if (b.dataset.legal) return openModal(legalHTML(b.dataset.legal)); if (bind) bind(b.dataset.act, b); };
}
function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }
document.addEventListener('click', e => { const a = e.target.closest('.legal-mini [data-legal]'); if (a) { e.preventDefault(); openModal(legalHTML(a.dataset.legal)); } });

/* ============ Alejandro ============ */
function aleBars() {
  const a = S.ale, f = G.felicidad(a), m = G.mood(f), act = ALE_ACTIVITY[house ? house.activity : G.aleActivity()];
  const bar = (v, c) => `<span class="bar"><i style="width:${v}%;background:${c}"></i></span>`;
  return `<h3>${m.emoji} Alejandro <small>${act.emoji} ${act.label}</small></h3>
  <div class="mini"><span>Felicidad</span>${bar(f, f >= 60 ? 'var(--teal)' : f >= 40 ? 'var(--warn)' : 'var(--bad)')}<span>${Math.round(f)}%</span></div>
  <div class="mini"><span>Estómago</span>${bar(a.sac, 'var(--gold)')}<span>${Math.round(a.sac)}%</span></div>
  <div class="mini"><span>Mimos</span>${bar(a.relax, '#d27aa6')}<span>${Math.round(a.relax)}%</span></div>
  <div class="mini"><span>Gourmet</span>${bar(Math.max(0, a.bonus) / 45 * 100, '#7a9cc6')}<span>${a.bonus >= 0 ? '+' : ''}${Math.round(a.bonus)}</span></div>`;
}
function openAle() {
  if (!house || busy) return; sfx.tap();
  openPop(house.ale.root, () => `${aleBars()}
    <p>${G.felicidad(S.ale) < 40 ? 'Está de bajón. Un buen chuletón o un masaje lo arreglan todo.' : 'Mantenerle siempre feliz es tu otra gran misión.'}</p>
    <div class="row2"><button class="btn primary" data-act="massage">💆‍♂️ Masaje</button><button class="btn" data-act="cook">🍳 Cocinarle</button></div>`,
  (act) => { if (act === 'massage') doMassage(); if (act === 'cook') openCook(house.ale.root); });
}
function openCook(anchor) {
  if (!house || busy) return; sfx.tap();
  openPop(anchor, () => `<h3>🍳 ¿Qué le cocinas?</h3><p>Lo gourmet le hace muy feliz. La comida rápida… no tanto.</p>
    ${FOODS.map(f => `<button class="food" data-act="f:${f.id}" ${S.money < f.price ? 'disabled' : ''}><span class="em">${f.emoji}</span><span class="tx"><b>${f.name}</b><small>${f.note}</small></span>
    <span class="pr">${eur(f.price)}<small class="${f.feli > 0 ? 'up' : f.feli < 0 ? 'down' : ''}">${f.feli > 0 ? '♥ +' + f.feli : f.feli < 0 ? '☹ ' + f.feli : '＝ 0'}</small></span></button>`).join('')}`,
  (act) => { if (act.startsWith('f:')) cook(FOODS.find(f => f.id === act.slice(2))); });
}
async function cook(food) {
  if (S.money < food.price) return;
  closePop(); busy = true;
  const h = house; await h.goTo('kitchen');
  if (house !== h) { busy = false; return; }
  h.cookSteam(true);
  const l = bubble(h.saf.head, `Cocinando ${food.emoji}…`, 3300);
  await wait(3300); h.cookSteam(false);
  await h.goToAle();
  if (house !== h) { busy = false; return; }
  G.feed(S, food, Date.now()); G.save(S);
  const sleeping = h.activity === 'dormir';
  engine.label(h.ale.head, food.emoji, 'float', 0.6);
  setTimeout(() => {
    bubble(h.ale.head, (sleeping ? '(Se despierta de golpe) ' : '') + food.line, 4500);
    if (food.feli > 0) { sfx.ok(); engine.label(h.ale.head, '❤️', 'float', 0.9); } else if (food.feli < 0) { sfx.sad(); engine.label(h.ale.head, '💔', 'float', 0.9); } else sfx.tap();
  }, 700);
  busy = false; renderHUD(Date.now());
}
async function doMassage() {
  closePop(); busy = true; const h = house;
  await h.goToAle(); busy = false;
  if (house !== h) return;
  massageGame((q) => {
    G.massage(S, q, Date.now()); G.save(S); renderHUD(Date.now());
    const lines = ['Ahhh… justo ahí 😌', 'Safi, tienes manos de oro.', 'Me quedo a vivir en este masaje.', 'Mmmm… ¿otro ratito?'];
    bubble(h.ale.head, lines[Math.floor(Math.random() * lines.length)], 3500); engine.label(h.ale.head, '💆‍♂️', 'float', 0.9); sfx.ok();
  });
}

/* ---------- Minijuego de masaje ---------- */
function massageGame(done) {
  openModal(`<h2>💆‍♂️ Masaje para Alejandro</h2><p class="lead">Frota los nudos rojos de su espalda hasta deshacerlos. ¡Tienes 25 segundos!</p>
    <canvas class="massage" id="mg" width="360" height="400"></canvas><p id="mgTxt" style="text-align:center;font-weight:800">Pulsa y frota…</p>`);
  const cv = $('#mg'), g = cv.getContext('2d');
  const knots = Array.from({ length: 5 }, (_, i) => ({ x: 115 + Math.random() * 130, y: 165 + i * 34 + Math.random() * 10, hp: 100 }));
  let t0 = performance.now(), down = false, last = null, finished = false, raf;
  const cues = ['Más fuerte…', 'Ahí, ahí…', 'Mmmmm', '¡Uf, qué contractura!', 'Sigue, sigue…'];
  const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 360, y: (e.clientY - r.top) / r.height * 400 }; };
  cv.onpointerdown = (e) => { down = true; last = pos(e); cv.setPointerCapture(e.pointerId); };
  cv.onpointerup = () => { down = false; };
  cv.onpointermove = (e) => {
    if (!down || finished) return; const p = pos(e), d = Math.hypot(p.x - last.x, p.y - last.y); last = p;
    for (const k of knots) if (k.hp > 0 && Math.hypot(p.x - k.x, p.y - k.y) < 34) { k.hp -= d * 0.9; if (k.hp <= 0) { sfx.coin(); $('#mgTxt').textContent = cues[Math.floor(Math.random() * cues.length)]; } }
  };
  const draw = () => {
    const el = (performance.now() - t0) / 1000, left = Math.max(0, 25 - el), doneN = knots.filter(k => k.hp <= 0).length;
    g.clearRect(0, 0, 360, 400);
    g.fillStyle = '#f7e7d3'; g.fillRect(0, 0, 360, 400);
    g.fillStyle = '#7a9cc6'; g.fillRect(0, 330, 360, 70); // toalla
    g.fillStyle = '#e8b48c';
    g.beginPath(); g.moveTo(70, 340); g.bezierCurveTo(60, 230, 50, 150, 110, 135); g.lineTo(250, 135); g.bezierCurveTo(310, 150, 300, 230, 290, 340); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(85, 150, 45, 26, -0.3, 0, Math.PI * 2); g.ellipse(275, 150, 45, 26, 0.3, 0, Math.PI * 2); g.fill();
    g.fillRect(158, 100, 44, 45);
    g.fillStyle = '#d9a37c'; g.fillRect(178, 160, 4, 170);
    g.fillStyle = '#e8b48c'; g.beginPath(); g.ellipse(132, 78, 9, 14, 0, 0, Math.PI * 2); g.ellipse(228, 78, 9, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2b1d16'; g.beginPath(); g.arc(180, 72, 48, 0, Math.PI * 2); g.fill();
    for (const k of knots) {
      if (k.hp <= 0) { g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '22px sans-serif'; g.fillText('✨', k.x - 11, k.y + 8); continue; }
      const a = 0.35 + 0.4 * (k.hp / 100);
      const gr = g.createRadialGradient(k.x, k.y, 2, k.x, k.y, 30); gr.addColorStop(0, `rgba(220,60,40,${a})`); gr.addColorStop(1, 'rgba(220,60,40,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(k.x, k.y, 30 + Math.sin(el * 6) * 3, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#233d3b'; g.font = 'bold 18px Fredoka, sans-serif'; g.fillText(`⏱ ${left.toFixed(0)} s`, 14, 28); g.fillText(`Nudos: ${doneN}/5`, 250, 28);
    if ((doneN === 5 || left <= 0) && !finished) {
      finished = true; const q = doneN / 5 * (left > 0 ? 1 : 0.8);
      $('#mgTxt').textContent = doneN === 5 ? '¡Masaje perfecto! Alejandro está en las nubes ☁️' : `Bien hecho: ${doneN} de 5 nudos.`;
      setTimeout(() => { closeModal(); done(q); }, 1300); return;
    }
    if (!$('#mg')) { if (!finished) { finished = true; done(knots.filter(k => k.hp <= 0).length / 5 * 0.6); } return; }
    raf = requestAnimationFrame(draw);
  };
  draw();
}

/* ============ Pacientes ============ */
function seeded(n) { let x = Math.sin(n * 999) * 10000; return x - Math.floor(x); }
function optionsFor(p) {
  const c = G.caseOf(p), all = Object.keys(TREATMENTS).filter(k => k !== c.t);
  const out = [c.t]; let i = 1;
  while (out.length < 4) { const k = all[Math.floor(seeded(p.id * 7 + i++) * all.length)]; if (!out.includes(k)) out.push(k); }
  return out.sort((a, b) => seeded(p.id + a.length * 3.1) - seeded(p.id + b.length * 3.1) || a.localeCompare(b));
}
function openPatient(id) {
  if (!clinic || busy) return;
  const p = S.patients.find(x => x.id === id); if (!p) return;
  const anchor = clinic.focus(id); if (!anchor) return; sfx.meow();
  const c = G.caseOf(p);
  openPop(anchor, () => {
    const now = Date.now(), q = S.patients.find(x => x.id === id);
    if (!q) return '<p>Este paciente ya no está aquí.</p>';
    const em = SPECIES_EMOJI[q.species];
    let body = '';
    if (q.status === 'waiting') {
      const tot = q.deadline - q.arrivedAt, left = q.deadline - now, pct = Math.max(2, Math.min(100, left / tot * 100));
      body = `<div class="meta"><span>Salud</span><span>${left < H ? '🚨 ' : ''}Quedan ${G.fmtLeft(left)} (hasta las ${fmtTime(q.deadline)})</span></div>
      <span class="bar big"><i style="width:${pct}%;background:${pct > 50 ? 'var(--teal)' : pct > 20 ? 'var(--warn)' : 'var(--bad)'}"></i></span>
      ${c.rev ? `<p style="font-size:12px;font-weight:800;margin-top:8px">📅 Después necesitará ${c.revTxt} ${c.rev} h más tarde (tiempo real).</p>` : ''}
      <h4>Elige el tratamiento</h4><div class="opts">${optionsFor(q).map(k => `<button class="opt" data-act="t:${k}"><span>${TREATMENTS[k][1]}</span>${TREATMENTS[k][0]}</button>`).join('')}</div>`;
    } else {
      const ready = now >= q.reviewAt;
      body = `<p>✅ Tratamiento puesto. Ahora toca <b>${c.revTxt}</b>.</p>
      <div class="meta"><span>${ready ? 'Revisión disponible' : 'Revisión a las ' + fmtTime(q.reviewAt)}</span><span>Límite: ${fmtDT(q.reviewDeadline)}</span></div>
      ${ready ? `<button class="btn primary" data-act="review">🩺 Pasar ${c.revTxt}</button>` : `<button class="btn" disabled>⏳ Faltan ${G.fmtLeft(q.reviewAt - now)} (tiempo real)</button>`}
      <p style="font-size:12px">Si no pasas la revisión antes del límite, ${q.name} empeora y puede morir.</p>`;
    }
    return `<h3>${em} ${esc(q.name)} <small>${q.species} · ${CLINICS[q.clinic].name}</small></h3><b>${esc(c.title)}</b><p>${esc(c.desc)}</p>${body}`;
  }, (act) => {
    if (act.startsWith('t:')) doTreat(p.id, act.slice(2));
    if (act === 'review') doReview(p.id);
  }, 1.2, true);
}
async function doTreat(id, tid) {
  const p = S.patients.find(x => x.id === id); if (!p || busy) return;
  closePop(); busy = true;
  const c = G.caseOf(p), now = Date.now();
  const r = G.treat(S, p, tid, now);
  if (r.ok && c.acc && r.review) p.accessory = c.acc;
  if (r.ok && !r.review) cured.add(id);
  G.save(S);
  const cl = clinic; await cl.treatAnim(id, r.ok, r.ok ? c.acc : null); busy = false;
  if (clinic !== cl) return;
  const anchor = cl.focus(id) || cl.saf.head;
  if (r.ok) {
    sfx.ok(); setTimeout(sfx.coin, 300);
    bubble(anchor, r.review ? `¡Mejor! Revisión en ${c.rev} h (+${r.pay} €)` : `¡Curado! +${r.pay} € 💚`, 3000);
    toast(r.review ? `🩺 ${p.name}: ${c.revTxt} a las ${fmtTime(p.reviewAt)}` : `💚 ${p.name} se va curado/a (+${r.pay} €)`, 'good');
  } else {
    sfx.bad(); bubble(anchor, ['¿¿Esto qué es?? 😾', 'Grrr… no era eso.', 'El paciente te mira con desprecio.'][Math.floor(Math.random() * 3)], 2800);
    toast(`❌ Ese tratamiento no era. ${p.name} empeora: le queda menos tiempo.`, 'bad');
  }
  cl.sync(S.patients, cured); renderHUD(Date.now());
}
async function doReview(id) {
  const p = S.patients.find(x => x.id === id); if (!p || busy) return;
  closePop(); busy = true;
  const r = G.review(S, p, Date.now()); if (!r.ok) { busy = false; return; }
  cured.add(id); G.save(S);
  const cl = clinic; await cl.treatAnim(id, true, null); busy = false;
  if (clinic !== cl) return;
  sfx.ok(); setTimeout(sfx.coin, 300); toast(`✅ Revisión superada: ${p.name} se va a casa (+${r.pay} €)`, 'good');
  cl.sync(S.patients, cured); renderHUD(Date.now());
}

/* ============ Viajes en Porsche ============ */
let driveCtl = null;
function confirmTravel(dest, why) {
  openModal(`<h2>🏎️ ¿Vamos en el Porsche?</h2><p>${esc(why)}</p><button class="btn primary" data-act="go">Ir a ${dest === 'casa' ? 'casa' : CLINICS[dest].name}</button>`, (a) => { if (a === 'go') { closeModal(); travelTo(dest); } });
}
function openTravel() {
  const now = Date.now();
  const card = (k) => {
    const here = S.location === k;
    if (k === 'casa') {
      const f = G.felicidad(S.ale);
      return `<div class="card ${here ? 'here' : ''}"><span class="big">🏠</span><b>Casa</b><small>Stuttgart · Alejandro ${G.mood(f).emoji} ${Math.round(f)} %</small>
      <button class="btn ${here ? '' : 'primary'}" data-act="go:casa" ${here ? 'disabled' : ''}>${here ? 'Estás aquí' : 'Ir a casa'}</button></div>`;
    }
    const C = CLINICS[k], ps = S.patients.filter(p => p.clinic === k);
    const urg = ps.filter(p => p.status === 'waiting').sort((a, b) => a.deadline - b.deadline)[0];
    if (!S.unlocked[k]) return `<div class="card"><span class="big">${C.flag}</span><b>${C.name}</b><small>${C.tag} · ${C.km}</small><small>🔒 Abre tu clínica aquí</small>
      <button class="btn primary" data-act="buy:${k}" ${S.money < C.cost ? 'disabled' : ''}>Abrir por ${eur(C.cost)}</button></div>`;
    return `<div class="card ${here ? 'here' : ''}"><span class="big">${C.flag}</span><b>${C.name}</b><small>${C.tag} · ${C.km}</small>
      <small>${ps.length} paciente(s)${urg ? ` · el más urgente: ${G.fmtLeft(urg.deadline - now)}` : ''}</small>
      <button class="btn ${here ? '' : 'primary'}" data-act="go:${k}" ${here ? 'disabled' : ''}>${here ? 'Estás aquí' : 'Conducir'}</button>
      <button class="btn" data-act="close:${k}">${S.closed[k] ? '🔓 Reabrir clínica' : '🏖️ Cerrar por vacaciones'}</button></div>`;
  };
  openModal(`<h2>🏎️ ¿A dónde vamos?</h2><p class="lead">Tu Porsche 911 te lleva a casa y a tus clínicas. Las clínicas cerradas no reciben pacientes nuevos (los que ya están siguen esperando).</p>
    <div class="cards">${['casa', 'stuttgart', 'estambul', 'barcelona'].map(card).join('')}</div>`, (a) => {
    const [cmd, k] = a.split(':');
    if (cmd === 'go') { closeModal(); travelTo(k); }
    if (cmd === 'buy') { if (G.unlock(S, k, Date.now())) { sfx.ok(); G.save(S); toast(`🎉 ¡Nueva clínica en ${CLINICS[k].name}!`, 'good'); renderHUD(Date.now()); openTravel(); } }
    if (cmd === 'close') { S.closed[k] = !S.closed[k]; G.addLog(S, Date.now(), S.closed[k] ? '🏖️' : '🔓', `Clínica de ${CLINICS[k].name} ${S.closed[k] ? 'cerrada por vacaciones' : 'reabierta'}.`); G.save(S); openTravel(); }
  });
}
async function travelTo(dest) {
  if (traveling || dest === S.location) return;
  traveling = true; closePop(); busy = false;
  const from = S.location, turbo = !!S.upgrades.turbo;
  if (house) { // Safiye sale de casa y se sube al Porsche
    await house.goTo('drive'); house.showSafiye(false);
    const car = house.porsche; sfx.engine(3);
    await new Promise(r => { let k = 0; const f = (dt) => { k += dt; car.position.x += dt * (2 + k * 10); car.userData.wheels.forEach(w => (w.rotation.z -= dt * 15)); if (k > 1.2) { engine.updaters.delete(f); r(); } }; engine.updaters.add(f); });
  } else sfx.engine(3);
  engine.clear(); house = clinic = null;
  const fromN = from === 'casa' ? 'Casa' : CLINICS[from].name, toN = dest === 'casa' ? 'Casa' : CLINICS[dest].name;
  const km = dest === 'casa' || from === 'casa' ? (dest === 'estambul' || from === 'estambul' ? '2.200 km' : dest === 'barcelona' || from === 'barcelona' ? '1.050 km' : '6 km') : '—';
  $('#travelTxt').textContent = `${fromN} → ${toN}${km !== '—' ? ' · ' + km : ''}`; $('#travel').hidden = false;
  const dur = turbo ? 2.6 : 4.6;
  await new Promise(r => { driveCtl = buildDrive(engine, dest, S.porscheColor, dur, r); lighting(); });
  driveCtl = null; $('#travel').hidden = true;
  S.location = dest; G.save(S);
  loadScene(dest); traveling = false; renderHUD(Date.now());
  if (dest === 'barcelona' && clinic && clinic.emilio) setTimeout(() => clinic && clinic.emilio && bubble(clinic.emilio.head, '¡Safi! Bienvenida a Barcelona ☀️', 3200), 600);
  if (dest === 'casa' && house) setTimeout(() => house && bubble(house.ale.head, G.felicidad(S.ale) < 40 ? 'Safi… tengo hambre 🥺' : '¡Hola, Safi! ❤️', 3000), 500);
}

/* ============ Mejoras ============ */
function openUpgrades() {
  const turbo = !!S.upgrades.turbo;
  openModal(`<h2>🛠️ Mejoras</h2><p class="lead">Invierte lo que ganas curando animales. Dinero: <b>${eur(S.money)}</b></p>
    <div class="cards">${UPGRADES.map(u => `<div class="card"><span class="big">${u.emoji}</span><b>${u.name}</b><small>${u.desc}</small>
    <button class="btn ${S.upgrades[u.id] ? '' : 'primary'}" data-act="up:${u.id}" ${S.upgrades[u.id] || S.money < u.price ? 'disabled' : ''}>${S.upgrades[u.id] ? '✓ Comprada' : 'Comprar · ' + eur(u.price)}</button></div>`).join('')}
    ${Object.entries(CLINICS).filter(([k]) => !S.unlocked[k]).map(([k, C]) => `<div class="card"><span class="big">${C.flag}</span><b>Clínica ${C.name}</b><small>${C.tag}. Nuevos pacientes y más ingresos.</small>
    <button class="btn primary" data-act="buy:${k}" ${S.money < C.cost ? 'disabled' : ''}>Abrir · ${eur(C.cost)}</button></div>`).join('')}</div>
    <h3>🎨 Color del Porsche 911</h3><div class="swatches">${PORSCHE_COLORS.map(([n, c, req]) => `<button title="${n}${req && !turbo ? ' (requiere Turbo S)' : ''}" aria-label="${n}" style="background:${c}" class="${S.porscheColor === c ? 'on' : ''}" data-act="color:${c}" ${req && !turbo ? 'disabled' : ''}></button>`).join('')}</div>`,
  (a) => {
    const [cmd, v] = a.split(/:(.+)/);
    if (cmd === 'up') { const u = UPGRADES.find(x => x.id === v); if (S.money >= u.price && !S.upgrades[v]) { S.money -= u.price; S.upgrades[v] = true; G.addLog(S, Date.now(), u.emoji, `Mejora comprada: ${u.name}.`); sfx.ok(); G.save(S); openUpgrades(); renderHUD(Date.now()); } }
    if (cmd === 'buy') { if (G.unlock(S, v, Date.now())) { sfx.ok(); G.save(S); toast(`🎉 ¡Nueva clínica en ${CLINICS[v].name}!`, 'good'); openUpgrades(); renderHUD(Date.now()); } }
    if (cmd === 'color') { S.porscheColor = v; G.save(S); sfx.tap(); const car = house ? house.porsche : clinic ? clinic.porsche : null; if (car) car.setColor(v); openUpgrades(); }
  });
}

/* ============ Diario ============ */
function openDiary() {
  const st = S.stats, pct = st.trackedMs ? Math.round(st.happyMs / st.trackedMs * 100) : 100;
  openModal(`<h2>📖 Diario de la Dra. Safiye</h2>
  <div class="kpis"><div class="kpi"><b>${st.cured}</b><small>Animales curados</small></div><div class="kpi"><b>${st.died}</b><small>Al cielo 🌈</small></div>
  <div class="kpi"><b>${pct} %</b><small>Tiempo con Alejandro feliz</small></div><div class="kpi"><b>${eur(st.earned)}</b><small>Ganado en total</small></div>
  <div class="kpi"><b>${st.meals}</b><small>Comidas cocinadas</small></div><div class="kpi"><b>${st.massages}</b><small>Masajes</small></div></div>
  <h3>Últimos acontecimientos</h3><ul class="log">${S.log.slice(0, 60).map(l => `<li><time>${fmtDT(l.t)}</time><span>${l.icon}</span><span>${esc(l.text)}</span></li>`).join('')}</ul>
  ${S.memorial.length ? `<h3>🕊️ En memoria</h3><p>${S.memorial.slice(0, 30).map(m => `${SPECIES_EMOJI[m.species]} ${esc(m.name)}`).join(' · ')}</p>` : ''}`);
}

/* ============ Ajustes ============ */
function openSettings() {
  const seg = (k, opts) => `<span class="seg">${opts.map(([v, n]) => `<button data-act="set:${k}:${v}" class="${String(S.settings[k]) === String(v) ? 'on' : ''}">${n}</button>`).join('')}</span>`;
  openModal(`<h2>⚙️ Ajustes</h2>
  <div class="toggle"><span>Sonido</span>${seg('sound', [[true, 'Sí'], [false, 'No']])}</div>
  <div class="toggle"><span>Tema de la interfaz</span>${seg('theme', [['light', '☀️ Día'], ['dark', '🌙 Noche']])}</div>
  <div class="toggle"><span>Luz del mundo</span>${seg('light', [['real', 'Hora real'], ['day', 'Siempre de día']])}</div>
  <h3>Cómo se juega</h3>
  <ul><li>El juego va en <b>tiempo real</b>: si a un gato le quedan 5 horas, son 5 horas de verdad, también con el juego cerrado.</li>
  <li>Toca a un animal en la clínica, lee su caso y elige el tratamiento correcto. Algunos necesitan una <b>revisión</b> horas después.</li>
  <li>En casa, toca a <b>Alejandro</b> para darle un masaje o cocinarle. Lo gourmet le hace feliz; el McDonald's, no.</li>
  <li>Viaja en tu <b>Porsche 911</b> entre casa y las clínicas de Stuttgart, Estambul y Barcelona (allí manda Emilio).</li>
  <li>¿Te vas de viaje? Cierra las clínicas «por vacaciones» desde el menú Viajar.</li></ul>
  <button class="btn" data-act="onb">Ver la introducción otra vez</button>
  <button class="btn danger" data-act="reset">Empezar de cero</button>
  <p class="fine"><a href="#" data-legal="aviso">Aviso legal</a> · <a href="#" data-legal="privacidad">Privacidad</a> · <a href="#" data-legal="cookies">Cookies</a> · <a href="#" data-legal="terminos">Términos</a><br>Hecho con cariño para Safiye · Indalo Holding</p>`,
  (a) => {
    if (a.startsWith('set:')) { const [, k, v] = a.split(':'); S.settings[k] = v === 'true' ? true : v === 'false' ? false : v; applySettings(); lighting(); G.save(S); openSettings(); }
    if (a === 'onb') onboarding();
    if (a === 'reset') openModal(`<h2>¿Empezar de cero?</h2><p>Se borrará toda la partida: dinero, clínicas, pacientes y el historial de Alejandro.</p><button class="btn danger" data-act="yes">Sí, borrar y empezar</button><button class="btn" data-act="no">Cancelar</button>`,
      (b) => { if (b === 'yes') { G.wipe(); S = G.newGame(Date.now()); G.save(S); closeModal(); loadScene(S.location); renderHUD(Date.now()); toast('Nueva partida. ¡Suerte, doctora!'); } else openSettings(); });
  });
}

/* ============ Introducción y resumen ============ */
function onboarding() {
  const slides = [
    ['👩‍⚕️', '¡Bienvenida, Dra. Safiye!', 'Diriges tu propia clínica veterinaria en Stuttgart. Te llegarán gatos (muchos gatos), pero también leones, jirafas, elefantes y loros con problemas… peculiares.'],
    ['⏳', 'Todo pasa en tiempo real', 'Si un paciente tiene 5 horas, son 5 horas de verdad. Si no lo atiendes a tiempo, puede cruzar el arcoíris. Algunos necesitan una revisión horas después.'],
    ['🧔‍♂️', 'Y luego está Alejandro', 'Siempre está en casa: jugando a la PlayStation, teletrabajando, con la barbacoa o en su piscina de plástico. Dale masajes y cocínale cosas ricas para que esté siempre feliz.'],
    ['🏎️', 'Tu Porsche 911 te espera', 'Viaja entre casa y tus clínicas. Ahorra para abrir en Estambul y en Barcelona, donde Emilio dirige el equipo. ¡A trabajar!'],
  ];
  let i = 0; S.onboarded = true; G.save(S);
  const show = () => {
    const [e, t, d] = slides[i];
    openModal(`<div class="onb"><div class="big">${e}</div><h2>${t}</h2><p>${d}</p><div class="dots">${slides.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn primary" data-act="next">${i < slides.length - 1 ? 'Siguiente' : '¡Empezar!'}</button></div>`, (a) => {
      if (a !== 'next') return; sfx.tap();
      if (i < slides.length - 1) { i++; show(); } else { S.onboarded = true; G.save(S); closeModal(); if (house) setTimeout(() => bubble(house.ale.head, '¡Safi! ¿Qué hay de comer? 🍖', 3500), 400); }
    });
  };
  show();
}
function awaySummary(events, away) {
  const arr = events.filter(e => e.type === 'arrive').length, dead = events.filter(e => e.type === 'dead'), em = events.filter(e => e.type === 'emilio').length;
  events.filter(e => e.type === 'emilio').forEach(e => cured.add(e.p.id));
  const h = Math.floor(away / H), m = Math.round((away % H) / MIN), f = G.felicidad(S.ale);
  openModal(`<h2>👋 Mientras no estabas…</h2><p class="lead">Han pasado ${h ? h + ' h ' : ''}${m} min de tiempo real.</p>
  <ul><li>🚪 Han llegado <b>${arr}</b> pacientes nuevos.</li>${em ? `<li>🧑‍⚕️ Emilio ha curado a <b>${em}</b> en Barcelona.</li>` : ''}
  ${dead.length ? `<li>🌈 Se nos han ido: ${dead.map(d => esc(d.p.name)).join(', ')}.</li>` : '<li>💚 Ningún paciente ha muerto. ¡Bien!</li>'}
  <li>${G.mood(f).emoji} Alejandro está: <b>${G.mood(f).label.toLowerCase()}</b> (${Math.round(f)} %).</li></ul>
  <button class="btn primary" data-act="ok">¡A trabajar!</button>`, (a) => a === 'ok' && closeModal());
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));

gate();
