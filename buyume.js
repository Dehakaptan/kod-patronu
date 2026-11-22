'use strict';
/* =====================================================================
   Bytetown – büyüme: fon turları, ofis tasarımı, çalışan ilişkileri,
   rakip hamleleri, ürün yol haritası, patronun özel hayatı, sezonluk
   etkinlikler, şubeler ve istatistik paneli
   ===================================================================== */
const bgS = () => { S.bg = S.bg || {rounds:{}, rel:{}, od:{}, sube:{}, hist:[], life:{aile:'bekar', cocuk:0, saglik:80, hobi:null}, camp:null}; return S.bg; };
const bgFree = () => typeof hkFree === 'function' ? hkFree() : (!page && $('modal').classList.contains('hidden'));
const bgR = n => Math.floor(Math.random()*n);

/* =============== 1) FON TURLARI =============== */
const BG_ROUNDS = [
  {id:'tohum', ad:'Tohum yatırım', minV:2e6,  pct:10, rep:2},
  {id:'a',     ad:'Seri A',        minV:2.5e7, pct:15, rep:4},
  {id:'b',     ad:'Seri B',        minV:2.5e8, pct:12, rep:6},
  {id:'c',     ad:'Seri C',        minV:2e9,  pct:10, rep:10},
];
const BG_INV = [
  {id:'atlas', ad:'Atlas Girişim Fonu',       renk:'#0f766e', huy:'sabırlı',  sev:{buyume:1, kar:2, vizyon:1}, acik:'Uzun vadeli düşünür, kârlılığa önem verir.'},
  {id:'kuzey', ad:'Kuzey Ventures',           renk:'#b91c1c', huy:'agresif',  sev:{buyume:2, kar:0, vizyon:1}, acik:'Hızlı büyüme ister, cesur planları sever.'},
  {id:'sevim', ad:'Melek Yatırımcı Sevim Tan', renk:'#7c3aed', huy:'cömert',   sev:{buyume:1, kar:1, vizyon:2}, acik:'Hayalleri ve ekibi önemser.'},
];
const BG_Q = [
  {s:'Önümüzdeki iki yılda şirketi nasıl büyüteceksiniz?', a:[['buyume', 'Her çeyrek yeni bir ürün çıkarıp pazarı ele geçireceğiz.'], ['kar', 'Önce kârlılığı sağlamlaştırıp sonra adım adım büyüyeceğiz.'], ['vizyon', 'Bytetown\'un en sevilen teknoloji markası olmak istiyoruz.']]},
  {s:'Paramızı ne için kullanacaksınız?', a:[['buyume', 'Ekibi iki katına çıkaracağız.'], ['kar', 'Ürünlerimizi güçlendirip gelirleri artıracağız.'], ['vizyon', 'Kimsenin yapmadığı yeni bir teknoloji geliştireceğiz.']]},
  {s:'Rakipleriniz sizi geçerse ne yaparsınız?', a:[['buyume', 'Daha hızlı koşar, onları satın alırız.'], ['kar', 'Fiyat savaşına girmeden sadık müşterilerimize odaklanırız.'], ['vizyon', 'Bizi farklı kılan ekibimize ve fikirlerimize güveniriz.']]},
];
let bgPitch = null;
function bgFonHTML(){
  const s = bgS(), v = valuation(); syncOwnership();
  return `<div class="pxhead"><div><div class="npey">YATIRIMCI GÖRÜŞMELERİ</div><div class="pxsub">Şirket değerin büyüdükçe fon turları açılır. Yatırımcılara sunum yap, sorularını cevapla, teklif üzerine pazarlık et. Sattığın hisse oranında ürün gelirleri yatırımcılara gider. Şirketteki payın en az %30 kalmalı.</div></div>
      <div class="pxstat"><span>Şirket değeri</span><b>${tl(v)}</b></div></div>
    <div class="bgrounds">${BG_ROUNDS.map((R, i) => { const done = s.rounds[R.id], prevOk = i === 0 || s.rounds[BG_ROUNDS[i - 1].id], ok = !done && prevOk && v >= R.minV && S.ownership - R.pct >= 30;
      return `<div class="bground ${done ? 'done' : ok ? 'ok' : ''}"><b>${R.ad}</b><small>%${R.pct} hisse · en az ${tl(R.minV)} değer</small>
        ${done ? `<em class="green">${esc(done.inv)} · ${tl(done.amt)}</em>` : ok ? `<button class="npgo" data-act="bg" data-k="fon" data-v="${R.id}">Yatırımcılarla görüş</button>` : `<em>${!prevOk ? 'Önceki tur gerekli' : v < R.minV ? 'Şirket değeri yetmiyor' : 'Payın çok azalır'}</em>`}</div>`; }).join('')}</div>`;
}
function bgPitchStart(rid){
  const R = BG_ROUNDS.find(x => x.id === rid); if (!R) return;
  bgPitch = {rid, inv:null, q:0, sc:0, notes:[]};
  showModal('', `<div class="nphead"><div><div class="npey">${R.ad.toLocaleUpperCase('tr-TR')}</div><h3>Hangi yatırımcıyla görüşeceksin?</h3></div></div>
    <div class="dvopts">${BG_INV.map(I => `<button class="dvopt" data-act="bg" data-k="inv" data-v="${I.id}"><b>${esc(I.ad)}</b><span>${I.acik}</span><em style="color:${I.renk}">${I.huy}</em></button>`).join('')}</div>
    <button class="pxghost block" data-act="close" style="width:100%;margin-top:8px">Vazgeç</button>`, 'pro');
}
function bgPitchQ(){
  const P = bgPitch, I = BG_INV.find(x => x.id === P.inv), Q = BG_Q[P.q];
  showModal('', `<div class="nphead"><div><div class="npey">SUNUM · SORU ${P.q + 1}/3</div><h3>${esc(I.ad)}</h3></div></div>
    ${P.notes.length ? `<p class="pxsub" style="margin:-4px 0 8px"><i>${esc(P.notes[P.notes.length - 1])}</i></p>` : ''}
    <blockquote class="dvq" style="border-color:${I.renk};background:#f8fafc;color:#0f172a">“${esc(Q.s)}”</blockquote>
    <div class="dvopts">${Q.a.map(([k, t]) => `<button class="dvopt" data-act="bg" data-k="cevap" data-v="${k}"><b>${esc(t)}</b></button>`).join('')}</div>`, 'pro');
}
function bgPitchAnswer(k){
  const P = bgPitch, I = BG_INV.find(x => x.id === P.inv), w = I.sev[k] || 0;
  P.sc += w; P.notes.push(w >= 2 ? 'Yatırımcının gözleri parladı, not alıyor.' : w === 1 ? 'Yatırımcı başını salladı.' : 'Yatırımcı pek ikna olmadı, kaşlarını çattı.');
  P.q++;
  if (P.q < BG_Q.length){ bgPitchQ(); return; }
  const R = BG_ROUNDS.find(x => x.id === P.rid), interest = P.sc/6;
  P.amt = Math.round(valuation()*R.pct/100*(0.75 + interest*0.55)/10000)*10000; P.interest = interest;
  bgOfferModal();
}
function bgOfferModal(note){
  const P = bgPitch, I = BG_INV.find(x => x.id === P.inv), R = BG_ROUNDS.find(x => x.id === P.rid);
  showModal('', `<div class="nphead"><div><div class="npey" style="color:${I.renk}">TEKLİF</div><h3>${esc(I.ad)} yatırım yapmak istiyor</h3></div></div>
    ${note ? `<p class="pxsub">${note}</p>` : ''}
    <div class="lbl"><span>İlgi seviyesi</span><b>${P.interest >= 0.8 ? 'Çok yüksek' : P.interest >= 0.5 ? 'İyi' : 'Düşük'}</b></div>
    <div class="lbl"><span>Teklif</span><b class="green">${tl(P.amt)}</b></div>
    <div class="lbl"><span>Karşılığında</span><b>%${R.pct} hisse</b></div>
    <div class="lbl"><span>Payın sonrası</span><b>%${S.ownership - R.pct}</b></div>
    <div class="grid2" style="gap:8px;margin-top:10px"><button class="pxghost" data-act="bg" data-k="red">Reddet</button><button class="npgo" data-act="bg" data-k="kabul">Kabul et</button></div>
    ${P.countered ? '' : `<button class="pxghost block" data-act="bg" data-k="pazarlik" style="width:100%;margin-top:8px">Pazarlık et: değerlemeyi %25 artır</button>`}`, 'pro');
}
function bgFonAct(k){
  const P = bgPitch; if (!P) return;
  const I = BG_INV.find(x => x.id === P.inv), R = BG_ROUNDS.find(x => x.id === P.rid);
  if (k === 'pazarlik'){
    P.countered = true;
    if (Math.random() < 0.25 + P.interest*0.5){ P.amt = Math.round(P.amt*1.25/10000)*10000; bgOfferModal('Pazarlığın işe yaradı! Yatırımcı teklifini artırdı.'); snd('ok'); }
    else { P.amt = Math.round(P.amt*0.92/10000)*10000; bgOfferModal('Yatırımcı pazarlıktan hoşlanmadı ve teklifini biraz düşürdü.'); snd('bad'); }
    return;
  }
  closeModal();
  if (k === 'kabul'){
    holdersOf().push({id:S.idSeq++, ad:I.ad, renk:I.renk, pct:R.pct, paid:P.amt, day:S.day}); syncOwnership();
    S.money += P.amt; S.stats.earned += P.amt; S.rep += R.rep; bgS().rounds[R.id] = {inv:I.ad, amt:P.amt, day:S.day};
    snd('cash'); toast(`${R.ad} tamamlandı: ${I.ad} ${tl(P.amt)} yatırdı!`);
    if (typeof smEvent === 'function') smEvent('haber', {t:`${S.name} ${R.ad} turunu tamamladı: ${I.ad} ${tl(P.amt)} yatırım yaptı.`, ment:true, sent:1, tag:'#Yatırım'});
  } else toast(`${I.ad} ile anlaşmadın. Bu turu daha sonra yeniden deneyebilirsin.`);
  bgPitch = null;
}

