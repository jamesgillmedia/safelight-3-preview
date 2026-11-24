import * as THREE from '../../vendor/three.module.min.js';
import { loadCup } from '../../js/cup.js';

const canvas = document.getElementById('orbit');
const cap = document.getElementById('cap');

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
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
}
size();
new ResizeObserver(size).observe(canvas);

function placeCam(){
  camera.position.set(Math.cos(ang) * dist, 0.08 + tilt * 0.2, Math.sin(ang) * dist);
  camera.lookAt(0, 0.03, 0);
}
placeCam();

canvas.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  ang -= (e.clientX - lx) * 0.008;
  tilt = Math.max(-1, Math.min(1, tilt + (e.clientY - ly) * 0.008));
  lx = e.clientX; ly = e.clientY;
  placeCam();
});
canvas.addEventListener('pointerup', () => { drag = false; });
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  dist = Math.max(0.16, Math.min(0.5, dist + e.deltaY * 0.0004));
  placeCam();
}, { passive: false });

loadCup(THREE, new URL('../../media/3d/joio-cup.glb', import.meta.url)).then(mesh => {
  mesh.scale.setScalar(1.4);
  scene.add(mesh);
}).catch(() => { cap.textContent = 'The 3D model could not be opened in this browser.'; });

function loop(){ renderer.render(scene, camera); requestAnimationFrame(loop); }
loop();
