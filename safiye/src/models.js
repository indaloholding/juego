// Modelos low-poly procedurales (estilo maqueta/render). Inspirado en los rigs
// procedurales de indaloholding/juego (web-kitchen-rush/src/scene/diner-model.ts).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const cache = new Map();
export function M(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color, roughness: o.r ?? 0.75, metalness: o.m ?? 0,
    emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    transparent: o.t != null, opacity: o.t ?? 1, map: o.map ?? null,
    side: o.ds ? THREE.DoubleSide : THREE.FrontSide, depthWrite: o.t == null || o.t > 0.6,
  });
  cache.set(key, m);
  return m;
}
export function mesh(geo, mat, x = 0, y = 0, z = 0, parent, shadow = true) {
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? M(mat) : mat);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
export const rbox = (w, h, d, r = 0.04) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01));
export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const SPH = new THREE.SphereGeometry(1, 20, 14);
export function oval(color, x, y, z, sx, sy, sz, parent) {
  const m = mesh(SPH, color, x, y, z, parent); m.scale.set(sx, sy, sz); return m;
}
export function cyl(rt, rb, h, color, x, y, z, parent, seg = 18) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), color, x, y, z, parent);
}
export function group(parent, x = 0, y = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); if (parent) parent.add(g); return g;
}

/* ---------- Ojos y cara ---------- */
function eyes(parent, sep, y, z, r, color = '#1b1b1f') {
  for (const s of [-1, 1]) {
    oval(color, s * sep, y, z, r, r * 1.15, r * 0.7, parent);
    oval('#ffffff', s * sep + r * 0.3, y + r * 0.4, z + r * 0.55, r * 0.32, r * 0.32, r * 0.2, parent);
  }
}

/* ---------- Personas ---------- */
export function makePerson(o) {
  const root = new THREE.Group();
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const hip = group(root, s * 0.11, 0.62, 0);
    mesh(new THREE.CapsuleGeometry(0.085, 0.38, 4, 10), o.bottom, 0, -0.27, 0, hip);
    mesh(rbox(0.16, 0.1, 0.26, 0.04), o.shoes || '#2a2d33', 0, -0.57, 0.04, hip);
    legs.push(hip);
  }
  const body = group(root, 0, 0.62, 0);
  mesh(rbox(0.44, 0.52, 0.27, 0.12), o.top, 0, 0.27, 0, body);
  if (o.coat) {
    mesh(rbox(0.47, 0.62, 0.3, 0.12), '#fbfbf8', 0, 0.22, -0.005, body);
    mesh(rbox(0.12, 0.5, 0.02, 0.01), o.top, 0, 0.3, 0.155, body);
  }
  for (const s of [-1, 1]) {
    const sh = group(root, s * 0.28, 1.06, 0);
    mesh(new THREE.CapsuleGeometry(0.068, 0.32, 4, 10), o.coat ? '#fbfbf8' : o.top, 0, -0.2, 0, sh);
    oval(o.skin, 0, -0.44, 0, 0.07, 0.075, 0.07, sh);
    arms.push(sh);
  }
  const head = group(root, 0, 1.36, 0);
  oval(o.skin, 0, 0, 0, 0.27, 0.28, 0.25, head);
  eyes(head, 0.095, 0.02, 0.215, 0.034);
  oval('#f2a59a', -0.16, -0.07, 0.19, 0.045, 0.03, 0.02, head);
  oval('#f2a59a', 0.16, -0.07, 0.19, 0.045, 0.03, 0.02, head);
  const smile = mesh(new THREE.TorusGeometry(0.045, 0.011, 6, 14, Math.PI), '#7a3b33', 0, -0.09, 0.235, head, false);
  smile.rotation.z = Math.PI;
  oval(o.skin, 0, -0.02, 0.255, 0.03, 0.03, 0.03, head);
  // pelo
  const hair = mesh(new THREE.SphereGeometry(0.29, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), o.hair, 0, 0.03, -0.02, head);
  hair.rotation.x = -0.25;
  if (o.hairStyle === 'long') {
    mesh(rbox(0.56, 0.62, 0.2, 0.09), o.hair, 0, -0.2, -0.13, head);
    oval(o.hair, 0, 0.17, 0.12, 0.22, 0.08, 0.12, head);
  } else {
    oval(o.hair, 0, 0.18, 0.08, 0.22, 0.09, 0.14, head);
  }
  if (o.beard) {
    const b = mesh(new THREE.SphereGeometry(0.272, 20, 12, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.4), o.hair, 0, 0, 0.012, head);
    b.scale.set(1, 1, 0.95);
    smile.position.z = 0.27;
  }
  if (o.glasses) glasses(head, 0.095, 0.02, 0.255, 0.06, '#222');
  const p = { root, head, legs, arms, body, sitting: false, phase: Math.random() * 6 };
  p.sit = (on) => {
    p.sitting = on;
    legs.forEach(l => (l.rotation.x = on ? -Math.PI / 2 : 0));
  };
  p.animate = (t, moving) => {
    if (p.sitting) { head.rotation.z = Math.sin(t * 0.8 + p.phase) * 0.05; return; }
    const sw = moving ? Math.sin(t * 9) * 0.55 : 0;
    legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
    if (!p.armPose) { arms[0].rotation.x = -sw * 0.8; arms[1].rotation.x = sw * 0.8; }
    body.position.y = 0.62 + (moving ? Math.abs(Math.sin(t * 9)) * 0.03 : Math.sin(t * 2 + p.phase) * 0.006);
    head.position.y = body.position.y + 0.74;
    head.rotation.z = moving ? 0 : Math.sin(t * 0.7 + p.phase) * 0.04;
  };
  return p;
}

