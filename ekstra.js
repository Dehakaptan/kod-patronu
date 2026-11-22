/* =====================================================================
   Bytetown – EKSTRALAR: mülakat, ofis kedisi ve şirket kültürü, bayramlar
   ve özel günler, rakip ürün savaşı, kullanıcı istekleri ve sürümler,
   halka arz, hackathon, başarımlar, Karanlık Ağ.
   Ana betikle ad çakışmasın diye yardımcılar ex / EX_ önekiyle adlandırıldı.
   ===================================================================== */
const exS = () => (S.ex = S.ex || {});
const exR = n => Math.floor(Math.random()*n);
const exFree = () => typeof hkFree === 'function' ? hkFree() : (!page && $('modal').classList.contains('hidden'));

/* ---------------- 1) MÜLAKAT ---------------- */
const EX_Q = [
  {id:'ayrilik', q:'Önceki işinden neden ayrıldın?', a:c => c.liar ? '"Şey... orada pek anlaşamadık. Hem çok yoruluyordum, sabahları erken kalkmak da bana göre değil."' : pick(['"Daha çok gelişebileceğim bir yer arıyorum."', '"Ekip küçülünce yeni bir maceraya atılmak istedim."', '"Kendi fikirlerimi hayata geçirebileceğim bir yer arıyorum."'])},
  {id:'proje', q:'En zorlandığın projeyi anlatır mısın?', a:c => c.skill >= 7 ? '"Milyonlarca kullanıcısı olan bir uygulamanın altyapısını sıfırdan kurduk. Gece gündüz çalıştık ama çok şey öğrendim."' : c.skill >= 4 ? '"Bir mağaza sitesinin ödeme sayfasını yaptım. Hatalarla epey uğraştım ama bitirdim."' : '"Açıkçası çok büyük bir projede çalışmadım, daha çok okuldaki ödevler..."'},
  {id:'sure', q:'Bizimle ne kadar çalışmayı düşünürsün?', a:c => c.loy > 0.66 ? '"Uzun yıllar! Burada büyümek, ileride ekip lideri olmak istiyorum."' : c.loy > 0.33 ? '"İşler iyi giderse uzun süre kalırım."' : '"Bakarız... Daha iyi bir teklif gelirse düşünürüm tabii."'},
  {id:'zayif', q:'En büyük zayıf yönün ne?', a:c => c.liar ? '"Zayıf yönüm mü? Hiç yok aslında, ben mükemmeliyetçiyim."' : pick(['"Bazen işe fazla dalıp molayı unutuyorum."', '"Sunum yapmakta biraz zorlanıyorum ama çalışıyorum."', '"Hayır demekte zorlanıyorum, her işi üstüme alıyorum."'])},
  {id:'mesai', q:'Proje teslimine yetişmek için hafta sonu çalışır mısın?', a:c => c.loy > 0.5 ? '"Gerekirse tabii, ekibimi yalnız bırakmam."' : c.liar ? '"Tabii tabii... Ama o hafta sonu düğünüm var. Bir de cenaze... Bakarız."' : '"Arada bir olur ama sürekli olmasın lütfen."'},
];
function exInterview(id){
  const c = S.cands.find(x => x.id === id); if (!c) return;
  if (c.liar == null) c.liar = Math.random() < 0.15;
  if (c.loy == null) c.loy = Math.random();
  c.asked = c.asked || [];
  const left = 3 - c.asked.length, hc = round10(c.salary*0.5);
  const asked = c.asked.map(q => { const Q = EX_Q.find(x => x.id === q); return `<div class="exqa"><b>Sen: ${Q.q}</b><p>${Q.a(c)}</p></div>`; }).join('');
  const qs = EX_Q.filter(q => !c.asked.includes(q.id)).map(q => `<button class="act" data-act="exq" data-id="${c.id}" data-v="${q.id}" ${left <= 0 ? 'disabled' : ''}><b>${q.q}</b></button>`).join('');
  curChoices = [];
  showModal('', `<div class="ehead"><span class="hkav">${avatarSVG(c.id, c.role, c.emo)}</span><div class="grow"><div class="npey">İŞ GÖRÜŞMESİ</div><h3>${esc(c.name)}</h3><div class="pxmeta">${ROLES[c.role].ad} · yetenek ${c.skill}/10 · ${tl(c.salary)}/ay istiyor</div></div><button class="npx" data-act="close" aria-label="Kapat">✕</button></div>
    ${asked || '<p class="sub" style="margin:6px 0">Adayı tanımak için en fazla 3 soru sorabilirsin. Cevaplardan dürüst olup olmadığını ve ne kadar sadık kalacağını sezebilirsin.</p>'}
    ${left > 0 ? `<div class="pxlbl">Soru sor (${left} hakkın kaldı)</div><div class="exqs">${qs}</div>` : ''}
    <div class="grid2" style="gap:8px;margin-top:10px"><button class="pxghost" data-act="close">Vazgeç</button><button class="npgo" data-act="hire-go" data-id="${c.id}" ${S.money < hc ? 'disabled' : ''}>İşe al · ${tl(hc)}</button></div>`, 'pro');
}
function exAsk(id, q){ const c = S.cands.find(x => x.id === id); if (!c || (c.asked||[]).length >= 3 || c.asked.includes(q)) return; c.asked.push(q); snd('click'); exInterview(id); }

