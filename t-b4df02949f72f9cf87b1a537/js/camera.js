/* bubble round, item 3 · the red camera. Simple first, then depth when it is reached for, then a few of oz's own rooms.
   (1) Simple: a clean viewfinder and a shutter. The dot (the chrome's own) is one tap for red mode; the Mark is Back.
       Nothing else shows until there is a capture (then a small thumbnail of the last one sits at the lower left).
       The chrome follows the light; the live view and every capture stay exactly as the sensor gives them — except in
       Full red mode, the one case where the live view and the capture itself turn red.
   (2) Depth on demand: swipe up from the shutter (or hold the viewfinder) and the controls come into the room — focus
       and exposure on dial A's rings (the dial is configured, as rooms do; it is not changed), light (the Light-tide
       clock), looks (the environment dial and its saved looks), and processing. Processing is opt-in, on a capture you already
       have, through the `redCameraProcess` slot (a labelled preview stub here): pick a look, see before and after, and
       the processed copy is saved beside the untouched original. Nothing is processed because the camera opened or the
       mode changed.
   (3) Four of oz's rooms, to start: Golden Hour (the light quality for the shot), Notes (a capture becomes a note, or
       joins the latest, with place and time), the Timer (the production timer and the lighting-setup estimator), and the
       Mark as a water mark on exports (the app's own mark, on the exported copy only).
   Captures are kept on this phone (GJ.keep), as PNG from the sensor's frame (lossless; nothing re-graded).   GJ.camera */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, html = document.documentElement, tune = document.getElementById('tune');
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t, ms) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, ms || 1800); }
  function esc(t) { return GJ.ozone && GJ.ozone.esc ? GJ.ozone.esc(t) : String(t); }
  var PROC = G.oz && G.oz.private ? G.oz.private.get('redCameraProcess') : null;
  var KEY = 'oz-camera', C = { shots: [] };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.shots) C = s0; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ shots: C.shots.slice(0, 60) })); } catch (e) {} }
  function family() { return GJ.depth ? GJ.depth.family() : (store.get().red ? 'red' : 'night'); }
  function fullRed() { return family() === 'fullred'; }
  function place() { var c = GJ.Sun && GJ.Sun.CITIES && GJ.Sun.CITIES[store.get().city]; return c ? c.name : 'here'; }
  function when(t) { var d = new Date(t); return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }

  var el = document.createElement('section'); el.id = 'cam'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'camera');
  el.innerHTML =
    '<div class="cm-frame"><video class="cm-view" playsinline muted autoplay aria-label="the viewfinder"></video><img class="cm-ex" alt="" hidden><p class="cm-exlab" hidden></p><i class="cm-focus" hidden aria-hidden="true"></i></div>' +
    '<button type="button" class="cm-thumb" hidden aria-label="the last capture"><img alt=""></button>' +
    '<button type="button" class="cm-shutter" aria-label="take a picture"><i></i></button>' +
    '<div class="cm-depth" hidden role="group" aria-label="the camera’s controls"><p class="cm-light"></p>' +
      '<div class="cm-row"><button type="button" data-d="focus" aria-pressed="false"><i>◎</i><span>focus</span></button><button type="button" data-d="exposure" aria-pressed="false"><i>±</i><span>exposure</span></button><button type="button" data-d="light"><i>◐</i><span>light</span></button><button type="button" data-d="looks"><i><svg class="oz-envmark" viewBox="0 0 16 16" aria-hidden="true"><line x1="3.1" y1="11.3" x2="7.6" y2="3.7" fill="none" stroke="currentColor" stroke-width="0.75" stroke-linecap="round"/><line x1="7.6" y1="3.7" x2="13" y2="9.3" fill="none" stroke="currentColor" stroke-width="0.75" stroke-linecap="round"/><circle cx="3.1" cy="11.3" r="1.15" fill="currentColor"/><circle cx="7.6" cy="3.7" r="1.35" fill="currentColor"/><circle cx="13" cy="9.3" r="1.15" fill="currentColor"/></svg></i><span>looks</span></button><button type="button" data-d="process"><i>◑</i><span>processing</span></button></div>' +
      '<div class="cm-row cm-oz"><button type="button" data-d="timer"><i>◷</i><span class="cm-tm">timer</span></button><button type="button" data-d="estimate"><i>▦</i><span>lighting setup</span></button><button type="button" data-d="golden"><i>☀</i><span>golden hour</span></button><button type="button" data-d="note"><i>✎</i><span>notes</span></button></div>' +
      '<p class="cm-dhint quiet">swipe down to put these away</p></div>' +
    '<div class="cm-review" hidden></div>';
  document.body.appendChild(el);
  var Q = function (s) { return el.querySelector(s); }, video = Q('.cm-view'), stream = null, track = null, on = false, depth = false, caps = {};
  var VAL = { focus: .5, exposure: 0 };

  /* ---------- the live view ---------- */
  function start() {
    var ex = Q('.cm-ex'), lab = Q('.cm-exlab');
    function fallback(why) { stream = null; track = null; video.hidden = true; var S_ = (G.GJ_SAMPLES || [])[2] || (G.GJ_SAMPLES || [])[0]; if (S_) { ex.src = S_.file; ex.hidden = false; } lab.hidden = false; lab.textContent = 'example frame · ' + why; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { fallback('the camera isn’t available here'); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false }).then(function (s) {
      stream = s; track = s.getVideoTracks()[0]; video.srcObject = s; video.hidden = false; ex.hidden = true; lab.hidden = true;
      try { caps = track.getCapabilities ? track.getCapabilities() : {}; } catch (e) { caps = {}; }
    }).catch(function () { fallback('the camera isn’t available here'); });
  }
  function stop() { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; track = null; video.srcObject = null; }
  function source() { return !video.hidden && video.videoWidth ? video : Q('.cm-ex'); }

  /* ---------- capture: the sensor's frame as it is (Full red: the frame turned red) ---------- */
  function shoot() {
    var src = source(), w = src.videoWidth || src.naturalWidth, h = src.videoHeight || src.naturalHeight; if (!w) return;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var g = cv.getContext('2d'); g.drawImage(src, 0, 0, w, h);
    var red = fullRed(); if (red) { var d = g.getImageData(0, 0, w, h), p = d.data; for (var i = 0; i < p.length; i += 4) { var L = .299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2]; p[i] = L; p[i + 1] = L * .06; p[i + 2] = L * .08; } g.putImageData(d, 0, 0); }
    el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 160); hap('commit');
    cv.toBlob(function (b) {
      var id = Date.now(), shot = { id: id, at: id, w: w, h: h, place: place(), mode: family(), fullRed: red, example: video.hidden, processed: null };
      C.shots.unshift(shot); save(); if (GJ.keep) GJ.keep.put('cam:' + id, b); URLS[id] = URL.createObjectURL(b); thumb();
    }, 'image/png');
  }
  var URLS = {};
  function url(id, k) { var key = 'cam:' + id + (k ? ':' + k : ''); if (URLS[id + (k || '')]) return Promise.resolve(URLS[id + (k || '')]); return GJ.keep ? GJ.keep.get(key).then(function (b) { if (!b) return ''; return (URLS[id + (k || '')] = URL.createObjectURL(b)); }) : Promise.resolve(''); }
  function thumb() { var t = Q('.cm-thumb'), s = C.shots[0]; t.hidden = !s; if (s) url(s.id).then(function (u) { t.querySelector('img').src = u; }); }

  /* ---------- depth on demand ---------- */
  var FOCUS = { key: 'camfocus', label: 'FOCUS', min: 0, max: 1, def: .5, span: 200, unit: .05, get: function () { return VAL.focus; }, set: function (v) { VAL.focus = v; apply('focus'); }, fmt: function (v) { return v < .15 ? 'near' : v > .85 ? 'far' : Math.round(v * 100) + ''; } };
  var EXPO = { key: 'camexpo', label: 'EXPOSURE', min: -2, max: 2, def: 0, span: 200, unit: .1, notches: function () { return [0]; }, get: function () { return VAL.exposure; }, set: function (v) { VAL.exposure = v; apply('exposure'); }, fmt: function (v) { return (v > 0 ? '+' : '') + v.toFixed(1) + ' ev'; } };
  function apply(k) {   // asks the phone's camera, when it offers the control; otherwise the value waits, and says so
    var c = {}, ok = false;
    try { if (k === 'focus' && caps.focusDistance) { c = { advanced: [{ focusMode: 'manual', focusDistance: caps.focusDistance.min + (caps.focusDistance.max - caps.focusDistance.min) * VAL.focus }] }; ok = true; }
      if (k === 'exposure' && caps.exposureCompensation) { c = { advanced: [{ exposureCompensation: Math.max(caps.exposureCompensation.min, Math.min(caps.exposureCompensation.max, VAL.exposure)) }] }; ok = true; }
      if (ok && track) track.applyConstraints(c).catch(function () {}); } catch (e) {}
    Q('.cm-light').dataset.note = ok ? '' : 'this camera decides ' + k + ' itself here';
    paintDepth();
  }
  function reveal(v) {
    depth = v == null ? !depth : v; Q('.cm-depth').hidden = !depth; el.classList.toggle('deep', depth); html.classList.toggle('cam-deep', depth);
    if (depth && GJ.dial && GJ.dial.config) { GJ.dial.config([FOCUS, EXPO]); dialOn = true; } else dialOff();
    paintDepth(); hap('tick');
  }
  var dialOn = false;
  function dialOff() { if (!dialOn) return; dialOn = false; var r = app.room && GJ.rooms && GJ.rooms[app.room]; if (r && r.rings) GJ.dial.config(r.rings()); else if (app.refreshRings) app.refreshRings(); }
  function goldenLine() { var t = ''; try { t = GJ.goodWeather && GJ.goodWeather.glanceText ? GJ.goodWeather.glanceText() : ''; } catch (e) {} return t || 'the light: reading the sky…'; }
  function paintDepth() {
    var l = Q('.cm-light'); l.textContent = goldenLine() + (l.dataset.note ? ' · ' + l.dataset.note : '');
    var tm = GJ.timer, st = store.get().timer, r = tm ? tm.remaining() : 0, mm = Math.ceil(r / 1000), s = (Math.floor(mm / 60) < 10 ? '0' : '') + Math.floor(mm / 60) + ':' + ((mm % 60) < 10 ? '0' : '') + (mm % 60);
    Q('.cm-tm').textContent = (st && st.running ? 'timer · ' : 'timer ') + s;
    Q('[data-d="focus"]').setAttribute('aria-pressed', 'false'); Q('[data-d="exposure"]').setAttribute('aria-pressed', 'false');
  }
  setInterval(function () { if (on && depth) paintDepth(); }, 1000);

  /* ---------- the review: a capture, opt-in looks, notes, export ---------- */
  function review(id) {
    var s = C.shots.filter(function (x) { return x.id === id; })[0] || C.shots[0], box = Q('.cm-review'); if (!s) return; box.hidden = false; el.classList.add('reviewing'); box.dataset.id = s.id;
    box.innerHTML = '<div class="cm-rv-h"><b class="jul">capture</b><span class="quiet">' + esc(when(s.at)) + ' · ' + esc(s.place) + (s.fullRed ? ' · full red' : '') + (s.example ? ' · example frame' : '') + '</span><button type="button" data-r="close">done</button></div>' +
      '<div class="cm-pair"><figure><img class="cm-orig" alt="the original capture"><figcaption>original · untouched</figcaption></figure>' + (s.processed ? '<figure><img class="cm-proc" alt="the processed copy"><figcaption>' + esc(s.processed.label) + ' · ' + esc(s.processed.look) + '</figcaption></figure>' : '') + '</div>' +
      '<div class="cm-acts"><button type="button" data-r="look">a look…</button><button type="button" data-r="note">a new note</button><button type="button" data-r="attach">add to the latest note</button><button type="button" data-r="export">export</button></div><div class="cm-sub"></div>';
    url(s.id).then(function (u) { box.querySelector('.cm-orig').src = u; }); if (s.processed) url(s.id, 'p').then(function (u) { var i = box.querySelector('.cm-proc'); if (i) i.src = u; });
  }
  function closeReview() { Q('.cm-review').hidden = true; el.classList.remove('reviewing'); }
  function looksSheet(s) {   // the looks already in oz (the stub's list, and the environment dial's saved looks), before and after, then save beside
    var sub = Q('.cm-sub'), L = PROC ? PROC.listLooks() : [], env = GJ.env && GJ.env.looks ? GJ.env.looks() : [];
    var all = L.map(function (x) { return { id: x.id, label: x.label } }).concat(env.map(function (x, i) { return { id: 'env:' + i, label: 'your look · ' + x.name } }));
    sub.innerHTML = '<h3 class="jul">a look · opt-in</h3><p class="quiet">nothing is processed until you choose · the original stays as it is</p><div class="cm-looks">' + all.map(function (x) { return '<button type="button" data-lk="' + esc(x.id) + '">' + esc(x.label) + '</button>'; }).join('') + '</div><button type="button" class="cm-tune" data-r="tune">tune it on the environment dial</button>';
  }
  function preview(s, lookId, label) {
    var sub = Q('.cm-sub'); if (!PROC) return; url(s.id).then(function (u) {
      var r = PROC.preview({ source: u, lookId: lookId, tune: GJ.env && GJ.env.snapshot ? GJ.env.snapshot() : {} });
      sub.innerHTML = '<h3 class="jul">before · after</h3><div class="cm-pair"><figure><img src="' + esc(r.before) + '" alt="before"><figcaption>before · the original</figcaption></figure><figure class="cm-after"><img src="' + esc(r.after) + '" alt="after"><b class="cm-stub">' + esc(r.label) + '</b><figcaption>after · ' + esc(label) + '</figcaption></figure></div>' +
        '<div class="cm-acts"><button type="button" data-r="apply" data-lk="' + esc(lookId) + '" data-ll="' + esc(label) + '">save it beside the original</button><button type="button" data-r="nolook">not this one</button></div>';
    });
  }
  function applyLook(s, lookId, label) {
    if (!PROC) return; url(s.id).then(function (u) { var r = PROC.apply({ source: u, lookId: lookId, tune: GJ.env && GJ.env.snapshot ? GJ.env.snapshot() : {} });
      fetch(r.processed).then(function (x) { return x.blob(); }).then(function (b) { if (GJ.keep) GJ.keep.put('cam:' + s.id + ':p', b); URLS[s.id + 'p'] = URL.createObjectURL(b); s.processed = { look: label, label: r.label, at: Date.now() }; save(); review(s.id); hap('commit'); say('saved beside the original · ' + r.label, 2200); }); });
  }
  function exportShot(s, which) {   // the exported copy may carry the Mark as a water mark (Tune → Camera); the kept files never do
    url(s.id, which === 'p' ? 'p' : null).then(function (u) { var im = new Image(); im.onload = function () {
      var cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; var g = cv.getContext('2d'); g.drawImage(im, 0, 0);
      function done() { cv.toBlob(function (b) { var sub = Q('.cm-sub'); if (sub) sub.innerHTML = '<h3 class="jul">exported</h3><figure class="cm-exported"><img src="' + URL.createObjectURL(b) + '" alt="the exported copy"><figcaption>the exported copy · ' + (store.get().camMark !== false ? 'the Mark at the corner' : 'no mark') + ' · the kept original is unchanged</figcaption></figure>'; if (GJ.ozone && GJ.ozone.download) GJ.ozone.download(b, 'oz-capture-' + s.id + (which === 'p' ? '-look' : '') + '.png'); say('exported · ' + (store.get().camMark !== false ? 'with the Mark' : 'no mark'), 2000); }, 'image/png'); }
      if (store.get().camMark === false) { done(); return; }
      var px = Math.round(cv.width * .045), fnt = '700 ' + px + 'px Syl, "Noto Sans Canadian Aboriginal", sans-serif';   // the Mark itself (ᑕᐣᓯ, the app's own glyph and font), quiet at the corner
      (document.fonts && document.fonts.load ? document.fonts.load(fnt, 'ᑕᐣᓯ') : Promise.resolve()).then(function () { g.font = fnt; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = px * .3; g.fillStyle = 'rgba(232,228,220,.72)'; g.fillText('ᑕᐣᓯ', cv.width - px * .8, cv.height - px * .8); g.shadowBlur = 0; done(); }, done);
    }; im.src = u; });
  }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var box = Q('.cm-review'), s = C.shots.filter(function (x) { return String(x.id) === box.dataset.id; })[0];
    if (b.classList.contains('cm-shutter')) { shoot(); return; }
    if (b.classList.contains('cm-thumb')) { review(C.shots[0] && C.shots[0].id); return; }
    var d = b.dataset.d;
    if (d === 'focus' || d === 'exposure') { b.setAttribute('aria-pressed', 'true'); if (GJ.dial && GJ.dial.summon) GJ.dial.summon(); say(d + ' · on the dial', 1400); }
    if (d === 'light' && GJ.lightTide) GJ.lightTide.open();
    if (d === 'looks' && GJ.env) GJ.env.open();
    if (d === 'process') { if (C.shots.length) { review(C.shots[0].id); looksSheet(C.shots[0]); } else say('take a picture first · looks work on a capture', 2200); }
    if (d === 'timer' && GJ.timer) { GJ.timer.toggle(); paintDepth(); hap('tick'); }
    if (d === 'estimate') { close(); app.enter('red'); setTimeout(function () { var x = document.getElementById('rm-estb'); if (x) x.click(); }, 700); }
    if (d === 'golden') { close(); app.enter('golden'); }
    if (d === 'note') { if (C.shots.length) review(C.shots[0].id); else say('take a picture first', 1600); }
    if (b.dataset.lk && !b.dataset.r && s) { preview(s, b.dataset.lk, b.textContent); return; }
    var r = b.dataset.r; if (!r) return;
    if (r === 'close') closeReview();
    if (!s) return;
    if (r === 'look') looksSheet(s);
    if (r === 'apply') applyLook(s, b.dataset.lk, b.dataset.ll);
    if (r === 'nolook') looksSheet(s);
    if (r === 'tune' && GJ.env) GJ.env.open();
    if (r === 'note' && GJ.notes) { GJ.notes.add('a capture · ' + when(s.at) + ' · ' + s.place + ' · kept on this phone (cam:' + s.id + ')'); say('a new note · ' + s.place, 1800); }
    if (r === 'attach' && GJ.notes) { GJ.notes.attach('a capture · ' + when(s.at) + ' · ' + s.place + ' (cam:' + s.id + ')'); say('added to “' + ((GJ.notes.latest() || {}).title || 'a note') + '”', 2000); }
    if (r === 'export') Q('.cm-sub').innerHTML = '<h3 class="jul">export</h3><p class="quiet">the Mark as a water mark: ' + (store.get().camMark === false ? 'off' : 'on') + ' (Tune → Camera) · the kept files never carry it</p><div class="cm-acts"><button type="button" data-r="exo">the original</button>' + (s.processed ? '<button type="button" data-r="exp">the copy with a look</button>' : '') + '</div>';
    if (r === 'exo') exportShot(s, 'o'); if (r === 'exp') exportShot(s, 'p');
  });
  // reaching for depth: swipe up from the foot, or hold the viewfinder; swipe down puts it away. A tap with the controls out sets focus there.
  var sw = null;
  el.addEventListener('pointerdown', function (e) { if (e.target.closest('.cm-review, .cm-depth button, .cm-thumb')) return; sw = { x: e.clientX, y: e.clientY, t: setTimeout(function () { if (sw && !sw.moved) { sw.held = true; if (!depth) reveal(true); } }, 520) }; });
  el.addEventListener('pointermove', function (e) { if (!sw) return; var dy = e.clientY - sw.y; if (Math.abs(dy) > 10 || Math.abs(e.clientX - sw.x) > 10) { sw.moved = true; clearTimeout(sw.t); } if (dy < -60 && !depth) { reveal(true); sw = null; } else if (dy > 60 && depth) { reveal(false); sw = null; } });
  el.addEventListener('pointerup', function (e) { if (!sw) return; clearTimeout(sw.t); var was = sw; sw = null; if (was.moved || was.held || !depth || e.target.closest('button')) return;
    var f = Q('.cm-focus'), r = el.getBoundingClientRect(); f.hidden = false; f.style.left = e.clientX + 'px'; f.style.top = e.clientY + 'px'; clearTimeout(f._t); f._t = setTimeout(function () { f.hidden = true; }, 1200);
    try { if (track && caps.pointsOfInterest !== undefined) track.applyConstraints({ advanced: [{ pointsOfInterest: [{ x: e.clientX / r.width, y: e.clientY / r.height }] }] }).catch(function () {}); } catch (x) {} hap('tick'); });

  function open() { if (on) return; on = true; el.hidden = false; html.classList.add('camming'); start(); thumb(); hap('commit'); }
  function close() { if (!on) return; on = false; stop(); reveal(false); closeReview(); el.hidden = true; html.classList.remove('camming'); }
  if (app && app.closeAny) { var c0 = app.closeAny; app.closeAny = function () { if (on) { if (!Q('.cm-review').hidden) { closeReview(); return true; } if (depth) { reveal(false); return true; } close(); return true; } return c0.apply(this, arguments); }; }
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  function paintTune() { T('cammark', store.get().camMark === false ? 'off' : 'on'); }
  store.on(paintTune); paintTune();
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; if (x.dataset.t === 'camera') { if (app.tune) app.tune(false); open(); } if (x.dataset.t === 'cammark') store.set({ camMark: store.get().camMark === false }); });
  GJ.camera = { open: open, close: close, isOpen: function () { return on; }, shoot: shoot, reveal: reveal, review: review, shots: function () { return C.shots.slice(); }, looks: function (id) { var s = C.shots.filter(function (x) { return x.id === id; })[0] || C.shots[0]; if (s) { review(s.id); looksSheet(s); } }, preview: function (lk, label) { var s = C.shots[0]; if (s) preview(s, lk, label || lk); }, apply: function (lk, label) { var s = C.shots[0]; if (s) applyLook(s, lk, label || lk); }, exportShot: function (w) { var s = C.shots[0]; if (s) exportShot(s, w || 'o'); } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'camera', name: 'red camera', sub: 'a viewfinder and a shutter · more when reached for', cl: 'make', open: open });
})(window);
