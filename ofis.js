'use strict';
/* =====================================================================
   Bytetown – izometrik ofis sahnesi + arayüz ikonları
   Oda, masalar, karakterler, ekran içerikleri ve baloncuk efektleri.
   Ana oyun durumu (S) ve yardımcılar index.html içindeki betikten gelir.
   ===================================================================== */
const NS = 'http://www.w3.org/2000/svg';
const TW = 64, TH = 32, WALLH = 88;

// 0 Garaj · 1 Stüdyo Daire · 2 Ofis · 3 Büyük Ofis · 4 Gökdelen Katı
const ROOMS = [
  {w:6,  d:6,  wall:'#d9d4cc', floor:'#bdb8af', base:'#8d877d', desk:['#b98a5a','#4b4f63']},
  {w:10, d:7,  wall:'#f3f0ea', floor:'#845a3c', base:'#2b303b', desk:['#e2c49a','#262a33']},
  {w:12, d:9,  wall:'#e9ecf1', floor:'#8e9ab0', base:'#3c4a66', desk:['#f7f7f5','#5d6474']},
  {w:15, d:11, wall:'#f3f1ec', floor:'#d8bd94', base:'#2b2f3a', desk:['#e2c49a','#262a33']},
  {w:22, d:14, wall:'#e9edf2', floor:'#e2e5ea', base:'#2b303b', desk:['#ffffff','#7a5434'], glass:true},
];
const SKINS = ['#fcdcbf','#f3c592','#e2a96f','#c6864f','#8d5a37'];
const HAIRS = ['#2b1a10','#4a2c1a','#7a4424','#c58b3c','#151821','#8b2d1a','#d9d4cc','#5b3a8c'];
const SHIRTS = {prog:['#6c8cf5','#4f6fe0','#5aa0f0','#7c6cf0'], tas:['#f472b6','#fb7185','#e879f9','#f9a8d4'], test:['#fbbf24','#fb923c','#f59e0b','#fca5a5'], me:['#2f54eb']};

let sceneKey = '', seatPos = {}, fxAcc = {}, chatterT = 0, tagPts = {}, fxBurst = {}, fxKind = {};

