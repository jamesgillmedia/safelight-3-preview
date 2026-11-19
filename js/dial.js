/* tools-02 · ghost dials (m4/js/sg/ghostdial.js values, DIALS.md), one per job.
   Each value has its own dial in its own fixed place on the Tune side: the first (primary) higher,
   the second lower. A dial never jumps to the finger and never swaps rings.
   R 60, span 110°, in within 150 ms. Auto-hide, held longer than the site's (Gill, 16 Nov): after you let go a dial
   waits 1.6 s (site 280 ms), then fades 720 ms; brought up by the Mark or the held dot it stays 4 s. Reduced motion:
   no fade, gone at 2 s. A tap on the Mark still closes them at once. When open, a dial slides 28 px in from the edge. */
  var HOLD = 1600, FADE = 720, LINGER = 4000, RM_HIDE = 2000;
(function (G) {
  'use strict';
  var GJ = G.GJ, clamp = GJ.clamp;
  // the arc stands upright along the edge ("("): its bottom is the minimum, its top the maximum — slide up and down
  var R = 60, SPAN = 110, A0 = 180 - SPAN / 2, A1 = 180 + SPAN / 2, CX = 200, CY = 75;
  var NS = 'http://www.w3.org/2000/svg';
  var SLOTS = [.36, .56];              // fixed places (share of the height) for the first and second dial
  var rings = [], saved = null, drag = null, wheelT = 0;
  var D = [];                          // per dial: { el, svg, zone, hideT, outT, visible }

  var dial = GJ.dial = { visible: false, open: false };

  dial.init = function () {
    for (var i = 0; i < 2; i++) {
      var el = document.createElement('div'); el.className = 'gdial'; el.id = 'dial' + i; el.setAttribute('aria-hidden', 'true');
      var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', 220); svg.setAttribute('height', 150); el.appendChild(svg);
      var zone = document.createElement('div'); zone.className = 'gzone'; zone.id = 'dz' + i; zone.setAttribute('aria-label', 'dial ' + (i + 1));
      document.body.appendChild(el); document.body.appendChild(zone);
      var chip = document.createElement('button'); chip.className = 'gchip'; chip.id = 'gchip' + i; chip.setAttribute('aria-label', 'switch this dial');
      document.body.appendChild(chip);
      chip.addEventListener('click', swap.bind(null, i));
      D.push({ el: el, svg: svg, zone: zone, chip: chip, hideT: 0, outT: 0, visible: false, i: i, lastTap: 0 });
      // touch and slide (Gill, 16 Nov): the whole half of the edge is the grip — upper half the first layer, lower half the
      // second. A quiet tick always sits there: a hairline, the value as a dot on it, the ring's name — something to grab.
      zone.innerHTML = '<i class="gz-line"></i><i class="gz-dot"></i><b class="gz-lab"></b>';
      zone.addEventListener('pointerdown', down.bind(null, i));
    }
    G.addEventListener('pointermove', move);
    G.addEventListener('pointerup', up); G.addEventListener('pointercancel', up);
    G.addEventListener('resize', place);
    place();
  };
  function place() {
    var H = G.innerHeight, tt = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-top')) || 112;
    var rl = document.querySelector('#rail .rl-dot'), railTop = rl ? rl.getBoundingClientRect().top - 14 : H * .74;
    var top0 = tt + 132, mid = H * .465, bot1 = Math.min(H * .74, railTop);   // under the camera dial · the middle · above the rail (never over it)
    var Z = [[top0, mid - 4], [mid + 4, bot1]];
    D.forEach(function (d, i) {
      var cy = H * SLOTS[i];
      d.el.style.top = (cy - CY) + 'px';
      d.zone.style.top = Z[i][0] + 'px'; d.zone.style.height = Math.max(90, Z[i][1] - Z[i][0]) + 'px';
      d.chip.style.top = (cy + 12) + 'px';
    });
    D.forEach(function (d, i) { tick(i); });
  }
  function tick(i) {   // the quiet tick on the edge: where the value sits, and which ring this half of the edge turns
    var d = D[i], r = rings[i]; if (!d || !r) return;
    var f = clamp((r.get() - r.min) / (r.max - r.min), 0, 1), h = d.zone.clientHeight || 120;
    var dot = d.zone.children[1], lab = d.zone.children[2];
    dot.style.top = (10 + (h - 20) * (1 - f)).toFixed(1) + 'px';
    if (lab.textContent !== r.label) lab.textContent = r.label;
  }
  dial.edgeTick = tick;

  dial.config = function (rs) { saved = null; rings = rs || []; sync(); if (dial.open) rings.forEach(function (r, i) { show(i); }); };
  dial.rings = function () { return rings; };
  function sync() {
    D.forEach(function (d, i) { d.zone.style.display = rings[i] ? '' : 'none'; if (!rings[i]) hide(i, true); else tick(i); });
    dial.visible = D.some(function (d) { return d.visible; });
    D.forEach(function (d, i) { if (d.visible) draw(i); });
  }

  function pt(r, deg) { var a = deg * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }
  function angOf(ring, v) { return A0 + (v - ring.min) / (ring.max - ring.min) * SPAN; }   // 125° bottom → 235° top
  function arcPath(r) { var p = pt(r, A0), q = pt(r, A1); return 'M' + p[0] + ' ' + p[1] + ' A' + r + ' ' + r + ' 0 0 1 ' + q[0] + ' ' + q[1]; }
  function line(a, b, cls) { var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); l.setAttribute('class', cls); return l; }

  function draw(i) {
    var d = D[i], ring = rings[i], svg = d.svg; if (!ring) return;
    tick(i); if (dial.onPaint) dial.onPaint(i, ring, drag && drag.i === i ? drag.fine : 1);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var band = document.createElementNS(NS, 'path'); band.setAttribute('d', arcPath(R)); band.setAttribute('class', 'band'); svg.appendChild(band);
    var arc = document.createElementNS(NS, 'path'); arc.setAttribute('d', arcPath(R)); arc.setAttribute('class', 'arc' + (drag && drag.i === i ? ' on' : '')); svg.appendChild(arc);
    // the value as a fill along the arc, from its minimum to where it sits
    var vv = clamp(ring.get(), ring.min, ring.max), a1 = angOf(ring, vv);
    if (a1 > A0 + .5) { var p0 = pt(R, A0), p1 = pt(R, a1), fl = document.createElementNS(NS, 'path');
      fl.setAttribute('d', 'M' + p0[0] + ' ' + p0[1] + ' A' + R + ' ' + R + ' 0 0 1 ' + p1[0] + ' ' + p1[1]); fl.setAttribute('class', 'fill'); svg.appendChild(fl); }
    // a live meter (audio dials): a glow that rides the fill
    if (ring.meter) { var mv = clamp(ring.meter(), 0, 1); if (mv > .01) { var am = A0 + mv * SPAN, q0 = pt(R + 6, A0), q1 = pt(R + 6, am), me = document.createElementNS(NS, 'path');
      me.setAttribute('d', 'M' + q0[0] + ' ' + q0[1] + ' A' + (R + 6) + ' ' + (R + 6) + ' 0 0 1 ' + q1[0] + ' ' + q1[1]); me.setAttribute('class', 'meter'); svg.appendChild(me); } }
    [ring.min, ring.max].forEach(function (v) { svg.appendChild(line(pt(R - 5, angOf(ring, v)), pt(R + 5, angOf(ring, v)), 'tick end')); });
    svg.appendChild(line(pt(R - 3, angOf(ring, (ring.min + ring.max) / 2)), pt(R + 3, angOf(ring, (ring.min + ring.max) / 2)), 'tick'));
    if (ring.def != null) svg.appendChild(line(pt(R - 6, angOf(ring, ring.def)), pt(R + 2, angOf(ring, ring.def)), 'tick def'));
    (ring.notches ? ring.notches() : []).forEach(function (v) { if (v >= ring.min && v <= ring.max) svg.appendChild(line(pt(R - 3, angOf(ring, v)), pt(R + 3, angOf(ring, v)), 'tick notch')); });
    var v = clamp(ring.get(), ring.min, ring.max), m = pt(R, angOf(ring, v));
    var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', m[0]); c.setAttribute('cy', m[1]); c.setAttribute('r', 3.4); c.setAttribute('class', 'mark'); svg.appendChild(c);
    // chevrons at the ends: slide up / slide down
    var top = pt(R, A1), bot = pt(R, A0);
    var ch = document.createElementNS(NS, 'path'); ch.setAttribute('class', 'chev');
    ch.setAttribute('d', 'M' + (top[0] - 4) + ' ' + (top[1] - 7) + ' L' + top[0] + ' ' + (top[1] - 11) + ' L' + (top[0] + 4) + ' ' + (top[1] - 7) +
      ' M' + (bot[0] - 4) + ' ' + (bot[1] + 7) + ' L' + bot[0] + ' ' + (bot[1] + 11) + ' L' + (bot[0] + 4) + ' ' + (bot[1] + 7));
    svg.appendChild(ch);
    var t = document.createElementNS(NS, 'text'); t.setAttribute('x', CX - R - 12); t.setAttribute('y', CY + 3);
    t.setAttribute('class', 'lab' + (drag && drag.i === i ? ' on' : '')); t.textContent = ring.label + '  ' + ring.fmt(v) + (drag && drag.i === i && drag.fine < 1 ? '  · fine' : ''); svg.appendChild(t);
  }
  dial.redraw = function () { D.forEach(function (d, i) { if (d.visible) draw(i); }); };

  function swap(i) {   // the chip: this dial's second job (and back)
    var r = rings[i]; if (!r || !r.alt) return;
    var nx = r.alt; nx.alt = r; rings[i] = nx; GJ.haptic.tick(); show(i); release(i);
  }
  function show(i) {
    var d = D[i]; if (!d || !rings[i]) return;
    dial.open = true;
    d.chip.textContent = rings[i].alt ? '⇅ ' + rings[i].alt.label.toLowerCase() : '';
    d.chip.classList.toggle('on', !!rings[i].alt);
    clearTimeout(d.hideT); clearTimeout(d.outT);
    d.el.classList.remove('out'); d.el.classList.add('up');
    d.visible = true; dial.visible = true;
    document.body.classList.add('dialup');
    draw(i);
    if (dial.onShow) dial.onShow(i, true);
  }
  function release(i) {
    var d = D[i]; if (!d) return; clearTimeout(d.hideT); clearTimeout(d.outT); draw(i);
    if (GJ.reduced()) { d.hideT = setTimeout(function () { hide(i); }, RM_HIDE); return; }
    d.hideT = setTimeout(function () { d.el.classList.add('out'); d.chip.classList.remove('on'); d.outT = setTimeout(function () { hide(i); }, FADE); }, HOLD);
  }
  function hide(i, quiet) {
    var d = D[i]; if (!d) return;
    clearTimeout(d.hideT); clearTimeout(d.outT);
    d.el.classList.remove('up', 'out'); d.visible = false; d.chip.classList.remove('on');
    dial.visible = D.some(function (k) { return k.visible; });
    if (!dial.visible) dial.open = false;
    if (dial.onShow) dial.onShow(i, false);
    if (!dial.visible && !quiet) {
      // a dial popped over the screen's own (the red-mode dot, held) gives them back
      if (saved) { rings = saved; saved = null; sync(); }
      var red = GJ.store.get().red;   // Tune returns on the fold timing: 240 ms red, 640 ms night
      setTimeout(function () { if (!dial.visible) document.body.classList.remove('dialup'); }, red ? 240 : 640);
    }
  }
  dial.hideNow = function () { D.forEach(function (d, i) { hide(i, true); }); dial.visible = false; dial.open = false; if (saved) { rings = saved; saved = null; sync(); } document.body.classList.remove('dialup'); };
  // close: the dials fold away (720 ms fade, or at once under reduced motion) and stay closed until asked for
  dial.close = function () {
    dial.open = false;
    D.forEach(function (d, i) {
      if (!d.visible) return;
      if (GJ.reduced()) { hide(i); return; }
      clearTimeout(d.hideT); d.el.classList.add('out'); d.chip.classList.remove('on'); clearTimeout(d.outT); d.outT = setTimeout(function () { hide(i); }, FADE);
    });
  };

  /* ---------- turning ---------- */
  function apply(i, raw, live) {
    var ring = rings[i]; if (!ring) return;
    var v = clamp(raw, ring.min, ring.max), prev = ring.get();
    if (ring.step) v = ring.step(v, drag && drag.i === i ? drag.fine : 1);
    if ((raw <= ring.min || raw >= ring.max) && !ring._edge) { GJ.haptic.edge(); ring._edge = true; }
    if (raw > ring.min && raw < ring.max) ring._edge = false;
    if (ring.step && v !== prev) GJ.haptic.tick();
    if (!ring.step && ring.notches) ring.notches().forEach(function (n) { if ((prev - n) * (v - n) < 0) GJ.haptic.tick(); });
    ring.set(v, live);
    draw(i);
  }
  function settle(i) {
    var ring = rings[i]; if (!ring) return;
    var v = ring.get(), tgt = ring.settle ? ring.settle(v) : v;
    if (ring.settle) ring.set(tgt, false);
    GJ.haptic.commit();
    ring.commit && ring.commit(tgt);
    draw(i);
  }

  // drag along the arc: left → right (or down → up) turns it toward its maximum
  function down(i, e) {
    if (!rings[i]) return;
    e.preventDefault(); e.stopPropagation();
    clearTimeout(D[i].hideT); clearTimeout(D[i].outT); D[i].el.classList.remove('out');
    var now = GJ.now(), r0 = rings[i];
    stopFling(i);
    if (now - D[i].lastTap < 320 && (r0.def != null || r0.home)) {   // double-tap: home, on a smooth glide (CAMERA-DIAL.md)
      D[i].lastTap = 0; clearTimeout(holdT);
      if (r0.home) r0.home(); else { glideTo(i, r0.def); }
      GJ.haptic.commit(); show(i); release(i); return;
    }
    D[i].lastTap = now;
    drag = { i: i, id: e.pointerId, x: e.clientX, y: e.clientY, ly: e.clientY, v: r0.get(), moved: false, hist: [[now, r0.get()]] };
    // hold (no turn for 450 ms): push in one level — the same as a pinch in; let go and it stops or glides on
    clearTimeout(holdT);
    holdT = setTimeout(function () { if (drag && drag.i === i && !drag.moved) { drag.held = true; GJ.haptic.commit(); (r0.hold || dial.onHold || function () {})(true, r0); } }, 450);
    try { D[i].zone.setPointerCapture(e.pointerId); } catch (x) {}
    show(i);
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var r = rings[drag.i]; if (!r) return;
    // slide up to raise, down to lower; the farther the thumb is from the edge, the finer the step (like scrubbing video)
    var dy = -(e.clientY - drag.ly); drag.ly = e.clientY;
    if (Math.abs(e.clientY - drag.y) > 4) { drag.moved = true; document.documentElement.classList.add('dial-turning'); }   // a dial steps back from what it is changing
    var away = G.innerWidth - e.clientX, fine = away < 90 ? 1 : away < 170 ? .5 : away < 250 ? .25 : .1;
    drag.v = clamp(drag.v + dy / (r.span || 280) * (r.max - r.min) * fine, r.min - (r.max - r.min) * .02, r.max + (r.max - r.min) * .02);
    drag.fine = fine;
    if (drag.held) return;
    apply(drag.i, drag.v, true);
    var t = GJ.now(); drag.hist.push([t, drag.v]); while (drag.hist.length > 2 && t - drag.hist[0][0] > 90) drag.hist.shift();
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var i = drag.i, d = drag; drag = null; clearTimeout(holdT);
    document.documentElement.classList.remove('dial-turning');
    if (d.held) { var r1 = rings[i]; (r1 && r1.hold || dial.onHold || function () {})(false, r1); release(i); return; }
    // a fast turn keeps going with momentum, then eases to a stop: no bounce, no rubber band
    var h = d.hist, a = h[0], b = h[h.length - 1], vel = b[0] - a[0] > 8 ? (b[1] - a[1]) / ((b[0] - a[0]) / 1000) : 0, r = rings[i];
    if (r && !r.step && !GJ.reduced() && Math.abs(vel) > (r.max - r.min) * .9 && GJ.now() - b[0] < 120) { fling(i, vel); return; }
    settle(i); release(i);
  }
  var holdT = 0, FL = [null, null];
  function fling(i, vel) {
    var r = rings[i], last = GJ.now(), v = r.get();
    FL[i] = { vel: vel };
    (function f() {
      var F = FL[i]; if (!F || rings[i] !== r) return;
      var t = GJ.now(), dt = Math.min(.05, (t - last) / 1000); last = t;
      F.vel *= Math.exp(-dt * 3.2); v += F.vel * dt;
      if (v <= r.min || v >= r.max) { v = clamp(v, r.min, r.max); F.vel = 0; }   // the end stops it dead: no bounce
      apply(i, v, true);
      if (Math.abs(F.vel) > (r.max - r.min) * .02) requestAnimationFrame(f); else { FL[i] = null; settle(i); release(i); }
    })();
  }
  function stopFling(i) { if (FL[i]) { FL[i] = null; } }
  function glideTo(i, v) {   // double-tap home: a smooth glide, not a jump
    var r = rings[i], v0 = r.get(), t0 = GJ.now(), ms = GJ.reduced() ? 1 : 520;
    (function f() { var u = Math.min(1, (GJ.now() - t0) / ms); if (rings[i] !== r) return; apply(i, v0 + (v - v0) * GJ.ease(u), true); if (u < 1) requestAnimationFrame(f); else settle(i); })();
  }
  dial.flinging = function () { return !!(FL[0] || FL[1]); };

  // a tap on the Mark opens the dials; another tap closes them
  dial.summon = function () {
    if (!rings.length) return;
    rings.forEach(function (r, i) { show(i); });
    clearTimeout(wheelT);
    wheelT = setTimeout(function () { rings.forEach(function (r, i) { if (!(drag && drag.i === i)) release(i); }); }, LINGER - HOLD);
  };
  dial.toggle = function () { if (dial.open && dial.visible) dial.close(); else dial.summon(); };
  // a button that belongs to one dial opens that dial (the film's "12 fps" opens SPEED): it comes up and lingers like a summon
  dial.raise = function (i) {
    if (!rings[i]) return; show(i); clearTimeout(D[i].raiseT);
    D[i].raiseT = setTimeout(function () { if (!(drag && drag.i === i)) release(i); }, LINGER - HOLD);
  };
  dial.pop = function (rs) { if (!saved) saved = rings; rings = rs; sync(); dial.summon(); };
  dial.popped = function () { return !!saved; };

  // wheel: 520 px of wheel is a full turn; a 240 ms pause commits (sky.js onWheel). Alt turns the second dial.
  dial.wheel = function (dy, inner) {
    var i = inner && rings[1] ? 1 : 0, ring = rings[i]; if (!ring) return;
    show(i); clearTimeout(D[i].hideT); clearTimeout(D[i].outT); D[i].el.classList.remove('out');
    apply(i, ring.get() - dy / 520 * (ring.max - ring.min), true);
    clearTimeout(wheelT); wheelT = setTimeout(function () { settle(i); release(i); }, 240);
  };
  dial.nudge = function (dir, inner) {
    var i = inner && rings[1] ? 1 : 0, ring = rings[i]; if (!ring) return;
    show(i);
    apply(i, ring.get() + dir * (ring.unit || (ring.max - ring.min) / 40), true);
    clearTimeout(wheelT); wheelT = setTimeout(function () { settle(i); release(i); }, 240);
  };
  // scripted turn for proofs
  dial.turnTo = function (v, ms, inner) {
    var i = inner && rings[1] ? 1 : 0, ring = rings[i]; if (!ring) return Promise.resolve();
    show(i); var v0 = ring.get(), t0 = GJ.now();
    return new Promise(function (res) {
      (function f() {
        var u = Math.min(1, (GJ.now() - t0) / ms);
        apply(i, v0 + (v - v0) * GJ.ease(u), true);
        if (u < 1) requestAnimationFrame(f); else { settle(i); release(i); res(); }
      })();
    });
  };
  var tk = 0;
  dial.tick = function () { D.forEach(function (d, i) { if (d.visible && rings[i] && rings[i].meter) draw(i); }); if (++tk % 6 === 0) D.forEach(function (d, i) { if (!d.visible) tick(i); }); if (tk % 30 === 0) place(); };   // live meters
  // the master dial grabs a ring the same way the edge does (touch and slide, fling, hold, double-tap)
  dial.grab = function (e, i) { if (rings[i]) down(i, e); };
  dial.swap = function (i) { swap(i); };
  dial.swapQuiet = function (i) { var r = rings[i]; if (!r || !r.alt) return; var nx = r.alt; nx.alt = r; rings[i] = nx; };
  dial.dragging = function () { return drag ? drag.i : -1; };
  dial.slots = function () { return SLOTS.map(function (s) { return G.innerHeight * s; }); };
})(this);
