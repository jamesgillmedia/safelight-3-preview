/* oz · Circle of trust. A constellation of connections in the m4 calculator depth colours.
   You are the cream-gold dot. Artist Agent is the first star, near coral, already lit.
   Tap a star: the phone (tel:). Hold a star: that Messages thread.
   Tilt (on by default here) moves through near / mid / far and adds a little parallax.
   On-screen layer buttons do the same. Voice ('hey oz, call …') only when you turn it on. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var DATA = 'oz-circle', ONBOARD = 'oz-circle-onboarded', LISTEN = 'oz-circle-listen', CREATOR_ON = 'oz-creator-unlocked';
  var HERE = '#DDBC89', HERE_GLOW = '#FAE6C1';
  var NEAR = '#E1626B', MID = '#BC8F94', FAR = '#4C2C31';
  function layers() { return creatorOn ? ['near', 'mid', 'far', 'oz', 'creator'] : ['near', 'mid', 'far', 'oz']; }
  var FAQ = null, FAQ_PATH = 'js/oz-faq.json';

  function loadData() {
    try {
      var d = JSON.parse(localStorage.getItem(DATA) || 'null');
      if (d && Array.isArray(d.people)) return d;
    } catch (e) {}
    return { people: [], layer: 'near' };
  }
  function saveData() { try { localStorage.setItem(DATA, JSON.stringify(D)); } catch (e) {} }
  var D = loadData();
  var onboarded = false;
  try { onboarded = localStorage.getItem(ONBOARD) === '1'; } catch (e) {}
  var listenOn = false;
  try { listenOn = localStorage.getItem(LISTEN) === '1'; } catch (e) {}
  var creatorOn = false;
  try { creatorOn = localStorage.getItem(CREATOR_ON) === '1'; } catch (e) {}

  function colorFor(depth) { return depth === 'near' ? NEAR : depth === 'far' ? FAR : MID; }
  function isAgent(p) { return p && p.kind === 'agent'; }
  function isOzChat(p) { return p && (p.kind === 'oz' || p.kind === 'test'); }
  function isCreator(p) { return p && p.kind === 'creator'; }
  function isTest(p) { return isOzChat(p) || isCreator(p); }
  function seedPeople() {
    if (!D.people.some(isAgent)) {
      D.people.unshift({ id: 'agent', name: 'Artist Agent', kind: 'agent', depth: 'near', tel: '', x: 0.62, y: 0.38 });
    }
    var oz = D.people.filter(isOzChat)[0];
    if (!oz) {
      D.people.push({ id: 'ozchat', name: 'oz chat', kind: 'oz', depth: 'oz', tel: '', x: 0.78, y: 0.22 });
    } else {
      oz.name = 'oz chat'; oz.kind = 'oz'; oz.depth = 'oz';
      if (oz.x == null) oz.x = 0.78; if (oz.y == null) oz.y = 0.22;
    }
    var cr = D.people.filter(isCreator)[0];
    if (!cr) {
      D.people.push({ id: 'creator', name: 'creator', kind: 'creator', depth: 'creator', tel: '', x: 0.86, y: 0.12, hidden: !creatorOn });
    } else {
      cr.name = 'creator'; cr.depth = 'creator'; cr.hidden = !creatorOn;
    }
    saveData();
  }

  var el = document.createElement('div');
  el.id = 'circle';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Circle');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="ci-head">' +
      '<button class="im-back" data-a="close" aria-label="close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5L8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<h1>Circle</h1>' +
      '<button class="im-icon ci-mic" data-a="listen" aria-pressed="false" aria-label="hey oz, off">' + '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' + '</button>' +
    '</div>' +
    '<p class="ci-hint">Tap a star to call. Hold to open Messages. oz chat is the first ring. Creator sits beneath, if you ask.</p>' +
    '<div class="ci-layers" role="radiogroup" aria-label="layer">' +
      '<button type="button" data-layer="near">Near</button>' +
      '<button type="button" data-layer="mid">Mid</button>' +
      '<button type="button" data-layer="far">Far</button>' +
      '<button type="button" data-layer="oz">oz</button>' +
      '<button type="button" data-layer="creator" class="ci-creator-btn" hidden>creator</button>' +
    '</div>' +
    '<div class="ci-sky" aria-label="your circle">' +
      '<svg class="ci-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>' +
      '<div class="ci-stars"></div>' +
    '</div>' +
    '<p class="ci-miclab" hidden></p>';
  document.body.appendChild(el);

  var starsEl = el.querySelector('.ci-stars'), linesEl = el.querySelector('.ci-lines');
  var micBtn = el.querySelector('.ci-mic'), micLab = el.querySelector('.ci-miclab');
  var on = false, raf = 0, tiltBase = null, tiltNow = { x: 0, y: 0 }, layerHold = 0;
  var pointer = { x: 0, y: 0, on: false };

  function tiltAllowed() { return !!(GJ.tilt && GJ.tilt.pref && GJ.tilt.pref.allowed('circle')); }

  /* Own reader: Circle stays live when Reduce Motion is on, if the Circle toggle is on.
     No new permission prompt — oz already asks on the first tap. Desktop: gentle pointer. */
  function sampleTilt() {
    if (!tiltAllowed()) { tiltNow.x = 0; tiltNow.y = 0; return tiltNow; }
    var raw = GJ.tilt && GJ.tilt.raw && GJ.tilt.raw();
    if (raw) {
      if (!tiltBase) tiltBase = { b: raw.b, g: raw.g };
      var k = 0.08;
      tiltBase.b += (raw.b - tiltBase.b) * 0.02;
      tiltBase.g += (raw.g - tiltBase.g) * 0.02;
      var dx = (raw.g - tiltBase.g) / 26, dy = (raw.b - tiltBase.b) / 32;
      tiltNow.x += (Math.max(-.9, Math.min(.9, dx)) - tiltNow.x) * k;
      tiltNow.y += (Math.max(-.8, Math.min(.8, dy)) - tiltNow.y) * k;
      /* Forward / back also walks the layers, slowly. */
      layerHold += tiltNow.y * 0.012;
      if (layerHold > 1) { layerHold = 0; stepLayer(1); }
      else if (layerHold < -1) { layerHold = 0; stepLayer(-1); }
      return tiltNow;
    }
    if (pointer.on) {
      tiltNow.x += (pointer.x * 0.35 - tiltNow.x) * 0.08;
      tiltNow.y += (pointer.y * 0.35 - tiltNow.y) * 0.08;
      return tiltNow;
    }
    tiltNow.x *= 0.9; tiltNow.y *= 0.9;
    return tiltNow;
  }
  function stepLayer(dir) {
    var L = layers(), i = L.indexOf(D.layer);
    if (i < 0) i = 0;
    var n = Math.max(0, Math.min(L.length - 1, i + dir));
    if (n !== i) { D.layer = L[n]; saveData(); paintLayers(); layout(); }
  }
  function setLayer(id) {
    if (layers().indexOf(id) < 0) return;
    D.layer = id; saveData(); paintLayers(); layout();
  }
  function paintLayers() {
    el.querySelectorAll('[data-layer]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-layer') === D.layer);
      if (b.getAttribute('data-layer') === 'creator') b.hidden = !creatorOn;
    });
    el.setAttribute('data-layer', D.layer);
  }
  function depthK(depth) {
    if (depth === 'here') return 0.03;
    if (depth === 'near') return 0.2;
    if (depth === 'far') return 0.06;
    return 0.12;
  }
  function visibleOnLayer(p) {
    if (isCreator(p)) return creatorOn && D.layer === 'creator';
    if (isOzChat(p)) return D.layer === 'oz' || (D.layer === 'creator' && creatorOn);
    if (D.layer === 'oz' || D.layer === 'creator') return false;
    return true;
  }

  function ava(p) {
    if (isAgent(p)) return '<span class="im-ava star sm ci-ava"><img src="icons/artist-agent-a.png" alt=""><i></i></span>';
    return '';
  }
  function layout() {
    seedPeople();
    var t = sampleTilt();
    var you = { x: 0.5, y: 0.5 };
    var h = '';
    var lines = '';
    function px(p, depth) {
      var k = depthK(depth);
      return { x: (p.x * 100) + t.x * k * 22, y: (p.y * 100) + t.y * k * 22 };
    }
    var youP = px(you, 'here');
    D.people.forEach(function (p) {
      if (isCreator(p) && !creatorOn) return;
      if (p.x == null) { p.x = 0.35 + Math.random() * 0.35; p.y = 0.3 + Math.random() * 0.4; }
      var pt = px(p, p.depth || 'mid');
      var fade = !visibleOnLayer(p) ? ' layer-dim' : (D.layer === 'near' && p.depth === 'far') ? ' far-dim' : (D.layer === 'far' && p.depth === 'near') ? ' near-dim' : '';
      var col = colorFor(p.depth || 'mid');
      lines += '<line x1="' + youP.x.toFixed(2) + '" y1="' + youP.y.toFixed(2) + '" x2="' + pt.x.toFixed(2) + '" y2="' + pt.y.toFixed(2) + '" class="ci-ln' + (isAgent(p) ? ' lit' : '') + fade + '"/>';
      h += '<button type="button" class="ci-star' + fade + (isAgent(p) ? ' agent' : '') + (isOzChat(p) ? ' ozchat' : '') + (isCreator(p) ? ' creator' : '') + '" data-id="' + p.id + '" style="left:' + pt.x.toFixed(2) + '%;top:' + pt.y.toFixed(2) + '%;--ci-col:' + col + '" aria-label="' + p.name + '. tap to call, hold for messages">' + ava(p) + '<em></em><span class="ci-phone" aria-hidden="true"><img class="te-star te-night" src="icons/truemoji/phone-night.png" alt=""><img class="te-star te-red" src="icons/truemoji/phone-red.png" alt=""><img class="te-star te-rose" src="icons/truemoji/phone-rose.png" alt=""></span><span>' + p.name + '</span></button>';
    });
    h += '<div class="ci-you" style="left:' + youP.x.toFixed(2) + '%;top:' + youP.y.toFixed(2) + '%"><em></em><span>You</span></div>';
    starsEl.innerHTML = h;
    linesEl.innerHTML = lines;
  }
  function loop() {
    if (!on) { raf = 0; return; }
    layout();
    raf = requestAnimationFrame(loop);
  }

  function openThread(p) {
    var go = function () {
      if (!GJ.messages) return;
      if (isOzChat(p) && GJ.messages.openOzChat) GJ.messages.openOzChat();
      else if (isCreator(p) && GJ.messages.openCreator) GJ.messages.openCreator();
      else if (isAgent(p) && GJ.messages.openAgent) GJ.messages.openAgent();
      else if (GJ.messages.openNamed) GJ.messages.openNamed(p.name);
      if (!(GJ.messages.openOzChat || GJ.messages.openTest)) {
        GJ.messages.open();
        if (GJ.messages.start && GJ.messages.show) {
          var id = GJ.messages.start(p.name);
          if (id != null) GJ.messages.show(id);
        }
      }
    };
    close();
    if (GJ.lazy && GJ.lazy.load) GJ.lazy.load('messages').then(go); else go();
  }
  function callStar(p) {
    if (p.tel) {
      var a = document.createElement('a');
      a.href = 'tel:' + String(p.tel).replace(/[^\d+]/g, '');
      a.click();
      return;
    }
    if (GJ.mark) GJ.mark.say('no number on this star', 1400);
  }

  /* Voice: only while the user has turned it on. Recordings stay on the phone. */
  var rec = null, recOn = false;
  var MIC_STRING = 'oz uses the microphone so you can say hey oz and start a call. Recordings stay on your phone.';
  function speechEngine() { return G.SpeechRecognition || G.webkitSpeechRecognition || null; }
  function parseCall(text) {
    var s = String(text || '').toLowerCase().replace(/[?.!,]/g, ' ').replace(/\s+/g, ' ').trim();
    var m = s.match(/(?:hey oz[, ]+)?(?:call|phone|ring)\s+(.+)$/);
    if (!m) m = s.match(/^hey oz\s+(.+)$/);
    if (!m) return null;
    var name = m[1].replace(/^(please|for me|the)\s+/, '').trim();
    if (!name || name === 'oz') return null;
    return name;
  }
  function matchName(name) {
    name = String(name || '').toLowerCase();
    var best = null, score = 0;
    D.people.forEach(function (p) {
      if (isCreator(p) && !creatorOn) return;
      var n = p.name.toLowerCase();
      var s = (n === name) ? 3 : (n.indexOf(name) >= 0 || name.indexOf(n) >= 0) ? 2 : 0;
      if (s > score) { score = s; best = p; }
    });
    return best;
  }
  function onVoice(text) {
    var name = parseCall(text);
    if (!name) { if (GJ.mark) GJ.mark.say(text ? ('I heard, ' + text) : 'say hey oz, call a name', 1800); return; }
    var p = matchName(name);
    if (!p) { if (GJ.mark) GJ.mark.say('no one in the Circle by that name', 1800); return; }
    callStar(p);
  }
  function stopListen() {
    recOn = false;
    if (rec) { try { rec.abort(); } catch (e) {} rec = null; }
    paintMic();
  }
  function startListen() {
    var Ctor = speechEngine();
    if (!Ctor) { if (GJ.mark) GJ.mark.say('voice ask needs a mic button on this phone', 1800); paintMic(); return; }
    try {
      rec = new Ctor();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = function (e) {
        var i, t = '';
        for (i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript;
        if (t) onVoice(t);
      };
      rec.onerror = function () { /* stay quiet; user can tap again */ };
      rec.onend = function () { if (listenOn && on) { try { rec.start(); } catch (e) {} } };
      rec.start();
      recOn = true;
    } catch (e) { recOn = false; }
    paintMic();
  }
  function setListen(v) {
    listenOn = !!v;
    try { localStorage.setItem(LISTEN, listenOn ? '1' : '0'); } catch (e) {}
    if (listenOn) {
      if (micLab) { micLab.hidden = false; micLab.textContent = MIC_STRING; }
      startListen();
    } else {
      if (micLab) micLab.hidden = true;
      stopListen();
    }
    paintMic();
    return listenOn;
  }
  function paintMic() {
    micBtn.classList.toggle('on', listenOn);
    micBtn.setAttribute('aria-pressed', listenOn ? 'true' : 'false');
    micBtn.setAttribute('aria-label', listenOn ? 'hey oz, on' : 'hey oz, off');
    /* icon stays; state is .on + aria */
  }

  /* Hold vs tap on a star */
  var holdT = 0, held = false, down = null;
  starsEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.ci-star');
    if (!b) return;
    var p = D.people.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    if (!p) return;
    held = false;
    down = { x: e.clientX, y: e.clientY, p: p };
    clearTimeout(holdT);
    holdT = setTimeout(function () {
      held = true;
      try { GJ.haptic.commit(); } catch (e2) {}
      openThread(p);
    }, 420);
  });
  starsEl.addEventListener('pointermove', function (e) {
    if (!down) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) { clearTimeout(holdT); down = null; }
  });
  function endPtr(e) {
    clearTimeout(holdT);
    if (down && !held) callStar(down.p);
    down = null; held = false;
  }
  starsEl.addEventListener('pointerup', endPtr);
  starsEl.addEventListener('pointercancel', function () { clearTimeout(holdT); down = null; held = false; });

  el.querySelector('.ci-sky').addEventListener('pointermove', function (e) {
    var r = el.querySelector('.ci-sky').getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width * 2 - 1;
    pointer.y = (e.clientY - r.top) / r.height * 2 - 1;
    pointer.on = !!(GJ.tilt && GJ.tilt.raw && !GJ.tilt.raw());
  }, { passive: true });

  el.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button');
    if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'close') close();
    else if (a === 'listen') setListen(!listenOn);
    else if (b.hasAttribute('data-layer')) setLayer(b.getAttribute('data-layer'));
  });

  function paintTiltTune() {
    var g = document.querySelector('#tune [data-t="tiltall"] b');
    var s = document.querySelector('#tune [data-t="tiltsky"] b');
    var c = document.querySelector('#tune [data-t="tiltcircle"] b');
    var P = GJ.tilt && GJ.tilt.pref;
    if (g && P) g.textContent = P.global() ? 'on' : 'off';
    if (s && P) s.textContent = P.room('sky') ? 'on' : 'off';
    if (c && P) c.textContent = P.room('circle') ? 'on' : 'off';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#tune button[data-t]');
    if (!b || !GJ.tilt || !GJ.tilt.pref) return;
    var k = b.getAttribute('data-t');
    if (k === 'tiltall') GJ.tilt.pref.setGlobal(!GJ.tilt.pref.global());
    if (k === 'tiltsky') GJ.tilt.pref.setRoom('sky', !GJ.tilt.pref.room('sky'));
    if (k === 'tiltcircle') GJ.tilt.pref.setRoom('circle', !GJ.tilt.pref.room('circle'));
    if (k === 'tiltall' || k === 'tiltsky' || k === 'tiltcircle') paintTiltTune();
  });
  setTimeout(paintTiltTune, 800);

  /* Local test-chat FAQ, no network. */
  function loadFaq() {
    if (FAQ) return Promise.resolve(FAQ);
    return fetch(FAQ_PATH, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      FAQ = d; return d;
    }).catch(function () { return { entries: [], fallback: 'This test chat stays on the phone. I could not load the FAQ file.' }; });
  }
  function listAsk(q) { return /\b(list|links|link)\b/.test(q); }
  function plainList(text) {
    var lines = String(text || '').replace(/\r/g, '').split('\n');
    var keep = lines.filter(function (ln) {
      var s = ln.trim();
      if (!s) return false;
      if (/^([\-–—*•]|\d+[.)])\s+/.test(s)) return true;
      if (/https?:\/\//i.test(s)) return true;
      return false;
    });
    return keep.length ? keep.map(function (s) { return s.trim(); }).join('\n') : '';
  }
  function replyFaq(text, poet) {
    return loadFaq().then(function (faq) {
      var q = String(text || '').toLowerCase();
      var best = null, score = 0;
      (faq.entries || []).forEach(function (e) {
        var s = 0;
        (e.q || []).forEach(function (k) { if (q.indexOf(String(k).toLowerCase()) >= 0) s += String(k).length; });
        if (s > score) { score = s; best = e; }
      });
      var hits = [];
      try { if (GJ.ask && GJ.ask.lookup) hits = GJ.ask.lookup(text) || []; } catch (e) { hits = []; }
      var matched = !!(best || (hits && hits.length));
      var full, short;
      if (best) {
        full = (poet && best.poet) ? best.poet : best.a;
        short = (poet && best.shortPoet) ? best.shortPoet : (best.short || full);
      } else if (hits.length) {
        full = poet
          ? 'A few places in oz sit near that question. The chips below will take you there.'
          : 'I found a few places in oz that might help. Tap a chip to jump there.';
        short = poet ? 'A few places sit near that. Open more to jump.' : 'A few places in oz might help. Open more to jump.';
      } else {
        full = poet ? (faq.fallbackPoet || 'I do not have a line for that yet.') : (faq.fallback || 'I am not sure on that one.');
        short = full;
      }
      var onlyList = listAsk(q);
      if (onlyList) {
        var listed = plainList(full) || plainList(short);
        if (listed) { short = listed; full = listed; }
        hits = [];
      }
      return { text: short, short: short, full: full, fromOz: true, poet: !!poet, draft: !!(poet && best), matched: matched, hits: hits, listOnly: !!onlyList };
    });
  }
  function unlockCreator() {
    creatorOn = true;
    try { localStorage.setItem(CREATOR_ON, '1'); } catch (e) {}
    seedPeople();
    D.layer = 'creator';
    saveData();
    if (on) { paintLayers(); layout(); }
    return true;
  }

  function onboard() {
    seedPeople();
    if (onboarded) return;
    onboarded = true;
    try { localStorage.setItem(ONBOARD, '1'); } catch (e) {}
    if (GJ.messages && GJ.messages.ensureOzChat) GJ.messages.ensureOzChat();
  }

  function open() {
    if (on) return;
    on = true;
    seedPeople();
    onboard();
    html.classList.add('circling');
    el.setAttribute('aria-hidden', 'false');
    paintLayers();
    paintMic();
    tiltBase = null;
    if (listenOn) startListen();
    if (!raf) raf = requestAnimationFrame(loop);
    try { GJ.haptic.tick(); } catch (e) {}
  }
  function close() {
    if (!on) return;
    on = false;
    html.classList.remove('circling');
    el.setAttribute('aria-hidden', 'true');
    stopListen();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  GJ.circle = {
    open: open, close: close, isOpen: function () { return on; },
    people: function () { return D.people.slice(); },
    add: function (p) { D.people.push(p); saveData(); if (on) layout(); },
    layer: function (id) { if (id) setLayer(id); return D.layer; },
    listen: setListen,
    listening: function () { return listenOn; },
    replyFaq: replyFaq,
    unlockCreator: unlockCreator,
    creatorUnlocked: function () { return creatorOn; },
    parseCall: parseCall,
    matchName: matchName,
    onboard: onboard,
    micString: MIC_STRING
  };
})(window);
