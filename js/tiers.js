/* tools-02 · Tune sorted by tier (briefs/CONTROLS.md; Gill, 18 Nov: batch four).
   Tune was one long list. The Controls brief names three kinds of setting, and one rule to tell them apart:
     · yours     — changes how one person experiences their own session (red mode, strength of motion and atmosphere,
                    sound, the clock, the city, what a reading shows). This phone only.
     · artist    — changes how the app feels as the artist's work (the sky's design, the character of a move, what may
                    happen to a photograph). The owner's; in the app proper these sit behind the unlock.
     · developer — changes how it works under the hood, or is an experiment still being tried.
   This file only re-orders what is already in the drawer — every row is the same row, doing what it did — under three
   headings, with ALL · YOURS · ARTIST · DEVELOPER at the top to look at one tier at a time (it opens on ALL).
   A row no one has placed is "yours". Nothing is locked yet: the unlock is the Access brief's, not built. */
(function (G) {
  'use strict';
  var tune = document.getElementById('tune'); if (!tune) return;
  var ARTIST = ['photored', 'density', 'fog', 'moon', 'reflect', 'ripples', 'hub', 'byease', 'bymove', 'oztune'], DEV = ['dialrest'];
  var NAMES = { user: ['yours', 'this phone, this session — nothing here changes the work'], artist: ['artist', 'the character of the work — the owner\'s; behind the unlock in the app proper'], dev: ['developer', 'under the hood, and experiments still being tried — not in a public build'] };
  function tierOf(node) { var b = node.querySelector && node.querySelector('[data-t]'), t = b ? b.dataset.t : ''; if (node.id === 'tn-rev') return 'dev'; return ARTIST.indexOf(t) >= 0 ? 'artist' : DEV.indexOf(t) >= 0 ? 'dev' : 'user'; }
  var secs = [], cur = null, lead = [];
  var rev = document.getElementById('tn-rev');
  [].slice.call(tune.children).forEach(function (c) { if (c === rev) return; if (c.tagName === 'H3') { cur = { h: c, items: [] }; secs.push(cur); } else if (cur) cur.items.push(c); else lead.push(c); });
  var pick = document.createElement('div'); pick.className = 'tn-pick'; pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', 'which settings to show');
  pick.innerHTML = '<button data-tier="all" class="on" aria-pressed="true">all</button><button data-tier="user" aria-pressed="false">yours</button><button data-tier="artist" aria-pressed="false">artist</button><button data-tier="dev" aria-pressed="false">developer</button>';
  tune.appendChild(pick); var count = {};
  ['user', 'artist', 'dev'].forEach(function (T) {
    var box = document.createElement('div'); box.className = 'tn-tier'; box.dataset.tier = T; var hd = document.createElement('h2'); hd.className = 'jul'; hd.textContent = NAMES[T][0]; var sub = document.createElement('p'); sub.className = 'tn-sub'; sub.textContent = NAMES[T][1]; box.appendChild(hd); box.appendChild(sub); count[T] = 0;
    secs.forEach(function (s) {
      var mine = s.items.filter(function (it) { return tierOf(it) === T; }); if (!mine.length) return;
      var h = s.used ? s.h.cloneNode(true) : s.h; s.used = true; box.appendChild(h); mine.forEach(function (it) { box.appendChild(it); if (it.classList.contains('row')) count[T]++; });
    });
    if (T === 'dev' && rev) { var bh = document.createElement('h3'); bh.className = 'jul'; bh.textContent = 'Build'; box.appendChild(bh); box.appendChild(rev); }   // the build's own number
    tune.appendChild(box);
  });
  pick.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); show(b.dataset.tier); });
  function show(t) { tune.dataset.show = t; [].forEach.call(pick.children, function (b) { var on = b.dataset.tier === t; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); tune.scrollTop = 0; }
  show('all');
  G.GJ.tiers = { show: show, of: function (t) { var b = tune.querySelector('[data-t="' + t + '"]'), box = b && b.closest('.tn-tier'); return box ? box.dataset.tier : null; }, count: function () { return count; }, shown: function () { return tune.dataset.show; } };
})(window);
