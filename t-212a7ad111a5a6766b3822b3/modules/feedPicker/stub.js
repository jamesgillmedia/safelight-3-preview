/* feedPicker · PUBLIC PREVIEW STUB (INTERFACES.md §7). A fixed set of example cards, one per reason, in a fixed order.
   It does not look at the items it is given; it picks nothing. Every card says "example". No network.
     pick({ items, today, count }) → cards[] · dismiss({ id }) · on('changed', fn) */
(function (G) {
  'use strict';
  var KEY = 'oz-feed-dismissed', subs = [];
  function today() { return new Date().toISOString().slice(0, 10); }
  function gone() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && o.d === today() ? o.ids : []; } catch (e) { return []; } }
  var FIXED = [
    { id: 'ex-frame', kind: 'frame', reason: 'light-like-today', label: 'example · light like today', itemId: 'sample:stay-gold-hero' },
    { id: 'ex-loop', kind: 'loop', reason: 'on-this-day', label: 'example · a year ago today', itemId: 'example-loop' },
    { id: 'ex-note', kind: 'note', reason: 'note-with-clip', label: 'example · your note on this clip', itemId: 'example-note', linkedItemId: 'sample:drift-hero' },
    { id: 'ex-day', kind: 'day', reason: 'shot-in-this-light', label: 'example · you shot in light like this on 14 Oct', itemId: 'example-day' },
    { id: 'ex-timer', kind: 'timer', reason: 'recent-session', label: 'example · a session from last week', itemId: 'example-session' }
  ];
  var stub = {
    stub: true,
    pick: function (o) { var n = o && o.count != null ? o.count : FIXED.length, g = gone();
      return FIXED.filter(function (c) { return g.indexOf(c.id) < 0; }).slice(0, n).map(function (c) { var x = JSON.parse(JSON.stringify(c)); x.example = true; return x; }); },
    dismiss: function (o) { var g = gone(); if (o && g.indexOf(o.id) < 0) g.push(o.id); try { localStorage.setItem(KEY, JSON.stringify({ d: today(), ids: g })); } catch (e) {} subs.forEach(function (f) { f(); }); },
    on: function (ev, fn) { if (ev === 'changed') subs.push(fn); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} subs.forEach(function (f) { f(); }); }
  };
  if (G.oz && G.oz.private) G.oz.private.installStub('feedPicker', stub);
})(window);
