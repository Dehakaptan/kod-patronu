'use strict';
/* =====================================================================
   Bytetown – müşteri ilişkileri
   Her müşteriyle bir ilişki puanı (-100…100) tutulur. İyi teslimatlar
   müşteriyi sadık yapar: tekrar iş verir, daha çok öder, asla ödemeyi
   geciktirmez. Kötü teslimatlar müşteriyi kızdırır: internette kötü yorum
   yazar, seninle çalışmayı bırakır, hatta tazminat davası açabilir.
   ===================================================================== */
const msS = () => { S.ms = S.ms || {cl:{}, gift:{}}; return S.ms; };
const msCl = name => { const s = msS(); return s.cl[name] || (s.cl[name] = {rel:0, jobs:0, sum:0, last:0}); };
const msRel = name => (S.ms && S.ms.cl[name]) ? S.ms.cl[name].rel : 0;
function msLevel(r, jobs){
  if (r >= 60) return {k:'sadik', ad:'Sadık müşteri', c:'#15803d'};
  if (r >= 25) return {k:'memnun', ad:'Memnun', c:'#2563eb'};
  if (r > -25) return {k:'notr', ad:jobs ? 'Nötr' : 'Yeni', c:'#64748b'};
  if (r > -60) return {k:'kirgin', ad:'Kırgın', c:'#d97706'};
  return {k:'kizgin', ad:'Kızgın', c:'#b91c1c'};
}
const msLoyal = name => msRel(name) >= 60;

/* ---- teslimde ilişki değişir ---- */
function msDeliver(p, sc, late, pay, unpaid){
  const name = p.client; if (!name) return;
  const c = msCl(name), before = c.rel;
  let d = sc >= 9 ? 28 : sc >= 7.5 ? 18 : sc >= 6 ? 8 : sc >= 4.5 ? -12 : -30;
  if (late > 0) d -= Math.min(15, late*1.5);
  if (unpaid) d -= 20;
  if (typeof difMul === 'function') d = d > 0 ? d*difMul('rel') : d;
  c.rel = clamp(Math.round(c.rel + d), -100, 100); c.jobs++; c.sum += sc; c.last = S.day; c.lastPay = pay; c.lastSc = sc; c.lastLate = late || 0;
  c.contact = (p.brief && p.brief.contact) || c.contact;
  const L0 = msLevel(before, 1), L1 = msLevel(c.rel, 1);
  if (L1.k === 'sadik' && L0.k !== 'sadik') setTimeout(() => { if (S) toast(`${esc(name)} artık sadık müşterin! Sana daha sık ve daha iyi ücretle iş verecek.`); }, 3200);
  // kızgın müşteri intikam planlar
  if (c.rel <= -45 && sc < 5.5 && !c.revenge) c.revenge = {day:S.day + 2 + Math.floor(Math.random()*5), k:Math.random() < 0.3 ? 'dava' : 'yorum'};
}

/* ---- teklif üretimi: sadık müşteriler daha sık gelir, kızgınlar hiç gelmez ---- */
function msPickClient(){
  const s = S.ms ? S.ms.cl : {};
  const pool = CLIENT_LIST.filter(c => !(s[c.ad] && s[c.ad].rel <= -60));
  const loyal = pool.filter(c => s[c.ad] && s[c.ad].rel >= 25);
  if (loyal.length && Math.random() < 0.4) return pick(loyal);
  return pick(pool.length ? pool : CLIENT_LIST);
}
function msPayMult(name){ const r = msRel(name); return r >= 60 ? 1.2 : r >= 25 ? 1.08 : r <= -25 ? 0.92 : 1; }
function msBadge(name){
  const c = S.ms && S.ms.cl[name]; if (!c || !c.jobs) return '<div class="msbadge new">Yeni müşteri</div>';
  const L = msLevel(c.rel, c.jobs);
  return `<div class="msbadge" style="--c:${L.c}">${L.ad}${L.k === 'sadik' ? ' · +%20 ödeme' : L.k === 'memnun' ? ' · +%8 ödeme' : ''} · ${c.jobs} iş</div>`;
}

