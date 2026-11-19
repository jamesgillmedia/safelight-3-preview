/* tools-02 · the tap-through About (briefs/GLITCH-PROFILE.md; Gill, 18 Nov: batch three).
   A full-screen still with one line of words on it. Each tap: the line goes, the next arrives with a small glitch (in
   the words only), and the camera pushes in a little with a small roll. Under a second a step. The picture is never
   altered — only where the camera is. With Reduce Motion it is a crossfade and the camera stays where it is.
     · ‹ back · skip › at the foot; EDIT opens the lines (one a line) and the background: any of the public stills, or a
       picture of your own (kept on this device); CARD saves a share card — the picture whole, the words beside it.
   The words it starts with are the public ones only (name, the work, he / him, Vancouver) and are yours to change.
   Kept in this browser (localStorage gj-about; your own picture in GJ.keep). Not here yet: the card as a link preview
   for review links (that needs the relay), a roll of several backgrounds. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, S = G.GJ_SAMPLES || [];
  var KEY = 'gj-about', A = { lines: ['Gill James', 'cinematographer', 'he / him', 'Vancouver'], bg: (S.filter(function (x) { return x.id === 'canoe-hero'; })[0] || S[0] || {}).id || '', own: false };   // a still with no one in it, so the name is not read as a face
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.lines) A = Object.assign(A, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(A)); } catch (e) {} }
  var el = document.createElement('section'); el.id = 'about'; el.setAttribute('aria-label', 'about');
  el.innerHTML = '<div class="ab-bg"><img alt="" draggable="false"></div><p class="ab-line" aria-live="polite"></p><p class="ab-n"></p>' +
    '<div class="ab-ui"><button data-a="back" aria-label="back">‹</button><button data-a="skip" aria-label="skip">›</button><button data-a="edit">edit</button><button data-a="card">card</button><button data-a="close">close</button></div>' +
    '<div class="ab-edit" hidden><textarea rows="5" aria-label="the lines, one a line" placeholder="one line of words a line"></textarea><div><button data-a="prevbg" aria-label="previous still">‹</button><span class="ab-bgn"></span><button data-a="nextbg" aria-label="next still">›</button><button data-a="own">your picture</button><button data-a="done">done</button></div><p class="ab-say"></p></div>' +
    '<input type="file" accept="image/*" hidden>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, img = q('.ab-bg img'), line = q('.ab-line'), ed = q('.ab-edit'), ta = q('textarea'), file = q('input[type=file]'), say = q('.ab-say');
  var k = 0, on = false, ownUrl = '', lastStep = 0, busy = 0;
  function bgOf() { for (var i = 0; i < S.length; i++) if (S[i].id === A.bg) return S[i]; return S[0] || null; }
  function setBg() {
    var s = bgOf(); q('.ab-bgn').textContent = A.own ? 'your picture' : s ? s.title : '';
    if (A.own) { GJ.keep.get('about-bg').then(function (b) { if (!b) { A.own = false; save(); setBg(); return; } if (ownUrl) URL.revokeObjectURL(ownUrl); ownUrl = URL.createObjectURL(b); img.src = ownUrl; }); }
    else if (s) img.src = s.file;
  }
  function cam() { var r = GJ.reduced(); img.style.transform = r ? 'none' : 'scale(' + (1.04 + .05 * k).toFixed(3) + ') rotate(' + ((k % 2 ? 1 : -1) * (k ? .5 : 0)) + 'deg)'; }
  function show(n, quiet) {
    var L = A.lines.length ? A.lines : ['']; k = ((n % L.length) + L.length) % L.length; lastStep = GJ.now(); clearTimeout(busy);
    q('.ab-n').textContent = (k + 1) + ' / ' + L.length; cam();
    if (quiet) { line.textContent = L[k]; line.className = 'ab-line on'; return; }
    line.classList.remove('on', 'glitch');
    busy = setTimeout(function () { line.textContent = L[k]; line.setAttribute('data-t', L[k]); void line.offsetWidth; line.classList.add('on'); if (!GJ.reduced()) line.classList.add('glitch'); GJ.haptic.tick(); }, 190);
  }
  function open() { on = true; html.classList.add('abouting'); ed.hidden = true; setBg(); show(0, true); if (GJ.mark && GJ.mark.say) GJ.mark.say('about · tap for the next line', 2000); }
  function close() { on = false; html.classList.remove('abouting'); ed.hidden = true; }
  function card() {   // 1200 × 630: the picture whole (only scaled) on the left, the words beside it on the page's own dark
    var c = document.createElement('canvas'); c.width = 1200; c.height = 630; var g = c.getContext('2d'); g.fillStyle = '#05090f'; g.fillRect(0, 0, 1200, 630);
    var bw = 760, bh = 510, ar = (img.naturalWidth || 16) / (img.naturalHeight || 9), w = bw, h = w / ar; if (h > bh) { h = bh; w = h * ar; }
    try { g.imageSmoothingQuality = 'high'; g.drawImage(img, 60 + (bw - w) / 2, 60 + (bh - h) / 2, w, h); } catch (e) {}
    g.fillStyle = '#e8e4dc'; g.textBaseline = 'alphabetic'; var y = 150;
    A.lines.slice(0, 8).forEach(function (t, i) { g.font = (i ? '300 26px Poppins' : '400 34px "Julius Sans One", Poppins') + ', sans-serif'; g.fillStyle = i ? 'rgba(232,228,220,.78)' : '#e8e4dc'; g.fillText(String(t).slice(0, 24), 860, y); y += i ? 44 : 60; });
    return c;
  }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'), a = b && b.dataset.a;
    if (e.target.closest('.ab-edit') && !b) return;
    if (!b) { if (!ed.hidden) return; show(k + 1); return; }
    if (a === 'back') show(k - 1); else if (a === 'skip') show(k + 1);
    else if (a === 'close') close();
    else if (a === 'edit') { ed.hidden = !ed.hidden; if (!ed.hidden) { ta.value = A.lines.join('\n'); say.textContent = 'one line of words a line · the picture is never changed, only where the camera is'; } }
    else if (a === 'done') { ed.hidden = true; }
    else if (a === 'prevbg' || a === 'nextbg') { var i = Math.max(0, S.indexOf(bgOf())); A.own = false; A.bg = S[(i + (a === 'nextbg' ? 1 : S.length - 1)) % S.length].id; save(); setBg(); }
    else if (a === 'own') file.click();
    else if (a === 'card') GJ.out.blobOf(card(), 'image/png').then(function (bl) { GJ.out.last = { name: 'about-card.png', size: bl.size, blob: bl }; GJ.out.save(bl, 'about-card.png'); if (GJ.mark && GJ.mark.say) GJ.mark.say('saved · about-card.png', 1600); }).catch(function () { if (GJ.mark && GJ.mark.say) GJ.mark.say('the card could not be saved from here', 2200); });
  });
  ta.addEventListener('input', function () { A.lines = ta.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 24); save(); show(Math.min(k, Math.max(0, A.lines.length - 1)), true); });
  ['keydown', 'pointerdown'].forEach(function (ev) { ta.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  file.addEventListener('change', function () { var f = file.files && file.files[0]; if (!f) return; GJ.keep.put('about-bg', f).then(function () { A.own = true; save(); setBg(); say.textContent = GJ.keep.lasting ? 'your picture — kept on this device' : 'your picture — for this visit (this browser keeps nothing here)'; }); file.value = ''; });
  G.addEventListener('keydown', function (e) { if (!on || !ed.hidden) return; if (e.key === 'ArrowRight' || e.key === ' ') show(k + 1); else if (e.key === 'ArrowLeft') show(k - 1); else if (e.key === 'Escape') close(); });
  GJ.about = { open: open, close: close, isOpen: function () { return on; }, next: function () { show(k + 1); }, back: function () { show(k - 1); }, card: card,
    setLines: function (a) { A.lines = a.slice(0, 24); save(); if (on) show(0, true); }, setBg: function (id) { A.own = false; A.bg = id; save(); setBg(); },
    setOwn: function (blob) { return GJ.keep.put('about-bg', blob).then(function () { A.own = true; save(); setBg(); }); },
    state: function () { return { on: on, k: k, n: A.lines.length, line: line.textContent, lines: A.lines.slice(), bg: A.own ? 'own' : A.bg, transform: img.style.transform, editing: !ed.hidden, glitch: line.classList.contains('glitch'), since: GJ.now() - lastStep }; } };
})(window);
