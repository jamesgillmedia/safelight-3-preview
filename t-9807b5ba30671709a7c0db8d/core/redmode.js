/* oz core · red mode, the one-tap tool (oz 3 alt: split out of app.js unchanged, so every app on the oz core has it —
   the main app and Good Weather alike). Red mode stays one tap on the dot.
     GJ.redmode.apply(state) ... the page, the red ink at the tone's lamp strength, the sky's mode (called by the shell on
                                 every store change; returns the tone)
     the dot (#disc) ........... tap: red mode on / off · hold: its own pad (redpad.js: colour up / down, lightness left /
                                 right) · swipe down / up: dimmer / brighter · double-tap: full crimson, a reset
   The light beside the dot is light.js; the dot's pad is redpad.js. Photos are never tinted by any of it. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp, html = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  function hexRGB(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function apply(s) {
    var sky = GJ.sky;
    html.classList.toggle('red', !!s.red);
    if (s.red) html.setAttribute('data-gj-c', 'red'); else html.removeAttribute('data-gj-c');   // the camera dial module's red hook
    var tone = GJ.TONES[s.tone] || GJ.TONES[2];
    // the lamp strength sets how bright the red ink sits on the #060304 page
    var a = hexRGB(tone.ink), bg = [6, 3, 4], k = .35 + .65 * tone.lamp;
    var ink = 'rgb(' + a.map(function (v, i) { return Math.round(bg[i] + (v - bg[i]) * k); }).join(',') + ')';
    html.style.setProperty('--red-ink', ink);
    html.style.setProperty('--lamp', tone.lamp);
    if (sky) { sky.mode = s.red ? 'red' : 'night'; sky.toneInk = tone.ink; sky.lamp = tone.lamp; }
    return tone;
  }
  /* ---------- the red-mode disc: one tap ---------- */
  (function () {
    var d = $('disc'), hold = null, ignoreUntil = 0;
    d.addEventListener('pointerdown', function (e) {
      e.preventDefault(); ignoreUntil = 0; try { d.setPointerCapture(e.pointerId); } catch (x) {}
      hold = { x: e.clientX, y: e.clientY, fired: false };
      hold.t = setTimeout(function () {   // the site's 550 ms hold (chrome.js), now: the red dot's own dial grows out of it
        hold.fired = true; ignoreUntil = GJ.now() + 1500;
        // (Gill, 18 Nov 22:04: the dot dial "loses some of the function it had before… it just doesn't feel like those tools belong in
        // the safelight mark") the dot keeps its own pad: colour up / down, lightness left / right. Mark II (mark2.js) is parked.
        if (!store.get().red) store.set({ red: true });
        GJ.redpad.start(hold.x, hold.y); GJ.haptic.commit();
      }, 550);
    });
    d.addEventListener('pointermove', function (e) {
      if (hold && hold.fired) { GJ.redpad.move(e.clientX, e.clientY); return; }   // the same finger: up / down colour, left / right lightness
      if (hold && !hold.swipe && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) { clearTimeout(hold.t); hold.swipe = true; }
    });
    var lastTap = 0;
    d.addEventListener('pointerup', function (e) {
      var h = hold; if (h) clearTimeout(h.t); hold = null;
      if (h && h.fired) { GJ.redpad.end(); return; }
      if (h && h.swipe) {   // swipe down: dimmer (a fifth at a time) · swipe up: brighter — red mode comes on if it was off
        var dy = e.clientY - h.y; if (Math.abs(dy) < 28) return;
        var l = store.get().redLight == null ? 1 : store.get().redLight, nl = clamp(Math.round((l + (dy > 0 ? -.2 : .2)) * 100) / 100, .08, 1);
        store.set({ red: true, redLight: nl }); GJ.haptic.tick(); if (GJ.mark) GJ.mark.say('red · ' + Math.round(nl * 100) + '%', 1200); return;
      }
      if (h && GJ.now() - lastTap < 320) {   // double-tap: red mode, at full light, the house tone — a reset
        lastTap = 0; store.set({ red: true, redLight: 1, tone: 2 }); GJ.haptic.commit(); if (GJ.mark) GJ.mark.say('red · full · crimson', 1200); return;
      }
      if (h) lastTap = GJ.now();
      if (!h || GJ.now() < ignoreUntil) return;
      if (GJ.redpad.open()) { GJ.redpad.hide(); GJ.haptic.tick(); return; }
      if (GJ.dial.popped() && !document.documentElement.classList.contains('mapping')) { GJ.dial.close(); GJ.haptic.tick(); return; }   // (19 Nov) over the Map its dial stays out, so the dot goes straight to red mode: one tap
      store.set({ red: !store.get().red }); GJ.haptic.tick();
    });
    d.addEventListener('pointercancel', function () { if (hold) { clearTimeout(hold.t); if (hold.fired) GJ.redpad.end(); } hold = null; });
  })();

  GJ.redmode = { apply: apply, on: function () { return !!store.get().red; }, toggle: function () { store.set({ red: !store.get().red }); } };
})(window);
