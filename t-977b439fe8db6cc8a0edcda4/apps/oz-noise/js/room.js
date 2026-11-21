/* oz · a room of sound and environment. Generated on the device. */
(function () {
  'use strict';

  var PAIRS = [
    { id: 'snow',   name: 'snow',   beds: { white: 1, pink: .15, brown: 0 } },
    { id: 'rain',   name: 'rain',   beds: { white: .12, pink: 1, brown: .08 } },
    { id: 'sea',    name: 'sea',    beds: { white: 0, pink: .1, brown: 1 } },
    { id: 'wind',   name: 'wind',   beds: { white: .08, pink: .35, brown: 1 } },
    { id: 'storm',  name: 'storm',  beds: { white: .1, pink: .85, brown: .7 } },
    { id: 'fire',   name: 'fire',   beds: { white: .15, pink: .35, brown: 1 } },
    { id: 'forest', name: 'forest', beds: { white: 0, pink: .4, brown: 1 } },
    { id: 'cave',   name: 'cave',   beds: { white: .05, pink: .2, brown: 1 } },
    { id: 'city',   name: 'city',   beds: { white: .2, pink: 1, brown: .25 } },
    { id: 'desert', name: 'desert', beds: { white: .2, pink: .4, brown: 1 } },
    { id: 'under',  name: 'under',  beds: { white: 0, pink: .25, brown: 1 } }
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
  var charEl = document.getElementById('char');
  var charFill = charEl.querySelector('i');
  var sleepEl = document.getElementById('sleep');
  var leftEl = document.getElementById('left');

  var W = 0, H = 0, M = 390, dpr = 1, hy = 0;
  var pair = 0, intensity = .42, character = .5, red = false, light = 1;
  var tAcc = 0, lastT = 0, windNow = 0, flash = 0, nextFlash = 0;
  var nameT = 0, dotsT = 0, intenT = 0, charT = 0, wakeOn = true, quiet = false;
  var fade = 1, fading = false;
  var endAt = 0, mins = 0, leftTick = 0;
  var DROPS = [], FLAKES = [], RINGS = [], MOTES = [], EMBERS = [], BUBBLES = [], DRIPS = [], BOKEH = [], TREES = [];
  var nextRing = 0, nextDrip = 0, nextCrack = 0, nextBubble = 0, fireFlick = 1;
  var hazeTex = null, hazeTint = null, hazeKey = '';
  var audio = null, hearing = false;
  var mood = { shift: 0, lean: 0, size: .5, hour: .5, seed: 1 };
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
  function now() { return performance.now(); }
  function haptic(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {} }
  function pid() { return PAIRS[pair].id; }
  function C() { return clamp(character + mood.shift, 0, 1); }

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

  function rollMood() {
    mood.shift = (Math.random() - .5) * .16;
    mood.lean = (Math.random() - .5) * .3;
    mood.size = .35 + Math.random() * .35;
    mood.hour = Math.random();
    mood.seed = 1 + Math.random() * 1000;
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

  function seed() {
    var i;
    DROPS = []; for (i = 0; i < 420; i++) DROPS.push([Math.random(), Math.random(), .6 + Math.random() * .8]);
    FLAKES = []; for (i = 0; i < 520; i++) FLAKES.push([Math.random(), Math.random(), .35 + Math.random() * 1.5, Math.random() * 6.28]);
    MOTES = []; for (i = 0; i < 90; i++) MOTES.push({ x: Math.random(), y: Math.random() * .85, r: .5 + Math.random() * 1.4, s: .3 + Math.random() * .7, p: Math.random() * 6.28 });
    EMBERS = []; for (i = 0; i < 120; i++) EMBERS.push({ x: .35 + Math.random() * .3, y: 1 + Math.random(), v: .08 + Math.random() * .2, r: .6 + Math.random() * 1.8, p: Math.random() * 6.28 });
    BUBBLES = []; for (i = 0; i < 70; i++) BUBBLES.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 2.4, v: .04 + Math.random() * .1, p: Math.random() * 6.28 });
    DRIPS = [];
    BOKEH = []; for (i = 0; i < 18; i++) BOKEH.push({ x: .08 + Math.random() * .84, y: .42 + Math.random() * .28, r: 4 + Math.random() * 16, a: .04 + Math.random() * .1, c: Math.random() });
    TREES = [];
    var x = -20, sd = mood.seed;
    function rnd() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
    while (x < 500) {
      var tw = 8 + rnd() * 22, th = 40 + rnd() * 90, lean = (rnd() - .5) * .2;
      TREES.push({ x: x, w: tw, h: th, lean: lean }); x += tw * (.7 + rnd() * 1.1);
    }
    RINGS = [];
  }

  function palettes() {
    return {
      snow:  { top: [5, 9, 16],    mid: [10, 18, 28],   hor: [28, 38, 52],   water: [8, 12, 18] },
      rain:  { top: [4, 7, 11],    mid: [7, 13, 22],    hor: [18, 28, 46],   water: [6, 10, 16] },
      sea:   { top: [8, 12, 16],   mid: [16, 22, 28],   hor: [28, 36, 42],   water: [10, 16, 22] },
      wind:  { top: [5, 9, 15],    mid: [10, 18, 34],   hor: [26, 37, 64],   water: [8, 12, 20] },
      storm: { top: [3, 5, 10],    mid: [8, 10, 18],    hor: [16, 20, 28],   water: [4, 6, 10] },
      fire:  { top: [8, 4, 4],     mid: [22, 10, 6],    hor: [48, 18, 8],    water: [12, 4, 2] },
      forest:{ top: [3, 6, 6],     mid: [6, 12, 10],    hor: [10, 18, 14],   water: [4, 8, 6] },
      cave:  { top: [4, 4, 5],     mid: [8, 8, 9],      hor: [16, 14, 14],   water: [6, 7, 8] },
      city:  { top: [6, 6, 10],    mid: [14, 12, 18],   hor: [36, 24, 22],   water: [8, 8, 12] },
      desert:{ top: [10, 8, 12],   mid: [28, 18, 16],   hor: [64, 38, 24],   water: [18, 12, 10] },
      under: { top: [2, 8, 16],    mid: [4, 18, 32],    hor: [8, 36, 48],    water: [2, 10, 18] }
    };
  }

  function drawWash(p, I) {
    var id = pid(), c = C(), top = p.top, mid = p.mid, hor = p.hor, water = p.water;
    var hour = clamp(c * .7 + mood.hour * .3, 0, 1);
    if (id === 'snow') {
      top = mix(top, [48, 58, 72], I * .62); mid = mix(mid, [110, 122, 138], I * .5); hor = mix(hor, [200, 208, 216], I * .28);
      var dawn = mix([24, 28, 48], [70, 62, 58], hour); top = mix(top, dawn, hour * .35); mid = mix(mid, [90, 80, 78], hour * .2);
    }
    if (id === 'sea') { top = mix(top, [90, 96, 104], I * .55 * (1 - c * .3)); mid = mix(mid, [140, 146, 152], I * .5); hor = mix(hor, [180, 186, 190], I * .45); }
    if (id === 'rain' || id === 'storm') { var dk = 1 - I * .22 - (id === 'storm' ? c * .12 : 0); top = [top[0] * dk, top[1] * dk, top[2] * dk]; mid = [mid[0] * dk, mid[1] * dk, mid[2] * dk]; }
    if (id === 'fire') { var glow = .35 + I * .5 + c * .25; mid = mix(mid, [80, 28, 10], glow * .5); hor = mix(hor, [160, 60, 18], glow * fireFlick); }
    if (id === 'desert') {
      var dusk = mix([10, 8, 16], [48, 22, 16], 1 - hour), eve = mix([28, 18, 16], [120, 62, 32], (1 - hour) * .7);
      top = mix(top, dusk, .6); mid = mix(mid, eve, .5); hor = mix(hor, [180, 110, 60], (1 - hour) * .45 + I * .15);
    }
    if (id === 'under') { var deep = c; top = mix(top, [1, 4, 10], deep); mid = mix(mid, [2, 10, 22], deep); hor = mix(hor, [6, 28, 40], 1 - deep * .4); }
    if (id === 'city') { hor = mix(hor, [80, 48, 32], .3 + c * .3 + I * .15); }
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(top));
    g.addColorStop(Math.max(.15, hy / H * .85), rgb(mid));
    g.addColorStop(Math.min(.95, hy / H), rgb(hor));
    g.addColorStop(1, rgb(water));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  }

  function drawClouds(dt, I, wind) {
    var id = pid();
    if (id === 'fire' || id === 'cave' || id === 'under' || id === 'desert') return;
    var amt = id === 'wind' ? .35 + I * .7 : id === 'storm' ? .55 + I * .4 : id === 'rain' || id === 'city' ? .25 + I * .4 : id === 'snow' ? .15 + I * .35 : id === 'forest' ? .2 + C() * .2 : .08 + I * .15;
    if (amt < .02) return;
    var S = 900 * Math.max(1, M / 390), speed = 6 + wind * 30 + (id === 'wind' ? (I + C()) * 30 : 0);
    var ox = ((tAcc * speed) % S + S) % S;
    var glowC = id === 'storm' ? [120, 110, 120] : id === 'city' ? [160, 120, 100] : [150, 140, 150];
    if (id === 'snow') glowC = mix(glowC, [210, 216, 224], .45);
    cx.save(); cx.globalCompositeOperation = 'screen';
    var t2 = tintHaze(glowC);
    cx.globalAlpha = Math.min(.62, amt * .42);
    var Si = Math.round(S), top = -S * .22;
    for (var x = Math.floor(-ox); x < W; x += Si) cx.drawImage(t2, x, top, Si, Math.max(1, hy - top));
    cx.restore();
    var gb = cx.createLinearGradient(0, hy - H * .3, 0, hy);
    gb.addColorStop(0, rgba([120, 96, 90], 0));
    gb.addColorStop(1, rgba(id === 'city' ? [200, 140, 90] : [150, 112, 100], .08 * amt + (id === 'city' ? .06 : 0)));
    cx.fillStyle = gb; cx.fillRect(0, hy - H * .3, W, H * .3);
  }

  function drawFog(I, wind) {
    var id = pid();
    var amt = id === 'sea' ? .35 + I * .7 * (1 - C() * .3) : id === 'snow' ? I * .25 : id === 'wind' ? .1 + I * .15 : id === 'forest' ? .2 + C() * .35 : id === 'desert' ? .15 + I * .4 : id === 'under' ? .2 + C() * .3 : 0;
    if (amt < .02) return;
    var T = 512 * Math.max(1, M / 390);
    var col = id === 'desert' ? [180, 150, 110] : id === 'under' ? [40, 80, 110] : id === 'forest' ? [80, 110, 90] : mix([150, 152, 158], [220, 224, 230], id === 'sea' ? I * .5 : 0);
    [[.055, 6, 1], [.04, -4, 1.6]].forEach(function (L, j) {
      var Si = Math.round(T * L[2]);
      var ox = ((tAcc * L[1] * (1 + wind)) % Si + Si) % Si;
      var oy = ((tAcc * L[1] * .35 * (j ? -1 : 1)) % Si + Si) % Si;
      cx.save(); cx.globalAlpha = Math.min(1, amt * L[0] * 1.8);
      cx.globalCompositeOperation = 'screen';
      var t2 = tintHaze(col);
      for (var x = Math.floor(-ox); x < W; x += Si) for (var y = Math.floor(-oy); y < H; y += Si) cx.drawImage(t2, x, y, Si, Si);
      cx.restore();
    });
  }

  function drawRain(dt, I, wind, still) {
    var id = pid();
    var ra = (id === 'rain' || id === 'storm' || id === 'city') ? (.25 + I * .95) : 0;
    if (ra < .02) return;
    var n = Math.round(DROPS.length * Math.min(1, ra)), lean = .12 + wind * .25 + mood.lean * .15, vy = H * (1.2 + I * .8);
    if (id === 'city') { vy *= .45; lean *= .4; }
    var lenK = id === 'city' ? .7 + C() * .8 : 1 + C() * .5;
    cx.lineWidth = 1; cx.strokeStyle = rgba([200, 214, 230], .22 * Math.min(1, ra));
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var d = DROPS[i];
      if (!still) d[1] += dt * vy / H * d[2];
      if (d[1] > 1) { d[1] -= 1; d[0] = Math.random(); }
      var X = d[0] * (W + 60) - 30 + d[1] * H * lean, Y = d[1] * hy * 1.25, L2 = 10 * d[2] * (M / 390 + .3) * lenK;
      if (id === 'city' && Y > hy) { /* streaks continue down the glass */ }
      else if (Y > hy) continue;
      cx.moveTo(X, Y); cx.lineTo(X - L2 * lean, Y - L2);
    }
    cx.stroke();
    if (id !== 'city' && !still && now() > nextRing && Math.random() < dt * (4 + I * 8) * Math.min(1, ra)) {
      RINGS.push({ x: Math.random() * W, y: hy + 8 + Math.random() * (H - hy - 16), t: now(), s: .35 + I * .4 });
      nextRing = now() + (180 + Math.random() * 400) / (1 + I);
    }
  }

  function drawSnow(dt, I, wind, still) {
    if (pid() !== 'snow') return;
    var sa = .2 + I * .95; if (sa < .02) return;
    var n = Math.round(FLAKES.length * Math.min(1, sa));
    var size = (.7 + C() * 1.1) * (mood.size * 1.4);
    cx.fillStyle = rgba([240, 244, 250], .7 * Math.min(1, sa));
    for (var i = 0; i < n; i++) {
      var f = FLAKES[i];
      if (!still) { f[1] += dt * (.05 + I * .12) * f[2]; f[0] += dt * (.01 + I * .04) * wind; }
      if (f[1] > 1) f[1] -= 1; if (f[0] > 1) f[0] -= 1; if (f[0] < 0) f[0] += 1;
      var X2 = f[0] * W + Math.sin(tAcc * .8 + f[3]) * (10 + I * 14), Y2 = f[1] * H, r2 = f[2] * (1.05 + I * .7) * size * (M / 390 + .2);
      cx.beginPath(); cx.arc(X2, Y2, r2, 0, 6.283); cx.fill();
    }
  }

  function drawWater(I) {
    var id = pid();
    if (id === 'fire' || id === 'forest' || id === 'desert' || id === 'city' || id === 'under') return;
    var swell = (id === 'sea' ? .4 + I * .7 * (0.4 + C()) : id === 'rain' || id === 'storm' ? .18 + I * .28 : id === 'wind' ? .2 + I * .35 : id === 'cave' ? .08 : .03);
    var lineA = id === 'snow' ? .05 : id === 'sea' ? (.1 + swell * .06) * (1 - I * .55) : id === 'cave' ? .07 : .08 + swell * .07;
    cx.fillStyle = rgba([4, 6, 10], .28 + (id === 'sea' ? I * .1 : 0));
    cx.fillRect(0, hy, W, H - hy);
    var t = tAcc, nLines = id === 'snow' || id === 'cave' ? 3 : 5;
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
      var u = (nowMs - r.t) / 1600, e = 1 - Math.pow(1 - u, 3), a = (1 - u) * .28 * r.s;
      var rx = 18 * e * r.s * (M / 390 + .5), ry = rx * .28;
      cx.strokeStyle = rgba([210, 220, 230], a);
      cx.beginPath(); cx.ellipse(r.x, r.y, rx, ry, 0, 0, 6.283); cx.stroke();
    });
    var ha = id === 'sea' ? .16 * (1 - I * .75) : id === 'snow' ? .1 : .16;
    cx.strokeStyle = rgba([220, 226, 232], ha);
    cx.beginPath(); cx.moveTo(0, hy + .5); cx.lineTo(W, hy + .5); cx.stroke();
  }

  function drawWindMotes(dt, I, wind, still) {
    if (pid() !== 'wind' && pid() !== 'desert') return;
    var n = Math.round(MOTES.length * (.3 + I * .7));
    var col = pid() === 'desert' ? [220, 190, 140] : [220, 226, 234];
    var lenK = .8 + C() * 1.4;
    cx.strokeStyle = rgba(col, .16 + I * .22);
    cx.lineWidth = 1;
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var q = MOTES[i];
      if (!still) { q.x += dt * (.04 + wind * .18) * q.s * (1 + I * 1.4); q.y += dt * .006 * Math.sin(tAcc + q.p); }
      if (q.x > 1.08) q.x = -.08;
      var L = (10 + I * 28) * q.s * lenK * (M / 390 + .4);
      var X = q.x * W, Y = q.y * H;
      cx.moveTo(X, Y); cx.lineTo(X - L, Y + L * (pid() === 'desert' ? .04 : .08));
    }
    cx.stroke();
  }

  function drawStorm(dt, I, still) {
    if (pid() !== 'storm') return;
    var rate = (1 + C() * 1.6);
    if (!still && now() > nextFlash) {
      flash = .7 + I * .5; nextFlash = now() + (5000 + Math.random() * 9000) / ((1 + I * 1.4) * rate);
      if (audio && audio.thunder) audio.thunder();
    }
    if (flash > .01) {
      cx.fillStyle = rgba([220, 228, 255], .2 * flash);
      cx.fillRect(0, 0, W, hy);
      flash *= Math.exp(-dt * 7);
    }
  }

  function drawFire(dt, I, still) {
    if (pid() !== 'fire') return;
    fireFlick += ((.85 + Math.random() * .3) - fireFlick) * Math.min(1, dt * 8);
    var glow = .4 + I * .5 + C() * .25;
    var gx = W * (.5 + mood.lean * .08), gy = H * .92, gr = Math.max(W, H) * (.45 + I * .2);
    var g = cx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, rgba([255, 160, 50], .42 * glow * fireFlick));
    g.addColorStop(.35, rgba([220, 70, 16], .22 * glow));
    g.addColorStop(.7, rgba([80, 16, 4], .08 * glow));
    g.addColorStop(1, rgba([0, 0, 0], 0));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    var n = Math.round(EMBERS.length * (.25 + I * .75) * (.6 + C() * .6));
    for (var i = 0; i < n; i++) {
      var e = EMBERS[i];
      if (!still) { e.y -= dt * e.v * (0.7 + I + C() * .4); e.x += dt * .04 * Math.sin(tAcc * 1.4 + e.p); }
      if (e.y < -.05) { e.y = 1.02; e.x = .3 + Math.random() * .4; }
      var a = Math.max(0, 1 - (1 - e.y) * .9);
      cx.fillStyle = rgba(e.r > 1.4 ? [255, 210, 120] : [255, 120, 40], .55 * a);
      cx.beginPath(); cx.arc(e.x * W, e.y * H, e.r * (M / 390 + .3) * (.7 + I * .5), 0, 6.283); cx.fill();
    }
    if (audio && audio.crackle && now() > nextCrack) {
      nextCrack = now() + (180 + Math.random() * 500) / (1 + I * 2 + C());
      audio.crackle(I, C());
    }
  }

  function drawForest(dt, I, still) {
    if (pid() !== 'forest') return;
    var sc = M / 390, ground = H * .78, c = C();
    var mist = cx.createLinearGradient(0, ground - 80 * sc, 0, H);
    mist.addColorStop(0, rgba([6, 12, 10], 0));
    mist.addColorStop(.45, rgba([2, 6, 5], .55));
    mist.addColorStop(1, rgba([1, 3, 2], .92));
    cx.fillStyle = mist; cx.fillRect(0, ground - 80 * sc, W, H - (ground - 80 * sc));
    function tree(tr, layer) {
      var x = (tr.x * sc * (layer === 0 ? .85 : 1) + (layer ? 0 : 18)) % (W + 90) - 40;
      var base = ground + (layer ? 28 : 8) * sc;
      var h = tr.h * sc * (layer ? (1 + c * .18) : .7);
      var w = tr.w * sc * (layer ? 1.15 : .9);
      var lean = tr.lean * h;
      var top = base - h;
      cx.fillStyle = rgba(layer ? [1, 5, 4] : [4, 10, 8], layer ? .94 : .55);
      cx.beginPath();
      cx.moveTo(x - w * .2, base);
      cx.quadraticCurveTo(x + w * .05 + lean * .2, base - h * .35, x + w * .28 + lean * .5, base - h * .72);
      cx.quadraticCurveTo(x + w * .48 + lean, top + h * .1, x + w * .55 + lean, top + h * .04);
      cx.quadraticCurveTo(x + w * .7 + lean * .3, base - h * .68, x + w * 1.05, base);
      cx.closePath(); cx.fill();
    }
    TREES.forEach(function (tr) { tree(tr, 0); });
    TREES.forEach(function (tr) { tree(tr, 1); });
    var n = Math.round(28 * (.2 + c * .8 + I * .2));
    for (var i = 0; i < n; i++) {
      var p = MOTES[i];
      var blink = 0.35 + 0.65 * Math.max(0, Math.sin(tAcc * (.6 + p.s) + p.p));
      cx.fillStyle = rgba([210, 230, 140], .15 * blink + I * .08);
      cx.beginPath(); cx.arc(((p.x + tAcc * .01 * p.s) % 1) * W, p.y * ground * .9, (1.2 + p.r) * sc, 0, 6.283); cx.fill();
    }
    if (audio && audio.rustle && Math.random() < dt * (0.4 + I + c) * 1.2) audio.rustle(I, c);
  }

  function drawCave(dt, I, still) {
    if (pid() !== 'cave') return;
    var c = C();
    var vg = cx.createRadialGradient(W * .5, H * .45, H * .1, W * .5, H * .5, H * .85);
    vg.addColorStop(0, rgba([16, 14, 14], .0));
    vg.addColorStop(1, rgba([0, 0, 0], .45));
    cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
    for (var i = 0; i < 11; i++) {
      var x = ((i * 89 + mood.seed * 10) % (W + 50)) - 16;
      var h = (22 + ((i * 37) % 48) * (0.7 + c)) * (M / 390 + .4);
      var w = 5 + (i % 4) * 2;
      cx.fillStyle = rgba([18, 16, 16], .35 + (i % 3) * .08);
      cx.beginPath();
      cx.moveTo(x - w, 0);
      cx.quadraticCurveTo(x - w * .2, h * .55, x, h);
      cx.quadraticCurveTo(x + w * .3, h * .5, x + w, 0);
      cx.closePath(); cx.fill();
    }
    if (!still && now() > nextDrip) {
      nextDrip = now() + (400 + Math.random() * 1400) / (0.4 + I * 1.4 + c * 1.2);
      var dx = .15 + Math.random() * .7;
      DRIPS.push({ x: dx, y: 0, v: .35 + Math.random() * .25 });
      if (audio && audio.drip) audio.drip(I, c);
    }
    cx.fillStyle = rgba([200, 210, 220], .5);
    for (var k = DRIPS.length - 1; k >= 0; k--) {
      var d = DRIPS[k];
      d.y += dt * d.v * (1 + I);
      cx.beginPath(); cx.arc(d.x * W, d.y * hy, 1.2 * (M / 390 + .3), 0, 6.283); cx.fill();
      if (d.y * hy > hy) {
        RINGS.push({ x: d.x * W, y: hy + 6 + Math.random() * 10, t: now(), s: .3 + I * .3 });
        DRIPS.splice(k, 1);
      }
    }
  }

  function drawCity(dt, I) {
    if (pid() !== 'city') return;
    BOKEH.forEach(function (b) {
      var pulse = .7 + .3 * Math.sin(tAcc * (.3 + b.c) + b.x * 8);
      var rr = b.r * (M / 390) * (1 + C() * .4), a = b.a * pulse * (.8 + I * .4 + C() * .3);
      var g = cx.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, rr);
      var col = b.c > .6 ? [255, 180, 90] : b.c > .3 ? [255, 210, 140] : [180, 200, 255];
      g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(b.x * W, b.y * H, rr, 0, 6.283); cx.fill();
    });
    var inset = 18 * (M / 390);
    cx.strokeStyle = rgba([200, 210, 220], .1);
    cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(inset, H * .12); cx.lineTo(inset, H - inset); cx.moveTo(W - inset, H * .12); cx.lineTo(W - inset, H - inset);
    cx.moveTo(inset, H - inset); cx.lineTo(W - inset, H - inset); cx.stroke();
  }

  function drawDesert() {
    if (pid() !== 'desert') return;
    var ground = H * .62, c = C();
    function dune(off, amp, col, a) {
      var lastY = ground;
      cx.fillStyle = rgba(col, a);
      cx.beginPath(); cx.moveTo(0, H);
      for (var x = 0; x <= W; x += 6) {
        lastY = ground + off + Math.sin(x * 0.012 + mood.seed + off) * amp + Math.sin(x * 0.03 + 2 + off) * amp * .4 + c * 8;
        cx.lineTo(x, lastY);
      }
      if ((W % 6) !== 0) cx.lineTo(W, lastY);
      cx.lineTo(W, H); cx.lineTo(0, H); cx.closePath(); cx.fill();
    }
    dune(0, 28, [28, 16, 10], .55);
    dune(36, 18, [18, 10, 8], .5);
  }

  function drawUnder(dt, I, still) {
    if (pid() !== 'under') return;
    var c = C();
    cx.save(); cx.globalCompositeOperation = 'screen';
    for (var k = 0; k < 4; k++) {
      var amp = 14 + k * 8, yy = H * (.18 + k * .2), band = 18 + k * 6;
      cx.fillStyle = rgba([80, 180, 210], .03 + (1 - c) * .045);
      cx.beginPath();
      for (var x = 0; x <= W; x += 6) {
        var y = yy + Math.sin(x * 0.014 + tAcc * (.25 + k * .06) + k) * amp + Math.sin(x * 0.035 + tAcc * .12) * amp * .35;
        if (x === 0) cx.moveTo(x, y - band); else cx.lineTo(x, y - band);
      }
      for (x = W; x >= 0; x -= 6) {
        var y2 = yy + Math.sin(x * 0.014 + tAcc * (.25 + k * .06) + k) * amp + Math.sin(x * 0.035 + tAcc * .12) * amp * .35;
        cx.lineTo(x, y2 + band);
      }
      cx.closePath(); cx.fill();
    }
    cx.restore();
    var n = Math.round(BUBBLES.length * (.25 + I * .5 + (1 - c) * .3));
    for (var i = 0; i < n; i++) {
      var b = BUBBLES[i];
      if (!still) { b.y -= dt * b.v * (0.6 + I); b.x += dt * .02 * Math.sin(tAcc + b.p); }
      if (b.y < -.05) { b.y = 1.05; b.x = Math.random(); }
      cx.strokeStyle = rgba([180, 220, 240], .2 + I * .15);
      cx.lineWidth = 1;
      cx.beginPath(); cx.arc(b.x * W, b.y * H, b.r * (M / 390 + .3), 0, 6.283); cx.stroke();
    }
    if (audio && audio.bubble && now() > nextBubble) {
      nextBubble = now() + (400 + Math.random() * 1200) / (1 + I + (1 - c));
      audio.bubble(I, c);
    }
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight; M = Math.min(W, 430);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var id = pid();
    hy = id === 'cave' ? H * .78 : id === 'forest' ? H * .98 : id === 'fire' ? H * .88 : H * .62;
  }

  function frame(ts) {
    if (!lastT) lastT = ts;
    var dt = Math.min(.05, (ts - lastT) / 1000); lastT = ts;
    tAcc += dt;
    var I = intensity * fade, id = pid(), c = C();
    var wind = (id === 'wind' || id === 'desert' ? .45 : id === 'storm' ? .4 : id === 'rain' || id === 'city' ? .22 : id === 'snow' ? .12 : .08) + I * (id === 'wind' || id === 'desert' ? .8 : .45);
    wind += mood.lean * .15 + (id === 'wind' || id === 'desert' ? c * .25 : 0);
    windNow += (wind - windNow) * (1 - Math.exp(-dt * 2));
    var still = false;
    var pals = palettes();
    drawWash(pals[id], I);
    drawClouds(dt, I, windNow);
    drawWater(I);
    drawRain(dt, I, windNow, still);
    drawSnow(dt, I, windNow, still);
    drawFog(I, windNow);
    drawWindMotes(dt, I, windNow, still);
    drawStorm(dt, I, still);
    drawFire(dt, I, still);
    drawForest(dt, I, still);
    drawCave(dt, I, still);
    drawCity(dt, I);
    drawDesert();
    drawUnder(dt, I, still);
    if (fading) {
      fade = Math.max(0, fade - dt / 20);
      if (audio) audio.set(pair, intensity, fade, character);
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
    var delay = ac.createDelay(1.2); delay.delayTime.value = .22;
    var dGain = ac.createGain(); dGain.gain.value = 0;
    var dest = ac.createMediaStreamDestination();
    var beds = {}, usingEl = false, blobUrl = null, fallback = false;

    /* unlock Web Audio with one silent sample, still inside the gesture */
    var silent = ac.createBuffer(1, 1, ac.sampleRate);
    var one = ac.createBufferSource(); one.buffer = silent; one.connect(ac.destination); one.start(0);

    /* keep the media stream alive so <audio> has a track before beds exist */
    var keep = ac.createGain(); keep.gain.value = 0.0001;
    var osc = ac.createOscillator(); osc.frequency.value = 40;
    osc.connect(keep); keep.connect(dest); osc.start();

    hp.connect(lp); lp.connect(master);
    master.connect(delay); delay.connect(dGain); dGain.connect(master);
    master.connect(dest);

    prepBedEl();
    /* media-channel element: live stream first (ignores the silent switch).
       Do not start a second src beforehand — replacing it mid-play aborts and can stall iOS. */
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
      var made = [4.1, 6.7].map(function (secs) { return make(kind, secs); });
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

    var gust = { t: 0 };
    function set(pi, I, f, ch) {
      var p = PAIRS[pi], id = p.id, c = ch == null ? character : ch;
      var gain = (.06 + I * .5) * (f == null ? 1 : f);
      var t = ac.currentTime;
      master.gain.setTargetAtTime(gain, t, .08);
      if (fallback && bedEl) bedEl.volume = clamp(gain / .5, 0, 1);
      Object.keys(beds).forEach(function (k) { beds[k].g.gain.setTargetAtTime((p.beds[k] || 0), t, .12); });
      dGain.gain.setTargetAtTime(id === 'cave' ? .22 + c * .35 : id === 'under' ? .12 : id === 'city' ? .08 : 0, t, .2);
      delay.delayTime.setTargetAtTime(id === 'cave' ? .18 + c * .4 : id === 'under' ? .28 : .16, t, .2);
      if (id === 'snow') { hp.frequency.setTargetAtTime(180 + I * 500 + c * 200, t, .1); lp.frequency.setTargetAtTime(8000 + I * 4000, t, .1); }
      else if (id === 'rain' || id === 'city') { hp.frequency.setTargetAtTime(id === 'city' ? 120 : 80, t, .1); lp.frequency.setTargetAtTime((id === 'city' ? 2800 : 6000) + I * 5000 + c * 1500, t, .1); }
      else if (id === 'sea') { hp.frequency.setTargetAtTime(30, t, .1); lp.frequency.setTargetAtTime(280 + I * 700 + c * 200, t, .2); }
      else if (id === 'wind' || id === 'desert') { hp.frequency.setTargetAtTime(id === 'desert' ? 80 : 40, t, .1); }
      else if (id === 'fire') { hp.frequency.setTargetAtTime(60, t, .1); lp.frequency.setTargetAtTime(800 + I * 1800 + c * 800, t, .1); }
      else if (id === 'forest') { hp.frequency.setTargetAtTime(40, t, .1); lp.frequency.setTargetAtTime(1200 + I * 2000 + c * 800, t, .15); }
      else if (id === 'cave') { hp.frequency.setTargetAtTime(30, t, .1); lp.frequency.setTargetAtTime(400 + I * 500 + c * 300, t, .15); }
      else if (id === 'under') { hp.frequency.setTargetAtTime(20, t, .1); lp.frequency.setTargetAtTime(220 + I * 280 + (1 - c) * 200, t, .2); }
      else { hp.frequency.setTargetAtTime(50, t, .1); lp.frequency.setTargetAtTime(4000 + I * 4000, t, .1); }
    }
    function tickGust() {
      if (!audio) return;
      var id = pid(), I = intensity * fade, c = C();
      if (id === 'wind' || id === 'sea' || id === 'storm' || id === 'desert' || id === 'under' || id === 'fire') {
        gust.t += 0.05;
        var wob = id === 'sea' || id === 'under' ? Math.sin(gust.t * .15) * (80 + I * 200) : (Math.sin(gust.t * .4) * .5 + Math.sin(gust.t * .17) * .5) * (400 + I * 1800 + c * 400);
        var base = id === 'sea' ? 280 + I * 700 : id === 'under' ? 220 + I * 280 : id === 'fire' ? 800 + I * 1800 : id === 'wind' || id === 'desert' ? 700 + I * 2200 : 1400;
        lp.frequency.setTargetAtTime(Math.max(160, base + wob), ac.currentTime, .2);
        if (id === 'sea' || id === 'under') {
          var swell = 1 + Math.sin(gust.t * .12) * (.12 + I * .28);
          master.gain.setTargetAtTime((.06 + intensity * .5) * fade * swell, ac.currentTime, .4);
        }
      }
      setTimeout(tickGust, 80);
    }
    function burst(kind, I, c) {
      var n, d, i, last, src, f, g, nowT = ac.currentTime;
      if (kind === 'thunder') {
        n = Math.round(ac.sampleRate * (1.4 + Math.random() * 1.2)); d = new Float32Array(n); last = 0;
        for (i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * .04) / 1.04; var env = Math.sin((i / n) * Math.PI); d[i] = last * env * env; }
        f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180 + I * 220;
        g = ac.createGain(); g.gain.value = (.18 + I * .4) * fade;
      } else if (kind === 'crackle') {
        n = Math.round(ac.sampleRate * (.03 + Math.random() * .06)); d = new Float32Array(n);
        for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
        f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 2400; f.Q.value = 1.2;
        g = ac.createGain(); g.gain.value = (.08 + I * .16 + c * .06) * fade;
      } else if (kind === 'drip') {
        n = Math.round(ac.sampleRate * .28); d = new Float32Array(n);
        var f0 = 1400 + Math.random() * 900;
        for (i = 0; i < n; i++) d[i] = Math.sin(2 * Math.PI * f0 * (i / ac.sampleRate) * Math.pow(1 - i / n, .4)) * Math.pow(1 - i / n, 8);
        f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 4000;
        g = ac.createGain(); g.gain.value = (.16 + I * .2) * fade;
      } else if (kind === 'bubble') {
        n = Math.round(ac.sampleRate * (.12 + Math.random() * .12)); d = new Float32Array(n);
        for (i = 0; i < n; i++) { var u = i / n, freq = 700 - u * 420 + Math.random() * 20; d[i] = Math.sin(2 * Math.PI * freq * i / ac.sampleRate) * Math.sin(u * Math.PI) * .5; }
        f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
        g = ac.createGain(); g.gain.value = (.1 + I * .14) * fade;
      } else {
        n = Math.round(ac.sampleRate * (.2 + Math.random() * .3)); d = new Float32Array(n); last = 0;
        for (i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * .08) / 1.08; d[i] = last * Math.sin((i / n) * Math.PI); }
        f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800 + c * 600; f.Q.value = .8;
        g = ac.createGain(); g.gain.value = (.05 + I * .08) * fade;
      }
      var buf = ac.createBuffer(1, n, ac.sampleRate); buf.getChannelData(0).set(d);
      src = ac.createBufferSource(); src.buffer = buf;
      src.connect(f); f.connect(g); g.connect(master);
      src.start(nowT);
    }

    set(pair, intensity, fade, character);
    tickGust();
    return {
      ac: ac, set: set, dest: dest,
      thunder: function () { burst('thunder', intensity, C()); },
      crackle: function (I, c) { burst('crackle', I, c); },
      drip: function (I, c) { burst('drip', I, c); },
      bubble: function (I, c) { burst('bubble', I, c); },
      rustle: function (I, c) { burst('rustle', I, c); },
      resume: function () {
        try { if (ac.state === 'suspended') ac.resume(); } catch (e) {}
        prepBedEl();
        try { if (bedEl && bedEl.paused) bedEl.play(); } catch (e2) {}
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
    audio.set(pair, intensity, fade, character);
    setTimeout(paintHear, 60);
    setTimeout(paintHear, 400);
  }

  /* ---------- chrome ---------- */
  function paintDots() {
    dotsEl.innerHTML = PAIRS.map(function (p, i) { return '<i' + (i === pair ? ' class="on"' : '') + '></i>'; }).join('');
  }
  function showName() {
    nameEl.textContent = PAIRS[pair].name;
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
  function showChar() {
    charFill.style.height = (8 + character * 92) + '%';
    charEl.classList.add('show');
    clearTimeout(charT); charT = setTimeout(function () { charEl.classList.remove('show'); }, 1200);
  }
  function setPair(i, q) {
    i = ((i % PAIRS.length) + PAIRS.length) % PAIRS.length;
    if (i === pair && !q) return;
    pair = i; flash = 0; rollMood(); seed(); resize();
    paintDots(); showDots();
    if (!q) showName();
    if (audio) audio.set(pair, intensity, fade, character);
    if (!q) haptic(10);
  }
  function setIntensity(v, q) {
    intensity = clamp(v, 0, 1);
    if (!q) showInten();
    if (audio) audio.set(pair, intensity, fade, character);
  }
  function setCharacter(v, q) {
    character = clamp(v, 0, 1);
    if (!q) showChar();
    if (audio) audio.set(pair, intensity, fade, character);
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
  function goBack() { if (window.history.length > 1) window.history.back(); }
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
    if (audio) audio.set(pair, intensity, fade, character);
    [].forEach.call(sleepEl.querySelectorAll('button'), function (b) { b.classList.toggle('on', +b.dataset.m === mins); });
    paintLeft(); leftTick = Date.now();
    sleepEl.hidden = true;
  }

  /* gestures */
  var g = null, holdT = 0, lastTap = 0, lastDim = .45, foldT = 0, pointers = {};

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
  function pointerCount() { return Object.keys(pointers).length; }

  canvas.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (pointerCount() >= 2) {
      clearTimeout(holdT);
      var pts = []; for (var k in pointers) pts.push(pointers[k]);
      g = { kind: 'char', y: (pts[0].y + pts[1].y) / 2, ic: character, moved: false };
      return;
    }
    g = { kind: 'env', x: e.clientX, y: e.clientY, ix: intensity, ic: character, t: now(), moved: false, back: e.clientX < 22 };
    holdT = setTimeout(function () {
      if (!g || g.moved || g.kind !== 'env') return;
      sleepEl.hidden = false; hideSleepSoon();
    }, 650);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (pointers[e.pointerId]) { pointers[e.pointerId].x = e.clientX; pointers[e.pointerId].y = e.clientY; }
    if (g && g.kind === 'char') {
      var pts = []; for (var k in pointers) pts.push(pointers[k]);
      if (pts.length >= 2) {
        var y = (pts[0].y + pts[1].y) / 2;
        if (Math.abs(y - g.y) > 4) g.moved = true;
        setCharacter(g.ic - (y - g.y) / (H * .55));
      }
      return;
    }
    if (!g || g.kind !== 'env') return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) > 8) { g.moved = true; clearTimeout(holdT); }
    if (g.back) {
      var p = clamp(dx / 72, 0, 1);
      backhint.style.transform = 'translate(' + Math.min(18, dx * .4) + 'px, -50%)';
      backhint.classList.toggle('on', p > 0);
      return;
    }
    if (!g.moved) return;
    if (g.axis == null && Math.hypot(dx, dy) > 14) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (g.axis === 'y') setIntensity(g.ix - dy / (H * .55));
  });
  canvas.addEventListener('pointerup', function (e) {
    delete pointers[e.pointerId];
    if (g && g.kind === 'char') { if (pointerCount() < 2) g = null; return; }
    if (!g || g.kind !== 'env') return;
    clearTimeout(holdT);
    var dx = e.clientX - g.x, back = g.back, axis = g.axis, moved = g.moved;
    g = null;
    backhint.classList.remove('on');
    backhint.style.transform = 'translate(-8px, -50%)';
    if (back && dx > 56) { goBack(); return; }
    if (axis === 'x' && Math.abs(dx) > 40) setPair(pair + (dx < 0 ? 1 : -1));
    else if (!moved && !sleepEl.hidden) { /* keep the timer sheet */ }
  });
  canvas.addEventListener('pointercancel', function (e) {
    delete pointers[e.pointerId];
    clearTimeout(holdT); g = null; backhint.classList.remove('on');
  });

  /* character also from a vertical drag on the left hairline hit (inset, so it doesn't steal Back) */
  var charHit = document.createElement('div');
  charHit.setAttribute('aria-hidden', 'true');
  charHit.style.cssText = 'position:fixed;left:22px;top:30%;width:24px;height:40%;z-index:9;touch-action:none;';
  document.body.appendChild(charHit);
  charHit.addEventListener('pointerdown', function (e) {
    if (e.clientX < 18 && e.clientY < H * .35) return; /* leave the back / chrome corner */
    e.preventDefault(); e.stopPropagation();
    try { charHit.setPointerCapture(e.pointerId); } catch (x) {}
    g = { kind: 'char', y: e.clientY, ic: character, moved: false };
  });
  charHit.addEventListener('pointermove', function (e) {
    if (!g || g.kind !== 'char' || pointerCount() >= 2) return;
    if (Math.abs(e.clientY - g.y) > 4) g.moved = true;
    if (g.moved) setCharacter(g.ic - (e.clientY - g.y) / (H * .55));
  });
  charHit.addEventListener('pointerup', function () { if (g && g.kind === 'char') g = null; });

  sleepEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    setTimer(+b.dataset.m); haptic(10);
  });

  /* iOS: create / resume the context and play the media element on click or touchend only */
  function onUnlockGesture(e) {
    if (e && e.type === 'touchend' && e.touches && e.touches.length) return;
    startAudio();
  }
  document.addEventListener('touchend', onUnlockGesture, true);
  document.addEventListener('click', onUnlockGesture, true);

  function resumeIfNeeded() {
    if (!audio) return;
    audio.resume();
    setTimeout(paintHear, 80);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') resumeIfNeeded();
  });
  window.addEventListener('focus', resumeIfNeeded);
  window.addEventListener('pageshow', resumeIfNeeded);

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!sleepEl.hidden) { sleepEl.hidden = true; return; } goBack(); }
    if (e.key === 'ArrowRight') setPair(pair + 1);
    if (e.key === 'ArrowLeft') setPair(pair - 1);
    if (e.key === 'ArrowUp' && e.shiftKey) setCharacter(character + .06);
    else if (e.key === 'ArrowDown' && e.shiftKey) setCharacter(character - .06);
    else if (e.key === 'ArrowUp') setIntensity(intensity + .06);
    else if (e.key === 'ArrowDown') setIntensity(intensity - .06);
    if (e.key === 'r' || e.key === 'R') setRed(!red);
    if (e.key === ' ' || e.key === 'Enter') { startAudio(); e.preventDefault(); }
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 80); });

  (function init() {
    rollMood();
    if (Q.pair) {
      var i = PAIRS.findIndex(function (p) { return p.id === Q.pair; });
      if (i >= 0) pair = i;
    }
    if (Q.intensity != null) intensity = clamp(parseFloat(Q.intensity), 0, 1);
    if (Q.character != null) character = clamp(parseFloat(Q.character), 0, 1);
    if (Q.dim != null) light = clamp(parseFloat(Q.dim), .08, 1);
    if (Q.red === '1' || Q.red === 'true') red = true;
    if (Q.timer) setTimer(parseInt(Q.timer, 10) || 0);
    quiet = Q.quiet === '1';
    paintDots(); applyRed(); showInten(); intenEl.classList.remove('show');
    resize(); seed();
    requestAnimationFrame(frame);
    if (quiet) { wakeOn = false; wakeEl.classList.remove('on'); nameEl.classList.remove('show'); }
    else setTimeout(function () { if (wakeOn && !hearing) { wakeEl.textContent = 'tap to hear'; wakeEl.classList.add('on'); } }, 700);
    if (!quiet) showName();
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
    character: function () { return character; },
    setCharacter: function (v) { setCharacter(v, true); },
    red: function () { return red; },
    setRed: setRed,
    dim: function () { return light; },
    setDim: function (v) { setLight(v); },
    timer: function () { return { mins: mins, left: endAt ? endAt - Date.now() : 0, fade: fade }; },
    setTimer: setTimer,
    startAudio: startAudio,
    state: function () {
      return {
        pair: PAIRS[pair].id, intensity: intensity, character: character, red: red, dim: light, fade: fade, mins: mins,
        audio: !!audio, hearing: !!(audio && audio.hearing && audio.hearing()),
        ac: audio && audio.ac ? audio.ac.state : 'none',
        elPaused: bedEl ? bedEl.paused : null,
        srcObject: !!(bedEl && bedEl.srcObject),
        usingEl: !!(audio && audio.usingEl && audio.usingEl()),
        fallback: !!(audio && audio.fallback && audio.fallback())
      };
    }
  };
})();
