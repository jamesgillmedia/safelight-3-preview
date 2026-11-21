/* mini oz v2 · the same oz, for 6–13, growing into teen oz. example data only; everything stays on this device. */
(function () {
  'use strict';
  var $ = OZ.$, ic = OZ.ic, H = document.documentElement;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var Q = {}; (location.search || '').slice(1).split('&').forEach(function (p) { var i = p.indexOf('='); if (i > 0) Q[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); });
  if (Q.fresh) try { localStorage.removeItem('ozk2'); } catch (e) {}
  var S = { band: 'little', people: ['home', 'nan', 'sam', 'ali', 'coach'], bedtime: '19:30', msgs: 1, cam: 1, around: 1, nearby: 0, mode: 'play', red: 0, photos: [] };
  try { Object.assign(S, JSON.parse(localStorage.getItem('ozk2') || '{}')); } catch (e) {}
  if (Q.band === 'older' || Q.band === 'little') S.band = Q.band;
  function save() { try { localStorage.setItem('ozk2', JSON.stringify(S)); } catch (e) { S.photos = S.photos.slice(-4); } }
  var FAST = Q.fast ? 30 : 1;

  /* ——— home: labelled constellation, nearer = brighter ——— */
  var STARS = {
    little: [
      { id: 'sleep', label: 'sleep', x: .22, y: .12, z: .8 }, { id: 'outside', label: 'outside', x: .78, y: .1, z: .8 },
      { id: 'timer', label: 'timer', x: .5, y: .38, z: 1 }, { id: 'circle', label: 'friends', x: .18, y: .66, z: .9 },
      { id: 'camera', label: 'camera', x: .82, y: .66, z: .9 }, { id: 'ask', label: 'ask oz', x: .5, y: .88, z: .7 }
    ],
    older: [
      { id: 'sleep', label: 'sleep', x: .16, y: .08, z: .7 }, { id: 'timer', label: 'timer', x: .84, y: .08, z: .7 },
      { id: 'around', label: 'around you', x: .5, y: .3, z: 1 }, { id: 'circle', label: 'circle', x: .17, y: .56, z: .85 },
      { id: 'messages', label: 'messages', x: .83, y: .56, z: .85 }, { id: 'camera', label: 'camera', x: .3, y: .92, z: .65 },
      { id: 'ask', label: 'ask oz', x: .7, y: .92, z: .65 }
    ]
  };
  var LINES = { little: [[0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]], older: [[0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6], [5, 6]] };
  var MODES = { little: [['play', 'play'], ['wind', 'wind down'], ['sleep', 'sleep']], older: [['play', 'free'], ['homework', 'homework'], ['wind', 'wind down'], ['sleep', 'sleep']] };
  var SHOW = { play: null, homework: ['timer', 'ask', 'messages', 'around'], wind: ['sleep', 'timer', 'circle', 'messages', 'ask'], sleep: ['sleep', 'circle'] };
  var LINE = { play: 'everything is here', homework: 'only what helps with homework', wind: 'slowing down for bed', sleep: 'sleep, and a way to call home' };

  function bedtimeNow() { if (Q.bedtime === '1') return true; var d = new Date(), p = S.bedtime.split(':'), n = d.getHours() * 60 + d.getMinutes(); return n >= +p[0] * 60 + +p[1] || n < 390; }
  function tick() { var c = OZ.clock(); $('#anchor .clk').textContent = c.t; $('#anchor .dt').textContent = c.d; }
  function renderHome() {
    document.body.className = S.band;
    $$('#mid [data-band]').forEach(function (b) { b.classList.toggle('on', b.dataset.band === S.band); });
    var allow = SHOW[S.mode];
    var items = STARS[S.band].map(function (s) { return Object.assign({}, s, { dim: !!allow && allow.indexOf(s.id) < 0 }); });
    OZ.con($('#home'), items, LINES[S.band], open, { gap: S.band === 'little' ? 38 : 34 });
    renderDial();
    $('#modeLine').textContent = bedtimeNow() && S.mode !== 'sleep' ? 'past bedtime · turn the dial to sleep' : LINE[S.mode];
  }
  function renderDial() {
    var ms = MODES[S.band]; if (!ms.some(function (m) { return m[0] === S.mode; })) S.mode = 'play';
    var cx = 160, cy = 130, R = 84, RL = 112, a0 = Math.PI * .93, a1 = Math.PI * .07;
    var ang = ms.map(function (m, i) { return a0 + (a1 - a0) * i / (ms.length - 1); });
    var k = ang[ms.findIndex(function (m) { return m[0] === S.mode; })];
    $('#dialArc').innerHTML = '<path class="arc" d="M' + (cx + Math.cos(a0) * R) + ' ' + (cy - Math.sin(a0) * R) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + Math.cos(a1) * R) + ' ' + (cy - Math.sin(a1) * R) + '"/>' +
      ang.map(function (a) { return '<circle class="tk" r="1.6" cx="' + (cx + Math.cos(a) * R) + '" cy="' + (cy - Math.sin(a) * R) + '"/>'; }).join('') +
      '<circle class="knob" r="5" cx="' + (cx + Math.cos(k) * R) + '" cy="' + (cy - Math.sin(k) * R) + '"/>';
    var st = $('#stops'); st.innerHTML = '';
    ms.forEach(function (m, i) { var b = document.createElement('button'); b.textContent = m[1]; b.dataset.m = m[0]; b.className = m[0] === S.mode ? 'on' : '';
      b.style.left = (cx + Math.cos(ang[i]) * 150) + 'px'; b.style.top = (cy - Math.sin(ang[i]) * 104 + 4) + 'px';
      b.addEventListener('click', function (e) { e.stopPropagation(); setMode(m[0]); }); st.appendChild(b); });
  }
  (function () { var d = $('#dial'), on = false;
    function pick(e) { var r = d.getBoundingClientRect(), x = e.clientX - r.left - 160, y = 130 - (e.clientY - r.top), a = Math.atan2(Math.max(y, 1), x), ms = MODES[S.band];
      var i = Math.round(Math.min(1, Math.max(0, (Math.PI * .93 - a) / (Math.PI * .86))) * (ms.length - 1)); if (ms[i][0] !== S.mode) setMode(ms[i][0]); }
    d.addEventListener('pointerdown', function (e) { if (e.target.tagName === 'BUTTON') return; on = true; pick(e); });
    addEventListener('pointermove', function (e) { if (on) pick(e); }); addEventListener('pointerup', function () { on = false; });
  })();
  function setMode(m) { var was = S.mode; S.mode = m; if (m === 'sleep') setRed(1); else if (was === 'sleep') setRed(0); save(); renderHome(); try { navigator.vibrate && navigator.vibrate(6); } catch (e) {} }
  function setRed(v) { S.red = v ? 1 : 0; H.classList.toggle('red', !!S.red); save(); OZ.grid($('#grid')); }
  $('#disc').addEventListener('click', function () { setRed(!S.red); if (!$('#room').classList.contains('on')) renderHome(); });

  /* ——— rooms ——— */
  var cleanup = null, stack = [];
  function room(title, html, back) {
    if (cleanup) { cleanup(); cleanup = null; }
    $('#rT').textContent = title; $('#rB').innerHTML = html; $('#rB').scrollTop = 0; $('#room').classList.add('on'); H.classList.add('inroom');
    stack = back ? [back] : [];
  }
  function home() { if (cleanup) { cleanup(); cleanup = null; } $('#room').classList.remove('on'); H.classList.remove('inroom'); renderHome(); }
  $('#corner').addEventListener('click', function () {
    if ($('#mw').classList.contains('on')) return mwStop();
    if ($('#watch').classList.contains('on')) return setWatch(false);
    if (stack.length) return stack.pop()();
    home();
  });
  function rw(id, icon, t, sub, go) { return '<button class="rw" data-k="' + id + '">' + ic(icon) + '<span class="tx">' + t + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (go === false ? '' : '<span class="go">›</span>') + '</button>'; }
  function bind(sel, fn) { $$(sel, $('#rB')).forEach(function (b) { b.addEventListener('click', function () { fn(b.dataset.k, b); }); }); }
  function open(id) { ({ sleep: openSleep, timer: openTimer, outside: function () { openOutside(); }, camera: openCamera, circle: openCircle, messages: openMessages, ask: openAsk, around: openAround })[id](); }

  // sleep
  function openSleep() {
    room('sleep', rw('mw', 'night', 'moonwater', 'snow on moonlit water · lost in time, on loop') + rw('snow', 'sleep', 'snow', 'soft and quiet') +
      rw('rain', 'sleep', 'rain', 'steady rain on the roof') + rw('lake', 'sleep', 'lake', 'still water at night') +
      '<p class="fine">sound fades out after 30 minutes. turn it down by sliding your finger.</p>');
    bind('.rw', function (k) { if (k === 'mw') return moonwater(); location.href = 'sleep/?pair=' + (k === 'rain' ? 'roof' : k) + '&intensity=.35&timer=30&enter=1' + (S.red || bedtimeNow() ? '&red=1' : ''); });
  }
  /* moonwater: snow onto moonlit water, rings where flakes land; the song lost in time loops without a gap */
  var MW = null;
  function moonwater() {
    var w = $('#mw'), cv = $('canvas', w), x = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), W, Hh, hz, F = [], R = [], t0 = performance.now(), touch = null;
    function size() { W = innerWidth; Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); hz = Hh * .58; }
    size(); w.classList.add('on'); H.classList.add('inroom');
    for (var i = 0; i < 80; i++) F.push({ x: Math.random() * W, y: Math.random() * hz, z: .35 + Math.random() * .65, s: Math.random() * 6 });
    MW = { run: true, ac: null, g: null, srcs: [], timer: 0 };
    cv.onpointerdown = function (e) { touch = { x: e.clientX, y: e.clientY }; R.push({ x: e.clientX, y: Math.max(e.clientY, hz + 8), r: 2, a: .6 }); };
    cv.onpointermove = function (e) { if (touch) touch = { x: e.clientX, y: e.clientY }; }; cv.onpointerup = function () { touch = null; };
    // the song, gapless: decode once, schedule each pass to cross-fade into the next
    try {
      var ac = MW.ac = new (window.AudioContext || window.webkitAudioContext)(), g = MW.g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
      if (ac.resume) ac.resume(); g.gain.linearRampToValueAtTime(.8, ac.currentTime + 2.5);
      var unlock = new Audio(); unlock.setAttribute('playsinline', ''); unlock.muted = true; try { unlock.play().catch(function () {}); } catch (e) {}
      fetch('sleep/audio/lost-in-time.m4a').then(function (r) { return r.arrayBuffer(); }).then(function (b) { return new Promise(function (res, rej) { ac.decodeAudioData(b, res, rej); }); }).then(function (buf) {
        var XF = 2.5, next = ac.currentTime + .05;
        (function pass() { if (!MW || !MW.run) return; var s = ac.createBufferSource(), gg = ac.createGain(); s.buffer = buf; s.connect(gg); gg.connect(g);
          var d = buf.duration, xf = Math.min(XF, d / 4); gg.gain.setValueAtTime(0, next); gg.gain.linearRampToValueAtTime(1, next + xf); gg.gain.setValueAtTime(1, next + d - xf); gg.gain.linearRampToValueAtTime(0, next + d);
          s.start(next); MW.srcs.push(s); next = next + d - xf; MW.timer = setTimeout(pass, Math.max(200, (next - ac.currentTime - .4) * 1000)); })();
        MW.song = true; window.__mwSong = buf.duration;
      }).catch(function () { MW && (MW.song = false); });
    } catch (e) {}
    (function frame(now) {
      if (!MW || !MW.run) return; var t = (now - t0) / 1000, red = H.classList.contains('red');
      var sky = x.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#000'); sky.addColorStop(1, red ? '#120c0a' : '#0b1422'); x.fillStyle = sky; x.fillRect(0, 0, W, hz);
      var mx = W * .7, my = hz * .3, mc = red ? '103,97,90' : '232,228,220';
      var gl = x.createRadialGradient(mx, my, 4, mx, my, 110); gl.addColorStop(0, 'rgba(' + mc + ',.22)'); gl.addColorStop(1, 'rgba(' + mc + ',0)'); x.fillStyle = gl; x.fillRect(0, 0, W, hz);
      x.fillStyle = 'rgba(' + mc + ',.92)'; x.beginPath(); x.arc(mx, my, 13, 0, 7); x.fill(); x.fillStyle = red ? '#120c0a' : '#08101c'; x.beginPath(); x.arc(mx - 5.2, my - 2.6, 12.6, 0, 7); x.fill();
      var wa = x.createLinearGradient(0, hz, 0, Hh); wa.addColorStop(0, red ? '#0c0807' : '#070d17'); wa.addColorStop(1, '#000'); x.fillStyle = wa; x.fillRect(0, hz, W, Hh - hz);
      x.fillStyle = 'rgba(' + mc + ',.16)'; x.fillRect(0, hz, W, .6);
      for (var y = hz + 4; y < Hh; y += 7) { var k = (y - hz) / (Hh - hz), ww = 10 + k * 60, off = Math.sin(t * 1.2 + y * .09) * (3 + k * 9);
        x.fillStyle = 'rgba(' + mc + ',' + (.16 * (1 - k * .85)).toFixed(3) + ')'; x.fillRect(mx - ww / 2 + off, y, ww * (.5 + .5 * Math.sin(y * .3 + t * 2)), 1.2); }
      F.forEach(function (f) { f.y += (16 + f.z * 22) / 60; f.x += Math.sin(t * .6 + f.s) * .22 * f.z;
        if (touch) { var dx = f.x - touch.x, dy = f.y - touch.y, dd = dx * dx + dy * dy; if (dd < 9000) { f.x += dx / Math.sqrt(dd + 1) * 2; f.y += dy / Math.sqrt(dd + 1); } }
        if (f.y > hz + 10 + f.s * (Hh - hz - 30) / 6) { R.push({ x: f.x, y: f.y, r: 1, a: .4 * f.z }); f.y = -5; f.x = Math.random() * W; }
        x.fillStyle = 'rgba(' + mc + ',' + (.35 + f.z * .5).toFixed(2) + ')'; x.beginPath(); x.arc(f.x, f.y, .6 + f.z * 1.3, 0, 7); x.fill(); });
      for (var j = R.length - 1; j >= 0; j--) { var r = R[j]; r.r += .4; r.a *= .975; x.strokeStyle = 'rgba(' + mc + ',' + r.a.toFixed(3) + ')'; x.lineWidth = .8; x.beginPath(); x.ellipse(r.x, r.y, r.r, r.r * .28, 0, 0, 7); x.stroke(); if (r.a < .02) R.splice(j, 1); }
      requestAnimationFrame(frame);
    })(t0);
  }
  function mwStop() { var m = MW; MW = null; $('#mw').classList.remove('on'); if (!m) return; m.run = false; clearTimeout(m.timer);
    try { m.g.gain.cancelScheduledValues(m.ac.currentTime); m.g.gain.setTargetAtTime(0, m.ac.currentTime, .2); setTimeout(function () { m.srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); m.ac.close(); }, 900); } catch (e) {}
    if (!$('#room').classList.contains('on')) H.classList.remove('inroom'); }
  $$('#mw .mwbar button').forEach(function (b) { b.addEventListener('click', function () { $$('#mw .mwbar button').forEach(function (z) { z.classList.toggle('on', z === b); }); OZ.toast(b.dataset.m === '0' ? 'staying on' : 'fades out in ' + b.dataset.m + ' minutes'); }); });

  // timer: routines
  var ROUT = [{ id: 'bed', w: 'bedtime', m: 15, steps: ['teeth', 'pyjamas', 'story'] }, { id: 'hw', w: 'homework', m: 20, steps: ['start', 'water', 'check'] }, { id: 'tidy', w: 'tidy up', m: 10, steps: ['toys', 'shoes', 'bag'] }];
  function openTimer() {
    room('timer', ROUT.map(function (r) { return rw(r.id, 'timer', r.w, r.m + ' minutes · ' + r.steps.join(', ')); }).join('') +
      (S.band === 'older' ? '<p class="h4 lbl">just time</p><div class="seg">' + [5, 25, 45].map(function (m) { return '<button data-min="' + m + '">' + m + ' min</button>'; }).join('') + '</div>' : ''));
    bind('.rw', function (k) { runTimer(ROUT.filter(function (r) { return r.id === k; })[0]); });
    $$('[data-min]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { runTimer({ w: b.dataset.min + ' minutes', m: +b.dataset.min, steps: [] }); }); });
  }
  function runTimer(r) {
    room(r.w, '<div class="dring">' + OZ.dring(1) + '<div class="tt"><span id="tl"></span><small id="tw">minutes</small></div></div>' +
      (r.steps.length ? '<div class="steps">' + r.steps.map(function (s) { return '<button><i></i>' + s + '</button>'; }).join('') + '</div><p class="fine ctr">tap each one when it’s done</p>' : '') +
      '<div class="acts"><button class="act" id="tp">pause</button></div>', openTimer);
    var total = r.m * 60000, st = performance.now(), paused = 0, pAt = 0, run = true;
    $$('.steps button', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('done'); if ($$('.steps .done', $('#rB')).length === r.steps.length) OZ.toast('all done'); }); });
    $('#tp').addEventListener('click', function () { if (pAt) { paused += performance.now() - pAt; pAt = 0; this.textContent = 'pause'; } else { pAt = performance.now(); this.textContent = 'go on'; } });
    (function f(now) { if (!run) return; var left = Math.max(0, total - ((pAt || now) - st - paused) * FAST), sv = $('#rB .dring svg'); if (!sv) return;
      OZ.dset(sv, left / total); $('#tl').textContent = left > 60000 ? Math.ceil(left / 60000) : Math.ceil(left / 1000); $('#tw').textContent = left > 60000 ? 'minutes left' : 'seconds';
      if (left <= 0) { OZ.toast('time’s up'); return; } requestAnimationFrame(f); })(st);
    cleanup = function () { run = false; };
  }

  // good weather: is it a good day to go out (example data)
  var WX = {
    sunny: { y: 'yes, a good day to go out', s: 'clear until 4 · golden hour 4:41', wear: 'a light jacket', t: 14 },
    rain: { y: 'not yet', s: 'rain stops around 3', wear: 'raincoat and boots', t: 9 },
    cold: { y: 'yes, wrap up warm', s: 'cold and dry', wear: 'big coat, gloves, hat', t: 1 },
    dark: { y: 'it’s dark now', s: 'try again in the morning · sunrise 7:52', wear: 'stay in and rest', t: 4 }
  };
  function wxNow() { var h = new Date().getHours(); return Q.wx || (h >= 17 || h < 7 ? 'dark' : 'sunny'); }
  function horizon() { return '<svg class="horizon" viewBox="0 0 120 70"><path d="M8 52h104M36 52a24 24 0 0 1 48 0M60 14v8M33 25l5 5M87 25l-5 5M44 62h32"/></svg>'; }
  function openOutside(k, back) {
    k = k || wxNow(); var w = WX[k];
    room(S.band === 'little' ? 'outside' : 'good day to go out', '<div class="ctr">' + horizon() + '<p class="big">' + w.y + '</p><p class="fine" style="margin-top:4px">' + w.s + (S.band === 'older' ? ' · ' + w.t + '°' : '') + '</p></div>' +
      rw('wear', 'outside', 'wear', w.wear, false) + '<p class="h4 lbl">example weather · try</p><div class="seg">' + Object.keys(WX).map(function (x) { return '<button data-wx="' + x + '"' + (x === k ? ' class="on"' : '') + '>' + x + '</button>'; }).join('') + '</div>', back);
    $$('[data-wx]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { openOutside(b.dataset.wx, back); }); });
  }

  /* around you (10–13): daytime, approved places, a grown-up decides how far. example data */
  var PLACES = [
    { id: 'p1', label: 'maple park', sub: '6 min walk', icon: 'park', x: .3, y: .3, z: .95, d: 'swings, a pond, the long slide. open till dusk.' },
    { id: 'p2', label: 'river trail', sub: 'with a grown-up', icon: 'trail', x: .8, y: .2, z: .7, d: 'flat 2 km loop by the water. good for bikes.' },
    { id: 'p3', label: 'makers’ club', sub: 'library · sat 10', icon: 'studio', x: .78, y: .66, z: .85, d: 'build, draw, code. free, drop in.' },
    { id: 'p4', label: 'clay class', sub: 'studio · sun 2', icon: 'studio', x: .2, y: .74, z: .75, d: 'kids’ class, 90 minutes. a grown-up books it.' },
    { id: 'p5', label: 'sam', sub: 'at maple park', icon: 'dot', x: .5, y: .08, z: .6, d: 'sam’s grown-up shared this for today only.', friend: 1 }
  ];
  function openAround() {
    var w = WX[wxNow()];
    room('around you', '<p class="fine ctr" style="margin:0">' + w.y + ' · ' + w.s.split(' · ')[0] + '</p><div class="rcon"><div class="con" id="acon"></div></div>' +
      rw('wx', 'outside', 'good day to go out?', w.y) +
      '<p class="fine">only places your grown-ups said yes to. your location stays on this phone.<br>at 14, more opens with your grown-ups: evenings, plans with friends, and friends nearby.</p>');
    var items = [{ id: 'you', label: 'you', icon: 'you', x: .5, y: .5, z: 1, cur: true }].concat(PLACES.filter(function (p) { return !p.friend || S.nearby; }));
    OZ.con($('#acon'), items, items.slice(1).map(function (p, i) { return [0, i + 1]; }), function (id) { if (id !== 'you') place(id); }, { gap: 34, rings: [[.5, .5, 70], [.5, .5, 140]] });
    bind('.rw', function () { openOutside(null, openAround); });
  }
  function place(id) { var p = PLACES.filter(function (x) { return x.id === id; })[0];
    room(p.label, '<div class="ctr">' + '<p class="big">' + p.label + '</p><p class="fine" style="margin-top:2px">' + p.sub + '</p></div><p class="fine ctr">' + p.d + '</p>' +
      '<div class="acts"><button class="act" id="ask1">ask to go</button></div><p class="fine ctr">sends a note to home. nothing is shared anywhere else.</p>', openAround);
    $('#ask1').addEventListener('click', function () { OZ.toast('asked home · ' + p.label); }); }

  // camera: keep only
  function openCamera() {
    if (!S.cam) return room('camera', '<p class="fine ctr">a grown-up has the camera off right now.</p>');
    room('camera', '<div class="cam"><video playsinline muted autoplay></video><canvas hidden></canvas><div class="fl"></div></div><button class="shutter" aria-label="take a photo"></button><div class="roll"></div><p class="fine ctr">photos stay on this phone. no sending, no posting.</p>');
    var v = $('#rB video'), fake = $('#rB canvas'), stream = null, run = true;
    function roll() { $('#rB .roll').innerHTML = S.photos.slice().reverse().map(function (p) { return '<img src="' + p + '" alt="">'; }).join(''); } roll();
    function fakeCam() { v.hidden = true; fake.hidden = false; var c = fake.getContext('2d'); fake.width = 360; fake.height = 440; var t0 = performance.now();
      (function f(now) { if (!run) return; var t = (now - t0) / 1000, g = c.createLinearGradient(0, 0, 0, 440); g.addColorStop(0, '#16202c'); g.addColorStop(1, '#05080c'); c.fillStyle = g; c.fillRect(0, 0, 360, 440);
        c.fillStyle = '#DDBC89'; c.beginPath(); c.arc(180 + Math.sin(t * .5) * 50, 170, 30, 0, 7); c.fill(); c.fillStyle = '#0a0f0c'; c.beginPath(); c.moveTo(0, 440); c.lineTo(0, 330); c.quadraticCurveTo(180, 280 + Math.sin(t) * 6, 360, 340); c.lineTo(360, 440); c.fill(); requestAnimationFrame(f); })(t0); }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !Q.nocam) navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) { if (!run) return s.getTracks().forEach(function (t) { t.stop(); }); stream = s; v.srcObject = s; }).catch(fakeCam); else fakeCam();
    $('#rB .shutter').addEventListener('click', function () { var src = fake.hidden ? v : fake, c = document.createElement('canvas'), sw = src.videoWidth || src.width, sh = src.videoHeight || src.height; if (!sw) return;
      c.width = 200; c.height = Math.round(200 * sh / sw); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); S.photos.push(c.toDataURL('image/jpeg', .6)); S.photos = S.photos.slice(-12); save(); roll();
      var fl = $('#rB .fl'); fl.style.transition = 'none'; fl.style.opacity = .35; requestAnimationFrame(function () { fl.style.transition = 'opacity .5s'; fl.style.opacity = 0; }); OZ.toast('kept on this phone'); });
    cleanup = function () { run = false; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); };
  }

  // circle: approved stars only
  function openCircle() {
    room(S.band === 'little' ? 'friends' : 'circle', '<div class="rcon"><div class="con" id="ccon"></div></div><p class="fine ctr">only people your grown-ups added.<br>want someone new? ask a grown-up.</p>');
    var n = S.people.length, items = [{ id: '_you', label: 'you', icon: 'you', x: .5, y: .5, z: 1 }].concat(S.people.map(function (p, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return { id: p, label: p, icon: p === 'home' ? 'home' : 'dot', x: .5 + Math.cos(a) * .34, y: .5 + Math.sin(a) * .36, z: p === 'home' ? 1 : .8 }; }));
    OZ.con($('#ccon'), items, items.slice(1).map(function (p, i) { return [0, i + 1]; }), function (id) { if (id !== '_you') person(id); }, { gap: 32 });
  }
  function person(p) {
    var acts = [['call', 'call'], ['voice', 'voice note'], ['picture', 'a photo']]; if (S.band === 'older') acts.push(['write', 'write']);
    room(p, acts.map(function (a) { return rw(a[0], a[0], a[1], a[0] === 'call' ? 'rings ' + p : a[0] === 'picture' ? 'from your photos' : '', false); }).join('') +
      '<p class="h4 lbl">or send a star</p><div class="seg"><button data-s="1">★ a star</button><button data-s="2">thinking of you</button><button data-s="3">home soon</button></div>', openCircle);
    bind('.rw', function (k) { if (!S.msgs && k !== 'call') return OZ.toast('messages are off right now'); if (k === 'write') return thread(p, function () { person(p); }); OZ.toast(k === 'call' ? 'calling ' + p + '…' : k === 'voice' ? 'hold to talk · sends to ' + p : S.photos.length ? 'pick a photo for ' + p : 'take a photo first'); });
    $$('[data-s]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { OZ.toast('sent to ' + p); }); });
  }
  var TH = { home: [['them', 'dinner at 6'], ['me', 'ok'], ['vme', '']], sam: [['them', 'football tomorrow?'], ['me', 'yes after school']], nan: [['them', 'love you, sleep well']] };
  var WV = '<svg viewBox="0 0 120 20"><path d="M0 10 Q6 2 12 10 T24 10 T36 10 Q42 0 48 10 T60 10 T72 10 Q78 4 84 10 T96 10 T120 10"/></svg>';
  function bub(m) { return m[0] === 'vme' ? '<p class="me wv">' + WV + '</p>' : '<p class="' + (m[0] === 'me' ? 'me' : '') + '">' + m[1] + '</p>'; }
  function openMessages() {
    if (!S.msgs) return room('messages', '<p class="fine ctr">a grown-up has messages off right now.</p>');
    room('messages', '<div class="held">someone new tried to say hi · a grown-up will check first</div>' + S.people.map(function (p) { var t = TH[p], l = t ? t[t.length - 1] : null; return rw(p, p === 'home' ? 'home' : 'messages', p, l ? (l[0] === 'vme' ? 'voice note' : l[1]) : 'say hi'); }).join('') + '<p class="fine">only people your grown-ups added. no strangers, no search.</p>');
    bind('.rw', function (k) { thread(k, openMessages); });
  }
  function thread(p, back) {
    var t = TH[p] = TH[p] || [];
    room(p, '<div class="log">' + t.map(bub).join('') + '</div><div class="seg"><button data-q="★">★</button><button data-q="ok">ok</button><button data-q="on my way">on my way</button></div><div class="line-in"><button aria-label="voice" id="tv">voice</button><input placeholder="write to ' + p + '" enterkeyhint="send"><button id="ts">send</button></div>', back);
    function add(m) { t.push(m); $('#rB .log').insertAdjacentHTML('beforeend', bub(m)); }
    var inp = $('#rB input'); function send() { var v = inp.value.trim(); if (v) { add(['me', v.replace(/[<>]/g, '')]); inp.value = ''; } }
    $('#ts').addEventListener('click', send); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); }); $('#tv').addEventListener('click', function () { add(['vme', '']); });
    $$('[data-q]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { add(['me', b.dataset.q]); }); });
  }

  // ask oz: kid-safe only
  var FAQ = [
    { q: 'how long till bedtime?', k: ['bed', 'sleep'], a: function () { return 'bedtime is ' + S.bedtime + '. turn the dial to wind down when it’s close.'; } },
    { q: 'is it a good day to go out?', k: ['outside', 'weather', 'rain', 'sun', 'out'], a: function () { return WX[wxNow()].y + '. ' + WX[wxNow()].s + '.'; } },
    { q: 'how do I call home?', k: ['call', 'home', 'phone'], a: function () { return 'tap ' + (S.band === 'little' ? 'friends' : 'circle') + ', then home, then call.'; } },
    { q: 'why is the sky dark at night?', k: ['dark', 'night', 'sky'], a: function () { return 'our side of the earth turns away from the sun. the other side is having its day.'; } },
    { q: 'what does the red dot do?', k: ['red', 'dot'], a: function () { return 'it makes everything dim and warm, kinder to sleepy eyes. it turns mint when it’s on.'; } }
  ];
  function openAsk() {
    room('ask · oz', '<div class="log" id="alog"><p>ask me something. if I don’t know, a grown-up will help.</p></div>' + (S.band === 'older' ? '<div class="line-in"><input placeholder="ask oz" enterkeyhint="send"><button id="as">ask</button></div>' : '') +
      FAQ.map(function (f, i) { return rw('f' + i, 'ask', f.q, '', false); }).join(''));
    function say(q, a) { $('#alog').insertAdjacentHTML('beforeend', '<p class="me">' + q + '</p><p>' + a + '</p>'); }
    bind('.rw', function (k) { var f = FAQ[+k.slice(1)]; say(f.q, f.a()); });
    var inp = $('#rB input'); if (inp) { var go = function () { var v = inp.value.trim(); if (!v) return; var l = v.toLowerCase(), hit = FAQ.filter(function (f) { return f.k.some(function (k) { return l.indexOf(k) >= 0; }); })[0]; say(v.replace(/[<>]/g, ''), hit ? hit.a() : 'that’s a good one for a grown-up. ask home?'); inp.value = ''; };
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); $('#as').addEventListener('click', go); }
  }

  /* ——— grown-ups: hold the moon, a quick check, then the controls and the grows-with-you ladder ——— */
  (function () { var m = $('#moon'), t = null;
    m.addEventListener('pointerdown', function (e) { e.preventDefault(); m.classList.add('hold'); t = setTimeout(function () { m.classList.remove('hold'); check(); }, 1600); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { m.addEventListener(ev, function () { m.classList.remove('hold'); clearTimeout(t); }); });
    m.addEventListener('click', function () { if (!$('#room').classList.contains('on')) OZ.toast('grown-ups: hold the moon'); });
  })();
  function check() {
    var a = 6 + Math.floor(Math.random() * 4), b = 7 + Math.floor(Math.random() * 3), v = '';
    room('grown-ups', '<p class="fine ctr" style="margin:0">a quick check for a grown-up</p><p class="q">' + a + ' × ' + b + ' = <span id="pv">?</span></p><div class="pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '‹'].map(function (n) { return '<button data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>');
    $$('.pad button', $('#rB')).forEach(function (bt) { bt.addEventListener('click', function () { var n = bt.dataset.n; if (n === '') return; v = n === '‹' ? v.slice(0, -1) : (v + n).slice(0, 3); $('#pv').textContent = v || '?';
      if (+v === a * b) setTimeout(parents, 250); else if (v.length >= String(a * b).length) { OZ.toast('not quite'); v = ''; setTimeout(function () { $('#pv').textContent = '?'; }, 400); } }); });
  }
  function parents() {
    function tg(k, t, sub) { return '<button class="rw" data-t="' + k + '"><span class="tx">' + t + '<small>' + sub + '</small></span><i class="sw' + (S[k] ? ' on' : '') + '"></i></button>'; }
    var bands = [['little', '6–9', 'home, sleep, timer, outside, friends you add, kid-safe ask'], ['older', '10–13', '+ around you in the daytime, messages to your list, homework mode'], ['teen', '14–17', 'teen oz: tonight around you, plans that fade, friends nearby by choice']];
    room('grown-ups', '<p class="h4 lbl" style="margin-top:0">approved people</p>' + S.people.map(function (p) { return '<div class="rw">' + ic(p === 'home' ? 'home' : 'circle') + '<span class="tx">' + p + '</span><button data-rm="' + p + '" style="min-height:44px;color:var(--mid)">remove</button></div>'; }).join('') +
      '<div class="line-in"><input id="addp" placeholder="add a name"><button id="addb">add</button></div>' +
      '<p class="h4 lbl">quiet hours from</p><div class="seg">' + ['19:00', '19:30', '20:30', '21:00'].map(function (t) { return '<button data-bt="' + t + '"' + (t === S.bedtime ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
      '<p class="h4 lbl">what’s on</p>' + tg('msgs', 'messages', 'to approved people only') + tg('cam', 'camera', 'photos stay on this phone') + tg('around', 'around you', 'approved places, daytime · 10–13') + tg('nearby', 'friends nearby', 'only when their grown-ups share too · off by default') +
      '<p class="h4 lbl">grows with you</p><div class="ladder">' + bands.map(function (b) { return '<button class="rw' + (b[0] === S.band ? ' now' : '') + '" data-pb="' + b[0] + '"><span class="st">' + b[1] + '</span><span class="tx"><b>' + (b[0] === S.band ? 'now' : b[0] === 'teen' ? 'next' : '') + '</b><small>' + b[2] + '</small></span></button>'; }).join('') + '</div>' +
      '<p class="fine">each step opens by age and by your trust, one switch at a time. no ads. no feeds. no tracking. no accounts. everything stays on this device.</p>');
    $$('[data-rm]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { S.people = S.people.filter(function (p) { return p !== b.dataset.rm; }); save(); parents(); }); });
    $('#addb').addEventListener('click', function () { var v = $('#addp').value.trim().toLowerCase().replace(/[<>"]/g, '').slice(0, 16); if (v) { S.people.push(v); save(); parents(); } });
    $$('[data-bt]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { S.bedtime = b.dataset.bt; save(); parents(); }); });
    $$('[data-t]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.t; S[k] = S[k] ? 0 : 1; save(); $('.sw', b).classList.toggle('on', !!S[k]); }); });
    $$('[data-pb]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.pb === 'teen') return goTeen(); S.band = b.dataset.pb; save(); parents(); }); });
  }
  function goTeen() { location.href = '../oz-teen/?from=kids'; }

  /* ——— watch-only kid ——— */
  var wi = 0;
  function renderWatch() {
    var c = OZ.clock();
    $('#wpages').innerHTML = '<div class="wp"><div class="wt">' + c.t + '</div><div class="ws lbl">bedtime ' + S.bedtime + '</div></div>' +
      '<div class="wp"><div class="dring">' + OZ.dring(1) + '<div class="tt" id="wtl">15</div></div><button class="wb" id="wgo">bedtime</button></div>' +
      '<div class="wp"><div class="ws lbl">call home</div><div class="wst">' + S.people.slice(0, 3).map(function (p) { return '<button data-wc="' + p + '"><i></i>' + p + '</button>'; }).join('') + '</div></div>' +
      '<div class="wp"><svg viewBox="-40 -40 80 80" style="width:56px;height:56px;color:var(--moon)"><circle r="11" fill="currentColor" mask="url(#mm)"/></svg><button class="wb" id="wsl">moonwater</button></div>';
    $('#wdots').innerHTML = [0, 1, 2, 3].map(function (i) { return '<button data-wi="' + i + '" aria-label="page ' + (i + 1) + '"></button>'; }).join('');
    $$('#wdots button').forEach(function (b) { b.addEventListener('click', function () { wgo(+b.dataset.wi); }); });
    $$('[data-wc]').forEach(function (b) { b.addEventListener('click', function () { OZ.toast('calling ' + b.dataset.wc + '…'); }); });
    $('#wgo').addEventListener('click', function () { var st = performance.now(), tot = 900000; this.textContent = 'going'; (function f(n) { var l = Math.max(0, tot - (n - st) * FAST * 4), sv = $('#wpages .dring svg'); if (!sv || !$('#watch').classList.contains('on')) return; OZ.dset(sv, l / tot); $('#wtl').textContent = Math.ceil(l / 60000); if (l > 0) requestAnimationFrame(f); })(st); });
    $('#wsl').addEventListener('click', function () { OZ.toast('moonwater · fades in 30 min'); });
    wgo(wi);
  }
  function wgo(i) { wi = Math.max(0, Math.min(3, i)); $('#wpages').style.transform = 'translateX(' + (-196 * wi) + 'px)'; $$('#wdots button').forEach(function (b, j) { b.classList.toggle('on', j === wi); }); }
  (function () { var f = $('#watch .wface'), x0 = null; f.addEventListener('pointerdown', function (e) { x0 = e.clientX; }); f.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 30) wgo(wi + (dx < 0 ? 1 : -1)); }); })();
  function setWatch(on) { $('#watch').classList.toggle('on', on); $('[data-watch]').classList.toggle('on', on); H.classList.toggle('inroom', on || $('#room').classList.contains('on')); if (on) renderWatch(); }

  $$('#mid [data-band]').forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.band === 'teen') return goTeen(); setWatch(false); S.band = b.dataset.band; save(); if ($('#room').classList.contains('on')) home(); else renderHome(); }); });
  $('[data-watch]').addEventListener('click', function () { setWatch(!$('#watch').classList.contains('on')); });

  $('#corner .oc').innerHTML = OZ.OZC;
  OZ.D.vp = [.5, .3];
  if (S.red || Q.bedtime === '1') H.classList.add('red'), S.red = 1;
  if (Q.mode) S.mode = Q.mode;
  tick(); setInterval(tick, 15000); renderHome(); OZ.drift($('#grid'));
  addEventListener('resize', function () { if (!$('#room').classList.contains('on')) renderHome(); });
  if (Q.watch === '1') setWatch(true);
  if (Q.open) open(Q.open);
})();
