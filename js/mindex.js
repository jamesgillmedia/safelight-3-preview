/* tools-02 · Motion Index: a clip or screenshots as an index sheet, on this device. */
(function (G) {
  'use strict';
  var GJ = G.GJ, clamp = GJ.clamp, html = document.documentElement;
  var el = document.createElement('section'); el.id = 'mindex'; el.setAttribute('aria-label', 'motion index');
  el.innerHTML = '<b class="jul">motion index</b><p class="mi-say">a clip as stills, where something changes — it never leaves your phone</p>' +
    '<div class="mi-src" role="group" aria-label="what to index"><button data-s="clip" class="on" aria-pressed="true">clip</button><button data-s="shots" aria-pressed="false">screenshots</button></div>' +
    '<label class="mi-pick"><input type="file" accept="video/*" hidden><span>choose a clip</span></label>' +
    '<div class="mi-opts"><span>density</span><button data-d="0">fewer</button><button data-d="1" class="on">mid</button><button data-d="2">more</button>' +
    '<i class="mi-brk"></i><span>layout</span><button data-l="grid" class="on">grid</button><button data-l="strip">strip</button><button data-l="shots">by shot</button></div>' +
    '<video class="mi-v" muted playsinline></video><img class="mi-p" alt="the screenshot you tapped" hidden><i class="mi-bar"><i></i></i><p class="mi-out"></p>' +
    '<div class="mi-sheet" tabindex="0" aria-label="the index sheet: tap a frame to see it move"></div>' +
    '<div class="mi-act"><button class="mi-go" disabled>index</button><a class="mi-s" data-k="pdf" hidden download>pdf</a><a class="mi-s" data-k="png" hidden download>png</a><a class="mi-s" data-k="json" hidden download>json</a><a class="mi-s" data-k="zip" hidden download>all</a><button class="mi-x">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); };
  var inp = q('input'), vid = q('.mi-v'), bar = q('.mi-bar i'), out = q('.mi-out'), go = q('.mi-go'), sheetBox = q('.mi-sheet');
  var file = null, name = 'clip', busy = false, S = [], K = [], shots = [], meta = null, density = 1, layout = 'grid', sheet = null, boxes = [], sel = -1, urls = {};
  var TARGET = [14, 24, 40], AW = 64, AH = 36, stills = false, pics = [], prev = q('.mi-p'), srcMode = 'clip';

  function open() { html.classList.add('mindexing'); GJ.haptic && GJ.haptic.tick(); }
  function close() { if (busy) return; html.classList.remove('mindexing'); try { vid.pause(); } catch (e) {} if (GJ.dial.popped()) GJ.dial.close(); }
  q('.mi-x').addEventListener('click', close);
  function tc(t) { var m = Math.floor(t / 60), s = t - m * 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
  function hex(c) { return '#' + c.slice(0, 3).map(function (v) { return ('0' + Math.round(clamp(v, 0, 255)).toString(16)).slice(-2); }).join(''); }

  /* ---------- 1. the pass: every sample's luma, colours, change and camera move ---------- */
  var ac = document.createElement('canvas'); ac.width = AW; ac.height = AH; var ag = ac.getContext('2d', { willReadFrequently: true });
  function half(y) { var o = new Float32Array(32 * 18); for (var j = 0; j < 18; j++) for (var i = 0; i < 32; i++) { var a = (j * 2) * AW + i * 2; o[j * 32 + i] = (y[a] + y[a + 1] + y[a + AW] + y[a + AW + 1]) / 4; } return o; }
  function sad(A, B, sx, sy, x0, x1) {
    var s = 0, n = 0; for (var y = Math.max(0, -sy); y < Math.min(18, 18 - sy); y++) for (var x = Math.max(x0, -sx); x < Math.min(x1, 32 - sx); x++) { s += Math.abs(B[y * 32 + x] - A[(y + sy) * 32 + x + sx]); n++; }
    return n ? s / n : 255;
  }
  function best(A, B, x0, x1, R) { var b = { s: 1e9, x: 0, y: 0 }; for (var sy = -R; sy <= R; sy++) for (var sx = -R; sx <= R; sx++) { var v = sad(A, B, sx, sy, x0, x1) + .08 * (Math.abs(sx) + Math.abs(sy)); if (v < b.s) b = { s: v, x: sx, y: sy }; } return b; }
  function sample(t) {
    ag.drawImage(vid, 0, 0, AW, AH); var d = ag.getImageData(0, 0, AW, AH).data, y = new Uint8Array(AW * AH), H = {}, i, k;
    for (i = 0, k = 0; i < d.length; i += 4, k++) { y[k] = (d[i] * 54 + d[i + 1] * 183 + d[i + 2] * 19) >> 8; var key = (d[i] >> 6) << 4 | (d[i + 1] >> 6) << 2 | (d[i + 2] >> 6), h = H[key] || (H[key] = [0, 0, 0, 0]); h[0]++; h[1] += d[i]; h[2] += d[i + 1]; h[3] += d[i + 2]; }
    var cols = Object.keys(H).map(function (kk) { var h2 = H[kk]; return [h2[0], h2[1] / h2[0], h2[2] / h2[0], h2[3] / h2[0]]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 3).map(function (c) { return [c[1], c[2], c[3], c[0] / (AW * AH)]; });
    var hist = new Float32Array(64); Object.keys(H).forEach(function (kk) { hist[+kk] = H[kk][0] / (AW * AH); });
    var o = { t: t, y: y, h: half(y), hist: hist, cols: cols, diff: 0, dx: 0, dy: 0, zm: 0, res: 0, hd: 0, cut: false, type: 'still', speed: 0 }, p = S[S.length - 1];
    if (p) {
      var s = 0; for (k = 0; k < y.length; k++) s += Math.abs(y[k] - p.y[k]); o.diff = s / y.length;
      for (k = 0; k < 64; k++) o.hd += Math.abs(hist[k] - p.hist[k]);
      var all = best(p.h, o.h, 0, 32, 6), l = best(p.h, o.h, 0, 12, 4), r = best(p.h, o.h, 20, 32, 4), still = sad(p.h, o.h, 0, 0, 0, 32);
      o.res = all.s; o.still = still;
      if (still > 1.2 && all.s < still * .72 && (all.x || all.y)) { o.dx = all.x; o.dy = all.y; }
      if (still > 1.2 && l.s < still * .8 && r.s < still * .8 && Math.abs(l.x - r.x) >= 2 && Math.abs(all.x) <= 1) o.zm = l.x - r.x;
    }
    S.push(o); return o;
  }
  function classify() {
    var recent = [];
    S.forEach(function (o, i) {
      if (!i) { o.cut = true; o.type = 'start'; return; }
      var med = recent.length ? recent.slice().sort(function (a, b) { return a - b; })[recent.length >> 1] : 2;
      o.cut = (o.diff > 16 && o.res > 10 && o.res > 2.6 * Math.max(2, med) && o.hd > .45) || o.hd > 1.25;
      if (o.cut) { o.type = 'cut'; recent = []; return; }
      recent.push(o.res); if (recent.length > 12) recent.shift();
      o.speed = clamp(Math.max(Math.hypot(o.dx, o.dy) / 6, Math.abs(o.zm) / 5, o.diff / 40), 0, 1);
      o.type = o.zm >= 2 ? 'push in' : o.zm <= -2 ? 'pull out' : (o.dx || o.dy) ? (Math.abs(o.dx) >= Math.abs(o.dy) ? (o.dx > 0 ? 'pan right' : 'pan left') : (o.dy > 0 ? 'tilt down' : 'tilt up')) : o.diff > 5 ? 'move' : 'still';
    });
  }
  function run() {
    return new Promise(function (done) {
      S = []; var dur = isFinite(vid.duration) ? vid.duration : 0, step = Math.max(1 / 8, dur / 900), last = -1, lastProg = GJ.now(), ended = false, rate = dur > 30 ? 8 : 4;
      function take(t) { if (t - last >= step - 1e-3 || last < 0) { last = t; sample(t); lastProg = GJ.now(); if (dur) bar.style.width = (t / dur * 70).toFixed(1) + '%'; } }
      function fin() { if (ended) return; ended = true; clearInterval(guard); try { vid.pause(); } catch (e) {} done(); }
      var rv = vid.requestVideoFrameCallback ? function loop() { vid.requestVideoFrameCallback(function (n, m) { if (ended) return; take(m.mediaTime); loop(); }); } : function loop() { if (ended) return; if (!vid.paused && vid.readyState >= 2) take(vid.currentTime); requestAnimationFrame(loop); };
      var guard = setInterval(function () { if (vid.ended || GJ.now() - lastProg > 4000) fin(); }, 200);
      vid.onended = fin; vid.muted = true; vid.currentTime = 0;
      try { vid.playbackRate = rate; } catch (e) { try { vid.playbackRate = 2; } catch (e2) {} }
      vid.play().then(function () { rv(); }, function () { fin(); });
    });
  }

  /* ---------- 2. which frames to keep ---------- */
  function pick() {
    var n = S.length; K = []; shots = []; if (!n) return;
    var w = S.map(function (o, i) { return i ? Math.min(40, o.diff) / 10 + (o.t - S[i - 1].t) * .15 : 0; });
    function keep(th) { var k = [], acc = 0; for (var i = 0; i < n; i++) { if (S[i].cut) { k.push(i); acc = 0; } else { acc += w[i]; if (acc >= th) { k.push(i); acc = 0; } } } return k; }
    var want = clamp(TARGET[density], 12, 48), lo = .01, hi = 400, k = keep(1);
    for (var it = 0; it < 26; it++) { var mid = Math.sqrt(lo * hi); k = keep(mid); if (k.length > want) lo = mid; else hi = mid; }
    k = keep(hi); if (k.length < 12) k = keep(lo); if (k.length > 48) { var cuts = k.filter(function (i) { return S[i].cut; }), rest = k.filter(function (i) { return !S[i].cut; }), room = Math.max(0, 48 - cuts.length); k = cuts.slice(0, 48).concat(rest.filter(function (x, j) { return Math.floor(j * room / rest.length) !== Math.floor((j - 1) * room / rest.length); })).sort(function (a, b) { return a - b; }); }
    var sh = 0; K = k.map(function (i) { if (S[i].cut) sh++; return { i: i, t: S[i].t, shot: sh, cut: S[i].cut && i > 0, s: S[i], img: null }; });
    K.forEach(function (f, j) { var end = j + 1 < K.length ? K[j + 1].i : n - 1, bestS = null; for (var i = f.i + 1; i <= end && i < n; i++) if (!S[i].cut && (!bestS || S[i].speed > bestS.speed)) bestS = S[i];
      f.move = bestS && bestS.type !== 'still' ? { type: bestS.type, speed: bestS.speed, dx: bestS.dx, dy: bestS.dy, zoom: bestS.zm } : { type: 'still', speed: 0, dx: 0, dy: 0, zoom: 0 }; });
    for (var s2 = 1; s2 <= sh; s2++) { var fs = K.filter(function (f) { return f.shot === s2; }), acc = {}; fs.forEach(function (f) { f.s.cols.forEach(function (c) { var key = (c[0] >> 5) + ',' + (c[1] >> 5) + ',' + (c[2] >> 5), a = acc[key] || (acc[key] = [0, 0, 0, 0]); a[0] += c[3]; a[1] += c[0] * c[3]; a[2] += c[1] * c[3]; a[3] += c[2] * c[3]; }); });
      var cols = Object.keys(acc).map(function (kk) { var a = acc[kk]; return [a[1] / a[0], a[2] / a[0], a[3] / a[0], a[0]]; }).sort(function (a, b) { return b[3] - a[3]; }).slice(0, 5);
      shots.push({ n: s2, from: fs[0].t, to: fs[fs.length - 1].t, frames: fs.length, cols: cols }); }
  }
  function seek(t) { return new Promise(function (ok) { var done = false, fin = function () { if (done) return; done = true; vid.removeEventListener('seeked', fin); ok(); }; vid.addEventListener('seeked', fin); setTimeout(fin, 1600); try { vid.currentTime = t; } catch (e) { fin(); } }); }
  function grab() {   // the kept frames again, at sheet size: exact pixels from the source, only scaled
    var vw = vid.videoWidth || 1280, vh = vid.videoHeight || 720, W = Math.min(480, vw), H = Math.round(W * vh / vw), i = 0;
    try { vid.pause(); vid.playbackRate = 1; } catch (e) {}
    return (function next() {
      if (i >= K.length) return Promise.resolve();
      var f = K[i++]; return seek(f.t).then(function () { var c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(vid, 0, 0, W, H); f.img = c; bar.style.width = (70 + i / K.length * 30).toFixed(1) + '%'; return next(); });
    })();
  }

  /* ---------- 3. the sheet ---------- */
  var INK = '#e8e4dc', META = 'rgba(232,228,220,.62)', PAGE = '#05090f';
  function arrow(g, x, y, w, mv) {   // the motion strip under a frame: which way the camera went, and how fast
    g.strokeStyle = META; g.fillStyle = META; g.lineWidth = 2; var cx = x + w / 2, L = 10 + mv.speed * (w * .34);
    if (mv.type === 'still') { g.beginPath(); g.arc(cx, y, 2, 0, 6.283); g.fill(); return; }
    if (mv.type === 'move') { g.beginPath(); g.moveTo(cx - L, y); g.lineTo(cx + L, y); g.setLineDash([3, 5]); g.stroke(); g.setLineDash([]); return; }
    if (mv.type === 'push in' || mv.type === 'pull out') { var o = mv.type === 'push in' ? 1 : -1; [-1, 1].forEach(function (sd) { var a = cx + sd * 6, b = cx + sd * (6 + L); g.beginPath(); g.moveTo(a, y); g.lineTo(b, y); g.stroke(); var tip = o > 0 ? b : a, dir = o > 0 ? sd : -sd; g.beginPath(); g.moveTo(tip, y); g.lineTo(tip - dir * 7, y - 4); g.lineTo(tip - dir * 7, y + 4); g.closePath(); g.fill(); }); return; }
    var hx = mv.type === 'pan right' ? 1 : mv.type === 'pan left' ? -1 : 0, hy = mv.type === 'tilt down' ? 1 : mv.type === 'tilt up' ? -1 : 0, Lv = hy ? Math.min(L, 9) : L;
    g.beginPath(); g.moveTo(cx - hx * Lv, y - hy * Lv); g.lineTo(cx + hx * Lv, y + hy * Lv); g.stroke();
    var tx = cx + hx * Lv, ty = y + hy * Lv; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx - hx * 7 - hy * 4, ty - hy * 7 - hx * 4); g.lineTo(tx - hx * 7 + hy * 4, ty - hy * 7 + hx * 4); g.closePath(); g.fill();
  }
  function colourBar(g, x, y, w, cols) { var tot = cols.reduce(function (a, c) { return a + c[3]; }, 0) || 1, px = x; cols.forEach(function (c) { var ww = w * c[3] / tot; g.fillStyle = hex(c); g.fillRect(px, y, Math.ceil(ww), 6); px += ww; }); }
  function render(lay, pageFrames) {   // → { canvas, boxes }
    var F2 = pageFrames || K, fa = F2[0] && F2[0].img ? F2[0].img.height / F2[0].img.width : 9 / 16, portrait = fa > 1.1;
    var cols = lay === 'strip' ? 1 : portrait ? 6 : 4, M = 44, gap = 16, W = lay === 'strip' ? 620 : 1240, cw = (W - 2 * M - (cols - 1) * gap) / cols, ch = cw * fa, rowH = ch + 58, head = 96;
    var rows = [], cur = []; F2.forEach(function (f, j) { if (cur.length === cols || (lay === 'shots' && f.cut && cur.length)) { rows.push(cur); cur = []; } cur.push(f); }); if (cur.length) rows.push(cur);
    var c = document.createElement('canvas'); c.width = W; c.height = Math.round(head + rows.length * rowH + 54); var g = c.getContext('2d'), bx = [];
    g.fillStyle = PAGE; g.fillRect(0, 0, c.width, c.height); g.textBaseline = 'alphabetic';
    g.fillStyle = INK; g.font = '400 22px "Julius Sans One", Poppins, sans-serif'; try { g.letterSpacing = '5px'; } catch (e) {} g.fillText('MOTION INDEX', M, 46); try { g.letterSpacing = '0px'; } catch (e) {}
    g.fillStyle = META; g.font = '300 15px Poppins, sans-serif'; g.fillText(name + (stills ? '' : ' · ' + tc(meta.duration)) + ' · ' + K.length + ' frames · ' + shots.length + (shots.length === 1 ? ' shot' : ' shots') + ' · ' + meta.width + ' × ' + meta.height, M, 72);
    rows.forEach(function (row, ri) {
      var y = head + ri * rowH;
      row.forEach(function (f, ci) {
        var x = M + ci * (cw + gap);
        if (f.img) g.drawImage(f.img, x, y, cw, ch); else { g.strokeStyle = META; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, cw - 1, ch - 1); }
        if (f.cut) { g.fillStyle = INK; g.fillRect(x - gap / 2 - 1, y - 4, 2, ch + 8); }                                    // a cut: a hairline before its first frame
        g.fillStyle = INK; g.font = '300 14px Poppins, sans-serif'; g.fillText(f.lab || tc(f.t), x, y + ch + 20);
        if (f.cut || f.s.type === 'start') { g.fillStyle = META; g.textAlign = 'right'; g.fillText('shot ' + f.shot, x + cw, y + ch + 20); g.textAlign = 'left'; }
        arrow(g, x, y + ch + 34, cw, f.move);
        var sh = shots[f.shot - 1]; if (sh) colourBar(g, x, y + ch + 44, cw + (ci + 1 < row.length && row[ci + 1].shot === f.shot ? gap : 0), sh.cols);   // the shot's own colours, run under all of its frames
        bx.push({ k: K.indexOf(f), x: x, y: y, w: cw, h: ch });
      });
    });
    g.fillStyle = META; g.font = '300 12px Poppins, sans-serif'; g.fillText('safelight · motion index · frames are exact pixels from the ' + (stills ? 'screenshots' : 'clip') + ', only scaled · made on this device', M, c.height - 22);
    return { canvas: c, boxes: bx };
  }
  function cover() {   // the whole piece as one strip
    var n = K.length, W = 1240, M = 44, fa = K[0] && K[0].img ? K[0].img.height / K[0].img.width : 9 / 16, cw = (W - 2 * M) / n, ch = Math.min(260, cw * fa * (fa > 1.1 ? 1 : 2.4)), c = document.createElement('canvas'); c.width = W; c.height = Math.round(150 + ch + 70);
    var g = c.getContext('2d'); g.fillStyle = PAGE; g.fillRect(0, 0, W, c.height); g.fillStyle = INK; g.font = '400 26px "Julius Sans One", Poppins, sans-serif'; try { g.letterSpacing = '6px'; } catch (e) {} g.fillText(name.toUpperCase().slice(0, 40), M, 60); try { g.letterSpacing = '0px'; } catch (e) {}
    g.fillStyle = META; g.font = '300 15px Poppins, sans-serif'; g.fillText('motion index · ' + (stills ? '' : tc(meta.duration) + ' · ') + n + ' frames · ' + shots.length + (shots.length === 1 ? ' shot' : ' shots') + ' · ' + new Date().toISOString().slice(0, 10), M, 90);
    K.forEach(function (f, j) { var x = M + j * cw; if (f.img) { var sw = Math.min(f.img.width, f.img.height * cw / ch), sx = (f.img.width - sw) / 2; g.drawImage(f.img, sx, 0, sw, f.img.height, x, 130, Math.ceil(cw), ch); } if (f.cut) { g.fillStyle = INK; g.fillRect(x - 1, 122, 2, ch + 16); } });
    shots.forEach(function (sh) { var fs = K.filter(function (f) { return f.shot === sh.n; }), x0 = M + K.indexOf(fs[0]) * cw; colourBar(g, x0, 130 + ch + 12, fs.length * cw, sh.cols); });
    return c;
  }
  function tiles() {   // 4 × 4 at 1024 px: one image a vision model can take whole
    var o = [], fa = K[0] && K[0].img ? K[0].img.height / K[0].img.width : 9 / 16;
    for (var p = 0; p < K.length; p += 16) { var c = document.createElement('canvas'), cw = 256, ch = Math.round(cw * fa), rows = Math.ceil(Math.min(16, K.length - p) / 4); c.width = 1024; c.height = rows * (ch + 24); var g = c.getContext('2d'); g.fillStyle = PAGE; g.fillRect(0, 0, c.width, c.height);
      K.slice(p, p + 16).forEach(function (f, j) { var x = (j % 4) * cw, y = Math.floor(j / 4) * (ch + 24); if (f.img) g.drawImage(f.img, x, y, cw, ch); g.fillStyle = INK; g.font = '300 13px Poppins, sans-serif'; g.fillText((p + j + 1) + ' · ' + (f.lab || tc(f.t)) + ' · shot ' + f.shot + (f.move.type !== 'still' ? ' · ' + f.move.type : ''), x + 6, y + ch + 16); });
      o.push(c); }
    return o;
  }
  function sidecar(tileNames) {
    return { tool: 'safelight · motion index', made: new Date().toISOString(), source: stills ? 'screenshots' : 'clip', note: stills ? 'frames are the screenshots themselves, exact pixels, only scaled; in the order they were taken' : 'frames are exact pixels from the clip, only scaled; picked where something changes, on the device',
      clip: { name: name, seconds: +meta.duration.toFixed(3), width: meta.width, height: meta.height }, density: ['fewer', 'mid', 'more'][density], layout: layout,
      shots: shots.map(function (s) { return { shot: s.n, from: tc(s.from), to: tc(s.to), frames: s.frames, colours: s.cols.map(hex) }; }),
      frames: K.map(function (f, j) { return { frame: j + 1, name: f.lab || undefined, seconds: +f.t.toFixed(3), timecode: tc(f.t), shot: f.shot, cut: !!f.cut, motion: f.move.type, speed: +f.move.speed.toFixed(2), colours: f.s.cols.map(hex) }; }),
      tiles: tileNames || [] };
  }

  /* ---------- 4. out: PDF, PNG, JSON, or all in one zip (js/out.js: written by hand, no library) ---------- */
  var blobOf = GJ.out.blobOf, bytes = GJ.out.bytes, enc = GJ.out.enc, pdf = GJ.out.pdf, zip = GJ.out.zip;   // js/out.js: the PDF and zip writers
  function exportAll() {
    var base = name.replace(/\.[^.]+$/, '').replace(/[^\w\-]+/g, '-').slice(0, 40) || 'clip', T = tiles(), tn = T.map(function (c, i) { return base + '-tile-' + ('0' + (i + 1)).slice(-2) + '.png'; }), cov = cover(), js = JSON.stringify(sidecar(tn), null, 1);
    return Promise.all([blobOf(cov, 'image/jpeg', .9).then(bytes), blobOf(sheet, 'image/jpeg', .9).then(bytes), blobOf(sheet, 'image/png').then(bytes), Promise.all(T.map(function (c) { return blobOf(c, 'image/png').then(bytes); }))]).then(function (r) {
      var P = pdf([{ jpg: r[0], w: cov.width, h: cov.height }, { jpg: r[1], w: sheet.width, h: sheet.height }]);
      return bytes(P).then(function (pb) {
        var files = [{ name: base + '-index.pdf', data: pb }, { name: base + '-index.png', data: r[2] }, { name: base + '-index.json', data: enc(js) }].concat(r[3].map(function (d, i) { return { name: tn[i], data: d }; }));
        Object.keys(urls).forEach(function (k) { try { URL.revokeObjectURL(urls[k]); } catch (e) {} });
        var B = { pdf: P, png: new Blob([r[2]], { type: 'image/png' }), json: new Blob([js], { type: 'application/json' }), zip: zip(files) }, ext = { pdf: '-index.pdf', png: '-index.png', json: '-index.json', zip: '-motion-index.zip' };
        [].forEach.call(el.querySelectorAll('.mi-s'), function (a) { var k = a.dataset.k; urls[k] = URL.createObjectURL(B[k]); a.href = urls[k]; a.download = base + ext[k]; a.hidden = false; });
        result = { pdf: B.pdf.size, png: B.png.size, json: js, zip: B.zip.size, zipFiles: files.map(function (f) { return f.name; }), tiles: T.length, blobs: B };
      });
    });
  }
  var result = null;

  /* ---------- 5. the tool ---------- */
  function show() {
    var r = render(layout); sheet = r.canvas; boxes = r.boxes; sheetBox.innerHTML = ''; sheet.className = 'mi-c'; sheetBox.appendChild(sheet); sel = -1;
    out.textContent = stills ? K.length + ' screenshots · ' + shots.length + (shots.length === 1 ? ' group' : ' groups') + ' · tap one to see it large' : K.length + ' frames · ' + shots.length + (shots.length === 1 ? ' shot' : ' shots') + ' · ' + tc(meta.duration) + ' · tap a frame to see it move';
  }
  function index() {
    if (!file || busy) return Promise.resolve(false); if (stills) return indexStills(); busy = true; go.disabled = true; html.classList.add('mi-busy'); result = null; bar.style.width = '0';
    [].forEach.call(el.querySelectorAll('.mi-s'), function (a) { a.hidden = true; }); out.textContent = 'reading the clip…';
    return run().then(function () {
      meta = { duration: isFinite(vid.duration) && vid.duration ? vid.duration : (S.length ? S[S.length - 1].t : 0), width: vid.videoWidth, height: vid.videoHeight };
      if (S.length < 2) throw new Error('short'); classify(); pick(); out.textContent = 'taking ' + K.length + ' frames…'; return grab();
    }).then(function () { show(); return exportAll(); }).then(function () {
      busy = false; go.disabled = false; html.classList.remove('mi-busy'); bar.style.width = '100%'; el.dataset.done = '1'; GJ.haptic && GJ.haptic.commit(); dial(); return true;
    }, function () { busy = false; go.disabled = false; html.classList.remove('mi-busy'); out.textContent = 'the clip would not play here'; return false; });
  }
  function relay() { if (!K.length || busy) return; if (K.some(function (f) { return !f.img; })) return; show(); exportAll(); }
  function repick() {   // a new density: the pass is kept; only the frames are chosen and taken again
    if (!S.length || busy) return Promise.resolve(); busy = true; html.classList.add('mi-busy'); pick(); out.textContent = 'taking ' + K.length + ' frames…';
    return grab().then(function () { show(); return exportAll(); }).then(function () { busy = false; html.classList.remove('mi-busy'); bar.style.width = '100%'; });
  }
  /* ---------- screenshots: the stills are the frames ---------- */
  function decode(f) { return new Promise(function (ok, no) { var im = new Image(), u = URL.createObjectURL(f); im.onload = function () { ok({ im: im, f: f, u: u }); }; im.onerror = function () { URL.revokeObjectURL(u); no(new Error('picture')); }; im.src = u; }); }
  function colsOf(c) {
    var t = document.createElement('canvas'); t.width = t.height = 16; var x = t.getContext('2d'); x.drawImage(c, 0, 0, 16, 16); var d = x.getImageData(0, 0, 16, 16).data, acc = {};
    for (var i = 0; i < d.length; i += 4) { var k = (d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5), a = acc[k] || (acc[k] = [0, 0, 0, 0]); a[0]++; a[1] += d[i]; a[2] += d[i + 1]; a[3] += d[i + 2]; }
    return Object.keys(acc).map(function (k) { var a = acc[k]; return [a[1] / a[0], a[2] / a[0], a[3] / a[0], a[0]]; }).sort(function (a, b) { return b[3] - a[3]; }).slice(0, 5);
  }
  function loadStills(files) {
    var list = [].slice.call(files || []).filter(function (f) { return f && (!f.type || f.type.indexOf('image') === 0); }); if (!list.length) return false;
    var ts = list.map(function (f) { return f.lastModified || 0; }), timed = Math.max.apply(null, ts) - Math.min.apply(null, ts) > 3000;
    list.sort(function (a, b) { return (timed ? (a.lastModified || 0) - (b.lastModified || 0) : 0) || String(a.name).localeCompare(String(b.name), undefined, { numeric: true }); });
    pics.forEach(function (p) { if (p.u) try { URL.revokeObjectURL(p.u); } catch (e) {} }); pics = list.slice(0, 48).map(function (f) { return { f: f, timed: timed }; });
    stills = true; file = pics[0].f; name = pics.length + (pics.length === 1 ? ' screenshot' : ' screenshots'); result = null; S = []; K = []; el.dataset.done = ''; sheetBox.innerHTML = ''; bar.style.width = '0'; prev.hidden = true;
    [].forEach.call(el.querySelectorAll('.mi-s'), function (a) { a.hidden = true; }); try { vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) {}
    out.textContent = name + (list.length > 48 ? ' · the first 48 of ' + list.length : '') + ' · in the order they were taken'; go.disabled = false; return true;
  }
  function indexStills() {
    busy = true; go.disabled = true; html.classList.add('mi-busy'); result = null; bar.style.width = '10%'; out.textContent = 'reading the screenshots…';
    return Promise.all(pics.map(function (p) { return decode(p.f); })).then(function (ims) {
      var w0 = ims[0].im.naturalWidth || 1, h0 = ims[0].im.naturalHeight || 1, W = Math.min(480, w0), H = Math.round(W * h0 / w0), t0 = ims[0].f.lastModified || 0, sh = 1; shots = [];
      K = ims.map(function (o, i) {
        var w = o.im.naturalWidth, h = o.im.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'); g.fillStyle = PAGE; g.fillRect(0, 0, W, H);
        var sc = Math.min(W / w, H / h), dw = w * sc, dh = h * sc; g.drawImage(o.im, (W - dw) / 2, (H - dh) / 2, dw, dh);                     // whole, never cropped
        var t = pics[i].timed ? Math.max(0, ((o.f.lastModified || 0) - t0) / 1000) : i, pv = i ? ims[i - 1] : null;
        var cut = !!pv && (pv.im.naturalWidth !== w || pv.im.naturalHeight !== h || (pics[i].timed && (o.f.lastModified - pv.f.lastModified) > 90000)); if (cut) sh++;
        pics[i].u = o.u; return { i: i, t: t, shot: sh, cut: cut, s: { cols: colsOf(c), type: i ? 'still' : 'start' }, img: c, move: { type: 'still', speed: 0, dx: 0, dy: 0, zoom: 0 }, lab: String(o.f.name || ('screenshot ' + (i + 1))).replace(/\.[^.]+$/, '').slice(0, 16), url: o.u };
      });
      for (var n = 1; n <= sh; n++) { var fs = K.filter(function (f) { return f.shot === n; }), acc = []; fs.forEach(function (f) { acc = acc.concat(f.s.cols); }); acc.sort(function (a, b) { return b[3] - a[3]; }); shots.push({ n: n, from: fs[0].t, to: fs[fs.length - 1].t, frames: fs.length, cols: acc.slice(0, 5) }); }
      meta = { duration: K[K.length - 1].t, width: w0, height: h0 }; bar.style.width = '70%'; show(); return exportAll();
    }).then(function () { busy = false; go.disabled = false; html.classList.remove('mi-busy'); bar.style.width = '100%'; el.dataset.done = '1'; GJ.haptic && GJ.haptic.commit(); dial(); return true; },
      function () { busy = false; go.disabled = false; html.classList.remove('mi-busy'); out.textContent = 'one of those would not open as a picture here'; return false; });
  }
  function setSrc(m) { srcMode = m === 'shots' ? 'shots' : 'clip'; inp.accept = srcMode === 'shots' ? 'image/*' : 'video/*'; inp.multiple = srcMode === 'shots'; q('.mi-pick span').textContent = srcMode === 'shots' ? 'choose screenshots' : 'choose a clip';
    [].forEach.call(el.querySelectorAll('.mi-src button'), function (b) { var o = b.dataset.s === srcMode; b.classList.toggle('on', o); b.setAttribute('aria-pressed', o ? 'true' : 'false'); });
    q('.mi-say').textContent = srcMode === 'shots' ? 'screenshots as one sheet, in the order they were taken — they never leave your phone' : 'a clip as stills, where something changes — it never leaves your phone'; }
  q('.mi-src').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || busy) return; setSrc(b.dataset.s); GJ.haptic && GJ.haptic.tick(); });
  function take(files) { var l = [].slice.call(files || []); if (!l.length) return; if (l.some(function (f) { return f.type && f.type.indexOf('video') === 0; }) || (srcMode === 'clip' && !l.every(function (f) { return f.type && f.type.indexOf('image') === 0; }))) load(l[0]); else loadStills(l); }
  function load(f, nm) {
    stills = false; prev.hidden = true; file = f; name = (nm || f.name || 'clip'); result = null; S = []; K = []; el.dataset.done = ''; sheetBox.innerHTML = ''; bar.style.width = '0';
    [].forEach.call(el.querySelectorAll('.mi-s'), function (a) { a.hidden = true; });
    vid.src = URL.createObjectURL(f); vid.load(); out.textContent = name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB'; go.disabled = false;
  }
  inp.addEventListener('change', function () { take(inp.files); });
  go.addEventListener('click', function () { index(); });
  q('.mi-opts').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || busy) return;
    [].forEach.call(b.parentNode.querySelectorAll(b.dataset.d != null ? '[data-d]' : '[data-l]'), function (k) { k.classList.toggle('on', k === b); });
    if (b.dataset.d != null) { density = +b.dataset.d; repick(); } else { layout = b.dataset.l; relay(); }
    GJ.haptic && GJ.haptic.tick();
  });
  // tap a frame on the sheet: the clip goes there and plays — back into motion
  function choose(k, play) {
    if (k < 0 || k >= K.length) return; sel = k; var bx = boxes.filter(function (b) { return b.k === k; })[0];
    if (bx) { var g = sheet.getContext('2d'), r = render(layout); sheet.getContext('2d').drawImage(r.canvas, 0, 0); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(bx.x - 2, bx.y - 2, bx.w + 4, bx.h + 4);
      var sc = sheet.clientWidth / sheet.width; sheetBox.scrollTop = Math.max(0, bx.y * sc - 30); }
    if (stills) { prev.src = K[k].url; prev.hidden = false; out.textContent = (k + 1) + ' of ' + K.length + ' · ' + K[k].lab + (shots.length > 1 ? ' · group ' + K[k].shot : ''); return; }
    try { vid.currentTime = K[k].t; if (play) vid.play(); } catch (e) {}
    out.textContent = 'frame ' + (k + 1) + ' of ' + K.length + ' · ' + tc(K[k].t) + ' · shot ' + K[k].shot + ' · ' + K[k].move.type;
  }
  sheetBox.addEventListener('click', function (e) {
    if (!sheet || busy) return; var r = sheet.getBoundingClientRect(), sc = sheet.width / r.width, x = (e.clientX - r.left) * sc, y = (e.clientY - r.top) * sc;
    var hit = boxes.filter(function (b) { return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; })[0]; if (hit) { choose(hit.k, true); GJ.haptic && GJ.haptic.tick(); }
  });
  // the dial, while the sheet is up: SCRUB (frame by frame along the sheet) with DENSITY ⇅ LAYOUT under it
  var LAYS = ['grid', 'strip', 'shots'];
  var SCRUB = { key: 'mi-scrub', label: 'SCRUB', min: 0, max: 1, def: 0, span: 300, unit: .02, get: function () { return K.length > 1 ? Math.max(0, sel) / (K.length - 1) : 0; }, set: function (v) { var k = Math.round(clamp(v, 0, 1) * (K.length - 1)); if (k !== sel) choose(k, false); }, fmt: function () { return sel < 0 ? 'the sheet' : stills ? K[sel].lab : tc(K[sel].t) + ' · ' + K[sel].move.type; } };
  var DENS = { key: 'mi-density', label: 'DENSITY', min: 0, max: 2, def: 1, span: 140, unit: 1, get: function () { return density; }, step: function (v) { return Math.round(v); }, set: function (v, live) { v = Math.round(v); if (v === density) return; density = v; [].forEach.call(el.querySelectorAll('[data-d]'), function (b) { b.classList.toggle('on', +b.dataset.d === v); }); }, commit: function () { repick(); }, notches: function () { return [0, 1, 2]; }, fmt: function (v) { return ['fewer', 'mid', 'more'][Math.round(v)]; } };
  var LAYR = { key: 'mi-layout', label: 'LAYOUT', min: 0, max: 2, def: 0, span: 140, unit: 1, get: function () { return LAYS.indexOf(layout); }, step: function (v) { return Math.round(v); }, set: function (v) { v = LAYS[Math.round(v)]; if (v === layout) return; layout = v; [].forEach.call(el.querySelectorAll('[data-l]'), function (b) { b.classList.toggle('on', b.dataset.l === v); }); relay(); }, notches: function () { return [0, 1, 2]; }, fmt: function (v) { return ['grid', 'strip', 'by shot'][Math.round(v)]; } };
  function dial() { if (!K.length) return; DENS.alt = LAYR; LAYR.alt = DENS; GJ.dial.pop([SCRUB, DENS]); GJ.dial.raise(0); }

  GJ.mindex = { open: open, close: close, load: load, loadStills: loadStills, source: setSrc, index: index, choose: choose, dial: dial,
    setDensity: function (d) { density = clamp(d, 0, 2); [].forEach.call(el.querySelectorAll('[data-d]'), function (b) { b.classList.toggle('on', +b.dataset.d === density); }); return repick(); },
    setLayout: function (l) { layout = l; [].forEach.call(el.querySelectorAll('[data-l]'), function (b) { b.classList.toggle('on', b.dataset.l === l); }); relay(); },
    state: function () { return { stills: stills, source: srcMode, labels: K.map(function (f) { return f.lab || ''; }), busy: busy, samples: S.length, frames: K.length, shots: shots.length, density: density, layout: layout, sel: sel, sheet: sheet ? [sheet.width, sheet.height] : null, done: !!result, times: K.map(function (f) { return +f.t.toFixed(2); }), cuts: K.filter(function (f) { return f.cut; }).map(function (f) { return +f.t.toFixed(2); }), moves: K.map(function (f) { return f.move.type; }), img: K.length && K[0].img ? [K[0].img.width, K[0].img.height] : null }; },
    result: function () { return result; }, sidecar: function () { return sidecar(); },
    // for Compare (js/sweep.js): the kept frames themselves, and the clip's name
    frames: function () { return K.filter(function (f) { return f.img; }).map(function (f) { return { t: f.t, img: f.img, shot: f.shot, move: f.move ? f.move.type : '' }; }); }, clipName: function () { return name; } };
})(window);
