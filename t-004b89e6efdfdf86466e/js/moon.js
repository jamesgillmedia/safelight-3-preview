/* Floating moon dial, ported from the site moon dial (visual style and behaviour).
   Tap opens a ring of shortcuts from anywhere. Drag to an edge; it rests as a dot.
   Double-tap goes home. Three-finger tap finds it. Red mode turns the moon dark red.
   No wording from the origin app. Nothing here touches a photograph. */
(function (G) {
  'use strict';
  var KEY = 'cks-v17m-moon';
  var DELAY = 5;
  var el = document.createElement('div');
  el.id = 'moon';
  el.innerHTML = '<button type="button" class="mn-m" aria-label="Moon dial" aria-expanded="false"><i></i></button><span class="mn-hint" id="mn-hint">tap to open the menu; drag to move it; double tap goes home</span><nav class="mn-nav" hidden></nav>';
  document.body.appendChild(el);
  var M = el.querySelector('.mn-m');
  var nav = el.querySelector('.mn-nav');
  var st = { pos: { side: 'right', y: 0.72 } };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv && sv.pos) st.pos = sv.pos; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var C = { x: 0, y: 0 }, idleT = null, g = null, lastTap = 0, open = false;

  function base() {
    var u = location.pathname;
    if (u.indexOf('/') >= 0) u = u.replace(/[^/]+$/, '');
    if (!u.endsWith('/')) u += '/';
    return u;
  }
  function go(href) {
    close();
    if (!href) return;
    if (href.charAt(0) === '#') {
      if (location.pathname.split('/').pop() === 'index.html' || /\/$/.test(location.pathname) || location.pathname.split('/').pop() === '') {
        location.hash = href.slice(1);
        return;
      }
      location.href = base() + 'index.html' + href;
      return;
    }
    location.href = href.indexOf('http') === 0 ? href : (base() + href);
  }
  function items() {
    var page = (document.body.getAttribute('data-piece') || 'home');
    var list = [
      { id: 'works', label: 'Works', href: 'index.html#sky' },
      { id: 'one', label: 'One page', href: 'one.html' },
      { id: 'film', label: 'Film', href: 'film.html' },
      { id: 'sound', label: 'Sound', href: 'index.html#lost-in-time' },
      { id: 'noise', label: 'White Noise', href: 'noise.html' },
      { id: 'cv', label: 'CV', href: 'cv/gill-james-arts-cv.pdf' },
      { id: 'red', label: 'Red', href: null }
    ];
    if (page && page !== 'home') list.unshift({ id: 'back', label: 'Back', href: 'index.html#sky' });
    return list;
  }
  function paint() {
    var list = items();
    var r = 92, n = list.length;
    nav.innerHTML = '';
    list.forEach(function (it, i) {
      var a = it.href ? document.createElement('a') : document.createElement('button');
      if (it.href) { a.href = it.href; } else { a.type = 'button'; }
      a.textContent = it.label;
      a.setAttribute('data-act', it.id);
      var ang = (-90 + (i * 360 / n)) * Math.PI / 180;
      a.style.left = (Math.cos(ang) * r) + 'px';
      a.style.top = (Math.sin(ang) * r) + 'px';
      nav.appendChild(a);
    });
  }
  function place() {
    var side = st.pos.side || 'right';
    var y = st.pos.y == null ? 0.72 : st.pos.y;
    var pad = 10, vw = innerWidth, vh = innerHeight;
    var yy = Math.max(pad + 22, Math.min(vh - pad - 22, y * vh));
    var xx = side === 'left' ? pad : (vw - pad);
    C.x = xx; C.y = yy;
    el.style.left = xx + 'px';
    el.style.top = yy + 'px';
    el.classList.toggle('left', side === 'left');
  }
  function drop(x, y) {
    var vw = innerWidth, vh = innerHeight;
    st.pos.side = x < vw / 2 ? 'left' : 'right';
    st.pos.y = Math.max(0.08, Math.min(0.92, y / vh));
    save();
    el.classList.remove('drag', 'lift');
    place();
    rest();
  }
  function toFull() {
    el.classList.remove('dot', 'wane');
    rest();
  }
  function toDot(now) {
    clearTimeout(idleT);
    if (open) return;
    if (now) { el.classList.add('dot'); el.classList.remove('wane'); return; }
    el.classList.add('wane');
    idleT = setTimeout(function () { el.classList.remove('wane'); el.classList.add('dot'); }, 400);
  }
  function rest() {
    clearTimeout(idleT);
    if (open || DELAY <= 0) return;
    idleT = setTimeout(function () { toDot(false); }, DELAY * 1000);
  }
  function openNav() {
    toFull();
    paint();
    nav.hidden = false;
    el.classList.add('open');
    M.setAttribute('aria-expanded', 'true');
    open = true;
    clearTimeout(idleT);
  }
  function close() {
    el.classList.remove('open');
    nav.hidden = true;
    M.setAttribute('aria-expanded', 'false');
    open = false;
    rest();
  }
  function find() {
    toFull();
    el.classList.add('found');
    var ox = C.x, oy = C.y;
    el.style.left = (innerWidth / 2) + 'px';
    el.style.top = (innerHeight / 2) + 'px';
    setTimeout(function () {
      el.classList.remove('found');
      el.style.left = ox + 'px';
      el.style.top = oy + 'px';
      rest();
    }, 900);
  }
  function toggleRed() {
    var html = document.documentElement;
    var on = html.classList.toggle('red');
    if (on) html.setAttribute('data-theme', 'red');
    else if (html.getAttribute('data-theme') === 'red' || html.getAttribute('data-theme') === 'full') html.setAttribute('data-theme', 'night');
    try { localStorage.setItem('cks-v17m.red', on ? '1' : '0'); } catch (e) {}
    var mark = document.getElementById('mark') || document.querySelector('.sig, .mark');
    if (mark) {
      mark.classList.remove('lift');
      void mark.offsetWidth;
      if (on) mark.classList.add('lift');
    }
  }
  function run(id, href, ev) {
    if (ev) ev.preventDefault();
    if (id === 'red') { close(); toggleRed(); return; }
    go(href);
  }
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    run(b.getAttribute('data-act'), b.getAttribute('href'), e);
  });
  M.addEventListener('pointerdown', function (e) {
    if (st.lock) return;
    e.preventDefault();
    M.setPointerCapture(e.pointerId);
    g = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, id: e.pointerId };
    toFull();
    el.classList.add('lift');
  });
  M.addEventListener('pointermove', function (e) {
    if (!g || e.pointerId !== g.id) return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) < 8) return;
    g.moved = true;
    el.classList.add('drag');
    el.classList.remove('dot', 'wane');
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
  });
  function up(e) {
    if (!g || e.pointerId !== g.id) return;
    var info = g; g = null;
    el.classList.remove('lift', 'drag');
    if (info.moved) { drop(e.clientX || info.x, e.clientY || info.y); return; }
    var now = performance.now();
    if (now - lastTap < 320) { lastTap = 0; close(); go('index.html#home'); return; }
    lastTap = now;
    if (open) close(); else openNav();
  }
  M.addEventListener('pointerup', up);
  M.addEventListener('pointercancel', function (e) {
    if (!g) return; g = null; el.classList.remove('lift', 'drag'); place(); rest();
  });
  document.addEventListener('pointerdown', function (e) {
    if (open && !e.target.closest('#moon')) close();
  });
  var fingers = new Map();
  document.addEventListener('pointerdown', function (e) { fingers.set(e.pointerId, 1); if (fingers.size >= 3) find(); });
  document.addEventListener('pointerup', function (e) { fingers.delete(e.pointerId); });
  document.addEventListener('pointercancel', function (e) { fingers.delete(e.pointerId); });
  G.addEventListener('resize', place);
  G.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(); });
  place();
  toDot(true);
  G.CKS_MOON = { open: openNav, close: close, find: find, place: place };
})(window);
