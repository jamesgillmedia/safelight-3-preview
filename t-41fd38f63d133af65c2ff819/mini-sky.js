/* mini sky · 23 Nov
   the oz constellation as a mini sky player: at rest it is the familiar corner size,
   with the 3d depth of the film-sky field and sky player's orbit.
   hold sizes it (does not ring). let go and it stays, playable.
   touch / drag across the stars plays the existing pentatonic chime.
   tap a star = one note; tap the empty atmosphere = put it away.
   good weather uses the same gesture, with today's feature in its own little world.
   oz ignores Reduce Motion. */
(function () {
  'use strict';

  var NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66], LOW = 392;
  var N = 21, KEY = [0, 4, 8, 10, 12, 16, 20];
  var W_GLIDE = 4.8, HOLD_MS = 280, MOVE = 6, REST = 1, PLACE = 5.6, MAXS = 7.2;
  var INK = [104, 59, 63], INK_LIT = [180, 90, 96];
  var FEATURE = 'rain';   /* recommended default for a late-November day: soft rain */
  var PLACE_KIND = 'coast';

  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function ease(u) { u = clamp(u, 0, 1); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function S(x, w) { return { x: x, v: 0, t: x, w: w || W_GLIDE }; }
  function sstep(s, dt) { var w = s.w, e = s.x - s.t, k = Math.exp(-w * dt), c = s.v + w * e; s.x = s.t + (e + c * dt) * k; s.v = (s.v - w * c * dt) * k; }
  function aim(s, t, instant) { s.t = t; s.w = instant ? 28 : W_GLIDE; if (instant) { s.x = t; s.v = 0; } }
  function rgb(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')'; }
  function mixc(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }

  /* ——— clock (live, or frozen for a still) ——— */
  var frozenTime = null;
  function tickClock() {
    var d = frozenTime ? new Date(frozenTime) : new Date();
    var t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, '');
    var el = $('clock'); if (el && el.textContent !== t) el.textContent = t;
  }
  tickClock(); setInterval(tickClock, 1000);

  /* ——— home sky (fixed2: two canvases, compositor drift; ignore RM) ——— */
  var SKY0 = { st: [] };
  (function seed() { var s = 11; function rn() { s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < 150; i++) SKY0.st.push({ x: rn(), y: rn() * .92, z: .25 + rn() * .75, p: rn() * 6.28 }); })();
  function sky0() {
    var W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1), k = 1.5;
    [['sky0', function (s) { return s.p > 1.1; }], ['sky0b', function (s) { return s.p <= 1.1; }]].forEach(function (L) {
      var c = $(L[0]); if (!c) return;
      c.width = Math.round(W * 2 * dpr); c.height = Math.round(Hh * dpr); c.style.width = (W * 2) + 'px'; c.style.height = Hh + 'px';
      var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W * 2, Hh);
      SKY0.st.forEach(function (s) {
        if (!L[1](s)) return;
        var a = Math.min(.6, (.08 + .36 * s.z * s.z) * .86 * k);
        x.fillStyle = rgb(INK, a);
        [0, W].forEach(function (o) { x.beginPath(); x.arc(s.x * W + o, s.y * Hh, .35 + .75 * s.z, 0, 6.283); x.fill(); });
      });
    });
  }
  sky0(); addEventListener('resize', sky0);

  /* ——— glow sprite (film-sky softDot, quiet red-mode glow) ——— */
  var GLOW = null, SOFT = null;
  function glowSpr() {
    if (GLOW) return GLOW;
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var q = c.getContext('2d'), gr = q.createRadialGradient(64, 64, 0, 64, 64, 64);
    var gk = .6;
    gr.addColorStop(0, rgb(INK_LIT, .95 * gk));
    gr.addColorStop(.18, rgb(INK, .4 * gk));
    gr.addColorStop(.55, rgb(INK, .08 * gk));
    gr.addColorStop(1, rgb(INK, 0));
    q.fillStyle = gr; q.fillRect(0, 0, 128, 128); return (GLOW = c);
  }
  function softDot() {
    if (SOFT) return SOFT;
    var c = document.createElement('canvas'); c.width = c.height = 32;
    var q = c.getContext('2d'), gr = q.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, rgb(INK_LIT, 1));
    gr.addColorStop(.28, rgb(INK_LIT, .7));
    gr.addColorStop(.6, rgb(INK, .18));
    gr.addColorStop(1, rgb(INK, 0));
    q.fillStyle = gr; q.fillRect(0, 0, 32, 32); return (SOFT = c);
  }

  /* ——— chime (unchanged instrument: pentatonic tubular bell) ——— */
  var AC = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function chime(f) {
    var c = ac(); if (!c || c.state !== 'running') return;
    var t = c.currentTime, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.055, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + 1.9);
    [[1, 1], [2.76, .22], [5.4, .06]].forEach(function (p) {
      var o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = f * p[0]; og.gain.value = p[1];
      o.connect(og); og.connect(g); o.start(t); o.stop(t + 2);
    });
    g.connect(lp); lp.connect(c.destination);
  }
  function weatherVoice(kind) {
    var c = ac(); if (!c || c.state !== 'running') return;
    var t = c.currentTime;
    if (kind === 'rain') {
      var buf = c.createBuffer(1, c.sampleRate * 1.2, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * .45));
      var s = c.createBufferSource(); s.buffer = buf;
      var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = .7;
      var g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.08, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
      s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 1.2);
    } else if (kind === 'sun') {
      var o = c.createOscillator(), g2 = c.createGain(); o.type = 'sine'; o.frequency.value = 392;
      g2.gain.setValueAtTime(.0001, t); g2.gain.exponentialRampToValueAtTime(.04, t + .04); g2.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
      o.connect(g2); g2.connect(c.destination); o.start(t); o.stop(t + 1.7);
    } else {
      var o3 = c.createOscillator(), g3 = c.createGain(); o3.type = 'sine'; o3.frequency.value = 110;
      g3.gain.setValueAtTime(.0001, t); g3.gain.exponentialRampToValueAtTime(.03, t + .08); g3.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
      o3.connect(g3); g3.connect(c.destination); o3.start(t); o3.stop(t + 1.9);
    }
  }

  /* ——— oz constellation geometry, lifted into a shallow 3d volume ——— */
  function archPt(i) { var a = Math.PI * (1.13 - 1.26 * i / (N - 1)); return [34 * Math.cos(a), -34 * Math.sin(a) + 12]; }
  var STARS = [];
  KEY.forEach(function (i, k) {
    var p = archPt(i);
    STARS.push({ x: p[0], y: p[1], z: 14 * Math.sin(i * 0.9 + 0.4) + p[0] * 0.22, f: NOTES[k], key: true, i: i });
  });
  STARS.push({ x: 0, y: 24, z: -8, f: LOW, key: false, i: 21 });
  var EDGES = [];
  for (var e = 0; e < 6; e++) EDGES.push([e, e + 1]);
  EDGES.push([3, 7]); /* the stem, from the crown to the lowest star */

  /* local atmosphere field — a compact film-sky depth field (3 layers, not 378) */
  function makeField(n, seed) {
    var L = [];
    [[0, Math.round(n * .5), .35], [1, Math.round(n * .32), .7], [2, Math.round(n * .18), 1.05]].forEach(function (row) {
      var pts = [];
      for (var i = 0; i < row[1]; i++) pts.push({ u: rnd(seed + row[0] * 1000 + i), v: rnd(seed + row[0] * 3000 + i), b: .2 + .8 * Math.pow(rnd(seed + row[0] * 700 + i), 2), r: .45 + row[2] * rnd(seed + 90 + i), ph: rnd(seed + 5100 + i) * 6.28 });
      L.push({ f: row[2], pts: pts });
    });
    return L;
  }

  /* ——— projection (sky-player / film-sky orbit: near is larger and brighter) ——— */
  function project(x, y, z, cam) {
    var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    var x1 = x * cy + z * sy;
    var z1 = -x * sy + z * cy;
    var y1 = y * cp - z1 * sp;
    var z2 = y * sp + z1 * cp;
    var f = cam.fl / (cam.fl + cam.dist + z2);
    return { x: x1 * f, y: y1 * f, z: z2, s: f };
  }

  function hint(t, ms) {
    var h = $('hint'), s = $('hintT'); if (!h || !s) return;
    s.textContent = t; h.classList.add('on');
    clearTimeout(hint._t); hint._t = setTimeout(function () { h.classList.remove('on'); }, ms || 2400);
  }

  var quiet = $('quiet');
  function setQuiet(t) { if (quiet) quiet.textContent = t; }

  /* shared pad / world gesture
     hold (still) sizes. hold never rings.
     a short tap on a star / the feature plays one note.
     a short tap on empty, once placed, puts it away.
     a drag across the playable world, once placed (or a quick stroke before the hold), plays as now.
     a flick, once placed, also puts it away. */
  /* pointers for pinch-to-zoom once a world is placed (oz viewer: drag orbits, pinch zooms) */
  var PINCH = { ids: {}, dist: 0, who: null };
  function pinchDist() {
    var a = null, b = null;
    for (var k in PINCH.ids) { if (!a) a = PINCH.ids[k]; else if (!b) b = PINCH.ids[k]; }
    return (a && b) ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
  }

  function bindWorld(W) {
    var host = W.hit, last = null, hold = null, down = false, t0 = 0, mv = false, sx, sy, pts = [], mode = null, startHit = null;
    function inWorld(x, y) { return W.contains(x, y); }
    host.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      PINCH.ids[e.pointerId] = { x: e.clientX, y: e.clientY };
      var n = Object.keys(PINCH.ids).length;
      if (n >= 2 && W.placed) {
        clearTimeout(hold); down = false; W.pressing = false; mode = 'pinch';
        PINCH.dist = pinchDist(); PINCH.who = W; PINCH.z0 = W.zoom || 1;
        try { host.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      down = true; sx = e.clientX; sy = e.clientY; last = null; t0 = performance.now(); mv = false; mode = null;
      pts = [[sx, sy, e.timeStamp]]; startHit = W.hitAt(sx, sy);
      W.pressing = true; try { host.setPointerCapture(e.pointerId); } catch (x) {}
      ac();
      if (!W.placed) hold = setTimeout(function () {
        if (down && !mv) { W.beginSize(); mode = 'size'; }
      }, HOLD_MS);
    });
    host.addEventListener('pointermove', function (e) {
      if (PINCH.ids[e.pointerId]) PINCH.ids[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (mode === 'pinch' || (PINCH.who === W && Object.keys(PINCH.ids).length >= 2)) {
        var d2 = pinchDist(); if (PINCH.dist > 8 && W.pinch) W.pinch(d2 / PINCH.dist, PINCH.z0);
        return;
      }
      if (!down) return;
      pts = pts.concat([[e.clientX, e.clientY, e.timeStamp]]).slice(-6);
      var d = Math.hypot(e.clientX - sx, e.clientY - sy);
      if (d > MOVE) { mv = true; clearTimeout(hold); }
      if (W.sizing) { W.pullSize(d); return; }
      if (W.placed) {
        if (!mode) mode = startHit ? 'play' : 'orbit';
        if (mode === 'play') {
          var hit = W.hitAt(e.clientX, e.clientY);
          if (hit && hit !== last) { last = hit; W.play(hit); }
        } else if (mode === 'orbit' && W.orbit) {
          W.orbit(e.clientX - sx, e.clientY - sy);
          sx = e.clientX; sy = e.clientY;
        }
        return;
      }
      if (mv && !W.sizing) {
        var hit2 = W.hitAt(e.clientX, e.clientY);
        if (hit2 && hit2 !== last) { last = hit2; W.play(hit2); }
      }
    });
    function up(e, cancelled) {
      delete PINCH.ids[e && e.pointerId];
      if (mode === 'pinch' && Object.keys(PINCH.ids).length < 2) { mode = null; PINCH.who = null; down = false; W.pressing = false; return; }
      if (!down) return;
      if (e && e.clientX != null) pts = pts.concat([[e.clientX, e.clientY, e.timeStamp]]).slice(-6);
      var now = performance.now();
      down = false; clearTimeout(hold); W.pressing = false;
      if (W.sizing) { W.commitSize(); last = null; mode = null; return; }
      if (mode === 'orbit') { mode = null; last = null; return; }   /* a drag in the air turns it; it stays */
      if (!mv && now - t0 < 360) {
        var hx = e && e.clientX != null ? e.clientX : sx, hy = e && e.clientY != null ? e.clientY : sy;
        var hit = W.hitAt(hx, hy);
        if (hit) W.play(hit);
        else if (W.placed && inWorld(hx, hy)) W.dismiss();
      }
      last = null; mode = null;
    }
    host.addEventListener('pointerup', function (e) { up(e, false); });
    host.addEventListener('pointercancel', function (e) { up(e, true); });
    /* once placed, the whole world (not only the 44 pt seed) must take the finger */
    document.addEventListener('pointerdown', function (e) {
      if (e.button || !W.placed || e.target === host) return;
      if (e.target && e.target.closest && e.target.closest('#disc, #phoneStage')) return;
      if (!W.contains(e.clientX, e.clientY)) return;
      e.preventDefault();
      host.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, button: 0 }));
    }, true);
  }

  /* =====================  the oz constellation  ===================== */
  var con = {
    el: $('corner'), canvas: $('conC'), hit: $('conHit'),
    sc: S(REST), at: S(0),
    placed: false, sizing: false, pressing: false,
    field: makeField(90, 17),
    ring: {}, lastPlay: 0,
    cam: { yaw: 0, pitch: 0.42, dist: 86, fl: 96 },
    look: { yaw: 0, pitch: 0, zoom: 1 },
    origin: [0, 0], proj: [],
    t0: performance.now()
  };
  con.orbit = function (dx, dy) {
    con.look.yaw += dx * 0.008;
    con.look.pitch = clamp(con.look.pitch + dy * 0.006, -0.55, 0.55);
  };
  con.pinch = function (k, z0) { con.look.zoom = clamp((z0 || 1) * k, 0.72, 1.7); };
  Object.defineProperty(con, 'zoom', { get: function () { return con.look.zoom; } });

  function conLayout() {
    var r = con.el.getBoundingClientRect();
    /* rest origin: the familiar corner. as it sizes, it eases a little down and right so the atmosphere can breathe */
    var grow = clamp((con.sc.x - REST) / (PLACE - REST), 0, 1);
    con.origin = [r.left + 17 + 18 * grow, r.top + 20 + 16 * grow];
    var cv = con.canvas, dpr = Math.min(2, devicePixelRatio || 1);
    var w = innerWidth, h = innerHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
  }

  function conToScreen(p, sc) {
    /* rest size matches the familiar 34×30 corner svg (world units are ~68 wide) */
    var unit = 0.52 * sc * (con.look.zoom || 1);
    return { x: con.origin[0] + p.x * unit, y: con.origin[1] + p.y * unit, z: p.z, s: p.s * unit, u: p.s };
  }

  function conProject(sc, t) {
    var idle = con.placed || con.sizing ? 1 : 0.35;
    var stillIdle = (con.look.yaw || con.look.pitch) ? 0.2 : 1;   /* once you take the camera, the idle quiets */
    con.cam.yaw = con.look.yaw + 0.32 * Math.sin(t * 0.22) * idle * stillIdle;
    con.cam.pitch = clamp(0.42 + con.look.pitch + 0.10 * Math.cos(t * 0.17) * idle * stillIdle, 0.06, 1.05);
    con.proj = STARS.map(function (st, i) {
      var p = project(st.x, st.y, st.z, con.cam);
      var s = conToScreen(p, sc);
      s.f = st.f; s.i = i; s.key = st.key;
      return s;
    });
    return con.proj;
  }

  con.contains = function (x, y) {
    var sc = con.sc.x, rad = 28 + 22 * sc;
    var cx = con.origin[0] + 8 * sc, cy = con.origin[1] + 6 * sc;
    return Math.hypot(x - cx, y - cy) < rad;
  };
  con.hitAt = function (x, y) {
    var best = null, bd = 1e9, r = con.placed || con.sizing ? clamp(18 + 3 * con.sc.x, 20, 36) : 22;
    (con.proj || []).forEach(function (p) {
      var d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; }
    });
    return bd < r ? best : null;
  };
  con.play = function (hit) {
    if (!hit) return;
    chime(hit.f); con.ring[hit.i] = performance.now();
  };
  con.beginSize = function () {
    con.sizing = true; con.el.classList.add('sizing'); con.el.classList.remove('placed');
    aim(con.sc, PLACE); aim(con.at, 1);
    setQuiet('sizing the sky');
    hint('let go and it stays · then play', 1800);
  };
  con.pullSize = function (dist) {
    var t = clamp(PLACE + (dist - 16) / 140, 2.4, MAXS);
    aim(con.sc, t);
  };
  con.commitSize = function () {
    con.sizing = false; con.placed = true;
    con.el.classList.remove('sizing'); con.el.classList.add('placed');
    aim(con.sc, clamp(con.sc.x, 3.2, MAXS)); aim(con.at, 1);
    setQuiet('the constellation · playable');
    /* enlarge the hit so the whole world is a 44 pt+ target */
    resizeConHit();
    hint('drag the air to turn it · pinch to zoom · tap a star to play', 2800);
  };
  con.dismiss = function () {
    con.placed = false; con.sizing = false;
    con.el.classList.remove('sizing', 'placed');
    con.look.yaw = 0; con.look.pitch = 0; con.look.zoom = 1;
    aim(con.sc, REST); aim(con.at, 0);
    setQuiet('all quiet');
    resizeConHit();
  };
  function resizeConHit() {
    var h = con.hit, sc = Math.max(con.sc.x, con.sc.t);
    if (con.placed || con.sizing) {
      var w = 70 + 36 * sc, hh = 70 + 38 * sc;
      h.style.width = w + 'px'; h.style.height = hh + 'px';
      h.style.left = '-18px'; h.style.top = '-16px';
    } else {
      h.style.width = '44px'; h.style.height = '44px'; h.style.left = '0'; h.style.top = '0';
    }
  }

  function drawAtmosphere(g, ox, oy, sc, at, field, t, w, h) {
    if (at < .01) return;
    /* a wash, not a planet: glow and faint stars that fade out, no hard disc */
    var cx = ox + 10, cy = oy + 14, R = 40 + 28 * sc;
    var haze = g.createRadialGradient(cx, cy, 8, cx, cy, R);
    haze.addColorStop(0, rgb(INK_LIT, .10 * at));
    haze.addColorStop(.22, rgb([48, 10, 14], .14 * at));
    haze.addColorStop(.55, rgb([24, 5, 8], .08 * at));
    haze.addColorStop(1, rgb([6, 3, 4], 0));
    g.fillStyle = haze; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    var spr = softDot();
    field.forEach(function (L) {
      var pan = 7 * L.f * Math.sin(t * 0.12);
      L.pts.forEach(function (p) {
        var px = cx + (p.u - .42) * R * 1.55 + pan;
        var py = cy + (p.v - .38) * R * 1.55 + 4 * L.f * Math.cos(t * 0.1 + p.ph);
        var tw = .55 + .45 * Math.sin(t * 1.1 + p.ph);
        var al = at * (.16 + p.b * .4) * tw * L.f;
        if (al < .02) return;
        var rr = p.r * (0.7 + 0.8 * L.f) * (0.75 + 0.12 * sc);
        g.globalAlpha = al;
        g.drawImage(spr, px - rr * 2, py - rr * 2, rr * 4, rr * 4);
      });
    });
    g.globalAlpha = 1;
    var core = g.createRadialGradient(ox, oy, 2, ox, oy, 22 + 8 * sc);
    core.addColorStop(0, rgb(INK_LIT, .28 * at));
    core.addColorStop(.45, rgb(INK_LIT, .08 * at));
    core.addColorStop(1, rgb(INK, 0));
    g.fillStyle = core; g.beginPath(); g.arc(ox, oy, 22 + 8 * sc, 0, 6.283); g.fill();
  }

  function drawConstellation(t) {
    conLayout();
    var cv = con.canvas, dpr = Math.min(2, devicePixelRatio || 1);
    var g = cv.getContext('2d');
    var w = innerWidth, h = innerHeight;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    var sc = con.sc.x, at = clamp(con.at.x, 0, 1);
    var pts = conProject(sc, t);
    var ox = con.origin[0], oy = con.origin[1];
    var local = pts.map(function (p) { return { x: p.x, y: p.y, z: p.z, s: p.s, u: p.u, f: p.f, i: p.i, key: p.key }; });

    drawAtmosphere(g, ox, oy, sc, at, con.field, t, w, h);

    /* hairlines in depth, near side brighter and a little thicker */
    g.lineCap = 'round'; g.lineJoin = 'round';
    EDGES.forEach(function (e) {
      var a = local[e[0]], b = local[e[1]]; if (!a || !b) return;
      var near = ((a.u + b.u) * .5);
      g.strokeStyle = rgb(INK, (.28 + .42 * near) * (0.75 + 0.25 * Math.max(at, .35)));
      g.lineWidth = 0.75 + 0.7 * near;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    });

    var spr = glowSpr();
    var order = local.slice().sort(function (a, b) { return a.z - b.z; });
    var now = performance.now();
    order.forEach(function (p) {
      var near = p.u;
      var base = 1.2 + 1.7 * near * (0.5 + 0.1 * sc);
      var ringT = con.ring[p.i], ring = 0;
      if (ringT) { ring = clamp(1 - (now - ringT) / 1100, 0, 1); if (ring <= 0) delete con.ring[p.i]; }
      var rr = base * (1 + ring * 1.15);
      var al = (.5 + .5 * near) * (1 + ring * 0.8);
      g.globalAlpha = al * .85;
      var d2 = rr * (7.5 + ring * 6);
      g.drawImage(spr, p.x - d2 / 2, p.y - d2 / 2, d2, d2);
      g.globalAlpha = 1;
      g.fillStyle = rgb(mixc(INK, INK_LIT, .3 + .5 * near + ring * .7), .75 + .25 * ring);
      g.beginPath(); g.arc(p.x, p.y, rr, 0, 6.283); g.fill();
    });
  }

  bindWorld(con);

  /* =====================  good weather mini world  ===================== */
  var wx = {
    el: $('weather'), canvas: $('wxC'), hit: $('wxHit'),
    sc: S(REST), at: S(0),
    placed: false, sizing: false, pressing: false,
    feature: FEATURE, kind: PLACE_KIND,
    field: makeField(70, 91),
    look: { yaw: 0, pitch: 0, zoom: 1 },
    origin: [0, 0],
    t0: performance.now(),
    flash: 0
  };
  wx.orbit = function (dx, dy) {
    wx.look.yaw += dx * 0.008;
    wx.look.pitch = clamp(wx.look.pitch + dy * 0.006, -0.45, 0.45);
  };
  wx.pinch = function (k, z0) { wx.look.zoom = clamp((z0 || 1) * k, 0.75, 1.6); };
  Object.defineProperty(wx, 'zoom', { get: function () { return wx.look.zoom; } });

  function wxLayout() {
    var r = wx.el.getBoundingClientRect();
    var grow = clamp((wx.sc.x - REST) / (PLACE - REST), 0, 1);
    /* the seed stays on the left; the world blooms inward so it never runs off the edge */
    wx.origin = [r.left + 22 + 110 * ease(grow), r.top + 22 - 6 * ease(grow)];
    var cv = wx.canvas, dpr = Math.min(2, devicePixelRatio || 1);
    var w = innerWidth, h = innerHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
  }
  wx.contains = function (x, y) {
    var sc = wx.sc.x, rad = 22 + 20 * sc;
    return Math.hypot(x - wx.origin[0], y - wx.origin[1]) < rad;
  };
  wx.hitAt = function (x, y) {
    /* the feature itself (sun / a rain core / a fog bank) is the “star” */
    var sc = wx.sc.x, cx = wx.origin[0], cy = wx.origin[1] - 6 * sc;
    var r = wx.placed || wx.sizing ? 22 + 4 * sc : 22;
    return Math.hypot(x - cx, y - cy) < r ? { id: 'feature', kind: wx.feature } : null;
  };
  wx.play = function (hit) {
    if (!hit) return;
    weatherVoice(wx.feature);
    wx.flash = performance.now();
  };
  wx.beginSize = function () {
    wx.sizing = true; wx.el.classList.add('sizing'); wx.el.classList.remove('placed');
    aim(wx.sc, PLACE); aim(wx.at, 1);
    setQuiet(labelWx());
    hint('let go and it stays · today’s weather', 1800);
  };
  wx.pullSize = function (dist) {
    aim(wx.sc, clamp(PLACE + (dist - 16) / 140, 2.4, MAXS));
  };
  wx.commitSize = function () {
    wx.sizing = false; wx.placed = true;
    wx.el.classList.remove('sizing'); wx.el.classList.add('placed');
    aim(wx.sc, clamp(wx.sc.x, 3.2, MAXS)); aim(wx.at, 1);
    setQuiet(labelWx());
    resizeWxHit();
    hint('drag the air to turn it · pinch to zoom · tap the light for a note', 2800);
  };
  wx.dismiss = function () {
    wx.placed = false; wx.sizing = false;
    wx.el.classList.remove('sizing', 'placed');
    wx.look.yaw = 0; wx.look.pitch = 0; wx.look.zoom = 1;
    aim(wx.sc, REST); aim(wx.at, 0);
    setQuiet('all quiet');
    resizeWxHit();
  };
  function resizeWxHit() {
    var h = wx.hit, sc = Math.max(wx.sc.x, wx.sc.t);
    var grow = clamp((sc - REST) / (PLACE - REST), 0, 1);
    if (wx.placed || wx.sizing) {
      var w = 60 + 34 * sc, hh = 60 + 34 * sc;
      var shift = 110 * ease(grow);
      h.style.width = w + 'px'; h.style.height = hh + 'px';
      h.style.left = (22 + shift - w / 2) + 'px'; h.style.top = (22 - 6 * ease(grow) - hh / 2) + 'px';
    } else {
      h.style.width = '44px'; h.style.height = '44px'; h.style.left = '0'; h.style.top = '0';
    }
  }
  function labelWx() {
    var f = wx.feature === 'rain' ? 'soft rain' : wx.feature === 'sun' ? 'a clear sun' : 'fog';
    return f + ' · the ' + wx.kind;
  }

  var WXOFF = null;
  function drawWeather(t) {
    wxLayout();
    var cv = wx.canvas, dpr = Math.min(2, devicePixelRatio || 1);
    var g = cv.getContext('2d');
    var w = innerWidth, h = innerHeight;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    var sc = wx.sc.x, at = clamp(wx.at.x, 0, 1);
    var grow = clamp((sc - REST) / (PLACE - REST), 0, 1);
    var ox = wx.origin[0], oy = wx.origin[1];
    var zoom = wx.look.zoom || 1;
    var R = lerp(11, 16 + 18 * sc, ease(grow)) * zoom;

    /* at rest, only a tiny seed of the day's feature, constellation-sized */
    if (grow < .08) {
      g.save();
      g.beginPath(); g.arc(ox, oy, 11, 0, 6.283); g.clip();
      var mid0 = [48, 8, 12];
      g.fillStyle = rgb(mid0, .9); g.fillRect(ox - 11, oy - 11, 22, 22);
      if (wx.feature === 'rain') {
        g.strokeStyle = rgb(INK_LIT, .6); g.lineWidth = 1;
        for (var d = 0; d < 5; d++) {
          var dx = ox - 6 + d * 3, dy = oy - 6 + ((t * 36 + d * 11) % 14);
          g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx - 1.2, dy + 4); g.stroke();
        }
        g.strokeStyle = rgb(INK_LIT, .28); g.lineWidth = .7;
        g.beginPath();
        for (var x2 = ox - 11; x2 <= ox + 11; x2 += 3) {
          var y2 = oy + 3 + Math.sin(x2 * .5 + t) * .8;
          if (x2 === ox - 11) g.moveTo(x2, y2); else g.lineTo(x2, y2);
        }
        g.stroke();
      } else if (wx.feature === 'sun') {
        var sun = g.createRadialGradient(ox, oy - 1, 0, ox, oy - 1, 8);
        sun.addColorStop(0, rgb([255, 68, 87], .7)); sun.addColorStop(1, rgb([255, 68, 87], 0));
        g.fillStyle = sun; g.fillRect(ox - 8, oy - 8, 16, 16);
      } else {
        g.fillStyle = rgb([80, 10, 16], .5); g.fillRect(ox - 11, oy + 1, 22, 10);
      }
      g.restore();
      g.strokeStyle = rgb(INK, .4); g.lineWidth = .8;
      g.beginPath(); g.arc(ox, oy, 10.5, 0, 6.283); g.stroke();
      return;
    }

    var feat = wx.feature;
    var yaw = wx.look.yaw || 0, pitch = wx.look.pitch || 0;
    var day = feat === 'sun' ? .85 : feat === 'fog' ? .45 : .32;
    var gold = feat === 'sun' ? .35 : 0;
    var top = mixc([20, 2, 4], [70, 8, 14], day * .4);
    var mid = mixc([40, 4, 8], [90, 16, 20], day * .5 + gold * .2);
    var hor = mixc([70, 8, 14], [110, 24, 28], day * .5 + gold * .3);
    var pad = Math.ceil(R * 1.35);
    if (!WXOFF) WXOFF = document.createElement('canvas');
    var ow = pad * 2, oh = pad * 2;
    var Wpx = Math.ceil(ow * dpr), Hpx = Math.ceil(oh * dpr);
    if (WXOFF.width !== Wpx || WXOFF.height !== Hpx) { WXOFF.width = Wpx; WXOFF.height = Hpx; }
    var o = WXOFF.getContext('2d');
    o.setTransform(dpr, 0, 0, dpr, 0, 0);
    o.clearRect(0, 0, ow, oh);
    var cx = pad, cy = pad;
    var hy = cy + R * (0.08 + pitch * 0.35);
    var shift = yaw * R * 0.55;

    /* paint a little past the disc so the soft mask has something to fade */
    var sg = o.createLinearGradient(0, cy - R * 1.15, 0, hy);
    sg.addColorStop(0, rgb(top, .5 + .5 * at));
    sg.addColorStop(.6, rgb(mid, .55 + .45 * at));
    sg.addColorStop(1, rgb(hor, .6 + .4 * at));
    o.fillStyle = sg; o.fillRect(0, 0, ow, Math.max(hy, 0) + 2);

    if (feat !== 'sun') {
      var ns = Math.round(28 * (0.3 + 0.7 * at));
      for (var i = 0; i < ns; i++) {
        var x = cx - R + (rnd(40 + i) * R * 2) + shift * 0.4;
        var y = cy - R + rnd(90 + i) * Math.max(8, hy - (cy - R));
        var tw = .5 + .5 * Math.sin(t * 1.3 + i);
        o.fillStyle = rgb(INK_LIT, (.12 + .22 * tw) * (0.3 + at * .7));
        o.fillRect(x, y, 1.1, 1.1);
      }
    }

    if (feat === 'sun' || feat === 'rain') {
      var sx = (feat === 'rain' ? cx - 0.28 * R : cx - 0.08 * R) + shift;
      var sy = cy - 0.32 * R - pitch * R * 0.2;
      var gg = o.createRadialGradient(sx, sy, 0, sx, sy, 0.28 * R);
      gg.addColorStop(0, rgb([255, 68, 87], feat === 'sun' ? .7 : .32));
      gg.addColorStop(1, rgb([255, 236, 200], 0));
      o.fillStyle = gg; o.beginPath(); o.arc(sx, sy, 0.28 * R, 0, 6.283); o.fill();
    }

    var cloud = feat === 'sun' ? .12 : feat === 'fog' ? .55 : .7;
    var wind = feat === 'fog' ? .15 : .4;
    for (var cI = 0; cI < 5 * cloud; cI++) {
      var cx_ = cx + ((cI * 53 + t * 6 * (.3 + wind)) % (R * 2.2)) - R * 1.1 + shift * 0.7;
      var cy_ = cy - R * .5 + (cI * 19) % (R * .55);
      o.fillStyle = rgb([80, 10, 16], .22 + .12 * at);
      o.beginPath(); o.ellipse(cx_, cy_, 0.28 * R, 0.07 * R, 0, 0, 6.283); o.fill();
    }

    var land = [10, 1, 2];
    o.fillStyle = rgb(mixc(hor, land, .6), .88);
    o.fillRect(0, hy, ow, oh - hy);
    if (wx.kind === 'coast') {
      o.strokeStyle = rgb(INK_LIT, .2);
      o.lineWidth = 1;
      for (var wv = 0; wv < 7; wv++) {
        var yy = hy + 6 + wv * (R * 0.055);
        var amp = (1 + wv * .35) * (.35 + wind) * (R * 0.025);
        o.beginPath();
        for (var x2 = 0; x2 <= ow; x2 += 4) {
          var y2 = yy + Math.sin((x2 + shift + t * 28) * .07 + wv * 1.1) * amp;
          if (x2 === 0) o.moveTo(x2, y2); else o.lineTo(x2, y2);
        }
        o.stroke();
      }
    } else if (wx.kind === 'forest') {
      o.fillStyle = rgb([8, 2, 4], .7);
      for (var tr = 0; tr < 8; tr++) {
        var tx = cx - R * .85 + tr * R * .22 + shift * 0.5, th = R * (.12 + rnd(tr + 3) * .18);
        o.beginPath(); o.moveTo(tx, hy + R * .2); o.lineTo(tx + R * .06, hy - th); o.lineTo(tx + R * .12, hy + R * .2); o.fill();
      }
    } else if (wx.kind === 'mountain') {
      o.fillStyle = rgb(mixc(hor, land, .85), .9);
      o.beginPath(); o.moveTo(cx - R * 1.2, cy + R);
      o.lineTo(cx - R * .4 + shift * 0.3, hy - R * .22); o.lineTo(cx + R * .1 + shift * 0.3, cy + R * .15);
      o.lineTo(cx + R * .55 + shift * 0.3, hy - R * .12); o.lineTo(cx + R * 1.2, cy + R);
      o.fill();
    }

    if (feat === 'fog') {
      var fg = o.createLinearGradient(0, hy - R * .2, 0, cy + R);
      fg.addColorStop(0, rgb([80, 10, 16], 0));
      fg.addColorStop(.45, rgb([80, 10, 16], .48 * (0.4 + .6 * at)));
      fg.addColorStop(1, rgb([80, 10, 16], 0));
      o.fillStyle = fg; o.fillRect(0, hy - R * .2, ow, cy + R - (hy - R * .2) + 8);
    }
    if (feat === 'rain') {
      o.strokeStyle = rgb([255, 68, 87], .26 + .1 * at);
      o.lineWidth = 1;
      var drops = 22 + Math.round(40 * at);
      for (var rI = 0; rI < drops; rI++) {
        var rx = cx - R + ((rI * 61.7 + t * 28 * wind + shift * 8) % (R * 2));
        var ry = cy - R + ((rI * 37.3 + t * 140) % (R * 2));
        var rl = 4 + 0.04 * R;
        o.beginPath(); o.moveTo(rx, ry); o.lineTo(rx - 1.6, ry + rl); o.stroke();
      }
    }

    if (wx.flash) {
      var k = clamp(1 - (performance.now() - wx.flash) / 700, 0, 1);
      if (k > 0) {
        o.fillStyle = rgb(INK_LIT, .16 * k);
        o.beginPath(); o.arc(cx, cy, R, 0, 6.283); o.fill();
      } else wx.flash = 0;
    }

    /* soft radial mask: the world fades into the atmosphere, no hard circle */
    o.globalCompositeOperation = 'destination-in';
    var fade = o.createRadialGradient(cx, cy, R * 0.62, cx, cy, R * 1.02);
    fade.addColorStop(0, 'rgba(0,0,0,1)');
    fade.addColorStop(0.72, 'rgba(0,0,0,1)');
    fade.addColorStop(0.88, 'rgba(0,0,0,.45)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    o.fillStyle = fade;
    o.fillRect(0, 0, ow, oh);
    o.globalCompositeOperation = 'source-over';

    /* atmosphere first, then the soft world sits in it */
    if (at > .02) drawAtmosphere(g, ox, oy + 4, Math.max(1.2, sc * 0.45), at * 0.7, wx.field, t, w, h);
    g.drawImage(WXOFF, 0, 0, Wpx, Hpx, ox - pad, oy - pad, ow, oh);
    if (at > .02) {
      var rim = g.createRadialGradient(ox, oy, R * 0.7, ox, oy, R * 1.28);
      rim.addColorStop(0, rgb([40, 8, 12], 0));
      rim.addColorStop(0.62, rgb(INK_LIT, .07 * at));
      rim.addColorStop(1, rgb([6, 3, 4], 0));
      g.fillStyle = rim; g.beginPath(); g.arc(ox, oy, R * 1.28, 0, 6.283); g.fill();
    }
  }

  bindWorld(wx);

  /* if one world is opening, put the other away — the home stays one place */
  var _beginC = con.beginSize, _beginW = wx.beginSize;
  con.beginSize = function () { if (wx.placed || wx.sizing) wx.dismiss(); _beginC(); };
  wx.beginSize = function () { if (con.placed || con.sizing) con.dismiss(); _beginW(); };

  /* ——— loop (always; oz ignores Reduce Motion) ——— */
  var lastT = performance.now(), frozenT = null;
  function loop(now) {
    var t = (frozenT != null ? frozenT : now) / 1000;
    var dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    if (frozenT == null) {
      sstep(con.sc, dt); sstep(con.at, dt);
      sstep(wx.sc, dt); sstep(wx.at, dt);
    }
    if (con.placed || con.sizing) resizeConHit();
    if (wx.placed || wx.sizing) resizeWxHit();
    drawConstellation(t);
    drawWeather(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* first visit, a short hint — not on a still */
  var q = location.search || '';
  if (!/[?&]shot=/.test(q)) {
    setTimeout(function () { hint('hold to size it · then drag the air to turn it', 3200); }, 600);
  }

  /* ——— stills: ?shot=rest|sizing|playing|weather  ——— */
  function setShot(name) {
    frozenTime = Date.parse('2026-11-23T11:53:00-07:00');
    frozenT = 18400; /* a settled, pretty phase of the orbit and the rain */
    tickClock();
    $('hint').classList.remove('on');
    con.dismiss(); wx.dismiss();
    if (name === 'rest') {
      aim(con.sc, REST, 1); aim(con.at, 0, 1);
      aim(wx.sc, REST, 1); aim(wx.at, 0, 1);
      setQuiet('all quiet');
    } else if (name === 'sizing') {
      con.sizing = true; con.el.classList.add('sizing');
      aim(con.sc, 3.15, 1); aim(con.at, .5, 1);
      resizeConHit();
      setQuiet('sizing the sky');
    } else if (name === 'playing') {
      con.placed = true; con.el.classList.add('placed');
      aim(con.sc, PLACE, 1); aim(con.at, 1, 1);
      resizeConHit();
      /* two stars mid-ring, as if a finger just drew across them */
      con.ring[2] = performance.now() - 80;
      con.ring[3] = performance.now() - 240;
      setQuiet('the constellation · playable');
    } else if (name === 'weather') {
      wx.feature = 'rain'; wx.kind = 'coast';
      wx.placed = true; wx.el.classList.add('placed');
      aim(wx.sc, PLACE, 1); aim(wx.at, 1, 1);
      resizeWxHit();
      setQuiet('soft rain · the coast');
    }
    /* force a project so hit-tests and the first paint match */
    conProject(con.sc.x, frozenT / 1000);
  }

  window.__setShot = setShot;
  window.__worlds = { con: con, wx: wx };
  var m = /[?&]shot=([a-z]+)/.exec(q);
  if (m) setShot(m[1]);

  /* red-mode disc toggles, so the look can be checked; default stays red */
  $('disc').addEventListener('click', function () {
    var on = document.documentElement.classList.toggle('red');
    this.setAttribute('aria-pressed', on ? 'true' : 'false');
    this.setAttribute('aria-label', on ? 'red mode · on' : 'red mode · off');
    GLOW = SOFT = null; sky0();
  });
})();
