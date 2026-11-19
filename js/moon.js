/* tools-02 · the Moon dial (briefs/MOON-DIAL.md; Gill, 18 Nov: "Keep both" — beside Mark II, not instead of it).
   One floating control inside the app: a small full moon you can drag to either edge, that opens a ring of shortcuts and
   rests as a dot so it never covers the work. Off until asked for (Tune → Moon dial).
     tap ................. the ring: home · back · red mode · ask · tune · the map · dial (lift on one, or tap it);
                           "dial" opens the outer ring: the places and the atmosphere, growing out of the moon
     double-tap .......... home
     touch and hold ...... the ring under the same finger; slide past it and turn: the place's own dial, a notch at a time
     drag ................ move it; let go and it drifts to the nearest edge and stays (kept per place, with one default)
     a short drag into its edge, or a few seconds alone: full moon → crescent → dot · a touch on the dot wakes it
     three fingers ....... find it: it shows itself in the middle for a moment
   Its home is the sky's own crescent (Gill, 19 Nov: "the moon should be integrated with the crescent moon" — "Yes, build it"):
   at rest the Moon dial IS that crescent; a tap fills it to a full moon with its ring; drag it off and it floats at an edge;
   drop it back on the crescent's place and it goes home. With the sky moon off (Tune) or faded by day, it rests at the edge.
   It is drawn light, dark red in red mode, never the dot's mint. Nothing here touches a photograph. First cut: the
   reassignable gestures, sizes, lock, VoiceOver action names and the Mac / watch notes in the brief are not built yet. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, clamp = GJ.clamp, html = document.documentElement, KEY = 'gj-moondial';
  // its settings (briefs/MOON-DIAL.md → Settings): size, how much shows at rest, how soon it rests, lock where it is, haptics on or off
  var SIZES = { n: [1, 'normal'], l: [1.5, 'large'], xl: [2, 'largest'] }, ALPHAS = [[.7, 'soft'], [.35, 'faint'], [1, 'full']], DELAYS = [[5, '5 s'], [10, '10 s'], [3, '3 s'], [0, 'never']];
  // (Gill, 19 Nov 08:01: "The crescent moon should become the moon dial. Page loads with crescent moon. Hold to convert to movable
  // moon dial.") On by default; every load starts as the sky's crescent — where it was moved to lasts only until the page reloads.
  var st = { on: true, delay: 5, pos: {}, size: 'n', alpha: .7, lock: false, hap: true }; try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv) { st.on = sv.on !== false; st.delay = sv.delay == null ? 5 : sv.delay; if (SIZES[sv.size]) st.size = sv.size; if (typeof sv.alpha === 'number') st.alpha = sv.alpha; st.lock = !!sv.lock; st.hap = sv.hap !== false; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  // the actions, also as a plain list for VoiceOver and Switch Control (visually hidden); the orbit (moonorbit.js) is what is seen
  // VoiceOver action names (safelight 3): each choice is read as its ring and its word — "atmosphere: soft", "moon: tonight's" —
  // grouped by ring, and the current one is marked as pressed
  var ACTS = GJ.moonOrbit ? (GJ.moonOrbit.names ? GJ.moonOrbit.names().map(function (n) { return [n.id, n.ring + ': ' + n.choice, n.ring]; }) : GJ.moonOrbit.items().map(function (id) { var q = id.split(':'); return [id, q[0] + ': ' + q[1], q[0]]; })) : [];
  var el = document.createElement('div'); el.id = 'moon'; el.hidden = true;
  var groups = []; ACTS.forEach(function (a, i) { var g0 = groups[groups.length - 1]; if (!g0 || g0.name !== a[2]) groups.push(g0 = { name: a[2], items: [] }); g0.items.push(i); });
  el.innerHTML = '<button class="mn-m" aria-label="Moon dial" aria-describedby="mn-hint" aria-expanded="false"><i></i></button><span id="mn-hint" class="mn-ring">tap or hold to open the light dial; drag to move it; the choices follow as buttons</span><div class="mn-ring" role="group" aria-label="Moon dial choices">' +
    groups.map(function (gr) { return '<div role="group" aria-label="' + gr.name + '">' + gr.items.map(function (i) { return '<button class="jul" data-i="' + i + '" aria-pressed="false">' + ACTS[i][1] + '</button>'; }).join('') + '</div>'; }).join('') + '</div>';
  document.body.appendChild(el);
  var M = el.querySelector('.mn-m'), ring = el.querySelector('div.mn-ring');
  function pressed() { if (!O() || !O().value) return; [].forEach.call(ring.querySelectorAll('button[data-i]'), function (b) { var q = ACTS[+b.getAttribute('data-i')][0].split(':'); var v = O().value(q[0]), on = typeof v === 'number' ? Math.abs(v - (+q[1])) < .01 : String(v) === q[1]; b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }
  // the sky's crescent, touchable while the Moon dial is off: a long press wakes it and it comes away under the finger
  var cres = document.createElement('div'); cres.id = 'moonhold'; cres.setAttribute('aria-hidden', 'true'); document.body.appendChild(cres);
  var P = { side: 'sky', y: .62 }, C = { x: 0, y: 0 }, g = null, idleT = 0, waneT = 0, lastTap = 0, lastRoom = null, cg = null, tapT = 0;
  var O = function () { return GJ.moonOrbit; };
  var hp = { tick: function () { if (st.hap) GJ.haptic.tick(); }, commit: function () { if (st.hap) GJ.haptic.commit(); } };   // haptics, unless turned off in its settings

  function key() { return app.room || 'sky'; }
  function home() { var k = GJ.sky; return k && k.moonXY && k.moonA > .15 ? k.moonXY : null; }   // the sky's crescent, while it shows
  function vw() { return G.innerWidth; } function vh() { return G.innerHeight; }
  function place() {
    var p = st.pos[key()] || st.pos.all || { side: 'sky' }, h = home(); P = { side: p.side, y: p.y == null ? .62 : p.y, x: p.x };
    el.classList.toggle('gone', P.side === 'sky' && !h);   // no crescent in the sky (by day, or the sky moon off): no Moon dial either — it is the crescent
    if (P.side === 'sky' && !h) P.side = 'r';
    if (P.side === 'sky') { C.x = h[0]; C.y = h[1]; }
    else if (P.side === 'free') { C.x = clamp(P.x * vw(), 30, vw() - 30); C.y = clamp(P.y * vh(), 70, vh() - 70); }
    else { C.x = P.side === 'l' ? 30 : vw() - 30; C.y = clamp(P.y * vh(), 120, vh() - 130); }
    el.style.left = C.x + 'px'; el.style.top = C.y + 'px'; el.classList.toggle('left', P.side === 'l'); el.classList.toggle('insky', P.side === 'sky'); el.classList.toggle('free', P.side === 'free'); away();
  }
  function away() { if (GJ.sky) GJ.sky.moonAway = st.on && P.side === 'sky' && state() !== 'dot'; }   // awake in the sky: this moon stands in for the sky's
  function state() { return el.classList.contains('dot') ? 'dot' : el.classList.contains('wane') ? 'crescent' : 'full'; }
  function isOpen() { return !!(O() && O().isOpen()); }
  function wake() { clearTimeout(idleT); clearTimeout(waneT); el.classList.remove('dot', 'wane'); away(); rest(); }
  function toDot(now) { if (isOpen()) O().close(); clearTimeout(idleT); clearTimeout(waneT); if (now || GJ.reduced()) { el.classList.remove('wane'); el.classList.add('dot'); away(); return; } el.classList.add('wane'); waneT = setTimeout(function () { el.classList.remove('wane'); el.classList.add('dot'); away(); }, 700); }
  function rest() { clearTimeout(idleT); if (!st.delay || isOpen() || g) return; if (GJ.mark2 && GJ.mark2.isOpen()) { idleT = setTimeout(rest, 1500); return; } idleT = setTimeout(function () { toDot(false); }, st.delay * 1000); }
  function openOrbit(held) { wake(); clearTimeout(idleT); el.classList.add('open'); M.setAttribute('aria-expanded', 'true'); O().open(C.x, C.y, held); }
  function closeOrbit() { if (isOpen()) O().close(); }
  function closed() { el.classList.remove('open'); M.setAttribute('aria-expanded', 'false'); rest(); }   // the orbit folded back
  function run(i) { var q = ACTS[i][0].split(':'); O().choose(q[0], q[1]); pressed(); rest(); }
  function drop(x, y) {   // let go anywhere: it stays there; on the crescent's place it goes home; hard against an edge, it rests at that edge
    var hm = home(), p;
    if (hm && Math.hypot(x - hm[0], y - hm[1]) < 56) p = { side: 'sky' };
    else if (x < 64) p = { side: 'l', y: clamp(y / vh(), .1, .9) };
    else if (x > vw() - 64) p = { side: 'r', y: clamp(y / vh(), .1, .9) };
    else p = { side: 'free', x: clamp(x / vw(), .05, .95), y: clamp(y / vh(), .06, .94) };
    st.pos[key()] = p; if (!st.pos.all) st.pos.all = p; save(); place(); hp.tick(); rest();
  }
  function carry(x, y) { el.style.left = clamp(x, 24, vw() - 24) + 'px'; el.style.top = clamp(y, 50, vh() - 50) + 'px'; }

  M.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation(); try { M.setPointerCapture(e.pointerId); } catch (x) {} clearTimeout(idleT); clearTimeout(waneT);
    var asleep = state() !== 'full';
    g = { x: e.clientX, y: e.clientY, mode: 'down', wasDot: asleep };
    g.t = setTimeout(function () {
      if (!g || g.mode !== 'down') return;
      if (g.wasDot && P.side === 'sky' && !st.lock) { g.mode = 'drag'; wake(); el.classList.add('drag', 'lift'); hp.commit(); return; }   // a long press on the resting crescent: it comes away, free to move
      g.mode = 'held'; openOrbit(true);   // hold the moon: the orbit opens under the same finger
    }, 450);
  });
  M.addEventListener('pointermove', function (e) {
    if (!g) return; var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (g.mode === 'down' && Math.hypot(dx, dy) > 10 && st.lock) { clearTimeout(g.t); g.mode = 'still'; return; }   // locked: it does not move
    if (g.mode === 'down' && Math.hypot(dx, dy) > 10) { clearTimeout(g.t); g.mode = 'drag'; closeOrbit(); el.classList.remove('dot', 'wane'); el.classList.add('drag'); away(); }
    if (g.mode === 'drag') carry(e.clientX, e.clientY);
    else if (g.mode === 'held') O().heldMove(e.clientX, e.clientY);
  });
  function up(e) {
    var h = g; g = null; if (!h) return; clearTimeout(h.t); el.classList.remove('drag', 'lift');
    if (h.mode === 'drag') { drop(e.clientX, e.clientY); return; }
    if (h.mode === 'held') { O().heldUp(); return; }
    if (h.mode === 'still') { rest(); return; }
    if (h.wasDot) { if (P.side === 'sky') { openOrbit(false); hp.tick(); return; } wake(); hp.tick(); return; }   // a tap on the crescent opens the dial where it is
    var now = GJ.now(); if (now - lastTap < 320) { lastTap = 0; clearTimeout(tapT); closeOrbit(); if (GJ.mark) GJ.mark.home(); hp.commit(); rest(); return; }   // double-tap: home
    lastTap = now; clearTimeout(tapT); if (isOpen()) closeOrbit(); else tapT = setTimeout(function () { if (lastTap === now) openOrbit(false); }, 300);   // wait out a double-tap before opening
  }
  M.addEventListener('pointerup', up); M.addEventListener('pointercancel', function () { if (g) { clearTimeout(g.t); g = null; el.classList.remove('drag', 'lift'); place(); rest(); } });
  ring.addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('button[data-i]') : null; if (b) run(+b.getAttribute('data-i')); });
  document.addEventListener('touchstart', function (e) { if (st.on && e.touches && e.touches.length === 3) find(); }, { passive: true });
  function find() { if (!st.on) return; wake(); clearTimeout(idleT); el.classList.add('found'); el.style.left = vw() / 2 + 'px'; el.style.top = vh() / 2 + 'px'; setTimeout(function () { el.classList.remove('found'); place(); rest(); }, GJ.reduced() ? 900 : 1500); }

  // the crescent itself, while the Moon dial is off (Gill, 19 Nov: "Long press on the crescent moon to activate moon dial free moving")
  cres.addEventListener('pointerdown', function (e) {
    if (st.on) return; e.preventDefault(); try { cres.setPointerCapture(e.pointerId); } catch (x) {}
    cg = { x: e.clientX, y: e.clientY, live: false };
    cg.t = setTimeout(function () { if (!cg) return; cg.live = true; st.pos[key()] = { side: 'sky' }; set(true); el.classList.add('drag', 'lift'); carry(cg.x, cg.y); hp.commit(); }, 500);
  });
  cres.addEventListener('pointermove', function (e) { if (!cg) return; if (cg.live) carry(e.clientX, e.clientY); else if (Math.hypot(e.clientX - cg.x, e.clientY - cg.y) > 10) { clearTimeout(cg.t); cg = null; } });
  function cresUp(e) { var c = cg; cg = null; if (!c) return; clearTimeout(c.t); if (c.live) { el.classList.remove('drag', 'lift'); drop(e.clientX, e.clientY); } }
  cres.addEventListener('pointerup', cresUp); cres.addEventListener('pointercancel', function () { if (cg) { clearTimeout(cg.t); if (cg.live) { el.classList.remove('drag', 'lift'); place(); } cg = null; } });
  function cresPlace() { var h = home(), show = !st.on && !!h && !app.room; cres.hidden = !show; if (show) { cres.style.left = h[0] + 'px'; cres.style.top = h[1] + 'px'; } }

  function viewing() { try { return (app.room === 'archive' && GJ.archive && GJ.archive.state().open != null) || (app.room === 'icons' && GJ.icons && GJ.icons.state().open != null); } catch (e) { return false; } }
  setInterval(function () {
    cresPlace(); if (!st.on || g) return;
    var want = (st.pos[key()] || st.pos.all || { side: 'sky' }).side === 'sky' && !!home();
    if (key() !== lastRoom || (!el.classList.contains('found') && (P.side === 'sky') !== want)) { lastRoom = key(); place(); }
    else if (P.side === 'sky' && !el.classList.contains('found')) { var hh = home(); if (hh && Math.hypot(hh[0] - C.x, hh[1] - C.y) > 1.5) place(); }
    if (viewing() && state() === 'full' && !isOpen()) toDot(true);   // it never sits on a frame being looked at
  }, 600);
  G.addEventListener('resize', function () { if (st.on) place(); });
  function pick(list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return i; return 0; }
  function look() { el.style.setProperty('--mn-s', SIZES[st.size][0]); el.style.setProperty('--mn-rest', st.alpha); el.classList.toggle('locked', st.lock); }
  function label() {
    var rows = { moondial: st.on ? 'on' : 'off', mnsize: SIZES[st.size][1], mnrest: ALPHAS[pick(ALPHAS, st.alpha)][1], mndelay: DELAYS[pick(DELAYS, st.delay)][1], mnlock: st.lock ? 'locked' : 'free', mnhap: st.hap ? 'on' : 'off' };
    for (var k in rows) { var b = document.querySelector('[data-t="' + k + '"] b'); if (b) b.textContent = rows[k]; }
  }
  function setting(k) {   // a Tune row steps through its choices
    if (k === 'mnsize') { var ks = Object.keys(SIZES); st.size = ks[(ks.indexOf(st.size) + 1) % ks.length]; }
    else if (k === 'mnrest') st.alpha = ALPHAS[(pick(ALPHAS, st.alpha) + 1) % ALPHAS.length][0];
    else if (k === 'mndelay') st.delay = DELAYS[(pick(DELAYS, st.delay) + 1) % DELAYS.length][0];
    else if (k === 'mnlock') st.lock = !st.lock;
    else if (k === 'mnhap') st.hap = !st.hap;
    else return;
    save(); look(); label(); if (st.on) { place(); wake(); } if (k === 'mnhap' && st.hap) GJ.haptic.tick();
  }
  (function () { var t = document.getElementById('tune'); if (t) t.addEventListener('click', function (e) { var x = e.target.closest ? e.target.closest('button[data-t]') : null; if (x) setting(x.getAttribute('data-t')); }); })();
  function set(on) { st.on = !!on; save(); el.hidden = !st.on; html.classList.toggle('moondial', st.on); if (st.on) { lastRoom = key(); place(); wake(); } else { closeOrbit(); clearTimeout(idleT); if (GJ.sky) GJ.sky.moonAway = false; } label(); cresPlace(); }
  look(); pressed(); if (GJ.store && GJ.store.on) GJ.store.on(pressed); set(st.on); if (st.on) { var boot = setInterval(function () { if (home()) { clearInterval(boot); place(); toDot(true); } }, 120); setTimeout(function () { clearInterval(boot); }, 6000); }   // it loads as the crescent
  GJ.moon = { set: set, isOn: function () { return st.on; }, state: state, ring: isOpen, open: function () { openOrbit(false); }, close: closeOrbit, closed: closed, run: run, find: find, wake: wake, dot: function () { toDot(true); }, acts: ACTS.map(function (a) { return a[0]; }),
    delay: function (s) { st.delay = s; save(); rest(); }, setting: setting, settings: function () { return { size: st.size, scale: SIZES[st.size][0], alpha: st.alpha, delay: st.delay, lock: st.lock, haptics: st.hap }; }, quiet: function () { return !st.hap; }, put: function (side, y, x) { st.pos[key()] = { side: side, y: y, x: x }; save(); place(); }, home: home, pos: function () { return { side: P.side, y: P.y, x: C.x, cy: C.y }; }, reset: function () { st.pos = {}; save(); place(); }, label: label, crescent: function () { cresPlace(); return !cres.hidden; } };
})(window);
