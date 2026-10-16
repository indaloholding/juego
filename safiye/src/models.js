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

/* ---------- Accesorios (exagerados para que se vea el tratamiento) ---------- */
export function glasses(parent, sep, y, z, r, color = '#1b1b1f', lens = '#bfe6ff') {
  const g = group(parent, 0, y, z);
  const t = new THREE.TorusGeometry(r, r * 0.18, 8, 22);
  for (const s of [-1, 1]) {
    mesh(t, color, s * sep, 0, 0, g, false);
    mesh(new THREE.CircleGeometry(r, 20), M(lens, { t: 0.45, r: 0.1 }), s * sep, 0, -0.002, g, false);
  }
  const br = mesh(new THREE.CylinderGeometry(r * 0.14, r * 0.14, Math.max(0.01, sep * 2 - r * 2), 6), color, 0, 0.004, 0, g, false);
  br.rotation.z = Math.PI / 2;
  return g;
}
// tratamiento -> accesorio visible
export const ACC_FOR = {
  gafas: 'gafas', jersey: 'jersey', clases: 'birrete', malta: 'babero', cajaxl: 'caja', aro: 'aro', orejeras: 'orejeras', brackets: 'brackets',
  siesta: 'antifaz', espejo: 'espejo', crema: 'crema', dieta: 'lechuga', cono: 'cono', peluche: 'raton', pimienta: 'guindilla', agenda: 'postits',
  collarin: 'collarin', bufanda: 'bufanda', terapia: 'zen', modales: 'pajarita', paracaidas: 'paracaidas', diapason: 'notas', sombrero: 'sombrero',
  acondicionador: 'rulos', tofu: 'chef', miel: 'miel', vendas: 'vendas', ventilador: 'helice', corona: 'corona', vitaminas: 'capa',
};
const COLORS = ['#d64933', '#f2b743', '#3b9c98', '#7a9cc6', '#e05f8a', '#2fa35b'];
export function makeAccessory(kind, a) {
  const [ty, k] = a.top, F = a.face, N = a.neck, B = a.body;
  const top = () => { const h = group(a.head, 0, ty, 0); h.scale.setScalar(k); return h; };
  const spin = (o) => { (a.spinners ||= []).push(o); };
  switch (kind) {
    case 'gafas': { const g = glasses(a.head, F[0] * 1.35, F[1], F[2] + 0.02, F[3] * 2.1, '#d64933', '#9fdcff'); return g; }
    case 'sombrero': { // sombrero mexicano gigante
      const h = top(); h.scale.multiplyScalar(1.6); h.rotation.x = -0.1;
      cyl(0.6, 0.6, 0.025, '#e8c872', 0, 0, 0, h, 32);
      const rim = mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 32), '#e8c872', 0, 0.04, 0, h); rim.rotation.x = Math.PI / 2;
      mesh(new THREE.ConeGeometry(0.22, 0.5, 20), '#e8c872', 0, 0.26, 0, h);
      const band = mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 24), '#2fa35b', 0, 0.08, 0, h); band.rotation.x = Math.PI / 2;
      const band2 = mesh(new THREE.TorusGeometry(0.17, 0.03, 8, 24), '#d64933', 0, 0.16, 0, h); band2.rotation.x = Math.PI / 2;
      for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; oval(COLORS[i % 6], Math.cos(an) * 0.62, -0.03, Math.sin(an) * 0.62, 0.045, 0.045, 0.045, h); }
      return h;
    }
    case 'paracaidas': {
      const p = group(a.root, 0, B.y + 0.35 + k * 0.6, 0); p.scale.setScalar(k * 1.6);
      for (let i = 0; i < 8; i++) {
        const seg = new THREE.SphereGeometry(0.7, 6, 8, i * Math.PI / 4, Math.PI / 4, 0, Math.PI / 2);
        mesh(seg, M(i % 2 ? '#ffffff' : '#d64933', { ds: true }), 0, 0.35, 0, p, false);
      }
      for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2, s = cyl(0.004, 0.004, 0.62, '#444', Math.cos(an) * 0.35, 0.05, Math.sin(an) * 0.35, p, 4); s.rotation.z = Math.cos(an) * 0.5; s.rotation.x = -Math.sin(an) * 0.5; }
      a.sway = p; return p;
    }
    case 'birrete': {
      const h = top(); h.scale.multiplyScalar(1.4);
      cyl(0.16, 0.18, 0.12, '#1c1f24', 0, 0.04, 0, h, 16);
      const b = mesh(box(0.55, 0.035, 0.55), '#1c1f24', 0, 0.12, 0, h); b.rotation.y = 0.3;
      const t = cyl(0.012, 0.012, 0.3, '#f2b743', 0.24, -0.02, 0.1, h, 5); oval('#f2b743', 0.24, -0.18, 0.1, 0.04, 0.06, 0.04, h);
      return h;
    }
    case 'babero': {
      const g = group(N.obj, 0, N.y - N.r * 0.6, (N.z || 0) + N.r * 0.8); g.scale.setScalar(k * 1.3);
      mesh(rbox(0.36, 0.34, 0.03, 0.08), '#ffffff', 0, -0.1, 0, g); mesh(rbox(0.3, 0.05, 0.035, 0.02), '#d64933', 0, -0.24, 0.002, g);
      const sp = group(g, 0.28, 0, 0.1); sp.rotation.z = 0.6; cyl(0.015, 0.015, 0.4, '#cfd3d6', 0, 0, 0, sp, 6); oval('#cfd3d6', 0, 0.22, 0, 0.06, 0.08, 0.025, sp);
      return g;
    }
    case 'caja': {
      const g = group(B.obj, 0, B.y - B.sy * 0.2, B.z); const w = B.sx * 2.6, d = B.sz * 2.4, hh = B.sy * 1.6;
      const card = M('#c8995e', { ds: true });
      mesh(box(w, 0.02, d), card, 0, -hh / 2, 0, g);
      mesh(box(w, hh, 0.02), card, 0, 0, d / 2, g); mesh(box(w, hh, 0.02), card, 0, 0, -d / 2, g);
      mesh(box(0.02, hh, d), card, w / 2, 0, 0, g); mesh(box(0.02, hh, d), card, -w / 2, 0, 0, g);
      const fl = mesh(box(w, 0.02, d * 0.5), card, 0, hh / 2 + 0.1, d * 0.5, g); fl.rotation.x = -0.9;
      mesh(new THREE.PlaneGeometry(w * 0.7, hh * 0.35), M('#fff', { map: textTexture('FRÁGIL · GATO', { color: '#b23a2a', bg: '#d9b07a', size: 70, w: 700, h: 200 }) }), 0, 0, d / 2 + 0.012, g, false);
      return g;
    }
    case 'aro': {
      const g = group(a.head, 0, 0, -0.35 * k * 1.6); g.scale.setScalar(k * 1.6);
      mesh(new THREE.TorusGeometry(0.42, 0.04, 10, 36), M('#ffffff', { e: '#fff6d6', ei: 1.5 }), 0, 0, 0, g, false);
      cyl(0.015, 0.015, 1.5, '#333', 0, -0.95, -0.02, g, 6);
      return g;
    }
    case 'orejeras': {
      const h = top(); h.scale.multiplyScalar(1.3); h.position.y -= 0.06 * k;
      const band = mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 20, Math.PI), '#e05f8a', 0, -0.04, 0, h); band.rotation.y = Math.PI / 2;
      oval('#ff9ec4', -0.25, -0.08, 0, 0.11, 0.13, 0.11, h); oval('#ff9ec4', 0.25, -0.08, 0, 0.11, 0.13, 0.11, h);
      return h;
    }
    case 'brackets': {
      const g = group(a.head, 0, F[1] - F[3] * 1.4, F[2] + 0.01); g.scale.setScalar(F[3] * 9);
      const t = mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), M('#e9edf1', { m: 0.9, r: 0.15 }), 0, 0, 0, g, false); t.rotation.z = Math.PI;
      for (let i = 0; i < 5; i++) mesh(box(0.018, 0.018, 0.01), M('#9fb0c0', { m: 1, r: 0.2 }), -0.05 + i * 0.025, -0.055 + Math.abs(i - 2) * 0.008, 0.008, g, false);
      return g;
    }
    case 'antifaz': {
      const g = group(a.head, 0, F[1], F[2] + 0.01); g.scale.setScalar(F[3] * 7);
      mesh(rbox(0.36, 0.1, 0.03, 0.04), '#3a4a8c', 0, 0, 0, g, false);
      const h = top(); h.rotation.z = 0.4; mesh(new THREE.ConeGeometry(0.16, 0.42, 14), '#d64933', 0.04, 0.2, 0, h); oval('#ffffff', 0.12, 0.42, 0, 0.06, 0.06, 0.06, h);
      return g;
    }
    case 'espejo': {
      const g = group(a.head, F[0] * 4.5, 0, F[2]); g.scale.setScalar(k * 1.3); g.rotation.y = -0.6;
      mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 24), M('#e6eef5', { m: 1, r: 0.05 }), 0, 0, 0, g).rotation.x = Math.PI / 2;
      mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 24), '#c9a14a', 0, 0, 0.0, g);
      cyl(0.02, 0.02, 0.22, '#c9a14a', 0, -0.26, 0, g, 6);
      return g;
    }
    case 'crema': {
      oval('#ffffff', 0, F[1] - F[3] * 0.6, F[2] + F[3] * 0.4, F[3] * 0.9, F[3] * 0.7, F[3] * 0.6, a.head);
      return glasses(a.head, F[0] * 1.2, F[1] + F[3] * 0.2, F[2] + 0.02, F[3] * 1.3, '#111', '#1b1b1f');
    }
    case 'lechuga': {
      const h = top(); h.scale.multiplyScalar(1.3);
      for (let i = 0; i < 7; i++) { const l = oval('#7cc04a', Math.cos(i) * 0.14, 0.05, Math.sin(i) * 0.14, 0.14, 0.04, 0.09, h); l.rotation.set(0.6 * Math.sin(i), i, 0.6 * Math.cos(i)); }
      const t = mesh(new THREE.TorusGeometry(1, 0.06, 6, 30), '#f2d43f', 0, B.y, B.z, B.obj); t.scale.set(B.sx * 1.05, B.sz * 1.05, 1); t.rotation.x = Math.PI / 2;
      return h;
    }
    case 'cono': {
      const h = group(N.obj, 0, N.y, N.z || 0); if (N.rx) h.rotation.x = N.rx;
      const c = mesh(new THREE.CylinderGeometry(N.r * 1.1, N.r * 4.2, N.r * 3, 26, 1, true), M('#eaf6ff', { t: 0.55, ds: true, r: 0.2 }), 0, 0, N.r * 0.8, h);
      c.rotation.x = Math.PI / 2; return h;
    }
    case 'raton': {
      const h = top(); h.scale.multiplyScalar(1.5);
      oval('#b9bec4', 0, 0.12, 0, 0.13, 0.1, 0.17, h); oval('#b9bec4', 0, 0.17, 0.15, 0.08, 0.08, 0.08, h);
      oval('#f2a7b5', -0.07, 0.25, 0.13, 0.05, 0.05, 0.02, h); oval('#f2a7b5', 0.07, 0.25, 0.13, 0.05, 0.05, 0.02, h);
      oval('#111', 0, 0.17, 0.23, 0.015, 0.015, 0.015, h);
      return h;
    }
    case 'guindilla': {
      const g = group(a.head, F[0] * 1.3, F[1] - F[3] * 1.5, F[2] + F[3]); g.scale.setScalar(F[3] * 9); g.rotation.z = -0.9;
      mesh(new THREE.ConeGeometry(0.05, 0.3, 12), '#e0261b', 0, -0.15, 0, g).rotation.z = Math.PI;
      cyl(0.012, 0.012, 0.06, '#2fa35b', 0, 0.02, 0, g, 5);
      return g;
    }
    case 'postits': {
      const g = group(B.obj, 0, B.y, B.z);
      for (let i = 0; i < 7; i++) { const s = i % 2 ? 1 : -1, p = mesh(box(0.12, 0.12, 0.005), ['#fff275', '#ff9ec4', '#9fe0ff'][i % 3], s * B.sx * 1.0, (i % 3 - 1) * B.sy * 0.5, (i / 7 - 0.5) * B.sz * 1.4, g, false); p.rotation.y = s * Math.PI / 2; p.rotation.z = (i - 3) * 0.2; p.scale.setScalar(k * 1.5); }
      return g;
    }
    case 'collarin': {
      const h = group(N.obj, 0, N.y, N.z || 0); if (N.rx) h.rotation.x = N.rx;
      mesh(new THREE.CylinderGeometry(N.r * 1.45, N.r * 1.6, N.r * 3, 24, 1, true), M('#f4ecd8', { ds: true }), 0, 0, 0, h);
      for (const y of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(N.r * 1.5, N.r * 0.08, 6, 24), '#c9a77a', 0, y * N.r * 1.4, 0, h); r.rotation.x = Math.PI / 2; }
      return h;
    }
    case 'bufanda': {
      const h = group(N.obj, 0, N.y, N.z || 0); if (N.rx) h.rotation.x = N.rx;
      for (let i = 0; i < 3; i++) { const t = mesh(new THREE.TorusGeometry(N.r * 1.1, N.r * 0.32, 10, 24), COLORS[i], 0, (i - 1) * N.r * 0.45, 0, h); t.rotation.x = Math.PI / 2; }
      for (const s of [-1, 1]) { const tl = mesh(rbox(N.r * 0.7, N.r * 4, N.r * 0.2, 0.02), s > 0 ? '#d64933' : '#f2b743', s * N.r * 0.5, -N.r * 2, N.r * 1.1, h); tl.rotation.z = s * 0.25; }
      return h;
    }
    case 'zen': {
      const h = top(); h.scale.multiplyScalar(1.3); h.position.y -= 0.06 * k;
      const band = mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 20, Math.PI), '#1c1f24', 0, -0.03, 0, h); band.rotation.y = Math.PI / 2;
      for (const s of [-1, 1]) { const c = cyl(0.12, 0.12, 0.08, '#7a5ccf', s * 0.26, -0.08, 0, h); c.rotation.z = Math.PI / 2; }
      return h;
    }
    case 'pajarita': {
      const h = group(N.obj, 0, N.y - N.r * 0.3, (N.z || 0) + N.r * 1.05); if (N.rx) h.rotation.x = N.rx * 0.3; h.scale.setScalar(k * 1.4);
      for (const s of [-1, 1]) { const c = mesh(new THREE.ConeGeometry(0.09, 0.16, 4), '#d64933', s * 0.08, 0, 0, h); c.rotation.z = s * Math.PI / 2; }
      oval('#a02f22', 0, 0, 0.01, 0.04, 0.04, 0.04, h);
      const mon = mesh(new THREE.TorusGeometry(F[3] * 1.3, F[3] * 0.18, 8, 20), M('#c9a14a', { m: 0.8, r: 0.2 }), F[0], F[1], F[2] + 0.03, a.head);
      return h;
    }
    case 'notas': {
      const h = top(); h.scale.multiplyScalar(1.3);
      for (let i = 0; i < 3; i++) { const n = group(h, (i - 1) * 0.22, 0.25 + i * 0.08, 0); oval('#1c1f24', 0, 0, 0, 0.05, 0.04, 0.04, n); cyl(0.008, 0.008, 0.16, '#1c1f24', 0.045, 0.08, 0, n, 4); a.notes = a.notes || []; a.notes.push(n); }
      return h;
    }
    case 'rulos': {
      const h = top(); h.scale.multiplyScalar(1.3);
      for (let i = 0; i < 7; i++) { const c = cyl(0.05, 0.05, 0.16, i % 2 ? '#ff9ec4' : '#9fe0ff', Math.cos(i * 0.9) * 0.16, 0.02 + (i % 2) * 0.05, Math.sin(i * 0.9) * 0.16 - 0.04, h, 10); c.rotation.z = Math.PI / 2; c.rotation.y = i * 0.9; }
      return h;
    }
    case 'chef': {
      const h = top(); h.scale.multiplyScalar(1.4);
      cyl(0.17, 0.17, 0.2, '#ffffff', 0, 0.08, 0, h, 20);
      for (let i = 0; i < 5; i++) oval('#ffffff', Math.cos(i * 1.25) * 0.12, 0.28, Math.sin(i * 1.25) * 0.12, 0.13, 0.11, 0.13, h);
      return h;
    }
    case 'miel': {
      const h = top(); h.scale.multiplyScalar(1.3);
      cyl(0.15, 0.17, 0.22, '#d9952a', 0, 0.1, 0, h, 16); cyl(0.16, 0.16, 0.04, '#c9a14a', 0, 0.22, 0, h, 16);
      mesh(new THREE.PlaneGeometry(0.2, 0.08), M('#fff', { map: textTexture('MIEL', { color: '#7a4a10', bg: '#fff1c4', size: 120, w: 400, h: 160 }) }), 0, 0.1, 0.172, h, false);
      for (let i = 0; i < 4; i++) oval('#f2b743', Math.cos(i * 1.6) * 0.15, -0.02, Math.sin(i * 1.6) * 0.15, 0.03, 0.07, 0.03, h);
      return h;
    }
    case 'vendas': {
      const g = group(B.obj, 0, B.y, B.z);
      for (let i = 0; i < 6; i++) { const t = mesh(new THREE.TorusGeometry(1, 0.05, 6, 30), '#f3efe4', 0, 0, (i / 5 - 0.5) * B.sz * 1.5, g); t.scale.set(B.sx * (1.02 - Math.abs(i / 5 - 0.5) * 0.6), B.sy * (1.02 - Math.abs(i / 5 - 0.5) * 0.6), 1); t.rotation.z = i * 0.3; }
      const h = top(); for (let i = 0; i < 3; i++) { const t = mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 24), '#f3efe4', 0, -0.05 - i * 0.07, 0, h); t.rotation.x = Math.PI / 2 + (i - 1) * 0.2; }
      return g;
    }
    case 'helice': {
      const h = top(); h.scale.multiplyScalar(1.4);
      for (let i = 0; i < 4; i++) mesh(new THREE.SphereGeometry(0.17, 8, 6, i * Math.PI / 2, Math.PI / 2, 0, Math.PI / 2), COLORS[i], 0, -0.02, 0, h);
      cyl(0.012, 0.012, 0.16, '#555', 0, 0.22, 0, h, 5);
      const pr = group(h, 0, 0.3, 0); for (const s of [-1, 1]) { const b = mesh(rbox(0.32, 0.015, 0.07, 0.01), '#f2b743', s * 0.17, 0, 0, pr); b.rotation.x = s * 0.25; }
      spin(pr); return h;
    }
    case 'corona': {
      const h = top(); h.scale.multiplyScalar(1.6);
      const gold = M('#f2b743', { m: 0.7, r: 0.25 });
      mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 20, 1, true), M('#f2b743', { m: 0.7, r: 0.25, ds: true }), 0, 0.05, 0, h);
      for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; mesh(new THREE.ConeGeometry(0.05, 0.14, 6), gold, Math.cos(an) * 0.16, 0.18, Math.sin(an) * 0.16, h); oval(['#d64933', '#3b9c98'][i % 2], Math.cos(an) * 0.172, 0.05, Math.sin(an) * 0.172, 0.025, 0.025, 0.012, h); }
      return h;
    }
    case 'capa': {
      const g = group(N.obj, 0, N.y, (N.z || 0) - N.r * 0.6); if (N.rx) g.rotation.x = N.rx * 0.2;
      const cape = mesh(new THREE.CylinderGeometry(N.r * 1.2, B.sx * 2.2, B.sz * 2.2, 20, 1, true, Math.PI * 0.6, Math.PI * 0.8), M('#d64933', { ds: true }), 0, -B.sz * 0.9, -N.r * 0.2, g);
      cape.rotation.x = -1.1; a.cape = cape;
      const em = mesh(new THREE.CircleGeometry(N.r * 0.6, 20), M('#f2b743'), 0, 0, N.r * 1.1, g, false);
      return g;
    }
    case 'jersey': {
      oval('#c0392b', 0, B.y, B.z, B.sx * 1.08, B.sy * 1.08, B.sz * 0.85, B.obj);
      for (const f of [-0.3, 0, 0.3]) oval('#f2e6d0', 0, B.y, B.z + f * B.sz, B.sx * 1.1, B.sy * 1.1, B.sz * 0.08, B.obj);
      return null;
    }
  }
  return null;
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

