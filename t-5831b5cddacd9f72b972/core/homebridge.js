/* oz · one room lifecycle across Home and the app (catch-up, 23 Nov 2026).
   Home (apps/oz-open) is the launcher. When it opens a room that lives in the app, it comes here with
   ?go=<id>&home=1. This file opens that room, shows the shared room bar (the Mark is back, the room's name beside it,
   the small time at the right, the red-mode dot and F3 where they always are), and when the room is left — the Mark,
   an edge swipe, Escape, the room's own "done" — it goes back to Home with the same fade it came in on.
   From Home, the app's own sky is never a stop: whatever you leave, you land on Home.
   Opened directly (no home=1), the app behaves exactly as before. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, html = document.documentElement, Q = new URLSearchParams(location.search);
  var HOME = 'apps/good-weather/index.html';   // from the app's base (both apps use <base href="../../">)
  /* what each Home place opens here, and how to tell it is still open. room: an app room (GJ.app.enter).
     tool: GJ.<k>.open(). go: the Mark's own opener (GJ.mark.go). Names are the ones Home and the bar show. */
  var T = {
    timer: { name: 'timer', room: 'red' }, player: { name: 'sky player', room: 'player' }, archive: { name: 'archive', room: 'archive' },
    loops: { name: 'loops', room: 'loops' }, feed: { name: 'feed', room: 'feed' }, tonecheck: { name: 'tone check', room: 'tonecheck' },
    notes: { name: 'notes', tool: 'notes' }, messages: { name: 'messages', tool: 'messages' }, friends: { name: 'friends', tool: 'friends' },
    phone: { name: 'phone', tool: 'phone' }, camera: { name: 'camera', tool: 'camera' }, browser: { name: 'browser', tool: 'browser' },
    map: { name: 'map', tool: 'navmap' }, addarchive: { name: 'add to archive', tool: 'addArchive' }, relay: { name: 'private relay', tool: 'relay' },
    scanner: { name: 'scan an object', tool: 'scanner' }, scantomake: { name: 'scan to make', tool: 'make' }, designlog: { name: 'design log', tool: 'designLog' },
    contactsheet: { name: 'contact sheet', tool: 'contactSheet' }, walk: { name: 'sweep · walk', go: 'walk' },
    aplayer: { name: 'archive player', run: function () { GJ.app.enter('archive'); setTimeout(function () { GJ.aplayer.playCurrent(); }, 700); }, test: function () { return GJ.aplayer && GJ.aplayer.isOn && GJ.aplayer.isOn(); } },
    markup: { name: 'review markup', run: function () { GJ.app.enter('archive'); setTimeout(function () { GJ.markup.on(true); }, 700); }, test: function () { return GJ.markup && GJ.markup.isOn && GJ.markup.isOn(); } },
    conedit: { name: 'constellations', run: function () { if (GJ.cons && GJ.cons.edit) { var n = GJ.sky && GJ.sky.nodes && GJ.sky.nodes.filter(function (k) { return k.stars; })[0]; GJ.cons.edit(n ? n.id : 'archive'); } }, test: function () { return GJ.cons && GJ.cons.isOpen && GJ.cons.isOpen(); } },
    lab: { name: 'photo lab', tool: 'lab' }, picks: { name: 'picks board', tool: 'picks' }, decide: { name: 'decision sheet', tool: 'decide' },
    sweep: { name: 'compare', tool: 'sweep' }, objects: { name: 'objects', tool: 'objects' }, demos: { name: 'demo room', tool: 'demos' },
    mindex: { name: 'index a clip', tool: 'mindex' }, shrink: { name: 'shrink a clip', tool: 'shrink' }, oztune: { name: 'oz icon', tool: 'oztune' },
    balance: { name: 'balance', tool: 'balance' }, welcome: { name: 'welcome', tool: 'welcome' }, about: { name: 'about', tool: 'about' },
    planner: { name: 'shot planner', tool: 'planner' }, tune: { name: 'tune', run: function () { GJ.app.tune(true); }, test: function () { return html.classList.contains('tune'); } },
    golden: { name: 'good weather', run: function () { GJ.goodWeather.open(0); }, test: function () { return GJ.goodWeather && GJ.goodWeather.isOpen(); } }
  };
  // every full-screen room and sheet in the app (the dock's own list, js/dock.js), plus the rooms added this pass
  var FULL = ['tune', 'messaging', 'browsing', 'gw-on', 'loving', 'asking', 'camming', 'befriending', 'noting', 'mapping', 'places', 'shelving', 'threading', 'picking', 'welcoming', 'deciding',
    'mindexing', 'sweeping', 'demoing', 'chap', 'inroom', 'marking', 'circling', 'agenting', 'th-filling', 'phoning', 'aplaying', 'planning', 'balancing', 'abouting', 'shrinking', 'labbing'];
  var id = Q.get('go') || Q.get('tool') || Q.get('room'), fromHome = Q.get('home') === '1' && !!(id && T[id]);
  function isOpenNow() {
    var t = T[id] || {};
    if (GJ.app && GJ.app.room) return true;
    if (FULL.some(function (c) { return html.classList.contains(c); })) return true;
    if (document.querySelector('.oz-sheet.in, .gj-sheet.in')) return true;
    var g = t.tool && GJ[t.tool]; try { if (g && !g.__lazy && ((g.isOpen && g.isOpen()) || (g.isOn && g.isOn()))) return true; } catch (e) {}
    try { if (t.test && t.test()) return true; } catch (e) {}
    try { if (GJ.ozsweep && GJ.ozsweep.isWalking && GJ.ozsweep.isWalking()) return true; } catch (e) {}
    return false;
  }
  var NEEDS_ARCHIVE = { picks: 1, decide: 1, markup: 1, aplayer: 1 };   // these read the Archive when they load: it comes in first
  function openIt() {
    var t = T[id];
    if (NEEDS_ARCHIVE[id] && !GJ.archive && GJ.lazy && GJ.lazy.room) { GJ.lazy.room('archive').then(function () { setTimeout(openIt, 0); }); return; }
    if (t.room) { if (GJ.app && GJ.app.enter) GJ.app.enter(t.room); return; }
    if (t.run) { t.run(); return; }
    if (t.go) { GJ.mark.go(t.go); return; }
    var g = GJ[t.tool];
    if (g && typeof g.open === 'function') g.open();
    else if (GJ.lazy && GJ.lazy.load) GJ.lazy.load(t.tool).then(function (m) { if (m && m.open) m.open(); });
  }
  var left = false;
  function home() {   // the one way out of an app room when you came from Home: back to Home, on the same fade
    if (left) return; left = true; html.classList.add('fh-out');
    var red = html.classList.contains('red') ? 1 : 0;
    setTimeout(function () { location.href = HOME + '?boot=0&from=' + encodeURIComponent(id) + '&red=' + red; }, 220);
  }
  /* the room bar: the Mark (back) at the left, the room's name beside it (#back, the app's own slot), the small time at the right */
  var tm = null;
  function bar() {
    tm = document.createElement('time'); tm.id = 'ozbar-time'; tm.setAttribute('aria-label', 'time'); (document.getElementById('chrome') || document.body).appendChild(tm);   // in the chrome: it rides above a room exactly as the Mark and the dot do
    var b = document.getElementById('back'); if (b) { b.textContent = T[id].name; b.setAttribute('aria-label', 'back · ' + T[id].name); }
    (function clock() { var t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, ''); if (tm.textContent !== t) tm.textContent = t; setTimeout(clock, 1000 * (60 - new Date().getSeconds()) + 50); })();
  }
  function namePaint() {   // the bar names what is open now (a room you switched to from inside is named, too)
    var b = document.getElementById('back'); if (!b) return; var nm = T[id].name, r = GJ.app && GJ.app.room;
    var own = false; try { own = !!(T[id].test && T[id].test()) || (id === 'walk' && GJ.ozsweep && GJ.ozsweep.isWalking()); } catch (e) {}
    if (r && r !== T[id].room && !own) { var k = Object.keys(T).filter(function (x) { return T[x].room === r; })[0]; nm = k ? T[k].name : r; }
    if (b.textContent !== nm) b.textContent = nm;
  }
  // one Tune: the app's Tune opens the Home Screen's own rows (they live with Home), and Home's settings open this Tune
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('#tune button[data-t="homescreen"]'); if (!b) return; e.stopPropagation(); html.classList.add('fh-out');
    var st = document.createElement('style'); st.textContent = 'html.fh-out body{opacity:0;transition:opacity .22s ease}'; document.head.appendChild(st);
    setTimeout(function () { location.href = HOME + '?boot=0&tune=1&from=tune'; }, 220); }, true);
  GJ.homebridge = { fromHome: function () { return fromHome; }, id: function () { return fromHome ? id : null; }, home: home, places: function () { return Object.keys(T).map(function (k) { return { id: k, name: T[k].name }; }); } };
  if (!fromHome) return;
  html.classList.add('fromhome');
  var css = document.createElement('style'); css.textContent =
    'html.fromhome body{opacity:0;transition:opacity .3s ease}html.fromhome.fh-in body{opacity:1}html.fromhome.fh-out body{opacity:0;transition:opacity .22s ease}' +
    'html.fromhome #back{opacity:1;pointer-events:auto;left:calc(var(--edge) + 82px);max-width:calc(100vw - 200px);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
    'html.fromhome #mark .chev{width:7px;opacity:1}' +
    '#ozbar-time{position:absolute;top:var(--top);right:calc(var(--edge) + 60px);height:44px;display:flex;align-items:center;font:300 12px/1 Poppins,sans-serif;letter-spacing:.04em;color:var(--meta);font-variant-numeric:tabular-nums;pointer-events:none;opacity:0;transition:opacity .35s ease}' +
    'html.fromhome.fh-in #ozbar-time{opacity:.9}';
  document.head.appendChild(css);
  function start() {
    bar(); openIt();
    var t0 = Date.now(), opened = false;
    (function wait() {   // the room fades in once it is really there (a room still loading waits quietly, up to 4 s)
      if (isOpenNow() || Date.now() - t0 > 4000) { opened = isOpenNow(); html.classList.add('fh-in'); watch(); return; }
      setTimeout(wait, 60);
    })();
    function watch() {   // once nothing is open any more, you have left the room: Home
      var miss = 0;
      (function look() { if (left) return; namePaint(); if (isOpenNow()) { opened = true; miss = 0; } else if (opened && ++miss >= 2) { home(); return; } setTimeout(look, 120); })();
    }
    // Escape with nothing to close, and the Mark's own "home": Home
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !isOpenNow()) home(); });
    function walking() { try { return !!(GJ.ozsweep && GJ.ozsweep.isWalking && GJ.ozsweep.isWalking()); } catch (e) { return false; } }   // the sweep walk steps through the app on its own
    if (GJ.mark && GJ.mark.home) { var h0 = GJ.mark.home; GJ.mark.home = function () { if (walking()) return h0.apply(this, arguments); home(); }; }
    if (GJ.app && GJ.app.toSky) { var s0 = GJ.app.toSky; GJ.app.toSky = function () { if (walking()) return s0.apply(this, arguments); home(); }; }
  }
  if (document.readyState === 'complete') setTimeout(start, 30); else G.addEventListener('load', function () { setTimeout(start, 30); });
})(window);
