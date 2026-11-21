/* oz next (item 6) · the Motion sheet: a clip or a set of stills as a sheet, a long-press in the Archive that opens one,
   a pinch from a sheet into a frame (and on into motion), and Stills to Motion, always labelled generated.
   Every result comes from the `motionIndex` slot (oz.private.get) — here its labelled preview stub. Frames on the sheet
   are drawn exactly as they are, only scaled; the sheet around them is what is styled. js/mindex.js is left as it was.
   Also: GJ.ozone.download(blob, name) and GJ.ozone.pdf(pages) — a plain PDF of JPEG pages, for every export sheet here.
   GJ.motionSheet.open({ name, frames, clip, from }) */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, P = GJ.ozone && GJ.ozone.panel, esc = GJ.ozone ? GJ.ozone.esc : String, tune = document.getElementById('tune'); if (!P) return;
  var MI = G.oz.private.get('motionIndex');
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t, ms) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, ms || 1800); }

  /* ---------- files: a download, and a plain PDF ---------- */
  function download(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.hidden = true; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  function jpeg(c) { var s = atob(c.toDataURL('image/jpeg', .92).split(',')[1]), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function ascii(t) { return String(t).replace(/[·•]/g, '-').replace(/[→]/g, '->').replace(/[^\x20-\x7e]/g, '').replace(/([\\()])/g, '\\$1'); }
  function pdf(pages) {   // pages: [{ canvas, line }] → one page each, the picture fitted, a line of text under it
    var parts = [], off = [], len = 0, objs = [];
    function add(x) { var b = typeof x === 'string' ? new TextEncoder().encode(x) : x; parts.push(b); len += b.length; }
    function obj(n, body) { off[n] = len; add(n + ' 0 obj\n'); body.forEach(add); add('\nendobj\n'); }
    add('%PDF-1.4\n%\xe2\xe3\n');
    var kids = [], n = 4;
    pages.forEach(function (p) { var c = p.canvas, land = c.width > c.height, W = land ? 842 : 595, H = land ? 595 : 842, sc = Math.min((W - 60) / c.width, (H - 90) / c.height), w = c.width * sc, h = c.height * sc, x = (W - w) / 2, y = H - 30 - h;
      var img = jpeg(c), cs = 'q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /Im Do Q BT /F1 9 Tf 30 30 Td (' + ascii(p.line || '') + ') Tj ET';
      objs.push({ pg: n, im: n + 1, ct: n + 2, W: W, H: H, img: img, cs: cs, iw: c.width, ih: c.height }); kids.push(n + ' 0 R'); n += 3; });
    obj(1, ['<< /Type /Catalog /Pages 2 0 R >>']); obj(2, ['<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + kids.length + ' >>']); obj(3, ['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']);
    objs.forEach(function (o) {
      obj(o.pg, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + o.W + ' ' + o.H + '] /Resources << /Font << /F1 3 0 R >> /XObject << /Im ' + o.im + ' 0 R >> >> /Contents ' + o.ct + ' 0 R >>']);
      obj(o.im, ['<< /Type /XObject /Subtype /Image /Width ' + o.iw + ' /Height ' + o.ih + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + o.img.length + ' >>\nstream\n', o.img, '\nendstream']);
      obj(o.ct, ['<< /Length ' + o.cs.length + ' >>\nstream\n' + o.cs + '\nendstream']); });
    var xref = len, N = n; add('xref\n0 ' + N + '\n0000000000 65535 f \n'); for (var i = 1; i < N; i++) add(('000000000' + off[i]).slice(-10) + ' 00000 n \n');
    add('trailer\n<< /Size ' + N + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }
  GJ.ozone.download = download; GJ.ozone.pdf = pdf;
  function drawInto(g, src, x, y, w, h) {   // a frame, contained in the box, exact pixels only scaled
    if (!src) { g.fillStyle = '#2a2d33'; g.fillRect(x, y, w, h); g.fillStyle = '#8a8f99'; g.font = Math.round(h * .09) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('placeholder · preview stub', x + w / 2, y + h / 2); g.textAlign = 'left'; return; }
    var iw = src.naturalWidth || src.videoWidth || src.width, ih = src.naturalHeight || src.videoHeight || src.height; if (!iw || !ih) return;
    var s = Math.min(w / iw, h / ih), dw = iw * s, dh = ih * s; g.fillStyle = '#0b0c0f'; g.fillRect(x, y, w, h); g.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  GJ.ozone.drawInto = drawInto;

  /* ---------- the sheet ---------- */
  var SRC = { name: 'example stills', frames: [], example: true }, SH = null, choosing = false, CHO = [], FRAME = -1, GEN = [], playT = 0, s2m = null;
  var LAYOUTS = [['grid', 'grid'], ['strip', 'strip'], ['rowPerShot', 'a row per shot']], DENS = ['fewer', 'default', 'more'];
  function layoutWord(v) { return (LAYOUTS.filter(function (l) { return l[0] === v; })[0] || LAYOUTS[0])[1]; }
  function examples() { return (G.GJ_SAMPLES || []).slice(0, 12).map(function (s) { var im = new Image(); im.src = s.file; im.alt = ''; return im; }); }
  var sheet = P({ id: 'ozmi', title: 'Motion sheet', tall: true, sub: 'a clip or stills, as a sheet · frames exact, only the sheet around them is styled',
    foot: 'preview stub · evenly spaced placeholder frames · the real picker is not in this build · stays on this phone unless you share it',
    build: function (b) {
      b.innerHTML = '<div class="oz-grp mi-in"><label class="oz-row">a clip<input type="file" accept="video/*" hidden data-k="clip"><span>›</span></label><label class="oz-row">stills<input type="file" accept="image/*" multiple hidden data-k="stills"><span>›</span></label><button type="button" class="oz-row" data-a="ex">example stills<span>marked example</span></button></div>' +
        '<p class="mi-name"></p><video class="mi-clip" controls playsinline hidden></video>' +
        '<div class="oz-seg mi-lay" role="group" aria-label="layout">' + LAYOUTS.map(function (l) { return '<button type="button" data-lay="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>' +
        '<div class="oz-seg mi-den" role="group" aria-label="density">' + DENS.map(function (d) { return '<button type="button" data-den="' + d + '">' + d + '</button>'; }).join('') + '</div>' +
        '<p class="mi-say quiet"></p><div class="mi-grid" role="list"></div>' +
        '<div class="mi-frame" hidden><div class="mi-fv"><canvas aria-label="the frame"></canvas><em class="mi-fl"></em></div><div class="oz-seg"><button type="button" data-f="-1" aria-label="previous frame">‹</button><button type="button" data-f="play">into motion</button><button type="button" data-f="1" aria-label="next frame">›</button><button type="button" data-f="sheet">the sheet</button></div><p class="quiet">pinch in, or tap the sheet, to go back</p></div>' +
        '<div class="oz-seg mi-act"><button type="button" data-a="choose" aria-pressed="false">choose stills</button><button type="button" data-a="s2m">stills to motion</button></div>' +
        '<div class="mi-s2m" hidden></div><div class="mi-gen"></div>' +
        '<h3 class="jul">export</h3><div class="oz-seg mi-exp"><button type="button" data-x="pdf">PDF</button><button type="button" data-x="png">PNG tiles</button><button type="button" data-x="json">JSON</button></div>';
      b.querySelectorAll('input[type=file]').forEach(function (inp) { inp.addEventListener('change', function () { var fs = [].slice.call(inp.files); inp.value = ''; if (!fs.length) return;
        if (inp.dataset.k === 'clip') load({ name: fs[0].name, clip: URL.createObjectURL(fs[0]), frames: [] });
        else Promise.all(fs.map(function (f) { return new Promise(function (r) { var im = new Image(); im.onload = function () { r(im); }; im.onerror = function () { r(null); }; im.src = URL.createObjectURL(f); }); })).then(function (ims) { load({ name: fs.length + ' stills', frames: ims.filter(Boolean) }); }); }); });
      if (!SRC.frames.length && !SRC.clip && SRC.example) SRC.frames = examples();
      run();
    },
    onOpen: function () { dialOn(); }, onClose: function () { dialOff(); clearInterval(playT); } });
  function load(src) { SRC = src; CHO = []; FRAME = -1; if (sheet.isOpen()) run(); else sheet.open(); }
  function run() {
    var b = sheet.body, st = store.get(); if (!b.querySelector('.mi-grid')) return;
    b.querySelector('.mi-name').textContent = (SRC.name || 'a sheet') + (SRC.example ? ' · example' : '') + (SRC.from ? ' · ' + SRC.from : '');
    var v = b.querySelector('.mi-clip'); v.hidden = !SRC.clip; if (SRC.clip && v.src !== SRC.clip) v.src = SRC.clip;
    b.querySelectorAll('[data-lay]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.lay === st.miLayout ? 'true' : 'false'); });
    b.querySelectorAll('[data-den]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.den === st.miDensity ? 'true' : 'false'); });
    b.querySelector('.mi-say').textContent = 'indexing · preview stub';
    MI.index({ source: { name: SRC.name, frames: SRC.frames }, layout: st.miLayout, density: st.miDensity }).then(function (sh) { SH = sh; paint(); });
  }
  function cellCanvas(c, w) { var cv = document.createElement('canvas'), src = c.image, h = Math.round(w * 9 / 16); cv.width = w; cv.height = h; drawInto(cv.getContext('2d'), src, 0, 0, w, h); return cv; }
  function paint() {
    var b = sheet.body, g = b.querySelector('.mi-grid'), st = store.get(); if (!SH) return;
    b.querySelector('.mi-say').textContent = SH.label + ' · ' + SH.cells.length + ' frames · ' + layoutWord(st.miLayout);
    g.className = 'mi-grid mi-' + st.miLayout; g.innerHTML = '';
    var per = st.miLayout === 'strip' ? SH.cells.length : st.miLayout === 'rowPerShot' ? SH.cells.length : 3, rows = [];
    for (var i = 0; i < SH.cells.length; i += per) rows.push(SH.cells.slice(i, i + per).map(function (c, k) { return [c, i + k]; }));
    rows.forEach(function (row) {
      var r = document.createElement('div'); r.className = 'mi-row'; r.setAttribute('role', 'listitem');
      r.innerHTML = '<i class="mi-bar" title="colour bar · preview stub"></i>' + (st.miLayout === 'rowPerShot' ? '<b class="mi-shot">shot ' + row[0][0].shotNumber + ' · preview stub</b>' : '');
      var fr = document.createElement('div'); fr.className = 'mi-cells';
      row.forEach(function (ci) { var c = ci[0], f = document.createElement('figure'); f.className = 'mi-cell' + (CHO.indexOf(ci[1]) >= 0 ? ' chosen' : ''); f.dataset.i = ci[1]; f.tabIndex = 0; f.setAttribute('aria-label', 'frame ' + (ci[1] + 1) + ' · ' + c.timecode);
        f.appendChild(cellCanvas(c, 240)); var cap = document.createElement('figcaption'); cap.textContent = c.timecode + ' · shot ' + c.shotNumber + ' · ' + c.motionLabel; f.appendChild(cap); fr.appendChild(f); });
      r.appendChild(fr); var ms = document.createElement('i'); ms.className = 'mi-strip'; ms.title = 'motion strip · preview stub'; r.appendChild(ms); g.appendChild(r);
    });
    b.querySelector('[data-a="choose"]').setAttribute('aria-pressed', choosing ? 'true' : 'false');
    b.querySelector('[data-a="s2m"]').disabled = CHO.length < 2;
    paintGen();
  }
  /* pinch: out over a frame goes into it; in, on the frame, back to the sheet. Double-tap is the same, for one finger. */
  var pts = {}, pin = null, lastTap = { t: 0, i: -1 };
  function onDown(e) { var g = e.target.closest('.mi-grid, .mi-frame'); if (!g) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY }; var k = Object.keys(pts);
    if (k.length === 2) { var a = pts[k[0]], c = pts[k[1]]; pin = { d: Math.hypot(a.x - c.x, a.y - c.y), mx: (a.x + c.x) / 2, my: (a.y + c.y) / 2, inFrame: FRAME >= 0 }; } }
  function onMove(e) { if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY }; var k = Object.keys(pts); if (!pin || k.length < 2) return;
    var a = pts[k[0]], c = pts[k[1]], r = Math.hypot(a.x - c.x, a.y - c.y) / pin.d;
    if (!pin.inFrame && r > 1.35) { var el = document.elementFromPoint(pin.mx, pin.my), f = el && el.closest('.mi-cell'); pin = null; intoFrame(f ? +f.dataset.i : 0); }
    else if (pin.inFrame && r < .72) { pin = null; toSheet(); } }
  function onUp(e) { delete pts[e.pointerId]; if (Object.keys(pts).length < 2) pin = null; }
  sheet.el.addEventListener('pointerdown', onDown); G.addEventListener('pointermove', onMove); G.addEventListener('pointerup', onUp); G.addEventListener('pointercancel', onUp);
  sheet.el.addEventListener('gesturechange', function (e) { if (e.scale > 1.35 && FRAME < 0) intoFrame(Math.max(0, SCRUB_I)); else if (e.scale < .72 && FRAME >= 0) toSheet(); e.preventDefault(); });
  function intoFrame(i) { if (!SH) return; FRAME = Math.max(0, Math.min(SH.cells.length - 1, i)); var b = sheet.body, fv = b.querySelector('.mi-frame'); fv.hidden = false; b.querySelector('.mi-grid').hidden = true; drawFrame(); hap('commit'); fv.scrollIntoView({ block: 'nearest' }); }
  function drawFrame() { var b = sheet.body, cv = b.querySelector('.mi-fv canvas'), c = SH.cells[FRAME], src = c.image, w = Math.min(720, (src && (src.naturalWidth || src.width)) || 720); cv.width = w; cv.height = Math.round(w * 9 / 16); drawInto(cv.getContext('2d'), src, 0, 0, cv.width, cv.height);
    b.querySelector('.mi-fl').textContent = 'frame ' + (FRAME + 1) + ' of ' + SH.cells.length + ' · ' + c.timecode + ' · ' + c.motionLabel; }
  function toSheet() { clearInterval(playT); playT = 0; FRAME = -1; var b = sheet.body; b.querySelector('.mi-frame').hidden = true; b.querySelector('.mi-grid').hidden = false; hap('tick'); }
  sheet.el.addEventListener('click', function (e) {
    var b = sheet.body, x = e.target.closest('button'), cell = e.target.closest('.mi-cell');
    if (cell && !x) { var i = +cell.dataset.i;
      if (choosing) { var k = CHO.indexOf(i); if (k >= 0) CHO.splice(k, 1); else CHO.push(i); CHO.sort(function (p, q) { return p - q; }); paint(); hap('tick'); return; }
      var now = Date.now(); if (lastTap.i === i && now - lastTap.t < 380) intoFrame(i); else { SCRUB_I = i; mark(); } lastTap = { t: now, i: i }; return; }
    if (!x) return;
    if (x.dataset.a === 'ex') load({ name: 'example stills', frames: examples(), example: true });
    if (x.dataset.lay) { store.set({ miLayout: x.dataset.lay }); run(); }
    if (x.dataset.den) { store.set({ miDensity: x.dataset.den }); run(); }
    if (x.dataset.a === 'choose') { choosing = !choosing; paint(); say(choosing ? 'tap the stills to use · first and last are the ends' : 'choosing · off'); }
    if (x.dataset.a === 's2m') confirmS2M();
    if (x.dataset.f === 'sheet') toSheet();
    if (x.dataset.f === '1' || x.dataset.f === '-1') { FRAME = (FRAME + +x.dataset.f + SH.cells.length) % SH.cells.length; drawFrame(); hap('tick'); }
    if (x.dataset.f === 'play') { if (playT) { clearInterval(playT); playT = 0; x.textContent = 'into motion'; } else { x.textContent = 'hold'; playT = setInterval(function () { FRAME = (FRAME + 1) % SH.cells.length; drawFrame(); }, 1000 / 6); } }
    if (x.dataset.x) exportAs(x.dataset.x);
    if (x.dataset.s2) runS2M(x.dataset.s2);
    if (x.dataset.a === 's2mno') { b.querySelector('.mi-s2m').hidden = true; s2m = null; }
    if (x.dataset.gk != null) { var gk = GEN[+x.dataset.gk]; if (gk && gk.blob) download(gk.blob, 'generated-preview-stub.webm'); }
  });
  /* ---------- Stills to Motion: a confirm screen, then a result that always says generated ---------- */
  function confirmS2M() {
    if (CHO.length < 2) { say('choose two stills or more'); return; }
    var b = sheet.body, box = b.querySelector('.mi-s2m'), a = SH.cells[CHO[0]], z = SH.cells[CHO[CHO.length - 1]]; s2m = { mode: 'smooth' };
    box.hidden = false; box.innerHTML = '<h3 class="jul">stills to motion</h3><p class="oz-line">a new clip, made from ' + CHO.length + ' stills · it starts on the first and ends on the last, exactly</p>' +
      '<div class="mi-ends"></div><p class="oz-line"><b class="mi-gtag">generated</b> it will always be labelled generated, and never goes into the Archive as real footage</p>' +
      '<div class="oz-seg"><button type="button" data-s2="smooth">make it · smooth</button><button type="button" data-s2="dream">make it · dream</button><button type="button" data-a="s2mno">not now</button></div>';
    var ends = box.querySelector('.mi-ends'); ends.appendChild(cellCanvas(a, 160)); ends.appendChild(cellCanvas(z, 160)); box.scrollIntoView({ block: 'nearest' });
  }
  function runS2M(mode) {
    var b = sheet.body, box = b.querySelector('.mi-s2m'), fr = CHO.map(function (i) { return SH.cells[i].image; });
    box.innerHTML = '<p class="oz-line quiet">generating · preview stub</p>';
    MI.stillsToMotion({ frames: fr, mode: mode }).then(function (r) {
      var g = { r: r, mode: mode, at: Date.now(), blob: null }; GEN.unshift(g); box.hidden = true; CHO = []; choosing = false; paint(); record(g); hap('commit');
    });
  }
  function player(g) {   // the stub's result: a crossfade from the first chosen still to the last, looping, labelled generated
    var cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; var cx = cv.getContext('2d'), t0 = performance.now();
    var first = true; function draw() { if (!cv.isConnected && !first) return; first = false; var u = ((performance.now() - t0) / 2400) % 2, k = u < 1 ? u : 2 - u;
      cx.globalAlpha = 1; drawInto(cx, g.r.first, 0, 0, 480, 270); cx.globalAlpha = k; drawInto(cx, g.r.last, 0, 0, 480, 270); cx.globalAlpha = 1; requestAnimationFrame(draw); }
    draw(); return cv;
  }
  function record(g) {   // keep a short file of it, when this browser can record a canvas
    var cv = player(g); g.cv = cv; paintGen();
    try { if (!G.MediaRecorder || !cv.captureStream) return; var rec = new MediaRecorder(cv.captureStream(24)), bits = []; rec.ondataavailable = function (e) { if (e.data && e.data.size) bits.push(e.data); };
      rec.onstop = function () { g.blob = new Blob(bits, { type: 'video/webm' }); paintGen(); }; rec.start(); setTimeout(function () { try { rec.stop(); } catch (e) {} }, 2400); } catch (e) {}
  }
  function paintGen() { var box = sheet.body.querySelector('.mi-gen'); if (!box) return; box.innerHTML = ''; if (!GEN.length) return;
    var h = document.createElement('h3'); h.className = 'jul'; h.textContent = 'generated'; box.appendChild(h);
    GEN.forEach(function (g, i) { var f = document.createElement('figure'); f.className = 'mi-g'; var wrap = document.createElement('div'); wrap.className = 'mi-gv'; wrap.appendChild(g.cv || player(g));
      var tag = document.createElement('b'); tag.className = 'mi-gtag'; tag.textContent = 'generated · preview stub'; wrap.appendChild(tag); f.appendChild(wrap);
      var cap = document.createElement('figcaption'); cap.innerHTML = esc(g.r.label) + ' · ' + g.mode + (g.blob ? ' · <button type="button" data-gk="' + i + '">save the clip</button>' : ''); f.appendChild(cap); box.appendChild(f); }); }
  GJ.motionSheet = { open: function (src) { if (src) load(src); else sheet.open(); }, close: sheet.close, isOpen: sheet.isOpen, sheet: function () { return SH; }, generated: function () { return GEN.map(function (g) { return { generated: g.r.generated, stub: g.r.stub, label: g.r.label, mode: g.mode }; }); },
    frame: function () { return FRAME; }, into: intoFrame, back: toSheet, choose: function (list) { CHO = list.slice(); paint(); }, make: function (mode) { confirmS2M(); runS2M(mode || 'smooth'); } };

  /* ---------- exports: PDF, PNG tiles, JSON (the stub's sheet, marked mock) ---------- */
  function renderSheet(cols) {
    cols = cols || 3; var n = SH.cells.length, rows = Math.ceil(n / cols), tw = 480, th = 270, cap = 34, strip = 16, pad = 24, W = pad * 2 + cols * tw + (cols - 1) * 12, H = 90 + rows * (th + cap + strip + 18) + pad;
    var c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'); g.fillStyle = '#0e1014'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e9e6df'; g.font = '28px sans-serif'; g.fillText('Motion sheet · ' + (SRC.name || '') + (SRC.example ? ' · example' : ''), pad, 46); g.fillStyle = '#9aa0aa'; g.font = '18px sans-serif'; g.fillText(SH.label + ' · mock', pad, 72);
    SH.cells.forEach(function (cl, i) { var r = Math.floor(i / cols), k = i % cols, x = pad + k * (tw + 12), y = 90 + r * (th + cap + strip + 18);
      if (k === 0) { g.fillStyle = '#3a3e46'; g.fillRect(pad - 14, y, 4, th); }   // colour bar (placeholder)
      drawInto(g, cl.image, x, y, tw, th); g.fillStyle = '#c9c6bf'; g.font = '16px sans-serif'; g.fillText(cl.timecode + ' · shot ' + cl.shotNumber + ' · ' + cl.motionLabel, x, y + th + 22);
      g.strokeStyle = '#4a4e57'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x, y + th + cap + 6); g.lineTo(x + tw, y + th + cap + 6); g.stroke(); g.setLineDash([]); });
    return c;
  }
  function exportAs(k) {
    if (!SH) return; var base = 'motion-sheet-preview-stub';
    if (k === 'json') download(new Blob([JSON.stringify({ mock: true, stub: true, label: SH.label, source: SRC.name, example: !!SRC.example, layout: store.get().miLayout, density: store.get().miDensity,
      cells: SH.cells.map(function (c, i) { return { n: i + 1, timecode: c.timecode, shotNumber: c.shotNumber, motionLabel: c.motionLabel, colours: c.colours, image: c.image ? 'frame ' + (i + 1) + ' of the source' : 'placeholder' }; }) }, null, 2)], { type: 'application/json' }), base + '.json');
    if (k === 'png') renderSheet(3).toBlob(function (bl) { download(bl, base + '.png'); }, 'image/png');
    if (k === 'pdf') { var cover = renderSheet(SH.cells.length); download(pdf([{ canvas: cover, line: 'cover strip · ' + SH.label }, { canvas: renderSheet(3), line: (SRC.name || '') + ' · ' + SH.label }]), base + '.pdf'); }
    say(k.toUpperCase() + ' · saved on this phone');
  }

  /* ---------- the camera dial: scrub the sheet; its inner ring is density ---------- */
  var SCRUB_I = 0, dialWas = false;
  function mark() { sheet.el.querySelectorAll('.mi-cell').forEach(function (f) { f.classList.toggle('on', +f.dataset.i === SCRUB_I); }); var f = sheet.el.querySelector('.mi-cell.on'); if (f) f.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  var SCRUB = { key: 'miscrub', label: 'SCRUB', min: 0, max: 11, def: 0, span: 220, unit: 1, get: function () { return SCRUB_I; }, set: function (v) { var n = SH ? SH.cells.length - 1 : 0; v = Math.max(0, Math.min(n, Math.round(v))); if (v !== SCRUB_I) { SCRUB_I = v; mark(); if (FRAME >= 0) { FRAME = v; drawFrame(); } } }, fmt: function () { return SH && SH.cells[SCRUB_I] ? SH.cells[SCRUB_I].timecode : ''; } };
  var DENR = { key: 'midens', label: 'DENSITY', min: 0, max: 2, def: 1, span: 160, unit: 1, notches: function () { return [0, 1, 2]; }, get: function () { return DENS.indexOf(store.get().miDensity); }, set: function (v) { var d = DENS[Math.max(0, Math.min(2, Math.round(v)))]; if (d !== store.get().miDensity) { store.set({ miDensity: d }); run(); } }, fmt: function (v) { return DENS[Math.max(0, Math.min(2, Math.round(v)))]; } };
  function dialOn() { if (!GJ.dial || !GJ.dial.config) return; dialWas = true; SCRUB.max = 11; GJ.dial.config([SCRUB, DENR]); }
  function dialOff() { if (!dialWas) return; dialWas = false; var app = GJ.app, r = app.room && GJ.rooms && GJ.rooms[app.room]; if (r && r.rings) GJ.dial.config(r.rings()); else if (app.refreshRings) app.refreshRings(); }

  /* ---------- long-press in the Archive: the sheet for that frame's film ---------- */
  (function () {
    var room = document.getElementById('r-archive'); if (!room) return; var h = null, swallow = false, ring = document.createElement('i'); ring.className = 'mi-holding';
    function stop() { if (h) { clearTimeout(h.t); clearTimeout(h.s); h = null; } ring.remove(); }
    room.addEventListener('pointerdown', function (e) { if (!e.isPrimary || e.target.closest('#ar-ctl, #ar-by, #ar-cap-row, button, textarea')) return; var x = e.clientX, y = e.clientY;
      ring.style.left = x + 'px'; ring.style.top = y + 'px';
      h = { x: x, y: y, id: e.pointerId, s: setTimeout(function () { document.body.appendChild(ring); }, 160), t: setTimeout(function () { h = null; ring.remove(); swallow = true; fromArchive(x, y); }, 780) }; });
    G.addEventListener('pointermove', function (e) { if (h && e.pointerId === h.id && Math.hypot(e.clientX - h.x, e.clientY - h.y) > 10) stop(); }, true);
    var eatClick = 0;
    G.addEventListener('pointerup', function (e) { stop(); if (swallow) { swallow = false; eatClick = Date.now(); e.stopImmediatePropagation(); } }, true);
    G.addEventListener('click', function (e) { if (eatClick && Date.now() - eatClick < 700) { eatClick = 0; e.preventDefault(); e.stopImmediatePropagation(); } }, true);   // the lift after a hold is not a tap
    G.addEventListener('pointercancel', stop, true);
  })();
  function fromArchive(x, y) {
    var A = GJ.archive; if (!A) return; var i = A.isOpen && A.isOpen() != null && A.isOpen() !== false ? A.isOpen() : A.hit(x, y); if (i == null || i < 0) i = A.state().focus;
    var L = A.label(i), idx = A.filmOfFrame(i), frames = [];
    idx.forEach(function (k) { var c = document.createElement('canvas'); if (A.drawFrame(k, c, 320)) frames.push(c); });
    hap('commit'); load({ name: L.film, frames: frames, from: 'from the Archive · held on frame ' + L.frame });
  }
  GJ.motionSheet.fromArchive = fromArchive;

  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, st = store.get();
    if (k === 'ozmi') sheet.open();
    if (k === 'milayout') { var L = LAYOUTS.map(function (l) { return l[0]; }); store.set({ miLayout: L[(L.indexOf(st.miLayout) + 1) % L.length] }); }
    if (k === 'midensity') store.set({ miDensity: DENS[(DENS.indexOf(st.miDensity) + 1) % DENS.length] }); });
  function T() { if (!tune) return; var st = store.get(), a = tune.querySelector('[data-t="milayout"] b'), d = tune.querySelector('[data-t="midensity"] b'); if (a) a.textContent = layoutWord(st.miLayout); if (d) d.textContent = st.miDensity; }
  store.on(T); T();
  GJ.ozone.place({ id: 'motionsheet', name: 'motion sheet', sub: 'a clip or stills, as a sheet', cl: 'make', open: function () { sheet.open(); } });
})(window);
