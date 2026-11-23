/* pushToTalk · PUBLIC PREVIEW STUB (Push Radio, 23 Nov 2026). Apple's PushToTalk framework lives only in the native
   iPhone app; a web page cannot reach it. Here: available() is false, the channel's "joined" is remembered on this
   phone so the room never asks twice, and nothing wakes oz in the background. Labelled in the room. */
(function (G) {
  'use strict';
  var KEY = 'gj-pr-joined';
  function get() { try { return G.GJ.settings.getItem(KEY) === '1'; } catch (e) { return false; } }
  function put(v) { try { G.GJ.settings.setItem(KEY, v ? '1' : '0'); } catch (e) {} }
  var stub = { stub: true,
    available: function () { return false; },
    restore: function () { return Promise.resolve({ joined: get(), stub: true }); },
    join: function () { put(true); return Promise.resolve({ joined: true, stub: true }); },
    leave: function () { put(false); return Promise.resolve({ joined: false }); },
    joined: get,
    on: function () {} };
  if (G.oz && G.oz.private) G.oz.private.installStub('pushToTalk', stub);
})(window);
