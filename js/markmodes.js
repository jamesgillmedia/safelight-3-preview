/* tools-02 · the Mark, one way (Gill, 17 Nov, later: "make one the default and move the others to another function…
   ok move it"). The three ways to try (A play · B steps · C compass) are folded into one Mark, with no modes:
     tap = out — whatever is open closes first; with nothing open, up one level (a frame → its page, a song → the board,
           a tool → the map, the map → the whole sky). Play / pause left the Mark: it lives on the now-playing pill, on
           the visualizer, and on each place's own button.
     double-tap = home · hold = more: the places board (with every choice, tune, notes, shrink a clip)
     hold, then drag = the compass (C): the places fan out round the Mark; let go on one to go there
     swipe down = every choice (the master menu) · swipe up = put it all away · swipe across = previous / next
   B's "tap = up a level" is the tap now; B's "swipe down = Tune" is the tune row on the board.
   It teaches itself with a small title under the Mark the first few times. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, app = GJ.app, html = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var mk = $('mark');
  var MODES = { a: 'one way' };   // kept for the callers that still ask (app.js): there is one way now
  function mode() { return 'a'; }
  var PLACES = [['sky', 'the sky', 'the map, every tool'], ['red', 'timer', 'red mode'], ['golden', 'golden hour', ''], ['loops', 'loops', ''], ['player', 'sky player', 'lost coffee'], ['archive', 'archive', '']];
  function metaOf(id) { var n = GJ.sky && GJ.sky.nodes && GJ.sky.nodes.filter(function (k) { return k.id === id; })[0]; try { return n && n.meta ? (typeof n.meta === 'function' ? n.meta() : n.meta) : ''; } catch (e) { return ''; } }
  function go(id) {
    closePlaces();
    if (id === 'sky') { if (app.room) app.back(); if (app.room) app.back(); app.toSky(); return; }
    if (id === 'master') { if (G.GJ_MASTER) G.GJ_MASTER.open(); return; }
    if (id === 'shrink') { if (GJ.shrink) GJ.shrink.open(); return; }
    if (id === 'mindex') { if (GJ.mindex) GJ.mindex.open(); return; }
    if (id === 'lab') { if (GJ.lab) GJ.lab.open(); return; }
    if (id === 'objects') { if (GJ.objects) GJ.objects.open(); return; }
    if (id === 'about') { if (GJ.about) GJ.about.open(); return; }
    if (id === 'map') { if (GJ.navmap) GJ.navmap.open(); return; }
    if (id === 'notes') { if (GJ.notes) GJ.notes.open(); return; }
    if (id === 'ask') { if (GJ.ask) GJ.ask.open(); return; }
    if (id === 'tune') { GJ.dial.hideNow(); app.tune(true); return; }
    app.enter(id);
  }

  /* ---------- the little title that teaches ---------- */
  /* it sits under the Mark when it fits; if the moon, the title or another control is in the way it
     reflows and moves so the words stay readable — and it keeps out of the way if the moon is dragged. */
  var tip = document.createElement('div'); tip.id = 'mark-tip'; tip.setAttribute('aria-live', 'polite'); document.body.appendChild(tip);
  var tipT = 0, seen = {}; try { seen = JSON.parse(localStorage.getItem('gj-marktips') || '{}'); } catch (e) {}
  var LESSON = 'tap · out   double-tap · home\nhold · places — then drag for the compass\nswipe down · every choice\n↑ · put away   ← → · previous / next';
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
  function layoutTip() {
    if (!tip.classList.contains('on')) return;
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
  function say(t, ms) { tip.textContent = t; tip.classList.add('on'); layoutTip(); watchTip(); clearTimeout(tipT); tipT = setTimeout(function () { tip.classList.remove('on'); }, ms || 2600); }
  function teach(force) { if (!force && (seen.one || 0) >= 3) return; seen.one = (seen.one || 0) + 1; try { localStorage.setItem('gj-marktips', JSON.stringify(seen)); } catch (e) {} say(LESSON, 4200); }
  G.addEventListener('resize', function () { if (tip.classList.contains('on')) layoutTip(); });

  /* ---------- the places: a board under the Mark (its hold) ---------- */
  var pl = document.createElement('nav'); pl.id = 'places'; pl.setAttribute('aria-label', 'places'); document.body.appendChild(pl);
  function openPlaces() {
    pl.innerHTML = '<b class="jul">places</b>' + PLACES.map(function (p, i) {
      var m = p[0] === 'sky' ? p[2] : (metaOf(p[0]) || p[2]);
      return '<button data-go="' + p[0] + '" style="--i:' + i + '"' + ((app.room || 'sky') === p[0] ? ' class="here"' : '') + '><span class="jul">' + p[1] + '</span><small>' + m + '</small></button>';
    }).join('') + '<button data-go="master" style="--i:6" class="mm"><span class="jul">every choice</span><small>the master menu</small></button>' + '<button data-go="tune" style="--i:7" class="mm"><span class="jul">tune</span><small>every setting, in one list</small></button>' + '<button data-go="notes" style="--i:8" class="mm"><span class="jul">notes</span><small>a page to write on</small></button>' + '<button data-go="shrink" style="--i:9" class="mm"><span class="jul">shrink a clip</span><small>screen recordings, smaller</small></button>' + '<button data-go="mindex" style="--i:10" class="mm"><span class="jul">index a clip</span><small>its motion, as a sheet of stills</small></button>' + '<button data-go="lab" style="--i:11" class="mm"><span class="jul">photo lab</span><small>the shelf · the loupe</small></button>' + '<button data-go="objects" style="--i:12" class="mm"><span class="jul">objects</span><small>a piece to turn</small></button>' + '<button data-go="about" style="--i:13" class="mm"><span class="jul">about</span><small>tap through</small></button>' + '<button data-go="map" style="--i:14" class="mm"><span class="jul">map</span><small>everywhere you can go</small></button>';
    tip.classList.remove('on'); html.classList.add('places'); GJ.haptic.commit();   // the lesson steps aside for the board
  }
  function closePlaces() { html.classList.remove('places'); }
  pl.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (!b) return; e.stopPropagation(); GJ.haptic.tick(); go(b.dataset.go); });
  document.addEventListener('pointerdown', function (e) { if (html.classList.contains('places') && !e.target.closest('#places, #mark')) closePlaces(); }, true);

  /* ---------- the compass fan (hold, then drag) ---------- */
  var fan = document.createElement('div'); fan.id = 'fan'; fan.setAttribute('aria-hidden', 'true'); document.body.appendChild(fan);
  var FAN = PLACES.concat([['notes', 'notes', ''], ['master', 'every choice', ''], ['ask', 'ask', '']])   /* Ask is a spoke in the fan (app map v2, decision 09): it searches the app */, fanSel = -1, fanC = null;
  function fanOpen(cx, cy) {
    fanC = { x: cx, y: cy }; fanSel = -1; tip.classList.remove('on');
    fan.innerHTML = FAN.map(function (p, i) {
      var a = .08 + (i / (FAN.length - 1)) * (Math.PI / 2 - .16), r = 150 + (i % 2) * 34, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;   // from the right (0°) round to straight down (90°)
      return '<span data-i="' + i + '" style="left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;--i:' + i + '"><i></i><em class="jul">' + p[1] + '</em></span>';
    }).join('');
    html.classList.add('fanning'); GJ.haptic.tick();
  }
  function fanMove(x, y) {
    var dx = x - fanC.x, dy = y - fanC.y, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx), k = d < 46 ? -1 : Math.round(clamp01((a - .08) / (Math.PI / 2 - .16)) * (FAN.length - 1));
    if (k !== fanSel) { fanSel = k; [].forEach.call(fan.children, function (s, i) { s.classList.toggle('on', i === k); }); if (k >= 0) GJ.haptic.tick(); }
  }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function fanEnd() { html.classList.remove('fanning'); var k = fanSel; fanSel = -1; if (k >= 0) { GJ.haptic.commit(); go(FAN[k][0]); } }

  /* ---------- the actions ---------- */
  function home() { app.closeAny(); closePlaces(); while (app.room) { var r0 = app.room; app.back(); if (app.room === r0) break; } app.toSky(); say('home · the map', 1100); GJ.haptic.commit(); }
  function putAway() { app.closeAny(); closePlaces(); GJ.dial.hideNow(); if (GJ.shrink) GJ.shrink.close(); if (GJ.mindex) GJ.mindex.close(); say('put away', 900); GJ.haptic.tick(); }
  function prevNext(d) {
    if (app.room === 'archive' && GJ.archive && GJ.archive.state().open != null) { GJ.archive.step(d); var an = GJ.archive.anim(); say('frame ' + (an.frame + 1), 900); return; }
    if (app.room === 'icons' && GJ.icons && GJ.icons.state().open != null) { GJ.icons.step(d); var lb = GJ.icons.label(GJ.icons.isOpen()); say(lb.film.split(' · ').slice(0, 2).join(' · ') + ' · ' + lb.tc, 900); return; }   // the icon board: ← → step through the lights
    if (!GJ.player) return; var st = GJ.player.state(), n = GJ.player.tracks.length, w = st.playing, k = (st.idx + d + n) % n;
    GJ.player.load(k); if (w) GJ.player.play(); var t = GJ.player.tracks[k]; say((d > 0 ? '→ ' : '← ') + t.t.toLowerCase(), 1200); GJ.haptic.tick();
  }
  function out() { if (app.rise) app.rise(); GJ.haptic.tick(); }   // one level up; app.js asks the place first (a frame closes, a zoomed visualizer goes home, a song → the board)
  function master() { GJ.dial.hideNow(); if (G.GJ_MASTER) G.GJ_MASTER.toggle(); GJ.haptic.commit(); }

  /* ---------- one recogniser: tap · double-tap · hold · hold-then-drag · swipes ---------- */
  var p = null, tapT = 0;
  mk.addEventListener('pointerdown', function (e) {
    e.preventDefault(); try { mk.setPointerCapture(e.pointerId); } catch (x) {}
    var r = mk.getBoundingClientRect();
    p = { x: e.clientX, y: e.clientY, t: GJ.now(), fired: false, fan: false, board: false, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    mk.classList.add('hold');
    p.ht = setTimeout(function () {   // hold: more — whatever is open closes; otherwise the places
      if (!p) return; p.fired = true; mk.classList.remove('hold');
      if (!app.closeAny()) { openPlaces(); p.board = true; }
    }, 520);
  });
  mk.addEventListener('pointermove', function (e) {
    if (!p) return; var dx = e.clientX - p.x, dy = e.clientY - p.y, d = Math.hypot(dx, dy);
    if (p.board && !p.fan && d > 14) { closePlaces(); p.fan = true; fanOpen(p.cx, p.cy); }   // still holding, and the finger moves: the compass
    if (p.fan) fanMove(e.clientX, e.clientY);
    else if (d > 10 && !p.fired) { clearTimeout(p.ht); mk.classList.remove('hold'); }
  });
  function up(e) {
    if (!p) return; var q = p; p = null; clearTimeout(q.ht); mk.classList.remove('hold');
    if (q.fan) { fanEnd(); return; }
    if (q.fired) return;
    var dx = e.clientX - q.x, dy = e.clientY - q.y;
    if (dy > 40 && Math.abs(dy) > Math.abs(dx) * 1.3) { app.closeAny(); master(); return; }   // swipe down: every choice
    if (dy < -30 && Math.abs(dy) > Math.abs(dx) * 1.3) { putAway(); return; }   // swipe up: put it all away
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { prevNext(dx > 0 ? 1 : -1); return; }   // swipe across: next / previous
    if (Math.hypot(dx, dy) > 12) return;
    if (html.classList.contains('places')) { closePlaces(); return; }
    if (app.closeAny()) { GJ.haptic.tick(); return; }
    if (tapT) { clearTimeout(tapT); tapT = 0; home(); return; }   // a second tap in time: home
    tapT = setTimeout(function () { tapT = 0; out(); }, 280);   // one tap: out
  }
  mk.addEventListener('pointerup', up);
  mk.addEventListener('pointercancel', function () { if (p) clearTimeout(p.ht); if (p && p.fan) html.classList.remove('fanning'); p = null; mk.classList.remove('hold'); });
  mk.addEventListener('click', function (e) { e.preventDefault(); });
  mk.setAttribute('aria-label', 'the Mark: tap to go out a level, double-tap for home, hold for the places');

  function setMode() { teach(true); }   // no ways left to switch between: asking only shows the lesson again
  setTimeout(function () { teach(false); }, 1400);
  GJ.mark = { say: say, home: home, prevNext: prevNext, mode: mode, setMode: setMode, places: openPlaces, closePlaces: closePlaces, go: go, teach: teach, layout: layoutTip, MODES: MODES };
})(window);
