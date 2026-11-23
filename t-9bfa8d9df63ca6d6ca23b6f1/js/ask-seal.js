/* oz · on-device seal for Ask and Messages. AES-GCM in the page. The relay only ever holds ciphertext.
   The pairing code is the raw key, shown once as text and a QR. No secrets are hardcoded here. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {};
  var KEY = 'oz-seal-key', SHOWN = 'oz-seal-shown', THREAD = 'oz-seal-thread';
  var keyB64 = null, shown = false, thread = '';

  function b64e(bytes) {
    var bin = '', i;
    for (i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64d(s) {
    s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length), i;
    for (i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function load() {
    try { keyB64 = localStorage.getItem(KEY) || null; } catch (e) { keyB64 = null; }
    try { shown = localStorage.getItem(SHOWN) === '1'; } catch (e) { shown = false; }
    try { thread = localStorage.getItem(THREAD) || ''; } catch (e) { thread = ''; }
    if (!thread || thread.length < 16) {
      var t = new Uint8Array(16);
      (G.crypto || window.crypto).getRandomValues(t);
      thread = b64e(t).replace(/[^A-Za-z0-9_-]/g, 'x').slice(0, 22);
      if (thread.length < 16) thread = (thread + 'xxxxxxxxxxxxxxxx').slice(0, 16);
      try { localStorage.setItem(THREAD, thread); } catch (e) {}
    }
  }
  load();

  function importKey(raw) {
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  function currentRaw() { return keyB64 ? b64d(keyB64) : null; }

  function generate() {
    var raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    keyB64 = b64e(raw);
    shown = false;
    try { localStorage.setItem(KEY, keyB64); localStorage.setItem(SHOWN, '0'); } catch (e) {}
    return Promise.resolve(pairingCode());
  }
  function ensure() {
    if (keyB64) return Promise.resolve(pairingCode());
    return generate();
  }
  function pairingCode() { return keyB64 ? ('OZ1.' + keyB64) : ''; }
  function markShown() {
    shown = true;
    try { localStorage.setItem(SHOWN, '1'); } catch (e) {}
  }
  function seal(text) {
    return ensure().then(function () {
      var iv = new Uint8Array(12);
      crypto.getRandomValues(iv);
      return importKey(currentRaw()).then(function (k) {
        return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, new TextEncoder().encode(String(text || '')));
      }).then(function (buf) {
        return 'v1.' + b64e(iv) + '.' + b64e(new Uint8Array(buf));
      });
    });
  }
  function unseal(s) {
    var p = String(s || '').split('.');
    if (p.length !== 3 || p[0] !== 'v1' || !keyB64) return Promise.reject(new Error('cannot unseal'));
    return importKey(currentRaw()).then(function (k) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(p[1]) }, k, b64d(p[2]));
    }).then(function (buf) { return new TextDecoder().decode(buf); });
  }

  /* Compact QR (byte mode, ECC L, versions 2–6). Enough for an OZ1 pairing code. */
  function qrMatrix(text) {
    var data = new TextEncoder().encode(String(text || ''));
    var VERS = [
      { v: 2, size: 25, cap: 32, ecc: 10, g: [10, 1, 10], align: [18] },
      { v: 3, size: 29, cap: 53, ecc: 15, g: [15, 1, 15], align: [22] },
      { v: 4, size: 33, cap: 78, ecc: 20, g: [20, 1, 20], align: [26] },
      { v: 5, size: 37, cap: 106, ecc: 26, g: [26, 1, 26], align: [30] },
      { v: 6, size: 41, cap: 134, ecc: 18, g: [18, 2, 18], align: [34] }
    ];
    var spec = null, i;
    for (i = 0; i < VERS.length; i++) if (data.length + 2 <= VERS[i].cap) { spec = VERS[i]; break; }
    if (!spec) throw new Error('pairing code too long for this QR');
    var size = spec.size;

    function gfMul(a, b) {
      var p = 0, k;
      for (k = 0; k < 8; k++) { if (b & 1) p ^= a; var h = a & 0x80; a = (a << 1) & 255; if (h) a ^= 0x1d; b >>= 1; }
      return p;
    }
    var exp = new Uint8Array(512), log = new Uint8Array(256), x = 1;
    for (i = 0; i < 255; i++) { exp[i] = x; log[x] = i; x = gfMul(x, 2); }
    for (i = 255; i < 512; i++) exp[i] = exp[i - 255];
    function rs(dataArr, nsym) {
      var gen = [1], j, k, out, lead;
      for (j = 0; j < nsym; j++) {
        var next = [];
        for (k = 0; k < gen.length; k++) {
          next[k] = (next[k] || 0) ^ gfMul(gen[k], exp[j]);
          next[k + 1] = (next[k + 1] || 0) ^ gen[k];
        }
        gen = next;
      }
      out = [];
      for (j = 0; j < nsym; j++) out[j] = 0;
      for (j = 0; j < dataArr.length; j++) {
        lead = dataArr[j] ^ out[0];
        out.shift(); out.push(0);
        if (!lead) continue;
        for (k = 0; k < nsym; k++) out[k] ^= gfMul(gen[k + 1] || 0, lead);
      }
      return out;
    }

    var bits = [];
    function push(val, n) { var b; for (b = n - 1; b >= 0; b--) bits.push((val >> b) & 1); }
    push(0x4, 4);
    push(data.length, 8);
    for (i = 0; i < data.length; i++) push(data[i], 8);
    var total = (spec.cap + spec.ecc) * 8;
    var padNeed = spec.cap * 8 - bits.length;
    if (padNeed > 0) push(0, Math.min(4, padNeed));
    while (bits.length % 8) bits.push(0);
    var pads = [0xec, 0x11], pi = 0;
    while (bits.length < spec.cap * 8) push(pads[(pi++) % 2], 8);
    var dataBytes = [];
    for (i = 0; i < spec.cap; i++) {
      var v = 0, b;
      for (b = 0; b < 8; b++) v = (v << 1) | bits[i * 8 + b];
      dataBytes.push(v);
    }
    var eccBytes, blocks;
    if (spec.g[1] === 1) {
      eccBytes = rs(dataBytes, spec.ecc);
      blocks = dataBytes.concat(eccBytes);
    } else {
      var nb = spec.g[1], sz = Math.floor(dataBytes.length / nb), e1 = spec.ecc / nb, bks = [], ebs = [], j;
      for (j = 0; j < nb; j++) {
        var sl = dataBytes.slice(j * sz, (j + 1) * sz);
        bks.push(sl); ebs.push(rs(sl, e1));
      }
      blocks = [];
      for (i = 0; i < sz; i++) for (j = 0; j < nb; j++) blocks.push(bks[j][i]);
      for (i = 0; i < e1; i++) for (j = 0; j < nb; j++) blocks.push(ebs[j][i]);
    }

    var m = [], rsv = [];
    for (i = 0; i < size; i++) { m[i] = []; rsv[i] = []; for (var c = 0; c < size; c++) { m[i][c] = 0; rsv[i][c] = 0; } }
    function set(y, x, v, res) { if (y < 0 || x < 0 || y >= size || x >= size) return; m[y][x] = v ? 1 : 0; if (res) rsv[y][x] = 1; }
    function finder(y, x) {
      var dy, dx, d;
      for (dy = -1; dy <= 7; dy++) for (dx = -1; dx <= 7; dx++) {
        d = Math.max(Math.abs(dy - 3), Math.abs(dx - 3));
        if (y + dy < 0 || x + dx < 0 || y + dy >= size || x + dx >= size) continue;
        set(y + dy, x + dx, d !== 2 && d <= 3 ? 1 : (d === 4 ? 0 : (dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6 && (d === 3))), 1);
      }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
    for (i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0, 1); set(i, 6, i % 2 === 0, 1); }
    function align(y, x) {
      var dy, dx, d;
      for (dy = -2; dy <= 2; dy++) for (dx = -2; dx <= 2; dx++) {
        d = Math.max(Math.abs(dy), Math.abs(dx));
        set(y + dy, x + dx, d !== 1, 1);
      }
    }
    spec.align.forEach(function (a) { align(a, a); });
    set(size - 8, 8, 1, 1);

    var info = 0x14 << 10; /* ECC L, mask 0: 000 */
    var tinf = info;
    for (i = 0; i < 5; i++) if (tinf & (1 << (14 - i))) tinf ^= (0x537 << (4 - i));
    info = (info | (tinf & 0x3ff)) ^ 0x5412;
    var positions = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
    ];
    for (i = 0; i < 15; i++) {
      var bit = (info >> (14 - i)) & 1;
      set(positions[i][0], positions[i][1], bit, 1);
      if (i < 8) set(8, size - 1 - i, bit, 1);
      else set(size - 15 + i, 8, bit, 1);
    }

    var path = [], col = size - 1, up = true;
    while (col > 0) {
      if (col === 6) col--;
      var y;
      if (up) { for (y = size - 1; y >= 0; y--) { path.push([y, col]); path.push([y, col - 1]); } }
      else { for (y = 0; y < size; y++) { path.push([y, col]); path.push([y, col - 1]); } }
      col -= 2; up = !up;
    }
    var bi = 0, placeBits = [];
    for (i = 0; i < blocks.length; i++) for (var b = 7; b >= 0; b--) placeBits.push((blocks[i] >> b) & 1);
    path.forEach(function (p) {
      var y = p[0], x = p[1];
      if (rsv[y][x]) return;
      var bit = placeBits[bi++] || 0;
      if (((y + x) % 2) === 0) bit ^= 1; /* mask 0 */
      set(y, x, bit, 0);
    });
    return m;
  }

  function drawQR(el, text) {
    if (!el) return;
    var m;
    try { m = qrMatrix(text || pairingCode()); } catch (e) { el.textContent = 'code only'; return; }
    var n = m.length, cell = 6, pad = 4, w = n * cell + pad * 2;
    var h = '<svg viewBox="0 0 ' + w + ' ' + w + '" width="100%" height="100%" aria-hidden="true">';
    h += '<rect width="' + w + '" height="' + w + '" fill="#f3ecdf"/>';
    var y, x;
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) if (m[y][x]) {
      h += '<rect x="' + (pad + x * cell) + '" y="' + (pad + y * cell) + '" width="' + cell + '" height="' + cell + '" fill="#1a1210"/>';
    }
    h += '</svg>';
    el.innerHTML = h;
  }

  GJ.askSeal = {
    ensure: ensure,
    generate: generate,
    hasKey: function () { return !!keyB64; },
    shown: function () { return shown; },
    markShown: markShown,
    threadId: function () { load(); return thread; },
    pairingCode: pairingCode,
    drawQR: drawQR,
    seal: seal,
    unseal: unseal
  };
})(window);
