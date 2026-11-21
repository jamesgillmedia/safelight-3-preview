/* tools-02 · the icon board (Gill, 18 Nov: "a version of that in the app for review … build it on the archive stack").
   The main icon set, on the archive's own engine (js/archive.js: GJ.archiveStack) — the same field, camera, open-a-frame,
   stop-motion rail and review records, given a different index (js/board-data.js) and its own room (#r-icons):
     · an icon is a film; its four lights are its frames: night · red · rose · full red mode. Open one and drag across
       it, or play it, and it steps through its lights.
     · by icon: a · dot phone (primary) · b · rise and d · glow rise (alternates) · c · oz (pulled out). Grouped by light,
       it is the same set the other way round: every icon in one light, side by side.
     · the light (the dot) is the app's red-mode dot: red in night; teal in red mode, rose and Full red mode. Each icon
       carries its own light, so the board is never graded — not in red mode, not in Full red mode.
     · the board reads the app's light: the frame you are on is the icon in the light you are in (night, red, the rose
       tone, Full red mode), and it moves when the light does.
     · review: ♥ / ✕ and a note on any tile, kept in this browser (localStorage gj-icons-review), apart from the archive's.
   On the map: REVIEW · icon board. */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, D = G.GJ_BOARD;
  if (!D || !GJ.archiveStack || !document.getElementById('r-icons')) return;
  var B = GJ.icons = GJ.archiveStack({
    id: 'icons', px: 'ib', title: 'icon board', data: D, beyond: null, rkey: 'gj-icons-review', media: 'media/board/', aspect: 1, label: .5,   // a shorter name row: the tiles come out at home-screen size on a phone
    axes: ['light', 'role', 'form'],
    words: {
      meta: function (d, n) { return d.films.length + ' icons · ' + n + ' tiles · night · red · rose · full red mode · pinch to come close'; },
      axis: function (f, fl) { return f.tc + ' · ' + (f.j + 1) + ' of ' + fl.n + ' · ' + fl.meta; },
      cap: function (f, fl) { return fl.title + ' · ' + f.tc; }
    }
  });
  // the light the app is in: 0 night · 1 red · 2 rose (red mode's rose tone) · 3 Full red mode
  function appLight(s) { if (!s.red) return 0; if (s.fullSafe) return 3; var tn = GJ.TONES && GJ.TONES[s.tone]; return tn && tn.id === 'rose' ? 2 : 1; }
  function follow() {
    var st = B.state(); if (st.open != null) return;
    var f = B.frames[st.focus], n = B.films[f.f].frames.length, k = Math.min(appLight(store.get()), n - 1), i = st.focus - f.j + k;
    if (i !== st.focus) B.focus(i);
  }
  var last = appLight(store.get());
  store.on(function (s) { var k = appLight(s); if (k === last) return; last = k; if (GJ.app && GJ.app.room === 'icons') follow(); });
  var R = GJ.rooms.icons, enter0 = R.enter;
  R.enter = function () { enter0(); last = appLight(store.get()); follow(); };
})(window);
