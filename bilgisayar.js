/* =====================================================================
   Bytetown – BİLGİSAYARIM (Bytetown OS)
   İşBağ (profesyonel ağ: profiller, e-posta, iş teklifi, işe alma),
   Tarayıcı (haber, pazar, rakip siteleri, kendi sitemiz),
   Portfolyo (yapılan bütün işler kalıcı olarak saklanır), Posta kısayolu.
   Ana betikle ad çakışmasın diye yardımcılar os / OS_ önekiyle adlandırıldı.
   ===================================================================== */
let osView = {app:'home'};
const osR = n => Math.floor(Math.random()*n);
const osAscii = s => String(s).toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]+/g,'');
const osDomain = c => osAscii(c.replace(/\b(A\.Ş\.|Holding|Teknoloji|Yazılım|Bilişim|Labs|Soft|Dijital)\b/g, '')) + '.com';
const OS_ICON = {
  isbag:'<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#e85d3a"/><path d="M15 31L24 15L33 31Z" fill="none" stroke="#fff" stroke-width="2.6" stroke-opacity=".7"/><circle cx="24" cy="15" r="5.5" fill="#fff"/><circle cx="14" cy="32" r="5.5" fill="#fff"/><circle cx="34" cy="32" r="5.5" fill="#ffd27a"/></svg>',
  web:'<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0f766e"/><circle cx="24" cy="24" r="13" fill="none" stroke="#fff" stroke-width="3"/><path d="M11 24h26M24 11c5 5 5 21 0 26M24 11c-5 5-5 21 0 26" fill="none" stroke="#fff" stroke-width="2.4"/></svg>',
  port:'<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#b45309"/><rect x="11" y="15" width="26" height="20" rx="3" fill="#fff"/><path d="M18 15v-3h12v3" fill="none" stroke="#fff" stroke-width="3"/><rect x="11" y="22" width="26" height="3" fill="#b45309"/></svg>',
  store:'<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#4f46e5"/><rect x="11" y="11" width="11" height="11" rx="3" fill="#fff"/><rect x="26" y="11" width="11" height="11" rx="3" fill="#ffd27a"/><rect x="11" y="26" width="11" height="11" rx="3" fill="#a5b4fc"/><rect x="26" y="26" width="11" height="11" rx="3" fill="#fff"/></svg>',
  posta:'<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#7c3aed"/><rect x="10" y="15" width="28" height="19" rx="3" fill="#fff"/><path d="M11 17l13 10 13-10" fill="none" stroke="#7c3aed" stroke-width="2.6"/></svg>',
};
const OS_APPS = [['isbag','İşBağ'], ['store','ByteStore'], ['web','Tarayıcı'], ['port','Portfolyo'], ['posta','Posta']];

