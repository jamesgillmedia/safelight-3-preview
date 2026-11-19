/* safelight · the home-screen build's service worker (batch four, 18 Nov).
   It makes the app open without a connection once it has been opened with one. It only ever touches the app's own
   files: anything to another address (the forecast) goes straight out and is never kept.
   · install: reads index.html and keeps every script, style, font and icon it names — the list keeps itself.
   · fetch: the network first (so a new build is always the one you get), the kept copy when there is no network.
   · pictures and atlases are kept as they are first seen.
   It is registered by js/home.js, and only when the page is on its own https address and not inside another page —
   never in a preview. */
var V = 'safelight-3';   // its own cache, so it never mixes files with an earlier line
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(fetch('index.html', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
    var urls = ['index.html', 'manifest.webmanifest'], m, re = /(?:src|href)="([^"#?:]+\.(?:js|css|png|svg|woff2))"/g;
    while ((m = re.exec(t))) if (urls.indexOf(m[1]) < 0) urls.push(m[1]);
    return caches.open(V).then(function (c) { return Promise.all(urls.map(function (u) { return c.add(u).catch(function () {}); })); });
  }).catch(function () {}));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok && res.type === 'basic') { var copy = res.clone(); caches.open(V).then(function (c) { c.put(r, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(r, { ignoreSearch: true }).then(function (hit) { return hit || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()); });
  }));
});
