/* =====================================================================
   Bytetown – HİKÂYELER: ofis kulisi, istifa sinyalleri, çalışan hayalleri,
   rakip transferleri, gece krizleri, canlı kullanıcı yorumları,
   etik kısa yollar, yönetim kurulu, yıllık teknoloji ödülleri, şehir haritası.
   index.html her gün storyDay(), her yayında storyRelease() çağırır.
   (Ana betikle ad çakışmasın diye yardımcılar hk / HK_ önekiyle adlandırıldı.)
   ===================================================================== */
const hkSt = () => (S.st = S.st || {});
const hkRand = n => Math.floor(Math.random()*n);
const hkFree = () => !window.cyShowing && !window.pzShowing && typeof page !== 'undefined' && !page && $('modal').classList.contains('hidden') && !document.getElementById('boot') && !$('app').classList.contains('nogame');
const hkLeave = (e, why) => { S.emps = S.emps.filter(x => x !== e); sceneKey = ''; if (why) toast(why); };
const hkAv = e => `<span class="hkav">${avatarSVG(e.id, e.role, e.emo)}</span>`;
function hkPickW(list){ let r = Math.random()*list.reduce((a,x) => a + x[0], 0); for (const x of list){ r -= x[0]; if (r <= 0) return x; } return list[list.length-1]; }
const HK_STAR = on => `<svg viewBox="0 0 20 20" width="13" height="13"><path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" fill="${on ? '#f5b301' : '#d6dbe6'}"/></svg>`;
const hkStars = n => `<span class="hkstars">${[1,2,3,4,5].map(i => HK_STAR(i <= n)).join('')}</span>`;

/* ---------------- 1) OFİS KULİSİ ---------------- */
function hkGossip(txt, silent){
  const g = hkSt().gossip = hkSt().gossip || [];
  g.unshift({d:S.day, t:txt}); if (g.length > 14) g.pop();
  if (!silent) toast('Kulis: ' + txt);
}
function hkGossipDay(force){
  const s = hkSt(); if (S.emps.length < 2 && !force) return;
  if (s.nextGos == null) s.nextGos = S.day + 4;
  if (!force && S.day < s.nextGos) return;
  s.nextGos = S.day + 4 + hkRand(5);
  const live = S.emps.filter(e => !isAway(e)); if (!live.length) return;
  const pool = [];
  const liar = S.emps.find(e => e.liar); if (liar) pool.push([3, `${firstName(liar)} öğle arasında "Bu hafta da bir bahane bulur kaçarım" diye gülüyordu.`]);
  const fl = S.emps.find(e => e.flight); if (fl) pool.push([5, `${firstName(fl)} telefonda başka bir şirketle iş görüşmesi ayarlıyormuş.`]);
  const tired = live.filter(e => (e.mood??70) < 45); if (tired.length){ const e = pick(tired); pool.push([2, `${firstName(e)} mutfakta "Artık çok yoruldum" diyordu.`]); }
  const dr = live.filter(e => e.dream && !e.dreamOk && !e.dreamKnown);
  if (dr.length){ const e = pick(dr); pool.push([2, `${firstName(e)} bir gün ${HK_DREAMS[e.dream].kulis} istediğini anlatıyordu.`, () => { e.dreamKnown = true; }]); }
  if (live.length >= 2){ const [a, b] = live.slice().sort(() => Math.random() - 0.5);
    pool.push([1, `${firstName(a)} ile ${firstName(b)} öğle yemeğinde çok iyi anlaşıyorlarmış.`]);
    pool.push([1, `${firstName(a)}, ${firstName(b)} adlı arkadaşının kodlarını çok beğendiğini söylüyordu.`]); }
  pool.push([1, `Rakip ${pick(RIVALS).n} yeni bir ürün hazırlıyormuş, herkes merak ediyor.`]);
  pool.push([1, 'Kahve makinesi yine tıkanmış, sabah herkes söylendi.']);
  const act = S.prods.filter(p => p.active); if (act.length){ const p = pick(act); pool.push([1, `${esc(p.name)} için kullanıcılar forumlarda hararetli tartışıyormuş.`]); }
  const g = hkPickW(pool); if (g[2]) g[2](); hkGossip(g[1]);
}
function kulisHTML(){
  const g = (hkSt().gossip || []).slice(0, 6);
  return `<div class="pxpanel hkkulis" style="margin-bottom:12px"><div class="npey">OFİS KULİSİ</div>
    ${g.length ? g.map(x => `<div class="hkg"><span>${x.d}. gün</span><p>${x.t}</p></div>`).join('') : '<p class="pxsub" style="margin:4px 0 0">Henüz kulağına bir şey gelmedi. Ofiste konuşulanlar burada birikir: kim kaytarıyor, kim ayrılmayı düşünüyor, kimin hayali ne…</p>'}</div>`;
}

