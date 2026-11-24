/* grantAssist — public contract only (Grant room, 23 Nov 2026). An optional writing helper the Grant room can ask, only
   when Gill asks for a suggestion. It may run in the cloud; while it does, F3 is lit. It never writes into the draft: the
   room shows what it offers and waits for a yes.
     available() → bool · where() → 'device' | 'cloud' · suggest({ section, text, ask, spine }) → Promise<{ offers: [{ kind, text, why }], stub? }> */
(function (root) { 'use strict';
  var CONTRACT = { name: 'grantAssist', methods: ['available', 'where', 'suggest'] };
  root.ozContracts = root.ozContracts || {}; root.ozContracts.grantAssist = { contract: CONTRACT };
})(window);
