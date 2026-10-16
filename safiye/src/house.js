// Casa de Stuttgart según el plano dibujado a mano por David (ampliada un 30 %):
// jardín al norte; cocina (franja oeste), salón-comedor con gran cristalera,
// habitación al este con cristalera pequeña, baño al suroeste y recibidor.
import * as THREE from 'three';
import { M, mesh, rbox, box, oval, cyl, group, plant, tree, textTexture, plankTexture, tileTexture, makePerson, makePorsche, SAFIYE, ALEJANDRO } from './models.js';
import { walkPath, faceTo, navPath, nearestNode } from './engine.js';

const WALL = '#f3efe7';
const NODES = {
  salon: [-1.3, 4.7], sofaBack: [-0.3, 2.6], gIn: [-1.56, 0.75], gOut: [-1.56, -0.95], garden: [0, -2.8], bbqVisit: [-1.9, -3.5], bbq: [-3.0, -3.5],
  pool: [1.85, -4.36], lawn: [-6.0, -1.6], plants: [0, -7.5],
  kEntry: [-5.2, 5.45], kCorner: [-6.7, 5.45], kitchen: [-6.7, 3.25], fridge: [-6.7, 1.0],
  hallTop: [0.72, 5.6], hall: [0.72, 7.6], door: [0.78, 9.5], drive: [2.8, 10.05],
  bedDoor: [3.25, 5.25], bedroom: [4.7, 5.3], bedside: [5.15, 7.15], desk: [5.1, 1.95], bgIn: [5.46, 0.75], bgOut: [5.46, -0.95],
  speaker: [2.3, 4.2], bathDoor: [-0.85, 8.2], bath: [-3.2, 7.9], shower: [-4.6, 7.75],
};
const EDGES = [['salon', 'sofaBack'], ['salon', 'gIn'], ['sofaBack', 'gIn'], ['gIn', 'gOut'], ['gOut', 'garden'], ['garden', 'bbqVisit'], ['bbqVisit', 'bbq'], ['gOut', 'bbqVisit'], ['garden', 'pool'],
  ['garden', 'plants'], ['garden', 'lawn'], ['gOut', 'lawn'], ['bbq', 'lawn'],
  ['salon', 'kEntry'], ['kEntry', 'kCorner'], ['kCorner', 'kitchen'], ['kitchen', 'fridge'], ['salon', 'hallTop'], ['hallTop', 'hall'], ['hall', 'door'], ['door', 'drive'],
  ['hallTop', 'bedDoor'], ['salon', 'speaker'], ['speaker', 'bedDoor'], ['sofaBack', 'speaker'], ['bedDoor', 'bedroom'], ['bedroom', 'bedside'], ['bedroom', 'desk'], ['desk', 'bgIn'], ['bedroom', 'bgIn'], ['bgIn', 'bgOut'], ['bgOut', 'garden'], ['bgOut', 'pool'],
  ['hall', 'bathDoor'], ['bathDoor', 'bath'], ['bath', 'shower']];

// Zonas donde se puede hacer algo (al acercarse con las flechas o desde el panel)
export const HOTSPOTS = [
  { id: 'sofa', node: 'sofaBack', emoji: '🛋️', name: 'Sofá', ale: ['play'], safi: [] },
  { id: 'desk', node: 'desk', emoji: '💻', name: 'Escritorio', ale: ['trabajo'], safi: [] },
  { id: 'bbq', node: 'bbq', emoji: '🔥', name: 'Barbacoa', ale: ['barbacoa'], safi: ['barbacoa'] },
  { id: 'pool', node: 'pool', emoji: '🛟', name: 'Piscina', ale: ['piscina'], safi: ['piscina'] },
  { id: 'bed', node: 'bedside', emoji: '🛏️', name: 'Cama', ale: ['dormir', 'romance'], safi: ['dormir', 'romance'] },
  { id: 'shower', node: 'shower', emoji: '🚿', name: 'Ducha', ale: ['ducha'], safi: ['ducha'] },
  { id: 'hob', node: 'kitchen', emoji: '🍳', name: 'Cocina', ale: ['nevera'], safi: ['cocinar'] },
  { id: 'fridge', node: 'fridge', emoji: '🧀', name: 'Nevera', ale: ['nevera'], safi: ['nevera'] },
  { id: 'speaker', node: 'speaker', emoji: '🎵', name: 'Altavoz', ale: ['musica', 'bailar'], safi: ['musica', 'bailar'] },
  { id: 'lawn', node: 'lawn', emoji: '🌱', name: 'Cortacésped', ale: ['cesped'], safi: ['cesped'] },
  { id: 'plants', node: 'plants', emoji: '🪴', name: 'Macetas', ale: ['macetas'], safi: ['macetas'] },
  { id: 'porsche', node: 'drive', emoji: '🏎️', name: 'Porsche 911', ale: [], safi: ['viajar'] },
];
export const ACTIONS = {
  play: ['🎮', 'Jugar a la Play'], trabajo: ['💻', 'Teletrabajar (+80 €)'], barbacoa: ['🔥', 'Hacer una barbacoa'], piscina: ['🛟', 'Bañarse en la piscina'],
  dormir: ['😴', 'Dormir'], romance: ['❤️‍🔥', 'Noche romántica'], ducha: ['🚿', 'Pegarse una ducha'], cocinar: ['🍳', 'Cocinar para Alejandro'],
  nevera: ['🧀', 'Picotear de la nevera'], musica: ['🎵', 'Encender / apagar la música'], bailar: ['💃', 'Bailar bachata juntos'],
  cesped: ['🌱', 'Cortar el césped'], macetas: ['🪴', 'Arreglar las macetas'], viajar: ['🏎️', 'Coger el Porsche'], masaje: ['💆‍♂️', 'Darle un masaje'],
};
const ALE_VISIT = { play: 'sofaBack', trabajo: 'desk', barbacoa: 'bbqVisit', piscina: 'pool', dormir: 'bedside', ducha: 'shower' };

