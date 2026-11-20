/* oz 3 alt · Tune, the iPhone Settings way (REFINE-PLAN: "rows cycle words when tapped → iOS-style switches and
   pickers"). Every row keeps its own button[data-t] and the code behind it — the same stored values, the same behaviour.
   This file only puts a familiar control in front of each one:
     · on / off            → a switch (the row's own button, drawn as a switch)
     · a few named choices → a segmented control
     · a scale             → a slider with stops
     · a long list         → a picker (the phone's own wheel)
     · open / new / play   → a row with a chevron; the whole row is the button
   Picking a value presses the row's own button until it reads that value, so nothing new is stored anywhere.
   The rows sit in inset groups under each heading, like Settings. */
(function (G) {
  'use strict';
  var tune = document.getElementById('tune'); if (!tune) return;
  // key → [kind, choices in the order shown (the exact words the row already prints)]
  var C = {
    brunclear: ['seg', ['reader', 'full site']], brview: ['seg', ['topic', 'project', 'time', 'source', 'freeform']], brhaptic: ['switch'], brauto: ['switch'],
    depthon: ['switch'], depthdial: ['switch'], palfam: ['seg', ['night', 'red', 'rose', 'light', 'Full red']], chatteal: ['seg', ['here', 'near']],
    lean: ['switch'], leanring: ['seg', ['volume', 'atmosphere', 'orbit']], focusring: ['switch'], focusdepth: ['seg', ['near', 'mid', 'far']], essentials: ['switch'], milayout: ['seg', ['grid', 'strip', 'a row per shot']], midensity: ['seg', ['fewer', 'default', 'more']],
    red: ['switch'], openred: ['switch'], daymode: ['switch'], fingerdial: ['switch'], ghdials: ['seg', ['current', 'optimized']], ozthink: ['switch'], mztyping: ['switch'], mzread: ['switch'], mzenter: ['switch'], mzskin: ['seg', ['none', 'light', 'medium-light', 'medium', 'medium-dark', 'dark']], mztone: ['seg', ['soft', 'bell', 'tick', 'none']], mzdis: ['seg', ['off', '1 hour', '1 day', '7 days']], iconflip: ['switch'], iconmirror: ['switch'],
    envwindlive: ['seg', ['live', 'by hand']], envwind: ['slider', ['still', 'breezy', 'strong']], envgrain: ['slider', ['off', 'fine', 'full']], envsize: ['slider', ['small', 'mid', 'large']], envglow: ['slider', ['soft', 'mid', 'bright']], envline: ['slider', ['faint', 'mid', 'bright']], envrip: ['slider', ['small', 'mid', 'large']], envswell: ['slider', ['calm', 'gentle', 'heavy']], envmotes: ['slider', ['off', 'some', 'many']], envbloom: ['slider', ['off', 'on', 'wide']], envvig: ['slider', ['off', 'soft', 'deep']], feedon: ['switch'], mnflip: ['switch'], mnmirror: ['switch'], mnspark: ['switch'], reflect: ['switch'], ripples: ['switch'], wxlive: ['switch'], fullsafe: ['switch'], tilt: ['switch'], moondial: ['switch'], mnhap: ['switch'], markmore: ['switch'], dialtapsheet: ['switch'], contaps: ['switch'], moonslide: ['switch'],
    tone: ['seg', ['dim', 'rose', 'crimson', 'bright']],
    photored: ['seg', ['red', 'true colour']],
    moon: ['seg', ['crescent', 'tonight', 'off']],
    alert: ['seg', ['alarm', 'silent']],
    clock: ['seg', ['12 hour', '24 hour']],
    sunup: ['seg', ['heading', 'north']],
    hub: ['seg', ['field', 'star']],
    reduce: ['seg', ['auto', 'on', 'off']],
    byread: ['seg', ['off', 'red', 'colour', 'light']],
    bydrift: ['seg', ['off', 'slow', 'easy']],
    bymove: ['seg', ['dolly', 'orbit']],
    byease: ['seg', ['fold', 'cubic', 'smooth', 'push']],
    mnlock: ['seg', ['free', 'locked']],
    mndelay: ['seg', ['3 s', '5 s', '10 s', 'never']],
    density: ['slider', ['45%', '70%', '100%']],
    redlight: ['slider', ['20%', '40%', '60%', '80%', '100%']],
    ambience: ['slider', ['quiet', 'mid', 'bright']],
    fog: ['slider', ['off', 'light', 'full']],
    bydepth: ['slider', ['close', 'mid', 'far']],
    mnsize: ['slider', ['normal', 'large', 'largest']],
    mnrest: ['slider', ['faint', 'soft', 'full']],
    vdensity: ['slider', ['sparse', 'mid', 'full']],
    vthreads: ['slider', ['off', 'faint', 'on', 'bright']],
    vspin: ['slider', ['still', 'slow', 'easy', 'fast']],
    vsize: ['slider', ['small', 'mid', 'large']],
    vfold: ['slider', ['1×', '2×', '3×', '4×', '6×', '8×']],
    vtrails: ['slider', ['off', '60%', '85%', '95%']],
    vwarp: ['slider', ['off', '35%', '70%', '100%']],
    city: ['pick', null], vmode: ['pick', null], dialrest: ['pick', null],
    dkspeed: ['slider', ['slow', 'normal', 'fast']], dksnap: ['slider', ['off', 'soft', 'firm']], dkhap: ['switch'], dklab: ['switch'], dkorbit: ['switch'], dkrest: ['seg', ['3 s', '5 s', '10 s', 'never']]
  };
  ['sky', 'red', 'golden', 'loops', 'player', 'archive'].forEach(function (p) { C['dkst-' + p] = ['seg', ['ticks', 'arc', 'ring', 'oz']]; }); C['dkst-crescent'] = ['seg', ['3D moon', 'flat']];   // Tune → Dials (core/dialprefs.js)
  function lists() {   // the long lists come from the code that owns them
    try { C.city[1] = Object.keys(GJ.Sun.CITIES).map(function (k) { return GJ.Sun.CITIES[k].name; }); } catch (e) { C.city[1] = ['Vancouver']; }
    try { C.vmode[1] = GJ.player.MODES.slice(); } catch (e) { C.vmode[1] = ['sphere']; }
    try { C.dialrest[1] = Object.keys(GJ.dialRest.MODES).map(function (k) { return GJ.dialRest.MODES[k]; }); } catch (e) { C.dialrest[1] = ['stays']; }
  }
  function val(src) { var b = src.querySelector('b'); return b ? b.textContent.trim() : ''; }
  // press the row's own button until it reads v (each press is exactly what a tap used to do)
  function goTo(src, v) {
    var n = 0, last = val(src);
    while (last !== v && n++ < 12) { src.click(); var now = val(src); if (now === last && n > 1) break; last = now; }
    return last === v;
  }
  var ctl = [], refills = [];
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function nameOf(row) { var t = ''; row.childNodes.forEach(function (n) { if (n.nodeType === 3) t += n.textContent; else if (n.tagName === 'SPAN' && !n.classList.contains('tn-tags') && !n.classList.contains('tk-val')) t += n.textContent; }); return t.trim(); }
  function build(row) {
    var src = row.querySelector('button[data-t]'); if (!src || row.dataset.tk) return;
    var k = src.dataset.t, c = C[k], name = nameOf(row);
    if (!c) {   // an action: the whole row is the button, with a chevron, like a Settings row that goes somewhere
      row.dataset.tk = 'nav'; row.classList.add('tk-nav'); src.classList.add('tk-go'); src.setAttribute('aria-label', name + ' — ' + val(src)); if (val(src) === 'open') src.classList.add('tk-plain');
      row.addEventListener('click', function (e) { if (e.target === row) src.click(); });
      return;
    }
    row.dataset.tk = c[0]; row.classList.add('tk-' + c[0]); if (c[0] === 'seg' && (c[1] || []).join('').length > 12) row.classList.add('tk-wide');
    if (c[0] === 'switch') {
      src.classList.add('tk-sw'); src.setAttribute('role', 'switch'); src.setAttribute('aria-label', name);
      var paint = function () { var on = val(src) === 'on'; src.setAttribute('aria-checked', on ? 'true' : 'false'); src.classList.toggle('on', on); src.classList.toggle('blocked', val(src) === 'blocked'); };
      ctl.push(paint); watch(src, paint); paint(); return;
    }
    src.classList.add('tk-src'); src.setAttribute('aria-hidden', 'true'); src.tabIndex = -1;
    var opts = c[1] || [], w;
    if (c[0] === 'seg') {
      w = mk('div', 'tk-segs'); w.setAttribute('role', 'radiogroup'); w.setAttribute('aria-label', name);
      opts.forEach(function (o) { var b = mk('button', 'tk-seg'); b.type = 'button'; b.textContent = o; b.dataset.v = o; b.setAttribute('role', 'radio'); w.appendChild(b); });
      w.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); goTo(src, b.dataset.v); paintSeg(); });
      var paintSeg = function () { var v = val(src); [].forEach.call(w.children, function (b) { var on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); };
      row.appendChild(w); ctl.push(paintSeg); watch(src, paintSeg); paintSeg();
    } else if (c[0] === 'slider') {
      var out = mk('span', 'tk-val'); w = mk('input', 'tk-range'); w.type = 'range'; w.min = 0; w.max = opts.length - 1; w.step = 1; w.setAttribute('aria-label', name);
      var lo = mk('i', 'tk-lo'), hi = mk('i', 'tk-hi'); lo.textContent = opts[0]; hi.textContent = opts[opts.length - 1];
      var line = mk('div', 'tk-line'); line.appendChild(lo); line.appendChild(w); line.appendChild(hi);
      var paintSl = function () { var v = val(src), i = opts.indexOf(v); out.textContent = v; if (i >= 0) w.value = i; w.setAttribute('aria-valuetext', v); w.style.setProperty('--p', (i < 0 ? 0 : i / Math.max(1, opts.length - 1) * 100) + '%'); };
      w.addEventListener('input', function () { goTo(src, opts[+w.value]); paintSl(); if (GJ.haptic && GJ.haptic.tick) GJ.haptic.tick(); });
      w.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      row.appendChild(out); row.appendChild(line); ctl.push(paintSl); watch(src, paintSl); paintSl();
    } else if (c[0] === 'pick') {
      w = mk('select', 'tk-sel'); w.setAttribute('aria-label', name);
      var fill = function () { w.innerHTML = ''; (C[k][1] || []).forEach(function (o) { var op = mk('option'); op.value = o; op.textContent = o; w.appendChild(op); }); }; fill(); refills.push(function () { fill(); paintPk(); });
      var paintPk = function () { w.value = val(src); };
      w.addEventListener('change', function () { goTo(src, w.value); paintPk(); });
      row.appendChild(w); ctl.push(paintPk); watch(src, paintPk); paintPk();
    }
  }
  function watch(src, fn) { var b = src.querySelector('b'); if (b && G.MutationObserver) new MutationObserver(fn).observe(b, { childList: true, characterData: true, subtree: true }); }
  // inset groups: each heading's rows go in one rounded group, like a Settings section
  function group() {
    [].forEach.call(tune.querySelectorAll('.tn-group'), function (tier) {
      var g = null;
      [].slice.call(tier.children).forEach(function (c) {
        if (c.tagName === 'H3') { g = mk('div', 'tk-group'); c.after(g); return; }
        if (g && (c.classList.contains('row') || c.classList.contains('note'))) g.appendChild(c);
      });
    });
  }
  function init() { lists(); group(); [].forEach.call(tune.querySelectorAll('.row'), build); tune.classList.add('tk'); }
  init();
  G.GJ.tunekit = {
    kind: function (k) { var r = tune.querySelector('[data-t="' + k + '"]'); r = r && r.closest('.row'); return r ? r.dataset.tk : null; },
    choices: function (k) { return C[k] ? (C[k][1] || ['on', 'off']).slice() : null; },
    set: function (k, v) { var s = tune.querySelector('[data-t="' + k + '"]'); return s ? goTo(s, v) : false; },
    value: function (k) { var s = tune.querySelector('[data-t="' + k + '"]'); return s ? val(s) : null; },
    name: function (k) { var s = tune.querySelector('[data-t="' + k + '"]'), r = s && s.closest('.row'); return r ? nameOf(r) : null; },
    relist: function () { lists(); refills.forEach(function (f) { f(); }); },   // a room's module came in (core/lazy.js): its long lists are real now
    refresh: function () { ctl.forEach(function (f) { f(); }); }
  };
})(window);
