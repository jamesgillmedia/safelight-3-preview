/* tools-02 · the sunset row (Gill, 17 Nov: "use available data to determine if there are clouds on the horizon and how
   that affects sunset"). Golden Hour's list of times (golden · blue · sun) gets a fourth line, SUNSET: what the cloud will
   do to tonight's sunset on the day being shown — weather.js works it out (sunsetOf), the sky draws it (sky.js: the bank
   on the horizon, the cloud that catches colour), and this line says it in plain words.
   The preview cannot reach a forecast, so its own days know little about the horizon. Tap the line to try a sample
   horizon instead — clear · a cloud bank · high cloud — and tap on through to come back to the forecast. A sample stands
   in for that day's sky, is named SAMPLE where the line says SUNSET, moves the time to where it shows best, and is
   dropped when you leave. */
(function (G) {
  'use strict';
  var GJ = G.GJ; if (!GJ.weather || !GJ.rooms || !GJ.rooms.golden) return;
  var ORDER = [null, 'clear', 'bank', 'colour'], SAY = { clear: 'sample horizon · clear', bank: 'sample horizon · a cloud bank', colour: 'sample horizon · high cloud' }, AT = { clear: -12, bank: -12, colour: 6 };   // minutes from sunset
  var el = document.createElement('span'); el.id = 'gh-set'; el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', 'the sunset: tap to try a sample horizon');
  el.innerHTML = 'sunset<b></b>';
  var br = document.createElement('br'), last = null;
  function reading() { var R = GJ.rooms.golden.wxNow && GJ.rooms.golden.wxNow(); return R && R.sunset; }
  function tick() {
    var inRoom = GJ.app && GJ.app.room === 'golden', list = document.getElementById('gh-list');
    if (!inRoom) { if (GJ.weather.trying()) GJ.weather.trySunset(null); }
    else if (list && list.firstChild) {
      if (el.parentNode !== list) { list.appendChild(br); list.appendChild(el); }   // the room rewrites its list when the day changes: the line goes back on the end
      var s = reading(), t = s ? s.text : '', lab = s && s.sample ? 'sample' : 'sunset';   // a sample says so, where the line's name is
      if (el.firstChild.nodeValue !== lab) el.firstChild.nodeValue = lab;
      if (t !== last) { last = t; el.lastChild.textContent = t; el.style.display = br.style.display = t ? '' : 'none'; }
    }
    setTimeout(tick, 250);
  }
  function next(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    var st = GJ.rooms.golden.state(), k = ORDER[(ORDER.indexOf(GJ.weather.trying()) + 1) % ORDER.length];
    GJ.weather.trySunset(k, st.targetMs);
    if (k && st.events && st.events.sunset != null && st.events.dayStart != null) GJ.rooms.golden.rings()[0].set((st.events.sunset - st.events.dayStart) / 60000 + AT[k]);   // to where it shows
    setTimeout(function () { var r = reading(); if (GJ.sky.setSunset) GJ.sky.setSunset(r || null); }, 60);   // the sky hears it now, not at its next look at the weather
    GJ.haptic.tick(); if (GJ.mark && GJ.mark.say) GJ.mark.say(k ? SAY[k] : 'the forecast again', 1500);
  }
  el.addEventListener('click', next);
  el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') next(e); });
  GJ.sunsetRow = { next: next, text: function () { return last || ''; }, label: function () { return el.firstChild.nodeValue; } };
  tick();
})(window);