/* =============== 2) OFİS TASARIMI =============== */
const OD_TYPES = {
  calisma: {ad:'Çalışma alanı',  ic:'💻', renk:'#dbeafe', acik:'+%4 çalışma hızı', hiz:0.04},
  dinlenme:{ad:'Dinlenme köşesi', ic:'🛋️', renk:'#fce7f3', acik:'Her gün moral +1', mor:1},
  kahve:   {ad:'Kahve barı',      ic:'☕', renk:'#fef3c7', acik:'+%2 hız, moral +0,5', hiz:0.02, mor:0.5},
  oyun:    {ad:'Oyun köşesi',     ic:'🎮', renk:'#ede9fe', acik:'Moral +1,5 ama hız −%1', hiz:-0.01, mor:1.5},
  sessiz:  {ad:'Sessiz oda',      ic:'🎧', renk:'#e0f2fe', acik:'+2 ürün kalitesi', q:2},
  yesil:   {ad:'Yeşil alan',      ic:'🌿', renk:'#dcfce7', acik:'Moral +0,7 ve +1 kalite', mor:0.7, q:1},
  spor:    {ad:'Spor köşesi',     ic:'🏋️', renk:'#ffedd5', acik:'Moral +0,6, +%1 hız', mor:0.6, hiz:0.01},
};
const odZones = () => [2, 3, 4, 5, 6][Math.min(4, S.office || 0)];
const odCost = () => Math.round(15000*Math.pow(3.2, S.office || 0)/1000)*1000;
function odSum(k){ const od = bgS().od; let v = 0; for (let i = 0; i < odZones(); i++){ const T = OD_TYPES[od[i]]; if (T && T[k]) v += T[k]; } return v; }
function odSpeed(){ return S && S.bg ? 1 + odSum('hiz') : 1; }
function odQ(){ return S && S.bg ? odSum('q') : 0; }
let odSel = null;
function odHTML(){
  const od = bgS().od, n = odZones(), cols = n <= 2 ? 2 : 3, rows = Math.ceil(n/cols), W = 600, H = rows*170 + 20;
  let svg = `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="18" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"/>`;
  for (let i = 0; i < n; i++){
    const c = i % cols, r = Math.floor(i/cols), x = 18 + c*((W - 36)/cols), y = 18 + r*170, w = (W - 36)/cols - 12, h = 154, T = OD_TYPES[od[i]];
    svg += `<g data-act="bg" data-k="zone" data-v="${i}" class="odz ${odSel === i ? 'sel' : ''}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${T ? T.renk : '#ffffff'}" stroke="${odSel === i ? '#2563eb' : '#cbd5e1'}" stroke-width="${odSel === i ? 4 : 2}" stroke-dasharray="${T ? '0' : '8 6'}"/>
      <text x="${x + w/2}" y="${y + 70}" text-anchor="middle" font-size="40">${T ? T.ic : '+'}</text><text x="${x + w/2}" y="${y + 112}" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a">${T ? T.ad : 'Boş alan'}</text><text x="${x + w/2}" y="${y + 134}" text-anchor="middle" font-size="12" fill="#64748b">${T ? T.acik : 'Tıkla ve düzenle'}</text></g>`;
  }
  const pick = odSel != null ? `<div class="pxlbl">${odSel + 1}. alanı ne yapalım? · ${tl(odCost())}</div><div class="odpick">${Object.entries(OD_TYPES).map(([k, T]) => `<button class="${od[odSel] === k ? 'on' : ''}" data-act="bg" data-k="odset" data-v="${k}" ${od[odSel] === k || S.money < odCost() ? 'disabled' : ''}><span>${T.ic}</span><b>${T.ad}</b><small>${T.acik}</small></button>`).join('')}</div>` : '<p class="sub">Düzenlemek istediğin alana tıkla.</p>';
  return `<div class="pxhead"><div><div class="npey">OFİS TASARIMI</div><div class="pxsub">Ofisinin alanlarını nasıl kullanacağına sen karar ver. Büyük ofislerde daha çok alan açılır.</div></div>
      <div class="pxstat"><span>Etkiler</span><b>Hız ${odSpeed() >= 1 ? '+' : ''}${Math.round((odSpeed() - 1)*100)}% · Kalite +${odQ()} · Moral +${odSum('mor').toFixed(1)}/gün</b></div></div>
    <svg class="odplan" viewBox="0 0 ${W} ${H}">${svg}</svg>${pick}`;
}

