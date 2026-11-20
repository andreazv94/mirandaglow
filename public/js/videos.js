// Vídeos de fondo: se cargan solo cuando se ven, eligen versión de móvil o de ordenador
// y no se mueven si la persona ha pedido "reducir movimiento".
(function () {
  var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var movil = matchMedia('(max-width: 760px)').matches;
  var vs = document.querySelectorAll('video[data-auto]');
  vs.forEach(function (v) {
    if (movil && v.dataset.posterMovil) v.poster = v.dataset.posterMovil;
  });
  if (quieto) return;
  function cargar(v) {
    if (v.dataset.cargado) return;
    v.dataset.cargado = '1';
    v.src = (movil && v.dataset.movil) || v.dataset.auto;
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  if (!('IntersectionObserver' in window)) return vs.forEach(cargar);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { cargar(v); if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      else if (v.dataset.cargado) v.pause();
    });
  }, { rootMargin: '200px' });
  vs.forEach(function (v) { io.observe(v); });
})();
