import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export class Engine {
  constructor(canvas, labelLayer) {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
    this.controls = new OrbitControls(this.camera, canvas);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.08, minPolarAngle: 0.45, maxPolarAngle: 1.2, screenSpacePanning: false, zoomSpeed: 0.8 });
    this.hemi = new THREE.HemisphereLight('#fdf6e8', '#5d6b5a', 0.8);
    this.sun = new THREE.DirectionalLight('#fff4e0', 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.hemi, this.sun, this.sun.target);
    this.world = new THREE.Group(); this.scene.add(this.world);
    this.updaters = new Set(); this.labels = [];
    this.labelLayer = labelLayer; this.clock = new THREE.Clock(); this.t = 0;
    this.ray = new THREE.Raycaster(); this.ndc = new THREE.Vector2();
    this.nightLights = [];
    this.followPop = null;
    let down = null;
    canvas.addEventListener('pointerdown', e => (down = [e.clientX, e.clientY]));
    canvas.addEventListener('pointerup', e => {
      if (!down) return; const d = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null;
      if (d < 7) this.pick(e);
    });
    canvas.addEventListener('pointermove', e => this.hover(e));
    canvas.addEventListener('pointerleave', () => this.onHover && this.onHover(null));
    const ro = new ResizeObserver(() => this.resize()); ro.observe(canvas);
    this.resize();
    this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
  }
  resize() {
    const c = this.renderer.domElement, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.narrow = w < h;
  }
  clear() {
    this.updaters.clear();
    this.labels.forEach(l => l.el.remove()); this.labels = [];
    this.nightLights = [];
    this.world.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    this.world.clear();
  }
  frame(target, dist, polar = 0.95, azim = 0.6, limits = {}) {
    this.controls.target.set(...target);
    const d = this.narrow ? dist * 1.45 : dist;
    this.camera.position.set(target[0] + d * Math.sin(polar) * Math.sin(azim), target[1] + d * Math.cos(polar), target[2] + d * Math.sin(polar) * Math.cos(azim));
    this.controls.minDistance = d * 0.45; this.controls.maxDistance = d * 1.5;
    this.controls.minAzimuthAngle = limits.minAz ?? -Infinity; this.controls.maxAzimuthAngle = limits.maxAz ?? Infinity;
    this.panBox = limits.pan || null;
    this.controls.update();
  }
  intersect(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    for (const hit of this.ray.intersectObjects(this.world.children, true)) {
      let o = hit.object;
      while (o && !o.userData.onClick) o = o.parent;
      if (o) return { o, hit };
      if (hit.object.userData.solid !== false) break;
    }
    return null;
  }
  pick(e) {
    const r = this.intersect(e);
    if (r) r.o.userData.onClick(r.hit.point, r.o, e);
    else if (this.onMiss) this.onMiss(e);
  }
  hover(e) {
    if (e.pointerType !== 'mouse') return;
    const r = this.intersect(e);
    this.renderer.domElement.style.cursor = r ? 'pointer' : 'grab';
    let o = r && r.hit.object; while (o && !o.userData.hint) o = o.parent;
    if (this.onHover) this.onHover(o ? o.userData.hint : null, e);
  }
  /** Etiqueta HTML que sigue a un objeto 3D. */
  label(obj, html, cls = '', dy = 0) {
    const el = document.createElement('div'); el.className = 'tag ' + cls; el.innerHTML = html;
    this.labelLayer.appendChild(el);
    const l = { el, obj, dy, v: new THREE.Vector3() }; this.labels.push(l); return l;
  }
  removeLabel(l) { l.el.remove(); this.labels = this.labels.filter(x => x !== l); }
  project(v) {
    const p = v.clone().project(this.camera), c = this.renderer.domElement;
    return { x: (p.x + 1) / 2 * c.clientWidth, y: (1 - p.y) / 2 * c.clientHeight, behind: p.z > 1 };
  }
  setLighting(hour, alwaysDay) {
    const h = alwaysDay ? 13 : hour;
    const day = Math.max(0, Math.sin(((h - 6.5) / 13.5) * Math.PI));
    const dusk = Math.max(0, 1 - Math.abs(day - 0.25) * 4) * (day > 0 ? 1 : 0);
    const a = ((h - 6) / 24) * Math.PI * 2;
    this.sun.position.set(Math.cos(a) * 14 + 6, 6 + day * 14, 10 + Math.sin(a) * 4);
    this.sun.intensity = 0.15 + day * 2.6;
    this.sun.color.setHSL(0.09 - dusk * 0.04, 0.5 + dusk * 0.4, 0.7 + day * 0.2 - dusk * 0.1);
    this.hemi.intensity = 0.35 + day * 0.6;
    this.hemi.color.set(day > 0.05 ? '#fdf6e8' : '#9fb3d9');
    this.scene.environmentIntensity = 0.18 + day * 0.32;
    const bg = new THREE.Color('#202c38').lerp(new THREE.Color('#dfe4e6'), Math.min(1, day * 1.6));
    if (dusk > 0) bg.lerp(new THREE.Color('#e8b48c'), dusk * 0.35);
    this.scene.background = bg;
    this.night = 1 - Math.min(1, day * 3);
    for (const l of this.nightLights) {
      if (l.isLight) l.intensity = l.userData.base * this.night;
      else if (l.material) l.material.emissiveIntensity = (l.userData.base ?? 1.5) * this.night;
    }
  }
  loop() {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.1, this.clock.getDelta()); this.t += dt;
    this.controls.update();
    if (this.panBox) {
      const tg = this.controls.target, b = this.panBox;
      const cx = THREE.MathUtils.clamp(tg.x, b[0], b[1]), cz = THREE.MathUtils.clamp(tg.z, b[2], b[3]);
      if (cx !== tg.x || cz !== tg.z) { const dx = cx - tg.x, dz = cz - tg.z; tg.x = cx; tg.z = cz; this.camera.position.x += dx; this.camera.position.z += dz; }
    }
    for (const f of this.updaters) f(dt, this.t);
    for (const l of this.labels) {
      l.obj.getWorldPosition(l.v); l.v.y += l.dy;
      const p = this.project(l.v);
      l.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
      l.el.style.visibility = p.behind || l.hidden ? 'hidden' : 'visible';
    }
    if (this.followPop) this.followPop();
    this.renderer.render(this.scene, this.camera);
  }
}

