/* tools-02 · the Mark, one way (Gill, 17 Nov, later: "make one the default and move the others to another function…
   ok move it"). The three ways to try (A play · B steps · C compass) are folded into one Mark, with no modes:
     tap = out — whatever is open closes first; with nothing open, up one level (a frame → its page, a song → the board,
           a tool → the map, the map → the whole sky). Play / pause left the Mark: it lives on the now-playing pill, on
           the visualizer, and on each place's own button.
     double-tap = home · hold = more: the places board (with every choice, tune, notes, shrink a clip)
     hold, then drag = the compass (C): the places fan out round the Mark; let go on one to go there
     swipe down = every choice (the master menu) · swipe up = put it all away · swipe across = previous / next
   B's "tap = up a level" is the tap now; B's "swipe down = Tune" is the tune row on the board.
   It teaches itself with a small title under the Mark the first few times.
   oz 3 alt · one meaning per gesture (REFINE-PLAN): tap = back, like the iPhone's Back; hold = the places, as a
   sheet from the bottom. The swipes are parked, not gone: Tune → developer → The Mark → More gestures turns them back on
   (store key markMore), and the full suite still tests them.
   oz 3 alt, after the intuitiveness review (B3–B5): double-tap home is gone (a tap answers at once, no 280 ms
   wait — home is the first row of the places sheet); the compass is retired: hold the Mark, then slide onto a row of
   the places sheet and let go, like an iPhone context menu; one teaching line under the Mark, "tap to go back · hold
   for places", shown twice, and every gesture listed at the foot of the places sheet. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, html = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var mk = $('mark');
  var MODES = { a: 'one way' };   // kept for the callers that still ask (app.js): there is one way now
  function mode() { return 'a'; }
  var PLACES = [['sky', 'the sky', 'the map, every tool'], ['red', 'timer', 'red mode'], ['golden', 'golden hour', 'good weather · shot planner'], ['loops', 'loops', ''], ['player', 'sky player', 'lost coffee'], ['archive', 'archive', ''], ['feed', 'feed', 'yours only · one at a time'], ['icons', 'icon board', 'the icon set, as frames'], ['loupe', 'loupe', 'a frame, up close']]
    .filter(function (p) { return p[0] === 'sky' || !GJ.APP || !GJ.APP.rooms || GJ.APP.rooms.indexOf(p[0]) >= 0; });   // each app's own places (GJ.APP.rooms)
  function metaOf(id) { var n = GJ.sky && GJ.sky.nodes && GJ.sky.nodes.filter(function (k) { return k.id === id; })[0]; try { return n && n.meta ? (typeof n.meta === 'function' ? n.meta() : n.meta) : ''; } catch (e) { return ''; } }
  function go(id) {
    closePlaces();
    if (id === 'sky') { if (app.room) app.back(); if (app.room) app.back(); app.toSky(); return; }
    if (id === 'master') { if (G.GJ_MASTER) G.GJ_MASTER.open(); return; }
    if (id === 'shrink') { if (GJ.shrink) GJ.shrink.open(); return; }
    if (id === 'zip') { if (GJ.zip) GJ.zip.open(); return; }
    if (id === 'mindex') { if (GJ.mindex) GJ.mindex.open(); return; }
    if (id === 'lab') { if (GJ.lab) GJ.lab.open(); return; }
    if (id === 'objects') { if (GJ.objects) GJ.objects.open(); return; }
    if (id === 'about') { if (GJ.about) GJ.about.open(); return; }
    if (id === 'map') { if (GJ.navmap) GJ.navmap.open(); return; }
    if (id === 'notes') { if (GJ.notes) GJ.notes.open(); return; }
    if (id === 'ask') { if (GJ.ask) GJ.ask.open(); return; }
    if (id === 'tune') { GJ.dial.hideNow(); app.tune(true); return; }
    var oz1 = (GJ.ozMore || []).filter(function (m) { return m.id === id; })[0]; if (oz1) { oz1.open(); return; }   // the oz-next tools and rooms
    app.enter(id);
  }

  /* ---------- the little title that teaches ---------- */
  /* it sits under the Mark when it fits; if the moon, the title or another control is in the way it
     reflows and moves so the words stay readable — and it keeps out of the way if the moon is dragged. */
  var tip = document.createElement('div'); tip.id = 'mark-tip'; tip.setAttribute('aria-live', 'polite'); document.body.appendChild(tip);
  var tipT = 0, seen = {}; try { seen = JSON.parse(GJ.settings.getItem('gj-marktips') || '{}'); } catch (e) {}
  // one short line under the Mark, shown twice (REVIEW B4); the whole list lives at the foot of the places sheet
  var LESSON_ONE = 'tap to go back · hold for places';
  var LESSON_MORE = 'tap to go back · hold for places\nswipe down · every choice   ↑ · put away   ← → · previous / next';
  var GESTURES = 'tap the Mark · back   hold it · places (slide onto a row and let go)   swipe in from the left edge · back   pull down on the sky · search   tap the red dot · red mode';
  function more() { return store.get().markMore === true; }   // the parked gestures (developer)
  var LESSON = LESSON_ONE;
  var layR = 0, GAP = 10, MINW = 160;
  function visBox(el, pad) {
    if (!el || el.hidden) return null;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return null;
    var r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    pad = pad == null ? 8 : pad;
    return { left: r.left - pad, top: r.top - pad, right: r.right + pad, bottom: r.bottom + pad };
  }
  function obstacles() {
    var out = [], b;
    function add(el, pad) { b = visBox(el, pad); if (b) out.push(b); }
    add($('mark'), 6);
    add($('disc'), 8);
    add($('lightbtn'), 8);
    if (html.classList.contains('np-on')) add($('np'), 8);
    var t = $('title'); if (t && !t.classList.contains('out')) add(t, 6);
    var s = $('sub'); if (s && s.classList.contains('on')) add(s, 6);
    var poem = $('poem');
    if (poem && !html.classList.contains('inroom')) {
      var pr = poem.getBoundingClientRect();
      if (pr.height > 0) out.push({ left: 0, top: pr.top - 8, right: G.innerWidth, bottom: pr.bottom + 8 });
    }
    if (!html.classList.contains('inroom') && GJ.sky && GJ.sky.mark && GJ.sky.mark.screen) {
      var mk = GJ.sky.mark, rr = (mk.r || 52) + 12;
      out.push({ left: mk.screen.x - rr, top: mk.screen.y - rr, right: mk.screen.x + rr, bottom: mk.screen.y + rr });
    }
    if (!html.classList.contains('inroom') && GJ.sky && GJ.sky.nodes) {
      var i, n, nx, ny;
      for (i = 0; i < GJ.sky.nodes.length; i++) {
        n = GJ.sky.nodes[i];
        nx = G.innerWidth / 2 + n.x; ny = G.innerHeight * .44 + n.y;
        out.push({ left: nx - 72, top: ny - 56, right: nx + 72, bottom: ny + 78 });
      }
    }
    add($('master'), 8);
    if (GJ.sky && GJ.sky.moonXY && GJ.sky.moonA > .15) {
      var m = GJ.sky.moonXY, rr = 35;
      out.push({ left: m[0] - rr, top: m[1] - rr, right: m[0] + rr, bottom: m[1] + rr });
    }
    var moon = $('moon');
    if (moon && !moon.hidden && !moon.classList.contains('gone')) {
      var btn = moon.querySelector('.mn-m');
      if (btn && !(moon.classList.contains('insky') && moon.classList.contains('dot'))) add(btn, 10);
    }
    add($('moonhold'), 10);
    // tree line and dark ground (sky.js drawTrees): ridge at 84.5 %, the hill rises to the left, conifers poke above
    var vh = G.innerHeight, vw = G.innerWidth, k = vh / 844, y0 = vh * .845;
    out.push({ left: 0, top: y0 - 6, right: vw, bottom: vh });
    out.push({ left: 0, top: y0 - 56 * k - 6, right: vw * .4, bottom: y0 });
    return out;
  }
  function overlaps(a, c) { return a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top; }
  function hitOf(r, boxes) { for (var i = 0; i < boxes.length; i++) if (overlaps(r, boxes[i])) return boxes[i]; return null; }
  function measure(left, top, maxW) {
    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
    tip.style.maxWidth = Math.max(80, Math.round(maxW)) + 'px';
    tip.style.right = 'auto';
    var r = tip.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  }
  function fitWidth(left, top, minW, maxW, boxes) {
    var vw = G.innerWidth, edge = parseFloat(getComputedStyle(html).getPropertyValue('--edge')) || 8;
    if (left < edge) left = edge;
    if (maxW > vw - left - edge) maxW = vw - left - edge;
    if (maxW < minW) maxW = Math.max(80, vw - left - edge);
    var r = measure(left, top, maxW), b = hitOf(r, boxes), guard = 0;
    while (b && guard++ < 6) {
      var room = b.left - GAP - left;
      if (room >= minW && b.left < r.right) { r = measure(left, top, room); b = hitOf(r, boxes); continue; }
      break;
    }
    return r;
  }
  // the lesson belongs to the app's home: the sky, or (Good Weather) its home room; never over another room's controls
  function onSky() { var r = GJ.app && GJ.app.room; if (r && GJ.APP && GJ.APP.home === r) return true; return !html.classList.contains('inroom') && !r; }
  function isLesson(t) { return t === LESSON_ONE || t === LESSON_MORE; }
  function layoutTip() {
    if (!tip.classList.contains('on')) return;
    if (isLesson(tip.textContent) && !onSky()) { tip.classList.remove('on'); return; }
    var root = getComputedStyle(html);
    var edge = parseFloat(root.getPropertyValue('--edge')) || 8;
    var topv = parseFloat(root.getPropertyValue('--top')) || 8;
    var vw = G.innerWidth, vh = G.innerHeight;
    var left0 = edge, top0 = topv + 52;
    if (html.classList.contains('np-on')) top0 = topv + 92;
    var boxes = obstacles();
    var r = fitWidth(left0, top0, MINW, vw - edge - left0, boxes);
    var b = hitOf(r, boxes), guard = 0;
    while (b && guard++ < 10) {
      var rTry, ok = null;
      if (b.right + GAP + MINW < vw - edge) {
        rTry = fitWidth(b.right + GAP, top0, MINW, vw - edge - (b.right + GAP), boxes);
        if (!hitOf(rTry, boxes)) ok = rTry;
      }
      if (!ok && b.left - GAP - edge >= MINW) {
        rTry = fitWidth(edge, top0, MINW, b.left - GAP - edge, boxes);
        if (!hitOf(rTry, boxes)) ok = rTry;
      }
      if (ok) { r = ok; break; }
      top0 = b.bottom + GAP;
      left0 = edge;
      r = fitWidth(left0, top0, MINW, vw - edge - left0, boxes);
      b = hitOf(r, boxes);
    }
    var treeTop = vh * .845 - 6;
    function fits(box) { return box && !hitOf(box, boxes) && box.bottom <= treeTop && box.left >= 4 && box.right <= vw - 4; }
    if (!fits(r)) {
      var ys = [top0], xs = [edge], i, ob;
      for (i = 0; i < boxes.length; i++) { ob = boxes[i]; ys.push(ob.bottom + GAP); xs.push(ob.right + GAP); }
      [16, 47, 62, 77, 93, 108].forEach(function (h) { ys.push(treeTop - h); });
      ys.sort(function (a, c) { return a - c; }); xs.sort(function (a, c) { return a - c; });
      r = null;
      for (i = 0; i < ys.length && !r; i++) {
        if (ys[i] < 8 || ys[i] > treeTop - 20) continue;
        var j;
        for (j = 0; j < xs.length; j++) {
          if (xs[j] < edge || xs[j] > vw - edge - MINW) continue;
          var cand = fitWidth(xs[j], ys[i], MINW, vw - edge - xs[j], boxes);
          if (fits(cand)) { r = cand; break; }
        }
      }
      if (!r) r = measure(edge, Math.max(8, treeTop - 62), Math.min(280, vw - 2 * edge));
    }
    if (r.bottom > treeTop) measure(parseFloat(tip.style.left) || edge, Math.max(8, treeTop - r.height), parseFloat(tip.style.maxWidth));
    else if (r.right > vw - 4) measure(Math.max(edge, vw - 4 - r.width), parseFloat(tip.style.top) || top0, parseFloat(tip.style.maxWidth));
  }
  function watchTip() {
    if (layR) return;
    function tick() {
      if (!tip.classList.contains('on')) { layR = 0; return; }
      layoutTip();
      layR = G.requestAnimationFrame(tick);
    }
    layR = G.requestAnimationFrame(tick);
  }
  function say(t, ms) {
    if (isLesson(t) && !onSky()) { tip.classList.remove('on'); return; }
    tip.textContent = t; tip.classList.add('on'); layoutTip(); watchTip(); clearTimeout(tipT); tipT = setTimeout(function () { tip.classList.remove('on'); }, ms || 2600);
  }
  function teach(force) { if (!onSky()) return; if (!force && (seen.one || 0) >= 2) return; seen.one = (seen.one || 0) + 1; try { GJ.settings.setItem('gj-marktips', JSON.stringify(seen)); } catch (e) {} say(more() ? LESSON_MORE : LESSON_ONE, 4200); }
  G.addEventListener('resize', function () { if (tip.classList.contains('on')) layoutTip(); });

  /* ---------- the places: a board under the Mark (its hold) ---------- */
  var dim = document.getElementById('sheet-dim'); if (!dim) { dim = document.createElement('div'); dim.id = 'sheet-dim'; dim.setAttribute('aria-hidden', 'true'); document.body.appendChild(dim); }
  var pl = document.createElement('nav'); pl.id = 'places'; pl.setAttribute('aria-label', 'places'); document.body.appendChild(pl);
  // the 'more' group: each shown only where the app has it (Good Weather has no notes, clips, lab, objects, about or map)
  var MORE = [['master', 'every choice', 'the master menu', 'GJ_MASTER'], ['tune', 'tune', 'every setting, in one list', null], ['notes', 'notes', 'a page to write on', 'notes'], ['shrink', 'shrink a clip', 'screen recordings, smaller', 'shrink'], ['zip', 'shrink a zip', 'a zip or a folder, smaller', 'zip'], ['mindex', 'index a clip', 'its motion, as a sheet of stills', 'mindex'], ['lab', 'photo lab', 'the shelf · the loupe', 'lab'], ['objects', 'objects', 'a piece to turn', 'objects'], ['about', 'about', 'tap through', 'about'], ['map', 'map', 'everywhere you can go', 'navmap']];
  function has(m) { return !m || (m === 'GJ_MASTER' ? !!G.GJ_MASTER : !!GJ[m]); }
  function openPlaces() {
    pl.innerHTML = '<i class="pl-grab" aria-hidden="true"></i><b class="jul">places</b><em class="pl-h">go to</em>' + PLACES.map(function (p, i) {
      var m = p[0] === 'sky' ? (GJ.navmap ? p[2] : 'home') : (metaOf(p[0]) || p[2]);
      return '<button data-go="' + p[0] + '" style="--i:' + i + '"' + ((app.room || 'sky') === p[0] ? ' class="here"' : '') + '><span class="jul">' + p[1] + '</span><small>' + m + '</small></button>';
    }).join('') + '<em class="pl-h">more</em>' + MORE.concat((GJ.ozMore || []).map(function (m) { return [m.id, m.name, m.sub, null]; })).filter(function (m) { return has(m[3]); }).map(function (m, k) { return '<button data-go="' + m[0] + '" style="--i:' + (PLACES.length + k) + '" class="mm"><span class="jul">' + m[1] + '</span><small>' + m[2] + '</small></button>'; }).join('') + '<p class="pl-foot">' + GESTURES + '</p>';
    tip.classList.remove('on'); html.classList.add('places'); GJ.haptic.commit();   // the lesson steps aside for the board
  }
  function closePlaces() { html.classList.remove('places'); pl.style.transform = ''; }
  // like any sheet: drag it down to put it away (the grabber, or the sheet once it is scrolled to the top)
  (function () {
    var sd = null;
    pl.addEventListener('pointerdown', function (e) { if (pl.scrollTop > 2) return; sd = { y: e.clientY, x: e.clientX, id: e.pointerId, dy: 0 }; });
    pl.addEventListener('pointermove', function (e) { if (!sd || e.pointerId !== sd.id) return; sd.dy = Math.max(0, e.clientY - sd.y); if (sd.dy > 8 && sd.dy > Math.abs(e.clientX - sd.x)) { sd.live = true; pl.style.transition = 'none'; pl.style.transform = 'translateY(' + sd.dy + 'px)'; } });
    function end() { if (!sd) return; var q = sd; sd = null; pl.style.transition = ''; if (q.live) { if (q.dy > 90) { closePlaces(); GJ.haptic.tick(); } else pl.style.transform = ''; pl.dataset.swallow = '1'; setTimeout(function () { delete pl.dataset.swallow; }, 50); } }
    pl.addEventListener('pointerup', end); pl.addEventListener('pointercancel', end);
  })();
  pl.addEventListener('click', function (e) { if (pl.dataset.swallow) return; var b = e.target.closest('[data-go]'); if (!b) return; e.stopPropagation(); GJ.haptic.tick(); go(b.dataset.go); });
  document.addEventListener('pointerdown', function (e) { if (html.classList.contains('places') && !e.target.closest('#places, #mark')) closePlaces(); }, true);

  // slide-to-select on the places sheet (hold the Mark, then slide onto a row and let go)
  var slid = null;
  function slideTo(x, y) {
    if (p && Math.hypot(x - p.x, y - p.y) > 14) p.slid = true;
    var el = document.elementFromPoint(x, y), row = el && el.closest ? el.closest('#places button[data-go]') : null;
    if (row !== slid) { if (slid) slid.classList.remove('slide'); slid = row; if (row) { row.classList.add('slide'); GJ.haptic.tick(); } }
  }
  function slideEnd() { var r = slid; if (r) r.classList.remove('slide'); slid = null; return r; }

  /* ---------- the actions ---------- */
  function home() { app.closeAny(); closePlaces(); while (app.room) { var r0 = app.room; app.back(); if (app.room === r0) break; } app.toSky(); say('home · the map', 1100); GJ.haptic.commit(); }
  function putAway() { app.closeAny(); closePlaces(); GJ.dial.hideNow(); if (GJ.shrink) GJ.shrink.close(); if (GJ.zip) GJ.zip.close(); if (GJ.mindex) GJ.mindex.close(); say('put away', 900); GJ.haptic.tick(); }
  function prevNext(d) {
    if (app.room === 'archive' && GJ.archive && GJ.archive.state().open != null) { GJ.archive.step(d); var an = GJ.archive.anim(); say('frame ' + (an.frame + 1), 900); return; }
    if (app.room === 'icons' && GJ.icons && GJ.icons.state().open != null) { GJ.icons.step(d); var lb = GJ.icons.label(GJ.icons.isOpen()); say(lb.film.split(' · ').slice(0, 2).join(' · ') + ' · ' + lb.tc, 900); return; }   // the icon board: ← → step through the lights
    if (!GJ.player) return; var st = GJ.player.state(), n = GJ.player.tracks.length, w = st.playing, k = (st.idx + d + n) % n;
    GJ.player.load(k); if (w) GJ.player.play(); var t = GJ.player.tracks[k]; say((d > 0 ? '→ ' : '← ') + t.t.toLowerCase(), 1200); GJ.haptic.tick();
  }
  function out() { if (app.rise) app.rise(); GJ.haptic.tick(); }   // one level up; app.js asks the place first (a frame closes, a zoomed visualizer goes home, a song → the board)
  // Back, the one way: whatever is open closes first (a sheet, Tune, a panel), otherwise up one level. The Mark's tap and
  // the left-edge swipe (gestures.js) both call it.
  function back() {
    if (html.classList.contains('places')) { closePlaces(); return 'places'; }
    if (GJ.moonList && GJ.moonList.isOpen()) { GJ.moonList.close(); return 'sheet'; }
    if (app.closeAny()) { GJ.haptic.tick(); return 'closed'; }
    out(); return 'out';
  }
  function master() { GJ.dial.hideNow(); if (G.GJ_MASTER) G.GJ_MASTER.toggle(); GJ.haptic.commit(); }

  /* ---------- one recogniser: tap · hold · hold-then-slide · (parked) swipes ---------- */
  var p = null;
  mk.addEventListener('pointerdown', function (e) {
    e.preventDefault(); try { mk.setPointerCapture(e.pointerId); } catch (x) {}
    var r = mk.getBoundingClientRect();
    p = { x: e.clientX, y: e.clientY, t: GJ.now(), fired: false, board: false, slid: false, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    mk.classList.add('hold');
    p.ht = setTimeout(function () {   // hold: more — whatever is open closes; otherwise the places
      if (!p) return; p.fired = true; mk.classList.remove('hold');
      if (!app.closeAny()) { openPlaces(); p.board = true; }
    }, 520);
  });
  mk.addEventListener('pointermove', function (e) {
    if (!p) return; var dx = e.clientX - p.x, dy = e.clientY - p.y, d = Math.hypot(dx, dy);
    // still holding, the sheet up, and the finger moves: the row under it lights, like an iPhone context menu (the compass is retired)
    if (p.board) { slideTo(e.clientX, e.clientY); return; }
    if (d > 10 && !p.fired) { clearTimeout(p.ht); mk.classList.remove('hold'); }
  });
  function up(e) {
    if (!p) return; var q = p; p = null; clearTimeout(q.ht); mk.classList.remove('hold');
    if (q.board && q.slid) { var row = slideEnd(); if (row) { GJ.haptic.commit(); row.click(); } return; }
    if (q.fired) return;
    var dx = e.clientX - q.x, dy = e.clientY - q.y;
    if (!more()) {   // one meaning: a tap is Back; a drag off the Mark does nothing
      if (Math.hypot(dx, dy) > 12) return;
      back(); return;
    }
    if (dy > 40 && Math.abs(dy) > Math.abs(dx) * 1.3) { app.closeAny(); master(); return; }   // swipe down: every choice
    if (dy < -30 && Math.abs(dy) > Math.abs(dx) * 1.3) { putAway(); return; }   // swipe up: put it all away
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { prevNext(dx > 0 ? 1 : -1); return; }   // swipe across: next / previous
    if (Math.hypot(dx, dy) > 12) return;
    if (html.classList.contains('places')) { closePlaces(); return; }
    if (app.closeAny()) { GJ.haptic.tick(); return; }
    out();   // one tap: out, at once (no waiting for a second tap: double-tap home is retired, REVIEW B3)
  }
  mk.addEventListener('pointerup', up);
  mk.addEventListener('pointercancel', function () { if (p) clearTimeout(p.ht); if (slid) slideEnd(); p = null; mk.classList.remove('hold'); });
  mk.addEventListener('click', function (e) { e.preventDefault(); });
  function label() { mk.setAttribute('aria-label', more() ? 'the Mark — tap to go back, hold for places' : 'Back — the Mark: tap to go back, hold for the places'); }
  label(); store.on(function (s, prev) { if (!prev || s.markMore !== prev.markMore) { label(); var b = document.querySelector('#tune [data-t="markmore"] b'); if (b) b.textContent = more() ? 'on' : 'off'; } });
  (function () { var t = document.getElementById('tune'); if (!t) return; var b = t.querySelector('[data-t="markmore"] b'); if (b) b.textContent = more() ? 'on' : 'off';
    t.addEventListener('click', function (e) { var x = e.target.closest ? e.target.closest('button[data-t="markmore"]') : null; if (x) store.set({ markMore: !more() }); }); })();

  function setMode() { teach(true); }   // no ways left to switch between: asking only shows the lesson again
  setTimeout(function () { teach(false); }, 1400);
  GJ.mark = { say: say, home: home, prevNext: prevNext, mode: mode, setMode: setMode, places: openPlaces, closePlaces: closePlaces, go: go, teach: teach, layout: layoutTip, MODES: MODES, more: more, back: back, lesson: function () { return more() ? LESSON_MORE : LESSON_ONE; } };
})(window);
