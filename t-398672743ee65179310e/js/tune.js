/* Gill's tune panel (build rules, Nov 24): A/B/C for what is new, keep or hide as feedback, a control for every adjustable value.
   Loaded only with ?tune (remembered on that device; ?tune=0 turns it off). Reviewers never see it. Nothing here is deleted: hidden options can be shown again. */
(function (w) {
  'use strict';
  var V = w.GJ_VIEW; if (!V || document.getElementById('tune')) return; var O = V.opts;
  var SETS = [
    { key: 'lay', title: 'Photolab home', opts: [
      ['a', 'A · grouped sheet on every screen', 'My pick: the work is the first thing you see, related pieces sit together, and the group names jump you down the page.'],
      ['b', 'B · stars on wide, sheet on phone', 'v1 as the brief first described it. Quieter, but a wide screen shows names before any work.'],
      ['c', 'C · plain sheet, no groups', 'v1\u2019s original contact sheet: every work the same size, no headings, no featured scoop.']] },
    { key: 'strip', title: 'Photograph strip in a work', opts: [
      ['a', 'A · thumbnails, grouped by kind', 'My pick: you see every photograph at once and can jump straight to the surface, the making or the piece in use.'],
      ['b', 'B · dots', 'Lighter. Shows how many there are and where you are, not what they are.'],
      ['c', 'C · none', 'Only the arrows and the count. The calmest, and the slowest to browse 23 photographs.']] },
    { key: 'sw', title: 'Switch design', opts: [
      ['a', 'A · two-word pill', 'My pick: both names are always readable, and the lit one says where you are.'],
      ['b', 'B · underlined tabs', 'Quieter. Less chrome over the photographs.'],
      ['c', 'C · one button', 'Shows only the other view’s name. Smallest, but you can’t see where you are from it.']] }];
  var SLIDERS = [['cell', 'sheet cell size', 140, 320, 10, 'px'], ['star', 'Photolab star size', 0.6, 2, 0.1, '×'], ['drift', 'sky drift speed', 0, 3, 0.1, '×'], ['turn', '3D idle turn speed', 0, 3, 0.1, '×'], ['hint', 'hint stays for', 3, 12, 1, 's']];
  var btn = document.createElement('button'); btn.id = 'tuneBtn'; btn.type = 'button'; btn.textContent = 'tune';
  var box = document.createElement('div'); box.id = 'tune'; box.hidden = true;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e }
  function feedback() { var kept = [], hidden = []; SETS.forEach(function (s) { s.opts.forEach(function (o) { (O.hide[s.key + '.' + o[0]] ? hidden : kept).push(s.title + ' ' + o[0].toUpperCase()) }) });
    return JSON.stringify({ build: 'cks-reviewer-v5', chosen: { home: O.lay, strip: O.strip, 'switch': O.sw }, tuned: { cell: O.cell, star: O.star, drift: O.drift, turn: O.turn, hint: O.hint }, kept: kept, hidden: hidden }, null, 1) }
  function draw() { box.innerHTML = ''; var x = el('button', 'x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'close tune'); x.onclick = function () { box.hidden = true; btn.hidden = false }; box.appendChild(x);
    SETS.forEach(function (s) { box.appendChild(el('h3', '', s.title));
      s.opts.forEach(function (o) { var id = s.key + '.' + o[0], hid = !!O.hide[id], row = el('div', 'opt' + (O[s.key] === o[0] ? ' cur' : '') + (hid ? ' hid' : ''));
        var p = el('button', 'pick'); p.type = 'button'; p.appendChild(el('b', '', o[1])); p.appendChild(el('small', '', o[2])); p.disabled = hid; p.onclick = function () { O[s.key] = o[0]; V.saveOpts(); draw() };
        var k = el('button', 'kh', hid ? 'show' : 'hide'); k.type = 'button'; k.onclick = function () { if (hid) delete O.hide[id]; else { O.hide[id] = 1; if (O[s.key] === o[0]) O[s.key] = V.base[s.key] } V.saveOpts(); draw() };
        row.appendChild(p); row.appendChild(k); box.appendChild(row) }) });
    box.appendChild(el('h3', '', 'Tuning'));
    SLIDERS.forEach(function (s) { var l = el('label'), i = el('input'), o = el('span', '', O[s[0]] + s[5]); i.type = 'range'; i.min = s[2]; i.max = s[3]; i.step = s[4]; i.value = O[s[0]];
      i.oninput = function () { O[s[0]] = +i.value; o.textContent = i.value + s[5]; V.saveOpts(); ta.value = feedback() }; l.appendChild(el('span', '', s[1])); l.appendChild(i); l.appendChild(o); box.appendChild(l) });
    var row = el('div', 'row'), r = el('button', '', 'back to the base'), c = el('button', '', 'copy my feedback');
    r.type = c.type = 'button'; r.onclick = function () { for (var k in V.base) O[k] = k === 'hide' ? {} : V.base[k]; V.saveOpts(); draw() };
    var ta = el('textarea'); ta.readOnly = true; ta.value = feedback();
    c.onclick = function () { ta.select(); try { navigator.clipboard.writeText(ta.value) } catch (e) { try { document.execCommand('copy') } catch (x) {} } c.textContent = 'copied' };
    row.appendChild(r); row.appendChild(c); box.appendChild(row); box.appendChild(ta) }
  btn.onclick = function () { draw(); box.hidden = false; btn.hidden = true };
  ['pointerdown', 'click'].forEach(function (t) { box.addEventListener(t, function (e) { e.stopPropagation() }); btn.addEventListener(t, function (e) { e.stopPropagation() }) });
  document.body.appendChild(btn); document.body.appendChild(box);
})(window);
