/* oz-real · decoration for the real aesthetic pass (20 Nov). Looks only: it adds the hairline figure to the
   Moon dial, and marks when the moon is at its home in the sky. No listeners on input, no behaviour, no timing changes. */
(function (G) {
  'use strict';
  var GJ = G.GJ; if (!GJ) return;
  function seat() {
    var el = document.getElementById('moonfree'); if (!el) return false;
    var ring = el.querySelector('.mf-ring');
    if (ring && !ring.querySelector('.oz-fig')) {
      var n = ring.querySelectorAll('.mf-a').length || 7, pts = [];
      for (var i = 0; i < n; i++) { var a = i * 2 * Math.PI / n; pts.push([128 + 96 * Math.sin(a), 128 - 96 * Math.cos(a)]); }
      // a constellation, not a ring: the stars joined in order with one side left open, and one short spur to home
      var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
      var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), path = document.createElementNS(ns, 'path');
      svg.setAttribute('class', 'oz-fig'); svg.setAttribute('viewBox', '0 0 256 256'); svg.setAttribute('aria-hidden', 'true');
      path.setAttribute('d', d); svg.appendChild(path); ring.insertBefore(svg, ring.firstChild);
    }
    return true;
  }
  var t = setInterval(function () { if (seat()) clearInterval(t); }, 200); setTimeout(function () { clearInterval(t); }, 8000);
  setInterval(function () {
    var el = document.getElementById('moonfree'); if (!el || !GJ.moonFree || !GJ.moonFree.pos) return;
    var p = GJ.moonFree.pos(), app = GJ.app || {};
    var h = document.documentElement.classList, over = ['tune', 'mapping', 'messaging', 'circling', 'asking', 'places', 'inroom'].some(function (c) { return h.contains(c); });
    el.classList.toggle('mf-home', p.side === 'sky' && !app.room && !over && !!(GJ.sky && GJ.sky.moonA > .15));
  }, 300);
})(window);