/* ---------------- İşBağ: kişiler ---------------- */
const OS_TITLES = {prog:['Yazılım Geliştirici','Kıdemli Programcı','Backend Mühendisi','Mobil Geliştirici'], tas:['UI Tasarımcı','Ürün Tasarımcısı','UX Uzmanı','Görsel Tasarımcı'], test:['Test Mühendisi','Kalite Uzmanı','QA Analisti']};
function osPerson(open){
  const role = pick(['prog','prog','tas','tas','test']), skill = clamp(3 + osR(8), 1, 10), id = S.idSeq++;
  const comp = open ? null : pick(RIVALS).n;
  return {id, name:randName(), role, skill, emo:pick(ROLES[role].emo), comp, open:!!open, yrs:1 + osR(12), title:pick(OS_TITLES[role]),
          sal:round10(salaryFor(skill)*(0.95 + Math.random()*0.35)), loyal:open ? 0.1 : 0.25 + Math.random()*0.5, sk:genSkills(role, skill, id*7 + 3), know:[], mood:72};
}
function osNet(){
  const s = (S.os = S.os || {});
  if (!s.net){ s.net = []; for (let i = 0; i < 16; i++) s.net.push(osPerson(i < 5)); s.netDay = S.day; }
  return s.net;
}
const osOurs = () => S.emps.map(e => ({id:e.id, name:e.name, role:e.role, skill:e.skill, emo:e.emo, comp:S.name, mine:true, open:!!(e.flight && e.flight.step >= 1), yrs:Math.max(1, Math.round((S.day - (e.since||0))/360)), title:pick(OS_TITLES[e.role]), sal:e.salary, sk:e.sk, know:e.know||[], e}));
const osMail = p => osAscii(p.name.split(' ')[0]) + '.' + osAscii(p.name.split(' ')[1] || 'x') + '@' + (p.comp ? osDomain(p.comp) : 'eposta.com');
function osDay(){
  if (!S) return;
  const s = (S.os = S.os || {}), net = osNet();
  // ağ yavaşça değişir: insanlar şirket değiştirir, yeni iş arayanlar gelir
  if (S.day - (s.netDay||0) >= 20){ s.netDay = S.day;
    for (let i = 0; i < 3; i++){ const k = osR(net.length), p = net[k];
      if (Math.random() < 0.5){ const old = p.comp || 'iş arayışında'; p.comp = pick(RIVALS).n; p.open = false; osFeed(`${p.name}, ${old === 'iş arayışında' ? '' : old + ' şirketinden ayrılıp '}${p.comp} şirketinde ${p.title} olarak başladı.`); }
      else { p.comp = null; p.open = true; osFeed(`${p.name} yeni fırsatlara açık olduğunu duyurdu. #işarıyorum`); } }
    if (net.length < 22){ const np = osPerson(Math.random() < 0.5); net.push(np); } }
  // gönderilen tekliflere cevap
  for (const o of (s.offers||[])){
    if (o.st !== 'bekliyor' || S.day < o.due) continue;
    const p = net.find(x => x.id === o.pid); if (!p){ o.st = 'yok'; continue; }
    const ratio = o.sal / p.sal, ofc = S.office*0.06 + Math.min(0.25, S.rep/800);
    let ch = (p.open ? 0.45 : 0.12) + (ratio - 1)*1.4 + ofc - (p.skill >= 8 ? 0.12 : 0) - (p.comp ? p.loyal*0.35 : 0);
    ch = clamp(ch, 0.03, 0.95);
    if (Math.random() < ch){ o.st = 'kabul'; o.reply = `Merhaba ${S.boss || 'Patron'}, teklifiniz için çok teşekkürler! ${p.comp ? p.comp + ' şirketinden ayrılmaya' : 'Ekibinize katılmaya'} hazırım. Ne zaman başlayabilirim?`; }
    else if (ratio < 1.25 && Math.random() < 0.5){ o.st = 'pazarlik'; o.ask = round10(p.sal*(1.25 + Math.random()*0.15)); o.reply = `Merhaba, ilginiz için teşekkürler. Şu an ${tl(o.sal)} benim için yeterli değil ama ${tl(o.ask)}/ay olursa ciddi düşünürüm.`; }
    else { o.st = 'red'; o.reply = p.comp ? `Merhaba, teklifiniz için teşekkürler ama ${p.comp} şirketinde mutluyum. Başarılar dilerim.` : 'Merhaba, teşekkür ederim ama başka bir teklifi kabul ettim. Başarılar!'; }
    o.rday = S.day; s.unread = (s.unread||0) + 1;
    toast(`İşBağ: ${esc(p.name)} mesajına cevap verdi.`); snd('event');
  }
}
function osFeed(t){ const s = (S.os = S.os || {}); (s.feed = s.feed || []).unshift({d:S.day, t}); if (s.feed.length > 20) s.feed.pop(); }
function osProfile(p){
  const s = S.os || {}, found = (s.mails||{})[p.id], off = (s.offers||[]).filter(o => o.pid === p.id).pop();
  const head = `<div class="osprof"><div class="osbanner"></div><div class="osph"><span class="osav">${avatarSVG(p.id, p.role, p.emo)}</span>
    <div><h3>${esc(p.name)}</h3><div class="ostitle">${p.title}${p.comp ? ' · ' + esc(p.comp) : ''}</div>
    <div class="osmeta">${p.yrs} yıl deneyim · Bytetown${p.open ? ' · <span class="osopen">Yeni fırsatlara açık</span>' : ''}</div></div></div></div>`;
  let act = '';
  if (p.mine) act = `<div class="osnote">Bu kişi senin ekibinde.${p.open ? ' Profiline "yeni fırsatlara açık" eklemiş… Ayrılmayı düşünüyor olabilir!' : ''}</div>`;
  else if (off && off.st === 'bekliyor') act = `<div class="osnote">Teklifin gönderildi (${tl(off.sal)}/ay). Cevap bekleniyor…</div>`;
  else if (off && off.st === 'kabul') act = `<div class="osnote ok">Teklifini kabul etti! Mesajlar sekmesinden işe alabilirsin.</div>`;
  else if (!found) act = `<button class="btn block" data-act="os" data-k="mailbul" data-id="${p.id}">E-posta adresini bul</button>`;
  else act = `<div class="osmail">E-posta: <b>${osMail(p)}</b></div><div class="pxlbl">İş teklifi gönder (şu anki maaşı yaklaşık ${tl(p.sal)}/ay)</div>
      <div class="osoffers">${[1.05, 1.2, 1.4].map((k, i) => `<button class="act" data-act="os" data-k="teklif" data-id="${p.id}" data-v="${k}"><b>${['Aynı seviye','İyi teklif','Çok cömert'][i]}</b><small>${tl(round10(p.sal*k))}/ay</small></button>`).join('')}</div>`;
  const known = (p.know||[]).map(k => LEARN_BY[k] ? LEARN_BY[k].ad : '').filter(Boolean);
  return `<button class="osback" data-act="os" data-k="isbag">‹ İşBağ</button>${head}
    <div class="ossec"><b>Hakkında</b><p>${p.mine ? 'Bytetown\'da ' + esc(S.name) + ' ekibinde çalışıyor.' : p.comp ? esc(p.comp) + ' şirketinde ' + p.title + ' olarak çalışıyor.' : 'Yeni bir pozisyon arıyor.'} Genel yetenek ${p.skill}/10.${known.length ? ' Bildikleri: ' + known.join(', ') + '.' : ''}</p></div>
    <div class="ossec"><b>Yetenekler</b>${p.sk ? skillRows(p) : ''}</div>
    <div class="ossec">${act}</div>`;
}
function osIsbag(){
  const s = (S.os = S.os || {}), tab = osView.tab || 'kisi', net = osNet();
  if (osView.pid){ const p = net.find(x => x.id === osView.pid) || osOurs().find(x => x.id === osView.pid); if (p) return osProfile(p); }
  const tabs = [['kisi','Kişiler'], ['akis','Akış'], ['msg','Mesajlar' + (s.unread ? ` (${s.unread})` : '')]].map(([k, a]) => `<button class="chip ${tab===k?'on':''}" data-act="os" data-k="tab" data-v="${k}">${a}</button>`).join('');
  let body = '';
  if (tab === 'kisi'){
    const f = osView.f || 'hepsi';
    const list = (f === 'ekip' ? osOurs() : f === 'acik' ? net.filter(p => p.open) : f === 'rakip' ? net.filter(p => p.comp) : net.concat(osOurs()));
    body = `<div class="chips" style="margin:0 0 8px">${[['hepsi','Hepsi'], ['acik','İş arayanlar'], ['rakip','Rakip çalışanları'], ['ekip','Benim ekibim']].map(([k, a]) => `<button class="chip ${f===k?'on':''}" data-act="os" data-k="f" data-v="${k}">${a}</button>`).join('')}</div>
      <div class="osgrid">${list.map(p => `<button class="oscard" data-act="os" data-k="prof" data-id="${p.id}"><span class="osav sm">${avatarSVG(p.id, p.role, p.emo)}</span><b>${esc(p.name)}</b><small>${p.title}</small><small class="osc">${p.mine ? 'Senin ekibin' : p.comp ? esc(p.comp) : 'İş arıyor'}</small>${p.open ? '<i class="osdot">Açık</i>' : ''}</button>`).join('')}</div>`;
  } else if (tab === 'akis'){
    const feed = (s.feed || []).slice(0, 12), auto = [`${pick(RIVALS).n} yeni ofisine taşındı ve 20 kişilik alım yapacağını duyurdu.`, `Bytetown'da bu ay en çok aranan beceri: ${pick(LEARN).ad}.`];
    body = `<div class="osfeed">${feed.concat(feed.length < 4 ? auto.map(t => ({d:S.day, t})) : []).map(x => `<div class="ospost"><span>${x.d}. gün</span><p>${x.t}</p></div>`).join('')}</div>`;
  } else {
    s.unread = 0;
    const offs = (s.offers || []).slice().reverse();
    body = offs.length ? offs.map(o => { const p = net.find(x => x.id === o.pid); if (!p) return '';
      const btn = o.st === 'kabul' ? `<button class="btn sm" data-act="os" data-k="ise" data-v="${o.id}">İşe al · ${tl(round10(o.sal*0.5))} giriş</button>`
        : o.st === 'pazarlik' ? `<button class="btn sm" data-act="os" data-k="kabul" data-v="${o.id}">${tl(o.ask)}/ay kabul et</button>` : '';
      return `<div class="osmsg"><div class="osmh"><span class="osav sm">${avatarSVG(p.id, p.role, p.emo)}</span><b>${esc(p.name)}</b><span class="ost ${o.st}">${{bekliyor:'Cevap bekleniyor', kabul:'Kabul etti', pazarlik:'Pazarlık', red:'Reddetti', alindi:'Ekipte', yok:'—'}[o.st]}</span></div>
        <p class="osme">Sen: ${tl(o.sal)}/ay teklif ettin.</p>${o.reply ? `<p>${o.reply}</p>` : ''}${btn}</div>`; }).join('')
      : '<p class="pxsub">Henüz kimseye mesaj atmadın. Kişiler sekmesinden bir profil aç, e-postasını bul ve teklif gönder.</p>';
  }
  return `<div class="oshead"><b>İşBağ</b><span>Bytetown'un profesyonel ağı</span></div><div class="chips" style="margin:0 0 10px">${tabs}</div>${body}`;
}

