/* oz 3 alt · the Moon dial as a plain list (REFINE-PLAN: "the flat list (VoiceOver) offered as a sheet").
   The same choices as the orbit, ring by ring, in a sheet from the bottom: tap one and it is chosen (a tick marks the
   current ones). It is the Moon dial's own hidden button list made visible — each row presses that button, so the
   orbit and the list can never disagree. Ways in: the "list" chip while the orbit is open, Tune → Moon dial · as a list,
   and GJ.moonList.open(). Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var src = document.querySelector('#moon div.mn-ring'); if (!src || !GJ.moon) return;
  var sh = document.createElement('section'); sh.id = 'moonlist'; sh.className = 'gj-sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Moon dial, as a list');
  document.body.appendChild(sh);
  var dim = document.getElementById('sheet-dim'); if (!dim) { dim = document.createElement('div'); dim.id = 'sheet-dim'; dim.setAttribute('aria-hidden', 'true'); document.body.appendChild(dim); }
  function paint() {
    var h = '<i class="pl-grab" aria-hidden="true"></i><b class="jul">moon dial</b><button class="sh-done" data-a="done">Done</button>';
    [].forEach.call(src.querySelectorAll(':scope > [role=group]'), function (g) {
      h += '<em class="pl-h">' + g.getAttribute('aria-label') + '</em>';
      [].forEach.call(g.querySelectorAll('button[data-i]'), function (b) {
        var word = b.textContent.split(': ').slice(1).join(': ') || b.textContent;
        h += '<button class="sh-row" data-i="' + b.getAttribute('data-i') + '" aria-pressed="' + b.getAttribute('aria-pressed') + '" aria-label="' + b.textContent.replace(/"/g, '&quot;') + '"><span>' + word + '</span></button>';
      });
    });
    sh.innerHTML = h;
  }
  function isOpen() { return sh.classList.contains('on'); }
  function open() { if (GJ.moon.ring && GJ.moon.ring()) GJ.moon.close(); paint(); sh.classList.add('on'); html.classList.add('sheeting'); sh.scrollTop = 0; if (GJ.haptic) GJ.haptic.tick(); }
  function close() { sh.classList.remove('on'); sh.style.transform = ''; if (!document.querySelector('.gj-sheet.on')) html.classList.remove('sheeting'); }
  sh.addEventListener('click', function (e) {
    if (sh.dataset.swallow) return;
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.a === 'done') { close(); return; }
    var i = b.getAttribute('data-i'), s = src.querySelector('button[data-i="' + i + '"]'); if (!s) return;
    s.click(); if (GJ.haptic) GJ.haptic.tick();
    var keep = sh.scrollTop; paint(); sh.scrollTop = keep;
  });
  document.addEventListener('pointerdown', function (e) { if (isOpen() && !e.target.closest('#moonlist')) close(); }, true);
  (function () {   // drag the sheet down to put it away, like any iPhone sheet
    var sd = null;
    sh.addEventListener('pointerdown', function (e) { if (sh.scrollTop > 2) return; sd = { y: e.clientY, x: e.clientX, id: e.pointerId, dy: 0 }; });
    sh.addEventListener('pointermove', function (e) { if (!sd || e.pointerId !== sd.id) return; sd.dy = Math.max(0, e.clientY - sd.y); if (sd.dy > 8 && sd.dy > Math.abs(e.clientX - sd.x)) { sd.live = true; sh.style.transition = 'none'; sh.style.transform = 'translateY(' + sd.dy + 'px)'; } });
    function end() { if (!sd) return; var q = sd; sd = null; sh.style.transition = ''; if (q.live) { if (q.dy > 90) close(); else sh.style.transform = ''; sh.dataset.swallow = '1'; setTimeout(function () { delete sh.dataset.swallow; }, 50); } }
    sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
  })();
  // the chip, while the orbit is open
  var el = document.getElementById('moon'), chip = document.createElement('button'); chip.type = 'button'; chip.className = 'mn-list'; chip.textContent = 'list'; chip.setAttribute('aria-label', 'Moon dial as a list');
  el.appendChild(chip);
  chip.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  chip.addEventListener('click', function (e) { e.stopPropagation(); open(); });
  // Tune → Moon dial · as a list
  (function () { var t = document.getElementById('tune'); if (!t) return; t.addEventListener('click', function (e) { var x = e.target.closest ? e.target.closest('button[data-t="moonlist"]') : null; if (x) { if (GJ.app && GJ.app.tune) GJ.app.tune(false); open(); } }); })();
  // the Moon dial's VoiceOver hint names the list too
  var hint = document.getElementById('mn-hint'); if (hint) hint.textContent = 'tap or hold to open the light dial; drag to move it; or open it as a list (Tune → Moon dial · as a list, or the list button)';
  GJ.moonList = { open: open, close: close, isOpen: isOpen, rows: function () { return sh.querySelectorAll('.sh-row').length; } };
})(window);
