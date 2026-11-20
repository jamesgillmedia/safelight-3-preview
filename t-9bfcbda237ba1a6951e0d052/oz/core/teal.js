/* oz · the two teals (dev setting, saved on this device). Teal A #55DAA1 is the default (it's used most:
   the red-mode dot, switches, ticks, the active-control glow, Tone Check in oz, the Watch page). Teal B #3EE6B0 is the oz Mark's
   mint star in the 3D view and the oz viewer, and standalone Tone Check. Developer page: dev.html (or add #dev to the address). */
(function () {
  var T = { a: { hex: '#55DAA1', rgb: [85, 218, 161] }, b: { hex: '#3EE6B0', rgb: [62, 230, 176] } }, v = 'a';
  try { v = localStorage.getItem('oz-teal') === 'b' ? 'b' : 'a'; } catch (e) {}
  var t = T[v]; window.OZTEAL = t.rgb.slice(); window.OZTEAL_HEX = t.hex; window.OZTEAL_KEY = v;
  var r = document.documentElement.style; r.setProperty('--mint', t.hex); r.setProperty('--mint-rgb', t.rgb.join(','));
  if (location.hash === '#dev') { var p = location.pathname.split('/apps/')[0]; location.replace(p + '/dev.html'); }
})();
