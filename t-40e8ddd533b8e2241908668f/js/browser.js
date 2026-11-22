/* oz next (item 13) · the Browser: stripped, in oz's own style. The main bar holds three things, always in the same place:
   the address line, the reader toggle, and the app's own red-mode disc (the chrome's, top right). Nothing else lives on it.
   Reader is first: clean text and images in oz type, the full site one tap away. Navigable sites (web apps, maps,
   dashboards, dev previews) open as the full site. The choice is remembered per site. A first visit that is unclear opens
   in reader (Tune can change that) — a plain labelled rule, not a classifier: a page marks itself navigable, or it is a
   preview on this machine, or you chose.
   Tabs are feed groups: constellations whose stars hold saved pages and feeds as visual cards. Arrange them by topic,
   project, time, source, or freeform; switching only rearranges. Drag a card onto another star to move it. Pinch out
   rises to the map; pinch in goes to a group, then a page. Select by tapping (select mode) or a lasso (hold and draw);
   then move, save, archive, share, open side by side, or close. In a group's feed, swipe right saves and left archives,
   each with undo and a gentle haptic. Dev mode: a URL at phone, watch and Mac sizes, pinned as stars in a project group,
   reloaded by hand (or every 10 s, labelled: a stand-in for a build watch), and two builds side by side.
   Quiet: no infinite feed, no autoplay. Photos on a page are never tinted, except in Full red mode. F3 lights only when a
   page comes from the network. Example pages are marked example. Kept on this phone (localStorage oz-browser).   GJ.browser */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement, esc = GJ.ozone ? GJ.ozone.esc : String, tune = document.getElementById('tune'), KEY = 'oz-browser', DAY = 864e5;
  function hap(k) { if (store.get().brHaptic === false) return; try { GJ.haptic[k](); } catch (e) {} }
  function say(t, ms) { if (GJ.mark && GJ.mark.say) GJ.mark.say(t, ms || 1800); }
  var EX = 'apps/browser/examples/';
  var B = { groups: [], cards: [], n: 1, sites: {}, pos: {} };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.cards) B = Object.assign(B, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(B)); } catch (e) {} }
  if (!B.cards.length) {   // example groups and pages, all marked example
    var now = Date.now();
    B.groups = [{ id: 'studio', name: 'studio' }, { id: 'reading', name: 'reading' }, { id: 'builds', name: 'site builds' }, { id: 'notes', name: 'notes' }];
    [['example · the quiet path', EX + 'quiet-path.html', 'reading', null, 'article', 0], ['example · light-tide notes', EX + 'light-notes.html', 'studio', 'oz', 'article', 1],
     ['example · a map', EX + 'map.html', 'studio', null, 'navigable', 2], ['example · a dashboard', EX + 'dashboard.html', 'builds', 'oz', 'navigable', 3],
     ['preview · this build', 'apps/oz/index.html', 'builds', 'oz', 'dev', 0], ['preview · good weather', 'apps/good-weather/index.html', 'builds', 'oz', 'dev', 1],
     ['example · a small newsletter', EX + 'newsletter.html', 'reading', null, 'feed', 5], ['example · winter stills', EX + 'light-notes.html', 'notes', null, 'article', 40]]
      .forEach(function (c) { B.cards.push({ id: B.n++, title: c[0], url: c[1], group: c[2], project: c[3], kind: c[4], at: now - c[5] * DAY, example: c[0].indexOf('example') === 0, state: 'open' }); });
    save();
  }
  function host(u) { try { return new URL(u, document.baseURI).host || 'this phone'; } catch (e) { return u; } }
  function local(u) { try { return new URL(u, document.baseURI).origin === G.location.origin; } catch (e) { return false; } }
  function card(id) { return B.cards.filter(function (c) { return c.id === id; })[0]; }
  function live() { return B.cards.filter(function (c) { return c.state === 'open' || c.state === 'saved'; }); }

  /* ---------- clusters: how the same cards are arranged ---------- */
  var VIEWS = ['topic', 'project', 'time', 'source', 'freeform'];
  function view() { return store.get().brView || 'topic'; }
  function clusterOf(c, v) { v = v || view(); if (v === 'project') return c.project || 'no project'; if (v === 'time') { var a = Date.now() - c.at; return a < DAY ? 'today' : a < 7 * DAY ? 'this week' : 'earlier'; } if (v === 'source') return host(c.url); return c.group; }
  function clusters() { var v = view(), out = [], seen = {};
    if (v === 'topic' || v === 'freeform') B.groups.forEach(function (g) { seen[g.id] = 1; out.push({ id: g.id, name: g.name }); });
    live().forEach(function (c) { var k = clusterOf(c); if (!seen[k]) { seen[k] = 1; out.push({ id: k, name: k }); } });
    if (v === 'time') out.sort(function (a, b) { return ['today', 'this week', 'earlier'].indexOf(a.id) - ['today', 'this week', 'earlier'].indexOf(b.id); });
    return out; }
  function depthOf(c) { if (cur && cur.id === c.id) return 'here'; var a = Date.now() - c.at; return c.touched && Date.now() - c.touched < 6e4 ? 'near' : a < 2 * DAY ? 'near' : a < 14 * DAY ? 'mid' : 'far'; }

  /* ---------- the room ---------- */
  var el = document.createElement('div'); el.id = 'br'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Browser');
  el.innerHTML = '<div class="br-bar"><input class="br-addr" type="text" inputmode="url" enterkeyhint="go" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="search or open" aria-label="an address, or a search you type">' +
    '<button type="button" class="br-rt" role="switch" aria-checked="true" aria-label="reader: on, tap for the full site"><span>reader</span><i></i></button></div>' +
    '<div class="br-sub"><button type="button" class="br-chip br-view" aria-label="arrange the groups by">topic</button><button type="button" class="br-chip" data-a="select" aria-pressed="false">select</button><button type="button" class="br-chip" data-a="dev">dev</button><button type="button" class="br-chip" data-a="newgroup">+ group</button><span class="br-where quiet"></span></div>' +
    '<div class="br-map" aria-label="feed groups"><svg class="br-lines" aria-hidden="true"></svg><div class="br-stars"></div><svg class="br-lasso" aria-hidden="true"><path></path></svg></div>' +
    '<div class="br-group" hidden><h3 class="jul br-gname"></h3><p class="quiet br-ghint">swipe right to save · left to archive · this is all of it</p><div class="br-feed" role="list"></div></div>' +
    '<div class="br-page" hidden><div class="br-reader"></div><div class="br-site"><iframe title="the page" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer"></iframe><p class="br-note quiet"></p></div></div>' +
    '<div class="br-dev" hidden><div class="br-devbar"><input class="br-devurl" type="text" aria-label="the address to preview" value="apps/oz/index.html"><button type="button" class="br-chip" data-a="reload">reload</button><button type="button" class="br-chip" data-a="pin">pin as a star</button></div>' +
    '<p class="quiet br-auto"></p><div class="br-sizes"></div><h3 class="jul">compare · two builds</h3><div class="br-devbar"><input class="br-ca" type="text" aria-label="build A" value="apps/oz/index.html"><input class="br-cb" type="text" aria-label="build B" value="apps/good-weather/index.html"><button type="button" class="br-chip" data-a="compare">compare</button></div><div class="br-cmp"></div></div>' +
    '<div class="br-act" hidden role="toolbar" aria-label="act on the selection"><span class="br-n"></span><button type="button" data-x="move">move</button><button type="button" data-x="save">save</button><button type="button" data-x="archive">archive</button><button type="button" data-x="share">share</button><button type="button" data-x="side">side by side</button><button type="button" data-x="close">close</button></div>' +
    '<div class="br-toast" hidden role="status"><span></span><button type="button" data-a="undo">undo</button></div><div class="br-sheet" hidden></div>';
  document.body.appendChild(el);
  var Q = function (s) { return el.querySelector(s); }, mapEl = Q('.br-map'), starsEl = Q('.br-stars'), lines = Q('.br-lines'), addr = Q('.br-addr'), rt = Q('.br-rt'), frame = Q('iframe');
  var level = 'map', grp = null, cur = null, sel = [], selecting = false, on = false, mode = 'reader', undo = null, autoT = 0;

  function setLevel(l) { level = l; Q('.br-map').hidden = l !== 'map'; Q('.br-group').hidden = l !== 'group'; Q('.br-page').hidden = l !== 'page'; Q('.br-dev').hidden = l !== 'dev'; Q('.br-sub').hidden = l === 'page';
    el.dataset.level = l; rt.disabled = l !== 'page'; paint(); }
  function paint() {
    Q('.br-view').textContent = view(); Q('[data-a="select"]').setAttribute('aria-pressed', selecting ? 'true' : 'false');
    Q('.br-where').textContent = level === 'group' ? (clusters().filter(function (c) { return c.id === grp; })[0] || { name: grp }).name : '';
    if (level === 'map') paintMap(); if (level === 'group') paintGroup();
    Q('.br-act').hidden = !sel.length; Q('.br-n').textContent = sel.length + ' chosen';
    rt.setAttribute('aria-checked', mode === 'reader' ? 'true' : 'false'); rt.classList.toggle('site', mode !== 'reader'); rt.querySelector('span').textContent = mode === 'reader' ? 'reader' : 'site'; rt.setAttribute('aria-label', mode === 'reader' ? 'reader: on, tap for the full site' : 'full site: on, tap for reader');
  }
  function paintMap() {   // the stars in a loose grid (or where you put them, in freeform); each star's cards hang under it
    var W = mapEl.clientWidth || 390, H = mapEl.clientHeight || 600, cs = clusters(), v = view(), L = '', h = '', cols = cs.length > 4 ? 3 : 2, rows = Math.ceil(cs.length / cols);
    cs.forEach(function (c, i) {
      var col = i % cols, row = Math.floor(i / cols), auto = { x: (col + .5) / cols + (row % 2 ? .06 : -.04), y: .1 + row * (.86 / Math.max(1, rows)) }, p = v === 'freeform' && B.pos[c.id] ? B.pos[c.id] : auto, x = p.x * W, y = p.y * H;
      var cards = live().filter(function (k) { return clusterOf(k) === c.id; }), d = cards.some(function (k) { return depthOf(k) === 'here'; }) ? 'here' : cards.length ? (cards.some(function (k) { return depthOf(k) === 'near'; }) ? 'near' : 'mid') : 'far';
      h += '<button type="button" class="br-star d-' + d + '" data-g="' + esc(c.id) + '" style="left:' + x + 'px;top:' + y + 'px" aria-label="the group ' + esc(c.name) + ', ' + cards.length + ' cards"><i></i><span>' + esc(c.name) + '</span></button>';
      var cw = Math.min(150, W / cols - 16), per = Math.max(1, Math.floor(((.86 / Math.max(1, rows)) * H - 60) / 46));
      cards.slice(0, per).forEach(function (k, j) { var cx = Math.max(6, Math.min(W - cw - 6, x - cw / 2)), cy = y + 34 + j * 46;
        L += '<line x1="' + x + '" y1="' + (y + 8) + '" x2="' + (cx + 10) + '" y2="' + (cy + 20) + '"></line>';
        h += '<button type="button" class="br-card d-' + depthOf(k) + (sel.indexOf(k.id) >= 0 ? ' chosen' : '') + '" data-c="' + k.id + '" style="left:' + cx + 'px;top:' + cy + 'px;width:' + cw + 'px" aria-label="' + esc(k.title) + (sel.indexOf(k.id) >= 0 ? ', chosen' : '') + '"><b>' + esc(k.title) + '</b><span>' + esc(k.kind === 'dev' ? 'preview · ' + host(k.url) : k.kind) + (k.state === 'saved' ? ' · saved' : '') + '</span></button>'; });
      if (cards.length > per) h += '<button type="button" class="br-more" data-g="' + esc(c.id) + '" style="left:' + (x - 30) + 'px;top:' + (y + 34 + per * 46) + 'px">+' + (cards.length - per) + ' more</button>';
    });
    starsEl.innerHTML = h; lines.setAttribute('viewBox', '0 0 ' + W + ' ' + H); lines.innerHTML = L;
  }
  function paintGroup() {
    var cards = live().filter(function (k) { return clusterOf(k) === grp; });
    Q('.br-gname').textContent = (clusters().filter(function (c) { return c.id === grp; })[0] || { name: grp }).name;
    Q('.br-feed').innerHTML = cards.map(function (k) { return '<div class="br-fc d-' + depthOf(k) + (sel.indexOf(k.id) >= 0 ? ' chosen' : '') + '" role="listitem" data-c="' + k.id + '" tabindex="0" aria-label="' + esc(k.title) + '"><b>' + esc(k.title) + '</b><span>' + esc(host(k.url)) + ' · ' + k.kind + (k.state === 'saved' ? ' · saved' : '') + '</span><i class="br-sw-l">archive</i><i class="br-sw-r">save</i></div>'; }).join('') || '<p class="quiet">nothing here · this group is empty</p>';
  }

  /* ---------- a page: reader first, the full site one tap away ---------- */
  function navigable(u, doc) { if (doc && doc.querySelector('meta[name="oz-kind"][content="navigable"]')) return true; var c = B.cards.filter(function (k) { return k.url === u; })[0]; if (c && (c.kind === 'navigable' || c.kind === 'dev')) return true; return (!local(u) && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host(u))) || /apps\/[a-z-]+\/index\.html/.test(u); }   // a preview on a local server, or one of these apps
  function firstMode(u) { var h = host(u) + (local(u) ? new URL(u, document.baseURI).pathname : ''); if (B.sites[h]) return B.sites[h]; if (navigable(u)) return 'site'; return store.get().brUnclear === 'site' ? 'site' : 'reader'; }
  function siteKey(u) { return host(u) + (local(u) ? new URL(u, document.baseURI).pathname : ''); }
  function openURL(u, c) {
    u = u.trim(); if (!u) return; if (!/^[a-z]+:|^apps\/|^\.\.?\//i.test(u)) u = /\s/.test(u) || !/\./.test(u) ? 'https://duckduckgo.com/html/?q=' + encodeURIComponent(u) : 'https://' + u;
    cur = c || B.cards.filter(function (k) { return k.url === u; })[0] || { id: 0, title: u, url: u, kind: 'page' }; if (cur.id) { cur.touched = Date.now(); save(); }
    addr.value = cur.title && cur.example ? cur.title : u; mode = firstMode(u); setLevel('page'); show(); }
  function show() {
    var u = cur.url, R = Q('.br-reader'), S = Q('.br-site'); R.hidden = mode !== 'reader'; S.hidden = mode === 'reader'; paint();
    if (mode === 'site') { if (frame.dataset.u !== u) { frame.dataset.u = u; var done = !local(u) && GJ.f3 && GJ.f3.page ? GJ.f3.page(u) : null; frame.onload = function () { if (done) { done('loaded'); done = null; } }; frame.src = u;
      Q('.br-note').textContent = local(u) ? (cur.example ? 'example page · held on this phone' : 'on this phone') : 'from the network · F3 shows it · some sites will not show inside another page'; } return; }
    if (!local(u)) { R.innerHTML = '<article class="br-art"><h1>' + esc(host(u)) + '</h1><p class="br-meta">reader · preview stub</p><p>Reader needs the phone’s own web view to read a live page. Here it opens pages held on this phone. Tap <b>site</b> for the full site.</p></article>'; return; }
    R.innerHTML = '<p class="quiet">reading…</p>';
    fetch(u).then(function (r) { return r.text(); }).then(function (t) {
      var d = new DOMParser().parseFromString(t, 'text/html'); if (navigable(u, d) && !B.sites[siteKey(u)]) { mode = 'site'; show(); return; }
      var a = d.querySelector('article') || d.body, base = new URL(u, document.baseURI), h = '<article class="br-art">';
      h += '<h1>' + esc((a.querySelector('h1') || d.querySelector('title') || { textContent: '' }).textContent) + '</h1>';
      var m = a.querySelector('.meta'); if (m) h += '<p class="br-meta">' + esc(m.textContent) + '</p>';
      [].forEach.call(a.querySelectorAll('img, p:not(.meta)'), function (n) { if (n.tagName === 'IMG') h += '<img src="' + esc(new URL(n.getAttribute('src'), base).href) + '" alt="' + esc(n.alt || '') + '">'; else h += '<p>' + esc(n.textContent) + '</p>'; });
      R.innerHTML = h + '<p class="br-end quiet">the end of the page</p></article>';
    }).catch(function () { R.innerHTML = '<p class="quiet">this page could not be read here · try the full site</p>'; });
  }
  rt.addEventListener('click', function () { if (level !== 'page' || !cur) return; mode = mode === 'reader' ? 'site' : 'reader'; B.sites[siteKey(cur.url)] = mode; save(); show(); hap('tick'); });
  addr.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); openURL(addr.value); addr.blur(); } });

  /* ---------- dev mode: sizes, pins, reload, compare ---------- */
  var SIZES = [['phone', 390, 844], ['watch', 198, 242], ['mac', 1280, 800]];
  function frameAt(u, w, h, s, label) { return '<figure class="br-dv"><div class="br-dvbox" style="width:' + Math.round(w * s) + 'px;height:' + Math.round(h * s) + 'px"><iframe title="' + esc(label) + '" src="' + esc(u) + '" style="width:' + w + 'px;height:' + h + 'px;transform:scale(' + s + ')" sandbox="allow-scripts allow-same-origin"></iframe></div><figcaption>' + esc(label) + '</figcaption></figure>'; }
  function devPaint() { var u = Q('.br-devurl').value.trim(); if (!local(u) && GJ.f3 && GJ.f3.page) { var d = GJ.f3.page(u); setTimeout(function () { d('loaded'); }, 600); }
    Q('.br-sizes').innerHTML = SIZES.map(function (z) { var s = z[0] === 'mac' ? .26 : z[0] === 'watch' ? .62 : .36; return frameAt(u, z[1], z[2], s, z[0] + ' · ' + z[1] + '×' + z[2]); }).join('');
    Q('.br-auto').textContent = store.get().brAuto ? 'reloads every 10 s · a stand-in for a build watch · preview stub' : 'reload by hand · auto-reload is off (Tune → Browser)'; }
  function autoOn() { clearInterval(autoT); if (store.get().brAuto && on && level === 'dev') autoT = setInterval(devPaint, 10000); }
  function compare(a, b) { var s = .3; Q('.br-cmp').innerHTML = '<div class="br-pair">' + frameAt(a, 390, 844, s, 'A · ' + a) + frameAt(b, 390, 844, s, 'B · ' + b) + '</div>'; }

  /* ---------- selection, swipes, drags, pinches ---------- */
  function toggle(id) { var i = sel.indexOf(id); if (i >= 0) sel.splice(i, 1); else sel.push(id); hap('tick'); paint(); }
  function toast(t, fn) { undo = fn; var x = Q('.br-toast'); x.querySelector('span').textContent = t; x.hidden = false; clearTimeout(x._t); x._t = setTimeout(function () { x.hidden = true; undo = null; }, 4200); }
  function act(x, ids) {
    var cs = ids.map(card).filter(Boolean), was = cs.map(function (c) { return { c: c, state: c.state, group: c.group, project: c.project }; });
    var back = function () { was.forEach(function (w) { w.c.state = w.state; w.c.group = w.group; w.c.project = w.project; }); save(); paint(); };
    if (x === 'save') { cs.forEach(function (c) { c.state = 'saved'; }); toast(cs.length + ' saved', back); }
    if (x === 'archive') { cs.forEach(function (c) { c.state = 'archived'; }); toast(cs.length + ' archived · recoverable', back); }
    if (x === 'close') { cs.forEach(function (c) { c.state = 'closed'; }); toast(cs.length + ' closed', back); }
    if (x === 'share') { var t = cs.map(function (c) { return c.title + ' · ' + new URL(c.url, document.baseURI).href; }).join('\n'); if (navigator.share) navigator.share({ text: t }).catch(function () {}); else { try { navigator.clipboard.writeText(t); } catch (e) {} say('copied · yours to share'); } }
    if (x === 'side') { if (cs.length < 2) { say('choose two to see side by side'); return; } setLevel('dev'); Q('.br-ca').value = cs[0].url; Q('.br-cb').value = cs[1].url; devPaint(); compare(cs[0].url, cs[1].url); }
    if (x === 'move') { sheet('<b class="jul">move to</b>' + clusters().filter(function (c) { return view() === 'topic' || view() === 'freeform' || view() === 'project'; }).map(function (c) { return '<button type="button" data-to="' + esc(c.id) + '">' + esc(c.name) + '</button>'; }).join('') + (view() === 'time' || view() === 'source' ? '<p class="quiet">arranged by ' + view() + ' · switch to topic or project to move cards</p>' : ''), ids); return; }
    sel = []; save(); hap('commit'); paint();
  }
  function moveTo(ids, g) { var v = view(); ids.map(card).forEach(function (c) { if (!c) return; if (v === 'project') c.project = g === 'no project' ? null : g; else c.group = g; c.touched = Date.now(); }); sel = []; save(); hap('commit'); paint(); }
  function sheet(h, ids) { var s = Q('.br-sheet'); s.innerHTML = h + '<button type="button" data-to="">not now</button>'; s.hidden = false; s._ids = ids; }
  Q('.br-sheet').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var s = Q('.br-sheet'); s.hidden = true; if (b.dataset.to === 'NEW') return; if (b.dataset.to) moveTo(s._ids, b.dataset.to); });
  el.addEventListener('click', function (e) {
    var x = e.target.closest('button'); if (!x || !el.contains(x)) return;
    if (x.classList.contains('br-view')) { var v = VIEWS[(VIEWS.indexOf(view()) + 1) % VIEWS.length]; store.set({ brView: v }); paint(); hap('tick'); return; }
    if (x.dataset.a === 'select') { selecting = !selecting; if (!selecting) sel = []; paint(); return; }
    if (x.dataset.a === 'dev') { setLevel('dev'); devPaint(); autoOn(); return; }
    if (x.dataset.a === 'newgroup') { var nm = (G.prompt ? G.prompt('a new group') : '') || ''; nm = nm.trim(); if (nm) { B.groups.push({ id: 'g' + B.n++, name: nm.slice(0, 24) }); save(); paint(); } return; }
    if (x.dataset.a === 'reload') { devPaint(); hap('tick'); return; }
    if (x.dataset.a === 'pin') { var u = Q('.br-devurl').value.trim(); if (!B.groups.some(function (g) { return g.id === 'builds'; })) B.groups.push({ id: 'builds', name: 'site builds' }); B.cards.push({ id: B.n++, title: 'preview · ' + u.replace(/^apps\//, '').replace(/\/index\.html$/, ''), url: u, group: 'builds', project: 'oz', kind: 'dev', at: Date.now(), state: 'open' }); save(); say('pinned · a star in site builds'); return; }
    if (x.dataset.a === 'compare') { compare(Q('.br-ca').value.trim(), Q('.br-cb').value.trim()); return; }
    if (x.dataset.a === 'undo') { Q('.br-toast').hidden = true; if (undo) { undo(); undo = null; } return; }
    if (x.dataset.x) { act(x.dataset.x, sel.slice()); return; }
    if (x.classList.contains('br-more')) { grp = x.dataset.g; setLevel('group'); return; }
    if (x.classList.contains('br-star')) { if (dragged) return; grp = x.dataset.g; setLevel('group'); hap('tick'); return; }
    if (x.classList.contains('br-card')) { if (dragged) return; var id = +x.dataset.c; if (selecting) toggle(id); else openURL(card(id).url, card(id)); return; }
  });
  Q('.br-feed').addEventListener('click', function (e) { var f = e.target.closest('.br-fc'); if (!f || swiped) return; var id = +f.dataset.c; if (selecting) toggle(id); else openURL(card(id).url, card(id)); });
  // swipes in a group's feed: right saves, left archives, each with undo
  var sw = null, swiped = false;
  Q('.br-feed').addEventListener('pointerdown', function (e) { var f = e.target.closest('.br-fc'); if (!f) return; sw = { f: f, x: e.clientX, y: e.clientY, on: false }; swiped = false; });
  G.addEventListener('pointermove', function (e) { if (!sw) return; var dx = e.clientX - sw.x, dy = e.clientY - sw.y; if (!sw.on && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) sw.on = true; if (sw.on) { sw.f.style.transform = 'translateX(' + dx + 'px)'; sw.f.classList.toggle('to-r', dx > 70); sw.f.classList.toggle('to-l', dx < -70); } });
  G.addEventListener('pointerup', function (e) { if (!sw) return; var s = sw; sw = null; if (!s.on) return; swiped = true; setTimeout(function () { swiped = false; }, 50); var dx = e.clientX - s.x; s.f.style.transform = '';
    if (dx > 70) act('save', [+s.f.dataset.c]); else if (dx < -70) act('archive', [+s.f.dataset.c]); });
  // on the map: drag a card onto a star to move it; drag a star (freeform) to place it; hold empty space and draw a lasso
  var dg = null, dragged = false, lasso = null;
  mapEl.addEventListener('pointerdown', function (e) { if (pz.n) return; var t = e.target.closest('.br-card, .br-star'); dragged = false;
    if (t) { dg = { t: t, x: e.clientX, y: e.clientY, l: parseFloat(t.style.left), tp: parseFloat(t.style.top) }; return; }
    lasso = { pts: [[e.clientX, e.clientY]], t: setTimeout(function () { if (lasso) { lasso.on = true; hap('tick'); } }, 380) }; });
  G.addEventListener('pointermove', function (e) { if (dg) { var dx = e.clientX - dg.x, dy = e.clientY - dg.y; if (!dragged && Math.hypot(dx, dy) > 8) { dragged = true; dg.t.classList.add('dragging'); } if (dragged) { dg.t.style.left = (dg.l + dx) + 'px'; dg.t.style.top = (dg.tp + dy) + 'px'; } }
    if (lasso) { if (!lasso.on) { if (Math.hypot(e.clientX - lasso.pts[0][0], e.clientY - lasso.pts[0][1]) > 10) { clearTimeout(lasso.t); lasso = null; } return; } lasso.pts.push([e.clientX, e.clientY]); var r = mapEl.getBoundingClientRect(); Q('.br-lasso path').setAttribute('d', 'M' + lasso.pts.map(function (p) { return (p[0] - r.left) + ' ' + (p[1] - r.top); }).join(' L') + ' Z'); } });
  G.addEventListener('pointerup', function (e) {
    if (dg) { var d = dg; dg = null; d.t.classList.remove('dragging'); if (dragged) { setTimeout(function () { dragged = false; }, 60);
      if (d.t.classList.contains('br-card')) { d.t.style.visibility = 'hidden'; var under = document.elementFromPoint(e.clientX, e.clientY), st = under && under.closest('.br-star'); d.t.style.visibility = '';
        if (st && (view() === 'topic' || view() === 'freeform' || view() === 'project')) moveTo([+d.t.dataset.c], st.dataset.g); else { if (st) say('arranged by ' + view() + ' · switch to topic to move'); paint(); } }
      else if (view() === 'freeform') { var r = mapEl.getBoundingClientRect(); B.pos[d.t.dataset.g] = { x: (parseFloat(d.t.style.left)) / r.width, y: parseFloat(d.t.style.top) / r.height }; save(); paint(); } else paint(); } }
    if (lasso) { var L = lasso; lasso = null; clearTimeout(L.t); Q('.br-lasso path').setAttribute('d', ''); if (L.on && L.pts.length > 3) { [].forEach.call(starsEl.querySelectorAll('.br-card'), function (c) { var b = c.getBoundingClientRect(); if (inside(b.left + b.width / 2, b.top + b.height / 2, L.pts) && sel.indexOf(+c.dataset.c) < 0) sel.push(+c.dataset.c); }); selecting = true; hap('commit'); paint(); } } });
  function inside(x, y, P) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { if (((P[i][1] > y) !== (P[j][1] > y)) && (x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; } return c; }
  // pinch: out rises a level (page → group → map); in goes deeper (map → the group under the fingers → its first page)
  var pz = { n: 0, p: {}, d: 0, done: false };
  el.addEventListener('pointerdown', function (e) { pz.p[e.pointerId] = [e.clientX, e.clientY]; pz.n = Object.keys(pz.p).length; if (pz.n === 2) { var k = Object.keys(pz.p), a = pz.p[k[0]], b = pz.p[k[1]]; pz.d = Math.hypot(a[0] - b[0], a[1] - b[1]); pz.m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; pz.done = false; dg = null; lasso = null; } }, true);
  el.addEventListener('pointermove', function (e) { if (!pz.p[e.pointerId]) return; pz.p[e.pointerId] = [e.clientX, e.clientY]; if (pz.n !== 2 || pz.done) return; var k = Object.keys(pz.p), a = pz.p[k[0]], b = pz.p[k[1]], r = Math.hypot(a[0] - b[0], a[1] - b[1]) / pz.d;
    if (r < .7) { pz.done = true; rise(); } else if (r > 1.4) { pz.done = true; deeper(pz.m); } }, true);
  function pzEnd(e) { delete pz.p[e.pointerId]; pz.n = Object.keys(pz.p).length; }
  el.addEventListener('pointerup', pzEnd, true); el.addEventListener('pointercancel', pzEnd, true);
  el.addEventListener('gesturechange', function (e) { e.preventDefault(); if (pz.done) return; if (e.scale < .7) { pz.done = true; rise(); } else if (e.scale > 1.4) { pz.done = true; deeper([G.innerWidth / 2, G.innerHeight / 2]); } });
  el.addEventListener('gestureend', function () { pz.done = false; });
  function rise() { if (level === 'page') { if (cur && cur.id) { grp = clusterOf(cur); setLevel('group'); } else setLevel('map'); } else if (level === 'group' || level === 'dev') setLevel('map'); hap('tick'); }
  function deeper(m) { if (level === 'map') { var t = document.elementFromPoint(m[0], m[1]), s = t && t.closest('.br-star, .br-card'); if (s && s.classList.contains('br-card')) { var c = card(+s.dataset.c); openURL(c.url, c); return; } grp = s ? s.dataset.g : (clusters()[0] || {}).id; setLevel('group'); } else if (level === 'group') { var c1 = live().filter(function (k) { return clusterOf(k) === grp; })[0]; if (c1) openURL(c1.url, c1); } hap('tick'); }

  /* ---------- open, close, Back ---------- */
  function open() { if (on) return; on = true; el.hidden = false; html.classList.add('browsing'); setLevel('map'); requestAnimationFrame(paint); hap('commit'); }
  function close() { if (!on) return; on = false; el.hidden = true; html.classList.remove('browsing'); clearInterval(autoT); frame.src = 'about:blank'; frame.dataset.u = ''; Q('.br-sizes').innerHTML = ''; Q('.br-cmp').innerHTML = ''; }
  if (GJ.app && GJ.app.closeAny) { var c0 = GJ.app.closeAny; GJ.app.closeAny = function () { if (on) { if (!Q('.br-sheet').hidden) { Q('.br-sheet').hidden = true; return true; } if (sel.length) { sel = []; selecting = false; paint(); return true; } if (level !== 'map') { rise(); return true; } close(); return true; } return c0.apply(this, arguments); }; }
  G.addEventListener('resize', function () { if (on && level === 'map') paint(); });
  store.on(function (s, p) { if (on && p && (s.brView !== p.brView)) paint(); if (p && s.brAuto !== p.brAuto) autoOn(); });

  /* ---------- Tune → Browser ---------- */
  function T(k, v) { var b = tune && tune.querySelector('[data-t="' + k + '"] b'); if (b && b.textContent !== v) b.textContent = v; }
  function paintTune() { var s = store.get(); T('brunclear', s.brUnclear === 'site' ? 'full site' : 'reader'); T('brhaptic', s.brHaptic === false ? 'off' : 'on'); T('brauto', s.brAuto ? 'on' : 'off'); T('brview', s.brView || 'topic'); }
  store.on(paintTune); paintTune();
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (!x) return; var k = x.dataset.t, s = store.get();
    if (k === 'browser') { if (GJ.app.tune) GJ.app.tune(false); open(); }
    if (k === 'brunclear') store.set({ brUnclear: s.brUnclear === 'site' ? 'reader' : 'site' });
    if (k === 'brhaptic') store.set({ brHaptic: s.brHaptic === false });
    if (k === 'brauto') store.set({ brAuto: !s.brAuto });
    if (k === 'brview') store.set({ brView: VIEWS[(VIEWS.indexOf(s.brView || 'topic') + 1) % VIEWS.length] });
    if (k === 'brforget') { B.sites = {}; save(); say('per-site reader choices · forgotten'); } });
  GJ.browser = { open: open, close: close, isOpen: function () { return on; }, openURL: openURL, level: function () { return level; }, mode: function () { return mode; }, toggleReader: function () { rt.click(); }, group: function (g) { grp = g; setLevel('group'); }, map: function () { setLevel('map'); },
    dev: function (u) { setLevel('dev'); if (u) Q('.br-devurl').value = u; devPaint(); autoOn(); }, compare: compare, select: function (ids) { sel = ids.slice(); selecting = true; paint(); }, act: function (x) { act(x, sel.slice()); }, cards: function () { return B.cards.map(function (c) { return { id: c.id, title: c.title, group: c.group, state: c.state, kind: c.kind }; }); },
    swipe: function (id, dir) { act(dir > 0 ? 'save' : 'archive', [id]); }, rise: rise, deeper: deeper, view: view };
  if (GJ.ozone && GJ.ozone.place) GJ.ozone.place({ id: 'browser', name: 'browser', sub: 'stripped · feed groups, not tabs', cl: 'plan', open: open });
})(window);
