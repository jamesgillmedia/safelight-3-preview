/* tools-02 · tier 1 rooms: Safelight, Golden Hour, Loupe. Each does its job end to end. */
(function (G) {
  'use strict';
  var GJ = G.GJ, sky = GJ.sky, store = GJ.store, timer = GJ.timer, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var rooms = GJ.rooms = {};

  /* ======================= sky rings (Tune lives in the dial) ======================= */
  GJ.skyRings = {
    atmos: {
      key: 'atmos', label: 'ATMOSPHERE', min: 0, max: 1, def: 1, span: 220, unit: .1,
      get: function () { return store.get().atmos; },
      set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().atmos) store.set({ atmos: v }); },
      fmt: function (v) { return v < .02 ? 'still' : Math.round(v * 100) + '%'; }
    },
    density: {
      key: 'density', label: 'STARS', min: .3, max: 1, def: 1, span: 220, unit: .1,
      get: function () { return store.get().density; },
      set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().density) store.set({ density: v }); },
      fmt: function (v) { return Math.round(v * 100) + '%'; }
    },
    ambience: {
      key: 'ambience', label: 'AMBIENCE', min: 0, max: 1, def: .5, span: 220, unit: .1,
      get: function () { return store.get().ambience; },
      set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().ambience) store.set({ ambience: v }); },
      fmt: function (v) { return v < .34 ? 'quiet' : v > .66 ? 'bright' : 'mid'; }
    }
  };

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
        var tn = GJ.TONES[s.tone] || GJ.TONES[2], line = s.red ? tn.name : 'off';
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

  /* ======================= GOLDEN HOUR ======================= */
  (function () {
    var S = GJ.S, live = true, targetMs = Date.now(), disp = S(0), evCache = null, evKey = '';
    var NAMES = { dawn: 'civil dawn', sunrise: 'sunrise', goldenAmEnd: 'golden hour ends', noon: 'solar noon', goldenPmStart: 'golden hour', sunset: 'sunset', dusk: 'civil dusk' };
    function city() { return GJ.Sun.CITIES[store.get().city] || GJ.Sun.CITIES.vancouver; }
    function ev() {
      var c = city(), k = c.id + GJ.Sun.dayStart(targetMs, c);
      if (k !== evKey) { evCache = GJ.Sun.events(targetMs, c); evKey = k; }
      return evCache;
    }
    function mins(ms) { return (ms - ev().dayStart) / 60000; }
    function notchList() {
      var e = ev(), out = [];
      ['dawn', 'sunrise', 'goldenAmEnd', 'noon', 'goldenPmStart', 'sunset', 'dusk'].forEach(function (k) { if (e[k] != null) out.push({ k: k, m: mins(e[k]) }); });
      var nowM = mins(Date.now()); if (nowM >= 0 && nowM <= 1440) out.push({ k: 'now', m: nowM });
      return out;
    }
    /* the sun, relative to you (Gill, 17 Nov): a sky chart seen from below the zenith — the ring is the horizon, the centre
       straight up. Today's path, the sun where the dial has put it, sunrise and sunset where they rise and set. With the
       phone's compass the chart turns so the way you face is up, and it says which way to turn; without one, north is up. */
    var SC = null, scK = '';
    function sunChart(c, e, p) {
      var cv = $('gh-sun'); if (!cv) return;
      if (!SC) { SC = cv.getContext('2d'); }
      var S = cv.clientWidth, dpr = Math.min(2, G.devicePixelRatio || 1); if (cv.width !== Math.round(S * dpr)) { cv.width = cv.height = Math.round(S * dpr); }
      // north up ⇄ the way you face up (Gill, 17 Nov: "toggle up N vs up compass") — tap the chart to switch
      var comp = GJ.tilt && GJ.tilt.heading != null && store.get().tilt !== false ? GJ.tilt.heading : null, nUp = store.get().sunUp === 'north', hd = nUp ? null : comp, up = hd == null ? 0 : hd;
      var key = [Math.round(p.az * 2), Math.round(p.alt * 2), Math.round(up), c.id, e.dayStart, store.get().red, nUp, comp == null].join(); if (key === scK) return; scK = key;
      var g = SC, R = S / 2 - 12, cx = S / 2, cy = S / 2, red = store.get().red, ink = red ? '255,68,87' : '232,228,220', warm = red ? '255,68,87' : '255,214,160';
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, S, S);
      function at(az, alt) { var r = (90 - Math.max(-14, alt)) / 104 * R / (90 / 104), th = (az - up) * Math.PI / 180; r = Math.min(r, R + 6); return [cx + r * Math.sin(th), cy - r * Math.cos(th)]; }
      // horizon ring, a ring at 30° and 60° up, the cardinal letters
      g.lineWidth = 1; g.strokeStyle = 'rgba(' + ink + ',.42)'; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.stroke();
      g.strokeStyle = 'rgba(' + ink + ',.12)'; [60, 30].forEach(function (a) { g.beginPath(); g.arc(cx, cy, R * a / 90, 0, 6.283); g.stroke(); });
      g.font = '400 9px "Julius Sans One", Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(function (q) { var th = (q[1] - up) * Math.PI / 180; g.fillStyle = 'rgba(' + ink + ',' + (q[0] === 'N' ? .85 : .45) + ')'; g.fillText(q[0], cx + (R + 8) * Math.sin(th), cy - (R + 8) * Math.cos(th)); });
      // the way you face: a soft wedge up from the centre (only when the phone tells us)
      if (hd != null) { g.fillStyle = 'rgba(' + ink + ',.07)'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, -Math.PI / 2 - .5, -Math.PI / 2 + .5); g.closePath(); g.fill(); }
      // today's path: dotted under the horizon, a line above it; golden stretches warm
      var path = sky.golden.path || [];
      for (var k = 1; k < path.length; k++) {
        var a = at(path[k - 1][0], path[k - 1][1]), b = at(path[k][0], path[k][1]), alt = path[k][1];
        if (alt < 0) { if (k % 2) continue; g.strokeStyle = 'rgba(' + ink + ',.22)'; } else g.strokeStyle = alt < 6 ? 'rgba(' + warm + ',.85)' : 'rgba(' + ink + ',.6)';
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
      // sunrise and sunset, where they meet the horizon
      ['sunrise', 'sunset'].forEach(function (k) { if (e[k] == null) return; var q = GJ.Sun.position(e[k], c.lat, c.lon), m = at(q.az, 0); g.strokeStyle = 'rgba(' + warm + ',.9)'; g.beginPath(); g.moveTo(m[0] - 3, m[1]); g.lineTo(m[0] + 3, m[1]); g.moveTo(m[0], m[1] - 3); g.lineTo(m[0], m[1] + 3); g.stroke(); });
      // the sun (or where it is below the horizon: hollow)
      var s = at(p.az, p.alt);
      if (p.alt > -0.8) { var gr = g.createRadialGradient(s[0], s[1], 0, s[0], s[1], 12); gr.addColorStop(0, 'rgba(' + warm + ',.55)'); gr.addColorStop(1, 'rgba(' + warm + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(s[0], s[1], 12, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(' + (red ? ink : '255,246,230') + ',1)'; g.beginPath(); g.arc(s[0], s[1], 3.2, 0, 6.283); g.fill(); }
      else { g.strokeStyle = 'rgba(' + ink + ',.6)'; g.beginPath(); g.arc(s[0], s[1], 3, 0, 6.283); g.stroke(); }
      g.fillStyle = 'rgba(' + ink + ',.7)'; g.beginPath(); g.arc(cx, cy, 1.4, 0, 6.283); g.fill();   // you, under the zenith
      // the words under it: where the sun is, and (with a compass) which way to turn to face it
      var dirs = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'], dname = dirs[Math.round(((p.az % 360) + 360) % 360 / 45) % 8];
      var line1 = 'sun ' + Math.round(p.az) + '° ' + dname + ' · ' + (p.alt >= 0 ? Math.round(p.alt) + '° up' : Math.round(-p.alt) + '° below');
      var line2 = hd == null ? (nUp ? 'north up · tap for your heading' + (comp == null ? '' : '') : comp == null ? 'north is up · no compass here' : 'north is up') : (function () { var d = ((p.az - hd + 540) % 360) - 180; return (Math.abs(d) < 10 ? 'ahead of you' : 'turn ' + Math.round(Math.abs(d)) + '° ' + (d > 0 ? 'right' : 'left')) + ' · heading up'; })();
      $('gh-sun-t').innerHTML = line1 + '<br>' + line2;
    }
    function clock(v) {   // minutes into the day → "5:29 pm", or "17:29" when the app's clock is set to 24
      var m = Math.round(v), h = Math.floor(m / 60) % 24, ap = h < 12 ? 'am' : 'pm'; m = m % 60;
      return G.GJSun.h24 ? (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m : (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
    }
    var stuck = null, MOMENT = { dawn: 'dawn', sunrise: 'sunrise', goldenAmEnd: 'golden ends', noon: 'noon', goldenPmStart: 'golden hour', sunset: 'sunset', dusk: 'dusk' };
    var outer = {
      key: 'hour', label: 'HOUR', min: 0, max: 1440, span: 420, unit: 15,
      get: function () { return mins(targetMs); },
      // variable between the moments, and magnetic at them (Gill, 17 Nov): turning, the sun is free; within 5 min of
      // dawn, sunrise, the golden edges, noon, sunset or dusk it catches and holds (a tick) until you turn 9 min past
      set: function (v, isLive) {
        if (isLive) {
          var near = null, bd = 5;
          notchList().forEach(function (n) { var d = Math.abs(n.m - v); if (stuck && n.k === stuck.k ? d < 9 : d < bd) { if (!near || d < Math.abs(near.m - v)) near = n; } });
          if (near) { if (!stuck || stuck.k !== near.k) GJ.haptic.tick(); stuck = near; v = near.m; } else stuck = null;
        } else stuck = null;
        var prev = mins(targetMs);
        targetMs = ev().dayStart + v * 60000; live = false;
        if (isLive) sky.scrubRate = Math.min(.6, sky.scrubRate + Math.abs(v - prev) / 240);
        GJ.aim(disp, v);
      },
      notches: function () { return notchList().map(function (n) { return n.m; }); },
      stops: function () { return notchList().filter(function (n) { return n.k !== 'now'; }).map(function (n) { return n.m; }); },   // the master dial's stars: the moments
      // let go near a moment (25 min) and it glides onto it; anywhere else, it stays where you left it
      settle: function (v) {
        var best = null, bd = 25;
        notchList().forEach(function (n) { var d = Math.abs(n.m - v); if (d < bd) { bd = d; best = n; } });
        if (best && best.k === 'now') { live = true; }
        return best ? best.m : v;
      },
      fmt: function (v) { var at = notchList().filter(function (n) { return Math.abs(n.m - v) < .5 && n.k !== 'now'; })[0]; return clock(v) + (at ? ' · ' + MOMENT[at.k] : ''); }   // the dial: 12-hour clock, and the moment's name when it sits on one
    };
    // the sun's path for the day: dawn − 20 min → dusk + 20 min, every 8 min; the HOUR dial moves the sun along it
    var pathKey = '';
    function setPath() {
      var e = ev(), c = city(), k = c.id + e.dayStart; if (k === pathKey) return; pathKey = k;
      var a = (e.dawn || e.dayStart + 6 * 3600000) - 20 * 60000, b = (e.dusk || e.dayStart + 18 * 3600000) + 20 * 60000, out = [];
      for (var t = a; t <= b; t += 8 * 60000) { var p = GJ.Sun.position(t, c.lat, c.lon); out.push([p.az, p.alt]); }
      sky.golden.path = out;
    }
    function toNow() { live = true; targetMs = Date.now(); GJ.aim(disp, mins(targetMs)); GJ.haptic.commit(); days(); }
    // today · tomorrow · the day after: the same time of day, on another day — sky, path, rail and times follow
    function dayOff() { return Math.round((GJ.Sun.dayStart(targetMs, city()) - GJ.Sun.dayStart(Date.now(), city())) / 86400000); }
    function toDay(k) {
      k = Math.max(0, Math.min(2, k)); var d = k - dayOff(); if (!d) return;
      live = false; targetMs += d * 86400000; evKey = ''; GJ.haptic.tick(); days(); GJ.rail.redraw();
    }
    function dayName(k) {
      if (!k) return 'today';
      var c = city(), t = Date.now() + k * 86400000, off = GJ.Sun.offsetFor(t, c), d = new Date(t + off * 60000);
      return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getUTCDay()] + ' ' + d.getUTCDate();
    }
    function days() {
      var box = $('gh-days'); if (!box) return;
      if (!box.firstChild) for (var k = 0; k < 3; k++) { var b = document.createElement('button'); b.onclick = toDay.bind(null, k); box.appendChild(b); }
      var cur = dayOff();
      [].forEach.call(box.children, function (b, k) {
        b.textContent = dayName(k); b.classList.toggle('on', k === cur);
        var ds = GJ.Sun.dayStart(Date.now(), city()) + k * 86400000, w = GJ.weather && GJ.weather.forDay(ds + 12 * 3600000, city());   // each day's high, under its name
        b.setAttribute('data-wx', w ? Math.round(w.hi) + '° · ' + w.name : '');
      });
    }
    var listKey = '', wxDirty = true, wxKey = '', wxShown = null;
    if (GJ.weather) GJ.weather.changed = function () { wxDirty = true; };
    var DAY = { key: 'day', label: 'DAY', min: 0, max: 2, def: 0, span: 160, unit: 1,
      get: function () { return dayOff(); }, step: function (v) { return Math.round(v); },
      set: function (v) { toDay(v); }, fmt: function (v) { return dayName(Math.round(v)); } };
    outer.alt = DAY; DAY.alt = outer;
    // the camera rail: the day's events as level dots (tap to glide the sun there; drag between them)
    var EV = ['dawn', 'sunrise', 'noon', 'sunset', 'dusk'];
    function evMins() { var e = ev(); return EV.map(function (k) { return mins(e[k]); }); }
    var RAIL = {
      stops: EV.map(function (k) { return { label: NAMES[k] }; }).concat([{ label: 'now' }]),
      label: function (i) { if (i === 5) return 'now'; var m = evMins()[i]; return NAMES[EV[i]] + ' ' + clock(m); },
      get: function () {
        if (live) return 5;
        var m = evMins(), x = disp.x;
        if (x <= m[0]) return 0; if (x >= m[4]) return 4;
        for (var i = 0; i < 4; i++) if (x <= m[i + 1]) return i + (x - m[i]) / (m[i + 1] - m[i]);
        return 4;
      },
      go: function (i) { if (i === 5) { toNow(); return; } var m = evMins()[i]; live = false; targetMs = ev().dayStart + m * 60000; GJ.aim(disp, m); sky.scrubRate = .4; },
      scrub: function (f) {
        var m = evMins(); f = Math.min(f, 4); var i = Math.min(3, Math.floor(f)), v = m[i] + (m[i + 1] - m[i]) * (f - i);
        var prev = disp.t; live = false; targetMs = ev().dayStart + v * 60000; GJ.aim(disp, v);
        sky.scrubRate = Math.min(.6, sky.scrubRate + Math.abs(v - prev) / 240);
      },
      rest: function () {}
    };
    // reversed (Gill, 17 Nov): the day climbs the rail — now on top, then dusk, sunset … dawn at the bottom
    var R0 = RAIL, NS = R0.stops.length - 1;
    RAIL = { stops: R0.stops.slice().reverse(), label: function (i) { return R0.label(NS - i); }, get: function () { return NS - R0.get(); },
      go: function (i) { R0.go(NS - i); }, scrub: function (f) { R0.scrub(NS - f); }, rest: function () {} };
    rooms.golden = {
      id: 'golden', title: 'golden hour', trees: 1, golden: 1, wxNow: function () { return wxShown; },
      rings: function () { return [outer, GJ.skyRings.atmos]; },
      rail: function () { return RAIL; },
      enter: function () {
        live = true; targetMs = Date.now(); evKey = ''; days();
        GJ.aim(disp, mins(targetMs), true);
        $('sub').classList.add('on');
        pathKey = ''; setPath(); GJ.aim(sky.golden.pathA, 1);
        var e = ev(), c = city(), F = function (k) { return GJ.Sun.fmt12(e[k], c); };
        $('gh-debug').textContent = c.name + ' ' + new Date(e.noon + GJ.Sun.offsetFor(e.noon, c) * 60000).toISOString().slice(0, 10) +
          ' · dawn ' + F('dawn') + ' · sunrise ' + F('sunrise') + ' · noon ' + F('noon') + ' · sunset ' + F('sunset') + ' · dusk ' + F('dusk');
      },
      leave: function () { $('sub').classList.remove('on'); GJ.aim(sky.golden.pathA, 0); },
      toNow: toNow,
      state: function () { return { live: live, targetMs: targetMs, dispMin: disp.x, events: ev() }; },
      frame: function (dt) {
        if (live) { targetMs = Date.now(); if (Math.abs(disp.t - mins(targetMs)) > .01) disp.t = mins(targetMs); }
        GJ.sstep(disp, dt); setPath();
        var c = city(), t = ev().dayStart + disp.x * 60000, p = GJ.Sun.position(t, c.lat, c.lon);
        GJ.aim(sky.golden.sun, p.alt, true); GJ.aim(sky.golden.sunAz, p.az, true);
        GJ.app.lookBase = GJ.clamp((p.az - 180) / 180, -.6, .6) * .5;   // the camera turns with the sun
        sunChart(c, ev(), p);
        // the quiet line: the event (when near one) and the city, or the time
        var e = ev(), label = null;
        for (var k in NAMES) if (e[k] != null && Math.abs(mins(e[k]) - disp.x) < 6) { label = NAMES[k]; break; }
        var timeTxt = clock(disp.x);
        var lk = c.id + ev().dayStart + (G.GJSun.h24 ? 'h' : '');   // the list is rewritten when the day, the city or the clock changes
        // good weather: the sky at the time being shown, in Gill's words — it changes as you scrub through the day
        var W2 = GJ.weather && GJ.weather.forDay(t, c, ev()), wk = W2 ? W2.name + W2.facts : 'none'; wxShown = W2;
        if (wk !== wxKey || wxDirty) {
          wxDirty = false; wxKey = wk; var wx = $('gh-wx');
          wx.innerHTML = W2 ? '<i>good weather · ' + W2.name + '</i><span>' + W2.lines[0] + '<br>' + W2.lines[1] + '</span><em>' + W2.facts + '</em><small>' + W2.src + '</small>'
            : '<i>good weather</i><span>the sky opens its hands<br>everything is given light</span><em>the forecast reaches safelight outside this preview</em>';
          wx.classList.remove('in'); void wx.offsetWidth; wx.classList.add('in');
        }
        if (lk !== listKey) {   // the day in four quiet rows (tool-apps pack, Golden Hour)
          listKey = lk; var F2 = function (k) { return GJ.Sun.fmt12(e[k], c); }, tt = function (a2, b2) { return F2(a2).replace(/ (am|pm)$/, F2(b2).slice(-3) === F2(a2).slice(-3) ? '' : ' $1') + '–' + F2(b2); };
          $('gh-list').innerHTML = 'golden<b>' + tt('sunrise', 'goldenAmEnd') + ' · ' + tt('goldenPmStart', 'sunset') + '</b><br>blue<b>' + tt('dawn', 'sunrise') + ' · ' + tt('sunset', 'dusk') + '</b><br>sun<b>' + F2('sunrise') + ' – ' + F2('sunset') + '</b>';
        }
        var dk = dayOff(), line = (live ? 'now · ' : '') + (dk ? dayName(dk) + ' · ' : '') + (label ? label + ' · ' + timeTxt : timeTxt) + ' · ' + c.name.toLowerCase();
        var b = $('sub').firstChild;
        if (!b || b.tagName !== 'BUTTON') { $('sub').innerHTML = '<button aria-label="return to now"></button>'; b = $('sub').firstChild; b.onclick = toNow; }
        if (b.textContent !== line) b.textContent = line;
      }
    };
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

  GJ.Sun = G.GJSun;
})(this);