export const SAFIYE = { skin: '#e9b993', hair: '#3a2219', hairStyle: 'long', top: '#3b9c98', bottom: '#2f6f6c', coat: true, shoes: '#f4f1ea' };
export const ALEJANDRO = { skin: '#e8b48c', hair: '#2b1d16', hairStyle: 'short', beard: true, top: '#5b6b7c', bottom: '#30363f', shoes: '#f0ede6' };
export const EMILIO = { skin: '#e3ae86', hair: '#6d6a66', hairStyle: 'short', beard: true, glasses: true, top: '#b5654a', bottom: '#3a3f46', coat: true };

/* ---------- Accesorios ---------- */
export function glasses(parent, sep, y, z, r, color = '#1b1b1f') {
  const g = group(parent, 0, y, z);
  const t = new THREE.TorusGeometry(r, r * 0.16, 8, 20);
  for (const s of [-1, 1]) {
    mesh(t, color, s * sep, 0, 0, g, false);
    mesh(new THREE.CircleGeometry(r, 18), M('#bfe6ff', { t: 0.35, r: 0.1 }), s * sep, 0, -0.002, g, false);
  }
  const br = mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, sep * 2 - r * 2, 6), color, 0, 0.004, 0, g, false);
  br.rotation.z = Math.PI / 2;
  return g;
}
export function makeAccessory(kind, a) {
  // a = anclajes del animal: {head, face:[sep,y,z,r], top:[y,scale], neck:{obj,y,r}, body:{obj, sx,sy,sz,y,z}}
  const g = new THREE.Group(); g.name = 'acc';
  if (kind === 'gafas') { const [s, y, z, r] = a.face; a.head.add(glasses(a.head, s, y, z, r)); return; }
  if (kind === 'sombrero') {
    const [y, k] = a.top; const h = group(a.head, 0, y, 0);
    h.rotation.x = -0.12; h.scale.setScalar(k);
    cyl(0.32, 0.32, 0.02, '#e8c872', 0, 0, 0, h, 28);
    cyl(0.15, 0.17, 0.16, '#e8c872', 0, 0.08, 0, h);
    cyl(0.172, 0.172, 0.04, '#c8402f', 0, 0.03, 0, h);
    return;
  }
  if (kind === 'orejeras') {
    const [y, k] = a.top; const h = group(a.head, 0, y - 0.05 * k, 0); h.scale.setScalar(k);
    const band = mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 20, Math.PI), '#e05f8a', 0, -0.05, 0, h); band.rotation.y = Math.PI / 2;
    oval('#ff9ec4', -0.2, -0.07, 0, 0.07, 0.08, 0.07, h); oval('#ff9ec4', 0.2, -0.07, 0, 0.07, 0.08, 0.07, h);
    return;
  }
  if (kind === 'bufanda' || kind === 'collarin' || kind === 'cono') {
    const n = a.neck; const h = group(n.obj, 0, n.y, n.z || 0); if (n.rx) h.rotation.x = n.rx;
    if (kind === 'bufanda') {
      const tor = mesh(new THREE.TorusGeometry(n.r, n.r * 0.35, 10, 24), '#d64933', 0, 0, 0, h); tor.rotation.x = Math.PI / 2;
      const tail = mesh(rbox(n.r * 0.6, n.r * 2.2, n.r * 0.2, 0.02), '#f2b743', n.r * 0.5, -n.r * 1.1, n.r * 0.9, h); tail.rotation.z = 0.2;
    } else if (kind === 'collarin') {
      const c = mesh(new THREE.CylinderGeometry(n.r * 1.25, n.r * 1.35, n.r * 2.2, 22, 1, true), M('#f4ecd8', { ds: true }), 0, 0, 0, h);
    } else {
      const c = mesh(new THREE.CylinderGeometry(n.r * 1.1, n.r * 3.2, n.r * 2.2, 22, 1, true), M('#eaf6ff', { t: 0.55, ds: true, r: 0.2 }), 0, 0, n.r * 0.6, h);
      c.rotation.x = Math.PI / 2;
    }
    return;
  }
  if (kind === 'jersey') {
    const b = a.body; const j = oval('#c0392b', 0, b.y, b.z, b.sx * 1.07, b.sy * 1.07, b.sz * 0.8, b.obj);
    oval('#f2e6d0', 0, b.y, b.z, b.sx * 1.09, b.sy * 0.25, b.sz * 0.6, b.obj);
    return;
  }
  if (kind === 'corona') {
    const [y, k] = a.top; const h = group(a.head, 0, y, 0); h.scale.setScalar(k);
    cyl(0.14, 0.14, 0.12, M('#f2b743', { m: 0.6, r: 0.3 }), 0, 0.05, 0, h, 8);
    return;
  }
}

