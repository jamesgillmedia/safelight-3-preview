/* oz chat — the on-device assistant. Fully local: FAQ + Ask index, inline controls and tools.
   Escalation to creator (a message that must reach Gill, or a debug request) is the only off-device step,
   and only after a scoped one-time pass. In this prototype, that send is a stub. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {};
  var POET = 'oz-chat-poet', PASSLOG = 'oz-outbound-passes', ERRMAX = 20;
  var OZ = 'oz chat', CREATOR = 'creator', SYS =
    'oz chat is the on-device assistant. It answers here, from the FAQ and Ask, and can bring in controls and tools. Speaking with creator is the only step that leaves this phone.';
  var poetOn = false;
  try { poetOn = localStorage.getItem(POET) === '1'; } catch (e) {}
  var errors = [];
  G.addEventListener('error', function (e) {
    errors.push({ t: Date.now(), typ: 'error', msg: String((e && e.message) || 'error').slice(0, 160) });
    if (errors.length > ERRMAX) errors = errors.slice(-ERRMAX);
  });
  G.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason, m = r && r.message ? r.message : String(r || 'rejection');
    errors.push({ t: Date.now(), typ: 'reject', msg: String(m).slice(0, 160) });
    if (errors.length > ERRMAX) errors = errors.slice(-ERRMAX);
  });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function now() { return Date.now(); }
  function loadLog() {
    try { var a = JSON.parse(localStorage.getItem(PASSLOG) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function saveLog(a) { try { localStorage.setItem(PASSLOG, JSON.stringify(a.slice(-30))); } catch (e) {} }

  /* ---------- one-time outbound pass (stub) ---------- */
  var pass = null, passTick = 0;
  function passActive() { return !!(pass && !pass.revoked && !pass.used && pass.exp > now()); }
  function grantPass(kind, summary) {
    var ttl = 10 * 60 * 1000;
    pass = {
      id: 'p' + now().toString(36),
      dest: 'creator',
      kind: kind, /* 'message' | 'debug' */
      summary: String(summary || '').slice(0, 280),
      t: now(),
      exp: now() + ttl,
      used: false,
      revoked: false,
      stub: true
    };
    var log = loadLog();
    log.push({ id: pass.id, dest: 'creator', kind: pass.kind, t: pass.t, exp: pass.exp, state: 'granted' });
    saveLog(log);
    paintPass();
    paintPrivacy();
    return pass;
  }
  function revokePass() {
    if (!pass || pass.used) return;
    pass.revoked = true;
    var log = loadLog();
    log.forEach(function (x) { if (x.id === pass.id) x.state = 'revoked'; });
    saveLog(log);
    paintPass();
    paintPrivacy();
  }
  function consumePass() {
    if (!passActive()) return false;
    pass.used = true;
    var log = loadLog();
    log.forEach(function (x) { if (x.id === pass.id) x.state = 'used'; });
    saveLog(log);
    paintPass();
    paintPrivacy();
    return true;
  }
  function paintPrivacy() {
    var b = document.querySelector('#tune [data-t="privacypass"] b');
    var log = loadLog();
    if (b) b.textContent = log.length ? (log.length + (log.length === 1 ? ' pass' : ' passes')) : 'none';
    var n = document.getElementById('oz-pass-log');
    if (!n) return;
    if (!log.length) {
      n.textContent = 'No outbound passes have been granted. oz chat stays on this phone unless you grant a one-time pass to creator.';
      return;
    }
    n.innerHTML = log.slice().reverse().map(function (x) {
      var when = new Date(x.t).toLocaleString();
      return '<div>' + esc(when) + ' · ' + esc(x.kind) + ' · creator · ' + esc(x.state) + '</div>';
    }).join('');
  }
  function paintPass() {
    var host = document.querySelector('#msg-ours .mg-thread:not([hidden]) .im-comp') || document.querySelector('#msg-ours .im-comp') || document.querySelector('#msg .mz-comp') || document.querySelector('#ask .im-comp');
    var chip = document.getElementById('oz-pass-chip');
    if (!pass || pass.revoked || pass.used || pass.exp <= now()) {
      if (chip) chip.remove();
      if (passTick) { clearInterval(passTick); passTick = 0; }
      if (pass && pass.exp <= now() && !pass.used && !pass.revoked) {
        pass.revoked = true; /* expired */
        var log = loadLog();
        log.forEach(function (x) { if (x.id === pass.id && x.state === 'granted') x.state = 'expired'; });
        saveLog(log); paintPrivacy();
      }
      return;
    }
    if (!host) return;
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'oz-pass-chip';
      chip.className = 'oz-pass';
      host.parentNode.insertBefore(chip, host);
    }
    var left = Math.max(0, pass.exp - now());
    var frac = left / (10 * 60 * 1000);
    var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    var ang = Math.round(frac * 360);
    chip.innerHTML =
      '<span class="oz-pass-ring" style="--p:' + ang + 'deg" aria-hidden="true"></span>' +
      '<span class="oz-pass-txt">Pass to creator · ' + m + ':' + (s < 10 ? '0' : '') + s + '<i>one time · this ' + esc(pass.kind) + ' only</i></span>' +
      '<button type="button" data-a="revoke">Revoke</button>';
    if (!passTick) passTick = setInterval(paintPass, 1000);
  }
  function thinkOn() { try { return localStorage.getItem('oz-think') !== 'off'; } catch (e) { return true; } }
  function setThink(v) {
    try { localStorage.setItem('oz-think', v ? 'on' : 'off'); } catch (e) {}
    paintThink();
    return thinkOn();
  }
  function paintThink() {
    var b = document.querySelector('#tune [data-t="ozthink"] b');
    if (b) b.textContent = thinkOn() ? 'on' : 'off';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#oz-pass-chip [data-a="revoke"]');
    if (b) { revokePass(); }
    var t = e.target.closest && e.target.closest('#tune [data-t="privacypass"]');
    if (t) paintPrivacy();
    var th = e.target.closest && e.target.closest('#tune [data-t="ozthink"]');
    if (th) setThink(!thinkOn());
  });
  setTimeout(function () { paintPrivacy(); paintThink(); }, 900);

  /* ---------- debug bundle (no personal content) ---------- */
  function buildId() {
    var m = document.querySelector('meta[name="safelight-version"]');
    var v = (m && m.getAttribute('content')) || '';
    try { var x = document.querySelector('[data-build], #rev, .VERSION'); } catch (e) {}
    return v || 'oz preview';
  }
  function safeSettings() {
    var out = {}, s = GJ.store && GJ.store.get && GJ.store.get();
    if (s) {
      ['red', 'tone', 'tilt'].forEach(function (k) { if (k in s) out[k] = s[k]; });
    }
    if (GJ.tilt && GJ.tilt.pref) {
      out.tiltGlobal = GJ.tilt.pref.global();
      out.tiltSky = GJ.tilt.pref.room('sky');
      out.tiltCircle = GJ.tilt.pref.room('circle');
    }
    if (GJ.dock && GJ.dock.pins) out.dock = GJ.dock.pins();
    return out;
  }
  function debugBundle(desc) {
    var room = 'sky';
    try { room = (GJ.app && GJ.app.room) || 'sky'; } catch (e) {}
    var mode = 'night';
    try {
      var h = document.documentElement;
      if (h.classList.contains('im-light')) mode = 'light';
      else if (h.classList.contains('red')) mode = h.classList.contains('tone-rose') ? 'rose' : 'red';
    } catch (e) {}
    return {
      kind: 'debug',
      build: buildId(),
      room: room,
      mode: mode,
      settings: safeSettings(),
      errors: errors.slice(-10).map(function (x) { return { typ: x.typ, msg: x.msg, t: x.t }; }),
      description: String(desc || '').slice(0, 500),
      note: 'No personal message history, contacts, or keys are included.'
    };
  }

  /* ---------- thread helpers (rely on GJ.messages) ---------- */
  function M() { return GJ.messages; }
  function setPoet(v) {
    poetOn = !!v;
    try { localStorage.setItem(POET, poetOn ? '1' : '0'); } catch (e) {}
    return poetOn;
  }

  function afterLocalReply(payload, userText) {
    var msg = payload || {};
    var hits = msg.listOnly ? [] : (msg.hits || []);
    var cards = (!msg.listOnly && GJ.ozInline && GJ.ozInline.cardsFor) ? GJ.ozInline.cardsFor(hits) : [];
    var short = msg.short || msg.text;
    var full = msg.full || msg.text;
    return {
      text: short,
      short: short,
      full: full,
      fromOz: true,
      poet: !!msg.poet,
      draft: !!msg.draft,
      matched: !!msg.matched,
      hits: hits,
      cards: cards,
      listOnly: !!msg.listOnly,
      askCreator: !msg.matched && !msg.listOnly
    };
  }

  function offerLines(kind) {
    if (kind === 'nomatch') {
      return 'I can look again if you say it another way. If something is broken, you can report a bug. If a message needs to reach Gill, you can speak with creator.';
    }
    return 'Was that what you needed? If not, you can say it another way, report a bug, or send a message that needs to reach Gill.';
  }

  /* The messages module calls these once it is ready. */
  var pendingReview = null; /* { kind, text, bundle } */

  function onOzSend(text) {
    text = String(text || '').trim();
    var low = text.toLowerCase();
    if (/report a bug|debug request|something is broken|report bug/.test(low)) {
      return { kind: 'bugform', text: 'Tell me what went wrong, in a line or two. I will make a small debug bundle for you to review. It will not include your chats, contacts, or keys.' };
    }
    if (pendingReview && pendingReview.kind === 'bugdesc') {
      var bundle = debugBundle(text);
      pendingReview = { kind: 'bugreview', bundle: bundle };
      return { kind: 'bugreview', text: 'Here is the debug bundle. Check it. Nothing personal is in it. If it looks right, grant a one-time pass to send it to creator.', bundle: bundle };
    }
    if (!GJ.circle || !GJ.circle.replyFaq) {
      return { kind: 'reply', payload: { text: 'The assistant is still waking up. Try that again in a moment.', fromOz: true, matched: false } };
    }
    return GJ.circle.replyFaq(text, poetOn).then(function (payload) {
      var boxed = afterLocalReply(payload, text);
      var offer = boxed.listOnly ? '' : offerLines(boxed.matched ? 'ok' : 'nomatch');
      return { kind: 'reply', payload: boxed, offer: offer };
    });
  }

  function requestPass(kind, summary, bundle) {
    pendingReview = { kind: kind, summary: summary, bundle: bundle || null };
    grantPass(kind, summary);
    return {
      text: 'A one-time pass to creator is ready. Destination is creator only. It holds just what you have already seen. It ends in 10 minutes, or when this is sent. You can revoke it.',
      fromOz: true
    };
  }

  function confirmSendToCreator(text) {
    if (!passActive()) return { ok: false, text: 'There is no pass right now. Grant a one-time pass first. Nothing has left this phone.' };
    consumePass();
    /* Prototype stub: do not post to the relay. */
    return { ok: true, stub: true, label: "Sent to creator's inbox", text: "Sent to creator's inbox. In this preview it does not leave the phone." };
  }

  function paintBundle(bundle) {
    if (!bundle) return '';
    var s = JSON.stringify(bundle, null, 2);
    return '<pre class="oz-bundle">' + esc(s) + '</pre>';
  }

  function actionsHtml(kind) {
    if (kind === 'offer') {
      return '<div class="oz-acts">' +
        '<button type="button" class="oz-chip" data-oz="notquite">not quite</button>' +
        '<button type="button" class="oz-chip" data-oz="bug">report a bug</button>' +
        '<button type="button" class="oz-chip" data-oz="creator">message for Gill</button>' +
        '</div>';
    }
    if (kind === 'bugreview') {
      return '<div class="oz-acts">' +
        '<button type="button" class="oz-chip suggest" data-oz="grant-debug">Grant pass and send</button>' +
        '<button type="button" class="oz-chip" data-oz="cancel">Cancel</button>' +
        '</div>';
    }
    if (kind === 'creatorask') {
      return '<div class="oz-acts">' +
        '<button type="button" class="oz-chip suggest" data-oz="grant-msg">Yes, grant a pass</button>' +
        '<button type="button" class="oz-chip" data-oz="cancel">No</button>' +
        '</div>';
    }
    return '';
  }

  GJ.ozChat = {
    name: OZ,
    subtitle: 'on-device assistant',
    sys: SYS,
    creatorName: CREATOR,
    poet: function (v) { if (v != null) return setPoet(v); return poetOn; },
    onOzSend: onOzSend,
    afterLocalReply: afterLocalReply,
    requestPass: requestPass,
    confirmSendToCreator: confirmSendToCreator,
    grantPass: grantPass,
    revokePass: revokePass,
    passActive: passActive,
    debugBundle: debugBundle,
    paintBundle: paintBundle,
    actionsHtml: actionsHtml,
    paintPass: paintPass,
    startBug: function () { pendingReview = { kind: 'bugdesc' }; return 'Tell me what went wrong, in a line or two. I will make a small debug bundle for you to review. It will not include your chats, contacts, or keys.'; },
    startCreatorAsk: function () { return 'Want to speak directly with creator? This is only for a message that needs to reach Gill, or a debug request. It needs a one-time pass, and in this preview the send stays a stub.'; },
    pending: function () { return pendingReview; },
    setPending: function (v) { pendingReview = v; },
    bindInline: function (root) { if (GJ.ozInline && GJ.ozInline.bind) GJ.ozInline.bind(root); }
  };
})(window);
