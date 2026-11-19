/* tools-02 · the master dimmer (Gill, 17 Nov: "when in red mode and safelight a master dimmer slide appears").
   A slim slider on the left edge — the dial's mirror — that only exists in red mode: slide up for more light, down for
   less. It is the same lightness the red dot's hold-dial turns (store.redLight), so the two always agree. Tap it to
   jump between 100 % and the last dim level. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, clamp = GJ.clamp, html = document.documentElement;
  var el = document.createElement('div'); el.id = 'dimmer'; el.setAttribute('role', 'slider'); el.setAttribute('aria-label', 'dimmer'); el.tabIndex = 0;
  el.innerHTML = '<i class="dm-rail"><i class="dm-track"></i><i class="dm-fill"></i><i class="dm-knob"></i></i><b class="jul">DIM</b><span class="dm-v"></span>';
  document.body.appendChild(el);
  var fill = el.querySelector('.dm-fill'), knob = el.querySelector('.dm-knob'), val = el.querySelector('.dm-v');
  var MIN = .08, drag = null, last = .45, lastT = 0;
  function light() { var l = store.get().redLight; return l == null ? 1 : l; }
  function paint() {
    var l = light(), f = (l - MIN) / (1 - MIN);
    fill.style.height = (f * 100).toFixed(1) + '%'; knob.style.bottom = 'calc(' + (f * 100).toFixed(1) + '% - 6.5px)';
    val.textContent = Math.round(l * 100) + '%'; el.setAttribute('aria-valuenow', Math.round(l * 100));
    html.style.setProperty('--red-light', l.toFixed(3));
    html.classList.toggle('dimmer', !!store.get().red); var full = !!store.get().red && !!store.get().fullSafe; html.classList.toggle('fullsafe', full); html.classList.toggle('photored', full && store.get().photoRed !== false);   // class may stay for Tune; photographs themselves are never tinted
  }
  function setFrom(y) {
    var r = el.querySelector('.dm-track').getBoundingClientRect(), f = clamp((r.bottom - y) / r.height, 0, 1), l = Math.round((MIN + f * (1 - MIN)) * 100) / 100;
    if (Math.abs(l - light()) >= .01) { store.set({ redLight: l }); if (Math.round(l * 20) !== Math.round(light() * 20)) GJ.haptic.tick(); }
  }
  el.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch (x) {} drag = { y: e.clientY, t: GJ.now(), moved: false }; el.classList.add('live'); });
  el.addEventListener('pointermove', function (e) { if (!drag) return; if (Math.abs(e.clientY - drag.y) > 4) drag.moved = true; if (drag.moved) setFrom(e.clientY); });
  function up(e) {
    if (!drag) return; var d = drag; drag = null; el.classList.remove('live');
    if (!d.moved && GJ.now() - d.t < 400) {   // tap: full ⇄ the last dim level · double-tap: as dark as it goes (the night's floor)
      if (GJ.now() - lastT < 320) { lastT = 0; store.set({ redLight: MIN }); GJ.haptic.commit(); return; }
      lastT = GJ.now(); var l = light(); if (l < .98) { last = l; store.set({ redLight: 1 }); } else store.set({ redLight: last }); GJ.haptic.commit();
    }
  }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', function (e) { var l = light(); if (e.key === 'ArrowUp') store.set({ redLight: Math.min(1, l + .05) }); if (e.key === 'ArrowDown') store.set({ redLight: Math.max(MIN, l - .05) }); });
  store.on(paint); paint();
  GJ.dimmer = { light: light, set: function (l) { store.set({ redLight: clamp(l, MIN, 1) }); } };
})(window);
