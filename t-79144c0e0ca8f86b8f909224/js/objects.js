/* tools-02 · Objects (briefs/OBJECTS.md; Gill, 18 Nov: batch three).
   Each object is a star; tap it and it comes forward as a piece you can turn and read about.
     · An object here is a turnaround: a set of photographs taken around the thing. The dial's ORBIT ring turns it
       (fast-turn flings it); a finger across the picture turns it too, with a little momentum. Pinch, the STARS word or
       the Mark goes back out to the constellation.
     · + OBJECT: choose the photographs (in the order they were taken). Give it a title, a maker, a material, a project
       and a few lines. Objects that share a maker, a material or a project sit near each other.
     · The photographs are drawn as they are — only scaled. The sky is the room; its light sits around them.
   Kept on this device (localStorage gj-objects; the photographs in GJ.keep).
   The eleven objects on the site are NOT in here: they live on the site's preview branch (full-build/src/sky/objects-3d)
   and this session could not reach it. Until they are brought in there is one sample — a form drawn on the spot, and
   labelled as that — so there is something to turn.
   Not here yet (the brief): true 3D models (a native-app job; this turns photographs), the site's own eleven. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, clamp = GJ.clamp;
  var KEY = 'gj-objects', O = { seq: 0, objects: [] };
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.objects) O = Object.assign(O, s0); } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(O)); } catch (e) {} }
  var SAMPLE = { id: 'sample', title: 'sample · a drawn form', maker: '', material: '', project: '', about: 'Drawn here, so there is something to turn. It is not one of the site\'s objects — those come in with their own photographs.', n: 48, sample: true };
  var el = document.createElement('section'); el.id = 'r-objects'; el.className = 'room'; el.setAttribute('aria-label', 'objects');   // a room of its own: the map steps back, the title reads OBJECTS, the Mark's tap is out
  el.innerHTML = '<div id="ob" class="hit"><div class="ob-sky" role="list"></div><p class="ob-say"></p>' +
    '<div class="ob-one" hidden><canvas class="ob-c" aria-label="the object: drag across to turn it"></canvas><b class="ob-t jul"></b><p class="ob-meta"></p><p class="ob-about"></p>' +
    '<div class="ob-edit" hidden><input data-k="title" placeholder="title" maxlength="60"><input data-k="maker" placeholder="maker" maxlength="40"><input data-k="material" placeholder="material" maxlength="40"><input data-k="project" placeholder="project" maxlength="40"><textarea data-k="about" rows="3" placeholder="a few lines about it" maxlength="600"></textarea></div></div>' +
    '<div class="ob-act"><button data-a="add">+ object</button><button data-a="stars" hidden>stars</button><button data-a="edit" hidden>edit</button><button data-a="drop" hidden>remove</button><button data-a="close">close</button></div><input type="file" accept="image/*" multiple hidden></div>';
  (document.getElementById('rooms') || document.body).appendChild(el);
  var q = function (s) { return el.querySelector(s); }, sky = q('.ob-sky'), one = q('.ob-one'), cv = q('.ob-c'), g = cv.getContext('2d'), say = q('.ob-say'), file = q('input[type=file]'), edit = q('.ob-edit');
  var on = false, cur = null, ang = 0, vel = 0, frames = {}, lastDraw = -1, drag = null, fps = { n: 0, t: 0, v: 0 }, picked = 0;
  function all() { return [SAMPLE].concat(O.objects); }
  function byId(id) { var a = all(); for (var i = 0; i < a.length; i++) if (String(a[i].id) === String(id)) return a[i]; return null; }
  /* the sample: a tapered six-sided form, flat-shaded, drawn once at each of its angles */
  function drawSample(k, n) {
    var c = document.createElement('canvas'); c.width = 480; c.height = 480; var x = c.getContext('2d'), a = k / n * Math.PI * 2, V = [], F = [], i;
    for (i = 0; i < 6; i++) { var t = i / 6 * Math.PI * 2; V.push([Math.cos(t) * 1, -1.05, Math.sin(t) * 1]); V.push([Math.cos(t + .28) * .62, 1.05, Math.sin(t + .28) * .62]); }
    for (i = 0; i < 6; i++) { var j = (i + 1) % 6; F.push([2 * i, 2 * j, 2 * j + 1, 2 * i + 1]); } F.push([0, 2, 4, 6, 8, 10]); F.push([11, 9, 7, 5, 3, 1]);
    var R = V.map(function (v) { var X = v[0] * Math.cos(a) + v[2] * Math.sin(a), Z = -v[0] * Math.sin(a) + v[2] * Math.cos(a), Y = v[1] * Math.cos(.32) - Z * Math.sin(.32), Z2 = v[1] * Math.sin(.32) + Z * Math.cos(.32); return [X, Y, Z2]; });
    F.map(function (f) { var z = 0; f.forEach(function (v) { z += R[v][2]; }); var p = R[f[0]], r = R[f[1]], s = R[f[2]], ux = r[0] - p[0], uy = r[1] - p[1], uz = r[2] - p[2], wx = s[0] - p[0], wy = s[1] - p[1], wz = s[2] - p[2], nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, l = Math.hypot(nx, ny, nz) || 1; return { f: f, z: z / f.length, n: [nx / l, ny / l, nz / l] }; })
      .sort(function (p, r) { return p.z - r.z; }).forEach(function (o) { var d = Math.abs(o.n[0] * -.45 + o.n[1] * -.6 + o.n[2] * .66), L = Math.round(54 + 150 * d); x.beginPath(); o.f.forEach(function (v, m) { var X = 240 + R[v][0] * 150, Y = 240 - R[v][1] * 150; if (m) x.lineTo(X, Y); else x.moveTo(X, Y); }); x.closePath(); x.fillStyle = 'rgb(' + L + ',' + Math.round(L * .98) + ',' + Math.round(L * .94) + ')'; x.fill(); x.strokeStyle = 'rgba(5,9,15,.5)'; x.lineWidth = 1; x.stroke(); });
    return c;
  }
  function load(o) {   // an object's frames, ready to draw: the sample is drawn; a real one is decoded from its photographs
    if (frames[o.id]) return Promise.resolve(frames[o.id]); var a = frames[o.id] = [];
    if (o.sample) { for (var k = 0; k < o.n; k++) a.push(drawSample(k, o.n)); return Promise.resolve(a); }
    var jobs = []; for (var i = 0; i < o.n; i++) (function (i) { jobs.push(GJ.keep.get('obj-' + o.id + '-' + i).then(function (b) { if (!b) return; return (G.createImageBitmap ? createImageBitmap(b) : new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = URL.createObjectURL(b); })).then(function (bm) { a[i] = bm; if (cur === o) lastDraw = -1; }); }).catch(function () {})); })(i);
    return Promise.all(jobs).then(function () { return a; });
  }
  function frameOf() { return cur ? ((Math.round(ang / 360 * cur.n) % cur.n) + cur.n) % cur.n : 0; }
  function draw() {
    if (!cur) return; var k = frameOf(), fr = frames[cur.id] && frames[cur.id][k]; if (k === lastDraw && fr) return; var r = cv.getBoundingClientRect(), d = Math.min(2, G.devicePixelRatio || 1), W = Math.round(r.width * d), H = Math.round(r.height * d); if (!W) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } g.clearRect(0, 0, W, H); if (!fr) return; lastDraw = k;
    var iw = fr.width, ih = fr.height, s = Math.min(W / iw, H / ih); g.imageSmoothingQuality = 'high'; g.drawImage(fr, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);   // as it is, only scaled
  }
  function tick() {
    if (!on || !cur) return; var t = GJ.now(); if (fps.t) { fps.n++; if (t - fps.t >= 500) { fps.v = fps.n * 1000 / (t - fps.t); fps.n = 0; fps.t = t; } } else fps.t = t;
    if (!drag && Math.abs(vel) > .5) { ang += vel / 60; vel *= GJ.reduced() ? 0 : .95; if (GJ.dial.visible) GJ.dial.redraw(); } else if (!drag) vel = 0;
    draw();
  }
  var ORBIT = { key: 'ob-orbit', label: 'ORBIT', min: 0, max: 360, def: 0, span: 360, unit: 1, get: function () { return ((ang % 360) + 360) % 360; }, set: function (v) { ang = v; vel = 0; }, fmt: function (v) { return Math.round(((v % 360) + 360) % 360) + '°'; } };
  var PICK = { key: 'ob-pick', label: 'STARS', min: 0, max: 1, def: 0, span: 240, unit: .05, get: function () { var n = all().length; return n > 1 ? picked / (n - 1) : 0; }, set: function (v) { var n = all().length, k = Math.round(clamp(v, 0, 1) * (n - 1)); if (k !== picked) { picked = k; light(); GJ.haptic.tick(); } }, fmt: function () { var o = all()[picked]; return o ? o.title : ''; }, hold: function (d) { var o = all()[picked]; if (d && o) openObject(o.id); } };
  function light() { [].forEach.call(sky.children, function (b, i) { b.classList.toggle('on', i === picked); }); }
  function rings() { return cur ? [ORBIT, GJ.skyRings.atmos] : [PICK, GJ.skyRings.atmos]; }
  function place() {   // near means related: objects that share a maker (or a material, or a project) gather round one point
    var a = all(), groups = {}, keys = []; a.forEach(function (o) { var kx = (o.maker || o.material || o.project || '#' + o.id).toLowerCase(); if (!groups[kx]) { groups[kx] = []; keys.push(kx); } groups[kx].push(o); });
    var pos = {}; keys.forEach(function (kx, gi) { var t = gi / Math.max(1, keys.length) * Math.PI * 2 - Math.PI / 2, cx = 50 + (keys.length > 1 ? 30 : 0) * Math.cos(t), cy = 44 + (keys.length > 1 ? 24 : 0) * Math.sin(t), m = groups[kx]; m.forEach(function (o, mi) { var u = mi / m.length * Math.PI * 2 + gi, rr = m.length > 1 ? 8 : 0; pos[o.id] = [cx + rr * Math.cos(u), cy + rr * .8 * Math.sin(u)]; }); });
    return pos;
  }
  function paintSky() {
    var pos = place(); sky.innerHTML = ''; el.classList.toggle('still', GJ.reduced()); all().forEach(function (o) { var b = document.createElement('button'); b.className = 'ob-star'; b.dataset.id = o.id; b.setAttribute('role', 'listitem'); b.style.left = pos[o.id][0] + '%'; b.style.top = pos[o.id][1] + '%'; b.innerHTML = '<i>✦</i><span></span>'; b.lastChild.textContent = o.title; sky.appendChild(b); }); picked = clamp(picked, 0, all().length - 1); light();
    say.textContent = O.objects.length ? all().length + ' objects · tap one to bring it forward · near means related' : 'one sample to turn — tap it. + object brings in photographs taken around a thing of yours. (The site\'s eleven are not in here yet.)';
  }
  function paintOne() {
    q('.ob-t').textContent = cur.title; q('.ob-meta').textContent = [cur.maker, cur.material, cur.project].filter(Boolean).join(' · ') || (cur.sample ? 'drawn here · not a photograph' : cur.n + ' photographs'); q('.ob-about').textContent = cur.about || '';
    [].forEach.call(edit.querySelectorAll('[data-k]'), function (i) { i.value = cur[i.dataset.k] || ''; });
  }
  function view() { var o = !!cur; sky.hidden = o; one.hidden = !o; q('[data-a="stars"]').hidden = !o; q('[data-a="edit"]').hidden = !o || !!cur.sample; q('[data-a="drop"]').hidden = !o || !!cur.sample; q('[data-a="drop"]').textContent = 'remove'; q('[data-a="add"]').hidden = o; edit.hidden = true; if (!o) say.hidden = false; }
  function openObject(id) { var o = byId(id); if (!o) return Promise.resolve(null); cur = o; ang = 0; vel = 0; lastDraw = -1; fps = { n: 0, t: 0, v: 0 }; view(); paintOne(); say.textContent = 'drag across it, or turn the dial, to orbit · pinch or the Mark for the stars'; if (GJ.app.room === 'objects') GJ.dial.config(rings()); GJ.haptic.commit(); return load(o).then(function () { lastDraw = -1; return o; }); }
  function toStars() { if (!cur) return false; cur = null; view(); paintSky(); if (GJ.app.room === 'objects') GJ.dial.config(rings()); return true; }
  function open() { if (GJ.app.room !== 'objects') GJ.app.enter('objects'); }
  function close() { if (GJ.app.room !== 'objects') return; cur = null; GJ.app.back(); }
  GJ.rooms.objects = { id: 'objects', title: 'objects', trees: .3, golden: 0, rings: rings, enter: function () { on = true; cur = null; view(); paintSky(); }, leave: function () { on = false; cur = null; drag = null; }, frame: tick,
    back: function () { return toStars(); }, key: function (k) { if (!cur) return; if (k === 'ArrowRight') { ang += 360 / cur.n; vel = 0; } else if (k === 'ArrowLeft') { ang -= 360 / cur.n; vel = 0; } } };
  function add(files, meta) {
    var list = [].slice.call(files || []).filter(function (f) { return f && (!f.type || f.type.indexOf('image') === 0); }); if (!list.length) return Promise.resolve(null);
    list.sort(function (a, b) { return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true }); });
    var o = Object.assign({ id: ++O.seq, title: String(list[0].name || 'object').replace(/\.[a-z0-9]+$/i, '').replace(/[-_ ]*\d+$/, '') || 'object', maker: '', material: '', project: '', about: '', n: list.length }, meta || {});
    return Promise.all(list.map(function (f, i) { return GJ.keep.put('obj-' + o.id + '-' + i, f); })).then(function () { O.objects.push(o); save(); if (on && !cur) paintSky(); return o; });
  }
  // one finger across the picture turns it. (Two fingers closing — out to the stars — is the app's own pinch: it rises one level.)
  cv.addEventListener('pointerdown', function (e) { if (drag) { drag = null; return; } e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} drag = { id: e.pointerId, x: e.clientX, a: ang, lx: e.clientX, lt: GJ.now(), v: 0 }; vel = 0; });
  cv.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return; var r = cv.getBoundingClientRect(), t = GJ.now(); ang = drag.a - (e.clientX - drag.x) / r.width * 360; drag.v = drag.v * .6 + (-(e.clientX - drag.lx) / r.width * 360 / Math.max(1, t - drag.lt) * 1000) * .4; drag.lx = e.clientX; drag.lt = t; if (GJ.dial.visible) GJ.dial.redraw();
  });
  function up(e) { if (!drag || e.pointerId !== drag.id) return; if (GJ.now() - drag.lt < 90) vel = clamp(drag.v, -900, 900); drag = null; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', function () { drag = null; });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
    if (b.classList.contains('ob-star')) { openObject(b.dataset.id); return; }
    if (a === 'close') close(); else if (a === 'stars') toStars(); else if (a === 'add') file.click(); else if (a === 'edit') { edit.hidden = !edit.hidden; say.hidden = !edit.hidden; }
    else if (a === 'drop' && cur && !cur.sample) { if (b.textContent === 'remove') { b.textContent = 'tap again: remove this object'; return; } var o = cur; for (var i = 0; i < o.n; i++) GJ.keep.del('obj-' + o.id + '-' + i); delete frames[o.id]; O.objects.splice(O.objects.indexOf(o), 1); save(); toStars(); }
  });
  edit.addEventListener('input', function (e) { var k = e.target.dataset.k; if (!k || !cur || cur.sample) return; cur[k] = e.target.value; save(); paintOne.call(null); });
  ['keydown', 'pointerdown'].forEach(function (ev) { edit.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  file.addEventListener('change', function () { add(file.files).then(function (o) { if (o) openObject(o.id).then(function () { edit.hidden = false; say.hidden = true; }); }); file.value = ''; });
  GJ.objects = { open: open, close: close, isOpen: function () { return on; }, inObject: function () { return !!cur; }, openObject: openObject, toStars: toStars, add: add, list: function () { return all().map(function (o) { return { id: o.id, title: o.title, n: o.n, maker: o.maker }; }); }, turn: function (deg) { ang = deg; vel = 0; lastDraw = -1; draw(); }, fling: function (v) { vel = v; },
    set: function (id, k, v) { var o = byId(id); if (o && !o.sample) { o[k] = v; save(); if (on && !cur) paintSky(); } }, place: place,
    state: function () { return { on: on, id: cur ? cur.id : null, ang: ang, frame: frameOf(), n: cur ? cur.n : 0, loaded: cur && frames[cur.id] ? frames[cur.id].filter(Boolean).length : 0, fps: Math.round(fps.v), vel: vel, title: cur ? cur.title : '', stars: sky.querySelectorAll('.ob-star').length }; } };
})(window);
