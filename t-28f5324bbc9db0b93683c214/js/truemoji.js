/* bubble round, item 4 · the new truemojis and the status marks, in the standard pack's 3D emoji style: soft, sculpted
   shapes with a warm light from the upper left, a gentle shade below and a small highlight — the same family as the
   pack's hands together, high five and hang loose. Not star-light drawings; no mint.
   New in the standard pack: goodnight moon · call-me phone · golden hour sun · DND red dot · heart hands · rolling
   clapperboard · walk paw. Status marks: online (a quiet pearl) · do not disturb (the red dot) · walking (the paw) ·
   rolling / shooting (the clapperboard) · darkroom (a little safelight lamp) · sleeping (the goodnight moon).
   OZ_TRUEMOJI.svg(name, size) · .names · .label(name) */
(function (G) {
  'use strict';
  var n = 0;
  function defs(id, body) { return '<defs>' + body.replace(/ID/g, id) + '</defs>'; }
  function shadow(id) { return '<filter id="sh' + id + '" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".28"/></filter>'; }
  function heartHands(id) {   // two hands, fingers curled over the top and thumbs meeting at the point; a knit cuff and a bracelet, after the pack's hands together
   var skin='<linearGradient id="kID" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2ab80"/><stop offset=".5" stop-color="#b9774a"/><stop offset="1" stop-color="#7c4627"/></linearGradient>'+
    '<linearGradient id="kbID" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d3b1"/><stop offset=".5" stop-color="#e2a776"/><stop offset="1" stop-color="#b27346"/></linearGradient>'+
    '<radialGradient id="gID" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="#ffd2a8" stop-opacity=".9"/><stop offset="1" stop-color="#ff8f7a" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="nID" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a3a32"/><stop offset=".5" stop-color="#6e5a4c"/><stop offset="1" stop-color="#3b2d27"/></linearGradient>'+
    '<linearGradient id="vID" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4ece2"/><stop offset="1" stop-color="#cfc2b4"/></linearGradient>'+
    '<filter id="shID" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".28"/></filter>';
   function hand(g, cuff){ return '<g>'+
     // wrist and sleeve
     '<path d="M27 70 L20 90" stroke="url(#'+g+'ID)" stroke-width="17" stroke-linecap="round"/>'+cuff+
     // palm
     '<path d="M14 48 C12 62 18 74 30 78 C38 80 44 78 47 74 L40 52 Z" fill="url(#'+g+'ID)"/>'+
     // fingers: a curled band over the top lobe, tips meeting in the notch
     '<path d="M16 50 C12 34 18 20 31 18 C41 17 47 24 48.5 33" fill="none" stroke="url(#'+g+'ID)" stroke-width="13" stroke-linecap="round"/>'+
     // thumb down to the point
     '<path d="M36 72 C41 77 45 80 48.5 82" fill="none" stroke="url(#'+g+'ID)" stroke-width="9" stroke-linecap="round"/>'+
     // finger creases and knuckles
     '<g fill="none" stroke="#8a4f2b" stroke-width="1.4" stroke-linecap="round" opacity=".55"><path d="M13.5 38 q6 1 8 -3"/><path d="M19 27 q5 3 8 -1"/><path d="M30 22.5 q3 4 7 2"/><path d="M41 23 q0 5 5 5"/><path d="M38 76.5 q2 -3 5 -2"/></g>'+
     // highlight
     '<path d="M14 40 C14 30 19 23 27 21" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".42"/>'+
     '</g>'; }
   var knit='<g transform="rotate(20 19 96)"><rect x="8" y="88" width="22" height="16" rx="4" fill="url(#nID)"/><g stroke="#2a201b" stroke-width="1.2" opacity=".55"><path d="M12 89v14M16 89v14M20 89v14M24 89v14M28 89v13"/></g></g>';
   var plain='<g transform="rotate(20 19 96)"><rect x="8" y="89" width="22" height="15" rx="3" fill="url(#vID)"/><rect x="9" y="86" width="20" height="2.6" rx="1.3" fill="#d9a441"/></g>';
   return '<defs>'+skin.replace(/ID/g,id)+'</defs><g transform="translate(7 1) scale(.86)">'+
    '<path d="M50 82 C40 74 24 62 24 46 C24 36 31 31 38 32 C44 33 48 37 50 41 C52 37 56 33 62 32 C69 31 76 36 76 46 C76 62 60 74 50 82Z" fill="url(#g'+id+')"/>'+
    '<g filter="url(#sh'+id+')">'+hand('k',knit).replace(/ID/g,id)+'<g transform="translate(100 0) scale(-1 1)">'+hand('kb',plain).replace(/ID/g,id)+'</g></g></g>';
  }
  var M = {
    moon: ['goodnight moon', function (id) { return defs(id, '<radialGradient id="mID" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff6c9"/><stop offset=".45" stop-color="#ffd75a"/><stop offset="1" stop-color="#e09a1c"/></radialGradient><radialGradient id="sID" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff8d8"/><stop offset="1" stop-color="#f0b43a"/></radialGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><path d="M70 12 A42 42 0 1 0 84 84 A34 34 0 1 1 70 12Z" fill="url(#m' + id + ')"/></g><path d="M34 55 q6 6 12 0" fill="none" stroke="#9a5a12" stroke-width="3" stroke-linecap="round"/><path d="M40 72 q8 5 16 -1" fill="none" stroke="#9a5a12" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="38" cy="34" rx="9" ry="5" fill="#fff" opacity=".55" transform="rotate(-35 38 34)"/>' +
      '<path d="M82 26 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="url(#s' + id + ')"/>'; }],
    phone: ['call-me phone', function (id) { return defs(id, '<linearGradient id="pID" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8d86"/><stop offset=".55" stop-color="#e2463f"/><stop offset="1" stop-color="#a51f22"/></linearGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><path d="M22 26 C30 14 44 14 50 22 L56 32 C59 37 57 42 52 45 L46 48 C50 58 58 66 68 70 L71 64 C74 59 79 57 84 60 L94 66 C102 72 102 86 90 94 C74 104 48 92 32 74 C16 56 12 40 22 26Z" fill="url(#p' + id + ')"/></g><path d="M28 30 C33 22 40 21 44 25" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>'; }],
    sun: ['golden hour sun', function (id) { return defs(id, '<radialGradient id="gID" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#fff3c4"/><stop offset=".4" stop-color="#ffc24a"/><stop offset="1" stop-color="#ef7d1f"/></radialGradient><linearGradient id="hID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb46a"/><stop offset="1" stop-color="#d9603a"/></linearGradient>' + shadow(id)) +
      '<g stroke="#ffb03b" stroke-width="5" stroke-linecap="round"><path d="M50 18 v-9 M26 28 l-6 -6 M74 28 l6 -6 M14 50 h-8 M86 50 h8"/></g><g filter="url(#sh' + id + ')"><path d="M18 62 A32 32 0 0 1 82 62Z" fill="url(#g' + id + ')"/><rect x="8" y="62" width="84" height="12" rx="6" fill="url(#h' + id + ')"/></g><ellipse cx="38" cy="42" rx="10" ry="6" fill="#fff" opacity=".5" transform="rotate(-30 38 42)"/><rect x="22" y="80" width="56" height="7" rx="3.5" fill="#e58a4a" opacity=".7"/>'; }],
    dnd: ['DND red dot', function (id) { return defs(id, '<radialGradient id="rID" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#ff9a92"/><stop offset=".45" stop-color="#ef3d3d"/><stop offset="1" stop-color="#8f1018"/></radialGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><circle cx="50" cy="50" r="34" fill="url(#r' + id + ')"/></g><rect x="30" y="45" width="40" height="10" rx="5" fill="#fff" opacity=".92"/><ellipse cx="38" cy="32" rx="11" ry="6" fill="#fff" opacity=".5" transform="rotate(-30 38 32)"/>'; }],
    hearthands: ['heart hands', heartHands],
    clapper: ['rolling clapperboard', function (id) { return defs(id, '<linearGradient id="bID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b5f68"/><stop offset="1" stop-color="#25272c"/></linearGradient><linearGradient id="tID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4d55"/><stop offset="1" stop-color="#1f2125"/></linearGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><rect x="14" y="42" width="72" height="46" rx="8" fill="url(#b' + id + ')"/><g transform="rotate(-14 14 40)"><rect x="14" y="24" width="72" height="16" rx="5" fill="url(#t' + id + ')"/><path d="M24 24 l10 16 h10 l-10 -16z M48 24 l10 16 h10 l-10 -16z M72 24 l10 16 h4 v-6 l-6 -10z" fill="#f2f0ea"/></g></g>' +
      '<rect x="14" y="42" width="72" height="9" fill="#f2f0ea" opacity=".9"/><path d="M24 42 l8 9 h8 l-8 -9z M48 42 l8 9 h8 l-8 -9z M72 42 l8 9 h6 v-2 l-6 -7z" fill="#2a2c31"/><rect x="22" y="60" width="40" height="5" rx="2.5" fill="#c9ccd2" opacity=".6"/><rect x="22" y="70" width="26" height="5" rx="2.5" fill="#c9ccd2" opacity=".45"/><circle cx="76" cy="76" r="4" fill="#ff4d4d"/>'; }],
    paw: ['walk paw', function (id) { return defs(id, '<radialGradient id="aID" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#c9926a"/><stop offset=".6" stop-color="#8d5a37"/><stop offset="1" stop-color="#5e3820"/></radialGradient><radialGradient id="eID" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#ffc8c8"/><stop offset="1" stop-color="#e48c92"/></radialGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><ellipse cx="50" cy="66" rx="24" ry="20" fill="url(#a' + id + ')"/><ellipse cx="22" cy="44" rx="9" ry="12" fill="url(#a' + id + ')" transform="rotate(-20 22 44)"/><ellipse cx="38" cy="26" rx="9" ry="12" fill="url(#a' + id + ')" transform="rotate(-6 38 26)"/><ellipse cx="62" cy="26" rx="9" ry="12" fill="url(#a' + id + ')" transform="rotate(6 62 26)"/><ellipse cx="78" cy="44" rx="9" ry="12" fill="url(#a' + id + ')" transform="rotate(20 78 44)"/></g>' +
      '<ellipse cx="50" cy="69" rx="14" ry="11" fill="url(#e' + id + ')"/><ellipse cx="44" cy="58" rx="7" ry="4" fill="#fff" opacity=".35"/><ellipse cx="35" cy="21" rx="3" ry="2" fill="#fff" opacity=".4"/><ellipse cx="59" cy="21" rx="3" ry="2" fill="#fff" opacity=".4"/>'; }],
    online: ['online', function (id) { return defs(id, '<radialGradient id="oID" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".5" stop-color="#ead2a6"/><stop offset="1" stop-color="#b58a4a"/></radialGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><circle cx="50" cy="50" r="30" fill="url(#o' + id + ')"/></g><ellipse cx="40" cy="38" rx="10" ry="6" fill="#fff" opacity=".7" transform="rotate(-30 40 38)"/><circle cx="50" cy="50" r="38" fill="none" stroke="#ead2a6" stroke-width="2" opacity=".45"/>'; }],
    darkroom: ['darkroom', function (id) { return defs(id, '<linearGradient id="dID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b4e56"/><stop offset="1" stop-color="#1c1d22"/></linearGradient><radialGradient id="lID" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#ffb0a8"/><stop offset=".5" stop-color="#ef3b3b"/><stop offset="1" stop-color="#8f0f18"/></radialGradient>' + shadow(id)) +
      '<g filter="url(#sh' + id + ')"><rect x="44" y="8" width="12" height="16" rx="3" fill="#3a3c42"/><path d="M20 58 C20 34 34 22 50 22 C66 22 80 34 80 58Z" fill="url(#d' + id + ')"/><rect x="16" y="56" width="68" height="10" rx="5" fill="#2a2b30"/></g>' +
      '<ellipse cx="50" cy="74" rx="26" ry="10" fill="url(#l' + id + ')"/><ellipse cx="50" cy="86" rx="34" ry="8" fill="#ff3b3b" opacity=".18"/><ellipse cx="36" cy="38" rx="8" ry="4" fill="#fff" opacity=".25" transform="rotate(-30 36 38)"/>'; }]
  };
  function svg(name, size) { var m = M[name]; if (!m) return ''; var id = 'tm' + (++n); return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' role="img" aria-label="' + m[0] + '">' + m[1](id) + '</svg>'; }
  G.OZ_TRUEMOJI = { svg: svg, label: function (k) { return M[k] ? M[k][0] : k; }, names: Object.keys(M), pack: ['moon', 'phone', 'sun', 'dnd', 'hearthands', 'clapper', 'paw'] };
  if (typeof module !== 'undefined') module.exports = G.OZ_TRUEMOJI;
})(typeof window !== 'undefined' ? window : globalThis);
