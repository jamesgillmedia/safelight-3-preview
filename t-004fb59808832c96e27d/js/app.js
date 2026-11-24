/* CKS work examples. Photo lab look (v1), fed by the same data.json as the constellation.
   Photos open a gallery. Film, music, 3D and the CV use the existing deep pages.
   No new navigation beyond the Photolab / Constellation switch. */
const DEEP = {
  scoop: { also: 'orbit/', alsoLabel: 'turn the scoop ›' },
  cup: { also: 'orbit/cup/', alsoLabel: 'turn the cup ›' },
  sculpture: { also: 'film/weird-kid/', alsoLabel: 'Weird Kid ›' },
  'weird-kid': { href: 'film/weird-kid/', hrefLabel: 'open the film page ›' },
  owtd: { href: 'film/one-with-the-devil/', hrefLabel: 'open the film page ›' },
  'colour-field': { href: 'film/untitled-colour-work/', hrefLabel: 'open the film page ›' },
  'lost-in-time': { href: 'player/?track=lostintime', hrefLabel: 'open the sky player ›' },
  cv: { href: 'cv/', hrefLabel: 'open the CV ›', also: 'cv/gill-james-cv-web-v4.pdf', alsoLabel: 'download the PDF ›' }
};

const GROUPS = [
  { id: 'objects', name: 'objects', keys: ['scoop', 'cup', 'paddle', 'moss', 'rim'] },
  { id: 'photographs', name: 'photographs', keys: ['canopy', 'rosebuds'] },
  { id: 'sculpture', name: 'sculpture', keys: ['sculpture', 'weird-kid', 'spirit-eye'] },
  { id: 'film', name: 'film and sound', keys: ['owtd', 'colour-field', 'lost-in-time'] },
  { id: 'cv', name: 'CV', keys: ['cv'] }
];

const STAR_POS = {
  scoop: [50, 16],
  cup: [32, 28],
  paddle: [68, 26],
  moss: [20, 42],
  rim: [80, 40],
  canopy: [28, 52],
  rosebuds: [72, 52],
  sculpture: [28, 64],
  'weird-kid': [50, 64],
  'spirit-eye': [72, 64],
  owtd: [26, 80],
  'colour-field': [50, 82],
  'lost-in-time': [74, 80],
  cv: [50, 92]
};

const EXTRA = {
  owtd: { kind: 'film', src: 'media/av/one-with-the-devil-excerpt.mp4', poster: 'media/owtd/poster.jpg', cap: 'One With the Devil. A native excerpt. The film page has the stills and credits.' },
  'colour-field': { kind: 'film', src: 'media/av/untitled-colour-field.mov', poster: 'media/photos/colour-field-poster.jpg', cap: 'Untitled colour work. 2022. The native clip.' },
  'lost-in-time': { kind: 'sound', src: 'media/audio/lost-in-time.mp3', cap: 'Lost in Time. Lost Coffee. The full track. The sky player has the rest of the music.' }
};

const $ = id => document.getElementById(id);
const sky = $('sky'), sheet = $('sheet'), work = $('work');
const stage = $('stage'), cap = $('cap'), count = $('count');
const types = $('types'), hint = $('hint'), where = $('where');
const back = $('back'), sheetBtn = $('sheetBtn');
const prev = $('prev'), next = $('next');
const here = $('hereCue'), deepBox = $('deep'), nearBox = $('near');

let WORKS = [];
let mode = 'sky';
let current = null;
let vi = 0;
let fromView = 'sky';

function isNarrow(){ return window.matchMedia('(max-width:720px)').matches }

function setHere(t){ if (here) here.textContent = t }

function setHint(t){ hint.textContent = t; hint.hidden = !t }

function chapterToWork(ch){
  const versions = [];
  (ch.cards || []).forEach(card => {
    const m = card.media || {};
    const src = m.big || m.thumb;
    if (!src) return;
    versions.push({
      kind: 'photo',
      src: src,
      cap: [card.title, card.body].filter(Boolean).join(' ') || ch.nm
    });
  });
  const extra = EXTRA[ch.k];
  if (extra) versions.push(Object.assign({}, extra));
  const pos = STAR_POS[ch.k] || [50, 50];
  const thumb = (ch.cards && ch.cards[0] && ch.cards[0].media && (ch.cards[0].media.thumb || ch.cards[0].media.big)) || '';
  return {
    id: ch.k,
    name: ch.nm,
    x: pos[0], y: pos[1],
    thumb: thumb,
    featured: ch.k === 'scoop',
    near: ch.near || [],
    versions: versions.length ? versions : [{ kind: 'photo', src: thumb, cap: ch.nm }]
  };
}

