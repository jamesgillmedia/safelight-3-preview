/* oz one (r4, item 15) · the ✨ Environment dial — the hand on the living sky. Separate from the right-edge camera dial.
   Opens from the small ✨ on the sky and the same ✨ on the Moon dial's rest face. The ✨ marks environment controls only.
   Dial A's grammar, unchanged: a tap unfolds a 3D constellation of layers (one ring per layer, each choice a star, the
   chosen stars joined by a hairline figure); a one-finger drag orbits it and it springs back flat; a slide on the track
   turns the layer in focus. Draw from star to star and the whole environment is kept as a named look.
     first ring: atmosphere · stars · fog · water · wind (live / by hand) · grain (off by default)
     fine:       star size · star glow · lines · ripples · swell · particles · touch bloom · vignette · moon · weather
   It changes the sky only — never a photo or a video. GJ.env.open() · close() · isOpen() · looks() · save(name) · recall(i) */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, clamp = GJ.clamp;
  function S() { return store.get(); }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }

  /* ---------- the layers: where each reads and writes (the sky's public keys) ---------- */
  function num(k) { return { get: function () { return S()[k]; }, set: function (v) { var o = {}; o[k] = v; store.set(o); } }; }
  var water = { get: function () { var s = S(); return s.reflect === false ? 'off' : s.ripples === false ? 'still' : 'ripples'; },
    set: function (v) { store.set(v === 'off' ? { reflect: false, ripples: false } : v === 'still' ? { reflect: true, ripples: false } : { reflect: true, ripples: true }); } };
  var moon = { get: function () { var s = S(); return s.moon === false ? 'off' : s.moonMode === 'phase' ? 'tonight' : 'crescent'; },
    set: function (v) { store.set(v === 'off' ? { moon: false } : { moon: true, moonMode: v === 'tonight' ? 'phase' : 'crescent' }); } };
  var wx = { get: function () { return S().wxlive === false ? 'clear' : 'live'; }, set: function (v) { store.set({ wxlive: v === 'live' }); } };
  var FIRST = [
    { k: 'atmos', name: 'atmosphere', io: num('atmos'), opts: [[0, 'still'], [.5, 'calm'], [1, 'living']] },
    { k: 'density', name: 'stars', io: num('density'), opts: [[.45, 'few'], [.7, 'some'], [1, 'all']] },
    { k: 'fog', name: 'fog', io: num('fog'), opts: [[0, 'off'], [.5, 'light'], [1, 'full']] },
    { k: 'water', name: 'water', io: water, opts: [['off', 'off'], ['still', 'still'], ['ripples', 'ripples']] },
    { k: 'wind', name: 'wind', io: num('wind'), opts: [[0, 'still'], [.4, 'breezy'], [1, 'strong']], toggle: 'windLive' },
    { k: 'grain', name: 'grain', io: num('grain'), opts: [[0, 'off'], [.5, 'fine'], [1, 'full']] }
  ];
  var FINE = [
    { k: 'starSize', name: 'star size', io: num('starSize'), opts: [[.7, 'small'], [1, 'mid'], [1.5, 'large']] },
    { k: 'starGlow', name: 'star glow', io: num('starGlow'), opts: [[.4, 'soft'], [1, 'mid'], [1.7, 'bright']] },
    { k: 'lineBright', name: 'lines', io: num('lineBright'), opts: [[.4, 'faint'], [1, 'mid'], [1.8, 'bright']] },
    { k: 'rippleAmt', name: 'ripples', io: num('rippleAmt'), opts: [[.5, 'small'], [1, 'mid'], [1.7, 'large']] },
    { k: 'swell', name: 'swell', io: num('swell'), opts: [[0, 'calm'], [.5, 'gentle'], [1, 'heavy']] },
    { k: 'particles', name: 'particles', io: num('particles'), opts: [[0, 'off'], [.5, 'some'], [1, 'many']] },
    { k: 'bloom', name: 'touch bloom', io: num('bloom'), opts: [[0, 'off'], [1, 'on'], [1.6, 'wide']] },
    { k: 'vignette', name: 'vignette', io: num('vignette'), opts: [[0, 'off'], [.4, 'soft'], [.8, 'deep']] },
    { k: 'moon', name: 'moon', io: moon, opts: [['crescent', 'crescent'], ['tonight', 'tonight'], ['off', 'off']] },
    { k: 'wxlive', name: 'weather', io: wx, opts: [['live', 'live'], ['clear', 'clear']] }
  ];
  var ALL = FIRST.concat(FINE);
  function idx(L) { var v = L.io.get(), bi = 0, bd = 1e9; L.opts.forEach(function (o, i) { var d = typeof o[0] === 'number' ? Math.abs(o[0] - v) : (o[0] === v ? 0 : 1e6); if (d < bd) { bd = d; bi = i; } }); return bi; }
  function snapshot() { var o = {}; ALL.forEach(function (L) { o[L.k] = L.io.get(); }); o.windLive = S().windLive; return o; }
  function applyLook(v) { ALL.forEach(function (L) { if (v[L.k] != null) L.io.set(v[L.k]); }); if (v.windLive != null) store.set({ windLive: v.windLive }); }

  /* ---------- the sky's finer layers, and the overlays (grain, particles, vignette) on the sky only ---------- */
  var stage = document.getElementById('stage') || document.body;
  var gr = document.createElement('canvas'); gr.id = 'env-grain'; gr.setAttribute('aria-hidden', 'true');
  var pt = document.createElement('canvas'); pt.id = 'env-motes'; pt.setAttribute('aria-hidden', 'true');
  var vg = document.createElement('div'); vg.id = 'env-vig'; vg.setAttribute('aria-hidden', 'true');
  stage.appendChild(pt); stage.appendChild(gr); stage.appendChild(vg);
  var noise = document.createElement('canvas'); noise.width = noise.height = 160;
  (function () { var g = noise.getContext('2d'), d = g.createImageData(160, 160); for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); })();
  var motes = []; for (var m = 0; m < 70; m++) motes.push({ x: Math.random(), y: Math.random() * .8, r: .5 + Math.random() * 1.4, s: .3 + Math.random() * .7, p: Math.random() * 6.28 });
  function sky() {
    var s = S(), k = GJ.sky; if (!k || !k.env) return;
    k.env.size = s.starSize; k.env.glow = s.starGlow; k.env.line = s.lineBright; k.env.rip = s.rippleAmt; k.env.swell = s.swell; k.env.bloom = s.bloom;
    k.env.wind = s.windLive === false ? s.wind : null;
    vg.style.opacity = s.vignette; gr.style.opacity = (s.grain * .16).toFixed(3);
  }
  store.on(sky); sky();
  var lastG = 0, lastT = GJ.now();
  function overlays() {
    var s = S(), now = GJ.now(), dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    var W = G.innerWidth, H = G.innerHeight, dpr = Math.min(2, G.devicePixelRatio || 1);
    if (s.grain > .01 && now - lastG > 80) {   // grain: a fresh scatter about twelve times a second
      lastG = now; if (gr.width !== Math.round(W * dpr / 2)) { gr.width = Math.round(W * dpr / 2); gr.height = Math.round(H * dpr / 2); }
      var g = gr.getContext('2d'); for (var y = 0; y < gr.height; y += 160) for (var x = 0; x < gr.width; x += 160) g.drawImage(noise, (Math.random() * 160) | 0, (Math.random() * 160) | 0, 160, 160, x, y, 160, 160);
    }
    gr.style.display = s.grain > .01 ? '' : 'none';
    pt.style.display = s.particles > .01 ? '' : 'none';
    if (s.particles > .01) {
      if (pt.width !== Math.round(W * dpr)) { pt.width = Math.round(W * dpr); pt.height = Math.round(H * dpr); }
      var c = pt.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      var wind = s.windLive === false ? s.wind : .35, n = Math.round(motes.length * s.particles), red = !!s.red;
      for (var i = 0; i < n; i++) { var q = motes[i]; q.x += dt * (.004 + wind * .03) * q.s; q.y += dt * .004 * Math.sin(now / 1000 + q.p); if (q.x > 1.02) q.x = -.02;
        c.fillStyle = red ? 'rgba(255,68,87,' + (.18 + .25 * q.s) + ')' : 'rgba(232,228,220,' + (.14 + .22 * q.s) + ')'; c.beginPath(); c.arc(q.x * W, q.y * H, q.r, 0, 6.283); c.fill(); }
    }
    requestAnimationFrame(overlays);
  }
  requestAnimationFrame(overlays);

  /* ---------- the ✨ buttons: on the sky, and on the Moon dial's rest face ---------- */
  var spark = document.createElement('button'); spark.type = 'button'; spark.id = 'env-spark'; spark.className = 'env-spark';
  spark.setAttribute('aria-label', 'environment dial: atmosphere, stars, fog, water, wind, grain'); spark.innerHTML = '<span aria-hidden="true">✨</span>';
  document.body.appendChild(spark);
  spark.addEventListener('click', function (e) { e.stopPropagation(); open(); });
  var mspark = document.createElement('button'); mspark.type = 'button'; mspark.className = 'env-spark env-mspark'; mspark.setAttribute('aria-label', 'environment dial');
  mspark.innerHTML = '<span aria-hidden="true">✨</span>';
  function seatMoon() { var mf = document.getElementById('moonfree'); if (mf && mspark.parentNode !== mf) mf.appendChild(mspark); }
  seatMoon(); setTimeout(seatMoon, 1200);
  mspark.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  mspark.addEventListener('click', function (e) { e.stopPropagation(); open(); });
  function sparks(s) { html.classList.toggle('env-nospark', s.mnSpark === false); }
  store.on(sparks); sparks(S());

  /* ---------- the dial, unfolded ---------- */
  var P = document.createElement('section'); P.id = 'env'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'environment dial'); P.hidden = true;
  P.innerHTML = '<div class="env-card"><header><b class="jul">✨ environment</b><span class="env-faces" role="tablist"><button type="button" data-face="first" aria-selected="true">layers</button><button type="button" data-face="fine" aria-selected="false">fine</button></span></header>' +
    '<canvas class="env-cv" aria-hidden="true"></canvas>' +
    '<div class="env-focus"><button type="button" class="env-fname" aria-label="the layer in focus"></button><div class="env-track" role="slider" tabindex="0" aria-label="turn the layer in focus"><i></i><b></b></div><span class="env-fval"></span></div>' +
    '<div class="env-row"><button type="button" class="env-live" aria-pressed="true">wind · live</button><span class="env-hint">drag to orbit · tap a star · draw star to star to keep a look</span></div>' +
    '<div class="env-looks" aria-label="saved looks"></div></div>';
  document.body.appendChild(P);
  var card = P.querySelector('.env-card'), cv = P.querySelector('.env-cv'), cx = cv.getContext('2d'), fname = P.querySelector('.env-fname'), fval = P.querySelector('.env-fval'), track = P.querySelector('.env-track');
  var face = 'first', focus = 0, isOpen = false, unf = GJ.S(0, 9), rx = GJ.S(0, 9), ry = GJ.S(0, 9), drag = null, stars = [], figure = [], lastDraw = 0;
  // a real list for VoiceOver: every layer and its choices, as plain buttons (the canvas is only a picture)
  var a11y = document.createElement('div'); a11y.className = 'env-sr'; card.appendChild(a11y);
  function layers() { return face === 'first' ? FIRST : FINE; }
  function fillA11y() { a11y.innerHTML = layers().map(function (L) { var c = idx(L); return '<div role="group" aria-label="' + L.name + '">' + L.opts.map(function (o, j) { return '<button type="button" data-k="' + L.k + '" data-j="' + j + '" aria-pressed="' + (j === c) + '">' + L.name + ': ' + o[1] + '</button>'; }).join('') + '</div>'; }).join(''); }
  a11y.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; var L = ALL.filter(function (x) { return x.k === b.dataset.k; })[0]; L.io.set(L.opts[+b.dataset.j][0]); fillA11y(); });
  function size() { var r = cv.getBoundingClientRect(), d = Math.min(2, G.devicePixelRatio || 1); if (cv.width !== Math.round(r.width * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); } return { W: r.width, H: r.height, d: d }; }
  function ink(a) { return S().red ? 'rgba(255,68,87,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function draw() {
    if (!isOpen && unf.x < .01) return;
    var dt = 1 / 60; GJ.sstep(unf, dt); GJ.sstep(rx, dt); GJ.sstep(ry, dt);
    var z = size(), W = z.W, H = z.H, L = layers(), n = L.length, u = clamp(unf.x, 0, 1.2);
    cx.setTransform(z.d, 0, 0, z.d, 0, 0); cx.clearRect(0, 0, W, H);
    var f = 520, gap = Math.min(30, (H - 24) / n), y0 = H / 2 - gap * (n - 1) / 2, sp = Math.min(70, (W - 120) / 2.2);
    function pr(x, y, zz) {   // orbit: rx about the horizontal axis, ry about the vertical; the rings slide apart in depth while you orbit
      var a = ry.x, b = rx.x, x1 = x * Math.cos(a) + zz * Math.sin(a), z1 = -x * Math.sin(a) + zz * Math.cos(a), y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b), q = f / (f + z2);
      return [W / 2 + 30 + x1 * q * u, H / 2 + y1 * q * u, q];
    }
    var spread = 1 + 1.6 * Math.min(1, Math.abs(rx.x) + Math.abs(ry.x));
    stars = []; var chosen = [];
    L.forEach(function (Ly, i) {
      var y = y0 + gap * i - H / 2, zz = (i - (n - 1) / 2) * 14 * spread, c = idx(Ly), k = Ly.opts.length;
      var ln = pr(-sp * 1.25, y, zz); cx.strokeStyle = ink(.12); cx.lineWidth = 1; cx.beginPath();
      for (var t = 0; t <= 24; t++) { var xx = -sp * 1.1 + t / 24 * sp * 2.2, p = pr(xx, y + Math.sin(t / 24 * Math.PI) * -3, zz); if (t) cx.lineTo(p[0], p[1]); else cx.moveTo(p[0], p[1]); } cx.stroke();
      cx.font = '400 9px "Julius Sans One", Poppins, sans-serif'; cx.textAlign = 'right'; cx.textBaseline = 'middle';
      cx.fillStyle = ink(i === focus ? .95 : .5); cx.fillText(Ly.name.toUpperCase(), ln[0] - 4, ln[1]);
      Ly.opts.forEach(function (o, j) {
        var xx = k === 1 ? 0 : -sp + j / (k - 1) * sp * 2, p = pr(xx, y, zz), on = j === c, r = (on ? 3.2 : 1.8) * p[2];
        if (on) { var g = cx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 12); g.addColorStop(0, ink(.35)); g.addColorStop(1, ink(0)); cx.fillStyle = g; cx.fillRect(p[0] - 12, p[1] - 12, 24, 24); chosen.push(p); }
        cx.fillStyle = ink(on ? 1 : .55); cx.beginPath(); cx.arc(p[0], p[1], r, 0, 6.283); cx.fill();
        cx.font = '300 9px Poppins, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = ink(on ? .85 : .38); cx.fillText(o[1], p[0], p[1] + 11);
        stars.push({ x: p[0], y: p[1], L: Ly, j: j, i: i });
      });
    });
    cx.strokeStyle = ink(.5); cx.lineWidth = 1; cx.beginPath(); chosen.forEach(function (p, i) { if (i) cx.lineTo(p[0], p[1]); else cx.moveTo(p[0], p[1]); }); cx.stroke();   // the chosen stars, as one figure
    if (figure.length) { cx.strokeStyle = ink(.9); cx.lineWidth = 1.4; cx.setLineDash([3, 3]); cx.beginPath(); figure.forEach(function (s0, i) { if (i) cx.lineTo(s0.x, s0.y); else cx.moveTo(s0.x, s0.y); }); if (drag && drag.draw) cx.lineTo(drag.x, drag.y); cx.stroke(); cx.setLineDash([]); }
    paintFocus();
    if (isOpen || unf.x > .01) requestAnimationFrame(draw);
  }
  function paintFocus() {
    var L = layers()[focus] || layers()[0], c = idx(L);
    if (fname.textContent !== L.name) fname.textContent = L.name;
    var w = L.opts[c][1] + (L.toggle ? (S()[L.toggle] === false ? ' · by hand' : ' · live') : ''); if (fval.textContent !== w) fval.textContent = w;
    var v = L.io.get(), f0 = typeof L.opts[0][0] === 'number' ? (v - L.opts[0][0]) / (L.opts[L.opts.length - 1][0] - L.opts[0][0]) : c / Math.max(1, L.opts.length - 1);
    track.style.setProperty('--p', (clamp(f0, 0, 1) * 100).toFixed(1) + '%'); track.setAttribute('aria-valuetext', L.name + ' ' + L.opts[c][1]);
    var live = P.querySelector('.env-live'); var hasWind = face === 'first'; live.hidden = !hasWind; live.textContent = 'wind · ' + (S().windLive === false ? 'by hand' : 'live'); live.setAttribute('aria-pressed', S().windLive === false ? 'false' : 'true');
  }
  function hit(x, y) { var r = cv.getBoundingClientRect(), best = null, bd = 18; stars.forEach(function (s0) { var d = Math.hypot(x - r.left - s0.x, y - r.top - s0.y); if (d < bd) { bd = d; best = s0; } }); return best; }
  function choose(s0) { if (s0.L.toggle && S()[s0.L.toggle] !== false && s0.L.k === 'wind') store.set({ windLive: false }); s0.L.io.set(s0.L.opts[s0.j][0]); focus = s0.i; hap('tick'); fillA11y(); }
  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    var s0 = hit(e.clientX, e.clientY), r = cv.getBoundingClientRect();
    drag = { x0: e.clientX, y0: e.clientY, x: e.clientX - r.left, y: e.clientY - r.top, s0: s0, moved: false, draw: false, t: GJ.now() };
    if (s0) { figure = [s0]; }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return; var r = cv.getBoundingClientRect(), dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; drag.x = e.clientX - r.left; drag.y = e.clientY - r.top;
    if (!drag.moved && Math.hypot(dx, dy) > 8) { drag.moved = true; drag.draw = !!drag.s0; }
    if (!drag.moved) return;
    if (drag.draw) { var s1 = hit(e.clientX, e.clientY); if (s1 && figure.indexOf(s1) < 0 && figure.every(function (q) { return q.L !== s1.L; })) { figure.push(s1); choose(s1); } }
    else { rx.t = clamp(-dy * .008, -1.1, 1.1); ry.t = clamp(dx * .008, -1.2, 1.2); rx.x = rx.t; ry.x = ry.t; }   // one finger orbits it
  });
  function up() {
    if (!drag) return; var d = drag; drag = null; rx.t = 0; ry.t = 0;   // let go: it springs back flat
    if (!d.moved && d.s0) { choose(d.s0); figure = []; return; }
    if (d.draw && figure.length >= 2) { if (figure[0] && figure.length) choose(figure[0]); save(null, figure.map(function (q) { return [q.L.k, q.j]; })); hap('commit'); }
    figure = [];
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  // the track: a slide turns the layer in focus
  (function () {
    var td = null;
    function at(x) { var r = track.getBoundingClientRect(), f0 = clamp((x - r.left) / r.width, 0, 1), L = layers()[focus];
      if (typeof L.opts[0][0] === 'number') { var a = L.opts[0][0], b = L.opts[L.opts.length - 1][0], v = Math.round((a + (b - a) * f0) * 100) / 100; if (Math.abs(v - L.io.get()) > .005) { if (L.toggle) store.set({ windLive: false }); L.io.set(v); hap('tick'); } }
      else { var j = Math.round(f0 * (L.opts.length - 1)); if (j !== idx(L)) { L.io.set(L.opts[j][0]); hap('tick'); } } }
    track.addEventListener('pointerdown', function (e) { e.preventDefault(); try { track.setPointerCapture(e.pointerId); } catch (x) {} td = 1; at(e.clientX); });
    track.addEventListener('pointermove', function (e) { if (td) at(e.clientX); });
    track.addEventListener('pointerup', function () { td = null; fillA11y(); }); track.addEventListener('pointercancel', function () { td = null; });
    track.addEventListener('keydown', function (e) { var L = layers()[focus], c = idx(L); if (e.key === 'ArrowRight' || e.key === 'ArrowUp') L.io.set(L.opts[Math.min(L.opts.length - 1, c + 1)][0]); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') L.io.set(L.opts[Math.max(0, c - 1)][0]); });
  })();
  fname.addEventListener('click', function () { focus = (focus + 1) % layers().length; hap('tick'); });
  P.querySelector('.env-live').addEventListener('click', function () { store.set({ windLive: S().windLive === false }); hap('tick'); });
  P.querySelector('.env-faces').addEventListener('click', function (e) { var b = e.target.closest('button[data-face]'); if (!b) return; face = b.dataset.face; focus = 0;
    [].forEach.call(this.children, function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); fillA11y(); hap('tick'); });
  P.addEventListener('pointerdown', function (e) { if (!card.contains(e.target)) close(); });

  /* ---------- looks: kept, recalled, renamed, deleted (also in Tune → Look) ---------- */
  function looks() { return (S().envLooks || []).slice(); }
  function save(name, fig) { var L = looks(); L.unshift({ name: name || 'look ' + (L.length + 1), v: snapshot(), fig: fig || null }); store.set({ envLooks: L.slice(0, 12) }); paintLooks(); if (GJ.mark && GJ.mark.say) GJ.mark.say('kept · ' + L[0].name, 1600); }
  function recall(i) { var L = looks()[i]; if (!L) return; applyLook(L.v); hap('commit'); fillA11y(); if (GJ.mark && GJ.mark.say) GJ.mark.say(L.name, 1200); }
  function rename(i, n) { var L = looks(); if (!L[i] || !n) return; L[i].name = String(n).slice(0, 28); store.set({ envLooks: L }); }
  function drop(i) { var L = looks(); L.splice(i, 1); store.set({ envLooks: L }); }
  function lookRows(box, withEdit) {
    var L = looks();
    box.innerHTML = L.length ? L.map(function (l, i) { return '<span class="env-look"><button type="button" data-r="' + i + '">' + GJ.ozone.esc(l.name) + '</button>' +
      (withEdit ? '<button type="button" data-n="' + i + '" aria-label="rename ' + GJ.ozone.esc(l.name) + '">rename</button><button type="button" data-d="' + i + '" aria-label="delete ' + GJ.ozone.esc(l.name) + '">delete</button>' : '') + '</span>'; }).join('')
      : '<span class="env-none">no looks yet · draw star to star to keep one</span>';
  }
  var lbox = P.querySelector('.env-looks');
  function paintLooks() { lookRows(lbox, false); var t = document.getElementById('tn-looks'); if (t) lookRows(t, true); }
  function lookClick(e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.r != null) recall(+b.dataset.r);
    if (b.dataset.d != null) { drop(+b.dataset.d); }
    if (b.dataset.n != null) { var span = b.closest('.env-look'), i = +b.dataset.n, inp = document.createElement('input'); inp.type = 'text'; inp.value = looks()[i].name; inp.setAttribute('aria-label', 'name of the look'); inp.className = 'env-rename';
      span.innerHTML = ''; span.appendChild(inp); inp.focus(); inp.select(); var done = function () { rename(i, inp.value.trim()); paintLooks(); }; inp.addEventListener('blur', done); inp.addEventListener('keydown', function (k) { if (k.key === 'Enter') inp.blur(); }); return; }
    paintLooks(); }
  lbox.addEventListener('click', lookClick);
  store.on(function (s, prev) { if (!prev || s.envLooks !== prev.envLooks) paintLooks(); });

  function open() { if (isOpen) return; isOpen = true; P.hidden = false; unf.t = 1; focus = 0; fillA11y(); paintLooks(); requestAnimationFrame(function () { P.classList.add('in'); requestAnimationFrame(draw); }); hap('commit'); }
  function close() { if (!isOpen) return; isOpen = false; unf.t = 0; P.classList.remove('in'); setTimeout(function () { if (!isOpen) P.hidden = true; }, 420); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (isOpen) { close(); return true; } return ca0.apply(this, arguments); }; }

  /* ---------- the earlier Moon dial's environment rings: where they can still be chosen, they apply ---------- */
  var MO = { atmos: ['atmos', { still: 0, soft: .5, full: 1 }], ambience: ['ambience', { cool: .2, even: .5, warm: .85 }], stars: ['density', { few: .45, some: .7, all: 1 }], fog: ['fog', { off: 0, light: .5, full: 1 }] };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#mo-stub button[data-k]'); if (!b) return; var k = b.dataset.k, v = b.dataset.v;
    if (MO[k]) { var o = {}; o[MO[k][0]] = MO[k][1][v]; store.set(o); }
    if (k === 'water') water.set(v); if (k === 'moon') moon.set(v === "tonight's" ? 'tonight' : v); if (k === 'weather') wx.set(v);
  }, true);

  /* ---------- Tune → Look: the looks, kept in Tune too ---------- */
  (function () { var row = document.getElementById('tn-looks'); if (row) { row.addEventListener('click', lookClick); paintLooks(); } })();

  GJ.env = { open: open, close: close, isOpen: function () { return isOpen; }, looks: looks, save: save, recall: recall, rename: rename, drop: drop, layers: function () { return ALL.map(function (L) { return { k: L.k, name: L.name, v: L.opts[idx(L)][1] }; }); }, snapshot: snapshot, apply: applyLook };
})(window);
