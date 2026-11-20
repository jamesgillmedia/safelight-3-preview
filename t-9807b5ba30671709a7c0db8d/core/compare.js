/* oz core · the dial setup Gill chose on 20 Nov: "After".
   The camera dial is version A on the right edge in every room (a tap unfolds the 3D constellation, a drag orbits it and
   it springs back, a slide turns the value, the sky stays still), and the Moon dial is separate and moves freely
   (js/moonfree.js) with its own shortcuts. The Before | After pill is gone; this file only answers 'after' so the code
   that asks still works. Brief item 2 folds these checks away for good. Never touches a photograph. */
(function (G) {
  'use strict';
  document.documentElement.classList.add('v-after');
  G.GJ_COMPARE = { v: function () { return 'after'; }, set: function () {}, on: function () {} };
})(window);
