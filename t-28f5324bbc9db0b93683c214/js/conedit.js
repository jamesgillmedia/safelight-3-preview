/* tools-02 · make and edit constellations on the main sky (briefs/CUSTOM-CONSTELLATIONS.md; Gill, 19 Nov: "Is it possible to
   add/edit constellations to the main?" — "Yes, edit + new").
     hold a constellation ..... edit it: it holds still, face on, and its stars show as handles
     hold the empty sky ....... a new constellation starts there, three stars to begin
     while editing ............ drag a star to move it · tap the sky to add a star (joined to the one you had) ·
                                tap a star to pick it, then another to join or part them · the sheet: its name, what it
                                opens (new ones), remove the picked star, reset (built in) or delete (your own), done
   It draws in the same hand as the others: the same dots, glow and hairlines; the sky does the drawing. Kept on this device
   only (localStorage gj-cons). The built-in ones can always be reset. Photographs are not involved.
   oz 3 alt · no accidental stars (REFINE-PLAN): while editing, a tap on the sky does nothing and a tap on a star
   only picks it. The sheet has "+ star" (a new star beside the picked one, joined to it, ready to drag) and "join" (on,
   the next star you tap is joined to — or parted from — the picked one). The old taps (sky = add, two stars = join) are
   parked behind Tune → developer → Constellations · tap to add and join (store key conTaps). */
