/* essentials · PUBLIC PREVIEW STUB (INTERFACES.md §6). Off: every known room and tool is surfaced. On: a small fixed set
   stays essential (the sky, the Moon dial, the Mark and the Archive) plus anything pinned; the rest is hidden, never
   deleted. record() only moves what was just opened to the front, in last-used order. No scoring, no thresholds. */
(function (G) {
  'use strict';
  var KEY = 'oz-essentials', subs = [], S = { on: false, pinned: [], order: [] };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0) S = Object.assign(S, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} subs.forEach(function (f) { f(); }); }
  var ITEMS = [['sky', 'room', 'the sky'], ['moon', 'tool', 'the Moon dial'], ['mark', 'tool', 'the Mark'], ['archive', 'room', 'Archive'], ['red', 'room', 'Timer'], ['golden', 'room', 'Golden Hour'],
    ['loops', 'room', 'Loops'], ['player', 'room', 'Sky Player'], ['feed', 'room', 'Feed'], ['icons', 'room', 'Icon board'], ['loupe', 'room', 'Photo Lab']], ESS = ['sky', 'moon', 'mark', 'archive'];
  var stub = { stub: true,
    record: function (o) { var id = o && (o.roomId || o.toolId); if (!id) return; S.order = [id].concat(S.order.filter(function (x) { return x !== id; })).slice(0, 20); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} },
    setEssentials: function (b) { S.on = !!b; save(); },
    setPinned: function (o) { var id = o.roomId || o.toolId; S.pinned = S.pinned.filter(function (x) { return x !== id; }); if (o.pinned) S.pinned.push(id); save(); },
    list: function () { return ITEMS.map(function (it) { var id = it[0], st = !S.on ? 'surfaced' : S.pinned.indexOf(id) >= 0 ? 'pinned' : ESS.indexOf(id) >= 0 ? 'essential' : 'hidden'; return { id: id, kind: it[1], state: st, label: it[2] }; }); },
    essentialsOn: function () { return S.on; }, pinned: function () { return S.pinned.slice(); },
    on: function (e, f) { if (e === 'changed') subs.push(f); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('essentials', stub);
})(window);