/* ---------- Animales exóticos ---------- */
function anchorsOf(head, face, top, neck, body) { return { head, face, top, neck, body }; }
export function makeAnt() {
  const root = new THREE.Group(), c = '#7a2e1e';
  const bodyG = group(root);
  oval(c, 0, 0.3, -0.32, 0.17, 0.15, 0.24, bodyG); oval(c, 0, 0.3, 0, 0.1, 0.09, 0.12, bodyG);
  const legs = [];
  for (const z of [-0.08, 0.02, 0.12]) for (const s of [-1, 1]) { const L = group(root, s * 0.08, 0.3, z); const l = cyl(0.015, 0.012, 0.36, c, s * 0.12, -0.12, 0, L, 5); l.rotation.z = s * 0.9; legs.push(L); }
  const head = group(root, 0, 0.36, 0.2);
  oval(c, 0, 0, 0, 0.14, 0.13, 0.13, head);
  for (const s of [-1, 1]) { const an = cyl(0.01, 0.01, 0.25, c, s * 0.06, 0.18, 0.06, head, 4); an.rotation.z = -s * 0.4; an.rotation.x = 0.4; oval(c, s * 0.11, 0.3, 0.1, 0.025, 0.025, 0.025, head); }
  eyes(head, 0.065, 0.03, 0.11, 0.03);
  return { root, head, tail: null, legs: legs.slice(0, 4), height: 0.6, anchors: anchorsOf(head, [0.065, 0.03, 0.13, 0.04], [0.12, 0.45], { obj: root, y: 0.33, z: 0.12, r: 0.08, rx: 0.3 }, { obj: bodyG, y: 0.3, z: -0.32, sx: 0.17, sy: 0.15, sz: 0.24 }) };
}
export function makePenguin() {
  const root = new THREE.Group(), bodyG = group(root);
  oval('#1f2430', 0, 0.42, 0, 0.24, 0.36, 0.22, bodyG); oval('#ffffff', 0, 0.38, 0.08, 0.18, 0.28, 0.16, bodyG);
  const head = group(root, 0, 0.82, 0.02); oval('#1f2430', 0, 0, 0, 0.17, 0.16, 0.16, head); oval('#ffffff', 0, -0.02, 0.08, 0.12, 0.1, 0.09, head);
  const beak = mesh(new THREE.ConeGeometry(0.04, 0.12, 10), '#f39c2a', 0, -0.02, 0.18, head); beak.rotation.x = Math.PI / 2;
  eyes(head, 0.06, 0.03, 0.14, 0.025);
  const legs = []; for (const s of [-1, 1]) { const w = group(root, s * 0.24, 0.55, 0); const f = oval('#1f2430', 0, -0.12, 0, 0.04, 0.2, 0.09, w); w.rotation.z = s * 0.25; legs.push(w); oval('#f39c2a', s * 0.09, 0.03, 0.08, 0.07, 0.025, 0.1, root); }
  return { root, head, tail: null, legs, height: 1.0, waddle: true, anchors: anchorsOf(head, [0.06, 0.03, 0.16, 0.045], [0.14, 0.55], { obj: root, y: 0.7, z: 0.02, r: 0.17 }, { obj: bodyG, y: 0.42, z: 0, sx: 0.24, sy: 0.36, sz: 0.22 }) };
}
export function makeCroc() {
  const root = new THREE.Group(), c = '#5f8f3a', l = '#c9c27a', bodyG = group(root);
  oval(c, 0, 0.22, 0, 0.26, 0.15, 0.55, bodyG);
  for (let i = 0; i < 6; i++) mesh(new THREE.ConeGeometry(0.04, 0.08, 4), '#4d7a2f', 0, 0.36, -0.4 + i * 0.15, bodyG);
  const legs = legsQuad(root, c, 0.24, 0.32, 0.16, 0.06); legs.forEach(L => (L.rotation.z = 0));
  const head = group(root, 0, 0.26, 0.55); oval(c, 0, 0, 0.05, 0.2, 0.13, 0.2, head);
  mesh(rbox(0.26, 0.09, 0.42, 0.04), c, 0, -0.02, 0.32, head); mesh(rbox(0.24, 0.05, 0.4, 0.03), l, 0, -0.08, 0.31, head);
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) mesh(new THREE.ConeGeometry(0.012, 0.04, 4), '#fff', s * 0.11, -0.06, 0.18 + i * 0.07, head, false).rotation.x = Math.PI;
  for (const s of [-1, 1]) oval(c, s * 0.08, 0.1, 0.05, 0.06, 0.06, 0.06, head);
  eyes(head, 0.08, 0.12, 0.09, 0.03, '#d9c22a');
  const tail = group(root, 0, 0.2, -0.5); const t = mesh(new THREE.ConeGeometry(0.15, 0.8, 10), c, 0, 0, -0.38, tail); t.rotation.x = -Math.PI / 2;
  return { root, head, tail, legs, height: 0.5, anchors: anchorsOf(head, [0.08, 0.12, 0.15, 0.045], [0.12, 0.7], { obj: root, y: 0.26, z: 0.48, r: 0.17 }, { obj: bodyG, y: 0.22, z: 0, sx: 0.26, sy: 0.15, sz: 0.55 }) };
}
export function makeTurtle() {
  const root = new THREE.Group(), c = '#8bb35a', bodyG = group(root);
  const shell = mesh(new THREE.SphereGeometry(0.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#6b4a2b', 0, 0.12, 0, bodyG); shell.scale.set(1, 0.8, 1.15);
  for (let i = 0; i < 6; i++) oval('#8a6a3a', Math.cos(i) * 0.2, 0.3, Math.sin(i) * 0.24, 0.1, 0.03, 0.1, bodyG);
  cyl(0.4, 0.4, 0.06, '#d9c58a', 0, 0.12, 0, bodyG, 20).scale.set(1, 1, 1.15);
  const legs = legsQuad(root, c, 0.28, 0.3, 0.14, 0.07);
  const head = group(root, 0, 0.24, 0.5); oval(c, 0, 0, 0, 0.12, 0.11, 0.14, head); eyes(head, 0.06, 0.04, 0.1, 0.025);
  oval('#a5352a', 0, -0.04, 0.13, 0.04, 0.012, 0.01, head);
  return { root, head, tail: null, legs, height: 0.5, anchors: anchorsOf(head, [0.06, 0.04, 0.12, 0.04], [0.1, 0.45], { obj: root, y: 0.22, z: 0.42, r: 0.09 }, { obj: bodyG, y: 0.2, z: 0, sx: 0.4, sy: 0.25, sz: 0.46 }) };
}
export function makeMonkey() {
  const root = new THREE.Group(), c = '#8a5a3a', f = '#e9c6a0', bodyG = group(root);
  oval(c, 0, 0.55, 0, 0.2, 0.26, 0.18, bodyG); oval(f, 0, 0.52, 0.1, 0.13, 0.17, 0.09, bodyG);
  const legs = []; for (const s of [-1, 1]) { const L = group(root, s * 0.1, 0.35, 0); cyl(0.05, 0.05, 0.33, c, 0, -0.16, 0, L, 8); legs.push(L); const A = group(root, s * 0.22, 0.72, 0); cyl(0.04, 0.04, 0.5, c, 0, -0.25, 0, A, 8); oval(f, 0, -0.5, 0, 0.05, 0.05, 0.05, A); A.rotation.z = s * 0.25; legs.push(A); }
  const head = group(root, 0, 0.95, 0.02); oval(c, 0, 0, 0, 0.19, 0.18, 0.17, head); oval(f, 0, -0.03, 0.09, 0.14, 0.12, 0.1, head);
  for (const s of [-1, 1]) oval(f, s * 0.19, 0.02, 0, 0.07, 0.08, 0.03, head);
  eyes(head, 0.06, 0.03, 0.17, 0.028);
  const tail = group(root, 0, 0.4, -0.15); tubeTail(tail, [[0, 0, 0], [0, -0.2, -0.2], [0, 0.1, -0.4], [0, 0.35, -0.35]], 0.025, c);
  return { root, head, tail, legs, height: 1.2, anchors: anchorsOf(head, [0.06, 0.03, 0.19, 0.045], [0.15, 0.6], { obj: root, y: 0.8, z: 0.02, r: 0.12 }, { obj: bodyG, y: 0.55, z: 0, sx: 0.2, sy: 0.26, sz: 0.18 }) };
}
export function makePanda() {
  const root = new THREE.Group(), bodyG = group(root);
  oval('#f4f4f2', 0, 0.55, 0, 0.36, 0.34, 0.5, bodyG); oval('#1f2228', 0, 0.62, 0.1, 0.37, 0.15, 0.2, bodyG);
  const legs = legsQuad(root, '#1f2228', 0.22, 0.32, 0.32, 0.11);
  const head = group(root, 0, 0.82, 0.5); oval('#f4f4f2', 0, 0, 0, 0.28, 0.25, 0.25, head);
  for (const s of [-1, 1]) { oval('#1f2228', s * 0.21, 0.2, -0.02, 0.09, 0.09, 0.06, head); const p = oval('#1f2228', s * 0.1, 0.03, 0.2, 0.07, 0.09, 0.04, head); p.rotation.z = s * 0.4; }
  eyes(head, 0.1, 0.04, 0.235, 0.025);
  oval('#1f2228', 0, -0.07, 0.24, 0.04, 0.03, 0.03, head);
  return { root, head, tail: null, legs, height: 1.1, anchors: anchorsOf(head, [0.1, 0.04, 0.26, 0.06], [0.22, 0.85], { obj: head, y: -0.2, z: -0.05, r: 0.22 }, { obj: bodyG, y: 0.55, z: 0, sx: 0.36, sy: 0.34, sz: 0.5 }) };
}
export function makeFlamingo() {
  const root = new THREE.Group(), p = '#f28fb0', bodyG = group(root);
  oval(p, 0, 1.0, 0, 0.18, 0.15, 0.3, bodyG); oval('#e46f96', 0, 1.02, -0.05, 0.16, 0.1, 0.25, bodyG);
  const legs = []; const L = group(root, 0.05, 0.92, 0); cyl(0.015, 0.015, 0.92, '#e46f96', 0, -0.46, 0, L, 5); legs.push(L);
  const L2 = group(root, -0.05, 0.92, 0); cyl(0.015, 0.015, 0.45, '#e46f96', 0, -0.2, 0, L2, 5); L2.rotation.x = 1.2;
  const neck = group(root, 0, 1.05, 0.22); tubeTail(neck, [[0, 0, 0], [0, 0.25, 0.12], [0, 0.45, -0.02], [0, 0.6, 0.06]], 0.035, p);
  const head = group(neck, 0, 0.62, 0.08); oval(p, 0, 0, 0, 0.08, 0.08, 0.09, head);
  const beak = mesh(new THREE.ConeGeometry(0.03, 0.14, 8), '#1f2228', 0, -0.05, 0.1, head); beak.rotation.x = 2.2;
  eyes(head, 0.045, 0.02, 0.06, 0.016);
  return { root, head, tail: null, legs, height: 1.75, anchors: anchorsOf(head, [0.045, 0.02, 0.08, 0.03], [0.07, 0.35], { obj: neck, y: 0.3, z: 0.1, r: 0.06 }, { obj: bodyG, y: 1.0, z: 0, sx: 0.18, sy: 0.15, sz: 0.3 }) };
}
export function makeOctopus() {
  const root = new THREE.Group(), c = '#e0645a', bodyG = group(root);
  const head = group(root, 0, 0.62, 0); oval(c, 0, 0.05, -0.05, 0.3, 0.34, 0.3, head);
  eyes(head, 0.1, -0.05, 0.25, 0.045);
  const legs = [];
  for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2, T = group(root, Math.cos(an) * 0.15, 0.35, Math.sin(an) * 0.15); T.rotation.y = -an; tubeTail(T, [[0, 0, 0], [0.2, -0.25, 0], [0.38, -0.32, 0.05], [0.5, -0.25, 0]], 0.045, c); legs.push(T); }
  return { root, head, tail: null, legs: [], tentacles: legs, height: 1.0, anchors: anchorsOf(head, [0.1, -0.05, 0.28, 0.06], [0.33, 0.85], { obj: root, y: 0.38, z: 0, r: 0.2 }, { obj: head, y: 0.05, z: -0.05, sx: 0.3, sy: 0.34, sz: 0.3 }) };
}
export function makeCamel() {
  const root = new THREE.Group(), c = '#c9a46a', bodyG = group(root);
  oval(c, 0, 1.2, 0, 0.32, 0.3, 0.62, bodyG); oval(c, 0, 1.5, -0.08, 0.2, 0.22, 0.25, bodyG);
  const legs = legsQuad(root, c, 0.18, 0.4, 1.0, 0.06);
  const neck = group(root, 0, 1.25, 0.55); neck.rotation.x = 0.7; cyl(0.09, 0.13, 0.8, c, 0, 0.35, 0, neck);
  const head = group(neck, 0, 0.8, 0.05); head.rotation.x = -0.7; oval(c, 0, 0, 0.08, 0.12, 0.12, 0.22, head);
  oval('#a8844f', 0, -0.04, 0.27, 0.08, 0.06, 0.05, head);
  for (const s of [-1, 1]) oval(c, s * 0.1, 0.1, -0.05, 0.03, 0.06, 0.03, head);
  eyes(head, 0.08, 0.05, 0.14, 0.025);
  const tail = group(root, 0, 1.2, -0.6); tubeTail(tail, [[0, 0, 0], [0, -0.25, -0.05]], 0.02, c);
  return { root, head, tail, legs, height: 2.0, anchors: anchorsOf(head, [0.08, 0.05, 0.17, 0.04], [0.12, 0.55], { obj: neck, y: 0.45, z: 0, r: 0.12 }, { obj: bodyG, y: 1.2, z: 0, sx: 0.32, sy: 0.3, sz: 0.62 }) };
}
export function makeFrog() {
  const root = new THREE.Group(), c = '#5bb34a', bodyG = group(root);
  oval(c, 0, 0.22, 0, 0.26, 0.2, 0.28, bodyG); oval('#d9e8a0', 0, 0.18, 0.12, 0.18, 0.13, 0.15, bodyG);
  const legs = []; for (const s of [-1, 1]) { const L = group(root, s * 0.22, 0.1, -0.1); oval(c, 0, 0, 0, 0.1, 0.07, 0.18, L); legs.push(L); oval(c, s * 0.14, 0.04, 0.2, 0.05, 0.08, 0.05, root); }
  const head = group(root, 0, 0.36, 0.14);
  for (const s of [-1, 1]) { oval(c, s * 0.1, 0.06, 0, 0.08, 0.08, 0.08, head); oval('#111', s * 0.1, 0.07, 0.06, 0.04, 0.045, 0.03, head); oval('#fff', s * 0.1 + 0.015, 0.09, 0.08, 0.012, 0.012, 0.01, head); }
  const m = mesh(new THREE.TorusGeometry(0.1, 0.01, 6, 16, Math.PI), '#2f6b2a', 0, -0.06, 0.12, head, false); m.rotation.z = Math.PI;
  return { root, head, tail: null, legs, height: 0.5, anchors: anchorsOf(head, [0.1, 0.07, 0.1, 0.06], [0.12, 0.5], { obj: root, y: 0.3, z: 0.1, r: 0.16 }, { obj: bodyG, y: 0.22, z: 0, sx: 0.26, sy: 0.2, sz: 0.28 }) };
}
export function makeSloth() {
  const root = new THREE.Group(), c = '#8f7a5e', f = '#d9c6a3', bodyG = group(root);
  oval(c, 0, 0.5, 0, 0.26, 0.3, 0.22, bodyG);
  const legs = []; for (const s of [-1, 1]) { const A = group(root, s * 0.24, 0.65, 0.05); cyl(0.05, 0.04, 0.55, c, 0, -0.27, 0, A, 8); A.rotation.z = s * 0.5; A.rotation.x = -0.4; legs.push(A); const L = group(root, s * 0.12, 0.3, 0.05); cyl(0.05, 0.05, 0.28, c, 0, -0.14, 0, L, 8); legs.push(L); }
  const head = group(root, 0, 0.88, 0.04); oval(c, 0, 0, 0, 0.18, 0.17, 0.16, head); oval(f, 0, -0.01, 0.08, 0.14, 0.12, 0.09, head);
  for (const s of [-1, 1]) { const m = oval('#5a4632', s * 0.07, 0.01, 0.16, 0.06, 0.03, 0.02, head); m.rotation.z = s * -0.4; }
  eyes(head, 0.07, 0.01, 0.17, 0.02);
  oval('#3a2a1c', 0, -0.04, 0.17, 0.03, 0.02, 0.02, head);
  const s2 = mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI), '#3a2a1c', 0, -0.08, 0.16, head, false); s2.rotation.z = Math.PI;
  return { root, head, tail: null, legs, height: 1.1, slow: true, anchors: anchorsOf(head, [0.07, 0.01, 0.18, 0.045], [0.15, 0.6], { obj: root, y: 0.76, z: 0.03, r: 0.13 }, { obj: bodyG, y: 0.5, z: 0, sx: 0.26, sy: 0.3, sz: 0.22 }) };
}

