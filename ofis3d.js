/* =====================================================================
   Bytetown – 3D ofis sahnesi (three.js)
   Odalar, masalar, eşyalar ve masada çalışan karakterler gerçek 3D olarak
   çizilir. Oyun mantığı (S, seatLayout, looksOf…) diğer betiklerden gelir.
   3D açılamazsa eski SVG sahne çalışmaya devam eder.
   ===================================================================== */
import * as THREE from './lib/three.module.js';

const U = 0.85;            // 1 oda karesi = 0.85 m
const WALL_H = 2.55;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UPV = V(0, 1, 0);

/* ---------- çizim motoru ---------- */
let renderer, scene3, camera, sceneEl, canvas, fxLayer, roomG, sun;
let chars = new Map();      // id → karakter kaydı
let animated = [];          // her karede güncellenen ek nesneler (robot süpürge)
const screenAnims = [];      // ekranlarda kayan kod dokuları
let view = {cx:0, cy:0, hw:1, hh:1};   // odaya sığdırılmış kamera görüşü
let zoom3 = 1, pan3 = [0, 0], drag3 = null, needFit = true, lastW = 0, lastH = 0, lastDpr = 0;
const clock = new THREE.Clock();
let frameN = 0;

/* ---------- malzemeler: yumuşak çizgi-film gölgelendirme + dış çizgi ---------- */
const grad = new THREE.DataTexture(new Uint8Array([120,120,120,255, 168,168,168,255, 205,205,205,255, 235,235,235,255, 255,255,255,255]), 5, 1, THREE.RGBAFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const matCache = new Map();
function M(color, extra){
  const key = extra ? null : (typeof color === 'string' ? color : '#' + new THREE.Color(color).getHexString());
  if (key && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial(Object.assign({color, gradientMap:grad}, extra||{}));
  if (key) matCache.set(key, m);
  return m;
}
const OUTLINE = new THREE.MeshBasicMaterial({color:0x37323f, side:THREE.BackSide});
const HIDDEN = new THREE.MeshBasicMaterial({visible:false});
function mesh(geo, mat, o){
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = !(o && o.noShadow); m.receiveShadow = true;
  if (o && o.outline){ const ol = new THREE.Mesh(geo, OUTLINE); ol.scale.setScalar(1 + o.outline*0.6);ol.castShadow = false; ol.receiveShadow = false; m.add(ol); }
  return m;
}
/* paylaşılan geometriler (bellek ve hız için) */
const G = {
  sph: new THREE.SphereGeometry(1, 14, 10),
  sphLo: new THREE.SphereGeometry(1, 12, 8),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 14),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 10),
  box: new THREE.BoxGeometry(1, 1, 1),
  cone: new THREE.ConeGeometry(1, 1, 10),
  torus: new THREE.TorusGeometry(1, 0.28, 6, 16),
};
const capCache = new Map();
function capsule(r){ const k = r.toFixed(3); if (!capCache.has(k)) capCache.set(k, new THREE.CapsuleGeometry(r, 1, 3, 10)); return capCache.get(k); }
const rboxCache = new Map();
function roundBoxGeo(w, h, d, r){
  const k = [w,h,d,r].map(n=>n.toFixed(3)).join(',');
  if (rboxCache.has(k)) return rboxCache.get(k);
  const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3), p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
  const hx = Math.max(0.0001, w/2-r), hy = Math.max(0.0001, h/2-r), hz = Math.max(0.0001, d/2-r);
  for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.set(THREE.MathUtils.clamp(v.x,-hx,hx), THREE.MathUtils.clamp(v.y,-hy,hy), THREE.MathUtils.clamp(v.z,-hz,hz));
    const n = v.clone().sub(c); if (n.lengthSq() > 0){ n.setLength(r); v.copy(c).add(n); } p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); rboxCache.set(k, g); return g;
}
// basit kalıplar: konumu ve boyutu verilen parça
function part(geo, mat, sx, sy, sz, x, y, z, o){ const m = mesh(geo, mat, o); m.scale.set(sx, sy, sz); m.position.set(x, y, z); return m; }
const boxP = (w,h,d,mat,x,y,z,o) => part(G.box, mat, w, h, d, x, y, z, o);
const rbox = (w,h,d,r,mat,x,y,z,o) => { const m = mesh(roundBoxGeo(w,h,d,r), mat, o); m.position.set(x,y,z); return m; };
const cylP = (r,h,mat,x,y,z,o) => part(G.cyl, mat, r, h, r, x, y, z, o);
const sphP = (rx,ry,rz,mat,x,y,z,o) => part(G.sph, mat, rx, ry, rz, x, y, z, o);

/* ---------- dokular (canvas) ---------- */
function canvasTex(w, h, draw, rep){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
const texCache = new Map();
function cachedTex(key, make){ if (!texCache.has(key)) texCache.set(key, make()); return texCache.get(key); }
function noise(g, w, h, n, light, dark){
  for (let i=0;i<n;i++){ const s = Math.random()*2.2; g.fillStyle = `rgba(${Math.random()<.5?light:dark},${Math.random()*.12})`; g.fillRect(Math.random()*w, Math.random()*h, s, s); }
}
const SCREEN_COLS = {prog:['#7dd3fc','#c4b5fd','#fda4af','#86efac','#fde68a'], tas:['#f9a8d4','#93c5fd','#fde68a','#c4b5fd','#fdba74'], test:['#86efac','#fca5a5','#fde68a','#e2e8f0'], arge:['#c4b5fd','#a5b4fc','#f0abfc','#e9d5ff'], me:['#7dd3fc','#c4b5fd','#fda4af','#86efac','#fde68a']};
function screenMat(role, k){
  const key = 'scr'+role+k;
  if (matCache.has(key)) return matCache.get(key);
  const cols = SCREEN_COLS[role] || SCREEN_COLS.prog;
  const tex = canvasTex(128, 256, (g,w,h) => {
    g.fillStyle = role==='test' ? '#1d1a2e' : role==='arge' ? '#1a1446' : '#141a33'; g.fillRect(0,0,w,h);
    let r = 17 + k*53;
    for (let y=8; y<h; y+=9){ let x = 6 + ((r = (r*9301+49297)%233280) % 4)*7;
      const n = 1 + r % 4; for (let i=0;i<n;i++){ const len = 8 + ((r = (r*9301+49297)%233280) % 34); g.fillStyle = cols[r % cols.length]; g.fillRect(x, y, len, 3.4); x += len + 4; if (x > w-10) break; } }
    if (role==='arge'){ g.strokeStyle = '#f0abfc'; g.lineWidth = 3; g.beginPath(); for (let i=0;i<8;i++) g.lineTo(10+i*15, 200 - Math.sin(i)*20 - i*8); g.stroke(); }
  }, [1, 1]);
  tex.repeat.set(1, 0.55);
  const m = new THREE.MeshBasicMaterial({map:tex});
  matCache.set(key, m);
  screenAnims.push({tex, speed: 0.025 + (k%3)*0.008});
  return m;
}
const SCREEN_OFF = new THREE.MeshBasicMaterial({color:0x2b2840});
function textTex(text, opt){
  opt = Object.assign({w:512, h:96, font:'900 52px Nunito, system-ui, sans-serif', color:'#fff', bg:null, r:18}, opt||{});
  return canvasTex(opt.w, opt.h, (g,w,h) => {
    if (opt.bg){ g.fillStyle = opt.bg; g.beginPath(); g.roundRect(4,4,w-8,h-8,opt.r); g.fill(); }
    g.font = opt.font; g.fillStyle = opt.color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w/2, h/2+2);
  });
}
function emojiSprite(emoji, size){
  const tex = cachedTex('emo'+emoji, () => canvasTex(128, 128, (g,w,h) => { g.font = '96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, w/2, h/2+6); }));
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:tex, depthTest:false}));
  s.scale.set(size, size, 1); s.renderOrder = 10;
  return s;
}
function signSprite(emoji){
  const tex = cachedTex('sign'+emoji, () => canvasTex(160, 150, (g,w,h) => {
    g.fillStyle = '#ffffff'; g.strokeStyle = '#b7c8ff'; g.lineWidth = 5; g.beginPath(); g.roundRect(14,10,w-28,104,40); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(w/2-16,112); g.lineTo(w/2,140); g.lineTo(w/2+16,112); g.fill();
    g.font = '70px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, w/2, 66); }));
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map:tex, depthTest:false})); s.scale.set(0.42, 0.39, 1); s.renderOrder = 10; return s;
}

/* ---------- birleştirme: hareketsiz parçaları tek çizime indir (telefonda hız) ---------- */
// renkleri köşe rengi olarak taşıyan ortak malzeme: aynı gruptaki düz renkli parçalar tek çizimde biter
const VC_MAT = new THREE.MeshToonMaterial({color:0xffffff, vertexColors:true, gradientMap:grad});
function mergeInto(root, skip){
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map(), victims = [];
  (function walk(o){
    for (const c of o.children.slice()){
      if (c.userData.dyn || (skip && skip(c))) continue;
      if (c.isMesh && c.material.visible !== false){
        const mt = c.material, vc = mt.isMeshToonMaterial && !mt.map && !mt.transparent && mt.side === THREE.FrontSide;
        const key = vc ? VC_MAT : mt;
        let b = buckets.get(key); if (!b){ b = {geos:[], cast:false, recv:false, vc}; buckets.set(key, b); }
        let g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld));
        if (vc){ const n = g.attributes.position.count, col = new Float32Array(n*3), k = mt.color; for (let i=0;i<n;i++){ col[i*3] = k.r; col[i*3+1] = k.g; col[i*3+2] = k.b; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
        b.geos.push(g); b.cast = b.cast || c.castShadow; b.recv = b.recv || c.receiveShadow;
        victims.push(c);
      }
      walk(c);
    }
  })(root);
  for (const c of victims) if (c.parent) c.parent.remove(c);
  for (const [mat, b] of buckets){
    let n = 0; for (const g of b.geos) n += g.attributes.position.count;
    const pos = new Float32Array(n*3), nor = new Float32Array(n*3), uv = new Float32Array(n*2), col = b.vc ? new Float32Array(n*3) : null;
    let o = 0;
    for (const g of b.geos){
      pos.set(g.attributes.position.array, o*3);
      if (g.attributes.normal) nor.set(g.attributes.normal.array, o*3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o*2);
      if (col) col.set(g.attributes.color.array, o*3);
      o += g.attributes.position.count; g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mat); m.castShadow = b.cast; m.receiveShadow = b.recv; m.userData.merged = true;
    root.add(m);
  }
}
/* =====================================================================
   KARAKTER – yerel uzayda -Z yönüne bakar, koltuk orijinde
   ===================================================================== */
const SHOES = ['#1b1830','#f8fafc','#7c2d12','#334155','#0f172a'];
const PANTS = ['#2b3a67','#3d3a52','#5b4636','#1f2937','#4a5a85','#6b7280'];
function placeLimb(m, a, b){ const d = b.clone().sub(a), len = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UPV, d.divideScalar(len || 1)); m.scale.set(1, Math.max(0.02, len), 1); }
function makeHand(skin, skinD, side, crowd){
  const h = new THREE.Group();
  h.add(part(G.sph, skin, 0.042, 0.024, 0.052, 0, 0, 0, {outline:.12}));                       // avuç
  if (!crowd) for (let i=0;i<4;i++){ const f = mesh(capsule(0.0105), skin); f.scale.set(1, 0.034, 1); f.rotation.x = Math.PI/2 - 0.35; f.position.set(-0.027 + i*0.018, -0.006, -0.058); h.add(f); }  // parmaklar
  const th = mesh(capsule(0.012), skin); th.scale.set(1, 0.03, 1); th.rotation.set(Math.PI/2, 0, side*0.9); th.position.set(side*0.04, -0.004, -0.02); h.add(th);   // başparmak
  h.add(part(G.sph, skinD, 0.038, 0.01, 0.04, 0, 0.016, 0.004));                               // el sırtı gölgesi
  mergeInto(h);
  return h;
}
// koltuk seviyeleri: 0 plastik sandalye, 1 basit ofis koltuğu, 2 ergonomik file, 3 oyuncu koltuğu, 4 deri yönetici
function chairTier(){ return (typeof S!=='undefined' && S && S.eq) ? S.eq.koltuk : 1; }
function buildChair(g, tier){
  if (tier === undefined) tier = chairTier();
  const metal = M('#9aa0b0'), wheel = M('#1f2230');
  const star = (col) => { for (let i=0;i<5;i++){ const a = i/5*Math.PI*2 + 0.3;
      const leg = boxP(0.3, 0.03, 0.045, col, Math.cos(a)*0.15, 0.06, Math.sin(a)*0.15); leg.rotation.y = -a; g.add(leg);
      g.add(sphP(0.03, 0.03, 0.03, wheel, Math.cos(a)*0.3, 0.03, Math.sin(a)*0.3)); }
    g.add(cylP(0.024, 0.36, metal, 0, 0.24, 0)); };
  if (tier <= 0){
    // plastik sandalye: dört bacak, tek parça oturak ve sırt
    const pl = M('#cbd5e1'), pd = M('#94a3b8');
    for (const [x,z] of [[-0.19,-0.18],[0.19,-0.18],[-0.19,0.18],[0.19,0.18]]) g.add(boxP(0.035, 0.44, 0.035, pd, x, 0.22, z));
    g.add(rbox(0.46, 0.05, 0.44, 0.03, pl, 0, 0.46, 0, {outline:.03}));
    const back = rbox(0.44, 0.3, 0.04, 0.04, pl, 0, 0.73, 0.21, {outline:.03}); back.rotation.x = 0.12; g.add(back);
    for (const s of [-1,1]) g.add(boxP(0.03, 0.3, 0.03, pd, s*0.19, 0.6, 0.2));
  } else if (tier === 1){
    const c = M('#7a7f8e'), cd = M('#535866');
    star(cd);
    g.add(rbox(0.48, 0.075, 0.46, 0.03, c, 0, 0.45, 0, {outline:.03}));
    const back = rbox(0.44, 0.34, 0.06, 0.03, c, 0, 0.77, 0.22, {outline:.03}); back.rotation.x = 0.1; g.add(back);
    g.add(boxP(0.05, 0.28, 0.04, cd, 0, 0.55, 0.22));
    for (const s of [-1,1]){ g.add(rbox(0.055, 0.03, 0.26, 0.012, cd, s*0.26, 0.66, -0.02, {outline:.04})); g.add(boxP(0.03, 0.18, 0.03, cd, s*0.26, 0.56, 0.06)); }
  } else if (tier === 2){
    // ergonomik file koltuk: siyah çerçeve, file sırt, baş desteği, bel desteği
    const c = M('#1f2937'), cd = M('#111827'), meshM = M('#374151');
    star(cd);
    g.add(rbox(0.5, 0.08, 0.48, 0.035, c, 0, 0.45, 0, {outline:.03}));
    const back = rbox(0.46, 0.46, 0.05, 0.05, meshM, 0, 0.84, 0.23, {outline:.03}); back.rotation.x = 0.1; g.add(back);
    const frame = rbox(0.5, 0.05, 0.07, 0.025, c, 0, 1.07, 0.25); frame.rotation.x = 0.1; g.add(frame);
    const head = rbox(0.28, 0.12, 0.06, 0.04, c, 0, 1.19, 0.27, {outline:.04}); head.rotation.x = 0.1; g.add(head);
    g.add(boxP(0.05, 0.36, 0.04, cd, 0, 0.6, 0.24));
    g.add(rbox(0.34, 0.06, 0.05, 0.02, M('#2f54eb'), 0, 0.68, 0.2));     // bel desteği
    for (const s of [-1,1]){ g.add(rbox(0.06, 0.03, 0.28, 0.012, c, s*0.27, 0.67, -0.02, {outline:.04})); g.add(boxP(0.03, 0.19, 0.03, cd, s*0.27, 0.56, 0.06)); }
  } else if (tier === 3){
    // oyuncu koltuğu: yüksek yarış sırtı, yan kanatlar, kırmızı şeritler
    const c = M('#1f2230'), red = M('#ef4444'), cd = M('#111827');
    star(cd);
    g.add(rbox(0.52, 0.1, 0.5, 0.04, c, 0, 0.46, 0, {outline:.03}));
    for (const s of [-1,1]) g.add(rbox(0.08, 0.12, 0.46, 0.04, red, s*0.24, 0.5, 0));
    const back = rbox(0.48, 0.72, 0.09, 0.07, c, 0, 0.92, 0.25, {outline:.03}); back.rotation.x = 0.1; g.add(back);
    for (const s of [-1,1]){ const wing = rbox(0.09, 0.42, 0.12, 0.04, red, s*0.23, 0.82, 0.22, {outline:.04}); wing.rotation.x = 0.1; g.add(wing); }
    const pillow = rbox(0.24, 0.11, 0.07, 0.05, red, 0, 1.18, 0.2, {outline:.04}); pillow.rotation.x = 0.1; g.add(pillow);
    const slit = rbox(0.1, 0.06, 0.1, 0.02, M('#0b0b12'), 0, 1.06, 0.26); slit.rotation.x = 0.1; g.add(slit);
    for (const s of [-1,1]){ g.add(rbox(0.07, 0.035, 0.28, 0.015, c, s*0.28, 0.68, -0.02, {outline:.04})); g.add(boxP(0.035, 0.2, 0.035, cd, s*0.28, 0.57, 0.06)); }
  } else {
    // deri yönetici koltuğu: kahverengi deri, kapitone sırt, geniş kolçaklar, altın detay
    const c = M('#7c3f1d'), cl = M('#9a5428'), gold = M('#fbbf24'), cd = M('#3b2314');
    star(M('#374151'));
    g.add(rbox(0.56, 0.12, 0.52, 0.06, c, 0, 0.46, 0, {outline:.03}));
    const back = rbox(0.52, 0.7, 0.12, 0.09, c, 0, 0.9, 0.25, {outline:.03}); back.rotation.x = 0.08; g.add(back);
    for (let r=0;r<3;r++) for (let k=-1;k<=1;k++){ const b = sphP(0.012, 0.012, 0.012, cd, k*0.13, 0.72 + r*0.17, 0.19 - r*0.014); g.add(b); }
    const head = rbox(0.4, 0.14, 0.1, 0.06, cl, 0, 1.22, 0.27, {outline:.03}); head.rotation.x = 0.08; g.add(head);
    for (const s of [-1,1]){ g.add(rbox(0.1, 0.07, 0.34, 0.03, cl, s*0.3, 0.68, -0.02, {outline:.03})); g.add(boxP(0.05, 0.2, 0.05, gold, s*0.3, 0.56, 0.1)); }
  }
}
// klavye seviyeleri: 0 eski bej, 1 ince beyaz, 2 mekanik, 3 RGB, 4 ergonomik bölünmüş (RGB)
const RGB_TEX = (() => { let t = null; return () => t || (t = canvasTex(128, 16, (c,w,h) => { const gr = c.createLinearGradient(0,0,w,0); ['#ef4444','#f59e0b','#facc15','#22c55e','#06b6d4','#3b82f6','#a855f7','#ec4899'].forEach((col,i,a)=>gr.addColorStop(i/(a.length-1), col)); c.fillStyle = gr; c.fillRect(0,0,w,h); for (let x=0;x<w;x+=8){ c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x,0,1,h); } })); })();
function buildKeyboard(g, tier, x, y, z){
  if (tier <= 0){ g.add(rbox(0.48, 0.04, 0.17, 0.01, M('#d6cfc0'), x, y+0.005, z, {outline:.03})); g.add(boxP(0.42, 0.012, 0.11, M('#b8b09e'), x, y+0.03, z)); return; }
  if (tier === 1){ g.add(rbox(0.44, 0.018, 0.14, 0.006, M('#f1f5f9'), x, y, z, {outline:.03})); g.add(boxP(0.4, 0.006, 0.1, M('#cbd5e1'), x, y+0.012, z)); return; }
  if (tier === 2){ g.add(rbox(0.44, 0.03, 0.15, 0.008, M('#1f2937'), x, y, z, {outline:.03})); g.add(boxP(0.4, 0.016, 0.11, M('#4b5563'), x, y+0.02, z));
    g.add(boxP(0.035, 0.018, 0.03, M('#ef4444'), x-0.18, y+0.025, z-0.04)); g.add(boxP(0.06, 0.018, 0.03, M('#2f54eb'), x+0.17, y+0.025, z+0.01)); g.add(boxP(0.2, 0.016, 0.025, M('#9ca3af'), x, y+0.024, z+0.045)); return; }
  const rgb = new THREE.MeshBasicMaterial({map:RGB_TEX()});
  if (tier === 3){ g.add(rbox(0.46, 0.03, 0.16, 0.008, M('#111827'), x, y, z, {outline:.03})); g.add(boxP(0.42, 0.016, 0.12, rgb, x, y+0.02, z)); g.add(boxP(0.46, 0.006, 0.01, rgb, x, y-0.005, z+0.08)); return; }
  for (const s of [-1,1]){ const half = new THREE.Group(); half.position.set(x + s*0.13, y, z); half.rotation.y = -s*0.22;
    half.add(rbox(0.22, 0.03, 0.15, 0.01, M('#111827'), 0, 0, 0, {outline:.04})); half.add(boxP(0.19, 0.016, 0.11, rgb, 0, 0.02, -0.01)); half.add(rbox(0.2, 0.025, 0.05, 0.012, M('#374151'), 0, 0.005, 0.09)); g.add(half); }
}
// bilgisayar seviyeleri: 0 tüplü monitör + bej kasa, 1 tek düz ekran, 2 çift monitör, 3 kavisli ultra geniş, 4 üç monitör + RGB kasa
function buildMonitors(g, tier, dz, scrRole, idx, dw){
  const mat = k => scrRole ? screenMat(scrRole, (idx*3+k)%6) : SCREEN_OFF;
  const stand = (m) => { m.add(boxP(0.05, 0.22, 0.05, M('#4b4f63'), 0, 0.11, 0)); m.add(rbox(0.22, 0.02, 0.15, 0.008, M('#4b4f63'), 0, 0.01, 0)); };
  const panel = (x, ry, k, w=0.6, h=0.37) => { const m = new THREE.Group(); m.position.set(x, 0.765, dz - 0.15); m.rotation.y = ry; stand(m);
    m.add(rbox(w, h, 0.035, 0.012, M('#262a3a'), 0, 0.39, 0, {outline:.02}));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w-0.04, h-0.04), mat(k)); s.position.set(0, 0.39, 0.019); m.add(s); g.add(m); };
  if (tier <= 0){
    const m = new THREE.Group(); m.position.set(0, 0.765, dz - 0.1); g.add(m);
    m.add(rbox(0.46, 0.38, 0.4, 0.03, M('#e8e2d0'), 0, 0.21, -0.04, {outline:.02}));
    m.add(rbox(0.3, 0.28, 0.2, 0.06, M('#d6cfc0'), 0, 0.2, -0.27));
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), mat(0)); s.position.set(0, 0.22, 0.165); m.add(s);
    g.add(rbox(0.18, 0.4, 0.42, 0.015, M('#e8e2d0'), -dw/2+0.16, 0.97, dz - 0.05, {outline:.02}));    // bej kasa masada
    g.add(boxP(0.1, 0.02, 0.01, M('#9ca3af'), -dw/2+0.16, 1.05, dz + 0.17));
    return;
  }
  if (tier === 1){ panel(0, 0, 0); }
  else if (tier === 2){ panel(-0.31, 0.13, 0); panel(0.31, -0.13, 1); }
  else if (tier === 3){
    // kavisli geniş ekran: üç parçalı eğri panel
    const m = new THREE.Group(); m.position.set(0, 0.765, dz - 0.15); stand(m); g.add(m);
    [[-0.34, 0.32, 0],[0, 0, 1],[0.34, -0.32, 2]].forEach(([x, ry, k]) => { const p = new THREE.Group(); p.position.set(x, 0, Math.abs(x)*0.25); p.rotation.y = ry;
      p.add(rbox(0.36, 0.34, 0.035, 0.01, M('#1f2230'), 0, 0.39, 0, {outline:.02})); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.3), mat(k)); s.position.set(0, 0.39, 0.019); p.add(s); m.add(p); });
  } else {
    panel(-0.5, 0.42, 0, 0.5, 0.33); panel(0, 0, 1, 0.6, 0.37); panel(0.5, -0.42, 2, 0.5, 0.33);
  }
  // kasa: masanın altında (3+ RGB ışıklı)
  const cx = -dw/2 + 0.16, tower = new THREE.Group(); tower.position.set(cx, 0, dz - 0.05); g.add(tower);
  tower.add(rbox(0.2, 0.46, 0.42, 0.015, M(tier >= 3 ? '#111827' : '#374151'), 0, 0.23, 0, {outline:.02}));
  if (tier >= 3){ tower.add(boxP(0.005, 0.36, 0.3, new THREE.MeshBasicMaterial({map:RGB_TEX()}), -0.102, 0.25, 0)); tower.add(boxP(0.12, 0.012, 0.005, new THREE.MeshBasicMaterial({color:0x22d3ee}), 0, 0.42, 0.212)); }
  else tower.add(boxP(0.06, 0.012, 0.005, new THREE.MeshBasicMaterial({color:0x34d399}), 0, 0.4, 0.212));
}
// saç modelleri: 0 kısa, 1 uzun, 2 at kuyruğu, 3 topuz, 4 kıvırcık, 5 kazıtılmış
function buildHair(head, L, hairM, hairD, skinM){
  const hs = L.hs || 0;
  const capR = hs===5 ? 0.129 : 0.138;
  const capMat = hs===5 ? M(new THREE.Color(L.hair).lerp(new THREE.Color(L.skin), 0.45).getStyle()) : hairM;
  const cap = mesh(new THREE.SphereGeometry(capR, 26, 18, 0, Math.PI*2, 0, hs===5 ? 1.7 : 1.9), capMat, {outline:.03});
  cap.rotation.x = 0.55; cap.position.set(0, 0.012, 0.01); head.add(cap);
  if (hs===0){
    for (const [x,y,z,rx,rz,s] of [[0,.13,-.06,-.6,0,1],[.06,.12,-.01,-.2,-.6,.85],[-.06,.12,-.01,-.2,.6,.85],[0,.125,.05,.5,0,.95],[.09,.07,.07,.7,-.8,.75],[-.09,.07,.07,.7,.8,.75],[.03,.12,-.1,-1,-.25,.7],[-.035,.115,-.1,-1,.3,.7]]){
      const t = part(G.cone, hairM, 0.034*s, 0.085*s, 0.034*s, x, y, z, {outline:.06}); t.rotation.set(rx, 0, rz); head.add(t); }
  } else if (hs===1){
    const back = rbox(0.25, 0.32, 0.1, 0.05, hairM, 0, -0.1, 0.08, {outline:.03}); back.rotation.x = 0.12; head.add(back);
    for (const s of [-1,1]){ const side = rbox(0.06, 0.24, 0.12, 0.03, hairM, s*0.115, -0.06, -0.01, {outline:.04}); head.add(side); }
    const fringe = sphP(0.12, 0.05, 0.08, hairM, 0, 0.085, -0.075); fringe.rotation.x = -0.4; head.add(fringe);
  } else if (hs===2){
    head.add(sphP(0.035, 0.03, 0.035, M(L.shirt), 0, 0.05, 0.135));
    const tail = mesh(capsule(0.045), hairM, {outline:.05}); tail.scale.set(1, 0.16, 1); tail.position.set(0, -0.04, 0.17); tail.rotation.x = 0.25; head.add(tail);
    const fringe = sphP(0.12, 0.045, 0.08, hairM, 0, 0.09, -0.07); fringe.rotation.x = -0.4; head.add(fringe);
  } else if (hs===3){
    head.add(sphP(0.065, 0.06, 0.065, hairM, 0, 0.14, 0.07, {outline:.05}));
    head.add(part(G.torus, hairD, 0.05, 0.05, 0.05, 0, 0.11, 0.06));
    const fringe = sphP(0.12, 0.045, 0.08, hairM, 0, 0.09, -0.07); fringe.rotation.x = -0.4; head.add(fringe);
  } else if (hs===4){
    for (let i=0;i<26;i++){ const a = i/26*Math.PI*2*3.1, ring = Math.floor(i/9), y = 0.13 - ring*0.07, r = 0.1 + ring*0.03;
      const z = Math.sin(a)*r*0.9 + 0.03; if (z < -0.06 && y < 0.08) continue;
      head.add(sphP(0.05, 0.05, 0.05, i%3 ? hairM : hairD, Math.cos(a)*r, y, z, {outline:.05})); }
    head.add(sphP(0.15, 0.13, 0.15, hairM, 0, 0.06, 0.04));
  }
}
function buildPerson(id, role, L, lead, opts){
  const h = hashN((typeof id==='number' ? id : 7)*131 + 3);
  const P = {id, root:new THREE.Group(), state:0, wantWork:true, t0:(h%1000)/97, mouseCyc:4.6 + (h%5)*0.6};
  const root = P.root;
  const skin = M(L.skin), skinD = M(new THREE.Color(L.skin).multiplyScalar(0.86).getStyle());
  const hairM = M(L.hair), hairD = M(new THREE.Color(L.hair).multiplyScalar(0.7).getStyle());
  const kind = L.kind || 'tee';
  const shirtCol = L.shirt, shirt = M(shirtCol), shirtD = M(new THREE.Color(shirtCol).multiplyScalar(0.78).getStyle());
  const pants = M(PANTS[(h>>5)%PANTS.length]), shoeCol = SHOES[(h>>10)%SHOES.length], shoe = M(shoeCol);
  const sole = M(shoeCol==='#f8fafc' ? '#cbd5e1' : '#f1f5f9');
  const female = L.long || L.hs===2 || L.hs===3;
  const bw = (female ? 0.93 : 1.0) * (0.96 + ((h>>13)%9)*0.012);      // omuz genişliği
  const sleeveLong = kind !== 'tee';
  P.look = {skin, skinD, pants, shoe, sole, shirt, bw, sleeveLong};
  // ---- koltuk ve alt gövde (hareketsiz → birleştirilir) ----
  const lower = new THREE.Group(); root.add(lower);
  buildChair(lower, opts.chair);
  for (const s of [-1,1]){
    const hip = V(s*0.1, 0.53, 0.05), knee = V(s*0.12, 0.54, -0.35), ankle = V(s*0.12, 0.1, -0.41);
    const th = mesh(capsule(0.076), pants, {outline:.06}); placeLimb(th, hip, knee); lower.add(th);
    const sh = mesh(capsule(0.062), pants, {outline:.06}); placeLimb(sh, knee, ankle); lower.add(sh);
    lower.add(sphP(0.055, 0.04, 0.05, M(new THREE.Color(PANTS[(h>>5)%PANTS.length]).multiplyScalar(1.25).getStyle()), s*0.12, 0.575, -0.35));   // diz parlaklığı
    lower.add(rbox(0.105, 0.075, 0.23, 0.035, shoe, s*0.12, 0.045, -0.46, {outline:.06}));
    lower.add(boxP(0.108, 0.018, 0.232, sole, s*0.12, 0.012, -0.46));
  }
  lower.add(rbox(0.32*bw, 0.15, 0.27, 0.06, pants, 0, 0.55, 0.03, {outline:.04}));
  lower.add(part(G.cylLo, M('#3b2f2a'), 0.15*bw, 0.025, 0.12, 0, 0.62, 0.03));    // kemer
  mergeInto(lower);
  // ---- gövde (nefes alır, öne eğilir) ----
  const torso = new THREE.Group(); torso.position.set(0, 0.57, 0.04); torso.userData.dyn = true; root.add(torso); P.torso = torso;
  const chestMat = kind==='blazer' ? M(shirtCol) : shirt;
  torso.add(part(capsule(0.15), chestMat, 1.25*bw, 0.27, 0.82, 0, 0.25, 0, {outline:.035}));
  torso.add(sphP(0.15*bw*1.15, 0.12, 0.13, chestMat, 0, 0.08, 0.005));
  torso.add(sphP(0.07, 0.05, 0.06, chestMat, -0.17*bw, 0.37, 0.0));
  torso.add(sphP(0.07, 0.05, 0.06, chestMat, 0.17*bw, 0.37, 0.0));
  // kıyafet ayrıntıları
  if (kind==='hoodie'){
    const hood = part(G.torus, shirtD, 0.095, 0.095, 0.11, 0, 0.47, 0.05, {outline:.04}); hood.rotation.x = Math.PI/2 - 0.35; torso.add(hood);
    torso.add(sphP(0.1, 0.06, 0.05, shirtD, 0, 0.42, 0.11));
    for (const s of [-1,1]) torso.add(cylP(0.006, 0.12, M('#ffffff'), s*0.035, 0.36, -0.12));
    torso.add(rbox(0.2, 0.09, 0.02, 0.02, shirtD, 0, 0.12, -0.115));
  } else if (kind==='shirt'){
    for (const s of [-1,1]){ const col = boxP(0.07, 0.035, 0.05, M('#ffffff'), s*0.045, 0.5, -0.02, {outline:.08}); col.rotation.set(0.3, s*0.5, s*0.5); torso.add(col); }
    for (let i=0;i<3;i++) torso.add(sphP(0.008, 0.008, 0.005, shirtD, 0, 0.36 - i*0.09, -0.125));
    torso.add(boxP(0.3*bw, 0.008, 0.2, shirtD, 0, 0.42, 0.07));    // sırt dikişi
  } else if (kind==='blazer'){
    for (const s of [-1,1]){ const col = boxP(0.06, 0.04, 0.05, M('#ffffff'), s*0.04, 0.5, -0.03, {outline:.08}); col.rotation.set(0.3, s*0.5, s*0.45); torso.add(col);
      const lap = boxP(0.05, 0.16, 0.015, shirtD, s*0.06, 0.36, -0.12); lap.rotation.z = s*0.35; torso.add(lap); }
    torso.add(boxP(0.06, 0.18, 0.02, M('#f8fafc'), 0, 0.37, -0.118));
    torso.add(boxP(0.025, 0.13, 0.012, M('#2f54eb'), 0, 0.35, -0.13));
    torso.add(boxP(0.006, 0.18, 0.15, shirtD, 0, 0.12, 0.1));     // arka yırtmaç
  } else if (kind==='sweater'){
    const rib = part(G.torus, shirtD, 0.07, 0.07, 0.07, 0, 0.47, 0.0, {outline:.05}); rib.rotation.x = Math.PI/2 - 0.2; torso.add(rib);
    torso.add(boxP(0.32*bw, 0.03, 0.22, shirtD, 0, -0.02, 0));
  } else {
    const nk = part(G.torus, shirtD, 0.065, 0.065, 0.05, 0, 0.475, 0, {}); nk.rotation.x = Math.PI/2 - 0.2; torso.add(nk);
  }
  torso.add(cylP(0.052, 0.12, skin, 0, 0.53, -0.005));
  // ---- baş ----
  const head = new THREE.Group(); head.position.set(0, 0.69, -0.02); head.userData.dyn = true; torso.add(head); P.head = head;
  head.add(sphP(0.12, 0.132, 0.125, skin, 0, 0, 0, {outline:.035}));
  head.add(sphP(0.095, 0.08, 0.1, skin, 0, -0.058, -0.022));
  for (const s of [-1,1]){
    head.add(sphP(0.017, 0.03, 0.024, skin, s*0.118, -0.004, 0.012, {outline:.1}));
    if (!opts.crowd){ head.add(sphP(0.008, 0.014, 0.01, skinD, s*0.124, -0.004, 0.012)); head.add(sphP(0.025, 0.021, 0.012, M('#ffffff'), s*0.046, 0.018, -0.11)); head.add(sphP(0.006, 0.006, 0.004, new THREE.MeshBasicMaterial({color:0xffffff}), s*0.046+0.006, 0.026, -0.128)); if (female){ const lash = boxP(0.03, 0.005, 0.006, M('#1f2937'), s*0.048, 0.036, -0.12); lash.rotation.z = s*0.25; head.add(lash); } }
    head.add(sphP(0.014, 0.016, 0.01, M('#2b1d14'), s*0.046, 0.017, -0.118));
    const brow = boxP(0.042, 0.009, 0.012, hairD, s*0.046, 0.05, -0.115); brow.rotation.z = s*0.1; head.add(brow);
    if (!opts.crowd) head.add(sphP(0.022, 0.014, 0.008, M('#f4a3a3'), s*0.07, -0.03, -0.1));
  }
  head.add(sphP(0.018, 0.024, 0.026, skin, 0, -0.012, -0.125));
  { const smile = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0065, 4, 10, Math.PI), M('#9a3412')); smile.rotation.set(0, 0, Math.PI); smile.position.set(0, -0.045, -0.115); head.add(smile); }
  if (L.beard) head.add(sphP(0.09, 0.06, 0.07, hairM, 0, -0.08, -0.05));
  buildHair(head, L, hairM, hairD, skin);
  if (L.glasses){
    const fr = M('#1f2937');
    for (const s of [-1,1]){ const ring = part(G.torus, fr, 0.026, 0.022, 0.026, s*0.046, 0.016, -0.122); head.add(ring); head.add(boxP(0.006, 0.006, 0.12, fr, s*0.11, 0.02, -0.06)); }
    head.add(boxP(0.03, 0.006, 0.006, fr, 0, 0.02, -0.125));
  }
  if (L.phones){
    const pm = M('#1f2937');
    const band = part(G.torus, pm, 0.13, 0.13, 0.13, 0, 0.02, 0.01); band.rotation.y = Math.PI/2; band.scale.z = 0.05; head.add(band);
    for (const s of [-1,1]){ const cup = cylP(0.045, 0.035, pm, s*0.13, -0.005, 0.01, {outline:.06}); cup.rotation.z = Math.PI/2; head.add(cup);
      const pad = cylP(0.03, 0.01, M(shirtCol), s*0.15, -0.005, 0.01); pad.rotation.z = Math.PI/2; head.add(pad); }
  }
  if (role==='me') { const cr = emojiSprite('👑', 0.16); cr.position.set(0, 0.24, 0.02); head.add(cr); }
  if (lead){ const st = emojiSprite('⭐', 0.15); st.position.set(0, 0.3, 0.02); head.add(st); }
  mergeInto(head, c => c.isSprite);
  head.traverse(c => { if (c.isMesh) c.castShadow = false; });
  mergeInto(torso, c => c === head);
  // ---- kollar (her karede yeniden konumlanır) ----
  const upMat = sleeveLong ? shirt : skin, foMat = sleeveLong ? shirt : skin, crowd = !!opts.crowd;
  P.arms = [-1,1].map(s => {
    const ol = crowd ? null : {outline:.06};
    const up = mesh(capsule(0.06), upMat, ol), fo = mesh(capsule(0.05), foMat, ol);
    up.userData.dyn = fo.userData.dyn = true; up.castShadow = fo.castShadow = false; root.add(up); root.add(fo);
    const cuff = sleeveLong ? null : mesh(capsule(0.068), shirt, {outline:.05}); if (cuff){ cuff.userData.dyn = true; root.add(cuff); }
    const hand = makeHand(skin, skinD, s, crowd); hand.userData.dyn = true; hand.traverse(c => c.castShadow = false); root.add(hand);
    return {s, up, fo, cuff, hand};
  });
  // dokunma alanı
  const hit = boxP(0.62, 1.4, 0.75, HIDDEN, 0, 0.7, -0.1); hit.castShadow = false; hit.userData.dyn = true; hit.userData.cid = id; root.add(hit);
  P.hit = hit;
  return P;
}
const tmpV = new THREE.Vector3();
function animPerson(P, t, dt){
  const want = P.wantWork ? 1 : 0;
  P.state += (want - P.state) * Math.min(1, dt*3);
  const w = P.state, tt = t + P.t0;
  // gövde: çalışırken öne eğik, boştayken arkaya yaslanır
  P.torso.rotation.x = THREE.MathUtils.lerp(0.06, -0.2, w) + Math.sin(tt*1.6)*0.012;
  P.torso.scale.y = 1 + Math.sin(tt*1.6)*0.006;
  P.head.rotation.x = THREE.MathUtils.lerp(-0.05, 0.1, w) + Math.sin(tt*2.3)*0.02*w;
  P.head.rotation.y = THREE.MathUtils.lerp(Math.sin(tt*0.45)*0.5, Math.sin(tt*0.5)*0.06, w);
  P.root.updateMatrixWorld(true);
  const cyc = (tt % P.mouseCyc)/P.mouseCyc;
  const mouseW = THREE.MathUtils.smoothstep(cyc, 0.55, 0.62) * (1 - THREE.MathUtils.smoothstep(cyc, 0.88, 0.95)) * w;
  for (const A of P.arms){
    const s = A.s;
    tmpV.set(s*0.2, 0.36, 0); const sh = P.torso.localToWorld(tmpV.clone()); P.root.worldToLocal(sh);
    const kb = V(s*0.1, 0.8, -0.63);
    const tap = Math.max(0, Math.sin(tt*22 + (s>0?1.7:0)))*0.012*w;
    let hand = kb.clone(); hand.y += tap; hand.x += Math.sin(tt*3.1 + s)*0.018*w;
    if (s > 0) hand.lerp(V(0.37, 0.8, -0.62), mouseW);
    const rest = V(s*0.17, 0.66, -0.3);       // boştayken eller kucakta
    hand.lerp(rest, 1 - w);
    const elbow = V(s*0.25, 0.66, -0.18).lerp(V(s*0.27, 0.6, -0.05), 1 - w);
    placeLimb(A.up, sh, elbow); placeLimb(A.fo, elbow, hand.clone().add(V(0, 0, 0.05)));
    if (A.cuff) placeLimb(A.cuff, sh, sh.clone().lerp(elbow, 0.55));
    A.hand.position.copy(hand);
    A.hand.rotation.set(0.15 * w + 0.6*(1-w), s*0.08 - (s>0 ? mouseW*0.3 : 0), 0);
  }
  if (P.mouse && P.mouseHome){ P.mouse.position.x = P.mouseHome.x + (P.arms[1].hand.position.x - 0.37)*mouseW*0.6; }
  if (alarmG) panicPose(P, tt);
  else if (launchG && launchG.userData.clap) clapPose(P, tt);
}

