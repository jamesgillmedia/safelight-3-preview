/* tools-02 · the Picks Board (briefs/PICKS-BOARD.md; Gill, 18 Nov: batch two).
   A shortlist of favourites to compare, order and act on. A heart on any frame (one tap, in the open frame) puts it on
   the board; nothing is copied or changed — a pick is a reference to the frame.
     · Labels: each pick gets a short code — P1, P2, … — the first time it is hearted. Codes never move and are never
       reused: reorder the board, take a pick off and put it back, and it is still P4.
     · Arrange: hold a pick, then drag it to a new place (or select it and use ‹ ›). It reads like a contact sheet.
       A one-line note under any pick. Lock a pick as chosen (★).
     · Compare: select 2–4 and see them together, full screen.
     · Act: send 2–4 to a decision sheet · play the board in the Archive Player · open a pick to step through its film ·
       save the board as a contact sheet (PNG).
   Kept in this browser (localStorage gj-picks: codes, order, notes, chosen); the hearts themselves are the archive's
   review marks (gj-review), so the ♥ filter, the open frame and this board always agree.
   Not here yet (the brief): named boards beside the default one, hearts on songs / people / scans, shared boards. */
(function (G) {
  'use strict';
  var GJ = G.GJ, A = GJ.archive, html = document.documentElement; if (!A) return;
  var KEY = 'gj-picks', P = { seq: 0, codes: {}, order: [], notes: {}, chosen: {} };
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.codes) P = Object.assign(P, s0); } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  // the board is the hearts, in the board's own order; a new heart goes on the end and takes the next code
  function sync() {
    var ids = A.hearts().map(function (i) { return A.frames[i].id; }), have = {}, ch = false;
    ids.forEach(function (id) { have[id] = 1; if (!P.codes[id]) { P.codes[id] = 'P' + (++P.seq); ch = true; } if (P.order.indexOf(id) < 0) { P.order.push(id); ch = true; } });
    var o2 = P.order.filter(function (id) { return have[id]; }); if (o2.length !== P.order.length) { P.order = o2; ch = true; }
    if (ch) save(); return P.order.slice();
  }
  function items() { return sync().map(function (id) { return { id: id, i: A.indexOf(id), code: P.codes[id], note: P.notes[id] || '', chosen: !!P.chosen[id] }; }); }

  var el = document.createElement('section'); el.id = 'picks'; el.className = 'gpanel'; el.setAttribute('aria-label', 'picks board');
  el.innerHTML = '<b class="jul">picks</b><p class="gp-say"></p><div class="pk-grid" role="list"></div>' +
    '<div class="pk-sel"><button data-a="left" aria-label="move earlier">‹</button><button data-a="right" aria-label="move later">›</button><button data-a="chosen">chosen</button><button data-a="note">note</button><button data-a="open">open</button><button data-a="off">take off</button></div>' +
    '<input class="pk-note" type="text" maxlength="80" placeholder="a line about this pick" hidden>' +
    '<div class="gp-act"><button data-a="compare" disabled>compare</button><button data-a="decide" disabled>decide</button><button data-a="play">play</button><button data-a="sheet">save</button><button data-a="close">close</button></div>';
  document.body.appendChild(el);
  var cmp = document.createElement('div'); cmp.id = 'picks-cmp'; cmp.setAttribute('aria-label', 'compare picks: tap to close'); document.body.appendChild(cmp);
  var q = function (s) { return el.querySelector(s); }, grid = q('.pk-grid'), say = q('.gp-say'), noteIn = q('.pk-note');
  var sel = [], tiles = {};
  function thumb(i, w) { var c = document.createElement('canvas'); c.className = 'pk-im'; var t = A.drawFrame(i, c, w); if (t !== 2) { var n = 0, iv = setInterval(function () { if (A.drawFrame(i, c, w) === 2 || ++n > 40) clearInterval(iv); }, 200); } return c; }
  function paint() {
    var its = items(); sel = sel.filter(function (id) { return its.some(function (x) { return x.id === id; }); });
    grid.innerHTML = ''; tiles = {};
    its.forEach(function (it) {
      var t = document.createElement('div'); t.className = 'pk' + (sel.indexOf(it.id) >= 0 ? ' on' : '') + (it.chosen ? ' chosen' : ''); t.setAttribute('role', 'listitem'); t.dataset.id = it.id;
      var L = A.label(it.i); t.appendChild(thumb(it.i, 320));
      var cap = document.createElement('span'); cap.className = 'pk-cap'; cap.innerHTML = '<b>' + it.code + (it.chosen ? ' ★' : '') + '</b><i></i><em></em>'; cap.children[1].textContent = L.film.split(' · ').pop() + ' · ' + L.frame; cap.children[2].textContent = it.note; t.appendChild(cap);
      grid.appendChild(t); tiles[it.id] = t;
    });
    say.textContent = its.length ? its.length + (its.length === 1 ? ' pick' : ' picks') + ' · tap to select · hold and drag to order' : 'no picks yet — open a frame in the archive and tap its ♡';
    var n = sel.length; q('.pk-sel').classList.toggle('on', n === 1); if (n !== 1) noteIn.hidden = true;
    q('[data-a="compare"]').disabled = n < 2 || n > 4; q('[data-a="decide"]').disabled = n < 2 || n > 4; q('[data-a="play"]').disabled = !its.length; q('[data-a="sheet"]').disabled = !its.length;
    if (n === 1) q('[data-a="chosen"]').classList.toggle('on', !!P.chosen[sel[0]]);
  }
  function open() { A.loadAll(); paint(); html.classList.add('picking'); GJ.haptic.tick(); }
  function close() { html.classList.remove('picking'); cmp.classList.remove('on'); }
  function move(id, to) { var o = P.order, a = o.indexOf(id); if (a < 0) return; to = Math.max(0, Math.min(o.length - 1, to)); if (to === a) return; o.splice(a, 1); o.splice(to, 0, id); save(); paint(); GJ.haptic.tick(); }
  function compare(v) {
    if (v === false) { cmp.classList.remove('on'); return; }
    if (sel.length < 2 || sel.length > 4) return; cmp.innerHTML = ''; cmp.className = 'n' + sel.length;
    P.order.filter(function (id) { return sel.indexOf(id) >= 0; }).forEach(function (id) { var f = document.createElement('figure'), i = A.indexOf(id), c = thumb(i, 480), cap = document.createElement('figcaption'); cap.textContent = P.codes[id] + (P.chosen[id] ? ' ★' : '') + (P.notes[id] ? ' · ' + P.notes[id] : ''); f.appendChild(c); f.appendChild(cap); cmp.appendChild(f); });
    cmp.classList.add('on'); GJ.haptic.commit();
  }
  cmp.addEventListener('click', function () { cmp.classList.remove('on'); });
  function contactSheet() {   // the board as one picture: codes, where each is from, its note
    var its = items(), cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(its.length)))), M = 40, gap = 18, W = 1240, cw = (W - 2 * M - (cols - 1) * gap) / cols, asp = its.length ? A.label(its[0].i).aspect : .5625, ch = cw * asp, rowH = ch + 62, rows = Math.ceil(its.length / cols);
    var c = document.createElement('canvas'); c.width = W; c.height = Math.round(96 + rows * rowH + 40); var g = c.getContext('2d'), tmp = document.createElement('canvas');
    g.fillStyle = '#05090f'; g.fillRect(0, 0, W, c.height); g.fillStyle = '#e8e4dc'; g.font = '400 22px "Julius Sans One", Poppins, sans-serif'; try { g.letterSpacing = '5px'; } catch (e) {} g.fillText('PICKS', M, 46); try { g.letterSpacing = '0px'; } catch (e) {}
    g.fillStyle = 'rgba(232,228,220,.62)'; g.font = '300 15px Poppins, sans-serif'; g.fillText(its.length + ' picks · ' + new Date().toISOString().slice(0, 10) + ' · frames are exact pixels from the archive, only scaled', M, 72);
    its.forEach(function (it, k) { var x = M + (k % cols) * (cw + gap), y = 96 + Math.floor(k / cols) * rowH, L = A.label(it.i); A.drawFrame(it.i, tmp, 480); g.drawImage(tmp, x, y, cw, cw * tmp.height / tmp.width);
      g.fillStyle = '#e8e4dc'; g.font = '400 16px Poppins, sans-serif'; g.fillText(it.code + (it.chosen ? ' ★' : ''), x, y + ch + 22); g.fillStyle = 'rgba(232,228,220,.62)'; g.font = '300 13px Poppins, sans-serif'; g.textAlign = 'right'; g.fillText(L.film.split(' · ').pop() + ' · frame ' + L.frame + ' · ' + L.tc, x + cw, y + ch + 22); g.textAlign = 'left';
      if (it.note) { g.fillStyle = '#e8e4dc'; g.fillText(it.note.slice(0, 60), x, y + ch + 44); } });
    return c;
  }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a, id = sel[0];
    if (a === 'close') close();
    else if (a === 'left' && id) move(id, P.order.indexOf(id) - 1);
    else if (a === 'right' && id) move(id, P.order.indexOf(id) + 1);
    else if (a === 'chosen' && id) { if (P.chosen[id]) delete P.chosen[id]; else P.chosen[id] = 1; save(); paint(); GJ.haptic.commit(); }
    else if (a === 'note' && id) { noteIn.hidden = !noteIn.hidden; if (!noteIn.hidden) { noteIn.value = P.notes[id] || ''; noteIn.focus(); } }
    else if (a === 'open' && id) { var i = A.indexOf(id); close(); if (GJ.app.room !== 'archive') GJ.app.enter('archive'); setTimeout(function () { A.open(i); }, GJ.app.room === 'archive' ? 0 : 900); }
    else if (a === 'off' && id) { A.setReview(A.indexOf(id), { r: 0 }); sel = []; paint(); GJ.haptic.tick(); }
    else if (a === 'compare') compare();
    else if (a === 'decide' && GJ.decide) { var ids = P.order.filter(function (x) { return sel.indexOf(x) >= 0; }); close(); GJ.decide.ask(ids); }
    else if (a === 'play' && GJ.aplayer) { var set = items().map(function (x) { return x.i; }); close(); GJ.aplayer.play(set, 'picks'); }
    else if (a === 'sheet') GJ.out.blobOf(contactSheet(), 'image/png').then(function (bl) { GJ.out.last = { name: 'picks.png', size: bl.size }; GJ.out.save(bl, 'picks.png'); say.textContent = 'saved · picks.png — a contact sheet of the board'; }).catch(function () { say.textContent = 'the sheet could not be saved from here'; });
  });
  noteIn.addEventListener('input', function () { var id = sel[0]; if (!id) return; var v = noteIn.value.trim(); if (v) P.notes[id] = v; else delete P.notes[id]; save(); var t = tiles[id]; if (t) t.querySelector('em').textContent = v; });
  noteIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { noteIn.hidden = true; noteIn.blur(); } });
  // tap = select (up to four) · double-tap = open it · hold, then drag = a new place on the board
  var drag = null, lastTap = { id: null, t: 0 };
  function real(k) { for (var n = 0; n < P.order.length; n++) if (String(P.order[n]) === String(k)) return P.order[n]; return null; }   // a tile's id as the board holds it (a frame's id is a number; the page only keeps text)
  function tileAt(x, y) { var best = null; Object.keys(tiles).forEach(function (id) { var r = tiles[id].getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) best = real(id); }); return best; }
  grid.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('.pk'); if (!t) return; var id = real(t.dataset.id);
    drag = { id: id, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId, moved: false };
    drag.t = setTimeout(function () { if (!drag || drag.moved) return; drag.on = true; t.classList.add('drag'); try { grid.setPointerCapture(drag.pid); } catch (x) {} GJ.haptic.commit(); }, 320);
  });
  grid.addEventListener('pointermove', function (e) {
    if (!drag) return; if (!drag.on) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10) { drag.moved = true; clearTimeout(drag.t); } return; }
    var over = tileAt(e.clientX, e.clientY); if (over && over !== drag.id) { var to = P.order.indexOf(over); P.order.splice(P.order.indexOf(drag.id), 1); P.order.splice(to, 0, drag.id); save(); paint(); tiles[drag.id].classList.add('drag'); GJ.haptic.tick(); }
  });
  grid.addEventListener('touchmove', function (e) { if (drag && drag.on) e.preventDefault(); }, { passive: false });
  function up(e) {
    if (!drag) return; var d = drag; drag = null; clearTimeout(d.t);
    if (d.on) { paint(); return; } if (d.moved) return;
    var now = GJ.now();
    if (lastTap.id === d.id && now - lastTap.t < 320) { lastTap.t = 0; sel = [d.id]; paint(); q('[data-a="open"]').click(); return; }
    lastTap = { id: d.id, t: now };
    var k = sel.indexOf(d.id); if (k >= 0) sel.splice(k, 1); else { if (sel.length >= 4) sel.shift(); sel.push(d.id); } paint(); GJ.haptic.tick();
  }
  grid.addEventListener('pointerup', up); grid.addEventListener('pointercancel', function () { if (drag) clearTimeout(drag.t); drag = null; paint(); });
  // the archive's control row gets a way in; the board follows the hearts wherever they are set
  var ctl = document.querySelector('#ar-ctl > div:last-child'); if (ctl) { var pb = document.createElement('button'); pb.dataset.pk = '1'; pb.textContent = 'picks'; pb.addEventListener('click', function (e) { e.stopPropagation(); open(); }); ctl.appendChild(pb); }
  A.onReview = function () { if (html.classList.contains('picking')) paint(); else sync(); };
  sync();
  GJ.picks = { open: open, close: close, items: items, code: function (id) { return P.codes[id] || null; }, move: move, isOpen: function () { return html.classList.contains('picking'); },
    select: function (ids) { sel = ids.slice(0, 4); paint(); }, selected: function () { return sel.slice(); }, compare: compare, comparing: function () { return cmp.classList.contains('on'); },
    setNote: function (id, v) { if (v) P.notes[id] = v; else delete P.notes[id]; save(); if (html.classList.contains('picking')) paint(); }, setChosen: function (id, v) { if (v) P.chosen[id] = 1; else delete P.chosen[id]; save(); if (html.classList.contains('picking')) paint(); },
    chosen: function (id) { return !!P.chosen[id]; }, sheet: contactSheet };
})(window);
