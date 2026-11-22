/* oz · Threads (reference/OZ-PUBLIC-SECTIONS.md, "Room idea: Threads" and "Open any conversation in Threads"; build list
   items 1 and 2, 19 Nov 2026).
   Open any conversation (text pasted or shared in, a thread from Messages, or an oz-to-oz chat handed in) and it comes
   back as cards: open items, decisions, next steps. Each card has reply and done. Done cards drop to the bottom, folded
   into "done"; tap that to see them, and tap one to bring it back. Swipe a card to the right to mark it done.
   Reply turns the card into a draft (who it goes to, and the words) and hands it to openMessageSheet({ to, body }).
   On the phone that opens the phone's own message sheet, filled in, and you tap Send there. In a browser it shows the
   filled draft with a copy button. oz never sends anything itself.
     GJ.threads.open() · close() · isOpen() · state()
     GJ.threads.take({ title, from, text } or { title, from, messages: [{ who, text }] })  → the new thread's id
     GJ.threads.distill(text) → cards[]  (a plain local rule set; swap the function to change how it reads)
     GJ.threads.ozChats() → []           (stub: oz-to-oz chat is not in this build)
     GJ.messageFill.openMessageSheet({ to, body })  (a browser stand-in; the phone side replaces it)
   Kept on this phone only (settings key gj-threads). Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, html = document.documentElement, KEY = 'gj-threads';
  var store = GJ.settings || { getItem: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, setItem: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var D = { threads: [], n: 1 }; try { var s0 = JSON.parse(store.getItem(KEY) || 'null'); if (s0 && s0.threads) D = s0; } catch (e) {}
  function save() { try { store.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  function tick() { if (GJ.haptic && GJ.haptic.tick) GJ.haptic.tick(); }
  function commit() { if (GJ.haptic && GJ.haptic.commit) GJ.haptic.commit(); }
  function reduced() { return GJ.reduced ? GJ.reduced() : !!(G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- distill: a plain rule set, on the phone. Swap GJ.threads.distill to change how a conversation is read. ---------- */
  var KINDS = { open: 'open items', decision: 'decisions', next: 'next steps' };
  var R_DECIDE = /\b(decided|decision|we'?re going with|let'?s go with|go(?:ing)? with|agreed|settled|locked|final(?:ly)?|approved|confirmed|chose|picked|yes,? (?:build|do|go|let'?s)|that'?s the one|we'?ll use|sticking with)\b/i;
  var R_NEXT = /\b(i'?ll|we'?ll|you'?ll|will|need to|needs to|have to|has to|should|let'?s|to-?do|next|send|book|call|email|text|follow up|remind|finish|fix|bring|pick up|by (?:mon|tues?|wed|thur?s?|fri|sat|sun)\w*|by (?:tomorrow|tonight|noon|the end)|tomorrow|tonight|this week|can you|could you|would you|please)\b/i;
  var R_ASK = /^(can|could|would|will) you\b|^please\b/i;
  var R_OPEN = /\b(not sure|unsure|open question|tbd|undecided|wondering|which one|whether|maybe we|any thoughts|thoughts\?)\b/i;
  var R_SKIP = /^(ok(ay)?|k|yes|yep|yeah|no|nope|thanks?( you)?|thx|ty|lol|haha+|ha|nice|cool|great|sounds good|perfect|sure|right|got it|👍|🙏|🤙|❤️|😂)[.! ]*$/i;
  function lines(text) {
    var out = [], last = null;
    String(text || '').replace(/\r/g, '').split('\n').forEach(function (raw) {
      var l = raw.replace(/^\s*\[?\d{1,2}[:.]\d{2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?\]?\s*[-–—]?\s*/i, '').trim(); if (!l) return;   // a time at the start of a line
      var m = l.match(/^([^:]{1,28}):\s+(.+)$/);   // "Name: words"
      if (m && m[1].split(/\s+/).length <= 3 && !/^https?$/i.test(m[1])) { last = { who: m[1].trim(), text: m[2].trim() }; out.push(last); }
      else if (last && raw.match(/^\s/)) last.text += ' ' + l;   // a wrapped line goes with the one before
      else { last = { who: '', text: l }; out.push(last); }
    });
    return out;
  }
  function sentences(t) { return String(t).match(/[^.!?\n]+[.!?]*/g) || []; }
  function distill(text) {
    var seen = {}, cards = [], idx = 0;
    lines(text).forEach(function (ln) {
      sentences(ln.text).forEach(function (s) {
        s = s.trim(); idx++; if (s.length < 8 || R_SKIP.test(s)) return;
        var q = /\?\s*$/.test(s), kind = null;
        if (q) kind = R_ASK.test(s) ? 'next' : 'open';
        else if (R_DECIDE.test(s)) kind = 'decision';
        else if (R_OPEN.test(s)) kind = 'open';
        else if (R_NEXT.test(s)) kind = 'next';
        if (!kind) return;
        var k = s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); if (seen[k]) return; seen[k] = 1;
        cards.push({ kind: kind, text: s.length > 220 ? s.slice(0, 217) + '…' : s, who: ln.who, at: idx });
      });
    });
    return cards;
  }

  /* ---------- message fill: a draft handed to the phone's own message sheet. Here, a stand-in. ---------- */
  var fill = document.createElement('div'); fill.id = 'th-fill'; fill.setAttribute('role', 'dialog'); fill.setAttribute('aria-label', 'the message, filled in'); fill.hidden = true;
  fill.innerHTML = '<b class="jul">the message, filled in</b><p class="tf-to"></p><p class="tf-body"></p>' +
    '<p class="tf-say">oz doesn’t send this. On your phone this opens Messages, filled in, and you tap Send there.</p>' +
    '<div class="tf-act"><button class="tf-copy">copy</button><button class="tf-ok on">done</button></div>';
  var fillDone = null;
  function webSheet(d) {   // the browser stand-in for the phone's message sheet
    fill.querySelector('.tf-to').textContent = d.to ? 'to ' + d.to : 'to · choose in Messages';
    fill.querySelector('.tf-body').textContent = d.body || '';
    fill.querySelector('.tf-copy').textContent = 'copy';
    fill.hidden = false; html.classList.add('th-filling'); try { fill.querySelector('.tf-ok').focus({ preventScroll: true }); } catch (e) {}
    return new Promise(function (res) { fillDone = res; });
  }
  GJ.messageFill = GJ.messageFill || { openMessageSheet: webSheet, stub: true };
  function openMessageSheet(d) { return Promise.resolve(GJ.messageFill.openMessageSheet({ to: d.to || '', body: d.body || '' })); }
  function closeFill(ok) { fill.hidden = true; html.classList.remove('th-filling'); var f = fillDone; fillDone = null; if (f) f(ok !== false); }
  fill.addEventListener('click', function (e) {
    if (e.target.closest('.tf-copy')) { var t = fill.querySelector('.tf-body').textContent, b = e.target.closest('.tf-copy');
      var done = function () { b.textContent = 'copied'; tick(); };
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { manual(t); done(); }); else { manual(t); done(); } } catch (x) { manual(t); done(); } }
    if (e.target.closest('.tf-ok')) closeFill(true);
  });
  function manual(t) { var a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); }

  /* ---------- the oz-to-oz source: not in this build ---------- */
  function ozChats() { return []; }   // stub. oz-to-oz chat is wired on Gill's side; each chat comes in as { title, messages: [{ who, text }] }

  /* ---------- the room ---------- */
  var el = document.createElement('div'); el.id = 'th'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'threads');
  el.innerHTML =
    '<section class="th-list"><div class="th-top th-fromchat" hidden><button data-a="backchat" aria-label="back to the chat">‹ chat</button></div><b class="jul th-h">threads</b><p class="th-say">a conversation, as what’s still open · on this phone only</p>' +
      '<button class="th-add on" data-a="add">open a conversation</button><div class="th-rows" role="list"></div></section>' +
    '<section class="th-in" hidden><div class="th-top"><button data-a="list" aria-label="back to threads">‹ threads</button></div><b class="jul th-h">open a conversation</b>' +
      '<textarea class="th-text" rows="8" placeholder="paste a conversation here" aria-label="the conversation"></textarea>' +
      '<input class="th-name" type="text" maxlength="40" placeholder="call it (optional)" aria-label="what to call it">' +
      '<button class="th-go on" data-a="distill">find what’s open</button>' +
      '<b class="jul th-sub">or bring one in</b><div class="th-src"></div></section>' +
    '<section class="th-one" hidden><div class="th-top"><button data-a="list" aria-label="back to threads">‹ threads</button><button data-a="message" class="th-msg" aria-label="open the matching chat">message</button></div><b class="jul th-h th-title"></b><p class="th-say th-meta"></p>' +
      '<div class="th-cards"></div><button class="th-done-t" data-a="fold" aria-expanded="false"></button><div class="th-done" hidden></div>' +
      '<div class="th-foot"><button data-a="orig" aria-expanded="false">the conversation</button><button data-a="message" class="th-msg">message</button><button data-a="rm">remove</button></div><pre class="th-orig" hidden></pre></section>' +
    '<section class="th-re" hidden><div class="th-top"><button data-a="unre" aria-label="back to the cards">‹ cards</button></div><b class="jul th-h">reply</b>' +
      '<p class="th-q"></p><label class="th-l">to<input class="th-to" type="text" maxlength="60" placeholder="who it goes to" aria-label="who it goes to"></label>' +
      '<textarea class="th-body" rows="4" placeholder="your words" aria-label="your words"></textarea>' +
      '<button class="th-send on" data-a="fill">fill in a message</button><p class="th-say">you send it from Messages · then this card is done</p></section>';
  document.body.appendChild(el); document.body.appendChild(fill);
  var Q = function (s) { return el.querySelector(s); };
  var S = { on: false, view: 'list', cur: null, card: null, folded: true };

  function thread(id) { return D.threads.filter(function (t) { return t.id === id; })[0]; }
  function card(t, id) { return t && t.cards.filter(function (c) { return c.id === id; })[0]; }
  function counts(t) { var o = { open: 0, decision: 0, next: 0, done: 0 }; t.cards.forEach(function (c) { if (c.done) o.done++; else o[c.kind]++; }); return o; }
  function line(t) { var c = counts(t), p = []; if (c.open) p.push(c.open + ' open'); if (c.decision) p.push(c.decision + (c.decision === 1 ? ' decision' : ' decisions')); if (c.next) p.push(c.next + (c.next === 1 ? ' next step' : ' next steps')); if (!p.length) p.push(t.cards.length ? 'all done' : 'nothing to do'); return p.join(' · '); }
  function from(t) { return t.from === 'messages' ? 'from Messages' : t.from === 'oz' ? 'oz chat' : 'pasted'; }

  function take(o) {
    o = o || {}; var text = o.text;
    if (!text && o.messages) text = o.messages.map(function (m) { return (m.who ? m.who + ': ' : '') + m.text; }).join('\n');
    text = String(text || '').trim(); if (!text) return null;
    var cards = (GJ.threads.distill || distill)(text).map(function (c) { return { id: D.n++, kind: c.kind, text: c.text, who: c.who || '', done: false }; });
    var people = []; lines(text).forEach(function (l) { if (l.who && people.indexOf(l.who) < 0) people.push(l.who); });
    var t = { id: D.n++, title: String(o.title || '').trim() || (people.filter(function (p) { return !/^(me|i|you)$/i.test(p); }).slice(0, 2).join(', ') || 'a conversation'), from: o.from || 'paste', to: o.to || '', at: Date.now(), people: people, text: text, cards: cards };
    D.threads.unshift(t); save(); return t.id;
  }

  function paintList() {
    Q('.th-rows').innerHTML = D.threads.length ? D.threads.map(function (t) {
      return '<button class="th-row" role="listitem" data-t="' + t.id + '"><b>' + esc(t.title) + '</b><span>' + esc(line(t)) + '</span><em>' + esc(from(t)) + '</em></button>';
    }).join('') : '<p class="th-none">nothing yet · open a conversation and what’s still open comes up here as cards</p>';
  }
  function cardHtml(c) {
    var lab = { open: 'open item', decision: 'decision', next: 'next step' }[c.kind];
    return '<div class="th-card k-' + c.kind + (c.done ? ' done' : '') + '" role="listitem" data-c="' + c.id + '" aria-label="' + esc(lab + ': ' + c.text + (c.who ? ', from ' + c.who : '') + (c.done ? ', done' : '')) + '">' +
      '<p>' + esc(c.text) + '</p>' + (c.who ? '<em>' + esc(c.who) + '</em>' : '') +
      '<div class="th-cb">' + (c.done ? '<button data-a="undone" aria-label="bring it back">bring back</button>' :
        '<button data-a="reply" aria-label="reply to this">reply</button><button data-a="done" aria-label="mark done">done</button>') + '</div></div>';
  }
  function paintOne() {
    var t = thread(S.cur); if (!t) { show('list'); return; }
    Q('.th-title').textContent = t.title; Q('.th-meta').textContent = from(t) + ' · ' + line(t);
    var h = '';
    ['open', 'decision', 'next'].forEach(function (k) {
      var cs = t.cards.filter(function (c) { return c.kind === k && !c.done; }); if (!cs.length) return;
      h += '<b class="jul th-g">' + KINDS[k] + ' <span>' + cs.length + '</span></b><div role="list">' + cs.map(cardHtml).join('') + '</div>';
    });
    if (t.notes && t.notes.length) h += '<b class="jul th-g">notes <span>' + t.notes.length + '</span></b>' + t.notes.map(function (n) { return '<p class="th-none th-note">' + esc(n.text) + '</p>'; }).join('');   // r6: e.g. a capture sent from the red camera
    Q('.th-cards').innerHTML = h || '<p class="th-none">' + (t.cards.length ? 'everything here is done' : 'nothing open, decided or next in this one') + '</p>';
    var dn = t.cards.filter(function (c) { return c.done; }), fb = Q('.th-done-t');
    fb.hidden = !dn.length; fb.textContent = 'done · ' + dn.length + (S.folded ? '' : ' ⌄'); fb.setAttribute('aria-expanded', S.folded ? 'false' : 'true');
    var dd = Q('.th-done'); dd.hidden = S.folded || !dn.length; dd.innerHTML = '<div role="list">' + dn.map(cardHtml).join('') + '</div>';
    Q('.th-orig').textContent = t.text;
  }
  function paintIn() {
    var src = [], m = GJ.messages && GJ.messages.list ? GJ.messages.list() : [];
    m.forEach(function (n) { src.push('<button class="th-row" data-m="' + esc(n) + '"><b>' + esc(n) + '</b><em>from Messages</em></button>'); });
    var oz = (GJ.threads.ozChats || ozChats)();
    oz.forEach(function (c, i) { src.push('<button class="th-row" data-oz="' + i + '"><b>' + esc(c.title) + '</b><em>oz chat</em></button>'); });
    if (!oz.length) src.push('<p class="th-none">oz-to-oz chats arrive here once they’re in · not in this build</p>');
    Q('.th-src').innerHTML = src.join('');
  }
  function fromChat() { return !!(GJ._chatBack && GJ._chatBack.room === 'messages'); }
  function backToChat() {
    var b = GJ._chatBack || {};
    GJ._chatBack = null;
    close();
    if (GJ.messages) {
      if (b.name && GJ.messages.openNamed) GJ.messages.openNamed(b.name);
      else if (GJ.messages.open) GJ.messages.open();
    }
  }
  function toMessages() {
    var t = thread(S.cur);
    if (!t) return;
    GJ._chatBack = { room: 'threads', id: t.id, name: t.title };
    close();
    var name = t.to || t.title;
    if (GJ.messages) {
      if (GJ.messages.open) GJ.messages.open();
      if (name && GJ.messages.openNamed) GJ.messages.openNamed(name);
    }
  }
  function paintBack() {
    var n = Q('.th-fromchat');
    if (n) n.hidden = !fromChat();
  }
  function show(v) {
    S.view = v; ['list', 'in', 'one', 're'].forEach(function (k) { Q('.th-' + k).hidden = k !== v; });
    if (v === 'list') paintList(); if (v === 'one') paintOne(); if (v === 'in') paintIn();
    paintBack();
    el.scrollTop = 0; var f = Q('.th-' + v + ' .th-h'); if (f) { f.setAttribute('tabindex', '-1'); try { f.focus({ preventScroll: true }); } catch (e) {} }
  }
  function openThread(id) { S.cur = id; S.folded = true; show('one'); }
  function markDone(cid, v) {
    var t = thread(S.cur), c = card(t, cid); if (!c) return; c.done = v; c.doneAt = v ? Date.now() : null; save(); commit();
    var row = el.querySelector('[data-c="' + cid + '"]');
    if (row && v && !reduced()) { row.classList.add('going'); setTimeout(paintOne, 260); } else paintOne();
  }
  function reply(cid) {
    var t = thread(S.cur), c = card(t, cid); if (!c) return; S.card = cid;
    Q('.th-q').textContent = c.text;
    var who = t.to || (c.who && !/^(me|i)$/i.test(c.who) ? c.who : (t.people.filter(function (p) { return !/^(me|i|you)$/i.test(p); })[0] || ''));
    Q('.th-to').value = who; Q('.th-body').value = ''; show('re'); try { Q('.th-body').focus({ preventScroll: true }); } catch (e) {}
  }
  function doFill() {
    var t = thread(S.cur), c = card(t, S.card); if (!c) return; var body = Q('.th-body').value.trim(); if (!body) { Q('.th-body').focus(); return; }
    var to = Q('.th-to').value.trim();
    openMessageSheet({ to: to, body: body }).then(function (ok) { if (ok === false) return; c.done = true; c.replied = { to: to, body: body, at: Date.now() }; save(); S.card = null; show('one'); });
  }

  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
    if (a === 'add') { Q('.th-text').value = ''; Q('.th-name').value = ''; show('in'); try { Q('.th-text').focus({ preventScroll: true }); } catch (x) {} return; }
    if (a === 'list') { show('list'); return; }
    if (a === 'backchat') { backToChat(); return; }
    if (a === 'message') { toMessages(); return; }
    if (a === 'distill') { var id = take({ title: Q('.th-name').value, from: 'paste', text: Q('.th-text').value }); if (id == null) { Q('.th-text').focus(); return; } commit(); openThread(id); return; }
    if (a === 'fold') { S.folded = !S.folded; paintOne(); return; }
    if (a === 'orig') { var o = Q('.th-orig'); o.hidden = !o.hidden; b.setAttribute('aria-expanded', o.hidden ? 'false' : 'true'); return; }
    if (a === 'rm') { if (b.classList.contains('sure')) { D.threads = D.threads.filter(function (t) { return t.id !== S.cur; }); save(); show('list'); } else { b.classList.add('sure'); b.textContent = 'remove it?'; setTimeout(function () { b.classList.remove('sure'); b.textContent = 'remove'; }, 3000); } return; }
    if (a === 'unre') { show('one'); return; }
    if (a === 'fill') { doFill(); return; }
    var cd = b.closest('[data-c]'); if (cd) { var cid = +cd.getAttribute('data-c'); if (a === 'reply') reply(cid); else if (a === 'done') markDone(cid, true); else if (a === 'undone') markDone(cid, false); return; }
    if (b.hasAttribute('data-t')) { openThread(+b.getAttribute('data-t')); return; }
    if (b.hasAttribute('data-m')) { var nm = b.getAttribute('data-m'), ms = GJ.messages.export ? GJ.messages.export(nm) : []; var id2 = take({ title: nm, from: 'messages', to: nm, messages: ms }); if (id2 != null) openThread(id2); else b.querySelector('em').textContent = 'nothing in it yet'; return; }
    if (b.hasAttribute('data-oz')) { var c2 = (GJ.threads.ozChats || ozChats)()[+b.getAttribute('data-oz')]; var id3 = c2 && take({ title: c2.title, from: 'oz', messages: c2.messages }); if (id3 != null) openThread(id3); }
  });
  // swipe a card to the right: done (as in Messages); a tap on its words: reply
  var sw = null;
  el.addEventListener('pointerdown', function (e) { var cd = e.target.closest('.th-card'); if (!cd || cd.classList.contains('done') || e.target.closest('button')) return; sw = { el: cd, x: e.clientX, y: e.clientY, dx: 0, id: +cd.getAttribute('data-c') }; });
  el.addEventListener('pointermove', function (e) {
    if (!sw) return; var dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (!sw.go && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { sw = null; return; }   // a scroll, not a swipe
    if (Math.abs(dx) > 8) sw.go = true; if (!sw.go) return;
    sw.dx = Math.max(0, dx); sw.el.style.transform = 'translateX(' + sw.dx + 'px)'; sw.el.classList.toggle('will', sw.dx > 90);
  });
  function swEnd() {
    if (!sw) return; var s = sw; sw = null; s.el.style.transform = ''; s.el.classList.remove('will');
    if (s.go && s.dx > 90) markDone(s.id, true); else if (!s.go) reply(s.id);
  }
  el.addEventListener('pointerup', swEnd); el.addEventListener('pointercancel', function () { if (sw) { sw.el.style.transform = ''; sw = null; } });
  el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (S.view === 're') show('one'); else if (S.view !== 'list') show('list'); else if (fromChat()) backToChat(); else close(); } });

  function isOpen() { return S.on; }
  function open(id) { S.on = true; html.classList.add('threading'); el.setAttribute('aria-hidden', 'false'); if (id != null && thread(id)) openThread(id); else show('list'); commit(); }
  function close() { if (!S.on) return; if (!fill.hidden) closeFill(false); S.on = false; html.classList.remove('threading'); el.setAttribute('aria-hidden', 'true'); }
  el.setAttribute('aria-hidden', 'true');
  // the Mark puts it away first, like every other open thing (one wrap; core/app.js need not change)
  if (GJ.app && GJ.app.closeAny && !GJ.app.closeAny._threads) { var prev = GJ.app.closeAny; GJ.app.closeAny = function () { if (!fill.hidden) { closeFill(false); return true; } if (S.on) { if (S.view !== 'list') { show('list'); return true; } if (fromChat()) { backToChat(); return true; } close(); return true; } return prev.apply(this, arguments); }; GJ.app.closeAny._threads = 1; }

  /* ---------- the look (one block, so the module is one file) ---------- */
  var css = document.createElement('style'); css.id = 'threads-css';
  css.textContent = [
    '#th{position:fixed;inset:0;z-index:62;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(var(--top,8px) + 58px) 18px calc(28px + env(safe-area-inset-bottom,0px));box-sizing:border-box;background:linear-gradient(var(--stage-top,#03050b),var(--stage-bottom,#061018));color:var(--ink,#e8e4dc);font:300 15px/1.45 Poppins,sans-serif;opacity:0;visibility:hidden;transition:opacity .35s,visibility 0s .35s}',
    'html.threading #th{opacity:1;visibility:visible;transition:opacity .35s}',
    'html.threading #chrome{z-index:64}',   // the Mark and the red-mode dot stay on top, one tap away
    'html.threading #mark-tip,html.threading #master,html.threading #master2,html.threading #rail,html.threading #dial-tip,html.threading #moon{opacity:0;pointer-events:none}',
    '#th section{max-width:560px;margin:0 auto}',
    '#th .th-h{display:block;font-weight:400;font-size:12px;letter-spacing:.26em;text-transform:uppercase;color:var(--ink,#e8e4dc);margin:4px 0 6px;outline:none}',
    '#th .th-top{display:flex;align-items:center;gap:12px;margin:0 0 8px}',
    '#th .th-top button,#th .th-msg{background:none;border:0;color:var(--ink,#e8e4dc);font:400 14px/1.2 Poppins,sans-serif;padding:4px 0;cursor:pointer}',
    '#th .th-top .th-msg{margin-left:auto;letter-spacing:.04em}',
    '#th .th-foot .th-msg{margin-right:auto}',
    '#th .th-say{margin:0 0 14px;font-size:12px;color:var(--meta,#93a1a6)}',
    '#th button{min-height:44px;font:300 14px Poppins,sans-serif;color:var(--ink,#e8e4dc);background:none;border:1px solid var(--hair,rgba(200,225,255,.22));border-radius:16px;padding:6px 14px;cursor:pointer}',
    '#th button.on{border-color:rgba(232,228,220,.5)}',
    '#th .th-add,#th .th-go,#th .th-send{display:block;width:100%;margin:6px 0 18px}',
    '#th .th-top{position:sticky;top:0;margin:-6px 0 6px}',
    '#th .th-top button{border:0;padding:6px 2px;color:var(--meta,#93a1a6);font-size:13px;letter-spacing:.06em}',
    '#th .th-row{display:grid;grid-template-columns:1fr auto;gap:2px 10px;width:100%;text-align:left;margin:0 0 8px;padding:10px 14px;border-radius:14px;background:var(--sheet-row,rgba(200,225,255,.04))}',
    '#th .th-row b{font-weight:400;font-size:15px}#th .th-row span{grid-column:1;font-size:12px;color:var(--meta,#93a1a6)}#th .th-row em{grid-row:1/3;grid-column:2;align-self:center;font-style:normal;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--meta,#93a1a6)}',
    '#th .th-none{font-size:13px;color:var(--meta,#93a1a6);margin:14px 2px}',
    '#th textarea,#th input{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:10px 12px;border:1px solid var(--hair,rgba(200,225,255,.22));border-radius:14px;background:rgba(0,0,0,.25);color:var(--ink,#e8e4dc);font:300 15px/1.4 Poppins,sans-serif;outline:none;-webkit-appearance:none;appearance:none}',
    '#th textarea:focus,#th input:focus{border-color:rgba(232,228,220,.55)}',
    '#th .th-sub{display:block;font-weight:400;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--meta,#93a1a6);margin:8px 0 8px}',
    '#th .th-g{display:block;font-weight:400;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--meta,#93a1a6);margin:16px 0 8px}#th .th-g span{opacity:.7;margin-left:4px}',
    '#th .th-card{position:relative;margin:0 0 10px;padding:12px 14px 6px;border:1px solid var(--hair,rgba(200,225,255,.22));border-radius:16px;background:rgba(6,10,18,.62);touch-action:pan-y;transition:transform .2s,opacity .25s,border-color .2s}',
    '#th .th-card p{margin:0 0 4px}#th .th-card em{font-style:normal;font-size:11px;color:var(--meta,#93a1a6)}',
    '#th .th-card.k-decision{border-left:2px solid rgba(232,228,220,.55)}#th .th-card.k-open{border-style:dashed}',
    '#th .th-card .th-cb{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}#th .th-card .th-cb button{border:0;min-width:64px;color:var(--meta,#93a1a6);font-size:13px}',
    '#th .th-card.will{border-color:rgba(232,228,220,.6)}#th .th-card.going{opacity:0;transform:translateX(40px)}',
    '#th .th-card.done{opacity:.55}#th .th-card.done p{text-decoration:line-through;text-decoration-thickness:1px}',
    '#th .th-done-t{border:0;padding:6px 2px;margin-top:10px;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--meta,#93a1a6)}',
    '#th .th-foot{display:flex;gap:10px;margin-top:22px}#th .th-foot button{border:0;color:var(--meta,#93a1a6);font-size:12px}#th .th-foot button.sure{color:var(--ink,#e8e4dc)}',
    '#th .th-orig{white-space:pre-wrap;font:300 12px/1.5 Poppins,sans-serif;color:var(--meta,#93a1a6);border-left:1px solid var(--hair,rgba(200,225,255,.22));padding-left:12px;margin:8px 0 0}',
    '#th .th-q{margin:0 0 14px;padding-left:12px;border-left:1px solid var(--hair,rgba(200,225,255,.22));color:var(--meta,#93a1a6);font-size:13px}',
    '#th .th-l{display:flex;align-items:center;gap:10px;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--meta,#93a1a6)}#th .th-l input{margin:0 0 10px;flex:1;text-transform:none;letter-spacing:0}',
    '#th-fill{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:66;max-width:560px;margin:0 auto;padding:16px 16px 12px;border:1px solid var(--hair,rgba(200,225,255,.22));border-radius:18px;background:var(--sheet,#080c16e6);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:var(--ink,#e8e4dc);font:300 15px/1.45 Poppins,sans-serif}',
    '#th-fill[hidden]{display:none}#th-fill b{font-weight:400;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--meta,#93a1a6)}',
    '#th-fill .tf-to{margin:8px 0 2px;font-size:13px;color:var(--meta,#93a1a6)}#th-fill .tf-body{margin:0 0 10px;white-space:pre-wrap}#th-fill .tf-say{margin:0 0 10px;font-size:12px;color:var(--meta,#93a1a6)}',
    '#th-fill .tf-act{display:flex;gap:10px;justify-content:flex-end}#th-fill button{min-height:44px;min-width:88px;font:300 14px Poppins,sans-serif;color:var(--ink,#e8e4dc);background:none;border:1px solid var(--hair,rgba(200,225,255,.22));border-radius:16px}',
    'html.red #th,html.red #th-fill,html.red #th button,html.red #th textarea,html.red #th input,html.red #th-fill button,html.red #th .th-h{color:#FF4457}',
    'html.red #th .th-say,html.red #th .th-none,html.red #th .th-g,html.red #th .th-sub,html.red #th .th-row span,html.red #th .th-row em,html.red #th .th-card em,html.red #th .th-card .th-cb button,html.red #th .th-top button,html.red #th .th-done-t,html.red #th .th-foot button,html.red #th .th-orig,html.red #th .th-q,html.red #th .th-l,html.red #th-fill b,html.red #th-fill .tf-to,html.red #th-fill .tf-say{color:rgba(255,68,87,.62)}',
    'html.red #th button,html.red #th textarea,html.red #th input,html.red #th .th-card,html.red #th-fill,html.red #th-fill button,html.red #th .th-orig,html.red #th .th-q{border-color:rgba(255,68,87,.34)}html.red #th-fill{background:#0a0204eb}',
    'html.red #th{background:var(--redpage,#060304)}html.red #th .th-card{background:rgba(20,2,4,.6)}html.red #th textarea,html.red #th input{background:rgba(20,2,4,.4)}html.red #th button.on,html.red #th .th-card.k-decision,html.red #th .th-card.will{border-color:var(--red-ink,#FF4457)}',
    '@media (prefers-reduced-motion:reduce){#th,#th .th-card,#th-fill{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* r6 · a quiet note on a chat's Threads link (a capture sent from the red camera, say). Only if that chat has one. */
  function note(to, text) {
    var t = D.threads.filter(function (x) { return x.from === 'messages' && (x.to === to || x.title === to); })[0]; if (!t) return false;
    (t.notes = t.notes || []).push({ at: Date.now(), text: String(text || '').slice(0, 200) }); save(); if (S.on && S.cur === t.id) paintOne(); return true;
  }
  GJ.threads = { open: open, close: close, isOpen: isOpen, take: take, distill: distill, ozChats: ozChats, openMessageSheet: openMessageSheet, note: note,
    show: show, done: markDone, reply: reply,
    state: function () { var t = thread(S.cur); return { on: S.on, view: S.view, threads: D.threads.map(function (x) { return { id: x.id, title: x.title, from: x.from, line: line(x) }; }), cur: t ? { id: t.id, title: t.title, cards: t.cards.map(function (c) { return { id: c.id, kind: c.kind, text: c.text, who: c.who, done: c.done }; }) } : null, filling: !fill.hidden }; },
    clearForTest: function () { D = { threads: [], n: 1 }; save(); if (S.on) show('list'); } };
})(window);