/* =====================================================================
   OFİSTE DOLAŞMA – boştaki çalışanlar kalkar: kafe, masa tenisi, sohbet
   Oturan model masada kalır (gizlenir); yerine ayakta bir kopya yürür.
   ===================================================================== */
const ROAM = {spots:[], lane:0};
let thumbR = null; const thumbCache = new Map();
let lastL = -1;
let nameTags = [], nameLayer = null;
function spotAdd(kind, x, z, rot, via, y=0){ ROAM.spots.push({kind, x, z, rot, via:via||[], y, who:null}); }
const faceTo = (x, z, tx, tz) => Math.atan2(-(tx-x), -(tz-z));
function buildWalker(P){
  const Lk = P.look, W = {root:new THREE.Group(), legs:[], arms:[]};
  W.root.userData.dyn = true; W.root.visible = false;
  const torso = P.torso.clone(true); torso.rotation.set(0,0,0); torso.scale.set(1,1,1);
  W.root.add(torso); W.torso = torso; W.head = torso.children[P.torso.children.indexOf(P.head)];
  W.root.add(rbox(0.32*Lk.bw, 0.16, 0.24, 0.06, Lk.pants, 0, 0, 0)); W.hips = W.root.children[W.root.children.length-1];
  for (const s of [-1,1]){
    const th = mesh(capsule(0.072), Lk.pants), sh = mesh(capsule(0.06), Lk.pants), ft = rbox(0.1, 0.07, 0.22, 0.03, Lk.shoe, 0, 0, 0);
    for (const m of [th, sh, ft]){ m.castShadow = false; W.root.add(m); }
    W.legs.push({s, th, sh, ft});
  }
  const upMat = Lk.sleeveLong ? Lk.shirt : Lk.skin;
  for (const A of P.arms){
    const up = mesh(capsule(0.058), upMat), fo = mesh(capsule(0.048), upMat), hand = A.hand.clone(true);
    for (const m of [up, fo, hand]){ m.castShadow = false; W.root.add(m); }
    W.arms.push({s:A.s, up, fo, hand});
  }
  W.cup = cylP(0.035, 0.09, M('#ffffff'), 0, 0, 0); W.cup.castShadow = false; W.root.add(W.cup);
  W.cup.add(cylP(0.6, 0.15, M('#7c3f1d'), 0, 0.3, 0));
  W.paddle = cylP(0.075, 0.012, M('#ef4444'), 0, 0, 0); W.paddle.castShadow = false; W.root.add(W.paddle);
  W.phone = boxP(0.06, 0.11, 0.012, M('#1f2937'), 0, 0, 0); W.phone.castShadow = false; W.root.add(W.phone);
  const hit = boxP(0.5, 1.6, 0.5, HIDDEN, 0, 0.8, 0); hit.userData.cid = P.id; W.root.add(hit);
  roomG.add(W.root);
  return W;
}
// yürüme / oturma / oynama pozları (yerel: -Z ileri)
function poseWalker(W, mode, t, walkAmt, seatY){
  const sit = mode==='sit' || mode==='drinksit';
  const ph = t*7.5, bob = Math.abs(Math.sin(ph))*0.025*walkAmt;
  const hipY = sit ? seatY + 0.06 : 0.9 + bob;
  W.hips.position.set(0, hipY, sit ? 0.04 : 0);
  W.torso.position.set(0, hipY + 0.04, sit ? 0.06 : 0.01);
  W.torso.rotation.x = sit ? -0.12 : 0.04*walkAmt;
  W.head.rotation.y = mode==='chat' ? Math.sin(t*0.9)*0.35 : Math.sin(t*0.5)*0.15;
  W.head.rotation.x = mode==='phone' ? 0.35 : 0;
  for (const Lg of W.legs){
    const s = Lg.s, hip = V(s*0.1, hipY - 0.03, sit ? 0.04 : 0);
    let knee, ankle;
    if (sit){
      knee = V(s*0.12, seatY + 0.07, -0.36);
      ankle = seatY > 0.6 ? V(s*0.12, seatY - 0.3, -0.3) : V(s*0.12, Math.max(0.09, seatY - 0.33), -0.42);
    } else {
      const sw = Math.sin(ph + (s>0 ? 0 : Math.PI)) * 0.42 * walkAmt;
      const bend = Math.max(0, -Math.cos(ph + (s>0 ? 0 : Math.PI))) * 0.55 * walkAmt;
      knee = hip.clone().add(V(0, -0.42*Math.cos(sw), -0.42*Math.sin(sw)));
      ankle = knee.clone().add(V(0, -0.42*Math.cos(sw-bend), -0.42*Math.sin(sw-bend)));
    }
    placeLimb(Lg.th, hip, knee); placeLimb(Lg.sh, knee, ankle);
    Lg.ft.position.copy(ankle).add(V(0, -0.045, -0.06)); Lg.ft.position.y = Math.max(0.035, Lg.ft.position.y);
  }
  W.root.updateMatrixWorld(true);
  const cupOn = mode==='drink' || mode==='drinksit', drinkK = cupOn ? THREE.MathUtils.smoothstep((Math.sin(t*0.9)+1)/2, 0.75, 0.95) : 0;
  for (const A of W.arms){
    const s = A.s, sh = W.torso.localToWorld(V(s*0.2*1, 0.36, 0)); W.root.worldToLocal(sh);
    let hand;
    if (mode==='walk' || mode==='stand') hand = sh.clone().add(V(s*0.05, -0.58, -Math.sin(ph + (s>0 ? Math.PI : 0))*0.18*walkAmt));
    else if (sit && !cupOn) hand = V(s*0.16, seatY + 0.2, -0.28);
    else if (mode==='pong' && s>0) hand = V(0.32 + Math.sin(t*6)*0.12, 1.02 + Math.cos(t*6)*0.08, -0.32);
    else if (mode==='chat') hand = sh.clone().add(V(s*0.08, -0.45 + (s>0 ? Math.max(0, Math.sin(t*1.7))*0.22 : 0), -0.18 - (s>0 ? Math.max(0, Math.sin(t*1.7))*0.12 : 0)));
    else if (mode==='phone') hand = V(s*0.06, 1.12, -0.26);
    else hand = sh.clone().add(V(s*0.05, -0.56, -0.05));
    if (cupOn && s>0){ const low = V(0.14, (sit ? seatY : 0.75) + 0.32, -0.26), mouth = V(0.05, W.torso.position.y + 0.6, -0.16); hand = low.lerp(mouth, drinkK); }
    const elbow = sh.clone().lerp(hand, 0.5).add(V(s*0.08, -0.04, 0.06));
    placeLimb(A.up, sh, elbow); placeLimb(A.fo, elbow, hand); A.hand.position.copy(hand); A.hand.rotation.set(0.4, 0, 0);
    if (s>0){ W.cup.visible = cupOn; W.cup.position.copy(hand).add(V(0, 0.05, -0.02));
      W.paddle.visible = mode==='pong'; W.paddle.position.copy(hand).add(V(0.02, 0.06, -0.04)); W.paddle.rotation.set(Math.PI/2, 0, 0.3);
      W.phone.visible = mode==='phone'; W.phone.position.copy(hand).add(V(-0.06, 0.05, -0.04)); W.phone.rotation.set(-0.6, 0, 0); }
  }
}
function roamStart(P, t, spot, breakT){
  if (!P.W) P.W = buildWalker(P);
  const st = P.station, home = st.position.clone(), stand = home.clone().add(V(0.5, 0, 0));
  const path = [home, stand, V(stand.x, 0, ROAM.lane), ...spot.via.map(([x,z]) => V(x, 0, z)), V(spot.x, 0, spot.z)];
  spot.who = P.id;
  P.roam = {mode:'go', path, i:0, spot, until:0, brk:breakT};
  P.root.visible = false; if (P.emptyChair) P.emptyChair.visible = true;
  P.W.root.visible = true; P.W.root.position.copy(home);
}
function roamTick(P, t, dt){
  if (meetG || launchG) return;   // toplantıda ve lansmanda kimse kalkmaz
  const R = P.roam;
  if (!R){
    if (P.id==='me' || P.id==='mgr' || !ROAM.spots.length) return;
    if (t < (P.nextRoam ?? (P.nextRoam = t + 4 + Math.random()*8))) return;
    const idle = !P.wantWork;
    P.nextRoam = t + (idle ? 3 + Math.random()*6 : 25 + Math.random()*40);
    if (Math.random() > (idle ? 0.55 : 0.12)) return;
    const free = ROAM.spots.filter(s => s.who == null && (idle || s.kind==='drink' || s.kind==='drinksit'));
    if (!free.length) return;
    // sohbet noktalarında yalnız kalmamak için eşi dolu olanı tercih et
    const paired = free.filter(s => s.kind==='chat' && s.mate != null && ROAM.spots[s.mate].who != null);
    roamStart(P, t, paired.length && Math.random() < 0.7 ? paired[0] : pick(free), !idle);
    return;
  }
  const W = P.W;
  if (R.mode==='go' || R.mode==='back'){
    const tgt = R.path[R.i+1], pos = W.root.position, d = tgt.clone().sub(pos); d.y = 0;
    const len = d.length(), step = 1.35*dt;
    if (len > 0.001) W.root.rotation.y = Math.atan2(-d.x, -d.z);
    if (len <= step){ pos.copy(tgt); R.i++;
      if (R.i >= R.path.length-1){
        if (R.mode==='go'){ R.mode = 'stay'; W.root.rotation.y = R.spot.rot; R.until = t + (R.brk ? 7 + Math.random()*5 : 14 + Math.random()*16); }
        else { W.root.visible = false; P.root.visible = true; if (P.emptyChair) P.emptyChair.visible = false; R.spot.who = null; P.roam = null; P.nextRoam = t + 3 + Math.random()*5; return; }
      }
    } else pos.addScaledVector(d.normalize(), step);
    poseWalker(W, 'walk', t + P.t0, 1, 0);
    return;
  }
  // bulunduğu noktada
  const sp = R.spot, lonely = sp.kind==='chat' && (sp.mate == null || ROAM.spots[sp.mate].who == null);
  W.root.position.set(sp.x, 0, sp.z);
  if (sp.kind==='pong') W.root.position.x += Math.sin((t+P.t0)*1.4)*0.12*Math.cos(sp.rot);
  poseWalker(W, lonely ? 'phone' : sp.kind, t + P.t0, 0, sp.y);
  if (t > R.until || (P.wantWork && !R.brk && t > R.until - 1e9 && Math.random() < dt*0.6)){
    R.mode = 'back'; R.path = R.path.slice().reverse(); R.i = 0; R.path[0] = W.root.position.clone();
  }
}
// isim: masanın önünde, yere yazılı (yazı x boyunca uzanır, kameradan okunur)
function floorNameAt(n){
  n.label = n.me ? (S.boss || 'Sen') : String(n.name).replace(/\s*\(.*?\)\s*/g, '');
  n.cv = document.createElement('canvas'); n.cv.width = 640; n.cv.height = 112;
  n.tex = new THREE.CanvasTexture(n.cv); n.tex.colorSpace = THREE.SRGBColorSpace; n.tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.4), new THREE.MeshBasicMaterial({map:n.tex, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2, opacity: n.away ? 0.5 : 1}));
  m.rotation.x = -Math.PI/2; m.position.set(n.st.position.x - 0.5, 0.016, n.st.position.z + 0.9); m.userData.dyn = true; m.renderOrder = 6;
  roomG.add(m); n.key = null; drawName(n);
}
// isim etiketi: solda moral noktası, ortada isim, sağda bugünkü katkı
function drawName(n){
  const e = (typeof n.id === 'number') ? S.emps.find(x => x.id===n.id) : null;
  const P = chars.get(String(n.id)), mood = e ? (e.mood ?? 70) : 100, pts = Math.round((typeof tagPts !== 'undefined' && tagPts[n.id]) || 0);
  const idle = P ? !P.wantWork : false;
  const col = n.away ? '#94a3b8' : idle ? '#a3adc2' : mood >= 70 ? '#22a06b' : mood >= 40 ? '#e0a800' : '#e5484d';
  const key = col + '|' + pts;
  if (key === n.key) return; n.key = key;
  const c = n.cv.getContext('2d'), w = n.cv.width, h = n.cv.height;
  c.clearRect(0, 0, w, h);
  c.font = '900 60px Nunito, system-ui, sans-serif'; c.textBaseline = 'middle';
  const nameW = c.measureText(n.label).width, ptsTxt = pts > 0 ? '+' + pts : '', ptsW = ptsTxt ? (c.font = '900 48px Nunito, system-ui, sans-serif', c.measureText(ptsTxt).width + 30) : 0;
  const total = 44 + nameW + ptsW, x0 = Math.max(4, (w - total)/2);
  c.fillStyle = col; c.beginPath(); c.arc(x0 + 16, h/2, 16, 0, 7); c.fill();
  c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.9)'; c.stroke();
  c.font = '900 60px Nunito, system-ui, sans-serif'; c.fillStyle = n.me ? 'rgba(23,58,128,.95)' : 'rgba(31,42,68,.88)'; c.fillText(n.label, x0 + 44, h/2 + 3);
  if (ptsTxt){ c.font = '900 48px Nunito, system-ui, sans-serif'; c.fillStyle = '#1d7a52'; c.fillText(ptsTxt, x0 + 44 + nameW + 26, h/2 + 4); }
  n.tex.needsUpdate = true;
}
let tagT = 0;
function updateNames(dt){ tagT -= dt; if (tagT > 0) return; tagT = 0.6; for (const n of nameTags) if (n.cv) drawName(n); }function roamReset(){ for (const P of chars.values()){ if (P.roam && P.roam.spot) P.roam.spot.who = null; P.roam = null; P.W = null; } }