/* ---- her gün: sadık müşteriden özel teklif, kızgın müşterinin intikamı ---- */
function msDay(){
  if (!S || !S.ms) return;
  const free = typeof hkFree === 'function' ? hkFree() : true;
  for (const [name, c] of Object.entries(S.ms.cl)){
    if (c.revenge && S.day >= c.revenge.day && free){
      const k = c.revenge.k; c.revenge = null;
      if (k === 'dava' && typeof dvSue === 'function' && !(S.dv && S.dv.cases.some(x => x.def && x.stage !== 'done'))){
        const claim = Math.round((c.lastPay || 50000)*(0.5 + Math.random()*0.4));
        dvSue(name, c.contact, claim, c.lastSc || 4, c.lastLate || 0, pick(['Teslim ettiğiniz sistem sürekli çöktü, müşterilerimizi kaybettik. Zararımızı ödemelisiniz.', 'Proje geç ve eksik teslim edildi; bu yüzden büyük bir kampanyayı kaçırdık.', 'Uygulamadaki hatalar yüzünden müşteri bilgileri karıştı, itibarımız zedelendi.']));
      } else {
        const loss = 2 + Math.floor(Math.random()*4);
        S.rep = Math.max(0, S.rep - loss);
        showModal('', `<div class="nphead"><div><div class="npey" style="color:#b91c1c">KÖTÜ YORUM</div><h3>${esc(name)} seni internette kötüledi</h3></div></div>
          <blockquote class="dvq">“${esc(pick(['Bu şirketle çalışmayın! İş geç geldi, hatalarla doluydu.', 'Paramızı boşa harcadık. Söz verdikleri hiçbir şey yoktu.', 'Destek yok, kalite yok. Kesinlikle tavsiye etmiyoruz.']))}”<small>${esc(c.contact || 'Yetkili')}, ${esc(name)}</small></blockquote>
          <div class="lbl"><span>İtibar</span><b class="red">-${loss}</b></div>
          <p class="pxsub">Müşterilerinle ilişkini Müşterilerim sayfasından takip edebilir, kırgın müşterilere özür ve indirim gönderebilirsin.</p>
          <div class="grid2" style="gap:10px"><button class="pxghost" data-act="close">Kapat</button><button class="npgo" data-act="page" data-v="musteri">Müşterilerim</button></div>`, 'pro');
        snd('bad');
      }
      return;
    }
  }
  // ayda bir, sadık bir müşteri doğrudan özel iş teklif eder
  if (S.day % 30 === 12 && free && S.offers && S.offers.length < 7){
    const loyal = CLIENT_LIST.filter(c => msLoyal(c.ad));
    if (loyal.length && Math.random() < 0.7){
      const cl = pick(loyal), o = genOffer();
      o.client = cl.ad; o.cid = CLIENT_LIST.indexOf(cl); o.brief = makeBrief(cl, o.type); o.pay = Math.round(o.pay*1.25/500)*500; o.loyal = true; o.days += 3;
      S.offers.unshift(o);
      toast(`Sadık müşterin ${esc(cl.ad)} sana özel bir iş gönderdi: ${tl(o.pay)}. Müşteri İşleri'ne bak!`); snd('ok');
    }
  }
}

