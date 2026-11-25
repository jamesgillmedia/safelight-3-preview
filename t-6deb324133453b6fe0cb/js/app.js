/* CKS work examples. Photo lab look.
   One star per work. Open a work to see it, one piece at a time.
   Photo, 3D, film and sound each use a simple, native display.
   Photographs are never tinted. */
import * as THREE from 'three';
import { loadCup } from './cup.js';

const WORKS = [
  {
    id: 'paddle',
    name: 'carved paddle',
    year: '2023',
    line: 'The grain and the carved hollow catching the light.',
    x: 16, y: 26,
    thumb: 'media/stills/01-paddle-blade-grain-2023.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/01-paddle-blade-grain-2023.jpg', cap: 'Close on the blade.' },
      { kind: 'photo', src: 'media/stills/paddle-close-grain.webp', cap: 'Close on the grain.' },
      { kind: 'photo', src: 'media/stills/paddle-product.webp', cap: 'The whole paddle.' },
      { kind: 'photo', src: 'media/stills/paddle-against-wall.webp', cap: 'Against the wall, in the light.' },
      { kind: 'photo', src: 'media/stills/paddle-window-light.webp', cap: 'In slat-window light.' },
      { kind: 'photo', src: 'media/stills/paddle-in-hand.webp', cap: 'In the hand.' }
    ]
  },
  {
    id: 'cup',
    name: 'ceramic cup',
    year: '2024',
    line: 'A small cup of coffee on a wooden board, the glaze catching the light.',
    x: 34, y: 20,
    thumb: 'media/stills/02-speckled-cup-2024.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/02-speckled-cup-2024.jpg', cap: '' },
      { kind: 'photo', src: 'media/stills/cup-hand-cd63215d.jpg', cap: 'Held in the hand.' },
      { kind: 'photo', src: 'media/stills/cup-from-above-1341.jpg', cap: 'From above, the interior.' },
      { kind: 'photo', src: 'media/stills/cup-pour.webp', cap: 'In the hand, with coffee.' },
      { kind: 'photo', src: 'media/stills/cup-on-a-board.webp', cap: 'On a wooden board.' },
      { kind: 'photo', src: 'media/stills/cup-filled-5831.jpg', cap: 'Filled, in the hand.' },
      { kind: 'photo', src: 'media/stills/cup-espresso-6153.jpg', cap: 'On the table, with other vessels.' },
      { kind: 'photo', src: 'media/stills/cup-board-paddles-6690.jpg', cap: 'On a board with carved paddles.' },
      { kind: 'photo', src: 'media/stills/cup-display-sunlight-1170.jpg', cap: 'On a display board in sunlight.' },
      { kind: '3d', src: 'media/3d/joio-cup.glb', cap: 'The same cup, as a 3D model. Drag to turn it.' }
    ]
  },
  {
    id: 'ice-cream-scoop',
    name: 'ice cream scoop',
    year: '',
    line: 'A ceramic scoop, held in the hand.',
    x: 52, y: 22,
    thumb: 'media/stills/scoop-hand-2aea8932.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/scoop-hand-2aea8932.jpg', cap: '' },
      { kind: 'photo', src: 'media/stills/scoop-side-full.jpg', cap: 'From the side.' },
      { kind: 'photo', src: 'media/stills/scoop-in-hand-full.jpg', cap: 'The bowl and the handle.' },
      { kind: 'photo', src: 'media/stills/scoop-bowl.webp', cap: 'The bowl.' },
      { kind: 'photo', src: 'media/stills/scoop-context-full.jpg', cap: 'With the paddles.' },
      { kind: 'photo', src: 'media/stills/display-cup-scoop-1167.jpg', cap: 'On a display board, with the cup.' }
    ]
  },
  {
    id: 'rim',
    name: 'bowl rim',
    year: '',
    line: 'A thin crescent of light along the edge, like a moon.',
    x: 70, y: 28,
    thumb: 'media/stills/03-crescent-rim.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/03-crescent-rim.jpg', cap: '' },
      { kind: 'photo', src: 'media/stills/crescent-rim-object.webp', cap: 'The rim in colour, light along the edge.' }
    ]
  },
  {
    id: 'scoop',
    name: 'wooden scoop',
    year: '',
    line: 'Held in slat-window light, its shadow falling across the slats.',
    x: 86, y: 22,
    thumb: 'media/stills/04-scoop-hanging-slat-light.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/04-scoop-hanging-slat-light.jpg', cap: '' }
    ]
  },
  {
    id: 'sculpture',
    name: 'hanging sculpture',
    year: '',
    line: 'The piece on a plain wall, a branch curving down.',
    x: 16, y: 52,
    thumb: 'media/stills/hanging-sculpture-sunlight-d290ef9b.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/hanging-sculpture-sunlight-d290ef9b.jpg', cap: 'In a blade of sunlight, a long curved shadow on the wall.' },
      { kind: 'photo', src: 'media/stills/hanging-sculpture-bw-1824da0d.jpg', cap: '' },
      { kind: 'photo', src: 'media/stills/hanging-sculpture-head-9a457e08.jpg', cap: 'Close on the head.' },
      { kind: 'photo', src: 'media/stills/hanging-sculpture-head-4ba2ab74.jpg', cap: 'Close on the head.' },
      { kind: 'photo', src: 'media/stills/hanging-sculpture-head-dbe3a28a.jpg', cap: 'Close on the head.' },
      { kind: 'photo', src: 'media/weird-kid/stills/wk-forest-floor.jpg', cap: 'From Weird Kid. The forest floor.' },
      { kind: 'photo', src: 'media/weird-kid/stills/wk-forest-path.jpg', cap: 'From Weird Kid. A path through the trees.' },
      { kind: 'photo', src: 'media/weird-kid/stills/wk-raven.jpg', cap: 'From Weird Kid. A raven in the branches.' },
      { kind: 'film', src: 'media/weird-kid/clips/wk-horse-rears.mp4', poster: 'media/weird-kid/clips/wk-horse-rears.jpg',
        cap: 'From Weird Kid. The horse rears against the sunset.' }
    ]
  },
  {
    id: 'moss',
    name: 'moss vessel',
    year: '',
    line: 'Window light throws the plant\'s shadow on the wall.',
    x: 36, y: 50,
    thumb: 'media/stills/06-moss-vessel.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/06-moss-vessel.jpg', cap: '' },
      { kind: 'photo', src: 'media/stills/planter-cup-with-moss.webp', cap: 'Moss in a small vessel, in the light.' }
    ]
  },
  {
    id: 'canopy',
    name: 'forest canopy',
    year: '',
    line: 'Looking straight up, light falling through the fog.',
    x: 58, y: 56,
    thumb: 'media/stills/07-forest-canopy.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/07-forest-canopy.jpg', cap: '' }
    ]
  },
  {
    id: 'rosebuds',
    name: 'rosebuds',
    year: '',
    line: 'Two buds in a bar of window light, their shadows on the wall.',
    x: 80, y: 50,
    thumb: 'media/stills/08-rosebuds-photograph.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/08-rosebuds-photograph.jpg', cap: '' }
    ]
  },
  {
    id: 'spirit-eye',
    name: 'Spirit Eye of skwácháýs',
    year: '2025',
    line: 'A giant lens floating on the water in a ring, like a Salish spindle whorl.',
    x: 22, y: 78,
    thumb: 'media/stills/09-spirit-eye-from-above-2025.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/09-spirit-eye-from-above-2025.jpg',
        cap: 'The whole work from above. Public art concept, with Joshua Ngenda, BIDC Public Art Intensive, Vancouver. The glass sits at the centre.' },
      { kind: 'photo', src: 'media/stills/10-spirit-eye-section-2025.jpg',
        cap: 'A cross-section. The lens sits on the surface and a column carries its light down to a forest garden underground.' }
    ]
  },
  {
    id: 'owtd',
    name: 'One With the Devil',
    year: '',
    line: 'Short drama. I was the cinematographer. Director Drew Pollins.',
    x: 48, y: 74,
    thumb: 'media/posters/owtd.jpg',
    versions: [
      { kind: 'film', src: 'media/av/AV1-one-with-the-devil-excerpt-cinematography.mp4', poster: 'media/posters/owtd.jpg',
        cap: 'A 1 minute 52 second excerpt from the opening.' },
      { kind: 'photo', src: 'media/owtd/stills/01_wood_chop.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/02_dallas_snow.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/03_colton_snow_trees.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/04_table_twoshot.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/05_lantern_portrait.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/06_colton_cabin.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/07_dallas_cu.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/08_rose.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/09_landscape.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/10_rifle_doorway.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/11_night_cabin.jpg', cap: '' },
      { kind: 'photo', src: 'media/owtd/stills/12_candlelight.jpg', cap: '' }
    ]
  },
  {
    id: 'lost-in-time',
    name: 'Lost in Time',
    year: '',
    line: 'Lost Coffee. The full track, 3 minutes 36 seconds.',
    x: 70, y: 80,
    thumb: 'media/stills/moonloop.webp',
    versions: [
      { kind: 'sound', src: 'media/av/AV2-lost-coffee-lost-in-time.wav', cap: '' }
    ]
  },
  {
    id: 'colour-field',
    name: 'untitled colour work',
    year: '2022',
    line: 'Moving image, 8 seconds.',
    x: 88, y: 70,
    thumb: 'media/posters/colour-field.jpg',
    versions: [
      { kind: 'film', src: 'media/av/AV3-untitled-colour-field.mov', poster: 'media/posters/colour-field.jpg', cap: '' }
    ]
  }
];

