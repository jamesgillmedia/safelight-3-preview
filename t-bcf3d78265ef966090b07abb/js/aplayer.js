/* tools-02 · the Archive Player (briefs/ARCHIVE-PLAYER-ROOM.md; Gill, 18 Nov: batch two).
   Archive material as a continuous play-through instead of a grid: one frame at a time, floating in the time-of-day
   sky. It plays any set — a film, the picks board, whatever a search or a Beyond reading has brought forward.
     · Watch  — lean back: each still holds (3 s to begin; the dial's inner ring, 1–8 s) and the next fades in.
     · Step   — stop-motion, 1–4 frames a second, hard cuts.
     · Review — it waits for you: heart, not-this-one and a note for the frame you are on.
     · Present — nothing on screen but the frame, on black, full screen where the browser allows. Tap to bring the
       interface back.
   The rail scrubs the whole set (every frame is reachable); a tap on the left or right edge steps; a tap in the middle
   plays or pauses; the dial's outer ring is the set — turn it fast and it flings. At the end it offers a related set to
   go on into. The room's own light follows what is showing (the sky leans warm, cool, grey, darker, lighter with the
   frame's measured light and colour): the environment changes; the frame is drawn exact, only scaled, never graded.
   Not here yet (the brief): clips and their sound (the archive holds stills), cuts from Motion Index, published sets
   as a room on the site. A soundtrack is whatever the Sound room is already playing. */
