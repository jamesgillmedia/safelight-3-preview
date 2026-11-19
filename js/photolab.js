/* tools-02 · Photo Lab (briefs/PHOTO-LAB.md; Gill, 18 Nov: batch three).
   The darkroom: stills laid out, looked at closely, hearted, put in an order. It is built on the Loupe room (which had
   been put away) and its seventeen public stills.
     · The shelf: prints rest in a row on a grey dusk shelf, each with a soft reflection under it. Drag along it, turn
       the dial (SHELF), run the rail, or tap the strip of small prints at the top to jump. The print in the middle is
       the one in hand: ♡ · hide · + sequence · open · original sit under it.
     · Open (tap the middle print, or spread two fingers on it): the Loupe — the print as large as it comes, the dial its
       zoom to full resolution. Out (pinch, or the Mark) is back to the shelf; out again leaves the lab.
     · Hide: a print you do not want steps off the shelf. It is never deleted — "n hidden · show" brings them back.
     · Sequence: + sequence adds the print in hand to the row at the foot. Tap one there to select it; ‹ › move it, ✕
       takes it out. PLAY runs the row as a slideshow in the Loupe (3 s a print; a tap stops it). PDF makes a sequence
       sheet, a page a print.
     · Original: saves the file itself — the same bytes, nothing re-made.
   The reflection is the room's (the same picture, mirrored and faded under the shelf line); the print itself is never
   tinted, filtered or re-made. Hearts, hidden prints and the sequence are kept in this browser (localStorage gj-lab).
   Not here yet (the brief): the wall (it is the archive, for film frames — WALL goes there), the lens's exposure aid
   (it would lighten a photo on screen: held back until Gill says the never-filtered rule allows it), your own stills
   on the shelf, Stills to Motion, a zine layout. Markup, Animate and the contact sheet are in the archive. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, clamp = GJ.clamp, S = G.GJ_SAMPLES || [], room = document.getElementById('r-loupe'); if (!room || !S.length || !GJ.rooms.loupe) return;
  var KEY = 'gj-lab', L = { fav: {}, hide: {}, seq: [], showHidden: false };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.seq) L = Object.assign(L, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {} }
  var el = document.createElement('div'); el.id = 'pl'; el.className = 'hit';
  el.innerHTML = '<div class="pl-strip" role="group" aria-label="every print: tap to go to it"></div><div class="pl-shelf"><div class="pl-track"></div><i class="pl-line"></i></div>' +
    '<p class="pl-name"></p><div class="pl-tools"><button data-a="fav" aria-label="favourite">♡</button><button data-a="hide">hide</button><button data-a="seq">+ sequence</button><button data-a="open">open</button><button data-a="orig">original</button></div><p class="pl-say"></p>' +
    '<div class="pl-seq"><div class="pl-row" role="list" aria-label="the sequence"></div><div class="pl-sa"><button data-a="sl" aria-label="earlier">‹</button><button data-a="sr" aria-label="later">›</button><button data-a="sx" aria-label="take out of the sequence">✕</button><button data-a="play">play</button><button data-a="pdf">pdf</button><button data-a="wall">wall</button></div></div>';
  room.appendChild(el);
  var cap = room.querySelector('#lp-cap'), sb = document.createElement('button'); sb.id = 'lp-shelf'; sb.textContent = 'shelf'; sb.setAttribute('aria-label', 'out to the shelf'); if (cap) cap.appendChild(sb);
  var q = function (s) { return el.querySelector(s); }, track = q('.pl-track'), strip = q('.pl-strip'), row = q('.pl-row'), say = q('.pl-say');
  var on = false, pos = 0, list = [], selSeq = -1, show = null, drag = null;
  function byId(id) { for (var i = 0; i < S.length; i++) if (S[i].id === id) return S[i]; return null; }
  function visible() { return S.filter(function (s) { return L.showHidden || !L.hide[s.id]; }); }
  function place(live, dx) {   // the print in hand sits in the middle of the shelf
    var w = q('.pl-shelf').getBoundingClientRect().width, f = track.firstChild, pw = f ? f.offsetWidth : 240, x = w / 2 - pw / 2 - pos * (pw + 26) + (dx || 0);
    track.style.transition = live || GJ.reduced() ? 'none' : ''; track.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    [].forEach.call(track.children, function (c, i) { c.classList.toggle('c', i === pos); }); [].forEach.call(strip.children, function (c, i) { c.classList.toggle('on', i === pos); });
  }
  function paintTools() {
    var s = list[pos]; if (!s) { q('.pl-name').textContent = ''; return; } var hid = Object.keys(L.hide).length;
    q('.pl-name').textContent = s.title + ' · ' + (pos + 1) + ' / ' + list.length; q('[data-a="fav"]').textContent = L.fav[s.id] ? '♥' : '♡'; q('[data-a="fav"]').classList.toggle('on', !!L.fav[s.id]); q('[data-a="hide"]').textContent = L.hide[s.id] ? 'unhide' : 'hide';
    q('[data-a="seq"]').textContent = L.seq.indexOf(s.id) >= 0 ? 'in sequence' : '+ sequence'; q('[data-a="seq"]').classList.toggle('on', L.seq.indexOf(s.id) >= 0);
    say.innerHTML = ''; var t = document.createElement('span'); t.textContent = 'tap the print to open it'; say.appendChild(t); if (hid) { var b = document.createElement('button'); b.dataset.a = 'hidden'; b.textContent = hid + ' hidden · ' + (L.showHidden ? 'put away' : 'show'); say.appendChild(b); }
  }
  function paintSeq() {
    row.innerHTML = ''; L.seq = L.seq.filter(byId); L.seq.forEach(function (id, i) { var s = byId(id), b = document.createElement('button'); b.className = 'pl-s' + (i === selSeq ? ' on' : ''); b.dataset.i = i; b.setAttribute('role', 'listitem'); b.setAttribute('aria-label', (i + 1) + ' · ' + s.title); var im = document.createElement('img'); im.src = s.file.replace('samples/', 'samples/t/'); im.alt = ''; im.draggable = false; b.appendChild(im); row.appendChild(b); });
    if (!L.seq.length) { var p = document.createElement('span'); p.textContent = 'the sequence is empty — + sequence adds the print in hand'; row.appendChild(p); }
    var has = selSeq >= 0 && selSeq < L.seq.length; q('[data-a="sl"]').disabled = q('[data-a="sr"]').disabled = q('[data-a="sx"]').disabled = !has; q('[data-a="play"]').disabled = q('[data-a="pdf"]').disabled = !L.seq.length;
  }
  function paint(keepId) {
    list = visible(); if (keepId) list.forEach(function (s, i) { if (s.id === keepId) pos = i; }); pos = clamp(pos, 0, Math.max(0, list.length - 1)); track.innerHTML = ''; strip.innerHTML = '';
    list.forEach(function (s, i) {
      var f = document.createElement('figure'); f.className = 'pl-p' + (L.hide[s.id] ? ' hid' : ''); f.dataset.i = i; var im = document.createElement('img'); im.className = 'pl-im'; im.src = s.file; im.alt = s.title; im.draggable = false; im.loading = 'lazy';
      var rf = document.createElement('img'); rf.className = 'pl-rf'; rf.src = s.file; rf.alt = ''; rf.setAttribute('aria-hidden', 'true'); rf.draggable = false; rf.loading = 'lazy'; f.appendChild(im); f.appendChild(rf); track.appendChild(f);
      var t = document.createElement('button'); t.dataset.i = i; t.setAttribute('aria-label', s.title); var ti = document.createElement('img'); ti.src = s.file.replace('samples/', 'samples/t/'); ti.alt = ''; ti.draggable = false; t.appendChild(ti); if (L.fav[s.id]) t.classList.add('fav'); strip.appendChild(t);
    });
    place(true); paintTools(); paintSeq(); if (GJ.rail.redraw) GJ.rail.redraw();
  }
  function go(i, live) { pos = clamp(Math.round(i), 0, Math.max(0, list.length - 1)); place(live); paintTools(); var t = strip.children[pos]; if (t && t.scrollIntoView) try { t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: GJ.reduced() ? 'auto' : 'smooth' }); } catch (e) {} if (GJ.dial.visible) GJ.dial.redraw(); if (GJ.rail.redraw) GJ.rail.redraw(); }
  var SHELF = { key: 'pl-shelf', label: 'SHELF', min: 0, max: 1, def: 0, span: 300, unit: .02, get: function () { return list.length > 1 ? pos / (list.length - 1) : 0; }, set: function (v) { var k = Math.round(clamp(v, 0, 1) * (list.length - 1)); if (k !== pos) { go(k); GJ.haptic.tick(); } }, fmt: function () { return (pos + 1) + ' / ' + list.length; }, hold: function (d) { if (d) openPrint(); } };
  function RAIL() { return { stops: list.map(function (s) { return { label: s.title.split(' · ').pop() }; }), label: function (i) { return list[i] ? list[i].title.split(' · ').pop() : ''; }, get: function () { return pos; }, go: function (i) { go(i); }, scrub: function (f) { var k = Math.round(f); if (k !== pos) { go(k, true); GJ.haptic.tick(); } }, rest: function () { place(false); } }; }
  function openShelf() { if (on) return; on = true; stopShow(); var id = GJ.store.get().photo; html.classList.add('shelving'); paint(L.hide[id] && !L.showHidden ? null : id); GJ.rail.config(RAIL()); GJ.dial.config([SHELF, GJ.skyRings.atmos]); if (GJ.mark && GJ.mark.say) GJ.mark.say('the shelf · drag along it · tap the print in the middle to open it', 2400); }
  function closeShelf(quiet) { if (!on) return; on = false; html.classList.remove('shelving'); if (!quiet && GJ.app.room === 'loupe') { GJ.rail.config(GJ.rooms.loupe.rail()); GJ.dial.config(GJ.rooms.loupe.rings()); } }
  function openPrint(id) { var s = id ? byId(id) : list[pos]; if (!s) return; GJ.store.set({ photo: s.id }); GJ.rooms.loupe.enter(); closeShelf(); GJ.haptic.commit(); }
  function stopShow() { if (!show) return false; clearInterval(show.iv); show = null; html.classList.remove('pl-show'); return true; }
  function playSeq(ms) {   // the row as a slideshow, in the Loupe
    if (!L.seq.length) return; closeShelf(); stopShow(); show = { k: 0 }; html.classList.add('pl-show'); var stepTo = function () { var s = byId(L.seq[show.k % L.seq.length]); GJ.store.set({ photo: s.id }); GJ.rooms.loupe.enter(); if (GJ.mark && GJ.mark.say) GJ.mark.say('sequence · ' + (show.k % L.seq.length + 1) + ' / ' + L.seq.length + ' · tap to stop', (ms || 3000) - 200); };
    stepTo(); show.iv = setInterval(function () { if (GJ.app.room !== 'loupe') { stopShow(); return; } show.k++; stepTo(); }, ms || 3000);
  }
  function loadImg(src) { return new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = src; }); }
  function seqPdf() {   // a page a print: the picture whole, its title and its place in the row under it
    return L.seq.reduce(function (p, id, i) { return p.then(function (pages) { var s = byId(id); return loadImg(s.file).then(function (im) {
      var c = document.createElement('canvas'), W = 1240, M = 60, w = W - 2 * M, h = Math.round(w * im.naturalHeight / im.naturalWidth); c.width = W; c.height = h + 2 * M + 70; var g = c.getContext('2d'); g.fillStyle = '#05090f'; g.fillRect(0, 0, W, c.height); g.imageSmoothingQuality = 'high'; g.drawImage(im, M, M, w, h);
      g.fillStyle = '#e8e4dc'; g.font = '400 20px Poppins, sans-serif'; g.fillText((i + 1) + ' / ' + L.seq.length, M, M + h + 44); g.textAlign = 'right'; g.fillStyle = 'rgba(232,228,220,.7)'; g.font = '300 18px Poppins, sans-serif'; g.fillText(s.title, W - M, M + h + 44);
      return GJ.out.blobOf(c, 'image/jpeg', .92).then(GJ.out.bytes).then(function (j) { pages.push({ jpg: j, w: c.width, h: c.height }); return pages; }); }); }); }, Promise.resolve([])).then(function (pages) { var b = GJ.out.pdf(pages); GJ.out.last = { name: 'sequence.pdf', size: b.size, pages: pages.length, blob: b }; GJ.out.save(b, 'sequence.pdf'); return GJ.out.last; });
  }
  function original(id) { var s = byId(id || (list[pos] && list[pos].id)); if (!s) return Promise.reject(new Error('no print')); return fetch(s.file).then(function (r) { return r.blob(); }).then(function (b) { var name = s.file.split('/').pop(); GJ.out.last = { name: name, size: b.size, blob: b }; GJ.out.save(b, name); return GJ.out.last; }); }
  function toWall() { closeShelf(true); if (GJ.app.room) GJ.app.back(); setTimeout(function () { GJ.app.enter('archive'); }, 60); }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a, s = list[pos];
    if (b.parentNode === strip) { go(+b.dataset.i); return; }
    if (b.classList.contains('pl-s')) { selSeq = selSeq === +b.dataset.i ? -1 : +b.dataset.i; paintSeq(); return; }
    if (a === 'fav' && s) { if (L.fav[s.id]) delete L.fav[s.id]; else L.fav[s.id] = 1; save(); paint(s.id); GJ.haptic.tick(); }
    else if (a === 'hide' && s) { if (L.hide[s.id]) delete L.hide[s.id]; else L.hide[s.id] = 1; if (!Object.keys(L.hide).length) L.showHidden = false; save(); paint(L.showHidden ? s.id : null); GJ.rail.config(RAIL()); GJ.haptic.tick(); }
    else if (a === 'hidden') { L.showHidden = !L.showHidden; save(); paint(s && s.id); GJ.rail.config(RAIL()); }
    else if (a === 'seq' && s) { var k = L.seq.indexOf(s.id); if (k >= 0) L.seq.splice(k, 1); else L.seq.push(s.id); selSeq = -1; save(); paintTools(); paintSeq(); GJ.haptic.tick(); }
    else if (a === 'open') openPrint();
    else if (a === 'orig') original().then(function (o) { say.firstChild.textContent = 'saved · ' + o.name + ' — the file itself, byte for byte'; }).catch(function () { say.firstChild.textContent = 'the original could not be saved from here'; });
    else if (a === 'sl' || a === 'sr') { var to = selSeq + (a === 'sl' ? -1 : 1); if (selSeq >= 0 && to >= 0 && to < L.seq.length) { var m = L.seq.splice(selSeq, 1)[0]; L.seq.splice(to, 0, m); selSeq = to; save(); paintSeq(); } }
    else if (a === 'sx' && selSeq >= 0) { L.seq.splice(selSeq, 1); selSeq = -1; save(); paintSeq(); paintTools(); }
    else if (a === 'play') playSeq(); else if (a === 'wall') toWall();
    else if (a === 'pdf') seqPdf().then(function (o) { say.firstChild.textContent = 'saved · sequence.pdf · ' + o.pages + (o.pages === 1 ? ' page' : ' pages'); }).catch(function () { say.firstChild.textContent = 'the pdf could not be made from here'; });
  });
  // the shelf itself: drag along it · tap the middle print = open · tap another = bring it to hand · two fingers spreading on it = open
  var sh = q('.pl-shelf');
  sh.addEventListener('pointerdown', function (e) { if (drag) { drag.two = true; drag.d0 = Math.hypot(e.clientX - drag.x, e.clientY - drag.y); return; } try { sh.setPointerCapture(e.pointerId); } catch (x) {} drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, tgt: e.target.closest('.pl-p') }; });
  sh.addEventListener('pointermove', function (e) {
    if (!drag) return; if (drag.two) { if (e.pointerId !== drag.id && drag.d0 && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > drag.d0 * 1.35) { drag = null; openPrint(); } return; }
    var dx = e.clientX - drag.x; if (!drag.moved && Math.abs(dx) < 8) return; drag.moved = true; place(true, dx);
  });
  function up(e) { if (!drag) return; var d = drag; drag = null; if (d.two) { place(false); return; } var dx = e.clientX - d.x; if (d.moved) { var f = track.firstChild, pw = f ? f.offsetWidth + 26 : 260; go(pos - Math.round(dx / pw + (Math.abs(dx) > 40 ? Math.sign(dx) * .3 : 0))); return; } if (d.tgt) { var i = +d.tgt.dataset.i; if (i === pos) openPrint(); else go(i); } }
  sh.addEventListener('pointerup', up); sh.addEventListener('pointercancel', function () { drag = null; place(false); });
  sb.addEventListener('click', function (e) { e.stopPropagation(); openShelf(); });
  // in the Loupe any touch stops a slideshow. (Two fingers closing — out to the shelf — is the app's own pinch: it rises one level, and this room's levels are below.)
  var view = room.querySelector('#lp-view'); if (view) view.addEventListener('pointerdown', function () { stopShow(); }, true);
  // out, one level at a time: a slideshow stops · the Loupe → the shelf · the shelf → out of the lab
  var R = GJ.rooms.loupe, leave0 = R.leave; R.title = 'photo lab';
  R.back = function () { if (stopShow()) return true; if (!on) { openShelf(); return true; } return false; };
  R.leave = function () { stopShow(); closeShelf(true); if (leave0) leave0(); };
  function open() { if (GJ.app.room !== 'loupe') { GJ.app.enter('loupe'); setTimeout(function () { if (GJ.app.room === 'loupe') openShelf(); }, 700); } else openShelf(); }
  G.addEventListener('resize', function () { if (on) place(true); });
  GJ.lab = { open: open, shelf: openShelf, closeShelf: closeShelf, isShelf: function () { return on; }, go: go, openPrint: openPrint, play: playSeq, stop: stopShow, pdf: seqPdf, original: original,
    fav: function (id, v) { if (v) L.fav[id] = 1; else delete L.fav[id]; save(); if (on) paint(list[pos] && list[pos].id); }, hide: function (id, v) { if (v) L.hide[id] = 1; else delete L.hide[id]; save(); if (on) { paint(); GJ.rail.config(RAIL()); } },
    seq: function (a) { if (a) { L.seq = a.slice(); save(); if (on) { paintSeq(); paintTools(); } } return L.seq.slice(); },
    state: function () { return { shelf: on, pos: pos, n: list.length, id: list[pos] ? list[pos].id : null, fav: Object.keys(L.fav), hidden: Object.keys(L.hide), showHidden: L.showHidden, seq: L.seq.slice(), sel: selSeq, showing: show ? show.k : null }; } };
})(window);
