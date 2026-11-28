"permanent impermanence" - new top screen (branch cks21-pi-top). Concept name for code and comments only; no visible wording.

What it is
  A dark night with a few faint stars and a hint of haze, and the CKS constellation along the bottom as stars only (no orbs, images, labels or lines).
  Scrolling raises it: each star travels from its place in the bottom band to mid-height of the viewport (eased, staggered by depth),
  while the sky arrives under it. Then the hierarchy continues as before. Scrolling back up restores the screen.
  A wordless, slow-breathing chevron sits at the bottom and fades once scrolling starts.

Starter defaults (Gill, Nov 27 6:54 PM PT; points to tune from, not final)
  ~185 night stars at 1440x900, scaled by viewport area on other sizes (about 47 on a 390x844 phone).
  Medium haze: clearly present, still subtle.
  The constellation lands at mid-height of the viewport.
  The scroll cue is on.

Files (all new, except three small hooks)
  css/pi-top.css   the night/haze veil, the star layer, the cue, red mode
  js/pi-top.js     the star layer, the eased rise, the settle, wheel-up return, the cue fade
  index.html       +<link css/pi-top.css>, +<script js/pi-top.js>, +<section id="pitop" aria-hidden="true"></section> as the first child of <main>
  sw.js            the two files added to PRECACHE, cache name bumped
  js/site.js       ONE line after function lim() in room(): GJ12.constellation (read-only; returns the live projected star positions and the raw layout)
  js/atmos.js      ONE line: the pull-down gesture also counts at the top of the sky (scrollY == GJPT.top())

Porting to another build (e.g. the t-4c74 fix build)
  1. copy css/pi-top.css and js/pi-top.js
  2. add the three index.html lines above (link in <head> after site.css, script after the other scripts, section before #sky)
  3. optional but better: add the site.js hook line. Without it pi-top.js reads the live star links in #room instead (works, but no drop stars).
  4. optional: the atmos.js line (keeps pull-down working at the sky top).
  5. add the two files to the service worker precache and bump the cache name.
  Star positions are never copied: they come from the constellation's own layout.
  See also /workspace/share/cks-review/permanent-impermanence/port-t4c74.patch

Tuning (URL parameters; defaults in js/pi-top.js CFG)
  ptd=1   night-star density (1 = 185 at 1440x900, scaled by area)
  pth=1   haze strength (1 = medium)
  ptr=.9  how much of the first screen of scrolling the rise takes
  ptl=.5  where the constellation lands, as a fraction of the viewport height
  ptc=1   wordless scroll cue (0 = off)
  pts=1   settle on release (0 = off)
  ptw=1   wheel-up at the sky returns to this screen (0 = off)
