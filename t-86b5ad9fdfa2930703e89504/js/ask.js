/* oz · Ask. A chat to Artist Agent in the same glass language as Messages.
   Moon dial → ask, or a tap on the F3 constellation. Search the app is still here, under “search the app”. */
(function (G) {
  'use strict';
  var GJ = G.GJ, app = GJ.app, html = document.documentElement;
  var KEY = 'oz-ask-thread', SYS = 'Artist Agent replies here.';
  var EMOJI = ['🫶', '❤️', '😭', '😂', '🔥', '✨', '🙏', '👍', '😍', '🥰', '😊', '🫡', '🫠', '🫧', '🌸', '🌙', '⭐', '💯', '🤔', '🙌'];
  var lastEmoji = '🫶';
  try { var le = localStorage.getItem('oz-last-emoji'); if (le) lastEmoji = le; } catch (e) {}
  var thread = { msgs: [] };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && Array.isArray(s0.msgs)) thread = s0; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ msgs: thread.msgs.slice(-80) })); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clock(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return ((h + 11) % 12 + 1) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM'); }
  function seed() {
    if (!thread.msgs.some(function (m) { return m.sys && /Artist Agent replies/.test(m.text); })) {
      thread.msgs.unshift({ id: 's' + Date.now(), sys: true, text: SYS, t: Date.parse('2026-11-20T17:00:00-07:00') || Date.now() - 7200e3 });
    }
    save();
  }
  function skin() {
    var s = GJ.store && GJ.store.get && GJ.store.get();
    var tone = s && GJ.TONES && GJ.TONES[s.tone];
    var lightOn = false;
    try { lightOn = localStorage.getItem('oz-im-light') === '1'; } catch (e) {}
    html.classList.toggle('tone-rose', !!(s && s.red && tone && tone.id === 'rose' && !lightOn));
    html.classList.toggle('im-light', !!lightOn);
  }

  var ICO = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5L8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    f3: '<img class="im-f3ico" src="icons/truemoji/f3.png" alt="">'
  };

  var el = document.createElement('div');
  el.id = 'ask';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Ask');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="ak-chat">' +
      '<div class="ak-head">' +
        '<button class="im-back" data-a="close" aria-label="close">' + ICO.back + '</button>' +
        '<button class="ak-who mg-who" data-a="info" aria-label="how it leaves"><span class="im-ava sm">A</span><span class="mg-who-txt"><span class="im-name">Ask</span><span class="im-who-link" hidden></span></span></button>' +
        '<div class="mg-lane">' +
          '<button class="im-icon mg-thbtn" data-a="tothreads" aria-label="Threads"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12M6 12h9M6 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
          '<button class="im-icon mg-f3btn" data-a="linkfig" aria-label="F1 to F3, link status">' + ICO.f3 +
            '<div class="im-svc" aria-hidden="true"><svg class="im-svc-arc am-arc" viewBox="0 0 120 18" width="120" height="18"></svg><i class="im-svc-pkt"></i><i class="im-warp"></i></div>' +
          '</button>' +
          '<div class="im-telem" hidden><p class="im-linkread">signal · listening</p></div>' +
          '<button class="im-icon" data-a="search" aria-label="search the app" style="font:600 13px Poppins,sans-serif">Aa</button>' +
        '</div>' +
      '</div>' +
      '<div class="ak-log" aria-live="polite"></div>' +
      '<div class="im-comp">' +
        '<button class="im-plus" data-a="plus" aria-label="more">' + ICO.plus + '</button>' +
        '<div class="im-field"><textarea rows="1" placeholder="Message" aria-label="a message" enterkeyhint="send"></textarea><button class="im-emoji" data-a="emoji" aria-label="emoji">🫶</button></div>' +
        '<button class="im-mic" data-a="mic" aria-label="voice">' + ICO.mic + '</button>' +
        '<button class="im-send" data-a="send" aria-label="send">' + ICO.send + '</button>' +
      '</div>' +
      '<div class="im-drawer" hidden></div>' +
      '<div class="im-emojis" hidden></div>' +
      '<div class="mg-info ak-info" hidden>' +
        '<div class="mg-info-head"><button class="im-back" data-a="infoback" aria-label="back">' + ICO.back + '</button></div>' +
        '<div class="mg-info-hero"><span class="im-ava">A</span><h2>Artist Agent</h2></div>' +
        '<div class="im-row"><b>How it leaves</b><div class="im-tog" role="radiogroup" aria-label="how it leaves"><button type="button" data-m="direct">Direct</button><button type="button" data-m="mesh">Mesh</button></div></div>' +
        '<div class="im-row"><b>F3</b><span class="im-f3lab">direct</span></div>' +
        '<div class="im-row"><b>F1</b><span>on this phone</span></div>' +
        '<div class="im-row im-linkrow"><b>The link</b><span class="im-linkread">signal · listening</span></div>' +
        '<div class="im-linkpulse" aria-hidden="true"><svg class="im-linkarc" viewBox="0 0 24 24"></svg></div>' +
      '</div>' +
    '</div>' +
    '<div class="ak-search" hidden>' +
      '<b>search the app</b>' +
      '<input type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="search the app" aria-label="search the app">' +
      '<div class="ak-list" role="list"></div>' +
      '<span class="ak-foot"></span>' +
      '<div class="ak-act"><button type="button" data-a="backchat">Back to ask</button></div>' +
    '</div>';
  document.body.appendChild(el);

  var chatEl = el.querySelector('.ak-chat'), searchEl = el.querySelector('.ak-search'), infoEl = el.querySelector('.ak-info');
  var logEl = el.querySelector('.ak-log'), ta = el.querySelector('textarea'), comp = el.querySelector('.im-comp');
  var drawer = el.querySelector('.im-drawer'), emojis = el.querySelector('.im-emojis');
  var so = el.querySelector('.ak-search input'), listEl = el.querySelector('.ak-list'), foot = el.querySelector('.ak-foot');
  var items = [], shown = [], view = 'chat', timesOn = false, n = 1;

  function out() { return GJ.askOut; }
  function curMode() { return out() ? out().mode() : 'direct'; }
  function setEmoji(e) {
    lastEmoji = e || lastEmoji;
    try { localStorage.setItem('oz-last-emoji', lastEmoji); } catch (x) {}
    el.querySelectorAll('.im-emoji').forEach(function (b) { b.textContent = lastEmoji; });
  }
  setEmoji(lastEmoji);
  function paintF3() {
    var mesh = curMode() === 'mesh';
    var live = !!(html.classList.contains('f3-out'));
    el.querySelectorAll('.mg-f3btn').forEach(function (b) { b.classList.toggle('mesh', mesh); b.classList.toggle('live', live); });
    var lab = el.querySelector('.im-f3lab'); if (lab) lab.textContent = mesh ? 'mesh (simulated)' : 'direct';
    var st = GJ.askOut && GJ.askOut.link ? GJ.askOut.link.state() : null;
    el.querySelectorAll('.im-linkread').forEach(function (n) { n.textContent = st ? st.label : 'signal · listening'; });
    el.querySelectorAll('.im-linkfig').forEach(function (n) { n.textContent = st && st.fig ? st.fig : '·'; });
    var line = '';
    if (st && st.kind === 'listening') line = 'listening';
    else if (st && st.kind === 'none') line = 'on this phone';
    else if (st && st.kind && st.kind !== 'off') line = st.fig || '';
    el.querySelectorAll('.im-who-link').forEach(function (n) { n.textContent = line; n.hidden = !line; });
    el.querySelectorAll('.im-tog button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-m') === curMode()); });
  }
  function grow() {
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
    comp.classList.toggle('has-text', !!ta.value.trim());
  }
  function stateLine(m) {
    if (!m.out) return '';
    if (m.out.state === 'arrived') return 'Delivered';
    if (m.out.state === 'queued') return m.out.label || 'Waiting to go';
    if (m.out.state === 'hop' && m.out.label) return m.out.label;
    return m.out.label || (m.out.state === 'sending' ? 'Sending' : '');
  }
  function paintLog(keep) {
    seed();
    var y = logEl.scrollTop, lastDel = '';
    var h = thread.msgs.map(function (m, i) {
      var prev = thread.msgs[i - 1], next = thread.msgs[i + 1];
      if (m.sys) return '<p class="im-sys">' + esc(m.text) + '</p>';
      var gapPrev = !prev || prev.sys || prev.me !== m.me || m.t - prev.t > 120000;
      var gapNext = !next || next.sys || next.me !== m.me || next.t - m.t > 120000;
      var run = gapPrev && gapNext ? 'run-alone' : gapPrev ? 'run-start' : gapNext ? 'run-end' : 'run-mid';
      var stamp = !prev || m.t - (prev.t) > 15 * 60 * 1000 || (prev.sys && !m.sys);
      var b = (stamp ? '<p class="im-stamp">' + esc(clock(m.t)) + '</p>' : '') +
        '<div class="im-b ' + (m.me ? 'me' : 'them') + ' ' + run + '" data-id="' + m.id + '"><span class="im-x">' + esc(m.text) + '</span><em class="im-time">' + esc(clock(m.t)) + '</em></div>';
      if (m.me) lastDel = stateLine(m);
      return b;
    }).join('');
    if (lastDel) h += '<p class="im-deliv">' + esc(lastDel) + '</p>';
    logEl.innerHTML = h || '<p class="mg-none">Write something · it leaves this phone for Artist Agent</p>';
    logEl.classList.toggle('times', timesOn);
    logEl.scrollTop = keep ? y : logEl.scrollHeight;
    paintF3();
  }
  function setView(v) {
    view = v;
    chatEl.hidden = v !== 'chat' && v !== 'info';
    searchEl.hidden = v !== 'search';
    if (infoEl) infoEl.hidden = v !== 'info';
    if (v === 'chat') { var log = chatEl.querySelector('.ak-log'); if (log) log.parentElement && (infoEl.hidden = true); }
    if (v === 'search') { try { so.focus({ preventScroll: true }); } catch (e) {} }
    else if (v === 'chat') { try { ta.focus({ preventScroll: true }); } catch (e) {} }
  }

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function build() {
    items = [];
    if (GJ.navmap) GJ.navmap.nodes().forEach(function (n) {
      items.push({ kind: 'place', id: n.id, name: n.name, sub: n.cl, key: norm(n.name + ' ' + n.cl + ' ' + n.id) });
    });
    else if (GJ.sky && GJ.sky.nodes) GJ.sky.nodes.forEach(function (n) {
      if (!n.custom) items.push({ kind: 'place', id: n.id, name: n.label, sub: 'place', key: norm(n.label + ' ' + n.id) });
    });
    [].forEach.call(document.querySelectorAll('#tune .row, .tune .row'), function (row) {
      var btn = row.querySelector('button[data-t]');
      if (!btn) return;
      var name = '';
      [].forEach.call(row.childNodes, function (n) { if (n.nodeType === 3) name += n.textContent; });
      name = name.trim();
      if (name) items.push({ kind: 'tune', id: btn.getAttribute('data-t'), name: name, sub: 'tune', key: norm(name + ' tune ' + btn.getAttribute('data-t')), row: row });
    });
  }
  function find(qstr) {
    var parts = norm(qstr).split(' ').filter(Boolean);
    if (!parts.length) return items.filter(function (i) { return i.kind === 'place'; });
    return items.map(function (i) {
      var score = 0;
      for (var p = 0; p < parts.length; p++) {
        var at = i.key.indexOf(parts[p]);
        if (at < 0) return null;
        score += at === 0 ? 3 : (i.key.charAt(at - 1) === ' ' ? 2 : 1);
      }
      return { i: i, s: score + (i.kind === 'place' ? 0.5 : 0) };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.i; });
  }
  function paintSearch() {
    shown = find(so.value).slice(0, 40);
    listEl.innerHTML = shown.map(function (i, k) {
      return '<button role="listitem" data-k="' + k + '"><span>' + i.name + '</span><i>' + i.sub + '</i></button>';
    }).join('');
    foot.textContent = shown.length ? (so.value ? shown.length + (shown.length === 1 ? ' match' : ' matches') : 'every place · type to search places and tune') : 'nothing by that name';
  }
  function go(k) {
    var i = shown[k];
    if (!i) return;
    close();
    GJ.haptic.commit();
    if (i.kind === 'place') { if (GJ.navmap) GJ.navmap.go(i.id); else app.enter(i.id); return; }
    GJ.dial.hideNow();
    app.tune(true);
    setTimeout(function () {
      try { i.row.scrollIntoView({ block: 'center' }); } catch (e) {}
      i.row.classList.add('ak-here');
      setTimeout(function () { i.row.classList.remove('ak-here'); }, 2400);
    }, 80);
  }
  function send() {
    var text = ta.value.trim();
    if (!text) return;
    var m = { id: 'a' + Date.now() + (++n), text: text.slice(0, 2000), t: Date.now(), me: true, out: { state: 'sending', mode: curMode() } };
    thread.msgs.push(m);
    save();
    ta.value = '';
    grow();
    paintLog();
    try { GJ.haptic.tick(); } catch (e) {}
    if (!out()) { m.out = { state: 'queued', label: 'Waiting to go' }; save(); paintLog(true); return; }
    out().send({ source: 'oz', mode: curMode(), text: m.text, room: out().room(), onState: function (st) {
      m.out = st;
      save();
      if (isOpen()) paintLog(true);
    } });
  }

  function isOpen() { return html.classList.contains('asking'); }
  function open(qstr) {
    skin(); seed(); paintLog(); paintF3();
    setView(qstr ? 'search' : 'chat');
    if (qstr) { build(); so.value = qstr; paintSearch(); }
    html.classList.add('asking');
    if (GJ.askOut && GJ.askOut.link) { GJ.askOut.link.start(); if (GJ.askOut.link.on) GJ.askOut.link.on(function () { if (isOpen()) paintF3(); }); }
    el.setAttribute('aria-hidden', 'false');
    if (view === 'chat') { try { ta.focus({ preventScroll: true }); } catch (e) {} }
  }
  function close() {
    if (!isOpen()) return;
    html.classList.remove('asking');
    if (GJ.askOut && GJ.askOut.link) GJ.askOut.link.stop();
    el.setAttribute('aria-hidden', 'true');
    try { ta.blur(); so.blur(); } catch (e) {}
  }

  el.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b) { if (e.target === el) close(); return; }
    var a = b.getAttribute('data-a');
    if (a === 'send') send();
    else if (a === 'close') close();
    else if (a === 'search') { build(); so.value = ''; paintSearch(); searchEl.hidden = false; chatEl.hidden = true; try { so.focus({ preventScroll: true }); } catch (x) {} }
    else if (a === 'backchat') { searchEl.hidden = true; chatEl.hidden = false; infoEl.hidden = true; try { ta.focus({ preventScroll: true }); } catch (x) {} }
    else if (a === 'tothreads') { if (GJ.messages && GJ.messages.toThreads) GJ.messages.toThreads(); }
    else if (a === 'linkfig') { var pop = el.querySelector('.im-telem'); if (pop) { pop.hidden = !pop.hidden; if (!pop.hidden) paintF3(); } }
    else if (a === 'info') { infoEl.hidden = false; paintF3(); }
    else if (a === 'infoback') { infoEl.hidden = true; }
    else if (a === 'plus') {
      emojis.hidden = true; drawer.hidden = !drawer.hidden;
      if (!drawer.hidden) drawer.innerHTML = [['photo', 'Photo'], ['frame', 'A frame'], ['dial', 'A dial'], ['voice', 'Voice note']].map(function (x) {
        return '<button data-att="' + x[0] + '"><span class="im-tile">·</span>' + x[1] + '</button>';
      }).join('');
    } else if (a === 'emoji') {
      drawer.hidden = true; emojis.hidden = !emojis.hidden;
      if (!emojis.hidden) emojis.innerHTML = EMOJI.map(function (em) { return '<button data-ins="' + em + '">' + em + '</button>'; }).join('');
    } else if (a === 'mic') { try { GJ.haptic.tick(); } catch (x) {} if (GJ.mark) GJ.mark.say('voice notes, soon', 1200); }
    else if (b.hasAttribute('data-k')) go(+b.getAttribute('data-k'));
    else if (b.dataset.ins) { ta.value += b.dataset.ins; setEmoji(b.dataset.ins); emojis.hidden = true; grow(); }
    else if (b.dataset.att) { drawer.hidden = true; if (GJ.mark) GJ.mark.say('attachments, soon', 1200); }
    else if (b.dataset.m) { if (out()) out().setMode(b.dataset.m); paintF3(); try { GJ.haptic.tick(); } catch (x) {} }
  });
  ta.addEventListener('input', grow);
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    else if (e.key === 'Escape') close();
  });
  so.addEventListener('input', paintSearch);
  so.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); if (shown.length) go(0); }
    else if (e.key === 'Escape') { searchEl.hidden = true; chatEl.hidden = false; }
  });
  if (out() && out().onMode) out().onMode(function () { if (isOpen()) paintF3(); });

  function lookup(qstr) {
    build();
    return find(qstr).slice(0, 6).map(function (i) {
      return { kind: i.kind, id: i.id, name: i.name, sub: i.sub };
    });
  }
  GJ.ask = {
    open: open, close: close, isOpen: isOpen,
    find: function (qstr) { return lookup(qstr).map(function (i) { return i.kind + ':' + i.id; }); },
    lookup: lookup,
    go: go,
    shown: function () { return shown.map(function (i) { return i.kind + ':' + i.id; }); },
    thread: function () { return thread.msgs.slice(); },
    emojiOpen: function () { if (isOpen()) { drawer.hidden = true; emojis.hidden = false; emojis.innerHTML = EMOJI.map(function (em) { return '<button data-ins="' + em + '">' + em + '</button>'; }).join(''); } return !emojis.hidden; }
  };
})(window);