const $ = id => document.getElementById(id);
const sky = $('sky'), sheet = $('sheet'), work = $('work');
const stage = $('stage'), cap = $('cap'), count = $('count');
const types = $('types'), hint = $('hint'), where = $('where');
const back = $('back'), sheetBtn = $('sheetBtn');
const prev = $('prev'), next = $('next');
const workName = $('workName'), workLine = $('workLine'), rail = $('rail');

let mode = 'sky';
let current = null;
let vi = 0;
let orbit = null;
let fromView = 'sky';

function isNarrow(){ return window.matchMedia('(max-width:720px)').matches }

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
    b.className = 'star';
    b.style.left = w.x + '%';
    b.style.top = w.y + '%';
    b.innerHTML = '<span class="dot"></span><span class="nm ju">' + w.name + '</span>';
    b.addEventListener('click', () => openWork(w.id, 0));
    box.appendChild(b);
  });
}

function buildSheet(){
  const grid = $('grid');
  grid.innerHTML = '';
  $('phd').textContent = WORKS.length + ' works';
  WORKS.forEach(w => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cell';
    if (w.thumb){
      const img = document.createElement('img');
      img.src = w.thumb;
      img.alt = w.name;
      b.appendChild(img);
    } else {
      b.style.background = '#0b0e10';
      b.style.display = 'grid';
      b.style.placeItems = 'center';
      const t = document.createElement('em');
      t.className = 'ju';
      t.style.fontStyle = 'normal';
      t.style.letterSpacing = '.16em';
      t.style.color = '#c9d3d6';
      t.textContent = w.name;
      b.appendChild(t);
    }
    const s = document.createElement('span');
    s.textContent = w.year ? (w.name + '  ' + w.year) : w.name;
    b.appendChild(s);
    b.addEventListener('click', () => openWork(w.id, 0));
    grid.appendChild(b);
  });
}

