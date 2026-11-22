/* oz core · GJ.settings — one settings store for everything the apps keep in this browser (oz 3 alt).
   Before: about two dozen separate localStorage keys (gj-notes, gj-f3, gj-cons, gj-moondial, gj-tips …), each module on
   its own. Now: one entry, 'gj-settings', holding them all under their old names, through the same small interface the
   modules already used (getItem / setItem / removeItem, strings in and out), so no module changed what it keeps.
   On load the old keys are moved in: copied, the copy checked, and only then the old key removed — nothing is lost, and
   if the browser refuses the write (full), the old keys simply stay and are still read.
   Not in here, on purpose: 'gj-safelight-02' (the live state: it syncs between tabs and the watch page) and 'gj.cam'
   (the camera dial module's own). Big things (recordings, photographs) are GJ.keep, in IndexedDB. Nothing is sent anywhere.
     GJ.settings.getItem(k) / setItem(k, string) / removeItem(k) / keys() / clear() / migrated() */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, BLOB = 'gj-settings', APART = { 'gj-safelight-02': 1, 'gj-settings': 1 };
  var ls = null; try { ls = G.localStorage; } catch (e) {}
  var B = {}, moved = [];
  function read() { var b = null; try { b = JSON.parse(ls.getItem(BLOB) || 'null'); } catch (e) {} return (b && typeof b === 'object') ? b : {}; }
  function write() { ls.setItem(BLOB, JSON.stringify(B)); }
  function mine(k) { return /^gj-/.test(k) && !APART[k]; }
  if (ls) {
    B = read();
    // move the old keys in (the newest write wins: an old key present now was written after any earlier move)
    var old = []; for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (k && mine(k)) old.push(k); }
    if (old.length) {
      old.forEach(function (k) { B[k] = ls.getItem(k); });
      try {
        write(); var chk = read();
        old.forEach(function (k) { if (chk[k] === B[k]) { ls.removeItem(k); moved.push(k); } });
      } catch (e) { B = read(); }   // full: leave everything where it was; getItem still finds the old keys
    }
    G.addEventListener('storage', function (e) { if (e.key === BLOB || e.key === null) B = read(); });
  }
  function getItem(k) {
    if (!ls) return null;
    if (Object.prototype.hasOwnProperty.call(B, k)) return B[k];
    return ls.getItem(k);   // not moved (yet), or not ours: read it where it is
  }
  function setItem(k, v) {
    if (!ls) return;
    if (!mine(k)) return ls.setItem(k, v);
    B = read(); B[k] = String(v);   // re-read first, so another tab's change to another setting is kept
    write();                          // throws like localStorage does when full; the callers already catch
    if (ls.getItem(k) != null) ls.removeItem(k);
  }
  function removeItem(k) {
    if (!ls) return;
    if (mine(k)) { B = read(); if (Object.prototype.hasOwnProperty.call(B, k)) { delete B[k]; write(); } }
    ls.removeItem(k);
  }
  GJ.settings = {
    getItem: getItem, setItem: setItem, removeItem: removeItem,
    keys: function () { return Object.keys(B); },
    clear: function () { B = {}; if (ls) ls.removeItem(BLOB); },
    migrated: function () { return moved.slice(); },
    key: BLOB
  };
})(window);
/* oz core · the core's own defaults (Gill, 19 Nov: "Save to core"). core/private/core-defaults.js, when it is there (the
   owner's builds; never a public one), sets window.GJ_CORE_DEFAULTS: tuned values that become the defaults here, the
   owner flag, and the names of the secret settings. Without it: the plain defaults, a public build.
     GJ.core.defaults('store' | 'dials' | 'moon') · GJ.core.owner() · GJ.core.secret() */
(function (G) {
  'use strict';
  var D = G.GJ_CORE_DEFAULTS && typeof G.GJ_CORE_DEFAULTS === 'object' ? G.GJ_CORE_DEFAULTS : {};
  G.GJ.core = {
    defaults: function (part) { var p = D[part]; return p && typeof p === 'object' ? JSON.parse(JSON.stringify(p)) : {}; },
    owner: function () { return D.owner === true; },
    secret: function () { return (D.secret || []).slice(); },
    raw: function () { return JSON.parse(JSON.stringify(D)); }
  };
})(window);
