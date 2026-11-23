/* pushRadioRoute — public contract only (Push Radio, 23 Nov 2026). The one router: local first, internet only if the
   person allowed it. The room talks to this through oz.private.get('pushRadioRoute'); the real router is an in-house
   module, connected at build time. Here: the shape only, so the room and the stub agree.
     paths ........ 'local' (tier 1 · phone to phone, Bluetooth + peer-to-peer Wi-Fi, ~100 m, F3 dark)
                    'lora'  (tier 2 · a pocket LoRa radio over BLE, later)   'ham' (tier 3 · a licensed handheld, later)
                    'relay' (Test with me · an internet relay to the Artist Agent, F3 lit)   'internet' (only if allowed, F3 lit)
     reach() ...................... → [{ id, path, inReach, example? }]   who is in reach, and on which path
     join() / leave() ............. the channel (joined only from an explicit foreground tap; never re-prompted)
     startTalk({ to }) ............ → { stop() → Promise<{ ms }> }   hold to talk: a live stream to `to` ('channel' or a person id)
     on('incoming', fn) ........... fn({ from, live: Stream|null, clip: Blob|null, request: bool, path })
     on('reach', fn) .............. fn(reach())
     allowInternet(bool) .......... routing may use the internet (APNs wake, relay); every use lights F3
     relay(bool) .................. Test with me: the labelled opt-in relay to the Artist Agent
   Whatever the path, the same sealed thread continues (sealing is messageCrypto's). */
(function (root) {
  'use strict';
  var CONTRACT = { name: 'pushRadioRoute', paths: ['local', 'lora', 'ham', 'relay', 'internet'],
    methods: ['reach', 'join', 'leave', 'joined', 'startTalk', 'on', 'allowInternet', 'relay', 'tiers'] };
  function isRouter(r) { return !!r && CONTRACT.methods.every(function (m) { return typeof r[m] === 'function'; }); }
  root.ozContracts = root.ozContracts || {}; root.ozContracts.pushRadioRoute = { contract: CONTRACT, isRouter: isRouter };
})(window);
