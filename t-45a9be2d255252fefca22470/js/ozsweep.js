/* oz next (item 7) · Sweep on the phone, and the fuller Contact Sheet. Review tools, not a capture method.
   The walk: the same list of moments every time (arrival, the rooms, the map, Tune open and closed) and two moves (push in,
   orbit), in the light you pick. At each moment it keeps a still of what a page can capture of itself — its own drawn
   layers (the sky, the boards), not the type and buttons over them; the computer walk (r4) catches everything — and a
   short clip of each move. Each capture is labelled build · version · device · light · moment.
   The Contact Sheet: one row a moment, one column a build, a label on every frame, a clips row that plays in sync, marks
   (keep · bring forward · lost · fix) and a note, a side-by-side wipe between two builds, the bring-forward list, and an
   export (PNG, PDF) only when you ask. Frames are shown as captured, only scaled. Marks are kept on this phone under the
   build they belong to, so they are still there after another walk.   GJ.ozsweep.walk(light) · GJ.contactSheet.open() */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, P = GJ.ozone && GJ.ozone.panel, esc = GJ.ozone ? GJ.ozone.esc : String, tune = document.getElementById('tune'); if (!P) return;
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t, ms) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, ms || 1800); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function home() { try { for (var i = 0; i < 8 && GJ.app.closeAny && GJ.app.closeAny(); i++) {} } catch (e) {} if (app.tuneOpen && app.tuneOpen()) app.tune(false); if (GJ.navmap && GJ.navmap.isOpen()) GJ.navmap.close(); while (app.room) app.back(); app.toSky(); }
  var MOMENTS = [
    ['arrival', 'arrival · the sky', function () { home(); }],
    ['archive', 'the Archive', function () { home(); app.enter('archive'); }],
    ['timer', 'the Timer', function () { home(); app.enter('red'); }],
    ['golden', 'Golden Hour', function () { home(); app.enter('golden'); }],
    ['player', 'Sky Player', function () { home(); app.enter('player'); }],
    ['feed', 'the Feed', function () { home(); app.enter('feed'); }],
    ['map', 'the map', function () { home(); if (GJ.navmap) GJ.navmap.open(); }],
    ['tuneopen', 'Tune open', function () { home(); app.tune(true); }],
    ['tuneclosed', 'Tune closed', function () { app.tune(false); }]
  ];
  var MOVES = [
    ['pushin', 'move · push in', function () { home(); GJ.aim(GJ.sky.cam.z, 2.4); }, function () { GJ.aim(GJ.sky.cam.z, 1); }],
    ['orbit', 'move · orbit', function () { home(); var t0 = performance.now(), b0 = app.lookBase || 0; (function f() { var u = Math.min(1, (performance.now() - t0) / 1700); app.lookBase = b0 + Math.sin(u * Math.PI) * .35; if (u < 1) requestAnimationFrame(f); })(); }, function () {}]
  ];
  var LIGHTS = ['night', 'red', 'day'], RUNS = [], MKEY = 'oz-contact-marks', MK = {};
  try { MK = JSON.parse(localStorage.getItem(MKEY) || '{}') || {}; } catch (e) { MK = {}; }
  function saveMarks() { try { localStorage.setItem(MKEY, JSON.stringify(MK)); } catch (e) {} }
  GJ.BUILD = GJ.BUILD || 'oz next · 20 nov 2026';   // this build's name on its captures; the next build changes this line
  function build() { return GJ.BUILD; }
  function setLight(l) { store.set(l === 'red' ? { red: true, dayMode: false } : l === 'day' ? { red: false, dayMode: true, fullSafe: false } : { red: false, dayMode: false }); }
  function lightNow() { var s = store.get(); return s.dayMode ? 'day' : s.red ? 'red' : 'night'; }

  /* a still of the page's own drawn layers, at phone size */
  function capture() {
    var W = 390, H = 844, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'), vw = G.innerWidth, vh = G.innerHeight, k = Math.min(W / vw, H / vh);
    g.fillStyle = getComputedStyle(document.body).backgroundColor || '#000'; g.fillRect(0, 0, W, H);
    [].slice.call(document.querySelectorAll('canvas')).forEach(function (cv) { var r = cv.getBoundingClientRect(), cs = getComputedStyle(cv); if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0 || cv.closest('.oz-sheet, #tune[hidden]')) return;
      try { g.globalAlpha = Math.min(1, +cs.opacity || 1); g.drawImage(cv, r.left * k, r.top * k, r.width * k, r.height * k); } catch (e) {} });
    g.globalAlpha = 1; try { return c.toDataURL('image/jpeg', .86); } catch (e) { return null; }
  }
  function clip(ms) {   // a short clip of the sky while a move plays
    return new Promise(function (res) { var cv = document.getElementById('sky'); if (!cv || !cv.captureStream || !G.MediaRecorder) { setTimeout(function () { res(null); }, ms); return; }
      try { var rec = new MediaRecorder(cv.captureStream(30)), bits = []; rec.ondataavailable = function (e) { if (e.data && e.data.size) bits.push(e.data); }; rec.onstop = function () { res(bits.length ? new Blob(bits, { type: 'video/webm' }) : null); }; rec.start(); setTimeout(function () { try { rec.stop(); } catch (e) { res(null); } }, ms); } catch (e) { setTimeout(function () { res(null); }, ms); } });
  }
  var pill = document.createElement('p'); pill.id = 'ozwalk-pill'; pill.hidden = true; pill.setAttribute('role', 'status'); document.body.appendChild(pill);
  var walking = false;
  function walk(light) {
    if (walking) return Promise.resolve(null); walking = true; light = light || lightNow();
    var was = { red: store.get().red, dayMode: store.get().dayMode, fullSafe: store.get().fullSafe }, run = { id: 'run' + Date.now(), build: build(), light: light, device: 'phone · 390×844', at: Date.now(), frames: {}, clips: {}, example: false };
    if (GJ.contactSheet) GJ.contactSheet.close(); setLight(light); pill.hidden = false;
    var steps = MOMENTS.length + MOVES.length, n = 0;
    function label(t) { n++; pill.textContent = 'walking · ' + n + ' of ' + steps + ' · ' + t; }
    var chain = Promise.resolve();
    MOMENTS.forEach(function (m) { chain = chain.then(function () { label(m[1]); m[2](); return wait(1100); }).then(function () { run.frames[m[0]] = capture(); }); });
    MOVES.forEach(function (m) { chain = chain.then(function () { label(m[1]); m[2](); return clip(1800); }).then(function (b) { run.clips[m[0]] = b; m[3](); run.frames[m[0]] = capture(); return wait(500); }); });
    return chain.then(function () { home(); store.set(was); pill.hidden = true; walking = false; RUNS.push(run); keep(); hap('commit'); say('walk · ' + run.build + ' · ' + light); if (GJ.contactSheet) GJ.contactSheet.open(); return run; },
      function (e) { home(); store.set(was); pill.hidden = true; walking = false; throw e; });
  }
  function keep() { try { if (GJ.keep) GJ.keep.put('oz-sweep-runs', RUNS.filter(function (r) { return !r.example; }).slice(-6).map(function (r) { return { id: r.id, build: r.build, light: r.light, device: r.device, at: r.at, frames: r.frames, clips: r.clips }; })); } catch (e) {} }
  try { if (GJ.keep && GJ.keep.get) GJ.keep.get('oz-sweep-runs').then(function (v) { if (v && v.length && !RUNS.length) RUNS = v.concat(RUNS); }); } catch (e) {}
  function exampleRun() { var r = { id: 'example-v33', build: 'example build · v33', light: 'night', device: 'phone · 390×844', at: Date.now() - 864e5 * 2, frames: {}, clips: {}, example: true }; RUNS.unshift(r); return r; }

  /* ---------- the Contact Sheet ---------- */
  var ROWS = MOMENTS.map(function (m) { return [m[0], m[1]]; }).concat(MOVES.map(function (m) { return [m[0], m[1]]; })), ONE = null, PICK_LIGHT = null;
  function key(row, r) { return row + '|' + r.build + '|' + r.light; }
  function colName(r) { return r.build + ' · ' + r.light + ' · ' + r.device + ' · ' + new Date(r.at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  var MARKS = [['keep', 'keep'], ['forward', 'bring forward'], ['lost', 'lost'], ['fix', 'fix']];
  function markWord(m) { return (MARKS.filter(function (x) { return x[0] === m; })[0] || ['', ''])[1]; }
  var cs = P({ id: 'ozcs', title: 'Contact Sheet', tall: true, sub: 'a row a moment · a column a build · a label on every frame',
    foot: 'frames as captured, only scaled · the page keeps its own drawn layers, not its type and buttons · nothing leaves this phone unless you share it',
    build: function (b) {
      PICK_LIGHT = PICK_LIGHT || lightNow();
      b.innerHTML = '<div class="oz-grp"><div class="oz-line cs-walk"><span>walk this build in</span><span class="oz-seg">' + LIGHTS.map(function (l) { return '<button type="button" data-l="' + l + '" aria-pressed="' + (l === PICK_LIGHT) + '">' + l + '</button>'; }).join('') + '</span></div>' +
        '<button type="button" class="oz-row" data-a="walk">walk it now<span>' + (MOMENTS.length + MOVES.length) + ' moments · about 15 s</span></button><button type="button" class="oz-row" data-a="example">add an example build<span>marked example</span></button></div>' +
        '<div class="cs-wrap"></div><div class="cs-one" hidden></div><h3 class="jul">bring forward</h3><div class="cs-list oz-grp"></div>' +
        '<div class="oz-seg"><button type="button" data-a="pass">pass it on</button><button type="button" data-a="md">save the list</button><button type="button" data-a="png">PNG</button><button type="button" data-a="pdf">PDF</button><button type="button" data-a="sync">play the clips</button></div>';
      paint(b);
    } });
  function paint(b) {
    b = b || cs.body; var w = b.querySelector('.cs-wrap'); if (!w) return;
    if (!RUNS.length) { w.innerHTML = '<p class="oz-line quiet">no walks yet · walk this build, then walk again after a change</p>'; paintList(b); return; }
    var h = '<div class="cs-table" role="table" aria-label="contact sheet"><div class="cs-tr cs-head" role="row"><span class="cs-mom" role="columnheader">moment</span>' + RUNS.map(function (r) { return '<span role="columnheader" class="cs-col' + (r.example ? ' ex' : '') + '">' + esc(colName(r)) + '</span>'; }).join('') + '</div>';
    ROWS.forEach(function (row) {
      var isMove = MOVES.some(function (m) { return m[0] === row[0]; });
      h += '<div class="cs-tr' + (isMove ? ' cs-move' : '') + '" role="row"><span class="cs-mom" role="rowheader">' + esc(row[1]) + '</span>' + RUNS.map(function (r, ci) { var src = r.frames[row[0]], m = MK[key(row[0], r)] || {};
        return '<figure role="cell" class="cs-f' + (m.m ? ' m-' + m.m : '') + '" data-r="' + row[0] + '" data-c="' + ci + '" tabindex="0" aria-label="' + esc(r.build + ' · ' + row[1] + ' · ' + r.light + (m.m ? ' · marked ' + markWord(m.m) : '')) + '">' +
          (src ? '<img src="' + src + '" alt="">' : '<i class="cs-ph">' + (r.example ? 'example · placeholder' : 'no capture') + '</i>') +
          '<figcaption>' + esc(r.build) + ' · ' + esc(row[0]) + ' · ' + r.light + (m.m ? '<b>' + markWord(m.m) + '</b>' : '') + (m.note ? '<em>' + esc(m.note) + '</em>' : '') + '</figcaption></figure>'; }).join('') + '</div>';
    });
    h += '<div class="cs-tr cs-clips" role="row"><span class="cs-mom" role="rowheader">clips</span>' + RUNS.map(function (r) { var bl = r.clips && (r.clips.orbit || r.clips.pushin);
      return '<figure role="cell" class="cs-f">' + (bl ? '<video muted loop playsinline src="' + (r._url = r._url || URL.createObjectURL(bl)) + '"></video>' : '<i class="cs-ph">' + (r.example ? 'example · no clip' : 'no clip here') + '</i>') + '<figcaption>' + esc(r.build) + ' · moves · ' + r.light + '</figcaption></figure>'; }).join('') + '</div></div>';
    w.innerHTML = h; paintList(b);
  }
  function list() { var out = { keep: [], forward: [], lost: [], fix: [] }; RUNS.forEach(function (r) { ROWS.forEach(function (row) { var m = MK[key(row[0], r)]; if (m && m.m) out[m.m].push(row[1] + ' · ' + r.build + ' · ' + r.light + (m.note ? ' — ' + m.note : '')); }); }); return out; }
  function listMd() { var L = list(), s = '# bring forward · ' + build() + '\n\n'; [['keep', 'went right · keep'], ['forward', 'bring forward'], ['lost', 'lost'], ['fix', 'fix']].forEach(function (h) { s += '## ' + h[1] + '\n' + (L[h[0]].length ? L[h[0]].map(function (x) { return '- ' + x; }).join('\n') : '- nothing marked') + '\n\n'; }); return s; }
  function paintList(b) { var L = list(), n = 0, h = ''; [['keep', 'went right · keep'], ['forward', 'bring forward'], ['lost', 'lost'], ['fix', 'fix']].forEach(function (k) { if (!L[k[0]].length) return; n += L[k[0]].length; h += '<p class="oz-line"><b class="jul">' + k[1] + '</b><br>' + L[k[0]].map(esc).join('<br>') + '</p>'; });
    b.querySelector('.cs-list').innerHTML = n ? h : '<p class="oz-line quiet">tap a frame to mark it</p>'; }
  function openOne(row, ci) {
    var b = cs.body, box = b.querySelector('.cs-one'), r = RUNS[ci], rw = ROWS.filter(function (x) { return x[0] === row; })[0], m = MK[key(row, r)] || {}, other = RUNS.length > 1 ? (ci + 1) % RUNS.length : -1; ONE = { row: row, ci: ci, other: other };
    box.hidden = false;
    box.innerHTML = '<h3 class="jul">' + esc(rw[1]) + '</h3><div class="cs-stage">' + img(r.frames[row]) + (other >= 0 ? '<div class="cs-top">' + img(RUNS[other].frames[row]) + '</div><i class="cs-wipe"></i>' : '') + '</div>' +
      '<p class="oz-line">' + esc(r.build) + ' · ' + r.light + ' · ' + r.device + (other >= 0 ? '<br>over it: ' + esc(RUNS[other].build) + ' · ' + RUNS[other].light + ' · drag across to wipe' : '') + '</p>' +
      (other >= 0 ? '<input type="range" class="cs-wr" min="0" max="100" value="50" aria-label="wipe between the two builds"><div class="oz-seg"><button type="button" data-o="-1">‹ other build</button><button type="button" data-o="1">other build ›</button></div>' : '') +
      '<div class="oz-seg cs-marks" role="group" aria-label="mark this frame">' + MARKS.map(function (k) { return '<button type="button" data-m="' + k[0] + '" aria-pressed="' + (m.m === k[0]) + '">' + k[1] + '</button>'; }).join('') + '</div>' +
      '<input type="text" class="cs-note" maxlength="120" placeholder="a short note" aria-label="a note on this frame" value="' + esc(m.note || '') + '"><div class="oz-seg"><button type="button" data-a="onedone">done</button></div>';
    wipe(50); box.scrollIntoView({ block: 'nearest' });
    var rg = box.querySelector('.cs-wr'); if (rg) rg.addEventListener('input', function () { wipe(+rg.value); });
    box.querySelector('.cs-note').addEventListener('change', function () { var k = key(ONE.row, RUNS[ONE.ci]); MK[k] = Object.assign(MK[k] || {}, { note: this.value.trim() }); saveMarks(); paint(); });
  }
  function img(src) { return src ? '<img src="' + src + '" alt="">' : '<i class="cs-ph">no capture</i>'; }
  function wipe(v) { var t = cs.body.querySelector('.cs-top'), w = cs.body.querySelector('.cs-wipe'); if (t) t.style.clipPath = 'inset(0 0 0 ' + v + '%)'; if (w) w.style.left = v + '%'; }
  cs.el.addEventListener('click', function (e) {
    var b = cs.body, x = e.target.closest('button'), f = e.target.closest('.cs-f[data-r]');
    if (f && !x) { openOne(f.dataset.r, +f.dataset.c); hap('tick'); return; }
    if (!x) return;
    if (x.dataset.l) { PICK_LIGHT = x.dataset.l; b.querySelectorAll('[data-l]').forEach(function (q) { q.setAttribute('aria-pressed', q === x ? 'true' : 'false'); }); }
    if (x.dataset.a === 'walk') walk(PICK_LIGHT);
    if (x.dataset.a === 'example') { if (!RUNS.some(function (r) { return r.example; })) exampleRun(); paint(); }
    if (x.dataset.m && ONE) { var k = key(ONE.row, RUNS[ONE.ci]), cur = MK[k] || {}; cur.m = cur.m === x.dataset.m ? null : x.dataset.m; MK[k] = cur; saveMarks(); paint(); openOne(ONE.row, ONE.ci); hap('commit'); }
    if (x.dataset.o && ONE) { var o = ONE.other + +x.dataset.o; o = (o + RUNS.length) % RUNS.length; if (o === ONE.ci) o = (o + +x.dataset.o + RUNS.length) % RUNS.length; ONE.other = o; var keepRow = ONE.row, keepCi = ONE.ci; openOne(keepRow, keepCi); ONE.other = o; cs.body.querySelector('.cs-top').innerHTML = img(RUNS[o].frames[keepRow]); }
    if (x.dataset.a === 'onedone') { b.querySelector('.cs-one').hidden = true; ONE = null; }
    if (x.dataset.a === 'md') GJ.ozone.download(new Blob([listMd()], { type: 'text/markdown' }), 'bring-forward.md');
    if (x.dataset.a === 'pass') { var t = listMd(); if (navigator.share) navigator.share({ title: 'bring forward', text: t }).catch(function () {}); else GJ.ozone.download(new Blob([t], { type: 'text/markdown' }), 'bring-forward.md'); }
    if (x.dataset.a === 'png') sheetImage().then(function (c) { c.toBlob(function (bl) { GJ.ozone.download(bl, 'contact-sheet.png'); }, 'image/png'); });
    if (x.dataset.a === 'pdf') sheetImage().then(function (c) { GJ.ozone.download(GJ.ozone.pdf([{ canvas: c, line: 'contact sheet · ' + build() + ' · ' + new Date().toISOString().slice(0, 10) }]), 'contact-sheet.pdf'); });
    if (x.dataset.a === 'sync') { var vs = [].slice.call(b.querySelectorAll('.cs-clips video')); vs.forEach(function (v) { v.currentTime = 0; }); vs.forEach(function (v) { try { v.play(); } catch (er) {} }); }
  });
  function sheetImage() {   // the sheet as one picture: every frame with its label, and the marks
    var cw = 195, ch = 422, lab = 46, pad = 20, mc = 170, W = pad * 2 + mc + RUNS.length * (cw + 10), H = pad * 2 + 60 + ROWS.length * (ch + lab + 12), c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
    g.fillStyle = '#0e1014'; g.fillRect(0, 0, W, H); g.fillStyle = '#e9e6df'; g.font = '22px sans-serif'; g.fillText('Contact Sheet · ' + build(), pad, pad + 24);
    var loads = []; ROWS.forEach(function (row, ri) { var y = pad + 60 + ri * (ch + lab + 12); g.fillStyle = '#c9c6bf'; g.font = '15px sans-serif'; g.fillText(row[1], pad, y + 20);
      RUNS.forEach(function (r, ci) { var x = pad + mc + ci * (cw + 10), src = r.frames[row[0]], m = MK[key(row[0], r)] || {};
        g.fillStyle = '#9aa0aa'; g.font = '11px sans-serif'; g.fillText((r.build + ' · ' + row[0] + ' · ' + r.light).slice(0, 34), x, y + ch + 16); if (m.m) { g.fillStyle = '#e9e6df'; g.fillText(markWord(m.m) + (m.note ? ' — ' + m.note : '').slice(0, 30), x, y + ch + 32); }
        if (src) loads.push(new Promise(function (res) { var im = new Image(); im.onload = function () { GJ.ozone.drawInto(g, im, x, y, cw, ch); res(); }; im.onerror = res; im.src = src; })); else GJ.ozone.drawInto(g, null, x, y, cw, ch); }); });
    return Promise.all(loads).then(function () { return c; });
  }
  GJ.ozsweep = { walk: walk, runs: function () { return RUNS.slice(); }, moments: function () { return ROWS.map(function (r) { return r[0]; }); }, capture: capture, isWalking: function () { return walking; } };
  GJ.contactSheet = { open: cs.open, close: cs.close, isOpen: cs.isOpen, mark: function (row, ci, m, note) { var k = key(row, RUNS[ci]); MK[k] = { m: m, note: note || '' }; saveMarks(); if (cs.isOpen()) paint(); }, list: list, one: openOne, addExample: function () { exampleRun(); if (cs.isOpen()) paint(); } };
  GJ.ozone.place({ id: 'walk', name: 'sweep · walk', sub: 'walk this build on the phone', cl: 'review', open: function () { PICK_LIGHT = lightNow(); walk(PICK_LIGHT); } });
  GJ.ozone.place({ id: 'contactsheet', name: 'contact sheet', sub: 'a row a moment, a column a build', cl: 'review', open: cs.open });
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; if (x.dataset.t === 'ozwalk') { app.tune(false); walk(lightNow()); } if (x.dataset.t === 'ozcs') cs.open(); });
})(window);
