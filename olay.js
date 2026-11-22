'use strict';
/* =====================================================================
   Bytetown – siber saldırılar ve yazılım fuarı
   ===================================================================== */
const olS = () => { S.ol = S.ol || {sec:0, cd:0, fuarY:-1}; return S.ol; };
const olFree = () => typeof hkFree === 'function' ? hkFree() : (!page && $('modal').classList.contains('hidden'));
const olRev = p => Math.round((p.users || 0)*(TYPES[p.type] ? TYPES[p.type].arpu : 1));

/* ---------------- SİBER SALDIRI ---------------- */
let olCur = null;
function olHack(force){
  const live = S.prods.filter(p => p.active && p.users > 50).sort((a, b) => b.users - a.users);
  if (!live.length) return false;
  const p = live[0], O = olS(); O.cd = S.day + 70;
  const fee = Math.max(40000, olRev(p)*12), sec = Math.max(100000, olRev(p)*30);
  olCur = {pid:p.id, fee, sec};
  if (window.S3D && S3D.alarm) S3D.alarm(true);
  snd('bad');
  const B = (k, t, s, em, dis, cls) => `<button class="dvopt ${cls || ''}" data-act="ol" data-k="${k}" ${dis ? 'disabled' : ''}><b>${t}</b><span>${s}</span><em>${em}</em></button>`;
  showModal('', `<div class="nphead"><div><div class="npey" style="color:#dc2626">SİBER SALDIRI</div><h3>${esc(p.name)} saldırı altında!</h3></div></div>
    <div class="olterm"><span>&gt; anormal giriş denemesi: 14.322/dk</span><span>&gt; kullanıcı veritabanına erişim deneniyor…</span><span class="blink">&gt; güvenlik duvarı zorlanıyor_</span></div>
    <p class="pxsub" style="margin:8px 0 10px">Hackerlar <b>${fmt(p.users)}</b> kullanıcının verisine ulaşmaya çalışıyor. Hızlı karar vermelisin.${O.sec ? ' Güvenlik sistemin saldırıyı yavaşlatıyor.' : ''}</p>
    <div class="dvopts">
      ${B('ekip', 'Bütün ekip yamaya odaklansın', 'Ücretsiz. 3 gün boyunca projeler yavaşlar. Çoğu zaman işe yarar.', 'Ücretsiz')}
      ${B('firma', 'Siber güvenlik firması tut', 'Uzmanlar saldırıyı neredeyse kesin durdurur.', tl(fee), S.money < fee, 'main')}
      ${B('seffaf', 'Kullanıcıları uyar, şeffaf ol', 'Biraz kullanıcı kaybedersin ama güven kazanırsın.', 'İtibar +')}
      ${B('yoksay', 'Görmezden gel', 'Belki bir şey olmaz… ama olursa çok kötü olur.', 'Riskli', false, 'bad')}
    </div>`, 'pro');
  return true;
}
function olLose(p, x){ const u = Math.round(p.users*x); p.users -= u; p.peak = Math.round(p.peak*(1 - x/2)); return u; }
function olAct(el){
  const k = el.dataset.k;
  if (k === 'guvenlik'){ const c = olCur; if (!c || S.money < c.sec) return; S.money -= c.sec; olS().sec = 1; closeModal(); toast('Güvenlik sistemi kuruldu: saldırı ihtimali yarıya indi.'); snd('ok'); return; }
  const c = olCur, p = c && S.prods.find(x => x.id === c.pid); if (!p) { closeModal(); return; }
  let res, ok = true, lost = 0, rep = 0, sue = false;
  if (k === 'ekip'){ olS().patch = S.day + 3; if (Math.random() < (olS().sec ? 0.92 : 0.8)){ lost = olLose(p, 0.03); res = 'Ekip gece gündüz çalıştı ve açığı kapattı. Az sayıda kullanıcı etkilendi.'; } else { ok = false; lost = olLose(p, 0.12); rep = -2; res = 'Yama yetişmedi; bazı veriler sızdı.'; } }
  else if (k === 'firma'){ if (S.money < c.fee) return; S.money -= c.fee; lost = olLose(p, 0.01); res = 'Güvenlik uzmanları saldırıyı birkaç saatte durdurdu. Neredeyse hiç kimse etkilenmedi.'; }
  else if (k === 'seffaf'){ lost = olLose(p, 0.08); rep = 2; res = 'Kullanıcılara durumu açıkça anlattın. Bazıları gitti ama çoğu dürüstlüğünü takdir etti.'; }
  else { if (Math.random() < 0.4){ res = 'Şanslıydın: saldırganlar vazgeçti.'; } else { ok = false; lost = olLose(p, 0.35); rep = -8; sue = Math.random() < 0.4; res = 'Büyük bir veri sızıntısı yaşandı ve haberlere çıktı!'; } }
  S.rep = Math.max(0, S.rep + rep);
  typeof smEvent === 'function' && smEvent('hack', {name:p.name, leak:!ok});
  if (sue && typeof dvSue === 'function') setTimeout(() => { if (S) dvSue('Kullanıcı Hakları Derneği', 'Av. Deniz Yaman', Math.max(80000, olRev(p)*40), 3, 0, 'Veri sızıntısı yüzünden binlerce kullanıcının bilgileri ifşa oldu; tazminat talep ediyoruz.'); }, 4000);
  closeModal(); snd(ok ? 'ok' : 'bad');
  showModal('', `<div class="nphead"><div><div class="npey" style="color:${ok ? '#15803d' : '#b91c1c'}">${ok ? 'SALDIRI DURDURULDU' : 'VERİ SIZINTISI'}</div><h3>${esc(p.name)}</h3></div></div>
    <p class="pxsub">${res}</p>
    <div class="lbl"><span>Kaybedilen kullanıcı</span><b class="${lost ? 'red' : 'green'}">${lost ? '-' + fmt(lost) : 'Yok'}</b></div>
    ${rep ? `<div class="lbl"><span>İtibar</span><b class="${rep > 0 ? 'green' : 'red'}">${rep > 0 ? '+' : ''}${rep}</b></div>` : ''}
    ${!olS().sec ? `<div class="olsec"><b>Bir daha olmasın mı?</b><span>Güvenlik sistemi kurarsan saldırı ihtimali yarıya iner, ekip yamaları daha çok tutar.</span><button class="npgo" data-act="ol" data-k="guvenlik" ${S.money < c.sec ? 'disabled' : ''}>Güvenlik sistemi kur · ${tl(c.sec)}</button></div>` : ''}
    <button class="btn block" data-act="close">Tamam</button>`, 'pro');
  olAlarmOffWhenClosed();
}
function olAlarmOffWhenClosed(){ const iv = setInterval(() => { if (!S || $('modal').classList.contains('hidden')){ clearInterval(iv); if (window.S3D && S3D.alarm) S3D.alarm(false); } }, 400); }
const olWorkMult = () => (S.ol && S.ol.patch && S.day < S.ol.patch) ? 0.55 : 1;