/* ---------------- 2) OFİS KEDİSİ VE ŞİRKET KÜLTÜRÜ ---------------- */
const EX_CULT = [
  {id:'kiyafet', ad:'Serbest kıyafet', acik:'Herkes rahat giyinir · moral her gün biraz artar', mood:0.25, sp:1},
  {id:'evden', ad:'Haftada bir gün evden çalışma', acik:'Moral artar · ekip %5 yavaşlar', mood:0.4, sp:0.95},
  {id:'esnek', ad:'Esnek çalışma saatleri', acik:'Moral artar · ekip %3 yavaşlar', mood:0.3, sp:0.97},
  {id:'yemek', ad:'Ücretsiz öğle yemeği', acik:'Moral çok artar · her ay maaşların %5\'i kadar maliyet', mood:0.5, sp:1, cost:0.05},
  {id:'hayvan', ad:'Evcil hayvan serbest', acik:'Çalışanlar hayvanlarını getirebilir · moral artar', mood:0.25, sp:1},
];
const exCult = k => !!(exS().cult || {})[k];
function exSpeed(){ let m = 1; for (const c of EX_CULT) if (exCult(c.id)) m *= c.sp; return m; }
function exCultureHTML(){
  const s = exS(), cat = s.cat;
  return `<div class="pxpanel excult" style="margin-bottom:12px"><div class="npey">ŞİRKET KÜLTÜRÜ</div>
    <p class="pxsub" style="margin:2px 0 8px">Kurallar ekibin moralini, hızını ve adayların şirkete bakışını etkiler.</p>
    <div class="excgrid">${EX_CULT.map(c => `<button class="excopt ${exCult(c.id) ? 'on' : ''}" data-act="excult" data-v="${c.id}"><span class="exsw"><i></i></span><b>${c.ad}</b><small>${c.acik}</small></button>`).join('')}</div>
    <div class="excat">${cat ? `<b>Ofis kedisi: ${esc(cat.ad)}</b><small>${S.day - cat.d} gündür ofiste · herkesin morali her gün biraz artıyor</small>` : `<b>Ofis kedisi</b><small>Barınaktan bir kedi sahiplen; ofiste dolaşır, herkesi mutlu eder.</small><button class="btn sm" data-act="excat">Kedi sahiplen · ${tl(5000)}</button>`}</div></div>`;
}
const EX_CATS = ['Bit', 'Piksel', 'Tırmık', 'Pamuk', 'Boncuk', 'Fındık', 'Duman', 'Çakıl'];