const MAKERS = {
  gato: (v) => makeCat(v), elefante: makeElephant, jirafa: makeGiraffe, 'pájaro': (v) => makeBird(v), 'león': makeLion,
  hormiga: makeAnt, 'pingüino': makePenguin, cocodrilo: makeCroc, tortuga: makeTurtle, mono: makeMonkey, panda: makePanda,
  flamenco: makeFlamingo, pulpo: makeOctopus, camello: makeCamel, rana: makeFrog, perezoso: makeSloth,
};
export function makeAnimal(species, variant) {
  const a = (MAKERS[species] || makeCat)(variant);
  a.species = species; a.phase = Math.random() * 10; a.anchors.root = a.root;
  a.animate = (t, moving) => {
    const p = a.phase, an = a.anchors;
    if (a.tail) a.tail.rotation.y = Math.sin(t * 2.2 + p) * 0.35;
    if (a.head) a.head.rotation.z = Math.sin(t * 0.9 + p) * 0.06;
    const sw = moving ? Math.sin(t * (a.slow ? 3 : 10)) * 0.5 : 0;
    a.legs.forEach((l, i) => (l.rotation.x = (i % 2 ? sw : -sw)));
    if (a.tentacles) a.tentacles.forEach((tt, i) => (tt.rotation.z = Math.sin(t * 2 + i) * 0.15));
    if (a.waddle) a.root.rotation.z = moving ? Math.sin(t * 8) * 0.12 : Math.sin(t * 1.5 + p) * 0.03;
    a.root.position.y = (a.baseY || 0) + (moving ? Math.abs(Math.sin(t * 10)) * 0.04 : 0);
    (an.spinners || []).forEach(o => (o.rotation.y += 0.4));
    if (an.sway) an.sway.rotation.z = Math.sin(t * 1.4 + p) * 0.12;
    if (an.notes) an.notes.forEach((n, i) => (n.position.y = 0.25 + i * 0.08 + Math.sin(t * 3 + i) * 0.05));
    if (an.cape) an.cape.rotation.x = -1.1 + Math.sin(t * 3 + p) * 0.08;
  };
  return a;
}

