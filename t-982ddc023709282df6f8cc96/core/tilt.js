/* tools-02 · 3D tilt: the phone's own tilt turns the sky — the constellations yaw and pitch in depth,
   the dust layers slide at their parallax, like holding a window onto the night.
   Relative to how you hold it: the rest pose drifts back slowly (about 5 s), so it never needs calibrating.
   iOS asks permission on a tap; where the page can't read motion (some embedded viewers), Tune says "blocked". */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store;
  var raw = null, base = null, out = { x: 0, y: 0 }, got = 0, asked = false, wasOn = true;
  var T = GJ.tilt = { blocked: false, live: false };
  function on(e) {
    if (e.beta == null || e.gamma == null) return;
    // landscape: swap the axes so "left/right" stays left/right on screen
    var ang = (screen.orientation && screen.orientation.angle) || G.orientation || 0, b = e.beta, gm = e.gamma;
    if (ang === 90) { var t = b; b = -gm; gm = t; } else if (ang === -90 || ang === 270) { var t2 = b; b = gm; gm = -t2; }
    raw = { b: b, g: gm }; got = GJ.now(); T.live = true; T.blocked = false;
    // which way the phone faces (for the sun chart): iOS gives a compass heading; elsewhere an absolute alpha
    if (e.webkitCompassHeading != null && !isNaN(e.webkitCompassHeading)) T.heading = e.webkitCompassHeading;
    else if (e.absolute && e.alpha != null) T.heading = (360 - e.alpha) % 360;
    if (!base) base = { b: b, g: gm };
  }
  function listen() { G.addEventListener('deviceorientation', on); G.addEventListener('deviceorientationabsolute', on); }
  T.ask = function () {
    asked = true;
    var DOE = G.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(function (r) { if (r === 'granted') listen(); else T.blocked = true; refresh(); })
        .catch(function () { T.blocked = true; refresh(); });
    } else listen();
    // nothing arrives in 2 s: this viewer doesn't pass motion through
    setTimeout(function () { if (!T.live) { T.blocked = true; refresh(); } }, 2000);
  };
  function refresh() { store.set({ rev: store.get().rev }); }
  T.read = function (dt) {
    if (T.paused) return out;   // oz next 9: the sky's tilt holds still while the Moon dial's crescent is held for Lean
    var onNow = store.get().tilt !== false && !GJ.reduced();
    if (onNow && !wasOn && raw) base = { b: raw.b, g: raw.g };   // turned on: the way you hold it now is level
    wasOn = onNow;
    if (store.get().tilt === false || GJ.reduced() || !raw) { out.x = 0; out.y = 0; return out; }   // off is off: the look's own spring eases it back
    // the rest pose follows you, slowly
    var k = 1 - Math.exp(-dt / 5);
    base.b += (raw.b - base.b) * k; base.g += (raw.g - base.g) * k;
    var dx = (raw.g - base.g) / 28, dy = (raw.b - base.b) / 34;
    out.x = Math.max(-.9, Math.min(.9, dx)); out.y = Math.max(-.4, Math.min(.4, dy));
    return out;
  };
  T._feed = function (b, g, hd) { on({ beta: b, gamma: g, webkitCompassHeading: hd }); };   // tests
  T.heading = null;
  // Android / desktop: no permission needed. iOS: the first tap anywhere asks, once.
  if (!(G.DeviceOrientationEvent && typeof G.DeviceOrientationEvent.requestPermission === 'function')) listen();
  document.addEventListener('pointerup', function first() {
    if (asked || store.get().tilt === false) return;
    document.removeEventListener('pointerup', first, true);
    if (G.DeviceOrientationEvent && typeof G.DeviceOrientationEvent.requestPermission === 'function') T.ask();
  }, true);
})(window);
