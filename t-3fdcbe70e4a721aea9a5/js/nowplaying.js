/* tools-02 · now playing (Gill, 17 Nov: "make this play icon match the aesthetic · space · another hit target and a dial
   to switch between songs"). A small pill under the Mark while a song plays: a drawn play / pause mark, a breath of space,
   the title. Tap it: play / pause. Slide it sideways: it is a dial through the songs — the title changes under your finger
   with a tick per song, and lets go on the one you stop at. Paused, it shrinks to the mark alone, then tucks away. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var el = document.createElement('button'); el.id = 'np'; el.type = 'button'; el.setAttribute('aria-label', 'now playing: tap to play or pause, slide for another song');
  el.innerHTML = '<i class="np-g" aria-hidden="true"></i><span class="np-t"></span>';
  document.body.appendChild(el);
  var T = el.querySelector('.np-t'), hideT = 0, d = null, preview = -1;
  function P() { return GJ.player; }
  function paint(k) {
    var p = P(); if (!p) return; var st = p.state(), i = k == null ? st.idx : k, t = p.tracks[i];
    el.classList.toggle('playing', st.playing);
    T.textContent = t ? t.t.toLowerCase() + ' · ' + t.by.toLowerCase() : '';
  }
  function flash() {   // after any change: show it, then let it settle (shrink when paused, tuck away later)
    paint(); html.classList.add('np-on'); el.classList.remove('np-small'); clearTimeout(hideT);
    hideT = setTimeout(rest, 2600);
  }
  function rest() {
    var p = P(); if (!p) return;
    if (p.state().playing) { el.classList.add('np-small'); return; }   // playing: just the mark, a quiet sign it is on
    html.classList.remove('np-on');
  }
  el.addEventListener('pointerdown', function (e) {
    e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {}
    clearTimeout(hideT); el.classList.remove('np-small'); paint();
    d = { x: e.clientX, i0: P().state().idx, moved: false }; preview = -1;
  });
  el.addEventListener('pointermove', function (e) {
    if (!d) return; var dx = e.clientX - d.x; if (!d.moved && Math.abs(dx) < 10) return; d.moved = true;
    var n = P().tracks.length, k = ((d.i0 + Math.round(dx / 46)) % n + n) % n;   // a song every 46 px
    if (k !== preview) { preview = k; paint(k); el.classList.add('dial'); GJ.haptic.tick(); }
  });
  function up() {
    if (!d) return; var q = d; d = null; el.classList.remove('dial');
    var p = P();
    if (q.moved) { if (preview >= 0 && preview !== q.i0) { var w = p.state().playing; p.load(preview); if (w) p.play(); } }
    else p.toggle();
    GJ.haptic.commit(); flash();
  }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('click', function (e) { e.preventDefault(); });
  // keep in step with the player, whoever changes it
  var last = '';
  setInterval(function () { var p = P(); if (!p || d) return; var st = p.state(), k = st.idx + ':' + st.playing; if (k !== last) { var first = !last; last = k; if (!first) flash(); } }, 250);
  GJ.np = { flash: flash, shown: function () { return html.classList.contains('np-on'); } };
})(window);