/* =====================================================================
   EŞYALAR – oda karesi koordinatlarıyla yerleştirilir (x→X, y→Z)
   ===================================================================== */
const T = v => v*U;
function plant(g, x, z, sc=1){
  const p = new THREE.Group(); p.position.set(T(x)+0.2, 0, T(z)+0.2); p.scale.setScalar(sc);
  p.add(cylP(0.15, 0.32, M('#e07a5f'), 0, 0.16, 0, {outline:.03}));
  p.add(cylP(0.135, 0.02, M('#5b3a26'), 0, 0.32, 0));
  for (const [x,y,z,s,c] of [[0,.55,0,.2,'#4ca86b'],[-.1,.66,.05,.15,'#3f9a5e'],[.1,.7,-.04,.14,'#57b877'],[.02,.84,0,.12,'#4ca86b'],[-.06,.46,-.1,.12,'#3f9a5e']]){ const l = mesh(new THREE.IcosahedronGeometry(s,1), M(c), {outline:.04}); l.position.set(x,y,z); p.add(l); }
  g.add(p);
}
function bookshelfX(g, x, z, len){  // arka duvara (z≈0) dayalı raf, x boyunca
  const wood = M('#9b7652'), dark = M('#7a5a3c');
  const w = T(len), cx = T(x) + w/2, cz = T(z) + 0.18;
  g.add(boxP(w, 1.7, 0.36, dark, cx, 0.85, cz, {outline:.01}));
  for (let i=0;i<4;i++){ g.add(boxP(w-0.06, 0.04, 0.34, wood, cx, 0.12 + i*0.48, cz+0.01));
    let bx = T(x) + 0.08; const cols = ['#ef4444','#2f54eb','#f59e0b','#7c3aed','#10b981','#f472b6','#0ea5e9'];
    while (bx < T(x)+w-0.12){ const bw = 0.05 + Math.random()*0.04, bh = 0.26 + Math.random()*0.12; g.add(boxP(bw, bh, 0.24, M(cols[(Math.random()*cols.length)|0]), bx+bw/2, 0.14 + i*0.48 + bh/2, cz+0.02)); bx += bw + 0.008; } }
}
function windowBack(g, a, b, night){   // arka duvarda pencere (x: a→b kare)
  const x0 = T(a), x1 = T(b), w = x1-x0, cx = (x0+x1)/2;
  const glassM = night ? M('#1e1b4b') : new THREE.MeshBasicMaterial({color:0xbfe3ff});
  g.add(boxP(w, 1.2, 0.04, glassM, cx, 1.45, 0.03));
  const fr = M('#ffffff');
  g.add(boxP(w+0.08, 0.06, 0.08, fr, cx, 2.08, 0.05, {outline:.03})); g.add(boxP(w+0.08, 0.06, 0.1, fr, cx, 0.83, 0.06, {outline:.03}));
  g.add(boxP(0.06, 1.26, 0.08, fr, x0-0.01, 1.45, 0.05)); g.add(boxP(0.06, 1.26, 0.08, fr, x1+0.01, 1.45, 0.05)); g.add(boxP(0.04, 1.2, 0.06, fr, cx, 1.45, 0.05));
  // pencereden düşen ışık
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), new THREE.MeshBasicMaterial({color:0xfff7e0, transparent:true, opacity:0.18, depthWrite:false}));
  patch.rotation.x = -Math.PI/2; patch.position.set(cx+0.15, 0.012, 0.6); patch.castShadow = false; g.add(patch);
}
function windowLeft(g, a, b){  // sol duvarda pencere (z: a→b kare)
  const z0 = T(a), z1 = T(b), w = z1-z0, cz = (z0+z1)/2;
  g.add(boxP(0.04, 1.2, w, new THREE.MeshBasicMaterial({color:0xbfe3ff}), 0.03, 1.45, cz));
  const fr = M('#ffffff');
  g.add(boxP(0.08, 0.06, w+0.08, fr, 0.05, 2.08, cz, {outline:.03})); g.add(boxP(0.1, 0.06, w+0.08, fr, 0.06, 0.83, cz, {outline:.03}));
  g.add(boxP(0.08, 1.26, 0.06, fr, 0.05, 1.45, z0)); g.add(boxP(0.08, 1.26, 0.06, fr, 0.05, 1.45, z1)); g.add(boxP(0.06, 1.2, 0.04, fr, 0.05, 1.45, cz));
}
function doorLeft(g, z, col='#b07a45'){
  const cz = T(z)+0.45;
  g.add(boxP(0.08, 2.1, 1.0, M('#ffffff'), 0.04, 1.05, cz, {outline:.02}));
  g.add(boxP(0.06, 2.0, 0.88, M(col), 0.07, 1.0, cz));
  g.add(sphP(0.035, 0.035, 0.035, M('#fbbf24'), 0.12, 1.0, cz+0.34));
}
function poster(g, side, a, w, h, y, draw){
  const tex = canvasTex(160, Math.round(160*h/w), draw);
  const m = boxP(side==='left' ? 0.02 : T(w), h, side==='left' ? T(w) : 0.02, M('#ffffff', {map:tex}), side==='left' ? 0.03 : T(a)+T(w)/2, y, side==='left' ? T(a)+T(w)/2 : 0.03, {outline:.02});
  g.add(m);
}
function whiteboard(g, a){
  poster(g, 'left', a, 1.9, 0.9, 1.45, (c,w,h) => { c.fillStyle = '#ffffff'; c.fillRect(0,0,w,h); c.strokeStyle = '#2f54eb'; c.lineWidth = 4; c.beginPath(); c.moveTo(18,h*0.7); c.lineTo(50,h*0.45); c.lineTo(80,h*0.6); c.lineTo(130,h*0.25); c.stroke();
    c.fillStyle = '#f7735a'; c.fillRect(18, h*0.82, 70, 5); c.fillStyle = '#f472b6'; c.fillRect(18, h*0.9, 50, 5); c.strokeStyle = '#b3adc9'; c.lineWidth = 6; c.strokeRect(0,0,w,h); });
}
function couch(g, x, z, len, col, rotY=0){
  const c = new THREE.Group(); c.position.set(T(x), 0, T(z)); c.rotation.y = rotY;
  const m = M(col), md = M(new THREE.Color(col).multiplyScalar(0.8).getStyle());
  const w = T(len);
  c.add(rbox(w, 0.22, 0.75, 0.06, md, w/2, 0.2, 0.375, {outline:.02}));
  c.add(rbox(w-0.1, 0.12, 0.6, 0.06, m, w/2, 0.36, 0.42, {outline:.02}));
  c.add(rbox(w, 0.5, 0.18, 0.07, m, w/2, 0.5, 0.09, {outline:.02}));
  for (const s of [0, w]) c.add(rbox(0.16, 0.36, 0.75, 0.06, md, s, 0.38, 0.375, {outline:.03}));
  c.add(rbox(0.3, 0.22, 0.1, 0.05, M('#fde68a'), w*0.25, 0.55, 0.24));
  g.add(c);
}
function kitchenLeft(g, z, len){   // sol duvara dayalı mutfak tezgâhı (z boyunca)
  const z0 = T(z), l = T(len), cz = z0 + l/2;
  g.add(boxP(0.6, 0.85, l, M('#ffffff'), 0.32, 0.425, cz, {outline:.01}));
  g.add(boxP(0.64, 0.05, l+0.02, M('#64748b'), 0.33, 0.87, cz));
  for (let i=0;i<Math.floor(l/0.45);i++) g.add(boxP(0.02, 0.6, 0.38, M('#e2e8f0'), 0.63, 0.45, z0 + 0.25 + i*0.45));
  g.add(boxP(0.36, 0.02, 0.4, M('#94a3b8'), 0.32, 0.9, cz - l*0.2));
  g.add(cylP(0.02, 0.22, M('#cbd5e1'), 0.12, 1.0, cz - l*0.2));
  g.add(boxP(0.5, 0.5, 0.2, M('#ffffff'), 0.25, 1.75, cz, {outline:.02}));
  g.add(boxP(0.6, 1.9, 0.62, M('#e5e7eb'), 0.32, 0.95, z0 + l + 0.34, {outline:.01}));   // buzdolabı
  g.add(boxP(0.02, 0.5, 0.04, M('#94a3b8'), 0.63, 1.2, z0 + l + 0.1));
}
function vending(g, x, kind){
  const cx = T(x)+0.35;
  const tex = canvasTex(128, 200, (c,w,h) => { c.fillStyle = kind ? '#1e3a8a' : '#7f1d1d'; c.fillRect(0,0,w,h); c.fillStyle = '#e0f2fe'; c.fillRect(10,10,80,150);
    const cols = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'];
    for (let r=0;r<5;r++) for (let k=0;k<4;k++){ c.fillStyle = cols[(r+k+kind)%cols.length]; c.fillRect(16+k*18, 18+r*28, 12, 20); }
    c.fillStyle = '#111827'; c.fillRect(98, 40, 20, 40); c.fillStyle = '#fbbf24'; c.fillRect(100, 90, 16, 8); c.fillStyle = '#0f172a'; c.fillRect(14, 170, 70, 18); });
  g.add(boxP(0.7, 1.85, 0.7, M(kind ? '#2f54eb' : '#ef4444'), cx, 0.925, 0.38, {outline:.015}));
  g.add(boxP(0.62, 1.7, 0.02, M('#ffffff', {map:tex}), cx, 0.95, 0.74));
}
function arcade(g, x, z){
  const cx = T(x), cz = T(z)+0.35;
  g.add(boxP(0.6, 1.7, 0.6, M('#7c3aed'), cx, 0.85, cz, {outline:.015}));
  const scr = boxP(0.02, 0.4, 0.46, new THREE.MeshBasicMaterial({map: canvasTex(64,64,(c,w,h)=>{ c.fillStyle='#0f172a'; c.fillRect(0,0,w,h); c.fillStyle='#f472b6'; c.fillRect(10,40,12,12); c.fillStyle='#fde047'; c.fillRect(36,20,10,10); c.fillStyle='#4ade80'; c.fillRect(20,14,8,8); })}), cx-0.31, 1.3, cz);
  g.add(scr);
  g.add(boxP(0.25, 0.08, 0.5, M('#1f2937'), cx-0.38, 0.98, cz));
  g.add(sphP(0.03, 0.03, 0.03, M('#ef4444'), cx-0.42, 1.04, cz-0.1)); g.add(sphP(0.03, 0.03, 0.03, M('#22c55e'), cx-0.42, 1.04, cz+0.1));
}
function serverRack(g, x, z){
  const cx = T(x)+0.3, cz = T(z)+0.3;
  g.add(boxP(0.6, 2.0, 0.6, M('#1f2937'), cx, 1.0, cz, {outline:.015}));
  for (let i=0;i<8;i++){ g.add(boxP(0.52, 0.16, 0.02, M('#334155'), cx, 0.3 + i*0.21, cz+0.31)); g.add(boxP(0.03, 0.03, 0.02, new THREE.MeshBasicMaterial({color: i%3 ? 0x34d399 : 0x60a5fa}), cx+0.2, 0.3 + i*0.21, cz+0.325)); }
}
function waterCooler(g, x, z){
  const cx = T(x)+0.25, cz = T(z)+0.25;
  g.add(boxP(0.38, 0.95, 0.38, M('#f8fafc'), cx, 0.475, cz, {outline:.02}));
  g.add(cylP(0.15, 0.42, new THREE.MeshPhongMaterial({color:0x7cc9ff, transparent:true, opacity:0.75, shininess:80}), cx, 1.17, cz));
  g.add(boxP(0.06, 0.05, 0.04, M('#3b82f6'), cx+0.07, 0.72, cz+0.2)); g.add(boxP(0.06, 0.05, 0.04, M('#ef4444'), cx-0.07, 0.72, cz+0.2));
}
function coffeeMachine(g, x, z){
  const cx = T(x)+0.3, cz = T(z)+0.3;
  g.add(boxP(0.6, 0.78, 0.5, M('#9b7652'), cx, 0.39, cz, {outline:.02}));
  g.add(boxP(0.34, 0.42, 0.32, M('#1f2937'), cx, 0.99, cz, {outline:.03}));
  g.add(boxP(0.2, 0.06, 0.2, M('#64748b'), cx, 0.81, cz+0.06));
  g.add(cylP(0.04, 0.08, M('#ffffff'), cx, 0.88, cz+0.08));
  g.add(boxP(0.12, 0.04, 0.01, new THREE.MeshBasicMaterial({color:0x34d399}), cx, 1.1, cz+0.17));
}
function cat(g, x, z){
  const c = new THREE.Group(); c.position.set(T(x), 0, T(z)); c.rotation.y = 0.8;
  const f = M('#f59e0b'), fd = M('#d97706');
  c.add(sphP(0.16, 0.1, 0.1, f, 0, 0.1, 0, {outline:.05}));
  c.add(sphP(0.075, 0.07, 0.07, f, -0.15, 0.17, 0, {outline:.06}));
  for (const s of [-1,1]){ const ear = part(G.cone, fd, 0.025, 0.05, 0.025, -0.16, 0.24, s*0.035); c.add(ear); }
  const tail = mesh(capsule(0.02), fd); tail.scale.y = 0.18; tail.rotation.z = -0.9; tail.position.set(0.18, 0.16, 0); c.add(tail);
  g.add(c);
}
function bicycle(g, x, z){
  const b = new THREE.Group(); b.position.set(T(x), 0, T(z)); b.rotation.y = 0.15;
  const tire = M('#1f2937'), frame = M('#ef4444');
  const thin = new THREE.TorusGeometry(1, 0.075, 6, 28);
  for (const dx of [-0.42, 0.42]){ b.add(part(thin, tire, 0.3, 0.3, 0.3, dx, 0.32, 0)); for (let k=0;k<6;k++){ const sp = boxP(0.006, 0.5, 0.006, M('#cbd5e1'), dx, 0.32, 0); sp.rotation.z = k*Math.PI/6; b.add(sp); } b.add(cylP(0.03, 0.03, M('#64748b'), dx, 0.32, 0)); }
  const bar = (a, c2) => { const m = mesh(capsule(0.012), frame); placeLimb(m, a, c2); b.add(m); };
  bar(V(-0.42,0.32,0), V(-0.05,0.62,0)); bar(V(-0.05,0.62,0), V(0.32,0.62,0)); bar(V(0.32,0.62,0), V(0.42,0.32,0)); bar(V(-0.05,0.62,0), V(0,0.32,0)); bar(V(0,0.32,0), V(-0.42,0.32,0)); bar(V(0.32,0.62,0), V(0.35,0.78,0));
  b.add(rbox(0.16, 0.03, 0.06, 0.015, M('#1f2937'), -0.06, 0.66, 0)); b.add(boxP(0.02, 0.02, 0.36, M('#1f2937'), 0.35, 0.8, 0));
  g.add(b);
}
function workbench(g, z, len){
  const z0 = T(z), l = T(len), cz = z0 + l/2;
  g.add(boxP(0.6, 0.06, l, M('#a0703f'), 0.35, 0.86, cz, {outline:.015}));
  for (const dz of [0.06, l-0.06]) for (const dx of [0.08, 0.6]) g.add(boxP(0.05, 0.86, 0.05, M('#6b5a48'), dx, 0.43, z0+dz));
  g.add(boxP(0.55, 0.04, l-0.1, M('#7a5a3c'), 0.35, 0.25, cz));
  // pano ve aletler
  g.add(boxP(0.03, 0.8, l, M('#d6b98c'), 0.03, 1.5, cz, {outline:.02}));
  const tools = ['#ef4444','#64748b','#f59e0b','#2f54eb'];
  for (let i=0;i<4;i++) g.add(boxP(0.03, 0.3, 0.06, M(tools[i]), 0.06, 1.5, z0 + 0.2 + i*l/4.5));
  g.add(boxP(0.25, 0.12, 0.35, M('#ef4444'), 0.3, 0.95, z0+0.4, {outline:.04}));
}
function metalShelfX(g, x, len){
  const x0 = T(x), l = T(len), cx = x0 + l/2;
  for (const y of [0.15, 0.7, 1.25, 1.8]) g.add(boxP(l, 0.03, 0.42, M('#94a3b8'), cx, y, 0.25));
  for (const dx of [0.03, l-0.03]) for (const dz of [0.06, 0.44]) g.add(boxP(0.035, 1.9, 0.035, M('#64748b'), x0+dx, 0.95, dz));
  cardboard(g, cx-0.1, 0.17, 0.25, 0.36, 0.26, 0.3); cardboard(g, cx+0.15, 0.72, 0.25, 0.3, 0.24, 0.3); cardboard(g, cx, 1.27, 0.25, 0.34, 0.22, 0.3);
}
function cardboard(g, cx, y, cz, w, h, d, r=0){
  const b = rbox(w, h, d, 0.015, M('#c89a66'), cx, y + h/2, cz, {outline:.02}); b.rotation.y = r; g.add(b);
  const tp = boxP(w*1.01, 0.012, d*0.22, M('#e8d3ad'), cx, y + h + 0.002, cz); tp.rotation.y = r; g.add(tp);
}
function bed(g, x, z){
  const cx = T(x)+0.55, cz = T(z)+0.9;
  g.add(rbox(1.1, 0.3, 1.9, 0.04, M('#a87447'), cx, 0.15, cz, {outline:.015}));
  g.add(rbox(1.04, 0.16, 1.84, 0.06, M('#f8fafc'), cx, 0.37, cz));
  g.add(rbox(1.06, 0.14, 1.2, 0.06, M('#7cc9ff'), cx, 0.42, cz+0.32));
  g.add(rbox(0.7, 0.12, 0.3, 0.06, M('#ffffff'), cx, 0.5, cz-0.7, {outline:.04}));
  g.add(boxP(1.1, 0.7, 0.08, M('#8b5e34'), cx, 0.55, cz-0.95, {outline:.02}));
}
function tvBack(g, x, w){
  const cx = T(x) + T(w)/2;
  g.add(boxP(T(w), 0.75, 0.05, M('#111827'), cx, 1.5, 0.04, {outline:.02}));
  g.add(boxP(T(w)-0.08, 0.67, 0.01, new THREE.MeshBasicMaterial({map: canvasTex(128, 72, (c,w2,h2)=>{ const gr = c.createLinearGradient(0,0,w2,h2); gr.addColorStop(0,'#2f54eb'); gr.addColorStop(1,'#f472b6'); c.fillStyle = gr; c.fillRect(0,0,w2,h2); c.fillStyle='#fff'; c.font='bold 18px sans-serif'; c.fillText('📈 +24%', 20, 44); })}), cx, 1.5, 0.07));
}
function tvLeft(g, z, w){
  const cz = T(z) + T(w)/2;
  g.add(boxP(0.05, 0.7, T(w), M('#111827'), 0.04, 1.45, cz, {outline:.02}));
  g.add(boxP(0.01, 0.62, T(w)-0.08, new THREE.MeshBasicMaterial({map: canvasTex(128, 72, (c,w2,h2)=>{ const gr = c.createLinearGradient(0,0,w2,h2); gr.addColorStop(0,'#182f99'); gr.addColorStop(1,'#7cc9ff'); c.fillStyle = gr; c.fillRect(0,0,w2,h2); c.fillStyle='#fde68a'; c.fillRect(14,40,18,20); c.fillRect(40,28,18,32); c.fillRect(66,16,18,44); c.fillRect(92,34,18,26); })}), 0.07, 1.45, cz));
}
function rug(g, x, z, w, d, col){
  const r = new THREE.Mesh(new THREE.PlaneGeometry(T(w), T(d)), M(col)); r.rotation.x = -Math.PI/2; r.position.set(T(x)+T(w)/2, 0.012, T(z)+T(d)/2); r.receiveShadow = true; g.add(r);
}
function beanBag(g, x, z, col){ g.add(sphP(0.3, 0.2, 0.3, M(col), T(x), 0.2, T(z), {outline:.04})); g.add(sphP(0.22, 0.12, 0.2, M(new THREE.Color(col).multiplyScalar(1.1).getStyle()), T(x)+0.05, 0.36, T(z)+0.05)); }
function coffeeTable(g, x, z){ g.add(rbox(0.9, 0.05, 0.5, 0.02, M('#a46a3c'), T(x), 0.4, T(z), {outline:.02})); for (const [dx,dz] of [[-.38,-.18],[.38,-.18],[-.38,.18],[.38,.18]]) g.add(boxP(0.04, 0.38, 0.04, M('#6b4a2e'), T(x)+dx, 0.19, T(z)+dz)); g.add(cylP(0.04, 0.08, M('#ffffff'), T(x)+0.2, 0.47, T(z))); }
function logoWall(g, x, z, len, name){
  const cz = T(z) + T(len)/2;
  g.add(boxP(0.12, 2.2, T(len), M('#2f54eb'), T(x), 1.1, cz, {outline:.01}));
  const tex = textTex(name, {w:512, h:128, font:'900 58px Nunito, system-ui, sans-serif'});
  const lbl = new THREE.Mesh(new THREE.PlaneGeometry(T(len)*0.9, T(len)*0.9*0.25), new THREE.MeshBasicMaterial({map:tex, transparent:true}));
  lbl.rotation.y = Math.PI/2; lbl.position.set(T(x)+0.065, 1.5, cz); g.add(lbl);
}
function glassOffice(g, ox, W, oy){
  const glass = new THREE.MeshPhongMaterial({color:0xbfe3ff, transparent:true, opacity:0.28, shininess:90, depthWrite:false});
  const frame = M('#cbd5e1');
  // arka cam duvar: x = ox düzlemi, z 0→oy
  g.add(boxP(0.03, 2.2, T(oy), glass, T(ox), 1.1, T(oy)/2));
  g.add(boxP(0.06, 0.06, T(oy), frame, T(ox), 2.2, T(oy)/2)); g.add(boxP(0.06, 0.06, T(oy), frame, T(ox), 0.03, T(oy)/2));
  // ön cam duvar: z = oy düzlemi, kapı boşluklu
  const xa = T(ox), xb = T(W), ga = T(ox+0.9), gb = T(ox+1.7);
  for (const [a,b] of [[xa, ga],[gb, xb]]){ g.add(boxP(b-a, 2.2, 0.03, glass, (a+b)/2, 1.1, T(oy))); g.add(boxP(b-a, 0.06, 0.06, frame, (a+b)/2, 2.2, T(oy))); g.add(boxP(b-a, 0.06, 0.06, frame, (a+b)/2, 0.03, T(oy))); }
  for (const x of [xa, ga, gb]) g.add(boxP(0.06, 2.2, 0.06, frame, x, 1.1, T(oy)));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.18), new THREE.MeshBasicMaterial({map: textTex('CEO', {w:256, h:64, font:'900 40px Nunito, sans-serif', color:'#7d3b00', bg:'#fbbf24', r:12}), transparent:true}));
  sign.position.set((ga+gb)/2, 2.4, T(oy)+0.02); g.add(sign);
}
// şirket tabelası: her ofise göre farklı (boyalı ahşap, levha, akrilik, metal harf, ışıklı logo)
const SIGN_STYLES = [
  {plate:'#8a5a32', planks:true, text:'#f6e7c8', sub:'rgba(246,231,200,.7)', logo:['#e9c46a','#d08c2f'], logoTx:'#5a3a1c', depth:0.05},
  {plate:'#1f2a44', text:'#ffffff', sub:'rgba(255,255,255,.6)', logo:['#4f7cff','#2f54eb'], logoTx:'#ffffff', depth:0.04, bolts:true},
  {plate:'#f8fafc', text:'#1f2a44', sub:'rgba(31,42,68,.55)', logo:['#4f7cff','#2f54eb'], logoTx:'#ffffff', depth:0.03, bolts:true, edge:'#cbd5e1'},
  {plate:null, text:'#20242e', sub:'rgba(32,36,46,.75)', logo:['#2b303b','#0f1218'], logoTx:'#f4c27a', depth:0, shadow:'rgba(0,0,0,.35)'},
  {plate:null, text:'#ffffff', sub:'rgba(255,255,255,.7)', logo:['#6ea8fe','#2f54eb'], logoTx:'#ffffff', depth:0, glow:'#8fb8ff'},
];
function companySign(g, L, W, name){
  const st = SIGN_STYLES[L] || SIGN_STYLES[2];
  const words = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/), ini = (words[0]||'K')[0] + (words[1] ? words[1][0] : (words[0]||'P')[1] || '');
  const cw = 1024, ch = 240, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d');
  c.font = '900 92px Nunito, system-ui, sans-serif'; const tw = Math.min(cw - 330, c.measureText(name).width);
  const total = 190 + 34 + tw, x0 = (cw - total)/2;
  if (st.plate){
    c.fillStyle = st.plate; c.beginPath(); c.roundRect(6, 6, cw-12, ch-12, 26); c.fill();
    if (st.planks){ c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; for (let y=60; y<ch; y+=60){ c.beginPath(); c.moveTo(12,y); c.lineTo(cw-12,y); c.stroke(); } noise(c, cw, ch, 900, '255,230,200', '40,20,5'); }
    if (st.edge){ c.strokeStyle = st.edge; c.lineWidth = 6; c.beginPath(); c.roundRect(6, 6, cw-12, ch-12, 26); c.stroke(); }
    if (st.bolts){ c.fillStyle = st.plate==='#f8fafc' ? '#94a3b8' : 'rgba(255,255,255,.35)'; for (const [bx,by] of [[34,34],[cw-34,34],[34,ch-34],[cw-34,ch-34]]){ c.beginPath(); c.arc(bx,by,9,0,7); c.fill(); } }
  }
  if (st.glow){ c.shadowColor = st.glow; c.shadowBlur = 34; }
  else if (st.shadow){ c.shadowColor = st.shadow; c.shadowBlur = 10; c.shadowOffsetY = 5; }
  // logo işareti: yuvarlatılmış kare + baş harfler
  const gr = c.createLinearGradient(x0, 25, x0+190, 215); gr.addColorStop(0, st.logo[0]); gr.addColorStop(1, st.logo[1]);
  c.fillStyle = gr; c.beginPath(); c.roundRect(x0, 25, 190, 190, 44); c.fill();
  c.shadowBlur = 0; c.shadowOffsetY = 0;
  c.fillStyle = st.logoTx; c.font = '900 96px Nunito, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ini.toLocaleUpperCase('tr-TR'), x0+95, 126);
  c.strokeStyle = st.logoTx; c.globalAlpha = 0.55; c.lineWidth = 7; c.beginPath(); c.moveTo(x0+40, 176); c.lineTo(x0+150, 176); c.stroke(); c.globalAlpha = 1;
  // şirket adı + alt yazı
  if (st.glow){ c.shadowColor = st.glow; c.shadowBlur = 26; } else if (st.shadow){ c.shadowColor = st.shadow; c.shadowBlur = 8; c.shadowOffsetY = 4; }
  c.textAlign = 'left'; c.fillStyle = st.text; c.font = '900 92px Nunito, system-ui, sans-serif'; c.fillText(name, x0+224, 104, tw);
  c.shadowBlur = 0; c.shadowOffsetY = 0;
  c.fillStyle = st.sub; c.font = '800 36px Nunito, system-ui, sans-serif'; c.fillText('Y A Z I L I M   ·   T E K N O L O J İ', x0+228, 176, tw);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const POS = [[T(1.6)+T(3.2)/2, 2.33, 1.8], [T(3.7), 2.33, 1.6], [T(10.0), 2.2, 2.2], [T(7.55), 1.6, 1.8], [T(11.8), 2.15, 2.9]];
  const [cx, cy, w] = POS[L] || POS[2], h = w*ch/cw;
  if (st.depth) g.add(boxP(w, h, st.depth, M(st.plate), cx, cy, 0.01 + st.depth/2, {outline:.01}));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false}));
  m.position.set(cx, cy, 0.02 + (st.depth||0) + 0.003); m.renderOrder = 3; g.add(m);
  if (st.glow){ const halo = new THREE.Mesh(new THREE.PlaneGeometry(w*1.08, h*1.3), new THREE.MeshBasicMaterial({color:st.glow, transparent:true, opacity:0.1, depthWrite:false})); halo.position.set(cx, cy, 0.015); g.add(halo); }
}function floorLabel(g, x, z, name, L){
  name = String(name).replace(/\s*\(.*?\)\s*/g, '').trim();
  const tex = textTex(name, {w:320, h:80, font:'900 52px Nunito, system-ui, sans-serif', color: L===4 ? 'rgba(255,255,255,.75)' : 'rgba(13,27,92,.72)'});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.325), new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false}));
  m.rotation.x = -Math.PI/2; m.rotation.z = Math.PI/2; m.position.set(T(x), 0.015, T(z)); m.userData.dyn = true; g.add(m);
}
/* =====================================================================
   OFİS TASARIMI v2 – sade, sıcak renkler, gerçekçi oranlar (kendi tasarımımız)
   ===================================================================== */
