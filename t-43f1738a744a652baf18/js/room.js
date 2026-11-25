/* A room of sound and environment. Generated on the device. */
(function () {
  'use strict';

  var PAIRS = [
    { id: 'snow',   name: 'snow',   beds: { white: 1, pink: .15, brown: 0 } },
    { id: 'rain',   name: 'rain',   beds: { white: .12, pink: 1, brown: .08 } },
    { id: 'sea',    name: 'sea',    beds: { white: 0, pink: .1, brown: 1 } },
    { id: 'wind',   name: 'wind',   beds: { white: .08, pink: .35, brown: 1 } },
    { id: 'storm',  name: 'storm',  beds: { white: .1, pink: .85, brown: .7 } },
    { id: 'fire',   name: 'fire',   beds: { white: .15, pink: .35, brown: 1 } },
    { id: 'city',   name: 'city',   beds: { white: .2, pink: 1, brown: .25 } },
    { id: 'desert', name: 'desert', beds: { white: .2, pink: .4, brown: 1 } },
    { id: 'lost',   name: 'lost in time', beds: { white: 0, pink: 0, brown: 0 }, song: true }
  ];

  var canvas = document.getElementById('env');
  var cx = canvas.getContext('2d');
  var html = document.documentElement;
  var disc = document.getElementById('disc');
  var bedEl = document.getElementById('bed');
  var dimmer = document.getElementById('dimmer');
  var backhint = document.getElementById('backhint');
  var nameEl = document.getElementById('name');
  var wakeEl = document.getElementById('wake');
  var dotsEl = document.getElementById('dots');
  var intenEl = document.getElementById('inten');
  var intenFill = intenEl.querySelector('i');
  var sleepEl = document.getElementById('sleep');
  var leftEl = document.getElementById('left');
  var exbtn = document.getElementById('exbtn');
  var extrasEl = document.getElementById('extras');
  var envdot = document.getElementById('envdot');
  var envdialEl = document.getElementById('envdial');
  var envring = document.getElementById('envring');
  var erx = envring ? envring.getContext('2d') : null;
  var envsheet = document.getElementById('envsheet');
  var pauseEl = document.getElementById('pause');
  var tuneEl = document.getElementById('tune');

  var W = 0, H = 0, M = 390, dpr = 1, hy = 0;
  var pair = 0, intensity = .42, red = false, light = 1;
  var tAcc = 0, lastT = 0, windNow = 0, flash = 0, nextFlash = 0;
  var nameT = 0, dotsT = 0, intenT = 0, wakeOn = true, quiet = false;
  var fade = 1, fading = false;
  var endAt = 0, mins = 0, leftTick = 0;
  var DROPS = [], FLAKES = [], RINGS = [], MOTES = [], EMBERS = [], GLASS = [], DUST = [];
  var nextRing = 0, nextCrack = 0, fireFlick = 1;
  var hazeTex = null, hazeTint = null, hazeKey = '';
  var audio = null, hearing = false;
  var WTS = { snow: 0, rain: 0, sea: 0, wind: 0, storm: 0, fire: 0, city: 0, desert: 0, lost: 0 };
  var enterU = 1, entering = false;
  var song = { buf: null, loading: false, ready: null, gain: null, hp: null, lp: null, delay: null, dg: null, nextT: 0, timer: 0, wanted: false };
  var SONG_XF = 1.8;
  var probe = null;
  var EX_KEYS = [
    { k: 'dial', name: 'dial' },
    { k: 'orb', name: '3d dial' },
    { k: 'tune', name: 'tune' },
    { k: 'pause', name: 'pause' },
    { k: 'touch', name: 'touch' },
    { k: 'reflect', name: 'reflections' },
    { k: 'moon', name: 'moon' }
  ];
  var EXSTORE = 'cks-v19m-wn-extras';
  var ex = { dial: true, orb: false, tune: true, pause: true, touch: true, reflect: false, moon: false };
  var extrasOpen = false;
  function envOn() { return !!(ex.dial || ex.orb); }
  var ENV_CONT = [
    { k: 'wind', name: 'wind', kind: 'dial' },
    { k: 'density', name: 'density', kind: 'dial' },
    { k: 'light', name: 'light', kind: 'dial' },
    { k: 'warmth', name: 'warmth', kind: 'dial' },
    { k: 'glow', name: 'glow', kind: 'dial' },
    { k: 'height', name: 'height', kind: 'dial' },
    { k: 'tilt', name: 'tilt', kind: 'toggle' }
  ];
  function defEnv() { return { wind: .5, density: .5, light: .5, warmth: .5, glow: .5, height: .5, tilt: false }; }
  var env = defEnv(), envNow = { wind: .5, density: .5, light: .5, warmth: .5, glow: .5, height: .5, tilt: 0 };
  var envSel = 'light', envOpen = false, envOpenT = 0, envFolding = false;
  var envOrb = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  var envIdle = 0, envStars = [], envDragging = false, envStore = {}, envSaveT = 0;
  var feelOpen = false, feelIdle = 0, feelDrag = null;
  var tiltLean = 0, tiltSamp = 0, tiltOnDev = false;
  var STORE = 'cks-v19m-wn-env', TUNE = 'cks-v19m-wn-tune';
  var vol = 1, pauseOn = false, pauseU = 1, pauseGlyphT = 0;
  var tuneOpen = false, tuneIdle = 0, tuneMix = {}, tuneDrag = null;
  var HANDS = {}, handN = 0;
  var lastRingT = 0, lastTapAt = 0, lastTapX = 0, lastTapY = 0, audioAt = 0;
  var twoHold = null, twoHoldT = 0;
  var Q = {};
  (function () {
    (location.search || '').slice(1).split('&').forEach(function (p) {
      var i = p.indexOf('='); if (i < 0) return;
      Q[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1));
    });
  })();

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function lum(c) { return (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function now() { return performance.now(); }
  function haptic(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {} }
  function pid() { return PAIRS[pair].id; }
  function wt(id) { return WTS[id] || 0; }
  function sstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function enterK() { return sstep(enterU); }
  /* 1.0 at rest so v3 draw counts are unchanged; only ?enter=1 eases particles in */
  function visK() {
    var e = 0.18 + 0.82 * enterK();
    /* without dial / 3d dial this is 1.0 at rest — exact v3 counts */
    if (!envOn()) return e;
    return (0.45 + envNow.density * 1.1) * e;
  }
  function inkRgba(a) { return 'rgba(232,228,220,' + a.toFixed(3) + ')'; }
  function exOn(k) { return !!ex[k]; }

  function remap(rgb) {
    if (!red) return rgb;
    var Lm = lum(rgb), k = Math.min(1.25, Lm * 1.6);
    return [Math.min(255, 255 * k), Math.min(255, 68 * k * .9), Math.min(255, 87 * k * .9)];
  }
  function rgba(rgb, a) {
    var c = remap(rgb);
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')';
  }
  function rgb(c) { var r = remap(c); return 'rgb(' + (r[0] | 0) + ',' + (r[1] | 0) + ',' + (r[2] | 0) + ')'; }

  function stepWeights(dt) {
    var k = 1 - Math.exp(-dt * 2.1), id = pid(), i, p, t;
    for (i = 0; i < PAIRS.length; i++) {
      p = PAIRS[i]; t = p.id === id ? 1 : 0;
      WTS[p.id] += (t - WTS[p.id]) * k;
      if (WTS[p.id] < .002) WTS[p.id] = 0;
      if (WTS[p.id] > .998 && t === 1) WTS[p.id] = 1;
    }
  }

  /* ---------- haze sheet, same method as the sky ---------- */
  function makeHaze() {
    var N = 256, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d'), img = g.createImageData(N, N), sd = 7;
    function r() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
    var oct = [[8, .5], [16, .28], [32, .14], [64, .08]].map(function (o) {
      var n = o[0], grid = []; for (var i = 0; i < n * n; i++) grid.push(r());
      return { n: n, a: o[1], g: grid };
    });
    function sm(t) { return t * t * (3 - 2 * t); }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var v = 0;
      oct.forEach(function (o) {
        var fx = x / N * o.n, fy = y / N * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
        var a = o.g[(y0 % o.n) * o.n + x0 % o.n], b = o.g[(y0 % o.n) * o.n + (x0 + 1) % o.n];
        var c2 = o.g[((y0 + 1) % o.n) * o.n + x0 % o.n], d = o.g[((y0 + 1) % o.n) * o.n + (x0 + 1) % o.n];
        v += o.a * ((a + (b - a) * tx) + ((c2 + (d - c2) * tx) - (a + (b - a) * tx)) * ty);
      });
      var k = Math.max(0, Math.min(1, (v - .32) * 1.9)), i4 = (y * N + x) * 4;
      img.data[i4] = img.data[i4 + 1] = img.data[i4 + 2] = 255;
      img.data[i4 + 3] = Math.round(k * k * 255);
    }
    g.putImageData(img, 0, 0); return c;
  }
  function tintHaze(col) {
    var key = (red ? 'r' : 'n') + col.map(function (v) { return v | 0; }).join(',');
    if (key === hazeKey && hazeTint) return hazeTint;
    if (!hazeTex) hazeTex = makeHaze();
    hazeKey = key; hazeTint = hazeTint || document.createElement('canvas');
    hazeTint.width = hazeTint.height = 256;
    var g = hazeTint.getContext('2d'); g.clearRect(0, 0, 256, 256);
    g.drawImage(hazeTex, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = rgb(col); g.fillRect(0, 0, 256, 256);
    g.globalCompositeOperation = 'source-over';
    return hazeTint;
  }

  /* seed once at boot. never again on pair, intensity, or resize. */
  function seed() {
    var i;
    DROPS = []; for (i = 0; i < 420; i++) DROPS.push([Math.random(), Math.random(), .6 + Math.random() * .8]);
    FLAKES = []; for (i = 0; i < 520; i++) FLAKES.push([Math.random(), Math.random(), .35 + Math.random() * 1.5, Math.random() * 6.28]);
    MOTES = []; for (i = 0; i < 90; i++) MOTES.push({ x: Math.random(), y: Math.random() * .85, r: .5 + Math.random() * 1.4, s: .3 + Math.random() * .7, p: Math.random() * 6.28 });
    EMBERS = []; for (i = 0; i < 90; i++) EMBERS.push({ x: .28 + Math.random() * .44, y: Math.random(), v: .1 + Math.random() * .22, s: .5 + Math.random() * 1.2, p: Math.random() * 6.28 });
    GLASS = []; for (i = 0; i < 70; i++) GLASS.push({ x: Math.random(), y: Math.random(), v: .05 + Math.random() * .14, s: .5 + Math.random() * 1.1, p: Math.random() * 6.28 });
    DUST = []; for (i = 0; i < 40; i++) DUST.push({ x: Math.random(), y: Math.random(), v: .01 + Math.random() * .03, r: 1.2 + Math.random() * 3.2, p: Math.random() * 6.28 });
    RINGS = [];
    if (probe) probe.seed += 1;
  }

  function palettes() {
    return {
      snow:   { top: [5, 9, 16],    mid: [10, 18, 28],   hor: [28, 38, 52],   water: [8, 12, 18] },
      rain:   { top: [4, 7, 11],    mid: [7, 13, 22],    hor: [18, 28, 46],   water: [6, 10, 16] },
      sea:    { top: [8, 12, 16],   mid: [16, 22, 28],   hor: [28, 36, 42],   water: [10, 16, 22] },
      wind:   { top: [5, 9, 15],    mid: [10, 18, 34],   hor: [26, 37, 64],   water: [8, 12, 20] },
      storm:  { top: [3, 5, 10],    mid: [8, 10, 18],    hor: [16, 20, 28],   water: [4, 6, 10] },
      fire:   { top: [22, 10, 8],   mid: [52, 22, 12],   hor: [110, 48, 18],  water: [28, 10, 6] },
      city:   { top: [14, 16, 28],  mid: [32, 28, 40],   hor: [78, 52, 40],   water: [16, 14, 18] },
      desert: { top: [20, 14, 22],  mid: [56, 36, 28],   hor: [140, 88, 50],  water: [36, 22, 16] },
      lost:   { top: [18, 12, 10],  mid: [48, 32, 22],   hor: [110, 78, 48],  water: [22, 14, 10] }
    };
  }

  function washOf(id, pal, I) {
    var top = pal.top.slice(), mid = pal.mid.slice(), hor = pal.hor.slice(), water = pal.water.slice();
    if (id === 'snow') {
      top = mix(top, [48, 58, 72], I * .62); mid = mix(mid, [110, 122, 138], I * .5); hor = mix(hor, [200, 208, 216], I * .28);
    }
    if (id === 'sea') {
      top = mix(top, [90, 96, 104], I * .55); mid = mix(mid, [140, 146, 152], I * .5); hor = mix(hor, [180, 186, 190], I * .45);
    }
    if (id === 'rain' || id === 'storm') {
      var dk = 1 - I * .22;
      top = [top[0] * dk, top[1] * dk, top[2] * dk]; mid = [mid[0] * dk, mid[1] * dk, mid[2] * dk];
    }
    if (id === 'fire') {
      var glow = .4 + I * .55;
      top = mix(top, [70, 28, 14], I * .45);
      mid = mix(mid, [150, 62, 22], glow * .55);
      hor = mix(hor, [230, 130, 48], glow * fireFlick * .7);
    }
    if (id === 'city') {
      top = mix(top, [36, 38, 64], I * .4);
      mid = mix(mid, [80, 58, 52], I * .42);
      hor = mix(hor, [180, 120, 70], I * .5);
    }
    if (id === 'desert') {
      top = mix(top, [56, 36, 58], I * .4);
      mid = mix(mid, [130, 82, 52], I * .5);
      hor = mix(hor, [210, 150, 90], I * .5);
    }
    if (id === 'wind') {
      hor = mix(hor, [210, 214, 222], I * .06);
    }
    if (id === 'lost') {
      top = mix(top, [70, 42, 28], I * .4); mid = mix(mid, [160, 110, 70], I * .5); hor = mix(hor, [220, 170, 110], I * .45);
    }
    return { top: top, mid: mid, hor: hor, water: water };
  }

  function mixedWash(I) {
    var pals = palettes(), acc = { top: [0, 0, 0], mid: [0, 0, 0], hor: [0, 0, 0], water: [0, 0, 0] }, s = 0, i, p, c, k;
    for (i = 0; i < PAIRS.length; i++) {
      p = PAIRS[i]; k = wt(p.id); if (k <= 0) continue;
      c = washOf(p.id, pals[p.id], I);
      acc.top[0] += c.top[0] * k; acc.top[1] += c.top[1] * k; acc.top[2] += c.top[2] * k;
      acc.mid[0] += c.mid[0] * k; acc.mid[1] += c.mid[1] * k; acc.mid[2] += c.mid[2] * k;
      acc.hor[0] += c.hor[0] * k; acc.hor[1] += c.hor[1] * k; acc.hor[2] += c.hor[2] * k;
      acc.water[0] += c.water[0] * k; acc.water[1] += c.water[1] * k; acc.water[2] += c.water[2] * k;
      s += k;
    }
    if (s < 1e-6) return shadeWash(washOf(pid(), pals[pid()], I));
    return shadeWash({
      top: [acc.top[0] / s, acc.top[1] / s, acc.top[2] / s],
      mid: [acc.mid[0] / s, acc.mid[1] / s, acc.mid[2] / s],
      hor: [acc.hor[0] / s, acc.hor[1] / s, acc.hor[2] / s],
      water: [acc.water[0] / s, acc.water[1] / s, acc.water[2] / s]
    });
  }
  function shadeWash(c) {
    /* no-op unless dial / 3d dial is on; at default 0.5 this is still a no-op */
    if (!envOn()) return c;
    var L = (envNow.light - .5) * 2, T = (envNow.warmth - .5) * 2, G = envNow.glow;
    if (Math.abs(L) < .01 && Math.abs(T) < .01 && Math.abs(G - .5) < .01) return c;
    function lift(col, amt) {
      if (amt >= 0) return mix(col, [214, 218, 226], amt * .32);
      return [col[0] * (1 + amt * .16), col[1] * (1 + amt * .16), col[2] * (1 + amt * .16)];
    }
    c.top = lift(c.top, L); c.mid = lift(c.mid, L * .85); c.hor = lift(c.hor, L * .55);
    c.water = lift(c.water, L * .25);
    if (T > 0) {
      var warm = [255, 176, 110];
      c.top = mix(c.top, warm, T * .22); c.mid = mix(c.mid, warm, T * .28); c.hor = mix(c.hor, warm, T * .34);
    } else if (T < 0) {
      var cool = [150, 186, 230], u = -T;
      c.top = mix(c.top, cool, u * .24); c.mid = mix(c.mid, cool, u * .26); c.hor = mix(c.hor, cool, u * .22);
    }
    if (G > .5) {
      var bloom = mix(c.hor, [230, 226, 214], (G - .5) * .5);
      c.mid = mix(c.mid, bloom, (G - .5) * .35); c.hor = mix(c.hor, bloom, (G - .5) * .4);
    }
    return c;
  }

  function hyFor(id) {
    if (id === 'fire') return H * .90;
    if (id === 'city') return H * .86;
    if (id === 'lost') return H * .88;
    return H * .62;
  }
  function hyMix() {
    var s = 0, h = 0, i, p, k;
    for (i = 0; i < PAIRS.length; i++) {
      p = PAIRS[i]; k = wt(p.id); if (k <= 0) continue;
      h += hyFor(p.id) * k; s += k;
    }
    return s ? h / s : H * .62;
  }
  function waterAmt() { return wt('snow') + wt('rain') + wt('sea') + wt('wind') + wt('storm'); }

  function drawWash(p) {
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(p.top));
    g.addColorStop(Math.max(0.02, hy / H * .85), rgb(p.mid));
    g.addColorStop(Math.min(.98, hy / H), rgb(p.hor));
    g.addColorStop(1, rgb(p.water));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  }

  function drawClouds(I, wind) {
    var amt = wt('wind') * (.35 + I * .7) + wt('storm') * (.55 + I * .4) + wt('rain') * (.25 + I * .4) +
      wt('snow') * (.15 + I * .35) + wt('city') * (.2 + I * .25) + wt('desert') * (.12 + I * .2) + wt('sea') * (.08 + I * .15) + wt('fire') * .06;
    if (amt < .02) return;
    var S = 900 * Math.max(1, M / 390), speed = 6 + wind * 30 + wt('wind') * I * 40 + wt('desert') * I * 24;
    var ox = ((tAcc * speed) % S + S) % S;
    var glowC = mix([150, 140, 150], [120, 110, 120], wt('storm'));
    glowC = mix(glowC, [210, 216, 224], wt('snow') * .45);
    glowC = mix(glowC, [220, 150, 80], wt('fire') * .35 + wt('desert') * .25);
    cx.save(); cx.globalCompositeOperation = 'screen';
    var t2 = tintHaze(glowC);
    cx.globalAlpha = Math.min(.62, amt * .42);
    var Si = Math.round(S), top = -S * .22;
    for (var x = Math.floor(-ox); x < W; x += Si) cx.drawImage(t2, x, top, Si, Math.max(1, hy - top));
    cx.restore();
    var gb = cx.createLinearGradient(0, hy - H * .3, 0, hy);
    gb.addColorStop(0, rgba([120, 96, 90], 0));
    gb.addColorStop(1, rgba([150, 112, 100], .08 * amt));
    cx.fillStyle = gb; cx.fillRect(0, hy - H * .3, W, H * .3);
  }

  function drawFog(I, wind) {
    var amt = wt('sea') * (.35 + I * .7) + wt('snow') * (I * .25) + wt('wind') * (.1 + I * .15) + wt('desert') * (.18 + I * .35) + wt('fire') * (.08 + I * .12);
    if (amt < .02) return;
    var T = 512 * Math.max(1, M / 390);
    var col = mix([150, 152, 158], [220, 224, 230], wt('sea') * I * .5);
    col = mix(col, [220, 160, 90], wt('desert') * .4 + wt('fire') * .35);
    [[.055, 6, 1], [.04, -4, 1.6]].forEach(function (L, j) {
      var S = T * L[2];
      var Si = Math.round(S);
      var ox = ((tAcc * L[1] * (1 + wind)) % Si + Si) % Si;
      var oy = ((tAcc * L[1] * .35 * (j ? -1 : 1)) % Si + Si) % Si;
      cx.save(); cx.globalAlpha = Math.min(1, amt * L[0] * 1.8);
      cx.globalCompositeOperation = 'screen';
      var t2 = tintHaze(col);
      for (var x = Math.floor(-ox); x < W; x += Si) for (var y = Math.floor(-oy); y < H; y += Si) cx.drawImage(t2, x, y, Si, Si);
      cx.restore();
    });
  }

  function handForce(X, Y, mode) {
    if (!ex.touch || !handN) return { x: 0, y: 0 };
    var fx = 0, fy = 0, k, h, dx, dy, d, r, w, tx, ty, any = false;
    for (k in HANDS) {
      any = true;
      h = HANDS[k];
      dx = X - h.x; dy = Y - h.y; d = Math.sqrt(dx * dx + dy * dy);
      r = mode === 'fire' ? 130 : mode === 'dust' ? 120 : 100;
      if (d < 1 || d > r) continue;
      w = (1 - d / r); w = w * w;
      fx += (dx / d) * w * (mode === 'dust' ? 0.55 : 0.38);
      fy += (dy / d) * w * (mode === 'fire' ? -0.15 : 0.38);
      if (mode === 'swirl' || mode === 'dust') { tx = -dy / d; ty = dx / d; fx += tx * w * 0.28; fy += ty * w * 0.28; }
      if (mode === 'fire') fy -= w * 0.7;
    }
    return any ? { x: fx, y: fy } : { x: 0, y: 0 };
  }
  function touchRipple(x, y, force) {
    if (!ex.touch || waterAmt() < .08 || y < hy - 12) return;
    var t = now();
    if (t - lastRingT < 70) return;
    lastRingT = t;
    RINGS.push({ x: x, y: Math.max(hy + 6, y), t: t, s: 1 + (force || 0) * .6 });
  }
  function stepDrops(dt, I, wind, still) {
    var vy = H * (1.2 + I * .8);
    for (var i = 0; i < DROPS.length; i++) {
      var d = DROPS[i];
      if (!still) {
        d[1] += dt * vy / H * d[2];
        if (ex.touch && handN) {
          var hf = handForce(d[0] * W, d[1] * hy * 1.25, 'swirl');
          d[0] += hf.x * dt * 1.8; d[1] += hf.y * dt * 0.35;
        }
      }
      if (d[1] > 1) { d[1] -= 1; d[0] = Math.random(); }
    }
  }
  function drawRain(dt, I, wind, still) {
    var ra = (wt('rain') + wt('storm') + wt('city') * .85) * (.25 + I * .95);
    stepDrops(dt, I, wind, still);
    if (ra < .02) return;
    var n = Math.round(DROPS.length * Math.min(1, ra) * visK()), lean = .12 + wind * .25, Lbase = 10 * (M / 390 + .3);
    cx.lineWidth = 1; cx.strokeStyle = rgba([200, 214, 230], .22 * Math.min(1, ra));
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var d = DROPS[i];
      var X = d[0] * (W + 60) - 30 + d[1] * H * lean, Y = d[1] * hy * 1.25, L2 = Lbase * d[2];
      if (Y > hy && !wt('city')) continue;
      cx.moveTo(X, Y); cx.lineTo(X - L2 * lean, Y - L2);
    }
    cx.stroke();
    if (!still && waterAmt() > .15 && now() > nextRing && Math.random() < dt * (4 + I * 8) * Math.min(1, ra)) {
      RINGS.push({ x: Math.random() * W, y: hy + 8 + Math.random() * Math.max(8, H - hy - 16), t: now(), s: .35 + I * .4 });
      nextRing = now() + (180 + Math.random() * 400) / (1 + I);
    }
  }

  function drawSnow(dt, I, wind, still) {
    var sa = wt('snow') * (.2 + I * .95);
    var i, f;
    for (i = 0; i < FLAKES.length; i++) {
      f = FLAKES[i];
      if (!still) { f[1] += dt * (.05 + I * .12) * f[2]; f[0] += dt * (.01 + I * .04) * wind; if (ex.touch && handN) { var hf = handForce(f[0] * W, f[1] * H, 'swirl'); f[0] += hf.x * dt * 1.6; f[1] += hf.y * dt * 1.2; } }
      if (f[1] > 1) f[1] -= 1; if (f[0] > 1) f[0] -= 1; if (f[0] < 0) f[0] += 1;
    }
    if (sa < .02) return;
    var n = Math.round(FLAKES.length * Math.min(1, sa) * visK());
    cx.fillStyle = rgba([240, 244, 250], .7 * Math.min(1, sa));
    for (i = 0; i < n; i++) {
      f = FLAKES[i];
      var X2 = f[0] * W + Math.sin(tAcc * .8 + f[3]) * (10 + I * 14), Y2 = f[1] * H, r2 = f[2] * (1.05 + I * .7) * (M / 390 + .2);
      cx.beginPath(); cx.arc(X2, Y2, r2, 0, 6.283); cx.fill();
    }
  }

  function drawWater(I) {
    var a = waterAmt();
    if (a < .02) return;
    var swell = (wt('sea') * (.4 + I * .7) + (wt('rain') + wt('storm')) * (.18 + I * .28) + wt('wind') * (.2 + I * .35) + wt('snow') * .03);
    var lineA = (wt('snow') * .05 + wt('sea') * (.1 + swell * .06) * (1 - I * .55) + (1 - wt('snow') - wt('sea')) * (.08 + swell * .07));
    lineA *= a;
    cx.fillStyle = rgba([4, 6, 10], (.28 + wt('sea') * I * .1) * a);
    cx.fillRect(0, hy, W, H - hy);
    var t = tAcc, nLines = wt('snow') > .6 ? 3 : 5;
    for (var k = 0; k < nLines; k++) {
      var yy = hy + 12 + k * ((H - hy) / (nLines + 1)), amp = (3 + k * 1.6) * swell, sp = .55 + k * .17;
      cx.strokeStyle = rgba([200, 210, 220], lineA * (1 - k / (nLines + 1) * .45));
      cx.lineWidth = 1;
      cx.beginPath();
      for (var x = 0; x <= W; x += 8) {
        var y = yy + Math.sin(x * 0.011 * sp + t * (.35 + k * .06)) * amp + Math.sin(x * 0.027 + t * .22 + k * 1.3) * amp * .32;
        if (x === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
      }
      cx.stroke();
    }
    var nowMs = now();
    RINGS = RINGS.filter(function (r) { return nowMs - r.t < 1600; });
    RINGS.forEach(function (r) {
      var u = (nowMs - r.t) / 1600, e = 1 - Math.pow(1 - u, 3), aa = (1 - u) * .28 * r.s * a;
      var rx = 18 * e * r.s * (M / 390 + .5), ry = rx * .28;
      cx.strokeStyle = rgba([210, 220, 230], aa);
      cx.beginPath(); cx.ellipse(r.x, r.y, rx, ry, 0, 0, 6.283); cx.stroke();
    });
    var ha = (wt('sea') * .16 * (1 - I * .75) + wt('snow') * .1 + (1 - wt('sea') - wt('snow')) * .16) * a;
    cx.strokeStyle = rgba([220, 226, 232], ha);
    cx.beginPath(); cx.moveTo(0, hy + .5); cx.lineTo(W, hy + .5); cx.stroke();
  }

  function drawWindMotes(dt, I, wind, still) {
    var wa = wt('wind') + wt('desert') * .85;
    var i, q;
    for (i = 0; i < MOTES.length; i++) {
      q = MOTES[i];
      if (!still) { q.x += dt * (.04 + wind * .18) * q.s * (1 + I * 1.4); q.y += dt * .006 * Math.sin(tAcc + q.p); }
      if (q.x > 1.08) q.x = -.08;
    }
    if (wa < .02) return;
    var n = Math.round(MOTES.length * (.3 + I * .7) * Math.min(1, wa));
    var col = mix([220, 226, 234], [230, 200, 150], wt('desert'));
    cx.strokeStyle = rgba(col, (.16 + I * .22) * Math.min(1, wa));
    cx.lineWidth = 1;
    cx.beginPath();
    for (i = 0; i < n; i++) {
      q = MOTES[i];
      var L = (10 + I * 28) * q.s * (M / 390 + .4);
      var X = q.x * W, Y = q.y * H;
      cx.moveTo(X, Y); cx.lineTo(X - L, Y + L * .08);
    }
    cx.stroke();
  }

  function drawStorm(dt, I, still) {
    var a = wt('storm');
    if (a < .05) { if (flash > .01) flash *= Math.exp(-dt * 7); return; }
    if (!still && now() > nextFlash) {
      flash = (.7 + I * .5) * a; nextFlash = now() + (5000 + Math.random() * 9000) / (1 + I * 1.4);
      if (audio && audio.thunder) audio.thunder();
    }
    if (flash > .01) {
      cx.fillStyle = rgba([220, 228, 255], .2 * flash);
      cx.fillRect(0, 0, W, hy);
      flash *= Math.exp(-dt * 7);
    }
  }

  function drawFire(dt, I, still) {
    var a = wt('fire');
    fireFlick += ((.85 + Math.random() * .3) - fireFlick) * Math.min(1, dt * 8);
    var i, e;
    for (i = 0; i < EMBERS.length; i++) {
      e = EMBERS[i];
      if (!still) { e.y -= dt * e.v * (0.7 + I); e.x += dt * .05 * Math.sin(tAcc * 1.4 + e.p); if (ex.touch && handN) { var hf = handForce(e.x * W, e.y * H, 'fire'); e.x += hf.x * dt * 0.9; e.y += hf.y * dt * 1.4; } }
      if (e.y < -.06) { e.y = 1.02; e.x = .28 + Math.random() * .44; }
    }
    if (a < .02) return;
    var glow = (.4 + I * .55) * a;
    var gx = W * .5, gy = H * .94, gr = Math.max(W, H) * (.48 + I * .22);
    var g = cx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, rgba([255, 180, 70], .5 * glow * fireFlick));
    g.addColorStop(.32, rgba([230, 90, 24], .28 * glow));
    g.addColorStop(.65, rgba([100, 24, 6], .1 * glow));
    g.addColorStop(1, rgba([0, 0, 0], 0));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    var n = Math.round(EMBERS.length * (.3 + I * .7) * a);
    var sc = M / 390 + .3;
    cx.lineWidth = 1.2;
    cx.lineCap = 'round';
    for (i = 0; i < n; i++) {
      e = EMBERS[i];
      var fadeY = Math.max(0, 1 - (1 - e.y) * .85);
      var L = (10 + I * 18) * e.s * sc;
      var X = e.x * W, Y = e.y * H;
      cx.strokeStyle = rgba(e.s > 1 ? [255, 210, 130] : [255, 130, 50], .55 * fadeY * a);
      cx.beginPath(); cx.moveTo(X, Y + L * .15); cx.lineTo(X, Y - L); cx.stroke();
    }
    cx.lineCap = 'butt';
    if (audio && audio.crackle && a > .4 && now() > nextCrack) {
      nextCrack = now() + (200 + Math.random() * 520) / (1 + I * 2);
      audio.crackle(I, .5);
    }
  }

  function drawCity(dt, I, wind, still) {
    var a = wt('city');
    var i, d;
    for (i = 0; i < GLASS.length; i++) {
      d = GLASS[i];
      if (!still) {
        d.y += dt * d.v * (0.45 + I * .7);
        d.x += dt * .008 * Math.sin(tAcc * .7 + d.p);
      }
      if (d.y > 1.06) { d.y = -.04; d.x = Math.random(); }
    }
    if (a < .02) return;
    /* warm street wash — a band, not lights */
    var band = cx.createLinearGradient(0, hy - H * .28, 0, H);
    band.addColorStop(0, rgba([255, 170, 80], 0));
    band.addColorStop(.55, rgba([255, 150, 70], .1 * a * (0.6 + I * .5)));
    band.addColorStop(1, rgba([40, 22, 14], .28 * a));
    cx.fillStyle = band; cx.fillRect(0, hy - H * .28, W, H - (hy - H * .28));

    /* wet glass sheen */
    cx.save(); cx.globalCompositeOperation = 'screen';
    var S = 640 * Math.max(1, M / 390), Si = Math.round(S);
    var ox = ((tAcc * 3) % Si + Si) % Si;
    cx.globalAlpha = .1 * a;
    var t2 = tintHaze([200, 210, 230]);
    for (var x = Math.floor(-ox); x < W; x += Si) cx.drawImage(t2, x, 0, Si, H);
    cx.restore();

    /* droplets running down the pane — trails, not a field of dots */
    var n = Math.round(GLASS.length * (.35 + I * .65) * a);
    var sc = M / 390 + .3, lean = .04 + wind * .12;
    cx.lineCap = 'round';
    for (i = 0; i < n; i++) {
      d = GLASS[i];
      var X = d.x * W, Y = d.y * H, L = (14 + I * 22) * d.s * sc;
      cx.strokeStyle = rgba([210, 222, 236], (.22 + I * .16) * a);
      cx.lineWidth = (1 + d.s * .8) * sc;
      cx.beginPath(); cx.moveTo(X, Y - L); cx.lineTo(X + L * lean, Y); cx.stroke();
    }
    cx.lineCap = 'butt';

    /* quiet window edge */
    var inset = 16 * (M / 390);
    cx.strokeStyle = rgba([220, 226, 232], .08 * a);
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(inset, H * .1); cx.lineTo(inset, H - inset);
    cx.moveTo(W - inset, H * .1); cx.lineTo(W - inset, H - inset);
    cx.moveTo(inset, H - inset); cx.lineTo(W - inset, H - inset);
    cx.stroke();
  }

  function drawDesert() {
    var a = wt('desert');
    if (a < .02) return;
    var ground = hy;
    function dune(off, amp, col, alpha) {
      var lastY = ground;
      cx.fillStyle = rgba(col, alpha * a);
      cx.beginPath(); cx.moveTo(0, H);
      for (var x = 0; x <= W; x += 6) {
        lastY = ground + off
          + Math.sin(x * 0.012 + 1.7 + off) * amp
          + Math.sin(x * 0.03 + 2 + off) * amp * .4
          + Math.sin(tAcc * .06 + x * 0.004 + off) * 2.2;
        cx.lineTo(x, lastY);
      }
      if ((W % 6) !== 0) cx.lineTo(W, lastY);
      cx.lineTo(W, H); cx.lineTo(0, H); cx.closePath(); cx.fill();
    }
    dune(0, 28, [70, 42, 24], .55);
    dune(34, 16, [48, 28, 16], .58);
  }

  function lightPos() {
    if (!envOn()) return { x: W * .5, y: H * .11 };
    var t = envNow.height, ang = Math.PI * (1 - t);
    return { x: W * .5 + Math.cos(ang) * W * .42, y: H * .11 + (1 - Math.sin(ang)) * H * .32 };
  }
  function moonColor() {
    if (!envOn()) return [221, 203, 180];
    return mix([186, 210, 230], [255, 196, 130], envNow.warmth);
  }
  function moonAmt() {
    /* Lost in Time keeps its crescent as part of the room; the moon extra adds it elsewhere */
    var a = wt('lost');
    if (ex.moon) a += wt('snow') * .85 + wt('sea') + wt('wind') * .4 + wt('desert') * .5;
    return a;
  }
  function drawMoon() {
    var a = moonAmt();
    if (a < .02) return;
    var p, col, sc = M / 390, r, bloom, g, glow, lit, elev, cut;
    if (!envOn()) {
      /* exact Lost in Time / v3 crescent — no env tint, no moved light */
      p = { x: W * .5, y: H * .11 }; col = [221, 203, 180]; r = 14.5 * sc;
      if (p.y > hy - 8) return;
      bloom = r * 4.7;
      g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloom);
      g.addColorStop(0, rgba(col, .32 * a));
      g.addColorStop(.3, rgba(col, .05 * a));
      g.addColorStop(1, rgba(col, 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, bloom, 0, 6.283); cx.fill();
      cx.save();
      cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.clip();
      cx.fillStyle = rgba(col, .88 * a);
      cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.fill();
      cx.globalCompositeOperation = 'destination-out';
      cx.fillStyle = 'rgba(0,0,0,1)';
      cx.beginPath(); cx.arc(p.x + r * 0.35, p.y - r * .08, r * 0.92, 0, 6.283); cx.fill();
      cx.restore();
      return;
    }
    p = lightPos(); col = moonColor();
    glow = envNow.glow; lit = envNow.light;
    r = (11 + glow * 7) * sc;
    if (p.y > hy - 8) return;
    bloom = r * (3.2 + glow * 3) * (0.7 + lit * .4);
    g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloom);
    g.addColorStop(0, rgba(col, .4 * a * (0.5 + lit * .6)));
    g.addColorStop(.3, rgba(col, .1 * a * glow));
    g.addColorStop(1, rgba(col, 0));
    cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, bloom, 0, 6.283); cx.fill();
    cx.save();
    cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.clip();
    cx.fillStyle = rgba(col, .88 * a);
    cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.fill();
    elev = Math.sin(Math.PI * envNow.height);
    cut = 0.35 + (1 - elev) * 0.25;
    cx.globalCompositeOperation = 'destination-out';
    cx.fillStyle = 'rgba(0,0,0,1)';
    cx.beginPath(); cx.arc(p.x + r * cut, p.y - r * .08, r * 0.92, 0, 6.283); cx.fill();
    cx.restore();
  }
  function drawReflect() {
    if (!ex.reflect) return;
    var wa = Math.min(1, wt('sea') + wt('snow') * .35);
    if (wa < .03 || hy >= H - 10) return;
    var a = moonAmt() * wa;
    if (a < .02) return;
    var p = lightPos(), col = moonColor();
    var band = Math.max(24, H - hy - 36);
    var ry = hy + Math.min(band * 0.42, Math.max(16, (hy - p.y) * 0.45));
    var sc = M / 390;
    var glow = envOn() ? envNow.glow : .5, lit = envOn() ? envNow.light : .5;
    var rr = (9 + glow * 5) * sc;
    var wob = Math.sin(tAcc * 0.9) * (3 + (envOn() ? envNow.wind : .5) * 6);
    cx.save();
    cx.globalCompositeOperation = 'screen';
    cx.globalAlpha = .28 * a * (0.5 + lit * .5);
    cx.fillStyle = rgba(col, 1);
    cx.beginPath(); cx.ellipse(p.x + wob, ry, rr * 1.3, rr * 0.45, 0, 0, 6.283); cx.fill();
    var pathLen = (H - hy) * 0.7, topW = 2.2 * sc, botW = (16 + glow * 10) * sc;
    var lg = cx.createLinearGradient(0, hy, 0, hy + pathLen);
    var litA = .22 * a * (0.45 + lit * .7);
    lg.addColorStop(0, rgba(col, litA));
    lg.addColorStop(.55, rgba(col, litA * .45));
    lg.addColorStop(1, rgba(col, 0));
    cx.globalAlpha = 1;
    cx.fillStyle = lg;
    cx.beginPath();
    cx.moveTo(p.x - topW, hy); cx.lineTo(p.x + topW, hy);
    cx.lineTo(p.x + botW + wob * .4, hy + pathLen);
    cx.lineTo(p.x - botW + wob * .4, hy + pathLen);
    cx.closePath(); cx.fill();
    cx.restore();
  }
  function stepEnv(dt) {
    if (!envOn()) return;
    var k = 1 - Math.exp(-dt * 2.4);
    ['wind', 'density', 'light', 'warmth', 'glow', 'height'].forEach(function (key) {
      envNow[key] += (env[key] - envNow[key]) * k;
    });
    envNow.tilt += ((env.tilt ? 1 : 0) - envNow.tilt) * k;
    tiltLean += ((env.tilt ? tiltSamp : 0) - tiltLean) * (1 - Math.exp(-dt * 4));
    if (envOpenT > 0) {
      var wv = 9, ax = (envOrb.tx - envOrb.x) * (wv * wv) - envOrb.vx * 2 * wv;
      var ay = (envOrb.ty - envOrb.y) * (wv * wv) - envOrb.vy * 2 * wv;
      envOrb.vx += ax * dt; envOrb.vy += ay * dt;
      envOrb.x += envOrb.vx * dt; envOrb.y += envOrb.vy * dt;
      if (envFolding) {
        envOpenT = Math.max(0, envOpenT - dt / 0.42);
        if (envOpenT <= 0) { envOpen = false; envFolding = false; syncDialDom(); }
      } else if (envOpen && envOpenT < 1) envOpenT = Math.min(1, envOpenT + dt / 0.62);
    }
  }

  function drawLost(dt, I, still) {
    var a = wt('lost');
    var i, d;
    for (i = 0; i < DUST.length; i++) {
      d = DUST[i];
      if (!still) {
        d.y -= dt * d.v * (0.5 + I * .5);
        d.x += dt * .015 * Math.sin(tAcc * .25 + d.p) * (envOn() ? (0.4 + envNow.wind) : 0.7);
        if (ex.touch && handN) {
          var hf = handForce(d.x * W, d.y * H, 'dust');
          d.x += hf.x * dt * 1.5; d.y += hf.y * dt * 1.3;
        }
      }
      if (d.y < -.08) { d.y = 1.06; d.x = Math.random(); }
    }
    if (a < .02) return;
    var n = Math.min(DUST.length, Math.round(DUST.length * (.5 + I * .4) * a * visK()));
    for (i = 0; i < n; i++) {
      d = DUST[i];
      var X = d.x * W, Y = d.y * H, r = d.r * (M / 390 + .3);
      var g = cx.createRadialGradient(X, Y, 0, X, Y, r * 3);
      g.addColorStop(0, rgba([255, 210, 150], .16 * a * .65));
      g.addColorStop(1, rgba([255, 210, 150], 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(X, Y, r * 3, 0, 6.283); cx.fill();
    }
  }

  function targetWind(I) {
    return (wt('wind') + wt('desert')) * (.45 + I * .8)
      + wt('storm') * (.4 + I * .45)
      + (wt('rain') + wt('city')) * (.22 + I * .45)
      + wt('snow') * (.12 + I * .45)
      + (wt('sea') + wt('fire')) * (.08 + I * .45)
      + wt('lost') * (.04 + I * .1)
      + (envOn() ? (envNow.wind - .5) * .9 + tiltLean * .45 : 0);
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight; M = Math.min(W, 430);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (envring) {
      envring.width = Math.round(W * dpr); envring.height = Math.round(H * dpr);
      envring.style.width = W + 'px'; envring.style.height = H + 'px';
      if (erx) erx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    hy = hyMix();
  }

  function frame(ts) {
    if (!lastT) lastT = ts;
    var dt = Math.min(.05, (ts - lastT) / 1000); lastT = ts;
    if (probe) {
      probe.n += 1;
      if (dt >= 0.033) probe.drop += 1;
      if (dt >= 0.05) probe.clamp += 1;
      if (dt > probe.maxDt) probe.maxDt = dt;
      if (dt < probe.minDt) probe.minDt = dt;
    }
    if (!(ex.pause && pauseOn)) tAcc += dt;
    if (ex.pause) {
      var pTarget = pauseOn ? 0 : 1;
      if (pauseU !== pTarget) {
        pauseU += (pTarget > pauseU ? 1 : -1) * dt / 0.48;
        if ((pTarget === 0 && pauseU <= 0) || (pTarget === 1 && pauseU >= 1)) pauseU = pTarget;
        if (audio) audio.set(pair, intensity, fade);
      }
    }
    stepWeights(dt);
    if (envOn()) stepEnv(dt);
    if (entering) {
      enterU = Math.min(1, enterU + dt / 1.35);
      if (enterU >= 1) { enterU = 1; entering = false; }
      if (audio) audio.set(pair, intensity, fade);
    }
    var I = intensity * fade;
    hy += (hyMix() - hy) * (1 - Math.exp(-dt * 2.1));
    windNow += (targetWind(I) - windNow) * (1 - Math.exp(-dt * 2));
    var still = !!(ex.pause && pauseOn);
    drawWash(mixedWash(I));
    drawClouds(I, windNow);
    drawMoon();
    drawDesert();
    drawWater(I);
    drawReflect();
    drawRain(dt, I, windNow, still);
    drawSnow(dt, I, windNow, still);
    drawFog(I, windNow);
    drawWindMotes(dt, I, windNow, still);
    drawCity(dt, I, windNow, still);
    drawFire(dt, I, still);
    drawStorm(dt, I, still);
    drawLost(dt, I, still);
    if (ex.orb && envOpenT > 0.001) drawEnvDial();
    if (ex.orb && envOpen && !envDragging && now() - envIdle > 2400) closeEnv();
    if (ex.dial && feelOpen && !feelDrag && now() - feelIdle > 8000) closeFeel();
    if (ex.tune && tuneOpen && !tuneDrag && now() - tuneIdle > 8000) closeTune();
    if (fading) {
      fade = Math.max(0, fade - dt / 20);
      if (audio) audio.set(pair, intensity, fade);
      if (fade <= 0) fading = false;
    }
    if (endAt) {
      var left = endAt - Date.now();
      if (left <= 0) { endAt = 0; mins = 0; fading = true; leftEl.classList.remove('show'); }
      else if (Date.now() - leftTick > 1000) { paintLeft(); leftTick = Date.now(); }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- sound: created only inside a user gesture; media channel ignores the silent switch ---------- */
  var SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

  function encodeWav(d, sr) {
    var n = d.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0, p = 44; i < n; i++, p += 2) {
      var s = Math.max(-1, Math.min(1, d[i])); v.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function prepBedEl() {
    if (!bedEl) return;
    bedEl.setAttribute('playsinline', '');
    bedEl.setAttribute('webkit-playsinline', '');
    bedEl.playsInline = true;
    bedEl.autoplay = true;
    bedEl.muted = false;
    bedEl.volume = 1;
    bedEl.loop = true;
    try { bedEl.removeAttribute('muted'); } catch (e) {}
  }

  function makeAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ac = new AC();
    try { ac.resume(); } catch (e) {}
    var master = ac.createGain(); master.gain.value = 0;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 12000; lp.Q.value = .7;
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 40; hp.Q.value = .5;
    var delay = ac.createDelay(1.2); delay.delayTime.value = .16;
    var dGain = ac.createGain(); dGain.gain.value = 0;
    var dest = ac.createMediaStreamDestination();
    var beds = {}, usingEl = false, blobUrl = null, fallback = false;

    var silent = ac.createBuffer(1, 1, ac.sampleRate);
    var one = ac.createBufferSource(); one.buffer = silent; one.connect(ac.destination); one.start(0);

    var keep = ac.createGain(); keep.gain.value = 0.0001;
    var osc = ac.createOscillator(); osc.frequency.value = 40;
    osc.connect(keep); keep.connect(dest); osc.start();

    hp.connect(lp); lp.connect(master);
    master.connect(delay); delay.connect(dGain); dGain.connect(master);
    master.connect(dest);

    song.gain = ac.createGain(); song.gain.gain.value = 0;
    song.hp = ac.createBiquadFilter(); song.hp.type = 'highpass'; song.hp.frequency.value = 40;
    song.lp = ac.createBiquadFilter(); song.lp.type = 'lowpass'; song.lp.frequency.value = 11000; song.lp.Q.value = .6;
    song.delay = ac.createDelay(1.4); song.delay.delayTime.value = .28;
    song.dg = ac.createGain(); song.dg.gain.value = .12;
    song.hp.connect(song.lp); song.lp.connect(song.gain);
    song.gain.connect(dest);
    song.gain.connect(song.delay); song.delay.connect(song.dg); song.dg.connect(dest);

    prepBedEl();
    try {
      bedEl.srcObject = dest.stream;
      var playP = bedEl.play();
      usingEl = true;
      if (playP && playP.then) playP.then(function () { usingEl = true; paintHear(); }, function () { fallbackToWav(); });
    } catch (e) { fallbackToWav(); }

    function seam(d, sr) {
      var n = Math.min(d.length >> 2, Math.round(sr * .08)), L = d.length - n;
      for (var i = 0; i < n; i++) { var u = i / n, a = Math.sin(u * Math.PI / 2), b = Math.cos(u * Math.PI / 2); d[i] = d[i] * a + d[L + i] * b; }
      return L;
    }
    function make(kind, secs) {
      var sr = ac.sampleRate, n = Math.round(secs * sr), d = new Float32Array(n), i, w;
      if (kind === 0) for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      else if (kind === 1) {
        var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (i = 0; i < n; i++) {
          w = Math.random() * 2 - 1;
          b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852;
          b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
          d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362; b6 = w * .115926;
        }
      } else { var last = 0; for (i = 0; i < n; i++) { w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last; } }
      var L = seam(d, sr), rms = 0; for (i = 0; i < L; i++) rms += d[i] * d[i]; rms = Math.sqrt(rms / L) || 1;
      var k = .11 / rms; for (i = 0; i < L; i++) d[i] *= k;
      var buf = ac.createBuffer(1, L, sr); buf.getChannelData(0).set(d.subarray(0, L));
      return { buf: buf, data: d.subarray(0, L) };
    }
    function startBed(name, kind) {
      var g = ac.createGain(); g.gain.value = 0; g.connect(hp);
      var made = [6.1, 9.7].map(function (secs) { return make(kind, secs); });
      made.forEach(function (m, i) {
        var src = ac.createBufferSource(); src.buffer = m.buf; src.loop = true;
        var pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
        if (pan) { pan.pan.value = i ? .18 : -.18; src.connect(pan); pan.connect(g); }
        else src.connect(g);
        src.start();
      });
      beds[name] = { g: g, raw: made[0].data };
    }
    startBed('white', 0); startBed('pink', 1); startBed('brown', 2);

    function fallbackToWav() {
      fallback = true;
      try { master.connect(ac.destination); } catch (e) {}
      try {
        var p = PAIRS[pair], sr = ac.sampleRate, secs = 6, n = Math.round(secs * sr), d = new Float32Array(n);
        ['white', 'pink', 'brown'].forEach(function (k) {
          var w = p.beds[k] || 0; if (w <= 0 || !beds[k]) return;
          var src = beds[k].raw, i;
          for (i = 0; i < n; i++) d[i] += src[i % src.length] * w;
        });
        if (blobUrl) try { URL.revokeObjectURL(blobUrl); } catch (e2) {}
        blobUrl = URL.createObjectURL(encodeWav(d, sr));
        bedEl.removeAttribute('srcObject');
        try { bedEl.srcObject = null; } catch (e3) {}
        bedEl.src = blobUrl; bedEl.loop = true; bedEl.play();
      } catch (e4) {}
    }

    function loadSong() {
      if (song.buf || song.loading) return song.ready;
      song.loading = true;
      song.ready = fetch((window.CKS_SONG_URL||'media/audio/lost-in-time.mp3')).then(function (r) { return r.arrayBuffer(); }).then(function (b) {
        return ac.decodeAudioData(b);
      }).then(function (buf) { song.buf = buf; song.loading = false; if (song.wanted) scheduleSong(); }).catch(function () { song.loading = false; });
      return song.ready;
    }
    function scheduleSong() {
      if (!song.buf || !song.wanted) return;
      var dur = song.buf.duration, t0 = Math.max(ac.currentTime + 0.04, song.nextT || ac.currentTime);
      var src = ac.createBufferSource(); src.buffer = song.buf;
      var g = ac.createGain(); src.connect(g); g.connect(song.hp);
      var xf = Math.min(SONG_XF, dur * 0.25);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(1, t0 + xf);
      var end = t0 + dur;
      var fadeAt = Math.max(t0 + xf + 0.05, end - xf);
      g.gain.setValueAtTime(1, fadeAt);
      g.gain.linearRampToValueAtTime(0, end);
      src.start(t0);
      song.nextT = end - xf;
      var wait = (song.nextT - ac.currentTime - 0.25) * 1000;
      if (song.timer) clearTimeout(song.timer);
      song.timer = setTimeout(function () { scheduleSong(); }, Math.max(180, wait));
    }
    function followSong(on, f) {
      song.wanted = !!on;
      var t = ac.currentTime;
      if (on) {
        loadSong();
        if (song.buf && (song.nextT < ac.currentTime + 0.1)) { song.nextT = 0; scheduleSong(); }
        song.gain.gain.setTargetAtTime(0.72 * (f == null ? 1 : f) * enterK(), t, .12);
      } else {
        song.gain.gain.setTargetAtTime(0, t, .12);
        if (song.timer) { clearTimeout(song.timer); song.timer = 0; }
        song.nextT = 0;
      }
    }

    var gust = { t: 0 };
    function set(pi, I, f) {
      var p = PAIRS[pi], id = p.id, isSong = !!p.song;
      var audible = (f == null ? 1 : f) * enterK() * vol * pauseU;
      var gain = isSong ? 0 : (.06 + I * .5) * audible;
      var t = ac.currentTime;
      master.gain.setTargetAtTime(gain, t, .08);
      if (fallback && bedEl && !isSong) bedEl.volume = clamp(gain / .5, 0, 1);
      Object.keys(beds).forEach(function (k) {
        var w = isSong ? 0 : ((ex.tune && tuneMix[k] != null) ? tuneMix[k] : (p.beds[k] || 0));
        beds[k].g.gain.setTargetAtTime(w, t, .18);
      });
      dGain.gain.setTargetAtTime(id === 'city' ? .08 : 0, t, .2);
      delay.delayTime.setTargetAtTime(.16, t, .2);
      followSong(isSong, audible);
      if (id === 'snow') { hp.frequency.setTargetAtTime(180 + I * 500, t, .1); lp.frequency.setTargetAtTime(8000 + I * 4000, t, .1); }
      else if (id === 'rain' || id === 'city') { hp.frequency.setTargetAtTime(id === 'city' ? 120 : 80, t, .1); lp.frequency.setTargetAtTime((id === 'city' ? 2800 : 6000) + I * 5000, t, .1); }
      else if (id === 'sea') { hp.frequency.setTargetAtTime(30, t, .1); lp.frequency.setTargetAtTime(280 + I * 700, t, .2); }
      else if (id === 'wind' || id === 'desert') { hp.frequency.setTargetAtTime(id === 'desert' ? 80 : 40, t, .1); }
      else if (id === 'fire') { hp.frequency.setTargetAtTime(60, t, .1); lp.frequency.setTargetAtTime(800 + I * 1800, t, .1); }
      else { hp.frequency.setTargetAtTime(50, t, .1); lp.frequency.setTargetAtTime(4000 + I * 4000, t, .1); }
    }
    function tickGust() {
      if (!audio) return;
      var id = pid(), I = intensity * fade;
      if (id === 'wind' || id === 'sea' || id === 'storm' || id === 'desert' || id === 'fire') {
        gust.t += 0.05;
        var wob = id === 'sea' ? Math.sin(gust.t * .15) * (80 + I * 200) : (Math.sin(gust.t * .4) * .5 + Math.sin(gust.t * .17) * .5) * (400 + I * 1800);
        var base = id === 'sea' ? 280 + I * 700 : id === 'fire' ? 800 + I * 1800 : id === 'wind' || id === 'desert' ? 700 + I * 2200 : 1400;
        lp.frequency.setTargetAtTime(Math.max(160, base + wob), ac.currentTime, .2);
        if (id === 'sea') {
          var swell = 1 + Math.sin(gust.t * .12) * (.12 + I * .28);
          master.gain.setTargetAtTime((.06 + intensity * .5) * fade * swell, ac.currentTime, .4);
        }
      }
      setTimeout(tickGust, 80);
    }
    function burst(kind, I) {
      var n, d, i, last, src, f, g, nowT = ac.currentTime;
      if (kind === 'thunder') {
        n = Math.round(ac.sampleRate * (1.4 + Math.random() * 1.2)); d = new Float32Array(n); last = 0;
        for (i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * .04) / 1.04; var env = Math.sin((i / n) * Math.PI); d[i] = last * env * env; }
        f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180 + I * 220;
        g = ac.createGain(); g.gain.value = (.18 + I * .4) * fade;
      } else {
        n = Math.round(ac.sampleRate * (.03 + Math.random() * .06)); d = new Float32Array(n);
        for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
        f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 2400; f.Q.value = 1.2;
        g = ac.createGain(); g.gain.value = (.08 + I * .16) * fade;
      }
      var buf = ac.createBuffer(1, n, ac.sampleRate); buf.getChannelData(0).set(d);
      src = ac.createBufferSource(); src.buffer = buf;
      src.connect(f); f.connect(g); g.connect(master);
      src.start(nowT);
    }

    set(pair, intensity, fade);
    tickGust();
    loadSong();
    return {
      ac: ac, set: set, dest: dest,
      thunder: function () { burst('thunder', intensity); },
      crackle: function (I) { burst('crackle', I); },
      resume: function () {
        try { if (ac.state === 'suspended') ac.resume(); } catch (e) {}
        prepBedEl();
        try { if (bedEl && bedEl.paused) bedEl.play(); } catch (e2) {}
        if (song.wanted && song.buf) scheduleSong();
        return ac.state;
      },
      hearing: function () {
        var elOn = !!(bedEl && !bedEl.paused && (bedEl.srcObject || bedEl.currentSrc));
        return ac.state === 'running' && (elOn || fallback);
      },
      usingEl: function () { return usingEl && !!(bedEl && !bedEl.paused); },
      fallback: function () { return fallback; }
    };
  }

  function paintHear() {
    var on = !!(audio && audio.hearing && audio.hearing() && fade > .02);
    hearing = on;
    html.classList.toggle('heard', on);
    if (on) { wakeOn = false; wakeEl.classList.remove('on'); }
    else if (!quiet) { wakeEl.textContent = 'tap to hear'; wakeEl.classList.add('on'); }
  }

  function startAudio() {
    /* must be called from click or touchend, not pointerdown */
    if (!audio) audio = makeAudio();
    if (!audio) { paintHear(); return; }
    audio.resume();
    audio.set(pair, intensity, fade);
    setTimeout(paintHear, 60);
    setTimeout(paintHear, 400);
  }

  function paintDots() {
    dotsEl.innerHTML = PAIRS.map(function (p, i) { return '<i' + (i === pair ? ' class="on"' : '') + '></i>'; }).join('');
  }
  function showName() {
    nameEl.textContent = PAIRS[pair].name;
    nameEl.classList.toggle('long', PAIRS[pair].name.length > 8);
    nameEl.classList.add('show');
    clearTimeout(nameT); nameT = setTimeout(function () { nameEl.classList.remove('show'); }, 1400);
  }
  function showDots() {
    dotsEl.classList.add('show');
    clearTimeout(dotsT); dotsT = setTimeout(function () { dotsEl.classList.remove('show'); }, 1600);
  }
  function showInten() {
    intenFill.style.height = (8 + intensity * 92) + '%';
    intenEl.classList.add('show');
    clearTimeout(intenT); intenT = setTimeout(function () { intenEl.classList.remove('show'); }, 1200);
  }
  function setPair(i, q) {
    i = ((i % PAIRS.length) + PAIRS.length) % PAIRS.length;
    if (i === pair && !q) return;
    pair = i;
    /* no seed, no resize, no mood roll — particles keep running; wash crossfades */
    if (envOn()) applyEnvSnap(pid());
    if (ex.tune) paintTune();
    if (feelOpen) paintFeel();
    paintDots(); showDots();
    if (!q && !quiet) showName();
    if (audio) audio.set(pair, intensity, fade);
    if (!q) haptic(10);
  }
  function setIntensity(v, q) {
    intensity = clamp(v, 0, 1);
    if (!q) showInten();
    if (audio) audio.set(pair, intensity, fade);
  }
  function applyRed() {
    html.classList.toggle('red', red);
    html.classList.toggle('dimmer', red);
    html.classList.toggle('dimmed', light < .98);
    html.style.setProperty('--red-light', light.toFixed(3));
    hazeKey = '';
    paintDimmer();
  }
  function setRed(on) { red = !!on; applyRed(); }
  function setLight(v) {
    light = clamp(v, .08, 1);
    applyRed();
  }
  function paintDimmer() {
    var MIN = .08, f = (light - MIN) / (1 - MIN);
    dimmer.querySelector('.dm-fill').style.height = (f * 100).toFixed(1) + '%';
    dimmer.querySelector('.dm-knob').style.bottom = (f * 100).toFixed(1) + '%';
    dimmer.querySelector('.dm-v').textContent = Math.round(light * 100) + '%';
    dimmer.setAttribute('aria-valuenow', Math.round(light * 100));
  }
  function goBack() {
    if (extrasOpen) { closeExtras(); return; }
    if (tuneOpen) { closeTune(); return; }
    if (feelOpen) { closeFeel(); return; }
    if (envOpen || envOpenT > 0.02) { closeEnv(); return; }
    if (typeof window.CKS_NOISE_BACK === 'function') { window.CKS_NOISE_BACK(); return; }
    if (window.history.length > 1) window.history.back();
    else location.href = 'index.html#sound';
  }
  function paintLeft() {
    if (!endAt) { leftEl.classList.remove('show'); leftEl.textContent = ''; return; }
    var s = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    var m = Math.floor(s / 60), r = s % 60;
    leftEl.textContent = m + ':' + (r < 10 ? '0' : '') + r;
    leftEl.classList.add('show');
  }
  function setTimer(m) {
    mins = m || 0;
    endAt = mins ? Date.now() + mins * 60000 : 0;
    fading = false; fade = 1;
    if (audio) audio.set(pair, intensity, fade);
    [].forEach.call(sleepEl.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', +b.dataset.m === mins);
    });
    paintLeft(); leftTick = Date.now();
    sleepEl.hidden = true;
    if (ex.tune) paintTune();
    if (tuneOpen) tuneIdle = now();
  }


  /* extras, sliders, 3d dial, tune, pause — all off unless a switch is on */
  function loadExtras() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(EXSTORE) || '{}'); } catch (e) { o = {}; }
    EX_KEYS.forEach(function (row) { ex[row.k] = !!o[row.k]; });
    var q = (Q.extras || '').trim();
    if (q) {
      Object.keys(ex).forEach(function (k) { ex[k] = false; });
      if (q === 'all' || q === '1') {
        Object.keys(ex).forEach(function (k) { ex[k] = true; });
      } else if (q !== 'off' && q !== '0' && q !== 'none') {
        q.split(',').forEach(function (k) {
          k = k.trim().toLowerCase();
          if (k === 'reflections') k = 'reflect';
          if (k === '3d' || k === '3ddial' || k === 'ring' || k === 'orbit') k = 'orb';
          if (k in ex) ex[k] = true;
        });
      }
    }
  }
  function saveExtras() {
    try { localStorage.setItem(EXSTORE, JSON.stringify(ex)); } catch (e) {}
  }
  function resetEnvDefaults() {
    closeEnv(); closeFeel();
    env = defEnv();
    envNow.wind = envNow.density = envNow.light = envNow.warmth = envNow.glow = envNow.height = .5;
    envNow.tilt = 0; tiltLean = 0; tiltSamp = 0;
    hazeKey = '';
  }
  function setExtra(k, on) {
    if (k === 'reflections') k = 'reflect';
    if (k === '3d' || k === '3ddial' || k === 'ring' || k === 'orbit') k = 'orb';
    if (!(k in ex)) return;
    var want = on == null ? !ex[k] : !!on;
    if (ex[k] === want) { syncExtrasDom(); return; }
    ex[k] = want;
    if ((k === 'dial' || k === 'orb') && !envOn()) resetEnvDefaults();
    if (k === 'dial' && !want) closeFeel();
    if (k === 'orb' && !want) closeEnv();
    if (k === 'dial' && want) { loadStore(); applyEnvSnap(pid()); }
    if (k === 'orb' && want) { loadStore(); applyEnvSnap(pid()); }
    if (k === 'tune' && !want) { closeTune(); vol = 1; tuneMix = {}; if (audio) audio.set(pair, intensity, fade); }
    if (k === 'tune' && want) { loadTune(); paintTune(); }
    if (k === 'pause' && !want) { if (pauseOn) { pauseOn = false; pauseU = 1; html.classList.remove('paused'); if (audio) audio.set(pair, intensity, fade); } }
    if (k === 'touch' && !want) { HANDS = {}; handN = 0; }
    saveExtras();
    syncExtrasDom();
    haptic(8);
  }
  function setExtras(map) {
    if (!map) return;
    if (map === 'all' || map === true) { Object.keys(ex).forEach(function (k) { setExtra(k, true); }); return; }
    if (map === 'off' || map === false) { Object.keys(ex).forEach(function (k) { setExtra(k, false); }); return; }
    Object.keys(map).forEach(function (k) { setExtra(k, map[k]); });
  }
  function syncExtrasDom() {
    EX_KEYS.forEach(function (row) {
      var el = extrasEl.querySelector('[data-k="' + row.k + '"]');
      if (!el) return;
      el.classList.toggle('on', !!ex[row.k]);
      var em = el.querySelector('em');
      if (em) em.textContent = ex[row.k] ? 'on' : 'off';
    });
    html.classList.toggle('ex-dial', !!ex.dial);
    html.classList.toggle('ex-orb', !!ex.orb);
    html.classList.toggle('ex-tune', !!ex.tune);
    html.classList.toggle('ex-pause', !!ex.pause);
    html.classList.toggle('ex-touch', !!ex.touch);
    html.classList.toggle('ex-reflect', !!ex.reflect);
    html.classList.toggle('ex-moon', !!ex.moon);
    if (envdot) envdot.hidden = !envOn();
    if (!ex.orb) { if (envdialEl) { envdialEl.hidden = true; envdialEl.classList.remove('open'); } html.classList.remove('env-open'); }
    else syncDialDom();
    if (!ex.dial && envsheet) { envsheet.hidden = true; envsheet.classList.remove('open'); html.classList.remove('feel-open'); feelOpen = false; }
    if (!ex.tune && tuneEl) { tuneEl.hidden = true; tuneEl.classList.remove('open'); html.classList.remove('tune-open'); }
    if (!ex.pause) { html.classList.remove('paused'); if (pauseEl) pauseEl.classList.remove('flash'); }
  }
  function openExtras() {
    closeEnv(); closeTune(); closeFeel();
    extrasOpen = true; extrasEl.hidden = false;
    requestAnimationFrame(function () { extrasEl.classList.add('open'); });
    html.classList.add('extras-open');
  }
  function closeExtras() {
    extrasOpen = false; extrasEl.classList.remove('open'); html.classList.remove('extras-open');
    setTimeout(function () { if (!extrasOpen) extrasEl.hidden = true; }, 360);
  }
  function toggleExtras() { if (extrasOpen) closeExtras(); else openExtras(); }

  function clampEnv(v) { return clamp(v, 0, 1); }
  function loadStore() {
    envStore = {};
    try { envStore = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { envStore = {}; }
  }
  function saveStoreSoon() {
    clearTimeout(envSaveT);
    envSaveT = setTimeout(function () {
      try { localStorage.setItem(STORE, JSON.stringify(envStore)); } catch (e) {}
    }, 180);
  }
  function applyEnvSnap(id) {
    var e = envStore[id];
    env = e ? { wind: e.wind, density: e.density, light: e.light, warmth: e.warmth, glow: e.glow, height: e.height, tilt: !!e.tilt } : defEnv();
    envNow.wind = env.wind; envNow.density = env.density; envNow.light = env.light;
    envNow.warmth = env.warmth; envNow.glow = env.glow; envNow.height = env.height;
    envNow.tilt = env.tilt ? 1 : 0;
    hazeKey = '';
    if (feelOpen) paintFeel();
  }
  function persistEnv() {
    envStore[pid()] = { wind: env.wind, density: env.density, light: env.light, warmth: env.warmth, glow: env.glow, height: env.height, tilt: !!env.tilt };
    saveStoreSoon();
  }
  function setEnvVal(k, v) {
    if (k === 'tilt') {
      env.tilt = !!v;
      if (env.tilt) ensureTilt();
      persistEnv();
      if (feelOpen) paintFeel();
      return;
    }
    env[k] = clampEnv(v); persistEnv();
    if (feelOpen) paintFeel();
  }
  function onOrient(e) { tiltSamp = clamp((e.gamma || 0) / 28, -1, 1); }
  function ensureTilt() {
    if (tiltOnDev || !env.tilt || !envOn()) return;
    tiltOnDev = true;
    window.addEventListener('deviceorientation', onOrient, true);
  }
  function paintFeel() {
    if (!envsheet) return;
    ENV_CONT.forEach(function (c) {
      var el = envsheet.querySelector('[data-k="' + c.k + '"]'); if (!el) return;
      if (c.kind === 'toggle') {
        el.classList.toggle('on', !!env.tilt);
        var emt = el.querySelector('em'); if (emt) emt.textContent = env.tilt ? 'on' : 'off';
        return;
      }
      var v = env[c.k], pct = (clamp(v, 0, 1) * 100).toFixed(1);
      var fill = el.querySelector('.tune-fill'), knob = el.querySelector('.tune-knob'), em = el.querySelector('em');
      if (fill) fill.style.width = pct + '%';
      if (knob) knob.style.left = pct + '%';
      if (em) em.textContent = Math.round(clamp(v, 0, 1) * 100) + '';
    });
  }
  function openFeel() {
    if (!ex.dial) return;
    closeExtras(); closeTune(); closeEnv();
    feelOpen = true; envsheet.hidden = false; feelIdle = now();
    paintFeel();
    requestAnimationFrame(function () { envsheet.classList.add('open'); });
    html.classList.add('feel-open');
    haptic(8);
  }
  function closeFeel() {
    if (!feelOpen) return;
    feelOpen = false; feelDrag = null;
    envsheet.classList.remove('open'); html.classList.remove('feel-open');
    setTimeout(function () { if (!feelOpen) envsheet.hidden = true; }, 360);
  }
  function syncDialDom() {
    if (!envdialEl) return;
    envdialEl.hidden = !envOpen && envOpenT <= 0;
    envdialEl.classList.toggle('open', envOpen && !envFolding);
    html.classList.toggle('env-open', envOpen);
  }
  function openEnv() {
    if (!ex.orb) return;
    closeExtras(); closeTune(); closeFeel();
    envOpen = true; envFolding = false; envIdle = now();
    if (envOpenT <= 0) envOpenT = 0.001;
    envOrb.tx = 0; envOrb.ty = 0;
    syncDialDom(); haptic(10);
  }
  function closeEnv() {
    if (!envOpen && envOpenT <= 0) return;
    envFolding = true; envOpen = true; envDragging = false;
    envOrb.tx = 0; envOrb.ty = 0;
    envIdle = now();
    if (envOpenT <= 0) envOpenT = 0.001;
    syncDialDom();
  }
  function dotCenter() {
    if (envdot && !envdot.hidden) {
      var r = envdot.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: W / 2, y: H - 70 };
  }
  function ringCenter(u) {
    var d = dotCenter();
    return { x: lerp(d.x, W / 2, u), y: lerp(d.y, H * 0.54, u) };
  }
  function drawEnvDial() {
    if (!erx) return;
    erx.clearRect(0, 0, W, H);
    var u = sstep(envOpenT);
    if (u <= 0.001) return;
    var d = dotCenter(), c = ringCenter(u);
    var yaw = envOrb.x * 0.55, pitch = envOrb.y * 0.45;
    var R = Math.min(W, H) * 0.28 * (0.12 + 0.88 * u);
    var fl = 520;
    function proj(x, y, z) {
      var y1 = y * Math.cos(pitch) - z * Math.sin(pitch);
      var z1 = y * Math.sin(pitch) + z * Math.cos(pitch);
      var x2 = x * Math.cos(yaw) + z1 * Math.sin(yaw);
      var z2 = -x * Math.sin(yaw) + z1 * Math.cos(yaw);
      var sc = fl / (fl + z2);
      return [c.x + x2 * sc, c.y + y1 * sc, sc];
    }
    erx.save();
    erx.globalAlpha = u;
    erx.strokeStyle = inkRgba(0.28 * u);
    erx.lineWidth = 1;
    erx.beginPath(); erx.moveTo(d.x, d.y); erx.lineTo(c.x, c.y + R * 0.92); erx.stroke();
    function ring(rad, a) {
      erx.strokeStyle = inkRgba(a);
      erx.lineWidth = 1.1;
      erx.beginPath();
      var n = 64, i, p0;
      for (i = 0; i <= n; i++) {
        var ang = (i / n) * Math.PI * 2;
        p0 = proj(Math.cos(ang) * rad, Math.sin(ang) * rad, 0);
        if (i === 0) erx.moveTo(p0[0], p0[1]); else erx.lineTo(p0[0], p0[1]);
      }
      erx.stroke();
    }
    ring(R, 0.55);
    ring(R * 0.62, 0.28);
    var sel = ENV_CONT.filter(function (row) { return row.k === envSel; })[0];
    var val = sel && sel.kind === 'dial' ? env[sel.k] : (sel && env[sel.k] ? 1 : 0);
    var tickA = -Math.PI / 2 + val * Math.PI * 2 * 0.85;
    var tp = proj(Math.cos(tickA) * R * 0.62, Math.sin(tickA) * R * 0.62, 0);
    erx.fillStyle = inkRgba(0.9);
    erx.beginPath(); erx.arc(tp[0], tp[1], 2.4, 0, 6.283); erx.fill();
    envStars = [];
    var i, e, ang, p1, on, lab;
    erx.font = '300 11px Poppins, sans-serif';
    erx.textAlign = 'center'; erx.textBaseline = 'middle';
    for (i = 0; i < ENV_CONT.length; i++) {
      e = ENV_CONT[i];
      ang = -Math.PI / 2 + i * (Math.PI * 2 / ENV_CONT.length);
      p1 = proj(Math.cos(ang) * R, Math.sin(ang) * R, e.k === envSel ? 12 : 0);
      on = e.k === envSel || (e.kind === 'toggle' && env[e.k]);
      if (e.k === envSel) {
        erx.strokeStyle = inkRgba(0.4);
        erx.beginPath(); erx.moveTo(c.x, c.y); erx.lineTo(p1[0], p1[1]); erx.stroke();
      }
      erx.fillStyle = inkRgba(on ? 0.95 : 0.5);
      erx.beginPath(); erx.arc(p1[0], p1[1], on ? 3.2 : 2.2, 0, 6.283); erx.fill();
      if (on) {
        erx.strokeStyle = inkRgba(0.35);
        erx.beginPath(); erx.arc(p1[0], p1[1], 7, 0, 6.283); erx.stroke();
      }
      lab = proj(Math.cos(ang) * (R + 22), Math.sin(ang) * (R + 22), 0);
      erx.fillStyle = inkRgba(on ? 0.78 : 0.42);
      erx.fillText(e.name, lab[0], lab[1]);
      envStars.push({ k: e.k, x: p1[0], y: p1[1], kind: e.kind });
    }
    erx.fillStyle = inkRgba(0.7);
    erx.font = '300 12px Poppins, sans-serif';
    var label = sel ? sel.name : '';
    var shown = sel && sel.kind === 'toggle' ? (env[sel.k] ? 'on' : 'off') : (sel ? String(Math.round(env[sel.k] * 100)) : '');
    erx.fillText(label, c.x, c.y - 8);
    erx.globalAlpha = u * 0.55;
    erx.fillText(shown, c.x, c.y + 10);
    erx.restore();
  }
  function hitStar(x, y) {
    var i, row, best = null, bd = 28;
    for (i = 0; i < envStars.length; i++) {
      row = envStars[i];
      var dd = Math.hypot(x - row.x, y - row.y);
      if (dd < 22 && dd < bd) { bd = dd; best = row; }
    }
    return best;
  }
  function onRing(x, y) {
    var c = ringCenter(sstep(envOpenT));
    var dist = Math.hypot(x - c.x, y - c.y);
    var R = Math.min(W, H) * 0.28;
    return dist < R + 36;
  }
  function angleAt(x, y) {
    var c = ringCenter(sstep(envOpenT));
    return Math.atan2(y - c.y, x - c.x);
  }
  var dialG = null;
  function onEnvDot(e) {
    if (!envOn()) return;
    e.preventDefault(); e.stopPropagation();
    try { envdot.setPointerCapture(e.pointerId); } catch (x) {}
    dialG = { kind: 'dot', x: e.clientX, y: e.clientY, moved: false };
  }
  function onEnvDotMove(e) {
    if (!dialG || dialG.kind !== 'dot') return;
    if (Math.hypot(e.clientX - dialG.x, e.clientY - dialG.y) > 8) dialG.moved = true;
    if (ex.orb && dialG.moved && e.clientY < dialG.y - 16 && !envOpen) { closeFeel(); openEnv(); }
  }
  function onEnvDotUp() {
    if (!dialG || dialG.kind !== 'dot') return;
    var moved = dialG.moved; dialG = null;
    if (moved) return;
    if (ex.orb) {
      if (envOpen || envOpenT > .2) closeEnv(); else { closeFeel(); openEnv(); }
    } else if (ex.dial) {
      if (feelOpen) closeFeel(); else openFeel();
    }
  }
  function onEnvPointer(e) {
    if (!ex.orb || !envOpen || envFolding) return;
    if (e.type === 'pointerdown') {
      e.preventDefault(); e.stopPropagation();
      var star = hitStar(e.clientX, e.clientY);
      if (star) {
        envSel = star.k;
        if (star.kind === 'toggle') { setEnvVal(star.k, !env[star.k]); haptic(12); }
        else haptic(8);
        envIdle = now();
        envDragging = true;
        dialG = { kind: 'turn', x: e.clientX, y: e.clientY, ang: angleAt(e.clientX, e.clientY), v0: env[envSel], moved: false };
        try { envdialEl.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      if (onRing(e.clientX, e.clientY)) {
        envIdle = now();
        envDragging = true;
        dialG = { kind: 'turn', x: e.clientX, y: e.clientY, ang: angleAt(e.clientX, e.clientY), v0: env[envSel], moved: false };
        try { envdialEl.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      closeEnv();
    } else if (e.type === 'pointermove') {
      if (!dialG || dialG.kind !== 'turn') return;
      var dang = angleAt(e.clientX, e.clientY) - dialG.ang;
      if (dang > Math.PI) dang -= Math.PI * 2;
      if (dang < -Math.PI) dang += Math.PI * 2;
      if (Math.abs(dang) > 0.03) dialG.moved = true;
      envOrb.tx = clamp((e.clientX - dialG.x) / 90, -1, 1);
      envOrb.ty = clamp((e.clientY - dialG.y) / 90, -1, 1);
      var spec = ENV_CONT.filter(function (row) { return row.k === envSel; })[0];
      if (spec && spec.kind !== 'toggle') setEnvVal(envSel, clamp(dialG.v0 + dang / (Math.PI * 1.35), 0, 1));
      envIdle = now();
    } else if (e.type === 'pointerup' || e.type === 'pointercancel') {
      if (!dialG || dialG.kind !== 'turn') return;
      dialG = null; envDragging = false;
      envOrb.tx = 0; envOrb.ty = 0;
      envIdle = now();
    }
  }

  function loadTune() {
    try {
      var o = JSON.parse(localStorage.getItem(TUNE) || '{}');
      if (o && typeof o.vol === 'number') vol = clamp(o.vol, 0, 1);
      if (o && o.mix) tuneMix = o.mix;
    } catch (e) {}
  }
  function saveTune() {
    try { localStorage.setItem(TUNE, JSON.stringify({ vol: vol, mix: tuneMix })); } catch (e) {}
  }
  function paintTune() {
    if (!tuneEl) return;
    function row(k, v) {
      var el = tuneEl.querySelector('[data-k="' + k + '"]'); if (!el) return;
      var fill = el.querySelector('.tune-fill'), knob = el.querySelector('.tune-knob'), em = el.querySelector('em');
      var pct = (clamp(v, 0, 1) * 100).toFixed(1);
      if (fill) fill.style.width = pct + '%';
      if (knob) knob.style.left = pct + '%';
      if (em) em.textContent = Math.round(clamp(v, 0, 1) * 100) + '';
    }
    row('vol', vol);
    var beds = PAIRS[pair].beds;
    row('white', tuneMix.white != null ? tuneMix.white : beds.white);
    row('pink', tuneMix.pink != null ? tuneMix.pink : beds.pink);
    row('brown', tuneMix.brown != null ? tuneMix.brown : beds.brown);
    [].forEach.call(tuneEl.querySelectorAll('.tune-timer button'), function (b) {
      b.classList.toggle('on', +b.dataset.m === mins);
    });
  }
  function openTune() {
    if (!ex.tune) return;
    closeExtras(); closeEnv(); closeFeel();
    tuneOpen = true; tuneEl.hidden = false; tuneIdle = now();
    paintTune();
    requestAnimationFrame(function () { tuneEl.classList.add('open'); });
    html.classList.add('tune-open');
    haptic(8);
  }
  function closeTune() {
    if (!tuneOpen) return;
    tuneOpen = false; tuneEl.classList.remove('open'); html.classList.remove('tune-open');
    setTimeout(function () { if (!tuneOpen) tuneEl.hidden = true; }, 360);
  }
  function setPaused(on) {
    if (!ex.pause) return;
    pauseOn = !!on;
    html.classList.toggle('paused', pauseOn);
    if (pauseEl) {
      pauseEl.classList.remove('flash');
      void pauseEl.offsetWidth;
      pauseEl.classList.add('flash');
      clearTimeout(pauseGlyphT);
      pauseGlyphT = setTimeout(function () { pauseEl.classList.remove('flash'); }, 900);
    }
    if (audio) audio.set(pair, intensity, fade);
    haptic(10);
  }
  function maybeDoubleTap(x, y) {
    if (!ex.pause) { lastTapAt = 0; return false; }
    var t = now();
    if (t - lastTapAt < 320 && Math.hypot(x - lastTapX, y - lastTapY) < 48) {
      lastTapAt = 0;
      if (t - audioAt < 500) return false;
      setPaused(!pauseOn); return true;
    }
    lastTapAt = t; lastTapX = x; lastTapY = y;
    return false;
  }
  function noteHand(e) {
    if (!ex.touch) return;
    if (!HANDS[e.pointerId]) handN += 1;
    HANDS[e.pointerId] = { x: e.clientX, y: e.clientY, t: now() };
    touchRipple(e.clientX, e.clientY, 0.4);
  }
  function dropHand(id) {
    if (HANDS[id]) { delete HANDS[id]; if (handN > 0) handN -= 1; }
  }
  function startTwoHold() {
    if (!ex.tune || twoHoldT) return;
    twoHoldT = setTimeout(function () {
      twoHoldT = 0;
      if (twoHold && twoHold.n >= 2) openTune();
    }, 420);
  }
  function clearTwoHold() { if (twoHoldT) { clearTimeout(twoHoldT); twoHoldT = 0; } twoHold = null; }

  /* gestures */
  var g = null, holdT = 0, lastTap = 0, lastDim = .45, foldT = 0;
  function onDiscDown(e) {
    e.preventDefault(); e.stopPropagation();
    try { disc.setPointerCapture(e.pointerId); } catch (x) {}
    g = { kind: 'disc', x: e.clientX, y: e.clientY, swipe: false };
  }
  function onDiscMove(e) {
    if (!g || g.kind !== 'disc') return;
    if (!g.swipe && Math.hypot(e.clientX - g.x, e.clientY - g.y) > 10) g.swipe = true;
  }
  function onDiscUp(e) {
    if (!g || g.kind !== 'disc') return;
    var dx = e.clientY - g.y, sw = g.swipe; g = null;
    if (sw) {
      if (Math.abs(dx) < 28) return;
      if (!red) setRed(true);
      setLight(light + (dx > 0 ? -.2 : .2));
      haptic(10); return;
    }
    var t = now();
    if (t - lastTap < 320) { lastTap = 0; setRed(true); setLight(1); haptic(16); return; }
    lastTap = t;
    setRed(!red); haptic(10);
  }
  disc.addEventListener('pointerdown', onDiscDown);
  disc.addEventListener('pointermove', onDiscMove);
  disc.addEventListener('pointerup', onDiscUp);
  disc.addEventListener('pointercancel', function () { if (g && g.kind === 'disc') g = null; });

  var dimDrag = null;
  dimmer.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation();
    try { dimmer.setPointerCapture(e.pointerId); } catch (x) {}
    dimDrag = { y: e.clientY, t: now(), moved: false };
    clearTimeout(foldT); dimmer.classList.add('open', 'live');
  });
  dimmer.addEventListener('pointermove', function (e) {
    if (!dimDrag) return;
    if (Math.abs(e.clientY - dimDrag.y) > 4) dimDrag.moved = true;
    if (dimDrag.moved) {
      var r = dimmer.querySelector('.dm-track').getBoundingClientRect();
      var f = clamp((r.bottom - e.clientY) / r.height, 0, 1);
      setLight(.08 + f * .92);
    }
  });
  function dimUp() {
    if (!dimDrag) return;
    var d = dimDrag; dimDrag = null;
    clearTimeout(foldT); foldT = setTimeout(function () { dimmer.classList.remove('open', 'live'); }, 1200);
    if (!d.moved && now() - d.t < 400) {
      if (light < .98) { lastDim = light; setLight(1); } else setLight(lastDim);
      haptic(16);
    }
  }
  dimmer.addEventListener('pointerup', dimUp);
  dimmer.addEventListener('pointercancel', dimUp);

  function hideSleepSoon() { setTimeout(function () { if (!g) sleepEl.hidden = true; }, 2200); }
  var SWIPE = 40;
  canvas.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    noteHand(e);
    if (ex.tune) {
      if (!twoHold) twoHold = { n: 0, ids: {} };
      if (!twoHold.ids[e.pointerId]) { twoHold.ids[e.pointerId] = 1; twoHold.n++; }
      if (twoHold.n >= 2) startTwoHold();
    }
    g = { kind: 'env', id: e.pointerId, x: e.clientX, y: e.clientY, ix: intensity, t: now(), moved: false, back: e.clientX < 22 };
    holdT = setTimeout(function () {
      if (!g || g.moved) return;
      sleepEl.hidden = false; hideSleepSoon();
    }, 650);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (ex.touch && HANDS[e.pointerId]) {
      HANDS[e.pointerId].x = e.clientX; HANDS[e.pointerId].y = e.clientY;
      touchRipple(e.clientX, e.clientY, 0.2);
    }
    if (!g || g.kind !== 'env' || (g.id != null && e.pointerId !== g.id)) return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    var thresh = ex.touch ? 16 : 8;
    if (!g.moved && Math.hypot(dx, dy) > thresh) { g.moved = true; clearTimeout(holdT); clearTwoHold(); }
    if (g.back) {
      var p = clamp(dx / 72, 0, 1);
      backhint.style.transform = 'translate(' + Math.min(18, dx * .4) + 'px, -50%)';
      backhint.classList.toggle('on', p > 0);
      return;
    }
    if (!g.moved) return;
    var axisKick = ex.touch ? 22 : 14;
    if (g.axis == null && Math.hypot(dx, dy) > axisKick) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (g.axis === 'y') setIntensity(g.ix - dy / (H * .55));
  });
  canvas.addEventListener('pointerup', function (e) {
    dropHand(e.pointerId);
    if (twoHold && twoHold.ids[e.pointerId]) { delete twoHold.ids[e.pointerId]; twoHold.n--; if (twoHold.n < 2) clearTwoHold(); }
    if (!g || g.kind !== 'env' || (g.id != null && e.pointerId !== g.id)) return;
    clearTimeout(holdT);
    var dx = e.clientX - g.x, dy = e.clientY - g.y, back = g.back, axis = g.axis, moved = g.moved, sx = g.x, sy = g.y;
    g = null;
    backhint.classList.remove('on');
    backhint.style.transform = 'translate(-8px, -50%)';
    if (back && dx > 56) { goBack(); return; }
    var need = ex.touch ? SWIPE : 40;
    if (axis === 'x' && Math.abs(dx) > need) setPair(pair + (dx < 0 ? 1 : -1));
    else if (!moved) {
      if (!sleepEl.hidden) { /* keep the timer sheet */ }
      else maybeDoubleTap(sx, sy);
    }
  });
  canvas.addEventListener('pointercancel', function (e) {
    dropHand(e.pointerId); clearTwoHold();
    clearTimeout(holdT); g = null; backhint.classList.remove('on');
  });

  exbtn.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation();
    toggleExtras(); haptic(8);
  });
  extrasEl.addEventListener('pointerdown', function (e) {
    var row = e.target.closest('.ex-row'); if (!row) return;
    e.preventDefault(); e.stopPropagation();
    setExtra(row.dataset.k, !ex[row.dataset.k]);
  });
  envdot.addEventListener('pointerdown', onEnvDot);
  envdot.addEventListener('pointermove', onEnvDotMove);
  envdot.addEventListener('pointerup', onEnvDotUp);
  envdot.addEventListener('pointercancel', function () { if (dialG && dialG.kind === 'dot') dialG = null; });
  envdialEl.addEventListener('pointerdown', onEnvPointer);
  envdialEl.addEventListener('pointermove', onEnvPointer);
  envdialEl.addEventListener('pointerup', onEnvPointer);
  envdialEl.addEventListener('pointercancel', onEnvPointer);
  envsheet.addEventListener('pointerdown', function (e) {
    var tog = e.target.closest('.env-toggle');
    if (tog) { e.preventDefault(); e.stopPropagation(); setEnvVal('tilt', !env.tilt); feelIdle = now(); haptic(8); return; }
    var rail = e.target.closest('.tune-rail'); if (!rail) return;
    e.preventDefault(); e.stopPropagation();
    var row = rail.closest('.env-row');
    try { rail.setPointerCapture(e.pointerId); } catch (x) {}
    feelDrag = { rail: rail, k: row.dataset.k };
    slideFeel(e);
  });
  envsheet.addEventListener('pointermove', function (e) { if (feelDrag) slideFeel(e); });
  function slideFeel(e) {
    if (!feelDrag) return;
    var r = feelDrag.rail.getBoundingClientRect();
    setEnvVal(feelDrag.k, clamp((e.clientX - r.left) / r.width, 0, 1));
    feelIdle = now();
  }
  function endFeelDrag() { feelDrag = null; feelIdle = now(); }
  envsheet.addEventListener('pointerup', endFeelDrag);
  envsheet.addEventListener('pointercancel', endFeelDrag);
  tuneEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.tune-timer button');
    if (b) { e.preventDefault(); e.stopPropagation(); setTimer(+b.dataset.m); haptic(8); return; }
    var rail = e.target.closest('.tune-rail'); if (!rail) return;
    e.preventDefault(); e.stopPropagation();
    var row = rail.closest('.tune-row');
    try { rail.setPointerCapture(e.pointerId); } catch (x) {}
    tuneDrag = { rail: rail, k: row.dataset.k };
    slideTune(e);
  });
  tuneEl.addEventListener('pointermove', function (e) { if (tuneDrag) slideTune(e); });
  function slideTune(e) {
    if (!tuneDrag) return;
    var r = tuneDrag.rail.getBoundingClientRect();
    var v = clamp((e.clientX - r.left) / r.width, 0, 1);
    if (tuneDrag.k === 'vol') vol = v;
    else tuneMix[tuneDrag.k] = v;
    saveTune(); paintTune();
    if (audio) audio.set(pair, intensity, fade);
    tuneIdle = now();
  }
  function endTuneDrag() { tuneDrag = null; tuneIdle = now(); }
  tuneEl.addEventListener('pointerup', endTuneDrag);
  tuneEl.addEventListener('pointercancel', endTuneDrag);

  sleepEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    setTimer(+b.dataset.m); haptic(10);
  });

  function onUnlockGesture(e) {
    if (audio) return;
    if (e && e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return;
    audioAt = now();
    startAudio();
  }
  document.addEventListener('click', onUnlockGesture, true);
  document.addEventListener('touchend', onUnlockGesture, true);

  function resumeIfNeeded() {
    if (!audio) return;
    audio.resume();
    setTimeout(paintHear, 80);
    setTimeout(paintHear, 400);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') resumeIfNeeded();
  });
  window.addEventListener('focus', resumeIfNeeded);
  window.addEventListener('pageshow', resumeIfNeeded);

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (extrasOpen) { closeExtras(); return; }
      if (tuneOpen) { closeTune(); return; }
      if (feelOpen) { closeFeel(); return; }
      if (envOpen || envOpenT > 0.02) { closeEnv(); return; }
      if (!sleepEl.hidden) { sleepEl.hidden = true; return; }
      goBack();
    }
    if (e.key === 'e' || e.key === 'E') { toggleExtras(); return; }
    if ((e.key === 'p' || e.key === 'P') && ex.pause) { setPaused(!pauseOn); return; }
    if (e.key === 'ArrowRight') setPair(pair + 1);
    if (e.key === 'ArrowLeft') setPair(pair - 1);
    if (e.key === 'ArrowUp') setIntensity(intensity + .06);
    if (e.key === 'ArrowDown') setIntensity(intensity - .06);
    if (e.key === 'r' || e.key === 'R') setRed(!red);
    if (e.key === ' ' || e.key === 'Enter') { startAudio(); e.preventDefault(); }
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 80); });

  /* boot */
  (function init() {
    if (Q.pair) {
      var i = PAIRS.findIndex(function (p) { return p.id === Q.pair || p.name === Q.pair; });
      if (i >= 0) pair = i;
    }
    if (Q.intensity != null) intensity = clamp(parseFloat(Q.intensity), 0, 1);
    if (Q.dim != null) light = clamp(parseFloat(Q.dim), .08, 1);
    if (Q.red === '1' || Q.red === 'true') red = true;
    if (Q.timer) setTimer(parseInt(Q.timer, 10) || 0);
    quiet = Q.quiet === '1';
    WTS[pid()] = 1;
    paintDots(); applyRed(); showInten(); intenEl.classList.remove('show');
    resize(); seed();
    loadExtras();
    if (envOn()) { loadStore(); applyEnvSnap(pid()); }
    if (ex.tune) loadTune();
    syncExtrasDom();
    if (Q.enter === '1') { enterU = 0; entering = true; }
    requestAnimationFrame(frame);
    if (quiet) { wakeOn = false; wakeEl.classList.remove('on'); nameEl.classList.remove('show'); }
    else {
      setTimeout(function () { if (wakeOn) wakeEl.classList.add('on'); }, 700);
      if (Q.enter === '1') setTimeout(function () { if (!quiet) showName(); }, 520);
      else showName();
    }
  })();

  window.CKS_NOISE = {
    pairs: PAIRS.map(function (p) { return p.id; }),
    pair: function () { return PAIRS[pair].id; },
    setPair: function (id) {
      var i = typeof id === 'number' ? id : PAIRS.findIndex(function (p) { return p.id === id; });
      if (i >= 0) setPair(i, true);
    },
    intensity: function () { return intensity; },
    setIntensity: function (v) { setIntensity(v, true); },
    red: function () { return red; },
    setRed: setRed,
    dim: function () { return light; },
    setDim: function (v) { setLight(v); },
    timer: function () { return { mins: mins, left: endAt ? endAt - Date.now() : 0, fade: fade }; },
    setTimer: setTimer,
    startAudio: startAudio,
    startProbe: function () {
      probe = {
        n: 0, drop: 0, clamp: 0, maxDt: 0, minDt: 1, seed: 0,
        t0: (typeof performance !== 'undefined' ? performance.now() : Date.now()),
        sig0: (DROPS[0] && DROPS[0][2]) + ':' + (FLAKES[0] && FLAKES[0][2]) + ':' + (DUST[0] && DUST[0].p),
        dropN0: DROPS.length, flakeN0: FLAKES.length, dustN0: DUST.length,
        extras: { dial: !!ex.dial, orb: !!ex.orb, tune: !!ex.tune, pause: !!ex.pause, touch: !!ex.touch, reflect: !!ex.reflect, moon: !!ex.moon }
      };
    },
    probe: function () {
      if (!probe) return null;
      probe.sig = (DROPS[0] && DROPS[0][2]) + ':' + (FLAKES[0] && FLAKES[0][2]) + ':' + (DUST[0] && DUST[0].p);
      probe.dropN = DROPS.length; probe.flakeN = FLAKES.length; probe.dustN = DUST.length;
      probe.elapsed = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - probe.t0) / 1000;
      probe.tAcc = tAcc;
      return probe;
    },
    state: function () {
      return {
        pair: PAIRS[pair].id, intensity: intensity, red: red, dim: light, fade: fade, mins: mins,
        audio: !!audio, enter: enterU,
        ac: audio && audio.ac ? audio.ac.state : 'none',
        elPaused: bedEl ? bedEl.paused : null,
        srcObject: !!(bedEl && bedEl.srcObject),
        usingEl: !!(audio && audio.usingEl && audio.usingEl()),
        fallback: !!(audio && audio.fallback && audio.fallback()),
        hearing: !!(audio && audio.hearing && audio.hearing()),
        extras: { dial: !!ex.dial, orb: !!ex.orb, tune: !!ex.tune, pause: !!ex.pause, touch: !!ex.touch, reflect: !!ex.reflect, moon: !!ex.moon }
      };
    },
    extras: function () { return { dial: !!ex.dial, orb: !!ex.orb, tune: !!ex.tune, pause: !!ex.pause, touch: !!ex.touch, reflect: !!ex.reflect, moon: !!ex.moon }; },
    setExtras: setExtras,
    setExtra: setExtra
  };
})();
