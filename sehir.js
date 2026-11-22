/* =====================================================================
   Bytetown – ŞEHİR: tıklanabilir şehir haritası, rakip şirket satın alma,
   lansman etkinliği, müşteri pazarlığı, ofis dekorasyonu, patronun hayatı,
   dünya olayları, stajyer programı.
   Ana betikle ad çakışmasın diye yardımcılar cy / CY_ önekiyle adlandırıldı.
   ===================================================================== */
const cyS = () => (S.cy = S.cy || {});
const cyR = n => Math.floor(Math.random()*n);
let cyView = {sel:null};
const cyFree = () => typeof hkFree === 'function' ? hkFree() : (!page && $('modal').classList.contains('hidden'));

/* ---------------- RAKİPLER: satın alınmış olanlar ---------------- */
const cyRv = n => { const s = cyS(); s.rv = s.rv || {}; return s.rv[n] || (s.rv[n] = {stake:0, acq:null, health:0.55 + Math.random()*0.4, cd:0}); };
const cyAcq = r => !!(S.cy && S.cy.rv && S.cy.rv[r.n] && S.cy.rv[r.n].acq);
function rvActive(){ return RIVALS.filter(r => !cyAcq(r)); }
function cyAcqValue(){ let v = 0; for (const r of RIVALS){ const x = S.cy && S.cy.rv && S.cy.rv[r.n]; if (!x) continue; if (x.acq === 'marka' || x.acq === 'ekip') v += rivalVal(r)*0.85; else if (!x.acq && x.stake) v += rivalVal(r)*x.stake/100; } return v; }
const cyHealthWord = h => h >= 0.75 ? 'Güçlü' : h >= 0.5 ? 'Dengeli' : 'Zorda';

