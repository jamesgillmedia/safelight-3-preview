/* oz core · Tune, the master tuner: one screen, in groups (Gill, 19 Nov 2:19 / 2:22).
   Before: three tiers (yours · artist · developer) with a picker. Now ONE screen, every setting on it, in visible groups,
   the most used first, never more than one level deep:
     Red mode · Dials · Moon dial · Motion · Gestures · Look · Weather · Tools · Developer
   A row goes to its group by its key (GROUP_OF below), or else by the heading it was written under (BY_HEADING); inside a
   group the old headings stay as small sub-headings, so a long group still reads in parts.
   Each setting has a visibility class:
     public ...... anyone, in any build
     owner ....... the owner's only (the character of the work, and the developer switches): only in the owner's builds
     secret ...... a trade secret: its name is only in the private core file (core/private), never in the public code
   A public build (no core/private) shows only public settings: owner and secret rows are taken out of the page before
   anything is built from them (and mkpreview-alt.sh strips them from the published HTML as well).
   This file only places rows; core/tunehub.js (after tunekit) adds search, reset, pins, presets and Save to core.
     GJ.tiers.of(k) → the old tier ('user' · 'artist' · 'dev'), kept for the record · GJ.tiers.group(k) · GJ.tiers.vis(k) */
(function (G) {
  'use strict';
  var GJ = G.GJ, tune = document.getElementById('tune'); if (!tune) return;
  var ARTIST = ['photored', 'hub', 'byease', 'bymove', 'oztune'], DEV = ['dialrest', 'dialtapsheet', 'markmore', 'contaps', 'moonslide'];
  var GROUPS = [
    ['red', 'Red mode', 'red mode, day mode, and the safelight tuning'],
    ['dials', 'Dials', 'how every dial turns, snaps and looks'],
    ['moon', 'Moon dial', 'separate, and moves freely · its own shortcuts'],
    ['motion', 'Motion', 'how much moves, and how'],
    ['gestures', 'Gestures', 'what a finger does'],
    ['look', 'Look', 'the sky, its stars, fog and water'],
    ['weather', 'Weather', 'the sky outside, the clock and the city'],
    ['tools', 'Tools', 'every room and tool, one tap away'],
    ['developer', 'Developer', 'under the hood: presets, Save to core, the build']
  ];
  var GROUP_OF = {
    red: 'red', openred: 'red', daymode: 'red', redlight: 'red', tone: 'red', fullsafe: 'red', photored: 'red', stop: 'red', alert: 'red',
    dialrest: 'dials', dialtapsheet: 'developer',
    fingerdial: 'developer', ghdials: 'weather', goodweather: 'weather', mztyping: 'tools', mzread: 'tools', mzenter: 'tools', mzskin: 'tools', mztone: 'tools', mzdis: 'tools', ozthink: 'tools', circle: 'tools', feed: 'tools', feedon: 'tools', iconboard: 'tools', mnflip: 'moon', mnmirror: 'moon', mnspark: 'moon', moondial: 'developer', 'dkst-crescent': 'developer', mnsize: 'developer', mnrest: 'developer', mndelay: 'dials', mnlock: 'developer', mnhap: 'developer', moonlist: 'developer', moonslide: 'developer',
    browser: 'tools', brunclear: 'tools', brview: 'tools', brhaptic: 'tools', brauto: 'tools', brforget: 'tools',
    depthon: 'look', depthdial: 'look', palfam: 'look', beyond: 'look', palpad: 'look', dialbank: 'dials', palhere: 'look', palnear: 'look', palmid: 'look', palfar: 'look', palwarm: 'look', pallight: 'look', chatteal: 'developer',
    lean: 'moon', leanring: 'moon', leanallow: 'moon', focusring: 'moon', focusdepth: 'moon', ozmi: 'tools', milayout: 'tools', midensity: 'tools', essentials: 'tools', ozwalk: 'tools', ozcs: 'tools', ozlog: 'tools', ozscan: 'tools', ozmake: 'tools', ozadd: 'tools', ozrelay: 'tools', loved: 'tools', lovedex: 'tools',
    reduce: 'motion', tilt: 'motion', bydrift: 'motion', byease: 'motion', bymove: 'motion', bydepth: 'motion',
    markmore: 'gestures', contaps: 'gestures', mark: 'gestures',
    envdial: 'look', envwindlive: 'look', envwind: 'look', envgrain: 'look', envsize: 'look', envglow: 'look', envline: 'look', envrip: 'look', envswell: 'look', envmotes: 'look', envbloom: 'look', envvig: 'look', iconflip: 'look', iconmirror: 'look',
    density: 'look', ambience: 'look', fog: 'look', moon: 'look', reflect: 'look', ripples: 'look', hub: 'look', byread: 'look', oztune: 'look',
    wxlive: 'weather', clock: 'weather', city: 'weather', now: 'weather', sunup: 'weather'
  };
  var BY_HEADING = { 'Browser': 'tools', 'Depth palette': 'look', 'Essentials': 'tools', 'Review': 'tools', 'Make': 'tools', 'Share': 'tools', 'People': 'tools', 'Red mode': 'red', 'Safelight': 'red', 'Timer': 'red', 'Dials': 'dials', 'The dial': 'dials', 'Moon dial': 'moon', 'Earlier Moon dial (parked)': 'developer', 'Parked dials': 'developer', 'The Mark': 'gestures', 'Constellations': 'gestures',
    'Sky': 'look', 'Environment': 'look', 'Icons': 'look', 'Messages': 'tools', 'Beyond': 'motion', 'Golden hour': 'weather', 'Loops': 'look', 'Visualizer': 'look', 'Sky player': 'look' };
  var OWNER = ARTIST.concat(DEV), SECRET = GJ.core ? GJ.core.secret() : [], isOwner = !!(GJ.core && GJ.core.owner());
  function vis(t) { var rv = GJ.registry && GJ.registry.visOf(t); return SECRET.indexOf(t) >= 0 ? 'secret' : (OWNER.indexOf(t) >= 0 || rv === 'owner') ? 'owner' : 'public'; }
  function keyOf(node) { var b = node.querySelector && node.querySelector('[data-t]'); return b ? b.dataset.t : ''; }
  function tierOf(t) { return ARTIST.indexOf(t) >= 0 ? 'artist' : DEV.indexOf(t) >= 0 ? 'dev' : 'user'; }
  var secs = [], cur = null, lead = [], rev = document.getElementById('tn-rev'), TIER = {}, GRP = {};
  [].slice.call(tune.children).forEach(function (c) { if (c === rev) return; if (c.tagName === 'H3') { cur = { h: c, name: c.textContent.trim(), items: [] }; secs.push(cur); } else if (cur) cur.items.push(c); else lead.push(c); });
  // a public build: the owner's and the secret settings are not on the page at all
  if (!isOwner) secs.forEach(function (s) { s.items = s.items.filter(function (it) { var t = keyOf(it); if (t && vis(t) !== 'public') { it.remove(); return false; } return true; }); });
  var boxes = {}, count = {};
  GROUPS.forEach(function (g) {
    var box = document.createElement('section'); box.className = 'tn-group'; box.dataset.group = g[0]; box.setAttribute('aria-label', g[1]);
    box.innerHTML = '<div class="tn-gh"><h2 class="jul">' + g[1] + '</h2><button class="tn-greset" data-greset="' + g[0] + '" hidden>reset</button></div><p class="tn-sub">' + g[2] + '</p>';
    boxes[g[0]] = box; count[g[0]] = 0;
  });
  secs.forEach(function (s) {
    var last = {};
    s.items.forEach(function (it) {
      var t = keyOf(it), g = (t && (GROUP_OF[t] || (GJ.registry && GJ.registry.groupOf(t)))) || BY_HEADING[s.name] || 'tools'; if (t) { TIER[t] = tierOf(t); GRP[t] = g; }
      var box = boxes[g];
      if (last[g] !== s) {   // a sub-heading: the old heading, inside the group (the same name as the group: kept, but quiet)
        var h = s.used ? s.h.cloneNode(true) : s.h; s.used = true; if (s.name === box.querySelector('h2').textContent) h.classList.add('tn-same'); box.appendChild(h); last[g] = s;
      }
      box.appendChild(it); if (it.classList.contains('row')) count[g]++;
    });
    if (!s.used) s.h.remove();
  });
  // Developer: the build's own number
  if (rev) { var bh = document.createElement('h3'); bh.className = 'jul'; bh.textContent = 'Build'; boxes.developer.appendChild(bh); boxes.developer.appendChild(rev); TIER['tn-rev'] = 'dev'; }
  // the gestures group says the one gesture that is not a switch
  var gn = document.createElement('h3'); gn.className = 'jul tn-same'; gn.textContent = 'Gestures'; var gp = document.createElement('p'); gp.className = 'note'; gp.textContent = 'Two fingers held still on the screen, anywhere, opens Tune.';
  boxes.gestures.insertBefore(gp, boxes.gestures.querySelector('h3')); boxes.gestures.insertBefore(gn, gp);
  GROUPS.forEach(function (g) { if (boxes[g[0]].querySelector('.row, .note') || g[0] === 'developer') tune.appendChild(boxes[g[0]]); });
  var foot = document.createElement('p'); foot.className = 'tn-foot jul'; foot.textContent = (GJ.APP && GJ.APP.title) || 'oz'; tune.appendChild(foot);   // the foot of Tune: the app's name
  tune.dataset.build = isOwner ? 'owner' : 'public';
  GJ.tiers = {
    of: function (t) { return TIER[t] || (tune.querySelector('[data-t="' + t + '"]') ? 'user' : null); },
    group: function (t) { var b = tune.querySelector('[data-t="' + t + '"]'), box = b && b.closest('.tn-group'); return box ? box.dataset.group : null; },
    groups: function () { return [].map.call(tune.querySelectorAll('.tn-group'), function (b) { return b.dataset.group; }); },
    names: function () { var o = {}; GROUPS.forEach(function (g) { o[g[0]] = g[1]; }); return o; },
    vis: vis, owner: function () { return isOwner; }, count: function () { return count; }
  };
})(window);
