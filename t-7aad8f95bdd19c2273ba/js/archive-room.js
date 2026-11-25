/* Archive field ported from the site archive-index camera (pan / pinch / wheel zoom,
   tap to lift a frame). Cells are 4:5 photographs. The eyepiece hairline shows while moving.
   Subtle idle drift that never runs away. Pinch in: fewer, larger, down to one photo.
   Pinch out: more, smaller. Nothing here tints a photograph. */
(function (G) {
  'use strict';
  var vp, cv, cx, lt, ltfig;
  var CW = 160, CH = 200, GX = 14, GY = 14, PAD = 28;
  var F = [], L = null, vw = 0, vh = 0, dpr = 1, TOP = 72;
  var s = 1, ox = 0, oy = 0, dirty = true, level = 2;
  var cache = new Map(), want = [], inflight = 0;
  var P = new Map(), pinch = null, tap = null, glide = null, anim = null;
  var drift = { a: 0, on: true }, live = false, raf = 0;
  var RM = G.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function $(id) { return document.getElementById(id); }
  function src(p) { return (G.CKS_SRC ? G.CKS_SRC(p) : p); }
  function eye(on) { if (G.GJ_EYE && G.GJ_EYE.setMoving) G.GJ_EYE.setMoving(on); }

  function img(url) {
    var e = cache.get(url);
    if (e) return e.ok ? e.im : null;
    want.push(url); return null;
  }
  function pump() {
    while (inflight < 12 && want.length) {
      var url = want.shift();
      if (cache.has(url)) continue;
      var im = new Image(); im.decoding = 'async';
      var e = { im: im, ok: false }; cache.set(url, e); inflight++;
      im.onload = function () { e.ok = true; inflight--; dirty = true; pump(); };
      im.onerror = function () { inflight--; pump(); };
      im.src = url;
    }
  }

  function colsForLevel() {
    var n = Math.max(1, F.length);
    if (level <= 0) return 1;
    if (level === 1) return Math.min(2, n);
    if (level === 2) return Math.min(4, n);
    if (level === 3) return Math.min(6, n);
    return Math.min(9, n);
  }
  function build(cols) {
    var r = new Float32Array(F.length * 2);
    var y = PAD, W = PAD * 2 + cols * CW + (cols - 1) * GX;
    F.forEach(function (x, j) {
      var c = j % cols, rr = (j / cols) | 0;
      r[j * 2] = PAD + c * (CW + GX);
      r[j * 2 + 1] = y + rr * (CH + GY);
    });
    var rows = Math.ceil(F.length / cols) || 1;
    return { cols: cols, r: r, W: W, H: y + rows * (CH + GY) - GY + PAD };
  }
  function layout() {
    L = build(colsForLevel());
  }
  function fitS() { return Math.min((vw - 16) / L.W, (vh - TOP - 16) / L.H); }
  function minS() { return fitS() * 0.8; }
  function maxS() { return Math.max(vw, vh) * 0.92 / CW; }
  function clamp() {
    var min = minS(), max = maxS();
    if (s < min) s = min;
    if (s > max) s = max;
    var maxX = Math.max(0, L.W - vw / s);
    var maxY = Math.max(0, L.H - (vh - TOP) / s);
    if (ox < 0) ox = 0;
    if (oy < 0) oy = 0;
    if (ox > maxX) ox = maxX;
    if (oy > maxY) oy = maxY;
  }
  function go(ts, tx, ty, a) {
    clamp();
    if (!a || RM.matches) { s = ts; ox = tx; oy = ty; clamp(); dirty = true; return; }
    var t0 = performance.now(), s0 = s, x0 = ox, y0 = oy;
    anim = function (t) {
      var u = Math.min(1, (t - t0) / 420);
      var e = 1 - Math.pow(1 - u, 3);
      s = s0 + (ts - s0) * e; ox = x0 + (tx - x0) * e; oy = y0 + (ty - y0) * e;
      clamp(); dirty = true;
      if (u >= 1) anim = null;
    };
  }
  function zoomAt(f, px, py) {
    var wx = ox + px / s, wy = oy + py / s;
    s *= f; clamp();
    ox = wx - px / s; oy = wy - py / s; clamp();
    dirty = true; eye(true);
  }
  function fit(anim) {
    layout();
    var t = fitS();
    go(t, L.W / 2 - vw / 2 / t, L.H / 2 - (vh - TOP) / 2 / t, anim);
  }
  function setLevel(lv, anim) {
    level = Math.max(0, Math.min(4, lv | 0));
    layout(); fit(anim);
  }
  function resize() {
    if (!cv || !vp) return;
    vw = vp.clientWidth; vh = vp.clientHeight;
    dpr = Math.min(2, G.devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (L) { clamp(); dirty = true; } else fit(false);
    if (G.GJ_EYE && G.GJ_EYE.layout) G.GJ_EYE.layout();
  }

  function draw() {
    if (!cx) return;
    cx.clearRect(0, 0, vw, vh);
    cx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#04070b';
    cx.fillRect(0, 0, vw, vh);
    if (!L) return;
    for (var g = 0; g < F.length; g++) {
      var x = (L.r[g * 2] - ox) * s, y = (L.r[g * 2 + 1] - oy) * s;
      var w = CW * s, h = CH * s;
      if (x + w < -20 || y + h < -20 || x > vw + 20 || y > vh + 20) continue;
      var it = F[g];
      var url = src(it.kind === 'video' ? (it.poster || it.src) : it.src);
      var im = img(url);
      cx.fillStyle = '#050506';
      cx.fillRect(x, y, w, h);
      if (im && im.naturalWidth) {
        var iw = im.naturalWidth, ih = im.naturalHeight;
        var r = Math.max(w / iw, h / ih);
        var dw = iw * r, dh = ih * r;
        cx.save();
        cx.beginPath(); cx.rect(x, y, w, h); cx.clip();
        cx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        cx.restore();
      }
      if (it.kind === 'video') {
        cx.fillStyle = 'rgba(238,243,245,.85)';
        cx.beginPath();
        cx.moveTo(x + w / 2 - 7, y + h / 2 - 10);
        cx.lineTo(x + w / 2 + 11, y + h / 2);
        cx.lineTo(x + w / 2 - 7, y + h / 2 + 10);
        cx.closePath(); cx.fill();
      }
    }
    pump();
    if (G.GJ_GHOST && G.GJ_GHOST.update && F.length) {
      var maxY = Math.max(1, L.H - (vh - TOP) / s);
      G.GJ_GHOST.update({ name: 'archive', min: 0, max: 1, def: 0, value: maxY ? oy / maxY : 0, x: vw - 24, y: vh / 2 });
    }
  }

  function loop(t) {
    if (!live) { raf = 0; return; }
    if (anim) anim(t);
    if (glide) glide(t);
    if (drift.on && !anim && !glide && !P.size && !RM.matches) {
      drift.a += 0.004;
      ox += Math.sin(drift.a) * 0.04 / s;
      oy += Math.cos(drift.a * 0.7) * 0.03 / s;
      clamp(); dirty = true;
    }
    if (dirty) { dirty = false; draw(); }
    raf = requestAnimationFrame(loop);
  }

  function hit(px, py) {
    if (!L) return -1;
    var wx = ox + px / s, wy = oy + py / s;
    for (var g = 0; g < F.length; g++) {
      var x = L.r[g * 2], y = L.r[g * 2 + 1];
      if (wx >= x && wx <= x + CW && wy >= y && wy <= y + CH) return g;
    }
    return -1;
  }
  function lift(g) {
    var it = F[g]; if (!it) return;
    if (G.CKS_LIGHTBOX) { G.CKS_LIGHTBOX(it); return; }
    if (!lt) return;
    lt.hidden = false;
    var fig = $('ltfig'); if (!fig) return;
    fig.innerHTML = '';
    if (it.kind === 'video') {
      var v = document.createElement('video');
      v.setAttribute('controls', ''); v.setAttribute('playsinline', '');
      if (it.poster) v.poster = src(it.poster);
      v.src = src(it.src); fig.appendChild(v); v.play().catch(function () {});
    } else {
      var im = document.createElement('img'); im.src = src(it.src); im.alt = ''; fig.appendChild(im);
    }
  }
  function closeLift() {
    if (!lt) return;
    lt.hidden = true;
    if (ltfig) ltfig.innerHTML = '';
  }

  function bind() {
    if (!vp || vp._cksBound) return;
    vp._cksBound = true;
    vp.addEventListener('pointerdown', function (e) {
      vp.setPointerCapture(e.pointerId); anim = null; glide = null;
      P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (P.size === 1) tap = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
      if (P.size === 2) {
        var a = P.values().next().value;
        var arr = []; P.forEach(function (v) { arr.push(v); });
        var p = arr[0], q = arr[1];
        pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), mx: (p.x + q.x) / 2, my: (p.y + q.y) / 2, level0: level };
        tap = null;
      }
    });
    vp.addEventListener('pointermove', function (e) {
      if (!P.has(e.pointerId)) return;
      var prev = P.get(e.pointerId);
      P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (P.size === 1 && !pinch) {
        var dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 8) tap.moved = true;
        ox -= dx / s; oy -= dy / s; clamp(); dirty = true; eye(true);
      } else if (P.size === 2 && pinch) {
        var arr = []; P.forEach(function (v) { arr.push(v); });
        var p = arr[0], q = arr[1];
        var d = Math.hypot(p.x - q.x, p.y - q.y), mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
        if (d > 8 && pinch.d > 8) {
          var ratio = d / pinch.d;
          zoomAt(ratio, mx, my);
          if (ratio > 1.18) setLevel(Math.max(0, pinch.level0 - 1), false);
          else if (ratio < 0.84) setLevel(Math.min(4, pinch.level0 + 1), false);
        }
        pinch = { d: d, mx: mx, my: my, level0: pinch.level0 };
        eye(true);
      }
    });
    function up(e) {
      if (!P.has(e.pointerId)) return;
      var was = tap;
      P.delete(e.pointerId);
      if (P.size < 2) pinch = null;
      if (P.size === 0 && was && !was.moved && performance.now() - was.t < 400) {
        var g = hit(was.x, was.y);
        if (g >= 0) lift(g);
      }
      tap = null;
    }
    vp.addEventListener('pointerup', up);
    vp.addEventListener('pointercancel', up);
    vp.addEventListener('wheel', function (e) {
      e.preventDefault();
      var k = e.ctrlKey ? 0.01 : 0.0018;
      zoomAt(Math.exp(-e.deltaY * k), e.clientX, e.clientY);
    }, { passive: false });
    if (lt) {
      var bg = $('ltbg'); if (bg) bg.addEventListener('click', closeLift);
      var bar = $('ltbar'); if (bar) bar.addEventListener('click', closeLift);
    }
    G.addEventListener('resize', resize);
  }

  function open(items) {
    F = (items || []).map(function (it) {
      if (typeof it === 'string') {
        return { src: it, kind: /\.(mp4|mov|webm)$/i.test(it) ? 'video' : 'img' };
      }
      var k = it.kind || (/\.(mp4|mov|webm)$/i.test(it.src) ? 'video' : 'img');
      return { src: it.src, poster: it.poster, kind: k };
    });
    vp = $('vp'); cv = $('cv'); lt = $('lt'); ltfig = $('ltfig');
    if (!vp || !cv) return;
    cx = cv.getContext('2d');
    vp.hidden = false;
    var grid = $('archiveGrid'); if (grid) grid.style.display = 'none';
    live = true; bind();
    function start(){ resize(); level = 2; fit(false); if (!raf) raf = requestAnimationFrame(loop); }
    requestAnimationFrame(function(){ requestAnimationFrame(start); });
    if (G.GJ_EYE && G.GJ_EYE.layout) G.GJ_EYE.layout();
  }
  function close() {
    live = false; closeLift();
    if (G.GJ_GHOST && G.GJ_GHOST.release) G.GJ_GHOST.release();
    if (vp) vp.hidden = true;
  }

  G.CKS_ARCHIVE = { open: open, close: close, setLevel: setLevel, fit: function () { fit(true); } };
})(window);
