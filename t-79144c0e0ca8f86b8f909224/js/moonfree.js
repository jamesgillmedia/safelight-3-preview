/* tools-02 · the free Moon dial (compare 'after', core/compare.js; Gill, 20 Nov 8:17: "The moon dial is separate and has to
   have unique functionality. It is the one that moves freely around and is accessible and gives function the other dials
   do not."). The right-edge dial turns the place; this one goes with you.
     drag ............ move it anywhere; let go and it stays. Let go against the left or right edge and it rests there as a dot.
     rest ............ after a few quiet seconds it wanes to the crescent where it is (or the dot, at an edge). On the sky's
                       crescent spot it IS the sky's crescent (the sky does not draw a second one).
     tap ............. it fills and unfolds its ring of shortcuts (dial A's feel): drag the space between them to orbit the
                       ring, and it springs back; tap one to go; a tap outside, or a few quiet seconds, folds it back.
   Its shortcuts — nothing the right-edge dial does (no rings, no values, no atmosphere):
     home · back · the map · ask · notes · red mode
   Drawn light, dark red in red mode, never the dot's mint. Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ, C = G.GJ_COMPARE, app = GJ.app, html = document.documentElement, KEY = 'oz-moonfree';
  if (!C || !GJ || !app) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function vw() { return G.innerWidth; } function vh() { return G.innerHeight; }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  var ACTS = [
    ['home', 'home', function () { if (GJ.mark && GJ.mark.home) GJ.mark.home(); else { while (app.room) app.back(); app.toSky(); } }],
    ['back', 'back', function () { if (GJ.mark && GJ.mark.back) GJ.mark.back(); else app.back(); }],
    ['map', 'map', function () { if (GJ.navmap) GJ.navmap.open(); }],
    ['ask', 'ask', function () { if (GJ.ask) GJ.ask.open(); }],
    ['notes', 'notes', function () { if (GJ.notes) GJ.notes.open(); }],
    ['red', 'red', function () { if (GJ.redmode) GJ.redmode.toggle(); }],
    ['messages', 'messages', function () { if (GJ.messages) GJ.messages.open(); else if (GJ.lazy && GJ.lazy.load) GJ.lazy.load('messages').then(function () { GJ.messages.open(); }); }]   // Gill, 20 Nov: Messages on the Moon dial
  ];
  var st = { side: 'sky', x: .8, y: .1 }; try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv && sv.side) st = sv; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var css = document.createElement('style'); css.textContent =
    '#moonfree{position:fixed;left:0;top:0;width:0;height:0;z-index:67;-webkit-user-select:none;user-select:none;transition:left .45s cubic-bezier(.2,.85,.25,1),top .45s cubic-bezier(.2,.85,.25,1)}' +
    'html:not(.v-after) #moonfree{display:none}html.v-after #moon,html.v-after #moonhold{display:none!important}' +
    '#moonfree.drag{transition:none}' +
    '#moonfree.under{opacity:0;pointer-events:none}#moonfree.under *{pointer-events:none!important}' +
    '#moonfree .mf-m{position:absolute;left:-26px;top:-26px;width:52px;height:52px;padding:0;border:0;background:none;touch-action:none;cursor:grab;z-index:2}' +
    '#moonfree .mf-m i{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 34% 30%,rgba(200,196,188,.55) 0 9%,transparent 10%),radial-gradient(circle at 64% 58%,rgba(190,186,178,.5) 0 13%,transparent 14%),radial-gradient(circle at 40% 40%,#f2efe8,#cfcac0 70%,#a9a49b);box-shadow:0 0 18px rgba(232,228,220,.35);transition:width .35s,height .35s,margin .35s,opacity .35s,box-shadow .35s}' +
    '#moonfree .mf-m i::after{content:"";position:absolute;inset:-2px;border-radius:50%;background:#0b1020;transform:translateX(110%);transition:transform .6s ease-in-out}' +
    '#moonfree.rest .mf-m i{opacity:.92;box-shadow:none}#moonfree.rest .mf-m i::after{transform:translateX(34%)}' +
    '#moonfree.dot .mf-m i{width:9px;height:9px;margin:-4.5px 0 0 -4.5px;opacity:.75;box-shadow:0 0 6px rgba(232,228,220,.4)}#moonfree.dot .mf-m i::after{display:none}' +
    '#moonfree.lift .mf-m i{width:48px;height:48px;margin:-24px 0 0 -24px;box-shadow:0 0 28px rgba(232,228,220,.6)}' +
    '#moonfree.open .mf-m i{width:46px;height:46px;margin:-23px 0 0 -23px;box-shadow:0 0 30px rgba(232,228,220,.55)}' +
    '#moonfree .mf-disc{position:absolute;left:-128px;top:-128px;width:256px;height:256px;border-radius:50%;touch-action:none;perspective:520px;pointer-events:none;opacity:0;transition:opacity .25s}' +
    '#moonfree.open .mf-disc{pointer-events:auto;opacity:1}' +
    '#moonfree .mf-ring{position:absolute;inset:0;border-radius:50%;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.3,1.5,.5,1)}' +
    '#moonfree .mf-ring::before{content:"";position:absolute;inset:34px;border-radius:50%;border:1px solid rgba(232,228,220,.18);background:none}' +
    '#moonfree.turning .mf-ring{transition:none}' +
    '#moonfree .mf-a{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;border:1px solid rgba(232,228,220,.28);background:rgba(8,11,22,.55);color:rgba(240,236,228,.95);font:500 11px/1 var(--f-ui,system-ui,sans-serif);letter-spacing:.03em;cursor:pointer;transform:rotate(var(--a)) translateY(-96px) rotate(calc(-1 * var(--a) - var(--spin,0deg))) scale(.4);opacity:0;transition:transform .45s cubic-bezier(.2,1.3,.4,1),opacity .3s;transition-delay:calc(var(--k) * 25ms)}' +
    '#moonfree.open .mf-a{transform:rotate(var(--a)) translateY(-96px) rotate(calc(-1 * var(--a) - var(--spin,0deg))) scale(1);opacity:1}' +
    '#moonfree.turning .mf-a{transition:opacity .3s}' +
    '#moonfree .mf-a[data-k=red]{color:#ff8a96;border-color:rgba(255,68,87,.45)}' +
    'html.red #moonfree .mf-m i{background:radial-gradient(circle at 40% 40%,#7a1622,#4a0b14 70%,#2c060b);box-shadow:0 0 14px rgba(160,20,36,.4)}html.red #moonfree .mf-m i::after{background:#050102}' +
    'html.red #moonfree .mf-a{background:rgba(10,2,4,.9);color:rgba(255,68,87,.9);border-color:rgba(255,68,87,.35)}html.red #moonfree .mf-ring::before{border-color:rgba(255,68,87,.18)}';   // Reduce Motion is ignored (Gill's rule; his OK on 20 Nov to change this frozen file)
  document.head.appendChild(css);
  var el = document.createElement('div'); el.id = 'moonfree';
  el.innerHTML = '<div class="mf-disc" aria-hidden="true"><div class="mf-ring">' + ACTS.map(function (a, i) {
    return '<button type="button" class="mf-a" data-k="' + a[0] + '" style="--a:' + (i * 360 / ACTS.length) + 'deg;--k:' + i + '" aria-label="' + a[1] + '">' + a[1] + '</button>'; }).join('') +
    '</div></div><button type="button" class="mf-m" aria-label="Moon dial: tap for shortcuts (home, back, map, ask, notes, red mode, messages), drag to move" aria-expanded="false"><i></i></button>';
  document.body.appendChild(el);
  var M = el.querySelector('.mf-m'), D = el.querySelector('.mf-disc'), R = el.querySelector('.mf-ring'), btns = [].slice.call(el.querySelectorAll('.mf-a'));
  var P = { x: 0, y: 0 }, open = false, g = null, restT = 0, foldT = 0, turn = null, ring = { rx: 0, ry: 0, spin: 0 };

  function home() { var k = GJ.sky; return !app.room && k && k.moonXY && k.moonA > .15 ? k.moonXY : null; }   // the sky's crescent spot, while it shows
  function spot() {   // where it rests now
    var h = home();
    if (st.side === 'sky') { if (h) return [h[0], h[1], 'sky']; return [vw() - 64, 92, 'free']; }   // by day or in a room: just under the red dot
    if (st.side === 'l') return [10, clamp(st.y * vh(), 80, vh() - 80), 'edge'];
    if (st.side === 'r') return [vw() - 10, clamp(st.y * vh(), 80, vh() - 80), 'edge'];
    return [clamp(st.x * vw(), 30, vw() - 30), clamp(st.y * vh(), 60, vh() - 60), 'free'];
  }
  function moveTo(x, y) { P.x = x; P.y = y; el.style.left = x + 'px'; el.style.top = y + 'px'; }
  function place() {
    if (g) return; var s = spot();
    if (open) { var r = 140; moveTo(clamp(s[0], r - 10, vw() - r + 10), clamp(s[1], r + 44, vh() - r)); return; }   // unfolded: the ring comes fully on screen
    moveTo(s[0], s[1]); el.classList.toggle('atedge', s[2] === 'edge');
  }
  function wake() { el.classList.remove('rest', 'dot'); clearTimeout(restT); restT = setTimeout(rest, 5000); }
  function rest() { if (open || g) return; var s = spot(); el.classList.toggle('dot', s[2] === 'edge'); el.classList.toggle('rest', s[2] !== 'edge'); }
  function paintRing() { R.style.transform = 'rotateX(' + ring.rx + 'deg) rotateY(' + ring.ry + 'deg) rotateZ(' + ring.spin + 'deg)'; el.style.setProperty('--spin', ring.spin + 'deg'); btns.forEach(function (b) { b.style.setProperty('--spin', ring.spin + 'deg'); }); }
  function setOpen(o) {
    if (o === open) return; open = o; clearTimeout(foldT);
    el.classList.toggle('open', o); M.setAttribute('aria-expanded', o ? 'true' : 'false'); D.setAttribute('aria-hidden', o ? 'false' : 'true');
    if (o) { el.classList.remove('rest', 'dot'); ring.rx = ring.ry = ring.spin = 0; paintRing(); foldSoon(); hap('commit'); }
    else wake();
    place();
  }
  function foldSoon() { clearTimeout(foldT); foldT = setTimeout(function () { if (!turn) setOpen(false); }, 6000); }
  function drop(x, y) {
    var h = GJ.sky && GJ.sky.moonXY && !app.room && GJ.sky.moonA > .15 ? GJ.sky.moonXY : null;
    if (h && Math.hypot(x - h[0], y - h[1]) < 48) st = { side: 'sky' };
    else if (x < 40) st = { side: 'l', y: clamp(y / vh(), .08, .92) };
    else if (x > vw() - 40) st = { side: 'r', y: clamp(y / vh(), .08, .92) };
    else st = { side: 'free', x: clamp(x / vw(), .04, .96), y: clamp(y / vh(), .05, .95) };
    save(); place(); hap('tick'); wake();
  }
  // the moon itself: tap = unfold / fold; drag = move it
  M.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation(); try { M.setPointerCapture(e.pointerId); } catch (x) {}
    g = { x: e.clientX, y: e.clientY, id: e.pointerId, mode: 'down', t: Date.now() }; clearTimeout(restT);
  });
  M.addEventListener('pointermove', function (e) {
    if (!g || e.pointerId !== g.id) return;
    if (g.mode === 'down' && Math.hypot(e.clientX - g.x, e.clientY - g.y) > 9) { g.mode = 'drag'; if (open) setOpen(false); el.classList.remove('rest', 'dot'); el.classList.add('drag', 'lift'); }
    if (g.mode === 'drag') moveTo(clamp(e.clientX, 12, vw() - 12), clamp(e.clientY, 40, vh() - 30));
  });
  function up(e) {
    var h = g; g = null; if (!h) return; el.classList.remove('drag', 'lift');
    if (h.mode === 'drag') { drop(e.clientX, e.clientY); return; }
    if (e.type === 'pointercancel') { place(); wake(); return; }
    setOpen(!open);
  }
  M.addEventListener('pointerup', up); M.addEventListener('pointercancel', up);
  M.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
  M.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } });
  // the ring: drag the space between the shortcuts to orbit it (spin round the moon and tilt in 3D); let go and it springs back
  D.addEventListener('pointerdown', function (e) {
    if (!open) return; e.stopPropagation(); if (e.target.closest('.mf-a')) return;
    e.preventDefault(); try { D.setPointerCapture(e.pointerId); } catch (x) {}
    var r = D.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    turn = { id: e.pointerId, cx: cx, cy: cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx), x0: e.clientX, y0: e.clientY, moved: 0 };
    el.classList.add('turning'); clearTimeout(foldT);
  });
  D.addEventListener('pointermove', function (e) {
    if (!turn || e.pointerId !== turn.id) return;
    var a = Math.atan2(e.clientY - turn.cy, e.clientX - turn.cx), d = a - turn.a0; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
    turn.moved = Math.hypot(e.clientX - turn.x0, e.clientY - turn.y0);
    ring.spin = clamp(d * 180 / Math.PI, -80, 80); ring.rx = clamp(-(e.clientY - turn.y0) * .35, -38, 38); ring.ry = clamp((e.clientX - turn.x0) * .35, -38, 38); paintRing();
  });
  function tup(e) {
    if (!turn || e.pointerId !== turn.id) return; var t = turn; turn = null; el.classList.remove('turning');
    ring.rx = ring.ry = ring.spin = 0; paintRing(); if (t.moved > 6) hap('tick');   // it springs back
    else if (!e.target.closest || !e.target.closest('.mf-a')) setOpen(false);       // a plain tap on the space folds it
    foldSoon();
  }
  D.addEventListener('pointerup', tup); D.addEventListener('pointercancel', tup);
  btns.forEach(function (b, i) {
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setOpen(false); hap('commit'); var f = ACTS[i][2]; setTimeout(f, 30); });
  });
  document.addEventListener('pointerdown', function (e) { if (open && !el.contains(e.target)) setOpen(false); }, true);
  // keep it in its place as the sky and rooms change (the crescent's spot moves a little as you look round)
  var lastRoom = app.room;
  setInterval(function () {
    if (C.v() !== 'after' || g) return;
    el.classList.toggle('under', !!(G.GJ_MASTER && G.GJ_MASTER.isOpen()));   // it steps aside while the right-edge dial is unfolded
    if (app.room !== lastRoom) { lastRoom = app.room; if (open) setOpen(false); place(); rest(); return; }
    if (!open && st.side === 'sky') { var s = spot(); if (Math.hypot(s[0] - P.x, s[1] - P.y) > 1.5) { el.classList.add('drag'); moveTo(s[0], s[1]); requestAnimationFrame(function () { el.classList.remove('drag'); }); } }
  }, 250);
  G.addEventListener('resize', place);
  C.on(function (v) { if (v === 'after') { try { if (GJ.moon) { GJ.moon.close(); GJ.moon.dot(); } } catch (e) {} place(); wake(); } else setOpen(false); });
  if (C.v() === 'after') { try { if (GJ.moon) GJ.moon.dot(); } catch (e) {} }
  place(); el.classList.add('rest');
  var boot = setInterval(function () { if (home()) { clearInterval(boot); place(); rest(); } }, 150); setTimeout(function () { clearInterval(boot); }, 5000);
  GJ.moonFree = { open: function () { setOpen(true); }, close: function () { setOpen(false); }, isOpen: function () { return open; }, acts: ACTS.map(function (a) { return a[0]; }),
    pos: function () { return { x: P.x, y: P.y, side: st.side, state: open ? 'open' : el.classList.contains('dot') ? 'dot' : el.classList.contains('rest') ? 'crescent' : 'full' }; },
    ring: function () { return { rx: ring.rx, ry: ring.ry, spin: ring.spin }; }, reset: function () { st = { side: 'sky' }; save(); place(); } };
})(window);
