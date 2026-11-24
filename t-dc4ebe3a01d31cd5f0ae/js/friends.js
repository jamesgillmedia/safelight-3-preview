/* tools-02 · Friends: the people met through the activities (briefs/FRIENDS.md; Gill, 18 Nov — tapped after Messages).
   Sister to Balance, which holds the activities themselves; a star in Balance opens its circle here.
   One small constellation an activity. The activity is the star in the middle; each person is a star near it, and
   nearer and brighter the more often you have seen each other.
     · Tap a person: seen today (tap again: not today). That is "seen again" — no faces, no contacts here, a first name.
     · Hold a person for more: draft a text, or take them off the circle.
     · ADD puts a first name on the circle. GROUP adds a choir, a gym, a crew — when it meets, in your words — and a
       group can be followed without adding anyone.
     · After a third meeting the room suggests one small ask (coffee after class, a carpool to the trailhead, a belay
       swap — the brief's own). For a week after any meeting, a quiet line: a text, or a photo from the day. Each goes
       with one tap, and DRAFT only ever opens a draft — in Messages, where nothing is sent.
     · HOST makes a plain invite card (what · when · where) to copy. Sent only by you.
   No scoring of people, no profiles, nothing shared. The names are only what is typed; none are made up here.
   Not here (the brief): Contacts, the outreach agent and its Vancouver shortlist, the weekly check-in, who you know in
   a group, when a group meets as a real date. Kept in this browser (localStorage gj-friends). */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, DAY = 864e5;
  var KEY = 'gj-friends', FALL = ['singing', 'climbing', 'woodwork', 'ski touring', 'performing', 'ballet', 'spatial design'];
  var F = { people: [], groups: [], n: 1, act: null }; try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.people) F = Object.assign(F, s0); } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(F)); } catch (e) {} }
  var shift = 0; function today() { var d = new Date(Date.now() + shift * DAY); return Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / DAY); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function acts() { var a = GJ.balance ? ((GJ.balance.state() || {}).acts || []).filter(function (x) { return x.g !== 'rest' && x.g !== 'work'; }).map(function (x) { return x.name; }) : []; return a.length ? a : FALL; }
  function person(id) { return F.people.filter(function (p) { return p.id === id; })[0]; }
  function circle(a) { return F.people.filter(function (p) { return p.act === a; }); }
  function last(p) { return p.seen.length ? p.seen[p.seen.length - 1] : null; }
  function askFor(a) { return a === 'climbing' ? 'a belay swap next time?' : a === 'ski touring' ? 'carpool to the trailhead next time?' : /sing|ballet|perform|class/.test(a) ? 'coffee after class?' : 'coffee after?'; }
  function nudge() {   // one at most: the small ask first, then the follow-up
    var t = today(), i, p;
    for (i = 0; i < F.people.length; i++) { p = F.people[i]; if (p.seen.length >= 3 && !p.asked) return { k: 'ask', id: p.id, text: 'you have met ' + p.name + ' ' + (p.seen.length === 3 ? 'three' : p.seen.length) + ' times · one small ask?', draft: askFor(p.act) }; }
    for (i = 0; i < F.people.length; i++) { p = F.people[i]; var l = last(p); if (l != null && t - l >= 1 && t - l <= 7 && p.followed !== l) return { k: 'follow', id: p.id, text: p.name + ', ' + (t - l === 1 ? 'yesterday' : (t - l) + ' days ago') + ' · a text, or a photo from the day?', draft: 'good to see you at ' + p.act }; }
    return null;
  }
  var el = document.createElement('div'); el.id = 'fr'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'friends: the people met through the activities');
  el.innerHTML = '<b class="jul">friends</b><p class="fr-say" aria-live="polite"></p><p class="fr-nudge" hidden><span></span><button data-a="draft" class="on">draft</button><button data-a="dismiss">dismiss</button></p><div class="fr-acts" role="group" aria-label="which circle"></div>' +
    '<div class="fr-field"></div><div class="fr-more" hidden></div><div class="fr-groups"></div>' +
    '<div class="fr-new" hidden><input type="text" maxlength="24" aria-label="a name"><input type="text" maxlength="40" class="fr-when" placeholder="when it meets, in your words" aria-label="when it meets" hidden><button data-a="make" class="on">add</button></div>' +
    '<div class="fr-card" hidden><textarea rows="3" aria-label="the draft"></textarea><div><button data-a="tomsg" class="on">open in messages</button><button data-a="copy">copy</button><button data-a="cardno">not now</button></div><em>a draft only · nothing is sent from here</em></div>' +
    '<div class="fr-act"><button data-a="add">add</button><button data-a="group">group</button><button data-a="host">host</button><button data-a="close" class="on">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, field = q('.fr-field'), sayEl = q('.fr-say'), nudgeEl = q('.fr-nudge'), actsEl = q('.fr-acts'), moreEl = q('.fr-more'), groupsEl = q('.fr-groups'), newEl = q('.fr-new'), nameIn = newEl.querySelector('input'), whenIn = q('.fr-when'), cardEl = q('.fr-card'), cardTa = cardEl.querySelector('textarea');
  var on = false, sel = null, adding = null, card = null, curNudge = null, sayT = 0;
  function rest() { var c = circle(F.act), t = today(), seen = c.filter(function (p) { return last(p) === t; }).length; return c.length ? c.length + (c.length === 1 ? ' person' : ' people') + ' through ' + F.act + (seen ? ' · ' + seen + ' seen today' : ' · tap who you saw') : 'no one on this circle yet · add a first name'; }
  function say(s, ms) { sayEl.textContent = s; clearTimeout(sayT); sayT = 0; if (ms) sayT = setTimeout(function () { sayT = 0; sayEl.textContent = rest(); }, ms); }
  function paint() {
    var A = acts(); if (!F.act || A.indexOf(F.act) < 0) F.act = A[0]; var t = today(), c = circle(F.act);
    actsEl.innerHTML = A.map(function (a) { var n = circle(a).length; return '<button data-c="' + esc(a) + '"' + (a === F.act ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + esc(a) + (n ? '<em>' + n + '</em>' : '') + '</button>'; }).join('');
    var h = '<span class="fr-hub"><i>✦</i><span>' + esc(F.act) + '</span></span>';
    c.forEach(function (p, i) {
      var n = p.seen.length, r = Math.max(.15, .43 - .07 * Math.min(n, 4)), a = (i * 137.5 + 20) * Math.PI / 180, x = 50 + r * 100 * Math.cos(a) * .92, y = 50 + r * 100 * Math.sin(a), done = last(p) === t;
      h += '<button class="fr-p' + (done ? ' today' : '') + (sel === p.id ? ' sel' : '') + '" data-id="' + p.id + '" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;--b:' + Math.min(1, .3 + .175 * Math.min(n, 4)).toFixed(2) + '" aria-pressed="' + done + '" aria-label="' + esc(p.name) + ', seen ' + (n === 1 ? 'once' : n + ' times') + (done ? ', today' : '') + '"><i>✦</i><span>' + esc(p.name) + '</span></button>';
    });
    field.innerHTML = h;
    var g = F.groups.filter(function (x) { return x.act === F.act; }); groupsEl.innerHTML = g.length ? '<span>groups</span>' + g.map(function (x) { return '<button data-gr="' + x.id + '">' + esc(x.name) + (x.when ? '<em>' + esc(x.when) + '</em>' : '') + '</button>'; }).join('') : '';
    var p = sel != null ? person(sel) : null; moreEl.hidden = !p; if (p) moreEl.innerHTML = '<span>' + esc(p.name) + '</span><button data-m="text">draft a text</button>' + '<button data-m="remove">remove</button><button data-m="done" class="on">done</button>';
    newEl.hidden = !adding; if (adding) { nameIn.placeholder = adding === 'group' ? 'a group — a choir, a gym, a crew' : adding === 'host' ? 'what · when · where' : 'a first name'; whenIn.hidden = adding !== 'group'; nameIn.maxLength = adding === 'host' ? 90 : adding === 'group' ? 30 : 24; q('[data-a="make"]').textContent = adding === 'host' ? 'make the card' : 'add'; }
    cardEl.hidden = !card; q('[data-a="tomsg"]').hidden = !card || card.id == null;
    curNudge = card ? null : nudge(); nudgeEl.hidden = !curNudge; if (curNudge) nudgeEl.firstChild.textContent = curNudge.text;
    if (!sayT) sayEl.textContent = rest();
  }
  function add(nm, a) { nm = String(nm || '').trim().slice(0, 24); if (!nm) return null; var p = { id: F.n++, name: nm, act: a || F.act, seen: [] }; F.people.push(p); save(); if (on) paint(); return p.id; }
  function saw(id, ago) { var p = person(id); if (!p) return false; var d = today() - (ago || 0); if (p.seen.indexOf(d) < 0) { p.seen.push(d); p.seen.sort(function (x, y) { return x - y; }); } save(); if (on) paint(); return true; }
  function unsaw(id) { var p = person(id); if (!p) return; var i = p.seen.indexOf(today()); if (i >= 0) p.seen.splice(i, 1); save(); if (on) paint(); }
  function tap(id) { var p = person(id); if (!p) return; if (last(p) === today()) { unsaw(id); say(p.name + ' · not today', 1600); GJ.haptic.tick(); } else { saw(id); say(p.name + ' · seen today · ' + (p.seen.length === 1 ? 'the first time' : p.seen.length + ' times now'), 2000); GJ.haptic.commit(); } }
  function draft(id, text) { card = { id: id, text: text }; cardTa.value = text; sel = null; adding = null; paint(); }
  function open(a) { if (a && acts().indexOf(a) >= 0) F.act = a; if (on) { paint(); return; } on = true; sel = null; adding = null; card = null; html.classList.add('befriending'); paint(); GJ.haptic.tick(); }
  function close() { if (!on) return; on = false; html.classList.remove('befriending'); }
  var holdT = 0, held = false;
  field.addEventListener('pointerdown', function (e) { var b = e.target.closest('.fr-p'); if (!b) return; held = false; clearTimeout(holdT); holdT = setTimeout(function () { held = true; sel = +b.dataset.id; adding = null; card = null; paint(); GJ.haptic.commit(); }, 560); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { field.addEventListener(n, function () { clearTimeout(holdT); }); });
  field.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); var a = b.dataset.a, m = b.dataset.m, p = sel != null ? person(sel) : null;
    if (b.dataset.id) { if (held) { held = false; return; } tap(+b.dataset.id); }
    else if (b.dataset.c) { F.act = b.dataset.c; sel = null; save(); paint(); GJ.haptic.tick(); }
    else if (b.dataset.gr) { var g = F.groups.filter(function (x) { return x.id === +b.dataset.gr; })[0]; if (g) say(g.name + (g.when ? ' · ' + g.when : '') + ' · followed', 2400); }
    else if (m === 'text' && p) draft(p.id, '');
    else if (m === 'remove' && p) { F.people = F.people.filter(function (x) { return x.id !== p.id; }); sel = null; save(); paint(); say(p.name + ' · off the circle', 1800); GJ.haptic.edge(); }
    else if (m === 'done') { sel = null; paint(); }
    else if (a === 'add' || a === 'group' || a === 'host') { adding = adding === a ? null : a; sel = null; card = null; nameIn.value = ''; whenIn.value = ''; paint(); if (adding) try { nameIn.focus(); } catch (x) {} }
    else if (a === 'make') {
      var v = nameIn.value.trim(); if (!v) { say('type it first', 1500); return; }
      if (adding === 'group') { F.groups.push({ id: F.n++, name: v.slice(0, 30), when: whenIn.value.trim().slice(0, 40), act: F.act }); save(); say(v + ' · followed', 1800); }
      else if (adding === 'host') { adding = null; card = { id: null, text: v.split(/\s*·\s*/).join('\n') }; cardTa.value = card.text; paint(); say('an invite card · yours to send', 2400); return; }
      else { add(v); say(v + ' · on the ' + F.act + ' circle', 1800); }
      adding = null; nameIn.value = ''; whenIn.value = ''; paint(); GJ.haptic.commit();
    }
    else if (a === 'draft' && curNudge) { var n = curNudge, pp = person(n.id); if (n.k === 'ask') pp.asked = 'drafted'; else pp.followed = last(pp); save(); draft(n.id, n.draft); }
    else if (a === 'dismiss' && curNudge) { var p2 = person(curNudge.id); if (curNudge.k === 'ask') p2.asked = 'dismissed'; else p2.followed = last(p2); save(); paint(); GJ.haptic.tick(); }
    else if (a === 'tomsg' && card && card.id != null) { var who = person(card.id), tx = cardTa.value; card = null; close(); if (GJ.messages && who) GJ.messages.draft(who.name, tx); }
    else if (a === 'copy' && card) { try { G.navigator.clipboard.writeText(cardTa.value); } catch (x) {} say('copied · yours to send', 1800); card = null; paint(); }
    else if (a === 'cardno') { card = null; paint(); }
    else if (a === 'close') close();
  });
  el.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter' && (e.target === nameIn || e.target === whenIn)) q('[data-a="make"]').click(); });
  GJ.friends = { open: open, close: close, isOpen: function () { return on; }, add: add, saw: saw, tap: tap, hold: function (id) { sel = id; adding = null; card = null; if (on) paint(); }, shift: function (d) { shift = d || 0; if (on) paint(); },
    state: function () { return { on: on, act: F.act, acts: acts(), people: F.people.map(function (p) { return { id: p.id, name: p.name, act: p.act, seen: p.seen.length, today: last(p) === today(), asked: p.asked || null }; }), groups: F.groups.map(function (g) { return g.name + (g.when ? ' · ' + g.when : '') + ' @ ' + g.act; }), nudge: nudge(), card: card ? { id: card.id, text: cardTa.value } : null, sel: sel }; } };
})(window);
