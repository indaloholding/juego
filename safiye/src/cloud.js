// Sesiones en la nube (función /api/session) + recuerdo local de la sesión activa.
const API = '/api/session', CUR = 'safiye-911-session', KNOWN = 'safiye-911-known';
const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* nada */ } }, del(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } } };

async function call(body, keepalive = false) {
  let r;
  try { r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive }); }
  catch (e) { const err = new Error('Sin conexión. Revisa internet e inténtalo de nuevo.'); err.status = 0; throw err; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const err = new Error(j.error || 'Algo ha fallado. Inténtalo de nuevo.'); err.status = r.status; throw err; }
  return j;
}
export const keyOf = (name) => name.normalize('NFKD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, '-');
export const session = {
  get current() { return ls.get(CUR); },
  get known() { return ls.get(KNOWN) || []; },
  remember(s) { ls.set(CUR, s); const k = this.known.filter(n => keyOf(n) !== keyOf(s.name)); ls.set(KNOWN, [s.name, ...k].slice(0, 8)); },
  forget() { ls.del(CUR); },
  forgetName(name) { ls.set(KNOWN, this.known.filter(n => keyOf(n) !== keyOf(name))); },
  create: (name, pin, data) => call({ op: 'create', name, pin, data }),
  login: (name, pin) => call({ op: 'login', name, pin }),
  load: (s) => call({ op: 'load', name: s.name, token: s.token }),
  save: (s, data, keepalive) => call({ op: 'save', name: s.name, token: s.token, data }, keepalive),
  logout: (s) => call({ op: 'logout', name: s.name, token: s.token }).catch(() => {}),
  remove: (s) => call({ op: 'delete', name: s.name, token: s.token }),
};
