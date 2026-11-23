/* push radio (Push Radio brief, 23 Nov 2026) · oz's walkie-talkie, a room on the oz layer. Hold to talk, release to
   listen, on the same pad as Tone Check. Local first: the people in your Circle are listed with whether they are in reach
   and on which path. F3 stays dark while everything stays local, and lights only when something leaves (Test with me).
     the channel ...... one-time Always connected sheet (what each permission is for, and the battery, honestly), then an
                        explicit tap joins. Never asks twice. Quiet or leave at any time.
     push through ..... a per-person allow in Circle, off by default, Circle contacts only. An allowed contact's live voice
                        plays hands-free when the channel is joined and Quiet is off. Anyone else: a request to talk, or a
                        held clip in the sealed thread. Nothing held ever plays by itself.
     quiet ............ the squelch: mutes live push-through at once, without leaving the channel or clearing allows.
                        Requests and clips still arrive, silently.
     test with me ..... opt-in, off by default: your Artist Agent as a remote peer over an internet relay. F3 is lit the
                        whole time it is on. Same pad, thread, push through, request and Quiet rules.
   What is real in this web preview: the pad records your voice on this phone (only while you hold), the thread keeps it
   here, and every rule above. What is a labelled stub: radios, discovery, live voice between phones, PushToTalk, the
   relay, the seal (oz.private: pushRadioRoute, pushToTalk, messageCrypto). Nothing is sent.
     GJ.pushRadio.open() · close() · isOpen() · decide({ from, allowed, quiet, joined, circle }) · state() */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, P = G.oz && G.oz.private;
  var K = { seen: 'gj-pr-seen', quiet: 'gj-pr-quiet', allow: 'gj-pr-allow', thread: 'gj-pr-thread', test: 'gj-pr-test', to: 'gj-pr-to' };
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 2000); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sget(k, d) { try { var v = GJ.settings.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function sput(k, v) { try { GJ.settings.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function route() { return P && P.get ? P.get('pushRadioRoute') : null; }
  function ptt() { return P && P.get ? P.get('pushToTalk') : null; }
  function crypt() { return P && P.get ? P.get('messageCrypto') : null; }
  function mmss(ms) { var s = Math.max(1, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function when(t) { var d = new Date(t), n = new Date(); return d.toDateString() === n.toDateString() ? d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase() : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }

  /* ——— the one rule (brief: "play live only when the speaker is an allowed Circle contact and Quiet is off") ——— */
  function decide(o) {
    if (!o || !o.circle) return o && o.wantsLive ? 'request' : 'clip';   // not in your Circle: never live
    if (o.joined && o.allowed && !o.quiet && o.live) return 'live';
    return o.request ? 'request' : 'clip';
  }

  /* ——— state, kept on this phone ——— */
  var S = { on: false, joined: false, quiet: !!sget(K.quiet, false), allow: sget(K.allow, {}), test: false, to: 'channel', talking: null, now: null, sheet: null };
  var thread = sget(K.thread, []);   // [{ id, t, who, dir:'out'|'in', kind:'clip'|'request'|'live', ms, to, note, audio:key, heard }]
  function saveThread() { sput(K.thread, thread.slice(0, 120)); }
  var EXAMPLES = [{ id: 'prx1', name: 'Mara', example: true, path: 'local' }, { id: 'prx2', name: 'Theo', example: true, path: null }, { id: 'prx3', name: 'June', example: true, path: 'local' }];
  var PATH = { local: 'nearby phone · tier 1', lora: 'LoRa radio · tier 2', ham: 'ham radio · tier 3', relay: 'internet relay · F3 lit', internet: 'internet · F3 lit' };
  function circle() { return GJ.circle && GJ.circle.people ? GJ.circle.people() : []; }
  function people() {   // your Circle (people, then the Artist Agent while Test with me is on); marked examples only while you have added no one
    var C = circle(), mine = C.filter(function (p) { return p && p.name && !p.kind && !p.hidden; }), R = route(), reach = {};
    try { (R ? R.reach() : []).forEach(function (r) { reach[r.id] = r; }); } catch (e) {}
    var L = mine.map(function (p) { var r = reach[p.id] || {}; return { id: p.id, name: p.name, circle: true, path: S.joined && r.inReach ? r.path : null }; });
    if (!L.length) L = EXAMPLES.map(function (x) { return { id: x.id, name: x.name, example: true, circle: true, path: S.joined ? x.path : null }; });
    var ag = C.filter(function (p) { return p && p.kind === 'agent'; })[0];
    if (S.test) L.unshift({ id: 'agent', name: (ag && ag.name) || 'Artist Agent', agent: true, circle: true, path: 'relay' });   // the Agent is always in Circle (Circle seeds it); listed here only while Test with me is on
    return L;
  }
  function find(id) { return people().filter(function (p) { return p.id === id; })[0]; }
  function allowed(id) { return !!S.allow[id]; }

  /* ——— the room ——— */
  var el = document.createElement('section'); el.id = 'pushradio'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'push radio'); el.hidden = true;
  el.innerHTML =
    '<div class="pr-scroll">' +
      '<p class="pr-pre">preview · this page has no radio. the pad records you on this phone; nothing is sent</p>' +
      '<div class="pr-chan" role="group" aria-label="channel"><div class="pr-chan-t"><b class="jul">channel</b><span class="pr-chan-s" aria-live="polite"></span></div><button type="button" class="pr-join" data-a="join"></button></div>' +
      '<button type="button" class="pr-quiet" data-a="quiet" role="switch" aria-checked="false"><b>quiet</b><span class="pr-quiet-s"></span><i class="pr-sw" aria-hidden="true"></i></button>' +
      '<div class="pr-now" aria-live="assertive" hidden></div>' +
      '<div class="pr-padwrap"><svg class="pr-ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="pr-ring-b" cx="60" cy="60" r="56"/><circle class="pr-ring-l" cx="60" cy="60" r="56"/></svg>' +
        '<button type="button" class="pr-pad" aria-label="hold to talk" aria-description="hold to talk, release to listen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.4a2.6 2.6 0 0 1 2.6 2.6v4.6a2.6 2.6 0 0 1-5.2 0V7A2.6 2.6 0 0 1 12 4.4zM7 11.4a5 5 0 0 0 10 0M12 16.4v3.2"/></svg></button>' +
        '<span class="pr-pad-note" aria-live="polite">hold to talk</span></div>' +
      '<div class="pr-to" role="radiogroup" aria-label="talk to"></div>' +
      '<h3 class="jul">circle · who is in reach</h3><div class="pr-list"></div>' +
      '<h3 class="jul">thread · sealed, on this phone</h3><div class="pr-thread" aria-live="polite"></div>' +
      '<h3 class="jul">test with me</h3>' +
      '<button type="button" class="pr-test" data-a="test" role="switch" aria-checked="false"><span><b>test with me</b><em>talk with your Artist Agent as a remote peer, over an internet relay. F3 stays lit the whole time. Off by default.</em></span><i class="pr-sw" aria-hidden="true"></i></button>' +
      '<h3 class="jul">paths · local first</h3><div class="pr-tiers"></div>' +
      '<button type="button" class="pr-wide pr-soft" data-a="why">what push radio asks for, and why</button>' +
    '</div><div class="pr-sheet" hidden></div>';
  document.body.appendChild(el);
  function $(s) { return el.querySelector(s); }
  var sheet = $('.pr-sheet'), pad = $('.pr-pad'), note = $('.pr-pad-note'), ringL = $('.pr-ring-l'), CIRC = 2 * Math.PI * 56;
  ringL.style.strokeDasharray = CIRC; ringL.style.strokeDashoffset = CIRC;

  function paintChan() {
    $('.pr-chan-s').textContent = S.joined ? (S.quiet ? 'joined · quiet · live voices wait' : 'joined · listening') : 'not joined · nothing can reach you live';
    var j = $('.pr-join'); j.textContent = S.joined ? 'leave' : 'join'; j.dataset.a = S.joined ? 'leave' : 'join'; j.classList.toggle('on', !S.joined);
    var q = $('.pr-quiet'); q.setAttribute('aria-checked', String(S.quiet)); q.classList.toggle('on', S.quiet);
    $('.pr-quiet-s').textContent = S.quiet ? 'on · live push-through is muted. requests and clips arrive silently' : 'off · allowed people play live';
    el.classList.toggle('pr-joined', S.joined); el.classList.toggle('pr-isquiet', S.quiet);
    var t = $('.pr-test'); t.setAttribute('aria-checked', String(S.test)); t.classList.toggle('on', S.test);
  }
  function paintTo() {
    var L = people(), ok = S.to === 'channel' || L.some(function (p) { return p.id === S.to; }); if (!ok) S.to = 'channel';
    $('.pr-to').innerHTML = '<button type="button" role="radio" data-to="channel" aria-checked="' + (S.to === 'channel') + '">everyone in reach</button>' +
      L.map(function (p) { return '<button type="button" role="radio" data-to="' + esc(p.id) + '" aria-checked="' + (S.to === p.id) + '">' + esc(p.name) + '</button>'; }).join('');
  }
  function paintList() {
    var L = people(), h = '';
    h = L.map(function (p) {
      var a = allowed(p.id), where = p.path ? 'in reach · ' + PATH[p.path] : S.joined ? 'not in reach' : 'join to see who is in reach';
      return '<div class="pr-row' + (p.path ? ' pr-in' : '') + '" data-id="' + esc(p.id) + '"><i class="pr-dotr" aria-hidden="true"></i><span class="pr-who"><b>' + esc(p.name) + '</b><em>' + (p.example ? 'example · ' : '') + esc(where) + '</em></span>' +
        '<button type="button" class="pr-ask" data-ask="' + esc(p.id) + '" aria-label="ask ' + esc(p.name) + ' to talk">ask</button>' +
        '<button type="button" class="pr-allow' + (a ? ' on' : '') + '" data-allow="' + esc(p.id) + '" role="switch" aria-checked="' + a + '" aria-label="push through for ' + esc(p.name) + '"><span>push through</span><i class="pr-sw" aria-hidden="true"></i></button></div>';
    }).join('');
    if (L[0] && L[L.length - 1].example) h += '<p class="pr-ex">these are example people · add someone to Circle and they go away</p>';
    h += '<p class="pr-ex">push through is off for everyone until you turn it on. only Circle people can have it.</p>';
    $('.pr-list').innerHTML = h;
  }
  function seal(o) { var c = crypt(); try { return c ? c.seal({ payload: o }) : { payload: o }; } catch (e) { return { payload: o }; } }
  function paintThread() {
    var c = crypt(), v = 'preview stub'; try { v = c ? c.verify() : v; } catch (e) {}
    $('.pr-thread').innerHTML = thread.length ? thread.slice(0, 40).map(function (m) {
      var head = m.dir === 'out' ? 'you → ' + esc(m.toName || 'everyone in reach') : esc(m.who) + ' → you';
      var kind = m.kind === 'request' ? 'asked to talk' : m.kind === 'live' ? 'live · heard' : 'clip ' + mmss(m.ms || 0);
      var play = m.audio ? '<button type="button" class="pr-play" data-play="' + esc(m.id) + '" aria-label="play ' + esc(kind) + '">' + (m.heard && m.dir === 'in' ? 'play again' : 'play') + '</button>' : '';
      return '<div class="pr-m' + (m.dir === 'in' && !m.heard && m.kind !== 'live' ? ' pr-new' : '') + '"><span><b>' + head + '</b><em>' + esc(kind) + ' · ' + when(m.t) + (m.note ? ' · ' + esc(m.note) : '') + '</em></span>' + play + '</div>';
    }).join('') + '<p class="pr-ex">seal: ' + esc(v) + ' · the thread is the same whichever path it travels. held clips never play by themselves.</p>' +
      '<button type="button" class="pr-wide pr-soft" data-a="clear">clear the thread</button>'
      : '<p class="pr-ex">nothing yet · what you say, requests and held clips land here, on this phone. nothing here plays by itself.</p>';
  }
  function paintTiers() {
    var R = route(), T = []; try { T = R ? R.tiers() : []; } catch (e) {}
    var name = { 1: 'phone to phone · ~100 m · F3 dark', 2: 'LoRa radio · Meshtastic-style, over Bluetooth · 915 MHz', 3: 'ham radio · licensed (ISED Basic)' };
    $('.pr-tiers').innerHTML = T.map(function (t) { return '<div class="pr-tier"><b>tier ' + t.tier + '</b><span>' + esc(name[t.tier] || t.path) + '</span><em>' + esc(t.state) + '</em></div>'; }).join('') +
      '<p class="pr-ex">one protocol, local first. the internet is used only if you allow it, and then F3 lights. internet: <b class="pr-inet">' + (R && R.allowInternet() ? 'allowed' : 'not allowed') + '</b></p>';
  }
  function paint() { paintChan(); paintTo(); paintList(); paintThread(); paintTiers(); }

  /* ——— Always connected: one calm sheet, once. Then an explicit tap joins. Never asks again ——— */
  function why(first) {
    S.sheet = 'why';
    sheet.innerHTML = '<h3 class="jul">always connected</h3><p class="pr-sub">push radio stays reachable, the way a walkie does. here is everything it asks for, and why.</p>' +
      '<div class="pr-perm"><b>microphone</b><span>to talk. only while you hold the pad.</span></div>' +
      '<div class="pr-perm"><b>local network</b><span>to find oz phones near you and talk without the internet.</span></div>' +
      '<div class="pr-perm"><b>bluetooth</b><span>nearby phones now, and a LoRa radio later.</span></div>' +
      '<div class="pr-perm"><b>notifications · push to talk</b><span>so people you allow can reach you when oz is in the background or the phone is locked.</span></div>' +
      '<div class="pr-perm"><b>battery</b><span>staying joined costs some battery, more while you talk or listen. quiet and leave are always one tap away.</span></div>' +
      '<p class="pr-sub">in this preview only the microphone is real. the iPhone app asks for the rest, once each.</p>' +
      (S.joined ? '' : '<button type="button" class="pr-wide pr-go" data-s="join">join the channel</button>') +
      '<button type="button" class="pr-wide pr-soft" data-s="x">' + (first && !S.joined ? 'not now' : 'close') + '</button>';
    sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); var b = sheet.querySelector('button'); if (b) b.focus();
    sput(K.seen, true);
  }
  function closeSheet() { S.sheet = null; sheet.classList.remove('in'); setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260); }
  function join() {
    if (!sget(K.seen, false)) { why(true); return; }
    var R = route(), T = ptt(); S.joined = true;
    Promise.all([R ? R.join() : 0, T ? T.join({ name: 'oz' }) : 0]).then(function () { paint(); });
    hap('commit'); say('joined · ' + (S.quiet ? 'quiet is on' : 'allowed people play live')); paint();
  }
  function leave() { var R = route(), T = ptt(); S.joined = false; if (R) R.leave(); if (T) T.leave(); hap('tick'); say('left the channel'); paint(); }
  function setQuiet(v) { S.quiet = !!v; sput(K.quiet, S.quiet); if (S.quiet) stopLive(); hap('tick'); paintChan(); }

  /* ——— Test with me: opt-in, F3 lit for as long as it is on ——— */
  var f3rel = null;
  function setTest(v) {
    v = !!v; if (v === S.test) return;
    if (v && GJ.f3 && GJ.f3.block && GJ.f3.block()) { say('network is blocked in F3 · test with me needs the relay'); return; }
    S.test = v; var R = route(); if (R) { R.relay(v); R.allowInternet(v); }
    if (v) { f3rel = GJ.f3 && GJ.f3.hold ? GJ.f3.hold('push radio · test with me · relay to your Artist Agent (preview stub: no relay exists, nothing is sent)', 'internet relay') : null; say('test with me is on · F3 stays lit'); }
    else { if (f3rel) f3rel('test with me off'); f3rel = null; if (S.to === 'agent') S.to = 'channel'; say('test with me is off · F3 goes dark'); }
    hap('tick'); paint();
  }

  /* ——— the pad: hold to talk, release to listen. The mic is open only while you hold ——— */
  var rec = null, chunks = [], stream = null, ac = null, an = null, raf = 0, t0 = 0, talk = null, downAt = 0, primed = false;
  function level() {
    if (!an) return; var a = new Uint8Array(an.fftSize); an.getByteTimeDomainData(a); var m = 0; for (var i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - 128));
    ringL.style.strokeDashoffset = CIRC * (1 - Math.min(1, .08 + m / 64)); note.textContent = 'talking ' + mmss(Date.now() - t0) + ' · release to listen'; raf = requestAnimationFrame(level);
  }
  function down(e) {
    if (e) e.preventDefault(); if (S.talking) return;
    if (!S.joined) { hap('tick'); if (!sget(K.seen, false)) why(true); else say('join the channel to talk'); return; }
    stopLive(); downAt = Date.now(); S.talking = 'opening'; pad.classList.add('pr-rec'); note.textContent = 'opening the mic…'; hap('commit');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !G.MediaRecorder) { S.talking = null; pad.classList.remove('pr-rec'); note.textContent = 'this browser has no microphone recording'; return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (st) {
      if (S.talking !== 'opening') { st.getTracks().forEach(function (t) { t.stop(); }); return; }   // let go before the mic opened
      stream = st; chunks = []; t0 = Date.now(); S.talking = 'on'; primed = true;
      try { rec = new MediaRecorder(st); rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); }; rec.start(); } catch (er) { rec = null; }
      try { ac = ac || new (G.AudioContext || G.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(st).connect(an); } catch (er) { an = null; }
      var R = route(); talk = R ? R.startTalk({ to: S.to }) : null; el.classList.add('pr-talking'); level();
    }, function () { S.talking = null; pad.classList.remove('pr-rec'); note.textContent = 'the microphone is off · allow it in the phone\'s settings'; });
  }
  function up() {
    if (!S.talking) return; var was = S.talking; S.talking = null; pad.classList.remove('pr-rec'); el.classList.remove('pr-talking'); cancelAnimationFrame(raf); ringL.style.strokeDashoffset = CIRC; an = null;
    if (was === 'opening') { note.textContent = 'hold to talk'; return; }
    var ms = Date.now() - t0, to = S.to, p = to === 'channel' ? null : find(to), tl = talk; talk = null;
    var finish = function () {
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null;
      if (ms < 350) { note.textContent = 'too short · hold to talk'; return; }
      var blob = chunks.length ? new Blob(chunks, { type: chunks[0].type || 'audio/webm' }) : null, id = 'pr' + Date.now(), inReach = p ? !!p.path : people().some(function (x) { return x.path; });
      var how = p && p.agent ? 'over the relay · preview stub, nothing sent' : inReach ? (p && p.example || !p && people()[0] && people()[0].example ? 'example · nothing sent' : 'nearby · preview stub, nothing sent') : 'no one in reach · held here until they are';
      var m = { id: id, t: Date.now(), dir: 'out', kind: 'clip', ms: ms, to: to, toName: p ? p.name : 'everyone in reach', note: how, audio: blob ? 'gj-pr-a-' + id : null, heard: true };
      if (blob && GJ.keep) GJ.keep.put(m.audio, seal(blob).payload || blob);
      thread.unshift(m); saveThread(); paintThread(); note.textContent = 'listening'; setTimeout(function () { if (!S.talking) note.textContent = 'hold to talk'; }, 1800);
      if (tl) tl.stop();
    };
    if (rec && rec.state !== 'inactive') { rec.onstop = finish; try { rec.stop(); } catch (e) { finish(); } } else finish();
    rec = null; hap('tick');
  }
  pad.addEventListener('pointerdown', function (e) { try { pad.setPointerCapture(e.pointerId); } catch (er) {} down(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { pad.addEventListener(t, up); });
  pad.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  pad.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
  pad.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') up(); });

  /* ——— what comes in: one rule decides. live plays now; everything else waits, silently, in the thread ——— */
  var liveAud = null;
  function stopLive() { if (liveAud) { try { liveAud.pause(); } catch (e) {} liveAud = null; } var n = $('.pr-now'); n.hidden = true; }
  function incoming(x) {
    var p = x.from === 'agent' ? people().filter(function (q) { return q.agent; })[0] : find(x.from); if (!p) return;
    var r = decide({ circle: !!p.circle, allowed: allowed(p.id), quiet: S.quiet, joined: S.joined, live: !!x.live, request: !!x.request && !x.live, wantsLive: !!x.live });
    var id = 'pr' + Date.now(), m = { id: id, t: Date.now(), dir: 'in', who: p.name, from: p.id, kind: r === 'live' ? 'live' : r, ms: 2400, note: (x.label || '') };
    if (r === 'live') {
      m.heard = true; m.note = (m.note ? m.note + ' · ' : '') + 'played live · push through on';
      liveAud = new Audio(x.live); var n = $('.pr-now'); n.textContent = p.name + ' · live · ' + (PATH[x.path] || ''); n.hidden = false;
      liveAud.onended = function () { n.hidden = true; liveAud = null; }; liveAud.play().catch(function () { n.hidden = true; });
      if (x.clip) m.audio = 'gj-pr-a-' + id;
    } else {
      m.note = (m.note ? m.note + ' · ' : '') + (S.quiet ? 'held · quiet is on' : !allowed(p.id) ? 'held · push through is off for ' + p.name : 'held');
      if (x.clip) m.audio = 'gj-pr-a-' + id;
    }
    if (m.audio && GJ.keep) fetch(x.clip).then(function (rr) { return rr.blob(); }).then(function (b) { GJ.keep.put(m.audio, b); }).catch(function () {});
    thread.unshift(m); saveThread(); if (S.on) paintThread(); hap(r === 'live' ? 'commit' : 'tick');
    if (r !== 'live') say(p.name + ' · ' + (r === 'request' ? 'asked to talk' : 'a clip is waiting') + ' · in the thread');
  }
  var R0 = route(); if (R0) R0.on('incoming', incoming);
  var played = null;
  function play(id) {
    var m = thread.filter(function (x) { return x.id === id; })[0]; if (!m || !m.audio || !GJ.keep) return;
    if (played) { try { played.pause(); } catch (e) {} }
    GJ.keep.get(m.audio).then(function (b) { if (!b) { say('that clip is no longer on this phone'); return; } played = new Audio(URL.createObjectURL(b)); played.play().catch(function () {}); m.heard = true; saveThread(); paintThread(); });
  }
  function ask(id) {
    var p = find(id); if (!p) return;
    thread.unshift({ id: 'pr' + Date.now(), t: Date.now(), dir: 'out', kind: 'request', to: id, toName: p.name, note: p.example ? 'example · nothing sent' : p.agent ? 'over the relay · preview stub' : p.path ? 'preview stub · nothing sent' : 'waits until ' + p.name + ' is in reach' });
    saveThread(); paintThread(); hap('tick'); say('asked ' + p.name + ' to talk · in the thread');
  }

  /* ——— taps ——— */
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b === pad) return;
    if (b.closest('.pr-sheet')) { var s = b.dataset.s; if (s === 'join') { closeSheet(); join(); } else if (s === 'x') closeSheet(); return; }
    if (b.dataset.to) { S.to = b.dataset.to; hap('tick'); paintTo(); return; }
    if (b.dataset.allow) { var id = b.dataset.allow, p = find(id); if (!p || !p.circle) return; S.allow[id] = !S.allow[id]; if (!S.allow[id]) delete S.allow[id]; sput(K.allow, S.allow); hap('tick'); paintList(); say('push through ' + (S.allow[id] ? 'on' : 'off') + ' for ' + p.name); return; }
    if (b.dataset.ask) return ask(b.dataset.ask);
    if (b.dataset.play) return play(b.dataset.play);
    var a = b.dataset.a;
    if (a === 'join') return join();
    if (a === 'leave') return leave();
    if (a === 'quiet') return setQuiet(!S.quiet);
    if (a === 'test') return setTest(!S.test);
    if (a === 'why') return why(false);
    if (a === 'clear') { thread.forEach(function (m) { if (m.audio && GJ.keep) GJ.keep.del(m.audio); }); thread = []; saveThread(); paintThread(); }
  });

  function open() {
    if (S.on) return; S.on = true; var T = ptt(); S.joined = T ? T.joined() : false; if (S.joined && route()) route().join();
    paint(); el.hidden = false; html.classList.add('radioing'); requestAnimationFrame(function () { el.classList.add('in'); }); hap('commit');
    if (!sget(K.seen, false)) setTimeout(function () { if (S.on && !S.sheet) why(true); }, 420);   // the one-time sheet, first visit only
  }
  function close() { if (!S.on) return; up(); if (S.test) setTest(false); S.on = false;   // my call: test with me ends with the room, so F3 is never lit out of sight
  closeSheet(); el.classList.remove('in'); html.classList.remove('radioing'); setTimeout(function () { if (!S.on) el.hidden = true; }, 380); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (S.on) { if (S.sheet) { closeSheet(); return true; } close(); return true; } return ca0.apply(this, arguments); }; }
  GJ.pushRadio = { open: open, close: close, isOpen: function () { return S.on; }, decide: decide, people: people,
    state: function () { return { joined: S.joined, quiet: S.quiet, test: S.test, allow: Object.keys(S.allow), to: S.to, thread: thread.length, talking: !!S.talking, f3: !!(GJ.f3 && GJ.f3.lit && GJ.f3.lit()) }; },
    quiet: setQuiet, test: setTest, join: join, leave: leave };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'pushradio', name: 'push radio', sub: 'hold to talk · your Circle, in reach', cl: 'people', open: open });
})(window);