/* =============== 3) ÇALIŞAN İLİŞKİLERİ =============== */
const erKey = (a, b) => a < b ? a + '-' + b : b + '-' + a;
const erGet = (a, b) => bgS().rel[erKey(a, b)] || {v:0};
function erMult(e){
  if (!S || !S.bg) return 1; let m = 1;
  for (const o of S.emps){ if (o === e) continue; const r = S.bg.rel[erKey(e.id, o.id)]; if (!r) continue; if (r.v >= 40) m += 0.03; if (r.v <= -40) m -= 0.05; }
  return Math.max(0.85, Math.min(1.08, m));
}
function erHTML(e){
  if (!S.bg) return '';
  const fr = [], en = [], love = [];
  for (const o of S.emps){ if (o === e) continue; const r = S.bg.rel[erKey(e.id, o.id)]; if (!r) continue; if (r.ask) love.push(o); else if (r.v >= 40) fr.push(o); else if (r.v <= -40) en.push(o); }
  if (!fr.length && !en.length && !love.length) return '';
  const ch = (L, cls) => L.map(o => `<span class="erch ${cls}">${esc(firstName(o))}</span>`).join('');
  return `<div class="erbox">${fr.length ? `<div><small>Arkadaşları</small>${ch(fr, 'ok')}</div>` : ''}${love.length ? `<div><small>Ofis aşkı</small>${ch(love, 'love')}</div>` : ''}${en.length ? `<div><small>Anlaşamadığı</small>${ch(en, 'bad')}</div>` : ''}</div>`;
}
function erDay(force){
  if (S.emps.length < 2 || (!force && Math.random() > 0.05)) return false;
  const a = pick(S.emps), b = pick(S.emps.filter(x => x !== a)); if (!b) return false;
  const k = erKey(a.id, b.id), r = bgS().rel[k] || (bgS().rel[k] = {v:0}), x = force === 'kavga' ? 0.99 : Math.random();
  if (r.ask && x < 0.2){ r.ask = false; r.v = -30; a.mood = clamp((a.mood ?? 70) - 15, 5, 100); b.mood = clamp((b.mood ?? 70) - 15, 5, 100); toast(`${esc(firstName(a))} ile ${esc(firstName(b))} ayrıldı… İkisinin de morali bozuk.`); return true; }
  if (!r.ask && r.v >= 40 && x < 0.08){ r.ask = true; a.mood = clamp((a.mood ?? 70) + 8, 5, 100); b.mood = clamp((b.mood ?? 70) + 8, 5, 100); toast(`${esc(firstName(a))} ile ${esc(firstName(b))} arasında bir şeyler var gibi… Ofis bu haberle çalkalanıyor!`); return true; }
  if (x < 0.62){ r.v = clamp(r.v + 18 + bgR(12), -100, 100); if (r.v >= 40 && !r.toldF){ r.toldF = true; toast(`${esc(firstName(a))} ile ${esc(firstName(b))} çok iyi arkadaş oldu. Birlikte daha hızlı çalışıyorlar.`); } return true; }
  // kavga
  r.v = clamp(r.v - 30, -100, 100);
  if (!bgFree()) return true;
  curChoices = [
    () => { r.v = clamp(r.v + 35, -100, 100); a.mood = clamp((a.mood ?? 70) - 2, 5, 100); b.mood = clamp((b.mood ?? 70) - 2, 5, 100); toast('Arabuluculuk işe yaradı, barıştılar.'); },
    () => { r.sep = true; toast('Masaları ayrıldı. En azından kavga bitti.'); },
    () => { r.v = clamp(r.v - 20, -100, 100); a.mood = clamp((a.mood ?? 70) - 6, 5, 100); b.mood = clamp((b.mood ?? 70) - 6, 5, 100); toast('Gerginlik sürüyor, ofisin havası bozuldu.'); },
  ];
  showModal('', `<div class="nphead"><div><div class="npey" style="color:#b91c1c">OFİSTE GERGİNLİK</div><h3>${esc(firstName(a))} ile ${esc(firstName(b))} tartıştı</h3></div></div>
    <p class="pxsub">${esc(pick([`Kodda kimin hatası olduğu konusunda anlaşamadılar. Sesler bütün ofisten duyuldu.`, `Toplantıda birbirlerinin sözünü kestiler ve iş büyüdü.`, `Mutfakta son kahve yüzünden başlayan tartışma kişisel bir kavgaya döndü.`]))}</p>
    <div class="dvopts"><button class="dvopt main" data-act="choice" data-i="0"><b>Arabuluculuk yap</b><span>İkisiyle oturup konuş. Barışma ihtimalleri yüksek.</span></button>
      <button class="dvopt" data-act="choice" data-i="1"><b>Masalarını ayır</b><span>Kavga biter ama arkadaş olmaları zor.</span></button>
      <button class="dvopt" data-act="choice" data-i="2"><b>Görmezden gel</b><span>Kendi aralarında çözsünler.</span></button></div>`, 'pro');
  return true;
}

