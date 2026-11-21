/* oz · Messages. Same jobs as before (reply, edit, undo send, tapbacks, pass it on), now in oz's glass language
   on the dark sky: a thread list, luminous bubbles, a rounded compose bar. Artist Agent is sent out; other
   threads stay on this phone. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var KEY = 'gj-msg', UNDO = 2 * 6e4, EDIT = 15 * 6e4, EDITS = 5;
  var TAP = [':hands-star:', ':hands:', ':highfive-star:', ':highfive:', ':clap:', ':shaka-star:', ':shaka:', ':thumbs-star:', ':thumbs:'];
  var EMOJI = ['🫶🏽', '❤️', '😭', '😂', '🔥', '✨', '🙏🏽', '👍🏽', '👎', '😍', '🥰', '😊', '😘', '🤔', '🙌🏽', '👏🏽', '😎', '🫡', '🫠', '🫧', '🌸', '🌙', '⭐', '💯', '‼️', '❓', '😢', '😅', '🤗', '👀', '🤙🏽', '✋🏽', '👋🏽', '✌🏽', '🤞🏽', '🤝'];
  var TE_IDS = ['hands', 'highfive', 'clap', 'shaka', 'thumbs'];
  var TE_NEW = ['goodnight', 'callme', 'goldenhour', 'dnd', 'hearthands', 'clapper', 'paw'];   // bubble round: new in the standard pack, 3D only
  var lastEmoji = ':hands-star:';
  function isTe(e) { return /^:[a-z]+(?:-star)?:$/.test(String(e || '')); }
  function teHtml(token) {
    var m = /^:([a-z]+)(-star)?:$/.exec(String(token || ''));
    if (!m) return '';
    if (m[1] === 'highfivemini') {
      return '<span class="te-hfstd"><img class="te te-3d" src="icons/truemoji/highfive-std.png" alt=""></span>';
    }
    if (TE_NEW.indexOf(m[1]) >= 0 && !m[2]) return '<img class="te te-3d" src="icons/truemoji/' + m[1] + '-3d.png" alt="">';
    if (TE_IDS.indexOf(m[1]) < 0) return '';
    var id = m[1];
    if (m[2]) {
      return '<span class="te te-starwrap" data-te="' + id + '">' +
        '<img class="te-star te-night" src="icons/truemoji/' + id + '-night.png" alt="">' +
        '<img class="te-star te-red" src="icons/truemoji/' + id + '-red.png" alt="">' +
        '<img class="te-star te-rose" src="icons/truemoji/' + id + '-rose.png" alt="">' +
      '</span>';
    }
    return '<img class="te te-3d" src="icons/truemoji/' + id + '-3d.png" alt="">';
  }
  function tePhone() {
    return '<span class="te-phone">' +
      '<img class="te-star te-night" src="icons/truemoji/phone-night.png" alt="">' +
      '<img class="te-star te-red" src="icons/truemoji/phone-red.png" alt="">' +
      '<img class="te-star te-rose" src="icons/truemoji/phone-rose.png" alt="">' +
    '</span>';
  }
  function rich(text) {
    return esc(String(text || '')).replace(/:([a-z]+)(-star)?:/g, function (raw, id, star) {
      return teHtml(':' + id + (star || '') + ':') || raw;
    });
  }
  try { var le = localStorage.getItem('oz-last-emoji'); if (le) lastEmoji = le; } catch (e) {}
  var D = { threads: [], n: 1 }; try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.threads) D = s0; } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  /* r6 · the builder's tools, in our skin: media kept exactly as it came (photos, files, voice notes, stickers), translate,
     disappearing, pin · mute · hide · lock, send later, distill to Notes, the call handoff. Blobs live on this phone
     (GJ.keep, 'mo:<id>'); nothing is re-encoded, graded or tinted. */
  var BLOBS = {};
  function blobURL(m) { if (m.src) return m.src; if (BLOBS[m.id]) return BLOBS[m.id]; if (GJ.keep) GJ.keep.get('mo:' + m.id).then(function (b) { if (b && !BLOBS[m.id]) { BLOBS[m.id] = URL.createObjectURL(b); if (on && cur != null) paintThread(true); } }); return ''; }
  function size(n) { n = +n || 0; return n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }
  function mmss(x) { x = Math.max(0, Math.round(x || 0)); return Math.floor(x / 60) + ':' + (x % 60 < 10 ? '0' : '') + x % 60; }
  var DIS = [0, 3600000, 86400000, 604800000], DISN = { 0: 'off', 3600000: '1 hour', 86400000: '1 day', 604800000: '7 days' };
  function expire(t) { var n0 = Date.now(), k = t.msgs.length; t.msgs = t.msgs.filter(function (m) { return !m.until || m.until > n0; }); return k !== t.msgs.length; }
  function person(t) { return t && !isAgent(t) && !isOz(t) && !isCreator(t); }
  function kindLine(m) { return m.kind === 'photo' ? (m.cam ? 'A capture' : 'Photo') : m.kind === 'video' ? 'Video' : m.kind === 'file' ? 'File · ' + (m.name || '') : m.kind === 'voice' ? 'Voice note · ' + mmss(m.dur) : m.kind === 'sticker' ? 'Sticker' : ''; }
  function wave(id) { var r = (id * 9301 + 49297) % 233280, h = ''; for (var i = 0; i < 28; i++) { r = (r * 9301 + 49297) % 233280; var v = 3 + (r / 233280) * 14; h += '<rect x="' + (i * 4) + '" y="' + (10 - v / 2).toFixed(1) + '" width="1.4" height="' + v.toFixed(1) + '" rx=".7"/>'; } return '<svg class="mo-wave" viewBox="0 0 112 20" aria-hidden="true">' + h + '</svg>'; }
  function mediaHtml(m) {
    if (m.kind === 'photo') return '<img class="mo-photo" src="' + esc(blobURL(m)) + '" alt="' + (m.cam ? 'a capture' : 'a photo') + '" draggable="false">' + (m.cam ? '<small class="mo-cap">' + (m.look ? 'a capture · the copy with ' + esc(m.look) : 'a capture · the original, untouched') + (m.fullRed ? ' · full red, as taken' : '') + '</small>' : '') + (m.example ? '<small class="mo-ex">example</small>' : '');
    if (m.kind === 'video') return '<video class="mo-photo" src="' + esc(blobURL(m)) + '" controls playsinline preload="metadata"></video>';
    if (m.kind === 'sticker') return '<img class="mo-sticker" src="' + esc(m.src) + '" alt="a sticker from your own frame" draggable="false">';
    if (m.kind === 'file') return '<span class="mo-file"><b>' + esc(m.name || 'a file') + '</b><small>' + esc(size(m.size)) + ' · kept exactly as it came</small>' + (m.example ? '<small class="mo-ex">example</small>' : '<a class="mo-dl" href="' + esc(blobURL(m)) + '" download="' + esc(m.name || 'file') + '">save it</a>') + '</span>';
    if (m.kind === 'voice') return '<span class="mo-voice"><u data-vp="' + m.id + '">' + (playing === m.id ? 'pause' : 'play') + '</u>' + wave(m.id) + '<em>' + mmss(m.dur) + '</em><u data-vs="' + m.id + '">' + (m.speed || 1) + '×</u></span>' + (m.example ? '<small class="mo-ex">example voice note</small>' : '');
    return '';
  }
  var playing = null, audio = new Audio();
  var skew = 0; function now() { return Date.now() + skew; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function thread(id) { return D.threads.filter(function (t) { return t.id === id; })[0]; }
  function msg(t, id) { return t && t.msgs.filter(function (m) { return m.id === id; })[0]; }
  function clock(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return ((h + 11) % 12 + 1) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM'); }
  function whenList(t) {
    var d = new Date(t), n = new Date(now()), same = d.toDateString() === n.toDateString();
    var y = new Date(now() - 864e5).toDateString() === d.toDateString();
    if (same) return clock(t).replace(' AM', ' AM').replace(' PM', ' PM');
    if (y) return 'Yesterday';
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + String(d.getFullYear()).slice(2);
  }
  function stamp(t) {
    var d = new Date(t), n = new Date(now()), same = d.toDateString() === n.toDateString();
    var y = new Date(now() - 864e5).toDateString() === d.toDateString();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var head = same ? '' : (y ? 'Yesterday ' : days[d.getDay()] + ' ');
    return head + clock(t);
  }
  function left(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? Math.ceil(s / 60) + ' min' : s + ' s'; }
  function canUndo(m) { return m.me && !m.unsent && !m.pass && !m.sys && now() - m.t < UNDO; }
  function canEdit(m) { return m.me && !m.unsent && !m.pass && !m.sys && now() - m.t < EDIT && (m.edits || []).length < EDITS; }
  function initial(name) { var p = String(name || '').trim().split(/\s+/); return ((p[0] && p[0][0]) || '?') + (p[1] && p[1][0] || ''); }
  function avaHTML(t, sm) {
    if (isAgent(t)) return '<span class="im-ava star' + (sm ? ' sm' : '') + '" aria-hidden="true"><img src="icons/artist-agent-a.png" alt=""><i></i></span>';
    if (isOz(t)) return '<span class="im-ava oz' + (sm ? ' sm' : '') + '" aria-hidden="true"><em></em></span>';
    if (isCreator(t)) return '<span class="im-ava star creator' + (sm ? ' sm' : '') + '" aria-hidden="true"><em></em></span>';
    return '<span class="im-ava' + (sm ? ' sm' : '') + '">' + esc(initial(t.name).toUpperCase()) + '</span>';
  }
  var LIGHT_KEY = 'oz-im-light', lightOn = false;
  try { lightOn = localStorage.getItem(LIGHT_KEY) === '1'; } catch (e) {}
  function skin() {
    var s = GJ.store && GJ.store.get && GJ.store.get();
    var tone = s && GJ.TONES && GJ.TONES[s.tone];
    html.classList.toggle('tone-rose', !!(s && s.red && tone && tone.id === 'rose' && !lightOn));
    html.classList.toggle('im-light', !!lightOn || !!(s && s.dayMode && !s.red));   // bubble round: day mode is light here too
  }
  function setLight(v) {
    lightOn = !!v;
    try { localStorage.setItem(LIGHT_KEY, lightOn ? '1' : '0'); } catch (e) {}
    skin();
    if (on) { if (cur != null) paintThread(true); else paintList(); paintInfo(); }
    return lightOn;
  }

  var AGENT = 'Artist Agent';
  var SYS = 'Artist Agent replies here.';
  function isAgent(t) { return t && t.name === AGENT; }
  function isOz(t) { return t && (t.oz || t.name === 'oz chat'); }
  function isCreator(t) { return t && (t.creator || t.name === 'creator'); }
  function seedAgent(t) {
    if (!t.msgs.some(function (m) { return m.sys && /Artist Agent replies/.test(m.text); })) {
      var ts = t.msgs.length ? Math.min.apply(null, t.msgs.map(function (m) { return m.t; })) - 60000 : now() - 3600e3;
      t.msgs.unshift({ id: D.n++, sys: true, text: SYS, t: ts });
    }
  }
  function ensureAgent() {
    var t = D.threads.filter(function (x) { return x.name === AGENT; })[0];
    if (!t) { t = { id: D.n++, name: AGENT, t: now(), msgs: [], agent: true, unread: 0 }; D.threads.unshift(t); }
    t.agent = true;
    seedAgent(t);
    save();
    return t;
  }

  var ICO = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5L8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    vid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="12" height="10" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 10.2 21 7.5v9l-6-2.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    call: tePhone(),
    newc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mag: '<svg class="im-mag" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    f3: '<img class="im-f3ico" src="icons/truemoji/f3.png" alt="">',
    threads: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12M6 12h9M6 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  var el = document.createElement('div'); el.id = 'msg-ours'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'messages');
  el.innerHTML =
    '<div class="mg-list">' +
      '<div class="mg-list-head"><button class="im-icon" data-a="close" aria-label="close">' + ICO.x + '</button><h1>Messages</h1><button class="im-icon" data-a="circle" aria-label="Circle">○</button><button class="im-icon" data-a="tognew" aria-label="new conversation">' + ICO.newc + '</button></div>' +
      '<div class="mg-find-wrap">' + ICO.mag + '<input class="mg-find" type="search" placeholder="Search" aria-label="search every thread"></div>' +
      '<div class="mg-threads"></div>' +
      '<div class="mg-new" hidden><input type="text" maxlength="30" placeholder="a name, to start a thread" aria-label="a name, to start a thread"><button data-a="new">Start</button></div>' +
    '</div>' +
    '<div class="mg-thread" hidden>' +
      '<div class="mg-head">' +
        '<button class="im-back" data-a="back" aria-label="back to the threads">' + ICO.back + '</button>' +
        '<button class="mg-who" data-a="info" aria-label="contact info"><span class="im-ava sm"></span><span class="mg-who-txt"><span class="im-name"></span><span class="im-who-link" hidden></span></span></button>' +
        '<div class="mg-lane">' +
          '<button class="im-icon mg-thbtn" data-a="tothreads" aria-label="Threads">' + ICO.threads + '</button>' +
          '<button class="im-icon mg-f3btn" data-a="linkfig" aria-label="F1 to F3, link status">' + ICO.f3 +
            '<div class="im-svc" aria-hidden="true"><svg class="im-svc-arc am-arc" viewBox="0 0 120 18" width="120" height="18"></svg><i class="im-svc-pkt"></i><i class="im-warp"></i></div>' +
          '</button>' +
          '<div class="im-telem" hidden><p class="im-linkread">signal · listening</p></div>' +
          '<div class="mg-calls">' +
            '<a class="im-icon" data-a="face" aria-label="FaceTime" href="facetime://">' + ICO.vid + '</a>' +
            '<a class="im-icon" data-a="sms" aria-label="call or messages" href="sms:">' + ICO.call + '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mg-log" tabindex="0"></div>' +
      '<div class="im-tapbar" hidden></div>' +
      '<div class="im-ops" hidden></div>' +
      '<div class="mg-pass" hidden></div>' +
      '<p class="im-re" hidden><span></span><button data-a="unre" aria-label="cancel">✕</button></p>' +
      '<div class="mo-sheet" hidden role="group" aria-label="more"></div>' +
      '<input type="file" class="mo-file-in" data-k="photo" accept="image/*,video/*" hidden><input type="file" class="mo-file-in" data-k="file" hidden>' +
      '<div class="im-comp">' +
        '<button class="im-plus" data-a="plus" aria-label="more">' + ICO.plus + '</button>' +
        '<div class="im-field"><textarea rows="1" placeholder="Message" aria-label="a message" enterkeyhint="send" autocomplete="off"></textarea><button type="button" class="im-emoji" data-a="emoji" aria-label="emoji">🫶</button></div>' +
        '<button class="im-mic" data-a="mic" aria-label="voice">' + ICO.mic + '</button>' +
        '<button type="button" class="im-send" data-a="send" aria-label="send">' + ICO.send + '</button>' +
      '</div>' +
      '<div class="im-drawer" hidden></div>' +
      '<div class="im-emojis" hidden></div>' +
    '</div>' +
    '<div class="mg-info" hidden>' +
      '<div class="mg-info-head"><button class="im-back" data-a="infoback" aria-label="back">' + ICO.back + '</button><span style="flex:1"></span></div>' +
      '<div class="mg-info-hero"><span class="im-ava-slot"></span><h2></h2><p class="im-sub" hidden></p></div>' +
      '<div class="im-pair" hidden></div>' +
      '<div class="im-row"><b>How it leaves</b><div class="im-tog" role="radiogroup" aria-label="how it leaves"><button type="button" data-m="direct">Direct</button><button type="button" data-m="mesh">Mesh</button></div></div>' +
      '<div class="im-row"><b>F3</b><span class="im-f3lab">direct</span><img class="im-f13ico" src="icons/truemoji/f3.png" alt=""></div>' +
      '<div class="im-row"><b>F1</b><span>on this phone</span><img class="im-f13ico" src="icons/truemoji/f1.png" alt=""></div>' +
      '<div class="im-row im-linkrow"><b>The link</b><span class="im-linkread">signal · listening</span></div>' +
      '<div class="im-linkpulse" aria-hidden="true"><svg class="im-linkarc" viewBox="0 0 24 24"></svg></div>' +
      '<div class="im-row"><b>Measure the link</b><div class="im-tog" role="radiogroup" aria-label="measure the link"><button type="button" data-link="on">On</button><button type="button" data-link="off">Off</button></div></div>' +
      '<div class="im-row"><b>Ground</b><div class="im-tog" role="radiogroup" aria-label="ground"><button type="button" data-ground="sky">Sky</button><button type="button" data-ground="pale">Pale</button></div></div>' +
      '<div class="mo-chat"></div>' +
      '<a class="im-row im-link" data-a="face" href="facetime://">Open in FaceTime</a>' +
      '<a class="im-row im-link" data-a="sms" href="sms:">Open in Messages</a>' +
      '<div class="im-row"><button data-a="tothreads">All conversations</button></div>' +
      '<div class="im-row"><button data-a="rm">Remove this thread</button></div>' +
    '</div>';
  document.body.appendChild(el);

  var q = function (s) { return el.querySelector(s); };
  var listEl = q('.mg-list'), thEl = q('.mg-thread'), infoEl = q('.mg-info');
  var threadsEl = q('.mg-threads'), logEl = q('.mg-log'), moreEl = q('.im-ops'), passEl = q('.mg-pass');
  var reEl = q('.im-re'), ta = q('textarea'), find = q('.mg-find'), newIn = q('.mg-new input');
  var comp = q('.im-comp'), tapbar = q('.im-tapbar'), drawer = q('.im-drawer'), emojis = q('.im-emojis');
  var on = false, cur = null, sel = null, as = 'me', re = null, editing = null, passing = null, tick = 0, typingOn = false, timesOn = false;
  var showHidden = false, sheetEl = q('.mo-sheet'), rec = null;

  function outMode() { return GJ.askOut ? GJ.askOut.mode() : 'direct'; }
  function paintF3() {
    var live = !!(html.classList.contains('f3-out') || (GJ.f3 && GJ.f3.lit && GJ.f3.lit()));
    var mesh = outMode() === 'mesh';
    el.querySelectorAll('.mg-f3btn').forEach(function (b) {
      b.classList.toggle('mesh', mesh);
      b.classList.toggle('live', live);
    });
    var lab = q('.im-f3lab'); if (lab) lab.textContent = mesh ? 'mesh (simulated)' : 'direct';
    paintLink();
    var tog = infoEl.querySelectorAll('.im-tog button');
    tog.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-m') === outMode()); });
  }
  function grow() {
    ta.style.height = 'auto';
    ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
    comp.classList.toggle('has-text', !!ta.value.trim() || editing != null);
  }
  function setEmoji(e) {
    lastEmoji = e || lastEmoji;
    try { localStorage.setItem('oz-last-emoji', lastEmoji); } catch (x) {}
    el.querySelectorAll('.im-emoji').forEach(function (b) {
      if (isTe(lastEmoji)) b.innerHTML = teHtml(lastEmoji);
      else b.textContent = lastEmoji;
    });
  }
  setEmoji(lastEmoji);

  function lastLine(t, lastM) {
    if (!lastM) return 'No messages';
    if (lastM.sys) return lastM.text;
    if (lastM.unsent) return lastM.me ? 'You unsent a message' : 'A message was unsent';
    if (t.locked) return 'Face ID on the phone';
    return (lastM.me ? 'You: ' : '') + (lastM.kind ? kindLine(lastM) + (lastM.text ? ' · ' + lastM.text : '') : lastM.text);
  }
  function paintList() {
    ensureAgent();
    var f = find.value.trim().toLowerCase(), h = '';
    var nHidden = D.threads.filter(function (x) { return x.hidden; }).length;
    D.threads.filter(function (x) { return f || showHidden || !x.hidden; }).sort(function (a, b) {
      if (isAgent(a) !== isAgent(b)) return isAgent(a) ? -1 : 1;
      if (!!a.pin !== !!b.pin) return a.pin ? -1 : 1;   // r6: pinned chats sit at the top, under Artist Agent
      return (b.msgs.length ? b.msgs[b.msgs.length - 1].t : b.t) - (a.msgs.length ? a.msgs[a.msgs.length - 1].t : a.t);
    }).forEach(function (t) {
      var hits = f ? t.msgs.filter(function (m) { return !m.unsent && (m.text || '').toLowerCase().indexOf(f) >= 0; }) : null;
      if (f && !(hits && hits.length) && t.name.toLowerCase().indexOf(f) < 0) return;
      var lastM = hits && hits.length ? hits[hits.length - 1] : t.msgs.filter(function (m) { return !m.sys; }).slice(-1)[0] || t.msgs[t.msgs.length - 1];
      h += '<div class="mg-swipe" data-sw="' + t.id + '"><div class="mg-actions"><button class="pin" data-pin="' + t.id + '">' + (t.pin ? 'Unpin' : 'Pin') + '</button><button class="mute" data-mute="' + t.id + '">' + (t.mute ? 'Unmute' : 'Mute') + '</button><button class="hide" data-hide="' + t.id + '">' + (isAgent(t) ? '—' : t.hidden ? 'Show' : 'Hide') + '</button></div>';
      h += '<button class="mg-t" data-t="' + t.id + '"' + (hits && hits.length && lastM ? ' data-m="' + lastM.id + '"' : '') + '>';
      h += avaHTML(t, false);
      var flags = [t.pin ? 'pinned' : '', t.mute ? 'muted' : '', t.locked ? 'locked' : '', t.hidden ? 'hidden' : '', t.disappear ? 'disappearing' : ''].filter(Boolean);
      h += '<span class="im-nm">' + esc(t.name) + '</span>';
      h += '<span class="im-last">' + (flags.length ? '<i class="mo-flags">' + flags.join(' · ') + '</i>' : '') + esc(lastLine(t, lastM)).slice(0, 80) + '</span>';   // r6: pinned · muted · locked … then the last line
      h += '<em class="im-when">' + (lastM ? whenList(lastM.t) : '') + '</em>';
      if (t.unread) h += '<i class="im-unread" aria-label="unread"></i>';
      h += '</button></div>';
    });
    if (nHidden && !f) h += '<button type="button" class="mo-hidden" data-mo="showhidden">' + (showHidden ? 'put hidden chats away' : 'hidden chats · ' + nHidden) + '</button>';
    threadsEl.innerHTML = h || '<p class="mg-none">' + (f ? 'No results' : 'No conversations yet') + '</p>';
  }

  function groups(t) {
    var out = [], last = null;
    t.msgs.forEach(function (m, i) {
      var prev = t.msgs[i - 1], next = t.msgs[i + 1];
      var gapPrev = !prev || m.sys || prev.sys || prev.me !== m.me || m.t - prev.t > 120000;
      var gapNext = !next || next.sys || m.sys || next.me !== m.me || next.t - m.t > 120000;
      var run = m.sys ? 'sys' : (gapPrev && gapNext ? 'run-alone' : gapPrev ? 'run-start' : gapNext ? 'run-end' : 'run-mid');
      var showStamp = !prev || m.t - prev.t > 15 * 60 * 1000 || (prev.sys && !m.sys);
      out.push({ m: m, run: run, stamp: showStamp });
    });
    return out;
  }
  function outLabel(m) {
    if (!m || !m.out) return '';
    if (m.out.state === 'arrived') return m.out.label || 'Delivered';
    if (m.out.state === 'queued') return m.out.label || 'Waiting to go';
    if (m.out.state === 'hop' && m.out.label) return m.out.label;
    if (m.out.state === 'sending') return 'Sending';
    return '';
  }
  function bubble(t, m, run) {
    if (m.sys) return '<p class="im-sys" data-id="' + m.id + '">' + esc(m.text) + '</p>';
    if (m.unsent) return '<p class="im-line" data-id="' + m.id + '">' + (m.me ? 'You unsent a message' : esc(t.name) + ' unsent a message') + '</p>';
    var o = m.re != null ? msg(t, m.re) : null;
    var media = m.kind ? mediaHtml(m) : '';
    var h = '<div class="im-b ' + (m.me ? 'me' : 'them') + ' ' + (run || '') + (sel === m.id ? ' sel' : '') + (m.pass ? ' pass' : '') + (media ? ' mo-media mo-' + m.kind : '') + (m.sendAt ? ' mo-later' : '') + '" data-id="' + m.id + '">';
    if (m.pass) h += '<small class="im-from">Passed on · from ' + esc(m.pass.from) + '</small>';
    if (m.re != null) h += '<button class="im-q" data-q="' + m.re + '">' + (o && !o.unsent ? esc((o.me ? 'You: ' : t.name + ': ') + (o.text || kindLine(o))).slice(0, 90) : 'A message that is gone') + '</button>';
    if (m.fromOz) h += '<small class="im-fromoz">from oz</small>';
    if (media) h += media + (m.text ? '<span class="im-x">' + rich(m.text) + '</span>' : '');
    else {
    if (m.sealing) h += '<span class="im-x im-sealing" data-plain="' + esc(m.text) + '">' + esc(m.cipher || m.text) + '</span>';
    else if (m.fromOz && m.moreText && !m.openMore) {
      h += '<span class="im-x">' + rich(m.text) + '</span>';
      h += '<button type="button" class="oz-more" data-a="more">more</button>';
    } else {
      h += '<span class="im-x">' + rich((m.openMore && m.moreText) ? m.moreText : m.text) + '</span>';
    }
    }
    if (m.tr) h += '<small class="mo-tr">' + esc(m.tr.text) + '<i>' + esc(m.tr.label || 'translation') + '</i></small>';
    if (m.out && m.out.sealed && m.showCipher) h += '<small class="im-cipher">' + esc(m.out.sealed) + '</small>';
    if (m.bundleHtml) h += m.bundleHtml;
    if (m.cardsHtml && (m.openMore || !m.moreText)) h += m.cardsHtml;
    if (m.actsHtml) h += m.actsHtml;
    if (m.pass && m.pass.note) h += '<small class="im-note">' + esc(m.pass.note) + '</small>';
    if (m.pass) h += '<small class="im-note">' + (m.pass.state === 'accepted' ? 'Accepted' : m.pass.state === 'back' ? 'Passed back' : m.pass.state === 'taken' ? 'Taken back' : 'Waiting for an answer') + '</small>';
    var r = m.react || {}, chips = [r.them, r.me].filter(Boolean);
    if (chips.length) h += '<i class="im-tb-chip">' + chips.map(function (c) { return isTe(c) ? teHtml(c) : esc(c); }).join(' ') + '</i>';
    h += '<em class="im-time">' + (m.sendAt ? 'scheduled · ' + clock(m.sendAt) : stamp(m.t)) + ((m.edits || []).length ? ' · Edited' : '') + (m.until ? ' · goes in ' + left(m.until - Date.now()) : '') + '</em>';
    if (m.sendAt) h += '<small class="im-note">waits on this phone until then</small>';
    if (m.showHist && m.edits) h += '<small class="im-note">' + m.edits.map(function (e) { return 'Was: ' + esc(e.text); }).join('<br>') + '</small>';
    return h + '</div>';
  }
  function lastDelivered(t) {
    var sent = t.msgs.filter(function (m) { return m.me && !m.unsent && !m.sys; });
    var last = sent[sent.length - 1];
    return last && last.out ? outLabel(last) : '';
  }
  function paintThread(keepScroll) {
    var t = thread(cur); if (!t) return;
    if (expire(t)) save();
    skin();
    q('.mg-who .im-name').textContent = t.name;
    var who = q('.mg-who .im-ava, .mg-who .im-ava.star, .mg-who .im-ava.oz');
    if (who) who.outerHTML = avaHTML(t, true);
    else q('.mg-who').insertAdjacentHTML('afterbegin', avaHTML(t, true));
    q('.mg-calls a[data-a=face]').setAttribute('href', 'facetime://');
    q('.mg-calls a[data-a=sms]').setAttribute('href', 'sms:');
    var y = logEl.scrollTop;
    var parts = groups(t).map(function (g) {
      return (g.stamp && !g.m.sys ? '<p class="im-stamp">' + esc(stamp(g.m.t)) + '</p>' : '') + bubble(t, g.m, g.run);
    }).join('');
    var del = lastDelivered(t);
    if (del) parts += '<p class="im-deliv">' + esc(del) + '</p>';
    if (typingOn) parts += '<div class="im-typing" aria-label="typing"><i></i><i></i><i></i></div>';
    if (t.disappear) parts = '<p class="im-sys mo-dis">disappearing messages · ' + DISN[t.disappear] + ' · new messages go after that</p>' + parts;
    logEl.innerHTML = parts || '<p class="mg-none">No messages</p>';
    if (GJ.ozChat && GJ.ozChat.bindInline) GJ.ozChat.bindInline(logEl);
    if (GJ.ozChat && GJ.ozChat.paintPass) GJ.ozChat.paintPass();
    logEl.classList.toggle('times', timesOn);
    logEl.scrollTop = keepScroll ? y : logEl.scrollHeight;
    var m = sel != null ? msg(t, sel) : null;
    moreEl.hidden = !m || !!passing;
    tapbar.hidden = !m || !!passing;
    if (m && !passing) {
      tapbar.innerHTML = TAP.map(function (e) { return '<button data-e="' + e + '" aria-label="' + e.replace(/:/g, '') + '">' + (isTe(e) ? teHtml(e) : e) + '</button>'; }).join('') + '<button data-e="more" aria-label="any emoji">＋</button>';
      placeTapbar(m.id);
      var h = '<button data-o="reply">Reply</button><button data-o="copy">Copy</button>';
      if (canEdit(m)) h += '<button data-o="edit">Edit<small>' + left(EDIT - (now() - m.t)) + '</small></button>';
      if (canUndo(m)) h += '<button data-o="undo">Undo send<small>' + left(UNDO - (now() - m.t)) + '</small></button>';
      if (!m.pass && !m.sys) h += '<button data-o="pass">Pass it on</button>';
      if (m.text && !m.sendAt) h += '<button data-o="translate">' + (m.tr ? 'Original' : 'Translate') + '</button>';
      if (!m.sys) h += '<button data-o="tonotes">Save to Notes</button>';
      if (m.sendAt) h += '<button data-o="sendnow">Send now</button><button data-o="unlater">Cancel</button>';
      if (m.pass && m.pass.state === 'waiting') h += as === 'me' ? '<button data-o="takeback">Take it back</button>' : '<button data-o="accept">Accept</button><button data-o="passback">Pass it back</button>';
      moreEl.innerHTML = h + '<button data-o="done">Done</button>';
    }
    passEl.hidden = !passing;
    if (passing) {
      var others = D.threads.filter(function (x) { return x.id !== cur; });
      passEl.innerHTML = '<span>Pass it on to</span>' + (others.length ? others.map(function (x) { return '<button data-p="' + x.id + '"' + (passing.to === x.id ? ' class="on"' : '') + '>' + esc(x.name) + '</button>'; }).join('') : '<em>Start another thread first</em>') +
        '<input class="mg-pn" maxlength="120" placeholder="a line of your own, if you like" value="' + esc(passing.note || '') + '"><button data-o="passgo" class="on"' + (passing.to ? '' : ' disabled') + '>Pass it on</button><button data-o="passno">Not now</button>';
    }
    var ro = re != null ? msg(t, re) : null;
    reEl.hidden = !ro && editing == null;
    if (editing != null) reEl.firstChild.textContent = 'Editing your message';
    else if (ro) reEl.firstChild.textContent = 'Replying to: ' + ro.text.slice(0, 70);
    paintF3();
    grow();
  }
  function placeTapbar(id) {
    var b = logEl.querySelector('.im-b[data-id="' + id + '"]');
    if (!b) { tapbar.hidden = true; return; }
    var r = b.getBoundingClientRect(), host = thEl.getBoundingClientRect();
    tapbar.style.left = Math.max(8, Math.min(r.left - host.left + (b.classList.contains('me') ? -8 : r.width / 2 - 120), host.width - 260)) + 'px';
    tapbar.style.top = Math.max(50, r.top - host.top - 48) + 'px';
  }

  function paintLink() {
    var st = GJ.askOut && GJ.askOut.link ? GJ.askOut.link.state() : null;
    var label = st ? st.label : 'signal · listening';
    var fig = st ? st.fig : '';
    var kind = st && st.kind;
    var line = '';
    if (kind === 'listening') line = 'listening';
    else if (kind === 'none') line = 'on this phone';
    else if (kind === 'off' || !kind) line = '';
    else line = fig || '';
    el.querySelectorAll('.mg-info .im-linkread, .im-telem .im-linkread').forEach(function (n) { n.textContent = label; });
    el.querySelectorAll('.im-who-link').forEach(function (n) { n.textContent = line; n.hidden = !line; });
    el.querySelectorAll('.mg-f3btn').forEach(function (b) {
      if (st) { b.classList.toggle('nominal', st.kind === 'nominal'); b.classList.toggle('degraded', st.kind === 'degraded'); b.classList.toggle('nolink', st.kind === 'none'); }
    });
    var tog = el.querySelectorAll('[data-link]');
    tog.forEach(function (b) { b.classList.toggle('on', (b.getAttribute('data-link') === 'on') === !!(st && st.on)); });
    el.querySelectorAll('[data-ground]').forEach(function (b) { b.classList.toggle('on', (b.getAttribute('data-ground') === 'pale') === lightOn); });
    var svg = el.querySelector('svg.im-linkarc');
    if (svg && !svg.dataset.ready && GJ.askOut && GJ.askOut.link) {
      var hops = (st && st.hops) || 10, h = '', i;
      // faint dots along the F3 arc (same path the hop uses)
      var ARC = [[8.50, 18.00], [8.64, 15.76], [9.04, 13.70], [9.72, 11.83], [10.67, 10.15], [11.90, 8.65], [13.39, 7.33], [15.15, 6.20], [17.19, 5.26], [19.5, 4.5]];
      ARC.forEach(function (p, i) {
        var r = i === ARC.length - 1 ? 1.5 : 0.45 + i * 0.03;
        h += '<circle class="im-ld" cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '"/>';
      });
      svg.insertAdjacentHTML('afterbegin', h);
      svg.dataset.ready = '1';
    }
  }
  function paintInfo() {
    var t = thread(cur); if (!t) return;
    var slot = infoEl.querySelector('.im-ava-slot') || infoEl.querySelector('.im-ava, .im-ava.star, .im-ava.oz');
    if (slot) slot.outerHTML = avaHTML(t, false).replace('im-ava', 'im-ava');
    var hero = infoEl.querySelector('.mg-info-hero');
    if (hero && !hero.querySelector('.im-ava, .im-ava.star, .im-ava.oz')) hero.insertAdjacentHTML('afterbegin', avaHTML(t, false));
    else if (hero) {
      var av = hero.querySelector('.im-ava, .im-ava.star, .im-ava.oz, .im-ava-slot');
      if (av) av.outerHTML = avaHTML(t, false);
    }
    infoEl.querySelector('h2').textContent = t.name;
    var sub = infoEl.querySelector('.im-sub');
    if (sub) {
      sub.hidden = !(isOz(t) || isCreator(t));
      if (isOz(t)) sub.textContent = (GJ.ozChat && GJ.ozChat.subtitle) || 'on-device assistant';
      if (isCreator(t)) sub.textContent = 'messages for Gill, through Artist Agent';
    }
    var rm = infoEl.querySelector('[data-a=rm]');
    if (rm) rm.closest('.im-row').hidden = !!(isAgent(t) || isOz(t) || isCreator(t));
    var mo = infoEl.querySelector('.mo-chat');
    if (mo) {
      var rows = [['pin', 'Pin', t.pin ? 'pinned · unpin' : 'pin to the top'], ['mute', 'Mute', t.mute ? 'muted · unmute' : 'mute'],
        person(t) ? ['hide', 'Hide', t.hidden ? 'hidden · show it' : 'hide from the list'] : null,
        ['lock', 'Lock', t.locked ? 'locked · take the lock off' : 'lock · Face ID on the phone'],
        person(t) ? ['dis', 'Disappearing', DISN[t.disappear || 0]] : null,
        ['distill', 'Distill to Notes', 'what’s still open, as a note'],
        ['call', 'Call', 'hand off to the phone']];
      mo.innerHTML = '<p class="mo-h">this chat</p>' + rows.filter(Boolean).map(function (r) { return '<div class="im-row"><b>' + r[1] + '</b><u data-mo="' + r[0] + '" role="button" tabindex="0">' + esc(r[2]) + '</u></div>'; }).join('') +
        (person(t) ? '' : '<p class="mo-q">' + (isAgent(t) ? 'Artist Agent is sent out · it can’t be hidden or set to disappear' : 'answers come from this phone · it stays in the list') + '</p>');
    }
    var pair = infoEl.querySelector('.im-pair');
    if (pair) {
      pair.hidden = !isAgent(t);
      if (isAgent(t) && GJ.askSeal) paintPair(pair);
    }
    paintF3();
    paintLink();
  }
  function paintPair(box) {
    if (!GJ.askSeal) return;
    var code = GJ.askSeal.pairingCode && GJ.askSeal.pairingCode();
    var shown = GJ.askSeal.shown && GJ.askSeal.shown();
    var html = '<b>The seal</b><p>Sealed · only you and Artist Agent can read.</p>';
    if (!shown && code) {
      html += '<div class="im-qr"></div><p class="im-pair-code">' + esc(code) + '</p>';
      html += '<button type="button" data-a="paircopy">Copy the pairing code</button>';
      html += '<button type="button" data-a="pairdone">I have given it</button>';
    } else {
      html += '<p>The pairing code was shown once. You can make a new pairing if you need to.</p>';
      html += '<button type="button" data-a="pairnew">New pairing</button>';
    }
    box.innerHTML = html;
    var qr = box.querySelector('.im-qr');
    if (qr && GJ.askSeal.drawQR && code && !shown) GJ.askSeal.drawQR(qr, code);
  }

  function show(id, mid) {
    cur = id; sel = null; re = null; editing = null; passing = null; as = 'me'; typingOn = false;
    ta.value = ''; drawer.hidden = true; emojis.hidden = true; sheetEl.hidden = true;
    var t = thread(cur); if (t) t.unread = 0;
    listEl.hidden = true; infoEl.hidden = true; thEl.hidden = false;
    paintThread(); if (mid != null) goTo(mid);
    clearInterval(tick); tick = setInterval(function () { if (on && cur != null && sel != null && !passing) paintThread(true); }, 5000);
    html.classList.toggle('agenting', !!(t && isAgent(t)));
  }
  function back() {
    if (GJ._chatBack && GJ._chatBack.room === 'threads') {
      var b = GJ._chatBack;
      GJ._chatBack = { room: 'messages', id: cur, name: thread(cur) && thread(cur).name };
      close();
      var go = function (T) { if (T && T.open) T.open(b.id); };
      if (GJ.lazy && GJ.lazy.load) GJ.lazy.load('threads').then(go); else go(GJ.threads);
      return;
    }
    cur = null; clearInterval(tick); html.classList.remove('agenting'); thEl.hidden = true; infoEl.hidden = true; listEl.hidden = false; drawer.hidden = true; emojis.hidden = true; paintList();
  }
  function goTo(mid) { var b = logEl.querySelector('[data-id="' + mid + '"]'); if (!b) return; logEl.scrollTop = Math.max(0, b.offsetTop - 60); b.classList.add('flash'); setTimeout(function () { b.classList.remove('flash'); }, 1200); }
  function start(nm) { nm = String(nm || '').trim().slice(0, 30); if (!nm) return null; var t = D.threads.filter(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); })[0]; if (!t) { t = { id: D.n++, name: nm, t: now(), msgs: [] }; D.threads.push(t); save(); } return t.id; }
  function scramble(s) {
    /* visible glyph shimmer while the seal is made; not the real ciphertext */
    var glyphs = '·•○◦··+×·';
    return Array.from(String(s)).map(function (ch) {
      if (ch === ' ') return ' ';
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }).join('');
  }
  var lastThinkMs = 0;
  function thinkOn() { try { return localStorage.getItem('oz-think') !== 'off'; } catch (e) { return true; } }
  function nextThinkMs(text) {
    var n = String(text || '').length;
    var base = 400 + Math.min(900, n * 6);
    var jitter = (Math.random() * 0.55 - 0.2) * 420;
    var ms = Math.round(Math.max(400, Math.min(1600, base + jitter)));
    if (Math.abs(ms - lastThinkMs) < 160) {
      ms += (ms >= 1000 ? -1 : 1) * (200 + Math.round(Math.random() * 240));
      ms = Math.max(400, Math.min(1600, ms));
    }
    lastThinkMs = ms;
    return ms;
  }
  function paintKeepComp(t) {
    if (!on || cur !== t.id) return;
    var keep = document.activeElement === ta;
    var a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
    paintThread(true);
    if (keep) { try { ta.focus(); if (ta.value !== v) ta.value = v; ta.setSelectionRange(a, b); } catch (e) {} }
  }
  function send(text, who, reply) {
    var t = thread(cur); text = String(text || '').trim(); if (!t || !text) return null;
    var m = { id: D.n++, me: (who || as) !== 'them', text: text.slice(0, 2000), t: now(), re: reply != null ? reply : re }; if (m.re == null) delete m.re; t.msgs.push(m); re = null;
    if (isOz(t) && m.me) {
      m.out = { state: 'arrived', label: 'On this phone' };
      save();
      var started = now();
      var delay = thinkOn() ? nextThinkMs(m.text) : 0;
      if (delay) { typingOn = true; paintKeepComp(t); }
      var work = (GJ.ozChat && GJ.ozChat.onOzSend) ? Promise.resolve(GJ.ozChat.onOzSend(m.text)) : Promise.resolve(null);
      work.then(function (res) {
        var wait = Math.max(0, delay - (now() - started));
        setTimeout(function () {
          typingOn = false;
          takeOz(t, res);
        }, wait);
      });
    } else if (isCreator(t) && m.me) {
      var r = GJ.ozChat && GJ.ozChat.confirmSendToCreator && GJ.ozChat.confirmSendToCreator(m.text);
      if (r && r.ok) m.out = { state: 'arrived', label: "Sent to creator's inbox", stub: true };
      else {
        m.out = { state: 'queued', label: (r && r.text) || 'Waiting for a one-time pass' };
        if (GJ.ozChat && GJ.ozChat.requestPass) {
          var ask = GJ.ozChat.requestPass('message', m.text.slice(0, 180));
          t.msgs.push({ id: D.n++, me: false, fromOz: true, text: ask.text, t: now(), actsHtml: GJ.ozChat.actionsHtml('creatorask') });
        }
      }
    } else if (isAgent(t) && m.me && GJ.askOut) {
      m.out = { state: 'sending', mode: outMode() };
      m.sealing = true;
      m.cipher = scramble(m.text);
      var sN = 0, sT = setInterval(function () {
        sN++; m.cipher = scramble(m.text);
        if (on && cur === t.id) paintThread(true);
        if (sN > 8) clearInterval(sT);
      }, 70);
      GJ.askOut.send({ source: 'oz', mode: outMode(), text: m.text, room: GJ.askOut.room(), onState: function (st) {
        if (m.out && m.out.state === 'arrived' && st && st.state !== 'arrived') {
          if (st.sealed) m.out.sealed = st.sealed;
          return;
        }
        m.out = st;
        if (st && st.state === 'arrived') m.out.label = 'Delivered';
        save(); if (on && cur === t.id) paintThread(true);
      } });
      if (GJ.askOut.armUndo) GJ.askOut.armUndo(function () { undo(m.id); }, { ms: 20000 });
      setTimeout(function () {
        m.sealing = false; clearInterval(sT);
        if (on && cur === t.id) paintThread(true);
      }, 800);
    } else if (isAgent(t) && m.me) {
      m.out = { state: 'arrived', label: 'On this phone' };
    }
    save(); if (on) paintThread(); GJ.haptic.tick(); return m.id;
  }
  function undo(mid) { var t = thread(cur), m = msg(t, mid); if (!m || !canUndo(m)) return false; m.unsent = true; m.text = ''; delete m.react; if (sel === mid) sel = null; save(); paintThread(true); GJ.haptic.edge(); return true; }
  function edit(mid, text) { var t = thread(cur), m = msg(t, mid); text = String(text || '').trim(); if (!m || !canEdit(m) || !text || text === m.text) return false; (m.edits = m.edits || []).push({ text: m.text, t: now() }); m.text = text.slice(0, 2000); save(); paintThread(true); GJ.haptic.commit(); return true; }
  function react(mid, e, who) { var t = thread(cur), m = msg(t, mid); e = String(e || '').trim(); if (!m || m.unsent || m.sys) return false; who = who || as; m.react = m.react || {}; var val = isTe(e) ? e : (Array.from(e)[0] === e ? e : Array.from(e).slice(0, 2).join('')); if (!val || m.react[who] === val) delete m.react[who]; else m.react[who] = val; save(); paintThread(true); GJ.haptic.tick(); return true; }
  function passOn(mid, to, note) {
    var t = thread(cur), m = msg(t, mid), d = thread(to); if (!m || !d || m.unsent || d.id === t.id) return null;
    var chain = (m.pass && m.pass.chain ? m.pass.chain : []).concat([t.name]), p = { id: D.n++, me: true, text: m.text, t: now(), pass: { from: chain[0], chain: chain, note: String(note || '').trim().slice(0, 120), state: 'waiting', src: [t.id, m.id] } };
    d.msgs.push(p); save(); GJ.haptic.commit(); return p.id;
  }
  function answer(mid, how, reason) { var t = thread(cur), m = msg(t, mid); if (!m || !m.pass || m.pass.state !== 'waiting') return false; if (how === 'taken' && !m.me) return false; m.pass.state = how; if (reason) m.pass.reason = String(reason).slice(0, 120); save(); paintThread(true); GJ.haptic.commit(); return true; }


  function takeOz(t, res) {
    if (!t || !res) return;
    function push(o) { t.msgs.push(o); t.unread = (t.unread || 0); }
    if (res.kind === 'bugform' || res.kind === 'bugreview') {
      var o = { id: D.n++, me: false, fromOz: true, text: res.text, t: now() };
      if (res.bundle) o.bundleHtml = (GJ.ozChat.paintBundle(res.bundle) || '') + (GJ.ozChat.actionsHtml('bugreview') || '');
      push(o); save(); if (on && cur === t.id) paintThread(); return;
    }
    if (res.kind === 'reply') {
      var p = res.payload || {};
      var cards = '';
      if (p.cards && p.cards.length) p.cards.forEach(function (c) { cards += c.html || ''; });
      var short = p.short || p.text || '';
      var full = p.full || p.text || '';
      var hasMore = !p.listOnly && ((full && full !== short) || !!cards);
      push({ id: D.n++, me: false, fromOz: true, text: short, moreText: hasMore ? full : '', cardsHtml: hasMore ? cards : '', moreCards: cards, poet: p.poet, hits: p.hits, listOnly: !!p.listOnly });
      if (res.offer && !p.listOnly) push({ id: D.n++, me: false, fromOz: true, sys: false, text: res.offer, t: now() + 1, actsHtml: GJ.ozChat.actionsHtml('offer') });
      save(); if (on && cur === t.id) { t.unread = 0; paintKeepComp(t); } else if (on) paintList();
    }
  }
  function ensureOzChat() {
    var t = D.threads.filter(isOz)[0];
    if (!t) { t = { id: D.n++, name: 'oz chat', t: now(), msgs: [], oz: true, unread: 0 }; D.threads.unshift(t); }
    t.oz = true; t.name = 'oz chat';
    var sys = (GJ.ozChat && GJ.ozChat.sys) || SYS;
    if (!t.msgs.some(function (m) { return m.sys && /on-device assistant/.test(m.text); })) {
      t.msgs.unshift({ id: D.n++, sys: true, text: sys, t: now() - 2000 });
    }
    save(); return t;
  }
  function ensureCreator() {
    var t = D.threads.filter(isCreator)[0];
    if (!t) { t = { id: D.n++, name: 'creator', t: now(), msgs: [], creator: true, unread: 0 }; D.threads.push(t); }
    t.creator = true; t.name = 'creator';
    if (!t.msgs.some(function (m) { return m.sys && /creator's inbox/.test(m.text); })) {
      t.msgs.unshift({ id: D.n++, sys: true, text: "Messages here are meant for Gill, sealed, through Artist Agent. In this preview a send is a stub: you will see Sent to creator's inbox. A one-time pass is required.", t: now() - 2000 });
    }
    save(); return t;
  }
  function openOzChat() { open(); var t = ensureOzChat(); openT(t.id); }
  function openCreator() { if (GJ.circle && GJ.circle.unlockCreator) GJ.circle.unlockCreator(); open(); var t = ensureCreator(); openT(t.id); }
  function openAgent() { open(); openT(ensureAgent().id); }
  function openNamed(nm) { open(); var id = start(nm); if (id != null) openT(id); }   // r6: a locked chat asks first, however it is opened

  function applyIncoming(list) {
    if (!list || !list.length) return;
    var t = ensureAgent(), added = 0;
    list.forEach(function (r) {
      if (!r || !r.text) return;
      var id = r.id || ('in' + (r.t || Date.now()));
      if (t.msgs.some(function (m) { return m.id === id || (m.text === r.text && !m.me && Math.abs((m.t || 0) - (r.t || 0)) < 2000); })) return;
      t.msgs.push({ id: id, me: false, text: String(r.text).slice(0, 2000), t: r.t || Date.now() });
      added++;
    });
    if (added) { t.unread = (t.unread || 0) + added; save(); if (on && cur === t.id) { t.unread = 0; paintThread(); } else { if (on) paintList(); if (GJ.notify && !t.mute) { var lm = t.msgs[t.msgs.length - 1]; GJ.notify.arrive({ who: t.name, text: t.locked ? 'a locked chat · open it to read' : lm ? lm.text : '', from: 'messages-ours', chatId: t.id }); } } }   // bubble round: a quiet arrival (the count, one breath), never a banner
  }
  var inboxT = 0;
  function startInbox() {
    if (inboxT) return;
    var delay = 6000;
    var tick = function () {
      if (!on) return;
      if (GJ.askOut && GJ.askOut.tickReplies) GJ.askOut.tickReplies();
    };
    if (GJ.askOut && GJ.askOut.onReply) GJ.askOut.onReply(applyIncoming);
    function loop() {
      tick();
      var hidden = document.hidden;
      delay = hidden ? 24000 : 6000;
      inboxT = setTimeout(loop, delay);
    }
    loop();
    document.addEventListener('visibilitychange', function () { /* next loop picks it up */ });
  }
  function stopInbox() { clearTimeout(inboxT); inboxT = 0; }
  function open() { if (on) return; on = true; skin(); html.classList.add('messaging'); ensureAgent(); ensureOzChat(); if (cur != null && thread(cur) && !thread(cur).locked) show(cur); else { cur = null; back(); } startInbox(); if (GJ.askOut && GJ.askOut.link) { GJ.askOut.link.start(); if (GJ.askOut.link.on) GJ.askOut.link.on(function () { if (on) paintLink(); }); } if (GJ.ozChat && GJ.ozChat.paintPass) GJ.ozChat.paintPass(); if (GJ.ozChat && GJ.ozChat.bindInline) GJ.ozChat.bindInline(el); GJ.haptic.tick(); }
  function close() { if (!on) return; on = false; clearInterval(tick); stopInbox(); html.classList.remove('messaging', 'agenting'); if (GJ.askOut && GJ.askOut.link) GJ.askOut.link.stop(); }
  function exportThread(name) { var t = D.threads.filter(function (x) { return x.name === name; })[0]; if (!t) return []; return t.msgs.filter(function (m) { return !m.unsent && !m.sys; }).map(function (m) { return { who: m.me ? 'me' : t.name, text: m.text, t: m.t }; }); }
  function toThreads() {
    var t = thread(cur); if (!t) return;
    var ms = exportThread(t.name);
    var here = { room: 'messages', id: t.id, name: t.name };
    var go = function (T) {
      if (!T || !T.take) return;
      var id = T.take({ title: t.name, from: 'messages', to: t.name, messages: ms });
      GJ._chatBack = here;
      close();
      T.open(id);
    };
    if (GJ.lazy && GJ.lazy.load) GJ.lazy.load('threads').then(go); else go(GJ.threads);
  }

  /* hold to tapback; swipe left on the log to peek times; swipe list rows for pin/mute/hide */
  var holdT = 0, held = false, pull = null, swipe = null;
  logEl.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.im-b');
    pull = { x: e.clientX, y: e.clientY, t0: logEl.scrollTop };
    held = false; clearTimeout(holdT);
    if (b && !e.target.closest('button')) {
      holdT = setTimeout(function () { held = true; sel = +b.dataset.id; passing = null; paintThread(true); GJ.haptic.commit(); }, 420);
    }
  });
  logEl.addEventListener('pointermove', function (e) {
    if (!pull) return;
    var dx = e.clientX - pull.x, dy = e.clientY - pull.y;
    if (Math.hypot(dx, dy) > 8) clearTimeout(holdT);
    if (dx < -36 && Math.abs(dx) > Math.abs(dy)) { timesOn = true; logEl.classList.add('times'); }
  });
  function endPull() { clearTimeout(holdT); pull = null; }
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { logEl.addEventListener(n, endPull); });
  logEl.addEventListener('scroll', function () { clearTimeout(holdT); });
  logEl.addEventListener('contextmenu', function (e) { if (e.target.closest('.im-b')) e.preventDefault(); });

  threadsEl.addEventListener('pointerdown', function (e) {
    var row = e.target.closest('.mg-swipe'); if (!row) return;
    swipe = { row: row, x: e.clientX, open: parseFloat(row.dataset.open || 0) };
  });
  threadsEl.addEventListener('pointermove', function (e) {
    if (!swipe) return;
    var dx = Math.min(0, Math.max(-220, e.clientX - swipe.x + swipe.open));
    var btn = swipe.row.querySelector('.mg-t');
    if (btn) btn.style.transform = 'translateX(' + dx + 'px)';
    swipe.dx = dx;
  });
  function endSwipe() {
    if (!swipe) return;
    var dx = swipe.dx || 0, open = dx < -60 ? -220 : 0;
    var btn = swipe.row.querySelector('.mg-t');
    if (btn) { btn.style.transition = 'transform .25s'; btn.style.transform = 'translateX(' + open + 'px)'; setTimeout(function () { if (btn) btn.style.transition = ''; }, 260); }
    swipe.row.dataset.open = open;
    swipe = null;
  }
  threadsEl.addEventListener('pointerup', endSwipe);
  threadsEl.addEventListener('pointercancel', endSwipe);

  /* ---------- r6 · the tools ---------- */
  function say(x, ms) { if (GJ.mark && GJ.mark.say) GJ.mark.say(x, ms || 1600); }
  function sheet(h) { sheetEl.innerHTML = h; sheetEl.hidden = !h; drawer.hidden = true; emojis.hidden = true; }
  function lockOpen(t, why) { var L = G.oz && G.oz.private ? G.oz.private.get('chatLock') : null; if (!L) return Promise.resolve(true); return L.unlock({ chatId: t.id, why: why }).then(function (r) { return !!(r && r.ok); }); }
  function openT(id, mid) { var t = thread(id); if (t && t.locked) { lockOpen(t, 'unlock ' + t.name).then(function (ok) { if (ok) show(id, mid); }); return; } show(id, mid); }
  function push(t, m) {
    m.id = D.n++; m.me = m.me !== false; m.t = m.t || now(); if (t.disappear && !m.sendAt) m.until = m.t + t.disappear;
    t.msgs.push(m); save(); if (on && cur === t.id) paintThread(); try { GJ.haptic.tick(); } catch (x) {} return m;
  }
  function addBlob(t, blob, o) {
    var kind = o.kind || (/^image\//.test(blob.type) ? 'photo' : /^video\//.test(blob.type) ? 'video' : /^audio\//.test(blob.type) ? 'voice' : 'file');
    var m = { kind: kind, name: o.name || blob.name || '', size: blob.size, mime: blob.type || '', text: o.note || '' };
    ['cam', 'look', 'fullRed', 'dur', 'example'].forEach(function (k) { if (o[k] != null) m[k] = o[k]; });
    m.id = D.n; BLOBS[m.id] = URL.createObjectURL(blob); if (GJ.keep) GJ.keep.put('mo:' + m.id, blob);   // exactly as it came
    return push(t, m);
  }
  var fileIns = el.querySelectorAll('.mo-file-in');
  [].forEach.call(fileIns, function (f) { f.addEventListener('change', function () { var file = f.files && f.files[0]; f.value = ''; var t = thread(cur); if (!file || !t) return; addBlob(t, file, { kind: f.dataset.k === 'file' ? 'file' : null, name: file.name }); }); });
  function att(k) {
    var t = thread(cur); if (!t) return;
    if (k === 'photo' || k === 'file') { el.querySelector('.mo-file-in[data-k="' + k + '"]').click(); return; }
    if (k === 'voice') { voice(); return; }
    if (k === 'sticker') { var S = (G.GJ_SAMPLES || []).slice(0, 8); sheet('<p class="mo-h">a sticker from your frames</p><div class="mo-stk">' + S.map(function (x) { return '<button type="button" data-mo="st" data-src="' + esc(x.file.replace('samples/', 'samples/t/')) + '" aria-label="' + esc(x.title) + '"><img src="' + esc(x.file.replace('samples/', 'samples/t/')) + '" alt=""></button>'; }).join('') + '</div><u data-mo="x" role="button" tabindex="0">not now</u>'); return; }
    if (k === 'later') {
      if (!person(t)) { say('send later is for people · this one answers now', 2000); return; }
      if (!ta.value.trim()) { say('write the message first, then send later', 1800); try { ta.focus(); } catch (x) {} return; }
      sheet('<p class="mo-h">send later · it waits on this phone</p><p class="mo-q">“' + esc(ta.value.trim().slice(0, 80)) + '”</p><p class="mo-opts"><u data-mo="at" data-at="600000" role="button" tabindex="0">in 10 minutes</u><u data-mo="at" data-at="3600000" role="button" tabindex="0">in an hour</u><u data-mo="at" data-at="tomorrow" role="button" tabindex="0">tomorrow at 9</u><u data-mo="x" role="button" tabindex="0">not now</u></p>');
      return;
    }
    if (k === 'dial') say('a dial, soon', 1200);
  }
  function voice() {
    var t = thread(cur); if (!t) return;
    var ex = '<u data-mo="exvoice" role="button" tabindex="0">send an example voice note</u><u data-mo="x" role="button" tabindex="0">not now</u>';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !G.MediaRecorder) { sheet('<p class="mo-h">voice note</p><p class="mo-q">this browser can’t record here</p><p class="mo-opts">' + ex + '</p>'); return; }
    sheet('<p class="mo-h">voice note</p><p class="mo-q mo-rec">starting…</p><p class="mo-opts"><u data-mo="vstop" role="button" tabindex="0">stop and send</u><u data-mo="vcancel" role="button" tabindex="0">cancel</u></p>');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
      var chunks = [], r = new MediaRecorder(st); rec = { r: r, st: st, t0: Date.now(), keep: false, tid: t.id };
      r.ondataavailable = function (e) { chunks.push(e.data); };
      r.onstop = function () { st.getTracks().forEach(function (x) { x.stop(); }); var R = rec; rec = null; clearInterval(R && R.iv); if (!R || !R.keep) return; var blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' }); addBlob(thread(R.tid), blob, { kind: 'voice', dur: (Date.now() - R.t0) / 1000 }); };
      r.start(); rec.iv = setInterval(function () { var p = sheetEl.querySelector('.mo-rec'); if (p && rec) p.textContent = 'recording · ' + mmss((Date.now() - rec.t0) / 1000) + ' · on this phone'; }, 250);
    }, function () { sheet('<p class="mo-h">voice note</p><p class="mo-q">the microphone isn’t available here</p><p class="mo-opts">' + ex + '</p>'); });
  }
  function playVoice(id) {
    var t = thread(cur), m = msg(t, id); if (!m) return;
    if (playing === id) { audio.pause(); playing = null; paintThread(true); return; }
    var u = blobURL(m); if (!u) { say(m.example ? 'an example voice note · nothing to play' : 'loading…', 1400); return; }
    audio.src = u; audio.playbackRate = m.speed || 1; audio.play().catch(function () {}); playing = id; audio.onended = function () { playing = null; if (on) paintThread(true); }; paintThread(true);
  }
  function translate(m) {
    var T = G.oz && G.oz.private ? G.oz.private.get('translateOnDevice') : null; if (!T) { say('translate isn’t in this build'); return; }
    var to = (navigator.language || 'en').slice(0, 2);
    T.translate({ text: m.text, to: to }).then(function (r) { m.tr = { text: r.text, label: r.label || ('translated · ' + (r.from || 'auto') + ' → ' + (r.to || to)) }; sel = null; save(); paintThread(true); });
  }
  function toNotes(text) {
    var go = function () { if (GJ.notes && GJ.notes.add) { GJ.notes.add(text); say('saved to Notes', 1600); } };
    if (GJ.notes && GJ.notes.add) go(); else if (GJ.lazy) GJ.lazy.load('notes').then(go, go);
  }
  function distillToNotes(t) {
    var go = function () {
      var text = t.msgs.filter(function (m) { return !m.unsent && !m.sys && m.text; }).map(function (m) { return (m.me ? 'me' : t.name) + ': ' + m.text; }).join('\n');
      var cards = GJ.threads && GJ.threads.distill ? GJ.threads.distill(text) : [], LAB = { open: 'open', decision: 'decided', next: 'next' };
      var note = t.name + ' · what’s still open · ' + new Date().toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase() + '\n' + (cards.length ? cards.map(function (c) { return '· ' + (LAB[c.kind] || c.kind) + ' — ' + c.text; }).join('\n') : '· nothing open · read on this phone');
      toNotes(note);
      sheet('<p class="mo-h">distilled to Notes</p><p class="mo-q">' + (cards.length ? cards.length + (cards.length === 1 ? ' line' : ' lines') + ' · open items, decisions, next steps · read on this phone' : 'nothing open in this chat') + '</p><p class="mo-opts"><u data-mo="opennotes" role="button" tabindex="0">open Notes</u><u data-mo="x" role="button" tabindex="0">done</u></p>');
    };
    if (GJ.threads && GJ.threads.distill) go(); else if (GJ.lazy) GJ.lazy.load('threads').then(go, go); else go();
  }
  function telOf(t) { try { var p = (GJ.circle && GJ.circle.people ? GJ.circle.people() : []).filter(function (x) { return x.name === t.name; })[0]; return p && p.tel ? String(p.tel).replace(/\s/g, '') : ''; } catch (e) { return ''; } }
  function handoff(how) {
    var t = thread(cur); if (!t) return; var n = telOf(t);
    sheet('<p class="mo-h">' + (how === 'facetime' ? 'FaceTime' : 'call') + ' · ' + esc(t.name) + '</p><p class="mo-q">calls go through the phone’s own apps · you place them there</p><p class="mo-opts">' +
      (n ? '<a href="tel:' + esc(n) + '">Phone</a><a href="facetime:' + esc(n) + '">FaceTime</a><a href="sms:' + esc(n) + '">Messages</a>' : '<a href="tel:">Phone</a><a href="facetime://">FaceTime</a>') +
      '<u data-mo="x" role="button" tabindex="0">not now</u></p>' + (n ? '' : '<p class="mo-q mo-stub">no number for ' + esc(t.name) + ' on this phone · add one to their star in the Circle · handoff · preview stub</p>'));
  }
  function release(t, m) { var at = m.sendAt; delete m.sendAt; m.t = now(); m.out = { state: 'arrived', label: 'Sent · it waited until ' + clock(at) }; if (t.disappear) m.until = m.t + t.disappear; }
  function sweep() {   // send later releases, disappearing messages go
    var ch = false, n0 = now();
    D.threads.forEach(function (t) { if (expire(t)) ch = true; t.msgs.forEach(function (m) { if (m.sendAt && m.sendAt <= n0) { release(t, m); ch = true; } }); });
    if (ch) { save(); if (on) { if (cur != null) paintThread(true); else paintList(); } }
  }
  setInterval(sweep, 10000);
  function tool(k, b) {
    var t = thread(cur);
    if (k === 'x') { sheet(''); return; }
    if (k === 'showhidden') { showHidden = !showHidden; paintList(); return; }
    if (k === 'opennotes') { sheet(''); close(); if (GJ.notes && GJ.notes.open) GJ.notes.open(); return; }
    if (!t) return;
    if (k === 'st') { push(t, { kind: 'sticker', src: b.dataset.src, text: '' }); sheet(''); return; }
    if (k === 'at') { var at = b.dataset.at === 'tomorrow' ? (function () { var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return +d; })() : now() + +b.dataset.at; push(t, { text: ta.value.trim().slice(0, 2000), sendAt: at, out: { state: 'queued', label: 'Scheduled' } }); ta.value = ''; grow(); sheet(''); say('scheduled · ' + clock(at), 1600); return; }
    if (k === 'exvoice') { push(t, { kind: 'voice', dur: 6, example: true, text: '' }); sheet(''); return; }
    if (k === 'vstop' || k === 'vcancel') { if (rec) { rec.keep = k === 'vstop'; rec.r.stop(); } sheet(''); return; }
    if (k === 'pin') t.pin = !t.pin;
    if (k === 'mute') t.mute = !t.mute;
    if (k === 'hide' && person(t)) t.hidden = !t.hidden;
    if (k === 'dis' && person(t)) t.disappear = DIS[(DIS.indexOf(t.disappear || 0) + 1) % DIS.length];
    if (k === 'lock') { var L = G.oz && G.oz.private ? G.oz.private.get('chatLock') : null;
      if (t.locked) { lockOpen(t, 'take the lock off ' + t.name).then(function (ok) { if (ok) { t.locked = false; save(); paintInfo(); } }); return; }
      if (L) L.lock({ chatId: t.id }); t.locked = true; say('locked · Face ID on the phone · preview stub', 1800); }
    if (k === 'distill') { infoEl.hidden = true; thEl.hidden = false; paintThread(true); distillToNotes(t); return; }
    if (k === 'call') { infoEl.hidden = true; thEl.hidden = false; paintThread(true); handoff('call'); return; }
    save(); paintInfo(); try { GJ.haptic.tick(); } catch (x) {}
  }
  function sendMedia(o) {   // r6: from elsewhere (the red camera) into a chat in this skin
    o = o || {}; var id = typeof o.to === 'number' ? o.to : start(o.to); var t = thread(id); if (!t || !o.blob) return null;
    var m = addBlob(t, o.blob, o); return { thread: t.id, id: m.id, name: t.name };
  }

  function showDrawer() {
    emojis.hidden = true; sheetEl.hidden = true;
    drawer.hidden = !drawer.hidden;
    if (!drawer.hidden) {
      drawer.classList.add('mo-words');   // r6: words, not tiles
      drawer.innerHTML = [['photo', 'photo'], ['file', 'file'], ['sticker', 'sticker'], ['voice', 'voice note'], ['later', 'send later'], ['dial', 'a dial']].map(function (x) {
        return '<button type="button" data-att="' + x[0] + '">' + x[1] + '</button>';
      }).join('');
    }
  }
  function paintEmojis(tab) {
    tab = tab || emojis.dataset.tab || 'tru';
    emojis.dataset.tab = tab;
    var tabs = '<div class="te-tabs"><button type="button" data-etab="tru"' + (tab === 'tru' ? ' class="on"' : '') + '>truemoji</button><button type="button" data-etab="all"' + (tab === 'all' ? ' class="on"' : '') + '>emoji</button></div>';
    if (tab === 'tru') {
      var h = '<div class="te-pack">';
      TE_IDS.forEach(function (id) {
        var star = (id === 'clap') ? '' : '<button data-ins=":' + id + '-star:" aria-label="' + id + ' star-light">' + teHtml(':' + id + '-star:') + '</button>';
        h += '<div class="te-row">' + star + '<button data-ins=":' + id + ':" aria-label="' + id + '">' + teHtml(':' + id + ':') + '</button></div>';
      });
      h += '<div class="te-row te-new">' + TE_NEW.map(function (id) { return '<button data-ins=":' + id + ':" aria-label="' + id + '">' + teHtml(':' + id + ':') + '</button>'; }).join('') + '</div>';
      emojis.innerHTML = tabs + h + '</div>';
    } else {
      var lead = [':hands:', ':highfivemini:', ':shaka:'].concat(TE_NEW.map(function (id) { return ':' + id + ':'; })).map(function (e) {
        return '<button data-ins="' + e + '" class="te-std" aria-label="' + e.replace(/:/g, '') + '">' + teHtml(e) + '</button>';
      }).join('');
      emojis.innerHTML = tabs + lead + EMOJI.map(function (e) { return '<button data-ins="' + e + '">' + e + '</button>'; }).join('');
    }
  }
  function showEmojis() {
    drawer.hidden = true;
    emojis.hidden = !emojis.hidden;
    if (!emojis.hidden) paintEmojis(emojis.dataset.tab || 'tru');
  }

  el.addEventListener('click', function (e) {
    var b = e.target.closest('button, a, u'); if (!b) return;
    if (b.tagName === 'A' && (b.getAttribute('href') || '').indexOf('facetime') === 0) return;
    if (b.tagName === 'A' && b.closest('.mg-calls')) { e.preventDefault(); e.stopPropagation(); handoff(b.dataset.a === 'face' ? 'facetime' : 'call'); return; }   // r6: the call handoff
    if (b.tagName === 'A' && (b.getAttribute('href') || '').indexOf('sms') === 0) return;
    if (b.tagName === 'A' && (b.hasAttribute('download') || /^(tel|facetime)/.test(b.getAttribute('href') || ''))) return;
    e.preventDefault(); e.stopPropagation();
    var a = b.dataset.a, o = b.dataset.o, t = thread(cur), m = t && sel != null ? msg(t, sel) : null;
    if (b.dataset.t) openT(+b.dataset.t, b.dataset.m != null ? +b.dataset.m : null);
    else if (a === 'new') { var id = start(newIn.value); if (id != null) { newIn.value = ''; q('.mg-new').hidden = true; show(id); } }
    else if (a === 'tognew') q('.mg-new').hidden = !q('.mg-new').hidden;
    else if (a === 'close') close();
    else if (a === 'back') back();
    else if (a === 'linkfig') {
      var pop = q('.im-telem');
      if (pop) { pop.hidden = !pop.hidden; if (!pop.hidden) paintLink(); }
    }
    else if (a === 'circle') { close(); if (GJ.circle) GJ.circle.open(); }
    else if (a === 'info') { infoEl.hidden = false; thEl.hidden = true; paintInfo(); }
    
    else if (a === 'pairdone') { if (GJ.askSeal) GJ.askSeal.markShown(); paintInfo(); }
    else if (a === 'pairnew') { if (GJ.askSeal) GJ.askSeal.generate().then(function () { paintInfo(); }); }
    else if (a === 'paircopy') {
      try { var c = GJ.askSeal && GJ.askSeal.pairingCode(); if (c && navigator.clipboard) navigator.clipboard.writeText(c); if (GJ.mark) GJ.mark.say('copied on this phone', 1200); } catch (x) {}
    }
    else if (a === 'infoback') { infoEl.hidden = true; thEl.hidden = false; paintThread(true); }
    else if (a === 'tothreads') toThreads();
    else if (a === 'more') {
      var mid = b.closest('.im-b') && +b.closest('.im-b').getAttribute('data-id');
      var mm = mid && t ? msg(t, mid) : null;
      if (mm) { mm.openMore = true; if (mm.moreCards && !mm.cardsHtml) mm.cardsHtml = mm.moreCards; save(); paintKeepComp(t); }
    }
    else if (a === 'rm') {
      if (isAgent(thread(cur))) { b.textContent = 'This one stays'; setTimeout(function () { b.textContent = 'Remove this thread'; }, 1600); }
      else if (b.classList.contains('sure')) { D.threads = D.threads.filter(function (x) { return x.id !== cur; }); save(); cur = null; back(); GJ.haptic.commit(); }
      else { b.classList.add('sure'); b.textContent = 'Remove it?'; setTimeout(function () { b.classList.remove('sure'); b.textContent = 'Remove this thread'; }, 3000); }
    }
    else if (a === 'send') { if (editing != null) { edit(editing, ta.value); editing = null; sel = null; ta.value = ''; paintThread(true); grow(); } else if (send(ta.value) != null) { ta.value = ''; grow(); } }
    else if (a === 'unre') { re = null; if (editing != null) { editing = null; ta.value = ''; } paintThread(true); }
    else if (a === 'plus') showDrawer();
    else if (a === 'emoji') showEmojis();
    else if (a === 'mic') { try { GJ.haptic.tick(); } catch (x) {} voice(); }
    else if (b.dataset.link) { if (GJ.askOut && GJ.askOut.link) GJ.askOut.link.setOn(b.dataset.link === 'on'); paintLink(); try { GJ.haptic.tick(); } catch (x) {} }
    else if (b.dataset.ground) { setLight(b.dataset.ground === 'pale'); paintLink(); try { GJ.haptic.tick(); } catch (x) {} }
    else if (b.dataset.m && b.closest('.im-tog')) { if (GJ.askOut) GJ.askOut.setMode(b.dataset.m); paintF3(); try { GJ.haptic.tick(); } catch (x) {} }
    else if (b.dataset.etab) { paintEmojis(b.dataset.etab); }
    else if (b.dataset.ins) { var ins = b.dataset.ins; ta.value += ((ta.value && !/\s$/.test(ta.value)) ? ' ' : '') + ins; setEmoji(ins); emojis.hidden = true; grow(); try { ta.focus(); } catch (x) {} }
    else if (b.dataset.att) { drawer.hidden = true; att(b.dataset.att); }
    else if (b.dataset.mo) tool(b.dataset.mo, b);
    else if (b.dataset.vp) playVoice(+b.dataset.vp);
    else if (b.dataset.vs) { var vm = msg(t, +b.dataset.vs); if (vm) { vm.speed = { 1: 1.5, 1.5: 2, 2: 1 }[vm.speed || 1]; audio.playbackRate = vm.speed; save(); paintThread(true); } }
    else if (b.dataset.pin) { var pt = thread(+b.dataset.pin); if (pt) { pt.pin = !pt.pin; save(); paintList(); } }
    else if (b.dataset.mute) { var mt = thread(+b.dataset.mute); if (mt) { mt.mute = !mt.mute; save(); paintList(); } }
    else if (b.dataset.hide) { var ht = thread(+b.dataset.hide); if (ht && !isAgent(ht)) { ht.hidden = !ht.hidden; save(); paintList(); } }   // r6: hide puts a chat away (Remove this thread, in its info, still removes it)
    else if (b.dataset.q) goTo(+b.dataset.q);
    else if (b.dataset.e && m) {
      if (b.dataset.e === 'more') { showEmojis(); }
      else { react(m.id, b.dataset.e); sel = null; paintThread(true); }
    }
    else if (b.dataset.p && passing) { passing.to = +b.dataset.p; passing.note = (passEl.querySelector('.mg-pn') || {}).value || ''; paintThread(true); }
    else if (o === 'reply' && m) { re = m.id; sel = null; paintThread(true); try { ta.focus(); } catch (x) {} }
    else if (o === 'copy' && m) { try { G.navigator.clipboard.writeText(m.text); } catch (x) {} sel = null; paintThread(true); }
    else if (o === 'edit' && m) { editing = m.id; ta.value = m.text; sel = null; paintThread(true); grow(); try { ta.focus(); } catch (x) {} }
    else if (o === 'undo' && m) undo(m.id);
    else if (o === 'pass' && m) { passing = { id: m.id, to: null, note: '' }; paintThread(true); }
    else if (o === 'passgo' && passing && passing.to) { var pid = passOn(passing.id, passing.to, (passEl.querySelector('.mg-pn') || {}).value), to = passing.to; passing = null; sel = null; if (pid != null) show(to, pid); else paintThread(true); }
    else if (o === 'passno') { passing = null; paintThread(true); }
    else if (o === 'accept' && m) { answer(m.id, 'accepted'); sel = null; paintThread(true); }
    else if (o === 'passback' && m) { answer(m.id, 'back', ta.value.trim()); ta.value = ''; sel = null; paintThread(true); }
    else if (o === 'takeback' && m) { answer(m.id, 'taken'); sel = null; paintThread(true); }
    else if (o === 'done') { sel = null; paintThread(true); }
    else if (o === 'translate' && m) { if (m.tr) { delete m.tr; save(); sel = null; paintThread(true); } else translate(m); }
    else if (o === 'tonotes' && m) { toNotes('from ' + t.name + ' · ' + (m.kind ? kindLine(m) + (m.text ? ' · ' : '') : '') + (m.text || '')); sel = null; paintThread(true); }
    else if (o === 'sendnow' && m) { release(t, m); sel = null; save(); paintThread(true); }
    else if (o === 'unlater' && m) { t.msgs = t.msgs.filter(function (x) { return x.id !== m.id; }); ta.value = m.text; sel = null; save(); paintThread(true); grow(); say('cancelled · it is back in the box'); }
  });
  find.addEventListener('input', paintList);
  ta.addEventListener('input', grow);
  function doSendFromComp() {
    if (editing != null) { edit(editing, ta.value); editing = null; sel = null; ta.value = ''; paintThread(true); grow(); }
    else if (send(ta.value) != null) { ta.value = ''; grow(); }
  }
  function onEnterSend(e) {
    if (e.isComposing) return;
    var isEnter = e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13;
    if (!isEnter || e.shiftKey) return;
    e.preventDefault();
    doSendFromComp();
  }
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (cur != null) back(); else close(); return; }
    onEnterSend(e);
  });
  ta.addEventListener('keypress', onEnterSend);
  var sendBtn = q('.im-send');
  function onSendPointer(e) {
    if (e && e.button && e.button !== 0) return;
    if (e) { e.preventDefault(); e.stopPropagation(); }
    doSendFromComp();
  }
  if (sendBtn) {
    sendBtn.addEventListener('pointerup', onSendPointer);
    sendBtn.addEventListener('touchend', onSendPointer, { passive: false });
  }
  if (GJ.askOut && GJ.askOut.onMode) GJ.askOut.onMode(function () { if (on) paintF3(); });

  ensureAgent();
  GJ.messagesOurs = {
    list: function () { return D.threads.map(function (t) { return t.name; }); },
    chatNames: function () { return D.threads.filter(function (t) { return person(t) && !t.hidden && !t.locked; }).map(function (t) { return { id: t.id, name: t.name }; }); },
    sendMedia: sendMedia, tool: function (k) { tool(k); }, att: att, chat: function (nm) { var t = D.threads.filter(function (x) { return x.name === nm; })[0]; return t ? JSON.parse(JSON.stringify(t)) : null; },
    set: function (nm, o) { var t = D.threads.filter(function (x) { return x.name === nm; })[0]; if (t) { Object.keys(o || {}).forEach(function (k) { t[k] = o[k]; }); save(); if (on) { if (cur != null) paintThread(true); else paintList(); } } return !!t; },
    export: exportThread, toThreads: toThreads,
    draft: function (nm, text) { var id = start(nm); if (id == null) return false; open(); var t = thread(id); if (t && t.locked) { lockOpen(t, 'unlock ' + t.name).then(function (ok) { if (ok) { show(id); ta.value = String(text || ''); grow(); } }); return true; } show(id); ta.value = String(text || ''); grow(); return true; },
    open: open, close: close, isOpen: function () { return on; }, start: start, show: function (id, mid) { openT(id, mid); }, back: back, send: send, undo: undo, edit: edit, react: react, pass: passOn, answer: answer,
    hold: function (id) { sel = id; passing = null; if (on) paintThread(true); },
    as: function (w) { as = w === 'them' ? 'them' : 'me'; if (on && cur != null) paintThread(true); },
    skew: function (ms) { skew = ms || 0; if (on && cur != null) paintThread(true); },
    typing: function (v) { typingOn = !!v; if (on && cur != null) paintThread(true); return typingOn; },
    light: setLight,
    applyIncoming: applyIncoming,
    ensureOzChat: ensureOzChat, openOzChat: openOzChat, ensureCreator: ensureCreator, openCreator: openCreator, openAgent: openAgent, openNamed: openNamed, ensureTest: ensureOzChat, openTest: openOzChat,
    times: function (v) { if (v != null) timesOn = !!v; if (on && cur != null) paintThread(true); return timesOn; },
    info: function (openIt) { if (openIt && cur != null) { infoEl.hidden = false; thEl.hidden = true; paintInfo(); } return !infoEl.hidden; },
    emojiOpen: function () { if (on && cur != null) showEmojis(); return !emojis.hidden; },
    state: function () {
      var t = thread(cur);
      return { on: on, threads: D.threads.map(function (x) { return x.name; }), cur: t ? t.name : null, as: as, sel: sel, re: re, editing: editing, typing: typingOn,
        msgs: t ? t.msgs.map(function (m) { return { id: m.id, me: m.me, text: m.text, unsent: !!m.unsent, sys: !!m.sys, edits: (m.edits || []).length, re: m.re == null ? null : m.re, react: m.react || {}, pass: m.pass ? m.pass.state : null, from: m.pass ? m.pass.from : null, canUndo: canUndo(m), canEdit: canEdit(m), out: m.out || null }; }) : [] };
    }
  };

  el.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-oz]');
    if (!b) return;
    var k = b.getAttribute('data-oz'), tcur = thread(cur);
    if (!tcur || !GJ.ozChat) return;
    e.preventDefault(); e.stopPropagation();
    if (k === 'notquite' || k === 'creator') {
      var line = GJ.ozChat.startCreatorAsk();
      tcur.msgs.push({ id: D.n++, me: false, fromOz: true, text: line, t: now(), actsHtml: GJ.ozChat.actionsHtml('creatorask') });
      save(); paintThread();
    } else if (k === 'bug') {
      var q = GJ.ozChat.startBug();
      tcur.msgs.push({ id: D.n++, me: false, fromOz: true, text: q, t: now() });
      save(); paintThread();
    } else if (k === 'grant-debug' || k === 'grant-msg') {
      var pending = GJ.ozChat.pending && GJ.ozChat.pending();
      var summary = (pending && pending.bundle) ? 'debug bundle' : 'a message for Gill';
      GJ.ozChat.requestPass(k === 'grant-debug' ? 'debug' : 'message', summary, pending && pending.bundle);
      if (GJ.circle && GJ.circle.unlockCreator) GJ.circle.unlockCreator();
      var sent = { id: D.n++, me: true, text: k === 'grant-debug' ? 'Debug bundle for creator' : (pending && pending.summary) || 'A message for Gill', t: now() };
      var cr = ensureCreator();
      var r = GJ.ozChat.confirmSendToCreator(sent.text);
      sent.out = r && r.ok ? { state: 'arrived', label: "Sent to creator's inbox", stub: true } : { state: 'queued', label: 'Waiting for a one-time pass' };
      cr.msgs.push(sent);
      if (r && r.ok) cr.msgs.push({ id: D.n++, me: false, sys: true, text: r.text, t: now() });
      save(); openCreator();
    } else if (k === 'cancel') {
      if (GJ.ozChat.setPending) GJ.ozChat.setPending(null);
    }
  });
  logEl.addEventListener('click', function (e) {
    var x = e.target.closest && e.target.closest('.im-b.me .im-x');
    if (!x) return;
    var id = x.closest('.im-b') && x.closest('.im-b').getAttribute('data-id');
    var tcur = thread(cur), m = msg(tcur, +id || id);
    if (m && m.out && m.out.sealed) { m.showCipher = !m.showCipher; paintThread(true); }
  });

  if (GJ.ozLayers && GJ.ozLayers.applySkin) GJ.ozLayers.applySkin();
})(window);