/* ---------- Animales ---------- */
function legsQuad(root, color, w, z, h, r) {
  const legs = [];
  for (const [x, zz] of [[-w, z], [w, z], [-w, -z], [w, -z]]) {
    const L = group(root, x, h, zz);
    mesh(new THREE.CylinderGeometry(r, r * 0.9, h, 10), color, 0, -h / 2, 0, L);
    oval(color, 0, -h + r * 0.4, r * 0.3, r * 1.15, r * 0.6, r * 1.4, L);
    legs.push(L);
  }
  return legs;
}
function tubeTail(parent, pts, r, color) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve, 16, r, 8, false), color, 0, 0, 0, parent);
}

const CAT_COATS = [
  { base: '#e8963f', light: '#f7e3c6', name: 'naranja' },
  { base: '#8a9099', light: '#e6e6e6', name: 'gris' },
  { base: '#2b2b30', light: '#f2f2f2', name: 'esmoquin', tux: true },
  { base: '#f3eee4', light: '#ffffff', name: 'blanco' },
  { base: '#efe2c8', light: '#fff7e8', point: '#5a3d2b', name: 'siamés' },
  { base: '#c9a37a', light: '#f3e6d3', name: 'atigrado', stripes: '#7b5a3c' },
  { base: '#f1d2b9', light: '#f9e7da', name: 'esfinge', bald: true },
];
export const catCoatCount = CAT_COATS.length;

