// ============================================================
//  Miranda Glow · servidor de cuentas
// ============================================================
//  La web sigue siendo estática (carpeta dist). Este Worker solo
//  atiende /api/*: entrar (Google o enlace por email), guardar los
//  datos de la persona, descargarlos y borrar la cuenta.
//
//  Datos en D1 (base de datos de Cloudflare). Nunca guardamos
//  tokens en claro: solo su huella SHA-256.
// ============================================================

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  EMAIL?: SendEmail & { send?: (m: unknown) => Promise<{ messageId: string }> };
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  EMAIL_FROM?: string;
  /** "1" cuando el envío de emails esté activado en Cloudflare */
  EMAIL_ACTIVO?: string;
  /** Solo en local: devuelve el enlace en vez de enviarlo */
  DEV_ENLACE?: string;
  /** Solo en local: productos de prueba por código (JSON) */
  DEV_CODIGOS?: string;
}

// Lo que se puede guardar en la cuenta (las mismas claves que usan la web y la app)
const CLAVES = new Set(['answers', 'perfil', 'cremas', 'ciclo', 'history', 'shelf']);
const MAX_VALOR = 200_000; // caracteres por clave
const SESION_DIAS = 90;
const COOKIE = 'mg_s';

// ---------- utilidades ----------
const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
const error = (codigo: string, status = 400) => json({ error: codigo }, status);

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const aleatorio = (n = 32) => b64url(crypto.getRandomValues(new Uint8Array(n)));
const huella = async (s: string) => b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
const ahora = () => Date.now();

