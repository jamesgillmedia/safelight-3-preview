/* Golden Hour · local solar routine (NOAA spreadsheet equations).
   No network. Works in a browser (window.GJSun) and in node (module.exports). */
(function (root) {
  'use strict';
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  // Julian day from a JS time (ms, UTC)
  function jd(ms) { return ms / 86400000 + 2440587.5; }

  // Sun position for a UTC instant. Returns altitude, azimuth (deg) and the
  // equation of time (min) and declination (deg) used for the event solver.
  function position(ms, lat, lon) {
    var J = jd(ms), T = (J - 2451545) / 36525;
    var L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
            Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T) +
            Math.sin(3 * M * RAD) * 0.000289;
    var trueLong = L0 + C;
    var omega = 125.04 - 1934.136 * T;
    var lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
    var eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
    var eps = eps0 + 0.00256 * Math.cos(omega * RAD);
    var decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) * DEG;
    var y = Math.pow(Math.tan(eps * RAD / 2), 2);
    var eqt = 4 * DEG * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) +
      4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
      0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
    var d = new Date(ms);
    var utcMin = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + d.getUTCMilliseconds() / 60000;
    var tst = ((utcMin + eqt + 4 * lon) % 1440 + 1440) % 1440;
    var ha = tst / 4 - 180;
    var cosZ = Math.sin(lat * RAD) * Math.sin(decl * RAD) + Math.cos(lat * RAD) * Math.cos(decl * RAD) * Math.cos(ha * RAD);
    cosZ = Math.max(-1, Math.min(1, cosZ));
    var zen = Math.acos(cosZ) * DEG;
    var az = Math.atan2(Math.sin(ha * RAD), Math.cos(ha * RAD) * Math.sin(lat * RAD) - Math.tan(decl * RAD) * Math.cos(lat * RAD)) * DEG + 180;
    return { alt: 90 - zen, az: (az + 360) % 360, eqt: eqt, decl: decl };
  }

  // UTC ms when the sun crosses `alt` degrees (rising if dir<0, setting if dir>0),
  // for the local calendar day that starts at dayStartUtcMs. Two refinement passes.
  function crossing(dayStartUtcMs, lat, lon, alt, dir) {
    var noonGuess = dayStartUtcMs + 12 * 3600000 - (lon / 15) * 3600000 - ((dayStartUtcMs % 86400000 + 86400000) % 86400000);
    var t = solarNoon(dayStartUtcMs, lat, lon);
    for (var i = 0; i < 3; i++) {
      var p = position(t, lat, lon);
      var cosH = (Math.sin(alt * RAD) - Math.sin(lat * RAD) * Math.sin(p.decl * RAD)) /
                 (Math.cos(lat * RAD) * Math.cos(p.decl * RAD));
      if (cosH > 1 || cosH < -1) return null;
      var H = Math.acos(cosH) * DEG;           // degrees
      var noon = noonFor(t, lon, p.eqt, dayStartUtcMs);
      t = noon + dir * H * 4 * 60000;
    }
    return t;
    void noonGuess;
  }
  // solar noon in UTC ms for the local day
  function noonFor(refMs, lon, eqt, dayStartUtcMs) {
    var d = new Date(refMs);
    var midnightUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    var n = midnightUtc + (720 - 4 * lon - eqt) * 60000;
    // keep it inside the local day
    while (n < dayStartUtcMs) n += 86400000;
    while (n >= dayStartUtcMs + 86400000) n -= 86400000;
    return n;
  }
  function solarNoon(dayStartUtcMs, lat, lon) {
    var t = dayStartUtcMs + 12 * 3600000;
    for (var i = 0; i < 3; i++) { t = noonFor(t, lon, position(t, lat, lon).eqt, dayStartUtcMs); }
    return t;
  }

  // UTC offset (minutes, east positive) for a zone at an instant, from Intl.
  function tzOffsetMin(ms, tz) {
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      var parts = {}; f.formatToParts(new Date(ms)).forEach(function (p) { parts[p.type] = p.value; });
      var asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
      return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
    } catch (e) { return null; }
  }

  // Start of the local day (UTC ms) that contains `ms` in `city`.
  function dayStart(ms, city) {
    var off = offsetFor(ms, city);
    var local = ms + off * 60000;
    var d = new Date(local);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - off * 60000;
  }
  function nthSunday(year, month, n) {
    var first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    var day = 1 + ((0 - first + 7) % 7) + (n - 1) * 7;
    return Date.UTC(year, month - 1, day);
  }
  function lastSunday(year, month) {
    var d = new Date(Date.UTC(year, month, 0)); /* last day of month */
    return Date.UTC(year, month - 1, d.getUTCDate() - d.getUTCDay());
  }
  /* North-American / UK DST, so labels stay honest even when the box has no tz data. */
  function naOffset(ms, std, dst) {
    var y = new Date(ms).getUTCFullYear();
    var start = nthSunday(y, 3, 2) + 2 * 3600000 - std * 60000;
    var end = nthSunday(y, 11, 1) + 2 * 3600000 - dst * 60000;
    return (ms >= start && ms < end) ? dst : std;
  }
  function offsetFor(ms, city) {
    if (city.id === 'vancouver') return naOffset(ms, -480, -420);
    if (city.id === 'toronto') return naOffset(ms, -300, -240);
    if (city.id === 'london') {
      var y = new Date(ms).getUTCFullYear();
      var start = lastSunday(y, 3) + 3600000;
      var end = lastSunday(y, 10) + 3600000;
      return (ms >= start && ms < end) ? 60 : 0;
    }
    var o = city.tz ? tzOffsetMin(ms, city.tz) : null;
    return o == null ? city.fixedOffsetMin : o;
  }

  // All published events for the local day containing `ms`.
  function events(ms, city) {
    var s = dayStart(ms, city), lat = city.lat, lon = city.lon;
    var e = {
      dawn: crossing(s, lat, lon, -6, -1),
      sunrise: crossing(s, lat, lon, -0.833, -1),
      goldenAmEnd: crossing(s, lat, lon, 6, -1),
      noon: solarNoon(s, lat, lon),
      goldenPmStart: crossing(s, lat, lon, 6, 1),
      sunset: crossing(s, lat, lon, -0.833, 1),
      dusk: crossing(s, lat, lon, -6, 1)
    };
    e.dayStart = s;
    return e;
  }

  function fmt(ms, city) {
    if (ms == null) return '—';
    var d = new Date(ms + offsetFor(ms, city) * 60000);
    var h = d.getUTCHours(), m = d.getUTCMinutes() + (d.getUTCSeconds() >= 30 ? 1 : 0);
    if (m === 60) { m = 0; h = (h + 1) % 24; }
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // 12-hour clock: "5:29 pm" — or, when the app's clock is set to 24 (api.h24, set from Tune → Golden hour → Clock), "17:29"
  function fmt12(ms, city) {
    if (ms == null) return '—';
    if (api.h24) return fmt(ms, city);
    var t = fmt(ms, city).split(':'), h = +t[0], ap = h < 12 ? 'am' : 'pm';
    h = h % 12 || 12; return h + ':' + t[1] + ' ' + ap;
  }
  var CITIES = {
    vancouver: { id: 'vancouver', name: 'Vancouver', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver', fixedOffsetMin: -480 },
    toronto:   { id: 'toronto', name: 'Toronto', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto', fixedOffsetMin: -300 },
    london:    { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', fixedOffsetMin: 0 }
  };

  var api = { position: position, events: events, fmt: fmt, fmt12: fmt12, dayStart: dayStart, offsetFor: offsetFor, CITIES: CITIES, h24: false };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GJSun = api;
})(this);