/* ---------------- YAZILIM FUARI ---------------- */
const OL_STAND = [
  {id:'kucuk', ad:'Küçük stand',  pct:0.015, min:30000,  teklif:1, bonus:1,    rep:1, kul:0.03, fill:0.35, acik:'Bir masa, bir afiş. Birkaç yeni müşteriyle tanışırsın.'},
  {id:'orta',  ad:'Orta stand',   pct:0.04,  min:120000, teklif:2, bonus:1.1,  rep:3, kul:0.08, fill:0.65, acik:'Ekranlı, ışıklı bir stand. Ürünün dikkat çeker.'},
  {id:'buyuk', ad:'Dev stand',    pct:0.09,  min:400000, teklif:3, bonus:1.2,  rep:6, kul:0.15, fill:1,    acik:'Fuarın en büyük standı ve sahne gösterisi. Herkes seni konuşur.'},
];
let olFuar = null;
function olFuarInvite(){
  const live = S.prods.filter(p => p.active).sort((a, b) => b.users - a.users).slice(0, 3);
  olFuar = {prod:live[0] ? live[0].id : 0};
  const yr = Math.floor(S.day/360) + 1;
  showModal('', `<div class="nphead"><div><div class="npey">DAVET · ${yr}. YIL</div><h3>Bytetown Yazılım Fuarı başlıyor</h3></div></div>
    <p class="pxsub" style="margin:-4px 0 10px">Şehrin bütün teknoloji şirketleri, müşteriler ve yatırımcılar fuarda. Bir stand açarsan yeni işler bulur, ürününü tanıtırsın.</p>
    ${live.length ? `<div class="pxlbl">Standda neyi tanıtacaksın?</div><div class="olprods">${live.map(p => `<button class="chip ${olFuar.prod === p.id ? 'on' : ''}" data-act="ol" data-k="urun" data-v="${p.id}">${esc(p.name)}</button>`).join('')}<button class="chip" data-act="ol" data-k="urun" data-v="0">Şirket hizmetleri</button></div>` : ''}
    <div class="dvopts" style="margin-top:8px">${OL_STAND.map(s => { const cost = Math.max(s.min, Math.round(S.money*s.pct));
      return `<button class="dvopt ${s.id === 'orta' ? 'main' : ''}" data-act="ol" data-k="stand" data-v="${s.id}" ${S.money < cost ? 'disabled' : ''}><b>${s.ad}</b><span>${s.acik} ${s.teklif} yeni teklif · itibar +${s.rep}</span><em>${tl(cost)}</em></button>`; }).join('')}</div>
    <button class="pxghost block" data-act="close" style="width:100%;margin-top:8px">Bu yıl katılmayalım</button>`, 'pro');
}
function olFuarGo(sid){
  const s = OL_STAND.find(x => x.id === sid); if (!s) return;
  const cost = Math.max(s.min, Math.round(S.money*s.pct)); if (S.money < cost) return;
  S.money -= cost; closeModal();
  const p = S.prods.find(x => x.id === (olFuar && olFuar.prod));
  const show = window.S3D && S3D.launch;
  const result = () => olFuarResult(s, p, cost);
  if (!show){ result(); return; }
  if (page) closePage();
  window.cyShowing = true;
  S3D.launch(true, {name:'Bytetown Yazılım Fuarı', type:'', sub:p ? `Standımızda: ${p.name}` : `${S.name} standı`, company:S.name, fill:s.fill});
  const vis = Math.round((3000 + S.rep*40)*(0.5 + s.fill)), ov = document.createElement('div'); ov.id = 'lnch';
  ov.innerHTML = `<div class="lnt"><span class="lnlive" style="background:#0d9488">FUAR</span><b>${esc(S.name)} standı</b><small>${s.ad} · Bytetown Fuar Merkezi</small></div>
    <div class="lnc"><div><span>Ziyaretçi</span><b id="olV">0</b></div><div><span>Kartvizit</span><b id="olK">0</b></div><div class="lnh"><span>İlgi</span><i><b id="olH"></b></i></div></div>
    <div class="lnm" id="olM">Fuar kapıları açıldı…</div>`;
  $('app').appendChild(ov);
  [[1600, p ? `${S.boss || 'Patron'} sahnede ${p.name} ürününü anlatıyor` : `${S.boss || 'Patron'} şirketini anlatıyor`], [3400, 'Standın önünde kuyruk oluştu!'], [5200, 'Bir yatırımcı kartvizitini bıraktı']].forEach(([ms, m]) => setTimeout(() => { const e = document.getElementById('olM'); if (e) e.textContent = m; }, ms));
  const t0 = Date.now(), iv = setInterval(() => { const k = Math.min(1, (Date.now() - t0)/6200), e = x => document.getElementById(x); if (!e('olV')){ clearInterval(iv); return; }
    e('olV').textContent = fmt(Math.round(vis*k)); e('olK').textContent = fmt(Math.round(vis*0.04*k*k)); e('olH').style.width = Math.round(10 + 80*s.fill*k + 10*k) + '%'; }, 120);
  setTimeout(() => { if (S3D.launchClap) S3D.launchClap(); snd('cash'); }, 3400);
  setTimeout(() => { clearInterval(iv); window.cyShowing = false; result();
    const w = setInterval(() => { if (page || $('modal').classList.contains('hidden')){ clearInterval(w); S3D.launch(false); ov.remove(); } }, 400); }, 6800);
}
function olFuarResult(s, p, cost){
  const offers = [];
  for (let i = 0; i < s.teklif; i++){ const o = genOffer(); o.pay = Math.round(o.pay*s.bonus/500)*500; o.fuar = true; offers.push(o); }
  S.offers = offers.concat(S.offers || []).slice(0, 8);
  S.rep += s.rep;
  let gain = 0; if (p){ gain = Math.round(p.peak*s.kul); p.peak += gain; p.users += Math.round(gain*0.5); }
  const spons = s.id === 'buyuk' && Math.random() < 0.5 ? Math.round(cost*0.6) : 0; if (spons){ S.money += spons; S.stats.earned += spons; }
  if (typeof moodAll === 'function') moodAll(5, 'Fuarda harika vakit geçirdik');
  typeof smEvent === 'function' && smEvent('fuar', {stand:s.id});
  showModal('', `<div class="nphead"><div><div class="npey" style="color:#0d9488">FUAR SONUCU</div><h3>${s.ad} büyük ilgi gördü</h3></div></div>
    <div class="lbl"><span>Yeni iş teklifleri</span><b class="green">${offers.length} teklif${s.bonus > 1 ? ` · +%${Math.round((s.bonus - 1)*100)} ödeme` : ''}</b></div>
    ${p ? `<div class="lbl"><span>${esc(p.name)}</span><b class="green">+${fmt(gain)} potansiyel kullanıcı</b></div>` : ''}
    <div class="lbl"><span>İtibar</span><b class="green">+${s.rep}</b></div>
    ${spons ? `<div class="lbl"><span>Sponsorluk anlaşması</span><b class="green">+${tl(spons)}</b></div>` : ''}
    <p class="pxsub">Fuardaki teklifleri Müşteri İşleri sayfasında bulabilirsin.</p>
    <div class="grid2" style="gap:10px"><button class="pxghost" data-act="close">Kapat</button><button class="npgo" data-act="page" data-v="isler">Tekliflere bak</button></div>`, 'pro');
  snd('ok'); updateAll(true);
}

