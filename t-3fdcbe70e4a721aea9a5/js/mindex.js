/* tools-02 · Motion Index ("index a clip"): WITHHELD from this pack (in-house module "motionIndex").
   PREVIEW STUB with the same public calls so the map, Compare and the Mark still load. The room's look (the sheet of
   glass, #mindex styles) stays in apps/oz/index.html; the picking and sheet engine are not in this pack. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, on = false, el = document.createElement('section');
  el.id = 'mindex'; el.setAttribute('aria-label', 'index a clip (preview stub)');
  el.innerHTML = '<b>index a clip</b><p class="mi-say">preview stub · the index engine is kept in-house</p><div class="mi-act"><button class="mi-x">close</button></div>';
  el.querySelector('.mi-x').addEventListener('click', function () { close(); }); document.body.appendChild(el);
  function open() { on = true; html.classList.add('mindexing'); } function close() { on = false; html.classList.remove('mindexing'); }
  function noop() {}
  GJ.mindex = { stub: true, open: open, close: close, load: noop, loadStills: noop, source: noop, index: noop, choose: noop, dial: noop,
    frames: function () { return []; }, clipName: function () { return ''; }, isOpen: function () { return on; } };
})(window);
