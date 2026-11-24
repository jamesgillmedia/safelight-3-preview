/* oz Phone · the core room on the system (catch-up 23 Nov; finished 24 Nov 2026). As familiar as the iPhone's Phone:
   favourites, recents, contacts and a keypad along the bottom, and a field at the top to say or type a name.
   oz's calm on top: your favourites are your close circle (Circle's own people, one list on this phone), and nothing
   here calls, messages or sends by itself. A call is always the phone's own dialer (tel:).
   Say or type one name and the call starts after a short, visible moment you can stop. Hold a name to hand off to the
   phone's Messages or FaceTime (each person can choose which), where you send. F3 lights when a call or a hand-off
   leaves for the phone, and at no other time. Hearing a name happens on the phone: in the app it asks the shell to
   listen on the device only; anywhere else it is the keyboard's own mic.
   Underneath the keypad is the ringer: hold the call key and a rotary dial rises round it, for dialling by turning.
   People and recents stay on this phone. Example people are marked "example" and never dial.
     GJ.phone.open() · close() · isOpen() · call(name) · heard(text) · people() · add({ name, tel, close }) */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, RKEY = 'gj-phone-recents', EXKEY = 'gj-phone-examples', ARM_MS = 2200;
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 1800); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sget(k, d) { try { var v = GJ.settings.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function sput(k, v) { try { GJ.settings.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function noop() {}
  // marked example people (fictional 555-01xx numbers): shown only while you have added nobody, and never dialled
  var EXAMPLES = [{ id: 'ex1', name: 'Mara', tel: '+1 604 555 0101', close: true, example: true }, { id: 'ex2', name: 'Theo', tel: '+1 604 555 0144', close: true, example: true },
    { id: 'ex3', name: 'June', tel: '+1 778 555 0172', close: true, example: true }, { id: 'ex4', name: 'Studio', tel: '+1 604 555 0190', close: false, example: true }];
  var HOLD = [['sms', 'message'], ['facetime', 'FaceTime'], ['facetime-audio', 'FaceTime audio'], ['ask', 'choose each time']];
  function circlePeople() { return GJ.circle && GJ.circle.people ? GJ.circle.people().filter(function (p) { return p && p.name && (!p.kind || p.kind === 'person') && !p.hidden; }) : []; }
  function people() {
    var mine = circlePeople().map(function (p) { return { id: p.id, name: p.name, tel: p.tel || '', close: p.depth === 'near', hold: p.hold || 'sms', mine: true }; });
    if (!mine.length && sget(EXKEY, true) !== false) return EXAMPLES.slice();
    return mine.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }
  function digits(t) { return String(t || '').replace(/[^\d+]/g, ''); }
  function last10(t) { var d = String(t || '').replace(/\D/g, ''); return d.slice(-10); }
  function initials(n) { var w = String(n || '').trim().split(/\s+/); return ((w[0] || '')[0] || '').toUpperCase() + ((w[1] || '')[0] || '').toUpperCase(); }
  function fmt(n) {   // the number as you dial it, grouped the way the phone shows it (North American numbers; anything else as typed)
    var s = String(n || ''); if (/[^\d+]/.test(s.replace(/[*#]/g, ''))) return s; var d = s.replace(/\D/g, '');
    if (/^\+1/.test(s) && d.length > 1) { var r = d.slice(1); return '+1 ' + grp(r); }
    if (s[0] === '+' || /[*#]/.test(s)) return s;
    if (d[0] === '1' && d.length > 7) return '1 ' + grp(d.slice(1));
    return grp(d);
    function grp(x) { if (x.length <= 3) return x; if (x.length <= 7) return x.slice(0, 3) + ' ' + x.slice(3); return x.slice(0, 3) + ' ' + x.slice(3, 6) + ' ' + x.slice(6, 10) + (x.length > 10 ? ' ' + x.slice(10) : ''); }
  }

  var el = document.createElement('section'); el.id = 'phone'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'phone'); el.hidden = true;
  el.innerHTML =
    '<div class="ph-find"><div class="ph-qw"><input type="text" class="ph-q" placeholder="say or type a name" aria-label="say or type a name" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="go">' +
      '<button type="button" class="ph-x" aria-label="clear" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l8 8M16 8l-8 8"/></svg></button></div>' +
      '<button type="button" class="ph-mic" aria-label="say a name"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.4a2.6 2.6 0 0 1 2.6 2.6v4.6a2.6 2.6 0 0 1-5.2 0V7A2.6 2.6 0 0 1 12 4.4zM7 11.4a5 5 0 0 0 10 0M12 16.4v3.2"/></svg></button></div>' +
    '<p class="ph-hint" hidden></p>' +
    '<div class="ph-arm" role="status" hidden><svg class="ph-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle class="ph-left" cx="20" cy="20" r="16"/></svg>' +
      '<p><b></b><span>on the phone\'s own dialer</span></p><button type="button" class="ph-stop">stop</button></div>' +
    '<div class="ph-body" role="region" aria-label="people"></div>' +
    '<nav class="ph-tabs" role="tablist" aria-label="phone">' +
      [['fav', 'favourites'], ['recents', 'recents'], ['contacts', 'contacts'], ['keypad', 'keypad']].map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') +
    '</nav><div class="ph-sheet" role="dialog" hidden></div>';
  document.body.appendChild(el);
  var q = el.querySelector('.ph-q'), qx = el.querySelector('.ph-x'), body = el.querySelector('.ph-body'), hint = el.querySelector('.ph-hint'), sheet = el.querySelector('.ph-sheet'), armEl = el.querySelector('.ph-arm');
  var on = false, tab = 'fav', typed = '', hintT = 0;
  function showHint(t, ms) { clearTimeout(hintT); hint.textContent = t; hint.hidden = !t; if (t) hintT = setTimeout(function () { hint.hidden = true; }, ms || 4200); }

  function av(p) { return '<i class="ph-av' + (p.example ? ' ex' : '') + '" aria-hidden="true">' + esc(initials(p.name)) + '</i>'; }
  function row(p) {
    return '<div class="ph-row" data-id="' + esc(p.id) + '"><button type="button" class="ph-call" data-call="' + esc(p.id) + '" aria-label="call ' + esc(p.name) + (p.example ? ' · example' : '') + '">' + av(p) +
      '<span class="ph-tx"><b>' + esc(p.name) + '</b><span>' + (p.example ? '<em class="ph-exm">example</em> · ' : '') + (p.tel ? esc(fmt(p.tel)) : 'no number yet') + '</span></span></button>' +
      '<button type="button" class="ph-i" data-info="' + esc(p.id) + '" aria-label="' + esc(p.name) + ' · details">i</button></div>';
  }
  function exactOne(t, L) {   // one name, one call: the whole name, or a first name nobody else shares or starts with
    t = String(t || '').toLowerCase().trim(); if (t.length < 2) return null;
    var C = L.filter(function (p) { var n = p.name.toLowerCase(); return n === t || n.split(/\s+/)[0] === t; });
    if (C.length !== 1) return null;
    if (L.some(function (p) { return p !== C[0] && p.name.toLowerCase().indexOf(t) === 0; })) return null;
    return C[0];
  }
  function paint() {
    Array.prototype.forEach.call(el.querySelectorAll('.ph-tabs button'), function (b) { var c = b.dataset.tab === tab && !typed; b.classList.toggle('on', c); b.setAttribute('aria-selected', String(c)); });
    qx.hidden = !q.value;
    var L = people(), h = '';
    if (typed) {   // say or type a name: the matches, best first; one exact name starts the call, Return calls the first
      var t = typed.toLowerCase(), M = L.filter(function (p) { return p.name.toLowerCase().indexOf(t) >= 0 || digits(p.tel).indexOf(digits(t)) >= 0 && digits(t).length > 2; })
        .sort(function (a, b) { return a.name.toLowerCase().indexOf(t) - b.name.toLowerCase().indexOf(t); });
      var one = exactOne(typed, L);
      h = M.length ? '<h3 class="jul">' + (one && one.example ? 'an example · it doesn\'t dial' : M.length === 1 ? 'return calls' : 'return calls the first') + '</h3>' + M.map(row).join('') : '<p class="ph-none">no one by that name · add them in contacts</p>';
      if (digits(typed).length > 2 && !M.length) h += '<button type="button" class="ph-wide" data-dial="' + esc(digits(typed)) + '">call ' + esc(fmt(typed)) + '</button>';
    } else if (tab === 'fav') {
      var F = L.filter(function (p) { return p.close; });
      h = '<h3 class="jul">your close circle</h3>' + (F.length ? F.map(row).join('') : '<p class="ph-none">no one in your close circle yet · in contacts, tap i and turn on close circle</p>');
      if (L[0] && L[0].example) h += '<p class="ph-ex">these are example people · add someone real in contacts and they go away</p>';
      h += '<button type="button" class="ph-wide ph-soft" data-a="circle">see them as a constellation · circle</button>';
    } else if (tab === 'recents') {
      var R = sget(RKEY, []);
      h = '<h3 class="jul">recents · started from oz</h3>' + (R.length ? R.slice(0, 40).map(function (r, i) {
        var p = byTel(r.tel, L);
        return '<div class="ph-row"><button type="button" class="ph-call" data-redial="' + esc(r.tel) + '" data-name="' + esc(r.name) + '" aria-label="' + esc(r.how) + ' ' + esc(r.name) + ' again">' + av(p || { name: r.name }) +
          '<span class="ph-tx"><b>' + esc(p ? p.name : fmt(r.name)) + '</b><span>' + esc(r.how) + '</span></span><span class="ph-when">' + when(r.t) + '</span></button>' +
          (p ? '<button type="button" class="ph-i" data-info="' + esc(p.id) + '" aria-label="' + esc(p.name) + ' · details">i</button>' : '') + '</div>';
      }).join('') + '<button type="button" class="ph-wide ph-soft" data-a="clear">clear recents</button>'
        : '<p class="ph-none">nothing yet · calls you start here are listed here, on this phone only</p>');
    } else if (tab === 'contacts') {
      var last = '';
      h = '<button type="button" class="ph-wide" data-a="add">add someone</button>' + (L.length ? L.map(function (p) { var l = (p.name[0] || '#').toUpperCase(), s = l !== last ? '<h4 class="ph-l" aria-hidden="true">' + esc(l) + '</h4>' : ''; last = l; return s + row(p); }).join('') : '<p class="ph-none">no one yet</p>');
    } else {
      h = '<div class="ph-num" aria-live="polite"></div><p class="ph-who"></p><div class="ph-keys">' + KEYS.map(function (k) { return '<button type="button" data-k="' + k[0] + '" aria-label="' + k[0] + '"><b>' + k[0] + '</b><span>' + k[1] + '</span></button>'; }).join('') + '</div>' +
        '<div class="ph-keyact"><button type="button" class="ph-go" data-a="padcall" aria-label="call · hold for the ringer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.6 4.4l2.2 3.6-1.6 1.6c.9 2.2 2.6 3.9 4.8 4.8l1.6-1.6 3.6 2.2-.9 2.6c-.2.6-.8.9-1.4.8C10.9 17.5 6.5 13.1 5.6 8.1c-.1-.6.2-1.2.8-1.4z"/></svg></button><button type="button" class="ph-del" data-a="padback" aria-label="delete a digit · hold to clear">⌫</button></div>';
    }
    body.innerHTML = h;
    if (tab === 'keypad' && !typed) padShow();
  }
  var KEYS = [['1', ''], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', ''], ['0', '+'], ['#', '']], pad = '';
  function byTel(t, L) { var k = last10(t); if (k.length < 7) return null; return (L || people()).filter(function (p) { return p.tel && last10(p.tel) === k; })[0] || null; }
  function padShow() {   // the number, grouped; under it, who it is, or "add number"
    var n = body.querySelector('.ph-num'), w = body.querySelector('.ph-who'); if (!n) return;
    n.textContent = fmt(pad); var p = byTel(pad); var go = body.querySelector('.ph-go'); if (go) go.setAttribute('aria-label', pad ? 'call ' + fmt(pad) + ' · hold for the ringer' : 'call · hold for the ringer');
    w.innerHTML = p ? esc(p.name) + (p.example ? ' · example' : '') : (digits(pad).length > 2 ? '<button type="button" class="ph-add" data-a="addnum">add number</button>' : '');
  }
  function padAdd(k) { pad = (pad + k).slice(0, 24); padShow(); }
  function when(t) { var d = new Date(t), n = new Date(); return d.toDateString() === n.toDateString() ? d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(/\s?([ap])\.?m\.?/, ' $1.m.') : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }
  function find(id) { return people().filter(function (p) { return String(p.id) === String(id); })[0]; }

  /* leaving the phone: only ever the phone's own apps, and only when you ask. F3 shows it went */
  function handTo(url, what, where) {
    if (GJ.f3 && GJ.f3.out) GJ.f3.out(what, where);
    var a = document.createElement('a'); a.href = url; a.rel = 'noopener'; document.body.appendChild(a); try { a.click(); } catch (e) {} a.remove();
  }
  function placed(name) { try { document.dispatchEvent(new CustomEvent('oz:phone-call', { detail: { name: name } })); } catch (e) {} }
  function remember(name, tel, how) { var R = sget(RKEY, []); R.unshift({ name: name, tel: tel, how: how, t: Date.now() }); sput(RKEY, R.slice(0, 60)); }
  function call(p) {
    if (!p) return; hap('commit'); disarm();
    if (p.example) { say(p.name + ' is an example · add someone real to call'); return; }
    if (!p.tel) { info(p.id); say('no number yet for ' + p.name); return; }
    remember(p.name, p.tel, 'call'); handTo('tel:' + digits(p.tel), 'a call', 'the phone\'s own dialer · ' + p.name); placed(p.name); say('calling ' + p.name + ' · on the phone\'s own dialer');
    if (tab === 'recents') paint();
  }
  function dialNumber(n) { if (!digits(n)) return; disarm(); var p = byTel(n); if (p) return call(p); remember(n, n, 'call'); handTo('tel:' + digits(n), 'a call', 'the phone\'s own dialer'); placed(fmt(n)); say('calling ' + fmt(n) + ' · on the phone\'s own dialer'); }

  /* one name, one call: a short, visible moment you can stop, then the phone's own dialer */
  var armT = 0, armP = null;
  function arm(p) {
    disarm(); if (!p || p.example || !p.tel) return; armP = p;
    armEl.querySelector('b').textContent = 'calling ' + p.name; armEl.hidden = false; armEl.classList.remove('go'); void armEl.offsetWidth; armEl.style.setProperty('--arm', ARM_MS + 'ms'); armEl.classList.add('go');
    hap('tick'); armT = setTimeout(function () { var x = armP; armT = 0; if (x && on) call(x); }, ARM_MS);
  }
  function disarm() { if (armT) clearTimeout(armT); armT = 0; armP = null; armEl.hidden = true; armEl.classList.remove('go'); }
  armEl.querySelector('.ph-stop').addEventListener('click', function () { disarm(); hap('tick'); showHint('stopped · nothing was dialled', 2200); });

  /* a heard name: on the phone, never sent anywhere. "call Mara", "Mara" or a number */
  function heard(text) {
    var s = String(text || '').trim(); if (!s) return false;
    s = s.replace(/^(hey,? oz[,.]?\s+)?(please\s+)?(call|phone|ring|dial)\s+/i, '').replace(/[.?!,]+$/, '').trim();
    var L = people(), d = s.replace(/[\s()-]/g, '');
    if (/^\+?\d{3,}$/.test(d)) { switchTab('keypad'); pad = d; padShow(); return true; }
    var p = exactOne(s, L) || (function () { var w = s.toLowerCase().split(/\s+/)[0], C = L.filter(function (x) { return x.name.toLowerCase().split(/\s+/)[0] === w; }); return C.length === 1 ? C[0] : null; })();
    q.value = p ? p.name : s; typed = q.value; paint();
    if (p && !p.example && p.tel) { arm(p); return true; }
    if (p && p.example) showHint(p.name + ' is an example · add someone real to call', 3000);
    else if (!p) showHint('no one by that name in your circle', 3000);
    return !!p;
  }

  /* say a name: the app's shell listens on the device only; elsewhere, the keyboard's own mic */
  function native() { var N = G.ozNative; try { return N && N.send && G.webkit && G.webkit.messageHandlers && G.webkit.messageHandlers.oz ? N : null; } catch (e) { return null; } }
  var listening = false, mic = el.querySelector('.ph-mic');
  function listenDone() { listening = false; el.classList.remove('ph-listening'); mic.setAttribute('aria-label', 'say a name'); q.placeholder = 'say or type a name'; }
  function listen() {
    var N = native();
    if (!N) { showHint('say a name with the keyboard\'s mic · it starts the call'); q.focus(); return; }
    if (listening) { N.send('speech.stop').catch(noop); return; }
    disarm(); listening = true; el.classList.add('ph-listening'); mic.setAttribute('aria-label', 'stop listening'); q.placeholder = 'listening · say a name'; q.value = ''; typed = ''; paint(); hap('tick');
    N.send('speech.name', { hints: people().filter(function (p) { return !p.example; }).map(function (p) { return p.name; }).slice(0, 100), seconds: 4 }).then(function (r) {
      listenDone(); var t = r && r.text || ''; if (!on) return; if (!t) { showHint('didn\'t catch a name · try again, or type it', 3000); return; } heard(t);
    }, function (e) {
      listenDone(); var m = String(e && e.message || e);
      if (/on this phone/.test(m)) { showHint('this phone can\'t hear names on the device · use the keyboard\'s mic'); q.focus(); }
      else if (/not allowed/.test(m)) showHint('the microphone or speech is off for oz · Settings › oz');
      else showHint('couldn\'t listen just now · type a name', 3000);
    });
  }
  mic.addEventListener('click', listen);

  /* hold a name: hand off to the phone's own Messages or FaceTime — they send, oz never does. Each person can choose */
  function leave(p, h) {
    if (!p || h === 'x') return;
    if (h === 'oz') { if (GJ.messages && GJ.messages.draft) GJ.messages.draft(p.name, ''); return; }
    if (p.example || !p.tel) { say(p.example ? 'an example · nothing leaves' : 'no number yet'); return; }
    if (h === 'tel') return call(p);
    remember(p.name, p.tel, h === 'sms' ? 'message' : h === 'facetime' ? 'FaceTime' : 'FaceTime audio');
    handTo((h === 'sms' ? 'sms:' : h + ':') + digits(p.tel), h === 'sms' ? 'a message, handed off' : 'a FaceTime call', (h === 'sms' ? 'the phone\'s Messages' : 'FaceTime') + ' · ' + p.name);
    say(h === 'sms' ? 'to Messages · ' + p.name : 'FaceTime · ' + p.name);
  }
  function hold(p) {
    if (!p) return; hap('tick'); disarm();
    if (!p.example && p.tel && p.hold && p.hold !== 'ask') return leave(p, p.hold);
    sheet.innerHTML = '<h3 class="jul">' + esc(p.name) + (p.example ? ' · example' : '') + '</h3><p class="ph-sub">hand off · the app opens, you send</p>' +
      (p.example ? '<p class="ph-none">examples don\'t leave the phone</p>' : !p.tel ? '<p class="ph-none">no number yet</p>' :
      '<button type="button" class="ph-wide" data-h="sms">message · the phone\'s Messages</button><button type="button" class="ph-wide" data-h="facetime">FaceTime</button><button type="button" class="ph-wide" data-h="facetime-audio">FaceTime audio</button>') +
      '<button type="button" class="ph-wide ph-soft" data-h="oz">write in oz Messages · stays on this phone</button><button type="button" class="ph-wide ph-soft" data-h="x">cancel</button>';
    openSheet(p, 'hand off · ' + p.name);
  }
  function openSheet(p, label) { sheet.dataset.id = p ? p.id : ''; sheet.setAttribute('aria-label', label); sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); }
  function closeSheet() { sheet.classList.remove('in'); setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260); }
  function info(id) {
    var p = id ? find(id) : null, isNew = !p, pre = (typeof id === 'object' && id) ? id : null; if (pre) { p = null; isNew = true; }
    var act = p && !p.example ? '<div class="ph-acts">' + [['sms', 'message'], ['tel', 'call'], ['facetime', 'FaceTime']].map(function (a) { return '<button type="button" data-h="' + a[0] + '"' + (p.tel ? '' : ' disabled') + '><i aria-hidden="true">' + ICON[a[0]] + '</i>' + a[1] + '</button>'; }).join('') + '</div>' : '';
    sheet.innerHTML = (p ? '<div class="ph-card">' + av(p) + '<h3 class="ph-cn">' + esc(p.name) + '</h3>' + (p.example ? '<p class="ph-sub"><em class="ph-exm">example</em></p>' : '') + '</div>' + act : '<h3 class="jul">add someone</h3>') +
      (p && p.example ? '<p class="ph-none">an example · add someone real and the examples go away</p><button type="button" class="ph-wide ph-soft" data-e="hideex">hide the examples</button>' :
      '<label class="ph-f">name<input class="ph-n" autocomplete="off" autocapitalize="words" value="' + esc(p ? p.name : '') + '"></label><label class="ph-f">number<input class="ph-t" type="tel" inputmode="tel" autocomplete="off" value="' + esc(p ? p.tel : pre ? pre.tel : '') + '"></label>' +
      '<label class="ph-f ph-sw"><span>close circle · in favourites</span><input type="checkbox" class="ph-c"' + (!p || p.close ? ' checked' : '') + '></label>' +
      '<label class="ph-f ph-sw"><span>holding the name opens</span><select class="ph-hold">' + HOLD.map(function (o) { return '<option value="' + o[0] + '"' + ((p ? p.hold : 'sms') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="ph-wide" data-e="save">' + (isNew ? 'add' : 'save') + '</button>' + (isNew ? '' : '<button type="button" class="ph-wide ph-soft" data-e="del">remove from this phone</button>')) +
      '<button type="button" class="ph-wide ph-soft" data-e="x">cancel</button>';
    openSheet(p, p ? p.name + ' · details' : 'add someone'); var n = sheet.querySelector('.ph-n'); if (n && isNew) setTimeout(function () { n.focus(); }, 60);
  }
  var ICON = { sms: '<svg viewBox="0 0 24 24"><path d="M4.5 6.5h15v9h-9l-4 3v-3h-2z"/></svg>', tel: '<svg viewBox="0 0 24 24"><path d="M7.6 4.4l2.2 3.6-1.6 1.6c.9 2.2 2.6 3.9 4.8 4.8l1.6-1.6 3.6 2.2-.9 2.6c-.2.6-.8.9-1.4.8C10.9 17.5 6.5 13.1 5.6 8.1c-.1-.6.2-1.2.8-1.4z"/></svg>',
    facetime: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5h11v9h-11zM14.5 11l5-3v8l-5-3"/></svg>' };
  sheet.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return; var p = find(sheet.dataset.id);
    if (b.dataset.h) { closeSheet(); leave(p, b.dataset.h); return; }
    var a = b.dataset.e; if (!a) return;
    if (a === 'x') { closeSheet(); return; }
    if (a === 'hideex') { sput(EXKEY, false); closeSheet(); paint(); return; }
    if (a === 'save') {
      var nm = sheet.querySelector('.ph-n').value.trim(), tl = sheet.querySelector('.ph-t').value.trim(), cl = sheet.querySelector('.ph-c').checked, hd = sheet.querySelector('.ph-hold').value; if (!nm) { sheet.querySelector('.ph-n').focus(); return; }
      if (p && p.mine && GJ.circle.update) GJ.circle.update(p.id, { name: nm, tel: tl, depth: cl ? 'near' : 'mid', hold: hd });
      else if (GJ.circle && GJ.circle.add) GJ.circle.add({ id: 'p' + Date.now(), name: nm, tel: tl, depth: cl ? 'near' : 'mid', hold: hd, x: .2 + Math.random() * .6, y: .25 + Math.random() * .5 });
      hap('commit'); closeSheet(); paint(); return; }
    if (a === 'del' && p && p.mine && GJ.circle.remove) { GJ.circle.remove(p.id); closeSheet(); paint(); }
  });

  /* touch: a tap calls (as Favourites does), a hold hands off, i is the details. On the keypad: hold 0 for +,
     hold delete to clear, hold the call key for the ringer */
  var holdT = 0, held = false;
  body.addEventListener('pointerdown', function (e) {
    held = false; clearTimeout(holdT);
    var b = e.target.closest('[data-call], [data-redial], [data-k="0"], [data-a="padback"], [data-a="padcall"]'); if (!b) return;
    holdT = setTimeout(function () {
      held = true;
      if (b.dataset.call) hold(find(b.dataset.call));
      else if (b.dataset.redial) { var p = byTel(b.dataset.redial); if (p) hold(p); else held = false; }
      else if (b.dataset.k === '0') { padAdd('+'); hap('tick'); }
      else if (b.dataset.a === 'padback') { pad = ''; padShow(); hap('tick'); }
      else if (b.dataset.a === 'padcall') ringer.rise();
    }, b.dataset.a === 'padcall' ? 600 : 520);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { body.addEventListener(t, function () { clearTimeout(holdT); }); });
  body.addEventListener('contextmenu', function (e) { if (e.target.closest('[data-call], [data-redial], .ph-keys, .ph-keyact')) e.preventDefault(); });
  body.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; if (held) { held = false; return; }
    if (b.dataset.call) return call(find(b.dataset.call));
    if (b.dataset.info) return info(b.dataset.info);
    if (b.dataset.redial) { var p = byTel(b.dataset.redial); return p ? call(p) : dialNumber(b.dataset.redial); }
    if (b.dataset.dial) return dialNumber(b.dataset.dial);
    if (b.dataset.k) { padAdd(b.dataset.k); hap('tick'); return; }
    var a = b.dataset.a;
    if (a === 'padback') { pad = pad.slice(0, -1); padShow(); return; }
    if (a === 'padcall') { if (pad) dialNumber(pad); else { var R = sget(RKEY, []), r = R.filter(function (x) { return x.how === 'call' && digits(x.tel); })[0]; if (r) { pad = digits(r.tel); padShow(); hap('tick'); } } return; }   // as the phone does: an empty call key brings back the last number
    if (a === 'addnum') return info({ tel: pad });
    if (a === 'add') return info(null);
    if (a === 'clear') { sput(RKEY, []); paint(); return; }
    if (a === 'circle') { if (GJ.circle && GJ.circle.open) GJ.circle.open(); return; }
  });
  function switchTab(t) { tab = t; typed = ''; q.value = ''; disarm(); ringer.sink(true); paint(); }
  el.querySelector('.ph-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; hap('tick'); switchTab(b.dataset.tab); });
  q.addEventListener('input', function () { typed = q.value.trim(); disarm(); paint(); var p = exactOne(typed, people()); if (p) arm(p); });
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); if (armP) { var x = armP; return call(x); } var first = body.querySelector('[data-call], [data-dial]'); if (first) first.click(); }
    if (e.key === 'Escape' && q.value) { e.stopPropagation(); q.value = ''; typed = ''; disarm(); paint(); }
  });
  qx.addEventListener('click', function () { q.value = ''; typed = ''; disarm(); paint(); q.focus(); });

  /* the ringer, underneath: hold the call key and a rotary rises round it. Turn a number to the stop and let go; it
     dials as it comes back. Tap a hole to dial it the same way. The middle calls. Leave it alone and it sinks away */
  var ringer = (function () {
    var STOP = 120, R0 = 112, HR = 21, DIG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    function ang(i) { return (60 - 30 * i + 360) % 360; }            // where each hole sits, clockwise from twelve
    function travel(i) { return (STOP - ang(i) + 360) % 360; }        // how far it turns to reach the stop
    function xy(a, r) { var t = a * Math.PI / 180; return [150 + r * Math.sin(t), 150 - r * Math.cos(t)]; }
    var w = null, plate = null, idleT = 0, drag = null, busy = false;
    function build() {
      w = document.createElement('div'); w.className = 'ph-ringer'; w.setAttribute('role', 'group'); w.setAttribute('aria-label', 'the ringer · turn a number to the stop');
      var nums = DIG.map(function (d, i) { var p = xy(ang(i), R0); return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 6).toFixed(1) + '">' + d + '</text>'; }).join('');
      var holes = DIG.map(function (d, i) { var p = xy(ang(i), R0); return '<circle class="hole" data-i="' + i + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + HR + '"/>'; }).join('');
      var s = xy(STOP + 14, R0 + 6), s2 = xy(STOP + 14, R0 + 34);
      w.innerHTML = '<svg viewBox="0 0 300 300" aria-hidden="true"><circle class="rim" cx="150" cy="150" r="146"/><g class="nums">' + nums + '</g>' +
        '<g class="plate"><circle class="pl" cx="150" cy="150" r="140"/>' + holes + '<circle class="hub" cx="150" cy="150" r="54"/></g>' +
        '<path class="stopper" d="M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + 'L' + s2[0].toFixed(1) + ' ' + s2[1].toFixed(1) + '"/></svg>' +
        DIG.map(function (d, i) { var p = xy(ang(i), R0); return '<button type="button" class="ph-hole" data-i="' + i + '" style="left:' + (p[0] / 3).toFixed(2) + '%;top:' + (p[1] / 3).toFixed(2) + '%" aria-label="' + d + '"></button>'; }).join('') +
        '<button type="button" class="ph-rcall" aria-label="call"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON.tel.replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</svg></button>';
      plate = w.querySelector('.plate');
      w.addEventListener('pointerdown', down); w.addEventListener('click', click);
    }
    function center() { var r = w.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width / 300]; }
    function aAt(e) { var c = center(); return (Math.atan2(e.clientX - c[0], -(e.clientY - c[1])) * 180 / Math.PI + 360) % 360; }
    function setRot(d, ms) { plate.style.transition = ms ? 'transform ' + ms + 'ms cubic-bezier(.3,.1,.3,1)' : 'none'; plate.style.transform = 'rotate(' + d + 'deg)'; }
    function idle() { clearTimeout(idleT); idleT = setTimeout(function () { if (!drag && !busy) sink(); }, 7000); }
    function back(i, from) {   // comes home at an even pace and the digit lands as it does
      busy = true; var ms = Math.round(from / 360 * 1100) + 120; setRot(0, ms);
      setTimeout(function () { busy = false; if (i != null) { padAdd(DIG[i]); hap('commit'); } idle(); }, ms);
    }
    function down(e) {
      var h = e.target.closest('.ph-hole'); if (!h || busy) return; e.preventDefault();
      drag = { i: +h.dataset.i, a: aAt(e), acc: 0, id: e.pointerId, moved: false }; try { w.setPointerCapture(e.pointerId); } catch (x) {} clearTimeout(idleT);
      w.addEventListener('pointermove', move); w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up);
    }
    function move(e) {
      if (!drag || e.pointerId !== drag.id) return; var a = aAt(e), d = ((a - drag.a + 540) % 360) - 180; drag.a = a;
      drag.acc = Math.max(0, Math.min(travel(drag.i), drag.acc + d)); if (drag.acc > 6) drag.moved = true; setRot(drag.acc, 0);
      if (!drag.hit && drag.acc >= travel(drag.i) - 4) { drag.hit = true; hap('tick'); }
    }
    function up(e) {
      if (!drag) return; var d = drag; drag = null; w.removeEventListener('pointermove', move); w.removeEventListener('pointerup', up); w.removeEventListener('pointercancel', up);
      if (d.moved) { w._noClick = true; back(d.acc >= travel(d.i) - 10 ? d.i : null, d.acc); }
    }
    function click(e) {
      if (w._noClick) { w._noClick = false; return; }
      if (e.target.closest('.ph-rcall')) { sink(); if (pad) dialNumber(pad); return; }
      var h = e.target.closest('.ph-hole'); if (!h || busy) return; var i = +h.dataset.i, t = travel(i);   // a tap turns it for you
      busy = true; setRot(t, Math.round(t / 360 * 700) + 120); setTimeout(function () { back(i, t); }, Math.round(t / 360 * 700) + 160);
    }
    function outside(e) { if (w && w.classList.contains('up') && !w.contains(e.target) && !e.target.closest('.ph-num, .ph-who, .ph-keyact')) sink(); }
    function rise() {
      var host = body.querySelector('.ph-keys'); if (!host) return; if (!w) build();
      host.parentNode.insertBefore(w, host); w.classList.remove('up'); setRot(0, 0); void w.offsetWidth; w.classList.add('up'); body.classList.add('ringing');
      hap('commit'); idle(); setTimeout(function () { document.addEventListener('pointerdown', outside, true); }, 0);
    }
    function sink(now) {
      if (!w || !w.classList.contains('up')) return; clearTimeout(idleT); document.removeEventListener('pointerdown', outside, true); w.classList.remove('up'); body.classList.remove('ringing');
      if (now) { if (w.parentNode) w.parentNode.removeChild(w); return; } setTimeout(function () { if (!w.classList.contains('up') && w.parentNode) w.parentNode.removeChild(w); }, 420);
    }
    return { rise: rise, sink: sink, isUp: function () { return !!(w && w.classList.contains('up')); } };
  })();

  function open() { if (on) return; on = true; tab = 'fav'; typed = ''; q.value = ''; pad = ''; disarm(); paint(); el.hidden = false; html.classList.add('phoning'); requestAnimationFrame(function () { el.classList.add('in'); }); hap('commit'); }
  function close() { if (!on) return; on = false; disarm(); ringer.sink(true); if (listening) { var N = native(); if (N) N.send('speech.stop').catch(noop); } closeSheet(); q.blur(); el.classList.remove('in'); html.classList.remove('phoning'); setTimeout(function () { if (!on) el.hidden = true; }, 380); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (on) { if (!sheet.hidden) { closeSheet(); return true; } if (armP) { disarm(); return true; } if (ringer.isUp()) { ringer.sink(); return true; } if (typed) { q.value = ''; typed = ''; paint(); return true; } close(); return true; } return ca0.apply(this, arguments); }; }
  GJ.phone = { open: open, close: close, isOpen: function () { return on; }, people: people, heard: heard,
    call: function (name) { var p = people().filter(function (x) { return x.name.toLowerCase() === String(name).toLowerCase(); })[0]; call(p); return !!p; },
    add: function (o) { if (GJ.circle && GJ.circle.add) GJ.circle.add({ id: 'p' + Date.now(), name: o.name, tel: o.tel || '', depth: o.close === false ? 'mid' : 'near', hold: o.hold || 'sms', x: .5, y: .5 }); if (on) paint(); },
    ringer: ringer, armed: function () { return armP ? armP.name : null; } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'phone', name: 'phone', sub: 'your close circle · the phone\'s own dialer', cl: 'people', open: open });
})(window);
