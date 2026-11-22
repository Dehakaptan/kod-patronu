'use strict';
/* =====================================================================
   Bytetown – başarımlar
   Mevcut 20 başarım (ekstra.js) + yenileri. Her başarımın madalyası
   (bronz, gümüş, altın, platin), kategorisi ve Ar-Ge puanı ödülü var.
   Gizli başarımlar açılana kadar "???" görünür. Açılınca köşede
   oyun konsollarındaki gibi bir kart kayar.
   ===================================================================== */
const BA_TIER = {
  b:{ad:'Bronz',  c1:'#f3c08f', c2:'#b06a2c', odul:5},
  g:{ad:'Gümüş',  c1:'#eef2f7', c2:'#94a3b8', odul:10},
  a:{ad:'Altın',  c1:'#fde68a', c2:'#d97706', odul:20},
  p:{ad:'Platin', c1:'#e0f2fe', c2:'#6366f1', odul:40},
};
const BA_CAT = [['hepsi','Hepsi'], ['bas','Başlangıç'], ['sirket','Şirket'], ['ekip','Ekip'], ['urun','Ürünler'], ['patron','Patron']];
const baS = () => { const s = exS(); s.ba = s.ba || {}; return s.ba; };
const baDv = r => !!(S.dv && S.dv.cases.some(c => c.res === r));
const baRivalAcq = () => !!(S.cy && S.cy.rv && Object.values(S.cy.rv).some(x => x.acq));
const baTech = () => Object.values(S.tech || {}).filter(Boolean).length;

// mevcut başarımların madalyası, kategorisi, gizliliği ve ilerlemesi
const BA_META = {
  ilk:['b','bas'], urun:['b','bas'], viral:['g','urun'], efsane:['a','urun'], ekip:['g','ekip', 0, () => [S.emps.length, 12]],
  gokdelen:['a','sirket', 0, () => [S.office, 4]], borcsuz:['p','sirket'], dedektif:['g','ekip', 1], hayal:['g','ekip'], odul:['g','urun'],
  gece:['b','patron', 1], durust:['g','patron', 1], toplanti:['b','ekip', 0, () => [exS().meetN || 0, 5]], tatil:['b','ekip'], kedi:['b','ekip', 1],
  borsa:['a','sirket'], hack:['b','ekip'], karanlik:['g','patron', 1], milyar:['a','sirket', 0, () => [S.money, 1e9]], zirve:['p','sirket'],
};
// yeni başarımlar
const BA_NEW = [
  {id:'calisan',  ad:'Artık Yalnız Değilsin', acik:'İlk çalışanını işe al', t:'b', cat:'bas', c:() => S.emps.length >= 1},
  {id:'ilkmilyon',ad:'İlk Milyon',            acik:'Kasada ₺1 milyon biriktir', t:'b', cat:'bas', c:() => S.money >= 1e6, pr:() => [S.money, 1e6]},
  {id:'garaj',    ad:'Garajdan Çıkış',        acik:'İlk gerçek ofisine taşın', t:'b', cat:'bas', c:() => S.office >= 1},
  {id:'tekno',    ad:'Yeni Ufuklar',          acik:'İkinci bir ürün türünün kilidini aç', t:'b', cat:'bas', c:() => baTech() >= 2},
  {id:'tumtekno', ad:'Her Şeyi Yaparız',      acik:'Bütün ürün türlerini aç', t:'g', cat:'urun', c:() => typeof TYPES !== 'undefined' && baTech() >= Object.keys(TYPES).length, pr:() => [baTech(), typeof TYPES !== 'undefined' ? Object.keys(TYPES).length : 4]},
  {id:'is25',     ad:'Güvenilir Ortak',       acik:'25 müşteri işi teslim et', t:'g', cat:'urun', c:() => S.stats.done >= 25, pr:() => [S.stats.done, 25]},
  {id:'urun10',   ad:'Seri Üretim',           acik:'10 ürün yayınla', t:'g', cat:'urun', c:() => S.stats.prodsDone >= 10, pr:() => [S.stats.prodsDone, 10]},
  {id:'tampuan',  ad:'Kusursuz Teslimat',     acik:'Bir müşteriden 10 üzerinden 10 al', t:'a', cat:'urun', c:() => (S.inbox || []).some(m => m.score >= 10)},
  {id:'dolusalon',ad:'Tıklım Tıklım',         acik:'Lansmanda salonu ağzına kadar doldur', t:'a', cat:'urun', c:() => !!baS().dolu},
  {id:'itibar100',ad:'Tanınan Marka',         acik:'100 itibara ulaş', t:'g', cat:'sirket', c:() => S.rep >= 100, pr:() => [S.rep, 100]},
  {id:'itibar500',ad:'Efsane Marka',          acik:'500 itibara ulaş', t:'a', cat:'sirket', c:() => S.rep >= 500, pr:() => [S.rep, 500]},
  {id:'onmilyar', ad:'Teknoloji Devi',        acik:'Kasada ₺10 milyar biriktir', t:'p', cat:'sirket', c:() => S.money >= 1e10, pr:() => [S.money, 1e10]},
  {id:'rakip',    ad:'Büyük Balık',           acik:'Bir rakip şirketi satın al', t:'a', cat:'sirket', c:baRivalAcq},
  {id:'ekip25',   ad:'Büyük Aile',            acik:'25 kişilik ekip kur', t:'a', cat:'ekip', c:() => S.emps.length >= 25, pr:() => [S.emps.length, 25]},
  {id:'yonetici', ad:'Sağ Kolum',             acik:'Bir yönetici ata', t:'b', cat:'ekip', c:() => !!S.mgr},
  {id:'mutlu',    ad:'Mutlu Ofis',            acik:'En az 5 kişilik ekipte herkesin morali 90 üstünde olsun', t:'g', cat:'ekip', c:() => S.emps.length >= 5 && S.emps.every(e => (e.mood ?? 70) >= 90)},
  {id:'stajyer',  ad:'Akıl Hocası',           acik:'Bir stajyeri kadroya al', t:'g', cat:'ekip', c:() => S.emps.some(e => e.loyal && !e.intern)},
  {id:'dava',     ad:'Adalet Yerini Buldu',   acik:'Ödemeyen bir müşteriye açtığın davayı kazan', t:'g', cat:'patron', c:() => baDv('kazandi')},
  {id:'uzlasma',  ad:'Orta Yol',              acik:'Bir davayı uzlaşmayla bitir', t:'b', cat:'patron', c:() => baDv('uzlasma')},
  {id:'ihtar',    ad:'Tahsilat Ustası',       acik:'İhtarnameyle alacağını tahsil et', t:'b', cat:'patron', c:() => baDv('odedi')},
  {id:'ev',       ad:'Rüya Ev',               acik:'Patronun evini en üst seviyeye çıkar', t:'a', cat:'patron', c:() => typeof CY_EV !== 'undefined' && (S.cy && S.cy.ev || 0) >= CY_EV.length - 1},
  {id:'kaybet',   ad:'Her Dava Kazanılmaz',   acik:'Bir davayı kaybet', t:'b', cat:'patron', h:1, c:() => baDv('kaybetti')},
  {id:'yil5',     ad:'Kıdemli Patron',        acik:'5 yıl boyunca şirketi ayakta tut', t:'g', cat:'patron', c:() => S.day >= 5*360, pr:() => [S.day, 1800]},
];
if (typeof EX_ACH !== 'undefined'){
  for (const A of EX_ACH){ const m = BA_META[A.id]; if (m){ A.t = m[0]; A.cat = m[1]; A.h = m[2] || 0; if (m[3]) A.pr = m[3]; } }
  for (const A of BA_NEW) if (!EX_ACH.some(x => x.id === A.id)) EX_ACH.push(A);
}

