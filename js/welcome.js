/* tools-02 · Knowledge Keeper, the welcome page (briefs/KNOWLEDGE-KEEPER.md; Gill, 18 Nov: batch four).
   The app's own words first, then what matters now. Each tap moves the sky's camera a little closer.
     1. "I am." — then today's line (one from your list, a different one each day), then the poem, a line a tap.
     2. The work: three to five projects, one a tap, each with one quiet line — where it stands, what is next, a date.
     3. Then it lets go, into the app.
   SKIP (or Esc, Enter, a swipe up) always leaves at once; PROJECTS goes straight to the first project.
   EDIT: today's lines, the poem, the projects ("title — where it stands — date", one a line). All of it is kept in
   this browser only (localStorage gj-welcome) and never published.
   The words it starts with are only the ones already in the build or the brief: "I am.", the poem's line on the sky
   ("Artistry a starfield I chase") and its last line ("and everything I create."). The rest of the poem, the daily
   lines and the projects are Gill's to write in — none are made up here.
   It opens on demand (Tune, the map). ONCE A DAY is a switch, off to begin with, so a preview never opens on it
   unasked. Not here yet (the brief): things resurfacing from email or a deadline list, hold a project to go into it
   (there are no project rooms), the camera's roll. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, sky = GJ.sky;
  var KEY = 'gj-welcome', W = { daily: [], poem: ['Artistry a starfield I chase', 'and everything I create.'], projects: [], when: 'off', seen: '' };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.poem) W = Object.assign(W, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) {} }
  var el = document.createElement('section'); el.id = 'kk'; el.setAttribute('aria-label', 'welcome');
  el.innerHTML = '<p class="kk-kind"></p><p class="kk-line" aria-live="polite"></p><p class="kk-sub"></p>' +
    '<div class="kk-ui"><button data-a="projects">projects</button><button data-a="edit">edit</button><button data-a="when"></button><button data-a="skip">skip</button></div>' +
    '<div class="kk-edit" hidden><label>today\'s lines · one a line, a different one each day<textarea data-k="daily" rows="2"></textarea></label><label>the poem · a line a tap<textarea data-k="poem" rows="4"></textarea></label><label>projects · title — where it stands — date<textarea data-k="projects" rows="3" placeholder="one a line, three to five"></textarea></label><button data-a="done">done</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, line = q('.kk-line'), kind = q('.kk-kind'), sub = q('.kk-sub'), ed = q('.kk-edit');
  var on = false, steps = [], k = 0, z0 = null, sw = null, t = 0;
  function dayNo() { var d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000); }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function build() {
    steps = [{ kind: '', text: 'I am.' }]; if (W.daily.length) steps.push({ kind: 'today', text: W.daily[dayNo() % W.daily.length] });
    W.poem.forEach(function (l) { steps.push({ kind: '', text: l }); });
    if (W.projects.length) W.projects.slice(0, 5).forEach(function (p, i) { steps.push({ kind: 'the work · ' + (i + 1) + ' of ' + Math.min(5, W.projects.length), text: p.t, sub: [p.line, p.date].filter(Boolean).join(' · '), project: true }); });
    else steps.push({ kind: 'the work', text: 'no projects here yet', sub: 'edit adds three to five — each with one quiet line', project: true });
  }
  function cam() { if (!sky || !sky.cam || z0 == null) return; GJ.aim(sky.cam.z, z0 * (1 + .09 * k)); }   // each tap, a little closer; a glide, never a cut
  function show(n, quiet) {
    if (n >= steps.length) { close(); return; } k = Math.max(0, n); var s = steps[k]; clearTimeout(t); cam();
    var put = function () { kind.textContent = s.kind; line.textContent = s.text; sub.textContent = s.sub || ''; el.classList.toggle('work', !!s.project); el.classList.add('in'); };
    if (quiet || GJ.reduced()) { put(); return; } el.classList.remove('in'); t = setTimeout(put, 260); GJ.haptic.tick();
  }
  function paintWhen() { q('[data-a="when"]').textContent = W.when === 'day' ? 'once a day: on' : 'once a day: off'; }
  function open() { if (on) return; on = true; build(); z0 = sky && sky.cam ? sky.cam.z.t : null; ed.hidden = true; paintWhen(); html.classList.add('welcoming'); if (sky && sky.focus && !GJ.app.room) GJ.aim(sky.focus, 0); show(0, true); W.seen = todayKey(); save(); }   // the map's own stars step back while it speaks
  function close() { if (!on) return; on = false; clearTimeout(t); html.classList.remove('welcoming'); el.classList.remove('in'); ed.hidden = true; if (sky && sky.cam && z0 != null) GJ.aim(sky.cam.z, z0); z0 = null; if (sky && sky.focus && !GJ.app.room) GJ.aim(sky.focus, 1); }
  function fill() { ed.querySelector('[data-k="daily"]').value = W.daily.join('\n'); ed.querySelector('[data-k="poem"]').value = W.poem.join('\n'); ed.querySelector('[data-k="projects"]').value = W.projects.map(function (p) { return [p.t, p.line, p.date].filter(Boolean).join(' — '); }).join('\n'); }
  function lines(v) { return String(v).split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  function setProjects(a) { W.projects = a.map(function (x) { if (typeof x !== 'string') return x; var p = x.split(/\s+[—–-]{1,2}\s+/); return { t: p[0], line: p[1] || '', date: p[2] || '' }; }).slice(0, 12); }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'), a = b && b.dataset.a; if (e.target.closest('.kk-edit') && a !== 'done') return;
    if (!b) { if (ed.hidden) show(k + 1); return; }
    if (a === 'skip') close(); else if (a === 'projects') { for (var i = 0; i < steps.length; i++) if (steps[i].project) { show(i); break; } }
    else if (a === 'edit') { ed.hidden = !ed.hidden; if (!ed.hidden) fill(); } else if (a === 'done') { ed.hidden = true; build(); show(Math.min(k, steps.length - 1), true); }
    else if (a === 'when') { W.when = W.when === 'day' ? 'off' : 'day'; save(); paintWhen(); }
  });
  ed.addEventListener('input', function (e) { var key = e.target.dataset.k; if (!key) return; if (key === 'projects') setProjects(lines(e.target.value)); else W[key] = lines(e.target.value).slice(0, 40); save(); });
  ['keydown', 'pointerdown', 'touchstart'].forEach(function (ev) { ed.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  el.addEventListener('touchstart', function (e) { sw = e.touches.length === 1 ? e.touches[0].clientY : null; }, { passive: true });
  el.addEventListener('touchend', function (e) { if (sw != null && ed.hidden && sw - e.changedTouches[0].clientY > 80) { e.preventDefault(); close(); } sw = null; });
  G.addEventListener('keydown', function (e) { if (!on || !ed.hidden) return; if (e.key === 'Escape' || e.key === 'Enter') close(); else if (e.key === ' ' || e.key === 'ArrowRight') show(k + 1); });
  if (W.when === 'day' && W.seen !== todayKey()) setTimeout(function () { if (!GJ.app.room) open(); }, 900);   // once a day, if he has switched it on
  GJ.welcome = { open: open, close: close, isOpen: function () { return on; }, next: function () { show(k + 1); },
    set: function (o) { if (o.daily) W.daily = o.daily.slice(); if (o.poem) W.poem = o.poem.slice(); if (o.projects) setProjects(o.projects); if (o.when) W.when = o.when; save(); if (on) { build(); show(0, true); } },
    state: function () { return { on: on, k: k, n: steps.length, line: line.textContent, kind: kind.textContent, sub: sub.textContent, steps: steps.map(function (s) { return s.text; }), firstProject: steps.map(function (s) { return !!s.project; }).indexOf(true), when: W.when, z: sky && sky.cam ? sky.cam.z.t : null, z0: z0, editing: !ed.hidden, daily: W.daily.slice(), poem: W.poem.slice(), projects: W.projects.length }; } };
})(window);
