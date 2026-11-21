/* oz next (item 9) · Lean, and the Focus ring — two additions to the Moon dial, from its cards (design/lean, focus-ring).
   Lean (Gill, 20 Nov: from the ring, not the crescent): hold the thin ring round the Moon dial and lean the phone; the
   lean turns the chosen ring (volume · atmosphere · orbit). Let go, it stays. Slide the held finger for the same thing
   without the motion sensor (the touch fallback). Touch always wins: while dial A (the right edge) is held, lean does
   nothing. While the ring is held the sky's ordinary tilt holds still. The crescent itself is left exactly as it was.
   Focus ring: a thin outer ring round the Moon dial; turn it to rack the sky's depth through its layers — near stars ·
   constellations · far dust (sky.env.depth). Not dial A's camera landing depth. Pinch still changes level.
   Tune → Moon dial: Lean on/off, which ring it turns, allow the motion sensor; Focus ring on/off and the depth itself. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, html = document.documentElement, tune = document.getElementById('tune');
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function moon() { return document.getElementById('moonfree'); }
  function pos() { return GJ.moonFree ? GJ.moonFree.pos() : null; }

  /* ---------- dial A held? (any finger on the right-edge dial or the master dial) ---------- */
  var aHeld = {};
  G.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('.gzone, .gdial, #master, .cd-held, #camdial')) aHeld[e.pointerId] = 1; }, true);
  ['pointerup', 'pointercancel'].forEach(function (n) { G.addEventListener(n, function (e) { delete aHeld[e.pointerId]; }, true); });
  function dialAHeld() { return Object.keys(aHeld).length > 0 || !!document.querySelector('.cd-held'); }

  /* ---------- the rings Lean can turn ---------- */
  var RINGS = {
    volume: { label: 'volume', get: function () { return GJ.player ? GJ.player.state().vol : .85; }, set: function (v) { if (GJ.player && GJ.player.setVol) GJ.player.setVol(v); }, min: 0, max: 1, fmt: function (v) { return Math.round(v * 100); } },
    atmosphere: { label: 'atmosphere', get: function () { return store.get().atmos; }, set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().atmos) store.set({ atmos: v }); }, min: 0, max: 1, fmt: function (v) { return Math.round(v * 100); } },
    orbit: { label: 'orbit', get: function () { return app.lookBase || 0; }, set: function (v) { app.lookBase = v; }, min: -1, max: 1, fmt: function (v) { return Math.round(v * 43) + '°'; } }
  };
  var ORDER = ['volume', 'atmosphere', 'orbit'];

  /* ---------- Lean ---------- */
  var plate = document.createElement('div'); plate.id = 'ozlean'; plate.hidden = true; plate.setAttribute('role', 'status');
  plate.innerHTML = '<div class="ln-tabs" role="group" aria-label="which ring the lean turns">' + ORDER.map(function (k) { return '<button type="button" data-ring="' + k + '">' + k + '</button>'; }).join('') + '</div>' +
    '<svg class="ln-ring" viewBox="-60 -60 120 120" aria-hidden="true"><circle r="54"></circle><path class="ln-arc"></path><circle class="ln-dot" r="2.4"></circle></svg>' +
    '<div class="ln-plate"><b class="jul">lean</b><p class="ln-v"></p><p class="ln-h quiet">hold the ring · lean, or slide</p><button type="button" class="ln-allow" hidden>allow lean (motion sensor)</button></div>';
  document.body.appendChild(plate);
  var tilt = { g: null, live: false }, L = null, swallow = false;
  function onOri(e) { if (e.gamma == null) return; tilt.g = e.gamma; tilt.live = true; if (L && L.on && L.g0 == null) { L.g0 = e.gamma; L.v0 = ringNow().get(); L.x0 = L.x; } }
  G.addEventListener('deviceorientation', onOri);
  function askMotion() { var D = G.DeviceOrientationEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().then(function () {}).catch(function () {}); if (GJ.tilt && GJ.tilt.ask) GJ.tilt.ask(); }
  function ringNow() { return RINGS[store.get().leanRing] || RINGS.atmosphere; }
  function paintPlate() {
    if (!L) return; var r = ringNow(), v = r.get(), u = (v - r.min) / (r.max - r.min), p = pos() || { x: G.innerWidth / 2, y: G.innerHeight / 2 };
    plate.querySelectorAll('[data-ring]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.ring === store.get().leanRing ? 'true' : 'false'); });
    plate.querySelector('.ln-v').textContent = r.label + ' ' + r.fmt(v); var svg = plate.querySelector('.ln-ring'); svg.style.left = p.x + 'px'; svg.style.top = p.y + 'px';
    var tabs = plate.querySelector('.ln-tabs'); tabs.style.left = clamp(p.x, 150, G.innerWidth - 150) + 'px'; tabs.style.top = Math.max(60, p.y - 96) + 'px';
    var a0 = -Math.PI * .75, a1 = a0 + u * Math.PI * 1.5, x0 = Math.cos(a0 - Math.PI / 2) * 54, y0 = Math.sin(a0 - Math.PI / 2) * 54, x1 = Math.cos(a1 - Math.PI / 2) * 54, y1 = Math.sin(a1 - Math.PI / 2) * 54;
    plate.querySelector('.ln-arc').setAttribute('d', 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A54 54 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1));
    var d = plate.querySelector('.ln-dot'); d.setAttribute('cx', x1.toFixed(1)); d.setAttribute('cy', y1.toFixed(1));
    plate.querySelector('.ln-allow').hidden = tilt.live;
  }
  function engage() {
    if (!L || L.on) return; if (dialAHeld()) { L = null; return; }
    L.on = true; L.g0 = tilt.g; L.v0 = ringNow().get(); L.x0 = L.x; plate.hidden = false; html.classList.add('leaning'); if (GJ.tilt) GJ.tilt.paused = true; hap('commit'); paintPlate();
  }
  function update() {
    if (!L || !L.on) return; if (dialAHeld()) return;   // touch wins: dial A held, the lean waits
    var r = ringNow(), span = r.max - r.min, d = 0;
    if (tilt.g != null && L.g0 != null) d += (tilt.g - L.g0) / 40 * span;
    d += (L.x - L.x0) / 180 * span;
    r.set(clamp(L.v0 + d, r.min, r.max)); paintPlate();
  }
  function release() { if (!L) return; var was = L.on; L = null; clearTimeout(holdT); if (!was) return;
    plate.hidden = true; html.classList.remove('leaning'); if (GJ.tilt) GJ.tilt.paused = false; hap('tick');
  }
  var holdT = 0;
  G.addEventListener('deviceorientation', function () { if (L && L.on) update(); });
  plate.addEventListener('pointerdown', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); if (b.dataset.ring) { store.set({ leanRing: b.dataset.ring }); if (L) { L.v0 = ringNow().get(); L.x0 = L.x; L.g0 = tilt.g; } paintPlate(); hap('tick'); } if (b.classList.contains('ln-allow')) askMotion(); });

  /* ---------- the Focus ring ---------- */
  var FR = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); FR.id = 'ozfocus'; FR.setAttribute('viewBox', '-100 -100 200 200'); FR.setAttribute('role', 'slider'); FR.setAttribute('aria-label', 'Focus ring: sky depth'); FR.setAttribute('tabindex', '0');
  var TICKS = ''; for (var i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2, r0 = i % 4 ? 88 : 84; TICKS += '<line x1="' + (Math.cos(a) * r0).toFixed(1) + '" y1="' + (Math.sin(a) * r0).toFixed(1) + '" x2="' + (Math.cos(a) * 92).toFixed(1) + '" y2="' + (Math.sin(a) * 92).toFixed(1) + '"></line>'; }
  FR.innerHTML = '<circle class="fr-hit" r="90"></circle><circle class="fr-line" r="90"></circle><g class="fr-ticks">' + TICKS + '</g><path class="fr-mark" d="M0 -95 l-4 -7 h8 z"></path>' +
    '<g class="fr-words"><text x="-62" y="-70">near</text><text x="66" y="-24">figures</text><text x="-6" y="104">dust</text></g>';
  document.body.appendChild(FR);
  var fplate = document.createElement('div'); fplate.id = 'ozfocus-plate'; fplate.hidden = true; fplate.setAttribute('role', 'status'); fplate.innerHTML = '<b class="jul">focus</b><p></p><p class="quiet">turn the ring around the moon</p>'; document.body.appendChild(fplate);
  var WORDS = [[-1, 'near stars'], [0, 'constellations'], [1, 'far dust']];
  function word(v) { var w = v < -.33 ? 'near stars' : v > .33 ? 'far dust' : 'constellations'; return w + (Math.abs(Math.abs(v) - (w === 'constellations' ? 0 : 1)) > .08 ? ' (racking)' : ''); }
  function depthName(v) { return v < -.33 ? 'near' : v > .33 ? 'far' : 'mid'; }
  var turn = null;
  function angle(e) { var r = FR.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); }
  FR.addEventListener('pointerdown', function (e) { if (!e.target.classList.contains('fr-hit')) return; e.stopPropagation(); e.preventDefault(); try { FR.setPointerCapture(e.pointerId); } catch (x) {}
    turn = { a: angle(e), v: store.get().focusDepth || 0, id: e.pointerId, sx: e.clientX, sy: e.clientY, live: false };
    if (store.get().lean) { L = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, on: false }; clearTimeout(holdT); holdT = setTimeout(function () { if (turn && !turn.live) { engage(); if (L && L.on) { FR.classList.add('leaning'); } } }, 420); } });
  FR.addEventListener('pointermove', function (e) { if (!turn || e.pointerId !== turn.id) return;
    if (L && L.on) { L.x = e.clientX; L.y = e.clientY; update(); return; }   // holding for Lean: the slide is the touch fallback
    if (!turn.live) { if (Math.hypot(e.clientX - turn.sx, e.clientY - turn.sy) < 6) return; turn.live = true; clearTimeout(holdT); L = null; FR.classList.add('turning'); fplate.hidden = false; paintFocus(); hap('tick'); turn.a = angle(e); }
    var a = angle(e), d = a - turn.a; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; turn.a = a;
    var v = clamp(turn.v + d / (Math.PI * .9), -1, 1); [-1, 0, 1].forEach(function (s) { if (Math.abs(v - s) < .06 && Math.abs(turn.v - s) >= .06) hap('tick'); }); turn.v = v; store.set({ focusDepth: Math.round(v * 100) / 100 }); paintFocus(); });
  function endTurn(e) { if (!turn || (e && e.pointerId !== turn.id)) return; clearTimeout(holdT); FR.classList.remove('leaning'); if (L) { var wasLean = L.on; release(); if (wasLean) { turn = null; return; } } if (!turn.live) { turn = null; return; } var v = turn.v, s = Math.round(v); if (Math.abs(v - s) < .12) store.set({ focusDepth: s }); turn = null; FR.classList.remove('turning'); setTimeout(function () { if (!turn) fplate.hidden = true; }, 1400); paintFocus(); }
  FR.addEventListener('pointerup', endTurn); FR.addEventListener('pointercancel', endTurn);
  FR.addEventListener('keydown', function (e) { var v = store.get().focusDepth || 0; if (e.key === 'ArrowRight' || e.key === 'ArrowUp') store.set({ focusDepth: clamp(Math.round(v) + 1, -1, 1) }); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') store.set({ focusDepth: clamp(Math.round(v) - 1, -1, 1) }); });
  function paintFocus() { var v = store.get().focusDepth || 0; FR.querySelector('.fr-ticks').setAttribute('transform', 'rotate(' + (v * 120).toFixed(1) + ')'); FR.setAttribute('aria-valuetext', word(v)); FR.setAttribute('aria-valuenow', v); FR.setAttribute('aria-valuemin', -1); FR.setAttribute('aria-valuemax', 1); fplate.querySelector('p').textContent = word(v); }
  function place() {   // round the Moon dial while it sits on the sky as a crescent or full moon; not as a dot, not unfolded, not mid-drag, not in a room
    var p = pos(), m = moon(), show = store.get().focusRing && p && m && !app.room && (p.state === 'crescent' || p.state === 'full') && p.side !== 'l' && p.side !== 'r' && !m.classList.contains('drag') && !html.classList.contains('tune') && (!html.classList.contains('leaning') || FR.classList.contains('leaning'));
    FR.classList.toggle('on', !!show); if (show) { FR.style.left = p.x + 'px'; FR.style.top = p.y + 'px'; }
    if (GJ.sky && GJ.sky.env) { var t = store.get().focusDepth || 0; GJ.sky.env.depth += (t - GJ.sky.env.depth) * .18; if (Math.abs(GJ.sky.env.depth - t) < .002) GJ.sky.env.depth = t; }
    if (L && L.on) paintPlate();
    requestAnimationFrame(place);
  }
  requestAnimationFrame(place); store.on(paintFocus); paintFocus();

  /* ---------- Tune → Moon dial ---------- */
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  function paintTune() { var s = store.get(); T('lean', s.lean ? 'on' : 'off'); T('leanring', s.leanRing || 'atmosphere'); T('focusring', s.focusRing ? 'on' : 'off'); T('focusdepth', depthName(s.focusDepth || 0)); T('leanallow', tilt.live ? 'allowed' : 'allow'); }
  store.on(paintTune); paintTune();
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, s = store.get();
    if (k === 'lean') store.set({ lean: !s.lean });
    if (k === 'leanring') store.set({ leanRing: ORDER[(ORDER.indexOf(s.leanRing) + 1) % ORDER.length] });
    if (k === 'leanallow') { askMotion(); setTimeout(paintTune, 2200); }
    if (k === 'focusring') store.set({ focusRing: !s.focusRing });
    if (k === 'focusdepth') { var n = depthName(s.focusDepth || 0), L3 = ['near', 'mid', 'far']; store.set({ focusDepth: L3.indexOf(L3[(L3.indexOf(n) + 1) % 3]) - 1 }); } });
  GJ.lean = { state: function () { return { on: !!(L && L.on), ring: store.get().leanRing, value: ringNow().get(), sensor: tilt.live }; }, _feed: function (g) { onOri({ gamma: g }); if (L && L.on) update(); } };
  GJ.focusRing = { depth: function () { return store.get().focusDepth || 0; }, word: function () { return word(store.get().focusDepth || 0); }, shown: function () { return FR.classList.contains('on'); }, set: function (v) { store.set({ focusDepth: clamp(v, -1, 1) }); } };
})(window);
