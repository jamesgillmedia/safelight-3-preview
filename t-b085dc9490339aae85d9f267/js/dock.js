/* bubble round, item 2 · the dock: a few apps along the foot of the sky, each a dotted star-line icon that follows the
   light (night · red · rose · light · Full red). No labels on the icons (each button still has its name for VoiceOver).
   Gill's defaults: Notes and Chat. Tune → Dock: the dock on or off, and which apps sit in it (up to six).
   It shows on the sky, and steps aside in rooms, sheets and Tune.   GJ.dock */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, html = document.documentElement, IC = G.OZ_DOCK_ICONS, tune = document.getElementById('tune'); if (!IC) return;
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function lazy(k, fn) { if (GJ.lazy && GJ.lazy.load) GJ.lazy.load(k).then(fn); }
  var OPEN = {
    notes: function () { if (GJ.notes) GJ.notes.open(); },
    chat: function () { if (GJ.messages && GJ.messages.open) GJ.messages.open(); else lazy('messages', function () { GJ.messages.open(); }); },
    ask: function () { if (GJ.ask) GJ.ask.open(); },
    weather: function () { if (GJ.goodWeather) GJ.goodWeather.open(0); },
    timer: function () { app.enter('red'); },
    browser: function () { if (GJ.browser) GJ.browser.open(); },
    circle: function () { if (GJ.circle && GJ.circle.open) GJ.circle.open(); else if (GJ.friends && GJ.friends.open) GJ.friends.open(); else lazy('friends', function () { GJ.friends.open(); }); },   // the Circle room (r5b); Friends if it is missing
    camera: function () { if (GJ.camera) GJ.camera.open(); },
    archive: function () { app.enter('archive'); },
    map: function () { if (GJ.navmap) GJ.navmap.open(); }
  };
  var MAX = 6;
  var el = document.createElement('nav'); el.id = 'dock'; el.setAttribute('aria-label', 'the dock'); document.body.appendChild(el);
  function mode() { return GJ.depth ? GJ.depth.family() : (store.get().red ? 'red' : 'night'); }
  function apps() { var a = store.get().dockApps; return (a && a.length ? a : ['notes', 'chat']).filter(function (k) { return OPEN[k]; }).slice(0, MAX); }
  var last = '';
  function paint() {
    var m = mode(), list = apps(), key = m + '|' + list.join(','); if (key === last) return; last = key;
    el.innerHTML = list.map(function (k) { return '<button type="button" data-app="' + k + '" aria-label="' + IC.label(k) + '">' + IC.svg(k, m) + '</button>'; }).join('');
  }
  var FULL = ['tune', 'messaging', 'browsing', 'gw-on', 'loving', 'asking', 'camming', 'befriending', 'noting', 'mapping', 'places', 'shelving', 'threading', 'picking', 'welcoming', 'deciding', 'mindexing', 'sweeping', 'demoing', 'chap', 'inroom', 'marking', 'circling', 'agenting', 'th-filling', 'phoning', 'radioing'];   // every full-screen room and sheet: the dock is for the sky alone
  function shown() { var s = store.get(); return s.dockOn !== false && !app.room && !FULL.some(function (c) { return html.classList.contains(c); }) && !document.querySelector('.oz-sheet.in'); }
  (function loop() { el.classList.toggle('on', shown()); paint(); setTimeout(loop, 250); })();
  el.addEventListener('click', function (e) { var b = e.target.closest('[data-app]'); if (!b) return; hap('tick'); OPEN[b.dataset.app](); });
  store.on(function () { paint(); paintTune(); });

  /* Tune → Dock */
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  function paintTune() { var s = store.get(), a = apps(); T('dockon', s.dockOn === false ? 'off' : 'on'); IC.names.forEach(function (k) { T('dock-' + k, a.indexOf(k) >= 0 ? 'on' : 'off'); }); }
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, s = store.get();
    if (k === 'dockon') store.set({ dockOn: s.dockOn === false });
    if (k.indexOf('dock-') === 0) { var n = k.slice(5), a = apps().slice(), i = a.indexOf(n); if (i >= 0) a.splice(i, 1); else if (a.length < MAX) a.push(n); else if (GJ.mark && GJ.mark.say) GJ.mark.say('the dock holds six', 1600); store.set({ dockApps: a }); } });
  paintTune();
  GJ.dock = { apps: apps, open: function (k) { if (OPEN[k]) OPEN[k](); }, shown: shown, el: el };
})(window);
