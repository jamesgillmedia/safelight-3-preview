/* tools-02 · shrink a clip (Gill, 17 Nov: "build it into the function of the app"). Pick a screen recording; it plays
   once, silently, into a smaller canvas that is recorded again at a lower size and bitrate — all on the phone, nothing
   uploaded. Then save it (or share it straight to the chat). A 30 s clip takes about 30 s. The picture is only scaled,
   never graded. Sound is left out: the clip is for seeing. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var el = document.createElement('section'); el.id = 'shrink'; el.setAttribute('aria-label', 'shrink a clip');
  el.innerHTML = '<b class="jul">shrink a clip</b><p class="sh-say">a screen recording, smaller — it never leaves your phone</p>' +
    '<label class="sh-pick"><input type="file" accept="video/*" hidden><span>choose a clip</span></label>' +
    '<div class="sh-opts"><span>size</span><button data-w="960" class="on">960</button><button data-w="720">720</button><button data-w="540">540</button>' +
    '<span>detail</span><button data-q="1.6">high</button><button data-q="1" class="on">mid</button><button data-q=".6">low</button></div>' +
    '<video class="sh-v" muted playsinline></video><canvas class="sh-c" hidden></canvas>' +
    '<i class="sh-bar"><i></i></i><p class="sh-out"></p>' +
    '<div class="sh-act"><button class="sh-go" disabled>shrink</button><a class="sh-save" hidden download>save</a><button class="sh-share" hidden>share</button><button class="sh-x">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); };
  var inp = q('input'), vid = q('.sh-v'), cv = q('.sh-c'), bar = q('.sh-bar i'), out = q('.sh-out'), go = q('.sh-go'), save = q('.sh-save'), share = q('.sh-share');
  var file = null, W = 960, QF = 1, busy = false, result = null;
  function mb(n) { return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB'; }
  function type() {
    var T = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (var i = 0; i < T.length; i++) if (G.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(T[i])) return T[i];
    return '';
  }
  function open() { html.classList.add('shrinking'); GJ.haptic && GJ.haptic.tick(); }
  function close() { if (busy) return; html.classList.remove('shrinking'); }
  q('.sh-x').addEventListener('click', close);
  q('.sh-opts').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || busy) return;
    [].forEach.call(b.parentNode.querySelectorAll(b.dataset.w ? '[data-w]' : '[data-q]'), function (k) { k.classList.toggle('on', k === b); });
    if (b.dataset.w) W = +b.dataset.w; else QF = +b.dataset.q;
  });
  inp.addEventListener('change', function () {
    file = inp.files && inp.files[0]; if (!file) return;
    result = null; save.hidden = true; share.hidden = true; bar.style.width = '0';
    vid.src = URL.createObjectURL(file); vid.load();
    out.textContent = file.name + ' · ' + mb(file.size);
    go.disabled = !type(); if (!type()) out.textContent += ' · this browser cannot record video';
  });
  go.addEventListener('click', function () {
    if (!file || busy) return; busy = true; go.disabled = true; html.classList.add('sh-busy');
    var vw = vid.videoWidth || 1170, vh = vid.videoHeight || 2532, s = Math.min(1, W / Math.min(vw, vh));   // the short side to the chosen size
    cv.width = Math.round(vw * s / 2) * 2; cv.height = Math.round(vh * s / 2) * 2;
    var g = cv.getContext('2d'), stream = cv.captureStream(30), t = type();
    var bps = Math.round(cv.width * cv.height * 30 * .025 * QF);   // ~0.025 bits a pixel a frame (~1.5 Mbps at 960): screen recordings are mostly still
    var rec = new MediaRecorder(stream, { mimeType: t, videoBitsPerSecond: bps }), parts = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size) parts.push(e.data); };
    rec.onstop = function () {
      busy = false; html.classList.remove('sh-busy'); go.disabled = false;
      result = new Blob(parts, { type: t.split(';')[0] });
      var ext = t.indexOf('mp4') >= 0 ? 'mp4' : 'webm', name = (file.name.replace(/\.[^.]+$/, '') || 'clip') + '-small.' + ext;
      save.href = URL.createObjectURL(result); save.download = name; save.hidden = false;
      share.hidden = !(navigator.canShare && navigator.canShare({ files: [new File([result], name, { type: result.type })] }));
      share.onclick = function () { navigator.share({ files: [new File([result], name, { type: result.type })] }).catch(function () {}); };
      out.textContent = mb(file.size) + ' → ' + mb(result.size) + ' · ' + cv.width + '×' + cv.height + ' · ' + (result.size < file.size ? (file.size / result.size).toFixed(1) + '× smaller' : 'already small — keep the original');
      bar.style.width = '100%'; GJ.haptic && GJ.haptic.commit();
      el.dataset.done = '1';
    };
    function draw() {
      if (!busy) return;
      g.drawImage(vid, 0, 0, cv.width, cv.height);
      if (vid.duration) bar.style.width = (vid.currentTime / vid.duration * 100).toFixed(1) + '%';
      if (vid.ended) { setTimeout(function () { if (rec.state !== 'inactive') rec.stop(); }, 120); return; }
      requestAnimationFrame(draw);
    }
    vid.currentTime = 0; vid.muted = true;
    vid.play().then(function () { rec.start(1000); draw(); }).catch(function () { busy = false; html.classList.remove('sh-busy'); go.disabled = false; out.textContent = 'the clip would not play here'; });
  });
  GJ.shrink = { open: open, close: close, state: function () { return { busy: busy, size: result ? result.size : 0, w: cv.width, h: cv.height, type: type() }; } };
})(window);