/* ---------------- 2) ÇALIŞAN HAYALLERİ ---------------- */
const HK_DREAMS = {
  lider: {ad:'Takım lideri olmak', kulis:'takım lideri olmak', ok:e => !!e.lead},
  uzman: {ad:'Bir alanda uzman olmak', kulis:'bir alanda uzmanlaşmak', ok:e => !!e.spec},
  konf:  {ad:'Bir konferansta konuşmak', kulis:'büyük bir konferansta konuşmak', ok:e => !!e.konfDone},
  ogren: {ad:'3 yeni dil ya da beceri öğrenmek', kulis:'yeni teknolojiler öğrenmek', ok:e => (e.know||[]).length >= 3},
  oyun:  {ad:'Kendi oyununu yapmak', kulis:'kendi oyununu yapmak', ok:e => !!e.gameDone},
  efsane:{ad:'90+ kaliteli bir ürünün parçası olmak', kulis:'efsane bir ürünün parçası olmak', ok:e => !!e.legend},
  usta:  {ad:'Mesleğinde usta olmak (yetenek 9)', kulis:'mesleğinde usta olmak', ok:e => e.skill >= 9},
};
function hkDreamDay(){
  for (const e of S.emps){
    if (!e.dream){ const ks = Object.keys(HK_DREAMS).filter(k => !HK_DREAMS[k].ok(e)); e.dream = ks.length ? pick(ks) : 'usta'; }
    if (!e.dreamOk && HK_DREAMS[e.dream].ok(e)){
      e.dreamOk = true; e.dreamKnown = true; e.loyal = true; e.flight = null; e.mood = clamp((e.mood??70) + 25, 5, 100);
      toast(`${firstName(e)} hayaline ulaştı: ${HK_DREAMS[e.dream].ad}! Artık şirkete çok sadık.`); snd('ok');
    }
  }
}

/* ---------------- 3) İSTİFA SİNYALLERİ ---------------- */
STAFF_NOTES.gorusme = {ok:() => false, subject:'Müsait olduğunda konuşabilir miyiz?',
  lines:e => ['Patron,', 'Son zamanlarda kafamda bazı şeyler var. Müsait olduğunda birebir konuşabilir miyiz?', 'Önemli bir konu.'],
  replies:[{ad:'Hemen konuşalım', txt:n => `${n}, tabii. Odama gel, seni dinliyorum.`, fx:e => { if (Math.random() < 0.55){ e.flight = null; moodOne(e, 15); toast(`${firstName(e)} içini döktü, rahatladı. Kalmaya karar verdi.`); } else toast(`${firstName(e)} ile konuştunuz ama hâlâ kararsız görünüyor.`); }},
           {ad:'Zam teklif et (%20)', txt:n => `${n}, seni kaybetmek istemem. Maaşına %20 zam yapıyorum.`, fx:e => { e.salary = round10(e.salary*1.2); e.flight = null; moodOne(e, 20); toast(`${firstName(e)} zammı kabul etti ve kalıyor.`); }},
           {ad:'Sonra konuşuruz', txt:n => `${n}, şu an çok yoğunum, sonra konuşalım.`, fx:e => moodOne(e, -6)}]};
STAFF_NOTES.istifa = {ok:() => false, subject:'İstifa mektubu', lines:e => ['Patron,', 'Uzun süredir düşünüyordum ve başka bir şirketten gelen teklifi kabul etmeye karar verdim.', 'Burada çok şey öğrendim, her şey için teşekkür ederim. Bugün son günüm.'],
  replies:[{ad:'İyi şanslar dile', txt:n => `${n}, seni özleyeceğiz. Yolun açık olsun.`, fx:() => moodAll(1)},
           {ad:'Kısa teşekkür', txt:n => `Teşekkürler ${n}.`, fx:() => {}},
           {ad:'Sitem et', txt:n => `${n}, bunu bize yaptığına inanamıyorum.`, fx:() => moodAll(-2)}]};
