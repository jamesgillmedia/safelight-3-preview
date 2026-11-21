/* translateOnDevice · PUBLIC PREVIEW STUB (INTERFACES.md §11). Returns the original text, labelled
   "preview stub · translation". No engine, no web service. */
(function (G) {
  'use strict';
  var stub = { stub: true, translate: function (o) { return Promise.resolve({ text: o.text, from: 'auto', to: o.to || 'en', label: 'preview stub · translation' }); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('translateOnDevice', stub);
})(window);
