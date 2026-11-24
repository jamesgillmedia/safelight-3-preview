/* bubble round, item 4 · status, as a little mark. Online · do not disturb · walking · rolling / shooting · darkroom ·
   sleeping — each a tiny badge in the standard pack's 3D emoji style (js/truemoji.js), on a person's star in the Circle
   (the Circle room, and the Friends and Loved Ones rooms) and beside their name in the Messages header (both skins). Small and quiet; never a banner.
   Set yours in one tap: hold the red-mode dot and tap a mark on its pad (a tap on the dot itself stays red mode), or tap
   "status" on the Moon dial and then a mark. Auto-status is off by default; when on, it is a plain local rule (the Timer
   running → rolling; red mode on → darkroom), and a status you set yourself always wins. Only your Circle would see it;
   nothing is sent in this preview (delivery is the messageTransport stub). Example people carry example statuses.
   GJ.status */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, TM = G.OZ_TRUEMOJI, tune = document.getElementById('tune'); if (!TM) return;
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  var LIST = [['online', 'online', 'online'], ['dnd', 'do not disturb', 'dnd'], ['walking', 'walking', 'paw'], ['rolling', 'rolling · shooting', 'clapper'], ['darkroom', 'darkroom', 'darkroom'], ['sleeping', 'sleeping', 'moon']];
  function row(k) { return LIST.filter(function (x) { return x[0] === k; })[0]; }
  var KEY = 'oz-status', P = { people: { 'example contact': 'rolling', 'Example Rowan': 'sleeping', 'Example Ida': 'walking', 'Example Sam': 'darkroom', 'Example Noor': 'online' } };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.people) P = s0; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  var BC = {};   // one drawing per mark and size (the Circle repaints its stars every frame)
  function badge(k, size) { var r = row(k); if (!r) return ''; var c = k + '@' + (size || 16); return BC[c] || (BC[c] = '<i class="st-b" role="img" aria-label="' + r[1] + '" title="' + r[1] + '">' + TM.svg(r[2], size || 16) + '</i>'); }
  function mine() { var s = store.get(); if (s.myStatus) return s.myStatus; if (s.statusAuto) { if (s.timer && s.timer.running) return 'rolling'; if (s.red) return 'darkroom'; } return null; }
  function set(k) { store.set({ myStatus: k || null }); hap('commit'); paintPad(); }

  /* the dot's pad: a row of marks (hold the dot, tap one) */
  function paintPad() { var pad = document.getElementById('redpad'); if (!pad) return; var r = pad.querySelector('.rp-st');
    if (!r) { r = document.createElement('div'); r.className = 'rp-st'; r.setAttribute('role', 'group'); r.setAttribute('aria-label', 'your status'); pad.appendChild(r);
      r.addEventListener('click', function (e) { var b = e.target.closest('[data-st]'); if (!b) return; e.stopPropagation(); set(b.dataset.st === 'none' ? null : b.dataset.st); }); }
    var m = mine(); r.innerHTML = LIST.map(function (x) { return '<button type="button" data-st="' + x[0] + '" aria-pressed="' + (m === x[0]) + '" aria-label="status: ' + x[1] + '">' + TM.svg(x[2], 22) + '</button>'; }).join('') + '<button type="button" data-st="none" aria-label="no status" aria-pressed="' + !m + '">·</button>'; }
  /* the picker (from the Moon dial's shortcut): tap a mark */
  var pick = document.createElement('div'); pick.id = 'st-pick'; pick.hidden = true; pick.setAttribute('role', 'dialog'); pick.setAttribute('aria-label', 'set your status');
  document.body.appendChild(pick);
  function paintPick() { var m = mine(); pick.innerHTML = '<p class="jul">your status</p><div class="st-grid">' + LIST.map(function (x) { return '<button type="button" data-st="' + x[0] + '" aria-pressed="' + (m === x[0]) + '">' + TM.svg(x[2], 34) + '<span>' + x[1] + '</span></button>'; }).join('') + '<button type="button" data-st="none" aria-pressed="' + !m + '"><b>·</b><span>none</span></button></div><p class="quiet">only your Circle sees it · nothing is sent in this preview</p>'; }
  function openPick() { paintPick(); pick.hidden = false; hap('tick'); }
  function closePick() { pick.hidden = true; }
  pick.addEventListener('click', function (e) { var b = e.target.closest('[data-st]'); if (!b) return; set(b.dataset.st === 'none' ? null : b.dataset.st); closePick(); });
  document.addEventListener('pointerdown', function (e) { if (!pick.hidden && !pick.contains(e.target)) closePick(); }, true);

  /* the badges: beside a name in the Messages header; on a star in Friends and in Loved Ones */
  function nameOf(b) { var sp = b.querySelector('span'); if (!sp) return ''; var t = ''; [].forEach.call(sp.childNodes, function (c) { if (c.nodeType === 3) t += c.textContent; }); return t.trim(); }
  function decorate() {
    var nm = document.querySelector('#msg .mz-ch .mz-nm'); if (nm && html.classList.contains('messaging')) { var host = nm.parentNode, old = host.querySelector('.st-b'), k = P.people[nm.textContent.trim()] || null, want = k ? badge(k, 16) : '';
      if ((old ? old.outerHTML : '') !== want) { if (old) old.remove(); if (want) nm.insertAdjacentHTML('afterend', want); } }
    var on2 = document.querySelector('#msg-ours .mg-who .im-name'); if (on2 && html.classList.contains('messaging')) { var o2 = on2.querySelector('.st-b'), k2 = P.people[on2.textContent.trim()] || null, w2 = k2 ? badge(k2, 15) : '';   // our Messages skin's header: inside the name, on its line
      if ((o2 ? o2.outerHTML : '') !== w2) { if (o2) o2.remove(); if (w2) on2.insertAdjacentHTML('afterbegin', w2); } }   // first, so a long name's ellipsis never hides it
    [].forEach.call(document.querySelectorAll('#fr .fr-p, #lo .lo-p'), function (b) { var k = P.people[nameOf(b)] || null, old = b.querySelector('.st-b'), cur = old ? old.getAttribute('aria-label') : '';
      if ((row(k) || [])[1] === cur && (k || !old)) return; if (old) old.remove(); if (k) b.insertAdjacentHTML('beforeend', badge(k, 15)); });
  }
  setInterval(decorate, 400);
  store.on(function (s, p) { if (!p || s.myStatus !== p.myStatus || s.statusAuto !== p.statusAuto || s.red !== p.red || (s.timer && p.timer && s.timer.running !== p.timer.running)) { paintPad(); html.dataset.status = mine() || ''; paintTune(); } });
  setTimeout(paintPad, 0);

  /* Tune → Status */
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  function paintTune() { var m = mine(); T('mystatus', m ? row(m)[1] : 'none'); T('statusauto', store.get().statusAuto ? 'on' : 'off'); }
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, s = store.get();
    if (k === 'mystatus') { var ids = [null].concat(LIST.map(function (r) { return r[0]; })), i = ids.indexOf(s.myStatus || null); set(ids[(i + 1) % ids.length]); }
    if (k === 'statusauto') store.set({ statusAuto: !s.statusAuto }); });
  paintTune();
  GJ.status = { mine: mine, set: set, of: function (n) { return P.people[n] || null; }, setFor: function (n, k) { if (k) P.people[n] = k; else delete P.people[n]; save(); decorate(); }, list: LIST.map(function (r) { return r[0]; }), label: function (k) { return (row(k) || [])[1]; }, badge: badge, picker: openPick, closePicker: closePick };
})(window);
