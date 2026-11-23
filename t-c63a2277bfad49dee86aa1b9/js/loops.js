/* oz · loops — a loop recorder and visualizer.
   RECORDING
   · Mic when the page may use it (served from your own machine, or a native shell). In a sandboxed preview the mic is
     blocked, so `record` opens the phone's own recorder through the capture sheet; only the sound is kept.
   · Free length (default): the first take runs until you tap again (≤ 30 s) and sets the loop.
     Bars: set TEMPO and BARS on the dials; a one-bar count-in clicks, then the take records exactly that many bars.
   · Every later take records exactly one loop, starting where the loop is, and lands in time — shifted earlier by the
     device's measured latency so it sits where you played it.
   TAKES  each take is a star. Tap: mute. Hold: reverse · solo · delete. `undo` removes the last take.
   MIX    the rail scrubs the takes (all → one forward, the others eased back). Dials: VOLUME ⇅ TEMPO, TAKE ⇅ BARS.
   KEEP   takes are saved in this browser (IndexedDB) and come back next time; `save loop` exports a WAV of the mix.
   No site audio and no unreleased audio ships with this. */
(function (G) {
  'use strict';
  var GJ = G.GJ, sky = GJ.sky, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };

  var ac = null, master = null, an = null, fbin = null, tbin = null;
  var layers = [], loopLen = 0, startT = 0, playing = false, rec = null, focus = 0, vol = .8, note = '', noteT = 0;
  var bpm = 90, bars = 0, click = 'count-in', clickNodes = [];   // bars 0 = free length
  var MAXLEN = 30, BARS = [0, 1, 2, 4, 8];

  function ctx() {
    if (!ac) {
      var AC = G.AudioContext || G.webkitAudioContext; if (!AC) return null;
      ac = new AC(); master = ac.createGain(); master.gain.value = vol;
      an = ac.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = .82;
      master.connect(an); an.connect(ac.destination);
      fbin = new Uint8Array(an.frequencyBinCount); tbin = new Uint8Array(an.fftSize);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  GJ.audio = { ctx: ctx };
  function say(t) { note = t; noteT = GJ.now(); $('lp-note').textContent = t; $('lp-note').classList.add('on'); }
  function latency() { return ac ? (ac.outputLatency || 0) + (ac.baseLatency || 0) + .012 : 0; }

  /* ---------- layers ---------- */
  function fit(buf, phase) {
    var sr = ac.sampleRate, L = Math.max(1, Math.round(loopLen * sr)), chs = Math.min(2, buf.numberOfChannels || 1);
    var out = ac.createBuffer(chs, L, sr), rot = ((Math.round((phase || 0) * sr) % L) + L) % L;
    var srcRate = buf.sampleRate || sr, k = srcRate / sr;
    for (var c = 0; c < chs; c++) {
      var src = buf.getChannelData(Math.min(c, buf.numberOfChannels - 1)), dst = out.getChannelData(c), n = src.length;
      for (var i = 0; i < L; i++) dst[(i + rot) % L] = src[Math.floor(i * k) % n];
      var f = Math.min(Math.round(sr * .008), L >> 2);
      for (var j = 0; j < f; j++) { var q = j / f; dst[(rot + j) % L] *= q; dst[(rot + L - 1 - j) % L] *= q; }
    }
    return out;
  }
  function phaseNow() { return playing && loopLen ? ((ac.currentTime - startT) % loopLen + loopLen) % loopLen : 0; }
  function startLayer(l) { var s = ac.createBufferSource(); s.buffer = l.buf; s.loop = true; s.connect(l.gain); s.start(0, phaseNow()); l.src = s; }
  function mkLayer(buf, name) {
    var g = ac.createGain(), out = ac.createGain(), pn = ac.createStereoPanner ? ac.createStereoPanner() : null;
    if (pn) { out.connect(pn); pn.connect(master); } else out.connect(master);
    g.connect(out);
    return { buf: buf, gain: g, out: out, pan: pn, src: null, name: name, vol: 1, mute: false, born: GJ.now(), rev: false, type: guessType(name), fx: 'none', amt: .5, pv: 0, fxn: [] };
  }
  /* ---------- tracks (Gill, 17 Nov: "track sliders, tracks with effects, track types"): every take is a track with
     a type, a level slider, a pan, and one effect with its amount — in the mixer sheet (`tracks`) ---------- */
  var TYPES = ['voice', 'guitar', 'keys', 'drums', 'bass', 'synth', 'texture', 'other'];
  var FX = ['none', 'echo', 'space', 'warm', 'thin', 'drive', 'tremolo', 'tape'];
  function guessType(n) { n = (n || '').toLowerCase(); for (var i = 0; i < TYPES.length; i++) if (n.indexOf(TYPES[i]) >= 0) return TYPES[i]; if (/tone|demo/.test(n)) return 'synth'; return 'other'; }
  var IR = null;
  function impulse() { if (IR) return IR; var n = Math.round(ac.sampleRate * 2.2), b = ac.createBuffer(2, n, ac.sampleRate); for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); } return IR = b; }
  function curve(k) { var n = 1024, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = i / (n - 1) * 2 - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
  function wire(l) {   // gain → (dry + effect) → out
    if (!ac) return;
    try { l.gain.disconnect(); } catch (e) {} l.fxn.forEach(function (n) { try { n.stop && n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }); l.fxn = [];
    var a = l.amt, t = ac.currentTime, beat = 60 / bpm;
    if (l.fx === 'none') { l.gain.connect(l.out); }
    else if (l.fx === 'echo' || l.fx === 'space' || l.fx === 'tape') {
      var dry = ac.createGain(), wet = ac.createGain(); dry.gain.value = 1 - a * .45; wet.gain.value = a * .9;
      l.gain.connect(dry); dry.connect(l.out); wet.connect(l.out); l.fxn.push(dry, wet);
      if (l.fx === 'space') { var cv = ac.createConvolver(); cv.buffer = impulse(); l.gain.connect(cv); cv.connect(wet); l.fxn.push(cv); }
      else {
        var dl = ac.createDelay(2), fb = ac.createGain(), lp = ac.createBiquadFilter();
        dl.delayTime.value = l.fx === 'tape' ? beat * .5 : Math.min(1.9, beat * .75); fb.gain.value = .25 + a * .45; lp.type = 'lowpass'; lp.frequency.value = l.fx === 'tape' ? 1800 : 5200;
        l.gain.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); l.fxn.push(dl, fb, lp);
        if (l.fx === 'tape') { var o = ac.createOscillator(), od = ac.createGain(); o.frequency.value = .7; od.gain.value = .003 + a * .006; o.connect(od); od.connect(dl.delayTime); o.start(); l.fxn.push(o, od); }
      }
    } else if (l.fx === 'warm' || l.fx === 'thin') {
      var bq = ac.createBiquadFilter(); bq.type = l.fx === 'warm' ? 'lowpass' : 'highpass';
      bq.frequency.value = l.fx === 'warm' ? 300 + (1 - a) * 4000 : 120 + a * 1600; bq.Q.value = .8; l.gain.connect(bq); bq.connect(l.out); l.fxn.push(bq);
    } else if (l.fx === 'drive') {
      var ws = ac.createWaveShaper(), mk = ac.createGain(); ws.curve = curve(2 + a * 40); ws.oversample = '2x'; mk.gain.value = 1 / (1 + a * 1.4);
      l.gain.connect(ws); ws.connect(mk); mk.connect(l.out); l.fxn.push(ws, mk);
    } else if (l.fx === 'tremolo') {
      var tg = ac.createGain(), lfo = ac.createOscillator(), dep = ac.createGain(); tg.gain.value = 1 - a * .5; lfo.frequency.value = bpm / 60 * 2; dep.gain.value = a * .5;
      lfo.connect(dep); dep.connect(tg.gain); lfo.start(t); l.gain.connect(tg); tg.connect(l.out); l.fxn.push(tg, lfo, dep);
    }
    if (l.pan) l.pan.pan.setTargetAtTime(l.pv || 0, t, .05);
  }
  function addLayer(buf, name, phase, already) {
    if (!ctx()) return;
    if (!loopLen) loopLen = bars ? bars * 4 * 60 / bpm : clamp(buf.duration, .5, MAXLEN);
    var l = mkLayer(already ? buf : fit(buf, phase), name);
    layers.push(l); wire(l);
    if (playing) startLayer(l); else play();
    mix(); GJ.haptic.commit(); rebuild(); save(); tracksUI();
  }
  function play() {
    if (!ctx() || !layers.length || playing) return;
    startT = ac.currentTime + .02; playing = true; layers.forEach(startLayer); if (click === 'always') clicks(); ui();
  }
  function stop() {
    layers.forEach(function (l) { try { l.src && l.src.stop(); } catch (e) {} l.src = null; });
    stopClicks(); playing = false; ui();
  }
  function clear() {
    stop(); layers.forEach(function (l) { try { l.gain.disconnect(); l.out.disconnect(); } catch (e) {} }); layers = []; loopLen = 0; focus = 0; tracksUI();
    rebuild(); ui(); save(); say('cleared');
  }
  function undo() {
    var l = layers.pop(); if (!l) return;
    try { l.src && l.src.stop(); } catch (e) {} try { l.gain.disconnect(); l.out.disconnect(); } catch (e) {} tracksUI();
    if (!layers.length) { stop(); loopLen = 0; }
    focus = Math.min(focus, layers.length); mix(); rebuild(); ui(); save(); say('removed ' + l.name);
  }
  function mix() {
    var anySolo = layers.some(function (l) { return l.solo; });
    layers.forEach(function (l, i) {
      var f = focus < .5 ? 1 : Math.max(.12, 1 - Math.abs(focus - (i + 1)) * .88);
      var g = l.mute || (anySolo && !l.solo) ? 0 : l.vol * f;
      if (ac) l.gain.gain.setTargetAtTime(g, ac.currentTime, .06);
      l.level = g;
    });
  }
  function reverse(l) {
    for (var c = 0; c < l.buf.numberOfChannels; c++) Array.prototype.reverse.call(l.buf.getChannelData(c));
    l.rev = !l.rev; if (playing) { try { l.src.stop(); } catch (e) {} startLayer(l); } save();
  }

  /* ---------- clicks: count-in and metronome ---------- */
  function tick(t, accent) {
    var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = accent ? 1760 : 1320; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(accent ? .22 : .12, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
    o.start(t); o.stop(t + .06); clickNodes.push(o);
  }
  function clicks() {
    stopClicks(); if (!loopLen) return;
    var beat = 60 / bpm, t0 = ac.currentTime;
    (function sched() {   // schedule ahead in short windows
      var now = ac.currentTime, ph = phaseNow(), next = Math.ceil(ph / beat) * beat;
      for (var t = next; t < ph + 1.2; t += beat) { var at = now + (t - ph); if (at > now) tick(at, Math.round(t / beat) % 4 === 0); }
      clicks.timer = setTimeout(sched, 1000);
    })();
    void t0;
  }
  function stopClicks() { clearTimeout(clicks.timer); clickNodes.forEach(function (o) { try { o.stop(); } catch (e) {} }); clickNodes = []; }

  /* ---------- recording ---------- */
  function record() {
    if (rec) { finishRec(); return; }
    if (!ctx()) { say('no audio here'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !G.MediaRecorder) { capture(); return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(begin).catch(function () { capture(); });
  }
  function begin(stream) {
    var mr = new MediaRecorder(stream), chunks = [], mic = ac.createMediaStreamSource(stream), man = ac.createAnalyser();
    man.fftSize = 512; mic.connect(man);   // the mic feeds the visualizer only, never the speakers
    var overdub = !!loopLen, beat = 60 / bpm, countIn = (!overdub && bars) || (overdub && click !== 'off') ? 4 * beat : 0;
    if (overdub && playing) countIn = loopLen - phaseNow() > .2 ? loopLen - phaseNow() : loopLen - phaseNow() + loopLen;   // start on the loop's top
    rec = { mr: mr, stream: stream, chunks: chunks, an: man, mic: mic, overdub: overdub, armed: true, t0: ac.currentTime + countIn, countIn: countIn };
    if (countIn) { if (!overdub || click !== 'off') for (var b = 0; b < 4; b++) { var at = rec.t0 - (4 - b) * beat; if (at > ac.currentTime) tick(at, b === 0); } }
    mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = function () {
      var r = rec; rec = null; ui();
      r.stream.getTracks().forEach(function (t) { t.stop(); }); try { r.mic.disconnect(); } catch (e) {}
      new Blob(r.chunks).arrayBuffer().then(function (ab) { return ac.decodeAudioData(ab); }).then(function (buf) {
        // trim the count-in and the device latency from the front, so the take starts where you played
        var skip = Math.max(0, r.recStarted != null ? r.t0 - r.recStarted + latency() : latency());
        var b2 = slice(buf, skip, r.overdub ? loopLen : (bars ? bars * 4 * 60 / bpm : buf.duration - skip));
        addLayer(b2, 'take ' + (layers.length + 1), 0);
        say(r.overdub ? 'take ' + layers.length + ' added' : 'loop set · ' + loopLen.toFixed(2) + ' s' + (bars ? ' · ' + bars + (bars === 1 ? ' bar' : ' bars') + ' at ' + bpm : ''));
      }).catch(function () { say('could not read that take'); });
    };
    mr.start(); rec.recStarted = ac.currentTime;
    var len = overdub ? loopLen : bars ? bars * 4 * 60 / bpm : MAXLEN;
    rec.timer = setTimeout(finishRec, (countIn + len + latency()) * 1000 + 60);
    ui(); GJ.haptic.commit();
  }
  function slice(buf, from, len) {
    var sr = buf.sampleRate, a = Math.round(from * sr), n = Math.max(1, Math.min(buf.length - a, Math.round(len * sr)));
    var out = ac.createBuffer(buf.numberOfChannels, n, sr);
    for (var c = 0; c < buf.numberOfChannels; c++) out.getChannelData(c).set(buf.getChannelData(c).subarray(a, a + n));
    return out;
  }
  function finishRec() { if (!rec) return; clearTimeout(rec.timer); try { rec.mr.stop(); } catch (e) { rec = null; ui(); } }
  // in a sandboxed preview the mic is blocked: the phone's own recorder (the capture sheet) records; only the sound is kept
  function capture() { say('the mic is blocked here — the phone recorder opens; only the sound is kept'); $('lp-cap').click(); }
  function readFile(f, label) {
    if (!f || !ctx()) return;
    f.arrayBuffer().then(function (ab) { return ac.decodeAudioData(ab); })
      .then(function (buf) { var first = !loopLen; addLayer(buf, label || f.name.replace(/\.[^.]+$/, '').slice(0, 14), phaseNow()); say(first ? 'loop set · ' + loopLen.toFixed(2) + ' s' : 'take ' + layers.length + ' added'); })
      .catch(function () { say('could not read that file'); });
  }
  $('lp-file').addEventListener('change', function () { var f = this.files && this.files[0]; this.value = ''; readFile(f); });
  $('lp-cap').addEventListener('change', function () { var f = this.files && this.files[0]; this.value = ''; readFile(f, 'take ' + (layers.length + 1)); });

  // placeholder tone: a soft generated arpeggio, so the tool works with nothing recorded
  function tone() {
    if (!ctx()) return;
    var len = loopLen || (bars ? bars * 4 * 60 / bpm : 8), sr = ac.sampleRate, L = Math.round(len * sr), b = ac.createBuffer(1, L, sr), d = b.getChannelData(0);
    var scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25], steps = Math.max(8, Math.round(len / (30 / bpm))), step = len / steps, k = layers.length;
    for (var n = 0; n < steps; n++) {
      if ((n + k) % 3 === 2) continue;
      var hz = scale[(n * (k + 2) + k * 3) % scale.length] * (k % 2 ? 1 : .5), t0 = Math.round(n * step * sr), dur = Math.round(step * 1.8 * sr);
      for (var i = 0; i < dur && t0 + i < L; i++) { var t = i / sr, env = Math.min(1, t * 60) * Math.exp(-t * 3.2); d[t0 + i] += Math.sin(6.2832 * hz * t) * env * .18 + Math.sin(6.2832 * hz * 2 * t) * env * .04; }
    }
    if (!loopLen) loopLen = len;
    addLayer(b, 'tone ' + (layers.length + 1), 0, true);
    say('demo tone added');
  }
  // the timer's end cue: the first take's opening, or a soft generated bell
  function cue() {
    if (!ctx()) return;
    var g = ac.createGain(); g.connect(ac.destination);
    if (layers.length) {
      var s = ac.createBufferSource(); s.buffer = layers[0].buf; s.connect(g);
      g.gain.setValueAtTime(.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(.9, ac.currentTime + .05);
      g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + Math.min(2.4, loopLen)); s.start(0, 0, Math.min(2.4, loopLen));
    } else {
      [660, 990].forEach(function (hz, i) {
        var o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = hz; o.connect(og); og.connect(g);
        og.gain.setValueAtTime(.0001, ac.currentTime); og.gain.exponentialRampToValueAtTime(i ? .08 : .16, ac.currentTime + .02);
        og.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + 1.8); o.start(); o.stop(ac.currentTime + 1.9);
      });
    }
  }

  // the timer's alarm: three bell strikes, a little louder than the cue (your first take, if there is one, opens it)
  function alarm() {
    if (!ctx()) return;
    var g = ac.createGain(); g.connect(ac.destination); g.gain.value = 1;
    if (layers.length) cue();
    for (var k = 0; k < 3; k++) {
      var t0 = ac.currentTime + (layers.length ? 2.2 : 0) + k * 1.25;
      [880, 1320, 1760].forEach(function (hz, i) {
        var o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = hz; o.connect(og); og.connect(g);
        og.gain.setValueAtTime(.0001, t0); og.gain.exponentialRampToValueAtTime([.28, .12, .05][i], t0 + .012);
        og.gain.exponentialRampToValueAtTime(.0001, t0 + 1.1); o.start(t0); o.stop(t0 + 1.2);
      });
    }
  }

  /* ---------- keep: this browser (IndexedDB), and a WAV of the mix ---------- */
  var DBN = 'safelight-loops';
  function idb() { return new Promise(function (res, rej) { try { var r = indexedDB.open(DBN, 1); r.onupgradeneeded = function () { r.result.createObjectStore('s'); }; r.onsuccess = function () { res(r.result); }; r.onerror = rej; } catch (e) { rej(e); } }); }
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(doSave, 120); }
  function doSave() {
    saveT = 0;
    (function () {
      idb().then(function (db) {
        var data = { loopLen: loopLen, bpm: bpm, bars: bars, takes: layers.map(function (l) { var ch = []; for (var c = 0; c < l.buf.numberOfChannels; c++) ch.push(l.buf.getChannelData(c).slice()); return { name: l.name, vol: l.vol, mute: l.mute, rev: l.rev, type: l.type, fx: l.fx, amt: l.amt, pv: l.pv, solo: !!l.solo, sr: l.buf.sampleRate, ch: ch }; }) };
        db.transaction('s', 'readwrite').objectStore('s').put(data, 'session');
      }).catch(function () {});
    })();
  }
  G.addEventListener('pagehide', function () { if (saveT) { clearTimeout(saveT); doSave(); } });
  function restore() {
    return idb().then(function (db) {
      return new Promise(function (res) { var q = db.transaction('s').objectStore('s').get('session'); q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(null); }; });
    }).then(function (d) {
      if (!d || !d.takes || !d.takes.length || layers.length || !ctx()) return;
      loopLen = d.loopLen; bpm = d.bpm || 90; bars = d.bars || 0;
      d.takes.forEach(function (t) {
        var b = ac.createBuffer(t.ch.length, t.ch[0].length, t.sr); t.ch.forEach(function (a, c) { b.getChannelData(c).set(a); });
        var l = mkLayer(b, t.name); l.vol = t.vol; l.mute = t.mute; l.rev = t.rev; l.type = t.type || l.type; l.fx = t.fx || 'none'; l.amt = t.amt == null ? .5 : t.amt; l.pv = t.pv || 0; l.solo = !!t.solo; layers.push(l); wire(l);
      });
      mix(); rebuild(); ui(); say(layers.length + (layers.length === 1 ? ' take' : ' takes') + ' back from last time — tap play');
    }).catch(function () {});
  }
  function wav(buf) {
    var n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, ab = new ArrayBuffer(44 + n * ch * 2), v = new DataView(ab), o = 0;
    function w(s) { for (var i = 0; i < s.length; i++) v.setUint8(o++, s.charCodeAt(i)); }
    w('RIFF'); v.setUint32(o, 36 + n * ch * 2, true); o += 4; w('WAVEfmt '); v.setUint32(o, 16, true); o += 4; v.setUint16(o, 1, true); o += 2; v.setUint16(o, ch, true); o += 2;
    v.setUint32(o, sr, true); o += 4; v.setUint32(o, sr * ch * 2, true); o += 4; v.setUint16(o, ch * 2, true); o += 2; v.setUint16(o, 16, true); o += 2; w('data'); v.setUint32(o, n * ch * 2, true); o += 4;
    for (var i = 0; i < n; i++) for (var c = 0; c < ch; c++) { var x = Math.max(-1, Math.min(1, buf.getChannelData(c)[i])); v.setInt16(o, x < 0 ? x * 32768 : x * 32767, true); o += 2; }
    return new Uint8Array(ab);
  }
  function exportMix() {
    if (!layers.length) return;
    var sr = ac.sampleRate, L = Math.round(loopLen * sr * 2), off = new (G.OfflineAudioContext || G.webkitOfflineAudioContext)(2, L, sr);
    layers.forEach(function (l) { if (!l.level) return; var s = off.createBufferSource(), g = off.createGain(); s.buffer = l.buf; s.loop = true; g.gain.value = l.level * vol; s.connect(g); g.connect(off.destination); s.start(0); });
    off.startRendering().then(function (out) {
      var data = wav(out), name = 'oz-loop-' + new Date().toISOString().slice(0, 10) + '.wav';
      var host = G.safelightHost, use = host && host.use ? host.use('downloads') : Promise.resolve(null);   // a host that offers a save sheet; otherwise a plain download
      use.then(function (dl) {
        if (dl) return dl.save({ filename: name, data: new Blob([data], { type: 'audio/wav' }) }).then(function () { say('saved ' + name); }, function () { say('not saved'); });
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'audio/wav' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); say('saved ' + name);
      }).catch(function () { say('not saved'); });
    });
  }

  /* ---------- the tracks sheet ---------- */
  var TR = document.createElement('section'); TR.id = 'lp-tracks'; TR.setAttribute('aria-label', 'tracks'); document.getElementById('r-loops').appendChild(TR);
  function pct(v) { return Math.round(v * 100); }
  function tracksUI() {
    if (!TR) return;
    if (!layers.length) { TR.innerHTML = '<b class="jul">tracks</b><p class="tr-none">no takes yet — record one, or add a sound</p>'; return; }
    TR.innerHTML = '<b class="jul">tracks</b><i class="tr-close" data-a="close">done</i>' + layers.map(function (l, i) {
      return '<div class="tr" data-i="' + i + '" style="--lv:' + pct(l.vol) + '%;--am:' + pct(l.amt) + '%;--pn:' + (50 + (l.pv || 0) * 50) + '%">' +
        '<div class="tr-h"><span class="tr-n">' + (i + 1) + '</span><button class="tr-type jul" data-a="type">' + l.type + '</button><em>' + l.name + '</em>' +
        '<button data-a="mute"' + (l.mute ? ' class="on"' : '') + '>mute</button><button data-a="solo"' + (l.solo ? ' class="on"' : '') + '>solo</button></div>' +
        '<div class="tr-s" data-s="vol"><label>level</label><i class="tr-bar"><i></i></i><span>' + pct(l.vol) + '</span></div>' +
        '<div class="tr-s" data-s="pv"><label>pan</label><i class="tr-bar tr-pan"><i></i></i><span>' + (Math.abs(l.pv) < .03 ? 'c' : (l.pv < 0 ? 'l ' : 'r ') + pct(Math.abs(l.pv))) + '</span></div>' +
        '<div class="tr-s tr-fx' + (l.fx === 'none' ? ' off' : '') + '" data-s="amt"><button class="jul" data-a="fx">' + l.fx + '</button><i class="tr-bar"><i></i></i><span>' + (l.fx === 'none' ? '' : pct(l.amt)) + '</span></div>' +
      '</div>';
    }).join('');
  }
  TR.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return; e.stopPropagation(); var a = b.dataset.a;
    if (a === 'close') { document.documentElement.classList.remove('tracks'); return; }
    var row = b.closest('.tr'), l = row && layers[+row.dataset.i]; if (!l) return;
    if (a === 'type') l.type = TYPES[(TYPES.indexOf(l.type) + 1) % TYPES.length];
    if (a === 'mute') l.mute = !l.mute;
    if (a === 'solo') l.solo = !l.solo;
    if (a === 'fx') { l.fx = FX[(FX.indexOf(l.fx) + 1) % FX.length]; wire(l); say(l.name + ' · ' + l.fx); }
    mix(); save(); tracksUI(); GJ.haptic.tick();
  });
  // the sliders: drag along the hairline (and a see-through ring grows round the finger, as everywhere)
  (function () {
    var d = null;
    function val(row, s, x) { var bar = row.querySelector('[data-s="' + s + '"] .tr-bar').getBoundingClientRect(); return clamp((x - bar.left) / bar.width, 0, 1); }
    function apply(l, s, f) {
      if (s === 'vol') l.vol = f; else if (s === 'amt') { l.amt = f; } else l.pv = Math.round((f * 2 - 1) * 20) / 20;
      if (s === 'amt') wire(l); if (s === 'pv' && l.pan && ac) l.pan.pan.setTargetAtTime(l.pv, ac.currentTime, .05);
      mix();
    }
    TR.addEventListener('pointerdown', function (e) {
      var sl = e.target.closest('.tr-s'); if (!sl || e.target.closest('button')) return; var row = sl.closest('.tr'), l = layers[+row.dataset.i]; if (!l) return;
      if (sl.classList.contains('off')) return;
      e.preventDefault(); try { sl.setPointerCapture(e.pointerId); } catch (x) {}
      d = { l: l, s: sl.dataset.s, row: row, id: e.pointerId }; apply(l, d.s, val(row, d.s, e.clientX)); paintRow(d); GJ.haptic.tick();
    });
    TR.addEventListener('pointermove', function (e) { if (!d || e.pointerId !== d.id) return; apply(d.l, d.s, val(d.row, d.s, e.clientX)); paintRow(d); });
    function end(e) { if (!d || e.pointerId !== d.id) return; d = null; save(); tracksUI(); }
    TR.addEventListener('pointerup', end); TR.addEventListener('pointercancel', end);
    function paintRow(q) { var l = q.l; q.row.style.setProperty('--lv', pct(l.vol) + '%'); q.row.style.setProperty('--am', pct(l.amt) + '%'); q.row.style.setProperty('--pn', (50 + l.pv * 50) + '%');
      var sp = q.row.querySelector('[data-s="' + q.s + '"] span'); sp.textContent = q.s === 'vol' ? pct(l.vol) : q.s === 'amt' ? pct(l.amt) : (Math.abs(l.pv) < .03 ? 'c' : (l.pv < 0 ? 'l ' : 'r ') + pct(Math.abs(l.pv))); }
  })();
  function tracksOpen(on) { tracksUI(); document.documentElement.classList.toggle('tracks', on == null ? !document.documentElement.classList.contains('tracks') : on); }

  GJ.loops = { cue: cue, tracks: tracksOpen, track: function (i) { var l = layers[i]; return l ? { type: l.type, fx: l.fx, amt: l.amt, vol: l.vol, pv: l.pv, mute: l.mute, solo: !!l.solo, name: l.name } : null; }, setTrack: function (i, o) { var l = layers[i]; if (!l) return; Object.assign(l, o); wire(l); mix(); tracksUI(); save(); }, TYPES: TYPES, FX: FX, alarm: alarm, tone: tone, play: play, stop: stop, clear: clear, undo: undo, exportMix: exportMix,
    state: function () { return { layers: layers.length, loopLen: loopLen, playing: playing, rec: !!rec, focus: focus, vol: vol, bpm: bpm, bars: bars, levels: layers.map(function (l) { return l.level; }), rev: layers.map(function (l) { return l.rev; }) }; },
    _setBars: function (b, t) { bars = b; if (t) bpm = t; } };

  /* ---------- controls ---------- */
  function ui() {
    $('lp-rec').textContent = rec ? (rec.armed && ac && ac.currentTime < rec.t0 ? 'count-in…' : 'stop recording') : loopLen ? 'record a take' : 'record';
    $('lp-play').textContent = playing ? 'stop' : 'play';
    ['lp-play', 'lp-undo', 'lp-clear', 'lp-save', 'lp-trk'].forEach(function (id) { var e = $(id); if (e) e.style.display = layers.length ? '' : 'none'; });
    $('lp-tone').style.display = layers.length > 3 ? 'none' : '';
    $('r-loops').classList.toggle('rec', !!rec);
  }
  $('lp-rec').addEventListener('click', record);
  $('lp-add').addEventListener('click', function () { ctx(); $('lp-file').click(); });
  $('lp-tone').addEventListener('click', tone);
  $('lp-play').addEventListener('click', function () { if (playing) stop(); else play(); GJ.haptic.tick(); });
  $('lp-undo').addEventListener('click', undo);
  $('lp-clear').addEventListener('click', clear);
  $('lp-save').addEventListener('click', exportMix);
  var tb = document.createElement('button'); tb.id = 'lp-trk'; tb.textContent = 'tracks'; $('lp-act').insertBefore(tb, $('lp-undo'));
  tb.addEventListener('click', function () { tracksOpen(); GJ.haptic.tick(); });

  // dials, each with a second job: VOLUME ⇅ TEMPO · TAKE ⇅ BARS
  var VOL = { key: 'vol', label: 'VOLUME', min: 0, max: 1, def: .8, span: 220, unit: .05,
    get: function () { return vol; }, set: function (v) { vol = v; if (master) master.gain.setTargetAtTime(v, ac.currentTime, .05); },
    meter: function () { return smoothLv * 1.6; }, fmt: function (v) { return Math.round(v * 100) + '%'; } };
  var TEMPO = { key: 'tempo', label: 'TEMPO', min: 60, max: 180, def: 90, span: 260, unit: 1, notches: function () { return [80, 90, 100, 120, 140]; },
    get: function () { return bpm; }, step: function (v) { return Math.round(v); },
    set: function (v) { if (layers.length && bars) { say('tempo is set by the loop — clear to change it'); return; } bpm = v; save(); },
    fmt: function (v) { return Math.round(v) + ' bpm'; } };
  var TAKE = { key: 'take', label: 'TAKE', min: 0, max: 1, def: 1, span: 220, unit: .05,
    get: function () { var l = cur(); return l ? l.vol : 1; },
    set: function (v) { var l = cur(); if (l) l.vol = v; else layers.forEach(function (k) { k.vol = v; }); mix(); save(); },
    meter: function () { var l = cur(); return l ? (l.level || 0) * smoothLv * 2 : smoothLv * 1.4; },
    fmt: function (v) { var l = cur(); return (l ? l.name : 'all') + ' ' + Math.round(v * 100) + '%'; } };
  var BARSR = { key: 'bars', label: 'BARS', min: 0, max: BARS.length - 1, def: 0, span: 180, unit: 1,
    get: function () { return BARS.indexOf(bars) < 0 ? 0 : BARS.indexOf(bars); }, step: function (v) { return Math.round(v); },
    set: function (v) { if (layers.length) { say('bars are set by the loop — clear to change them'); return; } bars = BARS[Math.round(v)]; save(); },
    fmt: function (v) { var b = BARS[Math.round(v)]; return b ? b + (b === 1 ? ' bar' : ' bars') + ' · ' + bpm : 'free length'; } };
  VOL.alt = TEMPO; TEMPO.alt = VOL; TAKE.alt = BARSR; BARSR.alt = TAKE;
  // the options, in words you can see (Gill, 17 Nov: "on loops can't see the options"): length, and tempo when it counts
  var opts = document.getElementById('lp-opts');
  function optsUI() {
    var lock = layers.length > 0, html = BARS.map(function (b, i) { return '<button data-b="' + i + '"' + (bars === b ? ' class="on"' : '') + (lock ? ' disabled' : '') + '>' + (b ? b + (b === 1 ? ' bar' : ' bars') : 'free') + '</button>'; }).join('');
    if (bars) html += '<i></i><button data-t="-5"' + (lock ? ' disabled' : '') + '>−</button><b>' + bpm + ' bpm</b><button data-t="5"' + (lock ? ' disabled' : '') + '>+</button>';
    if (opts.innerHTML !== html) opts.innerHTML = html;
  }
  opts.addEventListener('click', function (e) {
    var x = e.target.closest('button'); if (!x || x.disabled) return;
    if (x.dataset.b != null) BARSR.set(+x.dataset.b); else TEMPO.set(Math.max(60, Math.min(180, bpm + +x.dataset.t)));
    GJ.haptic.tick(); optsUI(); GJ.dial.redraw();
  });
  setInterval(function () { if (GJ.app.room === 'loops') optsUI(); }, 400);
  function cur() { var i = Math.round(focus) - 1; return layers[i] || null; }
  function railSpec() {
    return {
      stops: [{ label: 'all' }].concat(layers.map(function (l) { return { label: l.name }; })),
      get: function () { return focus; }, go: function (i) { focus = i; mix(); }, scrub: function (f) { focus = f; mix(); }, rest: function () {}
    };
  }
  function rebuild() { if (GJ.app && GJ.app.room === 'loops') GJ.rail.config(layers.length ? railSpec() : null); }

  /* ---------- the visualizer: a ring of stars ---------- */
  var cv = $('lv'), cx = cv.getContext('2d'), W = 0, H = 0, DPR = 1;
  function size() { DPR = Math.min(2, G.devicePixelRatio || 1); W = G.innerWidth; H = G.innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
  G.addEventListener('resize', size); size();
  var smoothLv = 0, tt = 0, menu = null;
  function draw(dt) {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.clearRect(0, 0, W, H);
    var M = Math.min(W, H), ox = W / 2, oy = H * .42, r0 = M * .2, atm = sky.atmos;
    tt += dt * (.3 + .7 * atm);
    var useAn = rec ? rec.an : an, lvl = 0;
    if (useAn) {
      if (useAn !== an) { var fb = new Uint8Array(useAn.frequencyBinCount), tb = new Uint8Array(useAn.fftSize); useAn.getByteFrequencyData(fb); useAn.getByteTimeDomainData(tb); fbin = fb; tbin = tb; }
      else { an.getByteFrequencyData(fbin); an.getByteTimeDomainData(tbin); }
      for (var q = 0; q < 64; q++) lvl += fbin[q]; lvl /= 64 * 255;
    }
    smoothLv += (lvl - smoothLv) * Math.min(1, dt * 8);
    var light = sky.envLight(), ink = function (a) { return sky.ink(light, a); }, paper = function (a) { return sky.ink([238, 244, 250], a); };
    var gr = cx.createRadialGradient(ox, oy, 0, ox, oy, r0 * 1.6);
    gr.addColorStop(0, ink(.05 + smoothLv * .3)); gr.addColorStop(1, ink(0));
    cx.fillStyle = gr; cx.beginPath(); cx.arc(ox, oy, r0 * 1.6, 0, 6.283); cx.fill();
    var N = 96, pts = [];
    for (var i = 0; i < N; i++) {
      var a = -Math.PI / 2 + i / N * 6.2832, bin = fbin ? Math.floor(Math.pow(i / N, 1.6) * 150) + 1 : 0;
      var v = fbin ? fbin[bin] / 255 : 0, idle = .012 * Math.sin(tt * 1.3 + i * .7) * atm;
      var r = r0 * (1 + v * .55 + idle);
      pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r, v]);
    }
    cx.lineWidth = 1; cx.strokeStyle = ink(.28); cx.beginPath();
    pts.forEach(function (p, i) { i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); }); cx.closePath(); cx.stroke();
    pts.forEach(function (p, i) { if (i % 2) return; cx.fillStyle = paper(.25 + .75 * p[2]); cx.beginPath(); cx.arc(p[0], p[1], .7 + p[2] * 1.8, 0, 6.283); cx.fill(); });
    if (tbin) {
      cx.strokeStyle = ink(.35); cx.beginPath();
      for (var j = 0; j <= 128; j++) {
        var s = tbin[Math.floor(j / 128 * (tbin.length - 1))] / 128 - 1, aa = -Math.PI / 2 + j / 128 * 6.2832, rr = r0 * .62 * (1 + s * .35);
        j ? cx.lineTo(ox + Math.cos(aa) * rr, oy + Math.sin(aa) * rr) : cx.moveTo(ox + Math.cos(aa) * rr, oy + Math.sin(aa) * rr);
      }
      cx.stroke();
    }
    // where you are: the loop's travelling star, with a tick at each beat when there's a tempo
    var ro = r0 * 1.78;
    cx.strokeStyle = ink(.16); cx.beginPath(); cx.arc(ox, oy, ro, 0, 6.283); cx.stroke();
    if (loopLen && bars) {
      var beats = Math.round(loopLen / (60 / bpm));
      for (var bt = 0; bt < beats; bt++) { var ba = -Math.PI / 2 + bt / beats * 6.2832, bl = bt % 4 === 0 ? 6 : 3; cx.strokeStyle = ink(bt % 4 === 0 ? .5 : .28); cx.beginPath(); cx.moveTo(ox + Math.cos(ba) * (ro - bl), oy + Math.sin(ba) * (ro - bl)); cx.lineTo(ox + Math.cos(ba) * (ro + bl), oy + Math.sin(ba) * (ro + bl)); cx.stroke(); }
    }
    if (rec && ac && ac.currentTime < rec.t0) {   // count-in: four beats light around the ring
      var left = rec.t0 - ac.currentTime, beat = 60 / bpm, k = 4 - Math.ceil(left / beat);
      for (var c = 0; c < 4; c++) { var ca = -Math.PI / 2 + c / 4 * 6.2832; cx.fillStyle = paper(c <= k ? .95 : .2); cx.beginPath(); cx.arc(ox + Math.cos(ca) * ro, oy + Math.sin(ca) * ro, c <= k ? 3.2 : 2, 0, 6.283); cx.fill(); }
    } else if (loopLen && (playing || rec)) {
      var ph = phaseNow() / loopLen, pa = -Math.PI / 2 + ph * 6.2832;
      cx.fillStyle = paper(.95); cx.beginPath(); cx.arc(ox + Math.cos(pa) * ro, oy + Math.sin(pa) * ro, 2.4, 0, 6.283); cx.fill();
      if (rec) { var rp = Math.min(1, (ac.currentTime - rec.t0) / loopLen); cx.strokeStyle = sky.ink([255, 68, 87], .8); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(ox, oy, ro + 4, -Math.PI / 2, -Math.PI / 2 + rp * 6.2832); cx.stroke(); cx.lineWidth = 1; }
    } else if (rec) {
      var len = bars ? bars * 4 * 60 / bpm : MAXLEN, pr = Math.min(1, (ac.currentTime - rec.t0) / len);
      cx.strokeStyle = sky.ink([255, 68, 87], .8); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(ox, oy, ro, -Math.PI / 2, -Math.PI / 2 + pr * 6.2832); cx.stroke(); cx.lineWidth = 1;
    }
    var n = layers.length;
    if (n) {
      var P = layers.map(function (l, k2) { var a2 = -Math.PI / 2 + (k2 + .5) / Math.max(n, 6) * 6.2832; return [ox + Math.cos(a2) * ro * 1.18, oy + Math.sin(a2) * ro * 1.18, l]; });
      cx.strokeStyle = ink(.32); cx.beginPath(); P.forEach(function (p, k2) { k2 ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); }); cx.stroke();
      P.forEach(function (p, k2) {
        var l = p[2], g = l.level == null ? 1 : l.level, born = Math.min(1, (GJ.now() - l.born) / 900);
        cx.fillStyle = paper((.25 + .75 * g) * born); cx.beginPath(); cx.arc(p[0], p[1], (1.6 + g * 2.2 + smoothLv * 2) * born, 0, 6.283); cx.fill();
        if (l.rev) { cx.strokeStyle = paper(.5); cx.beginPath(); cx.arc(p[0], p[1], 6, Math.PI * .2, Math.PI * 1.2); cx.stroke(); }
        if (l.solo) { cx.strokeStyle = paper(.8); cx.beginPath(); cx.arc(p[0], p[1], 8, 0, 6.283); cx.stroke(); }
        if (Math.round(focus) - 1 === k2 && focus > .5) { cx.lineWidth = 1.2; cx.strokeStyle = paper(.85); cx.beginPath(); cx.arc(p[0], p[1], 11, 0, 6.283); cx.stroke(); cx.lineWidth = 1; }
        l.hit = [p[0], p[1]];
      });
    }
    var st = rec ? (ac.currentTime < rec.t0 ? 'count-in' : rec.overdub ? 'recording take ' + (n + 1) : bars ? 'recording · ' + bars + (bars === 1 ? ' bar' : ' bars') : 'recording · tap again to set the loop')
      : playing ? n + (n === 1 ? ' take' : ' takes') + ' · ' + loopLen.toFixed(2) + ' s' + (bars ? ' · ' + bars + (bars === 1 ? ' bar' : ' bars') + ' · ' + bpm : '')
        : n ? 'stopped' : bars ? bars + (bars === 1 ? ' bar' : ' bars') + ' at ' + bpm + ' · record, add a sound, or the demo tone' : 'record, add a sound, or try the demo tone';
    if ($('lp-state').textContent !== st) $('lp-state').textContent = st;
    if (rec) ui();
    if (note && GJ.now() - noteT > 3200) { note = ''; $('lp-note').classList.remove('on'); }
  }
  // tap a take's star: mute. Hold it: reverse · solo · delete
  var pressT = 0, pressed = null;
  function hitAt(x, y) { var h = null; layers.forEach(function (l) { if (l.hit && Math.hypot(l.hit[0] - x, l.hit[1] - y) < 22) h = l; }); return h; }
  cv.addEventListener('pointerdown', function (e) {
    closeMenu(); var h = hitAt(e.clientX, e.clientY); if (!h) return;
    e.stopPropagation(); pressed = h;
    pressT = setTimeout(function () { var p = pressed; pressed = null; if (p) openMenu(p); GJ.haptic.commit(); }, 550);
  });
  cv.addEventListener('pointerup', function () {
    clearTimeout(pressT); var h = pressed; pressed = null; if (!h) return;
    h.mute = !h.mute; mix(); save(); GJ.haptic.tick(); say(h.name + (h.mute ? ' muted' : ' on'));
  });
  function openMenu(l) {
    var m = $('lp-menu'); m.innerHTML = '';
    [['reverse', function () { reverse(l); say(l.name + (l.rev ? ' reversed' : ' forward')); }],
     [l.solo ? 'unsolo' : 'solo', function () { l.solo = !l.solo; mix(); }],
     ['delete', function () { var i = layers.indexOf(l); if (i > -1) { layers.splice(i, 1); try { l.src && l.src.stop(); } catch (e) {} l.gain.disconnect(); if (!layers.length) { stop(); loopLen = 0; } focus = 0; mix(); rebuild(); ui(); save(); say('deleted ' + l.name); } }]]
      .forEach(function (it) { var b = document.createElement('button'); b.textContent = it[0]; b.onclick = function (e) { e.stopPropagation(); it[1](); closeMenu(); GJ.haptic.tick(); }; m.appendChild(b); });
    m.style.left = clamp(l.hit[0] - 90, 8, W - 188) + 'px'; m.style.top = (l.hit[1] + 18) + 'px'; m.classList.add('on'); menu = l;
  }
  function closeMenu() { $('lp-menu').classList.remove('on'); menu = null; }

  var restored = false;
  GJ.rooms.loops = {
    id: 'loops', title: 'loops', trees: .6, golden: 0,
    rings: function () { return [VOL, TAKE]; },
    rail: function () { return layers.length ? railSpec() : null; },
    enter: function () { size(); ui(); if (!restored) { restored = true; restore(); } },
    leave: function () { closeMenu(); },
    frame: function (dt) { draw(dt); }
  };
})(this);
