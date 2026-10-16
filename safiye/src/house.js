// Casa de Stuttgart según el plano dibujado a mano por David:
// jardín al norte; cocina (franja oeste), salón-comedor con gran cristalera,
// habitación al este con cristalera pequeña, baño al suroeste y recibidor.
import * as THREE from 'three';
import { M, mesh, rbox, box, oval, cyl, group, plant, tree, textTexture, plankTexture, tileTexture, makePerson, makePorsche, SAFIYE, ALEJANDRO } from './models.js';
import { walkPath, faceTo, navPath, nearestNode } from './engine.js';

const WALL = '#f3efe7';
const NODES = {
  salon: [-1.0, 3.6], sofaBack: [-0.65, 2.0], gIn: [-1.2, 0.5], gOut: [-1.2, -0.7], garden: [0, -2.0], bbq: [-2.3, -2.7], pool: [1.25, -3.3],
  kEntry: [-4.0, 4.15], kCorner: [-5.15, 4.15], kitchen: [-5.15, 2.4], hallTop: [0.55, 4.3], hall: [0.55, 5.8], door: [0.6, 7.35], drive: [2.4, 7.45],
  bedDoor: [2.5, 4.0], bedroom: [3.6, 4.1], desk: [4.25, 1.5], bgIn: [4.2, 0.55], bgOut: [4.2, -0.7], bathDoor: [-0.65, 6.3], bath: [-2.6, 6.0],
};
const EDGES = [['salon', 'sofaBack'], ['salon', 'gIn'], ['sofaBack', 'gIn'], ['gIn', 'gOut'], ['gOut', 'garden'], ['garden', 'bbq'], ['gOut', 'bbq'], ['garden', 'pool'],
  ['salon', 'kEntry'], ['kEntry', 'kCorner'], ['kCorner', 'kitchen'], ['salon', 'hallTop'], ['hallTop', 'hall'], ['hall', 'door'], ['door', 'drive'],
  ['hallTop', 'bedDoor'], ['salon', 'bedDoor'], ['bedDoor', 'bedroom'], ['bedroom', 'desk'], ['desk', 'bgIn'], ['bedroom', 'bgIn'], ['bgIn', 'bgOut'], ['bgOut', 'garden'], ['bgOut', 'pool'],
  ['hall', 'bathDoor'], ['bathDoor', 'bath']];

// Dónde está Alejandro y desde dónde le atiende Safiye
const SPOTS = {
  play: { visit: 'sofaBack' }, trabajo: { visit: 'desk' }, barbacoa: { visit: 'bbq' }, piscina: { visit: 'pool' }, dormir: { visit: 'bedroom' },
};

function wall(p, x1, z1, x2, z2, h, color = WALL, t = 0.16) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const m = mesh(box(len + t, h, t), color, (x1 + x2) / 2, h / 2, (z1 + z2) / 2, p);
  m.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  return m;
}
function glassWall(p, x1, x2, z, h) {
  const w = x2 - x1, cx = (x1 + x2) / 2;
  mesh(box(w, h - 0.08, 0.04), M('#bfe3f2', { t: 0.22, r: 0.05, m: 0.1 }), cx, h / 2, z, p, false).userData.solid = false;
  const fr = '#2d3136';
  mesh(box(w + 0.1, 0.08, 0.1), fr, cx, h - 0.04, z, p); mesh(box(w + 0.1, 0.05, 0.1), fr, cx, 0.03, z, p);
  const n = Math.max(2, Math.round(w / 1.4));
  for (let i = 0; i <= n; i++) mesh(box(0.06, h, 0.1), fr, x1 + (w * i) / n, h / 2, z, p);
}