// ---- dokular ----
function skyTex(){
  return cachedTex('sky2', () => canvasTex(256, 192, (c,w,h) => {
    const gr = c.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#8fc8f5'); gr.addColorStop(1,'#e4f2fc'); c.fillStyle = gr; c.fillRect(0,0,w,h);
    c.fillStyle = 'rgba(255,255,255,.9)'; for (const [x,y,r] of [[44,40,15],[62,34,20],[84,41,14],[176,58,12],[192,52,16],[208,58,11]]){ c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
    let x = 0; while (x < w){ const bw = 14 + Math.random()*26, bh = 26 + Math.random()*58; c.fillStyle = 'rgba(122,150,186,.5)'; c.fillRect(x, h-bh, bw, bh); x += bw + 3; }
  }));
}
function blindTex(){ return cachedTex('blind', () => canvasTex(64, 64, (c,w,h) => { c.fillStyle = '#f3f5f8'; c.fillRect(0,0,w,h); for (let y=0;y<h;y+=6){ c.fillStyle = 'rgba(90,100,120,.22)'; c.fillRect(0,y,w,1.2); } }, [3, 2])); }
function blockTex(len){
  return cachedTex('blk'+len, () => canvasTex(256, 256, (g,w,h) => {
    g.fillStyle = '#c3bdb3'; g.fillRect(0,0,w,h);
    for (let r=0;r<4;r++){ const off = (r%2)*64; for (let k=-1;k<3;k++){ const v = (Math.random()*12-6)|0; g.fillStyle = `rgb(${219+v},${214+v},${205+v})`; g.fillRect(off+k*128+3, r*64+3, 122, 58); } }
    noise(g, w, h, 1500, '255,255,255', '90,80,70');
  }, [len/1.7, 1.5]));
}
function brickTex(len){
  return cachedTex('brk'+len, () => canvasTex(256, 256, (g,w,h) => {
    g.fillStyle = '#d8d0c6'; g.fillRect(0,0,w,h);
    for (let r=0;r<16;r++){ const off = (r%2)*32; for (let k=-1;k<5;k++){ const v = (Math.random()*28-14)|0; g.fillStyle = `rgb(${172+v},${92+(v*0.6|0)},${68+(v*0.4|0)})`; g.fillRect(off+k*64+2, r*16+2, 60, 12); } }
    noise(g, w, h, 1400, '255,255,255', '40,20,10');
  }, [len/2.2, 1.15]));
}
function plankTex(base, ph){
  return canvasTex(256, 256, (g,w,h) => {
    g.fillStyle = `rgb(${base})`; g.fillRect(0,0,w,h); const b = base.split(',').map(Number);
    for (let r=0;r<h/ph;r++){ const off = (r*97)%256; for (let k=-1;k<3;k++){ const v = (Math.random()*20-10)|0; g.fillStyle = `rgb(${b[0]+v},${b[1]+v},${b[2]+v})`; g.fillRect(off+k*150, r*ph, 150, ph); g.fillStyle = 'rgba(80,45,15,.18)'; g.fillRect(off+k*150, r*ph, 1.5, ph); }
      g.fillStyle = 'rgba(80,45,15,.16)'; g.fillRect(0, r*ph, w, 1.2); }
    for (let i=0;i<160;i++){ g.strokeStyle = 'rgba(80,45,15,.07)'; g.beginPath(); const y = Math.random()*h; g.moveTo(Math.random()*w, y); g.lineTo(Math.random()*w, y+Math.random()*2); g.stroke(); }
  });
}
function floorTex(L, W, D){
  return cachedTex('floor2_'+L+'_'+W+'_'+D, () => {
    let t;
    if (L===0) t = canvasTex(256, 256, (g,w,h) => { g.fillStyle = '#bdb8af'; g.fillRect(0,0,w,h); noise(g,w,h,3200,'255,255,255','70,64,58');
      for (let i=0;i<6;i++){ g.fillStyle = 'rgba(70,60,50,.06)'; g.beginPath(); g.ellipse(Math.random()*w, Math.random()*h, 20+Math.random()*40, 10+Math.random()*20, Math.random()*3, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(60,55,50,.3)'; g.fillRect(0,0,w,2); g.fillRect(0,0,2,h); });
    else if (L===1) t = plankTex('132,90,60', 28);
    else if (L===3) t = plankTex('222,190,148', 26);
    else if (L===2) t = canvasTex(256, 256, (g,w,h) => { for (let i=0;i<4;i++) for (let j=0;j<4;j++){ const v = (Math.random()*10-5)|0; g.fillStyle = `rgb(${132+v},${144+v},${166+v})`; g.fillRect(i*64, j*64, 64, 64);
        g.strokeStyle = 'rgba(255,255,255,.06)'; for (let k=4;k<64;k+=5){ g.beginPath(); if ((i+j)%2){ g.moveTo(i*64+k, j*64); g.lineTo(i*64+k, j*64+64); } else { g.moveTo(i*64, j*64+k); g.lineTo(i*64+64, j*64+k); } g.stroke(); } }
      noise(g,w,h,2500,'255,255,255','40,50,70'); g.strokeStyle = 'rgba(40,50,70,.18)'; for (let k=0;k<=w;k+=64){ g.beginPath(); g.moveTo(k,0); g.lineTo(k,h); g.stroke(); g.beginPath(); g.moveTo(0,k); g.lineTo(w,k); g.stroke(); } });
    else t = canvasTex(256, 256, (g,w,h) => { for (let i=0;i<2;i++) for (let j=0;j<2;j++){ const v = (Math.random()*8-4)|0; g.fillStyle = `rgb(${230+v},${232+v},${236+v})`; g.fillRect(i*128, j*128, 128, 128);
        g.strokeStyle = 'rgba(150,158,172,.18)'; g.lineWidth = 1.2; for (let k=0;k<3;k++){ g.beginPath(); let x = i*128 + Math.random()*128, y = j*128; g.moveTo(x,y); for (let s=0;s<6;s++){ x += Math.random()*30-15; y += 22; g.lineTo(x,y); } g.stroke(); } }
      g.fillStyle = '#c9ced6'; for (let k=0;k<=w;k+=128){ g.fillRect(k-1,0,2,h); g.fillRect(0,k-1,w,2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    const rep = L===0 ? 2.8 : L===2 ? 3.2 : L===4 ? 2.6 : 3;
    t.repeat.set(W/rep, D/rep);
    return t;
  });
}
// ---- duvar parçaları ----
function texPanel(g, side, a, b, mat, h=WALL_H-0.02){   // duvara dokulu kaplama (tuğla vb.)
  if (side==='back') g.add(boxP(T(b-a), h, 0.012, mat, T(a)+T(b-a)/2, h/2, 0.008));
  else g.add(boxP(0.012, h, T(b-a), mat, 0.008, h/2, T(a)+T(b-a)/2));
}
function wainscot(g, side, a, b, col, h=0.95){        // alt duvar lambrisi + bordür
  const len = T(b-a), c = T(a)+len/2, m = M(col), rail = M(new THREE.Color(col).multiplyScalar(0.86).getStyle());
  if (side==='back'){ g.add(boxP(len, h, 0.02, m, c, h/2, 0.012)); g.add(boxP(len, 0.05, 0.05, rail, c, h, 0.025)); for (let x=T(a)+0.45; x<T(b)-0.1; x+=0.6) g.add(boxP(0.014, h-0.28, 0.01, rail, x, h/2+0.02, 0.026)); }
  else { g.add(boxP(0.02, h, len, m, 0.012, h/2, c)); g.add(boxP(0.05, 0.05, len, rail, 0.025, h, c)); for (let z=T(a)+0.45; z<T(b)-0.1; z+=0.6) g.add(boxP(0.01, h-0.28, 0.014, rail, 0.026, h/2+0.02, z)); }
}
function winBack(g, a, b, o={}){                       // arka duvarda pencere (gökyüzü görünür)
  const x0 = T(a), x1 = T(b), w = x1-x0, cx = (x0+x1)/2, y0 = 0.9, y1 = 2.12, h = y1-y0, cy = (y0+y1)/2;
  g.add(boxP(w, h, 0.02, new THREE.MeshBasicMaterial({map:skyTex()}), cx, cy, 0.02));
  const fr = M(o.frame || '#ffffff');
  g.add(boxP(w+0.1, 0.06, 0.08, fr, cx, y1+0.03, 0.05, {outline:.02}));
  g.add(boxP(w+0.18, 0.05, 0.17, fr, cx, y0-0.025, 0.09, {outline:.02}));
  for (const x of [x0-0.025, x1+0.025]) g.add(boxP(0.05, h, 0.08, fr, x, cy, 0.05));
  const n = Math.max(1, Math.round(w/0.9)); for (let i=1;i<n;i++) g.add(boxP(0.035, h, 0.05, fr, x0 + w*i/n, cy, 0.045));
  if (o.blinds) g.add(boxP(w, h*0.34, 0.012, M('#ffffff', {map:blindTex()}), cx, y1 - h*0.17, 0.075));
  if (o.curtain){ const cm = M(o.curtain), cd = M(new THREE.Color(o.curtain).multiplyScalar(0.85).getStyle());
    for (const [x, s] of [[x0-0.14, -1], [x1+0.14, 1]]) for (let i=0;i<3;i++) g.add(boxP(0.085, 1.6, 0.06, i%2 ? cd : cm, x + s*(i-1)*0.075, 1.36, 0.1 + (i%2)*0.02));
    const rod = cylP(0.014, w+0.6, M('#6b4f36'), cx, 2.2, 0.1); rod.rotation.z = Math.PI/2; g.add(rod); }
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), new THREE.MeshBasicMaterial({color:0xfff6dc, transparent:true, opacity:0.16, depthWrite:false}));
  patch.rotation.x = -Math.PI/2; patch.position.set(cx+0.15, 0.013, 0.62); patch.castShadow = false; g.add(patch);
}
function winLeft(g, a, b, o={}){
  const z0 = T(a), z1 = T(b), w = z1-z0, cz = (z0+z1)/2, y0 = 0.9, y1 = 2.12, h = y1-y0, cy = (y0+y1)/2;
  g.add(boxP(0.02, h, w, new THREE.MeshBasicMaterial({map:skyTex()}), 0.02, cy, cz));
  const fr = M(o.frame || '#ffffff');
  g.add(boxP(0.08, 0.06, w+0.1, fr, 0.05, y1+0.03, cz, {outline:.02})); g.add(boxP(0.17, 0.05, w+0.18, fr, 0.09, y0-0.025, cz, {outline:.02}));
  for (const z of [z0-0.025, z1+0.025]) g.add(boxP(0.08, h, 0.05, fr, 0.05, cy, z));
  const n = Math.max(1, Math.round(w/0.9)); for (let i=1;i<n;i++) g.add(boxP(0.05, h, 0.035, fr, 0.045, cy, z0 + w*i/n));
}
const GLASS = new THREE.MeshPhongMaterial({color:0xd6ecff, transparent:true, opacity:0.2, shininess:90, depthWrite:false});
function glassWall(g, x0, z0, x1, z1, frameCol='#2f3340', h=2.25){   // cam bölme (kare koordinatı)
  const ax = T(Math.min(x0,x1)), az = T(Math.min(z0,z1)), alongX = Math.abs(x1-x0) > Math.abs(z1-z0);
  const len = alongX ? T(Math.abs(x1-x0)) : T(Math.abs(z1-z0)), cx = alongX ? ax+len/2 : T(x0), cz = alongX ? T(z0) : az+len/2, fr = M(frameCol);
  const gl = boxP(alongX?len:0.025, h, alongX?0.025:len, GLASS, cx, h/2, cz); gl.castShadow = false; g.add(gl);
  for (const y of [h, 0.025]) g.add(boxP(alongX?len:0.05, 0.05, alongX?0.05:len, fr, cx, y, cz));
  const n = Math.max(1, Math.round(len/1.1));
  for (let i=0;i<=n;i++){ const t = len*i/n; g.add(boxP(0.045, h, 0.045, fr, alongX ? ax+t : cx, h/2, alongX ? cz : az+t)); }
  const band = boxP(alongX?len:0.03, 0.1, alongX?0.03:len, M('#eef4fb'), cx, 1.05, cz); band.castShadow = false; g.add(band);
}
function doorSign(g, x, z, text, rotY=0){
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.16), new THREE.MeshBasicMaterial({map: textTex(text, {w:256, h:64, font:'900 34px Nunito, sans-serif', color:'#ffffff', bg:'#1f2a44', r:10}), transparent:true}));
  sg.position.set(T(x), 2.45, T(z)+0.03); sg.rotation.y = rotY; g.add(sg);
}
// ---- mobilyalar ----
function chairAtM(g, x, z, rotY, tier=1, sc=0.92){ const c = new THREE.Group(); buildChair(c, tier); c.position.set(x, 0, z); c.rotation.y = rotY; c.scale.setScalar(sc); g.add(c); }
function filingCabinet(g, x, z, col='#b9c0cc'){
  const cx = T(x)+0.23, cz = T(z)+0.3, m = M(col), d = M(new THREE.Color(col).multiplyScalar(0.78).getStyle());
  g.add(rbox(0.46, 1.05, 0.56, 0.015, m, cx, 0.525, cz, {outline:.012}));
  for (let i=0;i<3;i++){ g.add(boxP(0.42, 0.012, 0.01, d, cx, 0.36+i*0.33, cz+0.282)); g.add(boxP(0.12, 0.025, 0.02, M('#5b6474'), cx, 0.25+i*0.33, cz+0.29)); }
  g.add(cylP(0.05, 0.1, M('#2f54eb'), cx-0.1, 1.1, cz)); g.add(boxP(0.18, 0.04, 0.24, M('#f8fafc'), cx+0.08, 1.07, cz));
}
function printer(g, x, z){
  const cx = T(x)+0.3, cz = T(z)+0.28;
  g.add(rbox(0.6, 0.7, 0.5, 0.015, M('#d9dde4'), cx, 0.35, cz, {outline:.012}));
  g.add(rbox(0.52, 0.28, 0.44, 0.03, M('#f5f6f8'), cx, 0.84, cz, {outline:.02}));
  g.add(boxP(0.4, 0.04, 0.3, M('#3b4252'), cx, 0.99, cz-0.02));
  g.add(boxP(0.3, 0.012, 0.18, M('#ffffff'), cx, 0.76, cz+0.24));
  g.add(boxP(0.08, 0.03, 0.01, new THREE.MeshBasicMaterial({color:0x34d399}), cx+0.17, 0.9, cz+0.225));
}
function meetingTable(g, x, z, len, dep, o={}){         // x,z: sol-arka köşe (kare)
  const wl = T(len), dl = T(dep), cx = T(x)+wl/2, cz = T(z)+dl/2;
  const top = M(o.top || '#e2cba6'), leg = M(o.leg || '#2f3340');
  g.add(rbox(wl, 0.05, dl, 0.02, top, cx, 0.74, cz, {outline:.01}));
  for (const s of [-1,1]){ g.add(boxP(0.07, 0.7, dl*0.5, leg, cx + s*(wl/2-0.35), 0.36, cz)); g.add(boxP(0.45, 0.03, dl*0.6, leg, cx + s*(wl/2-0.35), 0.015, cz)); }
  const n = Math.max(1, Math.floor(wl/0.78));
  for (let i=0;i<n;i++){ const px = cx - wl/2 + wl*(i+0.5)/n;
    chairAtM(g, px, cz - dl/2 - 0.3, Math.PI, o.tier ?? 1); chairAtM(g, px, cz + dl/2 + 0.3, 0, o.tier ?? 1);
    g.add(boxP(0.21, 0.004, 0.28, M('#ffffff'), px + 0.05, 0.768, cz - dl/2 + 0.22)); }
  g.add(rbox(0.32, 0.015, 0.22, 0.006, M('#9aa3b2'), cx - 0.3, 0.775, cz + dl/2 - 0.25));
  g.add(cylP(0.09, 0.03, M('#1f2937'), cx, 0.78, cz));
}
function armchair(g, x, z, col, rotY=0){
  const c = new THREE.Group(); c.position.set(T(x), 0, T(z)); c.rotation.y = rotY;
  const m = M(col), md = M(new THREE.Color(col).multiplyScalar(0.8).getStyle());
  c.add(rbox(0.8, 0.2, 0.75, 0.06, md, 0, 0.19, 0, {outline:.02})); c.add(rbox(0.6, 0.12, 0.58, 0.06, m, 0, 0.35, 0.05, {outline:.02}));
  c.add(rbox(0.8, 0.5, 0.16, 0.07, m, 0, 0.52, -0.3, {outline:.02})); for (const s of [-1,1]) c.add(rbox(0.14, 0.34, 0.72, 0.06, md, s*0.36, 0.38, 0, {outline:.03}));
  for (const [dx,dz] of [[-.32,-.3],[.32,-.3],[-.32,.3],[.32,.3]]) c.add(boxP(0.04, 0.09, 0.04, M('#3b2a1c'), dx, 0.045, dz));
  g.add(c);
}
function floorLamp(g, x, z){
  const cx = T(x), cz = T(z);
  g.add(cylP(0.14, 0.03, M('#2f3340'), cx, 0.015, cz)); g.add(cylP(0.014, 1.42, M('#2f3340'), cx, 0.73, cz));
  const sh = mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.27, 16), M('#f6ecd8'), {outline:.03}); sh.position.set(cx, 1.5, cz); g.add(sh);
}
function sideTable(g, x, z, lamp=true){
  const cx = T(x), cz = T(z);
  g.add(rbox(0.42, 0.5, 0.38, 0.02, M('#a7774d'), cx, 0.25, cz, {outline:.015})); g.add(boxP(0.36, 0.01, 0.01, M('#6b4a2e'), cx, 0.32, cz+0.19));
  if (lamp){ g.add(cylP(0.06, 0.22, M('#d9c8a9'), cx, 0.61, cz)); const sh = mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.15, 14), M('#fbf3e2'), {outline:.04}); sh.position.set(cx, 0.79, cz); g.add(sh); }
}
function tallPlant(g, x, z, sc=1){
  const p = new THREE.Group(); p.position.set(T(x)+0.2, 0, T(z)+0.2); p.scale.setScalar(sc);
  p.add(cylP(0.17, 0.42, M('#e8e4dc'), 0, 0.21, 0, {outline:.03})); p.add(cylP(0.155, 0.02, M('#4a3626'), 0, 0.42, 0));
  p.add(cylP(0.018, 0.95, M('#6b4a2e'), 0, 0.88, 0));
  for (let i=0;i<13;i++){ const a = i*2.4, y = 0.78 + i*0.07, r = 0.1 + (i%3)*0.03;
    const l = sphP(0.085, 0.025, 0.14, M(i%2 ? '#3f8f5a' : '#52ac6d'), Math.cos(a)*r, y, Math.sin(a)*r, {outline:.05}); l.rotation.set(0.45*Math.sin(a), -a, 0.35); p.add(l); }
  g.add(p);
}
function kitchenIsland(g, x, z, len){
  const l = T(len), cx = T(x)+l/2, cz = T(z)+0.35;
  g.add(boxP(l, 0.88, 0.6, M('#33394a'), cx, 0.44, cz, {outline:.01}));
  g.add(boxP(l+0.12, 0.05, 0.78, M('#f1ede6'), cx, 0.905, cz+0.06, {outline:.01}));
  const n = Math.max(2, Math.floor(l/0.62));
  for (let i=0;i<n;i++){ const sx = cx - l/2 + l*(i+0.5)/n;
    g.add(cylP(0.16, 0.05, M('#c9a16b'), sx, 0.68, cz+0.66, {outline:.04})); g.add(cylP(0.02, 0.66, M('#33394a'), sx, 0.33, cz+0.66)); g.add(cylP(0.14, 0.015, M('#33394a'), sx, 0.008, cz+0.66)); }
  g.add(cylP(0.12, 0.06, M('#ffffff'), cx - l*0.28, 0.96, cz));
  for (const [c,dx,dz] of [['#f59e0b',-.04,.02],['#ef4444',.04,.02],['#84cc16',0,-.03]]) g.add(sphP(0.04, 0.04, 0.04, M(c), cx - l*0.28 + dx, 1.0, cz + dz));
  g.add(cylP(0.035, 0.09, M('#2f54eb'), cx + l*0.18, 0.975, cz)); g.add(cylP(0.035, 0.09, M('#f472b6'), cx + l*0.24, 0.975, cz+0.08));
  // arkadaki tezgâh: kahve makinesi ve dolap
  g.add(rbox(0.3, 0.38, 0.28, 0.02, M('#1f2937'), cx + l*0.36, 1.12, cz - 0.08, {outline:.03}));
}
function pingPong(g, x, z){
  const cx = T(x)+0.95, cz = T(z)+0.54;
  const tex = canvasTex(256, 144, (c,w,h) => { c.fillStyle = '#1e4f8a'; c.fillRect(0,0,w,h); c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.strokeRect(2,2,w-4,h-4); c.lineWidth = 2; c.beginPath(); c.moveTo(4,h/2); c.lineTo(w-4,h/2); c.stroke(); });
  g.add(boxP(1.9, 0.04, 1.07, M('#ffffff', {map:tex}), cx, 0.76, cz, {outline:.01}));
  for (const [dx,dz] of [[-.8,-.4],[.8,-.4],[-.8,.4],[.8,.4]]) g.add(boxP(0.05, 0.74, 0.05, M('#2f3340'), cx+dx, 0.37, cz+dz));
  g.add(boxP(0.02, 0.15, 1.15, M('#e5e7eb'), cx, 0.855, cz));
  g.add(cylP(0.075, 0.012, M('#ef4444'), cx-0.55, 0.785, cz+0.15)); g.add(cylP(0.075, 0.012, M('#111827'), cx+0.5, 0.785, cz-0.2)); g.add(sphP(0.02, 0.02, 0.02, M('#ffffff'), cx+0.2, 0.8, cz));
}
function tireStack(g, x, z){
  const geo = new THREE.TorusGeometry(0.24, 0.1, 8, 18);
  for (let i=0;i<3;i++){ const t = part(geo, M('#24262d'), 1, 1, 1, T(x) + (i%2)*0.03, 0.1 + i*0.2, T(z)); t.rotation.x = Math.PI/2; g.add(t); }
}
function paintCans(g, x, z){ for (const [dx,dz,c] of [[0,0,'#ef4444'],[0.24,0.05,'#2f54eb'],[0.1,0.24,'#f8fafc']]){ g.add(cylP(0.1, 0.22, M('#cbd5e1'), T(x)+dx, 0.11, T(z)+dz, {outline:.04})); g.add(boxP(0.12, 0.07, 0.005, M(c), T(x)+dx, 0.12, T(z)+dz+0.1)); } }
function washer(g, x, z){
  const cx = T(x)+0.3, cz = T(z)+0.3;
  g.add(rbox(0.6, 0.85, 0.6, 0.03, M('#f4f5f7'), cx, 0.425, cz, {outline:.015}));
  const door = cylP(0.19, 0.03, M('#9fb3c8'), cx+0.3, 0.42, cz); door.rotation.z = Math.PI/2; g.add(door);
  const ring = part(G.torus, M('#cbd5e1'), 0.19, 0.19, 0.19, cx+0.31, 0.42, cz); ring.rotation.y = Math.PI/2; g.add(ring);
  g.add(boxP(0.02, 0.08, 0.4, M('#d9dde4'), cx+0.3, 0.76, cz));
}
function miniFridge(g, x, z){ const cx = T(x)+0.25, cz = T(z)+0.25; g.add(rbox(0.5, 0.85, 0.5, 0.03, M('#e9edf2'), cx, 0.425, cz, {outline:.015})); g.add(boxP(0.02, 0.3, 0.04, M('#94a3b8'), cx+0.26, 0.55, cz-0.15)); g.add(boxP(0.18, 0.1, 0.01, M('#fde047'), cx+0.26, 0.7, cz+0.05)); }
function nightstand(g, x, z){ sideTable(g, x, z, true); }
function corkBoard(g, a, w=1.3){
  poster(g, 'left', a, w, 0.75, 1.5, (c,cw,ch) => { c.fillStyle = '#c79a63'; c.fillRect(0,0,cw,ch); noise(c,cw,ch,500,'255,240,210','90,60,30');
    const cols = ['#fde047','#f9a8d4','#86efac','#93c5fd','#ffffff']; for (let i=0;i<7;i++){ c.fillStyle = cols[i%cols.length]; const x = 10 + (i%4)*36, y = 10 + Math.floor(i/4)*42; c.fillRect(x, y, 28, 30); c.fillStyle = '#ef4444'; c.beginPath(); c.arc(x+14, y+3, 3, 0, 7); c.fill(); }
    c.strokeStyle = '#6b4a2e'; c.lineWidth = 8; c.strokeRect(0,0,cw,ch); });
}
const ART_SETS = [['#e9c46a','#2a9d8f','#264653'], ['#f4a261','#e76f51','#2a9d8f'], ['#8ecae6','#219ebc','#023047'], ['#d4a373','#ccd5ae','#606c38']];
function skylineWalls(g, W, D){   // gökdelen: yerden tavana cam, gündüz şehir manzarası
  const tex = () => canvasTex(512, 200, (c,w,h) => {
    const gr = c.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#84c2f2'); gr.addColorStop(1,'#e8f4fd'); c.fillStyle = gr; c.fillRect(0,0,w,h);
    c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x,y,r] of [[80,40,16],[100,34,22],[124,42,15],[330,30,12],[348,26,17],[366,32,12]]){ c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
    for (const [col, minH, maxH, winA] of [['#b9cbe0', 50, 120, .25], ['#8aa2c0', 30, 90, .4]]){ let x = 0;
      while (x < w){ const bw = 22 + Math.random()*40, bh = minH + Math.random()*(maxH-minH); c.fillStyle = col; c.fillRect(x, h-bh, bw, bh); c.fillStyle = `rgba(255,255,255,${winA})`;
        for (let yy = h-bh+6; yy < h-4; yy += 9) for (let xx = x+4; xx < x+bw-4; xx += 7) c.fillRect(xx, yy, 3, 4); x += bw + 4; } }
  });
  const hh = WALL_H - 0.1;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(T(W), hh), new THREE.MeshBasicMaterial({map:tex()})); back.position.set(T(W)/2, hh/2+0.05, 0.02); g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(T(D), hh), new THREE.MeshBasicMaterial({map:tex()})); left.rotation.y = Math.PI/2; left.position.set(0.02, hh/2+0.05, T(D)/2); g.add(left);
  const fr = M('#2b303b');
  for (let x = 0; x <= T(W)+0.01; x += 1.6) g.add(boxP(0.07, WALL_H, 0.07, fr, Math.min(x, T(W)-0.035), WALL_H/2, 0.05));
  for (let z = 0; z <= T(D)+0.01; z += 1.6) g.add(boxP(0.07, WALL_H, 0.07, fr, 0.05, WALL_H/2, Math.min(z, T(D)-0.035)));
  for (const y of [0.06, 1.0, WALL_H-0.04]){ g.add(boxP(T(W), 0.05, 0.06, fr, T(W)/2, y, 0.05)); g.add(boxP(0.06, 0.05, T(D), fr, 0.05, y, T(D)/2)); }
}
function deskRug(g, seats, col){
  const rows = [...new Set(seats.map(s => s.y))];
  rows.forEach(y => { const xs = seats.filter(s => s.y===y).map(s => s.x); if (!xs.length) return;
    const r = new THREE.Mesh(new THREE.PlaneGeometry(T(Math.max(...xs)+2.0 - (Math.min(...xs)-0.15)), T(1.95)), M(col)); r.rotation.x = -Math.PI/2;
    r.position.set((T(Math.min(...xs)-0.15) + T(Math.max(...xs)+2.0))/2, 0.009, T(y-0.2) + T(1.95)/2); r.receiveShadow = true; g.add(r); });
}
function vacuum(g, a, b, z){
  const vac = new THREE.Group(); vac.userData.dyn = true;
  vac.add(cylP(0.17, 0.07, M('#5b6170'), 0, 0.04, 0, {outline:.04})); vac.add(cylP(0.15, 0.02, M('#2f3340'), 0, 0.085, 0)); vac.add(sphP(0.02, 0.02, 0.02, new THREE.MeshBasicMaterial({color:0x34d399}), 0.08, 0.1, 0));
  g.add(vac); animated.push({vac, a:T(a), b:T(b), z:T(z)});
}
const DIVIDERS = [null, null, '#55627d', '#3f4654', '#c9d0da'];
// ---- garaj için kendi eşyalarımız ----
function fairyLights(g, pts){       // duvar boyunca sarkan süs ampulleri
  const cols = [0xfde68a, 0xfca5a5, 0x93c5fd, 0x86efac, 0xfdba74];
  for (let s=0;s<pts.length-1;s++){ const a = pts[s], b = pts[s+1], n = Math.max(4, Math.round(a.distanceTo(b)/0.22));
    for (let i=0;i<n;i++){ const t = i/n, p = a.clone().lerp(b, t); p.y -= Math.sin(t*Math.PI)*0.18;
      const bulb = sphP(0.028, 0.036, 0.028, new THREE.MeshBasicMaterial({color:cols[(s*7+i)%cols.length]}), p.x, p.y, p.z); bulb.castShadow = false; g.add(bulb);
      if (i < n){ const q = a.clone().lerp(b, (i+1)/n); q.y -= Math.sin((i+1)/n*Math.PI)*0.18; const w = mesh(capsule(0.004), M('#3a3a40')); placeLimb(w, p, q); w.castShadow = false; g.add(w); } } }
}
function flipChart(g, x, z){        // sehpa üstünde fikir panosu
  const cx = T(x), cz = T(z), grp = new THREE.Group(); grp.position.set(cx, 0, cz); grp.rotation.y = -0.35;
  for (const [dx,dz] of [[-0.3,0.12],[0.3,0.12],[0,-0.25]]){ const l = mesh(capsule(0.016), M('#8a6a4a')); placeLimb(l, V(dx, 0, dz), V(dx*0.5, 1.55, dz*0.3)); grp.add(l); }
  const tex = canvasTex(160, 200, (c,w,h) => { c.fillStyle = '#fffdf6'; c.fillRect(0,0,w,h);
    c.strokeStyle = '#2f54eb'; c.lineWidth = 3; c.strokeRect(20,26,52,80); c.strokeRect(90,26,52,80); c.beginPath(); c.moveTo(72,66); c.lineTo(90,66); c.stroke();
    c.strokeStyle = '#ef4444'; c.beginPath(); c.arc(46,140,16,0,7); c.stroke(); c.fillStyle = '#1f2937'; c.font = 'bold 18px sans-serif'; c.fillText('v1.0 ?', 82, 148);
    c.fillStyle = '#9aa3b2'; for (let i=0;i<4;i++) c.fillRect(26, 36+i*12, 30+(i%2)*10, 4); c.fillStyle = '#16a34a'; c.fillRect(96, 40, 40, 30); });
  const board = boxP(0.66, 0.86, 0.02, M('#ffffff', {map:tex}), 0, 1.15, 0.02, {outline:.02}); board.rotation.x = -0.1; grp.add(board);
  grp.add(boxP(0.7, 0.04, 0.06, M('#5b6474'), 0, 0.7, 0.07));
  g.add(grp);
}
function crateTV(g, x, z){          // tahta kasalar + eski tüplü TV + oyun konsolu
  const cx = T(x), cz = T(z), wood = M('#b98b55'), dk = M('#8a6338');
  for (const [dx,y] of [[0,0],[0,0.36]]){ g.add(boxP(0.62, 0.34, 0.42, wood, cx+dx, y+0.17, cz, {outline:.015})); for (const yy of [0.08, 0.26]) g.add(boxP(0.63, 0.035, 0.43, dk, cx+dx, y+yy, cz)); }
  g.add(rbox(0.5, 0.4, 0.38, 0.04, M('#3b3b44'), cx, 0.92, cz-0.02, {outline:.02}));
  g.add(boxP(0.4, 0.3, 0.01, new THREE.MeshBasicMaterial({map: canvasTex(64, 48, (c,w,h) => { c.fillStyle = '#1e3a8a'; c.fillRect(0,0,w,h); c.fillStyle = '#fde047'; c.fillRect(8,30,10,10); c.fillStyle = '#f472b6'; c.fillRect(40,18,8,8); c.fillStyle = '#4ade80'; c.fillRect(0,40,w,8); })}), cx, 0.93, cz+0.18));
  for (const s of [-1,1]){ const ant = mesh(capsule(0.006), M('#9aa3b2')); placeLimb(ant, V(cx, 1.12, cz-0.02), V(cx+s*0.18, 1.38, cz-0.06)); g.add(ant); }
  g.add(rbox(0.24, 0.05, 0.16, 0.015, M('#d8d4cc'), cx+0.5, 0.025, cz+0.2, {outline:.04}));
  g.add(rbox(0.1, 0.025, 0.06, 0.012, M('#4b5563'), cx+0.42, 0.012, cz+0.42, {outline:.06}));
}
function dartBoard(g, z){
  const tex = canvasTex(128, 128, (c,w,h) => { const cols = ['#1f2937','#f8f1e0']; for (let i=0;i<20;i++){ c.fillStyle = cols[i%2]; c.beginPath(); c.moveTo(64,64); c.arc(64,64,60,i*Math.PI/10,(i+1)*Math.PI/10); c.fill(); }
    c.strokeStyle = '#dc2626'; c.lineWidth = 6; c.beginPath(); c.arc(64,64,40,0,7); c.stroke(); c.strokeStyle = '#16a34a'; c.beginPath(); c.arc(64,64,24,0,7); c.stroke(); c.fillStyle = '#dc2626'; c.beginPath(); c.arc(64,64,6,0,7); c.fill(); });
  const d = cylP(0.22, 0.04, M('#ffffff', {map:tex}), 0.05, 1.62, T(z), {outline:.03}); d.rotation.z = Math.PI/2; g.add(d);
  for (const [dy,dz] of [[0.05,0.03],[-0.06,-0.08]]){ const dart = boxP(0.12, 0.012, 0.012, M('#ef4444'), 0.12, 1.62+dy, T(z)+dz); g.add(dart); }
}
function pizzaBoxes(g, x, z){ for (let i=0;i<3;i++){ const b = boxP(0.36, 0.045, 0.36, M('#e8d3ad'), T(x)+(i%2)*0.03, 0.025+i*0.047, T(z)-(i%2)*0.02, {outline:.02}); b.rotation.y = i*0.25; g.add(b); const l = boxP(0.14, 0.002, 0.08, M('#dc2626'), T(x)+(i%2)*0.03, 0.05+i*0.047, T(z)-(i%2)*0.02); l.rotation.y = i*0.25; g.add(l); } }