/* ---------------- ŞEHİR HARİTASI ---------------- */
const CY_SPECIAL = [
  {id:'uni', ad:'Bytetown Üniversitesi', c1:'#b45309', c2:'#92400e', top:'#d97706', h:4},
  {id:'dekor', ad:'Dekor Mağazası', c1:'#db2777', c2:'#9d174d', top:'#f472b6', h:2.5},
  {id:'ev', ad:'Evin', c1:'#0d9488', c2:'#115e59', top:'#5eead4', h:2.6},
  {id:'borsa', ad:'Bytetown Borsası', c1:'#475569', c2:'#334155', top:'#94a3b8', h:6},
  {id:'banka', ad:'Banka', c1:'#1d4ed8', c2:'#1e3a8a', top:'#60a5fa', h:5},
  {id:'emlak', ad:'Emlakçı', c1:'#7c3aed', c2:'#5b21b6', top:'#a78bfa', h:2.2},
  {id:'fuar', ad:'Fuar ve Lansman Merkezi', c1:'#ea580c', c2:'#9a3412', top:'#fdba74', h:3},
];
function cyLots(){
  // 5x4 parsel: rakipler, senin binan, özel yerler, parklar
  const lots = [];
  const order = [[2,1,'me'], [1,1,'r'], [3,1,'r'], [2,0,'r'], [1,0,'s:borsa'], [3,0,'r'], [0,0,'r'], [4,0,'s:banka'], [0,1,'s:uni'], [4,1,'r'],
                 [0,2,'r'], [1,2,'s:fuar'], [2,2,'park'], [3,2,'r'], [4,2,'s:emlak'], [0,3,'s:ev'], [1,3,'park'], [2,3,'s:dekor'], [3,3,'r'], [4,3,'park']];
  let ri = 0; const rv = RIVALS.slice().sort((a,b) => rivalVal(b) - rivalVal(a));
  for (const [gx, gy, k] of order){ if (k === 'r'){ const r = rv[ri++]; if (r) lots.push({gx, gy, k:'r', r}); else lots.push({gx, gy, k:'park'}); } else lots.push({gx, gy, k}); }
  return lots;
}
function cyMapSVG(){
  const SC = 13, P = (x, y, z) => [+((x - y)*0.866*SC).toFixed(1), +((x + y)*0.5*SC - (z||0)*SC).toFixed(1)];
  const pts = a => a.map(p => p.join(',')).join(' ');
  const poly = (a, fill, extra) => `<polygon points="${pts(a)}" fill="${fill}" ${extra||''}/>`;
  const hsh = s => { let h = 7; for (const ch of String(s)) h = (h*31 + ch.charCodeAt(0)) % 100003; return h; };
  const GLASS = [['#5b7bc4','#34539b','#243f7d'], ['#4aa3c9','#2b7fa3','#1d6283'], ['#6d72c9','#4a4fa6','#373b86'], ['#5aa38a','#38806a','#28604f'], ['#8a7bc4','#64569f','#4b3f80'], ['#c47b8a','#9f5666','#803f4c']];
  const hv = v => Math.max(2, Math.min(9, 2 + (Math.log10(Math.max(1e5, v)) - 5)*1.5));
  // kutu: sol ön yüz (y+d), sağ ön yüz (x+w), üst; pencere sıraları
  const box = (x, y, w, d, z0, h, c, lit, win) => {
    const [top, lf, rt] = c, z1 = z0 + h;
    let s = poly([P(x, y+d, z0), P(x+w, y+d, z0), P(x+w, y+d, z1), P(x, y+d, z1)], lf) + poly([P(x+w, y, z0), P(x+w, y+d, z0), P(x+w, y+d, z1), P(x+w, y, z1)], rt) + poly([P(x, y, z1), P(x+w, y, z1), P(x+w, y+d, z1), P(x, y+d, z1)], top);
    if (win !== false) for (let z = z0 + 0.45; z < z1 - 0.35; z += 0.75){
      for (let i = 0.3; i < w - 0.25; i += 0.6){ const on = Math.sin(i*7 + z*3 + x*1.7) > -0.3; s += poly([P(x+i, y+d, z), P(x+i+0.32, y+d, z), P(x+i+0.32, y+d, z+0.4), P(x+i, y+d, z+0.4)], on ? lit : 'rgba(255,255,255,.14)'); }
      for (let j = 0.3; j < d - 0.25; j += 0.6){ const on = Math.cos(j*5 + z*2 + y*1.3) > -0.2; s += poly([P(x+w, y+j, z), P(x+w, y+j+0.32, z), P(x+w, y+j+0.32, z+0.4), P(x+w, y+j, z+0.4)], on ? lit : 'rgba(255,255,255,.12)'); } }
    return s;
  };
  const shadow = (x, y, w, d, h) => poly([P(x + w, y, 0.02), P(x + w + h*0.45, y - h*0.1, 0.02), P(x + w + h*0.45, y + d - h*0.1, 0.02), P(x + w, y + d, 0.02)], 'rgba(15,23,42,.22)');
  const tree = (x, y, sc) => { sc = sc || 1; const [tx, ty] = P(x, y, 0), [cx, cy] = P(x, y, 1.1*sc);
    return `<ellipse cx="${tx + 3}" cy="${ty + 1}" rx="${6*sc}" ry="${2.6*sc}" fill="rgba(15,23,42,.2)"/><rect x="${tx - 1.2}" y="${cy}" width="2.4" height="${(ty - cy).toFixed(1)}" fill="#7a5232"/><circle cx="${cx}" cy="${cy}" r="${7*sc}" fill="#2f9e66"/><circle cx="${cx - 2.5*sc}" cy="${cy - 2.5*sc}" r="${4*sc}" fill="#4cc485"/>`; };
  const W = 30, D = 24, ROAD = 1.3;
  let svg = '';
  // gökyüzü bulutları
  svg += [[-210, -120, 0], [60, -135, 7], [230, -105, 14]].map(([x, y, dl]) => `<g opacity=".85"><ellipse cx="${x}" cy="${y}" rx="34" ry="10" fill="#fff"/><ellipse cx="${x + 18}" cy="${y - 6}" rx="20" ry="9" fill="#fff"/><animateTransform attributeName="transform" type="translate" values="-30 0;40 0;-30 0" dur="${40 + dl*2}s" begin="-${dl}s" repeatCount="indefinite"/></g>`).join('');
  // zemin plakası (kalın kenarlı ada)
  svg += poly([P(-1.5, D + 1.5, 0), P(W + 1.5, D + 1.5, 0), P(W + 1.5, D + 1.5, -1.2), P(-1.5, D + 1.5, -1.2)], '#4b6b3a');
  svg += poly([P(W + 1.5, -1.5, 0), P(W + 1.5, D + 1.5, 0), P(W + 1.5, D + 1.5, -1.2), P(W + 1.5, -1.5, -1.2)], '#3b5a2c');
  svg += poly([P(-1.5, -1.5, 0), P(W + 1.5, -1.5, 0), P(W + 1.5, D + 1.5, 0), P(-1.5, D + 1.5, 0)], '#7cc173');
  // yollar ve şerit çizgileri
  for (let gx = 0; gx <= 5; gx++){ const x = gx*6 - ROAD/2;
    svg += poly([P(x, -1.5, 0.01), P(x + ROAD, -1.5, 0.01), P(x + ROAD, D + 1.5, 0.01), P(x, D + 1.5, 0.01)], '#454d61');
    for (let y = -1; y < D + 1.2; y += 1.4) svg += poly([P(x + ROAD/2 - 0.05, y, 0.02), P(x + ROAD/2 + 0.05, y, 0.02), P(x + ROAD/2 + 0.05, y + 0.6, 0.02), P(x + ROAD/2 - 0.05, y + 0.6, 0.02)], '#f8e08e'); }
  for (let gy = 0; gy <= 4; gy++){ const y = gy*6 - ROAD/2;
    svg += poly([P(-1.5, y, 0.012), P(W + 1.5, y, 0.012), P(W + 1.5, y + ROAD, 0.012), P(-1.5, y + ROAD, 0.012)], '#454d61');
    for (let x = -1; x < W + 1.2; x += 1.4) svg += poly([P(x, y + ROAD/2 - 0.05, 0.022), P(x + 0.6, y + ROAD/2 - 0.05, 0.022), P(x + 0.6, y + ROAD/2 + 0.05, 0.022), P(x, y + ROAD/2 + 0.05, 0.022)], '#f8e08e'); }
  // hareket eden arabalar
  const CARC = ['#ef4444', '#f59e0b', '#ffffff', '#22c55e', '#3b82f6', '#a855f7'];
  for (let k = 0; k < 6; k++){
    const vert = k % 2 === 0, lane = vert ? (1 + (k % 4 === 0 ? 2 : 3))*6 - 0.3 : (1 + (k % 3))*6 - 0.3;
    const a = vert ? P(lane, -1, 0.05) : P(-1, lane, 0.05), b = vert ? P(lane, D + 1, 0.05) : P(W + 1, lane, 0.05);
    svg += `<g><rect x="-4" y="-2.5" width="8" height="5" rx="1.6" fill="${CARC[k]}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/><animateMotion path="M${a[0]},${a[1]} L${b[0]},${b[1]}" dur="${9 + k*2}s" begin="-${k*3}s" repeatCount="indefinite"/></g>`;
  }
  const lots = cyLots().sort((a,b) => (a.gx + a.gy) - (b.gx + b.gy));
  const s0 = cyS(), sel = cyView.sel, labels = [];
  for (const L of lots){
    const x0 = L.gx*6 + 1.2, y0 = L.gy*6 + 1.2, w = 3.6, d = 3.6;
    // kaldırım
    let g = poly([P(x0 - 0.45, y0 - 0.45, 0.03), P(x0 + w + 0.45, y0 - 0.45, 0.03), P(x0 + w + 0.45, y0 + d + 0.45, 0.03), P(x0 - 0.45, y0 + d + 0.45, 0.03)], L.k === 'park' ? '#5fae5f' : '#d6dce6');
    if (L.k === 'park'){
      g += poly([P(x0 + 0.6, y0 + 1.4, 0.04), P(x0 + 3.0, y0 + 1.4, 0.04), P(x0 + 3.0, y0 + 2.2, 0.04), P(x0 + 0.6, y0 + 2.2, 0.04)], '#e8d9b0');
      g += poly([P(x0 + 1.3, y0 + 0.2, 0.05), P(x0 + 2.6, y0 + 0.2, 0.05), P(x0 + 2.6, y0 + 1.1, 0.05), P(x0 + 1.3, y0 + 1.1, 0.05)], '#60a5fa');
      g += tree(x0 + 0.5, y0 + 0.5) + tree(x0 + 3.1, y0 + 0.6, 0.9) + tree(x0 + 0.7, y0 + 3.1, 1.1) + tree(x0 + 2.4, y0 + 3.0) + tree(x0 + 3.3, y0 + 3.3, 0.8);
      svg += g; continue;
    }
    let key = '', name = '', col = '#1e3a8a';
    g += tree(x0 - 0.2, y0 + d + 0.2, 0.7) + tree(x0 + w + 0.2, y0 - 0.2, 0.7);
    if (L.k === 'me' || L.k === 'r'){
      const me = L.k === 'me', r = L.r, st = me ? null : cyRv(r.n), mine = me || !!(st && st.acq);
      const v = me ? valuation() : rivalVal(r), h = me ? 2.5 + S.office*1.4 + Math.min(3, Math.max(0, Math.log10(Math.max(1e5, v)) - 5)) : hv(v);
      const pal = mine ? ['#ffe08a', '#f2b33d', '#d9952a'] : GLASS[hsh(r.n) % GLASS.length], lit = mine ? '#fff7d6' : '#ffe39a';
      key = me ? 'me' : 'r:' + r.n; name = me ? S.name : (st.acq ? r.n + ' · senin' : r.n); col = mine ? '#b45309' : '#1e3a8a';
      g += shadow(x0, y0, w, d, h);
      if (h > 5){ const h1 = h*0.62; g += box(x0, y0, w, d, 0, h1, pal, lit); g += box(x0 + 0.45, y0 + 0.45, w - 0.9, d - 0.9, h1, h - h1, pal, lit); }
      else g += box(x0, y0, w, d, 0, h, pal, lit);
      const top = h, ix = h > 5 ? 0.45 : 0;
      // çatı ayrıntıları
      g += box(x0 + ix + 0.4, y0 + ix + 0.4, 0.7, 0.6, top, 0.35, ['#cbd5e1', '#94a3b8', '#64748b'], '', false);
      if (h >= 7 || me){ const [hx, hy] = P(x0 + w/2 + 0.2, y0 + d/2 + 0.2, top); g += `<ellipse cx="${hx}" cy="${hy}" rx="9" ry="4.5" fill="none" stroke="${me ? '#b45309' : '#e2e8f0'}" stroke-width="1.2"/><text x="${hx}" y="${hy + 2.5}" text-anchor="middle" class="cyh">H</text>`; }
      const [ax, ay] = P(x0 + ix + 0.5, y0 + d - ix - 0.6, top), [bx, by] = P(x0 + ix + 0.5, y0 + d - ix - 0.6, top + 1.4);
      g += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#e2e8f0" stroke-width="1.3"/><circle cx="${bx}" cy="${by}" r="2.2" fill="#ff5d5d" class="cybk"/>`;
      if (me) (S.awards||[]).slice(-3).forEach((a, k) => { const [sx, sy] = P(x0 + 0.6 + k*1.0, y0, top + 0.3); g += `<circle cx="${sx}" cy="${sy}" r="3.4" fill="#f5b301" stroke="#fff" stroke-width="1"/>`; });
      if (st && st.stake && !st.acq){ const [fx, fy] = P(x0 + w, y0, top + 0.2); g += `<line x1="${fx}" y1="${fy}" x2="${fx}" y2="${fy - 13}" stroke="#fff" stroke-width="1.2"/><rect x="${fx}" y="${fy - 13}" width="12" height="7" fill="#f59e0b"/><text x="${fx + 6}" y="${fy - 7.6}" text-anchor="middle" class="cyfl">%${st.stake}</text>`; }
    } else {
      const sp = CY_SPECIAL.find(z => z.id === L.k.slice(2)); key = 's:' + sp.id; name = sp.ad; col = '#334155';
      const pal = [sp.top, sp.c1, sp.c2];
      if (sp.id === 'uni'){
        g += shadow(x0, y0 + 0.4, w, d - 0.8, 2.6) + box(x0, y0 + 0.4, w, d - 0.8, 0, 2.4, ['#f1e4c8', '#d9c39a', '#b89c6e'], '#fff2c4');
        for (let i = 0.3; i < w; i += 0.6) g += poly([P(x0 + i, y0 + d - 0.2, 0), P(x0 + i + 0.18, y0 + d - 0.2, 0), P(x0 + i + 0.18, y0 + d - 0.2, 2.4), P(x0 + i, y0 + d - 0.2, 2.4)], '#fffaf0');
        g += poly([P(x0, y0 + d - 0.2, 2.4), P(x0 + w, y0 + d - 0.2, 2.4), P(x0 + w/2, y0 + d - 0.2, 3.4)], '#b45309') + poly([P(x0 + w, y0 + 0.4, 2.4), P(x0 + w, y0 + d - 0.2, 2.4), P(x0 + w/2, y0 + d - 0.2, 3.4), P(x0 + w/2, y0 + 0.4, 3.4)], '#92400e');
      } else if (sp.id === 'banka'){
        g += shadow(x0 + 0.3, y0 + 0.3, w - 0.6, d - 0.6, 4) + box(x0 + 0.3, y0 + 0.3, w - 0.6, d - 0.6, 0, 3.6, pal, '#dbeafe');
        for (let i = 0.5; i < w - 0.5; i += 0.55) g += poly([P(x0 + i, y0 + d - 0.15, 0), P(x0 + i + 0.16, y0 + d - 0.15, 0), P(x0 + i + 0.16, y0 + d - 0.15, 1.6), P(x0 + i, y0 + d - 0.15, 1.6)], '#f8fafc');
        const [cx, cy] = P(x0 + w/2, y0 + d/2, 3.6); g += `<ellipse cx="${cx}" cy="${cy}" rx="14" ry="7" fill="#fbbf24"/><ellipse cx="${cx}" cy="${cy - 3}" rx="10" ry="6" fill="#fcd34d"/>`;
      } else if (sp.id === 'borsa'){
        g += shadow(x0 + 0.3, y0 + 0.3, w - 0.6, d - 0.6, 5.5) + box(x0 + 0.3, y0 + 0.3, w - 0.6, d - 0.6, 0, 5.2, pal, '#e2e8f0');
        g += poly([P(x0 + 0.3, y0 + d - 0.3, 1.2), P(x0 + w - 0.3, y0 + d - 0.3, 1.2), P(x0 + w - 0.3, y0 + d - 0.3, 1.7), P(x0 + 0.3, y0 + d - 0.3, 1.7)], '#0f172a');
        const [tx, ty] = P(x0 + w/2, y0 + d - 0.3, 1.45); g += `<text x="${tx}" y="${ty + 2}" text-anchor="middle" class="cytick">BYTE ▲ KOD ▲ NOVA ▼</text>`;
      } else if (sp.id === 'dekor'){
        g += shadow(x0 + 0.2, y0 + 0.2, w - 0.4, d - 0.4, 2.2) + box(x0 + 0.2, y0 + 0.2, w - 0.4, d - 0.4, 0, 2.1, pal, '#fdf2f8', false);
        g += poly([P(x0 + 0.5, y0 + d - 0.2, 0.2), P(x0 + w - 0.5, y0 + d - 0.2, 0.2), P(x0 + w - 0.5, y0 + d - 0.2, 1.2), P(x0 + 0.5, y0 + d - 0.2, 1.2)], '#bfe3ff');
        for (let i = 0; i < 6; i++){ const a = x0 + 0.2 + i*(w - 0.4)/6; g += poly([P(a, y0 + d - 0.2, 1.6), P(a + (w - 0.4)/6, y0 + d - 0.2, 1.6), P(a + (w - 0.4)/6, y0 + d + 0.4, 1.2), P(a, y0 + d + 0.4, 1.2)], i % 2 ? '#ffffff' : '#ec4899'); }
      } else if (sp.id === 'fuar'){
        g += shadow(x0, y0, w, d, 2) + box(x0, y0, w, d, 0, 1.8, pal, '#fff2c4', false);
        const [cx, cy] = P(x0 + w/2, y0 + d/2, 1.8); g += `<ellipse cx="${cx}" cy="${cy}" rx="26" ry="13" fill="#fed7aa"/><ellipse cx="${cx}" cy="${cy - 6}" rx="20" ry="10" fill="#fdba74"/><ellipse cx="${cx}" cy="${cy - 10}" rx="10" ry="5" fill="#fff7ed"/>`;
        for (const [fx, fy] of [[x0 + 0.2, y0 + d + 0.3], [x0 + w + 0.3, y0 + 0.2]]){ const [px, py] = P(fx, fy, 0), [qx, qy] = P(fx, fy, 2.6); g += `<line x1="${px}" y1="${py}" x2="${qx}" y2="${qy}" stroke="#fff" stroke-width="1"/><rect x="${qx}" y="${qy}" width="9" height="6" fill="#ea580c"/>`; }
      } else if (sp.id === 'emlak'){
        g += shadow(x0 + 0.6, y0 + 0.6, w - 1.2, d - 1.2, 2.2) + box(x0 + 0.6, y0 + 0.6, w - 1.2, d - 1.2, 0, 2.0, pal, '#ede9fe');
        const [sx, sy] = P(x0 + w - 0.2, y0 + d + 0.2, 1.6); g += `<rect x="${sx - 14}" y="${sy - 7}" width="28" height="10" rx="2" fill="#fff" stroke="#7c3aed"/><text x="${sx}" y="${sy + 0.5}" text-anchor="middle" class="cysign">SATILIK</text>`;
      } else if (sp.id === 'ev'){
        const lv = s0.ev || 0;
        if (lv === 3){ g += shadow(x0 + 0.5, y0 + 0.5, w - 1, d - 1, 6) + box(x0 + 0.5, y0 + 0.5, w - 1, d - 1, 0, 6, ['#99f6e4', '#14b8a6', '#0f766e'], '#f0fdfa'); g += box(x0 + 0.8, y0 + 0.8, w - 1.6, d - 1.6, 6, 0.6, ['#ccfbf1', '#5eead4', '#2dd4bf'], '', false); }
        else {
          const hw = lv === 2 ? w - 0.4 : w - 1.2, hd = lv === 2 ? d - 1.4 : d - 1.4, hh = lv === 0 ? 2.6 : lv === 1 ? 1.5 : 1.7, bx = x0 + (w - hw)/2, by = y0 + 0.3;
          g += shadow(bx, by, hw, hd, hh) + box(bx, by, hw, hd, 0, hh, lv === 0 ? ['#cbd5e1', '#94a3b8', '#64748b'] : pal, '#fff2c4');
          if (lv >= 1) g += poly([P(bx, by + hd, hh), P(bx + hw, by + hd, hh), P(bx + hw/2, by + hd, hh + 1.2)], '#b91c1c') + poly([P(bx + hw, by, hh), P(bx + hw, by + hd, hh), P(bx + hw/2, by + hd, hh + 1.2), P(bx + hw/2, by, hh + 1.2)], '#991b1b');
          if (lv === 2) g += poly([P(x0 + 0.4, y0 + d - 0.9, 0.04), P(x0 + 2.4, y0 + d - 0.9, 0.04), P(x0 + 2.4, y0 + d - 0.1, 0.04), P(x0 + 0.4, y0 + d - 0.1, 0.04)], '#38bdf8');
        }
        name = 'Evin · ' + CY_EV[lv].ad;
      }
    }
    labels.push([x0 + w/2, y0 + d + 0.95, name, col]);
    svg += `<g class="cyb ${sel === key ? 'on' : ''}" data-act="cy" data-k="sel" data-v="${esc(key)}">${g}</g>`;
  }
  svg += labels.map(([x, y, txt, col]) => { const [lx, ly] = P(x, y, 0), w2 = Math.max(36, txt.length*4.9 + 14);
    return `<g class="cylab"><rect x="${(lx - w2/2).toFixed(1)}" y="${(ly - 7).toFixed(1)}" width="${w2.toFixed(0)}" height="13" rx="6.5" fill="${col}" opacity=".92"/><text x="${lx}" y="${(ly + 2.6).toFixed(1)}" text-anchor="middle">${esc(txt)}</text></g>`; }).join('');
  return `<svg class="cymap" viewBox="-300 -165 670 545" preserveAspectRatio="xMidYMid meet">${svg}</svg>`;
}

