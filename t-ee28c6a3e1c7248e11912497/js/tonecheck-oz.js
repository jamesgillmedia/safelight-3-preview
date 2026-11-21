/* Tone Check in oz: the room's seam with the app (loads right after js/tonecheck.js; core/registry.js lists both).
   The room is the builder's, unchanged in behaviour; this file only fits it to oz:
     · where it lives: inside #rooms as <section id="r-tonecheck" class="room">, so it fades in and out like every room
       and the Mark, the "oz" word, the red-mode dot and Tune all stay above it
     · oz's own tokens and fonts (core/base.css: --ink --dim --meta --hair --glass --mint --red-ink --rose, Poppins and
       Julius Sans One from fonts/), not the pack's stand-ins; in red mode the ink follows the dot's tone (--red-ink)
     · the app's signals: red mode is html.red (the room reads it), Reduce Motion is GJ.reduced(), haptics are GJ.haptic
       and Tune → Dials → Haptics
   The room never draws a red-mode control: the dot (#disc) is the app's, and stays exactly as the app draws it. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, R = GJ.rooms && GJ.rooms.tonecheck, doc = document;
  if (!R || R.__oz) return;
  var CSS = [
    '#r-tonecheck{pointer-events:none}#r-tonecheck.on{pointer-events:auto}',
    '#r-tonecheck .tc-room{position:absolute;z-index:auto}',
    'html .tc-room{--font-body:Poppins,-apple-system,system-ui,sans-serif;--font-label:"Julius Sans One",Poppins,sans-serif;',
    '--tc-body:var(--font-body);--tc-label:var(--font-label);',
    '--tc-ink:var(--ink);--tc-dim:var(--dim);--tc-meta:var(--meta);--tc-hair:var(--hair);--tc-glass:var(--glass);',
    '--tc-accent:var(--mint);--tc-cue:var(--mint);--tc-accent-soft:rgba(85,218,161,.16);--tc-danger:var(--crimson)}',
    'html .tc-room[data-look=red]{--tc-ink:var(--red-ink);--tc-dim:var(--red-ink);--tc-meta:var(--red-ink);--tc-hair:var(--red-hair);--tc-glass:var(--red-glass);',
    '--tc-accent:var(--red-ink);--tc-cue:var(--red-ink);--tc-danger:var(--red-ink);background-color:var(--redpage)}',
    'html .tc-room[data-look=red] .tc-sub,html .tc-room[data-look=red] .tc-label,html .tc-room[data-look=red] .tc-small{opacity:.72}',
    'html .tc-room[data-look=rose]{--tc-ink:var(--rose);--tc-accent:var(--rose);--tc-cue:var(--rose)}',
    '.tc-room .tc-head{padding-top:var(--title-top)}'
  ].join('');
  var st = doc.createElement('style'); st.id = 'tc-oz-css'; st.textContent = CSS; doc.head.appendChild(st);

  // the room's place among the rooms
  var sec = doc.getElementById('r-tonecheck');
  if (!sec) {
    sec = doc.createElement('section'); sec.className = 'room'; sec.id = 'r-tonecheck'; sec.setAttribute('aria-label', 'tone check');
    (doc.getElementById('rooms') || doc.body).appendChild(sec);
  }
  // the app's signals, under the names the room reads
  if (GJ.app && !('reduceMotion' in GJ.app)) Object.defineProperty(GJ.app, 'reduceMotion', { configurable: true, get: function () { return !!(GJ.reduced && GJ.reduced()); } });
  if (!GJ.haptics) GJ.haptics = {
    get enabled() { return !(GJ.dialprefs && GJ.dialprefs.haptics && GJ.dialprefs.haptics() === false); },
    tick: function () { if (GJ.haptic && GJ.haptic.tick) GJ.haptic.tick(); }
  };

  var enter = R.enter, leave = R.leave;
  R.__oz = true;
  R.id = 'tonecheck'; R.title = ''; R.trees = 0; R.golden = 0;   // the room draws its own title at the title line
  R.rings = function () { return []; };
  R.rail = function () { return null; };
  R.frame = function () {};
  R.enter = function () {
    var had = GJ.app && GJ.app.roomHost; if (GJ.app) GJ.app.roomHost = sec;
    try { enter.apply(R, arguments); } finally { if (GJ.app) { if (had) GJ.app.roomHost = had; else delete GJ.app.roomHost; } }
  };
  R.leave = function () { if (G.ozVoiceCalibration && G.ozVoiceCalibration.close) G.ozVoiceCalibration.close(); leave.apply(R, arguments); };
  // the Mark's Back: an open sheet or card closes first, then the room
  R.back = function () {
    if (G.ozVoiceCalibration && G.ozVoiceCalibration.isOpen && G.ozVoiceCalibration.isOpen()) { G.ozVoiceCalibration.close(); return true; }
    var s = sec.querySelector('.tc-overlay .tc-scrim.tc-on');   // a sheet or card that is open (not one still fading out)
    if (s) { s.click(); return true; }
    return false;
  };
})(window);
