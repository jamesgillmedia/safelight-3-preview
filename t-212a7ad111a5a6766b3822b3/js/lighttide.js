/* oz one (r4, item 16) · the Light-tide clock — the dedicated lighting control. Lighting is the quality of the light, not
   the weather's effects (those are the ✨ dial's). One hand in today's cycle of light for the city: blue hour · sun ·
   golden · night, creeping with real time. Drag the hand to scrub the day and the sky follows; let go and it eases back to
   now — or hold a chosen time instead of live. Inner rings: warmth · light angle (0–360°, from 210°) · room wash (a hand
   override of the sky's wash; auto gives it back) · and, in a room with its own lamp, that lamp.
   Opens from the left edge (the light edge; the red-mode dimmer still shows there in red mode) and from the light button
   beside the dot. The Safelight tuning and day mode are not here (Tune → Red mode, and the dot's pad).
   It changes the sky and the room only — never a file, never a photo or a video.
     GJ.lightTide.open() · close() · isOpen() · at() (the scrubbed or held time, ms, or null) */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, clamp = GJ.clamp;
  function S() { return store.get(); }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function city() { return GJ.Sun.CITIES[S().city] || GJ.Sun.CITIES.vancouver; }
  var HR = 3600000, isOpen = false, scrub = null, held = null, ease = null;
  var LT = { warmth: 0, angle: 210, angleAuto: true, wash: 'auto' };
  try { var sv = JSON.parse(GJ.settings.getItem('gj-lighttide') || 'null'); if (sv) LT = Object.assign(LT, sv); } catch (e) {}
  function keep() { try { GJ.settings.setItem('gj-lighttide', JSON.stringify(LT)); } catch (e) {} }

  /* ---------- today's light, from the city's sun ---------- */
  var evK = '', ev = null;
  function today(ms) { var c = city(), k = c.id + new Date(ms).toDateString(); if (k !== evK) { evK = k; ev = GJ.Sun.events(ms, c); } return ev; }
  function phases(e) { return [
    ['night', e.dayStart, e.dawn, [52, 64, 120]], ['blue', e.dawn, e.sunrise, [78, 120, 205]], ['golden', e.sunrise, e.goldenAmEnd, [236, 182, 102]],
    ['sun', e.goldenAmEnd, e.goldenPmStart, [244, 236, 214]], ['golden', e.goldenPmStart, e.sunset, [236, 182, 102]], ['blue', e.sunset, e.dusk, [78, 120, 205]],
    ['night', e.dusk, e.dayStart + 24 * HR, [52, 64, 120]]].filter(function (p) { return p[1] != null && p[2] != null; }); }
  function phaseAt(ms) { var e = today(ms), P = phases(e); for (var i = 0; i < P.length; i++) if (ms >= P[i][1] && ms < P[i][2]) return { p: P[i], next: P[i + 1] || P[0], i: i }; return { p: P[0], next: P[1], i: 0 }; }
  function at() { return scrub != null ? scrub : held != null ? held : ease != null ? ease : null; }
  function shown() { var a = at(); return a == null ? Date.now() : a; }
  function dur(ms) { var m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + 'h ' + ('0' + m % 60).slice(-2) + 'm' : m + 'm'; }

  /* ---------- the sky follows: the sun (scrubbed or held), warmth, light angle, wash ---------- */
  var room0 = GJ.sky && GJ.sky.setRoom, roomAsk = null;
  if (GJ.sky && room0) GJ.sky.setRoom = function (o) { roomAsk = o; apply(); };   // a room's own lean still counts, unless the hand overrides it
  function apply() {
    if (!GJ.sky || !room0) return;
    var w = { warm: 0, grey: 0, light: 0 }, r = roomAsk || {};
    if (LT.wash === 'auto') { w.warm = r.warm || 0; w.grey = r.grey || 0; w.light = r.light || 0; }
    else if (LT.wash === 'warm') w.warm = .8; else if (LT.wash === 'grey') w.grey = .8; else if (LT.wash === 'light') w.light = .7;
    w.warm = clamp(w.warm + LT.warmth * .7, -1, 1);
    room0(w.warm || w.grey || w.light ? w : null);
  }
  var lastSky = 0;
  function sun() {   // drive the sky's sun from the chosen time; when live, the shell's own once-a-while update stands
    var a = at(), sky = GJ.sky; if (!sky) return;
    if (a != null) { var c = city(), p = GJ.Sun.position(a, c.lat, c.lon); GJ.aim(sky.golden.sun, p.alt, true); GJ.aim(sky.golden.sunAz, LT.angleAuto ? p.az : LT.angle, true); lastSky = 1; }
    else if (lastSky) { lastSky = 0; if (GJ.app && GJ.app.envRefresh) GJ.app.envRefresh(); }
    if (a == null && !LT.angleAuto) GJ.aim(sky.golden.sunAz, LT.angle, true);
  }

  /* ---------- the clock ---------- */
  var P = document.createElement('section'); P.id = 'lt'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'light-tide clock'); P.hidden = true;
  P.innerHTML = '<div class="lt-card"><header><b class="jul">light-tide</b><button type="button" class="lt-hold" aria-pressed="false">live</button></header>' +
    '<canvas class="lt-cv" role="slider" tabindex="0" aria-label="the hour of today\'s light: drag to scrub"></canvas>' +
    '<p class="lt-read" aria-live="polite"></p>' +
    '<div class="lt-rings">' +
    '<div class="lt-ring"><b>warmth</b><span class="lt-seg" data-r="warmth"><button data-v="-1">cool</button><button data-v="0">even</button><button data-v="1">warm</button></span></div>' +
    '<div class="lt-ring"><b>light angle</b><input type="range" min="0" max="355" step="5" data-r="angle" aria-label="light angle"><button type="button" class="lt-auto" data-r="angleAuto">auto</button><i class="lt-ang"></i></div>' +
    '<div class="lt-ring"><b>room wash</b><span class="lt-seg" data-r="wash"><button data-v="auto">auto</button><button data-v="warm">warm</button><button data-v="grey">grey</button><button data-v="light">light</button></span></div>' +
    '<div class="lt-ring lt-lamp" hidden><b>room lamp</b><span class="lt-seg" data-r="lamp"><button data-v=".5">low</button><button data-v=".86">mid</button><button data-v="1">full</button></span></div>' +
    '</div><p class="lt-foot">the sky and the room only · never a photo</p></div>';
  document.body.appendChild(P);
  var card = P.querySelector('.lt-card'), cv = P.querySelector('.lt-cv'), cx = cv.getContext('2d'), read = P.querySelector('.lt-read'), holdB = P.querySelector('.lt-hold');
  function th(ms) { var e = today(ms); return -Math.PI / 2 + ((ms - e.dayStart) / HR - 12) / 24 * Math.PI * 2; }   // noon at the top, midnight at the foot
  function msAt(x, y) { var r = cv.getBoundingClientRect(), a = Math.atan2(y - r.top - r.height / 2, x - r.left - r.width / 2), h = ((((a + Math.PI / 2) / (Math.PI * 2) * 24 + 12) % 24) + 24) % 24; return today(Date.now()).dayStart + h * HR; }
  function ink(a) { return S().red ? 'rgba(255,68,87,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function tone(c, a) { return S().red ? 'rgba(255,68,87,' + (a * (.3 + .7 * (c[0] * .3 + c[1] * .55 + c[2] * .15) / 255)).toFixed(3) + ')' : 'rgba(' + c.join(',') + ',' + a + ')'; }
  var lastP = -1, lastH = -1;
  function draw() {
    if (!isOpen) return;
    // ease back to now after a scrub
    if (ease != null) { var nw = Date.now(), d = nw - ease; ease += d * .06; if (Math.abs(nw - ease) < 30000) ease = null; }
    sun();
    var dpr = Math.min(2, G.devicePixelRatio || 1), r = cv.getBoundingClientRect(); if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    var W = r.width, H = r.height, c0 = W / 2, c1 = H / 2, R = Math.min(W, H) / 2 - 26, ms = shown(), e = today(ms), PH = phases(e), cur = phaseAt(ms);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    cx.beginPath(); cx.arc(c0, c1, R - 4, 0, 6.283); cx.fillStyle = S().red ? 'rgba(10,2,4,.5)' : 'rgba(5,8,16,.42)'; cx.fill();
    PH.forEach(function (p) { cx.beginPath(); cx.arc(c0, c1, R, th(p[1]), th(p[2])); cx.strokeStyle = tone(p[3], p === cur.p ? .92 : .42); cx.lineWidth = p === cur.p ? 8 : 6; cx.stroke(); });
    for (var i = 0; i < 24; i++) { var a = -Math.PI / 2 + (i - 12) / 24 * 6.283, r1 = R - 12, r2 = R - (i % 6 ? 17 : 23); cx.beginPath(); cx.moveTo(c0 + Math.cos(a) * r1, c1 + Math.sin(a) * r1); cx.lineTo(c0 + Math.cos(a) * r2, c1 + Math.sin(a) * r2); cx.strokeStyle = ink(i % 6 ? .26 : .55); cx.lineWidth = 1; cx.stroke(); }
    cx.font = '400 8.5px "Julius Sans One", Poppins, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = ink(.6); cx.fillText('NOON', c0, c1 - R - 10); cx.fillText('MIDNIGHT', c0, c1 + R + 16);
    var nowA = th(Date.now()); cx.beginPath(); cx.arc(c0 + Math.cos(nowA) * (R + 8), c1 + Math.sin(nowA) * (R + 8), 2.2, 0, 6.283); cx.fillStyle = ink(.85); cx.fill();
    cx.beginPath(); cx.arc(c0, c1, R - 30, th(ms), th(cur.p[2])); cx.strokeStyle = ink(.5); cx.lineWidth = 1.3; cx.stroke();   // to the next change
    var ha = th(ms); cx.lineCap = 'round'; cx.strokeStyle = ink(.95); cx.lineWidth = 1.7; cx.beginPath(); cx.moveTo(c0 - Math.cos(ha) * R * .16, c1 - Math.sin(ha) * R * .16); cx.lineTo(c0 + Math.cos(ha) * R * .84, c1 + Math.sin(ha) * R * .84); cx.stroke();
    cx.fillStyle = tone(cur.p[3], 1); cx.beginPath(); cx.arc(c0 + Math.cos(ha) * R * .84, c1 + Math.sin(ha) * R * .84, 4, 0, 6.283); cx.fill();
    cx.beginPath(); cx.arc(c0, c1, 4.4, 0, 6.283); cx.fillStyle = S().red ? '#140302' : '#0b1020'; cx.fill(); cx.strokeStyle = ink(.8); cx.lineWidth = 1.1; cx.stroke(); cx.lineCap = 'butt';
    var t = GJ.Sun.fmt12 ? GJ.Sun.fmt12(ms, city()) : GJ.Sun.fmt(ms, city());
    cx.font = '400 19px "Julius Sans One", Poppins, sans-serif'; cx.fillStyle = ink(.95); cx.fillText(t, c0, c1 + R * .44);
    cx.font = '400 8px "Julius Sans One", Poppins, sans-serif'; cx.fillStyle = ink(.55); cx.fillText(at() == null ? 'NOW' : held != null ? 'HELD' : 'SCRUBBED', c0, c1 + R * .44 + 17);
    cx.font = '400 11px "Julius Sans One", Poppins, sans-serif'; cx.fillStyle = tone(cur.p[3], .95); cx.fillText(cur.p[0].toUpperCase(), c0, c1 - R * .36);
    var line = cur.p[0] + ' · ' + cur.next[0] + ' in ' + dur(cur.p[2] - ms) + ' · ' + city().name; if (read.textContent !== line) read.textContent = line;
    cv.setAttribute('aria-valuetext', t + ', ' + line);
    if (scrub != null) { var hh = Math.floor((ms - e.dayStart) / HR); if (hh !== lastH) { lastH = hh; hap('tick'); } if (cur.i !== lastP) { lastP = cur.i; hap('commit'); } }
    requestAnimationFrame(draw);
  }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} ease = null; scrub = msAt(e.clientX, e.clientY); });
  cv.addEventListener('pointermove', function (e) { if (scrub == null) return; var m = msAt(e.clientX, e.clientY), d = m - scrub; if (d > 12 * HR) m -= 24 * HR; if (d < -12 * HR) m += 24 * HR; scrub = m; });
  function let_() { if (scrub == null) return; if (holdB.getAttribute('aria-pressed') === 'true') held = scrub; else ease = scrub; scrub = null; }
  cv.addEventListener('pointerup', let_); cv.addEventListener('pointercancel', let_);
  cv.addEventListener('keydown', function (e) { var base = shown(); if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { held = base + HR / 2; } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { held = base - HR / 2; } paintRows(); });
  holdB.addEventListener('click', function () { var on = holdB.getAttribute('aria-pressed') !== 'true'; holdB.setAttribute('aria-pressed', on ? 'true' : 'false'); holdB.textContent = on ? 'held' : 'live'; if (on) held = shown(); else { if (held != null) ease = held; held = null; } hap('tick'); });

  /* ---------- the inner rings ---------- */
  function paintRows() {
    [].forEach.call(P.querySelectorAll('.lt-seg'), function (sg) { var k = sg.dataset.r, v = k === 'lamp' ? String(S().slateLight) : String(LT[k]);
      [].forEach.call(sg.children, function (b) { var on = k === 'lamp' ? Math.abs(+b.dataset.v - S().slateLight) < .07 : b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); });
    var rg = P.querySelector('input[data-r="angle"]'); rg.value = LT.angle; rg.disabled = false; P.querySelector('.lt-ang').textContent = LT.angleAuto ? 'from the sun' : LT.angle + '°';
    var au = P.querySelector('.lt-auto'); au.setAttribute('aria-pressed', LT.angleAuto ? 'true' : 'false');
    P.querySelector('.lt-lamp').hidden = !(GJ.app && GJ.app.room === 'red');
  }
  P.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var sg = b.closest('.lt-seg');
    if (sg) { var k = sg.dataset.r; if (k === 'lamp') store.set({ slateLight: +b.dataset.v }); else { LT[k] = k === 'warmth' ? +b.dataset.v : b.dataset.v; keep(); apply(); } hap('tick'); paintRows(); }
    if (b.classList.contains('lt-auto')) { LT.angleAuto = !LT.angleAuto; keep(); if (LT.angleAuto && GJ.app.envRefresh) GJ.app.envRefresh(); hap('tick'); paintRows(); }
  });
  P.querySelector('input[data-r="angle"]').addEventListener('input', function () { LT.angle = +this.value; LT.angleAuto = false; keep(); sun(); paintRows(); });
  P.addEventListener('pointerdown', function (e) { if (!card.contains(e.target)) close(); });

  /* ---------- the light edge: a quiet tab low on the left (a tap — the edge's swipe stays Back) ---------- */
  var tab = document.createElement('button'); tab.type = 'button'; tab.id = 'lt-edge'; tab.setAttribute('aria-label', 'light-tide clock: today\'s light'); tab.innerHTML = '<i aria-hidden="true"></i>';
  document.body.appendChild(tab);
  tab.addEventListener('click', function (e) { e.stopPropagation(); open(); });
  tab.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

  function open() { if (isOpen) return; isOpen = true; P.hidden = false; paintRows(); requestAnimationFrame(function () { P.classList.add('in'); requestAnimationFrame(draw); }); hap('commit'); }
  function close() { if (!isOpen) return; isOpen = false; P.classList.remove('in'); if (scrub != null) { scrub = null; } if (held == null) { ease = null; sun(); } setTimeout(function () { if (!isOpen) P.hidden = true; }, 400); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (isOpen) { close(); return true; } return ca0.apply(this, arguments); }; }
  apply(); setInterval(function () { if (!isOpen && held != null) sun(); }, 5000);
  GJ.lightTide = { open: open, close: close, isOpen: function () { return isOpen; }, at: at, state: function () { return Object.assign({ held: held, scrub: scrub }, LT); },
    set: function (o) { Object.assign(LT, o); keep(); apply(); sun(); paintRows(); }, release: function () { held = null; holdB.setAttribute('aria-pressed', 'false'); holdB.textContent = 'live'; if (GJ.app.envRefresh) GJ.app.envRefresh(); } };
})(window);
