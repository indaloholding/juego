import * as THREE from 'three';
import { M, mesh, rbox, box, oval, cyl, group, plant, tree, textTexture, plankTexture, tileTexture, makePerson, makeAnimal, makeAccessory, makePorsche, SAFIYE, EMILIO } from './models.js';
import { walkPath, faceTo } from './engine.js';
import { CLINICS } from './data.js';

const THEMES = {
  stuttgart: { floor: () => { const t = plankTexture('#d9c3a3', '#cfb894'); t.repeat.set(3, 2); return t; }, wall: '#f5f3ee', accent: '#3b9c98', bench: '#3b9c98' },
  estambul: { floor: () => { const t = tileTexture('#2f8fa3', '#f1ece2', 12); t.repeat.set(2, 1.5); return t; }, wall: '#f6efe2', accent: '#c0392b', bench: '#1f6f8b' },
  barcelona: { floor: () => { const t = tileTexture('#d9822b', '#f3e3c8', 14, 'rgba(120,60,20,.25)'); t.repeat.set(2, 1.5); return t; }, wall: '#fbf4ea', accent: '#d9822b', bench: '#b5654a' },
};
const SCALE = { gato: 1.65, 'pájaro': 1.45, 'león': 0.85, jirafa: 0.72, elefante: 0.68, hormiga: 1.7, 'pingüino': 1.05, cocodrilo: 1.0, tortuga: 1.25, mono: 1.0, panda: 0.9, flamenco: 0.9, pulpo: 1.0, camello: 0.75, rana: 1.45, perezoso: 1.0 };
const WAIT = [[-4.6, -2.9], [-4.6, -0.4], [-4.6, 2.1], [-2.2, 3.4], [0.3, 3.4], [-2.5, -3.3], [-2.4, 0.9], [1.7, 3.7]];
const OBS = [[4.6, -3.2], [4.6, -1.1], [2.5, -3.5]];
const TABLE = [0.4, -1.7], SAF_T = [1.7, -0.6], SAF_IDLE = [1.9, 0.6], DOOR = [4.6, 6.0];

