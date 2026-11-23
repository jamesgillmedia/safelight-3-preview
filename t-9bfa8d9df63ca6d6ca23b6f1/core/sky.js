/* tools-02 · the living sky. A port of the site's m4 sky values (SITE-MAGIC.md §1–5, 9, 12):
   four parallax dust layers, the log-depth birth–life–fade cycle (twinkle), motion streaks
   on camera hop, glimmer on touch, hairline constellations, horizon glow, tree line,
   and the Golden Hour wash + sun mark. One canvas. */
(function (G) {
  'use strict';
  var GJ = G.GJ, smooth = GJ.smooth, clamp = GJ.clamp;

  // [index, count, parallax f, alpha, radius scale]   (sky.js buildField)
  var LAYERS = [[0, 150, .22, .42, .42], [1, 110, .48, .58, .72], [2, 78, .86, .74, .9], [3, 40, 1.25, .9, 1.05]];
  var DZ = { E: 2.4, K: .36, slide: .85, g: .16, cap: 1.45, dimR: .075, fin: .35, tau: .05, streak: .06 };
  var DRIFT = .11;   // log-depth walk per second (the slow fly-through that drives the cycle)

  var cv, cx, W = 0, H = 0, DPR = 1, M = 1, field = [], seed = 7;
  var HOP = 0, FDT = 1 / 60, tAcc = 0, glow = null, lastCam = null;
  var sprite, MSTAR = null;
  var sky = GJ.sky = {
    env: { size: 1, glow: 1, line: 1, rip: 1, swell: 0, bloom: 1, wind: null, depth: 0 },   // depth: the Moon dial's Focus ring racks the sky's layers (−1 near · 0 mid · 1 far)
   // the ✨ Environment dial's finer layers (js/envdial.js); 1 / 0 / null is the sky as it was
    cam: { x: GJ.S(0), y: GJ.S(0), z: GJ.S(1) },
    look: { x: GJ.S(0, GJ.W_LOOK), y: GJ.S(0, GJ.W_LOOK) },   // look-around, the tighter spring (W_LOOK 9.5)
    focus: GJ.S(1),          // constellation visibility (Master 1, inside a room 0)
    trees: GJ.S(1),          // tree line alpha
    golden: { a: GJ.S(0), alt: -30, az: 180, sun: GJ.S(-30), sunAz: GJ.S(180), path: null, pathA: GJ.S(0) },
    nodes: [], deco: [],
    mode: 'night', toneInk: '#FF4457', lamp: .8,
    density: 1, mood: 0,     // share of the dust drawn; moodK (sky.js moodK)
    atmos: 1,                // ATMOSPHERE: 1 = full living sky, 0 = fully still
    fog: 1, atmosFog: 1,     // fog amount (Tune) × the ATMOSPHERE ring
    reflect: true, ripples: true,   // water (Tune toggles)
    mark: null, wake: null,  // the Mark at the centre of L0, as stars (STROKES), and its wake
    keep: [],                // keep-clear points [{x,y}] (title, names) — DZ.dimR
    scrubRate: 0,            // Golden Hour scrub feeds the hop
    horizonY: function () { return H * ((sky.hub === 'star' || sky.column) && !sky.inRoom ? .82 : .61); }
  };

  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  function buildField() {
    field = []; seed = 7;
    LAYERS.forEach(function (L) {
      var pts = [];
      for (var i = 0; i < L[1]; i++) {
        pts.push({ u: rnd() - .5, v: rnd() - .5, ph: rnd(), b: .55 + rnd() * .45, r: .5 + rnd() * .7, a: 0, px: null, py: null });
      }
      field.push({ L: { i: L[0], n: L[1], f: L[2], a: L[3], rs: L[4] }, pts: pts });
    });
  }
  /* ---------- the site's constellation page (constellation/blend.js), copied: glow sprites in each chapter's tint,
     a deep far field (z .18–.88) that barely moves when you fly, and near motes (z 1.7–3.3) — soft, out of focus,
     seen only while you move or zoom. Depth projection: a layer at depth z scales by zoom^((z − 1) × .38), and the look
     slides it by (z − 1): at rest every layer lines up flat. ---------- */
  var GLOWS = {};
  function glowSprite(rgb) {
    var key = rgb.map(function (v) { return v | 0; }).join(','); if (GLOWS[key]) return GLOWS[key];
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var q = c.getContext('2d'), gr = q.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(' + key + ',.95)'); gr.addColorStop(.16, 'rgba(' + key + ',.42)'); gr.addColorStop(.42, 'rgba(' + key + ',.10)'); gr.addColorStop(1, 'rgba(' + key + ',0)');
    q.fillStyle = gr; q.fillRect(0, 0, 128, 128); return GLOWS[key] = c;
  }
  function glowFor(rgb) { return glowSprite(remap(rgb)); }
  var FIELD = [], DUST = [], MOTION = 0;
  function buildSiteField() {
    var sd = 7, r = function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    FIELD = []; DUST = [];
    for (var i = 0; i < 1100; i++) FIELD.push({ u: r() * 2.6 - 1.3, v: r() * 2.6 - 1.3, z: .18 + Math.pow(r(), 1.6) * .7, b: r() < .06 ? .9 + r() * .5 : .25 + r() * .5, ph: r() * 6.28, tw: r() < .4, w: r() < .16 });   // a few warm stars among the cool (the site's field)
    for (i = 0; i < 46; i++) DUST.push({ u: r() * 1.6 - .8, v: r() * 1.6 - .8, z: 1.7 + r() * 1.6, rad: 8 + r() * 26, a: .04 + r() * .07 });
  }
  // world point (px at zoom 1, from the centre) at depth z → screen
  function dproj(wx, wy, z, o) {
    var c = sky.cam, zc = c.z.x, k = Math.pow(zc, (z - 1) * .38), s = zc * k, lk = 140 * M / 390;
    o[0] = W / 2 + (wx - c.x.x) * s - sky.look.x.x * lk * zc * z; o[1] = H * .44 + (wy - c.y.x) * s - sky.look.y.x * lk * zc * z; o[2] = s; return o;
  }
  var O = [0, 0, 0];
  function drawSiteField(dayDim) {
    var zc = sky.cam.z.x, n = Math.round(FIELD.length * sky.density), hy = sky.horizonY(), red = sky.mode !== 'night';
    var wk = sky.wake ? GJ.ease(clamp((GJ.now() - sky.wake - 600) / 1200, 0, 1)) : 1, still = GJ.reduced() || sky.atmos < .02;
    var cool = rgba([223, 232, 255], 1), warm = rgba([255, 236, 205], 1), last = '';
    for (var i = 0; i < n; i++) {
      var f = FIELD[i]; dproj(f.u * W, f.v * H, f.z, O);
      // the field wraps, so flying never runs out of stars
      var x = ((O[0] % (W + 8)) + (W + 8)) % (W + 8) - 4, y = O[1];
      if (y < -4 || y > H * .86) continue;
      var tws = still || !f.tw ? 1 : .75 + .25 * Math.sin(tAcc * (1.2 + f.ph) + f.ph * 9);
      var rad = Math.max(.45, f.b * f.z * 1.25 * Math.min(2.2, Math.pow(zc, .18))) * (M / 390 * .8 + .2);
      var a = clamp(f.b * f.z * 1.1 * tws, 0, 1) * wk * dayDim * (1 + sky.mood * .5) * (red ? .8 : 1);
      for (var k = 0; k < sky.keep.length; k++) { var q = sky.keep[k], d = Math.hypot(x - q.x, y - q.y), R = DZ.dimR * M * (q.s || 1); if (d < R) a *= smooth(0, R, d) * .7 + .3; }
      if (y > hy) a *= 1 - smooth(hy, H * .86, y) * .7;
      if (a < .01) continue;
      var fs2 = f.w ? warm : cool; if (fs2 !== last) { cx.fillStyle = fs2; last = fs2; }
      cx.globalAlpha = Math.min(1, a); cx.fillRect(x - rad / 2, y - rad / 2, rad, rad);
    }
    cx.globalAlpha = 1;
  }
  function drawDust() {
    var ma = MOTION * sky.atmos; if (ma < .01) return;
    var zc = sky.cam.z.x, gw = glowFor([205, 225, 255]);
    DUST.forEach(function (d) {
      dproj(d.u * W, d.v * H, d.z, O); var rad = d.rad * Math.pow(zc, .5) * (M / 390);
      if (O[0] < -rad || O[0] > W + rad || O[1] < -rad || O[1] > H + rad) return;
      cx.globalAlpha = d.a * ma; cx.drawImage(gw, O[0] - rad, O[1] - rad, rad * 2, rad * 2);
    });
    cx.globalAlpha = 1;
  }
  // a star as the site draws one: the tinted glow, then a white core
  function sdot(x, y, rad, a, gw, gs) {
    if (a < .01) return;
    cx.globalAlpha = a * .85; cx.drawImage(gw, x - gs / 2, y - gs / 2, gs, gs);
    cx.globalAlpha = 1; cx.fillStyle = rgba([244, 248, 255], a); cx.beginPath(); cx.arc(x, y, rad, 0, 6.283); cx.fill();
  }
  sky.dproj = function (wx, wy, z) { return dproj(wx, wy, z, [0, 0, 0]); };
  function softDot() {   // 32 px radial, rgba(228,236,248) → transparent
    var c = document.createElement('canvas'); c.width = c.height = 32;
    var g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(228,236,248,1)'); gr.addColorStop(.35, 'rgba(228,236,248,.35)'); gr.addColorStop(1, 'rgba(228,236,248,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c;
  }

  /* ---------- atmosphere: fog. A soft, horizontally tileable mist texture drawn as three banks at three depths
     (horizon haze, a bank over the tree line, ground mist). Lit by the environment light (the real sun),
     thicker around dawn, thinned by the ATMOSPHERE ring down to clear. Never over a photograph (the photo sits above the sky). */
  var fogTex = null, fogTint = null, fogKey = '';
  function makeFog() {
    var c = document.createElement('canvas'); c.width = 768; c.height = 160;
    var g = c.getContext('2d'), sd = 91;
    function r() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
    for (var i = 0; i < 90; i++) {
      var x = r() * 768, y = 40 + r() * 80, rx = 40 + r() * 120, a = .03 + r() * .07;
      [x - 768, x, x + 768].forEach(function (xx) {
        var gr = g.createRadialGradient(xx, y, 0, xx, y, rx);
        gr.addColorStop(0, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.save(); g.translate(xx, y); g.scale(1, .38); g.translate(-xx, -y);
        g.fillStyle = gr; g.beginPath(); g.arc(xx, y, rx, 0, 6.283); g.fill(); g.restore();
      });
    }
    return c;
  }
  function tintFog(rgb) {
    var key = rgb.map(function (v) { return v | 0; }).join(',');
    if (key === fogKey && fogTint) return fogTint;
    fogKey = key; fogTint = fogTint || document.createElement('canvas');
    fogTint.width = fogTex.width; fogTint.height = fogTex.height;
    var g = fogTint.getContext('2d'); g.clearRect(0, 0, fogTint.width, fogTint.height);
    g.drawImage(fogTex, 0, 0); g.globalCompositeOperation = 'source-in';
    g.fillStyle = 'rgb(' + key + ')'; g.fillRect(0, 0, fogTint.width, fogTint.height); g.globalCompositeOperation = 'source-over';
    return fogTint;
  }
  var FOG = [   // [centre y share, height share, drift px/s, parallax, alpha]
    [.60, .13, 3, .25, .55],
    [.79, .16, 7, .7, .8],
    [.90, .12, 12, 1.15, .4]
  ];
  function fogLight() {
    var alt = sky.golden.sun.x, w = washAt(alt), ga = sky.golden.a.x;
    var night = [118, 134, 162], day = [206, 210, 216];
    var base = alt < -6 ? night : alt > 8 ? day : mix(night, mix(w[2], day, .18), smooth(-6, 8, alt));
    return mix(night, base, ga);
  }
  sky.envLight = function () { return fogLight(); };

  /* ---------- atmosphere II (Gill's example, 16 Nov): a slow water-and-cloud haze over the whole sky,
     soft out-of-focus bokeh drifting near the lens, and a touch that blooms with ripples ---------- */
  var hazeTex = null;
  function makeHaze() {   // tileable multi-octave value noise, 256², drawn soft and wide
    var N = 256, c = document.createElement('canvas'); c.width = c.height = N;
    var g = c.getContext('2d'), img = g.createImageData(N, N), sd = 7;
    function r() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
    var oct = [[8, .5], [16, .28], [32, .14], [64, .08]].map(function (o) { var n = o[0], grid = []; for (var i = 0; i < n * n; i++) grid.push(r()); return { n: n, a: o[1], g: grid }; });
    function sm(t) { return t * t * (3 - 2 * t); }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var v = 0;
      oct.forEach(function (o) {
        var fx = x / N * o.n, fy = y / N * o.n, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
        var a = o.g[(y0 % o.n) * o.n + x0 % o.n], b = o.g[(y0 % o.n) * o.n + (x0 + 1) % o.n], c2 = o.g[((y0 + 1) % o.n) * o.n + x0 % o.n], d = o.g[((y0 + 1) % o.n) * o.n + (x0 + 1) % o.n];
        v += o.a * ((a + (b - a) * tx) + ((c2 + (d - c2) * tx) - (a + (b - a) * tx)) * ty);
      });
      var k = Math.max(0, Math.min(1, (v - .32) * 1.9)), i4 = (y * N + x) * 4;
      img.data[i4] = img.data[i4 + 1] = img.data[i4 + 2] = 255; img.data[i4 + 3] = Math.round(k * k * 255);
    }
    g.putImageData(img, 0, 0); return c;
  }
  function drawHaze() {
    var amt = Math.max(sky.fog, sky.wxFog || 0) * sky.atmosFog; if (amt < .01) return;
    if (!hazeTex) hazeTex = makeHaze();
    var lk = 140 * M / 390, T = 512 * Math.max(1, M / 390), col = remap(mix(fogLight(), [150, 152, 158], .45));
    // two sheets drifting against each other: the slow shimmer of dark water and cloud
    [[.055, 6, .5, 1], [.04, -4, .8, 1.6]].forEach(function (L, j) {
      var S = T * L[3];
      var ox = ((tAcc * L[1] + sky.look.x.x * lk * L[2] + sky.cam.x.x * .2) % S + S) % S, oy = ((tAcc * L[1] * .35 * (j ? -1 : 1) + sky.look.y.x * lk * L[2]) % S + S) % S;
      cx.save(); cx.globalAlpha = Math.min(1, amt * L[0] * 1.6);
      cx.globalCompositeOperation = 'screen';
      var t2 = tintFog2(col);
      for (var x = -ox; x < W; x += S) for (var y = -oy; y < H; y += S) cx.drawImage(t2, Math.floor(x), Math.floor(y), Math.ceil(S) + 1, Math.ceil(S) + 1);
      cx.restore();
    });
  }
  /* ---------- live weather (Gill, 16 Nov): the sky shows what the sky is doing — clouds that carry the city's glow,
     rain that rings the water, snow, fog, wind in the cloud, the odd flash of a storm. Driven by the good-weather
     reading (live forecast, or the snapshot in this preview); Tune → Live weather turns it off. ---------- */
  sky.wx = { kind: 'none', amt: 0, wind: 0 };
  var WXA = { cloud: GJ.S(0, 1.2), rain: GJ.S(0, 1.2), snow: GJ.S(0, 1.2), haze: GJ.S(0, 1.2), veil: GJ.S(0, 1.2), bank: GJ.S(0, 1.6), lit: GJ.S(0, 1.6) }, DROPS = null, FLAKES = null, flash = 0, nextFlash = 0;
  var VEIL = { 'rain': 1, 'storm': 1, 'drizzle': .75, 'snow': .9, 'fog': .7, 'overcast': .9, 'night, cloudy': .5, 'mist on the water': .3, 'haze': .3, 'wind': .2 };
  sky.setWeather = function (name, wind, veil) {
    var k = { 'rain': ['rain', 1], 'drizzle': ['rain', .4], 'storm': ['storm', 1.2], 'snow': ['snow', 1], 'fog': ['fog', 1], 'mist on the water': ['fog', .7],
      'overcast': ['cloud', .95], 'night, cloudy': ['cloud', .7], 'wind': ['cloud', .5], 'haze': ['haze', .8] }[name] || ['none', 0];
    sky.wx = { kind: k[0], amt: k[1], wind: wind || (name === 'wind' ? 40 : 8), name: name, veil: veil == null ? VEIL[name] || 0 : veil };
  };
  /* what the weather does to the light (Gill, 17 Nov: "elements should change to match"). Under a roof of cloud the sun is
     a soft pale patch, the stars go, the moon is a smudge and the colour drains out of the sky; rain darkens it too.
     At night the roof carries the city's glow, so it lifts a little instead. One number: 0 open … 1 closed. */
  /* the sunset reading, drawn (Gill, 17 Nov: "clouds on the horizon and how that affects sunset"): `bank` is low cloud out
     on the horizon — a dark band the sun sets into before it reaches the hairline, its top `elev` degrees up, with a thin
     lit rim where the sun is behind it; `lit` is higher cloud over a clear horizon, which takes the colour just after
     sunset. Both arrive already weighted by how near the shown time is to sunset (weather.js sunsetOf → near). */
  sky.sset = { bank: 0, elev: 2, lit: 0 };
  sky.setSunset = function (r) { var k = r ? (r.near == null ? 1 : r.near) : 0; sky.sset = { bank: r ? (r.bank || 0) * k : 0, elev: r && r.elev ? r.elev : sky.sset.elev, lit: r ? (r.lit || 0) * k : 0 }; };
  var bankE = 2;
  function wxBank() { return clamp(WXA.bank.x, 0, 1); }
  function wxLit() { return clamp(WXA.lit.x, 0, 1); }
  function afterglow(alt) { return smooth(-7, -3.5, alt) * (1 - smooth(1.5, 6, alt)); }   // the minutes around sunset when cloud is lit from below
  function altY(alt) { var hy = sky.horizonY(); return hy - (hy - H * .24) * Math.sin(clamp(alt, -10, 70) * Math.PI / 180) / Math.sin(65 * Math.PI / 180); }
  /* the room's own light (Beyond, 17 Nov): a tool may lean the sky's wash warm or cool, grey it, or take it darker or
     lighter — with the sky's own colours (WASH's sunset row and day rows), so nothing new is mixed in. It is the
     environment that changes; a photograph never does. sky.setRoom({ warm −1…1, grey 0…1, light −1…1 }) · null = none. */
  var RM = { warm: GJ.S(0, 4), grey: GJ.S(0, 4), light: GJ.S(0, 4) };   // about a second: it keeps pace with the frames' own crossfade
  sky.setRoom = function (o) { GJ.aim(RM.warm, o ? o.warm || 0 : 0); GJ.aim(RM.grey, o ? o.grey || 0 : 0); GJ.aim(RM.light, o ? o.light || 0 : 0); };
  function wxOv() { return clamp(WXA.veil.x, 0, 1); }
  function wxWet() { return clamp(WXA.rain.x, 0, 1); }
  function lum(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  var DAYL = [[88, 116, 146], [132, 152, 170], [168, 178, 184]];
  function washNow(alt) {
    var w = washAt(alt), ov = Math.max(wxOv(), clamp(RM.grey.x, 0, 1) * .9), pink = wxLit() * afterglow(alt), rw = clamp(RM.warm.x, -1, 1), rl = clamp(RM.light.x, -1, 1);
    if (Math.abs(rw) > .004) { var T = washAt(rw > 0 ? 1 : 14), kk = Math.abs(rw) * .5; w = w.map(function (c, i) { return mix(c, T[i], kk * (i === 0 ? .6 : 1)); }); }   // the room reads warm (the sunset row) or cool (the day row)
    if (rl > .004) { var Dy = washAt(60); w = w.map(function (c, i) { return mix(c, Dy[i], rl * .5); }); }                                                              // lighter: toward the day
    else if (rl < -.004) { var dk = 1 + .6 * rl; w = w.map(function (c) { return [c[0] * dk, c[1] * dk, c[2] * dk]; }); }                                               // darker
    if (pink > .004) w = [mix(w[0], [70, 52, 84], pink * .18), mix(w[1], [178, 98, 106], pink * .24), w[2]];
    if (sky.day) w = w.map(function (c, i) { return mix(c, DAYL[i], .5); });   // day mode: lighter, still dimmer than most screens (no white)   // high cloud lit from below: the sky above the horizon warms
    if (ov < .004) return w;
    var wet = wxWet(), day = smooth(-8, 6, alt), g = (lum(w[0]) + 2 * lum(w[1]) + lum(w[2])) / 4;
    var flat = [g * .95, g, g * 1.06], dark = 1 - day * (.06 * ov + .2 * wet), glow = (1 - day) * ov;
    return w.map(function (c, i) {
      var L = lum(c), o = mix(c, [L * .95, L, L * 1.06], ov * .82);   // the colour drains out of it
      o = mix(o, flat, ov * (i === 1 ? .3 : .5));                     // top and horizon come together: a roof has little gradient
      var up = glow * (i === 2 ? 1.5 : i === 1 ? 1 : .6);             // night: the clouds carry the city's glow
      return [o[0] * dark + 11 * up, o[1] * dark + 8 * up, o[2] * dark + 9 * up];
    });
  }
  function drawWeather(dt) {
    var w = sky.wx, on = sky.wxLive !== false, hy = sky.horizonY(), red = sky.mode !== 'night';
    var tc = on && (w.kind === 'cloud' || w.kind === 'rain' || w.kind === 'storm' || w.kind === 'snow') ? Math.min(1, w.amt + .25) : 0;
    GJ.aim(WXA.cloud, tc); GJ.aim(WXA.rain, on && (w.kind === 'rain' || w.kind === 'storm') ? Math.min(1.2, w.amt) : 0);
    GJ.aim(WXA.snow, on && w.kind === 'snow' ? w.amt : 0); GJ.aim(WXA.haze, on && (w.kind === 'haze' || w.kind === 'fog') ? w.amt : 0);
    GJ.aim(WXA.veil, on ? w.veil || 0 : 0); GJ.aim(WXA.bank, on ? sky.sset.bank : 0); GJ.aim(WXA.lit, on ? sky.sset.lit : 0);
    bankE += (sky.sset.elev - bankE) * (1 - Math.exp(-dt * 2));
    for (var k in WXA) GJ.sstep(WXA[k], dt);
    var wind = sky.env.wind != null ? sky.env.wind * 1.2 : (w.wind || 8) / 40, still = GJ.reduced() || sky.atmos < .02;
    // clouds: the noise sheet, large and slow, lit from below by the city (night) or the sun (day)
    var la = wxLit(), glowK = la * afterglow(sky.golden.sun.x), ca = Math.max(WXA.cloud.x, la * .7);
    if (ca > .01) {
      if (!hazeTex) hazeTex = makeHaze();
      var lk = 140 * M / 390, S = 900 * Math.max(1, M / 390), glowC = sky.golden.a.x > .3 ? [255, 214, 170] : [150, 140, 150];
      var plain = wxOv() * .75 * smooth(-4, 8, sky.golden.sun.x);   // by day a closed sky is grey, not gold (at night it keeps the city's glow)
      if (plain > .004) glowC = mix(glowC, [210, 214, 222], plain);
      if (glowK > .004) glowC = mix(glowC, [255, 138, 118], glowK * .85);   // the colour: cloud lit from under, just after sunset
      var top = -S * .25 + sky.look.y.x * lk * .3;                   // the sheet ends on the horizon, not above it
      var ox = ((tAcc * (6 + wind * 30) + sky.look.x.x * lk * .4) % S + S) % S;
      cx.save(); cx.globalCompositeOperation = 'screen';
      var t2 = tintFog2(remap(glowC));
      cx.globalAlpha = Math.min(.62, Math.min(.5, ca * .32) + glowK * .2);
      var Si = Math.round(S);   // whole tiles, edge to edge: an overlap would screen twice and show as a hairline
      for (var x = Math.floor(-ox); x < W; x += Si) cx.drawImage(t2, x, top, Si, Math.max(1, hy - top));
      cx.restore();
      // the city's glow on the cloud base (night): a warm band above the horizon
      var gb = cx.createLinearGradient(0, hy - H * .3, 0, hy);
      gb.addColorStop(0, rgba([120, 96, 90], 0)); gb.addColorStop(1, rgba(mix(sky.golden.a.x > .3 ? [255, 190, 140] : [150, 112, 100], [196, 200, 208], plain), .08 * ca));
      cx.fillStyle = gb; cx.fillRect(0, hy - H * .3, W, H * .3);
    }
    // rain: fine streaks leaning with the wind; on the water, each drop rings
    var ra = WXA.rain.x;
    if (ra > .01) {
      if (!DROPS) { DROPS = []; for (var i = 0; i < 260; i++) DROPS.push([Math.random(), Math.random(), .6 + Math.random() * .8]); }
      var n = Math.round(DROPS.length * Math.min(1, ra)), lean = .12 + wind * .25, vy = H * 1.4;
      cx.lineWidth = 1; cx.strokeStyle = rgba([200, 214, 230], .22 * Math.min(1, ra));
      cx.beginPath();
      for (i = 0; i < n; i++) {
        var d = DROPS[i]; if (!still) d[1] += dt * vy / H * d[2]; if (d[1] > 1) { d[1] -= 1; d[0] = Math.random(); }
        var X = d[0] * (W + 60) - 30 + d[1] * H * lean, Y = d[1] * hy * 1.25, L2 = 10 * d[2] * (M / 390 + .3);
        if (Y > hy) continue;
        cx.moveTo(X, Y); cx.lineTo(X - L2 * lean, Y - L2);
      }
      cx.stroke();
      // the drops that reach the water ring it — a few a second, small
      if (sky.ripples && !still && Math.random() < dt * 5 * Math.min(1, ra)) sky.ripple(Math.random() * W, hy + 6 + Math.random() * (H * .84 - hy - 12), true);
      if (w.kind === 'storm' && !still) {   // the odd flash: the sky drums
        if (GJ.now() > nextFlash) { flash = 1; nextFlash = GJ.now() + 6000 + Math.random() * 9000; }
        if (flash > .01) { cx.fillStyle = rgba([220, 228, 255], .18 * flash); cx.fillRect(0, 0, W, hy); flash *= Math.exp(-dt * 7); }
      }
    }
    // snow: slow flakes with a sway
    var sa = WXA.snow.x;
    if (sa > .01) {
      if (!FLAKES) { FLAKES = []; for (i = 0; i < 180; i++) FLAKES.push([Math.random(), Math.random(), .5 + Math.random(), Math.random() * 6.28]); }
      cx.fillStyle = rgba([240, 244, 250], .7 * sa);
      FLAKES.forEach(function (f) {
        if (!still) { f[1] += dt * .05 * f[2]; f[0] += dt * .01 * wind; } if (f[1] > 1) f[1] -= 1; if (f[0] > 1) f[0] -= 1;
        var X2 = f[0] * W + Math.sin(tAcc * .8 + f[3]) * 10, Y2 = f[1] * H * .86, r2 = f[2] * 1.2 * (M / 390 + .2);
        cx.beginPath(); cx.arc(X2, Y2, r2, 0, 6.283); cx.fill();
      });
    }
    // haze / fog: lean on the fog banks the sky already has
    sky.wxFog = WXA.haze.x;
  }
  sky.wxLive = true;
  var hz2 = null, hzKey = '';
  function tintFog2(rgb) {
    var key = rgb.map(function (v) { return v | 0; }).join(',');
    if (key === hzKey && hz2) return hz2;
    hzKey = key; hz2 = hz2 || document.createElement('canvas'); hz2.width = hz2.height = 256;
    var g = hz2.getContext('2d'); g.clearRect(0, 0, 256, 256); g.drawImage(hazeTex, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(' + key + ')'; g.fillRect(0, 0, 256, 256); g.globalCompositeOperation = 'source-over';
    return hz2;
  }
  // bokeh: a few large, soft, out-of-focus lights close to the lens; they slide the most (f 1.6–2.4)
  var BOKEH = null;
  function drawBokeh() {
    if (sky.atmosFog < .02) return;
    if (!BOKEH) { var sd = 23, r = function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; BOKEH = []; for (var i = 0; i < 10; i++) BOKEH.push({ u: r(), v: r() * .85, r: 5 + r() * 13, f: 1.6 + r() * .8, a: .025 + r() * .045, ph: r() * 6.28 }); }
    var lk = 140 * M / 390;
    BOKEH.forEach(function (b) {
      var x = (((b.u * (W + 120) - sky.look.x.x * lk * b.f - sky.cam.x.x * b.f * .4 + tAcc * 2 * b.f) % (W + 120)) + (W + 120)) % (W + 120) - 60;
      var y = b.v * H - sky.look.y.x * lk * b.f - sky.cam.y.x * b.f * .4 + Math.sin(tAcc * .2 + b.ph) * 6;
      var rr = b.r * (M / 390) * (.9 + .25 * sky.cam.z.x), a = b.a * sky.atmosFog * (1 - sky.golden.a.x * smooth(-6, 10, sky.golden.sun.x) * .7);
      var g = cx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, rgba([228, 232, 238], a)); g.addColorStop(.7, rgba([228, 232, 238], a * .8)); g.addColorStop(1, rgba([228, 232, 238], 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, rr, 0, 6.283); cx.fill();
    });
  }
  // the touch bloom: the glimmer (1100 ms), plus the site's water ripple — 1.5 s ease-out, ×16, gone at 1600 ms —
  // as three rings, and a few motes of light that drift out and fade
  var blooms = [];
  sky.bloom = function (x, y) {
    if (sky.env.bloom <= .01) return;
    var motes = []; for (var i = 0; i < Math.round(7 * sky.env.bloom); i++) { var a = Math.random() * 6.283, sp = 10 + Math.random() * 26; motes.push([Math.cos(a) * sp, Math.sin(a) * sp, 1 + Math.random() * 2.2]); }
    blooms.push({ x: x, y: y, t: GJ.now(), motes: motes });
  };
  function easeOut(u) { return 1 - Math.pow(1 - u, 3); }
  function drawBlooms() {
    var now = GJ.now();
    blooms = blooms.filter(function (b) { return now - b.t < 1600; });
    blooms.forEach(function (b) {
      var age = (now - b.t) / 1500;
      [0, .12, .24].forEach(function (d, k) {
        var u = Math.max(0, Math.min(1, (age - d) / (1 - d))); if (u <= 0) return;
        var r = 6 + easeOut(u) * 6 * 16 * (M / 390) * (1 - k * .18);
        cx.lineWidth = 1; cx.strokeStyle = rgba([232, 228, 220], (1 - u) * .38 * (1 - k * .25));
        cx.beginPath(); cx.arc(b.x, b.y, r, 0, 6.283); cx.stroke();
      });
      var core = Math.max(0, 1 - age * 1.6), g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 46 * (M / 390));
      g.addColorStop(0, rgba([250, 246, 240], core * .55)); g.addColorStop(.25, rgba([232, 228, 220], core * .22)); g.addColorStop(1, rgba([232, 228, 220], 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(b.x, b.y, 46 * (M / 390), 0, 6.283); cx.fill();
      if (sky.atmosFog > .05) b.motes.forEach(function (m) {
        var e = easeOut(Math.min(1, age)), mx = b.x + m[0] * e * 2.2, my = b.y + m[1] * e * 2.2, a = (1 - Math.min(1, age)) * .7 * sky.atmosFog;
        cx.globalAlpha = a; cx.drawImage(sprite, mx - m[2] * 4, my - m[2] * 4, m[2] * 8, m[2] * 8); cx.globalAlpha = 1;
      });
    });
  }
  sky.ink = function (rgb, a) { return rgba(rgb, a); };
  function drawFog(layers) {
    var amt = Math.max(sky.fog, sky.wxFog || 0) * sky.atmosFog; if (amt < .01) return;
    if (!fogTex) fogTex = makeFog();
    var col = remap(fogLight()), tex = tintFog(col), lk = 140 * M / 390;
    var alt = sky.golden.sun.x, az = sky.golden.sunAz.x;
    var dawnK = (az < 180 && alt > -8 && alt < 10) ? 1.35 : 1;   // radiation fog thickest around dawn
    layers.forEach(function (i) {
      var L = FOG[i], h = H * L[1], y = H * L[0] - h / 2, tw = h * (tex.width / tex.height);
      var off = (tAcc * L[2] * 3 + sky.look.x.x * lk * L[3] + sky.cam.x.x * L[3] * .3) % tw;
      cx.globalAlpha = Math.min(1, amt * L[4] * dawnK);
      for (var x = -off - tw; x < W + tw; x += tw) cx.drawImage(tex, x, y, tw, h);
    });
    cx.globalAlpha = 1;
  }

  sky.init = function (canvas) {
    cv = canvas; cx = cv.getContext('2d'); sprite = softDot(); buildField(); buildSiteField(); sky.resize();
    G.addEventListener('resize', sky.resize);
  };
  sky.resize = function () {
    DPR = Math.min(2, G.devicePixelRatio || 1);
    W = G.innerWidth; H = G.innerHeight; M = Math.min(W, H);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
  };
  sky.size = function () { return { W: W, H: H, M: M }; };

  // glimmer on touch (sky.js noteTouch / drawGlow) — 1100 ms, (1-age)^2 * .12, r 128
  sky.note = function (x, y) { glow = { x: x, y: y, t: GJ.now() }; };

  /* ---------- colour ---------- */
  function hexRGB(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  // red mode: every ink becomes a crimson of the same luminance (no mint, no white)
  var washCap = 0;   // in red mode the environment wash stays a dark crimson: red mode is for the dark
  /* (Gill, 19 Nov, with two screenshots of his own red-mode skies: "The constellations should look like this in red mode")
     red mode no longer turns a constellation into one crimson: it keeps true colour, as the icons do — pale rose stars with
     their glow, warm grey lines, a red star for each titled song, gold for the one playing. The sky around them stays red. */
  var TRUE = { pale: [218, 176, 172], core: [242, 222, 216], red: [236, 100, 108], gold: [222, 190, 138], line: [150, 138, 120], name: [206, 132, 138] }, OVR = null;
  function remap(rgb) {
    if (OVR) return OVR;
    if (sky.mode === 'night') return rgb;
    var Lm = (.2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]) / 255, t = hexRGB(sky.toneInk), k = Math.min(washCap || 1.25, Lm * 1.6) * (.55 + .45 * sky.lamp);
    return [Math.min(255, t[0] * k), Math.min(255, t[1] * k * .9), Math.min(255, t[2] * k * .9)];
  }
  function rgba(rgb, a) { var c = remap(rgb); return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')'; }

  // Golden Hour wash, by sun altitude (deg): [top, mid, horizon]
  var WASH = [
    [-90, '#04070b', '#070d18', '#121c2e'],
    [-12, '#05090f', '#0a1222', '#1a2540'],
    [-6,  '#08101e', '#1a2440', '#4a3a58'],
    [-2,  '#0d1628', '#2b3352', '#9a5a4c'],
    [1,   '#142240', '#3a4466', '#d08848'],
    [6,   '#18263f', '#3a4c68', '#a8825e'],
    [14,  '#1b2b44', '#3f5672', '#71859a'],
    [90,  '#1e3150', '#46607e', '#7d90a4']
  ];
  function washAt(alt) {
    for (var i = 1; i < WASH.length; i++) if (alt <= WASH[i][0]) {
      var a = WASH[i - 1], b = WASH[i], t = (alt - a[0]) / (b[0] - a[0]);
      return [mix(hexRGB(a[1]), hexRGB(b[1]), t), mix(hexRGB(a[2]), hexRGB(b[2]), t), mix(hexRGB(a[3]), hexRGB(b[3]), t)];
    }
    return [hexRGB('#1e3150'), hexRGB('#46607e'), hexRGB('#7d90a4')];
  }

  /* ---------- frame ---------- */
  sky.frame = function (dt, t) {
    FDT = dt;
    var cam = sky.cam, red = sky.mode !== 'night';
    var before = { x: cam.x.x, y: cam.y.x, z: cam.z.x };
    var lb = sky.look.x.x;
    GJ.sstep(cam.x, dt); GJ.sstep(cam.y, dt); GJ.sstep(cam.z, dt); GJ.sstep(sky.look.x, dt); GJ.sstep(sky.look.y, dt);
    GJ.sstep(sky.focus, dt); GJ.sstep(sky.trees, dt); GJ.sstep(sky.golden.a, dt); GJ.sstep(RM.warm, dt); GJ.sstep(RM.grey, dt); GJ.sstep(RM.light, dt);
    GJ.sstep(sky.golden.sun, dt); GJ.sstep(sky.golden.sunAz, dt); GJ.sstep(sky.golden.pathA, dt);

    // HOP: eases toward camera motion, ~70 ms (depthStep)
    var pan = (Math.hypot(cam.x.x - before.x, cam.y.x - before.y) * cam.z.x + Math.abs(sky.look.x.x - lb) * 140 * M / 390) / Math.max(dt, 1e-3);
    var zoomRate = Math.abs(Math.log(cam.z.x / before.z)) / Math.max(dt, 1e-3);
    var target = clamp(pan / (.9 * M) + zoomRate * .5 + sky.scrubRate, 0, 1);
    if (GJ.reduced()) target = 0;
    target *= sky.atmos;
    HOP += (target - HOP) * (1 - Math.exp(-dt * 14));
    MOTION = Math.max(MOTION * Math.exp(-dt * 2.2), clamp(target * 2.4, 0, 1));
    sky.scrubRate *= Math.exp(-dt * 10);
    if (!GJ.reduced()) tAcc += dt * sky.atmos;

    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.clearRect(0, 0, W, H);

    var ga = sky.golden.a.x, alt = sky.golden.sun.x;
    if (sky.day) { ga = 1; alt = Math.max(alt, 38); }   // day mode (opt-in): the daylight wash, whatever the hour
    // Golden Hour wash, crossfaded over the CSS stage wash
    if (ga > .002) {
      var w = washNow(alt), hy = sky.horizonY(); washCap = .32;
      var gr = cx.createLinearGradient(0, 0, 0, H * .84);
      gr.addColorStop(0, rgba(w[0], ga)); gr.addColorStop(.55, rgba(w[1], ga)); gr.addColorStop(hy / (H * .84), rgba(w[2], ga));
      gr.addColorStop(Math.min(.99, hy / (H * .84) + .08), rgba(mix(w[2], [4, 7, 11], .55), ga));
      gr.addColorStop(1, rgba(mix(w[2], [4, 7, 11], .85), ga));
      cx.fillStyle = gr; cx.fillRect(0, 0, W, H); washCap = 0;
    }
    var dayDim = 1 - ga * smooth(-10, 4, alt) * .92;
    var ov = wxOv(), starK = 1 - .92 * Math.pow(ov, 1.15);   // under cloud the stars go
    sky.wxLook = { veil: ov, wet: wxWet(), stars: starK, bank: wxBank(), lit: wxLit(), elev: bankE, room: [RM.warm.x, RM.grey.x, RM.light.x] };

    drawHorizonGlow(ga, alt);
    drawMoon();
    drawHaze();
    drawSiteField(dayDim * starK);
    drawWeather(dt);
    drawDeco();
    drawMark();
    drawNodes();
    if (ga > .002) drawSun(ga, alt);
    drawBank(ga, alt);
    drawReflection();
    drawRipples();
    drawFog([0]);
    drawTrees();
    drawFog([1, 2]);
    drawDust();
    drawBlooms();
    drawGlow(red);
  };

  function depthZoom() { return sky.cam.z.x * Math.exp(DRIFT * tAcc); }

  function drawField(dt, dayDim) {
    var cam = sky.cam, z = cam.z.x, dz = depthZoom(), m = M;
    var Wt = Math.max(W, H) * .92, cxp = W / 2, cyp = H * .44, hy = sky.horizonY();
    var fin = 1 - Math.exp(-dt / DZ.fin);
    var wk = sky.wake ? GJ.ease(clamp((GJ.now() - sky.wake - 1100) / 900, 0, 1)) : 1;
    var ink = [228, 236, 248];
    field.forEach(function (layer) {
      var L = layer.L, near = L.i >= 2;
      var dpt = sky.env.depth || 0, LK = dpt === 0 ? 1 : near ? (dpt < 0 ? 1 + .5 * -dpt : 1 - .72 * dpt) : (dpt > 0 ? 1 + .6 * dpt : 1 - .72 * -dpt); cx.globalAlpha = Math.min(1, LK);
      var cyc = DZ.K * L.f * Math.log(dz);
      // layer offset (sky.js layerView): rest pan × parallax × slide, plus look
      var lk = 140 * M / 390;   // sky.js layerView: − look × f × 140
      var ox = -cam.x.x * Math.sqrt(z) * L.f * DZ.slide - sky.look.x.x * L.f * lk, oy = -cam.y.x * Math.sqrt(z) * L.f * DZ.slide - sky.look.y.x * L.f * lk;
      var thin = near ? clamp(1.25 - (z - 1) * .12, .7, 1) : 1;
      var nDraw = Math.round(L.n * sky.density);
      layer.pts.forEach(function (p, idx) {
        if (idx >= nDraw) { p.px = null; p.a = 0; return; }
        var c = p.ph + cyc; c = c - Math.floor(c);
        var env = smooth(.02, .32, c) * (1 - smooth(.6, .97, c));
        var zoomK = Math.pow(DZ.E, c - .5) * Math.pow(z, L.f * .5) * (.25 + .75 * wk);
        var x = cxp + p.u * Wt * zoomK + ox, y = cyp + p.v * Wt * zoomK + oy;
        // wrap horizontally into view
        x = ((x % (W + 40)) + (W + 40)) % (W + 40) - 20;
        if (y < -20 || y > H * .86) { p.px = null; return; }
        var fa = env;
        var al = wk * Math.min(1, 1.35 * L.a * (.35 + .65 * Math.min(1, fa + .4)) * env * p.b * dayDim * thin * (1 + sky.mood * .6));
        if (near && idx % 5 === 0 && z > 1.6) al *= .6;
        // keep-clear around names (dimR)
        for (var k = 0; k < sky.keep.length; k++) {
          var q = sky.keep[k], d = Math.hypot(x - q.x, y - q.y);
          if (d < DZ.dimR * m * (q.s || 1)) al *= smooth(0, DZ.dimR * m * (q.s || 1), d) * .7 + .3;
        }
        // below the horizon the dust thins toward the ground
        if (y > hy) al *= 1 - smooth(hy, H * .86, y) * .7;
        // alpha may only rise with time-constant .35 s; may fall at once
        p.a = al < p.a ? al : p.a + (al - p.a) * fin;
        if (Math.abs(al - p.a) < .002) p.a = al;
        var rr = Math.min(DZ.cap, L.rs * p.r * (.75 + DZ.g * Math.log(dz) * 0 + .5 * c)) * (m / 390 * .9 + .1) * sky.env.size;
        if (p.a > .01) {
          if (near && rr > .9) {
            cx.globalAlpha = Math.min(1, p.a * Math.min(1.4, sky.env.glow) * LK); var s = rr * 7.5 * (.55 + .45 * sky.env.glow) * (LK > 1 ? 1 + (LK - 1) * .6 : 1);
            if (sky.mode === 'night') cx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
            cx.globalAlpha = Math.min(1, LK);
            cx.fillStyle = rgba(ink, p.a); cx.beginPath(); cx.arc(x, y, rr * .55, 0, 6.283); cx.fill();
            if (sky.mode !== 'night') { cx.fillStyle = rgba(ink, p.a * .25); cx.beginPath(); cx.arc(x, y, rr * 1.6, 0, 6.283); cx.fill(); }
          } else {
            cx.fillStyle = rgba(ink, p.a); cx.beginPath(); cx.arc(x, y, Math.max(.5, rr * .88), 0, 6.283); cx.fill();
          }
          // motion streaks — only near layers, only when HOP > .04
          if (near && HOP > .04 && p.px != null) {
            var k2 = DZ.tau / Math.max(1 / 240, FDT);
            var tx = (x - p.px) * k2, ty = (y - p.py) * k2, len = Math.hypot(tx, ty), cap = m * DZ.streak;
            if (len > cap) { tx *= cap / len; ty *= cap / len; len = cap; }
            if (len > rr * 1.5 && len < m * .5) {
              cx.strokeStyle = rgba([220, 230, 245], p.a * HOP * .85); cx.lineWidth = Math.max(.6, rr * .9); cx.lineCap = 'round';
              cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - tx, y - ty); cx.stroke();
            }
          }
        }
        p.px = x; p.py = y;
      });
    });
  }

  // world (px at z=1, relative to centre) → screen
  function toScreen(wx, wy) {
    var c = sky.cam, z = c.z.x;
    var lk = 140 * M / 390;
    return { x: W / 2 + (wx - c.x.x) * z - sky.look.x.x * lk * z, y: H * .44 + (wy - c.y.x) * z - sky.look.y.x * lk * z };
  }
  sky.toScreen = function (wx, wy, dep) {
    var c = toScreen(wx, wy), lk = 140 * M / 390, zc = sky.cam.z.x;
    if (dep) {
      var kz = Math.pow(zc, (dep - 1) * .38);   // site depth zoom: nearer constellations rush out, farther ones hang back
      c.x = W / 2 + (wx - sky.cam.x.x) * zc * kz - sky.look.x.x * lk * zc * dep; c.y = H * .44 + (wy - sky.cam.y.x) * zc * kz - sky.look.y.x * lk * zc * dep;
    }
    return c;
  };

  // 3D: every star has a depth. The constellation turns with the camera look (yaw / pitch) and is drawn in
  // perspective; each constellation also sits at its own distance, so they slide past one another (parallax).
  var FOC = 260;   // the lens: the camera dial's 55° / 60° set sky.FOC
  function proj(n, s, sc) {
    var yaw = n.editing ? 0 : sky.look.x.x * .75 + (n.spin || 0), pit = n.editing ? 0 : -sky.look.y.x * .6, z = (s[3] || 0);   // while it is being edited it holds still, face on
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
    var x1 = s[0] * cy + z * sy, z1 = -s[0] * sy + z * cy;
    var y2 = s[1] * cp - z1 * sp, z2 = s[1] * sp + z1 * cp;
    var F2 = sky.FOC || FOC, k = F2 / (F2 + z2);
    return [x1 * k * sc, y2 * k * sc, k];
  }
  sky.proj = proj;
  // (19 Nov, the constellation editor) a star of a constellation, on the screen; and a point on the screen, back in its own units
  function nodeFrame(n) { var dep = n.depth || 1, zc = sky.cam.z.x, kz = Math.pow(zc, (dep - 1) * .38), c = sky.toScreen(n.x, n.y, dep), sc = n.scale * zc * kz; if (n.anchors) sc *= 1 + (n.fa || 0) * 1.3; return { c: c, sc: sc }; }
  sky.starScreen = function (n, i) { var f = nodeFrame(n), p = proj(n, n.stars[i], f.sc); return [f.c.x + p[0], f.c.y + p[1]]; };
  sky.toLocal = function (n, x, y, z) { var f = nodeFrame(n), F2 = sky.FOC || FOC, k = F2 / (F2 + (z || 0)); return [(x - f.c.x) / (k * f.sc), (y - f.c.y) / (k * f.sc)]; };
  function drawConstellation(n, alpha, isDeco) {
    var dep = n.depth || 1, zc = sky.cam.z.x, kz = Math.pow(zc, (dep - 1) * .38);
    var c = sky.toScreen(n.x, n.y, dep);
    var sc = n.scale * zc * kz, tint = n.tint || [214, 226, 236], gw = glowFor(tint);
    if (n.anchors) {   // the sound sky opens out when you arrive at it, so every title has room on its star
      n.fa = (n.fa || 0) + ((n.face ? 1 : 0) - (n.fa || 0)) * (1 - Math.exp(-FDT * 4)); sc *= 1 + n.fa * 1.3;
    }
    n.spin = (n.spin0 || 0) + Math.sin(tAcc * .05 + (n.x || 0)) * .12;   // a slow turn with the atmosphere; still when it is still
    var P = n.stars.map(function (s) { return proj(n, s, sc); });
    var MPg = markProg(), fly = isDeco ? 1 : MPg.fly;
    if (!isDeco && fly < 1 && sky.mark && sky.mark.mp && n.from) {   // the unfold: each star leaves its place on the Mark
      P = P.map(function (p, i) { var m = sky.mark.mp(n.from[i]), sx = c.x + p[0], sy = c.y + p[1]; return [m[0] + (sx - m[0]) * fly - c.x, m[1] + (sy - m[1]) * fly - c.y, p[2]]; });
    }
    if (!isDeco && n.id) {   // one tap in (17 Nov): the constellation you chose spreads open around you as you arrive, and folds back when you leave
      var spT = sky.roomId === n.id ? 1 : 0; n.sp = (n.sp || 0) + (spT - (n.sp || 0)) * (1 - Math.exp(-FDT * (spT ? 3.2 : 4.5)));
      if (n.sp > .002) { var e2 = n.sp * n.sp * (3 - 2 * n.sp);
        P = P.map(function (p, i) { var k2 = 1 + e2 * (1.4 + .9 * ((i * 0.618) % 1)); return [p[0] * k2, p[1] * k2, p[2]]; }); alpha *= 1 - .75 * e2; }
    }
    if (isDeco) alpha *= sky.wake ? clamp((GJ.now() - sky.wake - 1900) / 700, 0, 1) : 1;
    if (!isDeco && MPg.d < 1 && fly <= 0) return;
    var TC = sky.mode !== 'night';   // true colour in red mode
    var la = Math.min(1, sky.env.line * alpha * .30 * (TC ? 1.7 : 1) * (n.lineA || 1) * (1 + sky.mood * .45) * (1 - .65 * smooth(5, 16, zc)));
    if (TC) OVR = TRUE.line;
    cx.lineWidth = 1; cx.strokeStyle = rgba(tint, la);
    var lineIn = isDeco ? 1 : smooth(.75, 1, fly);
    n.edges.forEach(function (e) {   // hairlines fade with depth
      var a = P[e[0]], b = P[e[1]];
      cx.strokeStyle = rgba(tint, la * lineIn * Math.min(1, (a[2] + b[2]) / 2));
      cx.beginPath(); cx.moveTo(c.x + a[0], c.y + a[1]); cx.lineTo(c.x + b[0], c.y + b[1]); cx.stroke();
    });
    var zk = Math.min(1.8, Math.pow(zc, .25)) * (M / 390 * .6 + .4);
    var plS = TC && n.anchors && GJ.player ? GJ.player.state() : null, anS = {};
    if (TC && n.anchors) n.anchors.forEach(function (an) { anS[an.s] = plS && plS.idx === an.i && plS.playing ? 'gold' : 'red'; });
    n.stars.forEach(function (s, i) {
      var p = P[i], b = clamp((s[2] || 1.2) / 2, .35, 1);
      var tw = (.8 + .2 * Math.sin(tAcc * 1.3 + i * 2.17)) * Math.min(1, .55 + .45 * p[2]), gwS = gw;
      if (TC) { var k3 = anS[i]; OVR = null; gwS = glowSprite(k3 ? TRUE[k3] : TRUE.pale); OVR = k3 ? mix(TRUE[k3], [255, 255, 255], .18) : TRUE.core; if (k3) b = Math.max(b, .9); }
      sdot(c.x + p[0], c.y + p[1], (.6 + b * 1.3) * zk * p[2], alpha * .92 * b * tw * (isDeco ? .8 : 1) * (TC ? 1.1 : 1), gwS, (8 + b * 18) * zk * p[2] * (TC ? 1.15 : 1));
    });
    if (TC) OVR = TRUE.pale;
    if (!isDeco && n.face && sky.mode === 'night' || !isDeco && n.face) {
      var hub = P[0];
      cx.lineWidth = 1.2; cx.strokeStyle = rgba([232, 228, 220], alpha * .9 * n.face);
      cx.beginPath(); cx.arc(c.x + hub[0], c.y + hub[1], 14, 0, 6.283); cx.stroke();
    }
    if (!isDeco && n.label) {   // the hub's chapter labels: NAME in Julius and the tint, a count line under it in Poppins
      var anyFace = sky.nodes.some(function (k) { return k.face; });
      var cnA = alpha * lineIn * (1 - smooth(2.2, 3.6, zc)) * (anyFace && !n.face ? .3 : 1), fs = clamp(13 * Math.pow(zc, .35), 12, 19), ly = c.y + (n.ly || 0) * sc + 4;
      if (cnA > .01) {
        cx.textAlign = 'center'; cx.textBaseline = 'top';
        if (TC) OVR = TRUE.name;
        cx.font = '400 ' + fs.toFixed(1) + 'px "Julius Sans One", sans-serif'; cx.fillStyle = rgba(sky.hub === 'star' ? [214, 222, 236] : tint, cnA);
        if (TC) OVR = TRUE.pale;
        try { cx.letterSpacing = sky.hub === 'star' ? (fs * .3).toFixed(1) + 'px' : '0px'; } catch (e) {}
        cx.fillText(n.label.toUpperCase(), c.x, ly);
        try { cx.letterSpacing = '0px'; } catch (e) {}
        var meta = n.meta ? n.meta() : '';
        cx.font = '300 ' + (fs * .82).toFixed(1) + 'px Poppins, sans-serif'; cx.fillStyle = rgba([201, 211, 214], cnA);
        if (meta) cx.fillText(meta, c.x, ly + fs * 1.35);
        // closer in (the chapter level), more of it: the tool's own facts, the way works name themselves on the site
        var fA = cnA * smooth(1.3, 1.65, zc) * (n.face ? 1 : .55), facts = fA > .01 && n.facts ? n.facts() : null;
        if (n.anchors) {   // titles on their stars, the artist under: the sound sky's own labels
          var pl = GJ.player && GJ.player.state(), aA = alpha * lineIn * smooth(1.15, 1.6, zc) * (anyFace && !n.face ? .3 : 1);
          n.seat = n.anchors.map(function (an) { var p = P[an.s]; return { x: c.x + p[0], y: c.y + p[1], i: an.i }; });
          var taken = [];
          if (aA > .01) n.anchors.forEach(function (an, j) {
            var q = n.seat[j], on = pl && ((pl.idx === an.i && pl.playing) || (GJ.player.selected && GJ.player.selected() === an.i)), ty = q.y - fs * 2.6;
            cx.font = '300 ' + (fs * .95).toFixed(1) + 'px Poppins, sans-serif';
            var lw = Math.max(cx.measureText(an.t).width, fs * 5) / 2 + 4, hit = function (y) { return taken.some(function (r) { return Math.abs(r.x - q.x) < r.w + lw && Math.abs(r.y - y) < fs * 2.3; }); };
            var cand = [-2.6, .9, -4.8, 3.2];          // above its star; crowded → under it (as the site does), then further out
            for (var ci = 0; ci < cand.length; ci++) { ty = q.y + fs * cand[ci]; if (!hit(ty)) break; }
            taken.push({ x: q.x, y: ty, w: lw });
            cx.textAlign = 'center'; cx.textBaseline = 'top';
            if (TC) OVR = on ? TRUE.gold : TRUE.red;
            cx.font = '300 ' + (fs * .95).toFixed(1) + 'px Poppins, sans-serif'; cx.fillStyle = rgba(on ? tint : [230, 237, 240], aA * (on ? 1 : .8));
            cx.fillText(an.t, q.x, ty);
            if (TC) OVR = TRUE.pale;
            cx.font = '300 ' + (fs * .72).toFixed(1) + 'px Poppins, sans-serif'; cx.fillStyle = rgba([201, 211, 214], aA * .6);
            cx.fillText(an.by, q.x, ty + fs * 1.15);
            if (on) { cx.globalAlpha = aA * (.5 + .3 * Math.sin(tAcc * 3)); var gs2 = 34 * zk; cx.drawImage(TC ? glowSprite(TRUE.gold) : gw, q.x - gs2 / 2, q.y - gs2 / 2, gs2, gs2); cx.globalAlpha = 1; }
          });
        }
        if (facts) { cx.font = '300 ' + (fs * .76).toFixed(1) + 'px Poppins, sans-serif'; cx.fillStyle = rgba([230, 237, 240], fA * .85);
          facts.forEach(function (l, j) { cx.fillText(l, c.x, ly + fs * (2.7 + j * 1.25)); }); }
      }
    }
    OVR = null;
    n.screen = c;
  }
  function drawNodes() {
    var f = sky.focus.x; if (f < .003) return;
    if (sky.hub === 'star' && sky.mark) {   // the alt hub: hairline spokes from the Mark to each chapter's own bright star
      var mc = toScreen(0, sky.mark.y), fl = markProg().fly, gw = glowFor([205, 225, 255]), zc = sky.cam.z.x, zk = Math.min(1.8, Math.pow(zc, .25)) * (M / 390 * .6 + .4);
      sky.nodes.forEach(function (n) {
        var c = sky.toScreen(n.x, n.y, n.depth), hx = mc.x + (c.x - mc.x) * fl, hy = mc.y + (c.y - mc.y) * fl, tint = n.tint || [214, 226, 236];
        cx.lineWidth = 1; cx.strokeStyle = rgba([205, 220, 240], .22 * f * fl * (1 - smooth(1.4, 2, zc)));
        cx.beginPath(); cx.moveTo(mc.x, mc.y); cx.lineTo(hx, hy); cx.stroke();
        var hg = glowFor(tint);
        cx.globalAlpha = .22 * f * fl; var hs = 150 * zk; cx.drawImage(hg, hx - hs / 2, hy - hs / 2, hs, hs); cx.globalAlpha = 1;   // the chapter's halo
        sdot(hx, hy, 2.6 * zk, f * fl, gw, 44 * zk);   // its own bright star
      });
    }
    sky.nodes.forEach(function (n) { drawConstellation(n, f * (n.live ? 1 : .42), false); });
  }
  function drawDeco() {
    var f = Math.max(sky.focus.x, .0); if (f < .003) return;
    sky.deco.forEach(function (n) { drawConstellation(n, f * .38, true); });
  }

  // horizon glow: a low band, and in Golden Hour a warmer band that follows the sun
  function drawHorizonGlow(ga, alt) {
    var y = H * .79, gr = cx.createLinearGradient(0, y - H * .14, 0, y + H * .05);
    var base = [92, 100, 178], a = .36 * (1 + sky.mood * .5);
    if (ga > 0) { var w = washNow(alt); base = mix(base, w[2], ga); a = (.22 + ga * .25 * smooth(-8, 2, alt)) * (1 - .45 * wxOv()); }
    gr.addColorStop(0, rgba(base, 0)); gr.addColorStop(.75, rgba(base, a)); gr.addColorStop(1, rgba(base, 0));
    cx.fillStyle = gr; cx.fillRect(0, y - H * .14, W, H * .19);
  }

  function sunXY(az, alt) {
    var hy = sky.horizonY(), lk = 140 * M / 390;
    var x = W / 2 + clamp((az - 180) / 125, -1, 1) * W * .4 - sky.look.x.x * lk * .5;
    var k = Math.sin(clamp(alt, -10, 70) * Math.PI / 180) / Math.sin(65 * Math.PI / 180);
    return [x, hy - (hy - H * .24) * k];
  }
  function drawPath() {
    var pth = sky.golden.path, show = sky.golden.pathA ? sky.golden.pathA.x : 0;
    if (!pth || show < .01) return;
    cx.save(); cx.setLineDash([1, 7]); cx.lineWidth = 1; cx.strokeStyle = rgba([232, 228, 220], .5 * show);
    cx.beginPath();
    pth.forEach(function (q, i) { var p = sunXY(q[0], q[1]); i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); });
    cx.stroke(); cx.restore();
  }
  function drawSun(ga, alt) {
    var hy = sky.horizonY(), az = sky.golden.sunAz.x;
    drawPath();
    var xy = sunXY(az, alt), x = xy[0], y = xy[1];
    var vis = ga * smooth(-4, .5, alt), bk = wxBank();
    if (bk > .004) vis *= 1 - bk * (1 - smooth(bankE - .7, bankE + .5, alt));   // behind the bank on the horizon: gone before the hairline
    var ov = wxOv(), wet = wxWet(), thru = 1 - ov * (.78 + .2 * wet);   // what comes through the roof
    if (vis > .01) {
      var r = (46 + 20 * (1 - smooth(0, 20, alt))) * (1 + 1.3 * ov);   // cloud spreads it: a wide, soft patch
      var g = cx.createRadialGradient(x, y, 0, x, y, r);
      var core = alt < 8 ? [255, 214, 160] : [250, 244, 230];
      if (ov > .004) core = mix(core, [214, 216, 222], ov * .8);       // and takes the gold out of it
      var soft = 1 - .5 * ov * wet;
      g.addColorStop(0, rgba(core, .85 * vis * (1 - .6 * ov) * soft)); g.addColorStop(.12 + .22 * ov, rgba(core, .45 * vis * (1 - .4 * ov) * soft)); g.addColorStop(1, rgba(core, 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
      cx.fillStyle = rgba([255, 248, 236], vis * Math.pow(thru, 1.5)); cx.beginPath(); cx.arc(x, y, 3.2, 0, 6.283); cx.fill();
    } else if (ga > .01) {
      // below the horizon: a quiet mark on the hairline where it will rise or has set
      var px = x, pv = ga * .5 * (1 - smooth(-18, -4, alt) * 0) * smooth(-18, -4, alt);
      cx.fillStyle = rgba([232, 210, 190], pv); cx.beginPath(); cx.arc(px, hy, 2, 0, 6.283); cx.fill();
    }
    sky.sunScreen = { x: x, y: y, vis: vis, thru: thru };
  }

  // the bank of cloud on the horizon: soft lumps along the hairline, densest toward the sun, darker than the sky behind
  // them; while the sun is behind it, a thin lit rim along its top. In the dark it is only a darker dark.
  var LUMPS = null;
  function drawBank(ga, alt) {
    var b = wxBank() * ga; if (b < .01) return;
    if (!LUMPS) { var sd = 31, r = function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; LUMPS = []; for (var i = 0; i < 16; i++) LUMPS.push({ u: (i + r() * .8) / 16, w: .09 + r() * .1, h: .55 + r() * .75, ph: r() * 6.28 }); }
    var hy = sky.horizonY(), top = altY(bankE), h = Math.max(5, hy - top), sx = sky.sunScreen ? sky.sunScreen.x : W / 2, lk = 140 * M / 390;
    var w = washNow(alt), light = smooth(-9, -1, alt), body = mix(mix(w[2], [16, 18, 24], .7), w[1], .12), still = GJ.reduced() || sky.atmos < .02;
    cx.save(); cx.beginPath(); cx.rect(0, 0, W, hy + .5); cx.clip();
    cx.fillStyle = rgba(body, Math.min(1, (.5 + .42 * light) * b)); cx.shadowColor = rgba(body, .9 * b); cx.shadowBlur = 7;
    LUMPS.forEach(function (L) {
      var x = ((L.u * (W + 160) - sky.look.x.x * lk * .45 + (still ? 0 : tAcc * 1.2)) % (W + 160) + (W + 160)) % (W + 160) - 80;
      var dens = .5 + .5 * Math.exp(-Math.pow((x - sx) / (W * .5), 2)), rx = L.w * W, ry = h * L.h * dens * (still ? 1 : 1 + .04 * Math.sin(tAcc * .3 + L.ph));
      cx.beginPath(); cx.ellipse(x, hy + 1, rx, Math.max(2, ry), 0, 0, 6.283); cx.fill();
    });
    cx.shadowBlur = 0;
    // the rim: the sun is behind the bank — its light spills over the top
    var rim = b * smooth(-4, -1, alt) * (1 - smooth(bankE - .2, bankE + 1.4, alt));
    if (rim > .01) {
      var ry2 = hy - h * .95, g = cx.createRadialGradient(sx, ry2, 0, sx, ry2, 70);
      g.addColorStop(0, rgba([255, 224, 178], .5 * rim)); g.addColorStop(.35, rgba([255, 200, 150], .16 * rim)); g.addColorStop(1, rgba([255, 200, 150], 0));
      cx.fillStyle = g; cx.beginPath(); cx.ellipse(sx, ry2, 70, 16, 0, 0, 6.283); cx.fill();
    }
    cx.restore();
  }

  // tree line + ground (target sheet): conifer tips at ~84 %, dark ground below
  var trees = null;
  function treePath() {
    // the m4 foreground: a long hill rising to the left, sparse tall conifers, low scrub
    var k = H / 844, y0 = H * .845, pts = [[-4, y0]], x = -4, i = 0;
    function ridge(x) { return y0 - (34 * k) * Math.max(0, 1 - x / (W * .55)) - 5 * Math.sin(x / 47) - 3 * Math.sin(x / 19 + 1); }
    while (x < W + 24) {
      var r = rnd2(i++ * 3.7), y = ridge(x);
      if (r > .86) {
        var h = (26 + rnd2(i * 9.1) * (r > .95 ? 64 : 30)) * k, w = h * (.26 + rnd2(i * 5.3) * .08);
        pts.push([x, y], [x + w * .5, y - h], [x + w, ridge(x + w)]); x += w + 4;
      } else if (r > .6) { var h2 = (6 + r * 8) * k; pts.push([x, y], [x + 3, y - h2], [x + 6, y]); x += 7; }
      else { pts.push([x, y]); x += 6 + r * 10; }
    }
    pts.push([W + 24, y0]); return pts;
  }
  function rnd2(x) { var v = Math.sin(x * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); }
  function drawTrees() {
    if (!trees || trees.W !== W || trees.H !== H) trees = { W: W, H: H, p: treePath() };
    var a = sky.trees.x; if (a < .01) return;
    var p = trees.p;
    cx.fillStyle = sky.mode === 'night' ? 'rgba(3,6,10,' + a + ')' : 'rgba(10,1,2,' + a + ')';
    cx.beginPath(); cx.moveTo(0, H); cx.lineTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length; i++) cx.lineTo(p[i][0], p[i][1]);
    cx.lineTo(W, H); cx.closePath(); cx.fill();
    cx.fillStyle = sky.mode === 'night' ? 'rgba(4,7,11,' + a + ')' : 'rgba(8,1,2,' + a + ')';
    cx.fillRect(0, H * .845, W, H * .155);
  }

  /* ---------- the Mark at the centre of L0 — the site's own STROKES (sky.js L18), drawn as the site draws it:
     corners and ends are whole stars, the stars between are suggested, small and faint. Arrival (sky.js markProg):
     it draws in 1100 ms (ease-out), then dims to 35 % over 600 ms — and its stars fly out to become the constellations. */
  var STROKES = [[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97]],[[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5]],[[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]]];
  var LENS = STROKES.map(function (st) { var c = [0]; for (var j = 1; j < st.length; j++) c.push(c[j - 1] + Math.hypot(st[j][0] - st[j - 1][0], st[j][1] - st[j - 1][1])); return c; });
  var TOT = LENS.reduce(function (a, c) { return a + c[c.length - 1]; }, 0);
  function along(f) {   // a point at fraction f of the whole stroke length
    var d = f * TOT;
    for (var i = 0; i < STROKES.length; i++) { var c = LENS[i], L = c[c.length - 1]; if (d <= L || i === STROKES.length - 1) { for (var j = 1; j < c.length; j++) if (d <= c[j] || j === c.length - 1) { var t = clamp((d - c[j - 1]) / (c[j] - c[j - 1]), 0, 1), a = STROKES[i][j - 1], b = STROKES[i][j]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; } } d -= L; }
    return STROKES[0][0];
  }
  sky.markAlong = along;
  function markProg() {
    if (!sky.wake) return { d: 1, a: .85, fly: 1 };
    var t = GJ.now() - sky.wake, d = clamp((t - 400) / 1100, 0, 1);
    return { d: 1 - Math.pow(1 - d, 2), a: 1 - .15 * clamp((t - 1500) / 600, 0, 1), fly: GJ.ease(clamp((t - 1500) / 900, 0, 1)) };
  }
  sky.markProg = markProg;
  function drawMark() {
    var mk = sky.mark, f = sky.focus.x; if (!mk || f < .003) return;
    var P = markProg(), c = toScreen(0, mk.y), sc = mk.scale * sky.cam.z.x;
    var a = f * P.a * (1 - smooth(2, 3.4, sky.cam.z.x));
    var yaw = sky.look.x.x * .5, cyw = Math.cos(yaw), syw = Math.sin(yaw);
    function mp(q) { var x = q[0], z = -Math.abs(x) * .18, X = x * cyw + z * syw, Z = -x * syw + z * cyw, k = 1400 / (1400 + Z); return [c.x + X * sc * k, c.y + q[1] * sc * k]; }
    // hairlines, drawn on along the strokes
    cx.lineWidth = 1; cx.strokeStyle = rgba([205, 225, 255], .16 * a * (1 + sky.mood * .45));
    var left = P.d * TOT;
    STROKES.forEach(function (st, i) {
      cx.beginPath(); var p0 = mp(st[0]); cx.moveTo(p0[0], p0[1]);
      for (var j = 1; j < st.length; j++) {
        var seg = LENS[i][j] - LENS[i][j - 1], q = mp(st[j]);
        if (left >= seg) { cx.lineTo(q[0], q[1]); left -= seg; }
        else { if (left > 0) { var pp = mp(st[j - 1]), u = left / seg; cx.lineTo(pp[0] + (q[0] - pp[0]) * u, pp[1] + (q[1] - pp[1]) * u); } left = 0; break; }
      }
      cx.stroke();
    });
    if (sky.hub === 'star') {
      var ga2 = a * (sky.mode === 'night' ? 1 : .7), gwm = glowFor([205, 220, 245]), gr2 = 230 * sc;
      cx.globalAlpha = ga2 * .55; cx.drawImage(gwm, c.x - gr2, c.y - gr2, gr2 * 2, gr2 * 2); cx.globalAlpha = 1;
      cx.lineCap = 'butt'; cx.lineJoin = 'round'; cx.lineWidth = Math.max(3, 26 * sc);
      [[1.6, 0, [10, 189, 240], .85], [-1.6, 0, [254, 1, 1], .75], [0, 0, [246, 248, 252], 1]].forEach(function (L) {
        cx.strokeStyle = sky.mode === 'night' ? 'rgba(' + L[2].join(',') + ',' + (L[3] * ga2 * P.d).toFixed(3) + ')' : rgba(L[2][0] > 200 && L[2][1] > 200 ? [246, 248, 252] : [0, 0, 0], L[2][0] > 200 && L[2][1] > 200 ? ga2 * P.d : 0);
        STROKES.forEach(function (st) { cx.beginPath(); st.forEach(function (q, j) { var pp = mp(q); if (j) cx.lineTo(pp[0] + L[0], pp[1] + L[1]); else cx.moveTo(pp[0] + L[0], pp[1] + L[1]); }); cx.stroke(); });
      });
      mk.screen = c; mk.r = 214 * sc; mk.mp = mp; return;
    }
    // the stars: 64 along the strokes, evenly, each its own brightness, each with the glow (blend.js MARK, z 1.12)
    var n = 64, rr = Math.max(.8, M / 390) * Math.min(2, Math.pow(sky.cam.z.x, .3)) * Math.max(.7, sc / (M * .31 / 428)) * .62, gw = glowFor([205, 225, 255]);
    if (!MSTAR) { var sd = 11, rq = function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; MSTAR = []; for (var k0 = 0; k0 < n; k0++) MSTAR.push({ b: .45 + rq() * .55, ph: rq() * 6.28 }); }
    for (var k = 0; k < n; k++) {
      var fk = (k + .5) / n; if (fk > P.d + .001) break;
      var q2 = mp(along(fk)), ms = MSTAR[k], tws = GJ.reduced() ? 1 : .8 + .2 * Math.sin(tAcc * 1.4 + ms.ph);
      sdot(q2[0], q2[1], (.7 + ms.b * 1.1) * rr, a * ms.b * tws, gw, (10 + ms.b * 14) * rr);
    }
    mk.screen = c; mk.r = 214 * sc; mk.mp = mp;
  }

  /* ---------- water: reflections and ripples (site toggles gj-tog-reflect; the opener's water ripple — sky.css .rip:
     18 px, ×16, 1.5 s ease-out). Between the horizon and the near shore the sky is mirrored, broken by a slow shimmer;
     a touch on the water rings out in perspective; with the atmosphere on, the odd drop lands by itself. ---------- */
  var drops = [], nextDrop = 0, reflC = null;
  sky.ripple = function (x, y, small) { drops.push({ x: x, y: y, t: GJ.now(), s: small ? .35 : 1 }); };
  function waterTop() { return sky.horizonY() + 1; }
  function waterBot() { return H * .845; }
  function drawReflection() {
    if (!sky.reflect) return;
    var hy = waterTop(), d = waterBot() - hy, at = sky.atmos, t = tAcc;
    // darken the water first, so the mirror reads as water, not a copy
    var gw = cx.createLinearGradient(0, hy, 0, hy + d);
    gw.addColorStop(0, sky.ink([4, 7, 11], .28)); gw.addColorStop(1, sky.ink([4, 7, 11], .62));
    cx.fillStyle = gw; cx.fillRect(0, hy, W, d);
    // one copy of the sky above the horizon per frame, then the strips are cut from the copy
    var sh = Math.min(hy - 2, d * 1.08 + 4), sy0 = hy - 2 - sh;
    if (!reflC) reflC = document.createElement('canvas');
    var rw = cv.width, rh = Math.max(1, Math.round(sh * DPR));
    if (reflC.width !== rw || reflC.height !== rh) { reflC.width = rw; reflC.height = rh; }
    var rg = reflC.getContext('2d'); rg.clearRect(0, 0, rw, rh); rg.drawImage(cv, 0, Math.round(sy0 * DPR), rw, rh, 0, 0, rw, rh);
    for (var y = 0; y < d; y += 2) {
      var src = sh - y * 1.08; if (src < 0) break;
      var k = y / d, off = (Math.sin(y * .21 + t * 1.7) * .8 + Math.sin(y * .053 - t * .9) * 1.6 * (1 + sky.env.swell * 2.4)) * (.4 + k * 2.6) * (.25 + .75 * at);
      cx.globalAlpha = .34 * (1 - k * .65);
      cx.drawImage(reflC, 0, Math.max(0, Math.round(src * DPR) - Math.round(2 * DPR)), rw, Math.max(1, Math.round(2 * DPR)), off, hy + y, W, 2);
    }
    cx.globalAlpha = 1;
  }
  function drawRipples() {
    if (!sky.ripples) { drops = []; return; }
    var now = GJ.now(), hy = waterTop(), wb = waterBot();
    if (sky.atmos > .3 && sky.reflect && now > nextDrop) {   // the odd drop
      nextDrop = now + (2200 + Math.random() * 3200 / sky.atmos) / Math.max(.4, sky.env.rip);
      sky.ripple(W * (.1 + Math.random() * .8), hy + 8 + Math.random() * (wb - hy - 16), true);
    }
    drops = drops.filter(function (d) { return now - d.t < 1600; });
    drops.forEach(function (d) {
      var depth = clamp((d.y - hy) / (wb - hy), .05, 1), sq = .18 + depth * .2;   // nearer water: rounder rings
      [0, .14, .28].forEach(function (lag, i) {
        var u = clamp(((now - d.t) / 1500 - lag) / (1 - lag), 0, 1); if (u <= 0) return;
        var r = 9 * (1 + (1 - Math.pow(1 - u, 3)) * 15) * d.s * (.5 + depth * .7) * sky.env.rip;
        cx.lineWidth = 1; cx.strokeStyle = rgba([255, 255, 255], (1 - u) * .5 * (1 - i * .22) * (.5 + depth * .5));
        cx.beginPath(); cx.ellipse(d.x, d.y, r, r * sq, 0, 0, 6.283); cx.stroke();
      });
    });
  }

  /* ---------- the moon: the site's crescent (sky.css .moon — 46 px, right 16 %, top 7 %, #f3ecdf, glow 16 px .55),
     drawn in tonight's real phase; it fades as the sky brightens. Far away: it barely slides when you look. ---------- */
  function moonPhase(ms) { var jd = ms / 86400000 + 2440587.5, p = ((jd - 2451550.1) / 29.530588853) % 1; return p < 0 ? p + 1 : p; }
  sky.moonPhase = moonPhase;
  function drawMoon() {
    var on = sky.moonOn ? 1 : 0, day = smooth(-8, 2, sky.golden.sun.x) * sky.golden.a.x;
    var ov = wxOv(), a = on * (1 - day) * (sky.wake ? clamp((GJ.now() - sky.wake) / 1200, 0, 1) : 1) * (1 - ov * (.7 + .2 * wxWet()));   // behind cloud: a smudge
    var lk = 140 * M / 390, r = 23, sat = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat-px')) || 0;
    var x = W * .84 - r - sky.look.x.x * lk * .22, y = H * .07 + sat + r - sky.look.y.x * lk * .22;
    sky.moonA = a; sky.moonXY = [x, y];
    if (a < .01 || sky.moonAway || (G.GJ_COMPARE && G.GJ_COMPARE.v() === 'after')) return;   // compare 'after': the free Moon dial is the crescent (js/moonfree.js)   // (Gill, 19 Nov) while the Moon dial is awake it IS this moon, so the sky does not draw a second one
    cx.save(); cx.translate(x, y);
    cx.shadowBlur = 16 + 22 * ov; cx.shadowColor = rgba([243, 236, 223], .55 * a);
    cx.fillStyle = rgba([243, 236, 223], .95 * a);
    cx.beginPath();
    if (sky.moonMode === 'phase') {   // tonight's real phase
      var p = moonPhase(Date.now()), k = (1 - Math.cos(p * 6.2832)) / 2, e = r * (1 - 2 * k);
      if (p >= .5) cx.scale(-1, 1);
      cx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false); cx.ellipse(0, 0, Math.abs(e), r, 0, Math.PI / 2, -Math.PI / 2, e > 0);
    } else {   // the site's crescent: a 46 px disc's shadow at (−13, 2), the disc itself clear (sky.css .moon)
      var o = -13, d = Math.hypot(o, 2), ang = Math.atan2(2, o), half = Math.acos(d / (2 * r));
      cx.arc(o, 2, r, ang - Math.PI + half, ang + Math.PI - half, false);   // outer edge of the lit disc
      cx.arc(0, 0, r, ang + half, ang - half, true);                        // back along the clear disc
    }
    cx.closePath(); cx.fill();
    cx.restore();
  }

  function drawGlow(red) {
    if (!glow || sky.atmos <= 0) return;
    var age = (GJ.now() - glow.t) / 1100;
    if (age >= 1) { glow = null; return; }
    var a = (1 - age) * (1 - age) * .12 * Math.min(1, .25 + sky.atmos);
    var g = cx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 128);
    var ink = [228, 221, 210];
    g.addColorStop(0, rgba(ink, red ? a * 1.4 : a)); g.addColorStop(1, rgba(ink, 0));
    cx.fillStyle = g; cx.beginPath(); cx.arc(glow.x, glow.y, 128, 0, 6.283); cx.fill();
  }

  sky.hop = function () { return HOP; };
})(this);
