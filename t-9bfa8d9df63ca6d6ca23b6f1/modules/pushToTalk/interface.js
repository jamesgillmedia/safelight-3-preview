/* pushToTalk — public contract only (Push Radio, 23 Nov 2026). The bridge to Apple's PushToTalk framework
   (PTChannelManager) in the native iPhone app: restore the channel at launch, join from a foreground tap, the system
   Push to Talk UI (Lock Screen, headset and CarPlay buttons), and the incoming-audio path. A web page cannot reach it,
   so the web build runs on the stub. The native side calls back into the room for one decision only:
     decide({ from, allowed, quiet }) → 'live' (activate the remote participant, play hands-free)
                                      | 'request' / 'clip' (no hands-free playback; it waits in the thread)
     available() .......... true only inside the native app with the capability
     restore() ............ re-join a channel that was joined before (called at launch)
     join({ name }) ....... from an explicit foreground tap · leave() · joined()
     on('incoming', fn) ... fn({ from, push: 'apns' | 'local' })   an APNs wake lights F3; a Local Push Connectivity wake does not */
(function (root) {
  'use strict';
  var CONTRACT = { name: 'pushToTalk', methods: ['available', 'restore', 'join', 'leave', 'joined', 'on'], results: ['live', 'request', 'clip'] };
  root.ozContracts = root.ozContracts || {}; root.ozContracts.pushToTalk = { contract: CONTRACT };
})(window);
