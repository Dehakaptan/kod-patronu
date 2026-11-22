'use strict';
/* =====================================================================
   Bytetown – çalışan kariyeri
   Kademeler: Junior → Orta → Kıdemli → Lider. Yetenek ve kıdem yetince
   terfi edilebilir (maaş artar, moral ve hız yükselir). Her yıl işe giriş
   gününde yıllık değerlendirme yapılır. Her çalışanın kısa bir hikâyesi var.
   ===================================================================== */
const KA_LV = [
  {ad:'Junior',  sk:0, gun:0,   hiz:1.00},
  {ad:'Orta',    sk:4, gun:90,  hiz:1.05},
  {ad:'Kıdemli', sk:6, gun:220, hiz:1.10},
  {ad:'Lider',   sk:8, gun:400, hiz:1.16},
];
const KA_STORY = [
  'Üniversiteyi bırakıp kodlamayı tamamen kendi kendine öğrendi.',
  'Lisede ilk oyununu yaptı; 200 kişi indirdi, hâlâ gurur duyuyor.',
  'Eskiden bankacıydı; bir gün her şeyi bırakıp yazılıma geçti.',
  'Hafta sonları mahalledeki çocuklara ücretsiz kodlama dersi veriyor.',
  'Ailesinin bakkalı için yazdığı stok programıyla bu işe başladı.',
  'Hackathon\'larda tanınan bir isim; ödül koleksiyonu var.',
  'Kendi girişimini kurdu ama batırdı; o tecrübeyi buraya taşıdı.',
  'Kahvesini kendisi kavurur; masasında hep bir termos var.',
  'Açık kaynak projelere katkı veriyor; GitHub profili çok renkli.',
  'Küçük bir kasabadan büyük hayallerle Bytetown\'a geldi.',
  'Tasarıma resim yaparak başladı, sonra ekranlara geçti.',
  'Gece kuşu: en iyi işlerini herkes uyurken çıkarır.',
];
const kaLv = e => Math.min(3, e.lv || 0);
const kaDays = e => S.day - (e.since || 0);
const kaStory = e => KA_STORY[(e.id*7 + (e.name || '').length) % KA_STORY.length];
function kaCanPromote(e){ const n = KA_LV[kaLv(e) + 1]; return !!n && !e.intern && e.skill >= n.sk && kaDays(e) >= n.gun && (!e.lvDay || S.day - e.lvDay >= 60); }
// ilk kez görülen çalışanın kademesi yeteneğine göre belirlenir (en fazla Kıdemli; Lider olmak hak edilir)
function kaInit(e){ if (e.lv != null) return; let lv = 0; for (let i = 1; i < 3; i++) if (e.skill >= KA_LV[i].sk + 1) lv = i; e.lv = lv; e.lvDay = S.day; }
function kaMult(e){ return KA_LV[kaLv(e)].hiz; }
const kaTitle = e => KA_LV[kaLv(e)].ad;
function kaNextText(e){
  const n = KA_LV[kaLv(e) + 1]; if (!n) return 'En üst kademede';
  if (e.intern) return 'Stajyer: önce kadroya alınmalı';
  const need = []; if (e.skill < n.sk) need.push(`yetenek ${n.sk}`); if (kaDays(e) < n.gun) need.push(`${n.gun - kaDays(e)} gün daha kıdem`);
  return need.length ? `${n.ad} için: ${need.join(', ')}` : `${n.ad} kademesine terfi edilebilir`;
}
function kaMenuHTML(e){
  kaInit(e);
  const can = kaCanPromote(e), n = KA_LV[kaLv(e) + 1], raise = n ? Math.round(e.salary*0.15/10)*10 : 0;
  return `<div class="kabox"><div class="kalv">${KA_LV.map((L, i) => `<span class="${i <= kaLv(e) ? 'on' : ''} ${i === kaLv(e) ? 'cur' : ''}">${L.ad}</span>`).join('<i></i>')}</div>
    <p class="kast">“${esc(kaStory(e))}”</p>
    <div class="kanx"><small>${kaDays(e)} gündür şirkette · ${kaNextText(e)}</small>
    ${n ? `<button class="btn sm ${can ? '' : 'gray'}" data-act="ka" data-k="terfi" data-id="${e.id}" ${can && S.money >= raise ? '' : 'disabled'}>Terfi et · +${tl(raise)}/ay</button>` : ''}</div></div>`;
}
function kaPromote(e, silent){
  const n = KA_LV[kaLv(e) + 1]; if (!n) return;
  const raise = Math.round(e.salary*0.15/10)*10;
  e.lv = kaLv(e) + 1; e.lvDay = S.day; e.salary += raise; e.mood = clamp((e.mood ?? 70) + 18, 5, 100); e.promoAsk = false;
  if (e.lv >= 3 && !S.emps.some(x => x.lead && x.role === e.role) && e.skill >= 7) e.lead = true;
  if (!silent){ toast(`${esc(e.name)} artık ${n.ad}! Morali yükseldi, daha hızlı çalışacak.`); snd('ok'); }
  if (typeof speak === 'function') speak(e.id, '🎉');
}
/* ---- yıllık değerlendirme ---- */
function kaReview(e){
  const yr = Math.floor(kaDays(e)/360), can = kaCanPromote(e), m = Math.round(e.mood ?? 70);
  const perf = e.skill >= 7 && m >= 60 ? 'Mükemmel' : e.skill >= 5 && m >= 45 ? 'İyi' : m < 40 ? 'Zayıf (moral düşük)' : 'Gelişiyor';
  const skUp = e.skill - (e.revSkill ?? e.skill); e.revSkill = e.skill; e.revDay = S.day;
  curChoices = [];
  const B = (k, t, s, dis, cls) => `<button class="erow ${cls || ''}" data-act="ka" data-k="${k}" data-id="${e.id}" ${dis ? 'disabled' : ''}><b>${t}</b><small>${s}</small><span class="echev">›</span></button>`;
  showModal('', `<div class="ehead"><div class="mav">${avatarSVG(e.id, e.role, e.emo)}</div><div class="grow"><div class="npey">YILLIK DEĞERLENDİRME · ${yr}. YIL</div><h3>${esc(e.name)}</h3>
      <div class="pxmeta">${ROLES[e.role].ad} · ${kaTitle(e)} · Yetenek ${e.skill}/10</div></div></div>
    <dl class="npdl"><div><dt>Performans</dt><dd><b>${perf}</b></dd></div><div><dt>Bu yıl yetenek</dt><dd>${skUp > 0 ? `+${skUp}` : 'Değişmedi'}</dd></div><div><dt>Moral</dt><dd>${m}/100</dd></div><div><dt>Maaş</dt><dd>${tl(e.salary)}/ay</dd></div></dl>
    <p class="pxsub" style="margin:6px 0 10px">${esc(firstName(e))}: “${can ? 'Bence artık bir üst kademeye hazırım.' : m >= 70 ? 'Burada çok mutluyum, öğrenmeye devam etmek istiyorum.' : m >= 45 ? 'Fena değil ama biraz daha takdir görmek isterim.' : 'Açıkçası son zamanlarda zorlanıyorum.'}”</p>
    ${can ? B('terfi', `${KA_LV[kaLv(e) + 1].ad} kademesine terfi et`, 'Maaş +%15 · moral +18 · daha hızlı çalışır', false, 'good') : ''}
    ${B('rzam', 'Performans zammı yap', `+%8 · ${tl(Math.round(e.salary*0.08/10)*10)}/ay · moral +10`, false, 'good')}
    ${B('takdir', 'Teşekkür et ve takdir et', 'Ücretsiz · moral +6', false)}
    ${m < 50 || e.skill < 4 ? B('uyar', 'Performans hedefi koy', 'Moral −5 · 60 gün daha dikkatli çalışır (+%5 hız)', false, 'bad') : ''}`, 'pro');
}
function kaAct(el){
  const e = S.emps.find(x => x.id === +el.dataset.id), k = el.dataset.k; if (!e) return;
  if (k === 'terfi'){ if (!kaCanPromote(e)) return; const raise = Math.round(e.salary*0.15/10)*10; if (S.money < raise) return; kaPromote(e); closeModal(); return; }
  closeModal();
  if (k === 'rzam'){ e.salary += Math.round(e.salary*0.08/10)*10; e.mood = clamp((e.mood ?? 70) + 10, 5, 100); toast(`${esc(firstName(e))} zamma çok sevindi.`); snd('cash'); }
  else if (k === 'takdir'){ e.mood = clamp((e.mood ?? 70) + 6, 5, 100); toast(`${esc(firstName(e))} takdir edildiği için mutlu.`); }
  else if (k === 'uyar'){ e.mood = clamp((e.mood ?? 70) - 5, 5, 100); e.focusUntil = S.day + 60; toast(`${esc(firstName(e))} için performans hedefi kondu.`); }
}
function kaDay(){
  if (!S || !S.emps) return;
  const free = typeof hkFree === 'function' ? hkFree() : true;
  for (const e of S.emps){
    if (e.intern) continue;
    kaInit(e);
    const d = kaDays(e);
    // işe giriş yıldönümü: yıllık değerlendirme
    if (d > 0 && d % 360 === 0 && e.revDay !== S.day){ if (free){ kaReview(e); return; } }
    // terfiye hazır olan çalışan bir kere haber verir; uzun süre terfi edilmezse morali düşer
    if (kaCanPromote(e)){
      if (!e.promoAsk){ e.promoAsk = S.day; toast(`${esc(firstName(e))} terfi için hazır! Ona tıklayıp terfi edebilirsin.`); }
      else if (S.day - e.promoAsk === 60){ e.mood = clamp((e.mood ?? 70) - 10, 5, 100); toast(`${esc(firstName(e))} terfi bekliyor ama kimse ilgilenmiyor; morali düştü.`); }
    }
  }
}
function kaWorkMult(e){ return kaMult(e) * (e.focusUntil && S.day < e.focusUntil ? 1.05 : 1) * (typeof erMult === 'function' ? erMult(e) : 1) * (typeof odSpeed === 'function' ? odSpeed() : 1); }
if (typeof ACTIONS !== 'undefined') ACTIONS.ka = el => kaAct(el);
function kaForce(k){
  let e = S.emps[0]; if (!e) return;
  if (k === 'terfi'){ e.skill = Math.max(e.skill, 6); e.since = Math.min(e.since || 0, S.day - 300); e.lv = 1; e.lvDay = e.since; empMenu(e.id); return; }
  if (k === 'yillik'){ kaReview(e); return; }
}

// karakter menüsünde görev süre çubuğu (dil öğrenme, eğitim, mentorluk, kurs, izin)
function taskBarHTML(e){
  const t = e.task; if (!t || !t.until) return '';
  const L = t.type === 'ogren' && typeof LEARN_BY !== 'undefined' ? LEARN_BY[t.item] : null;
  const total = t.from != null ? Math.max(1, t.until - t.from) : L ? L.gun : 5;
  const left = Math.max(0, t.until - S.day - (S.dayFrac || 0)), k = Math.max(0, Math.min(1, 1 - left/total));
  return `<span class="tkb"><span class="tkf" style="width:${Math.round(k*100)}%"></span></span>`;
}
