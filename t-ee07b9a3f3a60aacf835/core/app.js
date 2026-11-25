/* tools-02 · Master shell: the sky the rooms live in, shared red mode / Full red mode,
   Tune, travel on the sstep glide (pinch, wheel, nodes, the word `tools`). */
(function (G) {
  'use strict';
  var GJ = G.GJ, sky = GJ.sky, store = GJ.store, dial = GJ.dial, rail = GJ.rail, rooms = GJ.rooms, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;
  var Q = new URLSearchParams(location.search);
  if (Q.get('debug')) html.classList.add('debug');
  if (Q.get('reduce')) store.set({ reduce: Q.get('reduce') === '1' ? 'on' : 'off' });

  var app = GJ.app = { room: null };

  /* ---------- the constellation: three live rooms + two quiet ghosts of the site's chapters ---------- */
  /* constellations shaped after their tools — abstract, in 3D: [x, y, r, z] */
  function clockShape() {
    var st = [], ed = [], R = 27;
    for (var i = 0; i < 12; i++) {
      var a = -Math.PI / 2 + i / 12 * 6.2832, q = i % 3 === 0;
      st.push([Math.cos(a) * R, Math.sin(a) * R, q ? 1.6 : .95, Math.sin(a) * R * .55]);   // a tilted dial
      ed.push([i, (i + 1) % 12]);
    }
    st.push([0, 0, 1.9, 0]); st.push([0, -18, 1.2, -6]); st.push([10, 6, 1.1, 4]);   // centre, minute hand, hour hand
    ed.push([12, 13], [12, 14]);
    return { stars: st, edges: ed, lx: 0, ly: 40 };
  }
  function sunShape() {
    var st = [], ed = [], R = 30, n = 0;
    for (var i = 0; i < 7; i++) { st.push([-36 + i * 12, 12, i === 3 ? 1.3 : .95, (i - 3) * 5]); if (i) ed.push([n + i - 1, n + i]); }   // the horizon
    n = st.length;
    for (var j = 0; j <= 8; j++) { var a = Math.PI + j / 8 * Math.PI; st.push([Math.cos(a) * R, 12 + Math.sin(a) * R, .9, Math.cos(a) * 12]); if (j) ed.push([n + j - 1, n + j]); }   // the sun's path
    var sa = Math.PI + 2.2 / 8 * Math.PI; st.push([Math.cos(sa) * R, 12 + Math.sin(sa) * R, 2.3, Math.cos(sa) * 12 - 3]);   // the sun, low: golden hour
    return { stars: st, edges: ed, lx: 0, ly: 30 };
  }
  function loopShape() {
    var st = [], ed = [], A = 36, N = 18;
    for (var i = 0; i < N; i++) {
      var t = i / N * 6.2832, d = 1 + Math.sin(t) * Math.sin(t);
      st.push([A * Math.cos(t) / d, A * Math.sin(t) * Math.cos(t) / d, i % 4 === 0 ? 1.45 : .95, Math.sin(t) * 13]);   // ∞, twisting in depth
      ed.push([i, (i + 1) % N]);
    }
    st.push([0, -4, 1.3, 6], [3, 3, 1.1, -5], [-3, 4, 1, 2]);   // takes, stacked where the loop crosses
    return { stars: st, edges: ed, lx: 0, ly: 26 };
  }
  // the sky player: the site's own sound constellation (blend.js, chapter `sound`), stood up in depth like a waveform
  function soundShape() {
    var sh = G.GJ_PLAYER.shape, st = [], ed = [], map = {};
    sh.s.forEach(function (p, i) { if (p[3]) return; map[i] = st.length; st.push([(p[0] - .5) * 96, (p[1] - .5) * 48, .7 + p[2] * 1.1, Math.sin(p[0] * 6.2832) * 6]); });   // the site's 2:1 figure
    sh.e.forEach(function (e) { if (map[e[0]] != null && map[e[1]] != null) ed.push([map[e[0]], map[e[1]]]); });
    // each title sits on the star the site gives it (blend.js: works on the brightest stars, in order)
    var SEAT = { togo: 7, noproblem: 5, lostintime: 9, equals: 13, ii: 2 }, anchors = [];
    G.GJ_PLAYER.tracks.forEach(function (t, i) { if (SEAT[t.id] != null && map[SEAT[t.id]] != null) anchors.push({ s: map[SEAT[t.id]], i: i, t: t.t, by: t.by }); });
    return { stars: st, edges: ed, lx: 0, ly: 30, anchors: anchors };
  }
  // the archive: the site's film figure — a frame of hairlines, its stills as stars inside, leaning back in depth
  function frameShape() {
    var st = [[-34, -16, 1.5, -8], [34, -18, 1.5, 8], [36, 16, 1.6, 9], [-36, 18, 1.4, -9]], ed = [[0, 1], [1, 2], [2, 3], [3, 0]];
    [[-24, -10], [-12, -11], [2, -9], [16, -12], [26, -8], [-26, 10], [-14, 12], [-2, 9], [12, 11], [24, 10], [-6, 0]].forEach(function (p, i) { st.push([p[0], p[1], i === 10 ? 1.9 : .85 + (i % 3) * .2, p[0] * .22]); });
    ed.push([14, 2]);   // one thread from the brightest still to the frame, as the site's figure has
    return { stars: st, edges: ed, lx: 0, ly: 28 };
  }
  // the Feed (oz one): a slow vertical stream — a few cards as stars, one above the next, one side left open
  function feedShape() {
    var st = [], ed = [];
    for (var i = 0; i < 4; i++) { var y = -24 + i * 16, x = (i % 2 ? 6 : -6); st.push([x - 18, y, .9, -6 + i * 3]); st.push([x + 18, y, i === 1 ? 1.7 : 1, 6 - i * 3]); ed.push([i * 2, i * 2 + 1]); if (i) ed.push([i * 2 - 1, i * 2 + 1]); }
    st.push([0, 34, 1.2, 0]); ed.push([7, 8]);
    return { stars: st, edges: ed, lx: 0, ly: 40 };
  }
  var SHAPES = { feed: feedShape(), red: clockShape(), golden: sunShape(), loops: loopShape(), player: G.GJ_PLAYER ? soundShape() : null, archive: frameShape() };   // the sound sky's shape comes with the player's data (oz only)
  var DECO = [
    { stars: [[0, 0], [22, 2], [44, 0], [48, 18], [24, 20], [-2, 20]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
    { stars: [[0, 0], [12, -8], [26, -4], [30, 10], [16, 16], [4, 12], [14, 4]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [6, 1], [6, 4]] }
  ];
  var LABELS = { feed: 'feed', red: 'timer', golden: 'golden hour', loops: 'loops', player: 'sky player', archive: 'archive' };
  // the count line under each name (the hub's "37 films + demo reel"), and the facts that come forward closer in
  var evC = { k: '', e: null };
  function sunEv() {
    var c = GJ.Sun.CITIES[store.get().city] || GJ.Sun.CITIES.vancouver, k = c.id + new Date().toDateString();
    if (evC.k !== k) { evC = { k: k, e: GJ.Sun.events(Date.now(), c), c: c }; } return evC;
  }
  function goldenNext() { return META._golden(); }
  var META = {
    red: function () { var t = store.get().timer; return GJ.fmtMs(GJ.timer.remaining()) + (t.running ? ' · running' : ' · red mode'); },
    golden: function () { var w = GJ.weather && GJ.weather.forDay(Date.now(), sunEv().c, sunEv().e); return goldenNext() + (w ? ' · ' + w.name : ''); },   // the weather rides on the hub's line
    _golden: function () {
      var E = sunEv(), e = E.e, n = Date.now(), f = function (ms) { return GJ.Sun.fmt12(ms, E.c); };
      if (e.goldenPmStart && n < e.goldenPmStart) return 'golden hour ' + f(e.goldenPmStart);
      if (e.sunset && n < e.sunset) return 'sunset ' + f(e.sunset);
      if (e.dusk && n < e.dusk) return 'dusk ' + f(e.dusk);
      return 'sunrise tomorrow';
    },
    loops: function () { if (!GJ.loops) return 'record a loop'; var s = GJ.loops.state(); return s.layers ? s.layers + (s.layers === 1 ? ' take' : ' takes') + (s.playing ? ' · playing' : '') : 'record a loop'; },
    player: function () { if (!GJ.player) return 'lost coffee · ' + ((G.GJ_PLAYER && G.GJ_PLAYER.tracks.length) || '') + ' songs'; var p = GJ.player.state(); return p.playing ? p.title.toLowerCase() + ' · playing' : 'lost coffee · ' + GJ.player.tracks.length + ' songs'; },
    archive: function () { return GJ.archive && GJ.archive.state ? GJ.archive.state().n.toLocaleString('en-US') + ' frames' : 'frames'; },
    feed: function () { return 'yours only · one at a time'; }
  };
  var FACTS = {
    red: function () { var s = store.get(), tn = GJ.TONES[s.tone] || GJ.TONES[2]; return [tn.name + ' · ' + (rooms.red.alertMode() === 'sound' ? 'alarm' : 'silent')]; },
    golden: function () { var E = sunEv(), e = E.e, f = function (ms) { return GJ.Sun.fmt12(ms, E.c); }, w = GJ.weather && GJ.weather.forDay(Date.now(), E.c, E.e); return [E.c.name, 'golden ' + f(e.goldenPmStart) + ' – ' + f(e.sunset)].concat(w ? [w.lines[0], w.lines[1]] : []); },
    loops: function () { if (!GJ.loops) return ['free length']; var s = GJ.loops.state(); return [s.bars ? s.bpm + ' bpm · ' + s.bars + ' bars' : 'free length']; },
    player: function () { var t = GJ.player.tracks.map(function (k) { return k.t; }); return [t.slice(0, 3).join(' · '), t.slice(3).join(' · ')]; },
    archive: function () { return ['light · colour · motion']; },
    feed: function () { return ['frames · loops · notes · days']; }
  };
  var markSubs = (function () {
    try {
      var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), out = [];
      svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden'; document.body.appendChild(svg);
      var tmp = document.createElementNS(NS, 'g'); tmp.innerHTML = G.GJ_MARK.paths; svg.appendChild(tmp);
      [].forEach.call(tmp.querySelectorAll('path'), function (pth) {
        var tx = +(pth.getAttribute('transform') || '').replace(/[^0-9.\-]+/g, ' ').trim().split(' ')[0] || 0;
        pth.getAttribute('d').split('Z').filter(function (d) { return d.trim(); }).forEach(function (d) {
          var q = document.createElementNS(NS, 'path'); q.setAttribute('d', d + 'Z'); svg.appendChild(q);
          var L = q.getTotalLength(), n = Math.max(8, Math.round(L / 34)), pts = [];
          for (var i = 0; i < n; i++) { var pt = q.getPointAtLength(L * i / n); pts.push([pt.x + tx, pt.y]); }
          out.push(pts);
        });
      });
      svg.remove(); return out;
    } catch (e) { return null; }
  })();
  function layout() {
    var s = sky.size(), W = s.W, H = s.H, wide = W >= 700, land = W > H;
    var star = store.get().hub === 'star'; html.classList.toggle('star', star);
    var P = land ? { red: [-.3, -.12], golden: [.27, -.2], loops: [.24, .08], player: [-.34, .1], archive: [-.02, -.3], feed: [-.02, .1] }
      : wide ? { red: [-.28, -.19], golden: [.28, -.19], loops: [.28, .07], player: [-.28, .075], archive: [0, -.24], feed: [0, .13] }
        : { archive: [-.21, -.095], golden: [.2, -.025], red: [-.21, .05], loops: [.2, .12], player: [-.2, .19], feed: [.2, .262] };   // oz one: the Feed joins the zigzag, the chapters a little closer   // the site's field (17 Nov): the Mark on top, the chapters zigzag down beneath its poem
    var column = !land && !wide && !star;
    sky.column = column; html.classList.toggle('column', column);
    if (star) {   // the alt hub (the site's radial chapters): the Mark at the centre, five on spokes around it
      var Rx = Math.min(W * .36, H * .42), Ry = Math.min(H * .24, W * .6), ANG = { golden: -90, archive: -150, loops: -30, player: 150, red: 30, feed: 90 };
      P = {}; Object.keys(ANG).forEach(function (k) { var a = ANG[k] * Math.PI / 180; P[k] = [Math.cos(a) * Rx / W, (Math.sin(a) * Ry - (k === 'golden' ? 0 : 8)) / H]; });
    }
    if (GJ.APP.rooms && GJ.APP.rooms.length === 1) { var one = P[GJ.APP.rooms[0]]; P[GJ.APP.rooms[0]] = star ? one : [0, .06]; }   // an app with one place: in the field it sits in the middle, under the Mark
    var sc = land ? clamp(H / 560, 1, 1.4) : clamp(W / 390, 1, 1.45);
    // 3D: each star gets a depth (z), each constellation its own distance (depth: nearer > 1 slides more)
    function deep(stars, seed) { return stars.map(function (s, i) { var z = (((i + 1) * 37 + seed * 11) % 9 - 4) * 7; return [s[0], s[1], s[2] || 1.2, z]; }); }
    var DEP = { red: 1.18, golden: .86, loops: 1.32, player: .95, archive: 1.08, feed: 1.02 }, SPIN = { red: .12, golden: -.15, loops: .2, player: -.08, archive: .1, feed: -.06 };
    var TINT = { red: [214, 222, 236], golden: [255, 236, 205], loops: [206, 198, 255], player: [255, 182, 176], archive: [150, 220, 255], feed: [232, 222, 204] };   // the site's chapter tints: about, objects, spaces, sound, film
    sky.nodes = ['red', 'golden', 'loops', 'player', 'archive', 'feed'].filter(function (id) { return (!GJ.APP.rooms || GJ.APP.rooms.indexOf(id) >= 0) && (id !== 'feed' || (GJ.rooms.feed && store.get().feedOn !== false)) && !(GJ.essentialsHidden && GJ.essentialsHidden(id)); }).map(function (id, k) {   // each app's own constellations (GJ.APP.rooms)
      var sh = SHAPES[id];
      return { id: id, live: true, label: LABELS[id], meta: META[id], facts: id === 'player' ? null : FACTS[id], anchors: sh.anchors || null, x: P[id][0] * W, y: P[id][1] * H, scale: sc, stars: deep(sh.stars, k), edges: sh.edges, lx: sh.lx, ly: sh.ly, depth: DEP[id], spin0: SPIN[id], tint: TINT[id] };
    });
    if (GJ.cons) GJ.cons.apply(sky.nodes, sc, W, H);   // his own edits and new constellations (conedit.js)
    sky.deco = [];   // the site's hub has only its chapters; no ghosts
    void DECO.slice(1).map(function (d, i0) { var i = i0 + 1, p = P['d' + i] || [0, 0]; return { x: p[0] * W, y: p[1] * H, scale: sc * .9, stars: deep(d.stars, i + 5), edges: d.edges, lineA: .7, depth: i ? .74 : .68, spin0: i ? -.4 : .3 }; });
    sky.mark = star ? { y: 0, scale: Math.min(W, H) * .19 / 428 } : column ? { y: -.235 * H, scale: Math.min(W, H) * .27 / 428 } : { y: (land ? -.04 : -.03) * H, scale: Math.min(W, H) * (land ? .27 : .31) / 428 };
    sky.hub = star ? 'star' : 'field';
    // the unfold: every tool star starts on the Mark (its STROKES, end to end) and flies to its seat
    var all = 0; sky.nodes.forEach(function (n) { all += n.stars.length; });
    var gi = 0; sky.nodes.forEach(function (n) { n.from = n.stars.map(function () { var f = gi++ / Math.max(1, all - 1); return sky.markAlong(f); }); });
    $('poem').style.top = Math.round(H * .44 + sky.mark.y + 105 * sky.mark.scale + 16) + 'px';
    var tt = parseFloat(getComputedStyle(html).getPropertyValue('--title-top')) || 112;
    sky.keep = [{ x: W / 2, y: tt + 8, s: 1.3 }].concat(sky.nodes.map(function (n) { return { x: W / 2 + n.x, y: H * .44 + n.y, s: .8 }; }));
  }

  /* ---------- state → page ---------- */
  function apply(s, prev) {
    var tone = GJ.redmode.apply(s);   // red mode: the page, the ink, the lamp, the sky (core/redmode.js)
    sky.moonOn = s.moon !== false; sky.moonMode = s.moonMode || 'crescent'; sky.reflect = s.reflect !== false; sky.ripples = s.ripples !== false;
    sky.density = s.density; sky.mood = (s.ambience - .5) * 2; sky.atmos = s.atmos; sky.atmosFog = Math.min(1, .15 + s.atmos); sky.fog = s.fog == null ? 1 : s.fog;
    var T = function (k2, v) { var b = document.querySelector('#tune [data-t="' + k2 + '"] b'); if (b) b.textContent = v; };
    T('red', s.red ? 'on' : 'off'); T('tone', tone.name);
    T('density', Math.round(s.density * 100) + '%'); T('ambience', GJ.skyRings.ambience.fmt(s.ambience)); T('atmos', GJ.skyRings.atmos.fmt(s.atmos)); T('fog', s.fog >= 1 ? 'full' : s.fog > 0 ? 'light' : 'off'); T('alert', rooms.red.alertMode() === 'sound' ? 'alarm' : 'silent'); T('tilt', s.tilt === false ? 'off' : GJ.tilt && GJ.tilt.blocked ? 'blocked' : 'on'); T('moon', s.moon === false ? 'off' : s.moonMode === 'phase' ? 'tonight' : 'crescent'); T('reflect', s.reflect === false ? 'off' : 'on'); T('ripples', s.ripples === false ? 'off' : 'on');
    T('city', (GJ.Sun.CITIES[s.city] || GJ.Sun.CITIES.vancouver).name); T('reduce', s.reduce); T('wxlive', s.wxlive === false ? 'off' : 'on'); T('clock', s.clock === '24' ? '24 hour' : '12 hour'); GJ.Sun.h24 = s.clock === '24';   // one clock for the whole app
    T('byread', (GJ.archive && GJ.archive.beyond().read) || (s.red ? 'red' : 'off')); T('bydepth', s.byDepth || 'far'); T('bydrift', s.byDrift || 'slow'); T('byease', s.byEase || 'fold'); T('bymove', s.byMove || 'dolly');   // Beyond: the reading and its own camera
    if (GJ.player) { var vz = GJ.player.viz(); T('vmode', vz.mode); T('vdensity', { 1: 'full', .75: 'mid', .5: 'sparse' }[vz.density] || 'full'); T('vthreads', { 0: 'off', .5: 'faint', 1: 'on', 1.8: 'bright' }[vz.threads]); T('vspin', { 0: 'still', .5: 'slow', 1: 'easy', 2: 'fast' }[vz.spin]); T('vsize', { .75: 'small', 1: 'mid', 1.3: 'large' }[vz.size]); T('vfold', vz.fold + '×'); T('vtrails', vz.trails ? Math.round(vz.trails * 100) + '%' : 'off'); T('vwarp', vz.warp ? Math.round(vz.warp * 100) + '%' : 'off'); } T('hub', s.hub === 'star' ? 'star' : 'field'); T('sunup', s.sunUp === 'north' ? 'north' : 'heading'); T('photored', s.photoRed === false ? 'true colour' : 'red'); T('fullsafe', s.fullSafe ? 'on' : 'off'); if (GJ.mark) T('mark', GJ.mark.mode() + ' · ' + GJ.mark.MODES[GJ.mark.mode()]);
    $('tn-rev').textContent = (GJ.VERSION || GJ.APP.title || 'oz') + ' · rev ' + s.rev;   // which line this is (oz 3), so builds are never confused
    $('mark').classList.toggle('lift', !!s.timer.running);
    if (dial.visible) dial.redraw();
  }
  store.on(apply);

  /* ---------- travel: sstep glide in and out (W_GLIDE 4.8) ---------- */
  var roomT = 0, histPop = false, histPending = null;
  function enter(id, opts) {
    // a room whose module has not come in yet (core/lazy.js loads them in the background after the first paint): load it now,
    // with a quiet wait (the Mark breathes), then go in as if it had always been there
    if (!rooms[id] && GJ.lazy && GJ.lazy.isRoom && GJ.lazy.isRoom(id)) { html.classList.add('roomwait'); GJ.lazy.room(id).then(function () { html.classList.remove('roomwait'); if (rooms[id]) enter(id, opts); }, function () { html.classList.remove('roomwait'); }); return; }
    if (!rooms[id] || app.room === id) return;
    var n = sky.nodes.filter(function (k) { return k.id === id; })[0];
    if (app.room) leaveRoom(true);
    app.room = id; html.classList.add('inroom'); html.classList.remove('chap'); app.mode = 'room'; app.chap = null;
    var R = rooms[id];
    if (n) { GJ.aim(sky.cam.x, n.x - sky.look.x.t * lookUnit()); GJ.aim(sky.cam.y, n.y - sky.look.y.t * lookUnit()); }
    GJ.aim(sky.cam.z, 2.6); GJ.aim(sky.focus, 0); GJ.aim(sky.trees, R.trees);
    $('title').classList.add('out');
    clearTimeout(roomT);
    roomT = setTimeout(function () {
      if (app.room !== id) return;
      if (id !== 'red') { $('title').textContent = R.title; $('title').classList.remove('out'); }
      $('r-' + id).classList.add('on');
    }, GJ.reduced() ? 0 : Math.round(CAM.easeMs * .68));
    var bd = $('r-' + id).querySelector('.board');   // the board grows out of the constellation you tapped
    if (bd && n) { var sc0 = n.screen || sky.toScreen(n.x, n.y, n.depth); bd.style.setProperty('--ox', Math.round(sc0.x - bd.offsetLeft) + 'px'); bd.style.setProperty('--oy', Math.round(sc0.y - bd.offsetTop) + 'px'); }
    R.enter(); dial.config(R.rings()); rail.config(R.rail ? R.rail() : null);
    store.set({ room: id });
    if (!opts || !opts.noHistory) {
      if (histPop) histPending = id;   // a leave's popstate is still in flight; push once it has landed
      else {
        try {
          if (history.state && history.state.room) history.replaceState({ room: id }, '');
          else history.pushState({ room: id }, '');
        } catch (e) {}
      }
    }
  }
  function leaveRoom(swap) {
    var id = app.room; if (!id) return;
    rooms[id].leave(); $('r-' + id).classList.remove('on');
    dial.config(masterRings()); rail.config(MRAIL);
    app.room = null;
    if (!swap) {
      html.classList.remove('inroom');
      app.lookBase = 0; toSky();
      GJ.aim(sky.focus, 1); GJ.aim(sky.trees, 1);
      $('title').classList.add('out');
      clearTimeout(roomT);
      roomT = setTimeout(function () { $('title').textContent = GJ.APP.title || 'oz'; $('title').classList.remove('out'); }, GJ.reduced() ? 0 : 300);
      store.set({ room: null });
      // drop this room's history entry so the Mark and the browser Back stay in step.
      // popstate is a queued task (not always sync), so keep histPop set until it fires —
      // otherwise a follow-up enter() is undone by the leftover pop.
      if (!histPop && history.state && history.state.room === id) {
        histPop = true;
        try { history.back(); } catch (e) { histPop = false; }
      }
    }
  }
  app.enter = enter;
  app.reapply = function () { apply(store.get()); };   // a room's module came in (core/lazy.js): its rows and labels are real now
  app.back = function () { if (app.room && rooms[app.room].back && rooms[app.room].back()) return; if (app.room) { leaveRoom(false); } else if (app.mode === 'chap') toSky(); };
  // the word `tools` always goes home (Back, below, steps out of Full red mode first)
  $('back').addEventListener('click', function () { app.back(); });
  /* ---------- the camera: Previews / site-v3 (constellation-unfold.md) on the site spring ----------
     L0 sky (z = fitS = 1) · L1 chap (a tool's constellation, z = CHAP) · L2 the tool.
     Pinch / wheel / FLY zoom continuously; release is non-locking:
     started in chap and z > CHAP × 1.55 → dive · z < fitS × 1.15 → sky · else stay (chap on the nearest). */
  var CHAP0 = 1.7, CHAP = 1.7, FIT = 1;
  /* the camera logic dial (camera-dial module, Nov 14): its choices tune this camera live.
     spring → the glide weight · release → stay / settle / snap · drift → the idle orbit · lens → the 3D focal length ·
     depth → where a push lands (the constellation level) · move → dolly / glide / fly into a constellation · ease → room timing */
  var CAM = { spring: 4.8, release: 'settle', driftRadPerSec: 0, fov: 60, depthScale: 1, move: 'dolly', easeMs: 620 };
  function camParams(p) {
    CAM = p;
    [sky.cam.x, sky.cam.y, sky.cam.z].forEach(function (s) { s.w = GJ.reduced() ? Math.max(8, p.spring * 1.6) : p.spring; });
    CHAP = CHAP0 * ({ far: .84, mid: 1, close: 1.24 }[p.depthStop] || 1);
    sky.FOC = 260 * Math.tan(30 * Math.PI / 180) / Math.tan(p.fov / 2 * Math.PI / 180);
  }
  if (G.GJ_CAMDIAL) { camParams(G.GJ_CAMDIAL.params()); G.GJ_CAMDIAL.on(function (v, p) { camParams(p); }); }
  app.cam = function () { return CAM; };
  app.mode = 'sky'; app.chap = null; app.lookUser = 0; app.lookUserY = 0; app.lookBase = 0;
  function lookUnit() { var s2 = sky.size(); return 140 * s2.M / 390; }
  function nearest() {   // the constellation nearest the middle of the view
    var s2 = sky.size(), best = null, bd = 1e9;
    sky.nodes.forEach(function (n) { var c = sky.toScreen(n.x, n.y, n.depth), d = Math.hypot(c.x - s2.W / 2, c.y - s2.H * .44); if (d < bd) { bd = d; best = n; } });
    return best;
  }
  function centreOn(n, z) {   // camera target that puts n in the middle at zoom z
    var d = n.depth || 1;
    GJ.aim(sky.cam.x, n.x - sky.look.x.t * lookUnit() * d); GJ.aim(sky.cam.y, n.y - sky.look.y.t * lookUnit() * d); GJ.aim(sky.cam.z, z);
  }
  function markChap(n) { picked = null; sky.nodes.forEach(function (k) { k.face = k === n ? 1 : 0; }); }
  /* two taps (Gill's settled rule, as oz 2's sound board): the first tap on a constellation picks it — it lights,
     its name shows, nothing opens and nothing plays; a second tap on the same one goes in. A tap elsewhere lets it go. */
  var picked = null, pickT = 0;
  function pick(n) {
    sky.nodes.forEach(function (k) { k.face = k === n ? 1 : 0; }); picked = n; pickT = GJ.now(); GJ.haptic.tick();
    if (GJ.mark && GJ.mark.say) GJ.mark.say((n.label || n.id) + ' · tap again to open', 2400);
  }
  function unpick() { if (!picked) return; picked = null; if (app.mode !== 'chap') sky.nodes.forEach(function (k) { k.face = 0; }); }
  app.picked = function () { return picked ? picked.id : null; };
  function toChap(n) {
    app.mode = 'chap'; app.chap = n; html.classList.add('chap'); markChap(n);
    var z0 = sky.cam.z.x;
    if (CAM.move === 'fly' && !GJ.reduced()) {   // fly: rise a little first, then come down onto it
      centreOn(n, Math.min(z0, FIT) * .82); setTimeout(function () { if (app.chap === n && app.mode === 'chap') centreOn(n, CHAP); }, 380);
    } else if (CAM.move === 'glide' && !GJ.reduced()) {   // glide: travel across, then in
      centreOn(n, z0); setTimeout(function () { if (app.chap === n && app.mode === 'chap') GJ.aim(sky.cam.z, CHAP); }, 320);
    } else centreOn(n, CHAP);   // dolly: straight in
    rail.redraw && rail.redraw();
  }
  function toSky() {
    app.mode = 'sky'; app.chap = null; html.classList.remove('chap'); markChap(null);
    app.lookUser = 0; app.lookUserY = 0;
    GJ.aim(sky.cam.x, 0); GJ.aim(sky.cam.y, 0); GJ.aim(sky.cam.z, FIT);
    rail.redraw && rail.redraw();
  }
  function capFor(startedInChap) { return CHAP * (startedInChap ? 1.85 : 1.45); }
  // zoomAt: the world point under (mx, my) stays under it
  function zoomAt(f, mx, my, cap) {
    var s2 = sky.size(), lk = lookUnit(), z0 = sky.cam.z.x, z1 = clamp(z0 * f, FIT * .7, cap);
    var wx = sky.cam.x.x + sky.look.x.x * lk + (mx - s2.W / 2) / z0, wy = sky.cam.y.x + sky.look.y.x * lk + (my - s2.H * .44) / z0;
    GJ.aim(sky.cam.x, wx - sky.look.x.x * lk - (mx - s2.W / 2) / z1, true);
    GJ.aim(sky.cam.y, wy - sky.look.y.x * lk - (my - s2.H * .44) / z1, true);
    GJ.aim(sky.cam.z, z1, true);
    sky.scrubRate = Math.min(.5, sky.scrubRate + Math.abs(Math.log(f)) * 2);
  }
  /* levels (Gill, 16 Nov): sky (wide, every star) → map (the hub) → constellation → the tool. Pinch moves through them
     continuously; release never locks: it stops where you let go, or glides to the next level when you're close (12–15 %);
     pinching out always rises one level. */
  var WIDE = .74;
  function toWide() {
    app.mode = 'wide'; app.chap = null; html.classList.remove('chap'); markChap(null);
    GJ.aim(sky.cam.x, 0); GJ.aim(sky.cam.y, 0); GJ.aim(sky.cam.z, WIDE); rail.redraw && rail.redraw();
  }
  function rise() {   // pinch out: one level up, always
    if (app.room && rooms[app.room].back && rooms[app.room].back()) return;   // a tool's own inner level first (inside a song → its board)
    if (app.room) { leaveRoom(false); return; }   // a tool rises to the map it was entered from (one tap in, one pinch out)
    if (app.mode === 'chap') { toSky(); return; }
    toWide();
  }
  app.rise = rise; app.toWide = toWide;
  /* when a two-finger gesture is a pinch (oz 2's rule, written down): the spread between the fingers changes more than the
     fingers travel together. Two fingers that move together — a scroll, an orbit, a pan — that happen to close a little
     are not a pinch and never change the level. */
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function isPinch(d0, d, m0, m) { var sp = Math.abs(d - d0), tr = Math.hypot(m.x - m0.x, m.y - m0.y); return sp > 12 && sp >= tr * .9; }
  app.isPinch = isPinch;
  // pinch out to leave any tool (Gill, 17 Nov), wherever the fingers land — over the loop ring, the archive, the player.
  // (On the sky itself the camera's own pinch does it.) The archive, zoomed in, comes back to its page first.
  (function () {
    var P2 = {}, pin = null;
    document.addEventListener('pointerdown', function (e) {
      if (e.target === cvs || !app.room || html.classList.contains('locked') || html.classList.contains('oztuning') || (G.GJ_MASTER && G.GJ_MASTER.isOpen())) return;   // (the oz stage has its own pinch: it comes closer)
      P2[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(P2); if (ids.length === 2) { var a = P2[ids[0]], b = P2[ids[1]]; pin = { d0: Math.hypot(a.x - b.x, a.y - b.y), d: 0, m0: mid(a, b), m: mid(a, b) }; }
    }, true);
    document.addEventListener('pointermove', function (e) {
      if (!P2[e.pointerId]) return; P2[e.pointerId].x = e.clientX; P2[e.pointerId].y = e.clientY;
      var ids = Object.keys(P2); if (pin && ids.length === 2) { var a = P2[ids[0]], b = P2[ids[1]]; pin.d = Math.hypot(a.x - b.x, a.y - b.y); pin.m = mid(a, b); }
    }, true);
    function end(e) {
      if (!P2[e.pointerId]) return; delete P2[e.pointerId];
      if (pin && pin.d && pin.d / pin.d0 < .72 && isPinch(pin.d0, pin.d, pin.m0, pin.m) && app.room) {   // a two-finger scroll or orbit that closes a little is not a pinch
        var AR = app.room === 'archive' ? GJ.archive : app.room === 'icons' ? GJ.icons : null, zoomed = !!AR && (AR.state().zoom > 1.02 || AR.state().open != null);   // a level in the sheet (9-up, 4-up, one photo): the sheet's own pinch steps up first
        if (!zoomed) { GJ.haptic.commit(); rise(); }
      }
      if (Object.keys(P2).length < 2) pin = null;
    }
    document.addEventListener('pointerup', end, true); document.addEventListener('pointercancel', end, true);
  })();
  function release(startedInChap) {
    var z = sky.cam.z.x, n = nearest();
    if (startedInChap && z > CHAP * 1.55) { enter(n.id); return; }
    if (z < WIDE * 1.12) { toWide(); return; }                      // close to the wide sky: glide onto it
    if (z < FIT * 1.15 && z > FIT * .9) { toSky(); return; }         // close to the map: glide home to it
    if (z <= FIT * .9) { app.mode = 'wide'; app.chap = null; html.classList.remove('chap'); markChap(null); rail.redraw && rail.redraw(); return; }   // between: stays
    app.mode = 'chap'; app.chap = n; html.classList.add('chap'); markChap(n);
    // release: stay (where the fingers left you) · settle (glide onto the level) · snap (a quick 280 ms snap)
    // settle is the site-3d soft settle: only when you let go close to the level (within 12 %); otherwise it stays
    if (CAM.release === 'settle' && Math.abs(z / CHAP - 1) < .12) centreOn(n, CHAP);
    else if (CAM.release === 'snap') { [sky.cam.x, sky.cam.y, sky.cam.z].forEach(function (s) { s.w = 16; }); centreOn(n, CHAP); setTimeout(function () { camParams(CAM); }, 420); }
    rail.redraw && rail.redraw();
  }
  app.toChap = toChap; app.toSky = toSky; app.release = release; app.zoomAt = zoomAt; app.nearest = nearest;

  // FLY (outer ring): the same camera on the dial — zoom about the middle, non-locking on release
  var fly = { started: null };
  function flyCap() { return capFor(fly.started == null ? app.mode === 'chap' : fly.started); }
  var FLY = {
    key: 'fly', label: 'FLY', min: 0, max: 1, def: 0, span: 260, unit: .08,
    get: function () { return clamp(Math.log(sky.cam.z.t / (FIT * .7)) / Math.log(flyCap() / (FIT * .7)), 0, 1); },
    set: function (v, isLive) {
      if (isLive === false) return;               // non-locking: no settle value
      if (fly.started == null) fly.started = app.mode === 'chap';
      var s2 = sky.size(), zt = FIT * .7 * Math.pow(flyCap() / (FIT * .7), v);
      zoomAt(zt / sky.cam.z.x, s2.W / 2, s2.H * .44, flyCap());
    },
    notches: function () { var c = flyCap(); return [FIT * 1.15, CHAP, CHAP * 1.55].filter(function (z) { return z <= c; }).map(function (z) { return Math.log(z / (FIT * .7)) / Math.log(c / (FIT * .7)); }); },
    commit: function () { var st = fly.started; fly.started = null; release(!!st); },
    fmt: function () { var n = nearest(); return app.mode === 'sky' && sky.cam.z.t < 1.15 ? 'sky' : (n ? n.label : ''); }
  };
  // ORBIT (CAMERA-DIAL.md, the sky): turn the outer ring to orbit the field — it stays where you leave it;
  // a fast turn flings on and eases out; hold pushes in a level; double-tap flies home. Its chip swaps to FLY.
  var ORBIT = {
    key: 'orbit', label: 'ORBIT', min: -1, max: 1, def: 0, span: 300, unit: .05,
    get: function () { return app.lookBase; },
    set: function (v) { app.lookBase = v; lastIn = GJ.now(); },
    notches: function () { return [0]; },
    fmt: function (v) { return Math.round(v * 43) + '°'; },
    home: function () { glideHome(); }
  };
  ORBIT.alt = FLY; FLY.alt = ORBIT;
  FLY.home = function () { glideHome(); };
  function glideHome() {
    if (app.room) { app.back(); }
    var b0 = app.lookBase, t0 = GJ.now();
    (function f() { var u = Math.min(1, (GJ.now() - t0) / 620); app.lookBase = b0 * (1 - GJ.ease(u)); if (u < 1) requestAnimationFrame(f); })();
    toSky();
  }
  app.home = glideHome;
  // hold on a dial: push in, continuously, like a pinch in; let go and the non-locking release decides
  var push = null;
  dial.onHold = function (down) {
    if (app.room) return;
    if (down) { push = { started: app.mode === 'chap', t: GJ.now() }; return; }
    if (push) { var st = push.started; push = null; release(st); }
  };
  var lastIn = 0;
  // (Gill, 19 Nov) orbit is a choice: Tune → Dials → Orbit the sky (off by default). Off, the side dial does not swing the
  // sky: on the sky it turns the atmosphere and the stars, and a swing already made eases back to straight ahead.
  function orbitOn() { return !GJ.dialprefs || GJ.dialprefs.orbit(); }
  function masterRings() { return orbitOn() ? [ORBIT, GJ.skyRings.atmos] : [GJ.skyRings.atmos, GJ.skyRings.density]; }
  app.refreshRings = function () {
    if (!orbitOn() && app.lookBase) { var b0 = app.lookBase, t0 = GJ.now(); (function f() { var u = Math.min(1, (GJ.now() - t0) / 620); app.lookBase = b0 * (1 - GJ.ease(u)); if (u < 1) requestAnimationFrame(f); })(); }
    if (!app.room) dial.config(masterRings());
  };
  // the camera rail on the sky: SKY · the tool you are near · OPEN — the site's level dots
  var MRAIL = {
    // the levels, as the rail's dots (Gill, 16 Nov): sky · map · the constellation · inside it
    stops: [{ label: 'sky' }, { label: 'map' }, { label: 'near' }, { label: 'open' }],
    label: function (i) { var n = app.chap || nearest(); return i === 0 ? 'sky' : i === 1 ? 'map' : i === 2 ? (n ? n.label : '') : 'open ' + (n ? n.label : ''); },
    get: function () {
      if (app.room) return 3;
      var z = sky.cam.z.x;
      return z <= WIDE ? 0 : z <= FIT ? (z - WIDE) / (FIT - WIDE) : z <= CHAP ? 1 + (z - FIT) / (CHAP - FIT) : 2 + clamp((z - CHAP) / (CHAP * 1.55 - CHAP), 0, 1);
    },
    go: function (i) {
      var n = app.chap || nearest();
      if (i === 0) { if (app.room) app.back(); toWide(); }
      else if (i === 1) { if (app.room) app.back(); else toSky(); }
      else if (i === 2) { if (app.room) app.back(); toChap(n); }
      else enter(n.id);
    },
    scrub: function (f) {
      if (app.room) return;
      var s2 = sky.size(), z = f <= 1 ? WIDE + f * (FIT - WIDE) : f <= 2 ? FIT + (f - 1) * (CHAP - FIT) : CHAP + (f - 2) * (CHAP * 1.55 - CHAP);
      zoomAt(z / sky.cam.z.x, s2.W / 2, s2.H * .44, capFor(true));
    },
    rest: function (f) { release(f > 2 || app.mode === 'chap'); }
  };
  app.masterRail = MRAIL;
  var LOOK = null;
  app.fly = FLY;
  G.addEventListener('popstate', function () {
    // a panel that put its own entry in the history (the dial's menu, the camera dial) takes that entry back itself when it
    // closes: that Back is the panel's, not the tool's. (Their own listeners swallow it only in browsers that run capturing
    // listeners first on window; where listeners run in the order they were added, this one ran first and left the tool.)
    if (G.GJ_MASTER && (G.GJ_MASTER.isOpen() || (G.GJ_MASTER.popping && G.GJ_MASTER.popping()))) return;
    if (G.GJ_CAMDIAL && (G.GJ_CAMDIAL.isOpen() || (G.GJ_CAMDIAL.popping && G.GJ_CAMDIAL.popping()))) return;
    if (histPop) {
      histPop = false;
      if (histPending) {
        try { history.pushState({ room: histPending }, ''); } catch (e) {}
        histPending = null;
      }
      return;
    }
    // Back: closes the Tune drawer first, then steps out of the tool
    if (html.classList.contains('tune')) { tune(false); try { history.pushState({ room: app.room }, ''); } catch (e) {} return; }
    histPop = true;
    app.back();
    histPop = false;
  });

  /* ---------- the red-mode disc: one tap — now in core/redmode.js (oz 3 alt), shared by every app ---------- */

  /* ---------- the Mark: its gestures live in markmodes.js (three ways to try, Tune → Mark) ---------- */
  if (!GJ.reduced()) { $('mark').classList.add('wake'); setTimeout(function () { $('mark').classList.remove('wake'); }, 900); }
  app.tune = function (o) { tune(o == null ? !html.classList.contains('tune') : o); };
  app.tuneOpen = function () { return html.classList.contains('tune'); };
  app.closeAny = function () {   // the Mark closes whatever is open first, in every way of working
    if (html.classList.contains('places') && GJ.mark && GJ.mark.closePlaces) { GJ.mark.closePlaces(); return true; }
    if (html.classList.contains('tune')) { tune(false); return true; }
    if (GJ.cons && GJ.cons.isOpen()) { GJ.cons.close(); return true; }
    if (GJ.moonOrbit && GJ.moonOrbit.isOpen()) { GJ.moonOrbit.close(); return true; }
    if (GJ.f3 && GJ.f3.isOpen()) { GJ.f3.close(); return true; }
    if (GJ.ask && GJ.ask.isOpen()) { GJ.ask.close(); return true; }
    if (GJ.mark2 && GJ.mark2.isOpen()) { GJ.mark2.close(); return true; }
    if (G.GJ_CAMDIAL && G.GJ_CAMDIAL.isOpen()) { G.GJ_CAMDIAL.close(); return true; }
    if (G.GJ_MASTER && G.GJ_MASTER.isOpen()) { G.GJ_MASTER.close(); return true; }
    if (GJ.welcome && GJ.welcome.isOpen()) { GJ.welcome.close(); return true; }
    if (GJ.navmap && GJ.navmap.isOpen()) { GJ.navmap.close(); return true; }
    if (GJ.oztune && GJ.oztune.isOpen()) { GJ.oztune.close(); return true; }
    if (GJ.balance && GJ.balance.isOpen()) { GJ.balance.close(); return true; }
    if (GJ.friends && GJ.friends.isOpen()) { GJ.friends.close(); return true; }
    if (GJ.messages && GJ.messages.isOpen()) { GJ.messages.close(); return true; }
    if (GJ.about && GJ.about.isOpen()) { GJ.about.close(); return true; }
    if (dial.popped()) { dial.close(); return true; }
    if (GJ.demos && GJ.demos.isOpen()) { GJ.demos.close(); return true; }
    if (GJ.planner && GJ.planner.isOpen()) { GJ.planner.close(); return true; }
    if (GJ.picks && GJ.picks.comparing()) { GJ.picks.compare(false); return true; }
    if (GJ.decide && GJ.decide.isOpen()) { GJ.decide.close(); return true; }
    if (GJ.picks && GJ.picks.isOpen()) { GJ.picks.close(); return true; }
    if (GJ.markup && GJ.markup.isOn()) { GJ.markup.on(false); return true; }
    if (GJ.aplayer && GJ.aplayer.isOn()) { GJ.aplayer.close(); return true; }
    if (GJ.sweep && GJ.sweep.isOpen()) { GJ.sweep.close(); return true; }
    if (html.classList.contains('mindexing') && GJ.mindex) { GJ.mindex.close(); return true; }
    if (GJ.notes && GJ.notes.isOpen()) { GJ.notes.close(); return true; }
    if (html.classList.contains('tracks')) { html.classList.remove('tracks'); return true; }
    return false;
  };

  // the sun chart: tap to switch north up ⇄ heading up
  (function () { var c = $('gh-chart'); if (!c) return; c.classList.add('hit'); c.addEventListener('click', function (e) { e.stopPropagation(); var n = store.get().sunUp === 'north' ? 'heading' : 'north'; store.set({ sunUp: n }); GJ.haptic.tick(); if (GJ.mark) GJ.mark.say(n === 'north' ? 'north up' : 'your heading up', 1100); }); })();

  /* ---------- Tune ---------- */
  function tune(open) { html.classList.toggle('tune', open); $('mark').setAttribute('aria-expanded', open ? 'true' : 'false'); }
  $('tune').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var s = store.get(), k = b.getAttribute('data-t');
    if (k === 'red') store.set({ red: !s.red });
    if (k === 'tone') store.set({ tone: (s.tone + 1) % GJ.TONES.length, red: true });
    if (k === 'density') store.set({ density: s.density > .9 ? .7 : s.density > .6 ? .45 : 1 });
    if (k === 'fog') store.set({ fog: s.fog >= 1 ? .5 : s.fog > 0 ? 0 : 1 });
    if (k === 'atmos') store.set({ atmos: s.atmos > .9 ? .5 : s.atmos > .2 ? 0 : 1 });
    if (k === 'ambience') store.set({ ambience: s.ambience < .34 ? .5 : s.ambience < .67 ? .85 : .2 });
    if (k === 'stop') GJ.timer.stop();
    if (k === 'city') { var ids = Object.keys(GJ.Sun.CITIES), i = ids.indexOf(s.city); store.set({ city: ids[(i + 1) % ids.length] }); app.envRefresh(); if (app.room === 'golden') rooms.golden.enter(); }
    if (k === 'now') { if (app.room === 'golden') rooms.golden.toNow(); else enter('golden'); }
    if (k === 'alert') store.set({ alert: rooms.red.alertMode() === 'sound' ? 'silent' : 'sound' });
    if (k === 'tilt') { store.set({ tilt: s.tilt === false }); if (s.tilt === false && GJ.tilt) GJ.tilt.ask(); }
    if (k === 'reflect') store.set({ reflect: s.reflect === false });
    if (k === 'ripples') store.set({ ripples: s.ripples === false });
    if (k === 'moon') { if (s.moon === false) store.set({ moon: true, moonMode: 'crescent' }); else if ((s.moonMode || 'crescent') === 'crescent') store.set({ moonMode: 'phase' }); else store.set({ moon: false }); }
    if (k === 'looplen') { GJ.loops && GJ.loops.clear(); }
    var VZ = GJ.player && GJ.player.viz(), cyc = function (list, v) { var i = list.indexOf(v); return list[(i + 1) % list.length]; };
    if (k === 'vmode') GJ.player.setViz('mode', cyc(GJ.player.MODES, VZ.mode));
    if (k === 'vdensity') GJ.player.setViz('density', cyc([1, .75, .5], VZ.density));
    if (k === 'vthreads') GJ.player.setViz('threads', cyc([1, 1.8, 0, .5], VZ.threads));
    if (k === 'vspin') GJ.player.setViz('spin', cyc([1, 2, 0, .5], VZ.spin));
    if (k === 'vsize') GJ.player.setViz('size', cyc([1, 1.3, .75], VZ.size));
    if (k === 'vfold') GJ.player.setViz('fold', cyc(GJ.player.ABS.fold, VZ.fold));
    if (k === 'vtrails') GJ.player.setViz('trails', cyc(GJ.player.ABS.trails, VZ.trails));
    if (k === 'vwarp') GJ.player.setViz('warp', cyc(GJ.player.ABS.warp, VZ.warp));
    if (k === 'wxlive') store.set({ wxlive: s.wxlive === false });
    if (k === 'clock') store.set({ clock: s.clock === '24' ? '12' : '24' });
    var nx = function (list, v) { return list[(list.indexOf(v) + 1) % list.length]; };
    if (k === 'byread' && GJ.archive) GJ.archive.choose(nx(['off', 'red', 'colour', 'light'], GJ.archive.beyond().read || (s.red ? 'red' : 'off')));
    if (k === 'bydepth') store.set({ byDepth: nx(['far', 'mid', 'close'], s.byDepth || 'far') });
    if (k === 'bydrift') store.set({ byDrift: nx(['off', 'slow', 'easy'], s.byDrift || 'slow') });
    if (k === 'byease') store.set({ byEase: nx(['fold', 'cubic', 'smooth', 'push'], s.byEase || 'fold') });
    if (k === 'bymove') store.set({ byMove: s.byMove === 'orbit' ? 'dolly' : 'orbit' });
    if (k === 'shrink' && GJ.shrink) { tune(false); GJ.shrink.open(); }
    if (k === 'zip' && GJ.zip) { tune(false); GJ.zip.open(); }
    if (k === 'mindex' && GJ.mindex) { tune(false); GJ.mindex.open(); }
    if (k === 'sweep' && GJ.sweep) { tune(false); GJ.sweep.open(); }
    if (k === 'picks' && GJ.picks) { tune(false); GJ.picks.open(); }
    if (k === 'decide' && GJ.decide) { tune(false); GJ.decide.open(); }
    if (k === 'aplayer' && GJ.aplayer) { tune(false); GJ.aplayer.playCurrent(); }
    if (k === 'photolab' && GJ.lab) { tune(false); GJ.lab.open(); }
    if (k === 'objects' && GJ.objects) { tune(false); GJ.objects.open(); }
    if (k === 'demos' && GJ.demos) { tune(false); GJ.demos.open(); }
    if (k === 'navmap' && GJ.navmap) { tune(false); GJ.navmap.open(); }
    if (k === 'oztune' && GJ.oztune) { tune(false); GJ.oztune.open(); }
    if (k === 'balance' && GJ.balance) { tune(false); GJ.balance.open(); }
    if (k === 'messages' && GJ.messages) { tune(false); GJ.messages.open(); }
    if (k === 'friends' && GJ.friends) { tune(false); GJ.friends.open(); }
    if (k === 'f3' && GJ.f3) { tune(false); GJ.f3.open(); }
    if (k === 'newcon' && GJ.cons) { tune(false); GJ.cons.newAt(G.innerWidth / 2, G.innerHeight * .62); }
    if (k === 'moondial' && GJ.moon) { GJ.moon.set(!GJ.moon.isOn()); if (GJ.moon.isOn()) tune(false); }
    if (k === 'welcome' && GJ.welcome) { tune(false); GJ.welcome.open(); }
    if (k === 'planner' && GJ.planner) { tune(false); GJ.planner.open(); }
    if (k === 'notes' && GJ.notes) { tune(false); GJ.notes.open(); }
    if (k === 'sunup') store.set({ sunUp: s.sunUp === 'north' ? 'heading' : 'north' });
    if (k === 'photored') store.set({ photoRed: s.photoRed === false });
    if (k === 'fullsafe') store.set({ fullSafe: !s.fullSafe, red: !s.fullSafe ? true : s.red });
    if (k === 'mark' && GJ.mark) { var mm = ['a', 'b', 'c'], cur = mm.indexOf(GJ.mark.mode()); GJ.mark.setMode(mm[(cur + 1) % 3]); }
    if (k === 'hub') { store.set({ hub: s.hub === 'star' ? 'field' : 'star' }); layout(); }
    if (k === 'reduce') store.set({ reduce: { auto: 'on', on: 'off', off: 'auto' }[s.reduce] || 'auto' });
  });
  app.tune = tune;

  /* ---------- the sky: one finger looks (parallax depth), two fingers fly, taps step in ---------- */
  var cvs = $('sky'), ptrs = {}, pinch = null, tap = null, look = null, wheel = { t: 0, started: null };
  function goNode(n) { if (n.custom) { if (n.opens && GJ.navmap) GJ.navmap.go(n.opens); else if (GJ.mark) GJ.mark.say('hold it to edit · choose what it opens', 1800); return; } enter(n.id); }   // a constellation of his own opens what he chose
  function hitNode(x, y) {
    var best = null, bd = 1e9;
    sky.nodes.forEach(function (n) { var c = n.screen || sky.toScreen(n.x, n.y, n.depth), d = Math.hypot(c.x + 10 - x, c.y + 8 - y); if (d < bd) { bd = d; best = n; } });
    return bd < 52 * Math.max(1, best.scale) * Math.min(2, sky.cam.z.x) ? best : null;
  }
  cvs.addEventListener('pointerdown', function (e) {
    if (html.classList.contains('tune')) { tune(false); return; }
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(ptrs);
    if (ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      var d0 = Math.hypot(a.x - b.x, a.y - b.y);
      pinch = { pd: d0, d0: d0, m0: mid(a, b), kind: null, started: app.mode === 'chap' }; tap = null; look = null; return;
    }
    tap = { x: e.clientX, y: e.clientY, t: GJ.now() };
    look = { x: e.clientX, y: e.clientY, lx: app.lookUser, ly: app.lookUserY, on: false };
    if (app.room !== 'loupe') {   // on the water: a ripple; in the sky: the glimmer and its bloom — never on a photograph
      if (e.clientY > sky.horizonY() + 2 && e.clientY < sky.size().H * .84 && sky.ripples) sky.ripple(e.clientX, e.clientY);
      else { sky.note(e.clientX, e.clientY); sky.bloom(e.clientX, e.clientY); }
    }
  });
  G.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(ptrs);
    if (pinch && ids.length >= 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), m = mid(a, b);
      pinch.mx = m.x; pinch.my = m.y;
      if (pinch.kind !== 'pinch') {   // decide once the fingers have moved: a pinch, or two fingers moving together (no zoom, no level)
        var sp = Math.abs(d - pinch.d0), tr = Math.hypot(m.x - pinch.m0.x, m.y - pinch.m0.y);
        if (pinch.kind == null && Math.max(sp, tr) > 14) pinch.kind = isPinch(pinch.d0, d, pinch.m0, m) ? 'pinch' : 'pan';
        else if (pinch.kind === 'pan' && sp > 60 && sp > tr * 1.5) pinch.kind = 'pinch';   // it became a clear pinch after all
        if (pinch.kind !== 'pinch') return;
        pinch.pd = pinch.d0;   // the camera catches up with the whole spread so far
      }
      if (!app.room) zoomAt(d / Math.max(1, pinch.pd), m.x, m.y, capFor(pinch.started));
      pinch.r = (pinch.r || 1) * d / Math.max(1, pinch.pd); pinch.pd = d;
      return;
    }
    if (look) {
      var dx = e.clientX - look.x, dy = e.clientY - look.y;
      if (!look.on && Math.hypot(dx, dy) > 8) { look.on = true; tap = null; }   // > 8 px cancels a tap
      if (look.on) {   // drag the sky: nearer layers slide more (look × f × 140), W_LOOK spring
        // one finger reveals depth, subtly: the layers part a little and spring back flat when you let go
        app.lookUser = clamp(look.lx - dx / (lookUnit() * 1.8), -.7, .7);
        app.lookUserY = clamp(look.ly - dy / (lookUnit() * 1.8), -.25, .25);
      }
    }
  });
  function ptrUp(e) {
    if (!ptrs[e.pointerId]) return;
    delete ptrs[e.pointerId];
    if (pinch) {
      if (Object.keys(ptrs).length === 0) {
        var p = pinch; pinch = null;
        if (p.kind !== 'pinch' || !p.r) return;   // two fingers moved together: no level change
        var pk = picked; unpick();
        if (p.r < .84) rise();             // pinching out always rises one level
        else if (!app.room && p.r > 1.3) { var nn = hitNode(p.mx, p.my) || pk || nearest(); if (nn) goNode(nn); else release(p.started); }   // one pinch in: into the tool under the fingers
        else if (!app.room) release(p.started);
      }
      return;
    }
    if (look && look.on) { app.lookUser = 0; app.lookUserY = 0; }   // depth.js: flat at rest; the layers spring back (W_LOOK)
    look = null;
    if (tap && GJ.now() - tap.t < 500 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 10 && !app.room) {
      var mk = sky.mark && sky.mark.screen;
      if (mk && (app.mode === 'sky' || app.mode === 'wide') && Math.abs(e.clientX - mk.x) < sky.mark.r && Math.abs(e.clientY - mk.y) < sky.mark.r * .5) { dial.toggle(); }
      else {
        var n = hitNode(e.clientX, e.clientY);
        // the sound sky: at the chapter level, tap a star to hear it (the site's "tap a star to hear it")
        var heard = false;
        if (app.mode === 'chap' && app.chap && app.chap.anchors && app.chap.seat) {
          app.chap.seat.forEach(function (q) { if (!heard && Math.hypot(q.x - e.clientX, q.y - e.clientY) < 28) { heard = true; if (GJ.audio) GJ.audio.ctx();
            if (GJ.player.selected() === q.i) { GJ.player._inside = true; enter('player'); } else { (GJ.player.pick || GJ.player.select)(q.i); if (GJ.mark && GJ.mark.say) GJ.mark.say('tap again to open', 1800); } } });   // tap once: picks it (no sound) · again: open it
        }
        if (!heard && n) { if (picked === n && GJ.now() - pickT < 8000) goNode(n); else pick(n); }   // tap once: it lights + its name · again: in
        else if (!heard) unpick();
      }
    }
    tap = null;
  }
  G.addEventListener('pointerup', ptrUp); G.addEventListener('pointercancel', ptrUp);

  G.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (html.classList.contains('tune')) return;
    if (app.room || e.altKey) { dial.wheel(e.deltaY, e.altKey); return; }
    // Previews wheel: f = exp(−deltaY × .0022), same zoomAt and cap; 260 ms of quiet, then release
    if (wheel.started == null) wheel.started = app.mode === 'chap';
    zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0022)), e.clientX, e.clientY, capFor(wheel.started));
    clearTimeout(wheel.t);
    wheel.t = setTimeout(function () { var st = wheel.started; wheel.started = null; release(st); }, 260);
  }, { passive: false });

  G.addEventListener('keydown', function (e) {
    if (e.target && /^(TEXTAREA|INPUT)$/.test(e.target.tagName) && e.key !== 'Escape') return;   // typing (notes, a frame's note) is typing
    if (e.key === 'Escape') { if (e.defaultPrevented) return; if (app.closeAny()) return; if (dial.open) dial.close(); else app.back(); }
    if (!app.room) return;
    if (e.key === 'ArrowUp') dial.nudge(1, e.altKey);
    if (e.key === 'ArrowDown') dial.nudge(-1, e.altKey);
    if (app.room === 'loupe' && e.key === 'ArrowLeft') rooms.loupe.prev();
    if (app.room === 'loupe' && e.key === 'ArrowRight') rooms.loupe.next();
    if (app.room === 'red' && e.key === ' ') rooms.red.toggle();
    if (app.room && rooms[app.room].key) rooms[app.room].key(e.key);
  });

  /* ---------- environment: the sky follows the real sun for the city (Golden Hour data) ---------- */
  var envT = 0;
  function envSun() {
    if (GJ.lightTide && GJ.lightTide.at() != null) return;   // the Light-tide clock is holding or scrubbing the hour
    var n = Date.now(); if (n - envT < 20000 && envT) return; envT = n;
    var c = GJ.Sun.CITIES[store.get().city] || GJ.Sun.CITIES.vancouver, p = GJ.Sun.position(n, c.lat, c.lon);
    GJ.aim(sky.golden.sun, p.alt, true); GJ.aim(sky.golden.sunAz, p.az, true);
  }
  app.envRefresh = function () { envT = 0; };

  /* ---------- loop ---------- */
  var last = GJ.now(), driftT = 0, drifting = false, wxT = 0;
  document.addEventListener('pointerdown', function () { lastIn = GJ.now(); }, true);
  function loop() {
    var t = GJ.now(), real = Math.max(.001, (t - last) / 1000), dt = Math.min(.1, real); last = t;   // a slow frame catches up (to 100 ms), it never stalls the sky
    var tl = GJ.tilt ? GJ.tilt.read(Math.min(1, real)) : { x: 0, y: 0 };   // 3D tilt adds to the look: the constellations turn, the layers slide
    if (push) { var s3 = sky.size(); zoomAt(Math.exp(dt * .9), s3.W / 2, s3.H * .44, capFor(push.started)); if (push.started && sky.cam.z.x > CHAP * 1.55) { push = null; goNode(app.chap); } }
    // drift (camera dial): a slow idle orbit after 3.5 s untouched, back and forth — never runaway
    if (CAM.driftRadPerSec && !app.room && GJ.now() - lastIn > 3500 && !GJ.reduced()) {
      var wr = CAM.driftRadPerSec / .75 / .6;   // the yaw rate, as a share of the ±.6 swing
      if (!drifting) { drifting = true; driftT = Math.asin(clamp(app.lookBase / .6, -1, 1)) / wr; }   // pick up from where you left it
      driftT += dt; app.lookBase = Math.sin(driftT * wr) * .6;
    } else drifting = false;
    GJ.aim(sky.look.x, app.lookBase + app.lookUser + tl.x); GJ.aim(sky.look.y, clamp(app.lookUserY + tl.y, -.5, .5));
    if (app.room !== 'golden') envSun();
    if (GJ.now() - wxT > 3000) { wxT = GJ.now(); var Ew = sunEv(), Rw = app.room === 'golden' && GJ.rooms.golden.wxNow ? GJ.rooms.golden.wxNow() : GJ.weather && GJ.weather.forDay(Date.now(), Ew.c, Ew.e); sky.setWeather(Rw ? Rw.name : 'clear', null, Rw ? Rw.veil : 0); sky.setSunset(Rw ? Rw.sunset : null); }
    sky.wxLive = store.get().wxlive !== false;
    sky.inRoom = !!app.room; sky.roomId = app.room;   // the low horizon of the column and star hubs is the hub's; the tools keep theirs at 61 %
    sky.frame(dt, t);
    if (app.room) rooms[app.room].frame(dt);
    else if (store.get().timer.running && GJ.timer.remaining() <= 0) GJ.timer.expire();   // red mode turns itself off anywhere
    rail.redraw(); dial.tick();
    var mpth = document.querySelector('.mpath'), mo = (sky.moonA || 0) * .4 * (sky.fog > 0 ? 1 : .6);
    if (Math.abs((+mpth.dataset.o || 0) - mo) > .01) { mpth.style.opacity = mo.toFixed(2); mpth.dataset.o = mo; }
    $('tn-time').textContent = GJ.fmtMs(GJ.timer.remaining()) + (store.get().timer.running ? ' · running' : '');
    requestAnimationFrame(loop);
  }

  /* ---------- start ---------- */
  app.layout = layout;
  sky.init(cvs); dial.init(); rail.init(); layout(); dial.config(masterRings()); rail.config(MRAIL);
  GJ.aim(sky.golden.a, 1, true);   // the environment is always on
  // wake: the Mark at the centre draws on (.9 s ease) and the field unfolds; first arrival from fitS × .7
  if (!GJ.reduced()) { sky.wake = GJ.now(); GJ.aim(sky.cam.z, FIT * .7, true); GJ.aim(sky.cam.z, FIT); setTimeout(function () { $('poem').classList.add('on'); }, 1700); }
  else $('poem').classList.add('on');
  G.addEventListener('resize', layout);
  apply(store.get());
  setTimeout(function () { document.querySelector('.horizon').classList.add('on'); }, 250);
  try { document.fonts.load('16px "Julius Sans One"').then(function (l) { if (!l.length) html.classList.add('nojulius'); }, function () { html.classList.add('nojulius'); }); } catch (e) { html.classList.add('nojulius'); }
  try { history.replaceState({ room: null }, ''); } catch (e) {}
  var start = Q.get('room') || GJ.APP.home;   // an app may open in its own room (Good Weather: golden hour)
  if (start && rooms[start]) enter(start, { noHistory: false });
  requestAnimationFrame(loop);
})(this);
