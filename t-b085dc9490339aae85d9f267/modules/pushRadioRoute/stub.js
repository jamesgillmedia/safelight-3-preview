/* pushRadioRoute · PUBLIC PREVIEW STUB (Push Radio, 23 Nov 2026). This web preview has no radios: it finds no phones,
   carries no live voice and routes nothing. What it does, all labelled:
     reach ........ Circle's people are "not in reach" (true here). The Preview chat with Artist Agent contact is in reach
                    "via relay" while the preview (Test with me) is on.
     startTalk .... nothing is transmitted; the room keeps its own recording in the sealed thread.
     relay ........ Test with me: no relay server exists in this preview. After you talk, a short example reply (a soft
                    tone, made here) comes back from the Artist Agent, marked "example reply · preview stub".
   No network. No discovery. Nothing leaves this phone. */
(function (G) {
  'use strict';
  var subs = { incoming: [], reach: [] }, joined = false, relayOn = false, internet = false;
  function emit(ev, x) { (subs[ev] || []).forEach(function (f) { try { f(x); } catch (e) {} }); }
  function people() { var C = G.GJ && G.GJ.circle; return C && C.people ? C.people().filter(function (p) { return p && p.name && !p.hidden && p.kind !== 'oz' && p.kind !== 'creator' && p.kind !== 'test'; }) : []; }
  function reach() {
    return people().map(function (p) {
      if (p.kind === 'agent') return { id: p.id, path: relayOn ? 'relay' : null, inReach: relayOn };
      return { id: p.id, path: null, inReach: false };
    });
  }
  var exUrl = null;
  function exampleReply() {   // a soft two-note answer with a radio chirp before it, ~2.4 s
    if (exUrl) return exUrl;
    var sr = 22050, n = Math.round(sr * 2.4), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), i, w = function (o, s) { for (var k = 0; k < s.length; k++) v.setUint8(o + k, s.charCodeAt(k)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (i = 0; i < n; i++) { var t = i / sr, s = 0;
      if (t < .12) s = Math.sin(2 * Math.PI * (1400 + 2400 * t) * t) * .35;
      else { var f = t < 1.2 ? 330 : 392, ph = t < 1.2 ? (t - .12) / 1.08 : (t - 1.2) / 1.2, env = Math.min(1, ph * 8) * Math.min(1, (1 - ph) * 3); s = (Math.sin(2 * Math.PI * f * t) + .25 * Math.sin(4 * Math.PI * f * t)) * .4 * env; }
      v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 24000, true); }
    exUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })); return exUrl;
  }
  var stub = {
    stub: true,
    tiers: function () { return [{ tier: 1, path: 'local', state: 'preview stub · needs the iPhone app' }, { tier: 2, path: 'lora', state: 'later' }, { tier: 3, path: 'ham', state: 'later' }]; },
    reach: reach,
    join: function () { joined = true; emit('reach', reach()); return Promise.resolve({ joined: true, stub: true }); },
    leave: function () { joined = false; emit('reach', reach()); return Promise.resolve({ joined: false }); },
    joined: function () { return joined; },
    startTalk: function (o) {
      var t0 = Date.now(), to = o && o.to;
      return { stub: true, stop: function () {
        var ms = Date.now() - t0;
        if (relayOn && (to === 'channel' || to === 'agent') && ms > 300) setTimeout(function () {   // Test with me: the example answer
          emit('incoming', { from: 'agent', live: exampleReply(), clip: exampleReply(), request: false, path: 'relay', example: true, label: 'example reply · preview stub' }); }, 1600);
        return Promise.resolve({ ms: ms, sent: false, stub: true }); } };
    },
    on: function (ev, fn) { (subs[ev] = subs[ev] || []).push(fn); },
    allowInternet: function (v) { if (v != null) internet = !!v; return internet; },
    relay: function (v) { if (v != null) { relayOn = !!v; emit('reach', reach()); } return relayOn; }
  };
  if (G.oz && G.oz.private) G.oz.private.installStub('pushRadioRoute', stub);
})(window);
