'use strict';
/* =====================================================================
   Bytetown – ödemeyen müşteriler ve davalar
   Nadiren bir müşteri teslim aldığı işin parasını ödemez (özellikle ilk
   yıllarda). Oyuncu ihtarname gönderebilir, avukat tutup dava açabilir ya
   da vazgeçebilir. Duruşma günü mahkeme salonunda izlenir; ortada bir karar
   verilir, sonunda hâkim tokmağı vurur.
   ===================================================================== */
const DV_EXCUSES = [
  {id:'butce',    s:0.72, line:'Ödeme konusunda kötü bir haberimiz var: bu ay bütçemiz çok sıkışık, faturanızı şimdilik ödemeyeceğiz.', court:'Müvekkilim zor bir dönemden geçiyor, ödeme ileri bir tarihe ertelenmeli.'},
  {id:'sozlesme', s:0.50, line:'Ayrıca teslim edilen işin sözleşmeye uymadığını düşünüyoruz; bu yüzden ödeme yapmayacağız.', court:'Teslim edilen iş sözleşmede yazanlara uymuyor, ödeme gerekmez.'},
  {id:'fatura',   s:0.66, line:'Muhasebemiz faturanızı onaylamadı, ödeme şimdilik yapılamıyor. Lütfen bizi bu konuda aramayın.', court:'Fatura usulüne uygun kesilmedi, ödeme yükümlülüğü doğmadı.'},
  {id:'yonetim',  s:0.60, line:'Şirketimiz yeni yönetime geçti; yeni yönetim eski yönetimin verdiği siparişlerin parasını ödemeyecek.', court:'Siparişi veren yönetim görevden alındı, yeni yönetim bu borcu tanımıyor.'},
  {id:'iptal',    s:0.56, line:'Projeyi kendi içimizde iptal ettik, bu yüzden ödeme yapılmayacak.', court:'Proje iptal edildi; kullanılmayan bir iş için ödeme istenemez.'},
];
const DV_LAW = [
  {id:'genc',     ad:'Av. Selin Arı',          unv:'Yeni mezun avukat',             fee:0.05, min:5000,  sk:0,    f:true,  seed:1},
  {id:'tecrube',  ad:'Av. Murat Ekinci',       unv:'15 yıllık ticaret avukatı',     fee:0.10, min:20000, sk:0.12, f:false, seed:4},
  {id:'buro',     ad:'Kaya & Demirtaş Hukuk',  unv:'Ünlü hukuk bürosu',             fee:0.18, min:60000, sk:0.22, f:false, seed:9},
  {id:'kendin',   ad:'Kendin savun',           unv:'Avukatsız, ücretsiz ama riskli', fee:0,    min:0,     sk:-0.12, f:false, seed:0, self:true},
];
const DV_HARC = 0.02;    // mahkeme harcı
const dvS = () => { S.dv = S.dv || {cases:[], cd:0, n:0}; return S.dv; };
const dvOpen = () => S && S.dv ? S.dv.cases.filter(c => c.stage !== 'done') : [];
const dvFree = () => typeof hkFree === 'function' ? hkFree() : (!page && $('modal').classList.contains('hidden'));
const dvPct = p => Math.round(p*100);
const dvWord = p => p >= 0.7 ? 'Güçlü' : p >= 0.5 ? 'Orta' : 'Zayıf';
const dvLawOf = c => DV_LAW.find(l => l.id === c.law) || DV_LAW[0];
function dvFee(c, L){ return Math.max(L.min, Math.round(c.amount*L.fee)); }
function dvHarc(c){ return Math.max(1500, Math.round(c.amount*DV_HARC)); }

/* ---- teslimde: bu müşteri ödeyecek mi? ---- */
function dvNoPay(p, sc, pay, late){
  if (!p || p.kind !== 'is' || !(pay > 0)) return null;
  const D = dvS();
  const forced = window.__dvForce; window.__dvForce = false;
  if (!forced){
    if ((S.stats.done || 0) < 1 || dvOpen().length || S.day < (D.cd || 0)) return null;
    if (typeof msLoyal === 'function' && msLoyal(p.client)) return null;   // sadık müşteri hep öder
    const ch = (((S.stats.done || 0) < 10 ? 0.12 : 0.05) + (sc < 5 ? 0.06 : 0))*(typeof difMul === 'function' ? difMul('risk') : 1);
    if (Math.random() >= ch) return null;
  }
  const ex = pick(DV_EXCUSES);
  let str = ex.s + (sc - 6)*0.05 - (late > 0 ? 0.06 : 0) + (ex.id === 'sozlesme' && sc >= 8 ? 0.12 : 0);
  str = clamp(str, 0.15, 0.85);
  const c = {id:++D.n, client:p.client || 'Müşteri', contact:(p.brief && p.brief.contact) || 'Yetkili', amount:pay, day:S.day, ex:ex.id, str, sc, late:late || 0, stage:'yeni', type:p.type};
  D.cases.unshift(c); D.cases = D.cases.slice(0, 12); D.cd = S.day + 45;
  // inceleme penceresi kapanınca karar ekranı açılır
  dvWhenFree(() => dvCaseModal(c.id));
  return {line:ex.line, c};
}
function dvWhenFree(fn){
  const iv = setInterval(() => { if (!S){ clearInterval(iv); return; } if (dvFree()){ clearInterval(iv); fn(); } }, 700);
}
const dvGet = id => S.dv && S.dv.cases.find(c => c.id === id);
const dvExc = c => DV_EXCUSES.find(e => e.id === c.ex) || DV_EXCUSES[0];

