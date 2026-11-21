/* oz · a room of sound and environment. Generated on the device. */
(function () {
  'use strict';

  var PAIRS = [
    { id: 'snow',      name: 'snow',         beds: { white: 1, pink: .15, brown: 0 } },
    { id: 'rain',      name: 'rain',         beds: { white: .12, pink: 1, brown: .08 } },
    { id: 'sea',       name: 'sea',          beds: { white: 0, pink: .1, brown: 1 } },
    { id: 'wind',      name: 'wind',         beds: { white: .08, pink: .35, brown: 1 } },
    { id: 'storm',     name: 'storm',        beds: { white: .1, pink: .85, brown: .7 } },
    { id: 'fire',      name: 'fire',         beds: { white: .15, pink: .35, brown: 1 } },
    { id: 'city',      name: 'city',         beds: { white: .2, pink: 1, brown: .25 } },
    { id: 'desert',    name: 'desert',       beds: { white: .2, pink: .4, brown: 1 } },
    { id: 'creek',     name: 'creek',        beds: { white: .15, pink: .45, brown: 1 } },
    { id: 'fall',      name: 'fall',         beds: { white: .7, pink: 1, brown: .2 } },
    { id: 'roof',      name: 'roof',         beds: { white: .35, pink: 1, brown: .15 } },
    { id: 'lake',      name: 'lake',         beds: { white: 0, pink: .15, brown: 1 } },
    { id: 'shore',     name: 'shore',        beds: { white: .2, pink: .4, brown: 1 } },
    { id: 'moonwater', name: 'moonwater',    beds: { white: 0, pink: .12, brown: 1 } },
    { id: 'lost',      name: 'lost in time', beds: { white: 0, pink: 0, brown: 0 }, song: true }
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
  var envdot = document.getElementById('envdot');
  var envdialEl = document.getElementById('envdial');
  var envring = document.getElementById('envring');
  var erx = envring ? envring.getContext('2d') : null;
  var envhint = document.getElementById('envhint');
  var pauseEl = document.getElementById('pause');
  var tuneEl = document.getElementById('tune');

  var W = 0, H = 0, M = 390, dpr = 1, hy = 0;
  var pair = 0, intensity = .42, red = false, light = 1;
  var tAcc = 0, lastT = 0, windNow = 0, flash = 0, nextFlash = 0;
  var nameT = 0, dotsT = 0, intenT = 0, wakeOn = true, quiet = false;
  var fade = 1, fading = false;
  var endAt = 0, mins = 0, leftTick = 0;
  var DROPS = [], FLAKES = [], RINGS = [], MOTES = [], EMBERS = [], GLASS = [], FLOW = [], DUST = [];
  var nextRing = 0, nextCrack = 0, fireFlick = 1;
  var hazeTex = null, hazeTint = null, hazeKey = '';
  var audio = null, hearing = false;
  var WTS = {};
  PAIRS.forEach(function (p) { WTS[p.id] = 0; });

  var ENV_CONT = [
    { k: 'wind', name: 'wind', kind: 'dial' },
    { k: 'density', name: 'density', kind: 'dial' },
    { k: 'light', name: 'light', kind: 'dial' },
    { k: 'warmth', name: 'warmth', kind: 'dial' },
    { k: 'glow', name: 'glow', kind: 'dial' },
    { k: 'height', name: 'height', kind: 'dial' },
    { k: 'moon', name: 'moon', kind: 'toggle' },
    { k: 'tilt', name: 'tilt', kind: 'toggle' }
  ];
  function defEnv() { return defEnvFor('snow'); }
  function defEnvFor(id) {
    var moonOn = /^(snow|sea|lake|shore|moonwater|lost)$/.test(id);
    return { wind: .5, density: .5, light: .5, warmth: .5, glow: .5, height: .5, moon: moonOn, tilt: false };
  }
  var env = defEnv(), envNow = { wind: .5, density: .5, light: .5, warmth: .5, glow: .5, height: .5, moon: 1, tilt: 0 };
  var envSel = 'light', envOpen = false, envOpenT = 0, envFolding = false;
  var envOrb = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  var envIdle = 0, envStars = [], envDragging = false, envStore = {}, envSaveT = 0;
  var tiltLean = 0, tiltSamp = 0, tiltOnDev = false;
  var STORE = 'oz.noise.env.v5', HINTK = 'oz.noise.env.v5.hint', TUNE = 'oz.noise.tune.v5';
  var INK = [232, 228, 220];
  var enterU = 1, entering = false;
  var vol = 1, pauseOn = false, pauseU = 1, pauseGlyphT = 0;
  var tuneOpen = false, tuneIdle = 0, tuneMix = {}, tuneDrag = null;
  var HANDS = {};
  var lastRingT = 0, lastTapAt = 0, lastTapX = 0, lastTapY = 0, audioAt = 0;
  var twoHold = null, twoHoldT = 0;
  var song = { buf: null, loading: false, ready: null, gain: null, hp: null, lp: null, delay: null, dg: null, nextT: 0, timer: 0, wanted: false };
  var SONG_XF = 1.8;
  var probe = null;
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
  function visK() { return (0.45 + envNow.density * 1.1) * (0.18 + 0.82 * enterK()); }
  function inkRgba(a) { return 'rgba(232,228,220,' + a.toFixed(3) + ')'; }

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

  /* ---------- haze sheet, same method as the oz sky ---------- */
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
    FLOW = []; for (i = 0; i < 80; i++) FLOW.push({ x: Math.random(), y: Math.random(), v: .08 + Math.random() * .2, s: .4 + Math.random() * 1.2, p: Math.random() * 6.28 });
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
      desert:    { top: [20, 14, 22],  mid: [56, 36, 28],   hor: [140, 88, 50],  water: [36, 22, 16] },
      creek:     { top: [16, 22, 24],  mid: [32, 42, 40],   hor: [70, 86, 78],   water: [18, 28, 26] },
      fall:      { top: [18, 24, 32],  mid: [36, 48, 58],   hor: [80, 96, 104],  water: [16, 24, 30] },
      roof:      { top: [14, 14, 22],  mid: [28, 26, 32],   hor: [52, 42, 38],   water: [18, 16, 16] },
      lake:      { top: [10, 16, 24],  mid: [22, 32, 40],   hor: [48, 62, 70],   water: [10, 18, 24] },
      shore:     { top: [12, 16, 26],  mid: [28, 32, 40],   hor: [70, 68, 64],   water: [14, 20, 26] },
      moonwater: { top: [8, 12, 22],   mid: [16, 24, 40],   hor: [40, 52, 72],   water: [8, 14, 24] },
      lost:      { top: [18, 12, 10],  mid: [48, 32, 22],   hor: [110, 78, 48],  water: [22, 14, 10] }
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
    if (id === 'lake' || id === 'moonwater') {
      top = mix(top, [90, 96, 110], I * .45); mid = mix(mid, [130, 144, 156], I * .4); hor = mix(hor, [170, 186, 198], I * .4);
    }
    if (id === 'shore') {
      top = mix(top, [80, 88, 104], I * .4); mid = mix(mid, [130, 124, 112], I * .4); hor = mix(hor, [186, 176, 156], I * .4);
    }
    if (id === 'creek' || id === 'fall') {
      top = mix(top, [70, 86, 90], I * .4); mid = mix(mid, [120, 138, 130], I * .4); hor = mix(hor, [180, 196, 188], I * .35);
    }
    if (id === 'roof') {
      var dk = 1 - I * .08;
      top = [top[0] * dk, top[1] * dk, top[2] * dk]; mid = [mid[0] * dk, mid[1] * dk, mid[2] * dk];
    }
    if (id === 'lost') {
      top = mix(top, [70, 42, 28], I * .4); mid = mix(mid, [160, 110, 70], I * .5); hor = mix(hor, [220, 170, 110], I * .45);
    }
    return { top: top, mid: mid, hor: hor, water: water };
  }

  function shadeWash(c) {
    /* cheap tints only; at default 0.5 this is a no-op so v3 palettes stay intact */
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

  function hyFor(id) {
    if (id === 'fire') return H * .90;
    if (id === 'city') return H * .86;
    if (id === 'roof') return H * .58;
    if (id === 'fall') return H * .78;
    if (id === 'creek') return H * .70;
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
  function waterAmt() {
    return wt('snow') + wt('rain') + wt('sea') + wt('wind') + wt('storm') +
      wt('lake') + wt('shore') + wt('moonwater') + wt('creek') * .8 + wt('fall') * .7;
  }
  function waterReflectAmt() {
    return Math.min(1, wt('sea') + wt('lake') + wt('shore') + wt('moonwater') * 1.15 + wt('snow') * .35);
  }

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
      wt('snow') * (.15 + I * .35) + wt('city') * (.2 + I * .25) + wt('desert') * (.12 + I * .2) + wt('sea') * (.08 + I * .15) + wt('fire') * .06 + wt('lake') * (.1 + I * .14) + wt('moonwater') * (.1 + I * .12) + wt('shore') * (.08 + I * .12) + wt('roof') * (.2 + I * .2) + wt('lost') * .08;
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
    var amt = wt('sea') * (.35 + I * .7) + wt('snow') * (I * .25) + wt('wind') * (.1 + I * .15) + wt('desert') * (.18 + I * .35) + wt('fire') * (.08 + I * .12) + wt('lake') * (.18 + I * .2) + wt('moonwater') * (.2 + I * .18) + wt('shore') * (.1 + I * .14) + wt('fall') * (.2 + I * .25) + wt('lost') * (.18 + I * .16);
    if (amt < .02) return;
    var T = 512 * Math.max(1, M / 390);
    var col = mix([150, 152, 158], [220, 224, 230], wt('sea') * I * .5);
    col = mix(col, [220, 160, 90], wt('desert') * .4 + wt('fire') * .35 + wt('lost') * .45);
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
    if (waterAmt() < .08 || y < hy - 12) return;
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
        var hf = handForce(d[0] * W, d[1] * hy * 1.25, 'swirl');
        d[0] += hf.x * dt * 1.8; d[1] += hf.y * dt * 0.35;
      }
      if (d[1] > 1) { d[1] -= 1; d[0] = Math.random(); }
    }
  }
  function drawRain(dt, I, wind, still) {
    var ra = (wt('rain') + wt('storm') + wt('city') * .85 + wt('roof') * .9) * (.25 + I * .95);
    stepDrops(dt, I, wind, still);
    if (ra < .02) return;
    var n = Math.round(DROPS.length * Math.min(1, ra) * visK()), lean = .12 + wind * .25, Lbase = 10 * (M / 390 + .3);
    cx.lineWidth = 1; cx.strokeStyle = rgba([200, 214, 230], .22 * Math.min(1, ra));
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var d = DROPS[i];
      var X = d[0] * (W + 60) - 30 + d[1] * H * lean, Y = d[1] * hy * 1.25, L2 = Lbase * d[2];
      if (Y > hy && !(wt('city') || wt('roof'))) continue;
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
      if (!still) { f[1] += dt * (.05 + I * .12) * f[2]; f[0] += dt * (.01 + I * .04) * wind; var hf = handForce(f[0] * W, f[1] * H, 'swirl'); f[0] += hf.x * dt * 1.6; f[1] += hf.y * dt * 1.2; }
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
    var swell = (wt('sea') + wt('shore')) * (.4 + I * .7) + (wt('lake') + wt('moonwater')) * (.18 + I * .25) + (wt('rain') + wt('storm')) * (.18 + I * .28) + wt('wind') * (.2 + I * .35) + wt('snow') * .03 + wt('creek') * .16 + wt('fall') * .1;
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
      if (!still) { e.y -= dt * e.v * (0.7 + I); e.x += dt * .05 * Math.sin(tAcc * 1.4 + e.p); var hf = handForce(e.x * W, e.y * H, 'fire'); e.x += hf.x * dt * 0.9; e.y += hf.y * dt * 1.4; }
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

  function stepEnv(dt) {
    var k = 1 - Math.exp(-dt * 2.4);
    ['wind', 'density', 'light', 'warmth', 'glow', 'height'].forEach(function (key) {
      envNow[key] += (env[key] - envNow[key]) * k;
    });
    envNow.moon += ((env.moon ? 1 : 0) - envNow.moon) * k;
    envNow.tilt += ((env.tilt ? 1 : 0) - envNow.tilt) * k;
    tiltLean += ((env.tilt ? tiltSamp : 0) - tiltLean) * (1 - Math.exp(-dt * 4));
    /* orbit spring, only used when the dial is open */
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

  function lightPos() {
    var t = envNow.height, ang = Math.PI * (1 - t);
    return { x: W * .5 + Math.cos(ang) * W * .42, y: H * .11 + (1 - Math.sin(ang)) * H * .32 };
  }
  function moonColor() { return mix([186, 210, 230], [255, 196, 130], envNow.warmth); }
  function moonAmt() {
    return wt('moonwater') + wt('lake') + wt('sea') + wt('shore') + wt('lost') + wt('snow') * .85 +
      wt('desert') * .5 + wt('wind') * .4 + wt('creek') * .3;
  }

  function drawMoon() {
    var a = envNow.moon * moonAmt();
    if (a < .02) return;
    var p = lightPos(), col = moonColor(), sc = M / 390;
    var r = (11 + envNow.glow * 7) * sc;
    if (p.y > hy - 8) return;
    var bloom = r * (3.2 + envNow.glow * 3) * (0.7 + envNow.light * .4);
    var g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloom);
    g.addColorStop(0, rgba(col, .4 * a * (0.5 + envNow.light * .6)));
    g.addColorStop(.3, rgba(col, .1 * a * envNow.glow));
    g.addColorStop(1, rgba(col, 0));
    cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, bloom, 0, 6.283); cx.fill();
    cx.save();
    cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.clip();
    cx.fillStyle = rgba(col, .88 * a);
    cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.fill();
    var elev = Math.sin(Math.PI * envNow.height);
    var cut = 0.35 + (1 - elev) * 0.25;
    cx.globalCompositeOperation = 'destination-out';
    cx.fillStyle = 'rgba(0,0,0,1)';
    cx.beginPath(); cx.arc(p.x + r * cut, p.y - r * .08, r * 0.92, 0, 6.283); cx.fill();
    cx.restore();
  }

  /* lightweight water reflection: no canvas readback, water rooms only */
  function drawReflect() {
    var wa = waterReflectAmt();
    if (wa < .03 || hy >= H - 10) return;
    var a = envNow.moon * moonAmt() * wa;
    if (a < .02) return;
    var p = lightPos(), col = moonColor();
    var band = Math.max(24, H - hy - 36);
    var ry = hy + Math.min(band * 0.42, Math.max(16, (hy - p.y) * 0.45));
    var sc = M / 390;
    var rr = (9 + envNow.glow * 5) * sc;
    var wob = Math.sin(tAcc * 0.9) * (3 + envNow.wind * 6);
    cx.save();
    cx.globalCompositeOperation = 'screen';
    cx.globalAlpha = .28 * a * (0.5 + envNow.light * .5);
    cx.fillStyle = rgba(col, 1);
    cx.beginPath(); cx.ellipse(p.x + wob, ry, rr * 1.3, rr * 0.45, 0, 0, 6.283); cx.fill();
    /* single soft glitter path — one gradient trapezoid, no strips */
    var pathLen = (H - hy) * 0.7, topW = 2.2 * sc, botW = (16 + envNow.glow * 10) * sc;
    var lg = cx.createLinearGradient(0, hy, 0, hy + pathLen);
    var lit = .22 * a * (0.45 + envNow.light * .7);
    lg.addColorStop(0, rgba(col, lit));
    lg.addColorStop(.55, rgba(col, lit * .45));
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

  function drawRoof(I) {
    var a = wt('roof');
    if (a < .02) return;
    var far = hy;
    var g = cx.createLinearGradient(0, far - 50, 0, H);
    g.addColorStop(0, rgba([64, 56, 52], 0));
    g.addColorStop(.15, rgba([70, 58, 50], .2 * a));
    g.addColorStop(.55, rgba([78, 62, 50], .36 * a));
    g.addColorStop(1, rgba([48, 36, 30], .48 * a));
    cx.fillStyle = g; cx.fillRect(0, far - 50, W, H - (far - 50));
    cx.strokeStyle = rgba([226, 220, 210], .16 * a * (0.5 + envNow.light * .6));
    cx.beginPath(); cx.moveTo(0, far + .5); cx.lineTo(W, far + .5); cx.stroke();
  }

  function drawShore(I) {
    var a = wt('shore');
    if (a < .02) return;
    var y0 = hy + (H - hy) * .28;
    var sand = cx.createLinearGradient(0, y0, 0, H);
    sand.addColorStop(0, rgba([150, 128, 104], 0));
    sand.addColorStop(.2, rgba([150, 126, 100], .2 * a));
    sand.addColorStop(.5, rgba([110, 88, 66], .48 * a));
    sand.addColorStop(1, rgba([62, 46, 34], .76 * a));
    cx.fillStyle = sand; cx.fillRect(0, y0, W, H - y0);
    var foamY = y0 + Math.sin(tAcc * 0.7) * 7;
    cx.strokeStyle = rgba([230, 228, 220], .18 * a * (0.5 + envNow.light * .5));
    cx.lineWidth = 1.4;
    cx.beginPath();
    for (var x = 0; x <= W; x += 8) {
      var y = foamY + Math.sin(x * 0.04 + tAcc * 1.1) * 3.5 + Math.sin(x * 0.11 + tAcc * .6) * 1.6;
      if (x === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
    }
    cx.stroke();
  }

  function drawCreek(dt, I, still) {
    var a = wt('creek');
    var i, q;
    for (i = 0; i < FLOW.length; i++) {
      q = FLOW[i];
      if (!still) { q.x += dt * q.v * (.3 + I * .3); q.y += dt * q.v * .07; }
      if (q.x > 1.06) q.x = -.04; if (q.y > 1.06) q.y = -.04;
    }
    if (a < .02) return;
    /* two bank fills, not a per-scanline loop */
    var left = cx.createLinearGradient(0, 0, W * .42, 0);
    left.addColorStop(0, rgba([16, 24, 20], .45 * a));
    left.addColorStop(1, rgba([16, 24, 20], 0));
    cx.fillStyle = left; cx.fillRect(0, hy, W * .42, H - hy);
    var right = cx.createLinearGradient(W, 0, W * .58, 0);
    right.addColorStop(0, rgba([16, 24, 20], .45 * a));
    right.addColorStop(1, rgba([16, 24, 20], 0));
    cx.fillStyle = right; cx.fillRect(W * .58, hy, W * .42, H - hy);
    var ribbon = cx.createLinearGradient(W * .3, 0, W * .7, 0);
    ribbon.addColorStop(0, rgba([180, 210, 206], 0));
    ribbon.addColorStop(.5, rgba([210, 230, 226], .08 * a));
    ribbon.addColorStop(1, rgba([180, 210, 206], 0));
    cx.fillStyle = ribbon; cx.fillRect(W * .28, hy, W * .44, H - hy);
    var n = Math.min(FLOW.length, Math.round(FLOW.length * (.7 + I * .35) * a * visK()));
    var sc = (M / 390 + .3);
    cx.save(); cx.globalCompositeOperation = 'screen';
    for (i = 0; i < n; i++) {
      q = FLOW[i];
      var Y = Math.max(hy, q.y * H);
      var mid = W * .5 + Math.sin(Y * 0.016 + 0.6) * W * .1;
      var X = mid + (q.x - .5) * W * .22;
      var u = 0.5 + 0.5 * Math.sin(tAcc * 1.2 + q.p);
      cx.fillStyle = rgba([220, 236, 232], (.16 + I * .1) * a * u);
      cx.beginPath(); cx.ellipse(X, Y, (6 + q.s * 8) * sc, 1.5, 0.12, 0, 6.283); cx.fill();
    }
    cx.restore();
  }

  function drawFall(dt, I, still) {
    var a = wt('fall');
    var i, q;
    for (i = 0; i < FLOW.length; i++) {
      q = FLOW[i];
      if (!still) { q.y += dt * q.v * (.7 + I * .45); q.x += dt * .02 * Math.sin(tAcc + q.p); }
      if (q.y > 1.06) q.y = -.04;
    }
    if (a < .02) return;
    var mid = W * .5, half = W * (.18 + I * .08);
    var sides = cx.createLinearGradient(mid - half * 2.4, 0, mid + half * 2.4, 0);
    sides.addColorStop(0, rgba([18, 24, 28], .28 * a));
    sides.addColorStop(.3, rgba([18, 24, 28], 0));
    sides.addColorStop(.7, rgba([18, 24, 28], 0));
    sides.addColorStop(1, rgba([18, 24, 28], .28 * a));
    cx.fillStyle = sides; cx.fillRect(0, 0, W, hy + 8);
    var curtain = cx.createLinearGradient(mid - half * 1.5, 0, mid + half * 1.5, 0);
    curtain.addColorStop(0, rgba([200, 218, 228], 0));
    curtain.addColorStop(.5, rgba([216, 230, 236], (.16 + I * .07) * a * (0.5 + envNow.glow * .3)));
    curtain.addColorStop(1, rgba([200, 218, 228], 0));
    cx.fillStyle = curtain; cx.fillRect(mid - half * 1.5, 0, half * 3, hy + 10);
    var n = Math.min(FLOW.length, Math.round(40 * a * visK() * (.5 + I)));
    var sc = (M / 390 + .3);
    cx.save(); cx.globalCompositeOperation = 'screen';
    for (i = 0; i < n; i++) {
      q = FLOW[i];
      var X = mid + (q.x - .5) * half * 1.6, Y = q.y * (hy + 8);
      var L = (16 + I * 24) * q.s * sc;
      cx.fillStyle = rgba([230, 238, 244], (.07 + I * .05) * a);
      cx.beginPath(); cx.ellipse(X, Y - L * .3, 1.1 * sc, L * .4, 0, 0, 6.283); cx.fill();
    }
    cx.restore();
    var pool = cx.createRadialGradient(mid, hy + 8, 0, mid, hy + 10, W * .65);
    pool.addColorStop(0, rgba([214, 230, 236], .22 * a * (0.5 + envNow.glow)));
    pool.addColorStop(.4, rgba([180, 204, 214], .08 * a));
    pool.addColorStop(1, rgba([8, 14, 18], 0));
    cx.fillStyle = pool; cx.fillRect(0, hy - 16, W, H - hy + 16);
  }

  function drawLost(dt, I, still) {
    var a = wt('lost');
    var i, d;
    for (i = 0; i < DUST.length; i++) {
      d = DUST[i];
      if (!still) {
        d.y -= dt * d.v * (0.5 + I * .5);
        d.x += dt * .015 * Math.sin(tAcc * .25 + d.p) * (0.4 + envNow.wind);
        var hf = handForce(d.x * W, d.y * H, 'dust');
        d.x += hf.x * dt * 1.5; d.y += hf.y * dt * 1.3;
      }
      if (d.y < -.08) { d.y = 1.06; d.x = Math.random(); }
    }
    if (a < .02) return;
    var n = Math.min(DUST.length, Math.round(DUST.length * (.5 + I * .4) * a * visK()));
    for (i = 0; i < n; i++) {
      d = DUST[i];
      var X = d.x * W, Y = d.y * H, r = d.r * (M / 390 + .3) * (0.8 + envNow.glow * .3);
      var g = cx.createRadialGradient(X, Y, 0, X, Y, r * 3);
      g.addColorStop(0, rgba([255, 210, 150], .16 * a * (0.4 + envNow.light * .5)));
      g.addColorStop(1, rgba([255, 210, 150], 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(X, Y, r * 3, 0, 6.283); cx.fill();
    }
  }

  function targetWind(I) {
    return (wt('wind') + wt('desert')) * (.45 + I * .8)
      + wt('storm') * (.4 + I * .45)
      + (wt('rain') + wt('city') + wt('roof')) * (.22 + I * .45)
      + wt('snow') * (.12 + I * .45)
      + (wt('sea') + wt('shore')) * (.08 + I * .45)
      + (wt('lake') + wt('moonwater')) * (.05 + I * .2)
      + wt('creek') * (.12 + I * .3)
      + wt('fall') * (.08 + I * .2)
      + wt('fire') * (.08 + I * .45)
      + wt('lost') * (.04 + I * .1)
      + (envNow.wind - .5) * .9 + tiltLean * .45;
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
    /* v3 motion clock: advance unless paused. never reseed, never resize here, never scale the canvas. */
    if (!pauseOn) tAcc += dt;
    var pTarget = pauseOn ? 0 : 1;
    if (pauseU !== pTarget) {
      pauseU += (pTarget > pauseU ? 1 : -1) * dt / 0.48;
      if ((pTarget === 0 && pauseU <= 0) || (pTarget === 1 && pauseU >= 1)) pauseU = pTarget;
      if (audio) audio.set(pair, intensity, fade);
    }
    stepWeights(dt);
    stepEnv(dt);
    if (entering) {
      enterU = Math.min(1, enterU + dt / 1.35);
      if (enterU >= 1) { enterU = 1; entering = false; }
      if (audio) audio.set(pair, intensity, fade);
    }
    var I = intensity * fade;
    hy += (hyMix() - hy) * (1 - Math.exp(-dt * 2.1));
    windNow += (targetWind(I) - windNow) * (1 - Math.exp(-dt * 2));
    var still = pauseOn;
    drawWash(mixedWash(I));
    drawClouds(I, windNow);
    drawMoon();
    drawDesert();
    drawRoof(I);
    drawWater(I);
    drawReflect();
    drawRain(dt, I, windNow, still);
    drawSnow(dt, I, windNow, still);
    drawFog(I, windNow);
    drawShore(I);
    drawCreek(dt, I, still);
    drawFall(dt, I, still);
    drawWindMotes(dt, I, windNow, still);
    drawCity(dt, I, windNow, still);
    drawFire(dt, I, still);
    drawStorm(dt, I, still);
    drawLost(dt, I, still);
    if (envOpenT > 0.001) drawEnvDial();
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
    if (envOpen && !envDragging && now() - envIdle > 2400) closeEnv();
    if (tuneOpen && !tuneDrag && now() - tuneIdle > 8000) closeTune();
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
          var w = bedAmt(k); if (w <= 0 || !beds[k]) return;
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
      song.ready = fetch('audio/lost-in-time.m4a').then(function (r) { return r.arrayBuffer(); }).then(function (b) {
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
        song.gain.gain.setTargetAtTime(0.72 * (f == null ? 1 : f) * (typeof enterK === "function" ? enterK() : 1), t, .12);
      } else {
        song.gain.gain.setTargetAtTime(0, t, .12);
        if (song.timer) { clearTimeout(song.timer); song.timer = 0; }
        song.nextT = 0;
      }
    }

    var gust = { t: 0 };
    function set(pi, I, f) {
      var p = PAIRS[pi], id = p.id, isSong = !!p.song;
      var ein = (typeof enterK === "function" ? enterK() : 1);
      var audible = (f == null ? 1 : f) * vol * pauseU;
      var gain = isSong ? 0 : (.06 + I * .5) * audible * (0.85 + envNow.density * .3) * ein;
      var t = ac.currentTime;
      master.gain.setTargetAtTime(gain, t, .08);
      if (fallback && bedEl && !isSong) bedEl.volume = clamp(gain / .5, 0, 1);
      Object.keys(beds).forEach(function (k) { beds[k].g.gain.setTargetAtTime(isSong ? 0 : bedAmt(k), t, .18); });
      dGain.gain.setTargetAtTime(id === 'city' || id === 'roof' ? .08 : id === 'fall' || id === 'creek' ? .06 : 0, t, .2);
      followSong(isSong, audible);
      var toneOff = (envNow.warmth - .5) * -1800;
      var windOff = (envNow.wind - .5) * 700;
      var densHP = (envNow.density - .5) * 180;
      var hp0 = 50, lp0 = 8000;
      if (id === 'snow') { hp0 = 180 + I * 500; lp0 = 8000 + I * 4000; }
      else if (id === 'rain' || id === 'city' || id === 'roof') { hp0 = id === 'city' ? 120 : id === 'roof' ? 100 : 80; lp0 = (id === 'city' ? 2800 : 6000) + I * 5000; }
      else if (id === 'sea' || id === 'lake' || id === 'moonwater' || id === 'shore') { hp0 = 30; lp0 = 280 + I * 700; }
      else if (id === 'wind' || id === 'desert') { hp0 = id === 'desert' ? 80 : 40; lp0 = 700 + I * 2200; }
      else if (id === 'fire') { hp0 = 60; lp0 = 800 + I * 1800; }
      else if (id === 'creek') { hp0 = 50; lp0 = 1400 + I * 2000; }
      else if (id === 'fall') { hp0 = 80; lp0 = 4000 + I * 4000; }
      else if (id === 'lost') { hp0 = 50; lp0 = 11000; }
      else { hp0 = 50; lp0 = 4000 + I * 4000; }
      hp.frequency.setTargetAtTime(Math.max(20, hp0 + densHP), t, .1);
      lp.frequency.setTargetAtTime(Math.max(160, lp0 + toneOff + windOff), t, .1);
      if (isSong) {
        song.hp.frequency.setTargetAtTime(40 + (1 - envNow.warmth) * 80, t, .15);
        song.lp.frequency.setTargetAtTime(7000 + envNow.warmth * 4000 + envNow.glow * 1500, t, .15);
        song.dg.gain.setTargetAtTime(0.08 + envNow.glow * .16, t, .2);
        song.delay.delayTime.setTargetAtTime(0.18 + envNow.glow * .22, t, .2);
      }
    }
    function tickGust() {
      if (!audio) return;
      var id = pid(), I = intensity * fade;
      if (id === 'wind' || id === 'sea' || id === 'storm' || id === 'desert' || id === 'fire' || id === 'shore' || id === 'lake' || id === 'moonwater') {
        gust.t += 0.05;
        var wob = (id === 'sea' || id === 'lake' || id === 'moonwater') ? Math.sin(gust.t * .15) * (80 + I * 200) : (Math.sin(gust.t * .4) * .5 + Math.sin(gust.t * .17) * .5) * (400 + I * 1800) * (0.7 + envNow.wind * .8);
        var base = (id === 'sea' || id === 'lake' || id === 'moonwater' || id === 'shore') ? 280 + I * 700 : id === 'fire' ? 800 + I * 1800 : 700 + I * 2200;
        lp.frequency.setTargetAtTime(Math.max(160, base + wob + (envNow.warmth - .5) * -1200), ac.currentTime, .2);
        if (id === 'sea' || id === 'lake' || id === 'moonwater' || id === 'shore') {
          var swell = 1 + Math.sin(gust.t * .12) * (.12 + I * .28);
          master.gain.setTargetAtTime((.06 + intensity * .5) * fade * vol * pauseU * swell * (0.85 + envNow.density * .3), ac.currentTime, .4);
        }
      }
      setTimeout(tickGust, 80);
    }
    function burst(kind, I) {
      var n, d, i, last, src, f, g, nowT = ac.currentTime;
      if (kind === 'thunder') {
        n = Math.round(ac.sampleRate * (1.4 + Math.random() * 1.2)); d = new Float32Array(n); last = 0;
        for (i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * .04) / 1.04; var envv = Math.sin((i / n) * Math.PI); d[i] = last * envv * envv; }
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
    var fresh = !audio;
    if (!audio) audio = makeAudio();
    if (!audio) { paintHear(); return; }
    if (pauseOn) setPaused(false);
    audio.resume();
    audio.set(pair, intensity, fade);
    if (fresh) audioAt = now();
    setTimeout(paintHear, 60);
    setTimeout(paintHear, 400);
  }

  function defMixFor(id) {
    var p = PAIRS.filter(function (x) { return x.id === id; })[0];
    var b = (p && p.beds) || { white: 0, pink: 0, brown: 0 };
    return { white: b.white || 0, pink: b.pink || 0, brown: b.brown || 0 };
  }
  function bedAmt(k) {
    var o = tuneMix[pid()];
    if (o && o[k] != null) return clamp(+o[k], 0, 1);
    return (PAIRS[pair].beds[k] || 0);
  }
  function loadTune() {
    try {
      var raw = JSON.parse(localStorage.getItem(TUNE) || '{}') || {};
      if (raw.vol != null) vol = clamp(+raw.vol, 0, 1);
      if (raw.mix && typeof raw.mix === 'object') tuneMix = raw.mix;
    } catch (e) {}
  }
  function saveTune() {
    try { localStorage.setItem(TUNE, JSON.stringify({ vol: vol, mix: tuneMix })); } catch (e) {}
  }
  function setVol(v, q) {
    vol = clamp(v, 0, 1);
    if (audio) audio.set(pair, intensity, fade);
    if (!q) { paintTune(); saveTune(); }
  }
  function setMix(k, v, q) {
    if (!tuneMix[pid()]) tuneMix[pid()] = defMixFor(pid());
    tuneMix[pid()][k] = clamp(v, 0, 1);
    if (audio) audio.set(pair, intensity, fade);
    if (!q) { paintTune(); saveTune(); }
  }
  function paintTune() {
    if (!tuneEl) return;
    var rows = {
      vol: vol,
      white: bedAmt('white'),
      pink: bedAmt('pink'),
      brown: bedAmt('brown')
    };
    Object.keys(rows).forEach(function (k) {
      var row = tuneEl.querySelector('.tune-row[data-k="' + k + '"]');
      if (!row) return;
      var v = rows[k], pct = (v * 100).toFixed(0);
      var fill = row.querySelector('.tune-fill'), knob = row.querySelector('.tune-knob'), em = row.querySelector('em');
      if (fill) fill.style.width = pct + '%';
      if (knob) knob.style.left = pct + '%';
      if (em) em.textContent = pct;
    });
    [].forEach.call(tuneEl.querySelectorAll('.tune-timer button'), function (b) {
      b.classList.toggle('on', +b.dataset.m === mins);
    });
  }
  function openTune() {
    if (!tuneEl) return;
    if (sleepEl) sleepEl.hidden = true;
    tuneEl.hidden = false;
    requestAnimationFrame(function () { tuneEl.classList.add('open'); });
    html.classList.add('tune-open');
    tuneOpen = true; tuneIdle = now();
    paintTune();
    haptic(8);
  }
  function closeTune() {
    if (!tuneEl || !tuneOpen) return;
    tuneEl.classList.remove('open');
    html.classList.remove('tune-open');
    tuneOpen = false;
    setTimeout(function () { if (!tuneOpen) tuneEl.hidden = true; }, 400);
  }
  function toggleTune() {
    if (tuneOpen) closeTune(); else openTune();
  }
  function flashPauseGlyph() {
    if (!pauseEl) return;
    pauseEl.classList.remove('flash');
    void pauseEl.offsetWidth;
    pauseEl.classList.add('flash');
    clearTimeout(pauseGlyphT);
    pauseGlyphT = setTimeout(function () { pauseEl.classList.remove('flash'); }, 900);
  }
  function setPaused(on) {
    on = !!on;
    if (on === pauseOn) return;
    pauseOn = on;
    html.classList.toggle('paused', pauseOn);
    if (pauseOn) flashPauseGlyph();
    haptic(8);
    if (audio) audio.set(pair, intensity, fade);
  }
  function togglePause() {
    if (!audio) { startAudio(); audioAt = now(); return; }
    if (!pauseOn && now() - audioAt < 420) return;
    setPaused(!pauseOn);
  }

  /* ---------- env store (per room) ---------- */
  function loadStore() {
    try { envStore = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { envStore = {}; }
  }
  function saveStore() {
    clearTimeout(envSaveT);
    envSaveT = setTimeout(function () {
      try { localStorage.setItem(STORE, JSON.stringify(envStore)); } catch (e) {}
    }, 160);
  }
  function applyRoomEnv(id, snap) {
    var s = envStore[id] || defEnvFor(id);
    env.wind = s.wind != null ? +s.wind : .5;
    env.density = s.density != null ? +s.density : .5;
    env.light = s.light != null ? +s.light : .5;
    env.warmth = s.warmth != null ? +s.warmth : .5;
    env.glow = s.glow != null ? +s.glow : .5;
    env.height = s.height != null ? +s.height : .5;
    env.moon = s.moon !== false;
    env.tilt = !!s.tilt;
    if (snap) {
      envNow.wind = env.wind; envNow.density = env.density; envNow.light = env.light;
      envNow.warmth = env.warmth; envNow.glow = env.glow; envNow.height = env.height;
      envNow.moon = env.moon ? 1 : 0; envNow.tilt = env.tilt ? 1 : 0;
    }
  }
  function persistEnv() {
    envStore[pid()] = {
      wind: env.wind, density: env.density, light: env.light, warmth: env.warmth,
      glow: env.glow, height: env.height, moon: !!env.moon, tilt: !!env.tilt
    };
    saveStore();
  }
  function setEnvKey(k, v, q) {
    var spec = ENV_CONT.filter(function (c) { return c.k === k; })[0];
    if (!spec) return;
    if (spec.kind === 'toggle') env[k] = !!v;
    else env[k] = clamp(+v, 0, 1);
    persistEnv();
    envIdle = now();
    if (audio) audio.set(pair, intensity, fade);
    if (k === 'tilt' && env.tilt) requestTilt();
  }

  function requestTilt() {
    function use(e) { tiltSamp = clamp(((e.gamma || 0) / 36), -1, 1); }
    if (tiltOnDev) return;
    tiltOnDev = true;
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().then(function (s) {
          if (s === 'granted') window.addEventListener('deviceorientation', use);
        }).catch(function () {});
      } else window.addEventListener('deviceorientation', use);
    } catch (e) {}
  }

  function syncDialDom() {
    html.classList.toggle('env-open', envOpen && envOpenT > .02);
    if (!envdialEl) return;
    if (envOpen || envOpenT > 0) {
      envdialEl.hidden = false;
      envdialEl.classList.toggle('open', envOpen && !envFolding);
    } else {
      envdialEl.hidden = true;
      envdialEl.classList.remove('open');
    }
  }
  function openEnv() {
    envOpen = true; envFolding = false; envIdle = now();
    if (envOpenT <= 0) envOpenT = 0.001;
    syncDialDom();
    if (envhint) envhint.classList.remove('show');
    try { localStorage.setItem(HINTK, '1'); } catch (e) {}
    haptic(10);
  }
  function closeEnv() {
    if (!envOpen && envOpenT <= 0) return;
    envFolding = true; envOpen = true; envDragging = false;
    envOrb.tx = 0; envOrb.ty = 0;
    syncDialDom();
  }

  function dotCenter() {
    if (envdot) {
      var r = envdot.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: W / 2, y: H - 74 };
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
      var s = fl / (fl + z2);
      return [c.x + x2 * s, c.y + y1 * s, s];
    }
    erx.save();
    erx.globalAlpha = u;
    /* stem from the bottom dot */
    erx.strokeStyle = inkRgba(0.28 * u);
    erx.lineWidth = 1;
    erx.beginPath(); erx.moveTo(d.x, d.y); erx.lineTo(c.x, c.y + R * 0.92); erx.stroke();
    /* rings */
    function ring(rad, a) {
      erx.strokeStyle = inkRgba(a);
      erx.lineWidth = 1.1;
      erx.beginPath();
      var n = 64, i, p0, first;
      for (i = 0; i <= n; i++) {
        var ang = (i / n) * Math.PI * 2;
        p0 = proj(Math.cos(ang) * rad, Math.sin(ang) * rad, 0);
        if (i === 0) { erx.moveTo(p0[0], p0[1]); first = p0; } else erx.lineTo(p0[0], p0[1]);
      }
      erx.stroke();
    }
    ring(R, 0.55);
    ring(R * 0.62, 0.28);
    /* value tick on inner ring for the selected dial */
    var sel = ENV_CONT.filter(function (s) { return s.k === envSel; })[0];
    var val = sel && sel.kind === 'dial' ? env[sel.k] : (sel && env[sel.k] ? 1 : 0);
    var tickA = -Math.PI / 2 + val * Math.PI * 2 * 0.85;
    var tp = proj(Math.cos(tickA) * R * 0.62, Math.sin(tickA) * R * 0.62, 0);
    erx.fillStyle = inkRgba(0.9);
    erx.beginPath(); erx.arc(tp[0], tp[1], 2.4, 0, 6.283); erx.fill();
    /* figure: selected star to center */
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
    /* center label */
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
    var i, s, best = null, bd = 28;
    for (i = 0; i < envStars.length; i++) {
      s = envStars[i];
      var dd = Math.hypot(x - s.x, y - s.y);
      if (dd < 22 && dd < bd) { bd = dd; best = s; }
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

  /* ---------- chrome ---------- */
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
    if (envOpen) return;
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
    /* snap lighting so a swipe does not drift brightness or the moon after the weather lerp */
    applyRoomEnv(pid(), true);
    paintDots(); showDots();
    if (!q && !quiet) showName();
    if (audio) audio.set(pair, intensity, fade);
    if (tuneOpen) paintTune();
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
  function setLight(v) { light = clamp(v, .08, 1); applyRed(); }
  function paintDimmer() {
    var MIN = .08, f = (light - MIN) / (1 - MIN);
    dimmer.querySelector('.dm-fill').style.height = (f * 100).toFixed(1) + '%';
    dimmer.querySelector('.dm-knob').style.bottom = (f * 100).toFixed(1) + '%';
    dimmer.querySelector('.dm-v').textContent = Math.round(light * 100) + '%';
    dimmer.setAttribute('aria-valuenow', Math.round(light * 100));
  }
  function goBack() {
    if (tuneOpen) { closeTune(); return; }
    if (envOpen || envOpenT > 0.02) { closeEnv(); return; }
    if (window.history.length > 1) window.history.back();
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
    paintTune();
    if (tuneOpen) tuneIdle = now();
  }

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
  function noteHand(e, up) {
    if (up) {
      var h = HANDS[e.pointerId];
      if (h) { h.up = now(); setTimeout(function () { if (HANDS[e.pointerId] && HANDS[e.pointerId].up) delete HANDS[e.pointerId]; }, 280); }
      return;
    }
    HANDS[e.pointerId] = { x: e.clientX, y: e.clientY, t: now() };
    touchRipple(e.clientX, e.clientY, 0.4);
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    noteHand(e, false);
    var nHands = Object.keys(HANDS).length;
    if (nHands >= 2) {
      clearTimeout(holdT);
      g = { kind: 'two', t: now() };
      clearTimeout(twoHoldT);
      twoHold = { t: now(), moved: false };
      twoHoldT = setTimeout(function () {
        if (twoHold && !twoHold.moved) toggleTune();
        twoHold = null;
      }, 300);
      return;
    }
    if (tuneOpen) {
      g = { kind: 'env', x: e.clientX, y: e.clientY, t: now(), moved: false, absorb: true };
      return;
    }
    g = { kind: 'env', x: e.clientX, y: e.clientY, ix: intensity, t: now(), moved: false, back: e.clientX < 22 };
    holdT = setTimeout(function () {
      if (!g || g.moved || g.kind !== 'env') return;
      sleepEl.hidden = false; hideSleepSoon();
    }, 650);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (HANDS[e.pointerId]) {
      HANDS[e.pointerId].x = e.clientX; HANDS[e.pointerId].y = e.clientY;
      touchRipple(e.clientX, e.clientY, 0.25);
    }
    if (twoHold) {
      twoHold.moved = true;
      return;
    }
    if (!g || g.kind !== 'env') return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) > 8) { g.moved = true; clearTimeout(holdT); }
    if (g.absorb) return;
    if (g.back) {
      var pr = clamp(dx / 72, 0, 1);
      backhint.style.transform = 'translate(' + Math.min(18, dx * .4) + 'px, -50%)';
      backhint.classList.toggle('on', pr > 0);
      return;
    }
    if (!g.moved) return;
    if (g.axis == null && Math.hypot(dx, dy) > 40) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (g.axis === 'y') setIntensity(g.ix - dy / (H * .55));
  });
  canvas.addEventListener('pointerup', function (e) {
    noteHand(e, true);
    if (g && g.kind === 'two') { g = null; clearTimeout(twoHoldT); return; }
    if (!g || g.kind !== 'env') return;
    clearTimeout(holdT);
    var dx = e.clientX - g.x, back = g.back, axis = g.axis, moved = g.moved, absorb = g.absorb;
    g = null;
    backhint.classList.remove('on');
    backhint.style.transform = 'translate(-8px, -50%)';
    if (absorb) {
      if (!moved) closeTune();
      return;
    }
    if (back && dx > 56) { goBack(); return; }
    if (axis === 'x' && Math.abs(dx) > 40) setPair(pair + (dx < 0 ? 1 : -1));
    else if (!moved && !sleepEl.hidden) { /* keep the timer sheet */ }
    else if (!moved) {
      var t = now();
      if (t - lastTapAt < 340 && Math.hypot(e.clientX - lastTapX, e.clientY - lastTapY) < 40) {
        lastTapAt = 0;
        togglePause();
      } else { lastTapAt = t; lastTapX = e.clientX; lastTapY = e.clientY; }
    }
  });
  canvas.addEventListener('pointercancel', function (e) {
    noteHand(e, true);
    clearTimeout(holdT); clearTimeout(twoHoldT); twoHold = null;
    g = null; backhint.classList.remove('on');
  });

  document.addEventListener('touchstart', function (e) {
    if (!e.touches || e.touches.length < 2) return;
    clearTimeout(holdT);
    if (g && g.kind === 'env') g = { kind: 'two', t: now() };
  }, { passive: true });

  sleepEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    setTimer(+b.dataset.m); haptic(10);
  });

  var tuneDrag = null;
  function tuneValueFromEvent(row, e) {
    var rail = row.querySelector('.tune-rail');
    var r = rail.getBoundingClientRect();
    return clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
  }
  function applyTuneDrag(e) {
    if (!tuneDrag) return;
    var v = tuneValueFromEvent(tuneDrag.row, e);
    if (tuneDrag.k === 'vol') setVol(v);
    else setMix(tuneDrag.k, v);
    tuneIdle = now();
  }
  if (tuneEl) {
    tuneEl.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      var b = e.target.closest('button');
      if (b && b.dataset.m != null) {
        e.preventDefault();
        setTimer(+b.dataset.m); haptic(8);
        return;
      }
      var row = e.target.closest('.tune-row');
      if (!row) return;
      e.preventDefault();
      try { tuneEl.setPointerCapture(e.pointerId); } catch (x) {}
      tuneDrag = { row: row, k: row.dataset.k };
      applyTuneDrag(e);
    });
    tuneEl.addEventListener('pointermove', applyTuneDrag);
    function tuneUp() { tuneDrag = null; tuneIdle = now(); }
    tuneEl.addEventListener('pointerup', tuneUp);
    tuneEl.addEventListener('pointercancel', tuneUp);
  }

  /* bottom dot + unfolded dial */
  var dialG = null;
  if (envdot) {
    envdot.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      try { envdot.setPointerCapture(e.pointerId); } catch (x) {}
      dialG = { kind: 'dot', x: e.clientX, y: e.clientY, moved: false };
    });
    envdot.addEventListener('pointermove', function (e) {
      if (!dialG || dialG.kind !== 'dot') return;
      if (Math.hypot(e.clientX - dialG.x, e.clientY - dialG.y) > 8) dialG.moved = true;
      if (dialG.moved && e.clientY < dialG.y - 16 && !envOpen) openEnv();
    });
    envdot.addEventListener('pointerup', function (e) {
      if (!dialG || dialG.kind !== 'dot') return;
      var moved = dialG.moved; dialG = null;
      if (!moved) { if (envOpen || envOpenT > .2) closeEnv(); else openEnv(); }
    });
    envdot.addEventListener('pointercancel', function () { if (dialG && dialG.kind === 'dot') dialG = null; });
  }
  if (envdialEl) {
    envdialEl.addEventListener('pointerdown', function (e) {
      if (!envOpen) return;
      e.preventDefault(); e.stopPropagation();
      if (e.clientX < 22) { closeEnv(); return; }
      var star = hitStar(e.clientX, e.clientY);
      if (star) {
        envSel = star.k;
        if (star.kind === 'toggle') {
          setEnvKey(star.k, !env[star.k]);
          haptic(12);
        } else haptic(8);
        envIdle = now();
        dialG = { kind: 'turn', x: e.clientX, y: e.clientY, ang: angleAt(e.clientX, e.clientY), v0: env[envSel], moved: false };
        try { envdialEl.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      if (onRing(e.clientX, e.clientY)) {
        envIdle = now();
        dialG = { kind: 'turn', x: e.clientX, y: e.clientY, ang: angleAt(e.clientX, e.clientY), v0: env[envSel], moved: false };
        try { envdialEl.setPointerCapture(e.pointerId); } catch (x) {}
        return;
      }
      closeEnv();
    });
    envdialEl.addEventListener('pointermove', function (e) {
      if (!dialG || dialG.kind !== 'turn') return;
      var dang = angleAt(e.clientX, e.clientY) - dialG.ang;
      if (dang > Math.PI) dang -= Math.PI * 2;
      if (dang < -Math.PI) dang += Math.PI * 2;
      if (Math.abs(dang) > 0.03) dialG.moved = true;
      envDragging = true;
      envOrb.tx = clamp((e.clientX - dialG.x) / 90, -1, 1);
      envOrb.ty = clamp((e.clientY - dialG.y) / 90, -1, 1);
      var spec = ENV_CONT.filter(function (c) { return c.k === envSel; })[0];
      if (spec && spec.kind === 'dial') {
        /* never jump to the finger — relative turn */
        setEnvKey(envSel, clamp(dialG.v0 + dang / (Math.PI * 1.35), 0, 1));
      }
    });
    function dialUp() {
      if (!dialG || dialG.kind !== 'turn') return;
      dialG = null; envDragging = false; envOrb.tx = 0; envOrb.ty = 0; envIdle = now();
    }
    envdialEl.addEventListener('pointerup', dialUp);
    envdialEl.addEventListener('pointercancel', dialUp);
  }

  function onUnlockGesture(e) {
    if (e && e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return;
    if (audio) return;
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
      if (tuneOpen) { closeTune(); return; }
      if (envOpen || envOpenT > .02) { closeEnv(); return; }
      if (!sleepEl.hidden) { sleepEl.hidden = true; return; }
      goBack();
    }
    if (e.key === 'ArrowRight') setPair(pair + 1);
    if (e.key === 'ArrowLeft') setPair(pair - 1);
    if (e.key === 'ArrowUp') setIntensity(intensity + .06);
    if (e.key === 'ArrowDown') setIntensity(intensity - .06);
    if (e.key === 'r' || e.key === 'R') setRed(!red);
    if (e.key === 'd' || e.key === 'D') { if (envOpen) closeEnv(); else openEnv(); }
    if (e.key === 'm' || e.key === 'M') setEnvKey('moon', !env.moon);
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (audio && now() - audioAt > 200) togglePause();
      else startAudio();
    }
    if (e.key === 't' || e.key === 'T') toggleTune();
    if (e.key === 'p' || e.key === 'P') togglePause();
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 80); });

  /* boot */
  (function init() {
    loadStore();
    loadTune();
    if (Q.pair) {
      var i = PAIRS.findIndex(function (p) { return p.id === Q.pair || p.name === Q.pair; });
      if (i >= 0) pair = i;
    }
    if (Q.intensity != null) intensity = clamp(parseFloat(Q.intensity), 0, 1);
    if (Q.dim != null) light = clamp(parseFloat(Q.dim), .08, 1);
    if (Q.red === '1' || Q.red === 'true') red = true;
    if (Q.timer) setTimer(parseInt(Q.timer, 10) || 0);
    quiet = Q.quiet === '1';
    applyRoomEnv(pid(), true);
    ['wind', 'density', 'light', 'warmth', 'glow', 'height'].forEach(function (k) {
      if (Q[k] != null) { env[k] = clamp(parseFloat(Q[k]), 0, 1); envNow[k] = env[k]; }
    });
    if (Q.moon === '0' || Q.moon === 'false') { env.moon = false; envNow.moon = 0; }
    if (Q.moon === '1' || Q.moon === 'true') { env.moon = true; envNow.moon = 1; }
    if (Q.tilt === '1') { env.tilt = true; envNow.tilt = 1; }
    persistEnv();
    WTS[pid()] = 1;
    paintDots(); applyRed(); showInten(); intenEl.classList.remove('show');
    resize(); seed();
    if (Q.enter === '1') { enterU = 0; entering = true; }
    requestAnimationFrame(frame);
    if (Q.vol != null) { vol = clamp(parseFloat(Q.vol), 0, 1); }
    if (Q.dial === '1') setTimeout(openEnv, 80);
    if (Q.tune === '1') setTimeout(openTune, 80);
    if (Q.pause === '1') setTimeout(function () { setPaused(true); }, 40);
    if (quiet) { wakeOn = false; wakeEl.classList.remove('on'); nameEl.classList.remove('show'); }
    else {
      setTimeout(function () { if (wakeOn) wakeEl.classList.add('on'); }, 700);
      if (Q.enter === '1') setTimeout(function () { if (!quiet) showName(); }, 520);
      else showName();
    }
    try {
      if (!quiet && !localStorage.getItem(HINTK)) {
        setTimeout(function () { if (envhint && !envOpen) envhint.classList.add('show'); }, 1800);
        setTimeout(function () { if (envhint) envhint.classList.remove('show'); }, 4200);
      }
    } catch (e) {}
  })();

  window.OZNoise = {
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
    env: function () { return { wind: env.wind, density: env.density, light: env.light, warmth: env.warmth, glow: env.glow, height: env.height, moon: env.moon, tilt: env.tilt, now: { wind: envNow.wind, density: envNow.density, light: envNow.light, warmth: envNow.warmth, glow: envNow.glow, height: envNow.height, moon: envNow.moon, tilt: envNow.tilt } }; },
    setEnv: function (o) {
      if (!o) return;
      Object.keys(o).forEach(function (k) { if (k in env) setEnvKey(k, o[k], true); });
    },
    openEnv: openEnv,
    closeEnv: closeEnv,
    openTune: openTune,
    closeTune: closeTune,
    toggleTune: toggleTune,
    volume: function () { return vol; },
    setVolume: function (v) { setVol(v, true); paintTune(); saveTune(); },
    mix: function () { return { white: bedAmt('white'), pink: bedAmt('pink'), brown: bedAmt('brown') }; },
    setMix: function (o) {
      if (!o) return;
      if (o.white != null) setMix('white', o.white, true);
      if (o.pink != null) setMix('pink', o.pink, true);
      if (o.brown != null) setMix('brown', o.brown, true);
      paintTune(); saveTune();
    },
    paused: function () { return pauseOn; },
    setPaused: setPaused,
    togglePause: togglePause,
    timer: function () { return { mins: mins, left: endAt ? endAt - Date.now() : 0, fade: fade }; },
    setTimer: setTimer,
    startAudio: startAudio,
    startProbe: function () {
      probe = {
        n: 0, drop: 0, clamp: 0, maxDt: 0, minDt: 1, seed: 0,
        t0: (typeof performance !== 'undefined' ? performance.now() : Date.now()),
        sig0: (DROPS[0] && DROPS[0][2]) + ':' + (FLAKES[0] && FLAKES[0][2]) + ':' + (FLOW[0] && FLOW[0].p) + ':' + (DUST[0] && DUST[0].p),
        dropN0: DROPS.length, flakeN0: FLAKES.length, flowN0: FLOW.length, dustN0: DUST.length
      };
    },
    probe: function () {
      if (!probe) return null;
      probe.sig = (DROPS[0] && DROPS[0][2]) + ':' + (FLAKES[0] && FLAKES[0][2]) + ':' + (FLOW[0] && FLOW[0].p) + ':' + (DUST[0] && DUST[0].p);
      probe.dropN = DROPS.length; probe.flakeN = FLAKES.length; probe.flowN = FLOW.length; probe.dustN = DUST.length;
      probe.elapsed = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - probe.t0) / 1000;
      probe.hy = hy; probe.tAcc = tAcc;
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
        envOpen: envOpen, envSel: envSel,
        tuneOpen: tuneOpen, vol: vol, paused: pauseOn, pauseU: pauseU,
        mix: { white: bedAmt('white'), pink: bedAmt('pink'), brown: bedAmt('brown') }
      };
    }
  };
})();
