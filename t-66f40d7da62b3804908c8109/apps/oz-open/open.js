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
  var DEF = { ozcon: 1, moon: 1, stars: 1, dock: 1, dimmer: 1, dial: 1, hide: 1, corner: 1, fmt: 'bar', motion: 'auto', sound: 1, keepOne: 1,
    rooms: { timer: { ring: 1, digits: 1, label: 1, acts: 1 }, golden: { arc: 1, rows: 1, place: 1 }, player: { album: 1, wave: 1, play: 1 }, notes: { line: 1 } } };
  var P = get('prefs', null) || JSON.parse(JSON.stringify(DEF));
  Object.keys(DEF).forEach(function (k) { if (P[k] == null) P[k] = JSON.parse(JSON.stringify(DEF[k])); });
  if (Q.get('f') === 'bar' || Q.get('f') === 'stars') P.fmt = Q.get('f');
  if (Q.get('motion')) P.motion = Q.get('motion');
  function save() { put('prefs', P); }
  function still() { return P.motion === 'still' || (P.motion === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function applyMotion() { H.classList.toggle('still', still()); }
  applyMotion();
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(function () { el.classList.remove('on'); }, 2200); }

  /* red mode: on by default, one tap on the dot */
  if (get('red', true) === false) H.classList.remove('red');
  $('disc').addEventListener('click', function () { H.classList.toggle('red'); put('red', H.classList.contains('red')); tick(8); if (S.view === 'sky') drawSky(); });

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
    if (S.env !== 'clear' && S.view === 'open') { setEnv('clear'); return true; }
    if (S.view === 'room' || S.view === 'sky') { tick(6); var p = S.stack.pop(); if (p === 'sky') { S.room = null; show('sky'); drawSky(); } else goHome(); return true; }
    if ($('moon').classList.contains('open')) { $('moon').classList.remove('open'); return true; }
    if ($('dock').classList.contains('open')) { $('dock').classList.remove('open'); return true; }
    if (S.pick) { unpick(); return true; }
    return false;
  }
  
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') back(); });
  function open(id, from) {
    tick(12); $('moon').classList.remove('open'); $('dock').classList.remove('open'); unpick();
    if (S.env !== 'clear') setEnv('clear', true);
    if (id === 'sky') { S.stack.push(S.view === 'sky' ? 'sky' : 'home'); show('sky'); drawSky(); return; }
    S.stack.push(from === 'sky' ? 'sky' : 'home'); S.room = id; put('last', id);
    $('rT').textContent = ROOMS[id].name; rooms[id]($('rB')); applyRoomPrefs(id); show('room');
  }

  /* ——— stars only where they ARE controls: a small constellation, each star a labelled 44 pt target, hairlines showing how
     they belong together. used by the dock and the moon. pts are px from the host's origin; links are [a, b] pairs (-1 = the origin) */
  function conUI(host, items, pts, links, cur, onPick) {
    var minx = 0, miny = 0, maxx = 0, maxy = 0; pts.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
    var pad = 20, vb = [minx - pad, miny - pad, maxx - minx + pad * 2, maxy - miny + pad * 2];
    var s = '<svg viewBox="' + vb.join(' ') + '" style="left:' + vb[0] + 'px;top:' + vb[1] + 'px;width:' + vb[2] + 'px;height:' + vb[3] + 'px" aria-hidden="true">';
    links.forEach(function (l, k) { var a = l[0] < 0 ? [0, 0] : pts[l[0]], b = pts[l[1]], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, g0 = l[0] < 0 ? 4 : 7, g1 = 7;
      s += '<line style="--d:' + k + '" x1="' + (a[0] + dx / d * g0).toFixed(1) + '" y1="' + (a[1] + dy / d * g0).toFixed(1) + '" x2="' + (b[0] - dx / d * g1).toFixed(1) + '" y2="' + (b[1] - dy / d * g1).toFixed(1) + '"/>'; });
    host.innerHTML = s + '</svg>';
    items.forEach(function (id, i) { var b = document.createElement('button'); b.className = 'cs' + (id === cur ? ' cur' : ''); b.style.left = pts[i][0] + 'px'; b.style.top = pts[i][1] + 'px'; b.style.setProperty('--d', i);
      b.setAttribute('aria-label', ROOMS[id].name); b.innerHTML = '<i></i><span></span>'; b.lastChild.textContent = ROOMS[id].name;
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); b.addEventListener('pointerup', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); tick(10); onPick(id); }); host.appendChild(b); });
  }
  var DOCK = ['timer', 'golden', 'player', 'notes', 'sky'], DOCKPTS = [[-132, -60], [-70, -114], [0, -146], [70, -114], [132, -60]], DOCKLN = [[-1, 2], [0, 1], [1, 2], [2, 3], [3, 4]];
  function fold() { $('dock').classList.remove('open'); $('moon').classList.remove('open'); }

  /* ——— the opening state: quiet lines, not stars (Gill, 8:12 PM: stars only where they mean something) ——— */
  var SLOTS = [[.30, .36], [.67, .47], [.34, .60], [.70, .67]];
  function renderOpen() {
    $('moon').classList.toggle('off', !P.moon); $('stars').classList.toggle('off', !P.stars); $('dock').classList.toggle('off', !P.dock);
    $('dimmer').classList.toggle('off', !P.dimmer); $('dial').classList.toggle('off', !P.dial); $('hide').classList.toggle('off', !P.hide); $('corner').classList.toggle('off', !P.corner); $('corner').classList.toggle('plain', !P.ozcon);
    placeMoon();
    var L = likely().slice(0, 4), box = $('stars'); box.innerHTML = '';
    L.forEach(function (id, i) {
      var f = face(id), b = document.createElement('button'); b.className = 'st' + (i === 0 ? ' doing' : '') + (i === 0 && P.keepOne ? '' : ' q-hide'); b.dataset.id = id;
      b.innerHTML = '<i></i><span></span>'; b.children[1].textContent = f.line;
      b.addEventListener('click', function (e) { e.stopPropagation(); open(id); });
      box.appendChild(b);
    });
    conUI($('dockCon'), DOCK, DOCKPTS, DOCKLN, L[0], function (id) { fold(); open(id); });
  }
  function unpick() { if (S.pick) S.pick.classList.remove('pick'); S.pick = null; }
  setInterval(function () { if (S.view === 'open') { var b = $('stars').querySelector('[data-id=timer] span'); if (b) b.textContent = face('timer').line; } }, 1000);
  ['moon', 'stars', 'dock', 'dimmer', 'dial', 'corner', 'tuneBtn'].forEach(function (id) { $(id).classList.add('q-hide'); });
  $('stars').classList.remove('q-hide');   // its children carry it, so the one thing can stay
  $('dockStar').addEventListener('click', function (e) { e.stopPropagation(); $('moon').classList.remove('open'); $('dock').classList.toggle('open'); tick(6); });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#dock, #moon')) fold(); }, true);   // a tap outside folds it back

  /* the hide dot: everything off except the phone (and, if you keep it, the one thing you are doing) */
  $('hide').addEventListener('click', function () { var q = H.classList.toggle('quiet'); tick(q ? 12 : 8); $('moon').classList.remove('open'); $('dock').classList.remove('open'); unpick(); put('quiet', q); });
  if (get('quiet', false)) H.classList.add('quiet');

  /* the moon: pure, and free — drag it anywhere; tap unfolds its hairline stars */
  function placeMoon() { var p = get('moonpos', null) || [.76, .16]; $('moon').style.left = (p[0] * 100) + '%'; $('moon').style.top = (p[1] * 100) + '%'; }
  (function () {
    var m = $('moon'), sx, sy, ox, oy, drag = false, down = false;
    var R = ['timer', 'golden', 'player', 'notes'], ring = $('moonRing');
    function lay() {   // its shortcuts fan out on the open side of the screen, joined to the moon and to each other
      var r = m.getBoundingClientRect(), cx = r.left + 40, cy = r.top + 40, left = cx > innerWidth / 2, low = cy > innerHeight / 2, pts = [];
      [[42,60],[130,106],[130,184],[42,230]].forEach(function (p) { pts.push([p[0] * (left ? -1 : 1), p[1] * (low ? -1 : 1)]); });
      conUI(ring, R, pts, [[-1, 0], [0, 1], [1, 2], [2, 3]], likely()[0], function (id) { fold(); open(id); });
    }
    m.addEventListener('pointerdown', function (e) { if (e.target.closest('.cui .cs')) return; e.stopPropagation(); down = true; drag = false; sx = e.clientX; sy = e.clientY; var r = m.getBoundingClientRect(); ox = r.left + 40; oy = r.top + 40; m.setPointerCapture(e.pointerId); });
    m.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx, dy = e.clientY - sy; if (!drag && Math.hypot(dx, dy) > 8) { drag = true; m.classList.remove('open'); } if (drag) { var x = Math.min(innerWidth - 30, Math.max(30, ox + dx)), y = Math.min(innerHeight - 80, Math.max(70, oy + dy)); m.style.left = x + 'px'; m.style.top = y + 'px'; } });
    m.addEventListener('pointerup', function (e) { e.stopPropagation(); if (!down) return; down = false; if (drag) { var r = m.getBoundingClientRect(); put('moonpos', [(r.left + 40) / innerWidth, (r.top + 40) / innerHeight]); } else { lay(); m.classList.toggle('open'); tick(8); } });
  })();

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
    d.addEventListener('pointerup', function (e) { var m = mode; mode = null; if (m === 'dim') { put('dim', lvl); fold = setTimeout(function () { d.classList.remove('live'); }, 1200); } else if (m === 'back' && e.clientX - sx > 40) back(); });
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
      if (!moved) { if (now - lastTap < 320) { mark(0); setEnv('clear'); d.classList.remove('live'); return; } lastTap = now; var b = document.elementFromPoint(e.clientX, e.clientY); if (b && b.dataset && b.dataset.k) { mark(ENVS.indexOf(b.dataset.k)); setEnv(b.dataset.k); setTimeout(function () { d.classList.remove('live'); }, 400); } return; }
      setEnv(ENVS[idx]); setTimeout(function () { d.classList.remove('live'); }, 700);
    });
    pl.addEventListener('click', function (e) { var b = e.target.closest('b'); if (!b) return; e.stopPropagation(); mark(ENVS.indexOf(b.dataset.k)); setEnv(b.dataset.k); setTimeout(function () { d.classList.remove('live'); }, 400); });
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest('#dial')) d.classList.remove('live'); });
    S.markDial = mark;
  })();

  /* ——— environments: from black, a camera move INTO the weather ——— */
  var EV = { ps: [], cz: -46, raf: 0, t0: 0, kind: 'clear', dir: 0, audio: null };
  function rgb() { return H.classList.contains('red') ? '255,68,87' : '232,228,220'; }
  function seedEnv(kind) {
    var n = { rain: 720, snow: 340, fog: 46, noise: 1400 }[kind] || 0, ps = [];
    for (var i = 0; i < n; i++) { var r = 8 * Math.sqrt(Math.random()) * (.55 + .45 * Math.random()), a = Math.random() * 6.283; ps.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 1 + Math.random() * 23, s: Math.random() }); }
    EV.ps = ps;
  }
  function envFrame(dt) {
    var c = $('envC'), W = innerWidth, Hh = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== W * dpr) { c.width = W * dpr; c.height = Hh * dpr; }
    var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, Hh);
    var F = W * .5, ink = rgb(), k = EV.kind, cz = EV.cz, moving = !still(), BO = Math.max(1, 1 + 2.4 * (-cz / 46));
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
  fetch('../../js/oz-faq.json?v=1120-2040').then(function (r) { return r.json(); }).then(function (j) { FAQ = j; }).catch(function () {});
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
    if (it.type === 'env') { show('open'); setEnv(it.id); return; }
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
  var OPEN_ROWS = [['moon', 'the moon', 'pure, free-moving'], ['ozcon', 'the oz constellation', 'the boot forms it · the corner chimes'], ['stars', 'quiet lines', 'what you were doing · what fits now'], ['dock', 'the dock', 'a hairline tick at the bottom edge'], ['dimmer', 'the dimmer', 'a hairline on the left edge · red mode'], ['dial', 'the weather dial', 'right edge · the one dial that opens with you'], ['hide', 'the hide dot', 'where the Mark was'], ['corner', 'the oz corner', 'tap to go back']];
  var ROOM_F = { timer: [['ring', 'ring'], ['digits', 'time'], ['label', 'what it is for'], ['acts', 'pause · reset']], golden: [['arc', 'sun arc'], ['rows', 'times'], ['place', 'place']], player: [['album', 'album'], ['wave', 'line'], ['play', 'play']], notes: [['line', 'margin line']] };
  function sw(on) { return '<i class="sw' + (on ? ' on' : '') + '"></i>'; }
  function seg(key, opts) { return '<div class="seg" data-seg="' + key + '">' + opts.map(function (o) { return '<button data-v="' + o[0] + '" class="' + (P[key] === o[0] ? 'cur' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function buildSheet() {
    var h = '<h4 data-row="hide">opening · after the dot</h4>';
    OPEN_ROWS.forEach(function (r) { h += '<div class="rw" data-t="' + r[0] + '"><div>' + r[1] + '<small>' + r[2] + '</small></div>' + sw(P[r[0]]) + '</div>'; });
    h += '<div class="rw" data-t="keepOne"><div>keep the one thing when hidden<small>the hide dot leaves what you are doing</small></div>' + sw(P.keepOne) + '</div>';
    h += '<h4>search float</h4><div class="rw"><div>shape<small>same brain as oz chat · ask oz › is always there</small></div>' + seg('fmt', [['bar', 'hairline bar'], ['stars', 'stars in the room']]) + '</div>';
    h += '<h4 data-row="rooms">rooms · how little can each one be</h4>';
    Object.keys(ROOM_F).forEach(function (id) { h += '<div class="rw" style="border:0;min-height:30px"><div>' + ROOMS[id].name + '</div></div><div class="chips">' + ROOM_F[id].map(function (f) { return '<button data-room="' + id + '" data-f="' + f[0] + '" class="' + (P.rooms[id][f[0]] !== 0 ? 'on' : '') + '">' + f[1] + '</button>'; }).join('') + '</div>'; });
    h += '<h4 data-row="motion">motion</h4><div class="rw"><div>reduce motion</div>' + seg('motion', [['auto', 'auto'], ['still', 'on'], ['full', 'off']]) + '</div>';
    h += '<h4 data-row="sound">weather</h4><div class="rw" data-t="sound"><div>sound<small>a quiet bed of noise for each one</small></div>' + sw(P.sound) + '</div>';
    h += '<h4 data-row="boot">boot</h4><div class="rw" data-act="replay"><div>see the boot again</div><span class="lbl" style="color:var(--mid)">replay</span></div>';
    h += '<div class="rw" data-act="reset"><div>back to how it opens first<small>clears this prototype on this phone</small></div><span class="lbl" style="color:var(--mid)">reset</span></div>';
    h += '<p class="fine">the dimmer, red mode and the dot work as in oz · two fingers held still opens this</p>';
    $('shB').innerHTML = h;
  }
  function openSheet(row) { buildSheet(); $('sheet').classList.add('on'); tick(8); if (row) { var r = $('shB').querySelector('[data-row="' + row + '"]') || $('shB').querySelector('[data-t="' + row + '"]'); if (r) setTimeout(function () { r.scrollIntoView({ block: 'start' }); }, 60); if (row === 'red') toast('red mode is the dot · one tap'); } }
  $('tuneBtn').addEventListener('click', function () { openSheet(); });
  $('shB').addEventListener('click', function (e) {
    var t = e.target.closest('[data-t]'), sg = e.target.closest('.seg button'), ch = e.target.closest('.chips button'), act = e.target.closest('[data-act]');
    if (sg) { var key = sg.parentNode.dataset.seg; P[key] = sg.dataset.v; save(); applyMotion(); buildSheet(); return; }
    if (ch) { var R = P.rooms[ch.dataset.room]; R[ch.dataset.f] = R[ch.dataset.f] === 0 ? 1 : 0; save(); buildSheet(); toast(ROOMS[ch.dataset.room].name + ' · ' + (R[ch.dataset.f] ? 'shown' : 'hidden')); return; }
    if (t) { P[t.dataset.t] = P[t.dataset.t] ? 0 : 1; save(); buildSheet(); if (S.view === 'open') renderOpen(); if (t.dataset.t === 'sound' && !P.sound) sound(null); return; }
    if (act && act.dataset.act === 'replay') { var u = new URL(location.href); u.searchParams.delete('boot'); u.searchParams.delete('fresh'); location.href = u.toString(); }
    if (act && act.dataset.act === 'reset') { var u2 = new URL(location.href); u2.searchParams.set('fresh', '1'); u2.searchParams.delete('boot'); location.href = u2.toString(); }
  });
  (function () { var sh = $('sheet'), sy = null; sh.querySelector('.grab').addEventListener('pointerdown', function (e) { sy = e.clientY; }); addEventListener('pointerup', function (e) { if (sy != null && e.clientY - sy > 40) sh.classList.remove('on'); sy = null; }); })();
  document.addEventListener('pointerdown', function (e) { if ($('sheet').classList.contains('on') && !e.target.closest('#sheet')) { $('sheet').classList.remove('on'); } }, true);

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
  function chimeable(host, circles, onHold) {   // touch a star to ring it; drag across for a run; hold (still) for the host's own job
    var last = null, hold = null, sx, sy, down = false;
    function hit(x, y) { var best = null, bd = 1e9; circles().forEach(function (c) { var r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); if (d < bd) { bd = d; best = c; } }); return bd < 22 ? best : null; }
    function play(c) { if (!c || c === last) return; last = c; ring(c); chime(c._f); tick(4); }
    host.addEventListener('pointerdown', function (e) { if (e.target.closest('.oz')) return; down = true; sx = e.clientX; sy = e.clientY; last = null; host.classList.add('touch'); try { host.setPointerCapture(e.pointerId); } catch (x) {} setTimeout(function () { play(hit(e.clientX, e.clientY)); }, 40); if (onHold) hold = setTimeout(function () { if (down) { onHold(); down = false; host.classList.remove('touch'); } }, 650); });
    host.addEventListener('pointermove', function (e) { if (!down) return; if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) clearTimeout(hold); play(hit(e.clientX, e.clientY)); });
    function up() { down = false; clearTimeout(hold); last = null; setTimeout(function () { host.classList.remove('touch'); }, 500); }
    host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
  }
  (function () { var cn = $('corner'); cn.querySelector('.oz').addEventListener('click', function (e) { e.stopPropagation(); back(); });
    chimeable(cn, function () { return P.ozcon ? Array.prototype.slice.call(cn.querySelectorAll('svg circle')) : []; }, function () { tick(10); back(); }); })();

  /* ——— boot (locked: pure black, the dot alone, F1). then the local constellation forms, oz rises, they settle ——— */
  var boot = $('boot'), bm = $('bootmark'), cam = bm.querySelector('.bm-cam'), f1 = $('f1'), dots = [];
  f1.innerHTML = '<path d="' + conPath() + '"/>';
  for (var i = 0; i < N; i++) { var p = archPt(i), c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', p[0].toFixed(2)); c.setAttribute('cy', p[1].toFixed(2)); c.setAttribute('r', i % 5 === 0 ? 1.5 : 1.2); f1.appendChild(c); dots.push(c); }
  var here = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); here.setAttribute('cx', 0); here.setAttribute('cy', 24); here.setAttribute('r', 1.8); f1.appendChild(here); here._f = LOW;
  KEY.forEach(function (i, k) { dots[i]._f = NOTES[k]; });
  if (!P.ozcon) here.style.display = 'none';
  function at(ms, f) { setTimeout(f, ms); }
  function centre() { bm.style.left = (innerWidth / 2) + 'px'; bm.style.top = (innerHeight * .46) + 'px'; }
  function arrive() { boot.classList.add('gone'); goHome(); $('corner').classList.add('on'); bm.style.transition = 'opacity .6s ease'; bm.style.opacity = 0; setTimeout(function () { boot.remove(); bm.remove(); }, 1200); }
  if (Q.get('boot') === '0') { boot.remove(); bm.remove(); $('corner').classList.add('on'); goHome(); }
  else {
    centre(); var ST = still();
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(function (t) { boot.addEventListener(t, function (e) { e.preventDefault(); e.stopPropagation(); }, { passive: false }); });
    if (P.ozcon) chimeable(boot, function () { return KEY.map(function (i) { return dots[i]; }).concat([here]).filter(function (d) { return d.classList.contains('key'); }); });
    if (!P.ozcon) {   // the plain-dot boot: the dot, F1, then the black opens
      at(200, function () { boot.classList.add('lit'); });
      at(3300, function () { dots.forEach(function (d, k) { setTimeout(function () { d.classList.add('lit'); }, k * 75); }); });
      at(3300 + N * 75 + 700, function () { bm.style.transition = 'opacity .9s ease'; bm.style.opacity = 0; setTimeout(arrive, 400); });
    } else {
    at(200, function () { boot.classList.add('lit'); });
    at(3300, function () { dots.forEach(function (d, k) { setTimeout(function () { d.classList.add('lit'); }, k * 75); }); });
    // the local constellation forms out of F1, as the camera drifts round it (oz viewer)
    at(5100, function () {
      dots.forEach(function (d, k) { d.classList.add(KEY.indexOf(k) >= 0 ? 'key' : 'drop'); if (KEY.indexOf(k) >= 0) d.setAttribute('r', 1.9); }); here.classList.add('key'); here.setAttribute('r', 2.4);
      f1.querySelector('path').classList.add('drawn');
      if (!ST) { cam.style.transition = 'transform 2.6s cubic-bezier(.3,0,.3,1)'; cam.style.transform = 'perspective(520px) rotateX(16deg) rotateY(-22deg) scale(1.14)'; }
    });
    at(6200, function () { $('bmOz').classList.add('up'); if (!ST) { cam.style.transition = 'transform 1.6s cubic-bezier(.3,0,.3,1)'; cam.style.transform = 'perspective(520px) rotateX(0deg) rotateY(0deg) scale(1.08)'; } });
    // they settle into the corner, and the black opens around them
    at(7900, function () {
      var r = $('corner').querySelector('svg').getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2, sc = r.width / 92;
      if (ST) { bm.style.transition = 'opacity .7s ease'; bm.style.opacity = 0; $('corner').classList.add('on'); setTimeout(arrive, 500); return; }
      bm.style.transition = 'left 1.2s cubic-bezier(.6,0,.25,1), top 1.2s cubic-bezier(.6,0,.25,1)'; bm.style.left = tx + 'px'; bm.style.top = ty + 'px';
      cam.style.transition = 'transform 1.2s cubic-bezier(.6,0,.25,1)'; cam.style.transform = 'scale(' + sc.toFixed(3) + ')';
      var oz = $('bmOz'); oz.style.transition = 'transform 1.2s cubic-bezier(.6,0,.25,1), opacity .9s'; oz.style.transform = 'translate(-56px, 0px) scale(1)';
      setTimeout(arrive, 1250);
    });
    }
  }
})();
