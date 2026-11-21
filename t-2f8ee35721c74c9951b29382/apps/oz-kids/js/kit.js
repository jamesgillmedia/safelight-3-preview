/* oz kit · grid depth, constellation UI, icons. shared by mini oz + teen oz */
window.OZ = (function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var ICON = { // one 24 grid, 1.25 stroke, round joins
    sleep: '<path d="M14.6 4.6a7.6 7.6 0 1 0 4.8 12.6 6.2 6.2 0 0 1-4.8-12.6z"/>',
    timer: '<circle cx="12" cy="13.4" r="7.1"/><path d="M12 9.6v3.8l2.5 1.5M9.9 3.7h4.2M12 3.7v2.6"/>',
    outside: '<path d="M3.2 16.2h17.6M7.3 16.2a4.7 4.7 0 0 1 9.4 0M12 6.9v2M6.7 9.4l1.3 1.3M17.3 9.4l-1.3 1.3M8.4 19.4h7.2"/>',
    camera: '<path d="M4.4 8.4h3.2l1.5-2.2h5.8l1.5 2.2h3.2v10H4.4z"/><circle cx="12" cy="13" r="3.2"/>',
    circle: '<circle cx="12" cy="6.2" r="1.6"/><circle cx="5.8" cy="17" r="1.6"/><circle cx="18.2" cy="17" r="1.6"/><path d="M11.2 7.6 6.6 15.6M12.8 7.6l4.6 8M7.4 17h9.2"/>',
    messages: '<path d="M5 6h14v9.4h-7.6L7.6 18.6v-3.2H5z"/>',
    ask: '<circle cx="12" cy="12" r="7.6"/><path d="M9.9 9.9a2.2 2.2 0 1 1 3 2c-.6.3-.9.7-.9 1.3v.4M12 16.1v.1"/>',
    around: '<circle cx="12" cy="12" r="7.6"/><path d="M14.6 9.4l-1.6 3.6-3.6 1.6 1.6-3.6z"/>',
    park: '<path d="M12 4.4 7.4 11.4h2.4L6.6 16h10.8l-3.2-4.6h2.4zM12 16v3.6"/>',
    trail: '<path d="M3.6 18.6l5.2-8.2 3.2 4.6 2.4-3.2 5.8 6.8"/><path d="M14.4 6.2h.01" />',
    event: '<path d="M9.4 16.6V6.4l9-2v10.2"/><circle cx="7.4" cy="16.6" r="2"/><circle cx="16.4" cy="14.6" r="2"/>',
    studio: '<path d="M6.4 17.6c1.8 0 3-1 3-2.6s1.2-2.4 2.4-2.4l6.4-6.4-1.8-1.8-6.4 6.4c0 1.2-.8 2.4-2.4 2.4S5 14.4 5 16.2c0 .9.6 1.4 1.4 1.4z"/>',
    skate: '<path d="M4 11.6h16M5.4 11.6c0 1.4.8 2 2 2h9.2c1.2 0 2-.6 2-2"/><circle cx="8.4" cy="16.4" r="1.4"/><circle cx="15.6" cy="16.4" r="1.4"/>',
    plan: '<path d="M6.4 20V4.6M6.4 5h10.4l-2 3.2 2 3.2H6.4"/>',
    make: '<path d="M12 4.2v3.4M12 16.4v3.4M4.2 12h3.4M16.4 12h3.4M6.6 6.6l2.2 2.2M15.2 15.2l2.2 2.2M17.4 6.6l-2.2 2.2M8.8 15.2l-2.2 2.2"/>',
    night: '<path d="M14.6 4.6a7.6 7.6 0 1 0 4.8 12.6 6.2 6.2 0 0 1-4.8-12.6z"/><path d="M5.6 6.4h.01M8.4 3.9h.01"/>',
    voice: '<rect x="9.4" y="4" width="5.2" height="9.6" rx="2.6"/><path d="M6.6 11.4a5.4 5.4 0 0 0 10.8 0M12 16.8v3"/>',
    picture: '<rect x="4.4" y="5.6" width="15.2" height="12.8" rx="1.6"/><circle cx="9.2" cy="10" r="1.3"/><path d="M4.4 16l4.4-3.6 3.2 2.6 2.6-2 5 3.8"/>',
    call: '<path d="M7.6 4.6h2.6l1.3 3.4-1.9 1.3a8 8 0 0 0 5.1 5.1l1.3-1.9 3.4 1.3v2.6a1.4 1.4 0 0 1-1.4 1.4A12.6 12.6 0 0 1 6.2 6a1.4 1.4 0 0 1 1.4-1.4z"/>',
    write: '<path d="M5.6 18.4l.8-3.4 9.4-9.4 2.6 2.6-9.4 9.4z"/>',
    home: '<path d="M4.6 11.2 12 5l7.4 6.2M6.8 9.6v9h10.4v-9"/>',
    you: '<circle cx="12" cy="12" r="2"/>',
    star: '<path d="M12 4.6v14.8M4.6 12h14.8M7 7l10 10M17 7 7 17"/>',
    lock: '<rect x="6" y="10.6" width="12" height="8.6" rx="1.4"/><path d="M8.6 10.6V8.2a3.4 3.4 0 0 1 6.8 0v2.4"/>'
  };
  function ic(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[k] || ICON.star) + '</svg>'; }
  function ink() { return document.documentElement.classList.contains('red') ? '92,88,82' : '232,228,220'; }

  /* depth by forced perspective: four walls of an even dot grid seen down their length */
  var D = { px: 0, py: 0, vp: [.5, .36] };
  function grid(cv) {
    var W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    var k = ink(), vx = D.vp[0] * W, vy = D.vp[1] * H, g = 30, cx = D.px * 16, cy = D.py * 12, A = W * .5, B = H * .5;
    var gr = x.createRadialGradient(vx, vy, 0, vx, vy, W * .62); gr.addColorStop(0, 'rgba(' + k + ',.05)'); gr.addColorStop(1, 'rgba(' + k + ',0)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    function dot(X, Y, z) { var sx = vx + (X - cx) / z, sy = vy + (Y - cy) / z; if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) return;
      var a = Math.min(.42, .34 / Math.pow(z, 1.1)) * (1 - Math.min(1, (z - 1) / 7.6)), r = Math.max(.4, 1.15 / Math.pow(z, .75));
      x.fillStyle = 'rgba(' + k + ',' + a.toFixed(3) + ')'; x.beginPath(); x.arc(sx, sy, r, 0, 6.283); x.fill(); }
    for (var z = 1; z < 8.6; z *= 1.075) {
      for (var u = -A; u <= A + .1; u += g) { dot(u, B * 1.02, z); dot(u, -B * 1.02, z); }
      for (var v = -B + g; v < B; v += g) { dot(-A * 1.02, v, z); dot(A * 1.02, v, z); }
    }
  }
  // slow drift (same with reduce motion: Gill wants it to move the same)
  function drift(cv) { (function f() { var t = performance.now() / 1000; D.px = Math.sin(t / 7) * .35; D.py = Math.cos(t / 9) * .25; grid(cv); setTimeout(f, 120); })(); }

  /* constellation: items {id,label,sub,x,y,z,icon,cur} in 0..1 of host; lines [[i,j]] ; rings for distance */
  function con(host, items, lines, onTap, opt) {
    opt = opt || {}; var W = host.clientWidth, H = host.clientHeight, P = items.map(function (s) { return [s.x * W, s.y * H]; });
    var s = '<svg class="sl" aria-hidden="true">';
    (opt.rings || []).forEach(function (r) { s += '<circle class="rng" cx="' + r[0] * W + '" cy="' + r[1] * H + '" r="' + r[2] + '"/>'; });
    (lines || []).forEach(function (l) { var a = P[l[0]], b = P[l[1]], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, gp = opt.gap || 30;
      var z = Math.min(items[l[0]].z || 1, items[l[1]].z || 1);
      s += '<line style="opacity:' + (.3 * z).toFixed(2) + '" x1="' + (a[0] + dx / d * gp).toFixed(1) + '" y1="' + (a[1] + dy / d * gp).toFixed(1) + '" x2="' + (b[0] - dx / d * gp).toFixed(1) + '" y2="' + (b[1] - dy / d * gp).toFixed(1) + '"/>'; });
    host.innerHTML = s + '</svg>';
    items.forEach(function (it, i) {
      var b = document.createElement('button'); b.className = 'cs' + (it.cur ? ' cur' : '') + (it.dim ? ' dim' : ''); b.dataset.id = it.id;
      b.style.left = P[i][0] + 'px'; b.style.top = P[i][1] + 'px'; b.style.setProperty('--z', it.z == null ? 1 : it.z);
      b.setAttribute('aria-label', it.label + (it.sub ? ', ' + it.sub : ''));
      b.innerHTML = '<span class="rg"><b>' + (it.icon === 'dot' ? '<i></i>' : ic(it.icon || it.id)) + '</b></span><span></span>' + (it.sub ? '<em></em>' : '');
      b.children[1].textContent = it.label; if (it.sub) b.children[2].textContent = it.sub;
      b.addEventListener('click', function (e) { e.stopPropagation(); try { navigator.vibrate && navigator.vibrate(6); } catch (x) {} onTap(it.id, b); });
      host.appendChild(b);
    });
  }
  /* dotted ring (60 dots), lit = remaining */
  function dring(frac) { var s = '<svg viewBox="-125 -125 250 250">'; for (var i = 0; i < 60; i++) { var a = -Math.PI / 2 + i / 60 * Math.PI * 2; s += '<circle r="' + (i % 5 ? 1.6 : 2.4) + '" cx="' + (Math.cos(a) * 112).toFixed(1) + '" cy="' + (Math.sin(a) * 112).toFixed(1) + '"' + (i / 60 < frac ? ' class="lit"' : '') + '/>'; } return s + '</svg>'; }
  function dset(svg, frac) { var c = svg.querySelectorAll('circle'); for (var i = 0; i < c.length; i++) c[i].classList.toggle('lit', i / c.length < frac); }
  function toast(t) { var n = $('#toast'); n.textContent = t; n.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { n.classList.remove('on'); }, 2600); }
  function clock() { var d = new Date(); return { t: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/, ''), d: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toLowerCase().replace(',', ''), h: d.getHours() }; }
  var OZC = '<svg viewBox="-46 -40 92 80" aria-hidden="true"><path d="M-30 18 L-14 -8 L0 -24 L14 -8 L30 18"/><circle cx="-30" cy="18" r="3.4"/><circle cx="-14" cy="-8" r="3.4"/><circle cx="0" cy="-24" r="4.4"/><circle cx="14" cy="-8" r="3.4"/><circle cx="30" cy="18" r="3.4"/></svg>';
  return { $: $, ic: ic, grid: grid, drift: drift, D: D, con: con, dring: dring, dset: dset, toast: toast, clock: clock, OZC: OZC, ink: ink };
})();
