/* tools-02 · the timer's lock (Gill, 17 Nov): "a lock that you hold and slide to unlock".
   Tap the lock in the timer and the whole screen stops listening (a pocket, a sleeve, a bump on set) — the timer keeps
   running and stays visible. To unlock: hold the knob (it brightens when it has you, 300 ms), then slide it across.
   Let go early and it slides home. Red mode stays as it is while locked. */
(function (G) {
  'use strict';
  var GJ = G.GJ, $ = function (id) { return document.getElementById(id); };
  var veil = document.createElement('div'); veil.id = 'lockveil'; veil.setAttribute('role', 'dialog'); veil.setAttribute('aria-label', 'locked: hold the knob and slide to unlock');
  veil.innerHTML = '<div class="lk-track"><span class="lk-hint">hold · slide to unlock</span><button class="lk-knob" aria-label="hold and slide to unlock"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg></button></div>';
  document.body.appendChild(veil);
  var track = veil.querySelector('.lk-track'), knob = veil.querySelector('.lk-knob');
  var locked = false, hold = null, x = 0;
  function set(on) {
    locked = on; document.documentElement.classList.toggle('locked', on); x = 0; knob.style.transform = '';
    var b = $('rm-lockb'); if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    if (on) { GJ.dial.hideNow(); if (G.GJ_MASTER) G.GJ_MASTER.close(); GJ.haptic.commit(); }
  }
  // nothing gets through the veil while locked: pointers, keys, wheel
  ['pointerdown', 'pointerup', 'click', 'wheel', 'touchstart'].forEach(function (t) {
    veil.addEventListener(t, function (e) { if (!e.target.closest('.lk-knob')) { e.stopPropagation(); if (t !== 'touchstart') e.preventDefault(); } }, { passive: false });
  });
  G.addEventListener('keydown', function (e) { if (locked) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  knob.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation(); try { knob.setPointerCapture(e.pointerId); } catch (x2) {}
    hold = { x0: e.clientX, armed: false, t: setTimeout(function () { if (hold) { hold.armed = true; knob.classList.add('armed'); GJ.haptic.tick(); } }, 300) };
  });
  knob.addEventListener('pointermove', function (e) {
    if (!hold) return;
    var max = track.clientWidth - knob.offsetWidth - 8;
    if (!hold.armed) { if (Math.abs(e.clientX - hold.x0) > 6) { clearTimeout(hold.t); hold.x0 = e.clientX; } return; }   // must be held first
    x = Math.max(0, Math.min(max, e.clientX - hold.x0)); knob.style.transform = 'translateX(' + x + 'px)';
    veil.style.setProperty('--lk', (x / max).toFixed(3));
  });
  function up(e) {
    if (!hold) return; e.stopPropagation(); clearTimeout(hold.t);
    var max = track.clientWidth - knob.offsetWidth - 8, done = hold.armed && x >= max * .85;
    hold = null; knob.classList.remove('armed');
    if (done) { set(false); GJ.haptic.commit(); }
    else { knob.style.transition = 'transform .32s cubic-bezier(.22,.7,.2,1)'; knob.style.transform = ''; x = 0; veil.style.setProperty('--lk', 0); setTimeout(function () { knob.style.transition = ''; }, 340); }
  }
  knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
  // the lock in the timer
  var b = $('rm-lockb');
  if (b) b.addEventListener('click', function () { set(true); });
  GJ.lock = { set: set, locked: function () { return locked; } };
})(window);
