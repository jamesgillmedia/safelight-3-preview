/* tools-02 · Sky Player — the site's sound sky as a small room (07-sky-player/BRIEF.md).
   Lost Coffee's five public titles as stars, their published waveform peaks as the constellation you play along.
   No audio ships here: each title plays the file Gill opens for it (kept in this browser, IndexedDB).
   Without a file the transport runs silently with a visible playhead (DIALS.md: a silent transport is the proof).
   Transport is typographic; the Mark lifts once (.9s ease) while playing; no beat visualizer. */
(function (G) {
  'use strict';
  var GJ = G.GJ, D = G.GJ_PLAYER, store = GJ.store;
  var $ = function (id) { return document.getElementById(id); };
  var T = D.tracks, idx = 0, playing = false, pos = 0, vol = .85, flash = .45, an = null, fbin = null, lvl = { bass: 0, mid: 0, avg: 0, fl: 0 }, files = {}, urls = {}, el = null, gain = null, srcNode = null, lastTick = 0;

  /* ---------- keep: one file per title, in this browser ---------- */
  var DBN = 'safelight-player';
  function idb() { return new Promise(function (res, rej) { try { var r = indexedDB.open(DBN, 1); r.onupgradeneeded = function () { r.result.createObjectStore('f'); }; r.onsuccess = function () { res(r.result); }; r.onerror = rej; } catch (e) { rej(e); } }); }
  function put(id, rec) { return idb().then(function (db) { return new Promise(function (res) { var tx = db.transaction('f', 'readwrite'); tx.objectStore('f').put(rec, id); tx.oncomplete = res; tx.onerror = res; }); }).catch(function () {}); }
  function restore() {
    return idb().then(function (db) {
      return Promise.all(T.map(function (t) {
        return new Promise(function (res) { var q = db.transaction('f').objectStore('f').get(t.id); q.onsuccess = function () { if (q.result && q.result.blob) files[t.id] = q.result; res(); }; q.onerror = res; });
      }));
    }).catch(function () {}).then(ui);
  }
  function urlFor(id) { var f = files[id]; if (!f) return null; return urls[id] || (urls[id] = URL.createObjectURL(f.blob)); }

  /* ---------- sound: an <audio> through the shared context (iOS ignores element volume) ---------- */
  function audio() {
    if (!el) {
      el = new Audio(); el.preload = 'auto'; el.setAttribute('playsinline', '');
      el.addEventListener('ended', next);
      el.addEventListener('error', function () { if (el.src && files[cur().id]) { say('Couldn’t play that track.'); stop(); } });
      el.addEventListener('loadedmetadata', function () { if (isFinite(el.duration)) cur().len = el.duration; ui(); });
    }
    var ac = GJ.audio && GJ.audio.ctx();
    if (ac && !srcNode) {
      try { srcNode = ac.createMediaElementSource(el); gain = ac.createGain(); gain.gain.value = vol; an = ac.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = .78; fbin = new Uint8Array(an.frequencyBinCount);
        srcNode.connect(gain); gain.connect(an); an.connect(ac.destination); }
      catch (e) { srcNode = 1; }
    }
    if (!gain) el.volume = vol;
    return el;
  }
  function cur() { return T[idx]; }
  function len(t) { t = t || cur(); return t.len || t.dur; }
  function load(i) {
    idx = (i + T.length) % T.length; pos = 0;
    var u = urlFor(cur().id), a = el;   // no audio context until a tap (play)
    if (!a) { meta(); ui(); return; }
    if (u) { if (a.src !== u) a.src = u; try { a.currentTime = 0; } catch (e) {} } else { a.removeAttribute('src'); try { a.load(); } catch (e) {} }
    meta(); ui();
  }
  function play() {
    var a = audio(), u = urlFor(cur().id);
    playing = true; lastTick = GJ.now(); sil = {};
    if (u) { if (a.src !== u) a.src = u; try { a.currentTime = pos; } catch (e) {} var p = a.play(); if (p && p.catch) p.catch(function () { say('tap play again'); playing = false; ui(); }); }
    else say('silent — open your file of ' + cur().t);
    GJ.haptic.tick(); ui();
  }
  function pause() { playing = false; if (el && !el.paused) el.pause(); GJ.haptic.tick(); ui(); }
  function stop() { playing = false; pos = 0; if (el) { el.pause(); try { el.currentTime = 0; } catch (e) {} } ui(); }
  function toggle() { if (playing) pause(); else play(); }
  // end of a title: the next one; end of the list: stop (no repeat)
  function next() { var was = playing; if (idx >= T.length - 1) { stop(); load(0); return; } load(idx + 1); if (was) play(); }
  function seek(s) { pos = Math.max(0, Math.min(len() - .05, s)); if (el && urlFor(cur().id)) try { el.currentTime = pos; } catch (e) {} }

  /* ---------- the lock screen speaks iOS (Media Session) ---------- */
  function meta() {
    var ms = navigator.mediaSession; if (!ms || !G.MediaMetadata) return;
    try {
      ms.metadata = new MediaMetadata({ title: cur().t, artist: cur().by, album: 'oz' });
      ms.setActionHandler('play', play); ms.setActionHandler('pause', pause);
      ms.setActionHandler('nexttrack', function () { var w = playing; load(idx + 1); if (w) play(); });
      ms.setActionHandler('previoustrack', function () { var w = playing; load(idx - 1); if (w) play(); });
    } catch (e) {}
  }

  /* ---------- the room ---------- */
  var noteT = 0;
  function say(t) { var n = $('sp-note'); n.textContent = t; n.classList.add('on'); clearTimeout(noteT); noteT = setTimeout(function () { n.classList.remove('on'); }, 2600); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  var shown = '';
  function ui() {
    var t = cur(), has = !!files[t.id];
    $('sp-title').textContent = t.t;
    $('sp-by').textContent = t.by;
    $('sp-hint').textContent = 'swipe to browse · tap a star to hear it · tap again to open';
    if ($('sp-crumb')) $('sp-crumb').textContent = view === 'inside' ? 'sky · sound · ' + t.t.toLowerCase() : T.length + ' songs · ' + t.by.toLowerCase() + ' · ' + Math.round(Math.min.apply(null, T.map(function (x) { return x.bpm; }))) + '–' + Math.round(Math.max.apply(null, T.map(function (x) { return x.bpm; }))) + ' bpm';
    $('sp-go').setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + t.t);
    $('sp-open').textContent = has ? 'change file' : 'open the file';
    $('r-player').classList.toggle('playing', playing);
    $('mark').classList.toggle('playing', playing);
    shown = '';
  }
  function time() {
    var s = mmss(pos) + ' / ' + mmss(len()) + (files[cur().id] ? '' : ' · no file yet');
    if (s !== shown) { $('sp-time').textContent = s; shown = s; }
  }
  // the waveform as stars: the published peaks, a star at each crest; what has played is lit
  var cv, g, W = 0, H = 0, DPR = 1;
  function size() { cv = $('sp-wave'); g = cv.getContext('2d'); DPR = Math.min(2, G.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR; }
  function draw() {
    if (!W) size(); if (!W) return;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
    var red = store.get().red, ink = red ? (GJ.sky.toneInk || '#FF4457') : '#f4f8ff', pk = cur().peaks, n = pk.length, f = pos / len();
    var bw = W / n, mid = H / 2, amb = .4 + .6 * GJ.sky.atmos;
    g.lineWidth = 1; g.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var x = i * bw + bw / 2, h = pk[i] * H * .42 + 2, lit = (i + .5) / n <= f;
      g.globalAlpha = lit ? .7 : .16; g.strokeStyle = ink;
      g.beginPath(); g.moveTo(x, mid - h); g.lineTo(x, mid + h); g.stroke();
      g.globalAlpha = lit ? .95 : .35; g.fillStyle = ink;
      g.beginPath(); g.arc(x, mid - h, lit ? 1.3 : .9, 0, 6.283); g.fill();
      if (lit && i % 3 === 0) { g.globalAlpha = .18 * amb; g.beginPath(); g.arc(x, mid - h, 4, 0, 6.283); g.fill(); }
    }
    // the playhead: a hairline, like the site's level dots
    g.globalAlpha = .8; g.strokeStyle = ink; g.beginPath(); g.moveTo(f * W, mid - H * .48); g.lineTo(f * W, mid + H * .48); g.stroke();
    g.globalAlpha = 1;
  }

  /* ---------- dials and rail ---------- */
  var FLASH = { key: 'flash', label: 'FLASH', min: 0, max: 1, def: .45, span: 220, unit: .05,
    get: function () { return flash; }, set: function (v) { flash = v; },
    meter: function () { return lvl.fl; }, fmt: function (v) { return Math.round(v * 100) + '%'; } };
  // the camera dial in the sound room: turn = orbit the song stars (fling keeps it going) · hold = push into the song ·
  // inner = colour; the dial and the colour together drive the visualizer
  var orb = 0, push = GJ.S(0), hue = 0;
  /* the visualizer's zoom (Gill, 17 Nov: "pinch to zoom on visualizer"): one value, turned by a pinch inside the song and
     by the dial's ZOOM. 1 is home; it goes in to 3. A pinch can pull it a little under home on the way out to the board. */
  var zoom = GJ.S(1), ZMAX = 3, ZUNDER = .6, pinchZ0 = null, pinchEnd = 0, pinchLive = false; zoom.w = 9;
  function zoomTo(v, live) { GJ.aim(zoom, Math.max(live ? ZUNDER : 1, Math.min(ZMAX, v)), !!live); }
  function zfmt(v) { return (Math.round(Math.max(1, v) * 10) / 10).toFixed(1) + '×'; }
  var ORB = { key: 'orbit', label: 'ORBIT', min: -3.14, max: 3.14, def: 0, span: 320, unit: .1,
    get: function () { return orb; }, set: function (v) { orb = v; }, fmt: function (v) { return Math.round(v * 57.3) + '°'; },
    hold: function (down) { GJ.aim(push, down ? 1 : 0); if (down && !playing) play(); } };
  var ZOOM = { key: 'zoom', label: 'ZOOM', min: 1, max: ZMAX, def: 1, span: 260, unit: .1,
    get: function () { return Math.max(1, Math.min(ZMAX, zoom.t)); }, set: function (v) { zoomTo(v, true); },
    notches: function () { return [1, 1.5, 2, 3]; }, fmt: zfmt, hold: ORB.hold };
  var HUES = [['night', [223, 232, 255]], ['sound', [255, 182, 176]], ['film', [150, 220, 255]], ['objects', [255, 236, 205]], ['spaces', [206, 198, 255]], ['photo', [170, 245, 212]]];
  var COL = { key: 'colour', label: 'COLOUR', min: 0, max: HUES.length - 1, def: 0, span: 300, unit: .1,
    get: function () { return hue; }, set: function (v) { hue = v; },
    notches: function () { return HUES.map(function (h, i) { return i; }); },
    fmt: function (v) { return HUES[Math.round(v)][0]; } };
  function hueRGB() { var i = Math.floor(hue), f = hue - i, a = HUES[i][1], b = HUES[Math.min(HUES.length - 1, i + 1)][1]; return [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); }); }
  var SEEK = { key: 'seek', label: 'TIME', min: 0, max: 1, def: 0, span: 300, unit: .02,
    get: function () { return pos / len(); }, set: function (v) { seek(v * len()); },
    fmt: function () { return mmss(pos) + ' / ' + mmss(len()); } };
  var VOL = { key: 'pvol', label: 'VOLUME', min: 0, max: 1, def: .85, span: 220, unit: .05,
    get: function () { return vol; },
    set: function (v) { vol = v; if (gain) gain.gain.setTargetAtTime(v, gain.context.currentTime, .05); else if (el) el.volume = v; },
    fmt: function (v) { return Math.round(v * 100) + '%'; } };
  // the rail: the five titles as level dots — tap to change, the way the site steps chapters
  var RAIL = {
    stops: T.map(function (t) { return { label: t.t }; }),
    label: function (i) { return T[i].t.toLowerCase(); },
    get: function () { return idx; },
    go: function (i) { var w = playing; if (i === idx) return; if (el) el.pause(); load(i); if (w) play(); },
    scrub: function (f) { var i = Math.round(f); if (i !== idx) RAIL.go(i); },
    rest: function () {}
  };

  GJ.rooms.player = {
    id: 'player', title: 'sky player', trees: .5, golden: 0,
    stack: false, home: function () { return 'orbit'; },   // oz one (item 8): the second ring is folded into the camera dial   // the main dial is the camera, on the board and inside (Gill, 17 Nov): ORBIT ⇅ ZOOM, hold pushes in
    rings: function () { ORB.alt = ZOOM; ZOOM.alt = ORB; COL.alt = FLASH; FLASH.alt = COL; return [ORB, COL]; },   // volume and flash keep their sliders (finger dials)
    rail: function () { return RAIL; },
    enter: function () { size(); vsize(); if (!restored) { restored = true; restore(); } if (GJ.player._inside && selIdx != null && selIdx !== idx) { if (el) el.pause(); load(selIdx); playing = false; } setView(GJ.player._inside ? 'inside' : 'board', true); if (!GJ.player._inside) arrive(); else if (!playing) play(); else cardsTo(selIdx != null ? selIdx : idx, true); GJ.player._inside = false; ui(); },
    leave: function () { selIdx = null; },
    back: function () {   // the way out of a song (app.js rise): a pinch out, Back, the Mark
      if (view !== 'inside') return false;
      if (pinchZ0 != null && (pinchLive || GJ.now() - pinchEnd < 600)) {   // (pz: still under the fingers — the room-wide pinch-out may hear the lift first)   // a pinch just ended: if it began zoomed in it was a zoom out — it stays
        var z0 = pinchZ0; pinchZ0 = null; if (z0 > 1.02) return true;   // (it stops where you let go, or at home if you went past it)
      } else if (zoom.t > 1.02) { zoomTo(1); GJ.haptic.tick(); if (GJ.mark && GJ.mark.say) GJ.mark.say('zoom · home', 900); return true; }   // Back, zoomed in: home first
      setView('board'); if (selIdx != null) { snapTo(selIdx); cardsTo(selIdx); } return true;   // from home: up to the board
    },
    frame: function (dt) { dt = dt || 1 / 60; tick(); levels(dt); GJ.sstep(fly, dt); viz(dt); board(dt); draw(); time(); }
  };
  var restored = false, sil = {};
  // the clock: the file's own time when there is one, wall time when silent
  function tick() {
    var n = GJ.now(), dt = (n - lastTick) / 1000; lastTick = n;
    if (!playing) return;
    if (el && urlFor(cur().id) && !el.paused) pos = el.currentTime;
    else if (!urlFor(cur().id)) {   // silent: wall-clock time, so a slow frame never slows the song
      if (sil.i !== idx || sil.last == null || Math.abs(pos - sil.last) > .001) { sil = { i: idx, t: n, p0: pos }; }
      pos = sil.p0 + (n - sil.t) / 1000; sil.last = pos; if (pos >= len()) { sil = {}; next(); }
    }
  }
  // playback continues outside the room (the sky keeps the music)
  (function bg() { if (GJ.app && GJ.app.room !== 'player') tick(); requestAnimationFrame(bg); })();

  $('sp-go').addEventListener('click', toggle);
  $('sp-title').addEventListener('click', toggle);
  $('sp-open').addEventListener('click', function () { $('sp-file').click(); });
  $('sp-file').addEventListener('change', function () {
    var f = this.files && this.files[0]; this.value = ''; if (!f) return;
    var t = cur(), rec = { blob: f, name: f.name };
    if (urls[t.id]) { URL.revokeObjectURL(urls[t.id]); delete urls[t.id]; }
    files[t.id] = rec; t.len = 0; put(t.id, rec);
    var w = playing; if (el) el.pause(); load(idx); say(t.t + ' · ' + f.name); if (w) play();
  });
  G.addEventListener('resize', function () { W = 0; VW = 0; });
  // VOL and FLASH, as the site's sliders
  function sl(id, get, set) { var e = $(id); function sync() { var v = Math.round(get() * 100); if (+e.value !== v) e.value = v; e.style.setProperty('--f', v + '%'); } e.addEventListener('input', function () { set(e.value / 100); sync(); }); setInterval(sync, 500); sync(); }
  sl('sp-vol', function () { return vol; }, function (v) { VOL.set(v); });
  sl('sp-flash', function () { return flash; }, function (v) { flash = v; });
  if (GJ.fingerDial && GJ.store.get().fingerDial) {   // parked (oz one, item 8): VOLUME and FLASH are rings on the camera dial; the ring round the finger is behind Tune → Developer
    GJ.fingerDial.bind($('sp-vol').parentNode, { label: 'VOLUME', min: 0, max: 1, def: .85, get: function () { return vol; }, set: function (v) { VOL.set(v); } });
    GJ.fingerDial.bind($('sp-flash').parentNode, { label: 'FLASH', min: 0, max: 1, def: .45, get: function () { return flash; }, set: function (v) { flash = v; } });
  }
  // the waveform is the scrub (the site's sound bar): tap or drag along it
  (function () {
    var wv = $('sp-wave'), on = false;
    function at(e) { var r = wv.getBoundingClientRect(); seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * len()); GJ.haptic.tick(); }
    wv.addEventListener('pointerdown', function (e) { on = true; try { wv.setPointerCapture(e.pointerId); } catch (x) {} at(e); });
    wv.addEventListener('pointermove', function (e) { if (on) at(e); });
    wv.addEventListener('pointerup', function () { on = false; }); wv.addEventListener('pointercancel', function () { on = false; });
  })();

  /* ---------- inside: the sound visualizer (the site's sound room, inside view) — a sphere of stars webbed in hairlines,
     a far web of long threads around it, a soft nucleus, two or three out-of-focus motes. It turns with the look and the
     phone's tilt; the music swells it (bass), lights it (mids) and, with FLASH, flares on the hits.
     With no file the published waveform peaks and the tempo drive it, so it is never dead. ---------- */
  function levels(dt) {
    var b = 0, m = 0;
    if (playing && an && urlFor(cur().id) && el && !el.paused) {
      an.getByteFrequencyData(fbin);
      for (var i = 1; i < 8; i++) b += fbin[i]; b /= 7 * 255;
      for (i = 12; i < 90; i++) m += fbin[i]; m /= 78 * 255;
    } else if (playing) {
      var t = cur(), f = pos / len(), pk = t.peaks[Math.min(t.peaks.length - 1, Math.floor(f * t.peaks.length))] || 0;
      var beat = (pos * t.bpm / 60) % 1, hit = Math.exp(-beat * 7);
      b = pk * (.45 + .55 * hit); m = pk * .7;
    }
    var k = 1 - Math.exp(-dt * 12);
    lvl.bass += (b - lvl.bass) * k; lvl.mid += (m - lvl.mid) * k; lvl.avg += (lvl.bass - lvl.avg) * (1 - Math.exp(-dt * 1.6));
    if (lvl.bass - lvl.avg > .1 && lvl.fl < .3) lvl.fl = 1;   // a hit: the flare
    lvl.fl *= Math.exp(-dt * 5);
  }
  var vc, vg, VW = 0, VH = 0, SPH = null, WEB = null, VA = 0;
  function vsize() { vc = $('sp-viz'); vg = vc.getContext('2d'); VW = vc.clientWidth; VH = vc.clientHeight; vc.width = VW * DPR; vc.height = VH * DPR; }
  function buildViz() {
    var sd = 5, r = function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    SPH = []; var N = 420, ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) { var y = 1 - 2 * (i + .5) / N, rr = Math.sqrt(1 - y * y), th = i * ga, j = .9 + r() * .2; SPH.push([Math.cos(th) * rr * j, y * j, Math.sin(th) * rr * j, r()]); }
    for (i = 0; i < 160; i++) { var u = r() * 2 - 1, a = r() * 6.283, s = Math.sqrt(1 - u * u), d = .35 + r() * .5; SPH.push([Math.cos(a) * s * d, u * d, Math.sin(a) * s * d, r()]); }   // the inner cloud
    function near(list, from, to, k) {
      var E = [];
      for (var a2 = from; a2 < to; a2++) {
        var best = [];
        for (var b2 = from; b2 < to; b2++) if (b2 !== a2) { var p = list[a2], q = list[b2], dd = (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) + (p[2] - q[2]) * (p[2] - q[2]); best.push([dd, b2]); }
        best.sort(function (x, y2) { return x[0] - y2[0]; }); for (var c = 0; c < k; c++) if (a2 < best[c][1]) E.push([a2, best[c][1]]);
      }
      return E;
    }
    SPH.E = near(SPH, 0, N, 3);
    WEB = [];
    for (i = 0; i < 70; i++) { var u2 = r() * 2 - 1, a3 = r() * 6.283, s2 = Math.sqrt(1 - u2 * u2), d2 = 1.5 + r() * 2.2; WEB.push([Math.cos(a3) * s2 * d2, u2 * d2 * .8, Math.sin(a3) * s2 * d2, r()]); }
    WEB.E = near(WEB, 0, WEB.length, 2);
    WEB.S = []; for (i = 0; i < 40; i++) WEB.S.push([i % WEB.length, Math.floor(r() * N)]);   // threads from the far web into the sphere
  }
  var GLW = null;
  function glw() { if (GLW) return GLW; var c = document.createElement('canvas'); c.width = c.height = 128; var q = c.getContext('2d'), gr = q.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(205,215,235,.9)'); gr.addColorStop(.25, 'rgba(205,215,235,.35)'); gr.addColorStop(.6, 'rgba(205,215,235,.08)'); gr.addColorStop(1, 'rgba(205,215,235,0)'); q.fillStyle = gr; q.fillRect(0, 0, 128, 128); return GLW = c; }
  var MOTES = [[.9, .2, -.3, 54], [-1.1, -.5, .4, 40], [.4, -1.2, .6, 30]];
  /* ---------- the visualizer is modifiable and tuneable: four modes, four settings (Tune → Visualizer, and the room's own row)
     sphere: the site's star-web · rings: orbits of stars, one per band of the music · tunnel: a fly-through of stars, the
     bass is the speed · wave: the song's own waveform as a ring of stars, the playhead lighting it · ridges · water: light
     on water, a drifting net of gathered light ---------- */
  var VMODES = ['sphere', 'rings', 'tunnel', 'wave', 'ridges', 'water'];
  var RID = [], ridT = 0, WT = 0, WG = null;
  /* ---------- the board (the site's sound room): the song stars with their titles; tap one to hear it, tap it again to
     open it — the camera flies into the star and the visualizer is inside ---------- */
  var view = 'board', fly = GJ.S(0), selIdx = null, BOARD = [], flyAt = null;
  function setView(v, instant) {
    var was = view; view = v; $('r-player').classList.toggle('inside', v === 'inside');
    if (v !== 'inside') zoomTo(1);
    else if (was !== 'inside' && !instant) vizTeach();
    GJ.aim(fly, v === 'inside' ? 1 : 0, !!instant); if (v === 'board' && !instant) flyAt = flyAt || null;
    ui();
  }
  var SEAT = { togo: 7, noproblem: 5, lostintime: 9, equals: 13, ii: 2 };
  /* the board scrolls (Gill, 17 Nov): it spreads wider than the screen when you arrive, then snaps onto the song so you
     can scroll through them — a drag or a fling glides it, and it always settles on a song star. Swipeable cards under it
     move with it. One tap selects (and hears); tap again, or pinch in, and you are inside the song. */
  var SX = GJ.S(0), SPR = GJ.S(1), BWID = 0, ORDER = null;
  SX.w = 6.5; SPR.w = 3.2;
  function bw() { return (VW - 56) * 1.12; }   // settled, every song is in view (Gill, 17 Nov); scrolling side to side brings one into the lock
  function seatX(i) { return D.shape.s[SEAT[T[i].id]][0] * bw(); }
  function order() { if (!ORDER) ORDER = T.map(function (t, i) { return i; }).filter(function (i) { return SEAT[T[i].id] != null; }).sort(function (a, b) { return seatX(a) - seatX(b); }); return ORDER; }
  function nearestSeat(x) { var best = order()[0], bd = 1e9; order().forEach(function (i) { var d = Math.abs(seatX(i) - x); if (d < bd) { bd = d; best = i; } }); return best; }
  function snapTo(i, instant) { if (!VW) vsize(); GJ.aim(SX, seatX(i), !!instant); }
  function choose(i, how) {   // how: 'hear' · 'quiet' (a scroll: it plays on only if something was playing) · 'pick' (a first tap: highlight + title, no sound)
    var changed = selIdx !== i; selIdx = i; snapTo(i);
    if (how === 'hear') hear(i); else if (how === 'pick') { if (changed) say('tap again to open'); } else if (changed) { var w = playing; if (el) el.pause(); load(i); if (w) play(); }
    if (changed) GJ.haptic.tick(); cardsTo(i); ui();
  }
  // the second tap (or a pinch in) on the picked song: into it, and only now it plays — the one it shows, not the last one heard
  function into() { GJ.haptic.commit(); if (selIdx != null && selIdx !== idx) { if (el) el.pause(); load(selIdx); playing = false; } setView('inside'); if (!playing) play(); }
  function arrive() {   // the board spreads out from the constellation, then snaps onto the song
    if (!VW) vsize(); ORDER = null;
    if (selIdx == null) selIdx = SEAT[cur().id] != null ? idx : order()[0];
    GJ.aim(SPR, 0, true); GJ.aim(SPR, 1); GJ.aim(SX, bw() / 2, true);
    setTimeout(function () { if (view === 'board' && selIdx != null && T[selIdx]) snapTo(selIdx); }, GJ.reduced() ? 0 : 260);   // the room may have been left again by now (18 Nov: in and straight out threw here)
    cardsTo(selIdx, true);
  }
  function board(dt) {
    if (!VW) vsize(); if (!VW) return;
    GJ.sstep(SX, dt); GJ.sstep(SPR, dt);
    var f = fly.x, A = GJ.app.room === 'player' ? 1 : 0; if (f > .995 || !A) return;
    if (VA < .01) { vg.setTransform(DPR, 0, 0, DPR, 0, 0); vg.clearRect(0, 0, VW, VH); }
    var sh = D.shape, red = store.get().red, ink = red ? [255, 68, 87] : [255, 182, 176], white = red ? [255, 120, 130] : [244, 248, 255];
    var BW = bw(), top = VH * .25, h = Math.min(VH * .17, BW * .5), spr = Math.max(0, SPR.x), C = [VW / 2, top + h / 2];
    function P(p) { var x = VW / 2 + p[0] * BW - SX.x, y = top + p[1] * h; return [C[0] + (x - C[0]) * (.3 + .7 * spr), C[1] + (y - C[1]) * (.55 + .45 * spr)]; }
    var sel = selIdx != null ? T[selIdx] : null, sp = sel ? P(sh.s[SEAT[sel.id]]) : C;
    vg.save(); vg.setTransform(DPR, 0, 0, DPR, 0, 0);
    var fr = $('r-player').querySelector('.board'); if (fr && f < .02) { vg.beginPath(); vg.rect(fr.offsetLeft + 1, fr.offsetTop + 1, fr.offsetWidth - 2, fr.offsetHeight - 2); vg.clip(); }   // the work stays inside its frame
    if (f > .001) { var k = 1 + Math.pow(f, 2) * 14; vg.translate(sp[0], sp[1]); vg.scale(k, k); vg.translate(-sp[0], -sp[1]); }   // flying into the star
    var al = (1 - f) * (1 - f) * Math.min(1, .25 + spr), edge = function (x) { return Math.min(1, Math.max(.12, Math.min(x + 30, VW + 30 - x) / 70)); };
    vg.lineWidth = 1 / (1 + f * 14);
    sh.e.forEach(function (e) { var a = P(sh.s[e[0]]), b = P(sh.s[e[1]]); vg.strokeStyle = 'rgba(' + ink + ',' + (.42 * al * edge((a[0] + b[0]) / 2)).toFixed(3) + ')'; vg.beginPath(); vg.moveTo(a[0], a[1]); vg.lineTo(b[0], b[1]); vg.stroke(); });
    var gw = glw(), tt = GJ.now() / 1000;
    sh.s.forEach(function (p, i) {
      var q = P(p), b = (p[3] ? .4 : .55 + p[2] * .45) * edge(q[0]), r = (p[3] ? .8 : 1.1 + p[2] * 1.4);
      vg.globalAlpha = al * b * .55; var gs = 10 + p[2] * 22; vg.drawImage(gw, q[0] - gs / 2, q[1] - gs / 2, gs, gs);
      vg.globalAlpha = al * b; vg.fillStyle = 'rgb(' + white + ')'; vg.beginPath(); vg.arc(q[0], q[1], r, 0, 6.283); vg.fill();
    });
    vg.globalAlpha = 1;
    // the lock: a pair of hairline brackets in the middle — whatever song sits in it is the one you have picked
    if (f < .02) { var lx = VW / 2, ly0 = top - 30, ly1 = top + h + 14; vg.strokeStyle = 'rgba(' + white + ',' + (.38 * spr).toFixed(3) + ')'; vg.lineWidth = 1;
      vg.beginPath(); vg.moveTo(lx - 22, ly0 + 7); vg.lineTo(lx - 22, ly0); vg.lineTo(lx + 22, ly0); vg.lineTo(lx + 22, ly0 + 7); vg.moveTo(lx - 22, ly1 - 7); vg.lineTo(lx - 22, ly1); vg.lineTo(lx + 22, ly1); vg.lineTo(lx + 22, ly1 - 7); vg.stroke(); }
    // the titles on their stars (the site: title, artist under it in grey)
    BOARD = []; var taken = [];
    vg.textAlign = 'center'; vg.textBaseline = 'bottom';
    T.forEach(function (t, i) {
      var s0 = SEAT[t.id]; if (s0 == null) return; var q = P(sh.s[s0]), on = selIdx === i, ea = edge(q[0]);
      BOARD.push({ x: q[0], y: q[1], i: i });
      if (on) {   // the chosen star: a soft halo and a ring that breathes
        vg.globalAlpha = al * (.75 + .25 * Math.sin(tt * 3)); var gs2 = 46; vg.drawImage(gw, q[0] - gs2 / 2, q[1] - gs2 / 2, gs2, gs2);
        vg.globalAlpha = al * .8; vg.strokeStyle = 'rgb(' + white + ')'; vg.beginPath(); vg.arc(q[0], q[1], 7 + Math.sin(tt * 3) * 1.2, 0, 6.283); vg.stroke(); vg.globalAlpha = 1;
      }
      vg.font = '300 ' + (on ? 15 : 13) + 'px Poppins, sans-serif'; var lw = vg.measureText(t.t).width / 2 + 6, ty = q[1] - 12;
      var hit = function (y) { return taken.some(function (r) { return Math.abs(r.x - q[0]) < r.w + lw && Math.abs(r.y - y) < 32; }); };
      [-12, 32, -46, 66].some(function (d) { ty = q[1] + d; return !hit(ty); }); taken.push({ x: q[0], y: ty, w: lw });
      vg.fillStyle = 'rgba(' + (on ? white : [230, 237, 240]) + ',' + (al * ea * spr * (on ? 1 : .82)).toFixed(3) + ')'; vg.fillText(t.t, q[0], ty);
      vg.font = '300 11px Poppins, sans-serif'; vg.fillStyle = 'rgba(201,211,214,' + (al * ea * spr * .6).toFixed(3) + ')'; vg.fillText(t.by + ' · ' + Math.round(t.bpm), q[0], ty + 14);
    });
    vg.restore();
  }
  // the board: drag or fling to scroll (it settles on a song) · tap once to select and hear · again, or pinch in, to open
  (function () {
    var cvv = $('sp-viz'), dn = null, P2 = {}, pin = null;
    cvv.addEventListener('pointerdown', function (e) {
      if (view !== 'board') return; P2[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(P2); if (ids.length === 2) { var a = P2[ids[0]], b = P2[ids[1]]; pin = { d0: Math.hypot(a.x - b.x, a.y - b.y), d: 0 }; dn = null; return; }
      dn = { x: e.clientX, y: e.clientY, t: GJ.now(), sx: SX.x, moved: false, vx: 0, lx: e.clientX, lt: GJ.now() };
    });
    G.addEventListener('pointermove', function (e) {
      if (P2[e.pointerId]) { P2[e.pointerId].x = e.clientX; P2[e.pointerId].y = e.clientY; }
      var ids = Object.keys(P2); if (pin && ids.length === 2) { var a = P2[ids[0]], b = P2[ids[1]]; pin.d = Math.hypot(a.x - b.x, a.y - b.y); return; }
      if (!dn || view !== 'board') return; var dx = e.clientX - dn.x;
      if (!dn.moved && Math.abs(dx) > 8) dn.moved = true;
      if (dn.moved) {
        var lo = seatX(order()[0]) - 40, hi = seatX(order()[order().length - 1]) + 40, x = dn.sx - dx;
        if (x < lo) x = lo - (lo - x) * .35; if (x > hi) x = hi + (x - hi) * .35;   // a little give past the ends
        GJ.aim(SX, x, true); var n = GJ.now(), ddt = Math.max(1, n - dn.lt); dn.vx = dn.vx * .6 + (e.clientX - dn.lx) / ddt * .4; dn.lx = e.clientX; dn.lt = n;
      }
    });
    function up(e) {
      var wasP = !!P2[e.pointerId]; delete P2[e.pointerId];
      if (pin) {
        if (Object.keys(P2).length === 0) { var p = pin; pin = null; if (p.d && p.d / p.d0 > 1.3 && selIdx != null) into(); }
        return;
      }
      if (!dn || view !== 'board' || !wasP) { dn = null; return; } var d = dn; dn = null;
      if (d.moved) { choose(nearestSeat(SX.x - d.vx * 260), 'quiet'); return; }   // the fling carries on, then settles on a song
      if (GJ.now() - d.t > 450) return;
      var r = cvv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null, bd = 34;
      BOARD.forEach(function (b) { var dd = Math.hypot(b.x - x, b.y - y); if (dd < bd) { bd = dd; best = b; } });
      if (!best) return;
      if (selIdx === best.i) into();   // two taps (Gill's rule): the first picks it, the second opens and plays it
      else choose(best.i, 'pick');
    }
    G.addEventListener('pointerup', up); G.addEventListener('pointercancel', up);
  })();
  /* inside a song (17 Nov): tap the visualizer = play / pause · pinch = zoom · one finger still looks around.
     The visualizer's canvas lets touches through to the sky there (so the look keeps working), which is why the tap
     written on that canvas never arrived from a real finger. They are read on the sky's canvas instead, only while
     the sound room is inside a song. Pinch out past home and the room rises to the board (app.js rise → back()). */
  var tipN = 0; try { tipN = +GJ.settings.getItem('gj-viztip') || 0; } catch (e) {}
  function vizTeach() { if (tipN >= 3 || !(GJ.mark && GJ.mark.say)) return; tipN++; try { GJ.settings.setItem('gj-viztip', String(tipN)); } catch (e) {} GJ.mark.say('tap to pause · pinch to zoom · drag to look', 3200); }
  (function () {
    var sk = $('sky'), PT = {}, tp = null, pz = null, shut = false, HC = document.documentElement.classList;
    function here() { return !!GJ.app && GJ.app.room === 'player' && view === 'inside'; }
    // seen first (window, capture): was something open that this touch will only close? (the dial's menu, Tune, the places)
    G.addEventListener('pointerdown', function () { shut = HC.contains('md-open') || HC.contains('tune') || HC.contains('places'); }, true);
    sk.addEventListener('pointerdown', function (e) {
      if (!here() || shut) { PT = {}; tp = null; pz = null; pinchLive = false; return; }
      PT[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(PT);
      if (ids.length === 1) tp = { x: e.clientX, y: e.clientY, t: GJ.now() };
      else { tp = null; if (ids.length === 2) { var a = PT[ids[0]], b = PT[ids[1]]; pinchLive = true; pz = { d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), z0: zoom.t }; pinchZ0 = zoom.t; } }
    });
    G.addEventListener('pointermove', function (e) {
      if (!PT[e.pointerId]) return; PT[e.pointerId].x = e.clientX; PT[e.pointerId].y = e.clientY;
      var ids = Object.keys(PT); if (pz && ids.length === 2) { var a = PT[ids[0]], b = PT[ids[1]]; zoomTo(pz.z0 * Math.hypot(a.x - b.x, a.y - b.y) / pz.d0, true); }
    });
    function up(e) {
      if (!PT[e.pointerId]) return; delete PT[e.pointerId];
      if (pz) {   // the pinch ends when the last finger lifts: it stops where you let go; under home it glides back to home
        if (!Object.keys(PT).length) { pz = null; pinchLive = false; pinchEnd = GJ.now(); if (zoom.t < 1) zoomTo(1); else if (Math.abs(zoom.t - pinchZ0) > .04 && GJ.mark && GJ.mark.say) GJ.mark.say('zoom · ' + zfmt(zoom.t), 900); if (GJ.dial && GJ.dial.redraw) GJ.dial.redraw(); }
        return;
      }
      var q = tp; tp = null; if (!q || !here() || e.type === 'pointercancel') return;
      if (Math.hypot(e.clientX - q.x, e.clientY - q.y) < 10 && GJ.now() - q.t < 400) { toggle(); if (GJ.np) GJ.np.flash(); }
    }
    G.addEventListener('pointerup', up); G.addEventListener('pointercancel', up);
  })();
  // swipeable cards, one per song, in board order — swipe them and the board follows; tap the chosen card to open it
  var CARDS = $('sp-cards'), cardLock = 0;
  function peaksSVG(pk) { var n = pk.length, w = 120, h = 18, d = ''; pk.forEach(function (v, i) { var x = (i + .5) / n * w, y = v * h * .48 + .5; d += 'M' + x.toFixed(1) + ' ' + (h / 2 - y).toFixed(1) + 'V' + (h / 2 + y).toFixed(1); }); return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  function buildCards() {
    CARDS.innerHTML = order().map(function (i) { var t = T[i]; return '<button class="sp-card" data-i="' + i + '"><b class="jul">' + t.t + '</b><small>' + t.by.toLowerCase() + ' · ' + Math.round(t.bpm) + ' bpm · ' + mmss(t.dur) + '</small>' + peaksSVG(t.peaks) + '<em></em></button>'; }).join('');
  }
  function cardsTo(i, instant) {
    if (!CARDS.children.length) buildCards();
    var c = CARDS.querySelector('[data-i="' + i + '"]'); if (!c) return;
    [].forEach.call(CARDS.children, function (k) { k.classList.toggle('on', k === c); k.querySelector('em').textContent = k === c ? 'tap again or pinch in to open' : ''; });
    cardLock = GJ.now() + 650;
    var left = c.offsetLeft - (CARDS.clientWidth - c.offsetWidth) / 2;
    try { CARDS.scrollTo({ left: left, behavior: instant || GJ.reduced() ? 'auto' : 'smooth' }); } catch (e) { CARDS.scrollLeft = left; }
  }
  var cardT = 0;
  CARDS.addEventListener('scroll', function () {
    clearTimeout(cardT); if (GJ.now() < cardLock) return;
    var mid = CARDS.scrollLeft + CARDS.clientWidth / 2, best = null, bd = 1e9;
    [].forEach.call(CARDS.children, function (k) { var d = Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
    if (best) snapTo(+best.dataset.i);   // the board follows the swipe live
    cardT = setTimeout(function () { if (best) choose(+best.dataset.i, 'quiet'); }, 140);
  }, { passive: true });
  CARDS.addEventListener('click', function (e) {
    var c = e.target.closest('.sp-card'); if (!c) return; e.stopPropagation(); var i = +c.dataset.i;
    if (selIdx === i && c.classList.contains('on')) into(); else choose(i, 'pick');
  });
  function hear(i) { if (el) el.pause(); load(i); play(); }   // ridges: the music's recent past, a line per moment, stepping back into the dark
  var VDEF = { mode: 'sphere', density: 1, threads: 1, spin: 1, size: 1 };
  // abstraction (Gill, 17 Nov: "more modifiable… abstract further"): fold it into a kaleidoscope, leave trails, warp it
  // like heat over water, keep or drop its stars — on top of any mode
  function V() { var v = store.get().viz || {}; return { mode: VMODES.indexOf(v.mode) >= 0 ? v.mode : 'sphere', density: v.density || 1, threads: v.threads == null ? 1 : v.threads, spin: v.spin == null ? 1 : v.spin, size: v.size || 1,
    fold: v.fold || 1, mirror: v.mirror === true, trails: v.trails || 0, warp: v.warp || 0, dots: v.dots !== false }; }
  var OC = null, OG = null, WC = null, WG = null;
  function offs() {
    var w = Math.round(VW * DPR), h = Math.round(VH * DPR);
    if (!OC || OC.width !== w || OC.height !== h) { OC = document.createElement('canvas'); OC.width = w; OC.height = h; OG = OC.getContext('2d'); WC = document.createElement('canvas'); WC.width = w; WC.height = h; WG = WC.getContext('2d'); }
  }
  function composite(out, vs) {
    var w = OC.width, h = OC.height, src = OC;
    out.setTransform(1, 0, 0, 1, 0, 0);
    if (vs.trails > 0) { out.globalCompositeOperation = 'destination-out'; out.globalAlpha = 1 - vs.trails; out.fillRect(0, 0, w, h); out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1; }
    else out.clearRect(0, 0, w, h);
    if (vs.warp > 0) {   // heat over water: thin bands slid sideways on a slow wave
      WG.setTransform(1, 0, 0, 1, 0, 0); WG.clearRect(0, 0, w, h); var band = Math.round(6 * DPR), tt = GJ.now() / 1000;
      for (var y = 0; y < h; y += band) { var dx = Math.sin(y / (40 * DPR) + tt * 1.3) * vs.warp * 26 * DPR + Math.sin(y / (13 * DPR) - tt * 2.1) * vs.warp * 6 * DPR * (.4 + lvl.bass); WG.drawImage(OC, 0, y, w, band, dx, y, w, band); }
      src = WC;
    }
    var n = vs.fold, cx = w / 2, cy = h * .4;
    for (var k = 0; k < n; k++) {
      out.setTransform(1, 0, 0, 1, 0, 0); out.translate(cx, cy); out.rotate(k * 2 * Math.PI / n);
      if (vs.mirror && k % 2) out.scale(-1, 1);
      out.globalAlpha = n > 1 ? Math.min(1, 1.6 / Math.sqrt(n)) : 1;
      out.drawImage(src, -cx, -cy);
    }
    out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1;
  }
  function setV(k, val) { var v = V(); v[k] = val; store.set({ viz: v }); vrow(); }
  function bands() {   // five bands, low → high
    var out = [0, 0, 0, 0, 0];
    if (playing && an && urlFor(cur().id) && el && !el.paused) {
      var edges = [1, 4, 12, 40, 120, 300];
      for (var k = 0; k < 5; k++) { var sum = 0; for (var i = edges[k]; i < edges[k + 1]; i++) sum += fbin[i]; out[k] = sum / ((edges[k + 1] - edges[k]) * 255); }
    } else for (var j = 0; j < 5; j++) out[j] = lvl.bass * (1 - j * .12) + lvl.mid * j * .08 + Math.sin(GJ.now() / 700 + j) * .02 * (playing ? 1 : 0);
    return out;
  }
  var TUN = null, RG = null;
  function viz(dt) {
    if (!VW) vsize(); if (!VW) return; if (!SPH) buildViz();
    var s = store.get(), red = s.red, at = GJ.sky.atmos, A = GJ.app.room === 'player' && view === 'inside' ? 1 : 0, vs = V();
    GJ.sstep(push, dt); GJ.sstep(zoom, dt);
    VA += (A - VA) * (1 - Math.exp(-dt * 3)); if (VA < .01) return;
    offs(); var OUT = vg; vg = OG;   // draw the mode on its own sheet; the abstraction lays it onto the screen
    vg.setTransform(DPR, 0, 0, DPR, 0, 0); vg.clearRect(0, 0, VW, VH);
    var ink = red ? hexRGB(GJ.sky.toneInk || '#FF4457') : hueRGB();
    var col = function (a) { return 'rgba(' + ink[0] + ',' + ink[1] + ',' + ink[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; };
    rotY += dt * (.06 + .1 * at + lvl.mid * .25 * at) * vs.spin;
    var yaw = rotY + orb + GJ.sky.look.x.x * .9, pit = .28 + GJ.sky.look.y.x * .7;
    var cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
    var cxp = VW / 2, cyp = VH * .4, Z = zoom.x, R = Math.min(VW, VH) * .33 * vs.size * Z * (1 + lvl.bass * .14 + lvl.fl * flash * .06) * (1 + push.x * 1.1), F = 5.5;
    function P(p, o) { var x = p[0] * cyw + p[2] * syw, z = -p[0] * syw + p[2] * cyw, y = p[1] * cp - z * sp, z2 = p[1] * sp + z * cp, k = F / Math.max(1.6, F + z2); o[0] = cxp + x * R * k; o[1] = cyp + y * R * k; o[2] = k; o[3] = z2; return o; }
    var a = [0, 0, 0, 0], b = [0, 0, 0, 0], light = .45 + lvl.mid * .9 + lvl.fl * flash * .8, TH = vs.threads, every = vs.density >= 1 ? 1 : vs.density >= .7 ? 2 : 3;
    var gw = glw();
    function dotAt(x, y, r, al) { if (!vs.dots) return; vg.fillStyle = col(al); vg.fillRect(x - r, y - r, r * 2, r * 2); }
    function nucleus(scale) { var nr = R * scale * (.55 + lvl.bass * .35 + lvl.fl * flash * .5); vg.globalAlpha = VA * (.22 + lvl.mid * .3 + lvl.fl * flash * .45); vg.drawImage(gw, cxp - nr, cyp - nr, nr * 2, nr * 2); vg.globalAlpha = 1; }
    if (vs.mode === 'sphere') {
      vg.lineWidth = .6;
      if (TH > 0) {
        WEB.E.forEach(function (e) { P(WEB[e[0]], a); P(WEB[e[1]], b); vg.strokeStyle = col(.07 * VA * TH * (a[2] + b[2])); vg.beginPath(); vg.moveTo(a[0], a[1]); vg.lineTo(b[0], b[1]); vg.stroke(); });
        WEB.S.forEach(function (e) { P(WEB[e[0]], a); P(SPH[e[1]], b); vg.strokeStyle = col(.05 * VA * TH); vg.beginPath(); vg.moveTo(a[0], a[1]); vg.lineTo(b[0], b[1]); vg.stroke(); });
      }
      WEB.forEach(function (p) { P(p, a); dotAt(a[0], a[1], Math.min(1.4, .8 * a[2]), .5 * VA * a[2]); });
      nucleus(1);
      vg.lineWidth = .5;
      if (TH > 0) { var E = SPH.E; for (var i = 0; i < E.length; i += every) { P(SPH[E[i][0]], a); P(SPH[E[i][1]], b); var dpt = (a[2] + b[2]) / 2; vg.strokeStyle = col(VA * .16 * TH * light * dpt * dpt); vg.beginPath(); vg.moveTo(a[0], a[1]); vg.lineTo(b[0], b[1]); vg.stroke(); } }
      for (i = 0; i < SPH.length; i += every) {
        var p = SPH[i]; P(p, a);
        var tw = .7 + .3 * Math.sin(GJ.now() / 1000 * (1 + p[3] * 2) * at + p[3] * 20);
        dotAt(a[0], a[1], (.5 + p[3] * .7) * a[2] * (1 + lvl.fl * flash * .5), VA * (.35 + .5 * light) * tw * Math.min(1, a[2] * a[2]));
      }
    } else if (vs.mode === 'rings') {
      var B = bands(), N = Math.round(56 * vs.density);
      nucleus(.6);
      for (var r = 0; r < 5; r++) {
        var rad = .42 + r * .17 + B[r] * .22, tilt = r * 1.1, lean = .9 + r * .35, ph = rotY * (1 + r * .35) * (r % 2 ? -1 : 1), prev = null;
        for (var k = 0; k <= N; k++) {
          var t = k / N * 6.283 + ph, cx0 = Math.cos(t) * rad, cy0 = Math.sin(t) * rad, ct = Math.cos(tilt), st = Math.sin(tilt), cl = Math.cos(lean), sl = Math.sin(lean);
          var q = [cx0 * ct - cy0 * st * cl, cy0 * sl, cx0 * st + cy0 * ct * cl]; P(q, a);   // each orbit on its own plane
          var bump = 1 + B[r] * 1.6 * Math.max(0, Math.sin(t * 3 + GJ.now() / 400));
          if (prev && TH > 0) { vg.strokeStyle = col(VA * .14 * TH * a[2] * (.6 + B[r])); vg.lineWidth = .5; vg.beginPath(); vg.moveTo(prev[0], prev[1]); vg.lineTo(a[0], a[1]); vg.stroke(); }
          if (k < N) dotAt(a[0], a[1], .7 * a[2] * bump, VA * (.3 + .6 * light * (.5 + B[r])) * Math.min(1, a[2]));
          prev = [a[0], a[1]];
        }
      }
    } else if (vs.mode === 'tunnel') {
      var NT = Math.round(420 * vs.density);
      if (!TUN || TUN.length !== NT) { var sd = 9, rq = function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; TUN = []; for (var u = 0; u < NT; u++) TUN.push([rq() * 6.283, .25 + rq() * 1.6, rq() * 6, rq()]); }
      var speed = (.5 + lvl.bass * 4 + lvl.fl * flash * 3 + push.x * 3) * vs.spin * (.3 + .7 * at);
      nucleus(.45);
      TUN.forEach(function (t2) {
        var z0 = t2[2]; t2[2] -= dt * speed; if (t2[2] < .05) { t2[2] += 6; }
        var ang = t2[0] + yaw * .25, kz = 1 / t2[2], x = cxp + Math.cos(ang) * t2[1] * R * .55 * kz, y = cyp + Math.sin(ang) * t2[1] * R * .55 * kz * .9;
        if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) return;
        var al = VA * Math.min(1, (6 - t2[2]) / 2) * Math.min(1, kz * .6) * (.5 + light * .5);
        if (TH > 0) { var kz0 = 1 / Math.min(6, z0 + dt * speed * 4), x0 = cxp + Math.cos(ang) * t2[1] * R * .55 * kz0, y0 = cyp + Math.sin(ang) * t2[1] * R * .55 * kz0 * .9;
          vg.strokeStyle = col(al * .5 * TH); vg.lineWidth = Math.min(1.6, .4 + kz * .4); vg.beginPath(); vg.moveTo(x0, y0); vg.lineTo(x, y); vg.stroke(); }
        dotAt(x, y, Math.min(2.2, .4 + kz * .5), al);
      });
    } else if (vs.mode === 'water') {
      // light on water (Gill, 18 Nov, with two photographs of it: "add to visualizer … as water environment and light"):
      // a net of bright filaments where the surface gathers the light, drifting. The bass swells it, the middle quickens
      // it, and the light falls from the upper right, as in his pictures. It is drawn light: the photographs are the
      // reference only — never shown warped, tinted or graded.
      WT += dt * (.3 + .25 * at + lvl.mid * 1.4 * at) * vs.spin;
      var NC = vs.density >= 1 ? 15 : vs.density >= .7 ? 12 : 9, NRW = Math.max(6, Math.round(NC * VH / VW * .9)), amp = (.78 + lvl.bass * .8 + lvl.fl * flash * .45) * vs.size, cw2 = VW / (NC - 1), ch2 = VH * .9 / (NRW - 1), y0w = VH * .03, iw, jw;
      if (!WG || WG.length !== NC * NRW * 2) WG = new Float32Array(NC * NRW * 2);
      for (jw = 0; jw < NRW; jw++) for (iw = 0; iw < NC; iw++) {
        var ux = iw / (NC - 1), uy = jw / (NRW - 1), ow = (jw * NC + iw) * 2;
        var dxw = Math.sin(ux * 7.3 + uy * 3.1 + WT * 1.3) + .6 * Math.sin(uy * 11.7 - WT * .9 + ux * 2.2) + .4 * Math.sin((ux + uy) * 17 + WT * 1.7);
        var dyw = Math.cos(uy * 6.1 - ux * 4.3 + WT * 1.1) + .6 * Math.sin(ux * 12.9 + WT * .8 - uy * 1.7) + .4 * Math.cos((ux - uy) * 15 - WT * 1.5);
        WG[ow] = iw * cw2 + dxw * cw2 * amp * .5; WG[ow + 1] = y0w + jw * ch2 + dyw * ch2 * amp * .5;
      }
      var lxw = VW * .86, lyw = VH * .1, lrw = Math.max(VW, VH) * .95, lgw = vg.createRadialGradient(lxw, lyw, 0, lxw, lyw, lrw);   // the light itself: a soft fall from the upper right
      lgw.addColorStop(0, col(VA * (.16 + lvl.mid * .14))); lgw.addColorStop(1, col(0)); vg.fillStyle = lgw; vg.fillRect(0, 0, VW, VH);
      var thw = TH > 0 ? Math.min(1.4, .5 + TH * .5) : .5; vg.globalCompositeOperation = 'lighter'; vg.lineCap = 'round';
      var segw = function (o1, o2, restLen) {   // gathered light: the shorter the span between two points of the surface, the brighter
        var x1 = WG[o1], y1 = WG[o1 + 1], x2 = WG[o2], y2 = WG[o2 + 1], g2 = 1 - Math.hypot(x2 - x1, y2 - y1) / restLen; if (g2 < .06) return;
        var fall = .35 + .65 * Math.max(0, 1 - Math.hypot((x1 + x2) / 2 - lxw, (y1 + y2) / 2 - lyw) / lrw), al = VA * (g2 * .9 + g2 * g2 * 2.4) * fall * (.6 + light * .6) * thw; if (al < .02) return;
        vg.strokeStyle = col(Math.min(.9, al)); vg.lineWidth = .7 + g2 * 2.6; vg.beginPath(); vg.moveTo(x1, y1); vg.lineTo(x2, y2); vg.stroke();
      };
      for (jw = 0; jw < NRW; jw++) for (iw = 0; iw < NC; iw++) { var oo = (jw * NC + iw) * 2; if (iw + 1 < NC) segw(oo, oo + 2, cw2 * 1.05); if (jw + 1 < NRW) segw(oo, oo + NC * 2, ch2 * 1.05); if (iw + 1 < NC && jw + 1 < NRW) segw(oo, oo + NC * 2 + 2, Math.hypot(cw2, ch2) * 1.02); }
      vg.globalCompositeOperation = 'source-over';
    } else if (vs.mode === 'ridges') {
      // a stack of horizon lines, one per moment: each the music's shape across the band, the nearest at the front;
      // every line hides what lies behind it (the hill in front of the hill)
      var NR = Math.round(30 * vs.density), NB = 64;
      ridT += dt;
      if (ridT > .11 || !RID.length) {
        ridT = 0; var row = [], live = playing && an && urlFor(cur().id) && el && !el.paused;
        for (var q = 0; q < NB; q++) {
          var u2 = q / (NB - 1), env = Math.exp(-Math.pow((u2 - .5) / .16, 2)), v2;
          if (live) { var bi = 2 + Math.floor(Math.pow(Math.abs(u2 - .5) * 2, 1.6) * 160); v2 = fbin[bi] / 255; }
          else { var pk2 = cur().peaks, k2 = Math.floor((pos / len()) * pk2.length); v2 = (pk2[(k2 + q) % pk2.length] || 0) * (playing ? 1 : .25) * (.6 + .4 * Math.sin(q * 1.7 + GJ.now() / 300)); }
          row.push(env * v2 + Math.random() * .015 * env);
        }
        RID.unshift(row); if (RID.length > NR) RID.length = NR;
      }
      var W2 = Math.min(VW * .86, 420) * vs.size * Z, H2 = Math.min(VH * .26, 230) * vs.size * Z, top = VH * .4 + VH * .18 * Z - H2;   // a landscape of sound: the nearest ridge on the horizon, the past stepping back toward the stars
      var bg = red ? 'rgba(6,3,4,1)' : 'rgba(5,9,16,1)';
      for (var rr = RID.length - 1; rr >= 0; rr--) {   // back to front
        var rowv = RID[rr], depth = rr / NR, y0 = top + (1 - depth) * H2, sc2 = 1 - depth * .55, amp = H2 * .42 * (1 + lvl.fl * flash * .4) * (1 + push.x * .6);
        vg.beginPath();
        for (q = 0; q < NB; q++) { var xx = cxp + (q / (NB - 1) - .5) * W2 * sc2 + Math.sin(yaw) * depth * 30, yy = y0 - rowv[q] * amp * sc2; if (q) vg.lineTo(xx, yy); else vg.moveTo(xx, yy); }
        vg.lineTo(cxp + W2 * sc2 / 2 + Math.sin(yaw) * depth * 30, y0 + 2); vg.lineTo(cxp - W2 * sc2 / 2 + Math.sin(yaw) * depth * 30, y0 + 2); vg.closePath();
        vg.fillStyle = bg; vg.globalAlpha = VA; vg.fill(); vg.globalAlpha = 1;
        if (TH > 0 || true) { vg.strokeStyle = col(VA * (.85 - depth * .55) * (.6 + .4 * Math.min(1, TH + .4))); vg.lineWidth = 1; vg.stroke(); }
        if (rr % 3 === 0) for (q = 0; q < NB; q += 4) if (rowv[q] > .25) { var xs = cxp + (q / (NB - 1) - .5) * W2 * sc2 + Math.sin(yaw) * depth * 30; dotAt(xs, y0 - rowv[q] * amp * sc2, 1.1, VA * (1 - depth) * .9); }   // stars on the crests
      }
    } else {   // wave: the song's waveform as a ring of stars; what has played is lit
      var pk = cur().peaks, n = pk.length, fpos = pos / len(), B2 = bands();
      nucleus(.5);
      var pts = [];
      for (var m = 0; m < n; m++) {
        var t3 = m / n * 6.283 - 1.5708, h = pk[m] * (.5 + B2[m % 5] * .8), r0 = .62, inner = [Math.cos(t3) * r0, Math.sin(t3) * r0 * .9, Math.sin(t3) * r0 * .3], outer = [Math.cos(t3) * (r0 + h * .55), Math.sin(t3) * (r0 + h * .55) * .9, Math.sin(t3) * (r0 + h * .55) * .3];   // stood up, facing you
        P(inner, a); P(outer, b); var lit = (m + .5) / n <= fpos;
        if (TH > 0) { vg.strokeStyle = col(VA * (lit ? .55 : .16) * TH * a[2]); vg.lineWidth = .7; vg.beginPath(); vg.moveTo(a[0], a[1]); vg.lineTo(b[0], b[1]); vg.stroke(); }
        if (m % every === 0) dotAt(b[0], b[1], (lit ? 1.3 : .8) * b[2] * (1 + lvl.fl * flash * .6), VA * (lit ? .95 : .4) * Math.min(1, b[2]));
        pts.push([b[0], b[1]]);
      }
      if (TH > 0) { vg.strokeStyle = col(VA * .12 * TH); vg.lineWidth = .5; vg.beginPath(); pts.forEach(function (q2, j) { if (j) vg.lineTo(q2[0], q2[1]); else vg.moveTo(q2[0], q2[1]); }); vg.closePath(); vg.stroke(); }
    }
    MOTES.forEach(function (mt, j) {
      var mm = [mt[0] * Math.cos(rotY * .6 + j), mt[1], mt[2] + Math.sin(rotY * .6 + j) * .6]; P(mm, a);
      var rr3 = mt[3] * (Math.min(VW, VH) / 390) * a[2] * (1 + lvl.bass * .3);
      vg.globalAlpha = VA * (.14 + lvl.fl * flash * .2) * at; vg.drawImage(gw, a[0] - rr3, a[1] - rr3, rr3 * 2, rr3 * 2);
    });
    vg.globalAlpha = 1;
    vg = OUT; composite(vg, vs);
  }
  // the room's own row: the four modes, one tap each
  var ABS = { fold: [1, 2, 3, 4, 6, 8], trails: [0, .6, .85, .95], warp: [0, .35, .7, 1] };
  function vrow() {
    var v = V(); [].forEach.call(document.querySelectorAll('#sp-modes button'), function (b2) { b2.classList.toggle('on', b2.dataset.v === v.mode); });
    var a = document.getElementById('sp-abs'); if (!a) return;
    a.innerHTML = '<button data-a="fold"' + (v.fold > 1 ? ' class="on"' : '') + '>fold ' + v.fold + '×</button>' +
      '<button data-a="mirror"' + (v.mirror ? ' class="on"' : '') + '>mirror</button>' +
      '<button data-a="trails"' + (v.trails ? ' class="on"' : '') + '>trails' + (v.trails ? ' ' + Math.round(v.trails * 100) : '') + '</button>' +
      '<button data-a="warp"' + (v.warp ? ' class="on"' : '') + '>warp' + (v.warp ? ' ' + Math.round(v.warp * 100) : '') + '</button>' +
      '<button data-a="dots"' + (v.dots ? ' class="on"' : '') + '>stars</button>';
  }
  document.getElementById('sp-abs').addEventListener('click', function (e) {
    var b2 = e.target.closest('button'); if (!b2) return; var k = b2.dataset.a, v = V();
    if (k === 'mirror' || k === 'dots') setV(k, !v[k]);
    else { var L = ABS[k], i = L.indexOf(v[k]); setV(k, L[(i + 1) % L.length]); }
    GJ.haptic.tick();
  });
  document.getElementById('sp-modes').addEventListener('click', function (e) { var b2 = e.target.closest('button'); if (!b2) return; setV('mode', b2.dataset.v); GJ.haptic.tick(); });
  vrow();
  var rotY = 0;
  function hexRGB(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  load(0);

  GJ.player = { viz: V, setViz: setV, MODES: VMODES, ABS: ABS, setVol: function (v) { VOL.set(Math.max(0, Math.min(1, v))); }, state: function () { return { idx: idx, title: cur().t, playing: playing, pos: pos, len: len(), file: !!files[cur().id], vol: vol, flash: flash, level: lvl.bass, flare: lvl.fl }; },
    orbit: function () { return orb; }, colour: function () { return hue; }, pushed: function () { return push.x; }, zoom: function () { return zoom.t; }, setZoom: function (v) { zoomTo(v, true); },
    select: function (i) { choose(i, 'hear'); }, pick: function (i) { choose(i, 'pick'); }, scrollX: function () { return SX.x; }, centred: function () { return nearestSeat(SX.x); }, cards: function () { return CARDS.children.length; }, _board: function () { var r = $('sp-viz').getBoundingClientRect(); return BOARD.map(function (b) { return { x: r.left + b.x, y: r.top + b.y, i: b.i }; }); }, view: function () { return view; }, open: function () { setView('inside'); }, board: function () { setView('board'); }, selected: function () { return selIdx; },
    hear: function (i) { if (el) el.pause(); load(i); play(); },
    play: play, pause: pause, toggle: toggle, load: load, seek: seek, tracks: T };
})(window);
