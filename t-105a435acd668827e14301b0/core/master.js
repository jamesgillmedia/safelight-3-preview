/* tools-02 · the master dial (Gill, 17 Nov: "take the design of the 3D camera dial and bring it into a master dial to control").
   One dial, the camera dial's own build — the site's side dial (#fold-dial / camera-dial.js geometry: 34×120 smoked tab, arc,
   11 ticks, a dot, a vertical label) — on the right edge, the same place in every room.
   · Slide on it, or anywhere on the edge, to turn: the upper half of the edge is the place's first layer, the lower half its
     second; the dial shows whichever you are on, its dot riding the ticks, and a small plate unfolds beside it with the value.
     A fast turn flings; hold pushes in a level; double-tap goes home (dial.js, CAMERA-DIAL.md).
   · Tap it: it unfolds into a 3D constellation (camera-dial.js, generalised): one ring per choice, each choice a star, the
     chosen stars joined by a hairline figure. Drag orbits it and it springs back flat; tap a star or a word to choose.
     Five planes: the place you are in · camera · sky · oz · beyond (Tune folded in — the long-press on the Mark still opens it all).
   The camera module stays loaded for its numbers; its own tab and panel are folded into this one. */
(function (G) {
  'use strict';
  var GJ = G.GJ, dial = GJ.dial, store = GJ.store, clamp = GJ.clamp, D = document.documentElement;
  var RMQ = G.matchMedia('(prefers-reduced-motion: reduce)');
  function rmOn() { return GJ.reduced(); }
  function now() { return GJ.now(); }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- 1. the dial (the camera dial's build, unchanged geometry) ---------- */
  var b = document.createElement('button'); b.type = 'button'; b.id = 'master';
  b.setAttribute('aria-label', 'the dial: slide to turn, tap to hear its value, double-tap to reset'); b.setAttribute('aria-expanded', 'false');
  var h = '<svg viewBox="0 0 30 120" aria-hidden="true"><path class="fd-arc" d="M30 6 A70 70 0 0 0 30 114"/>', CX = 74.5, i;
  for (i = 0; i <= 10; i++) {
    var ang = Math.PI - .8 + i * .16, ox = CX + 70 * Math.cos(ang), oy = 60 + 70 * Math.sin(ang), ri = i % 5 ? 65 : 61, ix = CX + ri * Math.cos(ang), iy = 60 + ri * Math.sin(ang);
    h += '<line class="fd-tick" x1="' + ox.toFixed(1) + '" y1="' + oy.toFixed(1) + '" x2="' + ix.toFixed(1) + '" y2="' + iy.toFixed(1) + '"/>';
  }
  h += '<circle class="fd-dot" cx="4.5" cy="60" r="2.2"/><text class="fd-lab" x="15" y="62.5" text-anchor="middle" transform="rotate(90 15 60)">DIAL</text>' +
    // the dial at rest (section 1b): a thin slider (its rail on the edge's own hairline, and a thumb), or the value alone
    '<line class="fd-rail" x1="28.5" y1="14" x2="28.5" y2="106"/><rect class="fd-thumb" x="22" y="58.9" width="9" height="2.2" rx="1.1"/>' +
    '<text class="fd-val" x="24" y="63.8" text-anchor="end"></text></svg>';
  b.innerHTML = h; document.body.appendChild(b);
  var DOT = b.querySelector('.fd-dot'), LAB = b.querySelector('.fd-lab');
  // the plate: unfolds left of the dial while you turn (the tune drawer's planes, one plane)
  var plate = document.createElement('div'); plate.id = 'master-read'; plate.setAttribute('aria-live', 'polite');
  plate.innerHTML = '<b></b><span></span><i></i>'; document.body.appendChild(plate);

  /* the second dial (Gill, 17 Nov: "add dials to the side… stack them tastefully"): a place with a whole system of its
     own (the sound room, the archive) gets its second layer as its own dial, stacked under the first */
  var b2 = document.createElement('button'); b2.type = 'button'; b2.id = 'master2'; b2.setAttribute('aria-label', 'the second dial: slide to turn');
  b2.innerHTML = b.innerHTML; document.body.appendChild(b2);
  var DOT2 = b2.querySelector('.fd-dot'), LAB2 = b2.querySelector('.fd-lab');
  function stacked() { var rm = GJ.app && GJ.app.room; return !!(rm && GJ.rooms[rm] && GJ.rooms[rm].stack && dial.rings()[1] && !D.classList.contains('aropen')); }   // an open frame puts the second dial away: the one dial then turns whichever layer is up (FRAME, or SPEED from its button)
  function dot(Dt, Lb, r) {
    var v = clamp(r.get(), r.min, r.max), f = (v - r.min) / (r.max - r.min), a = Math.PI - .8 + f * 1.6;   // bottom = min, top = max
    Dt.setAttribute('cx', (CX + 70 * Math.cos(a)).toFixed(2)); Dt.setAttribute('cy', (60 + 70 * Math.sin(a)).toFixed(2));
    if (Lb.textContent !== r.label) Lb.textContent = r.label;
    // the resting forms read the same value: the slider's thumb (bottom = min, top = max) and the word
    var sv = Dt.parentNode, th = sv.querySelector('.fd-thumb'), vl = sv.querySelector('.fd-val'), tx = String(r.fmt(v));
    if (th) th.setAttribute('y', (106 - f * 92 - 1.1).toFixed(2));
    if (vl && vl.textContent !== tx) vl.textContent = tx;
  }
  /* a small title that teaches, after the dial opens (the first few times for each layer, and when it comes home) */
  var tip = document.createElement('div'); tip.id = 'dial-tip'; tip.setAttribute('aria-live', 'polite'); document.body.appendChild(tip);
  var tipT = 0, TIPS = {}; try { TIPS = JSON.parse(GJ.settings.getItem('gj-tips') || '{}'); } catch (e) {}
  function teach(text, force, key) {
    if (!force) { if ((TIPS[key] || 0) >= 3) return; TIPS[key] = (TIPS[key] || 0) + 1; try { GJ.settings.setItem('gj-tips', JSON.stringify(TIPS)); } catch (e) {} }
    tip.textContent = text; tip.classList.add('on'); clearTimeout(tipT); tipT = setTimeout(function () { tip.classList.remove('on'); }, 2400);
  }
  function lesson(r) { return r.label.toLowerCase() + ' · slide to turn · hold to push in' + (r.alt ? ' · ⇅ ' + r.alt.label.toLowerCase() + ' in the menu' : '') + ' · tap for every choice'; }
  var act = 0;   // the layer the dial shows: the one last touched
  function paint(i, ring, fine) {
    if (stacked()) { var R0 = dial.rings()[0], R1 = dial.rings()[1]; if (R0) dot(DOT, LAB, i === 0 && ring ? ring : R0); if (R1) dot(DOT2, LAB2, i === 1 && ring ? ring : R1); }
    if (i !== act) return;
    var r = ring || dial.rings()[act]; if (!r) return;
    var v = clamp(r.get(), r.min, r.max);
    if (!stacked()) dot(DOT, LAB, r);
    plate.children[0].textContent = r.label; plate.children[1].textContent = r.fmt(v);
    plate.children[2].textContent = fine < 1 ? 'fine' : r.alt ? '⇅ ' + r.alt.label.toLowerCase() : (act === 0 && dial.rings()[1] ? '↓ ' + dial.rings()[1].label.toLowerCase() : act === 1 && dial.rings()[0] ? '↑ ' + dial.rings()[0].label.toLowerCase() : '');
  }
  dial.onPaint = function (i, ring, fine) { if (dial.dragging() === i || i === act) { act = i; paint(i, ring, fine); } };
  /* the dial comes home (Gill, 17 Nov): once you let it go, it returns to the layer that is this place's main function —
     unless where you are in the tool needs the other one (the room says which: rooms[id].home()) */
  var homeT = 0;
  function homeKey() { var rm = GJ.app && GJ.app.room, R = rm && GJ.rooms[rm]; if (R && R.home) return R.home(); var r0 = dial.rings()[0]; return r0 && (r0.homeKey || r0.key); }
  function goHome() {
    var k = homeKey(), rs = dial.rings(); if (!k || dial.visible) return;
    for (var j = 0; j < rs.length; j++) {
      var r = rs[j]; if (!r) continue;
      if (r.key === k || (r.alt && r.alt.key === k)) { if (r.key !== k) dial.swapQuiet(j); if (act !== j) { act = j; } paint(act); return; }
    }
  }
  dial.onShow = function (i, on) {
    if (on) { clearTimeout(homeT); if (!(resting && restMode() === 'rest' && dial.dragging() === i)) wakeNow(); act = i; paint(i); b.classList.add('live'); (i === 1 && stacked() ? b2 : b).classList.add('live'); plate.classList.add('on'); var r = dial.rings()[i]; if (r) teach(lesson(r), false, r.key); }
    else if (!dial.visible) { b.classList.remove('live'); b2.classList.remove('live'); plate.classList.remove('on'); clearTimeout(homeT); homeT = setTimeout(goHome, 1600); armRest(REST_AFTER); }
  };
  GJ.dialHome = { key: homeKey, go: goHome, teach: teach, act: function () { return act; } };

  /* ---------- 1b. the dial at rest: our own auto-hide (Gill: "shrink to a sliver / value / slider") ----------
     Untouched, the dial lets go of its glass, ticks and name and rests as one of three quiet forms, to try side by side
     (Tune → The dial, or the dial's own menu → oz → the dial):
       slip · only a hairline arc and its dot stay      tick · only the value stays
       rest · a thin slider stays, and can still be dragged: it turns under the finger without growing back
     'full' (the default) is the dial as it was: it stays. The dial's place on the edge never moves and takes the touch
     either way, so the gestures are the same awake or at rest: slide = turn, tap = every choice, hold = push in,
     double-tap = home. A touch on it or on the edge (slip, tick), the Mark's summon, its menu, or arriving in a place
     wakes it. It rests after the dial's own goodbye (dial.js: 1.6 s hold + .72 s fade) and its trip home (1.6 s).
     While a resting form is up, the edge's own value dots step back: one mark for one value. */
  var REST = { full: 'stays', slip: 'slip · hairline', tick: 'tick · value', rest: 'rest · slider' }, REST_ORDER = ['full', 'slip', 'tick', 'rest'];
  var REST_SAY = { full: 'the dial stays', slip: 'slip · the dial rests as a hairline · touch it and it is back', tick: 'tick · the dial rests as its value · touch it and it is back', rest: 'rest · the dial rests as a slider · it still slides · tap for every choice' };
  var REST_AFTER = 1800, REST_ARRIVE = 2600, REST_IDLE = 4000, REST_SHOW = 1400;
  var restT = 0, resting = false;
  function restMode() { var m = store.get().dialRest; return REST[m] ? m : 'full'; }
  function busy() { return open || dial.visible || !!press || dial.dragging() >= 0 || dial.flinging(); }
  function setRest(on) {
    on = !!on && restMode() !== 'full'; if (on === resting) return; resting = on;
    b.classList.toggle('resting', on); b2.classList.toggle('resting', on); D.classList.toggle('dial-rests', on);
    if (on) teach(REST_SAY[restMode()], false, 'rest-' + restMode());
  }
  function armRest(ms) {
    clearTimeout(restT); restT = 0; if (restMode() === 'full') return;
    restT = setTimeout(function () { restT = 0; if (busy()) armRest(700); else setRest(true); }, ms);
  }
  function wakeNow() { clearTimeout(restT); restT = 0; setRest(false); }
  function wake(ms) { wakeNow(); armRest(ms || REST_IDLE); }
  var restWas = restMode();
  function restApply() {
    var m = restMode(), row = document.querySelector('#tune [data-t="dialrest"] b');
    D.setAttribute('data-dial-rest', m); if (row) row.textContent = REST[m];
  }
  store.on(function () {   // a new form was chosen: the dial wakes, says what it will do, then shows it
    var m = restMode(); if (m === restWas) return; restWas = m; restApply(); wakeNow(); if (!open && !D.classList.contains('tune')) teach(REST_SAY[m], true);
    if (m !== 'full') armRest(REST_SHOW);
  });
  restApply(); armRest(REST_IDLE);
  // its Tune row (Tune → The dial → When untouched) steps through the forms; handled here so the dial keeps its own
  (function () { var t = document.getElementById('tune'); if (t) t.addEventListener('click', function (e) { var x = e.target.closest('button'); if (x && x.getAttribute('data-t') === 'dialrest') GJ.dialRest.next(); }); })();
  GJ.dialRest = {
    MODES: REST, mode: restMode, label: function () { return REST[restMode()]; }, resting: function () { return resting; },
    set: function (m) { if (REST[m]) store.set({ dialRest: m }); }, next: function () { store.set({ dialRest: REST_ORDER[(REST_ORDER.indexOf(restMode()) + 1) % REST_ORDER.length] }); },
    wake: wake, rest: function () { clearTimeout(restT); restT = 0; setRest(true); }
  };
  function place() {
    var H = G.innerHeight, mid = H * .465;
    b.style.top = (mid - 61) + 'px'; plate.style.top = (mid - 22) + 'px'; b2.style.top = (mid + 70) + 'px'; tip.style.top = (mid + 34) + 'px';
    D.classList.toggle('stacked', stacked());
  }
  G.addEventListener('resize', place); place();
  var whereWas = '';
  setInterval(function () {
    D.classList.toggle('stacked', stacked()); if (!dial.visible) paint(act);   // the dot keeps up with changes made elsewhere
    var where = ((GJ.app && GJ.app.room) || '') + (D.classList.contains('aropen') ? '+' : '');
    if (where !== whereWas) { whereWas = where; if (restMode() !== 'full') wake(REST_ARRIVE); }   // arriving in a place: the dial shows what it turns here, then rests
    else if (!resting && !restT && restMode() !== 'full' && !busy()) armRest(REST_AFTER);          // nothing left it pending: rest anyway
  }, 500);

  // touch: slide = turn the layer it shows (through dial.js: fling, fine, hold, double-tap); tap = unfold
  var press = null, tapT = 0;
  // the compare preview (core/compare.js, 20 Nov): 'after' restores dial A (8048249) — a tap unfolds every choice, and the
  // unfolded constellation always orbits under a drag and springs back, while the sky itself stays still. 'before' is as it was.
  function after() { return !!(G.GJ_COMPARE && G.GJ_COMPARE.v() === 'after'); }
  // every dial alike (dialkit.js): named on first touch, rests when left alone, steps back while turned
  GJ.dialkit.attach('master', { els: [b, b2], label: function () { var r = dial.rings()[act] || dial.rings()[0]; return (r ? r.label.toLowerCase() + ' · ' : '') + (after() ? 'slide to turn · tap for every choice · double-tap resets' : 'slide to turn · tap for the value · double-tap resets'); }, busy: function () { return open || dial.dragging() >= 0; } });
  b2.addEventListener('pointerdown', function () { GJ.dialkit.touch('master'); });
  b.addEventListener('pointerdown', function (e) {
    GJ.dialkit.touch('master');
    if (open) return;
    e.preventDefault(); if (restMode() !== 'rest') wakeNow(); press = { x: e.clientX, y: e.clientY, t: now(), moved: false };
    if (tapT) { clearTimeout(tapT); tapT = 0; press.second = true; }   // a second tap: dial.js takes it as home
    dial.grab(e, stacked() ? 0 : dial.rings()[act] ? act : 0);
  });
  b2.addEventListener('pointerdown', function (e) { if (open || !stacked()) return; e.preventDefault(); if (restMode() !== 'rest') wakeNow(); act = 1; dial.grab(e, 1); });
  b2.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
  (function () {   // the second dial taps like the first: a tap unfolds every choice (at the place's own plane)
    var p2 = null, t2 = 0;
    b2.addEventListener('pointerdown', function (e) { p2 = { x: e.clientX, y: e.clientY, t: now() }; if (t2) { clearTimeout(t2); t2 = 0; p2.second = true; } });
    G.addEventListener('pointerup', function (e) { if (!p2) return; var q = p2; p2 = null; if (q.second || now() - q.t > 400 || Math.hypot(e.clientX - q.x, e.clientY - q.y) > 8) return; t2 = setTimeout(function () { t2 = 0; tapped(1); }, 300); });
  })();
  G.addEventListener('pointermove', function (e) { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) press.moved = true; });
  G.addEventListener('pointerup', function () {
    if (!press) return; var p = press; press = null;
    if (p.moved || p.second || now() - p.t > 400) return;   // a turn, a double-tap or a hold is not a tap
    tapT = setTimeout(function () { tapT = 0; tapped(); }, 300);
  });
  // a tap on the dial (review B2): its name and value, beside it, in the plate — every choice lives in the places sheet
  // (hold the Mark → every choice). The old tap-opens-every-choice is parked: Tune → developer → The dial (dialTapSheet).
  var valT = 0;
  function tapped(i) {
    if (store.get().dialTapSheet || after()) { show(true); return; }   // after: dial A's tap (fixes 017a17a)
    if (i != null) act = i; var r = dial.rings()[act] || dial.rings()[0]; if (!r) return;
    paint(act, r, 1); plate.classList.add('on'); GJ.haptic.tick();
    clearTimeout(valT); valT = setTimeout(function () { if (dial.dragging() < 0) plate.classList.remove('on'); }, 1800);
  }
  b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
  b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(!open); } });
  [b, b2].forEach(function (x) { x.addEventListener('focus', function () { if (x.matches(':focus-visible')) wake(); }); });   // reached by keyboard: awake

  /* ---------- 2. the planes: what each part of the constellation holds ---------- */
  function onoff(k, def) { return { k: k, name: k, opts: [['on', 'on'], ['off', 'off']], get: function () { return store.get()[k] === false ? 'off' : (store.get()[k] == null && def === false ? 'off' : 'on'); }, set: function (v) { var o = {}; o[k] = v === 'on'; store.set(o); } }; }
  function num(k, name, opts) { return { k: k, name: name, opts: opts.map(function (o) { return [String(o[0]), o[1]]; }), get: function () { var v = store.get()[k], best = opts[0]; opts.forEach(function (o) { if (Math.abs(o[0] - v) < Math.abs(best[0] - v)) best = o; }); return String(best[0]); }, set: function (v) { var o = {}; o[k] = parseFloat(v); store.set(o); } }; }
  // a continuous ring of the place, as stars: its notches, or five stops across it
  function stopsOf(r) {
    var vs = r.stops ? r.stops() : r.notches ? r.notches().filter(function (v) { return v >= r.min && v <= r.max; }) : [];
    if (vs.length < 3 || vs.length > 7) { vs = []; for (var k = 0; k < 5; k++) vs.push(r.min + (r.max - r.min) * k / 4); }
    if (r.step) vs = vs.map(function (v) { return r.step(v); });
    var seen = {}; vs = vs.filter(function (v) { var key = r.fmt(v); if (seen[key]) return false; return (seen[key] = true); });
    return {
      k: 'r-' + r.key, name: r.label.toLowerCase(), cont: r,
      opts: vs.map(function (v) { return [String(v), r.fmt(v)]; }),
      get: function () { var c = r.get(), best = vs[0]; vs.forEach(function (v) { if (Math.abs(v - c) < Math.abs(best - c)) best = v; }); return String(best); },
      set: function (v) { v = parseFloat(v); r.set(v, false); if (r.commit) r.commit(v); dial.redraw(); }
    };
  }
  function edgeRing(i) {   // which ring this half of the edge turns (the ⇅ second job)
    var r = dial.rings()[i]; if (!r || !r.alt) return null;
    var a = r, z = r.alt;
    return { k: 'edge' + i, name: i ? 'lower edge' : 'upper edge', opts: [[a.key, a.label.toLowerCase()], [z.key, z.label.toLowerCase()]],
      get: function () { return dial.rings()[i].key; }, set: function (v) { if (dial.rings()[i].key !== v) dial.swap(i); } };
  }
  function placeRings() {
    var room = GJ.app.room, out = [], R = dial.rings().filter(Boolean);
    var X = {
      red: [{ k: 'alert', name: 'at the end', opts: [['sound', 'alarm'], ['silent', 'silent']], get: function () { return GJ.rooms.red.alertMode(); }, set: function (v) { store.set({ alert: v }); } }],
      golden: [{ k: 'city', name: 'city', opts: Object.keys(GJ.Sun.CITIES).map(function (c) { return [c, GJ.Sun.CITIES[c].name.toLowerCase()]; }), get: function () { return store.get().city || 'vancouver'; }, set: function (v) { store.set({ city: v }); } }],
      player: !GJ.player ? [] : [{ k: 'vmode', name: 'visualizer', opts: GJ.player.MODES.map(function (m) { return [m, m]; }), get: function () { return GJ.player.viz().mode; }, set: function (v) { GJ.player.setViz('mode', v); } },
        { k: 'vfold', name: 'fold', opts: GJ.player.ABS.fold.map(function (f) { return [String(f), f + '×']; }), get: function () { return String(GJ.player.viz().fold); }, set: function (v) { GJ.player.setViz('fold', +v); } },
        { k: 'vtrails', name: 'trails', opts: GJ.player.ABS.trails.map(function (f) { return [String(f), f ? Math.round(f * 100) + '' : 'off']; }), get: function () { return String(GJ.player.viz().trails); }, set: function (v) { GJ.player.setViz('trails', +v); } },
        { k: 'vwarp', name: 'warp', opts: GJ.player.ABS.warp.map(function (f) { return [String(f), f ? Math.round(f * 100) + '' : 'off']; }), get: function () { return String(GJ.player.viz().warp); }, set: function (v) { GJ.player.setViz('warp', +v); } },
        { k: 'track', name: 'song', opts: GJ.player.tracks.map(function (t, j) { return [String(j), t.t.toLowerCase()]; }), get: function () { return String(GJ.player.state().idx); }, set: function (v) { GJ.player.hear(+v); } }],
      archive: [{ k: 'arrange', name: 'arrange', opts: [['film', 'by film'], ['light', 'light'], ['colour', 'colour'], ['motion', 'motion'], ['field', 'continuous']],
          get: function () { var s = GJ.archive.state(); return s.order === 'by film' ? 'film' : s.order === 'grouped' ? s.axis : 'field'; },
          set: function (v) { if (v === 'film') GJ.archive.setOrder(0); else if (v === 'field') GJ.archive.setOrder(1); else GJ.archive.group(['light', 'colour', 'motion'].indexOf(v)); } },
        { k: 'beyondm', name: 'beyond', opts: [['boxes', 'boxes'], ['dim', 'dim'], ['hide', 'hide']], get: function () { return GJ.archive.state().mode; }, set: function (v) { GJ.archive.setMode(['boxes', 'dim', 'hide'].indexOf(v)); } }]
    };
    (X[room] || []).forEach(function (x) { out.push(x); });
    [0, 1].forEach(function (i) { var e = edgeRing(i); if (e) out.push(e); });
    function add(r) { var s = stopsOf(r); if (s.opts.length > 1) out.push(s); }   // a ring whose stops all read the same has nothing to choose
    R.forEach(function (r) { add(r); if (r.alt && out.length < 7) add(r.alt); });
    if (!room) out.unshift({ k: 'hub', name: 'hub', opts: [['field', 'field'], ['star', 'star']], get: function () { return store.get().hub === 'star' ? 'star' : 'field'; }, set: function (v) { store.set({ hub: v }); G.dispatchEvent(new Event('resize')); } });
    if (GJ.registry) GJ.registry.rings(room || 'sky').forEach(function (r) { out.push(r); });   // dials from the registry (core/registry.js)
    if (GJ.pins) GJ.pins.rings(room || 'sky').reverse().forEach(function (p) { if (p.opts.length > 1) out.unshift(p); });   // pinned from the master tuner (core/tunehub.js): first, for quick use
    return out.slice(0, 7);
  }
  function cameraRings() {
    var C = G.GJ_CAMDIAL; if (!C) return [];
    return C.rings.map(function (r) { return { k: 'cam-' + r.k, name: r.k, opts: r.opts.map(function (o) { return [o, r.k === 'lens' ? o + '°' : o]; }), get: function () { return C.get()[r.k]; }, set: function (v) { C.set(r.k, v); } }; });
  }
  function skyRings() {
    return [
      num('atmos', 'atmosphere', [[0, 'still'], [.5, 'calm'], [1, 'living']]),
      num('density', 'stars', [[.45, 'few'], [.7, 'some'], [1, 'all']]),
      num('fog', 'fog', [[0, 'off'], [.5, 'light'], [1, 'full']]),
      { k: 'moonm', name: 'moon', opts: [['off', 'off'], ['crescent', 'crescent'], ['phase', 'tonight']], get: function () { var s = store.get(); return s.moon === false ? 'off' : s.moonMode === 'phase' ? 'phase' : 'crescent'; }, set: function (v) { store.set(v === 'off' ? { moon: false } : { moon: true, moonMode: v }); } },
      onoff('reflect'), onoff('ripples'),
      Object.assign(onoff('wxlive'), { name: 'weather' })
    ];
  }
  function appRings() {   // voice pass (Gill, 19 Nov): an app without the film-set rows in its Tune (Good Weather) has none here either
    var set = !!document.querySelector('#tune [data-t="fullsafe"]');
    return [
      { k: 'red', name: 'red mode', opts: [['off', 'off'], ['on', 'on']], get: function () { return store.get().red ? 'on' : 'off'; }, set: function (v) { store.set({ red: v === 'on' }); } },
      { k: 'tone', name: 'tone', opts: GJ.TONES.map(function (t, j) { return [String(j), t.name]; }), get: function () { return String(store.get().tone); }, set: function (v) { store.set({ tone: +v }); } },
      { k: 'fullsafe', name: 'full red mode', opts: [['off', 'off'], ['on', 'on']], get: function () { return store.get().fullSafe ? 'on' : 'off'; }, set: function (v) { store.set(v === 'on' ? { fullSafe: true, red: true } : { fullSafe: false }); } },
      { k: 'photored', name: 'photos (full)', opts: [['red', 'red'], ['true', 'true colour']], get: function () { return store.get().photoRed === false ? 'true' : 'red'; }, set: function (v) { store.set({ photoRed: v === 'red' }); } },
      { k: 'dialrest', name: 'the dial', opts: [['full', 'stays'], ['slip', 'slip'], ['tick', 'tick'], ['rest', 'rest']], get: function () { return restMode(); }, set: function (v) { store.set({ dialRest: v }); } },
      Object.assign(onoff('tilt'), { name: '3d tilt' }),
      { k: 'reduce', name: 'motion', opts: [['auto', 'auto'], ['off', 'full'], ['on', 'reduced']], get: function () { return store.get().reduce || 'auto'; }, set: function (v) { store.set({ reduce: v }); } }
    ].filter(function (r) { return set || (r.k !== 'fullsafe' && r.k !== 'photored'); });
  }
  // Beyond's own dial, in the camera cluster (briefs/BEYOND-DIAL.md): the reading, and the same knobs as the camera
  function beyondRings() {
    if (!GJ.archive || !GJ.archive.knobs) return [];
    function S(k, name, opts) { return { k: k, name: name, opts: opts.map(function (o) { return [o, o]; }), get: function () { return GJ.archive.knobs()[name === 'easing' ? 'ease' : name]; }, set: function (v) { var o = {}; o[k] = v; store.set(o); } }; }
    return [
      { k: 'byread', name: 'reading', opts: [['off', 'off'], ['red', 'red'], ['colour', 'colour'], ['light', 'light']], get: function () { return GJ.archive.beyond().read || (store.get().red ? 'red' : 'off'); }, set: function (v) { GJ.archive.choose(v); } },
      S('byDepth', 'depth', ['far', 'mid', 'close']), S('byDrift', 'drift', ['off', 'slow', 'easy']), S('byEase', 'easing', ['fold', 'cubic', 'smooth', 'push']), S('byMove', 'move', ['dolly', 'orbit'])
    ];
  }
  var PLANES = [['place', placeRings], ['camera', cameraRings], ['night', skyRings], [(GJ.APP && GJ.APP.title) || 'oz', appRings], ['beyond', beyondRings]];
  var plane = 0, RINGS = [], FOCUS = '';
  function placeName() { var r = GJ.app.room; return r ? (GJ.rooms[r].title || r) : (GJ.app.mode === 'chap' && GJ.app.chap ? GJ.app.chap.label : GJ.app.mode === 'wide' ? 'sky' : 'map'); }

  /* ---------- 3. the panel (camera-dial.js anatomy: planes that unfold out of the dial) ---------- */
  var P = document.createElement('div'); P.id = 'master-panel'; P.hidden = true; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'the dial');
  P.innerHTML = '<div class="cd-3d"><h3><em class="md-where"></em><span class="cd-now"></span></h3><nav class="md-planes"></nav>' +
    '<canvas class="cd-orb" aria-label="drag to turn, tap a star to choose"></canvas><ul class="cd-rows"></ul>' +
    '<p class="cd-hint">drag to turn · tap a star to choose · swipe down to close</p></div>';
  document.body.appendChild(P);
  // Tune → Dials → Orbit the sky (off by default): off, a drag here does not turn the constellation, and the sheet does not offer it
  function orbits() { return after() || !GJ.dialprefs || GJ.dialprefs.orbit(); }   // after: the panel always orbits; 'Orbit the sky' only moves the sky (fixes 4198aa4)
  function hints() { var o = orbits(); P.querySelector('.cd-orb').setAttribute('aria-label', o ? 'drag to turn, tap a star to choose' : 'tap a star to choose'); P.querySelector('.cd-hint').textContent = (o ? 'drag to turn · ' : '') + 'tap a star to choose · swipe down to close'; }   // voice pass (Gill, 19 Nov): no desktop keys
  hints();
  var cv = P.querySelector('.cd-orb'), g = cv.getContext('2d'), NOW = P.querySelector('.cd-now'), WHERE = P.querySelector('.md-where'), NAV = P.querySelector('.md-planes'), ROWS = P.querySelector('.cd-rows');
  // every plane in front of the plate (never behind it: a plane behind the plate can't be touched)
  function planes() { var list = [].slice.call(P.querySelectorAll('.cd-3d>*')); list.forEach(function (el, j) { el.style.setProperty('--i', String(j)); el.style.setProperty('--z', (Math.max(0, 4 - j) * 6) + 'px'); }); P.style.setProperty('--n', String(list.length)); }
  function origin() { var r = b.getBoundingClientRect(), q = P.getBoundingClientRect(); if (!r.width) return; P.style.setProperty('--ox', (r.left + r.width / 2 - q.left).toFixed(0) + 'px'); P.style.setProperty('--oy', (r.top + r.height / 2 - q.top + P.scrollTop).toFixed(0) + 'px'); }
  var VAL = {}, SEL = {};
  function load(keep) {
    RINGS = PLANES[plane][1]();
    RINGS.forEach(function (r) { var v = r.get(); if (!keep || VAL[r.k] == null) SEL[r.k] = { from: v, to: v, t0: 0 }; VAL[r.k] = v; });
    if (!RINGS.some(function (r) { return r.k === FOCUS; })) FOCUS = RINGS.length ? RINGS[Math.min(RINGS.length - 1, Math.floor(RINGS.length / 2))].k : '';
    NAV.innerHTML = PLANES.map(function (p, j) { return '<button type="button" data-p="' + j + '"' + (j === plane ? ' class="on"' : '') + '>' + (j ? p[0] : placeName()) + '</button>'; }).join('');
    ROWS.innerHTML = RINGS.slice().reverse().map(function (r) {
      return '<li class="cd-row" data-k="' + r.k + '"><b>' + r.name.toUpperCase() + '</b><span class="cd-opts">' +
        r.opts.map(function (o) { return '<button type="button" data-k="' + r.k + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</span></li>';
    }).join('');
    build(); paintRows(); planes();
  }
  function paintRows() {
    [].forEach.call(P.querySelectorAll('.cd-opts button'), function (x) { var on = VAL[x.dataset.k] === x.dataset.v; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    [].forEach.call(P.querySelectorAll('.cd-row'), function (x) { x.classList.toggle('f', x.dataset.k === FOCUS); });
    var r = RINGS.filter(function (q) { return q.k === FOCUS; })[0];
    WHERE.textContent = PLANES[plane][0] === 'place' ? placeName() : PLANES[plane][0];
    NOW.textContent = r ? r.name + ' · ' + ((r.opts.filter(function (o) { return o[0] === VAL[r.k]; })[0] || [0, ''])[1]) : '';
  }
  function choose(k, v) {
    var r = RINGS.filter(function (q) { return q.k === k; })[0]; if (!r) return;
    FOCUS = k;
    if (VAL[k] !== v) { SEL[k] = { from: VAL[k], to: v, t0: now() }; VAL[k] = v; r.set(v); GJ.haptic.tick(); }
    // a choice can change what else is on the plane (the edge swap, the arrangement): read it all again, keep the glow
    setTimeout(function () { RINGS.forEach(function (q) { var nv = q.get(); if (nv !== VAL[q.k] && q.k !== k) { SEL[q.k] = { from: VAL[q.k], to: nv, t0: now() }; VAL[q.k] = nv; } }); paintRows(); }, 60);
    paintRows(); kick();
  }
  var open = false, foldT = 0, SWALLOW = 0, POPPING = false;
  function show(on, opt) {
    var was = open; open = !!on;
    if (open && !was) {
      if (G.GJ_CAMDIAL && G.GJ_CAMDIAL.isOpen()) G.GJ_CAMDIAL.close();
      dial.hideNow(); wakeNow();
      try { if (!(history.state && history.state.gjMaster)) history.pushState(Object.assign({}, history.state || {}, { gjMaster: 1 }), ''); } catch (e) {}
    }
    if (!open && was && !(opt && opt.pop) && history.state && history.state.gjMaster) { POPPING = true; try { history.back(); } catch (e) { POPPING = false; } }
    if (!open && was) armRest(REST_AFTER);
    D.classList.toggle('md-open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); clearTimeout(foldT);
    if (open) {
      if (!was) { plane = 0; load(false); }
      hints(); P.classList.remove('cd-in', 'cd-folding'); P.hidden = false; resize(); paintRows(); origin(); void P.offsetWidth; T.x = T.y = T.vx = T.vy = T.tx = T.ty = 0; lastIn = now(); kick();
      requestAnimationFrame(function () { if (open) P.classList.add('cd-in'); });
    } else if (was && !P.hidden) {
      P.classList.add('cd-folding'); P.classList.remove('cd-in'); drag = null;
      foldT = setTimeout(function () { if (!open) { P.hidden = true; P.classList.remove('cd-folding'); } }, rmOn() ? 240 : 640);
    } else P.hidden = true;
  }
  G.addEventListener('popstate', function (e) {
    var mine = POPPING || (open && !(history.state && history.state.gjMaster));
    if (open && !(history.state && history.state.gjMaster)) show(false, { pop: 1 });
    POPPING = false; if (mine && e.stopImmediatePropagation) e.stopImmediatePropagation();
  }, true);
  G.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); show(false); return; }
    var ix = RINGS.findIndex(function (r) { return r.k === FOCUS; });
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); e.stopImmediatePropagation(); FOCUS = RINGS[clamp(ix + (e.key === 'ArrowUp' ? 1 : -1), 0, RINGS.length - 1)].k; paintRows(); kick(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); var r = RINGS[ix], j = r.opts.findIndex(function (o) { return o[0] === VAL[r.k]; }); choose(r.k, r.opts[clamp(j + (e.key === 'ArrowRight' ? 1 : -1), 0, r.opts.length - 1)][0]); }
    else if (e.key === 'Tab' && !e.shiftKey && e.target === document.body) { e.preventDefault(); setPlane((plane + 1) % PLANES.length); }
  }, true);
  document.addEventListener('pointerdown', function (e) { if (open && !e.target.closest('#master-panel,#master')) { SWALLOW = Date.now() + 700; show(false); } }, true);
  G.addEventListener('pointerup', function () { if (SWALLOW) setTimeout(function () { SWALLOW = 0; }, 380); }, true);
  document.addEventListener('click', function (e) { if (SWALLOW && Date.now() < SWALLOW && !e.target.closest('#master-panel,#master')) { SWALLOW = 0; e.stopPropagation(); e.preventDefault(); } }, true);
  function setPlane(j) { plane = j; P.classList.remove('cd-in'); void P.offsetWidth; load(false); resize(); P.classList.add('cd-in'); T.tx = T.ty = 0; kick(); GJ.haptic.tick(); }
  P.addEventListener('click', function (e) {
    var n = e.target.closest('.md-planes button'); if (n) { setPlane(+n.dataset.p); return; }
    var x = e.target.closest('.cd-opts button'); if (!x) return; choose(x.dataset.k, x.dataset.v);
  });
  G.addEventListener('pointermove', function (e) {
    if (!open || drag || e.pointerType !== 'mouse') return;
    P.style.setProperty('--px', clamp((e.clientX / innerWidth - .5) * 2, -1, 1).toFixed(3)); P.style.setProperty('--py', clamp((e.clientY / innerHeight - .5) * 2, -1, 1).toFixed(3));
  }, { passive: true });

  /* ---------- 4. the constellation: rings of stars, orbit by drag, spring back flat (camera-dial.js, generalised) ---------- */
  var W = 0, H = 0, DPR = 1, STARS = [], FIELD = [];
  function resize() { var w = cv.clientWidth || 264; DPR = Math.min(devicePixelRatio || 1, 2); W = w; H = w; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); build(); }
  function rnd(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  var MIDS = [-30, 150, -100, 30, 200, -60, 100];
  function build() {
    STARS = []; var N = RINGS.length;
    RINGS.forEach(function (r, ri) {
      var rad = N > 1 ? .30 + ri * (.66 / (N - 1)) : .6, zl = N > 1 ? (ri - (N - 1) / 2) / (N - 1) : 0, n = r.opts.length, span = Math.min(2.6, .62 * n), mid = MIDS[ri % 7] * Math.PI / 180, a0 = mid - span / 2;
      r.rad = rad; r.zl = zl; r.a0 = a0; r.span = span;
      r.opts.forEach(function (o, j) { var a = n === 1 ? a0 : a0 + span * j / (n - 1); STARS.push({ ri: ri, k: r.k, v: o[0], lab: o[1], a: a, x: Math.cos(a) * rad, y: Math.sin(a) * rad, zl: zl }); });
    });
    if (!FIELD.length) for (var i = 0; i < 140; i++) { var a = rnd(i) * 6.283, rr = .2 + Math.sqrt(rnd(i + 300)) * 1.15; FIELD.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, z: -.9 - rnd(i + 600) * 1.4, b: .15 + rnd(i + 900) * .45, ph: rnd(i + 50) * 6.28 }); }
  }
  var T = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }, drag = null, lastIn = now(), PT = new Map();
  var YAW = 1.15, PIT = .8;
  function yawNow() { return YAW * Math.tanh((T.x / 70) * 1.05 / YAW); }
  function pitNow() { return -PIT * Math.tanh((T.y / 70) * .75 / PIT); }
  cv.addEventListener('pointerdown', function (e) {
    if (!open) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} PT.set(e.pointerId, { x: e.clientX, y: e.clientY, t0: now() }); lastIn = now();
    if (PT.size === 1) drag = { id: e.pointerId, moved: 0 }; else { drag = null; T.tx = T.ty = 0; } cv.classList.add('grab'); P.classList.add('cd-held'); kick();
  });
  cv.addEventListener('pointermove', function (e) {
    var p = PT.get(e.pointerId); if (!p) return; var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; lastIn = now();
    if (drag && drag.id === e.pointerId) { drag.moved += Math.abs(dx) + Math.abs(dy); if (drag.moved < 6 || !orbits()) return; T.tx = clamp(T.tx + dx * .9, -140, 140); T.ty = clamp(T.ty + dy * .9, -120, 120); kick(); }
  });
  function cup(e) {
    var p = PT.get(e.pointerId); if (!p) return; PT.delete(e.pointerId);
    if (drag && drag.id === e.pointerId) { if (drag.moved < 10 && now() - p.t0 < 350) tap(e.clientX, e.clientY); drag = null; }
    if (!PT.size) { T.tx = 0; T.ty = 0; cv.classList.remove('grab'); P.classList.remove('cd-held'); } lastIn = now(); kick();
  }
  cv.addEventListener('pointerup', cup); cv.addEventListener('pointercancel', cup);
  var SCR = [];
  function tap(x, y) {
    var r = cv.getBoundingClientRect(), px = x - r.left, py = y - r.top, best = null, bd = 1e9, lim = G.matchMedia('(pointer:coarse)').matches ? 30 : 22;
    SCR.forEach(function (s) { var d = Math.hypot(s.sx - px, s.sy - py); if (d < bd) { bd = d; best = s; } });
    if (best && bd < lim) choose(best.k, best.v);
  }
  function project(x, y, z, yaw, pit, o) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
    var x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    var fov = ((G.GJ_CAMDIAL && G.GJ_CAMDIAL.params().fov) || 60) * Math.PI / 180, d = 1 / Math.tan(fov / 2) * 1.55, k = d / (d - z2), R = W * .42;
    o[0] = W / 2 + x1 * R * k; o[1] = H / 2 + y1 * R * k; o[2] = k; o[3] = z2; return o;
  }
  var GLOW = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var q = c.getContext('2d'), gr = q.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(236,233,226,.9)'); gr.addColorStop(.25, 'rgba(236,233,226,.32)'); gr.addColorStop(1, 'rgba(236,233,226,0)'); q.fillStyle = gr; q.fillRect(0, 0, 64, 64); return c; })();
  function ease(u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function ink(a) { var red = store.get().red; return red ? 'rgba(255,68,87,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function draw(t) {
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
    var yaw = yawNow(), pit = pitNow(), turn = Math.min(1, Math.abs(yaw) / .5 + Math.abs(pit) / .4), sep = .06 + .94 * sstep(0, 1, turn);
    var o = [0, 0, 0, 0], tt = t / 1000, red = store.get().red;
    FIELD.forEach(function (f) { project(f.x, f.y, f.z * sep, yaw, pit, o); var tw = .75 + .25 * Math.sin(tt * 1.3 + f.ph); g.globalAlpha = f.b * tw * (.55 + .45 * sep); g.fillStyle = red ? '#7a2a30' : '#bdbab3'; g.fillRect(o[0] - .6, o[1] - .6, 1.2, 1.2); });
    g.globalAlpha = 1;
    RINGS.forEach(function (r) {
      var z = r.zl * .9 * sep; g.beginPath();
      for (var a = 0; a <= 64; a++) { var th = a / 64 * 6.2832; project(Math.cos(th) * r.rad, Math.sin(th) * r.rad, z, yaw, pit, o); if (a) g.lineTo(o[0], o[1]); else g.moveTo(o[0], o[1]); }
      g.strokeStyle = ink(r.k === FOCUS ? .34 : .14); g.lineWidth = r.k === FOCUS ? 1 : .8; g.stroke();
      g.beginPath(); for (a = 0; a <= 24; a++) { th = r.a0 + r.span * a / 24; project(Math.cos(th) * r.rad, Math.sin(th) * r.rad, z, yaw, pit, o); if (a) g.lineTo(o[0], o[1]); else g.moveTo(o[0], o[1]); }
      g.strokeStyle = ink(r.k === FOCUS ? .6 : .3); g.stroke();
    });
    var fig = []; project(0, 0, -.5 * .9 * sep, yaw, pit, o); fig.push(o.slice());
    SCR = []; var tn = now();
    STARS.forEach(function (s) {
      var z = s.zl * .9 * sep; project(s.x, s.y, z, yaw, pit, o);
      var Sx = SEL[s.k] || { from: VAL[s.k], to: VAL[s.k], t0: 0 }, u = clamp((tn - Sx.t0) / 280, 0, 1), e = ease(u), on = VAL[s.k] === s.v;
      var lit = on ? (Sx.to === s.v ? e : 1) : (Sx.from === s.v && Sx.to !== s.v ? 1 - e : 0);
      var k = o[2], rad = (1.6 + lit * 1.6) * k, foc = s.k === FOCUS;
      g.globalAlpha = 1; g.fillStyle = ink(((.38 + .62 * lit) * (foc ? 1 : .85)).toFixed(3)); g.beginPath(); g.arc(o[0], o[1], rad, 0, 6.2832); g.fill();
      if (lit > .02 && !red) { g.globalAlpha = .55 * lit; var gs = 22 * k; g.drawImage(GLOW, o[0] - gs / 2, o[1] - gs / 2, gs, gs); g.globalAlpha = 1; }
      if (on) fig[s.ri + 1] = o.slice();
      if (foc || turn > .35) {
        g.font = '300 ' + (foc ? 11 : 9.5).toFixed(1) + 'px Poppins, sans-serif'; g.fillStyle = ink(foc ? (.5 + .5 * lit).toFixed(3) : .28);
        var lx = Math.cos(s.a), ly = Math.sin(s.a); g.textAlign = lx > .25 ? 'left' : lx < -.25 ? 'right' : 'center'; g.textBaseline = ly > .25 ? 'top' : ly < -.25 ? 'bottom' : 'middle'; g.fillText(s.lab, o[0] + lx * 8, o[1] + ly * 8);
      }
      SCR.push({ sx: o[0], sy: o[1], k: s.k, v: s.v });
    });
    g.strokeStyle = ink(.42); g.lineWidth = .8; g.beginPath(); fig.forEach(function (p, j) { if (!p) return; if (j) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke();
    project(0, 0, -.5 * .9 * sep, yaw, pit, o); g.fillStyle = ink(.7); g.beginPath(); g.arc(o[0], o[1], 2.2, 0, 6.2832); g.fill();
    g.strokeStyle = ink(.25); g.beginPath(); g.arc(o[0], o[1], 9 * o[2], 0, 6.2832); g.stroke();
    var fr = RINGS.filter(function (r) { return r.k === FOCUS; })[0];
    if (fr) { g.fillStyle = ink(.55); g.font = '400 9px "Julius Sans One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(fr.name.toUpperCase(), o[0], o[1] + 12 * o[2]); }
    g.globalAlpha = 1;
  }
  var raf = 0, last = now();
  function kick() { if (!raf) { last = now(); raf = requestAnimationFrame(frame); } }
  function frame(t) {
    raf = 0; var dt = Math.min(.05, (t - last) / 1000); last = t;
    var wv = 9; ['x', 'y'].forEach(function (a) { var tg = a === 'x' ? T.tx : T.ty, v = a === 'x' ? 'vx' : 'vy', e = T[a] - tg, kk = Math.exp(-wv * dt), c = T[v] + wv * e; T[a] = tg + (e + c * dt) * kk; T[v] = (T[v] - wv * c * dt) * kk; });
    if (!P.hidden) draw(t);
    var moving = Math.abs(T.x - T.tx) > .05 || Math.abs(T.y - T.ty) > .05 || Math.abs(T.vx) > .05 || Math.abs(T.vy) > .05 || drag || RINGS.some(function (r) { return SEL[r.k] && now() - SEL[r.k].t0 < 320; }) || now() - lastIn < 900;
    if (!P.hidden && (moving || open && now() - lastIn < 4000)) raf = requestAnimationFrame(frame);
  }
  G.addEventListener('resize', function () { if (!P.hidden) { resize(); origin(); kick(); } });

  G.GJ_MASTER = {
    reload: function () { load(true); if (open) { resize(); kick(); } },
    open: function (j) { show(true); if (j != null) setPlane(j); }, close: function () { show(false); }, toggle: function () { show(!open); }, isOpen: function () { return open; }, popping: function () { return POPPING; },
    plane: function () { return PLANES[plane][0]; }, setPlane: setPlane, choose: choose, rings: function () { return RINGS.map(function (r) { return { k: r.k, name: r.name, v: VAL[r.k], opts: r.opts.map(function (o) { return o[0]; }) }; }); },
    layer: function () { return act; },
    _stars: function () { var r = cv.getBoundingClientRect(); return SCR.map(function (s) { return { k: s.k, v: s.v, x: r.left + s.sx, y: r.top + s.sy }; }); }
  };
  // Tune → developer → The dial → "A tap opens every choice" (the parked tap; off = a tap shows the value)
  (function () { var t = document.getElementById('tune'); if (!t) return; var on = function () { return store.get().dialTapSheet === true; };
    var paintRow = function () { var bb = t.querySelector('[data-t="dialtapsheet"] b'); if (bb) bb.textContent = on() ? 'on' : 'off'; }; paintRow();
    t.addEventListener('click', function (e) { var x = e.target.closest ? e.target.closest('button[data-t="dialtapsheet"]') : null; if (x) store.set({ dialTapSheet: !on() }); });
    store.on(function (s2, prev) { if (!prev || s2.dialTapSheet !== prev.dialTapSheet) paintRow(); }); })();
  G.GJ_MASTER.tapped = tapped;
})(window);