function hkMail(e, tpl, extra){
  const N = STAFF_NOTES[tpl];
  const m = Object.assign({id:S.idSeq++, kind:'not', tpl, day:S.day, eid:e.id, from:e.name, role:e.role, emo:e.emo, subject:N.subject, lines:[], answered:null, read:false}, extra||{});
  m.lines = N.lines(e, m); S.inbox = [m].concat(S.inbox||[]).slice(0, 40);
  toast(`${firstName(e)} sana bir e-posta gönderdi: “${N.subject}”`); snd('event');
  return m;
}
function hkFlightDay(){
  for (const e of [...S.emps]){
    if (e.loyal){ e.flight = null; continue; }
    e.lowD = (e.mood??70) < 38 ? (e.lowD||0) + 1 : 0;
    const unhappyDream = e.dream && !e.dreamOk && S.day - (e.since||0) > 240 && (e.mood??70) < 55;
    if (!e.flight && (e.lowD >= 6 || unhappyDream) && Math.random() < 0.2) e.flight = {d:S.day, step:0};
    const f = e.flight; if (!f) continue;
    const age = S.day - f.d;
    if ((e.mood??70) >= 78 && age > 2 && Math.random() < 0.25){ e.flight = null; continue; }
    if (f.step === 0 && age >= 3){ f.step = 1; hkGossip(`${firstName(e)} telefonda başka bir şirketle iş görüşmesi ayarlıyormuş.`); }
    else if (f.step === 1 && age >= 7){ f.step = 2; hkMail(e, 'gorusme'); }
    else if (f.step === 2 && age >= 14){
      const m = hkMail(e, 'istifa'); m.answered = null;
      hkLeave(e, `${esc(e.name)} istifa etti ve ayrıldı. Sinyalleri kaçırdın…`); snd('bad');
    }
  }
}
// çalışan menüsü: sinyaller ve hayal
function empStoryHTML(e){
  const hints = [];
  if (e.flight){ const st = e.flight.step; hints.push(st >= 2 ? 'Son günlerde çok sessiz, sık sık telefonla dışarı çıkıyor. Ayrılmayı düşünüyor olabilir!' : 'Son zamanlarda biraz içine kapandı.'); }
  if ((e.lowD||0) >= 3 && !e.flight) hints.push('Bir süredir mutsuz görünüyor.');
  const D = HK_DREAMS[e.dream];
  const dream = !D ? '' : e.dreamOk ? `<b class="green">${D.ad}</b> · hayaline ulaştı, sadık` : e.dreamKnown ? `<b>${D.ad}</b>` : '<span class="mut">Bilinmiyor · birebir konuşarak öğren</span>';
  return `<div class="hkemp">${dream ? `<div><span class="mut">Hayali:</span> ${dream}</div>` : ''}${hints.map(h => `<div class="hkwarn">${h}</div>`).join('')}</div>`;
}
function talkRow(e){
  const wait = Math.max(0, (e.talkD||0) + 10 - S.day);
  return `<button class="erow good" data-act="ev" data-k="talk" data-id="${e.id}" ${wait ? 'disabled' : ''}><b>Birebir konuş</b><small>${wait ? `${wait} gün sonra tekrar konuşabilirsin` : 'Nasıl olduğunu sor, hayalini öğren, sorunları çöz'}</small><span class="echev">›</span></button>`;
}
function hkTalk(e){
  e.talkD = S.day; const D = HK_DREAMS[e.dream], n = firstName(e);
  let say;
  if (e.flight) say = `"Açık konuşayım patron... Başka bir yerden teklif aldım ve düşünüyorum. Burada kendimi geliştiremiyormuşum gibi hissediyorum."`;
  else if ((e.mood??70) < 45) say = `"Açıkçası son zamanlarda çok yoruldum patron. Biraz nefes almaya ihtiyacım var."`;
  else say = `"Her şey yolunda patron, sorduğun için teşekkürler!"`;
  if (D && !e.dreamOk) say += ` <br><span class="mut">Hayali:</span> "Bir gün ${D.kulis} istiyorum."`;
  e.dreamKnown = true;
  curChoices = [
    () => { e.salary = round10(e.salary*1.15); e.flight = null; moodOne(e, 18); toast(`${n} zamma çok sevindi. Kalıyor!`); snd('ok'); },
    () => { e.task = {type:'izin', until:S.day + 4}; sceneKey = ''; if (Math.random() < 0.7) e.flight = null; moodOne(e, 10); toast(`${n} 4 günlük izne çıktı, dinlenip dönecek.`); },
    () => { moodOne(e, e.flight ? 4 : 6); if (e.flight && Math.random() < 0.35) e.flight = null; toast(`${n} dinlendiğini hissetti.`); },
  ];
  showModal('', `<div class="ehead">${hkAv(e)}<div class="grow"><div class="npey">BİREBİR GÖRÜŞME</div><h3>${esc(e.name)}</h3></div></div>
    <p class="hksay">${say}</p>
    <div class="cezagrid">
      <button class="act" data-act="choice" data-i="0"><b>Maaşına %15 zam</b><small>${tl(e.salary)} → ${tl(round10(e.salary*1.15))} · çok sevinir</small></button>
      <button class="act" data-act="choice" data-i="1"><b>4 gün izin ver</b><small>Dinlenip döner · moral +10</small></button>
      <button class="act" data-act="choice" data-i="2"><b>Teşekkür et, dinle</b><small>Kendini değerli hisseder</small></button>
      <button class="act" data-act="close"><b>Görüşmeyi bitir</b><small>Bir şey yapmadan kapat</small></button>
    </div>`, 'pro');
}

/* ---------------- 4) RAKİP TRANSFER TEKLİFLERİ ---------------- */
function hkPoachDay(force){
  const s = hkSt();
  if (s.nextPoach == null) s.nextPoach = S.day + 40;
  if (!force && (S.day < s.nextPoach || S.emps.length < 3 || !hkFree())) return;
  s.nextPoach = S.day + 35 + hkRand(30);
  // ara sıra tersine: rakipten yıldız aday
  if (!force && S.rep >= 40 && Math.random() < 0.3){
    const R = pick(RIVALS), c = genCand(); c.skill = 9 + hkRand(2); c.salary = round10(salaryFor(c.skill)*1.3); c.from = R.n;
    S.cands.unshift(c); hkGossip(`${R.n} şirketinin yıldız çalışanı ${esc(c.name)} bize geçmek istiyormuş! Personel sayfasında aday olarak bekliyor.`); return;
  }
  const e = S.emps.filter(x => !isAway(x)).sort((a,b) => b.skill - a.skill)[0]; if (!e) return;
  const R = pick(RIVALS), n = firstName(e);
  if (e.loyal){ moodOne(e, 3); toast(`${R.n}, ${n} adlı çalışanına transfer teklifi yaptı ama ${n} reddetti: "Benim yerim burası!"`); return; }
  const offer = round10(e.salary*1.4), stay = clamp(((e.mood??70) - 35)/60, 0.1, 0.9) + (e.dreamKnown ? 0.1 : 0);
  curChoices = [
    () => { e.salary = round10(e.salary*1.25); if (Math.random() < 0.85){ moodOne(e, 10); toast(`${n} karşı teklifini kabul etti ve kalıyor!`); snd('ok'); } else { hkLeave(e, `${n} karşı teklife rağmen ${R.n} şirketine geçti.`); snd('bad'); } },
    () => { if (Math.random() < stay){ moodOne(e, 6); toast(`${n} ikna oldu: "Haklısın patron, burada mutluyum."`); snd('ok'); } else { hkLeave(e, `${n} ikna olmadı ve ${R.n} şirketine geçti.`); snd('bad'); } },
    () => { S.rep += 1; hkLeave(e, `${n} ${R.n} şirketine geçti. Ona yolun açık olsun dedin.`); },
  ];
  showModal('', `<div class="ehead">${hkAv(e)}<div class="grow"><div class="npey">TRANSFER TEKLİFİ</div><h3>${R.n}, ${esc(e.name)} için geldi</h3></div></div>
    <p class="hksay">"Patron, ${R.n} bana maaşımın %40 fazlasını (${tl(offer)}/ay) teklif etti. Ne yapmamı istersin?"</p>
    <div class="cezagrid">
      <button class="act" data-act="choice" data-i="0"><b>Karşı teklif (%25 zam)</b><small>${tl(round10(e.salary*1.25))}/ay · büyük ihtimalle kalır</small></button>
      <button class="act" data-act="choice" data-i="1"><b>İkna etmeye çalış</b><small>Zam yok · morali yüksekse kalır (şans %${Math.round(stay*100)})</small></button>
      <button class="act" data-act="choice" data-i="2"><b>Gitmesine izin ver</b><small>Ayrılır · +1 itibar</small></button>
    </div>`, 'pro');
}

