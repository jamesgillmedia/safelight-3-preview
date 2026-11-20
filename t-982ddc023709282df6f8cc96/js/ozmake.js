/* oz next (items 1 and 2) · the object scanner and Scan to Make. Night sky, hairlines, the right-edge camera dial; coverage
   and pattern work as rings and sheets, never a lab-tool chrome. The real capture, coverage, reconstruction, seam finding,
   flattening and tech-pack writing are in-house modules: this calls the `scanner` and `scanToMake` slots and shows what
   they give back (here, their labelled preview stubs). The original video and photos are never touched; material
   previews are labelled previews. Private by default; nothing leaves unless the person shares it.
     GJ.scanner.open() · GJ.make.open(scan) */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, P = GJ.ozone && GJ.ozone.panel, esc = GJ.ozone ? GJ.ozone.esc : String; if (!P) return;
  function priv(n) { return G.oz.private.get(n); }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function red() { return !!store.get().red; }
  function ink(a) { return red() ? 'rgba(255,68,87,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function download(name, text, type) { var b = new Blob([text], { type: type || 'text/plain' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); }

  /* ---------- the model viewer: the camera dial's grammar — drag orbits, hold pushes in, a flick flings, double-tap home ---------- */
  function viewer(cv, opt) {
    var V = { rx: -.35, ry: .6, vx: 0, vy: 0, z: 1, d: null, last: 0, seams: [], tracing: false, swatch: null };
    function cup() { var pts = [], n = 18; for (var j = 0; j <= 6; j++) { var y = -1 + j / 3, r = .78 + .06 * j; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; pts.push([Math.cos(a) * r, y, Math.sin(a) * r]); } } return { pts: pts, n: n, rows: 7 }; }
    var M = cup();
    function pr(p, W, H) { var x = p[0], y = p[1], z = p[2], cy = Math.cos(V.ry), sy = Math.sin(V.ry), cx = Math.cos(V.rx), sx = Math.sin(V.rx);
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx, f = 3.2 / (3.2 + z2), S = Math.min(W, H) * .3 * V.z; return [W / 2 + x1 * S * f, H / 2 + y1 * S * f, z2]; }
    function draw() {
      if (!cv.isConnected) return; var dpr = Math.min(2, G.devicePixelRatio || 1), r = cv.getBoundingClientRect(); if (!r.width) { requestAnimationFrame(draw); return; }
      if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      var g = cv.getContext('2d'), W = r.width, H = r.height; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      if (!V.d) { V.ry += V.vy; V.rx += V.vx; V.vx *= .94; V.vy *= .94; V.rx = Math.max(-1.3, Math.min(1.3, V.rx)); }
      if (V.swatch) { var gg = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.min(W, H) * .5); gg.addColorStop(0, V.swatch + '55'); gg.addColorStop(1, V.swatch + '00'); g.fillStyle = gg; g.fillRect(0, 0, W, H); }   // a material preview sits AROUND the model
      var P2 = M.pts.map(function (p) { return pr(p, W, H); });
      g.lineWidth = 1;
      for (var j = 0; j < M.rows; j++) { g.beginPath(); for (var i = 0; i <= M.n; i++) { var q = P2[j * M.n + (i % M.n)]; if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); } g.strokeStyle = ink(.35 + .1 * (j === 0 || j === M.rows - 1)); g.stroke(); }
      for (var i2 = 0; i2 < M.n; i2 += 2) { g.beginPath(); for (var j2 = 0; j2 < M.rows; j2++) { var q2 = P2[j2 * M.n + i2]; if (j2) g.lineTo(q2[0], q2[1]); else g.moveTo(q2[0], q2[1]); } g.strokeStyle = ink(.2); g.stroke(); }
      V.seams.forEach(function (s) { g.strokeStyle = red() ? 'rgba(255,176,184,.9)' : 'rgba(236,190,120,.9)'; g.lineWidth = 1.6; g.setLineDash([4, 3]); g.beginPath(); s.forEach(function (p, k) { if (k) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); g.setLineDash([]); });
      g.fillStyle = ink(.55); g.font = '300 10.5px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText(opt && opt.label || 'preview stub · placeholder model', W / 2, H - 8);
      requestAnimationFrame(draw);
    }
    var lastTap = 0, holdT = 0;
    cv.addEventListener('pointerdown', function (e) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} var r = cv.getBoundingClientRect(); V.d = { x: e.clientX, y: e.clientY, t: GJ.now(), moved: false };
      if (V.tracing) { V.seams.push([[e.clientX - r.left, e.clientY - r.top]]); return; }
      holdT = setTimeout(function () { if (V.d && !V.d.moved) { V.z = V.z > 1.4 ? 1 : 1.8; hap('commit'); } }, 480);
      if (GJ.now() - lastTap < 300) { V.rx = -.35; V.ry = .6; V.z = 1; V.vx = V.vy = 0; hap('tick'); } lastTap = GJ.now(); });
    cv.addEventListener('pointermove', function (e) { if (!V.d) return; var r = cv.getBoundingClientRect(), dx = e.clientX - V.d.x, dy = e.clientY - V.d.y; if (Math.hypot(dx, dy) > 6) { V.d.moved = true; clearTimeout(holdT); }
      if (V.tracing) { V.seams[V.seams.length - 1].push([e.clientX - r.left, e.clientY - r.top]); return; }
      V.vy = dx * .01; V.vx = dy * .01; V.ry += V.vy; V.rx += V.vx; V.d.x = e.clientX; V.d.y = e.clientY; });
    function up() { clearTimeout(holdT); V.d = null; if (V.tracing && opt && opt.onTrace) opt.onTrace(V.seams); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    requestAnimationFrame(draw);
    return V;
  }

  /* ---------- the object scanner ---------- */
  var SC = priv('scanner'), scan = null, stream = null;
  var scP = P({ id: 'ozscan', title: 'Scan an object', tall: true, sub: 'walk around it, orbit it, or turn it on a turntable · on this phone',
    foot: 'preview stub · coverage and the model are placeholders until the in-house scanner is in',
    build: function (b) {
      b.innerHTML = '<div class="oz-seg" role="radiogroup" aria-label="how you capture"><button data-mode="walk" aria-pressed="true">walk</button><button data-mode="orbit">orbit</button><button data-mode="turntable">turntable</button></div>' +
        '<div class="sc-cap"><video class="sc-live" playsinline muted aria-label="the camera, unchanged"></video><canvas class="sc-rings" aria-label="coverage"></canvas><p class="sc-pct">ready</p></div>' +
        '<div class="oz-grp"><button type="button" class="oz-row" data-a="start">start capture<span>coverage fills on the camera dial ›</span></button><button type="button" class="oz-row" data-a="cancel">cancel</button></div>' +
        '<div class="sc-done" hidden><h3 class="jul">the model</h3><canvas class="sc-model" aria-label="the model: drag to orbit, hold to push in, double-tap home"></canvas>' +
        '<p class="oz-line sc-dims"></p><h3 class="jul">capture sheet</h3><div class="sc-sheet"></div>' +
        '<div class="oz-grp"><button type="button" class="oz-row" data-a="sky">place it in the sky<span>the app’s light around it · never its textures</span></button><button type="button" class="oz-row" data-a="lab">place it in Photo Lab<span>›</span></button>' +
        '<button type="button" class="oz-row" data-a="note">pin a note on it<span>›</span></button><button type="button" class="oz-row" data-a="make">send to Scan to Make<span>›</span></button>' +
        '<button type="button" class="oz-row" data-a="obj">export · OBJ<span>preview stub</span></button><button type="button" class="oz-row" data-a="usdz">export · USDZ<span>not in this preview stub</span></button><button type="button" class="oz-row" data-a="ar">see it at true scale (AR)<span>not in this preview</span></button></div><ul class="sc-notes"></ul></div>';
      var mode = 'walk', rc = b.querySelector('.sc-rings'), pct = b.querySelector('.sc-pct');
      b.querySelector('.oz-seg').addEventListener('click', function (e) { var x = e.target.closest('[data-mode]'); if (!x) return; mode = x.dataset.mode; [].forEach.call(this.children, function (c) { c.setAttribute('aria-pressed', c === x ? 'true' : 'false'); }); hap('tick'); });
      function rings(cov, R) { var dpr = 2, w = rc.clientWidth || 300, h = rc.clientHeight || 200; rc.width = w * dpr; rc.height = h * dpr; var g = rc.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = R.length, cx = w / 2, cy = h / 2, rr = Math.min(w, h) * .4; R.forEach(function (s, i) { var a0 = -Math.PI / 2 + i / n * Math.PI * 2 + .03, a1 = a0 + Math.PI * 2 / n - .06; g.beginPath(); g.arc(cx, cy, rr, a0, a1); g.strokeStyle = s.filled ? ink(.95) : ink(.18); g.lineWidth = s.filled ? 3 : 1.5; g.stroke(); });
        pct.textContent = cov >= 1 ? 'covered · preview stub' : Math.round(cov * 100) + '% covered · preview stub'; }
      rings(0, Array(12).fill({ filled: false }));
      SC.on('coverageChanged', function (x) { if (b.isConnected) rings(x.coverage, x.rings); });
      SC.on('modelReady', function (res) { if (!b.isConnected) return; scan = res; hap('commit'); var d = b.querySelector('.sc-done'); d.hidden = false;
        viewer(b.querySelector('.sc-model'), { label: res.label });
        b.querySelector('.sc-dims').textContent = res.scale ? res.scale.w + ' × ' + res.scale.h + ' × ' + res.scale.d + ' cm · preview stub dimensions' : 'scale not known';
        b.querySelector('.sc-sheet').innerHTML = res.sheet.cells.map(function (c) { return '<figure><i></i><figcaption>' + c.timecode + ' · ' + esc(c.motionLabel) + '</figcaption></figure>'; }).join('');
        if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
        if (GJ.mark && GJ.mark.say) GJ.mark.say('scan ready · preview stub', 1600); });
      b.addEventListener('click', function (e) { var x = e.target.closest('[data-a]'); if (!x) return; var a = x.dataset.a;
        if (a === 'start') { var v = b.querySelector('.sc-live'); try { navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) { stream = s; v.srcObject = s; v.play(); SC.ingest({ video: 'live' }); }, function () {}); } catch (er) {} SC.start({ mode: mode }); hap('commit'); }
        if (a === 'cancel') { SC.cancel(); if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } }
        if (a === 'sky') { SC.placeInEnvironment({ sky: true }); if (GJ.mark && GJ.mark.say) GJ.mark.say('in the sky · its textures untouched · preview stub', 1800); }
        if (a === 'lab') { SC.placeInEnvironment({ room: 'photolab' }); if (GJ.mark && GJ.mark.say) GJ.mark.say('in Photo Lab · preview stub', 1600); }
        if (a === 'note') { var li = document.createElement('li'); li.innerHTML = '<input type="text" placeholder="a note on the model" aria-label="a note on the model">'; b.querySelector('.sc-notes').appendChild(li); li.firstChild.focus(); }
        if (a === 'make') { scP.close(); setTimeout(function () { mk.open(); }, 300); }
        if (a === 'obj') { var o = SC.exportModel({ formats: ['obj'] }); download('scan-preview-stub.obj', o.obj, 'text/plain'); }
        if (a === 'usdz' || a === 'ar') { if (GJ.mark && GJ.mark.say) GJ.mark.say('not in this preview stub', 1400); }
      });
    }, onClose: function () { SC.cancel(); if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } } });

  /* ---------- Scan to Make ---------- */
  var MK = priv('scanToMake'), V2 = null;
  var SW = [['canvas', '#c8b48a'], ['wool felt', '#5a5f6a'], ['waxed cotton', '#4f5a3c'], ['cork', '#b58a5a']];
  var mk = P({ id: 'ozmake', title: 'Scan to Make', tall: true, sub: 'from a scan to the files a maker needs · your design, on this phone',
    foot: 'preview stub · panels, pattern and tech pack are placeholders until the in-house module is in',
    build: function (b) {
      MK.open({ scanId: 'scan', model: scan && scan.previewModel });
      b.innerHTML = '<h3 class="jul">seams</h3><canvas class="sc-model mk-model" aria-label="the model: trace a seam with a finger"></canvas>' +
        '<div class="oz-seg"><button data-a="trace" aria-pressed="false">trace a seam</button><button data-a="confirm">confirm the seams</button><button data-a="sym" aria-pressed="true">symmetry</button></div>' +
        '<h3 class="jul">panels</h3><div class="oz-grp mk-panels"></div>' +
        '<h3 class="jul">pattern · 1:1 with seam allowance</h3><div class="mk-sa"><span>seam allowance</span><input type="range" min="0" max="3" step=".5" value="1" aria-label="seam allowance in centimetres"><b>1 cm</b></div><canvas class="mk-pat" aria-label="the pattern, a preview"></canvas>' +
        '<h3 class="jul">material · a preview around the model</h3><div class="oz-seg mk-sw">' + SW.map(function (s) { return '<button data-sw="' + s[1] + '" aria-pressed="false"><i style="background:' + s[1] + '"></i>' + s[0] + '</button>'; }).join('') + '</div>' +
        '<h3 class="jul">tech pack</h3><div class="oz-grp mk-tp"></div>' +
        '<div class="oz-grp"><button type="button" class="oz-row" data-a="pat">export the pattern<span>SVG · preview stub</span></button><button type="button" class="oz-row" data-a="tp">export the tech pack<span>text · preview stub</span></button><button type="button" class="oz-row" data-a="quote">request a quote<span>a draft you send yourself ›</span></button></div>' +
        '<h3 class="jul">sample rounds</h3><div class="mk-round"><input type="text" class="mk-rn" placeholder="what came back · notes" aria-label="sample round notes"><input type="text" class="mk-rc" placeholder="cost" aria-label="cost"><input type="text" class="mk-rl" placeholder="lead time" aria-label="lead time"><button type="button" data-a="round">add round</button><button type="button" data-a="approve">approve</button></div><ul class="mk-rounds"></ul>';
      V2 = viewer(b.querySelector('.mk-model'), { label: 'your scan · preview stub', onTrace: function (s) { MK.setSeams({ traces: s }); panels(); } });
      function panels() { b.querySelector('.mk-panels').innerHTML = MK.panels().map(function (p) { return '<label class="oz-row"><input type="text" value="' + esc(p.name) + '" data-p="' + p.id + '" aria-label="name of a panel"><span>' + (p.confirmed ? 'seams confirmed' : 'not confirmed') + ' · preview stub</span></label>'; }).join(''); pattern(); tp(); }
      function pattern() { var c = b.querySelector('.mk-pat'), d = 2, w = c.clientWidth || 320, h = 160; c.width = w * d; c.height = h * d; var g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
        var pat = MK.pattern(), x = 10, k = Math.min(4, (w - 40) / pat.pieces.reduce(function (s, p) { return s + p.w + 2 * p.allowance + 4; }, 0));
        pat.pieces.forEach(function (p) { var pw = p.w * k, ph = p.h * k, a = p.allowance * k; g.strokeStyle = ink(.4); g.setLineDash([3, 3]); g.strokeRect(x, 20, pw + 2 * a, ph + 2 * a); g.setLineDash([]); g.strokeStyle = ink(.9); g.strokeRect(x + a, 20 + a, pw, ph);
          g.beginPath(); g.moveTo(x + a + pw / 2, 24 + a); g.lineTo(x + a + pw / 2, 16 + a + ph); g.stroke(); g.fillStyle = ink(.8); g.font = '300 10px Poppins'; g.textAlign = 'center'; g.fillText(p.label, x + a + pw / 2, 20 + a + ph / 2); x += pw + 2 * a + 12; });
        g.fillStyle = ink(.55); g.textAlign = 'left'; g.font = '300 10px Poppins'; g.fillText('preview · not a real pattern · stub', 10, 12); }
      function tp() { var t = MK.techPack(); b.querySelector('.mk-tp').innerHTML = '<p class="oz-line">' + esc(t.label) + '</p>' + t.measurements.map(function (m) { return '<p class="oz-line">' + esc(m[0]) + ' · ' + esc(m[1]) + '</p>'; }).join('') + '<p class="oz-line">material · ' + esc(t.materials.join(', ')) + ' · views · ' + t.views.join(', ') + '</p>'; }
      function rounds() { b.querySelector('.mk-rounds').innerHTML = MK.rounds().map(function (r, i) { return '<li>round ' + (i + 1) + ' · ' + esc(r.notes || '') + (r.cost ? ' · ' + esc(r.cost) : '') + (r.leadTime ? ' · ' + esc(r.leadTime) : '') + (r.approved ? ' · approved' : '') + '</li>'; }).join(''); }
      panels(); rounds();
      b.addEventListener('input', function (e) { if (e.target.dataset.p) { MK.namePanel({ panelId: e.target.dataset.p, name: e.target.value }); tp(); pattern(); }
        if (e.target.type === 'range') { MK.setSeamAllowance(+e.target.value); e.target.nextElementSibling.textContent = e.target.value + ' cm'; pattern(); tp(); } });
      b.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return;
        if (x.dataset.a === 'trace') { V2.tracing = !V2.tracing; x.setAttribute('aria-pressed', V2.tracing ? 'true' : 'false'); }
        if (x.dataset.a === 'confirm') { MK.setSeams({ traces: V2.seams.length ? V2.seams : [['confirmed']] }); panels(); hap('commit'); }
        if (x.dataset.a === 'sym') { var on = x.getAttribute('aria-pressed') !== 'true'; x.setAttribute('aria-pressed', on ? 'true' : 'false'); MK.setSymmetry(on); }
        if (x.dataset.sw) { MK.chooseMaterial({ id: x.textContent }); V2.swatch = x.dataset.sw; [].forEach.call(b.querySelectorAll('[data-sw]'), function (q) { q.setAttribute('aria-pressed', q === x ? 'true' : 'false'); }); tp(); }
        if (x.dataset.a === 'pat') { var pat = MK.pattern(), X = 10, svg = pat.pieces.map(function (p) { var s = '<g><rect x="' + X + '" y="10" width="' + (p.w + 2 * p.allowance) + '" height="' + (p.h + 2 * p.allowance) + '" fill="none" stroke="#999" stroke-dasharray="1 1" stroke-width=".1"/><rect x="' + (X + p.allowance) + '" y="' + (10 + p.allowance) + '" width="' + p.w + '" height="' + p.h + '" fill="none" stroke="#000" stroke-width=".15"/><text x="' + (X + p.allowance + 1) + '" y="' + (12 + p.allowance) + '" font-size="1.2">' + esc(p.label) + ' · preview stub</text></g>'; X += p.w + 2 * p.allowance + 4; return s; }).join('');
          download('pattern-preview-stub.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="' + X + 'cm" height="' + 40 + 'cm" viewBox="0 0 ' + X + ' 40"><!-- preview stub · not a real pattern -->' + svg + '</svg>', 'image/svg+xml'); MK.exportPack({ formats: ['patternPdf'] }); }
        if (x.dataset.a === 'tp') { var t = MK.techPack(); download('tech-pack-preview-stub.txt', 'TECH PACK · ' + t.label + '\n\n' + t.measurements.map(function (m) { return m[0] + ': ' + m[1]; }).join('\n') + '\nmaterials: ' + t.materials.join(', ') + '\nconstruction: ' + t.construction.join('; ') + '\nquantity: ' + t.quantity + '\n'); MK.exportPack({ formats: ['techPackPdf'] }); }
        if (x.dataset.a === 'quote') { location.href = 'mailto:?subject=' + encodeURIComponent('a quote, please · preview stub') + '&body=' + encodeURIComponent('Hello — could you quote this piece? The pattern and tech pack are attached.\n(preview stub · attach the files yourself)'); }
        if (x.dataset.a === 'round') { MK.addSampleRound({ notes: b.querySelector('.mk-rn').value, cost: b.querySelector('.mk-rc').value, leadTime: b.querySelector('.mk-rl').value, photos: [] }); rounds(); }
        if (x.dataset.a === 'approve') { MK.approve({ quantity: 'not set', dates: null }); rounds(); }
      });
    } });
  GJ.scanner = { open: scP.open, close: scP.close, isOpen: scP.isOpen }; GJ.make = { open: mk.open, close: mk.close, isOpen: mk.isOpen };
  GJ.ozone.place({ id: 'scanner', name: 'scan an object', sub: 'a real object, into a model', cl: 'make', open: scP.open });
  GJ.ozone.place({ id: 'scantomake', name: 'scan to make', sub: 'a pattern and a tech pack', cl: 'make', open: mk.open });
})(window);
