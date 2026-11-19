/* tools-02 · Messages (briefs/MESSAGING.md, PASS-IT-ON.md; Gill, 18 Nov 14:26: "Message app functions identical to
   iMessage. Edit, undo send [within a time] limit, respond with emoji, reply to message. Other unique site specific
   interventions like pass it on and others").
   A prototype of how the room behaves. NOTHING IS SENT: there is no relay and no other phone here, so every thread
   lives on this phone only, and the room says so. To try what happens to a message that arrives, WRITE AS: THEM puts
   a line on the other side of the thread — a stand-in for the other person, not a person.
     · Threads: one a person. The names are whatever is typed; none are made up here. SEARCH looks through every thread.
     · Send is always pressed by hand. No read receipts, no "typing…".
     · Hold a message for more:
         react    — one emoji on the message (five to hand, or type any); tap it again to take it off
         reply    — the answer carries a line of what it answers; tap that line to go back to it
         edit     — your own, for 15 minutes, five times at most; it says "edited", and a tap shows what it was
         undo send — your own, for 2 minutes; the thread keeps a line saying one was unsent
         copy
         pass it on — hand it to someone else, with a line of your own if you like. It lands in their thread as a
                    passed item that says where it came from. They can ACCEPT it or PASS IT BACK with a reason
                    (as THEM, here); until one of those, you can TAKE IT BACK. Nothing is deleted either way.
   Not here (the briefs): encryption and delivery (the app proper's), project threads and roles, pin to a frame,
   voice notes and files, requests to a role, digest and do-not-disturb, the sky's light from star to star. The star
   versions of the reactions (ICONS.md) are not in this pack: the emoji stand in for them.
   Kept in this browser (localStorage gj-msg). */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var KEY = 'gj-msg', UNDO = 2 * 6e4, EDIT = 15 * 6e4, EDITS = 5, QUICK = ['🤙', '👍', '🙏', '✋', '👏'];
  var D = { threads: [], n: 1 }; try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.threads) D = s0; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  var skew = 0; function now() { return Date.now() + skew; }                    // (the checks move the clock; nothing else does)
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function thread(id) { return D.threads.filter(function (t) { return t.id === id; })[0]; }
  function msg(t, id) { return t && t.msgs.filter(function (m) { return m.id === id; })[0]; }
  function clock(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return ((h + 11) % 12 + 1) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' am' : ' pm'); }
  function left(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? Math.ceil(s / 60) + ' min' : s + ' s'; }
  function canUndo(m) { return m.me && !m.unsent && !m.pass && now() - m.t < UNDO; }
  function canEdit(m) { return m.me && !m.unsent && !m.pass && now() - m.t < EDIT && (m.edits || []).length < EDITS; }

  var el = document.createElement('div'); el.id = 'msg'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'messages');
  el.innerHTML = '<div class="mg-list"><b class="jul">messages</b><p class="mg-say">nothing here is sent anywhere — this is how the room behaves, on this phone</p>' +
    '<input class="mg-find" type="search" placeholder="search every thread" aria-label="search every thread"><div class="mg-threads"></div>' +
    '<div class="mg-new"><input type="text" maxlength="30" placeholder="a name, to start a thread" aria-label="a name, to start a thread"><button data-a="new" class="on">start</button></div><div class="mg-act"><button data-a="close" class="on">close</button></div></div>' +
    '<div class="mg-thread" hidden><div class="mg-head"><button data-a="back" aria-label="back to the threads">‹</button><b class="jul"></b><span></span></div><div class="mg-log" tabindex="0"></div>' +
    '<div class="mg-more" hidden></div><div class="mg-pass" hidden></div><p class="mg-re" hidden><span></span><button data-a="unre" aria-label="not a reply">×</button></p>' +
    '<div class="mg-as" role="group" aria-label="write as"><span>write as</span><button data-w="me" class="on" aria-pressed="true">me</button><button data-w="them" aria-pressed="false">them</button><em>not sent · this phone only</em></div>' +
    '<div class="mg-comp"><textarea rows="1" placeholder="a message" aria-label="a message"></textarea><button data-a="send" class="on">send</button></div></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, listEl = q('.mg-list'), thEl = q('.mg-thread'), threadsEl = q('.mg-threads'), logEl = q('.mg-log'), moreEl = q('.mg-more'), passEl = q('.mg-pass'), reEl = q('.mg-re'), ta = q('textarea'), find = q('.mg-find'), newIn = q('.mg-new input');
  var on = false, cur = null, sel = null, as = 'me', re = null, editing = null, passing = null, tick = 0;

  function paintList() {
    var f = find.value.trim().toLowerCase(), h = '';
    D.threads.slice().sort(function (a, b) { return (b.msgs.length ? b.msgs[b.msgs.length - 1].t : b.t) - (a.msgs.length ? a.msgs[a.msgs.length - 1].t : a.t); }).forEach(function (t) {
      var hits = f ? t.msgs.filter(function (m) { return !m.unsent && m.text.toLowerCase().indexOf(f) >= 0; }) : null; if (f && !hits.length && t.name.toLowerCase().indexOf(f) < 0) return;
      var lastM = hits && hits.length ? hits[hits.length - 1] : t.msgs[t.msgs.length - 1];
      h += '<button class="mg-t" data-t="' + t.id + '"' + (hits && hits.length ? ' data-m="' + lastM.id + '"' : '') + '><b>' + esc(t.name) + '</b><span>' + (lastM ? esc(lastM.unsent ? (lastM.me ? 'you unsent a message' : 'a message was unsent') : (lastM.me ? 'you: ' : '') + lastM.text).slice(0, 80) : 'nothing yet') + '</span><em>' + (lastM ? clock(lastM.t) : '') + '</em></button>';
    });
    threadsEl.innerHTML = h || '<p class="mg-none">' + (f ? 'nothing found' : 'no threads yet · type a name to start one') + '</p>';
  }
  function bubble(t, m) {
    if (m.unsent) return '<p class="mg-line" data-id="' + m.id + '">' + (m.me ? 'you unsent a message' : esc(t.name) + ' unsent a message') + '</p>';
    var o = m.re != null ? msg(t, m.re) : null, h = '<div class="mg-b' + (m.me ? ' me' : '') + (sel === m.id ? ' sel' : '') + (m.pass ? ' pass' : '') + '" data-id="' + m.id + '">';
    if (m.pass) h += '<small class="mg-from">passed on · from ' + esc(m.pass.from) + (m.pass.chain && m.pass.chain.length > 1 ? ' · by way of ' + esc(m.pass.chain.slice(0, -1).join(', ')) : '') + '</small>';
    if (m.re != null) h += '<button class="mg-q" data-q="' + m.re + '">' + (o && !o.unsent ? esc((o.me ? 'you: ' : t.name + ': ') + o.text).slice(0, 90) : 'a message that is gone') + '</button>';
    h += '<span class="mg-x">' + esc(m.text) + '</span>';
    if (m.pass && m.pass.note) h += '<small class="mg-note">' + esc(m.pass.note) + '</small>';
    if (m.pass) h += '<small class="mg-state">' + (m.pass.state === 'accepted' ? 'accepted' : m.pass.state === 'back' ? 'passed back' + (m.pass.reason ? ' · ' + esc(m.pass.reason) : '') : m.pass.state === 'taken' ? 'taken back' : 'waiting for an answer') + '</small>';
    var r = m.react || {}; if (r.me || r.them) h += '<i class="mg-r">' + (r.them ? '<u data-rw="them">' + esc(r.them) + '</u>' : '') + (r.me ? '<u data-rw="me">' + esc(r.me) + '</u>' : '') + '</i>';
    h += '<em>' + clock(m.t) + ((m.edits || []).length ? ' · <button class="mg-ed" data-h="' + m.id + '">edited</button>' : '') + '</em>';
    if (m.showHist) h += '<small class="mg-hist">' + m.edits.map(function (e) { return 'was: ' + esc(e.text); }).join('<br>') + '</small>';
    return h + '</div>';
  }
  function paintThread(keepScroll) {
    var t = thread(cur); if (!t) return; q('.mg-head b').textContent = t.name; q('.mg-head span').textContent = t.msgs.filter(function (m) { return !m.unsent; }).length ? '' : 'say the first thing';
    var y = logEl.scrollTop; logEl.innerHTML = t.msgs.map(function (m) { return bubble(t, m); }).join('') || '<p class="mg-none">nothing yet</p>'; logEl.scrollTop = keepScroll ? y : logEl.scrollHeight;
    var m = sel != null ? msg(t, sel) : null; moreEl.hidden = !m || !!passing;
    if (m && !passing) {
      var h = '<div class="mg-qr">' + QUICK.map(function (e) { return '<button data-e="' + e + '">' + e + '</button>'; }).join('') + '<input class="mg-any" maxlength="4" placeholder="…" aria-label="any emoji"></div><div class="mg-ops"><button data-o="reply">reply</button><button data-o="copy">copy</button>';
      if (canEdit(m)) h += '<button data-o="edit">edit<small>' + left(EDIT - (now() - m.t)) + ' · ' + (EDITS - (m.edits || []).length) + ' left</small></button>';
      if (canUndo(m)) h += '<button data-o="undo">undo send<small>' + left(UNDO - (now() - m.t)) + '</small></button>';
      if (!m.pass) h += '<button data-o="pass">pass it on</button>';
      if (m.pass && m.pass.state === 'waiting') h += as === 'me' ? '<button data-o="takeback">take it back</button>' : '<button data-o="accept">accept</button><button data-o="passback">pass it back</button>';   // the answers are the other side's
      moreEl.innerHTML = h + '<button data-o="done" class="on">done</button></div>';
    }
    passEl.hidden = !passing;
    if (passing) { var others = D.threads.filter(function (x) { return x.id !== cur; }); passEl.innerHTML = '<span>pass it on to</span>' + (others.length ? others.map(function (x) { return '<button data-p="' + x.id + '"' + (passing.to === x.id ? ' class="on"' : '') + '>' + esc(x.name) + '</button>'; }).join('') : '<em>start another thread first</em>') + '<input class="mg-pn" maxlength="120" placeholder="a line of your own, if you like" value="' + esc(passing.note || '') + '"><button data-o="passgo" class="on"' + (passing.to ? '' : ' disabled') + '>pass it on</button><button data-o="passno">not now</button>'; }
    var ro = re != null ? msg(t, re) : null; reEl.hidden = !ro && editing == null; if (editing != null) reEl.firstChild.textContent = 'editing your message'; else if (ro) reEl.firstChild.textContent = 'replying to: ' + ro.text.slice(0, 70);
    q('[data-a="send"]').textContent = editing != null ? 'save' : 'send';
    [].forEach.call(el.querySelectorAll('.mg-as button'), function (b) { var o = b.dataset.w === as; b.classList.toggle('on', o); b.setAttribute('aria-pressed', o ? 'true' : 'false'); });
  }
  function show(id, mid) { cur = id; sel = null; re = null; editing = null; passing = null; as = 'me'; ta.value = ''; listEl.hidden = true; thEl.hidden = false; paintThread(); if (mid != null) goTo(mid); clearInterval(tick); tick = setInterval(function () { if (on && cur != null && sel != null && !passing) paintThread(true); }, 5000); }
  function back() { cur = null; clearInterval(tick); thEl.hidden = true; listEl.hidden = false; paintList(); }
  function goTo(mid) { var b = logEl.querySelector('[data-id="' + mid + '"]'); if (!b) return; logEl.scrollTop = Math.max(0, b.offsetTop - 60); b.classList.add('flash'); setTimeout(function () { b.classList.remove('flash'); }, 1200); }
  function start(nm) { nm = String(nm || '').trim().slice(0, 30); if (!nm) return null; var t = D.threads.filter(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); })[0]; if (!t) { t = { id: D.n++, name: nm, t: now(), msgs: [] }; D.threads.push(t); save(); } return t.id; }
  function send(text, who, reply) {
    var t = thread(cur); text = String(text || '').trim(); if (!t || !text) return null;
    var m = { id: D.n++, me: (who || as) !== 'them', text: text.slice(0, 2000), t: now(), re: reply != null ? reply : re }; if (m.re == null) delete m.re; t.msgs.push(m); re = null; save(); if (on) paintThread(); GJ.haptic.tick(); return m.id;
  }
  function undo(mid) { var t = thread(cur), m = msg(t, mid); if (!m || !canUndo(m)) return false; m.unsent = true; m.text = ''; delete m.react; if (sel === mid) sel = null; save(); paintThread(true); GJ.haptic.edge(); return true; }
  function edit(mid, text) { var t = thread(cur), m = msg(t, mid); text = String(text || '').trim(); if (!m || !canEdit(m) || !text || text === m.text) return false; (m.edits = m.edits || []).push({ text: m.text, t: now() }); m.text = text.slice(0, 2000); save(); paintThread(true); GJ.haptic.commit(); return true; }
  function react(mid, e, who) { var t = thread(cur), m = msg(t, mid); e = String(e || '').trim(); if (!m || m.unsent) return false; who = who || as; m.react = m.react || {}; if (!e || m.react[who] === e) delete m.react[who]; else m.react[who] = Array.from(e)[0] === e ? e : Array.from(e).slice(0, 2).join(''); save(); paintThread(true); GJ.haptic.tick(); return true; }
  function passOn(mid, to, note) {
    var t = thread(cur), m = msg(t, mid), d = thread(to); if (!m || !d || m.unsent || d.id === t.id) return null;
    var chain = (m.pass && m.pass.chain ? m.pass.chain : []).concat([t.name]), p = { id: D.n++, me: true, text: m.text, t: now(), pass: { from: chain[0], chain: chain, note: String(note || '').trim().slice(0, 120), state: 'waiting', src: [t.id, m.id] } };
    d.msgs.push(p); save(); GJ.haptic.commit(); return p.id;
  }
  function answer(mid, how, reason) { var t = thread(cur), m = msg(t, mid); if (!m || !m.pass || m.pass.state !== 'waiting') return false; if (how === 'taken' && !m.me) return false; m.pass.state = how; if (reason) m.pass.reason = String(reason).slice(0, 120); save(); paintThread(true); GJ.haptic.commit(); return true; }

  var holdT = 0, held = false;
  logEl.addEventListener('pointerdown', function (e) { var b = e.target.closest('.mg-b'); if (!b || e.target.closest('button')) return; held = false; clearTimeout(holdT); holdT = setTimeout(function () { held = true; sel = +b.dataset.id; passing = null; paintThread(true); GJ.haptic.commit(); }, 480); });
  ['pointerup', 'pointercancel', 'pointerleave', 'scroll'].forEach(function (n) { logEl.addEventListener(n, function () { clearTimeout(holdT); }); });
  logEl.addEventListener('contextmenu', function (e) { if (e.target.closest('.mg-b')) e.preventDefault(); });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button, u'); if (!b) return; e.stopPropagation(); var a = b.dataset.a, o = b.dataset.o, t = thread(cur), m = t && sel != null ? msg(t, sel) : null;
    if (b.dataset.t) show(+b.dataset.t, b.dataset.m != null ? +b.dataset.m : null);
    else if (a === 'new') { var id = start(newIn.value); if (id != null) { newIn.value = ''; show(id); } }
    else if (a === 'close') close(); else if (a === 'back') back();
    else if (a === 'send') { if (editing != null) { edit(editing, ta.value); editing = null; sel = null; ta.value = ''; paintThread(true); } else if (send(ta.value) != null) ta.value = ''; }
    else if (a === 'unre') { re = null; if (editing != null) { editing = null; ta.value = ''; } paintThread(true); }
    else if (b.dataset.w) { as = b.dataset.w; paintThread(true); }
    else if (b.dataset.q) goTo(+b.dataset.q);
    else if (b.dataset.h) { var hm = msg(t, +b.dataset.h); if (hm) { hm.showHist = !hm.showHist; paintThread(true); } }
    else if (b.dataset.rw) { var bb = b.closest('.mg-b'); if (bb && b.dataset.rw === as) react(+bb.dataset.id, ''); }
    else if (b.dataset.e && m) { react(m.id, b.dataset.e); sel = null; paintThread(true); }
    else if (b.dataset.p && passing) { passing.to = +b.dataset.p; passing.note = (passEl.querySelector('.mg-pn') || {}).value || ''; paintThread(true); }
    else if (o === 'reply' && m) { re = m.id; sel = null; paintThread(true); try { ta.focus(); } catch (x) {} }
    else if (o === 'copy' && m) { try { G.navigator.clipboard.writeText(m.text); } catch (x) {} sel = null; paintThread(true); }
    else if (o === 'edit' && m) { editing = m.id; ta.value = m.text; sel = null; paintThread(true); try { ta.focus(); } catch (x) {} }
    else if (o === 'undo' && m) undo(m.id);
    else if (o === 'pass' && m) { passing = { id: m.id, to: null, note: '' }; paintThread(true); }
    else if (o === 'passgo' && passing && passing.to) { var pid = passOn(passing.id, passing.to, (passEl.querySelector('.mg-pn') || {}).value), to = passing.to; passing = null; sel = null; if (pid != null) show(to, pid); else paintThread(true); }
    else if (o === 'passno') { passing = null; paintThread(true); }
    else if (o === 'accept' && m) { answer(m.id, 'accepted'); sel = null; paintThread(true); }
    else if (o === 'passback' && m) { answer(m.id, 'back', ta.value.trim()); ta.value = ''; sel = null; paintThread(true); }
    else if (o === 'takeback' && m) { answer(m.id, 'taken'); sel = null; paintThread(true); }
    else if (o === 'done') { sel = null; paintThread(true); }
  });
  el.addEventListener('change', function (e) { if (e.target.classList.contains('mg-any') && sel != null && e.target.value.trim()) { react(sel, e.target.value); sel = null; paintThread(true); } });
  el.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter' && e.target === newIn) q('[data-a="new"]').click(); });
  find.addEventListener('input', paintList);
  function open() { if (on) return; on = true; html.classList.add('messaging'); if (cur != null && thread(cur)) show(cur); else back(); GJ.haptic.tick(); }
  function close() { if (!on) return; on = false; clearInterval(tick); html.classList.remove('messaging'); }
  GJ.messages = { draft: function (nm, text) { var id = start(nm); if (id == null) return false; open(); show(id); ta.value = String(text || ''); return true; },   // a draft, placed in the composer: never sent
    open: open, close: close, isOpen: function () { return on; }, start: start, show: show, back: back, send: send, undo: undo, edit: edit, react: react, pass: passOn, answer: answer, hold: function (id) { sel = id; passing = null; if (on) paintThread(true); }, as: function (w) { as = w === 'them' ? 'them' : 'me'; if (on && cur != null) paintThread(true); }, skew: function (ms) { skew = ms || 0; if (on && cur != null) paintThread(true); },
    state: function () { var t = thread(cur); return { on: on, threads: D.threads.map(function (x) { return x.name; }), cur: t ? t.name : null, as: as, sel: sel, re: re, editing: editing, msgs: t ? t.msgs.map(function (m) { return { id: m.id, me: m.me, text: m.text, unsent: !!m.unsent, edits: (m.edits || []).length, re: m.re == null ? null : m.re, react: m.react || {}, pass: m.pass ? m.pass.state : null, from: m.pass ? m.pass.from : null, canUndo: canUndo(m), canEdit: canEdit(m) }; }) : [] }; } };
})(window);
