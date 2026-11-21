/* oz one (r4, item 13) · the Feed — a calm stream made only from the person's own material on this phone: their frames,
   clips, loops, notes, Timer sessions and past Good Weather days. One quiet card at a time, on a slow vertical stream.
   What surfaces is the feedPicker module's to choose (oz.private.get('feedPicker')); this room only shows its cards, in
   order, and opens each in its own room. No cloud, no other people, no counts, no likes, no endless pull. Offline.
   Photos are drawn exactly as they are — never tinted, in any mode (Full red mode's exception is the Archive's own).
     GJ.rooms.feed · GJ.feed.cards() · GJ.feed.go(i) · GJ.feed.empty() */
(function (G) {
  'use strict';
  var GJ = G.GJ, store = GJ.store, html = document.documentElement;
  var room = document.getElementById('r-feed'); if (!room || !GJ.rooms) return;
  var stream = document.getElementById('fd-stream'), meta = document.getElementById('fd-meta');
  function picker() { return G.oz && G.oz.private ? G.oz.private.get('feedPicker') : null; }
  function S() { return store.get(); }
  var cards = [], at = 0;

  // the person's own pieces (what the picker is given). The stub ignores them and returns its fixed example set.
  function items() {
    var out = [];
    try { (G.GJ_SAMPLES || []).slice(0, 4).forEach(function (s) { out.push({ id: 'sample:' + s.id, kind: 'frame', date: null, tags: [], linkedId: null }); }); } catch (e) {}
    try { if (GJ.loops && GJ.loops.state().layers) out.push({ id: 'loop:current', kind: 'loop', date: null, tags: [], linkedId: null }); } catch (e) {}
    return out;
  }
  function todayLight() { try { return (GJ.goodWeather && GJ.goodWeather.glanceText && GJ.goodWeather.glanceText()) || ''; } catch (e) { return ''; } }
  function sample(id) { var s = (G.GJ_SAMPLES || []).filter(function (x) { return 'sample:' + x.id === id; })[0]; return s || (G.GJ_SAMPLES || [])[0]; }
  function esc(t) { return GJ.ozone && GJ.ozone.esc ? GJ.ozone.esc(t) : String(t); }

  // each card kind: the piece itself, drawn plainly
  function body(c) {
    if (c.kind === 'frame' || c.kind === 'clip') { var s = sample(c.itemId); return '<figure class="fd-pic"><img src="' + s.file + '" alt="example frame" loading="lazy" draggable="false"></figure>'; }
    if (c.kind === 'note') { var s2 = sample(c.linkedItemId); return '<figure class="fd-pic fd-small"><img src="' + s2.file + '" alt="example clip" loading="lazy" draggable="false"></figure><blockquote class="fd-note">example note · the push-in lands a beat late · try it on the downbeat</blockquote>'; }
    if (c.kind === 'loop') return '<canvas class="fd-wave" width="600" height="160" aria-label="example loop"></canvas><p class="fd-small-line">example loop · 4 takes · 92 bpm</p>';
    if (c.kind === 'day') return '<canvas class="fd-day" width="600" height="200" aria-label="example day"></canvas><p class="fd-small-line">example day · golden at 4:12 · dry till 7</p>';
    if (c.kind === 'timer') return '<div class="fd-slate jul">25:00</div><p class="fd-small-line">example session · lighting setup · 4 setups</p>';
    return '';
  }
  var OPENS = { frame: 'the archive', clip: 'the archive', loop: 'loops', note: 'notes', day: 'golden hour', timer: 'the timer' };
  function render() {
    var p = picker(); cards = p ? p.pick({ items: items(), today: { date: new Date().toISOString().slice(0, 10), light: todayLight() }, count: 8 }) : [];
    stream.innerHTML = cards.map(function (c, i) {
      return '<article class="fd-card" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(c.label + ', opens in ' + (OPENS[c.kind] || 'its room')) + '">' + body(c) +
        '<p class="fd-why">' + esc(c.label) + '</p><div class="fd-act"><button type="button" data-a="open">open in ' + (OPENS[c.kind] || 'its room') + ' ›</button><button type="button" data-a="away" aria-label="put this card away for today">put away</button></div></article>';
    }).join('') + '<article class="fd-card fd-empty"><p class="fd-why">your own frames, loops and notes will gather here</p><p class="fd-small-line">nothing comes from anyone else · it works offline</p></article>' +
      '<p class="fd-foot">preview stub · example cards</p>';
    meta.textContent = cards.length ? 'one at a time · ' + 'yours only' : 'nothing yet';
    [].forEach.call(stream.querySelectorAll('.fd-wave'), wave); [].forEach.call(stream.querySelectorAll('.fd-day'), day);
    at = Math.min(at, cards.length);
  }
  function ink(a) { return S().red ? 'rgba(255,68,87,' + a + ')' : 'rgba(232,228,220,' + a + ')'; }
  function wave(cv) { var g = cv.getContext('2d'), W = cv.width, H = cv.height; g.clearRect(0, 0, W, H); g.strokeStyle = ink(.7); g.lineWidth = 2; g.beginPath();
    for (var x = 0; x < W; x += 4) { var y = H / 2 + Math.sin(x * .05) * Math.sin(x * .013) * H * .32 * (0.6 + .4 * Math.sin(x * .2)); if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
  function day(cv) { var g = cv.getContext('2d'), W = cv.width, H = cv.height; g.clearRect(0, 0, W, H); g.strokeStyle = ink(.35); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, H * .78); g.lineTo(W, H * .78); g.stroke();
    g.strokeStyle = ink(.8); g.lineWidth = 2; g.beginPath(); g.arc(W / 2, H * .78, W * .38, Math.PI, 2 * Math.PI); g.stroke();
    g.fillStyle = S().red ? 'rgba(255,68,87,.9)' : 'rgba(236,190,120,.95)'; g.beginPath(); g.arc(W / 2 + Math.cos(Math.PI * 1.82) * W * .38, H * .78 + Math.sin(Math.PI * 1.82) * W * .38, 9, 0, 7); g.fill(); }

  function scrollTo(i, smooth) { var c = stream.children[i]; if (c) stream.scrollTo({ top: c.offsetTop - stream.offsetTop - 4, behavior: smooth ? 'smooth' : 'auto' }); at = i; if (GJ.dial && GJ.dial.visible) GJ.dial.redraw(); }
  stream.addEventListener('scroll', function () { var k = Math.round(stream.scrollTop / Math.max(1, stream.clientHeight * .86)); at = Math.max(0, Math.min(cards.length, k)); });
  function open(c) {
    GJ.haptic.commit();
    var go = function (fn) { if (GJ.app.room) GJ.app.back(); setTimeout(fn, 420); };
    if (c.kind === 'frame' || c.kind === 'clip') go(function () { GJ.app.enter('archive'); });
    else if (c.kind === 'loop') go(function () { GJ.app.enter('loops'); });
    else if (c.kind === 'note') { if (GJ.notes) GJ.notes.open(); }
    else if (c.kind === 'day') go(function () { GJ.app.enter('golden'); });
    else if (c.kind === 'timer') go(function () { GJ.app.enter('red'); });
  }
  stream.addEventListener('click', function (e) {
    var card = e.target.closest('.fd-card[data-i]'); if (!card) return; var c = cards[+card.dataset.i]; if (!c) return;
    var a = e.target.closest('[data-a]');
    if (a && a.dataset.a === 'away') { var p = picker(); if (p) p.dismiss({ id: c.id }); GJ.haptic.tick(); return; }
    open(c);
  });
  stream.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var card = e.target.closest('.fd-card[data-i]'); if (card) open(cards[+card.dataset.i]); } });
  (function () { var p = picker(); if (p && p.on) p.on('changed', function () { if (GJ.app.room === 'feed') render(); }); })();

  // the camera dial: CARD steps through the stream, one card at a time
  var CARD = { key: 'feedcard', label: 'CARD', min: 0, max: 1, def: 0, span: 260, unit: 1,
    get: function () { return cards.length ? at / Math.max(1, cards.length) : 0; }, step: function (v) { return v; },
    set: function (v) { var i = Math.round(Math.max(0, Math.min(1, v)) * cards.length); if (i !== at) { scrollTo(i, true); GJ.haptic.tick(); } },
    notches: function () { var o = []; for (var i = 0; i <= cards.length; i++) o.push(i / Math.max(1, cards.length)); return o; },
    fmt: function () { return at < cards.length ? (cards[at].kind) : 'the end'; } };

  GJ.rooms.feed = {
    id: 'feed', title: 'feed', trees: .55, golden: 0,
    rings: function () { return [CARD]; },
    enter: function () { render(); scrollTo(0); },
    leave: function () {},
    frame: function () {}
  };
  GJ.feed = { cards: function () { return cards.slice(); }, go: scrollTo, empty: function () { return !cards.length; }, render: render,
    on: function () { return S().feedOn !== false; } };
})(window);
