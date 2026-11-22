/* oz 3 alt · one dial behaviour for every dial (REFINE-PLAN: "Every dial gets the same three things: a label on
   first touch, auto-rest, and stepping back while it is turned"). The master dial (master.js / dial.js), the Moon dial
   (moon.js / moonorbit.js) and the oz depth dial (oztune.js) each call this, so they behave alike:
     · label on first touch — a short line beside the dial says what it does, the first two times (kept on this device)
     · auto-rest — left alone for the shared "rests after" time (Tune → Moon dial · rests after; 0 = never), a dial rests:
       the master dial softens to .4, the moon goes to its crescent / dot, the depth dial folds away when the finger lifts
     · steps back while turned — one class, html.dial-turning, while any dial is being turned; each dial's glass clears
   Loaded before the dials. Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, html = document.documentElement, KEY = 'gj-dialseen';
  var seen = {}; try { seen = JSON.parse(GJ.settings.getItem(KEY) || '{}') || {}; } catch (e) {}
  var dials = {}, lab = null, labT = 0, turning = {};
  function delay() { try { if (GJ.moon && GJ.moon.settings) { var d = GJ.moon.settings().delay; return d === 0 ? 0 : (d || 5) * 1000; } if (GJ.dialprefs) { var r = GJ.dialprefs.rest(); return r === 0 ? 0 : (r || 5) * 1000; } } catch (e) {} return 5000; }   // Tune → Dials → Rests after
  var lastAt = 0; function busy() { return Object.keys(turning).length > 0 || (GJ.now ? GJ.now() : Date.now()) - lastAt < 500; }   // a dial in hand, or just touched (Tune → Dials → Haptics)
  function mark() { lastAt = GJ.now ? GJ.now() : Date.now(); }
  function bubble() { if (!lab) { lab = document.createElement('div'); lab.id = 'dk-label'; lab.setAttribute('role', 'status'); lab.setAttribute('aria-live', 'polite'); document.body.appendChild(lab); } return lab; }
  function show(text, el, ms) {
    var b = bubble(), r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null, W = G.innerWidth, H = G.innerHeight;
    b.textContent = text; b.classList.remove('l', 'r', 'c');
    if (el && el.centre) {   // a point to centre on (the moon: above its orbit)
      b.classList.add('c'); b.style.right = 'auto'; var hw = Math.min(W / 2 - 8, (b.offsetWidth || 180) / 2 + 8); b.style.left = Math.max(hw, Math.min(W - hw, el.x)) + 'px'; b.style.top = Math.max(70, Math.min(H - 60, el.y)) + 'px';   // the whole line on screen
    } else if (r && r.width) {
      var right = r.left + r.width / 2 > W / 2;   // beside the dial, on the side with room
      b.classList.add(right ? 'r' : 'l');
      b.style.top = Math.max(60, Math.min(H - 60, r.top + r.height / 2)) + 'px';
      if (right) { b.style.right = Math.max(8, W - r.left + 10) + 'px'; b.style.left = 'auto'; } else { b.style.left = Math.min(W - 160, r.right + 10) + 'px'; b.style.right = 'auto'; }
    } else { b.classList.add('c'); b.style.right = 'auto'; b.style.left = '50%'; b.style.top = '40%'; }
    b.classList.add('on'); clearTimeout(labT); labT = setTimeout(function () { b.classList.remove('on'); }, ms || 2600);
  }
  function label(id, force) {
    var d = dials[id]; if (!d || !d.label) return false;
    if (!force && GJ.dialprefs && !GJ.dialprefs.labels()) return false;   // Tune → Dials → Labels off
    if (!force && (seen[id] || 0) >= 2) return false;
    seen[id] = (seen[id] || 0) + 1; try { GJ.settings.setItem(KEY, JSON.stringify(seen)); } catch (e) {}
    show(typeof d.label === 'function' ? d.label() : d.label, d.anchor ? d.anchor() : d.el, d.ms); return true;
  }
  function rest(id) { var d = dials[id]; if (!d) return; clearTimeout(d.t); d.t = 0; if (d.busy && d.busy()) { d.t = setTimeout(function () { rest(id); }, 700); return; } d.resting = true; if (d.onRest) d.onRest(); else (d.els || [d.el]).forEach(function (e) { e && e.classList.add('dk-rest'); }); }
  function wake(id) {
    var d = dials[id]; if (!d) return; clearTimeout(d.t); d.t = 0;
    if (d.resting) { d.resting = false; if (d.onWake) d.onWake(); else (d.els || [d.el]).forEach(function (e) { e && e.classList.remove('dk-rest'); }); }
    var ms = delay(); if (ms && !d.ownRest) d.t = setTimeout(function () { rest(id); }, ms);
  }
  function touch(id) { mark(); wake(id); return label(id); }   // a finger on a dial: awake, and named the first times
  function turn(id, on) {
    mark(); if (on) turning[id] = 1; else delete turning[id];
    var d = dials[id]; if (d) (d.els || [d.el]).forEach(function (e) { e && e.classList.toggle('dk-turning', !!on); });
    html.classList.toggle('dial-turning', Object.keys(turning).length > 0);
    if (!on) wake(id);
  }
  // id, { el | els, label, anchor(), onRest, onWake, ownRest (the dial keeps its own resting, e.g. the moon), busy(), reset() }
  function attach(id, o) { dials[id] = o; o.t = 0; o.resting = false; if (!o.ownRest) wake(id); return o; }
  /* oz 3 alt, after the intuitiveness review (B1): every kind of dial — the side dial, the edge dial, the red dot's
     pad, the crescent's rings, the finger ring, Mark II's arc — also shares
       · a visible snap: each step it lands on, the dial gives a short pulse (with the haptic tick it already had)
       · its value in one place: beside the dial (where its own plate or ring already shows it; value() for any that has none)
       · double-tap to reset: back to its default, said in that same place ("… · reset") */
  function els(id) { var d = dials[id]; return d ? (d.els || [d.el]).filter(Boolean) : []; }
  var snaps = {}, snapN = {};
  function snap(id) {
    snapN[id] = (snapN[id] || 0) + 1; mark();
    var how = GJ.dialprefs ? GJ.dialprefs.snap() : 'soft'; if (how === 'off') return;   // Tune → Dials → Snap: off · soft · firm
    els(id).forEach(function (e) { e.classList.remove('dk-snap', 'dk-firm'); void e.offsetWidth; e.classList.add('dk-snap'); if (how === 'firm') e.classList.add('dk-firm'); });
    if (how === 'firm' && GJ.haptic) GJ.haptic.commit();
    clearTimeout(snaps[id]); snaps[id] = setTimeout(function () { els(id).forEach(function (e) { e.classList.remove('dk-snap', 'dk-firm'); }); }, how === 'firm' ? 320 : 200);
  }
  function value(id, text, ms) { var d = dials[id]; if (!d) return; show(text, d.anchor ? d.anchor() : (d.els ? d.els[0] : d.el), ms || 1600); }
  function reset(id, name) {
    var d = dials[id]; if (!d) return false;
    mark(); if (d.reset) d.reset(name);
    if (GJ.haptic) GJ.haptic.commit(); snap(id);
    if (!d.quietReset) value(id, (name || (typeof d.name === 'function' ? d.name() : d.name) || id) + ' · reset', 1400);
    return true;
  }
  // a double-tap detector for a dial that has none of its own: two taps, 320 ms apart, within 24 px
  function doubleTap(id, el, fn) {
    var last = null;
    el.addEventListener('pointerup', function (e) {
      var t = GJ.now ? GJ.now() : Date.now();
      if (last && t - last.t < 320 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 24) { last = null; (fn || function () { reset(id); })(e); return; }
      last = { t: t, x: e.clientX, y: e.clientY };
    });
  }
  GJ.dialkit = { attach: attach, touch: touch, label: label, turn: turn, rest: rest, wake: wake, delay: delay, say: show,
    snap: snap, value: value, reset: reset, doubleTap: doubleTap, busy: busy, snaps: function (id) { return snapN[id] || 0; },
    resting: function (id) { return !!(dials[id] && dials[id].resting); }, turning: function () { return Object.keys(turning); }, seen: function () { return JSON.parse(JSON.stringify(seen)); }, ids: function () { return Object.keys(dials); },
    forget: function () { seen = {}; try { GJ.settings.removeItem(KEY); } catch (e) {} } };
})(window);
