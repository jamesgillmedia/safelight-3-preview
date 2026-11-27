# CKS Click-Through & Gesture System Root-Cause Review (`review/cks-gestures-neon`)

Branch: `review/cks-gestures-neon` (branched from `review/cks17-neon` at `cc4e42d`; untouched `cks17` snapshot at `a265db8`)  
Scope: Root-cause diagnosis and targeted fixes for click-through, pointer-layer, gesture, navigation, lightbox, shuffle, and safelight/red-mode failures in `review-cks17/`.  
Line numbers below refer to the current `review-cks17/` files at HEAD unless marked `(orig a265db8)`.

---

## 1. Live Verification Summary (Headless Chrome CDP)

Every failure was reproduced live in `google-chrome --headless=new` against `review-cks17/` (overlaid with media from `t-06850fb9ac595e27ab8672/` and `t-ba3fa6055c92ff897c45e7/` via a Range-capable local HTTP server) in both **Desktop (`1280×800` mouse/wheel)** and **Mobile (`390×844` 2× DPR touch)** modes:

| Build | Desktop (`1280×800`) | Mobile (`390×844` touch) | Console / Page JS Errors |
|---|---:|---:|---:|
| Untouched `cks17` snapshot (`a265db8`) | 9 / 24 PASS | 12 / 23 PASS | 0 |
| Prior `review/cks17-neon` (`cc4e42d`) | 12 / 24 PASS | 18 / 23 PASS | 0 |
| **Milestone 1 (`cb88bad`)** — layout shift, scroll-snap, ghost-tap, `.wallbtn` | 19 / 24 PASS | 21 / 23 PASS | 0 |
| **Milestone 2 (`f351afe`)** — orb hit-test, `holdBind`, shuffle `reroom`, `#rail`, `#ozdial` | 22 / 24 PASS | 21 / 23 PASS | 0 |
| **Milestone 3 (`fe406e5`)** — `#lb`/`#full` zoom race, stage swipe, mobile `.dial`, `doubleOut`, red-mode `--c` | **27 / 27 PASS** | **26 / 26 PASS** | **0** |

Checks verified: content guardrails (no forbidden text, Weird Kid muted, Momo triggers only on `#red` double-tap and CV credit, never `#corner`/`#disc`), edge-of-orb taps across 6 orbs (`spirit-eye`, `paddle`, `cup`, `sculpture`, `owtd`, `lost-in-time`), `sculpture` vs `owtd` tap isolation, `#rail` click & drag landing accuracy, `#ozdial` tap-to-open / star tap / arc drag, Lost in Time play button & audio playback, Shuffle + orb tap, `#ord` long-press radial fan (`#holdfan`) selection & teardown, `#lb` zoom / reset / 80ms mid-crossfade zoom, piece horizontal swipe (desktop + touch), `.wallbtn` (`all N`), 3D `.dial` angle drag (desktop + mobile), `doubleOut` step-back to `#sky`, `#red` single-tap home & double-tap Momo, `#disc` red-mode toggle, and `#canopy` zero-mint red-mode audit.

---

## 2. Gesture Handler & Pointer-Event Layer Map

### 2.1 Visual & Pointer Stacking Layers (bottom to top)