function starfield(){
  const box = $('starfield');
  box.innerHTML = '';
  for (let i = 0; i < 80; i++){
    const s = document.createElement('i');
    s.style.left = (Math.random()*100) + '%';
    s.style.top = (Math.random()*100) + '%';
    s.style.opacity = (0.12 + Math.random()*0.4).toFixed(2);
    s.style.width = s.style.height = (1 + Math.round(Math.random()*2)) + 'px';
    box.appendChild(s);
  }
}

function buildSky(){
  const box = $('constel');
  box.innerHTML = '';
  WORKS.forEach(w => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'star' + (w.featured ? ' featured' : '');
    b.style.left = w.x + '%';
    b.style.top = w.y + '%';
    b.innerHTML = '<span class="dot"></span><span class="nm ju">' + w.name + (w.featured ? ' · featured' : '') + '</span>';
    b.addEventListener('click', () => openWork(w.id, 0));
    box.appendChild(b);
  });
}

function buildSheet(){
  const wrap = $('groups');
  wrap.innerHTML = '';
  $('phd').textContent = WORKS.length + ' works';
  const byId = {};
  WORKS.forEach(w => { byId[w.id] = w });
  GROUPS.forEach(g => {
    const keys = g.keys.filter(k => byId[k]);
    if (!keys.length) return;
    const sec = document.createElement('section');
    sec.className = 'group';
    const h = document.createElement('h2');
    h.className = 'ju';
    h.textContent = g.name;
    sec.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'grid';
    keys.forEach(k => {
      const w = byId[k];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cell' + (w.featured ? ' featured' : '');
      if (w.thumb){
        const img = document.createElement('img');
        img.src = w.thumb;
        img.alt = w.name;
        b.appendChild(img);
      } else {
        b.style.background = '#0b0e10';
        b.style.display = 'grid';
        b.style.placeItems = 'center';
      }
      const s = document.createElement('span');
      s.textContent = w.name + (w.featured ? ' · featured' : '');
      b.appendChild(s);
      b.addEventListener('click', () => openWork(w.id, 0));
      grid.appendChild(b);
    });
    sec.appendChild(grid);
    wrap.appendChild(sec);
  });
}

function show(id){
  [sky, sheet, work].forEach(el => el.classList.toggle('on', el.id === id));
  const onWork = id === 'work';
  back.hidden = !onWork && id === (isNarrow() ? 'sheet' : 'sky');
  if (id === 'sky') back.hidden = true;
  if (id === 'sheet' && isNarrow() && !current) back.hidden = true;
  if (id === 'sheet' && current) back.hidden = false;
  sheetBtn.classList.toggle('on', id === 'sheet');
  sheetBtn.setAttribute('aria-pressed', id === 'sheet' ? 'true' : 'false');
}

function home(){
  current = null;
  vi = 0;
  mode = isNarrow() ? 'sheet' : 'sky';
  where.textContent = 'Permanent Impermanence';
  setHere('you are here · photolab');
  show(mode);
  back.hidden = true;
  setHint(mode === 'sheet' ? 'tap a work' : 'tap a star');
  history.replaceState(null, '', location.pathname);
}

function openWork(id, index){
  const w = WORKS.find(x => x.id === id);
  if (!w) return;
  fromView = (mode === 'sheet' || isNarrow()) ? 'sheet' : 'sky';
  current = w;
  vi = Math.max(0, Math.min(index || 0, w.versions.length - 1));
  mode = 'work';
  where.textContent = w.name;
  setHere('you are here · ' + w.name);
  show('work');
  back.hidden = false;
  renderVersion();
  history.replaceState(null, '', '#' + w.id);
}

