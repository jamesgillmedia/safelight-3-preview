/* voiceProfile — public contract only (Tone Check intent targets and practice prompts).
   The room talks to this through oz.private.get('voiceProfile'). */
(function (root) {
  'use strict';

  var CONTRACT = {
    name: 'voiceProfile',
    methods: ['getTargets', 'getPrompts', 'source', 'listIntents'],
    intents: ['calm', 'warm', 'firm', 'excited'],
    sources: ['generic', 'personal'],
    levels: ['sentence', 'moment', 'all'],
    coarse: {
      pace:   { band: ['slower', 'moderate', 'steady', 'quicker'] },
      pitch:  { movement: ['low', 'gentle', 'full'], endRise: ['low', 'gentle', 'more'] },
      volume: { level: ['medium-low', 'medium', 'fuller'], variation: ['low', 'moderate'] },
      pauses: { frequent: ['fewer', 'moderate'], length: ['shorter', 'comfortable', 'longer'] }
    }
  };

  function inList(list, v) { return list.indexOf(v) !== -1; }

  // True when an object has the shape of a target result (coarse labels only).
  function isTargets(t) {
    if (!t || typeof t !== 'object' || typeof t.intent !== 'string') return false;
    if (!inList(CONTRACT.sources, t.source)) return false;
    var b = t.bands, c = CONTRACT.coarse;
    if (!b || !b.pace || !b.pitch || !b.volume || !b.pauses) return false;
    return inList(c.pace.band, b.pace.band) &&
      inList(c.pitch.movement, b.pitch.movement) && inList(c.pitch.endRise, b.pitch.endRise) &&
      inList(c.volume.level, b.volume.level) && inList(c.volume.variation, b.volume.variation) &&
      inList(c.pauses.frequent, b.pauses.frequent) && inList(c.pauses.length, b.pauses.length);
  }

  // True when an object has the shape of a prompt.
  function isPrompt(p) {
    return !!p && typeof p.id === 'string' && typeof p.text === 'string' &&
      typeof p.intent === 'string' && (p.level === 'sentence' || p.level === 'moment') &&
      inList(CONTRACT.sources, p.source);
  }

  // True when an object answers every call the room makes.
  function implementsContract(impl) {
    if (!impl) return false;
    for (var i = 0; i < CONTRACT.methods.length; i++) {
      if (typeof impl[CONTRACT.methods[i]] !== 'function') return false;
    }
    return true;
  }

  var api = { CONTRACT: CONTRACT, isTargets: isTargets, isPrompt: isPrompt, implementsContract: implementsContract };
  root.ozVoiceProfileInterface = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
