/* tools-02 · the Moon dial, opened out — the light and the environment (Gill, 19 Nov: "I wanted it to be 3d like the reference
   and the functionality should be more focused. Each dial needs to be intuitive" · its job: "Light, atmosphere, environment,
   other related? Hold red mode already brings up its settings"). Built on the 3D camera dial (camera-dial.js / master.js):
   one ring per setting, each choice a star on its ring, the chosen stars joined by a hairline figure; turned, the rings slide
   apart in depth, and it springs back.
     hold the moon ........ it opens under the same finger; slide onto a star and let go: chosen, and it folds back
     a sliding ring ....... (atmosphere, ambience, stars) its star rides the ring: keep sliding along it to set it
     tap the moon ......... it opens and stays: tap a star, slide a ring, or drag the space between to turn it in 3D
     a touch outside, the Mark, or a few quiet seconds: it folds back into the moon
   Red mode is not here: holding the red-mode dot has its own colour and lightness. While a ring is sliding, the plate and the
   other rings step back so the sky it changes can be seen. In red mode it keeps true colour, as the constellations do. Never
   the dot's mint. Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, clamp = GJ.clamp, html = document.documentElement;
  function S() { return store.get(); }
  function ring(k, name, opts, get, set, slide) { return { k: k, name: name, opts: opts, get: get, set: set, slide: slide }; }
  function atmosSet(v) { v = Math.round(v * 100) / 100; if (GJ.skyRings && GJ.skyRings.atmos) GJ.skyRings.atmos.set(v); else store.set({ atmos: v }); }
  function ambSet(v) { v = Math.round(v * 100) / 100; if (GJ.skyRings && GJ.skyRings.ambience) GJ.skyRings.ambience.set(v); else store.set({ ambience: v }); }
  function denSet(v) { v = Math.round((.3 + v * .7) * 100) / 100; if (GJ.skyRings && GJ.skyRings.density) GJ.skyRings.density.set(v); else store.set({ density: v }); }
  var RINGS = [   // inner → outer
    ring('atmos', 'atmosphere', [['0', 'still'], ['.5', 'soft'], ['1', 'full']], function () { var a = S().atmos; return a == null ? 1 : a; }, atmosSet, true),
    ring('ambience', 'ambience', [['0', 'cool'], ['.5', 'even'], ['1', 'warm']], function () { var a = S().ambience; return a == null ? .5 : a; }, ambSet, true),
    ring('stars', 'stars', [['0', 'few'], ['.5', 'some'], ['1', 'all']], function () { var d = S().density; return clamp(((d == null ? 1 : d) - .3) / .7, 0, 1); }, denSet, true),
    ring('fog', 'fog', [['off', 'off'], ['light', 'light'], ['full', 'full']], function () { var f = S().fog; f = f == null ? 1 : f; return f >= 1 ? 'full' : f > 0 ? 'light' : 'off'; }, function (v) { store.set({ fog: v === 'full' ? 1 : v === 'light' ? .5 : 0 }); }),
    ring('water', 'water', [['off', 'off'], ['still', 'still'], ['ripples', 'ripples']], function () { var s = S(); return s.reflect === false ? 'off' : s.ripples === false ? 'still' : 'ripples'; }, function (v) { store.set({ reflect: v !== 'off', ripples: v === 'ripples' }); }),
    ring('moon', 'moon', [['off', 'off'], ['crescent', 'crescent'], ['phase', "tonight's"]], function () { var s = S(); return s.moon === false ? 'off' : (s.moonMode || 'crescent'); }, function (v) { store.set(v === 'off' ? { moon: false } : { moon: true, moonMode: v }); }),
    ring('weather', 'weather', [['live', 'live'], ['clear', 'clear']], function () { return S().wxlive === false ? 'clear' : 'live'; }, function (v) { store.set({ wxlive: v === 'live' }); })
  ];
  var MIDS = [-90, -40, -140, 10, 170, 60, 120];   // where each ring's arc of choices sits, so their words do not stack
  var STARS = [], N = RINGS.length;
  RINGS.forEach(function (r, ri) {
    var rad = .26 + ri * (.70 / (N - 1)), zl = (ri - (N - 1) / 2) / (N - 1), n = r.opts.length, span = r.slide ? 1.9 : Math.min(2.2, .62 * n), mid = MIDS[ri] * Math.PI / 180;
    r.rad = rad; r.zl = zl; r.a0 = mid - span / 2; r.span = span;
    r.opts.forEach(function (o, j) { var a = r.a0 + span * (n === 1 ? 0 : j / (n - 1)); STARS.push({ ri: ri, k: r.k, v: o[0], lab: o[1], a: a }); });
  });
  var FIELD = []; (function () { var sd = 11; function rnd() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; } for (var i = 0; i < 120; i++) { var a = rnd() * 6.283, rr = .2 + Math.sqrt(rnd()) * 1.1; FIELD.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, z: -.9 - rnd() * 1.4, b: .12 + rnd() * .4, ph: rnd() * 6.28 }); } })();

  var host = document.createElement('div'); host.id = 'mo'; host.setAttribute('aria-hidden', 'true');
  host.innerHTML = '<canvas></canvas><div class="mo-hit"></div>'; document.body.appendChild(host);
  var cv = host.querySelector('canvas'), g = cv.getContext('2d'), hit = host.querySelector('.mo-hit');
  var W = 0, H = 0, DPR = 1, C = { x: 0, y: 0 }, R = 150;
  var T = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }, REST_YAW = -.32, REST_PIT = .78;   // at rest it already sits in 3D, as the reference does
  var st = { open: false, mode: 'open', hover: null, slide: null, drag: null, press: null, fade: 0, idleT: 0, foldT: 0, flash: null, lastIn: 0 };
  var SCR = [], raf = 0, last = 0;
  function size() { DPR = Math.min(2, G.devicePixelRatio || 1); W = G.innerWidth; H = G.innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
  function yawNow() { return REST_YAW + 1.1 * Math.tanh(T.x / 80); }
  function pitNow() { return clamp(REST_PIT - .9 * Math.tanh(T.y / 80), .05, 1.35); }
  function spreadNow() { if (flat()) return 0; var turn = Math.min(1, Math.abs(T.x) / 50 + Math.abs(T.y) / 45); return .35 + .65 * turn; }   // the rings stand a little apart at rest, further when turned
  /* safelight 3 alt (Gill, 19 Nov: "the dial that emanates from it is 3D … rendered by the same engine that powers the oz
     viewer"): the rings are orbits laid flat in the oz viewer's own world (core/oz3d.js) and seen by its orbit camera;
     turning the dial walks that camera round (azimuth) and up (elevation), so the rings turn in depth. Reduce Motion: flat,
     face on, the rings not apart and not turning. */
  var CAMO = { dist: 2.7, eye: 0, elMin: 0, elMax: 90, minZ: .05 }, V = null;
  function flat() { return !!(GJ.reduced && GJ.reduced()) || !!(GJ.dialprefs && GJ.dialprefs.look('crescent') === 'flat'); }   // Reduce Motion, or Tune → Dials → The crescent · flat
  function view() { var fl = flat(); V = GJ.oz3d.camera({ az: fl ? 0 : yawNow() * 180 / Math.PI, el: 90 - (fl ? 0 : pitNow()) * 180 / Math.PI, zoom: 1 }, CAMO); return V; }
  function project(x, y, z, o) {   // the dial's own axes (x right, y down, z toward you) → the engine's world (x, up, z)
    var q = GJ.oz3d.proj(V || view(), [x, z, y], C.x, C.y, R); o[0] = q[0]; o[1] = q[1]; o[2] = q[2]; return o;
  }
  function onRing(r, th, o) { return project(Math.cos(th) * r.rad, Math.sin(th) * r.rad, r.zl * .9 * spreadNow(), o); }
  function red() { return !!S().red; }
  function ink(a) { return red() ? 'rgba(218,176,172,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function lineC(a) { return red() ? 'rgba(150,138,120,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function onC(a) { return red() ? 'rgba(236,100,108,' + a + ')' : 'rgba(250,248,242,' + a + ')'; }
  function hiC(a) { return red() ? 'rgba(242,222,216,' + a + ')' : 'rgba(250,248,242,' + a + ')'; }   // a ring in hand: pale, to read against a red sky
  function val(r) { try { return r.get(); } catch (e) { return null; } }
  function knobA(r) { return r.a0 + r.span * clamp(+val(r), 0, 1); }   // a sliding ring: its star rides the ring at the value
  function chosen(s) { var r = RINGS[s.ri]; return !r.slide && String(val(r)) === s.v; }

  function draw(ts) {
    var o = [0, 0, 0], f = st.fade, tt = ts / 1000, sl = st.slide, back = sl ? .35 : 1;
    view(); GJ.oz3d.use('moon');
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
    var PR = R * 1.32, pc = red() ? '22,3,5' : '5,8,16', pg = g.createRadialGradient(C.x, C.y, 0, C.x, C.y, PR);   // the plate: only round the dial
    pg.addColorStop(0, 'rgba(' + pc + ',' + (.93 * f * back) + ')'); pg.addColorStop(.75, 'rgba(' + pc + ',' + (.85 * f * back) + ')'); pg.addColorStop(1, 'rgba(' + pc + ',0)');
    g.fillStyle = pg; g.beginPath(); g.arc(C.x, C.y, PR, 0, 6.283); g.fill();
    var sep = spreadNow();
    if (!sl) FIELD.forEach(function (q) { project(q.x, q.y, q.z * sep, o); g.globalAlpha = q.b * (.75 + .25 * Math.sin(tt * 1.3 + q.ph)) * f; g.fillStyle = red() ? '#9a6a66' : '#bdbab3'; g.fillRect(o[0] - .6, o[1] - .6, 1.2, 1.2); });
    g.globalAlpha = 1;
    var focus = sl ? sl.k : st.hover ? st.hover.k : null;
    RINGS.forEach(function (r) {   // each ring whole and faint; its arc of choices brighter
      var mine = r.k === focus, dim = sl && !mine ? .15 : 1;
      g.beginPath(); for (var a = 0; a <= 72; a++) { onRing(r, a / 72 * 6.2832, o); a ? g.lineTo(o[0], o[1]) : g.moveTo(o[0], o[1]); }
      g.strokeStyle = lineC((mine ? .34 : .14) * f * dim); g.lineWidth = mine ? 1 : .8; g.stroke();
      g.beginPath(); for (a = 0; a <= 24; a++) { onRing(r, r.a0 + r.span * a / 24, o); a ? g.lineTo(o[0], o[1]) : g.moveTo(o[0], o[1]); }
      g.strokeStyle = lineC((mine ? .7 : .34) * f * dim); g.lineWidth = r.slide ? (mine ? 2.2 : 1.4) : 1; g.stroke();
      if (r.slide) {   // a sliding ring: filled to its value
        var ka = knobA(r); g.beginPath(); for (a = 0; a <= 24; a++) { onRing(r, r.a0 + (ka - r.a0) * a / 24, o); a ? g.lineTo(o[0], o[1]) : g.moveTo(o[0], o[1]); }
        g.strokeStyle = (mine ? hiC : onC)((mine ? .95 : .5) * f * dim); g.lineWidth = mine ? 2.8 : 1.6; g.lineCap = 'round'; g.stroke(); g.lineCap = 'butt';
      }
    });
    var fig = []; project(0, 0, -.5 * .9 * sep, o); fig.push(o.slice());
    SCR = [];
    RINGS.forEach(function (r, ri) {   // the stars: a choosing ring's choices; a sliding ring's knob, with its words at the ticks
      var dim = sl && sl.k !== r.k ? .15 : 1, mine = r.k === focus;
      if (r.slide) {
        onRing(r, knobA(r), o); var k = o[2]; fig[ri + 1] = o.slice();
        if (dim > .5) GJ.oz3d.glow(g, red() ? [236, 100, 108] : [236, 233, 226], .486, o[0], o[1], 6.5 * k, .6 * f);   // the oz viewer's star glow
        g.fillStyle = (mine ? hiC : onC)(f * dim); g.beginPath(); g.arc(o[0], o[1], (mine ? 5 : 3.2) * k, 0, 6.283); g.fill();
        SCR.push({ x: o[0], y: o[1], k: r.k, v: null, knob: true });
      }
      STARS.forEach(function (s) {
        if (s.ri !== ri) return; onRing(r, s.a, o); var k = o[2], on = chosen(s), hv = st.hover && st.hover.k === s.k && st.hover.v === s.v, fl = st.flash && st.flash.k === s.k && st.flash.v === s.v ? clamp(1 - (ts - st.flash.t) / 500, 0, 1) : 0;
        if (!r.slide) {
          if (on) fig[ri + 1] = o.slice();
          var lit = on ? 1 : hv ? .8 : 0, rad = (1.6 + lit * 1.8 + fl * 2.5) * k;
          if ((lit || fl) && dim > .5) GJ.oz3d.glow(g, on && red() ? [236, 100, 108] : [236, 233, 226], .486, o[0], o[1], 6 * k, (.55 * lit + .5 * fl) * f);
          g.fillStyle = on ? onC(f * dim) : ink((.42 + .5 * lit) * f * dim); g.beginPath(); g.arc(o[0], o[1], rad, 0, 6.283); g.fill();
          SCR.push({ x: o[0], y: o[1], k: s.k, v: s.v });
        } else { g.fillStyle = ink(.45 * f * dim); g.beginPath(); g.arc(o[0], o[1], 1.3 * k, 0, 6.283); g.fill(); }   // a tick
        var turned = spreadNow() > .6;
        if (dim > .5 && (mine || on || turned)) {   // the words: what is chosen, and the ring in hand in full; turned, every word, quietly
          var lx = Math.cos(s.a), ly = Math.sin(s.a), big = mine;
          g.font = '300 ' + (big ? 11.5 : 9.5) + 'px Poppins, sans-serif'; g.fillStyle = on ? onC((big ? 1 : .8) * f) : ink((big ? .85 : .3) * f);
          g.textAlign = lx > .3 ? 'left' : lx < -.3 ? 'right' : 'center'; g.textBaseline = ly > .3 ? 'top' : ly < -.3 ? 'bottom' : 'middle';
          g.fillText(s.lab, o[0] + lx * 8, o[1] + ly * 8);
        }
      });
    });
    if (!sl) { g.strokeStyle = lineC(.5 * f); g.lineWidth = .8; g.beginPath(); fig.forEach(function (p, j) { if (!p) return; j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); }
    project(0, 0, -.5 * .9 * sep, o);   // the moon at the middle, the ring in hand named under it
    g.fillStyle = red() ? 'rgba(176,42,58,' + f + ')' : 'rgba(242,239,232,' + f + ')'; g.beginPath(); g.arc(o[0], o[1], 7 * o[2], 0, 6.283); g.fill();
    var fr = focus ? RINGS.filter(function (r) { return r.k === focus; })[0] : null;
    g.textAlign = 'center'; g.textBaseline = 'top'; g.font = '400 9px "Julius Sans One", sans-serif'; try { g.letterSpacing = '2px'; } catch (e) {}
    g.fillStyle = ink(.7 * f); g.fillText((fr ? fr.name : 'light').toUpperCase(), o[0], o[1] + 13); try { g.letterSpacing = '0px'; } catch (e) {}
    if (fr) { var v = val(fr), txt = fr.slide ? Math.round(clamp(+v, 0, 1) * 100) + '%' : (fr.opts.filter(function (q) { return q[0] === String(v); })[0] || ['', ''])[1]; g.font = '300 13px Poppins, sans-serif'; g.fillStyle = onC(.95 * f); g.fillText(txt, o[0], o[1] + 26); }
    if (host.classList.contains('stepback') !== !!sl && GJ.dialkit) GJ.dialkit.turn('moon', !!sl);   // every dial alike: one 'turning' for all
    host.classList.toggle('stepback', !!sl);
  }
  function frame(ts) {
    raf = 0; var dt = Math.min(.05, last ? (ts - last) / 1000 : .016); last = ts;
    st.fade = clamp(st.fade + (st.open ? dt / .22 : -dt / .2), 0, 1);
    if (st.mode === 'carry') { var dk = Math.exp(-5 * dt); T.tx *= dk; T.ty *= dk; } else if (!st.drag) { T.tx = 0; T.ty = 0; }
    var wv = 9; ['x', 'y'].forEach(function (a) { var tg = a === 'x' ? T.tx : T.ty, v = a === 'x' ? 'vx' : 'vy', e = T[a] - tg, kk = Math.exp(-wv * dt), c = T[v] + wv * e; T[a] = tg + (e + c * dt) * kk; T[v] = (T[v] - wv * c * dt) * kk; });   // the constellation's spring back
    if (st.open || st.fade > 0) { draw(ts); raf = requestAnimationFrame(frame); } else g.clearRect(0, 0, cv.width, cv.height);
  }
  function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }

  function nearest(x, y) {   // the star nearest the finger: a choice, or a sliding ring's knob
    var best = null, bd = 30; SCR.forEach(function (s) { var d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = s; } }); return best;
  }
  function ringAt(x, y) {   // which sliding ring the finger is on, and where along it
    var o = [0, 0, 0], best = null, bd = 22;
    RINGS.forEach(function (r) { if (!r.slide) return; for (var a = 0; a <= 40; a++) { var th = r.a0 + r.span * a / 40; onRing(r, th, o); var d = Math.hypot(o[0] - x, o[1] - y); if (d < bd) { bd = d; best = { r: r, u: a / 40 }; } } });
    return best;
  }
  function along(r, x, y) {   // the finger's place along a sliding ring, 0..1
    var o = [0, 0, 0], bu = 0, bd = 1e9; for (var a = 0; a <= 60; a++) { onRing(r, r.a0 + r.span * a / 60, o); var d = Math.hypot(o[0] - x, o[1] - y); if (d < bd) { bd = d; bu = a / 60; } } return bu;
  }
  // every dial alike (dialkit, review B1): each choice snaps visibly; a double-tap on a ring puts it back to its default
  var DEF = { atmos: '1', ambience: '.5', stars: '1', fog: 'full', water: 'ripples', moon: 'crescent', weather: 'live' }, lastTap = null;
  if (GJ.dialkit) GJ.dialkit.attach('rings', { el: host, ownRest: true, anchor: function () { var r = host.getBoundingClientRect(); return { centre: true, x: r.left + r.width / 2, y: Math.max(70, r.top + 40) }; } });
  function choose(k, v) { var r = RINGS.filter(function (q) { return q.k === k; })[0]; if (!r) return; r.set(v); if (GJ.dialkit) GJ.dialkit.snap('rings'); st.flash = { k: k, v: v, t: performance.now() }; if (GJ.haptic && !(GJ.moon && GJ.moon.quiet && GJ.moon.quiet())) GJ.haptic.commit(); kick(); }
  function later(ms) { clearTimeout(st.idleT); st.idleT = setTimeout(close, ms || st.rest || (GJ.reduced() ? 12000 : 7000)); }
  function hover(s) { var same = st.hover && s && st.hover.k === s.k && st.hover.v === s.v; if (same || (!s && !st.hover)) return; st.hover = s ? { k: s.k, v: s.v } : null; if (s && GJ.haptic) GJ.haptic.tick(); kick(); }
  function grab(k) { st.slide = { r: RINGS.filter(function (q) { return q.k === k; })[0] }; hover(null); if (GJ.haptic && !(GJ.moon && GJ.moon.quiet && GJ.moon.quiet())) GJ.haptic.tick(); kick(); }
  function track(x, y) {   // one finger, moving: on a sliding ring it slides; elsewhere it points at the nearest choice
    if (st.slide) { var r = st.slide.r; r.set(along(r, x, y)); kick(); return; }
    var s = nearest(x, y);
    if (s && s.knob) {   // on a sliding ring's star: a held finger that rests there a moment takes it (passing over does not); a touch takes it at once
      if (st.mode !== 'held') { grab(s.k); return; }
      if (!st.knobT || st.knobK !== s.k) { clearTimeout(st.knobT); st.knobK = s.k; st.knobT = setTimeout(function () { st.knobT = 0; if (st.open && st.mode === 'held' && st.knobK === s.k && !st.slide) grab(s.k); }, 220); }
      hover(null); return;
    }
    clearTimeout(st.knobT); st.knobT = 0; st.knobK = null;
    var rg = !s && st.mode !== 'held' && ringAt(x, y); if (rg) { st.slide = { r: rg.r }; rg.r.set(rg.u); hover(null); kick(); return; }   // a touch on a sliding ring's track: straight to that place
    hover(s && !s.knob ? s : null);
  }

  function open(x, y, held) {
    size(); R = clamp(Math.min(W * .4, H * .26), 120, 175);
    C.x = clamp(x, R * 1.05 + 18, W - R * 1.05 - 18); C.y = clamp(y, R * .9 + 70, H - R * .9 - 50);
    st.open = true; st.mode = held === 'carry' ? 'carry' : held ? 'held' : 'open'; st.rest = 0; st.cv = { x: x, y: y }; st.hover = null; st.slide = null; st.drag = null; st.press = null; clearTimeout(st.foldT); T.x = T.y = T.vx = T.vy = 0;
    var hr = R * 1.25; hit.style.left = (C.x - hr) + 'px'; hit.style.top = (C.y - hr) + 'px'; hit.style.width = hit.style.height = 2 * hr + 'px';
    html.classList.add('mooning'); host.setAttribute('aria-hidden', 'false'); if (GJ.haptic && !(GJ.moon && GJ.moon.quiet && GJ.moon.quiet())) GJ.haptic.commit(); kick(); if (!held) later();
  }
  function close() { if (!st.open) return; clearTimeout(st.knobT); st.knobT = 0; clearTimeout(st.idleT); clearTimeout(st.foldT); st.open = false; st.slide = null; st.hover = null; st.drag = null; st.press = null; html.classList.remove('mooning'); host.setAttribute('aria-hidden', 'true'); kick(); if (GJ.moon && GJ.moon.closed) GJ.moon.closed(); }
  function foldSoon() { clearTimeout(st.idleT); clearTimeout(st.foldT); st.foldT = setTimeout(close, 900); }   // chosen: a moment to see it, then back into the moon
  /* safelight 3 alt (Gill, 19 Nov): hold the crescent and it is the Moon dial — the moon moves freely under the finger and
     the 3D dial comes with it, leaning in depth with the motion and settling when it stops. Let go: it stays where it was
     put, open for the shared "rests after" time (dialkit) to tap a star, slide a ring or double-tap a ring for its default,
     then it folds back into the crescent or the dot. */
  function place(x, y) {
    C.x = clamp(x, R * 1.05 + 18, W - R * 1.05 - 18); C.y = clamp(y, R * .9 + 70, H - R * .9 - 50);
    var hr = R * 1.25; hit.style.left = (C.x - hr) + 'px'; hit.style.top = (C.y - hr) + 'px';
  }
  function carry(x, y) {
    if (!st.open || st.mode !== 'carry') return; var p = st.cv || { x: x, y: y }; st.cv = { x: x, y: y };
    if (!flat()) { T.tx = clamp(T.tx + (x - p.x) * 2.2, -140, 140); T.ty = clamp(T.ty + (y - p.y) * 2.2, -120, 120); }
    place(x, y); kick();
  }
  function release(x, y) {
    if (!st.open || st.mode !== 'carry') return; st.mode = 'open'; if (x != null) place(x, y);
    st.rest = GJ.dialkit && GJ.dialkit.delay ? (GJ.dialkit.delay() || 0) : 0; if (!st.rest) st.rest = 7000;   // "rests after: never" keeps the long wait
    later(); kick();
  }
  // the held finger, forwarded from the moon
  function heldMove(x, y) { if (st.open && st.mode === 'held') track(x, y); }
  function heldUp() {
    if (!st.open || st.mode !== 'held') return; st.mode = 'open';
    if (st.slide) { st.slide = null; if (GJ.haptic && !(GJ.moon && GJ.moon.quiet && GJ.moon.quiet())) GJ.haptic.commit(); foldSoon(); kick(); return; }
    var h = st.hover; st.hover = null; if (h) { choose(h.k, h.v); foldSoon(); } else { later(); kick(); }
  }
  // its own touch, once open
  hit.addEventListener('pointerdown', function (e) {
    if (!st.open) return; e.preventDefault(); e.stopPropagation(); try { hit.setPointerCapture(e.pointerId); } catch (x) {} clearTimeout(st.idleT); clearTimeout(st.foldT); st.mode = 'open';
    var s = nearest(e.clientX, e.clientY);
    if (s && !s.knob) { st.press = s; hover(s); return; }
    track(e.clientX, e.clientY); if (st.slide) return;
    st.drag = { x: e.clientX, y: e.clientY, tx: T.x, ty: T.y };   // the space between the rings: turn it
  });
  hit.addEventListener('pointermove', function (e) {
    if (st.slide) { track(e.clientX, e.clientY); return; }
    if (st.drag) { T.tx = clamp(st.drag.tx + (e.clientX - st.drag.x) * .9, -140, 140); T.ty = clamp(st.drag.ty + (e.clientY - st.drag.y) * .9, -120, 120); T.x = T.tx; T.y = T.ty; kick(); return; }
    if (st.press) { var s = nearest(e.clientX, e.clientY); hover(s && s.k === st.press.k && s.v === st.press.v ? s : null); }
  });
  function hitUp() {
    if (st.slide) { st.slide = null; if (GJ.haptic && !(GJ.moon && GJ.moon.quiet && GJ.moon.quiet())) GJ.haptic.commit(); later(); kick(); return; }
    if (st.drag) { st.drag = null; later(); kick(); return; }
    var p = st.press; st.press = null; var h = st.hover; st.hover = null;
    if (p && h && h.k === p.k && h.v === p.v) {
      var t = performance.now();
      if (lastTap && lastTap.k === p.k && t - lastTap.t < 320 && DEF[p.k] != null) {   // double-tap a ring: its default
        lastTap = null; var rr = RINGS.filter(function (q) { return q.k === p.k; })[0]; choose(p.k, rr && rr.slide ? +DEF[p.k] : DEF[p.k]); if (GJ.dialkit) GJ.dialkit.reset('rings', rr ? rr.name || p.k : p.k);
      } else { lastTap = { k: p.k, t: t }; choose(p.k, p.v); }
    }
    later(); kick();
  }
  hit.addEventListener('pointerup', hitUp); hit.addEventListener('pointercancel', function () { st.slide = null; st.drag = null; st.press = null; st.hover = null; later(); kick(); });
  document.addEventListener('pointerdown', function (e) { if (st.open && e.target !== hit && !(e.target.closest && e.target.closest('#moon'))) close(); }, true);   // a touch outside: folded back, and the touch still lands
  G.addEventListener('resize', function () { if (st.open) close(); });
  store.on(function () { if (st.open || st.fade > 0) kick(); });

  function starXY(k, v) { var o = [0, 0, 0], r = RINGS.filter(function (q) { return q.k === k; })[0], s = STARS.filter(function (q) { return q.k === k && q.v === String(v); })[0]; if (!r || !s) return null; onRing(r, s.a, o); return [o[0], o[1]]; }
  GJ.moonOrbit = { open: open, close: close, carry: carry, release: release, view: function () { return flat() ? 'flat' : '3d'; }, isOpen: function () { return st.open; }, heldMove: heldMove, heldUp: heldUp, choose: choose,
    rings: RINGS.map(function (r) { return r.k; }), items: function () { return STARS.map(function (s) { return s.k + ':' + s.v; }); },
    names: function () { return STARS.map(function (s) { return { id: s.k + ':' + s.v, ring: RINGS[s.ri].name, choice: s.lab }; }); },
    star: function (id) { view(); var p = id.split(':'); return starXY(p[0], p[1]); },
    knob: function (k) { view(); var r = RINGS.filter(function (q) { return q.k === k; })[0], o = [0, 0, 0]; onRing(r, knobA(r), o); return [o[0], o[1]]; },
    sliderAt: function (k, u) { view(); var r = RINGS.filter(function (q) { return q.k === k; })[0], o = [0, 0, 0]; onRing(r, r.a0 + r.span * u, o); return [o[0], o[1]]; },
    value: function (k) { var r = RINGS.filter(function (q) { return q.k === k; })[0]; return r ? val(r) : null; },
    state: function () { return { open: st.open, mode: st.mode, hover: st.hover ? st.hover.k + ':' + st.hover.v : null, slide: st.slide ? st.slide.r.k : null, stepback: host.classList.contains('stepback'), centre: [C.x, C.y], yaw: yawNow(), pitch: pitNow() }; } };
})(window);
