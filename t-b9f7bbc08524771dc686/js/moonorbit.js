/* tools-02 · the Moon dial, opened out: WITHHELD from this pack (in-house module "moonEngine": orbit, camera, projection,
   depth layout and default ring tables). PREVIEW STUB with the same public calls, so js/moon.js and the rest of the
   shell still load. It shows a plain labelled list of the public rings, nothing more. The rebuild you are asked for is
   in moon-dial/BRIEF.md; build it against reference/protection/INTERFACES.md (§2), not against this stub. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store;
  // public labels only (INTERFACES.md §2): one ring per setting, each choice a star
  var RINGS = [['atmos', 'atmosphere', ['still', 'soft', 'full']], ['ambience', 'ambience', ['cool', 'even', 'warm']],
    ['stars', 'stars', ['few', 'some', 'all']], ['fog', 'fog', ['off', 'light', 'full']], ['water', 'water', ['off', 'still', 'ripples']],
    ['moon', 'moon', ['off', 'crescent', "tonight's"]], ['weather', 'weather', ['live', 'clear']]];
  var STARS = []; RINGS.forEach(function (r) { r[2].forEach(function (v) { STARS.push({ k: r[0], v: v, ring: r[1] }); }); });
  var st = { open: false, mode: null, chosen: {} }, C = { x: 0, y: 0 };
  var el = document.createElement('div'); el.id = 'mo-stub'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Moon dial (preview stub)');
  el.style.cssText = 'position:fixed;z-index:80;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 16px;background:rgba(8,8,10,.92);' +
    'border:1px solid rgba(232,228,220,.2);color:#e8e4dc;font:12px/1.6 Poppins,sans-serif;letter-spacing:.06em;display:none;max-width:80vw';
  function render() {
    el.innerHTML = '<b style="display:block;letter-spacing:.2em;text-transform:uppercase;font-weight:400">Moon dial · preview stub</b>' +
      RINGS.map(function (r) { return '<div>' + r[1] + ': ' + r[2].map(function (v) { var on = st.chosen[r[0]] === v;
        return '<button data-k="' + r[0] + '" data-v="' + v + '" aria-pressed="' + on + '" style="background:none;border:0;color:inherit;padding:6px;' + (on ? 'text-decoration:underline' : 'opacity:.6') + '">' + v + '</button>'; }).join('') + '</div>'; }).join('');
  }
  el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) choose(b.dataset.k, b.dataset.v); });
  document.body.appendChild(el);
  function open(x, y, mode) { C.x = x || innerWidth / 2; C.y = y || innerHeight / 2; st.open = true; st.mode = mode || 'tap'; render(); el.style.display = 'block'; }
  function close() { st.open = false; el.style.display = 'none'; }
  function choose(k, v) { st.chosen[k] = v; render(); if (GJ.haptic && GJ.haptic.tick) GJ.haptic.tick(); }
  function noop() {}
  GJ.moonOrbit = { stub: true, open: open, close: close, carry: function (x, y) { C.x = x; C.y = y; }, release: noop, heldMove: noop, heldUp: noop, choose: choose,
    view: function () { return 'flat'; }, isOpen: function () { return st.open; },
    rings: RINGS.map(function (r) { return r[0]; }), items: function () { return STARS.map(function (s) { return s.k + ':' + s.v; }); },
    names: function () { return STARS.map(function (s) { return { id: s.k + ':' + s.v, ring: s.ring, choice: s.v }; }); },
    star: function () { return null; }, knob: function () { return null; }, sliderAt: function () { return null; },
    value: function (k) { return st.chosen[k] == null ? null : st.chosen[k]; },
    state: function () { return { open: st.open, mode: st.mode, hover: null, slide: null, stepback: false, centre: [C.x, C.y], stub: true }; } };
  if (store && store.on) store.on(function () {});
})(window);