/* ---------- arayüz ikonları (elle çizilmiş SVG, emoji yerine) ---------- */
const ICV = '#2f54eb', ICO = '#1e97f6', ICP = '#dcf0ff';
const svgI = inner => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
const IC = {
  sirket: svgI(`<rect x="4.5" y="5" width="15" height="10.5" rx="2" fill="#fff"/><path d="M9.6 8.4 7.6 10.2l2 1.8M14.4 8.4l2 1.8-2 1.8" stroke="${ICV}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 17h19l-1.6 2.6H4.1z" fill="#fff"/>`),
  para: svgI(`<circle cx="12" cy="12" r="9" fill="#fff"/><circle cx="12" cy="12" r="6.6" fill="${ICP}"/><path d="M10.4 7.6v8.6c2.8 0 4.6-1.2 4.6-3.6M8.6 11.2l4.8-1.6M8.6 13.6l4.8-1.6" stroke="${ICO}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  yildiz: svgI(`<path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="11.6" r="2" fill="${ICP}"/>`),
  takvim: svgI(`<rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="#fff"/><rect x="3.5" y="5" width="17" height="4.6" rx="2" fill="${ICP}"/><path d="M8 3v4M16 3v4" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><g fill="${ICV}"><rect x="7" y="12" width="2.4" height="2.4" rx=".7"/><rect x="10.8" y="12" width="2.4" height="2.4" rx=".7"/><rect x="14.6" y="12" width="2.4" height="2.4" rx=".7"/><rect x="7" y="15.8" width="2.4" height="2.4" rx=".7"/><rect x="10.8" y="15.8" width="2.4" height="2.4" rx=".7"/></g>`),
  hediye: svgI(`<path d="M12 9c-1.4-3.8-6.2-4.6-6.2-1.8 0 1.4 2.2 1.8 6.2 1.8zm0 0c1.4-3.8 6.2-4.6 6.2-1.8 0 1.4-2.2 1.8-6.2 1.8z" fill="#fff"/><rect x="3.5" y="9" width="17" height="4" rx="1.3" fill="#fff"/><rect x="5" y="13" width="14" height="8" rx="1.6" fill="#fff"/><rect x="10.8" y="9" width="2.4" height="12" fill="${ICV}"/>`),
  ayar: svgI(`<path d="M12 2.8l1.6 2.3 2.7-.8.6 2.8 2.7.9-.8 2.7 2.3 1.6-2.3 1.6.8 2.7-2.7.9-.6 2.8-2.7-.8L12 21.2l-1.6-2.3-2.7.8-.6-2.8-2.7-.9.8-2.7L2.8 12l2.3-1.6-.8-2.7 2.7-.9.6-2.8 2.7.8z" fill="#fff" stroke="#fff" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.4" fill="${ICV}"/>`),
  ofis: svgI(`<rect x="5" y="3" width="14" height="18" rx="2.6" fill="#fff"/><g fill="${ICV}"><rect x="8" y="6.4" width="2.7" height="2.7" rx=".8"/><rect x="13.3" y="6.4" width="2.7" height="2.7" rx=".8"/><rect x="8" y="10.8" width="2.7" height="2.7" rx=".8"/><rect x="13.3" y="10.8" width="2.7" height="2.7" rx=".8"/></g><rect x="10.2" y="15.4" width="3.6" height="5.6" rx="1.1" fill="${ICO}"/>`),
  ekip: svgI(`<circle cx="16.3" cy="8.6" r="3" fill="${ICP}"/><path d="M13.4 14c.9-.5 1.9-.8 2.9-.8 2.9 0 5.1 2.1 5.1 5.1v1.2h-5.6" fill="${ICP}"/><circle cx="9" cy="8" r="3.7" fill="#fff"/><path d="M2.6 19.6c0-3.7 2.9-6.2 6.4-6.2s6.4 2.5 6.4 6.2z" fill="#fff"/>`),
  urunler: svgI(`<path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z" fill="#fff" stroke="#fff" stroke-linejoin="round"/><path d="M3.8 7.2 12 11.3l8.2-4.1M12 11.3v9.6" stroke="${ICO}" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M7.6 4.9l8.3 4.2v3.1" stroke="${ICV}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  banka: svgI(`<path d="M12 2.5 21 7.6H3z" fill="#fff" stroke="#fff" stroke-linejoin="round"/><circle cx="12" cy="5.7" r="1.2" fill="${ICO}"/><g fill="#fff"><rect x="5" y="9.4" width="2.7" height="7.4" rx=".9"/><rect x="10.65" y="9.4" width="2.7" height="7.4" rx=".9"/><rect x="16.3" y="9.4" width="2.7" height="7.4" rx=".9"/></g><rect x="3" y="18" width="18" height="3" rx="1.1" fill="#fff"/>`),
  tekno: svgI(`<g stroke="#fff" stroke-width="1.9" stroke-linecap="round"><path d="M9 2.6v2.4M12 2.6v2.4M15 2.6v2.4M9 19v2.4M12 19v2.4M15 19v2.4M2.6 9h2.4M2.6 12h2.4M2.6 15h2.4M19 9h2.4M19 12h2.4M19 15h2.4"/></g><rect x="5.3" y="5.3" width="13.4" height="13.4" rx="2.8" fill="#fff"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="${ICV}"/><circle cx="7.8" cy="7.8" r=".9" fill="${ICO}"/>`),
  gelis: svgI(`<path d="M14.8 3.2a5 5 0 0 0-4.6 6.9L3.6 16.7a2 2 0 0 0 2.8 2.8l6.6-6.6a5 5 0 0 0 6.9-4.6l-3 3-2.8-.8-.8-2.8z" fill="#fff" stroke="#fff" stroke-linejoin="round"/><circle cx="5" cy="18.1" r="1.1" fill="${ICO}"/><path d="M19 15.5v4M17 17.5h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`),
  yatirim: svgI(`<rect x="3" y="3" width="18" height="18" rx="4" fill="#fff"/><g fill="${ICP}"><rect x="6.4" y="13.4" width="2.8" height="4.8" rx=".9"/><rect x="10.6" y="11" width="2.8" height="7.2" rx=".9"/><rect x="14.8" y="8.4" width="2.8" height="9.8" rx=".9"/></g><path d="M6 11 10.2 7.6l3 1.8 4.6-4" stroke="${ICV}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17.8" cy="5.4" r="1.3" fill="${ICO}"/>`),
  sirala: svgI(`<path d="M7.6 5H4.4v1.6A3.4 3.4 0 0 0 7.8 10M16.4 5h3.2v1.6A3.4 3.4 0 0 1 16.2 10" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M7 3.4h10v5.2a5 5 0 0 1-10 0z" fill="#fff"/><rect x="10.8" y="13" width="2.4" height="3.8" fill="#fff"/><rect x="7.4" y="16.6" width="9.2" height="4" rx="1.4" fill="#fff"/><path d="M12 5.2l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" fill="${ICO}"/>`),
  zarf: svgI(`<rect x="3" y="5.5" width="18" height="13" rx="2.6" fill="#fff"/><path d="M4 7.2l8 6 8-6" stroke="${ICV}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  arti: svgI(`<path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>`),
};
// iş puanı simgeleri (yazılıma uyarlanmış: Kod, Arayüz, Hata, Ar-Ge) – renk verilebilir
const GL = {
  kod:  c => `<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.4 4.5l-2.8 15" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  ui:   c => `<rect x="3.5" y="4" width="17" height="16" rx="3" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M3.5 9.2h17M9.6 9.2V20" stroke="${c}" stroke-width="2.4"/>`,
  bug:  c => `<ellipse cx="12" cy="14" rx="5" ry="6" fill="${c}"/><circle cx="12" cy="7" r="2.8" fill="${c}"/><path d="M7 11.5 3.6 10M7 15H3.4M7.6 18.6 4.8 20.6M17 11.5l3.4-1.5M17 15h3.4M16.4 18.6l2.8 2" stroke="${c}" stroke-width="1.9" stroke-linecap="round"/>`,
  arge: c => `<path d="M9.4 3.5h5.2M10.4 3.5V9L5 18.3A1.9 1.9 0 0 0 6.6 21h10.8a1.9 1.9 0 0 0 1.6-2.7L13.6 9V3.5" stroke="${c}" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M7.4 15h9.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
};
const PTC = {kod:'#2f54eb', ui:'#1e97f6', bug:'#ffffff', arge:'#0d1b5c', rp:'#0ea5e9'};
const PTG = {kod:'#ffffff', ui:'#ffffff', bug:'#2f54eb', arge:'#ffffff', rp:'#ffffff'};
Object.assign(IC, {
  kod: svgI(GL.kod('#fff')), ui: svgI(GL.ui('#fff')), bug: svgI(GL.bug('#fff')), arge: svgI(GL.arge('#fff')),
  t_web:   svgI(`<circle cx="12" cy="12" r="8.4" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M3.6 12h16.8M12 3.6c-3 3.2-3 13.6 0 16.8M12 3.6c3 3.2 3 13.6 0 16.8" stroke="#fff" stroke-width="1.8" fill="none"/>`),
  t_mobil: svgI(`<rect x="7" y="2.8" width="10" height="18.4" rx="2.6" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="12" cy="17.6" r="1.2" fill="#fff"/><path d="M10.5 5.6h3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`),
  t_oyun:  svgI(`<path d="M7 8h10a4.5 4.5 0 0 1 4.3 5.8l-1 3.3a2.4 2.4 0 0 1-4 1L14.6 16H9.4l-1.7 2.1a2.4 2.4 0 0 1-4-1l-1-3.3A4.5 4.5 0 0 1 7 8z" fill="#fff"/><path d="M7.5 10.6v3.2M5.9 12.2h3.2" stroke="${ICV}" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.8" cy="11.2" r="1.05" fill="${ICO}"/><circle cx="17.7" cy="13.1" r="1.05" fill="${ICO}"/>`),
  t_ai:    svgI(`<rect x="4" y="4" width="16" height="16" rx="4.2" fill="#fff"/><path d="M8.2 16 10.4 8h1.2l2.2 8M9 13.4h3.8M16 8v8" stroke="${ICV}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
});
function fillIcons(root){ (root||document).querySelectorAll('[data-ic]').forEach(el => { if (!el._ic){ el.innerHTML = IC[el.dataset.ic] || ''; el._ic = 1; } }); }

/* ---------- geometri yardımcıları ---------- */
function P(x,y,z=0){ return [(x-y)*TW/2, (x+y)*TH/2 - z]; }
const f1 = n => Math.round(n*10)/10;
const pt = a => f1(a[0])+','+f1(a[1]);
function poly(ps, fill, extra=''){ return `<polygon points="${ps.map(pt).join(' ')}" fill="${fill}" ${extra}/>`; }
function seg(a, b, stroke, w=1, extra=''){ return `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`; }
function shade(hex, f){
  const n = parseInt(hex.slice(1),16); let r=n>>16, g=(n>>8)&255, b=n&255;
  r = Math.max(0,Math.min(255,Math.round(r*f))); g = Math.max(0,Math.min(255,Math.round(g*f))); b = Math.max(0,Math.min(255,Math.round(b*f)));
  return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
}
function box(x,y,w,d,h,z,top,left,right){
  left = left || shade(top,.86); right = right || shade(top,.72);
  return poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)], left) +
         poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)], right) +
         poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)], top);
}
// y = y0 düzlemi (arka sağ duvar yüzü gibi), x: a..b
const faceY = (y0,a,b,z1,z2,fill,extra='') => poly([P(a,y0,z1),P(b,y0,z1),P(b,y0,z2),P(a,y0,z2)], fill, extra);
// x = x0 düzlemi (arka sol duvar yüzü gibi), y: a..b
const faceX = (x0,a,b,z1,z2,fill,extra='') => poly([P(x0,a,z1),P(x0,b,z1),P(x0,b,z2),P(x0,a,z2)], fill, extra);
const floorShadow = (x,y,w,d,o=.13) => poly([P(x-0.04,y+0.06),P(x+w+0.08,y+0.06),P(x+w+0.08,y+d+0.12),P(x-0.04,y+d+0.12)], `rgba(13,27,92,${o})`);
const tr = (p, inner, extra='') => `<g transform="translate(${f1(p[0])},${f1(p[1])})" ${extra}>${inner}</g>`;
const wallTextMatrix = p => `matrix(0.894,0.447,0,1,${f1(p[0])},${f1(p[1])})`;
const STAR = (y, s=1) => `<path transform="translate(0,${y}) scale(${s})" d="M0,-6 L1.8,-1.9 6.2,-1.6 2.8,1.3 3.8,5.6 0,3.3 -3.8,5.6 -2.8,1.3 -6.2,-1.6 -1.8,-1.9Z" fill="#fbbf24" stroke="#b45309" stroke-width=".9" stroke-linejoin="round"/>`;

/* ---------- görünüş ---------- */
// kurucunun seçebildiği hazır görünüşler: birkaç saç, birkaç kıyafet, birkaç aksesuar
const HAIR_OPTS = {
  k:[{ad:'Uzun saç', hs:1, hc:2}, {ad:'At kuyruğu', hs:2, hc:3}, {ad:'Topuz', hs:3, hc:4}],
  e:[{ad:'Kısa saç', hs:0, hc:0}, {ad:'Kıvırcık', hs:4, hc:4}, {ad:'Kazıtılmış', hs:5, hc:1}],
};
const OUTFIT_OPTS = [
  {ad:'Kapüşonlu', kind:'hoodie', renk:'#2f54eb'},
  {ad:'Gömlek',    kind:'shirt',  renk:'#e6edf8'},
  {ad:'Tişört',    kind:'tee',    renk:'#ef4444'},
  {ad:'Ceket',     kind:'blazer', renk:'#263043'},
];
const ACCS = ['Yok','Gözlük','Kulaklık'];
// kayıtlı seçimden görünüş: {g:'k'|'e', hair, out, ac, sk}
function lookFrom(m){
  const hl = HAIR_OPTS[m.g==='k' ? 'k' : 'e'], H = hl[(m.hair||0) % hl.length], O = OUTFIT_OPTS[(m.out||0) % OUTFIT_OPTS.length];
  return {skin:SKINS[(m.sk||0) % SKINS.length], hair:HAIRS[H.hc], shirt:O.renk, kind:O.kind, hs:H.hs, long:H.hs===1, glasses:m.ac===1, phones:m.ac===2, beard:false, f:m.g==='k'};
}
// çalışanların görünüşü (aynı kişi ofiste ve portrede aynı görünsün)
const EMP_KINDS = ['tee','hoodie','shirt','sweater'];
function empLook(id, role, female){
  const h = hashN(id*7919+13), set = SHIRTS[role] || SHIRTS.prog;
  const hs = female ? [1,1,2,3,4][(h>>12)%5] : [0,0,0,4,5][(h>>12)%5];
  return {skin:SKINS[h%SKINS.length], hair:HAIRS[(h>>3)%HAIRS.length], shirt:set[(h>>6)%set.length], kind:EMP_KINDS[(h>>14)%4], hs, long:hs===1,
          glasses:((h>>9)%4)===0, phones:((h>>16)%7)===0, beard:!female && ((h>>11)%5)===0, f:!!female};
}
function looksOf(id, role){
  if (role==='me' && S && S.me) return lookFrom(S.me);
  if (id==='mgr' && S && S.mgr) return empLook(S.mgr.seed || 777, 'prog', !!S.mgr.f);
  if (typeof id !== 'number') return empLook(4242, 'prog', false);
  const e = S.emps.find(x=>x.id===id);
  return empLook(id, role, e ? nameFem(e.name) : false);
}
/* ---------- karakter ---------- */
function charSVG(id, role, F, lead, look){
  // yarı gerçekçi, masada oturan insan (arkadan-yandan): geniş omuzlar, dirsekli kollar, tutamlı saç,
  // kulak/burun/yanak, kot pantolon, bağcıklı ayakkabı ve fileli ofis koltuğu
  const L = look || looksOf(id, role);
  const h = hashN((typeof id==='number' ? id : 7)*131 + 3);
  const d1 = ((h%100)/100*4).toFixed(2), d2 = (((h>>4)%100)/100*3).toFixed(2);
  const shirt = L.shirt, shirtD = shade(shirt,.72), shirtDD = shade(shirt,.58), shirtL = shade(shirt,1.22);
  const skin = L.skin, skinD = shade(skin,.84), skinDD = shade(skin,.72);
  const hair = L.hair, hairL = shade(hair,1.75), hairD = shade(hair,.68);
  const chair = S && S.upg.sandalye ? '#2f54eb' : '#7a7f8e', chairD = shade(chair,.7), chairL = shade(chair,1.35);
  const kind = L.kind || 'tee', hoodie = kind==='hoodie', sleeve = kind!=='tee';
  const pants = ['#2b3a67','#3d3a52','#5b4636','#1f2937','#4a5a85'][(h>>5)%5], pantsD = shade(pants,.74), pantsL = shade(pants,1.3);
  const shoe = ['#1b1830','#f8fafc','#7c2d12','#334155'][(h>>10)%4], sole = shoe==='#f8fafc' ? '#94a3b8' : '#f1f5f9', shoeD = shade(shoe,.8);
  const arm = sleeve ? shirt : skin, armD = sleeve ? shirtD : skinD;
  const crown = role==='me' ? `<path d="M-6.3,-59.6 l1.5,-4.4 l2.7,3 l2.7,-3 l1.5,4.4z" fill="#fbbf24" stroke="#b45309" stroke-width=".7" stroke-linejoin="round"/>` : '';
  const star = lead ? `<g>${STAR(-70, 0.8)}</g>` : '';
  const tap = (dur, beg) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="${dur}s" repeatCount="indefinite" begin="-${beg}s"/>`;
  const mdur = (4.6 + (h%4)*0.7).toFixed(1);
  const mv = (attr, a, b) => `<animate attributeName="${attr}" values="${a};${a};${b};${b};${a}" keyTimes="0;.55;.63;.88;1" dur="${mdur}s" repeatCount="indefinite" begin="-${d1}s"/>`;
  // dış çizgi: önce biraz daha kalın ve koyu bir çizgi, üstüne asıl renk (illüstrasyon görünümü)
  const ol = (d, w, col, extra='') => `<path d="${d}" stroke="${col}" stroke-width="${(w+1.1).toFixed(1)}" fill="none" stroke-linecap="round" ${extra}/>`;
  const armK = 'M2,-29 Q-10,-30 -22.6,-30', armM = 'M2,-29 Q-12,-28 -29.8,-26.4';
  // ---- saç (arkadan): 0 kısa, 1 uzun, 2 at kuyruğu, 3 topuz, 4 kıvırcık, 5 kazıtılmış ----
  const hs = L.hs || 0;
  const cap = `<path d="M-8.6,-50.4 C-8.6,-55.8 -4.6,-57 -2,-56.9 C3.2,-56.7 5.1,-52.5 4.5,-47.4 C4.2,-44.6 3.3,-43 2.2,-42.4 C2,-44.8 1.6,-46.3 .3,-50.2 C-2.6,-51.5 -5.8,-51.1 -8.6,-50.4Z" fill="${hair}" stroke="${hairD}" stroke-width=".5"/>
    <path d="M-8.6,-50.4 C-8.6,-55.8 -4.6,-57 -2,-56.9 C3.2,-56.7 5.1,-52.5 4.5,-47.4 C4.2,-44.6 3.3,-43 2.2,-42.4 C2,-44.8 1.6,-46.3 .3,-50.2 C-2.6,-51.5 -5.8,-51.1 -8.6,-50.4Z" fill="url(#gGloss)"/>
    <path d="M-8.6,-50.4 C-6.8,-50.9 -4.2,-51.2 -1.8,-50.6 C-4,-52.2 -6.6,-52 -8.6,-50.4Z" fill="${hairD}" opacity=".6"/>
    <path d="M-5.2,-55.2 Q-1,-57.6 2.8,-54.6 Q-.8,-55.4 -3.8,-54.1Z" fill="${hairL}" opacity=".55"/>
    <path d="M3.4,-53.4 q1.8,2.6 1.3,6.4 M1.2,-55.4 q2.6,2 2.6,6.6 M-1.4,-56.2 q2.8,1.6 3,5.4 M2.4,-46.4 q.4,2 .1,3.4" stroke="${hairD}" stroke-width=".55" fill="none" stroke-linecap="round" opacity=".75"/>
    <path d="M-3.2,-53.8 q2,-.8 4,.4" stroke="${hairL}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".6"/>`;
  const curls = hs===4 ? [[-9,-52],[-7,-56.4],[-2.6,-58.6],[2.4,-57.8],[5.8,-54.4],[7,-49.6],[6.2,-44.8],[3.6,-41.6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.7" fill="${hair}"/>`).join('') : '';
  const hairBehind = hs===4 ? `<ellipse cx="-1.2" cy="-50" rx="8.4" ry="8.6" fill="${hair}"/>${curls}<circle cx="1.6" cy="-56" r="1.6" fill="${hairL}" opacity=".35"/><circle cx="5.2" cy="-51.6" r="1.2" fill="${hairL}" opacity=".3"/>`
    : hs===1 ? `<path d="M.4,-54.4 Q6.8,-50.6 6.2,-41.6 Q6,-37.2 4.4,-34.8 Q.6,-33.8 -3.4,-35.6 Q-1.8,-40.8 -1,-45.8Z" fill="${hair}"/><path d="M3.8,-48 Q5,-41.6 3.4,-36.6 M1.6,-46 Q2.4,-40 .8,-35.8" stroke="${hairD}" stroke-width=".6" fill="none"/><path d="M2.6,-50 Q4.2,-45 3.6,-41" stroke="${hairL}" stroke-width=".6" fill="none" opacity=".5"/>` : '';
  const hairFront = hs===2 ? `<path d="M3,-51.2 Q9.2,-49.6 8.4,-41.6 Q7.8,-38.2 6.2,-39.8 Q6.6,-45.2 2.8,-47Z" fill="${hair}"/><path d="M5.2,-48.4 Q7.4,-45 6.6,-40.8" stroke="${hairD}" stroke-width=".55" fill="none"/><rect x="3.2" y="-50.4" width="2" height="1.6" rx=".6" fill="${shirt}" transform="rotate(25 4.2 -49.6)"/>`
    : hs===3 ? `<circle cx=".8" cy="-57.6" r="3.5" fill="${hair}"/><path d="M-1.6,-58.4 q2.4,-2 4.8,-.2 M-1.4,-56.6 q2.6,1.2 4.6,-.4" stroke="${hairD}" stroke-width=".55" fill="none" opacity=".8"/><path d="M-.6,-59.6 q1.4,-.8 2.6,0" stroke="${hairL}" stroke-width=".5" fill="none" opacity=".6"/>` : '';
  const capOp = hs===5 ? ' opacity=".42"' : '';
  const glasses = L.glasses ? `<ellipse cx="-7.4" cy="-49.4" rx=".8" ry="1.25" fill="rgba(255,255,255,.35)" stroke="#334155" stroke-width=".45"/><path d="M-6.6,-49.6 L.4,-49.9" stroke="#334155" stroke-width=".45" fill="none" stroke-linecap="round"/>` : '';
  const phones = L.phones ? `<path d="M-5,-56.6 Q.6,-58.8 2.6,-51.4" stroke="#1f2937" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M-4.4,-56.9 Q.4,-58.4 2.2,-52.6" stroke="#64748b" stroke-width=".5" fill="none"/><ellipse cx="1.5" cy="-48.6" rx="2.2" ry="2.9" fill="#1f2937"/><ellipse cx="1.3" cy="-48.6" rx="1" ry="1.7" fill="${shirt}"/>` : '';
  const beard = L.beard ? `<path d="M-8.1,-46.6 Q-7.2,-41.6 -2.4,-41.6 Q.4,-42 1,-44.8 L.3,-47.2 Q-1.6,-44 -4.8,-44.4 Q-7,-45 -8.1,-46.6Z" fill="${hair}" opacity=".92"/><path d="M-6.8,-44.6 q2,1.6 4.6,1.2" stroke="${hairD}" stroke-width=".5" fill="none" opacity=".7"/>` : '';
  // yaka: kıyafet türüne göre (kapüşonlu, gömlek, ceket, kazak, tişört)
  const collar = kind==='hoodie'
    ? `<path d="M-7,-41.4 Q-2,-47.6 4.6,-41.6 Q4.4,-38.2 -1.2,-37.8 Q-6.4,-38 -7,-41.4Z" fill="${shirtD}" stroke="${shirtDD}" stroke-width=".45"/><path d="M-5.6,-41 Q-1.6,-45.4 3.4,-41.2" stroke="${shirtDD}" stroke-width=".7" fill="none"/><path d="M-4.4,-39.6 Q-1.2,-38.4 2,-39.6" stroke="${shirtDD}" stroke-width=".6" fill="none" opacity=".7"/>`
    : kind==='shirt'
    ? `<path d="M-9.4,-37.4 Q0,-35.2 9.6,-37.6" stroke="${shirtDD}" stroke-width=".5" fill="none" opacity=".7"/><path d="M-5.8,-41.4 L-1.6,-38.8 L2.6,-41.4 L2.2,-43.4 L-5.4,-43.4Z" fill="${shirtL}" stroke="${shirtDD}" stroke-width=".5"/><path d="M-1.6,-38.9 L-1.6,-43.2" stroke="${shirtDD}" stroke-width=".4"/>`
    : kind==='blazer'
    ? `<path d="M-7.2,-41 Q-1.6,-38 3.8,-41.2 L3.4,-39.2 Q-1.6,-36.4 -6.6,-39Z" fill="${shirtDD}"/><path d="M-5.6,-41.8 L-1.6,-39.6 L2.4,-41.8 L2,-43.6 L-5.2,-43.6Z" fill="#f8fafc" stroke="#94a3b8" stroke-width=".45"/><path d="M-9.6,-36.6 Q-9.4,-34 -8.6,-31.6 M9.8,-36.8 Q9.6,-34 9,-31.6" stroke="${shirtL}" stroke-width=".5" fill="none" opacity=".5"/>`
    : kind==='sweater'
    ? `<path d="M-5.6,-41.4 Q-1.8,-38.2 2.4,-41.4" stroke="${shirtD}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-4.6,-40.6 l.2,1 M-3,-39.8 l.1,1 M-1.4,-39.6 v1 M.2,-39.8 l-.1,1 M1.6,-40.4 l-.2,1" stroke="${shirtDD}" stroke-width=".35"/>`
    : `<path d="M-5.2,-41.2 Q-1.8,-38.6 2,-41.2" stroke="${shirtDD}" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M-5.4,-41.6 Q-1.8,-39.4 2.2,-41.6" stroke="${shirtL}" stroke-width=".5" fill="none" opacity=".6"/>`;
  // öne eğik oturuş: gövde, omuzlar ve baş kalçadan öne doğru eğilir (kollar ve eller klavyede kalır)
  const LEAN = 'matrix(1,0,0.14,1,2.38,0)';
  // kısa saçta dağınık tutamlar
  const tufts = hs===0 ? [[-7.4,-53.6,-8.8,-55.4],[-4.9,-55.4,-5.9,-57.4],[-2.2,-56.3,-2.6,-58.4],[.7,-56.1,1.3,-58.1],[3.1,-54.6,4.3,-56.2],[4.3,-51.6,5.6,-52.6]]
      .map(([x,y,tx,ty]) => `<path d="M${x-2},${y+.8} Q${tx-.6},${ty+.9} ${tx},${ty} Q${x+.9},${y-.1} ${x+2},${y+.8}Z" fill="${hair}" stroke="${hairD}" stroke-width=".4" stroke-linejoin="round"/>`).join('') : '';
  // eller: başparmaklı el, parmak çizgileri
  const handF = `<path d="M-13.6,-36.2 Q-16.2,-37.6 -18.4,-36.4 Q-19.2,-35.2 -18,-34.2 Q-15.8,-33.4 -13.6,-34.2Z" fill="${skinD}" stroke="${skinDD}" stroke-width=".45"/><path d="M-17.2,-36 l-.9,.2 M-17.4,-35 l-.9,.2" stroke="${skinDD}" stroke-width=".35" stroke-linecap="round"/>`;
  const handN = `<path d="M-20.6,-31.6 Q-24.2,-33 -26.4,-31.4 Q-27.2,-29.8 -25.6,-28.8 Q-23,-27.8 -20.4,-28.8Z" fill="${skin}" stroke="${skinDD}" stroke-width=".45"/><path d="M-22.4,-28.6 q-1.4,1.2 -3,.9" stroke="${skinDD}" stroke-width=".45" fill="none" stroke-linecap="round"/><path d="M-25.2,-31 l-1,.3 M-25.6,-30 l-1,.3" stroke="${skinDD}" stroke-width=".35" stroke-linecap="round"/>`;
  // file sandalye arkası
  const mesh = Array.from({length:7}, (_,i) => { const x = -9 + i*3; return `M${x},-26.4 L${x+2.6},-17.2`; }).join(' ') + ' ' + Array.from({length:7}, (_,i) => { const x = -5.6 + i*3; return `M${x},-26.4 L${x-2.6},-17.2`; }).join(' ');
  return `<g class="ch" data-cid="${id}" transform="translate(${f1(F[0])},${f1(F[1])})"><g transform="translate(-23,-30) scale(1.1) translate(23,30)">
    <rect x="-18" y="-62" width="36" height="64" fill="transparent"/>
    <ellipse cx="-3" cy="0.6" rx="17" ry="6.8" fill="rgba(13,27,92,.17)"/>
    <path d="M0,-1.2 L-10.4,-0.6 M0,-1.2 L10.4,-0.6 M0,-1.2 L-6.8,3.2 M0,-1.2 L6.8,-4.4 M0,-1.2 L2.4,3.8" stroke="#24223a" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M0,-1.2 L-10.4,-0.6 M0,-1.2 L10.4,-0.6" stroke="#4a4766" stroke-width=".6" stroke-linecap="round"/>
    ${[[-10.4,-0.6],[10.4,-0.6],[-6.8,3.2],[6.8,-4.4],[2.4,3.8]].map(([x,y])=>`<ellipse cx="${x}" cy="${y+.8}" rx="1.5" ry="1.1" fill="#111"/>`).join('')}
    <rect x="-1.4" y="-14.6" width="2.8" height="13.6" rx="1" fill="#57546e"/><rect x="-.9" y="-14.6" width=".8" height="13.6" fill="#8b88a6" opacity=".7"/>
    <path d="M-10.8,-15.4 Q-10.8,-11.4 0,-11 Q10.8,-11.4 10.8,-15.4Z" fill="${chairD}"/>
    <ellipse cx="0" cy="-15.6" rx="10.8" ry="4.4" fill="${chair}"/>
    <ellipse cx="-.8" cy="-16.2" rx="7.6" ry="2.6" fill="${chairL}" opacity=".25"/>
    ${ol("M3.4,-17.4 Q-3.4,-21 -8.4,-20.2", 6.6, shade(pants,.5))}${ol("M-8.4,-20.2 Q-9.8,-13.6 -9.8,-7.6", 5, shade(pants,.5))}
    <path d="M3.4,-17.4 Q-3.4,-21 -8.4,-20.2" stroke="${pantsD}" stroke-width="6.6" fill="none" stroke-linecap="round"/>
    <path d="M-8.4,-20.2 Q-9.8,-13.6 -9.8,-7.6" stroke="${pantsD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-13.2,-6.8 Q-13,-9.2 -9.6,-8.8 Q-7.4,-8.6 -7.6,-6.4 Q-7.8,-4.8 -10.6,-4.8 Q-13.2,-4.8 -13.2,-6.8Z" fill="${shoeD}"/><path d="M-13.2,-5.8 Q-10.6,-4 -7.6,-5.6" stroke="${sole}" stroke-width="1" fill="none"/>
    ${ol("M-.6,-15.8 Q-7.8,-19.4 -12.6,-18.4", 6.8, shade(pants,.5))}${ol("M-12.6,-18.4 Q-14,-11.8 -13.8,-5.6", 5.2, shade(pants,.5))}
    <path d="M-.6,-15.8 Q-7.8,-19.4 -12.6,-18.4" stroke="${pants}" stroke-width="6.8" fill="none" stroke-linecap="round"/>
    <path d="M-1.4,-18.2 Q-7,-20.4 -11.8,-19.6" stroke="${pantsL}" stroke-width=".9" fill="none" opacity=".55"/>
    <path d="M-2,-14.2 Q-7.4,-16.4 -11,-16.2" stroke="${pantsD}" stroke-width=".6" fill="none" opacity=".6" stroke-dasharray="1 .8"/>
    <path d="M-12.6,-18.4 Q-14,-11.8 -13.8,-5.6" stroke="${pants}" stroke-width="5.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="-12.8" cy="-17.8" rx="1.6" ry="1.2" fill="${pantsL}" opacity=".35"/>
    <path d="M-12.2,-14 Q-12.8,-10 -12.6,-6.6" stroke="${pantsD}" stroke-width=".6" fill="none" opacity=".6"/>
    <path d="M-17.6,-4.6 Q-17.4,-7.2 -13.6,-6.8 Q-11.2,-6.6 -11.4,-4.2 Q-11.6,-2.4 -14.8,-2.4 Q-17.6,-2.4 -17.6,-4.6Z" fill="${shoe}"/>
    <path d="M-17.6,-3.6 Q-14.8,-1.6 -11.4,-3.2" stroke="${sole}" stroke-width="1.1" fill="none"/>
    <path d="M-15.6,-6.2 l.8,.9 M-14.4,-6.4 l.8,.9" stroke="${shoe==='#f8fafc'?'#64748b':'#e2e8f0'}" stroke-width=".45" stroke-linecap="round"/>
    <g>
      <animateTransform attributeName="transform" type="rotate" values="0 0 -16;-1.3 0 -16;0 0 -16;1 0 -16;0 0 -16" dur="${(5 + h%3)}s" repeatCount="indefinite" begin="-${d1}s"/>
      ${ol("M-14.4,-29.6 Q-15,-33 -15.4,-35", 4.4, sleeve?shade(shirt,.45):skinDD)}<g transform="${LEAN}">${ol("M-9,-38.2 Q-12.6,-34.4 -12.6,-29.6", 5.6, shirtDD)}
      <path d="M-9,-38.2 Q-12.6,-34.4 -12.6,-29.6" stroke="${shirtD}" stroke-width="5.6" fill="none" stroke-linecap="round"/></g>
      <path d="M-14.4,-29.6 Q-15,-33 -15.4,-35" stroke="${sleeve?shirtDD:skinD}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
      <g>${tap((0.2+(h%5)*0.02).toFixed(2), d2)}${handF}</g>
      <path d="${armK}" stroke="${sleeve?shirtDD:skinDD}" stroke-width="5.8" stroke-linecap="round" fill="none">${mv('d', armK, armM)}</path>
      <path d="${armK}" stroke="${armD}" stroke-width="4.6" stroke-linecap="round" fill="none">${mv('d', armK, armM)}</path>
      <path d="${armK}" stroke="${shade(arm,1.12)}" stroke-width=".8" stroke-linecap="round" fill="none" opacity=".5" transform="translate(0,-1)">${mv('d', armK, armM)}</path>
      <g>${tap((0.23+(h%3)*0.03).toFixed(2), (d2*0.7).toFixed(2))}<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-7.2 3.6;-7.2 3.6;0 0" keyTimes="0;.55;.63;.88;1" dur="${mdur}s" repeatCount="indefinite" begin="-${d1}s"/>${handN}</g></g>
      <g transform="${LEAN}"><path d="M-10.6,-35.8 Q-11.2,-29 -9.8,-17.4 L9.8,-17.4 Q11.2,-29 10.8,-35.8 Q10.2,-40.8 4,-41.4 L-4.6,-41.4 Q-10.2,-40.8 -10.6,-35.8Z" fill="${shirt}" stroke="${shirtDD}" stroke-width=".6"/>
      <path d="M-10.6,-35.8 Q-11.2,-29 -9.8,-17.4 L9.8,-17.4 Q11.2,-29 10.8,-35.8 Q10.2,-40.8 4,-41.4 L-4.6,-41.4 Q-10.2,-40.8 -10.6,-35.8Z" fill="url(#gVol)"/>
      <path d="M3.2,-41.2 Q10.2,-40.8 10.8,-35.8 Q11.2,-29 9.8,-17.4 L4.6,-17.4 Q6.2,-30 3.2,-41.2Z" fill="${shirtD}" opacity=".6"/>
      <path d="M-.6,-38.6 Q.2,-30 -.4,-20" stroke="${shirtD}" stroke-width=".7" fill="none" opacity=".55"/>
      <path d="M-8,-35.4 Q-4.4,-32.8 -3.4,-26.4 M3.6,-35.6 Q5.6,-31.4 5,-26" stroke="${shirtD}" stroke-width=".65" fill="none" opacity=".6"/>
      <path d="M-9.6,-37.6 Q-6,-40.6 -1.4,-40.8" stroke="${shirtL}" stroke-width="1.1" fill="none" opacity=".55" stroke-linecap="round"/>
      ${hs===1 ? hairBehind : ''}</g>
      <path d="M-10,-25.8 Q-10,-28.6 -7,-28.8 L7,-28.8 Q10,-28.6 10,-25.8 L10,-18.2 Q10,-15.6 7.6,-15.6 L-7.6,-15.6 Q-10,-15.6 -10,-18.2Z" fill="${chairD}" stroke="${shade(chair,.5)}" stroke-width=".5"/>
      <path d="M-8.9,-25.8 Q-8.9,-27.6 -6.6,-27.6 L6.6,-27.6 Q8.9,-27.6 8.9,-25.8 L8.9,-18.6 Q8.9,-16.8 7,-16.8 L-7,-16.8 Q-8.9,-16.8 -8.9,-18.6Z" fill="${chair}"/><path d="M-8.9,-25.8 Q-8.9,-27.6 -6.6,-27.6 L6.6,-27.6 Q8.9,-27.6 8.9,-25.8 L8.9,-18.6 Q8.9,-16.8 7,-16.8 L-7,-16.8 Q-8.9,-16.8 -8.9,-18.6Z" fill="url(#gVol)"/>
      <path d="${mesh}" stroke="${chairL}" stroke-width=".35" opacity=".45"/>
      <path d="M-8.9,-20.6 Q0,-18.6 8.9,-20.6" stroke="${chairD}" stroke-width="1.6" fill="none" opacity=".8"/>
      <path d="M-9.6,-26.4 Q0,-29.4 9.6,-26.4" stroke="${chairL}" stroke-width=".8" fill="none" opacity=".6"/>
      <rect x="-13" y="-22" width="2.8" height="7" rx="1.3" fill="${chairD}"/><rect x="10.2" y="-22" width="2.8" height="7" rx="1.3" fill="${chairD}"/>
      <rect x="-13.6" y="-23.2" width="4" height="1.8" rx=".9" fill="${chair}"/><rect x="9.6" y="-23.2" width="4" height="1.8" rx=".9" fill="${chair}"/>
      <g transform="${LEAN}">${ol("M9.2,-39 Q12.4,-35.4 11.8,-28.6", 5.8, shirtDD)}
      <path d="M9.2,-39 Q12.4,-35.4 11.8,-28.6" stroke="${shirt}" stroke-width="5.8" fill="none" stroke-linecap="round"/>
      <path d="M11,-37.2 Q12.8,-34 12.4,-30" stroke="${shirtD}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>
      ${!sleeve ? `<path d="M11.9,-32.2 Q12.1,-30 11.7,-28.2" stroke="${skin}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M10,-33.6 Q11.6,-33.2 13.4,-33.8" stroke="${shirtD}" stroke-width=".7" fill="none"/>` : `<path d="M10.2,-29.8 Q11.8,-29.2 13.4,-29.8" stroke="${shirtDD}" stroke-width=".7" fill="none" opacity=".7"/>`}
      <path d="M-4,-43.8 L1.2,-43.8 L1.6,-40.2 L-4.4,-40.2Z" fill="${skinD}" stroke="${skinDD}" stroke-width=".4"/>
      <path d="M-4,-42.4 Q-1.4,-41.2 1.2,-42.4" stroke="${skinDD}" stroke-width=".6" fill="none" opacity=".6"/>
      ${collar}
      <g class="bhead"><g transform="translate(-1.6,-42.6) scale(1.24) translate(1.6,42.6)">
        ${hs===1 ? '' : hairBehind}
        <ellipse cx="-2.4" cy="-48.8" rx="6.2" ry="7" fill="${skin}" stroke="${skinDD}" stroke-width=".5"/>
        <ellipse cx="-2.4" cy="-48.8" rx="6.2" ry="7" fill="url(#gHead)"/>
        <path d="M2.2,-52.6 Q4.4,-48.6 2.4,-43.4 Q.8,-42 -1.4,-41.9" stroke="${skinD}" stroke-width="1.6" fill="none" opacity=".45"/>
        <path d="M-8.4,-48.6 Q-9.5,-47.4 -8.4,-46.2" stroke="${skinD}" stroke-width=".9" fill="${skin}" stroke-linecap="round"/>
        <path d="M-8.2,-45.4 Q-7,-42.6 -3.8,-42.2" stroke="${skinD}" stroke-width=".55" fill="none" opacity=".75"/>
        <ellipse cx="-6.4" cy="-46.6" rx="1.3" ry=".8" fill="rgba(255,120,120,.25)"/>
        <path d="M-7,-49.6 q.6,-.4 1.1,0" stroke="#1f2937" stroke-width=".7" fill="none" stroke-linecap="round"/>
        <path d="M-7.6,-51.2 q1.1,-.7 2.2,-.1" stroke="${hairD}" stroke-width=".7" fill="none" stroke-linecap="round"/>
        ${glasses}
        ${beard}
        <g${capOp}>${cap}${tufts}</g>
        ${hairFront}
        <ellipse cx="1.3" cy="-48.4" rx="1.5" ry="2.2" fill="${skin}"/>
        <path d="M1.5,-49.8 q.9,1 .1,2.6" stroke="${skinDD}" stroke-width=".55" fill="none"/>
        ${phones}
        ${crown}
      </g></g></g>${star}
    </g>
  </g></g>`;
}
function emptyChairSVG(F, sign){
  return tr(F, `<ellipse cx="0" cy="0" rx="14" ry="6" fill="rgba(13,27,92,.12)"/>
    <path d="M-9,-1 L9,-1 M-6,2.5 L6,-4.5 M6,2.5 L-6,-4.5" stroke="#2b2840" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="-1.4" y="-13" width="2.8" height="12" fill="#5d5a72"/>
    <ellipse cx="0" cy="-14" rx="10.5" ry="5" fill="#34314a"/>
    <rect x="-11" y="-33" width="22" height="19" rx="5.5" fill="#4b4766"/>
    ${sign ? `<g transform="translate(0,-50)"><rect x="-17" y="-13" width="34" height="24" rx="11" fill="#fff" stroke="#b7c8ff" stroke-width="1.5"/><path d="M-4,11 l4,6 l4,-6z" fill="#fff"/><text y="5" text-anchor="middle" font-size="14">${sign}</text></g>` : ''}`);
}

/* ---------- masa ve ekran ---------- */
function screenSVG(sx, ya, yb, za, zb, role, seed){
  const bg = role==='test' ? '#1d1a2e' : role==='arge' ? '#1a1446' : '#141a33';
  let s = faceX(sx, ya, yb, za, zb, bg);
  let wk = '';
  const span = yb - ya;
  if (role==='tas'){
    // UI tasarımcısı: HTML/CSS kodu (etiket + özellik renkleri)
    const cols = ['#f9a8d4','#93c5fd','#fde68a','#c4b5fd','#fdba74'];
    for (let k=0;k<5;k++){
      const z = zb - 2.2 - k*3.3, ind = (k%2)*0.09, a = ya + 0.05 + ind, len = span*(0.18+((seed+k*5)%4)*0.09);
      wk += `<g class="ln" style="animation-delay:${k*0.42}s">${faceX(sx+0.002, a, a+0.07, z-1.5, z, '#f472b6')}${faceX(sx+0.002, a+0.1, Math.min(yb-0.04, a+0.1+len), z-1.5, z, cols[(k+seed)%5])}</g>`;
    }  } else if (role==='test'){
    for (let k=0;k<4;k++){
      const z = zb - 2.5 - k*3.6, a = ya + 0.06;
      wk += `<g class="ln" style="animation-delay:${k*0.5}s">${faceX(sx+0.002, a+0.14, a+0.14+span*(0.3+((seed+k)%3)*0.15), z-1.6, z, '#c4b5fd')}${faceX(sx+0.002, a, a+0.09, z-2.2, z+0.4, k%2?'#86efac':'#f87171')}</g>`;
    }
  } else if (role==='arge'){
    for (let k=0;k<3;k++){
      const z = zb - 3 - k*5, a = ya + 0.08 + ((seed+k)%3)*0.12;
      wk += `<g class="ln" style="animation-delay:${k*0.6}s">${faceX(sx+0.002, a, a+0.1, z-2.6, z, '#fbbf24')}${faceX(sx+0.002, a+0.1, a+span*0.55, z-1.6, z-1, '#7f9cff')}${faceX(sx+0.002, a+span*0.55, a+span*0.55+0.1, z-2.6, z, '#f472b6')}</g>`;
    }
  } else {
    const cols = ['#86efac','#93c5fd','#f9a8d4','#fde68a','#c4b5fd','#fdba74'];
    for (let k=0;k<5;k++){
      const z = zb - 2.2 - k*3.3, ind = (k%3)*0.07, len = span*(0.25+((seed*7+k*13)%5)*0.11);
      const a = ya + 0.05 + ind;
      wk += `<g class="ln" style="animation-delay:${k*0.42}s">${faceX(sx+0.002, a, Math.min(yb-0.04, a+len), z-1.5, z, cols[(k+seed)%6])}</g>`;
    }
  }
  const mid = (ya+yb)/2, zm = (za+zb)/2;
  const ss = faceX(sx+0.002, ya, yb, za, zb, 'url(#ssG)') + tr(P(sx, mid, zm), `<circle r="3.2" fill="#ffc7b5" opacity=".95"/>`);
  return s + `<g class="wk">${wk}</g><g class="ss">${ss}</g>`;
}
function deskSVG(st, R, occ, role, idx, L, exec){
  const {x, y} = st, top = exec ? '#a46a3c' : R.desk[0], panel = exec ? '#7a4b26' : R.desk[1];
  const dw = exec ? 1.0 : 0.8, dd = exec ? 2.0 : 1.5, big = L >= 2;
  let s = floorShadow(x, y, dw, dd);
  if (big && !exec){
    // L-masanın arka çıkıntısı (karakterin sağ arkasında)
    s += floorShadow(x+dw, y+0.05, 0.5, 0.5, .1);
    s += box(x+dw+0.4, y+0.1, 0.06, 0.06, 18, 0, '#6b6880');
    s += box(x+dw-0.02, y+0.05, 0.52, 0.5, 2.6, 18, top, shade(top,.84), shade(top,.7));
    s += box(x+dw+0.1, y+0.12, 0.3, 0.26, 4, 20.6, '#efedf6', '#d6d2e6', '#b3adc9') + box(x+dw+0.12, y+0.14, 0.26, 0.2, 1, 24.6, '#ffffff');
  }
  if (L===0){
    for (const [lx,ly] of [[0.06,0.08],[dw-0.12,0.08],[0.06,dd-0.14],[dw-0.12,dd-0.14]]) s += box(x+lx, y+ly, 0.06, 0.06, 18, 0, '#6b6880');
  } else {
    s += box(x+0.06, y+0.12, 0.05, dd-0.24, 10, 7, shade(panel,.95));
    s += box(x+0.04, y+0.05, dw-0.08, 0.07, 18, 0, panel);
    s += box(x+0.04, y+dd-0.12, dw-0.08, 0.07, 18, 0, panel);
  }
  s += box(x, y, dw, dd, 2.6, 18, top, shade(top,.84), shade(top,.7));
  s += poly([P(x,y+dd,20.6),P(x+dw,y+dd,20.6),P(x+dw,y+dd,20.1),P(x,y+dd,20.1)], 'rgba(255,255,255,.35)');
  const dual = S.upg.ekran || big;
  const ranges = dual ? [[y+0.08, y+dd/2-0.03],[y+dd/2+0.03, y+dd-0.08]] : [[y+0.28, y+1.22]];
  ranges.forEach(([y1,y2], k) => {
    const ym = (y1+y2)/2;
    s += box(x+0.1, ym-0.14, 0.24, 0.28, 1, 20.6, '#3d3a52');
    s += box(x+0.15, ym-0.04, 0.07, 0.08, 6, 21.6, '#4b4766');
    s += box(x+0.12, y1, 0.08, y2-y1, 21, 26, '#26233a', '#1b1830', '#13101f');
    s += `<g class="scr ${occ?'idle':''}" data-cid="${occ||''}">${occ ? screenSVG(x+0.201, y1+0.05, y2-0.05, 27.8, 45.2, role, idx+k) : faceX(x+0.201, y1+0.05, y2-0.05, 27.8, 45.2, '#2b2840')}</g>`;
  });
  const km = y + dd/2;
  s += box(x+0.5, km-0.27, 0.17, 0.54, 1.2, 20.6, '#efedf6', '#d6d2e6', '#b3adc9');
  s += tr(P(x+0.6, km+0.43, 21.6), `<ellipse cx="0.5" cy="0.5" rx="3.6" ry="2.1" fill="#cfd6f0"/><ellipse rx="2.6" ry="1.6" fill="#efedf6" stroke="#b3adc9" stroke-width=".6"/>`);
  const h = hashN(idx*31+7);
  if (exec) s += tr(P(x+0.7, y+0.25, 20.6), `<rect x="-6" y="-3" width="12" height="3" rx="1" fill="#fbbf24"/><text x="0" y="-4" text-anchor="middle" font-size="5" font-weight="900" fill="#7d3b00" font-family="Nunito,sans-serif">CEO</text>`) + tr(P(x+0.75, y+dd-0.25, 20.6), `<rect x="-2.6" y="-6" width="5.2" height="6" rx="1.4" fill="#fff" stroke="#b7c8ff" stroke-width=".6"/>`);
  else if (h%3===0) s += tr(P(x+0.62, y+0.2, 20.6), `<rect x="-2.6" y="-6" width="5.2" height="6" rx="1.4" fill="#fff" stroke="#b7c8ff" stroke-width=".6"/><path d="M2.6,-4.6 q2.6,0.6 0,2.6" stroke="#b7c8ff" stroke-width="1" fill="none"/><rect x="-2.6" y="-6" width="5.2" height="1.6" rx=".8" fill="#f7735a"/>`);
  else if (h%3===1) s += box(x+0.55, y+0.14, 0.22, 0.26, 3, 20.6, '#ffe2d8', '#ffc7b5', '#ffa98f') + box(x+0.55, y+0.14, 0.22, 0.26, 1.2, 23.6, '#fff');
  else s += tr(P(x+0.66, y+0.24, 20.6), `<rect x="-2.4" y="-5" width="4.8" height="5" rx="1.2" fill="#e05a44"/><circle cx="0" cy="-8" r="4.2" fill="#4ade80"/><circle cx="-2.6" cy="-6" r="2.8" fill="#22c55e"/>`);
  return s;
}
/* ---------- dekor ---------- */
function plantSVG(x, y, sc=1, big=false){
  const c = P(x+0.2, y+0.2, 13*sc);
  let s = floorShadow(x, y, 0.4, 0.4, .15) + box(x, y, 0.4, 0.4, 12*sc, 0, '#7cc9ff', '#45b1ff', '#1e97f6') + box(x-0.03, y-0.03, 0.46, 0.46, 2, 12*sc, '#b5e1ff');
  s += tr(c, `<g transform="scale(${sc})">
    <ellipse cx="-7" cy="-9" rx="4" ry="10" fill="#22c55e" transform="rotate(-30 -7 -9)"/>
    <ellipse cx="7" cy="-9" rx="4" ry="10" fill="#16a34a" transform="rotate(30 7 -9)"/>
    <ellipse cx="0" cy="-14" rx="4.5" ry="12" fill="#4ade80"/>
    ${big?'<ellipse cx="-4" cy="-20" rx="3.5" ry="9" fill="#86efac" transform="rotate(-15 -4 -20)"/><ellipse cx="5" cy="-19" rx="3.5" ry="9" fill="#22c55e" transform="rotate(18 5 -19)"/>':''}
  </g>`);
  return s;
}
function windowX(a, b, z1, z2, night){
  let s = faceY(0, a-0.06, b+0.06, z1-3, z2+3, '#ffffff');
  s += faceY(0, a, b, z1, z2, night?'url(#skyN)':'url(#skyD)');
  s += tr(P(a+(b-a)*0.25, 0, z2-6), `<ellipse rx="5" ry="2.5" fill="#fff" opacity=".85"/><ellipse cx="5" cy="1" rx="4" ry="2" fill="#fff" opacity=".7"/>`);
  s += seg(P((a+b)/2,0,z1), P((a+b)/2,0,z2), '#ffffff', 2.2);
  s += seg(P(a,0,(z1+z2)/2), P(b,0,(z1+z2)/2), '#ffffff', 1.6);
  s += box(a-0.08, 0, b-a+0.16, 0.14, 2, z1-4, '#ffffff');
  return s;
}
function windowY(a, b, z1, z2){
  let s = faceX(0, a-0.06, b+0.06, z1-3, z2+3, '#ffffff');
  s += faceX(0, a, b, z1, z2, 'url(#skyD)');
  s += seg(P(0,(a+b)/2,z1), P(0,(a+b)/2,z2), '#ffffff', 2.2);
  s += box(0, a-0.08, 0.14, b-a+0.16, 2, z1-4, '#ffffff');
  return s;
}
function lightPatchX(a, b){ return poly([P(a,0.1),P(b,0.1),P(b+1.1,2.2),P(a+1.1,2.2)], 'rgba(255,250,235,.16)'); }
function doorY(a, color='#b07a45'){
  let s = faceX(0, a-0.08, a+1.08, 0, 66, '#ffffff');
  s += faceX(0, a, a+1, 0, 62, color);
  s += faceX(0, a+0.1, a+0.9, 34, 56, 'rgba(255,255,255,.14)');
  s += faceX(0, a+0.1, a+0.9, 6, 28, 'rgba(255,255,255,.08)');
  s += tr(P(0, a+0.85, 30), `<circle r="2" fill="#fbbf24"/>`);
  return s;
}
function posterY(a, w, z1, z2, color, inner){ return faceX(0, a-0.04, a+w+0.04, z1-2, z2+2, '#fff') + faceX(0, a, a+w, z1, z2, color) + (inner||''); }
function bookshelf(x, y, w=1.5){
  let s = floorShadow(x, y, w, 0.4, .14) + box(x, y, w, 0.38, 60, 0, '#a46a3c', '#8a5530', '#6f4224');
  const cols = ['#f7735a','#2f54eb','#fbbf24','#f472b6','#7f9cff','#ffa98f','#6c8cf5'];
  for (let r=0;r<3;r++){
    for (let k=0;k<Math.floor(w/0.2);k++){
      const a = x+0.05+k*0.19, hz = 13 + ((k*7+r*3)%4)*1.5;
      s += faceY(y+0.38, a, a+0.15, 4+r*19, 4+r*19+hz, cols[(k+r*2)%cols.length]);
    }
    s += faceY(y+0.381, x, x+w, 3+r*19, 4+r*19, '#5a3618');
  }
  return s;
}
function couchY(x, y, len, color){
  let s = floorShadow(x, y, 0.9, len, .15);
  s += box(x, y, 0.22, len, 26, 0, shade(color,1.05));
  s += box(x+0.22, y, 0.68, len, 12, 0, color);
  s += box(x+0.22, y, 0.68, 0.18, 18, 0, shade(color,1.05));
  s += box(x+0.22, y+len-0.18, 0.68, 0.18, 18, 0, shade(color,1.05));
  for (let k=0;k<Math.floor(len/0.7);k++) s += box(x+0.25, y+0.22+k*0.7, 0.6, 0.6, 3, 12, shade(color,1.12));
  return s;
}
function coffeeMachine(x, y){
  let s = floorShadow(x, y, 0.9, 0.45) + box(x, y, 0.9, 0.45, 20, 0, '#efedf6', '#d6d2e6', '#b3adc9');
  s += box(x+0.2, y+0.05, 0.45, 0.32, 17, 20, '#3d3a52', '#26233a', '#1b1830');
  s += tr(P(x+0.45, y+0.38, 26), `<rect x="-2" y="-4" width="4" height="4" rx="1" fill="#fff"/>`);
  s += tr(P(x+0.45, y+0.38, 33), `<circle class="steam" r="2.2" fill="#fff"/><circle class="steam" cx="2.6" cy="-2" r="1.8" fill="#fff" style="animation-delay:.8s"/>`);
  s += tr(P(x+0.62, y+0.38, 33), `<circle r="1.3" fill="#f7735a" class="blinkled"/>`);
  return s;
}
function serverRack(x, y){
  let s = floorShadow(x, y, 0.7, 0.6) + box(x, y, 0.7, 0.6, 56, 0, '#26233a', '#1b1830', '#13101f');
  for (let k=0;k<6;k++){
    s += faceY(y+0.6, x+0.06, x+0.64, 6+k*8.5, 12+k*8.5, '#322e4a');
    s += tr(P(x+0.12, y+0.6, 9+k*8.5), `<circle r="1.2" fill="${k%2?'#7f9cff':'#ffa98f'}" class="blinkled" style="animation-delay:${k*0.23}s"/>`);
  }
  return s;
}
function waterCooler(x, y){
  return floorShadow(x, y, 0.4, 0.4) + box(x, y, 0.4, 0.4, 22, 0, '#ffffff', '#ece8f6', '#d6d2e6') +
    tr(P(x+0.2, y+0.2, 30), `<ellipse rx="6.5" ry="9" fill="#a5d8ff" opacity=".92"/><ellipse cx="-2" cy="-3" rx="1.6" ry="4" fill="#fff" opacity=".6"/>`);
}
function kitchen(x, y, len){
  let s = floorShadow(x, y, 0.6, len) + box(x, y, 0.6, len, 22, 0, '#ffffff', '#ece8f6', '#d6d2e6');
  s += box(x, y, 0.6, len, 2, 22, '#b3adc9');
  s += box(x, y+len, 0.6, 0.6, 50, 0, '#ece8f6', '#d6d2e6', '#bfb8d6');
  s += tr(P(x+0.3, y+0.4, 24), `<rect x="-4" y="-6" width="8" height="6" rx="1.5" fill="#f7735a"/>`);
  return s;
}
function arcade(x, y){
  return floorShadow(x, y, 0.5, 0.5) + box(x, y, 0.5, 0.5, 44, 0, '#2f54eb', '#2140c7', '#182f99') +
    faceY(y+0.5, x+0.07, x+0.43, 26, 38, '#1b1736') + tr(P(x+0.25, y+0.5, 32), `<circle r="2" fill="#fbbf24" class="blinkled"/>`) +
    faceY(y+0.501, x+0.07, x+0.43, 40, 43, '#f472b6');
}
function tvY(a, w, z1, z2){
  let s = faceX(0, a-0.05, a+w+0.05, z1-2, z2+2, '#1b1830') + faceX(0, a, a+w, z1, z2, '#0d1b5c');
  const pts = [];
  for (let k=0;k<=6;k++) pts.push(pt(P(0, a+0.1+k*(w-0.2)/6, z1+4+((k*37)%5)*((z2-z1-8)/5)+k*1.2)));
  s += `<polyline points="${pts.join(' ')}" stroke="#ffa98f" stroke-width="2" fill="none"/>`;
  return s;
}
// --- garaj eşyaları ---
function garageDoorX(a, b){
  let s = faceY(0, a-0.1, b+0.1, 0, 74, '#cfc9be');
  s += faceY(0, a, b, 0, 70, '#f7f5f1');
  for (let z=14; z<70; z+=14) s += seg(P(a,0,z), P(b,0,z), '#d6d0c6', 1.6);
  for (let k=0;k<4;k++){ const w = (b-a)/4, c = a + k*w; s += faceY(0, c+0.08, c+w-0.08, 52, 63, '#a8d8ff'); }
  s += tr(P((a+b)/2, 0, 8), `<rect x="-6" y="-2" width="12" height="3" rx="1.5" fill="#9a938a"/>`);
  return s;
}
function pegboardY(a, b){
  let s = faceX(0, a, b, 30, 64, '#d9b48a');
  for (let k=0;k<6;k++) for (let j=0;j<4;j++) s += tr(P(0, a+0.12+k*(b-a-0.24)/5, 34+j*8.5), `<circle r=".8" fill="#a07850"/>`);
  s += seg(P(0,a+0.3,58), P(0,a+0.3,42), '#5d5a72', 2.2) + tr(P(0,a+0.3,58), `<rect x="-2.5" y="-3" width="5" height="4" rx="1" fill="#f7735a"/>`);
  s += seg(P(0,a+0.75,58), P(0,a+0.75,44), '#5d5a72', 1.8) + tr(P(0,a+0.75,44), `<circle r="2.2" fill="none" stroke="#5d5a72" stroke-width="1.4"/>`);
  s += seg(P(0,a+1.2,59), P(0,a+1.2,46), '#2f54eb', 2.4);
  return s;
}
function workbench(x, y, len){
  let s = floorShadow(x, y, 0.62, len) + box(x+0.04, y+0.05, 0.54, 0.07, 20, 0, '#7a5a3a') + box(x+0.04, y+len-0.12, 0.54, 0.07, 20, 0, '#7a5a3a');
  s += box(x, y, 0.62, len, 3, 20, '#c49464', '#a87a4e', '#8d6440');
  s += box(x+0.1, y+0.25, 0.3, 0.4, 6, 23, '#f7735a') + box(x+0.12, y+1.1, 0.25, 0.25, 9, 23, '#2f54eb');
  s += box(x+0.05, y+0.2, 0.5, len-0.4, 2, 6, '#a87a4e');
  return s;
}
function metalShelf(x, y, w){
  let s = floorShadow(x, y, w, 0.45);
  for (const [lx,ly] of [[0,0],[w-0.05,0],[0,0.4],[w-0.05,0.4]]) s += box(x+lx, y+ly, 0.05, 0.05, 54, 0, '#8d8a85');
  for (let r=0;r<3;r++){
    s += box(x, y, w, 0.45, 1.5, 4+r*20, '#b8b4ad');
    for (let k=0;k<Math.floor(w/0.42);k++) s += box(x+0.05+k*0.42, y+0.06, 0.36, 0.32, 10+((k+r)%2)*4, 5.5+r*20, ['#d6a96b','#e2b97f','#c99a5c'][(k+r)%3]);
  }
  return s;
}
function bicycle(x, y){
  const c = P(x, y);
  return tr(c, `<ellipse cx="0" cy="2" rx="22" ry="5" fill="rgba(13,27,92,.12)"/>
    <circle cx="-13" cy="-9" r="9" fill="none" stroke="#3d3a52" stroke-width="2.2"/><circle cx="13" cy="-3" r="9" fill="none" stroke="#3d3a52" stroke-width="2.2"/>
    <path d="M-13,-9 L-2,-16 L13,-3 L1,-5 Z M-2,-16 L-4,-22 M-7,-22 L-1,-22 M1,-5 L4,-18 M1,-19 L8,-17" stroke="#f7735a" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`);
}
function waterHeater(x, y){
  const c = P(x+0.25, y+0.25);
  return floorShadow(x, y, 0.5, 0.5) + tr(c, `<rect x="-11" y="-52" width="22" height="50" rx="10" fill="#efedf6"/><rect x="2" y="-52" width="9" height="50" rx="5" fill="#d6d2e6"/><ellipse cx="0" cy="-52" rx="11" ry="5" fill="#ffffff"/><rect x="-3" y="-30" width="6" height="4" rx="1" fill="#f7735a"/>`);
}
function miniFridge(x, y){
  return floorShadow(x, y, 0.5, 0.5) + box(x, y, 0.5, 0.5, 24, 0, '#f6f4fb', '#e6e2f2', '#cfc9e2') + faceY(y+0.5, x+0.38, x+0.42, 10, 20, '#9a938a') +
    box(x+0.05, y+0.05, 0.4, 0.4, 3, 24, '#ffc7b5') + tr(P(x+0.25, y+0.25, 28), `<text text-anchor="middle" font-size="7" font-weight="900" fill="#e05a44" font-family="Nunito,sans-serif">PİZZA</text>`);
}
// --- stüdyo daire eşyaları ---
function bedSVG(x, y){
  let s = floorShadow(x, y, 2.0, 1.4, .14);
  s += box(x, y, 2.0, 1.4, 10, 0, '#a87447');
  s += box(x+0.05, y+0.05, 1.9, 1.3, 6, 10, '#ffffff', '#efe9fb', '#ddd4f3');
  s += box(x+0.6, y+0.05, 1.35, 1.3, 2, 16, '#7f9cff', '#4f74ff', '#2f54eb');
  s += box(x+0.12, y+0.15, 0.4, 0.5, 4, 16, '#ffe2d8') + box(x+0.12, y+0.75, 0.4, 0.5, 4, 16, '#ffe2d8');
  s += box(x-0.06, y, 0.1, 1.4, 30, 0, '#8a5a34');
  return s;
}
function rugSVG(x, y, w, d, color){ return poly([P(x,y),P(x+w,y),P(x+w,y+d),P(x,y+d)], color, 'rx="6"'); }
function tvStand(x, y){
  let s = floorShadow(x, y, 0.45, 1.3) + box(x, y, 0.45, 1.3, 12, 0, '#8a5a34', '#7a4e2c', '#653f22');
  s += box(x+0.15, y+0.1, 0.06, 1.1, 26, 12, '#1b1830', '#13101f', '#0b0915');
  s += faceX(x+0.211, y+0.15, y+1.15, 15, 35, '#0d1b5c') + tr(P(x+0.21, y+0.65, 25), `<circle r="4" fill="#f472b6" opacity=".8"/><circle cx="6" cy="2" r="3" fill="#fbbf24" opacity=".8"/>`);
  return s;
}

// --- büyük ofis bölgeleri ---
function beanBag(x, y, color){
  const c = P(x, y);
  return tr(c, `<ellipse cx="0" cy="2" rx="17" ry="7" fill="rgba(13,27,92,.16)"/><path d="M-15,0 Q-17,-16 -2,-19 Q15,-20 16,-4 Q15,4 0,5 Q-13,5 -15,0Z" fill="${color}"/>
    <path d="M-9,-11 Q-1,-17 8,-12" stroke="rgba(255,255,255,.35)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6,-3 Q0,-7 7,-3" stroke="${shade(color,.75)}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
}
function lounge(x, y, w, d){
  let s = poly([P(x,y),P(x+w,y),P(x+w,y+d),P(x,y+d)], 'rgba(30,151,246,.28)');
  s += poly([P(x+0.3,y+0.3),P(x+w-0.3,y+0.3),P(x+w-0.3,y+d-0.3),P(x+0.3,y+d-0.3)], 'none', 'stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-dasharray="6 5"');
  return s;
}
function loungeItems(x, y, w, d, add){
  const cols = ['#f7735a','#2f54eb','#f472b6','#fbbf24','#1e97f6','#f7735a'];
  const spots = [[0.7,0.7],[w/2,0.45],[w-0.7,0.8],[0.6,d-0.8],[w/2,d-0.5],[w-0.6,d-0.9]];
  spots.forEach(([a,b],i) => add(x+a+y+b, beanBag(x+a, y+b, cols[i%cols.length])));
  add(x+w/2+y+d/2, box(x+w/2-0.45, y+d/2-0.35, 0.9, 0.7, 9, 0, '#ffffff', '#e2e8f0', '#cbd5e1') + tr(P(x+w/2, y+d/2, 9), `<rect x="-3" y="-5" width="6" height="5" rx="1.4" fill="#f7735a"/>`));
}
function vending(x, y, kind){
  const body = kind ? '#1b1830' : '#2f54eb';
  let s = floorShadow(x, y, 0.75, 0.6) + box(x, y, 0.75, 0.6, 62, 0, body, shade(body,.8), shade(body,.62));
  s += faceY(y+0.6, x+0.06, x+0.52, 16, 56, kind ? '#e6f5ff' : '#1e97f6');
  const cols = ['#f7735a','#fbbf24','#34d399','#f472b6','#ffffff'];
  for (let r=0;r<4;r++) for (let k=0;k<3;k++) s += faceY(y+0.601, x+0.1+k*0.14, x+0.18+k*0.14, 20+r*9, 26+r*9, kind ? cols[(r+k)%5] : '#ffffff');
  s += faceY(y+0.601, x+0.57, x+0.7, 34, 50, '#9aa6c4') + faceY(y+0.601, x+0.1, x+0.5, 5, 11, '#0b0915');
  if (!kind) s += tr(P(x+0.3, y+0.6, 40), `<text font-size="8" font-weight="900" fill="#fff" text-anchor="middle" transform="skewY(26.6)" font-family="Nunito,sans-serif">SODA</text>`);
  return s;
}
function logoWall(x, y, len, color){
  let s = floorShadow(x, y, 0.25, len, .18) + box(x, y, 0.25, len, 58, 0, shade(color,1.1), shade(color,.85), color);
  const name = S.name.length > 16 ? S.name.slice(0,15)+'…' : S.name;
  s += `<g transform="matrix(0.894,-0.447,0,1,${f1(P(x+0.25, y+len-0.15, 34)[0])},${f1(P(x+0.25, y+len-0.15, 34)[1])})"><text x="0" y="0" font-size="17" font-weight="900" fill="#ffffff" font-family="Nunito, ui-rounded, system-ui, sans-serif">${esc(name)}</text></g>`;
  return s;
}
function glassBack(x0, y0, y1, h){ // x = x0 düzlemi (arka cam duvar)
  let s = faceX(x0, y0, y1, 0, h, 'rgba(190,225,255,.35)');
  for (let a=y0; a<=y1+0.01; a+=(y1-y0)/3) s += seg(P(x0,a,0), P(x0,a,h), '#ffffff', 2);
  return s + seg(P(x0,y0,h), P(x0,y1,h), '#ffffff', 2.5) + seg(P(x0,y0,0), P(x0,y1,0), '#9aa6c4', 2);
}
function glassFront(xa, xb, y0, h, gapA, gapB){ // y = y0 düzlemi (öndeki cam duvar, kapı boşluklu)
  let s = '';
  for (const [a,b] of [[xa,gapA],[gapB,xb]]){
    if (b - a < 0.05) continue;
    s += faceY(y0, a, b, 0, h, 'rgba(190,225,255,.28)');
    for (let t=a; t<=b+0.01; t+=(b-a)/2) s += seg(P(t,y0,0), P(t,y0,h), '#ffffff', 1.8);
    s += seg(P(a,y0,h), P(b,y0,h), '#ffffff', 2.5) + seg(P(a,y0,0), P(b,y0,0), '#9aa6c4', 2);
  }
  s += seg(P(gapA,y0,h), P(gapB,y0,h), '#ffffff', 2.5);
  s += `<g transform="${wallTextMatrix(P(xb-1.25, y0, 46))}"><rect x="0" y="0" width="40" height="13" rx="4" fill="#0d1b5c"/><text x="20" y="9.6" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff" font-family="Nunito,sans-serif">CEO</text></g>`;
  return s;
}
// isim, iki masa arasındaki boşlukta sütun yönünde (sağ-yukarı doğru) yerde yazılır
function floorName(x, y, name){
  const p = P(x, y);
  name = String(name).replace(/\s*\(.*?\)\s*/g, '').trim();
  return `<g transform="matrix(0.894,-0.447,0.894,0.447,${f1(p[0])},${f1(p[1])})"><text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="${S.office===4?'rgba(255,255,255,.5)':'rgba(13,27,92,.55)'}" font-family="Nunito, ui-rounded, system-ui, sans-serif">${esc(name)}</text></g>`;
}

/* ---------- oda ---------- */
const seatGap = L => L>=2 ? 3.4 : 1.9;
function seatLayout(W, D, L){
  const xmax = W - (L===4 ? 9.4 : L>=3 ? 5.2 : L===2 ? 2.6 : 0.2);
  const dx = L===4 ? 2.8 : L>=2 ? 2.4 : 2.2, dy = L>=2 ? 3.4 : 1.9, tail = L>=2 ? dy-1.5 : 0.2;
  const seats = [];
  for (let row=0; ; row++){
    const y = 1.6 + row*dy;
    if (y + 1.5 + tail > D) break;
    for (let col=0; ; col++){
      const x = 1.3 + col*dx;
      if (x + 1.6 > xmax) break;
      seats.push({x, y});
    }
  }
  return seats;
}
function floorSVG(L, R){
  const W = R.w, D = R.d;
  let s = box(0, 0, W, D, 7, -7, R.floor, shade(R.floor,.78), shade(R.floor,.64));
  if (L===0){
    for (let i=2;i<W;i+=2) s += seg(P(i,0), P(i,D), 'rgba(0,0,0,.07)');
    for (let j=2;j<D;j+=2) s += seg(P(0,j), P(W,j), 'rgba(0,0,0,.07)');
    s += tr(P(3.4,4.2), `<ellipse rx="26" ry="9" fill="rgba(40,30,30,.13)"/><ellipse cx="8" cy="2" rx="9" ry="3" fill="rgba(40,30,30,.1)"/>`);
  } else if (L===1 || L===2){
    const step = L===1 ? 0.33 : 0.3;
    for (let j=step; j<D; j+=step) s += seg(P(0,j), P(W,j), 'rgba(90,50,15,.16)');
    let k = 0;
    for (let j=0; j<D; j+=step, k++) for (let i=(k%3)*0.7+0.4; i<W; i+=2.1) s += seg(P(i,j), P(i,j+step), 'rgba(90,50,15,.16)');
  } else {
    for (let i=0;i<W;i++) for (let j=0;j<D;j++) if ((i+j)%2) s += poly([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)], L===4?'rgba(255,255,255,.04)':'rgba(80,60,140,.05)');
    for (let i=1;i<W;i++) s += seg(P(i,0), P(i,D), 'rgba(0,0,0,.05)');
    for (let j=1;j<D;j++) s += seg(P(0,j), P(W,j), 'rgba(0,0,0,.05)');
  }
  return s;
}
function roomSVG(){
  const L = S.office, R = ROOMS[L], W = R.w, D = R.d;
  const minX = P(-0.2,D)[0]-10, maxX = P(W,-0.2)[0]+10, minY = P(-0.2,-0.2,WALLH)[1]-12, maxY = P(W,D,-7)[1]+8;
  let s = `<svg xmlns="${NS}" viewBox="${f1(minX)} ${f1(minY)} ${f1(maxX-minX)} ${f1(maxY-minY)}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="gVol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
    <radialGradient id="gHead" cx=".32" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
    <linearGradient id="gGloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
    <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ec9ff"/><stop offset="1" stop-color="#e6f5ff"/></linearGradient>
    <linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140d3a"/><stop offset=".65" stop-color="#3b2a8a"/><stop offset="1" stop-color="#f7735a" stop-opacity=".6"/></linearGradient>
    <linearGradient id="ssG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#182f99"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>
  </defs>`;
  s += poly([P(0.3,0.3,-7),P(W+0.3,0.3,-7),P(W+0.3,D+0.3,-7),P(0.3,D+0.3,-7)], 'rgba(13,27,92,.16)');
  s += floorSVG(L, R);
  const wl = R.wall, wTop = shade(wl,.7);
  s += box(-0.18, -0.18, W+0.18, 0.18, WALLH, 0, wTop, wl, shade(wl,.8));
  s += box(-0.18, 0, 0.18, D, WALLH, 0, wTop, shade(wl,.9), shade(wl,.92));
  s += faceY(0, 0, W, 0, WALLH, 'url(#wallShade)') + faceX(0, 0, D, 0, WALLH, 'url(#wallShade)');
  s += faceY(0, 0, W, 0, 8, R.base) + faceX(0, 0, D, 0, 8, shade(R.base,1.08));
  // ---- duvar süsleri ----
  if (L===0){
    s += garageDoorX(1.7, 4.9);
    s += pegboardY(0.9, 2.6);
    s += doorY(3.6, '#f1ede6') + box(0, 3.5, 0.35, 1.2, 4, 0, '#cfc9be');
    s += tr(P(0, 4.1, 72), `<rect x="-4" y="-3" width="8" height="5" rx="1" fill="#fde68a" transform="skewY(-26.6)"/>`);
  } else if (R.glass){
    s += faceY(0, 0.15, W-0.15, 10, WALLH-6, 'url(#skyN)') + faceX(0, 0.15, D-0.15, 10, WALLH-6, 'url(#skyN)');
    let seed = 11;
    for (let a=0.3; a<W-0.8; a+=0.85){ seed = (seed*9301+49297)%233280; const h = 16+seed%42; s += faceY(0, a, a+0.65, 10, 10+h, '#0d0828'); for (let k=0;k<4;k++) if ((seed>>k)&1) s += tr(P(a+0.15+k*0.12,0,14+k*7), `<rect width="2" height="2" fill="#ffd8a8"/>`); }
    for (let a=0.3; a<D-0.8; a+=0.85){ seed = (seed*9301+49297)%233280; const h = 16+seed%42; s += faceX(0, a, a+0.65, 10, 10+h, '#0d0828'); }
    for (let a=0.15; a<=W; a+=1.5) s += seg(P(a,0,10), P(a,0,WALLH-6), '#b3adc9', 2);
    for (let a=0.15; a<=D; a+=1.5) s += seg(P(0,a,10), P(0,a,WALLH-6), '#b3adc9', 2);
    s += seg(P(0,0,10), P(W,0,10), '#b3adc9', 2.5) + seg(P(0,0,10), P(0,D,10), '#b3adc9', 2.5);
    s += tvY(D-4.2, 2.4, 30, 62);
  } else if (L===1){
    s += windowX(1.2, 2.8, 28, 68) + lightPatchX(1.2, 2.8);
    s += windowX(4.4, 6.0, 28, 68) + lightPatchX(4.4, 6.0);
    s += doorY(D-1.4, '#a87447');
    s += posterY(1.1, 0.9, 38, 66, '#ffe2d8', tr(P(0,1.55,52), `<text font-size="13" text-anchor="middle" transform="skewY(-26.6)">🎸</text>`));
    s += posterY(2.4, 0.7, 42, 62, '#e6dcff', tr(P(0,2.75,52), `<text font-size="11" text-anchor="middle" transform="skewY(-26.6)">🌙</text>`));
  } else {
    const nWin = L===2 ? 3 : 4, span = (W-2)/nWin;
    for (let i=0;i<nWin;i++){ const a = 1 + i*span + span*0.15, b = a + span*0.6; s += windowX(a, b, 28, 68); s += lightPatchX(a, b); }
    if (L>=3) s += windowY(1.4, 2.8, 28, 68);
    s += doorY(D-1.6);
    const a = L>=3 ? 3.3 : 1.1;
    s += faceX(0, a, a+1.9, 30, 62, '#ffffff', 'stroke="#b3adc9" stroke-width="1.6"');
    s += `<polyline points="${pt(P(0,a+0.3,50))} ${pt(P(0,a+0.75,56))} ${pt(P(0,a+1.15,46))} ${pt(P(0,a+1.6,53))}" stroke="#2f54eb" stroke-width="2" fill="none" stroke-linejoin="round"/>`;
    s += seg(P(0,a+0.3,40), P(0,a+1.3,40), '#f7735a', 2) + seg(P(0,a+0.3,36), P(0,a+1.0,36), '#f472b6', 2);
    if (L>=3){ s += posterY(a+2.4, 0.9, 38, 66, '#ffe2d8', tr(P(0,a+2.85,52), `<text font-size="13" text-anchor="middle" transform="skewY(-26.6)">🏆</text>`)); s += tvY(D-4.6, 1.8, 32, 60); }
    s += tr(P(0, 0.6, 72), `<g transform="skewY(-26.6)"><circle r="7.5" fill="#fff" stroke="#5d5a72" stroke-width="2"/><line x1="0" y1="0" x2="0" y2="-4.8" stroke="#3d3a52" stroke-width="1.6" stroke-linecap="round"/><line x1="0" y1="0" x2="3.6" y2="0" stroke="#3d3a52" stroke-width="1.6" stroke-linecap="round"/></g>`);
  }
  // şirket tabelası
  {
    const name = S.name.length > 22 ? S.name.slice(0,21)+'…' : S.name;
    const wpx = Math.min(170, 18 + name.length*6.6);
    const a = L===0 ? 1.8 : Math.max(1, W/2 - wpx/64), z = L===0 ? 86 : 87;
    s += `<g transform="${wallTextMatrix(P(a,0,z))}"><rect x="0" y="0" width="${f1(wpx)}" height="16" rx="5" fill="${L===4?'#ffa98f':'#0d1b5c'}"/><text x="${f1(wpx/2)}" y="11.6" text-anchor="middle" font-size="10" font-weight="900" fill="${L===4?'#0d1b5c':'#fff'}" font-family="Nunito, ui-rounded, system-ui, sans-serif">${esc(name)}</text></g>`;
  }
  // ---- nesneler (derinliğe göre sıralanır) ----
  const items = [];
  const add = (depth, svg) => items.push({depth, svg});
  if (L===0){
    add(0.4+1.8, workbench(0.15, 0.9, 1.75));
    add(5.4+0.4, metalShelf(4.95, 0.2, 0.9));
    add(5.0+3.0, bicycle(5.0, 3.3));
    add(5.5+5.2, waterHeater(5.25, 5.1));
    add(0.4+5.2, miniFridge(0.2, 5.0));
    add(3.5+4.9, box(3.2,4.6,0.8,0.6,14,0,'#d6a96b') + box(3.28,4.66,0.64,0.48,12,14,'#e2b97f'));
    add(2.6+5.4, tr(P(2.5,5.3), `<text font-size="15" text-anchor="middle">🐈</text>`));
    add(0.6+3.4, plantSVG(0.25, 3.0, 0.9));
  } else if (L===1){
    s += rugSVG(1.6, 3.5, 3.4, 2.2, 'rgba(69,177,255,.3)');
    add(6.6+4.6, bedSVG(5.7, 3.9));
    add(0.5+4.4, kitchen(0.15, 3.3, 1.5));
    add(3.3+5.3, couchY(2.2, 4.2, 1.6, '#7cc9ff'));
    add(1.5+4.2, tvStand(1.3, 4.0));
    add(7.2+0.6, bookshelf(6.2, 0.12, 1.4));
    add(0.5+2.6, plantSVG(0.3, 2.4, 1.1, true));
  } else {
    if (L===2){
      add(W-3.2+0.3, bookshelf(W-3.9, 0.12, 1.3));
      add(W-0.6+0.5, plantSVG(W-0.75, 0.3, 1.25, true));
      add(0.5+D-0.6, plantSVG(0.25, D-0.7, 1.1, true));
      add(0.4+0.7, waterCooler(0.2, 0.5));
      add(W-0.6+D-0.6, plantSVG(W-0.75, D-0.75, 1.1, true));
    } else {
      // büyük ofis bölgeleri: otomatlar, mutfak, dinlenme köşesi, logolu duvar, yönetici odası
      add(0.4+0.7, waterCooler(0.2, 0.5));
      add(1.7+0.4, vending(1.3, 0.12, 0)); add(2.55+0.4, vending(2.15, 0.12, 1));
      add(0.5+D-3.5, kitchen(0.15, D-5.4, 2.8));
      add(0.5+D-0.6, plantSVG(0.25, D-0.7, 1.1, true));
      const lx = W-4.6, ly = D-4.4;
      s += lounge(lx, ly, 4.2, 3.9);
      loungeItems(lx, ly, 4.2, 3.9, add);
      const wl = Math.min(4, ly-0.3-4.3);
      if (wl > 1) add(W-4.83+4.3+wl/2, logoWall(W-4.95, 4.3, wl, '#2f54eb'));
      add(W-0.4+4.65, arcade(W-0.65, 4.4));
      add(W-0.5+ly-0.5, plantSVG(W-0.7, ly-0.9, 1.1, true));
      const ox = W-4.2, oy = 3.8;
      s += rugSVG(ox+0.3, 0.4, 3.6, 3.1, 'rgba(164,106,60,.16)');
      add(ox+0.2+1.0, glassBack(ox, 0.02, oy, 66));
      add(ox+0.9+0.3, bookshelf(ox+0.25, 0.12, 1.3));
      add(W-0.5+oy-0.6, plantSVG(W-0.7, oy-0.8, 1.1, true));
      add(W+3.0, glassFront(ox, W, oy, 66, ox+0.9, ox+1.7));
    }
  }
  if (S.upg.kahve){ const x = L===0 ? 2.0 : L===1 ? 4.2 : L===2 ? W-5.2 : 5.0, y = L===0 ? 5.2 : 0.15; add(x+y+0.8, coffeeMachine(x, y)); }
  if (S.upg.bulut && L>=2) add(L===2 ? W-0.6+D-1.3 : 4.6+0.4, L===2 ? serverRack(W-0.9, D-1.8) : serverRack(3.9, 0.12));
  // ---- masalar ve insanlar (ofis ve sonrası: kurucunun kendi masası / odası var) ----
  const execMode = L >= 2;
  const seats = seatLayout(W, D, L);
  const people = (execMode ? [] : [{id:'me', role:'me'}]).concat(S.emps.map(e=>({id:e.id, role:e.role, e})));
  const nSeats = Math.min(seats.length, execMode ? cap() : cap()+1);
  seatPos = {};
  let names = '';
  if (execMode){
    const ex = L===2 ? {x:W-2.3, y:1.3} : {x:W-2.6, y:0.9};
    const F = P(ex.x+1.42, ex.y+1.03);
    add(ex.x+0.5+ex.y+1, deskSVG(ex, R, 'me', S.ftask ? 'arge' : 'me', 99, L, true));
    seatPos.me = [F[0], F[1]-66];
    add(ex.x+1.42+ex.y+1.03, charSVG('me', 'me', F, false));
    names += floorName(ex.x+0.9, ex.y+2.75, 'Sen');
  }
  for (let i=0;i<nSeats;i++){
    const st = seats[i], who = people[i];
    const F = P(st.x+1.22, st.y+0.78);
    const away = who && who.e && who.e.task && AWAY.includes(who.e.task.type);
    const role = who ? ((who.e && who.e.task && (who.e.task.type==='arge' || who.e.task.type==='ogren' || who.e.task.type==='egitim')) || (who.id==='me' && S.ftask) ? 'arge' : who.role) : 'none';
    add(st.x+0.4+st.y+0.75, deskSVG(st, R, who && !away ? who.id : 0, role, i, L));
    if (who && !away){ seatPos[who.id] = [F[0], F[1]-66]; add(st.x+1.22+st.y+0.78, charSVG(who.id, who.role, F, who.e && who.e.lead)); }
    else if (away){ const t = who.e.task.type; seatPos[who.id] = [F[0], F[1]-70]; add(st.x+1.22+st.y+0.78, emptyChairSVG(F, t==='kurs'?'🎓':t==='izin'?'🏖️':'🎤')); }
    else add(st.x+1.22+st.y+0.78, emptyChairSVG(F));
    if (who && L >= 1) names += floorName(st.x+0.85, st.y + (L>=2 ? 1.5 + (seatGap(L)-1.5)/2 : 2.2), who.e ? who.e.name : 'Sen');
  }
  s += names;  const extra = people.length - nSeats;
  if (extra > 0) add(999, tr(P(W-1.4, D-0.1), `<rect x="-30" y="-12" width="60" height="18" rx="9" fill="#0d1b5c"/><text y="1.5" text-anchor="middle" font-size="10" font-weight="900" fill="#fff" font-family="Nunito, system-ui">+${extra} kişi</text>`));
  if (L>=3){
    const a = P(1.3,1.0), b = P(W-1.4,1.0);
    add(1.95, `<g><animateMotion dur="18s" repeatCount="indefinite" path="M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])} L${f1(a[0])},${f1(a[1])}"/><ellipse cx="0" cy="1" rx="10" ry="5" fill="rgba(0,0,0,.15)"/><ellipse cx="0" cy="-1" rx="9" ry="4.6" fill="#3d3a52"/><ellipse cx="0" cy="-3" rx="8" ry="4" fill="#6b6880"/><circle cx="0" cy="-4" r="1.3" fill="#ffa98f" class="blinkled"/></g>`);
  }
  items.sort((a,b)=>a.depth-b.depth);
  s += items.map(i=>i.svg).join('');
  s += `<g id="fx"></g></svg>`;
  return s;
}

/* ---------- sahne güncelleme ---------- */
function renderScene(){
  const key = S.office+'|'+S.name+'|'+(S.ftask?'F':'')+'|'+S.emps.map(e=>e.id+(e.task?e.task.type[0]:'')+(e.lead?'L':'')).join(',')+'|'+['kahve','bulut'].map(k=>S.upg[k]?1:0).join('')+'|'+(S.eq ? S.eq.pc+''+S.eq.klavye+''+S.eq.koltuk : '')+'|'+(S.mgr ? S.mgr.name : '');
  if (key === sceneKey) return;
  sceneKey = key;
  if (window.S3D && S3D.ok){ S3D.mount(); S3D.build(); return; }   // 3D sahne
  $('scene').innerHTML = roomSVG();
  const vb = $('scene').querySelector('svg').viewBox.baseVal;
  sceneVB = {x:vb.x, y:vb.y, w:vb.width, h:vb.height};
  applySceneView();
}
/* ---------- yakınlaştırma ve kaydırma (telefonda büyük ofisler için) ---------- */
let sceneVB = null, sceneZoom = 1, scenePan = [0, 0], panDrag = null;
function applySceneView(){
  if (window.S3D && S3D.ok) return;
  const svg = $('scene') && $('scene').querySelector('svg'); if (!svg || !sceneVB) return;
  const w = sceneVB.w/sceneZoom, h = sceneVB.h/sceneZoom;
  const mx = (sceneVB.w - w)/2, my = (sceneVB.h - h)/2;
  scenePan[0] = clamp(scenePan[0], -mx, mx); scenePan[1] = clamp(scenePan[1], -my, my);
  svg.setAttribute('viewBox', `${f1(sceneVB.x + mx + scenePan[0])} ${f1(sceneVB.y + my + scenePan[1])} ${f1(w)} ${f1(h)}`);
  const zl = $('zoomLvl'); if (zl) zl.textContent = sceneZoom > 1 ? `${sceneZoom}x` : '';
  $('scene').classList.toggle('zoomed', sceneZoom > 1);
}
function setSceneZoom(z){ if (window.S3D && S3D.ok){ S3D.setZoom(z); sceneZoom = S3D.zoom(); return; } sceneZoom = clamp(z, 1, 3); if (sceneZoom === 1) scenePan = [0, 0]; applySceneView(); }
function panStart(e){ if (window.S3D && S3D.ok) return S3D.panStart(e); if (sceneZoom <= 1) return; panDrag = {x:e.clientX, y:e.clientY, p:scenePan.slice()}; }
function panMove(e){
  if (window.S3D && S3D.ok) return S3D.panMove(e);
  if (!panDrag) return;
  const svg = $('scene').querySelector('svg'); if (!svg) return;
  const r = svg.getBoundingClientRect(), k = (sceneVB.w/sceneZoom) / Math.max(1, r.width);
  scenePan = [panDrag.p[0] - (e.clientX - panDrag.x)*k, panDrag.p[1] - (e.clientY - panDrag.y)*k];
  applySceneView();
}
function panEnd(){ panDrag = null; if (window.S3D && S3D.ok) S3D.panEnd(); }
function updateSceneStates(){
  const need = S.projs.filter(needsWork);
  const anyDev = need.some(p=>!devDone(p));
  const anyBug = need.some(p=>p.bugs>0.001);
  const state = {me: need.length > 0 || !!S.ftask};
  for (const e of S.emps){
    if (e.task && (e.task.type==='arge' || e.task.type==='ogren' || e.task.type==='egitim')) state[e.id] = true;
    else if (e.task && AWAY.includes(e.task.type)) state[e.id] = false;
    else state[e.id] = e.role==='test' ? anyBug : (anyDev || anyBug);
  }
  if (window.S3D && S3D.ok){ S3D.setStates(state); return; }
  document.querySelectorAll('#scene [data-cid]').forEach(g => {
    const id = g.dataset.cid; if (!id) return;
    const w = !!state[id];
    if (g.classList.contains('work') !== w){ g.classList.toggle('work', w); g.classList.toggle('idle', !w); }
  });
}
function fxAdd(id, kind, v){
  tagPts[id] = (tagPts[id]||0) + (kind==='fix' ? v/6 : kind==='arge' ? v/3 : v);   // katkı, masanın altındaki isimde görünür
  if (window.S3D && S3D.ok){
    // baloncuksuz yazılar dalga dalga gelir: bir süre sessiz, sonra art arda 2-4 yazı, sonra yine sessiz
    if (page || document.hidden || paused) return;
    fxAcc[id] = (fxAcc[id]||0) + (kind==='arge' ? v/3 : kind==='fix' ? v/4 : v);
    fxKind[id] = kind;
    const now = performance.now(), B = fxBurst[id] || (fxBurst[id] = {next: now + 1500 + Math.random()*4000});
    if (now < B.next) return;
    const val = fxAcc[id];
    if (val < 1){ B.next = now + 700; return; }
    fxAcc[id] = 0;
    // sayaçlar yalnızca uçan yazı gelince artar: yazıdaki sayı, kişinin o projede o arada gerçekten yaptığı iş
    const p = typeof devbarProj === 'function' ? devbarProj() : null;
    let tsum = 0;
    const LBL = {kod:'Kod', tas:'Tasarım', fix:'Hata'};
    if (p && p.cs && p.cs[id] && p.flown){
      const c = p.cs[id], fr = p.flown[id] || (p.flown[id] = {kod:0, tas:0, fix:0});
      for (const k of ['kod', 'tas', 'fix']){
        let n = Math.floor((c[k]||0) - (fr[k]||0)); if (n < 1) continue;
        fr[k] += n;
        const pops = Math.min(n, 1 + Math.floor(Math.random()*3));
        for (let q=0; q<pops; q++){
          const m = q === pops-1 ? n : Math.max(1, Math.round(n/(pops-q) * (0.6 + Math.random()*0.8))); n -= m;
          tsum += 260 + Math.random()*320;
          setTimeout(() => flyPts(id, (k==='fix' ? '−' : '+') + m + ' ' + LBL[k], k, () => { p.shown[k] = (p.shown[k]||0) + m; }), tsum);
        }
      }
      const ag = Math.floor((p.rpg||0) - (p.flownRp||0));
      if (ag >= 1 && Math.random() < 0.6){ p.flownRp = (p.flownRp||0) + ag; tsum += 380; setTimeout(() => flyPts(id, '+' + ag + ' Ar-Ge', 'arge', () => { p.shown.arge = (p.shown.arge||0) + ag; }), tsum); }
    }
    B.next = now + tsum + 2500 + Math.random()*6000;      // sonraki dalgaya kadar sessizlik
    return;
  }  if (page || document.hidden || paused) return;
  fxAcc[id] = (fxAcc[id]||0) + v;
  const thr = 0.8 * Math.max(1, S.emps.length/10) * (kind==='arge' ? 3 : 1);
  if (fxAcc[id] >= thr){
    const val = fxAcc[id]; fxAcc[id] = 0;
    const k = kind==='fix' ? 'bug' : kind==='arge' ? 'arge' : kind==='tas' ? 'ui' : 'kod';
    bubble(id, k, kind==='fix' ? 1 : Math.max(1, Math.round(kind==='arge' ? val/3 : val)));
    if (k==='kod' || k==='ui') { const rp = Math.max(1, Math.round(val*0.04*3)); if (Math.random() < 0.3) setTimeout(()=>bubble(id, 'rp', rp), 350); }
  }
}
// katkı yazısı: başın üstünde çıkar, biraz yükselir, sonra proje çubuğundaki ilgili sayaca uçar
// bir öğenin #app içindeki konumu (CSS transform kaymaları dahil; zoom/döndürmeden bağımsız)
function appPos(el, app, center){
  let x = center ? el.offsetWidth/2 : 0, y = center ? el.offsetHeight/2 : 0, e = el;
  while (e && e !== app){
    x += e.offsetLeft; y += e.offsetTop;
    const tf = getComputedStyle(e).transform;
    if (tf && tf !== 'none'){ const m = new DOMMatrix(tf); x += m.m41; y += m.m42; }
    e = e.offsetParent;
  }
  return [x, y];
}
function flyPts(id, txt, cls, onArrive){
  const bar = document.getElementById('devbar'), tgt = bar && bar.classList.contains('on') ? bar.querySelector('.dvc.' + cls) : null;
  const hp = window.S3D && S3D.head ? S3D.head(id) : null, sc = document.getElementById('scene'), app = document.getElementById('app');
  if (page || !hp || !tgt){ if (onArrive) onArrive(); return; }
  const s0 = appPos(sc, app, false), x0 = s0[0] + hp[0] + (Math.random()*14-7), y0 = s0[1] + hp[1] - 14;
  const d = document.createElement('div'); d.className = 'flypt'; d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
  d.innerHTML = `<span class="ftx ${cls}">${txt}</span>`; app.appendChild(d);
  requestAnimationFrame(() => { d.classList.add('up'); });
  // hedef: sayacın rakamının tam ortası (kart o an kaymış olabilir, uçuş başlarken ölçülür)
  setTimeout(() => { const nb = tgt.querySelector('b') || tgt, t1 = appPos(nb, app, true);
    d.classList.add('go'); d.style.transform = `translate(${t1[0]-x0}px, ${t1[1]-(y0-16)}px) scale(.6)`; }, 520);
  setTimeout(() => { d.remove(); if (onArrive) onArrive(); if (typeof updDevbar === 'function') updDevbar(); tgt.classList.remove('pulse'); void tgt.offsetWidth; tgt.classList.add('pulse'); }, 520 + 620);
}// iş puanı baloncuğu: türe göre simge + sayı (Kod mor, Arayüz mavi, Hata beyaz, Ar-Ge koyu mor)
function bubble(id, kind, n){
  if (window.S3D && S3D.ok){
    if (!GL[kind] && kind!=='rp') kind = 'kod';
    const txt = kind==='bug' ? '−'+n : '+'+n;
    S3D.fx(id, `<svg width="32" height="21" viewBox="-20 -13 40 26"><g class="bub"><rect x="-17" y="-10.5" width="34" height="21" rx="7" fill="${PTC[kind]}" stroke="rgba(255,255,255,.9)" stroke-width="1.4"/><g transform="translate(-13.5,-6.5) scale(.54)">${(kind==='rp' ? GL.arge : GL[kind])(PTG[kind])}</g><text x="5.5" y="4" text-anchor="middle" font-size="10.5" font-weight="900" fill="${PTG[kind]}" font-family="Nunito, system-ui, sans-serif">${txt}</text></g></svg>`, 'bub3', Math.random()*10-5, 0);
    return;
  }
  const fx = document.getElementById('fx'), pos = seatPos[id];
  if (!fx || !pos || fx.childElementCount > 28) return;
  const glyph = kind==='rp' ? GL.arge : GL[kind];
  if (!glyph) kind = 'kod';
  const g = document.createElementNS(NS,'g');
  g.setAttribute('transform', `translate(${f1(pos[0]+(Math.random()*10-5))},${f1(pos[1])})`);
  const txt = kind==='bug' ? '−'+n : '+'+n;
  g.innerHTML = `<g class="bub"><rect x="-17" y="-10.5" width="34" height="21" rx="10.5" fill="${PTC[kind]}" stroke="${kind==='bug'?'#2f54eb':'#fff'}" stroke-width="2.2"/>
    <g transform="translate(-13.5,-6.5) scale(.54)">${(kind==='rp' ? GL.arge : GL[kind])(PTG[kind])}</g>
    <text x="5.5" y="4" text-anchor="middle" font-size="10.5" font-weight="900" fill="${PTG[kind]}" font-family="Nunito, system-ui, sans-serif">${txt}</text></g>`;
  fx.appendChild(g); setTimeout(()=>g.remove(), 1450);
}
function speak(id, emoji){
  return;   // emojili konuşma baloncukları kaldırıldı (katkı puanları kalıyor)
  if (window.S3D && S3D.ok){ if (page) return; S3D.fx(id, `<svg width="30" height="30" viewBox="-15 -15 30 30"><g class="say"><rect x="-13" y="-12" width="26" height="21" rx="10" fill="#fff" stroke="#b5e1ff" stroke-width="1"/><path d="M-7,8 l-5,6 l10,-6z" fill="#fff"/><text y="4.5" text-anchor="middle" font-size="13">${emoji}</text></g></svg>`, 'say3', 14, -8); return; }
  const fx = document.getElementById('fx'), pos = seatPos[id];
  if (!fx || !pos || page) return;
  const g = document.createElementNS(NS,'g');
  g.setAttribute('transform', `translate(${f1(pos[0]+12)},${f1(pos[1]-2)})`);
  g.innerHTML = `<g class="say"><rect x="-13" y="-12" width="26" height="21" rx="10" fill="#fff" stroke="#b5e1ff" stroke-width="1"/><path d="M-7,8 l-5,6 l10,-6z" fill="#fff"/><text y="4.5" text-anchor="middle" font-size="13">${emoji}</text></g>`;
  fx.appendChild(g); setTimeout(()=>g.remove(), 2450);
}
function speakAll(emoji){ speak('me', emoji); S.emps.forEach((e,i)=>setTimeout(()=>speak(e.id, emoji), 120*i)); }
function idleChatter(dt){
  chatterT -= dt;
  if (chatterT > 0) return;
  chatterT = 1.6 + Math.random()*2.2;
  // eski ekipman: çalışanlar söylenir
  if (S.emps.length && typeof eqBehindAll === 'function' && eqBehindAll() > 0 && Math.random() < 0.2){ speak(pick(S.emps).id, pick(['😤','🐌','💻','😩'])); return; }
  // mutsuz çalışanlar arada söylenir
  if (Math.random() < 0.35){
    const sad = S.emps.filter(e => (e.mood ?? 70) < 35 && seatPos[e.id]);
    if (sad.length){ speak(pick(sad).id, S.money < 0 ? pick(['💸','😠','😩']) : pick(['😞','😠','😩','😒'])); return; }
  }
  const is3 = window.S3D && S3D.ok;
  const idle = is3 ? S3D.idle() : [...document.querySelectorAll('#scene .ch.idle')].map(c => c.dataset.cid);
  if (!idle.length){
    if (Math.random() < 0.25){ const all = is3 ? S3D.all() : [...document.querySelectorAll('#scene .ch')].map(c => c.dataset.cid); if (all.length) speak(pick(all), pick(['💡','🔥','🤓','🎧','💪','⌨️'])); }
    return;
  }
  speak(pick(idle), pick(['💬','💡','🎵','📱','😴','📞','🤔','😄','📖']));
}
