/* oz · outbox for Ask and Messages. A message leaves this phone for Artist Agent, either straight (direct)
   or along a simulated mesh of nearby stars (the F3 arc). Both end at the same place. A stub pollReplies() will render incoming bubbles once a reply inbox is wired. The link estimator is a quiet GET ping (no message, no wake).
   The hop is a simulation only — no radio, no other phones. It still plays when the system asks for less motion. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, html = document.documentElement;
  var MODE_KEY = 'oz-ask-mode', Q_KEY = 'oz-ask-outbox';
  var mode = 'direct', via = 'cors', posting = false, watchers = [];
  try { var s0 = localStorage.getItem(MODE_KEY); if (s0 === 'mesh' || s0 === 'direct') mode = s0; } catch (e) {}

  function ep() { return G.OZ_ASK_ENDPOINT || {}; }
  function roomName() { try { return (GJ.app && GJ.app.room) || 'sky'; } catch (e) { return 'sky'; } }
  function online() { return !(G.navigator && G.navigator.onLine === false); }
  function loadQ() { try { var q = JSON.parse(localStorage.getItem(Q_KEY) || '[]'); return Array.isArray(q) ? q : []; } catch (e) { return []; } }
  function saveQ(q) { try { localStorage.setItem(Q_KEY, JSON.stringify(q.slice(-40))); } catch (e) {} }
  function setMode(m) {
    if (m !== 'direct' && m !== 'mesh') return mode;
    mode = m;
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    watchers.forEach(function (f) { try { f(mode); } catch (e) {} });
    return mode;
  }

  /* ---------------- F3-arc hop / direct shimmer (JS timed; Reduce Motion is ignored) ---------------- */
  /* F3 icon path, in its 24×24 viewBox: a dotted rise from the water line to one bright star. */
  var ARC = [[8.50, 18.00], [8.64, 15.76], [9.04, 13.70], [9.72, 11.83], [10.67, 10.15], [11.90, 8.65], [13.39, 7.33], [15.15, 6.20], [17.19, 5.26], [19.5, 4.5]];
  var NEAR = [[6.2, 14.4], [12.8, 12.1], [10.1, 6.8], [16.4, 9.4], [14.2, 16.6], [20.4, 8.2]];
  var overlay = null, hopTimer = 0, hopRun = 0;
  function isSvc(svg) { return !!(svg && (svg.classList && svg.classList.contains('im-svc-arc') || (svg.closest && svg.closest('.im-svc')))); }
  function svcPt(i) {
    var p = ARC[Math.max(0, Math.min(ARC.length - 1, i))];
    var x = 8 + (p[0] - 8.5) / (19.5 - 8.5) * 104;
    var y = 14 + (p[1] - 18) / (4.5 - 18) * 10;
    return [x, y];
  }


  function setCount(el, s) { var n = el && el.querySelector('.am-count'); if (n) n.textContent = s; }
  function color() { return html.classList.contains('red') ? '#FF4457' : '#f4f1ea'; }
  function svcSvg(el) { return el && el.querySelector('.am-arc, .im-svc-arc, svg'); }
  function readyBar(bar) {
    if (!bar) return bar;
    var svg = bar.querySelector('svg');
    if (svg) { svg.classList.add('im-svc-arc', 'am-arc'); }
    var pkt = bar.querySelector('.im-svc-pkt, .am-pkt');
    if (pkt) pkt.classList.add('im-svc-pkt', 'am-pkt');
    else {
      var i = document.createElement('i'); i.className = 'im-svc-pkt am-pkt'; bar.appendChild(i);
    }
    if (!bar.querySelector('.im-warp')) {
      var w = document.createElement('i'); w.className = 'im-warp'; bar.appendChild(w);
    }
    if (!bar.querySelector('.am-count')) {
      var b = document.createElement('b'); b.className = 'am-count jul'; b.hidden = true; bar.appendChild(b);
    }
    return bar;
  }
  function ensure() {
    if (overlay && !((html.classList.contains('messaging') && overlay.closest('#msg')) || (html.classList.contains('asking') && overlay.closest('#ask')))) overlay = null;
    var bar = document.querySelector(html.classList.contains('messaging') ? '#msg .im-svc' : html.classList.contains('asking') ? '#ask .im-svc' : '.im-svc');
    if (bar) { overlay = readyBar(bar); return overlay; }
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'askmesh';
    overlay.className = 'im-svc';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<svg viewBox="0 0 120 18" class="im-svc-arc am-arc" width="120" height="18" aria-hidden="true"></svg><i class="im-svc-pkt am-pkt"></i><b class="am-count jul" hidden></b><i class="im-warp"></i>';
    var head = document.querySelector('.mg-head, .ak-head');
    if (head) head.appendChild(overlay); else document.body.appendChild(overlay);
    return overlay;
  }
  function warpStar() {
    document.querySelectorAll('.im-warp').forEach(function (w) {
      w.classList.remove('go');
      void w.offsetWidth;
      w.classList.add('go');
      setTimeout(function () { w.classList.remove('go'); }, 900);
    });
  }
  function ptAt(i, svg) { return isSvc(svg) ? svcPt(i) : ARC[Math.max(0, Math.min(ARC.length - 1, i))]; }
  function paintArc(svg, lit) {
    var c = color(), h = '', svc = isSvc(svg);
    if (!svc) {
      NEAR.forEach(function (p) {
        h += '<circle class="am-near" cx="' + p[0] + '" cy="' + p[1] + '" r="0.28" fill="' + c + '" fill-opacity="0.22"/>';
      });
    }
    ARC.forEach(function (raw, i) {
      var p = svc ? svcPt(i) : raw;
      var on = i <= lit, r = i === ARC.length - 1 ? (svc ? 2.2 : 1.35) : (svc ? 1.05 + i * 0.05 : 0.42 + i * 0.03);
      var op = on ? (i === lit ? 1 : 0.7) : 0.28;
      if (i === ARC.length - 1) {
        h += '<circle class="am-halo" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (svc ? 4.5 : 3.2) + '" fill="' + c + '" fill-opacity="' + (on ? 0.28 : 0.08) + '"/>';
      }
      h += '<circle class="am-n" data-i="' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + c + '" fill-opacity="' + op + '"/>';
    });
    svg.innerHTML = h;
  }
  function placePacket(el, i, frac) {
    var svg = el.querySelector('.am-arc, .im-svc-arc');
    var svc = isSvc(svg);
    var a = Math.max(0, Math.min(ARC.length - 1, Math.floor(i)));
    var b = Math.min(ARC.length - 1, a + 1);
    var f = (frac != null) ? frac : (i - a);
    var p0 = ptAt(a, svg), p1 = ptAt(b, svg);
    var p = [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f];
    var vbW = svc ? 120 : 24, vbH = svc ? 18 : 24;
    var r = svg.getBoundingClientRect(), host = el.getBoundingClientRect();
    var pkt = el.querySelector('.am-pkt, .im-svc-pkt');
    if (!pkt) return;
    pkt.style.left = (r.left - host.left + (p[0] / vbW) * r.width - pkt.offsetWidth / 2) + 'px';
    pkt.style.top = (r.top - host.top + (p[1] / vbH) * r.height - pkt.offsetHeight / 2) + 'px';
    pkt.style.background = color();
    pkt.style.boxShadow = '0 0 8px ' + color() + ', 0 0 14px ' + color();
    pkt.classList.add('on');
  }
  function hide() {
    if (!overlay) return;
    if (undoFn) {
      overlay.classList.add('show', 'undoable');
      var svg = svcSvg(overlay);
      if (svg) { paintArc(svg, ARC.length - 1); placePacket(overlay, ARC.length - 1); }
      return;
    }
    overlay.classList.remove('show', 'direct', 'mesh', 'undoable');
    var pkt = overlay.querySelector('.am-pkt, .im-svc-pkt');
    if (pkt) pkt.classList.remove('on');
    var cnt = overlay.querySelector('.am-count');
    if (cnt) cnt.textContent = '';
  }
  function playMesh(onTick) {
    return new Promise(function (resolve) {
      var el = ensure(), svg = svcSvg(el), n = ARC.length, i = 0, my = ++hopRun;
      clearTimeout(hopTimer);
      el.classList.remove('direct'); el.classList.add('show', 'mesh');
      paintArc(svg, 0); placePacket(el, 0);
      setCount(el, 'hop 1 of ' + n);
      if (onTick) onTick({ kind: 'mesh', hop: 1, of: n, label: 'hop 1 of ' + n });
      function step() {
        if (my !== hopRun) return resolve('cancelled');
        i++;
        if (i >= n) {
          paintArc(svg, n - 1); placePacket(el, n - 1);
          setCount(el, 'arrived');
          if (onTick) onTick({ kind: 'mesh', hop: n, of: n, label: 'arrived', done: true });
          hopTimer = setTimeout(function () { if (my === hopRun) hide(); resolve('done'); }, 700);
          return;
        }
        paintArc(svg, i); placePacket(el, i);
        var label = 'hop ' + (i + 1) + ' of ' + n;
        setCount(el, label);
        if (onTick) onTick({ kind: 'mesh', hop: i + 1, of: n, label: label });
        hopTimer = setTimeout(step, 220);
      }
      hopTimer = setTimeout(step, 260);
    });
  }
  function playDirect(onTick) {
    return new Promise(function (resolve) {
      var el = ensure(), svg = svcSvg(el), my = ++hopRun;
      clearTimeout(hopTimer);
      el.classList.remove('mesh'); el.classList.add('show', 'direct');
      paintArc(svg, -1);
      setCount(el, 'sending');
      if (onTick) onTick({ kind: 'direct', label: 'sending' });
      var start = performance.now(), dur = 820;
      function frame(t) {
        if (my !== hopRun) return resolve('cancelled');
        var k = Math.min(1, (t - start) / dur);
        var idx = k * (ARC.length - 1);
        paintArc(svg, Math.round(idx) - 1);
        placePacket(el, idx);
        if (k < 1) { requestAnimationFrame(frame); return; }
        paintArc(svg, ARC.length - 1);
        setCount(el, 'arrived');
        if (onTick) onTick({ kind: 'direct', label: 'arrived', done: true });
        hopTimer = setTimeout(function () { if (my === hopRun) hide(); resolve('done'); }, 600);
      }
      requestAnimationFrame(frame);
    });
  }
  function play(which, onTick) { return (which === 'mesh' ? playMesh : playDirect)(onTick); }


  /* Drag the climbing dots back toward F1 to undo the last send (while the bar is armed). */
  var undoFn = null, undoT = 0, dragging = false;
  function armUndo(fn, opts) {
    undoFn = fn;
    var el = ensure();
    el.classList.add('show', 'undoable');
    var svg = el.querySelector('.am-arc, .im-svc-arc');
    if (svg) { paintArc(svg, ARC.length - 1); placePacket(el, ARC.length - 1); }
    clearTimeout(undoT);
    undoT = setTimeout(function () {
      undoFn = null;
      el.classList.remove('undoable');
      hide();
    }, (opts && opts.ms) || 20000);
  }
  function bindUndo() {
    if (bindUndo.ok) return;
    bindUndo.ok = true;
    document.addEventListener('pointerdown', function (e) {
      var bar = e.target.closest && e.target.closest('.im-svc');
      if (!bar || !undoFn) return;
      dragging = true;
      try { bar.setPointerCapture(e.pointerId); } catch (x) {}
      e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (!dragging || !undoFn) return;
      var el = ensure(), r = el.getBoundingClientRect();
      var k = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
      var svg = el.querySelector('.am-arc, .im-svc-arc');
      var idx = k * (ARC.length - 1);
      paintArc(svg, Math.round(idx));
      placePacket(el, idx);
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      var el = ensure(), r = el.getBoundingClientRect();
      var k = (e.clientX - r.left) / Math.max(1, r.width);
      if (k < 0.38 && undoFn) {
        var fn = undoFn; undoFn = null; clearTimeout(undoT);
        el.classList.remove('undoable');
        hide();
        try { fn(); } catch (x) {}
      } else if (el) {
        var svg = el.querySelector('.am-arc, .im-svc-arc');
        paintArc(svg, ARC.length - 1); placePacket(el, ARC.length - 1);
      }
    }
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  }
  bindUndo();

  /* ---------------- POST: JSON as text/plain, no-cors, no Authorization ---------------- */

  function postOne(item) {
    var e = ep();
    if (!e.url) return Promise.reject(new Error('no endpoint'));
    if (!item.sealed) return Promise.reject(new Error('not sealed'));
    var body = JSON.stringify({
      source: 'oz', mode: item.mode, room: item.room,
      thread: item.thread || '', id: item.id,
      sealed: item.sealed, text: ''
    });
    via = 'nocors';
    var work = fetch(e.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: body })
      .then(function () { return { ok: true, via: 'nocors' }; });
    var to = new Promise(function (res) { setTimeout(function () { res({ ok: true, via: 'timeout' }); }, 4000); });
    return Promise.race([work, to]);
  }

  function flush() {
    if (posting || !online()) return Promise.resolve();
    var q = loadQ();
    if (!q.length) return Promise.resolve();
    posting = true;
    var item = q[0];
    return postOne(item).then(function () {
      var rest = loadQ().filter(function (x) { return x.id !== item.id; });
      saveQ(rest);
      posting = false;
      if (item.onDone) try { item.onDone('arrived'); } catch (e) {}
      return flush();
    }).catch(function () {
      item.tries = (item.tries || 0) + 1;
      var rest = loadQ();
      if (rest[0] && rest[0].id === item.id) rest[0].tries = item.tries;
      saveQ(rest);
      posting = false;
    });
  }

  var callbacks = {};
  function send(opts) {
    var text = String((opts && opts.text) || '').trim();
    if (!text) return Promise.resolve({ state: 'empty' });
    var item = {
      id: 'm' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      source: 'oz',
      mode: (opts && opts.mode) || mode,
      room: (opts && opts.room) || roomName(),
      text: text.slice(0, 2000),
      t: Date.now(),
      tries: 0,
      thread: (GJ.askSeal && GJ.askSeal.threadId()) || ''
    };
    var onState = opts && opts.onState;
    function say(st, extra) {
      var rec = Object.assign({ state: st, mode: item.mode, sealed: item.sealed || null }, extra || {});
      if (st === 'arrived') rec.label = 'Delivered';
      if (onState) try { onState(rec); } catch (e) {}
      return rec;
    }
    say('sending');
    var seal = (GJ.askSeal && GJ.askSeal.seal) ? GJ.askSeal.seal(item.text) : Promise.reject(new Error('no seal'));
    return seal.then(function (sealed) {
      item.sealed = sealed;
      play(item.mode, function (tick) {
        if (!tick.done) say(item.mode === 'mesh' ? 'hop' : 'sending', { hop: tick.hop, of: tick.of, label: tick.label, sealed: item.sealed });
        else warpStar();
      });
      function queue(why) {
        var q = loadQ();
        q.push({ id: item.id, source: item.source, mode: item.mode, room: item.room, sealed: item.sealed, thread: item.thread, t: item.t, tries: 1 });
        saveQ(q);
        return say('queued', { label: why, sealed: item.sealed });
      }
      if (!online()) return Promise.resolve(queue('Waiting to go'));
      return postOne(item).then(function () {
        return say('arrived', { label: 'Delivered', sealed: item.sealed });
      }).catch(function () { return queue('Waiting to go'); });
    }).catch(function () {
      return say('queued', { label: 'Waiting to seal' });
    });
  }

  G.addEventListener('online', function () { flush(); });
  setInterval(function () { flush(); }, 12000);
  setTimeout(flush, 1800);


  /* ---------------- incoming replies (stub) ---------------- */
  /* Gill will add a reply inbox next. pollReplies() must stay a function that
     returns a promise of an array of {id, text, t, from?}. Rendering is in Messages / Ask. */
  var replyWatchers = [], replySince = 0;
  function qs(params) {
    return Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
  }
  function jsonp(url, params) {
    return new Promise(function (resolve, reject) {
      var cb = 'ozR' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      var done = false, s = document.createElement('script');
      var tmr = setTimeout(function () { fail(new Error('timeout')); }, 8000);
      function clean() { clearTimeout(tmr); try { delete G[cb]; } catch (e) { G[cb] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); }
      function fail(err) { if (done) return; done = true; clean(); reject(err); }
      G[cb] = function (data) { if (done) return; done = true; clean(); resolve(data); };
      s.onerror = function () { fail(new Error('poll failed')); };
      s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + qs(params) + '&callback=' + cb;
      /* fix below if doubled */
      document.head.appendChild(s);
    });
  }
  function pollReplies() {
    var e = ep();
    if (!e.url || !GJ.askSeal) return Promise.resolve([]);
    var thread = GJ.askSeal.threadId();
    var params = { thread: thread, since: String(replySince || 0) };
    var get = fetch(e.url + '?' + qs(params), { method: 'GET', mode: 'cors', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); });
    return get.catch(function () { return jsonp(e.url, params); }).then(function (data) {
      var items = (data && data.items) || [];
      return Promise.all(items.map(function (it) {
        if (it.t && it.t > replySince) replySince = it.t;
        if (!it.sealed) return null;
        return GJ.askSeal.unseal(it.sealed).then(function (text) {
          return { id: it.id, text: text, t: it.t, sealed: it.sealed };
        }).catch(function () { return { id: it.id, text: '(could not unseal)', t: it.t }; });
      })).then(function (list) { return list.filter(Boolean); });
    }).catch(function () { return []; });
  }
  function onReply(fn) { if (typeof fn === 'function') replyWatchers.push(fn); }
  function tickReplies() {
    return pollReplies().then(function (list) {
      if (list && list.length) replyWatchers.forEach(function (f) { try { f(list); } catch (e) {} });
      return list || [];
    });
  }

  /* ---------------- link-speed estimator (space-mission telemetry) ---------------- */
  /* Quiet GET to the relay, no-cors, no body, no message — never wakes Artist Agent.
     Times the opaque response. Rolling average while Messages or Ask is open. */
  var LINK_KEY = 'oz-ask-link';
  var HOPS = ARC.length;
  var linkCfg = { on: true, every: 24000, timeout: 8000, window: 5, nominal: 3000, degraded: 8000 };
  try {
    var lc = JSON.parse(localStorage.getItem(LINK_KEY) || 'null');
    if (lc && typeof lc === 'object') {
      if (typeof lc.on === 'boolean') linkCfg.on = lc.on;
      if (lc.every) linkCfg.every = lc.every;
      if (lc.timeout) linkCfg.timeout = lc.timeout;
    }
  } catch (e) {}
  function saveLink() { try { localStorage.setItem(LINK_KEY, JSON.stringify({ on: linkCfg.on, every: linkCfg.every, timeout: linkCfg.timeout })); } catch (e) {} }
  var linkSamples = [], linkLast = null, linkTimer = 0, linkPulse = 0, linkWatchers = [];
  function fmtMs(ms) {
    if (ms == null || !isFinite(ms)) return '—';
    if (ms < 1000) return Math.round(ms) + ' ms';
    return (Math.round(ms / 100) / 10).toFixed(1) + ' s';
  }
  function linkKind() {
    if (!linkCfg.on) return 'off';
    if (linkLast && linkLast.ok === false) return 'none';
    if (!linkSamples.length) return 'listening';
    var avg = linkAvg();
    if (avg <= linkCfg.nominal) return 'nominal';
    if (avg <= linkCfg.degraded) return 'degraded';
    return 'none';
  }
  function linkAvg() {
    if (!linkSamples.length) return null;
    var s = 0; linkSamples.forEach(function (x) { s += x; });
    return s / linkSamples.length;
  }
  function linkLabel() {
    var kind = linkKind(), avg = linkAvg(), last = linkLast && linkLast.ok ? linkLast.ms : avg;
    if (kind === 'off') return 'link off';
    if (kind === 'listening') return 'signal · listening';
    if (kind === 'none') return 'no link — held on this phone';
    var sig = 'signal ' + fmtMs(last);
    var grade = kind === 'nominal' ? 'link nominal' : 'link degraded';
    if (mode === 'mesh' && last != null) return sig + ' · ' + fmtMs(last / HOPS) + ' / hop · ' + grade;
    return sig + ' · ' + grade;
  }
  function linkFig() {
    var kind = linkKind(), avg = linkAvg();
    if (kind === 'off') return '';
    if (kind === 'listening') return '·';
    if (kind === 'none') return '—';
    return fmtMs(avg);
  }
  function linkState() {
    return { on: linkCfg.on, every: linkCfg.every, timeout: linkCfg.timeout, samples: linkSamples.slice(),
      avg: linkAvg(), last: linkLast, kind: linkKind(), label: linkLabel(), fig: linkFig(), hops: HOPS,
      hopMs: (linkAvg() != null ? linkAvg() / HOPS : null) };
  }
  function emitLink() { var st = linkState(); linkWatchers.forEach(function (f) { try { f(st); } catch (e) {} }); paintTuneLink(); return st; }
  function paintTuneLink() {
    var b = document.querySelector('#tune [data-t="asklink"] b'); if (b) b.textContent = linkCfg.on ? 'on' : 'off';
    var c = document.querySelector('#tune [data-t="asklinkint"] b'); if (c) c.textContent = Math.round(linkCfg.every / 1000) + ' s';
  }
  function sheetsOpen() {
    return !!(GJ.messages && GJ.messages.isOpen && GJ.messages.isOpen()) || !!(GJ.ask && GJ.ask.isOpen && GJ.ask.isOpen());
  }
  function pingLink() {
    var e = ep();
    if (!linkCfg.on || !e.url) {
      linkLast = { ok: false, ms: null, reason: e.url ? 'off' : 'no endpoint' };
      return Promise.resolve(emitLink());
    }
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var done = false;
    function finish(ok, reason) {
      if (done) return linkState();
      done = true;
      var ms = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
      if (ok) {
        linkSamples.push(ms);
        if (linkSamples.length > linkCfg.window) linkSamples = linkSamples.slice(-linkCfg.window);
        linkLast = { ok: true, ms: ms };
      } else {
        linkLast = { ok: false, ms: ms, reason: reason || 'timeout' };
      }
      pulseLink(ok ? ms : Math.min(ms, 1400));
      return emitLink();
    }
    var timer = setTimeout(function () { finish(false, 'timeout'); }, linkCfg.timeout);
    return fetch(e.url, { method: 'GET', mode: 'no-cors', cache: 'no-store' }).then(function () {
      clearTimeout(timer); return finish(true);
    }, function () {
      clearTimeout(timer); return finish(false, 'error');
    });
  }
  function pulseLink(ms) {
    var dur = Math.max(600, Math.min(ms || 1200, 2400));
    var my = ++linkPulse;
    document.querySelectorAll('.im-svc svg.im-svc-arc').forEach(function (svg) {
      runPulse(svg, dur, my);
    });
  }
  function runPulse(svg, dur, my) {
    if (!svg) return;
    var host = svg;
    var pkt = host.querySelector('.im-lpkt');
    if (!pkt) {
      pkt = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pkt.setAttribute('class', 'im-lpkt');
      pkt.setAttribute('r', '1.35');
      host.appendChild(pkt);
    }
    var start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    function at(k) {
      var n = ARC.length - 1, span = k <= .5 ? k * 2 : (1 - k) * 2, idx = span * n;
      var a = Math.max(0, Math.min(n - 1, Math.floor(idx))), b = Math.min(n, a + 1), f = idx - a;
      var p0 = isSvc(svg) ? svcPt(a) : ARC[a], p1 = isSvc(svg) ? svcPt(b) : ARC[b];
      return [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f];
    }
    function frame(now) {
      if (my !== linkPulse) { pkt.setAttribute('opacity', '0'); return; }
      var t = (typeof now === 'number' ? now : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()));
      var k = Math.min(1, (t - start) / dur);
      var p = at(k);
      pkt.setAttribute('cx', p[0]); pkt.setAttribute('cy', p[1]); pkt.setAttribute('opacity', k < 1 ? '1' : '0');
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function loopLink() {
    clearTimeout(linkTimer);
    if (!linkCfg.on || !sheetsOpen()) return;
    pingLink();
    linkTimer = setTimeout(loopLink, linkCfg.every);
  }
  function startLink() {
    if (!linkCfg.on) { emitLink(); return; }
    clearTimeout(linkTimer);
    pingLink();
    linkTimer = setTimeout(loopLink, linkCfg.every);
  }
  function stopLink() {
    clearTimeout(linkTimer);
    if (!sheetsOpen()) { /* keep last reading */ }
  }
  function setLinkOn(v) { linkCfg.on = !!v; saveLink(); paintTuneLink(); if (linkCfg.on && sheetsOpen()) startLink(); else emitLink(); return linkCfg.on; }
  function setLinkEvery(ms) {
    var allowed = [12000, 24000, 48000];
    if (allowed.indexOf(ms) < 0) ms = 24000;
    linkCfg.every = ms; saveLink(); paintTuneLink(); emitLink(); return ms;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#tune button[data-t]');
    if (!b) return;
    var k = b.getAttribute('data-t');
    if (k === 'asklink') setLinkOn(!linkCfg.on);
    if (k === 'asklinkint') {
      var nx = { 12000: 24000, 24000: 48000, 48000: 12000 };
      setLinkEvery(nx[linkCfg.every] || 24000);
    }
  });
  setTimeout(paintTuneLink, 800);

  GJ.askOut = {
    mode: function () { return mode; },
    setMode: setMode,
    onMode: function (f) { watchers.push(f); },
    room: roomName,
    send: send,
    play: play,
    warp: warpStar,
    armUndo: armUndo,
    hide: hide,
    queued: function () { return loadQ().length; },
    flush: flush,
    via: function () { return via; },
    forceVia: function (v) { if (v === 'cors' || v === 'nocors') via = v; return via; },
    pollReplies: pollReplies,
    onReply: onReply,
    tickReplies: tickReplies,
    link: {
      ping: pingLink, start: startLink, stop: stopLink, state: linkState,
      on: function (f) { linkWatchers.push(f); },
      setOn: setLinkOn, setEvery: setLinkEvery,
      cfg: function () { return { on: linkCfg.on, every: linkCfg.every, timeout: linkCfg.timeout }; },
      fmt: fmtMs, pulse: pulseLink
    }
  };
})(window);