/* ---------------- 3) BAYRAMLAR VE ÖZEL GÜNLER ---------------- */
const EX_HOL = [
  {id:'ramazan', m:3, d:10, ad:'Ramazan Bayramı'},
  {id:'kurban', m:5, d:18, ad:'Kurban Bayramı'},
  {id:'yilbasi', m:11, d:28, ad:'Yılbaşı'},
];
function exHolidayDay(force){
  const s = exS(), y = Math.floor((S.day-1)/360), mi = monthIdx(), dm = ((S.day-1) % 30) + 1;
  s.hol = s.hol || {};
  for (const H of EX_HOL){
    const key = y + ':' + H.id; if (s.hol[key] && force !== H.id) continue;
    if (force === H.id || (!force && mi === H.m && dm >= H.d && dm <= H.d + 5)){
      if (!force && (!exFree() || !S.emps.length)) return;
      s.hol[key] = true;
      const sal = salaries(), n = S.emps.length;
      if (H.id === 'yilbasi'){
        curChoices = [
          () => { S.money -= round10(sal*0.3); moodAll(12); toast('Yılbaşı partisi harikaydı! Ekip yeni yıla mutlu girdi.'); snd('cash'); },
          () => { S.money -= round10(sal*0.08); moodAll(5); toast('Ofiste küçük bir kutlama yapıldı.'); },
          () => { moodAll(-5); toast('Bu yıl kutlama yapılmadı. Ekip biraz bozuldu.'); },
        ];
        showModal('', `<div class="exhol"><div class="npey">YENİ YIL</div><h3>Yılbaşı geldi!</h3><p class="sub">Ekip yılın son gününde nasıl bir kutlama yapacağını merak ediyor.</p></div>
          <div class="cezagrid"><button class="act" data-act="choice" data-i="0" ${S.money < sal*0.3 ? 'disabled' : ''}><b>Büyük parti</b><small>${tl(round10(sal*0.3))} · moral +12</small></button>
          <button class="act" data-act="choice" data-i="1"><b>Ofiste küçük kutlama</b><small>${tl(round10(sal*0.08))} · moral +5</small></button>
          <button class="act" data-act="choice" data-i="2"><b>Kutlama yok</b><small>Moral −5</small></button></div>`, 'pro');
      } else {
        curChoices = [
          () => { S.money -= round10(sal*0.5); moodAll(14); toast(`${H.ad} ikramiyesi dağıtıldı. Ekip çok mutlu!`); snd('cash'); },
          () => { S.money -= round10(sal*0.25); moodAll(6); toast(`${H.ad} için yarım ikramiye verildi.`); },
          () => { let k = 0; for (const e of S.emps) if (!isAway(e)){ e.task = {type:'izin', until:S.day + 3, grp:15}; k++; } sceneKey = ''; toast(`${k} çalışan 3 günlük bayram tatiline çıktı.`); },
          () => { moodAll(-10); toast('Bayramda ikramiye verilmedi. Ekip çok kırıldı.'); snd('bad'); },
        ];
        showModal('', `<div class="exhol"><div class="npey">ÖZEL GÜN</div><h3>${H.ad} geldi!</h3><p class="sub">${n} çalışanın bayram ikramiyesi bekliyor.</p></div>
          <div class="cezagrid"><button class="act" data-act="choice" data-i="0" ${S.money < sal*0.5 ? 'disabled' : ''}><b>Yarım maaş ikramiye</b><small>${tl(round10(sal*0.5))} · moral +14</small></button>
          <button class="act" data-act="choice" data-i="1"><b>Çeyrek maaş ikramiye</b><small>${tl(round10(sal*0.25))} · moral +6</small></button>
          <button class="act" data-act="choice" data-i="2"><b>3 gün bayram tatili</b><small>Para yok · ekip 3 gün yok</small></button>
          <button class="act" data-act="choice" data-i="3"><b>İkramiye yok</b><small>Moral −10</small></button></div>`, 'pro');
      }
      snd('event'); return;
    }
  }
}
function exLifeDay(){
  const s = exS();
  if (s.nextLife == null) s.nextLife = S.day + 45;
  if (S.day < s.nextLife || S.emps.length < 2 || !exFree()) return;
  s.nextLife = S.day + 60 + exR(50);
  const e = pick(S.emps.filter(x => !isAway(x))); if (!e) return;
  const n = firstName(e);
  if (Math.random() < 0.5){
    const gift = round10(Math.max(3000, e.salary*0.3));
    curChoices = [
      () => { S.money -= gift; e.loyal = true; moodOne(e, 18); moodAll(3); toast(`Düğüne gittin ve ${n} çok duygulandı. Artık şirkete çok sadık!`); },
      () => { S.money -= round10(gift*0.4); moodOne(e, 8); toast(`${n} hediyene çok sevindi.`); },
      () => { moodOne(e, -8); toast(`${n} düğününe gelmediğine biraz kırıldı.`); },
    ];
    showModal('', `<div class="exhol"><div class="npey">DAVETİYE</div><h3>${esc(e.name)} evleniyor!</h3><p class="sub">"Patron, cumartesi düğünüm var. Gelirsen çok mutlu olurum!"</p></div>
      <div class="cezagrid"><button class="act" data-act="choice" data-i="0" ${S.money < gift ? 'disabled' : ''}><b>Düğüne git, altın tak</b><small>${tl(gift)} · çok sadık olur</small></button>
      <button class="act" data-act="choice" data-i="1"><b>Hediye gönder</b><small>${tl(round10(gift*0.4))} · moral +8</small></button>
      <button class="act" data-act="choice" data-i="2"><b>Gidemem</b><small>Moral −8</small></button></div>`, 'pro');
  } else {
    curChoices = [
      () => { e.task = {type:'izin', until:S.day + 14}; sceneKey = ''; e.loyal = true; moodOne(e, 20); moodAll(4); toast(`${n} 2 haftalık ücretli doğum iznine çıktı. Sana minnettar!`); },
      () => { e.task = {type:'izin', until:S.day + 7}; sceneKey = ''; moodOne(e, 10); toast(`${n} 1 haftalık izne çıktı.`); },
      () => { moodOne(e, -15); moodAll(-4); toast(`${n} izin alamadığı için çok üzüldü. Ekip de bunu konuşuyor.`); snd('bad'); },
    ];
    showModal('', `<div class="exhol"><div class="npey">MÜJDE</div><h3>${esc(e.name)} anne/baba oldu!</h3><p class="sub">"Patron, bebeğimiz dünyaya geldi! Biraz izin alabilir miyim?"</p></div>
      <div class="cezagrid"><button class="act" data-act="choice" data-i="0"><b>2 hafta ücretli izin</b><small>Çok sadık olur · moral +20</small></button>
      <button class="act" data-act="choice" data-i="1"><b>1 hafta izin</b><small>Moral +10</small></button>
      <button class="act" data-act="choice" data-i="2"><b>İzin veremem</b><small>Moral −15</small></button></div>`, 'pro');
  }
  snd('event');
}

/* ---------------- 4) RAKİP ÜRÜN SAVAŞI ---------------- */
function exWarDay(){
  const s = exS();
  if (s.nextWar == null) s.nextWar = S.day + 40;
  if (S.day < s.nextWar || !exFree()) return;
  const act = S.prods.filter(p => p.active && p.users > 200 && p.topic);
  if (!act.length){ s.nextWar = S.day + 15; return; }
  s.nextWar = S.day + 45 + exR(30);
  const p = pick(act), R = pick(RIVALS), rn = (TOPICS[p.topic] ? pick(TOPICS[p.topic].w) : 'Süper') + ' ' + pick(['Pro','Plus','X','Max','Go']);
  const ac = adCost(p), uc = round10(updCost(p)*0.6);
  curChoices = [
    () => { S.money -= ac; p.ad = true; toast(`${esc(p.name)} için reklam kampanyası başladı; kullanıcılar sende kaldı.`); },
    () => { S.money -= uc; p.q = Math.min(100, p.q + 3); p.peak = Math.round(p.peak*1.05); toast(`Hızlı güncelleme çıktı: ${esc(p.name)} rakibinden daha iyi!`); snd('ok'); },
    () => { p.pcut = S.day + 30; toast(`Fiyatı düşürdün: 30 gün daha az gelir ama kullanıcılar kaçmıyor.`); },
    () => { p.peak = Math.round(p.peak*0.75); toast(`Rakip ${rn} kullanıcılarının bir kısmını çaldı.`); snd('bad'); },
  ];
  showModal('', `<div class="npey" style="color:#c2410c">RAKİP SALDIRIYOR</div><h3>${R.n}, ${esc(p.name)} ürününe rakip çıkardı!</h3>
    <p class="sub" style="text-align:center">Yeni ürünün adı <b>${rn}</b>. Kullanıcılarının dörtte biri oraya kayabilir. Ne yapacaksın?</p>
    <div class="cezagrid"><button class="act" data-act="choice" data-i="0" ${p.ad || S.money < ac ? 'disabled' : ''}><b>Reklam kampanyası</b><small>${p.ad ? 'Reklam zaten açık' : tl(ac)}</small></button>
    <button class="act" data-act="choice" data-i="1" ${S.money < uc ? 'disabled' : ''}><b>Hızlı güncelleme</b><small>${tl(uc)} · kalite +3</small></button>
    <button class="act" data-act="choice" data-i="2"><b>Fiyatı düşür</b><small>30 gün %20 daha az gelir</small></button>
    <button class="act" data-act="choice" data-i="3"><b>Görmezden gel</b><small>Kullanıcıların %25'i gider</small></button></div>`, 'pro');
  snd('event');
}

