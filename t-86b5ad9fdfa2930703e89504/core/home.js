/* tools-02 · the home-screen build (queue 15; Gill, 18 Nov: batch four).
   What makes the page an app once it is on an address of its own: a web manifest (its name, its icon, full screen),
   the Apple tags that do the same on an iPhone, and a service worker (sw.js) so it opens without a connection.
   Nothing here publishes anything — hosting is Gill's to do. Inside a preview (this page framed in another, or opened
   from files) none of it switches on; Tune → Home screen says where things stand and what the next step is. */
(function (G) {
  'use strict';
  var GJ = G.GJ, framed = false; try { framed = G.self !== G.top; } catch (e) { framed = true; }
  var standalone = !!((G.matchMedia && G.matchMedia('(display-mode: standalone)').matches) || G.navigator.standalone === true);
  var https = G.location.protocol === 'https:' || (G.isSecureContext && G.location.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(G.location.hostname)), can = 'serviceWorker' in G.navigator && https && !framed, sw = 'off';
  if (can) G.navigator.serviceWorker.register('sw.js').then(function () { sw = 'on'; paint(); }).catch(function () { sw = 'refused'; paint(); });
  var ios = /iPhone|iPad|iPod/.test(G.navigator.userAgent || '');
  function where() { return standalone ? 'installed' : framed ? 'preview' : !https ? 'files' : 'browser'; }
  function line() {
    var w = where();
    return w === 'installed' ? 'on your home screen · opens without a connection once it has been opened with one'
      : w === 'preview' ? 'this is a preview inside another page — it becomes an app when these files are on an address of your own'
      : w === 'files' ? 'opened from files — put it on an https address, then add it to the home screen'
      : ios ? 'in Safari: Share, then Add to Home Screen' : 'in the browser\'s menu: Install, or Add to Home Screen';
  }
  function paint() { var b = document.querySelector('#tune [data-t="homescreen"] b'); if (b) b.textContent = { installed: 'installed', preview: 'in a preview', files: 'from files', browser: 'add it' }[where()]; }
  var tune = document.getElementById('tune');
  if (tune) {   // a row at the end of Tune's own list, before the Watch note
    var h = document.createElement('h3'); h.className = 'jul'; h.textContent = 'Home screen'; var r = document.createElement('div'); r.className = 'row'; r.innerHTML = 'As an app on this phone<button data-t="homescreen"><b></b></button>';
    var n = document.createElement('div'); n.className = 'note'; n.id = 'tn-home'; n.textContent = line(); var rev = document.getElementById('tn-rev'); tune.insertBefore(h, rev); tune.insertBefore(r, rev); tune.insertBefore(n, rev);
    r.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); n.textContent = line(); if (GJ.mark && GJ.mark.say) GJ.mark.say(line(), 3600); });
    paint();
  }
  GJ.home = { state: function () { return { where: where(), framed: framed, standalone: standalone, https: https, offline: sw, line: line() }; } };
})(window);
