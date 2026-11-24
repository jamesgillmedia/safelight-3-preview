/* CKS work examples. Photo lab look (publish-safelight/photo-lab).
   One star per work. A work with more than one existing version shows each one.
   Photo, 3D, film and sound each use a simple, native display. */
import * as THREE from 'three';
import { loadCup } from './cup.js';

const WORKS = [
  {
    id: 'paddle',
    name: 'carved paddle',
    x: 18, y: 28,
    thumb: 'media/stills/01-paddle-blade-grain-2023.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/01-paddle-blade-grain-2023.jpg',
        cap: 'A carved paddle. 2023. Wood, photograph. Close on the blade, the grain and the carved hollow catching the light.' }
    ]
  },
  {
    id: 'cup',
    name: 'ceramic cup',
    x: 40, y: 22,
    thumb: 'media/stills/02-speckled-cup-2024.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/02-speckled-cup-2024.jpg',
        cap: 'A ceramic cup. 2024. Photograph. A small cup of coffee on a wooden board, the glaze catching the light.' },
      { kind: '3d', src: 'media/3d/joio-cup.glb',
        cap: 'The same ceramic cup, as a 3D model. Drag to turn it.' }
    ]
  },
  {
    id: 'rim',
    name: 'bowl rim',
    x: 62, y: 30,
    thumb: 'media/stills/03-crescent-rim.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/03-crescent-rim.jpg',
        cap: 'The rim of a bowl. Photograph. A thin crescent of light along the edge, like a moon.' }
    ]
  },
  {
    id: 'scoop',
    name: 'wooden scoop',
    x: 82, y: 24,
    thumb: 'media/stills/04-scoop-hanging-slat-light.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/04-scoop-hanging-slat-light.jpg',
        cap: 'A wooden scoop. Photograph. Held in slat-window light, its shadow falling across the slats.' }
    ]
  },
  {
    id: 'sculpture',
    name: 'hanging sculpture',
    x: 16, y: 52,
    thumb: 'media/stills/05-hanging-sculpture-bw.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/05-hanging-sculpture-bw.jpg',
        cap: 'A hanging sculpture. Photograph. The piece on a plain wall, a branch curving down.' }
    ]
  },
  {
    id: 'moss',
    name: 'moss vessel',
    x: 36, y: 50,
    thumb: 'media/stills/06-moss-vessel.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/06-moss-vessel.jpg',
        cap: 'Moss and pinecones in a small vessel. Photograph. Window light throws the plant\'s shadow on the wall.' }
    ]
  },
  {
    id: 'canopy',
    name: 'forest canopy',
    x: 58, y: 56,
    thumb: 'media/stills/07-forest-canopy.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/07-forest-canopy.jpg',
        cap: 'Forest canopy in mist. Photograph. Looking straight up, light falling through the fog.' }
    ]
  },
  {
    id: 'rosebuds',
    name: 'rosebuds',
    x: 80, y: 50,
    thumb: 'media/stills/08-rosebuds-photograph.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/08-rosebuds-photograph.jpg',
        cap: 'Rosebuds. Photograph. Two buds in a bar of window light, their shadows on the wall.' }
    ]
  },
  {
    id: 'spirit-eye',
    name: 'Spirit Eye of skwácháýs',
    x: 22, y: 78,
    thumb: 'media/stills/09-spirit-eye-from-above-2025.jpg',
    versions: [
      { kind: 'photo', src: 'media/stills/09-spirit-eye-from-above-2025.jpg',
        cap: 'Spirit Eye of skwácháýs, the whole work from above. 2025. Public art concept, with Joshua Ngenda, BIDC Public Art Intensive, Vancouver. A giant lens floating on the water in a ring, like a Salish spindle whorl, with the glass at the centre.' },
      { kind: 'photo', src: 'media/stills/10-spirit-eye-section-2025.jpg',
        cap: 'Spirit Eye of skwácháýs, a cross-section. 2025. Public art concept, with Joshua Ngenda, BIDC Public Art Intensive, Vancouver. The lens sits on the surface and a column carries its light down to a forest garden underground.' }
    ]
  },
  {
    id: 'owtd',
    name: 'One With the Devil',
    x: 48, y: 74,
    thumb: 'media/posters/owtd.jpg',
    versions: [
      { kind: 'film', src: 'media/av/AV1-one-with-the-devil-excerpt-cinematography.mp4', poster: 'media/posters/owtd.jpg',
        cap: 'One With the Devil. Short drama. Cinematography. A 1 minute 52 second excerpt from the opening. I was the cinematographer. Director Drew Pollins.' }
    ]
  },
  {
    id: 'lost-in-time',
    name: 'Lost in Time',
    x: 70, y: 80,
    thumb: '',
    versions: [
      { kind: 'sound', src: 'media/av/AV2-lost-coffee-lost-in-time.wav',
        cap: 'Lost in Time. Lost Coffee. Sound. The full track, 3 minutes 36 seconds.' }
    ]
  },
  {
    id: 'colour-field',
    name: 'untitled colour work',
    x: 88, y: 70,
    thumb: 'media/posters/colour-field.jpg',
    versions: [
      { kind: 'film', src: 'media/av/AV3-untitled-colour-field.mov', poster: 'media/posters/colour-field.jpg',
        cap: 'Untitled colour work. 2022. Moving image, 8 seconds.' }
    ]
  }
];

const $ = id => document.getElementById(id);
const sky = $('sky'), sheet = $('sheet'), work = $('work');
const stage = $('stage'), cap = $('cap'), count = $('count');
const types = $('types'), hint = $('hint'), where = $('where');
const back = $('back'), sheetBtn = $('sheetBtn');
const prev = $('prev'), next = $('next');

let mode = 'sky'; // sky | sheet | work
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
    s.textContent = w.name;
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
  setHint(mode === 'sheet' ? 'tap a work' : 'tap a star');
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

function renderVersion(){
  stopMedia();
  const w = current, v = w.versions[vi], n = w.versions.length;
  cap.textContent = v.cap;
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
  setHint(mode === 'sheet' ? 'tap a work' : 'tap a star');
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
  if (mode === 'sheet' && !isNarrow() && !sheetBtn.classList.contains('on') && !current){
    // stay on sheet if they opened it; only auto-switch from sky
  }
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
