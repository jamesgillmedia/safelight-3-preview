/* oz next (item 8) · Loved Ones: the innermost of three linked rooms — Balance → Friends → Loved Ones.
   A small, warm constellation: fewer stars, each a person. Locked every time it opens (the `chatLock` slot's Face ID
   confirm, here its labelled preview stub). Someone comes here from Friends only when you choose (hold them in Friends →
   move to loved ones); never on its own. Reminders you set yourself; one tap drafts a text (in Messages, where nothing
   sends) or a call you place; shared moments — photos and notes kept on a person's star, never graded or tinted. A quiet
   line only if someone has gone quiet for longer than you chose. No scores, no ranking, no labels unless you add one.
   On this phone only: never synced (Private Relay leaves it out), never shared. F3 lights only if something leaves.
   Example people are marked example. Kept in this browser (localStorage oz-loved).   GJ.lovedOnes.open() · .moveFrom(p) */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, esc = GJ.ozone ? GJ.ozone.esc : String, DAY = 864e5, KEY = 'oz-loved', tune = document.getElementById('tune');
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t, ms) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, ms || 2000); }
  var L = { people: [], n: 1, seeded: false };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.people) L = Object.assign(L, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {} }
  if (!L.seeded) {   // three example stars, so the room can be seen · clear them any time
    L.seeded = true; var now = Date.now();
    [['Example Rowan', 'example', [['call on Sundays', 'Sundays']], 3, 'from the example climbing circle'], ['Example Ida', 'example', [['her birthday', 'Mar 14']], 12, ''], ['Example Sam', 'example', [['check in after the show', 'after the show']], 40, '']]
      .forEach(function (p) { L.people.push({ id: L.n++, name: p[0], label: '', example: true, rem: p[2].map(function (r) { return { what: r[0], when: r[1] }; }), last: now - p[3] * DAY, quiet: 21, moments: p[0] === 'Example Rowan' ? [{ kind: 'note', text: 'example · the day at the crag', at: now - 5 * DAY }] : [], from: p[4] }); });
    save();
  }
  var el = document.createElement('section'); el.id = 'lo'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Loved Ones');
  el.innerHTML = '<header class="lo-h"><b class="jul">loved ones</b><button type="button" class="lo-x" aria-label="close Loved Ones">done</button></header>' +
    '<div class="lo-locked"><div class="lo-mini" aria-hidden="true"><i></i><i></i><i></i></div><p class="jul">locked</p><p class="quiet">the closest few · on this phone only</p><button type="button" data-a="unlock">unlock</button></div>' +
    '<div class="lo-open" hidden><svg class="lo-lines" aria-hidden="true"></svg><div class="lo-field" role="list" aria-label="the people closest to you"></div><p class="lo-quiet quiet"></p><div class="lo-card" hidden></div>' +
    '<div class="lo-foot"><button type="button" data-a="add">add someone</button><button type="button" data-a="fromfriends">from Friends</button><button type="button" data-a="lock">lock</button></div>' +
    '<p class="lo-note quiet">never synced · never shared · F3 lights only if a message or call leaves</p></div><input type="file" accept="image/*" hidden class="lo-file">';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, on = false, unlocked = false, sel = null, pending = null;
  function person(id) { return L.people.filter(function (p) { return p.id === id; })[0]; }
  function quietOnes() { var t = Date.now(); return L.people.filter(function (p) { return p.quiet && t - (p.last || t) > p.quiet * DAY; }); }
  function paint() {
    q('.lo-locked').hidden = unlocked; q('.lo-open').hidden = !unlocked; if (!unlocked) return;
    var f = q('.lo-field'), W = Math.min(G.innerWidth, 430), cx = W / 2, cy = 200, n = L.people.length, svg = q('.lo-lines'), pts = [];
    f.innerHTML = L.people.map(function (p, i) { var a = -Math.PI / 2 + i * Math.PI * 2 / Math.max(1, n), r = n < 2 ? 0 : 70 + (i % 2) * 22, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .8; pts.push([x, y]);
      return '<button type="button" role="listitem" class="lo-p' + (sel === p.id ? ' on' : '') + (p.example ? ' ex' : '') + '" data-id="' + p.id + '" style="left:' + x + 'px;top:' + y + 'px" aria-label="' + esc(p.name + (p.example ? ' (example)' : '') + (p.label ? ' · ' + p.label : '')) + '"><i></i><span>' + esc(p.name) + (p.example ? ' <em>example</em>' : '') + '</span></button>'; }).join('') || '<p class="quiet lo-empty">no one here yet · bring someone from Friends, or add them</p>';
    svg.setAttribute('viewBox', '0 0 ' + W + ' 400'); svg.innerHTML = pts.length > 1 ? '<polygon points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"></polygon>' : '';
    var qs = quietOnes(); q('.lo-quiet').textContent = qs.length ? qs.map(function (p) { return p.name; }).join(' · ') + ' · quiet a while · only if you want to' : '';
    card();
  }
  function card() {
    var c = q('.lo-card'), p = sel != null ? person(sel) : null; c.hidden = !p && !pending; if (pending) { c.innerHTML = pending; return; } if (!p) return;
    c.innerHTML = '<h3 class="jul">' + esc(p.name) + (p.example ? ' · example' : '') + '</h3>' + (p.from ? '<p class="quiet">' + esc(p.from) + '</p>' : '') +
      '<div class="oz-seg"><button type="button" data-a="text">a text</button><button type="button" data-a="call">a call</button></div>' +
      '<h4 class="jul">reminders · yours</h4>' + (p.rem.length ? p.rem.map(function (r, i) { return '<p class="oz-line">' + esc(r.what) + ' · ' + esc(r.when) + ' <button type="button" data-rm="' + i + '" aria-label="remove this reminder">✕</button></p>'; }).join('') : '<p class="quiet">none</p>') +
      '<div class="lo-row"><input type="text" class="lo-rw" maxlength="40" placeholder="call on Sundays" aria-label="a reminder"><input type="text" class="lo-rn" maxlength="20" placeholder="when" aria-label="when"><button type="button" data-a="rem">add</button></div>' +
      '<h4 class="jul">shared moments · private</h4><div class="lo-mom">' + (p.moments.length ? p.moments.map(function (m, i) { return m.kind === 'photo' ? '<figure><img data-k="' + esc(m.key) + '" alt="a shared moment"><figcaption>' + new Date(m.at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase() + '</figcaption></figure>' : '<p class="oz-line">' + esc(m.text) + '</p>'; }).join('') : '<p class="quiet">none yet</p>') + '</div>' +
      '<div class="lo-row"><input type="text" class="lo-mt" maxlength="120" placeholder="a note to keep" aria-label="a note to keep"><button type="button" data-a="note">keep</button><button type="button" data-a="photo">a photo</button></div>' +
      '<h4 class="jul">getting through</h4><div class="oz-seg" role="group" aria-label="getting through"><button type="button" data-a="through" aria-pressed="' + !!p.through + '">can always reach me</button><button type="button" data-a="sound" aria-pressed="' + !!p.sound + '">sound for them</button></div><p class="quiet">' + (p.through ? 'through do not disturb, as a glow at the screen’s edge' + (p.sound ? ', with a soft sound' : ', silent') : 'held quietly like everyone else') + '</p>' +
      '<h4 class="jul">a quiet line</h4><div class="oz-seg" role="group" aria-label="a line if they go quiet">' + [[0, 'never'], [7, 'a week'], [21, 'three weeks'], [60, 'two months']].map(function (o) { return '<button type="button" data-qt="' + o[0] + '" aria-pressed="' + ((p.quiet || 0) === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
      '<div class="lo-row"><input type="text" class="lo-lb" maxlength="20" placeholder="a label, only if you want one" aria-label="a label" value="' + esc(p.label || '') + '"><button type="button" data-a="label">set</button></div>' +
      '<div class="oz-seg"><button type="button" data-a="out">take off Loved Ones</button><button type="button" data-a="cardx">close</button></div>';
    c.querySelectorAll('img[data-k]').forEach(function (im) { if (GJ.keep) GJ.keep.get(im.dataset.k).then(function (b) { if (b) im.src = URL.createObjectURL(b); }); });
  }
  function unlock() { var Lk = G.oz && G.oz.private.get('chatLock'); if (!Lk) { unlocked = true; paint(); return Promise.resolve(true); }
    return Lk.unlock({ chatId: 'loved-ones', why: 'open Loved Ones' }).then(function (r) { if (r && r.ok) { unlocked = true; paint(); hap('commit'); return true; } return false; }); }
  function open() { if (on) return; on = true; unlocked = false; sel = null; pending = null; el.hidden = false; html.classList.add('loving'); paint(); hap('tick'); }
  function close() { if (!on) return; on = false; unlocked = false; sel = null; pending = null; el.hidden = true; html.classList.remove('loving'); }
  function moveFrom(p) {   // from Friends: only when the person chooses — this is that choice, confirmed once
    open(); unlock().then(function (ok) { if (!ok) return; if (L.people.some(function (x) { return x.name === p.name && !x.example; })) { say(p.name + ' · already here'); return; }
      pending = '<h3 class="jul">move ' + esc(p.name) + ' to Loved Ones?</h3><p class="quiet">they stay on their ' + esc(p.act || '') + ' circle in Friends · nothing is sent</p><div class="oz-seg"><button type="button" data-a="moveyes">move here</button><button type="button" data-a="moveno">not now</button></div>';
      pendingP = p; paint(); });
  }
  var pendingP = null;
  el.addEventListener('click', function (e) {
    var x = e.target.closest('button'); if (!x) return; var a = x.dataset.a, p = sel != null ? person(sel) : null, c = q('.lo-card');
    if (x.classList.contains('lo-x')) { close(); return; }
    if (a === 'unlock') { unlock(); return; }
    if (a === 'lock') { unlocked = false; sel = null; paint(); return; }
    if (x.classList.contains('lo-p')) { sel = sel === +x.dataset.id ? null : +x.dataset.id; pending = null; paint(); hap('tick'); return; }
    if (a === 'moveyes' && pendingP) { L.people.push({ id: L.n++, name: pendingP.name, label: '', example: false, rem: [], last: Date.now(), quiet: 0, moments: [], from: 'from Friends · ' + (pendingP.act || '') }); save(); sel = L.n - 1; pending = null; pendingP = null; paint(); hap('commit'); return; }
    if (a === 'moveno') { pending = null; pendingP = null; paint(); return; }
    if (a === 'add') { pending = '<h3 class="jul">someone close</h3><div class="lo-row"><input type="text" class="lo-nn" maxlength="24" placeholder="a first name" aria-label="a first name"><button type="button" data-a="addyes">add</button><button type="button" data-a="moveno">not now</button></div>'; sel = null; paint(); try { q('.lo-nn').focus(); } catch (er) {} return; }
    if (a === 'addyes') { var v = (q('.lo-nn').value || '').trim(); if (!v) return; L.people.push({ id: L.n++, name: v, label: '', example: false, rem: [], last: Date.now(), quiet: 0, moments: [], from: '' }); save(); pending = null; sel = L.n - 1; paint(); return; }
    if (a === 'fromfriends') { close(); if (GJ.app && GJ.app.enter && GJ.lazy) { if (GJ.friends) GJ.friends.open(); else if (GJ.lazy.load) GJ.lazy.load('friends').then(function () { GJ.friends.open(); }); } say('hold someone in Friends · move to loved ones', 2600); return; }
    if (!p) return;
    if (a === 'text') { p.last = Date.now(); save(); var nm = p.name; close(); if (GJ.messages && GJ.messages.draft) GJ.messages.draft(nm, ''); else if (GJ.lazy && GJ.lazy.load) GJ.lazy.load('messages').then(function () { GJ.messages.draft(nm, ''); }); say('a draft · yours to send', 2000); return; }
    if (a === 'call') { p.last = Date.now(); save(); pending = '<h3 class="jul">call ' + esc(p.name) + '</h3><p class="quiet">your phone places the call · this app keeps no numbers' + (p.example ? ' · an example person: nothing to call' : '') + '</p><div class="oz-seg"><button type="button" data-a="moveno">ok</button></div>'; paint(); return; }
    if (x.dataset.rm != null) { p.rem.splice(+x.dataset.rm, 1); save(); card(); return; }
    if (a === 'rem') { var w = c.querySelector('.lo-rw').value.trim(), wn = c.querySelector('.lo-rn').value.trim(); if (!w) return; p.rem.push({ what: w, when: wn || 'when you choose' }); save(); card(); hap('tick'); return; }
    if (a === 'note') { var t = c.querySelector('.lo-mt').value.trim(); if (!t) return; p.moments.push({ kind: 'note', text: t, at: Date.now() }); save(); card(); return; }
    if (a === 'photo') { q('.lo-file').click(); return; }
    if (x.dataset.qt != null) { p.quiet = +x.dataset.qt; save(); paint(); return; }
    if (a === 'through') { p.through = !p.through; save(); card(); return; }   // bubble round 5: breakthrough, and sound, per person
    if (a === 'sound') { p.sound = !p.sound; save(); card(); return; }
    if (a === 'label') { p.label = c.querySelector('.lo-lb').value.trim(); save(); paint(); return; }
    if (a === 'out') { L.people = L.people.filter(function (z) { return z.id !== p.id; }); sel = null; save(); paint(); say(p.name + ' · off Loved Ones'); return; }
    if (a === 'cardx') { sel = null; paint(); }
  });
  q('.lo-file').addEventListener('change', function () { var f = this.files && this.files[0], p = sel != null ? person(sel) : null; this.value = ''; if (!f || !p || !GJ.keep) return; var k = 'loved-' + p.id + '-' + Date.now();
    GJ.keep.put(k, f).then(function () { p.moments.push({ kind: 'photo', key: k, at: Date.now() }); save(); card(); }); });
  if (GJ.app && GJ.app.closeAny) { var c0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (on) { close(); return true; } return c0.apply(this, arguments); }; }
  GJ.lovedOnes = { people: function () { return L.people.map(function (p) { return { name: p.name, through: !!p.through, sound: !!p.sound, example: !!p.example }; }); }, approve: function (name, through, sound) { L.people.forEach(function (p) { if (p.name === name) { p.through = !!through; p.sound = !!sound; } }); save(); },
    open: open, close: close, isOpen: function () { return on; }, unlocked: function () { return unlocked; }, moveFrom: moveFrom, unlock: unlock,
    state: function () { return { on: on, unlocked: unlocked, people: L.people.map(function (p) { return { id: p.id, name: p.name, example: p.example, rem: p.rem.length, moments: p.moments.length }; }), quiet: quietOnes().map(function (p) { return p.name; }) }; },
    select: function (id) { sel = id; pending = null; paint(); }, clearExamples: function () { L.people = L.people.filter(function (p) { return !p.example; }); save(); paint(); } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'lovedones', name: 'loved ones', sub: 'the closest few · locked', cl: 'people', open: open });
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; if (x.dataset.t === 'loved') { if (GJ.app.tune) GJ.app.tune(false); open(); } if (x.dataset.t === 'lovedex') { GJ.lovedOnes.clearExamples(); say('example people · cleared'); } });
})(window);