/* =============== 4) RAKİP HAMLELERİ =============== */
function rvMove(force){
  const live = S.prods.filter(p => p.active && p.users > 100).sort((a, b) => b.users - a.users);
  if (!live.length || typeof RIVALS === 'undefined' || !RIVALS.length) return false;
  const p = live[0], R = pick(typeof rvActive === 'function' && rvActive().length ? rvActive() : RIVALS), kind = force || (Math.random() < 0.5 ? 'fiyat' : 'kopya');
  const rev = Math.round(p.users*TYPES[p.type].arpu), adc = Math.max(30000, rev*8);
  if (kind === 'fiyat'){
    curChoices = [
      () => { p.bgHit = {until:S.day + 30, m:0.9}; toast(`${p.name} fiyatını düşürdün: gelir %10 azaldı ama kullanıcılar kalıyor.`); },
      () => { if (S.money < adc) return; S.money -= adc; const g = Math.round(p.peak*0.06); p.peak += g; toast(`Reklam kampanyası başladı: ${p.name} +${fmt(g)} potansiyel kullanıcı.`); },
      () => { const l = Math.round(p.users*0.15); p.users -= l; p.peak = Math.round(p.peak*0.9); toast(`${p.name} ${fmt(l)} kullanıcı kaybetti.`); },
    ];
    if (typeof smEvent === 'function') smEvent('rakip', {rival:R.n, t:`Büyük haber: yeni uygulamamız artık tamamen ücretsiz! ${p.name} kullananlar da bir göz atsın 🎉`, tag:'#FiyatSavaşı'});
    showModal('', `<div class="nphead"><div><div class="npey" style="color:#b91c1c">RAKİP HAMLESİ · FİYAT SAVAŞI</div><h3>${esc(R.n)} fiyat kırdı</h3></div></div>
      <p class="pxsub">${esc(R.n)}, ${esc(p.name)} ürünüyle yarışan uygulamasını bedava yaptı. Kullanıcıların bir kısmı oraya kaymaya başladı.</p>
      <div class="dvopts"><button class="dvopt" data-act="choice" data-i="0"><b>Biz de fiyat düşürelim</b><span>30 gün gelir %10 azalır ama kullanıcılar kalır.</span></button>
        <button class="dvopt main" data-act="choice" data-i="1" ${S.money < adc ? 'disabled' : ''}><b>Reklamla karşılık ver</b><span>Kampanyayla daha çok kişiye ulaş.</span><em>${tl(adc)}</em></button>
        <button class="dvopt" data-act="choice" data-i="2"><b>Görmezden gel</b><span>Kullanıcıların %15'i gider.</span></button></div>`, 'pro');
  } else {
    const claim = Math.max(80000, rev*30);
    curChoices = [
      () => { if (typeof dvS !== 'function') return; const D = dvS(), c = {id:++D.n, client:R.n, contact:'Hukuk müdürü', amount:claim, day:S.day, ex:'iptal', str:0.6, sc:7, late:0, stage:'acik', type:p.type, lineText:`${p.name} ürünümüzün tasarımını ve özelliklerini birebir kopyaladılar.`, courtText:'Benzerlik tesadüftür; müvekkilim ürünü kendi geliştirdi.', head:'FİKRİ HAK İHLALİ'}; D.cases.unshift(c); dvCaseModal(c.id); },
      () => { S.rep += 2; R.kopya = S.day; if (typeof smEvent === 'function') smEvent('haber', {t:`${S.name} açıkladı: ${R.n}, ${p.name} ürününü kopyaladı. Kullanıcılar orijinalin yanında.`, ment:true, sent:1, tag:'#Kopya'}); toast('Kamuoyu senin yanında: itibar +2'); },
      () => { const g = Math.round(p.peak*0.1); p.peak += g; p.upd = Math.min(3, (p.upd || 0)); toast(`Ekip ürünü geliştirdi (${p.name}): +${fmt(g)} potansiyel kullanıcı.`); },
    ];
    showModal('', `<div class="nphead"><div><div class="npey" style="color:#b91c1c">RAKİP HAMLESİ · KOPYA</div><h3>${esc(R.n)} ürününü kopyaladı</h3></div></div>
      <p class="pxsub">${esc(R.n)} bugün bir uygulama yayınladı ve ${esc(p.name)} ürününle neredeyse tıpatıp aynı.</p>
      <div class="dvopts"><button class="dvopt main" data-act="choice" data-i="0"><b>Dava aç</b><span>Fikri hak ihlali davası. Kazanırsan ${tl(claim)} tazminat alırsın.</span></button>
        <button class="dvopt" data-act="choice" data-i="1"><b>Cıvıl'da kamuoyuna duyur</b><span>Kullanıcılar orijinali sahiplenir. İtibar +2.</span></button>
        <button class="dvopt" data-act="choice" data-i="2"><b>Daha iyisini yap</b><span>Ürünü geliştir, rakibi geride bırak.</span></button></div>`, 'pro');
  }
  return true;
}

/* =============== 5) YOL HARİTASI: ANKET VE SÜRÜM 2.0 =============== */
const rmVer = p => (p.major || 0) + 1;
function bgProdBtn(p){ return `<button class="btn sm" data-act="bg" data-k="yol" data-id="${p.id}">${p.v2 ? `Sürüm ${rmVer(p) + 1}.0 hazırlanıyor` : 'Yol haritası'}</button>`; }
function rmModal(id){
  const p = S.prods.find(x => x.id === id); if (!p) return;
  const uc = typeof updCost === 'function' ? updCost(p) : 50000, mc = Math.round(uc*3), sc = Math.max(8000, Math.round(uc*0.3)), v = rmVer(p);
  const steps = [`v1.0 · ${p.day || 1}. gün yayın`].concat(Array.from({length:p.upd || 0}, (_, i) => `v${v}.${i + 1} · güncelleme`)).concat((p.major || 0) ? Array.from({length:p.major}, (_, i) => `v${i + 2}.0 · büyük sürüm`) : []);
  showModal('', `<div class="nphead"><div><div class="npey">YOL HARİTASI</div><h3>${esc(p.name)} · v${v}.${p.upd || 0}</h3></div></div>
    <div class="rmline">${steps.map(t => `<span>${t}</span>`).join('')}${p.v2 ? `<span class="next">v${v + 1}.0 · ${Math.max(0, p.v2 - S.day)} gün sonra</span>` : ''}</div>
    ${p.survey ? `<div class="rmsur"><b>Son anket sonucu</b>${p.survey.map(([t, n]) => `<div><span>${esc(t)}</span><i><b style="width:${n}%"></b></i><em>%${n}</em></div>`).join('')}</div>` : ''}
    <div class="dvopts">
      <button class="dvopt" data-act="bg" data-k="anket" data-id="${p.id}" ${S.money < sc || (p.surveyDay && S.day - p.surveyDay < 30) ? 'disabled' : ''}><b>Kullanıcı anketi yap</b><span>Kullanıcılar ne istiyor öğren. Bir sonraki büyük sürüm %10 daha etkili olur.</span><em>${tl(sc)}</em></button>
      <button class="dvopt main" data-act="bg" data-k="v2" data-id="${p.id}" ${p.v2 || (p.major || 0) >= 2 || S.money < mc ? 'disabled' : ''}><b>Sürüm ${v + 1}.0 geliştir</b><span>${(p.major || 0) >= 2 ? 'Bu ürün için büyük sürümler bitti.' : '12 gün sürer. Ürün yeniden canlanır: çok daha fazla kullanıcı ve daha uzun ömür.'}</span><em>${tl(mc)}</em></button>
    </div><button class="btn teal block" data-act="close" style="margin-top:8px">Kapat</button>`, 'pro');
}
function rmAct(k, id){
  const p = S.prods.find(x => x.id === id); if (!p) return;
  const uc = typeof updCost === 'function' ? updCost(p) : 50000;
  if (k === 'anket'){ const c = Math.max(8000, Math.round(uc*0.3)); if (S.money < c) return; S.money -= c; p.surveyDay = S.day;
    const pool = (typeof FEAT !== 'undefined' ? Object.values(FEAT).filter(f => f.t.includes(p.type)).map(f => f.ad) : ['Hız', 'Tasarım', 'Yeni özellikler']).sort(() => Math.random() - 0.5).slice(0, 4);
    let left = 100; p.survey = pool.map((t, i) => { const n = i === pool.length - 1 ? left : Math.max(5, Math.round(left*(0.35 + Math.random()*0.25))); left -= n; return [t, n]; }).sort((a, b) => b[1] - a[1]);
    p.surveyBonus = 0.1; snd('ok'); rmModal(id); return; }
  if (k === 'v2'){ const c = Math.round(uc*3); if (S.money < c || p.v2) return; S.money -= c; p.v2 = S.day + 12; closeModal(); toast(`${p.name} için sürüm ${rmVer(p) + 1}.0 geliştirmesi başladı. 12 gün sürecek.`); snd('ok'); }
}
function rmDay(){
  for (const p of S.prods){ if (!p.v2 || S.day < p.v2) continue;
    p.v2 = 0; p.major = (p.major || 0) + 1; const k = 0.35 + (p.surveyBonus || 0); p.surveyBonus = 0;
    p.peak = Math.round(p.peak*(1 + k)); p.age = Math.max(6, Math.round(p.age*0.5)); p.life = Math.round(p.life + 40); p.active = true;
    toast(`${p.name} sürüm ${p.major + 1}.0 yayında! Ürün yeniden yükselişte.`); snd('ok');
    if (typeof smEvent === 'function') smEvent('haber', {t:`${S.name}, ${p.name} ${p.major + 1}.0 sürümünü yayınladı. Kullanıcılar yeni tasarımı çok beğendi!`, ment:true, sent:1, tag:smTag(p.name + ' ' + (p.major + 1))});
  }
}

