# Code Review & Bug-Fix Report (`cks17` Working Snapshot)

Branch: `review/cks17-neon` (branched off `main` at `aa90a30`)
Untouched snapshot commit: `a265db8` (`review-cks17/`)
Line numbers below refer to the untouched snapshot (`a265db8`).

---

## (a) Bugs Found by Severity

### Critical

1. **Lightbox (`#lb`) pinch-zoom teleports image off-screen (`review-cks17/css/site.css:420, 765, 922`, `review-cks17/js/site.js:1376-1402`)**
   - **How to reproduce**: Open any piece, tap the photograph to open `#lb`, then pinch-open or Ctrl+wheel to zoom in.
   - **Cause**: `#lb .st` is `display: flex; align-items: center; justify-content: center`. `layoutHi()` resizes `<img>` to raw `naturalWidth × naturalHeight` (`transform-origin: 0 0`), and `applyZ()` translates by `(rw - nw*f*z)/2`, assuming `<img>` sits at `(0, 0)`. Because `#lb img.hi` was not `position: absolute; left: 0; top: 0`, flexbox already centered the raw `nw × nh` box at `((rw - nw)/2, (rh - nh)/2)`, shifting the zoomed image hundreds of pixels off-screen.
   - **Status**: **Fixed** (`299d718`) — positioned `#lb img.hi` at `position: absolute; left: 0; top: 0` so `applyZ()` centers and pans accurately.

2. **Lightbox (`#lb`) leaks inline sizes/transform state between photos and pieces, and closes immediately after pinch-zoom (`review-cks17/js/site.js:1408, 1422-1454`, `review-cks17/css/site.css:1221-1224`)**
   - **How to reproduce**: (i) Open `#lb`, pinch-zoom, then tap next/prev (`‹`/`›`) or close `#lb` and open another piece's photo: `fit()` only cleared `transform` and `willChange`, leaving inline `width`, `height`, `maxWidth: none`, `maxHeight: none`, and `transformOrigin: 0 0` on `<img>`. (ii) Finish a touch pinch-zoom on `#lb`: `pinching` was reset to `0` synchronously on `done`, so the trailing synthetic `click` on `#lb .st` closed `#lb`. (iii) Switch photos in `#lb`: `fadeTo()` inserted `img.xfade` into flex container `#lb .st` with no `#lb .st img.xfade` CSS rule, laying out two images side by side.
   - **Status**: **Fixed** (`299d718`) — `fit()` clears all inline dimensions/transform properties and removes any leftover `img.xfade`; added `#lb .st img.xfade` overlay CSS; guarded `layoutHi()` until `lbReady()`; added a 350ms `pinchEndAt` cooldown before `#lb .st` click can close `#lb`; fixed `shutNavOverlays()` to call `LB.shut()` and `ALLV.shut()` (fixing `window.ALLV` undefined bug) and exposed `GJ12.lbClose`.

3. **Momo easter egg triggered on wrong gestures (`#corner` hold & sky double-tap), broke `#corner` Tune hold, and was missing from main Mark (`#red`) double-click (`review-cks17/js/site.js:269-276, 2215-2264`, `review-cks17/js/momo.js:119-123`, `review-cks17/css/site.css:124`)**
   - **How to reproduce**: (i) Hold `#corner` for 700ms: triggered Momo and cancelled the 1.2s Tune hold timer, making `#corner` Tune hold unreachable. (ii) Double-tap empty sky: triggered Momo. (iii) Double-click `#red`: did not trigger Momo (and `momo.js` capture-phase `click` called `momoTapHide()` on the first click). (iv) Swipe down on `#red` on mobile: `#red` lacked `touch-action: none` and pointer capture.
   - **Status**: **Fixed** (`4bdfe8a`) — removed Momo triggers from `markHold()` (`#corner`) and `doubleOut()` (sky); added double-tap/double-click on `#red` (deduped so `pointerup`×2 + `dblclick` only toggles once) while preserving `#red` single-tap home and immediate swipe-down `stepBack()`; added `touch-action: none` and pointer capture to `#red`; exempted `#red` from `momo.js`'s capture-phase `momoTapHide()`.

