/* oz one (r4, item 17) · Messages, complete, in oz's own style. Private and on this phone: no cloud, no analytics, no
   account. Delivery between oz people goes through the messageTransport slot (here its labelled stub: a loopback "example
   contact"); sealing through messageCrypto, the chat lock through chatLock, translation through translateOnDevice — each
   a labelled preview stub. For anyone outside oz, "send via iMessage" fills the phone's own Messages sheet
   (GJ.messageFill.openMessageSheet) and the person taps Send; oz never sends there on its own.
     chats ........ pinned on top · search across every chat · drafts kept · unread marks · hidden chats
     a chat ....... night, red, rose and day, with the dot always there; bubbles in familiar colours at night (no mint)
     emoji ........ a deep picker: search, categories, skin tones, recents, the newest set marked 🆕 (a local file)
     reactions .... the house dotted-star set, following the light — never sparkles (✨ is the environment's alone)
     hold a message: reply in thread · quote · edit · unsend · pin · save to Notes / the Archive · copy · forward ·
                     translate · remind me
     hold a chat .. mute · pin · hide · disappearing messages · tone · wallpaper
     media ........ voice notes (waveform, speed) · photos, video and clips sent exactly as they are · links and files
                    as cards · the camera · stickers from your own frames
     control ...... typing and read indicators (each a toggle) · scheduled send · a lock per chat
     threads ...... any chat distilled into cards (open items, decisions, next steps) with reply and done
   Kept on this phone (settings 'gj-msg2'; pictures and recordings in GJ.keep). GJ.messages.open() · close() · isOpen() */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement;
  var KEY = 'gj-msg2', UNDO = 2 * 6e4, EDIT = 15 * 6e4;
  function priv(n) { return G.oz && G.oz.private ? G.oz.private.get(n) : null; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function clock(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return ((h + 11) % 12 + 1) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' am' : ' pm'); }
  function day(t) { var d = new Date(t), n = new Date(); return d.toDateString() === n.toDateString() ? clock(t) : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 1800); }

  /* ---------- the store: chats, defaults ---------- */
  var DEF = { typing: true, read: true, tone: 'soft', skin: 0, enterSends: true, disappear: 0 };
  var D = { chats: [], n: 1, recents: [], prefs: DEF, saved: [] };
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.chats) D = s0; } catch (e) {}
  D.prefs = Object.assign({}, DEF, D.prefs || {}); D.recents = D.recents || []; D.saved = D.saved || [];
  if (!D.prefs.enterFixed1120b) { D.prefs.enterSends = true; D.prefs.enterFixed1120b = true; }
  (function migrate() {   // the earlier Messages (gj-msg): its threads become chats, nothing lost
    if (D.migrated) return; D.migrated = true;
    try { var o = JSON.parse(GJ.settings.getItem('gj-msg') || 'null'); if (o && o.threads) o.threads.forEach(function (t) {
      D.chats.push({ id: D.n++, name: t.name, kind: 'oz', msgs: (t.msgs || []).map(function (m) { return { id: D.n++, me: m.me, kind: 'text', body: m.text || '', t: m.t, react: m.react ? [m.react] : [], unsent: !!m.unsent, edits: m.edits || [] }; }) }); }); } catch (e) {}
    if (!D.chats.length) {   // two example chats, clearly marked
      D.chats.push({ id: D.n++, name: 'example contact', kind: 'oz', example: true, msgs: [
        { id: D.n++, me: false, kind: 'text', body: 'example · are we still on for the blue hour walk?', t: Date.now() - 36e5 * 3 },
        { id: D.n++, me: true, kind: 'text', body: 'example · yes — meet at the pier at 4:40', t: Date.now() - 36e5 * 2.8, state: 'read' },
        { id: D.n++, me: false, kind: 'text', body: 'example · I’ll bring the small light. who books the parking?', t: Date.now() - 36e5 * 2.7 }] });
      D.chats.push({ id: D.n++, name: 'example · outside oz', kind: 'outside', to: '+1 555 0100', example: true, msgs: [] });
    }
  })();
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  function chat(id) { return D.chats.filter(function (c) { return c.id === id; })[0]; }
  function msgOf(c, id) { return c && c.msgs.filter(function (m) { return m.id === id; })[0]; }
  var BLOBS = {};   // pictures, clips and voice notes, exactly as they came (kept in GJ.keep under msg:<id>)
  function blobURL(m) { if (BLOBS[m.id]) return BLOBS[m.id]; if (m.src) return m.src; if (GJ.keep) GJ.keep.get('msg:' + m.id).then(function (b) { if (b && !BLOBS[m.id]) { BLOBS[m.id] = URL.createObjectURL(b); if (cur === chatIdOf(m)) paintChat(); } }); return ''; }
  function chatIdOf(m) { var c = D.chats.filter(function (x) { return x.msgs.indexOf(m) >= 0; })[0]; return c ? c.id : null; }

  /* ---------- the house reactions: dotted stars, following the light ---------- */
  var REACT = {
    love: [[6, 4], [3, 3], [1, 6], [2, 9], [6, 12], [10, 9], [11, 6], [9, 3]],
    yes: [[2, 7], [4, 9], [6, 11], [8, 8], [10, 5], [12, 2]],
    haha: [[2, 5], [3, 8], [5, 10], [7, 11], [9, 10], [11, 8], [12, 5], [4, 3], [10, 3]],
    wow: [[7, 1], [7, 13], [1, 7], [13, 7], [3, 3], [11, 11], [3, 11], [11, 3], [7, 7]],
    sad: [[11, 2], [9, 4], [7, 6], [5, 8], [3, 10], [2, 12], [12, 1]],
    ask: [[4, 3], [6, 1.6], [9, 2], [10, 4.5], [8, 6.5], [7, 8.5], [7, 12]]
  };
  var RNAMES = { love: 'love', yes: 'yes', haha: 'ha', wow: 'wow', sad: 'sad', ask: 'a question' };
  function star(k, sz) { var p = REACT[k]; return '<svg class="mz-star" viewBox="0 0 14 14" width="' + (sz || 18) + '" height="' + (sz || 18) + '" role="img" aria-label="' + RNAMES[k] + '">' +
    p.map(function (q, i) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (i === 0 ? 1.25 : .95) + '"/>'; }).join('') + '</svg>'; }

  /* ---------- the room ---------- */
  var el = document.getElementById('msg'); if (el) el.remove();
  el = document.createElement('div'); el.id = 'msg'; el.className = 'mz'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'messages');
  el.innerHTML =
    '<section class="mz-list"><header class="mz-h"><b class="jul">messages</b><button type="button" class="mz-btn" data-a="new" aria-label="new chat">new</button><button type="button" class="mz-btn" data-a="close">done</button></header>' +
    '<p class="mz-say">on this phone · nothing leaves it · delivery is a preview stub</p>' +
    '<input class="mz-find" type="search" placeholder="search every chat" aria-label="search every chat"><div class="mz-chats" role="list"></div><button type="button" class="mz-hidden" data-a="hidden">hidden chats</button></section>' +
    '<section class="mz-chat" hidden><header class="mz-h mz-ch"><button type="button" class="mz-btn mz-back" data-a="back" aria-label="back to chats"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button type="button" class="mz-name" data-a="info" aria-label="who this chat is with, and its details"><i class="mz-av" aria-hidden="true"></i><span class="mz-nm"></span></button>' +
    '<i class="mz-meshmark" hidden role="img" aria-label="mesh mode"></i><button type="button" class="mz-ic mz-call" data-a="call" aria-label="call"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 4h3l1.6 4.4-2 1.2a10 10 0 0 0 5.8 5.8l1.2-2L20 15v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg></button><button type="button" class="mz-ic mz-call" data-a="ft" aria-label="FaceTime"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="7" width="12" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M15 11l5-3v8l-5-3z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg></button></header>' +
    '<div class="mz-pins"></div><div class="mz-log" role="log" aria-live="polite"></div><p class="mz-typing" hidden role="status" aria-label="typing"><i></i><i></i><i></i></p>' +
    '<div class="mz-reply" hidden><span></span><button type="button" data-a="noreply" aria-label="cancel the reply">×</button></div>' +
    '<footer class="mz-comp"><button type="button" class="mz-plus" data-a="plus" aria-label="add: photo, camera, clip, file, voice, sticker, later, and the dial bank">+</button>' +
    '<textarea class="mz-in" rows="1" placeholder="a message" aria-label="message" enterkeyhint="send" autocomplete="off"></textarea><button type="button" class="mz-ic" data-a="emoji" aria-label="emoji"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/><path d="M8.5 14.2a4.3 4.3 0 0 0 7 0" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg></button>' +
    '<button type="button" class="mz-ic" data-a="mic" aria-label="a voice note"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3M9 20.5h6" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg></button><button type="button" class="mz-send" data-a="send" aria-label="send"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></footer>' +
    '<input type="file" class="mz-file" data-k="lib" accept="image/*,video/*" hidden><input type="file" class="mz-file" data-k="cam" accept="image/*,video/*" capture="environment" hidden><input type="file" class="mz-file" data-k="doc" hidden></section>' +
    '<div class="mz-sheet" hidden role="dialog"></div>';
  document.body.appendChild(el);
  var Q = function (s) { return el.querySelector(s); }, list = Q('.mz-chats'), log = Q('.mz-log'), inp = Q('.mz-in'), sheet = Q('.mz-sheet');
  var cur = null, on = false, replyTo = null, editing = null, showHidden = false, timers = {};

  /* ---------- the list ---------- */
  function preview(c) { if (c.draft) return 'draft · ' + c.draft; var m = c.msgs[c.msgs.length - 1]; if (!m) return c.kind === 'outside' ? 'outside oz · send via iMessage' : 'no messages yet';
    return m.unsent ? 'a message was unsent' : m.kind === 'text' ? m.body : m.kind === 'voice' ? 'voice note' : m.kind === 'sticker' ? 'sticker' : m.kind === 'truemoji' ? (G.OZ_TRUEMOJI ? G.OZ_TRUEMOJI.label(m.name) : 'truemoji') : m.kind === 'photo' ? 'photo' : m.kind === 'video' ? 'video' : m.kind === 'file' ? 'file · ' + (m.name || '') : m.kind; }
  function paintList() {
    var q = Q('.mz-find').value.trim().toLowerCase();
    var cs = D.chats.filter(function (c) { if (q) return c.name.toLowerCase().indexOf(q) >= 0 || c.msgs.some(function (m) { return !m.unsent && String(m.body || '').toLowerCase().indexOf(q) >= 0; }); return showHidden ? true : !c.hidden; });
    cs.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || last(b) - last(a); });
    list.innerHTML = cs.map(function (c) { var unread = c.msgs.filter(function (m) { return !m.me && !m.seen; }).length;
      return '<button type="button" class="mz-row' + (unread ? ' unread' : '') + '" role="listitem" data-c="' + c.id + '" aria-label="' + esc(c.name + (unread ? ', unread' : '') + (c.pinned ? ', pinned' : '') + (c.muted ? ', muted' : '')) + '">' +
        '<i class="mz-av" aria-hidden="true">' + esc(c.name.replace(/^example · /, '').charAt(0).toUpperCase()) + '</i><span class="mz-mid"><b>' + esc(c.name) + (c.pinned ? ' <em>pinned</em>' : '') + (c.muted ? ' <em>muted</em>' : '') + (c.locked ? ' <em>locked</em>' : '') + (c.hidden ? ' <em>hidden</em>' : '') + '</b>' +
        '<span>' + esc(c.locked ? 'locked' : preview(c)) + '</span></span><time>' + (last(c) ? day(last(c)) : '') + '</time>' + (unread ? '<i class="mz-dot" aria-hidden="true"></i>' : '') + '</button>'; }).join('') || '<p class="mz-none">no chats' + (q ? ' match' : '') + '</p>';
    Q('.mz-hidden').hidden = !D.chats.some(function (c) { return c.hidden; }); Q('.mz-hidden').textContent = showHidden ? 'put hidden chats away' : 'hidden chats';
  }
  function last(c) { var m = c.msgs[c.msgs.length - 1]; return m ? m.t : 0; }
  Q('.mz-find').addEventListener('input', paintList);

  /* ---------- a chat ---------- */
  /* bubble round: the standard pack's tokens (:hands:, :goodnight: …) draw as their 3D image, as in our skin */
  function teRich(h) { var L = G.OZ_TE_STD || []; return h.replace(/:([a-z]+):/g, function (raw, id) { var t = L.filter(function (x) { return x.id === id; })[0]; return t ? '<img class="te te-3d" src="' + t.src + '" alt="' + esc(t.label) + '">' : raw; }); }
  function bubble(c, m) {
    if (m.unsent) return '<p class="mz-note">' + (m.me ? 'you unsent a message' : 'a message was unsent') + '</p>';
    var body = '';
    if (m.kind === 'text') {
      var shown = (m.openMore && m.moreText) ? m.moreText : m.body;
      body = '<p>' + teRich(linkify(shown)) + '</p>' + (m.link ? '<a class="mz-card" href="' + esc(m.link) + '" target="_blank" rel="noopener"><b>' + esc(host(m.link)) + '</b><span>' + esc(m.link) + '</span></a>' : '');
      if (m.fromOz && m.moreText && !m.openMore) body += '<button type="button" class="oz-more" data-a="more">more</button>';
    }
    if (m.cardsHtml && (m.openMore || !m.moreText)) body += m.cardsHtml;
    if (m.actsHtml) body += m.actsHtml;
    if (m.bundleHtml) body += m.bundleHtml;
    if (m.kind === 'photo') body = '<img class="mz-media" src="' + esc(blobURL(m)) + '" alt="' + (m.example ? 'example photo' : 'photo') + '" draggable="false">' + (m.example ? '<i class="mz-ex">example</i>' : '');
    if (m.kind === 'video') body = '<video class="mz-media" src="' + esc(blobURL(m)) + '" controls playsinline preload="metadata"></video>';
    if (m.kind === 'truemoji') body = G.OZ_TRUEMOJI ? '<span class="mz-tm">' + G.OZ_TRUEMOJI.svg(m.name, 56) + '</span>' : esc(m.name);
    if (m.kind === 'sticker') body = '<img class="mz-sticker" src="' + esc(m.src) + '" alt="a sticker from your own frame" draggable="false">';
    if (m.kind === 'file') body = '<a class="mz-card" href="' + esc(blobURL(m)) + '" download="' + esc(m.name) + '"><b>' + esc(m.name) + '</b><span>' + esc(size(m.size)) + ' · kept exactly as it came</span></a>';
    if (m.kind === 'voice') body = '<div class="mz-voice" data-m="' + m.id + '"><button type="button" data-a="play" aria-label="play the voice note">▶</button><canvas width="180" height="30" aria-hidden="true"></canvas><button type="button" data-a="speed" aria-label="playback speed">' + (m.speed || 1) + '×</button></div>' + (m.example ? '<i class="mz-ex">example voice note</i>' : '');
    if (m.kind === 'handoff') body = '<p>' + esc(m.body) + '</p><i class="mz-ex">handed to iMessage · you tap Send there</i>';
    var re = m.replyTo != null ? msgOf(c, m.replyTo) : null;
    var meta = (m.edits && m.edits.length ? 'edited · ' : '') + (m.sendAt && m.sendAt > Date.now() ? 'scheduled for ' + clock(m.sendAt) : clock(m.t)) + (m.me && m.state && D.prefs.read ? ' · ' + m.state : '') + (m.translated ? ' · ' + esc(m.translated) : '') + (m.remind ? ' · reminder ' + clock(m.remind) : '');
    var rx = (m.react || []).length ? '<span class="mz-rx">' + m.react.map(function (k) { return star(k, 15); }).join('') + '</span>' : '';
    return '<div class="mz-b ' + (m.me ? 'me' : 'them') + (m.pinned ? ' pinned' : '') + '" data-m="' + m.id + '" tabindex="0" aria-label="' + esc((m.me ? 'you: ' : c.name + ': ') + (m.body || m.kind)) + '">' +
      (re ? '<button type="button" class="mz-quote" data-go="' + re.id + '">' + esc(re.unsent ? 'unsent' : (re.body || re.kind)).slice(0, 60) + '</button>' : '') + body + rx + '<small>' + meta + '</small></div>';
  }
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<u>$1</u>'); }
  function host(u) { try { return new URL(u).host; } catch (e) { return u; } }
  function size(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }
  function paintChat() {
    var c = chat(cur); if (!c) return;
    Q('.mz-nm').textContent = c.name; Q('.mz-ch .mz-av').textContent = c.name.replace(/^example · /, '').charAt(0).toUpperCase(); Q('.mz-name').setAttribute('aria-label', c.name + ' — about this chat');
    Q('.mz-meshmark').hidden = !c.mesh; Q('.mz-chat').classList.toggle('mesh', !!c.mesh);
    var pins = c.msgs.filter(function (m) { return m.pinned && !m.unsent; }); Q('.mz-pins').innerHTML = pins.map(function (m) { return '<button type="button" data-go="' + m.id + '">pinned · ' + esc(String(m.body || m.kind).slice(0, 40)) + '</button>'; }).join('');
    Q('.mz-chat').dataset.wall = c.wall || 'night'; Q('.mz-chat').style.backgroundImage = c.wall && c.wall.indexOf('samples/') === 0 ? 'url(' + c.wall + ')' : '';
    log.innerHTML = c.msgs.length ? c.msgs.map(function (m) { return bubble(c, m); }).join('') : '<p class="mz-note">' + (c.kind === 'outside' ? 'outside oz · what you write here goes to the phone’s own Messages · you tap Send there' : 'say something · it stays on this phone') + '</p>';
    c.msgs.forEach(function (m) { if (!m.me) m.seen = true; }); save();
    [].forEach.call(log.querySelectorAll('.mz-voice canvas'), function (cv) { wave(cv, +cv.parentNode.dataset.m); });
    // runs: a run of one side shares one tail, on its last bubble; Read (or the hops, in mesh) sits under the last one you sent
    var bs = [].slice.call(log.querySelectorAll('.mz-b')); bs.forEach(function (b, i) { var nx = b.nextElementSibling; b.classList.toggle('tail', !(nx && nx.classList.contains('mz-b') && nx.classList.contains(b.classList.contains('me') ? 'me' : 'them'))); });
    var lastMe = c.msgs.filter(function (m) { return m.me && !m.unsent; }).pop(), lb = lastMe && log.querySelector('.mz-b[data-m="' + lastMe.id + '"]');
    if (lb && (D.prefs.read || c.mesh)) { var stt = document.createElement('p'); stt.className = 'mz-status'; stt.textContent = c.mesh ? (lastMe.hops ? lastMe.hops + ' hops · preview stub' : 'on its way · mesh · preview stub') : (lastMe.state || '').replace(/^./, function (x) { return x.toUpperCase(); }); lb.insertAdjacentElement('afterend', stt); }
    log.scrollTop = log.scrollHeight;
    Q('.mz-send').classList.toggle('out', c.kind === 'outside'); Q('.mz-send').setAttribute('aria-label', c.kind === 'outside' ? 'send via iMessage' : 'send');
    if (GJ.ozChat && GJ.ozChat.bindInline) GJ.ozChat.bindInline(log);
    if (GJ.ozChat && GJ.ozChat.paintPass) GJ.ozChat.paintPass();
  }
  function wave(cv, id) { var g = cv.getContext('2d'), W = cv.width, H = cv.height, r = (id * 9301 + 49297) % 233280; g.clearRect(0, 0, W, H); g.fillStyle = getComputedStyle(cv).color;
    for (var x = 0; x < W; x += 4) { r = (r * 9301 + 49297) % 233280; var h = 4 + (r / 233280) * (H - 8) * (0.5 + .5 * Math.sin(x / 20)); g.fillRect(x, (H - h) / 2, 2, h); } }
  function openChat(id) {
    var c = chat(id); if (!c) return;
    var go = function () { cur = id; Q('.mz-list').hidden = true; Q('.mz-chat').hidden = false; inp.value = c.draft || ''; replyTo = null; editing = null; Q('.mz-reply').hidden = true; paintChat(); hap('tick'); };
    if (c.locked) { var L = priv('chatLock'); if (L) L.unlock({ chatId: id, why: 'unlock ' + c.name }).then(function (r) { if (r && r.ok) go(); }); return; }
    go();
  }
  function toList() { var c = chat(cur); if (c) { c.draft = inp.value.trim(); save(); } cur = null; Q('.mz-chat').hidden = true; Q('.mz-list').hidden = false; closeSheet(); paintList(); }
  inp.addEventListener('input', function () { inp.style.height = 'auto'; inp.style.height = Math.min(120, inp.scrollHeight) + 'px'; var c = chat(cur); if (c) { c.draft = inp.value; clearTimeout(timers.d); timers.d = setTimeout(save, 400); } });
  function onEnterSend(e) {
    if (e.isComposing) return;
    var isEnter = e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13;
    if (!isEnter || e.shiftKey) return;
    if (D.prefs.enterSends === false) return;
    e.preventDefault();
    send();
  }
  inp.addEventListener('keydown', onEnterSend);
  inp.addEventListener('keypress', onEnterSend);
  var sendBtn = Q('.mz-send');
  function onSendPointer(e) {
    if (e && e.button && e.button !== 0) return;
    if (e) { e.preventDefault(); e.stopPropagation(); }
    send();
  }
  if (sendBtn) {
    sendBtn.addEventListener('pointerup', onSendPointer);
    sendBtn.addEventListener('touchend', onSendPointer, { passive: false });
  }

  /* ---------- sending: oz people through the transport slot; outside through the phone's own Messages ---------- */
  var T = priv('messageTransport'), C = priv('messageCrypto');
  if (T && T.on) {
    T.on('status', function (x) { D.chats.forEach(function (c) { var m = msgOf(c, x.id); if (m) { m.state = x.state; if (x.hops) m.hops = x.hops; } }); save(); if (cur) paintChat(); });
    T.on('typing', function (x) { if (x.chatId === cur && D.prefs.typing) Q('.mz-typing').hidden = !x.typing; });
    T.on('received', function (x) { var c = chat(x.chatId); if (!c) return; var m = x.message; m.id = D.n++; m.me = false; m.t = m.t || m.at || Date.now(); m.kind = m.kind || 'text'; if (C) C.open({ chatId: c.id, sealed: C.seal({ chatId: c.id, payload: m.body }) }); c.msgs.push(m); expire(c); save(); if (cur === c.id && on) paintChat(); else { paintList(); if (!c.muted && GJ.notify) GJ.notify.arrive({ who: c.name, text: String(m.body || m.kind || ''), from: 'messages', chatId: c.id, example: !!c.example }); } });   // bubble round 5: no tick, no banner; it waits
  }
  function push(c, m) {
    m.id = m.id || D.n++; m.me = true; m.t = m.t || Date.now(); if (replyTo != null) { m.replyTo = replyTo; replyTo = null; Q('.mz-reply').hidden = true; }
    if (c.disappear) m.until = Date.now() + c.disappear;
    c.msgs.push(m); c.draft = ''; save(); paintChat(); hap('tick');
    if (c.kind === 'oz' && T) { var sealed = C ? C.seal({ chatId: c.id, payload: m }) : m; void sealed; T.send({ chatId: c.id, mode: c.mesh ? 'mesh' : 'direct', message: { id: m.id, kind: m.kind, body: m.body, attachments: [], replyTo: m.replyTo, sendAt: m.sendAt } }); if (c.mesh) hop(); }
    return m;
  }
  function hop() {   // mesh: the message's hop travels toward F3 (a preview: the stub carries nothing anywhere)
    var a = Q('.mz-send'), f = document.getElementById('f3') || document.getElementById('disc'); if (!a || !f || !a.animate) return; var r0 = a.getBoundingClientRect(), r1 = f.getBoundingClientRect(), d = document.createElement('i'); d.className = 'mz-hop'; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d);
    var x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2, x1 = r1.left + r1.width / 2, y1 = r1.top + r1.height / 2;
    d.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1 }, { transform: 'translate(' + (x0 + (x1 - x0) * .45 - 40) + 'px,' + (y0 + (y1 - y0) * .5) + 'px) scale(.8)', opacity: .9 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.4)', opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.3,.6,.2,1)' }).onfinish = function () { d.remove(); };
  }

  function isOzChat(c) { return !!(c && (c.oz || c.name === 'oz chat')); }
  function isCreator(c) { return !!(c && (c.creator || c.name === 'creator')); }
  function isAgent(c) { return !!(c && (c.agent || /artist agent/i.test(c.name || ''))); }
  function thinkOn() { try { return localStorage.getItem('oz-think') !== 'off'; } catch (e) { return true; } }
  var lastThinkMs = 0;
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
  function setTyping(on0) { var n = Q('.mz-typing'); if (n) n.hidden = !on0; }
  function ensureNamed(name, flags) {
    var c = D.chats.filter(function (x) { return x.name === name; })[0];
    if (!c) { c = { id: D.n++, name: name, kind: 'oz', msgs: [] }; D.chats.unshift(c); }
    if (flags) Object.keys(flags).forEach(function (k) { c[k] = flags[k]; });
    save(); return c;
  }
  function takeOz(c, res) {
    if (!c || !res) return;
    function pushThem(o) { o.id = o.id || D.n++; o.me = false; o.kind = o.kind || 'text'; o.t = o.t || Date.now(); c.msgs.push(o); }
    if (res.kind === 'bugform' || res.kind === 'bugreview') {
      var o = { fromOz: true, body: res.text };
      if (res.bundle) o.bundleHtml = ((GJ.ozChat && GJ.ozChat.paintBundle(res.bundle)) || '') + ((GJ.ozChat && GJ.ozChat.actionsHtml('bugreview')) || '');
      pushThem(o); save(); if (cur === c.id) paintChat(); return;
    }
    if (res.kind === 'reply') {
      var p = res.payload || {};
      var cards = '';
      if (p.cards && p.cards.length) p.cards.forEach(function (card) { cards += card.html || ''; });
      var short = p.short || p.text || '';
      var full = p.full || p.text || '';
      var hasMore = !p.listOnly && ((full && full !== short) || !!cards);
      pushThem({ fromOz: true, body: short, moreText: hasMore ? full : '', cardsHtml: hasMore ? '' : cards, moreCards: cards, listOnly: !!p.listOnly });
      if (res.offer && !p.listOnly) pushThem({ fromOz: true, body: res.offer, actsHtml: GJ.ozChat && GJ.ozChat.actionsHtml('offer') });
      save(); if (cur === c.id) paintChat();
    }
  }
  function afterOzPush(c, m) {
    if (!c || !m || !m.me || m.kind !== 'text') return;
    if (isOzChat(c) && GJ.ozChat && GJ.ozChat.onOzSend) {
      var started = Date.now();
      var delay = thinkOn() ? nextThinkMs(m.body) : 0;
      if (delay) setTyping(true);
      Promise.resolve(GJ.ozChat.onOzSend(m.body)).then(function (res) {
        var wait = Math.max(0, delay - (Date.now() - started));
        setTimeout(function () { setTyping(false); takeOz(c, res); }, wait);
      });
    } else if (isCreator(c) && GJ.ozChat && GJ.ozChat.confirmSendToCreator) {
      var r = GJ.ozChat.confirmSendToCreator(m.body);
      if (r && r.ok) m.state = r.label || "Sent to creator's inbox";
      else {
        m.state = (r && r.text) || 'Waiting for a one-time pass';
        if (GJ.ozChat.requestPass) {
          var ask = GJ.ozChat.requestPass('message', m.body.slice(0, 180));
          c.msgs.push({ id: D.n++, me: false, fromOz: true, kind: 'text', body: ask.text, t: Date.now(), actsHtml: GJ.ozChat.actionsHtml('creatorask') });
        }
      }
      save(); if (cur === c.id) paintChat();
    } else if (isAgent(c)) {
      m.state = 'On this phone';
      save(); if (cur === c.id) paintChat();
    }
  }
  function exportThread(name) {
    var c = D.chats.filter(function (x) { return x.name === name; })[0];
    if (!c) return [];
    return c.msgs.filter(function (m) { return !m.unsent; }).map(function (m) { return { who: m.me ? 'me' : c.name, text: m.body || m.kind, t: m.t }; });
  }
  function toThreads() {
    var c = chat(cur); if (!c || !GJ.threads) return;
    var ms = exportThread(c.name);
    var here = { room: 'messages', id: c.id, name: c.name };
    var go = function (T) {
      if (!T || !T.take) return;
      var id = T.take({ title: c.name, from: 'messages', to: c.name, messages: ms });
      GJ._chatBack = here;
      close();
      T.open(id);
    };
    if (GJ.lazy && GJ.lazy.load) GJ.lazy.load('threads').then(go); else go(GJ.threads);
  }

  function send(at) {
    var c = chat(cur), text = inp.value.trim(); if (!c) return;
    if (editing) { var em = msgOf(c, editing); if (em && text && Date.now() - em.t < EDIT) { em.edits = (em.edits || []).concat([em.body]); em.body = text; if (T && c.kind === 'oz') T.send({ chatId: c.id, message: { id: em.id, kind: 'edit', body: text } }); } editing = null; inp.value = ''; c.draft = ''; save(); paintChat(); return; }
    if (!text) return;
    if (c.kind === 'outside') { handoff(c, text); return; }
    var url = (text.match(/https?:\/\/[^\s]+/) || [])[0];
    var sent = push(c, { kind: 'text', body: text, link: url || null, sendAt: at || null, state: (T && c.kind === 'oz') ? 'queued' : 'On this phone' }); inp.value = ''; inp.style.height = ''; afterOzPush(c, sent);
  }
  function handoff(c, text) {
    var go = function () { return GJ.messageFill.openMessageSheet({ to: c.to || '', body: text }); };
    var p = GJ.messageFill ? Promise.resolve() : (GJ.lazy ? GJ.lazy.load('threads') : Promise.resolve());
    p.then(function () { if (!GJ.messageFill) { say('the iMessage handoff is not in this build'); return; } push(c, { kind: 'handoff', body: text }); inp.value = ''; return go(); });
  }

  /* ---------- the sheets: a message held, a chat held, +, emoji, info, new chat ---------- */
  function openSheet(html_, label) { sheet.innerHTML = '<i class="pl-grab" aria-hidden="true"></i>' + html_; sheet.hidden = false; sheet.setAttribute('aria-label', label || 'more'); requestAnimationFrame(function () { sheet.classList.add('in'); }); }
  function closeSheet() { sheet.classList.remove('in'); sheet.hidden = true; sheet.innerHTML = ''; }
  function rows(items) { return '<div class="mz-rows">' + items.map(function (r) { return r ? '<button type="button" data-s="' + r[0] + '"' + (r[2] ? ' disabled' : '') + '>' + r[1] + '</button>' : ''; }).join('') + '</div>'; }
  function holdMsg(id) {
    var c = chat(cur), m = msgOf(c, id); if (!m || m.unsent) return;
    var mine = m.me, young = Date.now() - m.t;
    openSheet('<div class="mz-rxpick" role="group" aria-label="react">' + Object.keys(REACT).map(function (k) { return '<button type="button" data-rx="' + k + '" aria-pressed="' + ((m.react || []).indexOf(k) >= 0) + '">' + star(k, 26) + '</button>'; }).join('') + '</div>' +
      rows([['reply', 'reply in thread'], ['quote', 'quote'], mine && m.kind === 'text' ? ['edit', 'edit' + (young > EDIT ? ' · too late' : ''), young > EDIT] : null, mine ? ['unsend', 'undo send' + (young > UNDO ? ' · too late' : ''), young > UNDO] : null,
        ['pin', m.pinned ? 'unpin' : 'pin'], ['notes', 'save to Notes'], ['archive', 'save to the Archive'], ['copy', 'copy'], ['forward', 'pass on'], m.kind === 'text' ? ['translate', 'translate on this phone'] : null, ['remind', 'remind me']]), 'message');
    sheet.dataset.m = id;
  }
  function holdChat(id) {
    var c = chat(id); if (!c) return; sheet.dataset.c = id;
    var dis = { 0: 'off', 3600000: '1 hour', 86400000: '1 day', 604800000: '7 days' };
    openSheet('<b class="jul mz-st">' + esc(c.name) + '</b>' + rows([['mute', c.muted ? 'unmute' : 'mute'], ['cpin', c.pinned ? 'unpin' : 'pin'], ['hide', c.hidden ? 'show' : 'hide'], ['lock', c.locked ? 'unlock' : 'lock (Face ID on the phone)'],
      ['dis', 'disappearing messages · ' + dis[c.disappear || 0]], ['tone', 'tone · ' + (c.tone || D.prefs.tone)], ['wall', 'wallpaper · ' + wallName(c.wall)], ['distill', 'find what’s still open (threads)']]), 'chat');
  }
  function wallName(w) { return !w || w === 'night' ? 'night' : w === 'dusk' ? 'dusk' : w === 'plain' ? 'plain' : 'one of your frames'; }
  sheet.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); var c = chat(cur) || chat(+sheet.dataset.c), m = c && msgOf(c, +sheet.dataset.m);
    if (b.dataset.rx && m) { m.react = m.react || []; var i = m.react.indexOf(b.dataset.rx); if (i >= 0) m.react.splice(i, 1); else m.react.push(b.dataset.rx); save(); closeSheet(); paintChat(); hap('tick'); if (T && c.kind === 'oz') T.send({ chatId: c.id, message: { id: D.n++, kind: 'reaction', body: b.dataset.rx, replyTo: m.id } }); return; }
    var a = b.dataset.s;
    if (a === 'reply') { replyTo = m.id; Q('.mz-reply span').textContent = 'replying to · ' + String(m.body || m.kind).slice(0, 50); Q('.mz-reply').hidden = false; inp.focus(); }
    if (a === 'quote') { inp.value = '“' + String(m.body || '').slice(0, 140) + '” — ' + inp.value; inp.focus(); }
    if (a === 'edit') { editing = m.id; inp.value = m.body; inp.focus(); say('editing · send to keep it'); }
    if (a === 'unsend') { m.unsent = true; if (T && c.kind === 'oz') T.send({ chatId: c.id, message: { id: m.id, kind: 'unsend' } }); }
    if (a === 'pin') m.pinned = !m.pinned;
    if (a === 'notes') { var go = function () { GJ.notes.add('from ' + c.name + ' · ' + (m.body || m.kind)); say('saved to Notes'); }; if (GJ.notes && GJ.notes.add) go(); else if (GJ.lazy) GJ.lazy.load('notes').then(go); }
    if (a === 'archive') { D.saved.push({ from: c.name, kind: m.kind, body: m.body || '', t: Date.now() }); say('kept for the Archive · on this phone'); }
    if (a === 'copy') { try { navigator.clipboard.writeText(m.body || ''); } catch (x) {} say('copied'); }
    if (a === 'forward') { openSheet('<b class="jul mz-st">pass on to</b>' + rows(D.chats.filter(function (x) { return x.id !== c.id; }).map(function (x) { return ['fw:' + x.id, esc(x.name)]; })), 'forward'); sheet.dataset.m = m.id; return; }
    if (a && a.indexOf('fw:') === 0) { var to = chat(+a.slice(3)), fm = msgOf(c, +sheet.dataset.m); if (to && fm) { var copy = JSON.parse(JSON.stringify(fm)); delete copy.id; copy.react = []; copy.pinned = false; copy.fwd = c.name; copy.t = Date.now(); to.msgs.push(Object.assign(copy, { id: D.n++, me: true })); if (BLOBS[fm.id]) BLOBS[copy.id] = BLOBS[fm.id]; save(); say('forwarded to ' + to.name); } }
    if (a === 'translate') { var tr = priv('translateOnDevice'); if (tr) tr.translate({ text: m.body, to: 'en' }).then(function (r) { m.translated = r.label; save(); paintChat(); }); }
    if (a === 'remind') { openSheet('<b class="jul mz-st">remind me</b>' + rows([['r:600000', 'in 10 minutes'], ['r:3600000', 'in an hour'], ['r:tomorrow', 'tomorrow at 9']]), 'remind me'); sheet.dataset.m = m.id; return; }
    if (a && a.indexOf('r:') === 0) { var rm = msgOf(c, +sheet.dataset.m), when = a === 'r:tomorrow' ? (function () { var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return +d; })() : Date.now() + +a.slice(2); if (rm) { rm.remind = when; reminders(); say('a reminder at ' + clock(when) + ' · on this phone'); } }
    // a chat held
    var hc = chat(+sheet.dataset.c);
    if (hc && a === 'mute') hc.muted = !hc.muted;
    if (hc && a === 'cpin') hc.pinned = !hc.pinned;
    if (hc && a === 'hide') hc.hidden = !hc.hidden;
    if (hc && a === 'lock') { var L = priv('chatLock'); if (hc.locked && L) { L.unlock({ chatId: hc.id, why: 'take the lock off ' + hc.name }).then(function (r) { if (r && r.ok) { hc.locked = false; save(); paintList(); } }); } else { hc.locked = true; if (L) L.lock({ chatId: hc.id }); } }
    if (hc && a === 'dis') { var L2 = [0, 3600000, 86400000, 604800000]; hc.disappear = L2[(L2.indexOf(hc.disappear || 0) + 1) % L2.length]; save(); holdChat(hc.id); return; }
    if (hc && a === 'tone') { var TN = ['soft', 'bell', 'tick', 'none']; hc.tone = TN[(TN.indexOf(hc.tone || D.prefs.tone) + 1) % TN.length]; save(); holdChat(hc.id); return; }
    if (hc && a === 'wall') { var S_ = G.GJ_SAMPLES || [], WL = ['night', 'dusk', 'plain'].concat(S_.slice(0, 2).map(function (x) { return x.file; })); hc.wall = WL[(WL.indexOf(hc.wall || 'night') + 1) % WL.length]; save(); holdChat(hc.id); if (cur) paintChat(); return; }
    if (hc && a === 'distill') { closeSheet(); distill(hc); return; }
    if (a && a.indexOf('dl:') === 0) { closeSheet(); if (GJ.dialBank) GJ.dialBank.float(a.slice(3)); return; }
    if (a && a.indexOf('mode:') === 0 && c) { c.mesh = a === 'mode:mesh'; save(); paintChat(); info(c); hap('tick'); return; }
    // + and its kinds
    if (a === 'lib' || a === 'cam' || a === 'doc') { el.querySelector('.mz-file[data-k="' + a + '"]').click(); }
    if (a === 'voice') { voice(); return; }
    if (a === 'exvoice') { push(chat(cur), { kind: 'voice', example: true, dur: 6, state: 'queued' }); }
    if (a === 'sticker') { var SS = (G.GJ_SAMPLES || []).slice(0, 8); openSheet('<b class="jul mz-st">a sticker from your frames</b><div class="mz-stk">' + SS.map(function (x) { return '<button type="button" data-s="st:' + esc(x.file) + '" aria-label="a sticker from this frame"><img src="' + esc(x.file) + '" alt=""></button>'; }).join('') + '</div>', 'stickers'); return; }
    if (a && a.indexOf('st:') === 0) push(chat(cur), { kind: 'sticker', src: a.slice(3), state: 'queued' });
    if (a === 'later') { openSheet('<b class="jul mz-st">send later</b>' + rows([['at:600000', 'in 10 minutes'], ['at:3600000', 'in an hour'], ['at:tomorrow', 'tomorrow at 9']]), 'send later'); return; }
    if (a && a.indexOf('at:') === 0) { var at = a === 'at:tomorrow' ? (function () { var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return +d; })() : Date.now() + +a.slice(3); closeSheet(); send(at); return; }
    if (a === 'mkoz' || a === 'mkout') { var nm = (sheet.querySelector('.mz-nn') || {}).value || '', ph = (sheet.querySelector('.mz-np') || {}).value || ''; nm = nm.trim(); if (!nm) { sheet.querySelector('.mz-nn').focus(); return; } var nc = { id: D.n++, name: nm.slice(0, 30), kind: a === 'mkoz' ? 'oz' : 'outside', to: ph.trim(), msgs: [], disappear: D.prefs.disappear || 0 }; D.chats.unshift(nc); save(); closeSheet(); openChat(nc.id); return; }
    if (a === 'emo' || b.dataset.e) { return; }
    save(); closeSheet(); if (cur) paintChat(); else paintList();
  });
  // the files: photos, video and documents go in exactly as they are (nothing re-encoded, nothing graded)
  [].forEach.call(el.querySelectorAll('.mz-file'), function (f) { f.addEventListener('change', function () {
    var file = f.files && f.files[0]; f.value = ''; if (!file) return; var c = chat(cur); if (!c) return;
    var kind = /^image\//.test(file.type) ? 'photo' : /^video\//.test(file.type) ? 'video' : 'file', m = { id: D.n++, kind: kind, name: file.name, size: file.size, state: 'queued' };
    BLOBS[m.id] = URL.createObjectURL(file); if (GJ.keep) GJ.keep.put('msg:' + m.id, file); push(c, m); closeSheet();
  }); });

  /* ---------- voice notes: hold to record where the phone allows; a marked example otherwise ---------- */
  var rec = null;
  function voice() {
    var c = chat(cur); if (!c) return;
    if (!navigator.mediaDevices || !G.MediaRecorder) { openSheet('<b class="jul mz-st">voice note</b><p class="mz-say">this browser can’t record here</p>' + rows([['exvoice', 'send an example voice note']]), 'voice'); return; }
    openSheet('<b class="jul mz-st">voice note</b><p class="mz-say mz-rec">starting…</p>' + rows([['vstop', 'stop and send'], ['vcancel', 'cancel']]), 'voice');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
      var chunks = [], r = new MediaRecorder(st); rec = { r: r, st: st, t0: Date.now(), keep: true }; r.ondataavailable = function (e) { chunks.push(e.data); };
      r.onstop = function () { st.getTracks().forEach(function (t) { t.stop(); }); if (!rec || !rec.keep) { rec = null; return; } var blob = new Blob(chunks, { type: r.mimeType }), m = { id: D.n++, kind: 'voice', dur: (Date.now() - rec.t0) / 1000, state: 'queued' }; BLOBS[m.id] = URL.createObjectURL(blob); if (GJ.keep) GJ.keep.put('msg:' + m.id, blob); rec = null; push(c, m); };
      r.start(); var p = sheet.querySelector('.mz-rec'); if (p) p.textContent = 'recording · on this phone';
    }, function () { openSheet('<b class="jul mz-st">voice note</b><p class="mz-say">the microphone isn’t available here</p>' + rows([['exvoice', 'send an example voice note']]), 'voice'); });
  }
  sheet.addEventListener('click', function (e) { var b = e.target.closest('button[data-s="vstop"], button[data-s="vcancel"]'); if (!b || !rec) return; rec.keep = b.dataset.s === 'vstop'; rec.r.stop(); closeSheet(); }, true);
  var audio = new Audio();
  log.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var c = chat(cur);
    if (b.dataset.go) { var t = log.querySelector('[data-m="' + b.dataset.go + '"]'); if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.classList.add('flash'); setTimeout(function () { t.classList.remove('flash'); }, 900); } return; }
    var v = b.closest('.mz-voice'); if (!v) return; var m = msgOf(c, +v.dataset.m);
    if (b.dataset.a === 'speed') { m.speed = { 1: 1.5, 1.5: 2, 2: 1 }[m.speed || 1]; b.textContent = m.speed + '×'; audio.playbackRate = m.speed; save(); return; }
    if (b.dataset.a === 'play') { var u = blobURL(m); if (!u) { say(m.example ? 'example voice note · nothing to play' : 'loading'); return; } if (!audio.paused && audio.dataset.m == m.id) { audio.pause(); b.textContent = '▶'; return; } audio.src = u; audio.dataset.m = m.id; audio.playbackRate = m.speed || 1; audio.play(); b.textContent = '❚❚'; audio.onended = function () { b.textContent = '▶'; }; }
  });
  Q('.mz-pins').addEventListener('click', function (e) { var b = e.target.closest('[data-go]'), t = b && log.querySelector('[data-m="' + b.dataset.go + '"]'); if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.classList.add('flash'); setTimeout(function () { t.classList.remove('flash'); }, 900); } });

  /* ---------- the emoji picker ---------- */
  var E = G.OZ_EMOJI || { cats: [], skin: [], tones: [''] }, canDraw = {};
  function drawable(ch) { if (canDraw[ch] != null) return canDraw[ch]; try { var cv = document.createElement('canvas'); cv.width = cv.height = 20; var g = cv.getContext('2d'); g.font = '16px sans-serif'; g.fillText(ch, 0, 16); var d = g.getImageData(0, 0, 20, 20).data, n = 0; for (var i = 3; i < d.length; i += 4) if (d[i]) n++; canDraw[ch] = n > 12; } catch (e) { canDraw[ch] = true; } return canDraw[ch]; }
  function tone(ch) { var t = E.tones[D.prefs.skin] || ''; if (!t || E.skin.indexOf(ch) < 0) return ch; return ch.replace('️', '') + t; }
  function emojiSheet(q) {
    var cats = E.cats.map(function (c) { var es = c.e.filter(function (x) { return (!q || x[1].indexOf(q) >= 0) && (!c.isNew || drawable(x[0])); }); return { c: c, es: es }; }).filter(function (x) { return x.es.length; });
    var rec_ = q ? '' : (D.recents.length ? '<h4>recent</h4><div class="mz-eg">' + D.recents.map(function (ch) { return '<button type="button" data-e="' + ch + '">' + ch + '</button>'; }).join('') + '</div>' : '');
    openSheet('<div class="mz-eh"><input class="mz-es" type="search" placeholder="search emoji" aria-label="search emoji" value="' + esc(q || '') + '"><span class="mz-skin" role="group" aria-label="skin tone">' +
      ['✋', '✋🏻', '✋🏼', '✋🏽', '✋🏾', '✋🏿'].map(function (h, i) { return '<button type="button" data-skin="' + i + '" aria-pressed="' + (D.prefs.skin === i) + '">' + h + '</button>'; }).join('') + '</span></div>' +
      '<nav class="mz-tabs">' + cats.map(function (x) { return '<button type="button" data-tab="' + x.c.id + '">' + (x.c.isNew ? '🆕' : x.es[0][0]) + '</button>'; }).join('') + '</nav>' +
      '<div class="mz-ebody">' + rec_ + cats.map(function (x) { return '<h4 id="mz-c-' + x.c.id + '">' + (x.c.isNew ? '🆕 the newest set' : x.c.name) + '</h4><div class="mz-eg">' + x.es.map(function (e) { return '<button type="button" data-e="' + tone(e[0]) + '" aria-label="' + esc(e[1]) + (x.c.isNew ? ', new' : '') + '">' + tone(e[0]) + (x.c.isNew ? '<sup>🆕</sup>' : '') + '</button>'; }).join('') + '</div>'; }).join('') + '</div>', 'emoji');
    var s = sheet.querySelector('.mz-es'); s.addEventListener('input', function () { var v = s.value.trim().toLowerCase(); emojiSheet(v); var n = sheet.querySelector('.mz-es'); n.focus(); n.setSelectionRange(v.length, v.length); });
  }
  sheet.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tm) { e.stopPropagation(); closeSheet(); var tc = chat(cur); if (tc) push(tc, { kind: 'truemoji', name: b.dataset.tm, state: 'queued' }); return; }
    if (b.dataset.e) { e.stopPropagation(); var ch = b.dataset.e, p = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, p) + ch + inp.value.slice(p); D.recents = [ch].concat(D.recents.filter(function (x) { return x !== ch; })).slice(0, 24); save(); hap('tick'); return; }
    if (b.dataset.skin != null) { e.stopPropagation(); D.prefs.skin = +b.dataset.skin; save(); emojiSheet((sheet.querySelector('.mz-es') || {}).value || ''); return; }
    if (b.dataset.tab) { e.stopPropagation(); var h = sheet.querySelector('#mz-c-' + b.dataset.tab); if (h) h.scrollIntoView({ block: 'start' }); }
  }, true);

  /* ---------- threads: a chat distilled into cards (open items, decisions, next steps), with reply and done ---------- */
  function distill(c) {
    var go = function () {
      var text = c.msgs.filter(function (m) { return !m.unsent && m.body; }).map(function (m) { return (m.me ? 'me' : c.name) + ': ' + m.body; }).join('\n');
      var cards = GJ.threads && GJ.threads.distill ? GJ.threads.distill(text) : [];
      c.cards = cards.map(function (k, i) { var old = (c.cards || [])[i]; return { kind: k.kind, text: k.text, who: k.who || '', done: old && old.text === k.text ? old.done : false }; }); save();
      var LAB = { open: 'open item', decision: 'decision', next: 'next step' };
      openSheet('<b class="jul mz-st">what’s still open · ' + esc(c.name) + '</b>' + (c.cards.length ? '<div class="mz-cards">' + c.cards.map(function (k, i) { return '<div class="mz-k' + (k.done ? ' done' : '') + '"><em>' + (LAB[k.kind] || k.kind) + '</em><p>' + esc(k.text) + '</p><span><button type="button" data-k="reply:' + i + '">reply</button><button type="button" data-k="done:' + i + '" aria-pressed="' + k.done + '">' + (k.done ? 'done ✓' : 'done') + '</button></span></div>'; }).join('') + '</div>' : '<p class="mz-say">nothing open in this chat</p>') +
        '<p class="mz-say">read on this phone · a plain rule set, the Threads room’s own</p>', 'threads');
      sheet.dataset.c = c.id;
    };
    if (GJ.threads && GJ.threads.distill) go(); else if (GJ.lazy) GJ.lazy.load('threads').then(go, go);
  }
  sheet.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]'); if (!b) return; e.stopPropagation(); var c = chat(+sheet.dataset.c), p = b.dataset.k.split(':'), k = c && c.cards[+p[1]]; if (!k) return;
    if (p[0] === 'done') { k.done = !k.done; save(); distill(c); }
    if (p[0] === 'reply') { closeSheet(); if (cur !== c.id) openChat(c.id); inp.value = '“' + k.text + '” — '; inp.focus(); }
  }, true);

  /* ---------- holding: a message, or a chat (a long press, like the phone) ---------- */
  function longPress(root, sel, fn) {
    var t = null, sx = 0, sy = 0, fired = false;
    root.addEventListener('pointerdown', function (e) { var n = e.target.closest(sel); if (!n || e.target.closest('button:not(.mz-row), a, video')) { if (!(n && n.classList.contains('mz-row'))) return; } fired = false; sx = e.clientX; sy = e.clientY; t = setTimeout(function () { fired = true; hap('commit'); fn(n); }, 480); });
    root.addEventListener('pointermove', function (e) { if (t && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { clearTimeout(t); t = null; } });
    root.addEventListener('pointerup', function () { clearTimeout(t); t = null; });
    root.addEventListener('click', function (e) { if (fired) { e.stopPropagation(); e.preventDefault(); fired = false; } }, true);
    root.addEventListener('contextmenu', function (e) { var n = e.target.closest(sel); if (n) { e.preventDefault(); fn(n); } });
  }
  longPress(log, '.mz-b', function (n) { holdMsg(+n.dataset.m); });
  (function () {   // pull the thread left: the times come out from the right edge, and spring back when you let go
    var p = null; log.addEventListener('pointerdown', function (e) { p = { x: e.clientX, y: e.clientY, on: false }; });
    log.addEventListener('pointermove', function (e) { if (!p) return; var dx = e.clientX - p.x, dy = e.clientY - p.y; if (!p.on && dx < -10 && Math.abs(dx) > Math.abs(dy) * 1.4) { p.on = true; log.classList.add('pulling'); } if (p.on) log.style.setProperty('--pull', Math.min(66, Math.max(0, -dx - 10)) + 'px'); });
    function end() { if (p && p.on) { log.classList.remove('pulling'); log.style.setProperty('--pull', '0px'); } p = null; }
    log.addEventListener('pointerup', end); log.addEventListener('pointercancel', end);
  })();
  longPress(list, '.mz-row', function (n) { holdChat(+n.dataset.c); });
  list.addEventListener('click', function (e) { var r = e.target.closest('.mz-row'); if (r) openChat(+r.dataset.c); });

  /* ---------- the rest of the buttons ---------- */
  el.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b || sheet.contains(b) || log.contains(b)) return; var a = b.dataset.a, c = chat(cur);
    if (a === 'close') close();
    if (a === 'back') toList();
    if (a === 'send') send();
    if (a === 'noreply') { replyTo = null; Q('.mz-reply').hidden = true; }
    if (a === 'emoji') emojiSheet('');
    if (a === 'hidden') { showHidden = !showHidden; paintList(); }
    if (a === 'plus') openSheet('<b class="jul mz-st">add</b><div class="mz-drawer" role="group" aria-label="attachments">' + [['lib', 'photos', '◫'], ['cam', 'camera', '◎'], ['doc', 'a file', '▤'], ['voice', 'voice', '◖'], ['sticker', 'sticker', '◍'], ['later', 'later', '◷']].map(function (d) { return '<button type="button" data-s="' + d[0] + '" aria-label="' + d[1] + '"><i aria-hidden="true">' + d[2] + '</i><span>' + d[1] + '</span></button>'; }).join('') + '</div>' +
      '<b class="jul mz-st">dial bank · hold one to bring it into the room</b><div class="mz-drawer mz-dials" role="group" aria-label="the dial bank">' + [['dl:beyond', 'Beyond'], ['dl:pad', 'palette pad'], ['dl:env', 'environment'], ['dl:tide', 'Light-tide']].map(function (d) { return '<button type="button" data-s="' + d[0] + '" aria-label="float ' + d[1] + ' into the room"><i class="mz-dl" aria-hidden="true"></i><span>' + d[1] + '</span></button>'; }).join('') + '</div>', 'add');
    if (a === 'mic') voice();
    if ((a === 'call' || a === 'ft') && c) { var lk = a === 'call' ? 'tel:' : 'facetime:'; openSheet('<b class="jul mz-st">' + (a === 'call' ? 'call' : 'FaceTime') + ' · ' + esc(c.name) + '</b><p class="mz-say">calls go through the phone’s own ' + (a === 'call' ? 'Phone' : 'FaceTime') + ' app · you place them there</p>' + (c.to ? '<a class="mz-handlink" href="' + lk + esc(c.to.replace(/\s/g, '')) + '">open ' + (a === 'call' ? 'Phone' : 'FaceTime') + ' with ' + esc(c.to) + '</a>' : '<p class="mz-say mz-stub">' + (c.example ? 'an example chat · no number · ' : '') + 'handoff · preview stub</p>'), 'call handoff'); }
    if (a === 'new') openSheet('<b class="jul mz-st">new chat</b><input class="mz-nn" type="text" maxlength="30" placeholder="a name" aria-label="a name"><input class="mz-np" type="tel" placeholder="their number, for iMessage (outside oz)" aria-label="their number, for iMessage">' + rows([['mkoz', 'start an oz chat'], ['mkout', 'start a chat outside oz (iMessage)']]), 'new chat');
    if (a === 'info' && c) info(c);
  });

  log.addEventListener('click', function (e) {
    var more = e.target.closest && e.target.closest('[data-a="more"]');
    if (more) {
      e.preventDefault(); e.stopPropagation();
      var id = more.closest('.mz-b') && +more.closest('.mz-b').dataset.m;
      var c = chat(cur), mm = msgOf(c, id);
      if (mm) { mm.openMore = true; if (mm.moreCards && !mm.cardsHtml) mm.cardsHtml = mm.moreCards; save(); paintChat(); }
      return;
    }
    var b = e.target.closest && e.target.closest('[data-oz]');
    if (!b || !GJ.ozChat) return;
    var k = b.getAttribute('data-oz'), c = chat(cur); if (!c) return;
    e.preventDefault(); e.stopPropagation();
    if (k === 'notquite' || k === 'creator') {
      c.msgs.push({ id: D.n++, me: false, fromOz: true, kind: 'text', body: GJ.ozChat.startCreatorAsk(), t: Date.now(), actsHtml: GJ.ozChat.actionsHtml('creatorask') });
      save(); paintChat();
    } else if (k === 'bug') {
      c.msgs.push({ id: D.n++, me: false, fromOz: true, kind: 'text', body: GJ.ozChat.startBug(), t: Date.now() });
      save(); paintChat();
    } else if (k === 'grant-debug' || k === 'grant-msg') {
      var pending = GJ.ozChat.pending && GJ.ozChat.pending();
      var summary = (pending && pending.bundle) ? 'debug bundle' : 'a message for Gill';
      GJ.ozChat.requestPass(k === 'grant-debug' ? 'debug' : 'message', summary, pending && pending.bundle);
      if (GJ.circle && GJ.circle.unlockCreator) GJ.circle.unlockCreator();
      var cr = ensureNamed('creator', { creator: true, kind: 'oz' });
      var sent = { id: D.n++, me: true, kind: 'text', body: k === 'grant-debug' ? 'Debug bundle for creator' : (pending && pending.summary) || 'A message for Gill', t: Date.now() };
      var r = GJ.ozChat.confirmSendToCreator(sent.body);
      sent.state = r && r.ok ? (r.label || "Sent to creator's inbox") : 'Waiting for a one-time pass';
      cr.msgs.push(sent);
      if (r && r.ok) cr.msgs.push({ id: D.n++, me: false, kind: 'text', body: r.text, t: Date.now() });
      save(); if (!on) open(); openChat(cr.id);
    } else if (k === 'cancel') {
      if (GJ.ozChat.setPending) GJ.ozChat.setPending(null);
    }
  });

  function info(c) {   // the contact info sheet: who, how it is carried (direct or mesh), and what's still open
    openSheet('<div class="mz-who"><i class="mz-av" aria-hidden="true">' + esc(c.name.replace(/^example · /, '').charAt(0).toUpperCase()) + '</i><b class="jul mz-st">' + esc(c.name) + '</b></div><p class="mz-say">' + (c.kind === 'oz' ? 'an oz chat · on this phone' : 'outside oz · what you send goes to the phone’s own Messages, and you tap Send') + '</p>' +
      (c.kind === 'oz' ? '<div class="mz-mode" role="group" aria-label="how it is carried"><button type="button" data-s="mode:direct" aria-pressed="' + !c.mesh + '">direct</button><button type="button" data-s="mode:mesh" aria-pressed="' + !!c.mesh + '">mesh</button></div><p class="mz-say">' + (c.mesh ? 'mesh · phone to phone, hop by hop · the hops travel along F3 · preview stub' : 'direct · preview stub') + '</p>' : '') +
      '<p class="mz-say mz-stub">preview stub · not sealed · verify: ' + esc(C ? C.verify({ contactId: c.id }) : 'preview stub') + '</p>' + (c.example ? '<p class="mz-say">example chat</p>' : '') +
      rows([['distill', 'find what’s still open (threads)'], c.kind === 'outside' ? ['handnow', 'send via iMessage'] : null]), 'about this chat'); sheet.dataset.c = c.id;
  }
  sheet.addEventListener('click', function (e) { var b = e.target.closest('button[data-s="handnow"]'); if (!b) return; e.stopPropagation(); var c = chat(cur); closeSheet(); if (c) handoff(c, inp.value.trim() || 'example · from oz'); }, true);
  sheet.addEventListener('pointerdown', function (e) { if (e.target === sheet) closeSheet(); });

  /* ---------- time: disappearing messages, scheduled sends, reminders ---------- */
  function expire(c) { var n = Date.now(), k = c.msgs.length; c.msgs = c.msgs.filter(function (m) { return !m.until || m.until > n; }); return k !== c.msgs.length; }
  function reminders() { save(); }
  setInterval(function () {
    var n = Date.now(), ch = false;
    D.chats.forEach(function (c) { if (expire(c)) ch = true; c.msgs.forEach(function (m) { if (m.remind && m.remind <= n && !m.reminded) { m.reminded = true; ch = true; say('reminder · ' + c.name + ' · ' + String(m.body || m.kind).slice(0, 40)); hap('commit'); } }); });
    if (ch) { save(); if (on) { if (cur) paintChat(); else paintList(); } }
  }, 15000);

  /* ---------- open / close, like every room's sheet ---------- */
  function open() { on = true; html.classList.add('messaging'); el.classList.add('on'); paintList(); if (GJ.sheet && GJ.sheet.attach) GJ.sheet.attach(el, close); hap('commit'); }
  function close() { if (cur) toList(); on = false; html.classList.remove('messaging'); el.classList.remove('on'); closeSheet(); }
  GJ.messages = { open: open, close: close, isOpen: function () { return on; }, chats: function () { return D.chats; }, openChat: openChat, prefs: function (o) { if (o) { Object.assign(D.prefs, o); save(); } return Object.assign({}, D.prefs); },
    reactions: Object.keys(REACT), star: star, distill: function (id) { distill(chat(id)); }, info: function () { var c = chat(cur); if (c) info(c); }, hold: function (id) { holdMsg(id); }, plus: function () { el.querySelector('[data-a="plus"]').click(); }, pull: function (px) { log.classList.toggle('pulling', px > 0); log.style.setProperty('--pull', px + 'px'); }, setMesh: function (v) { var c = chat(cur); if (c) { c.mesh = !!v; save(); paintChat(); } },
    // a draft for someone (Friends, Loved Ones): their chat, or a new one, opened with the words in the box · nothing is sent
    draft: function (name, text) { var c = D.chats.filter(function (x) { return x.name === name; })[0]; if (!c) { c = { id: D.n++, name: name, kind: 'oz', msgs: [] }; D.chats.unshift(c); } c.draft = text || c.draft || ''; save(); if (!on) open(); openChat(c.id); },
    openNamed: function (nm) { if (!on) open(); var c = D.chats.filter(function (x) { return x.name === nm; })[0]; if (c) { openChat(c.id); return c.id; } draft(nm, ''); },
    toThreads: toThreads, export: exportThread };
  GJ.messagesBuilder = GJ.messages;
  if (GJ.ozLayers && GJ.ozLayers.onBuilderReady) GJ.ozLayers.onBuilderReady();
})(window);