/* ---- alacak dosyası: ne yapacağız? ---- */
function dvCaseModal(id){
  const c = dvGet(id); if (!c || c.stage === 'done') return;
  if (c.stage === 'yeni') c.stage = 'acik';
  if (c.def){ dvDefModal(c); return; }
  const ih = Math.max(2500, Math.round(c.amount*0.01));
  const evid = c.sc >= 7 && !c.late ? 'İşi zamanında ve iyi teslim ettin, elin güçlü.' : c.sc >= 5 ? 'İş fena değildi ama karşı taraf bazı eksikleri bahane edebilir.' : 'Teslim ettiğin iş zayıftı; karşı taraf bunu kullanacaktır.';
  let acts;
  if (c.stage === 'ihtar') acts = `<p class="pxsub">İhtarname gönderildi. ${Math.max(0, c.ihtar - S.day)} gün içinde yanıt bekleniyor.</p><button class="btn teal block" data-act="close">Tamam</button>`;
  else if (c.stage === 'dava') acts = `<p class="pxsub">Dava açıldı. Avukatın: <b>${esc(dvLawOf(c).ad)}</b>. Duruşma <b>${c.trial}. gün</b> (${Math.max(0, c.trial - S.day)} gün sonra).</p><button class="btn teal block" data-act="close">Tamam</button>`;
  else acts = `<div class="dvopts">
      ${c.ihtarDone ? '' : `<button class="dvopt" data-act="dv" data-v="ihtar" data-id="${c.id}" ${S.money < ih ? 'disabled' : ''}><b>İhtarname gönder</b><span>Resmi uyarı mektubu. Birçok firma bundan sonra öder. Yanıt 5 gün içinde gelir.</span><em>${tl(ih)}</em></button>`}
      <button class="dvopt main" data-act="dv" data-v="avukat" data-id="${c.id}"><b>Avukat tut, dava aç</b><span>Mahkeme kararıyla parayı faiziyle al. Duruşmayı izleyebilirsin.</span><em>Avukat seç</em></button>
      <button class="dvopt" data-act="dv" data-v="vazgec" data-id="${c.id}"><b>Alacaktan vazgeç</b><span>Uğraşmaya değmez. Ekip emeğinin boşa gitmesine üzülür.</span><em>Ücretsiz</em></button>
    </div><button class="pxghost block" data-act="close" style="width:100%;margin-top:8px">Sonra karar vereceğim</button>`;
  showModal('', `<div class="nphead"><div><div class="npey" style="color:#b91c1c">${c.head || 'ÖDEME YAPILMADI'}</div><h3>${esc(c.client)} ${c.head ? 'ürününü kopyaladı' : 'parayı ödemiyor'}</h3></div></div>
    <blockquote class="dvq">“${esc(c.lineText || dvExc(c).line)}”<small>${esc(c.contact)}, ${esc(c.client)}</small></blockquote>
    <div class="grid2" style="gap:8px;margin:8px 0">
      <div class="dvkv"><span>Alacağın</span><b>${tl(c.amount)}</b></div>
      <div class="dvkv"><span>Haklılık durumun</span><b class="${c.str >= 0.7 ? 'green' : c.str < 0.5 ? 'red' : ''}">${dvWord(c.str)}</b></div>
    </div>
    <p class="pxsub" style="margin:0 0 10px">${evid}</p>
    ${acts}`, 'pro');
}
function dvLawyerModal(id){
  const c = dvGet(id); if (!c) return;
  const h = c.def ? 0 : dvHarc(c);
  showModal('', `<div class="nphead"><div><div class="npey">AVUKAT SEÇ</div><h3>${c.def ? 'Seni kim savunsun?' : 'Davanı kim savunsun?'}</h3></div></div>
    <p class="pxsub" style="margin:-4px 0 10px">${c.def ? `Ücret şimdi ödenir. Kazanırsan hiçbir şey ödemezsin; kaybedersen <b>${tl(c.amount)}</b> tazminat ödersin.` : `Ücret davayı açarken ödenir. Mahkeme harcı: <b>${tl(h)}</b>. Kazanırsan alacağını %10 gecikme faiziyle birlikte alırsın.`}</p>
    <div class="dvlaw">${DV_LAW.map(L => { const fee = dvFee(c, L), p = clamp(c.str + L.sk, 0.1, 0.93), no = S.money < fee + h;
      return `<button class="dvl" data-act="dv" data-v="tut" data-id="${c.id}" data-l="${L.id}" ${no ? 'disabled' : ''}>
        <span class="dva">${L.self ? avatarSVG(0, 'me', '') : typeof portraitSVG === 'function' ? portraitSVG(Object.assign(empLook(9804 + L.seed, 'prog', L.f), {shirt:'#1e3a8a', kind:'blazer'})) : ''}</span>
        <b>${esc(L.ad)}</b><small>${esc(L.unv)}</small>
        <div class="dvr"><span>Ücret</span><b>${tl(fee)}</b></div>
        <div class="dvr"><span>Kazanma şansı</span><b class="${p >= 0.7 ? 'green' : p < 0.5 ? 'red' : ''}">~%${dvPct(p)}</b></div>
        ${no ? '<i>Kasa yetmiyor</i>' : ''}</button>`; }).join('')}</div>
    <button class="pxghost block" data-act="dv" data-v="dosya" data-id="${c.id}" style="width:100%;margin-top:8px">Geri</button>`, 'pro');
}

