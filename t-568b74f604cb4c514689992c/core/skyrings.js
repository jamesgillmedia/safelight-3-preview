/* tools-02 · the sky rings (atmosphere, stars, ambience) that the master dial, the Moon dial and Tune turn, and GJ.Sun.
   oz 3 alt: split out of rooms.js unchanged, so every app on the oz core has them. No behaviour change. */
(function (G) {
  'use strict';
  var GJ = G.GJ, sky = GJ.sky, store = GJ.store, timer = GJ.timer, clamp = GJ.clamp;
  var $ = function (id) { return document.getElementById(id); };
  var rooms = GJ.rooms = GJ.rooms || {};

  /* ======================= sky rings (Tune lives in the dial) ======================= */
  GJ.skyRings = {
    atmos: {
      key: 'atmos', label: 'ATMOSPHERE', min: 0, max: 1, def: 1, span: 220, unit: .1,
      get: function () { return store.get().atmos; },
      set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().atmos) store.set({ atmos: v }); },
      fmt: function (v) { return v < .02 ? 'still' : Math.round(v * 100) + '%'; }
    },
    density: {
      key: 'density', label: 'STARS', min: .3, max: 1, def: 1, span: 220, unit: .1,
      get: function () { return store.get().density; },
      set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().density) store.set({ density: v }); },
      fmt: function (v) { return Math.round(v * 100) + '%'; }
    },
    ambience: {
      key: 'ambience', label: 'AMBIENCE', min: 0, max: 1, def: .5, span: 220, unit: .1,
      get: function () { return store.get().ambience; },
      set: function (v) { v = Math.round(v * 100) / 100; if (v !== store.get().ambience) store.set({ ambience: v }); },
      fmt: function (v) { return v < .34 ? 'quiet' : v > .66 ? 'bright' : 'mid'; }
    }
  };

  GJ.Sun = G.GJSun;
})(this);