export function makeCat(v = 0) {
  const c = CAT_COATS[v % CAT_COATS.length];
  const root = new THREE.Group();
  const bodyG = group(root, 0, 0, 0);
  oval(c.base, 0, 0.33, 0, 0.2, 0.18, 0.32, bodyG);
  oval(c.tux ? c.light : c.base, 0, 0.36, 0.2, 0.15, 0.15, 0.13, bodyG);
  if (c.stripes) for (const z of [-0.15, 0, 0.15]) oval(c.stripes, 0, 0.42, z, 0.17, 0.07, 0.035, bodyG);
  const legs = legsQuad(root, c.tux ? c.light : c.base, 0.11, 0.18, 0.27, 0.045);
  const head = group(root, 0, 0.55, 0.32);
  oval(c.point || c.base, 0, 0, 0, 0.19, 0.17, 0.17, head);
  oval(c.light, 0, -0.06, 0.12, 0.1, 0.07, 0.07, head);
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.ConeGeometry(0.075, 0.15, 4), c.point || c.base, s * 0.1, 0.15, -0.01, head);
    e.rotation.set(0, Math.PI / 4, s * -0.35);
    const ei = mesh(new THREE.ConeGeometry(0.045, 0.1, 4), '#eaa0a0', s * 0.1, 0.14, 0.02, head);
    ei.rotation.set(0, Math.PI / 4, s * -0.35);
  }
  eyes(head, 0.075, 0.03, 0.14, 0.035, c.point ? '#3c7fd6' : '#5f8f2f');
  oval('#e88a8a', 0, -0.025, 0.17, 0.022, 0.016, 0.012, head);
  if (!c.bald) for (const s of [-1, 1]) for (const dy of [-0.02, 0.01]) {
    const w = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.16, 3), '#ffffff', s * 0.11, -0.04 + dy, 0.15, head, false);
    w.rotation.z = Math.PI / 2 + s * dy * 4;
  }
  const tail = group(root, 0, 0.36, -0.3);
  tubeTail(tail, [[0, 0, 0], [0, 0.12, -0.12], [0, 0.32, -0.16], [0.02, 0.42, -0.08]], 0.035, c.point || c.base);
  return {
    root, head, tail, legs, height: 0.75, species: 'gato',
    anchors: { head, face: [0.075, 0.03, 0.19, 0.055], top: [0.17, 0.62], neck: { obj: root, y: 0.47, z: 0.26, r: 0.13, rx: 0.5 }, body: { obj: bodyG, y: 0.33, z: 0, sx: 0.2, sy: 0.18, sz: 0.32 } },
  };
}

export function makeElephant() {
  const col = '#9aa2aa', root = new THREE.Group();
  const bodyG = group(root);
  oval(col, 0, 1.05, 0, 0.7, 0.6, 0.95, bodyG);
  const legs = legsQuad(root, col, 0.4, 0.5, 0.75, 0.2);
  const head = group(root, 0, 1.35, 0.95);
  oval(col, 0, 0, 0, 0.48, 0.46, 0.42, head);
  for (const s of [-1, 1]) {
    const ear = oval('#a9b0b7', s * 0.48, 0.02, -0.12, 0.42, 0.48, 0.06, head); ear.rotation.y = s * 0.55;
    oval('#d9a3a0', s * 0.47, 0.0, -0.08, 0.3, 0.34, 0.03, head).rotation.y = s * 0.55;
    const tusk = mesh(new THREE.ConeGeometry(0.05, 0.4, 10), '#f6f1e3', s * 0.16, -0.32, 0.4, head); tusk.rotation.x = 1.9;
  }
  tubeTail(head, [[0, -0.05, 0.35], [0, -0.35, 0.5], [0, -0.75, 0.55], [0, -0.95, 0.72], [0, -0.85, 0.86]], 0.1, col);
  eyes(head, 0.2, 0.12, 0.36, 0.05);
  const tail = group(root, 0, 1.1, -0.9);
  tubeTail(tail, [[0, 0, 0], [0, -0.25, -0.1], [0, -0.5, -0.12]], 0.03, col);
  return {
    root, head, tail, legs, height: 2.0, species: 'elefante',
    anchors: { head, face: [0.2, 0.12, 0.42, 0.1], top: [0.42, 1.5], neck: { obj: head, y: -0.15, z: -0.15, r: 0.42 }, body: { obj: bodyG, y: 1.05, z: 0, sx: 0.7, sy: 0.6, sz: 0.95 } },
  };
}

