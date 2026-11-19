/* tools-02 · Review Markup (briefs/REVIEW-MARKUP.md; Gill, 18 Nov: batch two).
   Feedback on a frame, kept beside it — never in it. With a frame open in the archive, MARK turns the frame into a page
   to write on:
     · tap a spot → a pin, with a line of text. Pins are numbered; tap one to read it (and, in MARK, to take it off).
     · drag → a thin line, on its own layer over the frame.
     · tags: keep · cut · reshoot · focus (one tap each). The heart and ✕ are the open frame's own.
   A pin or a line is kept as a place on the frame (0–1 across, 0–1 down), so it sits on the same spot at any zoom.
   Everything is stored with the frame's review record (localStorage gj-review: pins, strokes, tags) and survives a
   restart. EXPORT makes a markup PDF: every marked frame on its own page, pins numbered, the notes listed beside it —
   drawn onto a copy for the page; the archive's own pictures are never written to.
   The archive's second row gets MARKED: only the frames with a pin, a line, a tag or a note come forward.
   Not here yet (the brief): voice notes on a pin, custom tags, swipe up / down for like / dislike, reviewers by link. */
(function (G) {
  'use strict';
  var GJ = G.GJ, A = GJ.archive, html = document.documentElement; if (!A) return;
  var TAGS = ['keep', 'cut', 'reshoot', 'focus'], INK = '#e8e4dc';
  var big = document.getElementById('ar-big'), tools = document.getElementById('ar-tools'), host = document.getElementById('ar-open'); if (!big || !tools) return;
  var lay = document.createElement('div'); lay.id = 'ar-mark'; lay.innerHTML = '<canvas></canvas>'; host.appendChild(lay);
  var cv = lay.firstChild, g = cv.getContext('2d');
  var bar = document.createElement('div'); bar.id = 'mk-bar';
  bar.innerHTML = '<span class="mk-tags">' + TAGS.map(function (t) { return '<button data-t="' + t + '">' + t + '</button>'; }).join('') + '</span><span class="mk-do"><button data-a="undo">undo</button><button data-a="export">export</button><button data-a="done">done</button></span>' +
    '<input class="mk-in" type="text" maxlength="140" placeholder="a note for this spot" hidden><p class="mk-say"></p>';
  host.insertBefore(bar, document.getElementById('ar-note'));
  var mb = document.createElement('button'); mb.dataset.a = 'mark'; mb.textContent = 'mark'; mb.setAttribute('aria-label', 'mark up this frame: pins, lines and tags'); tools.appendChild(mb);
  var inp = bar.querySelector('.mk-in'), sayEl = bar.querySelector('.mk-say');
  var on = false, cur = null, stroke = null, pend = null, shownPin = -1;

  function rec() { var r = cur == null ? null : A.review(cur); return { pins: r && r.pins ? r.pins.slice() : [], strokes: r && r.strokes ? r.strokes.slice() : [], tags: r && r.tags ? r.tags.slice() : [] }; }
  function put(o) { if (cur != null) A.setReview(cur, o); }
  function fit() {   // the layer is the picture's own rectangle: where the frame is letterboxed inside its box (a phone on its side), the layer is too
    var b = big.getBoundingClientRect(), h = host.getBoundingClientRect(), ar = big.width / big.height || 16 / 9, w = b.width, ht = b.height; if (w / ht > ar) w = ht * ar; else ht = w / ar;
    var r = { left: b.left + (b.width - w) / 2, top: b.top + (b.height - ht) / 2, width: w, height: ht };
    lay.style.left = (r.left - h.left) + 'px'; lay.style.top = (r.top - h.top) + 'px'; lay.style.width = r.width + 'px'; lay.style.height = r.height + 'px'; return r;
  }
  function strokesOn(ctx, W, H, strokes, lw) { ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; strokes.forEach(function (s) { if (s.length < 4) return; ctx.beginPath(); ctx.moveTo(s[0] * W, s[1] * H); for (var k = 2; k < s.length; k += 2) ctx.lineTo(s[k] * W, s[k + 1] * H); ctx.stroke(); }); }
  function paint() {
    if (cur == null) { lay.classList.remove('on'); return; }
    var r = fit(), d = Math.min(2, G.devicePixelRatio || 1), R = rec(); lay.classList.add('on');
    if (cv.width !== Math.round(r.width * d) || cv.height !== Math.round(r.height * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
    g.clearRect(0, 0, cv.width, cv.height); g.shadowColor = 'rgba(3,5,11,.8)'; g.shadowBlur = 3 * d; strokesOn(g, cv.width, cv.height, stroke ? R.strokes.concat([stroke]) : R.strokes, 1.6 * d); g.shadowBlur = 0;
    [].forEach.call(lay.querySelectorAll('.mk-pin'), function (p) { p.remove(); });
    R.pins.forEach(function (p, k) { var b = document.createElement('button'); b.className = 'mk-pin' + (k === shownPin ? ' on' : ''); b.style.left = (p.x * 100) + '%'; b.style.top = (p.y * 100) + '%'; b.textContent = k + 1; b.dataset.k = k; b.setAttribute('aria-label', 'pin ' + (k + 1) + ': ' + p.text); lay.appendChild(b); });
    [].forEach.call(bar.querySelectorAll('[data-t]'), function (b) { b.classList.toggle('on', R.tags.indexOf(b.dataset.t) >= 0); });
    mb.classList.toggle('on', on || R.pins.length + R.strokes.length + R.tags.length > 0);
    sayEl.textContent = shownPin >= 0 && R.pins[shownPin] ? (shownPin + 1) + ' · ' + R.pins[shownPin].text : on ? 'tap a spot for a pin · drag to draw · ' + R.pins.length + (R.pins.length === 1 ? ' pin' : ' pins') + ' · ' + R.strokes.length + (R.strokes.length === 1 ? ' line' : ' lines') : '';
  }
  function setOn(v) { on = !!v; html.classList.toggle('marking', on); pend = null; inp.hidden = true; shownPin = -1; if (on) A.play(false); paint(); if (on && GJ.mark && GJ.mark.say) GJ.mark.say('mark · tap a spot for a pin · drag to draw · the frame itself is never changed', 2600); }
  A.onShow = function (i) { cur = i; stroke = null; pend = null; shownPin = -1; inp.hidden = true; paint(); };
  A.onClose = function () { cur = null; setOn(false); lay.classList.remove('on'); };
  mb.addEventListener('click', function (e) { e.stopPropagation(); setOn(!on); GJ.haptic.tick(); });
  // the layer follows the frame — its size, its place, its zoom — for as long as one is open
  var seen = '';
  (function follow() { if (cur != null) { var r = big.getBoundingClientRect(), k = [r.left, r.top, r.width, r.height].map(Math.round).join(); if (k !== seen) { seen = k; paint(); } } requestAnimationFrame(follow); })();

  function at(e) { var r = lay.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; }
  var down = null;
  lay.addEventListener('pointerdown', function (e) {
    var pin = e.target.closest('.mk-pin');
    if (pin) { e.stopPropagation(); e.preventDefault(); var k = +pin.dataset.k; if (on && shownPin === k) { var R = rec(); R.pins.splice(k, 1); shownPin = -1; put({ pins: R.pins }); } else shownPin = k; paint(); GJ.haptic.tick(); return; }   // tap a pin: read it · in MARK, tap it again: take it off
    if (!on) return; e.stopPropagation(); e.preventDefault(); try { lay.setPointerCapture(e.pointerId); } catch (x) {}
    var p = at(e); down = { p: p, x: e.clientX, y: e.clientY, moved: false }; shownPin = -1;
  });
  lay.addEventListener('pointermove', function (e) {
    if (!down) return; if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) return;
    if (!down.moved) { down.moved = true; stroke = [+down.p[0].toFixed(4), +down.p[1].toFixed(4)]; }
    var p = at(e), n = stroke.length; if (Math.hypot(p[0] - stroke[n - 2], p[1] - stroke[n - 1]) > .004) { stroke.push(+p[0].toFixed(4), +p[1].toFixed(4)); paint(); }
  });
  function up() {
    if (!down) return; var d = down; down = null;
    if (d.moved && stroke) { var R = rec(); if (stroke.length >= 4) { R.strokes.push(stroke); stroke = null; put({ strokes: R.strokes }); } stroke = null; paint(); return; }
    pend = d.p; inp.hidden = false; inp.value = ''; inp.focus(); sayEl.textContent = 'a note for this spot, then return';
  }
  lay.addEventListener('pointerup', up); lay.addEventListener('pointercancel', function () { down = null; stroke = null; paint(); });
  lay.addEventListener('click', function (e) { e.stopPropagation(); });   // a tap on the layer is the layer's: it never closes the frame
  function commitPin() { var t = inp.value.trim(); inp.hidden = true; if (!pend) return; if (t) { var R = rec(); R.pins.push({ x: +pend[0].toFixed(4), y: +pend[1].toFixed(4), text: t, t: Date.now() }); put({ pins: R.pins }); GJ.haptic.commit(); } pend = null; paint(); }
  inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { commitPin(); inp.blur(); } if (e.key === 'Escape') { pend = null; inp.hidden = true; paint(); } });
  inp.addEventListener('blur', function () { if (!inp.hidden) commitPin(); });
  ['pointerdown', 'click'].forEach(function (ev) { bar.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var R = rec();
    if (b.dataset.t) { var k = R.tags.indexOf(b.dataset.t); if (k >= 0) R.tags.splice(k, 1); else R.tags.push(b.dataset.t); put({ tags: R.tags }); GJ.haptic.tick(); }
    else if (b.dataset.a === 'undo') { if (R.strokes.length) { R.strokes.pop(); put({ strokes: R.strokes }); } else if (R.pins.length) { R.pins.pop(); put({ pins: R.pins }); } }
    else if (b.dataset.a === 'done') setOn(false);
    else if (b.dataset.a === 'export') { exportPdf().catch(function () { sayEl.textContent = 'the pdf could not be made from here'; }); return; }
    paint();
  });

  /* ---------- the markup PDF: each marked frame on a page, pins numbered, notes beside it ---------- */
  function page(i) {
    var L = A.label(i), r = A.review(i) || {}, W = 1240, M = 44, fw = 760, tmp = document.createElement('canvas'); A.drawFrame(i, tmp, 480); var fh = Math.round(fw * tmp.height / tmp.width);
    var pins = r.pins || [], lines = [], c = document.createElement('canvas'), g2 = c.getContext('2d'); g2.font = '300 16px Poppins, sans-serif';
    function wrap(t, w) { var o = [], cur2 = ''; t.split(/\s+/).forEach(function (wd) { var tr = cur2 ? cur2 + ' ' + wd : wd; if (g2.measureText(tr).width > w && cur2) { o.push(cur2); cur2 = wd; } else cur2 = tr; }); if (cur2) o.push(cur2); return o; }
    var colW = W - M * 2 - fw - 30; pins.forEach(function (p, k) { wrap(p.text, colW - 34).forEach(function (ln, j) { lines.push([j ? '' : String(k + 1), ln]); }); lines.push(['', '']); });
    if (r.n) { wrap('note: ' + r.n, colW).forEach(function (ln) { lines.push(['', ln]); }); }
    c.width = W; c.height = Math.max(110 + fh + 60, 130 + lines.length * 24 + 60); g2 = c.getContext('2d');
    g2.fillStyle = '#05090f'; g2.fillRect(0, 0, W, c.height); g2.fillStyle = INK; g2.font = '400 20px "Julius Sans One", Poppins, sans-serif'; try { g2.letterSpacing = '4px'; } catch (e) {} g2.fillText(L.film.toUpperCase().slice(0, 60), M, 46); try { g2.letterSpacing = '0px'; } catch (e) {}
    g2.fillStyle = 'rgba(232,228,220,.62)'; g2.font = '300 15px Poppins, sans-serif';
    g2.fillText('frame ' + L.frame + ' of ' + L.of + ' · ' + L.tc + (r.r === 1 ? ' · ♥' : r.r === -1 ? ' · not this one' : '') + (r.tags && r.tags.length ? ' · ' + r.tags.join(' · ') : '') + (GJ.picks && GJ.picks.code(L.id) && r.r === 1 ? ' · ' + GJ.picks.code(L.id) : ''), M, 72);
    g2.drawImage(tmp, M, 100, fw, fh);                                                   // the frame: exact pixels, only scaled
    g2.save(); g2.translate(M, 100); g2.shadowColor = 'rgba(3,5,11,.8)'; g2.shadowBlur = 4; strokesOn(g2, fw, fh, r.strokes || [], 2.4);   // the lines and pins, on this copy only
    pins.forEach(function (p, k) { var x = p.x * fw, y = p.y * fh; g2.fillStyle = INK; g2.beginPath(); g2.arc(x, y, 11, 0, 6.283); g2.fill(); g2.shadowBlur = 0; g2.fillStyle = '#05090f'; g2.font = '500 13px Poppins, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(String(k + 1), x, y + .5); g2.shadowBlur = 4; });
    g2.restore(); g2.textAlign = 'left'; g2.textBaseline = 'alphabetic';
    lines.forEach(function (ln, k) { var y = 122 + k * 24, x = M + fw + 30; if (ln[0]) { g2.fillStyle = INK; g2.font = '500 15px Poppins, sans-serif'; g2.fillText(ln[0], x, y); } g2.fillStyle = INK; g2.font = '300 16px Poppins, sans-serif'; g2.fillText(ln[1], x + 34, y); });
    g2.fillStyle = 'rgba(232,228,220,.5)'; g2.font = '300 12px Poppins, sans-serif'; g2.fillText('safelight · review markup · marks are drawn on this page only; the frame itself is unchanged', M, c.height - 22);
    return c;
  }
  function exportPdf() {
    var set = A.marked(); if (!set.length) { sayEl.textContent = 'nothing marked yet'; return Promise.resolve(null); }
    sayEl.textContent = 'making the pdf…';
    return Promise.all(set.map(function (i) { var c = page(i); return GJ.out.blobOf(c, 'image/jpeg', .9).then(GJ.out.bytes).then(function (jpg) { return { jpg: jpg, w: c.width, h: c.height }; }); })).then(function (pages) {
      var blob = GJ.out.pdf(pages); GJ.out.last = { name: 'review-markup.pdf', size: blob.size, pages: pages.length, blob: blob }; GJ.out.save(blob, 'review-markup.pdf'); sayEl.textContent = pages.length + (pages.length === 1 ? ' frame' : ' frames') + ' in the pdf'; GJ.haptic.commit(); return GJ.out.last;
    });
  }
  // MARKED, beside ♥ only: the frames with something said about them come forward
  var ctl = document.querySelector('#ar-ctl > div:last-child'); if (ctl) { var fb = document.createElement('button'); fb.dataset.f = 'marked'; fb.textContent = 'marked'; ctl.insertBefore(fb, ctl.querySelector('[data-pk]')); }
  GJ.markup = { on: setOn, isOn: function () { return on; }, page: page, exportPdf: exportPdf, TAGS: TAGS,
    pin: function (x, y, text) { var R = rec(); R.pins.push({ x: x, y: y, text: text, t: Date.now() }); put({ pins: R.pins }); paint(); }, line: function (pts) { var R = rec(); R.strokes.push(pts); put({ strokes: R.strokes }); paint(); },
    tag: function (t) { var R = rec(), k = R.tags.indexOf(t); if (k >= 0) R.tags.splice(k, 1); else R.tags.push(t); put({ tags: R.tags }); paint(); },
    state: function () { var R = rec(); return { on: on, frame: cur, pins: R.pins.length, strokes: R.strokes.length, tags: R.tags, shown: shownPin }; } };
})(window);
