"permanent impermanence" - new top screen (branch cks21-pi-top). Concept name for code and comments only; no visible wording.

What it is
  A dark night with a few faint stars and a hint of haze, and the CKS constellation along the bottom as stars only (no orbs, images, labels or lines).
  Scrolling raises it: each star travels from its place in the bottom band to its place in the sky below (eased, staggered by depth),
  while the sky arrives under it. Then the hierarchy continues as before. Scrolling back up restores the screen.

Files (all new, except three small hooks)
  css/pi-top.css   the night/haze veil, the star layer, red mode
  js/pi-top.js     the star layer, the eased rise, the settle, wheel-up return
  index.html       +<link css/pi-top.css>, +<script js/pi-top.js>, +<section id="pitop" aria-hidden="true"></section> as the first child of <main>
  sw.js            the two files added to PRECACHE, cache name bumped
  js/site.js       ONE line after function lim() in room(): GJ12.constellation (read-only; returns the live projected star positions and the raw layout)
  js/atmos.js      ONE line: the pull-down gesture also counts at the top of the sky (scrollY == GJPT.top())

Porting to another build (e.g. AAC-104's t-4c74 fix build)
  1. copy css/pi-top.css and js/pi-top.js
  2. add the three index.html lines above (link in <head> after site.css, script after the other scripts, section before #sky)
  3. optional but better: add the site.js hook line. Without it pi-top.js reads the live star links in #room instead (works, but no drop stars).
  4. optional: the atmos.js line (keeps pull-down working at the sky top).
  Star positions are never copied: they come from the constellation's own layout.

Tuning (URL parameters on any build that has it; defaults in js/pi-top.js CFG)
  ptd=1   night-star density      pth=1   haze strength      ptr=.9  how much of the first screen of scrolling the rise takes
  pts=0   turn off the settle     ptw=0   turn off wheel-up return
