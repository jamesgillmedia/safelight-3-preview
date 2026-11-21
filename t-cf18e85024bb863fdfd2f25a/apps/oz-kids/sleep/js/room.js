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
    { id: 'city',   name: 'city',   beds: { white: .2, pink: 1, brown: .25 } },
    { id: 'desert', name: 'desert', beds: { white: .2, pink: .4, brown: 1 } }
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

  var W = 0, H = 0, M = 390, dpr = 1, hy = 0;
  var pair = 0, intensity = .42, red = false, light = 1;
  var tAcc = 0, lastT = 0, windNow = 0, flash = 0, nextFlash = 0;
  var nameT = 0, dotsT = 0, intenT = 0, wakeOn = true, quiet = false;
  var fade = 1, fading = false;
  var endAt = 0, mins = 0, leftTick = 0;
  var DROPS = [], FLAKES = [], RINGS = [], MOTES = [], EMBERS = [], GLASS = [];
  var nextRing = 0, nextCrack = 0, fireFlick = 1;
  var hazeTex = null, hazeTint = null, hazeKey = '';
  var audio = null, hearing = false;
  var WTS = { snow: 0, rain: 0, sea: 0, wind: 0, storm: 0, fire: 0, city: 0, desert: 0 };
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
    RINGS = [];
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
      desert: { top: [20, 14, 22],  mid: [56, 36, 28],   hor: [140, 88, 50],  water: [36, 22, 16] }
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
    if (s < 1e-6) return washOf(pid(), pals[pid()], I);
    return {
      top: [acc.top[0] / s, acc.top[1] / s, acc.top[2] / s],
      mid: [acc.mid[0] / s, acc.mid[1] / s, acc.mid[2] / s],
      hor: [acc.hor[0] / s, acc.hor[1] / s, acc.hor[2] / s],
      water: [acc.water[0] / s, acc.water[1] / s, acc.water[2] / s]
    };
  }

  function hyFor(id) {
    if (id === 'fire') return H * .90;
    if (id === 'city') return H * .86;
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

  function stepDrops(dt, I, wind, still) {
    var vy = H * (1.2 + I * .8);
    for (var i = 0; i < DROPS.length; i++) {
      var d = DROPS[i];
      if (!still) d[1] += dt * vy / H * d[2];
      if (d[1] > 1) { d[1] -= 1; d[0] = Math.random(); }
    }
  }
  function drawRain(dt, I, wind, still) {
    var ra = (wt('rain') + wt('storm') + wt('city') * .85) * (.25 + I * .95);
    stepDrops(dt, I, wind, still);
    if (ra < .02) return;
    var n = Math.round(DROPS.length * Math.min(1, ra)), lean = .12 + wind * .25, Lbase = 10 * (M / 390 + .3);
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
      if (!still) { f[1] += dt * (.05 + I * .12) * f[2]; f[0] += dt * (.01 + I * .04) * wind; }
      if (f[1] > 1) f[1] -= 1; if (f[0] > 1) f[0] -= 1; if (f[0] < 0) f[0] += 1;
    }
    if (sa < .02) return;
    var n = Math.round(FLAKES.length * Math.min(1, sa));
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
      if (!still) { e.y -= dt * e.v * (0.7 + I); e.x += dt * .05 * Math.sin(tAcc * 1.4 + e.p); }
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

  function targetWind(I) {
    return (wt('wind') + wt('desert')) * (.45 + I * .8)
      + wt('storm') * (.4 + I * .45)
      + (wt('rain') + wt('city')) * (.22 + I * .45)
      + wt('snow') * (.12 + I * .45)
      + (wt('sea') + wt('fire')) * (.08 + I * .45);
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight; M = Math.min(W, 430);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hy = hyMix();
  }

  function frame(ts) {
    if (!lastT) lastT = ts;
    var dt = Math.min(.05, (ts - lastT) / 1000); lastT = ts;
    tAcc += dt;
    stepWeights(dt);
    var I = intensity * fade;
    hy += (hyMix() - hy) * (1 - Math.exp(-dt * 2.1));
    windNow += (targetWind(I) - windNow) * (1 - Math.exp(-dt * 2));
    var still = false;
    drawWash(mixedWash(I));
    drawClouds(I, windNow);
    drawDesert();
    drawWater(I);
    drawRain(dt, I, windNow, still);
    drawSnow(dt, I, windNow, still);
    drawFog(I, windNow);
    drawWindMotes(dt, I, windNow, still);
    drawCity(dt, I, windNow, still);
    drawFire(dt, I, still);
    drawStorm(dt, I, still);
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

    var gust = { t: 0 };
    function set(pi, I, f) {
      var p = PAIRS[pi], id = p.id;
      var gain = (.06 + I * .5) * (f == null ? 1 : f);
      var t = ac.currentTime;
      master.gain.setTargetAtTime(gain, t, .08);
      if (fallback && bedEl) bedEl.volume = clamp(gain / .5, 0, 1);
      Object.keys(beds).forEach(function (k) { beds[k].g.gain.setTargetAtTime((p.beds[k] || 0), t, .18); });
      dGain.gain.setTargetAtTime(id === 'city' ? .08 : 0, t, .2);
      delay.delayTime.setTargetAtTime(.16, t, .2);
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
    return {
      ac: ac, set: set, dest: dest,
      thunder: function () { burst('thunder', intensity); },
      crackle: function (I) { burst('crackle', I); },
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
    audio.set(pair, intensity, fade);
    setTimeout(paintHear, 60);
    setTimeout(paintHear, 400);
  }

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
  function setPair(i, q) {
    i = ((i % PAIRS.length) + PAIRS.length) % PAIRS.length;
    if (i === pair && !q) return;
    pair = i;
    /* no seed, no resize, no mood roll — particles keep running; wash crossfades */
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
  canvas.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    g = { kind: 'env', x: e.clientX, y: e.clientY, ix: intensity, t: now(), moved: false, back: e.clientX < 22 };
    holdT = setTimeout(function () {
      if (!g || g.moved) return;
      sleepEl.hidden = false; hideSleepSoon();
    }, 650);
  });
  canvas.addEventListener('pointermove', function (e) {
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
    if (!g || g.kind !== 'env') return;
    clearTimeout(holdT);
    var dx = e.clientX - g.x, dy = e.clientY - g.y, back = g.back, axis = g.axis, moved = g.moved;
    g = null;
    backhint.classList.remove('on');
    backhint.style.transform = 'translate(-8px, -50%)';
    if (back && dx > 56) { goBack(); return; }
    if (axis === 'x' && Math.abs(dx) > 40) setPair(pair + (dx < 0 ? 1 : -1));
    else if (!moved && !sleepEl.hidden) { /* keep the timer sheet */ }
  });
  canvas.addEventListener('pointercancel', function () {
    clearTimeout(holdT); g = null; backhint.classList.remove('on');
  });

  sleepEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    setTimer(+b.dataset.m); haptic(10);
  });

  function onUnlockGesture(e) {
    if (e && e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return;
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
    if (e.key === 'Escape') { if (!sleepEl.hidden) { sleepEl.hidden = true; return; } goBack(); }
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
      var i = PAIRS.findIndex(function (p) { return p.id === Q.pair; });
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
    requestAnimationFrame(frame);
    if (quiet) { wakeOn = false; wakeEl.classList.remove('on'); nameEl.classList.remove('show'); }
    else setTimeout(function () { if (wakeOn) wakeEl.classList.add('on'); }, 700);
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
    red: function () { return red; },
    setRed: setRed,
    dim: function () { return light; },
    setDim: function (v) { setLight(v); },
    timer: function () { return { mins: mins, left: endAt ? endAt - Date.now() : 0, fade: fade }; },
    setTimer: setTimer,
    startAudio: startAudio,
    state: function () {
      return {
        pair: PAIRS[pair].id, intensity: intensity, red: red, dim: light, fade: fade, mins: mins,
        audio: !!audio,
        ac: audio && audio.ac ? audio.ac.state : 'none',
        elPaused: bedEl ? bedEl.paused : null,
        srcObject: !!(bedEl && bedEl.srcObject),
        usingEl: !!(audio && audio.usingEl && audio.usingEl()),
        fallback: !!(audio && audio.fallback && audio.fallback()),
        hearing: !!(audio && audio.hearing && audio.hearing())
      };
    }
  };
})();