// ---- renk ve detay: her ofisin vurgu renkleri, boyalı duvar, tablolar, raflar, neon ----
const ACCENTS = [
  ['#f59e0b','#ef4444','#2f54eb'],            // garaj: sıcak turuncu
  ['#14b8a6','#f472b6','#fbbf24'],            // stüdyo: turkuaz-pembe
  ['#2f54eb','#fbbf24','#10b981'],            // ofis: kurumsal mavi + sarı
  ['#2f54eb','#f7735a','#a855f7','#fbbf24'],  // büyük ofis: çok renkli bölgeler
  ['#22d3ee','#f472b6','#a855f7'],            // gökdelen: neon
];
function artTex(cols, seed){
  return canvasTex(160, 120, (c,w,h) => {
    c.fillStyle = '#fffaf0'; c.fillRect(0,0,w,h); let r = seed;
    for (let i=0;i<6;i++){ r = (r*9301+49297)%233280; c.fillStyle = cols[i%cols.length]; c.globalAlpha = 0.85;
      const k = r%3; if (k===0){ c.beginPath(); c.arc(r%w, (r>>3)%h, 14+r%30, 0, 7); c.fill(); } else if (k===1) c.fillRect(r%w-20, (r>>4)%h-10, 30+r%50, 18+r%30); else { c.beginPath(); c.moveTo(r%w,(r>>2)%h); c.lineTo((r>>1)%w,h); c.lineTo(w,(r>>5)%h); c.fill(); } }
    c.globalAlpha = 1; c.strokeStyle = '#1f2937'; c.lineWidth = 8; c.strokeRect(0,0,w,h);
  });
}
function frameArt(g, side, a, w, h, y, cols, seed){   // duvarda çerçeveli tablo
  const tex = artTex(cols, seed);
  if (side==='back'){ g.add(boxP(T(w)+0.06, h+0.06, 0.04, M('#1f2937'), T(a)+T(w)/2, y, 0.03, {outline:.02})); g.add(boxP(T(w), h, 0.02, M('#ffffff', {map:tex}), T(a)+T(w)/2, y, 0.055)); }
  else { g.add(boxP(0.04, h+0.06, T(w)+0.06, M('#1f2937'), 0.03, y, T(a)+T(w)/2, {outline:.02})); const p = boxP(0.02, h, T(w), M('#ffffff', {map:tex}), 0.055, y, T(a)+T(w)/2); g.add(p); }
}
function paintWall(g, side, a, b, col){        // vurgu renginde boyalı duvar parçası
  if (side==='back') g.add(boxP(T(b-a), WALL_H-0.2, 0.012, M(col), T(a)+T(b-a)/2, (WALL_H-0.2)/2+0.14, 0.008));
  else g.add(boxP(0.012, WALL_H-0.2, T(b-a), M(col), 0.008, (WALL_H-0.2)/2+0.14, T(a)+T(b-a)/2));
}
function wallShelf(g, z, len, cols){           // sol duvarda kitap + bitki rafı
  const z0 = T(z), l = T(len);
  g.add(boxP(0.26, 0.04, l, M('#9b7652'), 0.15, 1.62, z0+l/2, {outline:.02}));
  let zz = z0 + 0.06; let k = 0;
  while (zz < z0 + l - 0.1){ const bw = 0.04 + (k%3)*0.015, bh = 0.18 + (k%4)*0.03; g.add(boxP(0.16, bh, bw, M(cols[k%cols.length]), 0.13, 1.64+bh/2, zz)); zz += bw + 0.01; k++; if (k===6){ zz += 0.08; g.add(cylP(0.05, 0.08, M('#e07a5f'), 0.14, 1.68, zz)); g.add(sphP(0.07, 0.06, 0.07, M('#4ca86b'), 0.14, 1.77, zz, {outline:.05})); zz += 0.14; } }
}
function wallClock(g, x){
  const c = new THREE.Group(); c.position.set(T(x), 2.05, 0.04);
  c.add(cylP(0.16, 0.04, M('#ffffff'), 0, 0, 0, {outline:.05})); c.children[0].rotation.x = Math.PI/2;
  c.add(boxP(0.012, 0.11, 0.01, M('#1f2937'), 0, 0.045, 0.025)); const mh = boxP(0.012, 0.08, 0.01, M('#ef4444'), 0.03, 0.01, 0.026); mh.rotation.z = -1.2; c.add(mh);
  g.add(c);
}
function neonSign(g, x, text, col){
  const tex = canvasTex(512, 128, (c,w,h) => { c.font = '900 72px Nunito, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = col; c.shadowBlur = 24; c.fillStyle = col; c.fillText(text, w/2, h/2); c.shadowBlur = 0; c.fillStyle = '#ffffff'; c.globalAlpha = 0.85; c.fillText(text, w/2, h/2); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false}));
  m.position.set(T(x), 1.95, 0.05); g.add(m);
}
function carpet(g, x0, z0, x1, z1, col){
  const r = new THREE.Mesh(new THREE.PlaneGeometry(x1-x0, z1-z0), M(col)); r.rotation.x = -Math.PI/2; r.position.set((x0+x1)/2, 0.008, (z0+z1)/2); r.receiveShadow = true; g.add(r);
}
function decorate(g, L, W, D, seats){
  const A = ACCENTS[L];
  if (L===0){
    paintWall(g, 'left', 0.2, 3.3, '#fde7c7');
    frameArt(g, 'left', 0.5, 0.9, 0.5, 1.75, A, 7);
    wallShelf(g, 1.2, 1.6, A.concat(['#64748b']));
  } else if (L===1){
    paintWall(g, 'back', 0.15, 1.1, A[0]); paintWall(g, 'left', 3.3, D-1.6, '#fde2ec');
    frameArt(g, 'back', 3.05, 1.0, 0.6, 1.6, A, 11);
    wallClock(g, 6.9);
  } else {
    const nWin = L===2 ? 3 : 4, span = (W-2)/nWin;
    // pencereler arasına renkli boyalı paneller ve tablolar
    for (let i=0;i<=nWin;i++){ const a = 1 + i*span - span*0.25, b = a + span*0.4; if (a > 0.3 && b < W-0.3 && L!==4){ paintWall(g, 'back', a, b, A[i%A.length]); frameArt(g, 'back', a+0.1, Math.min(0.8, b-a-0.2), 0.55, 1.55, A, 13+i); } }
    if (L!==4){ wallShelf(g, 0.9, 1.6, A.concat(['#64748b','#e2e8f0'])); wallClock(g, W/2+1.6); }
    // masa gruplarının altına halı bölgeleri (her sıra ayrı renk tonu)
    const rows = [...new Set(seats.map(s => s.y))];
    rows.forEach((y, k) => { const xs = seats.filter(s => s.y===y).map(s => s.x); if (!xs.length) return;
      const tint = L===4 ? ['#2a2450','#2f2a5c'][k%2] : ['#dbe7f7','#e6eefb','#e3ecf8'][k%3];
      carpet(g, T(Math.min(...xs)-0.1), T(y-0.2), T(Math.max(...xs)+1.9), T(y+1.75), tint); });
    if (L>=3) neonSign(g, W/2 - 3.2, '</> ' + (S.name.length > 10 ? 'KOD' : S.name), A[0]);
  }
}
// masa başı kişisel eşyalar (her masa farklı): kupa, sukulent, fotoğraf, oyuncak robot, kitap, yapışkan notlar
function deskItems(g, dz, dw, idx, L){
  const h = hashN(idx*53+11), cols = ['#ef4444','#f59e0b','#2f54eb','#10b981','#a855f7','#ec4899','#0ea5e9'];
  const x0 = -dw/2 + 0.17;
  const kind = h % 5;
  if (kind===0){ g.add(cylP(0.036, 0.085, M(cols[(h>>3)%7]), x0, 0.81, dz+0.18, {outline:.06})); g.add(part(G.torus, M(cols[(h>>3)%7]), 0.022, 0.022, 0.022, x0+0.04, 0.81, dz+0.18)); }
  else if (kind===1){ g.add(cylP(0.045, 0.06, M('#f1f5f9'), x0, 0.8, dz+0.1, {outline:.06})); for (let i=0;i<5;i++){ const a = i*1.25; const lf = sphP(0.02, 0.05, 0.02, M('#4ca86b'), x0+Math.cos(a)*0.02, 0.86, dz+0.1+Math.sin(a)*0.02); lf.rotation.z = Math.cos(a)*0.5; lf.rotation.x = Math.sin(a)*0.5; g.add(lf); } }
  else if (kind===2){ const fr = boxP(0.12, 0.1, 0.015, M('#1f2937'), x0, 0.82, dz-0.05, {outline:.05}); fr.rotation.y = 0.5; fr.rotation.x = -0.2; g.add(fr); const ph = boxP(0.1, 0.08, 0.004, M(cols[(h>>2)%7]), x0+0.004, 0.82, dz-0.04); ph.rotation.y = 0.5; ph.rotation.x = -0.2; g.add(ph); }
  else if (kind===3){ g.add(rbox(0.05, 0.06, 0.05, 0.015, M('#94a3b8'), x0, 0.8, dz+0.1, {outline:.08})); g.add(sphP(0.03, 0.028, 0.03, M('#cbd5e1'), x0, 0.855, dz+0.1)); g.add(sphP(0.008, 0.008, 0.008, new THREE.MeshBasicMaterial({color:0x22d3ee}), x0+0.012, 0.86, dz+0.128)); g.add(sphP(0.008, 0.008, 0.008, new THREE.MeshBasicMaterial({color:0x22d3ee}), x0-0.012, 0.86, dz+0.128)); }
  else { for (let i=0;i<3;i++) g.add(boxP(0.16, 0.03, 0.22, M(cols[(h+i)%7]), x0+0.02, 0.785+i*0.03, dz+0.02+(i%2)*0.01)); }
  // monitörde yapışkan not
  if ((h>>5)%2) { const n = boxP(0.05, 0.05, 0.003, M(['#fde047','#f9a8d4','#86efac'][(h>>6)%3]), 0.27, 1.03, dz-0.12); n.rotation.z = 0.1; g.add(n); }
  // ofis ve sonrası: masa arkasında renkli akustik ayırıcı panel
  if (L >= 2) g.add(rbox(dw, 0.34, 0.03, 0.012, M(DIVIDERS[L]), 0, 0.93, dz - 0.36, {outline:.015}));
}

/* ---------- masa istasyonu (yerel: koltuk orijinde, masa -Z yönünde) ---------- */
function deskStation(st, R, L, role, occ, exec, idx){
  const g = new THREE.Group();
  const topCol = exec ? '#a46a3c' : R.desk[0], legCol = exec ? '#7a4b26' : R.desk[1];
  const dw = exec ? 1.7 : 1.28, dd = exec ? 0.85 : 0.68, dz = -0.8;
  g.add(rbox(dw, 0.05, dd, 0.012, M(topCol), 0, 0.74, dz, {outline:.012}));
  if (L===0){ for (const [x,z] of [[-dw/2+0.05,-dd/2+0.05],[dw/2-0.05,-dd/2+0.05],[-dw/2+0.05,dd/2-0.05],[dw/2-0.05,dd/2-0.05]]) g.add(boxP(0.045, 0.72, 0.045, M('#4b4f63'), x, 0.36, dz+z)); }
  else { for (const s of [-1,1]) g.add(boxP(0.05, 0.72, dd-0.06, M(legCol), s*(dw/2-0.04), 0.36, dz)); g.add(boxP(dw-0.1, 0.4, 0.03, M(legCol), 0, 0.5, dz-dd/2+0.06)); }
  if (exec){ g.add(boxP(0.42, 0.66, dd-0.1, M('#8b5e34'), dw/2-0.26, 0.37, dz, {outline:.02})); g.add(boxP(0.1, 0.02, 0.02, M('#fbbf24'), dw/2-0.26, 0.55, dz+dd/2-0.04)); }
  else if (L >= 2){ g.add(rbox(0.38, 0.55, 0.45, 0.02, M('#e5e7eb'), dw/2-0.22, 0.29, dz+0.02, {outline:.02})); }
  const eq = (typeof S!=='undefined' && S && S.eq) ? S.eq : {pc:1, klavye:1};
  buildMonitors(g, eq.pc, dz, occ ? role : null, idx, dw);
  buildKeyboard(g, eq.klavye, 0, 0.775, dz + 0.17);
  g.add(boxP(0.22, 0.006, 0.18, M('#2f54eb'), 0.37, 0.767, dz + 0.18));
  const mouse = sphP(0.03, 0.018, 0.045, M('#e5e7eb'), 0.37, 0.78, dz + 0.18, {outline:.08}); mouse.userData.dyn = true; g.add(mouse);
  const hsh = hashN(idx*31+7);
  if (exec){ const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.1), new THREE.MeshBasicMaterial({map: textTex('CEO', {w:256, h:72, font:'900 44px Nunito, sans-serif', color:'#7d3b00', bg:'#fbbf24', r:14}), transparent:true}));
    sg.position.set(-dw/2+0.3, 0.84, dz+dd/2-0.08); sg.rotation.x = -0.5; g.add(sg); g.add(cylP(0.04, 0.09, M('#ffffff'), dw/2-0.2, 0.81, dz+0.2, {outline:.05})); }
  else deskItems(g, dz, dw, idx, L);
  return {g, mouse};
}

