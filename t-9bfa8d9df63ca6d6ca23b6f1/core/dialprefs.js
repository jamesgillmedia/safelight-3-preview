/* oz core · Tune → Dials (oz 3 alt; Gill, 19 Nov: "a 'Dials' section in Tune"). One place to tune how every dial
   feels, and to choose a dial's look per place. The default is the one shared dialkit behaviour; nothing changes until a
   choice is made, and every choice is kept in the one settings store (gj-dials).
     Turning speed ...... slow · normal · fast — how far a slide moves the side and edge dials
     Snap ............... off · soft · firm — the visible pulse (and, firm, a stronger tick) on each step a dial lands on
     Haptics ............ the dials' ticks on or off (the rest of the app keeps its own)
     Labels ............. the short line a dial says the first times it is touched
     Rests after ........ the shared rest time (on oz it is the Moon dial's own setting, moved here)
     Orbit the sky ...... (Gill, 19 Nov: off by default) on, the side dial's outer ring swings the sky and the every-choice
                          sheet's constellation turns under a drag; off, the side dial turns the atmosphere and the stars
     Look, per place .... ticks (the shared vertical tick slider, the default) · arc · ring; for the crescent, the 3D moon
                          or flat. A look is only a look: every dial still turns, snaps, says its value and resets alike.
     The Moon dial ...... (its rarely-changed settings live here) on/off, size, rest, position, haptics, and the same
                          choices as a plain list
   A small live dial at the top of the section turns with these settings, in the look of the place chosen last.
   Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, KEY = 'gj-dials';
  var DEF = { speed: 'normal', snap: 'soft', haptics: true, labels: true, rest: 5, styles: {}, orbit: false };   // orbit: Gill's call, 19 Nov — off unless chosen
  (function () { var cd = GJ.core ? GJ.core.defaults('dials') : {}; for (var k in cd) if (k in DEF) DEF[k] = cd[k]; })();   // the core's own defaults (core/private), when there
  var P = JSON.parse(JSON.stringify(DEF)); try { var sv = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (sv) for (var k in DEF) if (sv[k] != null) P[k] = sv[k]; } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  var SPEED = { slow: .6, normal: 1, fast: 1.6 };
  var LOOKS = ['ticks', 'arc', 'ring', 'oz'], CRES = ['3D moon', 'flat'];
  // the places: this app's own (GJ_APP.rooms), or oz's front sky
  var APP = G.GJ_APP || {}, NAMES = { sky: 'The sky', red: 'Timer', golden: 'Golden Hour', loops: 'Loops', player: 'Sky player', archive: 'Archive' };
  var PLACES = (APP.rooms ? APP.rooms.slice() : ['sky', 'red', 'golden', 'loops', 'player', 'archive']).filter(function (p) { return NAMES[p]; });
  if (PLACES.indexOf('sky') < 0 && !APP.rooms) PLACES.unshift('sky');
  function look(place) { var v = P.styles[place]; return v || (place === 'crescent' ? '3D moon' : 'ticks'); }
  function setLook(place, v) { if (v === look(place)) return; if (v === (place === 'crescent' ? '3D moon' : 'ticks')) delete P.styles[place]; else P.styles[place] = v; save(); apply(); lastPlace = place; paintRows(); preview(); }
  function here() { var r = GJ.app && GJ.app.room; return r || (APP.home && !APP.rooms ? APP.home : 'sky'); }
  function apply() { var l = look(here()); if (l === 'ticks') delete html.dataset.dstyle; else html.dataset.dstyle = l; }

  /* ---------- the rows ---------- */
  var tune = document.getElementById('tune'), lastPlace = PLACES[0] || 'sky', prev = null;
  function row(t, name, val) { var d = document.createElement('div'); d.className = 'row'; d.innerHTML = name + '<button data-t="' + t + '"><b>' + val + '</b></button>'; return d; }
  function cyc(list, v) { return list[(list.indexOf(v) + 1) % list.length]; }
  var RESTS = [[3, '3 s'], [5, '5 s'], [10, '10 s'], [0, 'never']];
  function restWord(s) { for (var i = 0; i < RESTS.length; i++) if (RESTS[i][0] === s) return RESTS[i][1]; return '5 s'; }
  if (tune) {
    var h = document.createElement('h3'); h.className = 'jul'; h.textContent = 'Dials';
    prev = document.createElement('div'); prev.className = 'note dk-prev'; prev.id = 'dk-preview';
    prev.innerHTML = '<div class="dkp-dial" role="slider" aria-label="a live dial: slide to try the settings" aria-valuemin="0" aria-valuemax="100" tabindex="0"><svg viewBox="0 0 30 120" aria-hidden="true"><path class="fd-arc" d="M30 6 A70 70 0 0 0 30 114"/><circle class="fd-ring" cx="30" cy="60" r="26"/><g class="dkp-ticks"></g><g class="dkp-vt"></g><line class="fd-rail" x1="28.5" y1="14" x2="28.5" y2="106"/><circle class="fd-dot" cx="4.5" cy="60" r="2.4"/></svg><canvas class="dkp-oz" width="104" height="248"></canvas></div><div class="dkp-say"><b class="jul">try it</b><span class="dkp-val">50</span><i class="dkp-look"></i></div>';
    var rows = [prev, row('dkspeed', 'Turning speed', P.speed), row('dksnap', 'Snap', P.snap), row('dkhap', 'Haptics', P.haptics ? 'on' : 'off'), row('dklab', 'Labels on first touch', P.labels ? 'on' : 'off'), row('dkorbit', 'Orbit the sky', P.orbit ? 'on' : 'off')];
    var md = tune.querySelector('[data-t="mndelay"]');
    if (md) { var mr = md.closest('.row'); mr.firstChild.textContent = 'Rests after'; rows.push(mr); }   // oz: the Moon dial's own row, moved here
    else rows.push(row('dkrest', 'Rests after', restWord(P.rest)));
    PLACES.forEach(function (p) { rows.push(row('dkst-' + p, NAMES[p] + ' · look', look(p))); });
    if (tune.querySelector('[data-t="moondial"]')) {
      rows.push(row('dkst-crescent', 'The crescent · look', look('crescent')));
      var mrow = function (t) { var b = tune.querySelector('[data-t="' + t + '"]'); return b ? b.closest('.row') : null; };
      [mrow('moondial'), mrow('mnsize'), mrow('mnrest'), mrow('mnlock'), mrow('mnhap'), mrow('moonlist')].forEach(function (r) { if (r) rows.push(r); });   // the Moon dial's settings, moved here
    }
    var hs = tune.querySelectorAll(':scope > h3'), at = hs[1] || null;   // after the first section (Red mode)
    tune.insertBefore(h, at); rows.forEach(function (r) { tune.insertBefore(r, at); });
    tune.addEventListener('click', function (e) {
      var x = e.target.closest ? e.target.closest('button[data-t]') : null; if (!x) return; var t = x.dataset.t, b = x.querySelector('b');
      if (t === 'dkspeed') P.speed = cyc(['slow', 'normal', 'fast'], P.speed), b.textContent = P.speed;
      else if (t === 'dksnap') P.snap = cyc(['off', 'soft', 'firm'], P.snap), b.textContent = P.snap;
      else if (t === 'dkhap') P.haptics = !P.haptics, b.textContent = P.haptics ? 'on' : 'off';
      else if (t === 'dklab') P.labels = !P.labels, b.textContent = P.labels ? 'on' : 'off';
      else if (t === 'dkorbit') { P.orbit = !P.orbit; b.textContent = P.orbit ? 'on' : 'off'; save(); orbitChanged(); return; }
      else if (t === 'dkrest') { var i = 0; for (; i < RESTS.length; i++) if (RESTS[i][0] === P.rest) break; P.rest = RESTS[(i + 1) % RESTS.length][0]; b.textContent = restWord(P.rest); }
      else if (t.indexOf('dkst-') === 0) { var pl = t.slice(5), list = pl === 'crescent' ? CRES : LOOKS; setLook(pl, cyc(list, look(pl))); b.textContent = look(pl); return; }
      else return;
      save(); preview();
    });
  }

  /* ---------- the live dial ---------- */
  var pv = { v: .5, drag: null, step: -1 };
  function preview() {
    if (!prev) return; var l = look(lastPlace === 'crescent' ? 'sky' : lastPlace);
    prev.dataset.look = l; prev.querySelector('.dkp-look').textContent = (NAMES[lastPlace] || 'The crescent') + ' · ' + look(lastPlace);
    var a = Math.PI - .8 + pv.v * 1.6, d = prev.querySelector('.fd-dot'); d.setAttribute('cx', (74.5 + 70 * Math.cos(a)).toFixed(2)); d.setAttribute('cy', (60 + 70 * Math.sin(a)).toFixed(2));
    if (l === 'ring') { var ra = -Math.PI / 2 + pv.v * 2 * Math.PI * .9; d.setAttribute('cx', (30 + 26 * Math.cos(ra + Math.PI)).toFixed(2)); d.setAttribute('cy', (60 + 26 * Math.sin(ra + Math.PI)).toFixed(2)); }
    if (l === 'ticks') { d.setAttribute('cx', '28.5'); d.setAttribute('cy', (106 - pv.v * 92).toFixed(2)); }
    if (l === 'oz') { d.setAttribute('cx', '28.5'); d.setAttribute('cy', (106 - pv.v * 92).toFixed(2)); if (GJ.ozview) GJ.ozview.draw(prev.querySelector('.dkp-oz'), pv.v, GJ.now ? GJ.now() : 0); }   // the oz viewer, shrunk into the dial (core/ozview.js)
    prev.querySelector('.dkp-val').textContent = Math.round(pv.v * 100); prev.querySelector('.dkp-dial').setAttribute('aria-valuenow', Math.round(pv.v * 100));
  }
  if (prev) {
    var tk = ''; for (var i = 0; i <= 10; i++) { var ang = Math.PI - .8 + i * .16, ri = i % 5 ? 65 : 61; tk += '<line class="fd-tick" x1="' + (74.5 + 70 * Math.cos(ang)).toFixed(1) + '" y1="' + (60 + 70 * Math.sin(ang)).toFixed(1) + '" x2="' + (74.5 + ri * Math.cos(ang)).toFixed(1) + '" y2="' + (60 + ri * Math.sin(ang)).toFixed(1) + '"/>'; }
    prev.querySelector('.dkp-ticks').innerHTML = tk;
    var vt = ''; for (i = 0; i <= 10; i++) { var yy = 106 - i * 9.2; vt += '<line class="fd-tick" x1="' + (i % 5 ? 24 : 21) + '" y1="' + yy.toFixed(1) + '" x2="27" y2="' + yy.toFixed(1) + '"/>'; } prev.querySelector('.dkp-vt').innerHTML = vt;   // the shared vertical tick slider
    var dd = prev.querySelector('.dkp-dial'), lastTap = 0;
    if (GJ.dialkit) GJ.dialkit.attach('preview', { el: dd, ownRest: true, label: 'slide it: this is how every dial will feel', anchor: function () { return dd; }, reset: function () { pv.v = .5; preview(); }, name: 'the live dial' });
    dd.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); try { dd.setPointerCapture(e.pointerId); } catch (x) {} pv.drag = { y: e.clientY, v: pv.v }; if (GJ.dialkit) GJ.dialkit.touch('preview');
      var t = GJ.now(); if (t - lastTap < 320) { lastTap = 0; if (GJ.dialkit) GJ.dialkit.reset('preview'); pv.drag = null; return; } lastTap = t; });
    dd.addEventListener('pointermove', function (e) {
      if (!pv.drag) return; var v = Math.max(0, Math.min(1, pv.drag.v - (e.clientY - pv.drag.y) / 220 * speed())); if (v === pv.v) return; pv.v = v;
      var st = Math.round(v * 10); if (st !== pv.step) { pv.step = st; if (GJ.haptic) GJ.haptic.tick(); if (GJ.dialkit) GJ.dialkit.snap('preview'); }
      if (GJ.dialkit) GJ.dialkit.turn('preview', true); preview();
    });
    var pup = function () { if (!pv.drag) return; pv.drag = null; if (GJ.dialkit) { GJ.dialkit.turn('preview', false); GJ.dialkit.value('preview', 'the live dial · ' + Math.round(pv.v * 100)); } };
    dd.addEventListener('pointerup', pup); dd.addEventListener('pointercancel', pup);
    dd.addEventListener('keydown', function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); pv.v = Math.max(0, Math.min(1, pv.v + (e.key === 'ArrowUp' ? .1 : -.1) * speed())); if (GJ.dialkit) GJ.dialkit.snap('preview'); preview(); } });
    preview();
  }

  /* ---------- haptics off: the dials' own ticks go quiet (a dial is being touched, or touched just now) ---------- */
  if (GJ.haptic) ['tick', 'commit', 'edge'].forEach(function (k) {
    var f = GJ.haptic[k]; if (!f) return;
    GJ.haptic[k] = function () { if (!P.haptics && GJ.dialkit && GJ.dialkit.busy && GJ.dialkit.busy()) return; return f.apply(this, arguments); };
  });
  function speed() { return SPEED[P.speed] || 1; }
  function orbitChanged() { if (GJ.app && GJ.app.refreshRings) GJ.app.refreshRings(); }
  function paintRows() {
    if (!tune) return; var w = { dkspeed: P.speed, dksnap: P.snap, dkhap: P.haptics ? 'on' : 'off', dklab: P.labels ? 'on' : 'off', dkrest: restWord(P.rest), dkorbit: P.orbit ? 'on' : 'off' };
    PLACES.concat(['crescent']).forEach(function (p) { w['dkst-' + p] = look(p); });
    for (var k in w) { var b = tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== w[k]) b.textContent = w[k]; }
  }
  if (GJ.store && GJ.store.on) GJ.store.on(function (s, p) { if (!p || s.room !== p.room) apply(); });
  apply();
  GJ.dialprefs = { speed: speed, snap: function () { return P.snap; }, haptics: function () { return !!P.haptics; }, labels: function () { return !!P.labels; },
    rest: function () { return P.rest; }, look: look, preview: function () { preview(); }, setLook: setLook, places: function () { return PLACES.slice(); }, here: here,
    orbit: function () { return !!P.orbit; },
    defaults: function () { return JSON.parse(JSON.stringify(DEF)); },
    get: function () { return JSON.parse(JSON.stringify(P)); }, set: function (o) { var ob = P.orbit; for (var k in o) if (k in DEF) P[k] = o[k]; save(); apply(); paintRows(); preview(); if (P.orbit !== ob) orbitChanged(); },
    reset: function () { P = JSON.parse(JSON.stringify(DEF)); save(); apply(); paintRows(); preview(); } };
})(window);
