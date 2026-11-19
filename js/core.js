/* tools-02 · core: shared store (one red flag, one Full Safelight, timer, rev),
   the site's spring (sstep), ease(), haptics, reduced motion. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {};
  GJ.VERSION = 'safelight 3';   // the version line (see CHANGES-safelight-3.md); shown at the foot of Tune

  /* ---------- spring: site-3d's critically damped spring (sky.js S / sstep / aim) ---------- */
  var W_GLIDE = 4.8, W_LOOK = 9.5;
  function S(v, w) { return { x: v, v: 0, t: v, w: w || W_GLIDE }; }
  function sstep(s, dt) {
    var e = s.x - s.t, c = s.v + s.w * e, k = Math.exp(-s.w * dt);
    s.x = s.t + (e + c * dt) * k;
    s.v = (c - s.w * (e + c * dt)) * k;
    if (Math.abs(s.x - s.t) < 1e-5 && Math.abs(s.v) < 1e-5) { s.x = s.t; s.v = 0; }
    return s.x;
  }
  function aim(s, t, instant) {
    s.t = t;
    // site: reduced motion or `instant` → w = 40 and copy the target
    if (instant || GJ.reduced()) { s.x = t; s.v = 0; }
  }
  function settled(s) { return s.x === s.t && s.v === 0; }
  // cubic ease-in-out, sky.js L70
  function ease(u) { u = Math.max(0, Math.min(1, u)); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function smooth(a, b, v) { v = Math.max(0, Math.min(1, (v - a) / (b - a))); return v * v * (3 - 2 * v); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- reduced motion: system setting, or Tune override ---------- */
  var mq = G.matchMedia ? G.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  GJ.reduced = function () {
    var o = GJ.store ? GJ.store.get().reduce : 'auto';
    return o === 'on' ? true : o === 'off' ? false : !!mq.matches;
  };

  /* ---------- haptics: tick / commit / edge. Silent where the platform cannot. ---------- */
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} GJ.hapticLog && GJ.hapticLog.push(p); }
  GJ.haptic = { tick: function () { buzz(6); }, commit: function () { buzz(14); }, edge: function () { buzz([3, 40, 3]); },
    alarm: function () { buzz([320, 140, 320, 140, 700]); } };   // the timer's end (silent where the platform cannot vibrate)

  /* ---------- the shared Master store ---------- */
  var KEY = 'gj-safelight-02';
  var DEF = {
    rev: 0,
    red: false,            // red mode — one flag for the Safelight app, every tool and the watch
    tone: 2,               // index into TONES (the red mode tool's outer ring)
    density: 1,            // sky ring: share of the site's dust counts drawn (.3–1)
    ambience: .5,          // Tune: the site's mood (moodK = (a − .5) × 2)
    atmos: 1,              // inner ring: atmosphere, 1 = living, 0 = fully still
    fog: 0,                // Tune: fog amount (1 full, .5 light, 0 off) — off by default: the site's sky is clear
    chime: true,           // (older builds) the end cue
    alert: 'sound',        // the timer's end: 'sound' (alarm + vibration) or 'silent' (vibration + the lamp)
    tilt: true,
    hub: 'field',          // the hub: 'field' (the site's staggered chapters) or 'star' (the radial: the Mark at the centre)            // 3D tilt: the phone's own tilt turns the sky
    moon: true,            // Tune: the moon (site toggle gj-tog-moon)
    moonMode: 'crescent',  // 'crescent' (the site's) or 'phase' (tonight's real phase)
    reflect: true,         // Tune: reflections on the water (site gj-tog-reflect)
    ripples: true,         // Tune: ripples
    timer: { setMs: 25 * 60000, running: false, endAt: 0, remainMs: 25 * 60000 },
    room: null,            // last open room id
    city: 'vancouver',
    photo: 'stay-gold-hero',
    reduce: 'auto',
    dialRest: 'full',      // the dial untouched: 'full' stays as it is · 'slip' hairline + dot · 'tick' the value · 'rest' a thin slider
    // choices made in Tune that were set but never restored (load() keeps only the keys named here): now kept between visits
    markMode: 'a',         // the Mark's way: a play · b steps · c compass
    wnBlend: 1, wnWarm: .35, wnLevel: .5,   // White Noise (the Sound room): where the blend sits (0 white · 1 pink · 2 brown · 3 yours), warmth (a filter on the sound), level
    byDepth: 'far', byDrift: 'slow', byEase: 'fold', byMove: 'dolly',   // Beyond's own camera: depth far · mid · close, drift off · slow · easy, easing fold · cubic · smooth · push, move dolly · orbit
    byRead: '', byColour: .12, byLight: .3,   // Beyond in the archive (briefs/BEYOND-DIAL.md): the reading ('' · 'colour' · 'light'; red is red mode itself) and its place on each scale, 0–1
    clock: '12',           // the clock, everywhere a time of day is shown (Golden Hour, the hub's lines, the slate): '12' hour with am / pm, or '24' (Tune → Golden hour → Clock)
    slateLight: .86, slateGlow: .5, slateShows: 0, slateSize: 1,   // the slate (the timer's readout): its light, its glow, what it shows (0 timer · 1 + time, sunset · 2 + ends, next light), its size (0 small · 1 mid · 2 large)
    fullSafe: false,       // Full Safelight (the second step beyond red mode)
    photoRed: true,        // photos in Full Safelight: shown black/white/red (display only) or true colour
    redLight: 1,           // the master dimmer / the red dot's lightness
    sunUp: 'heading',      // Golden Hour's sun chart: 'heading' up or 'north' up
    wxlive: true,          // live weather on the sky
    watch: 'unpaired'
  };
  // red mode tones: site inks only (#FF4457 crimson, #FFB0B8 rose) at different lamp strengths
  var TONES = [
    { id: 'dim',     name: 'dim',     ink: '#FF4457', lamp: .35 },
    { id: 'rose',    name: 'rose',    ink: '#FFB0B8', lamp: .55 },
    { id: 'crimson', name: 'crimson', ink: '#FF4457', lamp: .80 },
    { id: 'bright',  name: 'bright',  ink: '#FF4457', lamp: 1.0 }
  ];
  var state = load(), subs = [], chan = null;
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    var out = JSON.parse(JSON.stringify(DEF));
    if (s && typeof s === 'object') for (var k in s) if (k in out) out[k] = s[k];
    return out;
  }
  try { chan = new BroadcastChannel(KEY); chan.onmessage = function (m) { adopt(m.data); }; } catch (e) {}
  G.addEventListener('storage', function (e) { if (e.key === KEY && e.newValue) { try { adopt(JSON.parse(e.newValue)); } catch (x) {} } });
  function adopt(s) {
    if (!s || s.rev <= state.rev) return;     // rev says who is newer
    var prev = state; state = s; emit(prev);
  }
  function emit(prev) { subs.forEach(function (f) { f(state, prev); }); }
  function set(patch) {
    var prev = state, next = JSON.parse(JSON.stringify(state));
    for (var k in patch) next[k] = patch[k];
    next.rev = state.rev + 1;
    state = next;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    try { chan && chan.postMessage(state); } catch (e) {}
    emit(prev);
  }

  /* ---------- timer helpers (one timer, shared) ---------- */
  function remaining(t, now) {
    t = t || state.timer; now = now || Date.now();
    return t.running ? Math.max(0, t.endAt - now) : t.remainMs;
  }
  var timer = {
    remaining: remaining,
    start: function () { var r = remaining(); if (r <= 0) r = state.timer.setMs; set({ timer: { setMs: state.timer.setMs, running: true, endAt: Date.now() + r, remainMs: r } }); },
    pause: function () { var r = remaining(); set({ timer: { setMs: state.timer.setMs, running: false, endAt: 0, remainMs: r } }); },
    toggle: function () { state.timer.running ? timer.pause() : timer.start(); },
    stop: function () { set({ timer: { setMs: state.timer.setMs, running: false, endAt: 0, remainMs: state.timer.setMs } }); },
    // the outer ring writes the time; a running timer keeps running with the new remaining
    setTo: function (ms) {
      var t = state.timer;
      if (t.running) set({ timer: { setMs: ms, running: true, endAt: Date.now() + ms, remainMs: ms } });
      else set({ timer: { setMs: ms, running: false, endAt: 0, remainMs: ms } });
    },
    // red mode turns itself off when the time runs out
    expire: function () {
      set({ timer: { setMs: state.timer.setMs, running: false, endAt: 0, remainMs: state.timer.setMs }, red: false });
    }
  };
  function fmtMs(ms) {
    var s = Math.ceil(ms / 1000), m = Math.floor(s / 60); s = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  GJ.store = { get: function () { return state; }, set: set, on: function (f) { subs.push(f); }, KEY: KEY };
  GJ.TONES = TONES;
  GJ.timer = timer;
  GJ.fmtMs = fmtMs;
  GJ.S = S; GJ.sstep = sstep; GJ.aim = aim; GJ.settled = settled; GJ.ease = ease; GJ.smooth = smooth; GJ.clamp = clamp;
  GJ.W_GLIDE = W_GLIDE; GJ.W_LOOK = W_LOOK;
  GJ.now = function () { return (G.performance ? performance.now() : Date.now()); };
})(this);
