/* oz · a room of sound and environment. Generated on the device. */
(function () {
  'use strict';

  var PAIRS = [
    { id: 'snow',  name: 'snow',  beds: { white: 1, pink: .15, brown: 0 } },
    { id: 'rain',  name: 'rain',  beds: { white: .12, pink: 1, brown: .08 } },
    { id: 'sea',   name: 'sea',   beds: { white: 0, pink: .1, brown: 1 } },
    { id: 'wind',  name: 'wind',  beds: { white: .08, pink: .35, brown: 1 } },
    { id: 'storm', name: 'storm', beds: { white: .1, pink: .85, brown: .7 } }
  ];

  var canvas = document.getElementById('env');
  var cx = canvas.getContext('2d');
  var html = document.documentElement;
  var disc = document.getElementById('disc');
  var veil = document.getElementById('redveil');
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
  var nameT = 0, dotsT = 0, intenT = 0, wakeOn = true;
  var fade = 1, fading = false;
  var endAt = 0, mins = 0, leftTick = 0;
  var DROPS = [], FLAKES = [], RINGS = [], MOTES = [], nextRing = 0;
  var hazeTex = null, hazeTint = null, hazeKey = '';
  var audio = null;
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

  /* ---------- particles (counts and motion follow the oz sky) ---------- */
  function seed() {
    DROPS = []; for (var i = 0; i < 420; i++) DROPS.push([Math.random(), Math.random(), .6 + Math.random() * .8]);
    FLAKES = []; for (i = 0; i < 520; i++) FLAKES.push([Math.random(), Math.random(), .35 + Math.random() * 1.5, Math.random() * 6.28]);
    MOTES = []; for (i = 0; i < 80; i++) MOTES.push({ x: Math.random(), y: Math.random() * .85, r: .5 + Math.random() * 1.4, s: .3 + Math.random() * .7, p: Math.random() * 6.28 });
    RINGS = [];
  }

  function palettes() {
    return {
      snow:  { top: [5, 9, 16],    mid: [10, 18, 28],   hor: [28, 38, 52],   water: [8, 12, 18] },
      rain:  { top: [4, 7, 11],    mid: [7, 13, 22],    hor: [18, 28, 46],   water: [6, 10, 16] },
      sea:   { top: [8, 12, 16],   mid: [16, 22, 28],   hor: [28, 36, 42],   water: [10, 16, 22] },
      wind:  { top: [5, 9, 15],    mid: [10, 18, 34],   hor: [26, 37, 64],   water: [8, 12, 20] },
      storm: { top: [3, 5, 10],    mid: [8, 10, 18],    hor: [16, 20, 28],   water: [4, 6, 10] }
    };
  }

  function drawWash(p, I) {
    var top = p.top, mid = mix(p.mid, p.hor, I * .15), hor = mix(p.hor, [210, 214, 222], I * (pair === 0 ? .22 : pair === 2 ? .18 : .06));
    if (pair === 0) { top = mix(top, [48, 58, 72], I * .62); mid = mix(mid, [110, 122, 138], I * .5); hor = mix(hor, [200, 208, 216], I * .28); }
    if (pair === 2) { top = mix(top, [90, 96, 104], I * .55); mid = mix(mid, [140, 146, 152], I * .5); hor = mix(hor, [180, 186, 190], I * .45); }
    if (pair === 1 || pair === 4) { var dk = 1 - I * .22; top = [top[0] * dk, top[1] * dk, top[2] * dk]; mid = [mid[0] * dk, mid[1] * dk, mid[2] * dk]; }
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(top));
    g.addColorStop(hy / H * .85, rgb(mid));
    g.addColorStop(hy / H, rgb(hor));
    g.addColorStop(1, rgb(p.water));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  }

  function drawClouds(dt, I, wind, still) {
    var id = PAIRS[pair].id;
    var amt = id === 'wind' ? .35 + I * .7 : id === 'storm' ? .55 + I * .4 : id === 'rain' ? .25 + I * .4 : id === 'snow' ? .15 + I * .35 : .08 + I * .15;
    if (amt < .02) return;
    var S = 900 * Math.max(1, M / 390), speed = 6 + wind * 30 + (id === 'wind' ? I * 40 : 0);
    var ox = ((tAcc * speed) % S + S) % S;
    var glowC = id === 'storm' ? [120, 110, 120] : [150, 140, 150];
    if (id === 'snow') glowC = mix(glowC, [210, 216, 224], .45);
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

  function drawFog(dt, I, wind) {
    var amt = pair === 2 ? .35 + I * .7 : pair === 0 ? I * .25 : pair === 3 ? .1 + I * .15 : 0;
    if (amt < .02) return;
    var T = 512 * Math.max(1, M / 390);
    var col = mix([150, 152, 158], [220, 224, 230], pair === 2 ? I * .5 : 0);
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

  function drawRain(dt, I, wind, still) {
    var ra = (pair === 1 || pair === 4) ? (.25 + I * .95) : 0;
    if (ra < .02) return;
    var n = Math.round(DROPS.length * Math.min(1, ra)), lean = .12 + wind * .25, vy = H * (1.2 + I * .8);
    cx.lineWidth = 1; cx.strokeStyle = rgba([200, 214, 230], .22 * Math.min(1, ra));
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var d = DROPS[i];
      if (!still) d[1] += dt * vy / H * d[2];
      if (d[1] > 1) { d[1] -= 1; d[0] = Math.random(); }
      var X = d[0] * (W + 60) - 30 + d[1] * H * lean, Y = d[1] * hy * 1.25, L2 = 10 * d[2] * (M / 390 + .3);
      if (Y > hy) continue;
      cx.moveTo(X, Y); cx.lineTo(X - L2 * lean, Y - L2);
    }
    cx.stroke();
    if (!still && now() > nextRing && Math.random() < dt * (4 + I * 8) * Math.min(1, ra)) {
      RINGS.push({ x: Math.random() * W, y: hy + 8 + Math.random() * (H - hy - 16), t: now(), s: .35 + I * .4 });
      nextRing = now() + (180 + Math.random() * 400) / (1 + I);
    }
  }

  function drawSnow(dt, I, wind, still) {
    var sa = pair === 0 ? (.2 + I * .95) : 0;
    if (sa < .02) return;
    var n = Math.round(FLAKES.length * Math.min(1, sa));
    cx.fillStyle = rgba([240, 244, 250], .7 * Math.min(1, sa));
    for (var i = 0; i < n; i++) {
      var f = FLAKES[i];
      if (!still) { f[1] += dt * (.05 + I * .12) * f[2]; f[0] += dt * (.01 + I * .04) * wind; }
      if (f[1] > 1) f[1] -= 1; if (f[0] > 1) f[0] -= 1; if (f[0] < 0) f[0] += 1;
      var X2 = f[0] * W + Math.sin(tAcc * .8 + f[3]) * (10 + I * 14), Y2 = f[1] * H, r2 = f[2] * (1.05 + I * .7) * (M / 390 + .2);
      cx.beginPath(); cx.arc(X2, Y2, r2, 0, 6.283); cx.fill();
    }
  }

  function drawWater(dt, I) {
    var id = PAIRS[pair].id;
    var swell = (id === 'sea' ? .4 + I * .7 : id === 'rain' || id === 'storm' ? .18 + I * .28 : id === 'wind' ? .2 + I * .35 : .03);
    var lineA = id === 'snow' ? .05 : id === 'sea' ? (.1 + swell * .06) * (1 - I * .55) : .08 + swell * .07;
    cx.fillStyle = rgba([4, 6, 10], .28 + (id === 'sea' ? I * .1 : 0));
    cx.fillRect(0, hy, W, H - hy);
    var t = tAcc, nLines = id === 'snow' ? 3 : 5;
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
    if (pair !== 3) return;
    var n = Math.round(MOTES.length * (.3 + I * .7));
    cx.strokeStyle = rgba([220, 226, 234], .16 + I * .22);
    cx.lineWidth = 1;
    cx.beginPath();
    for (var i = 0; i < n; i++) {
      var q = MOTES[i];
      if (!still) { q.x += dt * (.04 + wind * .18) * q.s * (1 + I * 1.4); q.y += dt * .006 * Math.sin(tAcc + q.p); }
      if (q.x > 1.08) q.x = -.08;
      var L = (10 + I * 28) * q.s * (M / 390 + .4);
      var X = q.x * W, Y = q.y * H;
      cx.moveTo(X, Y); cx.lineTo(X - L, Y + L * .08);
    }
    cx.stroke();
  }

  function drawStorm(dt, I, still) {
    if (pair !== 4) return;
    if (!still && now() > nextFlash) {
      flash = .7 + I * .5; nextFlash = now() + (5000 + Math.random() * 9000) / (1 + I * 1.4);
      if (audio && audio.thunder) audio.thunder();
    }
    if (flash > .01) {
      cx.fillStyle = rgba([220, 228, 255], .2 * flash);
      cx.fillRect(0, 0, W, hy);
      flash *= Math.exp(-dt * 7);
    }
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight; M = Math.min(W, 430);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hy = H * .62;
  }

  function frame(ts) {
    if (!lastT) lastT = ts;
    var dt = Math.min(.05, (ts - lastT) / 1000); lastT = ts;
    tAcc += dt;
    var I = intensity * fade;
    var wind = (pair === 3 ? .45 : pair === 4 ? .4 : pair === 1 ? .22 : pair === 0 ? .12 : .08) + I * (pair === 3 ? .8 : .45);
    windNow += (wind - windNow) * (1 - Math.exp(-dt * 2));
    var still = false;
    var pals = palettes();
    drawWash(pals[PAIRS[pair].id], I);
    drawClouds(dt, I, windNow, still);
    drawWater(dt, I);
    drawRain(dt, I, windNow, still);
    drawSnow(dt, I, windNow, still);
    drawFog(dt, I, windNow);
    drawWindMotes(dt, I, windNow, still);
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

  /* ---------- sound: white, pink, brown, made here ---------- */
  function makeAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ac = new AC();
    var master = ac.createGain(); master.gain.value = 0;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 12000; lp.Q.value = .7;
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 40; hp.Q.value = .5;
    var beds = {}, kinds = { white: 0, pink: 1, brown: 2 };

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
      return buf;
    }
    function startBed(name, kind) {
      var g = ac.createGain(); g.gain.value = 0; g.connect(hp);
      var loops = [6.1, 9.7].map(function (secs, i) {
        var src = ac.createBufferSource();
        src.buffer = make(kind, secs); src.loop = true;
        var pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
        if (pan) { pan.pan.value = i ? .18 : -.18; src.connect(pan); pan.connect(g); }
        else src.connect(g);
        src.start();
        return src;
      });
      beds[name] = { g: g, loops: loops };
    }

    hp.connect(lp); lp.connect(master); master.connect(ac.destination);
    startBed('white', 0); startBed('pink', 1); startBed('brown', 2);

    var gust = { t: 0, v: 0 };
    function set(pi, I, f) {
      var p = PAIRS[pi], gain = (.06 + I * .5) * (f == null ? 1 : f);
      var t = ac.currentTime;
      master.gain.setTargetAtTime(gain, t, .08);
      Object.keys(beds).forEach(function (k) {
        beds[k].g.gain.setTargetAtTime((p.beds[k] || 0), t, .12);
      });
      if (p.id === 'snow') { hp.frequency.setTargetAtTime(180 + I * 500, t, .1); lp.frequency.setTargetAtTime(8000 + I * 4000, t, .1); }
      else if (p.id === 'rain') { hp.frequency.setTargetAtTime(80, t, .1); lp.frequency.setTargetAtTime(6000 + I * 5000, t, .1); }
      else if (p.id === 'sea') { hp.frequency.setTargetAtTime(30, t, .1); lp.frequency.setTargetAtTime(280 + I * 700, t, .2); }
      else if (p.id === 'wind') { hp.frequency.setTargetAtTime(40, t, .1); }
      else { hp.frequency.setTargetAtTime(50, t, .1); lp.frequency.setTargetAtTime(4000 + I * 4000, t, .1); }
    }
    function tickGust() {
      if (!audio) return;
      var p = PAIRS[pair];
      if (p.id === 'wind' || p.id === 'sea' || p.id === 'storm') {
        gust.t += 0.05;
        var I = intensity * fade;
        var wob = p.id === 'sea' ? Math.sin(gust.t * .15) * (80 + I * 200) : (Math.sin(gust.t * .4) * .5 + Math.sin(gust.t * .17) * .5) * (400 + I * 1800);
        var base = p.id === 'sea' ? 280 + I * 700 : p.id === 'wind' ? 700 + I * 2200 : 1400;
        lp.frequency.setTargetAtTime(Math.max(180, base + wob), ac.currentTime, .2);
        if (p.id === 'sea') {
          var swell = 1 + Math.sin(gust.t * .12) * (.12 + I * .28);
          master.gain.setTargetAtTime((.06 + intensity * .5) * fade * swell, ac.currentTime, .4);
        }
      }
      setTimeout(tickGust, 80);
    }

    function thunder() {
      var n = Math.round(ac.sampleRate * (1.4 + Math.random() * 1.2)), d = new Float32Array(n), last = 0;
      for (var i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * .04) / 1.04; var env = Math.sin((i / n) * Math.PI); d[i] = last * env * env; }
      var buf = ac.createBuffer(1, n, ac.sampleRate); buf.getChannelData(0).set(d);
      var src = ac.createBufferSource(); src.buffer = buf;
      var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180 + intensity * 220;
      var g = ac.createGain(); g.gain.value = (.18 + intensity * .4) * fade;
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
    }

    set(pair, intensity, fade);
    tickGust();
    return {
      ac: ac, set: set, thunder: thunder,
      resume: function () { if (ac.state === 'suspended') return ac.resume(); return Promise.resolve(); }
    };
  }

  function startAudio() {
    if (!audio) audio = makeAudio();
    if (!audio) return;
    audio.resume();
    audio.set(pair, intensity, fade);
    if (wakeOn) { wakeOn = false; wakeEl.classList.remove('on'); }
  }

  /* ---------- chrome: pairs, intensity, red, dim, back, sleep ---------- */
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
  function setPair(i, quiet) {
    i = ((i % PAIRS.length) + PAIRS.length) % PAIRS.length;
    if (i === pair && !quiet) return;
    pair = i; flash = 0;
    paintDots(); showDots();
    if (!quiet) showName();
    if (audio) audio.set(pair, intensity, fade);
    if (!quiet) haptic(10);
  }
  function setIntensity(v, quiet) {
    intensity = clamp(v, 0, 1);
    if (!quiet) showInten();
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
    startAudio();
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
    startAudio();
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

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!sleepEl.hidden) { sleepEl.hidden = true; return; } goBack(); }
    if (e.key === 'ArrowRight') setPair(pair + 1);
    if (e.key === 'ArrowLeft') setPair(pair - 1);
    if (e.key === 'ArrowUp') setIntensity(intensity + .06);
    if (e.key === 'ArrowDown') setIntensity(intensity - .06);
    if (e.key === 'r' || e.key === 'R') setRed(!red);
    if (e.key === ' ') { startAudio(); e.preventDefault(); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && audio) audio.resume();
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
    paintDots(); applyRed(); showInten(); intenEl.classList.remove('show');
    resize(); seed();
    requestAnimationFrame(frame);
    var quiet = Q.quiet === '1';
    if (quiet) { wakeOn = false; wakeEl.classList.remove('on'); nameEl.classList.remove('show'); }
    else setTimeout(function () { if (wakeOn) wakeEl.classList.add('on'); }, 700);
    if (Q.audio === '1') {
      var unlock = function () { startAudio(); window.removeEventListener('pointerdown', unlock, true); };
      window.addEventListener('pointerdown', unlock, true);
    }
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
    state: function () { return { pair: PAIRS[pair].id, intensity: intensity, red: red, dim: light, fade: fade, mins: mins, audio: !!audio }; }
  };
})();