/* ---- düğmeler ---- */
function dvAct(el){
  const v = el.dataset.v, c = dvGet(+el.dataset.id);
  if (v === 'liste'){ dvListModal(); return; }
  if (!c) return;
  if (v === 'dosya'){ dvCaseModal(c.id); return; }
  if (v === 'avukat'){ dvLawyerModal(c.id); return; }
  if (v === 'ihtar'){
    const ih = Math.max(2500, Math.round(c.amount*0.01)); if (S.money < ih) return;
    S.money -= ih; c.stage = 'ihtar'; c.ihtar = S.day + 3 + Math.floor(Math.random()*3); c.ihtarDone = true;
    closeModal(); toast(`İhtarname ${esc(c.client)} firmasına gönderildi. Yanıt bekleniyor.`); snd('ok'); return;
  }
  if (v === 'vazgec'){
    c.stage = 'done'; c.res = 'vazgecti'; closeModal(); moodAll(-3, 'Emeğimizin parası alınamadı');
    toast(`${esc(c.client)} alacağından vazgeçtin.`); return;
  }
  if (v === 'tut'){
    const L = DV_LAW.find(x => x.id === el.dataset.l); if (!L) return;
    const fee = dvFee(c, L), h = c.def ? 0 : dvHarc(c); if (S.money < fee + h) return;
    if (!c.def) typeof smEvent === 'function' && smEvent('dava', {client:c.client});
    S.money -= fee + h; c.law = L.id; c.p = clamp(c.str + L.sk, 0.1, 0.93); c.stage = 'dava'; c.trial = S.day + 7 + Math.floor(Math.random()*6); c.cost = fee + h;
    closeModal(); snd('ok');
    showModal('', `<div class="nphead"><div><div class="npey">${c.def ? 'SAVUNMA HAZIR' : 'DAVA AÇILDI'}</div><h3>${c.def ? `${esc(c.client)} davasında savunma` : `${esc(c.client)} mahkemeye veriliyor`}</h3></div></div>
      <div class="lbl"><span>Avukatın</span><b>${esc(L.self ? 'Kendin' : L.ad)}</b></div>
      <div class="lbl"><span>Duruşma günü</span><b>${c.trial}. gün</b></div>
      <div class="lbl"><span>Kazanma şansı</span><b>~%${dvPct(c.p)}</b></div>
      <p class="pxsub">Duruşma günü geldiğinde haber vereceğim; istersen salona gidip izleyebilirsin.</p>
      <button class="btn block" data-act="close">Tamam</button>`, 'pro');
    return;
  }
  if (v === 'uzlas-evet' || v === 'uzlas-hayir'){
    if (v === 'uzlas-evet' && c.stage === 'dava'){ const g = Math.round(c.amount*c.offer); S.money += g; S.stats.earned += g; c.stage = 'done'; c.res = 'uzlasma'; c.got = g; snd('cash'); toast(`${esc(c.client)} ile uzlaşıldı: ${tl(g)} kasaya girdi.`); }
    else toast('Uzlaşmayı reddettin. Duruşma planlandığı gibi yapılacak.');
    closeModal(); return;
  }
  if (v === 'def-uzlas'){ const pay = Math.round(c.amount*0.4); S.money -= pay; c.stage = 'done'; c.res = 'uzlasma'; c.got = -pay; closeModal(); toast(`${esc(c.client)} ile uzlaştın: ${tl(pay)} ödedin, dava düştü.`); snd('ok'); return; }
  if (v === 'izle'){ closeModal(); dvWatch(c.id); return; }
  if (v === 'avukat-halletsin'){ closeModal(); dvVerdict(c.id, false); return; }
  if (v === 'karar'){ dvChoice(c.id, el.dataset.k); return; }
}