(function (G) {
  'use strict';
  var GJ = G.GJ, app = GJ.app, sky = GJ.sky, html = document.documentElement, KEY = 'gj-cons';
  var DB = { edits: {}, custom: [] }; try { var sv = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (sv) { DB.edits = sv.edits || {}; DB.custom = sv.custom || []; } } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
  function copy(a) { return JSON.parse(JSON.stringify(a)); }
  var ORIG = {};   // the built-in shapes as they came, for reset

  // called by the app's layout, every time the sky is laid out
  function apply(nodes, sc, W, H) {
    nodes.forEach(function (n) {
      if (!ORIG[n.id]) ORIG[n.id] = { stars: copy(n.stars), edges: copy(n.edges), label: n.label };
      var e = DB.edits[n.id]; if (e) { n.stars = copy(e.stars); n.edges = copy(e.edges); if (e.label) n.label = e.label; }
    });
    DB.custom.forEach(function (c) {
      nodes.push({ id: c.id, custom: true, live: true, label: c.label || 'new', opens: c.opens || null,
        meta: function () { var o = c.opens && GJ.navmap && GJ.navmap.nodes().filter(function (q) { return q.id === c.opens; })[0]; return o ? 'opens ' + o.name : 'hold to edit'; },
        x: c.x * W, y: c.y * H, scale: sc, stars: copy(c.stars), edges: copy(c.edges), depth: 1, spin0: 0, tint: [218, 214, 236] });
    });
  }

  /* ---------- the editor ---------- */
  var ov = document.createElement('div'); ov.id = 'coned'; ov.setAttribute('aria-hidden', 'true');
  ov.innerHTML = '<canvas></canvas><div class="ce-sheet" role="dialog" aria-label="edit this constellation">' +
    '<div class="ce-row"><input class="ce-name" type="text" maxlength="28" aria-label="its name" placeholder="its name"><button class="jul ce-done">done</button></div>' +
    '<div class="ce-row ce-opens"><span class="jul">opens</span><select aria-label="what it opens"></select></div>' +
    '<div class="ce-row"><button class="ce-add">+ star</button><button class="ce-join" aria-pressed="false">join</button><button class="ce-rm">remove star</button><button class="ce-reset">reset</button><button class="ce-del">delete</button></div>' +
    '<span class="ce-hint">drag a star to move it · tap one to pick it · + star adds one beside it · join, then tap another</span></div>';
  document.body.appendChild(ov);
  var cv = ov.querySelector('canvas'), g = cv.getContext('2d'), sheet = ov.querySelector('.ce-sheet'), nameI = ov.querySelector('.ce-name'), sel = ov.querySelector('select');
  var E = null, raf = 0, DPR = 1;   // E: { n, pick, drag, join }
  var joinB = ov.querySelector('.ce-join'), hintEl = ov.querySelector('.ce-hint');
  function taps() { return GJ.store.get().conTaps === true; }   // the parked taps (developer)
  function setJoin(on) { if (E) E.join = !!on; joinB.classList.toggle('on', !!on); joinB.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  function hint() { hintEl.textContent = taps() ? 'drag a star · tap the sky to add one · tap two stars to join them' : 'drag a star to move it · tap one to pick it · + star adds one beside it · join, then tap another'; }

  function nodeById(id) { return sky.nodes.filter(function (n) { return n.id === id; })[0]; }
  function store() {   // write the node being edited back to its record
    var n = E.n;
    if (n.custom) { var c = DB.custom.filter(function (q) { return q.id === n.id; })[0]; if (c) { c.stars = copy(n.stars); c.edges = copy(n.edges); c.label = n.label; c.opens = n.opens; } }
    else DB.edits[n.id] = { stars: copy(n.stars), edges: copy(n.edges), label: n.label };
    save();
  }
  function screenOf(i) { return sky.starScreen(E.n, i); }
  function starAt(x, y) { var best = -1, bd = 26; E.n.stars.forEach(function (s, i) { var p = screenOf(i), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = i; } }); return best; }
  function hasEdge(a, b) { return E.n.edges.some(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); }); }
  function toggleEdge(a, b) { var n = E.n, had = hasEdge(a, b); n.edges = n.edges.filter(function (e) { return !((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)); }); if (!had) n.edges.push([a, b]); return !had; }
  function anchored(i) { return E.n.anchors && E.n.anchors.some(function (an) { return an.s === i; }); }
  function addStar(x, y) {
    var n = E.n, l = sky.toLocal(n, x, y, 0); n.stars.push([l[0], l[1], 1.2, 0]); var i = n.stars.length - 1;
    if (n.from && n.from.length) n.from.push(n.from[n.from.length - 1]);   // its place in the unfold: beside the last
    if (E.pick >= 0) n.edges.push([E.pick, i]); E.pick = i; store(); GJ.haptic.tick(); return i;
  }
  function removeStar(i) {
    var n = E.n; if (i < 0 || n.stars.length <= 2) return false; if (anchored(i)) { say('that star carries a song · move it instead'); return false; }
    n.stars.splice(i, 1);
    n.edges = n.edges.filter(function (e) { return e[0] !== i && e[1] !== i; }).map(function (e) { return [e[0] > i ? e[0] - 1 : e[0], e[1] > i ? e[1] - 1 : e[1]]; });
    if (n.anchors) n.anchors.forEach(function (an) { if (an.s > i) an.s--; });
    if (n.from) n.from.splice(i, 1);
    E.pick = -1; store(); GJ.haptic.commit(); return true;
  }
  function say(t) { if (GJ.mark) GJ.mark.say(t, 1800); }

  function size() { DPR = Math.min(2, G.devicePixelRatio || 1); cv.width = G.innerWidth * DPR; cv.height = G.innerHeight * DPR; cv.style.width = G.innerWidth + 'px'; cv.style.height = G.innerHeight + 'px'; }
  function draw() {   // only the handles: the sky draws the constellation itself
    raf = 0; if (!E) { g.clearRect(0, 0, cv.width, cv.height); return; }
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, G.innerWidth, G.innerHeight);
    var red = !!GJ.store.get().red, ink = red ? '218,176,172' : '232,228,220';
    E.n.stars.forEach(function (s, i) {
      var p = screenOf(i), on = i === E.pick;
      g.strokeStyle = 'rgba(' + ink + ',' + (on ? .95 : .4) + ')'; g.lineWidth = on ? 1.5 : 1; g.beginPath(); g.arc(p[0], p[1], on ? 11 : 8, 0, 6.283); g.stroke();
    });
    raf = requestAnimationFrame(draw);
  }
  function fillOpens() {
    var nodes = GJ.navmap ? GJ.navmap.nodes() : [];
    sel.innerHTML = '<option value="">nothing yet</option>' + nodes.filter(function (q) { return q.id !== 'sky'; }).map(function (q) { return '<option value="' + q.id + '">' + q.name + '</option>'; }).join('');
  }
  function edit(n) {
    if (!n) return; close(); E = { n: n, pick: -1, drag: null, join: false }; n.editing = true; setJoin(false); hint();
    nameI.value = n.label || ''; fillOpens(); sel.value = n.opens || '';
    sheet.classList.toggle('custom', !!n.custom);
    size(); html.classList.add('coneditng'); ov.setAttribute('aria-hidden', 'false'); GJ.haptic.commit(); if (!raf) raf = requestAnimationFrame(draw);
    if (GJ.dial) GJ.dial.hideNow();
  }
  function close() {
    if (!E) return; var n = E.n; n.editing = false; E = null; html.classList.remove('coneditng'); ov.setAttribute('aria-hidden', 'true'); nameI.blur();
  }
  function newAt(x, y) {   // three stars, a small open triangle, where the finger held
    var W = G.innerWidth, H = G.innerHeight, c = { id: 'c' + Date.now().toString(36), label: 'new', opens: null, x: (x - W / 2) / W, y: (y - H * .44) / H,
      stars: [[-14, 8, 1.5, 0], [0, -12, 1.2, 0], [15, 6, 1.2, 0]], edges: [[0, 1], [1, 2]] };
    DB.custom.push(c); save(); app.layout(); var n = nodeById(c.id); if (n) { n.from = null; edit(n); E.pick = 2; nameI.focus({ preventScroll: true }); nameI.select(); }
    return c.id;
  }

  // the editor's own touch
  ov.addEventListener('pointerdown', function (e) {
    if (!E || sheet.contains(e.target)) return; e.preventDefault(); try { ov.setPointerCapture(e.pointerId); } catch (x) {}
    var i = starAt(e.clientX, e.clientY);
    E.drag = { i: i, x: e.clientX, y: e.clientY, moved: 0 };
  });
  ov.addEventListener('pointermove', function (e) {
    if (!E || !E.drag) return; var d = E.drag; d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x, e.clientY - d.y));
    if (d.i >= 0 && d.moved > 6) { var n = E.n, s = n.stars[d.i], l = sky.toLocal(n, e.clientX, e.clientY, 0); n.stars[d.i] = [l[0], l[1], s[2] || 1.2, 0]; E.pick = d.i; }
  });
  ov.addEventListener('pointerup', function (e) {
    if (!E || !E.drag) return; var d = E.drag; E.drag = null;
    if (d.i >= 0 && d.moved > 6) { store(); GJ.haptic.tick(); return; }   // moved
    if (d.i >= 0) {   // a tap on a star: pick it; with one picked already, join or part the two
      if (E.pick >= 0 && E.pick !== d.i && (E.join || taps())) { var joined = toggleEdge(E.pick, d.i); E.pick = d.i; store(); GJ.haptic.tick(); say(joined ? 'joined' : 'parted'); setJoin(false); }
      else E.pick = E.pick === d.i ? -1 : d.i;
      return;
    }
    if (d.moved < 10 && taps()) addStar(e.clientX, e.clientY);   // (parked) a tap on the sky: a new star, joined to the one you had
    else if (d.moved < 10) { if (E.join) setJoin(false); else say('+ star adds one · drag a star to move it'); }
  });
  nameI.addEventListener('input', function () { if (!E) return; E.n.label = nameI.value.trim() || (E.n.custom ? 'new' : ORIG[E.n.id] && ORIG[E.n.id].label); store(); });
  nameI.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); nameI.blur(); } });
  sel.addEventListener('change', function () { if (!E || !E.n.custom) return; E.n.opens = sel.value || null; store(); });
  ov.querySelector('.ce-done').addEventListener('click', function () { close(); GJ.haptic.commit(); });
  ov.querySelector('.ce-add').addEventListener('click', function () {   // a new star beside the picked one (or the last), joined to it, picked: drag it where it goes
    if (!E) return; var n = E.n, k = E.pick >= 0 ? E.pick : n.stars.length - 1, p = k >= 0 ? screenOf(k) : [G.innerWidth / 2, G.innerHeight * .44];
    var x = p[0] + 34, y = p[1] - 22; if (x > G.innerWidth - 30) x = p[0] - 34; if (y < 70) y = p[1] + 22;
    if (E.pick < 0 && k >= 0) E.pick = k; addStar(x, y); say('drag it where it goes');
  });
  joinB.addEventListener('click', function () { if (!E) return; if (E.pick < 0) { say('tap a star first'); return; } setJoin(!E.join); if (E.join) say('now tap the star to join'); });
  ov.querySelector('.ce-rm').addEventListener('click', function () { if (!E) return; if (E.pick < 0) { say('tap a star first'); return; } removeStar(E.pick); });
  ov.querySelector('.ce-reset').addEventListener('click', function () { if (!E || E.n.custom) return; var id = E.n.id; delete DB.edits[id]; save(); close(); app.layout(); say('back as it was'); });
  ov.querySelector('.ce-del').addEventListener('click', function () { if (!E || !E.n.custom) return; var id = E.n.id; DB.custom = DB.custom.filter(function (c) { return c.id !== id; }); save(); close(); app.layout(); say('deleted'); });
  G.addEventListener('resize', function () { if (E) size(); });
  (function () { var t = document.getElementById('tune'); if (!t) return; var b = t.querySelector('[data-t="contaps"] b'); if (b) b.textContent = taps() ? 'on' : 'off';
    t.addEventListener('click', function (e) { var x = e.target.closest ? e.target.closest('button[data-t="contaps"]') : null; if (x) GJ.store.set({ conTaps: !taps() }); });
    GJ.store.on(function (s, prev) { if (!prev || s.conTaps !== prev.conTaps) { var bb = t.querySelector('[data-t="contaps"] b'); if (bb) bb.textContent = taps() ? 'on' : 'off'; if (E) hint(); } }); })();

  // hold on the main sky: a constellation to edit, or the empty sky for a new one
  var cvs = document.getElementById('sky'), hold = null, nptr = 0;
  function nodeNear(x, y) { var best = null, bd = 60; sky.nodes.forEach(function (n) { var c = n.screen || sky.toScreen(n.x, n.y, n.depth); var d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = n; } }); return best; }
  function nearMark(x, y) { var mk = sky.mark && sky.mark.screen; return mk && Math.abs(x - mk.x) < (sky.mark.r || 60) && Math.abs(y - mk.y) < (sky.mark.r || 60) * .6; }
  cvs.addEventListener('pointerdown', function (e) {
    nptr++; clearTimeout(hold && hold.t); hold = null;
    if (nptr > 1 || app.room || E || app.mode === 'chap' || html.classList.contains('tune')) return;
    hold = { x: e.clientX, y: e.clientY, t: setTimeout(function () {
      var h = hold; hold = null; if (!h || app.room || E) return;
      var n = nodeNear(h.x, h.y); if (n) { edit(n); return; }
      if (!nearMark(h.x, h.y)) newAt(h.x, h.y);
    }, 650) };
  });
  G.addEventListener('pointermove', function (e) { if (hold && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) { clearTimeout(hold.t); hold = null; } });
  function up() { nptr = Math.max(0, nptr - 1); if (hold) { clearTimeout(hold.t); hold = null; } }
  G.addEventListener('pointerup', up); G.addEventListener('pointercancel', up);

  GJ.cons = { apply: apply, edit: function (id) { edit(nodeById(id)); }, newAt: newAt, close: close, isOpen: function () { return !!E; },
    state: function () { return E ? { id: E.n.id, pick: E.pick, stars: E.n.stars.length, edges: E.n.edges.length, label: E.n.label, opens: E.n.opens || null, custom: !!E.n.custom, join: !!E.join } : null; },
    star: function (i) { return E ? screenOf(i) : null; }, custom: function () { return copy(DB.custom); }, edits: function () { return Object.keys(DB.edits); } };
  if (app.layout) app.layout();   // lay the sky out again with the edits and his own
})(window);
