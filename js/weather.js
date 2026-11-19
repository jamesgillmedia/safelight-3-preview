/* tools-02 · good weather — the forecast inside Golden Hour, read the way a cinematographer reads it: every sky is
   good light for something. Positive framing only, and still true: the condition is named plainly, then what it gives you.
   Source: Open-Meteo (no key) when the app runs where the network is open. Inside a sandboxed preview pages cannot reach
   the network, so a dated snapshot (taken when this was built) stands in — and says it is a snapshot. */
(function (G) {
  'use strict';
  var GJ = G.GJ;
  // Vancouver, taken 16 Nov 2026 10:50 pm (UTC−7): daily high / low °C, chance of rain %
  var SNAP = { vancouver: { at: '16 nov · 10:50 pm', now: 'partly cloudy', today: '2026-11-16', days: {
    '2026-11-16': [11.4, 5.4, 20], '2026-11-17': [10.8, 3.0, 15], '2026-11-18': [9.8, 3.0, 10], '2026-11-19': [10.3, 1.9, 10],
    '2026-11-20': [8.1, 1.9, 10], '2026-11-21': [7.8, 4.6, 25], '2026-11-22': [8.3, 4.6, 15], '2026-11-23': [8.9, 4.6, 20] } } };
  var LIVE = {}, tried = {}, LAYERS = {}, triedL = {}, TRY = null;
  /* sample skies (Gill, 17 Nov: "have tomorrow be cloudy and overcast, and the next day be rain — elements should change
     to match"). The preview cannot fetch a forecast, so the two days after today are set by hand, to see the sky, the
     lines and the day row change: tomorrow overcast, the day after rain. They are counted from today, whatever the date,
     and say `sample sky` where the source is shown. A live forecast (the app hosted where the network is open) replaces
     them. The temperatures are the snapshot's where it has that date. */
  var SAMPLE = { 1: { cloud: 96, p: 30, hi: 9.8, lo: 4.2 }, 2: { code: 63, cloud: 100, p: 85, hi: 9.1, lo: 5.6 } };

  /* Gill's words (16 Nov), from his poem: lowercase, short lines, rivers, breath, the starfield, all my relations.
     Each sky gets its two lines, verbatim. Which one: what the sky is doing first, then the hour. */
  var LINES = {
    'clear': ['the sky opens its hands', 'everything is given light'],
    'golden hour': ['the sun leans in close', 'to touch every living thing'],
    'overcast': ['a soft blanket over us', 'the light holds everyone gently'],
    'rain': ['the sky comes down to visit', 'every street a river of light'],
    'drizzle': ['a quiet blessing', 'falling soft on all my relations'],
    'fog': ['the world slows its breath', 'layers of us, drifting'],
    'mist on the water': ['the water breathes out', 'and we breathe in together'],
    'snow': ['the land in its white song', 'light rising from the ground'],
    'wind': ['the trees are singing', 'their breath in every branch'],
    'storm': ['the sky drums', 'the old songs remember us'],
    'blue hour': ['between the day and the stars', 'a hum, a held note'],
    'night, clear': ['the starfield wakes', "everyone we've loved, shining"],
    'night, cloudy': ["the clouds carry our city's glow", 'a soft roof of light'],
    'haze': ['the sun goes soft and amber', 'beams reaching for us'],
    'cold and clear': ['crisp air, clear eyes', 'the mountains come close to say hello'],
    'heat': ['long golden light', 'the day stretching out to hold us']
  };
  // the hour of the shown time: night · blue · golden · day (from the Golden Hour events)
  function phase(ms, e) {
    if (!e || ms == null) return 'day';
    if (e.dawn != null && ms < e.dawn || e.dusk != null && ms > e.dusk) return 'night';
    if (ms < e.sunrise || ms > e.sunset) return 'blue';
    if (ms <= e.goldenAmEnd || ms >= e.goldenPmStart) return 'golden';
    return 'day';
  }
  // d: { code (WMO) or null, cloud %, p (chance of rain %), hi, lo, wind km/h, vis m, morning }
  function choose(d, ph) {
    var c = d.code, cloudy = d.cloud != null ? d.cloud > 70 : (c === 3);
    if (c != null && c >= 95) return 'storm';
    if (c != null && (c >= 71 && c <= 77 || c === 85 || c === 86)) return 'snow';
    if (c != null && (c >= 61 && c <= 67 || c >= 80 && c <= 82) || d.p >= 60) return 'rain';
    if (c != null && c >= 51 && c <= 57 || d.p >= 35) return 'drizzle';
    if (c === 45 || c === 48) return d.morning && c === 45 ? 'mist on the water' : 'fog';
    if (d.wind != null && d.wind > 32) return 'wind';
    if (ph === 'night') return cloudy || d.partly ? 'night, cloudy' : 'night, clear';
    if (ph === 'blue') return cloudy ? 'overcast' : 'blue hour';
    if (ph === 'golden' && !cloudy) return 'golden hour';
    if (cloudy) return 'overcast';
    if (d.vis != null && d.vis < 9000) return 'haze';
    if (d.hi != null && d.hi >= 27) return 'heat';
    if (d.lo != null && d.lo < 3) return 'cold and clear';
    return 'clear';
  }
  // how closed the sky is, 0 open … 1 a full roof (17 Nov): the sky reads it to veil the sun, hide the stars and grey the light
  function veilOf(n, d) {
    var known = d.cloud != null || d.code === 3, cover = d.cloud != null ? d.cloud / 100 : d.code === 3 ? 1 : 0;
    if (n === 'rain' || n === 'storm') return 1;
    if (n === 'drizzle') return Math.max(.75, cover);
    if (n === 'snow') return .9;
    if (n === 'fog') return .7;
    if (n === 'overcast') return Math.max(.85, cover);
    if (n === 'night, cloudy') return known ? Math.max(.7, cover) : .3;   // partly cloudy: the stars come and go
    if (n === 'mist on the water' || n === 'haze') return .3;
    if (n === 'wind') return .2;
    return 0;
  }
  function reading(d, ph) { var n = choose(d, ph); return { name: n, lines: LINES[n], good: LINES[n].join(' / '), veil: veilOf(n, d) }; }
  /* the sunset reading (Gill, 17 Nov: "use available data to determine if there are clouds on the horizon and how that
     affects sunset"). What is known for the hour of sunset decides it — low / mid / high cloud here, and low cloud about
     120 km out along the sunset's own bearing (the bank the sun has to set into):
       rain, snow or a closed sky → no sunset to see
       low cloud out on the horizon → the sun sets into it early: the bank's height above the horizon ÷ how fast the sun
         is dropping that evening in that city (so the minutes are an estimate, and say ≈)
       mid / high cloud over a clear horizon → the cloud catches the colour, best just after sunset
       nothing in the way → a clean sunset
     The layers come from the live forecast (hourly, two points — see fetchLayers). Without them only the day's cloud and
     rain are known and the reading says only that much; the preview's snapshot days know neither, and say so.
     Returned: { kind, text, bank 0–1, elev ° (the bank's top), lit 0–1 (cloud catching colour), early min, near 0–1 }.
     `near` is how close the shown time is to sunset (1 inside 50 min, 0 past 110): the sky draws the bank and the colour
     only then. Plain words, not the poem: these are facts about the sky — and short: they sit on one line of the list. */
  function s01(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function sunsetOf(d, e, c, ms) {
    if (!e || e.sunset == null) return null;
    var near = ms == null ? 1 : 1 - s01(50, 110, Math.abs(ms - e.sunset) / 60000);
    var o = { kind: 'unknown', text: 'horizon not known in this preview', bank: 0, elev: 2, lit: 0, early: 0, near: near };
    var n = choose(d, 'day');
    if (n === 'rain' || n === 'storm' || n === 'drizzle' || n === 'snow') { o.kind = 'rain'; o.text = (n === 'snow' ? 'snow' : n === 'storm' ? 'storm' : 'rain') + ' · no sunset to see'; return o; }
    if (d.low != null) {   // the layers at the hour of sunset
      var out = d.wlow != null ? Math.max(d.wlow, d.low * .6) : d.low, canvas = Math.max(d.mid || 0, d.high || 0);
      if (d.low >= 85 || (d.low >= 70 && out >= 70)) { o.kind = 'closed'; o.text = 'closed sky · no sunset to see'; }
      else if (out >= 45) {
        o.kind = 'bank'; o.bank = Math.min(1, (out - 30) / 60); o.elev = .8 + 2.6 * o.bank;
        var rate = 0; try { rate = (GJ.Sun.position(e.sunset - 600000, c.lat, c.lon).alt - GJ.Sun.position(e.sunset, c.lat, c.lon).alt) / 10; } catch (x) {}
        o.early = Math.max(3, Math.min(45, Math.round(o.elev / Math.max(.05, rate))));
        o.text = 'cloud on the horizon · gone ≈ ' + o.early + ' min early'; o.lit = canvas >= 25 && d.low < 40 ? .25 : 0;
      }
      else if (canvas > 85) { o.kind = 'veiled'; o.text = 'high overcast · a soft, muted sunset'; o.lit = .25; }
      else if (canvas >= 25) { o.kind = 'colour'; o.text = 'high cloud, clear horizon · colour likely'; o.lit = Math.max(.45, 1 - Math.abs(canvas - 55) / 60); }
      else { o.kind = 'clean'; o.text = 'clear to the horizon · a clean sunset'; }
      return o;
    }
    if (d.cloud != null) {   // only the day's cloud is known
      if (d.cloud >= 85) { o.kind = 'closed'; o.text = 'closed sky · no sunset to see'; }
      else if (d.cloud >= 35) { o.kind = 'some'; o.text = 'some cloud · it may catch colour'; o.lit = .35; }
      else { o.kind = 'clean'; o.text = 'mostly clear · a clean sunset likely'; }
      return o;
    }
    if (d.partly) { o.kind = 'some'; o.text = 'some cloud · it may catch colour'; o.lit = .35; }
    return o;
  }
  // sample horizons to try in the preview (tap the SUNSET row in Golden Hour): they stand in for that day's sky, and say `sample`
  var TRIES = { clear: { low: 5, mid: 5, high: 8, wlow: 5, cloud: 8 }, bank: { low: 15, mid: 10, high: 20, wlow: 80, cloud: 30 }, colour: { low: 5, mid: 35, high: 55, wlow: 5, cloud: 45 } };
  function hourKey(ms, c) { return new Date(ms + GJ.Sun.offsetFor(ms, c) * 60000).toISOString().slice(0, 13); }
  // a point `km` out from (lat, lon) along bearing `az` (° from north)
  function dest(lat, lon, az, km) {
    var R = 6371, d = km / R, f = lat * Math.PI / 180, l = lon * Math.PI / 180, t = az * Math.PI / 180;
    var f2 = Math.asin(Math.sin(f) * Math.cos(d) + Math.cos(f) * Math.sin(d) * Math.cos(t));
    var l2 = l + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(f), Math.cos(d) - Math.sin(f) * Math.sin(f2));
    return [f2 * 180 / Math.PI, ((l2 * 180 / Math.PI + 540) % 360) - 180];
  }
  // the hourly cloud layers, here and 120 km out toward the sunset (Open-Meteo takes several points in one request)
  function fetchLayers(c, e) {
    if (triedL[c.id] || !e || e.sunset == null) return; triedL[c.id] = true;
    try {
      var far = dest(c.lat, c.lon, GJ.Sun.position(e.sunset, c.lat, c.lon).az, 120), tz = encodeURIComponent(c.tz);
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + ',' + far[0].toFixed(3) + '&longitude=' + c.lon + ',' + far[1].toFixed(3) +
        '&hourly=cloud_cover_low,cloud_cover_mid,cloud_cover_high&timezone=' + tz + ',' + tz + '&forecast_days=4';
      fetch(url).then(function (r) { return r.json(); }).then(function (j) {
        if (!Array.isArray(j) || j.length < 2 || !j[0].hourly || !j[1].hourly) return;
        var a = j[0].hourly, b = j[1].hourly, out = {};
        a.time.forEach(function (t, i) { out[t.slice(0, 13)] = { low: a.cloud_cover_low[i], mid: a.cloud_cover_mid[i], high: a.cloud_cover_high[i], wlow: b.cloud_cover_low[i] }; });
        LAYERS[c.id] = out; GJ.weather.changed && GJ.weather.changed();
      }).catch(function () {});
    } catch (x) {}
  }
  function withLayers(d, c, e) {   // add the hour of sunset's layers to a day's reading, when the live forecast has them
    var L = e && e.sunset != null && LAYERS[c.id] && LAYERS[c.id][hourKey(e.sunset, c)];
    if (L) { d.low = L.low; d.mid = L.mid; d.high = L.high; d.wlow = L.wlow; }
    return d;
  }
  function facts(lo, hi, p) { return Math.round(lo) + '° – ' + Math.round(hi) + '° · ' + (100 - p) + '% dry'; }   // told as the good side
  function fetchLive(c) {
    if (tried[c.id]) return; tried[c.id] = true;
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,cloud_cover_mean,wind_speed_10m_max&timezone=' + encodeURIComponent(c.tz) + '&forecast_days=4';
    try {
      fetch(url).then(function (r) { return r.json(); }).then(function (j) {
        var d = j.daily, out = {};
        d.time.forEach(function (t, i) { out[t] = { code: d.weather_code[i], hi: d.temperature_2m_max[i], lo: d.temperature_2m_min[i], p: d.precipitation_probability_max[i], cloud: d.cloud_cover_mean ? d.cloud_cover_mean[i] : 0, wind: d.wind_speed_10m_max[i] }; });
        LIVE[c.id] = out; GJ.weather.changed && GJ.weather.changed();
      }).catch(function () {});
    } catch (e) {}
  }
  function dateOf(ms, c) { var d = new Date(ms + GJ.Sun.offsetFor(ms, c) * 60000); return d.toISOString().slice(0, 10); }

  GJ.weather = {
    // the good-weather reading for the time being shown: { name, lines, facts, src, hi }
    forDay: function (ms, c, e) {
      fetchLive(c); fetchLayers(c, e);
      var key = dateOf(ms, c), ph = phase(ms, e), L = LIVE[c.id] && LIVE[c.id][key], r, d;
      if (TRY && TRY.key === key && TRIES[TRY.kind]) {
        var T = TRIES[TRY.kind], S0 = SNAP[c.id] && SNAP[c.id].days[key], hi0 = L ? L.hi : S0 ? S0[0] : 10, lo0 = L ? L.lo : S0 ? S0[1] : 4;
        d = { code: null, cloud: T.cloud, p: 5, hi: hi0, lo: lo0, low: T.low, mid: T.mid, high: T.high, wlow: T.wlow, morning: e && ms < e.noon };
        r = reading(d, ph); r.facts = facts(lo0, hi0, 5); r.src = 'sample sky'; r.hi = hi0; r.sunset = sunsetOf(d, e, c, ms); if (r.sunset) r.sunset.sample = true; return r;
      }
      if (L) { d = withLayers({ code: L.code, cloud: L.cloud, p: L.p, hi: L.hi, lo: L.lo, wind: L.wind, morning: e && ms < e.noon }, c, e); r = reading(d, ph); r.facts = facts(L.lo, L.hi, L.p); r.src = 'live'; r.hi = L.hi; r.sunset = sunsetOf(d, e, c, ms); return r; }
      var S = SNAP[c.id] && SNAP[c.id].days[key];
      var ahead = Math.round((Date.parse(key) - Date.parse(dateOf(Date.now(), c))) / 86400000), Y = SAMPLE[ahead];
      if (Y) {
        var hi = S ? S[0] : Y.hi, lo = S ? Math.max(S[1], Y.lo) : Y.lo;   // cloud keeps the night in: the low is not below the sample's
        d = { code: Y.code == null ? null : Y.code, cloud: Y.cloud, p: Y.p, hi: hi, lo: lo, morning: e && ms < e.noon };
        r = reading(d, ph);
        r.facts = facts(lo, hi, Y.p); r.src = 'sample sky'; r.hi = hi; r.sunset = sunsetOf(d, e, c, ms); return r;
      }
      if (S) {
        var today = key === SNAP[c.id].today;   // the snapshot knows today's sky (partly cloudy); other days, only the numbers
        d = withLayers({ code: null, cloud: null, partly: today, p: S[2], hi: S[0], lo: S[1] }, c, e);
        r = reading(d, ph);
        r.facts = facts(S[1], S[0], S[2]); r.src = 'snapshot · ' + SNAP[c.id].at; r.hi = S[0]; r.sunset = sunsetOf(d, e, c, ms); return r;
      }
      return null;
    },
    // try a sample horizon for the day of `ms` (kind: clear · bank · colour; null = the forecast again)
    trySunset: function (kind, ms, c) { TRY = kind && TRIES[kind] ? { kind: kind, key: dateOf(ms == null ? Date.now() : ms, c || GJ.Sun.CITIES[GJ.store.get().city] || GJ.Sun.CITIES.vancouver) } : null; },
    trying: function () { return TRY ? TRY.kind : null; },
    sunsetOf: sunsetOf, lines: LINES, choose: choose, phase: phase, _live: LIVE, _layers: LAYERS
  };
})(window);