/** Mueve un objeto por una lista de puntos [x,z]; devuelve una promesa. */
export function walkPath(engine, actor, pts, speed = 3.0) {
  return new Promise(res => {
    const pos = actor.root.position; let i = 0;
    if (actor.sit) actor.sit(false);
    const f = (dt, t) => {
      if (i >= pts.length) { engine.updaters.delete(f); actor.moving = false; res(); return; }
      const [tx, tz] = pts[i], dx = tx - pos.x, dz = tz - pos.z, d = Math.hypot(dx, dz);
      actor.moving = true;
      if (d < 0.05) { i++; return; }
      const step = Math.min(d, speed * dt);
      pos.x += dx / d * step; pos.z += dz / d * step;
      const want = Math.atan2(dx, dz);
      let diff = want - actor.root.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      actor.root.rotation.y += diff * Math.min(1, dt * 12);
    };
    engine.updaters.add(f);
  });
}
export function faceTo(actor, x, z) {
  actor.root.rotation.y = Math.atan2(x - actor.root.position.x, z - actor.root.position.z);
}

/** Grafo de navegación simple (Dijkstra). nodes: {id:[x,z]}, edges: [[a,b]] */
export function navPath(nodes, edges, from, to) {
  const adj = {}; for (const k in nodes) adj[k] = [];
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  const dist = { [from]: 0 }, prev = {}, Q = new Set(Object.keys(nodes));
  while (Q.size) {
    let u = null; for (const q of Q) if (dist[q] != null && (u == null || dist[q] < dist[u])) u = q;
    if (u == null || u === to) break; Q.delete(u);
    for (const v of adj[u]) {
      const d = dist[u] + Math.hypot(nodes[u][0] - nodes[v][0], nodes[u][1] - nodes[v][1]);
      if (dist[v] == null || d < dist[v]) { dist[v] = d; prev[v] = u; }
    }
  }
  const out = []; let c = to; while (c && c !== from) { out.unshift(nodes[c]); c = prev[c]; }
  return out;
}
export function nearestNode(nodes, x, z) {
  let best = null, bd = Infinity;
  for (const k in nodes) { const d = Math.hypot(nodes[k][0] - x, nodes[k][1] - z); if (d < bd) { bd = d; best = k; } }
  return best;
}
