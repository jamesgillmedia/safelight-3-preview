/* dock edit · 23 Nov
   Four states:
   1. touch the dock icon area (in a room, or at home) → revealed
   2. the next tap on a place → opens it and freezes the dock until a tap outside
   3. hold a place on the frozen dock → that room's shortcut pad (3D, not a step dial)
   4. hold the revealed (not frozen) dock → edit: swap and reorder priority rooms
   Persist dock order to the existing prefs (local). */
(function () {
  'use strict';
  var H = document.documentElement;
  var Q = new URLSearchParams(location.search);
  var HOLD_MS = 500, MOVE = 9;
  var state = 'idle';
  var holdT = null, down = false, sx = 0, sy = 0, moved = false, ateClick = false;
  var holdOn = null, padRoom = null, editSel = null, drag = null;
  var shotLock = false;

  function oz() { return window.__oz; }
  function $(id) { return document.getElementById(id); }
  function cue(t) { var el = $('dockCue'); if (el) el.textContent = t || ''; }
  function hereId() {
    var a = oz();
    if (!a) return null;
    return a.view() === 'room' ? a.room() : (a.view() === 'sky' ? 'sky' : null);
  }
  function markHere() {
    var id = hereId();
    Array.prototype.forEach.call(document.querySelectorAll('#arcDock .ad'), function (b) {
      if (id && b.dataset.id === id) b.setAttribute('data-here', '1');
      else b.removeAttribute('data-here');
    });
  }

  function setState(s) {
    var a = oz();
    state = s;
    if (s === 'idle') H.removeAttribute('data-dock');
    else H.setAttribute('data-dock', s);
    if (!a) return;
    if (s === 'idle') {
      $('dockEdit').hidden = true;
      $('dockPad').hidden = true;
      $('dockPad').innerHTML = '';
      cue('');
      a.dockClose(true);
      editSel = null;
      padRoom = null;
    } else {
      a.dockOpen(true);
      markHere();
    }
    if (s === 'revealed') {
      $('dockEdit').hidden = true;
      $('dockPad').hidden = true;
      cue('hold to edit · tap a place to stay');
    } else if (s === 'frozen') {
      $('dockEdit').hidden = true;
      $('dockPad').hidden = true;
      cue('stays · hold a place for shortcuts');
    } else if (s === 'edit') {
      $('dockPad').hidden = true;
      $('dockEdit').hidden = false;
      cue('drag to reorder · tap a place, then a slot, to swap');
      if (!editSel) {
        var slots = a.dockSlots();
        editSel = hereId() && slots.indexOf(hereId()) >= 0 ? hereId() : slots[0];
      }
      renderTray();
      markSel();
    } else if (s === 'pad') {
      $('dockEdit').hidden = true;
      cue('shortcuts · tap one, or tap away');
    }
  }

  function reveal() {
    var a = oz();
    if (!a) return;
    if (a.P.dock2 === 'off') return;
    a.renderArc();
    setState('revealed');
    a.wake();
    a.tick(8);
  }

  function freeze() {
    setState('frozen');
    var a = oz();
    if (a) a.wake();
  }

  function exitAll() { setState('idle'); }

  /* ——— tray / edit ——— */
  function trayPool() {
    var a = oz(), dock = a.dockSlots(), L = a.places().filter(function (id) { return dock.indexOf(id) < 0; });
    if (a.roomShown('sky') && dock.indexOf('sky') < 0 && L.indexOf('sky') < 0) L.push('sky');
    return L;
  }
  function markSel() {
    Array.prototype.forEach.call(document.querySelectorAll('#arcDock .ad'), function (b) {
      b.classList.toggle('sel', !!(editSel && b.dataset.id === editSel));
    });
  }
  function renderTray() {
    var a = oz(), tray = $('dockTray'), box = $('dockEdit'), k = box.querySelector('.de-k');
    var pool = trayPool();
    var ess = !!a.P.essentials;
    k.textContent = ess ? 'essentials · other places' : 'your other places';
    tray.innerHTML = '';
    if (!pool.length) {
      var p = document.createElement('p');
      p.className = 'de-empty';
      p.textContent = ess ? 'essentials · these stay in the dock' : 'every place you have on is already in the dock';
      tray.appendChild(p);
      return;
    }
    pool.forEach(function (id) {
      var b = document.createElement('button');
      b.className = 'de-item';
      b.type = 'button';
      b.dataset.id = id;
      b.setAttribute('aria-label', a.NAME(id));
      b.innerHTML = '<b></b><span></span>';
      b.firstChild.innerHTML = a.glyph(id);
      b.lastChild.textContent = a.NAME(id);
      tray.appendChild(b);
    });
  }
  function swapInto(slotId, incoming) {
    var a = oz();
    if (!a || !incoming || slotId === incoming) return;
    var slots = a.dockSlots().slice();
    var i = slots.indexOf(slotId), j = slots.indexOf(incoming);
    if (i < 0) return;
    if (j >= 0) { var t = slots[i]; slots[i] = slots[j]; slots[j] = t; }
    else slots[i] = incoming;
    a.setDockSlots(slots);
    editSel = incoming;
    markHere();
    markSel();
    renderTray();
    a.tick(6);
  }
  function reorder(fromId, toId) {
    var a = oz();
    var slots = a.dockSlots().slice();
    var i = slots.indexOf(fromId), j = slots.indexOf(toId);
    if (i < 0 || j < 0 || i === j) return;
    slots.splice(i, 1);
    slots.splice(j, 0, fromId);
    a.setDockSlots(slots);
    editSel = fromId;
    markHere();
    markSel();
    a.tick(6);
  }

  /* ——— 3D pad dial (room shortcuts). not a step / notch / plate dial. ——— */
  var ACT = {
    new: '<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="5"/><path d="M15 15l4 4"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M9 7l9 5-9 5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M8 7h3v10H8zM13 7h3v10h-3z"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M7 7h10v10H7z"/></svg>',
    rec: '<svg viewBox="0 0 24 24"><circle class="dot" cx="12" cy="12" r="4"/></svg>',
    latest: '<svg viewBox="0 0 24 24"><path d="M6 6h5v5H6zM13 6h5v5h-5zM6 13h5v5H6z"/></svg>',
    light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="11" r="4"/><path d="M4 16h16"/></svg>',
    open: null
  };
  var SHORT = {
    messages: [['new', 'new message'], ['search', 'search'], ['open', 'open']],
    archive: [['latest', 'latest'], ['open', 'picks'], ['open', 'compare']],
    timer: [['play', 'start'], ['pause', 'pause'], ['reset', 'reset'], ['open', 'open']],
    loops: [['rec', 'record'], ['new', 'new loop'], ['open', 'open']],
    golden: [['light', "today's light"], ['open', 'the sky'], ['open', 'open']],
    player: [['play', 'play'], ['open', 'the sky'], ['open', 'open']],
    notes: [['new', 'a note'], ['open', 'open']],
    noise: [['play', 'play'], ['open', 'open']],
    friends: [['new', 'someone'], ['open', 'open']],
    tonecheck: [['play', 'listen'], ['open', 'open']],
    planner: [['new', 'a shot'], ['open', 'open']],
    lab: [['open', 'the shelf'], ['open', 'open']],
    picks: [['open', 'open']],
    decide: [['new', 'a question'], ['open', 'open']],
    sweep: [['open', 'compare'], ['open', 'open']],
    feed: [['latest', 'latest'], ['open', 'open']],
    objects: [['open', 'open']],
    demos: [['play', 'play'], ['open', 'open']],
    sky: [['open', 'the sky']],
    default: [['open', 'open']]
  };
  // map some labels onto rooms when "open" is used with a name
  var GO = { 'picks': 'picks', 'compare': 'sweep', 'the sky': 'sky', 'the shelf': 'lab' };

  function padItems(id) { return SHORT[id] || SHORT.default; }

  function openPad(id, fromEl) {
    var a = oz(), pad = $('dockPad');
    padRoom = id;
    var r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth / 2 - 22, top: innerHeight - 80, width: 44, height: 44 };
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    pad.style.left = '0px';
    pad.style.top = '0px';
    pad.style.width = '100%';
    pad.style.height = '100%';
    var items = padItems(id);
    var ax = cx, ay = cy - 78;
    var h = '<i class="pad-atm" aria-hidden="true" style="left:' + ax.toFixed(1) + 'px;top:' + ay.toFixed(1) + 'px"></i>';
    h += '<i class="pad-ring" aria-hidden="true" style="left:' + ax.toFixed(1) + 'px;top:' + ay.toFixed(1) + 'px"></i>';
    var stars = [[-70, -40, .4], [80, -70, .25], [-90, 20, .2], [60, 50, .3], [-20, -90, .18], [100, 10, .22], [-50, 70, .16], [20, -60, .28]];
    stars.forEach(function (s) {
      h += '<i class="pad-star" style="left:' + (ax + s[0]) + 'px;top:' + (ay + s[1]) + 'px;opacity:' + s[2] + ';transform:translateZ(' + (s[2] * 48 - 16) + 'px)"></i>';
    });
    var n = items.length, radius = 84;
    items.forEach(function (it, i) {
      var ang = -Math.PI / 2 + (i - (n - 1) / 2) * (Math.PI / Math.max(5, n + 1));
      var x = ax + Math.cos(ang) * radius;
      var y = ay + Math.sin(ang) * (radius * .48);
      var z = 28 + Math.cos((i - (n - 1) / 2) * .6) * 22;
      var kind = it[0], label = it[1];
      var icon = kind === 'open' && GO[label] ? a.glyph(GO[label]) : (kind === 'open' ? a.glyph(id) : ACT[kind]);
      h += '<button class="pad-item" type="button" role="menuitem" data-kind="' + kind + '" data-go="' + (GO[label] || (kind === 'open' ? id : '')) + '" data-label="' + label.replace(/"/g, '') + '" style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px;--z:' + z.toFixed(1) + 'px"><b>' + (icon || ACT.new) + '</b><span></span></button>';
    });
    pad.innerHTML = h;
    Array.prototype.forEach.call(pad.querySelectorAll('.pad-item span'), function (sp) { sp.textContent = sp.parentNode.dataset.label; });
    pad.hidden = false;
    setState('pad');
    a.tick(10);
  }

  function runShortcut(btn) {
    var a = oz();
    var go = btn.dataset.go, kind = btn.dataset.kind, label = btn.dataset.label;
    a.tick(8);
    setState('frozen');
    $('dockPad').hidden = true;
    $('dockPad').innerHTML = '';
    if (go && a.ROOMS[go]) a.open(go, null, btn);
    else if (kind === 'open' && padRoom) a.open(padRoom, null, btn);
    else {
      var t = $('toast');
      if (t) { t.textContent = (label || kind) + ' · in this prototype'; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1800); }
    }
  }

  /* ——— pointer grammar ——— */
  function clearHold() { if (holdT) { clearTimeout(holdT); holdT = null; } }

  function onHitDown(e) {
    if (state !== 'idle') return;
    if (e.target.closest && e.target.closest('#homeLine, #cam, #dimmer, #corner, #rBack')) return;
    e.stopPropagation();
    reveal();
  }

  $('dockHit').addEventListener('pointerdown', onHitDown);

  // swipe-up already adds dockopen; treat that as revealed if we were idle
  var mo = new MutationObserver(function () {
    if (shotLock) return;
    if (H.classList.contains('dockopen') && state === 'idle') setState('revealed');
    if (!H.classList.contains('dockopen') && state !== 'idle' && !dockClosing) {
      // something else closed the dock
    }
  });
  mo.observe(H, { attributes: true, attributeFilter: ['class'] });
  var dockClosing = false;

  $('arcDock').addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.ad');
    down = true; moved = false; ateClick = false; sx = e.clientX; sy = e.clientY; holdOn = b;
    clearHold();
    if (state === 'idle') reveal();
    if (state === 'edit' && b) {
      // potential drag to reorder
      holdT = setTimeout(function () { /* keep selected while holding */ }, 60);
      return;
    }
    if ((state === 'revealed' || state === 'frozen') && !shotLock) {
      holdT = setTimeout(function () {
        if (!down || moved) return;
        ateClick = true;
        if (state === 'revealed') {
          editSel = (holdOn && holdOn.dataset.id) || editSel;
          setState('edit');
          oz() && oz().tick(10);
        } else if (state === 'frozen' && holdOn) {
          openPad(holdOn.dataset.id, holdOn);
        }
      }, HOLD_MS);
    }
  });

  document.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > MOVE) { moved = true; clearHold(); }
    if (state === 'edit' && holdOn && moved && !drag) startDrag(e, holdOn);
    if (drag) moveDrag(e);
  }, { passive: true });

  document.addEventListener('pointerup', function (e) {
    if (!down) return;
    down = false;
    clearHold();
    if (drag) { endDrag(e); return; }
    if (state === 'edit' && !moved) {
      var trayBtn = e.target.closest && e.target.closest('#dockTray .de-item');
      var slot = e.target.closest && e.target.closest('#arcDock .ad');
      var done = e.target.closest && e.target.closest('#dockDone');
      if (done) { ateClick = true; setState('frozen'); return; }
      if (trayBtn) {
        ateClick = true;
        if (editSel) swapInto(editSel, trayBtn.dataset.id);
      } else if (slot) {
        ateClick = true;
        editSel = slot.dataset.id;
        markSel();
      }
    }
  }, true);

  document.addEventListener('pointercancel', function () {
    down = false; clearHold();
    if (drag) cancelDrag();
  }, true);

  // capture click: stop the original "open this place" while we are editing, in the pad, or after a hold
  $('arcDock').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.ad');
    if (!b) return;
    if (ateClick || state === 'edit' || state === 'pad') {
      e.stopPropagation();
      e.preventDefault();
      ateClick = false;
      return;
    }
    if (state === 'revealed' || state === 'frozen' || state === 'idle') {
      // let the original handler open the room, then freeze
      setTimeout(function () { freeze(); }, 0);
    }
  }, true);

  $('dockDone').addEventListener('click', function (e) {
    e.stopPropagation();
    setState('frozen');
  });

  $('dockPad').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pad-item');
    if (b) { e.stopPropagation(); runShortcut(b); }
  });

  // tap away
  document.addEventListener('pointerdown', function (e) {
    if (state === 'idle') return;
    if (e.target.closest && e.target.closest('#arcDock, #dockEdit, #dockPad, #dockDone, #dockCue, #dockHit, #homeLine')) return;
    if (state === 'pad') {
      setState('frozen');
      $('dockPad').hidden = true;
      $('dockPad').innerHTML = '';
      e.stopPropagation();
      return;
    }
    if (state === 'edit') {
      setState('frozen');
      e.stopPropagation();
      return;
    }
    if (state === 'frozen' || state === 'revealed') {
      exitAll();
    }
  }, true);

  /* ——— drag to reorder (edit) ——— */
  function startDrag(e, b) {
    var a = oz();
    drag = { id: b.dataset.id, el: b };
    b.classList.add('ghost');
    var g = document.createElement('div');
    g.id = 'dockGhost';
    g.innerHTML = '<b></b><span></span>';
    g.firstChild.innerHTML = a.glyph(drag.id);
    g.lastChild.textContent = a.NAME(drag.id);
    document.body.appendChild(g);
    moveDrag(e);
    a.tick(4);
  }
  function moveDrag(e) {
    var g = $('dockGhost');
    if (!g) return;
    g.style.left = (e.clientX - 22) + 'px';
    g.style.top = (e.clientY - 22) + 'px';
    var over = slotAt(e.clientX, e.clientY);
    Array.prototype.forEach.call(document.querySelectorAll('#arcDock .ad'), function (b) {
      b.classList.toggle('sel', over ? b.dataset.id === over.dataset.id : b.dataset.id === editSel);
    });
  }
  function slotAt(x, y) {
    var found = null;
    Array.prototype.forEach.call(document.querySelectorAll('#arcDock .ad'), function (b) {
      var r = b.getBoundingClientRect();
      if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 16 && y <= r.bottom + 16) found = b;
    });
    return found;
  }
  function endDrag(e) {
    var over = slotAt(e.clientX, e.clientY);
    var from = drag && drag.id;
    cancelDrag();
    var trayBtn = document.elementFromPoint(e.clientX, e.clientY);
    trayBtn = trayBtn && trayBtn.closest && trayBtn.closest('#dockTray .de-item');
    if (trayBtn && from) swapInto(from, trayBtn.dataset.id);
    else if (over && from && over.dataset.id !== from) reorder(from, over.dataset.id);
  }
  function cancelDrag() {
    if (drag && drag.el) drag.el.classList.remove('ghost');
    var g = $('dockGhost'); if (g) g.remove();
    drag = null;
    markSel();
  }

  window.__ozDock = {
    refresh: function () {
      markHere();
      if (state === 'edit') { renderTray(); markSel(); }
    },
    onForceClose: function () { if (state !== 'idle' && !shotLock) setState('idle'); },
    onBack: function () {
      if (state === 'pad') { setState('frozen'); $('dockPad').hidden = true; $('dockPad').innerHTML = ''; return; }
      if (state === 'edit') { setState('frozen'); return; }
      exitAll();
    },
    state: function () { return state; },
    set: function (s) { setState(s); },
    reveal: reveal,
    freeze: freeze,
    edit: function (sel) { editSel = sel || editSel; setState('edit'); },
    pad: function (id) {
      var el = document.querySelector('#arcDock .ad[data-id="' + id + '"]');
      if (state !== 'frozen') setState('frozen');
      openPad(id, el);
    },
    swapInto: swapInto
  };

  /* shots: freeze a state, skip boot, optionally set the icon style */
  function applyShot() {
    var shot = Q.get('shot');
    if (!shot) return;
    var a = oz();
    if (!a) { setTimeout(applyShot, 40); return; }
    shotLock = true;
    if (Q.get('icons') === 'constellation' || Q.get('icons') === 'oz') {
      a.P.iconStyle = Q.get('icons') === 'constellation' ? 'constellation' : 'oz';
      a.save();
      H.setAttribute('data-icons', a.P.iconStyle);
    }
    if (!a.P.dockSlots || !a.P.dockSlots.length) {
      a.P.dockSlots = ['messages', 'archive', 'timer', 'loops', 'golden'];
      a.save();
    }
    a.renderArc();
    function go() {
      if (shot === 'reveal' || shot === 'frozen' || shot === 'pad' || shot === 'edit') {
        a.open('timer');
      }
      requestAnimationFrame(function () {
        a.renderArc();
        if (shot === 'reveal') { reveal(); }
        else if (shot === 'frozen') { reveal(); freeze(); }
        else if (shot === 'pad') { reveal(); freeze(); setTimeout(function () { window.__ozDock.pad('timer'); }, 40); }
        else if (shot === 'edit') {
          reveal();
          setTimeout(function () {
            editSel = 'loops';
            setState('edit');
            Array.prototype.forEach.call(document.querySelectorAll('#arcDock .ad'), function (b, i) {
              b.style.animation = 'none';
              b.style.transform = 'rotate(' + (i % 2 ? 2.2 : -2.2) + 'deg)';
            });
          }, 40);
        }
        markHere();
        document.documentElement.classList.add('awake', 'dockopen');
      });
    }
    setTimeout(go, 80);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyShot);
  else applyShot();
})();
