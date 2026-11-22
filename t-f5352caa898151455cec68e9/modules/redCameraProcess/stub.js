/* redCameraProcess · PUBLIC PREVIEW STUB (INTERFACES.md §15).
   Opt-in looks on a capture. The original is never changed. This stub does not alter pixels;
   every result is labelled "preview stub". Do not write a replacement engine. */
(function (G) {
  'use strict';
  function label() { return 'preview stub'; }
  var stub = {
    stub: true,
    listLooks: function () {
      return [
        { id: 'look-a', label: 'preview stub · a look', stub: true },
        { id: 'look-b', label: 'preview stub · another look', stub: true }
      ];
    },
    preview: function (o) {
      var src = o && o.source;
      return { before: src, after: src, label: label(), stub: true };
    },
    apply: function (o) {
      var src = o && o.source;
      return { original: src, processed: src, label: label(), stub: true };
    },
    cancel: function () { return { ok: true, stub: true }; }
  };
  if (G.oz && G.oz.private) G.oz.private.installStub('redCameraProcess', stub);
})(window);
