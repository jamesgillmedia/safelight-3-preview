/* oz Notes (catch-up 23 Nov; finished 24 Nov 2026; built on the 17 Nov pad). As familiar as Apple Notes: the list,
   newest first, in folders and in date groups (pinned, today, yesterday …); search at the top finds any note in any
   folder; swipe a note left to pin, move or delete it; the pencil starts a new one, with the keyboard up. A deleted
   note waits in "recently deleted" for 30 days. In a note: a checklist (tap the circle to tick it; return carries
   it on), share (only when you ask), and done. Opening Notes shows the list, or the note you were in if you were
   there a few minutes ago. Back goes from the note to the list, then out. An empty note is never kept.
   Everything saves as you type, on this phone (GJ.settings · gj-notes, as before).
     GJ.notes.open() · close() · isOpen() · add(text) · attach(text) · latest() · all() · folders() · thread() · opensOn() */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, FKEY = 'gj-notes-folders', OKEY = 'gj-notes-open', LKEY = 'gj-notes-last', DAY = 864e5, KEEP = 30 * DAY;
  var BOX = '○ ', TICK = '● ';   // a checklist line starts with an open circle; a ticked one with a filled circle
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var N = []; try { N = JSON.parse(GJ.settings.getItem('gj-notes') || '[]') || []; } catch (e) {}
  var FD = ['notes']; try { FD = JSON.parse(GJ.settings.getItem(FKEY) || '["notes"]') || ['notes']; } catch (e) {}
  N = N.filter(function (n) { return !n.gone || Date.now() - n.gone < KEEP; });   // recently deleted keeps a note 30 days
  function persist() { N = N.filter(function (n) { return (n.text || '').trim() || n === cur; }); try { GJ.settings.setItem('gj-notes', JSON.stringify(N.filter(function (n) { return (n.text || '').trim(); }))); GJ.settings.setItem(FKEY, JSON.stringify(FD)); } catch (e) {} }
  function live() { return N.filter(function (n) { return (n.text || '').trim() && !n.gone; }); }
  function plain(t) { return String(t || '').replace(/^[○●] /gm, ''); }
  function title(n) { var t = plain(n.text).trim().split('\n')[0]; return t ? t.slice(0, 60) : 'new note'; }
  function preview(n) { var L = plain(n.text).trim().split('\n'); return (L[1] || '').trim().slice(0, 80) || 'no more text'; }
  function day(ms) { var d = new Date(ms), n = new Date(); return d.toDateString() === n.toDateString() ? d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase() : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }
  function stamp(ms) { var d = new Date(ms); return d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function sorted(L) { return L.slice().sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.t - a.t; }); }
  function group(n) {   // the date groups the phone's Notes shows
    if (n.pin && folder !== 'deleted') return 'pinned';
    var t0 = new Date(); t0.setHours(0, 0, 0, 0); var a = t0.getTime() - n.t;
    if (n.t >= t0.getTime()) return 'today'; if (a < DAY) return 'yesterday'; if (a < 7 * DAY) return 'previous 7 days'; if (a < 30 * DAY) return 'previous 30 days';
    return new Date(n.t).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }).toLowerCase();
  }

  var el = document.createElement('section'); el.id = 'notes'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'notes'); el.hidden = true;
  var PEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19.4l1-4.2L16.2 5a1.6 1.6 0 0 1 2.3 0l.5.5a1.6 1.6 0 0 1 0 2.3L8.8 18.4z M4 21h16"/></svg>';
  el.innerHTML =
    '<div class="nt-list-v">' +
      '<div class="nt-find"><input type="search" class="nt-q" placeholder="search" aria-label="search notes" autocomplete="off"></div>' +
      '<div class="nt-folders" role="tablist" aria-label="folders"></div>' +
      '<div class="nt-rows" role="list"></div>' +
      '<div class="nt-foot"><span class="nt-count"></span><button type="button" class="nt-new" aria-label="new note">' + PEN + '</button></div>' +
    '</div>' +
    '<div class="nt-edit-v" hidden>' +
      '<div class="nt-bar"><span class="nt-when"></span>' +
        '<button type="button" class="nt-tool nt-chk" aria-label="checklist"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="7" r="2.4"/><circle cx="6" cy="16" r="2.4"/><path d="M11 7h9M11 16h9"/></svg></button>' +
        '<button type="button" class="nt-tool nt-share" aria-label="share this note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M8 7.2l4-3.7 4 3.7M6.5 11.5H5v9h14v-9h-1.5"/></svg></button>' +
        '<button type="button" class="nt-done">done</button></div>' +
      '<textarea class="nt-text" placeholder="start typing" spellcheck="true" aria-label="note"></textarea>' +
    '</div>' +
    '<div class="nt-sheet" hidden></div>';
  document.body.appendChild(el);
  var listV = el.querySelector('.nt-list-v'), editV = el.querySelector('.nt-edit-v'), rows = el.querySelector('.nt-rows'), folders = el.querySelector('.nt-folders'),
    q = el.querySelector('.nt-q'), ta = el.querySelector('.nt-text'), when = el.querySelector('.nt-when'), sheet = el.querySelector('.nt-sheet'), done = el.querySelector('.nt-done');
  var on = false, cur = null, folder = 'all', find = '', saveT = 0;

  function paintFolders() {
    var all = [['all', 'all notes']].concat(FD.map(function (f) { return [f, f]; }));
    if (N.some(function (n) { return n.gone && (n.text || '').trim(); })) all.push(['deleted', 'recently deleted']);
    folders.innerHTML = all.map(function (f) { var c = f[0] === folder && !find; return '<button type="button" role="tab" aria-selected="' + c + '" class="' + (c ? 'on' : '') + '" data-f="' + esc(f[0]) + '">' + esc(f[1]) + '</button>'; }).join('') +
      '<button type="button" class="nt-addf" data-a="newfolder" aria-label="new folder">+ folder</button>';
  }
  function visible() {
    var t = find.toLowerCase();
    if (t) return sorted(live().filter(function (n) { return plain(n.text).toLowerCase().indexOf(t) >= 0; }));   // search finds any note, in any folder
    if (folder === 'deleted') return N.filter(function (n) { return n.gone && (n.text || '').trim(); }).sort(function (a, b) { return b.gone - a.gone; });
    return sorted(live().filter(function (n) { return folder === 'all' || (n.f || 'notes') === folder; }));
  }
  function paintList() {
    if (folder === 'deleted' && !N.some(function (n) { return n.gone; })) folder = 'all';
    paintFolders(); var L = visible(), gone = folder === 'deleted' && !find, last = '';
    rows.innerHTML = L.length ? L.map(function (n) {
      var g = find ? (n.f || 'notes') : gone ? '' : group(n), head = g && g !== last ? '<h4 class="nt-g" aria-hidden="true">' + esc(g) + '</h4>' : ''; last = g || last;
      var acts = gone ? '<button type="button" data-act="back" tabindex="-1">recover</button><button type="button" data-act="kill" tabindex="-1">delete</button>'
        : '<button type="button" data-act="pin" tabindex="-1">' + (n.pin ? 'unpin' : 'pin') + '</button><button type="button" data-act="move" tabindex="-1">move</button><button type="button" data-act="del" tabindex="-1">delete</button>';
      var sub = gone ? Math.max(1, Math.ceil((n.gone + KEEP - Date.now()) / DAY)) + ' days left' : day(n.t);
      return head + '<div class="nt-row' + (gone ? ' nt-gone' : '') + '" role="listitem" data-id="' + n.id + '"><div class="nt-acts" aria-hidden="true">' + acts + '</div>' +
        '<button type="button" class="nt-open" data-open="' + n.id + '" aria-label="' + esc(title(n)) + (n.pin ? ' · pinned' : '') + ' · ' + sub + '"><b>' + (n.pin && !gone ? '<i aria-hidden="true">·</i> ' : '') + esc(title(n)) + '</b><span><em>' + sub + '</em> ' + esc(preview(n)) + '</span></button></div>';
    }).join('') : '<p class="nt-none">' + (find ? 'no notes with “' + esc(find) + '”' : gone ? 'nothing deleted' : 'no notes here yet · the pencil starts one') + '</p>';
    var c = L.length; el.querySelector('.nt-count').textContent = gone ? 'kept 30 days, then gone' : c + (c === 1 ? ' note' : ' notes');
    el.querySelector('.nt-new').hidden = gone;
  }
  function edit(n, fresh) {
    cur = n; ta.value = n.text || ''; when.textContent = n.gone ? 'recently deleted' : fresh ? 'new note' : stamp(n.t); ta.readOnly = !!n.gone;
    done.textContent = n.gone ? 'recover' : 'done'; el.classList.toggle('nt-ro', !!n.gone);
    listV.hidden = true; editV.hidden = false; mark(n); requestAnimationFrame(function () { if (n.gone) return; ta.focus({ preventScroll: true }); if (!fresh) { ta.setSelectionRange(ta.value.length, ta.value.length); } });
  }
  function mark(n) { try { GJ.settings.setItem(LKEY, JSON.stringify(n && !n.gone && (n.text || '').trim() ? { id: n.id, t: Date.now() } : null)); } catch (e) {} }   // the note you're in, for coming back to it
  G.addEventListener('pagehide', function () { if (on && cur && !editV.hidden) { persist(); mark(cur); } });
  function newNote() { var n = { id: Date.now(), t: Date.now(), text: '', f: folder === 'all' || folder === 'deleted' ? 'notes' : folder }; N.unshift(n); edit(n, true); hap('tick'); }
  function toList() { ta.blur(); persist(); mark(null); cur = null; editV.hidden = true; listV.hidden = false; paintList(); }
  function changed() { if (!cur || cur.gone) return; cur.text = ta.value; cur.t = Date.now(); when.textContent = stamp(cur.t); clearTimeout(saveT); saveT = setTimeout(function () { persist(); mark(cur); }, 300); }
  ta.addEventListener('input', changed);

  /* the checklist, in plain text: a line that starts with a circle. Tap the circle to tick it; return carries it on;
     return on an empty item ends the list (as the phone's Notes does) */
  function lineAt(p) { var s = ta.value.lastIndexOf('\n', p - 1) + 1, e = ta.value.indexOf('\n', p); return [s, e < 0 ? ta.value.length : e]; }
  function setText(v, caret) { ta.value = v; ta.setSelectionRange(caret, caret); changed(); }
  function toggleList() {   // the checklist button: the line becomes an item, or stops being one
    var p = ta.selectionStart, L = lineAt(p), line = ta.value.slice(L[0], L[1]), v = ta.value;
    if (/^[○●] /.test(line)) setText(v.slice(0, L[0]) + line.slice(2) + v.slice(L[1]), Math.max(L[0], p - 2));
    else setText(v.slice(0, L[0]) + BOX + line + v.slice(L[1]), p + 2);
    hap('tick'); ta.focus({ preventScroll: true });
  }
  ta.addEventListener('click', function () {   // a tap on the circle ticks it
    if (cur && cur.gone) return; var p = ta.selectionStart; if (p !== ta.selectionEnd) return; var L = lineAt(p), c = ta.value[L[0]];
    if ((c === '○' || c === '●') && ta.value[L[0] + 1] === ' ' && p - L[0] <= 1) {
      var v = ta.value; setText(v.slice(0, L[0]) + (c === '○' ? TICK : BOX) + v.slice(L[0] + 2), L[1]); hap('tick');
    }
  });
  ta.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return; var p = ta.selectionStart, L = lineAt(p), line = ta.value.slice(L[0], L[1]);
    if (!/^[○●] /.test(line)) return; e.preventDefault(); var v = ta.value;
    if (!line.slice(2).trim()) { setText(v.slice(0, L[0]) + v.slice(L[1]), L[0]); return; }   // an empty item: the list ends
    setText(v.slice(0, p) + '\n' + BOX + v.slice(p), p + 3);
  });

  /* share: only when you ask, to the phone's share sheet (F3 shows it went), or copied when there's no sheet */
  function share() {
    if (!cur || !(cur.text || '').trim()) return; var t = plain(cur.text).trim(); hap('tick');
    if (navigator.share) { navigator.share({ title: title(cur), text: t }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(t).then(function () { if (GJ.mark && GJ.mark.say) GJ.mark.say('copied · nothing was sent', 1600); }); } catch (e) {}
  }

  /* swipe a note left: pin · move · delete (the familiar row actions) */
  var sw = null;
  function shut(except) { Array.prototype.forEach.call(rows.querySelectorAll('.nt-row.open'), function (r) { if (r !== except) { r.classList.remove('open'); r.querySelector('.nt-open').style.transform = ''; } }); }
  function reach(r) { return r.querySelectorAll('.nt-acts button').length * 64; }
  rows.addEventListener('pointerdown', function (e) { var b = e.target.closest('.nt-open'); if (!b) return; sw = { r: b.parentNode, b: b, x: e.clientX, y: e.clientY, dx: 0, go: false, base: b.parentNode.classList.contains('open') ? -reach(b.parentNode) : 0 }; });
  rows.addEventListener('pointermove', function (e) {
    if (!sw) return; var dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (!sw.go) { if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3) { sw.go = true; shut(sw.r); sw.b.style.transition = 'none'; try { sw.b.setPointerCapture(e.pointerId); } catch (x) {} } else if (Math.abs(dy) > 10) { sw = null; return; } else return; }
    sw.dx = dx; sw.b.style.transform = 'translateX(' + Math.max(-reach(sw.r) - 28, Math.min(0, sw.base + dx)) + 'px)';
  });
  function swEnd() { if (!sw) return; var s = sw; sw = null; if (!s.go) return; s.b.style.transition = ''; var open = s.base + s.dx < -70; s.r.classList.toggle('open', open); s.b.style.transform = open ? 'translateX(-' + reach(s.r) + 'px)' : ''; s.r.dataset.ate = '1'; setTimeout(function () { delete s.r.dataset.ate; }, 60); hap('tick'); }
  rows.addEventListener('pointerup', swEnd); rows.addEventListener('pointercancel', swEnd);

  function byId(id) { return N.filter(function (x) { return String(x.id) === String(id); })[0]; }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) { shut(); return; } e.stopPropagation();
    var row = b.closest('.nt-row'); if (row && row.dataset.ate) return;
    if (b.dataset.open) { if (row.classList.contains('open')) { shut(); return; } var n = byId(b.dataset.open); if (n) edit(n, false); hap('tick'); return; }
    if (b.dataset.act) { var m = byId(row.dataset.id); if (!m) return;
      if (b.dataset.act === 'pin') { m.pin = !m.pin; persist(); paintList(); }
      if (b.dataset.act === 'del') { m.gone = Date.now(); m.pin = false; persist(); paintList(); if (GJ.mark && GJ.mark.say) GJ.mark.say('in recently deleted · 30 days', 1600); }
      if (b.dataset.act === 'back') { delete m.gone; persist(); paintList(); }
      if (b.dataset.act === 'kill') { N = N.filter(function (x) { return x !== m; }); persist(); paintList(); }
      if (b.dataset.act === 'move') moveSheet(m);
      hap('commit'); return; }
    if (b.dataset.f) { folder = b.dataset.f; if (find) { find = ''; q.value = ''; } shut(); paintList(); hap('tick'); return; }
    if (b.dataset.a === 'newfolder') { folderSheet(); return; }
    if (b.classList.contains('nt-new')) { newNote(); return; }
    if (b.classList.contains('nt-chk')) { toggleList(); return; }
    if (b.classList.contains('nt-share')) { share(); return; }
    if (b.classList.contains('nt-done')) { if (cur && cur.gone) { delete cur.gone; cur.f = FD.indexOf(cur.f) >= 0 ? cur.f : 'notes'; persist(); edit(cur, false); hap('commit'); return; } ta.blur(); persist(); hap('tick'); return; }
    if (b.dataset.to != null) { var mv = byId(sheet.dataset.id); if (mv) { mv.f = b.dataset.to; persist(); } closeSheet(); paintList(); return; }
    if (b.dataset.s === 'x') { closeSheet(); return; }
    if (b.dataset.s === 'mkf') { var v = sheet.querySelector('input').value.trim().toLowerCase(); if (v && v !== 'all' && v !== 'deleted' && FD.indexOf(v) < 0) { FD.push(v); persist(); folder = v; } closeSheet(); paintList(); return; }
  });
  function openSheet(h, id) { sheet.innerHTML = h; sheet.dataset.id = id || ''; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); var f = sheet.querySelector('input, button'); if (f) f.focus(); }); }
  function closeSheet() { sheet.classList.remove('in'); setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260); }
  function moveSheet(n) { openSheet('<h3 class="jul">move to</h3>' + FD.map(function (f) { return '<button type="button" class="nt-wide' + ((n.f || 'notes') === f ? ' on' : '') + '" data-to="' + esc(f) + '">' + esc(f) + '</button>'; }).join('') + '<button type="button" class="nt-wide nt-soft" data-s="x">cancel</button>', n.id); }
  function folderSheet() { openSheet('<h3 class="jul">new folder</h3><input class="nt-fin" aria-label="folder name" placeholder="name" autocomplete="off"><button type="button" class="nt-wide" data-s="mkf">add</button><button type="button" class="nt-wide nt-soft" data-s="x">cancel</button>'); }
  q.addEventListener('input', function () { find = q.value.trim(); paintList(); });
  sheet.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('nt-fin')) { e.preventDefault(); sheet.querySelector('[data-s=mkf]').click(); } });

  function lastOpen() { try { var o = JSON.parse(GJ.settings.getItem(LKEY) || 'null'); return o && Date.now() - o.t < 10 * 60e3 ? byId(o.id) : null; } catch (e) { return null; } }
  function open() {
    if (on) return; on = true; folder = 'all'; find = ''; q.value = ''; el.hidden = false; html.classList.add('noting'); requestAnimationFrame(function () { el.classList.add('in'); });
    // 24 Nov: the list first (the real room; a keyboard can't rise by itself when you arrive from Home). The note you
    // were in a few minutes ago comes back, as the phone's Notes does. Tune can still open on a new note.
    var back = lastOpen();
    if (opensOn() === 'new') newNote(); else if (back && !back.gone && (back.text || '').trim()) { listV.hidden = true; edit(back, false); } else { editV.hidden = true; listV.hidden = false; paintList(); }
    hap('commit');
  }
  function close() {
    if (!on) return; on = false; ta.blur(); persist();
    mark(cur && !editV.hidden ? cur : null);
    cur = null; closeSheet(); el.classList.remove('in'); html.classList.remove('noting'); setTimeout(function () { if (!on) { el.hidden = true; editV.hidden = true; listV.hidden = false; } }, 380);
  }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () {   // back: a sheet, then the search, then the note → the list, then out
    if (on) { if (!sheet.hidden) { closeSheet(); return true; } if (!editV.hidden) { toList(); return true; } if (find) { q.value = ''; find = ''; paintList(); return true; } if (rows.querySelector('.nt-row.open')) { shut(); return true; } close(); return true; }
    return ca0.apply(this, arguments); }; }
  function add(text) { var n = { id: Date.now(), t: Date.now(), text: String(text || ''), f: 'notes' }; N.unshift(n); persist(); if (on && !listV.hidden) paintList(); return n.id; }   // a line saved here from elsewhere (Messages)
  function attach(text) { var n = sorted(live())[0]; if (!n) return add(text); n.text = n.text.replace(/\s+$/, '') + '\n' + String(text || ''); n.t = Date.now(); persist(); return n.id; }   // a line added to the latest note (the camera)
  function opensOn(v) { if (v) GJ.settings.setItem(OKEY, v); return GJ.settings.getItem(OKEY) || 'list'; }
  GJ.notes = { open: open, close: close, add: add, attach: attach, latest: function () { var n = sorted(live())[0]; return n ? { id: n.id, title: title(n) } : null; },
    all: function () { return live(); }, isOpen: function () { return on; }, folders: function () { return FD.slice(); },
    thread: function (key, folder, text) {   // grant room (23 Nov): one note per thread, kept in step with the room; the folder is made if it isn't there
      folder = String(folder || 'notes'); if (FD.indexOf(folder) < 0) { FD.push(folder); try { GJ.settings.setItem(FKEY, JSON.stringify(FD)); } catch (e) {} }
      var n = N.filter(function (x) { return x.key === key; })[0]; if (!n) { n = { id: Date.now(), t: Date.now(), text: '', f: folder, key: key }; N.unshift(n); }
      delete n.gone; n.text = String(text || ''); n.t = Date.now(); persist(); if (on && !listV.hidden) paintList(); return n.id; },
    opensOn: opensOn };
})(window);