/* ---------------- Tarayıcı ---------------- */
const OS_SHOP = [
  {id:'kahve', ad:'Premium kahve çekirdeği', acik:'Ofise bir aylık özel kahve · herkesin morali +6', k:0.05, fx:() => moodAll(6)},
  {id:'bitki', ad:'Ofis bitkileri seti', acik:'Yeşil bir ofis · moral +3', k:0.02, fx:() => moodAll(3)},
  {id:'konsol', ad:'Oyun konsolu', acik:'Dinlenme köşesine konsol · moral +8', k:0.08, fx:() => moodAll(8)},
  {id:'kurs', ad:'Online kurs paketi', acik:'En zayıf 2 çalışan +1 yetenek', k:0.15, fx:() => { const w = S.emps.filter(e => e.skill < 10).sort((a,b) => a.skill - b.skill).slice(0, 2); for (const e of w) e.skill++; toast(w.length + ' çalışanın yeteneği arttı.'); }},
  {id:'reklam', ad:'Sosyal medya reklam paketi', acik:'Sonraki ürününe %15 daha fazla kullanıcı', k:0.1, fx:() => { (S.os = S.os || {}).adBoost = true; }},
  {id:'yedek', ad:'Sunucu yedekleme hizmeti', acik:'Bir sonraki gece krizini sen uyurken otomatik çözer', k:0.06, fx:() => { (S.os = S.os || {}).shield = true; }},
];
const osShopCost = it => Math.max(5000, round10(teamCost(it.k)));
function osRivalProds(r){
  let seed = 0; for (const ch of r.n) seed = (seed*31 + ch.charCodeAt(0)) % 99991;
  const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647, out = [];
  for (let i = 0; i < 4; i++){ const ty = Object.keys(NAMES)[Math.floor(rnd()*4)]; out.push({n:NAMES[ty][0][Math.floor(rnd()*8)] + ' ' + NAMES[ty][1][Math.floor(rnd()*8)], ty, st:3 + Math.floor(rnd()*3)}); }
  return out;
}
function osWeb(){
  const site = osView.site || 'haber', mine = osDomain(S.name);
  const bm = [['haber','haber.bytetown'], ['pazar','pazar.bytetown'], ['mine', mine]].concat(RIVALS.slice(-4).map(r => ['r:' + r.n, osDomain(r.n)]));
  const url = (bm.find(b => b[0] === site) || [0, site.startsWith('r:') ? osDomain(site.slice(2)) : ''])[1];
  let body = '';
  if (site === 'haber'){
    const news = [];
    { const W = typeof cyWorld === 'function' && cyWorld(); if (W) news.push([`Gündem: ${W.ad}`, W.acik + '.']); }
    const last = S.prods[0]; if (last) news.push([`${esc(S.name)}, "${esc(last.name)}" ile kullanıcıların karşısına çıktı`, `Yeni ${TYPES[last.type].ad.toLowerCase()} şu an ${fmt(last.users)} kullanıcıya ulaştı.`]);
    if (S.trend && TOPICS[S.trend]) news.push([`Bu ayın trendi: ${TOPICS[S.trend].ad}`, 'Bu konuda ürün çıkaran şirketlerin kullanıcı sayısı patlıyor.']);
    const top = RIVALS.slice().sort((a,b) => rivalVal(b) - rivalVal(a));
    news.push([`${top[0].n} piyasa değerinde rekor kırdı`, `Şirketin değeri ${tl(rivalVal(top[0]))} seviyesine ulaştı.`]);
    news.push([`Sıralama: ${esc(S.name)} ${myRank()}. sırada`, `Şirket değeri ${tl(valuation())}. Rakiplerle fark kapanıyor mu?`]);
    if ((S.awards||[]).length) news.push([`${esc(S.name)} teknoloji ödüllerinde`, `Şirket bugüne kadar ${S.awards.length} ödül kazandı.`]);
    news.push([`${pick(RIVALS).n} yeni yatırım aldı`, 'Şirket elde ettiği yatırımla yeni projelere başlayacak.']);
    body = `<div class="ossite news"><div class="oslogo">BYTETOWN HABER</div>${news.map((n, i) => `<div class="osnews ${i===0?'big':''}"><b>${n[0]}</b><p>${n[1]}</p></div>`).join('')}</div>`;
  } else if (site === 'pazar'){
    const bought = (S.os && S.os.bought) || {};
    body = `<div class="ossite shop"><div class="oslogo">PAZAR</div><p class="pxsub" style="margin:0 0 8px">Şirketin için alışveriş yap. Her ürün 30 günde bir alınabilir.</p><div class="osshop">${OS_SHOP.map(it => { const c = osShopCost(it), wait = Math.max(0, (bought[it.id]||-99) + 30 - S.day);
      return `<div class="ositem"><b>${it.ad}</b><small>${it.acik}</small><button class="btn sm" data-act="os" data-k="al" data-v="${it.id}" ${wait || S.money < c ? 'disabled' : ''}>${wait ? wait + ' gün sonra' : 'Satın al · ' + tl(c)}</button></div>`; }).join('')}</div></div>`;
  } else if (site === 'mine'){
    body = `<div class="ossite me"><div class="oslogo">${esc(S.name).toUpperCase()}</div><p class="ostag">${title()} · ${S.emps.length + 1} kişilik ekip · ${OFFICES[S.office].ad}</p>
      <div class="pxlbl">Ürünlerimiz</div>${S.prods.length ? `<div class="osprods">${S.prods.slice(0, 8).map(p => `<div class="osprod"><b>${esc(p.name)}</b><small>${TYPES[p.type].ad} · kalite ${p.q}${p.active ? ' · ' + fmt(p.users) + ' kullanıcı' : ' · kapandı'}</small></div>`).join('')}</div>` : '<p class="pxsub">Henüz ürün yok.</p>'}
      <div class="pxlbl">Ekibimiz</div><p class="pxsub">${[S.boss || 'Kurucu'].concat(S.emps.slice(0, 12).map(e => e.name)).map(esc).join(' · ')}</p></div>`;
  } else if (site.startsWith('r:')){
    const r = RIVALS.find(x => x.n === site.slice(2)); if (r){ const ps = osRivalProds(r);
      body = `<div class="ossite rival"><div class="oslogo">${esc(r.n).toUpperCase()}</div><p class="ostag">Şirket değeri ${tl(rivalVal(r))} · Bytetown</p>
        <div class="pxlbl">Ürünleri</div><div class="osprods">${ps.map(p => `<div class="osprod"><b>${esc(p.n)}</b><small>${TYPES[p.ty].ad} · ${'puan ' + p.st + '/5'}</small></div>`).join('')}</div>
        <div class="pxlbl">Kariyer</div><p class="pxsub">${esc(r.n)} çalışanlarını İşBağ'da bulabilir, onlara teklif gönderebilirsin.</p></div>`; }
  }
  return `<div class="osbrowser"><div class="osurl"><span class="osdots"><i></i><i></i><i></i></span><div class="osbar">https://${url}</div></div>
    <div class="osbm">${bm.map(([k, a]) => `<button class="${site===k?'on':''}" data-act="os" data-k="site" data-v="${esc(k)}">${esc(a)}</button>`).join('')}</div>${body}</div>`;
}