function backdrop(root, key) {
  const g = group(root, 0, -0.4, -12); g.scale.setScalar(0.7);
  if (key === 'stuttgart') {
    mesh(new THREE.CylinderGeometry(6, 8, 1.4, 7), '#8fb36f', -7, 0.0, -3, g);
    mesh(new THREE.CylinderGeometry(5, 7, 1.0, 7), '#7ea862', 8, -0.1, -3, g);
    const tv = group(g, -5, 0, 0); cyl(0.22, 0.4, 9, '#e9e9e4', 0, 4.5, 0, tv); cyl(0.7, 0.55, 1.0, '#cfd4d8', 0, 7.6, 0, tv); cyl(0.05, 0.05, 2.4, '#d64933', 0, 9.6, 0, tv, 6);
    const mus = group(g, 5, 2.2, -3); mus.scale.setScalar(0.8); const b = mesh(rbox(5, 1.6, 2.4, 0.2), '#fafafa', 0, 0.8, 0, mus); b.rotation.z = 0.06;
    for (const x of [-1.5, 0, 1.5]) cyl(0.18, 0.25, 2.2, '#e0e0e0', x, -0.6, 0, mus);
    tree(g, 1, 1.5, 1.1); tree(g, -1.5, 1.5, 0.9); tree(g, 8, 1, 1.0);
  } else if (key === 'estambul') {
    mesh(new THREE.BoxGeometry(30, 0.3, 5), M('#3a8fc2', { r: 0.15 }), 0, -0.2, -1, g);
    const mq = group(g, -2, 0, -2);
    mesh(rbox(5, 2.2, 4, 0.1), '#e9e2d4', 0, 1.1, 0, mq);
    oval('#b9c2c9', 0, 2.2, 0, 1.7, 1.5, 1.7, mq); cyl(0.12, 0.12, 0.8, '#c9a14a', 0, 3.9, 0, mq, 6);
    for (const [x, z] of [[-1.8, 0.8], [1.8, 0.8], [-1.6, -0.8], [1.6, -0.8]]) oval('#b9c2c9', x, 2.2, z, 0.6, 0.5, 0.6, mq);
    for (const [x, z] of [[-3.2, 2.2], [3.2, 2.2], [-3.2, -2.2], [3.2, -2.2]]) { cyl(0.18, 0.22, 6, '#ece6da', x, 3, z, mq, 10); mesh(new THREE.ConeGeometry(0.22, 1.2, 10), '#8a9aa6', x, 6.6, z, mq); }
    const gal = group(g, 6, 0, 0); cyl(0.9, 1.0, 5, '#cdb79a', 0, 2.5, 0, gal, 14); mesh(new THREE.ConeGeometry(1.05, 1.8, 14), '#5f6e7a', 0, 5.9, 0, gal);
  } else {
    mesh(new THREE.BoxGeometry(30, 0.3, 5), M('#3fa0d0', { r: 0.15 }), 0, -0.2, -1.5, g);
    const sf = group(g, -3, 0, 0);
    mesh(rbox(5, 3, 2.5, 0.1), '#cbb48f', 0, 1.5, 0, sf);
    for (const [x, h] of [[-1.8, 7], [-0.6, 8.5], [0.6, 8.5], [1.8, 7], [0, 10.5]]) {
      mesh(new THREE.CylinderGeometry(0.15, 0.55, h, 10), '#c9ae84', x, h / 2 + 1, x === 0 ? -0.6 : 0, sf);
      oval('#e0b23a', x, h + 1.05, x === 0 ? -0.6 : 0, 0.22, 0.22, 0.22, sf);
    }
    for (const x of [3, 5.5, 8]) { const p = group(g, x, 0, 1.5); cyl(0.12, 0.16, 3.5, '#9a7a55', 0, 1.75, 0, p, 8); for (let i = 0; i < 6; i++) { const l = oval('#4f9a4a', Math.cos(i) * 0.6, 3.6, Math.sin(i) * 0.6, 0.8, 0.12, 0.25, p); l.rotation.y = -i; l.rotation.z = 0.3; } }
  }
  return g;
}