/* ---- dava listesi (patron menüsü ve PC menüsünden) ---- */
function dvListModal(){
  const D = dvS(), op = dvOpen(), old = D.cases.filter(c => c.stage === 'done').slice(0, 5);
  const st = c => c.stage === 'dava' ? `Duruşma ${c.trial}. gün` : c.stage === 'ihtar' ? 'İhtarname yanıtı bekleniyor' : 'Karar bekliyor';
  const rs = c => ({kazandi:`Kazandın · +${tl(c.got || 0)}`, kaybetti:'Kaybettin', uzlasma:`Uzlaşma · ${(c.got || 0) < 0 ? '-' : '+'}${tl(Math.abs(c.got || 0))}`, odedi:`Ödedi · +${tl(c.got || 0)}`, vazgecti:'Vazgeçtin', savundu:'Kendini savundun, ödeme yok', tazminat:`Tazminat ödedin · -${tl(Math.abs(c.got || 0))}`})[c.res] || '';
  showModal('', `<div class="nphead"><div><div class="npey">HUKUK</div><h3>Alacaklar ve davalar</h3></div></div>
    ${op.length ? op.map(c => `<button class="dvrow" data-act="dv" data-v="dosya" data-id="${c.id}"><b>${esc(c.client)}</b><span>${tl(c.amount)}</span><em>${c.def ? 'Sana açılan dava · ' : ''}${st(c)}</em></button>`).join('') : '<p class="pxsub">Açık bir alacak ya da dava yok.</p>'}
    ${old.length ? `<h4 style="margin:12px 0 6px">Geçmiş</h4>${old.map(c => `<div class="dvrow old"><b>${esc(c.client)}</b><span>${tl(c.amount)}</span><em class="${['kaybetti', 'vazgecti', 'tazminat'].includes(c.res) ? 'red' : 'green'}">${rs(c)}</em></div>`).join('')}` : ''}
    <button class="btn teal block" data-act="close" style="margin-top:10px">Kapat</button>`, 'pro');
}
function dvBtnHTML(){
  if (!S || !S.dv || !S.dv.cases.length) return '';
  const n = dvOpen().length;
  return `<button class="btn block pcbtn" data-act="dv" data-v="liste"><b>Davalar${n ? ` · ${n} açık` : ''}</b><small>Ödenmeyen alacaklar, avukatlar ve mahkeme</small></button>`;
}
function dvTileHTML(){
  if (!S || !S.dv || !S.dv.cases.length) return '';
  const n = dvOpen().length;
  return `<button class="pcm-t" data-act="dv" data-v="liste">${n ? '<span class="badge-dot">!</span>' : ''}<span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M7 20h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/></svg></span><span>Davalar</span></button>`;
}

/* ---- her gün ---- */
function dvDay(){
  if (!S || !S.dv) return;
  for (const c of S.dv.cases){
    if (c.stage === 'ihtar' && S.day >= c.ihtar){
      if (!dvFree()) return;
      if (Math.random() < 0.3 + c.str*0.4){
        c.stage = 'done'; c.res = 'odedi'; c.got = c.amount; S.money += c.amount; S.stats.earned += c.amount; snd('cash');
        showModal('', `<div class="nphead"><div><div class="npey" style="color:#15803d">ÖDEME GELDİ</div><h3>${esc(c.client)} ihtarnameden sonra ödedi</h3></div></div>
          <p class="pxsub">Resmi uyarı işe yaradı. Alacağın kasana girdi.</p><div class="lbl"><span>Tahsil edilen</span><b class="green">+${tl(c.amount)}</b></div>
          <button class="btn block" data-act="close">Harika</button>`, 'pro');
      } else {
        c.stage = 'acik'; toast(`${esc(c.client)} ihtarnameye yanıt vermedi. Dava açmayı düşünebilirsin.`);
        dvCaseModal(c.id);
      }
      return;
    }
    if (c.stage === 'dava'){
      // duruşmadan önce karşı taraf bazen uzlaşma teklif eder
      if (!c.def && !c.offered && S.day >= c.trial - 4 && S.day < c.trial && dvFree() && Math.random() < 0.12){
        dvOffer(c); return;
      }
      if (S.day >= c.trial && dvFree()){
        dvTrialCall(c); return;
      }
    }
  }
}
function dvOffer(c){
        c.offered = true; c.offer = Math.round((0.4 + c.p*0.3)*20)/20;
        showModal('', `<div class="nphead"><div><div class="npey">UZLAŞMA TEKLİFİ</div><h3>${esc(c.client)} uzlaşmak istiyor</h3></div></div>
          <p class="pxsub">Karşı tarafın avukatı aradı: alacağının <b>%${dvPct(c.offer)}</b> kadarını hemen ödemeyi, karşılığında davayı düşürmeni teklif ediyor.</p>
          <div class="lbl"><span>Teklif</span><b>${tl(Math.round(c.amount*c.offer))}</b></div><div class="lbl"><span>Davayı kazanma şansın</span><b>~%${dvPct(c.p)}</b></div>
          <div class="grid2" style="gap:10px;margin-top:10px"><button class="pxghost" data-act="dv" data-v="uzlas-hayir" data-id="${c.id}">Reddet, mahkemeye gidelim</button><button class="npgo" data-act="dv" data-v="uzlas-evet" data-id="${c.id}">Kabul et</button></div>`, 'pro');
}
function dvTrialCall(c){
        const L = dvLawOf(c);
        showModal('', `<div class="nphead"><div><div class="npey">BUGÜN DURUŞMA VAR</div><h3>${esc(c.client)} davası görülüyor</h3></div></div>
          <p class="pxsub">${L.self ? 'Avukatın yok, kendini savunacaksın.' : esc(L.ad) + ' adliyede seni bekliyor.'} Salona gidip duruşmayı izleyebilir, ortada bir karar verebilirsin. İstersen her şeyi avukatına da bırakabilirsin.</p>
          <div class="lbl"><span>${c.def ? 'Tazminat talebi' : 'Alacak'}</span><b>${tl(c.amount)}</b></div><div class="lbl"><span>Kazanma şansı</span><b>~%${dvPct(c.p)}</b></div>
          <div class="grid2" style="gap:10px;margin-top:10px"><button class="pxghost" data-act="dv" data-v="avukat-halletsin" data-id="${c.id}">Avukatım halletsin</button><button class="npgo" data-act="dv" data-v="izle" data-id="${c.id}">Duruşmayı izle</button></div>`, 'pro');
}

