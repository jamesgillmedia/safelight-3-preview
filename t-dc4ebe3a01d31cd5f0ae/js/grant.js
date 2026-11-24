/* grant · the Grant room, as Gill asked for it on 23 Nov 2026 (the later brief). One big working copy, in his writing,
   that saves with every keystroke and is never replaced unless he chooses. Reference sits in its own drawer (his writing
   sent in, older drafts, the paths, practice, suggestions), marked as reference and never edited in place: tap a line,
   "move to main", and it drops in at the cursor. The room may offer a draft for an empty section from his reference
   writing, and an update when he adds writing; every offer sits next to his text and waits for a yes. Every yes keeps a
   version, and "your earlier writing" sits right under the box. Words trimmed to fit a limit go to "find a home", with
   the section they'd suit best. The path: gather, then an edit pass, then a final read. Send to agent opens the phone's
   share sheet, or shows the whole bundle with a big copy button. Nothing is submitted: he enters it in the funder's portal.
   The writing helper (oz.private grantAssist) stays a labelled preview stub; it sends nothing and writes nothing.
     GJ.grant.open() · close() · isOpen() · go(section) · step(name) · state() · write(id, text) · addWriting(text) · reset() */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, KEY = 'gj-grant', P = G.oz && G.oz.private;
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 2200); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Number(x).toLocaleString('en-CA'); }
  function len(t) { return Array.from(String(t || '')).length; }
  function uid() { return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function when(t) { var d = new Date(t); return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function sentences(t) { return String(t || '').split(/(?<=[.!?])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean); }

  /* ——— CKS (Canada Council for the Arts), from Gill's briefs: the form, the limits, the deadline, the direction. No draft text ——— */
  function cks() {
    return {
      v: 2, id: 'cks', title: 'Permanent Impermanence', short: 'CKS', funder: 'Canada Council for the Arts',
      program: 'Creating, Knowing and Sharing: The Arts and Cultures of First Nations, Inuit and Métis Peoples · short-term projects',
      deadline: '2026-11-26T04:59:00Z', deadlineSaid: 'Wednesday 25 November 2026, 8:59 p.m. Pacific (11:59 p.m. Eastern)',
      criteria: [{ name: 'relevance', w: '40%' }, { name: 'impact', w: '40%' }, { name: 'feasibility', w: '20%' }, { name: 'protocols', w: 'pass or fail' }],
      protocol: ['Cree-Métis, Two-Spirit and he/him are right as written', 'the gaffer is credited Jett Pace'],
      direction: ['title · Permanent Impermanence', 'window · 1 April 2027 to 31 January 2028', 'this grant holds the place-work, including light, composition and framing; a separate ISO application holds film, projection and spatial sound',
        'an existing space, cedar and light · a place that feels as if it was always there', 'principles kept, names of the earlier concept taken out · art-forward', 'profile type · Artist, not Emerging',
        'Vancouver site types: an underused plaza, a lit underpass, a park edge · no locked address', 'the form of the work stays open'],
      sections: [
        { id: 'name', name: 'application name', limit: 80, text: 'Permanent Impermanence' },
        { id: 'summary', name: 'one-sentence summary', short: 'summary', limit: 255, text: '' },
        { id: 'types', name: 'type of activities', short: 'activities', text: '' },
        { id: 'describe', name: 'describe your project', short: 'describe', limit: 4000, text: '' },
        { id: 'why', name: 'why this project, and why now', short: 'why now', limit: 2500, text: '' },
        { id: 'impact', name: 'impact', limit: 2000, text: '' },
        { id: 'capacity', name: 'capacity and experience', short: 'capacity', limit: 2500, text: '' },
        { id: 'budget', name: 'budget', text: '' },
        { id: 'timeline', name: 'timeline', text: '' },
        { id: 'tk', name: 'traditional knowledge and cultural intellectual property', short: 'traditional knowledge', text: '' },
        { id: 'collab', name: 'collaborators', text: '' },
        { id: 'support', name: 'support material', short: 'support', text: '' }
      ],
      refs: [   // the paths: what each choice means, as reference (set aside when not taken)
        { id: 'p1', kind: 'path', title: 'what this grant holds', text: 'The place-work, including light, composition and framing. Film and projection stay in the ISO application.', aside: false },
        { id: 'p2', kind: 'path', title: 'what this grant holds · not taken', text: 'The place-work only; light and framing would sit with the ISO application.', aside: true },
        { id: 'p3', kind: 'path', title: 'how the work meets the place', text: 'An existing space, cedar and light: a place that feels as if it was always there. Describe leads with the place.', aside: false },
        { id: 'p4', kind: 'path', title: 'how the work meets the place · set aside', text: 'A fixed spatial build: planes, panels, forced perspective.', aside: true },
        { id: 'p5', kind: 'path', title: 'the earlier concept · set aside', text: 'Name the earlier public-art concept and point back to it.', aside: true }
      ],
      versions: {}, offers: [], homes: {}, step: 'gather', cur: 'summary', log: []
    };
  }
  var WORDS = {
    summary: ['permanent impermanence', 'place', 'light', 'cedar', 'vancouver', 'site'],
    types: ['creating', 'sharing', 'knowing'],
    describe: ['cedar', 'light', 'space', 'place', 'site', 'plaza', 'underpass', 'park', 'composition', 'framing', 'walk', 'step', 'form', 'night', 'shadow', 'install'],
    why: ['now', 'why', 'moment', 'time', 'today', 'started', 'noticed', 'years', 'history', 'return', 'city', 'change'],
    impact: ['impact', 'community', 'audience', 'people', 'public', 'youth', 'visitors', 'nations', 'remain', 'reach', 'share'],
    capacity: ['experience', 'worked', 'practice', 'career', 'trained', 'projects', 'cinematograph', 'made', 'led', 'skills', 'artist'],
    budget: ['$', 'budget', 'cost', 'fee', 'fees', 'pay', 'materials', 'rental', 'honorarium', 'insurance', 'permit'],
    timeline: ['april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'january', 'month', 'week', 'phase', '2027', '2028', 'opening'],
    tk: ['protocol', 'protocols', 'elder', 'elders', 'knowledge', 'ceremony', 'permission', 'consent', 'territory', 'nation', 'cultural', 'traditional'],
    collab: ['partner', 'partners', 'collaborator', 'collaborators', 'team', 'crew', 'invited', 'confirmed', 'gaffer'],
    support: ['link', 'reel', 'image', 'images', 'sample', 'portfolio', 'photograph', 'drawing']
  };
  /* on-device notes for the edit pass: things the direction already settled. They are notes, never rewrites */
  var NOTES = [
    { re: /\b(film|films|filmed|filming|projection|projections|projector|projected|video|spatial sound)\b/i, secs: ['summary', 'describe', 'why', 'impact', 'budget', 'timeline'], why: 'the ISO application holds film, projection and spatial sound, not this grant' },
    { re: /\b(planes?|panels?|forced perspective)\b/i, secs: ['summary', 'describe', 'impact', 'budget', 'timeline', 'capacity'], why: 'planes, panels and forced perspective were set aside for an existing space, cedar and light' },
    { re: /\bemerging\b/i, secs: null, why: 'your profile type is Artist, not Emerging' },
    { re: /\b(2026|2029|2030)\b/, secs: ['timeline', 'budget'], why: 'the window is 1 April 2027 to 31 January 2028' }
  ];

  var D = null, S = { on: false, sheet: null, open: {}, caret: null, pick: null };
  function load() {
    var raw = null; try { raw = JSON.parse(GJ.settings.getItem(KEY) || 'null'); } catch (e) {}
    if (raw && raw.v === 2) { D = raw; return; }
    D = cks();
    if (raw && raw.v === 1 && Array.isArray(raw.sections)) {   // the 23 Nov room: his writing comes across as the working copy, untouched
      raw.sections.forEach(function (s) { var m = sec(s.id); if (m && String(s.text || '').trim()) m.text = s.text; });
      Object.keys(raw.versions || {}).forEach(function (k) { D.versions[k] = (raw.versions[k] || []).map(function (v) { return { t: v.t, text: v.text, why: v.label || 'earlier' }; }); });
      if (raw.stream && String(raw.stream.text || '').trim()) D.refs.unshift({ id: uid(), kind: 'writing', title: 'free writing, from the earlier room', text: raw.stream.text, t: Date.now() });
      logIt('carried the earlier room\'s writing across, untouched');
    }
    saveNow();
  }
  function saveNow() { try { GJ.settings.setItem(KEY, JSON.stringify(D)); } catch (e) {} mirror(); }
  var mirT = 0; function mirror() { clearTimeout(mirT); mirT = setTimeout(function () { if (GJ.notes && GJ.notes.thread) GJ.notes.thread('grant:' + D.id + ':draft', 'grant', D.title + ' · ' + D.short + ' · the working copy\n\n' + bundleText(false)); }, 1200); }   // a copy in Notes, on this phone
  function sec(id) { return D.sections.filter(function (s) { return s.id === id; })[0]; }
  function sname(id) { var s = sec(id); return s ? (s.short || s.name) : id; }
  function logIt(what) { D.log.unshift({ t: Date.now(), what: what }); D.log = D.log.slice(0, 200); }
  function keep(id, why) { var s = sec(id); if (!s || !String(s.text || '').trim()) return; var V = D.versions[id] = D.versions[id] || []; if (V[0] && V[0].text === s.text) return; V.unshift({ t: Date.now(), text: s.text, why: why || 'kept' }); D.versions[id] = V.slice(0, 40); }
  function setText(id, text, why) { var s = sec(id); keep(id, why); s.text = text; s.seed = false; saveNow(); }

  /* ——— the deadline, in this phone's own time, and the funder's words ——— */
  function due() {
    var t = Date.parse(D.deadline), left = t - Date.now(), d = new Date(t);
    var local = d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    var h = Math.floor(left / 36e5), dd = Math.floor(h / 24);
    return { local: local, left: left <= 0 ? 'the deadline has passed' : dd ? dd + (dd === 1 ? ' day ' : ' days ') + (h % 24) + ' h left' : h ? h + ' h ' + Math.floor(left % 36e5 / 6e4) + ' min left' : Math.max(1, Math.floor(left / 6e4)) + ' min left', near: left > 0 && left < 864e5 };
  }

  /* ——— his reference writing, line by line, and where each line would sit ——— */
  function refLines(r) { return sentences(r.text); }
  function score(line, id) { var low = ' ' + line.toLowerCase() + ' ', k = 0; (WORDS[id] || []).forEach(function (w) { if (w === '$' ? low.indexOf('$') >= 0 : new RegExp('(^|[^a-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(low)) k++; }); return k; }
  function bestHome(line, not) { var best = null, k = 0; D.sections.forEach(function (s) { if (s.id === not || s.id === 'name' || s.id === 'types') return; var v = score(line, s.id); if (v > k) { k = v; best = s.id; } }); return best; }
  function writing() { return D.refs.filter(function (r) { return r.kind === 'writing' || r.kind === 'draft'; }); }
  function fillFor(id) {   // an empty section, from his reference writing only: his own sentences, in his order, up to the limit
    var s = sec(id), lim = s.limit || 2500, out = [], used = 0, seen = {};
    writing().forEach(function (r) {
      if (r.head && r.head !== id) return;
      refLines(r).forEach(function (ln) { if (seen[ln]) return; if (!(r.head === id || score(ln, id) >= 2 || (score(ln, id) >= 1 && bestHome(ln) === id))) return; if (r.head !== id && used + len(ln) + 1 > lim) return; out.push(ln); used += len(ln) + 1; seen[ln] = 1; });
    });
    return out.join(' ');
  }
  function offer(o) {   // one waiting offer per section and kind: a newer one replaces the older (which goes to set aside)
    D.offers.forEach(function (x) { if (x.state === 'open' && x.sec === o.sec && x.kind === o.kind) x.state = 'aside'; });
    o.id = uid(); o.t = Date.now(); o.state = 'open'; o.base = sec(o.sec).text; D.offers.unshift(o); D.offers = D.offers.slice(0, 120);
  }
  function openOffers(id) { return D.offers.filter(function (o) { return o.state === 'open' && o.sec === id; }); }
  function gatherOffers() {   // empty sections: a draft from his writing, offered. Nothing he wrote is ever touched
    var k = 0; D.sections.forEach(function (s) { if (s.id === 'name' || s.id === 'types' || String(s.text || '').trim()) return; var t = fillFor(s.id); if (!t) return;
      var cur = openOffers(s.id).filter(function (o) { return o.kind === 'fill'; })[0]; if (cur && cur.text === t) return; offer({ sec: s.id, kind: 'fill', text: t, why: 'a draft for this empty section, from your reference writing' }); k++; });
    return k;
  }
  function addWriting(text, title) {   // new writing in: into reference; then an updated version is offered where it fits
    text = String(text || '').trim(); if (!text) return 0;
    var parts = headingSplit(text) || [{ text: text, head: null }], touched = {};
    parts.forEach(function (p) { var r = { id: uid(), kind: 'writing', title: title || (p.head ? 'your writing · ' + sname(p.head) : 'your writing · ' + when(Date.now())), text: p.text.trim(), head: p.head || null, t: Date.now() }; D.refs.unshift(r);
      if (p.head) touched[p.head] = (touched[p.head] || []).concat(refLines(r)); else refLines(r).forEach(function (ln) { var h = bestHome(ln); if (h) touched[h] = (touched[h] || []).concat([ln]); }); });
    Object.keys(touched).forEach(function (id) {
      var s = sec(id); if (!s) return; var mine = String(s.text || '').trim();
      if (!mine) { var t = fillFor(id); if (t) offer({ sec: id, kind: 'fill', text: t, why: 'a draft for this empty section, from your reference writing' }); return; }
      var add = touched[id].filter(function (ln) { return mine.indexOf(ln) < 0; }); if (!add.length) return;
      offer({ sec: id, kind: 'update', text: mine.replace(/\s+$/, '') + '\n\n' + add.join(' '), why: 'your new writing, added after what is there · nothing taken out' });
    });
    logIt('added writing to reference'); saveNow(); return Object.keys(touched).length;
  }
  function headingSplit(text) {   // writing pasted with the portal's own headings: split on them
    var heads = D.sections.map(function (s) { return [s.id, s.name]; }).concat([['why', 'why this project and why now'], ['tk', 'traditional knowledge'], ['support', 'support material'], ['summary', 'summary'], ['describe', 'describe'], ['capacity', 'capacity']]);
    var lines = String(text).split('\n'), out = [], cur = null;
    lines.forEach(function (ln) {
      var h = ln.trim().toLowerCase().replace(/[:#*]+/g, '').trim(), m = heads.filter(function (x) { return h && h.length < 70 && (h === x[1] || h.indexOf(x[1]) === 0); })[0];
      if (m) { cur = { text: '', head: m[0] }; out.push(cur); } else if (cur) cur.text += (cur.text ? '\n' : '') + ln; else if (ln.trim()) { cur = { text: ln, head: null }; out.push(cur); }
    });
    out = out.filter(function (p) { return p.text.trim(); });
    return out.some(function (p) { return p.head; }) ? out : null;
  }

  /* ——— the edit pass: checks on this phone, each one an offer beside his text ——— */
  function tighten(t) {
    return String(t).replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').replace(/\bin order to\b/gi, 'to').replace(/\b(very|really|just|quite) (?=[a-z])/gi, '').replace(/\b(\w+) \1\b/gi, '$1').replace(/\s+([,.;:])/g, '$1').trim();
  }
  function fit(t, lim) {   // whole sentences up to the limit; the rest are kept to find a home
    var keepS = [], rest = [], used = 0; sentences(t).forEach(function (s) { if (!rest.length && used + len(s) + (keepS.length ? 1 : 0) <= lim) { keepS.push(s); used += len(s) + (keepS.length > 1 ? 1 : 0); } else rest.push(s); });
    return { text: keepS.join(' '), rest: rest };
  }
  function check(id) {
    var s = sec(id), t = String(s.text || ''), k = 0; if (!t.trim()) return 0;
    var ti = tighten(t); if (ti !== t.trim() && len(t) - len(ti) >= 3) { offer({ sec: id, kind: 'tighten', text: ti, why: 'tighter · ' + (len(t) - len(ti)) + ' characters lighter, nothing else changed' }); k++; }
    if (/\bjet+\s+pa(?!ce\b)[a-z]*\b|\bjet\s+pace\b/i.test(t)) { offer({ sec: id, kind: 'spell', text: t.replace(/\bjet+\s+pa[a-z]*\b/gi, 'Jett Pace'), why: 'the gaffer\'s name, as he spells it: Jett Pace' }); k++; }
    if (s.limit && len(t) > s.limit) { var f = fit(t, s.limit); offer({ sec: id, kind: 'fit', text: f.text, rest: f.rest, why: 'fits ' + n(s.limit) + ' · ' + f.rest.length + (f.rest.length === 1 ? ' sentence goes' : ' sentences go') + ' to find a home, not away' }); k++; }
    saveNow(); return k;
  }
  function notes(id) { var s = sec(id), out = []; sentences(s.text).forEach(function (ln) { NOTES.forEach(function (x) { if ((!x.secs || x.secs.indexOf(id) >= 0) && x.re.test(ln)) out.push({ line: ln, why: x.why }); }); }); return out; }

  /* ——— the room ——— */
  var el = document.createElement('section'); el.id = 'grant'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'grant'); el.hidden = true;
  el.innerHTML =
    '<header class="g2-head"><button type="button" class="g2-about-b" aria-expanded="false"><span class="g2-t"></span><span class="g2-due"></span></button><div class="g2-about" hidden></div></header>' +
    '<nav class="g2-path" role="tablist" aria-label="the path">' + [['gather', 'gather'], ['edit', 'edit pass'], ['final', 'final read']].map(function (p) { return '<button type="button" role="tab" data-step="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</nav>' +
    '<div class="g2-secs" role="tablist" aria-label="sections"></div>' +
    '<div class="g2-body"></div>' +
    '<footer class="g2-foot"></footer><div class="g2-sheet" role="dialog" hidden></div>';
  document.body.appendChild(el);
  function $(q) { return el.querySelector(q); }
  var body = $('.g2-body'), sheet = $('.g2-sheet');

  function paintHead() {
    var d = due(); $('.g2-t').textContent = D.title + ' · ' + D.short; $('.g2-due').textContent = 'due ' + d.local + ' here · ' + d.left; $('.g2-due').classList.toggle('near', d.near);
    $('.g2-about').innerHTML = '<p>' + esc(D.funder) + ' · ' + esc(D.program) + '</p><p>due ' + esc(D.deadlineSaid) + '</p>' +
      '<h4>how it is scored</h4><p>' + D.criteria.map(function (c) { return esc(c.name) + ' ' + esc(c.w); }).join(' · ') + '</p>' +
      '<h4>protocol</h4>' + D.protocol.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
      '<h4>the current direction</h4>' + D.direction.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
      '<p class="g2-quiet">nothing is submitted from here · you enter it in the funder\'s portal</p>';
  }
  function paintPath() { Array.prototype.forEach.call(el.querySelectorAll('.g2-path [data-step]'), function (b) { var c = b.dataset.step === D.step; b.classList.toggle('on', c); b.setAttribute('aria-selected', String(c)); }); }
  function paintSecs() {
    $('.g2-secs').innerHTML = D.sections.map(function (s) {
      var c = len(s.text), over = s.limit && c > s.limit, waits = openOffers(s.id).length, homes = (D.homes[s.id] || []).length;
      return '<button type="button" role="tab" data-sec="' + s.id + '" aria-selected="' + (s.id === D.cur) + '" class="' + (s.id === D.cur ? 'on' : '') + (over ? ' over' : '') + (c ? '' : ' empty') + '">' +
        '<span>' + esc(s.short || s.name) + '</span><em>' + (s.limit ? n(c) + ' / ' + n(s.limit) : c ? n(c) : 'empty') + (waits ? ' · ' + waits + ' waiting' : '') + (homes ? ' · ' + homes + ' to place' : '') + '</em></button>';
    }).join('');
  }
  function countLine(s) { var c = len(s.text); return s.limit ? n(c) + ' / ' + n(s.limit) + (c > s.limit ? ' · over by ' + n(c - s.limit) + (D.step === 'edit' ? '' : ' · the edit pass can fit it, and keep the rest') : '') : n(c) + ' characters'; }
  function paintWrite() {
    var s = sec(D.cur), V = D.versions[s.id] || [], O = openOffers(s.id), H = D.homes[s.id] || [], N = D.step === 'edit' ? notes(s.id) : [];
    var h = '<label class="g2-lab" for="g2-box">' + esc(s.name) + '</label>' +
      '<textarea id="g2-box" class="g2-box" spellcheck="true" placeholder="start writing, or move a line from reference">' + esc(s.text || '') + '</textarea>' +
      '<p class="g2-count' + (s.limit && len(s.text) > s.limit ? ' over' : '') + '" aria-live="polite">' + countLine(s) + '</p>';
    if (V.length) h += '<div class="g2-earlier"><button type="button" class="g2-link" data-a="earlier" aria-expanded="' + !!S.open.earlier + '">your earlier writing · ' + V.length + '</button>' +
      (S.open.earlier ? V.slice(0, 12).map(function (v, i) { return '<div class="g2-ver"><em>' + when(v.t) + ' · ' + esc(v.why) + '</em><p>' + esc(v.text.slice(0, 280)) + (v.text.length > 280 ? '…' : '') + '</p><button type="button" class="g2-small" data-back="' + i + '">use this · now is kept too</button></div>'; }).join('') : '') + '</div>';
    if (O.length) h += O.map(offerCard).join('');
    if (N.length) h += '<div class="g2-notes"><h4>a few notes · on this phone</h4>' + N.map(function (x) { return '<p><q>' + esc(x.line.slice(0, 140)) + '</q><span>' + esc(x.why) + '</span></p>'; }).join('') + '</div>';
    if (H.length) h += '<div class="g2-homes"><h4>find a home · ' + H.length + '</h4>' + H.map(function (x) {
      return '<div class="g2-home"><p>' + esc(x.text) + '</p><div>' + (x.to ? '<button type="button" class="g2-small" data-home="' + x.id + '" data-to="' + x.to + '">place in ' + esc(sname(x.to)) + '</button>' : '') +
        '<button type="button" class="g2-small g2-soft" data-homeother="' + x.id + '">somewhere else</button></div></div>'; }).join('') + '</div>';
    body.innerHTML = h; var box = $('.g2-box');
    if (S.caret != null && S.caretSec === s.id) { try { box.setSelectionRange(S.caret, S.caret); } catch (e) {} }
  }
  function offerCard(o) {
    var s = sec(o.sec), mine = String(s.text || ''), lab = { fill: 'a draft from your reference', update: 'an update from your new writing', tighten: 'tighter', fit: 'fit to the limit', spell: 'a name, spelled', helper: 'from the helper · preview stub' }[o.kind] || 'an offer';
    return '<div class="g2-offer" data-offer="' + o.id + '"><h4>' + esc(lab) + '</h4><p class="g2-why">' + esc(o.why) + '</p>' +
      '<div class="g2-side"><div><em>now</em><p>' + (mine ? esc(mine) : '<i>(empty)</i>') + '</p></div><div><em>offered</em><p>' + esc(o.text) + '</p></div></div>' +
      '<div class="g2-acts"><button type="button" class="g2-btn" data-take="' + o.id + '">take it</button><button type="button" class="g2-btn g2-soft" data-change="' + o.id + '">change it first</button><button type="button" class="g2-btn g2-soft" data-skip="' + o.id + '">skip</button></div></div>';
  }
  function paintFinal() {
    var h = '<h3 class="g2-fh">final read · ' + esc(D.title) + '</h3><p class="g2-quiet">read it through as the funder will. nothing here is sent or submitted</p>';
    D.sections.forEach(function (s) { var c = len(s.text), st = !c ? 'empty' : s.limit && c > s.limit ? 'over by ' + n(c - s.limit) : 'ready';
      h += '<article class="g2-read' + (st === 'ready' ? '' : ' warn') + '"><h4><button type="button" class="g2-link" data-sec="' + s.id + '" data-tostep="gather">' + esc(s.name) + '</button><span>' + (s.limit ? n(c) + ' / ' + n(s.limit) : n(c)) + ' · ' + st + '</span></h4><p>' + (c ? esc(s.text) : '<i>(empty)</i>') + '</p></article>'; });
    body.innerHTML = h;
  }
  function paintFoot() {
    var f = '<button type="button" class="g2-fb" data-a="ref">reference</button>';
    if (D.step === 'gather') f += '<button type="button" class="g2-fb" data-a="add">add writing</button>';
    if (D.step === 'edit') f += '<button type="button" class="g2-fb" data-a="check">check this section</button><button type="button" class="g2-fb g2-soft" data-a="helper">ask the helper</button>';
    f += '<button type="button" class="g2-fb" data-a="send">send to agent</button>';
    $('.g2-foot').innerHTML = f;
  }
  function paint() { paintHead(); paintPath(); paintSecs(); if (D.step === 'final') paintFinal(); else paintWrite(); paintFoot(); $('.g2-secs').hidden = D.step === 'final'; }
  function paintLive() { var s = sec(D.cur), c = $('.g2-count'); if (c) { c.textContent = countLine(s); c.classList.toggle('over', !!(s.limit && len(s.text) > s.limit)); } paintSecs(); }

  /* ——— the reference drawer: his writing, older drafts, paths, practice, suggestions. Read, pick a line, move it to main ——— */
  function paintRef() {
    var groups = [['writing', 'your writing'], ['draft', 'older drafts'], ['practice', 'practice'], ['suggestion', 'suggestions'], ['path', 'the paths']];
    var h = '<div class="g2-sh"><h3>reference</h3><button type="button" class="g2-small" data-s="add">add writing</button><button type="button" class="g2-small g2-soft" data-s="x">done</button></div>' +
      '<p class="g2-quiet">reference is read, not edited. tap a line, then "move to main" · it goes in at your cursor in ' + esc(sname(D.cur)) + '</p>';
    var live = D.refs.filter(function (r) { return !r.aside; });
    groups.forEach(function (g) { var R = live.filter(function (r) { return r.kind === g[0]; }); if (!R.length) return;
      h += '<h4>' + g[1] + '</h4>' + R.map(function (r) { return '<div class="g2-ref"><b>' + esc(r.title || g[1]) + '</b>' + refLines(r).map(function (ln, i) { var u = (r.used || {})[i];
        return '<button type="button" class="g2-line' + (u ? ' used' : '') + (S.pick && S.pick.r === r.id && S.pick.i === i ? ' on' : '') + '" data-r="' + r.id + '" data-i="' + i + '">' + esc(ln) + (u ? '<em>used · ' + esc(sname(u)) + '</em>' : '') + '</button>'; }).join('') + '</div>'; }).join(''); });
    if (!live.some(function (r) { return r.kind === 'writing' || r.kind === 'draft'; })) h += '<p class="g2-none">none of your writing is here yet · "add writing" brings it in (paste a draft; the portal\'s headings are understood)</p>';
    var aside = D.refs.filter(function (r) { return r.aside; }), skipped = D.offers.filter(function (o) { return o.state === 'skipped' || o.state === 'aside'; });
    h += '<details class="g2-aside"' + (S.open.aside ? ' open' : '') + '><summary>set aside · ' + (aside.length + skipped.length) + '</summary>' +
      aside.map(function (r) { return '<div class="g2-ref"><b>' + esc(r.title) + '</b><p>' + esc(r.text) + '</p></div>'; }).join('') +
      skipped.map(function (o) { return '<div class="g2-ref"><b>' + esc(sname(o.sec)) + ' · an offer you skipped · ' + when(o.t) + '</b><p>' + esc(o.text.slice(0, 300)) + '</p></div>'; }).join('') + '</details>';
    if (S.pick) h += '<div class="g2-move"><button type="button" class="g2-btn" data-s="move">move to main · ' + esc(sname(D.cur)) + '</button></div>';
    return h;
  }
  function openSheet(kind, h) { S.sheet = kind; sheet.innerHTML = h; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); }
  function closeSheet() { if (!S.sheet) return; S.sheet = null; S.pick = null; sheet.classList.remove('in'); setTimeout(function () { if (!S.sheet) sheet.hidden = true; }, 260); }
  function openRef() { openSheet('ref', paintRef()); }
  function openAdd() { openSheet('add', '<div class="g2-sh"><h3>add writing</h3><button type="button" class="g2-small g2-soft" data-s="x">cancel</button></div><p class="g2-quiet">paste or write. it goes into reference as your writing. where it fits a section, an update is offered beside what you have · nothing is replaced</p>' +
    '<textarea class="g2-in" aria-label="your writing" placeholder="your writing"></textarea><button type="button" class="g2-btn" data-s="addgo">add to reference</button>'); setTimeout(function () { var t = sheet.querySelector('.g2-in'); if (t) t.focus(); }, 80); }

  /* ——— send to agent: the phone's share sheet; if there is none, or it fails, the whole bundle with a big copy ——— */
  function bundleText(withRef) {
    var t = D.title + ' · ' + D.funder + ' · ' + D.short + '\n' + D.program + '\ndue ' + D.deadlineSaid + '\n\n';
    D.sections.forEach(function (s) { t += '## ' + s.name + (s.limit ? ' (' + n(len(s.text)) + ' / ' + n(s.limit) + ')' : '') + '\n' + (String(s.text || '').trim() || '(empty)') + '\n\n'; });
    var H = Object.keys(D.homes).filter(function (k) { return D.homes[k].length; }); if (H.length) { t += '## still to place\n'; H.forEach(function (k) { D.homes[k].forEach(function (x) { t += '- from ' + sname(k) + ': ' + x.text + '\n'; }); }); t += '\n'; }
    if (withRef) t += '## the current direction\n' + D.direction.map(function (x) { return '- ' + x; }).join('\n') + '\n';
    return t.trim();
  }
  function send() {
    var text = bundleText(true), title = D.title + ' · grant';
    function fallback(why) {
      openSheet('copy', '<div class="g2-sh"><h3>send to agent</h3><button type="button" class="g2-small g2-soft" data-s="x">done</button></div><p class="g2-quiet">' + esc(why) + '</p>' +
        '<button type="button" class="g2-big" data-s="copy">copy everything</button><textarea class="g2-bundle" readonly aria-label="the whole bundle">' + esc(text) + '</textarea>');
    }
    if (navigator.share) {
      navigator.share({ title: title, text: text }).then(function () { say('handed to the share sheet'); }, function (e) { if (e && e.name === 'AbortError') say('not sent · the share sheet was closed'); else fallback('the share sheet didn\'t open here · copy it instead, and paste it to your agent'); });
      return;
    }
    fallback('there is no share sheet here · copy it, and paste it to your agent');
  }
  function copy(text, btn) {
    function done(ok) { if (btn) btn.textContent = ok ? 'copied · paste it to your agent' : 'select the text below and copy it'; hap(ok ? 'commit' : 'tick'); }
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacy()); }); return; } } catch (e) {}
    done(legacy());
    function legacy() { var t = sheet.querySelector('.g2-bundle'); if (!t) return false; t.focus(); t.select(); try { return document.execCommand('copy'); } catch (e) { return false; } }
  }

  /* ——— the helper: a labelled preview stub. It sends nothing, writes nothing; F3 stays dark for it ——— */
  var asking = null;
  function helper() {
    var A = P && P.get ? P.get('grantAssist') : null, s = sec(D.cur), token = {}; asking = token;
    openSheet('helper', '<div class="g2-sh"><h3>the helper</h3><button type="button" class="g2-small g2-soft" data-s="x">close</button></div><p class="g2-hres" role="status">asking…</p>');
    var real = A && !A.stub && A.where && A.where() === 'cloud', rel = real && GJ.f3 && GJ.f3.hold ? GJ.f3.hold('grant · asked the writing helper about ' + sname(s.id), 'writing helper') : null;
    (A ? A.suggest({ section: s.id, text: s.text, ask: 'edit pass', spine: D.direction }) : Promise.resolve({ offers: [], stub: true, note: 'preview stub · there is no writing helper here, and nothing was sent' })).then(function (r) {
      if (rel) rel('answered'); if (asking !== token || S.sheet !== 'helper') return; asking = null;
      var out = sheet.querySelector('.g2-hres'), O = (r && r.offers) || [];
      O.forEach(function (o) { if (o && o.text) offer({ sec: s.id, kind: 'helper', text: String(o.text), why: (o.why || 'from the helper') + (r.stub ? ' · preview stub' : '') }); });
      if (O.length) { saveNow(); closeSheet(); paint(); return; }
      out.textContent = (r && r.note) || 'nothing offered' + (r && r.stub ? ' · preview stub' : '');
    }, function () { if (rel) rel('failed'); var out = sheet.querySelector('.g2-hres'); if (out) out.textContent = 'the helper didn\'t answer · nothing changed'; });
  }

  /* ——— taps ——— */
  el.addEventListener('input', function (e) {
    if (!e.target.classList.contains('g2-box')) return; var s = sec(D.cur); s.text = e.target.value; s.seed = false; S.caret = e.target.selectionStart; S.caretSec = s.id; saveNow(); paintLive();   // saves with every keystroke
  });
  ['keyup', 'click', 'select'].forEach(function (t) { el.addEventListener(t, function (e) { if (e.target.classList && e.target.classList.contains('g2-box')) { S.caret = e.target.selectionStart; S.caretSec = D.cur; } }); });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button, summary'); if (!b) return; var d = b.dataset;
    if (b.closest('.g2-sheet')) return sheetTap(b, d);
    if (b.classList.contains('g2-about-b')) { var a = $('.g2-about'); a.hidden = !a.hidden; b.setAttribute('aria-expanded', String(!a.hidden)); hap('tick'); return; }
    if (d.step) { D.step = d.step; if (d.step === 'gather' && gatherOffers()) say('drafts offered for empty sections · nothing you wrote was touched'); saveNow(); hap('tick'); paint(); body.scrollTop = 0; return; }
    if (d.sec) { D.cur = d.sec; if (d.tostep) D.step = d.tostep; S.open = {}; saveNow(); hap('tick'); paint(); body.scrollTop = 0; var x = el.querySelector('.g2-secs .on'); if (x && x.scrollIntoView) x.scrollIntoView({ inline: 'center', block: 'nearest' }); return; }
    if (d.a === 'earlier') { S.open.earlier = !S.open.earlier; paintWrite(); return; }
    if (d.back != null) { var V = D.versions[D.cur][+d.back]; if (!V) return; setText(D.cur, V.text, 'before stepping back'); logIt('stepped back in ' + sname(D.cur)); hap('commit'); paint(); return; }
    var o;
    if (d.take) { o = D.offers.filter(function (x) { return x.id === d.take; })[0]; if (!o) return; setText(o.sec, o.text, 'before ' + ({ fill: 'a draft', update: 'an update', tighten: 'tightening', fit: 'fitting the limit', spell: 'a spelling', helper: 'the helper' }[o.kind] || 'an offer'));
      o.state = 'taken'; if (o.kind === 'fit' && o.rest && o.rest.length) { D.homes[o.sec] = (D.homes[o.sec] || []).concat(o.rest.map(function (t) { return { id: uid(), text: t, to: bestHome(t, o.sec) }; })); }
      if (o.kind === 'fill') sec(o.sec).seed = true; logIt('took an offer in ' + sname(o.sec)); saveNow(); hap('commit'); paint(); return; }
    if (d.change) { o = D.offers.filter(function (x) { return x.id === d.change; })[0]; if (!o) return; setText(o.sec, o.text, 'before changing an offer'); o.state = 'taken'; saveNow(); paint(); var bx = $('.g2-box'); if (bx) { bx.focus(); bx.setSelectionRange(bx.value.length, bx.value.length); } return; }
    if (d.skip) { o = D.offers.filter(function (x) { return x.id === d.skip; })[0]; if (!o) return; o.state = 'skipped'; saveNow(); hap('tick'); paint(); return; }
    if (d.home) { var L = D.homes[D.cur] || [], x2 = L.filter(function (h) { return h.id === d.home; })[0]; if (!x2) return; placeHome(x2, d.to); return; }
    if (d.homeother) { var x3 = (D.homes[D.cur] || []).filter(function (h) { return h.id === d.homeother; })[0]; if (!x3) return;
      openSheet('home', '<div class="g2-sh"><h3>where does it go?</h3><button type="button" class="g2-small g2-soft" data-s="x">cancel</button></div><q class="g2-q">' + esc(x3.text) + '</q>' +
        D.sections.filter(function (s) { return s.id !== D.cur && s.id !== 'name' && s.id !== 'types'; }).map(function (s) { return '<button type="button" class="g2-wide" data-s="placeto" data-h="' + x3.id + '" data-to="' + s.id + '">' + esc(s.short || s.name) + (s.id === x3.to ? ' · suits it best' : '') + '</button>'; }).join('')); return; }
    if (d.a === 'ref') { openRef(); return; }
    if (d.a === 'add') { openAdd(); return; }
    if (d.a === 'check') { var k = check(D.cur); say(k ? k + (k === 1 ? ' thing offered' : ' things offered') + ' · beside your text' : 'nothing to change here'); paint(); return; }
    if (d.a === 'helper') { helper(); return; }
    if (d.a === 'send') { send(); return; }
  });
  function placeHome(x, to) { var t = sec(to); if (!t) return; setText(to, String(t.text || '').replace(/\s+$/, '') + (String(t.text || '').trim() ? ' ' : '') + x.text, 'before placing a line from ' + sname(D.cur)); D.homes[D.cur] = (D.homes[D.cur] || []).filter(function (h) { return h !== x; }); logIt('placed a line in ' + sname(to)); saveNow(); hap('commit'); say('placed in ' + sname(to)); paint(); }
  function sheetTap(b, d) {
    if (b.tagName === 'SUMMARY') { S.open.aside = !b.parentNode.open; return; }
    if (d.s === 'x') { closeSheet(); return; }
    if (d.s === 'add') { openAdd(); return; }
    if (d.r) { S.pick = { r: d.r, i: +d.i }; hap('tick'); var sc = sheet.scrollTop; sheet.innerHTML = paintRef(); sheet.scrollTop = sc; return; }
    if (d.s === 'move' && S.pick) {
      var r = D.refs.filter(function (x) { return x.id === S.pick.r; })[0], ln = r && refLines(r)[S.pick.i]; if (!ln) return; var s = sec(D.cur), t = String(s.text || ''), at = S.caretSec === s.id && S.caret != null ? Math.min(S.caret, t.length) : t.length;
      var before = t.slice(0, at), after = t.slice(at), pre = before && !/\s$/.test(before) ? ' ' : '', post = after && !/^\s/.test(after) ? ' ' : '';
      setText(s.id, before + pre + ln + post + after, 'before moving a line in'); S.caret = at + pre.length + len(ln); S.caretSec = s.id;
      r.used = r.used || {}; r.used[S.pick.i] = s.id; logIt('moved a line from reference to ' + sname(s.id)); saveNow(); hap('commit'); S.pick = null;
      var sc2 = sheet.scrollTop; sheet.innerHTML = paintRef(); sheet.scrollTop = sc2; paint(); say('moved to ' + sname(s.id) + ' · reference keeps it, marked used'); return; }
    if (d.s === 'addgo') { var v = sheet.querySelector('.g2-in').value; if (!v.trim()) return; var k = addWriting(v); closeSheet(); paint(); say(k ? 'in reference · ' + k + (k === 1 ? ' section has' : ' sections have') + ' an offer beside your text' : 'in reference'); return; }
    if (d.s === 'copy') { copy(bundleText(true), b); return; }
    if (d.s === 'placeto') { var x = (D.homes[D.cur] || []).filter(function (h) { return h.id === d.h; })[0]; closeSheet(); if (x) placeHome(x, d.to); return; }
  }

  var tickT = 0;
  function open(id) {
    if (S.on) return; load(); S.on = true; if (id && sec(id)) D.cur = id;
    if (D.step === 'gather') gatherOffers(); paint(); el.hidden = false; html.classList.add('granting'); requestAnimationFrame(function () { el.classList.add('in'); }); hap('commit');
    clearInterval(tickT); tickT = setInterval(function () { if (S.on) paintHead(); }, 30000);
  }
  function close() { if (!S.on) return; S.on = false; asking = null; saveNow(); clearInterval(tickT); closeSheet(); el.classList.remove('in'); html.classList.remove('granting'); setTimeout(function () { if (!S.on) el.hidden = true; }, 380); }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (S.on) { if (S.sheet) { closeSheet(); return true; } if (!$('.g2-about').hidden) { $('.g2-about').hidden = true; return true; } close(); return true; } return ca0.apply(this, arguments); }; }
  GJ.grant = { open: open, close: close, isOpen: function () { return S.on; },
    go: function (id) { if (!D) load(); if (sec(id)) D.cur = id; if (S.on) paint(); },
    step: function (s) { if (!D) load(); D.step = s; if (s === 'gather') gatherOffers(); saveNow(); if (S.on) paint(); },
    write: function (id, text) { if (!D) load(); var s = sec(id); if (s) { s.text = text; s.seed = false; saveNow(); if (S.on) paint(); } },   // for tests: as if typed
    addWriting: function (t) { if (!D) load(); var k = addWriting(t); if (S.on) paint(); return k; },
    check: function (id) { if (!D) load(); var k = check(id || D.cur); if (S.on) paint(); return k; },
    bundle: function () { if (!D) load(); return bundleText(true); },
    state: function () { if (!D) load(); return { step: D.step, cur: D.cur, due: due(), sections: D.sections.map(function (s) { return { id: s.id, chars: len(s.text), limit: s.limit || null, offers: openOffers(s.id).map(function (o) { return o.kind; }), homes: (D.homes[s.id] || []).length, versions: (D.versions[s.id] || []).length }; }), refs: D.refs.length }; },
    reset: function () { D = cks(); saveNow(); if (S.on) paint(); } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'grant', name: 'grant', sub: 'a proposal, section by section', cl: 'make', open: function () { open(); } });
})(window);
