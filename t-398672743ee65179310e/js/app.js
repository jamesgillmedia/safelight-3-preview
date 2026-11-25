/* Photolab: the portfolio view, fed by the same data.json as the Constellation.
   Home is one calm sheet on every screen: related works grouped under plain headings, the scoop featured, a row of group names to jump with.
   Open a work: its photographs fill the frame, a strip underneath shows every photograph grouped by kind, and works that can be turned
   (the joio cup as a 3D model, the scoop in photographs from four sides) have a "turn it" tab right there. Deep paths and neighbours sit below.
   Layout B (tune) brings back v1's star field on wide screens. Back or Escape returns. */
(function (w) {
  'use strict';
  var $ = function (id) { return document.getElementById(id) };
  var lab = $('lab'), sky = $('lsky'), sheet = $('lsheet'), work = $('lwork'), stage = $('lstage'), cap = $('lcap'), count = $('lcount'), tabs = $('ltabs'), strip = $('lstrip'),
    types = $('ltypes'), nearRow = $('lnear'), hint = $('lhint'), where = $('lwhere'), back = $('lback'), sheetBtn = $('sheetBtn'), prev = $('lprev'), next = $('lnext'), sc = sheet.querySelector('.sheet-sc');
  var WORKS = [], BY = {}, GROUPS = [], mode = 'sheet', current = null, vi = 0, tab = 'photos', fromView = 'sheet', hintT = 0, ready = false, pending = null, turn = null, turnMod = null, turnTok = 0;
  function lay() { return (w.GJ_VIEW && w.GJ_VIEW.opts.lay) || 'a' }
  function isNarrow() { return w.matchMedia('(max-width:720px)').matches }
  function sheetOnly() { return isNarrow() || lay() !== 'b' }
  function inLab() { return !w.GJ_VIEW || w.GJ_VIEW.view === 'lab' }
  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e }
  function medium(c) { var n = c.cards.length;
    return c.kind === 'film' ? 'film' : c.kind === 'music' ? 'music' : c.kind === 'cv' ? 'page and PDF' : (n + (n === 1 ? ' photograph' : ' photographs') + (c.turn ? (c.turn.type === 'model' ? ' · 3D' : ' · turn') : '')) }
  function starfield() { var box = $('starfield'); box.innerHTML = '';
    for (var i = 0; i < 80; i++) { var s = document.createElement('i'); s.style.left = (Math.random() * 100) + '%'; s.style.top = (Math.random() * 100) + '%'; s.style.opacity = (0.12 + Math.random() * 0.4).toFixed(2); s.style.width = s.style.height = (1 + Math.round(Math.random() * 2)) + 'px'; box.appendChild(s) } }
  function buildSky() { var box = $('constel'); box.innerHTML = '';
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true'); var seen = {};
    WORKS.forEach(function (c) { (c.near || []).forEach(function (n) { var o = BY[n.k]; if (!o) return; var id = [c.k, o.k].sort().join('|'); if (seen[id]) return; seen[id] = 1;
      var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', c.lab.x); l.setAttribute('y1', c.lab.y); l.setAttribute('x2', o.lab.x); l.setAttribute('y2', o.lab.y); svg.appendChild(l) }) });
    box.appendChild(svg);
    WORKS.forEach(function (c) { var b = el('button', 'star' + (c.feat ? ' feat' : '')); b.type = 'button'; b.dataset.k = c.k; b.style.left = c.lab.x + '%'; b.style.top = c.lab.y + '%';
      b.appendChild(el('span', 'dot')); b.appendChild(el('span', 'nm ju', c.nm)); b.addEventListener('click', function () { openWork(c.k, 0) }); box.appendChild(b) }) }
  function cell(c, feat) { var b = el('button', 'cell' + (feat ? ' feat' : '') + (c.kind === 'cv' ? ' txt' : '')); b.type = 'button'; b.dataset.k = c.k;
    if (c.kind === 'cv') b.appendChild(el('em', 'ju', c.nm));
    else { var img = el('img'); img.loading = 'lazy'; img.src = c.sheet || c.cards[0].media.thumb; img.alt = c.nm; b.appendChild(img) }
    var s = el('span', 'ju', c.nm); s.appendChild(el('small', '', medium(c))); b.appendChild(s);
    b.addEventListener('click', function () { openWork(c.k, 0) }); return b }
  function buildSheet() { var proof = $('proof'), nav = $('gnav'); proof.querySelectorAll('.gsec,.grid').forEach(function (n) { n.remove() }); nav.innerHTML = '';
    $('phd').textContent = WORKS.length + ' works';
    var flat = lay() === 'c';
    if (flat) { var grid = el('div', 'grid'); GROUPS.forEach(function (g) { g.works.forEach(function (k) { if (BY[k]) grid.appendChild(cell(BY[k], false)) }) }); proof.appendChild(grid); nav.hidden = true; return }
    nav.hidden = false;
    GROUPS.forEach(function (g) { var sec = el('section', 'gsec'); sec.id = 'g-' + g.k; var h = el('h2', 'grp ju', g.nm); h.appendChild(el('small', '', g.works.length + (g.works.length === 1 ? ' work' : ' works'))); sec.appendChild(h);
      var grid = el('div', 'grid'); g.works.forEach(function (k) { var c = BY[k]; if (c) grid.appendChild(cell(c, !!c.feat)) }); sec.appendChild(grid); proof.appendChild(sec);
      var chip = el('button', 'chip ju', g.nm); chip.type = 'button'; chip.dataset.g = g.k; chip.addEventListener('click', function () { forced = g.k; clearTimeout(forcedT); forcedT = setTimeout(function () { forced = null }, 1200); spy(); sc.scrollTo({ top: Math.max(0, sec.offsetTop - nav.offsetHeight - 110), behavior: 'smooth' }) }); nav.appendChild(chip) });
    spy() }
  var forced = null, forcedT = 0;
  function spy() { var nav = $('gnav'); if (nav.hidden) return; if (forced) { nav.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c.dataset.g === forced) }); return } var y = sc.scrollTop + nav.offsetHeight + 130, cur = null; lab.querySelectorAll('.gsec').forEach(function (s) { if (s.offsetTop <= y) cur = s.id.slice(2) }); if (!cur && GROUPS[0]) cur = GROUPS[0].k;
    nav.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c.dataset.g === cur) }) }
  sc.addEventListener('scroll', function () { spy(); if (sc.scrollTop > 60) setHint('') }, { passive: true });
  function show(id) { lab.classList.toggle('inwork', id === 'lwork'); [sky, sheet, work].forEach(function (e) { e.classList.toggle('on', e.id === id) });
    back.hidden = !(id === 'lwork' || (id === 'lsheet' && !sheetOnly()));
    sheetBtn.classList.toggle('on', id === 'lsheet'); sheetBtn.setAttribute('aria-pressed', id === 'lsheet' ? 'true' : 'false') }
  function setHint(t) { clearTimeout(hintT); hint.textContent = t; hint.hidden = !t; if (t) hintT = setTimeout(function () { hint.hidden = true }, (w.GJ_HINT_MS || 5000) + 3000) }
  function setHash(k) { if (!inLab()) return; history.replaceState(null, '', location.pathname + location.search + (k ? '#' + k : '')) }
  function mark(k) { lab.querySelectorAll('.cell.here,.star.here').forEach(function (n) { n.classList.remove('here') }); if (k) lab.querySelectorAll('.cell[data-k="' + k + '"],.star[data-k="' + k + '"]').forEach(function (n) { n.classList.add('here') }) }
  function stopTurn() { turnTok++; if (turn) { try { turn.stop() } catch (e) {} turn = null } }
  function listView() { stopTurn(); stage.innerHTML = ''; var last = current && current.k; current = null; vi = 0; tab = 'photos'; mode = (fromView === 'sheet' || sheetOnly()) ? 'sheet' : 'sky';
    where.textContent = 'photolab'; show(mode === 'sheet' ? 'lsheet' : 'lsky'); setHint(mode === 'sheet' ? 'tap a work' : 'tap a star'); setHash(''); mark(last);
    if (last && mode === 'sheet') { var c = sheet.querySelector('.cell[data-k="' + last + '"]'); if (c) c.scrollIntoView({ block: 'center' }) } spy() }
  function home() { fromView = sheetOnly() ? 'sheet' : 'sky'; listView(); mark(''); sc.scrollTop = 0; spy() }
  function openWork(k, index) { if (!ready) { pending = k; return } var c = BY[k]; if (!c) { home(); return }
    fromView = (mode === 'sheet' || sheetOnly()) ? 'sheet' : (mode === 'work' ? fromView : 'sky');
    stopTurn(); current = c; vi = Math.max(0, Math.min(index || 0, c.cards.length - 1)); tab = 'photos'; mode = 'work'; where.textContent = c.nm; show('lwork'); buildWork(); renderWork(); setHash(k); mark(k) }
  function pill(label, href, cls, dl) { var a = el('a', 'lab-btn ' + (cls || ''), label); a.href = href; if (dl) a.setAttribute('download', ''); return a }
  /* everything about a work that does not change while you page through it */
  function buildWork() { var c = current, n = c.cards.length;
    tabs.innerHTML = '';
    if (c.turn) { [['photos', 'photographs'], ['turn', c.turn.type === 'model' ? 'turn it · 3D' : 'turn it']].forEach(function (t) { var b = el('button', 'lab-btn sm tab', t[1]); b.type = 'button'; b.dataset.t = t[0]; b.addEventListener('click', function () { if (tab === t[0]) return; tab = t[0]; renderWork() }); tabs.appendChild(b) }) }
    tabs.hidden = !c.turn;
    strip.innerHTML = ''; var lastSet = null;
    if (n > 1 && c.kind !== 'cv') c.cards.forEach(function (x, i) { if (x.set && x.set !== lastSet) { strip.appendChild(el('i', 'set', x.set)); lastSet = x.set }
      var b = el('button', 'th'); b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', 'photograph ' + (i + 1) + ' of ' + n + (x.set ? ', ' + x.set : '')); var im = el('img'); im.loading = 'lazy'; im.src = x.media.thumb; im.alt = ''; b.appendChild(im);
      b.addEventListener('click', function () { tab = 'photos'; vi = i; renderWork() }); strip.appendChild(b) });
    strip.hidden = !strip.children.length;
    types.innerHTML = '';
    if (c.kind === 'film') types.appendChild(pill('open the film page ›', c.href, 'on'));
    else if (c.kind === 'music') types.appendChild(pill('open the sky player ›', c.href, 'on'));
    else if (c.kind === 'cv') { types.appendChild(pill('open the CV ›', c.href, 'on')); if (c.pdf) types.appendChild(pill('download PDF', c.pdf, '', true)) }
    if (c.also && !c.turn) types.appendChild(pill(c.alsoLabel || 'open ›', c.also, ''));
    types.hidden = !types.children.length;
    nearRow.innerHTML = ''; var rel = c.near || [];
    if (rel.length) { nearRow.appendChild(el('i', '', 'next to')); rel.forEach(function (r) { var b = el('button', 'lab-btn sm', r.nm); b.type = 'button'; b.addEventListener('click', function () { openWork(r.k, 0) }); nearRow.appendChild(b) }) }
    nearRow.hidden = !rel.length }
  function renderWork() { var c = current, n = c.cards.length, v = c.cards[vi]; setHint(''); stopTurn(); stage.innerHTML = '';
    tabs.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); b.setAttribute('aria-pressed', b.dataset.t === tab ? 'true' : 'false') });
    lab.classList.toggle('turning', tab === 'turn');
    strip.querySelectorAll('.th').forEach(function (b) { var on = tab === 'photos' && +b.dataset.i === vi; b.classList.toggle('on', on); if (on && b.scrollIntoView && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: b.offsetLeft - strip.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' }) });
    if (c.kind === 'cv') { var d = el('div', 'cvcard'); d.appendChild(el('b', '', 'CV')); d.appendChild(document.createTextNode(c.pdf ? 'Gill James. The CV opens as a page that links to the works, and as a PDF to download.' : 'Gill James. The CV opens as a page that links to the works.')); stage.appendChild(d); cap.textContent = ''; count.textContent = ''; prev.hidden = next.hidden = true; return }
    if (tab === 'turn' && c.turn) { cap.textContent = c.turn.cap || ''; count.textContent = ''; prev.hidden = next.hidden = true; var tok = ++turnTok; stage.appendChild(el('p', 'turn-wait', 'opening…'));
      (turnMod || (turnMod = import('./turn.js'))).then(function (M) { if (tok !== turnTok) return; var wt = stage.querySelector('.turn-wait');
        if (c.turn.type === 'model') M.model(stage, c.turn.src, function (s) { if (tok !== turnTok) return; if (wt) wt.remove(); if (s === 'failed') { cap.textContent = 'The 3D model could not be opened here. The photographs are one tap away.' } }).then(function (t) { if (tok !== turnTok) { t.stop(); return } turn = t });
        else { if (wt) wt.remove(); turn = M.photos(stage, c.turn.frames, c.nm) } }).catch(function (e) { console.warn(e); cap.textContent = 'The turn viewer could not be opened here. The photographs are one tap away.' });
      return }
    if (v.media.video) { var vid = el('video'); vid.src = v.media.video; vid.poster = v.media.big || v.media.thumb || ''; vid.controls = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.preload = 'metadata'; vid.setAttribute('aria-label', v.title || c.nm); stage.appendChild(vid) }
    else { var img = el('img'); img.alt = v.title || c.nm; img.src = v.media.big || v.media.thumb; stage.appendChild(img) }
    cap.textContent = v.body || (n > 1 ? (v.title || c.nm) : c.nm); count.textContent = n > 1 ? (vi + 1) + ' of ' + n : ''; prev.hidden = next.hidden = n <= 1;
    if (n > 1) { var nx = c.cards[(vi + 1) % n].media; var pre = new Image(); pre.src = nx.big || nx.thumb } }
  function step(d) { if (!current) return; if (tab === 'turn') { if (turn && turn.go) turn.go(d); return } if (current.cards.length < 2) return; var n = current.cards.length; vi = (vi + d + n) % n; renderWork() }
  back.addEventListener('click', function () { if (mode === 'work') listView(); else { fromView = 'sky'; listView() } });
  sheetBtn.addEventListener('click', function () { if (mode === 'sheet') { if (sheetOnly()) return; fromView = 'sky'; listView(); return } fromView = 'sheet'; listView() });
  prev.addEventListener('click', function () { step(-1) }); next.addEventListener('click', function () { step(1) });
  var sx = null; stage.addEventListener('pointerdown', function (e) { sx = tab === 'turn' ? null : [e.clientX, e.clientY] });
  stage.addEventListener('pointerup', function (e) { if (!sx) return; var dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1) });
  w.addEventListener('keydown', function (e) { if (!inLab()) return; if (e.key === 'Escape' && !back.hidden) back.click(); if (mode !== 'work') return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1) });
  function relayout() { if (!ready) return; buildSheet(); if (mode !== 'work') { if (sheetOnly()) { mode = 'sheet'; show('lsheet') } else show(mode === 'sheet' ? 'lsheet' : 'lsky') } else mark(current.k) }
  w.addEventListener('resize', function () { if (ready && mode === 'sky' && sheetOnly()) { mode = 'sheet'; show('lsheet'); if (inLab()) setHint('tap a work') } });
  w.addEventListener('hashchange', function () { if (!inLab() || !ready) return; var h = decodeURIComponent(location.hash.slice(1)); if (h && BY[h]) openWork(h, 0); else if (!h && mode === 'work') listView() });
  w.GJ_LAB = { open: function (k) { openWork(k, 0) }, home: home, cur: function () { return current ? current.k : '' }, pause: function () { stopTurn(); if (mode === 'work' && tab === 'turn') { tab = 'photos'; renderWork() } }, relayout: relayout,
    st: function () { return { mode: mode, cur: current && current.k, vi: vi, tab: tab, turn: !!turn, n: WORKS.length } }, _turn: function () { return turn } };
  fetch('data.json').then(function (r) { return r.json() }).then(function (d) {
    WORKS = d.chapters; WORKS.forEach(function (c) { BY[c.k] = c }); GROUPS = d.groups || [{ k: 'works', nm: 'works', works: WORKS.map(function (c) { return c.k }) }];
    starfield(); buildSky(); buildSheet(); ready = true; mode = sheetOnly() ? 'sheet' : 'sky';
    var h = pending || decodeURIComponent(location.hash.slice(1));
    if (h && BY[h]) openWork(h, 0); else home();
  }).catch(function (e) { console.warn(e); where.textContent = 'photolab'; hint.hidden = false; hint.innerHTML = ''; var a = document.createElement('a'); a.href = 'list/'; a.textContent = 'open the list of works'; a.style.pointerEvents = 'auto'; hint.style.pointerEvents = 'auto'; hint.appendChild(a) });
})(window);
