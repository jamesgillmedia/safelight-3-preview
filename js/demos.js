/* tools-02 · the Demo Room (briefs/DEMO-ROOM.md; Gill, 18 Nov: batch three).
   A private shelf of song demos, in the Sound room: listen back, compare versions, take notes.
     · Shelf: + AUDIO brings in your own files (voice memos, bounces). Each file is a song; inside a song, + AUDIO adds
       a version under it (v1, v2 …). A song's star is brighter the further along it is: idea → demo → mix → master.
     · Notes on the moment: + PIN drops a pin where the playhead is — pick a tag (lyric · arrangement · mix · tempo ·
       keep · cut) and / or type a line. Pins are ticks on the waveform; tap one (or its line in the list) to go there.
     · The list under the waveform is the punch list: every note for the song, ticked off as it is fixed.
     · A / B: flips between the version playing and the one before it, at the same moment — you hear the change,
       not a restart.
     · Loop: hold on the waveform, then drag — that stretch loops. SPEED slows it (1× · ¾ · ½) without changing pitch.
     · SPEAKER: flat · phone · car · earbuds — a filter on what you hear, never on the file.
   Everything stays on this device: the audio in GJ.keep (IndexedDB), the rest in localStorage gj-demos. Nothing is
   uploaded and no audio ships with the app. Closing the panel stops the sound.
   Not here yet (the brief): the lyric sheet tied to timestamps, a bounce straight from Loops, sharing by Private Relay. */