4. **Click-through bounce-back to `#sky` on fast taps and overlay picks (`review-cks17/js/site.js:553-554, 1144-1154, 2065-2073, 2236-2264`)**
   - **How to reproduce**: (i) Tap near an orb's hit margin (outside `a.st`, so `e.target` is `#room`), then tap again within 320ms on the newly opened piece's `.stage` (e.g. following the site's own first-visit hint): `doubleOut()` did not exclude `#room` or check `_openedAt`/`_navLock`, so tap 2 called `stepBack()` -> `goSky()`, bouncing the user back to main. (ii) Pick a photo from `#wall`: `WALL.pick()` called raw `p.scrollIntoView()` without `openPiece()`/`setCur()`/`_navLock`. (iii) Open a piece within 720ms of `goSky(true)`: the uncancellable 720ms `setTimeout` mutated `scrollSnapType`/`scrollBehavior`. (iv) Browser `history.scrollRestoration` defaulted to `'auto'`, allowing `afterBack`'s `history.back()` to restore `#sky` scroll asynchronously.
   - **Status**: **Fixed** (`4bdfe8a`, `4eb5324`) — excluded `#room` and `#red` from `doubleOut()` and guarded against `_navLock`/`_openedAt` (600ms); set `history.scrollRestoration = 'manual'`; routed `WALL.pick()` through `GJ12.openPiece(id)`; stored and cancelled `GJ12._skyT` and `GJ12._enterT` across `gotoPlate()`/`goSky()`; deferred `scrollSnapType = ''` with `requestAnimationFrame`.

5. **Atmosphere (`#airbtn`) persistence init race and silent iOS/autoplay AudioContext restore (`review-cks17/js/site.js:2144-2166`, `review-cks17/js/atmos.js:9, 41-45, 190`)**
   - **How to reproduce**: (i) Click `#airbtn` to enable atmosphere, reload the page: `site.js` ran `bindAirBtn()` synchronously on `load`, before `atmos.js`'s `setTimeout(go, 0)` created `#airbtn` and `GJ12.air`. As a result `#airbtn._cksAir` was never bound on initial load, `TUNE.air` was never persisted to `localStorage`, and persisted `TUNE.air = 1` never restored on reload. (ii) Even when restored via `GJ12.syncAir()`, `setAir(true)` created an `AudioContext` without a user gesture, leaving it `suspended` (or `interrupted` on iOS Safari) with no gesture-unlock retry, so `#airbtn` looked active while white noise remained completely silent.
   - **Status**: **Fixed** (`b5b83dd`) — called `GJ12.syncAir()` at the end of `atmos.js` `go()`; resumed `AudioContext` whenever `AC.state !== 'running'` (covering `'suspended'` and iOS `'interrupted'`), caught rejected `resume()` promises, and added passive capture-phase user-gesture & `visibilitychange` unlock hooks to resume `AC` when `on === true`.

---

### High

6. **Side rail (`#rail`) velocity unit mismatch (24× too fast), duplicate wheel handler, and `pointercancel` navigation (`review-cks17/js/site.js:1115-1140`)**
   - **How to reproduce**: (i) Drag and flick `#rail` inside a piece: `rPos` is in item indices (`dy / 24 * g`), but `rd.v = (dy / dt) * g * 16` was in pixels/frame (missing `/ 24`), slamming `rPos` straight to index `0` or `14`. (ii) Scroll wheel while hovering over `#rail`: `onRailWheel` was registered on BOTH `railEl` and `document` (capture), firing twice per wheel tick. (iii) Cancel a touch drag on `#rail` (`pointercancel`): called `railUp` and committed navigation.
   - **Status**: **Fixed** (`4eb5324`) — fixed `rd.v = ((dy / 24) / dt) * g * 16` clamped to `[-2.5, 2.5]`; removed duplicate `railEl` wheel listener; made `pointercancel` cancel drag and restore `markRail(curIdx())`.

7. **Sculpture & cutout orbs: broken fallback when alpha mask/cutout fails and non-square `cutoutHit` math (`review-cks17/js/site.js:75, 979-992`)**
   - **How to reproduce**: (i) Tap `sculpture` (or any cutout orb) before its `ORB_ALPHA` image finishes decoding or when offline/404: `cutoutHit()` returned `null`, yet `starFromEv()` line 990 still returned early without falling through to distance hit-testing. (ii) If `media/orbs/cut/*.png` is missing/uncached, `applyOrbShape()` had no `error` fallback to `data-orb-circle`. (iii) `cutoutHit()` assumed `A.w === A.h` despite `object-fit: contain`.
   - **Status**: **Fixed** (`4eb5324`) — `starFromEv()` now falls through to distance hit-testing when `cutoutHit()` returns `null`; `cutoutHit()` computes aspect-corrected `object-fit: contain` bounds; `applyOrbShape()` attaches an `error` fallback to `data-orb-circle`.

8. **Lost in Time playback start fails on iOS Safari / rapid toggles (`review-cks17/js/site.js:1519-1523, 1574-1582, 1612`)**
   - **How to reproduce**: (i) Tap play (`.pp`) on iOS Safari or rapidly toggle play/pause (<450ms): `.pp` bound BOTH `pointerup` and `click` to `togglePlay`, which called `rememberTap()` on `pointerup` and blocked `click` via `isGhostTap()` (breaking iOS WebKit `click`-gesture unlock and blocking intentional quick pause/resume). (ii) Tap waveform (`wave`) or star canvas (`wn`) on iOS: called `au.play()` in `pointerup` instead of `click`, and `wn` skipped `unlockAudio()` and `preload = 'metadata'`. (iii) Unmute a paused video (`owtd`): `hushMusic()` listened to `volumechange` without checking `v.paused`, pausing Lost in Time even when no video was playing.
   - **Status**: **Fixed** (`4eb5324`) — removed redundant `pp` `pointerup` listener and `isGhostTap` check inside `togglePlay`; moved `wave`/`wn` tap-to-play to `click` (when not dragged); added `pointercancel` to `wn`/`nwave`; ignored paused/ended videos in `hushMusic()`.

9. **Global `Escape` capture handler hijacks single-level step-back and kills ambient white noise (`review-cks17/js/site.js:1922-1940, 2172-2177`)**
   - **How to reproduce**: Enable Atmosphere, open a piece, open `#lb` or `#find`, press `Escape`. `site.js:2172` intercepted `Escape` in capture phase with `stopImmediatePropagation()` and called `escToSky()`, which jumped past `#lb`/`#wall`/`#tune` straight to `#sky`, left `#find` open (blocking `atmos.js:138`), and unconditionally called `GJ12.exitAir()`, killing ambient white noise even when only stepping out of a piece.
   - **Status**: **Fixed** (`4eb5324`) — `Escape` now invokes `stepBack()` (stepping out one level cleanly, including `#find`); `escToSky()` now closes `#find` and only calls `GJ12.exitAir()` when already at `#sky` with no piece/overlay open.

10. **`sw.js` `PRECACHE` missing `momo.js?v=cks17` and 3 `#sky` orb images, and `offline-assets.json` stale at `cks12` (`review-cks17/sw.js:3`, `review-cks17/offline-assets.json:1-405`)**
    - **How to reproduce**: Inspect `sw.js` `PRECACHE` vs `index.html` and `offline-assets.json`: `sw.js` omitted `./js/momo.js?v=cks17` and the three `#sky` orb sources (`./media/photos/10-hanging-sculpture.jpg`, `./media/photos/spirit-eye-object.webp`, `./media/photos/lost-in-time.webp`), while `offline-assets.json` still had `"version": "cks12"`, `?v=cks12` asset URLs, and lacked `00_snow_portrait` entries present in `sw.js`.
    - **Status**: **Fixed** (`4021baa`) — added `momo.js?v=cks17` and the three `#sky` orb images to `PRECACHE`, bumped `atmos.js` to `?v=cks17` across `index.html`/`sw.js`/`offline-assets.json`, removed `./sw.js` from `PRECACHE`, and synced `offline-assets.json` (`version: "cks17"`) to match `sw.js` 1:1.

11. **Lightbox `LB.open()` crashes/loads wrong index when opened from a dial slide (`review-cks17/js/site.js:1270, 1362-1366`)**
    - **How to reproduce**: Open a piece whose strip includes `data-kind="dial"` (e.g. `scoop`) and trigger `img.main` click while `strip[at]` is the dial button: `imgs.indexOf(strip[at])` returned `-1`, opening the last image instead of index `0` (or `NaN` if `imgs` was empty).
    - **Status**: **Fixed** (`299d718`) — guarded empty `imgs` and clamped `idx < 0 ? 0 : idx` in `gallery()` and `LB.open()`.

---

### Medium

12. **Safelight / red mode (`html.red`): multiple active, hover, focus, and chrome states leak white/blue/green/cream (`review-cks17/css/site.css:50, 74, 78, 92, 95, 183, 533, 577, 778, 883, 1088-1099, 1153-1156, 1302, 1315`)**
    - **How to reproduce**: Enable red mode (`#disc`) and hover/activate `#esc`, `#ord`, `#airbtn`, `#findbtn`, active strip buttons (`.strip button.on`), `#rail a.on i`, `.dial .ticks button.on i`, `.vrail i`, `.voltrack b`, `#holdfan button.hot`, `.vidmute` on OWTD, `#all .acover:active`, `#full .full-back`, or open `#lb`/`#all`/`#wall`: glows, borders, outlines, and bars rendered white or in piece-accent colours (`var(--c)`). (The small red-mode dot `#disc i` correctly stays mint in `html.red`.)
    - **Status**: **Fixed** (`8dd5675`) — added `html.red` overrides keeping all active/hover/focus/bar states safelight red while keeping `#disc i` mint.

13. **Service Worker fetch strategy bugs: `ignoreSearch: true` on `.css`/`.js`, `206` cache-put errors, and broken cached video `Range` requests on iOS Safari (`review-cks17/sw.js:42-72`, `review-cks17/js/site.js:2421`)**
    - **How to reproduce**: (i) Bump `?v=cks17` to `?v=cks18` without renaming `CACHE`: `c.match(req, {ignoreSearch: true})` served stale JS/CSS. (ii) Fetch a cached `.mp4` on iOS Safari (which always sends `Range: bytes=0-1`): `sw.js` returned a full `200` response instead of `206 Partial Content`. (iii) Any `206` response matched by `cacheFirst` passed `res.ok` and threw `TypeError` on `c.put()`. (iv) Offline navigate fallback used global `caches.match()` rather than `caches.open(CACHE)`.
    - **Status**: **Fixed** (`4021baa`) — excluded `sw.js` from `cacheFirst`; used exact query matching (`ignoreSearch: false`) for `.css`/`.js`/`.json`; checked `res.status === 200` before `c.put()`; added `rangeResponse()` to serve valid `206 Partial Content` slices from cached videos; scoped offline navigate fallback to `CACHE`; added `updateViaCache: 'none'` on SW registration.

14. **Thumb-dial (`#ozdial`) `pointercancel` commits unintended navigation (`review-cks17/js/site.js:406`)**
    - **How to reproduce**: Hold `#ozdial` moon and trigger an OS gesture/notification (`pointercancel`): `pointercancel` called `up()`, committing `go(pos)`.
    - **Status**: **Fixed** (`4eb5324`) — `pointercancel` now clears `down` and calls `fold()` without navigating.

15. **`#find` touch-scrolling accidentally opens works (`review-cks17/js/atmos.js:136-137, 185`)**
    - **How to reproduce**: Open `#find` on mobile and touch a list item to scroll: `pickFind` was bound in capture phase on `pointerdown` (twice: on `fp` and `fl`) plus `touchend` and `click`, immediately navigating on finger-down. Also line 185 had a duplicate `touchend` listener.
    - **Status**: **Fixed** (`b5b83dd`) — bound `pickFind` once on `fl` `click` and removed the duplicate `touchend` listener.

16. **Tune Reset does not reset `atmos.js` settings (`review-cks17/js/site.js:1866`)**
    - **How to reproduce**: Adjust atmosphere sliders (mist, light, noise colour/volume) in Tune, then confirm Reset: `TUNE` reset to `{}` (`gj.cks12.tune`), but `gj.cks29.air` stayed modified because `GJ12.air.reset()` was never called.
    - **Status**: **Fixed** (`b5b83dd`) — Tune `[data-reset]` now calls `GJ12.air.reset()`.

17. **Progressive media loading leak in HTML (`review-cks17/index.html:1`)**
    - **How to reproduce**: Load the page on a 3× DPR mobile device (`devicePixelRatio >= 3`) or inspect network tab on initial load:
      1. 128 strip thumbnails declare `srcset="media/thumbs/s/... 440w, media/photos/... 1600w" sizes="160px"` (some `220w`). Because `160px × 3 = 480w > 440w` (and `160px × 2 = 320w > 220w`), high-DPR phones skip the light thumbnail and download full `media/photos/` (`1600w–1800w`) files for strip thumbnails.
      2. 30 non-orb `<img>` tags (including `.dial figure img` inside `scoop` and `cup`) omit `loading="lazy"` and start loading `media/photos/` eagerly on initial page load before the user enters those pieces.
    - **Status**: **Not fixed** (HTML markup refactor; left untouched to keep fixes minimal and avoid altering HTML asset markup beyond the `atmos.js` query bump).

18. **iOS Safari `HTMLAudioElement.volume` is read-only for Lost in Time (`review-cks17/js/site.js:1505-1509`)**
    - **How to reproduce**: Drag the `.vol` slider on `#lost-in-time` on iOS Safari. `ensureGain()` sets `au.volume = vol` (which iOS Safari ignores), while `actx`, `mediaSrc`, and `gainNd` are declared as unused dead variables.
    - **Status**: **Not fixed** (routing `<audio>` through `MediaElementAudioSourceNode` + `GainNode` on iOS Safari has known background-audio/lock-screen playback trade-offs when combined with `mediaSession` and `pagehide`; noted under refactors rather than risking breaking background playback).

---

### Low

19. **Service Worker `activate` wipes all caches on the origin (`review-cks17/sw.js:22-26`)**
    - **How to reproduce**: Open two different `t-*` preview folders on the same GitHub Pages origin. `if (k !== CACHE) return caches.delete(k)` deletes sibling `t-*` preview caches as well as older versions of this folder.
    - **Status**: **Not fixed** (intentional safety tradeoff: keeping `k !== CACHE` guarantees any legacy/renamed cache on the production domain is always cleaned; noted as a refactor if multi-preview coexistence on one origin is desired).

20. **Duplicate inline `<style>` block in `index.html` `<head>` (`review-cks17/index.html:1`)**
    - **How to reproduce**: Inspect `<head>` in `review-cks17/index.html`: the initial dark-background `<style>html,body{background:#04070b...}</style>` block is duplicated verbatim twice.
    - **Status**: **Not fixed** (harmless; avoids unnecessary HTML edits).

21. **Stale first-visit hint copy (`review-cks17/js/site.js:2374`)**
    - **How to reproduce**: Visit on a clean profile: `#findhint` displays `'tap a work, then tap again to open it'`, although single-tap opens pieces directly.
    - **Status**: **Not fixed** (hard rule: never change any visible text or copy).

---

## (b) Review Scope Area Assessment

### 1) Touch, gesture, click-through, lightbox, and Momo
- **Cover taps & click-through**: **Works as intended after fixes.** Single tap or pinch-in on any orb (including `sculpture`) enters the piece page cleanly without bouncing back to `#sky` (`doubleOut` race, `WALL.pick`, `scrollRestoration`, and pending timer bugs fixed). No white flash occurs across `#sky`, pieces, `#lb`, `#full`, or `#subframe` (inline dark background + `#04070b` iframe background without `about:blank`).
- **Side rail (`#rail`) & thumb-dial (`#ozdial`)**: **Works as intended after fixes.** Fixed the 24× velocity unit bug and duplicate wheel listener on `#rail`, and fixed `pointercancel` on both `#rail` and `#ozdial`. Note: `#ozdial` is only shown when `TUNE.railui === 'c'` (default `DEFAULTS.railui` is `'b'`, the vertical side rail).
- **Sculpture orb**: **Works as intended after fixes.** Fixed `starFromEv` fallback when `cutoutHit` returns `null`, fixed aspect-ratio hit-testing in `cutoutHit`, added missing-cutout `onerror` fallback to `data-orb-circle`, and precached `media/photos/10-hanging-sculpture.jpg`.
- **Lost in Time playback start**: **Works as intended after fixes.** Removed `pointerup`+`click` ghost-tap conflict on `.pp`, moved `wave`/`wn` tap-to-play to `click` for iOS Safari user activation, and fixed `hushMusic` so unmuting paused videos doesn't pause audio.
- **Four-step piece interaction (`#full`)**: **NOT IMPLEMENTED in this snapshot.** `FULL.open` (`site.js:690`) is never called anywhere in `site.js`—tapping an orb goes straight to the piece page (`openStar` -> `openPiece`). Inside `fullview()` (`site.js:738-751`), swipe-left/right (more images) and swipe-up/down (more angles) are not implemented (`sMoved` is ignored and single-tap does nothing). In the piece page's full-photo viewer (`#lb`), pinch-open now zooms and centers properly, and inline state no longer leaks between photos/pieces.
- **Pinch-out, double-tap, swipe-down on main Mark (`#red`), and Escape**: **Works as intended after fixes.** Swipe-down on `#red`, double-tap on piece/overlay, pinch-out, and `Escape` each step back one level; single-tap on `#red` returns to `#sky`.
- **Momo easter egg (`momo.js`)**: **Works as intended after fixes.** Now triggers **only** on clicking `[data-egg="momo"]` (the 'kaia' credit in the CV, including inside the CV iframe via `GJ12.momoBindFrame`) and on double-clicking/double-tapping the main Mark (`#red`), without breaking `#red` single-tap, `#red` swipe-down, or `#corner` Tune hold. (Note: the older published `cv/index.html` in `t-06850fb9ac595e27ab8672/` does not yet contain `[data-egg="momo"]`; `momo.js` and `site.js:1990` are wired ready for the updated CV page.)
- **Safelight / red mode**: **Works as intended after fixes.** Every active, hover, and focus state now stays red in `html.red`, except `#disc i` (the small red-mode dot), which stays mint (`rgb(170, 245, 212)`).

### 2) Sound controls
- **Separate light-atmosphere and sound-atmosphere switches**: **NOT PRESENT in this snapshot.** `atmos.js` still exposes only one combined `#airbtn` (`atmosphere` / `air`) toggling visual mist/light and white noise together, backed by a single `TUNE.air` flag.
- **Mute button replacing the X/escape control**: **NOT PRESENT in this snapshot.** `#esc` is still the `esc` ("back to the sky") button, `#atmosx` is hidden via `display: none !important`, and `#now .now-x` is still `×` ("stop and close"). There is no global mute toggle silencing all audio.
- **Volume dial on the floating Lost in Time player (`#now`)**: **NOT PRESENT in this snapshot.** The volume slider (`.vol` / `.voltrack`) exists only on the `#lost-in-time` plate, not inside `#now`.
- **Persistence, continuity across clicks / under Lost in Time, autoplay & iOS unlock (for the existing controls)**: **Works as intended after fixes.** Fixed the `load` vs `setTimeout(go, 0)` race that broke `#airbtn` persistence on reload; added `AudioContext` unlock on user gesture and `visibilitychange` (covering `'suspended'` and iOS `'interrupted'`); fixed `escToSky()` and `Escape` so navigating/escaping from a piece no longer kills ambient white noise; verified white noise ducks cleanly (`0.35×`) and continues playing under Lost in Time.

### 3) Offline cache
- **Cache bump (`cks16` -> `cks17`) & old-cache cleanup**: **Works as intended.** `CACHE` is `gj-t-59e4ba58c34053ce5f55-cks17`, `install` calls `skipWaiting()`, and `activate` deletes old caches and calls `clients.claim()`.
- **Precache list vs `offline-assets.json`**: **Works as intended after fixes.** Added missing `./js/momo.js?v=cks17` and the 3 `#sky` orb images to `PRECACHE`, removed `./sw.js`, aligned `atmos.js?v=cks17`, and synced `offline-assets.json` (`version: "cks17"`) to match `sw.js` exactly (152 precache, 89 stills, 7 videos).
- **Stale-page risks & fetch strategies**: **Works as intended after fixes.** HTML navigation uses network-first with `CACHE`-scoped offline fallback; `.css`/`.js`/`.json` now require exact query matches (`ignoreSearch: false`), `sw.js` is never cached, `c.put()` requires `status === 200`, and cached videos now serve valid `206 Partial Content` slices for `Range` requests. Progressive media loading works at the SW layer (thumbs/orbs precached, `STILLS` opt-in, `media/full/*` cached on open/zoom), though `index.html`'s strip `srcset` and eager `.dial` `<img>` tags still pull `media/photos/` eagerly on high-DPR devices (see Medium #17).

---

## (c) Refactor Suggestions (NOT Applied)

1. **Unify overlay & navigation state machine (`site.js`)**: `#lb`, `#full`, `#wall`, `#all`, `#tune`, `#find`, and `#subframe` each manage `document.body.style.overflow`, `de.style.scrollSnapType`, `history.pushState`/`history.back()`, and `popstate` independently, causing fragile timing races (`_navLock`, `_closedAt`, `afterBack` 400ms timeout). A single small overlay stack manager (`openOverlay(name, closeFn)` / `closeTop()`) would eliminate duplicate scroll-lock and history-state bugs.
2. **Consolidate `TUNE` (`gj.cks12.tune`) and `atmos.js` (`gj.cks29.air`) persistence & event wiring**: `site.js` and `atmos.js` communicate through ad-hoc `window.GJ12` hooks and `load`/`setTimeout(..., 0)` ordering. Having a single readiness event (or moving `atmos.js` boot to `DOMContentLoaded` with an explicit `GJ12.registerAir(api)` handshake) removes load-order races and prepares cleanly for splitting light-atmosphere vs sound-atmosphere switches and a global mute bus.
3. **Deduplicate `css/site.css` override layers**: `site.css` (1,470 lines) has 10+ chronological patch blocks overriding earlier rules for `#lb`, `#red`, `#disc`, `#now`, and `html.red` (e.g. `#lb .st` is defined 4 separate times with conflicting `display: grid` vs `display: flex` and `touch-action`). Consolidating per-component rules and defining a single `html.red { --c: 255,68,87 !important; }` / semantic token set (e.g. `--active-rgb`, `--chrome-bg`) would prevent future cascade regressions in safelight mode.
4. **Tighten progressive loading in `index.html`**: Remove `1600w`/`1800w` `media/photos/` candidates from `160px` strip thumbnail `srcset` attributes (or provide `440w`/`640w` thumbs only) and add `loading="lazy"` to `.dial figure img` so high-DPR mobile devices only fetch light assets until a piece or lightbox is opened.
5. **Remove dead/unused code paths or wire them intentionally**: `FULL` (`fullview()`, `site.js:686-757`), `morphToFull()` (`site.js:1638-1652`), `#atmosx` (`atmos.js:51-55`), and unused Web Audio variables `actx`/`mediaSrc`/`gainNd` (`site.js:1506`) are currently dead code. Either wire `FULL` for the four-step viewer and `GainNode` for iOS volume/mute, or remove them to cut maintenance surface.
6. **Generate `sw.js` asset arrays from `offline-assets.json` (or single manifest)**: Keeping `PRECACHE`, `STILLS`, and `VIDEOS` hand-copied between `sw.js` and `offline-assets.json` is how `offline-assets.json` drifted 5 versions behind (`cks12` vs `cks17`) and `momo.js` was missed. Even without a build step, a small release check script (or having `sw.js` read a single shared manifest) prevents drift.
7. **Stop continuous `requestAnimationFrame` / `setInterval` loops when off-screen**: `field()` (`site.js:1596`) schedules `requestAnimationFrame` permanently even when `#lost-in-time` is scrolled off-screen, and `moonClear` (`atmos.js:92`) runs `setInterval(clear, 300)` even when `#moonslot` is hidden. Pausing them via `IntersectionObserver` / visibility state saves mobile battery.

---

## (d) Commits on `review/cks17-neon`

- `a265db8` — Add untouched cks17 working snapshot under review-cks17/
- `299d718` — Fix lightbox pinch-zoom positioning, inline-style leaks, and crossfade layout
- `4bdfe8a` — Fix Momo easter egg triggers and main Mark double-click/swipe-down handling
- `4eb5324` — Fix click-through navigation, side rail, cutout hit-test, Escape step-back, and Lost in Time playback
- `b5b83dd` — Fix atmosphere persistence init race, iOS AudioContext unlock, Tune reset sync, and Find touch scroll
- `8dd5675` — Keep all safelight/red-mode active states red except the red-mode dot
- `4021baa` — Sync cks17 precache with offline-assets.json and harden SW fetch/range handling
