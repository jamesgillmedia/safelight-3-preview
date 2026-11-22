/* tools-02 · tier 1 rooms: the Timer (red mode, the timer) and Loupe. Each does its job end to end.
   oz 3 alt: the sky rings moved to skyrings.js and Golden Hour to golden.js, unchanged. */
(function (G) {
  'use strict';
  var GJ = G.GJ, sky = GJ.sky, store = GJ.store, timer = GJ.timer, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var rooms = GJ.rooms = GJ.rooms || {};

  /* ======================= RED MODE — the tool ======================= */
  (function () {
    var doneT = 0, lastShown = '';
    // outer: tune red mode (tone + lamp strength, site inks only). Turning it switches red mode on.
    var tone = {
      key: 'tone', label: 'TONE', min: 0, max: GJ.TONES.length - 1, def: 2, span: 200, unit: 1,
      get: function () { return store.get().tone; },
      step: function (v) { return Math.round(v); },
      set: function (v) { var s = store.get(); if (v !== s.tone || !s.red) store.set({ tone: v, red: true }); if (GJ.app && GJ.app.room === 'red') GJ.aim(sky.cam.z, 2.6 + v * .18); },
      fmt: function (v) { return GJ.TONES[Math.round(v)].name; }
    };
    // inner: the auto-off timer — red mode turns itself off when it runs out
    var time = {
      key: 'time', label: 'TIME', min: 5 / 60, max: 90, def: 25, span: 300, unit: 1,
      stops: function () { return [1 / 6, 1, 5, 10, 25, 45, 90]; },   // the master dial's stars: the presets, not even steps
      get: function () { return timer.remaining() / 60000; },
      // seconds: 5 s under a minute, 15 s to five, 30 s to twenty, then minutes; fine control (thumb in from the edge): 1 s
      step: function (v, fine) {
        var sec = v * 60, q = fine && fine < 1 ? 1 : v < 1 ? 5 : v < 5 ? 15 : v < 20 ? 30 : 60;
        return Math.max(5, Math.round(sec / q) * q) / 60;
      },
      set: function (v) { var ms = Math.round(v * 60000); if (Math.abs(ms - timer.remaining()) > 999) timer.setTo(ms); },
      fmt: function (v) { return GJ.fmtMs(v * 60000); }
    };
    // the timer's rail: quick presets (the camera-control style); tap one to set it, drag between them
    var PRE = [1 / 6, .5, 1, 5, 10, 25, 45, 60, 90];
    function preName(m) { return m < 1 ? Math.round(m * 60) + ' s' : m + ' min'; }
    var RAIL = {
      stops: PRE.map(function (m) { return { label: preName(m) }; }),
      label: function (i) { return preName(PRE[i]); },
      get: function () {
        var m = store.get().timer.setMs / 60000;
        for (var i = 0; i < PRE.length - 1; i++) if (m <= PRE[i + 1]) return i + (m - PRE[i]) / (PRE[i + 1] - PRE[i]);
        return PRE.length - 1;
      },
      go: function (i) { timer.setTo(PRE[i] * 60000); GJ.dial.redraw(); },
      scrub: function (f) { var i = Math.min(PRE.length - 2, Math.floor(f)), m = PRE[i] + (PRE[i + 1] - PRE[i]) * (f - i); timer.setTo(time.step(m) * 60000); GJ.dial.redraw(); },
      rest: function () {}
    };
    rooms.red = {
      id: 'red', title: 'timer', trees: .45, golden: 0,
      rings: function () { return [tone, time]; },
      rail: function () { return RAIL; },
      enter: function () { $('title').classList.add('out'); },
      leave: function () {},
      frame: function () {
        var s = store.get(), t = s.timer, r = timer.remaining();
        if (t.running && r <= 0) {
          if (alertMode() === 'sound' && GJ.loops) GJ.loops.alarm();   // alarm: three bell strikes · silent: vibration and the lamp only
          GJ.haptic.alarm();   // a strong buzz where the phone allows it; the lamp pulses three times either way
          var lampEl = document.querySelector('#r-red .lamp'); lampEl.classList.remove('ending'); void lampEl.offsetWidth; lampEl.classList.add('ending');
          timer.expire();
          $('rm-done').classList.add('on'); clearTimeout(doneT);
          doneT = setTimeout(function () { $('rm-done').classList.remove('on'); }, 4000);
        }
        var txt = GJ.fmtMs(r);
        if (txt !== lastShown) { $('rm-tap').textContent = txt; lastShown = txt; }
        var inSession = t.running || (r > 0 && r < t.setMs - 500);
        var C = 2 * Math.PI * 86, prg = document.querySelector('#rm-ring .prg');
        prg.style.strokeDasharray = C; prg.style.strokeDashoffset = (C * (1 - (t.setMs ? r / t.setMs : 0))).toFixed(1);
        $('rm-time').classList.toggle('run', t.running);
        $('rm-title').classList.toggle('under', inSession);
        $('rm-go').textContent = t.running ? 'pause' : inSession ? 'resume' : 'start';
        $('rm-plus').style.display = inSession ? '' : 'none';
        var am = alertMode(), alb = $('rm-al');
        if (alb.dataset.m !== am) { alb.dataset.m = am; alb.textContent = am === 'sound' ? 'alarm' : 'silent'; alb.classList.toggle('sound', am === 'sound'); }
        var tn = GJ.TONES[s.tone] || GJ.TONES[2], line = 'lighting setup first · then the clock';
        if ($('rm-tone').textContent !== line) $('rm-tone').textContent = line;
        var lamp = document.querySelector('#r-red .lamp');
        lamp.classList.toggle('rose', tn.id === 'rose');
        // the last ten seconds: the lamp breathes, slowly, so you can see the end coming without looking at the numbers
        var last = t.running && r < 10000;
        lamp.style.opacity = last && s.red ? String(tn.lamp * (.55 + .45 * Math.cos((10000 - r) / 1000 * Math.PI) * (.3 + .7 * GJ.sky.atmos))) : '';
      }
    };
    // starting the timer is starting a red mode session: red goes on with it
    function toggle() { if (GJ.audio) GJ.audio.ctx(); if (!store.get().timer.running && !store.get().red) store.set({ red: true }); timer.toggle(); GJ.haptic.commit(); }
    rooms.red.toggle = toggle;
    $('rm-tap').addEventListener('click', toggle);
    $('rm-go').addEventListener('click', toggle);
    // at the end: alarm (sound + vibration) or silent (vibration + the lamp)
    function alertMode() { var s = store.get(); return s.alert || (s.chime === false ? 'silent' : 'sound'); }
    rooms.red.alertMode = alertMode;
    $('rm-al').addEventListener('click', function () { store.set({ alert: alertMode() === 'sound' ? 'silent' : 'sound' }); GJ.haptic.tick(); });
    $('rm-plus').addEventListener('click', function () {   // +30 s: more time, without stopping
      var t = store.get().timer, r = timer.remaining() + 30000;
      if (t.running) store.set({ timer: { setMs: Math.max(t.setMs, r), running: true, endAt: Date.now() + r, remainMs: r } });
      else store.set({ timer: { setMs: Math.max(t.setMs, r), running: false, endAt: 0, remainMs: r } });
      GJ.haptic.tick(); GJ.dial.redraw();
    });
  })();

  /* ======================= LOUPE ======================= */
  (function () {
    var S = GJ.S, list = G.GJ_SAMPLES, idx = 0, img = $('lp-img'), view = $('lp-view');
    var px = S(0), py = S(0), z = 1, fit = 1, iw = 1280, ih = 720, vw = 1, vh = 1, ready = false;
    var drag = null, lastTap = { t: 0, x: 0, y: 0 }, zAnim = null;
    function rect() { var r = view.getBoundingClientRect(); vw = r.width; vh = r.height; return r; }
    function stops() { var s = [fit, 1, 2, 4].filter(function (v) { return v >= fit - 1e-6 && v <= 4; }); return s; }
    function zMax() { return Math.max(4, fit); }
    function uOf(zz) { return Math.log(zz / fit) / Math.log(zMax() / fit); }
    function zOf(u) { return fit * Math.pow(zMax() / fit, u); }
    function bounds() {
      var w = iw * z, h = ih * z;
      return { x0: w <= vw ? (vw - w) / 2 : vw - w, x1: w <= vw ? (vw - w) / 2 : 0, y0: h <= vh ? (vh - h) / 2 : vh - h, y1: h <= vh ? (vh - h) / 2 : 0 };
    }
    function clampPan(instant) {
      var b = bounds();
      var tx = clamp(px.t, b.x0, b.x1), ty = clamp(py.t, b.y0, b.y1);
      if (instant) { px.x = clamp(px.x, b.x0, b.x1); py.x = clamp(py.x, b.y0, b.y1); }
      px.t = tx; py.t = ty;
    }
    // zoom about a point in view coords (default: centre), the subject stays put
    function zoomTo(nz, ax, ay) {
      ax = ax == null ? vw / 2 : ax; ay = ay == null ? vh / 2 : ay;
      var ix = (ax - px.x) / z, iy = (ay - py.x) / z;
      z = clamp(nz, fit, zMax());
      px.x = px.t = ax - ix * z; py.x = py.t = ay - iy * z; px.v = py.v = 0;
      var b = bounds(); px.x = px.t = clamp(px.x, b.x0, b.x1); py.x = py.t = clamp(py.x, b.y0, b.y1);
    }
    function load(i) {
      idx = (i + list.length) % list.length; ready = false;
      var s = list[idx]; iw = s.w; ih = s.h;
      img.src = s.file; img.alt = s.title;
      $('lp-name').textContent = s.title;
      if ($('tn-still')) $('tn-still').textContent = s.title.split(' · ').pop();
      if (store.get().photo !== s.id) store.set({ photo: s.id });
      layout(true);
    }
    function layout(reset) {
      rect(); fit = Math.min(vw / iw, vh / ih);
      if (reset || z < fit) { z = fit; zAnim = null; }
      img.style.width = iw + 'px'; img.style.height = ih + 'px';
      clampPan(true); if (reset) { var b = bounds(); px.x = px.t = b.x0; py.x = py.t = b.y0; px.v = py.v = 0; }
      ready = true;
    }
    img.addEventListener('load', function () { iw = img.naturalWidth; ih = img.naturalHeight; layout(true); });
    G.addEventListener('resize', function () { if (rooms.loupe.open) layout(false); });

    var outer = {
      key: 'zoom', label: 'ZOOM', min: 0, max: 1, span: 300, unit: .05,
      get: function () { return zAnim ? uOf(zAnim.to) : uOf(z); },
      set: function (u, isLive) {
        if (isLive === false && !GJ.reduced() && Math.abs(zOf(u) - z) > 1e-4) zAnim = { from: z, to: zOf(u), t0: GJ.now(), ax: vw / 2, ay: vh / 2 };
        else zoomTo(zOf(u));
        GJ.aim(sky.cam.z, 2.6 + u * 1.2);
      },
      notches: function () { return stops().map(uOf); },
      // suggested stops: fit / 1× / 2× / 4× — settle if close, else rest where left
      settle: function (u) {
        var best = u, bd = .05;
        stops().forEach(function (s) { var d = Math.abs(uOf(s) - u); if (d < bd) { bd = d; best = uOf(s); } });
        return best;
      },
      fmt: function (u) { var zz = zOf(u); return Math.abs(zz - fit) < .005 ? 'fit' : (zz).toFixed(zz < 1 ? 2 : 1) + '×'; }
    };

    // the camera rail: the lens stops as level dots
    function railStops() { return stops(); }
    function zEase(to) { if (GJ.reduced()) zoomTo(to); else zAnim = { from: z, to: to, t0: GJ.now(), ax: vw / 2, ay: vh / 2 }; GJ.aim(sky.cam.z, 2.6 + uOf(to) * 1.2); }
    var RAIL = {
      stops: [{ label: 'fit' }, { label: '1×' }, { label: '2×' }, { label: '4×' }],
      label: function (i) { var st = railStops(); return i < st.length ? (i === 0 ? 'fit' : st[i] + '×') : ''; },
      get: function () {
        var st = railStops(), zz = zAnim ? zAnim.to : z;
        for (var i = 0; i < st.length - 1; i++) if (zz <= st[i + 1]) return i + Math.log(zz / st[i]) / Math.log(st[i + 1] / st[i]);
        return st.length - 1;
      },
      go: function (i) { var st = railStops(); zEase(st[Math.min(i, st.length - 1)]); },
      scrub: function (f) { var st = railStops(); f = Math.min(f, st.length - 1); var i = Math.min(st.length - 2, Math.floor(f)); zAnim = null; zoomTo(st[i] * Math.pow(st[i + 1] / st[i], f - i)); GJ.aim(sky.cam.z, 2.6 + uOf(z) * 1.2); },
      rest: function () {}
    };

    view.addEventListener('pointerdown', function (e) {
      if (drag) return;   // one finger pans; a second finger is not a photo zoom
      e.preventDefault();
      var r = rect(), x = e.clientX - r.left, y = e.clientY - r.top, t = GJ.now();
      // double-tap: fit ↔ 2× with ease() over 320 ms
      if (t - lastTap.t < 300 && Math.hypot(x - lastTap.x, y - lastTap.y) < 24) {
        lastTap.t = 0; var to = z > fit * 1.05 ? fit : Math.max(2, fit);
        if (GJ.reduced()) { zoomTo(to, x, y); } else zAnim = { from: z, to: to, t0: t, ax: x, ay: y };
        return;
      }
      lastTap = { t: t, x: x, y: y };
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: px.x, py: py.x, vx: 0, vy: 0, lt: t, lx: e.clientX, ly: e.clientY };
      try { view.setPointerCapture(e.pointerId); } catch (x2) {}
      $('lp-edge').classList.add('on');
    });
    view.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var t = GJ.now(), dt = Math.max(1, t - drag.lt) / 1000;
      var b = bounds();
      px.x = px.t = clamp(drag.px + e.clientX - drag.x, b.x0, b.x1);
      py.x = py.t = clamp(drag.py + e.clientY - drag.y, b.y0, b.y1); px.v = py.v = 0;
      var ivx = (e.clientX - drag.lx) / dt, ivy = (e.clientY - drag.ly) / dt;
      drag.vx = drag.vx * .6 + ivx * .4; drag.vy = drag.vy * .6 + ivy * .4;
      drag.lt = t; drag.lx = e.clientX; drag.ly = e.clientY;
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      // inertia: a short glide, velocity clamped, settle on sstep W_GLIDE, never past the bitmap
      var cap = 1.4 * Math.max(vw, vh), vx = clamp(drag.vx, -cap, cap), vy = clamp(drag.vy, -cap, cap);
      if (GJ.now() - drag.lt > 90) { vx = vy = 0; }
      var sdx = e.clientX - drag.x;
      if (z <= fit * 1.01 && Math.abs(sdx) > 56 && Math.abs(sdx) > Math.abs(e.clientY - drag.y)) {
        drag = null; $('lp-edge').classList.remove('on');
        load(idx + (sdx < 0 ? 1 : -1));
        var b2 = bounds(); px.x = b2.x0 + (sdx < 0 ? vw * .35 : -vw * .35); px.t = b2.x0; px.v = 0;   // glides in from the swipe side
        if (GJ.reduced()) px.x = px.t;
        return;
      }
      px.t = px.x + vx * .24; py.t = py.x + vy * .24; px.v = vx * .55; py.v = vy * .55;
      clampPan(false);
      if (GJ.reduced()) { px.x = px.t; py.x = py.t; px.v = py.v = 0; }
      drag = null;
      setTimeout(function () { if (!drag) $('lp-edge').classList.remove('on'); }, 420);
    }
    view.addEventListener('pointerup', release); view.addEventListener('pointercancel', release);
    $('lp-prev').addEventListener('click', function () { load(idx - 1); });
    $('lp-next').addEventListener('click', function () { load(idx + 1); });

    rooms.loupe = {
      id: 'loupe', title: 'loupe', trees: .3, golden: 0, open: false,
      rings: function () { return [outer, GJ.skyRings.atmos]; },
      rail: function () { return RAIL; },
      enter: function () {
        rooms.loupe.open = true;
        var id = store.get().photo, i = 0;
        list.forEach(function (s, k) { if (s.id === id) i = k; });
        load(i);
      },
      leave: function () { rooms.loupe.open = false; },
      prev: function () { load(idx - 1); }, next: function () { load(idx + 1); },
      state: function () { return { idx: idx, id: list[idx].id, z: z, fit: fit, px: px.x, py: py.x, b: bounds(), vw: vw, vh: vh }; },
      frame: function (dt) {
        if (!ready) return;
        if (zAnim) {
          var u = Math.min(1, (GJ.now() - zAnim.t0) / 320);
          zoomTo(zAnim.from + (zAnim.to - zAnim.from) * GJ.ease(u), zAnim.ax, zAnim.ay);
          if (u >= 1) { zAnim = null; GJ.dial.redraw(); }
        }
        if (!drag) {
          GJ.sstep(px, dt); GJ.sstep(py, dt);
          var b = bounds();   // hard edge: ease to the bound, no bounce past it
          if (px.x < b.x0 || px.x > b.x1) { px.x = clamp(px.x, b.x0, b.x1); px.v = 0; }
          if (py.x < b.y0 || py.x > b.y1) { py.x = clamp(py.x, b.y0, b.y1); py.v = 0; }
        }
        img.style.transform = 'translate(' + px.x.toFixed(2) + 'px,' + py.x.toFixed(2) + 'px) scale(' + z.toFixed(5) + ')';
      }
    };
  })();
})(this);
