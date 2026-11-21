/* bubble round, item 2 · the dock's icons, in the house style: dotted star lines on the dark, a fine dotted line with
   tiny glowing star points at the joints, one weight, no fills, no text, no mint. Each one follows the light: night,
   red mode, rose, light, and Full red as red luminance steps. Notes and Timer start from the pack's own marks (the three
   notes lines; the timer constellation); the rest are drawn to the same hand.
   OZ_DOCK_ICONS.svg(name, mode, size) → an <svg> string · .names · .modes · .label(name) */
(function (G) {
  'use strict';
  var MODES = ['night', 'red', 'rose', 'light', 'fullred'];
  var INK = {   // line dots · star core · star halo
    night: ['rgb(155,157,161)', '#ffffff', 'rgb(235,238,245)'],
    red: ['rgb(190,52,60)', 'rgb(255,104,108)', 'rgb(255,68,87)'],
    rose: ['rgb(212,150,160)', 'rgb(255,218,224)', 'rgb(255,176,184)'],
    light: ['rgb(122,92,94)', 'rgb(58,40,42)', 'rgb(176,122,58)'],
    fullred: ['#8A3A42', '#F0B4B4', '#E1626B']
  };
  function arc(cx, cy, r, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
  function T(x, y) { return [(x - 500) * .92 + 300, (y - 512) * .92 + 300]; }   // the pack's timer constellation, brought into this frame
  /* each icon: lines (polylines of points) and stars ([x, y, big]) in a 600 × 600 field */
  var ICONS = {
    notes: { label: 'Notes', lines: [[[60, 120], [540, 102]], [[60, 300], [420, 282]], [[60, 492], [300, 492]]], stars: [[60, 120, 1], [540, 102, 1], [60, 300, 1], [420, 282, 1], [60, 492, 1], [300, 492, 1]] },
    chat: { label: 'Chat', lines: [[[96, 142], [500, 126], [512, 392], [262, 402], [150, 500], [178, 404], [104, 404], [96, 142]]], stars: [[96, 142, 1], [500, 126, 0], [512, 392, 1], [150, 500, 1], [104, 404, 0]] },
    ask: { label: 'Ask', lines: [arc(250, 250, 158, -150, 200, 40), [[372, 372], [528, 528]]], stars: [[250, 92, 0], [528, 528, 1], [113, 329, 0], [372, 372, 0]] },
    weather: { label: 'Good Weather', lines: [[[52, 430], [548, 430]], arc(300, 430, 168, 180, 360, 36)], stars: [[300, 262, 1], [132, 430, 0], [468, 430, 0], [52, 430, 0], [548, 430, 0], [182, 311, 0]] },
    timer: { label: 'Timer', lines: [[T(512, 271), T(317, 397), T(294, 604), T(489, 753), T(707, 627)], [T(501, 512), T(512, 271)], [T(501, 512), T(615, 581)]], stars: [T(512, 271).concat(1), T(317, 397).concat(0), T(294, 604).concat(0), T(489, 753).concat(1), T(707, 627).concat(0), T(501, 512).concat(0), T(615, 581).concat(1)] },
    browser: { label: 'Browser', lines: [[[130, 170], [440, 128], [312, 360]], [[200, 470], [430, 470]], [[200, 540], [360, 540]]], stars: [[130, 170, 1], [440, 128, 0], [312, 360, 1], [200, 470, 0], [430, 470, 0], [200, 540, 0], [360, 540, 0]] },
    circle: { label: 'Circle', lines: [arc(300, 300, 214, -60, 250, 44)], stars: [[300, 300, 1], [407, 115, 0], [514, 300, 0], [300, 514, 1], [125, 423, 0], [114, 193, 0]] },
    camera: { label: 'Camera', lines: [[[84, 196], [210, 196], [246, 140], [356, 140], [392, 196], [516, 196], [516, 470], [84, 470], [84, 196]], arc(300, 330, 96, -90, 268, 30)], stars: [[84, 196, 0], [516, 470, 0], [246, 140, 0], [356, 140, 0], [300, 234, 1], [452, 248, 1]] },
    archive: { label: 'Archive', lines: [[[92, 160], [508, 160], [508, 440], [92, 440], [92, 160]], [[92, 500], [508, 500]]], stars: [[92, 160, 1], [508, 160, 0], [508, 440, 1], [92, 440, 0], [92, 500, 0], [508, 500, 0], [300, 300, 0]] },
    map: { label: 'Map', lines: [[[96, 470], [210, 200], [300, 360], [462, 120]], [[300, 360], [520, 430]]], stars: [[96, 470, 0], [210, 200, 1], [300, 360, 1], [462, 120, 0], [520, 430, 0]] }
  };
  var uid = 0;
  function svg(name, mode, size) {
    var I = ICONS[name]; if (!I) return ''; var c = INK[mode] || INK.night, id = 'dk' + (++uid), h = '';
    I.lines.forEach(function (pl) {   // dots every 25 along the whole path, corners and curves alike
      var total = 0, seg = []; for (var k = 0; k < pl.length - 1; k++) { var L = Math.hypot(pl[k + 1][0] - pl[k][0], pl[k + 1][1] - pl[k][1]); seg.push(L); total += L; }
      var n = Math.max(2, Math.round(total / 25)), step = total / n;
      for (var i = 1; i < n; i++) { var d = i * step, j = 0; while (j < seg.length - 1 && d > seg[j]) { d -= seg[j]; j++; } var u = seg[j] ? d / seg[j] : 0, a = pl[j], q = pl[j + 1];
        h += '<circle cx="' + (a[0] + (q[0] - a[0]) * u).toFixed(1) + '" cy="' + (a[1] + (q[1] - a[1]) * u).toFixed(1) + '" r="5.2" fill="' + c[0] + '"/>'; } });
    I.stars.forEach(function (s) { var r = s[2] ? 9.5 : 7; h += '<circle cx="' + s[0].toFixed(1) + '" cy="' + s[1].toFixed(1) + '" r="' + (r * 2.1).toFixed(1) + '" fill="' + c[2] + '" opacity=".5" filter="url(#' + id + ')"/><circle cx="' + s[0].toFixed(1) + '" cy="' + s[1].toFixed(1) + '" r="' + r + '" fill="' + c[1] + '"/>'; });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -70 740 740"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' aria-hidden="true"><defs><filter id="' + id + '" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur stdDeviation="11"/></filter></defs>' + h + '</svg>';
  }
  G.OZ_DOCK_ICONS = { svg: svg, names: Object.keys(ICONS), modes: MODES.slice(), label: function (n) { return ICONS[n] ? ICONS[n].label : n; } };
  if (typeof module !== 'undefined') module.exports = G.OZ_DOCK_ICONS;
})(typeof window !== 'undefined' ? window : globalThis);
