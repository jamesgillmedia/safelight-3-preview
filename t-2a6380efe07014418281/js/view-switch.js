/* Photolab / Constellation switch. The only new piece of navigation in v4.
   Both views read data.json. The current work lives in the hash (#cup), so switching keeps your place.
   Photolab is the landing. The Constellation (v3's sky, js/main.js) is loaded the first time it is asked for.
   Options (layout / switch design / tuning) are read from localStorage 'gj.cks.opts'; the panel that edits them is js/tune.js, loaded only with ?tune. */
(function (w) {
  'use strict';
  var html = document.documentElement, KEY = 'gj.view', OKEY = 'gj.cks.opts';
  var BASE = { lay: 'a', sw: 'a', cell: 200, star: 1, drift: 1, hint: 5, hide: {} };
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v) } catch (e) { return null } }
  function readOpts() { var o = {}; try { o = JSON.parse(localStorage.getItem(OKEY) || '{}') || {} } catch (e) {} var r = {}; for (var k in BASE) r[k] = (o[k] === undefined || o[k] === null) ? BASE[k] : o[k]; if (typeof r.hide !== 'object') r.hide = {}; return r }
  var OPTS = readOpts();
  function applyOpts() {
    var lab = document.getElementById('lab'), sw = document.getElementById('viewsw');
    if (lab) { lab.classList.remove('lay-a', 'lay-b', 'lay-c'); lab.classList.add('lay-' + OPTS.lay); lab.style.setProperty('--cell', OPTS.cell + 'px'); lab.style.setProperty('--star', OPTS.star) }
    if (sw) { sw.classList.remove('sw-a', 'sw-b', 'sw-c'); sw.classList.add('sw-' + OPTS.sw) }
    w.GJ_DRIFT = +OPTS.drift; w.GJ_HINT_MS = OPTS.hint * 1000;
    if (w.GJ_LAB && w.GJ_LAB.relayout) w.GJ_LAB.relayout();
  }
  var q = /(?:^|[?&])view=(lab|sky)(?:&|$)/.exec(location.search);
  var view = q ? (q[1] === 'sky' ? 'sky' : 'lab') : (ss(KEY) === 'sky' ? 'sky' : 'lab');
  var skyP = null;
  function hashKey() { return decodeURIComponent(location.hash.slice(1)) }
  function setHash(k) { history.replaceState(null, '', location.pathname + location.search + (k ? '#' + k : '')) }
  function loadSky() { if (!skyP) skyP = import('./main.js').catch(function (e) { console.warn(e) }); return skyP }
  function paint() {
    html.classList.toggle('v-lab', view === 'lab'); html.classList.toggle('v-sky', view === 'sky');
    var sw = document.getElementById('viewsw'); if (!sw) return;
    [].forEach.call(sw.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.dataset.v === view ? 'true' : 'false') });
  }
  function current() {
    if (view === 'lab') return (w.GJ_LAB && w.GJ_LAB.cur()) || '';
    var s = w.__s3 && w.__s3.st && w.__s3.st(); if (!s) return hashKey();
    return s.foc || (s.mode === 'se' ? 'spirit-eye' : '');
  }
  function set(v) {
    v = v === 'sky' ? 'sky' : 'lab'; if (v === view) return;
    var k = current(); view = v; ss(KEY, v); setHash(k); paint();
    if (v === 'sky') {
      if (w.GJ_LAB) w.GJ_LAB.pause();
      var first = !skyP; loadSky().then(function () { if (first) return; /* first load reads the hash itself */
        if (w.__s3) { if (k && k !== 'spirit-eye') w.__s3.aim(k); else w.__s3.home() } dispatchEvent(new Event('resize')) });
    } else if (w.GJ_LAB) { if (k) w.GJ_LAB.open(k); else w.GJ_LAB.home() }
  }
  w.GJ_VIEW = { get view() { return view }, set: set, opts: OPTS, base: BASE, applyOpts: applyOpts,
    saveOpts: function () { try { localStorage.setItem(OKEY, JSON.stringify(OPTS)) } catch (e) {} applyOpts() } };
  html.classList.add(view === 'sky' ? 'v-sky' : 'v-lab');
  function ready() {
    var sw = document.getElementById('viewsw');
    sw.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (sw.classList.contains('sw-c')) set(view === 'lab' ? 'sky' : 'lab'); else set(b.dataset.v) });
    sw.addEventListener('pointerdown', function (e) { e.stopPropagation() });
    applyOpts(); paint();
    if (view === 'sky') loadSky();
    var tq = /(?:^|[?&])tune(?:=([01]))?(?:&|$)/.exec(location.search), on = false;
    try { if (tq) { if (tq[1] === '0') localStorage.removeItem('gj.cks.tune'); else localStorage.setItem('gj.cks.tune', '1') } on = localStorage.getItem('gj.cks.tune') === '1' } catch (e) { on = !!tq && tq[1] !== '0' }
    if (on) { var s = document.createElement('script'); s.src = 'js/tune.js'; document.body.appendChild(s) }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})(window);
