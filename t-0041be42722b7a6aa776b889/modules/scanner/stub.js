/* scanner · PUBLIC PREVIEW STUB (INTERFACES.md §4). Coverage fills on a plain timer while a capture runs, whatever the
   camera does; when "ready" it gives a labelled placeholder cup, fake dimensions and a sheet of grey placeholder frames.
   It rebuilds nothing. Every result says "preview stub". */
(function (G) {
  'use strict';
  var subs = {}, timer = null, cov = 0, RINGS = 12, video = null;
  function emit(e, x) { (subs[e] || []).forEach(function (f) { try { f(x); } catch (er) {} }); }
  function rings() { var o = []; for (var i = 0; i < RINGS; i++) o.push({ id: 'r' + i, filled: i < Math.floor(cov * RINGS) }); return o; }
  var stub = { stub: true,
    start: function (o) { cov = 0; clearInterval(timer); timer = setInterval(function () { cov = Math.min(1, cov + .025); emit('coverageChanged', { coverage: cov, rings: rings(), stub: true }); if (cov >= 1) { clearInterval(timer); emit('previewReady', { stub: true }); emit('modelReady', stub.result()); } }, 120); return { mode: o && o.mode, stub: true }; },
    ingest: function (o) { video = o && o.video || null; },
    cancel: function () { clearInterval(timer); cov = 0; emit('coverageChanged', { coverage: 0, rings: rings(), stub: true }); },
    retry: function () { stub.cancel(); },
    result: function () { return { stub: true, label: 'preview stub · placeholder cup', previewModel: { kind: 'cup', stub: true }, scale: { w: 8.4, h: 9.6, d: 8.4, unit: 'cm', stub: true },
      sheet: { stub: true, cells: [0, 1, 2, 3, 4, 5].map(function (i) { return { image: null, timecode: '00:00:0' + i, shotNumber: 1, motionLabel: 'preview stub', colours: [] }; }) }, originalVideo: video }; },
    placeInEnvironment: function () { return { stub: true }; }, orbitModel: function () {}, pushIn: function () {}, fling: function () {}, goHome: function () {},
    exportModel: function (o) { var out = {}; (o.formats || []).forEach(function (f) { out[f] = f === 'usdz' ? 'not in this preview stub' : f === 'obj' ? OBJ : 'preview stub'; }); emit('exported', { formats: o.formats, paths: out, stub: true }); return out; },
    on: function (e, f) { (subs[e] = subs[e] || []).push(f); } };
  var OBJ = '# preview stub · placeholder cup (not a scan)\n' + (function () { var v = '', f = '', n = 16; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; v += 'v ' + (4.2 * Math.cos(a)).toFixed(3) + ' 0 ' + (4.2 * Math.sin(a)).toFixed(3) + '\nv ' + (4.2 * Math.cos(a)).toFixed(3) + ' 9.6 ' + (4.2 * Math.sin(a)).toFixed(3) + '\n'; }
    for (var j = 0; j < n; j++) { var a1 = j * 2 + 1, b1 = ((j + 1) % n) * 2 + 1; f += 'f ' + a1 + ' ' + b1 + ' ' + (b1 + 1) + ' ' + (a1 + 1) + '\n'; } return v + f; })();
  if (G.oz && G.oz.private) G.oz.private.installStub('scanner', stub);
})(window);
