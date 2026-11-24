(function () {
  'use strict';

  var disc = document.getElementById('disc');
  var pad = document.getElementById('pad');
  var egg = document.getElementById('egg');
  var rocker = document.getElementById('rocker');
  var notch = document.getElementById('notch');
  var clockPop = document.getElementById('clockPop');
  var clockSeg = document.getElementById('clockSeg');
  var html = document.documentElement;
  var roomEl = document.getElementById('room');
  var roomFace = document.getElementById('roomFace');
  var roomTitle = document.getElementById('roomTitle');
  var gridEl = document.getElementById('grid');
  var gridFace = document.getElementById('gridFace');
  var dial = document.getElementById('dial');
  var homeIcons = document.getElementById('homeIcons');
  var qtext = document.getElementById('qtext');
  var flavEl = document.getElementById('flav');
  var readyEl = document.getElementById('ready');
  var dimmer = document.getElementById('dimmer');

  var found = false;
  var on = false;
  var padOpen = false;
  var holdT = null;
  var hideT = null;
  var centreHold = null;
  var flav = 'terminal';
  var skipReady = false;
  var bright = 1;
  var contrast = 1;

  var HOME_SET = ['phone', 'sound', 'good-weather', 'timer', 'camera', 'notes', 'friends', 'grant', 'map', 'push-radio'];
  var STARS = ['atmosphere', 'ambience', 'stars', 'fog', 'water', 'moon', 'weather'];
  var PIXEL = [
    0,0,0,1,1,0,0,0,
    0,1,0,1,1,0,1,0,
    0,0,1,1,1,1,0,0,
    1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,
    0,0,1,1,1,1,0,0,
    0,1,0,1,1,0,1,0,
    0,0,0,1,1,0,0,0
  ];

  function tick() {
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  }

  function timeParts() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return { h: h, m: m, pop: String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') };
  }

  var SEGS = {
    '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
    '5': 'afgcd', '6': 'afgecd', '7': 'abc', '8': 'abcdefg', '9': 'abfgcd'
  };

  function makeDigit(ch) {
    var d = document.createElement('div');
    d.className = 'd' + (ch === '1' ? ' one' : '');
    'abcdefg'.split('').forEach(function (s) {
      var i = document.createElement('i');
      i.className = s + (s === 'a' || s === 'd' || s === 'g' ? ' h' : ' v') + ' ' + s;
      if ((SEGS[ch] || '').indexOf(s) >= 0) i.classList.add('on');
      d.appendChild(i);
    });
    return d;
  }

  function paintClock() {
    var t = timeParts();
    clockPop.textContent = t.pop;
    var hh = String(t.h).padStart(2, '0');
    var mm = String(t.m).padStart(2, '0');
    clockSeg.innerHTML = '';
    clockSeg.appendChild(makeDigit(hh[0]));
    clockSeg.appendChild(makeDigit(hh[1]));
    var c = document.createElement('div'); c.className = 'colon'; clockSeg.appendChild(c);
    clockSeg.appendChild(makeDigit(mm[0]));
    clockSeg.appendChild(makeDigit(mm[1]));
    clockPop.setAttribute('aria-label', t.pop);
    clockSeg.setAttribute('aria-label', t.pop);
  }

  function fig(slug, size) {
    return window.OZ80 ? window.OZ80.figure(slug, size, flav) : null;
  }

  function mountDockIcons() {
    document.querySelectorAll('#arcDock .ad').forEach(function (btn) {
      var old = btn.querySelector('.fig');
      if (old) old.remove();
      var slug = btn.getAttribute('data-room');
      var wrap = document.createElement('span');
      wrap.className = 'fig';
      var s = fig(slug, 44);
      if (s) wrap.appendChild(s);
      btn.insertBefore(wrap, btn.firstChild);
    });
  }

  function mountHomeIcons() {
    homeIcons.innerHTML = '';
    HOME_SET.forEach(function (slug) {
      var rec = window.OZ80 && window.OZ80.ICONS[slug];
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-room', slug);
      b.setAttribute('aria-label', rec ? rec.label : slug);
      var s = fig(slug, 48);
      if (s) b.appendChild(s);
      var sp = document.createElement('span');
      sp.textContent = rec ? rec.label : slug;
      b.appendChild(sp);
      b.addEventListener('click', function () { openFromSlug(slug); });
      homeIcons.appendChild(b);
    });
  }

  function mountGrid() {
    gridFace.innerHTML = '';
    (window.OZ80 ? window.OZ80.ORDER : []).forEach(function (slug) {
      var rec = window.OZ80.ICONS[slug];
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-room', slug);
      b.setAttribute('aria-label', rec.label);
      var s = fig(slug, 56);
      if (s) b.appendChild(s);
      var sp = document.createElement('span');
      sp.textContent = rec.label;
      b.appendChild(sp);
      b.addEventListener('click', function () { openFromSlug(slug); });
      gridFace.appendChild(b);
    });
  }

  function mountDial() {
    var ring = document.getElementById('dialRing');
    if (ring.childElementCount) return;
    STARS.forEach(function (name, i) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'star';
      el.textContent = name;
      el.style.setProperty('--r', (360 / STARS.length) * i + 'deg');
      el.addEventListener('click', function (e) { e.stopPropagation(); });
      ring.appendChild(el);
    });
  }

  function remount() {
    mountDockIcons();
    mountHomeIcons();
    mountGrid();
    presentIcons(on);
  }

  function presentIcons(v) {
    if (window.OZ80) window.OZ80.presentAll(document, v);
  }

  function applyFlavClass() {
    html.classList.remove('flav-terminal', 'flav-neon', 'flav-bit');
    if (on) html.classList.add('flav-' + flav);
    if (flavEl) {
      flavEl.querySelectorAll('[data-flav]').forEach(function (b) {
        b.setAttribute('aria-checked', b.getAttribute('data-flav') === flav ? 'true' : 'false');
      });
    }
  }

  function setFlavour(name) {
    if (name !== 'terminal' && name !== 'neon' && name !== 'bit') name = 'terminal';
    flav = name;
    applyFlavClass();
    remount();
    if (!roomEl.hidden) {
      var slug = roomEl.getAttribute('data-slug');
      if (slug) openRoom(slug, true);
    }
  }

  function showReady() {
    if (skipReady || !readyEl) return;
    readyEl.hidden = false;
    setTimeout(function () { readyEl.hidden = true; }, 1100);
  }

  function typeLine(el, text, done) {
    el.textContent = '';
    var i = 0;
    var t = setInterval(function () {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(t);
        if (done) done();
      }
    }, 55);
  }

  function setEighties(v) {
    var was = on;
    on = !!v;
    html.classList.toggle('eighties', on);
    clockSeg.hidden = !on;
    clockPop.hidden = on;
    rocker.setAttribute('aria-checked', on ? 'true' : 'false');
    dimmer.hidden = !on;
    if (flavEl) flavEl.hidden = !(on && found);
    qtext.textContent = on ? (flav === 'terminal' ? 'a late phosphor evening' : flav === 'bit' ? 'a quiet desktop' : 'a late neon evening') : 'a late red evening';
    applyFlavClass();
    remount();
    paintClock();
    if (on && !was) showReady();
  }

  function revealEgg() {
    if (found) return;
    found = true;
    egg.hidden = false;
    notch.classList.add('lit');
    if (flavEl && on) flavEl.hidden = false;
    tick();
  }

  function showPad() {
    padOpen = true;
    pad.classList.add('on');
    pad.setAttribute('aria-hidden', 'false');
    if (found) {
      egg.hidden = false;
      if (flavEl && on) flavEl.hidden = false;
    }
    later();
  }

  function hidePad() {
    padOpen = false;
    pad.classList.remove('on');
    pad.setAttribute('aria-hidden', 'true');
    clearTimeout(hideT);
  }

  function later() {
    clearTimeout(hideT);
    hideT = setTimeout(hidePad, 3200);
  }

  function syncChrome() {
    html.classList.toggle('inside', !roomEl.hidden || !gridEl.hidden);
  }

  function closeOverlays() {
    roomEl.hidden = true;
    gridEl.hidden = true;
    dial.hidden = true;
    hidePad();
    syncChrome();
  }

  function goHome() {
    closeOverlays();
  }

  function openGrid() {
    closeOverlays();
    gridEl.hidden = false;
    syncChrome();
    presentIcons(on);
  }

  function openDial() {
    hidePad();
    roomEl.hidden = true;
    gridEl.hidden = true;
    dial.hidden = false;
    syncChrome();
  }

  function sunFace() {
    var wrap = document.createElement('div');
    wrap.className = 'gw';
    var sun = document.createElement('div');
    sun.className = 'pixsun';
    PIXEL.forEach(function (v) {
      var i = document.createElement('i');
      if (v) i.className = 'on';
      sun.appendChild(i);
    });
    var sc = document.createElement('div');
    sc.className = 'scanline';
    sun.appendChild(sc);
    wrap.appendChild(sun);
    var r = document.createElement('div');
    r.className = 'tele';
    wrap.appendChild(r);
    typeLine(r, 'golden hour');
    return wrap;
  }

  function cassFace() {
    var c = document.createElement('div');
    c.className = 'walkman';
    c.innerHTML =
      '<div class="win"><div class="reel r1"></div><div class="reel r2"></div></div>' +
      '<div class="row"><span class="play" aria-hidden="true"></span><span class="vu-needle"><i></i></span></div>';
    return c;
  }

  function phoneFace() {
    var w = document.createElement('div');
    w.className = 'phone-machine';
    w.innerHTML =
      '<div class="handset" aria-hidden="true">' +
      '<svg viewBox="0 0 200 240">' +
      '<path fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" ' +
      'd="M58 36c0-16 84-16 84 0v20c0 10-16 16-28 16h-8v96h8c12 0 28 6 28 16v20c0 16-84 16-84 0v-20c0-10 16-16 28-16h8V72h-8c-12 0-28-6-28-16V36z"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="4" d="M42 36c-16 10-28 28-22 70s18 48 8 78"/>' +
      '</svg></div>' +
      '<div class="rotary turn"><div class="face"></div></div>' +
      '<p class="connect"></p>';
    var line = w.querySelector('.connect');
    typeLine(line, 'CONNECTING…');
    return w;
  }

  function cameraFace() {
    var d = new Date();
    var stamp = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getFullYear()).slice(-2);
    var w = document.createElement('div');
    w.className = 'viewfinder';
    w.innerHTML = '<i class="rec"></i><span class="stamp">' + stamp + '</span>';
    return w;
  }

  function notesFace() {
    var w = document.createElement('div');
    w.className = 'mac-win';
    w.innerHTML = '<div class="tb"><i class="box"></i><span>notes</span></div><div class="body"><span class="cursor"></span></div>';
    return w;
  }

  function messagesFace() {
    var w = document.createElement('div');
    w.className = 'pager';
    w.innerHTML = '<div class="scr">1 message</div><i class="pip"></i>';
    tick();
    return w;
  }

  function timerFace() {
    var w = document.createElement('div');
    w.innerHTML = '<div class="egg-timer"><i></i></div><div class="flip-nums"><b>0</b><b>5</b><b>0</b><b>0</b></div>';
    return w;
  }

  function genericFace(slug) {
    var rec = window.OZ80 && window.OZ80.ICONS[slug];
    var m = document.createElement('div');
    m.className = 'machine';
    if (flav === 'bit') {
      m.className = 'mac-win';
      var tb = document.createElement('div');
      tb.className = 'tb';
      tb.innerHTML = '<i class="box"></i><span></span>';
      tb.querySelector('span').textContent = rec ? rec.label : slug;
      m.appendChild(tb);
      var body = document.createElement('div');
      body.className = 'body';
      var hero = document.createElement('div');
      hero.className = 'hero';
      var s = fig(slug, 140);
      if (s) hero.appendChild(s);
      body.appendChild(hero);
      m.appendChild(body);
      return m;
    }
    var hero = document.createElement('div');
    hero.className = 'hero';
    var s = fig(slug, 140);
    if (s) hero.appendChild(s);
    m.appendChild(hero);
    var kn = document.createElement('div');
    kn.className = 'knobs';
    kn.innerHTML = '<span class="knob-dot"></span><span class="knob-dot"></span>';
    m.appendChild(kn);
    var leds = document.createElement('div');
    leds.className = 'leds';
    leds.innerHTML = '<b></b><b></b><b></b>';
    m.appendChild(leds);
    var p = document.createElement('p');
    p.className = 'note';
    p.textContent = rec ? rec.label : slug;
    m.appendChild(p);
    return m;
  }

  function openRoom(slug, keep) {
    var rec = window.OZ80 && window.OZ80.ICONS[slug];
    var title = rec ? rec.label : slug;
    if (!keep) closeOverlays();
    else { roomFace.innerHTML = ''; }
    roomTitle.textContent = title;
    roomTitle.classList.toggle('motel', flav === 'neon');
    roomEl.setAttribute('data-slug', slug);
    roomFace.innerHTML = '';
    if (slug === 'phone') roomFace.appendChild(phoneFace());
    else if (slug === 'sound') roomFace.appendChild(cassFace());
    else if (slug === 'good-weather') roomFace.appendChild(sunFace());
    else if (slug === 'camera') roomFace.appendChild(cameraFace());
    else if (slug === 'notes') roomFace.appendChild(notesFace());
    else if (slug === 'messages') roomFace.appendChild(messagesFace());
    else if (slug === 'timer') roomFace.appendChild(timerFace());
    else if (slug === 'clock') { goHome(); return; }
    else if (slug === 'sky' || slug === 'map') { openGrid(); return; }
    else roomFace.appendChild(genericFace(slug));
    roomEl.hidden = false;
    syncChrome();
    presentIcons(on);
  }

  function openFromSlug(slug) {
    if (slug === 'map' || slug === 'sky') openGrid();
    else if (slug === 'clock') goHome();
    else openRoom(slug);
  }

  disc.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { disc.setPointerCapture(e.pointerId); } catch (x) {}
    clearTimeout(holdT);
    holdT = setTimeout(function () { showPad(); tick(); }, 520);
  });
  function cancelHold() { clearTimeout(holdT); holdT = null; }
  disc.addEventListener('pointerup', function () {
    var was = holdT;
    cancelHold();
    if (was && !padOpen) {
      disc.setAttribute('aria-pressed', 'true');
    }
  });
  disc.addEventListener('pointercancel', cancelHold);

  notch.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation();
    later();
    clearTimeout(centreHold);
    centreHold = setTimeout(revealEgg, 420);
  });
  notch.addEventListener('pointerup', function () { clearTimeout(centreHold); });
  notch.addEventListener('pointercancel', function () { clearTimeout(centreHold); });

  var startY = null;
  pad.addEventListener('pointerdown', function (e) {
    if (e.target.closest && (e.target.closest('.rocker') || e.target.closest('.flav'))) return;
    startY = e.clientY;
    later();
  });
  pad.addEventListener('pointermove', function (e) {
    if (startY == null) return;
    later();
    if (e.clientY - startY > 28) revealEgg();
  });
  pad.addEventListener('pointerup', function () { startY = null; });

  rocker.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    later();
    setEighties(!on);
    tick();
  });

  if (flavEl) {
    flavEl.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-flav]');
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      later();
      setFlavour(b.getAttribute('data-flav'));
      tick();
    });
  }

  function bindKnob(el, key) {
    if (!el) return;
    var dragging = false;
    var lastY = 0;
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      dragging = true;
      lastY = e.clientY;
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dy = lastY - e.clientY;
      lastY = e.clientY;
      if (key === 'bright') bright = Math.max(0.55, Math.min(1.25, bright + dy * 0.01));
      else contrast = Math.max(0.7, Math.min(1.4, contrast + dy * 0.01));
      var rot = key === 'bright' ? (bright - 1) * 160 - 40 : (contrast - 1) * 160 - 40;
      el.style.setProperty('--rot', rot + 'deg');
      html.style.setProperty('--bright', String(bright));
      html.style.setProperty('--contrast', String(contrast));
      tick();
    });
    el.addEventListener('pointerup', function () { dragging = false; });
    el.addEventListener('pointercancel', function () { dragging = false; });
  }
  bindKnob(document.getElementById('knobBright'), 'bright');
  bindKnob(document.getElementById('knobContrast'), 'contrast');

  document.getElementById('homeBtn').addEventListener('click', goHome);
  document.getElementById('roomBack').addEventListener('click', goHome);
  document.getElementById('gridBack').addEventListener('click', goHome);
  document.getElementById('moon').addEventListener('click', function () { openDial(); });
  document.getElementById('moon').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDial(); }
  });
  dial.addEventListener('click', function (e) {
    if (e.target === dial) dial.hidden = true;
  });
  document.getElementById('arcDock').addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.ad');
    if (!btn) return;
    openFromSlug(btn.getAttribute('data-room'));
  });

  mountDockIcons();
  mountHomeIcons();
  mountGrid();
  mountDial();
  presentIcons(false);
  paintClock();
  setInterval(paintClock, 1000);

  var params = location.search;
  var shot = (params.match(/shot=([a-z-]+)/) || [])[1];
  var flavQ = (params.match(/flav=([a-z]+)/) || [])[1];
  if (flavQ === 'neon' || flavQ === 'bit' || flavQ === 'terminal') flav = flavQ;
  if (shot) skipReady = true;

  function bootShot() {
    found = true;
    egg.hidden = false;
    notch.classList.add('lit');
    setEighties(true);
    hidePad();
    if (flavEl) flavEl.hidden = false;
  }

  if (shot === 'submenu') {
    found = true;
    egg.hidden = false;
    notch.classList.add('lit');
    showPad();
    clearTimeout(hideT);
  } else if (shot === 'on' || shot === 'home' || shot === 'dock' || shot === 'clock') {
    bootShot();
  } else if (shot === 'dial') {
    bootShot();
    openDial();
  } else if (shot === 'phone') {
    bootShot();
    openRoom('phone');
  } else if (shot === 'sound') {
    bootShot();
    openRoom('sound');
  } else if (shot === 'weather') {
    bootShot();
    openRoom('good-weather');
  } else if (shot === 'icons') {
    bootShot();
    openGrid();
  }
})();