/* ---------------- 5) GECE 03:00 KRİZLERİ ---------------- */
const HK_CRISES = [
  {id:'cokme', t:p => `Gece 03:12. <b>${esc(p.name)}</b> sunucuları çöktü! ${fmt(p.users)} kullanıcı uygulamaya giremiyor ve şikâyetler yağmaya başladı.`},
  {id:'sizinti', need:() => !hasInv('guvenlik'), t:p => `Gece 02:47. <b>${esc(p.name)}</b> veritabanında bir güvenlik açığı bulundu! Kullanıcı bilgileri risk altında.`},
  {id:'odeme', t:p => `Gece 04:05. <b>${esc(p.name)}</b> ödeme sistemi hatalı çalışıyor, bazı kullanıcılardan iki kez ücret alınıyor!`},
];
function hkCrisisDay(force){
  const s = hkSt();
  if (s.nextCrisis == null) s.nextCrisis = S.day + 25;
  if (!force && (S.day < s.nextCrisis || !hkFree())) return;
  const act = S.prods.filter(p => p.active && p.users > 300);
  if (!act.length){ if (!force) s.nextCrisis = S.day + 10; return; }
  s.nextCrisis = S.day + 30 + hkRand(25);
  const p = act.sort((a,b) => b.users - a.users)[hkRand(Math.min(2, act.length))], C = pick(HK_CRISES.filter(c => !c.need || c.need()));
  if (S.os && S.os.shield){ S.os.shield = false; toast(`Gece ${esc(p.name)} sunucularında sorun çıktı ama sunucu yedekleme hizmeti krizi sen uyurken çözdü.`); return; }
  const fixP = Math.min(0.9, 0.35 + founderSkill()*0.06), mc = teamCost(0.05);
  const lose = k => { p.peak = Math.round(p.peak*k); p.users = Math.round(p.users*k); };
  curChoices = [
    () => { if (Math.random() < fixP){ exS().night = true; S.rep += 2; toast('Sabaha kadar uğraştın ve düzelttin. Kullanıcılar neredeyse fark etmedi! +2 itibar'); snd('ok'); } else { lose(0.9); S.rep = Math.max(0, S.rep - 1); toast('Tek başına yetişemedin. Kullanıcıların bir kısmı ürünü bıraktı.'); snd('bad'); } },
    () => { moodAll(-6); S.rep += 1; toast('Ekibi uyandırdın, sorun bir saatte çözüldü. Ekip uykusuz ama işini yaptı. +1 itibar'); snd('ok'); },
    () => { S.money -= mc; toast(`Yöneticin nöbetçi ekibi devreye soktu, sorun çözüldü (−${tl(mc)}).`); snd('ok'); },
    () => { lose(C.id==='sizinti' ? 0.7 : 0.8); S.rep = Math.max(0, S.rep - (C.id==='sizinti' ? 6 : 3)); if (C.id==='sizinti') hkRisk('sizinti', 0.4, 15); toast('Sabahı bekledin. Bu arada pek çok kullanıcı ürünü sildi ve itibarın zedelendi.'); snd('bad'); },
  ];
  curChoices = curChoices.map(f => () => { if (window.S3D && S3D.alarm) S3D.alarm(false); f(); });
  if (window.S3D && S3D.alarm) S3D.alarm(true);
  snd('bad'); setTimeout(() => snd('bad'), 500); setTimeout(() => snd('bad'), 1000);
  const show = () => { if (page || !$('modal').classList.contains('hidden')){ setTimeout(show, 700); return; } showModal('', `<div class="hknight"><div class="npey">GECE KRİZİ</div><h3>Telefonun çalıyor…</h3><p>${C.t(p)}</p></div>
    <div class="cezagrid">
      <button class="act" data-act="choice" data-i="0"><b>Kendim düzeltirim</b><small>Başarı şansı %${Math.round(fixP*100)} (yeteneğine bağlı)</small></button>
      <button class="act" data-act="choice" data-i="1" ${S.emps.length ? '' : 'disabled'}><b>Ekibi uyandır</b><small>Kesin çözülür · ekip morali −6</small></button>
      <button class="act" data-act="choice" data-i="2" ${S.mgr && S.money >= mc ? '' : 'disabled'}><b>Yönetici halletsin</b><small>${S.mgr ? tl(mc) + ' · kimse uyanmaz' : 'Yöneticin yok'}</small></button>
      <button class="act" data-act="choice" data-i="3"><b>Sabahı bekle</b><small>Kullanıcı ve itibar kaybı</small></button>
    </div>`, 'pro hkcrisis'); };
  setTimeout(show, 1800);
}