/* ---------- Porsche 911 ---------- */
export function makePorsche(color = '#c8102e', gt3 = false) {
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
  if (!gt3) { // alerón trasero discreto
    mesh(rbox(0.38, 0.05, 1.5, 0.02), paint, -2.0, 1.16, 0, car);
    for (const z of [-0.45, 0.45]) mesh(box(0.08, 0.2, 0.05), '#1c1f24', -1.98, 1.04, z, car);
  } else { // GT3 RS: alerón cuello de cisne gigante, tomas de aire y franjas
    const carbon = M('#1c1f24', { r: 0.35, m: 0.4 });
    const wing = mesh(rbox(0.6, 0.07, 2.1, 0.03), carbon, -1.95, 1.62, 0, car); wing.rotation.z = -0.08;
    for (const z of [-1.04, 1.04]) mesh(rbox(0.7, 0.32, 0.04, 0.02), carbon, -1.95, 1.6, z, car);
    for (const z of [-0.5, 0.5]) { const n = mesh(box(0.06, 0.62, 0.05), carbon, -1.88, 1.3, z, car); n.rotation.z = 0.25; }
    mesh(rbox(0.5, 0.03, 1.3, 0.02), carbon, 2.2, 0.36, 0, car); // splitter
    for (const z of [-0.5, 0.5]) mesh(rbox(0.5, 0.02, 0.18, 0.01), carbon, 1.35, 0.9, z, car); // rejillas capó
    for (const z of [-0.17, 0.17]) { const st = mesh(box(1.3, 0.012, 0.16), '#ffffff', 1.35, 1.0, z, car); st.rotation.z = -0.1; } // franjas
  }
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