function show(id){
  [sky, sheet, work].forEach(el => el.classList.toggle('on', el.id === id));
  const onWork = id === 'work';
  back.hidden = !onWork && id === (isNarrow() ? 'sheet' : 'sky');
  if (id === 'sky') { back.hidden = true; }
  if (id === 'sheet' && isNarrow() && !current) back.hidden = true;
  if (id === 'sheet' && current) back.hidden = false;
  sheetBtn.classList.toggle('on', id === 'sheet');
  sheetBtn.setAttribute('aria-pressed', id === 'sheet' ? 'true' : 'false');
}

function setHint(t){ hint.textContent = t; hint.hidden = !t }

function home(){
  stopMedia();
  current = null;
  vi = 0;
  mode = isNarrow() ? 'sheet' : 'sky';
  where.textContent = 'Permanent Impermanence';
  show(mode);
  back.hidden = true;
  setHint(mode === 'sheet' ? '' : 'tap a star');
  history.replaceState(null, '', location.pathname);
}

function openWork(id, index){
  const w = WORKS.find(x => x.id === id);
  if (!w) return;
  fromView = (mode === 'sheet' || isNarrow()) ? 'sheet' : 'sky';
  current = w;
  vi = Math.max(0, Math.min(index, w.versions.length - 1));
  mode = 'work';
  where.textContent = w.name;
  show('work');
  back.hidden = false;
  renderVersion();
  history.replaceState(null, '', '#' + w.id);
}

