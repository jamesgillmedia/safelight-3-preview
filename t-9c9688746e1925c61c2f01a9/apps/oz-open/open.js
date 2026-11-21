/* oz · opening (prototype). Gill's backbone, 20 Nov: after the dot, black, and only what you came for —
   the dock minimised to a star, the pure moon, faint stars of what you were doing or what fits now, the dimmer as a hairline,
   one dial (the right-edge dial on its weather ring), a hide dot where the Mark was, and a float for search.
   Everything is on this phone. Nothing leaves. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); }, H = document.documentElement, Q = new URLSearchParams(location.search);
  function get(k, d) { try { var v = localStorage.getItem('ozo-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem('ozo-' + k, JSON.stringify(v)); } catch (e) {} }
  if (Q.has('fresh')) { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('ozo-') === 0) localStorage.removeItem(k); }); } catch (e) {} }
  var NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66], LOW = 392;   // the oz constellation's chimes: pentatonic
  function tick(n) { try { navigator.vibrate && navigator.vibrate(n || 6); } catch (e) {} }
  var DEF = { ozcon: 1, moon: 1, stars: 1, dock: 1, dimmer: 1, dial: 1, hide: 1, corner: 1, fmt: 'bar', motion: 'auto', sound: 1, keepOne: 0, essentials: 0, dockStyle: 'icons', hl: 'gold', centre: 'blend', rt: 'red', parallax: 1, panels: 0,
    rooms: { timer: { ring: 1, digits: 1, label: 1, acts: 1 }, golden: { arc: 1, rows: 1, place: 1 }, player: { album: 1, wave: 1, play: 1 }, notes: { line: 1 } } };
  var P = get('prefs', null) || JSON.parse(JSON.stringify(DEF));
  Object.keys(DEF).forEach(function (k) { if (P[k] == null) P[k] = JSON.parse(JSON.stringify(DEF[k])); });
  if (!P.v5) { P.dockStyle = 'icons'; P.centre = P.centre || 'blend'; P.v5 = 1; }   // v5: the icon constellation is the dock now
  if (!P.v51) { P.rt = 'red'; if (P.rtv) delete P.rtv.red; P.v51 = 1; }   // v5.1: refined red is the red-mode text (Gill's pick)
  if (!P.v7) { P.moon = 1; P.stars = 0; P.dock = 0; P.hide = 0; P.dial = 1; P.dimmer = 1; P.centre = 'oz'; P.keepOne = 0; P.essentials = P.essentials || 0; P.v7 = 1; put('quiet', false); }   // v7: at rest, almost nothing
  var RTD = { cream: { h: 40, s: 12, l: 36, g: 0, w: 0 }, amber: { h: 28, s: 52, l: 33, g: 2, w: 0 }, red: { h: 354, s: 28, l: 32, g: 2, w: 0 } };
  P.rtv = P.rtv || {}; Object.keys(RTD).forEach(function (k) { P.rtv[k] = Object.assign({}, RTD[k], P.rtv[k] || {}); });
  if (Q.get('f') === 'bar' || Q.get('f') === 'stars') P.fmt = Q.get('f');
  if (Q.get('motion')) P.motion = Q.get('motion');
  function save() { put('prefs', P); }
  function still() { return P.motion === 'still' || (P.motion === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function applyMotion() { H.classList.toggle('still', still()); }
  applyMotion();
  /* red mode text (Gill, 8:50/8:51 PM): refined red by default — deep, soft, low saturation, a subtle glow; dim cream and amber to compare.
     three looks, each tuneable live (hue, saturation, brightness, glow, weight) so the standard can be dialled in */
  function hsl2rgb(h, s, l) { s /= 100; l /= 100; var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l), f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); }; return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round); }
  function hx(c) { return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, v)).toString(16)).slice(-2); }).join(''); }
  var RT = { ink: null };
  function applyRT() {
    var st = document.documentElement.style, names = ['--ink', '--here', '--near', '--mid', '--far', '--dim', '--meta', '--hair', '--moon', '--dk', '--tglow', '--tw'];
    if (!H.classList.contains('red')) { names.forEach(function (n) { st.removeProperty(n); }); RT.ink = null; applyHL && applyHL(); return; }
    var v = P.rtv[P.rt] || RTD.cream, L = function (m) { return hx(hsl2rgb(v.h, v.s, Math.min(96, v.l * m))); }, c = hsl2rgb(v.h, v.s, v.l);
    st.setProperty('--ink', L(1)); st.setProperty('--here', L(1.12)); st.setProperty('--near', L(1)); st.setProperty('--mid', L(.8)); st.setProperty('--far', L(.46));
    st.setProperty('--dim', L(.9)); st.setProperty('--meta', L(.62)); st.setProperty('--hair', 'rgba(' + c.join(',') + ',.22)'); st.setProperty('--moon', L(1.05)); st.setProperty('--dk', L(1));
    st.setProperty('--tglow', v.g ? '0 0 ' + v.g + 'px rgba(' + c.join(',') + ',.55)' : 'none'); st.setProperty('--tw', (v.w || 0) + 'px');
    RT.ink = c; if (typeof applyHL === 'function') applyHL();
  }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(function () { el.classList.remove('on'); }, 2200); }

  /* red mode: on by default, one tap on the dot */
  if (get('red', true) === false) H.classList.remove('red');
  $('disc').addEventListener('click', function () { H.classList.toggle('red'); put('red', H.classList.contains('red')); applyRT(); tick(8); if (S.view === 'sky') drawSky(); });

  /* ——— the sun, for the place (Vancouver by default) ——— */
  var LAT = 49.2827, LNG = -123.1207, TZ = 'America/Vancouver';
  function sunAt(date, hDeg) {
    var rad = Math.PI / 180, J1970 = 2440588, J2000 = 2451545, day = 864e5, e = rad * 23.4397, J0 = 0.0009;
    var lw = rad * -LNG, phi = rad * LAT, d = date.valueOf() / day - 0.5 + J1970 - J2000;
    var n = Math.round(d - J0 - lw / (2 * Math.PI)), ds = J0 + lw / (2 * Math.PI) + n;
    var M = rad * (357.5291 + 0.98560028 * ds), C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    var L = M + C + rad * 102.9372 + Math.PI, dec = Math.asin(Math.sin(e) * Math.sin(L));
    var Jnoon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    var w = Math.acos((Math.sin(hDeg * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    var a = J0 + (w + lw) / (2 * Math.PI) + n, Jset = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L), Jrise = Jnoon - (Jset - Jnoon);
    var f = function (j) { return new Date((j + 0.5 - J1970) * day); };
    return { rise: f(Jrise), set: f(Jset) };
  }
  function hm(d) { return d.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, '').toLowerCase(); }
  function sunToday() {
    var now = new Date(), s = sunAt(now, -0.833), g = sunAt(now, 6), b = sunAt(now, -6);
    var next = s.rise > now ? s.rise : sunAt(new Date(now.valueOf() + 864e5), -0.833).rise;
    return { now: now, rise: s.rise, set: s.set, goldAm: g.rise, goldPm: g.set, blueAm: b.rise, bluePm: b.set, nextRise: next };
  }
  function localHour() { return +new Date().toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }) % 24; }

  /* ——— what you were doing (on this phone; seeded once for the prototype) ——— */
  var timer = get('timer', null);
  if (!timer) { timer = { total: 1500, end: Date.now() + (18 * 60 + 40) * 1000, label: 'ridge · long exposure', paused: false, left: 0 }; put('timer', timer); }
  function tLeft() { return Math.max(0, Math.round(timer.paused ? timer.left : (timer.end - Date.now()) / 1000)); }
  function tRunning() { return tLeft() > 0 && !timer.paused; }
  function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  var ROOMS = {
    timer: { name: 'timer', words: 'timer time countdown count exposure lapse minutes min minute clock alarm' },
    golden: { name: 'golden hour', words: 'golden hour sun sunrise sunset light blue dawn dusk shoot' },
    player: { name: 'sky player', words: 'sky player music songs song play listen lost coffee sound' },
    notes: { name: 'notes', words: 'notes note write idea jot remember list' },
    noise: { name: 'white noise', words: 'white noise static hush sleep focus room' },
    sky: { name: 'the sky', words: 'sky everything map wander all rooms home places' }
  };
  var ENVS = ['clear', 'rain', 'snow', 'fog', 'noise'], ENVNAME = { clear: 'clear', rain: 'rain', snow: 'snow', fog: 'fog', noise: 'white noise' };
  var ENVW = { rain: 'rain storm drizzle wet', snow: 'snow snowfall flakes winter', fog: 'fog mist cloud', noise: 'white noise static hush sleep focus' };
  function face(id) {
    var s = sunToday(), now = s.now;
    if (id === 'timer') return tLeft() ? { line: 'timer · ' + mmss(tLeft()) + (timer.paused ? ' paused' : ' left'), sub: timer.label } : { line: 'timer', sub: 'set ' + mmss(timer.total || 1500) };
    if (id === 'golden') {
      if (now < s.goldPm && now > s.rise) { var m = Math.round((s.goldPm - now) / 6e4); return { line: m < 120 ? 'golden hour in ' + m + ' min' : 'sunset ' + hm(s.set), sub: 'golden hour' }; }
      if (now >= s.goldPm && now < s.bluePm) return { line: 'golden hour now', sub: 'sunset ' + hm(s.set) };
      return { line: 'sunrise ' + hm(s.nextRise), sub: 'golden hour' };
    }
    if (id === 'player') return { line: 'lost in time', sub: 'sky player' };
    if (id === 'noise') return { line: 'white noise', sub: 'a room of sound' };
    if (id === 'notes') { var n = (get('note', '') || '').trim(); return { line: n ? n.split('\n')[0].slice(0, 24) : 'a note', sub: 'notes' }; }
    return { line: 'the sky', sub: 'everything' };
  }
  function likely() {
    var first = tLeft() ? 'timer' : get('last', 'timer'); if (first === 'sky') first = 'timer';
    var s = sunToday(), now = s.now, h = localHour(), order;
    var nearSun = Math.abs(now - s.goldPm) < 90 * 6e4 || Math.abs(now - s.goldAm) < 90 * 6e4;
    if (nearSun) order = ['golden', 'timer', 'notes', 'player'];
    else if (now > s.bluePm || now < s.blueAm) order = ['player', 'golden', 'notes', 'timer'];
    else if (h < 12) order = ['golden', 'notes', 'timer', 'player'];
    else order = ['golden', 'notes', 'player', 'timer'];
    return [first].concat(order.filter(function (x) { return x !== first; }));
  }

  /* ——— views ——— */
  var S = { view: 'boot', stack: [], room: null, env: 'clear', pick: null };
  function show(id) { if (id !== 'float' && S.view === 'float') { var o0 = $('open'); o0.style.pointerEvents = ''; if (S.env === 'clear') o0.style.opacity = ''; } ['open', 'room', 'sky', 'float', 'ask'].forEach(function (k) { $(k).classList.toggle('on', k === id); }); S.view = id; }
  function goHome() { S.room = null; S.stack = []; show('open'); renderOpen(); }
  function back() {
    if ($('sheet').classList.contains('on')) { $('sheet').classList.remove('on'); return true; }
    if (S.view === 'ask') { tick(6); show('float'); $('flIn').focus({ preventScroll: true }); return true; }
    if (S.view === 'float') { closeFloat(); return true; }
    if (NZ.on) { history.back(); return true; }
    if (S.env !== 'clear' && S.view === 'open') { setEnv('clear'); return true; }
    if (S.view === 'room' || S.view === 'sky') { tick(6); var p = S.stack.pop(); if (p === 'sky') { S.room = null; show('sky'); drawSky(); } else if (p && p.indexOf('room:') === 0) backToRoom(p.slice(5)); else goHome(); return true; }
    if ($('moon').classList.contains('open')) { $('moon').classList.remove('open'); return true; }
    if ($('dock').classList.contains('open')) { $('dock').classList.remove('open'); return true; }
    if (S.pick) { unpick(); return true; }
    return false;
  }
  
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') V7.goBack(); });
  function open(id, from, el) {
    if (id === 'noise') { goNoise(el); return; }
    tick(12); $('moon').classList.remove('open'); $('dock').classList.remove('open'); unpick();
    if (S.env !== 'clear') setEnv('clear', true);
    if (id === 'sky') { S.stack.push(S.view === 'sky' ? 'sky' : 'home'); show('sky'); drawSky(); return; }
    S.stack.push(from === 'sky' ? 'sky' : 'home'); S.room = id; put('last', id); if (DOCK.indexOf(id) >= 0) put('recent', [id].concat(get('recent', []).filter(function (x) { return x !== id; })));
    $('rT').textContent = ROOMS[id].name; rooms[id]($('rB')); applyRoomPrefs(id); show('room');
  }

  /* ——— stars only where they ARE controls: a small constellation, each star a labelled 44 pt target, hairlines showing how
     they belong together. used by the dock and the moon. pts are px from the host's origin; links are [a, b] pairs (-1 = the origin) */
  function conUI(host, items, pts, links, cur, onPick, o) {
    o = o || {};
    var minx = 0, miny = 0, maxx = 0, maxy = 0; pts.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
    var pad = 20, vb = [minx - pad, miny - pad, maxx - minx + pad * 2, maxy - miny + pad * 2];
    var s = '<svg viewBox="' + vb.join(' ') + '" style="left:' + vb[0] + 'px;top:' + vb[1] + 'px;width:' + vb[2] + 'px;height:' + vb[3] + 'px" aria-hidden="true">';
    links.forEach(function (l, k) { var a = l[0] < 0 ? [0, 0] : pts[l[0]], b = pts[l[1]], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, g0 = l[0] < 0 ? 4 : (o.gap || 7), g1 = o.gap || 7;
      s += '<line style="--d:' + k + '" x1="' + (a[0] + dx / d * g0).toFixed(1) + '" y1="' + (a[1] + dy / d * g0).toFixed(1) + '" x2="' + (b[0] - dx / d * g1).toFixed(1) + '" y2="' + (b[1] - dy / d * g1).toFixed(1) + '"/>'; });
    host.innerHTML = s + (o.extra || '') + '</svg>';
    items.forEach(function (id, i) { var b = document.createElement('button'); b.className = 'cs' + (o.icons ? ' ico' : '') + (id === cur ? ' cur' : ''); b.style.left = pts[i][0] + 'px'; b.style.top = pts[i][1] + 'px'; b.style.setProperty('--d', i);
      b.setAttribute('aria-label', ROOMS[id].name); b.dataset.id = id; b.innerHTML = (o.icons ? '<b class="ic">' + ICON[id] + '</b>' : '<i></i>') + '<span></span>'; b.lastChild.textContent = ROOMS[id].name; if (o.alpha) b.style.setProperty('--a', o.alpha[i]);
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); b.addEventListener('pointerup', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); tick(10); onPick(id, b); }); host.appendChild(b); });
  }
  var DOCK = ['timer', 'golden', 'player', 'noise', 'notes', 'sky'];
  var ICON = {   // one 24 grid, one 1.25 stroke, round joins; circles drawn a touch smaller so every glyph weighs the same
    timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.4" r="7.1"/><path d="M12 9.6v3.8l2.5 1.5M9.9 3.7h4.2M12 3.7v2.6"/></svg>',
    golden: '<svg viewBox="0 0 24 24"><path d="M3.2 16.2h17.6M7.3 16.2a4.7 4.7 0 0 1 9.4 0M12 6.9v2M6.7 9.4l1.3 1.3M17.3 9.4l-1.3 1.3M8.4 19.4h7.2"/></svg>',
    player: '<svg viewBox="0 0 24 24"><path d="M9.6 7.3v9.4c0 .5.5.8.9.5l7-4.7c.4-.3.4-.8 0-1.1l-7-4.6c-.4-.3-.9 0-.9.5z"/></svg>',
    noise: '<svg viewBox="0 0 24 24"><path d="M3.6 12h1.6M7.4 9.4v5.2M10.4 6.4v11.2M13.6 8.2v7.6M16.6 10.2v3.6M19.2 12h1.2"/></svg>',
    notes: '<svg viewBox="0 0 24 24"><path d="M6.6 4.4h7.6l3.2 3.2v12H6.6z"/><path d="M14.2 4.4v3.2h3.2M9.4 11.4h5.2M9.4 14.4h5.2M9.4 17.2h3"/></svg>',
    sky: '<svg viewBox="0 0 24 24"><path d="M14.4 5a7.2 7.2 0 1 0 4.8 12 6 6 0 0 1-4.8-12z"/><path d="M5.6 6.4h.01M8.4 3.9h.01" class="pt"/></svg>'
  };
  // the one you are using now sits in the middle; the ones before it around it, older = fainter
  function recent() { var r = get('recent', null) || ['timer', 'noise', 'player', 'golden', 'notes'], now = r[0] || likely()[0]; r = [now].concat(r.filter(function (x) { return x !== now; })); DOCK.forEach(function (x) { if (r.indexOf(x) < 0) r.push(x); }); return r.slice(0, 5); }
  var SLOTI = [[0, -178], [86, -138], [-86, -138], [154, -76], [-154, -76]], SLOT = [[0, -146], [70, -114], [-70, -114], [132, -60], [-132, -60]], SLOTLN = [[-1, 0], [0, 1], [0, 2], [1, 3], [2, 4]], ALPHA = [1, .8, .8, .5, .5];
  var DIAL = { k: 0, ring: null };
  function renderDock() {
    var host = $('dockCon'), r = recent(), st = P.dockStyle; $('dock').dataset.style = st;
    if (st === 'icons') { conUI(host, r, SLOTI, SLOTLN, r[0], function (id, b) { fold(); open(id, null, b); }, { alpha: ALPHA, icons: true, gap: 27 }); return; }
    if (st !== 'dial') { conUI(host, r, SLOT, SLOTLN, r[0], function (id, b) { fold(); open(id, null, b); }, { alpha: ALPHA }); return; }
    // the dial: the same places on an arc rising from the tick; slide sideways to turn, tap to go
    DIAL.ring = [r[4], r[2], r[0], r[1], r[3]]; DIAL.k = 0;
    var arc = '<path class="arc" d="M-150 -6 A150 150 0 0 1 150 -6" /><path class="notch" d="M0 -176 L0 -168"/>';
    conUI(host, DIAL.ring, DIAL.ring.map(function () { return [0, 0]; }), [], null, function (id) { fold(); open(id); }, { extra: arc });
    var pad = document.createElement('div'); pad.className = 'pad'; host.insertBefore(pad, host.firstChild);
    dialLay(false);
  }
  function dialLay(tk) {
    var host = $('dockCon'), A = [-64, -32, 0, 32, 64], AL = [.5, .8, 1, .8, .5], n = DIAL.ring.length;
    for (var p = 0; p < n; p++) { var id = DIAL.ring[((p + DIAL.k) % n + n) % n], b = host.querySelector('.cs[data-id="' + id + '"]'), a = A[p] * Math.PI / 180;
      b.style.left = (Math.sin(a) * 150).toFixed(1) + 'px'; b.style.top = (-6 - Math.cos(a) * 150 + 0).toFixed(1) + 'px';
      b.style.setProperty('--a', AL[p]); b.classList.toggle('cur', p === 2); }
    if (tk) tick(4);
  }
  (function () {   // turning the dial
    var sx = null, k0 = 0, moved = false;
    $('dockCon').addEventListener('pointerdown', function (e) { if (P.dockStyle !== 'dial' || !$('dock').classList.contains('open')) return; sx = e.clientX; k0 = DIAL.k; moved = false; }, true);
    addEventListener('pointermove', function (e) { if (sx == null) return; var st = Math.round((sx - e.clientX) / 44); if (st) moved = true; if (k0 + st !== DIAL.k) { DIAL.k = k0 + st; dialLay(true); } });
    addEventListener('pointerup', function () { sx = null; });
    $('dockCon').addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  })();
  function fold() { $('dock').classList.remove('open'); $('moon').classList.remove('open'); }

  var HL = { gold: '#DDBC89', coral: '#E1626B', rose: '#DCA4AB', white: '#e8e4dc' };
  function applyHL() {   // in red mode the highlight dims with the text, so nothing on screen is bright
    var c = HL[P.hl] || HL.gold;
    if (RT.ink) { var v = P.rtv[P.rt], k = Math.min(1, (v.l * 1.25) / 62), r = [1, 3, 5].map(function (i) { return Math.round(parseInt(c.substr(i, 2), 16) * k); }); c = hx(r); }
    H.style.setProperty('--hl', c);
  }
  applyRT(); applyHL();

  /* ——— the opening state. what you were doing returns as a small constellation of labelled stars (Gill, 8:45 PM):
     each star a clear target, its label always there, hairlines for how they relate, the one now brightest in your
     highlight, older ones further back and fainter. the centre of the phone has three treatments (tune):
     inside oz = depth with a soft vanishing point · familiar = a calm clock and date on a clean grid · blend = both ——— */
  var CEN = {
    oz:       { vp: [.5, .47], pts: [[.50, .47], [.76, .36], [.25, .39], [.66, .64]], z: [1, .78, .64, .5], ln: [[0, 1], [0, 2], [0, 3]] },
    familiar: { vp: [.5, .27], pts: [[.29, .50], [.71, .50], [.29, .63], [.71, .63]], z: [1, .82, .7, .58], ln: [[0, 1], [0, 2], [1, 3]] },
    blend:    { vp: [.5, .40], pts: [[.50, .555], [.78, .47], [.22, .47], [.69, .67]], z: [1, .8, .66, .52], ln: [[-1, 0], [0, 1], [0, 2], [0, 3]] }
  };
  var DEPTH = { px: 0, py: 0, tx: 0, ty: 0, raf: 0 };
  /* depth by forced perspective (Gill, 8:54 PM): the dot grid recedes — dots shrink and dim toward a vanishing point,
     rows converge, nearer dots a touch brighter. familiar keeps it flat and even. drawn once, redrawn only when you move */
  function renderCentre() {
    var m = CEN[P.centre] || CEN.blend, c = $('centre'); c.dataset.mode = P.centre; c.classList.toggle('panels', !!P.panels);
    var an2 = c.querySelector('.anchor'); an2.style.left = (m.vp[0] * 100) + '%'; an2.style.top = (m.vp[1] * 100) + '%';
    drawGrid(); clock(); panels();
  }
  function drawGrid() {
    var cv = $('centre').querySelector('.grid'), W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, Hh);
    var ink = rgb(), m = CEN[P.centre] || CEN.blend, vx = m.vp[0] * W, vy = m.vp[1] * Hh, g = 30;
    if (P.centre === 'familiar') {   // flat and even, the way a phone is
      for (var gx = g / 2 + (W % g) / 2; gx < W; gx += g) for (var gy = g; gy < Hh; gy += g) { x.fillStyle = 'rgba(' + ink + ',' + (RT.ink ? .2 : .1) + ')'; x.fillRect(Math.round(gx) - .5, Math.round(gy) - .5, 1, 1); }
      return;
    }
    var cx = DEPTH.px * 16, cy = DEPTH.py * 12, A = W * .5, B = Hh * .5;
    // a soft light where it goes
    var gr = x.createRadialGradient(vx - cx * .1, vy - cy * .1, 0, vx, vy, W * .62); gr.addColorStop(0, 'rgba(' + ink + ',.055)'); gr.addColorStop(1, 'rgba(' + ink + ',0)'); x.fillStyle = gr; x.fillRect(0, 0, W, Hh);
    function dot(X, Y, z) { var sx = vx + (X - cx) / z, sy = vy + (Y - cy) / z; if (sx < -4 || sx > W + 4 || sy < -4 || sy > Hh + 4) return;
      var a = Math.min(.42, (RT.ink ? .62 : .34) / Math.pow(z, 1.1)) * (1 - Math.min(1, (z - 1) / 7.6)), r = Math.max(.4, 1.15 / Math.pow(z, .75));
      x.fillStyle = 'rgba(' + ink + ',' + a.toFixed(3) + ')'; x.beginPath(); x.arc(sx, sy, r, 0, 6.283); x.fill(); }
    // four walls of an even grid, seen down their length: floor, ceiling, left, right
    for (var z = 1; z < 8.6; z *= 1.075) {
      for (var u = -A; u <= A + .1; u += g) { dot(u, B * 1.02, z); dot(u, -B * 1.02, z); }
      for (var v = -B + g; v < B; v += g) { dot(-A * 1.02, v, z); dot(A * 1.02, v, z); }
    }
  }
  function panels() {   // subtle opaque panels: soft dark frosted boxes behind the groups, a layer of dimension (tune)
    var box = $('panels'); box.innerHTML = ''; if (!P.panels || S.view !== 'open') return;
    var add = function (r, z) { var p = document.createElement('i'); p.style.left = r[0] + 'px'; p.style.top = r[1] + 'px'; p.style.width = r[2] + 'px'; p.style.height = r[3] + 'px'; p.style.setProperty('--z', z); box.appendChild(p); };
    var st = $('stars').querySelectorAll('.st'); if (st.length) { var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; Array.prototype.forEach.call(st, function (b) { var l = parseFloat(b.style.left), t = parseFloat(b.style.top); x0 = Math.min(x0, l - 64); x1 = Math.max(x1, l + 64); y0 = Math.min(y0, t - 26); y1 = Math.max(y1, t + 50); }); add([Math.max(14, x0), y0, Math.min(innerWidth - 14, x1) - Math.max(14, x0), y1 - y0], .7); }
    if (P.centre !== 'oz') { var a = $('centre').querySelector('.anchor').getBoundingClientRect(); if (a.width) add([a.left - 26, a.top - 16, a.width + 52, a.height + 30], 1); }
  }
  function clock() {
    var d = new Date(), t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, '');
    var dt = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toLowerCase().replace(',', '');
    var c = $('centre'); if (!c) return; c.querySelector('.clk').textContent = t; c.querySelector('.dt').textContent = dt; $('status').querySelector('time').textContent = t;

  }
  function renderStars() {
    var m = CEN[P.centre] || CEN.blend, W = innerWidth, Hh = innerHeight, L = likely().slice(0, 4), box = $('stars'), P2 = m.pts.map(function (p) { return [p[0] * W, p[1] * Hh]; });
    var vp = [m.vp[0] * W, m.vp[1] * Hh + 34], s = '<svg class="sl" aria-hidden="true">';
    m.ln.forEach(function (l, k) { var a = l[0] < 0 ? vp : P2[l[0]], b = P2[l[1]], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, g0 = l[0] < 0 ? 4 : 12, g1 = 12;
      s += '<line style="--d:' + k + ';opacity:' + (.34 * m.z[l[1]]).toFixed(2) + '" x1="' + (a[0] + dx / d * g0).toFixed(1) + '" y1="' + (a[1] + dy / d * g0).toFixed(1) + '" x2="' + (b[0] - dx / d * g1).toFixed(1) + '" y2="' + (b[1] - dy / d * g1).toFixed(1) + '"/>'; });
    box.innerHTML = s + '</svg>'; box.dataset.mode = P.centre;
    if (!P.keepOne) box.querySelector('.sl').classList.add('q-hide');
    L.forEach(function (id, i) {
      var f = face(id), b = document.createElement('button'); b.className = 'st' + (i === 0 ? ' doing' : '') + (i === 0 && P.keepOne ? '' : ' q-hide'); b.dataset.id = id;
      b.style.left = P2[i][0] + 'px'; b.style.top = P2[i][1] + 'px'; b.style.setProperty('--z', m.z[i]); b.style.setProperty('--d', i);
      b.setAttribute('aria-label', f.line); b.innerHTML = '<i></i><span></span>'; b.children[1].textContent = f.line;
      b.addEventListener('click', function (e) { e.stopPropagation(); tick(10); open(id); });
      box.appendChild(b);
    });
  }
  // a slight parallax: you are inside it. the rings and stars shift by their depth as you touch or tilt; still = none
  function parallax(x, y) { DEPTH.tx = x; DEPTH.ty = y; if (!DEPTH.raf) DEPTH.raf = requestAnimationFrame(pStep); }
  function pStep() {
    DEPTH.raf = 0; if (still() || !P.parallax || P.centre === 'familiar') { DEPTH.px = DEPTH.py = 0; } else { DEPTH.px += (DEPTH.tx - DEPTH.px) * .08; DEPTH.py += (DEPTH.ty - DEPTH.py) * .08; }
    var c = $('centre'); c.querySelector('.anchor').style.translate = (DEPTH.px * -2).toFixed(2) + 'px ' + (DEPTH.py * -2).toFixed(2) + 'px';
    Array.prototype.forEach.call($('stars').querySelectorAll('.st'), function (b) { var z = +b.style.getPropertyValue('--z') || 1; b.style.translate = (DEPTH.px * -7 * z).toFixed(2) + 'px ' + (DEPTH.py * -5 * z).toFixed(2) + 'px'; });
    $('stars').querySelector('.sl') && ($('stars').querySelector('.sl').style.translate = (DEPTH.px * -6).toFixed(2) + 'px ' + (DEPTH.py * -4).toFixed(2) + 'px');
    $('panels').style.translate = (DEPTH.px * -4).toFixed(2) + 'px ' + (DEPTH.py * -3).toFixed(2) + 'px';
    drawGrid();
    if (!still() && P.parallax && P.centre !== 'familiar' && Math.abs(DEPTH.tx - DEPTH.px) + Math.abs(DEPTH.ty - DEPTH.py) > .01) DEPTH.raf = requestAnimationFrame(pStep);
  }
  addEventListener('pointermove', function (e) { if (S.view !== 'open') return; parallax((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2); }, { passive: true });
  addEventListener('deviceorientation', function (e) { if (S.view !== 'open' || e.gamma == null) return; parallax(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30))); });
  (function drift() { if (!still() && P.parallax && P.centre !== 'familiar' && S.view === 'open' && !DEPTH.touch) { var t = performance.now() / 1000; parallax(Math.sin(t / 7) * .35, Math.cos(t / 9) * .25); } setTimeout(drift, 120); })();
  addEventListener('resize', function () { if (S.view === 'open') { renderStars(); renderCentre(); } });
  function renderOpen() {
    $('moon').classList.toggle('off', !P.moon); $('stars').classList.toggle('off', !P.stars); $('dock').classList.toggle('off', !P.dock);
    $('dimmer').classList.toggle('off', !P.dimmer); $('dial').classList.toggle('off', !P.dial); $('hide').classList.toggle('off', !P.hide); $('corner').classList.toggle('off', !P.corner); $('corner').classList.toggle('plain', !P.ozcon);
    placeMoon(); renderStars(); renderCentre();
    renderDock();
  }
  function unpick() { if (S.pick) S.pick.classList.remove('pick'); S.pick = null; }
  setInterval(function () { if (S.view === 'open') { var b = $('stars').querySelector('[data-id=timer] span'); if (b) b.textContent = face('timer').line; clock(); } }, 1000);
  ['moon', 'stars', 'dock', 'dimmer', 'dial', 'corner', 'tuneBtn', 'pull', 'centre', 'status'].forEach(function (id) { $(id).classList.add('q-hide'); });
  $('stars').classList.remove('q-hide');   // its children carry it, so the one thing can stay
  $('dockStar').addEventListener('click', function (e) { e.stopPropagation(); $('moon').classList.remove('open'); $('dock').classList.toggle('open'); tick(6); });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#dock, #moon')) fold(); }, true);   // a tap outside folds it back

  /* the hide dot: everything off except the phone (and, if you keep it, the one thing you are doing) */
  $('hide').addEventListener('click', function () { var q = H.classList.toggle('quiet'); tick(q ? 12 : 8); $('moon').classList.remove('open'); $('dock').classList.remove('open'); unpick(); put('quiet', q); });
  if (get('quiet', false)) H.classList.add('quiet');

  /* the moon: pure, and free — drag it anywhere; tap unfolds its hairline stars */
  function placeMoon() { var p = get('moonpos', null) || [.76, .16]; $('moon').style.left = (p[0] * 100) + '%'; $('moon').style.top = (p[1] * 100) + '%'; }
  /* pull down on the black: the float (Ask's own gesture, lighter) */
  (function () {
    var o = $('open'), sy = null, sx = 0, pl = $('pull'), tw = null, two = false;
    o.addEventListener('pointerdown', function (e) { if (e.target.closest('button,#moon')) return; sy = e.clientY; sx = e.clientX; });
    o.addEventListener('pointermove', function (e) { if (sy == null) return; var dy = e.clientY - sy; if (dy > 6) { pl.style.opacity = Math.min(1, dy / 90); pl.style.transform = 'translate(-50%,' + (Math.min(dy, 140) - 30) + 'px)'; } });
    o.addEventListener('pointerup', function (e) { if (sy == null) return; var dy = e.clientY - sy, dx = e.clientX - sx; sy = null; pl.style.opacity = 0; pl.style.transform = '';
      if (dy > 90) { openFloat(); return; }
      if (Math.abs(dy) < 8 && Math.abs(dx) < 8) { unpick(); $('dock').classList.remove('open'); $('moon').classList.remove('open'); } });
    // two fingers held still: tune
    document.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { two = true; clearTimeout(tw); tw = setTimeout(function () { if (two) openSheet(); }, 650); } }, { passive: true });
    document.addEventListener('touchmove', function () { two = false; }, { passive: true }); document.addEventListener('touchend', function () { two = false; clearTimeout(tw); }, { passive: true });
  })();

  /* ——— the dimmer: a hairline of light; slide it, and it swells, then folds back ——— */
  (function () {
    var d = $('dimmer'), bd = d.querySelector('.bd'), veil = $('dimveil'), sx, sy, mode = null, lvl = get('dim', 0), fold;
    function setL(v) { lvl = Math.max(0, Math.min(1, v)); veil.style.opacity = (lvl * .78).toFixed(3); }
    setL(lvl);
    d.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; mode = 'wait'; d.setPointerCapture(e.pointerId); clearTimeout(fold); });
    d.addEventListener('pointermove', function (e) { if (!mode) return; var dx = e.clientX - sx, dy = e.clientY - sy;
      if (mode === 'wait' && Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) { mode = 'dim'; d.classList.add('live'); tick(6); }
      if (mode === 'wait' && dx > 8 && dx > Math.abs(dy)) mode = 'back';
      if (mode === 'dim') { var c = innerHeight / 2, t = (e.clientY - (c - 150)) / 300; setL(t); bd.style.top = Math.max(c - 150, Math.min(c + 150, e.clientY)) + 'px'; } });
    d.addEventListener('pointerup', function (e) { var m = mode; mode = null; if (m === 'dim') { put('dim', lvl); fold = setTimeout(function () { d.classList.remove('live'); }, 1200); } else if (m === 'back' && e.clientX - sx > 40) V7.goBack(); });
    d.addEventListener('dblclick', function () { setL(0); put('dim', 0); });
  })();

  /* ——— the one dial that opens with you: weather. slide to turn, the plate shows the ring; let go to go in ——— */
  (function () {
    var d = $('dial'), pl = $('plate'), sy, start, idx, moved, lastTap = 0;
    pl.innerHTML = ENVS.map(function (k) { return '<b data-k="' + k + '">' + ENVNAME[k] + '</b>'; }).join('');
    function mark(i) { idx = i; Array.prototype.forEach.call(pl.children, function (b, k) { b.classList.toggle('cur', k === i); }); d.querySelector('.val').style.top = (i / (ENVS.length - 1) * 100) + '%'; }
    mark(0);
    d.addEventListener('pointerdown', function (e) { if (e.target.closest('.plate b') && d.classList.contains('live')) return; sy = e.clientY; start = ENVS.indexOf(S.env); moved = false; d.classList.add('live'); mark(start); d.setPointerCapture(e.pointerId); });
    d.addEventListener('pointermove', function (e) { if (sy == null) return; var st = Math.round((e.clientY - sy) / 36); if (st) moved = true; var i = Math.max(0, Math.min(ENVS.length - 1, start + st)); if (i !== idx) { mark(i); tick(4); } });
    d.addEventListener('pointerup', function (e) {
      if (sy == null) return; sy = null; var now = Date.now();
      if (!moved) { if (now - lastTap < 320) { mark(0); setEnv('clear'); d.classList.remove('live'); return; } lastTap = now; var b = document.elementFromPoint(e.clientX, e.clientY); if (b && b.dataset && b.dataset.k) { mark(ENVS.indexOf(b.dataset.k)); pickEnv(b.dataset.k); setTimeout(function () { d.classList.remove('live'); }, 400); } return; }
      pickEnv(ENVS[idx]); setTimeout(function () { d.classList.remove('live'); }, 700);
    });
    pl.addEventListener('click', function (e) { var b = e.target.closest('b'); if (!b) return; e.stopPropagation(); mark(ENVS.indexOf(b.dataset.k)); pickEnv(b.dataset.k); setTimeout(function () { d.classList.remove('live'); }, 400); });
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#dial')) d.classList.remove('live'); });
    S.markDial = mark;
  })();

  /* ——— environments: from black, a camera move INTO the weather ——— */
  var EV = { ps: [], cz: -46, raf: 0, t0: 0, kind: 'clear', dir: 0, audio: null };
  function rgb() { return RT.ink ? RT.ink.join(',') : '232,228,220'; }
  function seedEnv(kind) {
    var n = { rain: 720, snow: 340, fog: 46, noise: 1400 }[kind] || 0, ps = [];
    for (var i = 0; i < n; i++) { var r = 8 * Math.sqrt(Math.random()) * (.55 + .45 * Math.random()), a = Math.random() * 6.283; ps.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 1 + Math.random() * 23, s: Math.random() }); }
    EV.ps = ps;
  }
  function envFrame(dt) {
    var c = $('envC'), W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== W * dpr) { c.width = W * dpr; c.height = Hh * dpr; }
    var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, Hh);
    var F = W * .5, ink = rgb(), k = EV.kind, cz = EV.cz, moving = !still(), BO = Math.max(1, 1 + 2.4 * (-cz / 46)) * (RT.ink ? 2.4 : 1);
    for (var i = 0; i < EV.ps.length; i++) {
      var p = EV.ps[i];
      if (moving && dt) {
        if (k === 'rain') { p.y += dt * (8 + p.s * 4); } else if (k === 'snow') { p.y += dt * (.5 + p.s * .5); p.x += Math.sin((performance.now() / 1000) * (.4 + p.s * .5) + i) * dt * .25; }
        else if (k === 'fog') { p.x += dt * (.12 + p.s * .1); if (p.x > 8) p.x = -8; } else if (k === 'noise') { var rn = 8 * Math.sqrt(Math.random()), an = Math.random() * 6.283; p.x = Math.cos(an) * rn; p.y = Math.sin(an) * rn; }
        var lim = Math.sqrt(Math.max(1, 64 - p.x * p.x)); if (p.y > lim) { p.x = (Math.random() * 2 - 1) * 7; p.y = -Math.sqrt(Math.max(1, 64 - p.x * p.x)); }
      }
      var zz = p.z - cz; if (zz < .4) continue;
      var sc = F / zz, sx = W / 2 + p.x * sc, sy = Hh * .46 + p.y * sc; if (sx < -60 || sx > W + 60 || sy < -80 || sy > Hh + 80) continue;
      var near = Math.max(0, Math.min(1, 1.25 - zz / 26)), A = function (v) { return Math.min(.95, v * BO).toFixed(3); };
      if (k === 'rain') { var len = Math.max(1.5, sc * .5); x.strokeStyle = 'rgba(' + ink + ',' + A(.12 + near * .55) + ')'; x.lineWidth = Math.max(.4, Math.min(1.4, sc * .012)); x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx - len * .06, sy - len); x.stroke(); }
      else if (k === 'snow') { var r = Math.max(.5, Math.min(4.2, sc * .035)); x.fillStyle = 'rgba(' + ink + ',' + A(.14 + near * .62) + ')'; x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); }
      else if (k === 'fog') { var rr = sc * 2.8, g = x.createRadialGradient(sx, sy, 0, sx, sy, rr); g.addColorStop(0, 'rgba(' + ink + ',' + A(.04 + near * .06) + ')'); g.addColorStop(1, 'rgba(' + ink + ',0)'); x.fillStyle = g; x.fillRect(sx - rr, sy - rr, rr * 2, rr * 2); }
      else if (k === 'noise') { var a = (.05 + near * .4) * (.4 + Math.random() * .6); x.fillStyle = 'rgba(' + ink + ',' + A(a) + ')'; var q = Math.max(.6, Math.min(1.6, sc * .015)); x.fillRect(sx, sy, q, q); }
    }
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function loop(ts) {
    var dt = EV.last ? Math.min(.05, (ts - EV.last) / 1000) : 0; EV.last = ts;
    if (EV.dir) { var t = Math.min(1, (ts - EV.t0) / 2200), e = ease(t); EV.cz = EV.dir > 0 ? -46 + 46 * e : -46 * e; if (t >= 1) { var d = EV.dir; EV.dir = 0; if (d < 0) { stopEnv(); return; } } }
    envFrame(dt); if (still() && !EV.dir) { EV.raf = 0; return; } EV.raf = requestAnimationFrame(loop);
  }
  function setEnv(kind, quick) {
    if (kind === S.env) return;
    var was = S.env; S.env = kind; S.markDial && S.markDial(ENVS.indexOf(kind)); tick(12);
    var envL = $('env'), op = $('open');
    if (kind === 'clear') {   // pull back out of it
      sound(null);
      if (still() || quick) { envL.classList.remove('on'); op.style.transform = ''; op.style.opacity = ''; setTimeout(stopEnv, 520); return; }
      EV.dir = -1; EV.t0 = performance.now(); op.style.transition = 'opacity 1.6s ease .5s, transform 2.2s cubic-bezier(.6,0,.3,1)'; op.style.transform = ''; op.style.opacity = '';
      setTimeout(function () { envL.classList.remove('on'); }, 1600); if (!EV.raf) EV.raf = requestAnimationFrame(loop); return;
    }
    if (S.view !== 'open') { show('open'); renderOpen(); }
    EV.kind = kind; seedEnv(kind); $('envN').textContent = ENVNAME[kind]; $('envN').style.opacity = 1; setTimeout(function () { $('envN').style.opacity = 0; }, 2600);
    sound(kind);
    if (still()) { EV.cz = 0; EV.dir = 0; envL.classList.add('on'); op.style.opacity = 0; envFrame(0); return; }
    if (was === 'clear') { EV.cz = -46; EV.dir = 1; EV.t0 = performance.now(); } else { EV.cz = 0; }
    envL.classList.add('on'); op.style.transition = 'opacity 1.4s ease, transform 2.2s cubic-bezier(.6,0,.3,1)'; op.style.transform = 'scale(1.5)'; op.style.opacity = 0;
    if (!EV.raf) { EV.last = 0; EV.raf = requestAnimationFrame(loop); }
  }
  /* ——— white noise from the home (Gill, 8:47 PM): a forward camera glide through the icon, the environment assembling
     round you as the sound comes up, and then you are in the room (the latest oz-noise build, embedded, untouched).
     back runs the same move in reverse ——— */
  var NOISE_ROOM = '../../../t-2c28a085423adc7e2ccf5667/apps/oz-noise/';   // the one place the noise room is named: point it at the next build here
  var NZ = { on: false };
  function pickEnv(k) { if (k === 'noise') goNoise(); else setEnv(k); }
  function goNoise(el) {
    if (NZ.on) return; NZ.on = true; tick(12);
    if (S.view !== 'open') { show('open'); renderOpen(); }
    var op = $('open'), r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    op.style.transformOrigin = r ? (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px' : '50% 46%';
    pushNav('noise');
    var f = $('nzF'); setTimeout(function () { if (NZ.on) nzGo(NOISE_ROOM + '?enter=1&pair=snow' + (H.classList.contains('red') ? '&red=1' : '')); }, still() ? 0 : 650);
    if (S.env === 'noise') S.env = 'clear';
    setEnv('noise');

  }
  // load the room without adding to the phone's back history, so one back always leaves the room (v7.2)
  function nzGo(u) { var f = $('nzF'); try { f.contentWindow.location.replace(new URL(u, location.href).href); } catch (e) { f.src = u; } }
  function nzHook() {   // our bed is already playing from your tap; the room's own sound takes over at your first touch in it
    try { var d = $('nzF').contentDocument; if (!d || !d.body || d.location.href === 'about:blank') return;
      if (NZ.on) { H.classList.add('innz'); $('nz').classList.add('on'); }
      var st = d.createElement('style'); st.textContent = '#wake{opacity:0 !important}'; d.head.appendChild(st);
      d.addEventListener('click', function () { st.remove(); setTimeout(function () { if (NZ.on) sound(null); }, 300); }, { once: true, capture: true });
    } catch (e) {}
  }
  function leaveNoise() {
    if (!NZ.on) return; NZ.on = false; tick(8);
    $('nz').classList.remove('on'); H.classList.remove('innz');
    setTimeout(function () { setEnv('clear'); }, still() ? 0 : 260);
    setTimeout(function () { if (!NZ.on) nzGo('about:blank'); $('open').style.transformOrigin = ''; }, 2600);
  }
  function stopEnv() { cancelAnimationFrame(EV.raf); EV.raf = 0; EV.ps = []; var c = $('envC'); c.getContext('2d').clearRect(0, 0, c.width, c.height); $('open').style.transition = ''; }
  // the sound bed: plain noise, shaped for each one. on this phone only; it starts with your gesture
  var AC = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state !== 'running' && AC.resume) AC.resume(); return AC; }
  // iOS: wake audio on the first touchend/click, and play a silent media element so sound is allowed past the ring switch
  (function () {
    var sr = 8000, n = 800, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    var url = URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
    var el = null; function unlock() { if (AC && AC.state === 'running' && el) return; if (!el) { el = new Audio(url); var a = el; a.setAttribute('playsinline', ''); a.loop = true; a.volume = 0; try { var p = a.play(); p && p.catch && p.catch(function () {}); } catch (e) {} } var c = ac(); if (c) { var s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } }
    ['touchend', 'click', 'pointerup', 'pointerdown', 'keydown'].forEach(function (t) { document.addEventListener(t, unlock, { capture: true, passive: true }); });
  })();
  function sound(kind) {
    if (!P.sound) kind = null;
    try {
      if (EV.audio) { var old = EV.audio; old.g.gain.cancelScheduledValues(AC.currentTime); old.g.gain.setTargetAtTime(0, AC.currentTime, .5); setTimeout(function () { try { old.src.stop(); } catch (e) {} }, 2500); EV.audio = null; }
      if (!kind) return;
      if (!ac()) return;
      var len = AC.sampleRate * 3, buf = AC.createBuffer(1, len, AC.sampleRate), ch = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (kind === 'fog') { last = (last + .02 * w) / 1.02; ch[i] = last * 3.5; } else ch[i] = w; }
      var src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
      var f = AC.createBiquadFilter(), g = AC.createGain(), cfg = { rain: ['bandpass', 1500, .45, .26], snow: ['lowpass', 380, .7, .22], fog: ['lowpass', 260, .7, .32], noise: ['lowpass', 7000, .5, .07] }[kind];
      f.type = cfg[0]; f.frequency.value = cfg[1]; f.Q.value = cfg[2]; g.gain.value = 0; src.connect(f); f.connect(g); g.connect(AC.destination); src.start();
      g.gain.setTargetAtTime(cfg[3], AC.currentTime, still() ? .3 : .9); EV.audio = { src: src, g: g };
    } catch (e) {}
  }

  /* ——— the float: same brain as oz chat, lighter shape ——— */
  var FAQ = { fallback: 'I am not sure on that one.', entries: [] };
  fetch('../../js/oz-faq.json?v=1120-2156').then(function (r) { return r.json(); }).then(function (j) { FAQ = j; }).catch(function () {});
  var TUNE = [
    { k: 'red', name: 'red mode', words: 'red mode safelight night' },
    { k: 'motion', name: 'reduce motion', words: 'reduce motion still animation calm' },
    { k: 'boot', name: 'boot · save place or resume', words: 'boot resume save place start opening open' },
    { k: 'dimmer', name: 'master dimmer', words: 'dimmer dim brightness bright darker' },
    { k: 'hide', name: 'hide everything but the phone', words: 'hide quiet minimal focus phone' },
    { k: 'rooms', name: 'what each room shows', words: 'room rooms toggles features minimal settings tune' },
    { k: 'sound', name: 'weather sound', words: 'sound audio volume mute' }
  ];
  var STOP = ' what whats is are the a an how do does i it to of my me can you on in for and or this that turn ';
  function wordsOf(t) { return t.toLowerCase().replace(/[^\w\s:'-]/g, ' ').split(/\s+/).filter(function (w) { return w && STOP.indexOf(' ' + w + ' ') < 0; }); }
  function brain(t) {   // whole words only, so 'start' is never 'stars'
    var W = wordsOf(t), out = [], num = (t.match(/\b(\d{1,3})\b/) || [])[1]; if (!W.length) return out;
    function score(bank, phrases) { var s = 0, B = bank.split(' ');
      W.forEach(function (w, wi) { if (/^\d+$/.test(w)) return; B.forEach(function (b) { if (b === w) s += 3; else if (wi === W.length - 1 && w.length >= 2 && b.indexOf(w) === 0) s += 1.5; }); });
      (phrases || []).forEach(function (ph) { if (ph.indexOf(' ') > 0 && (' ' + W.join(' ') + ' ').indexOf(' ' + ph + ' ') >= 0) s += 4; }); return s; }
    Object.keys(ROOMS).forEach(function (id) { var s = score(ROOMS[id].words); if (id === 'timer' && num) s += 2; if (s) out.push({ type: 'place', id: id, s: s + .5, name: ROOMS[id].name, sub: id === 'timer' && num ? 'start ' + num + ':00' : face(id).line, set: id === 'timer' && num ? +num : 0 }); });
    Object.keys(ENVW).forEach(function (k) { var s = score(ENVW[k]); if (s) out.push({ type: 'env', id: k, s: s + .4, name: ENVNAME[k], sub: 'go into it' }); });
    TUNE.forEach(function (r) { var s = score(r.words); if (s) out.push({ type: 'tune', id: r.k, s: s, name: r.name, sub: 'tune' }); });
    FAQ.entries.forEach(function (e) { var s = score(e.q.join(' '), e.q); if (s >= 3) out.push({ type: 'faq', id: e.id, s: s - .2, name: e.q[0], sub: e.short, full: e.a }); });
    out.sort(function (a, b) { return b.s - a.s; }); return out.slice(0, 4);
  }
  function openFloat() { tick(10); unpick(); $('dock').classList.remove('open'); $('moon').classList.remove('open'); var f = $('float'); f.className = 'layer fmt-' + P.fmt; show('float'); if (P.fmt === 'stars') { var o = $('open'); o.classList.add('on'); o.style.pointerEvents = 'none'; o.style.opacity = '.14'; } var i = $('flIn'); i.value = ''; i.focus({ preventScroll: true }); flRender(''); }
  function behindOff() { var o = $('open'); o.style.pointerEvents = ''; o.style.opacity = ''; }
  function closeFloat() { $('flIn').blur(); behindOff(); show('open'); }
  function choose(it) {
    if (it.type === 'up') return openAsk($('flIn').value);
    $('flIn').blur();
    if (it.type === 'place') { if (it.set) { timer = { total: it.set * 60, end: Date.now() + it.set * 60000, label: 'set just now', paused: false }; put('timer', timer); } show('open'); open(it.id); return; }
    if (it.type === 'env') { show('open'); pickEnv(it.id); return; }
    if (it.type === 'tune') { show('open'); openSheet(it.id); return; }
    if (it.type === 'faq') return openAsk(it.name, it);
  }
  function flRender(t) {
    var items = t ? brain(t) : likely().slice(0, 3).map(function (id, i) { var f = face(id); return { type: 'place', id: id, name: f.line, sub: i ? f.sub : 'where you were' }; });
    var up = { type: 'up', name: 'ask oz ›', sub: t ? 'the full chat · “' + t + '”' : 'the full chat' };
    var L = $('flList'); L.innerHTML = '';
    if (t && !items.length) L.innerHTML = '<div class="none">nothing here by that name · ask oz below</div>';
    items.concat([up]).forEach(function (it) { var b = document.createElement('button'); if (it.type === 'up') b.className = 'up'; b.innerHTML = '<span></span><em></em>'; b.firstChild.textContent = it.name; b.lastChild.textContent = it.sub || ''; b.onclick = function () { choose(it); }; L.appendChild(b); });
    // the other shape: the answers appear as faint stars in the room itself
    var K = $('flSky'), SL = [[.30, .30], [.70, .36], [.34, .46], [.68, .53]]; K.innerHTML = '';
    items.forEach(function (it, i) { var b = document.createElement('button'); b.style.left = (it.type === 'faq' ? 50 : SL[i][0] * 100) + '%'; b.style.top = SL[i][1] * 100 + '%'; b.style.opacity = 0; b.innerHTML = '<i></i><span></span>' + (it.type === 'faq' ? '<em></em>' : ''); b.children[1].textContent = it.type === 'faq' ? '' : it.name; if (it.type === 'faq') { b.children[1].textContent = it.name; b.lastChild.textContent = it.sub; } b.querySelector('i').style.opacity = (1 - i * .2).toFixed(2); b.onclick = function () { choose(it); }; K.appendChild(b); setTimeout(function () { b.classList.add('in'); b.style.opacity = ''; }, 30 + i * (still() ? 0 : 120)); });
    var u = document.createElement('button'); u.className = 'up'; u.style.left = '50%'; u.style.top = '61%'; u.innerHTML = '<i style="opacity:.5"></i><span></span>'; u.children[1].textContent = 'ask oz ›'; u.onclick = function () { choose(up); }; K.appendChild(u); setTimeout(function () { u.classList.add('in'); }, 60);
  }
  $('flIn').addEventListener('input', function () { flRender(this.value); });
  $('flIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var t = this.value.trim(); if (!t) return closeFloat(); var r = brain(t); if (r[0] && r[0].type !== 'faq') choose(r[0]); else openAsk(t, r[0]); } });
  $('float').addEventListener('pointerdown', function (e) { if (!e.target.closest('button,input')) closeFloat(); });

  /* ——— the full Ask chat: nothing lost — chat, every place, Tune rows, room jumps, answers ——— */
  function say(cls, text) { var p = document.createElement('p'); p.className = cls; p.textContent = text; $('askLog').appendChild(p); $('askLog').scrollTop = 1e6; return p; }
  function jumps(list) { if (!list.length) return; var d = document.createElement('div'); d.className = 'jump'; list.forEach(function (it) { var b = document.createElement('button'); b.className = 'lbl'; b.textContent = (it.type === 'tune' ? 'tune · ' : '') + it.name; b.onclick = function () { choose(it); }; d.appendChild(b); }); $('askLog').appendChild(d); $('askLog').scrollTop = 1e6; }
  function reply(t) {
    var r = brain(t), faq = r.filter(function (x) { return x.type === 'faq'; })[0], rest = r.filter(function (x) { return x.type !== 'faq'; });
    setTimeout(function () {
      if (faq) say('oz', faq.full || faq.sub); else if (rest.length) say('oz', rest.length > 1 ? 'a few places for that.' : 'that one is here.'); else say('oz', FAQ.fallback || 'I am not sure on that one.');
      jumps(rest.slice(0, 3));
    }, still() ? 250 : 650);
  }
  function openAsk(t) {
    tick(10); $('flIn').blur(); show('ask'); var log = $('askLog');
    if (!log.childElementCount) say('oz', 'ask anything · every place, every tune row, and the answers are here.');
    if (t && t.trim()) { say('me', t.trim()); reply(t.trim()); }
    $('askIn').value = ''; setTimeout(function () { $('askIn').focus({ preventScroll: true }); }, 50);
  }
  function send() { var v = $('askIn').value.trim(); if (!v) return; say('me', v); $('askIn').value = ''; reply(v); }
  $('askSend').addEventListener('click', send); $('askIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  /* ——— the rooms, stripped to the one job; each feature can be switched off in tune ——— */
  var rooms = {}, roomTick = null;
  rooms.timer = function (B) {
    clearInterval(roomTick);
    var N = 60, dots = ''; for (var i = 0; i < N; i++) { var a = Math.PI * 2 * i / N - Math.PI / 2; dots += '<circle cx="' + (118 * Math.cos(a)).toFixed(1) + '" cy="' + (118 * Math.sin(a)).toFixed(1) + '" r="' + (i % 5 === 0 ? 1.8 : 1.1) + '"/>'; }
    B.className = 'r-b r-timer'; B.innerHTML = '<div class="face"><svg data-f="ring" viewBox="-130 -130 260 260">' + dots + '</svg><div class="tt" data-f="digits"></div></div><div class="r-sub" data-f="label"></div><div class="r-acts" data-f="acts"><button data-a="p" class="lbl"></button><button data-a="r" class="lbl">reset</button></div>';
    var cs = B.querySelectorAll('circle');
    function up() { var l = tLeft(), fr = l / (timer.total || 1500); B.querySelector('.tt').textContent = mmss(l); B.querySelector('.r-sub').textContent = l ? timer.label : 'done · ' + timer.label; var lit = Math.ceil(fr * N); cs.forEach(function (c, k) { c.classList.toggle('lit', k < lit); }); B.querySelector('[data-a=p]').textContent = !l ? 'again' : timer.paused ? 'go on' : 'pause'; }
    B.querySelector('[data-a=p]').onclick = function () { var l = tLeft(); if (!l) { timer.end = Date.now() + timer.total * 1000; timer.paused = false; } else if (timer.paused) { timer.end = Date.now() + timer.left * 1000; timer.paused = false; } else { timer.left = l; timer.paused = true; } put('timer', timer); tick(10); up(); };
    B.querySelector('[data-a=r]').onclick = function () { timer.paused = true; timer.left = timer.total; put('timer', timer); tick(10); up(); };
    up(); roomTick = setInterval(function () { if (S.room === 'timer') up(); }, 1000);
  };
  rooms.golden = function (B) {
    var s = sunToday(), now = s.now, fr = (now - s.rise) / (s.set - s.rise), upp = fr >= 0 && fr <= 1, a = Math.PI * (1 - Math.min(1, Math.max(0, fr)));
    var cx = 125 * Math.cos(a), cy = upp ? -110 * Math.sin(a) : 18;
    B.className = 'r-b r-gold';
    B.innerHTML = '<svg data-f="arc" viewBox="-145 -120 290 150"><path d="M-125 0 A125 110 0 0 1 125 0" stroke-dasharray="1 5"/><line x1="-145" y1="0" x2="145" y2="0"/><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (upp ? 5 : 3) + '" style="opacity:' + (upp ? 1 : .45) + '"/></svg><div class="rows" data-f="rows"></div><div class="r-sub" data-f="place">vancouver · ' + (upp ? 'sun up' : 'sun down') + '</div>';
    var rows = [['sunrise', !upp && s.nextRise > now ? s.nextRise : s.rise], ['golden', s.goldPm], ['sunset', s.set], ['blue', s.bluePm]];
    B.querySelector('.rows').innerHTML = rows.map(function (r) { return '<div><span class="lbl">' + r[0] + '</span><span>' + hm(r[1]) + '</span></div>'; }).join('');
  };
  var PLAY = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2 L14 8 L4 14 Z" fill="currentColor"/></svg>', PAUSE = '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/></svg>';
  rooms.player = function (B) {
    B.className = 'r-b r-play';
    B.innerHTML = '<div class="lbl" data-f="album" style="color:var(--meta)">lost coffee</div><div class="song" style="margin-top:12px">lost in time</div><button class="pp" data-f="play" aria-label="play">' + PLAY + '</button><svg class="wave" data-f="wave" viewBox="0 0 220 30"><path d="M0 15 C 20 4, 30 26, 50 15 S 80 2, 100 15 S 140 28, 160 15 S 200 6, 220 15"/></svg><div class="honest">prototype · no song plays here</div>';
    var pp = B.querySelector('.pp'); pp.onclick = function () { var on = B.classList.toggle('playing'); pp.innerHTML = on ? PAUSE : PLAY; tick(10); };
  };
  rooms.notes = function (B) { B.className = 'r-b r-notes'; B.innerHTML = '<textarea data-f="line" placeholder="a note"></textarea>'; var t = B.querySelector('textarea'); t.value = get('note', ''); t.oninput = function () { put('note', t.value); }; };
  function applyRoomPrefs(id) { var R = P.rooms[id] || {}; Array.prototype.forEach.call($('rB').querySelectorAll('[data-f]'), function (el) { var on = R[el.dataset.f] !== 0; if (id === 'notes' && el.dataset.f === 'line') { el.style.borderLeftColor = on ? '' : 'transparent'; return; } el.style.display = on ? '' : 'none'; }); }

  /* ——— the sky: still there, reached on purpose (dock → the sky) ——— */
  var CON = { timer: { s: [[0,-60],[42,-43],[60,0],[42,43],[0,60],[-42,43],[-60,0],[-42,-43],[0,0],[0,-34],[22,8]], l: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[8,9],[8,10]] },
    golden: { s: [[-70,30],[-52,-6],[-24,-30],[8,-38],[38,-26],[60,0],[72,30]], l: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
    player: { s: [[-66,-10],[-44,-34],[-24,4],[-4,-38],[16,2],[36,-30],[58,6]], l: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
    box: { s: [[-46,-40],[40,-40],[46,38],[-46,38],[-20,-10],[18,8]], l: [[0,1],[1,2],[2,3],[4,5]] } };
  var KS = [['archive', '2,659 frames', .3, .3, null, 'box'], ['golden', '', .7, .42, 'golden', 'golden'], ['timer', '', .27, .55, 'timer', 'timer'], ['loops', 'record a loop', .7, .62, null, 'player'], ['player', 'lost coffee · 5 songs', .3, .74, 'player', 'player']];
  function drawSky() {
    var c = $('skyC'), W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1); c.width = W * dpr; c.height = Hh * dpr; var x = c.getContext('2d'); x.scale(dpr, dpr);
    var red = H.classList.contains('red'), ink = rgb(), g = x.createLinearGradient(0, 0, 0, Hh);
    if (red) { g.addColorStop(0, '#060304'); g.addColorStop(.75, '#1a0609'); g.addColorStop(1, '#060304'); } else { g.addColorStop(0, '#03050b'); g.addColorStop(.75, '#0a1624'); g.addColorStop(1, '#03050b'); } x.fillStyle = g; x.fillRect(0, 0, W, Hh);
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    x.fillStyle = red ? '#060304' : '#02040a'; x.beginPath(); x.moveTo(0, Hh); x.lineTo(0, Hh * .86); var tx = 0; while (tx < W) { var th = 6 + ((tx * 37) % 19) + ((tx % 97) < 12 ? 26 : 0); x.lineTo(tx, Hh * .86 - th * .25); x.lineTo(tx + 5, Hh * .86 - th); x.lineTo(tx + 10, Hh * .86 - th * .25); tx += 10 + ((tx * 13) % 9); } x.lineTo(W, Hh * .86); x.lineTo(W, Hh); x.fill();
    var K = $('skyK'); K.innerHTML = '';
    KS.forEach(function (k) {
      var cx = k[2] * W, cy = k[3] * Hh, con = CON[k[5]], sc = .42;
      x.strokeStyle = 'rgba(' + ink + ',.35)'; x.lineWidth = .6; con.l.forEach(function (p) { var a = con.s[p[0]], b = con.s[p[1]]; x.beginPath(); x.moveTo(cx + a[0] * sc, cy + a[1] * sc); x.lineTo(cx + b[0] * sc, cy + b[1] * sc); x.stroke(); });
      x.fillStyle = 'rgba(' + ink + ',.9)'; con.s.forEach(function (p) { x.beginPath(); x.arc(cx + p[0] * sc, cy + p[1] * sc, 1.2, 0, 7); x.fill(); });
      var b = document.createElement('button'); b.className = 'k'; b.style.left = cx + 'px'; b.style.top = (cy + 36) + 'px';
      var nm = ROOMS[k[0]] ? ROOMS[k[0]].name : k[0]; b.innerHTML = '<span class="lbl"></span><small></small>'; b.firstChild.textContent = nm; b.lastChild.textContent = k[1] || face(k[0]).line;
      b.onclick = function () { if (k[4]) open(k[4], 'sky'); else toast(nm + ' · not in this prototype'); }; K.appendChild(b);
    });
  }
  addEventListener('resize', function () { if (S.view === 'sky') drawSky(); });

  /* ——— tune: switch every piece on and off, live; saved on this phone ——— */
  var OPEN_ROWS0 = [['moon', 'the moon', 'pure, free-moving'], ['ozcon', 'the oz constellation', 'the boot forms it · the corner chimes'], ['stars', 'your constellation', 'what you were doing · what fits now'], ['dock', 'the dock', 'a hairline tick at the bottom edge'], ['dimmer', 'the dimmer', 'a hairline on the left edge · red mode'], ['dial', 'the weather dial', 'right edge · the one dial that opens with you'], ['hide', 'the hide dot', 'where the Mark was'], ['corner', 'the oz corner', 'tap to go back']];
  var OPEN_ROWS = [['essentials', 'essentials', 'one switch · only what matters'], ['dial', 'the camera dial', 'right edge · touch, turn, lift · double-tap home'], ['moon', 'the moon dial', 'floats free · the light around you · hold, slide, let go'], ['ozcon', 'the oz constellation', 'the boot forms it · the corner chimes'], ['dimmer', 'the dimmer', 'a hairline on the left edge'], ['corner', 'the oz corner', 'always home']];
  var ROOM_F = { timer: [['ring', 'ring'], ['digits', 'time'], ['label', 'what it is for'], ['acts', 'pause · reset']], golden: [['arc', 'sun arc'], ['rows', 'times'], ['place', 'place']], player: [['album', 'album'], ['wave', 'line'], ['play', 'play']], notes: [['line', 'margin line']] };
  function sw(on) { return '<i class="sw' + (on ? ' on' : '') + '"></i>'; }
  function seg(key, opts) { return '<div class="seg" data-seg="' + key + '">' + opts.map(function (o) { return '<button data-v="' + o[0] + '" class="' + (P[key] === o[0] ? 'cur' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function buildSheet() {
    var h = '<h4 data-row="hide">opening · after the dot</h4>';
    OPEN_ROWS.forEach(function (r) { h += '<div class="rw" data-t="' + r[0] + '"><div>' + r[1] + '<small>' + r[2] + '</small></div>' + sw(P[r[0]]) + '</div>'; });
    if (0) h += '<div class="rw" data-t="keepOne"><div>keep the one thing when hidden<small>off: the hide dot hides everything</small></div>' + sw(P.keepOne) + '</div>';
    h += '<h4>depth</h4>';
    h += '<div class="rw" data-t="parallax"><div>depth movement<small>small, slow · still with Reduce Motion</small></div>' + sw(P.parallax) + '</div>';
    h += '<div class="rw" data-t="panels"><div>soft panels<small>dark opaque layers · off by default</small></div>' + sw(P.panels) + '</div>';
    h += '<h4 data-row="red">red mode · text</h4><div class="rw"><div>look<small>each one has its own saved values</small></div>' + seg('rt', [['red', 'refined red'], ['cream', 'dim cream'], ['amber', 'warm amber']]) + '</div>';
    var v = P.rtv[P.rt];
    [['h', 'hue', 0, 360, 1], ['l', 'brightness', 8, 65, 1], ['s', 'saturation', 0, 100, 1], ['g', 'glow', 0, 12, .5], ['w', 'weight', 0, .6, .05]].forEach(function (r) {
      h += '<label class="slider"><span>' + r[1] + '</span><input type="range" data-rt="' + r[0] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + v[r[0]] + '"><output>' + v[r[0]] + '</output></label>';
    });
    h += '<div class="txsample">the quiet between things<small>timer · 18:40 left</small></div><button class="copy lbl" data-act="copy">copy values</button><pre class="values" id="txValues"></pre>';
    h += '<h4>highlight</h4><div class="rw"><div>highlight<small>the place in front on the dial</small></div>' + seg('hl', [['gold', 'cream-gold'], ['coral', 'coral'], ['rose', 'rose'], ['white', 'white']]) + '</div>';
    h += '<h4>search float</h4><div class="rw"><div>shape<small>same brain as oz chat · ask oz › is always there</small></div>' + seg('fmt', [['bar', 'hairline bar'], ['stars', 'stars in the room']]) + '</div>';
    h += '<h4 data-row="rooms">rooms · how little can each one be</h4>';
    Object.keys(ROOM_F).forEach(function (id) { h += '<div class="rw" style="border:0;min-height:30px"><div>' + ROOMS[id].name + '</div></div><div class="chips">' + ROOM_F[id].map(function (f) { return '<button data-room="' + id + '" data-f="' + f[0] + '" class="' + (P.rooms[id][f[0]] !== 0 ? 'on' : '') + '">' + f[1] + '</button>'; }).join('') + '</div>'; });
    h += '<h4 data-row="motion">motion</h4><div class="rw"><div>reduce motion</div>' + seg('motion', [['auto', 'auto'], ['still', 'on'], ['full', 'off']]) + '</div>';
    h += '<h4 data-row="sound">weather</h4><div class="rw" data-t="sound"><div>sound<small>a quiet bed of noise for each one</small></div>' + sw(P.sound) + '</div>';
    h += '<h4 data-row="boot">boot</h4><div class="rw" data-act="replay"><div>see the boot again</div><span class="lbl" style="color:var(--mid)">replay</span></div>';
    h += '<div class="rw" data-act="reset"><div>back to how it opens first<small>clears this prototype on this phone</small></div><span class="lbl" style="color:var(--mid)">reset</span></div>';
    h += '<p class="fine">the dimmer, red mode and the dot work as in oz · two fingers held still opens this · pinch out rises a level, pinch in goes deeper · what you use comes forward, what you don\'t fades</p>';
    $('shB').innerHTML = h;
  }
  function openSheet(row) { buildSheet(); $('sheet').classList.add('on'); tick(8); if (row) { var r = $('shB').querySelector('[data-row="' + row + '"]') || $('shB').querySelector('[data-t="' + row + '"]'); if (r) setTimeout(function () { r.scrollIntoView({ block: 'start' }); }, 60); if (row === 'red') toast('red mode is the dot · one tap'); } }
  $('tuneBtn').addEventListener('click', function () { openSheet(); });
  $('shB').addEventListener('click', function (e) {
    var t = e.target.closest('[data-t]'), sg = e.target.closest('.seg button'), ch = e.target.closest('.chips button'), act = e.target.closest('[data-act]');
    if (sg) { var key = sg.parentNode.dataset.seg; P[key] = sg.dataset.v; save(); applyMotion(); applyRT(); buildSheet(); if (S.view === 'open') renderOpen(); return; }
    if (ch) { var R = P.rooms[ch.dataset.room]; R[ch.dataset.f] = R[ch.dataset.f] === 0 ? 1 : 0; save(); buildSheet(); toast(ROOMS[ch.dataset.room].name + ' · ' + (R[ch.dataset.f] ? 'shown' : 'hidden')); return; }
    if (t) { P[t.dataset.t] = P[t.dataset.t] ? 0 : 1; save(); buildSheet(); if (S.view === 'open') renderOpen(); if (t.dataset.t === 'sound' && !P.sound) sound(null); return; }
    if (act && act.dataset.act === 'replay') { $('sheet').classList.remove('on'); runBoot(true); }
    if (act && act.dataset.act === 'copy') { var txt = JSON.stringify({ look: P.rt, values: P.rtv[P.rt], looks: P.rtv }, null, 2); $('txValues').textContent = txt; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast('values copied'); }, function () { toast('values shown below'); }); else toast('values shown below'); }
    if (act && act.dataset.act === 'reset') { var u2 = new URL(location.href); u2.searchParams.set('fresh', '1'); u2.searchParams.delete('boot'); location.href = u2.toString(); }
  });
  $('shB').addEventListener('input', function (e) { var el = e.target; if (!el.dataset.rt) return; P.rtv[P.rt][el.dataset.rt] = +el.value; el.nextElementSibling.textContent = el.value; save(); applyRT(); if (S.view === 'open') drawGrid(); });
  (function () { var sh = $('sheet'), sy = null; sh.querySelector('.grab').addEventListener('pointerdown', function (e) { sy = e.clientY; }); addEventListener('pointerup', function (e) { if (sy != null && e.clientY - sy > 40) sh.classList.remove('on'); sy = null; }); })();
  document.addEventListener('pointerdown', function (e) { if ($('sheet').classList.contains('on') && !e.target.closest('#sheet')) { $('sheet').classList.remove('on'); } }, true);

  /* ═══════════ v7 (Gill, 20 Nov, 11:07–11:11 PM): distinctly oz. at rest almost nothing — the time, one quiet line, the dot.
     what you need appears when you reach for it and leaves when you let go. the camera dial on the right edge is the way
     to every place (touch, turn, lift); the Moon dial floats and holds the light around you. you are never lost: the oz
     corner is always home, the room's name is always at the top, every move is one continuous camera move, and every move
     undoes with one gesture back. what you use surfaces; what you don't fades. Essentials turns everything else off. ═══════════ */
  var V7 = { use: get('use', null) };
  if (!V7.use) { V7.use = { timer: { n: 6, t: Date.now() }, golden: { n: 5, t: Date.now() }, player: { n: 3, t: Date.now() }, noise: { n: 2, t: Date.now() }, notes: { n: 1, t: Date.now() - 6 * 864e5 } }; put('use', V7.use); }
  function used(id) { var u = V7.use[id] || { n: 0, t: 0 }; u.n++; u.t = Date.now(); V7.use[id] = u; put('use', V7.use); }
  function score(id) { var u = V7.use[id]; if (!u) return 0; var days = (Date.now() - u.t) / 864e5; return u.n * Math.pow(.5, days / 7); }   // a week's half-life: what you stop using fades
  function places() { var L = ['timer', 'golden', 'player', 'noise', 'notes'].sort(function (a, b) { return score(b) - score(a); }); if (P.essentials) L = L.slice(0, 3); return L; }
  function fadeOf(id) { var L = places(), top = score(L[0]) || 1; return Math.max(.42, Math.min(1, .42 + .58 * score(id) / top)); }
  function applyEss() { H.classList.toggle('ess', !!P.essentials); }
  applyEss();
  var NAME = function (id) { return id === 'golden' ? 'good weather' : (ROOMS[id] ? ROOMS[id].name : id); };

  /* awake: controls come when you touch and leave after a few quiet seconds */
  function wake() { H.classList.add('awake'); clearTimeout(wake.k); wake.k = setTimeout(function () { if (!V7.holding) H.classList.remove('awake'); }, 3200); }
  ['pointerdown', 'pointermove', 'keydown'].forEach(function (t) { addEventListener(t, function (e) { if (t === 'pointermove' && e.pointerType === 'touch' && !e.buttons) return; wake(); }, { passive: true, capture: true }); });

  /* the rest: the time at the bottom (bottom = time) and one quiet line of what matters now */
  function quiet() {
    if (tLeft()) return { id: 'timer', t: 'timer · ' + mmss(tLeft()) + (timer.paused ? ' paused' : ' left') };
    var f = face('golden'); return { id: 'golden', t: f.line };
  }
  function renderRest() {
    var r = $('rest'); if (!r) return; var d = new Date();
    r.querySelector('.t').textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, '');
    var q = quiet(), b = r.querySelector('.q'); b.dataset.id = q.id; b.querySelector('span').textContent = q.t;
  }
  $('rest').querySelector('.q').addEventListener('click', function (e) { e.stopPropagation(); var b = this, r = b.getBoundingClientRect(); S.camO = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px'; open(b.dataset.id, null, b); });
  setInterval(function () { if (S.view === 'open') renderRest(); }, 1000);

  /* the star sky: faint stars at depth, slowly drifting and breathing; still with Reduce Motion */
  var SKY0 = { st: [], raf: 0, last: 0 };
  (function seed() { var s = 11; function rn() { s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < 150; i++) SKY0.st.push({ x: rn(), y: rn() * .92, z: .25 + rn() * .75, p: rn() * 6.28, w: .4 + rn() * .9 }); })();
  function sky0(ts) {
    var c = $('sky0'), W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(Hh * dpr); }
    var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, Hh);
    var t = (ts || 0) / 1000, ink = rgb(), ST = still(), k = RT.ink ? 1.5 : 1;
    SKY0.st.forEach(function (s) {
      var dx = ST ? 0 : (t * 1.6 * s.z) % W, px = (s.x * W + dx - DEPTH.px * 9 * s.z + W) % W, py = s.y * Hh - DEPTH.py * 6 * s.z;
      var a = (.08 + .36 * s.z * s.z) * (ST ? 1 : .72 + .28 * Math.sin(t * s.w + s.p)) * k;
      x.fillStyle = 'rgba(' + ink + ',' + Math.min(.6, a).toFixed(3) + ')'; x.beginPath(); x.arc(px, py, .35 + .75 * s.z, 0, 6.283); x.fill();
    });
  }
  function skyLoop(ts) { SKY0.raf = 0; if (S.view === 'open' || S.view === 'room') sky0(ts); if (!still()) SKY0.raf = requestAnimationFrame(skyLoop); }
  function skyKick() { if (!SKY0.raf) SKY0.raf = requestAnimationFrame(skyLoop); }
  skyKick(); addEventListener('resize', function () { sky0(performance.now()); });

  /* ——— the camera dial (dial A): the right edge. touch it and a small labelled constellation of your places unfolds
     on a 3D wheel under your finger; turn it, lift to go. tap leaves it open; tap the sky to let it go; double-tap is home.
     the front star is always where you are now. its inner ring holds the settings: tune and Essentials ——— */
  var CD = { open: false, k: 0, kt: 0, items: [], cy: 0, raf: 0, r: 0, mode: null };
  function cdItems() { var here = S.view === 'room' ? S.room : (S.view === 'sky' ? 'sky' : 'here'), L = places().filter(function (x) { return x !== here; }); var ring = [here], i = 0; while (i < L.length) { ring.push(L[i++]); } ring.push('sky' === here ? null : 'sky'); return ring.filter(Boolean); }
  // nearest go on either side of where you are: rank 1 above, rank 2 below, …
  function cdOrder(ring) { var here = ring[0], rest = ring.slice(1), up = [], dn = []; rest.forEach(function (id, i) { (i % 2 ? dn : up).push(id); }); return [here].concat(up, dn.reverse()); }
  function cdBuild(y) {
    var o = $('camO'); CD.items = cdOrder(cdItems()); CD.n = CD.items.length; CD.step = 2 * Math.PI / CD.n;
    CD.cy = Math.max(innerHeight * .26, Math.min(innerHeight * .74, y)); CD.k = CD.kt = 0;
    var h = '<svg class="ln" aria-hidden="true"></svg><b class="hub" aria-hidden="true"></b>';
    o.innerHTML = h;
    CD.items.forEach(function (id, i) {
      var b = document.createElement('button'); b.className = 'cst' + (i === 0 ? ' here' : ''); b.dataset.i = i; b.dataset.id = id;
      var lb = i === 0 ? (id === 'here' ? 'here' : NAME(id) + ' · here') : NAME(id);
      b.setAttribute('aria-label', i === 0 ? 'stay here' : 'go to ' + lb); b.innerHTML = '<span></span><i></i>'; b.firstChild.textContent = lb;
      b.style.setProperty('--u', i === 0 || id === 'sky' ? 1 : fadeOf(id).toFixed(2));
      o.appendChild(b);
    });
    [['tune', 'tune'], ['ess', P.essentials ? 'essentials · on' : 'essentials']].forEach(function (s, j) {
      var b = document.createElement('button'); b.className = 'cin'; b.dataset.s = s[0]; b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = s[1]; o.appendChild(b);
    });
  }
  function cdLay() {
    var o = $('camO'), W = innerWidth, hx0 = W - 30, R = CD.r, ln = [], ST = still();
    var hub = o.querySelector('.hub'); if (!hub) return; hub.style.left = hx0 + 'px'; hub.style.top = CD.cy + 'px';
    var front = ((Math.round(CD.k) % CD.n) + CD.n) % CD.n;
    Array.prototype.forEach.call(o.querySelectorAll('.cst'), function (b, i) {
      var th = (i - CD.k) * CD.step, z = Math.cos(th), y = CD.cy - R * Math.sin(th) * .92, x = hx0 - 22 - R * .86 * Math.max(0, z) - 6 * z;
      var vis = z > -.15 ? Math.min(1, (z + .15) / .55) : 0, sc = .62 + .38 * Math.max(0, z);
      b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px'; b.style.opacity = (vis * (i === front ? 1 : .78)).toFixed(3);
      b.style.transform = 'translate(-100%,-50%) scale(' + sc.toFixed(3) + ')'; b.style.zIndex = Math.round(10 + z * 10);
      b.style.pointerEvents = vis > .4 && CD.mode === 'stay' ? 'auto' : 'none';
      b.classList.toggle('front', i === front); b._x = x; b._y = y; b._v = vis;
      if (vis > .05) ln.push([x, y, vis, i]);
    });
    // hairlines: neighbours on the wheel, and the front back to the hub
    ln.sort(function (a, b) { return a[1] - b[1]; });
    var s = ''; for (var j = 1; j < ln.length; j++) s += '<line x1="' + ln[j - 1][0].toFixed(1) + '" y1="' + ln[j - 1][1].toFixed(1) + '" x2="' + ln[j][0].toFixed(1) + '" y2="' + ln[j][1].toFixed(1) + '" style="opacity:' + (.32 * Math.min(ln[j - 1][2], ln[j][2])).toFixed(3) + '"/>';
    var f = o.querySelector('.cst.front'); if (f) s += '<line x1="' + f._x.toFixed(1) + '" y1="' + f._y.toFixed(1) + '" x2="' + (hx0 - 4) + '" y2="' + CD.cy + '" style="opacity:.22"/>';
    var arc = R > 4 ? '<path d="M' + (hx0 + 6) + ' ' + (CD.cy - R * .92) + ' A ' + (R * .86 + 10) + ' ' + (R * .92) + ' 0 0 0 ' + (hx0 + 6) + ' ' + (CD.cy + R * .92) + '" class="rim"/>' : '';
    o.querySelector('svg.ln').innerHTML = arc + s;
    Array.prototype.forEach.call(o.querySelectorAll('.cin'), function (b, j) { b.style.left = (hx0 - 6) + 'px'; b.style.top = (CD.cy + (j ? 1 : -1) * (R * .92 + 34)) + 'px'; b.style.opacity = CD.mode === 'stay' ? Math.min(1, R / 110) : 0; b.style.pointerEvents = CD.mode === 'stay' ? 'auto' : 'none'; });
    if (front !== CD.front) { if (CD.front != null) tick(4); CD.front = front; }
  }
  function cdFrame() {
    CD.raf = 0; var ST = still(), done = true;
    var R1 = CD.open ? 112 : 0; if (ST) CD.r = R1; else { CD.r += (R1 - CD.r) * .3; if (Math.abs(R1 - CD.r) > .5) done = false; else CD.r = R1; }
    if (CD.mode !== 'drag') { if (ST) CD.k = CD.kt; else { CD.k += (CD.kt - CD.k) * .26; if (Math.abs(CD.kt - CD.k) > .002) done = false; else CD.k = CD.kt; } }
    cdLay();
    if (!CD.open && CD.r < 1) { $('camO').classList.remove('on'); H.classList.remove('reach'); setTimeout(function () { if (!CD.open) $('camO').innerHTML = ''; }, 300); return; }
    if (!done || CD.mode === 'drag') CD.raf = requestAnimationFrame(cdFrame);
  }
  function cdKick() { if (!CD.raf) CD.raf = requestAnimationFrame(cdFrame); }
  function cdOpen(y, mode) { CD.open = true; CD.mode = mode; CD.front = null; cdBuild(y); $('camO').classList.add('on'); H.classList.add('reach'); if (still()) CD.r = 112; else CD.r = 26; tick(6); cdKick(); hintDone(); clearTimeout(CD.q); }
  function cdClose() { if (!CD.open) return; CD.open = false; CD.mode = null; clearTimeout(CD.q); cdKick(); }
  function cdQuiet() { clearTimeout(CD.q); CD.q = setTimeout(cdClose, 4200); }
  function cdGo(i, el) {
    var id = CD.items[i]; var b = $('camO').querySelector('.cst[data-i="' + i + '"]');
    if (b) S.camO = b._x.toFixed(0) + 'px ' + b._y.toFixed(0) + 'px';
    cdClose(); if (i === 0 || !id || id === 'here') { S.camO = null; return; }
    if (S.view === 'room' && S.room === id) return;
    open(id, null, b);
  }
  (function () {
    var z = $('cam'), sx, sy, t0, moved, k0, lastTap = 0, down = false;
    z.addEventListener('pointerdown', function (e) { if (!P.dial || $('boot').style.display !== 'none') return; e.stopPropagation(); e.preventDefault(); down = true; V7.holding = true; sx = e.clientX; sy = e.clientY; t0 = performance.now(); moved = false;
      try { z.setPointerCapture(e.pointerId); } catch (x) {}
      if (CD.open && CD.mode === 'stay') { CD.mode = 'drag'; k0 = CD.k; clearTimeout(CD.q); return; }
      cdOpen(e.clientY, 'drag'); k0 = 0; });
    z.addEventListener('pointermove', function (e) { if (!down) return; var dy = e.clientY - sy, dx = e.clientX - sx; if (Math.hypot(dx, dy) > 8) moved = true; if (CD.mode === 'drag') { CD.k = CD.kt = k0 - dy / 52; cdKick(); } });
    function up(e) { if (!down) return; down = false; V7.holding = false; var now = performance.now(), dx = e.clientX - sx;
      if (!moved && now - t0 < 320) {   // a tap: double = home; single = leave it open
        if (now - lastTap < 340) { lastTap = 0; cdClose(); home(); return; }
        lastTap = now; CD.mode = 'stay'; CD.kt = Math.round(CD.k); cdKick(); cdQuiet(); return; }
      var hit = null; if (dx < -40) Array.prototype.forEach.call($('camO').querySelectorAll('.cst'), function (b) { if (b._v > .4 && Math.hypot(b._x - 20 - e.clientX, b._y - e.clientY) < 46) hit = +b.dataset.i; });
      var f = ((Math.round(CD.k) % CD.n) + CD.n) % CD.n; CD.kt = Math.round(CD.k); CD.mode = 'stay';
      if (!moved) { cdQuiet(); cdKick(); return; }   // a hold that didn't turn: it stays, ready
      cdGo(hit != null ? hit : f);
    }
    z.addEventListener('pointerup', up); z.addEventListener('pointercancel', function () { down = false; V7.holding = false; if (CD.mode === 'drag') { CD.mode = 'stay'; CD.kt = Math.round(CD.k); cdKick(); cdQuiet(); } });
    $('camO').addEventListener('click', function (e) { var b = e.target.closest('.cst'), c = e.target.closest('.cin'); e.stopPropagation();
      if (c) { cdClose(); if (c.dataset.s === 'tune') openSheet(); else { P.essentials = P.essentials ? 0 : 1; save(); applyEss(); toast(P.essentials ? 'essentials · only what matters' : 'essentials off · everything back'); if (S.view === 'open') renderOpen(); } return; }
      if (b) { tick(10); var i = +b.dataset.i; if (i !== CD.front) { CD.kt = i; } cdGo(i); } });
    document.addEventListener('pointerdown', function (e) { if (CD.open && CD.mode === 'stay' && !e.target.closest('#camO .cst, #camO .cin, #cam')) cdClose(); }, true);
  })();

  /* ——— the Moon dial: the crescent floats free; it holds the light around you (weather and how bright), which nothing else
     does. hold it and its 3D orbit opens under the same finger; slide onto a star and let go. tap = it opens and stays.
     drag = it moves, snaps to an edge and remembers. a few quiet seconds and it folds and shrinks back ——— */
  var MO = { open: false, phi: 0, raf: 0, r: 0 };
  var MENV = ['clear', 'rain', 'snow', 'fog', 'noise'], MLIGHT = [['bright', 0], ['dim', .38], ['dimmer', .66]];
  function moC() { var m = $('moon').getBoundingClientRect(); return [m.left + m.width / 2, m.top + m.height / 2]; }
  function moBuild() {
    var o = $('moonO'); o.innerHTML = '<svg class="ln" aria-hidden="true"></svg>';
    MENV.forEach(function (k, i) { var b = document.createElement('button'); b.className = 'mst' + (S.env === k ? ' cur' : ''); b.dataset.k = k; b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = ENVNAME[k]; o.appendChild(b); });
    MLIGHT.forEach(function (l) { var b = document.createElement('button'); b.className = 'mst in'; b.dataset.l = l[1]; b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = l[0]; o.appendChild(b); });
  }
  function moLay() {
    if (!$('moonO').querySelector('svg.ln')) return;
    var o = $('moonO'), c = moC(), R = MO.r, W = innerWidth, Hh = innerHeight, side = c[0] > W / 2 ? -1 : 1, dn = c[1] > Hh / 2 ? -1 : 1, s = '', pts = [];
    // a tilted ring beside the moon, seen in depth: the near side larger and brighter
    var ox = Math.max(112, Math.min(W - 112, c[0] + side * R * .95)), oy = c[1] + dn * (R * .62 + 18), k = Math.min(1, R / 90), back = MO.back ? .3 : 1;
    Array.prototype.forEach.call(o.querySelectorAll('.mst:not(.in)'), function (b, i) {
      var a = MO.phi + i * (2 * Math.PI / MENV.length) + Math.PI / 2, z = Math.sin(a), x = ox + R * Math.cos(a), y = oy + R * .46 * z;
      var vis = .5 + .5 * (z + 1) / 2, sc = .8 + .2 * (z + 1) / 2;
      b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px'; b.style.opacity = (vis * k * back).toFixed(3); b.style.transform = 'translate(-50%,-50%) scale(' + sc.toFixed(3) + ')'; b.style.zIndex = Math.round(10 + z * 5);
      b._x = x; b._y = y; pts.push([x, y]); b.style.pointerEvents = MO.open ? 'auto' : 'none';
    });
    for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; }
    if (pts.length) s += '<line x1="' + c[0].toFixed(1) + '" y1="' + c[1].toFixed(1) + '" x2="' + pts[0][0].toFixed(1) + '" y2="' + pts[0][1].toFixed(1) + '" style="opacity:.12"/>';
    Array.prototype.forEach.call(o.querySelectorAll('.mst.in'), function (b, j) { var x = ox + (j - 1) * 64 * k, y = oy + dn * (R * .46 + 52);
      b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px'; b.style.opacity = (k * back * .9).toFixed(3); b.style.transform = 'translate(-50%,-50%)'; b._x = x; b._y = y; b.style.pointerEvents = MO.open ? 'auto' : 'none';
      b.classList.toggle('cur', Math.abs((+get('dim', 0)) - (+b.dataset.l)) < .1); });
    o.querySelector('svg.ln').innerHTML = s;
  }
  function moFrame() { MO.raf = 0; var R1 = MO.open ? 104 : 0, ST = still(); if (ST) MO.r = R1; else MO.r += (R1 - MO.r) * .28; if (Math.abs(R1 - MO.r) < .5) MO.r = R1; moLay();
    if (!MO.open && MO.r < 1) { $('moonO').classList.remove('on'); $('moon').classList.remove('orb'); return; } if (MO.r !== R1 || MO.spin) MO.raf = requestAnimationFrame(moFrame); }
  function moKick() { if (!MO.raf) MO.raf = requestAnimationFrame(moFrame); }
  function moOpen() { MO.open = true; MO.back = false; moBuild(); $('moonO').classList.add('on'); $('moon').classList.add('orb'); if (!still()) MO.r = 20; tick(8); moKick(); clearTimeout(MO.q); }
  function moClose() { MO.open = false; clearTimeout(MO.q); moKick(); }
  function moQuiet() { clearTimeout(MO.q); MO.q = setTimeout(moClose, 4500); }
  function moPick(b) {
    if (!b) return; tick(10);
    if (b.dataset.l != null) { var v = +b.dataset.l; $('dimveil').style.opacity = (v * .78).toFixed(3); put('dim', v); moLay(); moQuiet(); return; }
    var k = b.dataset.k; MO.back = true; moLay();   // it steps back so you can see the sky it changes
    if (k === 'noise') { moClose(); goNoise(b); return; }
    setEnv(k); setTimeout(moClose, still() ? 600 : 1500);
  }
  (function () {
    var m = $('moon'), sx, sy, ox, oy, down = false, drag = false, held = false, hold = null, t0;
    function nearest(x, y) { var best = null, bd = 40; Array.prototype.forEach.call($('moonO').querySelectorAll('.mst'), function (b) { var d = Math.hypot(b._x - x, b._y - y); if (d < bd) { bd = d; best = b; } }); return best; }
    m.addEventListener('pointerdown', function (e) { e.stopPropagation(); down = true; drag = false; held = false; sx = e.clientX; sy = e.clientY; t0 = performance.now(); var c = moC(); ox = c[0]; oy = c[1]; try { m.setPointerCapture(e.pointerId); } catch (x) {}
      hold = setTimeout(function () { if (down && !drag) { held = true; moOpen(); } }, 380); });
    m.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx, dy = e.clientY - sy;
      if (held) { var b = nearest(e.clientX, e.clientY); Array.prototype.forEach.call($('moonO').querySelectorAll('.mst'), function (x) { x.classList.toggle('hov', x === b); }); return; }
      if (!drag && Math.hypot(dx, dy) > 8) { drag = true; clearTimeout(hold); moClose(); }
      if (drag) { var x = Math.min(innerWidth - 40, Math.max(40, ox + dx)), y = Math.min(innerHeight - 120, Math.max(90, oy + dy)); m.style.left = x + 'px'; m.style.top = y + 'px'; } });
    m.addEventListener('pointerup', function (e) { e.stopPropagation(); if (!down) return; down = false; clearTimeout(hold);
      if (held) { var b = nearest(e.clientX, e.clientY); if (b) moPick(b); else moQuiet(); return; }
      if (drag) { var c = moC(), x = c[0] < innerWidth / 2 ? 58 : innerWidth - 76, y = Math.min(innerHeight * .8, Math.max(innerHeight * .12, c[1])); m.style.transition = still() ? '' : 'left .4s cubic-bezier(.2,.7,.2,1), top .4s cubic-bezier(.2,.7,.2,1), opacity .7s ease, transform .7s ease'; m.style.left = x + 'px'; m.style.top = y + 'px'; put('moonpos', [x / innerWidth, y / innerHeight]); setTimeout(function () { m.style.transition = ''; }, 450); return; }
      if (MO.open) moClose(); else { moOpen(); moQuiet(); } });
    $('moonO').addEventListener('click', function (e) { var b = e.target.closest('.mst'); e.stopPropagation(); if (b) moPick(b); });
    document.addEventListener('pointerdown', function (e) { if (MO.open && !e.target.closest('#moon, #moonO')) moClose(); }, true);
  })();

  /* ——— camera: every move is one continuous move. deeper = through the star you chose; back = the same move reversed.
     Reduce Motion = a cross-fade, never a cut ——— */
  var LV = { sky: 0, open: 1, room: 2 }, CAMS = [];
  var show0 = show;
  show = function (id) {
    var from = S.view, a = $(from), b = $(id);
    if (!a || !b || from === id || !(from in LV) || !(id in LV) || still()) { S.camO = null; return show0(id); }
    var deeper = LV[id] > LV[from] || (S.swap && LV[id] === LV[from]), o;
    if (deeper) { o = S.camO || '50% 48%'; CAMS.push(o); } else o = CAMS.pop() || '50% 48%';
    S.camO = null; S.swap = false;
    b.style.transition = 'none'; b.style.transformOrigin = o; b.style.transform = deeper ? 'scale(.78)' : 'scale(1.42)'; void b.offsetWidth; b.style.transition = '';
    a.style.transformOrigin = o; a.style.transform = deeper ? 'scale(1.42)' : 'scale(.78)';
    show0(id);
    requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.transform = ''; }); });
    clearTimeout(a._ct); a._ct = setTimeout(function () { if (!a.classList.contains('on')) { a.style.transform = ''; a.style.transformOrigin = ''; } }, 1000);
  };

  /* ——— one gesture back for every move: the system back (edge swipe), the left-edge flick, Escape, the corner ——— */
  S.nav = [];
  function pushNav(k) { try { if (S.replaceNext) history.replaceState({ oz: k }, ''); else history.pushState({ oz: k }, ''); } catch (e) {} if (!S.replaceNext) S.nav.push(k); else S.nav[S.nav.length - 1] = k; S.replaceNext = false; }
  function goBack() { if (S.nav.length) history.back(); else back(); }
  function homeNow() { $('sheet').classList.remove('on'); cdClose(); moClose(); if (S.view === 'float' || S.view === 'ask') { $('flIn').blur(); behindOff(); S.room = null; S.stack = []; show0('open'); renderOpen(); return; } if (NZ.on) { leaveNoise(); return; } if (S.view !== 'open') { CAMS = CAMS.slice(0, 1); S.stack = []; goHome(); } else if (S.env !== 'clear') setEnv('clear'); }
  function home() { tick(10); if (S.nav.length) { S.toHome = true; var n = S.nav.length; history.go(-n); } else homeNow(); }
  addEventListener('popstate', function () {
    S.popping = true;
    try { if (S.toHome) { S.toHome = false; S.nav = []; homeNow(); } else { S.nav.pop(); if (NZ.on) leaveNoise(); else back(); } } finally { S.popping = false; }
    if (S.after) { var f = S.after; S.after = null; setTimeout(f, 20); }
  });
  var open0 = open;
  open = function (id, from, el) {
    used(id); cdClose(); moClose();
    if (el && el.getBoundingClientRect && !S.camO) { var r = el.getBoundingClientRect(); S.camO = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px'; }
    if (id === 'noise') { goNoise(el); return; }
    var was = S.view; open0(id, from, el);
    if (S.view !== was || S.view === 'room') pushNav(id);
  };
  var openFloat0 = openFloat;
  openFloat = function () {
    if (S.view === 'float') return; S.under = (S.view === 'room' || S.view === 'sky') ? S.view : 'open'; cdClose(); moClose();
    openFloat0(); pushNav('float');
    if (S.under !== 'open') { var o0 = $('open'); o0.classList.remove('on'); o0.style.opacity = ''; o0.style.pointerEvents = ''; }
    var u = $(S.under); u.classList.add('on'); u.style.pointerEvents = 'none'; u.style.opacity = '.1';   // search floats over where you are
  };
  behindOff = function () { ['open', 'room', 'sky'].forEach(function (k) { var u = $(k); u.style.pointerEvents = ''; if (k !== 'open' || S.env === 'clear') u.style.opacity = ''; }); };
  var closeFloat0 = function () { $('flIn').blur(); behindOff(); show0(S.under || 'open'); if ((S.under || 'open') === 'open') renderOpen(); S.under = null; };
  closeFloat = function () { if (!S.popping && S.nav[S.nav.length - 1] === 'float') { history.back(); return; } closeFloat0(); };
  var choose0 = choose;
  choose = function (it) {
    if (it.type === 'up' || it.type === 'faq' || S.popping || S.nav[S.nav.length - 1] !== 'float') return choose0(it);
    S.after = function () { if (S.view === 'room' && it.type === 'place') { if (it.set) { timer = { total: it.set * 60, end: Date.now() + it.set * 60000, label: 'set just now', paused: false }; put('timer', timer); } open(it.id); } else choose0(it); };
    $('flIn').blur(); history.back();   // the float closes as one step back, then you go
  };
  // pull down over a room: search floats over the room
  (function () {
    var rm = $('room'), sy = null;
    rm.addEventListener('pointerdown', function (e) { if (e.target.closest('button,input,textarea,svg')) return; sy = e.clientY; });
    rm.addEventListener('pointerup', function (e) { if (sy != null && e.clientY - sy > 90) openFloat(); sy = null; });
  })();

  /* ——— pinch: out rises a level, in goes deeper (Ground rules) ——— */
  (function () {
    var d0 = 0, pinched = false;
    function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
    document.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { d0 = dist(e.touches); pinched = false; } }, { passive: true });
    document.addEventListener('touchmove', function (e) { if (e.touches.length !== 2 || !d0 || pinched) return; var r = dist(e.touches) / d0;
      if (r > 1.35) { pinched = true; rise(); } else if (r < .72) { pinched = true; deeper(); } }, { passive: true });
    document.addEventListener('touchend', function () { d0 = 0; }, { passive: true });
  })();
  function rise() { tick(8); if (S.view === 'room' || NZ.on || S.view === 'float') goBack(); else if (S.view === 'open') open('sky'); }
  function deeper() { tick(8); if (S.view === 'sky') goBack(); else if (S.view === 'open') { var q = quiet(); open(q.id, null, $('rest').querySelector('.q')); } }
  V7.rise = rise; V7.deeper = deeper; V7.home = home; V7.goBack = goBack;

  /* ——— the first-use teaching line: once, on the home sky only ——— */
  function hintDone() { if (!get('hinted', false)) { put('hinted', true); } $('hint').classList.remove('on'); }
  function hintMaybe() { if (get('hinted', false) || S.view !== 'open') return; var h = $('hint'); h.classList.add('on'); setTimeout(function () { h.classList.remove('on'); }, 9000); }

  /* ——— F3: the one bright star lights only while something is leaving this phone. it watches oz's own requests ——— */
  var F3 = { n: 0, what: [] };
  function f3(on, what) { F3.n = Math.max(0, F3.n + (on ? 1 : -1)); if (on) F3.what.push(what); else F3.what.shift(); H.classList.toggle('f3', F3.n > 0); }
  function offPhone(u) { try { var x = new URL(u, location.href); return x.origin !== location.origin; } catch (e) { return false; } }
  if (window.fetch) { var f0 = window.fetch; window.fetch = function (u) { var url = typeof u === 'string' ? u : (u && u.url) || ''; if (!offPhone(url)) return f0.apply(this, arguments); f3(true, url); return f0.apply(this, arguments).finally(function () { f3(false); }); }; }
  (function () { var o = XMLHttpRequest.prototype.open, s = XMLHttpRequest.prototype.send; XMLHttpRequest.prototype.open = function (m, u) { this._oz = offPhone(u) ? u : null; return o.apply(this, arguments); }; XMLHttpRequest.prototype.send = function () { var x = this; if (x._oz) { f3(true, x._oz); x.addEventListener('loadend', function () { f3(false); }, { once: true }); } return s.apply(this, arguments); }; })();
  V7.f3 = F3;
  window.__oz = V7;
  /* room to room (from the dial): through, never a cut; back returns to the room you came from */
  function roomFill(id) { S.room = id; put('last', id); $('rT').textContent = ROOMS[id].name; rooms[id]($('rB')); applyRoomPrefs(id); }
  function roomSwap(id) {
    var rm = $('room'), ST = still(), o = S.camO || '50% 50%'; S.camO = null;
    rm.style.transition = 'opacity .26s ease' + (ST ? '' : ', transform .26s ease'); rm.style.transformOrigin = o; rm.style.opacity = '0'; if (!ST) rm.style.transform = 'scale(1.2)';
    setTimeout(function () { roomFill(id); rm.style.transition = 'none'; if (!ST) rm.style.transform = 'scale(.86)'; void rm.offsetWidth; rm.style.transition = ''; rm.style.opacity = ''; rm.style.transform = ''; }, 270);
  }
  function backToRoom(id) { if (S.view === 'room') roomSwap(id); else { roomFill(id); show('room'); } }
  var open1 = open;
  open = function (id, from, el) {
    if (S.view === 'room' && id !== 'sky' && id !== 'noise' && ROOMS[id]) { used(id); cdClose(); if (el && el.getBoundingClientRect && !S.camO) { var r = el.getBoundingClientRect(); S.camO = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px'; } tick(12); S.stack.push('room:' + S.room); roomSwap(id); pushNav(id); return; }
    var was = S.view, pr = S.room; open1(id, from, el);
    if (id === 'sky' && was === 'room') S.stack[S.stack.length - 1] = 'room:' + pr;
  };
  var renderOpen0 = renderOpen;
  renderOpen = function () { renderOpen0(); applyEss(); $('cam').classList.toggle('off', !P.dial); $('moon').classList.toggle('off', !P.moon); renderRest(); sky0(performance.now()); skyKick(); };

  /* ——— the corner constellation (what the boot settles into) ——— */
  var N = 21, KEY = [0, 4, 8, 10, 12, 16, 20];
  function archPt(i) { var a = Math.PI * (1.13 - 1.26 * i / (N - 1)); return [34 * Math.cos(a), -34 * Math.sin(a) + 12]; }
  function conPath() { var d = KEY.map(function (i, k) { var p = archPt(i); return (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '); var m = archPt(10); return d + ' M' + m[0].toFixed(1) + ' ' + m[1].toFixed(1) + ' L0 24'; }
  (function () { var s = $('corner').querySelector('svg'), h = '<path d="' + conPath() + '"/>'; KEY.forEach(function (i) { var p = archPt(i); h += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6"/>'; }); h += '<circle cx="0" cy="24" r="3.4"/>'; s.innerHTML = h;
    Array.prototype.forEach.call(s.querySelectorAll('circle'), function (c, k) { c._f = k < 7 ? NOTES[k] : LOW; }); })();

  /* ——— the oz constellation chimes (Gill, 8:14 PM: "touch it like the sound chimes"). pentatonic, quiet, on this phone ——— */
  function chime(f) {
    var c = ac(); if (!c || c.state !== 'running') return;
    var t = c.currentTime, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.055, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + 1.9);
    [[1, 1], [2.76, .22], [5.4, .06]].forEach(function (p) { var o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = f * p[0]; og.gain.value = p[1]; o.connect(og); og.connect(g); o.start(t); o.stop(t + 2); });
    g.connect(lp); lp.connect(c.destination);
  }
  function ring(el) { el.classList.remove('ring'); void el.getBoundingClientRect(); el.classList.add('ring'); clearTimeout(el._r); el._r = setTimeout(function () { el.classList.remove('ring'); }, 900); }
  function chimeable(host, circles, onHold, onTap) {   // touch a star to ring it; drag across for a run; hold (still) for the host's own job
    var last = null, hold = null, sx, sy, down = false, t0 = 0, mv = false;
    function hit(x, y) { var best = null, bd = 1e9; circles().forEach(function (c) { var r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); if (d < bd) { bd = d; best = c; } }); return bd < 22 ? best : null; }
    function play(c) { if (!c || c === last) return; last = c; ring(c); chime(c._f); tick(4); }
    host.addEventListener('pointerdown', function (e) { if (e.target.closest('.oz')) return; down = true; sx = e.clientX; sy = e.clientY; last = null; t0 = performance.now(); mv = false; host.classList.add('touch'); try { host.setPointerCapture(e.pointerId); } catch (x) {} setTimeout(function () { play(hit(e.clientX, e.clientY)); }, 40); if (onHold) hold = setTimeout(function () { if (down) { onHold(); down = false; host.classList.remove('touch'); } }, 650); });
    host.addEventListener('pointermove', function (e) { if (!down) return; if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) { clearTimeout(hold); mv = true; } play(hit(e.clientX, e.clientY)); });
    function up() { if (down && !mv && onTap && performance.now() - t0 < 360) onTap(); down = false; clearTimeout(hold); last = null; setTimeout(function () { host.classList.remove('touch'); }, 500); }
    host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
  }
  (function () { var cn = $('corner'); cn.querySelector('.oz').addEventListener('click', function (e) { e.stopPropagation(); home(); });
    chimeable(cn, function () { return P.ozcon ? Array.prototype.slice.call(cn.querySelectorAll('svg circle')) : []; },
      function () { tick(14); runBoot(true); },                                                    // hold: the boot again
      function () { if (S.view !== 'open' || NZ.on || S.env !== 'clear') home(); }); })();   // tap: home, from anywhere   // tap: the dock (home) or back

  // status: only real information. battery appears only where the browser exposes its level; no invented percentage
  if (navigator.getBattery) navigator.getBattery().then(function (b) { function paint() { var e = $('status').querySelector('.battery'); e.hidden = false; e.querySelector('i').style.width = Math.round(b.level * 100) + '%'; e.setAttribute('aria-label', 'battery ' + Math.round(b.level * 100) + '%' + (b.charging ? ', charging' : '')); } paint(); b.addEventListener('levelchange', paint); b.addEventListener('chargingchange', paint); }).catch(function () {});
  $('nzF').addEventListener('load', nzHook);

  /* ——— boot (v7): black. "I am.", the handset and the mint dot. then the places of your sky form as a small constellation
     and settle to the right edge, where the camera dial keeps them, while the time comes up at the bottom. the oz corner
     never moves; it only lights where it lives. ~1.3 s. Reduce Motion: the same, as fades ——— */
  var boot = $('boot');
  function runBoot(replay) {
    var cn = $('corner'), cs = Array.prototype.slice.call(cn.querySelectorAll('svg circle')), ST = still(), T = [], bs = $('bootSky');
    var at = function (ms, f) { T.push(setTimeout(f, ms)); };
    cdClose(); moClose();
    if (replay) { if (NZ.on) history.back(); if (S.view !== 'open') homeNow(); boot.style.display = ''; boot.classList.remove('gone', 'lit'); void boot.offsetWidth; }
    else goHome();
    H.classList.add('booting'); H.classList.remove('awake');
    cn.classList.add('on', 'booting'); cn.classList.remove('formed', 'drawn'); cs.forEach(function (c) { c.classList.remove('lit'); });
    // the constellation: one star per place, round "I am.", joined in the order the dial keeps them
    var W = innerWidth, Hh = innerHeight, L = cdOrder(cdItems()), n = L.length, cx = W / 2, cy = Hh * .44, tx = W - 30, ty = Hh * .51, pts = [];
    L.forEach(function (id, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n + .35, r = 84 + (i % 2) * 18; pts.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * .9]); });
    var s = '<svg>'; pts.forEach(function (p, i) { var q = pts[(i + 1) % n]; s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; }); s += '</svg>';
    pts.forEach(function (p, i) { s += '<b style="left:' + p[0].toFixed(1) + 'px;top:' + p[1].toFixed(1) + 'px;--d:' + i + ';--tx:' + (tx - p[0]).toFixed(1) + 'px;--ty:' + (ty - p[1]).toFixed(1) + 'px"></b>'; });
    bs.className = ''; bs.innerHTML = s; bs.style.display = ''; void bs.offsetWidth;
    at(30, function () { boot.classList.add('lit'); });
    at(260, function () { bs.classList.add('form'); });
    if (P.ozcon) cs.forEach(function (c, k) { at(300 + k * 36, function () { c.classList.add('lit'); }); });
    at(420, function () { cn.classList.add('drawn'); });
    at(760, function () { boot.classList.add('gone'); bs.classList.add('settle'); H.classList.remove('booting'); cn.classList.add('formed'); });
    at(1320, done);
    function done() { boot.style.display = 'none'; bs.style.display = 'none'; bs.innerHTML = ''; cn.classList.remove('booting'); cn.classList.add('formed', 'drawn'); cs.forEach(function (c) { c.classList.remove('lit'); }); H.classList.remove('booting'); renderRest(); hintMaybe(); V7.booted = performance.now(); }
  }
  ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(function (t) { boot.addEventListener(t, function (e) { e.preventDefault(); e.stopPropagation(); }, { passive: false }); });
  if (Q.get('boot') === '0') { boot.style.display = 'none'; $('bootSky').style.display = 'none'; $('corner').classList.add('on', 'formed', 'drawn'); goHome(); hintMaybe(); }
  else runBoot(false);
})();
