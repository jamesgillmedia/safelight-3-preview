/* oz one (r4) · red mode's switches, day mode, and the dot's pad.
     Tune → Red mode: Red mode · Open in red mode · Day mode · Safelight (Tone · Lightness · Full red mode)
     Day mode is a switch the person turns on: never automatic, never the default. A tap on the dot always goes to red mode.
     Photos and video are never tinted by any of it. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, tune = document.getElementById('tune');
  function S() { return store.get(); }

  /* ---------- day mode: shown when it is on and red mode is off ---------- */
  function look(s) {
    html.classList.toggle('mn-flip', !!s.mnFlip); html.classList.toggle('mn-mirror', !!s.mnMirror); html.classList.toggle('ic-flip', !!s.iconFlip); html.classList.toggle('ic-mirror', !!s.iconMirror);
    var day = !!s.dayMode && !s.red;
    html.classList.toggle('day', day);
    if (GJ.sky) GJ.sky.day = day;
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', s.red ? '#060304' : day ? '#4b6076' : '#04070b');
  }
  store.on(look); look(S());

  /* ---------- Tune rows ---------- */
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  var LIGHT = [.2, .4, .6, .8, 1];
  function near(list, v) { var bi = 0; list.forEach(function (x, i) { if (Math.abs(x - v) < Math.abs(list[bi] - v)) bi = i; }); return bi; }
  function paint(s) {
    s = s || S();
    T('openred', s.openRed === false ? 'off' : 'on');
    T('daymode', s.dayMode ? 'on' : 'off');
    var l = s.redLight == null ? 1 : s.redLight; T('redlight', Math.round(LIGHT[near(LIGHT, l)] * 100) + '%');
    T('fullsafe', s.fullSafe ? 'on' : 'off');
    T('fingerdial', s.fingerDial ? 'on' : 'off');
    T('feedon', s.feedOn === false ? 'off' : 'on');
    T('ghdials', s.ghDials === 'optimized' ? 'optimized' : 'current');
  }
  store.on(function (s) { paint(s); }); paint();
  // the environment rows (item 15): each a stored value, cycled by a tap, read back as its word
  var ENV = { envwind: ['wind', [[0, 'still'], [.4, 'breezy'], [1, 'strong']]], envgrain: ['grain', [[0, 'off'], [.5, 'fine'], [1, 'full']]], envsize: ['starSize', [[.7, 'small'], [1, 'mid'], [1.5, 'large']]],
    envglow: ['starGlow', [[.4, 'soft'], [1, 'mid'], [1.7, 'bright']]], envline: ['lineBright', [[.4, 'faint'], [1, 'mid'], [1.8, 'bright']]], envrip: ['rippleAmt', [[.5, 'small'], [1, 'mid'], [1.7, 'large']]],
    envswell: ['swell', [[0, 'calm'], [.5, 'gentle'], [1, 'heavy']]], envmotes: ['particles', [[0, 'off'], [.5, 'some'], [1, 'many']]], envbloom: ['bloom', [[0, 'off'], [1, 'on'], [1.6, 'wide']]], envvig: ['vignette', [[0, 'off'], [.4, 'soft'], [.8, 'deep']]] };
  var SW = { mnflip: 'mnFlip', mnmirror: 'mnMirror', mnspark: 'mnSpark', iconflip: 'iconFlip', iconmirror: 'iconMirror' };
  function envIdx(k, v) { var L = ENV[k][1], bi = 0; L.forEach(function (o, i) { if (Math.abs(o[0] - v) < Math.abs(L[bi][0] - v)) bi = i; }); return bi; }
  function paintEnv(s) { Object.keys(ENV).forEach(function (k) { T(k, ENV[k][1][envIdx(k, s[ENV[k][0]])][1]); }); T('envwindlive', s.windLive === false ? 'by hand' : 'live');
    Object.keys(SW).forEach(function (k) { T(k, s[SW[k]] === true || (k === 'mnspark' && s.mnSpark !== false) ? 'on' : 'off'); }); }
  store.on(paintEnv); paintEnv(S());
  if (tune) tune.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-t]'); if (!b) return;
    var k = b.dataset.t, s = S();
    if (ENV[k]) { var L = ENV[k][1], o = {}; o[ENV[k][0]] = L[(envIdx(k, s[ENV[k][0]]) + 1) % L.length][0]; if (k === 'envwind') o.windLive = false; store.set(o); }
    if (k === 'envwindlive') store.set({ windLive: s.windLive === false });
    if (SW[k]) { var o2 = {}; o2[SW[k]] = k === 'mnspark' ? s.mnSpark === false : !s[SW[k]]; store.set(o2); }
    if (k === 'envdial' && GJ.env) { if (GJ.app.tune) GJ.app.tune(false); GJ.env.open(); }
    if (k === 'openred') store.set({ openRed: s.openRed === false });
    if (k === 'ghdials') store.set({ ghDials: s.ghDials === 'optimized' ? 'current' : 'optimized' });
    if (k === 'goodweather' && GJ.goodWeather) { if (GJ.app.tune) GJ.app.tune(false); GJ.goodWeather.open(0); }
    if (k === 'feedon') { store.set({ feedOn: s.feedOn === false }); if (GJ.app.layout) GJ.app.layout(); }
    if (k === 'feed') { if (GJ.app.tune) GJ.app.tune(false); if (S().feedOn === false) store.set({ feedOn: true }); if (GJ.app.layout) GJ.app.layout(); GJ.app.enter('feed'); }
    if (k === 'iconboard') { if (GJ.app.tune) GJ.app.tune(false); GJ.app.enter('icons'); }
    if (k === 'fingerdial') { store.set({ fingerDial: !s.fingerDial }); if (GJ.mark && GJ.mark.say) GJ.mark.say('finger dial · ' + (!s.fingerDial ? 'on after a reload' : 'off'), 1800); }
    if (k === 'daymode') store.set(s.dayMode ? { dayMode: false } : { dayMode: true, red: false, fullSafe: false });   // on: red mode steps aside so the day shows
    if (k === 'redlight') { var i = near(LIGHT, s.redLight == null ? 1 : s.redLight); store.set({ redLight: LIGHT[(i + 1) % LIGHT.length], red: true }); }
  });

  /* ---------- the dot's pad: titled "safelight", with day mode and Full red mode ---------- */
  (function () {
    var pad = document.getElementById('redpad'); if (!pad) return;
    var title = document.createElement('p'); title.className = 'rp-title jul'; title.textContent = 'safelight'; pad.insertBefore(title, pad.firstChild);
    var row = document.createElement('div'); row.className = 'rp-sw';
    row.innerHTML = '<button type="button" data-k="full" aria-label="Full red mode">full red mode <b></b></button><button type="button" data-k="day" aria-label="Day mode">day mode <b></b></button>';
    pad.appendChild(row);
    function show() { var s = S(); row.querySelector('[data-k="full"] b').textContent = s.fullSafe ? 'on' : 'off'; row.querySelector('[data-k="day"] b').textContent = s.dayMode ? 'on' : 'off';
      row.querySelector('[data-k="full"]').setAttribute('aria-pressed', s.fullSafe ? 'true' : 'false'); row.querySelector('[data-k="day"]').setAttribute('aria-pressed', s.dayMode ? 'true' : 'false'); }
    store.on(show); show();
    row.addEventListener('pointerdown', function (e) { e.stopPropagation(); GJ.redpad.show(); });
    row.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); var s = S();
      if (b.dataset.k === 'full') store.set({ fullSafe: !s.fullSafe, red: true });
      // day mode from the pad: the switch is set, and red mode steps aside so the day shows (a tap on the dot brings red back)
      if (b.dataset.k === 'day') store.set(s.dayMode ? { dayMode: false } : { dayMode: true, red: false, fullSafe: false });
      GJ.haptic.tick(); GJ.redpad.show(); setTimeout(function () { if (!pad.matches(':hover')) GJ.redpad.hide(); }, 2600);
    });
  })();

  /* ---------- sheets of our own: they rise from the bottom with a grabber, drag down to put away, Back closes them first ---------- */
  var OPEN = [];
  function panel(o) {
    var el = document.createElement('section'); el.id = o.id; el.className = 'gj-sheet oz-sheet' + (o.tall ? ' oz-tall' : ''); el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', o.title);
    el.innerHTML = '<header class="oz-sh-h"><h2 class="jul">' + o.title + '</h2><button type="button" class="oz-x" aria-label="close ' + o.title + '">done</button></header>' +
      (o.sub ? '<p class="oz-sub">' + o.sub + '</p>' : '') + '<div class="oz-body"></div>' + (o.foot ? '<p class="oz-foot">' + o.foot + '</p>' : '');
    document.body.appendChild(el);
    var P = { el: el, body: el.querySelector('.oz-body'), isOpen: function () { return !el.hidden; } };
    P.open = function () {
      if (!el.hidden) return; if (GJ.app && GJ.app.tuneOpen && GJ.app.tuneOpen()) GJ.app.tune(false);
      if (o.build) o.build(P.body, P); el.hidden = false; el.scrollTop = 0; requestAnimationFrame(function () { el.classList.add('in'); });
      OPEN.push(P); if (GJ.haptic) GJ.haptic.commit(); if (o.onOpen) o.onOpen(P);
    };
    P.close = function () {
      if (el.hidden) return; el.classList.remove('in'); var i = OPEN.indexOf(P); if (i >= 0) OPEN.splice(i, 1);
      setTimeout(function () { if (!el.classList.contains('in')) el.hidden = true; }, 380); if (o.onClose) o.onClose(P);
    };
    el.querySelector('.oz-x').addEventListener('click', function () { P.close(); });
    if (GJ.sheet && GJ.sheet.attach) GJ.sheet.attach(el, P.close);
    return P;
  }
  if (GJ.app && GJ.app.closeAny) { var closeAny0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (OPEN.length) { OPEN[OPEN.length - 1].close(); return true; } return closeAny0.apply(this, arguments); }; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- the System page (oz one, item 7): opened from the foot of Tune, not part of it ---------- */
  function bytes(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }
  var sys = panel({ id: 'ozsys', title: 'System', tall: true, sub: 'what this phone keeps, and what leaves it',
    build: function (b) {
      var st = S(), f3n = 0; try { f3n = (GJ.f3 && GJ.f3.entries) ? GJ.f3.entries().length : 0; } catch (e) {}
      var ls = 0; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); ls += k.length + (localStorage.getItem(k) || '').length; } } catch (e) {}
      b.innerHTML =
        '<h3 class="jul">Privacy &amp; F3</h3><div class="oz-grp"><p class="oz-line">Everything is kept on this phone. The weather is the one fetch, and F3 shows anything that leaves.</p>' +
        '<button type="button" class="oz-row" data-a="f3">F3 log<span>see exactly what this app sends ›</span></button></div>' +
        '<h3 class="jul">Phone</h3><div class="oz-grp"><p class="oz-line quiet">nothing to set here yet</p></div>' +
        '<h3 class="jul">Watch</h3><div class="oz-grp"><p class="oz-line">' + (st.watch === 'paired' ? 'paired' : 'not paired') + ' · the watch page shows the timer and the glance</p>' +
        '<button type="button" class="oz-row" data-a="watch">Watch page<span>open ›</span></button></div>' +
        '<h3 class="jul">Mac</h3><div class="oz-grp"><p class="oz-line quiet">nothing to set here yet</p></div>' +
        '<h3 class="jul">Storage</h3><div class="oz-grp"><p class="oz-line">settings and state on this phone · ' + bytes(ls * 2) + '</p><p class="oz-line" id="oz-idb">recordings and pictures · counting…</p>' +
        '<p class="oz-line quiet">nothing is sent anywhere · version ' + esc((GJ.APP && GJ.APP.title) || 'oz') + ' · rev ' + st.rev + '</p></div>';
      try { navigator.storage.estimate().then(function (e) { var n = document.getElementById('oz-idb'); if (n) n.textContent = 'recordings and pictures · ' + bytes(e.usage || 0) + ' used on this phone'; }); } catch (e) { var n = document.getElementById('oz-idb'); if (n) n.textContent = 'recordings and pictures · kept on this phone'; }
      void f3n;
    } });
  sys.el.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a === 'f3' && GJ.f3) { sys.close(); GJ.f3.open(); }
    if (b.dataset.a === 'watch') { location.href = '../good-weather/watch.html'; }
  });
  if (tune) {
    var foot = document.createElement('div'); foot.className = 'row oz-sysrow'; foot.innerHTML = 'System<button data-t="ozsystem"><b>open</b></button>';
    var tf = tune.querySelector('.tn-foot'); tune.insertBefore(foot, tf || null);
    tune.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button[data-t="ozsystem"]'); if (b || e.target === foot) sys.open(); });
  }

  /* ---------- the Timer is a production timer (item 11): the setup estimate up front, then presets, the clock, the rest ---------- */
  (function () {
    var line = document.getElementById('rm-estline'); if (!line || !GJ.estimate) return;
    function paintEst() { var st = GJ.estimate.state(), m = GJ.estimate.minutes(); line.querySelector('span').textContent = '· ' + st.kind + ' · ' + st.lights + ' lights · about ' + m + ' min · tap to set'; }
    paintEst(); document.getElementById('rm-est').addEventListener('click', function () { setTimeout(paintEst, 0); });
    line.addEventListener('click', function (e) { e.stopPropagation(); GJ.timer.stop(); GJ.timer.setTo(GJ.estimate.minutes() * 60000); GJ.haptic.commit(); if (GJ.dial) GJ.dial.redraw(); if (GJ.mark && GJ.mark.say) GJ.mark.say('set from the setup · ' + GJ.estimate.minutes() + ' min', 1600); });
    document.getElementById('rm-pre').addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; e.stopPropagation(); GJ.timer.setTo(+b.dataset.m * 60000); GJ.haptic.tick(); if (GJ.dial) GJ.dial.redraw(); paintPre(); });
    function paintPre() { var set = Math.round(S().timer.setMs / 60000); [].forEach.call(document.querySelectorAll('#rm-pre button'), function (b) { b.classList.toggle('on', +b.dataset.m === set); }); var r = document.getElementById('rm-redb'); if (r) r.setAttribute('aria-pressed', S().red ? 'true' : 'false'); }
    store.on(paintPre); paintPre();
    document.getElementById('rm-redb').addEventListener('click', function (e) { e.stopPropagation(); store.set({ red: !S().red }); GJ.haptic.tick(); });
  })();

  /* ---------- the joins (item 12): every tool's panel puts itself away the same way — a grabber, drag down, Back first ---------- */
  var JOIN = { msg: 'messages', fr: 'friends', bal: 'balance', nm: 'navmap', kk: 'welcome', demos: 'demos', decide: 'decide', picks: 'picks', notes: 'notes', shrink: 'shrink', plan: 'planner', sweep: 'sweep', th: 'threads' };
  function joins() { if (!GJ.sheet || !GJ.sheet.attach) return; Object.keys(JOIN).forEach(function (id) { var el = document.getElementById(id), m = GJ[JOIN[id]]; if (el && m && m.close && !el.dataset.sk) GJ.sheet.attach(el, function () { m.close(); }); }); }
  joins(); setInterval(joins, 1500);   // the tools come in lazily (core/lazy.js): each gets the same behaviour as soon as it is here

  /* ---------- Tune → Tools → Messages: its defaults, kept with Messages (read here even before Messages has loaded) ---------- */
  var MZ = { typing: true, read: true, enterSends: false, skin: 0, tone: 'soft', disappear: 0 }, SKINS = ['none', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'], DIS = [[0, 'off'], [3600000, '1 hour'], [86400000, '1 day'], [604800000, '7 days']];
  function mzGet() { var live = GJ.messages && GJ.messages.prefs && GJ.messages.prefs(); if (live && typeof live === 'object' && 'typing' in live) return live; try { var o = JSON.parse(GJ.settings.getItem('gj-msg2') || 'null'); return Object.assign({}, MZ, o && o.prefs || {}); } catch (e) { return Object.assign({}, MZ); } }
  function mzSet(p) { var live = GJ.messages && GJ.messages.prefs && GJ.messages.prefs(); if (live && typeof live === 'object' && 'typing' in live) { GJ.messages.prefs(p); } else { var o = null; try { o = JSON.parse(GJ.settings.getItem('gj-msg2') || 'null'); } catch (e) {} o = o || { chats: [], n: 1 }; o.prefs = Object.assign({}, MZ, o.prefs || {}, p); try { GJ.settings.setItem('gj-msg2', JSON.stringify(o)); } catch (e) {} } mzPaint(); }
  function mzPaint() { var p = mzGet(); T('mztyping', p.typing ? 'on' : 'off'); T('mzread', p.read ? 'on' : 'off'); T('mzenter', p.enterSends ? 'on' : 'off'); T('mzskin', SKINS[p.skin] || 'none'); T('mztone', p.tone); T('mzdis', (DIS.filter(function (d) { return d[0] === p.disappear; })[0] || DIS[0])[1]); }
  mzPaint();
  if (tune) tune.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-t]'); if (!b) return; var k = b.dataset.t, p = mzGet();
    if (k === 'mztyping') mzSet({ typing: !p.typing }); if (k === 'mzread') mzSet({ read: !p.read }); if (k === 'mzenter') mzSet({ enterSends: !p.enterSends });
    if (k === 'mzskin') mzSet({ skin: (p.skin + 1) % SKINS.length }); if (k === 'mztone') { var TN = ['soft', 'bell', 'tick', 'none']; mzSet({ tone: TN[(TN.indexOf(p.tone) + 1) % TN.length] }); }
    if (k === 'mzdis') { var i = DIS.map(function (d) { return d[0]; }).indexOf(p.disappear); mzSet({ disappear: DIS[(i + 1) % DIS.length][0] }); }
  });

  GJ.ozMore = GJ.ozMore || [];   // the places sheet's 'more' and the Map read this list: { id, name, sub, cl, open }
  GJ.ozone = GJ.ozone || {};
  GJ.ozone.place = function (o) { GJ.ozMore.push(o); };
  GJ.ozone.panel = panel; GJ.ozone.esc = esc; GJ.ozone.system = sys;
  GJ.ozone.day = function () { return html.classList.contains('day'); };

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#tune [data-t="circle"]');
    if (b && GJ.circle) { GJ.circle.open(); }
  });

})(window);
