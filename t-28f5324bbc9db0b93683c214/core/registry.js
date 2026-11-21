/* oz core · the registry: how to add a tool, a room or a dial to any oz-family app (Gill, 19 Nov 2:17: "one module plus
   one registry entry"). Write the module; add ONE entry to ENTRIES below; nothing else changes. The core does the rest:
     tool .... { kind: 'tool', id, name, file, group?, vis? }
               The file sets GJ.<id> = { open() … }. It is not in the page at the start: core/lazy.js loads it in the
               background after the rooms (or at once when it is asked for); until then GJ.<id> is a stand-in. A row
               "<name> · open" appears in Tune (group: 'tools' unless given), and the service worker keeps the file.
     room .... { kind: 'room', id, name, file, group?, vis?, needs?, then? }
               The file sets GJ.rooms.<id> = { enter(), leave() … } (see js/loops.js). Loaded with the rooms after the
               first paint; Tune gets "<name> · open", which goes in (GJ.app.enter(id)); tapped early: a quiet wait.
               needs: files loaded before it, in order (its public stubs, helpers); then: files loaded after it (its seam
               with the app). The room is in once all of them are.
     dial .... { kind: 'dial', id, name, room, opts: [[value, word], …], get(), set(v), vis? }
               A ring on that room's own side dial ('sky' for the front sky), like a pinned setting.
   vis: 'public' (default) · 'owner' (only in the owner's builds; never on a public dial). An app takes only the tools its
   GJ_APP.lazy names, and only the rooms its GJ_APP.rooms names. GJ.registry.entries() lists what this app has. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {};
  var ENTRIES = [
    { kind: 'tool', id: 'about', name: 'About (tap-through profile)', file: 'js/about.js', group: 'tools' },
    { kind: 'tool', id: 'threads', name: 'Threads (what’s still open in a conversation)', file: 'js/threads.js', group: 'tools' },
    // Tone Check (Gill, 19 Nov): its public voiceProfile stub, the generic reader and the pack's icons load first; its seam with oz after
    { kind: 'room', id: 'tonecheck', name: 'Tone Check', file: 'js/tonecheck.js',
      needs: ['modules/voiceProfile/interface.js', 'modules/voiceProfile/stub.js', 'js/tonereader.js', 'js/tonecheck-icons.js'], then: ['js/tonecheck-oz.js'] }
  ];
  var APP = G.GJ_APP || {};
  function owner() { return !!(GJ.core && GJ.core.owner()); }
  function mine(e) {
    if (e.vis === 'owner' && !owner()) return false;
    if (e.kind === 'tool') return !APP.lazy || APP.lazy.indexOf(e.id) >= 0;
    if (e.kind === 'room') return !APP.rooms || APP.rooms.indexOf(e.id) >= 0;
    return true;
  }
  var list = ENTRIES.filter(mine);
  function mount() {   // the Tune rows (core/lazy.js calls this once its lists are set; core/tiers.js places them by group)
    var tune = document.getElementById('tune'); if (!tune) return;
    var rows = list.filter(function (e) { return e.kind !== 'dial' && !tune.querySelector('[data-t="' + e.id + '"]'); }); if (!rows.length) return;
    var h = document.createElement('h3'); h.className = 'jul'; h.textContent = 'More tools'; var at = document.getElementById('tn-rev'); tune.insertBefore(h, at);
    rows.forEach(function (e) { var d = document.createElement('div'); d.className = 'row'; d.dataset.reg = e.kind; d.innerHTML = e.name + '<button data-t="' + e.id + '"><b>open</b></button>'; tune.insertBefore(d, at); });
    tune.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('button[data-t]'); if (!b) return; var e = list.filter(function (x) { return x.id === b.dataset.t && x.kind !== 'dial'; })[0]; if (!e) return;
      if (GJ.app && GJ.app.tune) GJ.app.tune(false);
      if (e.kind === 'room') GJ.app.enter(e.id); else GJ.lazy.load(e.id).then(function (m) { if (m && m.open) m.open(); });
    });
  }
  GJ.registry = {
    entries: function () { return list.map(function (e) { return { kind: e.kind, id: e.id, name: e.name, group: e.group || 'tools', vis: e.vis || 'public' }; }); },
    tools: function () { var o = {}; list.forEach(function (e) { if (e.kind === 'tool') o[e.id] = (e.needs || []).concat([e.file], e.then || []); }); return o; },
    rooms: function () { var o = {}; list.forEach(function (e) { if (e.kind === 'room') o[e.id] = (e.needs || []).concat([e.file], e.then || []); }); return o; },
    groupOf: function (id) { var e = list.filter(function (x) { return x.id === id; })[0]; return e ? (e.group || 'tools') : null; },
    visOf: function (id) { var e = list.filter(function (x) { return x.id === id; })[0]; return e ? (e.vis || 'public') : null; },
    rings: function (room) { return list.filter(function (e) { return e.kind === 'dial' && e.room === room; }).map(function (e) { return { k: 'reg-' + e.id, name: e.name, opts: e.opts, get: e.get, set: e.set }; }); },
    mount: mount
  };
})(window);