/* ---------------- 6) CANLI KULLANICI YORUMLARI ---------------- */
const HK_HANDLES = ['kodcu','mert','oyunsever','tekno','ayse','devci','gamer','kedisever','gezgin','futbolsever','kahvesever','yazilimci','gece_kusu','minimalist','ogrenci','annem_kullaniyor'];
const HK_COM = {
  5:['Bayıldım, telefonumdan silmiyorum!', 'Uzun zamandır bu kadar iyisini görmemiştim.', 'Ekibe teşekkürler, emek her yerinden belli oluyor.', 'Arkadaşlarıma önerdim, hepsi indirdi.'],
  4:['Arayüz tertemiz, her şey hızlı.', 'Çok güzel olmuş, birkaç küçük eksik var sadece.', 'Fiyatına göre gayet başarılı.'],
  3:['Fikir güzel ama biraz daha cilalanması lazım.', 'Bazen takılıyor ama idare eder.', 'Fena değil, güncellemeleri bekliyorum.'],
  2:['Hatalar can sıkıyor, düzeltin lütfen.', 'Beklediğim gibi çıkmadı.', 'Yükleme ekranında takılıp kalıyor.'],
  1:['Sürekli çöküyor, sinir oldum.', 'Bu kadar hata olur mu ya? Sildim.', 'Parasını verdiğime pişman oldum.'],
};
function hkComments(pr, q, tf, af, trd){
  const base = q >= 82 ? 5 : q >= 66 ? 4 : q >= 50 ? 3 : q >= 36 ? 2 : 1, T = TYPES[pr.type], top = pr.topic ? TOPICS[pr.topic].ad : '';
  const out = [], add = (s, t) => out.push({h:'@' + pick(HK_HANDLES) + (10 + hkRand(89)), s, t, l:hkRand(40) + (s >= 4 ? 30 : 5)});
  if (tf >= 1.1 && top) add(Math.min(5, base + 1), `Tam da böyle bir ${top.toLowerCase()} ${T.ad.toLowerCase()} arıyordum!`);
  if (tf < 0.95 && top) add(Math.max(1, base - 1), `${top} temasıyla ${T.ad.toLowerCase()} pek olmamış bence.`);
  if (trd > 1) add(base, 'Herkes bundan bahsediyor, ben de denedim!');
  if (af > 1) add(Math.min(5, base + 1), 'Benim gibi kullanıcılar için düşünülmüş, çok iyi.');
  for (let k = 0; out.length < 6 && k < 40; k++){ const s = clamp(base + hkRand(3) - 1, 1, 5), t = pick(HK_COM[s]); if (!out.some(c => c.t === t)) add(s, t); }
  return out.sort((a,b) => b.l - a.l);
}
function hkCommentsMenu(pid){
  const p = S.prods.find(x => x.id===pid); if (!p || !p.comments) return;
  const avg = p.comments.reduce((a,c) => a + c.s, 0) / p.comments.length;
  showModal('', `<div class="npey">KULLANICI YORUMLARI</div><h3 style="margin:2px 0 2px">${esc(p.name)}</h3>
    <div class="pxmeta" style="margin-bottom:8px">${hkStars(Math.round(avg))} ortalama ${avg.toFixed(1).replace('.', ',')}/5 · ${fmt(p.users)} kullanıcı</div>
    <div class="hkfeed">${p.comments.map(c => `<div class="hkc"><div class="hkch"><b>${c.h}</b>${hkStars(c.s)}<span>${c.l} beğeni</span></div><p>${c.t}</p></div>`).join('')}</div>
    ${exReqHTML(p)}<button class="btn teal block" data-act="close">Kapat</button>`, 'pro');
}
function hkBuzzDay(){
  const s = hkSt(), b = s.buzz; if (!b || S.day < b.d || !hkFree()) return;
  s.buzz = null; const p = S.prods.find(x => x.id===b.pid && x.active); if (!p) return;
  if (b.k === 'viral'){
    p.viral = 7; S.rep += 3; snd('cash');
    showModal('', `<div class="npey">SOSYAL MEDYA</div><h3>${esc(p.name)} viral oldu!</h3><p class="sub" style="text-align:center">Ünlü bir içerik üreticisi ürününü paylaştı ve indirmeler patladı. 7 gün boyunca kullanıcı sayısı ikiye katlanıyor. +3 itibar</p><button class="btn block" data-act="close">Harika!</button>`, 'pro');
  } else {
    const c = Math.round(updCost(p)*0.5);
    curChoices = [
      () => { S.money -= c; p.q = Math.min(100, p.q + 5); p.peak = Math.round(p.peak*1.05); S.rep += 1; toast('Özür dileyip hızlı bir güncelleme çıkardın. Kullanıcılar bunu takdir etti.'); snd('ok'); },
      () => { S.rep = Math.max(0, S.rep - 1); toast('Açıklama yaptın; tepkiler biraz yatıştı.'); },
      () => { S.rep = Math.max(0, S.rep - 4); p.peak = Math.round(p.peak*0.75); toast('Sessiz kaldın. Tepki büyüdü, kullanıcılar ürünü bırakıyor.'); snd('bad'); },
    ];
    showModal('', `<div class="npey" style="color:#c2410c">SOSYAL MEDYA KRİZİ</div><h3>#${esc(p.name).replace(/\s+/g, '')}Bozuk gündemde!</h3>
      <p class="sub" style="text-align:center">Kullanıcılar ürünündeki hataları paylaşıp alay ediyor. Ne yapacaksın?</p>
      <div class="cezagrid">
        <button class="act" data-act="choice" data-i="0" ${S.money >= c ? '' : 'disabled'}><b>Özür + hızlı güncelleme</b><small>${tl(c)} · kalite +5 · +1 itibar</small></button>
        <button class="act" data-act="choice" data-i="1"><b>Açıklama yap</b><small>−1 itibar</small></button>
        <button class="act" data-act="choice" data-i="2"><b>Sessiz kal</b><small>−4 itibar · kullanıcı kaybı</small></button>
      </div>`, 'pro');
  }
}