/* =====================================================================
   SAHNE KURULUMU
   ===================================================================== */
function build(){
  if (!renderer) return;
  const wasMeet = !!meetG;       // toplantı sürerken ofis yeniden kurulursa toplantı odası da yenilenir
  if (meetG){ scene3.remove(meetG); disposeTree(meetG); meetG = null; meetSave = null; }
  if (roomG){ scene3.remove(roomG); disposeTree(roomG); }
  roomG = new THREE.Group(); scene3.add(roomG);
  roamReset(); ROAM.spots = []; ROAM.lane = 0; nameTags = [];
  if (S.office !== lastL){ lastL = S.office; zoom3 = S.office===4 ? 1.6 : 1; pan3 = [0, 0]; }
  chars = new Map(); animated = [];
  const L = S.office, R = ROOMS[L], W = R.w, D = R.d;
  scene3.background = new THREE.Color(0xd3e6f7);
  const seats = seatLayout(W, D, L), nSeats0 = Math.min(seats.length, L >= 2 ? cap() : cap()+1);
  // zemin ve duvarlar
  const floor = boxP(T(W), 0.12, T(D), M('#ffffff', {map:floorTex(L, W, D)}), T(W)/2, -0.06, T(D)/2); floor.castShadow = false; roomG.add(floor);
  roomG.add(boxP(T(W)+0.16, 0.08, T(D)+0.16, M(new THREE.Color(R.floor).multiplyScalar(0.7).getStyle()), T(W)/2, -0.13, T(D)/2));
  {
    const wb = L===0 ? M('#ffffff', {map:blockTex(W)}) : M(R.wall), wl = L===0 ? M('#ffffff', {map:blockTex(D)}) : M(R.wall);
    roomG.add(boxP(T(W)+0.15, WALL_H, 0.15, wb, T(W)/2-0.075, WALL_H/2, -0.075));
    roomG.add(boxP(0.15, WALL_H, T(D), wl, -0.075, WALL_H/2, T(D)/2));
    const cap = M(new THREE.Color(R.wall).multiplyScalar(0.78).getStyle());
    roomG.add(boxP(T(W)+0.15, 0.06, 0.17, cap, T(W)/2-0.075, WALL_H+0.03, -0.075));
    roomG.add(boxP(0.17, 0.06, T(D), cap, -0.075, WALL_H+0.03, T(D)/2));
  }
  const base = M(R.base);
  roomG.add(boxP(T(W), 0.12, 0.03, base, T(W)/2, 0.06, 0.015)); roomG.add(boxP(0.03, 0.12, T(D), base, 0.015, 0.06, T(D)/2));
  let coffeeAt = null, serverAt = null;
  if (L===0){
    // ---- GARAJ: briket duvar, beton zemin, eski koltuk, tezgâh ----
    const door = canvasTex(256, 256, (c,w,h) => { c.fillStyle = '#e4e7ec'; c.fillRect(0,0,w,h); for (let y=0;y<h;y+=32){ c.fillStyle = '#c3cad5'; c.fillRect(0,y,w,4); c.fillStyle = '#ffffff'; c.fillRect(0,y+4,w,3); } });
    roomG.add(boxP(T(3.2), 2.05, 0.06, M('#ffffff', {map:door}), T(1.7)+T(3.2)/2, 1.02, 0.04, {outline:.01}));
    roomG.add(boxP(T(3.2)+0.12, 0.1, 0.1, M('#8d877d'), T(1.7)+T(3.2)/2, 2.1, 0.06));
    plant(roomG, 0.15, 0.1, 0.85);
    workbench(roomG, 0.9, 1.75);
    paintCans(roomG, 0.25, 2.85);
    doorLeft(roomG, 3.6, '#e2ddd3');
    metalShelfX(roomG, 4.95, 0.95);
    crateTV(roomG, 5.2, 1.45);
    flipChart(roomG, 5.05, 3.15);
    dartBoard(roomG, 3.05);
    fairyLights(roomG, [V(0.07, 2.44, T(3.45)), V(0.07, 2.44, 0.07), V(T(1.55), 2.44, 0.07)]);
    rug(roomG, 1.9, 3.75, 2.9, 1.85, '#9b6f55');
    couch(roomG, 2.4, 4.3, 1.9, '#8a7a68');
    floorLamp(roomG, 4.45, 4.5);
    cardboard(roomG, T(4.75), 0, T(5.0), 0.46, 0.36, 0.4, 0.25); cardboard(roomG, T(4.8), 0.36, T(5.0), 0.34, 0.28, 0.32, -0.2);
    washer(roomG, 0.05, 5.05);
    miniFridge(roomG, 0.85, 5.25);
    pizzaBoxes(roomG, 3.75, 5.5);
    cat(roomG, 2.2, 5.6);
    coffeeAt = [1.5, 5.3];
  } else if (L===1){
    // ---- STÜDYO DAİRE (lüks loft): ceviz parke, büyük pencereler, TV duvarı, mutfak adası, okuma köşesi ----
    const FR = '#2b303b';
    texPanel(roomG, 'left', 0.15, 3.1, M('#2b3a5c'));                       // lacivert vurgu duvarı
    texPanel(roomG, 'back', 7.3, W, M('#8a5a3c'));                          // yatak köşesinde ahşap duvar
    winBack(roomG, 0.8, 3.6, {frame:FR, curtain:'#e9e2d6'}); winBack(roomG, 4.3, 7.0, {frame:FR, curtain:'#e9e2d6'});
    doorLeft(roomG, 0.25, FR);
    frameArt(roomG, 'left', 1.5, 1.2, 0.7, 1.65, ART_SETS[3], 9);
    // oturma alanı: duvarda TV + konsol, TV'ye dönük kanepe, sehpa, halı
    rug(roomG, 0.9, 3.7, 3.6, 2.9, '#cfc6b8');
    roomG.add(boxP(0.42, 0.45, T(2.2), M('#2b2f38'), 0.24, 0.225, T(3.9)+T(2.2)/2, {outline:.012}));
    tvLeft(roomG, 4.0, 2.0);
    couch(roomG, 4.5, 3.9, 2.4, '#3d4b66', -Math.PI/2);
    coffeeTable(roomG, 2.55, 5.1);
    floorLamp(roomG, 4.1, 3.75);
    tallPlant(roomG, 0.2, 6.3, 1.0);
    // mutfak adası (bar tabureli)
    kitchenIsland(roomG, 5.2, 4.0, 2.0);
    // okuma köşesi (yatak yok): koltuk, sehpa, lamba, bitki
    rug(roomG, 7.5, 3.9, 2.4, 2.6, '#d9cbb3');
    armchair(roomG, 8.2, 5.2, '#c08457', Math.PI - 0.5); armchair(roomG, 9.4, 4.6, '#5f7896', Math.PI + 0.6);
    sideTable(roomG, 8.9, 4.3, true);
    tallPlant(roomG, 9.3, 6.2, 0.95);
    // arka sağ: kitaplık ve bitki
    bookshelfX(roomG, 8.0, 0.12, 1.5);
    tallPlant(roomG, 9.4, 2.4, 0.95);
    plant(roomG, 0.25, 3.3, 0.9);
    coffeeAt = [7.25, 0.15];
    ROAM.lane = T(3.4);
    { const l = T(2.0), cx = T(5.2)+l/2, cz = T(4.0)+0.35, n = Math.max(2, Math.floor(l/0.62));
      for (let i=0;i<n;i++){ const sx = cx - l/2 + l*(i+0.5)/n; spotAdd('drinksit', sx, cz+0.66, 0, [[T(5.0), ROAM.lane], [T(5.0), cz+1.11], [sx, cz+1.11]], 0.7); } }
    { const z0 = T(3.9), w = T(2.4); for (let i=0;i<3;i++){ const sz = z0 + w*(i+0.5)/3; spotAdd('sit', T(4.5)-0.45, sz, Math.PI/2, [[T(4.5)-0.45, ROAM.lane]], 0.42); } }  } else if (L===2){
    // ---- OFİS: açık gri duvar, lacivert vurgu duvarı, halı karo, toplantı masası ----
    texPanel(roomG, 'back', 8.0, W, M('#2b3a5c'));
    winBack(roomG, 1.3, 3.6, {blinds:true}); winBack(roomG, 4.6, 6.9, {blinds:true});
    wallClock(roomG, 4.1);
    filingCabinet(roomG, 8.1, 0.05); filingCabinet(roomG, 8.65, 0.05, '#9aa3b2'); printer(roomG, 9.25, 0.05);
    bookshelfX(roomG, 10.05, 0.12, 1.5);
    rug(roomG, 9.4, 1.0, 2.6, 3.0, '#d9cbb3');
    whiteboard(roomG, 1.1);
    corkBoard(roomG, 3.6, 1.3);
    doorLeft(roomG, D-1.6, '#5b6474');
    waterCooler(roomG, 0.2, 6.3);
    rug(roomG, 4.2, 4.7, 4.1, 3.5, '#c3cad6');
    meetingTable(roomG, 4.8, 5.45, 2.9, 1.35);
    couch(roomG, 9.0, 6.4, 2.4, '#3d5a80');
    coffeeTable(roomG, 10.4, 8.1);
    armchair(roomG, 8.45, 8.0, '#c08457', 0.9);
    tallPlant(roomG, 11.3, 5.35, 1.0); plant(roomG, 3.6, 8.2, 1.0); plant(roomG, 11.4, 8.3, 1.0);
    coffeeAt = [7.2, 0.15]; serverAt = [0.1, 5.0];
    ROAM.lane = T(4.05);
    spotAdd('drink', 0.95, 5.6, Math.PI/2, [[2.71, ROAM.lane], [2.71, 6.05], [1.6, 6.05]]);
    spotAdd('chat', 1.6, 6.15, faceTo(1.6, 6.15, 0.95, 5.6), [[2.71, ROAM.lane], [2.71, 6.15]]);
    { const wl = T(2.9), dl = T(1.35), cx = T(4.8)+wl/2, cz = T(5.45)+dl/2, n = Math.floor(wl/0.78);
      for (let i=0;i<n;i++){ const px = cx - wl/2 + wl*(i+0.5)/n; spotAdd('sit', px, cz - dl/2 - 0.3, Math.PI, [[px, ROAM.lane]], 0.45); } }
    { const x0 = T(9.0), w = T(2.4), z0 = T(6.4); for (let i=0;i<3;i++){ const sx = x0 + w*(i+0.5)/3; spotAdd('sit', sx, z0+0.45, Math.PI, [[7.4, ROAM.lane], [7.4, 6.55], [sx, 6.55]], 0.42); } }
    vacuum(roomG, 1.3, 9.0, 3.85);
  } else if (L===3){
    // ---- BÜYÜK OFİS: tuğla duvar, meşe parke, cam toplantı odası, mutfak adası, yönetici odası ----
    texPanel(roomG, 'back', 0.15, 10.75, M('#ffffff', {map:brickTex(10.6)}));
    winBack(roomG, 1.0, 3.4, {frame:'#2b303b'}); winBack(roomG, 4.0, 6.4, {frame:'#2b303b'}); winBack(roomG, 12.5, 14.6, {frame:'#2b303b', blinds:true});
    winLeft(roomG, 1.3, 3.1, {frame:'#2b303b'});
    wallClock(roomG, 3.7);
    whiteboard(roomG, 3.4);
    doorLeft(roomG, 5.6, '#2b303b');
    tallPlant(roomG, 0.1, 6.9, 1.0);
    vending(roomG, 8.7, 0); vending(roomG, 9.55, 1);
    // cam toplantı odası (sol ön)
    rug(roomG, 0.2, 7.6, 4.3, 3.3, '#cfd5de');
    glassWall(roomG, 0, 7.4, 3.3, 7.4); glassWall(roomG, 4.3, 7.4, 4.6, 7.4); glassWall(roomG, 4.6, 7.4, 4.6, D);
    doorSign(roomG, 3.8, 7.4, 'TOPLANTI');
    meetingTable(roomG, 0.9, 8.45, 2.8, 1.35);
    tvLeft(roomG, 8.3, 2.0);
    plant(roomG, 3.9, 10.3, 0.9);
    // mutfak adası
    kitchenIsland(roomG, 5.5, 8.5, 3.4);
    tallPlant(roomG, 9.6, 10.2, 0.95);
    // yönetici odası (sağ arka)
    const ox = W-4.2, oy = 3.8;
    rug(roomG, ox+0.3, 0.4, 3.6, 3.1, '#e6d8c3');
    glassWall(roomG, ox, 0, ox, oy); glassWall(roomG, ox, oy, ox+0.9, oy); glassWall(roomG, ox+1.8, oy, W, oy);
    doorSign(roomG, ox+1.35, oy, 'CEO');
    bookshelfX(roomG, ox+0.25, 0.12, 1.3);
    chairAtM(roomG, T(W-3.25), T(1.55), -Math.PI/2, 1, 0.9); chairAtM(roomG, T(W-3.25), T(2.35), -Math.PI/2, 1, 0.9);
    tallPlant(roomG, W-0.75, oy-0.75, 0.9);
    // dinlenme köşesi (sağ ön)
    const lx = W-4.6, ly = D-4.4;
    rug(roomG, lx, ly, 4.2, 3.9, '#c7cbe0');
    couch(roomG, lx+0.4, ly+2.6, 3.0, '#3d5a80');
    coffeeTable(roomG, lx+2.0, ly+1.8);
    beanBag(roomG, lx+0.9, ly+0.9, '#e07a5f'); beanBag(roomG, lx+3.4, ly+1.2, '#e9c46a');
    floorLamp(roomG, lx+3.95, ly+3.4);
    arcade(roomG, W-0.65, ly+0.05);
    deskRug(roomG, seats.slice(0, nSeats0), '#cdd2da');
    coffeeAt = [6.6, 0.15]; serverAt = [0.15, 0.1];
    ROAM.lane = T(6.5)+0.35;
    { const wl = T(2.8), dl = T(1.35), cx = T(0.9)+wl/2, cz = T(8.45)+dl/2, n = Math.floor(wl/0.78);
      for (let i=0;i<n;i++){ const px = cx - wl/2 + wl*(i+0.5)/n; spotAdd('sit', px, cz - dl/2 - 0.3, Math.PI, [[3.2, ROAM.lane], [3.2, 6.6], [px, 6.6]], 0.45); } }
    { const l = T(3.4), cx = T(5.5)+l/2, cz = T(8.5)+0.35, n = Math.max(2, Math.floor(l/0.62));
      for (let i=0;i<n;i++){ const sx = cx - l/2 + l*(i+0.5)/n; spotAdd('drinksit', sx, cz+0.66, 0, [[7.95, ROAM.lane], [7.95, 8.75], [sx, 8.75]], 0.7); } }
    for (const [bx, bz] of [[T(lx+0.9), T(ly+0.9)], [T(lx+3.4), T(ly+1.2)]]) spotAdd('sit', bx, bz, faceTo(bx, bz, T(lx+2.0), T(ly+1.8)), [[bx, ROAM.lane]], 0.28);
    { const x0 = T(lx+0.4), w = T(3.0), z0 = T(ly+2.6); for (let i=0;i<3;i++){ const sx = x0 + w*(i+0.5)/3; spotAdd('sit', sx, z0+0.45, Math.PI, [[8.95, ROAM.lane], [8.95, z0+0.95], [sx, z0+0.95]], 0.42); } }
    spotAdd('chat', T(9.3), T(4.4), -Math.PI/2, [[T(9.3), ROAM.lane]]); spotAdd('chat', T(10.15), T(4.4), Math.PI/2, [[T(10.15), ROAM.lane]]);
    vacuum(roomG, 1.3, 10.0, 4.05);
  } else {
    // ---- GÖKDELEN KATI: geniş kat, yönetici odası, patron odası, toplantı odası, mutfak, eğlence ve dinlenme köşeleri ----
    const ox = W-4.2, mx = W-8.4, oy = 3.8, FR = '#2b303b';
    texPanel(roomG, 'back', 10.0, mx, M('#2b3a5c'));                        // koridor: lacivert vurgu duvarı
    texPanel(roomG, 'back', mx, ox, M('#e6d8c3'));                          // yönetici odası
    texPanel(roomG, 'back', ox, W, M('#c9a57c'));                           // patron odası: ahşap tonlu duvar
    winBack(roomG, 1.0, 3.4, {frame:FR}); winBack(roomG, 4.2, 6.6, {frame:FR}); winBack(roomG, 7.4, 9.8, {frame:FR});
    winBack(roomG, mx+1.7, ox-0.4, {frame:FR, blinds:true}); winBack(roomG, ox+1.8, W-0.5, {frame:FR, blinds:true});
    winLeft(roomG, 1.3, 3.5, {frame:FR}); winLeft(roomG, 5.0, 7.2, {frame:FR});
    tvLeft(roomG, 10.9, 2.2);
    frameArt(roomG, 'left', 8.0, 1.1, 0.6, 1.6, ART_SETS[2], 31);
    vending(roomG, 11.95, 1); waterCooler(roomG, 12.95, 0.3);
    tallPlant(roomG, 0.15, 4.2, 0.95); tallPlant(roomG, 0.15, 9.9, 1.0);
    // yönetici odası
    rug(roomG, mx+0.3, 0.4, 3.6, 3.1, '#d9cbb3');
    glassWall(roomG, mx, 0, mx, 2.6, FR); glassWall(roomG, mx, 3.5, mx, oy, FR); glassWall(roomG, mx, oy, ox, oy, FR);
    doorSign(roomG, mx, 3.05, 'YÖNETİCİ', Math.PI/2);
    bookshelfX(roomG, mx+0.25, 0.12, 1.3);
    if (S.mgr){ chairAtM(roomG, T(ox-3.25), T(1.55), -Math.PI/2, 1, 0.9); chairAtM(roomG, T(ox-3.25), T(2.35), -Math.PI/2, 1, 0.9); }
    else { const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.3), new THREE.MeshBasicMaterial({map: textTex('Boş · yönetici alınabilir', {w:512, h:110, font:'800 40px Nunito, sans-serif', color:'rgba(31,42,68,.7)'}), transparent:true, depthWrite:false}));
      sg.rotation.x = -Math.PI/2; sg.position.set(T(mx+2.1), 0.02, T(1.9)); roomG.add(sg); }
    tallPlant(roomG, ox-0.75, oy-0.75, 0.9);
    // patron odası (kapısı öne açılır)
    rug(roomG, ox+0.3, 0.4, 3.6, 3.1, '#e6d8c3');
    glassWall(roomG, ox, 0, ox, oy, FR); glassWall(roomG, ox, oy, ox+0.9, oy, FR); glassWall(roomG, ox+1.8, oy, W, oy, FR);
    doorSign(roomG, ox+1.35, oy, 'CEO');
    bookshelfX(roomG, ox+0.25, 0.12, 1.3);
    chairAtM(roomG, T(W-3.25), T(1.55), -Math.PI/2, 1, 0.9); chairAtM(roomG, T(W-3.25), T(2.35), -Math.PI/2, 1, 0.9);
    tallPlant(roomG, W-0.75, oy-0.75, 0.9);
    // toplantı odası (yönetici odasının önünde)
    glassWall(roomG, mx, oy, mx, 4.8, FR); glassWall(roomG, mx, 5.7, mx, 7.4, FR); glassWall(roomG, mx, 7.4, ox, 7.4, FR); glassWall(roomG, ox, oy, ox, 7.4, FR);
    doorSign(roomG, mx, 5.25, 'TOPLANTI', Math.PI/2);
    rug(roomG, mx+0.3, oy+0.3, 3.6, 3.1, '#cfd5de');
    meetingTable(roomG, mx+0.6, 4.95, 3.0, 1.3, {top:'#f4f1ec'});
    // bekleme köşesi (patron odasının önünde)
    rug(roomG, ox+0.4, oy+0.6, 3.4, 2.6, '#dfe3ea');
    armchair(roomG, ox+1.2, oy+1.4, '#5f7896', 0.4); armchair(roomG, ox+3.0, oy+1.4, '#5f7896', -0.4);
    sideTable(roomG, ox+2.1, oy+1.1, false); tallPlant(roomG, W-0.8, 6.6, 0.95);
    // dinlenme köşesi
    const lx = W-4.6, ly = D-4.4 + 0.2;
    rug(roomG, lx+0.2, ly, 4.2, 3.8, '#c7cbe0');
    couch(roomG, lx+0.6, ly+2.55, 3.0, '#33415c');
    coffeeTable(roomG, lx+2.2, ly+1.75);
    beanBag(roomG, lx+1.0, ly+0.9, '#e07a5f'); beanBag(roomG, lx+3.5, ly+1.1, '#e9c46a');
    floorLamp(roomG, lx+4.0, ly+3.4);
    // eğlence köşesi (ön orta)
    rug(roomG, 11.4, 10.4, 4.6, 3.2, '#d4d8e8');
    arcade(roomG, 11.7, 10.6); arcade(roomG, 11.7, 11.6);
    beanBag(roomG, 13.6, 11.4, '#6ea8fe'); beanBag(roomG, 14.8, 12.3, '#f472b6');
    tallPlant(roomG, 15.6, 10.5, 0.9);
    // ön şerit: masa tenisi, mutfak adası
    pingPong(roomG, 2.0, 11.2);
    kitchenIsland(roomG, 6.0, 11.0, 3.2);
    tallPlant(roomG, 10.0, 12.9, 0.95);
    deskRug(roomG, seats.slice(0, nSeats0), '#c5ccd6');
    coffeeAt = [9.4, 11.0]; serverAt = [0.15, 0.1];
    const COR = 10.7;                                                       // masalarla yönetici/toplantı odası arasındaki koridor (m)
    ROAM.lane = T(9.9)+0.35;
    { const cx = T(2.0)+0.95, cz = T(11.2)+0.54; spotAdd('pong', cx-1.25, cz, -Math.PI/2, [[cx-1.25, ROAM.lane]]); spotAdd('pong', cx+1.25, cz, Math.PI/2, [[cx+1.25, ROAM.lane]]); }
    { const l = T(3.2), cx = T(6.0)+l/2, cz = T(11.0)+0.35, n = Math.max(2, Math.floor(l/0.62));
      for (let i=0;i<n;i++){ const sx = cx - l/2 + l*(i+0.5)/n; spotAdd('drinksit', sx, cz+0.66, 0, [[8.85, ROAM.lane], [8.85, cz+1.11], [sx, cz+1.11]], 0.7); } }
    spotAdd('sit', T(lx+1.0), T(ly+0.9), faceTo(T(lx+1.0), T(ly+0.9), T(lx+2.2), T(ly+1.75)), [[T(lx+1.0), ROAM.lane]], 0.28);
    spotAdd('sit', T(lx+3.5), T(ly+1.1), faceTo(T(lx+3.5), T(ly+1.1), T(lx+2.2), T(ly+1.75)), [[T(lx+3.5), ROAM.lane]], 0.28);
    { const x0 = T(lx+0.6), w = T(3.0), z0 = T(ly+2.55); for (let i=0;i<3;i++){ const sx = x0 + w*(i+0.5)/3; spotAdd('sit', sx, z0+0.45, Math.PI, [[COR, ROAM.lane], [COR, z0+1.15], [sx, z0+1.15]], 0.42); } }
    { const wl = T(3.0), dl = T(1.3), cx = T(mx+0.6)+wl/2, cz = T(4.95)+dl/2, n = Math.floor(wl/0.78), ix = T(mx)+0.42;
      for (let i=0;i<n;i++){ const px = cx - wl/2 + wl*(i+0.5)/n; spotAdd('sit', px, cz - dl/2 - 0.3, Math.PI, [[COR, ROAM.lane], [COR, 4.45], [ix, 4.45], [ix, 3.6], [px, 3.6]], 0.45); } }
    spotAdd('sit', T(13.6), T(11.4), Math.PI, [[T(13.6), ROAM.lane]], 0.28); spotAdd('sit', T(14.8), T(12.3), Math.PI, [[T(14.8), ROAM.lane]], 0.28);
    spotAdd('chat', 10.3, 5.8, -Math.PI/2, [[10.3, ROAM.lane]]); spotAdd('chat', 11.1, 5.8, Math.PI/2, [[11.1, ROAM.lane]]);
    vacuum(roomG, 1.3, 11.5, 4.05);
  }  if (S.upg.kahve && coffeeAt) coffeeMachine(roomG, coffeeAt[0], coffeeAt[1]);
  rackPos = serverAt;
  if (S.upg.bulut && serverAt) serverRack(roomG, serverAt[0], serverAt[1]);
  ROAM.spots.forEach((s,i) => { if (s.kind!=='chat') return; let best = null, bd = 1.3; ROAM.spots.forEach((o,j) => { if (j===i) return; const d = Math.hypot(o.x-s.x, o.z-s.z); if (d < bd){ bd = d; best = j; } }); s.mate = best; });
  companySign(roomG, L, W, S.name.length > 22 ? S.name.slice(0,21)+'…' : S.name);
  // ---- masalar ve insanlar ----
  const execMode = L >= 2;
  const people = (execMode ? [] : [{id:'me', role:'me'}]).concat(S.emps.map(e => ({id:e.id, role:e.role, e})));
  const nSeats = Math.min(seats.length, execMode ? cap() : cap()+1);
  seatPos = {};
  const chairCol = chairTier();
  const addStation = (cx, cz, who, role, idx, exec, away) => {
    const st = new THREE.Group(); st.position.set(T(cx), 0, T(cz)); st.rotation.y = Math.PI/2; roomG.add(st);
    const occ = who && !away;
    const {g, mouse} = deskStation(null, R, L, role, occ, exec, idx);
    st.add(g);
    if (occ){
      const P = buildPerson(who.id, who.role, looksOf(who.id, who.role), who.e && who.e.lead, {chair:chairCol, crowd: S.emps.length > 16});
      P.root.userData.dyn = true; st.add(P.root); P.mouse = mouse; P.mouseHome = mouse.position.clone(); P.station = st;
      chars.set(String(who.id), P); seatPos[who.id] = [0, 0];
      const ec = new THREE.Group(); buildChair(ec, chairCol); ec.position.z = 0.05; ec.rotation.y = 0.4; ec.visible = false; ec.userData.dyn = true; st.add(ec); P.emptyChair = ec;
    } else {
      const ch = new THREE.Group(); buildChair(ch, chairCol); ch.position.z = 0.05; ch.rotation.y = 0.4; st.add(ch);
      if (away){ const sg = signSprite(away); sg.position.set(0, 1.25, 0); sg.userData.dyn = true; st.add(sg); seatPos[who.id] = [0, 0];
        const hit = boxP(0.62, 1.4, 0.75, HIDDEN, 0, 0.7, -0.1); hit.userData.dyn = true; hit.userData.cid = who.id; st.add(hit); }
    }
  };
  if (execMode){
    const ex = L===2 ? {x:W-2.3, y:1.3} : {x:W-2.6, y:0.9};
    addStation(ex.x+1.42, ex.y+1.03, {id:'me', role:'me'}, S.ftask ? 'arge' : 'me', 99, true, false);
    nameTags.push({id:'me', name:'Sen', st:roomG.children[roomG.children.length-1], me:true});
  }
  if (L===4 && S.mgr){
    addStation(W-8.4+3.02, 1.93, {id:'mgr', role:'mgr'}, 'prog', 98, true, false);
    nameTags.push({id:'mgr', name:S.mgr.name + ' · Yönetici', st:roomG.children[roomG.children.length-1]});
  }
  for (let i=0;i<nSeats;i++){
    const st = seats[i], who = people[i];
    const away = who && who.e && who.e.task && AWAY.includes(who.e.task.type) ? (who.e.task.type==='kurs' ? '🎓' : who.e.task.type==='izin' ? '🏖️' : '🎤') : null;
    const role = who ? ((who.e && who.e.task && (who.e.task.type==='arge' || who.e.task.type==='ogren' || who.e.task.type==='egitim')) || (who.id==='me' && S.ftask) ? 'arge' : who.role) : 'none';
    addStation(st.x+1.3, st.y+0.75, who, role, i, false, away);
    if (who) nameTags.push({id:who.id, name: who.e ? who.e.name : 'Sen', st:roomG.children[roomG.children.length-1], me:!who.e, away:!!away});
  }
  for (const n of nameTags) floorNameAt(n);
  const extra = people.length - nSeats;
  if (extra > 0){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: textTex('+'+extra+' kişi', {w:256, h:80, font:'900 40px Nunito, sans-serif', bg:'#0d1b5c', r:30}), depthTest:false})); sp.scale.set(0.9, 0.28, 1); sp.position.set(T(W-1.4), 0.5, T(D-0.3)); sp.userData.dyn = true; roomG.add(sp); }
  // hareketsiz her şeyi birleştir (telefonda akıcı olsun)
  mergeInto(roomG, c => c.isSprite || c.userData.dyn);
  // ışık ve kamera odaya göre
  const size = Math.max(T(W), T(D));
  Object.assign(sun.shadow.camera, {left:-size*0.75, right:size*0.75, top:size*0.75, bottom:-size*0.75, near:0.5, far:size*4});
  sun.shadow.camera.updateProjectionMatrix();
  sun.position.set(T(W)/2 + size*0.45, size*1.1, T(D)/2 + size*0.6); sun.target.position.set(T(W)/2, 0, T(D)/2); sun.target.updateMatrixWorld();
  sun.intensity = 1.85;
  roomBox = {W:T(W), D:T(D)};
  renderer.shadowMap.needsUpdate = true;
  needFit = true;
  for (const P of chars.values()) animPerson(P, 0, 1);
  if (wasMeet) meetingOn(true);
  if (launchG && launchSave){ launchSave.chars = chars; launchSave.roomBox = Object.assign({}, roomBox); chars = launchG.userData.chars; roomBox = {W:LRW, D:LRD}; roomG.visible = false; setLight(LRW, LRD); needFit = true; }
  if (catG){ scene3.remove(catG); catG = null; }
  if (decorG){ scene3.remove(decorG); decorG = null; } decorG = buildDecor(); if (decorG) scene3.add(decorG);
  buildEnv();
  if (S.ex && S.ex.cat){ catG = buildCat(); catG.position.set(roomBox.W*0.5, 0, Math.min(roomBox.D - 0.6, (ROAM.lane || roomBox.D*0.7))); scene3.add(catG); catS = {wait:2}; }
}
let roomBox = {W:5, D:5};
function disposeTree(o){ o.traverse(c => { if (c.isMesh && c.userData.merged) c.geometry.dispose(); }); }

