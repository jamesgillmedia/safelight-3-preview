/* messageCrypto · PUBLIC PREVIEW STUB (INTERFACES.md §9). Passes the payload through unchanged and marks it
   { stub: true }; verify() returns "preview stub". It seals nothing. */
(function (G) {
  'use strict';
  var stub = { stub: true,
    seal: function (o) { return { stub: true, payload: o.payload }; },
    open: function (o) { return o.sealed && o.sealed.payload; },
    verify: function () { return 'preview stub'; } };
  if (G.oz && G.oz.private) G.oz.private.installStub('messageCrypto', stub);
})(window);