function leerCookie(req: Request, nombre: string) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(new RegExp(`(?:^|;\\s*)${nombre}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}
const cookie = (nombre: string, valor: string, maxAge: number, path = '/') =>
  `${nombre}=${encodeURIComponent(valor)}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

const emailValido = (e: unknown): e is string =>
  typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

// ---------- base de datos ----------
let tablasListas = false;
async function tablas(db: D1Database) {
  if (tablasListas) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, nombre TEXT, google_sub TEXT UNIQUE,
      creado INTEGER NOT NULL, consentimiento INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS sesiones (
      huella TEXT PRIMARY KEY, usuario TEXT NOT NULL, expira INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS enlaces (
      huella TEXT PRIMARY KEY, email TEXT NOT NULL, consentimiento INTEGER NOT NULL, creado INTEGER NOT NULL,
      expira INTEGER NOT NULL, usado INTEGER NOT NULL DEFAULT 0)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS datos (
      usuario TEXT NOT NULL, clave TEXT NOT NULL, valor TEXT NOT NULL, t INTEGER NOT NULL,
      PRIMARY KEY (usuario, clave))`),
    db.prepare(`CREATE INDEX IF NOT EXISTS enlaces_email ON enlaces (email, creado)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS codigos (ean TEXT PRIMARY KEY, datos TEXT NOT NULL, t INTEGER NOT NULL)`),
  ]);
  tablasListas = true;
}

type Usuario = { id: string; email: string; nombre: string | null; creado: number };

async function usuarioDeSesion(req: Request, env: Env): Promise<Usuario | null> {
  const token = leerCookie(req, COOKIE);
  if (!token) return null;
  const fila = await env.DB.prepare(
    `SELECT u.id, u.email, u.nombre, u.creado FROM sesiones s JOIN usuarios u ON u.id = s.usuario
     WHERE s.huella = ? AND s.expira > ?`,
  ).bind(await huella(token), ahora()).first<Usuario>();
  return fila || null;
}

async function abrirSesion(env: Env, usuario: string): Promise<string> {
  const token = aleatorio();
  await env.DB.prepare('INSERT INTO sesiones (huella, usuario, expira) VALUES (?, ?, ?)')
    .bind(await huella(token), usuario, ahora() + SESION_DIAS * 864e5).run();
  // limpieza de sesiones caducadas de vez en cuando
  if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM sesiones WHERE expira < ?').bind(ahora()).run();
  return cookie(COOKIE, token, SESION_DIAS * 86400);
}

/** Busca o crea la persona. Si es nueva, hace falta su consentimiento para datos de salud. */
async function buscarOCrear(
  env: Env, email: string, consentimiento: boolean, extra: { nombre?: string; googleSub?: string } = {},
): Promise<{ id: string } | 'sin-consentimiento'> {
  email = email.trim().toLowerCase();
  const existe = await env.DB.prepare('SELECT id, google_sub FROM usuarios WHERE email = ? OR (google_sub IS NOT NULL AND google_sub = ?)')
    .bind(email, extra.googleSub ?? '').first<{ id: string; google_sub: string | null }>();
  if (existe) {
    if (extra.googleSub && !existe.google_sub)
      await env.DB.prepare('UPDATE usuarios SET google_sub = ?, nombre = COALESCE(nombre, ?) WHERE id = ?')
        .bind(extra.googleSub, extra.nombre ?? null, existe.id).run();
    return { id: existe.id };
  }
  if (!consentimiento) return 'sin-consentimiento';
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO usuarios (id, email, nombre, google_sub, creado, consentimiento) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, email, extra.nombre ?? null, extra.googleSub ?? null, ahora(), ahora()).run();
  return { id };
}

// ---------- email ----------
const emailActivo = (env: Env) => !!env.DEV_ENLACE || (env.EMAIL_ACTIVO === '1' && !!env.EMAIL);

function emailEnlace(url: string) {
  const text = `Hola:\n\nPulsa este enlace para entrar en Miranda Glow. Caduca en 15 minutos.\n\n${url}\n\nSi no lo has pedido tú, ignora este email.\n\nMiranda Glow`;
  const html = `<!doctype html><html><body style="margin:0;background:#F4F8F8;font-family:Helvetica,Arial,sans-serif;color:#22363A">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px">
    <p style="font-family:Georgia,serif;font-size:26px;margin:0 0 24px">Miranda Glow</p>
    <p style="font-size:16px;line-height:1.5">Pulsa el botón para entrar en tu cuenta. El enlace caduca en 15 minutos.</p>
    <p style="margin:28px 0"><a href="${url}" style="background:#22363A;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-size:16px;display:inline-block">Entrar en Miranda Glow</a></p>
    <p style="font-size:13px;color:#5F7376;line-height:1.5">Si no lo has pedido tú, ignora este email: nadie podrá entrar sin este enlace.</p>
  </div></body></html>`;
  return { text, html };
}

// ---------- códigos de barras ----------
// Preguntamos nosotros a Open Beauty Facts (base de datos abierta, licencia ODbL):
// así no ven a la persona y guardamos la respuesta para ir más rápido.
type Producto = { encontrado: boolean; nombre?: string; marca?: string; cantidad?: string; inci?: string; url?: string };
const DIAS = 864e5;

async function buscarCodigo(env: Env, ean: string): Promise<Response> {
  const cache = await env.DB.prepare('SELECT datos, t FROM codigos WHERE ean = ?').bind(ean).first<{ datos: string; t: number }>();
  if (cache) {
    const d = JSON.parse(cache.datos) as Producto;
    const vida = d.encontrado && d.inci ? 30 * DIAS : 1 * DIAS; // lo que no estaba, se vuelve a mirar al día siguiente
    if (ahora() - cache.t < vida) return json({ ...d, cache: true }, 200, { 'cache-control': 'public, max-age=3600' });
  }
  if (env.DEV_CODIGOS) return json(JSON.parse(env.DEV_CODIGOS)[ean] || { encontrado: false });
  let p: Producto = { encontrado: false };
  try {
    const r = await fetch(
      `https://world.openbeautyfacts.org/api/v2/product/${ean}.json?fields=code,product_name,product_name_es,brands,quantity,ingredients_text,ingredients_text_es,ingredients_text_en,ingredients_text_fr`,
      { headers: { 'user-agent': 'MirandaGlow/1.0 (https://mirandaglow.com; info@mirandaglow.com)' }, cf: { cacheTtl: 3600 } },
    );
    if (r.ok) {
      const d = await r.json<{ status?: number; product?: Record<string, string> }>();
      const pr = d.product;
      if (d.status === 1 && pr) {
        // la lista INCI suele estar en el campo general; si no, en el de algún idioma
        const inci = [pr.ingredients_text, pr.ingredients_text_en, pr.ingredients_text_es, pr.ingredients_text_fr]
          .map((x) => (x || '').trim()).find((x) => x.length > 10);
        p = {
          encontrado: true,
          nombre: (pr.product_name_es || pr.product_name || '').trim() || undefined,
          marca: (pr.brands || '').split(',')[0].trim() || undefined,
          cantidad: pr.quantity || undefined,
          inci,
          url: `https://world.openbeautyfacts.org/product/${ean}`,
        };
      }
    } else if (r.status !== 404) {
      return error('fuente-no-disponible', 502);
    }
  } catch {
    return error('fuente-no-disponible', 502);
  }
  await env.DB.prepare('INSERT OR REPLACE INTO codigos (ean, datos, t) VALUES (?, ?, ?)').bind(ean, JSON.stringify(p), ahora()).run();
  return json(p, 200, { 'cache-control': 'public, max-age=3600' });
}

// ---------- rutas ----------
async function api(req: Request, env: Env, url: URL): Promise<Response> {
  const ruta = url.pathname.replace(/\/+$/, '');
  const metodo = req.method;

  // Peticiones que cambian algo: solo desde nuestra propia web
  if (metodo !== 'GET' && metodo !== 'HEAD') {
    const origen = req.headers.get('origin');
    if (origen && origen !== url.origin) return error('origen', 403);
  }

  await tablas(env.DB);

  // --- código de barras → ingredientes (Open Beauty Facts, con caché) ---
  const mc = ruta.match(/^\/api\/codigo\/(\d{8,14})$/);
  if (mc && metodo === 'GET') return buscarCodigo(env, mc[1]);

  // --- ¿quién soy y qué tengo guardado? ---
  if (ruta === '/api/me' && metodo === 'GET') {
    const u = await usuarioDeSesion(req, env);
    if (!u) return json({ usuario: null, google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET), email: emailActivo(env) });
    const { results } = await env.DB.prepare('SELECT clave, valor, t FROM datos WHERE usuario = ?').bind(u.id).all<{ clave: string; valor: string; t: number }>();
    const datos = Object.fromEntries(results.map((r) => [r.clave, { valor: r.valor, t: r.t }]));
    return json({ usuario: { email: u.email, nombre: u.nombre, creado: u.creado }, datos });
  }

  // --- guardar cambios: { cambios: { clave: { valor, t } } } ---
  if (ruta === '/api/datos' && metodo === 'PUT') {
    const u = await usuarioDeSesion(req, env);
    if (!u) return error('sin-sesion', 401);
    const body = await req.json<{ cambios?: Record<string, { valor: string | null; t: number }> }>().catch(() => null);
    if (!body?.cambios || typeof body.cambios !== 'object') return error('formato');
    const ops: D1PreparedStatement[] = [];
    for (const [clave, c] of Object.entries(body.cambios)) {
      if (!CLAVES.has(clave) || typeof c?.t !== 'number') return error('clave');
      if (c.valor === null) {
        ops.push(env.DB.prepare('DELETE FROM datos WHERE usuario = ? AND clave = ?').bind(u.id, clave));
        continue;
      }
      if (typeof c.valor !== 'string' || c.valor.length > MAX_VALOR) return error('tamano');
      const t = Math.min(c.t, ahora() + 60_000);
      // gana el cambio más reciente
      ops.push(env.DB.prepare(
        `INSERT INTO datos (usuario, clave, valor, t) VALUES (?, ?, ?, ?)
         ON CONFLICT (usuario, clave) DO UPDATE SET valor = excluded.valor, t = excluded.t WHERE excluded.t >= datos.t`,
      ).bind(u.id, clave, c.valor, t));
    }
    if (ops.length) await env.DB.batch(ops);
    return json({ ok: true });
  }

  // --- descargar todo (derecho de portabilidad) ---
  if (ruta === '/api/exportar' && metodo === 'GET') {
    const u = await usuarioDeSesion(req, env);
    if (!u) return error('sin-sesion', 401);
    const { results } = await env.DB.prepare('SELECT clave, valor, t FROM datos WHERE usuario = ?').bind(u.id).all<{ clave: string; valor: string; t: number }>();
    const datos = Object.fromEntries(results.map((r) => {
      let v: unknown = r.valor; try { v = JSON.parse(r.valor); } catch {}
      return [r.clave, { valor: v, actualizado: new Date(r.t).toISOString() }];
    }));
    return json({ cuenta: { email: u.email, nombre: u.nombre, creada: new Date(u.creado).toISOString() }, datos }, 200, {
      'content-disposition': 'attachment; filename="mis-datos-mirandaglow.json"',
    });
  }

  // --- borrar la cuenta y todo lo guardado ---
  if (ruta === '/api/cuenta' && metodo === 'DELETE') {
    const u = await usuarioDeSesion(req, env);
    if (!u) return error('sin-sesion', 401);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM datos WHERE usuario = ?').bind(u.id),
      env.DB.prepare('DELETE FROM sesiones WHERE usuario = ?').bind(u.id),
      env.DB.prepare('DELETE FROM enlaces WHERE email = ?').bind(u.email),
      env.DB.prepare('DELETE FROM usuarios WHERE id = ?').bind(u.id),
    ]);
    return json({ ok: true }, 200, { 'set-cookie': cookie(COOKIE, '', 0) });
  }

  // --- salir ---
  if (ruta === '/api/auth/salir' && metodo === 'POST') {
    const token = leerCookie(req, COOKIE);
    if (token) await env.DB.prepare('DELETE FROM sesiones WHERE huella = ?').bind(await huella(token)).run();
    return json({ ok: true }, 200, { 'set-cookie': cookie(COOKIE, '', 0) });
  }

  // --- enlace por email: pedirlo ---
  if (ruta === '/api/auth/email' && metodo === 'POST') {
    const body = await req.json<{ email?: string; consentimiento?: boolean }>().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    if (!emailValido(email)) return error('email');
    if (!emailActivo(env)) return error('email-no-disponible', 503);
    // como mucho 1 por minuto y 5 por hora para el mismo email
    const r = await env.DB.prepare('SELECT COUNT(*) n, MAX(creado) ult FROM enlaces WHERE email = ? AND creado > ?')
      .bind(email, ahora() - 3600_000).first<{ n: number; ult: number | null }>();
    if ((r?.n ?? 0) >= 5 || (r?.ult && ahora() - r.ult < 60_000)) return error('espera', 429);
    const token = aleatorio();
    await env.DB.prepare('INSERT INTO enlaces (huella, email, consentimiento, creado, expira) VALUES (?, ?, ?, ?, ?)')
      .bind(await huella(token), email, body?.consentimiento ? 1 : 0, ahora(), ahora() + 15 * 60_000).run();
    const enlace = `${url.origin}/cuenta?token=${token}`;
    if (env.DEV_ENLACE) return json({ ok: true, enlace: `/cuenta?token=${token}` }); // solo en local
    try {
      const { text, html } = emailEnlace(enlace);
      await env.EMAIL!.send!({
        to: email,
        from: { email: env.EMAIL_FROM || 'hola@mirandaglow.com', name: 'Miranda Glow' },
        subject: 'Tu enlace para entrar en Miranda Glow',
        text, html,
      });
    } catch (e) {
      console.error('email', (e as { code?: string }).code, (e as Error).message);
      return error('email-fallo', 502);
    }
    return json({ ok: true });
  }

  // --- enlace por email: usarlo (con un botón, para que los antivirus del correo no lo gasten) ---
  if (ruta === '/api/auth/email/entrar' && metodo === 'POST') {
    const body = await req.json<{ token?: string }>().catch(() => null);
    if (!body?.token) return error('token');
    const h = await huella(body.token);
    const e = await env.DB.prepare('SELECT email, consentimiento, expira, usado FROM enlaces WHERE huella = ?')
      .bind(h).first<{ email: string; consentimiento: number; expira: number; usado: number }>();
    if (!e || e.usado || e.expira < ahora()) return error('enlace-caducado', 400);
    await env.DB.prepare('UPDATE enlaces SET usado = 1 WHERE huella = ?').bind(h).run();
    const u = await buscarOCrear(env, e.email, !!e.consentimiento);
    if (u === 'sin-consentimiento') return error('sin-consentimiento', 400);
    return json({ ok: true }, 200, { 'set-cookie': await abrirSesion(env, u.id) });
  }

  // --- Google: ir ---
  if (ruta === '/api/auth/google' && metodo === 'GET') {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return Response.redirect(`${url.origin}/cuenta?error=google-no-disponible`, 302);
    const state = aleatorio(16);
    const verificador = aleatorio(32);
    const reto = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificador)));
    const consiente = url.searchParams.get('consentimiento') === '1' ? '1' : '0';
    const g = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    g.search = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: `${url.origin}/api/auth/google/vuelta`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: reto,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    const h = new Headers({ location: g.toString() });
    h.append('set-cookie', cookie('mg_g', `${state}.${verificador}.${consiente}`, 600, '/api/auth/google'));
    return new Response(null, { status: 302, headers: h });
  }

  // --- Google: volver ---
  if (ruta === '/api/auth/google/vuelta' && metodo === 'GET') {
    const volver = (q: string, set?: string) => {
      const h = new Headers({ location: `${url.origin}/cuenta${q}` });
      h.append('set-cookie', cookie('mg_g', '', 0, '/api/auth/google'));
      if (set) h.append('set-cookie', set);
      return new Response(null, { status: 302, headers: h });
    };
    const [state, verificador, consiente] = (leerCookie(req, 'mg_g') || '').split('.');
    const code = url.searchParams.get('code');
    if (!code || !state || url.searchParams.get('state') !== state) return volver('?error=google');
    const tok = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${url.origin}/api/auth/google/vuelta`, grant_type: 'authorization_code', code_verifier: verificador,
      }),
    }).then((r) => r.json<{ access_token?: string }>()).catch(() => ({} as { access_token?: string }));
    if (!tok.access_token) return volver('?error=google');
    const yo = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${tok.access_token}` } })
      .then((r) => r.json<{ sub?: string; email?: string; email_verified?: boolean; given_name?: string; name?: string }>())
      .catch(() => ({} as Record<string, never>));
    if (!yo.sub || !yo.email || !yo.email_verified) return volver('?error=google');
    const u = await buscarOCrear(env, yo.email, consiente === '1', { nombre: yo.given_name || yo.name, googleSub: yo.sub });
    if (u === 'sin-consentimiento') return volver('?error=sin-consentimiento');
    return volver('?bienvenida=1', await abrirSesion(env, u.id));
  }

  return error('no-encontrado', 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await api(req, env, url);
      } catch (e) {
        console.error(e);
        return error('servidor', 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