/* ---------------- her gün ---------------- */
function olDay(){
  if (!S || !S.prods) return;
  const O = olS();
  if (!olFree()) return;
  // yılda bir, 5. ayın ortasında fuar daveti
  const yr = Math.floor(S.day/360);
  if (S.day % 360 === 135 && O.fuarY !== yr && (S.stats.done + S.stats.prodsDone) >= 2){ O.fuarY = yr; olFuarInvite(); return; }
  // siber saldırı
  const live = S.prods.filter(p => p.active && p.users > 50).length;
  if (S.day >= 60 && live && S.day >= (O.cd || 0)){
    const ch = 0.004*Math.min(3, live)*(typeof difMul === 'function' ? difMul('risk') : 1)*(O.sec ? 0.45 : 1);
    if (Math.random() < ch) olHack();
  }
}
if (typeof ACTIONS !== 'undefined') ACTIONS.ol = el => {
  const k = el.dataset.k;
  if (k === 'urun'){ if (olFuar) olFuar.prod = +el.dataset.v; document.querySelectorAll('.olprods .chip').forEach(b => b.classList.toggle('on', b === el)); return; }
  if (k === 'stand'){ olFuarGo(el.dataset.v); return; }
  olAct(el);
};
function olForce(k){
  if (k === 'hack'){ if (!S.prods.some(p => p.active && p.users > 50)) S.prods.unshift({id:S.idSeq++, name:'Test Uygulaması', type:'mobil', topic:'evcil', aud:'aile', size:'orta', q:72, peak:20000, life:90, plat:20, age:20, users:18000, earned:1000000, ad:false, upd:0, viral:0, active:true, day:S.day - 20}); olHack(true); return; }
  if (k === 'fuar'){ olFuarInvite(); return; }
}
