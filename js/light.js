/* Safelight · the light. A button beside the red-mode dot.
   1) The phone's torch, where the browser allows it (Android Chrome: getUserMedia + torch). A web page can only switch a
      torch on or off — it cannot dim it — so the torch is a plain on/off.
   2) Everywhere else (iPhone Safari, a sandboxed preview), a light on the screen: a soft round glow, dim by default, with two
      dials — SIZE (outer) and BRIGHTNESS (inner). Moon-white at night (#f3ecdf); in red mode it is the red lamp.
   While a light is on, the screen is kept awake where the browser allows it. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var on = false, mode = null, track = null, wake = null, size = .45, bright = .35;
  var fx = $('lightfx'), btn = $('lightbtn');

  function paint() {
    if (!on || mode !== 'screen') { fx.style.opacity = '0'; return; }
    var red = store.get().red, H = G.innerHeight, W = G.innerWidth, D = Math.hypot(W, H);
    var r = Math.round(40 + size * D * .62), col = red ? '255,68,87' : '243,236,223', a = .12 + bright * .88;
    fx.style.background = 'radial-gradient(circle at 50% 46%, rgba(' + col + ',' + a.toFixed(3) + ') 0, rgba(' + col + ',' + (a * .92).toFixed(3) + ') ' + Math.round(r * .55) + 'px, rgba(' + col + ',' + (a * .35).toFixed(3) + ') ' + Math.round(r * .85) + 'px, rgba(' + col + ',0) ' + r + 'px)';
    fx.style.opacity = '1';
  }
  var SIZE = { key: 'lsize', label: 'SIZE', min: 0, max: 1, def: .45, span: 220, unit: .05,
    get: function () { return size; }, set: function (v) { size = v; paint(); }, fmt: function (v) { return Math.round(v * 100) + '%'; } };
  var BRIGHT = { key: 'lbright', label: 'BRIGHTNESS', min: 0, max: 1, def: .35, span: 220, unit: .05,
    get: function () { return bright; }, set: function (v) { bright = v; paint(); }, fmt: function (v) { return Math.round(v * 100) + '%'; } };

  function keepAwake() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }, function () {}); } catch (e) {} }
  function letSleep() { try { wake && wake.release(); } catch (e) {} wake = null; }

  function torch() {   // resolves true if the phone's torch came on
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(false);
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) {
        var t = s.getVideoTracks()[0], caps = t && t.getCapabilities ? t.getCapabilities() : {};
        if (!caps.torch) { s.getTracks().forEach(function (k) { k.stop(); }); return false; }
        return t.applyConstraints({ advanced: [{ torch: true }] }).then(function () { track = t; return true; }, function () { s.getTracks().forEach(function (k) { k.stop(); }); return false; });
      }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }
  function lightOn() {
    on = true; btn.classList.add('on'); keepAwake(); GJ.haptic.commit();
    torch().then(function (ok) {
      if (!on) { if (ok) { track.stop(); track = null; } return; }
      mode = ok ? 'torch' : 'screen'; paint();
      if (mode === 'screen') GJ.dial.pop([SIZE, BRIGHT]);
      note(ok ? 'phone light on — a web page can only switch it on or off' : 'screen light · slide the dials for size and brightness');
    });
  }
  function lightOff() {
    on = false; btn.classList.remove('on');
    if (track) { try { track.applyConstraints({ advanced: [{ torch: false }] }); } catch (e) {} track.stop(); track = null; }
    mode = null; paint(); letSleep(); if (GJ.dial.popped()) GJ.dial.close(); GJ.haptic.tick();
  }
  function note(t) { var n = $('lightnote'); n.textContent = t; n.classList.add('on'); clearTimeout(note.t); note.t = setTimeout(function () { n.classList.remove('on'); }, 3200); }

  // tap: on / off. Hold (550 ms, the site's hold): the light's dials come back while it is on
  var hold = null;
  btn.addEventListener('pointerdown', function (e) {
    e.preventDefault(); hold = { fired: false, x: e.clientX, y: e.clientY };
    hold.t = setTimeout(function () { hold.fired = true; if (on && mode === 'screen') { GJ.dial.pop([SIZE, BRIGHT]); GJ.haptic.commit(); } }, 550);
  });
  btn.addEventListener('pointerup', function () { var h = hold; hold = null; if (!h) return; clearTimeout(h.t); if (h.fired) return; on ? lightOff() : lightOn(); });
  btn.addEventListener('pointercancel', function () { if (hold) clearTimeout(hold.t); hold = null; });
  store.on(function () { paint(); });
  G.addEventListener('resize', paint);
  document.addEventListener('visibilitychange', function () { if (on && document.visibilityState === 'visible') keepAwake(); });

  GJ.light = { state: function () { return { on: on, mode: mode, size: size, bright: bright, opacity: fx.style.opacity }; }, on: lightOn, off: lightOff };
})(this);
