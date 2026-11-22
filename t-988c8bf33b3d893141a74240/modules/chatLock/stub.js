/* chatLock · PUBLIC PREVIEW STUB (INTERFACES.md §10). unlock() asks a labelled "preview stub · Face ID" confirm and
   returns { ok: true }. No passcode store. */
(function (G) {
  'use strict';
  var locked = {};
  var stub = { stub: true,
    lock: function (o) { locked[o.chatId] = true; return Promise.resolve({ ok: true }); },
    unlock: function (o) { return new Promise(function (res) {
      var d = document.createElement('div'); d.className = 'oz-stubask'; d.setAttribute('role', 'dialog');
      d.innerHTML = '<p class="jul">preview stub · Face ID</p><p>' + ((o && o.why) || 'unlock this chat') + '</p><button type="button" data-ok="1">unlock</button><button type="button">cancel</button>';
      document.body.appendChild(d);
      d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; d.remove(); res({ ok: !!b.dataset.ok }); });
    }); } };
  if (G.oz && G.oz.private) G.oz.private.installStub('chatLock', stub);
})(window);