/* ---------------- 5) KULLANICI İSTEKLERİ VE SÜRÜMLER ---------------- */
const EX_REQ = ['Karanlık mod gelsin lütfen!', 'Arkadaşlarımla paylaşma özelliği olsun.', 'Bildirimleri kapatabilmek istiyorum.', 'Daha fazla dil desteği!', 'Tablet sürümü ne zaman?', 'Yükleme süresi çok uzun, hızlandırın.', 'Kaydetme özelliği eklensin.', 'Daha büyük yazı seçeneği olsun.', 'Çevrimdışı da çalışsın.', 'Yeni seviyeler/içerik ekleyin!'];
function exReqDay(){
  const s = exS();
  if (s.nextReq == null) s.nextReq = S.day + 12;
  if (S.day < s.nextReq) return;
  s.nextReq = S.day + 12 + exR(10);
  const act = S.prods.filter(p => p.active && (p.reqs||[]).length < 4); if (!act.length) return;
  const p = pick(act), r = pick(EX_REQ.filter(x => !(p.reqs||[]).includes(x)));
  (p.reqs = p.reqs || []).push(r);
  toast(`${esc(p.name)} kullanıcıları yeni bir özellik istiyor: “${r}” Güncellemeyle ekleyebilirsin.`);
}
const exVer = p => 'v1.' + (p.upd||0);
function exProdTag(p){ return ` · <b>${exVer(p)}</b>${(p.reqs||[]).length ? ` · <span class="exreq">${p.reqs.length} kullanıcı isteği</span>` : ''}`; }
function exReqHTML(p){ return (p.reqs||[]).length ? `<div class="exreqs"><b>Kullanıcı istekleri</b>${p.reqs.map(r => `<p>“${r}”</p>`).join('')}<small>Sonraki güncellemede bu istekler eklenir; her istek kullanıcı sayısını artırır.</small></div>` : ''; }
function exUpdated(p){
  const n = (p.reqs||[]).length;
  if (n){ p.peak = Math.round(p.peak*(1 + 0.05*n)); toast(`${esc(p.name)} ${exVer(p)} çıktı: ${n} kullanıcı isteği eklendi! Kullanıcılar çok memnun.`);
    if (p.comments) p.comments.unshift({h:'@' + pick(['mutlukullanici','takipci','fan']) + (10 + exR(89)), s:5, t:'İstediğimiz özellikleri eklemişler, teşekkürler!', l:60 + exR(40)}); }
  p.reqs = [];
}

