/* good weather · golden hour (23 Nov)
   the weather world is the day's clock. drag the rim to walk the light.
   magnetic notches at the beautiful moments. a quiet now, and a poetic line first.
   advanced features sit behind "more", all off. oz ignores Reduce Motion. */
(function () {
  'use strict';
  var Sun = window.GJSun;
  if (!Sun) return;
  var CITY = Sun.CITIES.vancouver;
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  var ADV = { more: false, path: false, times: false, env: false, clock: false, rail: false, horizon: false };
  /* start from today's weather (soft rain on the coast), not from zeros — so opening more doesn't jump the world */
  var ENV = { cloud: 0.7, haze: 0.15, wind: 0.4, angle: null, tide: 0.5 };
  var horizon = null; /* null | clear | bank | colour */
  var ev = null, live = true, target = Date.now(), disp = target, nowMs = target;
  var lastGeom = null, scrubbing = false, lastCaught = null, nums = false;
  var moments = [];
  var headingUp = false;

  function worlds() { return window.__worlds && window.__worlds.wx; }
  function clockNow() { return (window.__clock && window.__clock.now) ? window.__clock.now() : Date.now(); }

  function refreshEvents(ms) {
    ev = Sun.events(ms, CITY);
    moments = [
      { id: 'dawn',     ms: ev.dawn,          name: 'dawn',          short: 'dawn' },
      { id: 'sunrise',  ms: ev.sunrise,       name: 'sunrise',       short: 'sunrise' },
      { id: 'goldenAm', ms: ev.goldenAmEnd,   name: 'golden ends',   short: 'gold' },
      { id: 'noon',     ms: ev.noon,          name: 'solar noon',    short: 'noon' },
      { id: 'goldenPm', ms: ev.goldenPmStart, name: 'golden starts', short: 'gold' },
      { id: 'sunset',   ms: ev.sunset,        name: 'sunset',        short: 'sunset' },
      { id: 'dusk',     ms: ev.dusk,          name: 'dusk',          short: 'dusk' }
    ].filter(function (m) { return m.ms; });
  }

  function ang(ms) {
    var f = (ms - ev.noon) / 86400000;
    return f * Math.PI * 2 - Math.PI / 2;
  }
  function msFromAng(a) {
    var f = (a + Math.PI / 2) / (Math.PI * 2);
    f = ((f % 1) + 1) % 1;
    var ms = ev.noon + f * 86400000;
    if (ms >= ev.dayStart + 86400000) ms -= 86400000;
    if (ms < ev.dayStart) ms += 86400000;
    return ms;
  }
  function nearestMoment(ms, win) {
    var best = null, bd = 1e15;
    moments.forEach(function (m) {
      var d = Math.abs(m.ms - ms);
      if (d < bd) { bd = d; best = m; }
    });
    return (best && bd < (win || 8 * 60000)) ? best : null;
  }
  function snap(ms) {
    var n = nearestMoment(ms, 8 * 60000);
    return n ? n.ms : ms;
  }

  function phase(ms) {
    var p = Sun.position(ms, CITY.lat, CITY.lon);
    var alt = p.alt, az = p.az;
    if (ENV.angle != null) az = (az + ENV.angle + 360) % 360;
    var day = clamp((alt + 6) / 36, 0, 1);
    var gold = 0;
    if (alt > -4 && alt < 12) gold = Math.max(0, 1 - Math.abs(alt - 3) / 10);
    var blue = 0;
    if (alt > -8 && alt < 0) blue = Math.max(0, 1 - Math.abs(alt + 3) / 5);
    return { alt: alt, az: az, day: day, gold: gold, blue: blue, env: ENV };
  }

  /* feeling first: a short poetic line. numbers stay behind a tap. */
  function feelLine(ms, L) {
    var wx = worlds();
    var feat = (wx && wx.feature) || 'rain';
    var near = nearestMoment(ms, 14 * 60000);
    if (L.gold > 0.45) {
      if (ms > ev.noon) return feat === 'rain' ? 'rain in the gold · the coast is quiet' : 'the hour is gold';
      return feat === 'rain' ? 'a soft gold in the rain' : 'morning gold · still rising';
    }
    if (L.blue > 0.4) return feat === 'rain' ? 'blue hour · a soft rain' : 'the blue hour · hold still';
    if (L.alt < -6) return feat === 'rain' ? 'the rain keeps the night' : 'the night is clear';
    if (near && near.id === 'sunrise' && ms <= ev.sunrise) return feat === 'rain' ? 'rain at first light' : 'the sun is almost up';
    if (near && (near.id === 'sunset' || near.id === 'dusk') && ms >= ev.sunset - 20 * 60000) {
      return feat === 'rain' ? 'the rain holds the last light' : 'the last light · unhurried';
    }
    if (feat === 'fog') return 'a kind haze · the hills rest';
    if (feat === 'sun') return L.alt > 20 ? 'a clear day · easy light' : 'the light is kind';
    if (L.alt > 15) return 'a soft rain · the coast is kind';
    return 'soft rain on the coast';
  }

  function quietUnder(ms, L) {
    if (!live) {
      var n = nearestMoment(ms, 6 * 60000);
      return (n ? n.name + ' · ' : '') + 'walked · tap now to return';
    }
    return 'vancouver · now';
  }

  /* muted wooden tap — the clap idea, softened: warm, quiet, slow attack, low-pass */
  function softClap() {
    var ac = null;
    try {
      /* reuse the chime context if the host already opened one */
      var c = window.__worlds && window.__ghAc;
      if (!c) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        c = new Ctx();
      }
      if (c.state === 'suspended') c.resume();
      ac = c;
    } catch (e) { return; }
    var t = ac.currentTime;
    var n = Math.floor(ac.sampleRate * 0.14);
    var buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.014));
    var src = ac.createBufferSource(); src.buffer = buf;
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 160;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 820; lp.Q.value = 0.55;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.018, t + 0.016);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(ac.destination);
    var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 178;
    var og = ac.createGain();
    var lp2 = ac.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 640;
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.014, t + 0.014);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(lp2); lp2.connect(og); og.connect(ac.destination);
    src.start(t); src.stop(t + 0.2);
    o.start(t); o.stop(t + 0.18);
  }

  function setLines() {
    var L = phase(disp);
    var feel = $('feel'), q = $('quiet'), ck = $('clock');
    var wx = worlds(), con = window.__worlds && window.__worlds.con;
    var wxOut = wx && (wx.placed || wx.sizing || (wx.at && wx.at.x > .2));
    document.documentElement.classList.toggle('wx-away', !wxOut);
    if (!wxOut && con && (con.placed || con.sizing || (con.at && con.at.x > .15) || Math.hypot(con.pos.x, con.pos.y) > 8)) {
      var tucking = !con.placed && Math.hypot(con.pos.x, con.pos.y) > 4;
      if (feel) feel.textContent = tucking ? 'coming home' : 'the sky stays close';
      if (q) q.textContent = tucking ? 'oz · home' : 'playable · drag to move · oz to tuck';
    } else {
      if (feel) feel.textContent = feelLine(disp, L);
      if (q) q.textContent = quietUnder(disp, L);
    }
    if (ck) ck.textContent = Sun.fmt12(disp, CITY).replace(' ', ' ');
  }

  function goLive() {
    live = true; lastCaught = null;
    target = clockNow();
    setLines();
  }

  var GH = {
    light: function () {
      nowMs = clockNow();
      if (!ev) refreshEvents(nowMs);
      var L = phase(disp);
      L.env = ENV;
      L.live = live;
      L.ms = disp;
      return L;
    },
    afterDraw: function (g, info) {
      lastGeom = info;
      if (info.at < 0.18) return;
      drawArc(g, info);
      if (ADV.clock) drawClockRing(g, info);
      if (horizon) washHorizon(g, info);
    },
    rimAt: function (x, y) {
      var wx = worlds();
      if (!wx || !wx.placed || !lastGeom) return false;
      var d = Math.hypot(x - lastGeom.ox, y - lastGeom.oy);
      var r = lastGeom.R * 1.08;
      return d > r * 0.82 && d < r * 1.42;
    },
    rimRad: function () { return lastGeom ? lastGeom.R * 1.42 : 0; },
    scrubStart: function (x, y) { scrubbing = true; live = false; GH.scrub(x, y); },
    scrub: function (x, y) {
      if (!lastGeom || !ev) return;
      var a = Math.atan2(y - lastGeom.oy, x - lastGeom.ox);
      var ms = snap(msFromAng(a));
      var caught = nearestMoment(ms, 8 * 60000);
      if (caught && (!lastCaught || lastCaught.id !== caught.id) && Math.abs(caught.ms - ms) < 2000) {
        softClap();
        lastCaught = caught;
      } else if (!caught) lastCaught = null;
      target = ms; disp = ms; live = false;
      setLines();
    },
    scrubEnd: function () { scrubbing = false; },
    goHome: function () {
      goLive();
      closeMore();
      nums = false;
      var rest = $('rest'); if (rest) rest.classList.remove('nums');
      document.documentElement.classList.remove('show-nums');
    },
    prepareShot: function (name) { closeMore(true); nums = false; var r = $('rest'); if (r) r.classList.remove('nums'); },
    applyShot: applyShot
  };
  window.GH = GH;

  function drawArcSeg(g, ox, oy, r, a0, a1, n) {
    /* sunrise rose → noon pale → sunset gold */
    for (var i = 0; i < n; i++) {
      var u0 = i / n, u1 = (i + 1) / n;
      var aA = a0 + (a1 - a0) * u0, aB = a0 + (a1 - a0) * u1;
      var mid = (u0 + u1) / 2;
      var col;
      if (mid < 0.45) col = 'rgba(255, 150, 150,' + (0.35 + mid * 0.3).toFixed(3) + ')';
      else if (mid < 0.7) col = 'rgba(255, 200, 170,' + (0.4 + (mid - 0.45) * 0.4).toFixed(3) + ')';
      else col = 'rgba(255, 186, 110,' + (0.5 + (mid - 0.7) * 0.5).toFixed(3) + ')';
      g.strokeStyle = col; g.lineWidth = 1.6; g.lineCap = 'round';
      g.beginPath(); g.arc(ox, oy, r, aA, aB); g.stroke();
    }
  }

  function drawArc(g, info) {
    var ox = info.ox, oy = info.oy, R = info.R, at = info.at;
    var r = R * 1.08;
    g.save();
    g.globalAlpha = 0.55 + 0.45 * at;
    g.strokeStyle = 'rgba(255,68,87,0.16)';
    g.lineWidth = 1;
    g.beginPath(); g.arc(ox, oy, r, 0, Math.PI * 2); g.stroke();
    if (ev.sunrise && ev.sunset) drawArcSeg(g, ox, oy, r, ang(ev.sunrise), ang(ev.sunset), 42);
    moments.forEach(function (m) {
      var a = ang(m.ms);
      var inner = r - 3, outer = r + ((m.id === 'noon' || m.id === 'sunrise' || m.id === 'sunset' || m.id.indexOf('golden') === 0) ? 7 : 5);
      var goldish = m.id.indexOf('golden') === 0 || m.id === 'sunset' || m.id === 'sunrise';
      g.strokeStyle = goldish ? 'rgba(255,190,120,0.85)' : 'rgba(255,68,87,0.65)';
      g.lineWidth = 1.15;
      g.beginPath();
      g.moveTo(ox + Math.cos(a) * inner, oy + Math.sin(a) * inner);
      g.lineTo(ox + Math.cos(a) * outer, oy + Math.sin(a) * outer);
      g.stroke();
    });
    var a = ang(disp);
    var p = Sun.position(disp, CITY.lat, CITY.lon);
    var sx = ox + Math.cos(a) * r, sy = oy + Math.sin(a) * r;
    var gold = Math.max(0, 1 - Math.abs(p.alt - 3) / 10);
    var col = p.alt < -6 ? 'rgba(255,68,87,0.4)' : (gold > 0.2 ? 'rgba(255,190,120,' + (0.7 + gold * 0.3) + ')' : 'rgba(255,68,87,0.9)');
    g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 10;
    g.beginPath(); g.arc(sx, sy, p.alt > -0.8 ? 4.2 : 3, 0, Math.PI * 2); g.fill();
    g.shadowBlur = 0;
    if (!live) {
      var an = ang(clockNow());
      g.strokeStyle = 'rgba(255,68,87,0.45)'; g.lineWidth = 1;
      g.beginPath();
      g.moveTo(ox + Math.cos(an) * (r - 6), oy + Math.sin(an) * (r - 6));
      g.lineTo(ox + Math.cos(an) * (r + 8), oy + Math.sin(an) * (r + 8));
      g.stroke();
    }
    g.restore();
  }

  function drawClockRing(g, info) {
    /* light-tide dress: noon at the top, a longer hand, quiet words */
    var ox = info.ox, oy = info.oy, r = info.R * 1.22;
    g.save();
    g.globalAlpha = 0.9;
    g.strokeStyle = 'rgba(255,68,87,0.28)';
    g.lineWidth = 1.2;
    g.beginPath(); g.arc(ox, oy, r, 0, Math.PI * 2); g.stroke();
    /* hand from centre to the bead, a little past the rim */
    var a = ang(disp);
    g.strokeStyle = 'rgba(255,186,120,0.8)';
    g.lineWidth = 1.4; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(ox + Math.cos(a) * (r * 0.15), oy + Math.sin(a) * (r * 0.15));
    g.lineTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r);
    g.stroke();
    g.fillStyle = 'rgba(255,68,87,0.55)';
    g.font = '300 9px Poppins, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('noon', ox, oy - r - 10);
    g.fillText('midnight', ox, oy + r + 10);
    g.restore();
  }

  function washHorizon(g, info) {
    var ox = info.ox, oy = info.oy, R = info.R, at = info.at;
    var col = horizon === 'colour' ? [255, 140, 90] : horizon === 'bank' ? [120, 70, 80] : [255, 200, 180];
    var a = horizon === 'colour' ? 0.22 : horizon === 'bank' ? 0.16 : 0.12;
    var grd = g.createLinearGradient(ox, oy - R, ox, oy);
    grd.addColorStop(0, 'rgba(' + col.join(',') + ',' + (a * at) + ')');
    grd.addColorStop(1, 'rgba(' + col.join(',') + ',0)');
    g.fillStyle = grd;
    g.beginPath(); g.arc(ox, oy, R * 0.98, 0, Math.PI * 2); g.fill();
  }

  /* ——— more panel ——— */
  var TOGGLES = [
    { k: 'path',    name: 'sun path',     why: 'the polar chart' },
    { k: 'times',   name: 'the times',    why: 'golden · blue · sun, in numbers' },
    { k: 'env',     name: 'environment',  why: 'cloud, haze, wind, light, tide' },
    { k: 'clock',   name: 'the clock',    why: 'a light-tide hand, noon at the top' },
    { k: 'rail',    name: 'the day’s rail', why: 'climb the moments' },
    { k: 'horizon', name: 'horizon',      why: 'clear · bank · colour' }
  ];

  function closeMore(instant) {
    ADV.more = false;
    var b = $('ghMore'), p = $('ghPanel');
    if (b) b.setAttribute('aria-pressed', 'false');
    if (p) p.hidden = true;
    document.documentElement.classList.remove('more-on');
    if (!instant) { /* leave feature toggles as the user left them, except when preparing a shot */ }
  }

  function buildPanel() {
    var box = document.querySelector('#ghPanel .gh-toggles');
    var extra = document.querySelector('#ghPanel .gh-extra');
    if (!box) return;
    box.innerHTML = '';
    TOGGLES.forEach(function (row) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'rw';
      el.setAttribute('aria-pressed', ADV[row.k] ? 'true' : 'false');
      el.innerHTML = '<span>' + row.name + '</span><i class="sw' + (ADV[row.k] ? ' on' : '') + '" aria-hidden="true"><i></i></i>';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        ADV[row.k] = !ADV[row.k];
        el.setAttribute('aria-pressed', ADV[row.k] ? 'true' : 'false');
        el.querySelector('.sw').classList.toggle('on', ADV[row.k]);
        if (row.k === 'times') revealNums(ADV.times);
        syncExtras();
      });
      box.appendChild(el);
    });
    syncExtras();
  }

  function revealNums(on) {
    nums = !!on;
    var rest = $('rest'); if (rest) rest.classList.toggle('nums', nums);
    var ck = $('clock'); if (ck) ck.hidden = !nums;
    document.documentElement.classList.toggle('show-nums', nums);
  }

  function syncExtras() {
    ['ghChart','ghEnv'].forEach(function (id) {
      var n = $(id); if (n && !n.closest('#ghPanel')) n.remove();
    });
    var extra = document.querySelector('#ghPanel .gh-extra');
    var rail = $('ghRail'), clock = $('ghClock');
    if (clock) clock.classList.toggle('on', ADV.clock);
    if (rail) {
      rail.hidden = !ADV.rail;
      if (ADV.rail) renderRail();
    }
    if (!extra) return;
    var html = '';
    if (ADV.path) html += '<canvas id="ghChart" width="192" height="192" aria-label="sun path"></canvas>';
    /* times toggle reveals the clock under the feel line, not a list over the world */
    if (ADV.env && !GH.compactShot) {
      html += '<div id="ghEnv">';
      [['cloud', 'cloud', 0, 1], ['haze', 'haze', 0, 1], ['wind', 'wind', 0, 1], ['tide', 'tide', 0, 1]].forEach(function (s) {
        html += '<label><span>' + s[1] + '</span><input type="range" min="' + s[2] + '" max="' + s[3] + '" step="0.01" data-env="' + s[0] + '" value="' + ENV[s[0]] + '" aria-label="' + s[1] + '"></label>';
      });
      html += '<label><span>light</span><input type="range" min="-60" max="60" step="1" data-env="angle" value="' + (ENV.angle || 0) + '" aria-label="light angle"></label>';
      html += '</div>';
    }
    if (ADV.horizon) {
      html += '<div id="ghTimes" class="gh-horiz">';
      ['clear', 'bank', 'colour'].forEach(function (k) {
        html += '<button type="button" data-h="' + k + '" class="' + (horizon === k ? 'on' : '') + '" style="min-height:44px;padding:0 10px;letter-spacing:.08em;text-transform:lowercase;color:var(--mid)">' + k + '</button>';
      });
      html += '</div>';
    }
    extra.innerHTML = html;
    var chart = $('ghChart');
    if (chart) document.body.appendChild(chart);
    if (ADV.path) drawPath();
    if (ADV.env) {
      extra.querySelectorAll('input[data-env]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var k = inp.getAttribute('data-env');
          if (k === 'angle') ENV.angle = +inp.value;
          else ENV[k] = +inp.value;
        });
      });
    }
    if (ADV.horizon) {
      extra.querySelectorAll('[data-h]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          horizon = b.getAttribute('data-h');
          extra.querySelectorAll('[data-h]').forEach(function (x) { x.classList.toggle('on', x === b); });
        });
      });
    }
  }

  function renderTimes() {
    var el = $('ghTimes'); if (!el || el.classList.contains('gh-horiz')) return;
    var rows = [
      ['sunrise', ev.sunrise],
      ['golden ends', ev.goldenAmEnd],
      ['solar noon', ev.noon],
      ['golden starts', ev.goldenPmStart],
      ['sunset', ev.sunset],
      ['dusk', ev.dusk]
    ];
    el.innerHTML = rows.map(function (r) {
      return '<div>' + r[0] + '<b>' + Sun.fmt12(r[1], CITY) + '</b></div>';
    }).join('');
  }

  function renderRail() {
    var el = $('ghRail'); if (!el) return;
    el.innerHTML = moments.map(function (m) {
      var on = nearestMoment(disp, 8 * 60000) && nearestMoment(disp, 8 * 60000).id === m.id;
      return '<button type="button" data-ms="' + m.ms + '" class="' + (on ? 'on' : '') + '">' + m.name + '<small>' + Sun.fmt12(m.ms, CITY) + '</small></button>';
    }).join('');
    el.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        live = false;
        target = +b.getAttribute('data-ms');
        disp = target;
        softClap();
        setLines();
        renderRail();
      });
    });
  }

  function drawPath() {
    var cv = $('ghChart'); if (!cv) return;
    var dpr = 2, W = 96, H = 96;
    if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    var cx = 48, cy = 48, R = 34;
    g.strokeStyle = 'rgba(255,68,87,0.28)'; g.lineWidth = 1;
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke(); /* horizon */
    g.beginPath(); g.arc(cx, cy, 3, 0, Math.PI * 2); g.stroke();
    /* north-up: 0 az = top. heading-up would rotate by current az. */
    function pt(az, alt) {
      var rad = ((90 - alt) / 90) * R;
      var a = (az - (headingUp ? phase(disp).az : 0)) * Math.PI / 180;
      return [cx + Math.sin(a) * rad, cy - Math.cos(a) * rad];
    }
    g.strokeStyle = 'rgba(255,186,120,0.7)'; g.lineWidth = 1.2;
    g.beginPath();
    var started = false;
    for (var m = ev.dayStart; m < ev.dayStart + 86400000; m += 8 * 60000) {
      var p = Sun.position(m, CITY.lat, CITY.lon);
      if (p.alt < -1) { started = false; continue; }
      var q = pt(p.az, p.alt);
      if (!started) { g.moveTo(q[0], q[1]); started = true; } else g.lineTo(q[0], q[1]);
    }
    g.stroke();
    var now = Sun.position(disp, CITY.lat, CITY.lon);
    if (now.alt > -4) {
      var s = pt(now.az, now.alt);
      g.fillStyle = 'rgba(255,190,120,0.95)';
      g.beginPath(); g.arc(s[0], s[1], 3.2, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(255,68,87,0.5)';
    g.font = '300 8px Poppins, sans-serif';
    g.textAlign = 'center';
    g.fillText(headingUp ? 'heading' : 'north', cx, 10);
  }

  function applyShot(name) {
    var wx = worlds(), con = window.__worlds && window.__worlds.con;
    closeMore(true);
    ADV.path = ADV.times = ADV.env = ADV.clock = ADV.rail = ADV.horizon = false;
    horizon = null; ENV.angle = null;
    live = true; lastCaught = null;
    var gold = ev && ev.goldenPmStart ? ev.goldenPmStart : Date.parse('2026-11-23T16:30:00-08:00');
    var nowV = Date.parse('2026-11-23T11:13:00-08:00');

    function placeWx() {
      if (!wx) return;
      wx.feature = 'rain'; wx.kind = 'coast';
      wx.placed = true; wx.el.classList.add('placed');
      var Saim = window.__worlds; /* springs already aimed by setShot('weather') if called */
    }

    if (name === 'simple' || name === 'weather') {
      if (window.__clock) window.__clock.freeze(nowV, 18400);
      refreshEvents(nowV); live = true; target = disp = nowV;
      if (wx) {
        wx.feature = 'rain'; wx.kind = 'coast';
        wx.placed = true; wx.el.classList.add('placed');
        wx.sc.x = wx.sc.t = 5.6; wx.at.x = wx.at.t = 1;
      }
      revealNums(false);
    } else if (name === 'advanced') {
      if (window.__clock) window.__clock.freeze(nowV, 18400);
      refreshEvents(nowV); live = true; target = disp = nowV;
      if (wx) { wx.feature = 'rain'; wx.kind = 'coast'; wx.placed = true; wx.el.classList.add('placed'); wx.sc.x = wx.sc.t = 5.6; wx.at.x = wx.at.t = 1; }
      ADV.more = ADV.path = ADV.times = ADV.env = true;
      GH.compactShot = true;
      $('ghMore').setAttribute('aria-pressed', 'true');
      $('ghPanel').hidden = false;
      document.documentElement.classList.add('more-on');
      revealNums(true);
      buildPanel();
      GH.compactShot = false;
    } else if (name === 'clock') {
      if (window.__clock) window.__clock.freeze(gold, 22000);
      refreshEvents(gold); live = false; target = disp = gold;
      if (wx) { wx.feature = 'rain'; wx.kind = 'coast'; wx.placed = true; wx.el.classList.add('placed'); wx.sc.x = wx.sc.t = 5.6; wx.at.x = wx.at.t = 1; }
      ADV.clock = true; syncExtras();
      revealNums(false);
    } else if (name === 'rail') {
      if (window.__clock) window.__clock.freeze(gold, 22000);
      refreshEvents(gold); live = false; target = disp = gold;
      if (wx) { wx.feature = 'rain'; wx.kind = 'coast'; wx.placed = true; wx.el.classList.add('placed'); wx.sc.x = wx.sc.t = 5.6; wx.at.x = wx.at.t = 1; }
      ADV.rail = true; syncExtras();
      revealNums(false);
    } else if (name === 'float') {
      if (window.__clock) window.__clock.freeze(nowV, 20000);
      refreshEvents(nowV); live = true; target = disp = nowV;
      if (con) {
        con.placed = true; con.el.classList.add('placed');
        con.sc.x = con.sc.t = 5.6; con.at.x = con.at.t = 1;
        con.pos.x = con.pos.tx = 70;
        con.pos.y = con.pos.ty = 250;
        con.ring[2] = performance.now() - 80;
        con.ring[3] = performance.now() - 240;
      }
      if (wx) { wx.placed = false; wx.el.classList.remove('placed'); wx.sc.x = wx.sc.t = 1; wx.at.x = wx.at.t = 0; }
    } else if (name === 'return' || name === 'home') {
      if (window.__clock) window.__clock.freeze(nowV, 20000);
      refreshEvents(nowV);
      if (con) {
        /* mid-tuck: still off the corner, shrinking home */
        con.placed = false; con.el.classList.remove('placed', 'sizing');
        con.sc.x = con.sc.t = 2.15; con.at.x = con.at.t = 0.32;
        con.pos.x = con.pos.tx = 14;
        con.pos.y = con.pos.ty = 36;
      }
      if (wx) { wx.placed = false; wx.el.classList.remove('placed'); wx.sc.x = wx.sc.t = 1; wx.at.x = wx.at.t = 0; }
    }
    setLines();
  }

  function boot() {
    nowMs = clockNow();
    refreshEvents(nowMs);
    target = disp = nowMs;
    buildPanel();
    var more = $('ghMore');
    if (more) more.addEventListener('click', function (e) {
      e.stopPropagation();
      ADV.more = !ADV.more;
      more.setAttribute('aria-pressed', ADV.more ? 'true' : 'false');
      $('ghPanel').hidden = !ADV.more;
      document.documentElement.classList.toggle('more-on', ADV.more);
      if (ADV.more) buildPanel();
    });
    var feel = $('feel');
    if (feel) feel.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!live) { goLive(); return; }
      revealNums(!nums);
    });
    setLines();
    /* opening lands on now, weather already a little world — unless a still asked otherwise */
    var q = location.search || '';
    var m = /[?&]shot=([a-z]+)/.exec(q);
    if (m) {
      applyShot(m[1]);
    } else {
      var wx = worlds();
      if (wx && !wx.placed) {
        setTimeout(function () {
          if (wx.placed || wx.sizing) return;
          wx.beginSize();
          setTimeout(function () { if (wx.sizing) wx.commitSize(); }, 280);
        }, 240);
      }
    }
    requestAnimationFrame(tick);
  }

  function tick() {
    nowMs = clockNow();
    if (!ev) refreshEvents(nowMs);
    /* new local day? */
    if (nowMs < ev.dayStart || nowMs >= ev.dayStart + 86400000) refreshEvents(nowMs);
    if (live && !scrubbing) target = nowMs;
    if (!scrubbing) {
      var k = 0.16;
      disp += (target - disp) * k;
      if (Math.abs(target - disp) < 900) disp = target;
    }
    setLines();
    if (ADV.path) drawPath();
    if (ADV.rail) { /* rail state is event-driven; a light refresh keeps the 'on' mark honest */ }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
