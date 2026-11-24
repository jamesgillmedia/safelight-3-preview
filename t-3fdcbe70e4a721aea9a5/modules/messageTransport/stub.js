/* messageTransport · PUBLIC PREVIEW STUB (INTERFACES.md §8). A local loopback: what is sent to a chat comes back from a
   labelled "example contact" after a short pause; statuses step queued → sent → delivered → read. Saved on this device
   only. No network, no discovery, no sync.
     send({ chatId, message }) · on(event, fn) — 'received' · 'status' · 'typing' */
(function (G) {
  'use strict';
  var subs = { received: [], status: [], typing: [] };
  function emit(ev, x) { (subs[ev] || []).forEach(function (f) { try { f(x); } catch (e) {} }); }
  var stub = {
    stub: true,
    send: function (o) {
      var m = o.message, id = m.id, delay = Math.max(0, (m.sendAt || 0) - Date.now());
      emit('status', { id: id, state: 'queued' });
      setTimeout(function () { emit('status', { id: id, state: 'sent' }); }, delay + 300);
      setTimeout(function () { emit('status', o.mode === 'mesh' ? { id: id, state: 'delivered', hops: 2, stub: true } : { id: id, state: 'delivered' }); }, delay + 800);   // mesh: a fixed, labelled preview hop count
      if (m.kind === 'text' || m.kind === 'voice' || m.kind === 'photo' || m.kind === 'clip' || m.kind === 'sticker') {
        setTimeout(function () { emit('typing', { chatId: o.chatId, who: 'example contact', typing: true }); }, delay + 1200);
        setTimeout(function () { emit('status', { id: id, state: 'read' }); emit('typing', { chatId: o.chatId, who: 'example contact', typing: false });
          emit('received', { chatId: o.chatId, message: { id: 'r' + Date.now(), kind: 'text', from: 'them', body: 'example reply · preview stub', at: Date.now(), example: true } }); }, delay + 2600);
      }
      return Promise.resolve({ id: id, stub: true });
    },
    listChats: function () { return Promise.resolve([]); },
    history: function () { return Promise.resolve([]); },
    markRead: function () {}, setTyping: function () {},
    on: function (ev, fn) { (subs[ev] = subs[ev] || []).push(fn); }
  };
  if (G.oz && G.oz.private) G.oz.private.installStub('messageTransport', stub);
})(window);
