/* oz boot (Gill's locked spec, 20 Nov): the boot is only the mint dot coming on, alone on pure black. Then F1, the local
   check, lights round its arch. Boot mode (System → Boot): 'save' (default) waits on that calm black screen with your place
   ready behind it, a tap anywhere resumes; 'resume' goes on by itself once F1 is done. Either way you come back to the place
   you left. oz opens in red mode (core default). No text, no logo, no motion beyond fades, so Reduce Motion is the same. */
(function (G) {
  'use strict';
  var GJ = G.GJ, KEY = 'oz-boot', PLACE = 'oz-place', b = document.getElementById('ozboot');
  function mode() { try { return localStorage.getItem(KEY) === 'resume' ? 'resume' : 'save'; } catch (e) { return 'save'; } }
  GJ && (GJ.boot = { mode: mode, set: function (m) { try { localStorage.setItem(KEY, m === 'resume' ? 'resume' : 'save'); } catch (e) {} } });
  // remember the place you are in (a room id, or the sky) as you go
  var last = null;
  function keep() { setInterval(function () { var r = (GJ && GJ.app && GJ.app.room) || ''; if (r !== last) { last = r; try { localStorage.setItem(PLACE, r); } catch (e) {} } }, 1000); }
  // a timer that ended while oz was closed: one quiet line, after the boot (core.js reset it without touching red mode)
  function ended() {
    var t = GJ && GJ.timerEndedAway; if (!t || !GJ.mark || !GJ.mark.say) return; GJ.timerEndedAway = 0;
    var d = new Date(t), h = d.getHours(), m = d.getMinutes(), h24 = GJ.store && GJ.store.get().clock === '24';
    var s = h24 ? (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m : ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' am' : ' pm');
    GJ.mark.say('timer ended at ' + s, 4200);
  }
  if (!b || b.className === 'skip') { document.documentElement.classList.add('ozb-done'); keep(); setTimeout(ended, 1600); return; }
  var t0 = G.OZ_BOOT_T0 || performance.now(), ready = false, done = false;
  function at(ms, f) { setTimeout(f, Math.max(0, ms - (performance.now() - t0))); }
  // F1: a dotted arch, lit dot by dot — the phone checking itself, locally
  var svg = b.querySelector('.ob-f1'), N = 21, dots = [];
  for (var i = 0; i < N; i++) { var a = Math.PI * (1.13 - 1.26 * i / (N - 1)), c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', (34 * Math.cos(a)).toFixed(2)); c.setAttribute('cy', (-34 * Math.sin(a) + 12).toFixed(2)); c.setAttribute('r', i % 5 === 0 ? 1.5 : 1.2); svg.appendChild(c); dots.push(c); }
  // your place, made ready behind the black while F1 runs
  at(1600, function () { var p = ''; try { p = localStorage.getItem(PLACE) || ''; } catch (e) {} if (p && GJ && GJ.mark && GJ.mark.go && GJ.app && !GJ.app.room) { try { GJ.mark.go(p); } catch (e) {} } setTimeout(keep, 1500); });
  at(3300, function () { dots.forEach(function (d, k) { setTimeout(function () { d.classList.add('lit'); }, k * 75); }); });
  at(3300 + N * 75 + 700, function () { ready = true; if (mode() === 'resume') go(); });
  function go() { if (done) return; done = true; b.classList.add('gone'); document.documentElement.classList.add('ozb-done'); setTimeout(function () { b.remove(); }, 1100); setTimeout(ended, 1300); }
  // the boot screen holds every touch: nothing under it reacts. Once F1 is done, a tap anywhere resumes.
  function hold(e) { e.preventDefault(); e.stopPropagation(); }
  ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(function (t) { b.addEventListener(t, hold, { passive: false }); });
  b.addEventListener('pointerup', function (e) { hold(e); if (ready) go(); });
  document.addEventListener('keydown', function (e) { if (!done && ready && (e.key === 'Enter' || e.key === ' ')) go(); }, true);
})(window);
