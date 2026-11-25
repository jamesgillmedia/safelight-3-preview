/* oz 80s mode (23 Nov 2026) · "digital age with analog processes". A hidden, optional look for the whole of oz: off by
   default, found only in the red-mode controls (hold the mint dot for the pad, then slide past dim or hold the centre
   notch), turned on with a rocker. Three calm flavours: Terminal (default), Neon, 1-bit Mac + Memphis. Layout and
   navigation do not change. Photographs are never tinted and nothing draws over them. Mint stays the dot's alone.
   oz ignores Reduce Motion: nothing here checks it.
   Standalone: Home (apps/oz-open) and the app both load it; they share one state in this phone's storage.
     OZ80.on() · set(bool) · flavour([f]) · knobs({ b, c }) · scan([bool]) · found([bool]) · change(fn)
     OZ80.icon(slug, [flavour]) → svg · OZ80.slug(placeId) · OZ80.seg(text) → svg · OZ80.panel() → the rocker panel
     OZ80.mount(root, selector, idOf, slot) keeps living 80s icons on matching buttons (through the oz viewer hook) */
(function (G) {
  'use strict';
  if (G.OZ80) return;
  var html = document.documentElement, KEY = 'oz-80s', FL = ['term', 'neon', 'bit'], FLN = { term: 'terminal', neon: 'neon', bit: '1-bit' };
  var D = { on: false, fl: 'term', found: false, b: 1, c: 1, scan: true };
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') Object.keys(D).forEach(function (k) { if (k in s) D[k] = s[k]; }); } catch (e) {} if (FL.indexOf(D.fl) < 0) D.fl = 'term'; }
  var ch = null; try { ch = new BroadcastChannel(KEY); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} try { ch && ch.postMessage(D); } catch (e) {} }
  var subs = [];
  function hap() { try { if (G.GJ && G.GJ.haptic) G.GJ.haptic.tick(); else if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} }

  /* ——— the palette, turned by the BRIGHT and CONTRAST knobs (they really change it) ——— */
  function mix(a, b, t) { var p = function (h, i) { return parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); }; return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(p(a, i) + (p(b, i) - p(a, i)) * t); }).join(',') + ')'; }
  function rgba(h, a) { return 'rgba(' + [0, 1, 2].map(function (i) { return parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); }).join(',') + ',' + a.toFixed(3) + ')'; }
  function palette() {
    var b = Math.max(.25, Math.min(1, D.b)), c = Math.max(.5, Math.min(1.5, D.c)), lift = Math.max(0, (1.5 - c) / 1);   // lift: 0 (most contrast) … 1 (least)
    var V = {};
    if (D.fl === 'term') { V.ink = rgba('#7dff6a', .3 + .7 * b); V.dim = rgba('#7dff6a', .2 + .5 * b); V.meta = rgba('#5fcf55', .18 + .42 * b); V.hair = rgba('#7dff6a', .08 + .14 * b);
      V.ground = mix('#0b120c', '#24382a', lift * .55); V.panel = mix('#0f1a11', '#2a402f', lift * .5); V.glass = rgba('#0b120c', .9); V.glow = rgba('#7dff6a', .4 * b); V.lead = rgba('#7dff6a', .3 + .7 * b); V.scan = rgba('#7dff6a', .05 + .05 * b); }
    else if (D.fl === 'neon') { V.ink = rgba('#e8c08a', .3 + .7 * b); V.dim = rgba('#e8c08a', .2 + .5 * b); V.meta = rgba('#c46a48', .25 + .6 * b); V.hair = rgba('#ff2bd6', .1 + .16 * b);
      V.ground = mix('#050208', '#231a2c', lift * .55); V.panel = mix('#120814', '#2c1f32', lift * .5); V.glass = rgba('#120814', .9); V.glow = rgba('#ff2bd6', .35 * b); V.lead = rgba('#ff2bd6', .35 + .65 * b); V.scan = rgba('#3ef0ff', .04 + .04 * b); }
    else { V.ink = mix('#777773', '#111111', .3 + .7 * Math.min(1, c - .5)); V.dim = mix('#8a8a86', '#333333', .3 + .7 * Math.min(1, c - .5)); V.meta = '#555552'; V.hair = 'rgba(17,17,17,.55)';
      V.ground = mix('#6f6f6c', '#f3f3ee', .45 + .55 * b); V.panel = mix('#5a5a58', '#c8c8c4', .45 + .55 * b); V.glass = 'rgba(243,243,238,.96)'; V.glow = 'transparent'; V.lead = '#111111'; V.scan = 'transparent'; }
    return V;
  }
  function paintVars() {
    var V = palette(), s = html.style;
    Object.keys(V).forEach(function (k) { if (D.on) s.setProperty('--e80-' + k, V[k]); else s.removeProperty('--e80-' + k); });
  }

  /* ——— seven segments, drawn: off segments are fully off; a 1 is narrow ——— */
  var SEG = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgecd', '7': 'abc', '8': 'abcdefg', '9': 'abfgcd', '-': 'g' };
  function seg(text, o) {
    o = o || {}; var x = 0, out = [], t = 2.1, gap = o.gap == null ? 3 : o.gap;
    String(text).split('').forEach(function (ch) {
      if (ch === ':') { out.push('<g class="colon"><rect x="' + (x + .4) + '" y="4.6" width="2.2" height="2.2"/><rect x="' + (x + .4) + '" y="11.2" width="2.2" height="2.2"/></g>'); x += 3 + gap; return; }
      if (ch === ' ') { x += 4; return; }
      var on = SEG[ch]; if (!on) return;
      var one = ch === '1', w = one ? 3.2 : 10, ox = one ? x - 7 + t + .2 : x;   // a 1 is narrow: only its right-hand bars, in a narrow cell
      var R = { a: [1.3, 0, 7.4, t], d: [1.3, 18 - t, 7.4, t], g: [1.3, 9 - t / 2, 7.4, t], f: [0, 1.1, t, 6.9], b: [10 - t, 1.1, t, 6.9], e: [0, 10, t, 6.9], c: [10 - t, 10, t, 6.9] };
      on.split('').forEach(function (s) { var r = R[s]; out.push('<rect x="' + (ox + r[0]).toFixed(2) + '" y="' + r[1].toFixed(2) + '" width="' + r[2] + '" height="' + r[3] + '" rx=".5"/>'); });
      x += w + gap;
    });
    var W = Math.max(1, x - gap);
    return '<svg class="e80seg" viewBox="0 0 ' + W.toFixed(1) + ' 18" style="aspect-ratio:' + (W / 18).toFixed(3) + '" aria-hidden="true">' + out.join('') + '</svg>';
  }

  /* ——— icons ——— */
  var SLUG = { phone: 'phone', grant: 'grant', pushradio: 'push-radio', timer: 'timer', golden: 'good-weather', weather: 'good-weather', player: 'sound', notes: 'notes', camera: 'camera',
    noise: 'white-noise', sky: 'sky', messages: 'messages', chat: 'messages', loops: 'archive-player', archive: 'archive', friends: 'friends', circle: 'circle', tonecheck: 'tone-check', planner: 'shot-planner',
    lab: 'photo-lab', picks: 'picks-board', decide: 'decision-sheet', sweep: 'compare', feed: 'feed', objects: 'objects', demos: 'demo-room', mindex: 'index-a-clip', shrink: 'shrink-a-clip',
    oztune: 'oz-icon', balance: 'balance', welcome: 'welcome', about: 'about', addarchive: 'add-to-archive', aplayer: 'archive-player', markup: 'review-markup', browser: 'browser', map: 'map',
    conedit: 'constellations', scanner: 'scan-an-object', scantomake: 'scan-to-make', designlog: 'design-log', walk: 'sweep-walk', contactsheet: 'contact-sheet', relay: 'push-radio', ask: 'ask', here: 'sky', clock: 'clock' };
  var n = 0;
  function icon(slug, fl) {
    var I = G.OZ80_ICONS && G.OZ80_ICONS[slug]; if (!I) return '';
    var f = fl || D.fl, s = (f === 'neon' ? I.neon : I.bit).replace(/__ID__/g, '-' + (++n));
    if (slug === 'clock') { var t = new Date(); s = s.replace('<g class="dg" transform="translate(6.5 12.5)"></g>', '<g class="dg" transform="translate(7 12.4) scale(.42)">' + seg(('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2), { gap: 2 }).replace(/<svg[^>]*>|<\/svg>/g, '') + '</g>'); }
    return s;
  }
  var mounts = [];
  function swap(m) {
    Array.prototype.forEach.call(m.root.querySelectorAll(m.sel), function (b) {
      var id = m.idOf(b), slug = SLUG[id] || null, cur = b.querySelector(':scope > .e80i');
      if (!D.on || !slug) { if (cur) { if (G.ozViewer) G.ozViewer.rest(slug, cur); cur.remove(); } return; }
      if (cur && cur.dataset.fl === D.fl && cur.dataset.s === slug) return;
      if (cur) cur.remove();
      var e = document.createElement('b'); e.className = 'e80i'; e.dataset.fl = D.fl; e.dataset.s = slug; e.setAttribute('aria-hidden', 'true'); e.innerHTML = icon(slug);
      var slot = m.slot ? b.querySelector(m.slot) : null; if (slot) b.insertBefore(e, slot); else b.insertBefore(e, b.firstChild);
      if (G.ozViewer) G.ozViewer.present(slug, e);   // the icon lives: presented through the oz viewer hook (a preview stub)
    });
  }
  function mount(root, sel, idOf, slot) {
    if (!root) return; var m = { root: root, sel: sel, idOf: idOf, slot: slot }; mounts.push(m);
    try { new MutationObserver(function () { if (D.on || root.querySelector('.e80i')) swap(m); }).observe(root, { childList: true, subtree: true }); } catch (e) {}
    swap(m);
  }

  /* ——— the field: faint moving scanlines (Home and the sky only: rooms carry theirs beneath their content) ——— */
  var field = null, ready = null;
  function paintField() {
    if (!field) { field = document.createElement('div'); field.id = 'e80field'; field.setAttribute('aria-hidden', 'true'); field.innerHTML = '<i class="sc"></i><i class="wf"></i><i class="gr"></i>'; document.body.insertBefore(field, document.body.firstChild); }
  }
  function readyLine() {   // a short "oz READY" and a cursor, once
    if (ready) ready.remove(); ready = document.createElement('div'); ready.id = 'e80ready'; ready.setAttribute('role', 'status'); ready.setAttribute('aria-label', 'oz ready');
    ready.innerHTML = '<span aria-hidden="true"></span><i aria-hidden="true"></i>'; document.body.appendChild(ready);
    var T = 'oz READY', k = 0, sp = ready.firstChild;
    (function type() { if (!ready || !ready.isConnected) return; sp.textContent = T.slice(0, ++k); if (k < T.length) setTimeout(type, 70); else setTimeout(function () { if (ready) ready.classList.add('settle'); }, 2200); })();
    setTimeout(function () { if (ready) { ready.remove(); ready = null; } }, 5200);
  }

  /* ——— the rocker panel: the 80s rocker, the flavour switch, BRIGHT and CONTRAST, the scan toggle ——— */
  function knob(name, key, lo, hi) {
    var k = document.createElement('div'); k.className = 'e80-knob'; k.setAttribute('role', 'slider'); k.tabIndex = 0; k.setAttribute('aria-label', name.toLowerCase());
    k.setAttribute('aria-valuemin', String(lo)); k.setAttribute('aria-valuemax', String(hi)); k.innerHTML = '<i class="cap"><i class="tick"></i></i><span>' + name + '</span>';
    function paint() { var v = D[key], t = (v - lo) / (hi - lo); k.querySelector('.cap').style.transform = 'rotate(' + (-135 + t * 270).toFixed(1) + 'deg)'; k.setAttribute('aria-valuenow', v.toFixed(2)); k.setAttribute('aria-valuetext', Math.round(t * 100) + '%'); }
    var drag = null, last = -1;
    function put(v) { v = Math.max(lo, Math.min(hi, Math.round(v * 100) / 100)); if (v === D[key]) return; D[key] = v; var step = Math.round(v * 20); if (step !== last) { last = step; hap(); } save(); apply(); paint(); }
    k.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); try { k.setPointerCapture(e.pointerId); } catch (x) {} drag = { y: e.clientY, x: e.clientX, v: D[key] }; k.classList.add('held'); });
    k.addEventListener('pointermove', function (e) { if (!drag) return; e.stopPropagation(); put(drag.v + ((drag.y - e.clientY) + (e.clientX - drag.x)) / 140 * (hi - lo)); });
    function up() { drag = null; k.classList.remove('held'); } k.addEventListener('pointerup', up); k.addEventListener('pointercancel', up);
    k.addEventListener('keydown', function (e) { var d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); put(D[key] + d * (hi - lo) / 20); } });
    k._paint = paint; paint(); return k;
  }
  var panels = [];
  function panel() {
    var p = document.createElement('div'); p.className = 'e80-panel'; p.setAttribute('role', 'group'); p.setAttribute('aria-label', '80s');
    p.innerHTML = '<div class="e80-row"><span class="e80-lab">80s</span><button type="button" class="e80-rocker" role="switch" aria-label="80s mode"><i></i></button></div>' +
      '<div class="e80-more"><div class="e80-fl" role="radiogroup" aria-label="flavour">' + FL.map(function (f) { return '<button type="button" role="radio" data-fl="' + f + '">' + FLN[f] + '</button>'; }).join('') + '</div>' +
      '<div class="e80-knobs"></div></div>';
    var ks = p.querySelector('.e80-knobs'), kb = knob('BRIGHT', 'b', .25, 1), kc = knob('CONTRAST', 'c', .5, 1.5);
    var tg = document.createElement('button'); tg.type = 'button'; tg.className = 'e80-toggle'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-label', 'scanlines'); tg.innerHTML = '<i></i><span>SCAN</span>';
    ks.appendChild(kb); ks.appendChild(kc); ks.appendChild(tg);
    p.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    p.addEventListener('click', function (e) {
      e.stopPropagation(); var b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('e80-rocker')) set(!D.on);
      else if (b.dataset.fl) flavour(b.dataset.fl);
      else if (b.classList.contains('e80-toggle')) scan(!D.scan);
    });
    p._paint = function () {
      p.querySelector('.e80-rocker').setAttribute('aria-checked', String(D.on)); p.classList.toggle('on', D.on);
      Array.prototype.forEach.call(p.querySelectorAll('[data-fl]'), function (b) { b.setAttribute('aria-checked', String(b.dataset.fl === D.fl)); });
      tg.setAttribute('aria-checked', String(D.scan)); kb._paint(); kc._paint();
    };
    p._paint(); panels.push(p); return p;
  }

  /* ——— BRIGHT and CONTRAST under the dot, on Home and the sky (in rooms they live in the dot's pad) ——— */
  var dotKnobs = null;
  function paintDotKnobs() {
    if (!dotKnobs) { dotKnobs = document.createElement('div'); dotKnobs.id = 'e80knobs'; dotKnobs.setAttribute('role', 'group'); dotKnobs.setAttribute('aria-label', 'bright and contrast');
      var a = knob('BRIGHT', 'b', .25, 1), b = knob('CONTRAST', 'c', .5, 1.5); dotKnobs.appendChild(a); dotKnobs.appendChild(b); dotKnobs._p = [a, b]; document.body.appendChild(dotKnobs); }
    dotKnobs._p.forEach(function (k) { k._paint(); });
  }

  /* ——— apply ——— */
  function apply(fromOutside) {
    html.classList.toggle('e80', D.on); FL.forEach(function (f) { html.classList.toggle('e80-' + f, D.on && D.fl === f); });
    html.classList.toggle('e80-noscan', D.on && !D.scan);
    paintVars(); if (D.on) { paintField(); paintDotKnobs(); } else if (dotKnobs) dotKnobs._p.forEach(function (k) { k._paint(); });
    mounts.forEach(swap); panels.forEach(function (p) { p._paint(); });
    subs.forEach(function (f) { try { f(D, fromOutside); } catch (e) {} });
  }
  function set(v) { v = !!v; if (v === D.on) return; D.on = v; D.found = true; save(); apply(); hap(); if (v) readyLine(); else if (ready) { ready.remove(); ready = null; } }
  function flavour(f) { if (f == null) return D.fl; if (FL.indexOf(f) < 0 || f === D.fl) return D.fl; D.fl = f; save(); apply(); hap(); if (D.on && f === 'neon') neonOnce(); return f; }
  function scan(v) { if (v == null) return D.scan; D.scan = !!v; save(); apply(); hap(); return D.scan; }
  function neonOnce() { html.classList.remove('e80-flick'); void html.offsetWidth; html.classList.add('e80-flick'); setTimeout(function () { html.classList.remove('e80-flick'); }, 1600); }
  load();
  if (ch) ch.onmessage = function (m) { if (!m.data) return; var was = D.on; Object.keys(D).forEach(function (k) { if (k in m.data) D[k] = m.data[k]; }); apply(true); if (!was && D.on) readyLine(); };
  addEventListener('storage', function (e) { if (e.key === KEY) { load(); apply(true); } });
  G.OZ80 = {
    on: function () { return D.on; }, set: set, flavour: flavour, scan: scan, found: function (v) { if (v != null && !!v !== D.found) { D.found = !!v; save(); } return D.found; },
    knobs: function (o) { if (o) { if (o.b != null) D.b = o.b; if (o.c != null) D.c = o.c; save(); apply(); } return { b: D.b, c: D.c }; },
    state: function () { return JSON.parse(JSON.stringify(D)); }, change: function (fn) { subs.push(fn); },
    icon: icon, slug: function (id) { return SLUG[id] || null; }, seg: seg, panel: panel, mount: mount, ready: readyLine, flick: neonOnce,
    reset: function () { D = { on: false, fl: 'term', found: false, b: 1, c: 1, scan: true }; save(); apply(); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { apply(); }); else apply();
})(window);