/* ---------------- Portfolyo: yapılan bütün işler ---------------- */
function osRecord(p, q, info){
  const h = (S.hist = S.hist || []);
  h.unshift({d:S.day, name:p.name, kind:p.kind === 'is' ? 'is' : 'urun', type:p.type, size:p.size, q:Math.round(q), client:p.client || null, score:info && info.sc != null ? info.sc : null, pay:info && info.pay || 0, pid:info && info.pid || null});
}
function osSeedHist(){
  if (S.histSeeded) return; S.histSeeded = true;
  const h = (S.hist = S.hist || []), have = new Set(h.map(x => x.name + '|' + x.d));
  for (const p of S.prods) if (!have.has(p.name + '|' + p.day)) h.push({d:p.day||0, name:p.name, kind:'urun', type:p.type, size:p.size, q:p.q, pid:p.id});
  for (const m of (S.inbox||[])) if (!m.kind && m.score != null && m.from) h.push({d:m.day, name:m.from, kind:'is', type:m.type, q:m.q, client:m.from, score:m.score, pay:m.pay});
  h.sort((a,b) => b.d - a.d);
}
function osPort(){
  osSeedHist();
  const f = osView.pf || 'hepsi', h = (S.hist||[]).filter(x => f === 'hepsi' || x.kind === f);
  const all = S.hist || [], prods = all.filter(x => x.kind === 'urun'), jobs = all.filter(x => x.kind === 'is');
  const best = all.reduce((a,x) => Math.max(a, x.q||0), 0);
  const earned = (x) => { const p = x.pid != null && S.prods.find(y => y.id === x.pid); return p ? p.earned : x.pay || 0; };
  return `<div class="oshead"><b>Portfolyo</b><span>Bugüne kadar yaptığın bütün işler</span></div>
    <div class="grid4" style="margin-bottom:8px"><div class="kv"><b>${all.length}</b><span>Toplam proje</span></div><div class="kv"><b>${jobs.length}</b><span>Müşteri işi</span></div><div class="kv"><b>${prods.length}</b><span>Kendi ürünün</span></div><div class="kv"><b>${best}</b><span>En iyi kalite</span></div></div>
    <div class="chips" style="margin:0 0 8px">${[['hepsi','Hepsi'], ['is','Müşteri işleri'], ['urun','Ürünler']].map(([k, a]) => `<button class="chip ${f===k?'on':''}" data-act="os" data-k="pf" data-v="${k}">${a}</button>`).join('')}</div>
    ${h.length ? `<div class="osport">${h.map(x => `<div class="osrow"><span class="osk ${x.kind}">${x.kind === 'is' ? 'Müşteri' : 'Ürün'}</span><div class="grow"><b>${esc(x.name)}</b><small>${x.d}. gün · ${TYPES[x.type] ? TYPES[x.type].ad : ''}${x.size && SIZES[x.size] ? ' · ' + SIZES[x.size].ad : ''}${x.score != null ? ' · müşteri puanı ' + x.score + '/10' : ''}</small></div><div class="osq">${x.q != null ? 'Kalite ' + x.q : ''}<small>${tl(earned(x))}</small></div></div>`).join('')}</div>` : '<p class="pxsub">Henüz tamamlanmış bir projen yok. Bitirdiğin her iş burada kalıcı olarak saklanır.</p>'}`;
}


