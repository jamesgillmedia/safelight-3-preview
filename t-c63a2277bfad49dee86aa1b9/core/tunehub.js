/* oz core · the master tuner's own tools (Gill, 19 Nov 2:19 / 2:22). Tune is Gill's MASTER TUNER: every setting, in groups
   (core/tiers.js), each with the same control (core/tunekit.js). This adds, on top of the rows already there:
     · search ............ a field at the top: type, and only the matching settings (and their groups) stay
     · tags .............. 'core' on a setting that changes the core itself (dials, the Moon dial, motion, gestures, the sky);
                           in the owner's build, 'owner only' / 'secret' on those settings
     · reset ............. per setting (its ⋯ → reset, there only when it is not at its default) and per group (the group's
                           "reset", there only when something in it has changed). The default is the core's: core/private's
                           value when the owner's build has one, else the plain one
     · pin ............... (its ⋯ → pin to this room's dial) the setting appears as a ring on the room's own side dial for
                           quick use. Only public settings: an owner-only or secret one is REFUSED, with a quiet 'owner only'
     · presets ........... (Developer) named sets of tuned values: save, load, delete (kept on this phone)
     · Save to core ...... (Developer, the owner's build only) the tuned core values as a new core/private/core-defaults.js:
                           downloaded and copied; core/private/save-core.py puts it in place. Never in a public build.
   Each room keeps its own small tuner (its sheet and its own dial plane); this is the one that holds everything.
     GJ.tunehub.reset(k) · resetGroup(g) · changed(k) · search(q) · presets() · savePreset(name) · loadPreset(name) ·
     dropPreset(name) · snapshot() · coreFile() · saveToCore() · allowed(k)
     GJ.pins.pin(k, room) → { ok, why } · unpin(k, room) · list() · rings(room) */
