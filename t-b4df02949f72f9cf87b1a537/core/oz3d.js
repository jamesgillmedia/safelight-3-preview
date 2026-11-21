/* oz core · the 3D engine of the oz viewer (js/oztune.js), on its own so other dials can draw with it (safelight 3 alt:
   Gill, 19 Nov: the crescent IS the Moon dial, and the dial that comes out of it is drawn "by the same engine that powers
   the oz viewer"). No library: a canvas and some arithmetic, exactly the viewer's own.
     camera(c, o) ... one orbit about a centre: c = { az, el, zoom } in degrees; o = { dist, eye (the centre's height),
                      elMin, elMax, minZ } (the viewer: 2200, 116, 0, 85, 1)
     proj(v, p, cx, cy, scale) ... a world point [x, y (up), z] → [screen x, screen y, size factor, distance]
     halo(rgb, sr) / glow(ctx, rgb, sr, x, y, R, a) / disc(ctx, rgb, x, y, r, a) ... the viewer's blurred-disc stars
   Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, PI = Math.PI, RAD = PI / 180;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var used = {};
  function camera(c, o) {
    o = o || {}; var dist = o.dist || 2200, eye = o.eye || 0, lo = o.elMin == null ? 0 : o.elMin, hi = o.elMax == null ? 85 : o.elMax;
    var az = c.az * RAD, el = clamp(c.el, lo, hi) * RAD, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    return { C: [dist * sa * ce, eye + dist * se, dist * ca * ce], f: [-sa * ce, -se, -ca * ce], r: [ca, 0, -sa], u: [-sa * se, ce, -ca * se], F: dist * (c.zoom || 1), g: [sa, ca], minZ: o.minZ == null ? 1 : o.minZ };
  }
  function proj(v, p, cx, cy, scale) {
    var x = p[0] - v.C[0], y = p[1] - v.C[1], z = p[2] - v.C[2], zc = x * v.f[0] + y * v.f[1] + z * v.f[2], s = v.F / Math.max(v.minZ, zc), k = scale == null ? 1 : scale;
    return [(cx == null ? 512 : cx) + (x * v.r[0] + z * v.r[2]) * s * k, (cy == null ? 512 : cy) - (x * v.u[0] + y * v.u[1] + z * v.u[2]) * s * k, s, Math.sqrt(x * x + y * y + z * z)];
  }
  function tailFn(x) { var z = Math.abs(x), t = 1 / (1 + .5 * z), r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (.37409196 + t * (.09678418 + t * (-.18628806 + t * (.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-.82215223 + t * .17087277))))))))); return x >= 0 ? r : 2 - r; }
  var SPR = {};
  function halo(c, sr) {   // sr = σ / R; the sprite reaches R + 3σ
    var key = c.join() + '|' + sr; if (SPR[key]) return SPR[key];
    var n = 96, cv = document.createElement('canvas'); cv.width = cv.height = n; var x = cv.getContext('2d'), im = x.createImageData(n, n), R = n / 2 / (1 + 3 * sr), i, j;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) { var d = Math.hypot(i + .5 - n / 2, j + .5 - n / 2), a = .5 * tailFn((d - R) / (sr * R * Math.SQRT2)), o = (j * n + i) * 4; im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = Math.round(255 * clamp(a, 0, 1)); }
    x.putImageData(im, 0, 0); return (SPR[key] = { cv: cv, reach: 1 + 3 * sr });
  }
  function glow(x, c, sr, px, py, R, a) { if (a <= .004 || R <= 0) return; var h = halo(c, sr), d = R * h.reach; x.globalAlpha = Math.min(1, a); x.drawImage(h.cv, px - d, py - d, d * 2, d * 2); x.globalAlpha = 1; }
  function disc(x, c, px, py, r, a) { x.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; x.beginPath(); x.arc(px, py, r, 0, 2 * PI); x.fill(); }
  GJ.oz3d = { camera: camera, proj: proj, halo: halo, glow: glow, disc: disc,
    use: function (who) { used[who] = (used[who] || 0) + 1; }, users: function () { return Object.keys(used); } };   // who draws with it (qa)
})(window);