/* ---------------- ByteStore: uygulama mağazası ---------------- */
const osHash = s => { let h = 7; for (const ch of String(s)) h = (h*31 + ch.charCodeAt(0)) % 1000003; return h; };
const OS_TILE = ['#2563eb','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2','#ca8a04','#4f46e5','#dc2626','#0d9488'];
function osAppIcon(name, size){
  const h = osHash(name), c1 = OS_TILE[h % OS_TILE.length], c2 = OS_TILE[(h >> 3) % OS_TILE.length];
  const ini = String(name).split(' ').map(w => w[0] || '').join('').slice(0, 2).toLocaleUpperCase('tr-TR');
  return `<span class="osicon" style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${c1},${c2});font-size:${Math.round(size*0.36)}px">${esc(ini)}</span>`;
}
const osFmtDl = n => n >= 1e6 ? (n/1e6).toFixed(1).replace('.', ',') + ' Mn' : n >= 1e3 ? Math.round(n/1e3) + ' B' : String(Math.round(n));
// bizim uygulamalarımız
function osMine(){
  return S.prods.map(p => {
    if (!p.comments && typeof hkComments === 'function') p.comments = hkComments(p, p.q, 1, 1, 1);
    const cs = p.comments || [], rt = cs.length ? cs.reduce((a,c) => a + c.s, 0)/cs.length : Math.max(1, Math.min(5, p.q/20));
    const dl = Math.round(p.peak*(1.2 + Math.min(p.age||0, 365)/120));
    return {id:'m' + p.id, pid:p.id, name:p.name, dev:S.name, mine:true, type:p.type, topic:p.topic, rt, dl, q:p.q, ver:'v1.' + (p.upd||0), active:p.active, users:p.users, earned:p.earned, comments:cs, day:p.day||0};
  });
}
// rakiplerin uygulamaları (her rakip için sabit, tohumlu)
function osRivalApps(){
  const out = [];
  RIVALS.forEach((r, ri) => {
    let seed = osHash(r.n);
    const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
    const n = 2 + Math.floor(rnd()*2), val = rivalVal(r);
    for (let i = 0; i < n; i++){
      const ty = Object.keys(NAMES)[Math.floor(rnd()*4)], tps = Object.keys(TOPICS), tp = tps[Math.floor(rnd()*tps.length)];
      const name = (TOPICS[tp].w ? TOPICS[tp].w[Math.floor(rnd()*TOPICS[tp].w.length)] : NAMES[ty][0][0]) + ' ' + NAMES[ty][1][Math.floor(rnd()*8)];
      const rt = 2.6 + rnd()*2.3, dl = Math.round(Math.max(3000, val/(2500 + rnd()*3500))*(0.5 + rnd()));
      out.push({id:'r' + ri + '_' + i, name, dev:r.n, type:ty, topic:tp, rt, dl, ver:'v' + (1 + Math.floor(rnd()*4)) + '.' + Math.floor(rnd()*9), seed:osHash(name)});
    }
  });
  return out;
}
function osRivalComments(a){
  let seed = a.seed; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647, out = [];
  const base = Math.round(a.rt);
  for (let i = 0; i < 5; i++){ const s = Math.max(1, Math.min(5, base + Math.floor(rnd()*3) - 1)), L = (typeof HK_COM !== 'undefined' ? HK_COM[s] : ['Güzel uygulama.']);
    out.push({h:'@' + (typeof HK_HANDLES !== 'undefined' ? HK_HANDLES[Math.floor(rnd()*HK_HANDLES.length)] : 'kullanici') + (10 + Math.floor(rnd()*89)), s, t:L[Math.floor(rnd()*L.length)], l:Math.floor(rnd()*80)}); }
  return out;
}
const osStarsH = r => typeof hkStars === 'function' ? hkStars(Math.round(r)) : '';
function osStore(){
  const tab = osView.st || 'top', all = osMine().filter(a => a.active).concat(osRivalApps()).sort((a,b) => b.dl - a.dl);
  if (osView.aid){
    const a = osMine().find(x => x.id === osView.aid) || osRivalApps().find(x => x.id === osView.aid);
    if (a){
      const cs = a.mine ? a.comments : osRivalComments(a), rank = all.findIndex(x => x.id === a.id) + 1;
      const shots = [0,1,2].map(i => { const h = osHash(a.name + i); return `<span class="osshot" style="background:linear-gradient(160deg,${OS_TILE[h % 10]},${OS_TILE[(h >> 4) % 10]})"><i></i><i></i><i></i></span>`; }).join('');
      const p = a.mine && S.prods.find(x => x.id === a.pid);
      return `<button class="osback" data-act="os" data-k="store" data-v="${tab}">‹ ByteStore</button>
        <div class="osapph">${osAppIcon(a.name, 72)}<div><h3>${esc(a.name)}</h3><div class="osdev">${esc(a.dev)}${a.mine ? ' <span class="ostagme">Senin</span>' : ''}</div>
          <div class="osappstats"><div><b>${a.rt.toFixed(1).replace('.', ',')}</b>${osStarsH(a.rt)}</div><div><b>${osFmtDl(a.dl)}</b><small>indirme</small></div><div><b>${rank ? '#' + rank : '—'}</b><small>sıralama</small></div><div><b>${TYPES[a.type] ? TYPES[a.type].ad : ''}</b><small>${a.topic && TOPICS[a.topic] ? TOPICS[a.topic].ad : ''}</small></div></div></div></div>
        <div class="osshots">${shots}</div>
        ${a.mine ? `<div class="ossec"><b>Geliştirici paneli</b><p>Sürüm ${a.ver} · kalite ${a.q} · ${a.active ? fmt(a.users) + ' aktif kullanıcı' : 'yayından kalktı'} · toplam kazanç ${tl(a.earned)}${p && (p.reqs||[]).length ? ' · ' + p.reqs.length + ' kullanıcı isteği bekliyor' : ''}</p></div>` : `<div class="ossec"><b>Hakkında</b><p>${esc(a.dev)} tarafından geliştirilen bir ${TYPES[a.type] ? TYPES[a.type].ad.toLowerCase() : 'uygulama'}. Son sürüm ${a.ver}.</p></div>`}
        <div class="ossec"><b>Kullanıcı yorumları</b><div class="hkfeed" style="max-height:none">${cs.map(c => `<div class="hkc"><div class="hkch"><b>${c.h}</b>${osStarsH(c.s)}<span>${c.l} beğeni</span></div><p>${c.t}</p></div>`).join('') || '<p>Henüz yorum yok.</p>'}</div></div>`;
    }
  }
  const tabs = [['top','En çok indirilenler'], ['mine','Benim uygulamalarım'], ['kat','Kategoriler']].map(([k, a]) => `<button class="chip ${tab===k?'on':''}" data-act="os" data-k="st" data-v="${k}">${a}</button>`).join('');
  const row = (a, i) => `<button class="osapprow" data-act="os" data-k="aid" data-v="${a.id}">${i != null ? `<span class="osrank">${i + 1}</span>` : ''}${osAppIcon(a.name, 46)}<div class="grow"><b>${esc(a.name)}</b><small>${esc(a.dev)}${a.mine ? ' · <span class="ostagme">Senin</span>' : ''}</small><small>${osStarsH(a.rt)} ${a.rt.toFixed(1).replace('.', ',')} · ${osFmtDl(a.dl)} indirme</small></div></button>`;
  let body;
  if (tab === 'mine'){
    const mine = osMine().sort((a,b) => b.day - a.day);
    const tot = mine.reduce((s,a) => s + a.dl, 0), avg = mine.length ? mine.reduce((s,a) => s + a.rt, 0)/mine.length : 0;
    body = mine.length ? `<div class="grid4" style="margin-bottom:8px"><div class="kv"><b>${mine.length}</b><span>Uygulama</span></div><div class="kv"><b>${osFmtDl(tot)}</b><span>Toplam indirme</span></div><div class="kv"><b>${avg.toFixed(1).replace('.', ',')}</b><span>Ortalama puan</span></div><div class="kv"><b>${mine.filter(a => a.active).length}</b><span>Yayında</span></div></div>
      <div class="osapplist">${mine.map(a => row(a)).join('')}</div>` : '<p class="pxsub">Henüz yayınlanmış bir uygulaman yok. Kendi ürününü çıkarınca burada görünecek.</p>';
  } else if (tab === 'kat'){
    const ty = osView.kt || 'mobil';
    body = `<div class="chips" style="margin:0 0 8px">${Object.keys(TYPES).map(k => `<button class="chip ${ty===k?'on':''}" data-act="os" data-k="kt" data-v="${k}">${TYPES[k].ad}</button>`).join('')}</div>
      <div class="osapplist">${all.filter(a => a.type === ty).map((a, i) => row(a, i)).join('') || '<p class="pxsub">Bu kategoride uygulama yok.</p>'}</div>`;
  } else body = `<div class="osapplist">${all.slice(0, 20).map((a, i) => row(a, i)).join('')}</div>`;
  return `<div class="oshead"><b>ByteStore</b><span>Bytetown'un uygulama mağazası</span></div><div class="chips" style="margin:0 0 10px">${tabs}</div>${body}`;
}

