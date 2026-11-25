/* Archive eyepiece: only the outer silhouette. Mask is the room colour, so it is invisible at rest; the hairline edge shows while moving. */
(function (w) {
  function layout() {
    var eye = document.getElementById('eye');
    var mask = document.getElementById('eyeMask');
    var line = document.getElementById('eyeLine');
    if (!eye || !mask || !line) return;
    var wdt = innerWidth, hgt = innerHeight;
    eye.setAttribute('viewBox', '0 0 ' + wdt + ' ' + hgt);
    eye.setAttribute('width', wdt);
    eye.setAttribute('height', hgt);
    var m = Math.min(wdt, hgt);
    var insetX = Math.max(10, wdt * 0.03);
    var insetY = Math.max(10, hgt * 0.04);
    var rx = Math.max(24, m * 0.06);
    var x = insetX, y = insetY, ww = wdt - insetX * 2, hh = hgt - insetY * 2;
    function rrect(x, y, ww, hh, r) {
      r = Math.min(r, ww / 2, hh / 2);
      return 'M' + (x + r) + ' ' + y +
        'H' + (x + ww - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + ww) + ' ' + (y + r) +
        'V' + (y + hh - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + ww - r) + ' ' + (y + hh) +
        'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + hh - r) +
        'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';
    }
    var hole = rrect(x, y, ww, hh, rx);
    var outer = 'M0 0H' + wdt + 'V' + hgt + 'H0Z';
    mask.setAttribute('d', outer + hole);
    line.setAttribute('d', hole);
  }
  var hideT = null;
  function setMoving(on) {
    var line = document.getElementById('eyeLine');
    if (!line) return;
    if (on) {
      line.style.opacity = '1';
      if (hideT) clearTimeout(hideT);
      hideT = setTimeout(function () { line.style.opacity = '0'; }, 180);
    }
  }
  addEventListener('resize', layout);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', layout);
  else layout();
  w.GJ_EYE = { layout: layout, setMoving: setMoving };
})(window);
