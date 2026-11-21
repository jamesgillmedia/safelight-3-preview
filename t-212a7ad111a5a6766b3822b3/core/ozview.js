/* oz core · "the oz viewer as a dial dimension" (Gill, 19 Nov; a prototype). A miniature live oz viewer, shrunk into the
   side dial: as the dial turns, the view moves through depth — the camera comes down through its levels (from above to
   the water line) and the oz constellation sinks into the water. Drawn by the oz viewer's own engine (core/oz3d.js), the
   reference's own geometry (as js/oztune.js: a 1024 square, waterline 628, o = 30 dots on (338, 486) r 156, the z, the
   mint star at its top right). Chosen per place in Tune → Dials → … · look → oz; the live dial there shows it too.
   It is only a look: the dial still turns, snaps, says its value and resets like every other. Red mode: red ink, the mint
   star stays mint. Reduce Motion: no drift. Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, E = GJ.oz3d; if (!E) return;
  var HZ = 628, REF = { o: [338, 486, 156, 30], zt: 352, zb: 610, zl: 578, zr: 806 }, MINT = [62, 230, 176];
  var P = (function () {   // the reference's dots, spacing 1
    var a = [], k; function add(x, y, m) { a.push({ x: x, y: y, m: !!m }); }
    for (k = 0; k < 30; k++) { var t = -Math.PI / 2 + 2 * Math.PI * k / 30; add(REF.o[0] + REF.o[2] * Math.cos(t), REF.o[1] + REF.o[2] * Math.sin(t)); }
    for (k = 0; k < 7; k++) add(REF.zl + (REF.zr - REF.zl) * k / 7, REF.zt); add(REF.zr, REF.zt, true);
    for (k = 1; k < 12; k++) add(REF.zr + (REF.zl - REF.zr) * k / 11, REF.zt + (REF.zb - REF.zt) * k / 11);
    for (k = 1; k < 8; k++) add(REF.zl + (REF.zr - REF.zl) * k / 7, REF.zb);
    return a;
  })();
  function cam(f) { return { az: -26 + 20 * (f - .5), el: 4 + 52 * f, zoom: .95 + .35 * (1 - f) }; }   // high above at the top, at the water at the bottom
  function draw(cv, f, t) {
    var S = cv.width, H = cv.height, x = cv.getContext('2d'), red = !!(GJ.store && GJ.store.get().red), ink = red ? [255, 90, 74] : [232, 228, 220], glw = red ? [192, 57, 43] : [143, 169, 207];
    var v = E.camera(cam(f), { dist: 2200, eye: 116, elMin: 0, elMax: 85 }), k = S * 1.3 / 1024, depth = (1 - f) * 260;
    x.clearRect(0, 0, S, H); x.save(); x.translate(S / 2 - 500 * k, H / 2 - 470 * k);   // the constellation, centred and filling the window
    for (var i = 0; i < 4; i++) { var z = 2200 * (8 + i * i * 7) / (116 + 8 + i * i * 7), hw = 372 * (1 - z / 2200), a0 = E.proj(v, [v.g[0] * z - v.g[1] * hw, 0, v.g[1] * z + v.g[0] * hw]), a1 = E.proj(v, [v.g[0] * z + v.g[1] * hw, 0, v.g[1] * z - v.g[0] * hw]);
      x.strokeStyle = 'rgba(' + glw.join() + ',' + (.16 - .03 * i) + ')'; x.lineWidth = 1; x.beginPath(); x.moveTo(a0[0] * k, a0[1] * k); x.lineTo(a1[0] * k, a1[1] * k); x.stroke(); }
    var still = GJ.reduced && GJ.reduced();
    P.forEach(function (p, j) {
      var Y = HZ - p.y - depth + (still ? 0 : 4 * Math.sin(t / 900 + j)), w = [p.x - 512, Y, 0]; if (p.m && Y < 16) w[1] = 16;
      var a = Math.max(0, Math.min(1, w[1] / 8)); if (a <= .01) return;
      var q = E.proj(v, w), r = (p.m ? 20 : 7) * q[2] * k, c = p.m ? MINT : ink;
      E.glow(x, c, .45, q[0] * k, q[1] * k, r * 2.2, (p.m ? .5 : .3) * a); E.disc(x, c, q[0] * k, q[1] * k, Math.max(.6, r), a);
      if (!p.m) { var d = E.proj(v, [w[0], -w[1], w[2]]); E.disc(x, ink, d[0] * k, d[1] * k, Math.max(.5, r * .8), .18 * a); }   // its faint reflection
    });
    x.restore();
  }
  // the side dial's own window, while its place's look is "oz"
  var box = document.createElement('div'); box.id = 'ozview'; box.setAttribute('aria-hidden', 'true'); box.innerHTML = '<canvas width="104" height="244"></canvas><b class="jul">depth</b>'; document.body.appendChild(box);
  var cv = box.querySelector('canvas'), last = -1, raf = 0;
  function value() { try { var r = GJ.dial.rings()[0]; return Math.max(0, Math.min(1, (r.get() - r.min) / (r.max - r.min))); } catch (e) { return .5; } }
  function on() { return html.dataset.dstyle === 'oz'; }
  function stick() { var m = document.getElementById('master'); if (!m) return; var r = m.getBoundingClientRect(); box.style.top = r.top + 'px'; box.style.right = (G.innerWidth - r.left + 4) + 'px'; box.style.visibility = r.width && getComputedStyle(m).opacity > .05 ? '' : 'hidden'; }   // rides beside the side dial
  function tick(t) { raf = 0; if (!on()) { last = -1; return; } stick(); var f = value(); if (Math.abs(f - last) > .001 || !(GJ.reduced && GJ.reduced())) { draw(cv, f, t); last = f; } E.use('ozview'); raf = requestAnimationFrame(tick); }
  function wake() { if (on() && !raf) raf = requestAnimationFrame(tick); }
  if (G.MutationObserver) new MutationObserver(wake).observe(html, { attributes: true, attributeFilter: ['data-dstyle'] });
  wake(); if (GJ.dialprefs && GJ.dialprefs.preview) GJ.dialprefs.preview();
  GJ.ozview = { draw: draw, cam: cam, on: on, value: value, stars: function () { return P.length; } };
})(window);
