/* tools-02 · notes (Gill, 17 Nov: "a notes function that opens a simple notes screen"). A plain page to write on:
   the note you are on fills the screen; your other notes sit in a row under it, newest first. Everything saves as you
   type, in this browser. new · delete · done — nothing else. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement;
  var el = document.createElement('section'); el.id = 'notes'; el.setAttribute('aria-label', 'notes');
  el.innerHTML = '<div class="nt-top"><b class="jul">notes</b><button data-a="new">new</button><button data-a="del">delete</button><button data-a="done">done</button></div>' +
    '<textarea class="nt-text" placeholder="write…" spellcheck="true"></textarea><p class="nt-when"></p><div class="nt-list"></div>';
  document.body.appendChild(el);
  var ta = el.querySelector('.nt-text'), list = el.querySelector('.nt-list'), when = el.querySelector('.nt-when');
  var N = []; try { N = JSON.parse(GJ.settings.getItem('gj-notes') || '[]'); } catch (e) {}
  var cur = 0, saveT = 0;
  function persist() { try { GJ.settings.setItem('gj-notes', JSON.stringify(N)); } catch (e) {} }
  function title(n) { var t = (n.text || '').trim().split('\n')[0]; return t ? t.slice(0, 28) : 'empty'; }
  function stamp(ms) { var d = new Date(ms); return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }).toLowerCase() + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).toLowerCase(); }
  function paint() {
    if (!N.length) N.unshift({ id: Date.now(), t: Date.now(), text: '' });
    cur = Math.max(0, Math.min(cur, N.length - 1));
    if (document.activeElement !== ta || ta.dataset.id !== String(N[cur].id)) { ta.value = N[cur].text; ta.dataset.id = N[cur].id; }
    when.textContent = stamp(N[cur].t);
    list.innerHTML = N.map(function (n, i) { return '<button data-i="' + i + '"' + (i === cur ? ' class="on"' : '') + '>' + title(n).replace(/</g, '&lt;') + '</button>'; }).join('');
  }
  ta.addEventListener('input', function () {
    var n = N[cur]; n.text = ta.value; n.t = Date.now();
    if (cur !== 0) { N.splice(cur, 1); N.unshift(n); cur = 0; }   // the note you are writing moves to the front
    clearTimeout(saveT); saveT = setTimeout(function () { persist(); paint(); }, 300);
  });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.i != null) { persist(); cur = +b.dataset.i; paint(); GJ.haptic.tick(); return; }
    var a = b.dataset.a;
    if (a === 'new') { if (N[0] && !N[0].text.trim()) { cur = 0; } else { N.unshift({ id: Date.now(), t: Date.now(), text: '' }); cur = 0; } persist(); paint(); ta.focus(); }
    if (a === 'del') { N.splice(cur, 1); persist(); paint(); }
    if (a === 'done') close();
    GJ.haptic.tick();
  });
  function open() { paint(); html.classList.add('noting'); GJ.haptic.commit(); }
  function close() { persist(); ta.blur(); html.classList.remove('noting'); }
  function add(text) { N.unshift({ id: Date.now(), t: Date.now(), text: String(text || '') }); cur = 0; persist(); return N[0].id; }   // a line saved here from elsewhere (Messages)
  function attach(text) { if (!N.length) return add(text); var n = N[0]; n.text = (n.text ? n.text.replace(/\s+$/, '') + '\n' : '') + String(text || ''); n.t = Date.now(); cur = 0; persist(); return n.id; }   // bubble round: a line added to the latest note (the camera)
  GJ.notes = { open: open, close: close, add: add, attach: attach, latest: function () { return N[0] ? { id: N[0].id, title: title(N[0]) } : null; }, all: function () { return N.slice(); }, isOpen: function () { return html.classList.contains('noting'); } };
})(window);
