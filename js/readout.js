/* tools-02 · the readout (Gill, 17 Nov: "timer count at the top of the sky, in the style of a digital clapper board —
   only the timer's digital readout, not the clapper board itself"). While the timer runs, its count hangs at the top of
   the sky as segment digits — hours : minutes : seconds : frames at 24 — with the unlit segments faintly there, the way
   a slate's readout looks. Two small fields sit under it in the same digits: when the timer ends, and the next light
   (golden hour, or sunset). Drawn segments, not a typeface. Hidden in the timer's own room.
   17 Nov, later (Gill: "make the slate slightly smaller and always red. I want a hold down dial for the slate, light
   settings and other that fit"): its digits are red in every mode, as a slate's are; it is a little smaller; and holding
   it (550 ms, the site's hold) turns the dial into the slate's own — LIGHT ⇅ GLOW outside, SHOWS ⇅ SIZE inside. A tap
   still steps what it shows. While it is up, the word beside the Mark steps aside, so the two never stack.
   Its clock fields (time · sunset · ends) read in the 12-hour clock, with a small am / pm (Gill: "slate clock in 12hr
   clock, option in main site settings"); the option is the whole app's — Tune → Golden hour → Clock, 12 or 24 — so the
   slate and Golden Hour's times always agree. The count itself is a count. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp, html = document.documentElement;
  var NS = 'http://www.w3.org/2000/svg';
  // segments a b c d e f g on a 10 × 18 cell, slanted a touch
  var SEG = { a: 'M2 1h6l-1 1.6h-4z', b: 'M8.4 1.4l.9 .9v6l-.9 .8-.9-.8v-5.4z', c: 'M8.4 9.9l.9 .8v6l-.9 .9-.9-1.3v-5.6z', d: 'M2 17h6l-1-1.6h-4z',
    e: 'M1.6 9.9l.9 .8v5.6l-.9 1.3-.9-.9v-6z', f: 'M1.6 1.4l.9 1.3v5.4l-.9 .8-.9-.8v-6z', g: 'M2.4 8.2h5.2l.9 .8-.9 .8h-5.2l-.9-.8z' };
  var DIG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': '' };
  function cellSVG(x) { var p = ''; for (var k in SEG) p += '<path data-s="' + k + '" d="' + SEG[k] + '" transform="translate(' + x + ',0) skewX(-6)"/>'; return p; }
  function build(el, pattern) {   // pattern: e.g. "88:88:88:88" — digits are cells, ':' a colon
    var x = 0, h = '', cells = [];
    for (var i = 0; i < pattern.length; i++) {
      if (pattern[i] === ':') { h += '<circle class="ro-dot" cx="' + (x + 1.6) + '" cy="6" r=".9"/><circle class="ro-dot" cx="' + (x + .9) + '" cy="12.5" r=".9"/>'; x += 4; }
      else { h += '<g class="ro-c">' + cellSVG(x) + '</g>'; x += 11.5; }
    }
    el.innerHTML = '<svg viewBox="-1 0 ' + (x + 1) + ' 18" aria-hidden="true">' + h + '</svg>';
    return [].slice.call(el.querySelectorAll('.ro-c'));
  }
  function set(cells, str, last) {
    var s = str.replace(/:/g, ''); if (last && last.v === s) return; if (last) last.v = s;
    cells.forEach(function (c, i) { var on = DIG[s[i]] || ''; [].forEach.call(c.children, function (p) { p.classList.toggle('on', on.indexOf(p.dataset.s) >= 0); }); });
  }
  var el = document.createElement('button'); el.id = 'readout'; el.type = 'button'; el.setAttribute('aria-label', 'the timer');
  el.innerHTML = '<div class="ro-main"></div><div class="ro-sub ro-l1"><span><b class="jul">time</b><i class="ro-tod"></i><b class="jul ro-ap"></b></span><span><b class="jul">sunset</b><i class="ro-ss"></i><b class="jul ro-ap"></b></span></div>' +
    '<div class="ro-sub ro-l2"><span><b class="jul">ends</b><i class="ro-end"></i><b class="jul ro-ap"></b></span><span><b class="jul ro-ln">golden</b><i class="ro-gold"></i></span></div>' +
    '<small class="ro-tip jul" aria-hidden="true">hold · its dial</small>';
  document.body.appendChild(el);
  var M = build(el.querySelector('.ro-main'), '88:88:88:88'), E = build(el.querySelector('.ro-end'), '88:88'), Gd = build(el.querySelector('.ro-gold'), '88:88');
  var TD = build(el.querySelector('.ro-tod'), '88:88'), SS = build(el.querySelector('.ro-ss'), '88:88');
  var lm = {}, le = {}, lg = {}, lt = {}, ls = {};
  function two(n) { n = Math.max(0, Math.floor(n)); return (n < 10 ? '0' : '') + n; }
  // a clock time for a field: 12-hour (" 5:28" + pm) unless Tune says 24 ("17:28")
  var shown = {};
  function clock(name, cells, d, last) {
    var h = d.getHours(), m = d.getMinutes(), h12 = store.get().clock !== '24', hh = h % 12 || 12;
    var str = h12 ? (hh < 10 ? ' ' : '') + hh + ':' + two(m) : two(h) + ':' + two(m), ap = h12 ? (h < 12 ? 'am' : 'pm') : '';
    set(cells, str, last); var b = cells[0].closest('span').querySelector('.ro-ap'); if (b && b.textContent !== ap) b.textContent = ap;
    shown[name] = str + (ap ? ' ' + ap : '');
  }
  function remain() { var t = store.get().timer || {}; return t.running ? Math.max(0, t.endAt - Date.now()) : (t.remainMs != null ? t.remainMs : t.setMs || 0); }
  function nextLight() {
    try {
      var e = GJ.rooms.golden && GJ.rooms.golden.state().events, n = Date.now(); if (!e) return null;
      if (e.goldenPmStart && e.goldenPmStart > n) return ['golden', e.goldenPmStart - n];
      if (e.sunset && e.sunset > n) return ['sunset', e.sunset - n];
      if (e.dusk && e.dusk > n) return ['blue', e.dusk - n];
      return null;
    } catch (x) { return null; }
  }
  function tick() {
    var t = store.get().timer || {}, show = !!t.running && GJ.app && GJ.app.room !== 'red' && store.get().readout !== false;
    if (show && !html.classList.contains('readout')) teach();
    html.classList.toggle('readout', show);
    if (!show) return;
    var ms = remain(), h = ms / 3600000, m = ms / 60000 % 60, s = ms / 1000 % 60, f = ms / (1000 / 24) % 24;
    set(M, two(h) + ':' + two(m) + ':' + two(s) + ':' + two(f), lm);
    clock('ends', E, new Date(t.endAt || Date.now()), le);
    clock('time', TD, new Date(), lt);
    try { clock('sunset', SS, new Date(GJ.rooms.golden.state().events.sunset), ls); } catch (x) {}
    var nl = nextLight(), ln = el.querySelector('.ro-ln');
    if (nl) { if (ln.textContent !== nl[0]) ln.textContent = nl[0]; set(Gd, two(nl[1] / 3600000) + ':' + two(nl[1] / 60000 % 60), lg); el.classList.remove('no-light'); }
    else el.classList.add('no-light');
  }
  (function loop() { tick(); setTimeout(function () { requestAnimationFrame(loop); }, html.classList.contains('readout') ? 40 : 400); })();

  /* ---------- its look, kept in the store: light · glow · what it shows · size ---------- */
  var SHOWS_N = ['timer', '+ time · sunset', '+ ends · next light'], SIZE_N = ['small', 'mid', 'large'], SIZE_K = [.76, .87, 1];
  function num(v, d) { return typeof v === 'number' && isFinite(v) ? v : d; }
  function look() {
    var s = store.get();
    return { light: clamp(num(s.slateLight, .86), .2, 1), glow: clamp(num(s.slateGlow, .5), 0, 1), shows: clamp(Math.round(num(s.slateShows, 0)), 0, 2), size: clamp(Math.round(num(s.slateSize, 1)), 0, 2) };
  }
  function paint() {
    var k = look();
    el.style.setProperty('--sl-l', k.light.toFixed(3)); el.style.setProperty('--sl-g', (k.glow * 2).toFixed(3)); el.style.setProperty('--sl-k', SIZE_K[k.size]);
    el.dataset.l = k.shows; el.dataset.z = k.size;
  }
  store.on(paint); paint();

  /* ---------- its dial: hold the slate ---------- */
  var pct = function (v) { return Math.round(v * 100) + '%'; }, round = function (v) { return Math.round(v); };
  var LIGHT = { key: 'slight', label: 'LIGHT', min: .2, max: 1, def: .86, span: 220, unit: .05,
    get: function () { return look().light; }, set: function (v) { store.set({ slateLight: Math.round(v * 100) / 100 }); }, notches: function () { return [.5, .86]; }, fmt: pct };
  var GLOW = { key: 'sglow', label: 'GLOW', min: 0, max: 1, def: .5, span: 220, unit: .05,
    get: function () { return look().glow; }, set: function (v) { store.set({ slateGlow: Math.round(v * 100) / 100 }); }, notches: function () { return [.5]; }, fmt: function (v) { return v < .02 ? 'off' : pct(v); } };
  var SHOWS = { key: 'sshows', label: 'SHOWS', min: 0, max: 2, def: 0, span: 150, unit: 1,
    get: function () { return look().shows; }, set: function (v) { store.set({ slateShows: round(v) }); }, step: round, notches: function () { return [0, 1, 2]; }, fmt: function (v) { return SHOWS_N[round(v)]; } };
  var SIZE = { key: 'ssize', label: 'SIZE', min: 0, max: 2, def: 1, span: 150, unit: 1,
    get: function () { return look().size; }, set: function (v) { store.set({ slateSize: round(v) }); }, step: round, notches: function () { return [0, 1, 2]; }, fmt: function (v) { return SIZE_N[round(v)]; } };
  function openDial() {
    LIGHT.alt = GLOW; GLOW.alt = LIGHT; SHOWS.alt = SIZE; SIZE.alt = SHOWS; GJ.dial.pop([LIGHT, SHOWS]); GJ.dial.raise(0);   // LIGHT is the one the dial shows; SHOWS is the layer under it
    el.classList.remove('tip'); try { localStorage.setItem('gj-slatetip', '9'); } catch (x) {}
  }
  // taught in place: the first few times the slate comes up, a small line under it says how to reach its dial
  var tipT = 0;
  function teach() {
    var n = 0; try { n = +localStorage.getItem('gj-slatetip') || 0; } catch (x) {}
    if (n >= 3) return; try { localStorage.setItem('gj-slatetip', String(n + 1)); } catch (x) {}
    el.classList.add('tip'); clearTimeout(tipT); tipT = setTimeout(function () { el.classList.remove('tip'); }, 4200);
  }
  var hold = null, held = false;
  el.addEventListener('pointerdown', function (e) {
    held = false; hold = { x: e.clientX, y: e.clientY };
    hold.t = setTimeout(function () { hold = null; held = true; GJ.haptic.commit(); openDial(); }, 550);
  });
  el.addEventListener('pointermove', function (e) { if (hold && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) { clearTimeout(hold.t); hold = null; } });
  function letGo() { if (hold) clearTimeout(hold.t); hold = null; }
  el.addEventListener('pointerup', letGo); el.addEventListener('pointercancel', letGo); el.addEventListener('pointerleave', letGo);
  el.addEventListener('contextmenu', function (e) { e.preventDefault(); });   // a long press is the slate's, not the browser's
  // tap: the timer → + time of day and sunset → + ends and the next light → the timer
  el.addEventListener('click', function () { if (held) { held = false; return; } store.set({ slateShows: (look().shows + 1) % 3 }); GJ.haptic.tick(); });
  GJ.readout = { tick: tick, shown: function () { return html.classList.contains('readout'); }, look: look, fields: function () { return shown; }, dial: openDial, rings: function () { return [LIGHT, GLOW, SHOWS, SIZE]; } };
})(window);
