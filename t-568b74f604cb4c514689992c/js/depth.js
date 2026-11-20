/* oz next (item 14) · the depth palette: four steps in every room — here (cream-gold), near (hot coral), mid (soft rose),
   far (dim maroon). Nearer is warmer and brighter; farther fades to maroon. Night, red and rose keep all four; Full red
   collapses them to four red luminance steps; light (day mode) flips them on a light ground. Chat is the exception: sent
   and received keep depth-palette hues (here for sent, mid rose-grey for received), and red mode only filters them.
   Tokens on the page: --depth-here · --depth-here-glow · --depth-near · --depth-mid · --depth-far · --chat-sent ·
   --chat-recv · --chat-teal. Each step is tuneable (a hold on its ring on the Beyond dial, or Tune → Depth palette) and
   resets to its default; warmth and lightness fine-tune the whole palette (the floating pad, and the dot's own pad).
   The selector is the Beyond dial: turn it to pick the family; its rings are the four steps; tap it to unfold in depth,
   drag to orbit (it springs back); hold a ring to tune that step. The dial bank floats it, or the pad, in any room.
   Tokens and Tune only: no colour engine. GJ.depth · GJ.beyond · GJ.dialBank */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, tune = document.getElementById('tune');
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var STEPS = ['here', 'near', 'mid', 'far'];
  var DEF = {
    night: { here: '#DDBC89', near: '#E1626B', mid: '#BC8F94', far: '#4C2C31' },
    fullred: { here: '#F0B4B4', near: '#E1626B', mid: '#8A3A42', far: '#4C2C31' },
    light: { here: '#8A5C28', near: '#B83A45', mid: '#8E5E64', far: '#D4B8B6' }
  };
  var TEAL = { here: '#DDBC89', near: '#E1626B', mint: '#55DAA1', pack: '#3ee6b0' }, RECV = { dark: '#B7AAB0', light: '#CDBFC4' };
  var FAMILIES = [['night', 'night'], ['red', 'red'], ['rose', 'rose'], ['light', 'light'], ['fullred', 'Full red']];
  function family() { var s = store.get(); return s.fullSafe && s.red ? 'fullred' : s.dayMode ? 'light' : s.red ? (s.tone === 1 ? 'rose' : 'red') : 'night'; }   // tone is GJ.TONES' index: 1 is rose
  function setKey(f) { return f === 'fullred' || f === 'light' ? f : 'night'; }   // night, red and rose share one set
  function setFamily(f) { var o = f === 'night' ? { red: false, dayMode: false, fullSafe: false } : f === 'red' ? { red: true, dayMode: false, fullSafe: false, tone: store.get().tone === 1 ? 2 : store.get().tone } : f === 'rose' ? { red: true, dayMode: false, fullSafe: false, tone: 1 } : f === 'light' ? { red: false, dayMode: true, fullSafe: false } : { red: true, dayMode: false, fullSafe: true }; store.set(o); }

  /* colour arithmetic: hex ↔ hsl, a lightness and warmth nudge */
  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgb2hex(r) { return '#' + r.map(function (v) { return ('0' + Math.round(clamp(v, 0, 255)).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function rgb2hsl(r) { var R = r[0] / 255, Gg = r[1] / 255, B = r[2] / 255, mx = Math.max(R, Gg, B), mn = Math.min(R, Gg, B), l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) { var d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === R ? (Gg - B) / d + (Gg < B ? 6 : 0) : mx === Gg ? (B - R) / d + 2 : (R - Gg) / d + 4; h /= 6; } return [h, s, l]; }
  function hsl2rgb(c) { var h = c[0], s = c[1], l = c[2]; if (!s) return [l * 255, l * 255, l * 255]; function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]; }
  function nudge(hex, dl, dw) {   // dl: −1…1 lightness · dw: −1…1 warmth (toward gold / toward rose-violet)
    var c = rgb2hsl(hex2rgb(hex)); c[2] = clamp(c[2] + dl * .14, .04, .96); var h = c[0] * 360; h = h > 180 ? h - 360 : h; h = clamp(h + dw * 10, -60, 60); c[0] = ((h + 360) % 360) / 360; return rgb2hex(hsl2rgb(c)); }
  function tuned(f, step) { var s = store.get(), k = setKey(f), t = (s.palTune || {})[k + '.' + step] || { l: 0, w: 0 }; return nudge(DEF[k][step], t.l, t.w); }
  function value(f, step) { var s = store.get(); return nudge(tuned(f, step), s.palLight || 0, s.palWarm || 0); }
  function apply() {
    var s = store.get(), f = family(), st = html.style;
    STEPS.forEach(function (k) { st.setProperty('--depth-' + k, value(f, k)); });
    var sky = f === 'light' ? 'night' : f; STEPS.forEach(function (k) { st.setProperty('--depth-sky-' + k, value(sky, k)); }); st.setProperty('--depth-sky-here-glow', f === 'fullred' ? '#FFD6D6' : '#FAE6C1');   // the rooms on the sky: day mode keeps r4's slate sky, so they keep the night steps there
    st.setProperty('--depth-here-glow', f === 'light' ? '#B07A3A' : f === 'fullred' ? '#FFD6D6' : '#FAE6C1');
    var teal = TEAL[s.chatTeal] || TEAL.here; st.setProperty('--chat-teal', teal); st.setProperty('--chat-sent', teal); st.setProperty('--chat-recv', f === 'light' ? RECV.light : RECV.dark);
    html.dataset.palette = f; html.classList.toggle('depth-on', s.depthOn !== false); html.classList.toggle('depth-dial', !!s.depthDial);
    paintTune(); if (B.on) paintBeyond();
  }
  store.on(apply);

  /* ---------- the Beyond dial: the selector ---------- */
  var B = { on: false, unfold: false, rx: 0, ry: 0, tuning: null };
  var el = document.createElement('div'); el.id = 'beyond'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Beyond: the depth palette');
  var R = [118, 92, 66, 40];   // ring radii: far (outer, maroon) → here (centre, gold)
  var ANG = FAMILIES.map(function (f, i) { return -90 + (i - 2) * 34; });   // detents round the top
  el.innerHTML = '<div class="by-h"><b class="jul">beyond</b><span class="quiet">the depth palette</span><button type="button" class="by-x" aria-label="close the Beyond dial">done</button></div>' +
    '<div class="by-stage"><svg class="by-dial" viewBox="-140 -140 280 280" role="slider" tabindex="0" aria-label="the palette family: turn to choose">' +
    '<g class="by-ticks">' + ANG.map(function (a, i) { var r = a * Math.PI / 180; return '<line x1="' + (Math.cos(r) * 124).toFixed(1) + '" y1="' + (Math.sin(r) * 124).toFixed(1) + '" x2="' + (Math.cos(r) * 134).toFixed(1) + '" y2="' + (Math.sin(r) * 134).toFixed(1) + '" data-i="' + i + '"></line>'; }).join('') + '</g>' +
    '<g class="by-words">' + ANG.map(function (a, i) { var r = a * Math.PI / 180; return '<text x="' + (Math.cos(r) * 138).toFixed(1) + '" y="' + (Math.sin(r) * 138 - 4).toFixed(1) + '" text-anchor="middle">' + FAMILIES[i][1] + '</text>'; }).join('') + '</g>' +
    '<g class="by-rings">' + ['far', 'mid', 'near', 'here'].map(function (k, i) { return '<g class="by-ring" data-step="' + k + '"><circle class="by-hit" r="' + R[i] + '"></circle><circle class="by-c" r="' + R[i] + '"></circle></g>'; }).join('') +
    '<circle class="by-core" r="22"></circle></g><path class="by-pointer" d="M0 -126 l-5 -9 h10 z"></path></svg>' +
    '<div class="by-plate" role="status"><b class="jul">look</b><p class="by-v"></p><p class="by-hint quiet">turn to choose · tap to unfold · hold a ring to tune it</p></div></div>' +
    '<div class="by-tune" hidden><p class="by-tv"></p><div class="by-row"><label>lightness <input type="range" min="-1" max="1" step=".05" class="by-l" aria-label="this step’s lightness"></label></div><div class="by-row"><label>warmth <input type="range" min="-1" max="1" step=".05" class="by-w" aria-label="this step’s warmth"></label></div><div class="oz-seg"><button type="button" data-a="stepreset">reset this step</button><button type="button" data-a="stepdone">done</button></div></div>';
  document.body.appendChild(el);
  var dial = el.querySelector('.by-dial'), rings = el.querySelector('.by-rings'), plate = el.querySelector('.by-v');
  function famIndex() { var f = family(); return FAMILIES.map(function (x) { return x[0]; }).indexOf(f); }
  function paintBeyond() {
    var i = famIndex(), f = family();
    el.querySelector('.by-pointer').setAttribute('transform', 'rotate(' + (ANG[i] + 90) + ')');
    el.querySelectorAll('.by-ticks line').forEach(function (l) { l.classList.toggle('on', +l.dataset.i === i); });
    el.querySelectorAll('.by-ring').forEach(function (g) { g.querySelector('.by-c').style.stroke = value(f, g.dataset.step); g.classList.toggle('tuning', B.tuning === g.dataset.step); });
    el.querySelector('.by-core').style.fill = value(f, 'here');
    plate.textContent = B.tuning ? B.tuning + ' · ' + value(f, B.tuning) : FAMILIES[i][1];
    dial.setAttribute('aria-valuetext', FAMILIES[i][1]);
    el.classList.toggle('unfold', B.unfold);
    rings.style.transform = B.unfold ? 'rotateX(' + (52 + B.rx) + 'deg) rotateZ(' + B.ry + 'deg)' : '';
    if (B.tuning) { var t = (store.get().palTune || {})[setKey(f) + '.' + B.tuning] || { l: 0, w: 0 }; el.querySelector('.by-l').value = t.l; el.querySelector('.by-w').value = t.w; el.querySelector('.by-tv').textContent = B.tuning + ' · ' + value(f, B.tuning) + ' · ' + f; }
  }
  function openBeyond() { if (B.on) return; B.on = true; el.hidden = false; requestAnimationFrame(function () { el.classList.add('in'); }); paintBeyond(); hap('commit'); }
  function closeBeyond() { if (!B.on) return; B.on = false; B.unfold = false; B.tuning = null; el.querySelector('.by-tune').hidden = true; el.classList.remove('in'); setTimeout(function () { if (!B.on) el.hidden = true; }, 300); }
  el.querySelector('.by-x').addEventListener('click', closeBeyond);
  function angle(e) { var r = dial.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; }
  function dist(e) { var r = dial.getBoundingClientRect(); return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) / (r.width / 280); }
  var g = null;
  dial.addEventListener('pointerdown', function (e) { e.preventDefault(); try { dial.setPointerCapture(e.pointerId); } catch (x) {} var d = dist(e), ringEl = e.target.closest('.by-ring');
    g = { x: e.clientX, y: e.clientY, a: angle(e), d: d, moved: false, outer: d > 104 && !B.unfold, step: ringEl ? ringEl.dataset.step : (d < 26 ? 'here' : null), rx: B.rx, ry: B.ry };
    g.t = setTimeout(function () { if (g && !g.moved && g.step && !B.unfold) { B.tuning = g.step; el.querySelector('.by-tune').hidden = false; paintBeyond(); hap('commit'); g.held = true; } }, 460); });
  dial.addEventListener('pointermove', function (e) { if (!g) return; var dx = e.clientX - g.x, dy = e.clientY - g.y; if (!g.moved && Math.hypot(dx, dy) > 7) { g.moved = true; clearTimeout(g.t); }
    if (!g.moved || g.held) return;
    if (B.unfold) { B.rx = clamp(g.rx - dy * .25, -40, 30); B.ry = g.ry + dx * .4; paintBeyond(); return; }   // unfolded: a drag orbits it
    var a = angle(e), best = 0; ANG.forEach(function (t, i) { if (Math.abs(a - t) < Math.abs(a - ANG[best])) best = i; });   // folded: a drag round it turns it, detent by detent
    if (best !== famIndex()) { setFamily(FAMILIES[best][0]); hap('tick'); } });
  function up() { if (!g) return; clearTimeout(g.t); var was = g; g = null;
    if (B.unfold && was.moved) { var r0 = B.rx, y0 = B.ry, t0 = performance.now(); (function back() { var u = Math.min(1, (performance.now() - t0) / 520), k = 1 - Math.pow(1 - u, 3); B.rx = r0 * (1 - k); B.ry = y0 * (1 - k); paintBeyond(); if (u < 1 && B.unfold) requestAnimationFrame(back); })(); return; }   // it springs back
    if (!was.moved && !was.held && was.d < 60) { B.unfold = !B.unfold; B.rx = 0; B.ry = 0; paintBeyond(); hap('tick'); } }
  dial.addEventListener('pointerup', up); dial.addEventListener('pointercancel', up);
  dial.addEventListener('keydown', function (e) { var i = famIndex(); if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setFamily(FAMILIES[Math.min(4, i + 1)][0]); if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setFamily(FAMILIES[Math.max(0, i - 1)][0]); });
  function setStep(step, l, w) { var s = store.get(), t = Object.assign({}, s.palTune || {}); t[setKey(family()) + '.' + step] = { l: l, w: w }; store.set({ palTune: t }); }
  el.querySelector('.by-l').addEventListener('input', function () { if (B.tuning) setStep(B.tuning, +this.value, +el.querySelector('.by-w').value); });
  el.querySelector('.by-w').addEventListener('input', function () { if (B.tuning) setStep(B.tuning, +el.querySelector('.by-l').value, +this.value); });
  el.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return;
    if (x.dataset.a === 'stepreset' && B.tuning) { var t = Object.assign({}, store.get().palTune || {}); delete t[setKey(family()) + '.' + B.tuning]; store.set({ palTune: t }); }
    if (x.dataset.a === 'stepdone') { B.tuning = null; el.querySelector('.by-tune').hidden = true; paintBeyond(); } });

  /* ---------- the floating pad: X = warmth, Y = lightness, the whole palette ---------- */
  var pad = document.createElement('div'); pad.id = 'palpad'; pad.hidden = true; pad.setAttribute('role', 'dialog'); pad.setAttribute('aria-label', 'the palette pad: warmth across, lightness up and down');
  pad.innerHTML = '<div class="pp-h"><b class="jul">palette pad</b><button type="button" class="pp-x" aria-label="close the palette pad">done</button></div><div class="pp-sq" role="slider" tabindex="0" aria-label="warmth and lightness"><i class="pp-ax"></i><i class="pp-ay"></i><b class="pp-dot"></b></div><p class="pp-v quiet"></p><div class="oz-seg"><button type="button" data-a="ppreset">reset</button></div>';
  document.body.appendChild(pad);
  var sq = pad.querySelector('.pp-sq'), pdrag = false;
  function paintPad() { var s = store.get(), w = s.palWarm || 0, l = s.palLight || 0, d = pad.querySelector('.pp-dot'); d.style.left = (50 + w * 50) + '%'; d.style.top = (50 - l * 50) + '%'; pad.querySelector('.pp-v').textContent = 'warmth ' + (w > 0 ? '+' : '') + w.toFixed(2) + ' · lightness ' + (l > 0 ? '+' : '') + l.toFixed(2); sq.setAttribute('aria-valuetext', pad.querySelector('.pp-v').textContent); }
  function padAt(e) { var r = sq.getBoundingClientRect(); store.set({ palWarm: Math.round(clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1) * 20) / 20, palLight: Math.round(clamp(1 - (e.clientY - r.top) / r.height * 2, -1, 1) * 20) / 20 }); paintPad(); }
  sq.addEventListener('pointerdown', function (e) { e.preventDefault(); pdrag = true; try { sq.setPointerCapture(e.pointerId); } catch (x) {} padAt(e); });
  sq.addEventListener('pointermove', function (e) { if (pdrag) padAt(e); });
  sq.addEventListener('pointerup', function () { pdrag = false; hap('tick'); });
  pad.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return; if (x.classList.contains('pp-x')) closePad(); if (x.dataset.a === 'ppreset') { store.set({ palWarm: 0, palLight: 0 }); paintPad(); } });
  function openPad() { pad.hidden = false; paintPad(); hap('commit'); } function closePad() { pad.hidden = true; }
  store.on(function () { if (!pad.hidden) paintPad(); });

  /* ---------- the dial bank: float a dial into any room ---------- */
  var P = GJ.ozone && GJ.ozone.panel, bank = P && P({ id: 'ozbank', title: 'Dial bank', sub: 'float a dial into the room you are in',
    build: function (b) { b.innerHTML = '<div class="oz-grp">' + [['beyond', 'Beyond', 'the depth palette · family and steps'], ['pad', 'the palette pad', 'warmth and lightness, the whole palette'], ['env', '✨ environment', 'the sky’s layers'], ['tide', 'Light-tide', 'the day’s light on the sky']].map(function (d) { return '<button type="button" class="oz-row" data-float="' + d[0] + '">' + d[1] + '<span>' + d[2] + '</span></button>'; }).join('') + '</div>'; } });
  if (bank) bank.el.addEventListener('click', function (e) { var x = e.target.closest('[data-float]'); if (!x) return; bank.close(); floatDial(x.dataset.float); });
  function floatDial(k) { if (k === 'beyond') openBeyond(); if (k === 'pad') openPad(); if (k === 'env' && GJ.env) GJ.env.open(); if (k === 'tide' && GJ.lightTide && GJ.lightTide.open) GJ.lightTide.open(); }

  /* ---------- Tune → Depth palette ---------- */
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  var OFFS = [0, .25, .5, -.5, -.25];
  function paintTune() { if (!tune) return; var s = store.get(), f = family(); T('depthon', s.depthOn === false ? 'off' : 'on'); T('depthdial', s.depthDial ? 'on' : 'off'); T('palfam', (FAMILIES.filter(function (x) { return x[0] === f; })[0] || FAMILIES[0])[1]);
    STEPS.forEach(function (k) { T('pal' + k, value(f, k)); var r = tune.querySelector('[data-t="pal' + k + '"]'); if (r) r.style.setProperty('--sw', value(f, k)); });
    T('palwarm', (s.palWarm || 0).toFixed(2)); T('pallight', (s.palLight || 0).toFixed(2)); T('chatteal', s.chatTeal === 'near' ? 'near' : 'here'); }
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, s = store.get();
    if (k === 'depthon') store.set({ depthOn: s.depthOn === false });
    if (k === 'depthdial') store.set({ depthDial: !s.depthDial });
    if (k === 'palfam') setFamily(FAMILIES[(famIndex() + 1) % FAMILIES.length][0]);
    if (k === 'beyond') { if (GJ.app.tune) GJ.app.tune(false); openBeyond(); }
    if (k === 'dialbank' && bank) { bank.open(); }
    if (k === 'palpad') { if (GJ.app.tune) GJ.app.tune(false); openPad(); }
    if (/^pal(here|near|mid|far)$/.test(k)) { var step = k.slice(3), t = (s.palTune || {})[setKey(family()) + '.' + step] || { l: 0, w: 0 }, i = OFFS.indexOf(t.l); setStep(step, OFFS[(i + 1) % OFFS.length], t.w); }
    if (k === 'palwarm') store.set({ palWarm: OFFS[(OFFS.indexOf(s.palWarm || 0) + 1) % OFFS.length] });
    if (k === 'pallight') store.set({ palLight: OFFS[(OFFS.indexOf(s.palLight || 0) + 1) % OFFS.length] });
    if (k === 'chatteal') store.set({ chatTeal: s.chatTeal === 'near' ? 'here' : 'near' }); });

  GJ.depth = { family: family, setFamily: setFamily, value: value, tokens: function () { var f = family(), o = {}; STEPS.forEach(function (k) { o[k] = value(f, k); }); return o; }, DEF: DEF, setStep: setStep };
  GJ.beyond = { open: openBeyond, close: closeBeyond, isOpen: function () { return B.on; }, unfold: function (v) { B.unfold = !!v; paintBeyond(); }, tune: function (step) { B.tuning = step; el.querySelector('.by-tune').hidden = !step; paintBeyond(); } };
  GJ.palPad = { open: openPad, close: closePad };
  GJ.dialBank = { open: function () { if (bank) bank.open(); }, float: floatDial };
  if (GJ.app && GJ.app.closeAny) { var c0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (B.on) { closeBeyond(); return true; } if (!pad.hidden) { closePad(); return true; } return c0.apply(this, arguments); }; }
  if (GJ.ozone && GJ.ozone.place) { GJ.ozone.place({ id: 'beyond', name: 'beyond · the palette', sub: 'the depth palette, its family and steps', cl: 'make', open: openBeyond }); GJ.ozone.place({ id: 'dialbank', name: 'dial bank', sub: 'float a dial into any room', cl: 'make', open: function () { if (bank) bank.open(); } }); }
  // the Archive's own Beyond row gets the selector
  (function () { var row = document.getElementById('ar-by'); if (!row) return; var b = document.createElement('button'); b.type = 'button'; b.className = 'by-open'; b.textContent = 'palette'; b.setAttribute('aria-label', 'the depth palette: the Beyond dial'); row.appendChild(b);
    b.addEventListener('click', function (e) { e.stopPropagation(); openBeyond(); }, true); })();
  apply();
})(window);
