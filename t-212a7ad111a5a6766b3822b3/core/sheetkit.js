/* oz core · one sheet behaviour (oz 3 alt, after the intuitiveness review B5/B7: "Sheets don't swipe down to close…
   add a grabber bar and drag-down to dismiss, like any iOS sheet"). The places sheet and the Moon list already work this
   way; this gives the same grabber and the same drag-down to the others: Tune, every choice (the master sheet), the F3 log
   and Ask. Pull down from the top (the grabber, or anywhere once the sheet is scrolled to its top): it follows the finger;
   let go past 90 px (or with a quick flick) and it closes; less, and it settles back.
     GJ.sheet.attach(el, close)   ·   GJ.sheet.ids() */
(function (G) {
  'use strict';
  var GJ = G.GJ, done = [];
  function attach(el, close) {
    if (!el || el.dataset.sk) return; el.dataset.sk = '1'; el.classList.add('sk'); done.push(el.id);
    if (!el.querySelector(':scope > .pl-grab')) { var g = document.createElement('i'); g.className = 'pl-grab sk-grab'; g.setAttribute('aria-hidden', 'true'); el.insertBefore(g, el.firstChild); }
    var sd = null, swallow = 0;
    el.addEventListener('pointerdown', function (e) {
      if (el.scrollTop > 2 && !(e.target.classList && e.target.classList.contains('pl-grab'))) return;
      if (e.target.closest && e.target.closest('input, textarea, canvas, [data-sk-free]')) return;
      sd = { y: e.clientY, x: e.clientX, id: e.pointerId, dy: 0, t: GJ.now() };
    });
    G.addEventListener('pointermove', function (e) {
      if (!sd || e.pointerId !== sd.id) return; sd.dy = Math.max(0, e.clientY - sd.y);
      if (!sd.live && sd.dy > 10 && sd.dy > Math.abs(e.clientX - sd.x) * 1.4) { sd.live = true; el.style.transition = 'none'; }
      if (sd.live) el.style.translate = '0 ' + sd.dy + 'px';
    });
    function end() {
      if (!sd) return; var q = sd; sd = null; if (!q.live) return;
      el.style.transition = ''; el.style.translate = '';
      var fast = q.dy > 40 && q.dy / Math.max(1, GJ.now() - q.t) > .6;
      if (q.dy > 90 || fast) { close(); if (GJ.haptic) GJ.haptic.tick(); }
      swallow = GJ.now() + 300;
    }
    G.addEventListener('pointerup', end); G.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) { if (GJ.now() < swallow) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  // Esc closes the sheet on top (keyboards, iPad): never more than that, and never up a level
  function escape() {
    var h = document.documentElement;
    if (h.classList.contains('places') && GJ.mark) { GJ.mark.closePlaces(); return true; }
    if (GJ.moonList && GJ.moonList.isOpen && GJ.moonList.isOpen()) { GJ.moonList.close(); return true; }
    return !!(GJ.app && GJ.app.closeAny && GJ.app.closeAny());
  }
  document.addEventListener('keydown', function (e) { if (e.key !== 'Escape' || e.defaultPrevented) return; if (escape()) e.preventDefault(); });
  GJ.sheet = { attach: attach, ids: function () { return done.slice(); }, escape: escape };
  // the core's own sheets (each app has the ones it loads)
  var $ = function (id) { return document.getElementById(id); };
  attach($('tune'), function () { if (GJ.app && GJ.app.tune) GJ.app.tune(false); });
  attach($('master-panel'), function () { if (G.GJ_MASTER) G.GJ_MASTER.close(); });
  attach($('cam-panel'), function () { if (G.GJ_CAMDIAL) G.GJ_CAMDIAL.close(); });   // the camera sheet says "swipe down to close" (voice pass), so it does
  attach($('f3log'), function () { if (GJ.f3) GJ.f3.close(); });
  attach($('ask'), function () { if (GJ.ask && GJ.ask.close) GJ.ask.close(); else if (GJ.app) GJ.app.closeAny(); });
})(window);
