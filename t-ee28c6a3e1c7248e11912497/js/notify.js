/* bubble round, item 5 · notifications, quiet by default. No banners, no sounds unless you allow one person's.
     the count ........ a tiny number beside the red-mode dot when something is waiting (it can be hidden completely)
     the breath ....... the dot breathes softly once when something new waits — once, not a flash, not a loop
     the waiting list . tap the count (or "waiting" on the dot's pad) — sorted by Circle depth, near first (the Circle's
                        rings; then Loved Ones as near and Friends as mid; everyone else far). A tap on the dot itself stays red mode (Gill's standing rule).
     breakthrough ..... approved near stars ("who can always reach me": Circle near stars and Loved Ones) get through even on do not
                        disturb, as a simple glow at the screen's edge in their depth colour; silent unless you allowed
                        sound for that person
     status-aware ..... do not disturb or sleeping: held quietly (no count, no breath); walking or rolling / shooting:
                        everything else is held until you are back (breakthrough still gets through)
   Every piece is a toggle in Tune → Notifications, defaulting to the quiet behaviour. No notification engine and no
   push: the room hooks to what already happens on this phone (a message arriving through Messages' transport stub;
   example arrivals from Tune).   GJ.notify */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, tune = document.getElementById('tune');
  function S() { return store.get(); }
  function esc(t) { return GJ.ozone && GJ.ozone.esc ? GJ.ozone.esc(t) : String(t); }
  var KEY = 'oz-waiting', W = { items: [], held: [], n: 1 };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.items) W = Object.assign(W, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) {} }
  function loved() { return GJ.lovedOnes && GJ.lovedOnes.people ? GJ.lovedOnes.people() : []; }
  function friends() { try { return GJ.friends && GJ.friends.state ? GJ.friends.state().people.map(function (p) { return p.name; }) : JSON.parse(GJ.settings.getItem('gj-friends') || '{"people":[]}').people.map(function (p) { return p.name; }); } catch (e) { return []; } }
  function circle() { try { return GJ.circle && GJ.circle.people ? GJ.circle.people() : []; } catch (e) { return []; } }
  function inCircle(who) { return circle().filter(function (p) { return p.name === who; })[0]; }
  function depthOf(who) { var c = inCircle(who); if (c) return c.depth === 'mid' || c.depth === 'far' ? c.depth : 'near';   // the Circle decides first (oz chat and creator sit in the first ring)
    if (loved().some(function (p) { return p.name === who; })) return 'near'; if (friends().indexOf(who) >= 0) return 'mid'; return 'far'; }
  /* who can always reach me: per person, kept on this phone (Circle near stars and Loved Ones) */
  var TK = 'oz-through', TH = {}; try { TH = JSON.parse(localStorage.getItem(TK) || '{}') || {}; } catch (e) {}
  function saveTH() { try { localStorage.setItem(TK, JSON.stringify(TH)); } catch (e) {} }
  function approved(who) { var t = TH[who]; if (t && t.through) return t; var p = loved().filter(function (x) { return x.name === who; })[0]; return p && p.through ? p : null; }
  function setThrough(who, through, sound) { TH[who] = { through: !!through, sound: !!sound }; saveTH(); if (GJ.lovedOnes && GJ.lovedOnes.approve && loved().some(function (p) { return p.name === who; })) GJ.lovedOnes.approve(who, through, sound); }
  function nearStars() { var seen = {}, out = []; circle().forEach(function (p) { if ((p.depth === 'near') && !seen[p.name]) { seen[p.name] = 1; out.push(p.name); } }); loved().forEach(function (p) { if (!seen[p.name]) { seen[p.name] = 1; out.push(p.name); } }); return out; }
  function quietNow() { var st = GJ.status ? GJ.status.mine() : null; return st === 'dnd' || st === 'sleeping'; }
  function movingNow() { var st = GJ.status ? GJ.status.mine() : null; return S().ntHold !== false && (st === 'walking' || st === 'rolling'); }

  /* the count, beside the dot */
  var cnt = document.createElement('button'); cnt.type = 'button'; cnt.id = 'oz-count'; cnt.hidden = true; document.body.appendChild(cnt);
  function place() { var d = document.getElementById('disc'); if (!d) return; var r = d.getBoundingClientRect(); if (!r.width) return; cnt.style.top = (r.top + r.height / 2) + 'px'; cnt.style.left = (r.left - 30) + 'px'; }
  function paint() { var n = W.items.length; cnt.textContent = n > 99 ? '99+' : String(n); cnt.setAttribute('aria-label', n + ' waiting · tap to see'); cnt.hidden = !n || S().ntCount === false || !!S().ntHide; place(); paintPad(); }
  G.addEventListener('resize', place); setInterval(place, 1500);
  function breathe() { if (S().ntBreath === false) return; var d = document.getElementById('disc'); if (!d) return; d.classList.remove('nt-breath'); void d.offsetWidth; d.classList.add('nt-breath'); setTimeout(function () { d.classList.remove('nt-breath'); }, 2600); }
  /* breakthrough: a glow at the screen's edge, in the person's depth colour; silent unless sound is allowed for them */
  var edge = document.createElement('i'); edge.id = 'nt-edge'; edge.setAttribute('aria-hidden', 'true'); document.body.appendChild(edge);
  function glow(depth) { if (S().ntEdge === false) return; edge.style.setProperty('--nt-c', 'var(--depth-' + (depth || 'near') + ')'); edge.classList.remove('on'); void edge.offsetWidth; edge.classList.add('on'); clearTimeout(edge._t); edge._t = setTimeout(function () { edge.classList.remove('on'); }, 3200); }
  function chime() { try { var A = G.AudioContext || G.webkitAudioContext; if (!A) return; var a = new A(), o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = 660; g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(.06, a.currentTime + .05); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .7); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .75); } catch (e) {} }
  var last = null;
  function arrive(o) {
    var it = { id: W.n++, who: o.who || 'someone', text: o.text || '', from: o.from || 'example', chatId: o.chatId || null, at: Date.now(), depth: o.depth || depthOf(o.who), example: !!o.example };
    var ap = approved(it.who), through = ap && S().ntBreak !== false;
    if (through) { glow(it.depth); if (ap.sound) chime(); W.items.push(it); save(); paint(); last = { it: it, way: 'breakthrough' }; return last; }   // through, always: the glow, and it waits in the list
    if (quietNow() || movingNow()) { W.held.push(it); save(); last = { it: it, way: 'held' }; return last; }   // held until you are back
    W.items.push(it); save(); paint(); breathe(); last = { it: it, way: 'waiting' }; return last;
  }
  function release() { if (quietNow() || movingNow() || !W.held.length) return; W.items = W.items.concat(W.held); W.held = []; save(); paint(); breathe(); }
  store.on(function (s, p) { if (p && (s.myStatus !== p.myStatus || s.statusAuto !== p.statusAuto || s.red !== p.red)) release(); paint(); paintTune(); });

  /* the waiting list, near first */
  var P = GJ.ozone && GJ.ozone.panel, list = P && P({ id: 'ozwait', title: 'Waiting', sub: 'near first · by Circle depth',
    build: function (b) {
      var R = ['near', 'mid', 'far'], items = W.items.slice().sort(function (a, c) { return R.indexOf(a.depth) - R.indexOf(c.depth) || c.at - a.at; });
      b.innerHTML = (items.length ? '<div class="oz-grp">' + items.map(function (it) { return '<button type="button" class="oz-row nt-it" data-id="' + it.id + '"><i class="nt-d d-' + it.depth + '" aria-hidden="true"></i><span class="nt-w"><b>' + esc(it.who) + (it.example ? ' · example' : '') + '</b><small>' + esc(it.text) + '</small></span><span>' + new Date(it.at).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase() + '</span></button>'; }).join('') + '</div>' : '<p class="oz-line quiet">nothing is waiting</p>') +
        (W.held.length ? '<p class="oz-line quiet">' + W.held.length + ' held while you are ' + (GJ.status ? GJ.status.label(GJ.status.mine()) : 'away') + ' · they come in when you are back</p>' : '') +
        '<div class="oz-seg">' + (items.length ? '<button type="button" data-a="clear">clear all</button>' : '') + '<button type="button" data-a="who">who can always reach me</button></div>';
    } });
  if (list) list.el.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return;
    if (x.dataset.a === 'clear') { W.items = []; save(); paint(); list.close(); }
    if (x.dataset.a === 'who') { list.close(); openWho(); }
    if (x.dataset.id) { var it = W.items.filter(function (i) { return String(i.id) === x.dataset.id; })[0]; W.items = W.items.filter(function (i) { return i !== it; }); save(); paint(); list.close();
      if (it && /^messages/.test(it.from) && GJ.messages) { GJ.messages.open(); if (it.chatId != null) { if (GJ.messages.openChat) GJ.messages.openChat(it.chatId); else if (GJ.messages.show) GJ.messages.show(it.chatId); } } } });
  /* who can always reach me: near stars, each with "always" and "with sound" (silent unless you allow it) */
  var who = P && P({ id: 'ozwho', title: 'Who can always reach me', sub: 'near stars only · even on do not disturb · silent unless you allow sound',
    build: function (b) { var L = nearStars();
      b.innerHTML = L.length ? '<div class="oz-grp">' + L.map(function (n) { var t = approved(n) || {}; return '<div class="oz-row nt-who"><span class="nt-w"><b>' + esc(n) + '</b><small>' + (t.through ? 'can always reach me' + (t.sound ? ' · with sound' : ' · silent') : 'waits like everyone else') + '</small></span><span class="oz-seg"><button type="button" data-n="' + esc(n) + '" data-k="through" aria-pressed="' + !!t.through + '">always</button><button type="button" data-n="' + esc(n) + '" data-k="sound" aria-pressed="' + !!t.sound + '"' + (t.through ? '' : ' disabled') + '>sound</button></span></div>'; }).join('') + '</div>'
        : '<p class="oz-line quiet">No near stars yet. Put someone in the near ring of your Circle first.</p>'; } });
  if (who) who.el.addEventListener('click', function (e) { var x = e.target.closest('button[data-n]'); if (!x) return; var n = x.dataset.n, t = approved(n) || {};
    if (x.dataset.k === 'through') setThrough(n, !t.through, t.through ? false : !!t.sound); else setThrough(n, !!t.through, !t.sound); who.open(); });
  function openWho() { if (who) who.open(); }
  function openList() { if (S().ntList === false || !list) return; list.open(); }
  cnt.addEventListener('click', function (e) { e.stopPropagation(); openList(); });
  function paintPad() { var pad = document.getElementById('redpad'); if (!pad) return; var b = pad.querySelector('.rp-wait'); if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'rp-wait'; pad.appendChild(b); b.addEventListener('click', function (e) { e.stopPropagation(); openList(); }); }
    b.textContent = W.items.length ? 'waiting · ' + W.items.length : 'nothing waiting'; b.hidden = S().ntList === false; }

  /* Tune → Notifications */
  var ROWS = { ntcount: 'ntCount', nthide: 'ntHide', ntbreath: 'ntBreath', ntlist: 'ntList', ntbreak: 'ntBreak', ntedge: 'ntEdge', nthold: 'ntHold' };
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  function paintTune() { var s = S(); Object.keys(ROWS).forEach(function (k) { var v = s[ROWS[k]]; T(k, k === 'nthide' ? (v ? 'on' : 'off') : (v === false ? 'off' : 'on')); }); }
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, s = S();
    if (ROWS[k]) { var o = {}; o[ROWS[k]] = k === 'nthide' ? !s.ntHide : s[ROWS[k]] === false; store.set(o); }
    if (k === 'ntexnear') example('near'); if (k === 'ntexmid') example('mid'); if (k === 'ntexfar') example('far'); if (k === 'ntwait') { if (GJ.app.tune) GJ.app.tune(false); openList(); } if (k === 'ntwho') { if (GJ.app.tune) GJ.app.tune(false); openWho(); } });
  function example(d) { var near = loved()[0], fr = friends()[0]; var who = d === 'near' ? (near ? near.name : 'Example Rowan') : d === 'mid' ? (fr || 'example friend') : 'example · someone'; return arrive({ who: who, text: d === 'near' ? 'example · call me when you can' : d === 'mid' ? 'example · climbing thursday?' : 'example · a note from outside the Circle', example: true, depth: d === 'near' && near ? null : d }); }
  paint(); paintTune();
  GJ.notify = { arrive: arrive, example: example, waiting: function () { return W.items.slice(); }, held: function () { return W.held.slice(); }, open: openList, who: openWho, approve: setThrough, approved: function (n) { return approved(n); }, depthOf: depthOf, clear: function () { W.items = []; W.held = []; save(); paint(); }, last: function () { return last; }, glow: glow };
})(window);
