/* tools-02 · Compare (briefs/SITE-SWEEP.md; Gill, 18 Nov: "an adjacent function to the motion contact sheet").
   Motion Index makes one clip into a sheet. Compare lays two or more side by side on the same sheet — a row a moment, a
   column a build (or a cut, or a take) — so you can see what went right, what was lost and what to bring forward.
     · From Motion Index: index a clip, tap COMPARE, then "+ a clip" for the other one. The second clip is read at the
       very same moments as the first, so the rows line up.
     · Or "open a sweep": the sweep.zip the Site Sweep tool makes on a computer (sweep/sweep.py in the pack) — its
       moments are the rows, its builds the columns, its flags shown on the frames they belong to.
     · Tap a row: the two frames, one over the other, with a line you drag across to wipe between them (SLIDE), or side
       by side (SPLIT). With more than two columns, the A and B words choose which two.
     · Mark it: keep · bring forward · lost · fix (one tap; again to clear), and a line of your own.
     · LIST is the bring-forward list — what went right, what to bring forward, what was lost, what to fix. PASS IT ON
       hands it to the phone's share sheet in one tap (or saves it as a text file where there is none). PDF is the sheet
       itself, every frame labelled with its build and its moment, your marks on it.
   Frames are drawn as they are, only scaled; nothing is graded or re-made. Everything stays on the phone. Marks are kept
   in this browser (localStorage gj-sweep) under the sweep's name, so they are there when it is opened again.
   Not here: walking a live site from the phone (a page cannot drive another site — that is the computer tool's job),
   walkthrough clips played side by side, replies from a builder (Pass It On is the app proper's). */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, clamp = GJ.clamp;
  var MARKS = ['keep', 'bring forward', 'lost', 'fix'], HEAD = { keep: 'went right · keep', 'bring forward': 'bring forward', lost: 'lost', fix: 'fix' };
  var KEY = 'gj-sweep', M = {};
  try { M = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { M = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(M)); } catch (e) {} }
  var el = document.createElement('section'); el.id = 'sweep'; el.className = 'gpanel'; el.setAttribute('aria-label', 'compare');
  el.innerHTML = '<b class="jul">compare</b><p class="gp-say"></p>' +
    '<div class="sw-src"><label><input type="file" accept="video/*" hidden data-k="clip"><span>+ a clip</span></label><label><input type="file" accept=".zip,application/zip" hidden data-k="zip"><span>open a sweep</span></label></div>' +
    '<div class="sw-rows" role="list"></div>' +
    '<div class="sw-one" hidden><div class="sw-stage"><canvas class="sw-a"></canvas><canvas class="sw-b"></canvas><i class="sw-h"></i><em class="sw-la"></em><em class="sw-lb"></em></div>' +
    '<p class="sw-cap"></p><div class="sw-ab"><button data-a="colA"></button><button data-a="mode">slide</button><button data-a="colB"></button></div>' +
    '<div class="sw-marks" role="group" aria-label="mark this row">' + MARKS.map(function (m) { return '<button data-m="' + m + '">' + m + '</button>'; }).join('') + '</div>' +
    '<input class="sw-note" type="text" maxlength="140" placeholder="a line about this row"><div class="sw-nav"><button data-a="prev" aria-label="previous row">‹</button><button data-a="rows">all rows</button><button data-a="next" aria-label="next row">›</button></div></div>' +
    '<pre class="sw-list" hidden></pre>' +
    '<div class="gp-act"><button data-a="list">list</button><button data-a="share">pass it on</button><button data-a="pdf">pdf</button><button data-a="close">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, say = q('.gp-say'), rowsEl = q('.sw-rows'), one = q('.sw-one'), listEl = q('.sw-list'), stage = q('.sw-stage'), ca = q('.sw-a'), cb = q('.sw-b'), noteIn = q('.sw-note');
  var SW = null, cur = -1, A = 0, B = 1, cut = .5, mode = 'slide', busy = false;
  function tc(t) { var m = Math.floor(t / 60), s = t - m * 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
  function marks() { return SW ? (M[SW.id] = M[SW.id] || {}) : {}; }
  function mk(r) { return marks()[r.key] || {}; }
  function wOf(c) { return c ? (c.naturalWidth || c.videoWidth || c.width) : 0; } function hOf(c) { return c ? (c.naturalHeight || c.videoHeight || c.height) : 0; }
  function small(c, w) { var t = document.createElement('canvas'); if (!c) { t.width = w; t.height = Math.round(w * 9 / 16); return t; } t.width = w; t.height = Math.max(1, Math.round(w * hOf(c) / wOf(c))); var g = t.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, t.width, t.height); return t; }
  function distance(a, b) {   // how far apart two frames are, 0 – 255 a pixel, read small (64 × 36): a guide to where to look, not a verdict
    if (!a || !b) return null; try { var x = small(a, 64), y = document.createElement('canvas'); y.width = x.width; y.height = x.height; y.getContext('2d').drawImage(b, 0, 0, y.width, y.height);
      var p = x.getContext('2d').getImageData(0, 0, x.width, x.height).data, r = y.getContext('2d').getImageData(0, 0, y.width, y.height).data, s = 0; for (var i = 0; i < p.length; i += 4) s += Math.abs(p[i] - r[i]) + Math.abs(p[i + 1] - r[i + 1]) + Math.abs(p[i + 2] - r[i + 2]); return s / (p.length / 4 * 3); } catch (e) { return null; }
  }
  function differs(r) { var d = null; for (var j = 1; j < r.cells.length; j++) { var v = r.d && r.d[j] != null ? r.d[j] : (r.d = r.d || [], r.d[j] = distance(r.cells[0], r.cells[j])); if (v != null && (d == null || v > d)) d = v; } return d; }
  function paintRows() {
    rowsEl.innerHTML = ''; if (!SW) { say.textContent = 'index a clip and tap compare — or + a clip, or open a sweep from the computer tool. Nothing leaves the phone.'; return; }
    SW.rows.forEach(function (r, i) {
      var d = document.createElement('div'); d.className = 'sw-r'; d.dataset.i = i; d.setAttribute('role', 'listitem'); var m = mk(r), df = differs(r), fl = (r.flags || []).reduce(function (a, f) { return a + (f ? f.length : 0); }, 0);
      var h = document.createElement('p'); h.innerHTML = '<b></b><i></i><em></em>'; h.children[0].textContent = r.label; h.children[1].textContent = (r.cells.length > 1 ? (r.cells.some(function (c) { return !c; }) ? 'missing in one' : df == null ? '' : df < 1.5 ? 'the same' : df < 8 ? 'a little different' : 'different') : '') + (fl ? ' · ' + fl + (fl === 1 ? ' flag' : ' flags') : ''); h.children[2].textContent = m.m || ''; d.appendChild(h);
      var f = document.createElement('div'); f.className = 'sw-f'; f.style.gridTemplateColumns = 'repeat(' + Math.max(1, SW.cols.length) + ', minmax(0, 1fr))'; r.cells.forEach(function (c) { f.appendChild(small(c, 220)); }); d.appendChild(f); rowsEl.appendChild(d);
    });
    var n = SW.rows.filter(function (r) { return mk(r).m; }).length; say.textContent = (SW.id.indexOf('sweep:') === 0 ? SW.name : SW.cols.map(function (c) { return c.name; }).join(' | ')) + ' · ' + SW.rows.length + ' rows' + (n ? ' · ' + n + ' marked' : '') + (SW.cols.length < 2 ? ' · + a clip adds the other one' : ' · tap a row');
  }
  function drawOne() {
    var r = SW.rows[cur]; if (!r) return; var a = r.cells[A], b = r.cells[B], w = wOf(a) || wOf(b) || 480, h = hOf(a) || hOf(b) || 270;
    [[ca, a], [cb, b]].forEach(function (p) { p[0].width = w; p[0].height = h; var g = p[0].getContext('2d'); g.clearRect(0, 0, w, h); if (p[1]) g.drawImage(p[1], 0, 0, w, h); });
    var ar = (mode === 'split' ? 2 * w : w) / h, sw = Math.min(one.clientWidth || 300, G.innerHeight * .46 * ar);   // a tall frame (a phone's own screen) is kept to under half the screen, so its marks stay in reach
    stage.className = 'sw-stage ' + mode; stage.style.width = Math.round(sw) + 'px'; stage.style.height = Math.round(sw / ar) + 'px'; setCut(cut);
    q('.sw-la').textContent = SW.cols[A].name; q('.sw-lb').textContent = SW.cols[B] ? SW.cols[B].name : ''; q('[data-a="colA"]').textContent = 'A · ' + SW.cols[A].name; q('[data-a="colB"]').textContent = SW.cols[B] ? 'B · ' + SW.cols[B].name : 'B · —'; q('[data-a="mode"]').textContent = mode;
    var m = mk(r), fl = [].concat((r.flags && r.flags[A]) || [], (r.flags && r.flags[B]) || []), df = r.d && r.d[B] != null && A === 0 ? r.d[B] : distance(a, b);
    q('.sw-cap').textContent = r.label + ' · ' + (cur + 1) + ' / ' + SW.rows.length + (!a || !b ? ' · missing in one' : df == null ? '' : df < 1.5 ? ' · the same' : df < 8 ? ' · a little different' : ' · different') + (fl.length ? ' · ' + fl.slice(0, 3).join(' · ') : '');
    [].forEach.call(el.querySelectorAll('.sw-marks button'), function (x) { var on = x.dataset.m === m.m; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); }); if (document.activeElement !== noteIn) noteIn.value = m.n || '';
  }
  function setCut(v) { cut = clamp(v, 0, 1); cb.style.clipPath = mode === 'slide' ? 'inset(0 0 0 ' + (cut * 100).toFixed(2) + '%)' : 'none'; q('.sw-h').style.left = (cut * 100).toFixed(2) + '%'; }
  function view(what) { rowsEl.hidden = what !== 'rows'; one.hidden = what !== 'one'; listEl.hidden = what !== 'list'; q('.sw-src').hidden = what !== 'rows'; q('[data-a="list"]').textContent = what === 'list' ? 'rows' : 'list'; }
  function row(i) { if (!SW || !SW.rows.length) return; cur = clamp(i, 0, SW.rows.length - 1); if (B >= SW.cols.length) B = Math.max(0, SW.cols.length - 1); view('one'); drawOne(); }
  function setMark(i, m) { var r = SW && SW.rows[i]; if (!r) return; var o = marks()[r.key] = marks()[r.key] || {}; o.m = o.m === m ? '' : m; if (!o.m && !o.n) delete marks()[r.key]; save(); if (!one.hidden) drawOne(); else paintRows(); GJ.haptic.tick(); }
  function setNote(i, n) { var r = SW && SW.rows[i]; if (!r) return; var o = marks()[r.key] = marks()[r.key] || {}; o.n = String(n).trim(); if (!o.m && !o.n) delete marks()[r.key]; save(); }
  function list() {   // the bring-forward list, as plain words
    if (!SW) return ''; var out = [SW.name + ' — ' + SW.cols.map(function (c) { return c.name; }).join(' | '), new Date().toISOString().slice(0, 10), ''], none = 0;
    MARKS.forEach(function (m) { var rs = SW.rows.filter(function (r) { return mk(r).m === m; }); out.push(HEAD[m].toUpperCase()); if (!rs.length) out.push('  —'); rs.forEach(function (r) { out.push('  · ' + r.label + (mk(r).n ? ' — ' + mk(r).n : '')); }); out.push(''); });
    var notes = SW.rows.filter(function (r) { return !mk(r).m && mk(r).n; }); if (notes.length) { out.push('NOTES'); notes.forEach(function (r) { out.push('  · ' + r.label + ' — ' + mk(r).n); }); out.push(''); }
    SW.rows.forEach(function (r) { if (!mk(r).m) none++; }); out.push(none + ' of ' + SW.rows.length + ' rows not marked'); return out.join('\n');
  }
  function sheets() {   // the contact sheet as pages: a row a moment, a column a build, every frame labelled, the marks on it
    var W = 1240, Mg = 44, gap = 16, n = SW.cols.length, cw = (W - 2 * Mg - (n - 1) * gap) / n, per = 5, pages = [];
    for (var p = 0; p < SW.rows.length; p += per) {
      var rs = SW.rows.slice(p, p + per), hs = rs.map(function (r) { var c = r.cells.filter(Boolean)[0]; return c ? cw * hOf(c) / wOf(c) : cw * 9 / 16; }), H = 96 + hs.reduce(function (a, h) { return a + h + 62; }, 0) + 30;
      var c = document.createElement('canvas'); c.width = W; c.height = Math.round(H); var g = c.getContext('2d'); g.fillStyle = '#05090f'; g.fillRect(0, 0, W, c.height); g.fillStyle = '#e8e4dc'; g.font = '400 22px "Julius Sans One", Poppins, sans-serif'; g.fillText(SW.name.toUpperCase().slice(0, 60), Mg, 46);
      g.fillStyle = 'rgba(232,228,220,.62)'; g.font = '300 14px Poppins, sans-serif'; g.fillText(SW.cols.map(function (x) { return x.name; }).join('  |  ') + '  ·  ' + new Date().toISOString().slice(0, 10) + '  ·  page ' + (p / per + 1) + '  ·  frames as they are, only scaled', Mg, 72);
      var y = 96; rs.forEach(function (r, k) { var m = mk(r);
        r.cells.forEach(function (cell, j) { var x = Mg + j * (cw + gap); if (cell) { g.imageSmoothingQuality = 'high'; g.drawImage(cell, x, y, cw, hs[k]); } else { g.strokeStyle = 'rgba(232,228,220,.3)'; g.strokeRect(x + .5, y + .5, cw - 1, hs[k] - 1); }
          g.fillStyle = 'rgba(232,228,220,.7)'; g.font = '300 13px Poppins, sans-serif'; g.fillText((SW.cols[j].name + ' · ' + r.label + (r.flags && r.flags[j] && r.flags[j].length ? ' · ' + r.flags[j].length + ' flagged' : '')).slice(0, Math.floor(cw / 7.4)), x, y + hs[k] + 20); });
        if (m.m || m.n) { g.fillStyle = '#e8e4dc'; g.font = '400 15px Poppins, sans-serif'; g.fillText(((m.m ? m.m.toUpperCase() : '') + (m.n ? (m.m ? ' — ' : '') + m.n : '')).slice(0, 120), Mg, y + hs[k] + 44); }
        y += hs[k] + 62; });
      pages.push(c);
    }
    return pages;
  }
  function pdf() { if (!SW) return Promise.reject(new Error('nothing to save')); var cs = sheets(); return Promise.all(cs.map(function (c) { return GJ.out.blobOf(c, 'image/jpeg', .92).then(GJ.out.bytes).then(function (j) { return { jpg: j, w: c.width, h: c.height }; }); })).then(function (pages) { var b = GJ.out.pdf(pages); GJ.out.last = { name: 'compare-sheet.pdf', size: b.size, pages: pages.length, blob: b }; GJ.out.save(b, 'compare-sheet.pdf'); return GJ.out.last; }); }
  function share() {   // one gesture: the phone's own share sheet; where there is none, a text file
    var text = list(); if (!text) return Promise.resolve('nothing');
    if (G.navigator.share) return G.navigator.share({ title: 'bring-forward list · ' + SW.name, text: text }).then(function () { return 'shared'; }, function () { return 'put away'; });
    var b = new Blob([text], { type: 'text/plain' }); GJ.out.last = { name: 'bring-forward.txt', size: b.size, blob: b, text: text }; GJ.out.save(b, 'bring-forward.txt'); return Promise.resolve('saved');
  }
  /* ---- sources ---- */
  function fromIndex() {   // Motion Index's sheet becomes the first column
    var fr = GJ.mindex && GJ.mindex.frames ? GJ.mindex.frames() : []; if (!fr.length) return false; var nm = GJ.mindex.clipName();
    SW = { id: 'clips:' + nm, name: 'two clips', cols: [{ name: nm.replace(/\.[a-z0-9]+$/i, '').slice(0, 24) }], rows: fr.map(function (f) { return { key: 't' + f.t.toFixed(1), label: tc(f.t), t: f.t, cells: [f.img] }; }) }; cur = -1; A = 0; B = 1; open(); return true;
  }
  var vid = document.createElement('video'); vid.muted = true; vid.playsInline = true; vid.preload = 'auto';
  function seek(t) { return new Promise(function (ok) { var done = false, fin = function () { if (done) return; done = true; vid.removeEventListener('seeked', fin); ok(); }; vid.addEventListener('seeked', fin); setTimeout(fin, 1600); try { vid.currentTime = t; } catch (e) { fin(); } }); }
  function addClip(file) {   // another clip, read at the same moments as the rows already there (or, with none yet, at twelve even moments of its own)
    if (busy || !file) return Promise.resolve(false); busy = true; say.textContent = 'reading ' + file.name + '…';
    return new Promise(function (ok, no) { vid.onloadedmetadata = function () { ok(); }; vid.onerror = function () { no(new Error('the clip would not open')); }; vid.src = URL.createObjectURL(file); vid.load(); }).then(function () {
      var dur = isFinite(vid.duration) ? vid.duration : 0, nm = String(file.name || 'clip').replace(/\.[a-z0-9]+$/i, '').slice(0, 24);
      if (!SW || !SW.rows.length || SW.rows[0].t == null) { SW = { id: 'clips:' + file.name, name: 'two clips', cols: [], rows: [] }; for (var k = 0; k < 12; k++) { var t = dur * (k + .5) / 12; SW.rows.push({ key: 't' + t.toFixed(1), label: tc(t), t: t, cells: [] }); } A = 0; B = 1; }
      var col = SW.cols.length, W = Math.min(480, vid.videoWidth || 480), H = Math.round(W * (vid.videoHeight || 270) / (vid.videoWidth || 480)), i = 0; SW.cols.push({ name: nm });
      return (function next() { if (i >= SW.rows.length) return Promise.resolve(); var r = SW.rows[i++]; if (r.t > dur + .05) { r.cells[col] = null; return next(); }
        return seek(Math.min(r.t, Math.max(0, dur - .04))).then(function () { var c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(vid, 0, 0, W, H); r.cells[col] = c; r.d = null; return next(); }); })();
    }).then(function () { busy = false; try { URL.revokeObjectURL(vid.src); } catch (e) {} view('rows'); paintRows(); GJ.haptic.commit(); return true; }, function (e) { busy = false; say.textContent = e.message; return false; });
  }
  function unzip(buf) {   // the sweep tool's zip: stored files (and, where the browser can, squeezed ones)
    var u = new Uint8Array(buf), dv = new DataView(buf), o = 0, files = {}, jobs = [];
    while (o + 30 <= u.length && dv.getUint32(o, true) === 0x04034b50) {
      var method = dv.getUint16(o + 8, true), sz = dv.getUint32(o + 18, true), nl = dv.getUint16(o + 26, true), xl = dv.getUint16(o + 28, true), name = new TextDecoder().decode(u.subarray(o + 30, o + 30 + nl)), data = u.subarray(o + 30 + nl + xl, o + 30 + nl + xl + sz);
      if (method === 0) files[name] = data; else if (method === 8 && G.DecompressionStream) (function (nm, dat) { jobs.push(new Response(new Blob([dat]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer().then(function (b) { files[nm] = new Uint8Array(b); })); })(name, data);
      o += 30 + nl + xl + sz;
    }
    return Promise.all(jobs).then(function () { return files; });
  }
  function openZip(file) {
    if (busy || !file) return Promise.resolve(false); busy = true; say.textContent = 'opening ' + (file.name || 'the sweep') + '…';
    return file.arrayBuffer().then(unzip).then(function (files) {
      if (!files['sweep.json']) throw new Error('that zip is not a sweep (no sweep.json in it)'); var log = JSON.parse(new TextDecoder().decode(files['sweep.json'])), dev = null;
      log.frames.forEach(function (f) { if (!dev && files[f.frame]) dev = f.device; }); if (!dev) throw new Error('the sweep has no frames in it');
      var cols = log.builds.map(function (b) { return { name: b.name + (b.version ? ' ' + b.version : '') }; }), load = [];
      var rows = log.moments.map(function (m) { var r = { key: m.id, label: m.label, cells: [], flags: [], d: [] }; log.builds.forEach(function (b, j) { var f = log.frames.filter(function (x) { return x.build === b.name && x.moment === m.id && x.device === dev; })[0]; r.flags[j] = f ? f.flags : []; r.d[j] = f && f.changed != null ? f.changed : null; r.cells[j] = null;
        if (f && files[f.frame]) load.push(new Promise(function (ok) { var im = new Image(); im.onload = function () { r.cells[j] = im; ok(); }; im.onerror = function () { ok(); }; im.src = URL.createObjectURL(new Blob([files[f.frame]], { type: 'image/png' })); })); }); r.d[0] = null; return r; });
      return Promise.all(load).then(function () { SW = { id: 'sweep:' + log.name, name: log.name + ' · ' + dev, cols: cols, rows: rows, made: log.made, flags: log.flags }; cur = -1; A = 0; B = Math.min(1, cols.length - 1); });
    }).then(function () { busy = false; view('rows'); paintRows(); GJ.haptic.commit(); return true; }, function (e) { busy = false; say.textContent = e.message || 'that file would not open'; return false; });
  }
  function isOpen() { return html.classList.contains('sweeping'); }
  function open() { html.classList.add('sweeping'); view('rows'); paintRows(); GJ.haptic.tick(); }
  function close() { html.classList.remove('sweeping'); }
  /* ---- hands ---- */
  rowsEl.addEventListener('click', function (e) { var r = e.target.closest('.sw-r'); if (r && SW && SW.cols.length > 1) row(+r.dataset.i); else if (r) say.textContent = '+ a clip adds the other one — then tap a row'; });
  var drag = false;
  function at(e) { var r = stage.getBoundingClientRect(); setCut((e.clientX - r.left) / r.width); }
  stage.addEventListener('pointerdown', function (e) { if (mode !== 'slide') return; e.preventDefault(); drag = true; try { stage.setPointerCapture(e.pointerId); } catch (x) {} at(e); });
  stage.addEventListener('pointermove', function (e) { if (drag) at(e); }); stage.addEventListener('pointerup', function () { drag = false; }); stage.addEventListener('pointercancel', function () { drag = false; });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
    if (b.dataset.m) { setMark(cur, b.dataset.m); return; }
    if (a === 'close') close(); else if (a === 'rows') { view('rows'); paintRows(); } else if (a === 'prev') row(cur - 1); else if (a === 'next') row(cur + 1);
    else if (a === 'mode') { mode = mode === 'slide' ? 'split' : 'slide'; drawOne(); }
    else if (a === 'colA' && SW && SW.cols.length > 2) { do { A = (A + 1) % SW.cols.length; } while (A === B); drawOne(); } else if (a === 'colB' && SW && SW.cols.length > 2) { do { B = (B + 1) % SW.cols.length; } while (B === A); drawOne(); }
    else if (a === 'list') { if (!SW) return; if (listEl.hidden) { listEl.textContent = list(); view('list'); } else { view('rows'); paintRows(); } }
    else if (a === 'share') share().then(function (r) { say.textContent = r === 'saved' ? 'saved · bring-forward.txt' : r === 'shared' ? 'passed on' : r === 'nothing' ? 'nothing to pass on yet' : say.textContent; });
    else if (a === 'pdf') { if (!SW) return; say.textContent = 'making the sheet…'; pdf().then(function (o) { say.textContent = 'saved · compare-sheet.pdf · ' + o.pages + (o.pages === 1 ? ' page' : ' pages'); }).catch(function () { say.textContent = 'the sheet could not be saved from here'; }); }
  });
  noteIn.addEventListener('input', function () { setNote(cur, noteIn.value); }); noteIn.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') noteIn.blur(); });
  el.querySelector('[data-k="clip"]').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) addClip(f); });
  el.querySelector('[data-k="zip"]').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) openZip(f); });
  var act = document.querySelector('#mindex .mi-act'); if (act) { var cbn = document.createElement('button'); cbn.className = 'mi-cmp'; cbn.textContent = 'compare'; cbn.setAttribute('aria-label', 'compare this clip with another, row for row'); cbn.addEventListener('click', function (e) { e.stopPropagation(); if (fromIndex() && GJ.mindex.close) GJ.mindex.close(); }); act.insertBefore(cbn, act.querySelector('.mi-x')); }
  GJ.sweep = { open: open, close: close, isOpen: isOpen, fromIndex: fromIndex, addClip: addClip, openZip: openZip, row: row, mark: setMark, note: setNote, list: list, sheets: sheets, pdf: pdf, share: share, setCut: setCut, MARKS: MARKS,
    setMode: function (m) { mode = m === 'split' ? 'split' : 'slide'; if (!one.hidden) drawOne(); }, pick: function (a, b) { A = a; B = b; if (!one.hidden) drawOne(); },
    state: function () { return { open: isOpen(), name: SW ? SW.name : null, cols: SW ? SW.cols.map(function (c) { return c.name; }) : [], rows: SW ? SW.rows.length : 0, labels: SW ? SW.rows.map(function (r) { return r.label; }) : [], filled: SW ? SW.rows.map(function (r) { return r.cells.filter(Boolean).length; }) : [], cur: cur, a: A, b: B, cut: cut, mode: mode, view: !one.hidden ? 'one' : !listEl.hidden ? 'list' : 'rows',
      marks: SW ? SW.rows.map(function (r) { return mk(r).m || ''; }) : [], diffs: SW ? SW.rows.map(function (r) { var d = differs(r); return d == null ? null : +d.toFixed(2); }) : [], flags: SW ? SW.rows.map(function (r) { return (r.flags || []).map(function (f) { return f ? f.length : 0; }); }) : [], busy: busy }; } };
})(window);
