/* tools-02 · Golden Hour (the sun's day for the city, the weather, the rail from dawn to now). oz 3 alt: split out of
   rooms.js unchanged, so Good Weather (apps/good-weather) can carry it without the other rooms. No behaviour change. */
(function (G) {
  'use strict';
  var GJ = G.GJ, sky = GJ.sky, store = GJ.store, timer = GJ.timer, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var rooms = GJ.rooms = GJ.rooms || {};

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
      // bubble round, item 6 (c): two short lines in the app's voice: where the sun is, then which way is up
      var WORD = { n: 'north', ne: 'northeast', e: 'east', se: 'southeast', s: 'south', sw: 'southwest', w: 'west', nw: 'northwest' };
      var line1 = 'sun in the ' + WORD[dname] + ' · ' + (p.alt >= 0 ? Math.round(p.alt) + '° up' : Math.round(-p.alt) + '° below');
      var line2 = hd == null ? (nUp ? 'north is up · tap for your heading' : comp == null ? 'north is up · no compass' : 'north is up') : (function () { var d = ((p.az - hd + 540) % 360) - 180; return Math.abs(d) < 10 ? 'ahead of you' : 'turn ' + Math.round(Math.abs(d)) + '° ' + (d > 0 ? 'right' : 'left'); })();
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
    var listKey = '', wxDirty = true, wxKey = '', wxShown = null, lastWx = null;
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
          if (W2) lastWx = W2;   // voice pass (Gill, 19 Nov): no tech note here — the last reading "from earlier", or "waiting on the sky"
          wx.innerHTML = W2 ? '<i>good weather · ' + W2.name + '</i><span>' + W2.lines[0] + '<br>' + W2.lines[1] + '</span><em>' + W2.facts + '</em><small>' + W2.src + '</small>'
            : lastWx ? '<i>good weather · ' + lastWx.name + '</i><span>' + lastWx.lines[0] + '<br>' + lastWx.lines[1] + '</span><em>' + lastWx.facts + '</em><small>from earlier</small>'
            : '<i>good weather</i><span>the sky opens its hands<br>everything is given light</span><em>waiting on the sky</em>';
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
})(this);
