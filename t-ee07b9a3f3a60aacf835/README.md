# oz web pack (fixed2, as on the phone)

This is a runnable web app version of oz, built from the approved fixed2 Home (the oz-open build with start-up length and the Opening settings). That Home matches the fixed2 files frozen on 22 Nov 2026, the same three files documented as matching the approved phone Home. Sibling rooms, fonts, and core files are included so the app runs in a browser. Private material has been taken out so someone else can use it and bring together the features Gill loved.

## Reduce Motion

oz IGNORES the iPhone Reduce Motion setting. The app must move the same with it on. Test this pack with Reduce Motion emulated on (for example, a Playwright or Chrome context with `prefers-reduced-motion: reduce`). Do not treat a quiet-looking sky as proof that motion is off. Check the timer, the dial, White Noise, and room moves with Reduce Motion still emulated.

In this build's settings, the motion row is still labelled "reduce motion". That switch is oz's own still-sky choice. It is not the iPhone setting, and it stays off by default.

## How to open it

From this folder:

    python3 -m http.server 8765

Then open http://127.0.0.1:8765/ in a browser. That goes to the Home Screen (`apps/oz-open/`). A phone-sized window (390 x 844) is the closest match. Opening files directly can work for a first look, but a local server is the reliable way (fonts, audio, and rooms load correctly).

Nothing in this pack is published or installed by itself. It is a local web app.

## What he loved (keep these together)

- The Opening settings, as on the phone: boot (oz / I am / local / all 3), start-up length (normal / longer / longest), home dial (moon double-tap / off), top bar, the time (bottom / top bar), home line in rooms, dock (off / with dial / arc / stars / swipe up), dock labels, your places (right edge / bottom), controls fade (2s / 3s / 6s / stay), moon at rest (small / hidden / full), the quiet line, make way, see the opening again (replay), and back to my picks (use).
- The top bar: quiet count and status (for example, "2 quiet · do not disturb").
- The production timer, with a lighting setup estimate. Opening Timer from Home goes to that room. While it runs, the slate readout is in the top bar (js/readout.js).
- White Noise: the dimmer, a touch on the scene, and atmosphere in the noise room.
- The moon dial.
- Red mode. Photos stay untinted, except in Full red.
- Good Weather, and golden hour.
- The archive and the reel rail.
- The sky player (Lost in Time is bundled).
- The Mark as live text, including the syllabics ᑕᐣᓯ in the room bar.
- Tuning controls, and A / B style picks in settings.

## What else is in it

Home and the sky, the dial and the dock, the red-dot pad, Phone and the Circle, Ask (local), Notes, Messages (local preview), and later rooms as stand-ins where the real engines are not included. Circle starts empty of real contacts.

## What was taken out

- Private engines are simple stand-ins, so the app still runs. They hold no real method.
- No keys, tokens, pairing material, or outbound Ask address.
- No family layer, and no private photos.
- Messages has no real people.
- The pack never describes a bootable system, and it does not use that wording.
- Later Home experiments (hold-to-edit dock, 80s mode overlay, depth-glass) are not in this pack. Those were on a later web preview, not the approved fixed2 Home.


## Shrink a zip

A small tool next to shrink a clip. You pick a zip or a folder that is too big to send, choose a target size, and it gives back a smaller zip. Everything happens on the device. Nothing is uploaded. The original is never changed. Photos are only resized and re-saved, never graded. Open it from Home, from a hold on the Mark (More), from the map (Make), or with `?tool=zip`.

## Notes

The signed iPhone app is not in this pack. Native phone jobs (the real call sheet, the home-screen icon, a widget) are not here. White Noise is the oz-noise room, loaded in place. Good Weather and the sky player open as rooms in the oz app, next to the production timer.
