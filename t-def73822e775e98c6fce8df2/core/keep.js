/* tools-02 · GJ.keep — things too big for localStorage (a recording, a photograph), kept on the device in IndexedDB.
   Nothing here leaves the device. If the browser has no IndexedDB (a private window, some frames) it keeps them for
   the visit only, and says so: GJ.keep.lasting is false. */
(function (G) {
  'use strict';
  var GJ = G.GJ, db = null, opening = null, mem = {};
  function open() {   // one connection, opened once; it lets go when another tab needs the store changed, and comes back when asked again
    if (db) return Promise.resolve(db); if (opening) return opening;
    opening = new Promise(function (ok) {
      var done = false, fin = function (d) { if (done) return; done = true; opening = null; db = d; if (d) { GJ.keep.lasting = true; d.onversionchange = function () { try { d.close(); } catch (e) {} if (db === d) db = null; }; d.onclose = function () { if (db === d) db = null; }; } ok(d); };
      try { var r = indexedDB.open('gj-keep', 1); r.onupgradeneeded = function () { r.result.createObjectStore('k'); }; r.onsuccess = function () { fin(r.result); }; r.onerror = function () { fin(null); }; setTimeout(function () { fin(null); }, 4000); }
      catch (e) { fin(null); }
    });
    return opening;
  }
  function run(mode, fn) {
    return open().then(function (d) {
      if (!d) return undefined;
      return new Promise(function (ok) { try { var q = fn(d.transaction('k', mode).objectStore('k')); q.onsuccess = function () { ok(q.result); }; q.onerror = function () { ok(undefined); }; } catch (e) { ok(undefined); } });
    });
  }
  GJ.keep = {
    lasting: false,
    put: function (k, v) { mem[k] = v; return run('readwrite', function (s) { return s.put(v, k); }).then(function () { return k; }); },
    get: function (k) { if (mem[k] !== undefined) return Promise.resolve(mem[k]); return run('readonly', function (s) { return s.get(k); }).then(function (v) { if (v !== undefined) mem[k] = v; return v; }); },
    del: function (k) { delete mem[k]; return run('readwrite', function (s) { return s.delete(k); }); },
    keys: function (prefix) { return run('readonly', function (s) { return s.getAllKeys(); }).then(function (a) { a = (a || Object.keys(mem)).map(String); return prefix ? a.filter(function (k) { return k.indexOf(prefix) === 0; }) : a; }); }
  };
  open();
})(window);
