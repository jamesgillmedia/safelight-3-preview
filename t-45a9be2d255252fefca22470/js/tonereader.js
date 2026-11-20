/* Tone Check — generic tone reader.
   Ordinary on-device signal reading: level, pauses, a simple pitch estimate and
   energy-peak counting for pace. It is not a model of any person, it does not learn
   the speaker, and it never calls the network. Thresholds below are preview values. */
(function (root) {
  'use strict';

  var HOP = 0.03;              // seconds between frames
  var LIVE_WINDOW = 4;         // seconds read for the live line
  var REVIEW_WINDOW = 3;       // seconds per review step
  var PAUSE_MIN = 0.25;        // a quiet stretch at least this long counts as a pause

  // Preview thresholds for the coarse labels a target may carry.
  var PREVIEW = {
    paceCeiling: { slower: 4.0, moderate: 4.8, steady: 4.6, quicker: 6.0 }, // energy peaks per speaking second
    endRise:     { low: 2.0, gentle: 3.0, more: 5.0 },                        // semitones at the end of a line
    flatBelow:   { low: 0.6, gentle: 1.0, full: 1.8 },                        // spread of pitch, semitones
    climb: 3.5                                                                // semitones above the take's opening
  };

  var NUDGE = { rushed: 'a little rushed', rising: 'rising at the ends', flat: 'going a little flat' };
  var MARK  = { rushed: 'rushed', rising: 'rising', flat: 'flat' };
  var CAME_OUT = { rushed: 'rushed', rising: 'rising at the ends', flat: 'a little flat' };
  var MOMENT_ONE  = { rushed: 'a rushed moment', rising: 'a rise at the end of a line', flat: 'a flatter stretch' };
  var MOMENT_MANY = { rushed: 'a few rushed moments', rising: 'a few rises at the ends of lines', flat: 'a few flatter stretches' };
  var ORDER = ['rushed', 'rising', 'flat'];

  // ---------- small helpers ----------
  function median(a) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function spread(a) { // robust spread (median absolute deviation, scaled)
    if (a.length < 3) return 0;
    var m = median(a);
    return 1.4826 * median(a.map(function (v) { return Math.abs(v - m); }));
  }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function std(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return a.length ? Math.sqrt(s / a.length) : 0; }
  function isNum(v) { return typeof v === 'number' && isFinite(v) && v > 0; }
  function semis(hz) { return 12 * Math.log(hz / 100) / Math.LN2; }
  function joinWords(list) {
    if (list.length <= 1) return list.join('');
    return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }

  // ---------- one frame ----------
  function frameFeature(samples, sampleRate) {
    var n = samples.length, i, sum = 0;
    for (i = 0; i < n; i++) sum += samples[i] * samples[i];
    var rms = Math.sqrt(sum / n);
    var db = rms > 1e-7 ? 20 * Math.log(rms) / Math.LN10 : -140;
    return { db: db, pitch: db > -65 ? estimatePitch(samples, sampleRate) : 0 };
  }

  // Simple pitch estimate: normalised autocorrelation on a lightly decimated frame.
  function estimatePitch(samples, sampleRate) {
    var step = sampleRate >= 32000 ? 2 : 1;
    var sr = sampleRate / step;
    var n = Math.floor(samples.length / step);
    var x = new Float32Array(n), i, j;
    for (i = 0; i < n; i++) {
      var v = 0;
      for (j = 0; j < step; j++) v += samples[i * step + j];
      x[i] = v / step;
    }
    var m = mean(x);
    for (i = 0; i < n; i++) x[i] -= m;
    var minLag = Math.floor(sr / 400), maxLag = Math.min(Math.floor(sr / 70), n - 2);
    if (maxLag <= minLag + 2) return 0;
    var nsdf = new Float32Array(maxLag + 2), best = 0;
    for (var lag = minLag; lag <= maxLag + 1; lag++) {
      var r = 0, e = 0;
      for (i = 0; i + lag < n; i++) { r += x[i] * x[i + lag]; e += x[i] * x[i] + x[i + lag] * x[i + lag]; }
      nsdf[lag] = e > 0 ? 2 * r / e : 0;
      if (nsdf[lag] > best) best = nsdf[lag];
    }
    if (best < 0.6) return 0;
    for (lag = minLag + 1; lag <= maxLag; lag++) { // first strong peak
      if (nsdf[lag] >= 0.9 * best && nsdf[lag] >= nsdf[lag - 1] && nsdf[lag] >= nsdf[lag + 1]) {
        var a = nsdf[lag - 1], b = nsdf[lag], c = nsdf[lag + 1];
        var d = a - 2 * b + c, shift = d !== 0 ? 0.5 * (a - c) / d : 0;
        return sr / (lag + shift);
      }
    }
    return 0;
  }

  // ---------- frame stream: floor, speech, energy peaks ----------
  function Tracker() {
    this.frames = [];
    this.floor = null;
    this.env = null;
    this.rising = false;
    this.lastMin = null;
    this.lastPeakT = -1;
  }
  Tracker.prototype.push = function (t, feat) {
    var db = feat.db;
    if (this.floor === null) this.floor = db;
    // slow-rising, fast-falling estimate of the room's quiet level
    this.floor = db < this.floor ? db : Math.min(this.floor + 0.05, db);
    var speech = db > Math.max(this.floor + 10, -62);

    var prevEnv = this.env === null ? db : this.env;
    var env = this.env === null ? db : 0.5 * this.env + 0.5 * db;
    var peak = false;
    if (this.lastMin === null) this.lastMin = env;
    if (env >= prevEnv) {
      if (!this.rising) this.lastMin = Math.min(this.lastMin, prevEnv);
      this.rising = true;
    } else {
      if (this.rising && prevEnv - this.lastMin >= 4 && prevEnv > this.floor + 12 && t - HOP - this.lastPeakT >= 0.1) {
        peak = true;
        this.lastPeakT = t - HOP;
      }
      if (this.rising) this.lastMin = env;
      this.lastMin = Math.min(this.lastMin, env);
      this.rising = false;
    }
    this.env = env;

    var pitch = speech && feat.pitch ? feat.pitch : 0;
    var f = { t: t, db: db, speech: speech, pitch: pitch, st: pitch ? semis(pitch) : null, peak: peak };
    this.frames.push(f);
    return f;
  };

  // Group speech into lines: runs of speech separated by pauses of PAUSE_MIN or more.
  function lines(frames) {
    var out = [], cur = null, quiet = 0;
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (f.speech) {
        if (!cur) cur = { start: f.t, end: f.t, frames: [] };
        cur.end = f.t; cur.frames.push(f); quiet = 0;
      } else if (cur) {
        quiet += HOP;
        if (quiet >= PAUSE_MIN - 1e-9) { cur.pauseAfter = true; out.push(cur); cur = null; quiet = 0; }
      }
    }
    if (cur) { cur.pauseAfter = false; out.push(cur); }
    return out;
  }

  // Remove isolated pitch jumps (octave slips) before measuring movement.
  function cleanPitch(frames) {
    var st = [];
    for (var i = 0; i < frames.length; i++) if (frames[i].st !== null) st.push(frames[i].st);
    if (st.length < 5) return st;
    var m = median(st);
    return st.filter(function (v) { return Math.abs(v - m) < 9; });
  }

  function lineEndRise(line) {
    var pitched = line.frames.filter(function (f) { return f.st !== null; });
    if (pitched.length < 10) return null;
    var lastT = pitched[pitched.length - 1].t;
    // the last few pitched frames, against the low point of the stretch just before them
    var tail = pitched.slice(-3).map(function (f) { return f.st; });
    var body = pitched.filter(function (f) { return f.t <= lastT - 0.15 && f.t > lastT - 0.9; }).map(function (f) { return f.st; });
    if (body.length < 5) return null;
    body.sort(function (x, y) { return x - y; });
    return median(tail) - body[Math.floor(body.length * 0.2)];
  }

  function openingPitch(frames) {
    var st = [];
    for (var i = 0; i < frames.length && st.length < 100; i++) if (frames[i].st !== null) st.push(frames[i].st);
    return st.length >= 40 ? median(st) : null;
  }

  // Read a stretch of frames against a target.
  function readWindow(frames, targets, opening) {
    var b = (targets && targets.bands) || {};
    var paceCeil = PREVIEW.paceCeiling[(b.pace || {}).band] || PREVIEW.paceCeiling.moderate;
    var riseAt = PREVIEW.endRise[(b.pitch || {}).endRise] || PREVIEW.endRise.gentle;
    var flatAt = PREVIEW.flatBelow[(b.pitch || {}).movement] || PREVIEW.flatBelow.gentle;
    // a target may carry its own limits (same units as above); each one it gives replaces the preview value
    var lim = (targets && targets.limits) || {};
    if (isNum(lim.paceCeiling)) paceCeil = lim.paceCeiling;
    if (isNum(lim.endRise)) riseAt = lim.endRise;
    if (isNum(lim.flatBelow)) flatAt = lim.flatBelow;

    var ls = lines(frames), speaking = 0, peaks = 0, pauses = [], i;
    for (i = 0; i < ls.length; i++) {
      speaking += ls[i].end - ls[i].start + HOP;
      for (var k = 0; k < ls[i].frames.length; k++) if (ls[i].frames[k].peak) peaks++;
      if (i > 0) pauses.push(ls[i].start - ls[i - 1].end);
    }
    var st = cleanPitch(frames);
    var dbs = frames.filter(function (f) { return f.speech; }).map(function (f) { return f.db; });
    var span = frames.length ? frames[frames.length - 1].t - frames[0].t + HOP : 0;

    var read = {
      speaking: speaking,
      pace: speaking >= 1.2 ? peaks / speaking : null,
      movement: st.length >= 25 ? spread(st) : null,
      level: dbs.length ? mean(dbs) : null,
      variation: dbs.length > 3 ? std(dbs) : null,
      pausesPerMin: span > 0 ? pauses.length * 60 / span : 0,
      pauseLength: pauses.length ? mean(pauses) : null,
      risingEnds: [],
      climbing: false,
      kinds: []
    };
    for (i = 0; i < ls.length; i++) {
      if (!ls[i].pauseAfter) continue;
      var r = lineEndRise(ls[i]);
      if (r !== null && r >= riseAt) read.risingEnds.push({ at: ls[i].end, rise: r });
    }
    if (opening !== null && opening !== undefined && st.length >= 25 && median(st) - opening >= PREVIEW.climb) read.climbing = true;

    if (read.pace !== null && read.pace > paceCeil) read.kinds.push('rushed');
    if (read.risingEnds.length || read.climbing) read.kinds.push('rising');
    if (read.movement !== null && read.movement < flatAt) read.kinds.push('flat');
    return read;
  }

  function framesBetween(frames, t0, t1) {
    var out = [];
    for (var i = 0; i < frames.length; i++) if (frames[i].t >= t0 && frames[i].t < t1) out.push(frames[i]);
    return out;
  }

  // ---------- review over a whole take ----------
  function review(frames, targets, intent, source) {
    var duration = frames.length ? frames[frames.length - 1].t + HOP : 0;
    var opening = openingPitch(frames);
    var whole = readWindow(frames, targets, null);
    var spans = { rushed: [], flat: [], rising: [] };

    for (var t1 = Math.min(REVIEW_WINDOW, duration); t1 <= duration + 1e-9; t1 += 0.25) {
      var t0 = Math.max(0, t1 - REVIEW_WINDOW);
      var r = readWindow(framesBetween(frames, t0, t1), targets, opening);
      if (r.kinds.indexOf('rushed') !== -1) spans.rushed.push([t0 + 0.5, t1 - 0.5]);
      if (r.kinds.indexOf('flat') !== -1) spans.flat.push([t0 + 0.5, t1 - 0.5]);
      if (r.climbing) spans.rising.push([t0 + 0.5, t1 - 0.5]);
      if (t1 >= duration) break;
    }
    // line ends that rose, read once over the whole take
    var ends = readWindow(frames, targets, null).risingEnds;
    for (var e = 0; e < ends.length; e++) spans.rising.push([Math.max(0, ends[e].at - 0.5), ends[e].at + 0.1]);

    var markers = [], totals = {}, counts = {};
    ORDER.forEach(function (kind) {
      var merged = mergeSpans(spans[kind], kind === 'rising' ? 0.3 : 0.8);
      if (kind !== 'rising') merged = merged.filter(function (s) { return s[1] - s[0] >= 0.8; });
      totals[kind] = 0; counts[kind] = merged.length;
      merged.forEach(function (s) {
        totals[kind] += s[1] - s[0];
        markers.push({ at: round2(s[0]), duration: round2(s[1] - s[0]), kind: kind, word: MARK[kind] });
      });
    });
    markers.sort(function (a, b) { return a.at - b.at; });

    var lineCount = lines(frames).filter(function (l) { return l.pauseAfter || l.end < duration - 0.2; }).length || 1;
    var significant = [], moments = [];
    ORDER.forEach(function (kind) {
      if (!counts[kind]) return;
      var big = kind === 'rising'
        ? (ends.length >= 2 && ends.length / lineCount >= 0.4) || totals.rising >= Math.max(3, 0.25 * whole.speaking)
        : totals[kind] >= Math.max(3, 0.25 * whole.speaking);
      (big ? significant : moments).push(kind);
    });

    return {
      intent: intent,
      source: source || 'generic',
      words: reviewWords(intent, source, whole.speaking, significant, moments, counts),
      markers: markers,
      duration: round2(duration),
      speaking: round2(whole.speaking),
      kinds: significant.concat(moments)
    };
  }

  function mergeSpans(list, gap) {
    if (!list.length) return [];
    var s = list.map(function (x) { return [Math.max(0, x[0]), Math.max(x[0], x[1])]; })
      .sort(function (a, b) { return a[0] - b[0]; });
    var out = [s[0].slice()];
    for (var i = 1; i < s.length; i++) {
      var last = out[out.length - 1];
      if (s[i][0] <= last[1] + gap) last[1] = Math.max(last[1], s[i][1]);
      else out.push(s[i].slice());
    }
    return out;
  }
  function round2(v) { return Math.round(v * 100) / 100; }

  function reviewWords(intent, source, speaking, significant, moments, counts) {
    var word = intent || 'that';
    var lead = source === 'personal' ? 'compared with your usual ' + word + ', it ' : 'you meant ' + word + '; it ';
    if (speaking < 1.5) {
      return source === 'personal'
        ? 'that take was short or quiet, so there is not much to compare with your usual ' + word + ' yet.'
        : 'you meant ' + word + '; that take was short or quiet, so there is not much to reflect back yet.';
    }
    var momentWords = moments.map(function (k) { return counts[k] > 1 ? MOMENT_MANY[k] : MOMENT_ONE[k]; });
    if (!significant.length && !moments.length) return lead + 'stayed with you.';
    if (!significant.length) return lead + 'mostly stayed with you, with ' + joinWords(momentWords) + '.';
    var s = lead + 'came out ' + joinWords(significant.map(function (k) { return CAME_OUT[k]; }));
    if (momentWords.length) s += ', with ' + joinWords(momentWords);
    return s + '.';
  }

  // ---------- plain numbers for a whole take (no judgement, no target) ----------
  function measureFrames(frames) {
    var w = readWindow(frames, null, null), ends = [];
    lines(frames).forEach(function (l) { if (l.pauseAfter) { var r = lineEndRise(l); if (r !== null) ends.push(r); } });
    return {
      speaking: round2(w.speaking), pace: w.pace, movement: w.movement, level: w.level, variation: w.variation,
      pausesPerMin: w.pausesPerMin, pauseLength: w.pauseLength, endRise: ends.length ? median(ends) : null
    };
  }
  function framesOf(buffer) {
    var sr = buffer.sampleRate;
    var data = buffer.getChannelData ? buffer.getChannelData(0) : buffer.data;
    var size = 1 << Math.round(Math.log(sr * 0.042) / Math.LN2); // about 40 ms
    var hop = Math.round(sr * HOP), tr = new Tracker(), k = 0;
    for (var start = 0; start + size <= data.length; start += hop, k++) tr.push(k * HOP, frameFeature(data.subarray(start, start + size), sr));
    return tr.frames;
  }
  function measure(buffer) { return measureFrames(framesOf(buffer)); }

  // ---------- offline: a whole finished take ----------
  function analyse(buffer, targets, intent, source) {
    var sr = buffer.sampleRate;
    var data = buffer.getChannelData ? buffer.getChannelData(0) : buffer.data;
    var size = 1 << Math.round(Math.log(sr * 0.042) / Math.LN2); // about 40 ms
    var hop = Math.round(sr * HOP), tr = new Tracker(), k = 0;
    for (var start = 0; start + size <= data.length; start += hop, k++) {
      tr.push(k * HOP, frameFeature(data.subarray(start, start + size), sr));
    }
    return review(tr.frames, targets, intent || (targets && targets.intent), source || (targets && targets.source));
  }

  // ---------- live reading of one take ----------
  function createReader() {
    var ctx = null, src = null, analyser = null, timer = null, tr = null, buf = null;
    var targets = null, t0 = 0, opening = null, active = {}, onSnap = null, last = null, evalAt = 0;

    function tick() {
      analyser.getFloatTimeDomainData(buf);
      var t = (tr.frames.length) * HOP;
      var f = tr.push(t, frameFeature(buf, ctx.sampleRate));
      if (opening === null) opening = openingPitch(tr.frames);
      if (t - evalAt < 0.25) { if (onSnap && last) { last.voice = f.speech; onSnap(last); } return; }
      evalAt = t;
      var r = readWindow(framesBetween(tr.frames, t - LIVE_WINDOW, t + HOP), targets, opening);
      ORDER.forEach(function (kind) {
        var on = r.kinds.indexOf(kind) !== -1, s = active[kind] || { hits: 0, misses: 0, on: false };
        if (on) { s.hits++; s.misses = 0; } else { s.misses++; s.hits = 0; }
        if (!s.on && s.hits >= 3) s.on = true;
        if (s.on && s.misses >= 3) s.on = false;
        active[kind] = s;
      });
      var drift = ORDER.filter(function (k) { return active[k] && active[k].on; });
      last = {
        t: t, voice: f.speech, pace: r.pace, movement: r.movement, level: r.level,
        variation: r.variation, pausesPerMin: r.pausesPerMin, pauseLength: r.pauseLength,
        drift: drift, nudge: drift.length ? NUDGE[drift[0]] : null
      };
      if (onSnap) onSnap(last);
    }

    return {
      start: function (stream, tgt, opts) {
        opts = opts || {};
        targets = tgt; onSnap = opts.onSnapshot || null;
        ctx = opts.audioContext || new (root.AudioContext || root.webkitAudioContext)();
        src = ctx.createMediaStreamSource(stream);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        buf = new Float32Array(analyser.fftSize);
        src.connect(analyser);
        tr = new Tracker(); opening = null; active = {}; last = null; evalAt = 0; t0 = Date.now();
        timer = setInterval(tick, HOP * 1000);
        return ctx;
      },
      setTargets: function (tgt) { targets = tgt; },
      snapshot: function () { return last; },
      stop: function (intent, source) {
        if (timer) clearInterval(timer);
        timer = null;
        try { if (src) src.disconnect(); } catch (e) { /* already gone */ }
        src = null; analyser = null;
        var frames = tr ? tr.frames : [];
        tr = null;
        var out = review(frames, targets, intent || (targets && targets.intent), source || (targets && targets.source));
        out.measure = measureFrames(frames);
        return out;
      },
      running: function () { return !!timer; },
      analyse: analyse
    };
  }

  var api = {
    createReader: createReader,
    analyse: analyse,
    measure: measure,
    reviewWords: reviewWords,
    NUDGE: NUDGE,
    MARK: MARK,
    PREVIEW: PREVIEW,
    _test: { Tracker: Tracker, frameFeature: frameFeature, estimatePitch: estimatePitch, readWindow: readWindow, review: review, HOP: HOP }
  };
  root.ozToneReader = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