/* ---------------- 6) HALKA ARZ ---------------- */
const EX_SHARES = 1e8;
function exIpoHTML(){
  const s = exS();
  if (!s.ipo){
    const ok = true, small = valuation() < 50e6;
    return `<div class="card exipo"><b>Halka arz</b><div class="sub">${ok ? 'Şirketinin yeterince büyüdüğünü hissettiğinde hisselerinin bir kısmını satıp Bytetown Borsası\'na açılabilirsin. Ne zaman ve ne kadar satacağına sen karar verirsin; hiç açılmamak da senin seçimin.' + (small ? ' Şirket değerin henüz düşük, şimdi açılırsan az para toplarsın.' : '') : ''}</div>
      ${ok ? `<button class="btn sm gold" data-act="exipo" style="margin-top:6px">Halka arz seçeneklerini gör</button>` : ''}</div>`;
  }
  const h = s.ipo.hist, pr = h[h.length-1], prev = h[Math.max(0, h.length-2)], ch = (pr/prev - 1)*100;
  const mn = Math.min(...h), mx = Math.max(...h), W = 260, H = 50;
  const pts = h.map((v, i) => `${(i/(Math.max(1, h.length-1))*W).toFixed(1)},${(H - (mx > mn ? (v - mn)/(mx - mn) : 0.5)*H).toFixed(1)}`).join(' ');
  return `<div class="card exipo"><b>Bytetown Borsası · ${esc(S.name).toUpperCase().slice(0, 4)}</b>
    <div class="exprice"><span>₺${pr.toFixed(2).replace('.', ',')}</span><i class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '+' : ''}${ch.toFixed(1).replace('.', ',')}%</i></div>
    <svg viewBox="0 0 ${W} ${H}" class="exspark"><polyline points="${pts}" fill="none" stroke="${ch >= 0 ? '#16a34a' : '#dc2626'}" stroke-width="2"/></svg>
    <div class="sub">${s.ipo.day}. günden beri halka açık · hisse fiyatı şirket değerine göre her gün değişir</div></div>`;
}
// halka arz kararı oyuncunun: ne kadar hisse satılacağını seçer ya da vazgeçer
const EX_IPO = [10, 20, 30];
const exIpoAmt = pct => round10(valuation()*pct/100*1.1);
function exIpoMenu(force){
  const s = exS(); if (s.ipo) return;
  s._ipoF = !!force; syncOwnership();
  curChoices = [];
  showModal('', `<div class="npey">HALKA ARZ</div><h3 style="margin:2px 0 4px">Bytetown Borsası'na açılmak ister misin?</h3>
    ${valuation() < 50e6 ? '<p class="hkwarn" style="margin:0 0 8px">Erken halka arz: şirket değerin henüz düşük (' + tl(valuation()) + '). Şimdi açılırsan az para toplarsın; büyüyünce açılmak daha kârlı olabilir.</p>' : ''}<p class="sub" style="margin:0 0 10px">Hisselerinin bir kısmını satarsın: kasana para girer, itibarın artar. Ama satılan hisse oranında ürün gelirlerin hissedarlara gider ve yönetim kurulu her çeyrek senden hedef ister. Şu an şirketteki payın %${S.ownership}.</p>
    <div class="cezagrid">${EX_IPO.map(p => { const left = S.ownership - p, ok = left >= 30;
      return `<button class="act" data-act="exipo" data-v="${p}" ${ok ? '' : 'disabled'}><b>%${p} hisse sat</b><small>Kasana +${tl(exIpoAmt(p))} · payın %${left} kalır${ok ? '' : ' (en az %30 kalmalı)'}</small></button>`; }).join('')}
      <button class="act" data-act="close"><b>Şimdilik açılmayalım</b><small>Şirket tamamen senin kalır</small></button></div>`, 'pro');
}
function exIpo(pct){
  const s = exS(), force = s._ipoF; s._ipoF = false;
  pct = EX_IPO.includes(pct) ? pct : 20;
  if (s.ipo) return;
  syncOwnership(); if (S.ownership - pct < 30){ toast('Bu kadar hisse satamazsın: şirkette en az %30 payın kalmalı.'); snd('bad'); return; }
  const amt = exIpoAmt(pct);
  closeModal();
  holdersOf().push({id:S.idSeq++, ad:'Halka açık hisseler', renk:'#64748b', pct, paid:amt, day:S.day}); syncOwnership();
  S.money += amt; S.stats.earned += amt; S.rep += 10;
  const p0 = valuation()/EX_SHARES; s.ipo = {day:S.day, hist:[p0]};
  toast(`Gong çaldı! ${esc(S.name)} halka açıldı. Kasana ${tl(amt)} girdi, +10 itibar.`); snd('cash');
  renderPage(true);
}
function exIpoDay(){
  const s = exS(); if (!s.ipo) return;
  const h = s.ipo.hist, base = valuation()/EX_SHARES, last = h[h.length-1];
  const next = Math.max(0.01, last*0.65 + base*0.35*(0.9 + Math.random()*0.2) + last*0.35*(Math.random()*0.06 - 0.03));
  h.push(next); if (h.length > 60) h.shift();
}

/* ---------------- 7) HACKATHON ---------------- */
function exHackHTML(){
  const s = exS(), n = S.emps.filter(e => !isAway(e)).length, wait = Math.max(0, (s.hackD||-99) + 45 - S.day), c = teamCost(0.08);
  const why = n < 2 ? 'En az 2 çalışan gerekli' : wait ? `${wait} gün sonra tekrar` : `${tl(c)} · 48 saatlik kodlama maratonu`;
  return `<button class="btn block hackbtn" data-act="exhack" ${n < 2 || wait || S.money < c ? 'disabled' : ''}><b>Hackathon düzenle</b><small>${why}</small></button>`;
}
function exHack(){
  const s = exS(), live = S.emps.filter(e => !isAway(e)), c = teamCost(0.08);
  if (live.length < 2 || S.money < c || (s.hackD != null && S.day - s.hackD < 45)) return;
  S.money -= c; s.hackD = S.day; closeModal();
  const out = [];
  const rp = 20 + exR(25) + live.length*2; S.rp = (S.rp||0) + rp; out.push(`<b>+${rp} Ar-Ge puanı</b> kazanıldı.`);
  const r = Math.random();
  if (r < 0.4){ const tp = pick(Object.keys(TOPICS)), ty = pick(Object.keys(TYPES).filter(k => S.tech[k])); S.ideaNext = {tp, ty, eid:null}; out.push(`Ekip harika bir prototip çıkardı: <b>${TOPICS[tp].ad}</b> temalı bir ${TYPES[ty].ad.toLowerCase()}. Yeni Ürün sayfası bu fikirle açılacak.`); }
  else if (r < 0.7){ S.meetQ = S.day + 30; out.push('Ekip yeni bir kod kütüphanesi geliştirdi: <b>30 gün boyunca</b> biten işler +4 kalite.'); }
  else { const e = pick(live), it = learnable(e.know, e.role)[0]; if (it){ e.know = (e.know||[]).concat(it.id); out.push(`<b>${firstName(e)}</b> maraton boyunca <b>${it.ad}</b> öğrendi!`); } else out.push('Ekip birbirinden çok şey öğrendi.'); }
  const star = pick(live); moodAll(6); moodOne(star, 6);
  out.push(`Gecenin yıldızı: <b>${firstName(star)}</b>. Herkesin morali +6.`);
  showModal('', `<div class="exhol"><div class="npey">HACKATHON BİTTİ</div><h3>48 saatlik kodlama maratonu</h3></div><div class="exhack">${out.map(o => `<p>${o}</p>`).join('')}</div><button class="btn block" data-act="close">Harika!</button>`, 'pro');
  snd('ok');
}

