/* tools-02 · Archive — the complete archive (Gill, 17 Nov: "zoom out see entire archive as one"): every public frame of
   every film, 2,659 of them, from the site's archive index. Excluded frames and Arc'teryx S18 are not in the data or the
   atlases at all. The field is drawn from compressed sprite sheets — a small one for the whole field, a sharper one per
   film loaded only when you come close — so the whole archive fits on one page.
   Zoom 1: the whole archive as one, inside its board. Closer: the watch — full size in the middle, smaller and fainter
   toward the rim; one finger moves around it, tap a frame to bring it to the middle, tap it again to open it.
   BEYOND brings the kin of the frame you are on forward (same film · same light / colour / motion); WALK steps to the
   most-alike frame; AXIS turns light · colour · motion. The rail is the search: the axis's tags.
   Beyond's three readings (briefs/BEYOND-DIAL.md) — red · colour · light — are the row under the caption: see "Beyond".
   Photographs are never graded — except, by choice, in Safelight (Tune → photos), where they go black, white and red. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp;
  /* the archive stack (Gill, 18 Nov: "build it on the archive stack"): this file is one engine that more than one room
     runs on. GJ.archiveStack(cfg) makes a room from an index in the archive's own shape (films of frames, sprite sheets,
     light · colour · motion tags): the field, the camera, open-a-frame, the stop-motion rail, the review records. The
     archive is the first (cfg below, at the end: exactly as it was); the icon board (js/board.js) is the second.
       cfg · id (the room) · px (its ids: 'ar' → #ar-threads …) · data · beyond (or null: no readings) · rkey (where its
       review is kept) · media (where its sheets are) · aspect (a tile's h / w) · label (a block name's row, × a tile row) · axes (what the three tag axes are
       called) · title · words { meta, axis, cap } (its own lines) */
  function stack(cfg) {
  var ID = cfg.id, PX = cfg.px, D = cfg.data, API = {}, W8 = cfg.words || {}, ASP = cfg.aspect || 9 / 16, RKEY = cfg.rkey || 'gj-review';
  function sel(s) { return PX === 'ar' ? s : s.replace(/#ar-/g, '#' + PX + '-'); }
  var $ = function (id) { return document.getElementById(id === 'r-archive' ? 'r-' + ID : id.replace(/^ar-/, PX + '-')); };
  var V = D.vocab, AX = cfg.axes || ['light', 'colour', 'motion'];
  function dec(s, ax) { var o = []; for (var i = 0; i < s.length; i++) { var t = V[ax][s.charCodeAt(i) - 97]; if (t) o.push(t); } return o; }
  var F = [];
  D.films.forEach(function (fl, k) { fl.n = fl.frames.length; fl.frames.forEach(function (r, j) { F.push({ f: k, j: j, id: r[0], tc: r[1], t: [dec(r[2], 'light'), dec(r[3], 'colour'), dec(r[4], 'motion')] }); }); });
  var N = F.length;
  /* ---------- review (Gill, 17 Nov): favourite or pass on a frame, and a note — kept in this browser ---------- */
  var RV = {}; try { RV = JSON.parse(localStorage.getItem(RKEY) || '{}'); } catch (e) {}
  function rv(i) { return RV[F[i].id] || null; }
  // one record a frame: r (1 heart · −1 not this one), n (a note) — and, from the review tools (js/markup.js): pins, strokes, tags
  function rvSet(i, o) {
    var k = F[i].id, c = Object.assign({}, RV[k] || {}, o);
    if (!c.r && !c.n && !(c.pins && c.pins.length) && !(c.strokes && c.strokes.length) && !(c.tags && c.tags.length)) delete RV[k]; else RV[k] = c;
    try { localStorage.setItem(RKEY, JSON.stringify(RV)); } catch (e) {} dirty = true;
    if (API.onReview) API.onReview(i, RV[k] || null);
  }
  var favOnly = false, markOnly = false;   // ♥ only · marked only (frames with a pin, a line, a tag or a note): one or the other
  var axis = 1, focus = 0, beyond = .3, open = null, tagSel = null;
  var MODE = ['boxes', 'dim', 'hide'], mode = 1, ORD = ['by film', 'continuous', 'grouped'], ord = 0;
  /* ---------- Beyond (Gill's brief, 17 Nov): a way of looking at the room, not a filter on the pictures ----------
     Three readings. RED is the red look that already exists (red mode, one tap, the same as the dot). COLOUR reads the
     room from warm through to the greys; LIGHT from darker to lighter. In colour or light the dial's place on the scale
     chooses which frames come forward — the ones that already look that way (js/beyond-data.js: each frame's light and
     colour, measured from the atlases by mkbeyond.py, for picking only) — and the room's own light goes with it (the
     sky's wash, the board's edge: the environment, never a picture). The swap is a soft crossfade of which frames are
     forward. One setting for the app, kept in the store (byRead · byColour · byLight). No frame is ever changed. */
  var BD = cfg.beyond || null, read = null, bpos = { colour: .12, light: .3 }, BW = .06, BR = { colour: null, light: null }, BH = null, byName = '';
  function b64(t) { var b = atob(t), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  if (BD && BD.n === N) { BR.colour = b64(BD.colour); BR.light = b64(BD.light); BH = b64(BD.hue); } else BD = null;
  function hueName(h) { h *= 2; return h < 15 || h >= 345 ? 'red' : h < 40 ? 'orange' : h < 70 ? 'amber' : h < 160 ? 'green' : h < 200 ? 'teal' : h < 265 ? 'blue' : 'violet'; }
  function nameOf(i) { return BH[i] === 255 ? 'grey' : hueName(BH[i]); }
  function inRead(i) { return Math.abs(BR[read][i] / 255 - (BW + bpos[read] * (1 - 2 * BW))) <= BW; }   // a window on the scale: about one frame in eight
  var ZM = GJ.S(1), B = GJ.S(.3), PAN = { x: GJ.S(0), y: GJ.S(0) }, ZMAX = 40;

  /* ---------- kin: who comes forward with the frame you are on ---------- */
  var KIN = new Uint8Array(N), front = 0;
  function shares(a, b) { for (var k = 0; k < b.length; k++) if (a.indexOf(b[k]) >= 0) return true; return false; }
  function kinOf(i) {
    if (favOnly) { var q = RV[F[i].id]; return !!(q && q.r === 1); }
    if (markOnly) { var m = RV[F[i].id]; return !!(m && ((m.pins && m.pins.length) || (m.strokes && m.strokes.length) || (m.tags && m.tags.length) || m.n)); }
    if (read) return inRead(i);
    if (tagSel) return F[i].t[axis].indexOf(tagSel) >= 0;
    var a = F[focus];
    if (ord === 0 || !a.t[axis].length) return F[i].f === a.f;
    if (ord === 2) return grp(i) === grp(focus);
    return shares(a.t[axis], F[i].t[axis]);
  }
  var KA = new Float32Array(N), fading = false;   // how far forward each frame is drawn: it eases to KIN, so a new selection crossfades in
  function rekin() {
    front = 0; for (var i = 0; i < N; i++) { KIN[i] = kinOf(i) ? 1 : 0; front += KIN[i]; } dirty = true; fading = true;
    if (read === 'colour') { var c = {}, bn = 0; byName = 'grey'; for (i = 0; i < N; i++) if (KIN[i]) { var nm = nameOf(i); c[nm] = (c[nm] || 0) + 1; if (c[nm] > bn) { bn = c[nm]; byName = nm; } } }   // the place is named for most of what it brings forward
    else if (read === 'light') { var v = bpos.light; byName = v < .15 ? 'darkest' : v < .4 ? 'darker' : v < .6 ? 'mid' : v < .85 ? 'lighter' : 'lightest'; }
  }
  function rel(i, j) {   // likeness: shared tags on the axis (most), the other axes (a little), the same film (a touch)
    var a = F[i].t, b = F[j].t, r = 0;
    for (var k = 0; k < 3; k++) { var u = a[k].length + b[k].length, s = 0; a[k].forEach(function (t) { if (b[k].indexOf(t) >= 0) s++; }); if (u) r += (k === axis ? .7 : .15) * (2 * s / u); }
    return Math.min(1, r + (F[i].f === F[j].f ? .08 : 0));
  }

  /* ---------- grouped: each frame joins its axis's most shared tag ---------- */
  var GR = null, NOTAG = 'untagged';
  function groups() {
    if (GR && GR.ax === axis) return GR;
    var c = {}; F.forEach(function (f) { f.t[axis].forEach(function (t) { c[t] = (c[t] || 0) + 1; }); });
    var of = F.map(function (f) { return f.t[axis].slice().sort(function (a, b) { return c[b] - c[a] || (a < b ? -1 : 1); })[0] || NOTAG; });
    var n = {}; of.forEach(function (g) { n[g] = (n[g] || 0) + 1; });
    var names = Object.keys(n).sort(function (a, b) { return (a === NOTAG) - (b === NOTAG) || n[b] - n[a]; });
    return GR = { ax: axis, of: of, names: names, n: n };
  }
  function grp(i) { return groups().of[i]; }

  /* ---------- one page: blocks (a film, a group, or the whole) in rows, the tile the largest that still fits ---------- */
  var AREA = { cx: 0, cy: 0, w: 0, h: 0 }, BX = new Float32Array(N), BY = new Float32Array(N), TW = 8, TH = 4.5, LAB = [], ORDER = [];
  var ABOUT = { x: 0, y: 0, on: false };   // pinch / zoom origin: the watch's lens grows around the fingers, not the field's middle
  function area() {
    var W = G.innerWidth, H = G.innerHeight, tt = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-top')) || 112;
    var top = tt + 106, bot = H * .75 - 10, l = 15, r = W - 51;   // inside the board's frame
    AREA = { cx: (l + r) / 2, cy: (top + bot) / 2, w: r - l, h: Math.max(120, bot - top), l: l, t: top, W: W, H: H, ft: tt - 21, fb: H * .75, fl: 9, fr: W - 45 };
  }
  function blocks() {
    var o = F.map(function (f, i) { return i; });
    if (ord === 1) return [{ label: '', items: o }];
    if (ord === 0) return D.films.map(function (fl, k) { return { label: fl.title, items: o.filter(function (i) { return F[i].f === k; }) }; });
    var g = groups(); return g.names.map(function (nm) { return { label: nm + ' · ' + g.n[nm], items: o.filter(function (i) { return g.of[i] === nm; }) }; });
  }
  function layout() {
    area(); var bl = blocks(), lab = ord !== 1, best = null;
    for (var c = 4; c < 400; c++) {
      var pitch = AREA.w / c, tw = pitch * .93, th = tw * ASP, rp = th + pitch * .07, lh = lab ? Math.max(rp * (cfg.label || .9), 0) : 0, h = 0;
      bl.forEach(function (b) { h += lh + Math.ceil(b.items.length / c) * rp; });
      if (h <= AREA.h) { best = { c: c, pitch: pitch, tw: tw, th: th, rp: rp, lh: lh, h: h }; break; }
    }
    if (!best) return;
    TW = best.tw; TH = best.th; LAB = []; ORDER = [];
    var y = -best.h / 2, x0 = -AREA.w / 2;
    bl.forEach(function (b) {
      if (best.lh) { LAB.push({ text: b.label, x: x0, y: y + best.lh * .8, h: best.lh }); y += best.lh; }
      b.items.forEach(function (i, k) { var cc = k % best.c, rr = Math.floor(k / best.c); BX[i] = x0 + cc * best.pitch + best.pitch / 2; BY[i] = y + rr * best.rp + best.rp / 2; ORDER.push(i); });
      y += Math.ceil(b.items.length / best.c) * best.rp;
    });
    dirty = true;
  }

  /* ---------- the sprite sheets: small for the whole field (always), sharp per film when you come close ---------- */
  var A1 = [], A2 = [], A2q = [], ready = false;
  function sheet(k, tier) {
    var L = tier === 2 ? A2 : A1, fl = D.films[k];
    if (L[k] === undefined) {
      var im = new Image(); L[k] = null; im.decoding = 'async';
      im.onload = function () { L[k] = im; dirty = true; }; im.src = (cfg.media || 'media/') + (tier === 2 ? 'a2/' : 'a1/') + fl.slug + '.webp';
      if (tier === 2) { A2q.push(k); while (A2q.length > 5) { var d = A2q.shift(); if (d !== k) A2[d] = undefined; } }   // only a few sharp sheets in memory at once
    }
    return L[k];
  }
  function loadAll() { if (ready) return; ready = true; D.films.forEach(function (fl, k) { sheet(k, 1); }); }
  function cell(i, tier) { var fl = D.films[F[i].f], a = tier === 2 ? fl.a2 : fl.a1, j = F[i].j; return [(j % a.cols) * a.cw, Math.floor(j / a.cols) * a.ch, a.cw, a.ch]; }

  /* ---------- draw: only when something moved or changed ---------- */
  var draws = 0, cv = $('ar-threads'), g = cv.getContext('2d'), DPR = 1, CW = 0, CH = 0, dirty = true;
  var HX = new Float32Array(N), HY = new Float32Array(N), HW = new Float32Array(N), HH = new Float32Array(N), HV = new Uint8Array(N);
  function csize() { DPR = Math.min(2, G.devicePixelRatio || 1); CW = cv.clientWidth; CH = cv.clientHeight; cv.width = CW * DPR; cv.height = CH * DPR; dirty = true; }
  function still(s, e) { return Math.abs(s.x - s.t) < e && Math.abs(s.v || 0) < e * 4; }
  function frame(dt) {
    if (!CW) csize();
    GJ.sstep(ZM, dt); GJ.sstep(PAN.x, dt); GJ.sstep(PAN.y, dt); GJ.sstep(B, dt); animTick(dt || 1 / 60);
    var yaw = GJ.sky.look.x.x * .35 + orb, pit = -GJ.sky.look.y.x * .3;   // orb: Beyond's orbit move turns the field as it travels
    cv.style.transform = 'perspective(900px) rotateY(' + (yaw * 40).toFixed(2) + 'deg) rotateX(' + (-pit * 40).toFixed(2) + 'deg)';
    var red = !!store.get().red, pr = red && !!store.get().fullSafe && store.get().photoRed !== false;
    if (red !== frame.red || pr !== frame.pr) { frame.red = red; frame.pr = pr; dirty = true; }
    if (fading) {   // the soft crossfade (about half a second; at once under reduced motion)
      var kq = GJ.reduced() ? 1 : 1 - Math.exp(-(dt || 1 / 60) * 7), going = false;
      for (var k9 = 0; k9 < N; k9++) { var d9 = KIN[k9] - KA[k9]; if (d9) { if (kq >= 1 || Math.abs(d9) < .012) KA[k9] = KIN[k9]; else { KA[k9] += d9 * kq; going = true; } } }
      fading = going; dirty = true;
    }
    driftTick(dt || 1 / 60);
    if (!dirty && still(ZM, 1e-4) && still(PAN.x, .05) && still(PAN.y, .05) && still(B, 1e-3)) return;
    dirty = false; draws++;
    var sc = ZM.x, ox = AREA.cx + PAN.x.x, oy = AREA.cy + PAN.y.x, wv = clamp((sc - 1.15) / .9, 0, 1), LR = Math.min(AREA.w, AREA.h) * .55, b = B.x;
    var lx = ABOUT.on ? ABOUT.x : AREA.cx, ly = ABOUT.on ? ABOUT.y : AREA.cy;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, CW, CH);
    g.save(); g.beginPath(); g.rect(AREA.fl, AREA.ft, AREA.fr - AREA.fl, AREA.fb - AREA.ft); g.clip();
    var ink = red ? '255,68,87' : '232,228,220', nk = mode === 0 ? 1 - b : mode === 1 ? 1 - .82 * b : Math.max(0, 1 - 1.6 * b), boxes = [];
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = sc > 3 ? 'high' : 'low';
    for (var q = 0; q < N; q++) {
      var i = ORDER[q]; if (i === undefined) continue;
      var X = ox + BX[i] * sc, Y = oy + BY[i] * sc, lens = 1, fade = 1;
      if (wv > 0) {   // the watch's lens: near the middle full size; toward the rim smaller, gathered in, fainter
        var dx = X - lx, dy = Y - ly, d = Math.hypot(dx, dy) / LR;
        if (d > .6) { var nd = .6 + .55 * (1 - Math.exp(-(d - .6) / .55)), r2 = 1 + (nd / d - 1) * wv; X = lx + dx * r2; Y = ly + dy * r2;
          lens = 1 + (clamp(1 - (d - .6) * 1.1, .2, 1) - 1) * wv; fade = 1 - wv * clamp((nd - 1.05) / .12, 0, 1); }
      }
      var w = TW * sc * lens, h = TH * sc * lens;
      HV[i] = 0;
      if (X + w / 2 < AREA.fl || X - w / 2 > AREA.fr || Y + h / 2 < AREA.ft || Y - h / 2 > AREA.fb || fade <= .01) continue;
      HV[i] = 1; HX[i] = X; HY[i] = Y; HW[i] = w; HH[i] = h;
      var a = fade * (i === focus ? 1 : nk + (1 - nk) * KA[i]), rq = RV[F[i].id]; if (rq && rq.r === -1) a *= .3;
      if (!KIN[i] && i !== focus && mode === 0 && b > .02) boxes.push(i);
      if (a <= .01) continue;
      var tier = w * DPR > 110 ? 2 : 1, im = tier === 2 ? sheet(F[i].f, 2) : null; if (!im) { tier = 1; im = sheet(F[i].f, 1); }
      g.globalAlpha = a;
      if (im) { var c = cell(i, tier); g.drawImage(im, c[0], c[1], c[2], c[3], X - w / 2, Y - h / 2, w, h); }
      else { g.fillStyle = '#0d1016'; g.fillRect(X - w / 2, Y - h / 2, w, h); }
    }
    g.globalAlpha = 1;
    // frames stay true colour; the chrome may go red (standing rule: photographs are never tinted)
    // review marks: a small star on a favourite, a hairline on a frame with a note
    g.fillStyle = 'rgba(' + ink + ',.95)';
    for (var q2 = 0; q2 < N; q2++) { var rr = RV[F[q2].id]; if (!rr || !HV[q2] || HW[q2] < 5) continue;
      var mr = Math.max(1.2, Math.min(3.5, HW[q2] * .05));
      if (rr.r === 1) { g.beginPath(); g.arc(HX[q2] + HW[q2] / 2 - mr * 1.6, HY[q2] - HH[q2] / 2 + mr * 1.6, mr, 0, 6.283); g.fill(); }
      if (rr.n) { g.fillRect(HX[q2] - HW[q2] / 2 + 1, HY[q2] + HH[q2] / 2 - 1.5, Math.max(2, HW[q2] * .25), 1); } }
    // boxes: what is beyond shows as its empty frame
    if (boxes.length) { g.lineWidth = 1; g.strokeStyle = 'rgba(' + ink + ',' + (.35 * b).toFixed(3) + ')'; g.beginPath();
      boxes.forEach(function (i) { if (HW[i] > 3) g.rect(HX[i] - HW[i] / 2 + .5, HY[i] - HH[i] / 2 + .5, HW[i] - 1, HH[i] - 1); }); g.stroke(); }
    // the block names, once they can be read
    var fs = (LAB[0] ? LAB[0].h : 0) * sc * .62;
    if (fs >= 7 && wv < .6) {
      g.font = '400 ' + Math.min(14, fs).toFixed(1) + 'px "Julius Sans One", Poppins, sans-serif'; g.textBaseline = 'alphabetic'; g.fillStyle = 'rgba(' + ink + ',' + (.75 * (1 - wv)).toFixed(3) + ')';
      try { g.letterSpacing = '1.5px'; } catch (e) {}
      LAB.forEach(function (L) { var y = oy + L.y * sc; if (y > AREA.ft - 10 && y < AREA.fb + 10) g.fillText(L.text.toUpperCase(), ox + L.x * sc, y); });
      try { g.letterSpacing = '0px'; } catch (e) {}
    }
    // the frame you are on
    if (HV[focus]) { g.lineWidth = sc > 2 ? 1.5 : 1; g.strokeStyle = 'rgba(' + ink + ',.95)'; g.strokeRect(HX[focus] - HW[focus] / 2 - 1, HY[focus] - HH[focus] / 2 - 1, HW[focus] + 2, HH[focus] + 2); }
    g.restore();
  }

  /* ---------- the frame you are on ---------- */
  function setFocus(i, glide) { focus = (i + N) % N; tagSel = null; rekin(); caption(); GJ.haptic.tick(); if (glide) centre(focus); GJ.rail.redraw && GJ.rail.redraw(); }
  function centre(i) { if (ZM.t < 1.05) { GJ.aim(PAN.x, 0); GJ.aim(PAN.y, 0); return; } GJ.aim(PAN.x, -BX[i] * ZM.t); GJ.aim(PAN.y, -BY[i] * ZM.t); }
  function clampPan(px, py, z) { var mx = AREA.w * z / 2 + 20, my = AREA.h * z / 2 + 20; return [clamp(px, -mx, mx), clamp(py, -my, my)]; }
  function zoomAbout(z1, mx, my, instant) {   // the point under the fingers stays under them
    z1 = clamp(z1, 1, ZMAX); var z0 = ZM.t, ux = (mx - AREA.cx - PAN.x.t) / z0, uy = (my - AREA.cy - PAN.y.t) / z0;
    var q = z1 <= 1.001 ? [0, 0] : clampPan(mx - AREA.cx - ux * z1, my - AREA.cy - uy * z1, z1);
    GJ.aim(ZM, z1, !!instant); GJ.aim(PAN.x, q[0], !!instant); GJ.aim(PAN.y, q[1], !!instant); dirty = true;
    ABOUT.x = mx; ABOUT.y = my; ABOUT.on = z1 > 1.001;
  }
  function closeOn(i) { var z = clamp(96 / TW, 1, ZMAX); GJ.aim(ZM, z); GJ.aim(PAN.x, -BX[i] * z); GJ.aim(PAN.y, -BY[i] * z); }   // come close enough to see it
  function caption() {
    var f = F[focus], fl = D.films[f.f];
    $('ar-title').textContent = fl.title;
    $('ar-tags').textContent = read ? 'beyond · ' + read + ' · ' + byName + ' · ' + front + ' come forward' : (tagSel ? tagSel + ' · ' : '') + (f.t[axis].join(' · ') || AX[axis] + ' untagged');
    $('ar-axis').textContent = W8.axis ? W8.axis(f, fl, D) : 'frame ' + (f.j + 1) + ' of ' + fl.n + ' · ' + ('000' + f.id).slice(-4) + ' / ' + D.count + ' · ' + f.tc;
    [].forEach.call(document.querySelectorAll(sel('#ar-ctl [data-m]')), function (b) { b.classList.toggle('on', +b.dataset.m === mode); });
    [].forEach.call(document.querySelectorAll(sel('#ar-ctl [data-f]')), function (b) { var on = b.dataset.f === 'fav' ? favOnly : markOnly; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    [].forEach.call(document.querySelectorAll(sel('#ar-ctl [data-o]')), function (b) { b.classList.toggle('on', +b.dataset.o === ord); });
    [].forEach.call(document.querySelectorAll(sel('#ar-ctl [data-g]')), function (b) { b.classList.toggle('on', ord === 2 && +b.dataset.g === axis); });
    [].forEach.call(document.querySelectorAll(sel('#ar-by [data-b]')), function (b) { var on = b.dataset.b === 'red' ? !!store.get().red : b.dataset.b === read; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }

  /* ---------- open a frame: as large as it comes. Animate (Gill, 17 Nov): drag across it, or run the rail, to step
     frame by frame through its film — a stop-motion — and play / pause / loop it (the Mark's tap plays it here) ---------- */
  var bigc = $('ar-big'), bg = bigc.getContext('2d'), BIGH = Math.round(480 * ASP), anim = { on: false, fps: 2, loop: true, acc: 0, film: -1, a: null, b: null, beat: false, mult: 1, t0: 0, k: 0, bf: 0 }, FPS = [1, 2, 3, 4];
  /* the stop-motion rail, in time (briefs/AUDIO-ANIMATION.md + ANIMATE.md; Gill, 18 Nov: "frames on the beat").
     · It loops at 1–4 frames a second, 2 to begin with (the briefs' own range).
     · IN and OUT: tap either on the frame you are on and the loop runs between them; tap it there again and it is gone.
       They show as hairlines on the rail. A different film starts clean.
     · BEAT: the steps land on the looper's beat — one frame a beat at its tempo (120 bpm → 2 a second), or half, or
       double (the inner ring). The step is counted from a clock, never added up frame by frame, so it cannot drift;
       when the looper starts, that is the downbeat and the count starts with it. */
  var MULT = [.5, 1, 2], MULTN = ['half time', 'on the beat', 'double time'];
  function tempo() { var s = GJ.loops && GJ.loops.state ? GJ.loops.state() : null; return s && s.bpm ? s.bpm : 90; }
  function beatFps() { return tempo() / 60 * anim.mult; }
  function range(o) { var lo = anim.a != null ? clamp(anim.a, 0, o.n - 1) : 0, hi = anim.b != null ? clamp(anim.b, 0, o.n - 1) : o.n - 1; return lo <= hi ? [lo, hi] : [hi, lo]; }
  function markPoint(which) {   // 'a' = in · 'b' = out, at the frame you are on
    if (open == null) return; var j = F[open].j; anim[which] = anim[which] === j ? null : j;
    if (anim.a != null && anim.b != null && anim.a > anim.b) { var t = anim.a; anim.a = anim.b; anim.b = t; }
    show(open);
  }
  function setBeat(on, mult) {
    anim.beat = on == null ? !anim.beat : !!on; if (mult != null && MULT.indexOf(mult) >= 0) anim.mult = mult;
    anim.t0 = GJ.now(); anim.k = 0; anim.bf = beatFps(); anim.acc = 0;
    if (open != null) { GJ.dial.config([FRAME, anim.beat ? BEATR : SPEED]); show(open); }
  }

  function filmOf(i) { var f = F[i]; return { k0: i - f.j, n: D.films[f.f].n, fl: D.films[f.f] }; }
  function drawBig(i) {
    var tier = 2, sh = sheet(F[i].f, 2); if (!sh) { tier = 1; sh = sheet(F[i].f, 1); }
    if (!sh) return false; var c = cell(i, tier);
    if (bigc.width !== 480 || bigc.height !== BIGH) { bigc.width = 480; bigc.height = BIGH; }
    bg.imageSmoothingQuality = 'high'; bg.drawImage(sh, c[0], c[1], c[2], c[3], 0, 0, 480, BIGH); return tier === 2;
  }
  var sharpT = 0;
  function show(i) {
    open = i; focus = i; var fl = D.films[F[i].f];
    if (!drawBig(i)) { clearInterval(sharpT); sharpT = setInterval(function () { if (open !== i || drawBig(i)) clearInterval(sharpT); }, 120); }
    $('ar-cap').textContent = (W8.cap ? W8.cap(F[i], fl) : fl.title + ' · frame ' + (F[i].j + 1) + ' of ' + fl.n + ' · ' + F[i].tc) + (anim.a != null || anim.b != null ? ' · ' + (anim.a != null ? 'in ' + (anim.a + 1) : 'start') + ' – ' + (anim.b != null ? 'out ' + (anim.b + 1) : 'end') : '');
    var r = rv(i) || {}, T = $('ar-tools');
    T.querySelector('[data-a="fav"]').textContent = r.r === 1 ? '♥' : '♡'; T.querySelector('[data-a="fav"]').classList.toggle('on', r.r === 1);
    T.querySelector('[data-a="pass"]').classList.toggle('on', r.r === -1);
    T.querySelector('[data-a="note"]').classList.toggle('on', !!r.n);
    var nt = $('ar-note'); if (document.activeElement !== nt) nt.value = r.n || '';
    T.querySelector('[data-a="play"]').textContent = anim.on ? 'pause' : 'play';
    T.querySelector('[data-a="fps"]').textContent = anim.beat ? Math.round(tempo()) + ' bpm · ' + (anim.mult === .5 ? '½' : anim.mult === 2 ? '×2' : '×1') : anim.fps + ' fps';
    T.querySelector('[data-a="beat"]').classList.toggle('on', anim.beat); T.querySelector('[data-a="in"]').classList.toggle('on', anim.a != null); T.querySelector('[data-a="out"]').classList.toggle('on', anim.b != null);
    T.querySelector('[data-a="loop"]').classList.toggle('on', anim.loop);
    caption(); GJ.rail.redraw && GJ.rail.redraw();
    if (API.onShow) API.onShow(i);
  }
  function stepTo(j) { var o = filmOf(open); if (anim.loop) j = (j % o.n + o.n) % o.n; else j = clamp(j, 0, o.n - 1); show(o.k0 + j); }
  function stepBy(d) { if (open == null) return; stepTo(F[open].j + d); }
  function play(on) {
    if (open == null) return; anim.on = on == null ? !anim.on : on; anim.acc = 0;
    if (anim.on) { var o = filmOf(open), r = range(o); if (!anim.loop && F[open].j >= r[1]) stepTo(r[0]);
      var lp = GJ.loops && GJ.loops.state && GJ.loops.state().playing; if (!lp) anim.t0 = GJ.now(); anim.bf = beatFps(); anim.k = Math.floor((GJ.now() - anim.t0) / 1000 * anim.bf); }   // with the looper running, it joins the looper's count
    show(open); GJ.haptic.tick();
  }
  function animTick(dt) {
    if (open == null) return;
    var lp = !!(GJ.loops && GJ.loops.state && GJ.loops.state().playing); if (lp && !animTick.lp) { anim.t0 = GJ.now(); anim.k = 0; } animTick.lp = lp;   // the looper starting is the downbeat
    if (!anim.on) return;
    var n = 0;
    if (anim.beat) {
      var bf = beatFps(), now = GJ.now(); if (bf !== anim.bf) { anim.t0 = now - anim.k / bf * 1000; anim.bf = bf; show(open); }   // the tempo changed: keep the count, change the pace
      var k = Math.floor((now - anim.t0) / 1000 * bf); n = clamp(k - anim.k, 0, 4); anim.k = k;
    } else { anim.acc += dt; var step = 1 / anim.fps; while (anim.acc >= step) { anim.acc -= step; n++; } }
    while (n-- > 0) { var o = filmOf(open), r = range(o), j = F[open].j;
      if (j >= r[1] || j < r[0]) { if (!anim.loop && j >= r[1]) { anim.on = false; show(open); return; } show(o.k0 + r[0]); }
      else show(o.k0 + j + 1); }
  }
  var FRAIL = {   // the rail runs the film (like the reel player): nine marks across it, drag between them for every frame
    stops: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return { label: k ? k * 12.5 + '%' : 'start' }; }),
    label: function () { return open == null ? '' : 'frame ' + (F[open].j + 1); },
    get: function () { if (open == null) return 0; var o = filmOf(open); return o.n > 1 ? F[open].j / (o.n - 1) * 8 : 0; },
    go: function (k) { var o = filmOf(open); anim.on = false; stepTo(Math.round(k / 8 * (o.n - 1))); },
    scrub: function (f) { var o = filmOf(open), j = Math.round(f / 8 * (o.n - 1)); anim.on = false; if (j !== F[open].j) { stepTo(j); GJ.haptic.tick(); } },
    marks: function () { if (open == null) return []; var o = filmOf(open), m = [], f = function (j) { return o.n > 1 ? j / (o.n - 1) * 8 : 0; }; if (anim.a != null) m.push({ f: f(anim.a), label: 'in' }); if (anim.b != null) m.push({ f: f(anim.b), label: 'out' }); return m; },
    rest: function () {}
  };
  // with a frame open the dial is the film's: FRAME (turn = step, fling = run) and SPEED (1–4 fps) — or, on the beat, BEAT (half · on · double) — this part of the tool
  // needs them, so the dial stays on them while the frame is open, and comes home to MORE LIKE THIS once it closes
  var FRAME = { key: 'frame', label: 'FRAME', min: 0, max: 1, def: 0, span: 300, unit: .01,
    get: function () { return open == null ? 0 : F[open].j / Math.max(1, filmOf(open).n - 1); },
    set: function (v) { if (open == null) return; var o = filmOf(open), j = Math.round(clamp(v, 0, 1) * (o.n - 1)); anim.on = false; if (j !== F[open].j) stepTo(j); },
    fmt: function () { return open == null ? '' : (F[open].j + 1) + ' / ' + filmOf(open).n; } };
  var SPEED = { key: 'fps', label: 'SPEED', min: 0, max: 3, def: 1, span: 160, unit: 1,
    get: function () { return FPS.indexOf(anim.fps); }, step: function (v) { return Math.round(v); },
    set: function (v) { anim.fps = FPS[clamp(Math.round(v), 0, FPS.length - 1)]; if (open != null) show(open); },
    notches: function () { return FPS.map(function (f, i) { return i; }); }, fmt: function (v) { return FPS[clamp(Math.round(v), 0, FPS.length - 1)] + ' fps'; },
    hold: function (down) { if (down) play(); } };
  var BEATR = { key: 'beat', label: 'BEAT', min: 0, max: 2, def: 1, span: 140, unit: 1,
    get: function () { return Math.max(0, MULT.indexOf(anim.mult)); }, step: function (v) { return Math.round(v); },
    set: function (v) { var m = MULT[clamp(Math.round(v), 0, 2)]; if (m === anim.mult) return; anim.mult = m; if (open != null) show(open); },
    notches: function () { return [0, 1, 2]; }, fmt: function (v) { var m = MULT[clamp(Math.round(v), 0, 2)]; return MULTN[MULT.indexOf(m)] + ' · ' + (tempo() / 60 * m).toFixed(1).replace(/\.0$/, '') + ' a second'; },
    hold: function (down) { if (down) play(); } };
  function openStill(i) {
    if (i == null) i = focus; zoom = { s: 1, x: 0, y: 0 }; bigc.style.transform = '';
    if (F[i].f !== anim.film) { anim.film = F[i].f; anim.a = anim.b = null; }   // in and out belong to one film
    show(i); $('ar-open').classList.add('on'); document.documentElement.classList.add('aropen'); GJ.rail.config(FRAIL); GJ.dial.config([FRAME, anim.beat ? BEATR : SPEED]); GJ.haptic.commit();
  }
  function closeStill() {
    if (open == null) { $('ar-open').classList.remove('on'); return; }
    anim.on = false; open = null; $('ar-open').classList.remove('on'); document.documentElement.classList.remove('aropen'); $('ar-note').hidden = true;
    if (API.onClose) API.onClose();
    if (GJ.app.room === ID) { GJ.rail.config(RAIL()); GJ.dial.config(GJ.rooms[ID].rings()); } centre(focus); dirty = true;
  }
  $('ar-tools').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || open == null) return; e.stopPropagation(); var a = b.dataset.a, r = rv(open) || {};
    if (a === 'prev') { anim.on = false; stepBy(-1); }
    if (a === 'next') { anim.on = false; stepBy(1); }
    if (a === 'play') play();
    if (a === 'loop') { anim.loop = !anim.loop; show(open); }
    if (a === 'fps') { GJ.dial.raise(1); }   // the speed belongs to the dial (Gill, 17 Nov: "fps should open dial"): SPEED (or BEAT) comes up on it — slide to set it; let go and it is FRAME again
    if (a === 'in') markPoint('a');
    if (a === 'out') markPoint('b');
    if (a === 'beat') { setBeat(); if (GJ.mark && GJ.mark.say) GJ.mark.say(anim.beat ? 'on the beat · ' + Math.round(tempo()) + ' bpm, the looper\'s tempo · the inner ring halves or doubles it' : 'off the beat · ' + anim.fps + ' fps', 2600); }
    if (a === 'fav') { rvSet(open, { r: r.r === 1 ? 0 : 1 }); show(open); }
    if (a === 'pass') { rvSet(open, { r: r.r === -1 ? 0 : -1 }); show(open); }
    if (a === 'note') { var nt = $('ar-note'); nt.hidden = !nt.hidden; if (!nt.hidden) { anim.on = false; nt.focus(); } }
    GJ.haptic.tick();
  });
  $('ar-note').addEventListener('input', function () { if (open != null) { rvSet(open, { n: this.value.trim() }); $('ar-tools').querySelector('[data-a="note"]').classList.toggle('on', !!this.value.trim()); } });
  var zoom = { s: 1, x: 0, y: 0 }, zp = {}, zpin = null, lastTap = 0;
  (function () {
    var v = $('ar-open'), im = bigc;
    function apply() { im.style.transform = 'translate(' + zoom.x + 'px,' + zoom.y + 'px) scale(' + zoom.s + ')'; }
    v.addEventListener('pointerdown', function (e) {
      if (e.target.closest(sel('#ar-tools, #ar-note'))) return;
      zp[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: GJ.now(), j0: open != null ? F[open].j : 0, scrub: false }; try { v.setPointerCapture(e.pointerId); } catch (x) {}
      var ids = Object.keys(zp); if (ids.length === 2) { var a = zp[ids[0]], c = zp[ids[1]]; zpin = { d: Math.hypot(a.x - c.x, a.y - c.y), s: zoom.s }; } });
    v.addEventListener('pointermove', function (e) {
      var p = zp[e.pointerId]; if (!p) return; var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      var ids = Object.keys(zp);
      if (zpin && ids.length === 2) { var a = zp[ids[0]], c = zp[ids[1]]; zoom.s = clamp(zpin.s * Math.hypot(a.x - c.x, a.y - c.y) / zpin.d, 1, 5); apply(); return; }
      if (zoom.s > 1) { zoom.x += dx; zoom.y += dy; apply(); return; }
      var tx = e.clientX - p.x0;   // drag across: scrub, a frame every 12 px (the reel player's feel)
      if (!p.scrub && Math.abs(tx) > 10 && Math.abs(tx) > Math.abs(e.clientY - p.y0)) { p.scrub = true; anim.on = false; }
      if (p.scrub && open != null) { var j = p.j0 + Math.round(tx / 12); if (anim.loop || true) { var o = filmOf(open); j = anim.loop ? (j % o.n + o.n) % o.n : clamp(j, 0, o.n - 1); } if (j !== F[open].j) { stepTo(j); GJ.haptic.tick(); } }
    });
    function up(e) {
      var p = zp[e.pointerId]; delete zp[e.pointerId]; if (Object.keys(zp).length < 2) zpin = null; if (!p || p.scrub) return;
      var dx = e.clientX - p.x0, dy = e.clientY - p.y0;
      var tapd = Math.hypot(dx, dy) < 10 && GJ.now() - p.t < 350;
      if (!tapd) return;
      if (GJ.now() - lastTap < 320) { zoom = zoom.s > 1 ? { s: 1, x: 0, y: 0 } : { s: 2.5, x: 0, y: 0 }; apply(); lastTap = 0; return; }
      lastTap = GJ.now();
      setTimeout(function () { if (lastTap && GJ.now() - lastTap >= 300 && zoom.s === 1) closeStill(); }, 330);
    }
    v.addEventListener('pointerup', up); v.addEventListener('pointercancel', function (e) { delete zp[e.pointerId]; zpin = null; });
  })();

  /* ---------- touch: one finger moves (a fling glides on), two pinch about the fingers, a tap picks ---------- */
  var drag = null, moved = false, fp = {}, fpin = null, lastTapF = 0;
  function hit(x, y) { for (var i = 0; i < N; i++) if (HV[i] && Math.abs(x - HX[i]) <= HW[i] / 2 + 1 && Math.abs(y - HY[i]) <= HH[i] / 2 + 1) return i; return -1; }
  function step(d) { var f = F[focus], fl = D.films[f.f]; setFocus(focus + d, true); void fl; }
  $('r-archive').addEventListener('pointerdown', function (e) {
    if (open != null || e.target.closest(sel('#ar-open, #ar-cap-row, #ar-ctl, #ar-by'))) return;
    fp[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(fp); if (ids.length === 2) { var a = fp[ids[0]], b = fp[ids[1]]; fpin = { d: Math.hypot(a.x - b.x, a.y - b.y), z: ZM.t, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, px: PAN.x.t, py: PAN.y.t }; drag = null; return; }
    drag = { x: e.clientX, y: e.clientY, px: PAN.x.t, py: PAN.y.t, t: GJ.now(), vx: 0, vy: 0, lx: e.clientX, ly: e.clientY, lt: GJ.now() }; moved = false;
  });
  G.addEventListener('pointermove', function (e) {
    if (fp[e.pointerId]) { fp[e.pointerId].x = e.clientX; fp[e.pointerId].y = e.clientY; }
    var ids = Object.keys(fp); if (fpin && ids.length === 2) {
      var a = fp[ids[0]], b = fp[ids[1]], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, z1 = clamp(fpin.z * Math.hypot(a.x - b.x, a.y - b.y) / fpin.d, 1, ZMAX);
      var ux = (fpin.mx - AREA.cx - fpin.px) / fpin.z, uy = (fpin.my - AREA.cy - fpin.py) / fpin.z;
      var q = z1 <= 1.001 ? [0, 0] : clampPan(mx - AREA.cx - ux * z1, my - AREA.cy - uy * z1, z1);
      GJ.aim(ZM, z1, true); GJ.aim(PAN.x, q[0], true); GJ.aim(PAN.y, q[1], true);
      ABOUT.x = mx; ABOUT.y = my; ABOUT.on = z1 > 1.001; dirty = true; moved = true; return;
    }
    if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) > 8) moved = true;
    if (moved) {
      var q = clampPan(drag.px + dx, drag.py + dy, ZM.t); GJ.aim(PAN.x, q[0], true); GJ.aim(PAN.y, q[1], true); dirty = true;   // an instant move leaves the springs still: draw it
      var n = GJ.now(), ddt = Math.max(1, n - drag.lt); drag.vx = drag.vx * .6 + (e.clientX - drag.lx) / ddt * .4; drag.vy = drag.vy * .6 + (e.clientY - drag.ly) / ddt * .4; drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = n;
      if (ZM.t < 1.05) { GJ.app.lookUser = clamp(-dx / 300, -.5, .5); GJ.app.lookUserY = clamp(-dy / 400, -.3, .3); }
    }
  });
  function fpUp(e) {
    var was = !!fpin; delete fp[e.pointerId]; var ids = Object.keys(fp); if (ids.length < 2) fpin = null;
    if (was && ids.length === 1) { var r = fp[ids[0]]; drag = { x: r.x, y: r.y, px: PAN.x.t, py: PAN.y.t, t: GJ.now(), vx: 0, vy: 0, lx: r.x, ly: r.y, lt: GJ.now() }; moved = true; }   // lift one finger of a pinch: the other keeps moving it
  }
  G.addEventListener('pointerup', function (e) {
    if (drag && moved) {
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt2 = GJ.now() - drag.t;
      if (ZM.t < 1.05 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt2 < 380) { GJ.aim(PAN.x, 0); GJ.aim(PAN.y, 0); step(dx < 0 ? 1 : -1); }   // the whole page: a swipe steps
      else if (ZM.t >= 1.05 && !fpin) { var q2 = clampPan(PAN.x.t + drag.vx * 240, PAN.y.t + drag.vy * 240, ZM.t); GJ.aim(PAN.x, q2[0]); GJ.aim(PAN.y, q2[1]); }   // closer: it glides on, and slows
      if (ZM.t < 1.05) { GJ.aim(PAN.x, 0); GJ.aim(PAN.y, 0); }
      GJ.app.lookUser = 0; GJ.app.lookUserY = 0; setTimeout(function () { moved = false; }, 0);
    } else if (drag && !fpin && open == null && GJ.app.room === ID) {
      var i = hit(e.clientX, e.clientY);
      if (i >= 0) {   // a tap on a visible tile opens that frame
        setFocus(i); openStill(i);
        lastTapF = 0;
      } else if (GJ.now() - lastTapF < 320) { if (ZM.t > 1.05) zoomAbout(1, AREA.cx, AREA.cy); else zoomAbout(4, e.clientX, e.clientY); GJ.haptic.tick(); lastTapF = 0; }
      else lastTapF = GJ.now();
    }
    drag = null; fpUp(e);
  });
  G.addEventListener('pointercancel', fpUp);
  $('r-archive').addEventListener('wheel', function (e) { e.preventDefault(); zoomAbout(ZM.t * Math.exp(-e.deltaY * .0016), e.clientX, e.clientY, true); }, { passive: false });
  $('ar-ctl').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.f === 'fav') { favOnly = !favOnly; if (favOnly) markOnly = false; if (favOnly && beyond < .7) { beyond = .9; GJ.aim(B, .9); } }
    if (b.dataset.f === 'marked') { markOnly = !markOnly; if (markOnly) favOnly = false; if (markOnly && beyond < .7) { beyond = .9; GJ.aim(B, .9); } }
    if (b.dataset.m != null) mode = +b.dataset.m;
    if (b.dataset.o != null) { ord = +b.dataset.o; layout(); }
    if (b.dataset.g != null) { axis = +b.dataset.g; ord = 2; GR = null; layout(); GJ.rail.config(RAIL()); }
    rekin(); centre(focus); caption(); GJ.haptic.tick();
  });

  /* ---------- dials and rail ---------- */
  var BEYOND = { key: 'beyond', label: 'BEYOND', min: 0, max: 1, def: .3, span: 260, unit: .04,
    get: function () { return beyond; }, set: function (v) { beyond = v; GJ.aim(B, v); dirty = true; },
    notches: function () { return [0, .5, 1]; },
    meter: function () { return front / N; },
    fmt: function (v) { return v < .08 ? 'whole field' : v > .92 ? (ord === 0 ? 'this film' : 'only its kin') : front + ' come forward'; } };
  var walkOrder = [], walkPos = 0;
  function order() {   // the most alike frames, in order (the film's own neighbours win ties)
    var a = F[focus], c = [];
    for (var i = 0; i < N; i++) if (i !== focus) c.push([i, rel(focus, i) - Math.abs(i - focus) * 1e-6]);
    c.sort(function (x, y) { return y[1] - x[1]; }); walkOrder = c.slice(0, 24).map(function (x) { return x[0]; }); void a;
  }
  var WALK = { key: 'walk', label: 'MORE LIKE THIS', min: 0, max: 6, def: 0, span: 240, unit: 1,
    get: function () { return walkPos; }, step: function (v) { return Math.round(v); },
    set: function (v) { v = Math.round(v); if (v === walkPos) return; if (!walkOrder.length) order(); walkPos = v; if (v > 0) { var k = walkOrder[Math.min(walkOrder.length - 1, v - 1)]; focus = k; rekin(); caption(); centre(k); GJ.haptic.tick(); } },
    commit: function () { order(); walkPos = 0; },
    fmt: function () { return D.films[F[focus].f].title.split(' · ').pop().toLowerCase(); } };
  var AXIS = { key: 'axis', label: 'AXIS', min: 0, max: 2, def: 1, span: 160, unit: 1,
    get: function () { return axis; }, step: function (v) { return Math.round(v); },
    set: function (v) { v = Math.round(v); if (v === axis) return; axis = v; tagSel = null; GR = null; if (ord === 2) layout(); rekin(); order(); caption(); GJ.rail.config(RAIL()); },
    notches: function () { return [0, 1, 2]; }, fmt: function (v) { return AX[Math.round(v)]; } };
  /* ---------- Beyond's dial: the place on the reading's scale. It snaps to detents (for colour: where each hue sits on
     the scale, and the greys; for light: five even steps), shows how much comes forward, and gives way to MORE LIKE THIS
     on its chip. Turning it re-picks the frames, softly; letting go keeps the place in the store. ---------- */
  var ZC = [];   // colour's detents: the middle of each hue's stretch of the scale, then the greys
  if (BD) (function () {
    var sum = {}, n = {}; for (var i = 0; i < N; i++) { var nm = nameOf(i); sum[nm] = (sum[nm] || 0) + BR.colour[i] / 255; n[nm] = (n[nm] || 0) + 1; }
    ['red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'grey'].forEach(function (nm) { if (n[nm]) ZC.push(clamp((sum[nm] / n[nm] - BW) / (1 - 2 * BW), 0, 1)); });
  })();
  function byRing(r, label, def) {
    return { key: 'by-' + r, label: label, min: 0, max: 1, def: def, span: 300, unit: .02,
      get: function () { return bpos[r]; },
      set: function (v) { v = clamp(v, 0, 1); if (v === bpos[r] && read === r) return; bpos[r] = v; if (read !== r) return; idleAt = GJ.now(); beenOn = []; rekin(); caption(); roomLight(); },
      notches: function () { return r === 'colour' ? ZC : [0, .25, .5, .75, 1]; },
      settle: function (v) { var best = v, bd = .03; this.notches().forEach(function (n) { var d = Math.abs(n - v); if (d < bd) { bd = d; best = n; } }); return best; },
      commit: function () { var o = {}; o[r === 'colour' ? 'byColour' : 'byLight'] = Math.round(bpos[r] * 1000) / 1000; store.set(o); },
      meter: function () { return front / N; },
      fmt: function () { return read === r ? byName + ' · ' + front : byName; } };
  }
  var BCOL = byRing('colour', 'COLOUR', .12), BLIT = byRing('light', 'LIGHT', .3);
  // the room's own light goes with the reading: the sky's wash and the board's edge — the environment, never a picture
  function roomLight() {
    var o = null, tone = '';
    if (read === 'colour') { var w = { red: 1, orange: 1, amber: .8, green: .1, teal: -.7, blue: -1, violet: -.5, grey: 0 }[byName] || 0; o = { warm: w, grey: byName === 'grey' ? 1 : 0, light: 0 }; tone = byName === 'grey' ? 'grey' : w > .3 ? 'warm' : w < -.3 ? 'cool' : 'mid'; }
    else if (read === 'light') { o = { warm: 0, grey: 0, light: bpos.light * 2 - 1 }; tone = bpos.light < .4 ? 'dark' : bpos.light > .6 ? 'light' : 'mid'; }
    if (GJ.sky.setRoom) GJ.sky.setRoom(GJ.app && GJ.app.room === ID ? o : null);
    var rm = $('r-archive'); if (read) { rm.setAttribute('data-by', read); rm.setAttribute('data-tone', tone); } else { rm.removeAttribute('data-by'); rm.removeAttribute('data-tone'); }
  }
  function setRead(r, quiet) {   // null · 'colour' · 'light'
    read = r && BR[r] ? r : null; tagSel = null;
    if (read && beyond < .8) { beyond = .8; GJ.aim(B, .8); }
    rekin(); caption(); roomLight(); idleAt = GJ.now();
    if (!quiet) {
      if (store.get().byRead !== (read || '')) store.set({ byRead: read || '' }); GJ.haptic.tick();
      if (GJ.mark && GJ.mark.say) GJ.mark.say(read === 'colour' ? 'beyond · colour · turn the dial: warm through to the greys' : read === 'light' ? 'beyond · light · turn the dial: darker to lighter' : 'beyond · off · the frame\'s own kin again', 2600);   // taught in place
    }
    if (GJ.app && GJ.app.room === ID && open == null && GJ.dial.rings().length) { GJ.dial.config(GJ.rooms[ID].rings()); if (read && !quiet) GJ.dial.raise(0); }
    if (read && !quiet && GJ.app && GJ.app.room === ID && knobs().depth !== 'far') toDepth();
  }
  // one choice at a time (the brief: "it's always obvious which of the three you're in"): choosing one lets go of the other
  function chooseRead(v) {   // 'off' · 'red' · 'colour' · 'light'
    if (v === 'red') { if (read) setRead(null, true); store.set({ red: true, byRead: '' }); GJ.haptic.tick(); caption(); return; }   // the red look: the same switch as the dot
    if (v === 'off') { if (store.get().red) store.set({ red: false }); if (read) setRead(null); else caption(); return; }
    if (store.get().red) store.set({ red: false });
    setRead(v);
  }
  $('ar-by').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    var lit = b.dataset.b === 'red' ? !!store.get().red : read === b.dataset.b;
    chooseRead(lit ? 'off' : b.dataset.b);   // a tap on the lit one is off
  });
  /* how the camera moves (the brief: "drift speed: how slowly the view wanders when left alone; it never runs away"):
     with a reading on and the view close in, left alone it wanders to the nearest forward frame it has not just been on —
     a short glide each time, so it never runs away — only if the camera dial's drift is on, at its pace, on the same
     spring as every other move here; never under reduced motion or a still atmosphere. Any touch, or a turn of the
     dial, and it waits again. */
  /* Beyond's own camera (the brief: "its own dial in the camera cluster, with the same knobs as the camera"). Four knobs,
     kept in the store and offered on the dial's menu (its beyond plane) and in Tune:
       depth  · far / mid / close — how close the room feels: choosing mid or close pushes in onto a forward frame
       drift  · off / slow / easy — how long the view rests before it wanders on (9 s, 5 s); it never runs away
       easing · fold / cubic / smooth / push — the curve of each move (the app's own settle curves)
       move   · dolly / orbit — a clear choice: dolly breathes back and in as it travels; orbit turns the field instead */
  var BDEPTH = { far: 1, mid: 4, close: 10 }, BDWELL = { off: 0, slow: 9000, easy: 5000 };
  function bez(x1, y1, x2, y2) {   // a css cubic-bezier, solved for y at x
    return function (x) { var t = x; for (var i = 0; i < 6; i++) { var a = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x, d = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t; if (Math.abs(d) < 1e-5) break; t = clamp(t - a / d, 0, 1); }
      return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t; };
  }
  var BEASE = { fold: [1300, bez(.22, .7, .2, 1)], cubic: [1100, GJ.ease], smooth: [1250, function (u) { return u * u * u * (u * (u * 6 - 15) + 10); }], push: [2000, function (u) { return 1 - Math.pow(1 - u, 3); }] };
  function knobs() { var s = store.get(); return { depth: BDEPTH[s.byDepth] ? s.byDepth : 'far', drift: BDWELL[s.byDrift] != null ? s.byDrift : 'slow', ease: BEASE[s.byEase] ? s.byEase : 'fold', move: s.byMove === 'orbit' ? 'orbit' : 'dolly' }; }
  var idleAt = 0, driftAt = 0, beenOn = [], glide = null, orb = 0;
  document.addEventListener('pointerdown', function () { idleAt = GJ.now(); if (glide) { glide = null; orb = 0; dirty = true; } }, true);   // any touch and it waits again
  function nearestForward(from) { var best = -1, bd = 1e9; for (var i = 0; i < N; i++) if (KIN[i] && i !== from && beenOn.indexOf(i) < 0) { var d = Math.hypot(BX[i] - BX[from], BY[i] - BY[from]); if (d < bd) { bd = d; best = i; } } return best; }
  function glideTo(i) {   // one move of Beyond's camera, on its own easing
    var k = knobs(), E = BEASE[k.ease], z = ZM.t;
    glide = { t0: GJ.now(), ms: E[0], f: E[1], x0: PAN.x.t, y0: PAN.y.t, x1: -BX[i] * z, y1: -BY[i] * z, z: z, move: k.move, dir: BX[i] >= BX[focus] ? 1 : -1 };
  }
  function glideTick() {
    if (!glide) return;
    var u = clamp((GJ.now() - glide.t0) / glide.ms, 0, 1), e = glide.f(u), arc = Math.sin(Math.PI * u);
    var z = glide.move === 'dolly' ? glide.z * (1 - .1 * arc) : glide.z, k = z / glide.z;
    GJ.aim(ZM, z, true); GJ.aim(PAN.x, (glide.x0 + (glide.x1 - glide.x0) * e) * k, true); GJ.aim(PAN.y, (glide.y0 + (glide.y1 - glide.y0) * e) * k, true);
    orb = glide.move === 'orbit' ? glide.dir * arc * .12 : 0; dirty = true;
    if (u >= 1) { glide = null; orb = 0; }
  }
  function toDepth(d) {   // push in onto a forward frame (mid, close), or back out to the whole field (far)
    if (!read || open != null) return; var z = BDEPTH[d || knobs().depth] || 1; glide = null; orb = 0;
    if (z <= 1) { zoomAbout(1, AREA.cx, AREA.cy); return; }
    if (!KIN[focus]) { beenOn = []; var n0 = nearestForward(focus); if (n0 >= 0) { focus = n0; caption(); } }
    GJ.aim(ZM, z); GJ.aim(PAN.x, -BX[focus] * z); GJ.aim(PAN.y, -BY[focus] * z); dirty = true; idleAt = GJ.now();
  }
  function driftTick() {
    glideTick();
    if (!read || open != null || glide || ZM.t < 1.3 || GJ.reduced() || GJ.sky.atmos < .02) return;
    var dwell = BDWELL[knobs().drift], now = GJ.now(); if (!dwell || now - idleAt < 3500 || now - driftAt < dwell) return;
    driftAt = now; var best = nearestForward(focus);
    if (best < 0) { beenOn = []; return; }
    beenOn.push(focus); if (beenOn.length > 12) beenOn.shift();
    glideTo(best); focus = best; caption(); dirty = true;
  }
  // hold the dial: push in — from the whole archive close onto the frame you are on, and back out
  function pushHold(down) { if (!down) return; if (ZM.t > 1.3) zoomAbout(1, AREA.cx, AREA.cy); else closeOn(focus); GJ.haptic.commit(); }
  function tagsOf() {
    var c = {}; F.forEach(function (f) { f.t[axis].forEach(function (t) { c[t] = (c[t] || 0) + 1; }); });
    return Object.keys(c).sort(function (a, b) { return c[b] - c[a] || (a < b ? -1 : 1); }).slice(0, 7);
  }
  function RAIL() {
    var T = tagsOf();
    return {
      stops: T.map(function (t) { return { label: t }; }),
      label: function (i) { return T[i]; },
      get: function () { var i = T.indexOf(tagSel); return i < 0 ? -1 : i; },
      go: function (i) {   // search: everything with this tag comes forward; the first of them becomes the frame you are on
        var t = T[i], first = -1; for (var k = 0; k < N && first < 0; k++) if (F[k].t[axis].indexOf(t) >= 0) first = k;
        if (first >= 0) focus = first; tagSel = t; if (beyond < .5) { beyond = .8; GJ.aim(B, .8); } rekin(); caption(); GJ.haptic.tick(); GJ.dial.redraw();
      },
      scrub: function (f) { var i = Math.round(f); if (T[i] !== tagSel) this.go(i); },
      rest: function () {}
    };
  }

  GJ.rooms[ID] = {
    id: ID, title: cfg.title || ID, trees: .3, golden: 0,
    rings: function () {
      WALK.hold = pushHold; BEYOND.hold = pushHold;
      if (read) { var R = read === 'colour' ? BCOL : BLIT; R.alt = WALK; WALK.alt = R; R.hold = pushHold; return [R, AXIS]; }   // a reading is on: the first dial is its place on the scale
      WALK.alt = BEYOND; BEYOND.alt = WALK; return [WALK, AXIS];   // CAMERA-DIAL.md, archive
    },
    stack: true, home: function () { return open != null ? 'frame' : read ? 'by-' + read : 'walk'; },
    rail: function () { return RAIL(); },
    enter: function () {
      loadAll(); CW = 0; layout(); rekin(); KA.set(KIN); fading = false; order(); caption(); setTimeout(roomLight, 0);
      GJ.aim(ZM, 1, true); GJ.aim(PAN.x, 0, true); GJ.aim(PAN.y, 0, true);
      $('ar-meta').textContent = W8.meta ? W8.meta(D, N) : D.films.length + ' films · ' + N.toLocaleString('en-US') + ' frames · pinch to come close';
    },
    leave: function () { closeStill(); if (GJ.sky.setRoom) GJ.sky.setRoom(null); },
    key: function (k) { if (k === 'ArrowRight') step(1); else if (k === 'ArrowLeft') step(-1); else if (k === 'Escape' && open != null) closeStill(); },
    frame: frame,
    back: function () { if (open != null) { closeStill(); return true; } if (ZM.t > 1.05) { zoomAbout(1, AREA.cx, AREA.cy); return true; } return false; }
  };
  store.on(function (s2, prev) { dirty = true; if (!prev || s2.red !== prev.red) caption(); if (prev && s2.byDepth !== prev.byDepth && GJ.app && GJ.app.room === ID) toDepth(); });
  (function () {   // the reading is one setting for the app: it comes back with the page
    var s0 = store.get(); if (typeof s0.byColour === 'number') bpos.colour = clamp(s0.byColour, 0, 1); if (typeof s0.byLight === 'number') bpos.light = clamp(s0.byLight, 0, 1);
    if (s0.byRead === 'colour' || s0.byRead === 'light') { read = BR[s0.byRead] ? s0.byRead : null; if (read && beyond < .8) { beyond = .8; GJ.aim(B, .8, true); } }
  })();
  G.addEventListener('resize', function () { CW = 0; layout(); });
  layout(); rekin(); KA.set(KIN); fading = false; caption();
  Object.assign(API, {
    beyond: function () { return { read: read, pos: read ? bpos[read] : null, name: read ? byName : '', front: front, colour: bpos.colour, light: bpos.light, fading: fading, has: !!BD }; },
    setRead: setRead, choose: chooseRead, knobs: knobs, gliding: function () { return glide ? { move: glide.move, ms: glide.ms, orb: orb } : null; }, readRank: function (i) { return read ? BR[read][i] / 255 : null; }, kin: function (i) { return KIN[i]; }, shown: function (i) { return KA[i]; },
    group: function (k) { axis = k; ord = 2; GR = null; layout(); rekin(); order(); caption(); GJ.rail.config(RAIL()); }, groups: groups, step: step,
    setMode: function (m) { mode = m; dirty = true; caption(); }, setOrder: function (o) { ord = o; layout(); rekin(); caption(); },
    state: function () { return { n: N, films: D.films.length, focus: focus, title: D.films[F[focus].f].title, axis: AX[axis], beyond: beyond, front: front, open: open, tag: tagSel, mode: MODE[mode], order: ORD[ord], zoom: Math.max(ZM.t, fpin ? fpin.z : 0) }; },
    focus: function (i) { setFocus(i, true); }, zoomTo: function (z, x, y) { zoomAbout(z, x == null ? AREA.cx : x, y == null ? AREA.cy : y, true); }, pan: function () { return [PAN.x.t, PAN.y.t]; },
    hit: hit, about: function () { return ABOUT.on ? [ABOUT.x, ABOUT.y] : [AREA.cx, AREA.cy]; },
    screen: function (i) { return HV[i] ? [HX[i], HY[i], HW[i]] : null; }, visible: function () { var n = 0; for (var i = 0; i < N; i++) n += HV[i]; return n; },
    // for the tools built on the archive's frames (picks, markup, decision sheets, the player): a frame drawn into any canvas — exact pixels, only scaled —
    // and what it is; the sets they can be given; the review records themselves
    drawFrame: function (i, c, w) { var tier = 2, sh = sheet(F[i].f, 2); if (!sh) { tier = 1; sh = sheet(F[i].f, 1); } if (!sh) return 0; var q = cell(i, tier), W = w || q[2]; c.width = W; c.height = Math.round(W * q[3] / q[2]); var g2 = c.getContext('2d'); g2.imageSmoothingQuality = 'high'; g2.drawImage(sh, q[0], q[1], q[2], q[3], 0, 0, c.width, c.height); return tier; },
    label: function (i) { var fl = D.films[F[i].f]; return { film: fl.title, frame: F[i].j + 1, of: fl.n, tc: F[i].tc, id: F[i].id, aspect: fl.h / fl.w }; },
    indexOf: function (id) { for (var i = 0; i < N; i++) if (F[i].id === id) return i; return -1; },
    hearts: function () { var o = []; for (var i = 0; i < N; i++) { var r = RV[F[i].id]; if (r && r.r === 1) o.push(i); } return o; },
    marked: function () { var o = []; for (var i = 0; i < N; i++) { var r = RV[F[i].id]; if (r && ((r.pins && r.pins.length) || (r.strokes && r.strokes.length) || (r.tags && r.tags.length) || r.n)) o.push(i); } return o; },
    forward: function () { var o = []; for (var i = 0; i < N; i++) if (KIN[i]) o.push(i); return o; },
    filmOfFrame: function (i) { var o = filmOf(i), a = []; for (var k = 0; k < o.n; k++) a.push(o.k0 + k); return a; },
    isOpen: function () { return open; }, loadAll: loadAll, measured: function (i) { return BD ? { light: BR.light[i] / 255, colour: BR.colour[i] / 255, name: nameOf(i) } : null; },
    filter: function (v) { if (v !== undefined) { favOnly = v === 'fav'; markOnly = v === 'marked'; if (v && beyond < .7) { beyond = .9; GJ.aim(B, .9); } rekin(); centre(focus); caption(); } return favOnly ? 'fav' : markOnly ? 'marked' : null; },
    onShow: null, onClose: null, onReview: null,
    open: openStill, close: closeStill, rel: rel, play: play, step: stepBy, anim: function () { return { on: anim.on, fps: anim.fps, loop: anim.loop, frame: open != null ? F[open].j : -1, a: anim.a, b: anim.b, beat: anim.beat, mult: anim.mult, bfps: beatFps(), bpm: tempo() }; }, mark: markPoint, setBeat: setBeat, review: function (i) { return rv(i == null ? (open != null ? open : focus) : i); }, setReview: function (i, o) { rvSet(i, o); if (open === i) show(i); }, favs: function () { var n = 0; for (var k in RV) if (RV[k].r === 1) n++; return n; }, frames: F, films: D.films, tile: function () { return [TW, TH]; }, draws: function () { return draws; }, loaded: function () { return A1.filter(Boolean).length; }, id: ID
  });
  return API;
  }
  GJ.archiveStack = stack;
  GJ.archive = stack({ id: 'archive', px: 'ar', title: 'archive', data: G.GJ_INDEX, beyond: G.GJ_BEYOND, rkey: 'gj-review' });
})(window);
