/* oz next (item 10) · the Design Log (Motion to Text): the third review tool, beside the walk and the Contact Sheet.
   It writes a build down — per frame, per move, and a kept / lost / new / changed account between two builds — as
   Markdown for people and JSON for builders, saved next to the sheets. The words come from the `motionToText` slot
   (oz.private.get); here its labelled preview stub, which looks at nothing and calls nothing. Every entry is dated, so the
   log reads like a production diary. Kept on this phone (localStorage oz-design-log).   GJ.designLog.open() */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, P = GJ.ozone && GJ.ozone.panel, esc = GJ.ozone ? GJ.ozone.esc : String, tune = document.getElementById('tune'); if (!P) return;
  var MT = G.oz.private.get('motionToText'), KEY = 'oz-design-log', LOG = [];
  try { LOG = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { LOG = []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(LOG.slice(-40))); } catch (e) {} }
  function hap(k) { try { GJ.haptic[k](); } catch (e) {} }
  function builds() { var r = GJ.ozsweep ? GJ.ozsweep.runs() : [], seen = {}, out = []; r.forEach(function (x) { var k = x.build + ' · ' + x.light; if (!seen[k]) { seen[k] = 1; out.push({ id: k, sweep: x.id }); } }); if (!out.length) out.push({ id: GJ.BUILD || 'this build', sweep: null }); return out; }
  function md(t) {   // the log's own quiet typography: headings, emphasis, list lines
    return t.split('\n').map(function (l) { if (/^# /.test(l)) return '<h3 class="jul">' + esc(l.slice(2)) + '</h3>'; if (/^## /.test(l)) return '<h4 class="jul">' + esc(l.slice(3)) + '</h4>'; if (/^- /.test(l)) { var m = l.slice(2), tag = (m.match(/^(kept|lost|new|changed)\b/) || [])[1]; return '<p class="dl-li">' + (tag ? '<b class="dl-' + tag + '">' + tag + '</b>' + esc(m.slice(tag.length)) : esc(m)) + '</p>'; } if (/^\*.*\*$/.test(l) || /^_.*_$/.test(l)) return '<p class="quiet"><em>' + esc(l.replace(/^[*_]|[*_]$/g, '')) + '</em></p>'; return l.trim() ? '<p>' + esc(l) + '</p>' : ''; }).join('');
  }
  var cur = null, showJson = false;
  var dl = P({ id: 'ozlog', title: 'Design Log', tall: true, sub: 'a build, written down · per frame, per move, and what changed',
    foot: 'preview stub · not a real description · nothing here looks at a picture or leaves this phone',
    build: function (b) {
      var B = builds();
      b.innerHTML = '<div class="oz-grp"><div class="oz-line dl-pick"><label>build <select class="dl-a" aria-label="the build to write down">' + B.map(function (x) { return '<option>' + esc(x.id) + '</option>'; }).join('') + '</select></label></div>' +
        '<button type="button" class="oz-row" data-a="describe">write it down<span>markdown · json</span></button></div>' +
        '<div class="oz-grp"><div class="oz-line dl-pick"><label>before <select class="dl-b" aria-label="before">' + B.map(function (x) { return '<option>' + esc(x.id) + '</option>'; }).join('') + '<option>example build · v33</option></select></label><label>after <select class="dl-c" aria-label="after">' + B.map(function (x, i) { return '<option' + (i === B.length - 1 ? ' selected' : '') + '>' + esc(x.id) + '</option>'; }).join('') + '</select></label></div>' +
        '<button type="button" class="oz-row" data-a="diff">kept · lost · new · changed<span>between the two</span></button></div>' +
        '<div class="dl-out" hidden><div class="oz-seg"><button type="button" data-a="md" aria-pressed="true">markdown</button><button type="button" data-a="json" aria-pressed="false">json</button></div><div class="dl-doc"></div>' +
        '<div class="oz-seg"><button type="button" data-a="savemd">save .md</button><button type="button" data-a="savejson">save .json</button><button type="button" data-a="share">share</button></div></div>' +
        '<h3 class="jul">the running log</h3><div class="oz-grp dl-diary"></div>';
      diary(b);
    } });
  function diary(b) { b = b || dl.body; b.querySelector('.dl-diary').innerHTML = LOG.length ? LOG.slice().reverse().map(function (e, i) { return '<button type="button" class="oz-row" data-e="' + (LOG.length - 1 - i) + '">' + esc(e.kind + ' · ' + e.title) + '<span>' + new Date(e.at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toLowerCase() + '</span></button>'; }).join('') : '<p class="oz-line quiet">nothing written yet</p>'; }
  function show(e) { cur = e; var b = dl.body, o = b.querySelector('.dl-out'); o.hidden = false; b.querySelector('.dl-doc').innerHTML = showJson ? '<pre class="dl-json">' + esc(JSON.stringify(e.json, null, 2)) + '</pre>' : (e.kind === 'diff' ? '<p class="dl-count">' + ['kept', 'lost', 'new', 'changed'].map(function (k) { return '<b class="dl-' + k + '">' + k + '</b> ' + ((e.json[k] || []).length); }).join(' · ') + '</p>' : '') + '<div class="dl-md">' + md(e.markdown) + '</div>';
    b.querySelectorAll('[data-a="md"], [data-a="json"]').forEach(function (x) { x.setAttribute('aria-pressed', (x.dataset.a === 'json') === showJson ? 'true' : 'false'); }); o.scrollIntoView({ block: 'nearest' }); }
  function add(kind, title, r) { var e = { kind: kind, title: title, at: Date.now(), markdown: r.markdown + '\n_' + new Date().toISOString().slice(0, 10) + ' · ' + kind + '_\n', json: Object.assign({ date: new Date().toISOString().slice(0, 10), kind: kind }, r.json), stub: !!r.stub }; LOG.push(e); save(); diary(); show(e); hap('commit'); return e; }
  dl.el.addEventListener('click', function (ev) {
    var x = ev.target.closest('button'); if (!x) return; var b = dl.body, a = x.dataset.a, B = builds();
    if (a === 'describe') { var id = b.querySelector('.dl-a').value, bx = B.filter(function (q) { return q.id === id; })[0] || {}; add('log', id, MT.describe({ sweepId: bx.sweep, buildId: id })); }
    if (a === 'diff') { var be = b.querySelector('.dl-b').value, af = b.querySelector('.dl-c').value; add('diff', be + ' → ' + af, MT.diff({ beforeId: be, afterId: af })); }
    if (a === 'md' || a === 'json') { showJson = a === 'json'; if (cur) show(cur); }
    if (x.dataset.e != null) show(LOG[+x.dataset.e]);
    if (!cur) return; var name = 'design-log-' + cur.kind + '-' + new Date(cur.at).toISOString().slice(0, 10);
    if (a === 'savemd') GJ.ozone.download(new Blob([cur.markdown], { type: 'text/markdown' }), name + '.md');
    if (a === 'savejson') GJ.ozone.download(new Blob([JSON.stringify(cur.json, null, 2)], { type: 'application/json' }), name + '.json');
    if (a === 'share') { if (navigator.share) navigator.share({ title: 'design log', text: cur.markdown }).catch(function () {}); else GJ.ozone.download(new Blob([cur.markdown], { type: 'text/markdown' }), name + '.md'); }
  });
  GJ.designLog = { open: dl.open, close: dl.close, isOpen: dl.isOpen, entries: function () { return LOG.slice(); }, describe: function (id) { return add('log', id || builds()[0].id, MT.describe({ buildId: id || builds()[0].id })); }, diff: function (a, b) { return add('diff', a + ' → ' + b, MT.diff({ beforeId: a, afterId: b })); }, json: function (v) { showJson = !!v; if (cur) show(cur); } };
  GJ.ozone.place({ id: 'designlog', name: 'design log', sub: 'a build, written down', cl: 'review', open: dl.open });
  if (tune) tune.addEventListener('click', function (e) { var x = e.target.closest('button[data-t]'); if (x && x.dataset.t === 'ozlog') dl.open(); });
})(window);