function kindLabel(kind){
  if (kind === '3d') return '3D';
  if (kind === 'film') return 'film';
  if (kind === 'sound') return 'sound';
  return 'photo';
}

function renderVersion(){
  stopMedia();
  const w = current, v = w.versions[vi], n = w.versions.length;
  workName.textContent = w.name;
  if (w.year){
    workLine.innerHTML = '<span class="yr">' + w.year + '</span>' + (w.line || '');
  } else {
    workLine.textContent = w.line || '';
  }
  cap.textContent = v.cap || '';
  cap.hidden = !v.cap;
  count.textContent = n > 1 ? (vi + 1) + ' of ' + n : '';
  prev.hidden = next.hidden = n <= 1;
  const kinds = [];
  w.versions.forEach((ver, i) => {
    const label = kindLabel(ver.kind);
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
  rail.innerHTML = '';
  if (n > 1){
    rail.hidden = false;
    w.versions.forEach((ver, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = (i === vi ? 'on' : '') + (ver.kind === 'film' ? ' film' : '');
      b.setAttribute('aria-label', kindLabel(ver.kind) + ' ' + (i + 1));
      const img = document.createElement('img');
      img.alt = '';
      img.src = ver.poster || (ver.kind === 'photo' ? ver.src : (w.thumb || ''));
      if (ver.kind === '3d' || ver.kind === 'sound'){
        img.remove();
        b.style.display = 'grid';
        b.style.placeItems = 'center';
        b.style.fontSize = '9px';
        b.style.letterSpacing = '.1em';
        b.textContent = kindLabel(ver.kind);
      } else {
        b.appendChild(img);
      }
      b.addEventListener('click', () => { vi = i; renderVersion(); });
      rail.appendChild(b);
    });
    const onBtn = rail.querySelector('button.on');
    if (onBtn) onBtn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  } else {
    rail.hidden = true;
  }
  setHint('');
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
    vid.setAttribute('playsinline', '');
    vid.preload = 'metadata';
    vid.setAttribute('aria-label', w.name);
    if (v.poster) vid.poster = v.poster;
    vid.src = v.src;
    stage.appendChild(vid);
  } else if (v.kind === 'sound'){
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = v.src;
    stage.appendChild(audio);
  } else if (v.kind === '3d'){
    const canvas = document.createElement('canvas');
    canvas.id = 'orbit';
    stage.appendChild(canvas);
    startOrbit(canvas, v.src);
  }
}

function stopMedia(){
  stage.querySelectorAll('video,audio').forEach(el => { el.pause(); el.removeAttribute('src'); el.load(); });
  if (orbit){ orbit.stop(); orbit = null; }
}

function startOrbit(canvas, src){
  let stop = false;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x04070b, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 20);
  camera.position.set(0.16, 0.1, 0.22);
  camera.lookAt(0, 0.03, 0);
  scene.add(new THREE.AmbientLight(0xcfd8e0, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(0.4, 0.6, 0.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa8c0d0, 0.35);
  fill.position.set(-0.5, 0.2, -0.2);
  scene.add(fill);

  let ang = 0.6, tilt = 0.15, dist = 0.28;
  let drag = false, lx = 0, ly = 0;

  function size(){
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || 400;
    canvas.width = Math.floor(w * Math.min(devicePixelRatio, 2));
    canvas.height = Math.floor(h * Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  size();
  const ro = new ResizeObserver(size);
  ro.observe(canvas);

  function placeCam(){
    camera.position.set(Math.cos(ang) * dist, 0.08 + tilt * 0.2, Math.sin(ang) * dist);
    camera.lookAt(0, 0.03, 0);
  }
  placeCam();

  function onPtr(e){
    if (!drag) return;
    const x = e.clientX, y = e.clientY;
    ang -= (x - lx) * 0.008;
    tilt = Math.max(-1, Math.min(1, tilt + (y - ly) * 0.008));
    lx = x; ly = y;
    placeCam();
  }
  canvas.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', onPtr);
  canvas.addEventListener('pointerup', () => { drag = false; });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    dist = Math.max(0.16, Math.min(0.5, dist + e.deltaY * 0.0004));
    placeCam();
  }, { passive: false });

  loadCup(THREE, new URL('../' + src, import.meta.url)).then(mesh => {
    if (stop) return;
    mesh.scale.setScalar(1.4);
    scene.add(mesh);
  }).catch(() => {
    if (!stop) cap.textContent = 'The 3D model could not be opened in this browser.';
  });

  function loop(){
    if (stop) return;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  orbit = { stop(){ stop = true; ro.disconnect(); renderer.dispose(); } };
}

function goList(){
  stopMedia();
  current = null;
  mode = (fromView === 'sheet' || isNarrow()) ? 'sheet' : 'sky';
  where.textContent = 'Permanent Impermanence';
  show(mode);
  back.hidden = true;
  setHint(mode === 'sheet' ? '' : 'tap a star');
  history.replaceState(null, '', location.pathname);
}
back.addEventListener('click', () => {
  if (mode === 'work' || mode === 'sheet') goList();
  else home();
});

sheetBtn.addEventListener('click', () => {
  if (mode === 'work') stopMedia();
  if (mode === 'sheet'){
    if (isNarrow()) return;
    home();
    return;
  }
  mode = 'sheet';
  current = null;
  where.textContent = 'Permanent Impermanence';
  show('sheet');
  back.hidden = isNarrow();
  setHint('');
});

function step(dir){
  if (!current || current.versions.length <= 1) return;
  vi = (vi + dir + current.versions.length) % current.versions.length;
  renderVersion();
}
prev.addEventListener('click', () => step(-1));
next.addEventListener('click', () => step(1));
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') back.click();
  if (mode !== 'work') return;
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

let swipeX = null, swipeY = null;
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('video,audio,canvas,button')) return;
  swipeX = e.clientX; swipeY = e.clientY;
});
stage.addEventListener('pointerup', e => {
  if (swipeX == null) return;
  const dx = e.clientX - swipeX, dy = e.clientY - swipeY;
  swipeX = swipeY = null;
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
  step(dx < 0 ? 1 : -1);
});

function layout(){
  document.body.classList.toggle('narrow', isNarrow());
  if (mode === 'sky' && isNarrow()) { mode = 'sheet'; show('sheet'); setHint(''); back.hidden = true; }
}

starfield();
buildSky();
buildSheet();
layout();
window.addEventListener('resize', layout);

function applyHash(){
  const hash = location.hash.replace('#','');
  if (hash && WORKS.some(w => w.id === hash)) openWork(hash, 0);
  else home();
}
window.addEventListener('hashchange', applyHash);
applyHash();
