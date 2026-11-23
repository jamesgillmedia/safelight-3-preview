/* grant (Grant room brief, 23 Nov 2026) · a room that holds the framework of a proposal, so the ideas and the writing grow
   Familiar first: the funder's form in section order, a character count on each, the deadline in
   local time, a notes thread beside the draft. oz on top: prompts in a voice close to his, in six layers (core,
   requirement, creative, direction, imagination, insights); explicit forks that say what each path means; a live ripple
   that marks what a choice may have moved, backwards and forwards, and never rewrites; free writing that the room maps onto
   the spine only after a yes; threads that live in Notes.
     his words .... the room never writes the proposal. It asks. It offers a change only when asked, and waits for a yes.
     on device .... everything here runs on the phone. The optional writing helper (oz.private grantAssist, a preview stub)
                    would be a cloud call: F3 is lit for as long as it is asked.
     nothing is submitted. He enters and submits in the funder's portal himself.
   The first worked example is CKS (Canada Council for the Arts), from Gill's brief: the decided items, the paths already
   taken and changed, and the open choices. None of his draft text is in this build; he brings it in himself.
     GJ.grant.open() · close() · isOpen() · state() · pick(fork, option) · map(text) · go(section) */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, KEY = 'gj-grant', P = G.oz && G.oz.private;
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 2000); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n(x) { return Number(x).toLocaleString('en-CA'); }
  function len(t) { return Array.from(String(t || '')).length; }
  function uid() { return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function when(t) { var d = new Date(t); return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }

  /* ——— the CKS worked example, from Gill's brief (23 Nov). Decisions, paths and choices only: no draft text ——— */
  function cks() {
    var T0 = Date.parse('2026-11-23T12:00:00-07:00');
    return {
      v: 1, id: 'cks', title: 'Permanent Impermanence', short: 'CKS', funder: 'Canada Council for the Arts',
      program: 'Creating, Knowing and Sharing: The Arts and Cultures of First Nations, Inuit and Métis Peoples · short-term projects',
      deadline: '2026-11-26T04:59:00Z', deadlineSaid: '25 November 2026, 8:59 p.m. Pacific (11:59 p.m. Eastern)',
      criteria: [{ id: 'rel', name: 'relevance', w: 40 }, { id: 'imp', name: 'impact', w: 40 }, { id: 'fea', name: 'feasibility', w: 20 }, { id: 'tk', name: 'protocols', w: 0, pass: true }],
      sections: [
        { id: 'name', name: 'application name', target: 80, crit: ['rel'], text: 'Permanent Impermanence' },
        { id: 'summary', name: 'one-sentence summary', short: 'summary', target: 255, crit: ['rel', 'imp'], text: '' },
        { id: 'types', name: 'type of activities', short: 'activities', kind: 'types', crit: ['rel'], text: '' },
        { id: 'describe', name: 'describe your project', short: 'describe', target: 4000, crit: ['rel', 'imp'], text: '' },
        { id: 'why', name: 'why this project, and why now', short: 'why now', target: 2500, crit: ['rel'], text: '' },
        { id: 'impact', name: 'impact', target: 2000, crit: ['imp'], text: '' },
        { id: 'capacity', name: 'capacity and experience', short: 'capacity', target: 2500, crit: ['fea'], text: '' },
        { id: 'budget', name: 'budget', crit: ['fea'], text: '' },
        { id: 'timeline', name: 'timeline', crit: ['fea'], text: '' },
        { id: 'tk', name: 'traditional knowledge and cultural intellectual property', short: 'traditional knowledge', crit: ['tk'], text: '' },
        { id: 'collab', name: 'collaborators', crit: ['fea', 'tk'], text: '' },
        { id: 'support', name: 'support material', short: 'support', kind: 'items', min: 5, max: 8, crit: ['rel', 'imp', 'fea'], text: '' }
      ],
      decided: [
        { id: 'title', text: 'title · Permanent Impermanence', secs: ['name', 'summary'] },
        { id: 'window', text: 'window · 1 April 2027 to 31 January 2028', secs: ['timeline', 'budget'] },
        { id: 'iso', text: 'a separate ISO application holds film and projection (and spatial sound). this grant holds the place-work, including light, composition and framing', secs: ['summary', 'describe', 'budget', 'timeline'] },
        { id: 'profile', text: 'profile type · Artist, not Emerging', secs: ['capacity'] },
        { id: 'sites', text: 'Vancouver site types: an underused plaza, a lit underpass, a park edge. no locked address', secs: ['describe', 'capacity', 'timeline'] },
        { id: 'form', text: 'the form of the work stays open', secs: ['describe', 'summary'] }
      ],
      forks: [
        { id: 'split', q: 'after the ISO split, what does this grant hold?', opts: [
            { id: 'place', label: 'the place-work only', means: 'light and framing would sit with the ISO application' },
            { id: 'placelight', label: 'the place-work, including light, composition and framing', means: 'film and projection stay in the ISO application. Budget and Timeline carry light, not film' }],
          pick: 'placelight', history: [{ pick: 'place', t: T0 - 6 * 864e5, note: 'the first split' }, { pick: 'placelight', t: T0 - 3 * 864e5, note: 'light and framing brought into this grant' }],
          marks: ['summary', 'describe', 'budget', 'timeline'] },
        { id: 'space', q: 'how does the work meet the place?', opts: [
            { id: 'fixed', label: 'a fixed spatial build · planes, panels, forced perspective', means: 'a built object to describe, budget and install' },
            { id: 'existing', label: 'an existing space, cedar and light · a place that feels as if it was always there', means: 'the site does the work; light and cedar shape it. Describe leads with the place' }],
          pick: 'existing', history: [{ pick: 'existing', t: T0 - 8 * 864e5, note: 'the earlier direction' }, { pick: 'fixed', t: T0 - 4 * 864e5, note: 'a more fixed approach, tried' }, { pick: 'existing', t: T0 - 2 * 864e5, note: 'set aside, back to the earlier direction' }],
          marks: ['summary', 'describe', 'impact', 'capacity', 'budget', 'timeline'] },
        { id: 'refs', q: 'the earlier public-art concept: name it, or keep its principles?', opts: [
            { id: 'named', label: 'name the earlier concept', means: 'the draft points back to it' },
            { id: 'principles', label: 'keep the principles, take out the names · art-forward', means: 'the draft stands on the work itself' }],
          pick: 'principles', history: [{ pick: 'named', t: T0 - 5 * 864e5, note: 'named references in the draft' }, { pick: 'principles', t: T0 - 1 * 864e5, note: 'names removed, principles kept, made art-forward' }],
          marks: ['summary', 'describe', 'impact', 'capacity'] },
        { id: 'knowing', q: 'is Knowing in?', open: true, opts: [
            { id: 'no', label: 'Creating and Sharing', means: 'type of activities holds two. no knowing activity to name', marks: ['types'] },
            { id: 'yes', label: 'Creating, Knowing and Sharing', means: 'a knowing activity to name in Describe and Timeline. Traditional knowledge goes deeper. it may touch Budget', marks: ['types', 'describe', 'timeline', 'tk', 'budget'] }],
          pick: null, history: [], provisional: ['types', 'tk'] },
        { id: 'site', q: 'the exact site and partners', open: true, opts: [
            { id: 'process', label: 'keep the site types, and a clear process for choosing', means: 'Feasibility rests on the process: who you ask, by when, and what decides it. no invented address', marks: ['capacity', 'timeline', 'collab'] },
            { id: 'named', label: 'name a confirmed site and partner', means: 'Describe, Capacity, Collaborators, Timeline and Budget can name it, once it is confirmed', marks: ['describe', 'capacity', 'collab', 'timeline', 'budget'] }],
          pick: null, history: [], provisional: ['describe', 'collab', 'timeline'] },
        { id: 'living', q: 'how far does the living, planted part go?', open: true, opts: [
            { id: 'none', label: 'no living part · cedar and light', means: 'Describe and Budget stay with light and cedar', marks: ['describe'] },
            { id: 'small', label: 'a small living element that changes through the window', means: 'care through the window, in Timeline and Budget', marks: ['describe', 'timeline', 'budget'] },
            { id: 'grows', label: 'a planted part that grows through the whole window, and stays', means: 'care, permissions and what remains: Timeline, Budget, Impact, Traditional knowledge', marks: ['describe', 'timeline', 'budget', 'impact', 'tk'] }],
          pick: null, history: [], provisional: ['describe', 'budget'] },
        { id: 'opening', q: 'how is the opening shared?', open: true, opts: [
            { id: 'free', label: 'a free public opening, as the CKS public sharing', means: 'name it and its dates in Timeline; Sharing and Impact can point to it', marks: ['types', 'timeline', 'impact', 'budget', 'describe'] },
            { id: 'ticketed', label: 'a ticketed opening; the CKS sharing happens another way', means: 'name the sharing separately; Budget carries the opening', marks: ['types', 'timeline', 'impact', 'budget', 'describe'] }],
          pick: null, history: [], provisional: ['timeline', 'types', 'budget', 'impact'], drifts: ['describe'], detail: 'name, dates, free or ticketed' }
      ],
      marks: [],   // seeded below from the paths already taken
      versions: {}, branches: {}, threads: {}, stream: { text: '', mapped: [] }, log: [{ t: T0, what: 'the room opened on the CKS draft' }]
    };
  }
  function seedMarks(D) {
    var why = { split: 'light and framing came into this grant after the first split. check it says place-work including light, and nothing of film or projection',
      space: 'the fixed approach (planes, panels, forced perspective) was set aside for an existing space, cedar and light. check nothing still builds planes or panels',
      refs: 'the names of the earlier concept came out; its principles stayed, art-forward. check no names are left' };
    D.forks.forEach(function (f) { if (f.open) return; f.marks.forEach(function (s) { D.marks.push({ id: uid(), sec: s, from: 'fork:' + f.id, why: why[f.id], t: f.history[f.history.length - 1].t, state: 'open', back: true }); }); });
  }

  /* ——— prompts: questions in a voice close to his, never drafts ——— */
  var PR = {
    all: [['core', 'what is permanent here, and what is meant to change?'], ['core', 'if someone walks past once, what stays with them?'], ['imagination', 'stand in the place an hour before anyone comes. what do you hear? then come back to the section you are in.']],
    name: [['requirement', 'about 80 characters. does the name hold on its own?']],
    summary: [['core', 'in one breath: what is it, where, and for whom?'], ['requirement', 'if a reader skims only this line, can they tell it is place-work with light, in Vancouver, in 2027?'], ['creative', 'what is the one image you want inside this sentence?'], ['direction', 'lead with the place, or with the light? that choice sets the tone for every section after it.']],
    types: [['requirement', 'Creating and Sharing are in. is Knowing?'], ['direction', 'pick this before Describe and Timeline: they follow it.']],
    describe: [['core', 'what happens to a person who steps into the space?'], ['requirement', 'this is read for relevance and impact. where does each one show up?'], ['creative', 'describe the cedar and the light at one hour of the day.'], ['direction', 'keep the form open, but name what will not change.'], ['imagination', 'what would the place have been if it had always been there? then come back to what you will make.']],
    why: [['core', 'why this, why you, and why now?'], ['requirement', 'what in the present (the city, the community, your practice) makes 2027 the time?'], ['creative', 'what did you notice that started this?'], ['imagination', 'if it waited ten years, what would be lost? then come back to now.']],
    impact: [['core', 'who is changed by it, and how would you know?'], ['requirement', 'impact is 40%: for you as an artist, for the community, for the arts. which of the three is strongest?'], ['direction', 'name one thing you can count and one thing you can only feel.'], ['imagination', 'a year after it ends, what is left in the place?']],
    capacity: [['core', 'what in your past work shows you can hold light and place?'], ['requirement', 'your profile type is Artist. what shows that plainly?'], ['creative', 'one project to stand for the rest: which one?'], ['direction', 'name what you will learn on this, not only what you know.']],
    budget: [['requirement', 'film and spatial sound sit in the ISO application. is anything here really theirs?'], ['core', 'where does most of the money go, and does that match what matters most?'], ['direction', 'the site is not confirmed. is there a line for the process of finding one?']],
    timeline: [['requirement', 'the window is 1 April 2027 to 31 January 2028. does every step sit inside it?'], ['core', 'when is the work first seen?'], ['direction', 'the opening is not named yet. mark it provisional, or choose now?']],
    tk: [['requirement', 'whose knowledge is in this, and how is permission asked and kept?'], ['core', 'what will you not share, and why?'], ['direction', 'if Knowing is in, this section goes deeper. who guides that?']],
    collab: [['requirement', 'who is confirmed, who is invited, and who is still a hope?'], ['core', 'what does each person bring that the work cannot do without?']],
    support: [['requirement', '5 to 8 items. which ones show the light, the place and the community?'], ['creative', 'one item that is not a film: a drawing, a test, a photograph of the light?']]
  };
  var LAYERS = ['core', 'requirement', 'creative', 'direction', 'imagination', 'practice', 'paths', 'insights'];

  /* ——— on-device checks: drift from what is decided, and plain notes on the count and the criteria ——— */
  var DRIFT = [
    { id: 'iso', re: /\b(film|films|filmed|filming|projection|projections|projector|projected|video|spatial sound)\b/i, secs: ['summary', 'describe', 'why', 'impact', 'budget', 'timeline'], why: 'the ISO application holds film and projection (and spatial sound), not this grant' },
    { id: 'space', re: /\b(planes?|panels?|forced perspective)\b/i, secs: ['summary', 'describe', 'impact', 'budget', 'timeline', 'capacity'], why: 'planes, panels and forced perspective were set aside for an existing space, cedar and light' },
    { id: 'address', re: /\b\d{2,5}\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Way|Place|Pl)\b/, secs: null, why: 'the site is not confirmed. Feasibility rests on a clear process, not an address' },
    { id: 'emerging', re: /\bemerging\b/i, secs: null, why: 'your profile type is Artist, not Emerging' },
    { id: 'window', re: /\b(2026|2029|2030)\b/, secs: ['timeline', 'budget'], why: 'the window is 1 April 2027 to 31 January 2028' }
  ];
  function sentences(t) { return String(t || '').split(/(?<=[.!?])\s+|\n+/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function drifts(sec) {
    var out = []; sentences(sec.text).forEach(function (s) { DRIFT.forEach(function (d) { if ((!d.secs || d.secs.indexOf(sec.id) >= 0) && d.re.test(s)) out.push({ rule: d.id, line: s, why: d.why }); }); });
    return out;
  }
  function crit(id) { return D.criteria.filter(function (c) { return c.id === id; })[0]; }
  function carries(sec) { return sec.crit.map(function (c) { var k = crit(c); return k.pass ? k.name + ' (pass/fail)' : k.name + ' ' + k.w + '%'; }).join(' · '); }
  function weight(sec) { return Math.max.apply(null, sec.crit.map(function (c) { return crit(c).w || 0; })); }
  function items(sec) { return String(sec.text || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean); }
  function insights(sec) {
    var L = [], c = len(sec.text), w = weight(sec), left = hoursLeft();
    if (sec.kind === 'items') { var k = items(sec).length; L.push(k < sec.min ? { k: 'thin', t: k + ' of ' + sec.min + '–' + sec.max + ' items. ' + (sec.min - k) + ' more to reach the minimum' } : k > sec.max ? { k: 'thin', t: k + ' items · the limit is ' + sec.max } : { k: 'keep', t: k + ' items · inside 5–8' }); }
    else if (sec.kind === 'types') { var kn = fork('knowing'); L.push(kn.pick ? { k: 'keep', t: 'decided: ' + opt(kn, kn.pick).label } : { k: 'thin', t: 'Knowing is still open · it decides what Describe, Timeline and Traditional knowledge need' }); }
    else if (!c) L.push({ k: 'thin', t: 'empty' + (w ? ' · it carries ' + carries(sec) : '') + (left < 72 ? ' · ' + Math.round(left) + ' hours to the deadline' : '') });
    else if (sec.target) {
      if (c > sec.target) L.push({ k: 'drift', t: 'over by ' + n(c - sec.target) + ' characters' });
      else if (c > sec.target * .9) L.push({ k: 'keep', t: 'close to the limit · ' + n(sec.target - c) + ' left' });
      else if (w >= 40 && c < sec.target * .3) L.push({ k: 'thin', t: 'thin for a ' + w + '% criterion · ' + n(c) + ' of ' + n(sec.target) });
    }
    var t = String(sec.text || '').toLowerCase();
    if (sec.id === 'describe' && /cedar/.test(t) && /light/.test(t)) L.push({ k: 'keep', t: 'cedar and light are here. that is the direction you came back to · keep it' });
    if (sec.id === 'impact' && /\d/.test(t)) L.push({ k: 'keep', t: 'there is something you can count here · good for a 40% criterion' });
    if (sec.id === 'tk' && c && !/permission|consent|protocol|elder|guid/.test(t)) L.push({ k: 'thin', t: 'protocols are pass/fail. say how permission is asked and kept' });
    var kf = fork('knowing'); if (!kf.pick && sec.id !== 'types' && /\bknowing\b/i.test(sec.text || '')) L.push({ k: 'drift', t: 'you are writing Knowing in, and that choice is still open', go: 'fork:knowing' });
    drifts(sec).forEach(function (d) { L.push({ k: 'drift', t: d.why, line: d.line }); });
    return L;
  }
  var TZ = 'America/Vancouver';
  function dueLine(d) { return 'due ' + d.local + ' Pacific · 11:59 p.m. Eastern · ' + d.left; }
  function hoursLeft() { return (Date.parse(D.deadline) - Date.now()) / 36e5; }
  function due() {
    var d = new Date(D.deadline), h = hoursLeft();
    var local = d.toLocaleString('en-CA', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(/,/g, '');
    var left = h <= 0 ? 'closed' : h < 48 ? Math.floor(h) + ' h ' + Math.floor((h % 1) * 60) + ' m left' : Math.floor(h / 24) + ' d ' + Math.floor(h % 24) + ' h left';
    return { local: local, left: left, h: h };
  }
  function nowLabel() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()) + ' Pacific'; }
    catch (e) { return new Date().toISOString(); }
  }

  /* ——— state ——— */
  var D = null;
  function load() {
    var raw = null, parsed = null;
    try { raw = GJ.settings.getItem(KEY); } catch (e) {}
    try { parsed = JSON.parse(raw || 'null'); } catch (e) { parsed = null; }
    if (parsed && Array.isArray(parsed.sections)) { if (parsed.v !== 1) parsed.v = 1; D = parsed; attachLayers(); ensureState(); return; }
    if (raw && String(raw).trim()) { D = cks(); seedMarks(D); D._unparsed = raw; attachLayers(); ensureState(); return; }
    D = cks(); seedMarks(D); attachLayers(); ensureState();
  }
  var saveT = 0;
  function saveNow() {
    clearTimeout(saveT);
    if (!D) return false;
    try { GJ.settings.setItem(KEY, JSON.stringify(D)); return true; }
    catch (e) { say('this phone could not save just now — copy your writing'); return false; }
  }
  function save() { saveNow(); }
  function flushFromDom() {
    if (!el) return;
    /* Only take text from an editor the person was just typing in. A stale textarea
       (one we have not painted yet after a change in memory) must not overwrite D. */
    Array.prototype.forEach.call(el.querySelectorAll('textarea.gr-ta[data-sec]'), function (t) {
      var s = sec(t.dataset.sec);
      if (s && (document.activeElement === t || t.dataset.dirty === '1')) s.text = t.value;
    });
    var free = el.querySelector('textarea[data-free]');
    if (free && (document.activeElement === free || free.dataset.dirty === '1')) D.stream.text = free.value;
    var tin = sheet && sheet.querySelector && sheet.querySelector('textarea.gr-tin');
    if (tin) {
      if (tin.classList.contains('gr-paste')) D.importDraft = tin.value;
      else if (S.threadKey) { D.threadDrafts = D.threadDrafts || {}; D.threadDrafts[S.threadKey] = tin.value; }
    }
  }
  function persistAll() { flushFromDom(); return saveNow(); }
  if (!G._grPersistBound) {
    G._grPersistBound = true;
    function persistQuiet() { try { if (D) persistAll(); } catch (e) {} }
    G.addEventListener('pagehide', persistQuiet);
    G.addEventListener('beforeunload', persistQuiet);
    G.addEventListener('freeze', persistQuiet);
    G.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') persistQuiet(); });
  }
  function rawLS() {
    if (G.OZ_STORE_RAW && G.OZ_STORE_RAW.get) return G.OZ_STORE_RAW;
    var S = G.Storage && G.Storage.prototype, L = S && Object.getOwnPropertyDescriptor(S, 'length');
    return {
      get: function (x) { try { return S.getItem.call(G.localStorage, x); } catch (e) { return null; } },
      key: function (i) { try { return S.key.call(G.localStorage, i); } catch (e) { return null; } },
      len: function () { try { return L.get.call(G.localStorage); } catch (e) { return 0; } }
    };
  }
  function parseGrantBlob(raw) {
    var j = null; try { j = JSON.parse(raw); } catch (e) { return null; }
    if (!j || typeof j !== 'object') return null;
    if (j['gj-grant'] != null) {
      var g0 = j['gj-grant'];
      if (typeof g0 === 'string') { try { j = JSON.parse(g0); } catch (e) { return null; } }
      else if (typeof g0 === 'object') j = g0;
    }
    if (!j || typeof j !== 'object') return null;
    var parsed = { kind: 'recovered', sections: {}, activities: j.activities || {}, drift: [], suggestions: [], note: '' };
    if (Array.isArray(j.sections)) {
      j.sections.forEach(function (s) { if (s && s.id && String(s.text || '').trim()) parsed.sections[s.id] = { id: s.id, text: String(s.text) }; });
    } else if (j.sections && typeof j.sections === 'object') {
      Object.keys(j.sections).forEach(function (id) {
        var s = j.sections[id], text = (s && typeof s === 'object') ? String(s.text || '') : String(s || '');
        if (text.trim()) parsed.sections[id] = { id: id, text: text };
      });
    }
    if (j.stream && String(j.stream.text || '').trim()) parsed.drift.push({ id: 'stream', text: String(j.stream.text) });
    if (Array.isArray(j.drift)) j.drift.forEach(function (d, i) { if (d && String(d.text || '').trim()) parsed.drift.push({ id: d.id || ('d' + i), text: String(d.text) }); });
    parsed.versions = {};
    if (j.versions && typeof j.versions === 'object') {
      Object.keys(j.versions).forEach(function (id) {
        var list = j.versions[id] || [];
        parsed.versions[id] = list.filter(function (v) { return v && String(v.text || '').trim(); }).map(function (v) {
          return { t: v.t || Date.now(), text: String(v.text), label: v.label || 'your earlier writing', aside: !!v.aside };
        });
      });
    }
    parsed.homes = [];
    if (Array.isArray(j.homes)) {
      j.homes.forEach(function (h) {
        if (h && String(h.text || '').trim()) parsed.homes.push({ id: h.id || uid(), from: h.from, text: String(h.text), suggest: h.suggest || '', t: h.t || Date.now(), placed: h.placed || null });
      });
    }
    return (Object.keys(parsed.sections).length || parsed.drift.length || Object.keys(parsed.versions).length || parsed.homes.length) ? parsed : null;
  }
  function foreignDrafts() {
    var raw = rawLS(), out = [], i, n, k, v, p, mine = (G.OZ_STORE_PREFIX || '');
    var selfKey = mine + 'gj-settings';
    try { n = raw.len(); } catch (e) { return out; }
    for (i = 0; i < n; i++) {
      try { k = raw.key(i); v = k ? raw.get(k) : null; } catch (e) { continue; }
      if (!k || v == null || v === '') continue;
      if (k === selfKey) continue;
      if (!/grant|gj-settings|cks/i.test(k)) continue;
      p = parseGrantBlob(v);
      if (p) out.push({ key: k, parsed: p });
    }
    return out;
  }
  function offerForeignDrafts() { migrateForeign(); }

  function sec(id) { return D.sections.filter(function (s) { return s.id === id; })[0]; }
  function fork(id) { return D.forks.filter(function (f) { return f.id === id; })[0]; }
  function opt(f, id) { return f.opts.filter(function (o) { return o.id === id; })[0]; }
  function sname(id) { var s = sec(id); return s ? (s.short || s.name) : id; }
  function marksFor(id) { return D.marks.filter(function (m) { return m.sec === id && m.state === 'open'; }); }
  function waitsOn(id) { return D.forks.filter(function (f) { return !f.pick && ((f.provisional || []).indexOf(id) >= 0 || (f.drifts || []).indexOf(id) >= 0); }); }
  var PATH_ST = ['open', 'leaning', 'chosen-for-now'];
  function layersData() { return (typeof window !== 'undefined' && window.OZ_CKS_LAYERS) || { practice: [], paths: [] }; }
  function practiceList() { return layersData().practice || []; }
  function pathList() {
    var raw = layersData().paths || [];
    if (!D.pathStatus) D.pathStatus = {};
    return raw.map(function (p) { var st = D.pathStatus[p.id] || p.status || 'open'; return { id: p.id, title: p.title, status: st, why: p.why, fork: p.fork, secs: p.secs || [], def: p.status || 'open' }; });
  }
  function pathOf(id) { return pathList().filter(function (p) { return p.id === id; })[0]; }
  function practiceOf(id) { return practiceList().filter(function (p) { return p.id === id; })[0]; }
  function practiceFor(secId) {
    var all = practiceList(), hit = all.filter(function (p) { return (p.secs || []).indexOf(secId) >= 0; });
    return hit.length ? hit : all;
  }
  function pathsFor(secId) {
    var all = pathList(), hit = all.filter(function (p) { return (p.secs || []).indexOf(secId) >= 0; });
    return hit.length ? hit : all;
  }
  function echoOf(p) { return (p && (p.echo || p.quote)) || ''; }
  function attachLayers() {
    if (!D.pathStatus) D.pathStatus = {};
    pathList().forEach(function (p) { if (!D.pathStatus[p.id]) D.pathStatus[p.id] = p.def || p.status || 'open'; });
  }
  function setPathStatus(id, status) {
    var p = pathOf(id); if (!p || PATH_ST.indexOf(status) < 0 || p.status === status) return false;
    D.pathStatus = D.pathStatus || {}; D.pathStatus[id] = status;
    var secs = p.secs || [];
    secs.forEach(function (s) {
      D.marks.push({ id: uid(), sec: s, from: 'path:' + id, why: 'the path “' + p.title + '” is now ' + status + '. check this section still holds it. nothing was rewritten', t: Date.now(), state: 'open', back: true });
    });
    logIt('path “' + p.title + '” is now ' + status + ' · ' + secs.length + ' section' + (secs.length === 1 ? '' : 's') + ' marked, nothing rewritten');
    saveNow();
    return true;
  }
  function logIt(what) { D.log.unshift({ t: Date.now(), what: what }); D.log = D.log.slice(0, 200); }
  function keepVersion(id, label) { var s = sec(id); if (!s || !String(s.text || '').trim()) return; var V = D.versions[id] = D.versions[id] || []; if (V[0] && V[0].text === s.text) return; V.unshift({ t: Date.now(), text: s.text, label: label || 'kept' }); D.versions[id] = V.slice(0, 30); }

  /* ——— the ripple: a pick marks, it never rewrites ——— */
  function pick(fid, oid) {
    var f = fork(fid), o = f && opt(f, oid); if (!o || f.pick === oid) return false;
    var was = f.pick ? opt(f, f.pick) : null;
    D.sections.forEach(function (s) { keepVersion(s.id, 'before "' + f.q + '" → ' + o.label); });   // the writing as it stood, to compare or step back to
    if (was) { D.branches[fid] = D.branches[fid] || {}; D.branches[fid][was.id] = { t: Date.now(), secs: D.sections.reduce(function (a, s) { a[s.id] = s.text; return a; }, {}) }; }
    f.pick = oid; f.history.push({ pick: oid, t: Date.now(), note: was ? 'changed from "' + was.label + '"' : 'picked' });
    var hit = {}; (o.marks || f.marks || []).concat(was ? (was.marks || []) : []).forEach(function (s) { hit[s] = 1; });
    Object.keys(hit).forEach(function (s) {
      var written = String(sec(s).text || '').trim();
      D.marks.push({ id: uid(), sec: s, from: 'fork:' + fid, t: Date.now(), state: 'open', back: !!written,
        why: (was ? 'you changed "' + f.q + '" from "' + was.label + '" to "' + o.label + '"' : 'you picked "' + o.label + '" for "' + f.q + '"') + '. ' + o.means + (written ? '. what is written here may have drifted' : '. this is ahead of you') });
    });
    if (fid === 'knowing') { var t = sec('types'); t.text = oid === 'yes' ? 'Creating · Knowing · Sharing' : 'Creating · Sharing'; }
    logIt((was ? 'changed' : 'picked') + ': ' + f.q + ' → ' + o.label + ' · marked ' + Object.keys(hit).map(sname).join(', '));
    saveNow(); return true;
  }

  /* ——— mapping free writing (or a pasted draft) onto the spine: suggestions only ——— */
  var WORDS = {
    name: [], summary: ['permanent impermanence'],
    types: ['creating', 'sharing', 'knowing'],
    describe: ['cedar', 'light', 'space', 'place', 'site', 'plaza', 'underpass', 'park', 'composition', 'framing', 'walk', 'step', 'form', 'night', 'shadow', 'build', 'install'],
    why: ['now', 'why', 'moment', 'time', 'today', 'started', 'noticed', 'years', 'history', 'return', 'city', 'change'],
    impact: ['impact', 'community', 'audience', 'people', 'public', 'youth', 'visitors', 'nations', 'remain', 'change', 'reach', 'share'],
    capacity: ['experience', 'worked', 'practice', 'career', 'trained', 'projects', 'cinematograph', 'made', 'led', 'skills', 'artist'],
    budget: ['$', 'budget', 'cost', 'fee', 'fees', 'pay', 'materials', 'rental', 'honorarium', 'insurance', 'permit'],
    timeline: ['april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'january', 'month', 'week', 'phase', '2027', '2028', 'opening'],
    tk: ['protocol', 'protocols', 'elder', 'elders', 'knowledge', 'ceremony', 'permission', 'consent', 'territory', 'nation', 'cultural', 'traditional'],
    collab: ['partner', 'partners', 'collaborator', 'collaborators', 'team', 'crew', 'invited', 'confirmed'],
    support: ['link', 'reel', 'image', 'images', 'sample', 'portfolio', 'photograph', 'drawing']
  };
  function headingSplit(text) {   // a pasted draft with the portal's own headings: split on them
    var heads = D.sections.map(function (s) { return [s.id, s.name]; }).concat([['why', 'why this project and why now'], ['tk', 'traditional knowledge'], ['support', 'support material'], ['summary', 'summary'], ['describe', 'describe'], ['capacity', 'capacity']]);
    var lines = String(text).split('\n'), out = [], cur = null;
    lines.forEach(function (ln) {
      var h = ln.trim().toLowerCase().replace(/[:#*]+/g, '').trim(), m = heads.filter(function (x) { return h && h.length < 70 && (h === x[1] || h.indexOf(x[1]) === 0); })[0];
      if (m) { cur = { text: '', head: m[0] }; out.push(cur); } else if (cur) cur.text += (cur.text ? '\n' : '') + ln; else if (ln.trim()) { cur = { text: ln, head: null }; out.push(cur); }
    });
    return out.filter(function (p) { return p.text.trim(); }).length > 1 && out.some(function (p) { return p.head; }) ? out.filter(function (p) { return p.text.trim(); }) : null;
  }
  function map(text) {
    var parts = headingSplit(text) || String(text || '').split(/\n\s*\n/).map(function (t) { return { text: t, head: null }; });
    return parts.map(function (p) { return { text: p.text.trim() } ; }).filter(function (p) { return p.text; }).map(function (p, i) {
      var low = p.text.toLowerCase(), sc = D.sections.map(function (s) { var k = 0; (WORDS[s.id] || []).forEach(function (w) { var re = new RegExp('(^|[^a-z])' + w.replace(/[$]/g, '\\$') + '([^a-z]|$)', 'g'), m = low.match(re); if (m) k += m.length; }); return [s.id, k]; }).sort(function (a, b) { return b[1] - a[1]; });
      var hp = parts[i] && parts[i].head, top = hp ? [hp] : sc[0][1] ? [sc[0][0]].concat(sc[1][1] && sc[1][1] >= sc[0][1] * .6 ? [sc[1][0]] : []) : [];
      return { id: uid(), text: p.text, to: top, head: !!hp, state: 'waiting' };
    });
  }

  var listenAudio = null, listenOn = false;
  function storeGet() { try { return (GJ.store && GJ.store.get && GJ.store.get()) || {}; } catch (e) { return {}; } }
  function applyTune() {
    var st = storeGet(), ts = st.typeSize || st.textSize || 1;
    el.style.setProperty('--type', String(ts));
    el.classList.toggle('gr-reduced', st.reduce === 'on');
    el.classList.toggle('listening', !!listenOn);
    var b = el.querySelector('.gr-listen');
    if (b) { b.classList.toggle('on', !!listenOn); b.setAttribute('aria-pressed', String(!!listenOn)); b.textContent = listenOn ? 'sea · on' : 'sea'; }
  }
  function seaSrc() {
    try { return new URL('media/grant/sea.wav', document.baseURI).href; } catch (e) { return 'media/grant/sea.wav'; }
  }
  function ensureSea() {
    if (listenAudio) return listenAudio;
    var a = document.createElement('audio');
    a.setAttribute('playsinline', ''); a.setAttribute('webkit-playsinline', '');
    a.preload = 'auto'; a.loop = true; a.src = seaSrc(); a.volume = 0.42;
    a.setAttribute('aria-hidden', 'true');
    el.appendChild(a);
    listenAudio = a;
    return a;
  }
  function setListen(on) {
    on = !!on;
    if (on) {
      var a = ensureSea();
      var go = a.play();
      if (go && go.catch) go.catch(function () { say('tap sea again to start listening'); });
    } else if (listenAudio) { try { listenAudio.pause(); } catch (e) {} }
    listenOn = on;
    applyTune();
    return listenOn;
  }
  function captureSpot() {
    var ta = el.querySelector('textarea.gr-ta');
    var sp = { tab: S.tab, cur: S.cur, layer: S.layer || null, scroll: body.scrollTop || 0, caret: ta ? ta.selectionStart : null, caretEnd: ta ? ta.selectionEnd : null };
    S.spot = D.spot = sp; saveNow();
    return sp;
  }
  function restoreSpot() {
    var sp = S.spot || (D && D.spot);
    if (!sp) return;
    if (sp.cur && sec(sp.cur)) S.cur = sp.cur;
    if (sp.tab) S.tab = sp.tab;
    if (sp.layer) S.layer = sp.layer;
  }
  function placeSpot() {
    var sp = S.spot || (D && D.spot); if (!sp) return;
    body.scrollTop = sp.scroll || 0;
    var ta = el.querySelector('textarea.gr-ta');
    if (ta && sp.caret != null) { try { var n = (ta.value || '').length; ta.selectionStart = Math.min(sp.caret, n); ta.selectionEnd = Math.min(sp.caretEnd != null ? sp.caretEnd : sp.caret, n); } catch (e) {} }
  }
  function notesList() {
    try { return (GJ.notes && GJ.notes.all && GJ.notes.all()) || []; } catch (e) { return []; }
  }
  function noteText(n) { return String((n && (n.text || n.body || n.title)) || '').replace(/\s+$/, ''); }
  function noteTitle(n) { var t = noteText(n).split('\n')[0].trim(); return t ? t.slice(0, 72) : 'a note'; }
  function pullNote(id, where) {
    var n = notesList().filter(function (x) { return String(x.id) === String(id); })[0];
    if (!n) return false;
    var text = noteText(n); if (!text) return false;
    if (where === 'drift') {
      D.stream.text = (D.stream.text ? D.stream.text.replace(/\s+$/, '') + '\n\n' : '') + text;
      logIt('pulled a note into free writing (your yes)'); saveNow(); return true;
    }
    var s = sec(where || S.cur); if (!s || s.kind) return false;
    keepVersion(s.id, 'before pulling a note');
    s.text = (String(s.text || '').replace(/\s+$/, '') + (s.text ? '\n\n' : '') + text);
    logIt('pulled a note into ' + sname(s.id) + ' (your yes)'); saveNow(); return true;
  }
  function pullSheet() {
    var L = notesList(), s = sec(S.cur);
    var h = '<h3>pull a note</h3><p class="gr-sub">from Notes, into this section or the free-writing pile. nothing is placed until you say yes.</p>';
    if (!L.length) h += '<p class="gr-none">no notes yet · write one in Notes, then pull it in</p>';
    else L.slice(0, 24).forEach(function (n) {
      h += '<div class="gr-ver"><b>' + esc(noteTitle(n)) + '</b><p>' + esc(noteText(n).slice(0, 240)) + '</p>';
      if (s && !s.kind) h += '<button type="button" class="gr-wide gr-go" data-s="pullsec" data-id="' + esc(n.id) + '">yes · into ' + esc(s.short || s.name) + '</button>';
      h += '<button type="button" class="gr-wide" data-s="pulldrift" data-id="' + esc(n.id) + '">yes · into free writing</button></div>';
    });
    openSheet(h, 'pull');
  }

  /* ——— threads: one per proposal, and one per section, choice, mark or passage when he opens it. They live in Notes ——— */
  function thread(key, title) { var T = D.threads[key] = D.threads[key] || { title: title, items: [], t: Date.now() }; if (title) T.title = title; return T; }
  function toNotes(key) { var T = D.threads[key]; if (!T || !GJ.notes || !GJ.notes.thread) return; GJ.notes.thread('grant:' + D.id + ':' + key, 'grant', T.title + '\n' + T.items.map(function (x) { return '· ' + x.text + (x.ctx ? '  (' + x.ctx + ')' : ''); }).join('\n')); }

  /* ——— the room ——— */
  var el = document.createElement('section'); el.id = 'grant'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'grant'); el.hidden = true;
  el.innerHTML =
    '<header class="gr-spine" aria-label="the spine"><div class="gr-sp1"><b class="gr-t"></b><span class="gr-due" role="timer"></span></div>' +
    '<details class="gr-score"><summary>scoring and protocols</summary><div class="gr-crit"></div></details>' +
    '<nav class="gr-secs" aria-label="sections"></nav>' +
    '<div class="gr-util"><button type="button" class="gr-moon" data-a="moon" aria-label="progress and time left"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" class="gr-moon-ring"/><circle cx="16" cy="16" r="11" class="gr-moon-bg"/><path class="gr-moon-fill"></path></svg></button><button type="button" class="gr-askbtn" data-a="ask">ask</button><button type="button" class="gr-help" data-a="how" aria-label="how to use">?</button></div>' +
    '<nav class="gr-tools" aria-label="more tools"><button type="button" data-a="import">import</button><button type="button" class="gr-listen" data-a="listen" aria-pressed="false">sea</button><button type="button" data-a="red">red</button><button type="button" data-a="quiet">quiet writing</button><button type="button" data-a="ripples" aria-pressed="true">ripples</button><button type="button" data-a="final">final application</button></nav></header>' +
    '<div class="gr-body" role="region" aria-live="polite"></div>' +
    '<div class="gr-offers" hidden></div>' +
    '<nav class="gr-bar" aria-label="main"><button type="button" data-a="tools">reference &amp; tools</button><button type="button" class="gr-send-btn" data-a="send">send to agent</button></nav>' +
    '<aside class="gr-ref" aria-label="reference"><button type="button" class="gr-ref-h" data-a="ref" aria-expanded="false"><b>reference</b><em class="gr-ref-hint"></em></button><div class="gr-ref-body"></div></aside>' +
    '<nav class="gr-tabs" role="tablist" aria-label="grant">' + [['write', 'write'], ['choices', 'choices'], ['path', 'path'], ['free', 'free write'], ['threads', 'threads']].map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</nav>' +
    '<div class="gr-sheet" hidden role="dialog"></div>' +
    '<div class="gr-send" hidden role="dialog" aria-label="send to agent"><h3>send to agent</h3><p class="gr-sub">share this, or copy the text and paste it into our chat. your writing stays in the room.</p><textarea class="gr-send-ta" readonly aria-label="grant room bundle"></textarea><button type="button" class="gr-wide gr-go" data-a="copybundle">copy</button><button type="button" class="gr-wide gr-soft" data-a="closesend">close</button></div>' +
    '<div class="gr-dial" aria-hidden="true"></div><div class="gr-dial-lab" hidden></div>' +
    '<div class="gr-how" hidden role="dialog" aria-label="how to use"></div><p class="gr-hint" hidden></p>' +
    '<div class="gr-final" hidden role="dialog" aria-label="final application"></div>' +
    '<div class="gr-ask" hidden role="dialog" aria-label="ask"><h3>ask</h3><p class="gr-sub">type shorten this, or where does this fit. the result is a suggestion you can edit. nothing is written into the working copy until you take it.</p><textarea class="gr-tin gr-ask-ta" aria-label="what to ask" placeholder="shorten this"></textarea><button type="button" class="gr-wide gr-go" data-a="askgo">ask</button><button type="button" class="gr-wide gr-soft" data-a="askx">close</button></div>' +
    '<div class="gr-ghost" hidden></div><div class="gr-drop" hidden></div>' +
    '<button type="button" class="gr-qexit" data-a="unquiet" hidden>tap here or swipe down to leave quiet writing</button>';
  document.body.appendChild(el);
  function $(s) { return el.querySelector(s); }
  var body = $('.gr-body'), sheet = $('.gr-sheet'), refEl = $('.gr-ref'), sendEl = $('.gr-send');
  var S = { on: false, tab: 'write', cur: 'summary', layer: null, pi: 0, sheet: null, mapped: null, refOpen: false, refs: {}, sendOn: false, toolsOpen: false };

  function ensureState() {
    if (!D) return;
    if (!D.versions) D.versions = {};
    if (!D.homes) D.homes = [];
    if (!D.aside) D.aside = [];
    if (!D.used) D.used = {};
    if (!D.pass) D.pass = {};
    if (!D.foundationSwap) D.foundationSwap = {};
    if (!D.refNotes) D.refNotes = [];
    if (!D.hints) D.hints = {};
    if (!D.ripples) D.ripples = [];
    if (D.rippleOn == null) D.rippleOn = true;
  }
  function passOf(id) { ensureState(); return D.pass[id] || 'gather'; }
  function setPass(id, p) { ensureState(); D.pass[id] = p; saveNow(); if (S.on) paint(); }
  function hasHisWriting(s) {
    var t = String((s && s.text) || '').trim();
    if (!t) return false;
    if (t === String(draftSeed(s.id) || '').trim()) return false;
    return true;
  }
  function foundationOf(id) {
    var f = (G.OZ_CKS_FOUNDATION && G.OZ_CKS_FOUNDATION.sections) || {};
    return f[id] ? String(f[id]) : '';
  }
  function normText(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function staleDraftOf(id) {
    var data = v9() || {}, row = (data.sections || {})[id];
    if (row == null && data.sections) row = data.sections[{ name: 'title', tk: 'protocol', collab: 'collaborators' }[id] || id];
    return row ? String(typeof row === 'string' ? row : (row.text || '')) : '';
  }
  function migrateFoundation() {
    ensureState();
    var found = (G.OZ_CKS_FOUNDATION && G.OZ_CKS_FOUNDATION.sections) || {}, changed = false;
    ['summary', 'describe'].forEach(function (id) {
      if (D.foundationSwap[id]) return;
      var s = sec(id), want = found[id], cur, stale;
      if (!s || !want || !normText(want)) return;
      cur = s.text || '';
      if (normText(cur) === normText(want)) { D.foundationSwap[id] = 'already'; return; }
      stale = staleDraftOf(id);
      if (stale && normText(cur) === normText(stale)) {
        if (normText(cur)) keepVersion(id, 'earlier draft text');
        s.text = want;
        D.foundationSwap[id] = true;
        changed = true;
        logIt('placed your foundation writing in ' + sname(id) + ' · earlier draft text kept as a version');
      }
    });
    if (changed) saveNow();
    return changed;
  }
  function isStaleText(text) {
    var data = v9() || {}, secs = data.sections || {}, mine = normText(text);
    if (!mine) return false;
    return Object.keys(secs).some(function (id) {
      var row = secs[id], tx = row ? String(typeof row === 'string' ? row : (row.text || '')) : '';
      return tx && normText(tx) === mine;
    });
  }
  function isEmptyOrStale(s) {
    if (!s || s.kind || s.id === 'name') return false;
    if (!normText(s.text)) return 'empty';
    var stale = staleDraftOf(s.id);
    if (stale && normText(s.text) === normText(stale)) return 'stale';
    return false;
  }
  function writingPool() {
    var out = [];
    function add(text, src) {
      text = String(text || '').trim();
      if (!text || isStaleText(text)) return;
      if (out.some(function (p) { return normText(p.text) === normText(text); })) return;
      out.push({ text: text, src: src || '' });
    }
    var f = (G.OZ_CKS_FOUNDATION && G.OZ_CKS_FOUNDATION.sections) || {};
    Object.keys(f).forEach(function (id) { add(f[id], 'foundation'); });
    (D.refNotes || []).forEach(function (n) { add(n.text, 'note'); });
    Object.keys(D.versions || {}).forEach(function (id) {
      (D.versions[id] || []).forEach(function (v) {
        if (v && v.label === 'earlier draft text' && isStaleText(v.text)) return;
        if (v) add(v.text, 'version');
      });
    });
    return out;
  }
  function scoreForSection(id, text) {
    var low = String(text || '').toLowerCase(), k = 0;
    (WORDS[id] || []).forEach(function (w) {
      var re = new RegExp('(^|[^a-z])' + w.replace(/[$]/g, '\\$') + '([^a-z]|$)', 'g'), m = low.match(re);
      if (m) k += m.length;
    });
    return k;
  }
  function extractiveFor(id) {
    var s = sec(id); if (!s) return '';
    var found = foundationOf(id);
    if (found && normText(found)) return found;
    var limit = s.target || 4000, bits = [], take = [], used = 0;
    writingPool().forEach(function (p) {
      sentencesOf(p.text).forEach(function (sent) {
        var sc = scoreForSection(id, sent);
        if (sc > 0 && String(sent).trim()) bits.push({ text: sent.trim(), sc: sc });
      });
    });
    bits.sort(function (a, b) { return b.sc - a.sc; });
    bits.forEach(function (b) {
      var n0 = len(b.text), gap = used ? 1 : 0;
      if (used + gap + n0 <= limit && !take.some(function (t) { return t.text === b.text; })) { take.push(b); used += gap + n0; }
    });
    take.sort(function (a, b) { return 0; });
    /* keep first-seen score order but join as a readable block of his lines */
    return take.map(function (b) { return b.text; }).join('\n\n');
  }
  function autoFillEmptyOrStale() {
    ensureState();
    var changed = false;
    D.sections.forEach(function (s) {
      var kind = isEmptyOrStale(s), next;
      if (!kind) return;
      next = extractiveFor(s.id);
      if (!normText(next) || normText(next) === normText(s.text)) return;
      if (kind === 'stale' && normText(s.text)) keepVersion(s.id, 'earlier draft text');
      s.text = next;
      changed = true;
      logIt((kind === 'empty' ? 'filled ' : 'replaced an old draft in ') + sname(s.id) + ' from your reference writing');
    });
    if (changed) saveNow();
    return changed;
  }
  function offersFromNewWriting() {
    ensureState();
    var offers = [];
    D.sections.forEach(function (s) {
      var next;
      if (isEmptyOrStale(s) || s.kind || s.id === 'name') return;
      next = extractiveFor(s.id);
      if (!normText(next) || normText(next) === normText(s.text)) return;
      offers.push({ id: s.id, current: s.text, proposed: next });
    });
    return offers;
  }
  function addWriting(text) {
    text = String(text || '').trim();
    if (!text) { say('nothing to add'); return; }
    ensureState();
    D.refNotes.unshift({ id: uid(), text: text, t: Date.now() });
    saveNow();
    autoFillEmptyOrStale();
    S.fillOffers = offersFromNewWriting();
    S.toolsOpen = true;
    if (S.on) paint();
    say(S.fillOffers && S.fillOffers.length ? 'new writing is in reference · a few sections have an update to look at' : 'new writing is in reference');
  }
  function takeOffer(id) {
    var o = (S.fillOffers || []).filter(function (x) { return x.id === id; })[0], s = sec(id);
    if (!o || !s) return;
    var ta = el.querySelector('textarea[data-offer-id="' + id + '"]');
    if (ta) o.proposed = ta.value;
    keepVersion(id, 'before taking an update from new writing');
    s.text = o.proposed;
    addRipple(id, o.proposed, 0);
    S.fillOffers = (S.fillOffers || []).filter(function (x) { return x.id !== id; });
    saveNow();
    if (S.on) paint();
    say('the working copy was updated · the earlier text is in versions');
  }
  function keepOffer(id) {
    S.fillOffers = (S.fillOffers || []).filter(function (x) { return x.id !== id; });
    if (S.on) paint();
    say('your working copy was kept');
  }
  function paintOffers() {
    var box = el.querySelector('.gr-offers'); if (!box) return;
    var list = S.fillOffers || [];
    var pend = (S.pending || []).filter(function (p) { return p.type === 'section'; });
    if (!list.length && !pend.length) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    var h = list.map(function (o) {
      var s = sec(o.id);
      return '<article class="gr-offer"><b>updated from your new writing · ' + esc(s ? (s.short || s.name) : o.id) + '</b><div class="gr-cmp"><div><em>yours now · ' + n(len(o.current)) + '</em><p>' + esc(o.current) + '</p></div><div><em>from your new writing · edit before you take it</em><textarea class="gr-tin gr-offer-ta" data-offer-id="' + esc(o.id) + '" aria-label="edit this offer">' + esc(o.proposed) + '</textarea></div></div><div class="gr-ref-acts"><button type="button" class="gr-go" data-a="takeoffer" data-id="' + esc(o.id) + '">take it</button><button type="button" data-a="keepoffer" data-id="' + esc(o.id) + '">keep mine</button></div></article>';
    }).join('');
    (S.pending || []).forEach(function (p, i) {
      if (p.type !== 'section') return;
      var s = sec(p.id);
      h += '<article class="gr-offer"><b>a suggestion' + (p.note ? ' · ' + esc(p.note) : '') + ' · ' + esc(s ? (s.short || s.name) : p.id) + '</b><div class="gr-cmp"><div><em>yours now · ' + n(len(s && s.text || '')) + '</em><p>' + esc((s && s.text) || '(empty)') + '</p></div><div><em>suggestion · edit before you take it</em><textarea class="gr-tin" data-editi="' + i + '" aria-label="edit this suggestion">' + esc(p.text || '') + '</textarea></div></div><div class="gr-ref-acts"><button type="button" class="gr-go" data-a="editok" data-i="' + i + '">take it</button><button type="button" data-a="editskip" data-i="' + i + '">keep mine</button></div></article>';
    });
    box.innerHTML = h;
  }
  function applyBundleState(raw) {
    load(); ensureState();
    var parsed = parseBundle(raw);
    D.sections.forEach(function (s) {
      var pid = BUNDLE_OUT[s.id] || s.id;
      var inc = parsed.sections[pid] || parsed.sections[s.id];
      if (inc && inc.text != null) s.text = inc.text;
    });
    if (parsed.drift && parsed.drift.length && parsed.drift[0].text) {
      D.stream = D.stream || { text: '', mapped: [] };
      D.stream.text = parsed.drift.filter(function (d) { return d.id === 'stream'; }).map(function (d) { return d.text; }).join('\n\n') || D.stream.text;
    }
    (parsed.homes || []).forEach(function (h) {
      if ((D.homes || []).some(function (x) { return x.text === h.text && x.from === h.from; })) return;
      D.homes.push(h);
    });
    (parsed.paths || []).forEach(function (p) { if (p.id && p.status) { D.pathStatus = D.pathStatus || {}; D.pathStatus[p.id] = p.status; } });
    saveNow();
    migrateFoundation();
    autoFillEmptyOrStale();
    if (S.on) paint();
  }
  function mergeVersion(id, rec) {
    if (!rec || !String(rec.text || '').trim() || !sec(id)) return;
    ensureState();
    var V = D.versions[id] = D.versions[id] || [];
    if (V.some(function (v) { return v.text === rec.text; })) return;
    V.unshift({ t: rec.t || Date.now(), text: String(rec.text), label: rec.label || 'your earlier writing', aside: !!rec.aside });
    D.versions[id] = V.slice(0, 30);
  }
  function earlierFor(id) {
    return (D.versions && D.versions[id] || []).filter(function (v) { return v && String(v.text || '').trim() && !v.aside; });
  }
  function homesFor(id, openOnly) {
    return (D.homes || []).filter(function (h) { return h.from === id && (!openOnly || !h.placed); });
  }
  function usedKey(kind, id, text) { return kind + ':' + (id || '') + ':' + String(text || '').slice(0, 120); }
  function markUsed(key, text) { ensureState(); D.used[key] = { t: Date.now(), text: String(text || '') }; saveNow(); }
  function isUsed(key) { return !!(D.used && D.used[key]); }
  function bestFit(text, exclude) {
    var low = String(text || '').toLowerCase(), best = null, bestK = 0;
    D.sections.forEach(function (s) {
      if (s.id === exclude || s.kind) return;
      var k = 0;
      (WORDS[s.id] || []).forEach(function (w) {
        var re = new RegExp('(^|[^a-z])' + w.replace(/[$]/g, '\\$') + '([^a-z]|$)', 'g'), m = low.match(re);
        if (m) k += m.length;
      });
      if (k > bestK) { bestK = k; best = s.id; }
    });
    if (!best) {
      var pref = { summary: 'describe', describe: 'why', why: 'impact', impact: 'why', capacity: 'describe', timeline: 'describe', budget: 'timeline', tk: 'describe', collab: 'capacity', support: 'describe', name: 'summary' };
      best = pref[exclude] || 'describe';
      if (best === exclude) best = 'why';
    }
    return best;
  }
  function sentencesOf(text) {
    var raw = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!raw) return [];
    var out = [], buf = '', i, ch;
    for (i = 0; i < raw.length; i++) {
      ch = raw[i];
      buf += ch;
      if ((ch === '.' || ch === '!' || ch === '?') && (i === raw.length - 1 || /\s/.test(raw[i + 1]))) {
        if (buf.trim()) out.push(buf.replace(/\s+$/, ''));
        buf = '';
      } else if (ch === '\n' && raw[i + 1] === '\n') {
        if (buf.trim()) out.push(buf.trim());
        buf = '';
        while (raw[i + 1] === '\n') i++;
      }
    }
    if (buf.trim()) out.push(buf.trim());
    return out.length ? out : [raw];
  }
  function extractiveTrim(text, limit) {
    var sents = sentencesOf(text), bag = {}, used = 0, take = {}, trimmed = '', last = -2, passages = [], cur = null;
    String(text).toLowerCase().replace(/[a-z][a-z0-9'-]{3,}/g, function (w) { bag[w] = (bag[w] || 0) + 1; return w; });
    function score(s, idx) {
      var sc = 0;
      s.toLowerCase().replace(/[a-z][a-z0-9'-]{3,}/g, function (w) { if (bag[w]) sc += bag[w]; return w; });
      return sc / Math.max(4, Math.sqrt(s.length)) + Math.max(0, 8 - idx) * 0.15;
    }
    var ranked = sents.map(function (s, i) { return { i: i, n: len(s), sc: score(s, i) }; });
    ranked.sort(function (a, b) { return b.sc - a.sc; });
    ranked.forEach(function (r) {
      var gap = used ? 1 : 0;
      if (r.n > limit && used === 0) return;
      if (used + gap + r.n <= limit) { take[r.i] = true; used += gap + r.n; }
    });
    sents.forEach(function (s, i) {
      if (take[i]) {
        if (trimmed) trimmed += (i === last + 1) ? ' ' : '\n\n';
        trimmed += s; last = i;
      } else if (cur && i === cur.last + 1) { cur.text += ' ' + s; cur.last = i; }
      else { cur = { text: s, last: i }; passages.push(cur); }
    });
    passages = passages.map(function (p) { return p.text.trim(); }).filter(Boolean);
    return { trimmed: trimmed, passages: passages, over: !trimmed || len(trimmed) > limit };
  }
  function applyTrim(id) {
    var s = sec(id); if (!s || !s.target || len(s.text) <= s.target) return;
    var cut = extractiveTrim(s.text, s.target);
    if (!cut.trimmed) { say('nothing was cut — a sentence sits over the limit, and this room will not cut inside a sentence'); return; }
    keepVersion(id, 'before a shorter cut');
    s.text = cut.trimmed;
    ensureState();
    cut.passages.forEach(function (tx) {
      D.homes.unshift({ id: uid(), from: id, text: tx, suggest: bestFit(tx, id), t: Date.now(), placed: null });
    });
    saveNow();
    S.refOpen = true;
    if (S.on) paint();
    say(cut.passages.length ? 'the shorter cut is in the working copy · trimmed lines are in find a home' : 'the shorter cut is in the working copy');
  }
  function placeHome(hid, dest) {
    var h = (D.homes || []).filter(function (x) { return x.id === hid; })[0], s = dest && sec(dest);
    if (!h || !s || s.kind) return;
    if (hasHisWriting(s) || String(s.text || '').trim()) {
      keepVersion(s.id, 'before placing a passage');
      s.text = String(s.text || '').replace(/\s+$/, '') + (s.text ? '\n\n' : '') + h.text;
    } else {
      s.text = h.text;
    }
    h.placed = dest;
    saveNow();
    if (S.on) paint();
    say('placed at the end of ' + sname(dest));
  }
  function moveToMain(text, key) {
    persistAll();
    var s = sec(S.cur), chunk = String(text || '').trim();
    if (!s || s.kind || !chunk) return;
    var ta = el.querySelector('textarea.gr-ta[data-sec="' + s.id + '"]');
    var a, b, v, caret;
    if (ta) {
      a = (ta.selectionStart != null) ? ta.selectionStart : String(s.text || '').length;
      b = (ta.selectionEnd != null) ? ta.selectionEnd : a;
      if (document.activeElement !== ta && a === b) { a = b = String(ta.value || s.text || '').length; }
      v = ta.value;
      s.text = v.slice(0, a) + chunk + v.slice(b);
      caret = a + chunk.length;
    } else {
      s.text = (String(s.text || '').replace(/\s+$/, '') + (s.text ? '\n\n' : '') + chunk);
    }
    markUsed(key, chunk);
    addRipple(s.id, chunk, caret != null ? caret - chunk.length : (s.text.length - chunk.length));
    saveNow();
    if (S.on) paint();
    requestAnimationFrame(function () {
      var n = el.querySelector('textarea.gr-ta[data-sec="' + s.id + '"]');
      if (n && caret != null) { n.focus(); n.setSelectionRange(caret, caret); }
    });
    say('moved to the working copy');
    hintOnce('moved', 'the line is in the working copy · it stays marked used in reference');
  }
  function copyWorkingToNotes() {
    var s = sec(S.cur); if (!s || !String(s.text || '').trim()) { say('nothing in the working copy yet'); return; }
    var text = s.name + '\n\n' + s.text;
    var go = function () { if (GJ.notes && GJ.notes.add) { GJ.notes.add(text); say('copied to notes'); } else say('notes is not in this preview'); };
    if (GJ.notes && GJ.notes.add) go(); else if (GJ.lazy) GJ.lazy.load('notes').then(go, go); else go();
  }
  function migrateForeign() {
    ensureState();
    if (D.migratedForeign) return;
    var found = foreignDrafts(), changed = false;
    found.forEach(function (f) {
      var p = f.parsed; if (!p) return;
      Object.keys(p.versions || {}).forEach(function (id) {
        (p.versions[id] || []).forEach(function (v) { mergeVersion(id, v); changed = true; });
      });
      (p.homes || []).forEach(function (h) {
        if ((D.homes || []).some(function (x) { return x.text === h.text && x.from === h.from; })) return;
        D.homes.push({ id: h.id || uid(), from: h.from, text: h.text, suggest: h.suggest || bestFit(h.text, h.from), t: h.t || Date.now(), placed: h.placed || null });
        changed = true;
      });
      Object.keys(p.sections || {}).forEach(function (id) {
        var incoming = p.sections[id] && p.sections[id].text, s = sec(id);
        if (!incoming || !s) return;
        mergeVersion(id, { text: incoming, label: 'from another preview', t: Date.now() });
        changed = true;
      });
    });
    /* fill empty sections only after every preview is in, so the longest of t-34891 / t-422d / others wins — never overwrite typed text */
    D.sections.forEach(function (s) {
      if (hasHisWriting(s) || String(s.text || '').trim()) return;
      var ev = earlierFor(s.id).filter(function (v) { return v && v.text && !isStaleText(v.text); }).slice().sort(function (a, b) { return len(b.text) - len(a.text); })[0];
      if (ev && ev.text && ev.text !== s.text) { s.text = ev.text; changed = true; }
    });
    D.migratedForeign = true;
    if (changed) saveNow();
    if (earlierFor(S.cur).length || homesFor(S.cur, true).length) S.refOpen = true;
  }
  function draftFileOf(id) {
    var data = v9(); if (!data || !data.sections) return '';
    var row = data.sections[id] || data.sections[BUNDLE_OUT[id]];
    return row ? String(typeof row === 'string' ? row : (row.text || '')) : '';
  }
  function stepsHtml(id) {
    var p = passOf(id);
    return '<nav class="gr-steps" aria-label="pathway">' +
      [['gather', 'gather'], ['edit', 'edit pass'], ['final', 'final read']].map(function (x) {
        return '<button type="button" data-a="pass" data-p="' + x[0] + '" class="' + (p === x[0] ? 'on' : '') + '" aria-current="' + (p === x[0] ? 'step' : 'false') + '">' + x[1] + '</button>';
      }).join('') + '</nav>';
  }
  function refItemHtml(key, title, text, extra) {
    S.refs[key] = text;
    var used = isUsed(key), lines = String(text || '').split(/\n+/).filter(function (x) { return x.trim(); });
    var h = '<article class="gr-ref-item' + (used ? ' used' : '') + '" data-rk="' + esc(key) + '"><b>' + esc(title) + (used ? ' · used' : '') + '</b>';
    h += '<div class="gr-ref-acts"><button type="button" class="gr-go" data-a="movemain" data-k="' + esc(key) + '">move to main</button><button type="button" data-a="aside" data-k="' + esc(key) + '">set aside</button></div>';
    if (extra) h += extra;
    h += '<div class="gr-ref-text">';
    lines.forEach(function (ln, i) {
      var lk = key + '~' + i;
      S.refs[lk] = ln;
      h += '<p class="gr-refline" data-lk="' + esc(lk) + '" tabindex="0">' + esc(ln) + '</p>';
    });
    h += '</div></article>';
    return h;
  }
  function openDecisionsHtml() {
    var open = (D.forks || []).filter(function (f) { return !f.pick; });
    var paths = pathList().filter(function (p) { return p.status === 'open'; });
    if (!open.length && !paths.length) return '';
    var h = '<article class="gr-ref-item gr-decisions"><b>open decisions</b>';
    open.forEach(function (f) {
      var touch = (f.provisional || f.marks || []).map(sname).filter(Boolean).join(', ');
      h += '<div class="gr-fork" data-fork="' + esc(f.id) + '"><b>' + esc(f.q) + '</b>';
      h += '<p class="gr-sub">picking this marks ' + esc(touch || 'related sections') + ' so you can look at them. it does not change your writing, and you can change the pick later.</p>';
      h += '<div class="gr-ref-acts">';
      f.opts.forEach(function (o) {
        h += '<button type="button" data-pick="' + esc(f.id) + ':' + esc(o.id) + '">' + esc(o.label) + '</button>';
      });
      h += '</div></div>';
    });
    paths.forEach(function (p) {
      h += '<div class="gr-path" data-path="' + esc(p.id) + '"><b>' + esc(p.title) + '</b>';
      h += '<p class="gr-sub">setting this path marks related sections so you can look at them. it does not change your writing, and you can change it later.</p>';
      h += pathStatusBtns(p);
      h += '</div>';
    });
    h += '</article>';
    return h;
  }
  function paintRef() {
    if (!refEl) return;
    var s = sec(S.cur), bodyR = refEl.querySelector('.gr-ref-body'), hint = refEl.querySelector('.gr-ref-hint'), h = '', nHint = [];
    S.refs = {};
    if (!s || s.kind) { refEl.classList.remove('open'); if (hint) hint.textContent = ''; bodyR.innerHTML = ''; return; }
    var ev = earlierFor(s.id), homes = homesFor(s.id, true), found = foundationOf(s.id), file = draftFileOf(s.id);
    if (ev.length) nHint.push('your earlier writing');
    if (homes.length) nHint.push('find a home');
    if (found) nHint.push('foundation');
    if (file && file !== (s.text || '')) nHint.push('draft file');
    if (hint) hint.textContent = nHint.join(' · ') || 'drafts and earlier writing';
    h += openDecisionsHtml();
    h += '<article class="gr-ref-item gr-addw"><b>add writing</b><p class="gr-sub">a passage to keep in reference. empty or old-draft sections can be filled from it; sections you have already typed are only updated if you say so.</p><textarea class="gr-tin gr-add-ta" aria-label="add writing" placeholder="a passage"></textarea><div class="gr-ref-acts"><button type="button" class="gr-go" data-a="addwriting">add writing</button></div></article>';
    (D.refNotes || []).forEach(function (n, i) {
      h += refItemHtml('note:' + n.id, 'added writing · ' + when(n.t), n.text);
    });
    if (s.target && len(s.text) > s.target) {
      var cut = extractiveTrim(s.text, s.target);
      h += '<article class="gr-ref-item gr-over"><b>over the limit · a shorter cut from this section</b><p class="gr-sub">only lines already in the working copy, nothing new. applied only if you tap.</p>';
      h += '<div class="gr-cmp"><div><em>now · ' + n(len(s.text)) + '</em><p>' + esc(s.text) + '</p></div><div><em>shorter cut · ' + n(len(cut.trimmed)) + '</em><p>' + esc(cut.trimmed || '(a sentence sits over the limit; this room will not cut inside it)') + '</p></div></div>';
      if (cut.trimmed && cut.trimmed !== s.text) h += '<div class="gr-ref-acts"><button type="button" class="gr-go" data-a="usetrim">use this shorter cut</button></div>';
      if (cut.passages.length) h += '<p class="gr-sub">trimmed lines will go to find a home, not into the bin.</p>';
      h += '</article>';
    }
    homes.forEach(function (hm) {
      var dest = hm.suggest || bestFit(hm.text, s.id), dn = sname(dest);
      S.refs['home:' + hm.id] = hm.text;
      h += '<article class="gr-ref-item gr-home"><b>find a home</b><div class="gr-cmp"><div><em>trimmed from ' + esc(s.short || s.name) + '</em><p>' + esc(hm.text) + '</p></div><div><em>best fit · ' + esc(dn) + '</em><p>' + esc((sec(dest) && sec(dest).text || '(empty)').slice(0, 400)) + '</p></div></div>';
      h += '<div class="gr-ref-acts"><button type="button" class="gr-go" data-a="placehome" data-id="' + esc(hm.id) + '" data-sec="' + esc(dest) + '">add to the end of ' + esc(dn) + '</button>';
      D.sections.forEach(function (x) {
        if (x.id === dest || x.id === s.id || x.kind) return;
        h += '<button type="button" data-a="placehome" data-id="' + esc(hm.id) + '" data-sec="' + esc(x.id) + '">end of ' + esc(x.short || x.name) + '</button>';
      });
      h += '</div></article>';
    });
    ev.forEach(function (v, i) {
      h += refItemHtml('ver:' + s.id + ':' + i, 'your earlier writing · ' + when(v.t) + (v.label ? ' · ' + v.label : '') + ' · ' + n(len(v.text)), v.text);
    });
    if (found && found !== (s.text || '')) h += refItemHtml('found:' + s.id, 'foundation writing · ' + n(len(found)), found);
    if (file && file !== (s.text || '') && file !== found) h += refItemHtml('file:' + s.id, 'a draft file · ' + n(len(file)), file);
    var PL = practiceFor(s.id), it = PL[S.pi % (PL.length || 1)];
    if (it && it.quote) h += refItemHtml('practice:' + it.id, 'practice · ' + (it.source || ''), it.quote + (it.also && it.also.quote ? '\n\n' + it.also.quote : ''));
    var PA = pathsFor(s.id).filter(function (p) { return p.status === 'leaning' || p.status === 'chosen-for-now'; });
    PA.forEach(function (pt) { h += refItemHtml('path:' + pt.id, 'path · ' + pt.status + ' · ' + pt.title, pt.why || pt.title); });
    var aside = (D.aside || []).filter(function (a) { return !a.sec || a.sec === s.id; });
    if (aside.length || (D.versions[s.id] || []).some(function (v) { return v.aside; })) {
      h += '<details class="gr-aside"><summary>set aside</summary>';
      aside.forEach(function (a) {
        S.refs['aside:' + a.id] = a.text;
        h += '<article class="gr-ref-item"><b>' + esc(a.title || 'set aside') + '</b><p class="gr-ref-text">' + esc(a.text) + '</p><div class="gr-ref-acts"><button type="button" class="gr-go" data-a="movemain" data-k="aside:' + esc(a.id) + '">move to main</button><button type="button" data-a="unaside" data-id="' + esc(a.id) + '">bring back</button></div></article>';
      });
      (D.versions[s.id] || []).forEach(function (v, i) {
        if (!v.aside) return;
        h += refItemHtml('veraside:' + s.id + ':' + i, 'set aside · ' + (v.label || 'earlier writing'), v.text);
      });
      h += '</details>';
    }
    bodyR.innerHTML = h || '<p class="gr-none">nothing in reference for this section yet</p>';
    refEl.classList.toggle('open', !!S.refOpen);
    refEl.querySelector('.gr-ref-h').setAttribute('aria-expanded', String(!!S.refOpen));
  }
  function sendToAgent() {
    persistAll();
    var text = bundleOf('state');
    var ta = sendEl.querySelector('.gr-send-ta');
    ta.value = text;
    sendEl.hidden = false;
    S.sendOn = true;
    try { ta.focus(); ta.setSelectionRange(0, text.length); } catch (e) { try { ta.select(); } catch (e2) {} }
    if (typeof navigator.share === 'function') {
      try {
        var ret = navigator.share({ title: 'grant room bundle', text: text });
        if (ret && typeof ret.catch === 'function') ret.catch(function () {});
      } catch (e) {}
    }
  }
  function copyBundle() {
    var ta = sendEl.querySelector('.gr-send-ta'); if (!ta) return;
    try { ta.focus(); ta.select(); } catch (e) {}
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    if (ok) { say('copied — paste it into our chat'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(function () { say('copied — paste it into our chat'); }).catch(function () { say('select the text and copy'); });
      return;
    }
    say('select the text and copy');
  }
  function closeSend() { if (sendEl) sendEl.hidden = true; S.sendOn = false; }


  /* ——— oz features in the room (23 Nov, 4:33): hold-to-move, quiet writing, side dial, moon, ripples, mark ask, how-to, final view ——— */
  function addRipple(id, chunk, start) {
    ensureState();
    if (!D.rippleOn) return;
    var t = String(chunk || ''), at = start == null ? 0 : start;
    if (!t) return;
    D.ripples = (D.ripples || []).filter(function (r) { return Date.now() - r.t < 20000; });
    D.ripples.push({ id: id, start: at, end: at + t.length, t: Date.now() });
  }
  function paintRipples() {
    var pre = el.querySelector('.gr-ripple'), ta = el.querySelector('textarea.gr-ta');
    if (!pre || !ta) return;
    var s = sec(S.cur), text = s ? String(s.text || '') : '';
    pre.style.font = getComputedStyle(ta).font;
    pre.style.padding = getComputedStyle(ta).padding;
    pre.scrollTop = ta.scrollTop;
    if (!D.rippleOn) { pre.innerHTML = ''; return; }
    var now = Date.now(), spans = (D.ripples || []).filter(function (r) { return r.id === S.cur && now - r.t < 16000; }).sort(function (a, b) { return a.start - b.start; });
    if (!spans.length) { pre.textContent = text; return; }
    var h = '', i = 0;
    spans.forEach(function (r) {
      var a = Math.max(0, r.start), b = Math.min(text.length, r.end);
      if (b <= i) return;
      if (a > i) h += esc(text.slice(i, a));
      var age = (now - r.t) / 16000, op = Math.max(0, 1 - age);
      h += '<mark style="--rip:' + op + '">' + esc(text.slice(Math.max(a, i), b)) + '</mark>';
      i = b;
    });
    if (i < text.length) h += esc(text.slice(i));
    pre.innerHTML = h || esc(text);
  }
  function moonFrac() {
    var list = D.sections, sum = 0, n = 0;
    list.forEach(function (s) {
      n++;
      if (s.kind === 'types') { sum += fork('knowing') && fork('knowing').pick ? 1 : 0.4; return; }
      if (s.kind === 'items') { sum += Math.min(1, items(s).length / (s.min || 1)); return; }
      if (!s.target) { sum += String(s.text || '').trim() ? 1 : 0; return; }
      sum += Math.min(1, len(s.text) / s.target);
    });
    return n ? sum / n : 0;
  }
  function paintMoon() {
    var f = moonFrac(), path = el.querySelector('.gr-moon-fill'), btn = el.querySelector('.gr-moon');
    if (!path) return;
    /* left-to-right waxing disc, 0 empty → 1 full */
    var x = 16 + 11 * (2 * f - 1);
    if (f <= 0) path.setAttribute('d', '');
    else if (f >= 1) path.setAttribute('d', 'M16 5 A11 11 0 1 1 15.99 5 Z');
    else path.setAttribute('d', 'M16 5 A11 11 0 0 1 16 27 A' + (11 * Math.abs(2 * f - 1) + 0.01) + ' 11 0 0 ' + (f > 0.5 ? 0 : 1) + ' 16 5 Z');
    if (btn) btn.setAttribute('aria-label', 'progress ' + Math.round(f * 100) + ' percent · time left');
    btn && btn.style.setProperty('--mf', String(f));
  }
  function openMoon() {
    var d = due(), left = [], at = [];
    D.sections.forEach(function (s) {
      var c = len(s.text), line;
      if (s.kind === 'types') line = (fork('knowing') && fork('knowing').pick) ? 'picked' : 'still open';
      else if (s.kind === 'items') line = items(s).length + ' / ' + s.min + '–' + s.max + ' items';
      else if (s.target) line = n(c) + ' / ' + n(s.target);
      else line = c ? n(c) + ' characters' : 'empty';
      var row = '<p><b>' + esc(s.short || s.name) + '</b> ' + esc(line) + '</p>';
      var done = s.kind === 'types' ? !!(fork('knowing') && fork('knowing').pick) : s.kind === 'items' ? items(s).length >= s.min : s.target ? c >= s.target : !!String(s.text || '').trim();
      (done ? at : left).push(row);
    });
    openSheet('<h3>what’s left</h3><p class="gr-sub">due Wed Nov 25, 8:59 p.m. Pacific · ' + esc(d.left) + '</p><h3 class="gr-h">still to go</h3>' + (left.join('') || '<p class="gr-none">every section has reached its limit, or has writing where there is no limit</p>') + '<h3 class="gr-h">at the limit, or written</h3>' + (at.join('') || '<p class="gr-none">none yet</p>'), 'moon');
  }
  function showHow(force) {
    var box = el.querySelector('.gr-how'); if (!box) return;
    box.innerHTML = '<h3>how to use</h3><ul>' +
      '<li><i class="ic-box"></i>the big box is your writing. it saves as you type.</li>' +
      '<li><i class="ic-hold"></i>hold a line in reference, then drag it into the box — or tap move to main.</li>' +
      '<li><i class="ic-dial"></i>slide your thumb on the right edge to change section.</li>' +
      '<li><i class="ic-moon"></i>tap the moon for what’s left and the time due.</li>' +
      '<li><i class="ic-ask"></i>tap ask, then type “shorten this” or “where does this fit.”</li>' +
      '<li><i class="ic-final"></i>final application (in reference &amp; tools) shows only the finished text, ready to copy.</li>' +
      '</ul><button type="button" class="gr-wide gr-go" data-a="howx">got it</button>';
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add('in'); });
    S.howOn = true;
  }
  function hideHow() {
    var box = el.querySelector('.gr-how');
    if (box) { box.classList.remove('in'); setTimeout(function () { if (!S.howOn) box.hidden = true; }, 280); }
    S.howOn = false;
    ensureState(); D.hints.how = 1; saveNow();
  }
  function hintOnce(key, text) {
    ensureState();
    if (D.hints[key]) return;
    D.hints[key] = 1; saveNow();
    var h = el.querySelector('.gr-hint'); if (!h) return;
    h.textContent = text; h.hidden = false;
    h.classList.add('in');
    clearTimeout(S.hintT);
    S.hintT = setTimeout(function () { h.classList.remove('in'); setTimeout(function () { if (!h.classList.contains('in')) h.hidden = true; }, 280); }, 4200);
  }
  function setQuiet(on) {
    S.quiet = !!on;
    if (S.quiet) {
      S.toolsOpen = false; S.finalOn = false;
      setListen(true);
      hintOnce('quiet', 'tap the top, or swipe down, to leave quiet writing');
    }
    el.classList.toggle('gr-quiet', !!S.quiet);
    var qe = el.querySelector('.gr-qexit'); if (qe) qe.hidden = !S.quiet;
    hap('tick');
    say(S.quiet ? 'quiet writing · only the text stays' : 'back to the room');
  }
  function setFinal(on) {
    S.finalOn = !!on;
    if (S.finalOn) { S.toolsOpen = false; S.quiet = false; }
    paint();
    if (S.finalOn) hap('tick');
  }
  function paintFinal() {
    var box = el.querySelector('.gr-final'); if (!box) return;
    if (!S.finalOn) { box.hidden = true; box.innerHTML = ''; return; }
    var h = '<header class="gr-final-h"><h3>final application</h3><p class="gr-sub">only the working copy of each section, in portal order. copy one at a time.</p><button type="button" class="gr-wide gr-soft" data-a="unfinal">back to writing</button></header><div class="gr-final-body">';
    D.sections.forEach(function (s) {
      var c = len(s.text), lim = s.target ? n(s.target) : (s.kind === 'items' ? s.min + '–' + s.max + ' items' : 'no limit');
      var count = s.kind === 'items' ? items(s).length + ' items · ' + lim : s.kind === 'types' ? ('creating · sharing' + (fork('knowing') && fork('knowing').pick === 'yes' ? ' · knowing' : fork('knowing') && fork('knowing').pick === 'no' ? '' : ' · knowing?')) : (n(c) + (s.target ? ' / ' + lim : '') + ' characters' + (s.target && c > s.target ? ' · over' : ''));
      var body = s.kind === 'types' ? count : (s.text || '');
      h += '<article class="gr-final-sec"><div class="gr-final-meta"><b>' + esc(s.name) + '</b><span>' + esc(count) + '</span><button type="button" data-a="copysec" data-id="' + esc(s.id) + '">copy</button></div><pre class="gr-final-text">' + esc(body) + '</pre></article>';
    });
    h += '</div>';
    box.innerHTML = h;
    box.hidden = false;
  }
  function copySection(id) {
    var s = sec(id); if (!s) return;
    var text = s.kind === 'types' ? ('creating · sharing' + (fork('knowing') && fork('knowing').pick === 'yes' ? ' · knowing' : '')) : String(s.text || '');
    copyText(text);
    say('copied ' + (s.short || s.name));
  }
  function openAsk() {
    var box = el.querySelector('.gr-ask'); if (!box) return;
    box.hidden = false;
    requestAnimationFrame(function () { box.classList.add('in'); });
    var ta = box.querySelector('.gr-ask-ta'); if (ta) { ta.value = ta.value || ''; ta.focus(); }
    S.askOn = true;
  }
  function closeAsk() {
    var box = el.querySelector('.gr-ask');
    if (box) { box.classList.remove('in'); setTimeout(function () { if (!S.askOn) box.hidden = true; }, 260); }
    S.askOn = false;
  }
  function runAsk() {
    var box = el.querySelector('.gr-ask'), ta = box && box.querySelector('.gr-ask-ta');
    var q = ta ? String(ta.value || '').trim() : '';
    var s = sec(S.cur);
    if (!s) return;
    var low = q.toLowerCase(), pending = S.pending || (S.pending = []);
    var wr = el.querySelector('textarea.gr-ta');
    var sel = (wr && wr.selectionStart !== wr.selectionEnd) ? wr.value.slice(wr.selectionStart, wr.selectionEnd) : '';
    if (/shorten/.test(low)) {
      if (!String(s.text || '').trim()) { say('nothing in this section to shorten yet'); return; }
      var lim = s.target || Math.max(40, Math.floor(len(s.text) * 0.8));
      var cut = extractiveTrim(s.text, lim);
      pending.push({ type: 'section', id: s.id, name: s.name, text: cut.trimmed || s.text, note: 'a shorter cut from this section', from: 'ask' });
      closeAsk();
      S.tab = 'write';
      paint();
      say('a shorter cut is ready · edit it, then take it. the working copy is unchanged');
      return;
    }
    if (/where|fit/.test(low)) {
      var chunk = String(sel || s.text || '').trim();
      if (!chunk) { say('select a passage, or write something first'); return; }
      var dest = bestFit(chunk, s.id);
      pending.push({ type: 'section', id: dest, name: (sec(dest) || {}).name || dest, text: chunk, note: 'fits best in ' + sname(dest), from: 'ask' });
      closeAsk();
      S.cur = dest; S.tab = 'write';
      paint();
      say('a suggestion for ' + sname(dest) + ' · edit it, then take it. nothing was moved');
      return;
    }
    say('try “shorten this” or “where does this fit”');
  }
  function indexAtPoint(ta, clientX, clientY) {
    if (!ta) return 0;
    var cs = getComputedStyle(ta), mir = document.createElement('div'), rect = ta.getBoundingClientRect();
    mir.style.cssText = 'position:fixed;left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;overflow:auto;visibility:hidden;white-space:pre-wrap;word-wrap:break-word;box-sizing:border-box;pointer-events:none;';
    ['font','fontSize','fontFamily','fontWeight','letterSpacing','lineHeight','padding','paddingTop','paddingRight','paddingBottom','paddingLeft','border','borderWidth'].forEach(function (k) { try { mir.style[k] = cs[k]; } catch (e) {} });
    document.body.appendChild(mir);
    mir.scrollTop = ta.scrollTop; mir.scrollLeft = ta.scrollLeft;
    var lo = 0, hi = ta.value.length, best = hi;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      mir.innerHTML = esc(ta.value.slice(0, mid)) + '<span class="c">|</span>' + esc(ta.value.slice(mid));
      var sp = mir.querySelector('.c'), r = sp.getBoundingClientRect();
      if (r.top + r.height / 2 < clientY || (Math.abs(r.top - clientY) < r.height && r.left < clientX)) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    document.body.removeChild(mir);
    return best;
  }
  var drag = null, holdT = 0;
  function startHold(e, line) {
    var now = Date.now();
    if (S._holdAt && now - S._holdAt < 80) return;
    S._holdAt = now;
    clearTimeout(holdT); holdT = 0; drag = null;
    el.classList.remove('gr-dragging');
    var sx = e.clientX, sy = e.clientY, lk = line.dataset.lk, text = S.refs[lk] || line.textContent, pid = e.pointerId;
    try { if (e.pointerId != null && line.setPointerCapture) line.setPointerCapture(e.pointerId); } catch (err) {}
    holdT = setTimeout(function () {
      drag = { lk: lk, text: text, x: sx, y: sy };
      el.classList.add('gr-dragging');
      var g = el.querySelector('.gr-ghost');
      if (g) { g.hidden = false; g.textContent = text.slice(0, 180); g.style.transform = 'translate(' + sx + 'px,' + sy + 'px)'; }
      hap('tick');
      hintOnce('drag', 'drop it in the working copy · a caret shows where it will land');
    }, 420);
    function onMove(ev) {
      if (!ev || (ev.clientX === 0 && ev.clientY === 0 && (sx > 8 || sy > 8))) return;
      if (!drag && (Math.abs(ev.clientX - sx) > 28 || Math.abs(ev.clientY - sy) > 28)) { clearTimeout(holdT); holdT = 0; }
      if (!drag) return;
      ev.preventDefault();
      drag.x = ev.clientX; drag.y = ev.clientY;
      var g = el.querySelector('.gr-ghost');
      if (g) g.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)';
      var ta = el.querySelector('textarea.gr-ta'), drop = el.querySelector('.gr-drop');
      if (ta && drop) {
        var r = ta.getBoundingClientRect(), over = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        drop.hidden = !over;
        if (over) {
          var idx = indexAtPoint(ta, ev.clientX, ev.clientY);
          ta.setSelectionRange(idx, idx);
          /* caret marker at selection */
          var cs = getComputedStyle(ta), lineH = parseFloat(cs.lineHeight) || 28;
          drop.style.left = r.left + 'px';
          drop.style.width = r.width + 'px';
          /* approximate y via a second mirror pulse — use the current selection's scroll */
          var mirTop = (function () {
            var tmp = document.createElement('div');
            tmp.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;overflow:auto;visibility:hidden;white-space:pre-wrap;word-wrap:break-word;box-sizing:border-box;font:' + cs.font + ';padding:' + cs.padding + ';';
            tmp.innerHTML = esc(ta.value.slice(0, idx)) + '<span class="c">|</span>';
            document.body.appendChild(tmp); tmp.scrollTop = ta.scrollTop;
            var sp = tmp.querySelector('.c').getBoundingClientRect();
            document.body.removeChild(tmp);
            return sp.top;
          })();
          drop.style.top = mirTop + 'px';
          drop.hidden = false;
          drag.idx = idx;
        }
      }
    }
    function onUp(ev) {
      clearTimeout(holdT); holdT = 0;
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
      if (!drag) return;
      var ta = el.querySelector('textarea.gr-ta'), ok = false;
      if (ta) {
        var r = ta.getBoundingClientRect();
        ok = ev.clientX >= r.left - 16 && ev.clientX <= r.right + 16 && ev.clientY >= r.top - 16 && ev.clientY <= r.bottom + 16;
        if (ok) {
          var idx = drag.idx != null ? drag.idx : indexAtPoint(ta, ev.clientX, ev.clientY);
          ta.focus(); ta.setSelectionRange(idx, idx);
          moveToMain(drag.text, drag.lk);
        }
      }
      drag = null;
      el.classList.remove('gr-dragging');
      var g = el.querySelector('.gr-ghost'), drop = el.querySelector('.gr-drop');
      if (g) g.hidden = true; if (drop) drop.hidden = true;
    }
    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
    window.addEventListener('mousemove', onMove, true);
    window.addEventListener('mouseup', onUp, true);
    window.addEventListener('touchmove', function (ev) { if (ev.touches && ev.touches[0]) onMove(ev.touches[0]); ev.preventDefault(); }, { capture: true, passive: false });
    window.addEventListener('touchend', function (ev) { var p = ev.changedTouches && ev.changedTouches[0]; if (p) onUp(p); }, true);
  }
  function pointOf(e) { if (e.touches && e.touches[0]) return e.touches[0]; return e; }
  function beginHoldFrom(e) {
    var line = e.target && e.target.closest && e.target.closest('.gr-refline');
    if (line && !e.target.closest('button') && S.toolsOpen) startHold(pointOf(e), line);
  }
  el.addEventListener('pointerdown', function (e) {
    if (S.quiet && e.target && e.target.closest && e.target.closest('.gr-qexit')) return;
    if (S.quiet && e.target && (e.target.classList.contains('gr-qexit') || (e.clientY < (el.getBoundingClientRect().top + 56) && !e.target.closest('textarea')))) {
      S._qswipe = { y: e.clientY };
    }
    beginHoldFrom(e);
  }, true);
  el.addEventListener('mousedown', function (e) { beginHoldFrom(e); }, true);
  el.addEventListener('touchstart', function (e) { beginHoldFrom(e); }, { capture: true, passive: true });
  el.addEventListener('pointerup', function (e) {
    if (S._qswipe && S.quiet) {
      if (e.clientY - S._qswipe.y > 56 || (S._qswipe.y < el.getBoundingClientRect().top + 56 && Math.abs(e.clientY - S._qswipe.y) < 20 && !e.target.closest('textarea'))) setQuiet(false);
    }
    S._qswipe = null;
  }, true);

  /* side dial: right-edge strip only — never captures textarea scroll or selection */
  (function () {
    var strip = el.querySelector('.gr-dial'), lab = el.querySelector('.gr-dial-lab'), st = null;
    if (!strip) return;
    function secs() { return D && D.sections ? D.sections : []; }
    function showLab(i) {
      var list = secs(), s = list[i]; if (!lab) return;
      if (!s) { lab.hidden = true; return; }
      lab.hidden = false; lab.textContent = (s.short || s.name);
      lab.classList.add('in');
    }
    function moveDial(e) {
      if (!st) return;
      e.preventDefault && e.preventDefault();
      var list = secs(); if (!list.length) return;
      var dy = st.y - e.clientY, step = 28;
      var i = st.i - Math.round(dy / step);
      i = Math.max(0, Math.min(list.length - 1, i));
      showLab(i);
      if (i !== st.last) { st.last = i; S.cur = list[i].id; S.tab = 'write'; hap('tick'); paintSpine(); }
    }
    function endDial() {
      if (!st) return;
      var list = secs(), i = st.last;
      st = null;
      el.classList.remove('gr-dialing');
      window.removeEventListener('pointermove', moveDial, true);
      window.removeEventListener('pointerup', endDial, true);
      window.removeEventListener('pointercancel', endDial, true);
      if (lab) { lab.classList.remove('in'); setTimeout(function () { if (!el.classList.contains('gr-dialing')) lab.hidden = true; }, 280); }
      if (list[i]) S.cur = list[i].id;
      S.tab = 'write';
      paint();
    }
    strip.addEventListener('pointerdown', function (e) {
      if (S.finalOn || S.howOn || S.sendOn || S.sheet || S.askOn) return;
      if (e.target.closest && e.target.closest('textarea, button, .gr-ref, .gr-bar, .gr-final, .gr-how, .gr-ask, .gr-send, .gr-sheet')) return;
      e.preventDefault();
      try { strip.setPointerCapture(e.pointerId); } catch (err) {}
      var list = secs(), i = 0;
      list.forEach(function (s, n) { if (s.id === S.cur) i = n; });
      st = { y: e.clientY, i: i, last: i };
      el.classList.add('gr-dialing');
      showLab(i);
      window.addEventListener('pointermove', moveDial, { capture: true, passive: false });
      window.addEventListener('pointerup', endDial, true);
      window.addEventListener('pointercancel', endDial, true);
    });
  })();

  function paintSpine() {
    var d = due(); $('.gr-t').textContent = D.short + ' · ' + D.title; $('.gr-due').textContent = dueLine(d);
    $('.gr-due').setAttribute('aria-label', 'deadline ' + D.deadlineSaid + ', ' + d.local + ' here, ' + d.left);
    $('.gr-crit').innerHTML = D.criteria.map(function (c) { return '<span>' + esc(c.name) + ' <b>' + (c.pass ? 'pass/fail' : c.w + '%') + '</b></span>'; }).join('');
    $('.gr-secs').innerHTML = D.sections.map(function (s) {
      var c = len(s.text), cnt = s.kind === 'items' ? items(s).length + '/' + s.min + '–' + s.max : s.kind === 'types' ? (fork('knowing').pick ? (fork('knowing').pick === 'yes' ? '3' : '2') : '2 + ?') : s.target ? n(c) + '/' + n(s.target) : (c ? n(c) : '—');
      var cls = (s.id === S.cur && S.tab === 'write' ? ' on' : '') + (marksFor(s.id).length ? ' mk' : '') + (waitsOn(s.id).length ? ' pv' : '') + (s.target && c > s.target ? ' over' : '');
      return '<button type="button" class="gr-sec' + cls + '" data-sec="' + s.id + '" aria-label="' + esc(s.name + ', ' + cnt + (marksFor(s.id).length ? ', ' + marksFor(s.id).length + ' to look at' : '') + (waitsOn(s.id).length ? ', provisional' : '')) + '"><span>' + esc(s.short || s.name) + '</span><em>' + cnt + '</em><i aria-hidden="true"></i></button>';
    }).join('');
  }
  function counter(s) {
    if (s.kind === 'items') return items(s).length + ' items · ' + s.min + ' to ' + s.max + ' · one per line';
    if (s.kind === 'types') return 'pick in the portal · this room follows the Knowing choice';
    var c = len(s.text); return s.target ? n(c) + ' / ' + n(s.target) + ' characters' + (c > s.target ? ' · over' : '') + ' · confirm the limit in the portal Preview' : n(c) + ' characters · no limit set';
  }
  function promptsFor(id) { var L = (PR[id] || []).concat(PR.all); return S.layer && S.layer !== 'insights' ? L.filter(function (p) { return p[0] === S.layer; }) : L; }
  function paintWrite() {
    var s = sec(S.cur), M = marksFor(s.id), W = waitsOn(s.id), holds = D.decided.filter(function (x) { return (x.secs || []).indexOf(s.id) >= 0; });
    var pass = passOf(s.id);
    var h = '<div class="gr-head"><h2>' + esc(s.name) + '</h2><span class="gr-carries">carries · ' + esc(carries(s)) + '</span></div>';
    h += stepsHtml(s.id);
    if (pass === 'final') {
      if (s.kind === 'types') {
        var kn0 = fork('knowing');
        h += '<div class="gr-types"><span class="on">creating</span><span class="' + (kn0.pick === 'yes' ? 'on' : kn0.pick ? 'off' : 'q') + '" data-go="fork:knowing">knowing' + (kn0.pick ? '' : ' ?') + '</span><span class="on">sharing</span></div>';
      } else {
        h += '<p class="gr-work-lab">working copy <span>final read</span></p>';
        h += '<textarea class="gr-ta gr-final" data-sec="' + s.id + '" spellcheck="true" aria-label="' + esc(s.name) + '">' + esc(s.text) + '</textarea>';
      }
      h += '<div class="gr-count" aria-live="polite">' + esc(counter(s)) + '</div>';
      if (s.id === 'support') h += '<div class="gr-coming"><p><b>voice memo</b><i>coming</i> · a memo can sit with the support material</p><p><b>Motion Index stills</b><i>coming</i> · stills from a clip can sit with the support material</p></div>';
      body.innerHTML = h; return;
    }
    if (s.kind === 'types') {
      var kn = fork('knowing');
      h += '<div class="gr-types"><span class="on">creating</span><span class="' + (kn.pick === 'yes' ? 'on' : kn.pick ? 'off' : 'q') + '" data-go="fork:knowing">knowing' + (kn.pick ? '' : ' ?') + '</span><span class="on">sharing</span></div>';
    } else {
      h += '<p class="gr-work-lab">working copy <span>' + (pass === 'edit' ? 'edit pass' : 'gather — this is the draft you are writing') + '</span></p>';
      h += '<div class="gr-writebox"><pre class="gr-ripple" aria-hidden="true"></pre><textarea class="gr-ta" data-sec="' + s.id + '" spellcheck="true" aria-label="' + esc(s.name) + '">' + esc(s.text) + '</textarea></div>';
    }
    h += '<div class="gr-count" aria-live="polite">' + esc(counter(s)) + '</div>';
    if (pass === 'gather' && !s.kind) h += '<div class="gr-foot"><button type="button" data-a="copytonotes">copy to notes</button></div>';
    /* path and decision cards never take over the writing surface — they live in reference & tools */
    if (holds.length && pass === 'gather') h += '<details class="gr-holds"' + (S.openHolds ? ' open' : '') + '><summary><b>decided · ' + holds.length + '</b></summary>' + holds.map(function (x) { return '<span>' + esc(x.text) + '</span>'; }).join('') + '</details>';
    if (M.length && pass === 'gather') h += '<details class="gr-marks"' + (S.openMarks ? ' open' : '') + '><summary><b>may need a look · ' + M.length + '</b><span>marks from choices · nothing was rewritten</span></summary>' + M.map(function (m) { return '<div class="gr-mark" data-mark="' + m.id + '"><b>' + (m.back ? 'may need a look' : 'ahead') + '</b><span>' + esc(m.why) + '</span><div><button type="button" data-mk="ok">looked · fine</button><button type="button" data-mk="thread">thread</button></div></div>'; }).join('') + '</details>';
    if (pass === 'edit') {
      var pending = (S.pending || []).map(function (p, i) { return { p: p, i: i }; }).filter(function (x) { return x.p.type === 'section' && x.p.id === s.id; });
      h += '<div class="gr-edit">';
      if (!pending.length) h += '<p class="gr-sub">no suggestions waiting. import a bundle, or ask the writing helper. nothing is written into the working copy unless you accept it.</p><div class="gr-foot"><button type="button" data-a="import">import</button><button type="button" data-a="suggest">ask for a suggestion</button></div>';
      pending.forEach(function (x) {
        var p = x.p;
        h += '<article class="gr-ref-item"><b>a suggestion' + (p.note ? ' · ' + esc(p.note) : '') + '</b><div class="gr-cmp"><div><em>working copy · ' + n(len(s.text)) + '</em><p>' + esc(s.text || '(empty)') + '</p></div><div><em>suggestion · edit before you accept</em><textarea class="gr-tin" data-editi="' + x.i + '" aria-label="edit this suggestion">' + esc(p.text) + '</textarea></div></div><div class="gr-ref-acts">';
        h += '<button type="button" class="gr-go" data-a="editok" data-i="' + x.i + '">accept</button>';
        h += '<button type="button" data-a="editskip" data-i="' + x.i + '">skip</button></div></article>';
      });
      if (s.target && len(s.text) > s.target) {
        var cut = extractiveTrim(s.text, s.target);
        h += '<article class="gr-ref-item gr-over"><b>over the limit · a shorter cut</b><div class="gr-cmp"><div><em>now · ' + n(len(s.text)) + '</em><p>' + esc(s.text) + '</p></div><div><em>shorter cut · ' + n(len(cut.trimmed)) + '</em><p>' + esc(cut.trimmed || '') + '</p></div></div>';
        if (cut.trimmed && cut.trimmed !== s.text) h += '<div class="gr-ref-acts"><button type="button" class="gr-go" data-a="usetrim">use this shorter cut</button></div>';
        h += '</article>';
      }
      h += '</div>';
    }
    if (s.id === 'support') h += '<div class="gr-coming"><p><b>voice memo</b><i>coming</i> · a memo can sit with the support material</p><p><b>Motion Index stills</b><i>coming</i> · stills from a clip can sit with the support material</p></div>';
    body.innerHTML = h;
  }

  function paintChoices() {
    var open = D.forks.filter(function (f) { return !f.pick; }), taken = D.forks.filter(function (f) { return f.pick; });
    var card = function (f) {
      return '<div class="gr-fork" data-fork="' + f.id + '"><h3>' + esc(f.q) + (f.detail ? '<em>' + esc(f.detail) + '</em>' : '') + '</h3>' + f.opts.map(function (o) {
        var on = f.pick === o.id, ms = (o.marks || f.marks || []).map(sname).join(', ');
        return '<div class="gr-opt' + (on ? ' on' : '') + '"><b>' + esc(o.label) + '</b><span>' + esc(o.means) + '</span>' + (ms ? '<em>marks ' + esc(ms) + '</em>' : '') +
          (on ? '<i>your pick</i>' : '<button type="button" data-pick="' + f.id + ':' + o.id + '">' + (f.pick ? 'change to this' : 'pick this') + '</button>') + '</div>';
      }).join('') +
      (!f.pick && f.provisional ? '<p class="gr-ahead">until you pick: ' + esc(f.provisional.map(sname).join(', ')) + ' stay provisional' + (f.drifts ? '; ' + esc(f.drifts.map(sname).join(', ')) + ' may drift' : '') + '</p>' : '') +
      (f.history.length ? '<p class="gr-hist">' + f.history.map(function (x) { var o = opt(f, x.pick); return esc(o ? o.label.split(' · ')[0] : x.pick) + ' <i>' + esc(x.note || '') + '</i>'; }).join(' → ') + '</p>' : '') +
      '<div class="gr-qa">' + (D.branches[f.id] ? '<button type="button" data-a="branch" data-f="' + f.id + '">compare the earlier branch</button>' : '') + '<button type="button" data-a="fthread" data-f="' + f.id + '">thread</button></div></div>';
    };
    body.innerHTML = '<p class="gr-lead">a choice now opens or closes what is ahead, and may move what is written. the room marks it. it never rewrites.</p>' +
      '<h3 class="gr-h">still open</h3>' + (open.length ? open.map(card).join('') : '<p class="gr-none">every choice is made · you can still change one</p>') +
      '<h3 class="gr-h">taken · and changed</h3>' + taken.map(card).join('');
  }
  function pathStatusBtns(p) {
    return '<div class="gr-st" role="radiogroup" aria-label="path status">' + PATH_ST.map(function (st) {
      return '<button type="button" data-a="pstat" data-p="' + esc(p.id) + '" data-st="' + st + '" aria-checked="' + (p.status === st) + '">' + st + '</button>';
    }).join('') + '</div>';
  }
  function paintPath() {
    var openM = D.marks.filter(function (m) { return m.state === 'open'; });
    var h = '<p class="gr-lead">your principles, and the paths already discussed. they stay changeable. the room never writes the proposal.</p>';
    var prac = practiceList();
    h += '<h3 class="gr-h">practice · ' + prac.length + '</h3>';
    h += prac.length ? prac.map(function (it) {
      return '<div class="gr-pr" data-practice="' + esc(it.id) + '"><b>' + esc(it.title) + '</b><q>' + esc(it.quote) + '</q>' + (it.also && it.also.quote ? '<q>' + esc(it.also.quote) + '</q>' : '') + '<em>' + esc(it.source) + (it.note ? ' · ' + esc(it.note) : '') + '</em></div>';
    }).join('') : '<p class="gr-none">practice notes are not in this preview</p>';
    var paths = pathList(), by = { 'open': [], 'leaning': [], 'chosen-for-now': [] };
    paths.forEach(function (p) { (by[p.status] || by.open).push(p); });
    h += '<h3 class="gr-h">paths</h3><p class="gr-sub">open, leaning, or chosen-for-now. change anytime. a change marks related sections; it never rewrites them.</p>';
    h += paths.length ? PATH_ST.map(function (st) {
      if (!by[st].length) return '';
      return '<h4 class="gr-h">' + st + '</h4>' + by[st].map(function (p) {
        return '<div class="gr-path" data-path="' + esc(p.id) + '"><b>' + esc(p.title) + '</b><p>' + esc(p.why) + '</p>' + pathStatusBtns(p) + (p.fork ? '<button type="button" class="gr-text" data-go="fork:' + esc(p.fork) + '">the choice this sits beside</button>' : '') + '</div>';
      }).join('');
    }).join('') : '<p class="gr-none">paths are not in this preview</p>';
    h += '<h3 class="gr-h">decided</h3>' + D.decided.map(function (x) { return '<p class="gr-dec">' + esc(x.text) + '</p>'; }).join('');
    h += '<h3 class="gr-h">to look at · ' + openM.length + '</h3>' + (openM.length ? D.sections.filter(function (s) { return marksFor(s.id).length; }).map(function (s) { return '<button type="button" class="gr-row" data-sec="' + s.id + '"><b>' + esc(s.short || s.name) + '</b><span>' + marksFor(s.id).length + ' mark' + (marksFor(s.id).length > 1 ? 's' : '') + '</span></button>'; }).join('') : '<p class="gr-none">nothing marked</p>');
    h += '<h3 class="gr-h">provisional</h3>' + D.sections.filter(function (s) { return waitsOn(s.id).length; }).map(function (s) { return '<button type="button" class="gr-row" data-sec="' + s.id + '"><b>' + esc(s.short || s.name) + '</b><span>waits on ' + esc(waitsOn(s.id).map(function (f) { return f.id === 'knowing' ? 'Knowing' : f.id === 'site' ? 'the site' : f.id === 'living' ? 'the living part' : 'the opening'; }).join(', ')) + '</span></button>'; }).join('');
    h += '<h3 class="gr-h">what happened</h3>' + D.log.slice(0, 30).map(function (x) { return '<p class="gr-log"><i>' + when(x.t) + '</i>' + esc(x.what) + '</p>'; }).join('');
    var vs = Object.keys(D.versions).filter(function (k) { return D.versions[k].length; });
    h += '<h3 class="gr-h">past drafts</h3>' + (vs.length ? vs.map(function (k) { return '<button type="button" class="gr-row" data-vers="' + k + '"><b>' + esc(sname(k)) + '</b><span>' + D.versions[k].length + ' kept · ' + when(D.versions[k][0].t) + '</span></button>'; }).join('') : '<p class="gr-none">none kept yet · a version is kept before every choice that marks a section, and when you ask</p>');
    h += '<p class="gr-lead">nothing is submitted from oz. you enter and submit in the Council portal yourself.</p>';
    body.innerHTML = h;
  }
  function paintFree() {
    var h = '<p class="gr-lead">free writing. the spine and insights are up top when you want them; nothing here interrupts. when you are ready, map it.</p>' +
      '<textarea class="gr-ta gr-free" data-free="1" spellcheck="true" aria-label="free writing" placeholder="write">' + esc(D.stream.text) + '</textarea>' +
      '<div class="gr-qa"><button type="button" data-a="map">map onto the spine</button><button type="button" data-a="paste">bring in a draft</button><button type="button" data-a="pthread">thread</button></div>';
    if (S.mapped && S.mapped.length) h += '<h3 class="gr-h">where it might go · nothing moves until you say yes</h3>' + S.mapped.map(function (p) {
      if (p.state !== 'waiting') return '<div class="gr-pass done"><q>' + esc(p.text.slice(0, 120)) + (p.text.length > 120 ? '…' : '') + '</q><em>' + esc(p.state) + '</em></div>';
      return '<div class="gr-pass" data-pass="' + p.id + '"><q>' + esc(p.text.slice(0, 220)) + (p.text.length > 220 ? '…' : '') + '</q>' +
        '<em>' + (p.to.length ? (p.head ? 'under its heading: ' : p.to.length > 1 ? 'touches ' : 'belongs in ') + esc(p.to.map(sname).join(' and ')) : 'no clear section · pick one, or leave it here') + '</em><div class="gr-qa">' +
        p.to.map(function (t) { return '<button type="button" data-place="' + p.id + ':' + t + '">yes · place in ' + esc(sname(t)) + '</button>'; }).join('') + '<button type="button" data-a="elsewhere" data-p="' + p.id + '">somewhere else</button><button type="button" data-a="leave" data-p="' + p.id + '">leave it here</button></div></div>';
    }).join('');
    body.innerHTML = h;
  }
  function paintThreads() {
    thread('proposal', D.title + ' · the proposal thread');
    var K = Object.keys(D.threads).sort(function (a, b) { return a === 'proposal' ? -1 : b === 'proposal' ? 1 : D.threads[b].t - D.threads[a].t; });
    body.innerHTML = '<p class="gr-lead">the draft stays the draft. the thinking around it lives here, and in Notes (folder: grant).</p>' + K.map(function (k) { var T = D.threads[k]; return '<button type="button" class="gr-row" data-thread="' + esc(k) + '"><b>' + esc(T.title) + '</b><span>' + T.items.length + ' · ' + when(T.t) + '</span></button>'; }).join('') + '<div class="gr-foot"><button type="button" data-a="pullnote">pull a note</button></div>';
  }
  function paint() {
    paintSpine(); applyTune();
    Array.prototype.forEach.call(el.querySelectorAll('.gr-tabs button'), function (b) { var c = b.dataset.tab === S.tab; b.classList.toggle('on', c); b.setAttribute('aria-selected', String(c)); });
    el.dataset.tab = S.tab;
    ({ write: paintWrite, choices: paintChoices, path: paintPath, free: paintFree, threads: paintThreads })[S.tab]();
    var gather = S.tab === 'write' && passOf(S.cur) === 'gather';
    el.classList.toggle('gr-toolsopen', !!S.toolsOpen);
    el.classList.toggle('gr-hasref', !!S.toolsOpen && gather);
    el.classList.toggle('gr-quiet', !!S.quiet);
    el.classList.toggle('gr-finalon', !!S.finalOn);
    el.classList.toggle('gr-hassug', !!(S.pending || []).some(function (p) { return p.type === 'section' && p.id === S.cur; }) || !!(S.fillOffers || []).length);
    var tb = el.querySelector('[data-a="tools"]');
    if (tb) tb.setAttribute('aria-expanded', String(!!S.toolsOpen));
    if (S.tab === 'write') paintRef();
    paintOffers();
    paintMoon();
    paintRipples();
    paintFinal();
    var rb = el.querySelector('[data-a="ripples"]');
    if (rb) { rb.setAttribute('aria-pressed', String(!!D.rippleOn)); rb.textContent = D.rippleOn ? 'ripples · on' : 'ripples'; }
    var qe = el.querySelector('.gr-qexit'); if (qe) qe.hidden = !S.quiet;
    if (!S.howOn && S.toolsOpen) hintOnce('hold', 'hold a line in reference, then drag it into the working copy — or tap move to main');
    if (!S.howOn && !S.toolsOpen && !S.finalOn) hintOnce('dial', 'slide your thumb on the right edge to change section');
  }

  /* ——— sheets ——— */
  function openSheet(h, kind) { S.sheet = kind || 'x'; sheet.innerHTML = h + '<button type="button" class="gr-wide gr-soft" data-s="x">close · your writing stays</button>'; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); var f = sheet.querySelector('textarea, button'); if (f) f.focus(); }
  function closeSheet() {
    persistAll();
    S.sheet = null; S.threadKey = null;
    sheet.classList.remove('in');
    setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260);
    if (S.on) paint();
  }
  function openThread(key, title, ctx) {
    var T = thread(key, title); S.threadKey = key; saveNow();
    var draft = (D.threadDrafts && D.threadDrafts[key]) || '';
    openSheet('<h3>' + esc(T.title) + '</h3>' + (ctx ? '<p class="gr-sub">' + esc(ctx) + '</p>' : '') + '<div class="gr-titems">' + (T.items.length ? T.items.map(function (x) { return '<p><i>' + when(x.t) + '</i>' + esc(x.text) + '</p>'; }).join('') : '<p class="gr-none">empty · the thinking around the draft goes here</p>') + '</div>' +
      '<textarea class="gr-tin" aria-label="add to the thread" placeholder="a thought">' + esc(draft) + '</textarea><button type="button" class="gr-wide gr-go" data-s="tadd" data-k="' + esc(key) + '" data-c="' + esc(ctx || '') + '">add to the thread</button>', 'thread');
  }
  function versions(id) {
    var s = sec(id), V = D.versions[id] || [];
    openSheet('<h3>' + esc(s.name) + ' · versions</h3><p class="gr-sub">compare with now, or step back. stepping back keeps what is here now as a version too.</p>' + V.map(function (v, i) {
      return '<div class="gr-ver"><b>' + when(v.t) + ' · ' + esc(v.label) + '</b><div class="gr-cmp"><div><em>then · ' + n(len(v.text)) + '</em><p>' + esc(v.text) + '</p></div><div><em>now · ' + n(len(s.text)) + '</em><p>' + esc(s.text || '(empty)') + '</p></div></div><button type="button" class="gr-wide" data-s="back" data-sec="' + id + '" data-i="' + i + '">step back to this version</button></div>';
    }).join(''), 'versions');
  }
  function suggest() {
    var s = sec(S.cur), dr = drifts(s);
    var h = '<h3>a suggestion · ' + esc(s.short || s.name) + '</h3><p class="gr-sub">only what you ask for. nothing changes until you say yes.</p>';
    if (dr.length) h += '<h3 class="gr-h">on this phone · lines that may have drifted</h3>' + dr.map(function (d, i) { return '<div class="gr-ver"><q>' + esc(d.line) + '</q><span>' + esc(d.why) + '</span><button type="button" class="gr-wide" data-s="cut" data-i="' + i + '">yes · take this line out</button></div>'; }).join('');
    else h += '<p class="gr-none">on this phone: nothing here drifts from what is decided.</p>';
    h += '<h3 class="gr-h">the writing helper</h3><p class="gr-sub">it would run in the cloud. F3 lights for as long as it is asked. it offers; it never writes into your draft.</p><button type="button" class="gr-wide" data-s="helper">ask the writing helper</button><p class="gr-hres" aria-live="polite"></p>';
    openSheet(h, 'suggest');
  }
  function paste() { openSheet('<h3>bring in a draft</h3><p class="gr-sub">paste what is already written. with the portal headings, each part goes under its own; without them, the room suggests where each paragraph goes. nothing is placed until you say yes.</p><textarea class="gr-tin gr-paste" aria-label="the draft"></textarea><button type="button" class="gr-wide gr-go" data-s="domap">map it</button>', 'paste'); }


  /* ——— handoff bundle (exact format from the 23 Nov Grant room prototype) and load-my-current-draft ——— */
  var BUNDLE_IN = { title: 'name', summary: 'summary', describe: 'describe', why: 'why', impact: 'impact', capacity: 'capacity', timeline: 'timeline', protocol: 'tk', collaborators: 'collab', budget: 'budget', support: 'support' };
  var BUNDLE_OUT = { name: 'title', summary: 'summary', describe: 'describe', why: 'why', impact: 'impact', capacity: 'capacity', timeline: 'timeline', tk: 'protocol', collab: 'collaborators', budget: 'budget', support: 'support' };
  function secStatus(s) {
    if (s.target && len(s.text) > s.target) return 'over';
    if (marksFor(s.id).length) return 'look';
    if (!String(s.text || '').trim()) return 'empty';
    return 'ok';
  }
  function bundleOf(kind) {
    var lines = ['GRANT ROOM BUNDLE', 'version: 2', 'kind: ' + (kind || 'state'), 'program: Canada Council CKS Short-Term Projects', 'title: ' + (D.title || 'Permanent Impermanence'), 'saved: ' + nowLabel(), ''];
    D.sections.forEach(function (s) {
      if (s.id === 'types') return;
      var pid = BUNDLE_OUT[s.id] || s.id, lim = s.target == null ? 'none' : String(s.target), text = s.text || '';
      lines.push('=== SECTION ' + pid + ' | ' + s.name + ' | status=' + secStatus(s) + ' | chars=' + len(text) + ' | limit=' + lim + ' ===');
      lines.push(text);
      lines.push('=== END SECTION ' + pid + ' ===');
      lines.push('');
    });
    var kn = fork('knowing'), know = kn && kn.pick === 'yes' ? 'yes' : kn && kn.pick === 'no' ? 'no' : 'open';
    lines.push('=== ACTIVITIES ===');
    lines.push('creating: yes');
    lines.push('sharing: yes');
    lines.push('knowing: ' + know);
    if (sec('types') && sec('types').text) { lines.push('--- notes ---'); lines.push(sec('types').text); }
    lines.push('=== END ACTIVITIES ===');
    lines.push('');
    if (D.stream && String(D.stream.text || '').trim()) {
      lines.push('=== DRIFT stream | ' + nowLabel() + ' ===');
      lines.push(D.stream.text);
      lines.push('=== END DRIFT stream ===');
      lines.push('');
    }
    var prac = practiceList();
    if (prac.length) {
      lines.push('=== PRACTICE ===');
      prac.forEach(function (it) {
        lines.push('--- ' + it.id + ' | source: ' + it.source + (it.note ? ' | ' + it.note : '') + ' ---');
        lines.push(it.quote);
        if (it.also && it.also.quote) lines.push(it.also.quote);
        lines.push('');
      });
      lines.push('=== END PRACTICE ===');
      lines.push('');
    }
    pathList().forEach(function (p) {
      lines.push('=== PATH ' + p.id + ' | status=' + p.status + ' ===');
      lines.push(p.title);
      lines.push(p.why);
      lines.push('=== END PATH ' + p.id + ' ===');
      lines.push('');
    });
    (D.homes || []).forEach(function (h) {
      lines.push('=== FIND A HOME ' + (h.from || 'section') + ' | suggest=' + (h.suggest || '') + ' | status=' + (h.placed ? ('placed:' + h.placed) : 'open') + ' | chars=' + len(h.text) + ' ===');
      lines.push(h.text || '');
      lines.push('=== END FIND A HOME ' + (h.from || 'section') + ' ===');
      lines.push('');
    });
    lines.push('=== END BUNDLE ===');
    return lines.join('\n');
  }
  function copyText(text, okMsg) {
    function done(ok) { say(ok ? (okMsg || 'copied') : 'copy did not work — select and copy'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(fallbackCopy(text)); });
    }
    done(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta); ta.select();
    try { return document.execCommand('copy'); } catch (e) { return false; } finally { document.body.removeChild(ta); }
  }
  function parseBundle(raw) {
    var src = String(raw || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var start = src.indexOf('GRANT ROOM BUNDLE');
    if (start < 0) throw new Error('No GRANT ROOM BUNDLE header found.');
    var endTok = '=== END BUNDLE ===', end = src.lastIndexOf(endTok);
    var body = end > start ? src.slice(start, end + endTok.length) : src.slice(start);
    var sections = {}, m, re = /=== SECTION (\S+) \|[^\n]*===\n([\s\S]*?)=== END SECTION \1 ===/g;
    while ((m = re.exec(body))) { var tx = m[2]; if (tx.endsWith('\n')) tx = tx.slice(0, -1); sections[m[1]] = { id: m[1], text: tx }; }
    var activities = { creating: null, sharing: null, knowing: null, notes: '' };
    var actM = body.match(/=== ACTIVITIES ===\n([\s\S]*?)=== END ACTIVITIES ===/);
    if (actM) {
      var a = actM[1], yn = function (k) { var mm = a.match(new RegExp('^' + k + ':\\s*(yes|no|open)\\s*$', 'mi')); return mm ? mm[1].toLowerCase() : null; };
      activities.creating = yn('creating'); activities.sharing = yn('sharing'); activities.knowing = yn('knowing');
      var nm = a.match(/--- notes ---\n([\s\S]*?)$/); if (nm) activities.notes = nm[1].replace(/\n$/, '');
    }
    var drift = [], reD = /=== DRIFT (\S+) \| ?([^\n]*) ===\n([\s\S]*?)=== END DRIFT \1 ===/g;
    while ((m = reD.exec(body))) { var dt = m[3]; if (dt.endsWith('\n')) dt = dt.slice(0, -1); drift.push({ id: m[1], saved: (m[2] || '').trim(), text: dt }); }
    var suggestions = [], reS = /=== SUGGESTION (\S+) \| ?([^\n]*) ===\n([\s\S]*?)=== END SUGGESTION \1 ===/g;
    while ((m = reS.exec(body))) { var st = m[3]; if (st.endsWith('\n')) st = st.slice(0, -1); suggestions.push({ id: m[1], note: (m[2] || '').replace(/^note:\s*/i, '').trim(), text: st }); }
    var note = '', nM = body.match(/=== NOTE ===\n([\s\S]*?)=== END NOTE ===/); if (nM) { note = nM[1]; if (note.endsWith('\n')) note = note.slice(0, -1); }
    var kindM = body.match(/^kind:\s*(\S+)/m);
    var practice = '', prM = body.match(/=== PRACTICE ===\n([\s\S]*?)=== END PRACTICE ===/);
    if (prM) { practice = prM[1]; if (practice.endsWith('\n')) practice = practice.slice(0, -1); }
    var paths = [], reP = /=== PATH (\S+) \| ?status=([^\n]*) ===\n([\s\S]*?)=== END PATH \1 ===/g;
    while ((m = reP.exec(body))) { var pt = m[3]; if (pt.endsWith('\n')) pt = pt.slice(0, -1); paths.push({ id: m[1], status: (m[2] || '').trim(), text: pt }); }
    var homes = [], reH = /=== FIND A HOME (\S+) \| ?([^\n]*) ===\n([\s\S]*?)=== END FIND A HOME \1 ===/g;
    while ((m = reH.exec(body))) {
      var ht = m[3], meta = m[2] || '', sug = (meta.match(/suggest=(\S+)/) || [])[1] || '', st = (meta.match(/status=(\S+)/) || [])[1] || 'open', placed = st.indexOf('placed:') === 0 ? st.slice(7) : null;
      if (ht.endsWith('\n')) ht = ht.slice(0, -1);
      homes.push({ id: uid(), from: m[1], text: ht, suggest: sug, t: Date.now(), placed: placed });
    }
    return { kind: kindM ? kindM[1] : 'state', sections: sections, activities: activities, drift: drift, suggestions: suggestions, note: note, practice: practice, paths: paths, homes: homes };
  }
  function draftSeed(id) { var row = cks().sections.filter(function (s) { return s.id === id; })[0]; return row ? String(row.text || '') : ''; }
  function v9() { return (typeof window !== 'undefined' && window.OZ_CKS_V9) || null; }
  function buildPending(parsed, fromDraft) {
    var pending = [];
    if (parsed.note) pending.push({ type: 'note', note: parsed.note });
    var sugBy = {}; (parsed.suggestions || []).forEach(function (s) { sugBy[s.id] = s; });
    D.sections.forEach(function (sec0) {
      if (sec0.id === 'types') return;
      var pid = BUNDLE_OUT[sec0.id] || sec0.id;
      var incoming = sugBy[pid] || (parsed.sections[pid] ? { id: pid, text: parsed.sections[pid].text, note: '' } : (parsed.sections[sec0.id] ? { id: sec0.id, text: parsed.sections[sec0.id].text, note: '' } : null));
      if (!incoming) return;
      var mine = sec0.text || '';
      if (incoming.text === mine) return;
      var fromSug = !!sugBy[pid] || !!sugBy[sec0.id];
      pending.push({ type: 'section', id: sec0.id, name: sec0.name, text: incoming.text, note: incoming.note || (fromDraft ? 'from your current draft' : (fromSug ? '' : 'differs from your current text')), from: fromDraft ? 'draft' : (fromSug ? 'suggestion' : 'bundle') });
    });
    if (parsed.activities && parsed.activities.knowing) {
      var kn = fork('knowing'), want = parsed.activities.knowing, cur = kn && kn.pick ? (kn.pick === 'yes' ? 'yes' : kn.pick === 'no' ? 'no' : 'open') : 'open';
      if (want !== cur && want !== null) pending.push({ type: 'activities', activities: parsed.activities, note: 'Knowing is ' + want + ' in the bundle (yours is ' + cur + ')' });
    }
    (parsed.drift || []).forEach(function (d) {
      if (String(d.text || '').trim() && d.text !== (D.stream.text || '')) pending.push({ type: 'drift', item: d });
    });
    (parsed.paths || []).forEach(function (x) {
      var p = pathOf(x.id); if (!p) return;
      var want = (x.status || '').trim();
      if (PATH_ST.indexOf(want) < 0 || want === p.status) return;
      pending.push({ type: 'path', id: p.id, title: p.title, from: p.status, to: want, note: 'path “' + p.title + '” is ' + want + ' in the bundle (yours is ' + p.status + ')' });
    });
    return pending;
  }
  function paintPending() {
    var list = S.pending || [];
    var h = '<h3>suggestions</h3><p class="gr-sub">accept or skip each one. nothing is changed until you accept it.</p>';
    if (!list.length) return h + '<p class="gr-none">no suggestions waiting</p>';
    list.forEach(function (p, i) {
      if (p.type === 'note') h += '<div class="gr-ver" data-pend="' + i + '"><b>a note</b><p>' + esc(p.note) + '</p><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">dismiss</button></div>';
      else if (p.type === 'section') h += '<div class="gr-ver" data-pend="' + i + '"><b>' + esc(p.name) + '</b><p class="gr-sub">yours: ' + n(len(sec(p.id).text)) + ' characters · edit the suggestion before you accept' + (p.note ? ' · ' + esc(p.note) : '') + '</p><div class="gr-cmp"><div><em>yours</em><p>' + esc((sec(p.id).text || '(empty)').slice(0, 800)) + '</p></div><div><em>suggestion · edit before you accept</em><textarea class="gr-tin" data-sug="' + i + '" aria-label="edit this suggestion">' + esc(p.text || '') + '</textarea></div></div><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
      else if (p.type === 'activities') h += '<div class="gr-ver" data-pend="' + i + '"><b>type of activities</b><p>' + esc(p.note || '') + '</p><p>Creating: ' + esc(p.activities.creating) + ' · Sharing: ' + esc(p.activities.sharing) + ' · Knowing: ' + esc(p.activities.knowing) + '</p><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
      else if (p.type === 'drift') h += '<div class="gr-ver" data-pend="' + i + '"><b>add to free writing</b><p>' + esc((p.item.text || '').slice(0, 800)) + '</p><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
      else if (p.type === 'path') h += '<div class="gr-ver" data-pend="' + i + '"><b>path · ' + esc(p.title) + '</b><p>' + esc(p.note || '') + '</p><p>yours: ' + esc(p.from) + ' → suggestion: ' + esc(p.to) + '</p><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
    });
    return h;
  }
  function acceptPending(i) {
    var p = (S.pending || [])[i]; if (!p) return;
    if (p.type === 'section' && sec(p.id)) {
      var s0 = sec(p.id);
      var taS = el.querySelector('textarea[data-editi="' + i + '"]') || el.querySelector('textarea[data-sug="' + i + '"]') || (sheet && sheet.querySelector('textarea[data-sug="' + i + '"]'));
      if (taS) p.text = taS.value;
      if (hasHisWriting(s0) && passOf(s0.id) !== 'edit') { say('the working copy was left as it is — use edit pass to accept a suggestion'); return; }
      keepVersion(p.id, 'before accepting a suggestion');
      s0.text = p.text;
      addRipple(p.id, p.text, 0);
      logIt('accepted a suggestion on ' + sname(p.id) + ' (your yes)');
    }
    else if (p.type === 'activities' && p.activities && p.activities.knowing) {
      var want = p.activities.knowing, oid = want === 'yes' ? 'yes' : want === 'no' ? 'no' : null;
      if (oid) pick('knowing', oid);
    }
    else if (p.type === 'drift' && p.item) {
      var add = p.item.text || '';
      D.stream.text = (D.stream.text ? D.stream.text.replace(/\s+$/, '') + '\n\n' : '') + add;
    }
    else if (p.type === 'path' && p.id) { setPathStatus(p.id, p.to); }
    S.pending.splice(i, 1); saveNow(); hap('commit');
    if (S.pending.length) openSheet(paintPending(), 'import'); else { closeSheet(); paint(); say('accepted'); }
  }
  function skipPending(i) {
    if (!S.pending || !S.pending[i]) return;
    var p = S.pending[i];
    ensureState();
    if (p.type === 'section' && p.text) D.aside.unshift({ id: uid(), t: Date.now(), kind: 'suggestion', sec: p.id, title: 'skipped suggestion · ' + (p.name || p.id), text: p.text });
    S.pending.splice(i, 1); saveNow();
    if (S.pending.length && S.sheet) openSheet(paintPending(), 'import'); else { closeSheet(); paint(); say('set aside'); }
  }
  function applyDraftSilent(parsed) {
    var nSet = 0;
    D.sections.forEach(function (s) {
      if (s.id === 'types') return;
      var pid = BUNDLE_OUT[s.id] || s.id, incoming = parsed.sections[pid] || parsed.sections[s.id];
      if (!incoming) return;
      var mine = s.text || '', seed = draftSeed(s.id);
      if (incoming.text === mine) return;
      if (!String(mine).trim() || mine === seed) { keepVersion(s.id, 'before loading current draft'); s.text = incoming.text; nSet++; }
    });
    if (nSet) { logIt('loaded the current CKS draft into ' + nSet + ' section' + (nSet === 1 ? '' : 's')); saveNow(); }
    return nSet;
  }
  function loadCurrentDraft() {
    var data = v9();
    if (!data || !data.sections) { say('the current draft file is not in this preview'); return; }
    var parsed = { kind: 'draft', sections: {}, activities: data.activities || {}, drift: [], suggestions: [], note: '' };
    Object.keys(data.sections).forEach(function (k) { parsed.sections[k] = { id: k, text: data.sections[k] }; });
    var conflicts = buildPending(parsed, true).filter(function (p) { return p.type === 'section' && String(sec(p.id).text || '').trim() && sec(p.id).text !== draftSeed(p.id); });
    /* never write the draft file into the working copy — it lives in reference */
    S.refOpen = true;
    if (passOf(S.cur) !== 'gather') setPass(S.cur, 'gather');
    paint();
    say('the draft file is in reference · the working copy is yours');
  }
  function importSheet() {
    var kept = D.importDraft || '';
    openSheet('<h3>import a bundle</h3><p class="gr-sub">paste a GRANT ROOM BUNDLE. suggestions never overwrite your text until you accept them. no network from this room.</p><textarea class="gr-tin gr-paste" aria-label="a grant room bundle" placeholder="paste a GRANT ROOM BUNDLE here">' + esc(kept) + '</textarea><button type="button" class="gr-wide gr-go" data-s="doread">read bundle</button>', 'import');
  }

  /* ——— input ——— */
  el.addEventListener('toggle', function (e) { var t = e.target; if (t.classList && t.classList.contains('gr-marks')) S.openMarks = t.open; if (t.classList && t.classList.contains('gr-holds')) S.openHolds = t.open; }, true);
  el.addEventListener('change', function () { persistAll(); }, true);
  el.addEventListener('blur', function (e) { if (e.target && e.target.tagName === 'TEXTAREA') persistAll(); }, true);
  el.addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList.contains('gr-ta') && t.dataset.sec) { t.dataset.dirty = '1'; var s = sec(t.dataset.sec); s.text = t.value; S.spot = D.spot = { tab: 'write', cur: s.id, layer: S.layer || null, scroll: body.scrollTop || 0, caret: t.selectionStart, caretEnd: t.selectionEnd }; saveNow(); var c = el.querySelector('.gr-count'); if (c) c.textContent = counter(s); clearTimeout(t._p); t._p = setTimeout(function () { paintSpine(); var I = insights(s), box = el.querySelector('.gr-ins-s'); if (box && S.layer !== 'insights') box.innerHTML = I.slice(0, 3).map(function (x) { return '<p class="gr-i-' + x.k + '">' + esc(x.t) + '</p>'; }).join(''); }, 400); }
    if (t.dataset.free) { t.dataset.dirty = '1'; D.stream.text = t.value; saveNow(); }
    if (t.classList.contains('gr-tin') && t.classList.contains('gr-paste')) { D.importDraft = t.value; saveNow(); }
    else if (t.classList.contains('gr-tin') && S.threadKey) { D.threadDrafts = D.threadDrafts || {}; D.threadDrafts[S.threadKey] = t.value; saveNow(); }
    if (t.dataset && t.dataset.offerId && S.fillOffers) {
      S.fillOffers.forEach(function (o) { if (o.id === t.dataset.offerId) o.proposed = t.value; });
    }
    if (t.dataset && (t.dataset.editi || t.dataset.sug) && S.pending) {
      var pi = +(t.dataset.editi || t.dataset.sug); if (S.pending[pi]) S.pending[pi].text = t.value;
    }
  });
  el.addEventListener('click', function (e) {
    var line = e.target.closest('.gr-refline');
    if (line && !e.target.closest('button')) {
      Array.prototype.forEach.call(el.querySelectorAll('.gr-refline'), function (x) { x.classList.remove('on'); });
      line.classList.add('on');
      S.refPick = line.dataset.lk;
      return;
    }
    var b = e.target.closest('button, [data-go]'); if (!b) return; var d = b.dataset;
    if (b.closest('.gr-sheet')) return sheetClick(b);
    if (d.tab) {
      if (d.tab === 'choices' || d.tab === 'path') {
        S.tab = 'write'; S.toolsOpen = true; S.refOpen = true; hap('tick'); paint();
        var dec = el.querySelector('.gr-decisions'); if (dec && dec.scrollIntoView) dec.scrollIntoView({ block: 'nearest' });
        return;
      }
      S.tab = d.tab; hap('tick'); paint(); body.scrollTop = 0; return;
    }
    if (d.sec && !d.a && b.classList.contains('gr-sec')) { S.cur = d.sec; S.tab = 'write'; S.pi = 0; S.openMarks = false; hap('tick'); paint(); body.scrollTop = 0; var x = el.querySelector('.gr-sec.on'); if (x && x.scrollIntoView) x.scrollIntoView({ inline: 'center', block: 'nearest' }); return; }
    if (d.go) {
      var g = d.go.split(':');
      S.tab = 'write'; S.toolsOpen = true; S.refOpen = true;
      paint();
      var node = el.querySelector((g[0] === 'path' ? '[data-path="' : '[data-fork="') + g[1] + '"]');
      if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (d.layer) { S.layer = S.layer === d.layer ? null : d.layer; S.pi = 0; hap('tick'); paintWrite(); return; }
    if (d.pick) { var p = d.pick.split(':'); if (pick(p[0], p[1])) { hap('commit'); var f2 = fork(p[0]), o2 = opt(f2, p[1]); say('marked ' + (o2.marks || f2.marks || []).length + ' sections · nothing rewritten'); paint(); } return; }
    if (d.mk) { var M = D.marks.filter(function (m) { return m.id === b.closest('[data-mark]').dataset.mark; })[0]; if (!M) return;
      if (d.mk === 'ok') { M.state = 'looked'; M.done = Date.now(); logIt('looked at a mark on ' + sname(M.sec) + ' · fine'); save(); paint(); }
      if (d.mk === 'cmp') versions(M.sec);
      if (d.mk === 'thread') openThread('mark:' + M.id, sname(M.sec) + ' · a mark', M.why);
      return; }
    if (d.place) { var q = d.place.split(':'), ps = (S.mapped || []).filter(function (x) { return x.id === q[0]; })[0], s = sec(q[1]); if (!ps || !s) return;
      keepVersion(s.id, 'before placing free writing'); s.text = (String(s.text || '').replace(/\s+$/, '') + (s.text ? '\n\n' : '') + ps.text); ps.state = 'placed in ' + sname(s.id); logIt('placed a passage in ' + sname(s.id) + ' (your yes)'); saveNow(); hap('commit'); paint(); return; }
    var a = d.a; if (!a) return;
    if (a === 'another') { S.pi++; hap('tick'); paintWrite(); return; }
    if (a === 'pstat') { if (setPathStatus(d.p, d.st)) { hap('commit'); var pp = pathOf(d.p); say('marked ' + ((pp && pp.secs) || []).length + ' sections · nothing rewritten'); paint(); } return; }
    if (a === 'qthread') {
      var ctx = '';
      if (S.layer === 'practice') { var pl = practiceFor(S.cur), it = pl[S.pi % pl.length]; if (it) ctx = 'practice · you once said: “' + echoOf(it) + '.”'; }
      else if (S.layer === 'paths') { var pa = pathsFor(S.cur), pt = pa[S.pi % pa.length]; if (pt) ctx = 'path · ' + pt.title + ' (' + pt.status + ')'; }
      else { var prq = promptsFor(S.cur)[S.pi % promptsFor(S.cur).length]; if (prq) ctx = prq[0] + ' · ' + prq[1]; }
      openThread('sec:' + S.cur, sname(S.cur) + ' · thread', ctx); return;
    }
    if (a === 'sthread') { openThread('sec:' + S.cur, sname(S.cur) + ' · thread'); return; }
    if (a === 'fthread') { var ff = fork(d.f); openThread('fork:' + ff.id, 'a choice · ' + ff.q, ff.pick ? 'your pick: ' + opt(ff, ff.pick).label : 'still open'); return; }
    if (a === 'pthread') { openThread('stream', 'free writing · thread'); return; }
    if (a === 'suggest') { suggest(); return; }
    if (a === 'keep') { keepVersion(S.cur, 'kept'); saveNow(); hap('tick'); say('kept a version of ' + sname(S.cur)); paintWrite(); return; }
    if (a === 'versions') { versions(S.cur); return; }
    if (a === 'branch') { var fb = fork(d.f), B = D.branches[fb.id], k = Object.keys(B)[0], br = B[k];
      openSheet('<h3>the earlier branch · ' + esc(opt(fb, k).label) + '</h3><p class="gr-sub">the writing as it was when that was your pick, beside now. to step back, change the pick, then use versions.</p>' +
        D.sections.filter(function (s) { return (br.secs[s.id] || '') !== (s.text || ''); }).map(function (s) { return '<div class="gr-ver"><b>' + esc(s.short || s.name) + '</b><div class="gr-cmp"><div><em>then</em><p>' + esc(br.secs[s.id] || '(empty)') + '</p></div><div><em>now</em><p>' + esc(s.text || '(empty)') + '</p></div></div></div>'; }).join('') || '<p class="gr-none">no section has changed since</p>', 'branch'); return; }
    if (a === 'map') { S.mapped = map(D.stream.text); hap('tick'); paintFree(); if (!S.mapped.length) say('nothing to map yet'); return; }
    if (a === 'paste') { paste(); return; }
    if (a === 'loaddraft') { loadCurrentDraft(); return; }
    if (a === 'tools') { S.toolsOpen = !S.toolsOpen; if (S.toolsOpen) S.refOpen = true; paint(); return; }
    if (a === 'addwriting') { var ta = el.querySelector('.gr-add-ta'); addWriting(ta ? ta.value : ''); return; }
    if (a === 'takeoffer') { takeOffer(d.id); return; }
    if (a === 'keepoffer') { keepOffer(d.id); return; }
    if (a === 'send') { sendToAgent(); return; }
    if (a === 'copybundle') { copyBundle(); return; }
    if (a === 'closesend') { closeSend(); return; }
    if (a === 'ref') { S.refOpen = !S.refOpen; paintRef(); return; }
    if (a === 'pass') { setPass(S.cur, d.p); return; }
    if (a === 'movemain') {
      var k = d.k, pick = S.refPick;
      if (pick && S.refs[pick] && (!k || String(pick).indexOf(k) === 0 || String(pick).indexOf(String(k) + '~') === 0)) k = pick;
      moveToMain(S.refs[k] || '', k); S.refPick = null; return;
    }
    if (a === 'copytonotes') { copyWorkingToNotes(); return; }
    if (a === 'usetrim') { applyTrim(S.cur); return; }
    if (a === 'placehome') { placeHome(d.id, d.sec); return; }
    if (a === 'aside') {
      ensureState();
      var tx = S.refs[d.k] || '';
      if (tx) D.aside.unshift({ id: uid(), t: Date.now(), kind: 'ref', sec: S.cur, title: 'set aside', text: tx, key: d.k });
      if (d.k && d.k.indexOf('ver:') === 0) {
        var ev = earlierFor(S.cur), ix = +d.k.split(':').pop();
        if (ev[ix]) ev[ix].aside = true;
      }
      saveNow(); paint(); return;
    }
    if (a === 'unaside') {
      D.aside = (D.aside || []).filter(function (x) { return x.id !== d.id; });
      saveNow(); paint(); return;
    }
    if (a === 'editok') { setPass(S.cur, 'edit'); acceptPending(+d.i); paint(); return; }
    if (a === 'editchange') {
      if (S.editChange === +d.i) {
        var tae = el.querySelector('textarea[data-editi="' + d.i + '"]');
        if (tae && S.pending[d.i]) S.pending[d.i].text = tae.value;
        setPass(S.cur, 'edit'); acceptPending(+d.i); S.editChange = null; paint(); return;
      }
      S.editChange = +d.i; paint(); return;
    }
    if (a === 'editskip') { skipPending(+d.i); paint(); return; }
    if (a === 'import') { importSheet(); return; }
    if (a === 'listen') { setListen(!listenOn); hap('tick'); say(listenOn ? 'sea is on · the writing stays yours' : 'sea is off'); return; }
    if (a === 'red') { if (GJ.redmode && GJ.redmode.toggle) GJ.redmode.toggle(); else html.classList.toggle('red'); hap('tick'); return; }
    if (a === 'quiet') { setQuiet(true); return; }
    if (a === 'unquiet') { setQuiet(false); return; }
    if (a === 'ripples') { ensureState(); D.rippleOn = !D.rippleOn; saveNow(); paint(); return; }
    if (a === 'final') { setFinal(true); return; }
    if (a === 'unfinal') { setFinal(false); return; }
    if (a === 'copysec') { copySection(d.id); return; }
    if (a === 'moon') { openMoon(); return; }
    if (a === 'how') { showHow(true); return; }
    if (a === 'howx') { hideHow(); return; }
    if (a === 'ask') { openAsk(); return; }
    if (a === 'askgo') { runAsk(); return; }
    if (a === 'askx') { closeAsk(); return; }
    if (a === 'pullnote') { pullSheet(); return; }
    if (a === 'leave') { var pl = S.mapped.filter(function (x) { return x.id === d.p; })[0]; if (pl) pl.state = 'left in free writing'; paintFree(); return; }
    if (a === 'elsewhere') { var pe = S.mapped.filter(function (x) { return x.id === d.p; })[0]; if (!pe) return;
      openSheet('<h3>where does it go?</h3><q class="gr-qt">' + esc(pe.text.slice(0, 200)) + '</q>' + D.sections.filter(function (s) { return !s.kind; }).map(function (s) { return '<button type="button" class="gr-wide" data-s="placeto" data-p="' + pe.id + '" data-sec="' + s.id + '">yes · place in ' + esc(s.short || s.name) + '</button>'; }).join(''), 'where'); return; }
  });
  function sheetClick(b) {
    var d = b.dataset, s;
    if (d.s === 'x') return closeSheet();
    if (d.s === 'tadd') { var v = sheet.querySelector('.gr-tin').value.trim(); if (!v) return; var T = thread(d.k); T.items.push({ t: Date.now(), text: v, ctx: d.c || '' }); T.t = Date.now(); toNotes(d.k); if (D.threadDrafts) delete D.threadDrafts[d.k]; saveNow(); hap('tick'); openThread(d.k, T.title, d.c); return; }
    if (d.s === 'back') { s = sec(d.sec); var V = D.versions[d.sec][+d.i]; keepVersion(s.id, 'before stepping back'); s.text = V.text; logIt('stepped back to an earlier ' + sname(s.id) + ' (your yes)'); saveNow(); closeSheet(); paint(); return; }
    if (d.s === 'cut') { s = sec(S.cur); var dr = drifts(s)[+d.i]; if (!dr) return; keepVersion(s.id, 'before taking a line out'); s.text = s.text.replace(dr.line, '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); logIt('took a line out of ' + sname(s.id) + ' (your yes)'); saveNow(); closeSheet(); paint(); return; }
    if (d.s === 'helper') {
      var A = P && P.get ? P.get('grantAssist') : null, out = sheet.querySelector('.gr-hres');
      if (GJ.f3 && GJ.f3.block && GJ.f3.block()) { out.textContent = 'network is blocked in F3 · nothing was asked'; return; }
      var rel = GJ.f3 && GJ.f3.hold ? GJ.f3.hold('grant · asked the writing helper about ' + sname(S.cur) + ' (preview stub: nothing sent)', 'writing helper · cloud') : null;
      out.textContent = 'asking · F3 is lit'; b.disabled = true;
      (A ? A.suggest({ section: S.cur, text: sec(S.cur).text }) : Promise.resolve({ offers: [], stub: true })).then(function (r) {
        if (rel) rel(r && r.stub ? 'answered · preview stub' : 'answered'); out.textContent = (r && r.note) || (r && r.offers && r.offers.length ? r.offers.length + ' offers' : 'nothing offered'); b.disabled = false; });
      return; }
    if (d.s === 'domap') { var t = sheet.querySelector('.gr-paste').value; if (!t.trim()) return; S.mapped = map(t); D.stream.mapped = []; closeSheet(); S.tab = 'free'; paint(); return; }
    if (d.s === 'placeto') { var ps = S.mapped.filter(function (x) { return x.id === d.p; })[0]; s = sec(d.sec); if (!ps || !s) return; keepVersion(s.id, 'before placing free writing'); s.text = (String(s.text || '').replace(/\s+$/, '') + (s.text ? '\n\n' : '') + ps.text); ps.state = 'placed in ' + sname(s.id); logIt('placed a passage in ' + sname(s.id) + ' (your yes)'); saveNow(); closeSheet(); paint(); return; }
    if (d.s === 'doread') {
      try {
        var parsed = parseBundle((sheet.querySelector('.gr-paste') || {}).value || '');
        if (parsed.homes && parsed.homes.length) {
          ensureState();
          parsed.homes.forEach(function (h) {
            if (D.homes.some(function (x) { return x.text === h.text && x.from === h.from; })) return;
            D.homes.push(h);
          });
          saveNow();
        }
        S.pending = buildPending(parsed, false);
        if (!S.pending.length) { say(parsed.homes && parsed.homes.length ? 'find-a-home items were kept' : 'bundle matches what you already have'); closeSheet(); paint(); return; }
        setPass(S.cur, 'edit');
        closeSheet();
        paint();
        say('suggestions are in edit pass · the working copy is unchanged until you accept one');
      } catch (err) { say(err.message || 'could not read that bundle'); }
      return;
    }
    if (d.s === 'pendok') { acceptPending(+d.i); return; }
    if (d.s === 'pendskip') { skipPending(+d.i); return; }
    if (d.s === 'pullsec') { if (pullNote(d.id, S.cur)) { hap('commit'); closeSheet(); paint(); say('the note is in ' + sname(S.cur)); } return; }
    if (d.s === 'pulldrift') { if (pullNote(d.id, 'drift')) { hap('commit'); closeSheet(); S.tab = 'free'; paint(); say('the note is in free writing'); } return; }
  }
  el.querySelector('.gr-tabs').addEventListener('click', function () {}, false);
  el.addEventListener('scroll', function (e) { if (e.target && e.target.classList && e.target.classList.contains('gr-ta')) paintRipples(); }, true);
  el.addEventListener('input', function (e) { if (e.target && e.target.classList && e.target.classList.contains('gr-ta')) paintRipples(); }, true);


  var tickT = 0;
  function open(id) {
    if (S.on) { if (id && sec(id)) { S.cur = id; S.tab = 'write'; paint(); } return; }
    load(); S.on = true; S.toolsOpen = false;
    if (id && sec(id)) { S.cur = id; S.tab = 'write'; } else restoreSpot();
    offerForeignDrafts();
    migrateFoundation();
    autoFillEmptyOrStale();
    paint(); el.hidden = false; html.classList.add('granting'); applyTune();
    if (!D.hints || !D.hints.how) showHow(true);
    requestAnimationFrame(function () { el.classList.add('in'); placeSpot(); if (!D.hints || !D.hints.how) showHow(true); }); hap('commit');
    clearInterval(tickT); tickT = setInterval(function () { if (S.on) { $('.gr-due').textContent = dueLine(due()); } }, 30000);
  }
  function close() {
    if (!S.on) return;
    captureSpot(); persistAll();
    if (listenOn) setListen(false);
    S.quiet = false; S.finalOn = false;
    S.on = false; saveNow(); clearInterval(tickT);
    S.sheet = null; S.threadKey = null; sheet.classList.remove('in'); sheet.hidden = true;
    el.classList.remove('in'); html.classList.remove('granting');
    setTimeout(function () { if (!S.on) el.hidden = true; }, 380);
  }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (S.on) { persistAll(); if (S.sendOn) { closeSend(); return true; } if (S.howOn) { hideHow(); return true; } if (S.askOn) { closeAsk(); return true; } if (S.finalOn) { setFinal(false); return true; } if (S.quiet) { setQuiet(false); return true; } if (S.sheet) { closeSheet(); return true; } close(); return true; } return ca0.apply(this, arguments); }; }
  GJ.grant = { open: open, close: close, isOpen: function () { return S.on; }, go: function (id) { S.cur = id; S.tab = 'write'; if (S.on) paint(); },
    tab: function (t) { S.tab = t; if (S.on) paint(); }, pick: function (f, o) { var r = pick(f, o); if (S.on) paint(); return r; }, map: function (t) { return map(t); },
    write: function (id, text) { var s = sec(id); if (s) { s.text = text; saveNow(); if (S.on) paint(); } },   // for tests: puts text in as if typed
    state: function () { load(); return { sections: D.sections.map(function (s) { return { id: s.id, chars: len(s.text), target: s.target || null, marks: marksFor(s.id).length, provisional: waitsOn(s.id).map(function (f) { return f.id; }) }; }),
      forks: D.forks.map(function (f) { return { id: f.id, pick: f.pick, changes: f.history.length }; }), paths: pathList().map(function (p) { return { id: p.id, status: p.status }; }), practice: practiceList().length, marks: D.marks.filter(function (m) { return m.state === 'open'; }).length, threads: Object.keys(D.threads), due: due(), f3: !!(GJ.f3 && GJ.f3.lit && GJ.f3.lit()), listen: !!listenOn, listenSrc: listenAudio ? listenAudio.src : seaSrc(), spot: D.spot || S.spot || null, type: (el && el.style && el.style.getPropertyValue('--type')) || '1' }; },
    insights: function (id) { load(); return insights(sec(id)); }, reset: function () { D = cks(); seedMarks(D); attachLayers(); ensureState(); saveNow(); if (S.on) paint(); }, bundle: function (k) { load(); return bundleOf(k || 'state'); }, loadDraft: function () { loadCurrentDraft(); }, listen: function (on) { if (on == null) return !!listenOn; return setListen(!!on); }, sea: function () { return listenAudio; }, pull: function (id, where) { return pullNote(id, where); }, spot: function () { return D.spot || S.spot || null; },
    text: function (id) { var s = sec(id); return s ? (s.text || '') : ''; }, versions: function (id) { return ((D.versions || {})[id] || []).map(function (v) { return { label: v.label, chars: len(v.text) }; }); }, applyBundle: function (raw) { applyBundleState(raw); },
    quiet: function (on) { if (on == null) return !!S.quiet; setQuiet(!!on); return !!S.quiet; },
    finalView: function (on) { if (on == null) return !!S.finalOn; setFinal(!!on); return !!S.finalOn; },
    used: function (k) { return isUsed(k); } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'grant', name: 'grant', sub: 'a proposal', cl: 'make', open: function () { open(); } });
  if (GJ.store && GJ.store.on) GJ.store.on(function () { if (S.on) applyTune(); });
})(window);