function renderVersion(){
  const w = current, v = w.versions[vi], n = w.versions.length;
  cap.textContent = v.cap || w.name;
  count.textContent = n > 1 ? (vi + 1) + ' of ' + n : '';
  prev.hidden = next.hidden = n <= 1;
  const kinds = [];
  w.versions.forEach((ver, i) => {
    const label = ver.kind === '3d' ? '3D' : ver.kind;
    if (!kinds.some(k => k.label === label)) kinds.push({ label, i, kind: ver.kind });
  });
  types.hidden = kinds.length <= 1;
  types.innerHTML = '';
  if (!types.hidden){
    kinds.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lab-btn' + (w.versions[vi].kind === k.kind ? ' on' : '');
      b.textContent = k.label;
      b.addEventListener('click', () => { vi = k.i; renderVersion(); });
      types.appendChild(b);
    });
  }
  const d = DEEP[w.id] || {};
  const links = [];
  if (d.href) links.push({ href: d.href, label: d.hrefLabel || ('open ' + w.name + ' ›') });
  if (d.also) links.push({ href: d.also, label: d.alsoLabel || 'open ›' });
  if (links.length){
    deepBox.hidden = false;
    deepBox.innerHTML = links.map(l => '<a href="' + l.href + '">' + l.label + '</a>').join('');
  } else {
    deepBox.hidden = true;
    deepBox.innerHTML = '';
  }
  if (w.near && w.near.length){
    nearBox.hidden = false;
    nearBox.innerHTML = w.near.map(n => '<a href="#' + n.k + '">' + n.nm + '</a>').join('');
  } else {
    nearBox.hidden = true;
    nearBox.innerHTML = '';
  }
  setHint('');
  stage.querySelectorAll('video,audio').forEach(el => { el.pause(); el.removeAttribute('src'); el.load(); });
  stage.innerHTML = '';
  if (v.kind === 'photo'){
    const img = document.createElement('img');
    img.src = v.src;
    img.alt = w.name;
    stage.appendChild(img);
  } else if (v.kind === 'film'){
    const vid = document.createElement('video');
    vid.controls = true;
    vid.playsInline = true;
    if (v.poster) vid.poster = v.poster;
    vid.src = v.src;
    stage.appendChild(vid);
  } else if (v.kind === 'sound'){
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = v.src;
    stage.appendChild(audio);
  }
}

function goList(){
  current = null;
  mode = (fromView === 'sheet' || isNarrow()) ? 'sheet' : 'sky';
  where.textContent = 'Permanent Impermanence';
  setHere('you are here · photolab');
  show(mode);
  back.hidden = true;
  setHint(mode === 'sheet' ? 'tap a work' : 'tap a star');
  history.replaceState(null, '', location.pathname);
}

back.addEventListener('click', () => {
  if (mode === 'work' || mode === 'sheet') goList();
  else home();
});

sheetBtn.addEventListener('click', () => {
  if (mode === 'sheet'){
    if (isNarrow()) return;
    home();
    return;
  }
  mode = 'sheet';
  current = null;
  where.textContent = 'Permanent Impermanence';
  setHere('you are here · the sheet');
  show('sheet');
  back.hidden = isNarrow();
  setHint('tap a work');
});

prev.addEventListener('click', () => { if (!current) return; vi = (vi - 1 + current.versions.length) % current.versions.length; renderVersion(); });
next.addEventListener('click', () => { if (!current) return; vi = (vi + 1) % current.versions.length; renderVersion(); });
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') back.click();
  if (mode !== 'work') return;
  if (e.key === 'ArrowLeft') prev.click();
  if (e.key === 'ArrowRight') next.click();
});

function layout(){
  document.body.classList.toggle('narrow', isNarrow());
  if (mode === 'sky' && isNarrow()) { mode = 'sheet'; show('sheet'); setHint('tap a work'); back.hidden = true; }
}

function applyHash(){
  const hash = location.hash.replace('#','');
  if (hash && WORKS.some(w => w.id === hash)) openWork(hash, 0);
  else home();
}

fetch('data.json').then(r => r.json()).then(d => {
  const order = [];
  GROUPS.forEach(g => g.keys.forEach(k => order.push(k)));
  const by = {};
  (d.chapters || []).forEach(ch => { by[ch.k] = ch });
  WORKS = order.filter(k => by[k]).map(k => chapterToWork(by[k]));
  (d.chapters || []).forEach(ch => {
    if (!WORKS.some(w => w.id === ch.k)) WORKS.push(chapterToWork(ch));
  });
  starfield();
  buildSky();
  buildSheet();
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('hashchange', applyHash);
  applyHash();
}).catch(e => {
  console.warn(e);
  setHint('the works could not be loaded');
});
