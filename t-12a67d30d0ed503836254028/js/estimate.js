/* tools-02 · lighting-setup estimator, in the timer (Gill, 17 Nov). What you're lighting, how many lights, how many hands,
   and whether the company moves — a rough planning guess, then one tap sets the timer to it. The numbers are a working
   gaffer's rule of thumb, not a promise: a base per kind of setup, minutes per light beyond the usual count, more hands go
   faster (with diminishing returns), a move adds its own time. Rounded to 5 minutes. */
(function (G) {
  'use strict';
  var GJ = G.GJ, $ = function (id) { return document.getElementById(id); };
  var KINDS = [['one', 'one light', 8, 1], ['interview', 'interview', 20, 3], ['three', 'three-point', 18, 3], ['scene', 'scene', 35, 5], ['night', 'night ext.', 50, 6]];
  var MOVES = [['stay', 'same room', 0], ['turn', 'turnaround', 10], ['move', 'company move', 25]];
  var st = { kind: 'interview', lights: 3, crew: 2, move: 'stay' };
  try { var sv = JSON.parse(GJ.settings.getItem('gj-est') || 'null'); if (sv) st = Object.assign(st, sv); } catch (e) {}
  function mins() {
    var k = KINDS.filter(function (x) { return x[0] === st.kind; })[0] || KINDS[1], m = MOVES.filter(function (x) { return x[0] === st.move; })[0] || MOVES[0];
    var work = k[2] + Math.max(0, st.lights - k[3]) * 6 - Math.max(0, k[3] - st.lights) * 3;   // each light past the usual: 6 min; fewer: a little less
    var hands = 2.4 / (st.crew + .4);   // 2 hands = 1×, 1 = 1.7×, 4 = .55×, 6 = .38× — more hands help, less and less
    return Math.max(5, Math.round((work * hands + m[2]) / 5) * 5);
  }
  function paint() {
    $('rm-est').querySelector('[data-k="kind"]').innerHTML = KINDS.map(function (k) { return '<button data-kind="' + k[0] + '"' + (st.kind === k[0] ? ' class="on"' : '') + '>' + k[1] + '</button>'; }).join('');
    $('rm-est').querySelector('[data-k="move"]').innerHTML = MOVES.map(function (k) { return '<button data-move="' + k[0] + '"' + (st.move === k[0] ? ' class="on"' : '') + '>' + k[1] + '</button>'; }).join('');
    $('rm-est').querySelector('[data-v="lights"]').textContent = st.lights; $('rm-est').querySelector('[data-v="crew"]').textContent = st.crew;
    $('rm-est').querySelector('.est-out strong').textContent = 'about ' + mins() + ' min';
    try { GJ.settings.setItem('gj-est', JSON.stringify(st)); } catch (e) {}
  }
  $('rm-est').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.kind) { st.kind = b.dataset.kind; var k = KINDS.filter(function (x) { return x[0] === st.kind; })[0]; st.lights = k[3]; }
    if (b.dataset.move) st.move = b.dataset.move;
    if (b.dataset.n) st[b.dataset.n] = Math.max(1, Math.min(b.dataset.n === 'lights' ? 16 : 8, st[b.dataset.n] + +b.dataset.d));
    if (b.id === 'est-set') { GJ.timer.stop(); GJ.timer.setTo(mins() * 60000); GJ.haptic.commit(); $('rm-est').hidden = true; GJ.dial.redraw(); return; }
    GJ.haptic.tick(); paint();
  });
  $('rm-estb').addEventListener('click', function (e) { e.stopPropagation(); var el = $('rm-est'); el.hidden = !el.hidden; if (!el.hidden) paint(); GJ.haptic.tick(); });
  G.addEventListener('pointerdown', function (e) { var el = $('rm-est'); if (!el.hidden && !e.target.closest('#rm-est, #rm-estb')) el.hidden = true; }, true);
  paint();
  GJ.estimate = { minutes: mins, state: function () { return Object.assign({}, st); }, set: function (o) { Object.assign(st, o); paint(); } };
})(window);