/* ---- duruşmayı izle ---- */
let dvShow = null;
function dvWatch(id){
  const c = dvGet(id); if (!c) return;
  if (!window.S3D || !S3D.court){ dvVerdict(id, false); return; }
  if (page) closePage();
  const L = dvLawOf(c);
  window.cyShowing = true; dvShow = {id, wasPaused:paused, timers:[]}; paused = true;
  S3D.court(true, {audience:4 + Math.floor(Math.random()*7), lawF:L.f, lawSeed:L.seed, judgeF:Math.random() < 0.5, repF:Math.random() < 0.4, oppF:Math.random() < 0.4});
  const ov = document.createElement('div'); ov.id = 'dvo';
  ov.innerHTML = `<div class="lnt"><span class="lnlive dvlive">DURUŞMA</span><b>${esc(S.name)} – ${esc(c.client)}</b><small>Asliye Ticaret Mahkemesi</small></div>
    <div class="dvbar"><span>Kazanma şansı</span><i><b id="dvP"></b></i><em id="dvPn"></em></div>
    <div class="lnm" id="dvM">Mahkeme başlıyor…</div><div class="dvch" id="dvC"></div>`;
  $('app').appendChild(ov); dvBar(c);
  const say = (ms, ph, m) => dvShow.timers.push(setTimeout(() => { if (S3D.courtPhase && ph) S3D.courtPhase(ph); const e = document.getElementById('dvM'); if (e) e.textContent = m; }, ms));
  const good = c.sc >= 6 && !c.late;
  say(0, 'acilis', 'Hâkim duruşmayı açtı ve dosyayı okuyor…');
  const who = L.self ? (S.boss || 'Patron') : L.ad;
  if (c.def){
    say(2600, 'onlar', `${c.client} avukatı: “${c.claim || 'Teslim edilen iş kusurluydu, müvekkilim zarara uğradı.'}”`);
    say(7000, 'biz', `${who}: “İş ${good ? 'eksiksiz ve zamanında' : 'brife uygun şekilde'} teslim edildi, bu iddialar asılsız.”`);
  } else {
    say(2600, 'biz', `${who}: “${L.self ? 'Biz' : 'Müvekkilim'} ${c.lineText ? `ürünü kendisi geliştirdi; ${c.client} ise onu kopyaladı.”` : `işi ${good ? 'eksiksiz ve zamanında' : 'teslim etti'}; ama ${c.client} karşılığını ödemedi.”`}`);
    say(7000, 'onlar', `Karşı tarafın avukatı: “${c.courtText || dvExc(c).court}”`);
  }
  dvShow.timers.push(setTimeout(() => {
    if (S3D.courtPhase) S3D.courtPhase('acilis');
    const e = document.getElementById('dvM'); if (e) e.textContent = 'Hâkim: “Söz sizde. Ne yapmak istersiniz?”';
    const w = S.emps.slice().sort((a, b) => (b.skill || 0) - (a.skill || 0))[0];
    const box = document.getElementById('dvC'); if (!box) return;
    box.innerHTML = `<button data-act="dv" data-v="karar" data-k="delil" data-id="${c.id}"><b>Delilleri sun</b><span>${c.def ? 'Brif, onay e-postaları ve müşterinin teşekkürleri' : 'Brif, teslim e-postaları ve yazışmalar'}</span></button>
      <button data-act="dv" data-v="karar" data-k="tanik" data-id="${c.id}"><b>${w ? `${esc(w.name.split(' ')[0])} tanık olsun` : 'Kendin tanıklık et'}</b><span>${w ? 'İşi yapan çalışanın anlatsın' : 'Projeyi en iyi sen bilirsin'}</span></button>
      <button data-act="dv" data-v="karar" data-k="uzlas" data-id="${c.id}"><b>Uzlaşma öner</b><span>${c.def ? 'Tazminatın yarısını öde, dava bitsin' : 'Alacağın yarısını hemen al, dava bitsin'}</span></button>`;
    box.classList.add('on');
  }, 11500));
}
function dvBar(c){
  const b = document.getElementById('dvP'), n = document.getElementById('dvPn'); if (!b) return;
  b.style.width = dvPct(c.p) + '%'; b.style.background = c.p >= 0.7 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : c.p >= 0.5 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#f87171,#dc2626)';
  n.textContent = '%' + dvPct(c.p);
}
function dvChoice(id, k){
  const c = dvGet(id); if (!c || !dvShow) return;
  const box = document.getElementById('dvC'); if (box){ box.classList.remove('on'); box.innerHTML = ''; }
  const msg = m => { const e = document.getElementById('dvM'); if (e) e.textContent = m; };
  if (k === 'uzlas'){
    S3D.courtPhase && S3D.courtPhase('biz'); msg(c.def ? 'Uzlaşma önerdin: tazminatın yarısını ödeyeceksin.' : 'Avukatın uzlaşma önerdi. Karşı taraf kabul ediyor…');
    dvShow.timers.push(setTimeout(() => dvVerdict(id, true, 'uzlas'), 3000)); return;
  }
  let bonus;
  if (k === 'delil'){ bonus = c.sc >= 6 ? 0.12 : 0.04; msg(bonus > 0.1 ? 'Delilleri sundun: brif ve teslim e-postaları hâkimi etkiledi!' : 'Delilleri sundun ama işteki eksikler de ortaya çıktı…'); }
  else { const w = S.emps.length; bonus = w ? 0.08 : 0.06; msg(w ? 'Tanık işin nasıl yapıldığını tek tek anlattı.' : 'Tanık kürsüsünde projeyi anlattın.'); }
  c.p = clamp(c.p + bonus, 0.1, 0.95); dvBar(c);
  S3D.courtPhase && S3D.courtPhase('biz');
  dvShow.timers.push(setTimeout(() => { S3D.courtPhase && S3D.courtPhase('onlar'); msg('Karşı taraf son kez itiraz ediyor…'); }, 3600));
  dvShow.timers.push(setTimeout(() => { S3D.courtPhase && S3D.courtPhase('acilis'); msg('Hâkim kararını açıklıyor…'); }, 6400));
  dvShow.timers.push(setTimeout(() => { S3D.courtGavel && S3D.courtGavel(); snd('click'); }, 7600));
  dvShow.timers.push(setTimeout(() => dvVerdict(id, true), 8600));
}
function dvVerdict(id, watched, how){
  const c = dvGet(id); if (!c || c.stage === 'done') return;
  if (c.def) return dvDefVerdict(c, watched, how);
  let won, got = 0;
  if (how === 'uzlas'){ got = Math.round(c.amount*0.5); c.res = 'uzlasma'; won = true; }
  else { won = Math.random() < c.p; if (won){ got = Math.round(c.amount*1.1); c.res = 'kazandi'; } else c.res = 'kaybetti'; }
  c.stage = 'done'; c.got = got;
  typeof smEvent === 'function' && smEvent('karar', {won:c.res === 'kazandi' || c.res === 'uzlasma', client:c.client});
  if (got){ S.money += got; S.stats.earned += got; }
  if (c.res === 'kazandi'){ S.rep += 2; moodAll(4, 'Davayı kazandık'); }
  else if (c.res === 'kaybetti'){ S.rep = Math.max(0, S.rep - 1); moodAll(-4, 'Davayı kaybettik'); }
  const e = document.getElementById('dvM'); if (e) e.textContent = won ? (how === 'uzlas' ? 'Uzlaşma tutanağa geçti.' : 'Karar: Dava kabul edildi!') : 'Karar: Dava reddedildi.';
  snd(won ? 'cash' : 'bad');
  const L = dvLawOf(c);
  showModal('', `<div class="nphead"><div><div class="npey" style="color:${won ? '#15803d' : '#b91c1c'}">${how === 'uzlas' ? 'UZLAŞMA' : 'MAHKEME KARARI'}</div><h3>${how === 'uzlas' ? 'Dava uzlaşmayla bitti' : won ? 'Davayı kazandın!' : 'Davayı kaybettin'}</h3></div></div>
    <p class="pxsub">${how === 'uzlas' ? `${esc(c.client)} alacağının yarısını hemen ödemeyi kabul etti.` : won ? `Mahkeme ${esc(c.client)} firmasının borcunu %10 gecikme faiziyle ödemesine karar verdi.` : `Hâkim karşı tarafı haklı buldu. ${esc(L.ad)} üzgün: “Bir dahaki sefere daha güçlü bir dosyayla geliriz.”`}</p>
    <div class="lbl"><span>Alacak</span><b>${tl(c.amount)}</b></div>
    <div class="lbl"><span>Tahsil edilen</span><b class="${got ? 'green' : 'red'}">${got ? '+' + tl(got) : '₺0'}</b></div>
    <div class="lbl"><span>Avukat ve harç</span><b>${tl(c.cost || 0)}</b></div>
    ${c.res === 'kazandi' ? '<div class="lbl"><span>İtibar</span><b class="green">+2</b></div>' : c.res === 'kaybetti' ? '<div class="lbl"><span>İtibar</span><b class="red">-1</b></div>' : ''}
    <button class="btn block" data-act="close">${watched ? 'Adliyeden çık' : 'Tamam'}</button>`, 'pro');
  if (watched) dvEndShowWhenClosed();
  updateAll(true);
}
function dvEndShowWhenClosed(){
  const sh = dvShow;   // yalnızca bu duruşmayı kapat (sonra başlayan bir duruşmaya dokunma)
  const iv = setInterval(() => {
    if (dvShow !== sh){ clearInterval(iv); return; }
    if (!$('modal').classList.contains('hidden') && S) return;
    clearInterval(iv); dvEndShow();
  }, 400);
}
function dvEndShow(){
  if (!dvShow) return;
  dvShow.timers.forEach(clearTimeout);
  if (window.S3D && S3D.court) S3D.court(false);
  const ov = document.getElementById('dvo'); if (ov) ov.remove();
  window.cyShowing = false; paused = dvShow.wasPaused; dvShow = null;
}

