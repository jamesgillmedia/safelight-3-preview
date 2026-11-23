/* tools-02 · F3: see exactly what this app sends (briefs SETTINGS / KILLER-APPS / LOCAL-PHONE / ICONS in the campaign pack;
   F3 scope corrected 18 Nov: an app can only see its own traffic, so the star shows what the app itself sends — never the
   whole phone). Built 19 Nov on Gill's tap "F3 star + its log".
     the star ........ a single small star beside the red-mode dot. Dark at rest. It lights only while a request made by this
                       app is on its way off the device, and goes out when it ends (held a third of a second at least, so
                       the eye can catch a short one). It is never a decoration, and never the dot's mint.
     the log ......... Tune → F3 log: when, what, where — append-only, kept on this device, the last 7 days.
     the switch ...... "block network": while on, nothing this app tries is sent; each try is written down as blocked.
   What counts: fetch, XMLHttpRequest, sendBeacon and WebSocket to another address, and the share sheet (you send it, but
   it leaves). What does not: the app loading its own files from its own address, and anything done on the device.
   Nothing is invented: an empty log says so. Loaded first, so every later script's requests pass through it. */
(function (G) {
  'use strict';
  var GJ = G.GJ = G.GJ || {}, html = document.documentElement, KEY = 'gj-f3', WEEK = 7 * 864e5;
  var st = { log: [], block: false }; try { var sv = JSON.parse(GJ.settings.getItem(KEY) || 'null'); if (sv) { st.log = sv.log || []; st.block = !!sv.block; } } catch (e) {}
  function save() { var cut = Date.now() - WEEK; st.log = st.log.filter(function (e) { return e.t >= cut; }).slice(-400); try { GJ.settings.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var live = 0, offT = 0, onAt = 0, star = null, panel = null;
  function paintStar() { if (!star) return; var d = document.getElementById('disc'); if (d) { var r = d.getBoundingClientRect(); if (r.width) { star.style.left = (r.left - 9) + 'px'; star.style.top = (r.top + r.height / 2) + 'px'; } } star.classList.toggle('on', html.classList.contains('f3-out')); }
  function light() { live++; clearTimeout(offT); if (live === 1) { onAt = Date.now(); html.classList.add('f3-out'); paintStar(); } }
  function dark() { live = Math.max(0, live - 1); if (live) return; var left = Math.max(0, 320 - (Date.now() - onAt)); clearTimeout(offT); offT = setTimeout(function () { if (!live) { html.classList.remove('f3-out'); paintStar(); } }, left); }
  function entry(what, where) { var e = { t: Date.now(), what: what, where: where, end: 'sending' }; st.log.push(e); save(); if (isOpen()) paint(); return e; }
  function done(e, end) { e.end = end; save(); if (isOpen()) paint(); }
  function outside(u) { try { var a = new URL(u, G.location.href); if (a.protocol !== 'http:' && a.protocol !== 'https:' && a.protocol !== 'ws:' && a.protocol !== 'wss:') return null; if (a.origin === G.location.origin) return null; return a; } catch (e) { return null; } }
  function describe(method, a, body) {
    var keys = []; try { a.searchParams.forEach(function (v, k) { if (keys.indexOf(k) < 0) keys.push(k); }); } catch (e) {}
    return (method || 'GET').toUpperCase() + ' ' + (a.pathname || '/') + (keys.length ? ' · sent: ' + keys.slice(0, 8).join(', ') : '') + (body ? ' · with a body' : '');
  }
  // one gate for every way out: returns null when it is not leaving, else { e, blocked }
  function leave(method, url, body) {
    var a = outside(url); if (!a) return null;
    var e = entry(describe(method, a, body), a.host);
    if (st.block) { done(e, 'blocked'); return { e: e, blocked: true }; }
    if (G.navigator && G.navigator.onLine === false) { done(e, 'not sent · offline'); return { e: e, offline: true }; }   // airplane mode: the star never lights
    light(); return { e: e };
  }
  function settle(o, end) { if (!o || o.blocked || o.offline) return; done(o.e, end); dark(); }

  if (G.fetch) { var f0 = G.fetch; G.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input), m = (init && init.method) || (input && input.method) || 'GET', o = leave(m, url, init && init.body);
    if (o && o.blocked) return Promise.reject(new TypeError('F3: network is blocked'));
    var p = f0.apply(this, arguments); if (!o) return p;
    return p.then(function (r) { settle(o, 'sent · answered ' + r.status); return r; }, function (err) { settle(o, 'sent · no answer'); throw err; });
  }; }
  if (G.XMLHttpRequest) { var X = G.XMLHttpRequest.prototype, o0 = X.open, s0 = X.send;
    X.open = function (m, u) { this._f3 = [m, u]; return o0.apply(this, arguments); };
    X.send = function (body) { var x = this, o = x._f3 ? leave(x._f3[0], x._f3[1], body) : null; if (o && o.blocked) { try { x.abort(); } catch (e) {} return; }
      if (o) x.addEventListener('loadend', function () { settle(o, x.status ? 'sent · answered ' + x.status : 'sent · no answer'); }); return s0.apply(this, arguments); }; }
  if (G.navigator && G.navigator.sendBeacon) { var b0 = G.navigator.sendBeacon.bind(G.navigator); try { G.navigator.sendBeacon = function (u, d) { var o = leave('POST', u, d); if (o && o.blocked) return false; var ok = b0(u, d); settle(o, ok ? 'sent' : 'not sent'); return ok; }; } catch (e) {} }
  if (G.WebSocket) { var W0 = G.WebSocket; try { G.WebSocket = function (u, pr) { var o = leave('OPEN', u); if (o && o.blocked) throw new Error('F3: network is blocked'); var w = pr === undefined ? new W0(u) : new W0(u, pr); if (o) { w.addEventListener('close', function () { settle(o, 'closed'); }); } return w; }; G.WebSocket.prototype = W0.prototype; } catch (e) {} }
  if (G.navigator && G.navigator.share) { var sh0 = G.navigator.share.bind(G.navigator); try { G.navigator.share = function (d) {
    var n = d && d.files ? d.files.length : 0, e = entry('share sheet · ' + (n ? n + (n === 1 ? ' file' : ' files') : (d && d.title) || 'text'), 'where you choose');
    if (st.block) { done(e, 'blocked'); return Promise.reject(new Error('F3: network is blocked')); }
    light(); return sh0(d).then(function (r) { done(e, 'handed to the share sheet'); dark(); return r; }, function (err) { done(e, 'not shared'); dark(); throw err; }); }; } catch (e) {} }

  function when(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()] + ' ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isOpen() { return html.classList.contains('f3ing'); }
  function paint() {
    if (!panel) return; var L = st.log.slice().reverse();
    panel.querySelector('.f3-list').innerHTML = L.length ? L.map(function (e) { return '<div class="f3-e"><i>' + when(e.t) + '</i><span>' + esc(e.what) + '</span><b>' + esc(e.where) + '</b><em>' + esc(e.end) + '</em></div>'; }).join('') : '<p class="f3-none">Nothing has left this device.</p>';
    panel.querySelector('.f3-n').textContent = L.length ? L.length + (L.length === 1 ? ' thing' : ' things') + ' in the last 7 days' : 'the last 7 days';
    panel.querySelector('.f3-block b').textContent = st.block ? 'on' : 'off';
  }
  function mount() {
    star = document.createElement('i'); star.id = 'f3'; star.setAttribute('role', 'img'); star.setAttribute('aria-label', 'F3: something is leaving this device');
    star.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="f3g"><stop offset="0" stop-opacity=".75"/><stop offset=".45" stop-opacity=".22"/><stop offset="1" stop-opacity="0"/></radialGradient></defs><circle class="f3-d" cx="8.50" cy="18.00" r="0.50" opacity="0.55"/><circle class="f3-d" cx="8.64" cy="15.76" r="0.52" opacity="0.59"/><circle class="f3-d" cx="9.04" cy="13.70" r="0.53" opacity="0.64"/><circle class="f3-d" cx="9.72" cy="11.83" r="0.55" opacity="0.68"/><circle class="f3-d" cx="10.67" cy="10.15" r="0.57" opacity="0.73"/><circle class="f3-d" cx="11.90" cy="8.65" r="0.58" opacity="0.77"/><circle class="f3-d" cx="13.39" cy="7.33" r="0.60" opacity="0.82"/><circle class="f3-d" cx="15.15" cy="6.20" r="0.62" opacity="0.86"/><circle class="f3-d" cx="17.19" cy="5.26" r="0.63" opacity="0.91"/><circle class="f3-d" cx="8.50" cy="19.20" r=".45" opacity="0.28"/><circle class="f3-d" cx="8.64" cy="21.44" r=".45" opacity="0.22"/><circle class="f3-d" cx="9.04" cy="23.50" r=".45" opacity="0.16"/><circle class="f3-d" cx="9.72" cy="25.37" r=".45" opacity="0.10"/><rect class="f3-d f3-w" x="5.5" y="18.45" width="6.5" height=".3" opacity=".35"/><circle class="f3-halo" cx="19.5" cy="4.5" r="4.5" fill="url(#f3g)"/><circle class="f3-tip" cx="19.5" cy="4.5" r="1.5"/></svg>'; document.body.appendChild(star);   // the F3 icon: a dotted arc rising from the water line to one bright, softly glowing star, a faint reflection below
    panel = document.createElement('div'); panel.id = 'f3log'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'F3 log: what this app has sent'); panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '<b class="jul">F3 · what this app has sent</b><span class="jul f3-n"></span><div class="f3-list"></div><button class="f3-block">Block network <b>off</b></button><span class="f3-foot">The star beside the red-mode dot lights only while something is leaving. Kept on this device, never sent. The app loading its own files is not listed.</span><button class="jul f3-x">close</button>';
    document.body.appendChild(panel);
    panel.querySelector('.f3-x').addEventListener('click', close);
    panel.querySelector('.f3-block').addEventListener('click', function () { st.block = !st.block; save(); paint(); if (GJ.haptic) GJ.haptic.tick(); });
    paintStar(); G.addEventListener('resize', paintStar);
  }
  function open() { paint(); html.classList.add('f3ing'); panel.setAttribute('aria-hidden', 'false'); }
  function close() { if (!isOpen()) return; html.classList.remove('f3ing'); panel.setAttribute('aria-hidden', 'true'); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  /* catch-up: a hand-off to the phone's own apps (a call to the dialer, a message to Messages, FaceTime): it leaves oz,
     so the star lights for it and the log says what went and where. Nothing else is sent. */
  function out(what, where) { var e = entry(what, where); light(); setTimeout(function () { done(e, 'handed to the phone'); dark(); }, 700); return true; }
  GJ.f3 = { out: out, page: function (url) { var o = leave('GET', url); return function (end) { settle(o, end || 'loaded'); }; },   // oz next 13: a page the Browser opens from the network
    open: open, close: close, isOpen: isOpen, log: function () { return st.log.slice(); }, lit: function () { return html.classList.contains('f3-out'); }, block: function (v) { if (v != null) { st.block = !!v; save(); if (isOpen()) paint(); } return st.block; }, clearForTest: function () { st.log = []; save(); if (isOpen()) paint(); } };
})(window);