(function (G) {
  'use strict';
  var GJ = G.GJ, tune = document.getElementById('tune'); if (!tune || !GJ.tiers) return;
  var store = GJ.store, T = GJ.tiers, K = GJ.tunekit;
  function S() { return store.get(); }
  function cp(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function same(a, b) { return JSON.stringify(a == null ? null : a) === JSON.stringify(b == null ? null : b); }

  /* ---------- where each setting lives: get, its default, set ---------- */
  var STORE = { mystatus: ['myStatus'], statusauto: ['statusAuto'], ntcount: ['ntCount'], nthide: ['ntHide'], ntbreath: ['ntBreath'], ntlist: ['ntList'], ntbreak: ['ntBreak'], ntedge: ['ntEdge'], nthold: ['ntHold'], cammark: ['camMark'], dockon: ['dockOn'], 'dock-notes': ['dockApps'], 'dock-chat': ['dockApps'], 'dock-ask': ['dockApps'], 'dock-weather': ['dockApps'], 'dock-timer': ['dockApps'], 'dock-browser': ['dockApps'], 'dock-circle': ['dockApps'], 'dock-camera': ['dockApps'], 'dock-archive': ['dockApps'], 'dock-map': ['dockApps'], depthdial: ['depthDial'], brunclear: ['brUnclear'], brview: ['brView'], brhaptic: ['brHaptic'], brauto: ['brAuto'], depthon: ['depthOn'], palhere: ['palTune'], palnear: ['palTune'], palmid: ['palTune'], palfar: ['palTune'], palwarm: ['palWarm'], pallight: ['palLight'], chatteal: ['chatTeal'], lean: ['lean'], leanring: ['leanRing'], focusring: ['focusRing'], focusdepth: ['focusDepth'], essentials: ['essentials', 'essPins'], milayout: ['miLayout'], midensity: ['miDensity'], ghdials: ['ghDials'], envwindlive: ['windLive'], envwind: ['wind'], envgrain: ['grain'], envsize: ['starSize'], envglow: ['starGlow'], envline: ['lineBright'], envrip: ['rippleAmt'], envswell: ['swell'], envmotes: ['particles'], envbloom: ['bloom'], envvig: ['vignette'], iconflip: ['iconFlip'], iconmirror: ['iconMirror'], mnflip: ['mnFlip'], mnmirror: ['mnMirror'], mnspark: ['mnSpark'], feedon: ['feedOn'], fingerdial: ['fingerDial'], red: ['red'], openred: ['openRed'], daymode: ['dayMode'], redlight: ['redLight'], tone: ['tone'], fullsafe: ['fullSafe'], photored: ['photoRed'], alert: ['alert'], density: ['density'], ambience: ['ambience'], fog: ['fog'],
    moon: ['moon', 'moonMode'], reflect: ['reflect'], ripples: ['ripples'], wxlive: ['wxlive'], hub: ['hub'], tilt: ['tilt'], reduce: ['reduce'], clock: ['clock'], city: ['city'],
    sunup: ['sunUp'], bydepth: ['byDepth'], bydrift: ['byDrift'], byease: ['byEase'], bymove: ['byMove'], dialrest: ['dialRest'], dialtapsheet: ['dialTapSheet'],
    markmore: ['markMore'], contaps: ['conTaps'], moonslide: ['moonSlide'] };
  var DIALS = { dkspeed: 'speed', dksnap: 'snap', dkhap: 'haptics', dklab: 'labels', dkrest: 'rest', dkorbit: 'orbit' };
  var MOON = { moondial: 'on', mnsize: 'size', mnrest: 'alpha', mndelay: 'delay', mnlock: 'lock', mnhap: 'hap' };
  var CORE = ['dialrest', 'dialtapsheet', 'moonslide', 'reduce', 'tilt', 'markmore', 'contaps', 'density', 'ambience', 'fog', 'moon', 'reflect', 'ripples', 'hub', 'bydepth', 'bydrift', 'byease', 'bymove'];
  function isCore(t) { return CORE.indexOf(t) >= 0 || t in DIALS || t in MOON || /^dkst-/.test(t); }
  function src(t) {
    if (STORE[t]) { var ks = STORE[t]; return { get: function () { var o = {}; ks.forEach(function (k) { o[k] = S()[k]; }); return o; }, def: function () { var d = store.defaults(), o = {}; ks.forEach(function (k) { o[k] = d[k]; }); return o; }, set: function (o) { store.set(cp(o)); } }; }
    var dp = GJ.dialprefs;
    if (dp && DIALS[t]) { var k = DIALS[t]; return { get: function () { return dp.get()[k]; }, def: function () { return dp.defaults()[k]; }, set: function (v) { var o = {}; o[k] = v; dp.set(o); } }; }
    if (dp && /^dkst-/.test(t)) { var place = t.slice(5); return { get: function () { return dp.look(place); }, def: function () { var d = dp.defaults().styles || {}; return d[place] || (place === 'crescent' ? '3D moon' : 'ticks'); }, set: function (v) { dp.setLook(place, v); } }; }
    var mn = GJ.moon;
    if (mn && mn.prefs && MOON[t]) { var m = MOON[t]; return { get: function () { return mn.prefs()[m]; }, def: function () { return mn.prefsDefault()[m]; }, set: function (v) { var o = {}; o[m] = v; mn.prefs(o); } }; }
    return null;
  }
  function changed(t) { var s = src(t); return !!s && !same(s.get(), s.def()); }
  function reset(t) { var s = src(t); if (!s || !changed(t)) return false; s.set(s.def()); after(); return true; }
  function keysIn(g) { return [].map.call(tune.querySelectorAll('.tn-group[data-group="' + g + '"] [data-t]'), function (b) { return b.dataset.t; }); }
  function resetGroup(g) { var n = 0; keysIn(g).forEach(function (t) { var s = src(t); if (s && changed(t)) { s.set(s.def()); n++; } }); after(); return n; }
  function after() { if (K) K.refresh(); if (GJ.moon && GJ.moon.label) GJ.moon.label(); paint(); }

  /* ---------- visibility ---------- */
  function allowed(t) { var v = T.vis(t); return v === 'public' || T.owner(); }   // what may be shown here (a public build has only public)

  /* ---------- the rows: tags, ⋯ (reset · pin), the group's reset ---------- */
  var ROOMS = { sky: 'the sky', red: 'Timer', golden: 'Golden Hour', loops: 'Loops', player: 'Sky player', archive: 'Archive' };
  function roomNow() { return (GJ.app && GJ.app.room) || 'sky'; }
  function rowOf(t) { var b = tune.querySelector('[data-t="' + t + '"]'); return b && b.closest('.row'); }
  [].forEach.call(tune.querySelectorAll('.tn-group .row'), function (row) {
    var b = row.querySelector('button[data-t]'); if (!b) return; var t = b.dataset.t, v = T.vis(t);
    row.dataset.vis = v; if (isCore(t)) row.dataset.core = '1';
    var tags = document.createElement('span'); tags.className = 'tn-tags';
    if (isCore(t)) tags.innerHTML += '<i class="tn-tag">core</i>';
    if (v !== 'public') tags.innerHTML += '<i class="tn-tag tn-' + v + '">' + (v === 'secret' ? 'secret' : 'owner only') + '</i>';
    var nav = row.dataset.tk === 'nav' || !src(t) && !(K && K.choices(t));
    if (!nav) { var more = document.createElement('button'); more.type = 'button'; more.className = 'tn-more'; more.dataset.more = t; more.setAttribute('aria-label', 'more for ' + ((K && K.name(t)) || t)); more.setAttribute('aria-expanded', 'false'); more.textContent = '⋯'; tags.appendChild(more); }
    if (tags.childNodes.length) row.insertBefore(tags, row.querySelector('button[data-t]'));
    if (!nav) { var acts = document.createElement('div'); acts.className = 'tn-acts'; acts.hidden = true; acts.dataset.acts = t;
      acts.innerHTML = '<button type="button" data-reset="' + t + '">reset</button><button type="button" data-pin="' + t + '">pin to dial</button><span class="tn-why" role="status"></span>'; row.after(acts); }
  });
  function paint() {
    [].forEach.call(tune.querySelectorAll('.tn-acts'), function (a) { var t = a.dataset.acts, r = a.querySelector('[data-reset]'), p = a.querySelector('[data-pin]'); r.disabled = !changed(t); r.textContent = src(t) ? 'reset' : 'no default'; var on = pins.has(t, roomNow()); p.textContent = on ? 'unpin from ' + ROOMS[roomNow()] : 'pin to ' + (ROOMS[roomNow()] || 'this room') + '\'s dial'; });
    [].forEach.call(tune.querySelectorAll('.tn-greset'), function (b) { b.hidden = !keysIn(b.dataset.greset).some(changed); });
    [].forEach.call(tune.querySelectorAll('.tn-group .row[data-t-changed], .tn-group .row'), function (row) { var x = row.querySelector('button[data-t]'); if (x) row.classList.toggle('tn-changed', changed(x.dataset.t)); });
  }
  tune.addEventListener('click', function (e) {
    var x = e.target.closest && e.target.closest('button'); if (!x || !tune.contains(x)) return;
    if (x.dataset.more) { e.stopPropagation(); var a = tune.querySelector('[data-acts="' + x.dataset.more + '"]'), open = a.hidden; a.hidden = !open; x.setAttribute('aria-expanded', open ? 'true' : 'false'); a.querySelector('.tn-why').textContent = ''; paint(); return; }
    if (x.dataset.reset) { e.stopPropagation(); if (reset(x.dataset.reset) && GJ.haptic) GJ.haptic.tick(); return; }
    if (x.dataset.greset) { e.stopPropagation(); if (resetGroup(x.dataset.greset) && GJ.haptic) GJ.haptic.commit(); return; }
    if (x.dataset.pin) { e.stopPropagation(); var t = x.dataset.pin, why = x.parentNode.querySelector('.tn-why'), r = pins.has(t, roomNow()) ? pins.unpin(t, roomNow()) : pins.pin(t, roomNow()); why.textContent = r.ok ? (r.on ? 'on ' + ROOMS[roomNow()] + '\'s dial' : '') : r.why; paint(); return; }
  });
  store.on(function () { paint(); });

  /* ---------- pins: a setting as a ring on a room's own dial ---------- */
  var PK = 'gj-pins';
  var pins = (function () {
    var L = []; try { L = JSON.parse(GJ.settings.getItem(PK) || '[]') || []; } catch (e) {}
    L = L.filter(function (p) { return p && allowed(p.k) && T.vis(p.k) === 'public'; });   // a pin never outlives a rule
    function save() { try { GJ.settings.setItem(PK, JSON.stringify(L)); } catch (e) {} }
    function refresh() { if (G.GJ_MASTER && G.GJ_MASTER.reload) G.GJ_MASTER.reload(); }
    function has(k, room) { return L.some(function (p) { return p.k === k && p.room === room; }); }
    return {
      has: has,
      pin: function (k, room) {
        room = room || roomNow();
        if (!ROOMS[room]) return { ok: false, why: 'no such room' };
        if (T.vis(k) !== 'public') return { ok: false, why: 'owner only' };   // owner-only and secret: never on a room's dial, never in the main build
        if (!rowOf(k) || !K || !K.choices(k) || !src(k) && !K.value(k)) return { ok: false, why: 'not a setting' };
        if (!has(k, room)) { L.push({ k: k, room: room }); save(); refresh(); }
        return { ok: true, on: true };
      },
      unpin: function (k, room) { room = room || roomNow(); L = L.filter(function (p) { return !(p.k === k && p.room === room); }); save(); refresh(); return { ok: true, on: false }; },
      list: function () { return cp(L); },
      rings: function (room) {
        return L.filter(function (p) { return p.room === room && rowOf(p.k); }).map(function (p) {
          var ch = K.choices(p.k) || [];
          return { k: 'pin-' + p.k, name: ((K.name(p.k) || p.k) + '').toLowerCase(), pinned: p.k, opts: ch.map(function (c) { return [c, c]; }), get: function () { return K.value(p.k); }, set: function (v) { K.set(p.k, v); } };
        });
      }
    };
  })();
  GJ.pins = pins;

  /* ---------- search ---------- */
  var sbox = document.createElement('div'); sbox.className = 'tn-search';
  sbox.innerHTML = '<input type="search" id="tn-q" placeholder="search settings" aria-label="search settings" autocomplete="off" spellcheck="false"><span class="tn-none" hidden>nothing by that name — try another word</span>';
  var first = tune.querySelector('.tn-group'); tune.insertBefore(sbox, first);
  var q = sbox.querySelector('input'), none = sbox.querySelector('.tn-none');
  function search(s) {
    s = (s || '').trim().toLowerCase(); q.value = s; var any = false, names = T.names();
    [].forEach.call(tune.querySelectorAll('.tn-group'), function (g) {
      var gname = (names[g.dataset.group] || '').toLowerCase(), gHit = !!s && gname.indexOf(s) >= 0, shown = 0;
      [].forEach.call(g.querySelectorAll('.tk-group'), function (tg) {
        var h = tg.previousElementSibling, hHit = !!s && h && h.tagName === 'H3' && h.textContent.toLowerCase().indexOf(s) >= 0, n = 0;
        [].forEach.call(tg.children, function (row) { var hit = !s || gHit || hHit || row.textContent.toLowerCase().indexOf(s) >= 0 || (row.querySelector('[data-t]') || {}).dataset && row.querySelector('[data-t]').dataset.t.indexOf(s) >= 0; if (row.classList.contains('tn-acts')) { var pr = row.previousElementSibling; row.classList.toggle('tn-hide', !!pr && pr.classList.contains('tn-hide')); return; } row.classList.toggle('tn-hide', !hit); if (hit && !row.classList.contains('tn-acts')) n++; });
        tg.classList.toggle('tn-hide', !n); if (h && h.tagName === 'H3') h.classList.toggle('tn-hide', !n); shown += n;
      });
      [].forEach.call(g.querySelectorAll(':scope > p.note, :scope > .tn-tools, :scope > #tn-rev'), function (p) { var hit = !s || gHit || p.textContent.toLowerCase().indexOf(s) >= 0; p.classList.toggle('tn-hide', !hit); if (hit) shown++; });
      g.classList.toggle('tn-hide', !shown); if (shown) any = true;
    });
    tune.classList.toggle('tn-searching', !!s); none.hidden = any || !s; return any;
  }
  q.addEventListener('input', function () { search(q.value); });
  q.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape' && q.value) { e.preventDefault(); search(''); } });

  /* ---------- presets and Save to core (Developer) ---------- */
  var PR = 'gj-presets';
  function snapshot(coreOnly) {
    var st = {}, d = store.defaults();
    Object.keys(STORE).forEach(function (t) { if (coreOnly && !isCore(t) && T.vis(t) !== 'secret') return; if (!rowOf(t) && T.vis(t) !== 'secret') return; STORE[t].forEach(function (k) { if (S()[k] !== undefined || k in d) st[k] = cp(S()[k]); }); });
    if (S().atmos != null) st.atmos = S().atmos;
    return { store: st, dials: GJ.dialprefs ? GJ.dialprefs.get() : {}, moon: GJ.moon && GJ.moon.prefs ? GJ.moon.prefs() : {} };
  }
  function apply(snap) {
    if (!snap) return false;
    if (snap.store) { var o = {}; for (var k in snap.store) if (k !== 'rev' && k !== 'timer' && k !== 'room') o[k] = snap.store[k]; store.set(o); }
    if (snap.dials && GJ.dialprefs) GJ.dialprefs.set(snap.dials);
    if (snap.moon && GJ.moon && GJ.moon.prefs) GJ.moon.prefs(snap.moon);
    after(); return true;
  }
  function presets() { try { return JSON.parse(GJ.settings.getItem(PR) || '{}') || {}; } catch (e) { return {}; } }
  function savePresets(p) { try { GJ.settings.setItem(PR, JSON.stringify(p)); } catch (e) {} }
  function savePreset(name) { name = (name || '').trim().slice(0, 40); if (!name) return false; var p = presets(); p[name] = { at: Date.now(), snap: snapshot(false) }; savePresets(p); paintPresets(); return true; }
  function loadPreset(name) { var p = presets()[name]; if (!p) return false; apply(p.snap); return true; }
  function dropPreset(name) { var p = presets(); if (!p[name]) return false; delete p[name]; savePresets(p); paintPresets(); return true; }
  function coreFile() {
    var raw = GJ.core ? GJ.core.raw() : {}, snap = snapshot(true), out = { owner: true, secret: raw.secret || [], store: snap.store, dials: snap.dials, moon: snap.moon, saved: new Date().toISOString().slice(0, 16) };
    return '/* PRIVATE · the oz core\'s own settings, saved from Tune → Developer → Save to core. Not in any public build:\n' +
      '   put it in tools-02/core/private/ (python3 tools-02/core/private/save-core.py <this file>). */\nwindow.GJ_CORE_DEFAULTS = ' + JSON.stringify(out, null, 2) + ';\n';
  }
  function saveToCore() {
    if (!T.owner()) return false;
    var txt = coreFile(); try { GJ.settings.setItem('gj-core-saved', txt); } catch (e) {}
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' })); a.download = 'core-defaults.js'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); } catch (e) {}
    try { if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {}); } catch (e) {}
    var st = tune.querySelector('.tn-coresaid'); if (st) st.textContent = 'saved · core-defaults.js downloaded and copied — put it in core/private';
    return true;
  }
  var dev = tune.querySelector('.tn-group[data-group="developer"]');
  if (dev) {
    var box = document.createElement('div'); box.className = 'tn-tools';
    box.innerHTML = '<h3 class="jul">Presets</h3><p class="note">Named sets of tuned values, kept on this phone.</p>' +
      '<div class="tn-pset"><input id="tn-pname" placeholder="a name for this set" aria-label="preset name" maxlength="40" autocomplete="off"><button type="button" data-psave>save</button></div><ul class="tn-plist" aria-label="presets"></ul>' +
      (T.owner() ? '<h3 class="jul">Core</h3><p class="note">Saves the tuned core values (marked core) as the default for the core and every oz-family build. Private: never in a public build.</p><div class="tn-pset"><button type="button" data-core>Save to core</button></div><p class="note tn-coresaid" role="status"></p>' : '');
    dev.insertBefore(box, dev.querySelector('h3'));
    box.addEventListener('click', function (e) {
      var x = e.target.closest('button'); if (!x) return; e.stopPropagation();
      if ('psave' in x.dataset) { var n = box.querySelector('#tn-pname'); if (savePreset(n.value)) { n.value = ''; if (GJ.haptic) GJ.haptic.commit(); } }
      else if (x.dataset.pload) loadPreset(x.dataset.pload);
      else if (x.dataset.pdrop) dropPreset(x.dataset.pdrop);
      else if ('core' in x.dataset) saveToCore();
    });
    box.querySelector('#tn-pname').addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); box.querySelector('[data-psave]').click(); } });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function paintPresets() {
    var ul = tune.querySelector('.tn-plist'); if (!ul) return; var p = presets(), names = Object.keys(p).sort(function (a, b) { return p[b].at - p[a].at; });
    ul.innerHTML = names.length ? names.map(function (n) { return '<li><span>' + esc(n) + '</span><button type="button" data-pload="' + esc(n) + '">load</button><button type="button" data-pdrop="' + esc(n) + '" aria-label="delete ' + esc(n) + '">×</button></li>'; }).join('') : '<li class="tn-empty">none yet — tune, then give the set a name</li>';
  }
  paintPresets(); paint();
  GJ.tunehub = { reset: reset, resetGroup: resetGroup, changed: changed, search: search, presets: presets, savePreset: savePreset, loadPreset: loadPreset, dropPreset: dropPreset,
    snapshot: snapshot, apply: apply, coreFile: coreFile, saveToCore: saveToCore, allowed: allowed, isCore: isCore, refresh: paint };
})(window);
