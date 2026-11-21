/* tools-02 · the Shot Planner (briefs/SHOT-PLANNER.md; Gill, 18 Nov: batch four).
   Pick a place and a date; see the light that day. In the Golden Hour room (PLAN), and in Tune.
     · Place: Vancouver · Toronto · London, a spot you add by name and latitude, longitude, or HERE (the phone's own
       position, if you allow it — it is used on the phone and goes nowhere).
     · The day: first light, sunrise, the golden and blue windows, solar noon and how high the sun gets, sunset, last
       light, the length of the day — with the compass bearing the sun rises and sets on. The curve is the sun's height
       through the day; under it, where it is each hour (height, bearing).
     · The forecast line is the app's own weather reading for that day (a sample sky in this preview).
     · SAVE keeps the plan with your notes; saved plans open with a tap and work with no connection — the astronomy is
       worked out on the phone (js/sun.js), nothing is looked up.
   A spot you add has no time zone of its own here: its times are on this phone's clock, and the panel says so.
   Kept in this browser (localStorage gj-plans). Private: nothing is sent anywhere.
   Not here yet (the brief): a map to drop the pin on, the AR view over the real scene (Golden Hour's sun chart is the
   compass view), a reminder before golden hour (needs notifications), plans linked to projects and crew. */
(function (G) {
  'use strict';
  var GJ = G.GJ, Sun = G.GJSun, html = document.documentElement, clamp = GJ.clamp; if (!Sun) return;
  var KEY = 'gj-plans', P = { seq: 0, spots: [], plans: [], spot: 'vancouver', date: '' };
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.plans) P = Object.assign(P, s0); } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  var el = document.createElement('section'); el.id = 'plan'; el.className = 'gpanel'; el.setAttribute('aria-label', 'shot planner');
  el.innerHTML = '<b class="jul">shot planner</b><p class="gp-say"></p><div class="pn-body"><div class="pn-places" role="group" aria-label="place"></div>' +
    '<div class="pn-new" hidden><input class="pn-name" type="text" maxlength="40" placeholder="name of the spot"><input class="pn-ll" type="text" maxlength="40" placeholder="latitude, longitude — 49.28, -123.12"><span><button data-a="here">here</button><button data-a="addspot">add</button></span></div>' +
    '<label class="pn-date">date<input type="date"></label><canvas class="pn-arc" aria-label="the sun\'s height through the day"></canvas><div class="pn-times"></div><div class="pn-hours"></div><p class="pn-wx"></p>' +
    '<textarea class="pn-notes" rows="2" maxlength="400" placeholder="notes for this plan"></textarea><div class="pn-saved"></div></div>' +
    '<div class="gp-act"><button data-a="save">save plan</button><button data-a="today">today</button><button data-a="close">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, say = q('.gp-say'), dateIn = q('.pn-date input'), arc = q('.pn-arc'), notes = q('.pn-notes'), last = null;
  var WIND = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function card(az) { return WIND[Math.round(az / 22.5) % 16]; }
  function zone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return null; } }
  function spots() { return Object.keys(Sun.CITIES).map(function (k) { return Sun.CITIES[k]; }).concat(P.spots); }
  function spot() { var a = spots(); for (var i = 0; i < a.length; i++) if (String(a[i].id) === String(P.spot)) return a[i]; return Sun.CITIES.vancouver; }
  function today(c) { var d = new Date(Date.now() + Sun.offsetFor(Date.now(), c) * 60000); return d.toISOString().slice(0, 10); }
  function msOf(date, c) { var p = date.split('-'), noon = Date.UTC(+p[0], +p[1] - 1, +p[2], 12); return noon - Sun.offsetFor(noon, c) * 60000; }   // noon that day, on the place's own clock
  function calc() {
    var c = spot(), date = P.date || today(c), ms = msOf(date, c), e = Sun.events(ms, c), at = function (t) { return t == null ? null : Sun.position(t, c.lat, c.lon); };
    var rise = at(e.sunrise), set = at(e.sunset), noon = at(e.noon), hours = [];
    if (e.sunrise != null && e.sunset != null) for (var t = Math.ceil(e.sunrise / 3600000) * 3600000; t <= e.sunset; t += 3600000) { var p = at(t); hours.push({ t: t, alt: p.alt, az: p.az }); }
    last = { spot: c, date: date, ms: ms, e: e, riseAz: rise ? rise.az : null, setAz: set ? set.az : null, noonAlt: noon ? noon.alt : null, len: e.sunrise != null && e.sunset != null ? e.sunset - e.sunrise : null, hours: hours, ownZone: !!c.tz && !c.mine };
    return last;
  }
  function f(t) { return Sun.fmt12(t, spot()); }
  function span(a, b) { return a == null || b == null ? '—' : f(a) + ' – ' + f(b); }
  function drawArc(r) {
    var bb = arc.getBoundingClientRect(), d = Math.min(2, G.devicePixelRatio || 1), W = Math.round(bb.width * d), H = Math.round(bb.height * d); if (!W) return; if (arc.width !== W || arc.height !== H) { arc.width = W; arc.height = H; }
    var g = arc.getContext('2d'), red = html.classList.contains('red'), ink = red ? '255,68,87' : '232,228,220', c = r.spot, t0 = r.e.dayStart, t1 = t0 + 86400000, top = Math.max(12, (r.noonAlt || 10) + 6), bot = -14;
    var X = function (t) { return (t - t0) / (t1 - t0) * W; }, Y = function (a) { return H - (a - bot) / (top - bot) * H; };
    g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(' + ink + ',.10)'; g.fillRect(0, Y(6), W, Y(-0.833) - Y(6)); g.fillStyle = 'rgba(' + ink + ',.05)'; g.fillRect(0, Y(-0.833), W, Y(-6) - Y(-0.833));   // the golden band, and the blue one under the horizon
    g.strokeStyle = 'rgba(' + ink + ',.45)'; g.lineWidth = d; g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(W, Y(0)); g.stroke();
    g.strokeStyle = 'rgb(' + ink + ')'; g.lineWidth = 1.5 * d; g.beginPath(); for (var t = t0, k = 0; t <= t1; t += 600000, k++) { var a = Sun.position(t, c.lat, c.lon).alt; if (k) g.lineTo(X(t), Y(a)); else g.moveTo(X(t), Y(a)); } g.stroke();
    g.fillStyle = 'rgba(' + ink + ',.8)'; g.font = (9 * d) + 'px Poppins, sans-serif'; g.textAlign = 'center'; [['sunrise', r.e.sunrise], ['noon', r.e.noon], ['sunset', r.e.sunset]].forEach(function (m) { if (m[1] == null) return; g.fillRect(X(m[1]) - d / 2, Y(0) - 4 * d, d, 8 * d); g.fillText(f(m[1]).replace(' ', ''), clamp(X(m[1]), 22 * d, W - 22 * d), m[0] === 'noon' ? Y(r.noonAlt) - 5 * d : Y(0) + 15 * d); });
  }
  function paint() {
    var r = calc(), e = r.e, c = r.spot, pl = q('.pn-places'); pl.innerHTML = '';
    spots().forEach(function (s) { var b = document.createElement('button'); b.dataset.s = s.id; b.textContent = s.name; if (String(s.id) === String(c.id)) b.className = 'on'; pl.appendChild(b); }); var nb = document.createElement('button'); nb.dataset.a = 'new'; nb.textContent = '+ spot'; pl.appendChild(nb);
    dateIn.value = r.date;
    var rows = [['first light', f(e.dawn)], ['sunrise', f(e.sunrise) + (r.riseAz != null ? ' · ' + Math.round(r.riseAz) + '° ' + card(r.riseAz) : '')], ['golden', span(e.sunrise, e.goldenAmEnd) + ' · ' + span(e.goldenPmStart, e.sunset)], ['blue', span(e.dawn, e.sunrise) + ' · ' + span(e.sunset, e.dusk)],
      ['solar noon', f(e.noon) + (r.noonAlt != null ? ' · ' + Math.round(r.noonAlt) + '° high' : '')], ['sunset', f(e.sunset) + (r.setAz != null ? ' · ' + Math.round(r.setAz) + '° ' + card(r.setAz) : '')], ['last light', f(e.dusk)], ['day', r.len == null ? '—' : Math.floor(r.len / 3600000) + ' h ' + Math.round(r.len % 3600000 / 60000) + ' min']];
    q('.pn-times').innerHTML = rows.map(function (x) { return '<p><i>' + x[0] + '</i><b>' + x[1] + '</b></p>'; }).join('');
    q('.pn-hours').innerHTML = r.hours.map(function (h) { return '<span><b>' + f(h.t).replace(':00', '') + '</b> ' + Math.round(h.alt) + '° ' + card(h.az) + '</span>'; }).join('');
    var wx = ''; try { var w = GJ.weather && GJ.weather.forDay(r.ms, c, e); if (w) wx = w.name + (w.facts ? ' · ' + w.facts : '') + (w.src ? ' · ' + w.src : ''); } catch (x) {} q('.pn-wx').textContent = wx || 'no forecast for this day yet';
    say.textContent = c.name.toLowerCase() + ' · ' + c.lat.toFixed(3) + ', ' + c.lon.toFixed(3) + (c.mine ? ' · times on this phone\'s clock' : '') + ' · worked out on the phone';
    var sv = q('.pn-saved'); sv.innerHTML = P.plans.length ? '<i>saved plans</i>' : ''; P.plans.slice().reverse().forEach(function (p) { var d = document.createElement('div'); d.className = 'pn-p'; d.dataset.id = p.id; d.innerHTML = '<button data-a="load"><b></b><span></span></button><button data-a="del" aria-label="remove this plan">✕</button>'; d.querySelector('b').textContent = p.spot.name + ' · ' + p.date; d.querySelector('span').textContent = p.notes || ''; sv.appendChild(d); });
    drawArc(r);
  }
  function setSpot(id) { P.spot = id; save(); if (isOpen()) paint(); else calc(); }
  function setDate(d) { if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { P.date = d; save(); } if (isOpen()) paint(); else calc(); }
  function addSpot(name, lat, lon) { lat = +lat; lon = +lon; if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null; var s = { id: 's' + (++P.seq), name: String(name || 'spot').slice(0, 40), lat: lat, lon: lon, tz: zone(), fixedOffsetMin: -new Date().getTimezoneOffset(), mine: true }; P.spots.push(s); P.spot = s.id; save(); if (isOpen()) paint(); return s; }
  function savePlan(n) { var r = last || calc(), p = { id: ++P.seq, spot: r.spot, date: r.date, notes: String(n == null ? notes.value : n).trim(), made: Date.now() }; P.plans.push(p); save(); if (isOpen()) paint(); GJ.haptic.commit(); return p; }
  function load(id) { var p = P.plans.filter(function (x) { return x.id === id; })[0]; if (!p) return null; if (!spots().some(function (s) { return String(s.id) === String(p.spot.id); })) P.spots.push(p.spot); P.spot = p.spot.id; P.date = p.date; save(); notes.value = p.notes || ''; if (isOpen()) paint(); else calc(); return p; }
  function isOpen() { return html.classList.contains('planning'); }
  function open() { html.classList.add('planning'); q('.pn-new').hidden = true; if (!P.date) { var s = GJ.store.get(); if (Sun.CITIES[s.city]) P.spot = s.city; } paint(); GJ.haptic.tick(); }
  function close() { html.classList.remove('planning'); }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
    if (b.dataset.s != null) { setSpot(b.dataset.s); return; }
    var row = b.closest('.pn-p');
    if (row) { var id = +row.dataset.id; if (a === 'load') load(id); else if (a === 'del') { if (b.textContent === '✕') { b.textContent = 'remove?'; return; } P.plans = P.plans.filter(function (x) { return x.id !== id; }); save(); paint(); } return; }
    if (a === 'close') close(); else if (a === 'new') { var n = q('.pn-new'); n.hidden = !n.hidden; if (!n.hidden) q('.pn-name').focus(); }
    else if (a === 'addspot') { var ll = q('.pn-ll').value.split(/[,\s]+/).filter(Boolean), s = addSpot(q('.pn-name').value || 'spot', ll[0], ll[1]); if (s) { q('.pn-new').hidden = true; q('.pn-name').value = q('.pn-ll').value = ''; } else say.textContent = 'latitude, longitude — two numbers, like 49.28, -123.12'; }
    else if (a === 'here') { if (!G.navigator.geolocation) { say.textContent = 'this browser has no position to give'; return; } say.textContent = 'asking the phone where it is…'; G.navigator.geolocation.getCurrentPosition(function (p) { q('.pn-ll').value = p.coords.latitude.toFixed(4) + ', ' + p.coords.longitude.toFixed(4); if (!q('.pn-name').value) q('.pn-name').value = 'here'; say.textContent = 'that is where the phone is — add it, or change the name first'; }, function () { say.textContent = 'the phone did not give its position — type the numbers instead'; }, { maximumAge: 600000, timeout: 8000 }); }
    else if (a === 'save') { var p = savePlan(); say.textContent = 'saved · ' + p.spot.name + ' · ' + p.date + ' — it works with no connection'; }
    else if (a === 'today') { P.date = today(spot()); save(); paint(); }
  });
  dateIn.addEventListener('change', function () { setDate(dateIn.value); });
  ['keydown', 'pointerdown'].forEach(function (ev) { el.addEventListener(ev, function (e) { if (e.target.closest('input, textarea')) e.stopPropagation(); }); });
  G.addEventListener('resize', function () { if (isOpen() && last) drawArc(last); });
  GJ.store.on(function (s, prev) { if (isOpen() && (!prev || s.red !== prev.red || s.clock !== prev.clock)) paint(); });
  var room = document.getElementById('r-golden'); if (room) { var pb = document.createElement('button'); pb.id = 'gh-plan'; pb.className = 'hit'; pb.innerHTML = 'plan<b>a place · a date</b>'; pb.setAttribute('aria-label', 'shot planner: a place and a date'); pb.addEventListener('click', function (e) { e.stopPropagation(); open(); }); room.appendChild(pb); }
  GJ.planner = { open: open, close: close, isOpen: isOpen, setSpot: setSpot, setDate: setDate, addSpot: addSpot, calc: calc, save: savePlan, load: load, plans: function () { return P.plans.slice(); }, spots: spots,
    state: function () { var r = last || calc(); return { open: isOpen(), spot: r.spot.id, name: r.spot.name, date: r.date, sunrise: r.e.sunrise, sunset: r.e.sunset, noon: r.e.noon, riseAz: r.riseAz, setAz: r.setAz, noonAlt: r.noonAlt, len: r.len, hours: r.hours.length, plans: P.plans.length, spots: P.spots.length }; } };
})(window);
