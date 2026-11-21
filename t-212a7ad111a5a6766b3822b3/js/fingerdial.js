/* tools-02 · the finger dial (Gill, 17 Nov: "volume and flash should expand to a transparency dial around the fingers").
   Touch a small control and a see-through ring grows around your finger: slide across (or up) to turn it, the arc fills,
   the value floats above where your finger is not. Let go and it shrinks back into the control. Any slider can use it:
   GJ.fingerDial.bind(element, { label, get, set, min, max, fmt }). */
(function (G) {
  'use strict';
  var GJ = G.GJ, clamp = GJ.clamp;
  var NS = 'http://www.w3.org/2000/svg', R = 74, C = 2 * Math.PI * R * .75;   // a three-quarter ring, open at the bottom
  var el = document.createElement('div'); el.id = 'fdial'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<svg viewBox="0 0 200 200"><circle class="fd-bg" cx="100" cy="100" r="' + R + '"/><circle class="fd-track" cx="100" cy="100" r="' + R + '"/>' +
    '<circle class="fd-val" cx="100" cy="100" r="' + R + '"/><circle class="fd-knob" r="6"/></svg><b class="jul"></b><span></span>';
  document.body.appendChild(el);
  var val = el.querySelector('.fd-val'), knob = el.querySelector('.fd-knob'), L = el.querySelector('b'), V = el.querySelector('span');
  el.querySelector('.fd-track').style.strokeDasharray = C + ' 999'; val.style.strokeDasharray = '0 999';
  var cur = null;
  function paint() {
    if (!cur) return; var o = cur.o, f = clamp((o.get() - o.min) / (o.max - o.min), 0, 1);
    val.style.strokeDasharray = (f * C).toFixed(1) + ' 999';
    var a = (135 + f * 270) * Math.PI / 180; knob.setAttribute('cx', (100 + R * Math.cos(a)).toFixed(1)); knob.setAttribute('cy', (100 + R * Math.sin(a)).toFixed(1));
    L.textContent = o.label; V.textContent = o.fmt ? o.fmt(o.get()) : Math.round(f * 100) + '%';
  }
  function bind(target, o) {
    target.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation(); try { target.setPointerCapture(e.pointerId); } catch (x) {}
      cur = { o: o, x: e.clientX, y: e.clientY, v0: o.get(), id: e.pointerId, last: Math.round((o.get() - o.min) / (o.max - o.min) * 20) };
      el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px';
      paint(); el.classList.add('on'); GJ.haptic.tick();
    }, true);
    target.addEventListener('pointermove', function (e) {
      if (!cur || cur.id !== e.pointerId) return; e.preventDefault();
      var d = (e.clientX - cur.x) - (e.clientY - cur.y) * .8, v = clamp(cur.v0 + d / 220 * (o.max - o.min), o.min, o.max);   // right or up = more
      o.set(v); var st = Math.round((v - o.min) / (o.max - o.min) * 20); if (st !== cur.last) { cur.last = st; if (st % 5 === 0) { GJ.haptic.tick(); if (GJ.dialkit) GJ.dialkit.snap('finger'); } } paint();
    }, true);
    function up(e) { if (!cur || cur.id !== e.pointerId) return; cur = null; el.classList.remove('on'); GJ.haptic.commit(); }
    target.addEventListener('pointerup', up, true); target.addEventListener('pointercancel', up, true);
    target.addEventListener('click', function (e) { e.preventDefault(); }, true);
    // double-tap the control: back to its default (o.def), said where the ring shows its value
    if (GJ.dialkit && o.def != null) GJ.dialkit.doubleTap('finger', target, function () { o.set(o.def); cur = { o: o }; paint(); el.classList.add('on'); V.textContent = (o.fmt ? o.fmt(o.def) : Math.round((o.def - o.min) / (o.max - o.min) * 100) + '%') + ' · reset'; GJ.dialkit.snap('finger'); GJ.haptic.commit(); setTimeout(function () { if (cur && cur.o === o && cur.id == null) { cur = null; el.classList.remove('on'); } }, 1100); });
  }
  // every dial alike (dialkit, review B1): the ring snaps visibly every quarter; its value floats beside the finger
  if (GJ.dialkit) GJ.dialkit.attach('finger', { el: el, ownRest: true });
  GJ.fingerDial = { bind: bind, open: function () { return !!cur; } };
})(window);
