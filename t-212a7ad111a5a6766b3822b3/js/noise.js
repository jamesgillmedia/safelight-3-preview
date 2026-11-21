/* tools-02 · White Noise (briefs/WHITE-NOISE.md, Gill 18 Nov: first in "a big batch of the new features").
   A calm, endless bed in the Sound room: white, pink and brown noise, and — once you open one — your own recording as a
   fourth source. The dial blends between them (BLEND ⇅ LEVEL); the inner ring is WARMTH, a filter on the sound only; hold
   the dial to fade to silence, hold again to bring it back. Timers: 15 · 30 · 60 minutes, or until stopped, with a slow
   fade out. It keeps playing as you move about the app; the Sound room's own dials come back when this one folds away.
   Endless: each bed is two loops of different lengths (so the pair only lines up again after about a minute) whose seams
   are crossfaded into themselves, and each loop's level wanders a little on its own slow path — nothing in it repeats
   that an ear can find. Made here, on the device, from nothing but random numbers; your own recording never leaves it.
   Optional (off): "sky" lets the bed follow the hour and the weather a little — warmer and softer after dark, lower in
   the rain. Not here yet (the brief): room-tone capture (the microphone is closed in this preview) and bundled field
   recordings (there are none in the pack: every source is generated, or yours). */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp;
  var room = document.getElementById('r-player'); if (!room) return;
  var NAMES = ['white', 'pink', 'brown'], LENS = [6.1, 9.7];   // seconds: two loops a bed
  var ac = null, out = null, lp = null, tap = null, bins = null, beds = [], own = null, ownName = '';
  var on = false, faded = false, endAt = 0, mins = 0, endT = 0, follow = false, skyK = { warm: 0, level: 1, blend: 0 };

  /* ---------- the sources ---------- */
  function seam(d, sr) {   // fold the tail into the head, so the loop has no edge
    var n = Math.min(d.length >> 2, Math.round(sr * .08)), L = d.length - n;
    for (var i = 0; i < n; i++) { var u = i / n, a = Math.sin(u * Math.PI / 2), b = Math.cos(u * Math.PI / 2); d[i] = d[i] * a + d[L + i] * b; }
    return L;   // the loop is the first L samples
  }
  function make(kind, secs) {
    var sr = ac.sampleRate, n = Math.round(secs * sr), d = new Float32Array(n), i, w, peak = 0;
    if (kind === 0) for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    else if (kind === 1) {   // pink: Paul Kellet's filter on white (−3 dB an octave)
      var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (i = 0; i < n; i++) { w = Math.random() * 2 - 1;
        b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
        d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362; b6 = w * .115926; }
    } else { var last = 0; for (i = 0; i < n; i++) { w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last; } }   // brown: a leaky sum of white (−6 dB an octave)
    var L = seam(d, sr), rms = 0; for (i = 0; i < L; i++) rms += d[i] * d[i]; rms = Math.sqrt(rms / L) || 1;
    var k = .11 / rms; for (i = 0; i < L; i++) { d[i] *= k; if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]); }   // every bed at the same loudness
    var buf = ac.createBuffer(1, L, sr); buf.getChannelData(0).set(d.subarray(0, L)); buf._edge = Math.abs(d[0] - d[L - 1]); buf._step = step(d, L);
    return buf;
  }
  function step(d, L) { var s = 0, m = Math.min(L - 1, 4000); for (var i = 0; i < m; i++) s += Math.abs(d[i + 1] - d[i]); return s / m; }
  function loop(buf, pan) {
    var s = ac.createBufferSource(), g = ac.createGain(), p = ac.createStereoPanner ? ac.createStereoPanner() : null;
    s.buffer = buf; s.loop = true; s.connect(g); if (p) { p.pan.value = pan; g.connect(p); } s.start(0, Math.random() * buf.duration);
    return { src: s, g: g, outNode: p || g, ph: Math.random() * 6.283, sp: .035 + Math.random() * .04 };
  }
  function bed(kind, bufs) {   // one source: its loops, into its own gain
    var g = ac.createGain(); g.gain.value = 0; g.connect(lp);
    var ls = bufs.map(function (b, j) { var l = loop(b, j ? .35 : -.35); l.outNode.connect(g); return l; });
    return { g: g, loops: ls, name: NAMES[kind] || ownName };
  }
  function build() {
    ac = GJ.audio && GJ.audio.ctx(); if (!ac) return false;
    if (out) return true;
    out = ac.createGain(); out.gain.value = 0; lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .4;
    tap = ac.createAnalyser(); tap.fftSize = 1024; tap.smoothingTimeConstant = .6; bins = new Uint8Array(tap.frequencyBinCount);
    lp.connect(out); out.connect(tap); out.connect(ac.destination);
    return true;
  }
  function start() { if (beds.length) return; for (var k = 0; k < 3; k++) beds.push(bed(k, LENS.map(function (s) { return make(k, s); }))); if (own) beds.push(bed(3, [own])); }
  function stop() { beds.forEach(function (b) { b.loops.forEach(function (l) { try { l.src.stop(); } catch (e) {} }); try { b.g.disconnect(); } catch (e) {} }); beds = []; }

  /* ---------- the mix ---------- */
  function S() { var s = store.get(); return { blend: typeof s.wnBlend === 'number' ? s.wnBlend : 1, warm: typeof s.wnWarm === 'number' ? s.wnWarm : .35, level: typeof s.wnLevel === 'number' ? s.wnLevel : .5 }; }
  function count() { return own ? 4 : 3; }
  function pos() { return clamp(S().blend + (follow ? skyK.blend : 0), 0, count() - 1); }
  function nameAt(v) { var i = Math.round(v), a = Math.floor(v + 1e-6), nm = function (k) { return k < 3 ? NAMES[k] : (ownName || 'yours'); }; return Math.abs(v - i) < .12 ? nm(i) : nm(a) + ' · ' + nm(a + 1); }
  function mix(t) {
    if (!out) return; var v = pos(), w = clamp(S().warm + (follow ? skyK.warm : 0), 0, 1), now = ac.currentTime, tc = t == null ? .12 : t;
    beds.forEach(function (b, i) { b.g.gain.setTargetAtTime(Math.cos(clamp(Math.abs(v - i), 0, 1) * Math.PI / 2), now, tc); });   // equal power between neighbours
    lp.frequency.setTargetAtTime(18000 * Math.pow(350 / 18000, w), now, tc);                                                   // warmth: the top comes down, 18 kHz → 350 Hz
  }
  function level() { return on && !faded ? S().level * (follow ? skyK.level : 1) : 0; }
  function ramp(secs) { if (!out) return; var now = ac.currentTime; out.gain.cancelScheduledValues(now); out.gain.setValueAtTime(out.gain.value, now); out.gain.linearRampToValueAtTime(level() * level(), now + Math.max(.02, secs)); }   // squared: an even-feeling fader
  function setOn(v) {
    v = !!v; if (v === on) return on;
    if (v) { if (!build()) { say('no sound here'); return false; } start(); on = true; faded = false; mix(.01); ramp(1.2); timer(mins, true); }
    else { on = false; ramp(.9); clearTimeout(endT); endT = setTimeout(function () { if (!on) stop(); }, 1100); endAt = 0; }
    paint(); return on;
  }
  function fade() { if (!on) return; faded = !faded; ramp(faded ? 4 : 2); GJ.haptic.commit(); say(faded ? 'white noise · fading to silence · hold again to bring it back' : 'white noise · back'); paint(); }
  // a timer: minutes until it stops, with a slow fade over the last stretch (half a minute, or a quarter of a short one)
  function timer(m, quiet) {
    mins = m || 0; endAt = on && mins ? Date.now() + mins * 60000 : 0;
    if (!quiet) { GJ.haptic.tick(); say(mins ? 'white noise · ' + mins + ' min, then a slow fade' : 'white noise · until stopped'); }
    paint();
  }
  function tick() {
    if (on && out) {
      var t = ac.currentTime;
      beds.forEach(function (b) { b.loops.forEach(function (l) { l.g.gain.setTargetAtTime(.86 + .14 * Math.sin(t * l.sp + l.ph) * Math.sin(t * l.sp * .37 + l.ph * 2.1), ac.currentTime, .6); }); });   // each loop's level on its own slow path
      if (endAt) {
        var left = endAt - Date.now(), tail = Math.min(30000, mins * 60000 * .25);
        if (left <= 0) { setOn(false); say('white noise · done'); }
        else if (left < tail && !tick.fading) { tick.fading = true; var now = ac.currentTime; out.gain.cancelScheduledValues(now); out.gain.setValueAtTime(out.gain.value, now); out.gain.linearRampToValueAtTime(0, now + left / 1000); }
      } else tick.fading = false;
      if (follow) sky();
      paintSay();
    }
    setTimeout(tick, 500);
  }
  // follows the environment (optional): softer and warmer after dark, lower in rain — only a lean, never a different sound
  function sky() {
    var alt = GJ.sky && GJ.sky.golden ? GJ.sky.golden.sun.x : 30, wet = GJ.sky && GJ.sky.wxLook ? GJ.sky.wxLook.wet || 0 : 0;
    var k = { warm: alt < -6 ? .18 : alt < 0 ? .1 : 0, level: alt < 0 && alt > -6 ? .85 : 1, blend: wet * .5 };
    if (k.warm !== skyK.warm || k.level !== skyK.level || Math.abs(k.blend - skyK.blend) > .05) { skyK = k; mix(3); if (!tick.fading && !faded) ramp(3); }
  }

  /* ---------- the dial: BLEND ⇅ LEVEL outside, WARMTH inside; hold = fade ---------- */
  var pct = function (v) { return Math.round(v * 100) + '%'; };
  var BLEND = { key: 'wn-blend', label: 'BLEND', min: 0, max: 2, def: 1, span: 260, unit: .05,
    get: function () { return clamp(S().blend, 0, count() - 1); }, set: function (v) { store.set({ wnBlend: Math.round(v * 100) / 100 }); mix(); paintSay(); },
    notches: function () { var o = []; for (var i = 0; i < count(); i++) o.push(i); return o; },
    settle: function (v) { return Math.abs(v - Math.round(v)) < .08 ? Math.round(v) : v; }, fmt: function (v) { return nameAt(v); }, hold: function (d) { if (d) fade(); } };
  var LEVEL = { key: 'wn-level', label: 'LEVEL', min: 0, max: 1, def: .5, span: 220, unit: .05,
    get: function () { return S().level; }, set: function (v) { store.set({ wnLevel: Math.round(v * 100) / 100 }); if (!faded && !tick.fading) ramp(.08); paintSay(); }, fmt: pct, hold: function (d) { if (d) fade(); } };
  var WARM = { key: 'wn-warm', label: 'WARMTH', min: 0, max: 1, def: .35, span: 220, unit: .05,
    get: function () { return S().warm; }, set: function (v) { store.set({ wnWarm: Math.round(v * 100) / 100 }); mix(); paintSay(); }, notches: function () { return [.35]; }, fmt: function (v) { return v < .04 ? 'open' : pct(v); }, hold: function (d) { if (d) fade(); } };
  function dial() { BLEND.max = count() - 1; BLEND.alt = LEVEL; LEVEL.alt = BLEND; GJ.dial.pop([BLEND, WARM]); GJ.dial.raise(0); }

  /* ---------- in the Sound room: one word to start it, a line that says what it is, its timers ---------- */
  var el = document.createElement('div'); el.id = 'wn'; el.className = 'hit';
  el.innerHTML = '<button id="wn-go" type="button" aria-pressed="false">white noise</button>' +
    '<div id="wn-more"><button id="wn-say" type="button" aria-label="white noise: its dial"></button><span class="wn-t" role="group" aria-label="timer">' +
    '<button data-m="15">15</button><button data-m="30">30</button><button data-m="60">60</button><button data-m="0" aria-label="until stopped">∞</button></span>' +
    '<span class="wn-x"><button id="wn-own" type="button">+ yours</button><button id="wn-sky" type="button" aria-pressed="false">sky</button></span></div>';
  room.appendChild(el);
  var file = document.createElement('input'); file.type = 'file'; file.accept = 'audio/*'; file.hidden = true; room.appendChild(file);
  var q = function (s) { return el.querySelector(s); };
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 2400); }
  function paintSay() {
    var s = S(), left = endAt ? Math.max(0, Math.ceil((endAt - Date.now()) / 60000)) : 0;
    var t = nameAt(pos()) + ' · warmth ' + WARM.fmt(clamp(s.warm + (follow ? skyK.warm : 0), 0, 1)) + (faded ? ' · silent' : '') + (endAt ? ' · ' + left + ' min left' : '');
    if (q('#wn-say').textContent !== t) q('#wn-say').textContent = t;
  }
  function paint() {
    el.classList.toggle('on', on); q('#wn-go').setAttribute('aria-pressed', on ? 'true' : 'false'); q('#wn-go').textContent = on ? 'white noise · on' : 'white noise';
    [].forEach.call(el.querySelectorAll('.wn-t button'), function (b) { b.classList.toggle('on', +b.dataset.m === mins); });
    q('#wn-sky').classList.toggle('on', follow); q('#wn-sky').setAttribute('aria-pressed', follow ? 'true' : 'false'); q('#wn-own').textContent = own ? ownName : '+ yours';
    paintSay();
  }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.id === 'wn-go') { var v = setOn(!on); GJ.haptic.commit(); if (v) { dial(); say('white noise · turn the dial to blend · hold it to fade'); } else if (GJ.dial.popped()) GJ.dial.close(); }
    else if (b.id === 'wn-say') dial();
    else if (b.dataset.m != null) timer(+b.dataset.m);
    else if (b.id === 'wn-own') file.click();
    else if (b.id === 'wn-sky') { follow = !follow; if (!follow) skyK = { warm: 0, level: 1, blend: 0 }; else sky(); mix(2); if (on && !faded) ramp(2); GJ.haptic.tick(); say(follow ? 'white noise · follows the hour and the weather, a little' : 'white noise · as you set it'); paint(); }
  });
  // your own recording: decoded here, its ends folded into each other, the fourth place on the dial
  function addOwn(buf, name) {
    var sr = buf.sampleRate, d = new Float32Array(buf.getChannelData(0)), L = seam(d, sr), b2 = ac.createBuffer(1, L, sr); b2.getChannelData(0).set(d.subarray(0, L));
    own = b2; ownName = (name || 'yours').replace(/\.[^.]+$/, '').toLowerCase().slice(0, 18) || 'yours';
    if (on) { if (beds[3]) { beds[3].loops.forEach(function (l) { try { l.src.stop(); } catch (e) {} }); beds.pop(); } beds.push(bed(3, [own])); }
    store.set({ wnBlend: 3 }); mix(); paint(); if (GJ.dial.popped()) dial(); say('white noise · ' + ownName + ' is on the dial, after brown');
  }
  file.addEventListener('change', function () {
    var f = file.files && file.files[0]; if (!f || !build()) return;
    f.arrayBuffer().then(function (a) { return new Promise(function (ok, no) { ac.decodeAudioData(a, ok, no); }); }).then(function (buf) { addOwn(buf, f.name); }, function () { say('that file would not open as sound'); });
    file.value = '';
  });
  // the mix follows the store, whoever turned it: the dial, Tune, another tab
  store.on(function (n2, prev) { if (!prev || !out) return; if (n2.wnBlend !== prev.wnBlend || n2.wnWarm !== prev.wnWarm) { mix(); paintSay(); } if (n2.wnLevel !== prev.wnLevel && on && !faded && !tick.fading) ramp(.08); });
  paint(); tick();

  function bands() {   // QA: how much of the sound sits low, and how much high (0–1 each)
    if (!tap) return null; tap.getByteFrequencyData(bins); var lo = 0, hi = 0, n = bins.length, a = Math.round(n * .01), b = Math.round(n * .08), c = Math.round(n * .3), d = Math.round(n * .8), i;
    for (i = a; i < b; i++) lo += bins[i]; for (i = c; i < d; i++) hi += bins[i]; return [lo / (b - a) / 255, hi / (d - c) / 255];
  }
  GJ.noise = { on: setOn, fade: fade, timer: timer, dial: dial, addOwn: function (buf, name) { if (build()) addOwn(buf, name); },
    state: function () { return { on: on, faded: faded, mins: mins, left: endAt ? endAt - Date.now() : 0, name: nameAt(pos()), sources: count(), follow: follow, blend: S().blend, warm: S().warm, level: S().level, out: out ? out.gain.value : 0, beds: beds.map(function (b) { return +b.g.gain.value.toFixed(3); }), cut: lp ? Math.round(lp.frequency.value) : 0 }; },
    bands: bands, seams: function () { return beds.slice(0, 3).map(function (b) { return b.loops.map(function (l) { return +(l.src.buffer._edge / l.src.buffer._step).toFixed(2); }); }); } };
})(window);
