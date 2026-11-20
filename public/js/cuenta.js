// ============================================================
//  Miranda Glow · sincronización con la cuenta
// ============================================================
//  Sin cuenta: no hace nada (todo se queda en este navegador).
//  Con cuenta: al abrir la web baja lo guardado y, cuando algo
//  cambia aquí (test, tu piel, cremas, ciclo, rutina), lo sube.
//  Lo usan la web y la app (/app), que comparten estas claves.
// ============================================================
(function () {
  var CLAVES = {
    answers: 'mirandaglow.answers.v2',
    perfil: 'mirandaglow.perfil',
    cremas: 'mirandaglow.cremas',
    ciclo: 'mirandaglow.ciclo',
    history: 'mirandaglow.history.v2',
    shelf: 'mirandaglow.shelf.v2',
    lunares: 'mirandaglow.lunares',
    diario: 'mirandaglow.diario',
    sol: 'mirandaglow.sol',
  };
  var META = 'mirandaglow.sync';
  var conectado = false;
  var subiendo = false;

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function escribir(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  function meta() { try { return JSON.parse(leer(META) || '{}'); } catch (e) { return {}; } }
  function guardarMeta(m) { escribir(META, JSON.stringify(m)); }

  function avisar(estado) {
    window.MGCuenta.ultimo = estado;
    try { window.dispatchEvent(new CustomEvent('mg:cuenta', { detail: estado })); } catch (e) {}
    var u = estado && estado.usuario;
    document.querySelectorAll('[data-cuenta-link]').forEach(function (a) {
      a.textContent = u ? 'Mi cuenta' : 'Entrar';
    });
  }

  function cambiosLocales() {
    var m = meta(), cambios = {}, hay = false;
    for (var c in CLAVES) {
      var v = leer(CLAVES[c]);
      var antes = m[c] ? m[c].v : null;
      if (v !== antes && !(v === null && !m[c])) { cambios[c] = { valor: v, t: Date.now() }; hay = true; }
    }
    return hay ? cambios : null;
  }

  function subir(final) {
    if (!conectado || subiendo) return;
    var cambios = cambiosLocales();
    if (!cambios) return;
    subiendo = true;
    fetch('/api/datos', {
      method: 'PUT', credentials: 'same-origin', keepalive: !!final,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cambios: cambios }),
    }).then(function (r) {
      if (r.status === 401) { conectado = false; return; }
      if (!r.ok) return;
      var m = meta();
      for (var c in cambios) m[c] = cambios[c].valor === null ? undefined : { v: cambios[c].valor, t: cambios[c].t };
      guardarMeta(m);
    }).catch(function () {}).then(function () { subiendo = false; });
  }

  /** Junta lo de este navegador con lo de la cuenta. Devuelve true si cambió algo aquí. */
  function juntar(datos) {
    var m = meta(), cambiado = false;
    for (var c in CLAVES) {
      var k = CLAVES[c], local = leer(k), srv = datos[c];
      var visto = m[c];
      var cambiadoAqui = visto ? local !== visto.v : false;
      if (!visto) {
        // primera vez en este navegador: manda la cuenta; si la cuenta no lo tiene, se sube lo de aquí
        if (srv) {
          if (local !== srv.valor) { escribir(k, srv.valor); cambiado = true; }
          m[c] = { v: srv.valor, t: srv.t };
        }
      } else if (cambiadoAqui) {
        // se sube en la siguiente pasada
      } else if (srv && srv.t > visto.t && srv.valor !== local) {
        escribir(k, srv.valor); m[c] = { v: srv.valor, t: srv.t }; cambiado = true;
      } else if (!srv && visto) {
        // se borró en otro dispositivo
        escribir(k, null); m[c] = undefined; cambiado = true;
      }
    }
    guardarMeta(m);
    return cambiado;
  }

  window.MGCuenta = {
    ultimo: null,
    claves: CLAVES,
    estado: null,
    subirAhora: function () { subir(false); },
    salir: function () {
      return fetch('/api/auth/salir', { method: 'POST', credentials: 'same-origin' }).catch(function () {}).then(function () {
        // al salir, tus datos se quitan de este navegador (siguen en tu cuenta)
        for (var c in CLAVES) escribir(CLAVES[c], null);
        escribir(META, null);
        conectado = false;
      });
    },
    olvidarLocal: function () {
      for (var c in CLAVES) escribir(CLAVES[c], null);
      escribir(META, null);
      conectado = false;
    },
  };

  window.MGCuenta.estado = fetch('/api/me', { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : { usuario: null }; })
    .catch(function () { return { usuario: null, sinConexion: true }; })
    .then(function (estado) {
      if (estado.usuario) {
        conectado = true;
        var cambiado = juntar(estado.datos || {});
        subir(false);
        // si han llegado datos de la cuenta, recargamos una vez para que la página los muestre
        if (cambiado && !sessionStorage.getItem('mg_recargado')) {
          sessionStorage.setItem('mg_recargado', '1');
          location.reload();
          return estado;
        }
      }
      avisar(estado);
      return estado;
    });

  setInterval(function () { subir(false); }, 4000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') subir(true); });
  window.addEventListener('pagehide', function () { subir(true); });
})();
