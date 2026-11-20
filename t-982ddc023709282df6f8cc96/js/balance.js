/* tools-02 · Balance: the activities that keep an artist whole beside the work (briefs/BALANCE.md; Gill, 18 Nov —
   tapped as the next build). Sister to Friends (people), which is not built yet.
   One small constellation. Each activity is a star: bright the day it is done, slowly dimmer over three weeks.
     · Loose groups — body · voice and stage · hands and space — and REST, which counts as balance and has its own
       soft group. Beside them a quiet ring for the work itself (film, music, oz): making and living, side by side.
     · Tap a star: done today (tap again: not today). That is the whole log; nothing is required.
     · Hold a star: more — pin it for the season (three at most), open its circle (Friends, when it exists), move it
       to another group, or take it away. ADD makes one of your own. CIRCLE opens that activity's people in Friends.
     · The week at a glance: a line that says which sides were fed, and seven days of small lights a side.
     · A nudge is rare, gentle and goes with one tap: a group dim for three weeks, said once; or a full week with
       no rest — then the one nudge is to rest. Never on a day rest was taken.
   No scores, no streaks, no counts, nothing shared. The names are Gill's own from the brief, and his to change.
   Kept in this browser (localStorage gj-balance). */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var KEY = 'gj-balance', DAY = 864e5, DIM = 21;
  var GROUPS = [['body', 'body', .26, .13], ['voice', 'voice and stage', .73, .1], ['hands', 'hands and space', .27, .5], ['rest', 'rest', .73, .45], ['work', 'the work', .5, .89]];
  var SEED = [['climbing', 'body'], ['ski touring', 'body'], ['ballet', 'body'], ['singing', 'voice'], ['performing', 'voice'], ['woodwork', 'hands'], ['spatial design', 'hands'],
    ['sleep', 'rest'], ['a quiet day', 'rest'], ['outdoors with the dog', 'rest'], ['doing nothing', 'rest'], ['film', 'work'], ['music', 'work'], ['oz', 'work']];
  var OFF = [[-.1, -.02], [.09, .05], [-.06, .12], [.08, .19], [-.12, .26], [.1, .33]];   // hand-set places about a group's centre
  var RING = [[-.17, -.01], [.0, -.055], [.17, .0], [-.09, .05], [.09, .055]];
  var B = { acts: SEED.map(function (s, i) { return { id: 'a' + i, name: s[0], g: s[1], pin: false }; }), logs: {}, said: {}, n: SEED.length };
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.acts) B = Object.assign(B, s0); } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(B)); } catch (e) {} }
  var shift = 0;                                                         // (the checks move the calendar; nothing else does)
  function today() { var d = new Date(Date.now() + shift * DAY); return Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / DAY); }
  function act(id) { return B.acts.filter(function (a) { return a.id === id; })[0]; }
  function last(id) { var l = B.logs[id]; return l && l.length ? l[l.length - 1] : null; }
  function since(id) { var l = last(id); return l == null ? Infinity : today() - l; }
  function glow(id) { var d = since(id); return d <= 0 ? 1 : d === Infinity ? .16 : Math.max(.16, 1 - d / DIM * .84); }
  function fed(g, day) { return B.acts.some(function (a) { return a.g === g && (B.logs[a.id] || []).indexOf(day) >= 0; }); }
  function week(g) { var t = today(), o = []; for (var i = 6; i >= 0; i--) o.push(fed(g, t - i)); return o; }
  function groupSince(g) { var m = Infinity, any = false; B.acts.forEach(function (a) { if (a.g !== g) return; var d = since(a.id); if (d < Infinity) any = true; if (d < m) m = d; }); return any ? m : null; }
  function name(g) { return GROUPS.filter(function (x) { return x[0] === g; })[0][1]; }
  function glance() {
    var yes = [], no = []; GROUPS.forEach(function (g) { (week(g[0]).some(Boolean) ? yes : no).push(g[1]); });
    if (!yes.length) return 'nothing logged this week · tap a star when you have done it';
    return 'this week: ' + yes.join(' · ') + (no.length ? ' — quiet: ' + no.join(' · ') : ' — every side fed');
  }
  function nudge() {   // one at most, and never on a rest day
    var t = today(); if (fed('rest', t)) return null;
    var busy = 0, rested = false, i; for (i = 0; i < 7; i++) { if (fed('rest', t - i)) rested = true; if (['body', 'voice', 'hands', 'work'].some(function (g) { return fed(g, t - i); })) busy++; }
    if (!rested && busy >= 5 && B.said.rest !== t) return { k: 'rest', text: 'a full week and no rest · rest counts' };
    for (i = 0; i < 3; i++) { var g = GROUPS[i][0], d = groupSince(g); if (d != null && d >= DIM && B.said[g] !== t - d) return { k: g, mark: t - d, text: 'nothing from ' + GROUPS[i][1] + ' in ' + Math.floor(d / 7) + ' weeks' }; }
    return null;
  }

  var el = document.createElement('div'); el.id = 'bal'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'balance: the week at a glance');
  el.innerHTML = '<b class="jul">balance</b><p class="bl-say" aria-live="polite"></p><p class="bl-nudge" hidden><span></span><button data-a="dismiss">dismiss</button></p><div class="bl-field"></div>' +
    '<div class="bl-more" hidden></div><div class="bl-week" aria-label="the last seven days"></div><div class="bl-new" hidden><input type="text" maxlength="28" placeholder="an activity of your own" aria-label="the name of an activity"><div class="bl-g"></div></div>' +
    '<div class="bl-act"><button data-a="add">add</button><button data-a="close" class="on">close</button></div>';
  document.body.appendChild(el);
  var field = el.querySelector('.bl-field'), sayEl = el.querySelector('.bl-say'), nudgeEl = el.querySelector('.bl-nudge'), moreEl = el.querySelector('.bl-more'), weekEl = el.querySelector('.bl-week'), newEl = el.querySelector('.bl-new'), inp = newEl.querySelector('input');
  var on = false, sel = null, sayT = 0, curNudge = null, newG = 'body';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function say(s, ms) { sayEl.textContent = s; clearTimeout(sayT); if (ms) sayT = setTimeout(function () { sayEl.textContent = glance(); }, ms); }
  function paint() {
    var t = today(), h = '<i class="bl-ring" aria-hidden="true"></i>';
    GROUPS.forEach(function (g) {
      var mine = B.acts.filter(function (a) { return a.g === g[0]; }), places = g[0] === 'work' ? RING : OFF;
      h += '<span class="bl-gl jul' + (week(g[0]).some(Boolean) ? ' fed' : '') + '" style="left:' + g[2] * 100 + '%;top:' + (g[3] - (g[0] === 'work' ? .09 : .08)) * 100 + '%">' + g[1] + '</span>';
      mine.forEach(function (a, i) {
        var p = places[i % places.length], k = Math.floor(i / places.length) * .03, done = last(a.id) === t, d = since(a.id);
        h += '<button class="bl-s' + (done ? ' today' : '') + (a.pin ? ' pin' : '') + (g[0] === 'rest' ? ' rest' : '') + (sel === a.id ? ' sel' : '') + '" data-id="' + a.id + '" style="left:' + ((g[2] + p[0] + k) * 100).toFixed(1) + '%;top:' + ((g[3] + p[1] + k) * 100).toFixed(1) + '%;--b:' + glow(a.id).toFixed(2) + '" aria-pressed="' + done + '" aria-label="' + esc(a.name) + (done ? ', done today' : d === Infinity ? ', not yet' : ', ' + d + (d === 1 ? ' day' : ' days') + ' ago') + (a.pin ? ', a season pick' : '') + '"><i>✦</i><span>' + esc(a.name) + '</span></button>';
      });
    });
    field.innerHTML = h;
    var wd = 'SMTWTFS', w = '<span></span>', i; for (i = 6; i >= 0; i--) w += '<em' + (i ? '' : ' class="now"') + '>' + wd[new Date((t - i) * DAY + 432e5).getUTCDay()] + '</em>';
    GROUPS.forEach(function (g) { w += '<span>' + g[1] + '</span>' + week(g[0]).map(function (x) { return '<i' + (x ? ' class="on"' : '') + '></i>'; }).join(''); });
    weekEl.innerHTML = w;
    curNudge = nudge(); nudgeEl.hidden = !curNudge; if (curNudge) nudgeEl.firstChild.textContent = curNudge.text;
    var a = sel && act(sel); moreEl.hidden = !a;
    if (a) moreEl.innerHTML = '<span>' + esc(a.name) + '</span><button data-m="pin">' + (a.pin ? 'unpin' : 'pin for the season') + '</button><button data-m="circle">circle</button><button data-m="move">move</button><button data-m="remove">remove</button><button data-m="done" class="on">done</button>';
    newEl.querySelector('.bl-g').innerHTML = GROUPS.map(function (g) { return '<button data-ng="' + g[0] + '"' + (newG === g[0] ? ' class="on"' : '') + '>' + g[1] + '</button>'; }).join('') + '<button data-a="make" class="on">add it</button>';
    if (!sayT || !sayEl.textContent) sayEl.textContent = glance();
  }
  function log(id, ago) { var a = act(id); if (!a) return false; var d = today() - (ago || 0), l = B.logs[id] = (B.logs[id] || []); if (l.indexOf(d) < 0) { l.push(d); l.sort(function (x, y) { return x - y; }); B.logs[id] = l.slice(-60); } save(); if (on) paint(); return true; }
  function unlog(id) { var l = B.logs[id]; if (!l) return; var i = l.indexOf(today()); if (i >= 0) l.splice(i, 1); save(); if (on) paint(); }
  function tap(id) { var a = act(id); if (!a) return; if (last(id) === today()) { unlog(id); clearTimeout(sayT); sayT = 0; say(a.name + ' · not today', 1600); GJ.haptic.tick(); } else { log(id); clearTimeout(sayT); sayT = 0; say(a.name + ' · today', 1600); GJ.haptic.commit(); } }
  function pin(id) { var a = act(id); if (!a) return false; if (!a.pin && B.acts.filter(function (x) { return x.pin; }).length >= 3) { say('three is the season · unpin one first', 2600); GJ.haptic.edge(); return false; } a.pin = !a.pin; save(); paint(); say(a.name + (a.pin ? ' · pinned for the season' : ' · unpinned'), 1800); GJ.haptic.tick(); return true; }
  function move(id, g) { var a = act(id); if (!a) return; var ids = GROUPS.map(function (x) { return x[0]; }); a.g = g || ids[(ids.indexOf(a.g) + 1) % ids.length]; save(); paint(); say(a.name + ' · now in ' + name(a.g), 1800); GJ.haptic.tick(); }
  function remove(id) { var a = act(id); if (!a) return; B.acts = B.acts.filter(function (x) { return x.id !== id; }); delete B.logs[id]; if (sel === id) sel = null; save(); paint(); say(a.name + ' · taken away', 1800); GJ.haptic.edge(); }
  function add(nm, g) { nm = String(nm || '').trim().slice(0, 28); if (!nm) return null; var a = { id: 'a' + (B.n++), name: nm, g: g || 'body', pin: false }; B.acts.push(a); save(); if (on) paint(); return a.id; }
  function open() { if (on) return; on = true; sel = null; newEl.hidden = true; sayT = 0; html.classList.add('balancing'); paint(); GJ.haptic.tick(); }
  function close() { if (!on) return; on = false; html.classList.remove('balancing'); }
  var holdT = 0, held = false;
  field.addEventListener('pointerdown', function (e) { var b = e.target.closest('.bl-s'); if (!b) return; held = false; clearTimeout(holdT); holdT = setTimeout(function () { held = true; sel = b.dataset.id; newEl.hidden = true; paint(); GJ.haptic.commit(); }, 560); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { field.addEventListener(n, function () { clearTimeout(holdT); }); });
  field.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); var a = b.dataset.a, m = b.dataset.m;
    if (b.dataset.id) { if (held) { held = false; return; } tap(b.dataset.id); }
    else if (m === 'pin') pin(sel); else if (m === 'move') move(sel); else if (m === 'remove') remove(sel);
    else if (m === 'circle') { var ca = act(sel); if (GJ.friends && ca && ca.g !== 'rest' && ca.g !== 'work') { close(); GJ.friends.open(ca.name); } else say(ca && (ca.g === 'rest' || ca.g === 'work') ? 'a circle is for an activity · rest and the work keep none' : 'Friends is not here', 2800); }
    else if (m === 'done') { sel = null; paint(); }
    else if (b.dataset.ng) { newG = b.dataset.ng; paint(); }
    else if (a === 'add') { newEl.hidden = !newEl.hidden; sel = null; paint(); if (!newEl.hidden) try { inp.focus(); } catch (x) {} }
    else if (a === 'make') { var id = add(inp.value, newG); if (id) { inp.value = ''; newEl.hidden = true; paint(); say(act(id).name + ' · added to ' + name(newG), 2000); GJ.haptic.commit(); } else say('give it a name first', 1800); }
    else if (a === 'dismiss') { if (curNudge) { B.said[curNudge.k] = curNudge.k === 'rest' ? today() : curNudge.mark; save(); paint(); GJ.haptic.tick(); } }
    else if (a === 'close') close();
  });
  inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') newEl.querySelector('[data-a="make"]').click(); });
  GJ.balance = { open: open, close: close, isOpen: function () { return on; }, log: log, unlog: unlog, tap: tap, pin: pin, move: move, remove: remove, add: add, hold: function (id) { sel = id; if (on) paint(); },
    shift: function (d) { shift = d || 0; if (on) paint(); },
    state: function () { return { on: on, acts: B.acts.map(function (a) { return { id: a.id, name: a.name, g: a.g, pin: a.pin, since: since(a.id) === Infinity ? null : since(a.id), glow: +glow(a.id).toFixed(2) }; }), glance: glance(), nudge: nudge(), week: GROUPS.map(function (g) { return week(g[0]).map(function (x) { return x ? 1 : 0; }).join(''); }), sel: sel, pins: B.acts.filter(function (a) { return a.pin; }).length }; } };
})(window);