/* ---------------- Masaüstü ---------------- */
function osHTML(){
  const app = osView.app, s = S.os || {};
  const dock = OS_APPS.map(([k, a]) => `<button class="osapp ${app===k?'on':''}" data-act="os" data-k="app" data-v="${k}">${OS_ICON[k]}<span>${a}${k==='isbag' && s.unread ? ` <i class="osbadge">${s.unread}</i>` : k==='civil' && typeof smUnread === 'function' && smUnread() ? ` <i class="osbadge">${smUnread()}</i>` : ''}</span></button>`).join('');
  let main;
  if (app === 'isbag') main = osIsbag();
  else if (app === 'web') main = osWeb();
  else if (app === 'port') main = osPort();
  else if (app === 'store') main = osStore();
  else if (app === 'dark' && typeof exDarkHTML === 'function') main = exDarkHTML();
  else if (window.OS_EXT && OS_EXT[app]) main = OS_EXT[app]();

  else main = `<div class="oshome"><div class="oswel">Hoş geldin, ${esc(S.boss || 'Patron')}</div><div class="osdate">${S.day}. gün · ${esc(S.name)}</div>
      <div class="osicons">${OS_APPS.map(([k, a]) => `<button class="osbig" data-act="os" data-k="app" data-v="${k}">${OS_ICON[k]}<span>${a}</span></button>`).join('')}</div></div>`;
  return `<div class="os"><div class="osbarTop"><b>Bytetown OS</b><span>${S.day}. gün</span></div><div class="osbody"><nav class="osdock">${dock}</nav><main class="osmain ${app === 'dark' ? 'dark' : ''}">${main}</main></div></div>`;
}
function osAct(el){
  const k = el.dataset.k, v = el.dataset.v, id = +el.dataset.id, s = (S.os = S.os || {});
  if (k === 'app'){ if (v === 'posta'){ openPage('mesaj'); return; } osView = {app:v}; }
  else if (k === 'isbag'){ osView = {app:'isbag', tab:osView.tab, f:osView.f}; }
  else if (k === 'tab'){ osView.tab = v; osView.pid = null; }
  else if (k === 'f'){ osView.f = v; }
  else if (k === 'prof'){ osView.pid = id; }
  else if (k === 'pf'){ osView.pf = v; }
  else if (k === 'st'){ osView.st = v; osView.aid = null; }
  else if (k === 'kt'){ osView.kt = v; }
  else if (k === 'aid'){ osView.aid = v; }
  else if (k === 'store'){ osView = {app:'store', st:v || 'top', kt:osView.kt}; }
  else if (k === 'site'){ osView.site = v; }
  else if (k === 'dk' || k === 'dkno'){ exDarkAct(k, v); }

  else if (k === 'mailbul'){ (s.mails = s.mails || {})[id] = true; toast('E-posta adresini buldun.'); snd('click'); }
  else if (k === 'teklif'){
    const p = osNet().find(x => x.id === id); if (!p) return;
    const sal = round10(p.sal*(+v));
    (s.offers = s.offers || []).push({id:S.idSeq++, pid:p.id, sal, st:'bekliyor', day:S.day, due:S.day + 1 + osR(3)});
    toast(`${esc(p.name)} adresine iş teklifi gönderildi (${tl(sal)}/ay). Birkaç gün içinde cevap gelir.`); snd('ok');
  }
  else if (k === 'kabul'){ const o = (s.offers||[]).find(x => x.id === +v); if (o && o.st === 'pazarlik'){ o.sal = o.ask; o.st = 'kabul'; o.reply += ' — Anlaştık!'; } }
  else if (k === 'ise'){
    const o = (s.offers||[]).find(x => x.id === +v), net = osNet(), p = o && net.find(x => x.id === o.pid); if (!o || !p || o.st !== 'kabul') return;
    if (S.emps.length >= cap()){ toast('Ofiste yer yok! Daha büyük bir ofise taşınmalısın.'); snd('bad'); return; }
    const fee = round10(o.sal*0.5); if (S.money < fee){ toast('Giriş ücreti için paran yetmiyor.'); snd('bad'); return; }
    S.money -= fee; s.net = net.filter(x => x !== p); o.st = 'alindi';
    S.emps.push({id:p.id, name:p.name, role:p.role, skill:p.skill, salary:o.sal, emo:p.emo, mood:80, sk:p.sk, know:p.know||[], since:S.day});
    sceneKey = ''; osFeed(`${p.name}, ${S.name} ekibine katıldı!`); toast(`${esc(p.name)} ekibe katıldı! Ofiste masasına oturdu.`); snd('ok');
    if (typeof checkGoals === 'function') checkGoals();
  }
  else if (k === 'al'){
    const it = OS_SHOP.find(x => x.id === v), c = it && osShopCost(it), b = (s.bought = s.bought || {});
    if (!it || S.money < c || (b[it.id] != null && S.day - b[it.id] < 30)) return;
    S.money -= c; b[it.id] = S.day; it.fx(); toast(`${it.ad} satın alındı (−${tl(c)}).`); snd('cash');
  }
  /* yeni bir ekrana geçince sayfanın başından göster (içerik kaymış görünmesin) */
  if (['app','isbag','tab','f','prof','pf','site','ise','st','kt','aid','store'].includes(k)){ const pb = $('pBody'); if (pb) pb.scrollTop = 0; }
  renderPage(true);
}
