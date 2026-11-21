/* teen oz · less scrolling, more going. example data only; everything stays on this phone. */
(function () {
  'use strict';
  var $ = OZ.$, ic = OZ.ic, H = document.documentElement;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var Q = {}; (location.search || '').slice(1).split('&').forEach(function (p) { var i = p.indexOf('='); if (i > 0) Q[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); });
  if (Q.fresh) try { localStorage.removeItem('ozt'); } catch (e) {}
  var S = { red: 0, when: null, sky: null, share: {}, plans: [], makes: 0, home: 0, hold: 1, calm: '23:00' };
  try { Object.assign(S, JSON.parse(localStorage.getItem('ozt') || '{}')); } catch (e) {}
  function save() { try { localStorage.setItem('ozt', JSON.stringify(S)); } catch (e) {} }
  var hr = new Date().getHours();
  var WHEN = Q.when || S.when || (hr >= 17 || hr < 6 ? 'night' : 'day');

  /* ——— example places. x/y = direction from you, r = minutes' walk ——— */
  var PL = {
    night: [
      { id: 'lantern', label: 'the lantern', sub: 'open mic · 8:00', kind: 'shows', icon: 'event', x: .27, y: .3, walk: 9, d: 'all-ages open mic. sign-up at 7:45, three songs each.', in: ['maya'] },
      { id: 'bowl', label: 'riverside bowl', sub: 'lit till 10', kind: 'skate', icon: 'skate', x: .78, y: .26, walk: 12, d: 'the bowl and the long ledge. lights on till 10.', in: ['jo'] },
      { id: 'print', label: 'print shop', sub: 'open studio · 6–9', kind: 'studios', icon: 'studio', x: .74, y: .74, walk: 7, d: 'riso night. bring a drawing, leave with twenty prints.', in: [] },
      { id: 'hall', label: 'the hall', sub: 'two local bands · 7:30', kind: 'shows', icon: 'event', x: .2, y: .78, walk: 18, d: 'all-ages show. doors 7:00, out by 10.', in: ['sol', 'maya'] },
      { id: 'ridge', label: 'ridge loop', sub: 'sunrise walk · 7:52', kind: 'trails', icon: 'trail', x: .52, y: .06, walk: 20, d: '3 km loop to the lookout. best at sunrise tomorrow.', in: [] }
    ],
    day: [
      { id: 'ridge', label: 'ridge loop', sub: 'golden hour 4:41', kind: 'trails', icon: 'trail', x: .52, y: .07, walk: 20, d: '3 km loop to the lookout. go up for golden hour.', in: ['jo'] },
      { id: 'market', label: 'night market', sub: 'opens 5:00', kind: 'shows', icon: 'event', x: .24, y: .32, walk: 11, d: 'food stalls, a small stage, a record table.', in: ['maya'] },
      { id: 'bowl', label: 'riverside bowl', sub: 'dry all day', kind: 'skate', icon: 'skate', x: .8, y: .3, walk: 12, d: 'the bowl and the long ledge.', in: [] },
      { id: 'zine', label: 'zine fair', sub: 'library · 12–4', kind: 'studios', icon: 'studio', x: .76, y: .76, walk: 8, d: 'make a page, trade a page. free.', in: ['sol'] },
      { id: 'park', label: 'maple park', sub: 'courts open', kind: 'trails', icon: 'park', x: .22, y: .76, walk: 6, d: 'two courts, the hill, the pond.', in: [] }
    ]
  };
  var FR = [ // your sky: you place them; closer to the middle = closer to you
    { id: 'maya', x: .36, y: .34 }, { id: 'jo', x: .68, y: .38 }, { id: 'sol', x: .62, y: .7 }, { id: 'ari', x: .3, y: .68 },
    { id: 'kit', x: .14, y: .44 }, { id: 'remy', x: .86, y: .56 }, { id: 'lee', x: .5, y: .12 }
  ];
  var OUT = { night: { maya: 'lantern', jo: 'bowl' }, day: { jo: 'ridge' } }; // friends who chose to share where they are, for tonight only
  if (!S.sky) S.sky = FR.map(function (f) { return Object.assign({}, f); });
  function places() { return PL[WHEN]; }
  function place(id) { return places().filter(function (p) { return p.id === id; })[0]; }
  function wx() { return WHEN === 'night' ? { y: 'good night to go out', s: 'clear, 6° · dry till 2', wear: 'a warm layer', w: [[17, 23]], g: 'moonrise 9:12' } : { y: 'yes, a good day to go out', s: 'clear till 6 · 14°', wear: 'a light jacket', w: [[11, 17]], g: 'golden hour 4:41' }; }

  /* ——— home ——— */
  function tick() { var c = OZ.clock(); $('#anchor .clk').textContent = c.t; $('#anchor .dt').textContent = c.d; }
  function renderHome() {
    $$('#mid [data-when]').forEach(function (b) { b.classList.toggle('on', b.dataset.when === WHEN); });
    var n = places().length, f = Object.keys(OUT[WHEN]).length, live = S.plans.filter(function (p) { return !p.gone; });
    $('#tline').textContent = (WHEN === 'night' ? 'tonight · ' : 'today · ') + n + ' real things near you' + (f ? ' · ' + f + ' friends out' : '');
    var items = [
      { id: 'around', label: WHEN === 'night' ? 'tonight' : 'today', sub: 'around you', icon: 'around', x: .5, y: .2, z: 1, cur: true },
      { id: 'friends', label: 'friends', sub: f ? f + ' out' : 'your sky', icon: 'circle', x: .17, y: .42, z: .85 },
      { id: 'plans', label: 'plans', sub: live.length ? live.length + ' on' : 'none yet', icon: 'plan', x: .83, y: .42, z: .85 },
      { id: 'make', label: 'make', sub: 'for your circle', icon: 'make', x: .27, y: .74, z: .7 },
      { id: 'weather', label: 'go out?', sub: wx().y.indexOf('good') >= 0 ? 'yes' : 'maybe', icon: 'outside', x: .73, y: .74, z: .7 },
      { id: 'night', label: 'night', sub: 'calm from ' + S.calm, icon: 'night', x: .5, y: .96, z: .55 }
    ];
    OZ.con($('#home'), items, [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]], open, { gap: 34 });
  }
  function setRed(v) { S.red = v ? 1 : 0; H.classList.toggle('red', !!S.red); save(); }
  $('#disc').addEventListener('click', function () { setRed(!S.red); if (!$('#room').classList.contains('on')) renderHome(); });

  /* ——— rooms ——— */
  var cleanup = null, back = null;
  function room(t, html, b) { if (cleanup) { cleanup(); cleanup = null; } $('#rT').textContent = t; $('#rB').innerHTML = html; $('#rB').scrollTop = 0; $('#room').classList.add('on'); H.classList.add('inroom'); back = b || null; }
  function home() { if (cleanup) { cleanup(); cleanup = null; } $('#room').classList.remove('on'); H.classList.remove('inroom'); renderHome(); }
  $('#corner').addEventListener('click', function () { if (back) { var b = back; back = null; return b(); } home(); });
  function rw(k, icon, t, sub, go) { return '<button class="rw" data-k="' + k + '">' + ic(icon) + '<span class="tx">' + t + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (go === false ? '' : '<span class="go">›</span>') + '</button>'; }
  function bind(sel, fn) { $$(sel, $('#rB')).forEach(function (b) { b.addEventListener('click', function (e) { fn(b.dataset.k, b, e); }); }); }
  function open(id) { ({ around: function () { around('all'); }, friends: friends, plans: plans, make: make, weather: weather, night: night })[id](); }

  // tonight / around you: a constellation of real places, you in the middle
  var KINDS = ['all', 'shows', 'skate', 'studios', 'trails', 'friends'];
  function around(k) {
    room(WHEN === 'night' ? 'tonight · around you' : 'today · around you', '<div class="seg" style="justify-content:center">' + KINDS.map(function (x) { return '<button data-kd="' + x + '"' + (x === k ? ' class="on"' : '') + '>' + x + '</button>'; }).join('') + '</div>' +
      '<div class="rcon"><div class="con" id="acon"></div></div>' +
      places().slice().sort(function (a, b) { return a.walk - b.walk; }).filter(function (p) { return k === 'all' || k === 'friends' ? true : p.kind === k; }).map(function (p) { var fin = friendsAt(p.id); return rw(p.id, p.icon, p.label, p.sub + ' · ' + p.walk + ' min walk' + (fin.length ? ' · ' + fin.join(', ') + ' there' : '')); }).join('') +
      '<p class="end lbl">that’s everything near you ' + (WHEN === 'night' ? 'tonight' : 'today') + '</p><p class="fine ctr">no feed, no ads. your location stays on this phone.<br>friends show here only if they chose to share, for tonight.</p>');
    var items = [{ id: 'you', label: 'you', icon: 'you', x: .5, y: .5, z: 1, cur: true }], lines = [];
    places().forEach(function (p) { if (k !== 'all' && k !== 'friends' && p.kind !== k) return; var z = Math.max(.45, 1 - p.walk / 30); var fa = friendsAt(p.id); items.push({ id: p.id, label: p.label, sub: fa.length ? fa.join(' + ') + ' there' : p.sub, icon: p.icon, x: p.x, y: p.y, z: k === 'friends' && !fa.length ? .3 : z, lit: fa.length > 0 }); lines.push([0, items.length - 1]); });
    OZ.con($('#acon'), items, lines.filter(function (l) { return l[0] >= 0; }), function (id) { if (id === 'you') return; spot(id, function () { around(k); }); }, { gap: 30, rings: [[.5, .5, 80], [.5, .5, 160]] });
    $$('#acon .cs', $('#rB')).forEach(function (b, i) { if (items[i] && items[i].lit) b.classList.add('lit'); });
    $$('[data-kd]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { around(b.dataset.kd); }); });
    bind('.rw', function (id) { spot(id, function () { around(k); }); });
  }
  function friendsAt(pid) { return Object.keys(OUT[WHEN]).filter(function (f) { return OUT[WHEN][f] === pid; }); }
  function spot(id, b) {
    var p = place(id), fin = friendsAt(id).concat(p.in.filter(function (x) { return friendsAt(id).indexOf(x) < 0; }));
    room(p.label, '<p class="big ctr">' + p.label + '</p><p class="fine ctr" style="margin-top:2px">' + p.sub + ' · ' + p.walk + ' min walk</p><p class="fine ctr">' + p.d + '</p>' +
      '<p class="h4 lbl">who’s in</p><p class="fine" style="margin-top:4px">' + (fin.length ? fin.join(', ') + (fin.length > 1 ? ' are' : ' is') + ' going' : 'no one from your sky yet') + '</p>' +
      '<div class="acts"><button class="act" id="mkp">make it a plan</button></div><p class="fine ctr">one tap. it goes only to the people you pick, and fades after.</p>', b);
    $('#mkp').addEventListener('click', function () { newPlan(p); });
  }

  // plans: one tap, a meetup, then it fades
  function newPlan(p) {
    var pl = { id: Date.now(), place: p.id, label: p.label, sub: p.sub, who: p.in.slice(0, 2), yes: [], gone: 0 }; S.plans.unshift(pl); save(); planView(pl);
  }
  function planView(pl) {
    var sky = S.sky.map(function (f) { return f.id; });
    room('plan', '<div class="plan" id="pc"><div class="pt">' + pl.label + '</div><div class="ps">' + pl.sub + ' · meet at the door 10 min before</div><div class="pin" id="pin">' + (pl.yes.length ? pl.yes.join(', ') + ' in' : 'waiting for your people') + '</div></div>' +
      '<p class="h4 lbl">who you’re asking</p><div class="who">' + sky.map(function (f) { return '<button data-f="' + f + '"' + (pl.who.indexOf(f) >= 0 ? ' class="on"' : '') + '><i></i>' + f + '</button>'; }).join('') + '</div>' +
      '<div class="acts"><button class="act" id="snd">ask them</button></div>' +
      '<p class="fine">no public event, no invite link, no count of who saw it. plans fade at 2 am. keep a photo from it if you want; nothing else stays.</p>' +
      '<div class="acts"><button class="act" id="skip" style="color:var(--mid)">see it fade</button></div>', plans);
    $$('[data-f]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { var f = b.dataset.f, i = pl.who.indexOf(f); if (i >= 0) pl.who.splice(i, 1); else pl.who.push(f); b.classList.toggle('on'); save(); }); });
    $('#snd').addEventListener('click', function () { if (!pl.who.length) return OZ.toast('pick someone from your sky'); OZ.toast('asked ' + pl.who.join(', '));
      var t = setTimeout(function () { pl.yes = pl.who.slice(0, 2); save(); var n = $('#pin'); if (n) n.textContent = pl.yes.join(', ') + ' in · see you there'; }, 1600); cleanup = function () { clearTimeout(t); }; });
    $('#skip').addEventListener('click', function () { var c = $('#pc'); c.classList.add('fade'); setTimeout(function () { pl.gone = 1; save(); var n = $('#pin'); OZ.toast('it happened. it’s gone now.'); plans(); }, 2500); });
  }
  function plans() {
    var live = S.plans.filter(function (p) { return !p.gone; }), gone = S.plans.filter(function (p) { return p.gone; }).length;
    room('plans', (live.length ? live.map(function (p) { return rw(String(p.id), 'plan', p.label, p.sub + (p.yes.length ? ' · ' + p.yes.join(', ') + ' in' : ' · asking ' + (p.who.join(', ') || 'no one yet'))); }).join('') : '<p class="fine ctr">no plans yet. pick something from tonight, one tap.</p>') +
      (gone ? '<p class="fine ctr">' + gone + ' plan' + (gone > 1 ? 's' : '') + ' already happened and faded.</p>' : '') +
      '<div class="acts"><button class="act" id="tn">see ' + (WHEN === 'night' ? 'tonight' : 'today') + '</button></div>');
    bind('.rw', function (k) { planView(S.plans.filter(function (p) { return String(p.id) === k; })[0]); });
    $('#tn').addEventListener('click', function () { around('all'); });
  }

  // friends: a constellation you curate; drag to place, closer = closer
  function friends() {
    room('your sky', '<div class="rcon drag"><div class="con" id="fcon"></div></div>' +
      '<p class="fine ctr">you place them. closer to you = closer. your sky holds twelve.<br>no follower counts, no suggestions, nobody you didn’t add.</p>' +
      S.sky.map(function (f) { var at = OUT[WHEN][f.id]; return rw(f.id, 'circle', f.id, at ? 'out · at ' + place(at).label + ' · shared for tonight' : 'not sharing where they are'); }).join(''));
    drawSky(); bind('.rw', function (k) { friend(k, friends); });
  }
  function drawSky() {
    var items = [{ id: '_you', label: 'you', icon: 'you', x: .5, y: .5, z: 1, cur: true }].concat(S.sky.map(function (f) { var d = Math.hypot(f.x - .5, f.y - .5); return { id: f.id, label: f.id, sub: OUT[WHEN][f.id] ? 'out' : '', icon: 'dot', x: f.x, y: f.y, z: Math.max(.45, 1 - d * 1.3) }; }));
    var host = $('#fcon'); OZ.con(host, items, items.slice(1).map(function (x, i) { return [0, i + 1]; }), function (id) { if (dragged || id === '_you') return; friend(id, friends); }, { gap: 28 });
    $$('.cs', host).forEach(function (b) { if (OUT[WHEN][b.dataset.id]) b.classList.add('lit'); if (b.dataset.id !== '_you') dragify(b, host); });
  }
  var dragged = false;
  function dragify(b, host) {
    var st = null;
    b.addEventListener('pointerdown', function (e) { st = { x: e.clientX, y: e.clientY, l: parseFloat(b.style.left), t: parseFloat(b.style.top) }; dragged = false; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', function (e) { if (!st) return; var dx = e.clientX - st.x, dy = e.clientY - st.y; if (!dragged && Math.hypot(dx, dy) < 8) return; dragged = true; b.style.left = (st.l + dx) + 'px'; b.style.top = (st.t + dy) + 'px'; });
    b.addEventListener('pointerup', function () { if (!st) return; st = null; if (!dragged) return; var f = S.sky.filter(function (x) { return x.id === b.dataset.id; })[0], W = host.clientWidth, Hh = host.clientHeight;
      f.x = Math.min(.9, Math.max(.1, parseFloat(b.style.left) / W)); f.y = Math.min(.92, Math.max(.08, parseFloat(b.style.top) / Hh)); save(); setTimeout(function () { drawSky(); dragged = false; }, 30); });
  }
  function friend(id, b) {
    var at = OUT[WHEN][id], mine = !!S.share[id];
    room(id, '<p class="big ctr">' + id + '</p><p class="fine ctr" style="margin-top:2px">' + (at ? 'out · at ' + place(at).label + ' · they chose to share, for tonight' : 'not sharing where they are') + '</p>' +
      rw('msg', 'messages', 'message', 'just the two of you', false) + rw('plan', 'plan', 'make a plan', at ? 'meet at ' + place(at).label : 'pick from tonight', false) + rw('make', 'make', 'send something you made', 'only to ' + id, false) +
      '<button class="rw" data-k="share">' + ic('around') + '<span class="tx">share where I am with ' + id + '<small>tonight only · ends at 2 am · off by default</small></span><i class="sw' + (mine ? ' on' : '') + '"></i></button>', b);
    bind('.rw', function (k, el) { if (k === 'share') { S.share[id] = !S.share[id]; save(); $('.sw', el).classList.toggle('on', !!S.share[id]); OZ.toast(S.share[id] ? id + ' can see where you are, tonight only' : 'stopped sharing with ' + id); return; }
      if (k === 'plan') return at ? newPlan(place(at)) : around('all'); if (k === 'make') return make(); OZ.toast('message to ' + id); });
  }

  // make: made things, to your circle only. finite. no counts.
  function make() {
    room('make', '<div class="mk"><canvas></canvas></div><div class="seg" style="justify-content:center"><button class="on" data-m="photo">photo</button><button data-m="note">note</button><button data-m="sound">sound</button></div>' +
      '<p class="h4 lbl">who sees it</p><div class="who">' + S.sky.map(function (f, i) { return '<button data-f="' + f.id + '"' + (i < 3 ? ' class="on"' : '') + '><i></i>' + f.id + '</button>'; }).join('') + '</div>' +
      '<div class="acts"><button class="act" id="shr">share with them</button></div>' +
      '<p class="h4 lbl">from your circle this week</p><div class="makes">' + rw('m1', 'picture', 'maya', 'a photo from the lantern', false) + rw('m2', 'voice', 'jo', 'a 30-second sound · the bowl at night', false) + rw('m3', 'write', 'sol', 'a short poem', false) + '</div>' +
      '<p class="end lbl">that’s all for this week</p><p class="fine ctr">no likes count, no views count. they can send a star back; only you see it.<br>makes fade after 7 days unless you keep them.</p>');
    var cv = $('#rB canvas'), x = cv.getContext('2d'), run = true, t0 = performance.now(); cv.width = 340; cv.height = 300;
    (function f(n) { if (!run) return; var t = (n - t0) / 1000, red = H.classList.contains('red'), k = red ? '92,88,82' : '232,228,220';
      x.fillStyle = '#000'; x.fillRect(0, 0, 340, 300);
      for (var i = 0; i < 40; i++) { var a = i * 2.4 + t * .1, r = 20 + i * 3.2; x.fillStyle = 'rgba(' + k + ',' + (.6 - i / 80).toFixed(2) + ')'; x.beginPath(); x.arc(170 + Math.cos(a) * r, 150 + Math.sin(a) * r * .7, 1.2, 0, 7); x.fill(); }
      x.strokeStyle = red ? 'rgba(103,97,90,.6)' : 'rgba(221,188,137,.6)'; x.lineWidth = 1; x.beginPath(); x.arc(170, 150, 18 + Math.sin(t) * 3, 0, 7); x.stroke(); requestAnimationFrame(f); })(t0);
    cleanup = function () { run = false; };
    $$('[data-m]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { $$('[data-m]', $('#rB')).forEach(function (z) { z.classList.toggle('on', z === b); }); }); });
    $$('.who button', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('on'); }); });
    $('#shr').addEventListener('click', function () { var w = $$('.who button.on', $('#rB')).map(function (b) { return b.dataset.f; }); if (!w.length) return OZ.toast('pick someone'); S.makes++; save(); OZ.toast('shared with ' + w.join(', ') + ' · nowhere else'); });
    bind('.makes .rw', function (k) { OZ.toast('you sent a star back'); });
  }

  // good weather: is it a good day (night) to go out
  function weather() {
    var w = wx(), a = w.w[0], pct = function (h) { return ((h - 6) / 20 * 100).toFixed(1) + '%'; };
    room('good weather', '<svg class="horizon" viewBox="0 0 120 70"><path d="M8 52h104M36 52a24 24 0 0 1 48 0M60 14v8M33 25l5 5M87 25l-5 5M44 62h32"/></svg><p class="big ctr">' + w.y + '</p><p class="fine ctr" style="margin-top:2px">' + w.s + ' · ' + w.g + '</p>' +
      '<div class="win"><i class="ax"></i><i class="gd" style="left:' + pct(a[0]) + ';width:' + ((a[1] - a[0]) / 20 * 100) + '%"></i>' + [6, 10, 14, 18, 22, 26].map(function (h) { return '<span style="left:' + pct(h) + '">' + ((h % 12) || 12) + (h % 24 < 12 ? 'a' : 'p') + '</span>'; }).join('') + '</div>' +
      rw('wear', 'outside', 'wear', w.wear, false) + rw('go', 'around', 'what’s on in that window', places().length + ' things near you') + '<p class="fine">example weather. on a phone this comes from good weather on the device.</p>');
    bind('[data-k=go]', function () { around('all'); });
  }

  // night: calm nights, red mode, sleep sounds
  function night() {
    room('night', '<button class="rw" data-k="red">' + ic('night') + '<span class="tx">red mode now<small>dim and warm · the dot turns mint</small></span><i class="sw' + (S.red ? ' on' : '') + '"></i></button>' +
      '<button class="rw" data-k="hold">' + ic('lock') + '<span class="tx">hold messages overnight<small>from ' + S.calm + ' to 7 · your people can still reach you</small></span><i class="sw' + (S.hold ? ' on' : '') + '"></i></button>' +
      '<p class="h4 lbl">calm from</p><div class="seg">' + ['22:00', '23:00', '00:00'].map(function (t) { return '<button data-c="' + t + '"' + (t === S.calm ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
      rw('sleep', 'sleep', 'sleep sounds', 'moonwater · lost in time, on loop') + rw('home', 'home', 'home safe', 'one tap tells home you’re back. nothing else.', false) +
      '<p class="fine">calm nights start on their own. tonight fades, plans fade, the phone goes quiet.</p>');
    bind('.rw', function (k, el) { if (k === 'red') { setRed(!S.red); $('.sw', el).classList.toggle('on', !!S.red); } else if (k === 'hold') { S.hold = S.hold ? 0 : 1; save(); $('.sw', el).classList.toggle('on', !!S.hold); }
      else if (k === 'sleep') location.href = '../oz-kids/sleep/?pair=lost&intensity=.35&timer=30&enter=1' + (S.red ? '&red=1' : ''); else if (k === 'home') OZ.toast('home knows you’re back'); });
    $$('[data-c]', $('#rB')).forEach(function (b) { b.addEventListener('click', function () { S.calm = b.dataset.c; save(); night(); }); });
  }

  // trust: what home can see, what opens with age
  function trust() {
    room('trust', '<p class="h4 lbl" style="margin-top:0">what home can see</p>' + rw('t1', 'lock', 'nothing, by default', 'not your messages, not your sky, not where you are', false) +
      rw('t2', 'home', 'home safe', 'only when you tap it', false) + rw('t3', 'around', 'where you are, for one night', 'only if you turn it on · ends at 2 am', false) +
      '<p class="h4 lbl">grows with you</p>' + rw('g1', 'sleep', '6–9 · mini oz', 'home, sleep, timer, outside, friends a grown-up adds', false) + rw('g2', 'around', '10–13 · mini oz', 'around you in the daytime, approved places, messages to your list', false) +
      '<button class="rw cur" data-k="g3">' + ic('star') + '<span class="tx">14–17 · teen oz · now<small>tonight around you, plans that fade, friends nearby by choice, make for your circle</small></span></button>' + rw('g4', 'make', '18 · oz', 'all of oz, the same sky you built', false) +
      '<p class="fine">no ads. no feed. no infinite scroll. no likes count. no tracking. everything stays on this phone.</p><div class="acts"><button class="act" id="mini">see mini oz</button></div>');
    $('#mini').addEventListener('click', function () { location.href = '../oz-kids/'; });
  }

  $$('#mid [data-when]').forEach(function (b) { b.addEventListener('click', function () { WHEN = b.dataset.when; S.when = WHEN; save(); if ($('#room').classList.contains('on')) home(); else renderHome(); }); });
  $('#trustBtn').addEventListener('click', trust);
  $('#corner .oc').innerHTML = OZ.OZC; OZ.D.vp = [.5, .28];
  if (S.red) H.classList.add('red');
  tick(); setInterval(tick, 15000); renderHome(); OZ.drift($('#grid'));
  addEventListener('resize', function () { if (!$('#room').classList.contains('on')) renderHome(); });
  if (Q.open) open(Q.open);
  if (Q.trust) trust();
})();
