/* oz Notes (catch-up, 23 Nov 2026; built on the 17 Nov pad). As familiar as Apple Notes: a list of notes, newest first,
   in folders; search at the top; swipe a note left to pin, move or delete it; the pencil starts a new one. Opening Notes
   lands you in a fresh note with the keyboard up, so typing is instant; back shows the list, back again leaves.
   An empty note is never kept. Everything saves as you type, on this phone (GJ.settings · gj-notes, as before), and
   nothing leaves unless you share a note yourself.
     GJ.notes.open() · close() · isOpen() · add(text) · attach(text) · latest() · all() */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, FKEY = 'gj-notes-folders', OKEY = 'gj-notes-open';
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var N = []; try { N = JSON.parse(GJ.settings.getItem('gj-notes') || '[]') || []; } catch (e) {}
  var FD = ['notes']; try { FD = JSON.parse(GJ.settings.getItem(FKEY) || '["notes"]') || ['notes']; } catch (e) {}
  function persist() { N = N.filter(function (n) { return (n.text || '').trim() || n === cur; }); try { GJ.settings.setItem('gj-notes', JSON.stringify(N.filter(function (n) { return (n.text || '').trim(); }))); GJ.settings.setItem(FKEY, JSON.stringify(FD)); } catch (e) {} }
  function title(n) { var t = (n.text || '').trim().split('\n')[0]; return t ? t.slice(0, 60) : 'new note'; }
  function preview(n) { var L = (n.text || '').trim().split('\n'); return (L[1] || '').trim().slice(0, 80) || 'no more text'; }
  function day(ms) { var d = new Date(ms), n = new Date(); return d.toDateString() === n.toDateString() ? d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase() : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }
  function stamp(ms) { var d = new Date(ms); return d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function sorted(L) { return L.slice().sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.t - a.t; }); }

  var el = document.createElement('section'); el.id = 'notes'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'notes'); el.hidden = true;
  el.innerHTML =
    '<div class="nt-list-v">' +
      '<div class="nt-find"><input type="search" class="nt-q" placeholder="search" aria-label="search notes" autocomplete="off"></div>' +
      '<div class="nt-folders" role="tablist" aria-label="folders"></div>' +
      '<div class="nt-rows" role="list"></div>' +
      '<div class="nt-foot"><span class="nt-count"></span><button type="button" class="nt-new" aria-label="new note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19.4l1-4.2L16.2 5a1.6 1.6 0 0 1 2.3 0l.5.5a1.6 1.6 0 0 1 0 2.3L8.8 18l-3.8 1.4zM14.6 6.6l2.8 2.8"/></svg></button></div>' +
    '</div>' +
    '<div class="nt-edit-v" hidden>' +
      '<div class="nt-bar"><span class="nt-when"></span><button type="button" class="nt-done">done</button></div>' +
      '<textarea class="nt-text" placeholder="start typing" spellcheck="true" aria-label="note"></textarea>' +
    '</div>' +
    '<div class="nt-sheet" hidden></div>';
  document.body.appendChild(el);
  var listV = el.querySelector('.nt-list-v'), editV = el.querySelector('.nt-edit-v'), rows = el.querySelector('.nt-rows'), folders = el.querySelector('.nt-folders'),
    q = el.querySelector('.nt-q'), ta = el.querySelector('.nt-text'), when = el.querySelector('.nt-when'), sheet = el.querySelector('.nt-sheet');
  var on = false, cur = null, folder = 'all', find = '', saveT = 0;

  function paintFolders() {
    var all = [['all', 'all notes']].concat(FD.map(function (f) { return [f, f]; }));
    folders.innerHTML = all.map(function (f) { var c = f[0] === folder; return '<button type="button" role="tab" aria-selected="' + c + '" class="' + (c ? 'on' : '') + '" data-f="' + esc(f[0]) + '">' + esc(f[1]) + '</button>'; }).join('') +
      '<button type="button" class="nt-addf" data-a="newfolder" aria-label="new folder">+ folder</button>';
  }
  function visible() { var t = find.toLowerCase(); return sorted(N.filter(function (n) { return (n.text || '').trim() && (folder === 'all' || (n.f || 'notes') === folder) && (!t || n.text.toLowerCase().indexOf(t) >= 0); })); }
  function paintList() {
    paintFolders(); var L = visible();
    rows.innerHTML = L.length ? L.map(function (n) {
      return '<div class="nt-row" role="listitem" data-id="' + n.id + '"><div class="nt-acts" aria-hidden="true"><button type="button" data-act="pin" tabindex="-1">' + (n.pin ? 'unpin' : 'pin') + '</button><button type="button" data-act="move" tabindex="-1">move</button><button type="button" data-act="del" tabindex="-1">delete</button></div>' +
        '<button type="button" class="nt-open" data-open="' + n.id + '" aria-label="' + esc(title(n)) + (n.pin ? ' · pinned' : '') + ' · ' + day(n.t) + '"><b>' + (n.pin ? '<i aria-hidden="true">·</i> ' : '') + esc(title(n)) + '</b><span><em>' + day(n.t) + '</em> ' + esc(preview(n)) + '</span></button></div>';
    }).join('') : '<p class="nt-none">' + (find ? 'no notes with “' + esc(find) + '”' : 'no notes here yet · the pencil starts one') + '</p>';
    var c = L.length; el.querySelector('.nt-count').textContent = c + (c === 1 ? ' note' : ' notes');
  }
  function edit(n, fresh) {
    cur = n; ta.value = n.text || ''; when.textContent = fresh ? 'new note' : stamp(n.t);
    listV.hidden = true; editV.hidden = false; requestAnimationFrame(function () { ta.focus({ preventScroll: true }); if (!fresh) { ta.setSelectionRange(ta.value.length, ta.value.length); } });
  }
  function newNote() { var n = { id: Date.now(), t: Date.now(), text: '', f: folder === 'all' ? 'notes' : folder }; N.unshift(n); edit(n, true); hap('tick'); }
  function toList() { ta.blur(); persist(); cur = null; editV.hidden = true; listV.hidden = false; paintList(); }
  ta.addEventListener('input', function () { if (!cur) return; cur.text = ta.value; cur.t = Date.now(); when.textContent = stamp(cur.t); clearTimeout(saveT); saveT = setTimeout(persist, 300); });

  /* swipe a note left: pin · move · delete (the familiar row actions) */
  var sw = null;
  function shut(except) { Array.prototype.forEach.call(rows.querySelectorAll('.nt-row.open'), function (r) { if (r !== except) { r.classList.remove('open'); r.querySelector('.nt-open').style.transform = ''; } }); }
  rows.addEventListener('pointerdown', function (e) { var b = e.target.closest('.nt-open'); if (!b) return; sw = { r: b.parentNode, b: b, x: e.clientX, y: e.clientY, dx: 0, go: false, base: b.parentNode.classList.contains('open') ? -192 : 0 }; });
  rows.addEventListener('pointermove', function (e) {
    if (!sw) return; var dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (!sw.go) { if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3) { sw.go = true; shut(sw.r); sw.b.style.transition = 'none'; try { sw.b.setPointerCapture(e.pointerId); } catch (x) {} } else if (Math.abs(dy) > 10) { sw = null; return; } else return; }
    sw.dx = dx; sw.b.style.transform = 'translateX(' + Math.max(-220, Math.min(0, sw.base + dx)) + 'px)';
  });
  function swEnd() { if (!sw) return; var s = sw; sw = null; if (!s.go) return; s.b.style.transition = ''; var open = s.base + s.dx < -70; s.r.classList.toggle('open', open); s.b.style.transform = open ? 'translateX(-192px)' : ''; s.r.dataset.ate = '1'; setTimeout(function () { delete s.r.dataset.ate; }, 60); hap('tick'); }
  rows.addEventListener('pointerup', swEnd); rows.addEventListener('pointercancel', swEnd);

  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { shut(); return; } e.stopPropagation();
    var row = b.closest('.nt-row'); if (row && row.dataset.ate) return;
    if (b.dataset.open) { if (row.classList.contains('open')) { shut(); return; } var n = N.filter(function (x) { return String(x.id) === b.dataset.open; })[0]; if (n) edit(n, false); hap('tick'); return; }
    if (b.dataset.act) { var m = N.filter(function (x) { return String(x.id) === row.dataset.id; })[0]; if (!m) return;
      if (b.dataset.act === 'pin') { m.pin = !m.pin; persist(); paintList(); }
      if (b.dataset.act === 'del') { N = N.filter(function (x) { return x !== m; }); persist(); paintList(); }
      if (b.dataset.act === 'move') moveSheet(m);
      hap('commit'); return; }
    if (b.dataset.f) { folder = b.dataset.f; shut(); paintList(); hap('tick'); return; }
    if (b.dataset.a === 'newfolder') { folderSheet(); return; }
    if (b.classList.contains('nt-new')) { newNote(); return; }
    if (b.classList.contains('nt-back')) { toList(); hap('tick'); return; }
    if (b.classList.contains('nt-done')) { ta.blur(); persist(); hap('tick'); return; }
    if (b.dataset.to != null) { var mv = N.filter(function (x) { return String(x.id) === sheet.dataset.id; })[0]; if (mv) { mv.f = b.dataset.to; persist(); } closeSheet(); paintList(); return; }
    if (b.dataset.s === 'x') { closeSheet(); return; }
    if (b.dataset.s === 'mkf') { var v = sheet.querySelector('input').value.trim().toLowerCase(); if (v && FD.indexOf(v) < 0) { FD.push(v); persist(); folder = v; } closeSheet(); paintList(); return; }
  });
  function openSheet(h, id) { sheet.innerHTML = h; sheet.dataset.id = id || ''; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); var f = sheet.querySelector('input, button'); if (f) f.focus(); }); }
  function closeSheet() { sheet.classList.remove('in'); setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260); }
  function moveSheet(n) { openSheet('<h3 class="jul">move to</h3>' + FD.map(function (f) { return '<button type="button" class="nt-wide' + ((n.f || 'notes') === f ? ' on' : '') + '" data-to="' + esc(f) + '">' + esc(f) + '</button>'; }).join('') + '<button type="button" class="nt-wide nt-soft" data-s="x">cancel</button>', n.id); }
  function folderSheet() { openSheet('<h3 class="jul">new folder</h3><input class="nt-fin" aria-label="folder name" placeholder="name" autocomplete="off"><button type="button" class="nt-wide" data-s="mkf">add</button><button type="button" class="nt-wide nt-soft" data-s="x">cancel</button>'); }
  q.addEventListener('input', function () { find = q.value.trim(); paintList(); });
  sheet.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('nt-fin')) { e.preventDefault(); sheet.querySelector('[data-s=mkf]').click(); } });

  function open() {
    if (on) return; on = true; folder = 'all'; find = ''; q.value = ''; el.hidden = false; html.classList.add('noting'); requestAnimationFrame(function () { el.classList.add('in'); });
    if (GJ.settings.getItem(OKEY) === 'list') { editV.hidden = true; listV.hidden = false; paintList(); } else newNote();   // Tune: Notes opens on a new note (default) or on the list
    hap('commit');
  }
  function close() { if (!on) return; on = false; ta.blur(); persist(); cur = null; closeSheet(); el.classList.remove('in'); html.classList.remove('noting'); setTimeout(function () { if (!on) { el.hidden = true; editV.hidden = true; listV.hidden = false; } }, 380); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () {   // back: a sheet, then the search, then the note → the list, then out
    if (on) { if (!sheet.hidden) { closeSheet(); return true; } if (!editV.hidden) { toList(); return true; } if (find) { q.value = ''; find = ''; paintList(); return true; } if (rows.querySelector('.nt-row.open')) { shut(); return true; } close(); return true; }
    return ca0.apply(this, arguments); }; }
  function add(text) { var n = { id: Date.now(), t: Date.now(), text: String(text || ''), f: 'notes' }; N.unshift(n); persist(); if (on && !listV.hidden) paintList(); return n.id; }   // a line saved here from elsewhere (Messages)
  function attach(text) { var n = sorted(N.filter(function (x) { return (x.text || '').trim(); }))[0]; if (!n) return add(text); n.text = n.text.replace(/\s+$/, '') + '\n' + String(text || ''); n.t = Date.now(); persist(); return n.id; }   // a line added to the latest note (the camera)
  GJ.notes = { open: open, close: close, add: add, attach: attach, latest: function () { var n = sorted(N.filter(function (x) { return (x.text || '').trim(); }))[0]; return n ? { id: n.id, title: title(n) } : null; },
    all: function () { return N.filter(function (x) { return (x.text || '').trim(); }); }, isOpen: function () { return on; }, folders: function () { return FD.slice(); },
    opensOn: function (v) { if (v) GJ.settings.setItem(OKEY, v); return GJ.settings.getItem(OKEY) || 'new'; } };
})(window);
