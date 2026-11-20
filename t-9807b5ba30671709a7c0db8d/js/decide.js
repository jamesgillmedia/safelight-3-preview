/* tools-02 · Decision Sheets (briefs/DECISION-SHEETS.md; Gill, 18 Nov: batch two).
   Open questions as one visual sheet of A / B / C options that someone can answer in seconds.
     · Create: on the picks board select 2–4 picks and tap DECIDE — they become a question's options, labelled A–D, each
       with its P-code. Give the question its one line. Or add a question in words ("+ words": options split by / ).
       Up to eight questions a sheet.
     · Answer ("ask myself"): tap an option — or NEITHER, with a line of comment.
     · Final: mark the answer as the final choice. It goes in the decision log with the day, and a picked frame is locked
       as chosen (★) on the picks board.
     · Send: save the sheet as a PDF or a PNG and send it as you would any file. Answers that come back are entered by
       hand for now.
   Kept in this browser (localStorage gj-decide). Options are references to frames: nothing is copied or changed.
   Not here yet (the brief): sending through Private Relay / Messaging, recipients answering by link, tallies from
   several people, clips / swatches / scan views as options, locking a version. Those need the app proper. */
(function (G) {
  'use strict';
  var GJ = G.GJ, A = GJ.archive, html = document.documentElement; if (!A) return;
  var KEY = 'gj-decide', D = { sheets: [], log: [], cur: 0, seq: 0 }, AB = ['A', 'B', 'C', 'D'];
  try { var s0 = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (s0 && s0.sheets) D = Object.assign(D, s0); } catch (e) {}
  function save() { try { GJ.settings.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
  function sheet() { if (!D.sheets.length) { D.sheets.push({ id: ++D.seq, title: 'decision sheet ' + D.seq, made: Date.now(), questions: [] }); D.cur = 0; save(); } return D.sheets[Math.min(D.cur, D.sheets.length - 1)]; }
  function day(ms) { var d = new Date(ms); return d.getDate() + ' ' + ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][d.getMonth()] + ' ' + d.getFullYear(); }

  var el = document.createElement('section'); el.id = 'decide'; el.className = 'gpanel'; el.setAttribute('aria-label', 'decision sheet');
  el.innerHTML = '<b class="jul">decision sheet</b><p class="gp-say"></p><div class="ds-qs"></div><div class="ds-log" hidden></div><input class="ds-new" type="text" maxlength="120" placeholder="the options, split by /  ·  warm / cool / neutral" aria-label="a question in words: its options, split by /" hidden>' +
    '<div class="gp-act"><button data-a="words">+ words</button><button data-a="new">new sheet</button><button data-a="log">log</button><button data-a="pdf">pdf</button><button data-a="png">png</button><button data-a="close">close</button></div>';
  document.body.appendChild(el);
  var q = function (s) { return el.querySelector(s); }, box = q('.ds-qs'), say = q('.gp-say'), logBox = q('.ds-log');
  function optLabel(o) { return o.text != null ? o.text : (GJ.picks && GJ.picks.code(o.id)) || 'frame'; }
  function paint(focusQ) {
    var S = sheet(); box.innerHTML = '';
    S.questions.forEach(function (Q, qi) {
      var w = document.createElement('div'); w.className = 'ds-q' + (Q.final ? ' done' : ''); w.dataset.q = qi;
      var line = document.createElement('input'); line.type = 'text'; line.className = 'ds-line'; line.maxLength = 90; line.placeholder = 'the question, in one line'; line.value = Q.q || ''; line.setAttribute('aria-label', 'question ' + (qi + 1));
      line.addEventListener('input', function () { Q.q = line.value; save(); }); line.addEventListener('keydown', function (e) { if (e.key === 'Enter') line.blur(); });
      var num = document.createElement('i'); num.className = 'ds-n'; num.textContent = (qi + 1) + '.'; w.appendChild(num); w.appendChild(line);
      var row = document.createElement('div'); row.className = 'ds-row';
      Q.options.forEach(function (o, k) {
        var b = document.createElement('button'); b.className = 'ds-o' + (Q.mine === AB[k] ? ' on' : '') + (Q.final === AB[k] ? ' final' : ''); b.dataset.k = AB[k]; b.setAttribute('aria-pressed', Q.mine === AB[k] ? 'true' : 'false');
        if (o.text != null) { var t = document.createElement('span'); t.className = 'ds-t'; t.textContent = o.text; b.appendChild(t); } else { var i = A.indexOf(o.id), c = document.createElement('canvas'); if (i >= 0 && A.drawFrame(i, c, 220) !== 2) (function (c2, i2) { var n = 0, iv = setInterval(function () { if (A.drawFrame(i2, c2, 220) === 2 || ++n > 40) clearInterval(iv); }, 200); })(c, i); b.appendChild(c); }
        var cap = document.createElement('em'); cap.textContent = AB[k] + (o.text != null ? '' : ' · ' + optLabel(o)) + (Q.final === AB[k] ? ' · final' : ''); b.appendChild(cap); row.appendChild(b);
      });
      w.appendChild(row);
      var act = document.createElement('div'); act.className = 'ds-act';
      act.innerHTML = '<button data-a="neither"' + (Q.mine === 'neither' ? ' class="on"' : '') + '>neither</button><button data-a="final"' + (Q.mine && Q.mine !== 'neither' ? '' : ' disabled') + '>' + (Q.final ? 'final: ' + Q.final + ' · ' + day(Q.finalAt) : 'make it final') + '</button><button data-a="drop">remove</button>';
      w.appendChild(act);
      if (Q.mine === 'neither') { var cm = document.createElement('input'); cm.type = 'text'; cm.className = 'ds-cm'; cm.maxLength = 120; cm.placeholder = 'why neither?'; cm.value = Q.comment || ''; cm.addEventListener('input', function () { Q.comment = cm.value; save(); }); w.appendChild(cm); }
      box.appendChild(w); if (focusQ === qi) setTimeout(function () { line.focus(); }, 60);
    });
    var done = S.questions.filter(function (Q) { return Q.final; }).length;
    say.textContent = S.questions.length ? S.title + ' · ' + S.questions.length + (S.questions.length === 1 ? ' question' : ' questions') + (done ? ' · ' + done + ' final' : '') + ' · tap an option to answer' : 'no questions yet — on the picks board, select 2–4 picks and tap decide (or + words)';
    q('[data-a="pdf"]').disabled = q('[data-a="png"]').disabled = !S.questions.length;
  }
  function open() { A.loadAll(); logBox.hidden = true; box.hidden = false; paint(); html.classList.add('deciding'); GJ.haptic.tick(); }
  function close() { html.classList.remove('deciding'); }
  function add(options, text) { var S = sheet(); if (S.questions.length >= 8) { say.textContent = 'a sheet holds eight questions — start a new sheet'; return -1; } S.questions.push({ q: text || '', options: options.slice(0, 4), mine: null, comment: '', final: null, finalAt: 0 }); save(); return S.questions.length - 1; }
  function ask(ids, text) { var k = add(ids.map(function (id) { return { id: id }; }), text); open(); if (k >= 0) paint(text ? undefined : k); return k; }
  function answer(qi, a) { var Q = sheet().questions[qi]; if (!Q) return; Q.mine = Q.mine === a ? null : a; if (Q.final && Q.final !== Q.mine) { Q.final = null; Q.finalAt = 0; } save(); paint(); GJ.haptic.tick(); }
  function finalise(qi) {
    var S = sheet(), Q = S.questions[qi]; if (!Q || !Q.mine || Q.mine === 'neither') return;
    if (Q.final === Q.mine) { Q.final = null; Q.finalAt = 0; } else { Q.final = Q.mine; Q.finalAt = Date.now(); var o = Q.options[AB.indexOf(Q.mine)];
      D.log.push({ when: Q.finalAt, sheet: S.title, q: Q.q || 'question ' + (qi + 1), choice: Q.final, what: optLabel(o), who: 'me' });
      if (o && o.id != null && GJ.picks) GJ.picks.setChosen(o.id, true); }   // a final choice locks the pick as chosen
    save(); paint(); GJ.haptic.commit();
  }
  box.addEventListener('click', function (e) {
    var w = e.target.closest('.ds-q'); if (!w) return; var qi = +w.dataset.q, o = e.target.closest('.ds-o'), b = e.target.closest('.ds-act button');
    if (o) answer(qi, o.dataset.k);
    else if (b && b.dataset.a === 'neither') answer(qi, 'neither');
    else if (b && b.dataset.a === 'final') finalise(qi);
    else if (b && b.dataset.a === 'drop') { sheet().questions.splice(qi, 1); save(); paint(); }
  });
  /* the sheet as a picture: each question a row of labelled thumbnails and its one line — for a phone, a printer, a PDF */
  function render() {
    var S = sheet(), W = 1240, M = 48, gap = 20, cw = (W - 2 * M - 3 * gap) / 4, tmp = document.createElement('canvas'), y = 104, rows = [];
    S.questions.forEach(function (Q) { var asp = .5625; Q.options.forEach(function (o) { if (o.id != null) { var i = A.indexOf(o.id); if (i >= 0) asp = A.label(i).aspect; } }); rows.push({ Q: Q, h: 44 + cw * asp + 48 + (Q.mine === 'neither' && Q.comment ? 26 : 0), asp: asp }); });
    var H = y + rows.reduce(function (a, r) { return a + r.h + 26; }, 0) + 40, c = document.createElement('canvas'); c.width = W; c.height = Math.round(H); var g = c.getContext('2d');
    g.fillStyle = '#05090f'; g.fillRect(0, 0, W, c.height); g.fillStyle = '#e8e4dc'; g.font = '400 22px "Julius Sans One", Poppins, sans-serif'; try { g.letterSpacing = '5px'; } catch (e) {} g.fillText(S.title.toUpperCase(), M, 48); try { g.letterSpacing = '0px'; } catch (e) {}
    g.fillStyle = 'rgba(232,228,220,.62)'; g.font = '300 15px Poppins, sans-serif'; g.fillText(day(S.made) + ' · tap or circle one letter for each question · or write "neither" and why', M, 74);
    rows.forEach(function (r, qi) {
      var Q = r.Q; g.fillStyle = '#e8e4dc'; g.font = '300 20px Poppins, sans-serif'; g.fillText((qi + 1) + '.  ' + (Q.q || 'which one?'), M, y + 24);
      Q.options.forEach(function (o, k) {
        var x = M + k * (cw + gap), yy = y + 44, ch = cw * r.asp;
        if (o.text != null) { g.strokeStyle = 'rgba(232,228,220,.35)'; g.lineWidth = 1; g.strokeRect(x + .5, yy + .5, cw - 1, ch - 1); g.fillStyle = '#e8e4dc'; g.font = '300 22px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText(o.text.slice(0, 22), x + cw / 2, yy + ch / 2 + 8); g.textAlign = 'left'; }
        else { var i = A.indexOf(o.id); if (i >= 0) { A.drawFrame(i, tmp, 480); g.drawImage(tmp, x, yy, cw, ch); } }
        if (Q.mine === AB[k]) { g.strokeStyle = '#e8e4dc'; g.lineWidth = 3; g.strokeRect(x - 3, yy - 3, cw + 6, ch + 6); }
        g.fillStyle = '#e8e4dc'; g.font = '400 20px Poppins, sans-serif'; g.fillText(AB[k], x, yy + ch + 28); g.fillStyle = 'rgba(232,228,220,.62)'; g.font = '300 14px Poppins, sans-serif';
        g.fillText((o.text != null ? '' : optLabel(o)) + (Q.final === AB[k] ? '   final · ' + day(Q.finalAt) : ''), x + 26, yy + ch + 27);
      });
      if (Q.mine === 'neither') { g.fillStyle = '#e8e4dc'; g.font = '300 15px Poppins, sans-serif'; g.fillText('neither' + (Q.comment ? ' — ' + Q.comment.slice(0, 90) : ''), M, y + r.h - 4); }
      y += r.h + 26;
    });
    g.fillStyle = 'rgba(232,228,220,.5)'; g.font = '300 12px Poppins, sans-serif'; g.fillText('oz · decision sheet · frames are exact pixels from the archive, only scaled', M, c.height - 20);
    return c;
  }
  function out(kind) {
    var c = render(), nm = sheet().title.replace(/[^\w\-]+/g, '-');
    if (kind === 'png') return GJ.out.blobOf(c, 'image/png').then(function (b) { GJ.out.last = { name: nm + '.png', size: b.size, blob: b }; GJ.out.save(b, nm + '.png'); return GJ.out.last; });
    return GJ.out.blobOf(c, 'image/jpeg', .92).then(GJ.out.bytes).then(function (j) { var b = GJ.out.pdf([{ jpg: j, w: c.width, h: c.height }]); GJ.out.last = { name: nm + '.pdf', size: b.size, blob: b }; GJ.out.save(b, nm + '.pdf'); return GJ.out.last; });
  }
  el.addEventListener('click', function (e) {
    var b = e.target.closest('.gp-act button'); if (!b) return; var a = b.dataset.a;
    if (a === 'close') close();
    else if (a === 'new') { D.sheets.push({ id: ++D.seq, title: 'decision sheet ' + D.seq, made: Date.now(), questions: [] }); D.cur = D.sheets.length - 1; save(); logBox.hidden = true; box.hidden = false; paint(); }
    else if (a === 'words') { newIn.hidden = !newIn.hidden; if (!newIn.hidden) { newIn.value = ''; newIn.focus(); } }   // typed in place (a browser prompt is not allowed everywhere this runs)
    else if (a === 'log') { logBox.hidden = !logBox.hidden; box.hidden = !logBox.hidden; logBox.innerHTML = D.log.length ? D.log.slice().reverse().map(function (l) { return '<p><b>' + l.choice + ' · ' + String(l.what).replace(/</g, '&lt;') + '</b> ' + String(l.q).replace(/</g, '&lt;') + '<i>' + l.who + ' · ' + day(l.when) + ' · ' + String(l.sheet).replace(/</g, '&lt;') + '</i></p>'; }).join('') : '<p>no final choices yet</p>'; }
    else if (a === 'pdf' || a === 'png') out(a).then(function (o) { say.textContent = 'saved · ' + o.name; }).catch(function () { say.textContent = 'the sheet could not be saved from here'; });
  });
  var newIn = q('.ds-new');
  function words(t) { var os = String(t || '').split('/').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4); if (os.length < 2) { say.textContent = 'two to four options, split by /'; return -1; } var k = add(os.map(function (x) { return { text: x }; })); logBox.hidden = true; box.hidden = false; if (k >= 0) paint(k); return k; }
  newIn.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { if (words(newIn.value) >= 0) newIn.hidden = true; } else if (e.key === 'Escape') newIn.hidden = true; });
  GJ.decide = { open: open, close: close, ask: ask, addWords: function (opts, text) { var k = add(opts.map(function (x) { return { text: x }; }), text); if (html.classList.contains('deciding')) paint(); return k; }, answer: answer, finalise: finalise, render: render, out: out,
    state: function () { var S = sheet(); return { sheets: D.sheets.length, title: S.title, questions: S.questions.map(function (Q) { return { q: Q.q, n: Q.options.length, mine: Q.mine, final: Q.final, opts: Q.options.map(optLabel) }; }), log: D.log.length }; }, log: function () { return D.log.slice(); },
    isOpen: function () { return html.classList.contains('deciding'); } };
})(window);
