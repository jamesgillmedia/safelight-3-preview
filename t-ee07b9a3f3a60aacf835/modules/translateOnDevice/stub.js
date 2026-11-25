/* translateOnDevice · PUBLIC PREVIEW STUB (INTERFACES.md §11). Returns the original text, labelled
   "preview stub · translation". No engine, no web service. */
(function (G) {
  'use strict';
  var stub = { stub: true, translate: function (o) { return new Promise(function (ok) { setTimeout(function () { ok({ text: o && o.text || '', from: 'auto', to: (o && o.to) || 'en', stub: true, label: 'preview stub · translation' }); }, 400); }); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('translateOnDevice', stub);
})(window);