/* =============== 7) PATRONUN ÖZEL HAYATI =============== */
const BL_HOBI = {
  kosu:   {ad:'Koşu',        acik:'Sağlık her ay +6', fiyat:3000},
  gitar:  {ad:'Gitar',       acik:'Denge +8, ekip morali ayda +2', fiyat:12000},
  satranc:{ad:'Satranç',     acik:'Kararlarda keskinlik: ürün kalitesi +1', fiyat:5000},
  yemek:  {ad:'Yemek yapmak', acik:'Ayda bir ekibe ev yemeği: moral +4', fiyat:8000},
};
function blLife(){ return bgS().life; }
function blDenge(){ const L = blLife(), en = (S.cy && S.cy.en != null) ? S.cy.en : 70, ev = (S.cy && S.cy.ev) || 0;
  return Math.round(clamp(en*0.45 + L.saglik*0.25 + ev*4 + (L.hobi ? 10 : 0) + (L.aile === 'evli' ? 6 : 0) + (L.cocuk ? 4 : 0) - (L.ihmal || 0), 0, 100)); }
function blBossMult(){ const L = S && S.bg && S.bg.life; if (!L) return 1; if (L.hasta && S.day < L.hasta) return 0.3; return blDenge() >= 70 ? 1.05 : blDenge() < 30 ? 0.92 : 1; }
function blHTML(){
  const L = blLife(), d = blDenge();
  return `<div class="pxhead"><div><div class="npey">ÖZEL HAYAT</div><div class="pxsub">Patron da insan. İş ile özel hayat dengen bozulursa yorulur, hastalanır, daha yavaş çalışırsın. Dengen iyiyse daha hızlı ve keyifli çalışırsın.</div></div></div>
    <div class="blgrid">
      <div class="blcard"><small>İş · özel hayat dengesi</small><div class="blring" style="--p:${d};--c:${d >= 70 ? '#16a34a' : d >= 40 ? '#f59e0b' : '#dc2626'}"><b>${d}</b></div><em>${d >= 70 ? 'Harika: çalışma hızın +%5' : d >= 40 ? 'İdare eder' : 'Tehlikede: hızın −%8'}</em></div>
      <div class="blcard"><small>Sağlık</small><div class="blbar"><i style="width:${L.saglik}%;background:${L.saglik >= 60 ? '#16a34a' : L.saglik >= 30 ? '#f59e0b' : '#dc2626'}"></i></div><b>${Math.round(L.saglik)}/100</b>${L.hasta && S.day < L.hasta ? `<em class="red">Hastasın: ${L.hasta - S.day} gün dinlenmen lazım</em>` : ''}
        <button class="btn sm" data-act="bg" data-k="check" ${S.money < 5000 || (L.checkDay && S.day - L.checkDay < 60) ? 'disabled' : ''}>Sağlık kontrolü · ${tl(5000)}</button></div>
      <div class="blcard"><small>Aile</small><b>${L.aile === 'evli' ? 'Evli' : L.aile === 'iliski' ? 'Bir ilişkisi var' : 'Bekâr'}${L.cocuk ? ` · ${L.cocuk} çocuk` : ''}</b><em>${L.aile === 'iliski' ? 'Belki evlilik teklif etmenin zamanı gelmiştir.' : L.aile === 'evli' ? 'Ailenle vakit geçirmek dengeni korur.' : 'Hayat sürprizlerle dolu.'}</em>
        ${L.aile === 'iliski' ? `<button class="btn sm" data-act="bg" data-k="evlen" ${S.money < 150000 ? 'disabled' : ''}>Evlilik teklif et · ${tl(150000)}</button>` : ''}
        ${L.aile !== 'bekar' ? `<button class="btn sm" data-act="bg" data-k="aileVakit" ${L.aileDay && S.day - L.aileDay < 20 ? 'disabled' : ''}>Ailene bir gün ayır</button>` : ''}</div>
    </div>
    <div class="pxlbl">Hobiler</div><div class="odpick">${Object.entries(BL_HOBI).map(([k, H]) => `<button class="${L.hobi === k ? 'on' : ''}" data-act="bg" data-k="hobi" data-v="${k}" ${L.hobi === k || S.money < H.fiyat ? 'disabled' : ''}><b>${H.ad}</b><small>${H.acik}</small><small>${L.hobi === k ? 'Senin hobin' : tl(H.fiyat)}</small></button>`).join('')}</div>`;
}
function blMonth(){
  const L = blLife();
  const en = (S.cy && S.cy.en != null) ? S.cy.en : 70;
  L.saglik = clamp(L.saglik + (en < 30 ? -10 : en < 50 ? -4 : 2) + (L.hobi === 'kosu' ? 6 : 0), 0, 100);
  if (L.hobi === 'gitar' && typeof moodAll === 'function') moodAll(2, 'Patron ofiste gitar çaldı');
  if (L.hobi === 'yemek' && typeof moodAll === 'function') moodAll(4, 'Patronun ev yemeği');
  L.ihmal = Math.max(0, (L.ihmal || 0) - 3);
  if (L.saglik < 25 && !(L.hasta && S.day < L.hasta)){ L.hasta = S.day + 4; toast('Patron hastalandı! 4 gün boyunca çok yavaş çalışacaksın. Kendine iyi bak.'); snd('bad'); return; }
  if (!bgFree()) return;
  const r = Math.random();
  if (L.aile === 'bekar' && r < 0.25){ L.aile = 'iliski'; toast('Bir arkadaş buluşmasında çok hoş biriyle tanıştın. Artık bir ilişkin var! 💕'); return; }
  if (L.aile === 'evli' && !L.cocuk && r < 0.2){ L.cocuk = 1; moodAll && moodAll(6, 'Patronun bebeği oldu'); toast('Tebrikler! Bebeğiniz dünyaya geldi. Ekip ofiste kutlama yaptı. 🍼'); return; }
  if (r < 0.55){
    curChoices = [() => { L.ihmal = Math.max(0, (L.ihmal || 0) - 8); if (S.cy) S.cy.en = Math.min(100, (S.cy.en ?? 70) + 10); toast('Güzel bir akşam geçirdin, kafan dinlendi.'); }, () => { L.ihmal = (L.ihmal || 0) + 10; toast('İşte kaldın. Dengen biraz bozuldu.'); }];
    const ev = pick([['Annen arıyor', 'Bu akşam yemeğe gelir misin? Çok özledik seni.'], ['Eski arkadaşın evleniyor', 'Düğün bu cumartesi. Sen de gelmelisin!'], ['Doğum günün!', 'Arkadaşların sana sürpriz bir kutlama hazırlamış.']]);
    showModal('', `<div class="nphead"><div><div class="npey">ÖZEL HAYAT</div><h3>${ev[0]}</h3></div></div><p class="pxsub">${ev[1]}</p>
      <div class="grid2" style="gap:10px"><button class="pxghost" data-act="choice" data-i="1">İşim var, gidemem</button><button class="npgo" data-act="choice" data-i="0">Git, biraz nefes al</button></div>`, 'pro');
  }
}
function blAct(k, v){
  const L = blLife();
  if (k === 'hobi'){ const H = BL_HOBI[v]; if (!H || S.money < H.fiyat) return; S.money -= H.fiyat; L.hobi = v; toast(`Yeni hobin: ${H.ad}!`); snd('ok'); }
  else if (k === 'check'){ if (S.money < 5000) return; S.money -= 5000; L.checkDay = S.day; L.saglik = clamp(L.saglik + 15, 0, 100); toast('Sağlık kontrolü yaptırdın: sağlık +15'); }
  else if (k === 'evlen'){ if (S.money < 150000) return; S.money -= 150000; L.aile = 'evli'; S.rep += 1; if (typeof moodAll === 'function') moodAll(8, 'Patron evlendi'); toast('Teklifin kabul edildi! Düğünde bütün ekip oynadı. 💍'); snd('ok'); }
  else if (k === 'aileVakit'){ L.aileDay = S.day; L.ihmal = 0; if (S.cy) S.cy.en = Math.min(100, (S.cy.en ?? 70) + 15); toast('Ailenle harika bir gün geçirdin. Dengen yükseldi.'); }
}

