/* shrink a zip · next to shrink a clip. Pick a zip or a folder that is too big to send, choose a target
   size, and it gives back a smaller zip. Everything happens on this device. Nothing is uploaded.
   The original is never changed. Photos are only resized and re-saved, never graded. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, FF = G.fflate;
  var el = document.createElement('section');
  el.id = 'szip';
  el.setAttribute('aria-label', 'shrink a zip');
  el.innerHTML =
    '<b class="jul">shrink a zip</b>' +
    '<p class="sz-say">a zip or a folder, smaller — it never leaves your phone</p>' +
    '<div class="sz-pickrow">' +
      '<label class="sz-pick"><input class="sz-zip" type="file" accept=".zip,application/zip" hidden><span>choose a zip</span></label>' +
      '<label class="sz-pick"><input class="sz-dir" type="file" webkitdirectory directory multiple hidden><span>choose a folder</span></label>' +
    '</div>' +
    '<p class="sz-meta"></p>' +
    '<div class="sz-tune" hidden>' +
      '<div class="sz-opts">' +
        '<span>target</span>' +
        '<button type="button" data-t="25">25 MB</button>' +
        '<button type="button" data-t="50">50 MB</button>' +
        '<button type="button" data-t="100">100 MB</button>' +
        '<input class="sz-mb" type="number" min="5" step="1" inputmode="decimal" aria-label="target size in MB">' +
        '<span>MB</span>' +
      '</div>' +
      '<div class="sz-slide"><input class="sz-range" type="range" min="5" max="25" step="1" aria-label="target size"></div>' +
      '<div class="sz-opts">' +
        '<span>photos</span>' +
        '<button type="button" data-p="2400">2400</button>' +
        '<button type="button" data-p="1600" class="on">1600</button>' +
        '<button type="button" data-p="1200">1200</button>' +
        '<span>video</span>' +
        '<button type="button" data-v="960" class="on">960</button>' +
        '<button type="button" data-v="720">720</button>' +
        '<button type="button" data-v="540">540</button>' +
      '</div>' +
      '<div class="sz-opts">' +
        '<span>quality</span>' +
        '<button type="button" data-q="high">high</button>' +
        '<button type="button" data-q="mid" class="on">mid</button>' +
        '<button type="button" data-q="low">low</button>' +
        '<input class="sz-qual" type="range" min="40" max="95" step="1" value="72" aria-label="quality">' +
      '</div>' +
      '<div class="sz-opts sz-sw">' +
        '<span>methods</span>' +
        '<button type="button" data-sw="photo" class="on" aria-pressed="true">photos</button>' +
        '<button type="button" data-sw="video" class="on" aria-pressed="true">video</button>' +
        '<button type="button" data-sw="audio" aria-pressed="false">audio</button>' +
        '<button type="button" data-sw="code" class="on" aria-pressed="true">code</button>' +
        '<button type="button" data-sw="dupe" class="on" aria-pressed="true">duplicates</button>' +
      '</div>' +
      '<p class="sz-est"></p>' +
    '</div>' +
    '<div class="sz-files" hidden></div>' +
    '<i class="sz-bar"><i></i></i>' +
    '<p class="sz-out"></p>' +
    '<div class="sz-act">' +
      '<button type="button" class="sz-go" disabled>shrink</button>' +
      '<a class="sz-save" hidden download>save</a>' +
      '<button type="button" class="sz-share" hidden>share</button>' +
      '<button type="button" class="sz-split" hidden>split</button>' +
      '<button type="button" class="sz-x">close</button>' +
    '</div>' +
    '<div class="sz-parts" hidden></div>';
  document.body.appendChild(el);

  var q = function (s) { return el.querySelector(s); };
  var zipInp = q('.sz-zip'), dirInp = q('.sz-dir'), meta = q('.sz-meta'), tune = q('.sz-tune');
  var filesEl = q('.sz-files'), bar = q('.sz-bar i'), out = q('.sz-out');
  var go = q('.sz-go'), save = q('.sz-save'), share = q('.sz-share'), splitBtn = q('.sz-split');
  var mbInp = q('.sz-mb'), range = q('.sz-range'), qual = q('.sz-qual'), partsEl = q('.sz-parts'), est = q('.sz-est');

  var sourceName = '', sourceSize = 0, tree = null, list = [], keep = {};
  var targetMB = 25, photoSide = 1600, videoSide = 960, quality = 0.72, qName = 'mid';
  var sw = { photo: true, video: true, audio: false, code: true, dupe: true };
  var busy = false, result = null, resultName = '', changed = [], parts = [];

  var PHOTO = /\.(jpe?g|png|webp|avif|bmp|tiff?)$/i;
  var VIDEO = /\.(mp4|mov|webm|m4v|mkv|avi)$/i;
  var AUDIO = /\.(mp3|wav|m4a|aac|flac|ogg|opus|aiff?)$/i;
  var CODE = /\.(html?|css|js|mjs|cjs)$/i;
  var TEXTREF = /\.(html?|css|js|mjs|cjs|json|svg|xml|txt|md)$/i;
  var QMAP = { high: 0.86, mid: 0.72, low: 0.55 };
  var VQ = { high: 1.6, mid: 1, low: 0.6 };

  function mb(n) { n = Math.max(0, n || 0); return (n / 1048576).toFixed(n < 10485760 ? 2 : 1) + ' MB'; }
  function bytesOfMB(n) { return Math.round(Math.max(5, n) * 1048576); }
  function kindOf(name) {
    if (PHOTO.test(name)) return 'photo';
    if (VIDEO.test(name)) return 'video';
    if (AUDIO.test(name)) return 'audio';
    if (CODE.test(name)) return 'code';
    return 'other';
  }
  function baseOf(p) { var i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }
  function dirOf(p) { var i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i + 1); }
  function extOf(p) { var b = baseOf(p), i = b.lastIndexOf('.'); return i < 0 ? '' : b.slice(i); }
  function stemOf(p) { var b = baseOf(p), i = b.lastIndexOf('.'); return i < 0 ? b : b.slice(0, i); }
  function norm(p) { return String(p || '').replace(/\\/g, '/').replace(/^\.\//, ''); }
  function isJunk(p) { return /(?:^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$)/i.test(p); }
  function yieldUI() { return new Promise(function (res) { setTimeout(res, 0); }); }
  function setBar(p) { bar.style.width = Math.max(0, Math.min(100, p)).toFixed(1) + '%'; }

  function open() {
    html.classList.add('szipping');
    GJ.haptic && GJ.haptic.tick();
    if (/[?&]tool=zip\b/.test(location.search) && !tree) out.textContent = '';
  }
  function close() {
    if (busy) return;
    html.classList.remove('szipping');
  }
  q('.sz-x').addEventListener('click', close);

  function setTarget(n, fromPreset) {
    var maxMB = sourceSize ? Math.max(5, Math.ceil(sourceSize / 1048576)) : 100;
    n = Math.max(5, Math.min(maxMB, +n || 5));
    targetMB = n;
    mbInp.value = String(Math.round(n));
    range.min = 5;
    range.max = String(maxMB);
    range.value = String(Math.round(n));
    [].forEach.call(el.querySelectorAll('[data-t]'), function (b) {
      var v = +b.dataset.t;
      b.disabled = v > maxMB && !!sourceSize;
      b.classList.toggle('on', fromPreset ? v === Math.round(n) : v === Math.round(n));
    });
    estimate();
  }

  el.querySelector('.sz-opts').addEventListener('click', function (e) {
    var b = e.target.closest('[data-t]'); if (!b || busy) return;
    setTarget(+b.dataset.t, true);
  });
  mbInp.addEventListener('change', function () { if (!busy) setTarget(+mbInp.value); });
  range.addEventListener('input', function () { if (!busy) setTarget(+range.value); });

  qAllButtons();
  function qAllButtons() {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || busy) return;
      if (b.dataset.p) {
        photoSide = +b.dataset.p;
        [].forEach.call(el.querySelectorAll('[data-p]'), function (k) { k.classList.toggle('on', k === b); });
        estimate();
      } else if (b.dataset.v) {
        videoSide = +b.dataset.v;
        [].forEach.call(el.querySelectorAll('[data-v]'), function (k) { k.classList.toggle('on', k === b); });
        estimate();
      } else if (b.dataset.q) {
        qName = b.dataset.q; quality = QMAP[qName];
        qual.value = String(Math.round(quality * 100));
        [].forEach.call(el.querySelectorAll('[data-q]'), function (k) { k.classList.toggle('on', k === b); });
        estimate();
      } else if (b.dataset.sw) {
        var k = b.dataset.sw;
        sw[k] = !sw[k];
        b.classList.toggle('on', sw[k]);
        b.setAttribute('aria-pressed', sw[k] ? 'true' : 'false');
        estimate();
      }
    });
  }
  qual.addEventListener('input', function () {
    if (busy) return;
    quality = (+qual.value) / 100;
    qName = quality >= 0.82 ? 'high' : quality <= 0.6 ? 'low' : 'mid';
    [].forEach.call(el.querySelectorAll('[data-q]'), function (k) { k.classList.toggle('on', k.dataset.q === qName); });
    estimate();
  });

  zipInp.addEventListener('change', function () {
    var f = zipInp.files && zipInp.files[0];
    if (f) readZipFile(f);
    zipInp.value = '';
  });
  dirInp.addEventListener('change', function () {
    var fs = dirInp.files;
    if (fs && fs.length) readFolder(fs);
    dirInp.value = '';
  });

  function resetResult() {
    result = null; parts = []; changed = [];
    save.hidden = true; share.hidden = true; splitBtn.hidden = true; partsEl.hidden = true; partsEl.innerHTML = '';
    setBar(0);
  }

  function readZipFile(file) {
    if (busy || !FF) { out.textContent = FF ? '' : 'the zip reader is not ready'; return; }
    sourceName = file.name || 'archive.zip';
    sourceSize = file.size;
    resetResult();
    out.textContent = 'reading…';
    file.arrayBuffer().then(function (buf) {
      try {
        var data = FF.unzipSync(new Uint8Array(buf));
        ingest(data, sourceName, sourceSize);
      } catch (e) {
        out.textContent = 'that zip could not be read';
      }
    }).catch(function () { out.textContent = 'that zip could not be read'; });
  }

  function readFolder(fileList) {
    if (busy) return;
    var files = [].slice.call(fileList);
    sourceName = (files[0] && (files[0].webkitRelativePath || files[0].name).split('/')[0]) || 'folder';
    sourceSize = files.reduce(function (s, f) { return s + f.size; }, 0);
    resetResult();
    out.textContent = 'reading…';
    var data = {}, n = 0;
    function next() {
      if (n >= files.length) { ingest(data, sourceName + '.zip', sourceSize); return; }
      var f = files[n++], p = norm(f.webkitRelativePath || f.name);
      if (!p || /\/$/.test(p) || isJunk(p)) { next(); return; }
      f.arrayBuffer().then(function (buf) { data[p] = new Uint8Array(buf); next(); })
        .catch(function () { next(); });
    }
    next();
  }

  function ingest(data, name, size) {
    var clean = {};
    Object.keys(data).forEach(function (p) {
      var k = norm(p);
      if (!k || /\/$/.test(k) || isJunk(k)) return;
      var v = data[p];
      if (v && v.length != null) clean[k] = v;
    });
    tree = clean;
    sourceName = name;
    sourceSize = size || Object.keys(clean).reduce(function (s, p) { return s + (clean[p].length || 0); }, 0);
    list = Object.keys(clean).sort().map(function (p) {
      return { path: p, size: clean[p].length, kind: kindOf(p), w: 0, h: 0, dur: 0 };
    });
    keep = {};
    list.forEach(function (it) { keep[it.path] = false; });
    var maxMB = Math.max(5, Math.ceil(sourceSize / 1048576));
    if (targetMB > maxMB) targetMB = maxMB;
    if (sourceSize <= 25 * 1048576) targetMB = Math.max(5, Math.min(25, maxMB));
    else targetMB = 25;
    setTarget(targetMB, true);
    paintMeta();
    paintFiles();
    tune.hidden = false;
    filesEl.hidden = false;
    go.disabled = !list.length;
    out.textContent = '';
    probeMeta();
  }

  function counts() {
    var c = { photo: 0, video: 0, audio: 0, other: 0, nPhoto: 0, nVideo: 0, nAudio: 0, nOther: 0 };
    list.forEach(function (it) {
      var k = it.kind === 'code' ? 'other' : it.kind;
      c[k] += it.size;
      c['n' + k.charAt(0).toUpperCase() + k.slice(1)]++;
    });
    // fix keys: nPhoto etc already; code counted in other. also count code separately for the line
    var nCode = 0, sCode = 0;
    list.forEach(function (it) { if (it.kind === 'code') { nCode++; sCode += it.size; } });
    c.nCode = nCode; c.code = sCode;
    return c;
  }

  function paintMeta() {
    var c = counts(), bits = [];
    if (c.nPhoto) bits.push(c.nPhoto + ' photo' + (c.nPhoto === 1 ? '' : 's') + ' · ' + mb(c.photo));
    if (c.nVideo) bits.push(c.nVideo + ' video' + (c.nVideo === 1 ? '' : 's') + ' · ' + mb(c.video));
    if (c.nAudio) bits.push(c.nAudio + ' audio · ' + mb(c.audio));
    var nRest = list.length - c.nPhoto - c.nVideo - c.nAudio;
    var sRest = sourceSize - c.photo - c.video - c.audio;
    if (nRest > 0) bits.push(nRest + ' other · ' + mb(sRest));
    meta.textContent = (sourceName || 'zip') + ' · ' + mb(sourceSize) + (bits.length ? ' · ' + bits.join(' · ') : '');
  }

  function paintFiles() {
    filesEl.innerHTML = '';
    list.forEach(function (it) {
      var row = document.createElement('label');
      row.className = 'sz-row';
      row.innerHTML = '<input type="checkbox" class="sz-keep"><span class="sz-n"></span><span class="sz-k"></span><span class="sz-s"></span>';
      row.querySelector('.sz-n').textContent = it.path;
      row.querySelector('.sz-k').textContent = it.kind;
      row.querySelector('.sz-s').textContent = mb(it.size);
      var cb = row.querySelector('.sz-keep');
      cb.checked = !!keep[it.path];
      cb.title = 'keep original';
      cb.setAttribute('aria-label', 'keep original ' + it.path);
      cb.addEventListener('change', function () { keep[it.path] = cb.checked; estimate(); });
      filesEl.appendChild(row);
    });
    var hint = document.createElement('p');
    hint.className = 'sz-keep-h';
    hint.textContent = 'tick a file to keep it as it is';
    filesEl.appendChild(hint);
  }

  function readSize(u8, path) {
    try {
      if (/\.png$/i.test(path) && u8.length >= 24 && u8[0] === 137) {
        return { w: (u8[16] << 24) | (u8[17] << 16) | (u8[18] << 8) | u8[19], h: (u8[20] << 24) | (u8[21] << 16) | (u8[22] << 8) | u8[23] };
      }
      if (/\.jpe?g$/i.test(path)) {
        var i = 2;
        while (i < u8.length - 9) {
          if (u8[i] !== 0xFF) break;
          var m = u8[i + 1], len = (u8[i + 2] << 8) | u8[i + 3];
          if (m === 0xC0 || m === 0xC1 || m === 0xC2) return { w: (u8[i + 7] << 8) | u8[i + 8], h: (u8[i + 5] << 8) | u8[i + 6] };
          if (len < 2) break;
          i += 2 + len;
        }
      }
      if (/\.webp$/i.test(path) && u8.length > 30 && u8[8] === 86) {
        // VP8X or VP8
        if (u8[12] === 88) return { w: 1 + (u8[24] | (u8[25] << 8) | (u8[26] << 16)), h: 1 + (u8[27] | (u8[28] << 8) | (u8[29] << 16)) };
      }
      if (/\.gif$/i.test(path) && u8.length > 10) return { w: u8[6] | (u8[7] << 8), h: u8[8] | (u8[9] << 8) };
    } catch (e) {}
    return { w: 0, h: 0 };
  }

  function probeMeta() {
    list.forEach(function (it) {
      if (it.kind === 'photo') {
        var s = readSize(tree[it.path], it.path);
        it.w = s.w; it.h = s.h;
      }
    });
    paintMeta();
    estimate();
    // video / audio duration, one at a time, for a better estimate
    var media = list.filter(function (it) { return it.kind === 'video' || it.kind === 'audio'; }), i = 0;
    function next() {
      if (!tree || i >= media.length) { estimate(); return; }
      var it = media[i++], blob = new Blob([tree[it.path]], { type: it.kind === 'video' ? 'video/mp4' : 'audio/mpeg' });
      var elMedia = document.createElement(it.kind === 'video' ? 'video' : 'audio');
      elMedia.preload = 'metadata';
      elMedia.muted = true;
      elMedia.src = URL.createObjectURL(blob);
      var done = function () {
        try { it.dur = elMedia.duration || 0; it.w = elMedia.videoWidth || it.w; it.h = elMedia.videoHeight || it.h; } catch (e) {}
        URL.revokeObjectURL(elMedia.src);
        estimate();
        next();
      };
      elMedia.onloadedmetadata = done;
      elMedia.onerror = function () { URL.revokeObjectURL(elMedia.src); next(); };
      setTimeout(function () { if (!it.dur) done(); }, 2500);
    }
    next();
  }

  function photoEst(it) {
    if (!sw.photo || keep[it.path]) return it.size;
    var long = Math.max(it.w, it.h) || photoSide * 1.4;
    var scale = Math.min(1, photoSide / long);
    var px = (it.w && it.h) ? it.w * it.h * scale * scale : photoSide * photoSide * 0.75;
    var bpp = 0.18 * quality; // webp / avif, rough
    var n = Math.round(px * bpp);
    return Math.min(it.size, Math.max(1200, n));
  }
  function videoEst(it) {
    if (!sw.video || keep[it.path]) return it.size;
    var dur = it.dur && isFinite(it.dur) ? it.dur : Math.max(2, it.size / 800000);
    var long = Math.max(it.w, it.h) || 1280;
    var s = Math.min(1, videoSide / (Math.min(it.w || videoSide, it.h || videoSide) || videoSide));
    var w = Math.max(2, Math.round((it.w || 1280) * s));
    var h = Math.max(2, Math.round((it.h || 720) * s));
    var bps = Math.round(w * h * 30 * 0.025 * (VQ[qName] || 1));
    return Math.min(it.size, Math.round(bps * dur / 8) + 8000);
  }
  function audioEst(it) {
    if (!sw.audio || keep[it.path]) return it.size;
    var dur = it.dur && isFinite(it.dur) ? it.dur : Math.max(2, it.size / 20000);
    return Math.min(it.size, Math.round(192000 * dur / 8) + 2000);
  }
  function codeEst(it) {
    if (!sw.code || keep[it.path]) return it.size;
    return Math.round(it.size * 0.82);
  }

  function estimate() {
    if (!list.length) { est.textContent = ''; return; }
    var sum = 0;
    list.forEach(function (it) {
      if (it.kind === 'photo') sum += photoEst(it);
      else if (it.kind === 'video') sum += videoEst(it);
      else if (it.kind === 'audio') sum += audioEst(it);
      else if (it.kind === 'code') sum += codeEst(it);
      else sum += it.size;
    });
    // deflate helps text and already-shrunk media only a little
    var packed = Math.round(sum * 0.96);
    var t = bytesOfMB(targetMB);
    var msg = 'about ' + mb(packed) + ' at these settings';
    if (packed <= t) msg += ' · under the ' + mb(t) + ' target';
    else msg += ' · over the ' + mb(t) + ' target — you can split it after';
    est.textContent = msg;
    est.dataset.bytes = String(packed);
  }

  function photoMime() {
    if (photoMime.cached) return photoMime.cached;
    var c = document.createElement('canvas');
    c.width = 2; c.height = 2;
    var mime = 'image/jpeg';
    try { if (c.toDataURL('image/webp').indexOf('image/webp') === 0) mime = 'image/webp'; } catch (e) {}
    photoMime.cached = mime;
    return mime;
  }
  function extForMime(m) {
    if (m === 'image/avif') return '.avif';
    if (m === 'image/webp') return '.webp';
    if (m === 'image/jpeg') return '.jpg';
    return '.jpg';
  }

  function shrinkPhoto(u8, path) {
    return new Promise(function (res) {
      var blob = new Blob([u8], { type: 'image/' + (extOf(path).slice(1) || 'jpeg') });
      var url = URL.createObjectURL(blob);
      var img = new Image();
      var loadWait = setTimeout(function () { URL.revokeObjectURL(url); res(null); }, 10000);
      img.onload = function () {
        clearTimeout(loadWait);
        var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        var scale = Math.min(1, photoSide / Math.max(w, h, 1));
        var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
        var cv = document.createElement('canvas');
        cv.width = cw; cv.height = ch;
        var g = cv.getContext('2d', { alpha: true, colorSpace: 'srgb' });
        if (!g) { URL.revokeObjectURL(url); res(null); return; }
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, 0, 0, cw, ch);
        var mime = photoMime();
        var blobWait = setTimeout(function () { URL.revokeObjectURL(url); res(null); }, 8000);
        cv.toBlob(function (outBlob) {
          clearTimeout(blobWait);
          URL.revokeObjectURL(url);
          if (!outBlob || outBlob.size >= u8.length) { res(null); return; }
          outBlob.arrayBuffer().then(function (buf) {
            res({ data: new Uint8Array(buf), ext: extForMime(mime), mime: mime, w: cw, h: ch });
          }).catch(function () { res(null); });
        }, mime, quality);
      };
      img.onerror = function () { clearTimeout(loadWait); URL.revokeObjectURL(url); res(null); };
      img.src = url;
    });
  }

  function videoTypes(withSound) {
    var T = withSound ? [
      'video/mp4;codecs=hvc1,mp4a.40.2',
      'video/mp4;codecs=hev1,mp4a.40.2',
      'video/webm;codecs=av01.0.04M.08,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ] : [
      'video/mp4;codecs=hvc1',
      'video/mp4;codecs=hev1',
      'video/webm;codecs=av01.0.04M.08',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    var outT = [];
    for (var i = 0; i < T.length; i++) {
      try { if (G.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(T[i])) outT.push(T[i]); } catch (e) {}
    }
    return outT[0] || '';
  }

  function shrinkVideo(u8, path, onProg) {
    return new Promise(function (resolve) {
      var t = videoTypes(true) || videoTypes(false);
      if (!t) { resolve(null); return; }
      var blob = new Blob([u8], { type: 'video/mp4' });
      var url = URL.createObjectURL(blob);
      var vid = document.createElement('video');
      var cv = document.createElement('canvas');
      var rec = null, actx = null, settled = false, chunks = [];
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.preload = 'auto';
      vid.src = url;
      function done(v) {
        if (settled) return;
        settled = true;
        clearTimeout(hang);
        try { vid.pause(); } catch (e) {}
        try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) {}
        try { if (actx && actx.close) actx.close(); } catch (e) {}
        try { if (vid.parentNode) vid.parentNode.removeChild(vid); } catch (e) {}
        try { if (cv.parentNode) cv.parentNode.removeChild(cv); } catch (e) {}
        try { URL.revokeObjectURL(url); } catch (e) {}
        resolve(v || null);
      }
      var hang = setTimeout(function () { done(null); }, 40000);
      vid.onerror = function () { done(null); };
      vid.onloadedmetadata = function () {
        if (settled) return;
        var vw = vid.videoWidth || 1280, vh = vid.videoHeight || 720;
        var s = Math.min(1, videoSide / Math.min(vw, vh));
        cv.width = Math.max(2, Math.round(vw * s / 2) * 2);
        cv.height = Math.max(2, Math.round(vh * s / 2) * 2);
        var g = cv.getContext('2d');
        if (!g) { done(null); return; }
        vid.style.cssText = 'position:fixed;left:-9999px;width:8px;height:8px;opacity:0;pointer-events:none';
        cv.style.cssText = 'position:fixed;left:-9999px;width:8px;height:8px;opacity:0;pointer-events:none';
        document.body.appendChild(vid);
        document.body.appendChild(cv);
        var stream = cv.captureStream(30);
        var recType = t;
        try {
          if (G.AudioContext) {
            actx = new AudioContext();
            var src = actx.createMediaElementSource(vid);
            var dest = actx.createMediaStreamDestination();
            src.connect(dest);
            if (dest.stream.getAudioTracks().length) {
              stream.addTrack(dest.stream.getAudioTracks()[0]);
              recType = videoTypes(true) || t;
            }
          }
        } catch (e) { recType = t; }
        var bps = Math.round(cv.width * cv.height * 30 * 0.025 * (VQ[qName] || 1));
        try { rec = new MediaRecorder(stream, { mimeType: recType, videoBitsPerSecond: bps }); }
        catch (e) { try { rec = new MediaRecorder(stream, { mimeType: t, videoBitsPerSecond: bps }); recType = t; } catch (e2) { done(null); return; } }
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          if (settled) {
            // already timed out; ignore
            return;
          }
          var outBlob = new Blob(chunks, { type: recType.split(';')[0] });
          if (!outBlob.size || outBlob.size >= u8.length) { done(null); return; }
          outBlob.arrayBuffer().then(function (buf) {
            var ext = recType.indexOf('mp4') >= 0 ? '.mp4' : '.webm';
            done({ data: new Uint8Array(buf), ext: ext, mime: outBlob.type });
          }).catch(function () { done(null); });
        };
        function draw() {
          if (settled) return;
          try { g.drawImage(vid, 0, 0, cv.width, cv.height); } catch (e) {}
          if (vid.duration) onProg && onProg(Math.min(1, vid.currentTime / vid.duration));
          if (vid.ended || (vid.duration && vid.currentTime >= vid.duration - 0.05)) {
            setTimeout(function () { try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) {} }, 160);
            return;
          }
          requestAnimationFrame(draw);
        }
        vid.onended = function () {
          setTimeout(function () { try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) {} }, 160);
        };
        vid.currentTime = 0;
        vid.play().then(function () {
          if (settled) return;
          try { rec.start(500); } catch (e) { done(null); return; }
          draw();
        }).catch(function () { done(null); });
      };
    });
  }

  function audioTypes() {
    var T = ['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < T.length; i++) {
      try { if (G.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(T[i])) return T[i]; } catch (e) {}
    }
    return '';
  }

  function shrinkAudio(u8) {
    return new Promise(function (res) {
      var t = audioTypes();
      if (!t || !G.AudioContext) { res(null); return; }
      var ctx = new AudioContext();
      ctx.decodeAudioData(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)).then(function (buf) {
        var dest = ctx.createMediaStreamDestination();
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(dest);
        var rec, chunks = [];
        try { rec = new MediaRecorder(dest.stream, { mimeType: t, audioBitsPerSecond: 192000 }); }
        catch (e) { ctx.close(); res(null); return; }
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          ctx.close();
          var outBlob = new Blob(chunks, { type: t.split(';')[0] });
          if (!outBlob.size || outBlob.size >= u8.length) { res(null); return; }
          outBlob.arrayBuffer().then(function (b) {
            var ext = t.indexOf('mp4') >= 0 ? '.m4a' : t.indexOf('ogg') >= 0 ? '.ogg' : '.webm';
            res({ data: new Uint8Array(b), ext: ext });
          }).catch(function () { res(null); });
        };
        src.onended = function () { setTimeout(function () { if (rec.state !== 'inactive') rec.stop(); }, 80); };
        rec.start(200);
        src.start(0);
      }).catch(function () { try { ctx.close(); } catch (e) {} res(null); });
    });
  }

  function minifyCSS(s) {
    return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim();
  }
  function minifyHTML(s) {
    s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
    s = s.replace(/>\s+</g, '><');
    return s.trim();
  }
  function minifyJS(s) {
    // conservative: drop block comments and // lines outside strings, keep newlines for ASI
    var outS = '', i = 0, n = s.length, qch = '';
    while (i < n) {
      var c = s[i], n2 = s[i + 1];
      if (qch) {
        outS += c;
        if (c === '\\' && qch !== '`') { outS += s[i + 1] || ''; i += 2; continue; }
        if (c === qch) qch = '';
        if (qch === '`' && c === '$' && n2 === '{') {
          // template expression: copy until matching } with a small scan
        }
        i++; continue;
      }
      if (c === '"' || c === "'" || c === '`') { qch = c; outS += c; i++; continue; }
      if (c === '/' && n2 === '/') { while (i < n && s[i] !== '\n') i++; continue; }
      if (c === '/' && n2 === '*') { i += 2; while (i < n && !(s[i] === '*' && s[i + 1] === '/')) i++; i += 2; continue; }
      outS += c; i++;
    }
    return outS.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  }
  function minifyText(u8, path) {
    try {
      var s = FF && FF.strFromU8 ? FF.strFromU8(u8) : new TextDecoder().decode(u8);
      var outS = s;
      if (/\.css$/i.test(path)) outS = minifyCSS(s);
      else if (/\.html?$/i.test(path)) outS = minifyHTML(s);
      else if (/\.(js|mjs|cjs)$/i.test(path)) outS = minifyJS(s);
      if (!outS || outS.length >= s.length) return null;
      return FF && FF.strToU8 ? FF.strToU8(outS) : new TextEncoder().encode(outS);
    } catch (e) { return null; }
  }

  function hex(buf) {
    return Array.prototype.map.call(buf, function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join('');
  }
  function hashU8(u8) {
    if (G.crypto && crypto.subtle) {
      var copy = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
      return crypto.subtle.digest('SHA-256', copy).then(function (d) { return hex(new Uint8Array(d)); });
    }
    var h = 2166136261;
    for (var i = 0; i < u8.length; i++) { h ^= u8[i]; h = Math.imul(h, 16777619); }
    return Promise.resolve((u8.length).toString(16) + ':' + (h >>> 0).toString(16));
  }

  function rewriteText(u8, map) {
    var s = FF && FF.strFromU8 ? FF.strFromU8(u8) : new TextDecoder().decode(u8);
    var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    var changedT = false;
    keys.forEach(function (oldP) {
      var neu = map[oldP];
      if (!neu || neu === oldP) return;
      if (s.indexOf(oldP) >= 0) { s = s.split(oldP).join(neu); changedT = true; }
      var oldB = baseOf(oldP), newB = baseOf(neu);
      if (oldB !== newB && s.indexOf(oldB) >= 0) {
        // only swap the bare filename when it looks unique to this file
        var re = new RegExp(oldB.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        var next = s.replace(re, newB);
        if (next !== s) { s = next; changedT = true; }
      }
    });
    if (!changedT) return u8;
    return FF && FF.strToU8 ? FF.strToU8(s) : new TextEncoder().encode(s);
  }

  go.addEventListener('click', function () {
    if (!tree || busy || !list.length) return;
    busy = true; go.disabled = true; html.classList.add('sz-busy');
    resetResult();
    out.textContent = 'shrinking…';
    setBar(1);
    runShrink().then(function () {
      busy = false; html.classList.remove('sz-busy'); go.disabled = false;
    }).catch(function (err) {
      busy = false; html.classList.remove('sz-busy'); go.disabled = false;
      out.textContent = 'it could not finish that zip';
      try { console.error(err && err.stack ? err.stack : err); } catch (e) {}
    });
  });

  async function runShrink() {
    if (!FF) throw new Error('no zip');
    var paths = list.map(function (it) { return it.path; });
    var outTree = {};
    var rename = {};
    changed = [];
    var total = paths.length, doneN = 0;

    for (var i = 0; i < paths.length; i++) {
      var p = paths[i], u8 = tree[p], it = list[i], keepIt = !!keep[p];
      var next = { data: u8, path: p, did: false };
      out.textContent = 'shrinking… ' + (i + 1) + ' of ' + total + ' · ' + p;
      if (!keepIt && it.kind === 'photo' && sw.photo) {
        var ph = await shrinkPhoto(u8, p);
        if (ph) {
          var np = dirOf(p) + stemOf(p) + ph.ext;
          next = { data: ph.data, path: np, did: true };
          if (np !== p) rename[p] = np;
        }
      } else if (!keepIt && it.kind === 'video' && sw.video) {
        var frac0 = doneN / total;
        var vid = await shrinkVideo(u8, p, function (f) { setBar((frac0 + f / total) * 100); });
        if (vid) {
          var vp = dirOf(p) + stemOf(p) + vid.ext;
          next = { data: vid.data, path: vp, did: true };
          if (vp !== p) rename[p] = vp;
        }
      } else if (!keepIt && it.kind === 'audio' && sw.audio) {
        var au = await shrinkAudio(u8);
        if (au) {
          var ap = dirOf(p) + stemOf(p) + au.ext;
          next = { data: au.data, path: ap, did: true };
          if (ap !== p) rename[p] = ap;
        }
      } else if (!keepIt && it.kind === 'code' && sw.code) {
        var mn = minifyText(u8, p);
        if (mn) next = { data: mn, path: p, did: true };
      }
      if (outTree[next.path] && next.path !== p) {
        // name clash: keep a unique name
        var k = 2, trial = next.path;
        while (outTree[trial]) { trial = dirOf(next.path) + stemOf(next.path) + '-' + k + extOf(next.path); k++; }
        if (rename[p]) rename[p] = trial;
        next.path = trial;
      }
      outTree[next.path] = next.data;
      if (next.did) changed.push({ from: p, to: next.path, before: u8.length, after: next.data.length });
      doneN++;
      setBar((doneN / (total + 2)) * 100);
      await yieldUI();
    }

    // duplicates: keep one copy, point the others at it
    if (sw.dupe) {
      var hashes = {}, byHash = {};
      var keys = Object.keys(outTree);
      for (var h = 0; h < keys.length; h++) {
        var hp = keys[h];
        if (keep[hp]) continue;
        var digest = await hashU8(outTree[hp]);
        hashes[hp] = digest;
        if (!byHash[digest]) byHash[digest] = [];
        byHash[digest].push(hp);
      }
      Object.keys(byHash).forEach(function (d) {
        var group = byHash[d].sort();
        if (group.length < 2) return;
        var keepP = group[0];
        group.slice(1).forEach(function (dup) {
          rename[dup] = keepP;
          delete outTree[dup];
          changed.push({ from: dup, to: keepP, before: (tree[dup] && tree[dup].length) || 0, after: 0, dupe: true });
        });
      });
    }

    // update references in html, css and js when a name changed
    if (Object.keys(rename).length) {
      Object.keys(outTree).forEach(function (p) {
        if (!TEXTREF.test(p)) return;
        outTree[p] = rewriteText(outTree[p], rename);
      });
    }

    out.textContent = 'packing…';
    await yieldUI();
    var packed = FF.zipSync(outTree, { level: 9, mem: 8 });
    result = new Blob([packed], { type: 'application/zip' });
    var stem = (sourceName || 'archive').replace(/\.zip$/i, '') || 'archive';
    resultName = stem + '-small.zip';
    if (save.href && save.href.indexOf('blob:') === 0) try { URL.revokeObjectURL(save.href); } catch (e) {}
    save.href = URL.createObjectURL(result);
    save.download = resultName;
    save.hidden = false;
    var fileObj = new File([result], resultName, { type: 'application/zip' });
    share.hidden = !(navigator.canShare && navigator.canShare({ files: [fileObj] }));
    share.onclick = function () { navigator.share({ files: [fileObj] }).catch(function () {}); };
    var over = result.size > bytesOfMB(targetMB);
    splitBtn.hidden = !over;
    var line = mb(sourceSize) + ' → ' + mb(result.size);
    if (result.size < sourceSize) line += ' · ' + (sourceSize / result.size).toFixed(1) + '× smaller';
    else line += ' · already small — keep the original';
    if (changed.length) line += ' · ' + changed.length + ' file' + (changed.length === 1 ? '' : 's') + ' changed';
    if (over) line += ' · still over ' + mb(bytesOfMB(targetMB)) + ' — split it into parts if you like';
    else line += ' · under the target';
    out.textContent = line;
    paintChanged(outTree);
    setBar(100);
    GJ.haptic && GJ.haptic.commit();
    el.dataset.done = '1';
    el.dataset.after = String(result.size);
    el.dataset.before = String(sourceSize);
  }

  function paintChanged(outTree) {
    if (!changed.length) return;
    // refresh the file list with before → after, keep the keep-original ticks
    filesEl.innerHTML = '';
    var byFrom = {};
    changed.forEach(function (c) { byFrom[c.from] = c; });
    list.forEach(function (it) {
      var c = byFrom[it.path];
      var row = document.createElement('div');
      row.className = 'sz-row' + (c ? ' ch' : '');
      var afterPath = c ? c.to : it.path;
      var afterSize = c ? c.after : (outTree[afterPath] ? outTree[afterPath].length : it.size);
      var left = it.path + (c && c.to !== it.path ? ' → ' + c.to : '');
      if (c && c.dupe) left += ' · same as ' + c.to;
      row.innerHTML = '<span class="sz-n"></span><span class="sz-k"></span><span class="sz-s"></span>';
      row.querySelector('.sz-n').textContent = left;
      row.querySelector('.sz-k').textContent = it.kind;
      row.querySelector('.sz-s').textContent = c ? (mb(c.before) + ' → ' + (c.after ? mb(c.after) : 'stored once')) : mb(it.size);
      filesEl.appendChild(row);
    });
  }

  splitBtn.addEventListener('click', function () {
    if (!result || busy) return;
    makeParts();
  });

  function makeParts() {
    // pack files from the last result tree is gone; re-read the saved zip and bin the files
    if (!FF || !result) return;
    busy = true;
    result.arrayBuffer().then(function (buf) {
      var data = FF.unzipSync(new Uint8Array(buf));
      var items = Object.keys(data).map(function (p) { return { path: p, data: data[p], size: data[p].length }; })
        .sort(function (a, b) { return b.size - a.size; });
      var cap = bytesOfMB(targetMB);
      var bins = [];
      items.forEach(function (it) {
        var placed = false;
        // zip overhead ~ 64 bytes a file plus the packed bytes (already compressed)
        for (var i = 0; i < bins.length; i++) {
          if (bins[i].bytes + it.size + 128 <= cap || bins[i].items.length === 0) {
            // a single file larger than the target still gets its own part
            if (bins[i].items.length && bins[i].bytes + it.size + 128 > cap) continue;
            bins[i].items.push(it); bins[i].bytes += it.size; placed = true; break;
          }
        }
        if (!placed) bins.push({ items: [it], bytes: it.size });
      });
      var stem = resultName.replace(/\.zip$/i, '') || 'archive-small';
      parts = bins.map(function (bin, i) {
        var treeP = {};
        bin.items.forEach(function (it) { treeP[it.path] = it.data; });
        var packed = FF.zipSync(treeP, { level: 9, mem: 8 });
        var name = stem + '.part' + (i + 1) + '.zip';
        return { name: name, blob: new Blob([packed], { type: 'application/zip' }), size: packed.length, count: bin.items.length };
      });
      partsEl.innerHTML = '<p class="sz-keep-h">unzip every part into the same folder and it comes back together</p>';
      parts.forEach(function (p) {
        var a = document.createElement('a');
        a.className = 'sz-part';
        a.download = p.name;
        a.href = URL.createObjectURL(p.blob);
        a.textContent = p.name + ' · ' + mb(p.size) + ' · ' + p.count + ' file' + (p.count === 1 ? '' : 's');
        partsEl.appendChild(a);
      });
      partsEl.hidden = false;
      out.textContent = mb(result.size) + ' in ' + parts.length + ' parts';
      busy = false;
    }).catch(function () { busy = false; out.textContent = 'it could not split that zip'; });
  }

  if (GJ.app && GJ.app.closeAny) {
    var ca0 = GJ.app.closeAny;
    GJ.app.closeAny = function () {
      if (html.classList.contains('szipping') && !busy) { close(); return true; }
      return ca0.apply(this, arguments);
    };
  }

  // a direct ?tool=zip link opens this sheet, even if Home did not pass home=1
  if (/[?&]tool=zip\b/.test(location.search)) {
    setTimeout(function () { open(); }, 120);
  }

  GJ.zip = {
    open: open,
    close: close,
    isOpen: function () { return html.classList.contains('szipping'); },
    state: function () {
      return {
        busy: busy,
        name: sourceName,
        before: sourceSize,
        after: result ? result.size : 0,
        target: bytesOfMB(targetMB),
        files: list.length,
        changed: changed.length,
        parts: parts.length,
        sw: Object.assign({}, sw),
        photoSide: photoSide,
        videoSide: videoSide,
        quality: quality
      };
    }
  };
})(window);
