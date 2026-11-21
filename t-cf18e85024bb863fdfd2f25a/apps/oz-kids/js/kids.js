(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var Q = {}; (location.search || '').slice(1).split('&').forEach(function (p) { var i = p.indexOf('='); if (i > 0) Q[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); });
  if (Q.fresh) try { localStorage.removeItem('ozk'); } catch (e) {}
  var S = { band: 'little', people: ['Home', 'Nan', 'Sam', 'Ali', 'Coach'], bedtime: '19:30', msgs: 1, cam: 1, mode: 'play', red: 0, photos: [] };
  try { Object.assign(S, JSON.parse(localStorage.getItem('ozk') || '{}')); } catch (e) {}
  if (Q.band) S.band = Q.band === 'older' ? 'older' : 'little';
  function save() { try { localStorage.setItem('ozk', JSON.stringify(S)); } catch (e) { S.photos = S.photos.slice(-4); } }
  var FAST = Q.fast ? 30 : 1;

  var IC = {
    sleep: '<path d="M19 4a9 9 0 1 0 5 15A8 8 0 0 1 19 4z"/><path d="M6 6h3l-3 3h3"/>',
    timer: '<circle cx="14" cy="15" r="9"/><path d="M14 15V10M11 3h6"/>',
    outside: '<circle cx="14" cy="14" r="5"/><path d="M14 3v2M14 23v2M3 14h2M23 14h2M6 6l1.5 1.5M20.5 20.5 22 22M6 22l1.5-1.5M20.5 7.5 22 6"/>',
    camera: '<rect x="3" y="8" width="22" height="15" rx="4"/><circle cx="14" cy="15.5" r="4.5"/><path d="M10 8l2-3h4l2 3"/>',
    circle: '<circle cx="14" cy="6" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="23" cy="19" r="2.5"/><path d="M12.6 8.2 6.3 17M15.4 8.2l6.3 8.8M7.5 19h13"/>',
    messages: '<path d="M4 6h20v13H11l-5 4v-4H4z"/>',
    ask: '<circle cx="14" cy="14" r="10"/><path d="M11 11a3 3 0 1 1 4 2.8c-.7.3-1 .8-1 1.5V16M14 19.5v.5"/>',
    call: '<path d="M7 4h4l2 5-3 2a12 12 0 0 0 7 7l2-3 5 2v4a2 2 0 0 1-2 2A19 19 0 0 1 5 6a2 2 0 0 1 2-2z"/>',
    voice: '<rect x="10" y="3" width="8" height="14" rx="4"/><path d="M6 13a8 8 0 0 0 16 0M14 21v4"/>',
    picture: '<rect x="3" y="5" width="22" height="18" rx="3"/><circle cx="10" cy="11" r="2"/><path d="M3 20l7-6 5 4 4-3 6 5"/>',
    write: '<path d="M5 22l1-5L18 5l4 4L10 21z"/>',
    send: '<path d="M4 14 24 5l-6 19-4-8z"/>'
  };
  function ic(k) { return '<svg viewBox="0 0 28 28">' + IC[k] + '</svg>'; }

  var STARS = {
    little: [
      { id: 'sleep', w: 'sleep', x: .2, y: .1 }, { id: 'outside', w: 'outside', x: .74, y: .06 },
      { id: 'timer', w: 'timer', x: .5, y: .4 }, { id: 'camera', w: 'camera', x: .82, y: .62 },
      { id: 'circle', w: 'friends', x: .2, y: .66 }, { id: 'ask', w: 'ask oz', x: .5, y: .96 }
    ],
    older: [
      { id: 'sleep', w: 'sleep', x: .17, y: .08 }, { id: 'outside', w: 'outside', x: .52, y: .02 },
      { id: 'timer', w: 'timer', x: .84, y: .2 }, { id: 'messages', w: 'messages', x: .58, y: .48 },
      { id: 'circle', w: 'circle', x: .18, y: .5 }, { id: 'camera', w: 'camera', x: .84, y: .76 },
      { id: 'ask', w: 'ask oz', x: .38, y: .94 }
    ]
  };
  var MODES = {
    little: [{ id: 'play', w: 'play' }, { id: 'wind', w: 'wind down' }, { id: 'sleep', w: 'sleep' }],
    older: [{ id: 'play', w: 'free' }, { id: 'homework', w: 'homework' }, { id: 'wind', w: 'wind down' }, { id: 'sleep', w: 'sleep' }]
  };
  var SHOW = {
    play: null,
    homework: ['timer', 'ask', 'messages', 'outside'],
    wind: ['sleep', 'timer', 'circle', 'messages', 'ask'],
    sleep: ['sleep', 'circle']
  };
  var LINE = { play: 'everything is on', homework: 'just what helps with homework', wind: 'slowing down for bed', sleep: 'only sleep and call home' };

  // ---------- home ----------
  function bedtimeNow() {
    if (Q.bedtime === '1') return true;
    var d = new Date(), p = S.bedtime.split(':'), b = +p[0] * 60 + +p[1], n = d.getHours() * 60 + d.getMinutes();
    return n >= b || n < 6 * 60 + 30;
  }
  function tick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    $('#clock').textContent = ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m;
    $('#greet').textContent = h < 12 ? 'good morning' : h < 18 ? 'good afternoon' : 'good evening';
  }
  function renderHome() {
    document.body.className = S.band;
    $$('#proto [data-band]').forEach(function (b) { b.classList.toggle('on', b.dataset.band === S.band); });
    var con = $('#con'), list = STARS[S.band];
    $$('.star', con).forEach(function (n) { n.remove(); });
    var svg = $('#lines'), r = con.getBoundingClientRect(), lh = '';
    list.forEach(function (s, i) {
      var b = document.createElement('button');
      b.className = 'star'; b.dataset.id = s.id; b.style.left = (s.x * 100) + '%'; b.style.top = (s.y * 100) + '%';
      b.style.setProperty('--d', (i * .7) + 's');
      b.innerHTML = '<span class="dot">' + ic(s.id) + '</span><b>' + s.w + '</b>';
      b.addEventListener('click', function () { open(s.id); });
      con.appendChild(b);
      if (i) { var p = list[i - 1]; lh += '<line x1="' + p.x * r.width + '" y1="' + p.y * r.height + '" x2="' + s.x * r.width + '" y2="' + s.y * r.height + '"/>'; }
    });
    svg.innerHTML = lh;
    renderDial(); applyMode();
  }
  function renderDial() {
    var ms = MODES[S.band]; if (!ms.some(function (m) { return m.id === S.mode; })) S.mode = 'play';
    var cx = 160, cy = 150, R = 92, RL = 128, a0 = Math.PI * .95, a1 = Math.PI * .05, st = $('#stops'), arc = $('#dialArc');
    var ang = ms.map(function (m, i) { return a0 + (a1 - a0) * (i / (ms.length - 1)); });
    var pos = ang.map(function (a) { return { x: cx + Math.cos(a) * RL, y: cy - Math.sin(a) * RL }; });
    var ca = ang[ms.findIndex(function (m) { return m.id === S.mode; })], kx = cx + Math.cos(ca) * R, ky = cy - Math.sin(ca) * R;
    arc.innerHTML = '<path class="arc" d="M' + (cx + Math.cos(a0) * R) + ' ' + (cy - Math.sin(a0) * R) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + Math.cos(a1) * R) + ' ' + (cy - Math.sin(a1) * R) + '"/>' +
      ang.map(function (a) { return '<circle r="2.5" fill="rgba(232,228,220,.35)" cx="' + (cx + Math.cos(a) * R) + '" cy="' + (cy - Math.sin(a) * R) + '"/>'; }).join('') +
      '<circle class="glow" r="22" cx="' + kx + '" cy="' + ky + '"/><circle class="knob" r="8" cx="' + kx + '" cy="' + ky + '"/>';
    st.innerHTML = '';
    ms.forEach(function (m, i) {
      var b = document.createElement('button'); b.textContent = m.w; b.dataset.m = m.id;
      b.style.left = pos[i].x + 'px'; b.style.top = pos[i].y + 'px'; b.className = m.id === S.mode ? 'on' : '';
      b.addEventListener('click', function () { setMode(m.id); });
      st.appendChild(b);
    });
  }
  // drag along the dial
  (function () {
    var d = $('#dial'), on = false;
    function pick(e) {
      var r = d.getBoundingClientRect(), x = e.clientX - r.left - 160, y = 150 - (e.clientY - r.top);
      var a = Math.atan2(Math.max(y, 1), x), ms = MODES[S.band], t = (Math.PI * .95 - a) / (Math.PI * .9);
      var i = Math.round(Math.min(1, Math.max(0, t)) * (ms.length - 1));
      if (ms[i].id !== S.mode) setMode(ms[i].id);
    }
    d.addEventListener('pointerdown', function (e) { on = true; pick(e); });
    window.addEventListener('pointermove', function (e) { if (on) pick(e); });
    window.addEventListener('pointerup', function () { on = false; });
  })();
  function setMode(m) {
    var was = S.mode; S.mode = m; if (m === 'sleep') setRed(1); else if (was === 'sleep') setRed(0); save(); renderDial(); applyMode();
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  }
  function applyMode() {
    var allow = SHOW[S.mode];
    $$('#con .star').forEach(function (b) { b.classList.toggle('off', !!allow && allow.indexOf(b.dataset.id) < 0); });
    $('#modeLine').textContent = bedtimeNow() && S.mode !== 'sleep' ? 'it\u2019s past bedtime \u00b7 turn to sleep' : LINE[S.mode];
  }
  function setRed(v) { S.red = v ? 1 : 0; document.documentElement.classList.toggle('red', !!S.red); save(); }
  $('#red').addEventListener('click', function () { setRed(!S.red); });

  // ---------- sheets ----------
  var cleanup = null;
  function sheet(title, html) {
    $('#sheetTitle').textContent = title; $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; $('#sheet').scrollTop = 0;
  }
  function closeSheet() { if (cleanup) { cleanup(); cleanup = null; } $('#sheet').hidden = true; }
  $('#home').addEventListener('click', closeSheet);
  function toast(t) { var n = $('#toast'); n.textContent = t; n.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { n.classList.remove('on'); }, 2400); }
  function open(id) { ({ sleep: openSleep, timer: openTimer, outside: openOutside, camera: openCamera, circle: openCircle, messages: openMessages, ask: openAsk })[id](); }

  // sleep
  function openSleep() {
    sheet('sleep', '<button class="big" data-s="mw">' + ic('sleep') + '<span>moonwater<small>snow on moonlit water</small></span></button>' +
      '<button class="big" data-s="snow">' + ic('sleep') + '<span>snow<small>soft and quiet</small></span></button>' +
      '<button class="big" data-s="rain">' + ic('sleep') + '<span>rain<small>steady rain</small></span></button>' +
      '<button class="big" data-s="sea">' + ic('sleep') + '<span>sea<small>slow waves</small></span></button>' +
      '<p class="note">Sound fades out after 30 minutes. Turn it down with your finger.</p>');
    $$('#sheetBody [data-s]').forEach(function (b) { b.addEventListener('click', function () {
      var s = b.dataset.s; if (s === 'mw') return moonwater();
      location.href = 'sleep/?pair=' + s + '&intensity=.35&timer=30' + (S.red || bedtimeNow() ? '&red=1' : '');
    }); });
  }

  // moonwater: snow onto moonlit water, rings where flakes land, soft hush
  function moonwater() {
    var w = document.createElement('div'); w.id = 'mw';
    w.innerHTML = '<canvas></canvas><p class="mwname jul">moonwater</p><button class="pill mwhome">&#8249; home</button><div class="mwbar"><button class="pill" data-m="15">15 min</button><button class="pill on" data-m="30">30 min</button><button class="pill" data-m="0">keep on</button></div>';
    document.body.appendChild(w);
    var cv = $('canvas', w), cx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), W, H, hz, F = [], R = [], run = true, t0 = performance.now();
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); hz = H * .58; }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 90; i++) F.push({ x: Math.random() * W, y: Math.random() * hz, z: .4 + Math.random() * .6, s: Math.random() * 6 });
    var touch = null;
    cv.addEventListener('pointerdown', function (e) { touch = { x: e.clientX, y: e.clientY }; R.push({ x: e.clientX, y: Math.max(e.clientY, hz + 8), r: 2, a: .7 }); });
    cv.addEventListener('pointermove', function (e) { if (touch) touch = { x: e.clientX, y: e.clientY }; });
    cv.addEventListener('pointerup', function () { touch = null; });
    var ac = null, g = null;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      var len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
      for (var k = 0; k < len; k++) { var wn = Math.random() * 2 - 1; b0 = .99765 * b0 + wn * .099046; b1 = .963 * b1 + wn * .2965164; b2 = .57 * b2 + wn * 1.0526913; d[k] = (b0 + b1 + b2 + wn * .1848) * .11; }
      var src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      g = ac.createGain(); g.gain.value = 0; src.connect(lp); lp.connect(g); g.connect(ac.destination); src.start();
      g.gain.linearRampToValueAtTime(.5, ac.currentTime + 3); if (ac.resume) ac.resume();
    } catch (e) {}
    function frame(now) {
      if (!run) return;
      var t = (now - t0) / 1000;
      var sky = cx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#03060c'); sky.addColorStop(1, '#14233a');
      cx.fillStyle = sky; cx.fillRect(0, 0, W, hz);
      var mx = W * .7, my = hz * .3;
      var gl = cx.createRadialGradient(mx, my, 6, mx, my, 120); gl.addColorStop(0, 'rgba(232,223,200,.35)'); gl.addColorStop(1, 'rgba(232,223,200,0)');
      cx.fillStyle = gl; cx.fillRect(0, 0, W, hz);
      cx.fillStyle = '#ece3cb'; cx.beginPath(); cx.arc(mx, my, 22, 0, 7); cx.fill();
      var wa = cx.createLinearGradient(0, hz, 0, H); wa.addColorStop(0, '#0f1b2c'); wa.addColorStop(1, '#03060a');
      cx.fillStyle = wa; cx.fillRect(0, hz, W, H - hz);
      for (var y = hz + 4; y < H; y += 7) { // moon path on water
        var k = (y - hz) / (H - hz), ww = 14 + k * 70, off = Math.sin(t * 1.3 + y * .09) * (4 + k * 10);
        cx.fillStyle = 'rgba(236,227,203,' + (.22 * (1 - k * .8)).toFixed(3) + ')'; cx.fillRect(mx - ww / 2 + off, y, ww * (.5 + .5 * Math.sin(y * .3 + t * 2)), 1.6);
      }
      F.forEach(function (f) {
        f.y += (18 + f.z * 26) / 60; f.x += Math.sin(t * .6 + f.s) * .25 * f.z;
        if (touch) { var dx = f.x - touch.x, dy = f.y - touch.y, dd = dx * dx + dy * dy; if (dd < 9000) { f.x += dx / Math.sqrt(dd + 1) * 2.2; f.y += dy / Math.sqrt(dd + 1) * 1.2; } }
        var land = hz + 10 + f.s * (H - hz - 30) / 6;
        if (f.y > land) { R.push({ x: f.x, y: f.y, r: 1, a: .45 * f.z }); f.y = -5; f.x = Math.random() * W; }
        cx.fillStyle = 'rgba(240,236,228,' + (.5 + f.z * .45).toFixed(2) + ')'; cx.beginPath(); cx.arc(f.x, f.y, 1 + f.z * 1.6, 0, 7); cx.fill();
      });
      for (var j = R.length - 1; j >= 0; j--) { var r = R[j]; r.r += .45; r.a *= .975;
        cx.strokeStyle = 'rgba(220,226,236,' + r.a.toFixed(3) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.ellipse(r.x, r.y, r.r, r.r * .28, 0, 0, 7); cx.stroke();
        if (r.a < .02) R.splice(j, 1); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    function stop() { run = false; try { g.gain.linearRampToValueAtTime(0, ac.currentTime + .6); setTimeout(function () { ac.close(); }, 800); } catch (e) {} w.remove(); }
    $('.mwhome', w).addEventListener('click', function () { stop(); closeSheet(); });
    $$('.mwbar button', w).forEach(function (b) { b.addEventListener('click', function () { $$('.mwbar button', w).forEach(function (x) { x.classList.toggle('on', x === b); }); toast(b.dataset.m === '0' ? 'staying on' : 'fades out in ' + b.dataset.m + ' minutes'); }); });
  }

  // timer
  var ROUT = [
    { id: 'bed', w: 'bedtime', m: 15, steps: [['🪥', 'teeth'], ['👕', 'pyjamas'], ['📖', 'story']] },
    { id: 'hw', w: 'homework', m: 20, steps: [['✏️', 'start'], ['💧', 'drink'], ['✅', 'check']] },
    { id: 'tidy', w: 'tidy up', m: 10, steps: [['🧸', 'toys'], ['👟', 'shoes'], ['🎒', 'bag']] }
  ];
  function openTimer() {
    var h = ROUT.map(function (r) { return '<button class="big" data-r="' + r.id + '">' + ic('timer') + '<span>' + r.w + '<small>' + r.m + ' minutes \u00b7 ' + r.steps.map(function (s) { return s[1]; }).join(', ') + '</small></span></button>'; }).join('');
    if (S.band === 'older') h += '<div class="row"><button class="pill" data-min="5">5 min</button><button class="pill" data-min="25">25 min</button><button class="pill" data-min="45">45 min</button></div>';
    sheet('timer', h);
    $$('#sheetBody [data-r]').forEach(function (b) { b.addEventListener('click', function () { runTimer(ROUT.filter(function (r) { return r.id === b.dataset.r; })[0]); }); });
    $$('#sheetBody [data-min]').forEach(function (b) { b.addEventListener('click', function () { runTimer({ w: b.dataset.min + ' minutes', m: +b.dataset.min, steps: [] }); }); });
  }
  function runTimer(r) {
    var C = 2 * Math.PI * 105;
    sheet(r.w, '<div class="ringWrap"><svg viewBox="0 0 240 240"><circle class="bg" cx="120" cy="120" r="105"/><circle class="fg" cx="120" cy="120" r="105" stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg><div class="mid"><span><b id="tl"></b><span id="tw">left</span></span></div></div>' +
      (r.steps.length ? '<div class="steps">' + r.steps.map(function (s) { return '<button><i>' + s[0] + '</i>' + s[1] + '</button>'; }).join('') + '</div><p class="note">Tap each star when it\u2019s done.</p>' : '') +
      '<div class="row"><button class="pill" id="tp">pause</button></div>');
    var total = r.m * 60000, start = performance.now(), paused = 0, pAt = 0, run = true;
    $$('#sheetBody .steps button').forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('done'); if ($$('#sheetBody .steps .done').length === r.steps.length) toast('all done \u2728'); }); });
    $('#tp').addEventListener('click', function () { if (pAt) { paused += performance.now() - pAt; pAt = 0; this.textContent = 'pause'; } else { pAt = performance.now(); this.textContent = 'go'; } });
    function f(now) {
      if (!run) return;
      var el = ((pAt || now) - start - paused) * FAST, left = Math.max(0, total - el), fg = $('#sheetBody .fg');
      if (!fg) return;
      fg.setAttribute('stroke-dashoffset', (C * (1 - left / total)).toFixed(1));
      var m = Math.ceil(left / 60000); $('#tl').textContent = left > 60000 ? m : Math.ceil(left / 1000); $('#tw').textContent = left > 60000 ? 'minutes left' : 'seconds';
      if (left <= 0) { toast('time\u2019s up \u2728'); return; }
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
    cleanup = function () { run = false; };
  }

  // outside
  var WX = {
    sunny: { y: 1, h: 'Yes! Good day to go out', s: 'sunny until 4', wear: ['☀️ hat', '🧴 sun cream'], t: 18, hrs: ['☀️ 12', '☀️ 1', '⛅ 2', '⛅ 3', '🌙 5'] },
    rain: { y: 0, h: 'Not yet', s: 'rain stops around 3', wear: ['🧥 raincoat', '🥾 boots'], t: 11, hrs: ['🌧 12', '🌧 1', '🌦 2', '⛅ 3', '⛅ 4'] },
    cold: { y: 1, h: 'Yes, wrap up warm', s: 'cold but dry', wear: ['🧥 big coat', '🧤 gloves', '🧣 scarf'], t: 2, hrs: ['☁️ 12', '⛅ 1', '⛅ 2', '☁️ 3', '🌙 4'] },
    dark: { y: 0, h: 'It\u2019s dark now', s: 'try again in the morning', wear: ['🔦 stay in'], t: 6, hrs: ['🌙 8', '🌙 9', '🌙 10', '🌅 7', '☀️ 8'] }
  };
  function skyArt(k) {
    var sun = '<circle cx="75" cy="68" r="30" fill="#e9cf96"/>', moon = '<path d="M86 34a34 34 0 1 0 18 60 30 30 0 0 1-18-60z" fill="#e8dfc8"/>', cloud = '<path d="M38 106a18 18 0 0 1 4-35 24 24 0 0 1 46-4 18 18 0 0 1 22 39z" fill="#9fb0bb"/>';
    var drops = '<path d="M50 118l-5 12M72 118l-5 12M94 118l-5 12" stroke="#9fc3dd" stroke-width="4" stroke-linecap="round"/>';
    return '<svg class="sky" viewBox="0 0 150 150">' + (k === 'sunny' ? sun : k === 'rain' ? cloud + drops : k === 'cold' ? sun.replace('#e9cf96', '#d7dde2') + cloud : moon) + '</svg>';
  }
  function openOutside(k) {
    var hr = new Date().getHours(); k = typeof k === 'string' ? k : (Q.wx || (hr >= 18 || hr < 7 ? 'dark' : 'sunny')); var w = WX[k];
    sheet('outside', '<div class="answer">' + skyArt(k) + '<h3>' + w.h + '</h3><p class="note" style="margin:2px">' + w.s + (S.band === 'older' ? ' \u00b7 ' + w.t + '\u00b0' : '') + '</p></div>' +
      '<div class="wear">' + w.wear.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' +
      (S.band === 'older' ? '<div class="hours">' + w.hrs.map(function (x) { return '<span>' + x.replace(' ', '<br>') + '</span>'; }).join('') + '</div>' : '') +
      '<p class="note">sample weather \u00b7 try</p><div class="row">' + Object.keys(WX).map(function (x) { return '<button class="pill' + (x === k ? ' on' : '') + '" data-wx="' + x + '">' + x + '</button>'; }).join('') + '</div>');
    $$('#sheetBody [data-wx]').forEach(function (b) { b.addEventListener('click', function () { openOutside(b.dataset.wx); }); });
  }

  // camera: keep only, no sharing
  function openCamera() {
    if (!S.cam) { sheet('camera', '<p class="note">A grown-up has the camera switched off.</p>'); return; }
    sheet('camera', '<div class="cam"><video playsinline muted autoplay></video><canvas hidden></canvas><div class="flash"></div></div><button class="shutter" aria-label="take a photo"></button>' +
      '<div class="roll"></div><p class="note">Photos stay on this phone. No sending, no posting.</p>');
    var v = $('#sheetBody video'), fake = $('#sheetBody canvas'), stream = null, run = true;
    function roll() { $('#sheetBody .roll').innerHTML = S.photos.slice().reverse().map(function (p) { return '<img src="' + p + '" alt="photo">'; }).join(''); }
    roll();
    function fakeCam() {
      v.hidden = true; fake.hidden = false; var c = fake.getContext('2d'); fake.width = 360; fake.height = 440; var t0 = performance.now();
      (function f(now) { if (!run) return; var t = (now - t0) / 1000, g = c.createLinearGradient(0, 0, 0, 440);
        g.addColorStop(0, '#2a3f55'); g.addColorStop(1, '#0d1620'); c.fillStyle = g; c.fillRect(0, 0, 360, 440);
        c.fillStyle = '#e9cf96'; c.beginPath(); c.arc(180 + Math.sin(t * .5) * 60, 160, 40, 0, 7); c.fill();
        c.fillStyle = '#1b2a1f'; c.beginPath(); c.moveTo(0, 440); c.lineTo(0, 330); c.quadraticCurveTo(180, 270 + Math.sin(t) * 8, 360, 340); c.lineTo(360, 440); c.fill();
        requestAnimationFrame(f); })(t0);
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !Q.nocam) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (s) { if (!run) { s.getTracks().forEach(function (t) { t.stop(); }); return; } stream = s; v.srcObject = s; }).catch(fakeCam);
    } else fakeCam();
    $('#sheetBody .shutter').addEventListener('click', function () {
      var src = fake.hidden ? v : fake, c = document.createElement('canvas'), sw = src.videoWidth || src.width, sh = src.videoHeight || src.height;
      if (!sw) return; c.width = 200; c.height = Math.round(200 * sh / sw); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
      S.photos.push(c.toDataURL('image/jpeg', .6)); S.photos = S.photos.slice(-12); save(); roll();
      var fl = $('#sheetBody .flash'); fl.style.transition = 'none'; fl.style.opacity = .7; requestAnimationFrame(function () { fl.style.transition = 'opacity .5s'; fl.style.opacity = 0; });
      toast('kept on this phone');
    });
    cleanup = function () { run = false; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); };
  }

  // circle: approved stars only
  var FACE = { Home: '🏠', Nan: '🌷', Sam: '⚽', Ali: '🎨', Coach: '🏃' };
  function face(n) { return FACE[n] || '⭐'; }
  function openCircle() {
    var ppl = S.people, n = ppl.length, h = '<div class="circle">';
    ppl.forEach(function (p, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n, x = 50 + Math.cos(a) * 34, y = 48 + Math.sin(a) * 38;
      h += '<button class="star" data-p="' + p + '" style="left:' + x + '%;top:' + y + '%"><span class="dot" style="font-size:30px">' + face(p) + '</span><b>' + p + '</b></button>'; });
    h += '</div><p class="note">Only people a grown-up added are here.<br>Want someone new? Ask a grown-up.</p>';
    sheet(S.band === 'little' ? 'friends' : 'circle', h);
    $$('#sheetBody [data-p]').forEach(function (b) { b.addEventListener('click', function () { person(b.dataset.p); }); });
  }
  function person(p) {
    var acts = [['call', 'call'], ['voice', 'voice'], ['picture', 'picture']]; if (S.band === 'older') acts.push(['write', 'write']);
    sheet(p, '<div class="person"><div class="face">' + face(p) + '</div></div><div class="acts">' + acts.map(function (a) { return '<button data-a="' + a[0] + '">' + ic(a[0]) + a[1] + '</button>'; }).join('') + '</div>' +
      (S.band === 'little' ? '<p class="note">or send a star</p><div class="quick"><button>⭐</button><button>👍</button><button>❤️</button><button>😂</button></div>' : ''));
    $$('#sheetBody [data-a]').forEach(function (b) { b.addEventListener('click', function () {
      var a = b.dataset.a; if (!S.msgs && a !== 'call') return toast('messages are off right now');
      if (a === 'call') toast('calling ' + p + '\u2026'); else if (a === 'voice') toast('hold to talk \u00b7 sent to ' + p); else if (a === 'picture') toast(S.photos.length ? 'pick a photo for ' + p : 'take a photo first'); else thread(p);
    }); });
    $$('#sheetBody .quick button').forEach(function (b) { b.addEventListener('click', function () { toast(b.textContent + ' sent to ' + p); }); });
  }
  // messages (older)
  var TH = { Home: [['them', 'Dinner at 6 \ud83c\udf5d'], ['me', 'ok!'], ['voice', '']], Sam: [['them', 'football tomorrow?'], ['me', 'yes after school']], Nan: [['them', 'Love you \u2764\ufe0f']] };
  function openMessages() {
    if (!S.msgs) return sheet('messages', '<p class="note">A grown-up has messages switched off right now.</p>');
    sheet('messages', '<div class="newone">Someone new tried to say hi.<br>A grown-up will check it first.</div>' +
      S.people.map(function (p) { var t = TH[p], last = t ? t[t.length - 1] : null; return '<button class="big" data-t="' + p + '"><span style="font-size:28px">' + face(p) + '</span><span>' + p + '<small>' + (last ? (last[0] === 'voice' ? 'voice note' : last[1]) : 'say hi') + '</small></span></button>'; }).join('') +
      '<p class="note">Only people a grown-up added.</p>');
    $$('#sheetBody [data-t]').forEach(function (b) { b.addEventListener('click', function () { thread(b.dataset.t); }); });
  }
  function bubble(m) { return m[0] === 'voice' ? '<div class="msg voice">' + [6, 12, 18, 9, 15, 20, 11, 7, 14, 8].map(function (h) { return '<i style="height:' + h + 'px"></i>'; }).join('') + '</div>' : '<div class="msg' + (m[0] === 'me' ? ' me' : '') + '">' + m[1] + '</div>'; }
  function thread(p) {
    var t = TH[p] = TH[p] || [];
    sheet(p, '<div class="thread">' + t.map(bubble).join('') + '</div><div class="quick"><button>⭐</button><button>👍</button><button>❤️</button><button>😂</button></div>' +
      '<div class="compose"><button aria-label="voice">' + ic('voice') + '</button><input placeholder="write to ' + p + '" enterkeyhint="send"><button aria-label="send">' + ic('send') + '</button></div>');
    function add(m) { t.push(m); $('#sheetBody .thread').insertAdjacentHTML('beforeend', bubble(m)); }
    var inp = $('#sheetBody input'), btns = $$('#sheetBody .compose button');
    function send() { var v = inp.value.trim(); if (v) { add(['me', v.replace(/</g, '&lt;')]); inp.value = ''; } }
    btns[1].addEventListener('click', send); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    btns[0].addEventListener('click', function () { add(['voice', '']); });
    $$('#sheetBody .quick button').forEach(function (b) { b.addEventListener('click', function () { add(['me', b.textContent]); }); });
  }

  // ask oz: kid-safe answers only
  var FAQ = [
    { q: 'How long till bedtime?', k: ['bed', 'sleep'], a: function () { return 'Bedtime is ' + S.bedtime + '. Turn the dial to wind down when it\u2019s close.'; } },
    { q: 'Is it a good day to go outside?', k: ['outside', 'weather', 'rain', 'sun'], a: function () { return 'Tap the outside star. It says yes or not yet, and what to wear.'; } },
    { q: 'How do I call home?', k: ['call', 'home', 'phone'], a: function () { return 'Tap friends, then Home, then call.'; } },
    { q: 'Why is the sky dark at night?', k: ['dark', 'night', 'sky'], a: function () { return 'Our side of the Earth turns away from the sun, so it gets dark. The other side is having daytime!'; } },
    { q: 'What does the red dot do?', k: ['red'], a: function () { return 'It makes the screen warm and dim, which is kinder to sleepy eyes.'; } },
    { q: 'How do I set a timer?', k: ['timer', 'homework', 'minutes'], a: function () { return 'Tap timer and pick bedtime, homework or tidy up. The ring empties as time goes.'; } }
  ];
  function openAsk() {
    var h = '<div class="reply" id="rep">Ask me something. If I don\u2019t know, a grown-up will help.</div>';
    if (S.band === 'older') h += '<div class="compose" style="margin-bottom:14px"><input placeholder="ask oz" enterkeyhint="send"><button aria-label="ask">' + ic('send') + '</button></div>';
    h += '<div class="faq">' + FAQ.map(function (f, i) { return '<button class="big" data-f="' + i + '">' + ic('ask') + '<span>' + f.q + '</span></button>'; }).join('') + '</div>';
    sheet('ask oz', h);
    $$('#sheetBody [data-f]').forEach(function (b) { b.addEventListener('click', function () { $('#rep').textContent = FAQ[+b.dataset.f].a(); }); });
    var inp = $('#sheetBody input');
    if (inp) { var go = function () { var v = inp.value.toLowerCase(), hit = FAQ.filter(function (f) { return f.k.some(function (k) { return v.indexOf(k) >= 0; }); })[0];
      $('#rep').textContent = hit ? hit.a() : 'That\u2019s a good one for a grown-up. Ask Home?'; inp.value = ''; };
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); $('#sheetBody .compose button').addEventListener('click', go); }
  }

  // ---------- grown-ups: hold the moon, then a check ----------
  (function () {
    var m = $('#moon'), t = null;
    function start(e) { e.preventDefault(); m.classList.add('hold'); t = setTimeout(function () { m.classList.remove('hold'); parentCheck(); }, 1600); }
    function end() { m.classList.remove('hold'); clearTimeout(t); }
    m.addEventListener('pointerdown', start); m.addEventListener('pointerup', end); m.addEventListener('pointerleave', end); m.addEventListener('pointercancel', end);
    m.addEventListener('click', function () { if (!$('#sheet').hidden) return; toast('grown-ups: hold the moon'); });
  })();
  function parentCheck() {
    var a = 6 + Math.floor(Math.random() * 4), b = 7 + Math.floor(Math.random() * 3), v = '';
    sheet('grown-ups', '<div class="check"><p class="note">Quick check for a grown-up</p><p class="q">' + a + ' \u00d7 ' + b + ' = <span id="pv">?</span></p><div class="pad">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '\u232b'].map(function (n) { return '<button data-n="' + n + '">' + n + '</button>'; }).join('') + '</div></div>');
    $$('#sheetBody .pad button').forEach(function (bt) { bt.addEventListener('click', function () {
      var n = bt.dataset.n; if (n === '') return; v = n === '\u232b' ? v.slice(0, -1) : (v + n).slice(0, 3); $('#pv').textContent = v || '?';
      if (+v === a * b) setTimeout(parentPanel, 250); else if (v.length >= String(a * b).length) { toast('not quite'); v = ''; setTimeout(function () { $('#pv').textContent = '?'; }, 400); }
    }); });
  }
  function parentPanel() {
    function tg(k, w, sub) { return '<button class="big" data-tg="' + k + '"><span>' + w + '<small>' + sub + '</small></span><i class="tog' + (S[k] ? ' on' : '') + '"></i></button>'; }
    sheet('grown-ups', '<p class="note" style="margin-top:0">Approved people</p><div class="plist">' +
      S.people.map(function (p) { return '<div class="big"><span>' + face(p) + ' ' + p + '</span><button class="pill" data-rm="' + p + '">remove</button></div>'; }).join('') +
      '</div><div class="compose" style="margin-bottom:16px"><input id="addp" placeholder="add a name"><button aria-label="add" id="addb">+</button></div>' +
      '<p class="note">Quiet hours</p><div class="row" style="margin-bottom:14px">' + ['19:00', '19:30', '20:30', '21:00'].map(function (t) { return '<button class="pill' + (t === S.bedtime ? ' on' : '') + '" data-bt="' + t + '">' + t + '</button>'; }).join('') + '</div>' +
      tg('msgs', 'messages', 'to approved people only') + tg('cam', 'camera', 'photos stay on this phone') +
      '<p class="note">Age</p><div class="row">' + ['little', 'older'].map(function (b) { return '<button class="pill' + (S.band === b ? ' on' : '') + '" data-pb="' + b + '">' + (b === 'little' ? '6\u20139' : '10\u201313') + '</button>'; }).join('') + '</div>' +
      '<div class="promise">No ads. No feeds. No tracking. No accounts.<br>Everything stays on this device.</div>');
    $$('#sheetBody [data-rm]').forEach(function (b) { b.addEventListener('click', function () { S.people = S.people.filter(function (p) { return p !== b.dataset.rm; }); save(); parentPanel(); }); });
    $('#addb').addEventListener('click', function () { var v = $('#addp').value.trim().slice(0, 16); if (v) { S.people.push(v.replace(/[<>"]/g, '')); save(); parentPanel(); } });
    $$('#sheetBody [data-bt]').forEach(function (b) { b.addEventListener('click', function () { S.bedtime = b.dataset.bt; save(); parentPanel(); applyMode(); }); });
    $$('#sheetBody [data-tg]').forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.tg; S[k] = S[k] ? 0 : 1; save(); $('.tog', b).classList.toggle('on', !!S[k]); }); });
    $$('#sheetBody [data-pb]').forEach(function (b) { b.addEventListener('click', function () { S.band = b.dataset.pb; save(); renderHome(); parentPanel(); }); });
  }

  // ---------- watch-only kid ----------
  var wi = 0, WN = 4;
  function renderWatch() {
    var C = 2 * Math.PI * 46, d = new Date(), h = d.getHours(), m = d.getMinutes();
    $('#wpages').innerHTML =
      '<div class="wp"><div class="wt jul">' + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + '</div><div class="ws">bedtime ' + S.bedtime + '</div></div>' +
      '<div class="wp"><div class="wring"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="46" fill="none" stroke="rgba(232,228,220,.12)" stroke-width="8"/><circle id="wfg" cx="55" cy="55" r="46" fill="none" stroke="#e9cf96" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg><div class="mid" id="wtl">15</div></div><button class="wbtn" id="wgo">bedtime</button></div>' +
      '<div class="wp"><div class="ws">call home</div><div class="wstars">' + S.people.slice(0, 3).map(function (p) { return '<button data-wc="' + p + '"><i>' + face(p) + '</i>' + p + '</button>'; }).join('') + '</div></div>' +
      '<div class="wp"><svg viewBox="0 0 40 40" style="width:54px;height:54px;fill:#e8dfc8"><path d="M26 6a15 15 0 1 0 8 26A13 13 0 0 1 26 6z"/></svg><button class="wbtn" id="wsleep">sleep sounds</button></div>';
    $('#wdots').innerHTML = [0, 1, 2, 3].map(function (i) { return '<button data-wi="' + i + '" aria-label="page ' + (i + 1) + '"></button>'; }).join('');
    $$('#wdots button').forEach(function (b) { b.addEventListener('click', function () { wgo(+b.dataset.wi); }); });
    $$('[data-wc]').forEach(function (b) { b.addEventListener('click', function () { toast('calling ' + b.dataset.wc + '\u2026'); }); });
    $('#wgo').addEventListener('click', function () {
      var st = performance.now(), tot = 15 * 60000; this.textContent = 'going';
      (function f(n) { var l = Math.max(0, tot - (n - st) * FAST * 4), fg = $('#wfg'); if (!fg) return; fg.setAttribute('stroke-dashoffset', (C * (1 - l / tot)).toFixed(1)); $('#wtl').textContent = Math.ceil(l / 60000); if (l > 0) requestAnimationFrame(f); })(st);
    });
    $('#wsleep').addEventListener('click', function () { toast('moonwater playing \u00b7 fades in 30 min'); });
    wgo(wi);
  }
  function wgo(i) { wi = Math.max(0, Math.min(WN - 1, i)); $('#wpages').style.transform = 'translateX(' + (-186 * wi) + 'px)'; $$('#wdots button').forEach(function (b, j) { b.classList.toggle('on', j === wi); }); }
  (function () { var f = $('#watch .face'), x0 = null;
    f.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    f.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 30) wgo(wi + (dx < 0 ? 1 : -1)); });
  })();
  function setWatch(on) { $('#watch').hidden = !on; $('#phone').hidden = on; $('[data-watch]').classList.toggle('on', on); if (on) { closeSheet(); renderWatch(); } }

  // ---------- preview toggles ----------
  $$('#proto [data-band]').forEach(function (b) { b.addEventListener('click', function () { setWatch(false); S.band = b.dataset.band; save(); closeSheet(); renderHome(); }); });
  $('[data-watch]').addEventListener('click', function () { setWatch($('#watch').hidden); });

  tick(); setInterval(tick, 15000);
  if (S.red || (bedtimeNow() && Q.bedtime === '1')) setRed(1);
  if (Q.mode) S.mode = Q.mode;
  renderHome(); addEventListener('resize', renderHome);
  if (Q.watch === '1') setWatch(true);
  if (Q.open) open(Q.open);
})();