/* ---------------- 7) ETİK KISA YOLLAR ---------------- */
function hkRisk(k, p, days){ const s = hkSt(); (s.risks = s.risks || []).push({k, p, d:S.day + days + hkRand(days)}); }
function hkEthicsDay(force){
  const s = hkSt();
  if (s.nextEth == null) s.nextEth = Math.max(S.day + 30, 60);
  if (!force && (S.day < s.nextEth || !hkFree())) return;
  s.nextEth = S.day + 55 + hkRand(30);
  const hasProd = S.prods.some(p => p.active), R = pick(RIVALS);
  const offers = [
    hasProd && {k:'veri', t:'Veri Avcısı A.Ş.', d:'Ürünlerinin kullanıcı verilerini (e-postalar, alışkanlıklar) satın almak istiyoruz. Kimse fark etmez, söz.', gain:Math.max(200000, Math.round(prodIncome()*25/1000)*1000)},
    {k:'yorum', t:'Yıldız Yorum Ajansı', d:'Sonraki ürününe 5.000 sahte beş yıldızlı yorum yazarız. İndirmeler uçar!', cost:Math.max(50000, round10(valuation()*0.002))},
    {k:'kod', t:`${R.n} eski çalışanı`, d:`${R.n} şirketinin kaynak kodlarını sana satabilirim. Sonraki ürünlerin çok daha iyi olur.`, cost:Math.max(100000, round10(valuation()*0.004))},
  ].filter(Boolean);
  const o = pick(offers);
  curChoices = [
    () => { if (o.gain){ S.money += o.gain; hkRisk('veri', 0.55, 25); toast(`Verileri sattın: +${tl(o.gain)}. Umarım kimse öğrenmez…`); }
      else { S.money -= o.cost; if (o.k === 'yorum'){ s.fakeRev = true; hkRisk('yorum', 0.4, 30); toast('Sahte yorumlar sonraki ürününde devreye girecek.'); } else { s.stolenQ = S.day + 60; hkRisk('kod', 0.5, 30); toast('Kodları aldın. 60 gün boyunca ürünlerin +6 kalite.'); } }
      snd('cash'); },
    () => { exS().honest = true; S.rep += 2; moodAll(3); toast('Teklifi reddettin. Ekip, patronlarının dürüstlüğüyle gurur duydu. +2 itibar'); snd('ok'); },
  ];
  showModal('', `<div class="npey" style="color:#7c3aed">GİZLİ TEKLİF</div><h3>${o.t}</h3><p class="hksay">"${o.d}"</p>
    <div class="cezagrid">
      <button class="act" data-act="choice" data-i="0" ${o.cost && S.money < o.cost ? 'disabled' : ''}><b>Kabul et</b><small>${o.gain ? '+' + tl(o.gain) : tl(o.cost)} · ama ileride ortaya çıkabilir</small></button>
      <button class="act" data-act="choice" data-i="1"><b>Reddet</b><small>+2 itibar · ekip gurur duyar</small></button>
    </div>`, 'pro');
}
function hkRiskDay(){
  const s = hkSt(); if (!s.risks || !s.risks.length || !hkFree()) return;
  const r = s.risks.find(x => S.day >= x.d); if (!r) return;
  s.risks = s.risks.filter(x => x !== r);
  if (Math.random() > r.p) return;              // şanslıydın, ortaya çıkmadı
  const loss = Math.max(8, Math.round(S.rep*0.12));
  S.rep = Math.max(0, S.rep - loss); moodAll(-8);
  let txt = '';
  if (r.k === 'veri' || r.k === 'sizinti'){ for (const p of S.prods) if (p.active){ p.peak = Math.round(p.peak*0.8); } txt = 'Gazeteler, kullanıcı verilerinin izinsiz satıldığını ortaya çıkardı. Kullanıcılar ürünlerini silmeye başladı.'; }
  else if (r.k === 'yorum') txt = 'Sahte yorum ağı ortaya çıktı! Şirketin "sahte yorum skandalı" ile gündemde.';
  else { const fine = Math.max(500000, round10(valuation()*0.03)); S.money -= fine; txt = `Rakip şirket çalıntı kod yüzünden dava açtı ve kazandı. ${tl(fine)} tazminat ödedin.`; }
  snd('bad');
  showModal('', `<div class="npey" style="color:#dc2626">SKANDAL</div><h3>Geçmişin peşini bırakmadı</h3><p class="sub" style="text-align:center">${txt}<br><b>−${loss} itibar</b> · ekip morali −8</p><button class="btn block" data-act="close">Anladım</button>`, 'pro');
}