/* ---- kızgın müşteri sana dava açarsa (davalı taraf) ---- */
function dvSue(client, contact, claim, sc, late, text){
  const D = dvS();
  const c = {id:++D.n, def:true, client, contact:contact || 'Yetkili', amount:Math.max(20000, Math.round(claim)), day:S.day, str:clamp(0.3 + sc*0.055 - (late > 0 ? 0.08 : 0), 0.15, 0.85), sc, late:late || 0, stage:'yeni', claim:text};
  D.cases.unshift(c); D.cases = D.cases.slice(0, 12);
  typeof smEvent === 'function' && smEvent('dava', {def:true, client});
  dvWhenFree(() => dvCaseModal(c.id));
  return c;
}
function dvDefModal(c){
  const pay = Math.round(c.amount*0.4);
  let acts;
  if (c.stage === 'dava') acts = `<p class="pxsub">Savunman hazır. Avukatın: <b>${esc(dvLawOf(c).self ? 'Kendin' : dvLawOf(c).ad)}</b>. Duruşma <b>${c.trial}. gün</b>.</p><button class="btn teal block" data-act="close">Tamam</button>`;
  else acts = `<div class="dvopts">
      <button class="dvopt main" data-act="dv" data-v="avukat" data-id="${c.id}"><b>Avukat tut, kendini savun</b><span>Kazanırsan hiçbir şey ödemezsin, itibarın da korunur.</span><em>Avukat seç</em></button>
      <button class="dvopt" data-act="dv" data-v="def-uzlas" data-id="${c.id}" ${S.money < pay ? 'disabled' : ''}><b>Uzlaş, davayı düşürsünler</b><span>Talebin %40'ını öde, mahkemeye gitme.</span><em>${tl(pay)}</em></button>
    </div><button class="pxghost block" data-act="close" style="width:100%;margin-top:8px">Sonra karar vereceğim</button>`;
  showModal('', `<div class="nphead"><div><div class="npey" style="color:#b91c1c">SANA DAVA AÇILDI</div><h3>${esc(c.client)} seni mahkemeye verdi</h3></div></div>
    <blockquote class="dvq">“${esc(c.claim || 'Teslim ettiğiniz iş yüzünden zarara uğradık, tazminat istiyoruz.')}”<small>${esc(c.client)} avukatı</small></blockquote>
    <div class="grid2" style="gap:8px;margin:8px 0">
      <div class="dvkv"><span>Tazminat talebi</span><b>${tl(c.amount)}</b></div>
      <div class="dvkv"><span>Savunmanın gücü</span><b class="${c.str >= 0.7 ? 'green' : c.str < 0.5 ? 'red' : ''}">${dvWord(c.str)}</b></div>
    </div>
    <p class="pxsub" style="margin:0 0 10px">${c.sc >= 7 ? 'İşi iyi teslim ettin; bu dava büyük ihtimalle asılsız.' : c.sc >= 5 ? 'İşin bazı eksikleri vardı, karşı taraf bunlara yüklenecek.' : 'Teslim ettiğin iş gerçekten zayıftı, dikkatli olmalısın.'}</p>
    ${acts}`, 'pro');
}
function dvDefVerdict(c, watched, how){
  let pay = 0;
  if (how === 'uzlas'){ pay = Math.round(c.amount*0.5); c.res = 'uzlasma'; }
  else if (Math.random() < c.p){ c.res = 'savundu'; S.rep += 1; moodAll(3, 'Haksız davayı kazandık'); }
  else { pay = c.amount; c.res = 'tazminat'; S.rep = Math.max(0, S.rep - 2); moodAll(-4, 'Tazminat davasını kaybettik'); }
  S.money -= pay; c.got = -pay; c.stage = 'done';
  typeof smEvent === 'function' && smEvent('karar', {won:c.res === 'savundu', client:c.client});
  const ok = c.res === 'savundu';
  const e = document.getElementById('dvM'); if (e) e.textContent = how === 'uzlas' ? 'Uzlaşma tutanağa geçti.' : ok ? 'Karar: Dava reddedildi, haklı çıktın!' : 'Karar: Tazminat ödenecek.';
  snd(ok ? 'cash' : 'bad');
  showModal('', `<div class="nphead"><div><div class="npey" style="color:${ok ? '#15803d' : '#b91c1c'}">${how === 'uzlas' ? 'UZLAŞMA' : 'MAHKEME KARARI'}</div><h3>${how === 'uzlas' ? 'Dava uzlaşmayla bitti' : ok ? 'Kendini savundun!' : 'Davayı kaybettin'}</h3></div></div>
    <p class="pxsub">${how === 'uzlas' ? 'Tazminatın yarısını ödedin, dava kapandı.' : ok ? `Mahkeme ${esc(c.client)} firmasının iddialarını asılsız buldu. Hiçbir şey ödemiyorsun.` : `Hâkim ${esc(c.client)} firmasını haklı buldu.`}</p>
    <div class="lbl"><span>Tazminat talebi</span><b>${tl(c.amount)}</b></div>
    <div class="lbl"><span>Ödediğin</span><b class="${pay ? 'red' : 'green'}">${pay ? '-' + tl(pay) : '₺0'}</b></div>
    <div class="lbl"><span>Avukat</span><b>${tl(c.cost || 0)}</b></div>
    ${ok ? '<div class="lbl"><span>İtibar</span><b class="green">+1</b></div>' : c.res === 'tazminat' ? '<div class="lbl"><span>İtibar</span><b class="red">-2</b></div>' : ''}
    <button class="btn block" data-act="close">${watched ? 'Adliyeden çık' : 'Tamam'}</button>`, 'pro');
  if (watched) dvEndShowWhenClosed();
  updateAll(true);
}

