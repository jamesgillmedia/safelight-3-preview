/* oz one (r4, items 10 and 19) · Good Weather, layered from simplest to deepest. It reads the sun and the weather together,
   the way you'd read a day for a shoot, and gives an honest, positive view of it — never gloomy, never oversold. It leads
   Golden Hour: the glance is the room's headline, and a pinch in goes deeper, a pinch out rises.
     1 glance ........ one honest line and one mark (also the widget, the watch face and a small floating dial)
     2 day read ...... the sun's arc and the weather as one strip across the day, the best windows lit
     3 windows ....... golden and blue hour, clearings, wind lulls (tides and moonrise only where a source has them)
     4 sky detail .... cloud by height, rain, wind, moon phase … only what the forecast has; the rest is left out quietly
     5 environment ... a living version of right now, for where you are (placeMatch slot) or a place you pick; the ✨ dial
                       and the Light-tide clock tune it; White Noise's beds play under it. Location stays on this phone.
     6 memory ........ your own past days in light like this (feedPicker slot; example cards)
     7 making ........ straight into the production timer, the setup estimate and red mode
   Only the readings the app already has (GJ.weather: live, snapshot or sample — each says which). No reading is invented.
     GJ.goodWeather.open(level) · close() · level() · glanceText() */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, clamp = GJ.clamp;
  function S() { return store.get(); }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function priv(n) { return G.oz && G.oz.private ? G.oz.private.get(n) : null; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function city() { return GJ.Sun.CITIES[S().city] || GJ.Sun.CITIES.vancouver; }
  function f12(ms) { return ms == null ? '' : (GJ.Sun.fmt12 ? GJ.Sun.fmt12(ms, city()) : GJ.Sun.fmt(ms, city())); }
  var HR = 3600000, NAMES = ['glance', 'day read', 'windows', 'sky detail', 'environment', 'memory', 'making'];

  /* ---------- the reading: today, from what the app already has ---------- */
  function read(ms) {
    ms = ms || Date.now(); var c = city(), e = GJ.Sun.events(ms, c), w = GJ.weather ? GJ.weather.forDay(ms, c, e) : null;
    var lay = GJ.weather && GJ.weather._layers && GJ.weather._layers[c.id] || null;
    return { c: c, e: e, w: w, lay: lay, now: Date.now() };
  }
  function nextGolden(R) { var n = R.now, e = R.e; if (e.goldenPmStart && n < e.goldenPmStart) return e.goldenPmStart; if (e.sunrise && n < e.sunrise) return e.sunrise; return null; }
  function glanceText(R) {
    R = R || read(); var e = R.e, n = R.now, g = nextGolden(R), w = R.w, bits = [];
    if (g) bits.push('good light at ' + f12(g)); else if (e.sunset && n < e.sunset) bits.push('soft light now · sunset ' + f12(e.sunset)); else if (e.dusk && n < e.dusk) bits.push('blue hour now'); else bits.push('a night for the stars · sunrise ' + f12(GJ.Sun.events(n + 86400000, R.c).sunrise));
    if (w && w.facts) { var dry = /(\d+)% dry/.exec(w.facts); if (dry) bits.push(+dry[1] >= 70 ? 'mostly dry' : +dry[1] >= 40 ? 'showers about' : 'a wet, soft day'); }
    return bits.join(' · ');
  }
  function mark(R) { var w = R.w; return w ? w.name : 'clear'; }
  function src(R) { return R.w && R.w.src ? R.w.src : 'the sun only · no forecast here'; }

  /* ---------- the room: seven levels ---------- */
  var el = document.createElement('section'); el.id = 'gw'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'good weather'); el.hidden = true;
  el.innerHTML = '<header class="gw-h"><b class="jul">good weather</b><span class="gw-lv" role="tablist" aria-label="how deep"></span><button type="button" class="gw-x">done</button></header>' +
    '<div class="gw-body"></div><p class="gw-foot">pinch in to go deeper · pinch out to rise</p>';
  document.body.appendChild(el);
  var body = el.querySelector('.gw-body'), lvEl = el.querySelector('.gw-lv'), level = 0, on = false, kind = null, envRAF = 0;
  lvEl.innerHTML = NAMES.map(function (n, i) { return '<button type="button" role="tab" data-l="' + i + '" aria-label="' + n + '"><i></i></button>'; }).join('');
  function setLevel(i, quiet) { i = clamp(i, 0, NAMES.length - 1); if (i === level && !quiet && body.firstChild) return; level = i; paint(); if (!quiet) hap('commit'); if (GJ.dial && GJ.dial.visible) GJ.dial.redraw(); }
  function paint() {
    [].forEach.call(lvEl.children, function (b, i) { b.setAttribute('aria-selected', i === level ? 'true' : 'false'); });
    cancelAnimationFrame(envRAF); el.classList.toggle('gw-env', level === 4);
    var R = read(), L = [glance, dayRead, windows, detail, envRoom, memory, making][level];
    body.innerHTML = '<h2 class="jul gw-t">' + NAMES[level] + '</h2>' + L(R) ;
    var cv = body.querySelector('canvas[data-k]'); if (cv) ({ strip: strip, wins: strip, env: env })[cv.dataset.k](cv, R);
    if (level === 4) envStart(R);
  }
  // 1 · glance
  function glance(R) {
    var line = glanceText(R);
    return '<div class="gw-glance"><i class="gw-mark" data-k="' + esc(mark(R)) + '" aria-hidden="true"></i><p>' + esc(line) + '</p><small>' + esc(R.w ? R.w.lines[0] : '') + '</small></div>' + dayLine(R) +
      // 24 Nov: honest labels. These are pictures of the surface; on the phone the watch's own Light line reads this same glance
      '<div class="gw-as"><figure class="gw-widget" aria-label="a picture of the glance as a widget"><i class="gw-mark sm" aria-hidden="true"></i><p>' + esc(line) + '</p><figcaption>widget · a picture</figcaption></figure>' +
      '<figure class="gw-watch" aria-label="a picture of the glance as a watch face"><div><i class="gw-mark sm" aria-hidden="true"></i><p>' + esc(line.split(' · ')[0]) + '</p></div><figcaption>watch face · a picture</figcaption></figure></div>' +
      '<p class="gw-src">' + esc(src(R)) + '</p>';
  }
  /* the day's light, quietly, under the line (24 Nov): dawn to dusk as one hairline, the golden and blue windows a little
     brighter, and a dot where now is. No numbers: the deeper levels have them */
  function dayLine(R) {
    var e = R.e; if (!e || e.dayStart == null || e.sunrise == null || e.sunset == null) return '';
    function x(t) { return Math.max(0, Math.min(100, (t - e.dayStart) / (24 * HR) * 100)).toFixed(2); }
    function seg(a, b, k) { return a != null && b != null ? '<line class="' + k + '" x1="' + x(a) + '" y1="10" x2="' + x(b) + '" y2="10"/>' : ''; }
    var now = R.now >= e.dayStart && R.now < e.dayStart + 24 * HR ? '<circle class="now" cx="' + x(R.now) + '" cy="10" r="2.6"/>' : '';
    return '<svg class="gw-day" viewBox="0 0 100 20" preserveAspectRatio="none" role="img" aria-label="today\'s light, dawn to dusk' + (now ? ', and where now is' : '') + '">' +
      '<line class="all" x1="0" y1="10" x2="100" y2="10"/>' + seg(e.dawn || e.sunrise, e.dusk || e.sunset, 'day') + seg(e.dawn, e.sunrise, 'blue') + seg(e.sunrise, e.goldenAmEnd, 'gold') + seg(e.goldenPmStart, e.sunset, 'gold') + seg(e.sunset, e.dusk, 'blue') + now + '</svg>';
  }
  // 2 · day read
  function dayRead(R) { return '<canvas class="gw-strip" data-k="strip" aria-label="today\'s sun and weather as one strip"></canvas><p class="gw-line">' + esc(best(R)) + '</p><p class="gw-src">' + esc(src(R)) + '</p>'; }
  function best(R) { var e = R.e; return 'the best light · ' + f12(e.sunrise) + ' – ' + f12(e.goldenAmEnd) + ' and ' + f12(e.goldenPmStart) + ' – ' + f12(e.sunset); }
  function wins(R) {
    var e = R.e, out = [['blue hour', e.dawn, e.sunrise, 'blue'], ['golden', e.sunrise, e.goldenAmEnd, 'gold'], ['golden', e.goldenPmStart, e.sunset, 'gold'], ['blue hour', e.sunset, e.dusk, 'blue']];
    if (R.lay) {   // clearings: hours the forecast shows the low and mid cloud open (only where the forecast has them)
      var start = null; for (var h = 0; h < 24; h++) { var t = e.dayStart + h * HR, k = new Date(t + GJ.Sun.offsetFor(t, R.c) * 60000).toISOString().slice(0, 13), L = R.lay[k]; var clear = L && (L.low + L.mid) < 60;
        if (clear && start == null) start = t; if ((!clear || h === 23) && start != null) { if (t - start >= 2 * HR) out.push(['clearing', start, t, 'clear']); start = null; } }
    }
    return out.filter(function (w) { return w[1] != null && w[2] != null; });
  }
  function strip(cv, R) {
    var dpr = Math.min(2, G.devicePixelRatio || 1), r = cv.getBoundingClientRect(); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var g = cv.getContext('2d'), W = r.width, H = r.height, e = R.e, red = S().red; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var X = function (t) { return 8 + (t - e.dayStart) / (24 * HR) * (W - 16); }, ink = function (a) { return red ? 'rgba(255,68,87,' + a + ')' : 'rgba(232,228,220,' + a + ')'; };
    var hy = H * .7;
    wins(R).forEach(function (w, wi) { g.fillStyle = red ? 'rgba(255,68,87,' + (w[3] === 'gold' ? .22 : .12) + ')' : w[3] === 'gold' ? 'rgba(236,182,102,.28)' : w[3] === 'blue' ? 'rgba(78,120,205,.28)' : 'rgba(232,228,220,.1)'; g.fillRect(X(w[1]), 6, X(w[2]) - X(w[1]), H - 22);
      if (level === 2) { g.fillStyle = ink(.8); g.font = '300 9.5px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText(w[0], (X(w[1]) + X(w[2])) / 2, wi % 2 ? 26 : 14); } });   // 24 Nov: neighbours take turns high and low, so they never sit on each other
    g.strokeStyle = ink(.35); g.lineWidth = 1; g.beginPath(); g.moveTo(8, hy); g.lineTo(W - 8, hy); g.stroke();
    g.strokeStyle = ink(.8); g.lineWidth = 1.4; g.beginPath(); var c = R.c;
    for (var i = 0; i <= 96; i++) { var t = e.dayStart + i / 96 * 24 * HR, p = GJ.Sun.position(t, c.lat, c.lon), y = hy - Math.max(-12, p.alt) / 60 * (hy - 20); if (i) g.lineTo(X(t), y); else g.moveTo(X(t), y); } g.stroke();
    if (R.lay) { for (var h = 0; h < 24; h++) { var tt = e.dayStart + h * HR, k = new Date(tt + GJ.Sun.offsetFor(tt, c) * 60000).toISOString().slice(0, 13), L = R.lay[k]; if (!L) continue;
      g.fillStyle = ink(.08 + .3 * (L.low / 100)); g.fillRect(X(tt), hy + 4, (W - 16) / 24 - 1, 8); } }   // the cloud, low, hour by hour (where the forecast has it)
    var n = Date.now(), pn = GJ.Sun.position(n, c.lat, c.lon); g.fillStyle = red ? '#ff4457' : 'rgba(246,236,214,1)'; g.beginPath(); g.arc(X(n), hy - Math.max(-12, pn.alt) / 60 * (hy - 20), 4, 0, 6.283); g.fill();
    g.fillStyle = ink(.6); g.font = '300 9px Poppins, sans-serif'; g.textAlign = 'center'; [0, 6, 12, 18, 24].forEach(function (h) { g.textAlign = h === 0 ? 'left' : h === 24 ? 'right' : 'center'; g.fillText(h === 0 || h === 24 ? 'midnight' : h === 12 ? 'noon' : (h % 12) + (h < 12 ? ' am' : ' pm'), X(e.dayStart + h * HR), H - 4); });   // the ends sit inside the strip
  }
  // 3 · windows
  function windows(R) {
    var list = wins(R).map(function (w) { return '<li><b>' + esc(w[0]) + '</b><span>' + f12(w[1]) + ' – ' + f12(w[2]) + '</span></li>'; }).join('');
    var missing = [R.lay ? null : 'clearings', 'wind lulls', 'tides', 'moonrise'].filter(Boolean);
    return '<canvas class="gw-strip" data-k="wins" aria-hidden="true"></canvas><ul class="gw-wins">' + list + '</ul><p class="gw-src">' + esc(src(R)) + (missing.length ? ' · ' + missing.join(', ') + ' show where a source has them' : '') + '</p>';
  }
  // 4 · sky detail
  function moonPhase(ms) { var syn = 29.530588853, k = ((ms / 86400000 - 10.13) % syn + syn) % syn / syn; var n = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'last quarter', 'waning crescent'][Math.round(k * 8) % 8]; return n; }
  function detail(R) {
    var rows = [], w = R.w, c = R.c, n = R.now;
    if (R.lay) { var k = new Date(n + GJ.Sun.offsetFor(n, c) * 60000).toISOString().slice(0, 13), L = R.lay[k]; if (L) rows.push(['cloud by height', 'low ' + L.low + '% · mid ' + L.mid + '% · high ' + L.high + '%']); }
    if (w) { rows.push(['the day', w.name + ' · ' + w.facts]); }
    rows.push(['moon', moonPhase(n) + ' · worked out on this phone']);
    var gone = ['visibility', 'UV', 'air quality', 'sea state', 'rain timing', 'wind'].filter(function () { return true; });
    return '<ul class="gw-detail">' + rows.map(function (r) { return '<li><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="gw-src">' + esc(src(R)) + ' · ' + gone.join(', ') + ': only when the forecast has them, never guessed</p>';
  }
  // 5 · the environment room
  var KINDS = ['coast', 'forest', 'mountain', 'city', 'open'], placeLabel = '';
  function envRoom(R) {
    return '<div class="gw-envwrap"><canvas class="gw-envcv" data-k="env" aria-label="a living version of right now"></canvas>' +
      '<div class="gw-envui"><p class="gw-envlab"></p><div class="gw-kinds" role="group" aria-label="the place">' + KINDS.map(function (k) { return '<button type="button" data-kind="' + k + '">' + k + '</button>'; }).join('') + '<button type="button" data-kind="here">where I am</button></div>' +
      '<div class="gw-sound" role="group" aria-label="ambient sound"><button type="button" data-snd="waves">waves</button><button type="button" data-snd="rain">rain</button><button type="button" data-snd="wind">wind</button><button type="button" data-snd="off">quiet</button>' +
      '<button type="button" data-tune="env" aria-label="environment dial"><svg class="oz-envmark" viewBox="0 0 16 16" aria-hidden="true"><line x1="3.1" y1="11.3" x2="7.6" y2="3.7" fill="none" stroke="currentColor" stroke-width="0.75" stroke-linecap="round"/><line x1="7.6" y1="3.7" x2="13" y2="9.3" fill="none" stroke="currentColor" stroke-width="0.75" stroke-linecap="round"/><circle cx="3.1" cy="11.3" r="1.15" fill="currentColor"/><circle cx="7.6" cy="3.7" r="1.35" fill="currentColor"/><circle cx="13" cy="9.3" r="1.15" fill="currentColor"/></svg></button><button type="button" data-tune="light" aria-label="light-tide clock">light</button></div></div></div>';
  }
  function envStart(R) {
    var lab = body.querySelector('.gw-envlab'), pm = priv('placeMatch');
    function setK(k, label) { kind = k; placeLabel = label; lab.textContent = label + ' · ' + (R.w ? R.w.name + ' · ' + src(R) : 'the sun only'); [].forEach.call(body.querySelectorAll('[data-kind]'), function (b) { b.setAttribute('aria-pressed', b.dataset.kind === k ? 'true' : 'false'); }); }
    if (kind) setK(kind, placeLabel || kind); else if (pm) pm.match({ place: { lat: Math.round(R.c.lat * 10) / 10, lon: Math.round(R.c.lon * 10) / 10 }, weather: R.w }).then(function (m) { setK(m.kind, m.label); });
    body.querySelector('.gw-kinds').addEventListener('click', function (e) { var b = e.target.closest('[data-kind]'); if (!b) return;
      if (b.dataset.kind === 'here') { if (!navigator.geolocation || !pm) return; navigator.geolocation.getCurrentPosition(function (p) { pm.match({ place: { lat: Math.round(p.coords.latitude * 10) / 10, lon: Math.round(p.coords.longitude * 10) / 10 }, weather: R.w }).then(function (m) { setK(m.kind, m.label + ' · where you are, kept on this phone'); }); }, function () { lab.textContent = 'location not shared · pick a place'; }, { maximumAge: 600000, timeout: 8000 }); return; }
      setK(b.dataset.kind, b.dataset.kind + ' · picked'); hap('tick'); });
    body.querySelector('.gw-sound').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tune === 'env' && GJ.env) GJ.env.open(); if (b.dataset.tune === 'light' && GJ.lightTide) GJ.lightTide.open();
      if (b.dataset.snd) sound(b.dataset.snd);
      [].forEach.call(this.querySelectorAll('[data-snd]'), function (x) { x.setAttribute('aria-pressed', x.dataset.snd === snd ? 'true' : 'false'); }); });
  }
  var snd = 'off';
  function sound(k) {   // the ambient bed is White Noise's own (its beds and its level), kept within reach here
    snd = k; var go = function () { if (!GJ.noise) return; if (k === 'off') { GJ.noise.on(false); return; } store.set({ wnBlend: k === 'waves' ? 2 : k === 'rain' ? 1 : 0 }); GJ.noise.on(true); };
    if (GJ.noise) go(); else if (GJ.lazy && GJ.lazy.load) { try { GJ.lazy.load('noise').then(go, go); } catch (e) { go(); } }
  }
  var T0 = GJ.now();
  function env(cv, R) {
    var dpr = Math.min(2, G.devicePixelRatio || 1);
    function frame() {
      if (!on || level !== 4) return;
      var r = cv.getBoundingClientRect(); if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      var g = cv.getContext('2d'), W = r.width, H = r.height, s = S(), red = s.red, t = (GJ.now() - T0) / 1000;
      var at = GJ.lightTide && GJ.lightTide.at() != null ? GJ.lightTide.at() : Date.now(), p = GJ.Sun.position(at, R.c.lat, R.c.lon), alt = p.alt;
      var wind = s.windLive === false ? s.wind : (R.w && /wind|storm/.test(R.w.name) ? .8 : .35), atm = s.atmos, fog = Math.max(s.fog, R.w && /fog/.test(R.w.name) ? .6 : 0);
      var rain = R.w && /rain|drizzle|storm/.test(R.w.name), cloud = R.w && /overcast|cloud|rain|drizzle/.test(R.w.name) ? .7 : .15;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var day = clamp((alt + 6) / 18, 0, 1), gold = clamp(1 - Math.abs(alt - 3) / 9, 0, 1), warm = (GJ.lightTide ? GJ.lightTide.state().warmth : 0) * .3;
      var top = red ? [20, 2, 4] : mixc([4, 7, 14], [70, 110, 160], day), mid = red ? [40, 4, 8] : mixc(mixc([10, 16, 32], [130, 160, 190], day), [236, 170, 110], gold * .6 + Math.max(0, warm)), hor = red ? [70, 8, 14] : mixc(mixc([24, 30, 52], [176, 186, 196], day), [240, 160, 96], gold * .8 + Math.max(0, warm));
      var hy = H * .58, sg = g.createLinearGradient(0, 0, 0, hy); sg.addColorStop(0, rgb(top)); sg.addColorStop(.6, rgb(mid)); sg.addColorStop(1, rgb(hor)); g.fillStyle = sg; g.fillRect(0, 0, W, hy);
      if (day < .5) { var ns = Math.round(160 * s.density * (1 - day * 2) * (1 - cloud * .8)); for (var i = 0; i < ns; i++) { var x = (i * 97.3) % W, y = (i * 53.7) % (hy * .9), tw = .5 + .5 * Math.sin(t * 1.3 + i); g.fillStyle = red ? 'rgba(255,68,87,' + (.3 + .4 * tw) * s.starGlow + ')' : 'rgba(232,228,220,' + (.25 + .45 * tw) + ')'; g.fillRect(x, y, s.starSize * 1.2, s.starSize * 1.2); } }
      if (alt > -2) { var sx = W * (.2 + .6 * ((p.az - 90) / 180)), sy = hy - Math.max(0, alt) / 50 * hy; var gg = g.createRadialGradient(sx, sy, 0, sx, sy, 60); gg.addColorStop(0, red ? 'rgba(255,68,87,.6)' : 'rgba(255,236,200,.85)'); gg.addColorStop(1, 'rgba(255,236,200,0)'); g.fillStyle = gg; g.fillRect(sx - 60, sy - 60, 120, 120); }
      for (var cI = 0; cI < 6 * cloud; cI++) { var cx_ = ((cI * 140 + t * 8 * (.3 + wind)) % (W + 200)) - 100, cy_ = 30 + (cI * 37) % (hy * .5); g.fillStyle = red ? 'rgba(80,10,16,.35)' : 'rgba(' + Math.round(mid[0] * .8 + 40) + ',' + Math.round(mid[1] * .8 + 40) + ',' + Math.round(mid[2] * .8 + 40) + ',.35)'; g.beginPath(); g.ellipse(cx_, cy_, 90, 18, 0, 0, 6.283); g.fill(); }
      var land = red ? [10, 1, 2] : mixc([6, 9, 14], [40, 52, 50], day * .7);
      if (kind === 'coast') { var wg = g.createLinearGradient(0, hy, 0, H); wg.addColorStop(0, rgb(mixc(hor, [10, 20, 34], .45))); wg.addColorStop(1, rgb(mixc(land, [4, 8, 14], .5))); g.fillStyle = wg; g.fillRect(0, hy, W, H - hy);
        g.strokeStyle = red ? 'rgba(255,68,87,.25)' : 'rgba(232,228,220,.18)'; g.lineWidth = 1; for (var wv = 0; wv < 9; wv++) { var yy = hy + 10 + wv * wv * 3.2, amp = (1 + wv * .5) * (.5 + wind) * (1 + s.swell); g.beginPath(); for (var x2 = 0; x2 <= W; x2 += 8) { var y2 = yy + Math.sin(x2 * .03 + t * (1 + wind) + wv) * amp; if (x2) g.lineTo(x2, y2); else g.moveTo(x2, y2); } g.stroke(); }
        g.fillStyle = rgb(mixc(land, [30, 26, 20], .5)); g.beginPath(); g.moveTo(0, H); g.lineTo(0, H * .9); g.quadraticCurveTo(W * .5, H * .86, W, H * .93); g.lineTo(W, H); g.fill(); }
      else { g.fillStyle = rgb(mixc(hor, land, .6)); g.fillRect(0, hy, W, H - hy);
        if (kind === 'mountain') [[.75, .5], [.85, .7], [1, .9]].forEach(function (L, j) { g.fillStyle = rgb(mixc(hor, land, L[1])); g.beginPath(); g.moveTo(0, H); for (var x3 = 0; x3 <= W; x3 += 20) g.lineTo(x3, hy * L[0] + Math.abs(Math.sin(x3 * .011 + j * 2)) * -70 * (1.2 - j * .3) + 60); g.lineTo(W, H); g.fill(); });
        if (kind === 'forest') for (var j2 = 0; j2 < 3; j2++) { g.fillStyle = rgb(mixc(hor, land, .55 + j2 * .2)); for (var x4 = -20; x4 < W + 20; x4 += 26 - j2 * 4) { var hh = 60 + ((x4 * 7 + j2 * 13) % 50) + j2 * 30, sway = Math.sin(t * 1.4 + x4) * wind * 3 * atm, by = hy + 20 + j2 * 30; g.beginPath(); g.moveTo(x4 - 12, by); g.lineTo(x4 + sway, by - hh); g.lineTo(x4 + 12, by); g.fill(); } }
        if (kind === 'city') { for (var x5 = 0; x5 < W; x5 += 22) { var bh = 40 + ((x5 * 13) % 90); g.fillStyle = rgb(mixc(hor, land, .8)); g.fillRect(x5, hy - bh + 20, 18, bh + H); if (day < .6) for (var wy = hy - bh + 28; wy < hy + 20; wy += 9) if (((x5 + wy) * 31) % 7 < 2) { g.fillStyle = red ? 'rgba(255,68,87,.6)' : 'rgba(255,214,160,.7)'; g.fillRect(x5 + 4 + ((wy * 3) % 10), wy, 2, 3); } } }
        if (kind === 'open') { g.strokeStyle = red ? 'rgba(255,68,87,.2)' : 'rgba(180,200,160,.25)'; for (var x6 = 0; x6 < W; x6 += 5) { var gh = 10 + (x6 * 17) % 14, sw = Math.sin(t * 2 + x6 * .05) * wind * 4 * atm; g.beginPath(); g.moveTo(x6, H); g.lineTo(x6 + sw, H - gh - 20); g.stroke(); } } }
      if (fog > .01) { var fg = g.createLinearGradient(0, hy - 60, 0, H); fg.addColorStop(0, 'rgba(180,186,196,0)'); fg.addColorStop(.4, red ? 'rgba(80,10,16,' + fog * .5 + ')' : 'rgba(180,186,196,' + fog * .45 + ')'); fg.addColorStop(1, 'rgba(180,186,196,0)'); g.fillStyle = fg; g.fillRect(0, hy - 60, W, H - hy + 60); }
      if (rain) { g.strokeStyle = red ? 'rgba(255,68,87,.3)' : 'rgba(200,210,224,.3)'; g.lineWidth = 1; for (var rI = 0; rI < 90; rI++) { var rx = (rI * 61.7 + t * 40 * wind) % W, ry = (rI * 37.3 + t * 420) % H; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 3 * wind, ry + 10); g.stroke(); } }
      if (s.grain > .01) { g.fillStyle = 'rgba(255,255,255,' + s.grain * .05 + ')'; for (var q = 0; q < 300; q++) g.fillRect(Math.random() * W, Math.random() * H, 1, 1); }
      envRAF = requestAnimationFrame(frame);
    }
    envRAF = requestAnimationFrame(frame);
  }
  function mixc(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function rgb(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }
  // 6 · memory
  function memory() {
    var p = priv('feedPicker'), cards = p ? p.pick({ items: [], today: { date: new Date().toISOString().slice(0, 10), light: glanceText() }, count: 8 }).filter(function (c) { return c.reason === 'light-like-today' || c.reason === 'shot-in-this-light'; }) : [];
    var S_ = G.GJ_SAMPLES || [];
    return '<p class="gw-line">last time the light was like this</p><div class="gw-mem">' + cards.map(function (c, i) { var sm = S_[i * 3 % Math.max(1, S_.length)]; return '<figure>' + (sm ? '<img src="' + esc(sm.file) + '" alt="example frame">' : '') + '<figcaption>' + esc(c.label) + '</figcaption></figure>'; }).join('') + '</div><p class="gw-src">preview stub · example cards · your own past days gather here</p>';
  }
  // 7 · making
  function making() {
    return '<p class="gw-line">the light’s coming · get ready</p><div class="gw-make"><button type="button" data-go="timer">the production timer</button><button type="button" data-go="setup">a lighting setup estimate</button><button type="button" data-go="planner">the shot planner</button><button type="button" data-go="red">' + (S().red ? 'red mode is on' : 'red mode') + '</button></div>';
  }
  body.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (!b) return;
    if (b.dataset.go === 'red') { store.set({ red: !S().red }); paint(); return; }
    if (b.dataset.go === 'planner') { if (GJ.planner && GJ.planner.open) GJ.planner.open(); return; }   // catch-up: Shot Planner is a step inside Good Weather (it opens over the room; back returns here)
    close(); var go = function () { GJ.app.enter('red'); if (b.dataset.go === 'setup') setTimeout(function () { var x = document.getElementById('rm-est'); if (x) x.hidden = false; }, 900); };
    if (GJ.app.room && GJ.app.room !== 'red') { GJ.app.back(); setTimeout(go, 450); } else go(); });

  /* ---------- pinch: in goes deeper, out rises (out from the glance closes) ---------- */
  var P = {}, pin = null;
  el.addEventListener('pointerdown', function (e) { P[e.pointerId] = [e.clientX, e.clientY]; var k = Object.keys(P); if (k.length === 2) { var a = P[k[0]], b = P[k[1]]; pin = { d0: Math.hypot(a[0] - b[0], a[1] - b[1]), done: false }; } });
  el.addEventListener('pointermove', function (e) { if (!P[e.pointerId]) return; P[e.pointerId] = [e.clientX, e.clientY]; var k = Object.keys(P); if (!pin || k.length < 2 || pin.done) return; var a = P[k[0]], b = P[k[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d / pin.d0 > 1.3) { pin.done = true; setLevel(level + 1); } else if (d / pin.d0 < .76) { pin.done = true; if (level === 0) close(); else setLevel(level - 1); } });
  function up(e) { delete P[e.pointerId]; if (Object.keys(P).length < 2) pin = null; }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  lvEl.addEventListener('click', function (e) { var b = e.target.closest('[data-l]'); if (b) setLevel(+b.dataset.l); });
  el.querySelector('.gw-x').addEventListener('click', function () { close(); });
  el.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === '+') setLevel(level + 1); if (e.key === 'ArrowLeft' || e.key === '-') setLevel(level - 1); });

  /* ---------- every level is dialable: LEVEL on the camera dial while Good Weather is open ---------- */
  var LEVEL = { key: 'gwlevel', label: 'LEVEL', min: 0, max: NAMES.length - 1, def: 0, span: 240, unit: 1, get: function () { return level; }, step: function (v) { return Math.round(v); },
    set: function (v) { setLevel(Math.round(v), true); hap('tick'); }, notches: function () { return NAMES.map(function (n, i) { return i; }); }, fmt: function (v) { return NAMES[clamp(Math.round(v), 0, NAMES.length - 1)]; } };
  function open(l) { on = true; el.hidden = false; html.classList.add('gw-on'); setLevel(l || 0, true); requestAnimationFrame(function () { el.classList.add('in'); }); try { GJ.dial.pop([LEVEL]); } catch (e) {} hap('commit'); }
  function close() { if (!on) return; on = false; cancelAnimationFrame(envRAF); el.classList.remove('in'); html.classList.remove('gw-on'); setTimeout(function () { if (!on) el.hidden = true; }, 380); try { if (GJ.dial.popped && GJ.dial.popped()) GJ.dial.close(); } catch (e) {} }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (on) { if (level > 0) { setLevel(level - 1); return true; } close(); return true; } return ca0.apply(this, arguments); }; }

  /* ---------- Golden Hour: the glance is its headline (item 10); its floating dial; the dials, current / optimized ---------- */
  var gh = document.getElementById('r-golden');
  if (gh) {
    var head = document.createElement('button'); head.type = 'button'; head.id = 'gh-glance'; head.className = 'hit'; gh.insertBefore(head, gh.firstChild);
    var fl = document.createElement('button'); fl.type = 'button'; fl.id = 'gw-float'; fl.setAttribute('aria-label', 'good weather: the environment room'); fl.innerHTML = '<i class="gw-mark sm" aria-hidden="true"></i>'; gh.appendChild(fl);
    function headPaint() { var R = read(), t = glanceText(R); head.innerHTML = '<i class="gw-mark sm" aria-hidden="true"></i><span>' + esc(t) + '</span><em>pinch in · deeper</em>'; head.setAttribute('aria-label', 'good weather: ' + t + '. Opens the layers.'); }
    head.addEventListener('click', function (e) { e.stopPropagation(); open(0); });
    // the small floating dial: drag it anywhere on Golden Hour; a tap opens the environment room
    (function () { var d = null, pos = { x: .82, y: .78 }; try { var sv = JSON.parse(GJ.settings.getItem('gj-gwfloat') || 'null'); if (sv) pos = sv; } catch (e) {}
      function place() { fl.style.left = (pos.x * 100) + '%'; fl.style.top = (pos.y * 100) + '%'; } place();
      fl.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); try { fl.setPointerCapture(e.pointerId); } catch (x) {} d = { x: e.clientX, y: e.clientY, moved: false }; });
      fl.addEventListener('pointermove', function (e) { if (!d) return; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) d.moved = true; if (d.moved) { pos = { x: clamp(e.clientX / G.innerWidth, .06, .94), y: clamp(e.clientY / G.innerHeight, .12, .92) }; place(); } });
      fl.addEventListener('pointerup', function () { if (!d) return; var m = d.moved; d = null; if (m) { try { GJ.settings.setItem('gj-gwfloat', JSON.stringify(pos)); } catch (x) {} } else open(4); }); })();
    // pinch in on Golden Hour's headline area opens Good Weather a level in
    var R0 = GJ.rooms && GJ.rooms.golden;
    if (R0) {
      var enter0 = R0.enter; R0.enter = function () { var r = enter0.apply(this, arguments); headPaint(); return r; };
      var rings0 = R0.rings;   // the current dials, exactly as they are
      R0.rings = function () { var cur = rings0.apply(this, arguments); if (S().ghDials !== 'optimized') return cur; return [cur[0], LEVEL_GH]; };
      var LEVEL_GH = { key: 'ghlevel', label: 'GOOD WEATHER', min: 0, max: NAMES.length - 1, def: 0, span: 240, unit: 1, get: function () { return on ? level : 0; }, step: function (v) { return Math.round(v); },
        set: function (v) { var i = Math.round(v); if (i === 0 && !on) return; if (!on) open(i); else setLevel(i, true); hap('tick'); }, notches: function () { return NAMES.map(function (n, i) { return i; }); }, fmt: function (v) { return NAMES[clamp(Math.round(v), 0, NAMES.length - 1)]; } };
    }
    setInterval(function () { if (GJ.app && GJ.app.room === 'golden') headPaint(); }, 30000); headPaint();
  }
  store.on(function (s, prev) { if (prev && s.ghDials !== prev.ghDials && GJ.app && GJ.app.room === 'golden' && GJ.rooms.golden) { try { GJ.dial.config(GJ.rooms.golden.rings()); } catch (e) {} } if (on && prev && (s.red !== prev.red) && level !== 4) paint(); });

  GJ.goodWeather = { open: open, close: close, isOpen: function () { return on; }, level: function () { return level; }, setLevel: setLevel, glanceText: function () { return glanceText(); }, read: read, names: NAMES.slice() };
})(window);
