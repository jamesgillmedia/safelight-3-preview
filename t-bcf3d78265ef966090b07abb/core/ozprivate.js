/* oz core · the private register (builder-protection §4: secret modules are swappable black boxes). Public.
   A room asks for a module by name and gets the private implementation if this build has one, otherwise the public stub:
     oz.private.installStub(name, stub)   the public stub (each modules/<name>/stub.js calls this when it loads)
     oz.private.register(name, impl)      a private implementation: only files in core/private/ call this, and a public
                                          build has no core/private/ (public-strip.py), so it runs on the stubs alone
     oz.private.get(name)                 the implementation, else the stub; null only for a name it does not know
     oz.private.has(name)                 true when a private implementation is registered
   Unknown names are refused: register throws, installStub and get ignore them. Nothing here is fetched from anywhere. */
(function (G) {
  'use strict';
  var KNOWN = ['coreSettings', 'moonEngine', 'motionIndex', 'scanner', 'scanToMake', 'essentials',
    'voiceProfile', 'feedPicker', 'messageTransport', 'messageCrypto', 'chatLock', 'translateOnDevice', 'placeMatch',
    'privateRelay', 'motionToText'];
  var stubs = {}, impls = {};
  var oz = G.oz = G.oz || {};
  oz.private = {
    known: function () { return KNOWN.slice(); },
    installStub: function (name, stub) { if (KNOWN.indexOf(name) !== -1 && stub) stubs[name] = stub; },
    register: function (name, impl) {
      if (KNOWN.indexOf(name) === -1) throw new Error('oz.private.register: unknown name "' + name + '"');
      impls[name] = impl; return true;
    },
    get: function (name) { if (KNOWN.indexOf(name) === -1) return null; return impls[name] || stubs[name] || (G.ozPublicStubs && G.ozPublicStubs[name]) || null; },
    has: function (name) { return !!impls[name]; }
  };
})(window);
