/* oz Phone (catch-up, 23 Nov 2026) · the core room on the system. As familiar as the iPhone's Phone: favourites,
   recents, contacts and a keypad along the bottom, and a field at the top to say or type a name. oz's calm on top:
   your favourites are your close circle (the same people as Circle; nobody you haven't added), and nothing here calls,
   messages or sends by itself. A call is always the phone's own dialer (tel:). Hold a name to hand off to the phone's
   Messages or FaceTime, where you send. F3 lights when a call or a hand-off leaves for the phone, and at no other time.
   People and recents stay on this phone. Example people are marked "example" and never dial.
     GJ.phone.open() · close() · isOpen() · call(name) · people() · add({ name, tel, close }) */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, RKEY = 'gj-phone-recents', EXKEY = 'gj-phone-examples';
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 1800); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sget(k, d) { try { var v = GJ.settings.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function sput(k, v) { try { GJ.settings.setItem(k, JSON.stringify(v)); } catch (e) {} }
  // marked example people (fictional 555-01xx numbers): shown only while you have added nobody, and never dialled
  var EXAMPLES = [{ id: 'ex1', name: 'Mara', tel: '+1 604 555 0101', close: true, example: true }, { id: 'ex2', name: 'Theo', tel: '+1 604 555 0144', close: true, example: true },
    { id: 'ex3', name: 'June', tel: '+1 778 555 0172', close: true, example: true }, { id: 'ex4', name: 'Studio', tel: '+1 604 555 0190', close: false, example: true }];
  function circlePeople() { return GJ.circle && GJ.circle.people ? GJ.circle.people().filter(function (p) { return p && p.name && (!p.kind || p.kind === 'person') && !p.hidden; }) : []; }
  function people() {
    var mine = circlePeople().map(function (p) { return { id: p.id, name: p.name, tel: p.tel || '', close: p.depth === 'near', mine: true }; });
    if (!mine.length && sget(EXKEY, true) !== false) return EXAMPLES.slice();
    return mine.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }
  function digits(t) { return String(t || '').replace(/[^\d+]/g, ''); }

  var el = document.createElement('section'); el.id = 'phone'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'phone'); el.hidden = true;
  el.innerHTML =
    '<div class="ph-find"><input type="search" class="ph-q" placeholder="say or type a name" aria-label="say or type a name" autocomplete="off" enterkeyhint="go">' +
      '<button type="button" class="ph-mic" aria-label="say a name · the keyboard\'s own mic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.4a2.6 2.6 0 0 1 2.6 2.6v4.6a2.6 2.6 0 0 1-5.2 0V7A2.6 2.6 0 0 1 12 4.4zM7 11.4a5 5 0 0 0 10 0M12 16.4v3.2"/></svg></button></div>' +
    '<p class="ph-hint" hidden></p>' +
    '<div class="ph-body" role="region" aria-live="polite"></div>' +
    '<nav class="ph-tabs" role="tablist" aria-label="phone">' +
      [['fav', 'favourites'], ['recents', 'recents'], ['contacts', 'contacts'], ['keypad', 'keypad']].map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') +
    '</nav><div class="ph-sheet" hidden></div>';
  document.body.appendChild(el);
  var q = el.querySelector('.ph-q'), body = el.querySelector('.ph-body'), hint = el.querySelector('.ph-hint'), sheet = el.querySelector('.ph-sheet');
  var on = false, tab = 'fav', typed = '';

  function row(p) {
    return '<div class="ph-row" data-id="' + esc(p.id) + '"><button type="button" class="ph-call" data-call="' + esc(p.id) + '" aria-label="call ' + esc(p.name) + (p.example ? ' · example' : '') + '">' +
      '<b>' + esc(p.name) + '</b><span>' + (p.example ? 'example · ' : '') + (p.tel ? esc(p.tel) : 'no number yet') + '</span></button>' +
      '<button type="button" class="ph-i" data-info="' + esc(p.id) + '" aria-label="' + esc(p.name) + ' · details">i</button></div>';
  }
  function paint() {
    Array.prototype.forEach.call(el.querySelectorAll('.ph-tabs button'), function (b) { var c = b.dataset.tab === tab && !typed; b.classList.toggle('on', c); b.setAttribute('aria-selected', String(c)); });
    var L = people(), h = '';
    if (typed) {   // say or type a name: the matches, best first; Return calls the first
      var t = typed.toLowerCase(), M = L.filter(function (p) { return p.name.toLowerCase().indexOf(t) >= 0 || digits(p.tel).indexOf(digits(t)) >= 0 && digits(t).length > 2; })
        .sort(function (a, b) { return a.name.toLowerCase().indexOf(t) - b.name.toLowerCase().indexOf(t); });
      h = M.length ? '<h3 class="jul">' + (M.length === 1 ? 'return calls' : 'return calls the first') + '</h3>' + M.map(row).join('') : '<p class="ph-none">no one by that name · add them in contacts</p>';
      if (digits(typed).length > 2 && !M.length) h += '<button type="button" class="ph-wide" data-dial="' + esc(digits(typed)) + '">call ' + esc(typed) + '</button>';
    } else if (tab === 'fav') {
      var F = L.filter(function (p) { return p.close; });
      h = '<h3 class="jul">your close circle</h3>' + (F.length ? F.map(row).join('') : '<p class="ph-none">no one in your close circle yet · in contacts, tap i and turn on close circle</p>');
      if (L[0] && L[0].example) h += '<p class="ph-ex">these are example people · add someone real in contacts and they go away</p>';
      h += '<button type="button" class="ph-wide ph-soft" data-a="circle">see them as a constellation · circle</button>';
    } else if (tab === 'recents') {
      var R = sget(RKEY, []);
      h = '<h3 class="jul">recents · started from oz</h3>' + (R.length ? R.slice(0, 40).map(function (r) { return '<div class="ph-row"><button type="button" class="ph-call" data-redial="' + esc(r.tel) + '" data-name="' + esc(r.name) + '"><b>' + esc(r.name) + '</b><span>' + esc(r.how) + ' · ' + when(r.t) + '</span></button></div>'; }).join('') + '<button type="button" class="ph-wide ph-soft" data-a="clear">clear recents</button>'
        : '<p class="ph-none">nothing yet · calls you start here are listed here, on this phone only</p>');
    } else if (tab === 'contacts') {
      h = '<button type="button" class="ph-wide" data-a="add">add someone</button>' + (L.length ? L.map(row).join('') : '<p class="ph-none">no one yet</p>');
    } else {
      h = '<div class="ph-num" aria-live="polite">' + esc(pad || '') + '</div><div class="ph-keys">' + KEYS.map(function (k) { return '<button type="button" data-k="' + k[0] + '" aria-label="' + k[0] + '"><b>' + k[0] + '</b><span>' + k[1] + '</span></button>'; }).join('') + '</div>' +
        '<div class="ph-keyact"><button type="button" class="ph-go" data-a="padcall" aria-label="call ' + esc(pad || '') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.6 4.4l2.2 3.6-1.6 1.6c.9 2.2 2.6 3.9 4.8 4.8l1.6-1.6 3.6 2.2-.9 2.6c-.2.6-.8.9-1.4.8C10.9 17.5 6.5 13.1 5.6 8.1c-.1-.6.2-1.2.8-1.4z"/></svg></button><button type="button" class="ph-del" data-a="padback" aria-label="delete a digit">⌫</button></div>';
    }
    body.innerHTML = h;
  }
  var KEYS = [['1', ''], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', ''], ['0', '+'], ['#', '']], pad = '';
  function when(t) { var d = new Date(t), n = new Date(); return d.toDateString() === n.toDateString() ? d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase() : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }
  function find(id) { return people().filter(function (p) { return String(p.id) === String(id); })[0]; }

  /* leaving the phone: only ever the phone's own apps, and only when you ask. F3 shows it went */
  function handTo(url, what, where) {
    if (GJ.f3 && GJ.f3.out) GJ.f3.out(what, where);
    var a = document.createElement('a'); a.href = url; a.rel = 'noopener'; document.body.appendChild(a); try { a.click(); } catch (e) {} a.remove();
  }
  function remember(name, tel, how) { var R = sget(RKEY, []); R.unshift({ name: name, tel: tel, how: how, t: Date.now() }); sput(RKEY, R.slice(0, 60)); }
  function call(p) {
    if (!p) return; hap('commit');
    if (p.example) { say(p.name + ' is an example · add someone real to call'); return; }
    if (!p.tel) { info(p.id); say('no number yet for ' + p.name); return; }
    remember(p.name, p.tel, 'call'); handTo('tel:' + digits(p.tel), 'a call', 'the phone\'s own dialer · ' + p.name); say('calling ' + p.name + ' · on the phone\'s own dialer');
    if (tab === 'recents') paint();
  }
  function dialNumber(n) { if (!digits(n)) return; remember(n, n, 'call'); handTo('tel:' + digits(n), 'a call', 'the phone\'s own dialer'); say('calling ' + n + ' · on the phone\'s own dialer'); }

  /* hold a name: hand off to the phone's own Messages or FaceTime — they send, oz never does */
  function handoff(p) {
    if (!p) return; hap('tick');
    sheet.innerHTML = '<h3 class="jul">' + esc(p.name) + (p.example ? ' · example' : '') + '</h3><p class="ph-sub">hand off · the app opens, you send</p>' +
      (p.example ? '<p class="ph-none">examples don\'t leave the phone</p>' :
      '<button type="button" class="ph-wide" data-h="sms">message · the phone\'s Messages</button><button type="button" class="ph-wide" data-h="facetime">FaceTime</button><button type="button" class="ph-wide" data-h="facetime-audio">FaceTime audio</button>') +
      '<button type="button" class="ph-wide ph-soft" data-h="oz">write in oz Messages · stays on this phone</button><button type="button" class="ph-wide ph-soft" data-h="x">cancel</button>';
    sheet.dataset.id = p.id; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); var f = sheet.querySelector('button'); if (f) f.focus();
  }
  function closeSheet() { sheet.classList.remove('in'); setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260); }
  function info(id) {
    var p = id ? find(id) : null, isNew = !p;
    sheet.innerHTML = '<h3 class="jul">' + (isNew ? 'add someone' : esc(p.name)) + '</h3>' +
      (p && p.example ? '<p class="ph-none">an example · add someone real and the examples go away</p><button type="button" class="ph-wide ph-soft" data-e="hideex">hide the examples</button>' :
      '<label class="ph-f">name<input class="ph-n" autocomplete="off" value="' + esc(p ? p.name : '') + '"></label><label class="ph-f">number<input class="ph-t" type="tel" inputmode="tel" autocomplete="off" value="' + esc(p ? p.tel : '') + '"></label>' +
      '<label class="ph-f ph-sw"><span>close circle · in favourites</span><input type="checkbox" class="ph-c"' + (!p || p.close ? ' checked' : '') + '></label>' +
      '<button type="button" class="ph-wide" data-e="save">' + (isNew ? 'add' : 'save') + '</button>' + (isNew ? '' : '<button type="button" class="ph-wide ph-soft" data-e="del">remove from this phone</button>')) +
      '<button type="button" class="ph-wide ph-soft" data-e="x">cancel</button>';
    sheet.dataset.id = p ? p.id : ''; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); var n = sheet.querySelector('.ph-n'); if (n && isNew) n.focus();
  }
  sheet.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var p = find(sheet.dataset.id);
    if (b.dataset.h) { var h = b.dataset.h; closeSheet(); if (!p || h === 'x') return;
      if (h === 'oz') { if (GJ.messages && GJ.messages.draft) GJ.messages.draft(p.name, ''); return; }
      if (p.example || !p.tel) { say(p.example ? 'an example · nothing leaves' : 'no number yet'); return; }
      remember(p.name, p.tel, h === 'sms' ? 'message' : h === 'facetime' ? 'FaceTime' : 'FaceTime audio');
      handTo((h === 'sms' ? 'sms:' : h + ':') + digits(p.tel), h === 'sms' ? 'a message, handed off' : 'a FaceTime call', (h === 'sms' ? 'the phone\'s Messages' : 'FaceTime') + ' · ' + p.name); return; }
    var a = b.dataset.e; if (!a) return;
    if (a === 'x') { closeSheet(); return; }
    if (a === 'hideex') { sput(EXKEY, false); closeSheet(); paint(); return; }
    if (a === 'save') {
      var nm = sheet.querySelector('.ph-n').value.trim(), tl = sheet.querySelector('.ph-t').value.trim(), cl = sheet.querySelector('.ph-c').checked; if (!nm) { sheet.querySelector('.ph-n').focus(); return; }
      if (p && p.mine && GJ.circle.update) GJ.circle.update(p.id, { name: nm, tel: tl, depth: cl ? 'near' : 'mid' });
      else if (GJ.circle && GJ.circle.add) GJ.circle.add({ id: 'p' + Date.now(), name: nm, tel: tl, depth: cl ? 'near' : 'mid', x: .2 + Math.random() * .6, y: .25 + Math.random() * .5 });
      hap('commit'); closeSheet(); paint(); return; }
    if (a === 'del' && p && p.mine && GJ.circle.remove) { GJ.circle.remove(p.id); closeSheet(); paint(); }
  });

  /* touch: a tap calls (as Favourites does), a hold hands off, i is the details */
  var holdT = 0, held = false;
  body.addEventListener('pointerdown', function (e) { var b = e.target.closest('[data-call]'); held = false; if (!b) return; clearTimeout(holdT); holdT = setTimeout(function () { held = true; handoff(find(b.dataset.call)); }, 520); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { body.addEventListener(t, function () { clearTimeout(holdT); }); });
  body.addEventListener('contextmenu', function (e) { if (e.target.closest('[data-call]')) e.preventDefault(); });
  body.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; if (held) { held = false; return; }
    if (b.dataset.call) return call(find(b.dataset.call));
    if (b.dataset.info) return info(b.dataset.info);
    if (b.dataset.redial) { var p = people().filter(function (x) { return digits(x.tel) === digits(b.dataset.redial); })[0]; return p ? call(p) : dialNumber(b.dataset.redial); }
    if (b.dataset.dial) return dialNumber(b.dataset.dial);
    if (b.dataset.k) { pad = (pad + b.dataset.k).slice(0, 20); hap('tick'); var n = body.querySelector('.ph-num'); if (n) n.textContent = pad; return; }
    var a = b.dataset.a;
    if (a === 'padback') { pad = pad.slice(0, -1); var n2 = body.querySelector('.ph-num'); if (n2) n2.textContent = pad; return; }
    if (a === 'padcall') { if (pad) dialNumber(pad); return; }
    if (a === 'add') return info(null);
    if (a === 'clear') { sput(RKEY, []); paint(); return; }
    if (a === 'circle') { if (GJ.circle && GJ.circle.open) GJ.circle.open(); return; }
  });
  el.querySelector('.ph-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; typed = ''; q.value = ''; hap('tick'); paint(); });
  q.addEventListener('input', function () { typed = q.value.trim(); paint(); });
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); var first = body.querySelector('[data-call], [data-dial]'); if (first) first.click(); }
    if (e.key === 'Escape' && q.value) { e.stopPropagation(); q.value = ''; typed = ''; paint(); }
  });
  el.querySelector('.ph-mic').addEventListener('click', function () {   // speech is the keyboard's own: no recording here, nothing leaves from oz
    hint.textContent = 'say a name with the keyboard\'s mic · then return'; hint.hidden = false; q.focus(); setTimeout(function () { hint.hidden = true; }, 4200);
  });

  function open() { if (on) return; on = true; tab = 'fav'; typed = ''; q.value = ''; pad = ''; paint(); el.hidden = false; html.classList.add('phoning'); requestAnimationFrame(function () { el.classList.add('in'); }); hap('commit'); }
  function close() { if (!on) return; on = false; closeSheet(); q.blur(); el.classList.remove('in'); html.classList.remove('phoning'); setTimeout(function () { if (!on) el.hidden = true; }, 380); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (on) { if (!sheet.hidden) { closeSheet(); return true; } if (typed) { q.value = ''; typed = ''; paint(); return true; } close(); return true; } return ca0.apply(this, arguments); }; }
  GJ.phone = { open: open, close: close, isOpen: function () { return on; }, people: people,
    call: function (name) { var p = people().filter(function (x) { return x.name.toLowerCase() === String(name).toLowerCase(); })[0]; call(p); return !!p; },
    add: function (o) { if (GJ.circle && GJ.circle.add) GJ.circle.add({ id: 'p' + Date.now(), name: o.name, tel: o.tel || '', depth: o.close === false ? 'mid' : 'near', x: .5, y: .5 }); if (on) paint(); } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'phone', name: 'phone', sub: 'your close circle · the phone\'s own dialer', cl: 'people', open: open });
})(window);
