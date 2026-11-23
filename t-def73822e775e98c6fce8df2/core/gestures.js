/* oz 3 alt · gestures every iPhone user already knows (REFINE-PLAN, cross-cutting):
     · swipe in from the left edge = Back, everywhere (the same Back as a tap on the Mark: whatever is open closes first,
       otherwise up one level). A small ‹ follows the finger, like the iPhone's own edge.
     · pull down on the sky = search (Ask), like pulling down on the Home Screen for Search. A "search" pill comes down
       with the finger; let go past the line and Ask opens.
   Controls under the finger (buttons, sliders, the red pad, the Mark, the moon) keep their own touch. */
(function (G) {
  'use strict';
  var GJ = G.GJ, app = GJ.app, html = document.documentElement, EDGE = 16, BACK_AT = 70, PULL_AT = 110;
  function mk(id, cls) { var e = document.createElement('div'); e.id = id; if (cls) e.className = cls; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; }
  var chev = mk('edge-back'); chev.innerHTML = '<i>&#8249;</i>';
  var pill = mk('pull-search'); pill.innerHTML = '<i></i><span>search</span>';
  var SKIP = 'button, input, select, textarea, a, label, [role=slider], [role=switch], #redpad, #mark, #moon, #moonfree, #ozcmp, #master, #master2, .gzone, #rail, #coned, #ozt, #mo';
  function blocked() { return html.classList.contains('locked') || html.classList.contains('coneditng') || html.classList.contains('oztuning'); }

  /* ---------- the left edge: Back ---------- */
  var eg = null, nPtr = 0;
  document.addEventListener('pointerdown', function (e) {
    nPtr++;
    if (nPtr > 1) { if (eg) cancelEdge(); return; }
    if (e.clientX > EDGE || blocked() || (e.target.closest && e.target.closest(SKIP))) return;
    e.stopPropagation(); e.preventDefault();   // the edge belongs to Back, as on the phone
    eg = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
    chev.style.top = e.clientY + 'px';
  }, true);
  G.addEventListener('pointermove', function (e) {
    if (!eg || e.pointerId !== eg.id) return; e.stopPropagation();
    eg.dx = Math.max(0, e.clientX - eg.x); eg.dy = e.clientY - eg.y;
    var f = Math.min(1, eg.dx / BACK_AT); chev.style.setProperty('--f', f.toFixed(3)); chev.classList.toggle('on', eg.dx > 8); chev.classList.toggle('go', f >= 1);
    if (f >= 1 && !eg.ticked) { eg.ticked = true; GJ.haptic.tick(); } else if (f < 1) eg.ticked = false;
  }, true);
  function cancelEdge() { eg = null; chev.classList.remove('on', 'go'); }
  function upAll(e) {
    nPtr = Math.max(0, nPtr - 1);
    if (!eg || e.pointerId !== eg.id) return; var q = eg; cancelEdge(); e.stopPropagation();
    if (e.type === 'pointerup' && q.dx >= BACK_AT && q.dx > Math.abs(q.dy) * 1.2) { var r = GJ.mark && GJ.mark.back ? GJ.mark.back() : (app.closeAny() || app.rise()); last = { t: GJ.now(), did: r }; }
  }
  G.addEventListener('pointerup', upAll, true); G.addEventListener('pointercancel', upAll, true);
  var last = null;

  /* ---------- pull down on the sky: search ---------- */
  var cvs = document.getElementById('sky'), pd = null;
  function onSky() { return !app.room && app.mode === 'sky' && !html.classList.contains('tune') && !html.classList.contains('places') && !blocked() && !(GJ.ask && GJ.ask.isOpen()); }
  if (cvs) cvs.addEventListener('pointerdown', function (e) {
    if (nPtr > 1 || !onSky() || e.clientY > G.innerHeight * .62) { pd = null; return; }
    pd = { id: e.pointerId, x: e.clientX, y: e.clientY, dy: 0, live: false };
  });
  G.addEventListener('pointermove', function (e) {
    if (!pd || e.pointerId !== pd.id) return;
    if (nPtr > 1) { endPull(); return; }
    var dx = e.clientX - pd.x, dy = e.clientY - pd.y; pd.dy = dy;
    if (!pd.live && dy > 16 && dy > Math.abs(dx) * 1.6) pd.live = true;
    if (!pd.live) return;
    var f = Math.max(0, Math.min(1, dy / PULL_AT)); pill.style.setProperty('--f', f.toFixed(3)); pill.classList.add('on'); pill.classList.toggle('go', f >= 1);
    if (f >= 1 && !pd.ticked) { pd.ticked = true; GJ.haptic.tick(); } else if (f < 1) pd.ticked = false;
  });
  function endPull() { pd = null; pill.classList.remove('on', 'go'); }
  G.addEventListener('pointerup', function (e) {
    if (!pd || e.pointerId !== pd.id) return; var q = pd; endPull();
    if (q.live && q.dy >= PULL_AT && GJ.ask) { GJ.ask.open(); GJ.haptic.commit(); }
  });
  G.addEventListener('pointercancel', function () { endPull(); });

  /* ---------- two fingers, held still: Tune, from anywhere (Gill, 19 Nov 2:19) ----------
     Exactly two fingers down, and both still for HOLD2 ms: no finger moves more than STILL px, and the gap between them
     changes by less than STILL px. A pinch (the gap changes), an orbit or a fly (the fingers move), a third finger, or a
     finger lifted: it is not this, and the other gesture goes on untouched (this only listens; it never takes the touch).
     The other ways in to Tune stay (the Mark's hold, the list, the keyboard). */
  var HOLD2 = 600, STILL = 10, TF = {}, tf = null;
  function tfIds() { return Object.keys(TF); }
  function gap() { var k = tfIds(); if (k.length !== 2) return 0; var a = TF[k[0]], b = TF[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function tfCancel(why) { if (tf) { clearTimeout(tf.t); tf = null; last = 'two:' + why; } }
  function tfFire() {
    tf = null; if (blocked() || !app || !app.tune) return;
    if (app.tuneOpen && app.tuneOpen()) { last = 'two:open already'; return; }
    if (GJ.moonOrbit && GJ.moonOrbit.isOpen && GJ.moonOrbit.isOpen()) GJ.moonOrbit.close();
    app.tune(true); last = 'two:tune'; if (GJ.haptic) GJ.haptic.commit();
  }
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    TF[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
    tfCancel('more');
    if (tfIds().length === 2 && !blocked()) tf = { g0: gap(), t: setTimeout(tfFire, HOLD2) };
  }, true);
  G.addEventListener('pointermove', function (e) {
    var p = TF[e.pointerId]; if (!p) return; p.x = e.clientX; p.y = e.clientY;
    if (!tf) return;
    if (Math.hypot(p.x - p.x0, p.y - p.y0) > STILL) tfCancel('moved');
    else if (Math.abs(gap() - tf.g0) > STILL) tfCancel('spread');
  }, true);
  function tfUp(e) { if (!TF[e.pointerId]) return; delete TF[e.pointerId]; tfCancel('lifted'); }
  G.addEventListener('pointerup', tfUp, true); G.addEventListener('pointercancel', tfUp, true);

  GJ.gestures = { EDGE: EDGE, BACK_AT: BACK_AT, PULL_AT: PULL_AT, HOLD2: HOLD2, last: function () { return last; } };
})(window);
