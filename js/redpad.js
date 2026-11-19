/* tools-02 · the red-mode dot's own dial (Gill, 17 Nov): hold the dot and a simple dial grows out of it; it hides itself
   after you let go. Slide up / down: the colour mode (the four tones: bright · crimson · rose · dim). Slide left / right:
   lightness (how bright red mode is, all of it — the lamp, the sky, the words). The same finger: hold, then slide. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp, html = document.documentElement;
  var ORDER = [3, 2, 1, 0];   // top → bottom: bright, crimson, rose, dim (GJ.TONES indices)
  var pad = document.createElement('div'); pad.id = 'redpad'; pad.setAttribute('aria-hidden', 'true');
  pad.innerHTML = '<svg viewBox="0 0 160 160" aria-hidden="true"><circle class="rp-ring" cx="80" cy="80" r="70"/><line class="rp-ax" x1="80" y1="14" x2="80" y2="146"/><line class="rp-ax" x1="14" y1="80" x2="146" y2="80"/>' +
    ORDER.map(function (t, i) { return '<circle class="rp-stop" cx="80" cy="' + (26 + i * 36) + '" r="1.6"/>'; }).join('') +
    '<circle class="rp-dot" cx="80" cy="80" r="5"/></svg><b class="rp-tone"></b><span class="rp-l">lightness</span><i class="rp-v"></i>';
  document.body.appendChild(pad);
  var veil = document.createElement('div'); veil.id = 'redveil'; document.body.appendChild(veil);
  var dot = pad.querySelector('.rp-dot'), T = pad.querySelector('.rp-tone'), V = pad.querySelector('.rp-v');
  var hideT = 0, drag = null;
  function light() { var l = store.get().redLight; return l == null ? 1 : l; }
  function row() { return Math.max(0, ORDER.indexOf(store.get().tone)); }
  function paint() {
    var r = row(), l = light();
    dot.setAttribute('cy', 26 + r * 36); dot.setAttribute('cx', (14 + (l - .2) / .8 * 132).toFixed(1));
    T.textContent = (GJ.TONES[store.get().tone] || GJ.TONES[2]).name; V.textContent = Math.round(l * 100) + '%';
    html.style.setProperty('--red-light', l.toFixed(3));
  }
  function show() { clearTimeout(hideT); paint(); pad.classList.add('on'); }
  function later() { clearTimeout(hideT); hideT = setTimeout(function () { pad.classList.remove('on'); }, GJ.reduced() ? 1200 : 1800); }
  // the gesture, from where the hold began: 36 px a step up / down, 160 px across the whole lightness
  function start(x, y) { drag = { x: x, y: y, r0: row(), l0: light() }; show(); }
  function move(x, y) {
    if (!drag) return;
    var r = clamp(Math.round(drag.r0 + (y - drag.y) / 36), 0, ORDER.length - 1), l = clamp(drag.l0 + (x - drag.x) / 160 * .8, .2, 1);
    var o = {}; if (ORDER[r] !== store.get().tone) { o.tone = ORDER[r]; GJ.haptic.tick(); }
    if (Math.abs(l - light()) > .004) o.redLight = Math.round(l * 100) / 100;
    if (o.tone != null || o.redLight != null) store.set(o);
    paint();
  }
  function end() { if (!drag) return; drag = null; GJ.haptic.commit(); later(); }
  // the pad answers a touch of its own while it is out
  pad.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); try { pad.setPointerCapture(e.pointerId); } catch (x) {} start(e.clientX, e.clientY); });
  pad.addEventListener('pointermove', function (e) { if (drag) move(e.clientX, e.clientY); });
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  store.on && store.on(paint);
  paint();
  GJ.redpad = { start: start, move: move, end: end, show: show, hide: function () { clearTimeout(hideT); pad.classList.remove('on'); }, open: function () { return pad.classList.contains('on'); }, light: light };
})(window);