/* ---------- kamera: odayı kaplasın, yakınlaştır/kaydır ---------- */
const CAM_DIR = V(1, 0.82, 1).normalize();
function fitView(){
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
  const center = V(roomBox.W*0.5, 0.6, roomBox.D*0.5);
  camera.position.copy(center).addScaledVector(CAM_DIR, 40); camera.lookAt(center); camera.updateMatrixWorld();
  const inv = camera.matrixWorldInverse;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x,y,z] of [[0,0,0],[roomBox.W,0,0],[0,0,roomBox.D],[roomBox.W,0,roomBox.D],[0,WALL_H*0.72,0],[roomBox.W,WALL_H*0.72,0],[0,WALL_H*0.72,roomBox.D],[roomBox.W,-0.2,roomBox.D]]){
    const p = V(x,y,z).applyMatrix4(inv); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  let cx = (minX+maxX)/2, cy = (minY+maxY)/2, aspect = w/h;
  let hw = (maxX-minX)/2*0.99, hh = (maxY-minY)/2*0.98;
  if (hw/hh > aspect) hh = hw/aspect; else hw = hh*aspect;
  // toplantıda sağda karar paneli açık: oda sola, panelin yanına kaysın
  if (meetG && w > 520){ const k = Math.min(1.45, 1 + 400/w); hw *= k; hh *= k; cx += hw*(1 - 1/k)*0.55; }
  view = {cx, cy, hw, hh};
  needFit = false;
  applyView3();
}
function applyView3(){
  const hw = view.hw/zoom3, hh = view.hh/zoom3;
  const mx = view.hw - hw, my = view.hh - hh;
  pan3[0] = THREE.MathUtils.clamp(pan3[0], -mx, mx); pan3[1] = THREE.MathUtils.clamp(pan3[1], -my, my);
  const cx = view.cx + pan3[0], cy = view.cy + pan3[1];
  camera.left = cx - hw; camera.right = cx + hw; camera.top = cy + hh; camera.bottom = cy - hh;
  camera.updateProjectionMatrix();
  const zl = document.getElementById('zoomLvl'); if (zl) zl.textContent = zoom3 > 1 ? `${zoom3}x` : '';
  sceneEl.classList.toggle('zoomed', zoom3 > 1);
}

/* ---------- boyut, döngü ---------- */
function appZoom(){ const z = parseFloat(getComputedStyle(document.getElementById('app')).zoom); return z > 0 ? z : 1; }
function resize3(){
  const w = sceneEl.clientWidth, h = sceneEl.clientHeight, dpr = Math.min(2.5, (window.devicePixelRatio||1) * appZoom());
  if (w === lastW && h === lastH && Math.abs(dpr-lastDpr) < 0.01) return;
  lastW = w; lastH = h; lastDpr = dpr;
  renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
  canvas.style.width = w+'px'; canvas.style.height = h+'px';
  needFit = true;
}
function loop(){
  requestAnimationFrame(loop);
  if (!api.ok || typeof S === 'undefined' || !S) return;
  const dt = Math.min(0.1, clock.getDelta());
  if (document.hidden || page || document.getElementById('app').classList.contains('nogame')) return;
  resize3();
  if (needFit) fitView();
  frameN++;
  if (chars.size > 14 && frameN % 2) return;            // kalabalık ofiste 30 kare/sn yeter
  const t = clock.elapsedTime;
  for (const P of chars.values()){ animPerson(P, t, dt*(chars.size > 14 ? 2 : 1)); roamTick(P, t, dt*(chars.size > 14 ? 2 : 1)); }
  updateNames(dt*(chars.size > 14 ? 2 : 1));
  alarmTick(t); catTick(t, dt); decorTick(t); envTick(t, dt); launchTick(t, dt);
  for (const a of screenAnims) a.tex.offset.y = (t*a.speed) % 1;
  for (const a of animated){
    if (a.vac){ const k = (Math.sin(t*0.35)+1)/2; a.vac.position.set(THREE.MathUtils.lerp(a.a, a.b, k), 0, a.z); a.vac.rotation.y = Math.cos(t*0.35) > 0 ? 0 : Math.PI; }
  }
  renderer.render(scene3, camera);
}

/* ---------- dışarıya açılan arayüz ---------- */
const ray = new THREE.Raycaster();
function ndcFromEvent(e){
  // ekrandaki gerçek kutuya göre hesapla (CSS zoom tarayıcıdan tarayıcıya farklı davranır)
  const r = canvas.getBoundingClientRect();
  const rot = /rotate\(90deg\)/.test(document.getElementById('app').style.transform || '');
  let x, y;
  if (rot){ x = (e.clientY - r.top) / r.height; y = 1 - (e.clientX - r.left) / r.width; }   // dikey telefonda oyun 90° döndürülür
  else { x = (e.clientX - r.left) / r.width; y = (e.clientY - r.top) / r.height; }
  return new THREE.Vector2(x*2-1, -(y*2-1));
}
function headScreen(id){
  const P = chars.get(String(id));
  let wp;
  if (P){ wp = (P.roam && P.W ? P.W.head : P.head).localToWorld(V(0, 0.26, 0)); }
  else {
    let found = null; roomG.traverse(o => { if (!found && o.userData.cid !== undefined && String(o.userData.cid) === String(id)) found = o; });
    if (!found) return null; wp = found.localToWorld(V(0, 0.75, 0));
  }
  wp.project(camera);
  return [(wp.x+1)/2*canvas.clientWidth, (1-wp.y)/2*canvas.clientHeight];
}
/* =====================================================================
   TOPLANTI – kurucu toplantı yapınca ofis yerine toplantı odası görünür:
   uzun masanın başında kurucu, iki yanında bütün ekip oturur
   ===================================================================== */
let meetG = null, meetSave = null;
function setLight(w, d){
  const size = Math.max(w, d);
  Object.assign(sun.shadow.camera, {left:-size*0.75, right:size*0.75, top:size*0.75, bottom:-size*0.75, near:0.5, far:size*4});
  sun.shadow.camera.updateProjectionMatrix();
  sun.position.set(w/2 + size*0.45, size*1.1, d/2 + size*0.6); sun.target.position.set(w/2, 0, d/2); sun.target.updateMatrixWorld();
}
function buildMeeting(){
  const away = e => e.task && ['kurs','izin','konf'].includes(e.task.type);
  const ppl = [{id:'me', role:'me'}];
  if (S.office===4 && S.mgr) ppl.push({id:'mgr', role:'mgr'});
  for (const e of S.emps) if (!away(e)) ppl.push({id:e.id, role:e.role, e});
  const others = ppl.length - 1, per = Math.max(1, Math.ceil(others/2));
  const TL = Math.max(2.0, per*0.92 + 0.5), TD = 1.3;
  const RW = TL + 3.8, RD = TD + 3.6, cx = RW/2 + 0.25, cz = RD/2 + 0.2;
  const g = new THREE.Group();
  // zemin, halı, duvarlar
  const fl = boxP(RW, 0.12, RD, M('#8a6a4f'), RW/2, -0.06, RD/2); fl.castShadow = false; g.add(fl);
  g.add(boxP(RW+0.16, 0.08, RD+0.16, M('#5e4634'), RW/2, -0.13, RD/2));
  g.add(boxP(TL+2.0, 0.014, TD+2.3, M('#2e3f66'), cx, 0.007, cz));
  g.add(boxP(TL+1.8, 0.016, TD+2.1, M('#34497a'), cx, 0.008, cz));
  g.add(boxP(RW+0.15, WALL_H, 0.15, M('#eef1f6'), RW/2-0.075, WALL_H/2, -0.075));
  g.add(boxP(0.15, WALL_H, RD, M('#e6eaf1'), -0.075, WALL_H/2, RD/2));
  g.add(boxP(RW+0.15, 0.06, 0.17, M('#c9ced8'), RW/2-0.075, WALL_H+0.03, -0.075));
  g.add(boxP(0.17, 0.06, RD, M('#c9ced8'), -0.085, WALL_H+0.03, RD/2));
  // sol duvarda büyük pencereler
  for (let k=0; k<2; k++){ const z = RD*(0.3 + k*0.42);
    g.add(boxP(0.05, 1.45, 1.15, M('#2b303b'), 0.01, 1.5, z));
    g.add(boxP(0.06, 1.33, 1.03, M('#bfe0f7'), 0.02, 1.5, z));
    g.add(boxP(0.07, 0.04, 1.03, M('#2b303b'), 0.03, 1.5, z)); }
  // arka duvarda sunum ekranı
  g.add(boxP(2.3, 1.28, 0.07, M('#1f2937'), cx, 1.62, 0.04));
  { const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.14, 1.12), new THREE.MeshBasicMaterial({map: textTex('ŞİRKETİN GELECEĞİ', {w:768, h:400, font:'900 66px Nunito, system-ui, sans-serif', bg:'#173a80', r:0})}));
    scr.position.set(cx, 1.62, 0.08); g.add(scr); }
  g.add(boxP(0.9, 0.06, 0.32, M('#d8dde6'), cx, 0.92, 0.2));          // ekranın altındaki konsol
  // uzun toplantı masası
  g.add(rbox(TL, 0.07, TD, 0.06, M('#5b3a26'), cx, 0.745, cz, {outline:.02}));
  g.add(boxP(TL-0.6, 0.006, 0.34, M('#3d2719'), cx, 0.783, cz));
  for (const s of [-1,1]) g.add(boxP(0.2, 0.71, TD*0.55, M('#2b303b'), cx + s*TL*0.32, 0.355, cz));
  // köşelerde bitkiler, yanda su sebili
  tallPlant(g, (RW-0.75)/U, 0.25/U, 0.95); tallPlant(g, (RW-0.75)/U, (RD-0.9)/U, 0.85);
  g.add(cylP(0.17, 0.9, M('#e5e7eb'), 0.45, 0.45, 0.4)); g.add(cylP(0.13, 0.34, M('#9fd2f0'), 0.45, 1.07, 0.4));
  // insanlar
  const chair = chairTier(), crowd = ppl.length > 16, mc = new Map();
  const place = (w, x, z, rot, nx, nz) => {
    const P = buildPerson(w.id, w.role, looksOf(w.id, w.role), w.e && w.e.lead, {chair, crowd});
    P.wantWork = false; P.state = 0; P.root.userData.dyn = true;
    P.root.position.set(x, 0, z); P.root.rotation.y = rot; g.add(P.root); mc.set(String(w.id), P);
    g.add(boxP(0.22, 0.012, 0.3, M('#f8fafc'), nx, 0.786, nz));                 // not defteri
    g.add(cylP(0.035, 0.09, M('#ffffff'), nx + 0.2, 0.83, nz));                  // bardak
  };
  place(ppl[0], cx - TL/2 - 0.5, cz, -Math.PI/2, cx - TL/2 + 0.24, cz);
  const rest = ppl.slice(1);
  rest.forEach((w, i) => {
    const side = i % 2, k = Math.floor(i/2), x = cx - TL/2 + TL*(k + 0.5)/per;
    if (side === 0) place(w, x, cz - TD/2 - 0.48, Math.PI, x, cz - TD/2 + 0.22);
    else place(w, x, cz + TD/2 + 0.48, 0, x, cz + TD/2 - 0.22);
  });
  mergeInto(g, c => c.isSprite || c.userData.dyn);
  return {g, mc, RW, RD};
}
function meetingOn(on){
  if (!renderer) return;
  if (on){
    if (meetG){ scene3.remove(meetG); disposeTree(meetG); }
    else meetSave = {chars, roomBox:Object.assign({}, roomBox), zoom:zoom3, pan:pan3.slice()};
    const m = buildMeeting(); meetG = m.g; scene3.add(meetG); roomG.visible = false;
    chars = m.mc; roomBox = {W:m.RW, D:m.RD}; zoom3 = 1; pan3 = [0, 0]; setLight(m.RW, m.RD);
    for (const P of chars.values()) animPerson(P, 0, 1);
  } else if (meetG){
    scene3.remove(meetG); disposeTree(meetG); meetG = null; roomG.visible = true;
    if (meetSave){ chars = meetSave.chars; roomBox = meetSave.roomBox; zoom3 = meetSave.zoom; pan3 = meetSave.pan; meetSave = null; }
    setLight(roomBox.W, roomBox.D);
  }
  needFit = true; renderer.shadowMap.needsUpdate = true;
}
/* =====================================================================
   GECE KRİZİ ALARMI – ofis kararır, kırmızı alarm döner, sunucu dolabından
   duman ve kıvılcım çıkar, çalışanlar panikle ellerini başlarına götürür
   ===================================================================== */
let hemi = null, alarmG = null, rackPos = null;
function alarmOn(on){
  if (!renderer) return;
  if (on){
    if (alarmG || meetG) return;
    alarmG = new THREE.Group(); scene3.add(alarmG);
    const rp = rackPos || [0.15, 0.1], cx = T(rp[0]) + 0.3, cz = T(rp[1]) + 0.3;
    if (!(S.upg.bulut && rackPos)) serverRack(alarmG, rp[0], rp[1]);        // sunucu dolabı yoksa geçici bir tane
    alarmG.add(boxP(0.62, 0.04, 0.62, new THREE.MeshBasicMaterial({color:0x111111}), cx, 2.02, cz));   // yanık üst kapak
    const red = new THREE.PointLight(0xff2020, 0, 30, 1.2); red.position.set(roomBox.W/2, 2.8, roomBox.D/2); alarmG.add(red);
    const fire = new THREE.PointLight(0xff7a1a, 0, 6, 1.6); fire.position.set(cx, 2.3, cz + 0.2); alarmG.add(fire);
    const beacon = new THREE.Mesh(G.sph, new THREE.MeshBasicMaterial({color:0xff2a2a})); beacon.scale.setScalar(0.09); beacon.position.set(cx, 2.12, cz); alarmG.add(beacon);
    const puffs = [], sparks = [];
    for (let i = 0; i < 12; i++){ const m = new THREE.Mesh(G.sph, new THREE.MeshBasicMaterial({color:i%3 ? 0x4b5563 : 0x6b7280, transparent:true, opacity:0.5, depthWrite:false})); m.userData.ph = i/12; alarmG.add(m); puffs.push(m); }
    for (let i = 0; i < 18; i++){ const m = new THREE.Mesh(G.box, new THREE.MeshBasicMaterial({color:i%2 ? 0xffd24a : 0xff8a1f})); m.scale.setScalar(0.04); m.userData.ph = Math.random(); m.userData.a = Math.random()*6.28; alarmG.add(m); sparks.push(m); }
    alarmG.userData = {red, fire, beacon, cx, cz, puffs, sparks, saved:{bg:scene3.background, sun:sun.intensity, hemi:hemi ? hemi.intensity : 1}};
    scene3.background = new THREE.Color(0x0a0f24); sun.intensity = 0.25; if (hemi) hemi.intensity = 0.38;
    sceneEl.classList.add('alarm3');
  } else if (alarmG){
    const sv = alarmG.userData.saved; scene3.background = sv.bg; sun.intensity = sv.sun; if (hemi) hemi.intensity = sv.hemi;
    scene3.remove(alarmG); alarmG = null; sceneEl.classList.remove('alarm3');
  }
}
function alarmTick(t){
  if (!alarmG) return;
  const u = alarmG.userData, on = Math.sin(t*8) > 0;
  u.red.intensity = on ? 14 : 1.5; u.beacon.visible = on;
  u.fire.intensity = 3 + Math.random()*4;
  for (const m of u.puffs){ const k = (t*0.32 + m.userData.ph) % 1;
    m.position.set(u.cx + Math.sin(k*6 + m.userData.ph*9)*0.35*k, 2.1 + k*2.0, u.cz + Math.cos(k*5 + m.userData.ph*4)*0.3*k);
    m.scale.setScalar(0.16 + k*0.75); m.material.opacity = 0.75*(1 - k); }
  for (const s of u.sparks){ const k = (t*1.7 + s.userData.ph) % 1;
    s.position.set(u.cx + Math.cos(s.userData.a)*k*0.8, 2.05 + Math.sin(k*3.14)*0.6 - k*0.3, u.cz + Math.sin(s.userData.a)*k*0.8 + 0.25);
    s.visible = k < 0.85 && Math.random() > 0.15; }
}
// panik: eller başta, baş sağa sola
function panicPose(P, tt){
  P.head.rotation.y = Math.sin(tt*13)*0.45; P.torso.rotation.x = -0.18 + Math.sin(tt*9)*0.05;
  P.root.updateMatrixWorld(true);
  for (const A of P.arms){
    const s = A.s, sh = P.torso.localToWorld(V(s*0.2, 0.36, 0)); P.root.worldToLocal(sh);
    const hand = V(s*0.13, 1.36 + Math.sin(tt*11 + s)*0.035, -0.06), elbow = V(s*0.31, 1.12, -0.17);
    placeLimb(A.up, sh, elbow); placeLimb(A.fo, elbow, hand); if (A.cuff) placeLimb(A.cuff, sh, sh.clone().lerp(elbow, 0.55));
    A.hand.position.copy(hand); A.hand.rotation.set(-0.6, 0, s*0.4);
  }
}
/* =====================================================================
   LANSMAN SALONU – ürün lansmanında ofis yerine sahne, dev LED ekran,
   spot ışıkları ve seyirciler; kurucu sahnede ürünü anlatır, sonra alkış ve konfeti
   ===================================================================== */