/* =============== 8) SEZONLUK ETKİNLİKLER =============== */
const BG_SEZON = [
  {gun:44,  id:'sevgili',  ad:'Sevgililer Günü',     acik:'Sosyal ve eğlence uygulamalarına ilgi artıyor. Kampanya yaparsan 10 gün gelir +%25.', rev:1.25, gunS:10},
  {gun:155, id:'staj',     ad:'Yaz stajı dönemi',     acik:'Üniversiteliler staj arıyor. İki yetenekli aday ucuza ekibe katılabilir.', staj:true},
  {gun:245, id:'okul',     ad:'Okullar açılıyor',     acik:'Öğrenciler yeni uygulama arıyor. Kampanya yaparsan ürünlerin +%10 kullanıcı kazanır.', peak:0.1},
  {gun:325, id:'kara',     ad:'Büyük İndirim Haftası', acik:'Herkes indirim kovalıyor. İndirim yaparsan 7 gün gelir −%20 ama kullanıcılar +%20.', rev:0.8, gunS:7, peak:0.2},
  {gun:345, id:'yilbasi',  ad:'Yılbaşı kampanyası',   acik:'Yeni yıl hediyeleşmesi! Kampanya yaparsan 12 gün gelir +%30.', rev:1.3, gunS:12},
];
function szDay(){
  const d = S.day % 360, E = BG_SEZON.find(x => x.gun === d); if (!E || !bgFree() || !S.prods) return false;
  const c = Math.max(15000, Math.round((typeof prodIncome === 'function' ? prodIncome() : 10000)*3));
  if (E.staj){
    curChoices = [() => { for (let i = 0; i < 2; i++){ const x = genCand(); x.skill = clamp(x.skill + 1, 1, 10); x.salary = round10(x.salary*0.55); x.name += ' (Stajyer)'; S.cands.unshift(x); } toast('İki stajyer adayı Personel sayfasına eklendi (maaşları yarı yarıya).'); }, () => {}];
  } else curChoices = [() => { if (S.money < c) return; S.money -= c; bgS().camp = {id:E.id, until:S.day + (E.gunS || 1), rev:E.rev || 1}; if (E.peak) for (const p of S.prods) if (p.active) p.peak = Math.round(p.peak*(1 + E.peak)); toast(`${E.ad} kampanyası başladı!`); snd('ok');
      if (typeof smEvent === 'function') smEvent('haber', {t:`${S.name} ${E.ad.toLocaleLowerCase('tr-TR')} için büyük bir kampanya başlattı!`, ment:true, sent:1, tag:smTag(E.ad)}); }, () => {}];
  showModal('', `<div class="nphead"><div><div class="npey" style="color:#0d9488">SEZONLUK ETKİNLİK</div><h3>${E.ad}</h3></div></div><p class="pxsub">${E.acik}</p>
    <div class="grid2" style="gap:10px"><button class="pxghost" data-act="choice" data-i="1">Bu sefer katılma</button><button class="npgo" data-act="choice" data-i="0" ${!E.staj && S.money < c ? 'disabled' : ''}>${E.staj ? 'Adaylara bak' : `Kampanya yap · ${tl(c)}`}</button></div>`, 'pro');
  return true;
}

