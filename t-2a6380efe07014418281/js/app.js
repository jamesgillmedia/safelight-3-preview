/* Photolab (v1's simple view), fed by the same data.json as the Constellation.
   Wide screen: a quiet star field, one star per work, related works joined by a hairline. Phone: the grouped sheet. The sheet button shows that grid on any screen.
   Open a work: its photographs fill the frame, with its deep path (3D orbit, film page, sky player, CV) and its neighbours underneath. Back or Escape returns. */
(function (w) {
  'use strict';
  var $ = function (id) { return document.getElementById(id) };
  var lab = $('lab'), sky = $('lsky'), sheet = $('lsheet'), work = $('lwork'), stage = $('lstage'), cap = $('lcap'), count = $('lcount'),
    types = $('ltypes'), nearRow = $('lnear'), hint = $('lhint'), where = $('lwhere'), back = $('lback'), sheetBtn = $('sheetBtn'), prev = $('lprev'), next = $('lnext');
  var WORKS = [], BY = {}, GROUPS = [], mode = 'sky', current = null, vi = 0, fromView = 'sky', hintT = 0, ready = false, pending = null;
  function lay() { return (w.GJ_VIEW && w.GJ_VIEW.opts.lay) || 'a' }
  function isNarrow() { return w.matchMedia('(max-width:720px)').matches }
  function sheetOnly() { return isNarrow() || lay() !== 'a' }
  function inLab() { return !w.GJ_VIEW || w.GJ_VIEW.view === 'lab' }
  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e }
  function medium(c) { var n = c.cards.length;
    return c.kind === 'film' ? 'film' : c.kind === 'music' ? 'music' : c.kind === 'cv' ? 'page and PDF' : (n + (n === 1 ? ' photograph' : ' photographs') + (c.also && /orbit/.test(c.also) ? ' · 3D' : '')) }
  function starfield() { var box = $('starfield'); box.innerHTML = '';
    for (var i = 0; i < 80; i++) { var s = document.createElement('i'); s.style.left = (Math.random() * 100) + '%'; s.style.top = (Math.random() * 100) + '%'; s.style.opacity = (0.12 + Math.random() * 0.4).toFixed(2); s.style.width = s.style.height = (1 + Math.round(Math.random() * 2)) + 'px'; box.appendChild(s) } }
  function buildSky() { var box = $('constel'); box.innerHTML = '';
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true'); var seen = {};
    WORKS.forEach(function (c) { (c.near || []).forEach(function (n) { var o = BY[n.k]; if (!o) return; var id = [c.k, o.k].sort().join('|'); if (seen[id]) return; seen[id] = 1;
      var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', c.lab.x); l.setAttribute('y1', c.lab.y); l.setAttribute('x2', o.lab.x); l.setAttribute('y2', o.lab.y); svg.appendChild(l) }) });
    box.appendChild(svg);
    WORKS.forEach(function (c) { var b = el('button', 'star' + (c.feat ? ' feat' : '')); b.type = 'button'; b.dataset.k = c.k; b.style.left = c.lab.x + '%'; b.style.top = c.lab.y + '%';
      b.appendChild(el('span', 'dot')); b.appendChild(el('span', 'nm ju', c.nm)); b.addEventListener('click', function () { openWork(c.k, 0) }); box.appendChild(b) }) }
  function buildSheet() { var proof = $('proof'); proof.querySelectorAll('.grp,.gridwrap,.grid').forEach(function (n) { n.remove() });
    $('phd').textContent = WORKS.length + ' works';
    var flat = lay() === 'c', grid = null;
    if (flat) { grid = el('div', 'grid'); proof.appendChild(grid) }
    GROUPS.forEach(function (g) {
      if (!flat) { proof.appendChild(el('h2', 'grp ju', g.nm)); grid = el('div', 'grid'); proof.appendChild(grid) }
      g.works.forEach(function (k) { var c = BY[k]; if (!c) return; var b = el('button', 'cell' + (c.feat && !flat ? ' feat' : '') + (c.kind === 'cv' ? ' txt' : '')); b.type = 'button'; b.dataset.k = k;
        if (c.kind === 'cv') b.appendChild(el('em', 'ju', c.nm));
        else { var img = el('img'); img.loading = 'lazy'; img.src = c.sheet || c.cards[0].media.thumb; img.alt = c.nm; b.appendChild(img) }
        var s = el('span', 'ju', c.nm); s.appendChild(el('small', '', medium(c))); b.appendChild(s);
        b.addEventListener('click', function () { openWork(k, 0) }); grid.appendChild(b) }) }) }
  function show(id) { lab.classList.toggle('inwork', id === 'lwork'); [sky, sheet, work].forEach(function (e) { e.classList.toggle('on', e.id === id) });
    back.hidden = !(id === 'lwork' || (id === 'lsheet' && !sheetOnly()));
    sheetBtn.classList.toggle('on', id === 'lsheet'); sheetBtn.setAttribute('aria-pressed', id === 'lsheet' ? 'true' : 'false') }
  function setHint(t) { clearTimeout(hintT); hint.textContent = t; hint.hidden = !t; if (t) hintT = setTimeout(function () { hint.hidden = true }, (w.GJ_HINT_MS || 5000) + 3000) }
  function setHash(k) { if (!inLab()) return; history.replaceState(null, '', location.pathname + location.search + (k ? '#' + k : '')) }
  function mark(k) { lab.querySelectorAll('.here').forEach(function (n) { n.classList.remove('here') }); if (k) lab.querySelectorAll('[data-k="' + k + '"]').forEach(function (n) { n.classList.add('here') }) }
  function listView() { stage.innerHTML = ''; var last = current && current.k; current = null; vi = 0; mode = (fromView === 'sheet' || sheetOnly()) ? 'sheet' : 'sky';
    where.textContent = 'photolab'; show(mode === 'sheet' ? 'lsheet' : 'lsky'); setHint(mode === 'sheet' ? 'tap a work' : 'tap a star'); setHash(''); mark(last);
    if (last && mode === 'sheet') { var c = sheet.querySelector('.cell[data-k="' + last + '"]'); if (c) c.scrollIntoView({ block: 'center' }) } }
  function home() { fromView = sheetOnly() ? 'sheet' : 'sky'; listView(); mark('') }
  function openWork(k, index) { if (!ready) { pending = k; return } var c = BY[k]; if (!c) { home(); return }
    fromView = (mode === 'sheet' || sheetOnly()) ? 'sheet' : (mode === 'work' ? fromView : 'sky');
    current = c; vi = Math.max(0, Math.min(index || 0, c.cards.length - 1)); mode = 'work'; where.textContent = c.nm; show('lwork'); renderWork(); setHash(k); mark(k) }
  function pill(label, href, cls, dl) { var a = el('a', 'lab-btn ' + (cls || ''), label); a.href = href; if (dl) a.setAttribute('download', ''); return a }
  function renderWork() { var c = current, n = c.cards.length, v = c.cards[vi]; setHint('');
    types.innerHTML = '';
    if (c.kind === 'film') types.appendChild(pill('open the film page ›', c.href, 'on'));
    else if (c.kind === 'music') types.appendChild(pill('open the sky player ›', c.href, 'on'));
    else if (c.kind === 'cv') { types.appendChild(pill('open the CV ›', c.href, 'on')); if (c.pdf) types.appendChild(pill('download PDF', c.pdf, '', true)) }
    if (c.also) types.appendChild(pill(c.alsoLabel || 'open ›', c.also, /orbit/.test(c.also) ? 'on' : ''));
    types.hidden = !types.children.length;
    nearRow.innerHTML = ''; var rel = c.near || [];
    if (rel.length) { nearRow.appendChild(el('i', '', 'next to')); rel.forEach(function (r) { var b = el('button', 'lab-btn sm', r.nm); b.type = 'button'; b.addEventListener('click', function () { openWork(r.k, 0) }); nearRow.appendChild(b) }) }
    nearRow.hidden = !rel.length;
    stage.innerHTML = '';
    if (c.kind === 'cv') { var d = el('div', 'cvcard'); d.appendChild(el('b', '', 'CV')); d.appendChild(document.createTextNode('Gill James. The CV opens as a page that links to the works, and as a PDF to download.')); stage.appendChild(d); cap.textContent = ''; count.textContent = ''; prev.hidden = next.hidden = true; return }
    var img = el('img'); img.alt = v.title || c.nm; img.src = v.media.big || v.media.thumb; stage.appendChild(img);
    cap.textContent = v.body || (n > 1 ? (v.title || c.nm) : c.nm); count.textContent = n > 1 ? (vi + 1) + ' of ' + n : ''; prev.hidden = next.hidden = n <= 1;
    if (n > 1) { var nx = c.cards[(vi + 1) % n].media; var pre = new Image(); pre.src = nx.big || nx.thumb } }
  function step(d) { if (!current || current.cards.length < 2) return; var n = current.cards.length; vi = (vi + d + n) % n; renderWork() }
  back.addEventListener('click', function () { if (mode === 'work') listView(); else { fromView = 'sky'; listView() } });
  sheetBtn.addEventListener('click', function () { if (mode === 'sheet') { if (sheetOnly()) return; fromView = 'sky'; listView(); return } fromView = 'sheet'; listView() });
  prev.addEventListener('click', function () { step(-1) }); next.addEventListener('click', function () { step(1) });
  var sx = null; stage.addEventListener('pointerdown', function (e) { sx = [e.clientX, e.clientY] });
  stage.addEventListener('pointerup', function (e) { if (!sx) return; var dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1) });
  w.addEventListener('keydown', function (e) { if (!inLab()) return; if (e.key === 'Escape' && !back.hidden) back.click(); if (mode !== 'work') return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1) });
  function relayout() { if (!ready) return; buildSheet(); if (mode !== 'work') { if (mode === 'sky' && sheetOnly()) { mode = 'sheet'; show('lsheet'); setHint('tap a work') } else show(mode === 'sheet' ? 'lsheet' : 'lsky') } else mark(current.k) }
  w.addEventListener('resize', function () { if (ready && mode === 'sky' && sheetOnly()) { mode = 'sheet'; show('lsheet'); if (inLab()) setHint('tap a work') } });
  w.addEventListener('hashchange', function () { if (!inLab() || !ready) return; var h = decodeURIComponent(location.hash.slice(1)); if (h && BY[h]) openWork(h, 0); else if (!h && mode === 'work') listView() });
  w.GJ_LAB = { open: function (k) { openWork(k, 0) }, home: home, cur: function () { return current ? current.k : '' }, pause: function () {}, relayout: relayout, st: function () { return { mode: mode, cur: current && current.k, vi: vi, n: WORKS.length } } };
  fetch('data.json').then(function (r) { return r.json() }).then(function (d) {
    WORKS = d.chapters; WORKS.forEach(function (c) { BY[c.k] = c }); GROUPS = d.groups || [{ nm: 'works', works: WORKS.map(function (c) { return c.k }) }];
    starfield(); buildSky(); buildSheet(); ready = true;
    var h = pending || decodeURIComponent(location.hash.slice(1));
    if (h && BY[h]) openWork(h, 0); else home();
  }).catch(function (e) { console.warn(e); where.textContent = 'photolab'; hint.hidden = false; hint.innerHTML = ''; var a = document.createElement('a'); a.href = 'list/'; a.textContent = 'open the list of works'; a.style.pointerEvents = 'auto'; hint.style.pointerEvents = 'auto'; hint.appendChild(a) });
})(window);