/* ---- test paneli ---- */
function dvForce(k){
  const D = dvS(); D.cd = 0;
  const amount = Math.max(80000, Math.round((S.money || 0)*0.05));
  const ex = pick(DV_EXCUSES), c = {id:++D.n, client:pick(['Anadolu Lojistik', 'Yıldız Market', 'Kuzey Otomotiv', 'Marmara Emlak']), contact:'Test Yetkilisi', amount, day:S.day, ex:ex.id, str:0.62, sc:7, late:0, stage:'yeni', type:'web'};
  D.cases.unshift(c);
  if (k === 'odemez'){ dvCaseModal(c.id); return; }
  if (k === 'sanik' || k === 'sanikdurusma'){ D.cases.shift(); const d = dvSue(c.client, c.contact, amount, 4, 3, 'Uygulama sürekli çöktü, müşterilerimizi kaybettik. Zararımızı ödesinler.'); if (k === 'sanik'){ dvCaseModal(d.id); return; } d.stage = 'dava'; d.law = 'tecrube'; d.p = 0.6; d.trial = S.day; d.cost = 20000; closeModal(); dvWatch(d.id); return; }
  c.stage = 'dava'; c.law = 'tecrube'; c.p = 0.74; c.trial = S.day; c.cost = 25000;
  if (k === 'uzlasma'){ c.trial = S.day + 3; dvOffer(c); return; }
  if (k === 'cagri'){ dvTrialCall(c); return; }
  if (k === 'durusma'){ closeModal(); dvWatch(c.id); return; }
}

if (typeof ACTIONS !== 'undefined') ACTIONS.dv = el => dvAct(el);
