/* oz next (items 3, 4 and 5) · Private Relay, Essentials, and Add to Archive.
   Private Relay: plain sheets for pairing your own phone and Mac and for review links (1–7 days, revocable); returned
     notes land on their frames. All through the `privateRelay` slot — here its labelled stub; nothing leaves this phone,
     so F3 stays dark. Essentials: one switch that calms the app — what is pinned stays, nothing is deleted (the
     `essentials` slot decides; labelled a preview stub while the stub is in use). Add to Archive: one calm ingest — bring
     files in, copy them exact (a checksum each), read what the file says about itself, flag exact duplicates (never delete),
     confirm a home, then the new set opens as a sheet. Clips go to the `motionIndex` slot. Marked example files only.
     GJ.relay.open() · GJ.addArchive.open() · GJ.essentialsHidden(id) */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, P = GJ.ozone && GJ.ozone.panel, esc = GJ.ozone ? GJ.ozone.esc : String, tune = document.getElementById('tune'); if (!P) return;
  function priv(n) { return G.oz.private.get(n); }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function say(t) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, 1800); }
  function day(ms) { return new Date(ms).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase(); }

  /* ---------- Private Relay ---------- */
  var R = priv('privateRelay'), NOTES = [];
  var relay = P({ id: 'ozrelay', title: 'Private Relay', tall: true, sub: 'your own phone and Mac, and review links · no cloud account',
    foot: 'preview stub · nothing is paired, carried or sealed in this preview · F3 stays dark: nothing left this phone',
    build: function (b) {
      var st = R.status();
      b.innerHTML = '<h3 class="jul">sync</h3><div class="oz-grp"><p class="oz-line">' + (st.devices.length ? st.devices.join(' · ') : 'not paired') + ' · preview stub</p>' +
        '<button type="button" class="oz-row" data-a="pair:phone">pair a phone<span>›</span></button><button type="button" class="oz-row" data-a="pair:mac">pair a Mac<span>›</span></button><button type="button" class="oz-row" data-a="sync">sync now<span>preview stub</span></button></div>' +
        '<h3 class="jul">a review link</h3><div class="oz-grp"><div class="oz-line rl-row"><select class="rl-kind" aria-label="what to share"><option value="sheet">a sheet</option><option value="sequence">a sequence</option><option value="clip">a clip</option></select>' +
        '<label>expires in <input type="range" class="rl-days" min="1" max="7" value="3" aria-label="days until it expires"> <b class="rl-dv">3 days</b></label></div><button type="button" class="oz-row" data-a="link">make the link<span>files go exact</span></button></div>' +
        '<div class="rl-links"></div><h3 class="jul">notes that came back</h3><div class="oz-grp rl-notes"><p class="oz-line quiet">none yet</p></div>';
      paintLinks(b); paintNotes(b);
      b.querySelector('.rl-days').addEventListener('input', function () { b.querySelector('.rl-dv').textContent = this.value + (this.value === '1' ? ' day' : ' days'); });
    } });
  function paintLinks(b) { var L = R.links(); b.querySelector('.rl-links').innerHTML = L.length ? '<div class="oz-grp">' + L.map(function (l) { return '<p class="oz-line">' + esc(l.kind) + ' · <u>' + esc(l.url) + '</u><br><small>preview stub link · goes nowhere · expires ' + day(l.expires) + '</small></p>' +
    '<div class="oz-row"><button type="button" data-copy="' + esc(l.url) + '">copy</button><button type="button" data-merge="' + esc(l.url) + '">bring the notes back</button><button type="button" data-revoke="' + esc(l.url) + '">revoke</button></div>'; }).join('') + '</div>' : ''; }
  function paintNotes(b) { b.querySelector('.rl-notes').innerHTML = NOTES.length ? NOTES.map(function (n) { return '<p class="oz-line">frame ' + n.frame + ' · ' + esc(n.note) + '<br><small>' + esc(n.who) + ' · on its frame in the Archive</small></p>'; }).join('') : '<p class="oz-line quiet">none yet</p>'; }
  relay.el.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return; var b = relay.body, a = x.dataset.a || '';
    if (a.indexOf('pair:') === 0) { var r = R.pairDevice({ kind: a.slice(5) }); say(a.slice(5) + ' · ' + r.state); relay.close(); setTimeout(relay.open, 400); }
    if (a === 'sync') { var s = R.sync(); say('synced · ' + s.items + ' items · preview stub'); }
    if (a === 'link') { R.createReviewLink({ kind: b.querySelector('.rl-kind').value, id: 'current', days: +b.querySelector('.rl-days').value }); paintLinks(b); hap('commit'); }
    if (x.dataset.copy) { try { navigator.clipboard.writeText(x.dataset.copy); } catch (er) {} say('copied · a preview stub link'); }
    if (x.dataset.revoke) { R.revokeReviewLink({ url: x.dataset.revoke }); paintLinks(b); say('revoked'); }
    if (x.dataset.merge) { NOTES = NOTES.concat(R.mergeFeedback({ url: x.dataset.merge })); paintNotes(b); hap('tick'); } });
  GJ.relay = { open: relay.open, close: relay.close, notes: function () { return NOTES.slice(); } };
  GJ.ozone.place({ id: 'relay', name: 'private relay', sub: 'your devices · review links', cl: 'share', open: relay.open });

  /* ---------- Essentials: one switch, and pins ---------- */
  var E = priv('essentials');
  GJ.essentialsHidden = function (id) { if (!E || !E.essentialsOn()) return false; var it = E.list().filter(function (x) { return x.id === id; })[0]; return !!it && it.state === 'hidden'; };
  var label = document.createElement('p'); label.id = 'ess-label'; label.textContent = 'essentials · preview stub'; document.body.appendChild(label);
  function essPaint() { var on = E.essentialsOn(); html().classList.toggle('essentials', on); var b = tune && tune.querySelector('[data-t="essentials"] b'); if (b) b.textContent = on ? 'on' : 'off';
    var pins = tune && tune.querySelector('#tn-pins'); if (pins) pins.innerHTML = E.list().filter(function (x) { return ['sky', 'moon', 'mark', 'archive'].indexOf(x.id) < 0; }).map(function (x) { var p = E.pinned().indexOf(x.id) >= 0; return '<button type="button" data-ess="' + x.id + '" aria-pressed="' + p + '">' + esc(x.label) + (p ? ' · pinned' : '') + '</button>'; }).join('');
    if (GJ.app && GJ.app.layout) GJ.app.layout(); }
  function html() { return document.documentElement; }
  if (E) {
    /* the switch and the pins live in the store too, so Tune's own reset and reset-all cover them */
    function fromStore() { var st = store.get(); if (!!st.essentials !== E.essentialsOn()) E.setEssentials(!!st.essentials);
      var want = st.essPins || [], have = E.pinned(); have.forEach(function (id) { if (want.indexOf(id) < 0) E.setPinned({ roomId: id, pinned: false }); }); want.forEach(function (id) { if (have.indexOf(id) < 0) E.setPinned({ roomId: id, pinned: true }); }); }
    E.on('changed', essPaint);
    if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return; var st = store.get();
      if (x.dataset.t === 'essentials') { store.set({ essentials: !st.essentials }); hap('tick'); }
      if (x.dataset.ess) { var p = (st.essPins || []).filter(function (q) { return q !== x.dataset.ess; }); if (x.getAttribute('aria-pressed') !== 'true') p.push(x.dataset.ess); store.set({ essPins: p }); hap('tick'); } });
    store.on(function (s, prev) { fromStore(); if (prev && s.room && s.room !== prev.room) E.record({ roomId: s.room, at: Date.now() }); });
    setTimeout(function () { fromStore(); essPaint(); }, 0);
  }

  /* ---------- Add to Archive ---------- */
  var MI = priv('motionIndex'), SET = [], LOG = [];
  function sha(buf) { try { return crypto.subtle.digest('SHA-256', buf).then(function (h) { return Array.from(new Uint8Array(h)).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }); } catch (e) { return Promise.resolve('no checksum here'); } }
  function kindOf(f) { return /^image\//.test(f.type) ? 'still' : /^video\//.test(f.type) ? 'clip' : /^audio\//.test(f.type) ? 'audio' : /\.(obj|glb|usdz|ply)$/i.test(f.name) ? 'scan' : 'document'; }
  function meta(f, it) { return new Promise(function (res) { var u = URL.createObjectURL(f); it.url = u;
    if (it.kind === 'still') { var im = new Image(); im.onload = function () { it.dims = im.naturalWidth + ' × ' + im.naturalHeight; res(); }; im.onerror = res; im.src = u; }
    else if (it.kind === 'clip' || it.kind === 'audio') { var m = document.createElement(it.kind === 'clip' ? 'video' : 'audio'); m.preload = 'metadata'; m.onloadedmetadata = function () { it.dur = Math.round(m.duration) + ' s'; if (m.videoWidth) it.dims = m.videoWidth + ' × ' + m.videoHeight; res(); }; m.onerror = res; m.src = u; }
    else res(); }); }
  var add = P({ id: 'ozadd', title: 'Add to Archive', tall: true, sub: 'bring your own files in · kept exact, never recompressed, never graded',
    foot: 'everything comes in private · publishing is a separate step · indexing is a preview stub here',
    build: function (b) {
      b.innerHTML = '<div class="oz-grp"><label class="oz-row ad-pick">bring in photos, video, audio, scans or documents<input type="file" multiple hidden></label><button type="button" class="oz-row" data-a="example">use example files<span>marked example</span></button></div>' +
        '<div class="ad-list"></div><div class="ad-home" hidden><h3 class="jul">a home for them</h3><div class="oz-grp"><label class="oz-row">home<input type="text" class="ad-hn" aria-label="the home for this set"></label><p class="oz-line quiet ad-hint"></p>' +
        '<button type="button" class="oz-row" data-a="confirm">confirm the home<span>›</span></button></div></div><div class="ad-set" hidden></div><h3 class="jul">ingest log</h3><div class="oz-grp ad-log"><p class="oz-line quiet">nothing yet</p></div>';
      b.querySelector('input[type=file]').addEventListener('change', function () { take([].slice.call(this.files)); this.value = ''; });
      paintLog(b);
    } });
  function take(files, example) {
    var b = add.body; if (!files.length) return;
    var known = SET.map(function (x) { return x.sum; }).concat(LOG.map(function (x) { return x.sum; }));
    Promise.all(files.map(function (f) { var it = { name: f.name, size: f.size, type: f.type, kind: kindOf(f), date: f.lastModified || Date.now(), example: !!example, file: f };
      return f.arrayBuffer().then(function (buf) { return sha(buf); }).then(function (h) { it.sum = h; it.dup = known.indexOf(h) >= 0; return meta(f, it); }).then(function () { return it; }); }))
      .then(function (items) { items.forEach(function (it, i) { if (SET.some(function (x) { return x.sum === it.sum; }) || items.slice(0, i).some(function (x) { return x.sum === it.sum; })) it.dup = true; }); SET = SET.concat(items); paintList(b); });
  }
  function paintList(b) {
    b.querySelector('.ad-list').innerHTML = SET.length ? '<h3 class="jul">coming in · ' + SET.length + '</h3><div class="oz-grp">' + SET.map(function (x, i) { return '<div class="oz-line ad-it">' + (x.kind === 'still' ? '<img src="' + x.url + '" alt="">' : '<i class="ad-k">' + x.kind + '</i>') +
      '<span><b>' + esc(x.name) + '</b>' + (x.example ? ' · example' : '') + '<br><small>' + [x.kind, x.dims, x.dur, Math.round(x.size / 1024) + ' KB', day(x.date)].filter(Boolean).join(' · ') + '<br>checksum ' + esc(String(x.sum).slice(0, 16)) + '… · copied exact' + (x.dup ? ' · <em>an exact duplicate · kept, you choose</em>' : '') + '</small></span>' +
      (x.dup ? '<button type="button" data-drop="' + i + '">leave it out</button>' : '') + '</div>'; }).join('') + '</div>' : '';
    var home = b.querySelector('.ad-home'); home.hidden = !SET.length;
    if (SET.length) { var d0 = SET.map(function (x) { return x.date; }).sort()[0]; b.querySelector('.ad-hn').value = b.querySelector('.ad-hn').value || 'a day · ' + day(d0); b.querySelector('.ad-hint').textContent = 'suggested from the files’ own dates · change it if it’s wrong'; }
  }
  function paintLog(b) { b.querySelector('.ad-log').innerHTML = LOG.length ? LOG.slice(-12).reverse().map(function (l) { return '<p class="oz-line quiet">' + esc(l.name) + ' · ' + esc(l.home) + ' · ' + new Date(l.at).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }) + ' · ' + esc(String(l.sum).slice(0, 10)) + '…</p>'; }).join('') : '<p class="oz-line quiet">nothing yet</p>'; }
  add.el.addEventListener('click', function (e) { var x = e.target.closest('button'); if (!x) return; var b = add.body;
    if (x.dataset.a === 'example') { var S_ = (G.GJ_SAMPLES || []).slice(0, 3); Promise.all(S_.map(function (s, i) { return fetch(s.file).then(function (r) { return r.blob(); }).then(function (bl) { return new File([bl], 'example-' + (i + 1) + '.jpg', { type: 'image/jpeg', lastModified: Date.now() - 864e5 * (i + 1) }); }); })).then(function (fs) { fs.push(fs[0]); take(fs, true); }); }
    if (x.dataset.drop != null) { SET.splice(+x.dataset.drop, 1); paintList(b); }
    if (x.dataset.a === 'confirm') { var home = b.querySelector('.ad-hn').value.trim() || 'unsorted';
      SET.forEach(function (it) { LOG.push({ name: it.name, home: home, at: Date.now(), sum: it.sum }); if (GJ.keep) GJ.keep.put('add:' + it.sum, it.file); });
      var clips = SET.filter(function (it) { return it.kind === 'clip'; }); clips.forEach(function (c) { if (MI) MI.index({ source: { name: c.name }, layout: 'grid', density: 'default' }); });
      var set = b.querySelector('.ad-set'); set.hidden = false; set.innerHTML = '<h3 class="jul">the new set · ' + esc(home) + '</h3><div class="ad-sheet">' + SET.map(function (it, i) { return '<figure>' + (it.kind === 'still' ? '<img src="' + it.url + '" alt="' + esc(it.name) + '">' : '<i class="ad-k">' + it.kind + '</i>') + '<figcaption>' + esc(it.name) + '</figcaption><span><button type="button" data-rv="' + i + ':1" aria-label="heart">♥</button><button type="button" data-rv="' + i + ':-1" aria-label="pass">✕</button></span></figure>'; }).join('') + '</div>' +
        '<p class="oz-line quiet">' + (clips.length ? clips.length + ' clip' + (clips.length > 1 ? 's' : '') + ' sent to Motion Index · preview stub · ' : '') + 'kept on this phone · it glides into its place with your own frames</p>';
      SET = []; b.querySelector('.ad-list').innerHTML = ''; b.querySelector('.ad-home').hidden = true; paintLog(b); hap('commit'); set.scrollIntoView({ behavior: 'smooth' }); }
    if (x.dataset.rv) { x.parentNode.querySelectorAll('button').forEach(function (q) { q.setAttribute('aria-pressed', q === x ? 'true' : 'false'); }); hap('tick'); } });
  GJ.addArchive = { open: add.open, close: add.close, take: take };
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t;
    if (k === 'ozrelay') relay.open(); if (k === 'ozadd') add.open(); if (k === 'ozscan' && GJ.scanner) GJ.scanner.open(); if (k === 'ozmake' && GJ.make) GJ.make.open(); });
  GJ.ozone.place({ id: 'addarchive', name: 'add to archive', sub: 'your own files, kept exact', cl: 'review', open: add.open });
})(window);
