/* The turn viewer inside Photolab: a work you can turn without leaving the page.
   model(): a real 3D model (the joio cup, media/3d/joio-cup.glb) on the room's dark ground. Drag to turn, pinch or wheel for distance.
            It turns slowly by itself until it is touched, then again after a few seconds alone (speed: window.GJ_TURN, 0 = still).
   photos(): no model exists for the piece (the scoop), so its own photographs from several sides cross-fade as you drag. Nothing is invented.
   Both return { stop() }. Motion is the same with Reduce Motion on. */
const THREE_URL = new URL('../vendor/three.module.min.js', import.meta.url).href;
async function glbBuffer(url) {
  const r = await fetch(url); if (!r.ok) throw new Error('model ' + r.status);
  if (/\.json(\?|$)/.test(url)) { const j = await r.json(), bin = atob(j.b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer }
  return r.arrayBuffer();
}
/* same parser as js/cup.js (one primitive, POSITION + TEXCOORD_0, JPEG base colour), taking a buffer */
async function meshFrom(THREE, buf) {
  const dv = new DataView(buf); if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('not a glb');
  const jl = dv.getUint32(12, true), J = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
  const bin = 20 + jl + 8, V = i => { const v = J.bufferViews[i]; return [bin + (v.byteOffset || 0), v.byteLength] };
  const A = J.accessors, P = J.meshes[0].primitives[0];
  const arr = (a, T, n) => { const [o, l] = V(a.bufferView); return new T(buf.slice(o, o + l), 0, a.count * n) };
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr(A[P.attributes.POSITION], Float32Array, 3), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(arr(A[P.attributes.TEXCOORD_0], Float32Array, 2), 2));
  g.setIndex(new THREE.BufferAttribute(arr(A[P.indices], A[P.indices].componentType === 5123 ? Uint16Array : Uint32Array, 1), 1));
  g.computeVertexNormals();
  const [io, il] = V(J.images[0].bufferView);
  const bmp = await createImageBitmap(new Blob([new Uint8Array(buf, io, il)], { type: J.images[0].mimeType }));
  const tex = new THREE.Texture(bmp); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: .82, metalness: 0 }));
}
export async function model(stage, src, onState) {
  const canvas = document.createElement('canvas'); canvas.className = 'turn-cv'; canvas.setAttribute('aria-label', 'the work as a 3D model, drag to turn it'); stage.appendChild(canvas);
  let dead = false, raf = 0, ro = null, renderer = null;
  const api = { stop() { dead = true; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (renderer) { renderer.dispose(); try { renderer.forceContextLoss() } catch (e) {} } canvas.remove() } };
  try {
    const THREE = await import(THREE_URL); if (dead) return api;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .01, 20);
    scene.add(new THREE.AmbientLight(0xcfd8e0, .6));
    const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(.4, .6, .5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c0d0, .4); fill.position.set(-.5, .2, -.2); scene.add(fill);
    let ang = .6, tilt = .28, dist = .3, idleAt = 0;
    const place = () => { camera.position.set(Math.cos(ang) * dist, .03 + tilt * .22, Math.sin(ang) * dist); camera.lookAt(0, .03, 0) };
    const size = () => { const w = canvas.clientWidth || 300, h = canvas.clientHeight || 300; renderer.setSize(w, h, false); camera.aspect = w / Math.max(h, 1); camera.updateProjectionMatrix(); dist = Math.max(.24, Math.min(.5, dist)); if (camera.aspect < .8) dist = Math.max(dist, .36); place() };
    size(); ro = new ResizeObserver(size); ro.observe(canvas);
    const PT = new Map(); let pd = 0;
    const touch = () => { idleAt = performance.now() + 3500 };
    canvas.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { canvas.setPointerCapture(e.pointerId) } catch (x) {} PT.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (PT.size === 2) { const a = [...PT.values()]; pd = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) } touch() });
    canvas.addEventListener('pointermove', e => { const p = PT.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (PT.size >= 2) { const a = [...PT.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); if (pd > 0 && d > 0) dist = Math.max(.2, Math.min(.6, dist * pd / d)); pd = d }
      else { ang += dx * .008; tilt = Math.max(-.6, Math.min(1.6, tilt + dy * .006)) } touch(); place() });
    const up = e => { PT.delete(e.pointerId); pd = 0; e.stopPropagation() }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', e => { e.preventDefault(); dist = Math.max(.2, Math.min(.6, dist + e.deltaY * .0004)); touch(); place() }, { passive: false });
    ['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => canvas.addEventListener(t, e => e.preventDefault(), { passive: false }));
    const mesh = await meshFrom(THREE, await glbBuffer(src)); if (dead) return api;
    mesh.scale.setScalar(1.4); scene.add(mesh); if (onState) onState('ready');
    let last = performance.now();
    const loop = now => { if (dead) return; raf = requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now;
      const sp = window.GJ_TURN == null ? 1 : +window.GJ_TURN; if (!PT.size && now > idleAt && sp > 0) { ang += dt * .22 * sp; place() }
      api.ang = ang; renderer.render(scene, camera) };
    raf = requestAnimationFrame(loop);
  } catch (e) { console.warn(e); if (!dead && onState) onState('failed') }
  return api;
}
export function photos(stage, frames, alt) {
  const box = document.createElement('div'); box.className = 'turn-ph'; box.setAttribute('aria-label', (alt || 'the work') + ' from ' + frames.length + ' sides, drag to turn it'); box.tabIndex = 0;
  const ims = frames.map((f, i) => { const im = document.createElement('img'); im.src = f; im.alt = i ? '' : (alt || ''); im.draggable = false; box.appendChild(im); return im });
  const dots = document.createElement('div'); dots.className = 'turn-dots'; frames.forEach(() => dots.appendChild(document.createElement('i'))); box.appendChild(dots); stage.appendChild(box);
  const n = frames.length; let pos = 0, target = 0, drag = null, raf = 0, dead = false;
  const mod = a => ((a % n) + n) % n;
  function paint() { const a = Math.floor(pos), f = pos - a; ims.forEach((im, i) => { im.style.opacity = i === mod(a) ? (1 - f) : i === mod(a + 1) ? f : 0 }); [...dots.children].forEach((d, i) => d.classList.toggle('on', i === mod(Math.round(pos)))) }
  function loop() { if (dead) return; raf = requestAnimationFrame(loop); if (!drag && Math.abs(target - pos) > .001) { pos += (target - pos) * .16; if (Math.abs(target - pos) <= .001) pos = target; paint() } }
  box.addEventListener('pointerdown', e => { e.stopPropagation(); try { box.setPointerCapture(e.pointerId) } catch (x) {} drag = { x: e.clientX, p: pos, moved: 0 } });
  box.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; drag.moved = Math.max(drag.moved, Math.abs(dx)); pos = drag.p - dx / Math.max(160, box.clientWidth * .45); paint() });
  const up = e => { if (!drag) return; e.stopPropagation(); const d = drag; drag = null; target = d.moved < 6 ? Math.round(d.p) + 1 : Math.round(pos) }; box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { target = Math.round(target) + 1; e.stopPropagation() } else if (e.key === 'ArrowLeft') { target = Math.round(target) - 1; e.stopPropagation() } });
  paint(); raf = requestAnimationFrame(loop);
  return { stop() { dead = true; cancelAnimationFrame(raf); box.remove() }, get pos() { return pos }, go(d) { target = Math.round(target) + d } };
}
