/* Tone Check — a private room in oz.
   A calm place to check that how you sound matches what you meant.
   Targets and prompts come only through oz.private.get('voiceProfile').
   Audio stays on the phone: no network calls anywhere in this room.
   Look and layout follow design/ (tokens, screens, icons) in the Tone Check pack. */
(function (root) {
  'use strict';

  var doc = root.document;
  var GJ = root.GJ = root.GJ || {};
  GJ.rooms = GJ.rooms || {};
  function Reader() { return root.ozToneReader; }
  function icon(id, cls) { return root.ozToneIcons ? root.ozToneIcons.icon(id, cls) : ''; }

  var INTENTS_FALLBACK = ['calm', 'warm', 'firm', 'excited'];
  // Last-resort copy of the generic starter set, used only if the slot cannot answer.
  var PROMPTS_FALLBACK = [
    ['p01', 'warm', 'sentence', "I'd love to work with you."], ['p02', 'firm', 'sentence', "That doesn't work for me."],
    ['p03', 'calm', 'sentence', "Thanks for waiting. I'm here now."], ['p04', 'excited', 'sentence', "I'm really looking forward to this."],
    ['p05', 'calm', 'sentence', 'Can we pick this up tomorrow?'], ['p06', 'firm', 'sentence', 'I need a little more time.'],
    ['p07', 'warm', 'sentence', "That's great news. Congratulations."], ['p08', 'firm', 'sentence', "I don't agree, and I'd like to explain why."],
    ['p09', 'calm', 'sentence', 'Let me think about that and come back to you.'], ['p10', 'calm', 'sentence', "Here's what I can do instead."],
    ['p11', 'warm', 'sentence', 'I was so glad to hear from you.'], ['p12', 'calm', 'sentence', "Let's keep this simple and start with the first step."],
    ['p13', 'firm', 'sentence', 'I hear you, and I still need this to change.'], ['p14', 'warm', 'sentence', "Take your time. I'm not in a rush."],
    ['p15', 'warm', 'sentence', 'I think we can make this work together.'], ['p16', 'calm', 'sentence', "That's not quite right. Let me say it another way."],
    ['p17', 'warm', 'moment', 'Hi, thanks for taking the time to talk. I wanted to walk you through where things stand.'],
    ['p18', 'firm', 'moment', "I appreciate the offer. I can't take this on right now."],
    ['p19', 'warm', 'moment', "I've been working on something I'd like to show you. It started as a small idea, and I think it's ready to share."],
    ['p20', 'calm', 'moment', "I can start next week if that helps. Tell me what you'd like to see first, and I'll come back with a clear plan."]
  ].map(function (p) { return { id: p[0], intent: p[1], level: p[2], text: p[3], source: 'generic', preview: true, fallback: true }; });

  var USAGE = 'oz uses the microphone so you can check your tone in Tone Check. Recordings stay on your phone.';

  // ---------- state ----------
  var S = {
    el: null, built: false, visible: false,
    view: 'live',                 // intro | intent | live | review | practice
    intent: 'calm', intents: INTENTS_FALLBACK.slice(),
    targets: null, source: 'generic',
    take: null,                   // a take in progress
    sessions: [], open: null, selectedSession: null, noStore: false,
    prompts: [], promptsFallback: false, selectedPrompt: null, openPrompt: null, practiceResult: null,
    mic: 'unknown',               // unknown | granted | denied
    sheet: null, confirmAll: false, card: false,
    haptic: store('oz.tonecheck.haptic') === 'on',
    look: 'night', reduce: false,
    audio: null, audioUrl: null, playing: false,
    lastHapticAt: 0, listening: null
  };

  function store(k, v) {
    try {
      if (arguments.length > 1) root.localStorage.setItem(k, v);
      return root.localStorage.getItem(k);
    } catch (e) { return null; }
  }

  // ---------- the slot ----------
  function profile() {
    try { return root.oz && root.oz.private && root.oz.private.get('voiceProfile'); } catch (e) { return null; }
  }
  function loadTargets() {
    var vp = profile(), intent = S.intent;
    if (!vp) { S.targets = null; renderHeader(); return Promise.resolve(null); }
    return Promise.resolve().then(function () { return vp.getTargets(intent); }).then(function (t) {
      if (intent !== S.intent) return S.targets;
      S.targets = t;
      try { S.source = (t && t.source) || vp.source() || 'generic'; } catch (e) { S.source = 'generic'; }
      if (S.take && S.take.reader) S.take.reader.setTargets(t);
      if (!S.take) renderHeader();
      return t;
    }, function () { S.targets = null; return null; });
  }
  function loadIntents() {
    var vp = profile();
    if (!vp || typeof vp.listIntents !== 'function') return;
    try { var l = vp.listIntents(); if (l && l.length) S.intents = l.slice(0, 6); } catch (e) { /* keep the built-in four */ }
  }
  function loadPrompts() {
    var vp = profile();
    var ask = vp && typeof vp.getPrompts === 'function'
      ? Promise.resolve().then(function () { return vp.getPrompts({ level: 'all' }); })
      : Promise.reject(new Error('no slot'));
    return ask.then(function (l) { S.prompts = Array.isArray(l) ? l : []; S.promptsFallback = false; },
      function () { S.prompts = PROMPTS_FALLBACK.slice(); S.promptsFallback = true; })
      .then(function () { if (S.view === 'practice' && !S.take) render(); });
  }
  function watchSlot() {
    var vp = profile();
    if (!vp || typeof vp.on !== 'function' || S.listening === vp) return;
    S.listening = vp;
    try { vp.on('changed', function () { loadIntents(); loadTargets(); loadPrompts(); }); } catch (e) { /* stub does not emit */ }
  }

  // ---------- storage (IndexedDB, on the device only) ----------
  var DB = (function () {
    var dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise(function (resolve, reject) {
        if (!root.indexedDB) { reject(new Error('no indexedDB')); return; }
        var req = root.indexedDB.open('oz-tonecheck', 1);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio', { keyPath: 'id' });
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
      dbp.catch(function () { dbp = null; });
      return dbp;
    }
    function tx(mode, fn) {
      return open().then(function (db) {
        return new Promise(function (resolve, reject) {
          var t = db.transaction(['sessions', 'audio'], mode);
          t.oncomplete = function () { resolve(); };
          t.onerror = t.onabort = function () { reject(t.error); };
          fn(t);
        });
      });
    }
    function get(store, key) {
      return open().then(function (db) {
        return new Promise(function (res, rej) {
          var r = key === undefined ? db.transaction(store).objectStore(store).getAll() : db.transaction(store).objectStore(store).get(key);
          r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
        });
      });
    }
    return {
      put: function (s, buf, mime) { return tx('readwrite', function (t) { t.objectStore('sessions').put(s); if (buf) t.objectStore('audio').put({ id: s.id, buf: buf, mime: mime }); }); },
      list: function () { return get('sessions').then(function (a) { return (a || []).sort(function (x, y) { return y.at - x.at; }); }); },
      audio: function (id) { return get('audio', id); },
      remove: function (id) { return tx('readwrite', function (t) { t.objectStore('sessions').delete(id); t.objectStore('audio').delete(id); }); },
      clear: function () { return tx('readwrite', function (t) { t.objectStore('sessions').clear(); t.objectStore('audio').clear(); }); }
    };
  })();

  // ---------- look, motion, haptics ----------
  function normLook(v) {
    v = String(v || '').toLowerCase();
    if (v.indexOf('rose') !== -1) return 'rose';
    if (v.indexOf('red') !== -1 || v.indexOf('safelight') !== -1) return 'red';
    return 'night';
  }
  function detectLook() {
    if (GJ.app && typeof GJ.app.look === 'string') return normLook(GJ.app.look);
    var nodes = [doc.documentElement, doc.body];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n) continue;
      var d = n.getAttribute('data-look') || n.getAttribute('data-mode');
      if (d) return normLook(d);
      var c = ' ' + (n.className || '') + ' ';
      if (/(\s|-)rose(\s|-)/.test(c)) return 'rose';
      if (/(\s|-)(red|safelight)(\s|-)/.test(c)) return 'red';
    }
    return 'night';
  }
  function applyLook(look) {
    S.look = look || detectLook();
    if (S.el) S.el.setAttribute('data-look', S.look);
    Cue.paint();
  }
  var motionQuery = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reducedMotion() {
    if (GJ.app && GJ.app.reduceMotion === true) return true;
    if (doc.documentElement.classList.contains('reduce-motion')) return true;
    return !!(motionQuery && motionQuery.matches);
  }
  function applyMotion() {
    S.reduce = reducedMotion();
    if (S.el) S.el.classList.toggle('tc-still', S.reduce);
    Cue.motion();
  }
  function hapticsAllowed() {
    try {
      if (GJ.tune && typeof GJ.tune.get === 'function' && GJ.tune.get('haptics') === false) return false;
      if (GJ.haptics && GJ.haptics.enabled === false) return false;
    } catch (e) { return false; }
    return true;
  }
  function softTick() {
    if (!S.haptic || !hapticsAllowed()) return;
    var now = Date.now();
    if (now - S.lastHapticAt < 4000) return;
    S.lastHapticAt = now;
    if (GJ.haptics && typeof GJ.haptics.tick === 'function') GJ.haptics.tick('light');
    else if (root.navigator && typeof root.navigator.vibrate === 'function') root.navigator.vibrate(10);
  }

  // ---------- DOM helpers ----------
  function h(tag, attrs, kids) {
    var e = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;            // only ever our own icon markup
      else if (k === 'cls') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c); });
    return e;
  }
  function q(sel) { return S.el.querySelector(sel); }
  function clear(e) { while (e && e.firstChild) e.removeChild(e.firstChild); }
  function fmtTime(sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
  function fmtWhen(ms) {
    var d = new Date(ms), now = new Date();
    var t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    return d.toDateString() === now.toDateString() ? t : d.toLocaleDateString([], { month: 'short', day: 'numeric' }).toLowerCase() + ' · ' + t;
  }
  function cleanWord(w) {
    return String(w || '').toLowerCase().replace(/[^a-zÀ-ɏ᐀-ᙿ' -]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  }

  // ---------- the live cue: a presence, not a meter ----------
  // A quiet line with three star points. On track: almost still, a slow breath in opacity.
  // Drifting: it shifts over 0.7 s into a shorter, tighter line (rushed), lifts at the end (rising),
  // or loses its curve (flat). Reduce Motion: no breath and no tween; it changes once and holds.
  var Cue = (function () {
    var W = 300, H = 80, MID = 46;
    var SHAPES = {
      idle:   { l: 0,    r: 1,    ly: 0, my: 3,   ry: 0,   wave: 0, a: 0.32 },
      track:  { l: 0,    r: 1,    ly: 0, my: 4,   ry: -1,  wave: 0, a: 0.62 },
      rushed: { l: 0.08, r: 0.92, ly: 0, my: 1,   ry: -4,  wave: 1, a: 0.9 },
      rising: { l: 0,    r: 1,    ly: 4, my: -4,  ry: -24, wave: 0, a: 0.9 },
      flat:   { l: 0,    r: 1,    ly: 0, my: 0,   ry: 0,   wave: 0, a: 0.42 }
    };
    var cur = clone(SHAPES.idle), from = null, to = null, t0 = 0, raf = 0, state = 'idle', svg = null;

    function clone(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }
    function ease(t) { // cubic-bezier(.65, 0, .35, 1), solved for x
      var lo = 0, hi = 1, x, m;
      for (var i = 0; i < 18; i++) { m = (lo + hi) / 2; x = 3 * m * (1 - m) * (1 - m) * 0.65 + 3 * m * m * (1 - m) * 0.35 + m * m * m; if (x < t) lo = m; else hi = m; }
      m = (lo + hi) / 2;
      return 3 * m * m * (1 - m) + m * m * m;
    }
    function build() {
      var NS = 'http://www.w3.org/2000/svg';
      svg = doc.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('class', 'tc-cue-svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = '<path class="tc-cue-glow"/><path class="tc-cue-line"/>' +
        '<circle class="tc-cue-halo" r="7"/><circle class="tc-cue-pt" data-p="l" r="2.4"/>' +
        '<circle class="tc-cue-pt" data-p="m" r="3.4"/><circle class="tc-cue-pt" data-p="r" r="2.4"/>';
      return svg;
    }
    function pts(s) {
      var lx = 8 + s.l * (W - 16), rx = 8 + s.r * (W - 16), mx = (lx + rx) / 2;
      return { lx: lx, ly: MID + s.ly, mx: mx, my: MID + s.my, rx: rx, ry: MID + s.ry };
    }
    function paint() {
      if (!svg) return;
      var p = pts(cur), w = cur.wave * 7;
      var d = 'M' + p.lx.toFixed(1) + ' ' + p.ly.toFixed(1) +
        ' Q' + ((p.lx + p.mx) / 2).toFixed(1) + ' ' + ((p.ly + p.my) / 2 + 2 + w).toFixed(1) + ' ' + p.mx.toFixed(1) + ' ' + p.my.toFixed(1) +
        ' Q' + ((p.mx + p.rx) / 2).toFixed(1) + ' ' + ((p.my + p.ry) / 2 + 2 - w).toFixed(1) + ' ' + p.rx.toFixed(1) + ' ' + p.ry.toFixed(1);
      var paths = svg.querySelectorAll('path');
      paths[0].setAttribute('d', d); paths[1].setAttribute('d', d);
      var dots = svg.querySelectorAll('.tc-cue-pt'), halo = svg.querySelector('.tc-cue-halo');
      dots[0].setAttribute('cx', p.lx); dots[0].setAttribute('cy', p.ly);
      dots[1].setAttribute('cx', p.mx); dots[1].setAttribute('cy', p.my);
      dots[2].setAttribute('cx', p.rx); dots[2].setAttribute('cy', p.ry);
      halo.setAttribute('cx', p.mx); halo.setAttribute('cy', p.my);
      var a = cur.a;
      if (state === 'track' && !S.reduce && raf) a = 0.625 + 0.075 * Math.sin((performance.now() / 4000) * Math.PI * 2);
      svg.style.opacity = a.toFixed(3);
    }
    function frame(now) {
      raf = 0;
      if (to) {
        var k = Math.min(1, (now - t0) / 700), e = ease(k);
        for (var key in to) cur[key] = from[key] + (to[key] - from[key]) * e;
        if (k >= 1) { to = null; from = null; }
      }
      paint();
      if (to || (state === 'track' && !S.reduce && S.take)) raf = root.requestAnimationFrame(frame);
    }
    function set(next) {
      if (!SHAPES[next]) next = 'idle';
      var changed = next !== state;
      state = next;
      if (S.reduce || !svg || !svg.isConnected) { cur = clone(SHAPES[next]); to = null; paint(); return; }
      if (changed) { from = clone(cur); to = clone(SHAPES[next]); t0 = performance.now(); }
      if (!raf) raf = root.requestAnimationFrame(frame);
    }
    return {
      el: function () { return svg || build(); },
      set: set,
      state: function () { return state; },
      paint: paint,
      motion: function () {
        if (S.reduce && raf) { root.cancelAnimationFrame(raf); raf = 0; if (to) { cur = clone(to); to = null; } }
        paint();
        if (!S.reduce && state === 'track' && S.take && !raf) raf = root.requestAnimationFrame(frame);
      },
      stop: function () { if (raf) root.cancelAnimationFrame(raf); raf = 0; }
    };
  })();

  // ---------- CSS ----------
  var CSS = [
    '.tc-room{--tc-ink:#e8e4dc;--tc-dim:#c9d3d6;--tc-meta:#93a1a6;--tc-hair:rgba(200,225,255,.22);--tc-hair-row:rgba(200,225,255,.08);',
    '--tc-glass:rgba(6,10,18,.62);--tc-accent:#3ee6b0;--tc-accent-soft:rgba(62,230,176,.16);--tc-cue:#3ee6b0;--tc-sheet:#080c16e6;--tc-row:#c8e1ff12;',
    '--tc-grab:#c8e1ff4d;--tc-danger:#FF4457;--tc-ic-star:rgb(255,255,255);--tc-ic-halo:rgb(235,238,245);--tc-ic-line:rgb(141,142,147);--tc-ic-dot:rgb(155,157,161);',
    '--tc-bg:radial-gradient(ellipse 58% 62% at 50% 44%,#08121d 0%,#050a12 46%,#020305 78%,#000 100%);',
    '--tc-body:var(--font-body,Poppins,-apple-system,system-ui,sans-serif);--tc-label:var(--font-label,"Julius Sans One",Poppins,-apple-system,system-ui,sans-serif);',
    '--tc-room-ease:cubic-bezier(.65,0,.35,1);--tc-sheet-ease:cubic-bezier(.2,.85,.25,1);--tc-sat:env(safe-area-inset-top,0px);--tc-sab:env(safe-area-inset-bottom,0px)}',
    '.tc-room[data-look=red]{--tc-ink:#FF4457;--tc-dim:rgba(255,68,87,.86);--tc-meta:rgba(255,68,87,.62);--tc-hair:rgba(255,68,87,.34);--tc-hair-row:rgba(255,68,87,.1);',
    '--tc-glass:rgba(6,3,4,.66);--tc-accent:#FF4457;--tc-accent-soft:rgba(255,68,87,.12);--tc-cue:#FF4457;--tc-sheet:#0a0204eb;--tc-row:rgba(255,68,87,.08);--tc-grab:rgba(255,68,87,.42);',
    '--tc-ic-star:rgb(255,90,80);--tc-ic-halo:rgb(255,104,92);--tc-ic-line:rgb(153,54,48);--tc-ic-dot:rgb(168,59,52);',
    '--tc-bg:radial-gradient(ellipse 58% 62% at 50% 44%,rgba(255,68,87,.13) 0%,rgba(80,10,18,.12) 45%,#060304 80%)}',
    '.tc-room[data-look=rose]{--tc-ink:#FFB0B8;--tc-dim:rgba(255,176,184,.86);--tc-meta:rgba(255,176,184,.62);--tc-hair:rgba(255,176,184,.3);--tc-hair-row:rgba(255,176,184,.09);',
    '--tc-glass:rgba(8,4,6,.66);--tc-accent:#FFB0B8;--tc-accent-soft:rgba(255,176,184,.12);--tc-cue:#FFB0B8;--tc-sheet:#0c0608eb;--tc-row:rgba(255,176,184,.07);--tc-grab:rgba(255,176,184,.42);',
    '--tc-ic-star:rgb(245,170,180);--tc-ic-halo:rgb(255,196,208);--tc-ic-line:rgb(161,112,118);--tc-ic-dot:rgb(161,112,118);',
    '--tc-bg:radial-gradient(ellipse 58% 62% at 50% 44%,rgba(255,176,184,.09) 0%,#080406 70%)}',
    '.tc-room{position:fixed;inset:0;z-index:20;display:flex;flex-direction:column;background:#000 var(--tc-bg);color:var(--tc-ink);',
    'font:300 14px/1.4 var(--tc-body);letter-spacing:.04em;-webkit-font-smoothing:antialiased;overflow:hidden}',
    '.tc-room[hidden]{display:none}.tc-room *{box-sizing:border-box}',
    ':where(.tc-room) button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    ':where(.tc-room) button:disabled{cursor:default}',
    '.tc-room :focus-visible{outline:1px solid var(--tc-accent);outline-offset:2px;border-radius:16px}',
    // icons
    '.tc-ic{display:block;width:100%;height:100%;overflow:visible}',
    '.tc-ic-dot{fill:var(--tc-ic-dot)}.tc-ic-line{stroke:var(--tc-ic-line);stroke-width:3;stroke-linecap:round}',
    '.tc-ic-halo{fill:var(--tc-ic-halo);opacity:.5;filter:url(#tc-ic-blur)}.tc-ic-star{fill:var(--tc-ic-star)}',
    // top-right settings control (the red-mode control belongs to the app and sits to its right)
    '.tc-settings{position:absolute;z-index:3;top:calc(8px + var(--tc-sat));right:var(--tc-settings-right,56px);width:44px;height:44px;display:flex;align-items:center;justify-content:center}',
    '.tc-settings span{width:34px;height:34px;border-radius:50%;border:1px solid var(--tc-hair);background:var(--tc-glass);display:flex;align-items:center;justify-content:center}',
    '.tc-settings .tc-ic{width:20px;height:20px}',
    // header
    '.tc-head{flex:none;text-align:center;padding:calc(112px + var(--tc-sat)) 16px 0}',
    '.tc-title{margin:0;font:300 18px/1.3 var(--tc-body);letter-spacing:.18em;color:var(--tc-dim);text-transform:lowercase}',
    '.tc-sub{margin:6px 0 0;font:300 12px/1.4 var(--tc-body);letter-spacing:.16em;color:var(--tc-meta)}',
    '.tc-label{font:400 9px/1.4 var(--tc-label);letter-spacing:.24em;text-transform:uppercase;color:var(--tc-meta)}',
    '.tc-preview{display:block;margin-top:6px;min-height:13px;opacity:.75}',
    // chips
    '.tc-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:0 8px;margin-top:2px}',
    '.tc-chip{min-height:44px;display:flex;align-items:center}',
    '.tc-chip span{display:block;height:32px;line-height:30px;padding:0 15px;border-radius:16px;border:1px solid var(--tc-hair);background:var(--tc-glass);',
    'font:300 13px/30px var(--tc-body);letter-spacing:.14em;color:var(--tc-meta);transition:color .3s,border-color .3s}',
    '.tc-chip[aria-pressed=true] span,.tc-chip.tc-static span{border-color:var(--tc-accent);color:var(--tc-ink)}',
    '.tc-chip:disabled span{opacity:.55}.tc-chip[aria-pressed=true]:disabled span{opacity:1}',
    '.tc-chip.tc-static{width:max-content;margin:4px auto 0;cursor:default}',
    // main
    '.tc-main{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 20px 12px;text-align:center}',
    '.tc-stage{padding-top:9vh}',
    '.tc-timer{display:block;font:400 10px/1 var(--tc-label);letter-spacing:.24em;color:var(--tc-meta);min-height:12px;margin-bottom:6px}',
    '.tc-cue{width:min(78%,300px);margin:0 auto}.tc-cue-svg{display:block;width:100%;height:auto;overflow:visible;transition:opacity .45s}',
    '.tc-cue-line{fill:none;stroke:var(--tc-cue);stroke-width:2.2;stroke-linecap:round}',
    '.tc-cue-glow{fill:none;stroke:var(--tc-cue);stroke-width:7;stroke-linecap:round;opacity:.18;filter:blur(2px)}',
    '.tc-cue-pt{fill:var(--tc-cue)}.tc-cue-halo{fill:var(--tc-cue);opacity:.22}',
    '.tc-nudge{min-height:1.6em;margin:14px 0 0;font:300 15px/1.4 var(--tc-body);letter-spacing:.06em;color:var(--tc-ink);opacity:0;transition:opacity .6s var(--tc-room-ease)}',
    '.tc-nudge.tc-on{opacity:1;transition:opacity .45s var(--tc-room-ease)}',
    '.tc-quiet{margin:0 auto;max-width:330px}',
    '.tc-quiet b{display:block;font-weight:300;font-size:14px;letter-spacing:.12em;color:var(--tc-ink);margin-bottom:8px}',
    '.tc-quiet p{margin:0;font-size:13px;letter-spacing:.06em;color:var(--tc-dim);line-height:1.55}',
    // foot
    '.tc-foot{flex:none;text-align:center;padding:0 0 calc(var(--tc-sab) + 14px)}',
    '.tc-denied-line{margin:0 auto;padding:10px 24px 12px;max-width:380px;font-size:12px;line-height:1.5;letter-spacing:.06em;color:var(--tc-dim)}.tc-denied-line:empty{display:none}',
    '.tc-go-wrap{height:118px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}',
    '.tc-go-wrap:empty{height:12px}',
    '.tc-go{width:72px;height:72px;border-radius:50%;border:1px solid var(--tc-hair);background:var(--tc-glass);display:flex;align-items:center;justify-content:center;transition:border-color .3s}',
    '.tc-go .tc-ic{width:36px;height:36px}',
    '.tc-go.tc-rec{border-color:var(--tc-accent)}',
    '.tc-go.tc-paused{opacity:.55}',
    '.tc-go-note{margin-top:10px;font:300 11px/1 var(--tc-body);letter-spacing:.16em;color:var(--tc-meta);min-height:11px}',
    '.tc-tabs{display:flex;justify-content:center;gap:4px}',
    '.tc-tab{min-width:96px;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'font:400 10px/1 var(--tc-label);letter-spacing:.24em;text-transform:uppercase;color:var(--tc-meta)}',
    '.tc-tab:after{content:"";display:block;width:28px;height:1.5px;margin-top:9px;background:transparent;border-radius:1px}',
    '.tc-tab[aria-selected=true]{color:var(--tc-accent)}.tc-tab[aria-selected=true]:after{background:var(--tc-accent)}',
    '.tc-tab:disabled{opacity:.5}',
    // buttons
    '.tc-btn{min-height:44px;min-width:96px;padding:0 22px;border-radius:16px;border:1px solid var(--tc-hair);background:var(--tc-glass);',
    'font:300 12px/1 var(--tc-body);letter-spacing:.16em;color:var(--tc-meta)}',
    '.tc-btn.tc-strong{border-color:var(--tc-accent);color:var(--tc-ink)}',
    '.tc-row-btns{display:flex;justify-content:center;gap:12px;margin-top:22px}',
    // intro
    '.tc-intro{max-width:330px;margin:0 auto;padding-top:22px}',
    '.tc-lead{font-size:16px;line-height:1.45;color:var(--tc-ink);margin:0 0 14px}',
    '.tc-small{font-size:13px;line-height:1.5;color:var(--tc-meta);margin:0}',
    '.tc-modes-list{list-style:none;margin:36px 0 34px;padding:0;text-align:left}',
    '.tc-modes-list li{display:flex;gap:12px;align-items:center;margin:0 0 14px}',
    '.tc-modes-list i{flex:none;width:30px;height:30px}',
    '.tc-modes-list span{display:block;font-size:13px;color:var(--tc-dim);margin-top:3px}',
    // intent picker
    '.tc-word{display:block;width:min(100%,330px);height:44px;margin:18px auto 0;border-radius:16px;border:1px solid var(--tc-hair);background:var(--tc-glass);',
    'color:var(--tc-ink);font:300 13px/1 var(--tc-body);letter-spacing:.08em;text-align:center;outline:none}',
    '.tc-word::placeholder{color:var(--tc-meta)}.tc-word:focus{border-color:var(--tc-accent)}',
    // review
    '.tc-words{margin:16px auto 0;max-width:330px;font:300 16px/1.45 var(--tc-body);letter-spacing:.04em;color:var(--tc-ink)}',
    '.tc-take{position:relative;width:min(84%,300px);height:56px;margin:18px auto 0}',
    '.tc-take:before{content:"";position:absolute;left:0;right:0;top:12px;height:1.5px;background:var(--tc-hair)}',
    '.tc-take.tc-stayed:before{background:var(--tc-cue);opacity:.8}',
    '.tc-take .tc-end{position:absolute;top:10px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--tc-cue)}',
    '.tc-mk{position:absolute;top:0;width:64px;margin-left:-32px;min-height:44px;display:flex;flex-direction:column;align-items:center}',
    '.tc-mk i{display:block;width:9px;height:9px;margin-top:8px;border-radius:50%;background:var(--tc-cue);box-shadow:0 0 0 4px var(--tc-accent-soft)}',
    '.tc-mk span{display:block;margin-top:9px;font-size:12px;letter-spacing:.08em;color:var(--tc-dim)}',
    '.tc-head-pos{position:absolute;top:8px;width:1px;height:10px;background:var(--tc-dim);opacity:0;transition:opacity .3s}',
    '.tc-detail{margin:18px auto 0;max-width:320px;font-size:13px;line-height:1.5;color:var(--tc-meta)}',
    '.tc-actions{display:flex;justify-content:center;gap:56px;margin-top:22px}',
    '.tc-act{display:flex;flex-direction:column;align-items:center;min-width:64px;min-height:44px}',
    '.tc-act i{display:block;width:46px;height:46px}',
    '.tc-act .tc-label{margin-top:8px}',
    '.tc-list-head{margin:34px 0 8px}',
    // rows (practice list, earlier takes)
    '.tc-list{list-style:none;margin:0 auto;padding:0;max-width:390px;text-align:left}',
    '.tc-item{display:block;width:100%;min-height:44px;margin:0 0 8px;padding:9px 16px 11px;border-radius:12px;border:1px solid var(--tc-hair);',
    'background:var(--tc-glass);text-align:left;transition:border-color .3s}',
    '.tc-item .tc-label{display:block;font-size:8px;margin-bottom:3px}',
    '.tc-item .tc-t{display:block;font-size:14px;line-height:1.4;color:var(--tc-ink);letter-spacing:.02em}',
    '.tc-item.tc-sel{border-color:var(--tc-accent)}',
    '.tc-item .tc-hint{display:block;max-height:0;overflow:hidden;font-size:11px;color:var(--tc-accent);letter-spacing:.08em;transition:max-height .3s}',
    '.tc-item.tc-sel .tc-hint{max-height:2em;margin-top:4px}',
    // practice
    '.tc-kind{display:block;margin-top:16px}',
    '.tc-say{margin:12px auto 0;max-width:340px;font:300 17px/1.55 var(--tc-body);letter-spacing:.02em;color:var(--tc-ink)}',
    '.tc-practice-stage{padding-top:5vh}',
    // sheet + card
    '.tc-scrim{position:absolute;inset:0;z-index:8;background:rgba(0,0,0,.42);opacity:0;transition:opacity .42s var(--tc-sheet-ease)}',
    '.tc-scrim.tc-on{opacity:1}',
    '.tc-sheet{position:absolute;left:0;right:0;bottom:0;z-index:9;background:var(--tc-sheet);border-radius:14px 14px 0 0;',
    'padding:8px 16px calc(var(--tc-sab) + 18px);transform:translateY(100%);transition:transform .42s var(--tc-sheet-ease);',
    '-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}',
    '.tc-sheet.tc-on{transform:none}',
    '.tc-grab{display:block;width:36px;height:5px;border-radius:3px;background:var(--tc-grab);margin:0 auto 14px}',
    '.tc-grab-hit{display:block;width:100%;height:28px;margin:-8px 0 0}',
    '.tc-sheet-title{margin:0 0 14px;text-align:center;font:400 13px/1.4 var(--tc-body);letter-spacing:.3em;color:var(--tc-ink);text-transform:lowercase}',
    '.tc-srow{display:flex;align-items:center;justify-content:center;width:100%;min-height:46px;margin:0 0 6px;padding:0 16px;border-radius:12px;background:var(--tc-row);',
    'font:300 14px/1.3 var(--tc-body);letter-spacing:.1em;color:var(--tc-dim)}',
    '.tc-srow.tc-danger{color:var(--tc-danger)}.tc-srow.tc-quietrow{color:var(--tc-meta)}',
    '.tc-srow.tc-switch{justify-content:space-between}',
    '.tc-srow.tc-switch i{position:relative;flex:none;width:36px;height:20px;border-radius:10px;border:1px solid var(--tc-hair)}',
    '.tc-srow.tc-switch i:after{content:"";position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:var(--tc-meta);transition:left .25s,background .25s}',
    '.tc-srow.tc-switch[aria-checked=true] i{border-color:var(--tc-accent)}.tc-srow.tc-switch[aria-checked=true] i:after{left:19px;background:var(--tc-accent)}',
    '.tc-snote{margin:-2px 0 10px;text-align:center;font-size:11px;color:var(--tc-meta);letter-spacing:.06em}',
    '.tc-card{position:absolute;left:16px;right:16px;bottom:calc(var(--tc-sab) + 10px);z-index:9;border-radius:14px;border:1px solid var(--tc-hair);',
    'background:var(--tc-sheet);padding:22px 20px 20px;text-align:center;opacity:0;transform:translateY(16px);transition:opacity .42s var(--tc-sheet-ease),transform .42s var(--tc-sheet-ease);',
    '-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}',
    '.tc-card.tc-on{opacity:1;transform:none}',
    '.tc-card h2{margin:0 0 16px;font:300 15px/1.3 var(--tc-body);letter-spacing:.3em;color:var(--tc-ink)}',
    '.tc-card p{margin:0 0 10px;font-size:15px;line-height:1.5;color:var(--tc-ink)}',
    '.tc-card .tc-small{font-size:12px;color:var(--tc-meta)}',
    '.tc-msg{position:absolute;left:20px;right:20px;bottom:calc(var(--tc-sab) + 182px);text-align:center;font-size:12px;color:var(--tc-meta);letter-spacing:.06em;pointer-events:none}',
    '.tc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    // Reduce Motion: hold still; captions may fade once
    '.tc-still *{transition:none!important;animation:none!important}',
    '.tc-still .tc-nudge,.tc-still .tc-cue-svg{transition:opacity .45s!important}',
    '.tc-still .tc-nudge:not(.tc-on){transition:opacity .6s!important}'
  ].join('');

  // ---------- build ----------
  function build() {
    if (S.built) return;
    if (!doc.getElementById('tc-style')) doc.head.appendChild(h('style', { id: 'tc-style', text: CSS }));
    var host = (GJ.app && GJ.app.roomHost) || doc.body;
    S.el = h('section', { id: 'tonecheck', cls: 'tc-room', 'aria-label': 'Tone Check', hidden: true }, [
      h('div', { cls: 'tc-sr', html: '<svg width="0" height="0"><filter id="tc-ic-blur" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur stdDeviation="11"/></filter></svg>' }),
      h('button', { cls: 'tc-settings', type: 'button', 'aria-label': 'Tone Check settings', onclick: function () { openSheet('settings'); } },
        [h('span', { html: icon('settings') })]),
      h('header', { cls: 'tc-head' }),
      h('main', { cls: 'tc-main' }),
      h('footer', { cls: 'tc-foot' }, [
        h('p', { cls: 'tc-denied-line', role: 'text' }),
        h('div', { cls: 'tc-go-wrap' }),
        h('div', { cls: 'tc-tabs', role: 'tablist', 'aria-label': 'Mode' }, ['live', 'review', 'practice'].map(function (m) {
          return h('button', { cls: 'tc-tab', type: 'button', role: 'tab', 'data-tab': m, 'aria-selected': 'false',
            'aria-label': m.charAt(0).toUpperCase() + m.slice(1), text: m, onclick: function () { onTab(m); } });
        }))
      ]),
      h('p', { cls: 'tc-msg', role: 'status', 'aria-live': 'polite' }),
      h('div', { cls: 'tc-overlay' })
    ]);
    host.appendChild(S.el);
    S.goWrap = q('.tc-go-wrap');
    S.nudge = h('p', { cls: 'tc-nudge', role: 'status', 'aria-live': 'polite' });
    S.timer = h('span', { cls: 'tc-timer', role: 'timer', 'aria-label': 'Take time, 0:00' });
    S.cueBox = h('div', { cls: 'tc-cue', role: 'img', 'aria-label': 'Live tone line', title: '' }, [Cue.el()]);
    S.cueBox.setAttribute('aria-description', 'The written nudge, if any, is the source of truth');

    if (root.MutationObserver) {
      var mo = new root.MutationObserver(function () { if (S.visible) { applyLook(); applyMotion(); } });
      [doc.documentElement, doc.body].forEach(function (n) { mo.observe(n, { attributes: true, attributeFilter: ['class', 'data-look', 'data-mode'] }); });
    }
    if (motionQuery) {
      var onMq = function () { if (S.visible) applyMotion(); };
      if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMq); else if (motionQuery.addListener) motionQuery.addListener(onMq);
    }
    doc.addEventListener('visibilitychange', function () { if (doc.hidden && S.take) stopTake('hidden'); });
    S.built = true;
  }

  // ---------- rendering ----------
  function say(text) { if (S.el) q('.tc-msg').textContent = text || ''; }

  function chip(intent, opts) {
    opts = opts || {};
    if (opts.static) return h('div', { cls: 'tc-chip tc-static', role: 'text', 'aria-label': 'Intent, ' + intent }, [h('span', { text: intent })]);
    return h('button', { cls: 'tc-chip', type: 'button', 'aria-pressed': S.intent === intent ? 'true' : 'false', 'aria-label': 'Intent, ' + intent,
      disabled: !!S.take, onclick: function () { setIntent(intent, opts.then); } }, [h('span', { text: intent })]);
  }
  function previewMark() {
    var generic = S.source !== 'personal';
    return h('span', { cls: 'tc-label tc-preview', 'aria-label': generic ? 'Preview, generic target' : null, text: generic ? 'preview' : '' });
  }

  function renderHeader() {
    if (!S.el) return;
    var head = q('.tc-head');
    clear(head);
    head.appendChild(h('h1', { cls: 'tc-title', 'aria-label': 'Tone Check', text: 'tone check' }));
    var v = S.view;
    if (v === 'intent') {
      head.appendChild(h('p', { cls: 'tc-sub', text: 'first, set an intent' }));
    } else if (v === 'live') {
      head.appendChild(h('p', { cls: 'tc-sub', 'aria-label': 'Guide tone so it reflects what you meant. This is not a score and not a test.', text: 'guide tone so it reflects what you meant' }));
      head.appendChild(chips());
      head.appendChild(previewMark());
    } else if (v === 'practice' && !S.openPrompt) {
      head.appendChild(h('p', { cls: 'tc-sub', text: 'choose a sentence' }));
    }
  }
  function chips(then) {
    var row = h('div', { cls: 'tc-chips', role: 'group', 'aria-label': 'Intent' });
    S.intents.forEach(function (i) { row.appendChild(chip(i, { then: then })); });
    if (S.intents.indexOf(S.intent) === -1) row.appendChild(chip(S.intent, { then: then }));
    return row;
  }

  function render() {
    if (!S.el) return;
    renderHeader();
    var main = q('.tc-main');
    clear(main);
    main.scrollTop = 0;
    var v = S.view;
    S.el.setAttribute('data-view', v);
    q('.tc-tabs').style.visibility = v === 'intro' ? 'hidden' : '';
    Array.prototype.forEach.call(S.el.querySelectorAll('.tc-tab'), function (b) {
      b.setAttribute('aria-selected', b.getAttribute('data-tab') === (v === 'intent' ? 'live' : v) ? 'true' : 'false');
      b.disabled = !!S.take;
    });
    if (v === 'intro') renderIntro(main);
    else if (v === 'intent') renderIntent(main);
    else if (v === 'live') renderLive(main);
    else if (v === 'review') renderReview(main);
    else if (v === 'practice') renderPractice(main);
    renderGo();
  }

  function renderIntro(main) {
    var modes = [['live', 'live', 'a quiet line while you talk'], ['review', 'review', 'plain words after a take'], ['practice', 'practice', 'a sentence, and a tone to aim for']];
    main.appendChild(h('div', { cls: 'tc-intro' }, [
      h('p', { cls: 'tc-lead', text: 'a calm place to check that how you sound matches what you meant' }),
      h('p', { cls: 'tc-small', text: 'it is not a score and not a test. recordings stay on your phone.' }),
      h('ul', { cls: 'tc-modes-list' }, modes.map(function (m) {
        return h('li', null, [h('i', { html: icon(m[0]), 'aria-hidden': 'true' }),
          h('div', null, [h('b', { cls: 'tc-label', text: m[1] }), h('span', { text: m[2] })])]);
      })),
      h('button', { cls: 'tc-btn tc-strong', type: 'button', 'aria-label': 'Begin', 'aria-description': 'Leaves the first-run intro and sets an intent', text: 'begin',
        onclick: function () { store('oz.tonecheck.intro', 'seen'); setView('intent'); } })
    ]));
  }

  function renderIntent(main) {
    var box = h('div', { cls: 'tc-stage', style: 'padding-top:12px' });
    box.appendChild(chips(function () { setView('live'); }));
    var input = h('input', { cls: 'tc-word', type: 'text', maxlength: '20', autocomplete: 'off', autocapitalize: 'none', enterkeyhint: 'done',
      'aria-label': 'Your own intent, text field', 'aria-description': 'A short word for the tone you mean', placeholder: 'or a short word of your own',
      value: S.intents.indexOf(S.intent) === -1 ? S.intent : '' });
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var w = cleanWord(input.value);
      if (w) setIntent(w, function () { setView('live'); });
    });
    box.appendChild(input);
    box.appendChild(previewMark());
    main.appendChild(box);
  }

  function renderLive(main) {
    var stage = h('div', { cls: 'tc-stage' });
    if (!S.take && !S.sessions.length && S.mic !== 'denied') {
      stage.appendChild(h('div', { cls: 'tc-quiet', role: 'text', 'aria-label': 'No takes yet. Choose an intent, then start when you are ready.' }, [
        h('b', { text: 'no takes yet' }), h('p', { text: 'choose an intent, then start when you are ready' })]));
    } else if (S.mic === 'denied' && !S.take) {
      stage.appendChild(deniedNote());
    } else {
      stage.appendChild(S.timer);
      stage.appendChild(S.cueBox);
      stage.appendChild(S.nudge);
      if (!S.take) { S.timer.textContent = ''; Cue.set('idle'); setNudge(null); }
    }
    main.appendChild(stage);
  }
  function deniedNote() {
    return h('div', { cls: 'tc-quiet', role: 'text', 'aria-label': 'The microphone is not available. You can still read prompts and open old sessions.' }, [
      h('b', { text: 'the microphone is not available' }),
      h('p', { text: 'you can still read prompts and open old sessions. oz will not ask again until you choose start.' })]);
  }

  // Start / Stop, under the stage, for Live, an open practice sentence, and an empty Review.
  function renderGo() {
    clear(S.goWrap);
    // Denied: the full note sits on the stage in Live and an open sentence; everywhere else
    // a short line stays pinned above the tabs, so a long list never pushes it off screen.
    var dl = q('.tc-denied-line'), stageNote = S.view === 'live' || (S.view === 'practice' && S.openPrompt && !S.practiceResult);
    dl.textContent = S.mic === 'denied' && !S.take && S.view !== 'intro' && !stageNote
      ? 'the microphone is not available. you can still read prompts and open old sessions.' : '';
    var v = S.view, show = v === 'live' || (v === 'practice' && S.openPrompt && !S.practiceResult) || (v === 'review' && !S.sessions.length && !S.take);
    if (!show) return;
    var rec = !!S.take, paused = S.mic === 'denied' && !rec;
    var b = h('button', { cls: 'tc-go' + (rec ? ' tc-rec' : '') + (paused ? ' tc-paused' : ''), type: 'button',
      'aria-label': rec ? 'Stop' : 'Start',
      'aria-description': rec ? 'Stops the take and releases the microphone' : 'Starts a take and asks for the microphone the first time · or hold it, and let go to stop',
      html: icon(rec ? 'stop' : 'mic'), onclick: function () { if (Hold.ate) { Hold.ate = false; return; } onGo(); } });
    b.addEventListener('pointerdown', holdDown);
    S.goWrap.appendChild(b);
    S.goWrap.appendChild(h('span', { cls: 'tc-go-note', text: paused ? 'start is paused' : '' }));
  }

  function renderReview(main) {
    var r = S.open;
    if (!r) {
      main.appendChild(h('div', { cls: 'tc-stage' }, [h('div', { cls: 'tc-quiet', role: 'text', 'aria-label': 'No takes yet. When you finish a take, the reading will wait here.' }, [
        h('b', { text: 'no takes yet' }), h('p', { text: 'when you finish a take, the reading will wait here' })])]));
      return;
    }
    main.appendChild(chip(r.intent, { static: true }));
    main.appendChild(h('p', { cls: 'tc-words', tabindex: '-1', text: r.words }));
    if (r.source !== 'personal') main.appendChild(h('span', { cls: 'tc-label tc-preview', 'aria-label': 'Preview, generic target', text: 'preview' }));
    main.appendChild(takeLine(r));
    var detail = detailLine(r);
    if (detail) main.appendChild(h('p', { cls: 'tc-detail', text: detail }));
    var canPlay = r.blob || r.hasAudio;
    main.appendChild(h('div', { cls: 'tc-actions' }, [
      h('button', { cls: 'tc-act tc-replay', type: 'button', 'aria-label': S.playing ? 'Pause' : 'Replay', disabled: !canPlay, onclick: togglePlay }, [
        h('i', { html: icon('replay') }), h('span', { cls: 'tc-label', text: S.playing ? 'pause' : 'replay' })]),
      h('button', { cls: 'tc-act', type: 'button', 'aria-label': 'Delete this take', onclick: function () { openSheet('delete'); } }, [
        h('i', { html: icon('delete') }), h('span', { cls: 'tc-label', text: 'delete' })])
    ]));
    var others = S.sessions.filter(function (s) { return s.id !== r.id; });
    if (others.length) {
      main.appendChild(h('span', { cls: 'tc-label tc-list-head', style: 'display:block', text: 'earlier takes' }));
      var ul = h('ul', { cls: 'tc-list' });
      others.forEach(function (s) {
        var sel = S.selectedSession === s.id;
        ul.appendChild(h('li', null, [h('button', { cls: 'tc-item' + (sel ? ' tc-sel' : ''), type: 'button',
          'aria-label': s.intent + ', ' + s.mode + ', ' + fmtWhen(s.at) + '. ' + s.words,
          'aria-description': 'First tap selects, second tap on the same item opens it',
          onclick: function () { if (S.selectedSession !== s.id) { S.selectedSession = s.id; render(); return; } openSession(s); } }, [
          h('span', { cls: 'tc-label', text: s.intent + ' · ' + s.mode + ' · ' + fmtWhen(s.at) }),
          h('span', { cls: 'tc-t', text: s.words }),
          h('span', { cls: 'tc-hint', 'aria-hidden': 'true', text: 'tap again to open' })])]));
      });
      main.appendChild(ul);
    }
  }

  function takeLine(r) {
    var dur = Math.max(r.duration || 0, 0.1), marks = r.markers || [];
    var line = h('div', { cls: 'tc-take' + (marks.length ? '' : ' tc-stayed'), role: marks.length ? 'group' : 'img',
      'aria-label': marks.length ? 'Take, with marked moments' : 'Take, no moments marked' });
    if (!marks.length) [0, 50, 100].forEach(function (x) { line.appendChild(h('i', { cls: 'tc-end', style: 'left:' + x + '%' })); });
    // one marker per kind and nearby moment, so labels do not crowd
    var shown = [];
    marks.forEach(function (m) {
      var c = Math.min(98, Math.max(2, ((m.at + m.duration / 2) / dur) * 100));
      if (shown.some(function (s) { return Math.abs(s - c) < 16; })) return;
      shown.push(c);
      line.appendChild(h('button', { cls: 'tc-mk', type: 'button', style: 'left:' + c + '%', 'aria-label': 'Marker, ' + m.word + ', at ' + fmtTime(m.at) + '. Play from here',
        onclick: function () { seekTo(m.at); } }, [h('i'), h('span', { text: m.word })]));
    });
    line.appendChild(h('i', { cls: 'tc-head-pos', 'aria-hidden': 'true' }));
    return line;
  }

  // A second plain line saying where the moments fell: "a little rushed near the start, and rising at the ends."
  function detailLine(r) {
    var marks = r.markers || [], dur = Math.max(r.duration || 0, 0.1);
    if (!marks.length) return '';
    function where(m) { var c = (m.at + m.duration / 2) / dur; return c < 0.34 ? 'near the start' : c < 0.67 ? 'in the middle' : 'near the end'; }
    var parts = [];
    ['rushed', 'rising', 'flat'].forEach(function (k) {
      var ms = marks.filter(function (m) { return m.kind === k; });
      if (!ms.length) return;
      if (k === 'rising') { parts.push(ms.length > 1 ? 'rising at the ends' : 'rising at the end of a line ' + where(ms[0])); return; }
      var places = [];
      ms.forEach(function (m) { var w = where(m); if (places.indexOf(w) === -1) places.push(w); });
      parts.push((k === 'rushed' ? 'a little rushed ' : 'a little flat ') + (places.length > 2 ? 'in a few places' : places.join(' and ')));
    });
    return parts.join(', and ') + '.';
  }

  function renderPractice(main) {
    if (!S.openPrompt) {
      var ul = h('ul', { cls: 'tc-list', style: 'margin-top:14px' });
      if (!S.prompts.length) ul.appendChild(h('li', { cls: 'tc-quiet' }, [h('p', { text: 'no sentences here yet.' })]));
      S.prompts.forEach(function (p) {
        var sel = S.selectedPrompt === p.id;
        ul.appendChild(h('li', null, [h('button', { cls: 'tc-item' + (sel ? ' tc-sel' : ''), type: 'button',
          'aria-label': p.intent + '. ' + p.text, 'aria-description': 'First tap selects, second tap on the same item opens it',
          onclick: function () { if (S.selectedPrompt !== p.id) { S.selectedPrompt = p.id; render(); return; } openPrompt(p); } }, [
          h('span', { cls: 'tc-label', text: p.intent + (p.level === 'moment' ? ' · a short moment' : '') }),
          h('span', { cls: 'tc-t', text: p.text }),
          h('span', { cls: 'tc-hint', 'aria-hidden': 'true', text: 'tap again to open' })])]));
      });
      main.appendChild(ul);
      main.appendChild(h('span', { cls: 'tc-label tc-preview', style: 'margin-top:10px', text: S.promptsFallback ? 'preview · built-in prompts' : (S.source !== 'personal' ? 'preview' : '') }));
      return;
    }
    var p = S.openPrompt;
    main.appendChild(chip(p.intent, { static: true }));
    main.appendChild(h('span', { cls: 'tc-label tc-kind', text: p.level === 'moment' ? 'a short moment' : 'sentence' }));
    main.appendChild(h('p', { cls: 'tc-say', tabindex: '-1', 'aria-label': 'Practice sentence, ' + p.text + '. Target, ' + p.intent + '.', text: p.text }));
    main.appendChild(previewMark());
    if (S.practiceResult) {
      main.appendChild(h('p', { cls: 'tc-words', tabindex: '-1', style: 'margin-top:30px', text: S.practiceResult.words }));
      main.appendChild(h('p', { cls: 'tc-detail', style: 'margin-top:10px', text: 'ready for another, or a short real moment.' }));
      main.appendChild(h('div', { cls: 'tc-row-btns' }, [
        h('button', { cls: 'tc-btn', type: 'button', 'aria-label': 'Practise this sentence again', text: 'again', onclick: function () { S.practiceResult = null; render(); } }),
        h('button', { cls: 'tc-btn tc-strong', type: 'button', 'aria-label': 'Next practice', text: 'next', onclick: nextPrompt })
      ]));
      return;
    }
    var stage = h('div', { cls: 'tc-practice-stage' });
    if (S.mic === 'denied' && !S.take) stage.appendChild(deniedNote());
    else {
      stage.appendChild(S.timer); stage.appendChild(S.cueBox); stage.appendChild(S.nudge);
      if (!S.take) { S.timer.textContent = ''; Cue.set('idle'); setNudge(null); }
    }
    main.appendChild(stage);
  }

  // ---------- navigation ----------
  function setView(v) {
    if (S.take) return;
    S.view = v;
    if (v !== 'practice') { S.openPrompt = null; S.practiceResult = null; }
    stopAudio();
    say('');
    render();
  }
  function onTab(m) {
    if (S.take) return;
    if (m === 'practice' && S.view === 'practice' && S.openPrompt) { S.openPrompt = null; S.practiceResult = null; render(); return; }
    if (m === 'review' && !S.open && S.sessions.length) S.open = S.sessions[0];
    setView(m);
  }
  function setIntent(i, then) {
    if (S.take) return;
    S.intent = i;
    store('oz.tonecheck.intent', i);
    loadTargets();
    if (then) then(); else render();
  }
  function openSession(s) {
    if (S.take) return;
    stopAudio();
    S.open = s;
    S.selectedSession = null;
    render();
    focusFirst('.tc-words');
  }
  function openPrompt(p) {
    S.openPrompt = p;
    S.practiceResult = null;
    S.selectedPrompt = p.id;
    S.intent = cleanWord(p.intent) || S.intent;
    loadTargets();
    render();
    focusFirst('.tc-say');
  }
  function nextPrompt() {
    if (!S.prompts.length) return;
    var i = -1;
    for (var k = 0; k < S.prompts.length; k++) if (S.openPrompt && S.prompts[k].id === S.openPrompt.id) i = k;
    openPrompt(S.prompts[(i + 1) % S.prompts.length]);
  }
  function focusFirst(sel) { setTimeout(function () { var e = S.el.querySelector(sel); if (e) e.focus(); }, 0); }

  // ---------- hold to record (24 Nov): a tap still starts and stops; a hold starts, letting go stops, and a cancelled
  // pointer or a slide off the control stops and lets the take go. One finger only: a second finger (the two-finger hold
  // that opens Tune) cancels the hold and is left to do its own thing. The listeners live on the document because the
  // control is drawn again when the take starts ----------
  var Hold = { t: 0, on: false, id: null, ate: false, box: null };
  function holdDown(e) {
    if (!e.isPrimary || S.take || Hold.on) return;
    if (!(S.mic === 'granted' || store('oz.tonecheck.micAsked') === 'yes')) return;   // the first time, the tap asks through the card
    clearTimeout(Hold.t); Hold.id = e.pointerId; var r = e.currentTarget.getBoundingClientRect(); Hold.box = { l: r.left - 36, r: r.right + 36, t: r.top - 36, b: r.bottom + 36 };
    doc.addEventListener('pointerup', holdUp, true); doc.addEventListener('pointercancel', holdCancel, true); doc.addEventListener('pointermove', holdMove, true); doc.addEventListener('pointerdown', holdSecond, true);
    Hold.t = setTimeout(function () { Hold.t = 0; if (S.take) return; Hold.on = true; Hold.ate = true; onGo(); }, 380);
  }
  function holdEnd(reason) {
    clearTimeout(Hold.t); Hold.t = 0; doc.removeEventListener('pointerup', holdUp, true); doc.removeEventListener('pointercancel', holdCancel, true); doc.removeEventListener('pointermove', holdMove, true); doc.removeEventListener('pointerdown', holdSecond, true);
    if (Hold.on) { Hold.on = false; if (S.take) stopTake(reason); }
    Hold.id = null;
  }
  function holdUp(e) { if (e.pointerId !== Hold.id) return; holdEnd('stop'); }
  function holdCancel(e) { if (e.pointerId !== Hold.id) return; Hold.ate = false; holdEnd('cancel'); }
  function holdMove(e) { if (e.pointerId !== Hold.id || !Hold.box) return; var B = Hold.box; if (e.clientX < B.l || e.clientX > B.r || e.clientY < B.t || e.clientY > B.b) { Hold.ate = !!Hold.on; holdEnd('cancel'); } }
  function holdSecond(e) { if (e.pointerId !== Hold.id) { Hold.ate = !!Hold.on; holdEnd('cancel'); } }   // two fingers: not ours

  // ---------- microphone and takes ----------
  function onGo() {
    if (S.take) { stopTake('stop'); return; }
    if (S.view === 'review') { S.view = 'live'; render(); }
    if (!profile()) { say('tone targets are not ready yet. prompts and saved takes still open.'); return; }
    if (S.mic === 'granted' || store('oz.tonecheck.micAsked') === 'yes') { startTake(); return; }
    // Ask through the in-room card first; the system prompt follows only after "continue".
    var perm = root.navigator && root.navigator.permissions;
    if (perm && perm.query) {
      perm.query({ name: 'microphone' }).then(function (st) {
        if (st.state === 'granted') { S.mic = 'granted'; startTake(); } else openCard();
      }, openCard);
    } else openCard();
  }

  function startTake() {
    if (S.take) return;
    var R = Reader(), md = root.navigator && root.navigator.mediaDevices, Ctx = root.AudioContext || root.webkitAudioContext;
    if (!md || typeof md.getUserMedia !== 'function' || !Ctx || !R) { S.mic = 'denied'; render(); return; }
    stopAudio();
    say('');
    var ctx = new Ctx();                                   // made inside the tap, so it is allowed to run
    if (ctx.resume) ctx.resume();
    var take = S.take = { mode: S.view === 'practice' ? 'practice' : 'live', prompt: S.openPrompt, intent: S.intent, ctx: ctx, pending: true, chunks: [] };
    store('oz.tonecheck.micAsked', 'yes');
    render();
    md.getUserMedia({ audio: true }).then(function (stream) {
      if (S.take !== take) { stopStream(stream); return; }
      S.mic = 'granted';
      take.stream = stream;
      return (S.targets ? Promise.resolve(S.targets) : loadTargets()).then(function (targets) {
        if (S.take !== take) return;
        take.pending = false;
        take.reader = R.createReader();
        take.reader.start(stream, targets, { audioContext: ctx, onSnapshot: onSnapshot });
        startRecorder(take, stream);
        take.startedAt = Date.now();
        take.tick = setInterval(function () { var t = fmtTime((Date.now() - take.startedAt) / 1000); S.timer.textContent = t; S.timer.setAttribute('aria-label', 'Take time, ' + t); }, 500);
        S.timer.textContent = '0:00';
        Cue.set('track');
      });
    }).catch(function (err) {
      if (S.take !== take) return;
      endTakeAudio(take);
      S.take = null;
      var name = err && err.name;
      S.mic = 'denied';
      if (name !== 'NotAllowedError' && name !== 'SecurityError') say('there is no microphone available here.');
      render();
    });
  }

  function startRecorder(take, stream) {
    if (typeof root.MediaRecorder !== 'function') return;
    var types = ['audio/mp4', 'audio/webm', 'audio/ogg'], mime = '';
    for (var i = 0; i < types.length; i++) if (root.MediaRecorder.isTypeSupported && root.MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; }
    try {
      var rec = new root.MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = function (e) { if (e.data && e.data.size) take.chunks.push(e.data); };
      rec.start(1000);
      take.recorder = rec;
      take.mime = rec.mimeType || mime || 'audio/mp4';
    } catch (e) { take.recorder = null; }
  }
  function stopStream(stream) { if (stream) stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) { /* gone */ } }); }
  function endTakeAudio(take) {
    if (take.tick) clearInterval(take.tick);
    stopStream(take.stream); take.stream = null;
    if (take.ctx && take.ctx.state !== 'closed') { try { take.ctx.close(); } catch (e) { /* closed */ } }
  }

  // reason: 'stop' (they chose Stop), 'hidden' (the page went away), 'leave' (room closed: nothing is kept)
  function stopTake(reason) {
    var take = S.take;
    if (!take) return;
    S.take = null;
    Cue.stop();
    var result = take.reader ? take.reader.stop(take.intent, S.source) : null;
    var rec = take.recorder;
    var blobReady = new Promise(function (resolve) {
      var done = function () { resolve(take.chunks.length ? new Blob(take.chunks, { type: take.mime }) : null); };
      if (!rec || rec.state === 'inactive') { done(); return; }
      rec.onstop = done;
      try { rec.stop(); } catch (e) { resolve(null); }
    });
    endTakeAudio(take);                                   // the microphone is released now, not later
    if (reason === 'leave' || reason === 'cancel' || !result) { render(); return; }   // a cancelled hold keeps nothing

    var session = {
      id: 'tc-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36),
      intent: take.intent, mode: take.mode, at: take.startedAt || Date.now(),
      words: result.words, markers: result.markers, duration: result.duration, source: result.source,
      prompt: take.prompt ? { id: take.prompt.id, text: take.prompt.text, intent: take.prompt.intent, level: take.prompt.level } : null,
      mime: take.mime || null, hasAudio: false, blob: null
    };
    // Every finished take is kept on the phone, and can be deleted from Review.
    S.sessions.unshift(session);
    S.open = session;
    blobReady.then(function (blob) {
      session.blob = blob; session.hasAudio = !!blob;
      var clean = {}; for (var k in session) if (k !== 'blob') clean[k] = session[k];
      return (blob ? blob.arrayBuffer() : Promise.resolve(null)).then(function (buf) { return DB.put(clean, buf, session.mime); })
        .then(function () { S.noStore = false; }, function () { S.noStore = true; say('saving is not available on this device, so takes stay only until you leave the room.'); });
    }).then(function () { if (S.visible && !S.take && S.open === session) refreshReplay(); });

    if (take.mode === 'practice') { S.practiceResult = session; render(); focusFirst('.tc-words'); }
    else { S.view = 'review'; render(); focusFirst('.tc-words'); }
  }

  // ---------- live feedback ----------
  var lastDrift = '';
  function onSnapshot(snap) {
    var d = (snap.drift || []).join();
    if (d === lastDrift) return;
    var had = !!lastDrift;
    lastDrift = d;
    var primary = snap.drift && snap.drift[0];
    Cue.set(primary || 'track');
    if (primary) { setNudge(snap.nudge); if (!had) softTick(); } else setNudge(null);
  }
  function setNudge(text) {
    if (!S.nudge) return;
    if (text) { S.nudge.textContent = text; S.nudge.classList.add('tc-on'); }
    else {
      S.nudge.classList.remove('tc-on');
      var n = S.nudge;
      setTimeout(function () { if (!n.classList.contains('tc-on')) n.textContent = ''; }, S.reduce ? 0 : 600);
    }
    if (!text) lastDrift = '';
  }

  // ---------- replay ----------
  function audioFor(r) {
    if (r.blob) return Promise.resolve(r.blob);
    return DB.audio(r.id).then(function (a) { return a ? new Blob([a.buf], { type: a.mime || 'audio/mp4' }) : null; }, function () { return null; });
  }
  function ensureAudio() {
    if (S.audio) return Promise.resolve(S.audio);
    var r = S.open;
    if (!r) return Promise.resolve(null);
    return audioFor(r).then(function (blob) {
      if (!blob || S.open !== r) return null;
      S.audioUrl = URL.createObjectURL(blob);
      var el = new Audio(S.audioUrl);
      el.preload = 'auto';
      el.addEventListener('timeupdate', moveHead);
      el.addEventListener('ended', function () { setPlaying(false); });
      el.addEventListener('pause', function () { setPlaying(false); });
      el.addEventListener('play', function () { setPlaying(true); });
      S.audio = el;
      return el;
    });
  }
  function togglePlay() {
    if (S.audio && !S.audio.paused) { S.audio.pause(); return; }
    ensureAudio().then(function (el) { if (el) el.play().catch(function () { /* needs another tap */ }); });
  }
  function seekTo(t) {
    ensureAudio().then(function (el) {
      if (!el) return;
      try { el.currentTime = Math.max(0, t - 0.3); } catch (e) { /* not seekable yet */ }
      el.play().catch(function () { /* needs another tap */ });
    });
  }
  function setPlaying(on) {
    S.playing = on;
    var b = S.el && S.el.querySelector('.tc-replay');
    if (!b) return;
    b.setAttribute('aria-label', on ? 'Pause' : 'Replay');
    b.querySelector('.tc-label').textContent = on ? 'pause' : 'replay';
    var hp = S.el.querySelector('.tc-head-pos');
    if (hp) hp.style.opacity = on ? '1' : '0';
  }
  function moveHead() {
    var r = S.open, hp = S.el && S.el.querySelector('.tc-head-pos');
    if (!r || !hp || !S.audio) return;
    hp.style.left = Math.min(100, (S.audio.currentTime / Math.max(r.duration || 0, 0.1)) * 100) + '%';
  }
  function refreshReplay() { var b = S.el.querySelector('.tc-replay'); if (b && S.open) b.disabled = !(S.open.blob || S.open.hasAudio); }
  function stopAudio() {
    if (S.audio) { try { S.audio.pause(); } catch (e) { /* stopped */ } S.audio.removeAttribute('src'); S.audio = null; }
    if (S.audioUrl) { URL.revokeObjectURL(S.audioUrl); S.audioUrl = null; }
    S.playing = false;
  }

  // ---------- sheets and the microphone card ----------
  function overlay() { return q('.tc-overlay'); }
  function closeOverlay() {
    var o = overlay(), back = S.returnFocus;
    var parts = o.querySelectorAll('.tc-on');
    Array.prototype.forEach.call(parts, function (p) { p.classList.remove('tc-on'); });
    S.sheet = null; S.card = false; S.confirmAll = false;
    setTimeout(function () { if (!S.sheet && !S.card) clear(o); }, S.reduce ? 0 : 420);
    if (back && back.isConnected) back.focus();
  }
  function showOverlay(panel) {
    var o = overlay();
    clear(o);
    var scrim = h('div', { cls: 'tc-scrim', onclick: closeOverlay });
    o.appendChild(scrim); o.appendChild(panel);
    S.returnFocus = doc.activeElement;
    // next frame, so the slide and fade run
    root.requestAnimationFrame(function () { scrim.classList.add('tc-on'); panel.classList.add('tc-on'); });
    setTimeout(function () { var f = panel.querySelector('[data-first]') || panel.querySelector('button'); if (f) f.focus(); }, 30);
  }
  function sheet(title, rows, label) {
    return h('div', { cls: 'tc-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': label || title }, [
      h('button', { cls: 'tc-grab-hit', type: 'button', 'aria-label': 'Close', onclick: closeOverlay }, [h('i', { cls: 'tc-grab' })]),
      h('p', { cls: 'tc-sheet-title', tabindex: '-1', 'data-first': '', text: title })
    ].concat(rows));
  }
  function openSheet(kind) {
    if (S.take) return;
    S.sheet = kind;
    if (kind === 'delete') {
      showOverlay(sheet('delete this take?', [
        h('button', { cls: 'tc-srow tc-danger', type: 'button', 'aria-label': 'Delete this take', 'aria-description': 'Deletes the recording, the words and the markers', text: 'delete this take', onclick: deleteOpen }),
        h('button', { cls: 'tc-srow tc-quietrow', type: 'button', 'aria-label': 'Keep it', text: 'keep it', onclick: closeOverlay })
      ]));
    } else showOverlay(settingsSheet());
  }
  function settingsSheet() {
    var rows = [];
    if (!S.confirmAll) {
      rows.push(h('button', { cls: 'tc-srow tc-switch', type: 'button', role: 'switch', 'aria-checked': S.haptic ? 'true' : 'false', 'aria-label': 'Soft haptic nudge',
        'aria-description': 'Off by default. Stays silent when haptics are off in Tune.', onclick: function (e) {
          S.haptic = !S.haptic; store('oz.tonecheck.haptic', S.haptic ? 'on' : 'off'); e.currentTarget.setAttribute('aria-checked', S.haptic ? 'true' : 'false'); } },
        [h('span', { text: 'soft haptic nudge' }), h('i')]));
      rows.push(h('p', { cls: 'tc-snote', text: 'off by default. silent when haptics are off in tune.' }));
      slotRows().forEach(function (r) { rows.push(r); });
      rows.push(h('button', { cls: 'tc-srow', type: 'button', 'aria-label': 'Set an intent of your own', text: 'an intent of your own', onclick: function () { closeOverlay(); setView('intent'); } }));
      rows.push(h('button', { cls: 'tc-srow', type: 'button', 'aria-label': 'Show the introduction again', text: 'show the intro', onclick: function () { closeOverlay(); setView('intro'); } }));
      rows.push(h('button', { cls: 'tc-srow tc-danger', type: 'button', 'aria-label': 'Delete all Tone Check recordings', 'aria-description': 'Asks once before deleting',
        disabled: !S.sessions.length, text: S.sessions.length ? 'delete all recordings' : 'no recordings to delete',
        onclick: function () { S.confirmAll = true; showOverlay(settingsSheet()); } }));
      rows.push(h('button', { cls: 'tc-srow tc-quietrow', type: 'button', 'aria-label': 'Close settings', text: 'close', onclick: closeOverlay }));
      return sheet('settings', rows, 'Tone Check settings');
    }
    return sheet('delete all recordings?', [
      h('p', { cls: 'tc-snote', text: 'every tone check take, its words and its markers.' }),
      h('button', { cls: 'tc-srow tc-danger', type: 'button', 'aria-label': 'Delete all Tone Check recordings now', text: 'delete all', onclick: deleteAll }),
      h('button', { cls: 'tc-srow tc-quietrow', type: 'button', 'aria-label': 'Keep them', text: 'keep them', onclick: closeOverlay })
    ], 'Delete all Tone Check recordings?');
  }
  // the slot may offer rows of its own (a label and what to do); the public stub offers none
  function slotRows() {
    var vp = profile(), list = [];
    try { list = vp && typeof vp.actions === 'function' ? (vp.actions() || []) : []; } catch (e) { list = []; }
    return list.filter(function (a) { return a && a.label && typeof a.run === 'function'; }).map(function (a) {
      return h('button', { cls: 'tc-srow', type: 'button', 'aria-label': a.aria || a.label, text: a.label,
        onclick: function () { closeOverlay(); a.run({ host: S.el, look: S.look, reduce: S.reduce }); } });
    });
  }
  function openCard() {
    S.card = true;
    showOverlay(h('div', { cls: 'tc-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Microphone' }, [
      h('h2', { tabindex: '-1', 'data-first': '', text: 'microphone' }),
      h('p', { text: USAGE }),
      h('p', { cls: 'tc-small', text: 'the system prompt appears only when you choose start, and only once.' }),
      h('div', { cls: 'tc-row-btns' }, [
        h('button', { cls: 'tc-btn', type: 'button', 'aria-label': 'Not now', text: 'not now', onclick: closeOverlay }),
        h('button', { cls: 'tc-btn tc-strong', type: 'button', 'aria-label': 'Continue', 'aria-description': 'The system microphone prompt will appear', text: 'continue',
          onclick: function () { closeOverlay(); startTake(); } })
      ])
    ]));
  }
  function deleteOpen() {
    var s = S.open;
    closeOverlay();
    if (!s) return;
    stopAudio();
    DB.remove(s.id).catch(function () { /* nothing stored */ }).then(function () {
      s.blob = null;
      S.sessions = S.sessions.filter(function (x) { return x.id !== s.id; });
      S.open = S.sessions[0] || null;
      say('deleted.');
      render();
    });
  }
  function deleteAll() {
    closeOverlay();
    stopAudio();
    DB.clear().catch(function () { /* nothing stored */ }).then(function () {
      S.sessions.forEach(function (x) { x.blob = null; });
      S.sessions = []; S.open = null; S.practiceResult = null;
      say('all tone check recordings are deleted.');
      render();
    });
  }

  function refreshSessions() {
    return DB.list().then(function (list) {
      var mem = S.sessions.filter(function (s) { return s.blob && !list.some(function (l) { return l.id === s.id; }); });
      S.sessions = mem.concat(list).sort(function (a, b) { return b.at - a.at; });
      S.noStore = false;
    }, function () { S.noStore = true; })
      .then(function () {
        if (S.open && !S.sessions.some(function (s) { return s.id === S.open.id; })) S.open = null;
        if (!S.take) render();
      });
  }

  // ---------- enter / leave ----------
  GJ.rooms.tonecheck = {
    enter: function () {
      build();
      S.visible = true;
      S.el.hidden = false;
      var saved = store('oz.tonecheck.intent');
      if (saved) S.intent = saved;
      loadIntents();
      applyLook();
      applyMotion();
      watchSlot();
      S.view = store('oz.tonecheck.intro') === 'seen' ? (S.view === 'intro' ? 'live' : S.view) : 'intro';
      render();
      loadTargets();
      loadPrompts();
      refreshSessions();
    },
    leave: function () {
      if (S.take) stopTake('leave');
      stopAudio();
      Cue.stop();
      if (S.el) { clear(overlay()); }
      S.sheet = null; S.card = false; S.confirmAll = false;
      S.visible = false;
      if (S.el) S.el.hidden = true;
    },
    // For the app to call if it sets the look directly instead of on <html>/<body>.
    setLook: function (look) { applyLook(normLook(look)); },
    // For the app to call when its own Reduce Motion setting changes.
    setReduceMotion: function () { applyMotion(); },
    // True while a take is running (the microphone is the room's).
    busy: function () { return !!S.take; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
