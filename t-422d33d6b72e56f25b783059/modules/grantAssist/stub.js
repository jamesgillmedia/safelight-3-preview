/* grantAssist · PUBLIC PREVIEW STUB (Grant room, 23 Nov 2026). There is no writing helper in this preview. suggest()
   sends nothing and offers nothing; it answers after a moment so the room can show what asking looks like (F3 lit while
   "asking", then dark). The room's own on-device checks still work without it. */
(function (G) {
  'use strict';
  var stub = { stub: true,
    available: function () { return false; },
    where: function () { return 'cloud'; },
    suggest: function () { return new Promise(function (ok) { setTimeout(function () { ok({ offers: [], stub: true, note: 'preview stub · there is no writing helper here, and nothing was sent' }); }, 900); }); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('grantAssist', stub);
})(window);
