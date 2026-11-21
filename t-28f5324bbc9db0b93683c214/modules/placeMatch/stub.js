/* placeMatch · PUBLIC PREVIEW STUB (INTERFACES.md §12). Always "coast", with plain default layers and the label
   "preview stub · example place". A kind picked in the room's own picker overrides it. No network, no place rules. */
(function (G) {
  'use strict';
  var stub = { stub: true, match: function () { return Promise.resolve({ kind: 'coast', label: 'preview stub · example place',
    layers: { atmosphere: 'calm', stars: 'some', fog: 'off', water: 'ripples', wind: 'breezy', grain: 'off' } }); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('placeMatch', stub);
})(window);
