/* oz 3 alt · a faster open (REFINE-PLAN: "load each room only when you go into it"). The core — the sky, the
   rooms on the front sky, the dials, red mode, Tune — loads as before. The tools you reach from Tune, the places sheet,
   the map or search (shrink, index, compare, picks, markup, the decision sheet, the archive player, the photo lab,
   objects, demos, about, welcome, balance, messages, friends, Mark II, the oz tuner, the shot planner) are not in the
   page at the start: each one loads the first time it is asked for, and then is exactly the module it always was.
     · Until it has loaded, GJ.<tool> is a small stand-in: a question ("is it open?", its state) gets a quiet "no";
       anything else (open, play, close) loads the file and then does it.
     · Once the sky is up and the phone is idle, the rest are fetched quietly in the background (warm-up), so the first
       tap on a tool is instant too. GJ.lazy.readyAt() says when that finished.
   No build step: the same files, listed here instead of in index.html. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {};
  var MODS = {   // the api name on GJ → its files, in order
    shrink: ['js/shrink.js'], mindex: ['js/mindex.js'], sweep: ['js/sweep.js'], picks: ['js/picks.js'], markup: ['js/markup.js'],
    decide: ['js/decide.js'], aplayer: ['js/aplayer.js'], demos: ['js/demos.js'], objects: ['js/objects.js'],
    lab: ['js/photolab.js'], planner: ['apps/good-weather/js/planner.js'], welcome: ['js/welcome.js'], balance: ['js/balance.js'], messages: ['js/emoji-data.js', 'js/messages.js'],
    friends: ['js/friends.js'], mark2: ['js/mark2.js'], oztune: ['js/oztune.js']
  };
  /* the rooms (Gill, 19 Nov 2:24: "core first"): the page itself loads only the shell, the sky, the Moon dial, the Mark and
     Tune's way in. The rooms' own modules (Loops, the Sky player, the Archive and its board) come right after the first
     paint, in the background, in this order. A room tapped before its module is in loads it at once (core/app.js: a quiet
     wait, the Mark breathing). Unlike the tools there is no stand-in: until a room is in, GJ.<room> is simply not there, as
     every caller already allows. */
  var ROOMS = { loops: ['js/loops.js'], player: ['js/player.js'], archive: ['js/archive-index-data.js', 'js/beyond-data.js', 'js/archive.js', 'js/board-data.js', 'js/board.js'] };
  var RORDER = ['player', 'loops', 'archive'];
  if (GJ.registry) { var RR = GJ.registry.rooms(); Object.keys(RR).forEach(function (k) { if (!ROOMS[k]) { ROOMS[k] = RR[k]; RORDER.push(k); } }); }
  var ORDER = ['picks', 'markup', 'decide', 'aplayer', 'about', 'demos', 'objects', 'lab', 'planner', 'welcome', 'balance', 'shrink', 'mindex', 'sweep', 'messages', 'friends', 'mark2', 'oztune'];   // the order they were in the page
  // the registry's tools and rooms (core/registry.js: one module + one entry), in after the ones named here
  if (GJ.registry) { var RT = GJ.registry.tools(); Object.keys(RT).forEach(function (k) { if (!MODS[k]) { MODS[k] = RT[k]; if (ORDER.indexOf(k) < 0) ORDER.push(k); } }); }
  var QUERY = /^(is[A-Z]|has|can|comparing$|state$|plans$|count$|rows$)/;
  // the folder the app's files are in: from this file's own address (core/lazy.js, or a packed preview's pack/*.js)
  var base = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/(core\/lazy|pack\/[\w.-]+)\.js(\?.*)?$/, '') : ''; })();
  var loading = {}, loaded = {}, readyAt = null, log = [];
  function script(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = base + src; s.async = false; s.onload = res; s.onerror = function () { rej(new Error('could not load ' + src)); }; document.head.appendChild(s); }); }
  function load(k) {
    if (loaded[k]) return Promise.resolve(GJ[k]);
    if (loading[k]) return loading[k];
    var t0 = G.performance ? performance.now() : 0;
    loading[k] = MODS[k].reduce(function (p, f) { return p.then(function () { return script(f); }); }, Promise.resolve()).then(function () {
      loaded[k] = true; log.push([k, Math.round((G.performance ? performance.now() : 0) - t0)]); return GJ[k];
    });
    return loading[k];
  }
  var rLoading = {}, rLoaded = {}, roomsAt = null;
  function room(id) {
    if (!ROOMS[id]) return Promise.resolve(null);
    if (rLoaded[id]) return Promise.resolve(id);
    if (rLoading[id]) return rLoading[id];
    var t0 = G.performance ? performance.now() : 0;
    rLoading[id] = ROOMS[id].reduce(function (p, f) { return p.then(function () { return script(f); }); }, Promise.resolve()).then(function () {
      rLoaded[id] = true; log.push(['room:' + id, Math.round((G.performance ? performance.now() : 0) - t0)]);
      try { if (GJ.app && GJ.app.reapply) GJ.app.reapply(); if (GJ.tunekit && GJ.tunekit.relist) GJ.tunekit.relist(); if (GJ.app && GJ.app.refreshRings) GJ.app.refreshRings(); } catch (e) {}
      return id;
    });
    return rLoading[id];
  }
  function roomsBatch() {
    var i = 0;
    (function next() { if (i >= RORDER.length) { roomsAt = G.performance ? performance.now() : 0; return; } room(RORDER[i++]).then(function () { setTimeout(next, 0); }, function () { setTimeout(next, 0); }); })();
  }
  function stand(k) {   // the stand-in until the real module is in
    return new Proxy({}, { get: function (t, prop) {
      if (typeof prop !== 'string' || prop === 'then') return undefined;
      if (loaded[k] && GJ[k] && GJ[k] !== stub[k]) return GJ[k][prop];
      if (prop === '__lazy') return true;
      if (QUERY.test(prop)) return function () { return prop === 'state' ? {} : prop === 'plans' ? [] : false; };
      return function () { var a = arguments; load(k).then(function (real) { if (real && typeof real[prop] === 'function') real[prop].apply(real, a); }); };
    } });
  }
  // each app of the oz family offers its own tools (GJ.APP.lazy); the others are simply not there in that app
  var APP = GJ.APP || {};
  if (APP.lazy) Object.keys(MODS).forEach(function (k) { if (APP.lazy.indexOf(k) < 0) delete MODS[k]; });
  ORDER = ORDER.filter(function (k) { return MODS[k]; });
  var stub = {};
  Object.keys(MODS).forEach(function (k) { if (!GJ[k]) { stub[k] = stand(k); GJ[k] = stub[k]; } });
  function warm() {   // the rest, quietly, once the sky is up and the phone is idle — one at a time
    var i = 0;
    (function next() { if (i >= ORDER.length) { readyAt = G.performance ? performance.now() : 0; return; } var k = ORDER[i++]; load(k).then(function () { setTimeout(next, 0); }, function () { setTimeout(next, 0); }); })();
  }
  var idle = G.requestIdleCallback || function (f) { return setTimeout(f, 200); };
  var APPR = GJ.APP && GJ.APP.rooms; Object.keys(ROOMS).forEach(function (k) { if ((APPR && APPR.indexOf(k) < 0) || (G.GJ_EAGER && G.GJ_EAGER[k])) delete ROOMS[k]; }); RORDER = RORDER.filter(function (k) { return ROOMS[k]; });
  // the first paint, then the rooms (an idle moment, or 300 ms at most), then the tools
  G.addEventListener('load', function () { requestAnimationFrame(function () { setTimeout(function () { idle(roomsBatch, { timeout: 300 }); setTimeout(function () { idle(warm, { timeout: 1200 }); }, 250); }, 0); }); });
  if (GJ.registry) GJ.registry.mount();
  GJ.lazy = { room: room, isRoom: function (id) { return !!ROOMS[id] && !rLoaded[id]; }, rooms: function () { return Object.keys(rLoaded); }, roomsAt: function () { return roomsAt; }, load: load, loaded: function (k) { return k ? !!loaded[k] : Object.keys(loaded); }, names: function () { return Object.keys(MODS); }, readyAt: function () { return readyAt; }, log: function () { return log.slice(); },
    all: function () { return Promise.all(Object.keys(MODS).map(load)); } };
})(window);