/* =============== 9) ŞUBELER =============== */
const BG_SUBE = [
  {id:'ankara',  ad:'Ankara',   x:330, y:170, yurt:1, fiyat:4e6,   rep:40,  gelir:12000,  gider:140000, pay:0.04, rev:0.02},
  {id:'izmir',   ad:'İzmir',    x:250, y:185, yurt:1, fiyat:3e6,   rep:30,  gelir:9000,   gider:110000, pay:0.03, rev:0.02},
  {id:'berlin',  ad:'Berlin',   x:250, y:70,  fiyat:2.5e7, rep:120, gelir:60000,  gider:700000, pay:0.06, rev:0.05},
  {id:'londra',  ad:'Londra',   x:175, y:62,  fiyat:4e7,   rep:180, gelir:90000,  gider:1.1e6,  pay:0.07, rev:0.06},
  {id:'dubai',   ad:'Dubai',    x:440, y:230, fiyat:3e7,   rep:150, gelir:80000,  gider:900000, pay:0.06, rev:0.05},
  {id:'newyork', ad:'New York', x:40,  y:110, fiyat:1.2e8, rep:300, gelir:250000, gider:3.2e6,  pay:0.1,  rev:0.08},
  {id:'tokyo',   ad:'Tokyo',    x:620, y:120, fiyat:1e8,   rep:280, gelir:220000, gider:2.8e6,  pay:0.09, rev:0.08},
];
const sbOpen = () => BG_SUBE.filter(b => S.bg && S.bg.sube[b.id]);
function bgPayMult(){ return S && S.bg ? 1 + sbOpen().reduce((a, b) => a + b.pay, 0) : 1; }
function sbHTML(){
  const open = sbOpen();
  const pins = BG_SUBE.map(b => { const on = !!S.bg.sube[b.id]; return `<g class="sbpin ${on ? 'on' : ''}" data-act="bg" data-k="sbsec" data-v="${b.id}"><circle cx="${b.x}" cy="${b.y}" r="${on ? 11 : 8}" fill="${on ? '#16a34a' : '#fff'}" stroke="${on ? '#fff' : '#1e3a8a'}" stroke-width="3"/><text x="${b.x}" y="${b.y - 15}" text-anchor="middle" font-size="13" font-weight="900" fill="#0f172a">${b.ad}</text></g>`; }).join('');
  const hq = '<g><rect x="300" y="182" width="22" height="22" rx="5" fill="#2563eb" stroke="#fff" stroke-width="3"/><text x="311" y="222" text-anchor="middle" font-size="12" font-weight="900" fill="#1e3a8a">Bytetown (merkez)</text></g>';
  const lines = open.map(b => `<path d="M311 193 Q${(311 + b.x)/2} ${Math.min(b.y, 193) - 50} ${b.x} ${b.y}" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 5"/>`).join('');
  const land = '<path d="M20 90 C60 40 120 60 140 100 S120 170 70 160 S0 130 20 90Z M150 40 C220 20 300 30 330 60 S300 120 240 110 S160 90 150 40Z M200 140 C260 130 380 140 400 170 S360 230 280 220 S190 180 200 140Z M410 180 C460 170 500 200 490 250 S420 270 410 230Z M520 60 C600 40 680 80 670 150 S580 190 540 160 S500 90 520 60Z" fill="#dbeafe" stroke="#93c5fd" stroke-width="2"/>';
  const sel = BG_SUBE.find(b => b.id === bgS().sbSel) || BG_SUBE[0], on = !!S.bg.sube[sel.id];
  return `<div class="pxhead"><div><div class="npey">ŞUBELER</div><div class="pxsub">Başka şehirlerde ve ülkelerde ofis aç. Her şube günlük gelir getirir, müşteri ödemelerini ve ürün gelirlerini artırır ama aylık gideri vardır.</div></div>
      <div class="pxstat"><span>Açık şube</span><b>${open.length}/${BG_SUBE.length}</b></div></div>
    <svg class="sbmap" viewBox="0 0 700 280"><rect width="700" height="280" rx="16" fill="#eff6ff"/>${land}${lines}${hq}${pins}</svg>
    <div class="sbsel"><div class="grow"><b>${sel.ad}${sel.yurt ? '' : ' · yurt dışı'}</b><small>Günlük gelir ${tl(sel.gelir)} · aylık gider ${tl(sel.gider)} · müşteri ödemeleri +%${Math.round(sel.pay*100)} · ürün geliri +%${Math.round(sel.rev*100)}</small></div>
      ${on ? `<span class="green"><b>Açık · ${S.bg.sube[sel.id]}. günden beri</b></span>` : `<button class="npgo" data-act="bg" data-k="sbac" data-v="${sel.id}" ${S.money < sel.fiyat || S.rep < sel.rep ? 'disabled' : ''}>${S.rep < sel.rep ? `${sel.rep} itibar gerekli` : `Şube aç · ${tl(sel.fiyat)}`}</button>`}</div>`;
}

/* =============== 10) İSTATİSTİK PANELİ =============== */
let stTab = 'para';
function stChart(vals, col, money){
  if (vals.length < 2) return '<div class="empty-msg">Grafik için birkaç gün daha oynamalısın.</div>';
  const W = 640, H = 200, lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo)*0.08 || Math.abs(hi)*0.05 || 1, mn = lo - pad, mx = hi + pad, r = mx - mn || 1;
  const pts = vals.map((v, i) => `${(30 + i*(W - 40)/(vals.length - 1)).toFixed(1)},${(H - 24 - (v - mn)/r*(H - 44)).toFixed(1)}`).join(' ');
  const f = v => money ? tl(v) : fmt(Math.round(v));
  return `<svg class="stchart" viewBox="0 0 ${W} ${H}"><line x1="30" y1="${H - 24}" x2="${W - 10}" y2="${H - 24}" stroke="#cbd5e1"/><line x1="30" y1="20" x2="${W - 10}" y2="20" stroke="#eef2f7"/>
    <polygon points="30,${H - 24} ${pts} ${W - 10},${H - 24}" fill="${col}" opacity=".12"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>
    <text x="34" y="16" font-size="12" fill="#64748b" font-weight="800">${f(mx)}</text><text x="34" y="${H - 8}" font-size="12" fill="#64748b" font-weight="800">${f(mn)}</text><text x="${W - 12}" y="${H - 8}" font-size="12" fill="#64748b" text-anchor="end" font-weight="800">bugün</text></svg>`;
}
function stHTML(){
  const h = bgS().hist.slice(-120), T = {para:['Kasa', 'm', '#2563eb', 1], gelir:['Günlük gelir', 'inc', '#16a34a', 1], kul:['Toplam kullanıcı', 'u', '#9333ea', 0], itibar:['İtibar', 'r', '#d97706', 0], ekip:['Ekip', 'e', '#0d9488', 0]}, C = T[stTab];
  const prods = S.prods.slice().sort((a, b) => b.earned - a.earned).slice(0, 6), maxE = Math.max(1, ...prods.map(p => p.earned));
  const team = S.emps.slice().sort((a, b) => b.skill - a.skill).slice(0, 8);
  return `<div class="pxhead"><div><div class="npey">İSTATİSTİKLER</div><div class="pxsub">Son 120 günün grafikleri, en çok kazandıran ürünlerin ve ekibinin durumu.</div></div></div>
    <div class="grid4" style="margin-bottom:10px"><div class="kv"><b>${tl(S.stats.earned)}</b><span>Toplam kazanç</span></div><div class="kv"><b>${S.stats.done}</b><span>Müşteri işi</span></div><div class="kv"><b>${S.stats.prodsDone}</b><span>Yayınlanan ürün</span></div><div class="kv"><b>${tl(valuation())}</b><span>Şirket değeri</span></div></div>
    <div class="batabs">${Object.entries(T).map(([k, t]) => `<button class="${stTab === k ? 'on' : ''}" data-act="bg" data-k="sttab" data-v="${k}">${t[0]}</button>`).join('')}</div>
    <div class="stbox">${stChart(h.map(x => x[C[1]] || 0), C[2], C[3])}</div>
    <div class="grid2" style="gap:10px;margin-top:10px">
      <div class="stbox"><b>En çok kazandıran ürünler</b>${prods.length ? prods.map(p => `<div class="strow"><span>${esc(p.name)}</span><i><b style="width:${Math.round(p.earned/maxE*100)}%"></b></i><em>${tl(p.earned)}</em></div>`).join('') : '<p class="sub">Henüz ürün yok.</p>'}</div>
      <div class="stbox"><b>Ekip performansı</b>${team.length ? team.map(e => `<div class="strow"><span>${esc(firstName(e))}${typeof kaTitle === 'function' ? ` <small>${kaTitle(e)}</small>` : ''}</span><i><b style="width:${e.skill*10}%;background:#0d9488"></b></i><em>${e.skill}/10 · moral ${Math.round(e.mood ?? 70)}</em></div>`).join('') : '<p class="sub">Henüz çalışan yok.</p>'}</div>
    </div>`;
}

