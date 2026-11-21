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
