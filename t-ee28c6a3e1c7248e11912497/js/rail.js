/* tools-02 · the camera rail — the site's 3D camera control (level dots, sky.js jumpLevel / arriveAt;
   Previews lvNow dots: ● up to the current level, ○ after). Used for the complex, multi-stop controls:
   camera levels on the sky, the day's events in Golden Hour, the lens stops in Loupe.
   Tap a dot: travel there on the spring. Drag along the rail: continuous between stops.
   Release: stays where you left it, unless a stop is close, then it glides the rest of the way. */
(function (G) {
  'use strict';
  var GJ = G.GJ, clamp = GJ.clamp;
  var el, spec = null, drag = null, GAP = 26;
  var rail = GJ.rail = {};

  rail.init = function () {
    el = document.getElementById('rail');
    el.addEventListener('pointerdown', down);
    G.addEventListener('pointermove', move);
    G.addEventListener('pointerup', up); G.addEventListener('pointercancel', up);
  };
  rail.config = function (s) { spec = s; build(); };
  rail.spec = function () { return spec; };

  function build() {
    el.innerHTML = '';
    el.classList.toggle('on', !!spec);
    if (!spec) return;
    var lab = document.createElement('span'); lab.className = 'rl-lab jul'; el.appendChild(lab);
    spec.stops.forEach(function (st, i) {
      var b = document.createElement('button'); b.className = 'rl-dot'; b.setAttribute('aria-label', st.label);
      b.style.top = (i * GAP) + 'px'; b.innerHTML = '<i></i>';
      b.addEventListener('click', function (e) { e.stopPropagation(); if (GJ.now() - (rail._moved || 0) < 350) return; GJ.haptic.commit(); spec.go(i); });
      el.appendChild(b);
    });
    el.style.height = ((spec.stops.length - 1) * GAP + 26) + 'px';
    rail.redraw();
  }

  rail.redraw = function () {
    if (!spec || !el) return;
    var f = clamp(spec.get(), 0, spec.stops.length - 1), cur = Math.round(f);
    [].forEach.call(el.querySelectorAll('.rl-dot'), function (b, i) {
      b.classList.toggle('fill', i <= f + .02);       // ● up to the current level, ○ after
      b.classList.toggle('cur', i === cur);
    });
    var lab = el.querySelector('.rl-lab'), st = spec.stops[cur];
    var txt = spec.label ? spec.label(cur, f) : st.label;
    if (lab.textContent !== txt) lab.textContent = txt;
    lab.style.top = (f * GAP + 4) + 'px';
    // marks (optional): spec.marks() → [{ f, label }] — hairlines beside the dots, for points kept on the rail (a film's in and out)
    var ms = spec.marks ? spec.marks() : [], old = el.querySelectorAll('.rl-mark');
    if (old.length !== ms.length) { [].forEach.call(old, function (x) { x.remove(); }); ms.forEach(function () { var m = document.createElement('i'); m.className = 'rl-mark'; el.appendChild(m); }); old = el.querySelectorAll('.rl-mark'); }
    ms.forEach(function (m, k) { old[k].style.top = (clamp(m.f, 0, spec.stops.length - 1) * GAP + 13) + 'px'; if (old[k].getAttribute('data-l') !== m.label) old[k].setAttribute('data-l', m.label); });
  };

  function fOf(y) { var r = el.getBoundingClientRect(); return clamp((y - r.top - 13) / GAP, 0, spec.stops.length - 1); }
  function down(e) {
    if (!spec) return;
    e.stopPropagation();
    drag = { id: e.pointerId, y: e.clientY, moved: false, last: Math.round(fOf(e.clientY)) };
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.abs(e.clientY - drag.y) < 6) return;
    if (!drag.moved) { try { el.setPointerCapture(e.pointerId); } catch (x) {} }   // capture only once it is a drag, so a tap stays a tap
    drag.moved = true;
    var f = fOf(e.clientY), k = Math.round(f);
    if (k !== drag.last && Math.abs(f - k) < .12) { GJ.haptic.tick(); drag.last = k; }   // a tick at each stop
    spec.scrub(f);
    rail.redraw();
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.moved) return;   // a plain tap is the dot's click
    var f = fOf(e.clientY), k = Math.round(f);
    if (Math.abs(f - k) < .25) { GJ.haptic.commit(); spec.go(k); }   // close to a stop: glide the rest of the way
    else spec.rest && spec.rest(f);                                   // otherwise stay where it is
    rail._moved = GJ.now();
  }
})(this);