let giraffeTex = null;
function giraffeMap() {
  if (giraffeTex) return giraffeTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g = cv.getContext('2d'); g.fillStyle = '#efc46a'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#a5622b';
  for (let i = 0; i < 40; i++) {
    const x = (i * 73) % 256, y = (i * 151) % 256, r = 12 + (i * 37) % 14;
    g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + i; g.lineTo(x + Math.cos(a) * r * (0.8 + (k % 2) * 0.3), y + Math.sin(a) * r); } g.fill();
  }
  giraffeTex = new THREE.CanvasTexture(cv); giraffeTex.colorSpace = THREE.SRGBColorSpace;
  giraffeTex.wrapS = giraffeTex.wrapT = THREE.RepeatWrapping;
  return giraffeTex;
}
export function makeGiraffe() {
  const skin = M('#ffffff', { map: giraffeMap() }), root = new THREE.Group();
  const bodyG = group(root);
  oval(skin, 0, 1.45, 0, 0.36, 0.3, 0.62, bodyG);
  const legs = legsQuad(root, '#efc46a', 0.2, 0.4, 1.25, 0.065);
  const neck = group(root, 0, 1.55, 0.45); neck.rotation.x = 0.35;
  mesh(new THREE.CylinderGeometry(0.11, 0.17, 1.3, 14), skin, 0, 0.6, 0, neck);
  const head = group(neck, 0, 1.3, 0.02); head.rotation.x = -0.35;
  oval(skin, 0, 0, 0.08, 0.14, 0.14, 0.26, head);
  oval('#d9a660', 0, -0.03, 0.3, 0.1, 0.09, 0.08, head);
  for (const s of [-1, 1]) {
    cyl(0.02, 0.025, 0.15, '#8a5a2b', s * 0.06, 0.18, -0.02, head);
    oval('#5a3a1c', s * 0.06, 0.26, -0.02, 0.035, 0.035, 0.035, head);
    const ear = oval('#efc46a', s * 0.14, 0.08, -0.06, 0.08, 0.035, 0.03, head); ear.rotation.z = s * 0.4;
  }
  eyes(head, 0.1, 0.06, 0.16, 0.03);
  const tail = group(root, 0, 1.45, -0.6);
  tubeTail(tail, [[0, 0, 0], [0, -0.3, -0.08], [0, -0.6, -0.1]], 0.02, '#a5622b');
  return {
    root, head, tail, legs, height: 3.1, species: 'jirafa',
    anchors: { head, face: [0.1, 0.06, 0.2, 0.05], top: [0.14, 0.6], neck: { obj: neck, y: 0.75, z: 0, r: 0.15 }, body: { obj: bodyG, y: 1.45, z: 0, sx: 0.36, sy: 0.3, sz: 0.62 } },
  };
}

export function makeBird(v = 0) {
  const pal = v % 2 ? { b: '#f4d03f', h: '#f4d03f', w: '#e6b422', beak: '#f39c4a' } : { b: '#2fa35b', h: '#d8412f', w: '#2f6fd1', beak: '#3a3a3a' };
  const root = new THREE.Group();
  const bodyG = group(root);
  const b = oval(pal.b, 0, 0.38, 0, 0.15, 0.2, 0.15, bodyG); b.rotation.x = 0.25;
  const head = group(root, 0, 0.62, 0.06);
  oval(pal.h, 0, 0, 0, 0.12, 0.12, 0.12, head);
  const beak = mesh(new THREE.ConeGeometry(0.04, 0.12, 10), pal.beak, 0, -0.02, 0.13, head); beak.rotation.x = 1.9;
  eyes(head, 0.065, 0.03, 0.09, 0.022);
  for (const s of [-1, 1]) {
    const w = oval(pal.w, s * 0.14, 0.38, -0.02, 0.04, 0.15, 0.11, root); w.rotation.x = 0.3;
    cyl(0.01, 0.01, 0.18, '#7a6a55', s * 0.05, 0.09, 0.02, root, 5);
  }
  const tail = group(root, 0, 0.26, -0.12);
  const t = mesh(rbox(0.1, 0.28, 0.025, 0.01), pal.w, 0, -0.08, -0.06, tail); t.rotation.x = -0.7;
  return {
    root, head, tail, legs: [], height: 0.75, species: 'pájaro',
    anchors: { head, face: [0.065, 0.03, 0.12, 0.04], top: [0.11, 0.45], neck: { obj: root, y: 0.52, z: 0.02, r: 0.1 }, body: { obj: bodyG, y: 0.38, z: 0, sx: 0.15, sy: 0.2, sz: 0.15 } },
  };
}

