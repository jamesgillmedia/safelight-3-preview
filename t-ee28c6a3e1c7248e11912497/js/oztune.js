/* tools-02 · the oz constellation in 3D: move it, tune it (briefs/OZ-CONSTELLATION-3D.md; Gill, 18 Nov:
   "Need this to customize app icon glyph").
   The flat oz — a dotted o, a dotted z, the mint star at the z's top right, a faint reflection — stood up as a real
   constellation over a dark, still pool. Its geometry is the reference's own (mkoz.py): a 1024 square, the waterline at
   628, o = 30 dots on a circle (338, 486) r 156, z = 352 / 610 / 578 / 806, the star at the top right of the z.
     · One orbit: drag to circle, pinch (or the wheel) to come closer. No free flight, and the camera never goes under
       the water. It opens three-quarters from above; a double-tap returns there; FRONT is the reference, dot for dot.
     · Ten things to tune, each showing its value. DEPTH is always the dial's first layer (sink through the surface, or
       lift out); tap any other and it becomes the second: star size, glow, spacing, depth wobble, reflection, ripple,
       letter tilt, line strength (0 = dots only). KEEP STAR keeps the mint star above the water. DRIFT is the idle sway.
     · The light is the app's: night, red (the dot in the corner, as everywhere), and rose. The mint star stays mint in
       all three, and it is the only coloured star.
     · SAVE THIS keeps the look (five to flip between, 1–5; hold a number to clear it) and makes oz-look.json — every
       dial and the camera — with three 1024 squares, night · red · rose, drawn by the same code as the screen.
     · LOWER IT INTO THE WATER (Gill, 15:03: "I want to be able to lower it into the water … the 3D camera dial style
       dial, new, just for this. Moves on your finger."): hold on the oz, or press the DEPTH tab at the stage's left
       edge, and slide — down lowers it, up lifts it, a finger's width for a finger's width. A small dial in the camera
       dial's own build (smoked tab, arc, eleven ticks, a dot, a vertical word) comes up beside the finger and goes
       where it goes; its dot rides the ticks from lifted (top) to sunk (bottom). A quick drag still circles.
     · ENVIRONMENT (15:03: "Add environment toggle from tools"): on, the oz stands over the tools' own sky and water —
       the stage is clear and the app's sky shows through; off, it is the icon's dark tile. The files are always the
       icon alone.
   Nothing here touches a photograph or leaves the phone: no network, no library; a canvas and some arithmetic.
   Kept in this browser (localStorage gj-oz). Artist tier: Tune → artist → oz icon. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, clamp = GJ.clamp, PI = Math.PI, RAD = PI / 180;
  var KEY = 'gj-oz', W = 1024, HZ = 628, DIST = 2200, EYE = HZ - 512;     // the eye sits where the reference's centre is
  var REF = { o: [338, 486, 156, 30], zt: 352, zb: 610, zl: 578, zr: 806, bar: 8, diag: 12 };
  var PAL = { night: { bg: ['#0a0f18', '#03060a'], ink: [232, 228, 220], glow: [143, 169, 207] }, red: { bg: ['#140405', '#050101'], ink: [255, 90, 74], glow: [192, 57, 43] }, rose: { bg: ['#150a0d', '#060304'], ink: [242, 196, 200], glow: [201, 138, 146] } };
  var MINT = [62, 230, 176];                                              // #3ee6b0 — the brief's
  var DEF = { depth: 0, keep: true, size: 1, glow: 1, spacing: 1, wobble: 6, refl: .18, ripple: 0, tilt: 0, lines: 0, drift: true };
  var START_VIEW = { az: -26, el: 30, zoom: 1 }, FRONT = { az: 0, el: 0, zoom: 1 };
  function fresh() { var o = {}; for (var k in DEF) o[k] = DEF[k]; o.cam = { az: START_VIEW.az, el: START_VIEW.el, zoom: START_VIEW.zoom }; return o; }
  var M = { cur: fresh(), looks: [], at: -1, sel: 'tilt', rose: false, env: false };
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.cur && s0.cur.cam) { M = Object.assign(M, s0); M.cur = Object.assign(fresh(), s0.cur); } } catch (e) {}
  function keep() { try { GJ.settings.setItem(KEY, JSON.stringify(M)); } catch (e) {} }
  var L = M.cur, on = false, dirty = true, raf = 0, tween = null, lastEff = null, out = null;
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function light() { return M.rose ? 'rose' : GJ.store.get().red ? 'red' : 'night'; }

  /* ---------- the stars: the reference's dots, respaced by SPACING ---------- */
  var geo = null, geoFor = -1;
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }   // the same wobble every time
  function stars() {
    if (geo && geoFor === L.spacing) return geo;
    var s = L.spacing, nO = Math.max(8, Math.round(REF.o[3] / s)), nB = Math.max(3, Math.round(REF.bar / s)), nD = Math.max(4, Math.round(REF.diag / s)), P = [], k, i = 0;
    function add(x, y, ch, mint) { P.push({ x: x, y: y, ch: ch, mint: !!mint, w: rnd(++i) }); }
    for (k = 0; k < nO; k++) { var a = -PI / 2 + 2 * PI * k / nO; add(REF.o[0] + REF.o[2] * Math.cos(a), REF.o[1] + REF.o[2] * Math.sin(a), 0); }
    for (k = 0; k < nB - 1; k++) add(REF.zl + (REF.zr - REF.zl) * k / (nB - 1), REF.zt, 1);
    add(REF.zr, REF.zt, 1, true);                                         // the mint star: the top right of the z
    for (k = 1; k < nD; k++) add(REF.zr + (REF.zl - REF.zr) * k / (nD - 1), REF.zt + (REF.zb - REF.zt) * k / (nD - 1), 1);
    for (k = 1; k < nB; k++) add(REF.zl + (REF.zr - REF.zl) * k / (nB - 1), REF.zb, 1);
    geo = P; geoFor = s; return P;
  }
  function world(p) {   // the letters stand on the reference waterline; TILT leans them back, WOBBLE gives each star its own depth, DEPTH sinks them
    var y0 = HZ - p.y, t = L.tilt * RAD, Y = y0 * Math.cos(t) - L.depth, Z = -y0 * Math.sin(t) + p.w * L.wobble;
    if (p.mint && L.keep && Y < 16) Y = 16;
    return [p.x - 512, Y, Z];
  }

  /* ---------- the camera: one orbit about the reference's centre ---------- */
  // the engine is shared (core/oz3d.js): the Moon dial draws with it too
  var E = GJ.oz3d;
  function camera(c) { E.use('oztune'); return E.camera(c, { dist: DIST, eye: EYE, elMin: 0, elMax: 85 }); }
  function proj(v, p) { return E.proj(v, p, 512, 512, 1); }

  /* ---------- glow: a blurred disc, as the reference draws it (radius R, blur σ), made once a colour ---------- */
  function halo(c, sr) { return E.halo(c, sr); }
  function glow(x, c, sr, px, py, R, a) { E.glow(x, c, sr, px, py, R, a); }
  function disc(x, c, px, py, r, a) { E.disc(x, c, px, py, r, a); }

  /* ---------- one drawing, for the screen and for the files ---------- */
  function render(x, S, lt, c, t, still, bare) {
    var pal = PAL[lt], k = S / W, v = camera(c), P = stars(), i, j, w, q, n = P.length;
    var g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, pal.bg[0]); g.addColorStop(1, pal.bg[1]); x.globalAlpha = 1; if (bare) x.clearRect(0, 0, S, S); else { x.fillStyle = g; x.fillRect(0, 0, S, S); }
    var b = proj(v, [0, 0, 0]), rg = x.createRadialGradient(b[0] * k, b[1] * k, 0, b[0] * k, b[1] * k, S * .5); rg.addColorStop(0, rgba(pal.glow, .16)); rg.addColorStop(1, rgba(pal.glow, 0)); if (!bare) { x.fillStyle = rg; x.fillRect(0, 0, S, S); }
    x.lineCap = 'round';
    for (i = 0; i < 6; i++) {   // faint water lines only: the reference's six, laid on the water in front of the letters
      var off = 8 + i * i * 7, z = DIST * off / (EYE + off), hw = (372 - i * 10) * (1 - z / DIST), a0 = proj(v, [v.g[0] * z - v.g[1] * hw, 0, v.g[1] * z + v.g[0] * hw]), a1 = proj(v, [v.g[0] * z + v.g[1] * hw, 0, v.g[1] * z - v.g[0] * hw]);
      x.strokeStyle = rgba(pal.glow, (.10 - .013 * i).toFixed(3)); x.lineWidth = 1.5 * k; x.beginPath(); x.moveTo(a0[0] * k, a0[1] * k); x.lineTo(a1[0] * k, a1[1] * k); x.stroke();
    }
    var Wd = [], up = [], dn = [];
    for (i = 0; i < n; i++) { w = world(P[i]); Wd.push(w); up.push(proj(v, w)); dn.push(proj(v, [w[0], -w[1], w[2]])); }
    if (L.ripple > .004) for (i = 0; i < n; i++) {   // a ripple where a star is crossing the surface
      w = Wd[i]; var near = 1 - Math.abs(w[1]) / 30; if (near <= 0) continue; q = proj(v, [w[0], 0, w[2]]);
      for (j = 0; j < 2; j++) { var ph = still ? .35 + .4 * j : ((t / 3400 + j / 2 + i * .137) % 1), rw = (8 + 46 * ph) * q[2] * k; x.strokeStyle = rgba(pal.glow, (L.ripple * near * (1 - ph) * .7).toFixed(3)); x.lineWidth = 1.2 * k; x.beginPath(); x.ellipse(q[0] * k, q[1] * k, rw, Math.max(.6, rw * (v.C[1] / q[3])), 0, 0, 2 * PI); x.stroke(); }
    }
    function vis(i) { return clamp(Wd[i][1] / 8, 0, 1); }                  // a star under the water is hidden by it
    if (L.lines > .004) {   // faint lines between neighbours, cut at the surface
      x.lineWidth = 1.5 * k;
      for (var pass = 0; pass < 2; pass++) for (i = 0; i < n; i++) {
        j = i + 1; if (j === n || P[j].ch !== P[i].ch) { if (P[i].ch !== 0) continue; j = 0; }
        var A = Wd[i], B = Wd[j]; if (A[1] <= 0 && B[1] <= 0) continue;
        if (A[1] < 0 || B[1] < 0) { var u = A[1] / (A[1] - B[1]), X = [A[0] + (B[0] - A[0]) * u, 0, A[2] + (B[2] - A[2]) * u]; if (A[1] < 0) A = X; else B = X; }
        var pa = proj(v, pass ? [A[0], -A[1], A[2]] : A), pb = proj(v, pass ? [B[0], -B[1], B[2]] : B);
        x.strokeStyle = rgba(pal.ink, (L.lines * .5 * (pass ? L.refl : 1)).toFixed(3)); x.beginPath(); x.moveTo(pa[0] * k, pa[1] * k); x.lineTo(pb[0] * k, pb[1] * k); x.stroke();
      }
    }
    var gs = 1 + .25 * Math.max(0, L.glow - 1), ga = Math.min(.9, .25 * L.glow), mint = -1;
    for (i = 0; i < n; i++) {   // the reflection: every star above the water, mirrored, faint — never the mint one
      if (P[i].mint) { mint = i; continue; } var a = vis(i) * L.refl; if (a <= .004) continue; q = dn[i]; var r = 5 * L.size * q[2] * k;
      glow(x, pal.ink, .486, q[0] * k, q[1] * k, r * 2.4 * gs, ga * a); disc(x, pal.ink, q[0] * k, q[1] * k, r, a);
    }
    for (i = 0; i < n; i++) { if (P[i].mint) continue; var a2 = vis(i); if (a2 <= .004) continue; q = up[i]; var r2 = 6 * L.size * q[2] * k; glow(x, pal.ink, .486, q[0] * k, q[1] * k, r2 * 2.4 * gs, ga * a2); disc(x, pal.ink, q[0] * k, q[1] * k, r2, a2); }
    if (mint >= 0 && vis(mint) > .004) { q = up[mint]; var rm = 22 * L.size * q[2] * k, am = vis(mint); glow(x, MINT, .364, q[0] * k, q[1] * k, rm * 2 * gs, Math.min(.95, .35 * L.glow) * am); disc(x, MINT, q[0] * k, q[1] * k, rm, am); }
    return { stars: n, above: Wd.filter(function (w) { return w[1] > 0; }).length, mint: mint >= 0 ? [up[mint][0], up[mint][1], vis(mint)] : null, first: [up[0][0], up[0][1]] };
  }

  /* ---------- the room: a square stage, the ten, the looks ---------- */
  var el = document.createElement('div'); el.id = 'ozt'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'the oz constellation: move it, tune it');
  el.innerHTML = '<button class="oz-red" data-a="red" aria-label="red mode — one tap"><i></i></button><b class="jul">oz</b><p class="oz-say" aria-live="polite"></p><div class="oz-wrap"><button class="oz-sink" data-a="sink" aria-label="depth: press and slide down to lower it into the water, up to lift it"><i>depth</i></button><div class="oz-stage"><canvas aria-label="the oz constellation over water — drag to circle it, hold and slide to lower it, pinch to come closer, double-tap for the starting view"></canvas></div></div>' +
    '<div class="oz-light" role="group" aria-label="the light"><button data-l="night">night</button><button data-l="red">red</button><button data-l="rose">rose</button></div>' +
    '<div class="oz-dials" role="group" aria-label="tune"></div><div class="oz-looks" role="group" aria-label="kept looks"></div>' +
    '<div class="oz-act"><button data-a="reset">reset</button><button data-a="front">front</button><button data-a="save" class="on">save this</button><button data-a="close" class="on">close</button></div>' +
    '<div class="oz-out" hidden><p></p><div class="oz-pics"></div><div class="oz-act"><button data-a="share">share</button><button data-a="files">files</button><button data-a="done" class="on">done</button></div></div>';
  document.body.appendChild(el);
  var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), stage = el.querySelector('.oz-stage'), sayEl = el.querySelector('.oz-say'), dialsEl = el.querySelector('.oz-dials'), looksEl = el.querySelector('.oz-looks'), outEl = el.querySelector('.oz-out');
  var sayT = 0, REST = 'drag to circle · hold and slide down to lower it into the water · pinch to come closer';
  function say(s, ms) { sayEl.textContent = s; clearTimeout(sayT); if (ms) sayT = setTimeout(function () { sayEl.textContent = REST; }, ms); }
  function pct(v) { return Math.round(v * 100) + '%'; }
  var SPEC = [   // key, the word, min, max, a step, how it reads
    ['depth', 'depth', -40, 300, 2, function (v) { v = Math.round(v); return v > 0 ? 'sunk ' + v : v < 0 ? 'lifted ' + (-v) : 'reference'; }],
    ['size', 'star size', .4, 2.5, .05, function (v) { return '×' + v.toFixed(2); }], ['glow', 'glow', 0, 3, .05, function (v) { return '×' + v.toFixed(2); }],
    ['spacing', 'spacing', .6, 2.4, .05, function (v) { return '×' + v.toFixed(2); }], ['wobble', 'depth wobble', 0, 60, 1, function (v) { return String(Math.round(v)); }],
    ['refl', 'reflection', 0, .6, .01, pct], ['ripple', 'ripple', 0, 1, .05, pct], ['tilt', 'letter tilt', -15, 75, 1, function (v) { return Math.round(v) + '°'; }],
    ['lines', 'lines', 0, 1, .05, function (v) { return v < .005 ? 'dots only' : pct(v); }]
  ], RING = {}, FMT = {};
  SPEC.forEach(function (s) {
    FMT[s[0]] = s[5];
    RING[s[0]] = { key: 'oz-' + s[0], label: s[1].toUpperCase(), min: s[2], max: s[3], def: DEF[s[0]], span: 260, unit: s[4], get: function () { return L[s[0]]; },
      set: function (v) { v = clamp(v, s[2], s[3]); if (Math.abs(v - DEF[s[0]]) < s[4] * .6) v = DEF[s[0]]; if (v !== L[s[0]]) { L[s[0]] = v; touch(); } },
      notches: function () { return [DEF[s[0]]]; }, fmt: function (v) { return s[5](v == null ? L[s[0]] : v); } };
  });
  function rings() { return M.sel === 'depth' ? [RING.depth] : [RING.depth, RING[M.sel] || RING.tilt]; }
  function chips() {
    var h = '';
    SPEC.forEach(function (s, i) { h += '<button data-d="' + s[0] + '"' + (M.sel === s[0] ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + s[1] + '<em>' + s[5](L[s[0]]) + '</em></button>'; if (i === 0) h += '<button data-g="keep" aria-pressed="' + L.keep + '">keep star<em>' + (L.keep ? 'above water' : 'free') + '</em></button>'; });
    dialsEl.innerHTML = h + '<button data-g="drift" aria-pressed="' + L.drift + '">drift<em>' + (L.drift ? 'on' : 'off') + '</em></button><button data-e="env" aria-pressed="' + !!M.env + '">environment<em>' + (M.env ? 'on' : 'off') + '</em></button>';
    var lk = ''; for (var i = 0; i < 5; i++) lk += '<button data-k="' + i + '"' + (M.looks[i] ? '' : ' disabled') + (M.at === i ? ' class="on" aria-pressed="true"' : '') + ' aria-label="look ' + (i + 1) + (M.looks[i] ? '' : ', empty') + '">' + (i + 1) + '</button>';
    looksEl.innerHTML = '<span>looks</span>' + lk;
    [].forEach.call(el.querySelectorAll('.oz-light button'), function (b) { var o = b.dataset.l === light(); b.classList.toggle('on', o); b.setAttribute('aria-pressed', o ? 'true' : 'false'); });
  }
  var chipT = 0;
  function touch() { dirty = true; M.at = -1; clearTimeout(chipT); chipT = setTimeout(function () { chips(); keep(); }, 60); if (GJ.dial.visible) GJ.dial.redraw(); }
  function size() { var s = Math.round(clamp(Math.min(G.innerWidth - 96, G.innerHeight - 410), 180, 560)), d = Math.min(3, G.devicePixelRatio || 1); stage.style.width = stage.style.height = s + 'px'; if (cv.width !== Math.round(s * d)) { cv.width = cv.height = Math.round(s * d); } dirty = true; }
  function eff(t) {   // the camera as drawn: the idle drift is a slow sway, never while a finger is down
    var c = { az: L.cam.az, el: L.cam.el, zoom: L.cam.zoom };
    if (L.drift && !GJ.reduced() && !ptrN && !tween) { c.az += 2.4 * Math.sin(t / 9000 * 2 * PI); c.el = clamp(c.el + .8 * Math.sin(t / 13000 * 2 * PI), 0, 85); }
    return c;
  }
  function moving() { return !!tween || (!GJ.reduced() && (L.drift || L.ripple > .004)); }
  function frame() {
    raf = 0; if (!on) return; var t = GJ.now();
    if (tween) { var u = clamp((t - tween.t0) / tween.ms, 0, 1), e = u * u * (3 - 2 * u); ['az', 'el', 'zoom'].forEach(function (k) { L.cam[k] = tween.a[k] + (tween.b[k] - tween.a[k]) * e; }); dirty = true; if (u >= 1) { tween = null; keep(); } }
    if (dirty || moving()) { lastEff = eff(t); lastInfo = render(cx, cv.width, light(), lastEff, t, GJ.reduced(), M.env); dirty = false; }
    raf = requestAnimationFrame(frame);
  }
  var lastInfo = null;
  function view(to, quiet) { var a = { az: L.cam.az, el: L.cam.el, zoom: L.cam.zoom }; a.az = ((a.az + 180) % 360 + 360) % 360 - 180; if (GJ.reduced() || quiet) { L.cam = { az: to.az, el: to.el, zoom: to.zoom }; dirty = true; keep(); return; } tween = { a: a, b: to, t0: GJ.now(), ms: 520 }; }

  /* ---------- the depth dial: the camera dial's build, beside the finger, going where it goes ---------- */
  var fd = document.createElement('div'); fd.id = 'ozdial'; fd.setAttribute('aria-hidden', 'true');
  (function () {
    var h = '<svg viewBox="0 0 30 120"><path class="fd-arc" d="M30 6 A70 70 0 0 0 30 114"/>', CX = 74.5, i;
    for (i = 0; i <= 10; i++) { var a = PI - .8 + i * .16, ri = i % 5 ? 65 : 61; h += '<line class="fd-tick" x1="' + (CX + 70 * Math.cos(a)).toFixed(1) + '" y1="' + (60 + 70 * Math.sin(a)).toFixed(1) + '" x2="' + (CX + ri * Math.cos(a)).toFixed(1) + '" y2="' + (60 + ri * Math.sin(a)).toFixed(1) + '"/>'; }
    fd.innerHTML = h + '<circle class="fd-dot" cx="4.5" cy="60" r="2.2"/><text class="fd-lab" x="15" y="62.5" text-anchor="middle" transform="rotate(90 15 60)">DEPTH</text></svg><span></span>';
  })();
  document.body.appendChild(fd);
  // every dial alike (dialkit.js): it is named as it appears (its own line under the stage), rests by folding away when the finger lifts, and its glass clears while turned
  if (GJ.dialkit) GJ.dialkit.attach('oz', { el: fd, ownRest: true });
  var fdDot = fd.querySelector('.fd-dot'), fdVal = fd.querySelector('span'), sink = null, holdS = 0;
  function fdPlace(x, y) {
    var f = clamp((L.depth - RING.depth.min) / (RING.depth.max - RING.depth.min), 0, 1), a = PI + .8 - f * 1.6;   // lifted at the top, sunk at the bottom
    fdDot.setAttribute('cx', (74.5 + 70 * Math.cos(a)).toFixed(1)); fdDot.setAttribute('cy', (60 + 70 * Math.sin(a)).toFixed(1));
    fdVal.textContent = FMT.depth(L.depth); var left = x + 30 > G.innerWidth - 44 ? x - 66 : x + 30; fd.classList.toggle('flip', left < x); fd.style.left = left + 'px'; fd.style.top = (y - 61) + 'px';
  }
  function sinkStart(e, how) {
    var s = stage.getBoundingClientRect().width || 300, c = lastEff || L.cam; clearTimeout(holdS); tween = null;
    sink = { id: e.pointerId, y: e.clientY, d0: L.depth, gain: (W / s) / c.zoom / Math.max(.3, Math.cos(clamp(c.el, 0, 85) * RAD)), how: how }; down = null;
    fdPlace(e.clientX, e.clientY); fd.classList.add('on'); html.classList.add('ozsinking'); if (GJ.dialkit) GJ.dialkit.touch('oz'); say('slide down to lower it into the water · up to lift it'); GJ.haptic.commit();
  }
  function sinkMove(e) {
    var v = clamp(sink.d0 + (e.clientY - sink.y) * sink.gain, RING.depth.min, RING.depth.max), was = L.depth; L.depth = Math.abs(v) < 3 ? 0 : Math.round(v);
    fd.classList.add('turning'); if (GJ.dialkit && !fd.classList.contains('dk-turning')) GJ.dialkit.turn('oz', true);   // moving: the dial's glass clears so the water it is changing shows through
    if ((was > 0) !== (L.depth > 0) || (was === 0) !== (L.depth === 0)) GJ.haptic.tick(); dirty = true; fdPlace(e.clientX, e.clientY);
  }
  function sinkEnd() { if (!sink) return; sink = null; if (GJ.dialkit) GJ.dialkit.turn('oz', false); fd.classList.remove('on', 'turning'); html.classList.remove('ozsinking'); M.at = -1; chips(); keep(); say(FMT.depth(L.depth), 1600); if (GJ.dial.visible) GJ.dial.redraw(); }
  var sinkBtn = el.querySelector('.oz-sink');
  sinkBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); try { sinkBtn.setPointerCapture(e.pointerId); } catch (x) {} sinkStart(e, 'tab'); });
  sinkBtn.addEventListener('pointermove', function (e) { if (sink && sink.id === e.pointerId) { e.preventDefault(); sinkMove(e); } });
  ['pointerup', 'pointercancel'].forEach(function (n) { sinkBtn.addEventListener(n, function (e) { if (sink && sink.id === e.pointerId) sinkEnd(); }); });

  /* ---------- hands: one finger circles, a held finger lowers, two come closer, a double-tap goes back to the start ---------- */
  var ptr = {}, ptrN = 0, pin = 0, tap0 = 0, down = null;
  stage.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation(); try { stage.setPointerCapture(e.pointerId); } catch (x) {} ptr[e.pointerId] = { x: e.clientX, y: e.clientY }; ptrN = Object.keys(ptr).length; tween = null;
    clearTimeout(holdS); if (sink) sinkEnd();
    if (ptrN === 1) { down = { x: e.clientX, y: e.clientY, t: GJ.now(), moved: 0 }; var ev = { pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY }; holdS = setTimeout(function () { if (ptrN === 1 && down && down.moved < 8) sinkStart(ev, 'hold'); }, 300); } if (ptrN === 2) { var k = Object.keys(ptr); pin = Math.hypot(ptr[k[0]].x - ptr[k[1]].x, ptr[k[0]].y - ptr[k[1]].y); down = null; }
  });
  stage.addEventListener('pointermove', function (e) {
    var p = ptr[e.pointerId]; if (!p) return; e.preventDefault(); var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (sink) { if (sink.id === e.pointerId) sinkMove(e); return; }
    if (ptrN === 1) { if (down) { down.moved += Math.abs(dx) + Math.abs(dy); if (down.moved >= 8) clearTimeout(holdS); } L.cam.az -= dx * .4; L.cam.el = clamp(L.cam.el + dy * .32, 0, 85); dirty = true; }
    else if (ptrN === 2) { var k = Object.keys(ptr), d = Math.hypot(ptr[k[0]].x - ptr[k[1]].x, ptr[k[0]].y - ptr[k[1]].y); if (pin > 0) L.cam.zoom = clamp(L.cam.zoom * d / pin, .5, 3); pin = d; dirty = true; }
  });
  function up(e) {
    if (!ptr[e.pointerId]) return; delete ptr[e.pointerId]; ptrN = Object.keys(ptr).length; pin = 0; var t = GJ.now(); clearTimeout(holdS);
    if (sink) { sinkEnd(); down = null; return; }
    if (down && down.moved < 9 && t - down.t < 320) { if (t - tap0 < 340) { tap0 = 0; view(START_VIEW); say('the starting view', 1600); GJ.haptic.commit(); } else tap0 = t; }
    else if (!ptrN) { M.at = -1; chips(); keep(); }
    down = null;
  }
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', function (e) { e.preventDefault(); e.stopPropagation(); L.cam.zoom = clamp(L.cam.zoom * Math.exp(-e.deltaY / 600), .5, 3); dirty = true; keep(); }, { passive: false });

  /* ---------- the looks, and the files ---------- */
  function snap() { var o = {}; for (var k in DEF) o[k] = L[k]; var c = lastEff || L.cam; o.cam = { az: +c.az.toFixed(2), el: +c.el.toFixed(2), zoom: +c.zoom.toFixed(3) }; return o; }
  function load(i) { var k = M.looks[i]; if (!k) return false; var c = k.cam; M.cur = L = Object.assign(fresh(), JSON.parse(JSON.stringify(k))); L.cam = { az: L.cam.az, el: L.cam.el, zoom: L.cam.zoom }; delete L.t; M.at = i; geo = null; if (on) { GJ.dial.config(rings()); } dirty = true; chips(); keep(); say('look ' + (i + 1), 1400); GJ.haptic.tick(); return !!c; }
  function clearLook(i) { if (!M.looks[i]) return; M.looks.splice(i, 1); if (M.at === i) M.at = -1; else if (M.at > i) M.at--; chips(); keep(); say('look ' + (i + 1) + ' cleared', 1600); GJ.haptic.edge(); }
  function json(k) {
    return JSON.stringify({ what: 'oz look', made: new Date().toISOString(), reference: { square: W, waterline: HZ, o: { cx: REF.o[0], cy: REF.o[1], r: REF.o[2], dots: REF.o[3] }, z: { top: REF.zt, bottom: REF.zb, left: REF.zl, right: REF.zr }, star: 'top right of the z', mint: '#3ee6b0' },
      dials: { depth: k.depth, keepMintStarAboveWater: k.keep, starSize: k.size, glow: k.glow, spacing: k.spacing, depthWobble: k.wobble, reflectionStrength: k.refl, ripple: k.ripple, letterTilt: k.tilt, lineStrength: k.lines }, idleDrift: k.drift,
      camera: { azimuth: k.cam.az, elevation: k.cam.el, zoom: k.cam.zoom, distance: DIST, target: [0, EYE, 0], note: 'one orbit about the reference centre; azimuth 0, elevation 0 is the flat reference' }, stars: stars().length }, null, 1);
  }
  function draw1024(lt, c) { var c2 = document.createElement('canvas'); c2.width = c2.height = W; render(c2.getContext('2d'), W, lt, c, GJ.now(), true); return c2; }
  function save() {
    var k = snap(), slot = M.looks.length < 5 ? M.looks.length : (M.at >= 0 ? M.at : 0), was = M.looks.length >= 5; k.t = Date.now(); M.looks[slot] = k; M.at = slot; chips(); keep(); say('keeping look ' + (slot + 1) + ' …'); GJ.haptic.commit();
    var names = ['night', 'red', 'rose'], cs = names.map(function (n) { return draw1024(n, k.cam); });
    return Promise.all(cs.map(function (c) { return GJ.out.blobOf(c, 'image/png'); })).then(function (bl) {
      if (out) out.urls.forEach(function (u) { URL.revokeObjectURL(u); });
      out = { look: slot, json: json(k), blobs: bl, names: names, urls: bl.map(function (b) { return URL.createObjectURL(b); }) };
      outEl.querySelector('p').textContent = 'look ' + (slot + 1) + (was ? ' replaced' : ' kept') + ' · three 1024 squares and oz-look.json · hold a picture to keep it, or share';
      outEl.querySelector('.oz-pics').innerHTML = names.map(function (n, i) { return '<figure><img alt="the oz icon, ' + n + '" src="' + out.urls[i] + '"><figcaption>' + n + '</figcaption></figure>'; }).join('');
      outEl.hidden = false; el.classList.add('saved'); say('look ' + (slot + 1) + (was ? ' replaced' : ' kept'), 2400); GJ.oztune.last = out; return out;
    }).catch(function () { say('the look is kept here · the pictures could not be made on this page', 4000); return null; });
  }
  function fileList() { return out.blobs.map(function (b, i) { return new File([b], 'oz-' + out.names[i] + '.png', { type: 'image/png' }); }).concat([new File([out.json], 'oz-look.json', { type: 'application/json' })]); }
  function zipIt() { return Promise.all(out.blobs.map(GJ.out.bytes)).then(function (u) { var files = u.map(function (d, i) { return { name: 'oz-' + out.names[i] + '.png', data: d }; }); files.push({ name: 'oz-look.json', data: GJ.out.enc(out.json) }); var z = GJ.out.zip(files); GJ.out.save(z, 'oz-look-' + (out.look + 1) + '.zip'); GJ.out.last = { name: 'oz-look-' + (out.look + 1) + '.zip', size: z.size, files: files.map(function (f) { return f.name; }) }; say('oz-look-' + (out.look + 1) + '.zip · four files', 3000); return z; }); }
  function share() { if (!out) return; var f; try { f = fileList(); } catch (e) { f = null; } if (f && G.navigator.canShare && G.navigator.canShare({ files: f })) return G.navigator.share({ files: f, title: 'oz look ' + (out.look + 1) }).catch(function (e) { if (!e || e.name !== 'AbortError') return zipIt(); }); return zipIt(); }

  /* ---------- open, close, taps ---------- */
  /* a room of its own (as Objects is): the map steps back and the sky goes quiet behind it, so ENVIRONMENT has the
     tools' own sky and water to show, not the home map. The room's element is empty — the tool is its own layer. */
  var roomEl = document.createElement('section'); roomEl.id = 'r-oztune'; roomEl.className = 'room'; roomEl.setAttribute('aria-hidden', 'true');
  (function () { var a = document.getElementById('r-archive'); if (a && a.parentNode) a.parentNode.appendChild(roomEl); else document.body.appendChild(roomEl); })();
  function doOpen() { if (on) return; on = true; L = M.cur; size(); chips(); say(REST); html.classList.add('oztuning'); html.classList.toggle('ozenv', !!M.env); dirty = true; if (!raf) raf = requestAnimationFrame(frame); GJ.haptic.tick(); }
  function doClose() { if (!on) return; on = false; clearTimeout(holdS); if (sink) sinkEnd(); html.classList.remove('oztuning', 'ozenv'); el.classList.remove('saved'); outEl.hidden = true; GJ.dial.hideNow(); keep(); }
  GJ.rooms.oztune = { id: 'oztune', title: '', trees: .3, golden: 0, rings: rings, enter: doOpen, leave: doClose, frame: function () {}, back: function () { return false; } };
  function open() { if (on) return; GJ.app.enter('oztune'); }
  function close() { if (!on) return; if (GJ.app.room === 'oztune') GJ.app.back(); else doClose(); }
  var holdT = 0, held = false;
  looksEl.addEventListener('pointerdown', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; held = false; clearTimeout(holdT); holdT = setTimeout(function () { held = true; clearLook(+b.dataset.k); }, 620); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { looksEl.addEventListener(n, function () { clearTimeout(holdT); }); });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); var a = b.dataset.a;
    if (a === 'sink') return;
    if (b.dataset.d) { M.sel = b.dataset.d; GJ.dial.config(rings()); GJ.dial.raise(M.sel === 'depth' ? 0 : 1); chips(); keep(); GJ.haptic.tick(); say(b.firstChild.textContent + ' is on the dial · slide the edge', 2600); }
    else if (b.dataset.e) { M.env = !M.env; html.classList.toggle('ozenv', M.env && on); dirty = true; chips(); keep(); GJ.haptic.tick(); say(M.env ? 'over the tools\' own sky and water · the files stay the icon alone' : 'the icon\'s own dark tile', 2600); }
    else if (b.dataset.g) { L[b.dataset.g] = !L[b.dataset.g]; touch(); chips(); GJ.haptic.tick(); }
    else if (b.dataset.k) { if (held) { held = false; return; } load(+b.dataset.k); }
    else if (b.dataset.l) { setLight(b.dataset.l); }
    else if (a === 'reset') { var c = L.cam; M.cur = L = fresh(); L.cam = c; M.at = -1; geo = null; GJ.dial.config(rings()); dirty = true; chips(); keep(); view(START_VIEW); say('the reference look', 2000); GJ.haptic.commit(); }
    else if (a === 'front') { view(FRONT); say('from the front · the flat reference', 2400); GJ.haptic.tick(); }
    else if (a === 'red') setLight(GJ.store.get().red ? 'night' : 'red');   // the dot in the corner, as everywhere
    else if (a === 'save') save(); else if (a === 'share') share(); else if (a === 'files') { if (out) zipIt(); }
    else if (a === 'done') { outEl.hidden = true; el.classList.remove('saved'); }
    else if (a === 'close') close();
  });
  function setLight(n) { M.rose = n === 'rose'; var red = n === 'red'; if (GJ.store.get().red !== red) GJ.store.set({ red: red }); dirty = true; chips(); keep(); GJ.haptic.tick(); }
  GJ.store.on(function (s) { if (s.red && M.rose) { M.rose = false; keep(); } if (on) { dirty = true; chips(); } });
  G.addEventListener('resize', function () { if (on) size(); });

  GJ.oztune = { open: open, close: close, isOpen: function () { return on; }, save: save, share: share, zip: function () { return out ? zipIt() : null; }, load: load, clear: clearLook, light: setLight, view: function (n) { view(n === 'front' ? FRONT : START_VIEW, true); },
    env: function (v) { M.env = !!v; html.classList.toggle('ozenv', M.env && on); dirty = true; chips(); keep(); },
    set: function (o) { for (var k in o) { if (k === 'cam') L.cam = Object.assign(L.cam, o.cam); else if (k in DEF) L[k] = typeof DEF[k] === 'boolean' ? !!o[k] : +o[k]; } dirty = true; M.at = -1; chips(); keep(); },
    pick: function (k) { if (RING[k]) { M.sel = k; if (on) GJ.dial.config(rings()); chips(); keep(); } }, ring: function (k) { return RING[k]; }, render: function (lt, c) { return draw1024(lt || light(), c || L.cam); }, last: null,
    state: function () { return { on: on, look: snap(), base: { az: L.cam.az, el: L.cam.el, zoom: L.cam.zoom }, light: light(), sel: M.sel, env: !!M.env, sinking: sink ? sink.how : null, looks: M.looks.length, at: M.at, info: lastInfo, stars: stars().length, side: cv.width, saved: !outEl.hidden, moving: moving() }; } };
})(window);