/* ---- madalya çizimi ---- */
function baMedal(t, on, size){
  const T = BA_TIER[t || 'b'], s = size || 44, id = 'bm' + Math.random().toString(36).slice(2, 7);
  if (!on) return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><circle cx="24" cy="26" r="17" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/><path d="M19 23v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#94a3b8" stroke-width="2.6"/><rect x="16.5" y="23" width="15" height="11" rx="2.5" fill="#94a3b8"/></svg>`;
  return `<svg viewBox="0 0 48 48" width="${s}" height="${s}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.c1}"/><stop offset="1" stop-color="${T.c2}"/></linearGradient></defs>
    <path d="M14 2h8l4 12h-8zM34 2h-8l-4 12h8z" fill="${t === 'p' ? '#6366f1' : t === 'a' ? '#dc2626' : t === 'g' ? '#2563eb' : '#15803d'}"/>
    <circle cx="24" cy="28" r="17" fill="url(#${id})" stroke="${T.c2}" stroke-width="2"/><circle cx="24" cy="28" r="12" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/>
    <path d="M24 19.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fff" opacity=".92"/></svg>`;
}

/* ---- açılınca: ödül + köşede kayan kart ---- */
const baQueue = [];
let baBusy = false;
function baUnlock(A){ baUnlockMany([A]); }
function baUnlockMany(L){
  if (!L.length) return;
  for (const A of L) S.rp = (S.rp || 0) + BA_TIER[A.t || 'b'].odul;
  // aynı anda çok başarım açılırsa (eski kayıtta ilk açılış gibi) ekranı doldurmasın
  const show = L.length > 3 ? L.slice().sort((x, y) => 'pagb'.indexOf(x.t || 'b') - 'pagb'.indexOf(y.t || 'b')).slice(0, 2) : L;
  baQueue.push(...show); snd('ok'); if (!baBusy) baNext();
  if (L.length > show.length) toast(`${L.length - show.length} başarım daha açıldı! Başarımlar sayfasına bak.`);
}
function baNext(){
  const A = baQueue.shift(); if (!A){ baBusy = false; return; }
  baBusy = true;
  const T = BA_TIER[A.t || 'b'], el = document.createElement('div');
  el.className = 'bapop t-' + (A.t || 'b'); el.dataset.act = 'page'; el.dataset.v = 'basarim';
  el.innerHTML = `<span class="bam">${baMedal(A.t, true, 52)}</span><div><small>BAŞARIM AÇILDI · ${T.ad.toLocaleUpperCase('tr-TR')}</small><b>${esc(A.ad)}</b><span>${esc(A.acik)}</span><em>+${T.odul} Ar-Ge puanı</em></div>`;
  $('app').appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => { el.remove(); baNext(); }, 450); }, 4600);
}

/* ---- başarımlar sayfası ---- */
let baTab = 'hepsi';
function baHTML(){
  const a = exS().ach || {}, all = EX_ACH, n = all.filter(A => a[A.id]).length, pct = Math.round(n/all.length*100);
  const tiers = ['p','a','g','b'].map(t => { const L = all.filter(A => (A.t || 'b') === t); return `<div class="batier t-${t}">${baMedal(t, true, 28)}<b>${L.filter(A => a[A.id]).length}/${L.length}</b><small>${BA_TIER[t].ad}</small></div>`; }).join('');
  const list = all.filter(A => baTab === 'hepsi' || A.cat === baTab).sort((x, y) => (a[y.id] ? 1 : 0) - (a[x.id] ? 1 : 0));
  return `<div class="bahead"><div class="baring" style="--p:${pct}"><b>%${pct}</b></div>
      <div class="grow"><div class="npey">BAŞARIMLAR</div><h3>${n} / ${all.length} açıldı</h3><p class="sub">Her başarım madalyasına göre Ar-Ge puanı kazandırır. Gizli başarımlar açılana kadar görünmez.</p></div>
      <div class="batiers">${tiers}</div></div>
    <div class="batabs">${BA_CAT.map(([k, t]) => `<button class="${baTab === k ? 'on' : ''}" data-act="batab" data-v="${k}">${t}</button>`).join('')}</div>
    <div class="bagrid">${list.map(A => { const on = !!a[A.id], hid = A.h && !on, pr = !on && A.pr ? A.pr() : null;
      return `<div class="baitem ${on ? 'on' : ''} t-${A.t || 'b'}">${baMedal(A.t, on, 46)}<div class="grow"><b>${hid ? 'Gizli başarım' : esc(A.ad)}</b><small>${hid ? 'Oynadıkça kendiliğinden ortaya çıkacak…' : esc(A.acik)}</small>
        ${pr ? `<div class="bapr"><i style="width:${Math.min(100, Math.round(pr[0]/pr[1]*100))}%"></i></div><small class="bapn">${pr[1] >= 1e5 ? `${tl(Math.min(pr[0], pr[1]))} / ${tl(pr[1])}` : `${Math.min(pr[0], pr[1])} / ${pr[1]}`}</small>` : ''}
        ${on ? `<small class="bad">${a[A.id]}. gün · ${BA_TIER[A.t || 'b'].ad}</small>` : ''}</div></div>`; }).join('')}</div>`;
}
function baTileHTML(){
  const a = (S && S.ex && S.ex.ach) || {}, n = EX_ACH.filter(A => a[A.id]).length;
  return `<button class="pcm-t" data-act="page" data-v="basarim"><span class="ci">${baMedal('a', true, 30)}</span><span>Başarımlar ${n}/${EX_ACH.length}</span></button>`;
}
function baBtnHTML(){
  const a = exS().ach || {}, n = EX_ACH.filter(A => a[A.id]).length;
  return `<button class="btn block" data-act="page" data-v="basarim" style="margin-bottom:10px">Başarımlar · ${n}/${EX_ACH.length} açıldı</button>`;
}
// lansmanda salon dolu mu? (Tıklım Tıklım başarımı için)
if (typeof cyShow === 'function'){
  const _cyShow = cyShow;
  cyShow = function(p){ try { if (calcQuality(p) >= 79) baS().dolu = true; } catch (e) {} return _cyShow(p); };
}
if (typeof PAGES !== 'undefined') PAGES.basarim = {t:'Başarımlar', html:() => baHTML(), stat:true};
if (typeof ACTIONS !== 'undefined') ACTIONS.batab = el => { baTab = el.dataset.v; };