export function buildClinic(engine, key, cb) {
  const th = THEMES[key], C = CLINICS[key];
  const root = group(engine.world);
  mesh(rbox(14.6, 0.7, 13.6, 0.12), '#2c3843', 0, -0.36, 0.6, root);
  mesh(new THREE.PlaneGeometry(6, 0.42), M('#fff', { map: textTexture(C.name.toUpperCase() + ' · KLINIK', { color: '#c9d3dc', size: 92, spacing: '18px', w: 1600, h: 140 }), t: 0.9 }), 0, -0.36, 7.41, root, false);
  backdrop(root, key);
  const floorTex = th.floor();
  mesh(new THREE.BoxGeometry(12, 0.08, 9), M('#ffffff', { map: floorTex, r: 0.5 }), 0, 0, 0, root);
  const H = 2.8, wall = (x, z, w, d, h, c = th.wall) => mesh(box(w, h, d), c, x, h / 2, z, root);
  // pared norte con ventanal
  wall(-4.5, -4.5, 3, 0.16, H); wall(4.5, -4.5, 3, 0.16, H); wall(0, -4.5, 6, 0.16, 0.7); wall(0, -4.5 + 0, 6, 0.16, 0.3).position.y = H - 0.15;
  mesh(box(6, H - 1.0, 0.04), M('#cfe9f5', { t: 0.18, r: 0.05 }), 0, 0.7 + (H - 1.0) / 2, -4.5, root, false).userData.solid = false;
  for (const x of [-3, -1, 1, 3]) mesh(box(0.07, H, 0.12), '#2d3136', x, H / 2, -4.5, root);
  wall(-6, 0, 0.16, 9, H);
  wall(-1.5, 4.5, 9, 0.16, 0.38); wall(5.6, 4.5, 0.8, 0.16, 0.38); wall(6, 0, 0.16, 9, 0.38);
  // rótulo
  mesh(new THREE.PlaneGeometry(2.8, 0.42), M('#fff', { map: textTexture(C.full, { color: '#ffffff', bg: th.accent, size: 76, w: 1400, h: 210 }) }), -4.5, 2.0, -4.41, root, false);
  // pósters
  const posters = ['¡Vacuna a tu gato!', 'Prohibido rugir', 'Jirafas: agachad la cabeza'];
  posters.forEach((t, i) => { const pm = mesh(new THREE.PlaneGeometry(1.0, 0.7), M('#fff', { map: textTexture(t, { color: '#233d3b', bg: ['#f2b743', '#f7d9c4', '#cfe9e7'][i], size: 64, w: 900, h: 640 }) }), -5.9, 1.6, -3 + i * 2.4 + (i > 0 ? 0.6 : 0), root, false); pm.rotation.y = Math.PI / 2; });
  // bancos sala de espera
  for (const z of [-2.9, -0.4, 2.1]) { mesh(rbox(0.6, 0.45, 1.8, 0.06), th.bench, -5.5, 0.23, z, root); mesh(rbox(0.12, 0.6, 1.8, 0.05), th.bench, -5.78, 0.6, z, root); }
  plant(root, -5.4, 3.8, 1.2); plant(root, 5.3, 3.8, 1.0);
  // rascador
  const ct = group(root, -5.2, 0, -4.0); cyl(0.09, 0.09, 1.8, '#d9c3a3', 0, 0.9, 0, ct, 8); for (const y of [0.6, 1.2, 1.8]) cyl(0.4, 0.4, 0.06, '#c96f52', 0, y, 0, ct, 16); oval('#c96f52', 0.25, 1.95, 0, 0.18, 0.15, 0.18, ct);
  // recepción
  const desk = group(root, 3.6, 0, 2.6);
  mesh(rbox(2.6, 1.05, 0.7, 0.05), '#f2efe8', 0, 0.53, 0, desk); mesh(rbox(2.7, 0.06, 0.8, 0.03), th.accent, 0, 1.08, 0, desk);
  mesh(rbox(0.04, 0.32, 0.5, 0.02), M('#0d1013', { e: '#8fd0ff', ei: 0.5 }), 0.6, 1.3, -0.1, desk).rotation.y = Math.PI / 2;
  // camilla y lámpara
  const tbl = group(root, TABLE[0], 0, TABLE[1]);
  mesh(rbox(1.9, 0.08, 1.0, 0.03), M('#d7dadd', { m: 0.8, r: 0.25 }), 0, 0.86, 0, tbl);
  mesh(rbox(1.6, 0.04, 0.8, 0.02), '#cfe9e7', 0, 0.91, 0, tbl);
  cyl(0.1, 0.18, 0.82, '#9aa0a6', 0, 0.41, 0, tbl, 10);
  const arm = group(tbl, -1.1, 0, -0.7); cyl(0.04, 0.04, 2.4, '#d7dadd', 0, 1.2, 0, arm, 8);
  const lampHead = cyl(0.35, 0.22, 0.14, '#f4f4f4', 0.8, 2.35, 0.5, arm, 20);
  const lampGlow = mesh(new THREE.CircleGeometry(0.3, 20), M('#fffbe6', { e: '#fff6d6', ei: 0.9 }), 0.8, 2.27, 0.5, arm, false); lampGlow.rotation.x = Math.PI / 2;
  // carrito de tratamientos
  const cart = group(root, 2.4, 0, -2.4); mesh(rbox(0.7, 0.8, 0.5, 0.03), '#d7dadd', 0, 0.45, 0, cart);
  for (let i = 0; i < 4; i++) oval(['#d64933', '#f2b743', '#3b9c98', '#7a9cc6'][i], -0.22 + i * 0.15, 0.92, 0, 0.05, 0.08, 0.05, cart);
  // camas de observación
  OBS.forEach(([x, z]) => { const b = mesh(new THREE.TorusGeometry(0.5, 0.15, 10, 24), '#f7d9c4', x, 0.12, z, root); b.rotation.x = Math.PI / 2; cyl(0.5, 0.5, 0.06, '#fff3e6', x, 0.06, z, root, 24); });
  mesh(new THREE.PlaneGeometry(2.4, 0.4), M('#fff', { map: textTexture('OBSERVACIÓN', { color: '#233d3b', bg: '#f2b743', size: 110, w: 1100, h: 180 }) }), 3.6, 1.8, -4.4, root, false);
  // exterior: porsche aparcado
  mesh(new THREE.BoxGeometry(14.4, 0.05, 2.4), '#bdb6aa', 0, 0, 5.9, root);
  const porsche = makePorsche(cb.porscheColor, cb.gt3); porsche.position.set(-2.5, 0.03, 6.0); porsche.rotation.y = Math.PI / 2; porsche.scale.setScalar(0.95); root.add(porsche);
  porsche.userData.onClick = (pt) => cb.onPorsche(pt);
  // luces
  for (const [x, z] of [[-2.5, 0], [2.5, 0]]) { const l = new THREE.PointLight('#ffe2b0', 0, 9, 1.5); l.position.set(x, 2.5, z); l.userData.base = 8; root.add(l); engine.nightLights.push(l); }

  // Safiye (y Emilio en Barcelona)
  const saf = makePerson(SAFIYE); saf.root.position.set(SAF_IDLE[0], 0, SAF_IDLE[1]); saf.root.rotation.y = -2.2; root.add(saf.root);
  saf.root.visible = cb.present;
  saf.root.userData.onClick = (pt) => cb.onSafiye && cb.onSafiye(pt);
  let emilio = null;
  if (key === 'barcelona') {
    emilio = makePerson(EMILIO); emilio.root.position.set(3.6, 0, 3.4); emilio.root.rotation.y = Math.PI; root.add(emilio.root);
    emilio.root.userData.onClick = (pt) => cb.onEmilio(pt, emilio);
  }

  const ents = new Map();
  const occupied = (arr, kind) => new Set([...ents.values()].filter(e => e.kind === kind).map(e => e.slot));
  function freeSlot(kind) { const arr = kind === 'obs' ? OBS : WAIT, used = occupied(arr, kind); for (let i = 0; i < arr.length; i++) if (!used.has(i)) return i; return arr.length - 1; }
  function place(e, kind) {
    e.kind = kind; e.slot = freeSlot(kind);
    const [x, z] = (kind === 'obs' ? OBS : WAIT)[e.slot];
    return [x, z];
  }
  function addPatient(p) {
    const a = makeAnimal(p.species, p.variant); a.root.scale.setScalar(SCALE[p.species]);
    const e = { p, a, kind: null, slot: -1, busy: false };
    if (p.accessory) makeAccessory(p.accessory, a.anchors);
    const [x, z] = place(e, p.status === 'obs' ? 'obs' : 'wait');
    a.root.position.set(x, 0, z); faceTo(a, 0.5, 0);
    a.root.userData.onClick = (pt) => !e.busy && cb.onPatient(p.id, pt);
    root.add(a.root);
    e.label = engine.label(a.root, '', 'ptag', a.height * SCALE[p.species] + 0.25);
    e.label.el.addEventListener('click', ev => { ev.stopPropagation(); if (!e.busy) cb.onPatient(p.id); });
    ents.set(p.id, e);
    return e;
  }
  function remove(e, how) {
    ents.delete(e.p.id); engine.removeLabel(e.label); e.busy = true;
    if (how === 'dead') {
      const ghost = engine.label(e.a.root, '<span class="angel">😇</span>', 'float', e.a.height * SCALE[e.p.species]);
      e.a.root.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; } });
      let k = 0; const f = (dt) => { k += dt; e.a.root.position.y += dt * 0.6; e.a.root.traverse(o => { if (o.material) o.material.opacity = Math.max(0, 1 - k / 2.5); });
        if (k > 2.6) { engine.updaters.delete(f); e.a.root.removeFromParent(); engine.removeLabel(ghost); } };
      engine.updaters.add(f);
    } else {
      const cheer = engine.label(e.a.root, '💚', 'float', e.a.height * SCALE[e.p.species] + 0.2);
      walkPath(engine, e.a, [[1.2, 1.2], [3.2, 3.9], DOOR], 1.4).then(() => { e.a.root.removeFromParent(); engine.removeLabel(cheer); });
    }
  }
  function sync(patients, cured = new Set()) {
    const mine = patients.filter(p => p.clinic === key);
    const ids = new Set(mine.map(p => p.id));
    for (const e of [...ents.values()]) if (!ids.has(e.p.id) && !e.busy) remove(e, cured.has(e.p.id) ? 'cured' : 'dead');
    for (const p of mine) {
      const e = ents.get(p.id);
      if (!e) addPatient(p);
      else { e.p = p; if (!e.busy && p.status === 'obs' && e.kind !== 'obs') { const [x, z] = place(e, 'obs'); walkPath(engine, e.a, [[x, z]], 1.8).then(() => faceTo(e.a, 0, 0)); } }
    }
  }
  async function treatAnim(pid, ok, accessory) {
    const e = ents.get(pid); if (!e) return;
    e.busy = true;
    const big = e.p.species === 'elefante' || e.p.species === 'jirafa' || e.p.species === 'león';
    const spot = big ? [TABLE[0] - 1.6, TABLE[1] + 0.2] : [TABLE[0] - 0.3, TABLE[1] + 0.9];
    await Promise.all([walkPath(engine, saf, [SAF_T]), walkPath(engine, e.a, [spot], 2.0)]);
    if (!big) { e.a.root.position.set(TABLE[0], 0.92, TABLE[1]); e.a.baseY = 0.92; }
    faceTo(e.a, SAF_T[0], SAF_T[1]); faceTo(saf, e.a.root.position.x, e.a.root.position.z);
    saf.armPose = true; saf.arms.forEach(a => (a.rotation.x = -1.2));
    const fx = engine.label(e.a.root, ok ? '✨🩺✨' : '😾💢', 'float', e.a.height * SCALE[e.p.species] + 0.1);
    let k = 0; await new Promise(r => { const f = (dt, t) => { k += dt; saf.arms[0].rotation.x = -1.2 + Math.sin(t * 12) * 0.3; if (!ok) e.a.root.rotation.y += Math.sin(t * 30) * 0.05; if (k > 2.0) { engine.updaters.delete(f); r(); } }; engine.updaters.add(f); });
    engine.removeLabel(fx); saf.armPose = false;
    if (ok && accessory) {
      makeAccessory(accessory, e.a.anchors);
      const wow = engine.label(e.a.root, '✨ ¡Tratamiento puesto! ✨', 'bubble', e.a.height * SCALE[e.p.species] + 0.5);
      let j = 0; await new Promise(r => { const f = (dt) => { j += dt; e.a.root.rotation.y += dt * 6.3; e.a.root.position.y = e.a.baseY + Math.sin(Math.min(1, j) * Math.PI) * 0.5; if (j > 1.1) { engine.updaters.delete(f); r(); } }; engine.updaters.add(f); });
      setTimeout(() => engine.removeLabel(wow), 1500);
    }
    e.a.baseY = 0; e.a.root.position.y = 0;
    if (!big) e.a.root.position.set(spot[0], 0, spot[1]);
    e.busy = false;
    if (!ok) { const [x, z] = (e.kind === 'obs' ? OBS : WAIT)[e.slot]; await walkPath(engine, e.a, [[x, z]], 2.0); faceTo(e.a, 0.5, 0); }
    walkPath(engine, saf, [SAF_IDLE]);
  }
  function focus(pid) { const e = ents.get(pid); return e ? e.a.root : null; }
  function updateLabels(now, html) { for (const e of ents.values()) { const r = html(e.p, now); e.label.el.innerHTML = r.html; e.label.el.className = 'tag ptag ' + r.cls; } }

  engine.updaters.add((dt, t) => {
    saf.animate(t, saf.moving);
    if (emilio) emilio.animate(t, false);
    for (const e of ents.values()) e.a.animate(t, e.a.moving);
    lampGlow.material.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.05;
  });
  engine.frame([-0.9, 0.6, 0.6], 29, 0.92, 0.45, { pan: [-6, 6, -4, 6] });
  return { sync, treatAnim, focus, updateLabels, saf, emilio, porsche, ents };
}
