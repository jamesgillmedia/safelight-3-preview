/* oz 80s mode · the rooms Gill marked (23 Nov 2026). Each is a little machine while the mode is on, and itself again
   when it is off. Everything here is chrome over the rooms' own work: nothing is rewritten, nothing is tinted.
     Phone ........ on a call, the rotary turns once and CONNECTING… types in green, then holds
     Sound ........ the cassette player: reels turn while it plays, the needle leans and settles, the orange button
     Good Weather . a pixel sun with scanlines; the forecast types out once, teletype-style, then holds
     Clock ........ the room bar's small time as segmented LED
     Camera ....... a viewfinder, a REC dot that comes on once, a date stamp
     Notes ........ a 1-bit window and a blinking cursor; the page stays still
     Messages ..... a pager screen: one pip, then rest
     Timer ........ flip numbers, ticking calmly
     the dock ..... living icons, through the oz viewer hook */
(function (G) {
  'use strict';
  var Z = G.OZ80, html = document.documentElement; if (!Z) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function on() { return Z.on(); }

  /* the dock: living icons */
  function dock() { var d = document.getElementById('dock'); if (d) Z.mount(d, 'button[data-app]', function (b) { return b.dataset.app; }); else setTimeout(dock, 600); }
  dock();

  /* the room bar's clock */
  function barClock() {
    var t = document.getElementById('ozbar-time'); if (!t) return;
    var c = t.querySelector('.e80clock'); if (!on()) { if (c) c.remove(); return; }
    var txt = (t.firstChild && t.firstChild.nodeType === 3 ? t.firstChild.nodeValue : t.textContent).trim().replace(/[^0-9:]/g, '');
    if (!c) { c = document.createElement('span'); c.className = 'e80clock'; c.setAttribute('aria-hidden', 'true'); t.appendChild(c); }
    if (c.dataset.t !== txt) { c.dataset.t = txt; c.innerHTML = Z.seg(txt); }
  }

  /* Phone */
  var rot = '<svg class="dial" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/><g>' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { var a = (i * 30 - 60) * Math.PI / 180; return '<circle cx="' + (16 + 8.6 * Math.cos(a)).toFixed(1) + '" cy="' + (16 + 8.6 * Math.sin(a)).toFixed(1) + '" r="2.1" fill="none" stroke="currentColor" stroke-width="1.2"/>'; }).join('') +
    '</g><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>';
  // the handset, upright, with its coiled cord
  var HS = '<svg class="hs" viewBox="0 0 110 150" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M40 14h42a12 12 0 0 1 12 12v8a12 12 0 0 1-12 12H72v58h10a12 12 0 0 1 12 12v8a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12v-8a12 12 0 0 1 12-12h10V46H40a12 12 0 0 1-12-12v-8a12 12 0 0 1 12-12z"/>' +
    '<path d="M26 24c-14 6-16 22-12 40s2 36-4 52" stroke-width="2.6"/></svg>';
  document.addEventListener('click', function (e) {
    if (!on() || !e.target.closest) return; var b = e.target.closest('#phone .ph-call, #phone .ph-go'); if (!b) return;
    var ph = document.getElementById('phone'), o = ph.querySelector('.e80-call'); if (o) o.remove();
    o = document.createElement('div'); o.className = 'e80-call'; o.setAttribute('role', 'status'); o.innerHTML = HS + '<div class="ring"><i></i>' + rot + '</div><span></span>'; ph.appendChild(o);
    o.addEventListener('click', function () { o.remove(); });   // a tap puts the call screen away
    var T = 'CONNECTING…', k = 0, sp = o.querySelector('span');
    setTimeout(function type() { if (!o.isConnected) return; sp.textContent = T.slice(0, ++k); if (k < T.length) setTimeout(type, 90); }, 900);   // after the rotary has turned
    setTimeout(function () { if (o.isConnected) o.remove(); }, 9000);
  }, true);

  /* Sound: the cassette player — blue and silver, a tape window with two reels, the orange button, a VU needle */
  function reel(cx, k) { return '<g class="reel ' + k + '"><circle cx="' + cx + '" cy="58" r="21" fill="#08100c" stroke="#3ef0ff" stroke-width="2.4"/>' + [0, 120, 240].map(function (a) { var r = a * Math.PI / 180; return '<line x1="' + cx + '" y1="58" x2="' + (cx + 17 * Math.sin(r)).toFixed(1) + '" y2="' + (58 - 17 * Math.cos(r)).toFixed(1) + '" stroke="#3ef0ff" stroke-width="2"/>'; }).join('') + '<circle cx="' + cx + '" cy="58" r="3" fill="#3ef0ff"/></g>'; }
  var CAS = '<svg viewBox="0 0 270 136" aria-hidden="true"><defs><linearGradient id="e80cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8d0d8"/><stop offset=".45" stop-color="#8aa0c4"/><stop offset="1" stop-color="#3a5a9a"/></linearGradient></defs>' +
    '<rect x="2" y="2" width="266" height="132" rx="10" fill="url(#e80cb)" stroke="#e8ecf0" stroke-width="2"/>' +
    '<rect x="16" y="16" width="238" height="84" rx="4" fill="#050a08" stroke="#1c2a24" stroke-width="2"/>' + reel(78, 'r1') + reel(192, 'r2') +
    '<rect x="16" y="108" width="34" height="20" rx="2" fill="#f46b1b" stroke="#9a3c08" stroke-width="1.5"/>' +
    '<rect x="60" y="108" width="194" height="20" rx="2" fill="#050a08"/><line class="needle" x1="168" y1="118" x2="168" y2="110" stroke="#f46b1b" stroke-width="2.4" stroke-linecap="round"/></svg>';
  function cassette() {
    var r = document.getElementById('r-player'); if (!r) return; var w = r.querySelector('.e80-walk');
    if (!on()) { if (w) w.remove(); return; }
    var fl = Z.flavour(); if (w && w.dataset.fl === fl) return; if (w) w.remove();
    w = document.createElement('div'); w.className = 'e80-walk'; w.dataset.fl = fl; w.setAttribute('aria-hidden', 'true'); w.innerHTML = CAS; r.appendChild(w);
  }

  /* Good Weather: the pixel sun and the forecast, typed once */
  var gwDone = '', typing = false;
  function weather(force) {
    var g = document.getElementById('gw'); if (!g) return; var gl = g.querySelector('.gw-glance');
    if (!on()) { Array.prototype.forEach.call(g.querySelectorAll('.e80-sun'), function (x) { x.remove(); }); return; }
    if (!gl) return;
    if (!gl.querySelector('.e80-sun')) { var s = document.createElement('i'); s.className = 'e80-sun'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = Z.icon('good-weather'); gl.insertBefore(s, gl.firstChild); var sv = s.querySelector('svg'); if (sv && G.ozViewer) G.ozViewer.present('good-weather', sv); }
    if (typing) return;
    var lines = Array.prototype.slice.call(gl.querySelectorAll('p, small')).filter(function (x) { return x.textContent.trim(); }), key = lines.map(function (x) { return x.getAttribute('aria-label') || x.textContent; }).join('|');
    if (!force && key === gwDone) return; gwDone = key;
    var full = lines.map(function (x) { return x.textContent; }); lines.forEach(function (x) { x.textContent = ''; x.setAttribute('aria-label', full[lines.indexOf(x)]); });
    var li = 0, k = 0; typing = true;
    (function tty() {   // teletype, once, then hold
      if (li >= lines.length || !lines[0].isConnected) { typing = false; lines.forEach(function (x) { x.classList.remove('e80-typing'); }); return; }
      var x = lines[li]; x.classList.add('e80-typing'); x.textContent = full[li].slice(0, ++k);
      if (k >= full[li].length) { x.classList.remove('e80-typing'); li++; k = 0; setTimeout(tty, 160); } else setTimeout(tty, 22);
    })();
  }

  /* Camera: the viewfinder */
  var vf = null;
  function viewfinder() {
    if (!vf) { vf = document.createElement('div'); vf.className = 'e80-vf'; vf.setAttribute('aria-hidden', 'true'); document.body.appendChild(vf); }
    var d = new Date(), M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()];
    vf.innerHTML = '<i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><b>REC</b><em>' + M + ' ' + d.getDate() + ' ' + d.getFullYear() + '</em>';   // re-made each time: the REC dot comes on once
  }

  /* Notes: the cursor */
  function notes() {
    var n = document.getElementById('notes'); if (!n) return; var w = n.querySelector('.nt-when');
    var c = n.querySelector('.e80-cur'); if (!on()) { if (c) c.remove(); return; }
    if (w && !c) { c = document.createElement('i'); c.className = 'e80-cur'; c.setAttribute('aria-hidden', 'true'); w.parentNode.insertBefore(c, w.nextSibling); }
  }

  /* Messages: the pager, one pip */
  function pager() {
    var m = document.getElementById('msg'); if (!m) return; var p = m.querySelector('.e80-pager'); if (p) p.remove();
    if (!on()) return; p = document.createElement('div'); p.className = 'e80-pager'; p.setAttribute('aria-hidden', 'true'); p.innerHTML = '<i></i><span>PAGE</span>'; m.appendChild(p);
  }

  /* Timer: flip numbers */
  function flips() {
    var r = document.getElementById('r-red'), t = document.getElementById('rm-tap'); if (!r || !t) return; var f = r.querySelector('.e80-flip');
    if (!on()) { if (f) f.remove(); return; }
    var host = document.getElementById('rm-time'); if (!f) { f = document.createElement('div'); f.className = 'e80-flip'; f.setAttribute('aria-hidden', 'true'); (host || r).appendChild(f); if (host && getComputedStyle(host).position === 'static') host.style.position = 'relative'; }
    var s = t.textContent.trim(), old = f.dataset.t || '';
    if (s === old) return; f.dataset.t = s;
    f.innerHTML = s.split('').map(function (ch, i) { return ch === ':' ? '<span class="cl">:</span>' : '<b' + (old && old[i] !== ch ? ' class="turn"' : '') + '>' + ch + '</b>'; }).join('');
  }

  function all() { barClock(); cassette(); notes(); flips(); if (html.classList.contains('gw-on')) weather(); }
  Z.change(function () { all(); if (on() && html.classList.contains('camming')) viewfinder(); pager(); });
  var was = '';
  try { new MutationObserver(function () {
    var c = html.className; if (c === was) return; var prev = ' ' + was + ' '; was = c;
    if (!on()) return;
    if (/\bcamming\b/.test(c) && prev.indexOf(' camming ') < 0) viewfinder();
    if (/\bmessaging\b/.test(c) && prev.indexOf(' messaging ') < 0) pager();
    if (/\bgw-on\b/.test(c) && prev.indexOf(' gw-on ') < 0) setTimeout(function () { weather(true); }, 260);
    if (/\bfh-in\b/.test(c) && prev.indexOf(' fh-in ') < 0 && Z.flavour() === 'neon') Z.flick();
  }).observe(html, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
  setInterval(function () { if (on()) all(); }, 1000);
  setTimeout(all, 800);
})(window);