(function (G) {
  'use strict';
  var GJ = G.GJ, A = GJ.archive, clamp = GJ.clamp, html = document.documentElement; if (!A) return;
  var el = document.createElement('section'); el.id = 'ap'; el.setAttribute('aria-label', 'archive player');
  el.innerHTML = '<div class="ap-stage"><canvas class="ap-l"></canvas><canvas class="ap-l"></canvas></div><p class="ap-cap"></p>' +
    '<div class="ap-ui"><div class="ap-modes" role="group" aria-label="mode"><button data-m="watch">watch</button><button data-m="step">step</button><button data-m="review">review</button><button data-m="present">present</button></div>' +
    '<div class="ap-ctl"><button data-a="prev" aria-label="previous">‹</button><button data-a="play">pause</button><button data-a="next" aria-label="next">›</button><button data-a="close">close</button></div>' +
    '<div class="ap-rev"><button data-a="fav" aria-label="favourite">♡</button><button data-a="pass" aria-label="not this one">✕</button><input class="ap-note" type="text" maxlength="140" placeholder="a note on this frame"></div>' +
    '<button class="ap-next" hidden></button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, L = el.querySelectorAll('.ap-l'), cap = q('.ap-cap'), noteIn = q('.ap-note'), nextB = q('.ap-next');
  var set = [], name = '', pos = 0, mode = 'watch', playing = false, hold = 3, sfps = 2, top = 0, lastT = 0, acc = 0, on = false, sharpT = 0, nextSet = null;
  function show(k, cut) {
    pos = clamp(k, 0, set.length - 1); var i = set[pos], c = L[1 - top];
    var tier = A.drawFrame(i, c, 960); clearInterval(sharpT); if (!tier) c.getContext('2d').clearRect(0, 0, c.width, c.height); if (tier !== 2) { var n = 0; sharpT = setInterval(function () { if (!on || set[pos] !== i || A.drawFrame(i, L[top], 960) === 2 || ++n > 50) clearInterval(sharpT); }, 160); }
    var hard = cut || mode === 'step' || GJ.reduced(); el.classList.toggle('cut', !!hard); L[1 - top].classList.add('on'); L[top].classList.remove('on'); top = 1 - top;
    var lb = A.label(i), r = A.review(i) || {}, code = GJ.picks && r.r === 1 ? GJ.picks.code(lb.id) : null;
    cap.textContent = lb.film + ' · frame ' + lb.frame + ' of ' + lb.of + ' · ' + lb.tc + (code ? ' · ' + code : '') + ' · ' + (pos + 1) + ' / ' + set.length + (name ? ' · ' + name : '');
    q('[data-a="fav"]').textContent = r.r === 1 ? '♥' : '♡'; q('[data-a="fav"]').classList.toggle('on', r.r === 1); q('[data-a="pass"]').classList.toggle('on', r.r === -1); if (document.activeElement !== noteIn) noteIn.value = r.n || '';
    var m = A.measured(i); if (m && GJ.sky.setRoom) GJ.sky.setRoom({ warm: ({ red: .6, orange: .6, amber: .5, green: .05, teal: -.45, blue: -.6, violet: -.3, grey: 0 })[m.name] || 0, grey: m.name === 'grey' ? .6 : 0, light: (m.light - .5) * 1.1 });   // the room's light goes with the material
    place(c); nextB.hidden = !(pos === set.length - 1 && nextSet); acc = 0; GJ.rail.redraw && GJ.rail.redraw(); if (GJ.dial.visible) GJ.dial.redraw();
  }
  var stage = q('.ap-stage');
  function place(c) {   // the caption sits just under the frame, wherever the frame's shape puts its lower edge
    c = c || L[top]; if (!c.width) return; var r = stage.getBoundingClientRect(), h = Math.min(r.height, r.width * c.height / c.width);
    cap.style.top = Math.round(r.top + (r.height + h) / 2 + 12) + 'px';
  }
  G.addEventListener('resize', function () { if (on) place(); });
  function setPlaying(v) { playing = !!v; acc = 0; lastT = GJ.now(); q('[data-a="play"]').textContent = playing ? 'pause' : 'play'; }
  function setMode(m) {
    mode = m; [].forEach.call(el.querySelectorAll('[data-m]'), function (b) { b.classList.toggle('on', b.dataset.m === m); b.setAttribute('aria-pressed', b.dataset.m === m ? 'true' : 'false'); });
    el.dataset.mode = m; html.classList.toggle('ap-present', m === 'present'); setPlaying(m === 'watch' || m === 'step' || m === 'present');
    if (m === 'present') { try { if (el.requestFullscreen) el.requestFullscreen().catch(function () {}); } catch (e) {} GJ.dial.hideNow(); } else { try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} dial(); }
    if (GJ.mark && GJ.mark.say && m !== 'present') GJ.mark.say({ watch: 'watch · each still holds, then the next · the inner ring sets how long', step: 'step · stop-motion, 1 to 4 a second', review: 'review · heart, not this one, a note — it waits for you' }[m], 2200);
  }
  function related() {   // what to go on into: the film most like where this set ends, that is not the one it ends in
    if (!set.length) return null; var last = set[set.length - 1], lf = A.frames[last].f, best = -1, bs = -1, seen = {};
    for (var i = 0; i < A.frames.length; i += 7) { var f = A.frames[i].f; if (f === lf || seen[f] > 3) continue; seen[f] = (seen[f] || 0) + 1; var s = A.rel(last, i); if (s > bs) { bs = s; best = i; } }
    return best < 0 ? null : { set: A.filmOfFrame(best), name: A.films[A.frames[best].f].title };
  }
  function tick() {
    if (!on) return; if (GJ.app.room !== 'archive') { close(); return; }   // the room was left some other way: the player goes with it
    var now = GJ.now(), dt = Math.min(.25, (now - lastT) / 1000); lastT = now;
    if (playing && set.length > 1) { acc += dt; var per = mode === 'step' ? 1 / sfps : hold; if (acc >= per) { if (pos >= set.length - 1) { if (mode === 'step') show(0); else { setPlaying(false); nextB.hidden = !nextSet; } } else show(pos + 1); } }
    requestAnimationFrame(tick);
  }
  var SETR = { key: 'ap-set', label: 'SET', min: 0, max: 1, def: 0, span: 320, unit: .01, get: function () { return set.length > 1 ? pos / (set.length - 1) : 0; }, set: function (v) { var k = Math.round(clamp(v, 0, 1) * (set.length - 1)); if (k !== pos) { show(k, true); GJ.haptic.tick(); } }, fmt: function () { return (pos + 1) + ' / ' + set.length; }, hold: function (d) { if (d) setPlaying(!playing); } };
  var HOLD = { key: 'ap-hold', label: 'HOLD', min: 1, max: 8, def: 3, span: 220, unit: 1, get: function () { return hold; }, step: function (v) { return Math.round(v); }, set: function (v) { hold = clamp(Math.round(v), 1, 8); }, notches: function () { return [1, 2, 3, 5, 8]; }, fmt: function (v) { return Math.round(v) + ' s a still'; } };
  var SPD = { key: 'ap-fps', label: 'SPEED', min: 1, max: 4, def: 2, span: 160, unit: 1, get: function () { return sfps; }, step: function (v) { return Math.round(v); }, set: function (v) { sfps = clamp(Math.round(v), 1, 4); }, notches: function () { return [1, 2, 3, 4]; }, fmt: function (v) { return Math.round(v) + ' fps'; } };
  function dial() { if (!on || mode === 'present') return; GJ.dial.config([SETR, mode === 'step' ? SPD : HOLD]); }   // the room's two dials become the player's: the set, and how long a still holds (or how fast it steps)
  var RAIL = { stops: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return { label: k ? k * 12.5 + '%' : 'start' }; }), label: function () { return (pos + 1) + ' / ' + set.length; },
    get: function () { return set.length > 1 ? pos / (set.length - 1) * 8 : 0; }, go: function (k) { show(Math.round(k / 8 * (set.length - 1)), true); }, scrub: function (f) { var k = Math.round(f / 8 * (set.length - 1)); if (k !== pos) { show(k, true); GJ.haptic.tick(); } }, rest: function () {} };
  function play(frames, nm, at) {
    if (!frames || !frames.length) return false; A.loadAll();
    if (GJ.app.room !== 'archive') { GJ.app.enter('archive'); setTimeout(function () { play(frames, nm, at); }, 950); return true; }
    if (A.isOpen() != null) A.close();
    set = frames.slice(); name = nm || ''; on = true; nextSet = related(); if (nextSet) nextB.textContent = 'next · ' + nextSet.name.toLowerCase();
    html.classList.add('aplaying'); L[0].classList.remove('on'); L[1].classList.remove('on'); top = 0; show(at || 0, true); GJ.rail.config(RAIL); setMode('watch'); lastT = GJ.now(); requestAnimationFrame(tick); GJ.haptic.commit(); return true;
  }
  function close() {
    if (!on) return false; on = false; playing = false; clearInterval(sharpT); html.classList.remove('aplaying', 'ap-present'); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    GJ.dial.hideNow(); if (GJ.app.room === 'archive') { GJ.rail.config(GJ.rooms.archive.rail()); GJ.dial.config(GJ.rooms.archive.rings()); if (set.length) A.focus(set[pos]); if (GJ.sky.setRoom) GJ.sky.setRoom(null); } return true;
  }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (mode === 'present') { setMode('watch'); return; }                          // any tap brings the interface back
    if (!b) { if (e.target.closest('.ap-rev')) return; var x = e.clientX / G.innerWidth; if (x < .25) { setPlaying(false); show(pos - 1, true); } else if (x > .75) { setPlaying(false); show(pos + 1, true); } else setPlaying(!playing); GJ.haptic.tick(); return; }
    var a = b.dataset.a, i = set[pos], r = A.review(i) || {};
    if (b.dataset.m) setMode(b.dataset.m);
    else if (a === 'prev') { setPlaying(false); show(pos - 1, true); } else if (a === 'next') { setPlaying(false); show(pos + 1, true); }
    else if (a === 'play') { if (!playing && pos >= set.length - 1) show(0, true); setPlaying(!playing); }
    else if (a === 'close') close();
    else if (a === 'fav') { A.setReview(i, { r: r.r === 1 ? 0 : 1 }); show(pos, true); } else if (a === 'pass') { A.setReview(i, { r: r.r === -1 ? 0 : -1 }); show(pos, true); }
    else if (b === nextB && nextSet) { var n = nextSet; play(n.set, n.name); }
    GJ.haptic.tick();
  });
  var wentFull = false;   // leaving full screen the system's way leaves Present
  document.addEventListener('fullscreenchange', function () { if (document.fullscreenElement) wentFull = true; else if (wentFull) { wentFull = false; if (on && mode === 'present') setMode('watch'); } });
  noteIn.addEventListener('input', function () { A.setReview(set[pos], { n: noteIn.value.trim() }); }); ['pointerdown', 'click', 'keydown'].forEach(function (ev) { noteIn.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  // PLAY on the archive's second row: what has come forward (a reading, a search, ♥ only, marked) — or, with nothing asked for, the film you are on
  var ctl = document.querySelector('#ar-ctl > div:last-child'); if (ctl) { var pb = document.createElement('button'); pb.dataset.ap = '1'; pb.textContent = 'play'; pb.addEventListener('click', function (e) { e.stopPropagation(); playCurrent(); }); ctl.appendChild(pb); }
  function playCurrent() { var s = A.state(), b = A.beyond(), fw = A.forward(), asked = b.read || s.tag || A.filter(); if (asked && fw.length) return play(fw, b.read ? 'beyond · ' + b.read + ' · ' + b.name : s.tag ? s.tag : A.filter() === 'fav' ? 'picks' : 'marked'); var film = A.filmOfFrame(s.focus); return play(film, '', film.indexOf(s.focus)); }
  GJ.aplayer = { play: play, playCurrent: playCurrent, close: close, isOn: function () { return on; }, setMode: setMode, go: function (k) { show(k, true); }, dial: dial,
    state: function () { return { on: on, n: set.length, pos: pos, frame: set[pos], mode: mode, playing: playing, hold: hold, fps: sfps, name: name, next: nextSet ? nextSet.name : null, nextShown: !nextB.hidden, cap: cap.textContent }; } };
})(window);