(function (G) {
  'use strict';
  var GJ = G.GJ, html = document.documentElement, clamp = GJ.clamp;
  var KEY = 'gj-demos', D = { seq: 0, songs: [] };
  try { var s0 = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s0 && s0.songs) D = Object.assign(D, s0); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  var STATUS = ['idea', 'demo', 'mix', 'master'], TAGS = ['lyric', 'arrangement', 'mix', 'tempo', 'keep', 'cut'], SPEEDS = [1, .75, .5], SPK = ['flat', 'phone', 'car', 'earbuds'];
  var SP = { flat: [20, 0, 0, 20000], phone: [450, 0, 4, 5000], car: [45, 6, -2, 9000], earbuds: [90, 2, 3, 16000] };   // high-pass Hz · low shelf dB at 120 Hz · presence dB at 3 kHz · low-pass Hz
  var el = document.createElement('section'); el.id = 'demos'; el.className = 'gpanel'; el.setAttribute('aria-label', 'demo room');
  el.innerHTML = '<b class="jul">demos</b><p class="gp-say"></p><div class="dm-shelf"></div>' +
    '<div class="dm-song" hidden><input class="dm-title" type="text" maxlength="60" aria-label="song title">' +
    '<div class="dm-status" role="group" aria-label="status">' + STATUS.map(function (s, i) { return '<button data-s="' + i + '">' + s + '</button>'; }).join('') + '</div><div class="dm-vers" role="group" aria-label="versions"></div>' +
    '<canvas class="dm-wave" aria-label="waveform: tap to go there, hold then drag to loop"></canvas><p class="dm-time"></p>' +
    '<div class="dm-tr"><button data-a="play">play</button><button data-a="pin">+ pin</button><button data-a="ab">a / b</button><button data-a="speed">1×</button><button data-a="spk">flat</button><button data-a="unloop" hidden>loop ✕</button></div>' +
    '<div class="dm-pin" hidden><span class="dm-tags">' + TAGS.map(function (t) { return '<button data-t="' + t + '">' + t + '</button>'; }).join('') + '</span><input class="dm-text" type="text" maxlength="120" placeholder="a note at this moment, then return"></div>' +
    '<div class="dm-list"></div></div>' +
    '<div class="gp-act"><button data-a="add">+ audio</button><button data-a="shelf" hidden>shelf</button><button data-a="drop" hidden>remove</button><button data-a="close">close</button></div><input type="file" accept="audio/*" multiple hidden>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, say = q('.gp-say'), shelfEl = q('.dm-shelf'), songEl = q('.dm-song'), wave = q('.dm-wave'), wg = wave.getContext('2d'), file = q('input[type=file]'), pinBox = q('.dm-pin'), pinIn = q('.dm-text');
  var song = null, va = null, vb = null, cur = null, loop = null, speed = 0, spk = 0, pend = null, players = {}, AC = null, lastAB = null, raf = 0;
  function fmt(t) { t = Math.max(0, t || 0); var m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
  function byId(a, id) { for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function ctx() { if (!AC) { var C = G.AudioContext || G.webkitAudioContext; if (C) try { AC = new C(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function speaker(P) { if (!P || !P.f) return; var s = SP[SPK[spk]]; P.f.hp.frequency.value = s[0]; P.f.sh.frequency.value = 120; P.f.sh.gain.value = s[1]; P.f.pk.frequency.value = 3000; P.f.pk.Q.value = .9; P.f.pk.gain.value = s[2]; P.f.lp.frequency.value = s[3]; }
  function player(v) {   // one <audio> a version, made the first time it is asked for and kept ready, so a flip is immediate
    if (players[v.id]) return Promise.resolve(players[v.id]);
    return GJ.keep.get('demo-' + v.id).then(function (blob) {
      if (!blob) throw new Error('the audio for ' + v.name + ' is not on this device any more');
      var a = new Audio(); a.preload = 'auto'; a.src = URL.createObjectURL(blob); a.preservesPitch = true; a.webkitPreservesPitch = true;
      var P = players[v.id] = { id: v.id, el: a, blob: blob, peaks: null, f: null }, c = ctx();
      if (c) try { var src = c.createMediaElementSource(a), mk = function (t) { var f = c.createBiquadFilter(); f.type = t; return f; }; P.f = { hp: mk('highpass'), sh: mk('lowshelf'), pk: mk('peaking'), lp: mk('lowpass') }; src.connect(P.f.hp); P.f.hp.connect(P.f.sh); P.f.sh.connect(P.f.pk); P.f.pk.connect(P.f.lp); P.f.lp.connect(c.destination); } catch (e) { P.f = null; }
      speaker(P); a.addEventListener('ended', function () { paintTr(); });
      return new Promise(function (ok) { if (a.readyState >= 1) ok(P); else { a.addEventListener('loadedmetadata', function () { ok(P); }, { once: true }); a.addEventListener('error', function () { ok(P); }, { once: true }); } });
    });
  }
  function peaksOf(P) {
    if (P.peaks) return Promise.resolve(P.peaks); var c = ctx(); if (!c) { P.peaks = new Float32Array(0); return Promise.resolve(P.peaks); }
    return P.blob.arrayBuffer().then(function (b) { return new Promise(function (ok, no) { c.decodeAudioData(b, ok, no); }); }).then(function (buf) {
      var d = buf.getChannelData(0), n = 600, o = new Float32Array(n), st = Math.max(1, Math.floor(d.length / n));
      for (var i = 0; i < n; i++) { var m = 0; for (var j = i * st, e = Math.min(d.length, j + st); j < e; j += 8) { var x = Math.abs(d[j]); if (x > m) m = x; } o[i] = m; }
      P.peaks = o; return o;
    }).catch(function () { P.peaks = new Float32Array(0); return P.peaks; });
  }
  function dur() { return cur && isFinite(cur.el.duration) ? cur.el.duration : 0; }
  function now() { return cur ? cur.el.currentTime : 0; }
  function drawWave() {
    var r = wave.getBoundingClientRect(), d = Math.min(2, G.devicePixelRatio || 1), W = Math.round(r.width * d), H = Math.round(r.height * d); if (!W) return; if (wave.width !== W || wave.height !== H) { wave.width = W; wave.height = H; }
    var red = html.classList.contains('red'), ink = red ? '255,68,87' : '232,228,220', T = dur() || 1, pk = cur && cur.peaks; wg.clearRect(0, 0, W, H);
    if (loop) { wg.fillStyle = 'rgba(' + ink + ',.12)'; wg.fillRect(loop.a / T * W, 0, (loop.b - loop.a) / T * W, H); }
    if (pk && pk.length) { var px = now() / T * W; for (var x = 0; x < W; x += 2 * d) { var v = pk[Math.min(pk.length - 1, Math.floor(x / W * pk.length))], h = Math.max(d, v * H * .86); wg.fillStyle = 'rgba(' + ink + (x <= px ? ',.9)' : ',.38)'); wg.fillRect(x, (H - h) / 2, d, h); } }
    else { wg.fillStyle = 'rgba(' + ink + ',.3)'; wg.fillRect(0, H / 2, W, d); }
    if (song) song.pins.forEach(function (p, i) { var x = p.t / T * W; wg.fillStyle = 'rgba(' + ink + (p.done ? ',.4)' : ',1)'); wg.fillRect(x, 0, d, H * .2); wg.font = (9 * d) + 'px Poppins, sans-serif'; wg.fillText(String(i + 1), x + 3 * d, 9 * d); });
    wg.fillStyle = 'rgb(' + ink + ')'; wg.fillRect(now() / T * W, 0, d, H);
  }
  function paintTr() {
    var v = song && byId(song.versions, va), playing = cur && !cur.el.paused;
    q('[data-a="play"]').textContent = playing ? 'pause' : 'play'; q('[data-a="ab"]').disabled = !vb; q('[data-a="speed"]').textContent = SPEEDS[speed] === 1 ? '1×' : SPEEDS[speed] === .75 ? '¾×' : '½×'; q('[data-a="spk"]').textContent = SPK[spk]; q('[data-a="unloop"]').hidden = !loop;
    q('.dm-time').textContent = fmt(now()) + ' / ' + fmt(dur()) + (v ? ' · ' + v.name : '') + (loop ? ' · loop ' + fmt(loop.a) + '–' + fmt(loop.b) : '') + (SPEEDS[speed] !== 1 ? ' · pitch kept' : '');
  }
  function tick() { raf = 0; if (!html.classList.contains('demoing') || !song) return; if (cur && loop && !cur.el.paused && cur.el.currentTime >= loop.b) cur.el.currentTime = loop.a; drawWave(); paintTr(); raf = requestAnimationFrame(tick); }
  function run() { if (!raf) raf = requestAnimationFrame(tick); }
  function paintShelf() {
    shelfEl.innerHTML = '';
    D.songs.forEach(function (s) { var b = document.createElement('button'); b.className = 'dm-s'; b.dataset.id = s.id; var open = s.pins.filter(function (p) { return !p.done; }).length;
      b.innerHTML = '<i style="opacity:' + (.3 + .23 * s.status) + ';font-size:' + (13 + 3 * s.status) + 'px">✦</i><b></b><em></em>'; b.children[1].textContent = s.title; b.children[2].textContent = STATUS[s.status] + ' · ' + s.versions.length + (s.versions.length === 1 ? ' version' : ' versions') + (s.pins.length ? ' · ' + open + ' of ' + s.pins.length + ' notes open' : ''); shelfEl.appendChild(b); });
    say.textContent = D.songs.length ? D.songs.length + (D.songs.length === 1 ? ' song' : ' songs') + ' · on this device only' + (GJ.keep.lasting ? '' : ' · this browser keeps audio for this visit only') : 'no demos yet — + audio brings in a voice memo or a bounce. It stays on this device.';
  }
  function paintSong() {
    q('.dm-title').value = song.title; [].forEach.call(el.querySelectorAll('.dm-status button'), function (b) { var on = +b.dataset.s === song.status; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var vs = q('.dm-vers'); vs.innerHTML = ''; song.versions.forEach(function (v) { var b = document.createElement('button'); b.dataset.v = v.id; b.textContent = v.name; b.className = v.id === va ? 'on' : v.id === vb ? 'b' : ''; vs.appendChild(b); });
    var ls = q('.dm-list'); ls.innerHTML = ''; song.pins.forEach(function (p, i) { var r = document.createElement('div'); r.className = 'dm-p' + (p.done ? ' done' : ''); r.dataset.p = p.id;
      r.innerHTML = '<button data-a="tick" aria-label="' + (p.done ? 'fixed' : 'mark as fixed') + '">' + (p.done ? '☑' : '☐') + '</button><button data-a="go"><b></b><span></span></button><button data-a="x" aria-label="remove this note">✕</button>'; r.querySelector('b').textContent = (i + 1) + ' · ' + fmt(p.t) + (p.tag ? ' · ' + p.tag : ''); r.querySelector('span').textContent = p.text || ''; ls.appendChild(r); });
    var open = song.pins.filter(function (p) { return !p.done; }).length; say.textContent = song.pins.length ? open + ' of ' + song.pins.length + ' notes open · tap the waveform to go there · hold, then drag, to loop' : 'tap the waveform to go there · hold, then drag, to loop · + pin notes the moment';
    paintTr(); drawWave();
  }
  function view() { var s = !!song; shelfEl.hidden = s; songEl.hidden = !s; q('[data-a="shelf"]').hidden = !s; q('[data-a="drop"]').hidden = !s; q('[data-a="drop"]').textContent = 'remove'; if (s) { paintSong(); run(); } else paintShelf(); }
  function pick(vid, keepTime) {   // make a version the one playing; the one before it becomes the other side of A / B
    var v = song && byId(song.versions, vid); if (!v) return Promise.resolve(null); var t = keepTime && cur ? cur.el.currentTime : 0, was = cur && !cur.el.paused;
    return player(v).then(function (P) {
      if (cur && cur !== P) { cur.el.pause(); if (va && va !== vid) vb = va; } va = vid; cur = P; P.el.playbackRate = SPEEDS[speed]; speaker(P);
      try { P.el.currentTime = Math.min(t, (isFinite(P.el.duration) ? P.el.duration : t)); } catch (e) {} if (was) P.el.play().catch(function () {});
      paintSong(); peaksOf(P).then(drawWave); if (vb) { var o = byId(song.versions, vb); if (o) player(o); } return P;
    }).catch(function (e) { say.textContent = e.message; return null; });
  }
  function ab() {   // the other version, at the same moment
    var o = song && vb && byId(song.versions, vb); if (!o || !cur) return Promise.resolve(null); var from = cur, was = !from.el.paused;
    return player(o).then(function (P) {
      var t = from.el.currentTime; P.el.playbackRate = from.el.playbackRate; speaker(P); P.el.currentTime = Math.min(t, isFinite(P.el.duration) ? P.el.duration : t); from.el.pause(); if (was) P.el.play().catch(function () {});
      lastAB = { at: t, got: P.el.currentTime, from: va, to: vb }; vb = va; va = o.id; cur = P; paintSong(); peaksOf(P).then(drawWave); GJ.haptic.tick(); return lastAB;
    });
  }
  function openSong(id) { var s = byId(D.songs, id); if (!s) return Promise.resolve(null); if (cur) cur.el.pause(); song = s; va = vb = null; cur = null; loop = null; pend = null; pinBox.hidden = true; view(); return s.versions.length ? pick(s.versions[s.versions.length - 1].id).then(function () { if (s.versions.length > 1) { vb = s.versions[s.versions.length - 2].id; player(byId(s.versions, vb)); paintSong(); } return s; }) : Promise.resolve(s); }
  function toShelf() { if (cur) cur.el.pause(); song = null; cur = null; va = vb = null; loop = null; view(); }
  function addFiles(files) {   // on the shelf: a song a file · in a song: a version a file
    var list = [].slice.call(files || []).filter(function (f) { return f && (!f.type || f.type.indexOf('audio') === 0 || /\.(wav|mp3|m4a|aac|aif|aiff|flac|ogg|caf)$/i.test(f.name || '')); }), first = null;
    return list.reduce(function (p, f) { return p.then(function () {
      var name = String(f.name || 'demo').replace(/\.[a-z0-9]+$/i, ''), s = song; if (!s) { s = { id: ++D.seq, title: name.slice(0, 60), status: 1, versions: [], pins: [], made: Date.now() }; D.songs.push(s); }
      var v = { id: ++D.seq, name: 'v' + (s.versions.length + 1), file: name.slice(0, 60), added: Date.now() }; s.versions.push(v); first = first || s; return GJ.keep.put('demo-' + v.id, f);
    }); }, Promise.resolve()).then(function () { save(); if (song) { var l = song.versions[song.versions.length - 1]; return pick(l.id, true).then(function () { return first; }); } view(); return first; });
  }
  function seek(t) { if (!cur) return; try { cur.el.currentTime = clamp(t, 0, Math.max(0, dur() - .01)); } catch (e) {} drawWave(); paintTr(); }
  function addPin(t, text, tag) { if (!song) return null; var v = byId(song.versions, va), p = { id: ++D.seq, t: +(+t).toFixed(2), text: (text || '').trim(), tag: tag || '', done: false, v: v ? v.name : '' }; song.pins.push(p); song.pins.sort(function (a, b) { return a.t - b.t; }); save(); paintSong(); GJ.haptic.commit(); return p; }
  function commitPin(tag) { if (pend == null) return; var t = pend, tx = pinIn.value; pend = null; pinBox.hidden = true; pinIn.value = ''; if (tag || tx.trim()) addPin(t, tx, tag); }
  function setLoop(a, b) { if (a == null || Math.abs(b - a) < .15) loop = null; else loop = { a: Math.max(0, Math.min(a, b)), b: Math.min(dur() || 1e9, Math.max(a, b)) }; paintTr(); drawWave(); }
  function setSpeed(i) { speed = ((i % SPEEDS.length) + SPEEDS.length) % SPEEDS.length; if (cur) { cur.el.preservesPitch = true; cur.el.playbackRate = SPEEDS[speed]; } paintTr(); }
  function setSpeaker(i) { spk = ((i % SPK.length) + SPK.length) % SPK.length; Object.keys(players).forEach(function (k) { speaker(players[k]); }); paintTr(); }
  function open() { html.classList.add('demoing'); view(); GJ.haptic.tick(); }
  function close() { if (cur) cur.el.pause(); html.classList.remove('demoing'); pinBox.hidden = true; pend = null; }
  // the waveform: tap = go there (or to the pin you tapped) · hold, then drag = loop that stretch · drag = scrub
  var wd = null;
  function tAt(e) { var r = wave.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * (dur() || 0); }
  wave.addEventListener('pointerdown', function (e) { if (!cur) return; e.preventDefault(); try { wave.setPointerCapture(e.pointerId); } catch (x) {} wd = { x: e.clientX, t0: tAt(e), held: false, moved: false }; wd.timer = setTimeout(function () { if (wd && !wd.moved) { wd.held = true; GJ.haptic.commit(); say.textContent = 'drag to set the loop'; } }, 350); });
  wave.addEventListener('pointermove', function (e) { if (!wd) return; if (!wd.moved && Math.abs(e.clientX - wd.x) > 8) { wd.moved = true; if (!wd.held) clearTimeout(wd.timer); } if (!wd.moved) return; if (wd.held) setLoop(wd.t0, tAt(e)); else seek(tAt(e)); });
  function wup(e) { if (!wd) return; var d = wd; wd = null; clearTimeout(d.timer); if (d.held && d.moved) { if (loop) seek(loop.a); paintSong(); return; } if (d.moved) return;
    var r = wave.getBoundingClientRect(), T = dur() || 1, hit = null; song.pins.forEach(function (p) { if (Math.abs(p.t / T * r.width - (e.clientX - r.left)) < 12) hit = p; }); seek(hit ? hit.t : d.t0); GJ.haptic.tick(); }
  wave.addEventListener('pointerup', wup); wave.addEventListener('pointercancel', function () { if (wd) clearTimeout(wd.timer); wd = null; });
  el.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a;
    if (b.classList.contains('dm-s')) { openSong(+b.dataset.id); return; }
    if (b.dataset.s != null && song) { song.status = +b.dataset.s; save(); paintSong(); return; }
    if (b.dataset.v != null) { if (+b.dataset.v !== va) pick(+b.dataset.v, true); return; }
    if (b.dataset.t) { commitPin(b.dataset.t); return; }
    var row = b.closest('.dm-p');
    if (row && song) { var p = byId(song.pins, +row.dataset.p); if (!p) return; if (a === 'tick') { p.done = !p.done; save(); paintSong(); GJ.haptic.tick(); } else if (a === 'x') { song.pins.splice(song.pins.indexOf(p), 1); save(); paintSong(); } else seek(p.t); return; }
    if (a === 'close') close(); else if (a === 'add') file.click(); else if (a === 'shelf') toShelf();
    else if (a === 'drop' && song) { if (b.textContent === 'remove') { b.textContent = 'tap again: remove this song'; return; } song.versions.forEach(function (v) { GJ.keep.del('demo-' + v.id); if (players[v.id]) { players[v.id].el.pause(); delete players[v.id]; } }); D.songs.splice(D.songs.indexOf(song), 1); save(); toShelf(); }
    else if (a === 'play' && cur) { ctx(); if (cur.el.paused) { if (cur.el.ended || now() >= dur() - .02) seek(loop ? loop.a : 0); cur.el.play().catch(function () {}); } else cur.el.pause(); paintTr(); run(); }
    else if (a === 'pin' && cur) { pend = now(); pinBox.hidden = false; pinIn.value = ''; pinIn.focus(); say.textContent = 'a pin at ' + fmt(pend) + ' — pick a tag, or type a line and return'; }
    else if (a === 'ab') ab(); else if (a === 'speed') setSpeed(speed + 1); else if (a === 'spk') { setSpeaker(spk + 1); say.textContent = 'speaker check: ' + SPK[spk] + (spk ? ' — a filter on what you hear, never on the file' : ''); }
    else if (a === 'unloop') setLoop(null);
  });
  pinIn.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') commitPin(''); else if (e.key === 'Escape') { pend = null; pinBox.hidden = true; } });
  q('.dm-title').addEventListener('input', function () { if (song) { song.title = q('.dm-title').value.slice(0, 60) || 'untitled'; save(); } });
  q('.dm-title').addEventListener('keydown', function (e) { e.stopPropagation(); });
  file.addEventListener('change', function () { addFiles(file.files); file.value = ''; });
  var act = document.getElementById('sp-act'); if (act) { var db = document.createElement('button'); db.id = 'sp-demos'; db.textContent = 'demos'; db.addEventListener('click', function (e) { e.stopPropagation(); open(); }); act.appendChild(db); }
  GJ.demos = { open: open, close: close, isOpen: function () { return html.classList.contains('demoing'); }, addFiles: addFiles, openSong: openSong, shelf: toShelf, pick: pick, ab: ab, seek: seek, pin: addPin, setLoop: setLoop, setSpeed: setSpeed, setSpeaker: setSpeaker,
    play: function () { ctx(); return cur ? cur.el.play() : Promise.resolve(); }, pause: function () { if (cur) cur.el.pause(); }, setStatus: function (i) { if (song) { song.status = clamp(i, 0, 3); save(); paintSong(); } },
    state: function () { return { open: html.classList.contains('demoing'), songs: D.songs.map(function (s) { return { id: s.id, title: s.title, status: STATUS[s.status], versions: s.versions.map(function (v) { return v.name; }), pins: s.pins.length, open: s.pins.filter(function (p) { return !p.done; }).length }; }), song: song ? song.id : null, a: va, b: vb, t: now(), dur: dur(), playing: !!(cur && !cur.el.paused), rate: cur ? cur.el.playbackRate : 1, pitchKept: cur ? cur.el.preservesPitch !== false : true, loop: loop, speaker: SPK[spk], filter: cur && cur.f ? [cur.f.hp.frequency.value, cur.f.lp.frequency.value] : null, lastAB: lastAB, peaks: cur && cur.peaks ? cur.peaks.length : 0, pins: song ? song.pins.map(function (p) { return { id: p.id, t: p.t, text: p.text, tag: p.tag, done: p.done }; }) : [] }; } };
})(window);