/* ---------------- 8) YÖNETİM KURULU ---------------- */
function hkBoardDay(){
  if (typeof syncOwnership === 'function') syncOwnership();
  const s = hkSt();
  if ((S.ownership ?? 100) >= 100){ s.board = null; return; }
  if (!s.board){ s.board = {start:S.day, base:valuation(), target:Math.round(valuation()*1.08)}; hkGossip(`Yönetim kurulu bu çeyrek şirket değerinin ${tl(s.board.target)} olmasını bekliyor (90 gün).`); return; }
  const b = s.board; if (S.day - b.start < 90 || !hkFree()) return;
  const v = valuation(), ok = v >= b.target;
  s.board = {start:S.day, base:v, target:Math.round(v*1.08)};
  if (ok){ S.rep += 3; moodAll(3); snd('ok');
    showModal('', `<div class="npey">YÖNETİM KURULU</div><h3>Kurul çok memnun!</h3><p class="sub" style="text-align:center">Hedefi tutturdun: şirket değeri ${tl(v)}. Kurul sana güveniyor. +3 itibar<br>Yeni çeyrek hedefi: <b>${tl(s.board.target)}</b></p><button class="btn block" data-act="close">Teşekkürler</button>`, 'pro');
    return; }
  curChoices = [
    () => { S.boost = Math.max(S.boost||0, 10); moodAll(-10); toast('Kurulun isteğiyle fazla mesai başladı: 10 gün daha hızlı ama ekip gergin.'); },
    () => { for (const e of S.emps) e.noRaise = S.day + 60; moodAll(-5); toast('Zamlar 60 gün donduruldu.'); },
    () => { S.rep = Math.max(0, S.rep - 3); toast('Kurula karşı çıktın. Basında "patron ile kurul arasında gerginlik" haberleri çıktı. −3 itibar'); },
  ];
  showModal('', `<div class="npey" style="color:#c2410c">YÖNETİM KURULU</div><h3>Kurul memnun değil</h3>
    <p class="sub" style="text-align:center">Hedef ${tl(b.target)} idi, şirket değeri ${tl(v)}. Kurul önlem almanı istiyor.</p>
    <div class="cezagrid">
      <button class="act" data-act="choice" data-i="0"><b>Fazla mesai</b><small>10 gün %20 hızlı · moral −10</small></button>
      <button class="act" data-act="choice" data-i="1"><b>Zamları dondur</b><small>60 gün zam yok · moral −5</small></button>
      <button class="act" data-act="choice" data-i="2"><b>Kurula karşı çık</b><small>−3 itibar</small></button>
    </div>`, 'pro');
}
function boardHTML(){
  const b = hkSt().board; if (!b || (S.ownership ?? 100) >= 100) return '';
  const v = valuation(), pct = clamp((v - b.base)/Math.max(1, b.target - b.base), 0, 1);
  return `<div class="card"><b>Yönetim kurulu hedefi</b><div class="sub">${90 - (S.day - b.start)} gün içinde şirket değeri ${tl(b.target)} olmalı · şu an ${tl(v)}</div>
    <div class="mini" style="height:8px;margin-top:6px"><i style="width:${Math.round(pct*100)}%;background:${pct >= 1 ? '#16a34a' : 'var(--o5)'}"></i></div></div>`;
}

/* ---------------- 9) YILLIK TEKNOLOJİ ÖDÜLLERİ ---------------- */
function hkAwardsDay(force){
  const s = hkSt(), y = Math.floor(S.day/360);
  if (!force && (S.day % 360 !== 0 && !(s.awardDue && s.awardDue === y))) return;
  if (!hkFree() && !force){ s.awardDue = y; return; }
  if (!force && s.awardYear === y) return;
  s.awardYear = y; s.awardDue = null;
  const mine = S.prods.filter(p => S.day - (p.day||0) <= 360).sort((a,b) => b.q - a.q)[0];
  const rq = () => 68 + hkRand(26), rn = () => { const ty = pick(Object.keys(NAMES)); return pick(NAMES[ty][0]) + ' ' + pick(NAMES[ty][1]); };
  const cats = [];
  if (mine){ const rv = [0,1,2].map(() => ({n:rn(), c:pick(RIVALS).n, q:rq()})); const best = Math.max(...rv.map(r => r.q));
    cats.push({ad:'Yılın Ürünü', noms:[{n:mine.name, c:S.name, me:true}].concat(rv), win:mine.q > best, winner:mine.q > best ? mine.name : rv.find(r => r.q === best).n}); }
  const rank = myRank(), rv3 = RIVALS.slice().sort(() => Math.random() - 0.5).slice(0, 3), top = rv3.slice().sort((a,b) => rivalVal(b) - rivalVal(a))[0];
  cats.push({ad:'Yılın Şirketi', noms:[{n:S.name, me:true}].concat(rv3.map(r => ({n:r.n}))), win:rank <= 2, winner:rank <= 2 ? S.name : top.n});
  if (S.emps.length >= 3){ const rv2 = RIVALS.slice().sort(() => Math.random() - 0.5).slice(0, 2);
    cats.push({ad:'En Mutlu Ekip', noms:[{n:S.name, me:true}].concat(rv2.map(r => ({n:r.n}))), win:teamMood() >= 78, winner:teamMood() >= 78 ? S.name : rv2[0].n}); }
  const wins = cats.filter(c => c.win), prize = Math.max(250000, round10(valuation()*0.005));
  if (wins.length){ S.rep += 8*wins.length; S.money += prize*wins.length; moodAll(8); S.awards = (S.awards||[]).concat(wins.map(c => ({y:y, ad:c.ad}))); }
  showModal('', `<div class="hkaward"><div class="npey">${y}. YIL · BYTETOWN TEKNOLOJİ ÖDÜLLERİ</div><h3>Ödül töreni</h3>
    ${cats.map((c, i) => `<div class="hkcat" style="animation-delay:${0.3 + i*0.6}s"><b>${c.ad}</b><div class="hknoms">${c.noms.map(n => `<span class="${n.me ? 'me' : ''}">${esc(n.n)}</span>`).join('')}</div>
      <div class="hkwin ${c.win ? 'ok' : ''}" style="animation-delay:${0.8 + i*0.6}s">Kazanan: <b>${esc(c.winner)}</b></div></div>`).join('')}
    <p class="hkares">${wins.length ? `${wins.length} ödül kazandın! +${8*wins.length} itibar · ${tl(prize*wins.length)} ödül parası · ekip morali +8` : 'Bu yıl ödül çıkmadı. Seneye daha iyi ürünlerle tekrar dene!'}</p>
    <button class="btn block lg" data-act="close">${wins.length ? 'Kutlayalım!' : 'Seneye görüşürüz'}</button></div>`, 'hkawardm');
  snd(wins.length ? 'cash' : 'event');
}