export function makeLion() {
  const col = '#d9a55b', mane = '#8a4f22', root = new THREE.Group();
  const bodyG = group(root);
  oval(col, 0, 0.68, 0, 0.36, 0.32, 0.65, bodyG);
  const legs = legsQuad(root, col, 0.2, 0.38, 0.55, 0.09);
  const head = group(root, 0, 1.0, 0.62);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    oval(mane, Math.cos(a) * 0.27, Math.sin(a) * 0.27, -0.08, 0.16, 0.16, 0.14, head);
  }
  oval(mane, 0, 0, -0.1, 0.36, 0.36, 0.2, head);
  oval(col, 0, 0, 0.04, 0.26, 0.25, 0.24, head);
  oval('#f1d3a2', 0, -0.09, 0.2, 0.13, 0.09, 0.08, head);
  oval('#5b3a2a', 0, -0.03, 0.27, 0.04, 0.03, 0.03, head);
  for (const s of [-1, 1]) oval(col, s * 0.17, 0.2, 0.0, 0.07, 0.07, 0.04, head);
  eyes(head, 0.1, 0.06, 0.22, 0.035, '#3a2a12');
  const tail = group(root, 0, 0.75, -0.6);
  tubeTail(tail, [[0, 0, 0], [0, -0.1, -0.25], [0, 0.05, -0.5], [0, 0.18, -0.55]], 0.03, col);
  oval(mane, 0, 0.2, -0.56, 0.07, 0.09, 0.07, tail);
  return {
    root, head, tail, legs, height: 1.35, species: 'león',
    anchors: { head, face: [0.1, 0.06, 0.27, 0.07], top: [0.28, 1.0], neck: { obj: head, y: -0.22, z: -0.05, r: 0.24 }, body: { obj: bodyG, y: 0.68, z: 0, sx: 0.36, sy: 0.32, sz: 0.65 } },
  };
}

export function makeAnimal(species, variant) {
  const a = species === 'gato' ? makeCat(variant) : species === 'elefante' ? makeElephant()
    : species === 'jirafa' ? makeGiraffe() : species === 'pájaro' ? makeBird(variant) : makeLion();
  a.phase = Math.random() * 10;
  a.animate = (t, moving) => {
    const p = a.phase;
    if (a.tail) a.tail.rotation.y = Math.sin(t * 2.2 + p) * 0.35;
    if (a.head) a.head.rotation.z = Math.sin(t * 0.9 + p) * 0.06;
    const sw = moving ? Math.sin(t * 10) * 0.5 : 0;
    a.legs.forEach((l, i) => (l.rotation.x = (i === 0 || i === 3 ? sw : -sw)));
    a.root.position.y = (a.baseY || 0) + (moving ? Math.abs(Math.sin(t * 10)) * 0.04 : 0);
  };
  return a;
}

/* ---------- Porsche 911 ---------- */
export function makePorsche(color = '#c8102e') {
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 });
  const outer = new THREE.Group(); const car = group(outer); car.rotation.y = -Math.PI / 2;
  const lower = new THREE.Shape();
  lower.moveTo(2.2, 0.3); lower.lineTo(2.28, 0.52);
  lower.quadraticCurveTo(2.26, 0.7, 1.8, 0.74); lower.lineTo(0.8, 0.92); lower.lineTo(-1.7, 0.96);
  lower.quadraticCurveTo(-2.2, 0.86, -2.3, 0.58); lower.lineTo(-2.22, 0.3); lower.lineTo(2.2, 0.3);
  const ex = (s, d, b) => { const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 4, curveSegments: 18 }); g.translate(0, 0, -d / 2); return g; };
  mesh(ex(lower, 1.5, 0.14), paint, 0, 0, 0, car);
  const cab = new THREE.Shape();
  cab.moveTo(0.78, 0.9); cab.quadraticCurveTo(0.45, 1.2, 0.15, 1.3); cab.quadraticCurveTo(-0.5, 1.37, -1.0, 1.26);
  cab.quadraticCurveTo(-1.6, 1.1, -1.95, 0.9); cab.lineTo(0.78, 0.9);
  mesh(ex(cab, 1.16, 0.1), M('#1d2630', { r: 0.1, m: 0.5 }), 0, 0, 0, car);
  const roof = new THREE.Shape();
  roof.moveTo(0.2, 1.33); roof.quadraticCurveTo(-0.5, 1.42, -1.05, 1.3); roof.lineTo(-1.0, 1.24); roof.quadraticCurveTo(-0.5, 1.33, 0.18, 1.27);
  mesh(ex(roof, 1.08, 0.12), paint, 0, 0, 0, car);
  // aletas delanteras y faros redondos
  for (const s of [-1, 1]) {
    const f = oval(paint, 1.5, 0.76, s * 0.7, 0.75, 0.2, 0.3, car); f.material = paint;
    const hl = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 24), M('#fffbe6', { e: '#fff3c4', ei: 0.7, r: 0.2 }), 2.08, 0.8, s * 0.68, car);
    hl.rotation.z = Math.PI / 2 - 0.35;
    const rg = mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 24), M('#cfd3d6', { m: 0.9, r: 0.2 }), 2.1, 0.8, s * 0.68, car); rg.rotation.y = Math.PI / 2 - 0.35 * 0; rg.rotation.x = 0; rg.rotation.set(0, Math.PI / 2, 0); rg.rotateX(-0.35);
  }
  const tl = mesh(rbox(0.05, 0.07, 1.62, 0.02), M('#ff2a2a', { e: '#ff1a1a', ei: 0.8 }), -2.33, 0.66, 0, car);
  mesh(rbox(0.3, 0.04, 1.2, 0.02), paint, -1.95, 0.98, 0, car); // cola de pato
  const wheels = [];
  for (const [x, z] of [[1.4, 0.82], [1.4, -0.82], [-1.35, 0.84], [-1.35, -0.84]]) {
    const w = group(car, x, 0.34, z);
    const tire = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.27, 24), M('#1c1c1e', { r: 0.9 }), 0, 0, 0, w); tire.rotation.x = Math.PI / 2;
    const rim = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 5), M('#d7dadd', { m: 0.95, r: 0.25 }), 0, 0, 0, w); rim.rotation.x = Math.PI / 2;
    wheels.push(w);
  }
  const shadow = mesh(new THREE.PlaneGeometry(4.8, 2.1), M('#000000', { t: 0.25 }), 0, 0.01, 0, car, false);
  shadow.rotation.x = -Math.PI / 2;
  outer.userData.paint = paint; outer.userData.wheels = wheels;
  outer.setColor = (c) => paint.color.set(c);
  return outer;
}