function cyPanel(){
  const sel = cyView.sel, s = cyS();
  if (!sel) return `<div class="cypanel"><b>Bytetown'a hoş geldin</b><p>Haritadaki bir binaya dokun: rakip şirketleri incele ve satın al, üniversiteden stajyer al, dekor mağazasından alışveriş yap, evine git ya da borsaya uğra.</p>${s.world && S.day < s.world.until ? `<p class="cyw">Şehirde şu an: <b>${CY_WORLD[s.world.id].ad}</b> · ${s.world.until - S.day} gün daha</p>` : ''}</div>`;
  if (sel === 'me') return `<div class="cypanel"><b>${esc(S.name)}</b><p>${OFFICES[S.office].ad} · ${S.emps.length + 1} kişilik ekip · şirket değeri ${tl(valuation())} · ${myRank()}. sırada</p><div class="cyacts"><button class="btn sm" data-act="page" data-v="finans">Şirket durumu</button><button class="btn sm" data-act="page" data-v="ofis">Ofisim</button></div></div>`;
  if (sel.startsWith('r:')) return cyRivalPanel(RIVALS.find(r => r.n === sel.slice(2)));
  const id = sel.slice(2);
  if (id === 'uni') return cyUniPanel();
  if (id === 'dekor') return cyDecorPanel();
  if (id === 'ev') return cyHomePanel();
  if (id === 'borsa') return `<div class="cypanel"><b>Bytetown Borsası</b><p>Hisse senedi al-sat, halka arz kararlarını ver, şirketinin hisse fiyatını izle.</p><div class="cyacts"><button class="btn sm" data-act="page" data-v="yatirim">Borsa ve yatırımlar</button><button class="btn sm" data-act="page" data-v="finans">Halka arz</button></div></div>`;
  if (id === 'banka') return `<div class="cypanel"><b>Banka</b><p>Kredi çek, taksitlerini öde, kredi puanını yükselt.</p><div class="cyacts"><button class="btn sm" data-act="page" data-v="banka">Bankaya gir</button></div></div>`;
  if (id === 'emlak') return `<div class="cypanel"><b>Emlakçı</b><p>Daha büyük bir ofise taşınmak için emlakçıya uğra.</p><div class="cyacts"><button class="btn sm" data-act="page" data-v="ofis">Ofis seçenekleri</button></div></div>`;
  if (id === 'fuar') return `<div class="cypanel"><b>Fuar ve Lansman Merkezi</b><p>Ürünlerini burada görkemli lansmanlarla tanıtırsın. Bir ürünü yayınlarken lansman planı açılır: tanıtım videosu, fenomen, basın toplantısı, reklam panoları, lansman partisi…</p>${(s.launches||[]).length ? `<div class="cylist">${s.launches.slice(0, 5).map(l => `<div><b>${esc(l.n)}</b><small>${l.d}. gün · ${l.t}</small></div>`).join('')}</div>` : '<p class="pxsub">Henüz burada lansman yapmadın.</p>'}</div>`;
  return '';
}
function cyHTML(){
  return `<div class="cywrap"><div class="cymapw">${cyMapSVG()}</div>${cyPanel()}</div>`;
}

