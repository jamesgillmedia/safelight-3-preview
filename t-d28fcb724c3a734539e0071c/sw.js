/* safelight · the home-screen build's service worker (batch four, 18 Nov; Gill, 19 Nov 2:24: "caches everything after the
   first open so it opens instantly and works offline; keep network-first for new builds").
   It only ever touches the app's own files: anything to another address (the forecast) goes straight out, never kept.
   · install: reads each app's page (apps/oz, apps/good-weather) and keeps every script, style, font and icon it names, and
     every room and tool core/lazy.js loads later — the whole app, after the first open.
   · fetch, a published build (pack-alt.py stamps V with the build): the pages themselves (and the manifest) network first,
     with a short wait (so a new build is always the one you get, and no connection still opens at once); every other
     file from the kept copy first (instant), fetched and kept when it is not there yet. A new build is a new sw.js (its
     V changes): it keeps the new build's files in a new store and then drops the old one, so pages and files never mix.
   · fetch, the readable source (V = 'oz-dev'): everything network first, the kept copy only without a connection.
   · pictures and atlases are kept as they are first seen.
   Registered by core/home.js, only on the page's own https address (or localhost) and not inside another page. */
var V = 'oz-d28fcb724c3a734539e0071c';   // its own store; a published build stamps its own (pack-alt.py), so builds never mix files
var APPS = ['apps/oz/index.html', 'apps/good-weather/index.html'];   // the oz family: each app's page names its own files
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(Promise.all(APPS.map(function (p) {
    return fetch(p, { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) { return { p: p, t: t }; }, function () { return { p: p, t: '' }; });
  })).then(function (pages) {
    var urls = ['index.html'], m, re = /(?:src|href)="([^"#?:]+\.(?:js|css|png|svg|woff2|webmanifest))"/g, lz = /['"]((?:js|core|modules\/[\w-]+|apps\/[\w-]+\/js)\/[\w-]+\.js)['"]/g;
    pages.forEach(function (pg) { if (!pg.t) return; urls.push(pg.p); while ((m = re.exec(pg.t))) if (urls.indexOf(m[1]) < 0) urls.push(m[1]); });
    // the tools and rooms that load on first use (core/lazy.js, core/registry.js) are kept too, so they open without a connection
    var txt = function (u) { return fetch(u, { cache: 'no-store' }).then(function (r) { return r.text(); }).catch(function () { return ''; }); };
    return Promise.all([txt('core/lazy.js'), txt('core/registry.js')]).then(function (a) { return a.join('\n'); }).then(function (t) {
      while ((m = lz.exec(t || ''))) if (urls.indexOf(m[1]) < 0) urls.push(m[1]);
      return caches.open(V).then(function (c) { return Promise.all(urls.map(function (u) { return c.add(u).catch(function () {}); })); });
    });
  }).catch(function () {}));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
var DEV = V === 'oz-dev', WAIT = 2500;
function page(r, u) { return r.mode === 'navigate' || /(\.html|\/|\.webmanifest)$/.test(u.pathname); }
function keep(r, res) { if (res && res.ok && res.type === 'basic') { var copy = res.clone(); caches.open(V).then(function (c) { c.put(r, copy); }); } return res; }
function kept(r) { return caches.open(V).then(function (c) { return c.match(r, { ignoreSearch: true }); }).then(function (hit) { return hit || (r.mode === 'navigate' ? caches.open(V).then(function (c) { return c.match(/good-weather/.test(r.url) ? 'apps/good-weather/index.html' : 'apps/oz/index.html'); }) : null); }); }
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return; var u = new URL(r.url); if (u.origin !== self.location.origin) return;
  if (DEV || page(r, u)) {   // network first (a page: only a short wait, then the kept copy)
    e.respondWith(new Promise(function (res) {
      var done = false, t = DEV ? 0 : setTimeout(function () { kept(r).then(function (h) { if (h && !done) { done = true; res(h); } }); }, WAIT);
      fetch(r).then(function (x) { keep(r, x); if (!done) { done = true; clearTimeout(t); res(x); } }, function () { kept(r).then(function (h) { if (!done) { done = true; clearTimeout(t); res(h || Response.error()); } }); });
    }));
    return;
  }
  e.respondWith(kept(r).then(function (hit) { return hit || fetch(r).then(function (x) { return keep(r, x); }); }));   // a file of this build: the kept copy, at once
});
