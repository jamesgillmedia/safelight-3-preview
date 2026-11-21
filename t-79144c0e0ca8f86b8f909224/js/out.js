/* tools-02 · files made on the device, with no library: a PDF writer (one image a page), a zip writer (stored, not
   squeezed: the images already are) and a save. Used by Motion Index, the markup export, decision sheets and the picks
   board. Nothing here sends anything anywhere: a file is made in memory and handed to the browser's own save. */
(function (G) {
  'use strict';
  var GJ = G.GJ;
  function blobOf(c, type, ql) { return new Promise(function (ok, no) { try { c.toBlob(function (b) { if (b) ok(b); else no(new Error('no picture')); }, type, ql); } catch (e) { no(e); } }); }   // a refusal is an answer, not a crash
  function bytes(b) { return b.arrayBuffer().then(function (a) { return new Uint8Array(a); }); }
  function enc(s) { return new TextEncoder().encode(s); }
  function pdf(pages) {   // pages: [{ jpg: Uint8Array, w, h }] — one image a page, at 72 px an inch
    var parts = [], off = [0], len = 0, n = pages.length;
    function add(u) { parts.push(u); len += u.length; }
    function obj(id, body, stream) { off[id] = len; add(enc(id + ' 0 obj\n' + body + (stream ? '\nstream\n' : '\nendobj\n'))); if (stream) { add(stream); add(enc('\nendstream\nendobj\n')); } }
    add(enc('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Count ' + n + ' /Kids [' + pages.map(function (p, i) { return (3 + i * 3) + ' 0 R'; }).join(' ') + '] >>');
    pages.forEach(function (p, i) {
      var pg = 3 + i * 3, im = pg + 1, ct = pg + 2, w = (p.w * .6).toFixed(2), h = (p.h * .6).toFixed(2), cs = enc('q ' + w + ' 0 0 ' + h + ' 0 0 cm /Im0 Do Q');
      obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + w + ' ' + h + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
      obj(im, '<< /Type /XObject /Subtype /Image /Width ' + p.w + ' /Height ' + p.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + p.jpg.length + ' >>', p.jpg);
      obj(ct, '<< /Length ' + cs.length + ' >>', cs);
    });
    var xref = len, N = 3 + n * 3, x = 'xref\n0 ' + N + '\n0000000000 65535 f \n';
    for (var i = 1; i < N; i++) x += ('0000000000' + off[i]).slice(-10) + ' 00000 n \n';
    add(enc(x + 'trailer\n<< /Size ' + N + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n'));
    return new Blob(parts, { type: 'application/pdf' });
  }
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc(u) { var c = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {   // [{ name, data: Uint8Array }] — stored, not squeezed (the images already are)
    var parts = [], cen = [], off = 0;
    function h(arr) { var b = new Uint8Array(arr.length), i = 0; arr.forEach(function (v) { b[i++] = v & 255; }); return b; }
    function le(v, n) { var o = []; for (var i = 0; i < n; i++) o.push((v >>> (8 * i)) & 255); return o; }
    files.forEach(function (f) {
      var nm = enc(f.name), c = crc(f.data), loc = h([0x50, 0x4b, 3, 4].concat(le(20, 2), le(0x800, 2), le(0, 2), le(0, 2), le(0x21, 2), le(c, 4), le(f.data.length, 4), le(f.data.length, 4), le(nm.length, 2), le(0, 2)));
      cen.push(h([0x50, 0x4b, 1, 2].concat(le(20, 2), le(20, 2), le(0x800, 2), le(0, 2), le(0, 2), le(0x21, 2), le(c, 4), le(f.data.length, 4), le(f.data.length, 4), le(nm.length, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 4), le(off, 4))), nm);
      parts.push(loc, nm, f.data); off += loc.length + nm.length + f.data.length;
    });
    var cl = cen.reduce(function (a, u) { return a + u.length; }, 0);
    return new Blob(parts.concat(cen, [h([0x50, 0x4b, 5, 6].concat(le(0, 2), le(0, 2), le(files.length, 2), le(files.length, 2), le(cl, 4), le(off, 4), le(0, 2)))]), { type: 'application/zip' });
  }
  function save(blob, name) { var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); URL.revokeObjectURL(u); }, 4000); return u; }
  GJ.out = { blobOf: blobOf, bytes: bytes, enc: enc, pdf: pdf, zip: zip, crc: crc, save: save, last: null };
})(window);