| `z-index` | Element | `pointer-events` | `touch-action` | Role & Notes |
|---:|---|---|---|---|
| `0` | `#stars`, `#wash`, `#atmos` | `none` | — | Starfield canvas, ambient wash, atmosphere mist/beam |
| `1` | `main` (`#sky`, `.plate` sections) | `auto` | `.stage`: `pan-y`, `#room`: `pan-y` | Vertical scroll-snap document (`html` has `scroll-snap-type: y proximity`) |
| `2` | `html.in .plate.is-cur`, `.plate .txt` | `auto` | inherit | Active piece plate; `z-index: 2` over `#sky` |
| `3–6` | `.dial .ticks`, `.plate.sound .vrail`, `.player .pp`, `.vidplay`, `.vidctl` | `auto` | `none` on rails/wave/ticks | In-plate controls (`#room a.st.is-sel` lifts to `z: 6`, `is-picking` lifts to `z: 8`) |
| `6` | `#redveil` | `none` | — | Safelight brightness veil |
| `20` | `#top` (bar) | `none` (children `auto`) | — | Header container (`#corner`, `#where`, `#findbtn`, `#airbtn`, `#esc`) |
| `20` | `#rail` | `none` on `#sky`, `auto` on `html.in` | `none` (`html.in`) | Right-edge work scrubber (`html.in` shows it; hidden when `railui="a"`) |
| `21` | `#allbtn`, `#ord` | `auto` | inherit | Top-right `all` circle and order/shuffle pill (`holdBind` radial fan triggers) |
| `34–36` | `#ozdial` (`z:34`), `.ozd-moon` (`z:36`), `.ozd-item` (`z:2/8`) | `#ozdial`: `none`, moon/items: `auto` (when `.held`) | `none` | Optional clock-arc thumb dial (`railui="a"`) |
| `35` | `#dimedge` | `auto` (18px left strip) | `none` | Left-edge brightness drag strip (active in red mode) |
| `40` | `#red`, `#disc` | `auto` | `none` | Bottom-left Mark (`#red`: home / swipe-down stepBack / dbl-tap Momo) & bottom-right safelight dot (`#disc`) |
| `41–45` | `#now` (`#savehint` at `41`) | `auto` | inherit | Floating Lost in Time mini-player |
| `56` | `#full` | `auto` when `.on` | `pan-x pan-y pinch-zoom` | Full-image overlay (currently unwired from `#room` taps) |
| `58` | `#moonslot` (`#moon`) | `none` (handle `auto`) | `none` | Draggable sky moon |
| `60` | `#lb` | `auto` when `.on` | `#lb .st`: `none` | Lightbox viewer (pinch/wheel zoom, pan, swipe) |
| `69–70` | `#wall` (`69`), `#all` (`70`), `#find` (`70`), `#redpad` (`70`) | `auto` when `.on` | `wgrid`/`ascroll`: `pan-y`, `redpad`: `none` | Gallery wall, all-works grid, search drawer, red brightness pad |
| `80` | `#tune`, `#holdfan`, `#ordtoast` | `#tune`: `auto`, `#holdfan`: `none` (buttons `auto`) | `#tune .tune-body`: `pan-y` | Deep Tune drawer & long-press radial option fan |
| `240` | `#subframe` | `auto` when `.on` | inherit | Embedded CV / Photo Lab iframe overlay |
| `99999` | `#momo-egg` (`momo.js`) | `none` | — | Momo sprite animation overlay |

### 2.2 Global & Capture-Phase Listeners, Timers, and Locks