/* ---------------- RAKİP SATIN ALMA ---------------- */
function cyRivalPanel(r){
  if (!r) return '';
  const st = cyRv(r.n), v = rivalVal(r), apps = typeof osRivalApps === 'function' ? osRivalApps().filter(a => a.dev === r.n) : [];
  const emp = Math.max(6, Math.round(Math.log10(v)*4 + (osHash ? osHash(r.n) % 12 : 0)));
  if (st.acq) return `<div class="cypanel"><b>${esc(r.n)} · ${esc(S.name)} grubunun parçası</b><p>${{marka:'Marka olarak yaşatılıyor: her gün kâr payı kazandırıyor.', ekip:'Ekibi ve ürünleri şirketine katıldı.', sat:'Kapatıldı ve varlıkları satıldı.'}[st.acq]}${st.acq === 'marka' ? ` Günlük kâr payı ≈ ${tl(Math.round(v*0.00035))}.` : ''}</p></div>`;
  const stakeCost = Math.round(v*0.1*1.15/1000)*1000, cheap = st.health < 0.5 ? 0.75 : 1, wait = Math.max(0, st.cd - S.day);
  const offers = [[0, 'Piyasa değeri'], [0.2, '%20 primli'], [0.4, '%40 primli']].map(([pr, a]) => { const price = Math.round(v*cheap*(1 + pr)*(1 - st.stake/100)/1000)*1000, ch = cyAcceptChance(st, pr);
    return `<button class="act" data-act="cy" data-k="bid" data-v="${esc(r.n)}|${pr}" ${S.money < price || wait ? 'disabled' : ''}><b>${a}: ${tl(price)}</b><small>Kabul ihtimali %${Math.round(ch*100)}</small></button>`; }).join('');
  return `<div class="cypanel"><b>${esc(r.n)}</b>
    <div class="cystats"><div><b>${tl(v)}</b><small>Şirket değeri</small></div><div><b>${emp}</b><small>Çalışan</small></div><div><b class="${st.health < 0.5 ? 'red' : st.health >= 0.75 ? 'green' : ''}">${cyHealthWord(st.health)}</b><small>Durumu</small></div><div><b>%${st.stake}</b><small>Senin hissen</small></div></div>
    ${apps.length ? `<div class="cylist">${apps.map(a => `<div><b>${esc(a.name)}</b><small>${TYPES[a.type] ? TYPES[a.type].ad : ''} · ${a.rt.toFixed(1).replace('.', ',')} puan</small></div>`).join('')}</div>` : ''}
    <div class="pxlbl">Hisse topla</div>
    ${st.stake >= 51 ? `<button class="btn block" data-act="cy" data-k="takeover" data-v="${esc(r.n)}">Kontrol sende: şirketi devral</button>` : `<button class="btn sm" data-act="cy" data-k="stake" data-v="${esc(r.n)}" ${S.money < stakeCost ? 'disabled' : ''}>%10 hisse al · ${tl(stakeCost)}</button><small class="cyhint">%51'e ulaşınca şirketin kontrolü sende olur ve teklif vermeden devralırsın.</small>`}
    <div class="pxlbl">Satın alma teklifi ${wait ? `<span class="pxmeta">· reddettiler, ${wait} gün sonra tekrar dene</span>` : ''}</div>
    <div class="cezagrid">${offers}</div></div>`;
}
function cyAcceptChance(st, pr){ return Math.max(0.05, Math.min(0.95, 0.2 + pr*1.3 + (1 - st.health)*0.7 + st.stake/150 + Math.min(0.15, S.rep/2000))); }
function cyIntegrate(r){
  const st = cyRv(r.n), v = rivalVal(r);
  curChoices = [
    () => { st.acq = 'marka'; toast(`${r.n} markası yaşatılıyor; her gün kâr payı kazandıracak.`); cyFinish(r); },
    () => { st.acq = 'ekip'; const apps = osRivalApps().filter(a => a.dev === r.n).slice(0, 2);
      for (const a of apps) S.prods.unshift({id:S.idSeq++, name:a.name, type:a.type, topic:a.topic, aud:'herkes', size:'orta', q:Math.round(40 + a.rt*10), peak:Math.round(a.dl/6), life:90, plat:20, age:12, users:Math.round(a.dl/7), earned:0, ad:false, upd:0, viral:0, active:true, day:S.day});
      for (let i = 0; i < 3; i++){ const c = genCand(); c.skill = Math.min(10, c.skill + 2); c.salary = round10(salaryFor(c.skill)); c.from = r.n; S.cands.unshift(c); }
      toast(`${r.n} ekibine katıldı: ${apps.length} ürün senin oldu, 3 yetenekli çalışanı Personel sayfasında seni bekliyor.`); cyFinish(r); },
    () => { st.acq = 'sat'; const g = Math.round(v*0.6/1000)*1000; S.money += g; toast(`${r.n} kapatıldı, varlıkları ${tl(g)} karşılığında satıldı.`); cyFinish(r); },
  ];
  showModal('', `<div class="cyacq"><div class="npey">SATIN ALMA TAMAMLANDI</div><h3>${esc(r.n)} artık senin!</h3><p class="sub">Bu şirketle ne yapacaksın?</p></div>
    <div class="cezagrid"><button class="act" data-act="choice" data-i="0"><b>Markayı yaşat</b><small>Ayrı şirket olarak kalır, her gün kâr payı · şirket değerine eklenir</small></button>
    <button class="act" data-act="choice" data-i="1"><b>Ekibime kat</b><small>Ürünleri senin olur, en iyi 3 çalışanı işe alabilirsin</small></button>
    <button class="act" data-act="choice" data-i="2"><b>Kapat ve sat</b><small>Hemen ${tl(Math.round(v*0.6/1000)*1000)} nakit</small></button></div>`, 'pro');
  snd('cash');
}
function cyFinish(r){ S.rep += 8; if (typeof hkGossip === 'function') hkGossip(`${S.name}, ${r.n} şirketini satın aldı! Şehirde herkes bunu konuşuyor.`, true); cyS().acqN = (cyS().acqN||0) + 1; cyView.sel = 'r:' + r.n; if (page === 'sehir') renderPage(true); }

/* ---------------- STAJYER PROGRAMI ---------------- */
function cyInterns(){
  const s = cyS();
  if (!s.uni || S.day - (s.uniDay||0) >= 30){ s.uniDay = S.day; s.uni = [0,1,2].map(() => { const c = genCand(); c.skill = 1 + cyR(2); c.salary = 3500 + cyR(6)*500; c.pot = 1 + cyR(3); return c; }); }
  return s.uni;
}
const CY_POT = {1:{ad:'Normal', cap:5}, 2:{ad:'Yetenekli', cap:7}, 3:{ad:'Parlak', cap:9}};
function cyUniPanel(){
  const list = cyInterns(), ints = S.emps.filter(e => e.intern);
  return `<div class="cypanel"><b>Bytetown Üniversitesi · Stajyer programı</b><p>Stajyerler çok ucuzdur ve hızla gelişir. 90 gün sonra kadroya alabilirsin; potansiyeli yüksek olan yıldız çalışana dönüşür. Kadroya almazsan 180. günde stajı biter.</p>
    <div class="cylist">${list.map(c => `<div class="cyint"><span class="hkav" style="width:38px;height:38px">${avatarSVG(c.id, c.role, c.emo)}</span><div class="grow"><b>${esc(c.name)}</b><small>${ROLES[c.role].ad} · yetenek ${c.skill} · ${tl(c.salary)}/ay</small><small>Potansiyel: ${'★'.repeat(c.pot)}${'☆'.repeat(3 - c.pot)} ${CY_POT[c.pot].ad}</small></div><button class="btn sm" data-act="cy" data-k="intern" data-v="${c.id}" ${S.emps.length >= cap() ? 'disabled' : ''}>Stajyer al</button></div>`).join('')}</div>
    ${ints.length ? `<div class="pxlbl">Stajyerlerin</div><div class="cylist">${ints.map(e => { const age = S.day - e.intern.d;
      return `<div class="cyint"><div class="grow"><b>${esc(e.name)}</b><small>yetenek ${e.skill}/${CY_POT[e.intern.pot].cap} · ${age}. gün</small></div>${age >= 90 ? `<button class="btn sm" data-act="cy" data-k="kadro" data-v="${e.id}">Kadroya al · ${tl(round10(salaryFor(e.skill)))}/ay</button>` : `<small>${90 - age} gün sonra kadro</small>`}</div>`; }).join('')}</div>` : ''}</div>`;
}
function cyInternDay(){
  for (const e of [...S.emps]){
    if (!e.intern) continue;
    const age = S.day - e.intern.d, cap0 = CY_POT[e.intern.pot].cap;
    if (age > 0 && age % (28 - e.intern.pot*4) === 0 && e.skill < cap0){ e.skill++; if (e.sk) for (const k in e.sk) e.sk[k] = Math.min(10, e.sk[k] + (Math.random() < 0.5 ? 1 : 0)); toast(`Stajyer ${firstName(e)} gelişiyor: yetenek ${e.skill}`); }
    if (age >= 180){ S.emps = S.emps.filter(x => x !== e); sceneKey = ''; toast(`${esc(e.name)} stajını tamamladı ve ayrıldı. Kadroya almadın.`); }
  }
}

/* ---------------- OFİS DEKORASYONU (3D, pencerelerin üstündeki duvar şeridi) ---------------- */
const CY_DECOR = [
  {id:'neon', ad:'Neon şirket tabelası', acik:'Arka duvarda parlayan şirket adı', fiyat:60000, mood:0.12, rep:2},
  {id:'saat', ad:'Büyük duvar saati', acik:'Akrep ve yelkovanı gerçekten döner', fiyat:12000, mood:0.05},
  {id:'odul', ad:'Ödül rafı', acik:'Kazandığın ödüller rafta parlar', fiyat:40000, mood:0.08, rep:3},
  {id:'flama', ad:'Renkli flama zinciri', acik:'Ofise şenlik havası', fiyat:6000, mood:0.08},
  {id:'tablo', ad:'Sanat tabloları', acik:'Üç modern tablo', fiyat:30000, mood:0.08},
  {id:'led', ad:'Renk değiştiren LED şerit', acik:'Duvarların üstünde yumuşak renkler', fiyat:25000, mood:0.1},
  {id:'plak', ad:'Plak duvarı', acik:'Efsane albümlerin kapakları', fiyat:18000, mood:0.07},
  {id:'pano', ad:'Motivasyon pankartı', acik:'"Hayal et · Kodla · Yayınla"', fiyat:8000, mood:0.06},
];
const cyDecorOwned = () => (S.cy && S.cy.decor) || {};
function cyDecorPanel(){
  const own = cyDecorOwned();
  return `<div class="cypanel"><b>Dekor Mağazası</b><p>Aldığın dekorlar ofisinde pencerelerin üstündeki duvara yerleşir ve 3D ofiste görünür. Her biri ekibin moralini her gün biraz artırır.</p>
    <div class="cydec">${CY_DECOR.map(d => { const o = own[d.id];
      return `<div class="${o ? 'on' : ''}"><b>${d.ad}</b><small>${d.acik} · moral +${d.mood}/gün${d.rep ? ' · +' + d.rep + ' itibar' : ''}</small>${o ? `<button class="btn sm gray" data-act="cy" data-k="dekor" data-v="${d.id}">${o === 'kapali' ? 'Duvara as' : 'Kaldır'}</button>` : `<button class="btn sm" data-act="cy" data-k="dekor" data-v="${d.id}" ${S.money < d.fiyat ? 'disabled' : ''}>Satın al · ${tl(d.fiyat)}</button>`}</div>`; }).join('')}</div></div>`;
}

/* ---------------- PATRONUN HAYATI ---------------- */
const CY_EV = [
  {ad:'Kiralık daire', fiyat:0, regen:0, rep:0},
  {ad:'Kendi dairen', fiyat:2e6, regen:0.6, rep:2},
  {ad:'Bahçeli villa', fiyat:25e6, regen:1.2, rep:6},
  {ad:'Gökdelen çatı katı', fiyat:200e6, regen:2, rep:15},
];
const CY_LIFE = [
  {id:'aile', ad:'Ailenle hafta sonu', acik:'Enerji +25', en:25, k:0, cd:10, fiyat:3000},
  {id:'uyku', ad:'Erken uyu', acik:'Enerji +10', en:10, cd:3, fiyat:0},
  {id:'spor', ad:'Spor salonu üyeliği', acik:'Her gün enerji +0,6 · aylık', sub:true, fiyat:2500},
  {id:'tatil', ad:'Kendine 5 gün tatil', acik:'5 gün çalışmazsın · enerji %100', en:100, cd:40, fiyat:40000, off:5},
];
const cyEn = () => { const s = cyS(); if (s.en == null) s.en = 80; return s.en; };
function cyBossMult(){ const s = cyS(); if (s.off && S.day < s.off) return 0; const e = cyEn(); return e < 20 ? 0.5 : e < 40 ? 0.75 : e > 85 ? 1.08 : 1; }
function cyHomePanel(){
  const s = cyS(), en = Math.round(cyEn()), lv = s.ev || 0, nx = CY_EV[lv + 1];
  return `<div class="cypanel"><b>Evin · ${CY_EV[lv].ad}</b>
    <div class="cyen"><span>Enerjin</span><i><b style="width:${en}%;background:${en < 30 ? '#dc2626' : en < 60 ? '#f59e0b' : '#16a34a'}"></b></i><em>%${en}</em></div>
    <p>${s.off && S.day < s.off ? `Tatildesin: ${s.off - S.day} gün sonra dönüyorsun.` : en < 30 ? 'Çok yorgunsun! Kod yazma hızın yarıya düştü. Dinlenmen lazım.' : en < 60 ? 'Biraz yorgunsun, hızın düşmeye başladı.' : 'Formdasın.'} Çok çalıştıkça enerjin düşer; düşük enerji seni yavaşlatır.</p>
    <div class="cydec">${CY_LIFE.map(a => { const wait = Math.max(0, ((s.lifeCd||{})[a.id]||0) - S.day), on = a.sub && s.spor;
      return `<div class="${on ? 'on' : ''}"><b>${a.ad}</b><small>${a.acik}${a.fiyat ? ' · ' + tl(a.fiyat) : ''}</small><button class="btn sm" data-act="cy" data-k="life" data-v="${a.id}" ${wait || (S.money < a.fiyat && !on) ? 'disabled' : ''}>${on ? 'Üyeliği bitir' : wait ? wait + ' gün sonra' : 'Yap'}</button></div>`; }).join('')}</div>
    <div class="pxlbl">Ev</div>
    ${nx ? `<div class="cydec"><div><b>${nx.ad}</b><small>Her gün enerji +${nx.regen} · +${nx.rep} itibar</small><button class="btn sm" data-act="cy" data-k="ev" ${S.money < nx.fiyat ? 'disabled' : ''}>Satın al · ${tl(nx.fiyat)}</button></div></div>` : '<p class="pxsub">Şehrin en lüks evinde yaşıyorsun.</p>'}
    <div class="cyacts"><button class="btn sm" data-act="page" data-v="yatirim">Araç galerisi (Yatırımlar)</button></div></div>`;
}
function cyBossDay(){
  const s = cyS(); cyEn();
  const working = S.projs.some(p => typeof needsWork === 'function' && needsWork(p)) && !(s.off && S.day < s.off);
  s.en += working ? -(1.3 + (S.boost > 0 ? 0.8 : 0)) : 2.5;
  s.en += (CY_EV[s.ev||0].regen || 0) + (s.spor ? 0.6 : 0);
  s.en = clamp(s.en, 0, 100);
  if ((S.day - 1) % 30 === 0 && s.spor) S.money -= 2500;
  if (s.en < 12 && !(s.off && S.day < s.off) && cyFree()){
    s.off = S.day + 3; s.en = 45;
    showModal('', `<div class="exhol"><div class="npey" style="color:#dc2626">PATRON TÜKENDİ</div><h3>Vücudun "dur" dedi</h3><p class="sub">Haftalardır durmadan çalışıyordun. Doktor 3 gün zorunlu dinlenme verdi; bu sürede kod yazamazsın. Ekibin işleri sürdürecek.</p></div><button class="btn block" data-act="close">Dinleneceğim</button>`, 'pro');
    snd('bad');
  }
}

/* ---------------- LANSMAN ETKİNLİĞİ ---------------- */
const CY_LAUNCH = [
  {id:'video', ad:'Tanıtım videosu', acik:'Kullanıcı +%10', m:0.10, k:0.02},
  {id:'fenomen', ad:'Sosyal medya fenomeni', acik:'Kullanıcı +%20 (gençlerde +%35) · %15 skandal riski', m:0.20, k:0.04},
  {id:'basin', ad:'Basın toplantısı', acik:'Kullanıcı +%6 · +3 itibar', m:0.06, rep:3, k:0.015},
  {id:'pano', ad:'Şehirde reklam panoları', acik:'Kullanıcı +%15', m:0.15, k:0.05},
  {id:'parti', ad:'Lansman partisi', acik:'Ekip morali +8 · +2 itibar', m:0.03, rep:2, mood:8, k:0.025},
  {id:'beta', ad:'Erken erişim (beta)', acik:'Ücretsiz · 5 gün gecikir · kalite +4', q:4, wait:5, k:0},
];
const CY_WAIT = [[0, 'Hemen yayınla', 'Bekleme yok'], [7, '7 gün merak uyandır', 'Kullanıcı +%12'], [14, '14 gün büyük beklenti', 'Kullanıcı +%22 · rakip araya girebilir']];
let cyLF = null;
const cyLCost = (p, it) => Math.max(10000, round10(prodBudget(p.type, p.size)*it.k));
function cyLaunchMenu(pid){
  const p = S.projs.find(x => x.id === pid); if (!p) return;
  if (!cyLF || cyLF.pid !== pid) cyLF = {pid, ch:{}, w:0};
  const f = cyLF, sel = CY_LAUNCH.filter(x => f.ch[x.id]), cost = sel.reduce((a, x) => a + cyLCost(p, x), 0);
  const mult = 1 + sel.reduce((a, x) => a + (x.m||0) + (x.id === 'fenomen' && p.aud === 'genc' ? 0.15 : 0), 0) + [0, 0.12, 0.22][f.w];
  const wait = CY_WAIT[f.w][0] + sel.reduce((a, x) => a + (x.wait||0), 0);
  curChoices = [];
  showModal('', `<div class="npey">LANSMAN PLANI</div><h3 style="margin:2px 0 6px">${esc(p.name)} nasıl tanıtılsın?</h3>
    <div class="pxlbl">Zamanlama</div><div class="chips">${CY_WAIT.map(([d, a, b], i) => `<button class="chip ${f.w === i ? 'on' : ''}" data-act="cy" data-k="lw" data-v="${i}">${a} <small>${b}</small></button>`).join('')}</div>
    <div class="pxlbl">Tanıtım (birden fazla seçebilirsin)</div>
    <div class="cylaunch">${CY_LAUNCH.map(x => `<button class="${f.ch[x.id] ? 'on' : ''}" data-act="cy" data-k="lc" data-v="${x.id}"><b>${x.ad}</b><small>${x.acik}</small><em>${x.k ? tl(cyLCost(p, x)) : 'Ücretsiz'}</em></button>`).join('')}</div>
    <div class="cysum"><div><span>Beklenen kullanıcı etkisi</span><b>+%${Math.round((mult - 1)*100)}</b></div><div><span>Toplam maliyet</span><b>${tl(cost)}</b></div><div><span>Yayın</span><b>${wait ? wait + ' gün sonra' : 'Hemen'}</b></div></div>
    <div class="grid2" style="gap:8px;margin-top:10px"><button class="pxghost" data-act="cy" data-k="lgo" data-v="0">Tanıtımsız yayınla</button><button class="npgo" data-act="cy" data-k="lgo" data-v="1" ${S.money < cost ? 'disabled' : ''}>Lansmanı başlat</button></div>`, 'pro');
}
function cyLaunchGo(full){
  const f = cyLF, p = f && S.projs.find(x => x.id === f.pid); if (!p) return;
  const sel = full ? CY_LAUNCH.filter(x => f.ch[x.id]) : [], cost = sel.reduce((a, x) => a + cyLCost(p, x), 0);
  if (S.money < cost) return;
  S.money -= cost;
  let mult = 1 + sel.reduce((a, x) => a + (x.m||0) + (x.id === 'fenomen' && p.aud === 'genc' ? 0.15 : 0), 0) + (full ? [0, 0.12, 0.22][f.w] : 0);
  const notes = [];
  if (f.ch.fenomen && full && Math.random() < 0.15){ mult -= 0.3; notes.push('fenomen skandala karıştı'); }
  if (full && f.w === 2 && Math.random() < 0.25){ mult -= 0.12; notes.push('bir rakip araya girdi'); }
  p.launch = {mult:Math.max(0.7, mult), rep:sel.reduce((a, x) => a + (x.rep||0), 0), mood:sel.reduce((a, x) => a + (x.mood||0), 0), q:sel.reduce((a, x) => a + (x.q||0), 0), notes, names:sel.map(x => x.ad)};
  const wait = (full ? CY_WAIT[f.w][0] : 0) + sel.reduce((a, x) => a + (x.wait||0), 0);
  cyLF = null; closeModal();
  if (wait > 0){ p.launchAt = S.day + wait; toast(`${esc(p.name)} lansmanı ${wait} gün sonra (${p.launchAt}. gün). Merak artıyor!`); snd('ok'); updateHome(); }
  else if (full) cyShow(p); else release(p.id);
}
function cyLaunchApply(p){
  const L = p.launch; if (!L) return 1;
  if (L.rep) S.rep += L.rep; if (L.mood) moodAll(L.mood);
  const s = cyS(); (s.launches = s.launches || []).unshift({n:p.name, d:S.day, t:L.names.length ? L.names.join(', ') : 'Sade lansman'}); if (s.launches.length > 12) s.launches.pop();
  return L.mult;
}
const cyLaunchLine = p => p.launch ? `<div class="lbl"><span>Lansman</span><b class="${p.launch.mult >= 1 ? 'green' : 'red'}">${p.launch.names.length ? p.launch.names.join(', ') : 'Sade'} · kullanıcı ${p.launch.mult >= 1 ? '+' : ''}${Math.round((p.launch.mult - 1)*100)}%${p.launch.notes.length ? ' (' + p.launch.notes.join(', ') + ')' : ''}</b></div>` : '';
function cyLaunchDay(){
  for (const p of S.projs) if (p.launchAt && S.day >= p.launchAt && cyFree()){ p.launchAt = 0; cyShow(p); return; }
}

// lansmanı izle: ofis yerine lansman salonu, canlı sayaçlar, alkış ve konfeti, sonra sonuç
function cyShow(p){
  if (!window.S3D || !S3D.launch){ release(p.id); return; }
  closeModal(); if (page) closePage();
  window.cyShowing = true;
  const q = calcQuality(p), fill = Math.max(0.15, Math.min(1, (q - 25)/60)), pct = Math.round(fill*100);   // çok beğenilen ürün = dolu salon
  S3D.launch(true, {name:p.name, type:TYPES[p.type].ad, company:S.name, fill});
  const L = p.launch || {mult:1, names:[]}, target = Math.round(800*(L.mult||1)*(0.3 + fill)*(1 + Math.min(S.rep, 600)/120)*(SIZES[p.size].i + 1));
  const ov = document.createElement('div'); ov.id = 'lnch';
  ov.innerHTML = `<div class="lnt"><span class="lnlive">CANLI</span><b>${esc(p.name)} lansmanı</b><small>${esc(S.name)} · Salon %${pct} dolu</small></div>
    <div class="lnc"><div><span>İzleyici</span><b id="lnV">0</b></div><div><span>Ön kayıt</span><b id="lnR">0</b></div><div class="lnh"><span>Heyecan</span><i><b id="lnH"></b></i></div></div>
    <div class="lnm" id="lnM">Sahne hazırlanıyor…</div>`;
  $('app').appendChild(ov);
  const msgs = [[0, `${esc(S.boss || 'Patron')} sahneye çıktı`], [1500, 'Ekran açılıyor…'], [2900, `Ve karşınızda: ${esc(p.name)}!`], [4300, fill >= 0.9 ? 'Salon ağzına kadar dolu, herkes ayakta alkışlıyor!' : fill >= 0.55 ? 'Salon alkışlarla inliyor!' : fill >= 0.3 ? 'Yarım salon, alkışlar fena değil.' : 'Salon bomboş, alkışlar cılız kaldı…']];
  msgs.forEach(([ms, m]) => setTimeout(() => { const e = document.getElementById('lnM'); if (e) e.textContent = m; }, ms));
  const t0 = Date.now(), iv = setInterval(() => { const k = Math.min(1, (Date.now() - t0)/5200), e = x => document.getElementById(x);
    if (!e('lnV')){ clearInterval(iv); return; } e('lnV').textContent = fmt(Math.round(target*k*(0.9 + Math.random()*0.1))); e('lnR').textContent = fmt(Math.round(target*0.35*k*k)); e('lnH').style.width = Math.round(10 + (25 + 65*fill)*k) + '%'; }, 120);
  setTimeout(() => { if (S3D.launchClap) S3D.launchClap(); snd('cash'); }, 2900);
  setTimeout(() => { clearInterval(iv); window.cyShowing = false; release(p.id);
    const w = setInterval(() => { if (page || $('modal').classList.contains('hidden')){ clearInterval(w); S3D.launch(false); ov.remove(); } }, 400); }, 6000);
}
/* ---------------- MÜŞTERİ PAZARLIĞI ---------------- */
const CY_PERS = {comert:{ad:'Cömert', base:0.65, pat:4}, dengeli:{ad:'Dengeli', base:0.5, pat:3}, pazar:{ad:'Pazarlıkçı', base:0.35, pat:3}, sert:{ad:'Sert', base:0.25, pat:2}};
function cyNeg(oid){
  const o = S.offers.find(x => x.id === oid); if (!o || o.negDone) return;
  if (!o.neg){ const ks = Object.keys(CY_PERS), pk = ks[(typeof osHash === 'function' ? osHash(o.client) : 0) % ks.length];
    o.neg = {pers:pk, pat:CY_PERS[pk].pat, pay0:o.pay, days0:o.days, adv:0, log:[`"Merhaba, ${TYPES[o.type].ad.toLowerCase()} işimiz için ${tl(o.pay)} ve ${o.days} gün düşünüyoruz."`]}; }
  const n = o.neg, P = CY_PERS[n.pers];
  curChoices = [];
  showModal('', `<div class="npey">PAZARLIK MASASI</div><h3 style="margin:2px 0 2px">${esc(o.client)}</h3><div class="pxmeta">Müşterinin tavrı: <b>${P.ad}</b> · sabrı: ${'●'.repeat(n.pat)}${'○'.repeat(Math.max(0, P.pat - n.pat))}</div>
    <div class="cynegl">${n.log.slice(-4).map(l => `<p>${l}</p>`).join('')}</div>
    <div class="cysum"><div><span>Ödeme</span><b>${tl(o.pay)}</b>${o.pay !== n.pay0 ? `<small class="cyup">${o.pay > n.pay0 ? "+" : ""}${Math.round((o.pay/n.pay0 - 1)*100)}% kazandın</small>` : ""}</div><div><span>Teslim süresi</span><b>${o.days} gün</b>${o.days !== n.days0 ? `<small class="cyup">+${o.days - n.days0} gün</small>` : ""}</div><div><span>Peşin</span><b>${n.adv ? '%' + Math.round(n.adv*100) : 'Yok'}</b></div></div>
    <div class="cezagrid" style="margin-top:8px">
      <button class="act" data-act="cy" data-k="neg" data-v="${o.id}|p10"><b>Ücreti %10 artır</b><small>Küçük bir istek</small></button>
      <button class="act" data-act="cy" data-k="neg" data-v="${o.id}|p25"><b>Ücreti %25 artır</b><small>Cesur bir istek</small></button>
      <button class="act" data-act="cy" data-k="neg" data-v="${o.id}|d5"><b>Süreyi +5 gün uzat</b><small>Daha rahat çalışırsın</small></button>
      <button class="act" data-act="cy" data-k="neg" data-v="${o.id}|adv" ${n.adv ? 'disabled' : ''}><b>%20 peşin iste</b><small>Paranın bir kısmı hemen gelir</small></button>
    </div>
    <div class="grid2" style="gap:8px;margin-top:10px"><button class="pxghost" data-act="close">Sonra düşünürüm</button><button class="npgo" data-act="cy" data-k="neg" data-v="${o.id}|deal">Anlaştık</button></div>`, 'pro');
}
function cyNegStep(oid, what){
  const o = S.offers.find(x => x.id === oid); if (!o || !o.neg) return;
  const n = o.neg, P = CY_PERS[n.pers];
  if (what === 'deal'){
    o.negDone = true;
    if (n.adv){ const a = round10(o.pay*n.adv); S.money += a; o.pay -= a; toast(`Anlaşma tamam. ${tl(a)} peşin kasana girdi; kalan ${tl(o.pay)} teslimde.`); }
    else toast(`${o.client} ile anlaştın: ${tl(o.pay)} · ${o.days} gün.`);
    snd('ok'); closeModal(); renderPage(true); return;
  }
  const ask = what === 'p10' ? 0.1 : what === 'p25' ? 0.25 : what === 'd5' ? 0.08 : 0.1;
  const already = o.pay/n.pay0 - 1, ch = Math.max(0.05, P.base - already*1.5 - (ask - 0.1) + Math.min(0.15, S.rep/1500));
  const r = Math.random();
  if (r < ch){
    if (what === 'p10' || what === 'p25') o.pay = Math.round(o.pay*(1 + ask)/500)*500;
    else if (what === 'd5') o.days += 5; else n.adv = 0.2;
    n.log.push(`Sen: ${{p10:'Ücreti %10 artıralım.', p25:'Bu iş %25 daha fazla eder.', d5:'5 gün daha süre lazım.', adv:'%20 peşin istiyoruz.'}[what]}`, `"${pick(['Peki, kabul.', 'Tamam, makul.', 'Olur, anlaşalım.'])}"`);
  } else if (r < ch + 0.3 && (n.pers === 'pazar' || n.pers === 'dengeli') && (what === 'p10' || what === 'p25')){
    o.pay = Math.round(o.pay*(1 + ask/2)/500)*500; n.pat--;
    n.log.push(`Sen: Ücreti %${Math.round(ask*100)} artıralım.`, `"O kadar olmaz. Yarısında buluşalım: ${tl(o.pay)}."`);
  } else {
    n.pat--; n.log.push(`Sen: ${{p10:'Ücreti %10 artıralım.', p25:'Bu iş %25 daha fazla eder.', d5:'5 gün daha süre lazım.', adv:'%20 peşin istiyoruz.'}[what]}`, `"${pick(['Bu bizim için mümkün değil.', 'Hayır, bütçemiz bu.', 'Bunu kabul edemeyiz.'])}"`);
  }
  if (n.pat <= 0){
    S.offers = S.offers.filter(x => x !== o); S.rep = Math.max(0, S.rep - 1);
    closeModal(); toast(`${o.client} sabrı tükendi ve masadan kalktı. İş kaçtı.`); snd('bad'); renderPage(true); return;
  }
  snd('click'); cyNeg(oid);
}

/* ---------------- DÜNYA OLAYLARI ---------------- */
const CY_WORLD = {
  kriz:   {ad:'Ekonomik kriz', acik:'Ürün gelirleri %20 düştü', rev:t => 0.8, peak:t => 0.85},
  ai:     {ad:'Yapay zekâ çılgınlığı', acik:'Yapay zekâ ürünlerine ilgi patladı (+%40)', rev:t => t === 'ai' ? 1.4 : 1, peak:t => t === 'ai' ? 1.4 : 1},
  oyun:   {ad:'Mobil oyun furyası', acik:'Oyun ve mobil uygulamalara ilgi arttı (+%30)', rev:t => (t === 'oyun' || t === 'mobil') ? 1.3 : 1, peak:t => (t === 'oyun' || t === 'mobil') ? 1.3 : 1},
  eticaret:{ad:'E-ticaret patlaması', acik:'Web sitelerine ilgi arttı (+%30)', rev:t => t === 'web' ? 1.3 : 1, peak:t => t === 'web' ? 1.3 : 1},
  yatirim:{ad:'Teknoloji yatırım rüzgarı', acik:'Bütün ürünler +%10, yatırımcılar cömert', rev:t => 1.1, peak:t => 1.1},
};
const cyWorld = () => { const w = S.cy && S.cy.world; return w && S.day < w.until ? CY_WORLD[w.id] : null; };
const cyWorldRev = p => { const w = cyWorld(); return w ? w.rev(p.type) : 1; };
const cyWorldPeak = p => { const w = cyWorld(); return w ? w.peak(p.type) : 1; };
function cyWorldDay(force){
  const s = cyS();
  if (s.nextWorld == null) s.nextWorld = S.day + 80;
  if (!force && S.day < s.nextWorld) return;
  s.nextWorld = S.day + 90 + cyR(60);
  if (!force && Math.random() > 0.65) return;
  const id = force && CY_WORLD[force] ? force : pick(Object.keys(CY_WORLD));
  s.world = {id, until:S.day + 40 + cyR(25)};
  toast(`Dünya gündemi: ${CY_WORLD[id].ad}! ${CY_WORLD[id].acik}.`); snd('event');
  if (typeof hkGossip === 'function') hkGossip(`Herkes ${CY_WORLD[id].ad.toLowerCase()} konuşuyor.`, true);
}

/* ---------------- GÜNLÜK DÖNGÜ VE EYLEMLER ---------------- */
function cyDay(){
  if (!S || S.meeting) return;
  const s = cyS();
  // dekor morali ve markası yaşatılan şirketlerin kâr payı
  const own = s.decor || {}; let md = 0; for (const d of CY_DECOR) if (own[d.id] === true) md += d.mood;
  if (md) for (const e of S.emps) e.mood = clamp((e.mood??70) + md, 5, 100);
  for (const r of RIVALS){ const x = s.rv && s.rv[r.n]; if (x && x.acq === 'marka') S.money += Math.round(rivalVal(r)*0.00035);
    if (x && !x.acq && (S.day % 30) === 0) x.health = clamp(x.health + (Math.random() - 0.5)*0.25, 0.25, 1); }
  cyBossDay(); cyInternDay(); cyWorldDay(); cyLaunchDay();
}
function cyAct(el){
  const k = el.dataset.k, v = el.dataset.v || '', s = cyS();
  if (k === 'sel'){ cyView.sel = cyView.sel === v ? null : v; snd('click'); renderPage(true); return; }
  if (k === 'home'){ closeModal(); cyView.sel = 's:ev'; openPage('sehir'); return; }
  if (k === 'stake'){ const r = RIVALS.find(x => x.n === v), st = cyRv(v), c = Math.round(rivalVal(r)*0.1*1.15/1000)*1000; if (S.money < c || st.stake >= 51) return;
    S.money -= c; st.stake = Math.min(100, st.stake + 10); toast(`${v} şirketinde %${st.stake} hisseye ulaştın.`); snd('cash'); if (st.stake >= 51) toast('Kontrol artık sende! Şirketi devralabilirsin.'); }
  else if (k === 'takeover'){ const r = RIVALS.find(x => x.n === v); if (r && cyRv(v).stake >= 51){ cyIntegrate(r); return; } }
  else if (k === 'bid'){ const [n, pr] = v.split('|'), r = RIVALS.find(x => x.n === n), st = cyRv(n); if (!r || st.cd > S.day) return;
    const price = Math.round(rivalVal(r)*(st.health < 0.5 ? 0.75 : 1)*(1 + +pr)*(1 - st.stake/100)/1000)*1000; if (S.money < price) return;
    if (Math.random() < cyAcceptChance(st, +pr)){ S.money -= price; cyIntegrate(r); return; }
    st.cd = S.day + 30; toast(`${n} teklifini reddetti. 30 gün sonra tekrar deneyebilirsin; bu arada hisse toplamak işe yarayabilir.`); snd('bad'); }
  else if (k === 'intern'){ const list = cyInterns(), c = list.find(x => x.id === +v); if (!c || S.emps.length >= cap()) return;
    s.uni = list.filter(x => x !== c); c.intern = {d:S.day, pot:c.pot}; c.name += ' (Stajyer)'; c.since = S.day; delete c.pot; S.emps.push(c); sceneKey = ''; toast(`${esc(c.name)} staja başladı!`); snd('ok'); }
  else if (k === 'kadro'){ const e = S.emps.find(x => x.id === +v); if (!e || !e.intern) return; e.name = e.name.replace(' (Stajyer)', ''); delete e.intern; e.salary = round10(salaryFor(e.skill)); e.loyal = true; moodOne(e, 15); toast(`${esc(e.name)} kadroya alındı ve şirkete çok sadık!`); snd('ok'); }
  else if (k === 'dekor'){ const d = CY_DECOR.find(x => x.id === v), own = (s.decor = s.decor || {}); if (!d) return;
    if (!own[d.id]){ if (S.money < d.fiyat) return; S.money -= d.fiyat; own[d.id] = true; if (d.rep) S.rep += d.rep; toast(`${d.ad} ofisine asıldı!`); snd('cash'); }
    else own[d.id] = own[d.id] === true ? 'kapali' : true;
    sceneKey = ''; }
  else if (k === 'life'){ const a = CY_LIFE.find(x => x.id === v), cd = (s.lifeCd = s.lifeCd || {}); if (!a) return;
    if (a.sub){ if (s.spor){ s.spor = false; toast('Spor salonu üyeliği bitti.'); } else { if (S.money < a.fiyat) return; S.money -= a.fiyat; s.spor = true; toast('Spor salonuna üye oldun. Her gün daha enerjik!'); } }
    else { if ((cd[a.id]||0) > S.day || S.money < a.fiyat) return; S.money -= a.fiyat; cd[a.id] = S.day + a.cd; cyEn(); s.en = clamp(s.en + a.en, 0, 100); if (a.off) s.off = S.day + a.off; toast(`${a.ad}: enerjin %${Math.round(s.en)}.`); snd('ok'); } }
  else if (k === 'ev'){ const lv = s.ev || 0, nx = CY_EV[lv + 1]; if (!nx || S.money < nx.fiyat) return; S.money -= nx.fiyat; s.ev = lv + 1; S.rep += nx.rep; toast(`Yeni evin: ${nx.ad}!`); snd('cash'); }
  else if (k === 'lw'){ cyLF.w = +v; cyLaunchMenu(cyLF.pid); return; }
  else if (k === 'lc'){ cyLF.ch[v] = !cyLF.ch[v]; cyLaunchMenu(cyLF.pid); return; }
  else if (k === 'lgo'){ cyLaunchGo(v === '1'); return; }
  else if (k === 'neg'){ const [id, w] = v.split('|'); if (w) cyNegStep(+id, w); else cyNeg(+id); return; }
  if (page) renderPage(true);
}
// yayınla düğmesi: kendi ürünlerinde önce lansman planı açılır
function cyRelease(id){
  const p = S.projs.find(x => x.id === id); if (!p) return;
  if (p.launchAt && S.day < p.launchAt){ toast(`Lansman ${p.launchAt - S.day} gün sonra. Merak artıyor!`); return; }
  if (p.kind !== 'is' && !p.launch && typeof devDone === 'function' && devDone(p)){ cyLaunchMenu(id); return; }
  release(id);
}
// test paneli için
function cyForce(k){
  closeModal(); if (page) closePage();
  if (k === 'sehir') openPage('sehir');
  else if (k === 'rakip'){ openPage('sehir'); cyView.sel = 'r:' + rvActive()[0].n; renderPage(true); }
  else if (k === 'uni' || k === 'dekor' || k === 'ev'){ openPage('sehir'); cyView.sel = 's:' + k; renderPage(true); }
  else if (k === 'neg'){ if (!S.offers.length) S.offers.push(genOffer()); const o = S.offers[0]; o.negDone = false; o.neg = null; cyNeg(o.id); }
  else if (k === 'lansman'){ let p = S.projs.find(x => x.kind !== 'is'); if (!p){ toast('Önce bir ürün geliştirmeye başla.'); return; } p.launch = null; cyLF = null; cyLaunchMenu(p.id); }
  else if (k === 'tukenme'){ cyS().en = 5; cyS().off = 0; cyBossDay(); }
  else if (CY_WORLD[k]) cyWorldDay(k);
}

// kendi menünde enerji çubuğu ve eve git
function cyBossLine(){
  const en = Math.round(cyEn()), s = cyS();
  return `<div class="cyen" style="margin:6px 0"><span>Enerjin</span><i><b style="width:${en}%;background:${en < 30 ? '#dc2626' : en < 60 ? '#f59e0b' : '#16a34a'}"></b></i><em>%${en}</em><button class="btn sm" data-act="cy" data-k="home" style="margin-left:6px">Evim</button></div>${s.off && S.day < s.off ? `<p class="sub" style="text-align:center;margin:0">Dinleniyorsun: ${s.off - S.day} gün sonra işe dönüyorsun.</p>` : ''}`;
}