/* ---------- Mobiliario / entorno ---------- */
export function plant(parent, x, z, s = 1, potColor = '#d8cfc2') {
  const g = group(parent, x, 0, z); g.scale.setScalar(s);
  cyl(0.2, 0.15, 0.36, potColor, 0, 0.18, 0, g);
  for (let i = 0; i < 5; i++) oval(i % 2 ? '#4f8a4a' : '#3f7a3f', Math.cos(i * 1.3) * 0.12, 0.55 + (i % 3) * 0.12, Math.sin(i * 1.3) * 0.12, 0.2, 0.25, 0.2, g);
  return g;
}
export function tree(parent, x, z, s = 1) {
  const g = group(parent, x, 0, z); g.scale.setScalar(s);
  cyl(0.1, 0.14, 1.4, '#7a5a3c', 0, 0.7, 0, g);
  oval('#5d9a4f', 0, 1.8, 0, 0.75, 0.7, 0.75, g);
  oval('#6eab5a', 0.35, 1.55, 0.2, 0.5, 0.45, 0.5, g);
  oval('#4e8a45', -0.3, 1.6, -0.2, 0.5, 0.5, 0.5, g);
  return g;
}
export function textTexture(text, o = {}) {
  const cv = document.createElement('canvas'); const w = o.w || 1024, h = o.h || 256;
  cv.width = w; cv.height = h; const g = cv.getContext('2d');
  if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = o.color || '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `${o.weight || 700} ${o.size || 110}px Fredoka, Nunito, sans-serif`;
  if (o.spacing) g.letterSpacing = o.spacing;
  g.fillText(text, w / 2, h / 2 + (o.dy || 0));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
export function plankTexture(c1 = '#c8a27a', c2 = '#b98f66') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
  for (let i = 0; i < 16; i++) {
    g.fillStyle = i % 2 ? c1 : c2; g.fillRect(0, i * 32, 512, 32);
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, i * 32, 512, 1.5);
    const off = (i * 197) % 512; g.fillRect(off, i * 32, 1.5, 32);
    for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(80,50,20,${0.03 + (k % 3) * 0.015})`; g.fillRect((k * 89 + i * 31) % 512, i * 32 + 6 + k * 3, 120, 1); }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
export function tileTexture(a, b, n = 8, grout = 'rgba(0,0,0,.12)') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
  const s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); }
  g.strokeStyle = grout; g.lineWidth = 2;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
