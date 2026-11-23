/* privateRelay · PUBLIC PREVIEW STUB (INTERFACES.md §13). No network, no pairing, no encryption, no relay host. Every
   result is labelled "preview stub"; the review link is a fake address that goes nowhere. */
(function (G) {
  'use strict';
  var links = [], paired = {};
  var stub = { stub: true,
    status: function () { return { stub: true, paired: false, devices: Object.keys(paired) }; },
    pairDevice: function (o) { paired[o.kind] = 'preview stub · not paired'; return { stub: true, kind: o.kind, state: 'preview stub · not paired' }; },
    sync: function () { return { ok: true, items: 0, stub: true }; },
    createReviewLink: function (o) { var d = Math.max(1, Math.min(7, o.days || 3)), url = 'https://preview-stub.invalid/review/' + Math.random().toString(36).slice(2, 10), L = { url: url, expires: Date.now() + d * 86400000, kind: o.kind, id: o.id, stub: true }; links.push(L); return L; },
    revokeReviewLink: function (o) { links = links.filter(function (l) { return l.url !== o.url; }); return { ok: true, stub: true }; },
    links: function () { return links.slice(); },
    mergeFeedback: function (o) { return [{ who: 'example reviewer', frame: 3, note: 'preview stub · the push-in could land a beat later', stub: true }, { who: 'example reviewer', frame: 7, note: 'preview stub · love this light', stub: true }]; } };
  if (G.oz && G.oz.private) G.oz.private.installStub('privateRelay', stub);
})(window);
