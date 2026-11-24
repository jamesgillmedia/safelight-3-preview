(function () {
  'use strict';

  var disc = document.getElementById('disc');
  var pad = document.getElementById('pad');
  var egg = document.getElementById('egg');
  var rocker = document.getElementById('rocker');
  var notch = document.getElementById('notch');
  var clockPop = document.getElementById('clockPop');
  var clockSeg = document.getElementById('clockSeg');
  var lightVal = document.getElementById('lightVal');
  var html = document.documentElement;

  var found = false;
  var on = false;
  var padOpen = false;
  var holdT = null;
  var hideT = null;
  var centreHold = null;

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
  }

  function setEighties(v) {
    on = !!v;
    html.classList.toggle('eighties', on);
    clockSeg.hidden = !on;
    clockPop.hidden = on;
    rocker.setAttribute('aria-checked', on ? 'true' : 'false');
    paintClock();
  }

  function revealEgg() {
    if (found) return;
    found = true;
    egg.hidden = false;
    notch.classList.add('lit');
    tick();
  }

  function showPad() {
    padOpen = true;
    pad.classList.add('on');
    pad.setAttribute('aria-hidden', 'false');
    if (found) egg.hidden = false;
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
    hideT = setTimeout(hidePad, 2600);
  }

  function openFromHold() {
    showPad();
    tick();
  }

  disc.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { disc.setPointerCapture(e.pointerId); } catch (x) {}
    clearTimeout(holdT);
    holdT = setTimeout(openFromHold, 520);
  });
  function cancelHold() { clearTimeout(holdT); holdT = null; }
  disc.addEventListener('pointerup', function () {
    var was = holdT;
    cancelHold();
    if (was && !padOpen) {
      /* a tap still "toggles" red mode; this preview stays in red, which is the default */
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
    if (e.target.closest && e.target.closest('.rocker')) return;
    startY = e.clientY;
    later();
  });
  pad.addEventListener('pointermove', function (e) {
    if (startY == null) return;
    later();
    /* slide down past dim — about 28 px toward the hidden notch */
    if (e.clientY - startY > 28) revealEgg();
  });
  pad.addEventListener('pointerup', function () { startY = null; });

  rocker.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    later();
    setEighties(!on);
    tick();
  });

  paintClock();
  setInterval(paintClock, 1000);

  /* shot helpers: ?shot=off | submenu | on */
  var shot = (location.search.match(/shot=([a-z]+)/) || [])[1];
  if (shot === 'submenu') {
    found = true;
    egg.hidden = false;
    notch.classList.add('lit');
    showPad();
    clearTimeout(hideT);
  } else if (shot === 'on') {
    found = true;
    egg.hidden = false;
    notch.classList.add('lit');
    setEighties(true);
    hidePad();
  }
})();
