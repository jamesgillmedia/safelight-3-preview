/* scanToMake · PUBLIC PREVIEW STUB (INTERFACES.md §5). From any model it gives a few labelled rectangles as panels
   (Front, Side, Back), a pattern of those rectangles with the chosen seam allowance, and a tech pack of obvious
   placeholder measurements — all marked "preview stub". It finds no seams and flattens nothing. */
(function (G) {
  'use strict';
  var st = { panels: [], allowance: 1, symmetry: true, material: null, rounds: [], seams: [] }, subs = {};
  function emit(e, x) { (subs[e] || []).forEach(function (f) { try { f(x); } catch (er) {} }); }
  var stub = { stub: true,
    open: function () { st.panels = [{ id: 'p1', name: 'Front', confirmed: false, w: 20, h: 12 }, { id: 'p2', name: 'Side', confirmed: false, w: 16, h: 12 }, { id: 'p3', name: 'Back', confirmed: false, w: 20, h: 12 }]; emit('panelsChanged', stub.panels()); return { stub: true }; },
    panels: function () { return st.panels.map(function (p) { return { id: p.id, name: p.name, confirmed: p.confirmed, stub: true }; }); },
    setSeams: function (o) { st.seams = (o && o.traces) || []; st.panels.forEach(function (p) { p.confirmed = st.seams.length > 0; }); emit('panelsChanged', stub.panels()); },
    namePanel: function (o) { st.panels.forEach(function (p) { if (p.id === o.panelId) p.name = o.name; }); emit('panelsChanged', stub.panels()); },
    setSymmetry: function (b) { st.symmetry = !!b; }, setSeamAllowance: function (cm) { st.allowance = Math.max(0, +cm || 0); emit('patternReady', stub.pattern()); },
    pattern: function () { return { stub: true, label: 'preview stub · not a real pattern', allowance: st.allowance, pieces: st.panels.map(function (p) { return { id: p.id, label: p.name, w: p.w, h: p.h, grain: 'vertical', notches: 2, allowance: st.allowance }; }) }; },
    chooseMaterial: function (o) { st.material = o.id; emit('materialPreviewed', { id: o.id, stub: true }); return { id: o.id, preview: true, stub: true }; },
    techPack: function () { return { stub: true, label: 'preview stub · placeholder measurements', views: ['front', 'side', 'back'], measurements: st.panels.map(function (p) { return [p.name, p.w + ' × ' + p.h + ' cm (placeholder)']; }), pieces: st.panels.length, materials: [st.material || 'not chosen'], construction: ['placeholder · seams sewn with a ' + st.allowance + ' cm allowance'], quantity: 'not set' }; },
    exportPack: function (o) { emit('exported', { formats: o.formats, stub: true }); return { stub: true }; },
    addSampleRound: function (o) { st.rounds.push(Object.assign({ at: Date.now(), approved: false }, o)); return st.rounds.slice(); },
    approve: function (o) { var r = st.rounds[st.rounds.length - 1]; if (r) { r.approved = true; r.quantity = o.quantity; r.dates = o.dates; } return st.rounds.slice(); },
    rounds: function () { return st.rounds.slice(); },
    on: function (e, f) { (subs[e] = subs[e] || []).push(f); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('scanToMake', stub);
})(window);
