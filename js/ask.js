/* tools-02 · Ask (app map v2, decision 09: "Ask is a spoke in the Mark's fan"; Gill, 18 Nov, on what it opens: "Search the
   app"). A plain search of the app itself: every place on the map and every row of Tune. Type, tap one, you are there.
   No model, nothing sent anywhere, nothing kept. */
(function (G) {
  'use strict';
  var GJ = G.GJ, app = GJ.app, html = document.documentElement;
  var el = document.createElement('div'); el.id = 'ask'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Ask: search the app'); el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<b class="jul">ask</b><input type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="search the app" aria-label="search the app"><div class="ak-list" role="list"></div><span class="jul ak-foot"></span>';
  document.body.appendChild(el);
  var inp = el.querySelector('input'), list = el.querySelector('.ak-list'), foot = el.querySelector('.ak-foot'), items = [], shown = [];
  function norm(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function build() {
    items = [];
    if (GJ.navmap) GJ.navmap.nodes().forEach(function (n) { items.push({ kind: 'place', id: n.id, name: n.name, sub: n.cl, key: norm(n.name + ' ' + n.cl + ' ' + n.id) }); });
    [].forEach.call(document.querySelectorAll('#tune .row, .tune .row'), function (r) {
      var b = r.querySelector('button[data-t]'); if (!b) return;
      var name = ''; [].forEach.call(r.childNodes, function (c) { if (c.nodeType === 3) name += c.textContent; }); name = name.trim(); if (!name) return;
      items.push({ kind: 'tune', id: b.getAttribute('data-t'), name: name, sub: 'tune', key: norm(name + ' tune ' + b.getAttribute('data-t')), row: r });
    });
  }
  function find(q) {
    var w = norm(q).split(' ').filter(Boolean); if (!w.length) return items.filter(function (i) { return i.kind === 'place'; });
    return items.map(function (i) {
      var s = 0; for (var k = 0; k < w.length; k++) { var p = i.key.indexOf(w[k]); if (p < 0) return null; s += p === 0 ? 3 : i.key.charAt(p - 1) === ' ' ? 2 : 1; }
      return { i: i, s: s + (i.kind === 'place' ? .5 : 0) };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.i; });
  }
  function paint() {
    shown = find(inp.value).slice(0, 40);
    list.innerHTML = shown.map(function (i, k) { return '<button role="listitem" data-k="' + k + '"><span>' + i.name + '</span><i class="jul">' + i.sub + '</i></button>'; }).join('');
    foot.textContent = shown.length ? (inp.value ? shown.length + (shown.length === 1 ? ' match' : ' matches') : 'every place · type to search places and tune') : 'nothing by that name';
  }
  function go(k) {
    var i = shown[k]; if (!i) return; close(); GJ.haptic.commit();
    if (i.kind === 'place') { GJ.navmap.go(i.id); return; }
    GJ.dial.hideNow(); app.tune(true);
    setTimeout(function () { try { i.row.scrollIntoView({ block: 'center' }); } catch (e) {} i.row.classList.add('ak-here'); setTimeout(function () { i.row.classList.remove('ak-here'); }, 2400); }, 80);
  }
  function isOpen() { return html.classList.contains('asking'); }
  function open(q) { build(); inp.value = q || ''; paint(); html.classList.add('asking'); el.setAttribute('aria-hidden', 'false'); list.scrollTop = 0; try { inp.focus({ preventScroll: true }); } catch (e) {} }
  function close() { if (!isOpen()) return; html.classList.remove('asking'); el.setAttribute('aria-hidden', 'true'); inp.blur(); }
  inp.addEventListener('input', paint);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (shown.length) go(0); } else if (e.key === 'Escape') close(); });
  list.addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('button[data-k]') : null; if (b) go(+b.getAttribute('data-k')); });
  el.addEventListener('click', function (e) { if (e.target === el) close(); });
  GJ.ask = { open: open, close: close, isOpen: isOpen, find: function (q) { build(); return find(q).map(function (i) { return i.kind + ':' + i.id; }); }, go: go, shown: function () { return shown.map(function (i) { return i.kind + ':' + i.id; }); } };
})(window);
