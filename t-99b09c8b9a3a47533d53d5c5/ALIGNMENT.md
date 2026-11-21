# oz opening v7 · how it lines up with the principles

Prototype only. noindex. Built from v5.2, not v6. Each line: the principle, then met / partly / not yet, and how.

## Gill's v7 asks (20 Nov, 11:07–11:11 PM)
- Distinctly oz, no iPhone look-alike — met. Star sky, hairlines, forced-perspective dot depth, refined red, labelled star constellations. No icon rows, no widget grid, no jiggle editing.
- At rest almost empty — met. The time, one quiet line (the timer if one is running, otherwise Good Weather's next light), the dot, and the oz corner. The moon rests small and faint. Everything else is hidden.
- Appears when needed — met. Touch the right edge and a small labelled constellation of your places unfolds under your finger. Turn it, lift to go. Tap leaves it open; tap the sky or wait a few seconds and it folds.
- Reach from the bottom middle — changed, on purpose. The brief keeps the bottom for the time and names the right-edge camera dial as the main control, so the same gesture (touch, slide, lift) lives on the dial instead of a new launcher. Easy to move to the bottom middle if Gill wants it.
- Search floats over the room when you pull down — met. It works on the home sky and in any room, with the room still faintly behind it.
- Controls fade after a few seconds of no touch — met. Tune, status, the dimmer line and the dial mark fade after about 3 s and come back at a touch. Room buttons dim but stay usable.
- One gesture to reach anything — met. Touch, turn, lift on the dial.
- The hint is shown once — met. One line beside the dial on the first run, then never again.
- The oz corner always takes you home — met, from any room, the sky, search or the noise room.
- Boot about 1–1.5 s, the constellation forms and settles, no corner glitch — met. About 1.3 s. The corner never moves: an rAF trace shows one position on every frame, in both motion settings.
- Noise glide kept — met. White noise on the dial runs the same camera glide into the latest noise room (NOISE_ROOM points at noise v6 in v7.1); back reverses it.
- Reduce Motion parity — met. Every move becomes a cross-fade. Nothing cuts and nothing is lost.
- Never lost: always a faint sense of where you are — met. Top = where you are: the room's name stays at the top and the oz corner is always there. The dial's front star is "here" (or "timer · here" inside a room).
- Continuous camera moves, no hard cuts — met. Going deeper zooms through the star you chose; back is the same move reversed. Room-to-room passes through the dial star. Reduce Motion cross-fades.
- Every move undoes with one gesture back — met. System back or edge swipe, the left-edge flick, or Escape. Room to room, back returns to the room you came from. Search, the sky and the noise room each undo in one step.

## Ground rules and interaction (master brief)
- Never alter images — met. There are no photos on the opening or in these rooms, and nothing here tints media.
- On-device, offline, nothing leaves — met. No requests leave the page; fonts and rooms are local.
- Motion subtle, always present, only with a purpose — met. The star sky breathes and drifts slowly at depth, the depth grid follows tilt or touch, and the dial unfolds and turns. All of it goes still with Reduce Motion.
- The camera dial is the main control — met as a prototype. Turn to move between places, lift to go, double-tap the dial for home. Settings sit on its inner ring (tune, Essentials). A small hub mark sits at its centre.
  - Not yet: fast-turn fling with momentum, and hold to push in.
- Pinch out rises a level, pinch in goes deeper — met. Out goes room → home → the sky. In goes the sky → home → the place that matters now.
- Red mode is one tap on the mint dot — met. The dot is the only mint; dials use the ink colour.
- Hit targets at least 44 pt — met for every star, label and control.
- Text no brighter than #e8e4dc — met. The brightest text and control colour is #e8e4dc; the highlight is the dimmer cream-gold, and red mode is refined red.
- Three control tiers — partly. This opening exposes User settings only; nothing owner-only ships.
- Standing rule for every dial: intuitive, auto-hide, step back over what it changes — met.
  - The camera dial hides at rest; while it is open the time, the line and the room behind dim back.
  - The Moon dial shrinks at rest, and its orbit steps back while the weather it chose comes in.
- Opens on black with "I am", the handset glyph and the mint dot — met. The sky follows.
  - Not yet: layers staying hidden until the owner enters (ringer-dial code or Face ID). This prototype has no lock.
- A first-use teaching line on the home sky only — met. It sits beside the dial, never over the moon, the time or a room.

## The Moon dial
- The crescent is the Moon dial, floating and separate from the camera dial — met. Its job is one no other dial has: the light around you (clear, rain, snow, fog, white noise, plus bright, dim and dimmer).
- Hold opens the orbit under the finger; slide onto a star and let go — met.
- Tap opens and it stays — met.
- A touch outside, the corner or a few quiet seconds folds it — met.
- Drag moves it, snaps to an edge and remembers — met.
- Shrinks after a rest delay, comes back at a touch — met.
- Partly: the orbit is one tilted 3D ring plus an inner light row, not the full seven rings.
- Not yet: the finder gesture, lock position, and turning the ring by dragging.

## Principles from 19 November
- oz adapts per person — met. Every place you open is counted on this phone. The dial puts what you use most nearest "here", and what you stop using fades (a one-week half-life). Nothing leaves the phone.
- Essentials mode, one switch — met. It is on the dial's inner ring and in tune. It turns off the moon, the dimmer and the hint, and the dial keeps only your top three places.
- Share this tool, standalone free tools — not part of the opening.
- Copy sounds like Gill — partly. The words are short and lowercase, but the voice pass has not been applied.

## F1 / F3
- F1 at rest — met. The calm dotted oz constellation is in the corner, with no bright star.
- F3 lights only while something leaves the phone — met. The one bright star at the corner lights only while one of oz's own requests goes off the phone. In this prototype nothing does, so it stays dark.
  - Not yet: holding the lit star to see what is leaving.

## Familiar first
- Familiar gestures (touch, slide, lift; pull down to search; back; pinch) without copying the iPhone home screen — met. No icon grid, no dock row, no widgets.

## v7.4 (21 Nov): openings to compare, and more switches
- Opening on black with "I am", the handset and the mint dot: partly, by choice. "I am" and "all 3" open that way. "oz" (the default, Gill's pick) and "local" open on black with the mint dot and their own mark, like the earlier oz boots.
- F1 at rest: met. With "local", "all 3" or the top bar on, F1 (the local check, a dotted arch) sits in the status bar, where signal would be. The corner keeps the oz constellation.
- Reduce Motion parity: met. Each opening tells the same story with fades. Marks form where they start, fade, and fade in at home. Nothing moves and nothing cuts.
- No corner glitch: met. The corner is the same element throughout.
- Bottom = time: kept by default. "Where your places sit: bottom" is an option to try.
- Things appear when needed: met. Controls fade after 2 s, 3 s (default) or 6 s, or stay. The moon at rest can be small (default), hidden or full. The quiet line can be turned off.

### Added at 7:39–7:41 AM (all off by default, all switches in tune → opening and in the quick sheet)
- Top bar: the time and a tiny quiet count. Pull down from the top edge, or tap the bar, to open the quick sheet: dark glass in the chosen text look (amber by default). It holds status (online, do not disturb, walking), the quiet notifications (only what is really on the phone: a running timer, good weather, a note), the red mode dot and light, white noise, the timer, and the comparison switches. Back closes it. Search is still a pull down from the middle of the sky. Text stays no brighter than #e8e4dc. The bar shows only on the home screen, so it never covers a room's title.
- Home line: a thin line at the bottom. Swipe up to go home. It is faint in rooms and only shows at home when you touch. Familiar gesture, oz styling.
- Dock (three ways, none of them an icon row):
  - "with dial": your places rise as a quiet arc along the bottom only while the camera dial is open, and fade with it.
  - "arc": the same arc of places along the bottom, mirroring the dial. It appears when you touch and fades with the other controls.
  - "stars": v5's labelled icon constellation (the dock Gill asked for at 8:45 PM), unfolding from the bottom middle hairline.
  - The rejected v6 row with widget tiles is not used.

## v7.5 (21 Nov, 8:03 AM): make way, and my picks
- Make way, ported from the ghost-arc dial (gill-sky proto-shell aced1af3, Nov 12; share/dial-protos-1113/module/dial.js, "avoid-rects"). There, the arc picked a free edge, never sat on the player, and the tune drawer stepped aside. Here, whatever is open (the camera dial, the moon's orbit, the stars dock, the quick sheet, tune, search) registers what it covers. The moon, the time, the dock, the hint, the top bar and the home line glide out of the way on a soft spring and come home when it closes. When there is no clear spot nearby, the thing fades instead (the time only steps back to a ghost, so it is never gone). Reduce Motion parity: met. With Reduce Motion they fade out, jump while unseen, and fade in. Nothing slides.
- Defaults = my picks, applied once (P.v75): opening oz, top bar on (quiet count and status; no time there), time at the bottom, home line on (in rooms only), dock with the dial, places on the right edge, controls fade after 3s, small moon at rest, quiet line on, make way on. Tune → my picks shows them with reasons, and "use my picks" resets to them. A dot marks each pick in the switches. Every other choice stays for comparison.
- Edges kept: right = dial, left = light, bottom = time, top = where you are (the bar).
- Fixed from v7.4: the arc dock's full-screen layer took touches over the moon and the dial while it showed. Now only the places take touches.

## v7.6 (21 Nov, 8:27 AM): intuitiveness audit fixes
- Nothing moves under a finger. Make way now only fades what an open thing covers, in place, and brings it back when that thing closes. Nothing slides. Whatever is under your finger keeps its state until you let go. Reduce Motion parity: met, since it was fades only to begin with.
- The open dial or moon orbit counts as one area, lines included, so the moon ghosts in place (12%) instead of moving in among the lines.
- Tune is back where v7.4 users learned it, at the top next to the bar, after a touch. The top pull no longer takes it.
- Settings open on the switches again, as in v7.4. "Back to my picks" sits at the end of the opening section with undo, and "why these picks" sits under it. A dot still marks each pick.
- The dock pick is the arc. Your first touch shows your places along the bottom, where every phone keeps them. The arc steps away while the dial, the moon or the quick sheet is open, so there are no duplicates and no overlaps.
- One clock. The big time at home stays at the bottom (bottom = time). In rooms, where there is no big clock, the bar shows the time small at the right.
- First use also teaches the top pull: "pull down from the top · quick settings".
- The v7.6 picks touch only the opening layout, once. Looks, red-mode text and the other switches are left alone. v7.5's reset of those is removed.