export function buildHouse(engine, cb) {
  const W = engine.world, root = group(W);
  const floorTex = plankTexture(); floorTex.repeat.set(3, 2); floorTex.rotation = Math.PI / 2;
  // Maqueta: zócalo de pizarra
  mesh(rbox(15, 0.7, 17.4, 0.12), '#2c3843', 0, -0.36, 1.4, root);
  const plaque = mesh(new THREE.PlaneGeometry(6, 0.42), M('#ffffff', { map: textTexture('STUTTGART · ZUHAUSE', { color: '#c9d3dc', size: 92, spacing: '18px', w: 1600, h: 140 }), t: 0.9 }), 0, -0.36, 10.11, root, false);
  // jardín
  const grass = mesh(new THREE.BoxGeometry(14, 0.06, 7.2), '#7fae5f', 0, 0.0, -3.5, root); grass.receiveShadow = true;
  for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.04, 8), '#d8d1c4', -1.2 + Math.sin(i) * 0.15, 0.04, -0.9 - i * 0.62, root);
  // seto y valla
  mesh(rbox(14, 0.9, 0.5, 0.2), '#4f8248', 0, 0.45, -6.9, root);
  mesh(rbox(0.5, 0.9, 7, 0.2), '#4f8248', -6.75, 0.45, -3.5, root);
  mesh(rbox(0.5, 0.9, 7, 0.2), '#4f8248', 6.75, 0.45, -3.5, root);
  tree(root, -5.2, -5.6, 1.15); tree(root, 5.3, -5.7, 0.95);
  for (let x = -5.6; x <= 5.6; x += 2.8) { plant(root, x, -6.3, 0.7, '#c97b56'); }
  // guirnalda de luces
  for (let i = 0; i < 12; i++) {
    const b = oval(M('#fff2c4', { e: '#ffd27a', ei: 0 }), -5 + i * 0.9, 2.1 - Math.sin((i % 6) / 5 * Math.PI) * 0.25, -6.6, 0.05, 0.07, 0.05, root);
    b.userData.base = 2.2; engine.nightLights.push(b);
  }
  for (const x of [-5.3, 5.3]) cyl(0.03, 0.03, 2.2, '#3a3a3a', x, 1.1, -6.6, root, 6);
  // barbacoa (kettle)
  const bbq = group(root, -2.3, 0, -3.55);
  oval('#1f2326', 0, 0.82, 0, 0.42, 0.3, 0.42, bbq);
  mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.04, 24), '#555', 0, 0.86, 0, bbq);
  for (let i = 0; i < 3; i++) { const l = cyl(0.025, 0.025, 0.8, '#2b2b2b', Math.cos(i * 2.1) * 0.28, 0.4, Math.sin(i * 2.1) * 0.28, bbq, 6); l.rotation.z = Math.cos(i * 2.1) * 0.2; l.rotation.x = -Math.sin(i * 2.1) * 0.2; }
  const grillGlow = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 24), M('#ff6a2a', { e: '#ff4d00', ei: 0 }), 0, 0.88, 0, bbq, false);
  mesh(rbox(1.2, 0.08, 0.6, 0.03), '#a77b52', 1.05, 0.8, 0.0, bbq); cyl(0.03, 0.03, 0.8, '#555', 1.05, 0.4, 0, bbq, 6);
  // piscina de plástico
  const pool = group(root, 2.8, 0, -3.35);
  const ring = mesh(new THREE.TorusGeometry(1.25, 0.2, 14, 40), '#3fa7e0', 0, 0.2, 0, pool); ring.rotation.x = Math.PI / 2;
  const ring2 = mesh(new THREE.TorusGeometry(1.25, 0.17, 14, 40), '#f2f2f2', 0, 0.52, 0, pool); ring2.rotation.x = Math.PI / 2;
  const waterMat = new THREE.MeshStandardMaterial({ color: '#7fd3f0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 });
  const water = mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 40), waterMat, 0, 0.3, 0, pool, false);
  const duck = group(pool, 0.6, 0.6, 0.4);
  oval('#ffd23f', 0, 0, 0, 0.14, 0.11, 0.18, duck); oval('#ffd23f', 0, 0.13, 0.1, 0.09, 0.09, 0.09, duck); oval('#ff8c1a', 0, 0.12, 0.2, 0.05, 0.025, 0.05, duck);
  // tumbonas
  for (const x of [4.6, 5.6]) { const t = group(root, x, 0, -1.6); mesh(rbox(0.7, 0.12, 1.8, 0.05), '#f2ece0', 0, 0.3, 0, t); const b = mesh(rbox(0.7, 0.1, 0.7, 0.05), '#f2ece0', 0, 0.55, -0.85, t); b.rotation.x = -0.9; for (const s of [-1, 1]) mesh(box(0.05, 0.3, 1.6), '#b98f66', s * 0.3, 0.15, 0, t); }
  oval('#f2b743', 5.1, 0.02, -2.9, 0.6, 0.01, 0.6, root);

  /* ---------- Casa ---------- */
  const house = group(root);
  const floor = mesh(new THREE.BoxGeometry(12, 0.08, 7), M('#ffffff', { map: floorTex, r: 0.55 }), 0, 0.0, 3.5, house);
  const tiles = tileTexture('#e9e6df', '#dcd8cf', 10); tiles.repeat.set(2.2, 1);
  mesh(new THREE.BoxGeometry(5.35, 0.09, 2.37), M('#ffffff', { map: tiles, r: 0.3 }), -3.33, 0.0, 5.82, house);
  const H = 2.6, LOW = 1.25, CUT = 0.38;
  // norte (cristaleras)
  wall(house, -6, 0, -3.4, 0, H); glassWall(house, -3.4, 0.8, 0, H); wall(house, 0.8, 0, 3.5, 0, H); glassWall(house, 3.5, 4.95, 0, H); wall(house, 4.95, 0, 6, 0, H);
  wall(house, -6, 0, -6, 7, H); // oeste
  wall(house, -6, 7, 0.0, 7, CUT); wall(house, 1.2, 7, 6, 7, CUT); // sur (cortado) con puerta
  wall(house, 6, 0, 6, 7, CUT); // este (cortado)
  // tabiques
  wall(house, 2.5, 0, 2.5, 3.45, LOW); wall(house, 2.5, 4.6, 2.5, 7, LOW);
  wall(house, -6, 4.63, -0.2, 4.63, LOW); wall(house, 1.3, 4.63, 2.5, 4.63, LOW);
  wall(house, -0.65, 4.63, -0.65, 5.6, LOW);
  // puerta principal (abierta)
  const door = mesh(rbox(1.15, 2.1, 0.06, 0.02), '#8a5a3a', 0.05, 1.05, 7.5, house); door.rotation.y = 1.2;
  // felpudo
  mesh(rbox(1.0, 0.03, 0.6, 0.01), '#b4844f', 0.6, 0.06, 7.75, root);

  // Cocina (franja oeste)
  const kitchen = group(house); kitchen.userData.onClick = (pt) => cb.onKitchen(pt);
  mesh(rbox(0.65, 0.9, 3.7, 0.03), '#f7f5f0', -5.6, 0.45, 2.35, kitchen);
  mesh(rbox(0.7, 0.05, 3.75, 0.02), '#3b3f45', -5.6, 0.92, 2.35, kitchen);
  mesh(rbox(0.7, 2.1, 0.8, 0.04), '#d5d9dd', -5.6, 1.05, 0.5, kitchen); // nevera
  mesh(box(0.02, 1.0, 0.04), '#9aa0a6', -5.24, 1.4, 0.75, kitchen);
  const hob = group(kitchen, -5.6, 0.955, 2.5);
  mesh(rbox(0.55, 0.02, 0.75, 0.01), '#111316', 0, 0, 0, hob);
  const burners = [];
  for (const [x, z] of [[0.1, -0.2], [-0.12, 0.05], [0.1, 0.25]]) { const b = mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 20), M('#ff5a2a', { e: '#ff3a00', ei: 0 }), x, 0.015, z, hob, false); b.rotation.x = Math.PI / 2; burners.push(b); }
  const pan = group(kitchen, -5.5, 0.98, 2.45); cyl(0.17, 0.15, 0.08, '#2a2d31', 0, 0.04, 0, pan); const handle = mesh(box(0.35, 0.03, 0.05), '#2a2d31', 0, 0.06, 0.3, pan); handle.rotation.y = Math.PI / 2;
  mesh(rbox(0.5, 0.06, 0.4, 0.02), '#cfd4d8', -5.6, 0.95, 3.6, kitchen); // fregadero
  mesh(rbox(0.4, 0.7, 3.7, 0.03), '#f7f5f0', -5.78, 2.0, 2.35, kitchen); // altillos
  // isla
  mesh(rbox(0.75, 0.95, 2.6, 0.04), '#8a6a4e', -4.6, 0.475, 2.3, kitchen);
  mesh(rbox(0.85, 0.05, 2.7, 0.02), '#f2efe8', -4.6, 0.97, 2.3, kitchen);
  for (const z of [1.5, 2.3, 3.1]) { cyl(0.18, 0.18, 0.06, '#c97b56', -3.95, 0.7, z, kitchen); cyl(0.03, 0.03, 0.68, '#2b2b2b', -3.95, 0.35, z, kitchen, 6); }
  oval('#d64933', -4.6, 1.06, 2.9, 0.09, 0.09, 0.09, kitchen); oval('#f2b743', -4.5, 1.05, 3.0, 0.08, 0.08, 0.08, kitchen);

  // Comedor
  const tbl = group(house, -2.3, 0, 2.95);
  mesh(rbox(1.7, 0.06, 0.95, 0.03), '#a77b52', 0, 0.76, 0, tbl);
  for (const [x, z] of [[-0.75, -0.38], [0.75, -0.38], [-0.75, 0.38], [0.75, 0.38]]) cyl(0.03, 0.03, 0.74, '#2b2b2b', x, 0.37, z, tbl, 6);
  for (const [x, z, r] of [[-0.45, -0.75, 0], [0.45, -0.75, 0], [-0.45, 0.75, Math.PI], [0.45, 0.75, Math.PI]]) {
    const c = group(tbl, x, 0, z); c.rotation.y = r;
    mesh(rbox(0.45, 0.06, 0.45, 0.03), '#f2ece0', 0, 0.46, 0, c); mesh(rbox(0.45, 0.45, 0.05, 0.03), '#f2ece0', 0, 0.7, -0.21, c);
    for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) cyl(0.02, 0.02, 0.45, '#2b2b2b', a, 0.22, b, c, 5);
  }
  const lamp = oval(M('#fff2c4', { e: '#ffcf7a', ei: 0 }), -2.3, 2.15, 2.95, 0.28, 0.12, 0.28, house); lamp.userData.base = 1.6; engine.nightLights.push(lamp);
  cyl(0.008, 0.008, 0.5, '#333', -2.3, 2.4, 2.95, house, 4);
  plant(house, -3.6, 0.45, 1.1); plant(house, 0.45, 0.45, 0.9, '#3b3f45');

  // Salón: sofá curvo mirando a la TV (como en el dibujo)
  const living = group(house, 1.0, 0, 2.0);
  const rug = mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.02, 40), '#e7dccb', 0, 0.06, 0, living, false);
  const arc = (ro, ri, a0, a1) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, a0, a1, false); s.absarc(0, 0, ri, a1, a0, true); return s; };
  const sofaG = group(living); sofaG.userData.onClick = (pt) => cb.onAleSpot && cb.onAleSpot('play', pt);
  const seat = new THREE.ExtrudeGeometry(arc(1.1, 0.55, Math.PI * 0.55, Math.PI * 1.45), { depth: 0.42, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, curveSegments: 32 });
  seat.rotateX(-Math.PI / 2); mesh(seat, M('#c96f52', { r: 0.95 }), 0, 0.05, 0, sofaG);
  const back = new THREE.ExtrudeGeometry(arc(1.12, 0.9, Math.PI * 0.55, Math.PI * 1.45), { depth: 0.85, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, curveSegments: 32 });
  back.rotateX(-Math.PI / 2); mesh(back, M('#b85f45', { r: 0.95 }), 0, 0.05, 0, sofaG);
  for (const a of [0.8, 1.0, 1.2]) oval('#f2b743', Math.cos(a * Math.PI) * 0.88, 0.7, -Math.sin(a * Math.PI) * 0.88, 0.17, 0.17, 0.08, sofaG).rotation.y = Math.PI / 2 - a * Math.PI;
  cyl(0.32, 0.32, 0.05, '#3b3f45', 0.35, 0.38, 0, living); cyl(0.04, 0.12, 0.35, '#3b3f45', 0.35, 0.18, 0, living);
  // TV + PlayStation
  const tvG = group(house, 2.2, 0, 2.0); tvG.userData.onClick = (pt) => cb.onTV(pt);
  mesh(rbox(0.4, 0.45, 1.8, 0.03), '#2d3136', 0, 0.225, 0, tvG);
  const tvScreen = mesh(rbox(0.05, 0.8, 1.45, 0.02), M('#0d1013', { e: '#3a6fd8', ei: 0.0, r: 0.2 }), -0.02, 1.0, 0, tvG);
  mesh(box(0.06, 0.06, 0.5), '#111', 0, 0.58, 0, tvG);
  mesh(rbox(0.3, 0.08, 0.38, 0.02), '#f4f4f4', 0, 0.49, 0.6, tvG); // consola
  // Alfombra salón y lámpara de pie
  const fl = group(house, 1.9, 0, 3.7); cyl(0.12, 0.15, 0.04, '#222', 0, 0.02, 0, fl); cyl(0.015, 0.015, 1.5, '#222', 0, 0.77, 0, fl);
  const flb = oval(M('#fff4d6', { e: '#ffcf7a', ei: 0 }), 0, 1.6, 0, 0.17, 0.2, 0.17, fl); flb.userData.base = 1.8; engine.nightLights.push(flb);

  // Habitación
  const bed = group(house, 4.95, 0, 5.5); bed.userData.onClick = (pt) => cb.onAleSpot && cb.onAleSpot('dormir', pt);
  mesh(rbox(2.0, 0.35, 1.7, 0.05), '#a77b52', 0, 0.2, 0, bed);
  mesh(rbox(1.9, 0.2, 1.6, 0.08), '#f7f5f0', 0, 0.45, 0, bed);
  const duvet = mesh(rbox(1.35, 0.12, 1.66, 0.06), '#7a9cc6', -0.3, 0.56, 0, bed);
  mesh(rbox(0.12, 1.0, 1.7, 0.04), '#8a6a4e', 0.98, 0.6, 0, bed);
  for (const z of [-0.4, 0.4]) mesh(rbox(0.35, 0.14, 0.6, 0.06), '#ffffff', 0.7, 0.62, z, bed);
  for (const z of [-1.15, 1.15]) { mesh(rbox(0.45, 0.45, 0.45, 0.03), '#a77b52', 0.75, 0.23, z, bed); const bl = oval(M('#fff4d6', { e: '#ffcf7a', ei: 0 }), 0.75, 0.62, z, 0.11, 0.14, 0.11, bed); bl.userData.base = 1.4; engine.nightLights.push(bl); }
  mesh(rbox(0.6, 2.1, 1.8, 0.03), '#ece6dc', 2.9, 1.05, 5.75, house); // armario
  // escritorio de teletrabajo
  const desk = group(house, 2.9, 0, 1.5); desk.userData.onClick = (pt) => cb.onAleSpot && cb.onAleSpot('trabajo', pt);
  mesh(rbox(0.65, 0.05, 1.5, 0.02), '#f2efe8', 0, 0.74, 0, desk);
  for (const z of [-0.68, 0.68]) mesh(box(0.6, 0.72, 0.04), '#2d3136', 0, 0.36, z, desk);
  const mon = mesh(rbox(0.04, 0.45, 0.75, 0.02), M('#0d1013', { e: '#8fd0ff', ei: 0.0 }), -0.15, 1.12, 0, desk);
  mesh(box(0.04, 0.3, 0.05), '#2d3136', -0.15, 0.87, 0, desk);
  mesh(rbox(0.25, 0.015, 0.45, 0.005), '#cfd4d8', 0.15, 0.775, 0, desk);
  const chair = group(house, 3.6, 0, 1.5);
  cyl(0.26, 0.26, 0.08, '#2d3136', 0, 0.48, 0, chair); mesh(rbox(0.08, 0.55, 0.5, 0.04), '#2d3136', 0.25, 0.8, 0, chair); cyl(0.03, 0.03, 0.45, '#888', 0, 0.23, 0, chair, 6);
  plant(house, 5.5, 0.5, 0.9);
  mesh(new THREE.BoxGeometry(2.4, 0.02, 1.6), '#d6cbbb', 4.4, 0.05, 3.0, house);
  // Baño
  const bath = group(house);
  mesh(rbox(1.7, 0.55, 0.8, 0.08), '#ffffff', -5.05, 0.3, 6.5, bath);
  mesh(rbox(1.5, 0.05, 0.6, 0.05), '#a8dcf0', -5.05, 0.55, 6.5, bath);
  mesh(rbox(0.4, 0.4, 0.55, 0.12), '#ffffff', -3.1, 0.22, 6.65, bath);
  mesh(rbox(0.9, 0.5, 0.5, 0.03), '#a77b52', -1.8, 0.55, 4.95, bath);
  mesh(rbox(0.5, 0.06, 0.38, 0.03), '#ffffff', -1.8, 0.82, 4.95, bath);
  mesh(rbox(0.8, 0.7, 0.03, 0.02), M('#dbe9f2', { m: 0.8, r: 0.05 }), -1.8, 1.5, 4.72, bath);
  plant(bath, -4.0, 5.1, 0.6);
  // Recibidor
  mesh(rbox(0.4, 0.85, 1.0, 0.03), '#ece6dc', 2.2, 0.43, 6.0, house);
  oval('#f2b743', 2.2, 0.95, 6.0, 0.12, 0.1, 0.12, house);

  // Luces de noche
  for (const [x, y, z, i] of [[-1.0, 2.2, 3.0, 9], [4.2, 2.0, 3.6, 7], [0, 2.5, -3.5, 10]]) { const l = new THREE.PointLight('#ffcf8a', 0, 8, 1.6); l.position.set(x, y, z); l.userData.base = i; root.add(l); engine.nightLights.push(l); }

  // Exterior sur: entrada con Porsche
  mesh(new THREE.BoxGeometry(14, 0.05, 2.4), '#bdb6aa', 0, 0.0, 8.5, root);
  for (let x = -6.5; x < 7; x += 0.8) mesh(box(0.02, 0.055, 2.4), '#aaa397', x, 0.0, 8.5, root);
  const buzon = group(root, -1.2, 0, 7.8); cyl(0.04, 0.04, 1.0, '#2b2b2b', 0, 0.5, 0, buzon, 6); mesh(rbox(0.45, 0.32, 0.25, 0.04), '#2d3136', 0, 1.1, 0, buzon);
  const mailTag = mesh(new THREE.PlaneGeometry(0.42, 0.12), M('#fff', { map: textTexture('Safiye & Alejandro', { color: '#2d3136', bg: '#f3efe7', size: 70, w: 900, h: 220 }) }), 0, 1.12, 0.13, buzon, false);
  const porsche = makePorsche(cb.porscheColor); porsche.position.set(3.5, 0.03, 8.5); porsche.rotation.y = Math.PI / 2; root.add(porsche);
  porsche.userData.onClick = (pt) => cb.onPorsche(pt);
  plant(root, -5.5, 8.6, 1.0, '#3b3f45'); plant(root, -4.2, 8.6, 0.8, '#3b3f45');

  /* ---------- Personajes ---------- */
  const ale = makePerson(ALEJANDRO); root.add(ale.root);
  ale.root.userData.onClick = (pt) => cb.onAle(pt);
  const controller = mesh(rbox(0.2, 0.06, 0.12, 0.03), '#f4f4f4', 0, 0, 0, null);
  const ring2b = mesh(new THREE.TorusGeometry(0.4, 0.13, 12, 28), '#ff7aa8', 0, 0, 0, null); ring2b.rotation.x = Math.PI / 2;
  const blanket = mesh(rbox(0.95, 1.15, 0.1, 0.04), '#7a9cc6', 0, 0, 0, null);
  const saf = makePerson(SAFIYE); root.add(saf.root); saf.root.position.set(...xz(NODES.salon)); saf.node = 'salon';
  saf.root.userData.onClick = (pt) => cb.onSafiye && cb.onSafiye(pt);
  saf.root.visible = cb.atHome;

  let activity = null;
  const lie = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));
  function setActivity(a) {
    if (a === activity) return; activity = a;
    const r = ale.root; r.quaternion.identity(); r.scale.setScalar(1); ale.sit(false); ale.armPose = false;
    ale.arms.forEach(x => x.rotation.set(0, 0, 0));
    controller.removeFromParent(); ring2b.removeFromParent(); blanket.removeFromParent();
    if (a === 'play') { r.position.set(0.25, -0.02, 2.0); r.rotation.y = Math.PI / 2; ale.sit(true); ale.armPose = true; ale.arms.forEach(x => (x.rotation.x = -1.1)); r.add(controller); controller.position.set(0, 0.84, 0.42); }
    else if (a === 'trabajo') { r.position.set(3.65, -0.02, 1.5); r.rotation.y = -Math.PI / 2; ale.sit(true); ale.armPose = true; ale.arms.forEach(x => (x.rotation.x = -1.2)); }
    else if (a === 'barbacoa') { r.position.set(-2.3, 0, -2.75); r.rotation.y = Math.PI; ale.armPose = true; ale.arms[1].rotation.x = -1.0; }
    else if (a === 'piscina') { r.position.set(2.8, -0.2, -3.35); r.rotation.y = 0.6; ale.armPose = true; ale.arms.forEach((x, i) => (x.rotation.z = i ? 1.2 : -1.2)); r.add(ring2b); ring2b.position.set(0, 0.62, 0); }
    else if (a === 'dormir') { r.quaternion.setFromRotationMatrix(lie); r.position.set(4.05, 0.72, 5.5); r.add(blanket); blanket.position.set(0, 0.55, 0.19); }
    if (cb.onActivity) cb.onActivity(a);
  }
  const visitPoint = () => NODES[SPOTS[activity]?.visit || 'salon'];
  function goTo(nodeId) {
    const from = saf.node || nearestNode(NODES, saf.root.position.x, saf.root.position.z);
    const pts = navPath(NODES, EDGES, from, nodeId); saf.node = nodeId;
    return walkPath(engine, saf, pts);
  }
  const goToAle = async () => { await goTo(SPOTS[activity].visit); faceTo(saf, ale.root.position.x, ale.root.position.z); };

  // humo / vapor
  const puffs = []; const puffMat = M('#e8e8e8', { t: 0.5 });
  for (let i = 0; i < 14; i++) { const p = oval(puffMat, 0, -10, 0, 0.12, 0.12, 0.12, root); p.castShadow = false; p.userData.life = i / 14; puffs.push(p); }
  let steamAt = null;
  engine.updaters.add((dt, t) => {
    saf.animate(t, saf.moving); ale.animate(t, false);
    if (activity === 'dormir') { ale.head.rotation.z = 0; }
    if (activity === 'piscina') ale.root.position.y = -0.2 + Math.sin(t * 1.5) * 0.03;
    tvScreen.material.emissiveIntensity = activity === 'play' ? 0.7 + Math.sin(t * 7) * 0.15 + Math.sin(t * 13) * 0.1 : 0.05;
    tvScreen.material.emissive.setHSL((t * 0.05) % 1, 0.6, 0.5);
    mon.material.emissiveIntensity = activity === 'trabajo' ? 0.8 : 0.05;
    grillGlow.material.emissiveIntensity = activity === 'barbacoa' ? 1.2 + Math.sin(t * 9) * 0.3 : 0;
    waterMat.color.setHSL(0.55, 0.65, 0.68 + Math.sin(t * 2) * 0.03);
    duck.position.x = 0.6 + Math.sin(t * 0.6) * 0.2; duck.rotation.y = t * 0.3;
    const src = steamAt || (activity === 'barbacoa' ? [-2.3, 1.0, -3.55] : null);
    puffs.forEach(p => {
      p.userData.life += dt * 0.5;
      if (p.userData.life > 1) p.userData.life -= 1;
      const L = p.userData.life;
      if (!src) { p.visible = false; return; }
      p.visible = true;
      p.position.set(src[0] + Math.sin(L * 9 + p.id) * 0.15, src[1] + L * 1.6, src[2] + Math.cos(L * 7 + p.id) * 0.15);
      p.scale.setScalar(0.08 + L * 0.25);
    });
    burners.forEach(b => (b.material.emissiveIntensity = steamAt ? 1.5 : 0));
  });

  engine.frame([-0.4, 0.4, 1.6], 28, 0.92, 0.42, { pan: [-6, 6, -5, 8] });
  return {
    ale, saf, porsche, NODES, setActivity, goTo, goToAle, visitPoint,
    get activity() { return activity; },
    cookSteam(on) { steamAt = on ? [-5.5, 1.1, 2.45] : null; },
    showSafiye(v) { saf.root.visible = v; },
  };
}
function xz(p) { return [p[0], 0, p[1]]; }
