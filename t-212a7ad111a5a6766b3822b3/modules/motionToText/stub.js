/* motionToText · PUBLIC PREVIEW STUB (INTERFACES.md §14). A short, obviously fake description and a two-line diff, both
   marked "preview stub". It looks at nothing and calls nothing. */
(function (G) {
  'use strict';
  var stub = { stub: true,
    describe: function (o) { var md = '# design log · ' + (o.buildId || 'this build') + '\n\n*preview stub · not a real description*\n\n- the sky · a night wash, constellations drifting · preview stub\n- the dial · a turn on the right edge, the value on a plate · preview stub\n';
      return { markdown: md, json: { stub: true, sweepId: o.sweepId || null, buildId: o.buildId || null, frames: [{ moment: 'sky', text: 'preview stub' }] }, stub: true }; },
    diff: function (o) { var md = '# kept / lost / new / changed · ' + (o.beforeId || 'before') + ' → ' + (o.afterId || 'after') + '\n\n*preview stub*\n\n- kept · the sky\'s night wash · preview stub\n- changed · the timer reads as a production timer · preview stub\n';
      return { markdown: md, json: { stub: true, kept: ['preview stub'], lost: [], new: [], changed: ['preview stub'] }, stub: true }; } };
  if (G.oz && G.oz.private) G.oz.private.installStub('motionToText', stub);
})(window);
