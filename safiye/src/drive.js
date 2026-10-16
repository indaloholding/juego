// Viaje en Porsche 911: carretera infinita con paisaje que cambia según el destino.
import * as THREE from 'three';
import { M, mesh, box, oval, cyl, group, tree, makePorsche } from './models.js';

const SCENERY = {
  casa: { ground: '#86b46a', far: '#a9c98f' }, stuttgart: { ground: '#86b46a', far: '#a9c98f' },
  estambul: { ground: '#c9b98f', far: '#3a8fc2' }, barcelona: { ground: '#d8c08a', far: '#3fa0d0' },
};

export function buildDrive(engine, dest, color, duration, onDone, gt3 = false) {
  const sc = SCENERY[dest] || SCENERY.casa;
  const root = group(engine.world);
  mesh(new THREE.BoxGeometry(400, 0.1, 60), sc.ground, 0, -0.06, 0, root);
  mesh(new THREE.BoxGeometry(400, 0.1, 30), sc.far, 0, -0.05, -32, root);
  mesh(new THREE.BoxGeometry(400, 0.02, 4.2), '#3a3f45', 0, 0.0, 0, root);
  const dashes = group(root);
  for (let i = 0; i < 60; i++) mesh(box(1.6, 0.025, 0.12), '#f4f1ea', -60 + i * 4, 0.01, 0, dashes, false);
  const props = group(root);
  for (let i = 0; i < 40; i++) {
    const x = -80 + i * 4.3, side = i % 2 ? 1 : -1, z = side * (4.5 + (i * 37 % 7));
    if (dest === 'barcelona' && i % 3 === 0) { const p = group(props, x, 0, z); cyl(0.1, 0.14, 3, '#9a7a55', 0, 1.5, 0, p, 6); for (let k = 0; k < 5; k++) { const l = oval('#4f9a4a', Math.cos(k * 1.3) * 0.5, 3.1, Math.sin(k * 1.3) * 0.5, 0.7, 0.1, 0.2, p); l.rotation.y = -k * 1.3; } }
    else if (dest === 'estambul' && i % 4 === 0) { const p = group(props, x, 0, z); cyl(0.12, 0.15, 3.5, '#ece6da', 0, 1.75, 0, p, 8); mesh(new THREE.ConeGeometry(0.17, 0.8, 8), '#8a9aa6', 0, 3.9, 0, p); }
    else tree(props, x, z, 0.6 + (i % 3) * 0.2);
  }
  const car = makePorsche(color, gt3); car.rotation.y = Math.PI / 2; car.position.set(-6, 0.02, 1); root.add(car);
  engine.frame([0, 0.6, 1], 19, 1.0, 0.9);
  const cam = engine.camera, ctl = engine.controls; ctl.enabled = false;
  let k = 0, speed = 0;
  const wheels = car.userData.wheels;
  const f = (dt) => {
    k += dt;
    speed = Math.min(42, speed + dt * 30);
    const u = k / duration;
    car.position.x = -6 + Math.min(u, 1) * 12;
    car.position.y = 0.02 + Math.sin(k * 30) * 0.008;
    wheels.forEach(w => (w.rotation.z -= speed * dt / 0.34));
    props.position.x -= speed * dt * 0.6; if (props.position.x < -100) props.position.x += 172;
    dashes.position.x = -((k * speed * 0.6) % 4);
    cam.position.x = car.position.x * 0.6 + 6; ctl.target.set(car.position.x, 0.6, 1);
    if (k >= duration) finish();
  };
  let done = false;
  const finish = () => { if (done) return; done = true; clearTimeout(timer); engine.updaters.delete(f); ctl.enabled = true; onDone(); };
  // si la pestaña queda en segundo plano (sin frames), el viaje termina igualmente
  const timer = setTimeout(finish, duration * 1000 + 2500);
  engine.updaters.add(f);
  return { skip: () => { k = duration; } };
}
