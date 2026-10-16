// Sesiones de jugadores: cada persona crea su sesión (nombre + PIN) y su partida se guarda aquí.
import { getStore } from '@netlify/blobs';
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

const store = () => getStore({ name: 'safiye-sessions', region: 'eu-central-1', consistency: 'strong' });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const keyOf = (name) => name.normalize('NFKD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, '-');
const hashPin = (pin, salt) => scryptSync(pin, salt, 32).toString('hex');
const sha = (t) => createHash('sha256').update(t).digest('hex');
const MAX_DATA = 400_000, LOCK_AFTER = 5, LOCK_MS = 10 * 60 * 1000;

function newToken(rec) {
  const token = randomBytes(24).toString('hex');
  rec.tokens = [sha(token), ...(rec.tokens || [])].slice(0, 6);
  return token;
}
function checkToken(rec, token) { return typeof token === 'string' && (rec.tokens || []).includes(sha(token)); }

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Petición no válida' }, 400); }
  const { op, name, pin, token, data } = body || {};
  if (typeof name !== 'string' || !/^[\p{L}\p{N} ]{2,24}$/u.test(name.trim())) return json({ error: 'El nombre debe tener entre 2 y 24 letras o números.' }, 400);
  const key = keyOf(name), s = store();
  const rec = await s.get(key, { type: 'json' });
  const now = Date.now();

  if (op === 'create') {
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) return json({ error: 'El PIN debe tener 4 cifras.' }, 400);
    if (rec) return json({ error: 'Ya existe una sesión con ese nombre. Elige otro o inicia sesión.' }, 409);
    if (data && JSON.stringify(data).length > MAX_DATA) return json({ error: 'Partida demasiado grande' }, 413);
    const salt = randomBytes(16).toString('hex');
    const r = { name: name.trim(), salt, pin: hashPin(pin, salt), created: now, updated: data ? now : 0, data: data || null, fails: 0, lockUntil: 0 };
    const t = newToken(r);
    const { modified } = await s.setJSON(key, r, { onlyIfNew: true });
    if (!modified) return json({ error: 'Ya existe una sesión con ese nombre.' }, 409);
    return json({ name: r.name, token: t, data: r.data, updated: r.updated }, 201);
  }
  if (!rec) return json({ error: 'No existe ninguna sesión con ese nombre.' }, 404);

  if (op === 'login') {
    if (rec.lockUntil > now) return json({ error: `Demasiados intentos. Prueba de nuevo en ${Math.ceil((rec.lockUntil - now) / 60000)} min.` }, 423);
    const ok = typeof pin === 'string' && /^\d{4}$/.test(pin) && timingSafeEqual(Buffer.from(hashPin(pin, rec.salt), 'hex'), Buffer.from(rec.pin, 'hex'));
    if (!ok) {
      rec.fails = (rec.fails || 0) + 1;
      if (rec.fails >= LOCK_AFTER) { rec.lockUntil = now + LOCK_MS; rec.fails = 0; }
      await s.setJSON(key, rec);
      return json({ error: 'PIN incorrecto.' }, 401);
    }
    rec.fails = 0; rec.lockUntil = 0;
    const t = newToken(rec); await s.setJSON(key, rec);
    return json({ name: rec.name, token: t, data: rec.data, updated: rec.updated });
  }
  if (!checkToken(rec, token)) return json({ error: 'Sesión caducada. Vuelve a iniciar sesión.' }, 401);
  if (op === 'load') return json({ name: rec.name, data: rec.data, updated: rec.updated });
  if (op === 'save') {
    if (!data || typeof data !== 'object') return json({ error: 'Sin datos' }, 400);
    if (JSON.stringify(data).length > MAX_DATA) return json({ error: 'Partida demasiado grande' }, 413);
    rec.data = data; rec.updated = now; await s.setJSON(key, rec);
    return json({ ok: true, updated: now });
  }
  if (op === 'logout') { rec.tokens = (rec.tokens || []).filter(h => h !== sha(token)); await s.setJSON(key, rec); return json({ ok: true }); }
  if (op === 'delete') { await s.delete(key); return json({ ok: true }); }
  return json({ error: 'Operación desconocida' }, 400);
};

export const config = { path: '/api/session' };
