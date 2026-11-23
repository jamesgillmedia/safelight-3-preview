/* grant (Grant room brief, 23 Nov 2026) · a room that holds the framework of a proposal, so the ideas and the writing grow
   in Gill's own words. Familiar first: the funder's form in section order, a character count on each, the deadline in
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
  function load() { try { D = JSON.parse(GJ.settings.getItem(KEY) || 'null'); } catch (e) { D = null; } if (!D || D.v !== 1) { D = cks(); seedMarks(D); } attachLayers(); save(); }
  var saveT = 0; function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { GJ.settings.setItem(KEY, JSON.stringify(D)); } catch (e) {} }, 250); }
  function saveNow() { clearTimeout(saveT); try { GJ.settings.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
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
    '<header class="gr-spine" aria-label="the spine"><div class="gr-sp1"><b class="gr-t"></b><span class="gr-due" role="timer"></span></div><div class="gr-crit"></div><nav class="gr-secs" aria-label="sections"></nav>' +
    '<nav class="gr-tools" aria-label="draft and handoff"><button type="button" data-a="loaddraft">load my current draft</button><button type="button" data-a="send">send to agent</button><button type="button" data-a="import">import</button><button type="button" class="gr-listen" data-a="listen" aria-pressed="false">sea</button></nav></header>' +
    '<div class="gr-body" role="region" aria-live="polite"></div>' +
    '<nav class="gr-tabs" role="tablist" aria-label="grant">' + [['write', 'write'], ['choices', 'choices'], ['path', 'path'], ['free', 'free write'], ['threads', 'threads']].map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</nav>' +
    '<div class="gr-sheet" hidden role="dialog"></div>';
  document.body.appendChild(el);
  function $(s) { return el.querySelector(s); }
  var body = $('.gr-body'), sheet = $('.gr-sheet');
  var S = { on: false, tab: 'write', cur: 'summary', layer: null, pi: 0, sheet: null, mapped: null };

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
    var I = insights(s), Pp = promptsFor(s.id), pr = Pp.length ? Pp[S.pi % Pp.length] : null;
    var h = '<div class="gr-head"><h2>' + esc(s.name) + '</h2><span class="gr-carries">carries · ' + esc(carries(s)) + '</span></div>';
    if (W.length) h += '<div class="gr-pv">' + W.map(function (f) { return '<button type="button" data-go="fork:' + f.id + '">provisional · waits on: ' + esc(f.q) + '</button>'; }).join('') + '</div>';
    if (holds.length) h += '<details class="gr-holds"' + (S.openHolds ? ' open' : '') + '><summary><b>decided · ' + holds.length + '</b></summary>' + holds.map(function (x) { return '<span>' + esc(x.text) + '</span>'; }).join('') + '</details>';   // my call: folded, so the writing stays near the top
    if (M.length) h += '<details class="gr-marks"' + (S.openMarks ? ' open' : '') + '><summary><b>may need a look · ' + M.length + '</b><span>marks from choices · nothing was rewritten</span></summary>' + M.map(function (m) { return '<div class="gr-mark" data-mark="' + m.id + '"><b>' + (m.back ? 'may need a look' : 'ahead') + '</b><span>' + esc(m.why) + '</span><div><button type="button" data-mk="ok">looked · fine</button>' + ((D.versions[s.id] || []).length ? '<button type="button" data-mk="cmp">earlier version</button>' : '') + '<button type="button" data-mk="thread">thread</button></div></div>'; }).join('') + '</details>';
    if (s.kind === 'types') {
      var kn = fork('knowing');
      h += '<div class="gr-types"><span class="on">creating</span><span class="' + (kn.pick === 'yes' ? 'on' : kn.pick ? 'off' : 'q') + '" data-go="fork:knowing">knowing' + (kn.pick ? '' : ' ?') + '</span><span class="on">sharing</span></div>';
    } else {
      h += '<textarea class="gr-ta" data-sec="' + s.id + '" spellcheck="true" aria-label="' + esc(s.name) + ', in your words" placeholder="' + (s.kind === 'items' ? 'one item per line' : 'in your words') + '">' + esc(s.text) + '</textarea>';
    }
    h += '<div class="gr-count" aria-live="polite">' + esc(counter(s)) + '</div>';
    h += '<div class="gr-prompt"><div class="gr-layers" role="radiogroup" aria-label="prompt layer">' + LAYERS.map(function (l) { return '<button type="button" role="radio" data-layer="' + l + '" aria-checked="' + (S.layer === l) + '">' + l + '</button>'; }).join('') + '</div>';
    if (S.layer === 'insights') h += '<div class="gr-ins">' + (I.length ? I.map(function (x) { return '<p class="gr-i-' + x.k + '">' + esc(x.t) + (x.line ? '<q>' + esc(x.line.slice(0, 140)) + '</q>' : '') + (x.go ? ' <button type="button" data-go="' + x.go + '">look</button>' : '') + '</p>'; }).join('') : '<p>nothing to note yet</p>') + '<em>simple checks on this phone · they inform, they never rewrite</em></div>';
    else if (S.layer === 'practice') {
      var PL = practiceFor(s.id), it = PL.length ? PL[S.pi % PL.length] : null;
      if (it) {
        h += '<div class="gr-pr" data-practice="' + esc(it.id) + '"><b>practice</b><q>' + esc(it.quote) + '</q>' + (it.also && it.also.quote ? '<q>' + esc(it.also.quote) + '</q>' : '') + '<em>' + esc(it.source) + (it.note ? ' · ' + esc(it.note) : '') + '</em><p class="gr-q">you once said: “' + esc(echoOf(it)) + '.” does this section still hold that, in your words?</p></div>';
        h += '<div class="gr-qa"><button type="button" data-a="another">another</button><button type="button" data-a="qthread">thread</button></div>';
      } else h += '<p class="gr-none">practice notes are not in this preview</p>';
    } else if (S.layer === 'paths') {
      var PA = pathsFor(s.id), pt = PA.length ? PA[S.pi % PA.length] : null;
      if (pt) {
        var ask = pt.status === 'open' ? ('this section may be waiting on your path “' + pt.title + ',” which is still open. want to leave a note, or leave it open?') : ('this echoes your path “' + pt.title + '” (' + pt.status + '). still true in this section?');
        h += '<div class="gr-pr" data-path="' + esc(pt.id) + '"><b>paths · ' + esc(pt.status) + '</b><p class="gr-path-t">' + esc(pt.title) + '</p><p>' + esc(pt.why) + '</p><p class="gr-q">' + esc(ask) + '</p>' + pathStatusBtns(pt) + '</div>';
        h += '<div class="gr-qa"><button type="button" data-a="another">another</button><button type="button" data-go="path:' + esc(pt.id) + '">all paths</button><button type="button" data-a="qthread">thread</button></div>';
      } else h += '<p class="gr-none">paths are not in this preview</p>';
    }
    else if (pr) h += '<p class="gr-q"><b>' + pr[0] + '</b>' + esc(pr[1]) + '</p><div class="gr-qa"><button type="button" data-a="another">another</button><button type="button" data-a="qthread">thread</button><button type="button" data-a="suggest">ask for a suggestion</button></div>';
    h += '</div>';
    if (S.layer !== 'insights' && I.length) h += '<div class="gr-ins gr-ins-s">' + I.slice(0, 3).map(function (x) { return '<p class="gr-i-' + x.k + '">' + esc(x.t) + '</p>'; }).join('') + '</div>';
    var V = D.versions[s.id] || [];
    h += '<div class="gr-foot"><button type="button" data-a="keep">keep a version</button>' + (V.length ? '<button type="button" data-a="versions">versions · ' + V.length + '</button>' : '') + '<button type="button" data-a="sthread">thread on this section</button><button type="button" data-a="pullnote">pull a note</button></div>';
    if (s.id === 'support') h += '<div class="gr-coming"><p><b>voice memo</b><i>coming</i> · on the phone, a memo can sit with the support material</p><p><b>Motion Index stills</b><i>coming</i> · stills from a clip can sit with the support material</p></div>';
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
    var h = '<p class="gr-lead">free writing, in your words. the spine and insights are up top when you want them; nothing here interrupts. when you are ready, map it.</p>' +
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
  }

  /* ——— sheets ——— */
  function openSheet(h, kind) { S.sheet = kind || 'x'; sheet.innerHTML = h + '<button type="button" class="gr-wide gr-soft" data-s="x">close</button>'; sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('in'); }); var f = sheet.querySelector('textarea, button'); if (f) f.focus(); }
  function closeSheet() { S.sheet = null; sheet.classList.remove('in'); setTimeout(function () { if (!sheet.classList.contains('in')) sheet.hidden = true; }, 260); }
  function openThread(key, title, ctx) {
    var T = thread(key, title); save();
    openSheet('<h3>' + esc(T.title) + '</h3>' + (ctx ? '<p class="gr-sub">' + esc(ctx) + '</p>' : '') + '<div class="gr-titems">' + (T.items.length ? T.items.map(function (x) { return '<p><i>' + when(x.t) + '</i>' + esc(x.text) + '</p>'; }).join('') : '<p class="gr-none">empty · the thinking around the draft goes here</p>') + '</div>' +
      '<textarea class="gr-tin" aria-label="add to the thread" placeholder="a thought, in your words"></textarea><button type="button" class="gr-wide gr-go" data-s="tadd" data-k="' + esc(key) + '" data-c="' + esc(ctx || '') + '">add to the thread</button>', 'thread');
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
    return { kind: kindM ? kindM[1] : 'state', sections: sections, activities: activities, drift: drift, suggestions: suggestions, note: note, practice: practice, paths: paths };
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
      else if (p.type === 'section') h += '<div class="gr-ver" data-pend="' + i + '"><b>' + esc(p.name) + '</b><p class="gr-sub">yours: ' + n(len(sec(p.id).text)) + ' characters → suggestion: ' + n(len(p.text)) + ' characters' + (p.note ? ' · ' + esc(p.note) : '') + '</p><div class="gr-cmp"><div><em>yours</em><p>' + esc((sec(p.id).text || '(empty)').slice(0, 800)) + '</p></div><div><em>suggestion</em><p>' + esc((p.text || '(empty)').slice(0, 800)) + '</p></div></div><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
      else if (p.type === 'activities') h += '<div class="gr-ver" data-pend="' + i + '"><b>type of activities</b><p>' + esc(p.note || '') + '</p><p>Creating: ' + esc(p.activities.creating) + ' · Sharing: ' + esc(p.activities.sharing) + ' · Knowing: ' + esc(p.activities.knowing) + '</p><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
      else if (p.type === 'drift') h += '<div class="gr-ver" data-pend="' + i + '"><b>add to free writing</b><p>' + esc((p.item.text || '').slice(0, 800)) + '</p><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
      else if (p.type === 'path') h += '<div class="gr-ver" data-pend="' + i + '"><b>path · ' + esc(p.title) + '</b><p>' + esc(p.note || '') + '</p><p>yours: ' + esc(p.from) + ' → suggestion: ' + esc(p.to) + '</p><button type="button" class="gr-wide gr-go" data-s="pendok" data-i="' + i + '">accept</button><button type="button" class="gr-wide gr-soft" data-s="pendskip" data-i="' + i + '">skip</button></div>';
    });
    return h;
  }
  function acceptPending(i) {
    var p = (S.pending || [])[i]; if (!p) return;
    if (p.type === 'section' && sec(p.id)) { keepVersion(p.id, 'before accepting a suggestion'); sec(p.id).text = p.text; logIt('accepted a suggestion on ' + sname(p.id) + ' (your yes)'); }
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
  function skipPending(i) { if (!S.pending || !S.pending[i]) return; S.pending.splice(i, 1); if (S.pending.length) openSheet(paintPending(), 'import'); else { closeSheet(); paint(); say('skipped'); } }
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
    var loaded = applyDraftSilent(parsed);
    if (conflicts.length) { S.pending = conflicts; openSheet('<p class="gr-sub">' + (loaded ? 'empty sections were filled from your current draft. ' : '') + 'these sections already have your writing. accept to use the saved draft, or skip to keep what you typed.</p>' + paintPending(), 'import'); }
    else { paint(); say(loaded ? 'current draft loaded' : 'this already matches your current draft'); }
  }
  function importSheet() {
    openSheet('<h3>import a bundle</h3><p class="gr-sub">paste a GRANT ROOM BUNDLE. suggestions never overwrite your text until you accept them. no network from this room.</p><textarea class="gr-tin gr-paste" aria-label="a grant room bundle" placeholder="paste a GRANT ROOM BUNDLE here"></textarea><button type="button" class="gr-wide gr-go" data-s="doread">read bundle</button>', 'import');
  }

  /* ——— input ——— */
  el.addEventListener('toggle', function (e) { var t = e.target; if (t.classList && t.classList.contains('gr-marks')) S.openMarks = t.open; if (t.classList && t.classList.contains('gr-holds')) S.openHolds = t.open; }, true);
  el.addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList.contains('gr-ta') && t.dataset.sec) { var s = sec(t.dataset.sec); s.text = t.value; S.spot = D.spot = { tab: 'write', cur: s.id, layer: S.layer || null, scroll: body.scrollTop || 0, caret: t.selectionStart, caretEnd: t.selectionEnd }; save(); var c = el.querySelector('.gr-count'); if (c) c.textContent = counter(s); clearTimeout(t._p); t._p = setTimeout(function () { paintSpine(); var I = insights(s), box = el.querySelector('.gr-ins-s'); if (box && S.layer !== 'insights') box.innerHTML = I.slice(0, 3).map(function (x) { return '<p class="gr-i-' + x.k + '">' + esc(x.t) + '</p>'; }).join(''); }, 400); }
    if (t.dataset.free) { D.stream.text = t.value; save(); }
  });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button, [data-go]'); if (!b) return; var d = b.dataset;
    if (b.closest('.gr-sheet')) return sheetClick(b);
    if (d.tab) { S.tab = d.tab; S.mapped = d.tab === 'free' ? S.mapped : S.mapped; hap('tick'); paint(); body.scrollTop = 0; return; }
    if (d.sec) { S.cur = d.sec; S.tab = 'write'; S.pi = 0; S.openMarks = false; hap('tick'); paint(); body.scrollTop = 0; var x = el.querySelector('.gr-sec.on'); if (x && x.scrollIntoView) x.scrollIntoView({ inline: 'center', block: 'nearest' }); return; }
    if (d.go) { var g = d.go.split(':'); if (g[0] === 'fork') { S.tab = 'choices'; paint(); var f = el.querySelector('[data-fork="' + g[1] + '"]'); if (f) body.scrollTop = f.offsetTop - 8; } else if (g[0] === 'path') { S.tab = 'path'; paint(); var px = el.querySelector('[data-path="' + g[1] + '"]'); if (px) body.scrollTop = px.offsetTop - 8; } return; }
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
    if (a === 'send') { copyText(bundleOf('state'), 'bundle copied — paste it into our chat'); return; }
    if (a === 'import') { importSheet(); return; }
    if (a === 'listen') { setListen(!listenOn); hap('tick'); say(listenOn ? 'sea is on · the writing stays yours' : 'sea is off'); return; }
    if (a === 'pullnote') { pullSheet(); return; }
    if (a === 'leave') { var pl = S.mapped.filter(function (x) { return x.id === d.p; })[0]; if (pl) pl.state = 'left in free writing'; paintFree(); return; }
    if (a === 'elsewhere') { var pe = S.mapped.filter(function (x) { return x.id === d.p; })[0]; if (!pe) return;
      openSheet('<h3>where does it go?</h3><q class="gr-qt">' + esc(pe.text.slice(0, 200)) + '</q>' + D.sections.filter(function (s) { return !s.kind; }).map(function (s) { return '<button type="button" class="gr-wide" data-s="placeto" data-p="' + pe.id + '" data-sec="' + s.id + '">yes · place in ' + esc(s.short || s.name) + '</button>'; }).join(''), 'where'); return; }
  });
  function sheetClick(b) {
    var d = b.dataset, s;
    if (d.s === 'x') return closeSheet();
    if (d.s === 'tadd') { var v = sheet.querySelector('.gr-tin').value.trim(); if (!v) return; var T = thread(d.k); T.items.push({ t: Date.now(), text: v, ctx: d.c || '' }); T.t = Date.now(); toNotes(d.k); saveNow(); hap('tick'); openThread(d.k, T.title, d.c); return; }
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
        S.pending = buildPending(parsed, false);
        if (!S.pending.length) { say('bundle matches what you already have'); closeSheet(); return; }
        openSheet(paintPending(), 'import');
      } catch (err) { say(err.message || 'could not read that bundle'); }
      return;
    }
    if (d.s === 'pendok') { acceptPending(+d.i); return; }
    if (d.s === 'pendskip') { skipPending(+d.i); return; }
    if (d.s === 'pullsec') { if (pullNote(d.id, S.cur)) { hap('commit'); closeSheet(); paint(); say('the note is in ' + sname(S.cur)); } return; }
    if (d.s === 'pulldrift') { if (pullNote(d.id, 'drift')) { hap('commit'); closeSheet(); S.tab = 'free'; paint(); say('the note is in free writing'); } return; }
  }
  el.querySelector('.gr-tabs').addEventListener('click', function () {}, false);

  var tickT = 0;
  function open(id) {
    if (S.on) { if (id && sec(id)) { S.cur = id; S.tab = 'write'; paint(); } return; }
    load(); S.on = true;
    if (id && sec(id)) { S.cur = id; S.tab = 'write'; } else restoreSpot();
    paint(); el.hidden = false; html.classList.add('granting'); applyTune();
    requestAnimationFrame(function () { el.classList.add('in'); placeSpot(); }); hap('commit');
    clearInterval(tickT); tickT = setInterval(function () { if (S.on) { $('.gr-due').textContent = dueLine(due()); } }, 30000);
  }
  function close() {
    if (!S.on) return;
    captureSpot();
    if (listenOn) setListen(false);
    S.on = false; saveNow(); clearInterval(tickT); closeSheet();
    el.classList.remove('in'); html.classList.remove('granting');
    setTimeout(function () { if (!S.on) el.hidden = true; }, 380);
  }
  if (GJ.app && GJ.app.closeAny) { var ca0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (S.on) { if (S.sheet) { closeSheet(); return true; } close(); return true; } return ca0.apply(this, arguments); }; }
  GJ.grant = { open: open, close: close, isOpen: function () { return S.on; }, go: function (id) { S.cur = id; S.tab = 'write'; if (S.on) paint(); },
    tab: function (t) { S.tab = t; if (S.on) paint(); }, pick: function (f, o) { var r = pick(f, o); if (S.on) paint(); return r; }, map: function (t) { return map(t); },
    write: function (id, text) { var s = sec(id); if (s) { s.text = text; saveNow(); if (S.on) paint(); } },   // for tests: puts text in as if typed
    state: function () { load(); return { sections: D.sections.map(function (s) { return { id: s.id, chars: len(s.text), target: s.target || null, marks: marksFor(s.id).length, provisional: waitsOn(s.id).map(function (f) { return f.id; }) }; }),
      forks: D.forks.map(function (f) { return { id: f.id, pick: f.pick, changes: f.history.length }; }), paths: pathList().map(function (p) { return { id: p.id, status: p.status }; }), practice: practiceList().length, marks: D.marks.filter(function (m) { return m.state === 'open'; }).length, threads: Object.keys(D.threads), due: due(), f3: !!(GJ.f3 && GJ.f3.lit && GJ.f3.lit()), listen: !!listenOn, listenSrc: listenAudio ? listenAudio.src : seaSrc(), spot: D.spot || S.spot || null, type: (el && el.style && el.style.getPropertyValue('--type')) || '1' }; },
    insights: function (id) { load(); return insights(sec(id)); }, reset: function () { D = cks(); seedMarks(D); attachLayers(); saveNow(); if (S.on) paint(); }, bundle: function (k) { load(); return bundleOf(k || 'state'); }, loadDraft: function () { loadCurrentDraft(); }, listen: function (on) { if (on == null) return !!listenOn; return setListen(!!on); }, sea: function () { return listenAudio; }, pull: function (id, where) { return pullNote(id, where); }, spot: function () { return D.spot || S.spot || null; } };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'grant', name: 'grant', sub: 'a proposal, in your words', cl: 'make', open: function () { open(); } });
  if (GJ.store && GJ.store.on) GJ.store.on(function () { if (S.on) applyTune(); });
})(window);