export function buildHouse(engine, cb) {
  const W = engine.world, root = group(W);
  const solids = [], circles = [];
  const rect = (x1, z1, x2, z2) => solids.push([Math.min(x1, x2), Math.min(z1, z2), Math.max(x1, x2), Math.max(z1, z2)]);
  const circ = (x, z, r) => circles.push([x, z, r]);
  function wall(p, x1, z1, x2, z2, h, color = WALL, t = 0.16) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const m = mesh(box(len + t, h, t), color, (x1 + x2) / 2, h / 2, (z1 + z2) / 2, p);
    m.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    rect(x1 - t / 2, z1 - t / 2, x2 + t / 2, z2 + t / 2);
    return m;
  }
  function glassWall(p, x1, x2, z, h, gapC, gapW) {
    const fr = '#2d3136', glass = M('#bfe3f2', { t: 0.22, r: 0.05, m: 0.1 });
    for (const [a, b] of [[x1, gapC - gapW / 2], [gapC + gapW / 2, x2]]) {
      const w = b - a, cx = (a + b) / 2;
      mesh(box(w, h - 0.08, 0.04), glass, cx, h / 2, z, p, false).userData.solid = false;
      rect(a, z - 0.08, b, z + 0.08);
      const n = Math.max(1, Math.round(w / 1.4));
      for (let i = 0; i <= n; i++) mesh(box(0.06, h, 0.1), fr, a + (w * i) / n, h / 2, z, p);
    }
    mesh(box(x2 - x1 + 0.1, 0.08, 0.1), fr, (x1 + x2) / 2, h - 0.04, z, p); mesh(box(x2 - x1 + 0.1, 0.05, 0.1), fr, (x1 + x2) / 2, 0.03, z, p);
    // hoja corredera abierta (se ha deslizado detrás del cristal fijo)
    mesh(box(gapW, h - 0.08, 0.04), glass, gapC + gapW * 0.55, h / 2, z - 0.12, p, false).userData.solid = false;
  }
  const hint = (obj, text) => { obj.userData.hint = text; return obj; };

  const floorTex = plankTexture(); floorTex.repeat.set(4, 2.6); floorTex.rotation = Math.PI / 2;
  // Maqueta: zócalo de pizarra
  mesh(rbox(19.4, 0.7, 23, 0.12), '#2c3843', 0, -0.36, 1.5, root);
  mesh(new THREE.PlaneGeometry(7, 0.42), M('#ffffff', { map: textTexture('STUTTGART · ZUHAUSE', { color: '#c9d3dc', size: 92, spacing: '18px', w: 1600, h: 140 }), t: 0.9 }), 0, -0.36, 13.01, root, false);
  // jardín
  mesh(new THREE.BoxGeometry(18.4, 0.06, 9.4), new THREE.MeshStandardMaterial({ color: '#7fae5f', roughness: 0.9 }), 0, 0.0, -4.6, root);
  const stripeCv = document.createElement('canvas'); stripeCv.width = 256; stripeCv.height = 16; const sg = stripeCv.getContext('2d');
  for (let i = 0; i < 8; i++) { sg.fillStyle = i % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(0,40,0,0.14)'; sg.fillRect(i * 32, 0, 32, 16); }
  const stripes = mesh(new THREE.PlaneGeometry(16, 7.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(stripeCv), transparent: true }), 0, 0.035, -4.8, root, false);
  stripes.rotation.x = -Math.PI / 2; stripes.visible = !!cb.lawnCut; stripes.userData.solid = false;
  for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.04, 8), '#d8d1c4', -1.56 + Math.sin(i) * 0.15, 0.04, -1.2 - i * 0.75, root);
  mesh(rbox(18.4, 0.9, 0.5, 0.2), '#4f8248', 0, 0.45, -9.0, root); rect(-9.2, -9.3, 9.2, -8.75);
  mesh(rbox(0.5, 0.9, 9.0, 0.2), '#4f8248', -8.95, 0.45, -4.5, root); rect(-9.2, -9.2, -8.7, 0);
  mesh(rbox(0.5, 0.9, 9.0, 0.2), '#4f8248', 8.95, 0.45, -4.5, root); rect(8.7, -9.2, 9.2, 0);
  tree(root, -6.8, -7.3, 1.2); circ(-6.8, -7.3, 0.5); tree(root, 6.9, -7.4, 1.0); circ(6.9, -7.4, 0.5);
  const pots = [];
  for (let x = -6; x <= 6; x += 2) { const p = plant(root, x, -8.25, 0.7, '#c97b56'); p.scale.setScalar(0.7 * (cb.plantsScale || 1)); pots.push(p); circ(x, -8.25, 0.25); }
  const potsHit = group(root, 0, 0, -8.25); mesh(box(13, 0.8, 0.8), M('#000000', { t: 0.0 }), 0, 0.4, 0, potsHit, false);
  hint(potsHit, 'Macetas · arreglarlas alegra a Alejandro'); potsHit.userData.onClick = () => cb.onSpot('plants');
  for (let i = 0; i < 16; i++) {
    const b = oval(M('#fff2c4', { e: '#ffd27a', ei: 0 }), -7 + i * 0.93, 2.1 - Math.sin((i % 8) / 7 * Math.PI) * 0.25, -8.6, 0.05, 0.07, 0.05, root);
    b.userData.base = 2.2; engine.nightLights.push(b);
  }
  for (const x of [-7.3, 7.3]) cyl(0.03, 0.03, 2.2, '#3a3a3a', x, 1.1, -8.6, root, 6);
  // barbacoa
  const bbq = group(root, -3.0, 0, -4.6); circ(-3.0, -4.6, 0.55);
  oval('#1f2326', 0, 0.82, 0, 0.42, 0.3, 0.42, bbq);
  mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.04, 24), '#555', 0, 0.86, 0, bbq);
  for (let i = 0; i < 3; i++) { const l = cyl(0.025, 0.025, 0.8, '#2b2b2b', Math.cos(i * 2.1) * 0.28, 0.4, Math.sin(i * 2.1) * 0.28, bbq, 6); l.rotation.z = Math.cos(i * 2.1) * 0.2; l.rotation.x = -Math.sin(i * 2.1) * 0.2; }
  const grillGlow = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 24), M('#ff6a2a', { e: '#ff4d00', ei: 0 }), 0, 0.88, 0, bbq, false);
  mesh(rbox(1.2, 0.08, 0.6, 0.03), '#a77b52', 1.05, 0.8, 0.0, bbq); cyl(0.03, 0.03, 0.8, '#555', 1.05, 0.4, 0, bbq, 6); rect(-2.4, -4.9, -1.4, -4.3);
  hint(bbq, 'Barbacoa · manda a Alejandro a hacer una barbacoa'); bbq.userData.onClick = () => cb.onSpot('bbq');
  // piscina de plástico
  const pool = group(root, 3.64, 0, -4.36); circ(3.64, -4.36, 1.55);
  const ring = mesh(new THREE.TorusGeometry(1.4, 0.22, 14, 40), '#3fa7e0', 0, 0.2, 0, pool); ring.rotation.x = Math.PI / 2;
  const ring2 = mesh(new THREE.TorusGeometry(1.4, 0.19, 14, 40), '#f2f2f2', 0, 0.54, 0, pool); ring2.rotation.x = Math.PI / 2;
  const waterMat = new THREE.MeshStandardMaterial({ color: '#7fd3f0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 });
  mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.5, 40), waterMat, 0, 0.3, 0, pool, false);
  const duck = group(pool, 0.6, 0.6, 0.4);
  oval('#ffd23f', 0, 0, 0, 0.14, 0.11, 0.18, duck); oval('#ffd23f', 0, 0.13, 0.1, 0.09, 0.09, 0.09, duck); oval('#ff8c1a', 0, 0.12, 0.2, 0.05, 0.025, 0.05, duck);
  hint(pool, 'Piscina · manda a Alejandro a darse un baño'); pool.userData.onClick = () => cb.onSpot('pool');
  for (const x of [6.0, 7.3]) { const t = group(root, x, 0, -2.1); rect(x - 0.4, -3.1, x + 0.4, -1.1); mesh(rbox(0.7, 0.12, 1.8, 0.05), '#f2ece0', 0, 0.3, 0, t); const b = mesh(rbox(0.7, 0.1, 0.7, 0.05), '#f2ece0', 0, 0.55, -0.85, t); b.rotation.x = -0.9; for (const s of [-1, 1]) mesh(box(0.05, 0.3, 1.6), '#b98f66', s * 0.3, 0.15, 0, t); }
  oval('#f2b743', 6.6, 0.02, -3.8, 0.6, 0.01, 0.6, root);
  // cortacésped
  const mower = group(root, -6.6, 0, -1.6);
  mesh(rbox(0.55, 0.25, 0.7, 0.06), '#d64933', 0, 0.25, 0, mower);
  for (const [x, z] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]]) { const w = cyl(0.1, 0.1, 0.06, '#222', x, 0.1, z, mower, 12); w.rotation.z = Math.PI / 2; }
  const hdl = group(mower, 0, 0.3, -0.3); for (const s of [-1, 1]) { const b = cyl(0.015, 0.015, 0.9, '#333', s * 0.2, 0.35, -0.2, hdl, 5); b.rotation.x = -0.5; } mesh(box(0.45, 0.03, 0.03), '#333', 0, 0.75, -0.43, hdl);
  hint(mower, 'Cortacésped · ¡a cortar el césped!'); mower.userData.onClick = () => cb.onSpot('lawn');
  const mowerHome = mower.position.clone();

  /* ---------- Casa ---------- */
  const house = group(root);
  mesh(new THREE.BoxGeometry(15.6, 0.08, 9.1), M('#ffffff', { map: floorTex, r: 0.55 }), 0, 0.0, 4.55, house);
  const tiles = tileTexture('#e9e6df', '#dcd8cf', 10); tiles.repeat.set(2.8, 1.2);
  mesh(new THREE.BoxGeometry(6.95, 0.09, 3.08), M('#ffffff', { map: tiles, r: 0.3 }), -4.33, 0.0, 7.56, house);
  const H = 2.6, LOW = 1.25, CUT = 0.38;
  wall(house, -7.8, 0, -4.42, 0, H); glassWall(house, -4.42, 1.04, 0, H, -1.56, 1.5); wall(house, 1.04, 0, 4.55, 0, H); glassWall(house, 4.55, 6.44, 0, H, 5.46, 1.2); wall(house, 6.44, 0, 7.8, 0, H);
  wall(house, -7.8, 0, -7.8, 9.1, H);
  wall(house, -7.8, 9.1, 0.0, 9.1, CUT); wall(house, 1.56, 9.1, 7.8, 9.1, CUT);
  wall(house, 7.8, 0, 7.8, 9.1, CUT);
  wall(house, 3.25, 0, 3.25, 4.49, LOW); wall(house, 3.25, 5.98, 3.25, 9.1, LOW);
  wall(house, -7.8, 6.02, -0.26, 6.02, LOW); wall(house, 1.69, 6.02, 3.25, 6.02, LOW);
  wall(house, -0.85, 6.02, -0.85, 7.28, LOW);
  const door = mesh(rbox(1.5, 2.1, 0.06, 0.02), '#8a5a3a', 0.05, 1.05, 9.6, house); door.rotation.y = 1.2;
  mesh(rbox(1.2, 0.03, 0.7, 0.01), '#b4844f', 0.78, 0.06, 10.0, root);

  // Cocina (franja oeste)
  const kitchen = group(house); hint(kitchen, 'Cocina · prepara algo rico para Alejandro'); kitchen.userData.onClick = () => cb.onSpot('hob');
  mesh(rbox(0.65, 0.9, 4.8, 0.03), '#f7f5f0', -7.35, 0.45, 3.05, kitchen); rect(-7.8, 0.2, -7.0, 5.5);
  mesh(rbox(0.7, 0.05, 4.85, 0.02), '#3b3f45', -7.35, 0.92, 3.05, kitchen);
  const fridge = group(kitchen); mesh(rbox(0.7, 2.1, 0.8, 0.04), '#d5d9dd', -7.35, 1.05, 0.65, fridge);
  hint(fridge, 'Nevera · picotear algo'); fridge.userData.onClick = () => cb.onSpot('fridge');
  mesh(box(0.02, 1.0, 0.04), '#9aa0a6', -6.99, 1.4, 0.9, kitchen);
  const hob = group(kitchen, -7.35, 0.955, 3.25);
  mesh(rbox(0.55, 0.02, 0.75, 0.01), '#111316', 0, 0, 0, hob);
  const burners = [];
  for (const [x, z] of [[0.1, -0.2], [-0.12, 0.05], [0.1, 0.25]]) { const b = mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 20), M('#ff5a2a', { e: '#ff3a00', ei: 0 }), x, 0.015, z, hob, false); b.rotation.x = Math.PI / 2; burners.push(b); }
  const pan = group(kitchen, -7.25, 0.98, 3.2); cyl(0.17, 0.15, 0.08, '#2a2d31', 0, 0.04, 0, pan); mesh(box(0.35, 0.03, 0.05), '#2a2d31', 0, 0.06, 0.3, pan).rotation.y = Math.PI / 2;
  mesh(rbox(0.5, 0.06, 0.4, 0.02), '#cfd4d8', -7.35, 0.95, 4.7, kitchen);
  mesh(rbox(0.4, 0.7, 4.8, 0.03), '#f7f5f0', -7.55, 2.0, 3.05, kitchen);
  mesh(rbox(0.75, 0.95, 3.2, 0.04), '#8a6a4e', -5.98, 0.475, 2.99, kitchen); rect(-6.4, 1.35, -5.55, 4.63);
  mesh(rbox(0.85, 0.05, 3.3, 0.02), '#f2efe8', -5.98, 0.97, 2.99, kitchen);
  for (const z of [1.9, 3.0, 4.1]) { cyl(0.18, 0.18, 0.06, '#c97b56', -5.2, 0.7, z, kitchen); cyl(0.03, 0.03, 0.68, '#2b2b2b', -5.2, 0.35, z, kitchen, 6); }
  oval('#d64933', -5.98, 1.06, 3.6, 0.09, 0.09, 0.09, kitchen); oval('#f2b743', -5.88, 1.05, 3.7, 0.08, 0.08, 0.08, kitchen);

  // Comedor
  const tbl = group(house, -2.99, 0, 3.6); rect(-4.0, 2.75, -1.98, 4.45);
  mesh(rbox(1.7, 0.06, 0.95, 0.03), '#a77b52', 0, 0.76, 0, tbl);
  for (const [x, z] of [[-0.75, -0.38], [0.75, -0.38], [-0.75, 0.38], [0.75, 0.38]]) cyl(0.03, 0.03, 0.74, '#2b2b2b', x, 0.37, z, tbl, 6);
  for (const [x, z, r] of [[-0.45, -0.75, 0], [0.45, -0.75, 0], [-0.45, 0.75, Math.PI], [0.45, 0.75, Math.PI]]) {
    const c = group(tbl, x, 0, z); c.rotation.y = r;
    mesh(rbox(0.45, 0.06, 0.45, 0.03), '#f2ece0', 0, 0.46, 0, c); mesh(rbox(0.45, 0.45, 0.05, 0.03), '#f2ece0', 0, 0.7, -0.21, c);
    for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) cyl(0.02, 0.02, 0.45, '#2b2b2b', a, 0.22, b, c, 5);
  }
  const lamp = oval(M('#fff2c4', { e: '#ffcf7a', ei: 0 }), -2.99, 2.15, 3.6, 0.28, 0.12, 0.28, house); lamp.userData.base = 1.6; engine.nightLights.push(lamp);
  cyl(0.008, 0.008, 0.5, '#333', -2.99, 2.4, 3.6, house, 4);
  plant(house, -4.9, 0.55, 1.1); circ(-4.9, 0.55, 0.3); plant(house, 0.6, 0.55, 0.9, '#3b3f45'); circ(0.6, 0.55, 0.3);

  // Salón: sofá curvo mirando a la TV (como en el dibujo)
  const living = group(house, 1.3, 0, 2.6); circ(1.15, 2.6, 0.95);
  mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.02, 40), '#e7dccb', 0, 0.06, 0, living, false);
  const arc = (ro, ri, a0, a1) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, a0, a1, false); s.absarc(0, 0, ri, a1, a0, true); return s; };
  const sofaG = group(living); hint(sofaG, 'Sofá · manda a Alejandro a jugar a la Play (le hace feliz)'); sofaG.userData.onClick = () => cb.onSpot('sofa');
  const seat = new THREE.ExtrudeGeometry(arc(1.1, 0.55, Math.PI * 0.55, Math.PI * 1.45), { depth: 0.42, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, curveSegments: 32 });
  seat.rotateX(-Math.PI / 2); mesh(seat, M('#c96f52', { r: 0.95 }), 0, 0.05, 0, sofaG);
  const back = new THREE.ExtrudeGeometry(arc(1.12, 0.9, Math.PI * 0.55, Math.PI * 1.45), { depth: 0.85, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, curveSegments: 32 });
  back.rotateX(-Math.PI / 2); mesh(back, M('#b85f45', { r: 0.95 }), 0, 0.05, 0, sofaG);
  for (const a of [0.8, 1.0, 1.2]) oval('#f2b743', Math.cos(a * Math.PI) * 0.88, 0.7, -Math.sin(a * Math.PI) * 0.88, 0.17, 0.17, 0.08, sofaG).rotation.y = Math.PI / 2 - a * Math.PI;
  cyl(0.32, 0.32, 0.05, '#3b3f45', 0.45, 0.38, 0, living); cyl(0.04, 0.12, 0.35, '#3b3f45', 0.45, 0.18, 0, living);
  // TV + PlayStation
  const tvG = group(house, 2.86, 0, 2.6); rect(2.6, 1.6, 3.25, 3.6); hint(tvG, 'Tele · la PlayStation de Alejandro'); tvG.userData.onClick = () => cb.onTV();
  mesh(rbox(0.4, 0.45, 1.8, 0.03), '#2d3136', 0, 0.225, 0, tvG);
  const tvScreen = mesh(rbox(0.05, 0.8, 1.45, 0.02), M('#0d1013', { e: '#3a6fd8', ei: 0.0, r: 0.2 }), -0.02, 1.0, 0, tvG);
  mesh(box(0.06, 0.06, 0.5), '#111', 0, 0.58, 0, tvG);
  mesh(rbox(0.3, 0.08, 0.38, 0.02), '#f4f4f4', 0, 0.49, 0.6, tvG);
  // Altavoz en la pared, al lado de la tele
  const spk = group(house, 3.0, 0, 4.05); rect(2.75, 3.75, 3.25, 4.35);
  mesh(rbox(0.32, 1.15, 0.5, 0.05), '#2d3136', 0, 0.6, 0, spk);
  const cones = []; for (const y of [0.4, 0.85]) { const c = mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.04, 20), '#111', -0.17, y, 0, spk); c.rotation.z = Math.PI / 2; cones.push(c); }
  const spkRing = mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 24), M('#ff4fa3', { e: '#ff4fa3', ei: 0 }), -0.18, 0.85, 0, spk, false); spkRing.rotation.y = Math.PI / 2;
  hint(spk, 'Altavoz · música latina: bachata, salsa y reguetón'); spk.userData.onClick = () => cb.onSpot('speaker');
  const fl = group(house, 2.5, 0, 5.0); cyl(0.12, 0.15, 0.04, '#222', 0, 0.02, 0, fl); cyl(0.015, 0.015, 1.5, '#222', 0, 0.77, 0, fl);
  const flb = oval(M('#fff4d6', { e: '#ffcf7a', ei: 0 }), 0, 1.6, 0, 0.17, 0.2, 0.17, fl); flb.userData.base = 1.8; engine.nightLights.push(flb);

  // Habitación
  const bed = group(house, 6.7, 0, 7.15); rect(5.65, 6.25, 7.8, 8.05); hint(bed, 'Cama · dormir o… noche romántica 🔥'); bed.userData.onClick = () => cb.onSpot('bed');
  mesh(rbox(2.0, 0.35, 1.8, 0.05), '#a77b52', 0, 0.2, 0, bed);
  mesh(rbox(1.9, 0.2, 1.7, 0.08), '#f7f5f0', 0, 0.45, 0, bed);
  mesh(rbox(1.35, 0.12, 1.76, 0.06), '#7a9cc6', -0.3, 0.56, 0, bed);
  mesh(rbox(0.12, 1.0, 1.8, 0.04), '#8a6a4e', 0.98, 0.6, 0, bed);
  for (const z of [-0.42, 0.42]) mesh(rbox(0.35, 0.14, 0.62, 0.06), '#ffffff', 0.7, 0.62, z, bed);
  for (const z of [-1.2, 1.2]) { mesh(rbox(0.45, 0.45, 0.45, 0.03), '#a77b52', 0.75, 0.23, z, bed); const bl = oval(M('#fff4d6', { e: '#ffcf7a', ei: 0 }), 0.75, 0.62, z, 0.11, 0.14, 0.11, bed); bl.userData.base = 1.4; engine.nightLights.push(bl); }
  mesh(rbox(0.6, 2.1, 1.8, 0.03), '#ece6dc', 3.65, 1.05, 7.6, house); rect(3.3, 6.7, 3.95, 8.5);
  const desk = group(house, 3.62, 0, 1.95); rect(3.3, 1.15, 3.95, 2.75); hint(desk, 'Escritorio · Alejandro teletrabaja y gana dinero'); desk.userData.onClick = () => cb.onSpot('desk');
  mesh(rbox(0.65, 0.05, 1.5, 0.02), '#f2efe8', 0, 0.74, 0, desk);
  for (const z of [-0.68, 0.68]) mesh(box(0.6, 0.72, 0.04), '#2d3136', 0, 0.36, z, desk);
  const mon = mesh(rbox(0.04, 0.45, 0.75, 0.02), M('#0d1013', { e: '#8fd0ff', ei: 0.0 }), -0.15, 1.12, 0, desk);
  mesh(box(0.04, 0.3, 0.05), '#2d3136', -0.15, 0.87, 0, desk);
  mesh(rbox(0.25, 0.015, 0.45, 0.005), '#cfd4d8', 0.15, 0.775, 0, desk);
  const chair = group(house, 4.35, 0, 1.95);
  cyl(0.26, 0.26, 0.08, '#2d3136', 0, 0.48, 0, chair); mesh(rbox(0.08, 0.55, 0.5, 0.04), '#2d3136', 0.25, 0.8, 0, chair); cyl(0.03, 0.03, 0.45, '#888', 0, 0.23, 0, chair, 6);
  plant(house, 7.2, 0.6, 0.9); circ(7.2, 0.6, 0.3);
  mesh(new THREE.BoxGeometry(2.8, 0.02, 1.9), '#d6cbbb', 5.6, 0.05, 4.0, house);
  // Baño: bañera, ducha, váter y lavabo
  const bath = group(house);
  mesh(rbox(1.7, 0.55, 0.8, 0.08), '#ffffff', -6.75, 0.3, 8.5, bath); mesh(rbox(1.5, 0.05, 0.6, 0.05), '#a8dcf0', -6.75, 0.55, 8.5, bath); rect(-7.8, 8.05, -5.85, 9.1);
  const shower = group(house, -4.6, 0, 6.85); hint(shower, 'Ducha · pegarse una ducha (con concierto)'); shower.userData.onClick = () => cb.onSpot('shower');
  mesh(rbox(1.2, 0.06, 1.2, 0.02), '#ffffff', 0, 0.06, 0, shower);
  for (const x of [-0.6, 0.6]) mesh(box(0.03, 2.0, 1.2), M('#cfe9f5', { t: 0.3 }), x, 1.03, 0, shower, false).userData.solid = false;
  rect(-5.25, 6.1, -5.15, 7.45); rect(-4.05, 6.1, -3.95, 7.45);
  cyl(0.015, 0.015, 2.1, '#cfd3d6', 0, 1.05, -0.55, shower, 6); cyl(0.12, 0.08, 0.04, '#cfd3d6', 0, 2.1, -0.4, shower, 14);
  mesh(rbox(0.4, 0.4, 0.55, 0.12), '#ffffff', -2.8, 0.22, 8.7, bath); rect(-3.05, 8.4, -2.55, 9.1);
  mesh(rbox(0.9, 0.5, 0.5, 0.03), '#a77b52', -1.9, 0.55, 6.35, bath); rect(-2.4, 6.05, -1.4, 6.65);
  mesh(rbox(0.5, 0.06, 0.38, 0.03), '#ffffff', -1.9, 0.82, 6.35, bath);
  mesh(rbox(0.8, 0.7, 0.03, 0.02), M('#dbe9f2', { m: 0.8, r: 0.05 }), -1.9, 1.5, 6.12, bath);
  plant(bath, -6.9, 6.5, 0.6);
  mesh(rbox(0.4, 0.85, 1.0, 0.03), '#ece6dc', 2.86, 0.43, 7.8, house); rect(2.6, 7.3, 3.25, 8.3);
  oval('#f2b743', 2.86, 0.95, 7.8, 0.12, 0.1, 0.12, house);

  // Luces de noche y luces rojas (noche romántica)
  for (const [x, y, z, i] of [[-1.3, 2.2, 3.9, 9], [5.5, 2.0, 4.7, 7], [0, 2.5, -4.6, 10]]) { const l = new THREE.PointLight('#ffcf8a', 0, 9, 1.6); l.position.set(x, y, z); l.userData.base = i; root.add(l); engine.nightLights.push(l); }
  const redLights = [[5.6, 2.0, 6.2], [7.2, 1.6, 8.4], [1.2, 2.0, 3.5]].map(([x, y, z]) => { const l = new THREE.PointLight('#ff2040', 0, 10, 1.4); l.position.set(x, y, z); root.add(l); return l; });

  // Exterior sur: entrada con Porsche
  mesh(new THREE.BoxGeometry(18.4, 0.05, 3.2), '#bdb6aa', 0, 0.0, 11.0, root);
  for (let x = -8.6; x < 9; x += 0.8) mesh(box(0.02, 0.055, 3.2), '#aaa397', x, 0.0, 11.0, root);
  const buzon = group(root, -1.6, 0, 9.9); circ(-1.6, 9.9, 0.25); cyl(0.04, 0.04, 1.0, '#2b2b2b', 0, 0.5, 0, buzon, 6); mesh(rbox(0.45, 0.32, 0.25, 0.04), '#2d3136', 0, 1.1, 0, buzon);
  mesh(new THREE.PlaneGeometry(0.42, 0.12), M('#fff', { map: textTexture('Safiye & Alejandro', { color: '#2d3136', bg: '#f3efe7', size: 70, w: 900, h: 220 }) }), 0, 1.12, 0.13, buzon, false);
  const porsche = makePorsche(cb.porscheColor, cb.gt3); porsche.position.set(4.55, 0.03, 11.05); porsche.rotation.y = Math.PI / 2; root.add(porsche); rect(2.3, 10.15, 6.8, 11.95);
  hint(porsche, 'Porsche 911 · viajar a las clínicas'); porsche.userData.onClick = () => cb.onPorsche();
  plant(root, -7.2, 11.2, 1.0, '#3b3f45'); plant(root, -5.6, 11.2, 0.8, '#3b3f45');

  /* ---------- Personajes ---------- */
  const mkExtras = () => ({
    controller: mesh(rbox(0.2, 0.06, 0.12, 0.03), '#f4f4f4', 0, 0, 0, null),
    ring: (() => { const r = mesh(new THREE.TorusGeometry(0.4, 0.13, 12, 28), '#ff7aa8', 0, 0, 0, null); r.rotation.x = Math.PI / 2; return r; })(),
    blanket: mesh(rbox(0.95, 1.15, 0.1, 0.04), '#7a9cc6', 0, 0, 0, null),
    can: (() => { const g = new THREE.Group(); cyl(0.09, 0.1, 0.18, '#3b9c98', 0, 0, 0, g); const sp = cyl(0.015, 0.02, 0.25, '#3b9c98', 0.15, 0.05, 0, g, 6); sp.rotation.z = -1; return g; })(),
  });
  const ale = makePerson(ALEJANDRO); root.add(ale.root); ale.x = mkExtras(); ale.name = 'ale';
  hint(ale.root, 'Alejandro · masaje, comida y más'); ale.root.userData.onClick = () => cb.onAle();
  const saf = makePerson(SAFIYE); root.add(saf.root); saf.x = mkExtras(); saf.name = 'safi';
  saf.root.position.set(NODES.salon[0], 0, NODES.salon[1]);
  hint(saf.root, 'Safiye'); saf.root.userData.onClick = () => cb.onSafiye && cb.onSafiye();

  const lie = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));
  /** Coloca a una persona en una pose («free» = de pie donde esté). */
  function pose(p, a, opt = {}) {
    const r = p.root; r.quaternion.identity(); p.sit(false); p.armPose = false; p.dance = false;
    p.arms.forEach(x => x.rotation.set(0, 0, 0));
    Object.values(p.x).forEach(o => o.removeFromParent());
    p.pose = a;
    if (a === 'play') { r.position.set(0.55, -0.02, 2.6); r.rotation.y = Math.PI / 2; p.sit(true); p.armPose = true; p.arms.forEach(x => (x.rotation.x = -1.1)); r.add(p.x.controller); p.x.controller.position.set(0, 0.84, 0.42); }
    else if (a === 'trabajo') { r.position.set(4.4, -0.02, 1.95); r.rotation.y = -Math.PI / 2; p.sit(true); p.armPose = true; p.arms.forEach(x => (x.rotation.x = -1.2)); }
    else if (a === 'barbacoa') { r.position.set(-3.0, 0, -3.75); r.rotation.y = Math.PI; p.armPose = true; p.arms[1].rotation.x = -1.0; }
    else if (a === 'piscina') { r.position.set(3.64 + (opt.dx || 0), -0.2, -4.36); r.rotation.y = 0.6; p.armPose = true; p.arms.forEach((x, i) => (x.rotation.z = i ? 1.2 : -1.2)); r.add(p.x.ring); p.x.ring.position.set(0, 0.62, 0); }
    else if (a === 'dormir') { r.quaternion.setFromRotationMatrix(lie); r.position.set(5.85, 0.72, opt.z ?? 7.15); if (!opt.noBlanket) { r.add(p.x.blanket); p.x.blanket.position.set(0, 0.55, 0.19); } }
    else if (a === 'ducha') { r.position.set(-4.6, 0.06, 6.85); r.rotation.y = 0; p.armPose = true; p.arms.forEach(x => (x.rotation.x = -2.6)); }
  }
  let activity = null;
  function setActivity(a) {
    if (a === activity || ale.busy) return; activity = a;
    pose(ale, a);
    if (cb.onActivity) cb.onActivity(a);
  }
  /** Saca a la persona de su pose (de pie junto al sitio) para poder moverla. */
  function standUp(p) {
    if (p.pose && p.pose !== 'free') {
      const node = ALE_VISIT[p.pose];
      pose(p, 'free');
      if (node) p.root.position.set(NODES[node][0], 0, NODES[node][1]);
    }
    if (p === ale) activity = 'free';
  }
  function goTo(p, nodeId) {
    standUp(p);
    const from = nearestNode(NODES, p.root.position.x, p.root.position.z);
    const pts = [NODES[from], ...navPath(NODES, EDGES, from, nodeId)];
    return walkPath(engine, p, pts, 3.4);
  }
  const visitPoint = () => NODES[ALE_VISIT[activity] || 'salon'];
  async function goToAle() {
    const d = saf.root.position.distanceTo(ale.root.position);
    if (d > 1.6) { if (ALE_VISIT[activity]) await goTo(saf, ALE_VISIT[activity]); else { await goTo(saf, nearestNode(NODES, ale.root.position.x, ale.root.position.z)); await walkPath(engine, saf, [[ale.root.position.x - 0.8, ale.root.position.z]], 3); } }
    faceTo(saf, ale.root.position.x, ale.root.position.z);
  }

  /* ---------- Movimiento libre con colisiones ---------- */
  function blocked(x, z, r = 0.22) {
    if (x < -9.0 || x > 9.0 || z < -8.7 || z > 12.3) return true;
    for (const [a, b, c, d] of solids) if (x > a - r && x < c + r && z > b - r && z < d + r) return true;
    for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr + r) return true;
    return false;
  }
  function move(p, dx, dz, dt) {
    if (p.busy) return;
    const len = Math.hypot(dx, dz);
    if (!len) { p.keyMove = false; return; }
    standUp(p);
    const sp = 3.6 * dt, nx = dx / len * sp, nz = dz / len * sp, pos = p.root.position;
    const stuck = blocked(pos.x, pos.z);
    if (stuck || !blocked(pos.x + nx, pos.z + nz)) { pos.x += nx; pos.z += nz; }
    else if (!blocked(pos.x + nx, pos.z)) pos.x += nx;
    else if (!blocked(pos.x, pos.z + nz)) pos.z += nz;
    pos.y = 0;
    const want = Math.atan2(dx, dz); let diff = want - p.root.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    p.root.rotation.y += diff * Math.min(1, dt * 14);
    p.keyMove = true;
  }
  function nearSpot(p, who) {
    let best = null, bd = 1.6;
    for (const h of HOTSPOTS) {
      if (!h[who].length) continue;
      const [x, z] = NODES[h.node], d = Math.hypot(p.root.position.x - x, p.root.position.z - z);
      if (d < bd) { bd = d; best = h; }
    }
    if (who === 'safi') {
      const d = ale.root.position.distanceTo(saf.root.position);
      if (d < 1.7 && (!best || d < bd)) return { id: 'ale', emoji: '🧔', name: 'Alejandro', safi: ['masaje', 'cocinar'], ale: [] };
    }
    return best;
  }

  /* ---------- Animaciones de acciones ---------- */
  const wait = (s) => new Promise(r => { let k2 = 0; const f = (dt) => { k2 += dt; if (k2 >= s) { engine.updaters.delete(f); r(); } }; engine.updaters.add(f); setTimeout(() => { if (engine.updaters.has(f)) { engine.updaters.delete(f); r(); } }, s * 1000 + 3000); });
  let drops = false, music = false, romanceOn = false, steamAt = null, grillOn = false;
  async function doTemp(p, act) {
    p.busy = true;
    if (act === 'ducha') { pose(p, 'ducha'); drops = true; await wait(5); drops = false; pose(p, 'free'); p.root.position.set(...xz(NODES.shower)); }
    else if (act === 'cesped') {
      p.root.add(mower); mower.position.set(0, 0, 0.75); mower.rotation.set(0, 0, 0);
      const pts = []; for (let i = 0; i < 3; i++) { const z = -1.8 - i * 1.4; pts.push(i % 2 ? [1.6, z] : [-6.4, z], i % 2 ? [-6.4, z] : [1.6, z]); }
      await walkPath(engine, p, pts, 3.0);
      root.add(mower); mower.position.copy(mowerHome); mower.rotation.set(0, 0, 0); stripes.visible = true;
    }
    else if (act === 'macetas') {
      p.armPose = true; p.arms[1].rotation.x = -1.3; p.root.add(p.x.can); p.x.can.position.set(-0.32, 0.75, 0.45);
      faceTo(p, p.root.position.x, -9);
      await wait(3.5); pots.forEach(pt => pt.scale.multiplyScalar(1.08)); p.x.can.removeFromParent(); p.armPose = false;
    }
    else if (act === 'nevera') { faceTo(p, -8, p.root.position.z); await wait(2); }
    else if (act === 'barbacoa') { pose(p, 'barbacoa'); grillOn = true; await wait(6); grillOn = false; pose(p, 'free'); p.root.position.set(...xz(NODES.bbqVisit)); }
    else if (act === 'piscina') { pose(p, 'piscina', { dx: -0.5 }); await wait(6); pose(p, 'free'); p.root.position.set(...xz(NODES.pool)); }
    else if (act === 'dormir') { pose(p, 'dormir', { z: 7.45 }); await wait(6); pose(p, 'free'); p.root.position.set(...xz(NODES.bedside)); }
    p.busy = false;
  }
  async function dance() {
    standUp(ale); standUp(saf); ale.busy = saf.busy = true;
    await Promise.all([walkPath(engine, saf, [[-0.2, 4.6]], 3.2), walkPath(engine, ale, [[0.9, 4.6]], 3.2)]);
    faceTo(saf, 0.9, 4.6); faceTo(ale, -0.2, 4.6); saf.dance = ale.dance = true;
    await wait(9); saf.dance = ale.dance = false; ale.busy = saf.busy = false; activity = 'free';
  }
  async function romance() {
    standUp(ale); standUp(saf);
    await Promise.all([goTo(saf, 'bedside'), goTo(ale, 'bedroom')]);
    ale.busy = saf.busy = true;
    pose(saf, 'dormir', { z: 7.55, noBlanket: true }); pose(ale, 'dormir', { z: 6.8, noBlanket: true });
    const sheet = mesh(rbox(1.3, 0.24, 1.72, 0.08), '#b0203a', 6.45, 0.92, 7.15, root); romanceSheet = sheet; romanceOn = true;
    await wait(13);
    sheet.removeFromParent(); romanceOn = false;
    pose(saf, 'free'); saf.root.position.set(...xz(NODES.bedside)); pose(ale, 'free'); ale.root.position.set(4.7, 0, 6.6);
    ale.busy = saf.busy = false; activity = 'free';
  }

  // humo / vapor / gotas
  const puffs = []; const puffMat = M('#e8e8e8', { t: 0.5 }), dropMat = M('#8fd3ff', { t: 0.7 });
  for (let i = 0; i < 16; i++) { const p = oval(puffMat, 0, -10, 0, 0.12, 0.12, 0.12, root); p.castShadow = false; p.userData.life = i / 16; puffs.push(p); }
  let romanceSheet = null;
  engine.updaters.add((dt, t) => {
    for (const p of [saf, ale]) {
      p.animate(t, p.moving || p.keyMove);
      if (p.dance) { p.body.position.y = 0.62 + Math.abs(Math.sin(t * 8)) * 0.08; p.head.position.y = p.body.position.y + 0.74; p.root.rotation.y += Math.sin(t * 2) * 0.03; p.arms.forEach((a, i) => (a.rotation.z = Math.sin(t * 8 + i * Math.PI) * 0.9)); p.legs.forEach((l, i) => (l.rotation.x = Math.sin(t * 8 + i * Math.PI) * 0.3)); }
    }
    if (activity === 'piscina') ale.root.position.y = -0.2 + Math.sin(t * 1.5) * 0.03;
    tvScreen.material.emissiveIntensity = activity === 'play' ? 0.7 + Math.sin(t * 7) * 0.15 + Math.sin(t * 13) * 0.1 : 0.05;
    tvScreen.material.emissive.setHSL((t * 0.05) % 1, 0.6, 0.5);
    mon.material.emissiveIntensity = activity === 'trabajo' ? 0.8 : 0.05;
    grillGlow.material.emissiveIntensity = activity === 'barbacoa' || grillOn ? 1.2 + Math.sin(t * 9) * 0.3 : 0;
    waterMat.color.setHSL(0.55, 0.65, 0.68 + Math.sin(t * 2) * 0.03);
    duck.position.x = 0.6 + Math.sin(t * 0.6) * 0.2; duck.rotation.y = t * 0.3;
    spkRing.material.emissiveIntensity = music ? 1.2 + Math.sin(t * 13) * 0.6 : 0;
    cones.forEach((c, i) => c.scale.setScalar(music ? 1 + Math.abs(Math.sin(t * 8.5 + i)) * 0.15 : 1));
    redLights.forEach((l, i) => (l.intensity = romanceOn ? 14 + Math.sin(t * 3 + i) * 5 : 0));
    if (romanceOn && romanceSheet) romanceSheet.scale.y = 1 + Math.abs(Math.sin(t * 7)) * 0.35;
    const src = steamAt || (activity === 'barbacoa' || grillOn ? [-3.0, 1.0, -4.6] : null);
    puffs.forEach(p => {
      p.userData.life += dt * (drops ? 1.6 : 0.5);
      if (p.userData.life > 1) p.userData.life -= 1;
      const L = p.userData.life;
      if (drops) { p.visible = true; p.material = dropMat; p.position.set(-4.6 + Math.sin(p.id * 3.1) * 0.25, 2.05 - L * 2, 6.85 + Math.cos(p.id * 2.3) * 0.25); p.scale.set(0.03, 0.08, 0.03); return; }
      p.material = puffMat;
      if (!src) { p.visible = false; return; }
      p.visible = true;
      p.position.set(src[0] + Math.sin(L * 9 + p.id) * 0.15, src[1] + L * 1.6, src[2] + Math.cos(L * 7 + p.id) * 0.15);
      p.scale.setScalar(0.08 + L * 0.25);
    });
    burners.forEach(b => (b.material.emissiveIntensity = steamAt ? 1.5 : 0));
  });

  engine.frame([0, 0.4, 2.0], 35, 0.92, 0.42, { pan: [-8, 8, -8, 11] });
  return {
    ale, saf, porsche, NODES, HOTSPOTS, setActivity, goTo, goToAle, visitPoint, standUp, move, nearSpot, doTemp, dance, romance, pose,
    get activity() { return activity; },
    cookSteam(on) { steamAt = on ? [-7.25, 1.1, 3.2] : null; },
    showSafiye(v) { saf.root.visible = v; },
    setMusic(on) { music = on; },
    get romanceOn() { return romanceOn; },
    potsScale: () => pots[0].scale.x / 0.7,
  };
}
function xz(p) { return [p[0], 0, p[1]]; }