/* ---------------- 10) BYTETOWN ŞEHİR HARİTASI ---------------- */
function cityMapHTML(){
  const list = rvActive().map(r => ({n:r.n, v:rivalVal(r)})).concat([{n:S.name, v:valuation(), me:true}]).sort((a,b) => a.v - b.v);
  const lv = list.map(x => Math.log10(Math.max(1e4, x.v))), mn = Math.min(...lv), mx = Math.max(...lv);
  const W = 64, gap = 10, H0 = 250, n = list.length, VW = n*(W + gap) + 30;
  let svg = '';
  list.forEach((x, i) => {
    const h = 46 + (mx > mn ? (Math.log10(Math.max(1e4, x.v)) - mn)/(mx - mn) : 0.5)*150, X = 20 + i*(W + gap), Y = H0 - h;
    const body = x.me ? '#ffcf5a' : '#2a4b9b', side = x.me ? '#e0a53a' : '#1d3a80';
    svg += `<rect x="${X}" y="${Y}" width="${W}" height="${h}" rx="4" fill="${body}"/><rect x="${X + W - 10}" y="${Y}" width="10" height="${h}" rx="3" fill="${side}" opacity=".85"/>`;
    for (let r = Y + 12; r < H0 - 10; r += 16) for (let c = X + 8; c < X + W - 16; c += 13) svg += `<rect x="${c}" y="${r}" width="6" height="7" rx="1" fill="${x.me ? '#fff3cf' : (hkRand(3) ? '#ffd27a' : '#3e5fb0')}"/>`;
    if (x.me){ svg += `<rect x="${X + W/2 - 1.5}" y="${Y - 22}" width="3" height="22" fill="#ffcf5a"/><circle cx="${X + W/2}" cy="${Y - 25}" r="5" fill="#fff3cf"/>`;
      (S.awards||[]).slice(-4).forEach((a, k) => { svg += `<circle cx="${X + 10 + k*15}" cy="${Y - 8}" r="5.5" fill="#f5b301" stroke="#fff" stroke-width="1.5"/>`; }); }
    const nm = x.n.length > 11 ? x.n.slice(0, 10) + '…' : x.n;
    svg += `<text x="${X + W/2}" y="${H0 + 15}" text-anchor="middle" font-size="10" font-weight="800" fill="${x.me ? '#ffcf5a' : '#c8d5f2'}">${esc(nm)}</text>`;
  });
  return `<div class="hkcity"><div class="npey" style="color:#ffd27a">BYTETOWN ŞEHİR HARİTASI</div><p>Şirketler değerlerine göre yükselir. Altın bina senin; kazandığın ödüller tepesinde parlar.</p>
    <div class="hkcityw"><svg viewBox="0 0 ${VW} 280" preserveAspectRatio="xMidYMax meet"><rect x="0" y="${H0}" width="${VW}" height="40" fill="#0b1a40"/>${svg}</svg></div></div>`;
}

/* ---------------- GÜNLÜK DÖNGÜ, YAYIN, EYLEMLER ---------------- */
function storyDay(){
  if (!S || S.meeting) return;
  hkDreamDay(); hkFlightDay(); hkGossipDay();
  hkAwardsDay(); hkBoardDay(); hkRiskDay(); hkBuzzDay(); hkCrisisDay(); hkPoachDay(); hkEthicsDay();
}
function storyRelease(p, q, pr, tf, af, trd){
  const s = hkSt();
  for (const e of S.emps){ if (!p.cs || !p.cs[e.id]) continue; if (p.type === 'oyun') e.gameDone = true; if (q >= 90) e.legend = true; }
  if (!pr) return;
  if (s.fakeRev){ s.fakeRev = false; pr.peak = Math.round(pr.peak*1.25); }
  pr.comments = hkComments(pr, q, tf || 1, af || 1, trd || 1);
  setTimeout(() => toast(`${esc(pr.name)} için ilk kullanıcı yorumları geldi. Ürünlerim sayfasında oku.`), 1800);
  if (q < 50 && Math.random() < 0.45) s.buzz = {pid:pr.id, k:'lin', d:S.day + 3 + hkRand(4)};
  else if (q >= 85 && Math.random() < 0.35) s.buzz = {pid:pr.id, k:'viral', d:S.day + 2 + hkRand(4)};
}
function evAct(el){
  const k = el.dataset.k, id = +el.dataset.id;
  if (k === 'talk'){ const e = S.emps.find(x => x.id===id); if (e){ closeModal(); hkTalk(e); } }
  else if (k === 'yorum') hkCommentsMenu(id);
}
// test paneli için: olayları hemen tetikle
function storyForce(k){
  closeModal(); if (page) closePage();
  if (k === 'kulis') hkGossipDay(true);
  else if (k === 'transfer') hkPoachDay(true);
  else if (k === 'kriz') hkCrisisDay(true);
  else if (k === 'etik') hkEthicsDay(true);
  else if (k === 'odul') hkAwardsDay(true);
  else if (k === 'istifa'){ const e = S.emps.find(x => !x.loyal); if (e){ e.flight = {d:S.day - 7, step:1}; hkFlightDay(); } }
  else if (k === 'viral' || k === 'lin'){ const p = S.prods.find(x => x.active); if (!p){ toast('Yayında ürün yok.'); return; } hkSt().buzz = {pid:p.id, k, d:S.day}; hkBuzzDay(); }
  else if (k === 'acil' || k === 'yalanci'){ if (!S.emps.length){ toast('Çalışan yok.'); return; } if (k === 'yalanci'){ const e = S.emps.find(x => x.liar) || S.emps[0]; e.liar = true; for (const x of S.emps) if (x !== e) x.acilP = 0.01; } S.inbox = (S.inbox||[]).filter(m => !(m.tpl === 'acil' && mailNeedsReply(m))); S.nextAcil = S.day; acilDay(); }
  else if (k === 'kurul'){ const s = hkSt(); if ((S.ownership ?? 100) < 100){ if (!s.board) hkBoardDay(); s.board.start = S.day - 90; hkBoardDay(); } else toast('Yönetim kurulu için önce hisse satmalısın.'); }
}