/* =============== ORTAK: her gün, düğmeler, sayfalar =============== */
function bgRevMult(pr){
  let m = 1;
  if (pr.bgHit && S.day < pr.bgHit.until) m *= pr.bgHit.m;
  const c = S.bg && S.bg.camp; if (c && S.day < c.until) m *= c.rev;
  if (S.bg) m *= 1 + sbOpen().reduce((a, b) => a + b.rev, 0);
  return m;
}
function bgDay(){
  if (!S) return;
  const s = bgS();
  // istatistik kaydı
  const users = S.prods.filter(p => p.active).reduce((a, p) => a + p.users, 0);
  s.hist.push({d:S.day, m:Math.round(S.money), inc:Math.round(S.lastDayInc || 0), u:users, r:S.rep, e:S.emps.length}); if (s.hist.length > 360) s.hist.shift();
  // ofis tasarımı morali
  const mor = odSum('mor'); if (mor) for (const e of S.emps) e.mood = clamp((e.mood ?? 70) + mor*0.4, 5, 100);
  // şubeler
  const op = sbOpen(); if (op.length){ const g = op.reduce((a, b) => a + b.gelir, 0); S.money += g; S.stats.earned += g; if (S.day % 30 === 0){ const gd = op.reduce((a, b) => a + b.gider, 0); S.money -= gd; toast(`Şube giderleri ödendi: ${tl(gd)}`); } }
  rmDay();
  if (S.day % 30 === 3) blMonth();
  if (szDay()) return;
  if (S.day % 30 === 21 && S.day > 90 && Math.random() < 0.45 && bgFree() && rvMove()) return;
  if (bgFree()) erDay();
}
function bgAct(el){
  const k = el.dataset.k, v = el.dataset.v, id = +el.dataset.id;
  if (k === 'fon'){ bgPitchStart(v); return; }
  if (k === 'inv'){ bgPitch.inv = v; bgPitchQ(); return; }
  if (k === 'cevap'){ bgPitchAnswer(v); return; }
  if (['kabul', 'red', 'pazarlik'].includes(k)){ bgFonAct(k); return; }
  if (k === 'zone'){ odSel = +v; }
  else if (k === 'odset'){ if (odSel == null || S.money < odCost()) return; S.money -= odCost(); bgS().od[odSel] = v; toast(`${odSel + 1}. alan artık ${OD_TYPES[v].ad}.`); snd('ok'); }
  else if (k === 'yol'){ rmModal(id); return; }
  else if (k === 'anket' || k === 'v2'){ rmAct(k, id); return; }
  else if (['hobi', 'check', 'evlen', 'aileVakit'].includes(k)) blAct(k, v);
  else if (k === 'sbsec'){ bgS().sbSel = v; }
  else if (k === 'sbac'){ const b = BG_SUBE.find(x => x.id === v); if (!b || S.money < b.fiyat || S.rep < b.rep || S.bg.sube[b.id]) return; S.money -= b.fiyat; S.bg.sube[b.id] = S.day; S.rep += b.yurt ? 2 : 5; toast(`${b.ad} şubesi açıldı!`); snd('cash'); if (typeof smEvent === 'function') smEvent('haber', {t:`${S.name} yeni şubesini açtı: ${b.ad}. Şirket büyümeye devam ediyor!`, ment:true, sent:1, tag:smTag(S.name + ' ' + b.ad)}); }
  else if (k === 'sttab'){ stTab = v; }
  renderPage(true);
}
function bgHubHTML(){
  const B = (v, t, s) => `<button class="bghub" data-act="page" data-v="${v}"><b>${t}</b><small>${s}</small></button>`;
  return `<div class="bghubs">${B('tasarim', 'Ofis tasarımı', 'Alanları düzenle')}${B('sube', 'Şubeler', `${sbOpen().length} şube açık`)}${B('fon', 'Yatırımcılar', 'Fon turları')}${B('istatistik', 'İstatistikler', 'Grafikler')}${B('ozel', 'Özel hayat', `Denge ${blDenge()}`)}</div>`;
}
function bgTilesHTML(){
  const T = (v, t, ic) => `<button class="pcm-t" data-act="page" data-v="${v}"><span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic}</svg></span><span>${t}</span></button>`;
  return T('istatistik', 'İstatistik', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>') + T('tasarim', 'Ofis tasarımı', '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h9M12 3v18"/>') + T('sube', 'Şubeler', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>') + T('fon', 'Yatırımcılar', '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>');
}
function blBtnHTML(){ return `<button class="btn block pcbtn" data-act="page" data-v="ozel"><b>Özel hayat · denge ${blDenge()}</b><small>Sağlık, aile ve hobiler</small></button>`; }
if (typeof PAGES !== 'undefined'){
  Object.assign(PAGES, {
    fon:{t:'Yatırımcılar', html:() => bgFonHTML(), stat:true},
    tasarim:{t:'Ofis tasarımı', html:() => odHTML(), stat:true},
    sube:{t:'Şubeler', html:() => sbHTML(), stat:true},
    istatistik:{t:'İstatistikler', html:() => stHTML(), stat:true},
    ozel:{t:'Özel hayat', html:() => blHTML(), stat:true},
  });
  if (PAGES.ofis && !PAGES.ofis._bg){ const _o = PAGES.ofis.html; PAGES.ofis.html = () => bgHubHTML() + _o(); PAGES.ofis._bg = true; }
}
if (typeof cyBossMult === 'function'){ const _cbm = cyBossMult; cyBossMult = function(){ return _cbm() * blBossMult(); }; }
if (typeof ACTIONS !== 'undefined') ACTIONS.bg = el => bgAct(el);
function bgForce(k){
  bgS();
  if (k === 'kavga'){ if (S.emps.length < 2) return; const a = S.emps[0], b = S.emps[1], r = bgS().rel[erKey(a.id, b.id)] || (bgS().rel[erKey(a.id, b.id)] = {v:0}); r.v = -10; erDay('kavga'); return; }
  if (k === 'fiyat' || k === 'kopya'){ rvMove(k); return; }
  if (k === 'yol'){ const p = S.prods.find(x => x.active); if (p) rmModal(p.id); return; }
  if (k === 'sezon'){ const d = S.day; S.day = Math.floor(S.day/360)*360 + 345; szDay(); S.day = d; return; }
  if (k === 'fon'){ openPage('fon'); return; }
  if (k === 'pitch'){ bgPitchStart('tohum'); return; }
  if (['tasarim', 'sube', 'istatistik', 'ozel'].includes(k)){ openPage(k); return; }
  if (k === 'aile'){ const old = Math.random; Math.random = () => 0.4; try { blLife().aile = 'iliski'; blMonth(); } finally { Math.random = old; } return; }
}