/* ---- müşterilerim sayfası ---- */
function msHTML(){
  const s = msS(), list = Object.entries(s.cl).filter(([, c]) => c.jobs).sort((a, b) => b[1].rel - a[1].rel);
  const cnt = k => list.filter(([, c]) => msLevel(c.rel, c.jobs).k === k).length;
  const rows = list.map(([name, c]) => {
    const L = msLevel(c.rel, c.jobs), cl = CLIENT_LIST.find(x => x.ad === name), sec = cl && SECTORS[cl.s] ? cl.s : '', avg = Math.round(c.sum/c.jobs*10)/10;
    const gcd = (s.gift[name] || 0) > S.day, cost = Math.max(15000, Math.round((c.lastPay || 100000)*0.05));
    const act = c.rel < 25 ? `<button class="pxghost sm" data-act="ms" data-v="${esc(name)}" data-k="ozur" ${gcd || S.money < cost ? 'disabled' : ''}>${gcd ? 'Yakında tekrar' : `Özür ve indirim · ${tl(cost)}`}</button>`
      : `<button class="pxghost sm" data-act="ms" data-v="${esc(name)}" data-k="hediye" ${gcd || S.money < cost ? 'disabled' : ''}>${gcd ? 'Hediye gönderildi' : `Teşekkür hediyesi · ${tl(cost)}`}</button>`;
    return `<div class="msrow">
      <div class="msn"><b>${esc(name)}</b><small>${esc(c.contact || '')}${sec ? ' · ' + SECTOR_AD(sec) : ''}</small></div>
      <div class="msrel"><div class="msbar"><b style="${c.rel >= 0 ? `left:50%;width:${c.rel/2}%` : `left:${50 + c.rel/2}%;width:${-c.rel/2}%`};background:${L.c}"></b></div><span style="color:${L.c}">${L.ad}</span></div>
      <div class="msst"><b>${c.jobs}</b><small>iş</small></div><div class="msst"><b>${avg}</b><small>ort. puan</small></div>
      <div class="msact">${act}</div></div>`;
  }).join('');
  return `<div class="pxhead"><div><div class="npey">MÜŞTERİ İLİŞKİLERİ</div><div class="pxsub">İyi iş çıkardıkça müşteriler sadıklaşır: daha sık ve daha iyi ücretle iş verirler, ödemeyi asla geciktirmezler. Kızgın müşteriler kötü yorum yazar, hatta dava açabilir.</div></div></div>
    <div class="grid4" style="margin-bottom:10px"><div class="kv"><b style="color:#15803d">${cnt('sadik')}</b><span>Sadık</span></div><div class="kv"><b style="color:#2563eb">${cnt('memnun')}</b><span>Memnun</span></div><div class="kv"><b>${cnt('notr')}</b><span>Nötr</span></div><div class="kv"><b style="color:#b91c1c">${cnt('kirgin') + cnt('kizgin')}</b><span>Kırgın / kızgın</span></div></div>
    ${rows ? `<div class="mslist">${rows}</div>` : '<div class="empty-msg">Henüz bir müşteri işi teslim etmedin. İlk işini teslim edince müşterilerin burada görünür.</div>'}`;
}
const SECTOR_AD = s => ({restoran:'Restoran', hukuk:'Hukuk', perakende:'Perakende', turizm:'Turizm', egitim:'Eğitim', saglik:'Sağlık', lojistik:'Lojistik', spor:'Spor', tarim:'Tarım', guzellik:'Güzellik', otomotiv:'Otomotiv', emlak:'Emlak', kamu:'Kamu'})[s] || s;
function msAct(el){
  const name = el.dataset.v, k = el.dataset.k, s = msS(), c = s.cl[name]; if (!c) return;
  const cost = Math.max(15000, Math.round((c.lastPay || 100000)*0.05)); if (S.money < cost || (s.gift[name] || 0) > S.day) return;
  S.money -= cost; s.gift[name] = S.day + 60;
  const up = k === 'ozur' ? 22 : 10; c.rel = clamp(c.rel + up, -100, 100); if (k === 'ozur') c.revenge = null;
  toast(k === 'ozur' ? `${esc(name)} özrünü kabul etti, ilişkiniz düzeliyor (+${up}).` : `${esc(name)} hediyene çok sevindi (+${up}).`); snd('ok');
}
function msTileHTML(){ return `<button class="pcm-t" data-act="page" data-v="musteri"><span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11l3 3 5-6"/><path d="M3 12c2-3 4-4 6-4l3 1 3-1c2 0 4 1 6 4"/><path d="M5 14l4 4M19 14l-4 4"/></svg></span><span>Müşterilerim</span></button>`; }
if (typeof PAGES !== 'undefined') PAGES.musteri = {t:'Müşterilerim', html:() => msHTML(), stat:true};
if (typeof ACTIONS !== 'undefined') ACTIONS.ms = el => msAct(el);
// test paneli
function msForce(k){
  const cl = pick(CLIENT_LIST), c = msCl(cl.ad);
  if (k === 'sadik'){ c.rel = 80; c.jobs = Math.max(c.jobs, 3); c.sum = Math.max(c.sum, 26); c.lastPay = 400000; const o = genOffer(); o.client = cl.ad; o.brief = makeBrief(cl, o.type); o.pay = Math.round(o.pay*1.25/500)*500; o.loyal = true; S.offers.unshift(o); openPage('isler'); return; }
  if (k === 'yorum' || k === 'dava'){ c.rel = -70; c.jobs = Math.max(c.jobs, 1); c.sum = Math.max(c.sum, 3); c.lastSc = 3.5; c.lastPay = 200000; c.revenge = {day:S.day, k}; if (S.dv) S.dv.cases = S.dv.cases.filter(x => !(x.def && x.stage !== 'done')); msDay(); return; }
  if (k === 'sayfa'){ c.jobs = Math.max(c.jobs, 1); c.sum = Math.max(c.sum, 7); openPage('musteri'); }
}