let launchG = null, launchSave = null;
const LRW = 12.5, LRD = 10.5;
function buildLaunch(info){
  const g = new THREE.Group(), cx = LRW/2;
  g.userData = {spots:[], conf:[], chars:new Map(), clap:false, t0:0};
  // zemin ve duvarlar (mor-pembe ışıklı salon)
  const fl = boxP(LRW, 0.12, LRD, M('#2b2f6b'), LRW/2, -0.06, LRD/2); fl.castShadow = false; g.add(fl);
  g.add(boxP(LRW + 0.16, 0.08, LRD + 0.16, M('#1c1f4a'), LRW/2, -0.13, LRD/2));
  const wallTex = canvasTex(512, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#4c1d95'); gr.addColorStop(0.5, '#7e22ce'); gr.addColorStop(1, '#be185d'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++){ c.fillStyle = `rgba(255,255,255,${0.04 + Math.random()*0.06})`; c.fillRect(i*30, 0, 3, h); } });
  g.add(boxP(LRW + 0.15, 3.6, 0.15, M('#ffffff', {map:wallTex}), LRW/2 - 0.075, 1.8, -0.075));
  g.add(boxP(0.15, 3.6, LRD, M('#ffffff', {map:wallTex}), -0.075, 1.8, LRD/2));
  for (let z = 1.5; z < LRD; z += 2) g.add(boxP(0.05, 3.2, 0.12, new THREE.MeshBasicMaterial({color:0xf0abfc}), 0.02, 1.8, z));
  // dev LED ekran
  const scr = canvasTex(1024, 440, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0f172a'); gr.addColorStop(1, '#1e3a8a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(96,165,250,.25)'; c.beginPath(); c.arc(w/2, h/2, 190, 0, 7); c.fill();
    c.textAlign = 'center'; c.fillStyle = '#7dd3fc'; c.font = '800 34px Nunito, system-ui, sans-serif'; c.fillText((info.company || '').toLocaleUpperCase('tr-TR') + ' SUNAR', w/2, 92);
    c.fillStyle = '#ffffff'; c.font = '900 96px Nunito, system-ui, sans-serif'; c.fillText(info.name || 'Yeni Ürün', w/2, 238);
    c.fillStyle = '#fbbf24'; c.font = '800 38px Nunito, system-ui, sans-serif'; c.fillText((info.type || '') + ' · Şimdi yayında', w/2, 318); });
  g.add(boxP(7.4, 3.2, 0.12, M('#0b1020'), cx, 2.0, 0.12));
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 2.95), new THREE.MeshBasicMaterial({map:scr})); sm.position.set(cx, 2.0, 0.19); g.add(sm);
  // sahne ve parlayan kenarı
  g.add(boxP(8.4, 0.4, 3.2, M('#111827'), cx, 0.2, 1.9));
  const edge = new THREE.MeshBasicMaterial({color:0x22d3ee}); g.userData.edge = edge;
  g.add(boxP(8.4, 0.06, 0.06, edge, cx, 0.41, 3.5)); g.add(boxP(0.06, 0.06, 3.2, edge, cx + 4.2, 0.41, 1.9));
  // kürsü
  g.add(boxP(0.6, 1.0, 0.45, M('#e5e7eb'), cx + 2.6, 0.9, 2.6)); g.add(boxP(0.62, 0.06, 0.5, M('#7c3aed'), cx + 2.6, 1.42, 2.6));
  // spot ışıkları (şeffaf ışık hüzmeleri)
  const beamM = new THREE.MeshBasicMaterial({color:0xfff3c4, transparent:true, opacity:0.13, depthWrite:false, side:THREE.DoubleSide});
  for (const [x, z] of [[cx - 3, 6.5], [cx - 1, 7], [cx + 1, 7], [cx + 3, 6.5]]){
    const pv = new THREE.Group(); pv.position.set(x, 3.4, z);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 18, 1, true), beamM); cone.position.y = -1.8; pv.add(cone);
    pv.add(cylP(0.12, 0.25, M('#1f2937'), 0, 0, 0));
    pv.lookAt(cx, 0.4, 2.2); pv.rotateX(Math.PI/2); g.add(pv); g.userData.spots.push({pv, ph:Math.random()*6});
  }
  const key = new THREE.PointLight(0xffe2b3, 6, 14, 1.4); key.position.set(cx, 3.2, 4); g.add(key);
  const pink = new THREE.PointLight(0xf472b6, 3, 12, 1.4); pink.position.set(1, 2.5, LRD - 2); g.add(pink); g.userData.pink = pink;
  // seyirci sıraları
  const people = [{id:'me', role:'me'}].concat((S.emps || []).filter(e => !(e.task && ['kurs','izin','konf'].includes(e.task.type))).map(e => ({id:e.id, role:e.role, e})));
  // doluluk ürünün kalitesine bağlı: çok beğenilen üründe salon ağzına kadar dolar
  const fill = Math.max(0, Math.min(1, info.fill == null ? 0.7 : info.fill)), full = fill >= 0.9;
  const chair = chairTier(), rows = full ? [5.6, 7.0, 8.4, 9.7] : [5.6, 7.0, 8.4], perRow = 7;
  const seats = [];
  rows.forEach((z, r) => { for (let i = 0; i < perRow; i++) seats.push({x:cx - 3.6 + i*1.2, z, o:r*10 + Math.abs(i - 3) + Math.random()*1.5}); });
  seats.sort((a, b) => a.o - b.o);                       // önce ön sıralar ve orta koltuklar dolar
  const team = people.length - 1, nSeat = full ? seats.length : Math.min(seats.length, Math.max(team, 2, Math.round(21*fill)));
  let k = 0;
  for (const s of seats){
    if (k >= nSeat){ chairAtM(g, s.x, s.z, 0, chair, 1); continue; }   // boş koltuk
    const w = people[k + 1];                             // 0. kişi kurucu, sahnede
    const id = w ? w.id : 9000 + k, role = w ? w.role : pick(['prog','tas','test']);
    const L = w ? looksOf(w.id, w.role) : empLook(9000 + k*7, role, k % 2 === 0);
    const P = buildPerson(id, role, L, false, {chair, crowd:true}); P.wantWork = false; P.state = 0; P.root.userData.dyn = true;
    P.root.position.set(s.x, 0, s.z); g.add(P.root); g.userData.chars.set('a' + k, P); k++;
  }
  // salon tıklım tıklım: yer bulamayanlar kenarlarda ayakta izler
  g.userData.standers = [];
  if (full) [[0.55, 5.0], [0.55, 6.4], [0.55, 7.8], [0.55, 9.2], [LRW - 0.55, 5.4], [LRW - 0.55, 6.8], [LRW - 0.55, 8.2], [LRW - 0.55, 9.6]].forEach(([x, z], i) => {
    const role = pick(['prog','tas','test']), P = buildPerson(9600 + i, role, empLook(9600 + i*11, role, i % 2 === 1), false, {chair:0});
    const W = buildWalker(P); W.root.visible = true; W.root.position.set(x, 0, z); W.root.rotation.y = x < cx ? -0.5 : 0.5; g.add(W.root);
    g.userData.standers.push({W, t0:P.t0 + i*0.7});
  });
  g.userData.fill = fill;
  // kurucu sahnede ayakta
  const F = buildPerson('me', 'me', looksOf('me', 'me'), false, {chair:0});
  const W = buildWalker(F); g.add(W.root); W.root.visible = true; W.root.position.set(cx - 0.6, 0.4, 2.4); W.root.rotation.y = Math.PI; g.userData.walker = W; g.userData.fT0 = F.t0;
  // konfeti
  const cols = [0xf472b6, 0xfbbf24, 0x60a5fa, 0x34d399, 0xffffff, 0xa78bfa];
  for (let i = 0; i < 70; i++){ const m = new THREE.Mesh(G.box, new THREE.MeshBasicMaterial({color:cols[i % cols.length]})); m.scale.set(0.06, 0.012, 0.04); m.visible = false;
    m.userData = {x:cx - 4 + Math.random()*8, z:2 + Math.random()*7, sp:0.6 + Math.random()*0.8, ph:Math.random()*6}; g.add(m); g.userData.conf.push(m); }
  g.traverse(c => { if (c.isMesh) c.castShadow = false; });
  return g;
}
function launchOn(on, info){
  if (!renderer) return;
  if (on){
    if (launchG || meetG) return;
    launchSave = {chars, roomBox:Object.assign({}, roomBox), zoom:zoom3, pan:pan3.slice()};
    launchG = buildLaunch(info || {}); scene3.add(launchG); roomG.visible = false;
    chars = launchG.userData.chars; roomBox = {W:LRW, D:LRD}; zoom3 = 1; pan3 = [0, 0]; setLight(LRW, LRD);
    launchG.userData.t0 = clock.elapsedTime;
    for (const P of chars.values()) animPerson(P, 0, 1);
    sceneEl.classList.add('launch3');
  } else if (launchG){
    scene3.remove(launchG); disposeTree(launchG); launchG = null; roomG.visible = true;
    if (launchSave){ chars = launchSave.chars; roomBox = launchSave.roomBox; zoom3 = launchSave.zoom; pan3 = launchSave.pan; launchSave = null; }
    setLight(roomBox.W, roomBox.D); sceneEl.classList.remove('launch3');
  }
  needFit = true; renderer.shadowMap.needsUpdate = true;
}
function launchTick(t, dt){
  if (!launchG) return;
  const u = launchG.userData, lt = t - u.t0;
  for (const s of u.spots){ s.pv.rotation.z = Math.sin(t*0.7 + s.ph)*0.18; }
  u.edge.color.setHSL((t*0.12) % 1, 0.85, 0.6);
  u.pink.intensity = 2.4 + Math.sin(t*2)*0.8;
  // kurucu sahnede yürüyerek anlatır
  const W = u.walker; W.root.position.x = LRW/2 - 0.6 + Math.sin(lt*0.5)*1.4;
  poseWalker(W, 'chat', t + u.fT0, 0, 0); W.root.position.y = 0.4;
  for (const s of u.standers || []){ poseWalker(s.W, 'chat', t + s.t0, 0, 0); s.W.root.position.y = 0; }
  if (u.clap) for (const m of u.conf){ m.visible = true; const k = ((lt - u.clapT)*m.userData.sp*0.35 + m.userData.ph/6) % 1;
    m.position.set(m.userData.x + Math.sin(t*2 + m.userData.ph)*0.3, 3.6 - k*3.6, m.userData.z); m.rotation.x += dt*4; m.rotation.y += dt*3; }
}
// alkış: eller göğüs hizasında birleşip ayrılır
function clapPose(P, tt){
  const o = Math.abs(Math.sin(tt*12))*0.07;
  P.root.updateMatrixWorld(true);
  for (const A of P.arms){
    const s = A.s, sh = P.torso.localToWorld(V(s*0.2, 0.36, 0)); P.root.worldToLocal(sh);
    const hand = V(s*(0.03 + o), 1.0, -0.3), elbow = V(s*0.28, 0.82, -0.2);
    placeLimb(A.up, sh, elbow); placeLimb(A.fo, elbow, hand); if (A.cuff) placeLimb(A.cuff, sh, sh.clone().lerp(elbow, 0.55)); A.hand.position.copy(hand);
  }
  P.head.rotation.y = 0; P.head.rotation.x = -0.05;
}
/* ---- OFİS DEKORU: pencerelerin üstündeki duvar şeridine asılır (eşyalarla çakışmaz) ---- */
let decorG = null, envG = null, envForceH = null, envForceM = null, envT = 0;
function buildDecor(){
  const own = (S.cy && S.cy.decor) || {}, on = k => own[k] === true;
  if (!Object.keys(own).some(on)) return null;
  const g = new THREE.Group(), W = roomBox.W, D = roomBox.D, Y = 2.33, Z = 0.1;
  g.userData = {};
  if (on('neon')){
    const tex = textTex((S.name || 'BYTETOWN').toLocaleUpperCase('tr-TR'), {w:1024, h:140, font:'900 92px Nunito, system-ui, sans-serif', color:'#7df9ff'});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(2.4, W*0.34), 0.3), new THREE.MeshBasicMaterial({map:tex, transparent:true}));
    m.position.set(W*0.5, Y, Z); g.add(m);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(2.5, W*0.36), 0.36), new THREE.MeshBasicMaterial({color:0x22d3ee, transparent:true, opacity:0.16}));
    glow.position.set(W*0.5, Y, Z - 0.01); g.add(glow); g.userData.neon = glow;
  }
  if (on('saat')){
    const c = new THREE.Group(); c.position.set(W*0.2, Y, Z); g.add(c);
    const face = cylP(0.15, 0.03, M('#ffffff'), 0, 0, 0); face.rotation.x = Math.PI/2; c.add(face);
    const rim = cylP(0.165, 0.025, M('#1f2937'), 0, 0, -0.004); rim.rotation.x = Math.PI/2; c.add(rim);
    const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.z = mh.position.z = 0.02; c.add(hh); c.add(mh);
    hh.add(boxP(0.016, 0.08, 0.01, M('#111827'), 0, 0.04, 0)); mh.add(boxP(0.01, 0.12, 0.01, M('#dc2626'), 0, 0.06, 0));
    g.userData.clock = {hh, mh};
  }
  if (on('tablo')) [0, 1, 2].forEach(i => {
    const x = W*0.68 + i*0.42; g.add(boxP(0.34, 0.26, 0.03, M('#2b1d14'), x, Y, Z - 0.005));
    const art = canvasTex(128, 96, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, ['#f472b6','#60a5fa','#fbbf24'][i]); gr.addColorStop(1, ['#7c3aed','#14b8a6','#ef4444'][i]); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(w*(0.3 + i*0.2), h*0.45, 18 + i*6, 0, 7); c.fill(); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.21), new THREE.MeshBasicMaterial({map:art})); pl.position.set(x, Y, Z + 0.012); g.add(pl);
  });
  if (on('flama')){ const cols = [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7];
    for (let x = 0.4, i = 0; x < W - 0.3; x += 0.32, i++){ const tri = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 3), new THREE.MeshBasicMaterial({color:cols[i % 5]})); tri.rotation.z = Math.PI; tri.position.set(x, 2.46 - Math.sin(x*1.3)*0.02, Z + 0.02); g.add(tri); } }
  if (on('led')){ const mat = new THREE.MeshBasicMaterial({color:0xff00aa}); g.userData.led = mat;
    g.add(boxP(W, 0.025, 0.025, mat, W/2, 2.53, 0.04)); g.add(boxP(0.025, 0.025, D, mat, 0.04, 2.53, D/2)); }
  if (on('odul')){ const z = D*0.25; g.add(boxP(0.14, 0.03, 1.0, M('#5b3a26'), 0.1, 2.2, z));
    const n = Math.max(1, Math.min(5, (S.awards||[]).length)), gold = M('#f5b301');
    for (let i = 0; i < n; i++){ const tz = z - 0.4 + i*0.2; g.add(cylP(0.035, 0.05, gold, 0.1, 2.245, tz)); g.add(sphP(0.045, 0.05, 0.045, gold, 0.1, 2.31, tz)); } }
  if (on('plak')) [0, 1, 2, 3].forEach(i => { const z = D*0.45 + i*0.32, d = cylP(0.13, 0.012, M('#111827'), 0.08, Y, z); d.rotation.z = Math.PI/2; g.add(d);
    const l = cylP(0.045, 0.014, M(['#ef4444','#f59e0b','#22c55e','#3b82f6'][i]), 0.085, Y, z); l.rotation.z = Math.PI/2; g.add(l); });
  if (on('pano')){ const tex = textTex('Hayal et · Kodla · Yayınla', {w:1024, h:120, font:'900 64px Nunito, system-ui, sans-serif', color:'#ffffff', bg:'#1f4aa0', r:24});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.22), new THREE.MeshBasicMaterial({map:tex, transparent:true})); m.rotation.y = Math.PI/2; m.position.set(0.1, Y, Math.min(D - 0.9, D*0.82)); g.add(m); }
  g.traverse(c => { if (c.isMesh) c.castShadow = false; });
  return g;
}
function decorTick(t){
  if (!decorG) return;
  decorG.visible = !meetG && !launchG;
  const u = decorG.userData;
  if (u.clock){ const d = new Date(), m = d.getMinutes() + d.getSeconds()/60, h = (d.getHours() % 12) + m/60; u.clock.mh.rotation.z = -m/60*Math.PI*2; u.clock.hh.rotation.z = -h/12*Math.PI*2; }
  if (u.led) u.led.color.setHSL((t*0.05) % 1, 0.9, 0.55);
  if (u.neon) u.neon.material.opacity = 0.12 + Math.abs(Math.sin(t*1.3))*0.1;
}
/* ---- GECE-GÜNDÜZ (gerçek saate göre) VE MEVSİMLER (oyun ayına göre) ---- */
const SEASON = m => (m === 11 || m <= 1) ? 'kis' : m <= 4 ? 'ilkbahar' : m <= 7 ? 'yaz' : 'sonbahar';
function buildEnv(){
  if (envG){ scene3.remove(envG); envG = null; }
  const m = envForceM != null ? envForceM : (typeof monthIdx === 'function' ? monthIdx() : 5), se = SEASON(m), W = roomBox.W, D = roomBox.D;
  envG = new THREE.Group(); envG.userData = {se, parts:[]};
  const gcol = {kis:'#eef3fa', ilkbahar:'#9ad49a', yaz:'#a8d67e', sonbahar:'#c4c27a'}[se];
  const ground = new THREE.Mesh(new THREE.BoxGeometry(W + 40, 0.1, D + 40), new THREE.MeshLambertMaterial({color:gcol})); ground.position.set(W/2, -0.24, D/2); ground.receiveShadow = false; envG.add(ground);
  const lamp = new THREE.PointLight(0xffc98a, 0, 40, 1.1); lamp.position.set(W/2, 2.4, D/2); envG.add(lamp); envG.userData.lamp = lamp;
  if (se !== 'yaz'){
    const col = {kis:0xffffff, ilkbahar:0xf9a8d4, sonbahar:0xea7a2a}[se], mat = new THREE.MeshBasicMaterial({color:col});
    for (let i = 0; i < 90; i++){
      let x, z; do { x = -3 + Math.random()*(W + 9); z = -3 + Math.random()*(D + 9); } while (x > -0.2 && x < W + 0.2 && z > -0.2 && z < D + 0.2);
      const p = new THREE.Mesh(se === 'kis' ? G.sph : G.box, mat); p.scale.setScalar(se === 'kis' ? 0.045 : 0.06);
      p.position.set(x, Math.random()*5, z); p.userData.sp = 0.4 + Math.random()*0.6; p.userData.ph = Math.random()*6; envG.add(p); envG.userData.parts.push(p);
    }
  }
  scene3.add(envG); envT = 0;
}
function envTick(t, dt){
  if (!envG) return;
  envG.visible = !meetG && !launchG;
  for (const p of envG.userData.parts){ p.position.y -= p.userData.sp*dt*(envG.userData.se === 'kis' ? 0.8 : 0.6); p.position.x += Math.sin(t*1.2 + p.userData.ph)*dt*0.25; p.rotation.x += dt*2; if (p.position.y < -0.2) p.position.y = 5; }
  envT -= dt; if (envT > 0 || alarmG) return; envT = 1;
  if (launchG){ canvas.style.filter = ''; scene3.background = new THREE.Color(0x1a1440); return; }
  { const m = envForceM != null ? envForceM : (typeof monthIdx === 'function' ? monthIdx() : 5); if (SEASON(m) !== envG.userData.se){ buildEnv(); return; } }
  const d = new Date(), h = envForceH != null ? envForceH : d.getHours() + d.getMinutes()/60;
  const day = h >= 7 && h <= 17 ? 1 : h > 17 && h < 20 ? 1 - (h - 17)/3 : h > 6 && h < 7 ? h - 6 : 0;
  const dayCol = new THREE.Color(envG.userData.se === 'kis' ? 0xdde8f3 : 0xd3e6f7), nightCol = new THREE.Color(0x0d1633);
  scene3.background = nightCol.clone().lerp(dayCol, day);
  sun.intensity = 0.3 + day*1.55; if (hemi) hemi.intensity = 0.5 + day*0.65;
  envG.userData.lamp.intensity = (1 - day)*3.2;
  canvas.style.filter = day < 0.99 ? `brightness(${(1 - 0.42*(1 - day)).toFixed(2)}) saturate(${(1 - 0.15*(1 - day)).toFixed(2)})` : '';
}
/* ---- OFİS KEDİSİ: ofiste dolaşır, arada oturup dinlenir ---- */
let catG = null, catS = null;
function buildCat(){
  const g = new THREE.Group(), fur = M('#f59e0b'), furD = M('#c2680a'), white = M('#fff4e0'), dark = M('#1f2937');
  const body = new THREE.Group(); g.add(body); g.userData.body = body;
  body.add(sphP(0.11, 0.1, 0.2, fur, 0, 0.21, 0, {outline:.05}));
  for (const z of [-0.08, 0, 0.08]) body.add(boxP(0.18, 0.012, 0.025, furD, 0, 0.305, z));
  body.add(sphP(0.07, 0.06, 0.08, white, 0, 0.17, -0.12));
  const head = new THREE.Group(); head.position.set(0, 0.31, -0.2); body.add(head); g.userData.head = head;
  head.add(sphP(0.095, 0.085, 0.085, fur, 0, 0, 0, {outline:.05}));
  for (const s of [-1, 1]){ const ear = boxP(0.045, 0.06, 0.03, furD, s*0.05, 0.085, 0); ear.rotation.z = -s*0.35; head.add(ear);
    head.add(sphP(0.013, 0.016, 0.01, dark, s*0.034, 0.01, -0.08)); }
  head.add(sphP(0.04, 0.03, 0.03, white, 0, -0.025, -0.075)); head.add(sphP(0.012, 0.009, 0.008, M('#f472b6'), 0, -0.008, -0.1));
  const tail = new THREE.Group(); tail.position.set(0, 0.26, 0.19); body.add(tail); g.userData.tail = tail;
  const tl = cylP(0.025, 0.3, fur, 0, 0.15, 0); tail.add(tl); tail.rotation.x = 0.5;
  g.userData.legs = [];
  for (const [x, z] of [[-0.06,-0.12],[0.06,-0.12],[-0.06,0.12],[0.06,0.12]]){ const l = cylP(0.025, 0.14, furD, x, 0.07, z); g.add(l); g.userData.legs.push(l); }
  g.traverse(c => { if (c.isMesh) c.castShadow = false; });
  g.scale.setScalar(1.5);
  return g;
}
function catTick(t, dt){
  if (!catG) return;
  catG.visible = !meetG && !launchG;
  const s = catS, W = roomBox.W, D = roomBox.D;
  if (!s.tx){ s.tx = 0.8 + Math.random()*(W - 1.6); s.tz = Math.min(D - 0.6, Math.max(0.6, (ROAM.lane || D*0.7) + (Math.random() - 0.5)*0.8)); }
  const u = catG.userData, dx = s.tx - catG.position.x, dz = s.tz - catG.position.z, d = Math.hypot(dx, dz);
  if (s.wait > 0){ s.wait -= dt; u.body.position.y = -0.06; u.body.rotation.x = 0.25; u.tail.rotation.z = Math.sin(t*2)*0.4; u.head.rotation.y = Math.sin(t*0.7)*0.5;
    for (const l of u.legs) l.visible = false; if (s.wait <= 0) s.tx = 0; return; }
  for (const l of u.legs) l.visible = true;
  u.body.position.y = Math.abs(Math.sin(t*9))*0.015; u.body.rotation.x = 0; u.tail.rotation.z = Math.sin(t*4)*0.25; u.head.rotation.y = 0;
  u.legs.forEach((l, i) => { l.position.y = 0.07 + Math.max(0, Math.sin(t*9 + (i%2 ? Math.PI : 0)))*0.03; });
  if (d < 0.05){ s.wait = 3 + Math.random()*6; return; }
  const step = Math.min(d, 0.55*dt);
  catG.position.x += dx/d*step; catG.position.z += dz/d*step;
  catG.rotation.y = Math.atan2(-dx, -dz);
}
const api = {
  ok:false,
  alarm(on){ alarmOn(!!on); },
  launch(on, info){ launchOn(!!on, info); },
  launchClap(){ if (launchG){ launchG.userData.clap = true; launchG.userData.clapT = clock.elapsedTime - launchG.userData.t0; } },
  env(h, m){ envForceH = h; envForceM = m; buildEnv(); },
  meeting(on){ meetingOn(!!on); },
  inMeeting(){ return !!meetG; },
  build(){ build(); },
  setStates(state){ for (const [id, P] of chars) P.wantWork = !!state[id]; },
  idle(){ const out = []; for (const [id, P] of chars) if (!P.wantWork) out.push(id); return out; },
  all(){ return [...chars.keys()]; },
  pick(e){
    if (e.target !== canvas) return {empty:true};
    ray.setFromCamera(ndcFromEvent(e), camera);
    const hits = meetG ? [] : ray.intersectObject(roomG, true);
    // önce en yakın karakteri ekranda ara (küçük ve hareket eden karakterlere dokunmak kolay olsun)
    const n = ndcFromEvent(e), cw = canvas.clientWidth, ch = canvas.clientHeight, px = (n.x+1)/2*cw, py = (1-n.y)/2*ch;
    let best = null, bd = 34;
    for (const [id, P] of chars){
      const node = P.roam && P.W ? P.W.root : P.root;
      for (const hgt of [0.35, 0.8, 1.25]){
        const w = node.localToWorld(V(0, hgt, 0)).project(camera), sx = (w.x+1)/2*cw, sy = (1-w.y)/2*ch, d = Math.hypot(sx-px, sy-py);
        if (d < bd){ bd = d; best = id; }
      }
    }
    if (best != null) return {cid:String(best)};
    for (const h of hits){ let o = h.object; while (o && o.userData.cid === undefined) o = o.parent; if (o) return {cid:String(o.userData.cid)}; }
    return hits.length ? {room:true} : {empty:true};
  },
  fx(id, html, cls, dx=0, dy=0){
    const p = headScreen(id); if (!p) return;
    if (fxLayer.childElementCount > 30) return;
    const d = document.createElement('div'); d.className = 'fx3 ' + cls; d.style.left = (p[0]+dx)+'px'; d.style.top = (p[1]+dy)+'px';
    d.innerHTML = html; fxLayer.appendChild(d); setTimeout(() => d.remove(), cls==='say3' ? 2450 : 1450);
  },
  setZoom(z){ zoom3 = THREE.MathUtils.clamp(z, 1, 3); if (zoom3 === 1) pan3 = [0, 0]; applyView3(); },
  zoom(){ return zoom3; },
  panStart(e){ if (zoom3 <= 1) return; drag3 = {x:e.clientX, y:e.clientY, p:pan3.slice()}; },
  panMove(e){ if (!drag3) return; const k = (view.hw*2/zoom3) / Math.max(1, canvas.getBoundingClientRect().width); pan3 = [drag3.p[0] - (e.clientX-drag3.x)*k, drag3.p[1] + (e.clientY-drag3.y)*k]; applyView3(); },
  panEnd(){ drag3 = null; },
  // karakter seçimi için küçük resim: masada oturan, arkası dönük karakter (ofisteki ile aynı model)
  thumb(L, key){
    if (thumbCache.has(key)) return thumbCache.get(key);
    if (!thumbR){ thumbR = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true}); thumbR.setPixelRatio(2); thumbR.setSize(220, 220); }
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xeaf4ff, 0x9a8f80, 1.25));
    const dl = new THREE.DirectionalLight(0xfff3e0, 1.7); dl.position.set(2.5, 4, 3); sc.add(dl);
    const fill = new THREE.DirectionalLight(0xbcd7ff, 0.5); fill.position.set(-3, 2, -1); sc.add(fill);
    const g = new THREE.Group(); sc.add(g);
    g.add(rbox(1.3, 0.05, 0.66, 0.012, M('#e2c49a'), 0, 0.74, -0.8, {outline:.012}));
    for (const s of [-1,1]) g.add(boxP(0.05, 0.72, 0.6, M('#262a33'), s*0.6, 0.36, -0.8));
    buildMonitors(g, 2, -0.8, 'prog', 1, 1.3);
    buildKeyboard(g, 2, 0, 0.775, -0.63);
    g.add(cylP(0.04, 0.09, M('#2f54eb'), -0.45, 0.81, -0.62, {outline:.05}));
    const P = buildPerson('thumb', 'prog', L, false, {chair:0});   // alçak arkalık: kıyafet görünsün
    P.state = 1; g.add(P.root); animPerson(P, 1.3, 0.016);
    const cam = new THREE.OrthographicCamera(-0.6, 0.6, 0.6, -0.6, 0.1, 30);
    cam.position.set(2.5, 1.85, 1.15); cam.lookAt(-0.05, 0.8, -0.25);
    thumbR.render(sc, cam);
    const url = thumbR.domElement.toDataURL('image/png');
    thumbCache.set(key, url);
    sc.traverse(o => { if (o.isMesh && o.userData.merged) o.geometry.dispose(); });
    return url;
  },
  head(id){ return headScreen(id); },
  _room(){ return roomG; },
  _roam(){ return {spots:ROAM.spots.length, lane:ROAM.lane, ppl:[...chars.values()].map(P => (P.wantWork?'W':'i') + (P.roam ? P.roam.mode+':'+P.roam.spot.kind : '-'))}; },
  _info(){ const t0 = performance.now(); renderer.render(scene3, camera); return {calls:renderer.info.render.calls, tris:renderer.info.render.triangles, ms:+(performance.now()-t0).toFixed(1), px:[renderer.domElement.width, renderer.domElement.height]}; },
};
window.S3D = api;

function init(){
  sceneEl = document.getElementById('scene');
  try {
    renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
  } catch(e){ console.warn('3D açılamadı, 2D sahne kullanılıyor', e); return; }
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  canvas = renderer.domElement; canvas.className = 'scene3d';
  scene3 = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  hemi = new THREE.HemisphereLight(0xeaf4ff, 0x9a8f80, 1.15); scene3.add(hemi);
  sun = new THREE.DirectionalLight(0xfff3e0, 1.85); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  scene3.add(sun); scene3.add(sun.target);
  const fill = new THREE.DirectionalLight(0xbcd7ff, 0.45); fill.position.set(-6, 5, 3); scene3.add(fill);
  fxLayer = document.createElement('div'); fxLayer.className = 'fx3layer';
  nameLayer = document.createElement('div'); nameLayer.className = 'fx3layer namelayer';
  api.ok = true;
  sceneKey = '';                 // eski 2D sahneyi 3D ile değiştir
  if (typeof S !== 'undefined' && S && typeof renderScene === 'function') renderScene();
  requestAnimationFrame(loop);
}
// sahne kabını 3D için hazırla (renderScene çağırır)
api.mount = function(){
  if (!sceneEl.contains(canvas)){ sceneEl.innerHTML = ''; sceneEl.appendChild(canvas); sceneEl.appendChild(nameLayer); sceneEl.appendChild(fxLayer); lastW = 0; }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
