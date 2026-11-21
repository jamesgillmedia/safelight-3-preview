/* tools-02 · Mark II, the Moon dial's outer ring (Gill's app map v2 decisions 02–04, then, 18 Nov 22:04–22:09: "the new dot
   mark dial loses some of the function it had before. Let's use that dial somewhere though. It just doesn't feel like those
   tools belong in the safelight mark · Maybe move some functionality to the accessibility button · Dials should feel
   intuitive", and his tap: "Yes, as its outer ring"). It no longer lives on the red-mode dot (which has its own colour /
   lightness pad back). It opens from the Moon dial's ring ("dial"), growing out of the moon wherever the moon sits:
     the inner arc ......... atmosphere; in red mode, lightness (the dimmer's own store.redLight)
     the outer arc ......... the places — tap one, or slide along and let go on one
     the middle ............ tap = put it away · hold = the full Tune drawer
     a touch elsewhere, the Mark, or a few seconds: it goes back into the moon
   Only a dial, never a full screen; while its arc is turning the sky, its plate and the places fade so the sky can be seen.
   Nothing here touches a photograph, and nothing here is the dot's mint. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, clamp = GJ.clamp, html = document.documentElement;
  var PLACES = [['sky', 'the sky'], ['red', 'timer'], ['golden', 'golden hour'], ['loops', 'loops'], ['player', 'sky player'], ['archive', 'archive'], ['map', 'the map'], ['notes', 'notes']];
  var RI = 86, RA = 160, HIT = 265, N = PLACES.length, A0 = 225, SPAN = 90;   // px from the middle; the arcs face in from the edge: a quarter turn, from below (225°) up to above (135°)
  var el = document.createElement('div'); el.id = 'mk2'; el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Mark II, the Moon dial’s outer ring'); el.setAttribute('aria-hidden', 'true');
  if (GJ.dialkit) GJ.dialkit.attach('mark2', { el: el, ownRest: true });   // every dial alike (dialkit): a visible snap on each place
  document.body.appendChild(el);
  var hit, V, K, L, R, sel = -1, drag = null, last = null, discT = 0, hideT = 0, O = { x: 0, y: 0, m: 1 };   // m: 1 at the right edge, -1 mirrored at the left
  function pt(r, deg) { var a = deg * Math.PI / 180; return [Math.cos(a) * r * O.m, Math.sin(a) * r]; }
  function arc(r, a, b) { var p = pt(r, a), q = pt(r, b); return 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 0 ' + (O.m > 0 ? 0 : 1) + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
  function pa(i) { return A0 - i * SPAN / (N - 1); }
  function build() {
    var rd = pt(124, 180);
    el.className = O.m > 0 ? '' : 'left';
    el.innerHTML = '<div class="m2-in"><div class="m2-hit"></div><svg viewBox="-300 -300 600 600" aria-hidden="true">' +
      '<path class="m2-o" d="' + arc(RA, A0, A0 - SPAN) + '"/><path class="m2-t" d="' + arc(RI, A0, A0 - SPAN) + '"/><path class="m2-v" d=""/><circle class="m2-k" r="6"/>' +
      PLACES.map(function (p, i) { var q = pt(RA, pa(i)); return '<circle class="m2-p" data-i="' + i + '" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4"/>'; }).join('') + '</svg>' +
      PLACES.map(function (p, i) { var q = pt(RA, pa(i)); return '<span class="jul m2-n" data-i="' + i + '" style="left:' + q[0].toFixed(0) + 'px;top:' + q[1].toFixed(0) + 'px">' + p[1] + '</span>'; }).join('') +
      '<span class="m2-lab" style="left:' + rd[0].toFixed(0) + 'px;top:' + rd[1].toFixed(0) + 'px"><b class="jul m2-l"></b><i class="m2-r"></i></span></div>';
    hit = el.querySelector('.m2-hit'); V = el.querySelector('.m2-v'); K = el.querySelector('.m2-k'); L = el.querySelector('.m2-l'); R = el.querySelector('.m2-r');
    hit.addEventListener('pointerdown', down); hit.addEventListener('pointermove', move); hit.addEventListener('pointerup', up);
    hit.addEventListener('pointercancel', function () { drag = null; clearTimeout(discT); pick(-1); still(); later(); });
  }
  function red() { return !!store.get().red; }
  function val() { var s = store.get(); return red() ? clamp(((s.redLight == null ? 1 : s.redLight) - .2) / .8, 0, 1) : clamp(s.atmos == null ? 1 : s.atmos, 0, 1); }
  function setVal(v) {
    v = clamp(v, 0, 1);
    if (red()) store.set({ redLight: Math.round((.2 + v * .8) * 100) / 100 });
    else if (GJ.skyRings && GJ.skyRings.atmos) GJ.skyRings.atmos.set(v); else store.set({ atmos: Math.round(v * 100) / 100 });
    paint();
  }
  function here() { var r = app.room; if (!r) return 0; for (var i = 0; i < N; i++) if (PLACES[i][0] === r) return i; return -1; }
  function paint() {
    if (!V) return; var v = val(), a = A0 - SPAN * v, k = pt(RI, a), h = here();
    V.setAttribute('d', v > .004 ? arc(RI, A0, a) : ''); K.setAttribute('cx', k[0].toFixed(1)); K.setAttribute('cy', k[1].toFixed(1));
    L.textContent = red() ? 'lightness' : 'atmosphere'; R.textContent = red() ? Math.round((.2 + v * .8) * 100) + '%' : (v < .01 ? 'still' : Math.round(v * 100) + '%');
    [].forEach.call(el.querySelectorAll('[data-i]'), function (n) { var i = +n.getAttribute('data-i'); n.classList.toggle('on', i === sel); n.classList.toggle('here', i === h); });
  }
  function pick(i) { if (i === sel) return; sel = i; if (i >= 0) { GJ.haptic.tick(); if (GJ.dialkit) GJ.dialkit.snap('mark2'); } paint(); }   // a visible snap on each place (dialkit, review B1)
  function go(i) { var id = PLACES[i][0]; close(); if (GJ.mark && GJ.mark.go) GJ.mark.go(id); else app.enter(id); GJ.haptic.commit(); }
  function isOpen() { return html.classList.contains('mark2'); }
  function later() { clearTimeout(hideT); hideT = setTimeout(close, GJ.reduced() ? 9000 : 6000); }
  function openAt(x, y, side) {
    if (isOpen()) close(); O.x = x; O.y = clamp(y, 150, G.innerHeight - 150); O.m = side === 'l' ? -1 : 1; sel = -1; build();
    el.style.left = O.x.toFixed(1) + 'px'; el.style.top = O.y.toFixed(1) + 'px'; paint(); void el.offsetWidth;
    html.classList.add('mark2'); el.setAttribute('aria-hidden', 'false'); GJ.haptic.commit(); later();
  }
  function open() { var p = GJ.moon && GJ.moon.isOn() ? GJ.moon.pos() : null; if (p) openAt(p.x, p.cy, p.side); else openAt(G.innerWidth - 30, G.innerHeight * .55, 'r'); }
  function still() { el.classList.remove('turning'); last = null; }
  function close() { if (!isOpen()) return; clearTimeout(discT); clearTimeout(hideT); drag = null; sel = -1; still(); html.classList.remove('mark2'); el.setAttribute('aria-hidden', 'true'); }

  // one finger, read by how far it is from the middle (which arc) and where along it (the value, the place)
  function at(e) { var dx = (e.clientX - O.x) * O.m, dy = e.clientY - O.y, a = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; return { r: Math.hypot(dx, dy), t: clamp((A0 - a) / SPAN, 0, 1) }; }
  function track(p) {
    var turning = p.r >= 44 && p.r < 122;
    if (p.r < 44 || p.r > HIT + 40) pick(-1);
    else if (turning) { pick(-1); var out = last && p.r > 88 && p.r - last.r > Math.abs(p.t - last.t) * 1.571 * p.r; if (!out) setVal(p.t); }   // a finger on its way out to the places does not drag the arc with it
    else pick(Math.round(p.t * (N - 1)));
    last = p; el.classList.toggle('turning', turning);   // (Gill, 18 Nov 20:30) a dial steps back from what it is changing
  }
  function down(e) {
    if (!isOpen()) return; e.preventDefault(); e.stopPropagation(); try { hit.setPointerCapture(e.pointerId); } catch (x) {} clearTimeout(hideT);
    var p = at(e);
    if (p.r < 34) { drag = { zone: 'mid' }; discT = setTimeout(function () { if (drag && drag.zone === 'mid') { drag = null; close(); GJ.dial.hideNow(); app.tune(true); GJ.haptic.commit(); } }, 550); }
    else { drag = { zone: 'own' }; track(p); }
  }
  function move(e) { if (!drag) return; var p = at(e); if (drag.zone === 'own') track(p); else if (drag.zone === 'mid' && p.r > 48) { clearTimeout(discT); drag.zone = 'none'; } }
  function up() {
    var d = drag; drag = null; clearTimeout(discT); if (!d || !isOpen()) return;
    if (d.zone === 'mid') { close(); GJ.haptic.tick(); if (GJ.moon && GJ.moon.isOn()) GJ.moon.wake(); return; }
    if (d.zone === 'own' && sel >= 0) go(sel); else later(); still();
  }
  document.addEventListener('pointerdown', function (e) { if (isOpen() && !drag && e.target !== hit) close(); }, true);   // a touch anywhere else: away, and the touch still lands
  G.addEventListener('resize', close);
  store.on(function () { if (isOpen()) paint(); });

  GJ.mark2 = { open: open, openAt: openAt, close: close, isOpen: isOpen, places: PLACES, value: val, set: setVal, pick: pick, go: go,
    point: function (i) { var q = pt(RA, pa(i)); return [O.x + q[0], O.y + q[1]]; }, inner: function (t) { var q = pt(RI, A0 - SPAN * t); return [O.x + q[0], O.y + q[1]]; }, origin: function () { return [O.x, O.y, O.m]; },
    state: function () { return { open: isOpen(), ring: red() ? 'lightness' : 'atmosphere', value: val(), sel: sel, here: here() }; } };
})(window);
