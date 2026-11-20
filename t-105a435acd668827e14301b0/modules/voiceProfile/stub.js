/* voiceProfile — public stub. Generic preview targets and the generic starter prompts.
   It does not learn from recordings, store a baseline, or identify the speaker. */
(function (root) {
  'use strict';

  var INTENTS = ['calm', 'warm', 'firm', 'excited'];

  function bands(paceBand, paceLabel, movement, endRise, pitchLabel, level, variation, volLabel, frequent, length, pauseLabel) {
    return {
      pace:   { label: paceLabel, band: paceBand },
      pitch:  { label: pitchLabel, movement: movement, endRise: endRise },
      volume: { label: volLabel, level: level, variation: variation },
      pauses: { label: pauseLabel, frequent: frequent, length: length }
    };
  }

  var TABLE = {
    calm:    bands('slower', 'slower', 'low', 'low', 'smaller, even', 'medium-low', 'low', 'even, not loud', 'moderate', 'longer', 'a little longer'),
    warm:    bands('moderate', 'moderate', 'gentle', 'gentle', 'gentle', 'medium', 'low', 'even to soft', 'moderate', 'comfortable', 'comfortable'),
    firm:    bands('steady', 'steady', 'low', 'low', 'flatter, settled ends', 'medium', 'low', 'even', 'fewer', 'shorter', 'a little shorter'),
    excited: bands('quicker', 'quicker', 'full', 'more', 'full', 'fuller', 'moderate', 'a little fuller', 'moderate', 'shorter', 'a little shorter')
  };
  var OTHER = bands('moderate', 'moderate', 'gentle', 'gentle', 'gentle', 'medium', 'moderate', 'even', 'moderate', 'comfortable', 'comfortable');

  var PROMPTS = [
    ['p01', 'warm', 'sentence', "I'd love to work with you."],
    ['p02', 'firm', 'sentence', "That doesn't work for me."],
    ['p03', 'calm', 'sentence', "Thanks for waiting. I'm here now."],
    ['p04', 'excited', 'sentence', "I'm really looking forward to this."],
    ['p05', 'calm', 'sentence', 'Can we pick this up tomorrow?'],
    ['p06', 'firm', 'sentence', 'I need a little more time.'],
    ['p07', 'warm', 'sentence', "That's great news. Congratulations."],
    ['p08', 'firm', 'sentence', "I don't agree, and I'd like to explain why."],
    ['p09', 'calm', 'sentence', 'Let me think about that and come back to you.'],
    ['p10', 'calm', 'sentence', "Here's what I can do instead."],
    ['p11', 'warm', 'sentence', 'I was so glad to hear from you.'],
    ['p12', 'calm', 'sentence', "Let's keep this simple and start with the first step."],
    ['p13', 'firm', 'sentence', 'I hear you, and I still need this to change.'],
    ['p14', 'warm', 'sentence', "Take your time. I'm not in a rush."],
    ['p15', 'warm', 'sentence', 'I think we can make this work together.'],
    ['p16', 'calm', 'sentence', "That's not quite right. Let me say it another way."],
    ['p17', 'warm', 'moment', 'Hi, thanks for taking the time to talk. I wanted to walk you through where things stand.'],
    ['p18', 'firm', 'moment', "I appreciate the offer. I can't take this on right now."],
    ['p19', 'warm', 'moment', "I've been working on something I'd like to show you. It started as a small idea, and I think it's ready to share."],
    ['p20', 'calm', 'moment', "I can start next week if that helps. Tell me what you'd like to see first, and I'll come back with a clear plan."]
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function cleanIntent(intent) { return String(intent == null ? '' : intent).trim().toLowerCase(); }

  var stub = {
    stub: true,
    label: 'generic · preview stub',
    source: function () { return 'generic'; },
    listIntents: function () { return INTENTS.slice(); },
    getTargets: function (intent) {
      var key = cleanIntent(intent);
      var b = Object.prototype.hasOwnProperty.call(TABLE, key) ? TABLE[key] : OTHER;
      return Promise.resolve({ intent: key, source: 'generic', preview: true, stub: true, bands: clone(b) });
    },
    getPrompts: function (opts) {
      opts = opts || {};
      var intent = opts.intent ? cleanIntent(opts.intent) : null;
      var level = opts.level || 'all';
      var list = PROMPTS.filter(function (p) {
        return (!intent || p[1] === intent) && (level === 'all' || p[2] === level);
      }).map(function (p) {
        return { id: p[0], text: p[3], intent: p[1], level: p[2], source: 'generic', preview: true };
      });
      return Promise.resolve(list);
    }
  };

  // Hand the stub to the private register the same way the other public stubs are installed.
  root.ozPublicStubs = root.ozPublicStubs || {};
  root.ozPublicStubs.voiceProfile = stub;
  var reg = root.oz && root.oz.private;
  if (reg && typeof reg.installStub === 'function') reg.installStub('voiceProfile', stub);

  if (typeof module !== 'undefined' && module.exports) module.exports = stub;
})(typeof window !== 'undefined' ? window : globalThis);