| Handler | Target & Phase | Trigger / Threshold | Locks / Timers Read or Written | Potential Conflict Surface |
|---|---|---|---|---|
| `rememberTap` / `isGhostTap` | Helper (`site.js:12-25`) | Suppresses synthetic `click` within `450ms` & `42px` of a handled `pointerup` | `lastTap = {x, y, t, k}` | Must be called by every `pointerup` navigation/dismissal (`room`, `#rail`, `#ozdial`, `doubleOut`) and checked by underlying `click` targets (`img.main`, `a.st`, doc click) |
| `holdBind` | `#ord`, `#allbtn`, `#typebtn` (`site.js:193-242`) | `pointerdown` → `340ms` hold opens `#holdfan` (`window` capture `pointermove`/`pointerup`/`pointercancel`); release `<340ms` fires `opt.tap()` | `holdT` (340ms), `el._hbTap` | Previously leaked `#holdfan` when released off-element and recreated `items()` on `up()` so fan buttons never fired |
| `momo` tap-hide | `document` capture `click` (`momo.js:120`) | Dismisses `#momo-egg` on any tap except `#red` or `[data-egg="momo"]` | `momo.stage` | Exempts `#red` so double-tapping `#red` toggles Momo cleanly |
| `doubleOut` | `document` capture `pointerdown`/`pointerup`/`pointercancel` (`site.js:2431-2455`) | Two single-pointer releases within `320ms` & `28px` → `stepBack()` | Checks `GJ12._navLock`, `GJ12._openedAt < 450ms`; calls `rememberTap(e)` | Excludes interactive controls & `#room`; calling `rememberTap(e)` prevents tap 2's synthetic `click` from re-opening `#lb` |
| Global hash-link interceptor | `document` capture `click` (`site.js:2477-2491`) | Intercepts `a[href^="#"]` → `openPiece` / `goSky` | Skips `#rail` and `isGhostTap(e)`; checks `GJ12._navLock` | Previously bypassed `#rail`'s `railEl._skip` drag guard |
| Deep Tune two-finger hold | `document` `pointerdown`/`pointermove`/`pointerup` (`site.js:504-526`) | Two stationary non-mouse pointers for `1200ms` (drift `<14px`) | `tt` (1200ms) | Cancelled on pointer move or pinch distance change |
| `#room` drag / tap / pinch | `#room` (`site.js:1074-1166`) | `pointerdown`/`move`/`up`; drag `>10px`, tap `<10px` → `starFromEv` → `openPiece`; `pinchOn` `< pinchout` → `ALLV.open` / `exitAir` | `el._tapped`, `el._sw`, `GJ12._pinchUntil`, `GJ12._navLock` (350ms on `gotoPlate`), `GJ12._openedAt` | `pointerup` calls `rememberTap(e)` before `openPiece`; synthetic `click` on `img.main` underneath is blocked by `isGhostTap` + `_openedAt` |
| `#red` home / swipe-down / Momo | `#red` (`site.js:2356-2405`) | Down-drag `dy > 24px` → `stepBack()`; double-tap (`<360ms`) → `momoToggle()`; single-tap (`240ms` delay) → `goSky(true)` | `tapT` (240ms), `lastTap`, `lastMomo` (400ms dedupe) | `touch-action: none` + pointer capture prevents scroll hijack |
| `scroll` plate picker | `window` `scroll` (`site.js:1340-1359`) | Updates `CUR` & `html.in` from viewport-center plate | Gated by `GJ12._navLock` (350ms) and `scroll-snap-type: y proximity` | Previously raced with `gotoPlate()`/`goSky()` smooth scroll + layout shift |

---

## 3. Shared Root Causes (Why 78 Failures Clustered Together)

The 78 reported failures on `t-59e4ba58c34053ce5f55` did not stem from 78 independent bugs — they were cascading effects of **7 shared systemic defects**:

1. **Vertical document layout shift (+644px) colliding with `scroll-snap-type: y proximity` (`css/site.css:1199`, `js/site.js:1292, 2255`)**  
   `.strip` horizontal padding (`padding-left: 88px; padding-right: 72px`) was gated behind `html.in .strip`. Entering any piece from `#sky` added `html.in`, wrapping multi-thumb strips and increasing document height by **+644px** *after* `gotoPlate()` had already scrolled to `p.offsetTop`. One frame later, `scrollSnapType` was restored and snapped the viewport to the wrong neighbor plate (`#photo-lab` instead of `#lost-in-time`, `#scoop` instead of `#sculpture`, pushing Lost in Time's `.pp` off-screen). Meanwhile `goSky(true)` used `behavior: 'smooth'` against `scroll-snap`, stranding users on `#spirit-eye` (`scrollY ≈ 653–769px`).
2. **Missing ghost-tap / synthetic-click isolation across pointerup-driven layers (`js/site.js:1444, 2445, 2482`, `css/site.css:45`)**  
   Opening a piece from `#room` or dismissing an overlay via `doubleOut` ran inside `pointerup`, while `gallery()`'s `img.main` listener and the document capture-phase `click` listener fired on the trailing synthetic `click` without consulting `isGhostTap()`/`_openedAt`. On mobile, tapping an orb immediately opened `#lb` on top of the newly opened piece (`paddle`, `cup`, `sculpture`, `lost-in-time`); double-tapping closed `#lb` and immediately re-opened `#lb`; and `#rail` lacked `pointer-events: none` on `#sky`, catching stray right-edge clicks.
3. **Destructive DOM mutation (`innerHTML.replace`) inside `applyOrderDOM()` (`js/site.js:40-50`)**  
   Rewriting `kick.innerHTML` on startup and on every order/shuffle change destroyed the `<button class="pill wallbtn">` element and its click listener on every piece plate, making `all N` dead across the whole site.
4. **Orb hit-test geometry vs rendered visual bounds + missing cutout fallback (`js/site.js:76, 1074-1105`)**  
   `starFromEv()` tested against unclamped pre-collision `o._w` (up to 170px) instead of rendered size (`o._osE || o._s`) and returned early when `cutoutHit()` returned `false` (transparent pixel in `sculpture` cutout) or `null` (unloaded/404 cutout), letting nearby `owtd` steal `sculpture` taps. Simultaneously, `applyOrbShape()` re-assigned 404 cutout `src` on every `apply()`/`idle()`, wiping out `im._orbErrBound`'s fallback to `media/orbs/*.jpg`. And `room()` had accidentally dropped pinch-out (`sc < pinchout` → `ALLV.open()` / `exitAir()`).
5. **Broken pointer-lifecycle & state cleanup on controls (`holdBind`, `GJ12.reroom`, `#rail`, `#ozdial`) (`js/site.js:193, 393, 1182, 1192`)**  
   - `holdBind()` re-invoked `items()` inside `up()`, producing fresh objects with `it.el === undefined` so radial fan selections (`#ord`, `#allbtn`, `#typebtn`) never fired `it.fn()`, and only listened on `el` so releasing outside left `#holdfan` (`z: 80`) permanently stuck on screen.
   - `GJ12.reroom()` on Shuffle did not reset `drag`/`moved`/`_tapped` or run an immediate `draw()`/`go()`, leaving stale hit geometry or stuck drags.
   - `#ozdial` immediately folded on quick-tap release (preventing `.ozd-item` taps), leaked `.held` on desktop drag, and never rebuilt when work order/shuffle changed.
   - `#rail` drag initialized from `curIdx()` rather than pointer hit position and flung past targets via coast momentum.
6. **Lightbox/Fullview crossfade vs zoom race, desktop stage swipe, and mobile `.dial` collapse (`js/site.js:775-835, 1423-1452, 1538-1620`, `css/site.css:1194-1195`)**  
   - `fadeTo()` deferred setting `img.src = src` by 420ms via an overlay `img.xfade`; zooming during that window left `lbReady()` false or a frozen `xfade` layer on top of the zoomed image. `FULL`'s `fullFit()` also left zoom styles behind, and neither viewer fell back from missing `media/full/` to `media/photos/`.
   - Piece swipe only listened to `touchstart`/`touchend` on `img.main`, so horizontal mouse drag on desktop triggered `click` → `#lb` instead of advancing slides.
   - At `@media (max-width:899px)`, `.plate.hasdial .stage .dial { height: auto }` collapsed the absolutely-positioned 3D angle dial on `#cup` and `#scoop` to **`0px` tall** on mobile.
7. **Inline `--c` mint leak in red/safelight mode (`css/site.css:1475`)**  
   Per-piece inline `style="--c:170,245,212"` on `#canopy` (and `--c` on `#full`, `#wall`, `#all .ab`, `#rail a`, `#ozdial .ozd-item`) overrode inherited CSS custom properties, leaking mint into stage shadows, `.dial figure` glows, `.holding`, `.vrail`, `.grail`, and `#ozdial` dots under `html.red`.

---

## 4. Root-Cause & Fix Table

| failure | cause | fix | file and line |
|---|---|---|---|
| Clicking an orb jumps to the wrong piece (`#lost-in-time` → `#photo-lab`, `#sculpture` → `#scoop`), Lost in Time `.pp` off-screen | `html.in .strip` toggled horizontal padding only after `html.in` was added, shifting doc height +644px after `gotoPlate()` scrolled; `scroll-snap-type: y proximity` then snapped to the neighbor plate | Applied `.plate .strip` padding unconditionally; moved `setCur(p)` before `window.scrollTo` in `gotoPlate()` with 2-rAF `scrollSnapType` restore and 350ms `_navLock` | `review-cks17/css/site.css:1199`; `review-cks17/js/site.js:1292-1308` |
| Single-tap `#red` (home) lands on `#spirit-eye` (`scrollY ≈ 653–769`) instead of `#sky` (`scrollY = 0`) | `goSky(true)` used `behavior: 'smooth'` while `scroll-snap-type` remained active, snapping to plate 1 | Made `goSky()` scroll directly to `(0, 0)` with `scrollSnapType = 'none'` and 2-rAF snap restore, clearing `CUR` and `html.in` synchronously | `review-cks17/js/site.js:2255-2276` |
| Tapping an orb on mobile opens `#lb` lightbox immediately on top of the piece | `room()` navigated in `pointerup`, then trailing synthetic `click` hit `img.main` in `gallery()` with no `isGhostTap` or `_openedAt` guard | Added `GJ12.isGhostTap(e)` and `Date.now() - GJ12._openedAt < 450` guard to `gallery()` `img` click | `review-cks17/js/site.js:1444-1449` |
| Double-tap step-back on mobile closes `#lb` then immediately re-opens `#lb` (or misses if tapped at ~550ms) | `doubleOut` ran `stepBack()` on `pointerup` without `rememberTap(e)` (so tap 2's synthetic `click` hit `img.main`); `_navLock` of `600ms` ate tap 1 | Called `GJ12.rememberTap(e)` in `doubleOut` before `stepBack()`; aligned `_navLock` to `350ms` and `_openedAt` guard to `450ms` | `review-cks17/js/site.js:1298, 2260, 2441-2450` |
| `.wallbtn` (`all N`) dead on every piece page | `applyOrderDOM()` ran `kick.innerHTML = kick.innerHTML.replace(...)`, destroying the `<button class="pill wallbtn">` node and its click listener | Replaced `innerHTML` rewrite with text-node-only mutation (`cn.nodeType === 3`) | `review-cks17/js/site.js:40-49` |
| Cover edge taps miss orbs; tapping `sculpture` opens neighbor `owtd`; orb images revert to broken 404 cutouts | `starFromEv()` used unclamped `o._w` and skipped cutout orbs when `cutoutHit` returned `false`/`null`; `applyOrbShape()` re-assigned failing cutout URLs on every `apply()`/`idle()` | Added `ORB_CUT_FAIL` cache in `applyOrbShape()`; rewrote `starFromEv()` as two-pass hit-test using rendered size/center (exact opaque cutout or visible label first, nearest rendered circle second) | `review-cks17/js/site.js:68-85, 1074-1105` |
| Pinch-out on `#sky` no longer opens `#all` or exits Air | `room()` `pinchOn` dropped the `sc < pinchout` branch compared to base `t-ba3fa6055c92ff897c45e7` | Restored `sc < (+val('pinchout') || .76)` branch in `room()` `pinchOn` to exit Air or open `ALLV.open()` | `review-cks17/js/site.js:1160-1166` |
| Long-press `#ord`/`#allbtn`/`#typebtn` radial fan (`#holdfan`) never runs selected item and gets stuck open on screen; `#allbtn` double-fires | `holdBind` re-called `items()` in `up()` (losing `it.el` references), only listened on `el` (missing off-element `pointerup`), fired `tap()` on `pointercancel`, and `#allbtn` had a duplicate click listener | Snapshotted `curItems` when opening fan; bound `window` capture `pointermove`/`pointerup`/`pointercancel`/`blur`; cancelled cleanly without tapping on `pointercancel`; removed duplicate `#allbtn` click listener | `review-cks17/js/site.js:193-242` |
| Constellation freezes or ignores orb taps after switching order / Shuffle | `GJ12.reroom()` left stale `drag`/`moved`/`_tapped`/`is-sel` state, did not run synchronous `draw()`/`go()`, and `apply()` triggered a duplicate `reroom()` | Reset gesture state in `GJ12.reroom()`, forced synchronous `draw()` + `go()`, and added `_skipReroom` guard inside `apply()` | `review-cks17/js/site.js:50, 64, 1182-1187` |
| `#rail` intercepts clicks on `#sky`, drags overshoot to wrong work (`cv`), or capture click bypasses drag guard | `#rail` had `opacity: 0` on `#sky` with no `pointer-events: none`; drag started from `curIdx()` + coast velocity; document capture `click` intercepted `#rail a` before `railEl._skip` | Added `pointer-events: none` on `#rail` (`auto` on `html.in`); tracked `hitRail(e)` directly with `window` listeners and `rememberTap`; excluded `#rail` from document capture `click` | `review-cks17/css/site.css:45-46`; `review-cks17/js/site.js:1192-1231, 2477-2491` |
| `#ozdial` thumb dial cannot tap stars, leaves `.held` stuck on desktop, and desyncs labels after Shuffle | `moon` folded immediately on quick-tap `pointerup`; no `window` release listeners or outside-tap fold; `rebuild()` only checked child count (`!== n`) | Added `orderKey` check in `render()`, `goById()` navigation, `window` pointer listeners + outside-tap fold, and quick-tap toggle keeping constellation open for star taps | `review-cks17/js/site.js:393-498` |
| Lightbox (`#lb`) / Fullview (`#full`) zoom fails or shows stale `xfade` overlay when zooming right after switching photos | `fadeTo()` delayed `img.src` swap by 420ms via `img.xfade`; `lbReady()` stayed false; `fit()` left `_nw/_nh/_fit`; `fullFit()` left inline size/transform; no `media/full/` → `media/photos/` error fallback | Added persistent `load`+`error` fallback handlers, `flushLbXfade()`/`flushFullXfade()` on zoom start, immediate arming when cached, full property reset in `fit()` and `fullFit()` | `review-cks17/js/site.js:775-835, 1538-1620` |
| Swiping sideways on a piece does nothing on desktop and opens `#lb` on mouse release | Swipe only listened to `touchstart`/`touchend` on `img.main`; browser native image drag or `mouseup` `click` triggered `LB.open()` | Replaced with `.stage` horizontal pointer swipe (desktop + touch, skipping controls & active 3D `.dial`), set `img.draggable = false`, and set `img._sw = Date.now()` | `review-cks17/js/site.js:1423-1452` |
| 3D angle dial (`.dial`) on `#cup` and `#scoop` is invisible (`height: 0px`) and undraggable on mobile (`<= 899px`) | `@media (max-width:899px)` set `.plate.hasdial .stage .dial { height: auto }`, collapsing a container whose children are all `position: absolute` | Gave `.plate.hasdial .stage .dial` an explicit responsive height (`min(calc(var(--vh)*.58), ...)`, `min-height: 240px`) on mobile while keeping `.stage` `height: auto` | `review-cks17/css/site.css:1194-1195` |
| Mint (`170, 245, 212`) leaks in red/safelight mode on `#canopy` stage glow, rails, `.dial`, `#full`, `.holding` | Inline `style="--c:170,245,212"` on `#canopy` (and `--c` on `#full`/`#wall`/`#all .ab`/`#rail a`/`#ozdial .ozd-item`) had higher specificity than inherited red tokens | Overrode `--c: 255,68,87 !important` under `html.red` on all `--c`-scoped containers and added `html.red .holding`; `#disc i` (uses `--mint`) intentionally stays mint | `review-cks17/css/site.css:1475-1476` |

---

## 5. Remaining Risks & Policy / Asset Gaps (Documented, Not Altered)

1. **White Noise / `#airbtn` policy gap (`review-cks17/js/atmos.js`)**:  
   In this snapshot, `#airbtn` on `#sky` still toggles visual Atmosphere **and** ambient Web Audio white noise together, rather than restricting White Noise solely to when *Lost in Time* ends. Per hard constraints ("never change visible wording", small/safe fixes only), `#airbtn` was left intact and not stripped out; separating visual atmosphere from end-of-track White Noise requires an intentional UX/product change to `atmos.js` + `player()` `ended` handler.
2. **Missing static assets referenced by `cks17` (`media/orbs/cut/*.png`, `media/egg/momo-sprite.png`, updated `cv/index.html`)**:  
   - `review-cks17/js/site.js` references `media/orbs/cut/*.png` cutouts, which are not present in `review-cks17/` or the sibling preview snapshots (`t-06850fb9ac595e27ab8672/`, `t-ba3fa6055c92ff897c45e7/`). With the `ORB_CUT_FAIL` cache fix, orbs now cleanly and permanently fall back to their sharp `media/orbs/*.jpg` / `media/photos/*` covers without repeated 404s.
   - `review-cks17/js/momo.js` loads `media/egg/momo-sprite.png` (missing from this repo snapshot, so `momoToggle()` triggers cleanly and `momo.js` logs no errors, but the sprite image 404s until deployed alongside `media/egg/momo-sprite.png`).
   - The sibling `cv/index.html` does not yet include `[data-egg="momo"]`; `momo.js` and `GJ12.momoBindFrame` are wired ready for it.
3. **Unwired `#full` four-step viewer (`review-cks17/js/site.js:772-852`)**:  
   `FULL.open()` is still never invoked from `#room` taps (tapping an orb goes directly to the piece plate). Its zoom/reset/error-fallback lifecycle is hardened so it is safe if wired later.
4. **iOS Safari `HTMLAudioElement.volume` read-only (`review-cks17/js/site.js:1693`)**:  
   The `.vol` slider on `#lost-in-time` sets `au.volume`, which iOS Safari ignores; routing `<audio>` through Web Audio `GainNode` was intentionally deferred because of iOS background/lock-screen playback tradeoffs.
5. **High-DPR strip `srcset` (`review-cks17/index.html`)**:  
   Strip buttons still list `1600w` `media/photos/` candidates alongside `440w` thumbs at `sizes="160px"`, causing 3× DPR phones to fetch full photos for thumbnails; left untouched to avoid bulk HTML edits.
6. **Untested real-device gestures**:  
   Headless Chrome verified mouse, wheel, Ctrl+wheel zoom, and single-touch tap/drag/swipe, but real multi-touch iOS Safari / Android Chrome pinch-to-zoom, rubber-band overscroll, and background audio unlock should still be manually QA'd on physical hardware.

---

## 6. Commits on `review/cks-gestures-neon`

- `cb88bad` — Fix plate navigation layout shift, ghost-tap bleed-through, and wallbtn listener
- `f351afe` — Fix orb hit-testing, holdfan lifecycle, shuffle reroom, rail drag, and ozdial
- `fe406e5` — Fix lightbox/full zoom crossfade race, stage swipe, mobile dial height, doubleOut ghost-tap, and red-mode --c mint leaks
- *(this commit)* — Update `review-cks17/REVIEW.md` with gesture layer map, shared root causes, and fix table
