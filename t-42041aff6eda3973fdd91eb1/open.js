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
  var DEF = { ozcon: 1, moon: 1, stars: 1, dock: 1, dimmer: 1, dial: 1, hide: 1, corner: 1, fmt: 'bar', motion: 'auto', sound: 1, keepOne: 0, essentials: 0, bootStyle: 'oz', bootLen: 'longer', dialHome: 'moon', topBar: 1, barTime: 0, homeLine: 1, dock2: 'swipe', makeWay: 1, places: 'edge', fadeS: '3', moonRest: 'small', quietLine: 1, dockStyle: 'icons', hl: 'gold', centre: 'blend', rt: 'amber', parallax: 1, panels: 0, clockFont: 'poppins', dockLabels: 1, iconStyle: 'oz',
    rooms: { timer: { ring: 1, digits: 1, label: 1, acts: 1 }, golden: { arc: 1, rows: 1, place: 1 }, player: { album: 1, wave: 1, play: 1 }, notes: { line: 1 } } };
  var P = get('prefs', null) || JSON.parse(JSON.stringify(DEF));
  if (!P.bootLen) P.bootLen = 'longer';
  if (!P.dialHome) P.dialHome = 'moon';   // the home dial from anywhere: double-tap the moon (Gill, Nov 22)   // start-up length (Gill, Nov 22): a little longer by default
  Object.keys(DEF).forEach(function (k) { if (P[k] == null) P[k] = JSON.parse(JSON.stringify(DEF[k])); });
  if (!P.v5) { P.dockStyle = 'icons'; P.centre = P.centre || 'blend'; P.v5 = 1; }   // v5: the icon constellation is the dock now
  if (!P.v51) { P.rt = 'red'; if (P.rtv) delete P.rtv.red; P.v51 = 1; }   // v5.1: refined red is the red-mode text (Gill's pick)
  if (!P.v7) { P.moon = 1; P.stars = 0; P.dock = 0; P.hide = 0; P.dial = 1; P.dimmer = 1; P.centre = 'oz'; P.keepOne = 0; P.essentials = P.essentials || 0; P.v7 = 1; put('quiet', false); }   // v7: at rest, almost nothing
  if (!P.v73) { P.rt = 'amber'; P.rtv = {}; P.v73 = 1; save(); }   // v7.3: Gill's tuned looks (21 Nov, 7:24 AM) replace any saved looks once; amber is the default
  if (!P.v75) P.v75 = 1;   // v7.6: v7.5's reset no longer touches looks or other choices
  if (!P.v76) { Object.assign(P, { bootStyle: 'oz', topBar: 1, barTime: 0, homeLine: 1, dock2: 'arc', places: 'edge', fadeS: '3', moonRest: 'small', quietLine: 1, makeWay: 1 }); P.v76 = 1; save(); }   // my picks for the opening, once; looks and everything else stay yours
  if (!P.v77) { if (P.dock2 === 'arc') P.dock2 = 'swipe'; P.v77 = 1; save(); }   // h1e: swipe up is the default for the dock; an explicit off / with dial / stars pick stays
  if (!P.v80) { if (!P.iconStyle) P.iconStyle = 'oz'; if (!P.dockSlots) P.dockSlots = ['messages', 'archive', 'timer', 'loops', 'golden']; P.v80 = 1; save(); }
  if (!P.iconStyle) P.iconStyle = 'oz';
  var RTF = { rose: { h: 351, s: 50, l: 58, g: 3, w: 0.1 }, fullred: { h: 0, s: 100, l: 42, g: 3, w: 0.1 } };   // h1: rose and Full red, fixed (the look sliders tune red)
  var RTD = { cream: { h: 40, s: 12, l: 48, g: 5, w: 0.1 }, amber: { h: 28, s: 51, l: 50, g: 2, w: 0 }, red: { h: 354, s: 75, l: 47, g: 4, w: 0.1 } };
  P.rtv = P.rtv || {}; Object.keys(RTD).forEach(function (k) { P.rtv[k] = Object.assign({}, RTD[k], P.rtv[k] || {}); });
  if (Q.get('f') === 'bar' || Q.get('f') === 'stars') P.fmt = Q.get('f');
  if (Q.get('motion')) P.motion = Q.get('motion');
  function save() { put('prefs', P); }
  /* h1: the Home Screen moves the same with Reduce Motion on (the acceptance list). Every move here is already a fade or one
     slow continuous camera move, never a bounce or a slide under a finger. "reduce motion: on" in settings still makes it still. */
  function still() { return P.motion === 'still'; }
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
    var v = FAM === 'rose' ? RTF.rose : FAM === 'fullred' ? RTF.fullred : (P.rtv[P.rt] || RTD.cream), L = function (m) { return hx(hsl2rgb(v.h, v.s, Math.min(96, v.l * m))); }, c = hsl2rgb(v.h, v.s, v.l);
    st.setProperty('--ink', L(1)); st.setProperty('--here', L(1.12)); st.setProperty('--near', L(1)); st.setProperty('--mid', L(.8)); st.setProperty('--far', L(.46));
    st.setProperty('--dim', L(.9)); st.setProperty('--meta', L(.62)); st.setProperty('--hair', 'rgba(' + c.join(',') + ',.22)'); st.setProperty('--moon', L(1.05)); st.setProperty('--dk', L(1));
    st.setProperty('--tglow', v.g ? '0 0 ' + v.g + 'px rgba(' + c.join(',') + ',.55)' : 'none'); st.setProperty('--tw', (v.w || 0) + 'px');
    RT.ink = c; if (typeof applyHL === 'function') applyHL();
  }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(function () { el.classList.remove('on'); }, 2200); }

  /* ——— modes (h1): night · red · rose · light · Full red — the app's own five, kept in the app's own store, so one tap on
     the dot here is the same tap everywhere. Red mode is the default: every start opens in red unless the app says
     otherwise (its own rule), and ?fresh=1 is always red. The dot only toggles red; the quick sheet picks any of the five ——— */
  var AKEY = 'gj-safelight-02', FAMS = [['night', 'night'], ['red', 'red'], ['rose', 'rose'], ['light', 'light'], ['fullred', 'full red']], FAM = 'red', ACH = null;
  function aGet() { try { return JSON.parse(localStorage.getItem(AKEY)); } catch (e) { return null; } }
  function aSet(patch) {   // merge into the app's store the way the app does: rev says who is newer
    /* only ever a whole state: the app adopts what it is sent wholesale, so a part of one would break an open app.
       until the app has saved its store once, the mode stays here (and the app opens in red anyway: its own rule) */
    var s = aGet(); if (!s || typeof s !== 'object' || !('timer' in s)) return false; Object.keys(patch).forEach(function (k) { s[k] = patch[k]; }); s.rev = (+s.rev || 0) + 1;
    try { localStorage.setItem(AKEY, JSON.stringify(s)); } catch (e) {} try { ACH && ACH.postMessage(s); } catch (e) {}
    return true;
  }
  function famOf(s) { return s.fullSafe && s.red ? 'fullred' : s.dayMode ? 'light' : s.red ? (s.tone === 1 ? 'rose' : 'red') : 'night'; }
  function famLoad() { if (Q.has('fresh')) return 'red'; var saved = get('fam', null); if (saved && FAMS.some(function (x) { return x[0] === saved; })) return saved; var s = aGet(); if (!s) return 'red'; if (s.openRed !== false) s.red = true; return famOf(s); }
  function applyFam(f) {
    FAM = f; ['red', 'rose', 'light', 'fullred'].forEach(function (k) { H.classList.toggle(k, k === 'red' ? (f === 'red' || f === 'rose' || f === 'fullred') : f === k); });
    $('disc').setAttribute('aria-pressed', String(H.classList.contains('red')));
    var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = f === 'light' ? '#F3EEE6' : '#000000';
    if (typeof applyRT === 'function') applyRT(); if (typeof S !== 'undefined' && S.view === 'sky') drawSky(); if (SKY0) { sky0(); if (S.view === 'open') drawGrid(); }
    if ($('qs') && $('qs').classList.contains('on')) buildQS();
    put('fam', f);
  }
  function setFam(f) {   // the app's setFamily, exactly
    var s = aGet() || {}, o = f === 'night' ? { red: false, dayMode: false, fullSafe: false } : f === 'red' ? { red: true, dayMode: false, fullSafe: false, tone: s.tone === 1 ? 2 : (s.tone == null ? 2 : s.tone) } : f === 'rose' ? { red: true, dayMode: false, fullSafe: false, tone: 1 } : f === 'light' ? { red: false, dayMode: true, fullSafe: false } : { red: true, dayMode: false, fullSafe: true };
    aSet(o); applyFam(f); tick(8);
  }
  function dotTap() { var s = aGet() || {}, on = H.classList.contains('red'); if (on) aSet({ red: false }); else aSet({ red: true, dayMode: false }); s = aGet(); applyFam(on ? 'night' : famOf(Object.assign({}, s, { red: true, dayMode: false }))); tick(8); }
  try { ACH = new BroadcastChannel(AKEY); ACH.onmessage = function (m) { if (m.data) applyFam(famOf(m.data)); }; } catch (e) {}
  addEventListener('storage', function (e) { if (e.key === AKEY && e.newValue) { try { applyFam(famOf(JSON.parse(e.newValue))); } catch (x) {} } });
  var famSkipClick = false;
  function famPointer(fn) { fn(); famSkipClick = true; setTimeout(function () { famSkipClick = false; }, 400); }
  function famClick(fn) { if (famSkipClick) return; fn(); }
  (function () {
    var d = $('disc');
    d.addEventListener('pointerdown', function (e) { d._sx = e.clientX; d._sy = e.clientY; });
    d.addEventListener('pointerup', function (e) { if (e.button) return; if (Math.hypot(e.clientX - (d._sx || e.clientX), e.clientY - (d._sy || e.clientY)) > 12) return; famPointer(dotTap); });
    d.addEventListener('click', function () { famClick(dotTap); });
  })();

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
    sky: { name: 'the sky', words: 'sky everything map wander all rooms home places' },
    // in the app (Nov 22): the rooms already built in oz itself, opened from here and back to here when you leave them
    messages: { name: 'messages', words: 'messages message chat text talk send', ext: 'tool' },
    loops: { name: 'loops', words: 'loops loop record layer music beat', ext: 'room' },
    archive: { name: 'archive', words: 'archive frames photos pictures shots images reel', ext: 'room' },
    friends: { name: 'friends', words: 'friends people circle contacts', ext: 'tool' },
    tonecheck: { name: 'tone check', words: 'tone check voice tune pitch sing', ext: 'room' },
    planner: { name: 'shot planner', words: 'shot planner plan shoot schedule location', ext: 'tool' },
    lab: { name: 'photo lab', words: 'photo lab shelf loupe develop edit', ext: 'tool' },
    picks: { name: 'picks board', words: 'picks board selects favourites best', ext: 'tool' },
    decide: { name: 'decision sheet', words: 'decision sheet decide choose question', ext: 'tool' },
    sweep: { name: 'compare', words: 'compare sweep side by side', ext: 'tool' },
    feed: { name: 'feed', words: 'feed cards latest new', ext: 'room' },
    objects: { name: 'objects', words: 'objects trees things 3d', ext: 'tool' },
    demos: { name: 'demo room', words: 'demo room demos songs tracks mix', ext: 'tool' },
    mindex: { name: 'index a clip', words: 'index clip video chapters', ext: 'tool' },
    shrink: { name: 'shrink a clip', words: 'shrink clip screen recording smaller compress', ext: 'tool' },
    oztune: { name: 'oz icon', words: 'oz icon tune mark logo', ext: 'tool' },
    balance: { name: 'balance', words: 'balance level horizon', ext: 'tool' },
    welcome: { name: 'welcome', words: 'welcome start intro', ext: 'tool' },
    about: { name: 'about', words: 'about profile gill', ext: 'tool' }
  };
  var OZX = Object.keys(ROOMS).filter(function (k) { return ROOMS[k].ext; });   // every room that lives in oz itself
  // Rooms on the dial (Gill, 22 Nov): each place can be switched off in Tune → Rooms.
  // Ready only hides unfinished stubs. Essentials then keeps 3 of what is still on. The dial, the swipe-up places,
  // the stars dock, and search/jump lists only show that set. Nothing is deleted; Tune → Rooms turns one back on.
  // Loved ones and other owner-only rooms are never in this list, and never in a public build.
  var STUB = { oztune: 1, mindex: 1 };   // withheld / unfinished: off by default, hidden in Ready only
  var PREVIEW = { oztune: 1, mindex: 1, messages: 1, player: 1 };   // a small preview mark when visible
  if (!P.v78) {
    P.roomMode = P.roomMode || 'ready';
    P.roomOn = P.roomOn || {};
    Object.keys(ROOMS).forEach(function (id) { if (P.roomOn[id] == null) P.roomOn[id] = STUB[id] ? 0 : 1; });
    P.v78 = 1; save();
  }
  if (!P.roomOn) P.roomOn = {};
  if (!P.roomMode) P.roomMode = 'ready';
  function isStub(id) { return !!STUB[id]; }
  function isPreview(id) { return !!PREVIEW[id]; }
  function roomOn(id) { return P.roomOn[id] !== 0; }
  function roomShown(id) {
    if (!roomOn(id)) return false;
    if ((P.roomMode || 'ready') === 'ready' && isStub(id)) return false;
    return true;
  }
  function roomOrder() {
    var first = ['messages', 'archive', 'loops', 'timer', 'golden', 'player', 'noise', 'notes'];
    return first.concat(OZX.filter(function (x) { return first.indexOf(x) < 0; }), ['sky']);
  }
  function markPreview(host, id) {
    if (!host || !isPreview(id)) return;
    var em = document.createElement('em'); em.className = 'pv'; em.textContent = 'preview'; host.appendChild(em);
  }
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
    if (ROOMS[id] && ROOMS[id].ext) return { line: ROOMS[id].name, sub: ROOMS[id].name };
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
    if (CD.open) { cdClose(); return true; }
    if (S.view === 'ask') { tick(6); show('float'); $('flIn').focus({ preventScroll: true }); return true; }
    if (S.view === 'float') { closeFloat(); return true; }
    if (NZ.on) { history.back(); return true; }
    if (S.env !== 'clear' && S.view === 'open') { setEnv('clear'); return true; }
    if (S.view === 'room' || S.view === 'sky') { tick(6); var p = S.stack.pop(); if (p === 'sky') { S.room = null; show('sky'); drawSky(); } else if (p && p.indexOf('room:') === 0) backToRoom(p.slice(5)); else goHome(); return true; }
    if ($('moon').classList.contains('open')) { $('moon').classList.remove('open'); return true; }
    if (H.classList.contains('dockopen')) { if (dockHeld() && window.__ozDock && window.__ozDock.onBack) { window.__ozDock.onBack(); return true; } dockClose(); return true; }
    if ($('dock').classList.contains('open')) { $('dock').classList.remove('open'); return true; }
    if (S.pick) { unpick(); return true; }
    return false;
  }
  
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') V7.goBack(); });
  function open(id, from, el) {
    if (id === 'noise') { goNoise(el); return; }
    if (ROOMS[id] && ROOMS[id].ext) { goOz(id); return; }
    tick(12); $('moon').classList.remove('open'); $('dock').classList.remove('open'); dockClose(); unpick();
    if (S.env !== 'clear') setEnv('clear', true);
    if (id === 'sky') { S.stack.push(S.view === 'sky' ? 'sky' : 'home'); show('sky'); drawSky(); return; }
    S.stack.push(from === 'sky' ? 'sky' : 'home'); S.room = id; put('last', id); if (DOCK.indexOf(id) >= 0) put('recent', [id].concat(get('recent', []).filter(function (x) { return x !== id; })));
    $('rT').textContent = ROOMS[id].name; if (isPreview(id)) markPreview($('rT'), id); rooms[id]($('rB')); applyRoomPrefs(id); show('room');
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
      b.setAttribute('aria-label', ROOMS[id].name); b.dataset.id = id; b.innerHTML = (o.icons ? '<b class="ic">' + glyph(id) + '</b>' : '<i></i>') + '<span></span>'; b.lastChild.textContent = ROOMS[id].name; if (o.alpha) b.style.setProperty('--a', o.alpha[i]);
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); b.addEventListener('pointerup', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); pickOr(b, function () { tick(10); onPick(id, b); }); }); host.appendChild(b); });
  }
  var DOCK = ['timer', 'golden', 'player', 'noise', 'notes'].concat(OZX, ['sky']);
  // a room that lives in oz itself: go there, and oz brings you back home when you leave it (core/app.js, home=1)
  function goOz(id) { tick(12); used(id); put('recent', [id].concat(get('recent', []).filter(function (x) { return x !== id; })));
    var u = '../oz/index.html?' + (ROOMS[id].ext === 'tool' ? 'tool=' : 'room=') + id + '&home=1&boot=0&red=' + (H.classList.contains('red') ? 1 : 0) + '&md=' + (P.dialHome === 'off' ? 0 : 1);
    document.body.style.transition = 'opacity .22s ease'; document.body.style.opacity = '0';   // one app: home fades, the room fades in
    setTimeout(function () { location.href = u; }, 200); }
  var ICON = {   // one 24 grid, one 1.25 stroke, round joins; circles drawn a touch smaller so every glyph weighs the same
    timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.4" r="7.1"/><path d="M12 9.6v3.8l2.5 1.5M9.9 3.7h4.2M12 3.7v2.6"/></svg>',
    golden: '<svg viewBox="0 0 24 24"><path d="M3.2 16.2h17.6M7.3 16.2a4.7 4.7 0 0 1 9.4 0M12 6.9v2M6.7 9.4l1.3 1.3M17.3 9.4l-1.3 1.3M8.4 19.4h7.2"/></svg>',
    player: '<svg viewBox="0 0 24 24"><path d="M9.6 7.3v9.4c0 .5.5.8.9.5l7-4.7c.4-.3.4-.8 0-1.1l-7-4.6c-.4-.3-.9 0-.9.5z"/></svg>',
    noise: '<svg viewBox="0 0 24 24"><path d="M3.6 12h1.6M7.4 9.4v5.2M10.4 6.4v11.2M13.6 8.2v7.6M16.6 10.2v3.6M19.2 12h1.2"/></svg>',
    notes: '<svg viewBox="0 0 24 24"><path d="M6.6 4.4h7.6l3.2 3.2v12H6.6z"/><path d="M14.2 4.4v3.2h3.2M9.4 11.4h5.2M9.4 14.4h5.2M9.4 17.2h3"/></svg>',
    sky: '<svg viewBox="0 0 24 24"><path d="M14.4 5a7.2 7.2 0 1 0 4.8 12 6 6 0 0 1-4.8-12z"/><path d="M5.6 6.4h.01M8.4 3.9h.01" class="pt"/></svg>',
    messages: '<svg viewBox="0 0 24 24"><path d="M5.2 6h13.6c.7 0 1.2.5 1.2 1.2v7.6c0 .7-.5 1.2-1.2 1.2H10l-4 3.2V16h-.8c-.7 0-1.2-.5-1.2-1.2V7.2C4 6.5 4.5 6 5.2 6z"/></svg>',
    loops: '<svg viewBox="0 0 24 24"><path d="M12 12c-2-2.6-3.4-3.8-5.2-3.8a3.8 3.8 0 0 0 0 7.6c1.8 0 3.2-1.2 5.2-3.8zm0 0c2 2.6 3.4 3.8 5.2 3.8a3.8 3.8 0 0 0 0-7.6c-1.8 0-3.2 1.2-5.2 3.8z"/></svg>',
    archive: '<svg viewBox="0 0 24 24"><path d="M4.4 7.2h15.2v11.4H4.4zM6.4 4.6h11.2"/><path d="M4.4 15.2l4.2-3.8 3.4 3 2.6-2.2 5 3.6"/></svg>',
    friends: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.1"/><circle cx="16.2" cy="10" r="2.5"/><path d="M3.8 18.6c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6M14.6 14.4c2.6-.4 4.8.9 5.6 3.8"/></svg>',
    tonecheck: '<svg viewBox="0 0 24 24"><path d="M3.6 12c1.4 0 1.4-4 2.8-4s1.4 8 2.8 8 1.4-10 2.8-10 1.4 12 2.8 12 1.4-8 2.8-8 1.4 2 2.8 2"/></svg>',
    planner: '<svg viewBox="0 0 24 24"><path d="M4.6 6.4h14.8v12.8H4.6zM4.6 10h14.8M8.4 4.2v4M15.6 4.2v4"/><circle cx="12" cy="14.6" r="1.9"/></svg>',
    lab: '<svg viewBox="0 0 24 24"><circle cx="10.6" cy="10.6" r="5.4"/><path d="M14.6 14.6l5 5M8.4 10.6a2.2 2.2 0 0 1 2.2-2.2"/></svg>',
    picks: '<svg viewBox="0 0 24 24"><path d="M4.4 5.4h6.4v6.4H4.4zM13.2 5.4h6.4v6.4h-6.4zM4.4 14.2h6.4v4.4H4.4z"/><path d="M14.2 16.4l1.8 1.8 3.4-3.6"/></svg>',
    decide: '<svg viewBox="0 0 24 24"><path d="M12 19.6v-7.2M12 12.4L6.6 6.6M12 12.4l5.4-5.8M4.6 8.2V5.2h3M19.4 8.2V5.2h-3"/></svg>',
    sweep: '<svg viewBox="0 0 24 24"><path d="M3.8 6h7v12h-7zM13.2 6h7v12h-7zM12 3.6v16.8"/></svg>',
    feed: '<svg viewBox="0 0 24 24"><path d="M5.4 4.6h13.2v6H5.4zM5.4 13.4h13.2v6H5.4z"/></svg>',
    objects: '<svg viewBox="0 0 24 24"><path d="M12 3.8l7.2 4.1v8.2L12 20.2l-7.2-4.1V7.9zM4.8 7.9L12 12l7.2-4.1M12 12v8.2"/></svg>',
    demos: '<svg viewBox="0 0 24 24"><path d="M9.4 17.4V6.2l9-1.8v11.2"/><circle cx="7.2" cy="17.4" r="2.2"/><circle cx="16.2" cy="15.6" r="2.2"/></svg>',
    mindex: '<svg viewBox="0 0 24 24"><path d="M4.4 6.2h15.2v11.6H4.4zM4.4 14.6h15.2M8 14.6v3.2M12 14.6v3.2M16 14.6v3.2"/><path d="M10.6 8.4v3.6l3-1.8z"/></svg>',
    shrink: '<svg viewBox="0 0 24 24"><path d="M4.4 4.4l5 5M9.4 5.6v3.8H5.6M19.6 19.6l-5-5M14.6 18.4v-3.8h3.8M19.6 4.4l-5 5M14.6 5.6v3.8h3.8M4.4 19.6l5-5M5.6 14.6h3.8v3.8"/></svg>',
    oztune: '<svg viewBox="0 0 24 24"><rect x="4.6" y="4.6" width="14.8" height="14.8" rx="4"/><path d="M8.6 12.8a3.4 3.4 0 0 1 6.8 0"/><path d="M12 9.4h.01" class="pt"/></svg>',
    balance: '<svg viewBox="0 0 24 24"><path d="M3.6 13.2h16.8"/><circle cx="12" cy="13.2" r="3.4"/><path d="M12 5.4v2.6"/></svg>',
    welcome: '<svg viewBox="0 0 24 24"><path d="M4.2 17.6h15.6M7.4 17.6a4.6 4.6 0 0 1 9.2 0M12 6.2v3M6.2 9l1.6 1.6M17.8 9l-1.6 1.6"/></svg>',
    about: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.6"/><path d="M12 11v5"/><path d="M12 8h.01" class="pt"/></svg>'
  };
  var ICON_OZ = (function () {   // the most binary marks: one stroke, dots or a line, clear on or off in red mode
    var S = function (h) { return '<svg viewBox="0 0 24 24">' + h + '</svg>'; };
    var d = function (x, y, r) { return '<circle class="dot" cx="' + x + '" cy="' + y + '" r="' + (r || 1.6) + '"/>'; };
    return {
      messages: S('<path d="M5 8h14M5 12h10M5 16h14"/>'),
      archive: S('<path d="M6 6h5v5H6zM13 6h5v5h-5zM6 13h5v5H6zM13 13h5v5h-5z"/>'),
      loops: S('<path d="M7 8h10v10H7z"/><path d="M9 6h10v10"/>'),
      timer: S('<circle cx="12" cy="13" r="6"/><path d="M12 13V8M12 4v2"/>'),
      golden: S('<circle cx="12" cy="11" r="4"/><path d="M4 16h16"/>'),
      player: S('<path d="M9 7l9 5-9 5z"/>'),
      notes: S('<path d="M6 8h12M6 12h12M6 16h8"/>'),
      noise: S('<path d="M8 16V10M12 16V7M16 16V11"/>'),
      sky: S(d(12, 12, 2.2)),
      friends: S(d(8.5, 12, 2) + d(15.5, 12, 2)),
      tonecheck: S('<path d="M4 16l4-8 4 4 4-6 4 10"/>'),
      planner: S('<path d="M12 6v12M6 12h12"/>'),
      lab: S('<path d="M7 7h10v10H7z"/>' + d(12, 12, 1.5)),
      picks: S('<path d="M12 5l7 7-7 7-7-7z"/>'),
      decide: S('<path d="M8 9h11M8 15h11"/>' + d(5, 9, 1.3) + d(5, 15, 1.3)),
      sweep: S('<path d="M7 6h3v12H7zM14 6h3v12h-3z"/>'),
      feed: S('<path d="M7 8h10M7 12h10M7 16h6"/>'),
      objects: S('<path d="M8 8h8v8H8z"/><path d="M11 5h8v8"/>'),
      demos: S('<circle cx="12" cy="12" r="6"/>' + d(12, 12, 1.8)),
      mindex: S('<path d="M5 7h14M5 12h10M5 17h14M19 10v4"/>'),
      shrink: S('<path d="M6 6h12v12H6zM9 9h6v6H9z"/>'),
      oztune: S('<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>'),
      balance: S('<path d="M4 13h16M12 13V7M8 17h8"/>'),
      welcome: S('<path d="M5 19V7h14v12M5 7l7-3 7 3"/>'),
      about: S('<circle cx="12" cy="12" r="7"/>' + d(12, 12, 1.4)),
      here: S('<path d="M8 8h8v8H8z"/>')
    };
  })();
  var ICON_CON = (function () {   // each place as a small constellation: dots, one or two links
    var S = function (h) { return '<svg viewBox="0 0 24 24">' + h + '</svg>'; };
    var d = function (x, y, r) { return '<circle class="dot" cx="' + x + '" cy="' + y + '" r="' + (r || 1.15) + '"/>'; };
    var L = function (a, b) { return '<path d="M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + '"/>'; };
    function pack(pts, lns) {
      var h = '', i;
      for (i = 0; i < (lns || []).length; i++) h += L(pts[lns[i][0]], pts[lns[i][1]]);
      for (i = 0; i < pts.length; i++) h += d(pts[i][0], pts[i][1]);
      return S(h);
    }
    return {
      messages: pack([[7, 9], [12, 6], [17, 9], [12, 16]], [[0, 1], [1, 2], [0, 3], [2, 3]]),
      archive: pack([[7, 7], [17, 7], [17, 17], [7, 17]], [[0, 1], [1, 2], [2, 3], [3, 0]]),
      loops: pack([[12, 6], [18, 12], [12, 18], [6, 12]], [[0, 1], [1, 2], [2, 3]]),
      timer: pack([[12, 5], [12, 12], [17, 16], [7, 16]], [[0, 1], [1, 2], [1, 3]]),
      golden: pack([[6, 15], [9, 9], [12, 7], [15, 9], [18, 15]], [[0, 1], [1, 2], [2, 3], [3, 4]]),
      player: pack([[8, 7], [8, 17], [18, 12]], [[0, 1], [0, 2], [1, 2]]),
      notes: pack([[8, 7], [8, 12], [8, 17], [15, 10]], [[0, 1], [1, 2], [1, 3]]),
      noise: pack([[6, 14], [9, 8], [12, 16], [15, 7], [18, 13]], [[0, 1], [1, 2], [2, 3], [3, 4]]),
      sky: pack([[12, 6], [7.5, 14], [16.5, 14], [12, 11]], [[0, 3], [1, 3], [2, 3]]),
      friends: pack([[7, 10], [10, 14], [14, 10], [17, 14]], [[0, 1], [2, 3]]),
      tonecheck: pack([[5, 15], [9, 8], [13, 13], [19, 7]], [[0, 1], [1, 2], [2, 3]]),
      planner: pack([[7, 7], [12, 7], [17, 7], [7, 17], [17, 17], [12, 12]], [[0, 1], [1, 2], [0, 3], [2, 4], [5, 1]]),
      lab: pack([[12, 6], [18, 12], [12, 18], [6, 12], [12, 12]], [[0, 1], [1, 2], [2, 3], [3, 0]]),
      picks: pack([[12, 5], [15, 10], [20, 12], [15, 14], [12, 19], [9, 14], [4, 12], [9, 10]], [[0, 1], [0, 7], [4, 3], [4, 5]]),
      decide: pack([[8, 7], [16, 7], [12, 12], [8, 17], [16, 17]], [[0, 2], [1, 2], [2, 3], [2, 4]]),
      sweep: pack([[8, 7], [8, 17], [16, 7], [16, 17]], [[0, 1], [2, 3]]),
      feed: pack([[6, 8], [12, 8], [18, 8], [6, 16], [12, 16], [18, 16]], [[0, 1], [1, 2], [3, 4], [4, 5]]),
      objects: pack([[12, 5], [19, 10], [12, 19], [5, 10], [12, 12]], [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4]]),
      demos: pack([[12, 6], [17, 10], [15, 17], [9, 17], [7, 10]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]),
      mindex: pack([[5, 8], [10, 8], [15, 8], [20, 8], [10, 16]], [[0, 1], [1, 2], [2, 3], [1, 4]]),
      shrink: pack([[6, 6], [18, 6], [18, 18], [6, 18], [10, 10], [14, 14]], [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5]]),
      oztune: pack([[12, 5], [8, 14], [16, 14], [12, 10], [6, 18], [18, 18]], [[0, 3], [1, 3], [2, 3], [1, 4], [2, 5]]),
      balance: pack([[5, 12], [12, 12], [19, 12], [12, 6]], [[0, 1], [1, 2], [1, 3]]),
      welcome: pack([[6, 18], [6, 8], [12, 5], [18, 8], [18, 18]], [[0, 1], [1, 2], [2, 3], [3, 4]]),
      about: pack([[12, 12], [12, 6], [18, 15], [6, 15]], [[0, 1], [0, 2], [0, 3]]),
      here: pack([[12, 8], [16, 12], [12, 16], [8, 12]], [[0, 1], [1, 2], [2, 3], [3, 0]])
    };
  })();
  function glyph(id) {
    var set = (P.iconStyle === 'constellation') ? ICON_CON : ICON_OZ;
    return (set && set[id]) || ICON_OZ[id] || (ICON && ICON[id]) || '';
  }
  // the one you are using now sits in the middle; the ones before it around it, older = fainter
  function recent() { var L = places(); var r = (get('recent', null) || ['messages', 'archive', 'timer', 'loops', 'golden']).filter(onDial); var now = r[0] || L[0]; if (now) r = [now].concat(r.filter(function (x) { return x !== now; })); L.forEach(function (x) { if (r.indexOf(x) < 0) r.push(x); }); return r.slice(0, 5); }
  var SLOTI = [[0, -178], [86, -138], [-86, -138], [154, -76], [-154, -76]], SLOTLN = [[-1, 0], [0, 1], [0, 2], [1, 3], [2, 4]], ALPHA = [1, .8, .8, .5, .5];
  function renderDock() {
    var host = $('dockCon'), r = recent(); $('dock').dataset.style = 'icons';
    conUI(host, r, SLOTI, SLOTLN, r[0], function (id, b) { fold(); open(id, null, b); }, { alpha: ALPHA, icons: true, gap: 27 });
  }
  function fold() { $('dock').classList.remove('open'); $('moon').classList.remove('open'); }

  var HL = { gold: '#DDBC89', coral: '#E1626B', rose: '#DCA4AB', white: '#e8e4dc' };
  function applyHL() {   // in red mode the highlight dims with the text, so nothing on screen is bright
    var c = FAM === 'light' ? '#8A5C28' : (HL[P.hl] || HL.gold);
    if (RT.ink) { var v = P.rtv[P.rt], k = Math.min(1, (v.l * 1.25) / 62), r = [1, 3, 5].map(function (i) { return Math.round(parseInt(c.substr(i, 2), 16) * k); }); c = hx(r); }
    H.style.setProperty('--hl', c);
  }
  applyFam(famLoad()); applyHL();

  /* depth by forced perspective (Gill, 8:54 PM): the dot grid recedes — dots shrink and dim toward a vanishing point.
     h1: drawn once per size and mode, a little larger than the screen; the depth movement is a compositor translate of the
     drawn grid (no redraw while you move), so the loop is idle when nothing changes */
  var DEPTH = { px: 0, py: 0, tx: 0, ty: 0, raf: 0 }, GRIDM = 24;
  function drawGrid() {
    var cv = $('centre').querySelector('.grid'), W = innerWidth + GRIDM * 2, Hh = innerHeight + GRIDM * 2, dpr = Math.min(2, devicePixelRatio || 1);
    cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; cv.style.left = cv.style.top = -GRIDM + 'px';
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hh * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
    var ink = rgb(), key = [W, Hh, dpr, ink].join(); if (cv._k === key) return; cv._k = key;
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, Hh);
    var vx = .5 * W, vy = .47 * Hh, g = 30;
    var cx = 0, cy = 0, A = W * .5, B = Hh * .5;
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
  // a slight parallax: you are inside it. the grid and the far stars shift by their depth while you touch or tilt (compositor only)
  function parallax(x, y) { DEPTH.tx = x; DEPTH.ty = y; if (!DEPTH.raf) DEPTH.raf = requestAnimationFrame(pStep); }
  function pStep() {
    DEPTH.raf = 0; var on = !still() && P.parallax;
    if (!on) { DEPTH.px = DEPTH.py = 0; } else { DEPTH.px += (DEPTH.tx - DEPTH.px) * .1; DEPTH.py += (DEPTH.ty - DEPTH.py) * .1; }
    $('centre').querySelector('.grid').style.translate = (DEPTH.px * -6).toFixed(2) + 'px ' + (DEPTH.py * -5).toFixed(2) + 'px';
    $('sky0').style.translate = $('sky0b').style.translate = (DEPTH.px * -3).toFixed(2) + 'px ' + (DEPTH.py * -2).toFixed(2) + 'px';
    if (on && Math.abs(DEPTH.tx - DEPTH.px) + Math.abs(DEPTH.ty - DEPTH.py) > .004) DEPTH.raf = requestAnimationFrame(pStep);
  }
  addEventListener('pointermove', function (e) { if (S.view !== 'open' || !e.isPrimary) return; parallax((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2); }, { passive: true });
  addEventListener('deviceorientation', function (e) { if (S.view !== 'open' || e.gamma == null) return; parallax(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30))); });
  addEventListener('resize', function () { if (S.view === 'open') drawGrid(); });
  function renderOpen() {
    $('moon').classList.toggle('off', !P.moon); $('dock').classList.toggle('off', !P.dock);
    $('dimmer').classList.toggle('off', !P.dimmer); $('corner').classList.toggle('off', !P.corner); $('corner').classList.toggle('plain', !P.ozcon);
    placeMoon(); drawGrid(); renderDock();
  }
  function unpick() { if (S.pick) { S.pick.classList.remove('pick'); S.pick.removeAttribute('aria-current'); } S.pick = null; clearTimeout(S.pickT); }
  /* places and stars (Gill's rule): the first tap selects, the second tap on the same one opens. a tap anywhere else lets go */
  function pickOr(el, go) {
    if (S.pick === el) { unpick(); go(); return; }
    unpick(); S.pick = el; el.classList.add('pick'); el.setAttribute('aria-current', 'true'); tick(4); S.pickT = setTimeout(unpick, 5000);
  }
  document.addEventListener('pointerdown', function (e) { if (S.pick && !(e.target.closest && e.target.closest('.pick'))) unpick(); }, true);
  $('dockStar').addEventListener('click', function (e) { e.stopPropagation(); $('moon').classList.remove('open'); $('dock').classList.toggle('open'); tick(6); });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#dock, #moon')) fold(); }, true);   // a tap outside folds it back

  /* the moon: pure, and free — drag it anywhere; tap unfolds its hairline stars */
  function placeMoon() { var p = get('moonpos', null) || [.76, .16]; $('moon').style.left = (p[0] * 100) + '%'; $('moon').style.top = (p[1] * 100) + '%'; }
  /* (h1) the pulls — top edge, middle, home line, left edge — live in one gesture controller, below */
  (function () {
    var tw = null, two = false;
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
      if (mode === 'wait' && dx > 8 && dx > Math.abs(dy)) { mode = 'back'; if (GX.canBack()) GX.begin('back', sx, sy, e); }
      if (mode === 'back') GX.move(e);
      if (mode === 'dim') { var c = innerHeight / 2, t = (e.clientY - (c - 150)) / 300; setL(t); bd.style.top = Math.max(c - 150, Math.min(c + 150, e.clientY)) + 'px'; d.setAttribute('aria-valuenow', Math.round(lvl * 100)); } });
    d.addEventListener('pointerup', function (e) { var m = mode; mode = null; if (m === 'dim') { put('dim', lvl); fold = setTimeout(function () { d.classList.remove('live'); }, 1200); } else if (m === 'back') GX.end(e); });
    d.addEventListener('pointercancel', function () { if (mode === 'back') GX.cancel(); mode = null; });
    d.addEventListener('keydown', function (e) { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setL(lvl + (e.key === 'ArrowDown' ? .1 : -.1)); put('dim', lvl); d.setAttribute('aria-valuenow', Math.round(lvl * 100)); } });
    d.addEventListener('dblclick', function () { setL(0); put('dim', 0); });
  })();

  /* ——— environments: from black, a camera move INTO the weather ——— */
  var EV = { ps: [], cz: -46, raf: 0, t0: 0, kind: 'clear', dir: 0, audio: null };
  function rgb() { return RT.ink ? RT.ink.join(',') : FAM === 'light' ? '42,32,36' : '232,228,220'; }
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
    var was = S.env; S.env = kind; tick(12);
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
  var NOISE_ROOM = '../oz-noise/';   // the one place the noise room is named: point it at the next build here
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
    { k: 'roomlist', name: 'rooms', words: 'room rooms toggles show hide ready only show all essentials places doors tools preview stub' },
    { k: 'rooms', name: 'what each room shows', words: 'room rooms features inside a room timer digits ring' },
    { k: 'sound', name: 'weather sound', words: 'sound audio volume mute' }
  ];
  var STOP = ' what whats is are the a an how do does i it to of my me can you on in for and or this that turn ';
  function wordsOf(t) { return t.toLowerCase().replace(/[^\w\s:'-]/g, ' ').split(/\s+/).filter(function (w) { return w && STOP.indexOf(' ' + w + ' ') < 0; }); }
  function brain(t) {   // whole words only, so 'start' is never 'stars'
    var W = wordsOf(t), out = [], num = (t.match(/\b(\d{1,3})\b/) || [])[1]; if (!W.length) return out;
    function score(bank, phrases) { var s = 0, B = bank.split(' ');
      W.forEach(function (w, wi) { if (/^\d+$/.test(w)) return; B.forEach(function (b) { if (b === w) s += 3; else if (wi === W.length - 1 && w.length >= 2 && b.indexOf(w) === 0) s += 1.5; }); });
      (phrases || []).forEach(function (ph) { if (ph.indexOf(' ') > 0 && (' ' + W.join(' ') + ' ').indexOf(' ' + ph + ' ') >= 0) s += 4; }); return s; }
    Object.keys(ROOMS).forEach(function (id) { var s = score(ROOMS[id].words); if (id === 'timer' && num) s += 2; if (s && onDial(id)) out.push({ type: 'place', id: id, s: s + .5, name: ROOMS[id].name, sub: id === 'timer' && num ? 'start ' + num + ':00' : face(id).line, set: id === 'timer' && num ? +num : 0 }); });
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
    if (it.type === 'place') { if (!onDial(it.id)) { show('open'); openSheet('roomlist'); return; } if (it.set) { timer = { total: it.set * 60, end: Date.now() + it.set * 60000, label: 'set just now', paused: false }; put('timer', timer); } show('open'); open(it.id); return; }
    if (it.type === 'env') { show('open'); pickEnv(it.id); return; }
    if (it.type === 'tune') { show('open'); openSheet(it.id); return; }
    if (it.type === 'faq') return openAsk(it.name, it);
  }
  function flRender(t) {
    var items = t ? brain(t) : likely().filter(onDial).slice(0, 3).map(function (id, i) { var f = face(id); return { type: 'place', id: id, name: f.line, sub: i ? f.sub : 'where you were' }; });
    var up = { type: 'up', name: 'ask oz ›', sub: t ? 'the full chat · “' + t + '”' : 'the full chat' };
    var L = $('flList'); L.innerHTML = '';
    if (t && !items.length) L.innerHTML = '<div class="none">nothing here by that name · ask oz below</div>';
    items.concat([up]).forEach(function (it) { var b = document.createElement('button'); if (it.type === 'up') b.className = 'up'; b.innerHTML = '<span></span><em></em>'; b.firstChild.textContent = it.name; b.lastChild.textContent = it.sub || ''; b.onclick = function () { choose(it); }; L.appendChild(b); });
    // the other shape: the answers appear as faint stars in the room itself
    var K = $('flSky'), SL = [[.30, .30], [.70, .36], [.34, .46], [.68, .53]]; K.innerHTML = '';
    items.forEach(function (it, i) { var b = document.createElement('button'); b.style.left = (it.type === 'faq' ? 50 : SL[i][0] * 100) + '%'; b.style.top = SL[i][1] * 100 + '%'; b.style.opacity = 0; b.innerHTML = '<i></i><span></span>' + (it.type === 'faq' ? '<em></em>' : ''); b.children[1].textContent = it.type === 'faq' ? '' : it.name; if (it.type === 'faq') { b.children[1].textContent = it.name; b.lastChild.textContent = it.sub; } b.querySelector('i').style.opacity = (1 - i * .2).toFixed(2); b.onclick = function () { pickOr(b, function () { choose(it); }); }; K.appendChild(b); setTimeout(function () { b.classList.add('in'); b.style.opacity = ''; }, 30 + i * (still() ? 0 : 120)); });
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
      if (!onDial(k[4] || k[0])) return;
      var cx = k[2] * W, cy = k[3] * Hh, con = CON[k[5]], sc = .42;
      x.strokeStyle = 'rgba(' + ink + ',.35)'; x.lineWidth = .6; con.l.forEach(function (p) { var a = con.s[p[0]], b = con.s[p[1]]; x.beginPath(); x.moveTo(cx + a[0] * sc, cy + a[1] * sc); x.lineTo(cx + b[0] * sc, cy + b[1] * sc); x.stroke(); });
      x.fillStyle = 'rgba(' + ink + ',.9)'; con.s.forEach(function (p) { x.beginPath(); x.arc(cx + p[0] * sc, cy + p[1] * sc, 1.2, 0, 7); x.fill(); });
      var b = document.createElement('button'); b.className = 'k'; b.style.left = cx + 'px'; b.style.top = (cy + 36) + 'px';
      var nm = ROOMS[k[0]] ? ROOMS[k[0]].name : k[0]; b.innerHTML = '<span class="lbl"></span><small></small>'; b.firstChild.textContent = nm; b.lastChild.textContent = k[1] || face(k[0]).line;
      b.setAttribute('aria-label', nm + ' · ' + (k[1] || face(k[0]).line));
      b.onclick = function () { pickOr(b, function () { if (k[4]) open(k[4], 'sky'); else toast(nm + ' · not in this prototype'); }); }; K.appendChild(b);
    });
  }
  addEventListener('resize', function () { if (S.view === 'sky') drawSky(); });

  /* ——— settings (tune), h1: it opens on the switches. short sections, one plain line per row, the usual row pattern
     (the name at left, the control at right, a hairline under), and every switch applies the moment you touch it ——— */
  var SHOWS = [['essentials', 'essentials only'], ['dial', 'the camera dial'], ['moon', 'the moon dial'], ['ozcon', 'the oz constellation'], ['dimmer', 'the dimmer'], ['corner', 'the oz corner'], ['parallax', 'depth movement']];
  var ROOM_F = { timer: [['ring', 'ring'], ['digits', 'time'], ['label', 'what it is for'], ['acts', 'pause · reset']], golden: [['arc', 'sun arc'], ['rows', 'times'], ['place', 'place']], player: [['album', 'album'], ['wave', 'line'], ['play', 'play']], notes: [['line', 'margin line']] };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function swRow(key, name, on) { return '<button class="rw" data-t="' + key + '" role="switch" aria-checked="' + !!on + '"><span>' + esc(name) + '</span><i class="sw' + (on ? ' on' : '') + '" aria-hidden="true"></i></button>'; }
  function swRoom(id) { var on = roomOn(id), pv = isPreview(id); return '<button class="rw" data-ron="' + id + '" role="switch" aria-checked="' + on + '"><span>' + esc(ROOMS[id].name) + (pv ? ' <em class="pv">preview</em>' : '') + '</span><i class="sw' + (on ? ' on' : '') + '" aria-hidden="true"></i></button>'; }
  function seg(key, opts, cur) { cur = cur == null ? String(P[key]) : cur; return '<div class="seg" role="group" data-seg="' + key + '">' + opts.map(function (o) { var pk = typeof PICK !== 'undefined' && PICK[key] != null && String(PICK[key]) === o[0]; return '<button data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '" class="' + (cur === o[0] ? 'cur' : '') + (pk ? ' pk' : '') + '"' + (pk ? ' aria-description="my pick"' : '') + '>' + esc(o[1]) + '</button>'; }).join('') + '</div>'; }
  function segRow(key, name, opts, cur) { return '<div class="rw" role="group" aria-label="' + esc(name) + '"><span>' + esc(name) + '</span>' + seg(key, opts, cur) + '</div>'; }
  function actRow(act, name, what) { return '<button class="rw act" data-act="' + act + '"><span>' + esc(name) + '</span><b class="lbl">' + esc(what) + '</b></button>'; }
  function buildSheet() {
    var h = '<h2 class="lbl" data-row="system">system</h2>';
    h += segRow('iconStyle', 'icons', [['oz', 'oz icons'], ['constellation', 'constellation']]);
    h += '<p class="fine">these marks are used wherever a room has an icon · oz icons is the pick, because a place should read at a glance at 20px in red mode</p>';
    h += '<h2 class="lbl" data-row="boot">opening</h2>';
    h += segRow('bootStyle', 'boot', [['oz', 'oz'], ['dial', 'I am'], ['local', 'local'], ['all', 'all 3']]);
    h += segRow('bootLen', 'start-up length', [['normal', 'normal'], ['longer', 'longer'], ['longest', 'longest']]);
    h += segRow('dialHome', 'home dial', [['moon', 'moon · double-tap'], ['off', 'off']]);
    h += swRow('topBar', 'top bar', P.topBar);
    h += segRow('barTime', 'the time', [['0', 'bottom'], ['1', 'top bar']], String(P.barTime));
    h += swRow('homeLine', 'home line in rooms', P.homeLine);
    h += segRow('dock2', 'dock', [['off', 'off'], ['dial', 'with dial'], ['arc', 'arc'], ['stars', 'stars'], ['swipe', 'swipe up']]);
    h += swRow('dockLabels', 'dock labels', P.dockLabels !== 0);
    h += segRow('places', 'your places', [['edge', 'right edge'], ['bottom', 'bottom']]);
    h += segRow('fadeS', 'controls fade', [['2', '2s'], ['3', '3s'], ['6', '6s'], ['stay', 'stay']]);
    h += segRow('moonRest', 'moon at rest', [['small', 'small'], ['hidden', 'hidden'], ['full', 'full']]);
    h += swRow('quietLine', 'the quiet line', P.quietLine);
    h += swRow('makeWay', 'make way', P.makeWay);
    h += actRow('replay', 'see the opening again', 'replay');
    h += actRow('picks', 'back to my picks', S.pkUndo ? 'undo' : 'use');
    h += '<details class="why"><summary class="rw"><span>why these picks</span><b class="lbl">›</b></summary>' + PICK_WHY.map(function (r) { return '<p><b>' + esc(r[0]) + ' · ' + esc(r[1]) + '</b> ' + esc(r[2]) + '</p>'; }).join('') + '</details>';
    h += '<h2 class="lbl" data-row="hide">what shows</h2>';
    SHOWS.forEach(function (r) { h += swRow(r[0], r[1], P[r[0]]); });
    h += '<div class="rw clockfont" role="group" aria-label="clock font"><span>clock font</span>' + seg('clockFont', [['poppins', 'poppins'], ['julius', 'julius'], ['serif', 'serif'], ['rounded', 'rounded'], ['mono', 'mono']]) + '</div>';
    h += '<h2 class="lbl" data-row="red">mode</h2>';
    h += '<div class="rw fam" role="group" aria-label="mode">' + seg('fam', FAMS, FAM) + '</div>';
    h += segRow('rt', 'red text', [['red', 'refined'], ['cream', 'cream'], ['amber', 'amber']]);
    h += segRow('hl', 'highlight', [['gold', 'gold'], ['coral', 'coral'], ['rose', 'rose'], ['white', 'white']]);
    var v = P.rtv[P.rt];
    h += '<details class="fine-tune"><summary class="rw"><span>fine-tune red text</span><b class="lbl">›</b></summary>';
    [['h', 'hue', 0, 360, 1], ['l', 'brightness', 8, 65, 1], ['s', 'saturation', 0, 100, 1], ['g', 'glow', 0, 12, .5], ['w', 'weight', 0, .6, .05]].forEach(function (r) {
      h += '<label class="slider"><span>' + r[1] + '</span><input type="range" data-rt="' + r[0] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + v[r[0]] + '" aria-label="red text ' + r[1] + '"><output>' + v[r[0]] + '</output></label>';
    });
    h += '<div class="txsample">the quiet between things<small>timer · 18:40 left</small></div><button class="rw act" data-act="copy"><span>copy these values</span><b class="lbl">copy</b></button><pre class="values" id="txValues"></pre></details>';
    h += '<h2 class="lbl">search</h2>' + segRow('fmt', 'shape', [['bar', 'a line'], ['stars', 'stars']]);
    h += '<h2 class="lbl" data-row="roomlist">rooms</h2>';
    h += segRow('roomMode', 'which rooms', [['ready', 'ready only'], ['all', 'show all']], P.roomMode || 'ready');
    h += '<p class="fine">' + (P.essentials ? 'Essentials is on · the dial shows 3 of the rooms that are on.' : 'Ready only hides unfinished rooms from the dial. Essentials, when on, keeps 3 of the rooms that are on. Nothing is deleted.') + '</p>';
    roomOrder().forEach(function (id) { if (ROOMS[id]) h += swRoom(id); });
    h += '<h2 class="lbl" data-row="rooms">inside a room</h2>';
    Object.keys(ROOM_F).forEach(function (id) { h += '<div class="rw chips" role="group" aria-label="' + esc(ROOMS[id].name) + '"><span>' + esc(ROOMS[id].name) + '</span><div>' + ROOM_F[id].map(function (f) { var on = P.rooms[id][f[0]] !== 0; return '<button data-room="' + id + '" data-f="' + f[0] + '" aria-pressed="' + on + '" class="' + (on ? 'on' : '') + '">' + esc(f[1]) + '</button>'; }).join('') + '</div></div>'; });
    h += '<h2 class="lbl" data-row="motion">motion and sound</h2>';
    h += swRow('motion', 'reduce motion', P.motion === 'still');
    h += swRow('sound', 'weather sound', P.sound);
    h += '<h2 class="lbl">this phone</h2>' + actRow('reset', 'back to how it opens first', 'reset');
    h += '<p class="fine">two fingers held still open this · pinch out rises, pinch in goes deeper · what you use comes forward</p>';
    $('shB').innerHTML = h;
  }
  function shApply() { applyMotion(); applyRT(); applyHL(); applyEss(); applyOpts(); if (S.view === 'open') renderOpen(); if (S.view === 'sky') drawSky(); if (P.dock2 === 'stars') renderDock(); if (CD.open) cdBuild(CD.cy || innerHeight / 2); if ($('qs') && $('qs').classList.contains('on')) buildQS(); if ($('float') && $('float').classList.contains('on') && $('flIn')) flRender($('flIn').value); }
  function openSheet(row) {
    buildSheet(); $('sheet').classList.add('on'); $('shB').scrollTop = 0; tick(8);   // it opens on the switches
    if (row) { var r = $('shB').querySelector('[data-row="' + row + '"]') || $('shB').querySelector('[data-t="' + row + '"]'); if (r) setTimeout(function () { r.scrollIntoView({ block: 'start' }); }, 60); }
    setTimeout(function () { var f = $('shB').querySelector('button, summary'); if (f && document.activeElement && document.activeElement !== document.body) f.focus({ preventScroll: true }); }, 80);
  }
  function closeSheet() { $('sheet').classList.remove('on'); }
  $('tuneBtn').addEventListener('click', function () { openSheet(); });
  $('shB').addEventListener('pointerup', function (e) {
    if (e.button) return;
    var fam = e.target.closest('[data-seg=fam] button'); if (!fam) return;
    famPointer(function () { setFam(fam.dataset.v); buildSheet(); });
  });
  $('shB').addEventListener('click', function (e) {
    var t = e.target.closest('[data-t]'), sg = e.target.closest('.seg button'), ch = e.target.closest('.chips button'), act = e.target.closest('[data-act]'), ron = e.target.closest('[data-ron]');
    if (ron) { var id = ron.dataset.ron; P.roomOn = P.roomOn || {}; P.roomOn[id] = roomOn(id) ? 0 : 1; save(); shApply(); tick(6); ron.setAttribute('aria-checked', String(roomOn(id))); ron.querySelector('.sw').classList.toggle('on', roomOn(id)); return; }
    if (sg) { var key = sg.parentNode.dataset.seg, v = sg.dataset.v; tick(6);
      if (key === 'fam') { famClick(function () { setFam(v); buildSheet(); }); return; }
      P[key] = (key === 'barTime') ? +v : v; save(); shApply(); buildSheet();
      if (key === 'bootStyle' || key === 'bootLen') { closeSheet(); setTimeout(function () { runBoot(true); }, 260); } return; }
    if (ch) { var R = P.rooms[ch.dataset.room]; R[ch.dataset.f] = R[ch.dataset.f] === 0 ? 1 : 0; save(); tick(6); buildSheet(); return; }
    if (t) { var k = t.dataset.t; tick(6); if (k === 'motion') P.motion = P.motion === 'still' ? 'auto' : 'still'; else P[k] = P[k] ? 0 : 1; save(); shApply(); if (k === 'sound' && !P.sound) sound(null);
      var sw0 = t.querySelector('.sw'); t.setAttribute('aria-checked', String(!sw0.classList.contains('on'))); sw0.classList.toggle('on'); return; }   // the switch flips in place: no rebuild under the finger
    if (!act) return;
    if (act.dataset.act === 'picks') {
      if (S.pkUndo) { Object.assign(P, S.pkUndo); S.pkUndo = null; save(); shApply(); toast('your choices are back'); }
      else { var keep = {}; Object.keys(PICK).forEach(function (k2) { keep[k2] = P[k2]; }); S.pkUndo = keep; usePicks(); toast('my picks · undo is right there'); clearTimeout(S.pkT); S.pkT = setTimeout(function () { S.pkUndo = null; var l = $('shB').querySelector('[data-act=picks] b'); if (l) l.textContent = 'use'; }, 8000); }
      var y = $('shB').scrollTop; buildSheet(); $('shB').scrollTop = y; return; }
    if (act.dataset.act === 'replay') { closeSheet(); runBoot(true); }
    if (act.dataset.act === 'copy') { var txt = JSON.stringify({ look: P.rt, values: P.rtv[P.rt], looks: P.rtv }, null, 2); $('txValues').textContent = txt; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast('values copied'); }, function () { toast('values shown below'); }); else toast('values shown below'); }
    if (act.dataset.act === 'reset') { var u2 = new URL(location.href); u2.searchParams.set('fresh', '1'); u2.searchParams.delete('boot'); location.href = u2.toString(); }
  });
  $('shB').addEventListener('input', function (e) { var el = e.target; if (!el.dataset.rt) return; P.rtv[P.rt][el.dataset.rt] = +el.value; el.nextElementSibling.textContent = el.value; save(); applyRT(); if (S.view === 'open') drawGrid(); });
  (function () { var sh = $('sheet'), sy = null; sh.querySelector('.grab').addEventListener('pointerdown', function (e) { sy = e.clientY; }); addEventListener('pointerup', function (e) { if (sy != null && e.clientY - sy > 40) closeSheet(); sy = null; }); })();
  document.addEventListener('pointerdown', function (e) { if ($('sheet').classList.contains('on') && !e.target.closest('#sheet')) closeSheet(); }, true);

  /* ═══════════ v7 (Gill, 20 Nov, 11:07–11:11 PM): distinctly oz. at rest almost nothing — the time, one quiet line, the dot.
     what you need appears when you reach for it and leaves when you let go. the camera dial on the right edge is the way
     to every place (touch, turn, lift); the Moon dial floats and holds the light around you. you are never lost: the oz
     corner is always home, the room's name is always at the top, every move is one continuous camera move, and every move
     undoes with one gesture back. what you use surfaces; what you don't fades. Essentials turns everything else off. ═══════════ */
  var V7 = { use: get('use', null) };
  if (!V7.use) { V7.use = { timer: { n: 6, t: Date.now() }, golden: { n: 5, t: Date.now() }, player: { n: 3, t: Date.now() }, noise: { n: 2, t: Date.now() }, notes: { n: 1, t: Date.now() - 6 * 864e5 } }; put('use', V7.use); }
  function used(id) { var u = V7.use[id] || { n: 0, t: 0 }; u.n++; u.t = Date.now(); V7.use[id] = u; put('use', V7.use); }
  function score(id) { var u = V7.use[id]; if (!u) return 0; var days = (Date.now() - u.t) / 864e5; return u.n * Math.pow(.5, days / 7); }   // a week's half-life: what you stop using fades
  function places() { var L = ['messages', 'archive', 'loops', 'timer', 'golden', 'player', 'noise', 'notes'].concat(OZX.filter(function (x) { return ['messages', 'archive', 'loops'].indexOf(x) < 0; })).filter(roomShown).sort(function (a, b) { return score(b) - score(a); }); if (P.essentials) L = L.slice(0, 3); return L; }
  function onDial(id) {   // the only set the dial and jump lists may show (Gill, 22 Nov 2:07 PM): rooms that are on, or the Essentials 3 of those
    if (!id || id === 'here') return false;
    if (places().indexOf(id) >= 0) return true;
    return false;
  }
  function fadeOf(id) { var L = places(), top = score(L[0]) || 1; return Math.max(.42, Math.min(1, .42 + .58 * score(id) / top)); }
  function dockCap() { return P.essentials ? 3 : 5; }
  function dockSlots() {
    var pool = places(), cap = dockCap(), slots = (P.dockSlots || []).filter(function (id) { return pool.indexOf(id) >= 0; });
    pool.forEach(function (id) { if (slots.indexOf(id) < 0 && slots.length < cap) slots.push(id); });
    return slots.slice(0, cap);
  }
  function setDockSlots(ids) { P.dockSlots = (ids || []).slice(0, dockCap()); save(); renderArc(); if (window.__ozDock && window.__ozDock.refresh) window.__ozDock.refresh(); }
  function applyEss() { H.classList.toggle('ess', !!P.essentials); }
  applyEss();
  var NAME = function (id) { return id === 'golden' ? 'good weather' : (ROOMS[id] ? ROOMS[id].name : id); };

  /* awake: controls come when you touch and leave after a few quiet seconds */
  function fadeMs() { return P.fadeS === 'stay' ? 0 : (+P.fadeS || 3) * 1000; }
  function wake() { if (!H.classList.contains('awake')) H.classList.add('awake'); clearTimeout(wake.k); if (!fadeMs()) return; wake.k = setTimeout(function () { if (!V7.holding) H.classList.remove('awake'); }, fadeMs()); }
  function dockHeld() { var s = H.getAttribute('data-dock'); return s && s !== 'idle'; }
  function dockOpen(hold) { if (P.dock2 !== 'swipe' && !hold) return; H.classList.add('dockopen'); clearTimeout(dockOpen.k); if (hold || dockHeld()) return; if (!fadeMs()) return; dockOpen.k = setTimeout(function () { if (!V7.holding && !dockHeld()) dockClose(); }, fadeMs()); }
  function dockClose(force) { if (!force && dockHeld()) return; clearTimeout(dockOpen.k); H.classList.remove('dockopen'); if (force && window.__ozDock && window.__ozDock.onForceClose) window.__ozDock.onForceClose(); }
  function applyOpts() {   // v7.4: the choices in tune → opening
    H.classList.toggle('pl-bottom', P.places === 'bottom'); H.classList.toggle('moon-hide', P.moonRest === 'hidden'); H.classList.toggle('moon-full', P.moonRest === 'full'); H.classList.toggle('no-quiet', !P.quietLine);
    if (P.fadeS === 'stay') { H.classList.add('awake'); clearTimeout(wake.k); }
    H.classList.toggle('lm', P.bootStyle === 'local' || P.bootStyle === 'all' || !!P.topBar);
    H.classList.toggle('tb', !!P.topBar); H.classList.toggle('hl', !!P.homeLine); H.classList.toggle('bt', !!P.barTime); H.classList.toggle('makeway', !!P.makeWay);
    ['dial', 'arc', 'stars', 'swipe'].forEach(function (k) { H.classList.toggle('dk-' + k, P.dock2 === k); });
    if (P.dock2 !== 'swipe') H.classList.remove('dockopen');
    $('dock').classList.toggle('off', P.dock2 !== 'stars'); if (P.dock2 !== 'stars') $('dock').classList.remove('open');
    H.setAttribute('data-icons', P.iconStyle === 'constellation' ? 'constellation' : 'oz');
    if (P.dock2 === 'dial' || P.dock2 === 'arc' || P.dock2 === 'swipe') renderArc(); if (window.renderBar) renderBar(); setTimeout(mwKick, 0);
    if (window.__ozDock && window.__ozDock.refresh) window.__ozDock.refresh();
    var hs = $('hint').querySelector('span'); if (hs) hs.textContent = P.dock2 === 'swipe' ? 'swipe up for your places' : (P.places === 'bottom' ? 'touch the bottom middle · slide · lift to go' : 'touch the right edge · turn · tap to go');
    applyClock();
  }
  function applyClock() { H.setAttribute('data-clock', P.clockFont || 'poppins'); }
  ['pointerdown', 'pointermove', 'keydown'].forEach(function (t) { addEventListener(t, function (e) { if (t === 'pointermove' && e.pointerType === 'touch' && !e.buttons) return; wake(); }, { passive: true, capture: true }); });

  /* the rest: the time at the bottom (bottom = time) and one quiet line of what matters now */
  function quiet() {
    if (tLeft() && onDial('timer')) return { id: 'timer', t: 'timer · ' + mmss(tLeft()) + (timer.paused ? ' paused' : ' left') };
    if (tLeft()) return { id: '', t: 'timer · ' + mmss(tLeft()) + (timer.paused ? ' paused' : ' left') };
    if (onDial('golden')) { var f = face('golden'); return { id: 'golden', t: f.line }; }
    return { id: '', t: '' };
  }
  function renderRest() {
    var r = $('rest'); if (!r) return; var d = new Date();
    var t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, ''), te = r.querySelector('.t');
    if (te.textContent !== t) te.textContent = t;   // only when it changes: no work at rest
    var q = quiet(), b = r.querySelector('.q'); if (b.dataset.id !== q.id || b.querySelector('span').textContent !== q.t) { b.dataset.id = q.id; b.querySelector('span').textContent = q.t; b.setAttribute('aria-label', q.t + ' · open'); }
  }
  $('rest').querySelector('.q').addEventListener('click', function (e) { e.stopPropagation(); var id = this.dataset.id; if (!id || !onDial(id)) return; var b = this, r = b.getBoundingClientRect(); S.camO = (r.left + r.width / 2) + 'px ' + (r.top + r.height / 2) + 'px'; open(id, null, b); });
  setInterval(function () { if (S.view === 'open') renderRest(); }, 1000);

  /* the star sky: faint stars at depth, slowly drifting and breathing.
     h1: drawn once per size and mode onto two canvases (the field, and a few stars that breathe); the drift and the breath
     are compositor animations in open.css, so no script runs per frame at rest */
  var SKY0 = { st: [], key: '' };
  (function seed() { var s = 11; function rn() { s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < 150; i++) SKY0.st.push({ x: rn(), y: rn() * .92, z: .25 + rn() * .75, p: rn() * 6.28, w: .4 + rn() * .9 }); })();
  function sky0() {
    var W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1), ink = rgb(), key = [W, Hh, ink, P.motion].join();
    if (key === SKY0.key) return; SKY0.key = key;
    var k = RT.ink ? 1.5 : 1;
    [['sky0', function (s) { return s.p > 1.1; }], ['sky0b', function (s) { return s.p <= 1.1; }]].forEach(function (L) {
      var c = $(L[0]); if (!c) return; c.width = Math.round(W * 2 * dpr); c.height = Math.round(Hh * dpr); c.style.width = (W * 2) + 'px'; c.style.height = Hh + 'px';
      var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W * 2, Hh);
      SKY0.st.forEach(function (s) { if (!L[1](s)) return; var a = Math.min(.6, (.08 + .36 * s.z * s.z) * .86 * k);
        x.fillStyle = 'rgba(' + ink + ',' + a.toFixed(3) + ')';
        [0, W].forEach(function (o) { x.beginPath(); x.arc(s.x * W + o, s.y * Hh, .35 + .75 * s.z, 0, 6.283); x.fill(); }); });   // twice, so the drift wraps seamlessly
    });
  }
  function skyKick() { sky0(); }
  sky0(); addEventListener('resize', sky0);

  /* ——— the camera dial (dial A): the right edge. touch it and a small labelled constellation of your places unfolds
     on a 3D wheel under your finger; turn it, lift to go. tap leaves it open; tap the sky to let it go; double-tap is home.
     the front star is always where you are now. its inner ring holds the settings: tune and Essentials ——— */
  var CD = { open: false, k: 0, kt: 0, items: [], cy: 0, raf: 0, r: 0, mode: null };
  function cdItems() { var here = S.view === 'room' ? S.room : (S.view === 'sky' ? 'sky' : 'here'), L = places().filter(function (x) { return x !== here; }); var ring = [here], i = 0; while (i < L.length) { ring.push(L[i++]); } if (!P.essentials && here !== 'sky' && roomShown('sky')) ring.push('sky'); return ring.filter(Boolean); }
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
      b.setAttribute('aria-label', i === 0 ? 'stay here' : 'go to ' + lb + (isPreview(id) ? ' · preview' : '')); b.innerHTML = '<span></span><i></i>'; b.firstChild.textContent = lb;
      if (isPreview(id)) markPreview(b.firstChild, id);
      b.style.setProperty('--u', i === 0 || id === 'sky' ? 1 : fadeOf(id).toFixed(2));
      o.appendChild(b);
    });
    [['tune', 'tune'], ['ess', P.essentials ? '3 places · Essentials on' : 'essentials']].forEach(function (s, j) {
      var b = document.createElement('button'); b.className = 'cin'; b.dataset.s = s[0]; b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = s[1]; o.appendChild(b);
    });
  }
  function cdLay() {
    $('camO').classList.toggle('b', P.places === 'bottom'); if (P.places === 'bottom') return cdLayB();
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
  function cdLayB() {   // the same wheel, lying along the bottom: it rises from the bottom middle, slide sideways to turn
    var o = $('camO'), W = innerWidth, Hh = innerHeight, hx = Math.max(W * .3, Math.min(W * .7, CD.px || W / 2)), hy = Hh - 30, R = CD.r, ln = [];
    var hub = o.querySelector('.hub'); if (!hub) return; hub.style.left = hx + 'px'; hub.style.top = hy + 'px';
    var front = ((Math.round(CD.k) % CD.n) + CD.n) % CD.n;
    Array.prototype.forEach.call(o.querySelectorAll('.cst'), function (b, i) {
      var th = (i - CD.k) * CD.step, z = Math.cos(th), x = hx + R * 1.18 * Math.sin(th), y = hy - 30 - R * .9 * Math.max(0, z) + 6 * Math.min(0, z);
      var vis = z > -.15 ? Math.min(1, (z + .15) / .55) : 0, sc = .62 + .38 * Math.max(0, z);
      b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px'; b.style.opacity = (vis * (i === front ? 1 : .78)).toFixed(3);
      b.style.transform = 'translate(-50%,-100%) translateY(8px) scale(' + sc.toFixed(3) + ')'; b.style.zIndex = Math.round(10 + z * 10);
      b.style.pointerEvents = vis > .4 && CD.mode === 'stay' ? 'auto' : 'none'; b.classList.toggle('front', i === front); b._x = x; b._y = y; b._v = vis;
      if (vis > .05) ln.push([x, y, vis]);
    });
    ln.sort(function (a, b) { return a[0] - b[0]; });
    var s = ''; for (var j = 1; j < ln.length; j++) s += '<line x1="' + ln[j - 1][0].toFixed(1) + '" y1="' + ln[j - 1][1].toFixed(1) + '" x2="' + ln[j][0].toFixed(1) + '" y2="' + ln[j][1].toFixed(1) + '" style="opacity:' + (.32 * Math.min(ln[j - 1][2], ln[j][2])).toFixed(3) + '"/>';
    var f = o.querySelector('.cst.front'); if (f) s += '<line x1="' + f._x.toFixed(1) + '" y1="' + f._y.toFixed(1) + '" x2="' + hx + '" y2="' + (hy - 4) + '" style="opacity:.22"/>';
    if (R > 4) s = '<path d="M' + (hx - R * 1.18) + ' ' + (hy + 4) + ' A ' + (R * 1.18) + ' ' + (R * .9 + 10) + ' 0 0 1 ' + (hx + R * 1.18) + ' ' + (hy + 4) + '" class="rim"/>' + s;
    o.querySelector('svg.ln').innerHTML = s;
    Array.prototype.forEach.call(o.querySelectorAll('.cin'), function (b, j) { b.style.left = (hx + (j ? 1 : -1) * (R * 1.18 + 34)) + 'px'; b.style.top = (hy - 8) + 'px'; b.style.opacity = CD.mode === 'stay' ? Math.min(1, R / 110) : 0; b.style.pointerEvents = CD.mode === 'stay' ? 'auto' : 'none'; });
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
    var z = $('cam'), sx, sy, t0, moved, k0, lastTap = 0, down = false, vk = 0, lk = 0, lt = 0;
    z.addEventListener('pointerdown', function (e) { if (!P.dial || $('boot').style.display !== 'none') return; e.stopPropagation(); e.preventDefault(); down = true; V7.holding = true; sx = e.clientX; sy = e.clientY; t0 = performance.now(); moved = false; vk = 0; lt = 0; lk = CD.k || 0;
      try { z.setPointerCapture(e.pointerId); } catch (x) {}
      if (CD.open && CD.mode === 'stay') { CD.mode = 'drag'; k0 = CD.k; clearTimeout(CD.q); return; }
      CD.px = e.clientX; cdOpen(e.clientY, 'drag'); k0 = 0; });
    z.addEventListener('pointermove', function (e) { if (!down) return; var dy = e.clientY - sy, dx = e.clientX - sx; if (Math.hypot(dx, dy) > 8) moved = true; if (CD.mode === 'drag') { CD.k = CD.kt = k0 - (P.places === 'bottom' ? dx : dy) / 52; var tn = performance.now(); if (lt && tn > lt) vk = vk * .5 + .5 * (CD.k - lk) / (tn - lt); lk = CD.k; lt = tn; cdKick(); } });
    function up(e) { if (!down) return; down = false; V7.holding = false; var now = performance.now(), dx = e.clientX - sx;
      if (!moved && now - t0 < 320) {   // a tap: double = home; single = leave it open
        if (now - lastTap < 340) { lastTap = 0; cdClose(); home(); return; }
        lastTap = now; CD.mode = 'stay'; CD.kt = Math.round(CD.k); cdKick(); return; }   // it stays open (Gill, Nov 22): closes on a pick, a tap outside, or back
      var hit = null, dyU = e.clientY - sy; if (P.places === 'bottom' ? dyU < -40 : dx < -40) Array.prototype.forEach.call($('camO').querySelectorAll('.cst'), function (b) { if (b._v > .4 && Math.hypot(b._x - (P.places === 'bottom' ? 0 : 20) - e.clientX, b._y - (P.places === 'bottom' ? 14 : 0) - e.clientY) < 46) hit = +b.dataset.i; });
      var f = ((Math.round(CD.k) % CD.n) + CD.n) % CD.n; CD.kt = Math.round(CD.k); CD.mode = 'stay';
      if (!moved) { cdKick(); return; }   // a hold that didn't turn: it stays, ready
      if (hit != null) { cdGo(hit); return; }   // slid onto a star: go there
      // let go: the dial stays open and glides on with your flick (Gill, Nov 22: so many places now, keep scrolling)
      var fl = (performance.now() - lt < 80) ? vk : 0; CD.kt = Math.round(CD.k + Math.max(-6, Math.min(6, fl * 260))); vk = 0; lt = 0; cdKick(); void f;
    }
    z.addEventListener('pointerup', up); z.addEventListener('pointercancel', function () { down = false; V7.holding = false; if (CD.mode === 'drag') { CD.mode = 'stay'; CD.kt = Math.round(CD.k); cdKick(); cdQuiet(); } });
    $('camO').addEventListener('click', function (e) { var b = e.target.closest('.cst'), c = e.target.closest('.cin'); e.stopPropagation();
      if (c) { cdClose(); if (c.dataset.s === 'tune') openSheet(); else { P.essentials = P.essentials ? 0 : 1; save(); shApply(); toast(P.essentials ? 'essentials · only what matters' : 'essentials off · everything back'); } return; }
      if (b) { tick(10); var i = +b.dataset.i; if (i !== CD.front) { CD.kt = i; } cdGo(i); } });
    document.addEventListener('pointerdown', function (e) { if (CD.open && CD.mode === 'stay' && !e.target.closest('#camO .cst, #camO .cin, #cam, #arcDock')) cdClose(); }, true);
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
    S.after = function () { if (S.view === 'room' && it.type === 'place') { if (!onDial(it.id)) { openSheet('roomlist'); return; } if (it.set) { timer = { total: it.set * 60, end: Date.now() + it.set * 60000, label: 'set just now', paused: false }; put('timer', timer); } open(it.id); } else choose0(it); };
    $('flIn').blur(); history.back();   // the float closes as one step back, then you go
  };

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
  function hintDone() { if (!get('hinted', false)) { put('hinted', true); } $('hint').classList.remove('on'); $('hint2').classList.remove('on'); }
  function hintMaybe() { if (get('hinted', false) || S.view !== 'open') return; put('hinted', true); var h = $('hint'); h.classList.add('on'); $('hint2').classList.add('on'); setTimeout(function () { h.classList.remove('on'); $('hint2').classList.remove('on'); }, 9000); }   // h1: once, ever

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
  renderOpen = function () { renderOpen0(); applyEss(); applyOpts(); $('cam').classList.toggle('off', !P.dial); $('moon').classList.toggle('off', !P.moon); renderRest(); sky0(performance.now()); skyKick(); };

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
    // double-tap keeps it out so you can play with no finger on it; a flick, any way, puts it back (Gill, 22 Nov)
    var last = null, hold = null, shrink = null, sx, sy, down = false, t0 = 0, mv = false, locked = false, lt = 0, lx = 0, ly = 0, pts = [];
    function hit(x, y) { var best = null, bd = 1e9; circles().forEach(function (c) { var r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); if (d < bd) { bd = d; best = c; } }); return bd < 22 ? best : null; }
    function play(c) { if (!c || c === last) return; last = c; ring(c); chime(c._f); tick(4); }
    function booting() { var b = $('boot'); return b && b.style.display !== 'none' && !b.classList.contains('gone'); }
    function lock() { locked = true; clearTimeout(shrink); clearTimeout(hold); host.classList.add('touch', 'play'); tick(10); }
    function unlock() { if (!locked) return; locked = false; host.classList.remove('play', 'touch'); tick(8); }
    function isFlick() {   // same feel as the other flicks (GX): travel + speed, any direction
      var a = pts[0], b = pts[pts.length - 1]; if (!a || !b) return false;
      var d = Math.hypot(b[0] - a[0], b[1] - a[1]), dt = b[2] - a[2];
      if (d <= 48) return false;
      if (dt < 8) return true;
      return d / dt > .45;
    }
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.oz') || booting()) return;
      down = true; sx = e.clientX; sy = e.clientY; last = null; t0 = performance.now(); mv = false; pts = [[sx, sy, e.timeStamp]];
      host.classList.add('touch'); try { host.setPointerCapture(e.pointerId); } catch (x) {}
      setTimeout(function () { play(hit(e.clientX, e.clientY)); }, 40);
      if (onHold && !locked) hold = setTimeout(function () { if (down && !locked) { onHold(); down = false; if (!locked) host.classList.remove('touch'); } }, 650);
    });
    host.addEventListener('pointermove', function (e) {
      if (!down) return;
      pts = pts.concat([[e.clientX, e.clientY, e.timeStamp]]).slice(-6);
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) { clearTimeout(hold); mv = true; }
      play(hit(e.clientX, e.clientY));
    });
    function up(e, cancelled) {
      if (!down) return;
      if (e && e.clientX != null) pts = pts.concat([[e.clientX, e.clientY, e.timeStamp]]).slice(-6);
      var now = performance.now();
      down = false; clearTimeout(hold);
      if (!cancelled && locked && mv && isFlick()) { last = null; unlock(); return; }
      if (!mv && now - t0 < 360 && !booting()) {
        if (lt && now - lt < 360 && e && Math.hypot(e.clientX - lx, e.clientY - ly) < 30) {
          lt = 0; if (!locked) lock(); last = null; return;
        }
        lt = now; if (e) { lx = e.clientX; ly = e.clientY; }
        if (!locked && onTap) onTap();
      }
      last = null;
      if (!locked) { clearTimeout(shrink); shrink = setTimeout(function () { if (!down && !locked) host.classList.remove('touch'); }, 500); }
    }
    host.addEventListener('pointerup', function (e) { up(e, false); });
    host.addEventListener('pointercancel', function (e) { up(e, true); });
  }
  (function () { var cn = $('corner'); cn.querySelector('.oz').addEventListener('click', function (e) { e.stopPropagation(); home(); });
    chimeable(cn, function () { return P.ozcon ? Array.prototype.slice.call(cn.querySelectorAll('svg circle')) : []; },
      function () { tick(14); runBoot(true); },                                                    // hold: the boot again
      function () { if (S.view !== 'open' || NZ.on || S.env !== 'clear') home(); }); })();   // tap: home, from anywhere   // tap: the dock (home) or back

  $('nzF').addEventListener('load', nzHook);

  /* ═══════════ v7.4 (Gill, 21 Nov 7:39–7:41 AM): more to compare, each a switch in tune → opening and in the quick sheet.
     a thin status bar at the top (the time and a tiny quiet count; pull it down for a dark glass quick sheet), a thin home
     line at the bottom (swipe up: home), and a dock that complements the camera dial: with the dial, an arc, or the v5 stars ═══════════ */
  var QN = { status: get('status', 'online') };
  function quietItems() {   // quiet notifications: only what is really on this phone, and only rooms that are on the dial
    var L = []; if (tLeft() && onDial('timer')) L.push({ id: 'timer', t: 'timer · ' + mmss(tLeft()) + ' left', s: timer.label });
    if (onDial('golden')) { var g = face('golden'); L.push({ id: 'golden', t: 'good weather · ' + g.line, s: 'golden hour' }); }
    var n = (get('note', '') || '').trim(); if (n && onDial('notes')) L.push({ id: 'notes', t: 'note · ' + n.split('\n')[0].slice(0, 28), s: 'notes' });
    return L;
  }
  function renderBar() {
    var b = $('topbar'); if (!b) return; var d = new Date(), t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, '');
    function set(el, v) { if (el && el.textContent !== v) el.textContent = v; }   // only when it changes
    set(b.querySelector('time'), t); set($('rTime'), t);   // the room bar's small time: the one clock in a room
    var n = quietItems().length; set(b.querySelector('.qc'), P.barTime ? (n ? '· ' + n : '') : (n ? n + ' quiet' : 'all quiet'));
    set(b.querySelector('.st'), QN.status === 'online' ? '' : (QN.status === 'dnd' ? '· do not disturb' : '· walking'));
  }
  setInterval(renderBar, 1000);
  function segQ(key, opts, cur) { return '<div class="seg" data-q="' + key + '">' + opts.map(function (o) { return '<button data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '" class="' + (cur === o[0] ? 'cur' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function buildQS() {   // h1: the familiar quick controls first (status, light, mode), then oz's own rows; settings at the end
    var h = '<div class="qs-h"><span class="lbl">quick</span><button class="qs-x lbl" data-a="close">done</button></div>';
    h += '<div class="qs-row" role="group" aria-label="status">' + segQ('status', [['online', 'online'], ['dnd', 'do not disturb'], ['walking', 'walking']], QN.status) + '</div>';
    h += '<div class="qs-row qs-light"><button class="qs-red" data-a="red" aria-label="red mode" aria-pressed="' + H.classList.contains('red') + '"><i></i></button><label class="qs-br"><span class="lbl">light</span><input type="range" min="0" max="100" step="1" aria-label="light" value="' + Math.round((1 - (+get('dim', 0))) * 100) + '"></label></div>';
    h += '<div class="qs-row" role="group" aria-label="mode">' + segQ('fam', FAMS, FAM) + '</div>';
    h += '<div class="qs-row qs-go">' + (onDial('noise') ? '<button data-a="noise"><b>' + ICON.noise + '</b><span>white noise</span></button>' : '') + (onDial('timer') ? '<button data-open="timer"><b>' + ICON.timer + '</b><span>' + (tLeft() ? mmss(tLeft()) + ' left' : 'timer') + '</span></button>' : '') + '</div>';
    var L = quietItems(); h += '<div class="qs-t lbl">quiet · ' + L.length + '</div><div class="qs-n">' + L.map(function (it) { return '<button data-open="' + it.id + '"><span></span><em></em></button>'; }).join('') + '</div>';
    h += '<button class="qs-all" data-a="tune"><span>settings</span><b aria-hidden="true">›</b></button><i class="qs-grab" aria-hidden="true"></i>';
    var q = $('qs'); q.innerHTML = h;
    Array.prototype.forEach.call(q.querySelectorAll('.qs-n button'), function (b, i) { b.firstChild.textContent = L[i].t; b.lastChild.textContent = L[i].s || ''; });
  }
  function openQS() { if ($('qs').classList.contains('on')) return; cdClose(); moClose(); if (!S.qsBuilt) buildQS(); S.qsBuilt = false; $('qs').classList.add('on'); H.classList.add('qson'); tick(8); pushNav('qs'); }
  function closeQS0() { $('qs').classList.remove('on'); H.classList.remove('qson'); }
  function closeQS() { if (!S.popping && S.nav[S.nav.length - 1] === 'qs') { history.back(); return; } closeQS0(); }
  var back1 = back;
  back = function () { if ($('qs').classList.contains('on')) { closeQS0(); return true; } return back1(); };
  $('qs').addEventListener('pointerup', function (e) {
    if (e.button || GX.k || GX.ate) return;
    var red = e.target.closest('[data-a=red]'), fam = e.target.closest('[data-q=fam] button');
    if (red) famPointer(dotTap);
    else if (fam) famPointer(function () { setFam(fam.dataset.v); });
  });
  $('qs').addEventListener('click', function (e) {
    e.stopPropagation(); var sg = e.target.closest('.seg button'), op = e.target.closest('[data-open]'), a = e.target.closest('[data-a]');
    if (sg) { var k = sg.parentNode.dataset.q; tick(6); if (k === 'status') { QN.status = sg.dataset.v; put('status', QN.status); renderBar(); buildQS(); } else if (k === 'fam') famClick(function () { setFam(sg.dataset.v); }); return; }
    if (op) { var id = op.dataset.open; S.after = function () { open(id); }; closeQS(); return; }
    if (!a) return;
    if (a.dataset.a === 'close') closeQS();
    if (a.dataset.a === 'red') { famClick(dotTap); }
    if (a.dataset.a === 'noise') { S.after = function () { goNoise(); }; closeQS(); }
    if (a.dataset.a === 'tune') { S.after = function () { openSheet(); }; closeQS(); }
  });
  $('qs').addEventListener('input', function (e) { if (e.target.type !== 'range') return; var v = 1 - (+e.target.value) / 100; $('dimveil').style.opacity = (v * .78).toFixed(3); put('dim', v); });
  document.addEventListener('pointerdown', function (e) { if ($('qs').classList.contains('on') && !e.target.closest('#qs, #topbar, #disc')) closeQS(); }, true);
  /* the dock, three ways that complement the camera dial (never a row of app icons):
     with the dial — the same places rise as a quiet arc at the bottom only while the dial is open, and fade with it;
     arc — a quiet arc of your places along the bottom that mirrors the dial, there when you touch, gone when you don't;
     stars — v5's labelled icon constellation, unfolding from the bottom middle when you touch its hairline */
  function renderArc() {
    var a = $('arcDock'), W = innerWidth, Hh = innerHeight, L = dockSlots(), n = L.length, ord = L.slice();   // left to right, the order you set
    a.innerHTML = '';
    if (!n) return;
    var showLab = P.dockLabels !== 0, mid = (n - 1) / 2, btns = [];
    ord.forEach(function (id, i) {
      var b = document.createElement('button'); b.className = 'ad' + (showLab ? '' : ' icononly'); b.dataset.id = id;
      b.style.setProperty('--u', fadeOf(id).toFixed(2)); b.style.setProperty('--d', Math.abs(i - mid));
      b.setAttribute('aria-label', NAME(id) + (isPreview(id) ? ' · preview' : '')); b.innerHTML = '<b>' + glyph(id) + '</b><span></span>'; b.lastChild.textContent = NAME(id); if (isPreview(id)) markPreview(b, id);
      a.appendChild(b); btns.push(b);
    });
    var widths = btns.map(function (b) { return Math.max(44, b.getBoundingClientRect().width); });
    var sum = widths.reduce(function (s, w) { return s + w; }, 0), gapMin = 10, edgeMin = 12;
    var gap = n > 1 ? Math.max(gapMin, Math.min(36, (W - 2 * edgeMin - sum) / (n - 1))) : 0;
    var total = sum + (n - 1) * gap; if (total > W - 2 * edgeMin && n > 1) { gap = gapMin; total = sum + (n - 1) * gap; }
    var x = Math.max(edgeMin, (W - total) / 2);
    var rowH = Math.max.apply(null, btns.map(function (b) { return b.getBoundingClientRect().height; })) || 44;
    var top = Hh - 16 - rowH;
    btns.forEach(function (b, i) { b.style.left = x.toFixed(1) + 'px'; b.style.top = top.toFixed(1) + 'px'; x += widths[i] + gap; });
  }
  $('arcDock').addEventListener('click', function (e) { var b = e.target.closest('.ad'); if (!b) return; e.stopPropagation(); wake(); pickOr(b, function () { tick(10); cdClose(); open(b.dataset.id, null, b); }); });
  $('arcDock').addEventListener('pointerdown', function (e) { e.stopPropagation(); if (P.dock2 === 'swipe' && H.classList.contains('dockopen')) dockOpen(); });
  addEventListener('resize', function () { renderArc(); });

  window.renderBar = renderBar;
  /* ═══════════ make way (h1): whatever is open (the dial, the moon's orbit, the quick sheet, settings, the places) is
     never covered: the small things at rest that it would overlap (the moon, the time and its line, the hint, the arc
     dock, the top bar, the home line) fade where they stand, all to one level, on the one fade. Nothing slides, and the
     thing under your finger keeps exactly as it is until you let go. It runs when something opens or closes — one
     measuring pass, then one writing pass — never every frame. The moon ghosts while the dial is open ═══════════ */
  var MW = { raf: 0, held: null, t: [] };
  function mwR(el, pad) { var r = el.getBoundingClientRect(); pad = pad || 0; return r.width || r.height ? [r.left - pad, r.top - pad, r.right + pad, r.bottom + pad] : null; }
  function mwHit(a, b) { return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; }
  function mwUnion(sel, pad) {   // the whole open dial, its lines too: one area
    var u = null; Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { var s = el.style.opacity; if (s !== '' && +s < .35) return; var r = el.getBoundingClientRect(); if (!r.width) return; u = u ? [Math.min(u[0], r.left), Math.min(u[1], r.top), Math.max(u[2], r.right), Math.max(u[3], r.bottom)] : [r.left, r.top, r.right, r.bottom]; });
    return u ? [u[0] - pad, u[1] - pad, u[2] + pad, u[3] + pad] : null;
  }
  function mwObstacles() {
    var o = [], add = function (r) { if (r) o.push(r); };
    if (CD.open) add(mwUnion('#camO .cst, #camO .cin', 10));
    if (MO.open) { add(mwUnion('#moonO .mst', 8)); add(mwR($('moon'), -14)); }
    if ($('dock').classList.contains('open')) add(mwUnion('#dockCon .cs', 6));
    if ($('qs').classList.contains('on')) add(mwR($('qs'), 8));
    if ($('sheet').classList.contains('on')) add(mwR($('sheet'), 8));
    return o;
  }
  function mwSofts() {   // what makes way: [element, the area that counts]
    var L = [], q = function (el, rr) { if (el) L.push([el, rr || function () { return mwR(el); }]); };
    Array.prototype.forEach.call(document.querySelectorAll('#arcDock .ad'), function (el) { q(el); });
    if (!$('moon').classList.contains('orb')) q($('moon'), function () { return mwR($('moon'), -16); });
    q($('rest'), function () { var a = mwR($('rest').querySelector('.t'), 2), b = P.quietLine ? mwR($('rest').querySelector('.q'), -4) : null; return a && b ? [Math.min(a[0], b[0]), a[1], Math.max(a[2], b[2]), b[3]] : a || b; });
    q($('hint'), function () { return mwR($('hint').querySelector('span'), 2); });
    q($('hint2')); q($('topbar')); q($('homeLine'));
    return L;
  }
  function mwRun() {
    MW.raf = 0;
    var on = !!P.makeWay && S.view === 'open' && !H.classList.contains('booting'), all = on && $('qs').classList.contains('on'), obs = on ? mwObstacles() : [], L = mwSofts();
    var fade = L.map(function (s) {   // read everything first …
      if (!on) return false; if (all) return true;   // the quick sheet: the rest state makes way
      if (s[0].id === 'moon' && CD.open) return true;   // the moon ghosts while the dial is open
      var r = s[1](); return !!r && obs.some(function (b) { return mwHit(r, b); });
    });
    L.forEach(function (s, i) {   // … then write
      var el = s[0]; if (MW.held && (el === MW.held || el.contains(MW.held))) return;   // what is under the finger keeps still
      if (el.classList.contains('mwf') !== fade[i]) el.classList.toggle('mwf', fade[i]);
    });
  }
  function mwNow() { if (!MW.raf) MW.raf = requestAnimationFrame(mwRun); }
  function mwKick() { mwNow(); MW.t.forEach(clearTimeout); MW.t = [setTimeout(mwNow, 200), setTimeout(mwNow, 460)]; }   // and once more as the open thing settles
  addEventListener('pointerdown', function (e) { MW.held = e.target.closest ? e.target.closest('#arcDock .ad, #moon, #rest .q, #topbar, #tuneBtn, #homeLine') : null; }, { passive: true, capture: true });
  ['pointerup', 'pointercancel'].forEach(function (t) { addEventListener(t, function () { if (MW.held) { MW.held = null; mwKick(); } }, { passive: true, capture: true }); });
  addEventListener('resize', mwKick);
  (function () { var mo = new MutationObserver(mwKick); [H, $('camO'), $('moonO'), $('qs'), $('sheet'), $('dock'), $('moon'), $('open')].forEach(function (el) { if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] }); }); })();
  setTimeout(mwKick, 400);

  /* my picks: the defaults, as my considered best oz. Each toggle keeps its other choices to compare */
  var PICK = { bootStyle: 'oz', topBar: 1, barTime: 0, homeLine: 1, dock2: 'swipe', places: 'edge', fadeS: '3', moonRest: 'small', quietLine: 1, makeWay: 1, clockFont: 'poppins', dockLabels: 1, iconStyle: 'oz' };
  var PICK_WHY = [
    ['opening', 'oz', 'your pick, and the corner it lands in is the way home'],
    ['top bar', 'on', 'top = where you are: the quiet count, your status, F1 and tune; pull it down for the quick sheet; in rooms it keeps the time'],
    ['time', 'at the bottom', 'bottom = time at home, one clock; in rooms, where there is no big clock, the bar shows it small'],
    ['home line', 'on', 'the most familiar gesture there is, shown only in rooms'],
    ['dock', 'swipe up', 'a short swipe up from the home line shows your places; a longer or faster one still goes home'],
    ['places', 'right edge', 'right = dial; the thumb is already there'],
    ['controls fade', '3s', 'long enough to find them, short enough to forget them'],
    ['the moon at rest', 'small', 'always reachable, never loud'],
    ['the quiet line', 'on', 'the one thing that matters now, under the time'],
    ['make way', 'on', 'open things never cover each other; what is covered fades in place, nothing moves under your finger'],
    ['clock font', 'poppins', 'the big time at rest, in the same light as the rest of the opening'],
    ['dock labels', 'on', 'the name under each place; turn it off and only the icons remain'],
    ['icons', 'oz icons', 'a place should read at a glance; the most binary marks stay clear at 20px in red mode, where a cluster of dots can melt together']
  ];
  function usePicks() { Object.keys(PICK).forEach(function (k) { P[k] = PICK[k]; }); save(); applyOpts(); if (S.view === 'open') renderOpen(); mwKick(); }

  /* ═══════════ h1 · the gestures, solid. One controller for the four pulls, so they all behave alike: each tracks the
     finger from the first move, can be cancelled by going back the way you came (or by the system taking the touch),
     settles on the same curve, and is never left half-open — it ends open or closed.
       top edge (the band of the top bar)  → the quick sheet          · swipe it up, tap outside or back to close
       the middle of the sky (below 22%)   → search
       the home line, in a room            → home
       the left edge, or Escape            → back
     The top and middle pulls cannot be confused: between the top band and the middle there is a dead band that starts
     nothing, and each zone decides on touch-down, not on the way. ═══════════ */
  var GX = { k: null, c: null, ate: false, tz: 62, mz: 186 }, SETTLE = 'opacity .32s cubic-bezier(.2,.7,.2,1), transform .32s cubic-bezier(.2,.7,.2,1)';
  function gxZones() { var d = $('disc').getBoundingClientRect(); GX.tz = Math.max(48, d.bottom + 6); GX.mz = Math.max(GX.tz + 60, innerHeight * .22); }
  gxZones(); addEventListener('resize', gxZones);
  function gxLayer() { return NZ.on ? $('nz') : S.view === 'room' ? $('room') : S.view === 'sky' ? $('sky') : null; }
  function gxBackTarget() {
    if ($('sheet').classList.contains('on')) return { el: $('sheet'), how: 'sheet' };
    if ($('qs').classList.contains('on')) return { el: $('qs'), how: 'fade' };
    if (S.view === 'float' || S.view === 'ask') return { el: $(S.view), how: 'fade' };
    var l = gxLayer(); return l ? { el: l, how: 'scale' } : null;
  }
  GX.canBack = function () { return !!gxBackTarget(); };
  GX.begin = function (k, sx, sy, e) {
    var el = null, how = '';
    if (k === 'qs') { buildQS(); S.qsBuilt = true; el = $('qs'); how = 'drop'; hintDone(); }
    else if (k === 'qsx') { el = $('qs'); how = 'drop'; }
    else if (k === 'search') { var f = $('float'); f.className = 'layer fmt-' + P.fmt; flRender(''); el = f; how = 'fadein'; GX.under = S.view === 'open' ? $('open') : gxLayer(); }
    else if (k === 'back') { var b = gxBackTarget(); if (b) { el = b.el; how = b.how; } }
    else if (k === 'home') { el = gxLayer(); how = 'scale'; if (!el && P.dock2 === 'swipe' && S.view === 'open') { el = $('arcDock'); how = 'dockpeek'; } }
    else if (k === 'dockx') { el = $('arcDock'); how = 'dockout'; }
    if (!el) return false;
    GX.k = k; GX.el = el; GX.how = how; GX.sx = sx; GX.sy = sy; GX.id = e.pointerId; GX.p = k === 'qsx' ? 1 : 0; GX.ate = true;
    cdClose(); moClose(); el.classList.add('gx'); H.classList.add('gxing'); return true;
  };
  GX.paint = function (p) {
    var el = GX.el, k = GX.k;
    if (GX.how === 'drop') { el.style.opacity = p.toFixed(3); el.style.transform = 'translateY(' + ((p - 1) * 28).toFixed(1) + 'px)'; $('qsVeil').style.opacity = p.toFixed(3); }
    else if (GX.how === 'fadein') { el.style.opacity = p.toFixed(3); if (GX.under) GX.under.style.opacity = (1 - .86 * p).toFixed(3); }
    else if (GX.how === 'fade') el.style.opacity = (1 - p).toFixed(3);
    else if (GX.how === 'sheet') el.style.transform = 'translateY(' + (p * 100).toFixed(1) + '%)';
    else if (GX.how === 'dockpeek') { el.style.opacity = p.toFixed(3); }
    else if (GX.how === 'dockout') { el.style.opacity = (1 - p).toFixed(3); }
    else { el.style.transformOrigin = k === 'home' ? '50% 100%' : '50% 50%'; el.style.transform = 'scale(' + (1 - .14 * p).toFixed(4) + ')'; el.style.opacity = (1 - .5 * p).toFixed(3); }
  };
  GX.move = function (e) {
    if (!GX.k) return; var dx = e.clientX - GX.sx, dy = e.clientY - GX.sy, k = GX.k, p;
    GX.pts = (GX.pts || []).concat([[e.clientX, e.clientY, e.timeStamp]]).slice(-6);
    p = k === 'qs' ? dy / 200 : k === 'qsx' ? 1 + dy / 200 : k === 'search' ? dy / 150 : k === 'back' ? dx / (innerWidth * .6) : k === 'dockx' ? dy / 180 : -dy / 220;
    GX.p = Math.max(0, Math.min(1, p)); GX.paint(GX.p);
  };
  function gxVel() { var P0 = GX.pts || [], a = P0[0], b = P0[P0.length - 1]; if (!a || !b || b[2] - a[2] < 8) return [0, 0]; var dt = b[2] - a[2]; return [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt]; }
  function gxClear(el) { el.style.opacity = ''; if (GX.how !== 'scale' || !el.classList.contains('on')) { el.style.transform = ''; el.style.transformOrigin = ''; } }
  function gxSettle(el, ms) { el.style.transition = SETTLE; clearTimeout(el._gs); el._gs = setTimeout(function () { el.style.transition = ''; }, ms || 360); }
  GX.end = function (e) {
    if (!GX.k) return; var k = GX.k, el = GX.el, how = GX.how, v = gxVel(), p = GX.p;
    var fl = k === 'back' ? v[0] : k === 'home' || k === 'qsx' ? -v[1] : v[1];   // the flick, in the gesture's own direction
    var y1 = e && e.clientY != null ? e.clientY : (GX.pts && GX.pts.length ? GX.pts[GX.pts.length - 1][1] : GX.sy);
    var frac = Math.max(0, (GX.sy - y1) / innerHeight);
    var commit = k === 'qsx' ? (p < .6 || fl > .45) : (p > .4 || (fl > .45 && p > .06));
    // swipe mode: a short pull (under ~18%, or a modest one released slowly) opens the dock and must not
    // be cancelled by the generic 0.4 commit floor; a longer or faster pull still goes home.
    if (k === 'home' && P.dock2 === 'swipe' && frac >= .04 && (frac < .18 || (fl < .45 && frac < .25))) {
      GX.k = null; GX.pts = []; el.classList.remove('gx'); H.classList.remove('gxing'); GX.under = null;
      tick(8); gxSettle(el); gxClear(el);
      if (S.view !== 'open' || NZ.on) home();
      dockOpen(); return;
    }
    GX.k = null; GX.pts = []; el.classList.remove('gx'); H.classList.remove('gxing');
    var under = GX.under; GX.under = null;
    if (!commit) return gxBack(el, how, under);
    tick(8);
    if (k === 'qs') { gxSettle(el); gxClear(el); $('qsVeil').style.opacity = ''; openQS(); return; }
    if (k === 'qsx') { gxSettle(el); gxClear(el); $('qsVeil').style.opacity = ''; closeQS(); return; }
    if (k === 'search') { gxSettle(el); el.style.opacity = ''; if (under) under.style.opacity = ''; openFloat(); return; }
    if (how === 'sheet') { gxSettle(el); el.style.transform = ''; closeSheet(); return; }
    if (k === 'dockx') { gxSettle(el); el.style.opacity = ''; dockClose(); return; }
    // back and home: the layer keeps where your finger left it; the camera move carries on from there
    var navd = S.nav.length > 0, lt = el.style.transform, fin = function () { el.style.opacity = ''; if (el.style.transform === lt) { el.style.transform = ''; el.style.transformOrigin = ''; } };   // the camera move replaced it, or (Reduce Motion) it just fades
    if (navd) addEventListener('popstate', function h() { removeEventListener('popstate', h); setTimeout(fin, 0); });
    if (k === 'home') home(); else goBack();
    if (!navd) setTimeout(fin, 0);
  };
  function gxBack(el, how, under) {   // cancelled: everything returns to exactly how it was, on the same curve
    gxSettle(el); el.style.opacity = ''; el.style.transform = ''; if (how === 'scale') setTimeout(function () { el.style.transformOrigin = ''; }, 360);
    if (how === 'drop') { $('qsVeil').style.transition = SETTLE; $('qsVeil').style.opacity = ''; setTimeout(function () { $('qsVeil').style.transition = ''; }, 360); if (!el.classList.contains('on')) S.qsBuilt = false; }
    if (under) { gxSettle(under); under.style.opacity = ''; }
  }
  GX.cancel = function () { if (!GX.k) return; var el = GX.el, how = GX.how, under = GX.under; GX.k = null; GX.under = null; GX.pts = []; el.classList.remove('gx'); H.classList.remove('gxing'); gxBack(el, how, under); };
  document.addEventListener('pointerdown', function (e) {
    if (!e.isPrimary) { if (GX.k) GX.cancel(); GX.c = null; return; }   // a second finger is a pinch, not a pull
    GX.ate = false; GX.c = null; if (GX.k || $('boot').style.display !== 'none') return;
    var t = e.target, x = e.clientX, y = e.clientY, c = null;
    if (t.closest('#cam, #camO .cst, #camO .cin, #moon, #moonO .mst, #dimmer, input, textarea, .slider')) return;
    if ($('qs').classList.contains('on')) { if (t.closest('#qs')) c = 'qsx'; }
    else if ($('sheet').classList.contains('on')) c = null;   // settings scroll; its grab and back close it
    else if (t.closest('#homeLine')) c = H.classList.contains('dockopen') && P.dock2 === 'swipe' ? 'dockx' : 'home';
    else if (x < 20 && GX.canBack()) c = 'back';
    else if (NZ.on || S.view === 'ask' || S.view === 'float') c = null;
    else if (y < GX.tz && !t.closest('#corner, #disc, #tuneBtn, #rBack')) c = 'qs';
    else if (y >= GX.mz && S.env === 'clear' && !t.closest('button, a, [role=button], #arcDock, .dock, #rbar')) c = 'search';
    if (!c) return; GX.c = c; GX.sx = x; GX.sy = y; GX.id = e.pointerId; GX.pts = [[x, y, e.timeStamp]];
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (e.pointerId !== GX.id) return;
    if (!GX.k) { if (!GX.c) return; var dx = e.clientX - GX.sx, dy = e.clientY - GX.sy; if (Math.hypot(dx, dy) < 10) return;
      var c = GX.c, ok = c === 'back' ? dx > 0 && dx > Math.abs(dy) * 1.2 : (c === 'home' || c === 'qsx') ? dy < 0 && -dy > Math.abs(dx) * 1.2 : c === 'dockx' ? dy > 0 && dy > Math.abs(dx) * 1.2 : dy > 0 && dy > Math.abs(dx) * 1.2;
      GX.c = null; if (!ok || !GX.begin(c, GX.sx, GX.sy, e)) return; }
    GX.move(e);
  }, true);
  document.addEventListener('pointerup', function (e) { GX.c = null; if (GX.k && e.pointerId === GX.id) GX.end(e); }, true);
  document.addEventListener('pointercancel', function (e) { GX.c = null; if (GX.k && e.pointerId === GX.id) GX.cancel(); }, true);
  document.addEventListener('click', function (e) { if (GX.ate) { GX.ate = false; e.preventDefault(); e.stopPropagation(); } }, true);   // a pull never also taps what it started on
  document.addEventListener('pointerdown', function (e) {
    if (!H.classList.contains('dockopen') || P.dock2 !== 'swipe') return;
    if (e.target.closest && e.target.closest('#arcDock .ad, #homeLine, #dockEdit, #dockPad, #dockDone, #dockCue, #dockHit')) return;
    if (dockHeld()) return;
    dockClose();
  });
  // the same places by tap and by keyboard
  $('topbar').addEventListener('click', function () { if ($('qs').classList.contains('on')) closeQS(); else { openQS(); hintDone(); } });
  $('homeLine').addEventListener('click', function () { home(); });
  $('homeLine').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); home(); } });
  $('rBack').addEventListener('click', function () { goBack(); });
  $('moon').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (MO.open) moClose(); else { moOpen(); moQuiet(); var f = $('moonO').querySelector('.mst'); if (f) setTimeout(function () { f.focus(); }, 60); } } });
  $('cam').addEventListener('keydown', function (e) {
    if (!P.dial) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (CD.open) cdGo(((Math.round(CD.k) % CD.n) + CD.n) % CD.n); else { CD.px = innerWidth / 2; cdOpen(innerHeight / 2, 'stay'); cdQuiet(); } }
    if (CD.open && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); CD.kt = Math.round(CD.kt) + (e.key === 'ArrowUp' ? -1 : 1); cdKick(); cdQuiet(); }
  });
  /* the room bar: back, the room's name, the small time at right — the same bar in every room you open from home */
  function rbarSync() {
    var on = S.view === 'room' || S.view === 'sky' || NZ.on; H.classList.toggle('inroom', on);
    if (NZ.on) $('rT').textContent = ROOMS.noise.name; else if (S.view === 'sky') $('rT').textContent = ROOMS.sky.name; else if (S.view === 'room' && S.room && ROOMS[S.room]) $('rT').textContent = ROOMS[S.room].name;
    if (on) renderBar();
  }
  (function () { var mo = new MutationObserver(rbarSync); ['room', 'sky', 'nz'].forEach(function (id) { mo.observe($(id), { attributes: true, attributeFilter: ['class'] }); }); })();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && CD.open) { e.stopImmediatePropagation(); cdClose(); } }, true);

  // F1 for the status bar: the local check's dotted arch (21 dots), drawn once
  (function () { var s = $('localMark').querySelector('svg'), h = '<path d="'; for (var i = 0; i < N; i++) { var p = archPt(i); h += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' '; } h += '"/>';
    for (var j = 0; j < N; j++) { var q = archPt(j); h += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (j % 5 === 0 ? 2.2 : 1.7) + '"/>'; } s.innerHTML = h; })();
  /* ——— boot (v7.4, Gill 21 Nov 7:31 AM): four openings to compare, chosen in tune → opening.
     oz (default): the oz constellation forms in the middle, then the SAME corner element glides to the oz corner (v5's boot).
     I am → dial: "I am.", the handset and the mint dot; your places form round it and settle to where the dial keeps them (v7).
     local → status bar: F1, the local check, lights round its arch dot by dot, then glides up to the status bar, where signal would sit.
     all three: "I am." with your places, oz above, F1 below — then each goes home together: places to the dial, oz to the corner,
     F1 to the status bar. Each element that moves is the real one, laid out once, one transform to identity: no copy, no swap.
     Reduce Motion: the same order as fades, everything forms in its own place ——— */
  var boot = $('boot');
  function flyFrom(el, svg, cx, cy, sc) {   // put the real element at (cx, cy), scaled; returns go(ms) that runs it home
    el.style.transition = 'none'; el.style.transform = 'none'; void el.offsetWidth;
    var r = el.getBoundingClientRect(), s = svg.getBoundingClientRect(), ox = s.left - r.left + s.width / 2, oy = s.top - r.top + s.height / 2;
    var dx = cx - (s.left + s.width / 2), dy = cy - (s.top + s.height / 2);
    el.style.transformOrigin = ox + 'px ' + oy + 'px'; el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + sc + ')'; el.style.willChange = 'transform'; void el.offsetWidth;
    return function (ms) { el.style.transition = 'transform ' + ms + 'ms cubic-bezier(.65,0,.22,1)'; el.style.transform = 'translate3d(0,0,0) scale(1)'; };
  }
  function hop(el) {   // Reduce Motion: the same story as fades. it fades where it formed and fades in at home; no move, no cut
    el.style.transition = 'opacity .3s ease'; el.style.opacity = '0';
    setTimeout(function () { el.style.transition = 'none'; el.style.transform = ''; el.style.transformOrigin = ''; void el.offsetWidth; el.style.transition = 'opacity .4s ease'; el.style.opacity = ''; }, 320);
  }
  function unfly(el) { el.style.opacity = ''; el.style.transition = ''; el.style.transform = ''; el.style.willChange = ''; el.style.transformOrigin = ''; }
  function placesStars(cx, cy, tx, ty, rr) {   // the dial's constellation: one star per place
    var bs = $('bootSky'), L = cdOrder(cdItems()), n = L.length, pts = [];
    L.forEach(function (id, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n + .35, r = rr + (i % 2) * 18; pts.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * .9]); });
    var s = '<svg>'; pts.forEach(function (p, i) { var q = pts[(i + 1) % n]; s += '<line x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; }); s += '</svg>';
    pts.forEach(function (p, i) { s += '<b style="left:' + p[0].toFixed(1) + 'px;top:' + p[1].toFixed(1) + 'px;--d:' + i + ';--tx:' + (tx - p[0]).toFixed(1) + 'px;--ty:' + (ty - p[1]).toFixed(1) + 'px"></b>'; });
    bs.className = ''; bs.innerHTML = s; bs.style.display = ''; void bs.offsetWidth;
  }
  function dialHome() { var W = innerWidth, Hh = innerHeight; return P.places === 'bottom' ? [W / 2, Hh - 34] : [W - 30, Hh * .51]; }
  function runBoot(replay) {
    var mode = ['oz', 'dial', 'local', 'all'].indexOf(P.bootStyle) >= 0 ? P.bootStyle : 'oz';
    var cn = $('corner'), sv = cn.querySelector('svg'), cs = Array.prototype.slice.call(sv.querySelectorAll('circle')), ST = still(), bs = $('bootSky'), lm = $('localMark'), ld = Array.prototype.slice.call(lm.querySelectorAll('circle'));
    clearTimeout(runBoot.d); (runBoot.T || []).forEach(clearTimeout); var T = runBoot.T = [], K = ({ longer: 1.4, longest: 1.8 })[P.bootLen] || 1, at = function (ms, f) { T.push(setTimeout(f, ms * K)); };   // start-up length (tune): timing only
    cdClose(); moClose();
    if (replay) { if (NZ.on) history.back(); if (S.view !== 'open') homeNow(); boot.style.display = ''; void boot.offsetWidth; }
    else goHome();
    boot.className = 'm-' + mode; void boot.offsetWidth;
    H.classList.add('booting'); H.classList.remove('awake'); H.classList.toggle('lm', mode === 'local' || mode === 'all');
    cn.classList.add('on', 'booting'); cn.classList.remove('formed', 'drawn'); cs.forEach(function (c) { c.classList.remove('lit'); }); unfly(cn);
    if (mode === 'local' || mode === 'all') lm.classList.add('booting'); else lm.classList.remove('booting'); lm.classList.remove('drawn'); ld.forEach(function (c) { c.classList.remove('lit'); }); unfly(lm);
    bs.innerHTML = ''; bs.className = ''; bs.style.display = '';
    var W = innerWidth, Hh = innerHeight, dh = dialHome(), goCn = null, goLm = null, end;
    at(30, function () { boot.classList.add('lit'); });
    function ozForm(t0, cx, cy, sc) {   // the oz constellation, star by star, then its line, then the word
      if (!P.ozcon) { at(t0 + 200, function () { cn.classList.add('formed'); }); return; }
      goCn = flyFrom(cn, sv, cx, cy, sc);
      var order = KEY.map(function (k, i) { return i; }).concat([7]);
      order.forEach(function (i, k) { at(t0 + k * 58, function () { cs[i].classList.add('lit'); }); });
      at(t0 + 140, function () { cn.classList.add('drawn'); });
      at(t0 + 480, function () { cn.classList.add('formed'); });
    }
    function f1Form(t0, cx, cy, sc, step) {   // F1, the local check: its arch lit dot by dot
      goLm = flyFrom(lm, lm.querySelector('svg'), cx, cy, sc);
      ld.forEach(function (c, k) { at(t0 + k * step, function () { c.classList.add('lit'); }); });
      at(t0 + 120, function () { lm.classList.add('drawn'); });
    }
    function cornerInPlace(t0) { if (P.ozcon) cs.forEach(function (c, k) { at(t0 + k * 36, function () { c.classList.add('lit'); }); }); at(t0 + 120, function () { cn.classList.add('drawn'); }); }
    if (mode === 'oz') {
      ozForm(160, W / 2 - 14, Hh * .44, 2.3);
      if (ST) { at(700, function () { goCn && hop(cn); boot.classList.add('gone'); H.classList.remove('booting'); }); end = 1500; }
      else { at(900, function () { goCn && goCn(860 * K); boot.classList.add('gone'); H.classList.remove('booting'); }); end = 1800; }
    } else if (mode === 'dial') {
      placesStars(W / 2, Hh * .44, dh[0], dh[1], 84);
      at(260, function () { bs.classList.add('form'); });
      cornerInPlace(300);
      at(760, function () { boot.classList.add('gone'); bs.classList.add('settle'); H.classList.remove('booting'); cn.classList.add('formed'); });
      end = 1320;
    } else if (mode === 'local') {
      f1Form(180, W / 2, Hh * .44, 3, 22);
      at(320, function () { boot.classList.add('says'); });
      cornerInPlace(420);
      if (ST) { at(820, function () { goLm && hop(lm); boot.classList.add('gone'); H.classList.remove('booting'); cn.classList.add('formed'); }); end = 1500; }
      else { at(880, function () { goLm && goLm(820 * K); boot.classList.add('gone'); H.classList.remove('booting'); cn.classList.add('formed'); }); end = 1750; }
    } else {   // all three, choreographed: they form together, then each goes home at once
      placesStars(W / 2, Hh * .45, dh[0], dh[1], 78);
      at(240, function () { bs.classList.add('form'); });
      ozForm(200, W / 2 - 14, Hh * .21, 1.9);
      f1Form(220, W / 2, Hh * .7, 2.4, 18);
      if (ST) { at(860, function () { goCn && hop(cn); goLm && hop(lm); boot.classList.add('gone'); bs.classList.add('settle'); H.classList.remove('booting'); }); end = 1600; }
      else { at(880, function () { goCn && goCn(860 * K); goLm && goLm(860 * K); boot.classList.add('gone'); bs.classList.add('settle'); H.classList.remove('booting'); }); end = 1800; }
    }
    at(end, done);
    function done() { boot.style.display = 'none'; bs.style.display = 'none'; bs.innerHTML = ''; cn.classList.remove('booting'); cn.classList.add('formed', 'drawn'); unfly(cn); cs.forEach(function (c) { c.classList.remove('lit'); });
      lm.classList.remove('booting'); lm.classList.add('drawn'); unfly(lm); ld.forEach(function (c) { c.classList.remove('lit'); }); H.classList.remove('booting'); renderRest(); hintMaybe(); V7.booted = performance.now(); }
  }
  V7.replay = function () { runBoot(true); };
  ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(function (t) { boot.addEventListener(t, function (e) { e.preventDefault(); e.stopPropagation(); }, { passive: false }); });
  // the home dial, from the moon: a double-tap opens your places, and it stays open until you pick, tap outside or go back
  function homeDial() { $('moon').classList.remove('open'); CD.px = innerWidth / 2; cdOpen(innerHeight / 2, 'stay'); }
  (function (sel, go) { var lt = 0, lx = 0, ly = 0; document.addEventListener('pointerup', function (e) { if (!e.target.closest || !e.target.closest(sel)) return; var n = performance.now();
      if (n - lt < 360 && Math.hypot(e.clientX - lx, e.clientY - ly) < 30) { lt = 0; go(e); } else { lt = n; lx = e.clientX; ly = e.clientY; } }, true); })('#moon', function () { if (P.dialHome !== 'off' && P.dial) homeDial(); });
  if (Q.get('dial') === '1') setTimeout(function () { if (P.dial) homeDial(); }, Q.get('boot') === '0' ? 350 : 2600);
  if (Q.get('boot') === '0') { boot.style.display = 'none'; $('bootSky').style.display = 'none'; $('corner').classList.add('on', 'formed', 'drawn'); $('localMark').classList.add('drawn'); H.classList.toggle('lm', P.bootStyle === 'local' || P.bootStyle === 'all'); goHome(); hintMaybe(); }
  else runBoot(false);
  window.__oz = {
    $, P: P, H: H, save: save, glyph: glyph, NAME: NAME, ROOMS: ROOMS,
    places: places, roomShown: roomShown, dockSlots: dockSlots, setDockSlots: setDockSlots, dockCap: dockCap,
    renderArc: renderArc, dockOpen: dockOpen, dockClose: dockClose, open: open, wake: wake, tick: tick,
    isPreview: isPreview, markPreview: markPreview, fadeOf: fadeOf,
    view: function () { return S.view; }, room: function () { return S.room; }
  };
})();