/* ---------------- 8) BAŞARIMLAR ---------------- */
const EX_ACH = [
  {id:'ilk', ad:'İlk Adım', acik:'İlk müşteri işini teslim et', c:() => S.stats.done >= 1},
  {id:'urun', ad:'Benim Ürünüm', acik:'Kendi ürününü yayınla', c:() => S.stats.prodsDone >= 1},
  {id:'viral', ad:'Viral!', acik:'Bir ürünün viral olsun', c:() => exS().viral || S.prods.some(p => p.viral > 0)},
  {id:'efsane', ad:'Efsane Ürün', acik:'90+ kaliteli bir ürün çıkar', c:() => S.stats.best >= 90},
  {id:'ekip', ad:'Kalabalık Ekip', acik:'12 kişilik ekip kur', c:() => S.emps.length >= 12},
  {id:'gokdelen', ad:'Göklere Uzan', acik:'Gökdelen katına taşın', c:() => S.office >= 4},
  {id:'borcsuz', ad:'Borçsuz Zirve', acik:'Hiç kredi almadan Gökdelen\'e taşın', c:() => S.office >= 4 && !exS().loan},
  {id:'dedektif', ad:'Dedektif', acik:'Yalan söyleyen bir çalışanı yakala', c:() => !!exS().liarCaught},
  {id:'hayal', ad:'Hayal Ortağı', acik:'Bir çalışanın hayalini gerçekleştir', c:() => S.emps.some(e => e.dreamOk)},
  {id:'odul', ad:'Ödüllü', acik:'Bir teknoloji ödülü kazan', c:() => (S.awards||[]).length >= 1},
  {id:'gece', ad:'Gece Kuşu', acik:'Bir gece krizini kendin çöz', c:() => !!exS().night},
  {id:'durust', ad:'Dürüst Patron', acik:'Gizli bir teklifi reddet', c:() => !!exS().honest},
  {id:'toplanti', ad:'Toplantı Ustası', acik:'5 toplantı yap', c:() => (exS().meetN||0) >= 5},
  {id:'tatil', ad:'İyi Patron', acik:'Ekibi topluca tatile gönder', c:() => !!exS().tatil},
  {id:'kedi', ad:'Kedi Dostu', acik:'Ofise bir kedi sahiplen', c:() => !!exS().cat},
  {id:'borsa', ad:'Halka Açık', acik:'Şirketini halka arz et', c:() => !!exS().ipo},
  {id:'hack', ad:'Maratoncu', acik:'Bir hackathon düzenle', c:() => exS().hackD != null},
  {id:'karanlik', ad:'Karanlık Taraf', acik:'Karanlık Ağ\'dan bir teklif kabul et', c:() => !!exS().dark},
  {id:'milyar', ad:'Milyarder', acik:'Kasada ₺1 milyar biriktir', c:() => S.money >= 1e9},
  {id:'zirve', ad:'Bytetown\'un Zirvesi', acik:'Oyunu bitir', c:() => !!S.won},
];
function exAchDay(){
  const s = exS(), a = (s.ach = s.ach || {});
  if (S.loans && S.loans.length) s.loan = true;
  for (const A of EX_ACH) if (!a[A.id] && A.c()){ a[A.id] = S.day; toast(`Başarım kazandın: ${A.ad}!`); snd('ok'); }
}
function exAchHTML(){
  const a = exS().ach || {}, n = EX_ACH.filter(A => a[A.id]).length;
  return `<div class="pxpanel exach" style="margin-bottom:12px"><div class="npey">BAŞARIMLAR · ${n}/${EX_ACH.length}</div>
    <div class="exachg">${EX_ACH.map(A => `<div class="exa ${a[A.id] ? 'on' : ''}"><span class="exmed">${a[A.id] ? '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12l5 5 9-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</span><div><b>${A.ad}</b><small>${A.acik}${a[A.id] ? ' · ' + a[A.id] + '. gün' : ''}</small></div></div>`).join('')}</div></div>`;
}

/* ---------------- 9) KARANLIK AĞ ---------------- */
const EX_DARK = [
  {id:'bot', h:'@0xGolge', t:'Bot ordum hazır. 50 bin sahte kullanıcı ürünlerine dalar, sıralamalarda uçarsın.', fx:() => { for (const p of S.prods) if (p.active) p.peak = Math.round(p.peak*1.3); return 'Ürünlerin bir anda tavan yaptı.'; }, k:0.006, risk:0.35, bust:'bot', need:() => S.prods.some(p => p.active)},
  {id:'casus', h:'@sessiz_kaynak', t:'Rakiplerin gelecek ürün planları elimde. Senin bir sonraki ürünün onlardan hep bir adım önde olur.', fx:() => { exS().spyQ = S.day + 60; return '60 gün boyunca ürünlerin +8 kalite.'; }, k:0.01, risk:0.45, bust:'dava'},
  {id:'fatura', h:'@defterci', t:'Sahte faturalarla vergini sıfırlarım, kasana ekstra para kalır. Kimse anlamaz.', fx:() => { const g = round10(Math.max(100000, valuation()*0.03)); S.money += g; exS().fGain = g; return `Kasana ${tl(g)} girdi.`; }, k:0.004, risk:0.5, bust:'vergi'},
  {id:'sabotaj', h:'@kirik_kablo', t:'Rakibin sunucularını birkaç günlüğüne çökertirim. Müşterileri sana koşar.', fx:() => { for (let i = 0; i < 2; i++){ const o = genOffer(); o.pay = Math.round(o.pay*1.6/500)*500; S.offers.unshift(o); } return 'Rakibin müşterilerinden 2 büyük iş teklifi geldi.'; }, k:0.008, risk:0.5, bust:'polis'},
  {id:'odul', h:'@jüri_dostu', t:'Ödül jürisinde tanıdıklarım var. Bir telefonla basında "yılın şirketi" olursun.', fx:() => { S.rep += 15; return '+15 itibar.'; }, k:0.006, risk:0.4, bust:'rezalet'},
  {id:'yorum', h:'@temiz_profil', t:'Ürünlerindeki tüm kötü yorumları sildiririm, mağazada beş yıldızda parlarsın.', fx:() => { for (const p of S.prods) if (p.comments) p.comments = p.comments.filter(c => c.s >= 3); S.rep += 4; return 'Kötü yorumlar silindi, +4 itibar.'; }, k:0.003, risk:0.3, bust:'rezalet', need:() => S.prods.some(p => p.comments)},
];
const exDarkPrice = o => Math.max(40000, round10(valuation()*o.k));
const exRiskWord = r => r < 0.35 ? 'düşük' : r < 0.45 ? 'orta' : 'yüksek';
function exDarkOffers(){
  const s = exS();
  if (!s.dkList || S.day - (s.dkDay||0) >= 15){ s.dkDay = S.day; s.dkList = EX_DARK.filter(o => !o.need || o.need()).sort(() => Math.random() - 0.5).slice(0, 3).map(o => o.id); }
  return s.dkList.map(id => EX_DARK.find(o => o.id === id)).filter(Boolean);
}
function exDarkHTML(){
  const s = exS(), offers = exDarkOffers(), log = (s.dkLog || []).slice(0, 5);
  return `<div class="exdark"><div class="exdkh"><b>KARANLIK AĞ</b><span>bağlantı şifreli · kimlik gizli</span></div>
    <p class="exdkw">Buradaki teklifler şirketini hızla büyütebilir. Ama her işin bir yakalanma riski var; yakalanırsan bedeli ağır olur.</p>
    ${offers.length ? offers.map(o => { const pr = exDarkPrice(o);
      return `<div class="exdkm"><div class="exdkn">${o.h}<i>çevrimiçi</i></div><p>${o.t}</p>
        <div class="exdkf"><span>Fiyat: <b>${tl(pr)}</b> · yakalanma riski: <b class="${exRiskWord(o.risk)}">${exRiskWord(o.risk)}</b></span>
        <button data-act="os" data-k="dk" data-v="${o.id}" ${S.money < pr ? 'disabled' : ''}>Kabul et</button><button data-act="os" data-k="dkno" data-v="${o.id}" class="no">Engelle</button></div></div>`; }).join('')
      : '<p class="exdkw">Şu an kimse çevrimiçi değil. Birkaç gün sonra tekrar bak.</p>'}
    ${log.length ? `<div class="exdklog"><b>Geçmiş işler</b>${log.map(l => `<p>${l}</p>`).join('')}</div>` : ''}</div>`;
}
function exDarkAct(k, v){
  const s = exS(), o = EX_DARK.find(x => x.id === v); if (!o) return;
  s.dkList = (s.dkList || []).filter(x => x !== v);
  if (k === 'dkno'){ toast(`${o.h} engellendi.`); return; }
  const pr = exDarkPrice(o); if (S.money < pr) return;
  S.money -= pr; s.dark = true;
  const res = o.fx();
  (s.dkLog = s.dkLog || []).unshift(`${S.day}. gün · ${o.h} ile anlaştın (${tl(pr)}). ${res}`);
  (s.dkRisk = s.dkRisk || []).push({id:o.id, bust:o.bust, p:o.risk, d:S.day + 15 + exR(40), pr});
  toast(`Anlaşma tamam. ${res} Umarım kimse öğrenmez…`); snd('cash');
}
function exDarkRiskDay(){
  const s = exS(); if (!s.dkRisk || !s.dkRisk.length || !exFree()) return;
  const r = s.dkRisk.find(x => S.day >= x.d); if (!r) return;
  s.dkRisk = s.dkRisk.filter(x => x !== r);
  if (Math.random() > r.p) return;              // şanslıydın
  const fine = Math.max(r.pr*3, round10(valuation()*0.04)), rl = Math.max(10, Math.round(S.rep*0.15));
  let txt;
  if (r.bust === 'bot'){ for (const p of S.prods) if (p.active) p.peak = Math.round(p.peak*0.6); txt = 'Mağaza, ürünlerindeki sahte kullanıcıları tespit etti ve hepsini sildi. Ürünlerin sıralamadan düştü.'; }
  else if (r.bust === 'dava'){ s.spyQ = 0; txt = 'Rakip şirket çalınan planları fark etti ve dava açtı.'; }
  else if (r.bust === 'vergi'){ txt = 'Vergi müfettişleri sahte faturaları buldu. Ceza kesildi.'; }
  else if (r.bust === 'polis'){ moodAll(-12); txt = 'Siber suçlar polisi ofisine baskın yaptı! Bilgisayarlara el kondu, ekip korku içinde.'; }
  else txt = 'Gazeteciler her şeyi ortaya çıkardı. Şirketin "hileli şirket" diye manşetlerde.';
  S.money -= fine; S.rep = Math.max(0, S.rep - rl); moodAll(-6);
  (s.dkLog = s.dkLog || []).unshift(`${S.day}. gün · YAKALANDIN: ${txt} (−${tl(fine)}, −${rl} itibar)`);
  if (window.S3D && S3D.alarm && r.bust === 'polis'){ S3D.alarm(true); setTimeout(() => S3D.alarm(false), 4500); }
  showModal('', `<div class="exbust"><div class="npey">YAKALANDIN</div><h3>Karanlık işler ortaya çıktı</h3><p>${txt}</p><p><b>−${tl(fine)}</b> ceza · <b>−${rl}</b> itibar · ekip morali düştü</p></div><button class="btn block" data-act="close">Bir daha asla…</button>`, 'pro');
  snd('bad');
}
// bilgisayara Karanlık Ağ uygulamasını ekle
if (typeof OS_APPS !== 'undefined'){
  OS_APPS.push(['dark', 'Karanlık Ağ']);
  OS_ICON.dark = '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#050505"/><circle cx="24" cy="24" r="12" fill="none" stroke="#22c55e" stroke-width="2.4"/><path d="M12 24h24M24 12c-6 6-6 18 0 24M24 12c6 6 6 18 0 24" fill="none" stroke="#22c55e" stroke-width="1.6" opacity=".7"/><circle cx="24" cy="24" r="3.5" fill="#22c55e"/></svg>';
}

/* ---------------- GÜNLÜK DÖNGÜ ---------------- */
function exDay(){
  if (!S || S.meeting) return;
  const s = exS();
  // kültür ve kedi: her gün moral
  let md = 0; for (const c of EX_CULT) if (exCult(c.id)) md += c.mood; if (s.cat) md += 0.3;
  if (md) for (const e of S.emps) e.mood = clamp((e.mood??70) + md, 5, 100);
  if (exCult('yemek') && ((S.day-1) % 30) === 0) S.money -= round10(salaries()*0.05);
  if (S.prods.some(p => p.viral > 0)) s.viral = true;
  exIpoDay(); exReqDay(); exAchDay();
  exHolidayDay(); exLifeDay(); exWarDay(); exDarkRiskDay();
}
// eylemler (index.html ACTIONS'tan çağrılır)
function exAct(k, el){
  const s = exS();
  if (k === 'q') exAsk(+el.dataset.id, el.dataset.v);
  else if (k === 'cult'){ const c = (s.cult = s.cult || {}); c[el.dataset.v] = !c[el.dataset.v]; snd('click'); toast(c[el.dataset.v] ? 'Yeni kural yürürlüğe girdi.' : 'Kural kaldırıldı.'); renderPage(true); }
  else if (k === 'cat'){ if (s.cat || S.money < 5000) return; S.money -= 5000; s.cat = {ad:pick(EX_CATS), d:S.day}; sceneKey = ''; moodAll(5); toast(`Ofise yeni bir kedi geldi: ${s.cat.ad}! Herkes onu sevmeye başladı bile.`); snd('ok'); renderPage(true); }
  else if (k === 'ipo'){ if (el && el.dataset && el.dataset.v) exIpo(+el.dataset.v); else exIpoMenu(); }
  else if (k === 'hack') exHack();
}
// calcQuality için: karanlık ağdan gelen rakip planları
// test paneli için: ekstra özellikleri koşulsuz başlat
function exForce(k){
  const s = exS(); closeModal(); if (page) closePage();
  if (k === 'mulakat'){ if (!S.cands.length) S.cands.push(genCand()); exInterview(S.cands[0].id); }
  else if (k === 'kedi'){ if (s.cat) toast('Ofiste zaten bir kedi var: ' + s.cat.ad); else { S.money += 5000; exAct('cat', {dataset:{}}); } }
  else if (k === 'ramazan' || k === 'kurban' || k === 'yilbasi') exHolidayDay(k);
  else if (k === 'hayat'){ s.nextLife = 0; exLifeDay(); }
  else if (k === 'savas'){ s.nextWar = 0; exWarDay(); }
  else if (k === 'istek'){ s.nextReq = 0; exReqDay(); }
  else if (k === 'ipo'){ if (s.ipo) toast('Şirket zaten halka açık.'); else exIpoMenu(true); }
  else if (k === 'hack'){ s.hackD = null; if (S.money < teamCost(0.08)) S.money += teamCost(0.08); exHack(); }
  else if (k === 'dark'){ openPage('pc'); osAct({dataset:{k:'app', v:'dark', id:''}}); }
  else if (k === 'bust'){ (s.dkRisk = s.dkRisk || []).push({id:'test', bust:pick(['bot','dava','vergi','polis','rezalet']), p:1, d:S.day, pr:100000}); exDarkRiskDay(); }
  else if (k === 'store'){ openPage('pc'); osAct({dataset:{k:'app', v:'store', id:''}}); }
}
const exQBonus = () => (S.ex && S.ex.spyQ && S.day <= S.ex.spyQ ? 8 : 0);
