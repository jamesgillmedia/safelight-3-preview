/* oz layers · our Ask/oz chat, Circle, truemoji, Threads and Messages-skin toggle,
   laid onto the builder r4 chrome. Default Messages skin is builder (Gill: lock their look, with a toggle to ours); ours one tap away in Tune. */
(function (G) {
  'use strict';
  if (G.__ozLayers) return;
  G.__ozLayers = true;
  var GJ = G.GJ = G.GJ || {};
  var html = document.documentElement;
  var SKIN_KEY = 'oz-msgskin';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function skin() { try { return localStorage.getItem(SKIN_KEY) || 'builder'; } catch (e) { return 'builder'; } }   // builder look is the default; ours one tap away in Tune (overlap call, 20 Nov)
  function setSkin(v) {
    v = v === 'ours' ? 'ours' : 'builder';
    try { localStorage.setItem(SKIN_KEY, v); } catch (e) {}
    applySkin();
    paintTune();
    return v;
  }
  function paintTune() {
    var b = document.querySelector('#tune [data-t="msgskin"] b');
    if (b) b.textContent = skin();
    var th = document.querySelector('#tune [data-t="ozthink"] b');
    if (th) {
      var on = true;
      try { on = localStorage.getItem('oz-think') !== 'off'; } catch (e) {}
      th.textContent = on ? 'on' : 'off';
    }
  }

  /* ---------- truemoji (standard pack first: hands, high five Mini, hang loose; no red versions) ---------- */
  var TE_STD = [
    { id: 'hands', token: ':hands:', src: 'icons/truemoji/hands-3d.png', label: 'hands together' },
    { id: 'highfivemini', token: ':highfivemini:', src: 'icons/truemoji/highfive-std.png', label: 'high five mini' },
    { id: 'shaka', token: ':shaka:', src: 'icons/truemoji/shaka-3d.png', label: 'hang loose' },
    /* bubble round: new in the standard pack, in the same 3D style */
    { id: 'goodnight', token: ':goodnight:', src: 'icons/truemoji/goodnight-3d.png', label: 'goodnight moon' },
    { id: 'callme', token: ':callme:', src: 'icons/truemoji/callme-3d.png', label: 'call-me phone' },
    { id: 'goldenhour', token: ':goldenhour:', src: 'icons/truemoji/goldenhour-3d.png', label: 'golden hour sun' },
    { id: 'dnd', token: ':dnd:', src: 'icons/truemoji/dnd-3d.png', label: 'do not disturb' },
    { id: 'hearthands', token: ':hearthands:', src: 'icons/truemoji/hearthands-3d.png', label: 'heart hands' },
    { id: 'clapper', token: ':clapper:', src: 'icons/truemoji/clapper-3d.png', label: 'rolling clapperboard' },
    { id: 'paw', token: ':paw:', src: 'icons/truemoji/paw-3d.png', label: 'walk paw' }
  ];
  G.OZ_TE_STD = TE_STD;   // the standard pack, shared (builder bubbles draw these tokens as the 3D image)
  function teBtn(t) {
    return '<button type="button" class="mz-te" data-te="' + t.token + '" aria-label="' + esc(t.label) + '"><img src="' + t.src + '" alt=""></button>';
  }
  function insertText(token) {
    var area = document.querySelector('#msg .mz-in:not([hidden]), #msg-ours textarea, #msg-ours .im-in, #ask textarea, #ask .im-in');
    if (area && 'value' in area) {
      var s = area.selectionStart, e = area.selectionEnd, v = area.value || '';
      area.value = v.slice(0, s) + token + v.slice(e);
      try { area.selectionStart = area.selectionEnd = s + token.length; } catch (err) {}
      area.dispatchEvent(new Event('input', { bubbles: true }));
      area.focus();
    }
  }
  function decorateEmojiSheet(root) {
    if (!root || root.querySelector('.mz-tebar')) return;
    var bar = document.createElement('div');
    bar.className = 'mz-tebar';
    bar.setAttribute('aria-label', 'truemoji · standard pack');
    bar.innerHTML = '<b class="jul">truemoji</b><div class="mz-teg">' + TE_STD.map(teBtn).join('') + '</div>';
    var body = root.querySelector('.mz-ebody, .mz-sheet, .im-emo') || root;
    body.insertBefore(bar, body.firstChild);
  }

  /* ---------- seed oz chat + Artist Agent on the builder list ---------- */
  function seedBuilderChats() {
    var api = GJ.messagesBuilder || GJ.messages;
    if (!api || !api.chats) return;
    var chats = api.chats();
    function has(name) { return chats.some(function (c) { return c.name === name; }); }
    function add(name, kind, opening) {
      if (has(name)) return;
      var id = Date.now() % 1e9 + chats.length;
      chats.unshift({
        id: id, name: name, kind: kind || 'oz', msgs: opening ? [{ id: id + 1, me: false, kind: 'text', body: opening, t: Date.now() - 1000, fromOz: true }] : [],
        agent: name === 'Artist Agent', oz: name === 'oz chat'
      });
    }
    add('oz chat', 'oz', 'oz chat is the on-device assistant. Ask me anything about oz. If I can’t help, I can offer to speak with creator.');
    add('Artist Agent', 'oz', 'Artist Agent is here. This is a preview stub — nothing is sent off this phone unless you grant a one-time pass.');
    if (api.paintList && api.isOpen && api.isOpen()) api.paintList();
  }

  /* ---------- avatars (A) on builder chrome ---------- */
  function markAvatars(root) {
    if (!root) return;
    [].forEach.call(root.querySelectorAll('.mz-av'), function (av) {
      var row = av.closest('[data-c], .mz-ch, .mz-name, .mz-row');
      var name = '';
      if (row && row.querySelector('b, .mz-nm')) name = (row.querySelector('b, .mz-nm').textContent || '').trim();
      if (!name && av.nextElementSibling) name = (av.nextElementSibling.textContent || '').trim();
      if (/artist agent/i.test(name) && !av.querySelector('img')) {
        av.textContent = '';
        var img = document.createElement('img');
        img.src = 'icons/artist-agent-a.png';
        img.alt = '';
        av.appendChild(img);
        av.classList.add('mz-av-img');
      }
    });
  }

  /* ---------- header actions: Threads + Circle, on builder chrome ---------- */
  function decorateBuilderHeader() {
    var el = document.getElementById('msg');
    if (!el || el.dataset.layers === '1') return;
    el.dataset.layers = '1';
    var listH = el.querySelector('.mz-list .mz-h');
    if (listH && !el.querySelector('.mz-layer-actions')) {
      var row = document.createElement('div');
      row.className = 'mz-layer-actions';
      row.innerHTML = '<button type="button" class="mz-btn" data-a="circle" aria-label="circle">circle</button>' +
                      '<button type="button" class="mz-btn" data-a="threads" aria-label="threads">threads</button>';
      listH.insertAdjacentElement('afterend', row);
    }
    var chatH = el.querySelector('.mz-chat .mz-h');
    if (chatH && !chatH.querySelector('[data-a="threads"]')) {
      var th = document.createElement('button');
      th.type = 'button'; th.className = 'mz-ic'; th.setAttribute('data-a', 'threads'); th.setAttribute('aria-label', 'open threads for this chat');
      th.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 7h12M6 12h9M6 17h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      var call = chatH.querySelector('[data-a="call"]');
      chatH.insertBefore(th, call || null);
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-a="circle"], [data-a="threads"], .mz-te');
      if (!b) return;
      if (b.classList.contains('mz-te') || b.getAttribute('data-te')) {
        e.preventDefault(); e.stopPropagation();
        insertText(b.getAttribute('data-te'));
        return;
      }
      var a = b.getAttribute('data-a');
      if (a === 'circle') {
        e.preventDefault(); e.stopPropagation();
        if (GJ.circle) GJ.circle.open();
        return;
      }
      if (a === 'threads') {
        e.preventDefault(); e.stopPropagation();
        if (GJ.messages && GJ.messages.toThreads && el.querySelector('.mz-chat') && !el.querySelector('.mz-chat').hidden) {
          GJ.messages.toThreads();
          return;
        }
        var nm = (el.querySelector('.mz-nm') || {}).textContent || '';
        var chatOpen = el.querySelector('.mz-chat') && !el.querySelector('.mz-chat').hidden;
        GJ._chatBack = { room: 'messages', name: chatOpen ? nm : '' };
        if (GJ.threads) {
          if (chatOpen && nm) {
            var chats = (GJ.messages && GJ.messages.chats && GJ.messages.chats()) || [];
            var c0 = chats.filter(function (x) { return x.name === nm; })[0];
            var text = c0 ? (c0.msgs || []).map(function (m) { return (m.me ? 'me' : nm) + ': ' + (m.body || m.text || m.kind || ''); }).join('\n') : '';
            if (GJ.threads.take) GJ.threads.take({ title: nm, from: 'messages', text: text });
            GJ.threads.open();
          } else GJ.threads.open();
        }
      }
    }, true);
    var obs = new MutationObserver(function () {
      decorateEmojiSheet(el.querySelector('.mz-sheet:not([hidden]), .mz-ebody') && el.querySelector('.mz-sheet'));
      markAvatars(el);
    });
    obs.observe(el, { childList: true, subtree: true });
    markAvatars(el);
  }


  function closeBoth() {
    try { if (GJ.messagesBuilder && GJ.messagesBuilder.isOpen && GJ.messagesBuilder.isOpen()) GJ.messagesBuilder.close(); } catch (e) {}
    try { if (GJ.messagesOurs && GJ.messagesOurs.isOpen && GJ.messagesOurs.isOpen()) GJ.messagesOurs.close(); } catch (e) {}
  }
  function applySkin() {
    var s = skin();
    html.dataset.msgskin = s;
    if (!GJ.messagesBuilder && !GJ.messagesOurs) return;
    var wasOpen = false;
    try {
      wasOpen = (GJ.messagesBuilder && GJ.messagesBuilder.isOpen && GJ.messagesBuilder.isOpen())
        || (GJ.messagesOurs && GJ.messagesOurs.isOpen && GJ.messagesOurs.isOpen())
        || (GJ.messages && GJ.messages.isOpen && GJ.messages.isOpen());
    } catch (e) {}
    closeBoth();
    if (s === 'ours' && GJ.messagesOurs) GJ.messages = GJ.messagesOurs;
    else if (GJ.messagesBuilder) GJ.messages = GJ.messagesBuilder;
    if (wasOpen && GJ.messages && GJ.messages.open) GJ.messages.open();
  }

  /* seat the composer above the iPhone keyboard so the send button stays tappable */
  function seatComposer() {
    var vv = G.visualViewport, kb = 0;
    if (vv) kb = Math.max(0, Math.round((G.innerHeight || html.clientHeight) - vv.height - (vv.offsetTop || 0)));
    html.style.setProperty('--kb', kb + 'px');
    ['#msg', '#msg-ours', '#ask'].forEach(function (sel) {
      var n = document.querySelector(sel);
      if (n) n.style.setProperty('--kb', kb + 'px');
    });
  }
  function watchKeyboard() {
    if (watchKeyboard.ok) return;
    watchKeyboard.ok = true;
    seatComposer();
    if (G.visualViewport) {
      G.visualViewport.addEventListener('resize', seatComposer);
      G.visualViewport.addEventListener('scroll', seatComposer);
    }
    G.addEventListener('resize', seatComposer);
    G.addEventListener('focusin', seatComposer);
    G.addEventListener('focusout', function () { setTimeout(seatComposer, 80); });
  }

  function onBuilderReady() {
    seedBuilderChats();
    decorateBuilderHeader();
    applySkin();
    paintTune();
    watchKeyboard();
  }

  /* ---------- Circle + Threads on the app map (same graph as the sky / navmap / Ask index) ---------- */
  function placed(id) { return (GJ.ozMore || []).some(function (m) { return m.id === id; }); }
  function placeLayers() {
    if (!GJ.ozone || !GJ.ozone.place) return;
    if (!placed('circle')) {
      GJ.ozone.place({ id: 'circle', name: 'circle', sub: 'you are here · your people', cl: 'people', open: function () { if (GJ.circle) GJ.circle.open(); } });
    }
    if (!placed('threads')) {
      GJ.ozone.place({ id: 'threads', name: 'threads', sub: 'what’s still open in a conversation', cl: 'share', open: function () {
        if (GJ.threads && GJ.threads.open) GJ.threads.open();
      } });
    }
  }
  function placeCircle() { placeLayers(); }

  document.addEventListener('click', function (e) {
    var row = e.target.closest && e.target.closest('#tune [data-t="msgskin"]');
    if (row) {
      e.preventDefault();
      setSkin(skin() === 'builder' ? 'ours' : 'builder');
    }
  }, true);

  function boot() {
    paintTune();
    placeCircle();
    applySkin();
    watchKeyboard();
    if (GJ.messagesBuilder) onBuilderReady();
  }

  GJ.ozLayers = { onBuilderReady: onBuilderReady, applySkin: applySkin, setSkin: setSkin, skin: skin, paintTune: paintTune, seatComposer: seatComposer };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
  setTimeout(boot, 800);
  setTimeout(placeCircle, 1600);
})(window);
