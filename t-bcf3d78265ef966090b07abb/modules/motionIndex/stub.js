/* motionIndex · PUBLIC PREVIEW STUB (INTERFACES.md §3). A small fixed set of evenly spaced placeholder frames with fake
   timecodes and one fake shot; density only changes how many (6, 9 or 12). stillsToMotion is a plain crossfade between
   the first and last given frames, tagged generated and preview stub. It picks nothing and generates nothing more. */
(function (G) {
  'use strict';
  var subs = {};
  function emit(e, x) { (subs[e] || []).forEach(function (f) { try { f(x); } catch (er) {} }); }
  function tc(s) { var m = Math.floor(s / 60), r = Math.floor(s % 60); return '00:' + (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  var stub = { stub: true,
    index: function (o) { var n = { fewer: 6, default: 9, more: 12 }[o && o.density] || 9, src = o && o.source || {}, frames = src.frames || [];
      emit('progress', { stage: 'reading', percent: 50 });
      var cells = []; for (var i = 0; i < n; i++) { var f = frames.length ? frames[Math.round(i * (frames.length - 1) / Math.max(1, n - 1))] : null; cells.push({ image: f, timecode: tc(i * 4), shotNumber: 1, motionLabel: 'preview stub', colours: [] }); }
      var sheet = { stub: true, label: 'preview stub · evenly spaced placeholder frames', layout: (o && o.layout) || 'grid', cells: cells }; emit('ready', sheet); return Promise.resolve(sheet); },
    exportSheet: function (o) { return { stub: true, json: { mock: true, formats: o.formats } }; },
    stillsToMotion: function (o) { var fr = o.frames || []; emit('progress', { stage: 'generating', percent: 100 }); return Promise.resolve({ generated: true, stub: true, mode: o.mode || 'smooth', label: 'generated · preview stub · a plain crossfade', first: fr[0], last: fr[fr.length - 1] }); },
    cancel: function () { emit('cancelled', {}); },
    on: function (e, f) { (subs[e] = subs[e] || []).push(f); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('motionIndex', stub);
})(window);
