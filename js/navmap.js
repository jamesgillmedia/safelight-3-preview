/* tools-02 · the Navigation Map (briefs/NAVIGATION-MAP.md; Gill, 18 Nov: batch four).
   A map of where you can go — the app's features, not its content. Stars in clusters by purpose: MAKE · REVIEW · PLAN ·
   PEOPLE · SHARE, with the sky (home) in the middle. It never shows anything from the archive.
     · Where you are glows. Where you have been is a little brighter. A soft line is the path you took; BACK retraces it.
     · A small pulse (no numbers) marks something waiting: a decision sheet with a question not yet final, a demo with
       notes still open, a plan dated today or tomorrow.
     · Tap a star: you are there (one gesture). The dial's PLACE steps the lit star from one to the next; hold the
       dial to go to it.
     · LIST is the same map as a plain list — it is what opens with Reduce Motion on, and what a screen reader gets.
     · The first time, it names each place once, in turn, over five seconds; after that it stays quiet.
   Only what is built is on it. PEOPLE and SHARE have nothing built yet (Crew Rolodex, Messaging, Set Channel, Private
   Relay are the app proper's), and say so. Kept in this browser (localStorage gj-nav: been, the trail, taught).
   Not here yet (the brief): the public site map of rooms, opening by a pinch out past the top level, roles that see
   only their own features. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, clamp = GJ.clamp;
  var KEY = 'gj-nav', N = { been: {}, trail: [], taught: false };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.trail) N = Object.assign(N, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(N)); } catch (e) {} }
  function room(id) { return function () { if (GJ.app.room !== id) GJ.app.enter(id); }; }
  function inArchive(fn) { return function () { if (GJ.app.room !== 'archive') { GJ.app.enter('archive'); setTimeout(fn, 950); } else fn(); }; }
  function has(k) { return !!GJ[k]; }
  var CL = [['make', 'make'], ['review', 'review'], ['plan', 'plan'], ['people', 'people'], ['share', 'share']];
  var DEFS = [
    ['loops', 'loops', 'make', room('loops')], ['player', 'sky player', 'make', room('player')], ['demos', 'demo room', 'make', function () { GJ.demos.open(); }, 'demos'], ['objects', 'objects', 'make', function () { GJ.objects.open(); }, 'objects'],
    ['mindex', 'index a clip', 'make', function () { GJ.mindex.open(); }, 'mindex'], ['shrink', 'shrink a clip', 'make', function () { GJ.shrink.open(); }, 'shrink'], ['notes', 'notes', 'make', function () { GJ.notes.open(); }, 'notes'], ['oztune', 'oz icon', 'make', function () { GJ.oztune.open(); }, 'oztune'],
    ['archive', 'archive', 'review', room('archive')], ['icons', 'icon board', 'review', room('icons'), 'icons'], ['lab', 'photo lab', 'review', function () { GJ.lab.open(); }, 'lab'], ['picks', 'picks board', 'review', function () { GJ.picks.open(); }, 'picks'], ['decide', 'decision sheet', 'review', function () { GJ.decide.open(); }, 'decide'],
    ['aplayer', 'archive player', 'review', inArchive(function () { GJ.aplayer.playCurrent(); }), 'aplayer'],
    ['sweep', 'compare', 'review', function () { GJ.sweep.open(); }, 'sweep'],
    ['golden', 'golden hour', 'plan', room('golden')], ['planner', 'shot planner', 'plan', function () { GJ.planner.open(); }, 'planner'], ['red', 'timer', 'plan', room('red')], ['welcome', 'welcome', 'plan', function () { GJ.welcome.open(); }, 'welcome'], ['balance', 'balance', 'plan', function () { GJ.balance.open(); }, 'balance'],
    ['friends', 'friends', 'people', function () { GJ.friends.open(); }, 'friends'],
    ['messages', 'messages', 'share', function () { GJ.messages.open(); }, 'messages'], ['about', 'about', 'share', function () { GJ.about.open(); }, 'about']
  ], ALL = [];
  function build() { ALL = DEFS.filter(function (n) { return !n[4] || has(n[4]); }).map(function (n) { return { id: n[0], name: n[1], cl: n[2], go: n[3] }; }); nodes = [HOME].concat(ALL); }   // only what is built, asked at the moment the map opens
  var HOME = { id: 'sky', name: 'the sky', cl: 'home', go: function () { if (GJ.app.room) GJ.app.back(); if (GJ.app.room) GJ.app.back(); GJ.app.toSky(); } };
  var el = document.createElement('section'); el.id = 'nm'; el.setAttribute('aria-label', 'map of the app');
  el.innerHTML = '<b class="jul">map</b><p class="nm-say"></p><div class="nm-field"><svg class="nm-trail" aria-hidden="true"><polyline fill="none"></polyline></svg></div><div class="nm-list" hidden></div>' +
    '<div class="nm-act"><button data-a="back">back</button><button data-a="list">list</button><button data-a="close">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, field = q('.nm-field'), listEl = q('.nm-list'), say = q('.nm-say'), line = q('polyline');
  var on = false, lit = 0, asList = false, teach = 0, nodes = [], btn = {};
  build();
  function here() { var r = GJ.app.room; if (r === 'loupe') return 'lab'; return r && nodes.some(function (n) { return n.id === r; }) ? r : 'sky'; }
  function hints() {   // something waiting — said with a pulse, never a number
    var h = {}; try { if (GJ.decide && GJ.decide.state().questions.some(function (x) { return !x.final; })) h.decide = 1; } catch (e) {}
    try { if (GJ.demos && GJ.demos.state().songs.some(function (s) { return s.open > 0; })) h.demos = 1; } catch (e) {}
    try { if (GJ.planner) { var d = new Date(), a = d.toISOString().slice(0, 10), b = new Date(+d + 86400000).toISOString().slice(0, 10); if (GJ.planner.plans().some(function (p) { return p.date === a || p.date === b; })) h.planner = 1; } } catch (e) {}
    return h;
  }
  // a phone is tall: the clusters are bands down the screen — MAKE, REVIEW, the sky in the middle, PLAN, then PEOPLE and SHARE side
  // by side — and a band's stars zig-zag on two lines, so no two names ever sit on each other
  var BAND = { make: [7, 15], review: [30, 38], plan: [65, 73], people: [91, 91], share: [91, 91] }, XR = { people: [2, 46], share: [54, 98] };
  function pos(n) { if (n.cl === 'home') return [50, 51]; var mem = ALL.filter(function (x) { return x.cl === n.cl; }), mi = mem.indexOf(n), xr = XR[n.cl] || [1, 99]; return [xr[0] + (mi + .5) / mem.length * (xr[1] - xr[0]), BAND[n.cl][mi % 2]]; }
  function lab(c) { var xr = XR[c] || [0, 100]; return [(xr[0] + xr[1]) / 2, BAND[c][0] - 6.5]; }
  function place() {
    nodes.forEach(function (n) { var p = pos(n), b = btn[n.id]; if (b) { b.style.left = p[0] + '%'; b.style.top = p[1] + '%'; } });
    [].forEach.call(field.querySelectorAll('.nm-cl'), function (c) { var p = lab(c.dataset.c); c.style.left = p[0] + '%'; c.style.top = p[1] + '%'; });
    var r = field.getBoundingClientRect(); line.setAttribute('points', N.trail.map(function (id) { var n = nodes.filter(function (x) { return x.id === id; })[0]; if (!n) return ''; var p = pos(n); return (p[0] / 100 * r.width).toFixed(1) + ',' + (p[1] / 100 * r.height).toFixed(1); }).filter(Boolean).join(' '));
  }
  function paint() {
    var h = here(), hi = hints(); [].forEach.call(field.querySelectorAll('button, .nm-cl'), function (x) { x.remove(); }); btn = {};
    CL.forEach(function (c) { var s = document.createElement('span'); s.className = 'nm-cl jul' + (ALL.some(function (n) { return n.cl === c[0]; }) ? '' : ' none'); s.dataset.c = c[0]; s.textContent = c[1]; field.appendChild(s); });
    nodes.forEach(function (n, i) { var b = document.createElement('button'); b.className = 'nm-n' + (n.id === h ? ' here' : '') + (N.been[n.id] ? ' been' : '') + (hi[n.id] ? ' wait' : '') + (i === lit ? ' lit' : '') + (n.cl === 'home' ? ' home' : ''); b.dataset.id = n.id; b.innerHTML = '<i>✦</i><span></span>'; b.lastChild.textContent = n.name;
      b.setAttribute('aria-label', n.name + (n.id === h ? ', you are here' : '') + (hi[n.id] ? ', something is waiting' : '')); if (n.id === h) b.setAttribute('aria-current', 'location'); field.appendChild(b); btn[n.id] = b; });
    listEl.innerHTML = ''; var add = function (title, arr, none) { var hd = document.createElement('h3'); hd.className = 'jul'; hd.textContent = title; listEl.appendChild(hd); if (!arr.length) { var p = document.createElement('p'); p.textContent = none; listEl.appendChild(p); } arr.forEach(function (n) { var b = document.createElement('button'); b.dataset.id = n.id; b.textContent = n.name + (n.id === h ? ' · you are here' : '') + (hi[n.id] ? ' · something is waiting' : ''); if (n.id === h) { b.className = 'here'; b.setAttribute('aria-current', 'location'); } listEl.appendChild(b); }); };
    add('home', [HOME], ''); CL.forEach(function (c) { add(c[1], ALL.filter(function (n) { return n.cl === c[0]; }), 'nothing built here yet — it belongs to the app proper'); });
    var hn = nodes.filter(function (n) { return n.id === h; })[0]; say.textContent = 'you are in ' + (hn ? hn.name : 'the sky') + ' · tap a star to go there' + (Object.keys(hi).length ? ' · a pulse means something is waiting' : '');
    q('[data-a="back"]').disabled = N.trail.length < 2; q('[data-a="list"]').textContent = asList ? 'stars' : 'list'; field.hidden = asList; listEl.hidden = !asList; place();
  }
  function go(id) {
    var n = nodes.filter(function (x) { return x.id === id; })[0]; if (!n) return false; N.been[id] = 1; if (N.trail[N.trail.length - 1] !== id) N.trail.push(id); N.trail = N.trail.slice(-8); save(); close(); GJ.haptic.commit();
    if (id !== here()) HOME.go(); setTimeout(function () { try { if (id !== 'sky') n.go(); } catch (e) {} }, id === 'sky' || !GJ.app.room ? 30 : 120); return true;
  }
  function back() { if (N.trail.length < 2) return false; N.trail.pop(); var id = N.trail.pop(); save(); return go(id); }
  var PLACE = { key: 'nm-place', label: 'PLACE', min: 0, max: 1, def: 0, span: 320, unit: .02, get: function () { return nodes.length > 1 ? lit / (nodes.length - 1) : 0; }, set: function (v) { var k = Math.round(clamp(v, 0, 1) * (nodes.length - 1)); if (k !== lit) { lit = k; mark(); GJ.haptic.tick(); } }, fmt: function () { return nodes[lit] ? nodes[lit].name : ''; }, hold: function (d) { if (d && nodes[lit]) go(nodes[lit].id); } };
  function mark() { nodes.forEach(function (n, i) { if (btn[n.id]) btn[n.id].classList.toggle('lit', i === lit); }); if (GJ.dial.visible) GJ.dial.redraw(); }
  function tick() { if (!on || !teach) return; var u = (GJ.now() - teach) / 5000; if (u >= 1) { teach = 0; el.classList.remove('teach'); N.taught = true; save(); lit = hereIx(); mark(); return; } var k = Math.min(nodes.length - 1, Math.floor(u * nodes.length)); if (k !== lit) { lit = k; mark(); } requestAnimationFrame(tick); }   // the first time: each place named once, in turn, in five seconds
  function hereIx() { var h = here(); for (var i = 0; i < nodes.length; i++) if (nodes[i].id === h) return i; return 0; }
  function open() { if (on) return; on = true; build(); asList = GJ.reduced(); lit = hereIx(); N.been[here()] = 1; if (!N.trail.length) N.trail.push(here()); save(); html.classList.add('mapping'); paint(); GJ.dial.pop([PLACE]); GJ.haptic.tick();
    if (!N.taught && !asList) { teach = GJ.now(); el.classList.add('teach'); requestAnimationFrame(tick); } }
  function close() { if (!on) return; on = false; teach = 0; el.classList.remove('teach'); html.classList.remove('mapping'); if (GJ.dial.popped()) GJ.dial.hideNow(); }
  el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a; if (b.dataset.id) { go(b.dataset.id); return; } if (a === 'close') close(); else if (a === 'back') back(); else if (a === 'list') { asList = !asList; teach = 0; el.classList.remove('teach'); paint(); } });
  G.addEventListener('resize', function () { if (on) place(); });
  G.addEventListener('load', build);
  GJ.navmap = { open: open, close: close, isOpen: function () { return on; }, go: go, back: back, nodes: function () { build(); return nodes.map(function (n) { return { id: n.id, name: n.name, cl: n.cl }; }); }, list: function (v) { asList = !!v; if (on) paint(); },
    state: function () { return { on: on, here: here(), trail: N.trail.slice(), been: Object.keys(N.been), hints: Object.keys(hints()), list: asList, lit: nodes[lit] ? nodes[lit].id : null, taught: N.taught, teaching: !!teach }; } };
})(window);
