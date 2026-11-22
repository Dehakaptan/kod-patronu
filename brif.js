'use strict';
/* =====================================================================
   Bytetown – iş brifi, müşteri değerlendirmesi, borsa ve araçlar
   Müşteri işi alınırken oyuncu stil/özellik/öncelik seçer. Teslimde
   müşteri bu seçimlere ve kaliteye göre 10 üzerinden puan verip mesaj yazar.
   ===================================================================== */

const STYLES = {
  kurumsal: {ad:'Kurumsal',        ikon:'🏛️', brief:'Ciddi ve güven veren bir görünüm istiyoruz'},
  samimi:   {ad:'Sıcak & Samimi',  ikon:'🏡', brief:'Sıcak, ev gibi samimi bir hava olsun'},
  minimal:  {ad:'Minimal',         ikon:'⚪', brief:'Sade, temiz ve göz yormayan bir tasarım istiyoruz'},
  eglenceli:{ad:'Renkli & Eğlenceli', ikon:'🎈', brief:'Renkli, neşeli ve eğlenceli olsun'},
  luks:     {ad:'Lüks & Şık',      ikon:'💎', brief:'Şık ve lüks bir his vermeli'},
};
const STYLE_NEAR = {kurumsal:['minimal'], minimal:['kurumsal','luks'], samimi:['eglenceli'], eglenceli:['samimi'], luks:['minimal']};
const PRIOS = {
  hiz:      {ad:'Hız',              ikon:'⚡', brief:'Her şeyin ışık hızında açılması bizim için çok önemli.', ok:'Her şey ışık hızında açılıyor, bayıldık!', bad:'Uygulama çok yavaş açılıyor, müşteriler beklemekten sıkılıyor.'},
  guvenlik: {ad:'Güvenlik',         ikon:'🔐', brief:'Müşteri bilgilerinin güvende olması en büyük önceliğimiz.', ok:'Güvenlik konusunda içimiz rahat, çok sağlam bir iş.', bad:'Güvenliğe yeterince önem verilmemiş, bu bizi gerçekten endişelendiriyor.'},
  gorsel:   {ad:'Görsellik',        ikon:'🎨', brief:'Göz alıcı görsellerle herkesi etkilemek istiyoruz.', ok:'Görseller göz kamaştırıyor, herkes ne kadar güzel olduğunu söylüyor.', bad:'Görsel olarak çok sönük kalmış, beklediğimiz o “vay” etkisi yok.'},
  kolay:    {ad:'Kolay kullanım',   ikon:'👵', brief:'Teknolojiden anlamayan müşterilerimiz de rahatça kullanabilmeli.', ok:'Yaşlı müşterilerimiz bile hiç zorlanmadan kullanıyor, harika.', bad:'Kullanımı çok karışık olmuş, müşteriler sürekli bizi arayıp soruyor.'},
};
const FEAT = {
  siparis:    {ad:'Online sipariş',       ikon:'🛒', need:'müşteriler telefondan kolayca sipariş verebilmeli', t:['web','mobil']},
  rezervasyon:{ad:'Rezervasyon',          ikon:'📅', need:'müşteriler önceden yer ayırtabilmeli', t:['web','mobil']},
  harita:     {ad:'Harita & yol tarifi',  ikon:'📍', need:'insanlar bizi kolayca bulabilmeli', t:['web','mobil']},
  galeri:     {ad:'Fotoğraf galerisi',    ikon:'🖼️', need:'ürünlerimizi güzel fotoğraflarla sergileyebilmeliyiz', t:['web','mobil']},
  randevu:    {ad:'Online randevu',       ikon:'🗓️', need:'online randevu alınabilmeli', t:['web','mobil']},
  blog:       {ad:'Blog & duyurular',     ikon:'📰', need:'duyurularımızı ve haberlerimizi paylaşabilmeliyiz', t:['web']},
  uyelik:     {ad:'Üyelik sistemi',       ikon:'👤', need:'kullanıcılar kendi hesabını açabilmeli', t:['web','mobil']},
  odeme:      {ad:'Kartla ödeme',         ikon:'💳', need:'kartla güvenli ödeme alabilmeliyiz', t:['web','mobil']},
  cokdil:     {ad:'Çoklu dil',            ikon:'🌍', need:'yabancı ziyaretçiler de rahatça anlayabilmeli', t:['web','mobil']},
  destek:     {ad:'Canlı destek',         ikon:'💬', need:'müşterilere anında cevap verebilmeliyiz', t:['web','mobil']},
  takip:      {ad:'Kargo takibi',         ikon:'📦', need:'müşteriler kargolarının nerede olduğunu anlık görebilmeli', t:['web','mobil']},
  bildirim:   {ad:'Anlık bildirim',       ikon:'🔔', need:'kampanyalarımızı anında duyurabilmeliyiz', t:['mobil']},
  qr:         {ad:'QR kod okuyucu',       ikon:'🔳', need:'QR kodla hızlıca işlem yapılabilmeli', t:['mobil']},
  skor:       {ad:'Skor tablosu',         ikon:'🏆', need:'oyuncular birbirleriyle yarışabilmeli', t:['oyun']},
  cokoyunculu:{ad:'Çok oyunculu',         ikon:'👥', need:'arkadaşlarıyla birlikte oynayabilmeliler', t:['oyun']},
  hikaye:     {ad:'Hikâye modu',          ikon:'📖', need:'markamızın hikâyesini anlatan bir mod olmalı', t:['oyun']},
  gorev:      {ad:'Günlük görevler',      ikon:'🎯', need:'oyuncular her gün geri gelmek istemeli', t:['oyun']},
  magaza:     {ad:'Oyun içi mağaza',      ikon:'🛍️', need:'oyunun içinde ürünlerimiz satılabilmeli', t:['oyun']},
  karakter:   {ad:'Karakter tasarlama',   ikon:'🧑‍🎤', need:'oyuncular kendi karakterini yaratabilmeli', t:['oyun']},
  sohbetbot:  {ad:'Sohbet botu',          ikon:'🤖', need:'müşteri sorularını yapay zekâ cevaplayabilmeli', t:['ai']},
  tahmin:     {ad:'Satış tahmini',        ikon:'📈', need:'gelecek ayın satışlarını tahmin edebilmeli', t:['ai']},
  ozet:       {ad:'Belge özetleme',       ikon:'📄', need:'uzun belgeleri saniyeler içinde özetleyebilmeli', t:['ai']},
  oneri:      {ad:'Kişisel öneriler',     ikon:'💡', need:'her müşteriye özel öneriler sunabilmeli', t:['ai']},
  ses:        {ad:'Sesli asistan',        ikon:'🎙️', need:'konuşarak kullanılabilmeli', t:['ai']},
  gorsel:     {ad:'Görsel tanıma',        ikon:'👁️', need:'fotoğraflardaki nesneleri tanıyabilmeli', t:['ai']},
};
const SECTORS = {
  restoran: {yer:'restoranımız',  pool:['siparis','rezervasyon','harita','galeri','bildirim','qr']},
  hukuk:    {yer:'büromuz',       pool:['randevu','blog','destek','uyelik','bildirim']},
  perakende:{yer:'mağazamız',     pool:['siparis','odeme','galeri','uyelik','bildirim','qr']},
  turizm:   {yer:'işletmemiz',    pool:['rezervasyon','cokdil','galeri','harita','odeme']},
  egitim:   {yer:'okulumuz',      pool:['uyelik','blog','randevu','bildirim','cokdil']},
  saglik:   {yer:'eczanemiz',     pool:['siparis','harita','randevu','bildirim','destek']},
  lojistik: {yer:'şirketimiz',    pool:['takip','uyelik','destek','bildirim','qr']},
  spor:     {yer:'salonumuz',     pool:['randevu','uyelik','odeme','bildirim','galeri']},
  tarim:    {yer:'firmamız',      pool:['siparis','galeri','harita','destek','odeme']},
  guzellik: {yer:'dükkânımız',    pool:['randevu','galeri','siparis','bildirim','odeme']},
  otomotiv: {yer:'bayimiz',       pool:['galeri','randevu','destek','odeme']},
  emlak:    {yer:'ofisimiz',      pool:['galeri','harita','destek','cokdil']},
  kamu:     {yer:'kurumumuz',     pool:['cokdil','uyelik','blog','destek','bildirim']},
};
const CLIENT_LIST = [
  {ad:'Lezzet Lokantası', s:'restoran', st:'samimi', f:'kolay'},
  {ad:'Bulut Kafe', s:'restoran', st:'eglenceli', f:'gorsel'},
  {ad:'Deniz Balıkçılık', s:'restoran', st:'samimi', f:'hiz'},
  {ad:'Demir Hukuk Bürosu', s:'hukuk', st:'kurumsal', f:'guvenlik'},
  {ad:'Atlas Sigorta', s:'hukuk', st:'kurumsal', f:'guvenlik'},
  {ad:'Yıldız Market', s:'perakende', st:'eglenceli', f:'hiz'},
  {ad:'Kardeşler Mobilya', s:'perakende', st:'minimal', f:'gorsel'},
  {ad:'Altın Kuyumculuk', s:'perakende', st:'luks', f:'guvenlik'},
  {ad:'Mavi Turizm', s:'turizm', st:'eglenceli', f:'gorsel'},
  {ad:'Vali Konağı Müzesi', s:'turizm', st:'luks', f:'kolay'},
  {ad:'Çınar Okulları', s:'egitim', st:'kurumsal', f:'kolay'},
  {ad:'Güneş Eczanesi', s:'saglik', st:'minimal', f:'guvenlik'},
  {ad:'Anadolu Lojistik', s:'lojistik', st:'minimal', f:'hiz'},
  {ad:'Ufuk Kargo', s:'lojistik', st:'kurumsal', f:'hiz'},
  {ad:'Zirve Spor Salonu', s:'spor', st:'eglenceli', f:'hiz'},
  {ad:'Ekin Tarım', s:'tarim', st:'samimi', f:'kolay'},
  {ad:'Toros Un Fabrikası', s:'tarim', st:'kurumsal', f:'kolay'},
  {ad:'Lale Kuaför', s:'guzellik', st:'luks', f:'gorsel'},
  {ad:'Kardelen Çiçekçilik', s:'guzellik', st:'samimi', f:'gorsel'},
  {ad:'Kuzey Otomotiv', s:'otomotiv', st:'kurumsal', f:'gorsel'},
  {ad:'Marmara Emlak', s:'emlak', st:'luks', f:'gorsel'},
  {ad:'Belediye Bilgi İşlem', s:'kamu', st:'kurumsal', f:'kolay'},
];
const TYPE_POOL = {oyun:['skor','cokoyunculu','hikaye','gorev','magaza','karakter'], ai:['sohbetbot','tahmin','ozet','oneri','ses','gorsel']};

/* ---------- brif üretimi ---------- */
function makeBrief(cl, type){
  const pool = (type==='web' || type==='mobil') ? SECTORS[cl.s].pool.filter(f => FEAT[f].t.includes(type)) : TYPE_POOL[type];
  const want = [];
  const p = pool.slice();
  while (want.length < 2 && p.length){ want.push(p.splice(Math.floor(Math.random()*p.length),1)[0]); }
  // seçenek listesi: istenenler + birkaç yanıltıcı seçenek, karışık sırada
  const all = Object.keys(FEAT).filter(f => FEAT[f].t.includes(type) && !want.includes(f));
  const opts = want.slice();
  while (opts.length < 6 && all.length){ opts.push(all.splice(Math.floor(Math.random()*all.length),1)[0]); }
  opts.sort(() => Math.random()-0.5);
  const contact = pick(FIRST) + ' ' + pick(LAST_I) + '.';
  return {st:cl.st, f:cl.f, want, opts, s:cl.s, contact};
}
function briefText(o){
  const b = o.brief, T = TYPES[o.type], sec = SECTORS[b.s];
  const what = {web:'yeni bir web sitesi', mobil:'bir mobil uygulama', oyun:'markamıza özel bir oyun', ai:'yapay zekâ destekli bir sistem'}[o.type];
  return `Merhaba! ${sec.yer[0].toUpperCase()+sec.yer.slice(1)} için ${what} istiyoruz. ${STYLES[b.st].brief}. Mutlaka ${FEAT[b.want[0]].need}${b.want[1]?`, ayrıca ${FEAT[b.want[1]].need}`:''}. ${PRIOS[b.f].brief}`;
}

/* ---------- puanlama ve müşteri mesajı ---------- */
function briefFit(p){
  const b = p.brief, c = p.cfg;
  if (!b || !c) return {fit:0.7, st:1, feats:[], miss:[], extra:[], f:1};
  const st = c.st===b.st ? 1 : (STYLE_NEAR[b.st]||[]).includes(c.st) ? 0.5 : 0;
  const hit = b.want.filter(w => c.feats.includes(w));
  const miss = b.want.filter(w => !c.feats.includes(w));
  const extra = c.feats.filter(f => !b.want.includes(f));
  const f = c.f===b.f ? 1 : 0;
  const fit = 0.3*st + 0.45*(hit.length/b.want.length) + 0.25*f;
  return {fit, st, hit, miss, extra, f};
}
function reviewScore(p, q){
  const r = briefFit(p);
  let sc = (r.fit*6 + (q/100)*4);
  if (p.minQ && q < p.minQ) sc -= 1.5;
  const late = Math.max(0, S.day - p.deadline);
  sc -= Math.min(3, late*0.15);
  if (p.brief && LEARN.some(it => it.rev===p.brief.f && teamKnows(it.id))) sc += 0.5;
  return {score: Math.round(clamp(sc, 0, 10)*10)/10, r, late};
}
function reviewLetter(p, q, R){
  const b = p.brief, c = p.cfg, T = TYPES[p.type], sc = R.score, r = R.r;
  const L = [];
  L.push(`Merhaba ${esc(S.name)} ekibi,`);
  if (sc >= 9) L.push(`Açıkçası beklentilerimizin çok üzerinde bir iş çıkardınız! ${T.ad} yayına girer girmez müşterilerimizden harika yorumlar almaya başladık.`);
  else if (sc >= 7) L.push(`Teslim ettiğiniz ${T.ad.toLowerCase()} için teşekkür ederiz, genel olarak çok memnunuz.`);
  else if (sc >= 5) L.push(`Projeyi teslim aldık. Bazı yerleri güzel olmuş ama birkaç konuda hayal kırıklığı yaşadık.`);
  else L.push(`Maalesef teslim ettiğiniz iş istediğimiz gibi olmamış. Size güvenmiştik.`);
  if (b && c){
    if (r.st === 1) L.push(`${STYLES[c.st].ad} tasarım tam hayal ettiğimiz gibi; ${SECTORS[b.s].yer} tam olarak bu havayı yansıtıyor.`);
    else if (r.st === 0.5) L.push(`Tasarım fena değil ama biz daha çok ${STYLES[b.st].ad.toLowerCase()} bir hava istemiştik.`);
    else L.push(`Biz ${STYLES[b.st].ad.toLowerCase()} bir tasarım istemiştik, siz ${STYLES[c.st].ad.toLowerCase()} bir şey yapmışsınız. Bu kesinlikle bizim tarzımız değil.`);
    for (const w of r.hit) L.push(`${FEAT[w].ikon} ${FEAT[w].ad} özelliği harika çalışıyor, tam istediğimiz gibi.`);
    for (const w of r.miss) L.push(`Brifte açıkça “${FEAT[w].need}” demiştik. Bunun için ${FEAT[w].ad.toLocaleLowerCase('tr-TR')} gerekiyordu ama eklememişsiniz, bunu nasıl atladınız anlamadık.`);
    for (const w of r.extra) L.push(`${FEAT[w].ad} eklemişsiniz; ihtiyacımız yoktu ama yine de teşekkürler.`);
    L.push(r.f ? PRIOS[b.f].ok : PRIOS[b.f].bad);
  }
  if (q >= 75) L.push('İşçilik çok kaliteli, neredeyse hiç hata görmedik.');
  else if (q >= 50) L.push('Birkaç küçük hata çıktı ama idare edilebilir.');
  else L.push('Bir sürü hata var, sürekli bir şeyler bozuluyor. Bu kabul edilemez.');
  if (R.late > 0) L.push(`Ayrıca teslimat ${R.late} gün gecikti, bu bizi müşterilerimize karşı zor durumda bıraktı.`);
  else L.push('Zamanında teslim ettiğiniz için de ayrıca teşekkürler.');
  if (sc >= 8) L.push('Sizi herkese tavsiye edeceğiz, bir sonraki projemizi de size vereceğiz!');
  else if (sc >= 6) L.push('İleride tekrar çalışabiliriz.');
  else if (sc >= 4) L.push('Bir dahaki sefere daha dikkatli olmanızı umuyoruz.');
  else L.push('Açıkçası sizinle bir daha çalışmayı düşünmüyoruz.');
  return L;
}
function starsHTML(sc){
  let h = '';
  for (let i=1;i<=10;i++) h += `<i class="${sc >= i ? 'on' : sc >= i-0.5 ? 'half' : ''}"></i>`;
  return `<span class="stars">${h}</span>`;
}

/* ---------- borsa ---------- */
const STOCKS = [   // gerçek piyasadaki şirketlerden esinlenen, isimleri değiştirilmiş şirketler
  {k:'ARMT', ad:'Armut Teknoloji',      s:'Teknoloji',      p:180, v:0.022, d:0.0009},
  {k:'MKRY', ad:'Mikroyumuş Yazılım',   s:'Yazılım',        p:330, v:0.020, d:0.0009},
  {k:'GUGL', ad:'Gugıl Arama',          s:'İnternet',       p:140, v:0.024, d:0.0008},
  {k:'AMZU', ad:'Amazun Kargo',         s:'E-ticaret',      p:150, v:0.028, d:0.0008},
  {k:'NVDO', ad:'Nividya Çip',          s:'Yarı iletken',   p:120, v:0.050, d:0.0014},
  {k:'TSMK', ad:'TaySMK Yonga',         s:'Yarı iletken',   p:160, v:0.032, d:0.0010},
  {k:'METO', ad:'Metaverz Sosyal',      s:'Sosyal medya',   p:480, v:0.032, d:0.0009},
  {k:'NTFL', ad:'Netfilm Dizi',         s:'Eğlence',        p:600, v:0.030, d:0.0007},
  {k:'SPTF', ad:'Spotifay Müzik',       s:'Eğlence',        p:300, v:0.036, d:0.0008},
  {k:'SMSN', ad:'Samsunk Elektronik',   s:'Elektronik',     p:60,  v:0.022, d:0.0005},
  {k:'TSLO', ad:'Teslo Motors',         s:'Otomotiv',       p:220, v:0.055, d:0.0010},
  {k:'FORT', ad:'Fort Otosan',          s:'Otomotiv',       p:1000,v:0.022, d:0.0006},
  {k:'KOKA', ad:'Koka Kolay İçecek',    s:'İçecek',         p:62,  v:0.010, d:0.0004},
  {k:'TKNT', ad:'Türk Kanat Yolları',   s:'Havacılık',      p:280, v:0.030, d:0.0007},
  {k:'PGSS', ad:'Pegasos Hava Yolları', s:'Havacılık',      p:230, v:0.036, d:0.0007},
  {k:'ASLN', ad:'Aselsun Savunma',      s:'Savunma',        p:45,  v:0.032, d:0.0010},
  {k:'KECH', ad:'Keç Holding',          s:'Holding',        p:190, v:0.020, d:0.0006},
  {k:'GRNT', ad:'Garantili Bankası',    s:'Banka',          p:120, v:0.026, d:0.0006},
  {k:'BINM', ad:'BİN Marketler',        s:'Perakende',      p:300, v:0.014, d:0.0005},
  {k:'TCEP', ad:'Türkcep İletişim',     s:'Telekom',        p:75,  v:0.020, d:0.0005},
];const NEWS_UP = ['rekor çeyrek kârı açıkladı','dev bir ihale kazandı','yeni ürünü çok sattı','yabancı yatırımcı aldı'];
const NEWS_DN = ['zarar açıkladı','CEO\'su istifa etti','ürününde güvenlik açığı bulundu','büyük bir müşterisini kaybetti'];
function randn(){ let u=0,v=0; while(!u) u=Math.random(); while(!v) v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function stockState(){
  if (!S.stock) S.stock = {};
  if (S.stock.ELMA && !S.stock.ARMT){ S.stock.ARMT = S.stock.ELMA; delete S.stock.ELMA; }   // eski isim: Elma → Armut
  for (const s of STOCKS) if (!S.stock[s.k]) S.stock[s.k] = {p:s.p, hist:[s.p], own:0, cost:0};
  return S.stock;
}
function stockDay(){
  const st = stockState();
  for (const s of STOCKS){
    const x = st[s.k];
    let r = s.d + s.v*randn();
    if (Math.random() < 0.012){
      const up = Math.random() < 0.55, mag = 0.08 + Math.random()*0.14;
      r += up ? mag : -mag;
      if (x.own > 0 || Math.random() < 0.3) toast(`📰 ${s.ad} ${pick(up?NEWS_UP:NEWS_DN)}: ${up?'▲':'▼'} %${Math.round(mag*100)}`);
    }
    x.p = Math.max(0.5, x.p*Math.exp(r));
    x.hist.push(x.p); if (x.hist.length > 40) x.hist.shift();
  }
}
const portfolioValue = () => STOCKS.reduce((a,s)=>{ const x = (S.stock||{})[s.k]; return a + (x ? x.own*x.p : 0); }, 0);
function sparkSVG(h){
  const mn = Math.min(...h), mx = Math.max(...h), w = 80, ht = 24;
  const pts = h.map((v,i)=>`${(i/(h.length-1||1)*w).toFixed(1)},${(ht-(mx===mn?ht/2:(v-mn)/(mx-mn)*ht)).toFixed(1)}`).join(' ');
  const up = h[h.length-1] >= h[0];
  return `<svg class="spark" viewBox="0 0 ${w} ${ht}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${up?'var(--o6)':'var(--t9)'}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

/* ---------- şirket araçları ---------- */
const CARS = [
  {id:'hatch', ikon:'🚗', ad:'Şirket Hatchback',   fiyat:400000,    rep:3,  pay:0.02, acik:'İlk şirket aracın. Müşteri ziyaretleri artık daha kolay.'},
  {id:'sedan', ikon:'🚘', ad:'Lüks Sedan',         fiyat:3500000,   rep:8,  pay:0.05, acik:'Toplantılara şık bir girişle müşterileri etkile.'},
  {id:'suv',   ikon:'🚙', ad:'Elektrikli SUV',     fiyat:15000000, rep:15, pay:0.08, acik:'Çevreci ve prestijli. Teknoloji şirketine yakışır.'},
  {id:'spor',  ikon:'🏎️', ad:'Spor Araba',         fiyat:60000000, rep:30, pay:0.12, acik:'Patron geldi! Herkes şirketini konuşuyor.'},
  {id:'heli',  ikon:'🚁', ad:'Şirket Helikopteri', fiyat:400000000, rep:80, pay:0.20, acik:'Trafiğe takılmadan şehrin üstünden toplantıya.'},
];
const carPayBonus = () => CARS.reduce((a,c)=>a + ((S.cars||{})[c.id] ? c.pay : 0), 0);

/* ---------- kendi ürünlerin: konu, hedef kitle, trend ----------
   fit: konunun her tür için uyumu (1,3 harika · 1,1 iyi · 1 normal · <0,9 zayıf); aud: en uygun kitle; w: isim kelimeleri */
const TOPICS = {
  fitness:  {ad:'Spor & Fitness',   ikon:'🏃', aud:'genc',  fit:{web:1.0, mobil:1.3, oyun:0.8, ai:1.1}, w:['Fit','Adım','Kas','Koşu','Nabız']},
  yemek:    {ad:'Yemek & Tarif',    ikon:'🍳', aud:'aile',  fit:{web:1.2, mobil:1.2, oyun:0.7, ai:1.0}, w:['Lezzet','Tarif','Mutfak','Tencere','Sofra']},
  finans:   {ad:'Finans & Para',    ikon:'💰', aud:'pro',   fit:{web:1.1, mobil:1.2, oyun:0.6, ai:1.3}, w:['Cüzdan','Kasa','Birikim','Borsa','Para']},
  egitim:   {ad:'Eğitim',           ikon:'🎓', aud:'genc',  fit:{web:1.1, mobil:1.1, oyun:1.1, ai:1.2}, w:['Akıl','Ders','Bilgi','Okul','Zeka']},
  sosyal:   {ad:'Sosyal Medya',     ikon:'💬', aud:'genc',  fit:{web:1.0, mobil:1.3, oyun:0.7, ai:0.9}, w:['Sohbet','Paylaş','Arkadaş','Story','Buluş']},
  saglik:   {ad:'Sağlık',           ikon:'🩺', aud:'yasli', fit:{web:1.0, mobil:1.2, oyun:0.6, ai:1.3}, w:['Sağlık','Doktor','Şifa','İlaç','Nabız']},
  muzik:    {ad:'Müzik',            ikon:'🎵', aud:'genc',  fit:{web:1.0, mobil:1.2, oyun:1.1, ai:1.1}, w:['Ritim','Melodi','Nota','Sahne','Beat']},
  seyahat:  {ad:'Seyahat',          ikon:'✈️', aud:'aile',  fit:{web:1.2, mobil:1.1, oyun:0.8, ai:1.0}, w:['Gezgin','Rota','Tatil','Bavul','Yolcu']},
  alisveris:{ad:'Alışveriş',        ikon:'🛍️', aud:'aile',  fit:{web:1.3, mobil:1.1, oyun:0.6, ai:1.0}, w:['Sepet','Pazar','Fırsat','Vitrin','İndirim']},
  uzay:     {ad:'Uzay & Bilim Kurgu', ikon:'🚀', aud:'genc', fit:{web:0.7, mobil:0.8, oyun:1.3, ai:0.9}, w:['Galaksi','Yıldız','Roket','Gezegen','Nebula']},
  macera:   {ad:'Fantastik Macera', ikon:'🐉', aud:'genc',  fit:{web:0.6, mobil:0.9, oyun:1.3, ai:0.7}, w:['Ejder','Büyücü','Kale','Efsane','Kılıç']},
  yaris:    {ad:'Araba & Yarış',    ikon:'🏎️', aud:'genc',  fit:{web:0.6, mobil:1.0, oyun:1.3, ai:0.7}, w:['Turbo','Drift','Pist','Nitro','Hız']},
  bulmaca:  {ad:'Bulmaca & Zekâ',   ikon:'🧩', aud:'yasli', fit:{web:0.9, mobil:1.2, oyun:1.2, ai:0.8}, w:['Bulmaca','Kelime','Zeka','Sudoku','Parça']},
  futbol:   {ad:'Futbol',           ikon:'⚽', aud:'genc',  fit:{web:1.0, mobil:1.1, oyun:1.3, ai:0.9}, w:['Gol','Taraftar','Kaleci','Forma','Derbi']},
  haber:    {ad:'Haber & Gündem',   ikon:'📰', aud:'yasli', fit:{web:1.3, mobil:1.0, oyun:0.5, ai:1.1}, w:['Gündem','Manşet','Haber','Bülten','Ajans']},
  is:       {ad:'İş & Verimlilik',  ikon:'📊', aud:'pro',   fit:{web:1.2, mobil:1.1, oyun:0.5, ai:1.3}, w:['Görev','Plan','Ofis','Takvim','Proje']},
};
// yeni konular
Object.assign(TOPICS, {
  moda:     {ad:'Moda & Güzellik',   ikon:'', aud:'genc',  fit:{web:1.2, mobil:1.3, oyun:0.6, ai:1.0}, w:['Stil','Moda','Trend','Gardırop','Işıltı']},
  evcil:    {ad:'Evcil Hayvanlar',   ikon:'', aud:'aile',  fit:{web:1.0, mobil:1.2, oyun:1.1, ai:0.9}, w:['Pati','Mama','Tüylü','Kedi','Köpek']},
  ev:       {ad:'Ev & Dekorasyon',   ikon:'', aud:'aile',  fit:{web:1.2, mobil:1.1, oyun:0.9, ai:1.0}, w:['Yuva','Dekor','Salon','Tasarım','Ev']},
  ulasim:   {ad:'Ulaşım & Harita',   ikon:'', aud:'pro',   fit:{web:1.0, mobil:1.3, oyun:0.6, ai:1.2}, w:['Rota','Durak','Yol','Harita','Navi']},
  film:     {ad:'Film & Dizi',       ikon:'', aud:'genc',  fit:{web:1.2, mobil:1.1, oyun:0.8, ai:1.1}, w:['Sinema','Dizi','Sahne','Perde','Fragman']},
  sanat:    {ad:'Sanat & Çizim',     ikon:'', aud:'genc',  fit:{web:1.0, mobil:1.1, oyun:1.0, ai:1.3}, w:['Fırça','Tuval','Renk','Eskiz','Palet']},
  foto:     {ad:'Fotoğraf & Video',  ikon:'', aud:'genc',  fit:{web:1.0, mobil:1.3, oyun:0.6, ai:1.2}, w:['Kare','Lens','Filtre','Çekim','Klip']},
  emlak:    {ad:'Emlak',             ikon:'', aud:'pro',   fit:{web:1.3, mobil:1.1, oyun:0.6, ai:1.0}, w:['Konut','Daire','Tapu','Kira','Arsa']},
  kariyer:  {ad:'Kariyer & İş İlanı',ikon:'', aud:'pro',   fit:{web:1.3, mobil:1.0, oyun:0.5, ai:1.2}, w:['Kariyer','İlan','Özgeçmiş','Mülakat','Terfi']},
  dil:      {ad:'Dil Öğrenme',       ikon:'', aud:'genc',  fit:{web:1.0, mobil:1.3, oyun:1.0, ai:1.2}, w:['Kelime','Dil','Lingo','Sözlük','Aksan']},
  tarih:    {ad:'Tarih & Kültür',    ikon:'', aud:'yasli', fit:{web:1.2, mobil:1.0, oyun:1.2, ai:0.9}, w:['Tarih','Asır','Müze','Antik','Miras']},
  bilim:    {ad:'Bilim & Doğa',      ikon:'', aud:'genc',  fit:{web:1.1, mobil:1.0, oyun:1.0, ai:1.2}, w:['Atom','Deney','Doğa','Keşif','Laboratuvar']},
  cocuk:    {ad:'Çocuklar İçin',     ikon:'', aud:'aile',  fit:{web:0.9, mobil:1.2, oyun:1.3, ai:0.8}, w:['Minik','Neşeli','Oyuncak','Masal','Bıcırık']},
  korku:    {ad:'Korku & Gizem',     ikon:'', aud:'genc',  fit:{web:0.6, mobil:0.9, oyun:1.3, ai:0.7}, w:['Gölge','Lanet','Sis','Gece','Sırlar']},
  strateji: {ad:'Strateji & Savaş',  ikon:'', aud:'pro',   fit:{web:0.7, mobil:1.0, oyun:1.3, ai:0.9}, w:['İmparatorluk','Ordu','Fetih','Kale','Hükümdar']},
  sehir:    {ad:'Şehir Kurma',       ikon:'', aud:'pro',   fit:{web:0.7, mobil:1.1, oyun:1.3, ai:1.0}, w:['Kent','Metropol','Belde','Kule','Mahalle']},
});
// konular gruplara ayrılır (ürün sayfasında sekmeler)
const TOPIC_GROUPS = [['yasam','Yaşam'], ['eglence','Eğlence & Sosyal'], ['para','İş & Para'], ['bilgi','Bilgi & Eğitim'], ['oyun','Oyun Dünyaları']];
{ const G = {yasam:['fitness','yemek','saglik','seyahat','moda','evcil','ev','ulasim'], eglence:['sosyal','muzik','futbol','film','sanat','foto'], para:['finans','alisveris','is','emlak','kariyer'], bilgi:['egitim','haber','dil','tarih','bilim','cocuk'], oyun:['uzay','macera','yaris','bulmaca','korku','strateji','sehir']};
  for (const [g, ks] of Object.entries(G)) for (const k of ks) if (TOPICS[k]) TOPICS[k].g = g; }
const AUDS = {
  herkes:{ad:'Herkes',         ikon:'🌍'},
  genc:  {ad:'Gençler',        ikon:'🧑‍🎤'},
  aile:  {ad:'Aileler',        ikon:'👨‍👩‍👧'},
  pro:   {ad:'Profesyoneller', ikon:'💼'},
  yasli: {ad:'Büyükler (50+)', ikon:'👴'},
};
const TOPIC_SUFFIX = {web:['Net','Online','Portal','Merkezi','Dünyası'], mobil:['Go','Cep','Plus','Pro','App'], oyun:['Macerası','Savaşları','Ustası','Efsanesi','Adası'], ai:['AI','Asistan','Zeka','Bot','Akıl']};
function topicProdName(topic, type){ const T = TOPICS[topic]; return pick(T.w) + ' ' + pick(TOPIC_SUFFIX[type]); }
const audFit = (topic, aud) => aud === TOPICS[topic].aud ? 1.2 : aud === 'herkes' ? 1.0 : 0.8;
const fitWord = f => f >= 1.25 ? 'Mükemmel uyum' : f >= 1.1 ? 'İyi uyum' : f >= 0.95 ? 'Normal' : f >= 0.75 ? 'Zayıf uyum' : 'Çok kötü uyum';
const fitStars = f => f >= 1.25 ? '★★★' : f >= 1.1 ? '★★' : f >= 0.95 ? '★' : '✗';
function rollTrend(){
  const keys = Object.keys(TOPICS).filter(k => k !== S.trend);
  S.trend = pick(keys); S.trendUntil = S.day + 60;
}

/* ---------- öğrenilebilir diller ve beceriler ----------
   t: hızlandırdığı proje türleri (sp: hız oranı, varsayılan %15) · all: her işte hız çarpanı
   bug: hata çarpanı · fix: hata ayıklama hızı · rev: müşteri önceliği eşleşince +0,5 puan · role: sadece o rol */
const LEARN = [
  {id:'js',     ad:'JavaScript',            kis:'JS',  bg:'#f7df1e', fg:'#1b1830', tur:'Dil',    t:['web'],          gun:5,  fiyat:15000,  acik:'Web işlerinde %15 daha hızlı'},
  {id:'ts',     ad:'TypeScript',            kis:'TS',  bg:'#3178c6', fg:'#ffffff', tur:'Dil',    t:['web'], bug:0.9, req:'js', gun:6, fiyat:30000, acik:'Web\'de %15 hızlı, %10 daha az hata'},
  {id:'python', ad:'Python',                kis:'Py',  bg:'#3776ab', fg:'#ffd43b', tur:'Dil',    t:['ai','web'],     gun:6,  fiyat:35000,  acik:'Yapay Zekâ ve Web işlerinde %15 hızlı'},
  {id:'swift',  ad:'Swift',                 kis:'Sw',  bg:'#f05138', fg:'#ffffff', tur:'Dil',    t:['mobil'],        gun:7,  fiyat:40000,  acik:'Mobil işlerde %15 daha hızlı'},
  {id:'kotlin', ad:'Kotlin',                kis:'Kt',  bg:'#7f52ff', fg:'#ffffff', tur:'Dil',    t:['mobil'],        gun:7,  fiyat:40000,  acik:'Mobil işlerde %15 daha hızlı'},
  {id:'csharp', ad:'C#',                    kis:'C#',  bg:'#68217a', fg:'#ffffff', tur:'Dil',    t:['oyun'],         gun:8,  fiyat:60000,  acik:'Oyun işlerinde %15 daha hızlı'},
  {id:'cpp',    ad:'C++',                   kis:'C++', bg:'#00599c', fg:'#ffffff', tur:'Dil',    t:['oyun','ai'],    gun:10, fiyat:90000,  acik:'Oyun ve Yapay Zekâ\'da %15 hızlı'},
  {id:'rust',   ad:'Rust',                  kis:'Rs',  bg:'#b7410e', fg:'#ffffff', tur:'Dil',    bug:0.8,            gun:10, fiyat:120000, acik:'Tüm işlerde %20 daha az hata'},
  {id:'sql',    ad:'SQL & Veritabanı',      kis:'SQL', bg:'#00758f', fg:'#ffffff', tur:'Beceri', t:['web','mobil'], sp:0.08, gun:4, fiyat:20000, acik:'Web ve Mobil\'de %8 hızlı'},
  {id:'git',    ad:'Git & Ekip Çalışması',  kis:'Git', bg:'#f05032', fg:'#ffffff', tur:'Beceri', bug:0.9, all:1.05, gun:3,  fiyat:12000,  acik:'%5 hızlı, %10 daha az hata'},
  {id:'devops', ad:'Bulut & DevOps',        kis:'Ops', bg:'#1e97f6', fg:'#ffffff', tur:'Beceri', all:1.08,           gun:7,  fiyat:70000,  acik:'Tüm işlerde %8 daha hızlı'},
  {id:'ml',     ad:'Makine Öğrenmesi',      kis:'ML',  bg:'#ff6f00', fg:'#ffffff', tur:'Beceri', t:['ai'], sp:0.25, req:'python', gun:12, fiyat:150000, acik:'Yapay Zekâ\'da %25 hızlı (Python gerekir)'},
  {id:'uiux',   ad:'UI/UX Tasarımı',        kis:'UX',  bg:'#f472b6', fg:'#ffffff', tur:'Beceri', role:'tas', all:1.12, rev:'gorsel', gun:6, fiyat:40000, acik:'Arayüzde %12 hızlı · "Görsellik" isteyen müşteri +0,5 puan'},
  {id:'guv',    ad:'Siber Güvenlik',        kis:'Sec', bg:'#1b1830', fg:'#34d399', tur:'Beceri', bug:0.92, rev:'guvenlik', gun:8, fiyat:80000, acik:'%8 az hata · "Güvenlik" isteyen müşteri +0,5 puan'},
  {id:'qa',     ad:'Test Otomasyonu',       kis:'QA',  bg:'#16a34a', fg:'#ffffff', tur:'Beceri', role:'test', fix:1.3, gun:5, fiyat:35000, acik:'Hata ayıklama %30 daha hızlı'},
  {id:'scrum',  ad:'Çevik Yönetim (Scrum)', kis:'Ag',  bg:'#2f54eb', fg:'#ffffff', tur:'Beceri', all:1.06, rev:'hiz', gun:4, fiyat:25000, acik:'%6 hızlı · "Hız" isteyen müşteri +0,5 puan'},
];
const LEARN_BY = Object.fromEntries(LEARN.map(i => [i.id, i]));
const learnCost = it => round10(it.fiyat * (1 + S.office*0.5));
function learnBadge(it, s=22){
  const long = it.kis.length > 2;
  return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" class="lb" aria-label="${it.ad}"><rect x="1" y="1" width="22" height="22" rx="6" fill="${it.bg}"/><text x="12" y="${long?15.4:16.2}" text-anchor="middle" font-size="${long?8.6:11}" font-weight="900" fill="${it.fg}" font-family="Nunito,system-ui,sans-serif">${it.kis}</text></svg>`;
}
const badgesOf = (know, s) => (know||[]).map(id => LEARN_BY[id] ? learnBadge(LEARN_BY[id], s) : '').join('');
const roleOk = (it, role) => !it.role || role==='me' || it.role===role;
function knowMult(know, ptype, role){
  let m = 1;
  for (const id of know||[]){ const it = LEARN_BY[id]; if (!it || !roleOk(it, role)) continue;
    if (it.t && it.t.includes(ptype)) m *= 1 + (it.sp || 0.15);
    if (it.all) m *= it.all; }
  return m;
}
function knowBug(know){ let b = 1; for (const id of know||[]){ const it = LEARN_BY[id]; if (it && it.bug) b *= it.bug; } return b; }
function knowFix(know, role){ let f = 1; for (const id of know||[]){ const it = LEARN_BY[id]; if (it && it.fix && roleOk(it, role)) f *= it.fix; } return f; }
const teamKnows = id => (S.fknow||[]).includes(id) || S.emps.some(e => (e.know||[]).includes(id));
function learnable(know, role){ return LEARN.filter(it => !(know||[]).includes(it.id) && roleOk(it, role) && (!it.req || (know||[]).includes(it.req))); }
function learnChooser(who){
  const isMe = who === 'me', e = isMe ? null : S.emps.find(x=>x.id===+who);
  const know = isMe ? S.fknow : e.know, role = isMe ? 'me' : e.role;
  const list = learnable(know, role);
  const item = it => { const c = learnCost(it); return `<button class="act" data-act="learn" data-id="${who}" data-v="${it.id}" ${S.money<c?'disabled':''}>${learnBadge(it, 26)}<b>${it.ad}</b><small>${it.acik}</small><small>${tl(c)} · ${it.gun} gün</small></button>`; };
  const dil = list.filter(i=>i.tur==='Dil'), bec = list.filter(i=>i.tur==='Beceri');
  showModal('📖', `<h3>${isMe?'Sen':esc(e.name)} ne öğrensin?</h3>
    <p class="sub" style="text-align:center">Öğrenirken ${isMe?'pasif kod yazmazsın (dokunarak çalışmaya devam edebilirsin)':'projelerde çalışmaz, masasında kurs izler'}. Öğrenilen şey kalıcıdır.</p>
    ${dil.length?`<h2>Programlama dilleri</h2><div class="grid3">${dil.map(item).join('')}</div>`:''}
    ${bec.length?`<h2>Yazılım becerileri</h2><div class="grid3">${bec.map(item).join('')}</div>`:''}
    ${!list.length?'<div class="empty-msg">Öğrenilecek her şeyi öğrenmiş! 🎓</div>':''}
    <button class="btn gray block" data-act="close">Vazgeç</button>`);
}
function founderMenu(){
  const t = S.ftask, it = t && LEARN_BY[t.item];
  const kurs = UPGRADES.find(u=>u.id==='kurs'), kl = S.upg.kurs||0, kc = kurs.fiyat(kl);
  curChoices = [];
  showModal(avatarSVG(0, 'me', ''), `<h3>${S.boss ? esc(S.boss)+' (Kurucu)' : 'Sen (Kurucu)'}</h3>
    <p class="sub" style="text-align:center">Yetenek ${founderSkill()}/10 · Dokunuş başı +${r1(tapPower())} iş</p>
    <p style="text-align:center;margin:4px 0">${badgesOf(S.fknow, 22) || '<span class="sub">Henüz özel bir dil ya da beceri öğrenmedin.</span>'}</p>
    ${cyBossLine()}
    <div class="lbl"><span>Durum</span><b>${it ? `📖 ${it.ad} öğreniyorsun (${Math.max(0,t.until-S.day)} gün)` : '💻 Kod yazıyorsun'}</b></div>
    <div class="grid4" style="margin-top:6px">
      <button class="act" data-act="look"><span>👤</span>Görünüş<small>Saç, kıyafet…</small></button>
      <button class="act" data-act="flearn" ${it?'disabled':''}><span>📖</span>Yeni şey öğren<small>${learnable(S.fknow,'me').length} seçenek</small></button>
      <button class="act" data-act="fkurs" data-v="kurs" ${(kl>=kurs.max||S.money<kc)?'disabled':''}><span>📚</span>Kendini geliştir<small>${kl>=kurs.max?'En üst seviye':`${tl(kc)} · +1 yetenek`}</small></button>
      <button class="act" data-act="page" data-v="gelis"><span>⌨️</span>Ekipmanlar<small>Klavye, monitör…</small></button>
    </div>
    <button class="btn block pcbtn" data-act="pc-open"><b>Bilgisayarım</b><small>İşBağ, internet, portfolyo ve e-posta</small></button>
    ${meetBtnHTML()}
    ${tatilBtnHTML()}
    ${exHackHTML()}
    ${typeof dvBtnHTML === 'function' ? dvBtnHTML() : ''}
    ${typeof blBtnHTML === 'function' ? blBtnHTML() : ''}
    <button class="btn teal block" data-act="close">Kapat</button>`);
}
/* ---- TOPLU TATİL: iş yokken bütün ekip tatile gider, dinlenip döner ---- */
const TATIL = [
  {id:'kisa', ad:'Hafta sonu kaçamağı', gun:3,  grp:25,  k:0.08, acik:'Tatil 3 gün sürer · dönünce moral +25'},
  {id:'uzun', ad:'Uzun tatil',          gun:10, grp:100, k:0.25, acik:'Tatil 10 gün sürer · herkes %100 moralle döner'},
];
const tatilBusy = () => S.projs.some(p => needsWork(p));
function tatilBtnHTML(){
  const n = S.emps.filter(e => !isAway(e)).length, busy = tatilBusy(), m = Math.round(teamMood());
  const away = S.grpBack && S.grpBack > S.day && S.emps.some(e => e.task && e.task.grp);
  if (away) return `<button class="btn block tatilbtn" disabled><b>Ekip tatilde</b><small>${S.grpBack - S.day} gün sonra (${S.grpBack}. gün) dönecekler</small></button>`;
  const why = !n ? 'Tatile gidecek çalışan yok' : busy ? 'Önce süren projeler bitsin' : `Ekip morali %${m}${m < 50 ? ' · ekip çok yorgun' : m < 70 ? ' · ekip biraz yorgun' : ''}`;
  return `<button class="btn block tatilbtn" data-act="tatil-all" ${!n || busy ? 'disabled' : ''}><b>Herkesi tatile gönder</b><small>${why}</small></button>`;
}
function tatilMenu(){
  const n = S.emps.filter(e => !isAway(e)).length;
  if (!n || tatilBusy()){ toast(tatilBusy() ? 'Projeler sürerken ekibi tatile gönderemezsin.' : 'Tatile gidecek çalışan yok.'); snd('bad'); return; }
  curChoices = [];
  showModal('', `<h3>Ekip tatili</h3>
    <p class="sub" style="text-align:center">${n} çalışan birlikte tatile çıkar. Tatildeyken kimse çalışmaz, dönünce herkes dinlenmiş ve hızlı olur.</p>
    <div class="lbl"><span>Ekip morali</span><b>%${Math.round(teamMood())}</b></div>
    <div class="tatgrid">${TATIL.map(t => { const c = teamCost(t.k);
      return `<button class="act" data-act="tatil-go" data-v="${t.id}" ${S.money < c ? 'disabled' : ''}><b>${t.ad}</b><small>${t.acik}</small><small class="tcost">${tl(c)}</small></button>`; }).join('')}</div>
    <button class="btn teal block" data-act="close">Vazgeç</button>`);
}
function tatilGo(id){
  const t = TATIL.find(x => x.id===id), c = t && teamCost(t.k);
  if (!t || S.money < c || tatilBusy()) return;
  S.money -= c; let k = 0;
  for (const e of S.emps) if (!isAway(e)){ e.task = {type:'izin', until:S.day + t.gun, grp:t.grp}; k++; }
  sceneKey = ''; closeModal(); snd('ok');
  S.grpBack = S.day + t.gun; exS().tatil = true;
  toast(`${k} çalışan ${t.gun} günlük tatile çıktı (−${tl(c)}). ${S.day + t.gun}. günde, yani ${t.gun} gün sonra dönecekler.`);
  updateHome();
}
/* =====================================================================
   TOPLANTI – yalnızca kurucu yapar. Herkes büyük masada toplanır,
   kurucu şirketin geleceği için 3 konuda karar verir.
   ===================================================================== */
const MEET_CD = 15;      // iki toplantı arası en az gün
const meetCount = () => S.emps.filter(e => !isAway(e)).length;
function meetBtnHTML(){
  const n = meetCount(), wait = Math.max(0, (S.nextMeet||0) - S.day);
  const why = !n ? 'Toplantı için en az bir çalışan gerekli' : wait ? `Yeni toplantı için ${wait} gün bekle` : `${n} çalışan büyük masada toplanır, sen kararları verirsin`;
  return `<button class="btn block meetbtn" data-act="meet" ${!n || wait ? 'disabled' : ''}><b>Toplantı yap</b><small>${why}</small></button>`;
}
const MEET_TOPICS = [
  {id:'oncelik', q:'Önümüzdeki dönemin önceliği ne olsun?', opts:[
    {ad:'Hız', acik:'10 gün ekip %20 daha hızlı', fx:() => { S.boost = Math.max(S.boost||0, 10); return 'Ekip 10 gün daha hızlı çalışacak'; }},
    {ad:'Kalite', acik:'30 gün boyunca biten işler +4 kalite', fx:() => { S.meetQ = S.day + 30; return '30 gün boyunca işler daha kaliteli'; }},
    {ad:'Ekip sağlığı', acik:'Herkesin morali +8', fx:() => { moodAll(8); return 'Ekibin morali yükseldi'; }}]},
  {id:'butce', q:'Bu ay ek bütçe nereye gitsin?', cost:() => teamCost(0.15), opts:[
    {ad:'Ar-Ge', acik:m => `${tl(m.cost.butce)} · +${10 + meetCount()*2} Ar-Ge puanı`, money:m => m.cost.butce, fx:m => { S.money -= m.cost.butce; S.rp = (S.rp||0) + 10 + meetCount()*2; return 'Ar-Ge bütçesi arttı'; }},
    {ad:'Pazarlama', acik:m => `${tl(m.cost.butce)} · +5 itibar`, money:m => m.cost.butce, fx:m => { S.money -= m.cost.butce; S.rep += 5; return 'Pazarlama itibarı artırdı'; }},
    {ad:'Kasada kalsın', acik:'Para harcanmaz', fx:() => 'Bütçe kasada kaldı'}]},
  {id:'mesai', q:'Çalışma düzeni nasıl olsun?', opts:[
    {ad:'Esnek saatler', acik:'Herkesin morali +6', fx:() => { moodAll(6); return 'Esnek saatler ekibi sevindirdi'; }},
    {ad:'Fazla mesai', acik:'7 gün %20 hızlı · moral −8', fx:() => { S.boost = Math.max(S.boost||0, 7); moodAll(-8); return 'Fazla mesai başladı, ekip biraz gergin'; }},
    {ad:'Aynen devam', acik:'Değişiklik yok', fx:() => 'Çalışma düzeni aynı kaldı'}]},
  {id:'ortam', q:'Ofis ortamı için ne yapalım?', cost:() => teamCost(0.1), opts:[
    {ad:'Ofis partisi', acik:m => `${tl(m.cost.ortam)} · moral +10`, money:m => m.cost.ortam, fx:m => { S.money -= m.cost.ortam; moodAll(10); return 'Ofis partisi çok eğlenceli geçti'; }},
    {ad:'Kahve köşesi', acik:m => `${tl(round10(m.cost.ortam*0.4))} · moral +5`, money:m => round10(m.cost.ortam*0.4), fx:m => { S.money -= round10(m.cost.ortam*0.4); moodAll(5); return 'Yeni kahve köşesi açıldı'; }},
    {ad:'Gerek yok', acik:'Moral −2', fx:() => { moodAll(-2); return 'Ofiste bir değişiklik yapılmadı'; }}]},
  {id:'egitim', q:'Ekibin gelişimi için ne yapalım?', cost:() => teamCost(0.3), opts:[
    {ad:'Herkese eğitim', acik:m => `${tl(m.cost.egitim)} · her çalışana +1 yetenek şansı`, money:m => m.cost.egitim, fx:m => { S.money -= m.cost.egitim; let k = 0; for (const e of S.emps) if (e.skill < 10 && Math.random() < 0.5){ e.skill++; k++; } return `Eğitim bitti: ${k} çalışanın yeteneği arttı`; }},
    {ad:'Birbirimizden öğrenelim', acik:'+5 Ar-Ge · moral +2', fx:() => { S.rp = (S.rp||0) + 5; moodAll(2); return 'Ekip bilgi paylaştı'; }},
    {ad:'Şimdi değil', acik:'Değişiklik yok', fx:() => 'Eğitim ertelendi'}]},
  {id:'vizyon', q:'Şirketin vizyonu ne olsun?', opts:[
    {ad:'Dünyaya açılalım', acik:'+4 itibar · moral +3', fx:() => { S.rep += 4; moodAll(3); return 'Büyük hedefler ekibi heyecanlandırdı'; }},
    {ad:'Küçük ve güçlü', acik:'Moral +6', fx:() => { moodAll(6); return 'Ekip samimi bir şirkette olmaktan mutlu'; }},
    {ad:'Önce kâr', acik:'5 gün %20 hızlı · moral −3', fx:() => { S.boost = Math.max(S.boost||0, 5); moodAll(-3); return 'Ekip kâr için hızlandı'; }}]},
];
// çalışanların toplantıda açabileceği konular (koşula göre)
const MEET_VOICES = [
  {id:'pc', ok:() => eqTier('pc') < 3, q:'Patron, bilgisayarlarımız işleri çok yavaşlatıyor. Derleme beklerken kahve soğuyor. Daha güçlü makinelere ihtiyacımız var.', opts:[
    {ad:'Söz, yenileyeceğiz', acik:'Moral +6 · bilgisayarları Geliştir sayfasından yükselt', fx:(m,e) => { moodAll(6); S.promise = S.day; return 'Ekip yeni bilgisayar sözüne sevindi'; }},
    {ad:'Bütçe yok', acik:'Moral −3', fx:() => { moodAll(-3); return 'Bilgisayar isteği şimdilik ertelendi'; }},
    {ad:'Önce sonuç görelim', acik:'Moral −6', fx:(m,e) => { moodAll(-4); if (e) moodOne(e, -4); return 'Ekip bilgisayar konusunda hayal kırıklığına uğradı'; }}]},
  {id:'maas', ok:() => S.emps.length >= 2, q:'Arkadaşlar adına söylüyorum: piyasaya baktığımızda maaşlarımız geride kaldı. Bunu konuşabilir miyiz?', opts:[
    {ad:'Herkese %5 zam', acik:m => 'Aylık maaşlar +' + tl(round10(salaries()*0.05)) + ' · moral +10', fx:() => { for (const x of S.emps) x.salary = round10(x.salary*1.05); moodAll(10); return 'Herkese %5 zam yapıldı'; }},
    {ad:'Tek seferlik prim', acik:m => tl(teamCost(0.2)) + ' · moral +6', money:m => teamCost(0.2), fx:() => { S.money -= teamCost(0.2); moodAll(6); return 'Ekibe prim dağıtıldı'; }},
    {ad:'Şimdilik olmaz', acik:'Moral −8', fx:() => { moodAll(-8); return 'Zam talebi reddedildi'; }}]},
  {id:'yorgun', ok:() => teamMood() < 65, q:'Son haftalar çok yoğun geçti, ekip gerçekten yoruldu. Biraz nefes almamız lazım.', opts:[
    {ad:'Herkese 2 gün izin', acik:'Ekip 2 gün yok · moral +15', fx:() => { let k = 0; for (const x of S.emps) if (!isAway(x)){ x.task = {type:'izin', until:S.day + 2, grp:15}; k++; } sceneKey = ''; return k + ' çalışan 2 günlük izne çıktı'; }},
    {ad:'Proje bitince tatil', acik:'Moral +4 · söz verirsin', fx:() => { moodAll(4); S.promise = S.day; return 'Proje sonrası tatil sözü verildi'; }},
    {ad:'Devam etmeliyiz', acik:'Moral −6', fx:() => { moodAll(-6); return 'Ekip yorgun ama devam ediyor'; }}]},
  {id:'fikir', ok:() => true, q:(m,e) => { if (!m.idea) m.idea = {tp:pick(Object.keys(TOPICS)), ty:pick(Object.keys(TYPES).filter(k => S.tech[k]))}; return `Benim bir ürün fikrim var: <b>${TOPICS[m.idea.tp].ad}</b> temalı bir <b>${TYPES[m.idea.ty].ad.toLowerCase()}</b>. Bence çok ilgi görür!`; }, opts:[
    {ad:'Sıradaki ürün bu', acik:'Moral +6 · Yeni Ürün sayfası bu fikirle açılır', fx:(m,e) => { if (e) moodOne(e, 10); moodAll(2); S.ideaNext = Object.assign({eid:e && e.id}, m.idea); return 'Sıradaki ürün fikri belirlendi'; }},
    {ad:'Not aldım', acik:'Moral +2', fx:(m,e) => { if (e) moodOne(e, 3); return 'Ürün fikri not edildi'; }},
    {ad:'Odaklanalım', acik:'Moral −3', fx:(m,e) => { if (e) moodOne(e, -5); return 'Ürün fikri reddedildi'; }}]},
  {id:'egitim', ok:() => S.emps.some(x => x.skill < 6), q:'Bazı arkadaşlar yeni teknolojileri öğrenmek istiyor. Eğitime bütçe ayırabilir miyiz?', opts:[
    {ad:'Eğitim bütçesi', acik:m => tl(teamCost(0.15)) + ' · 2 kişi +1 yetenek', money:m => teamCost(0.15), fx:() => { S.money -= teamCost(0.15); const w = S.emps.filter(x => x.skill < 10).sort((a,b) => a.skill - b.skill).slice(0, 2); for (const x of w){ x.skill++; moodOne(x, 6); } return w.length + ' çalışanın yeteneği arttı'; }},
    {ad:'Mentorluk yapın', acik:'+5 Ar-Ge · moral +2', fx:() => { S.rp = (S.rp||0) + 5; moodAll(2); return 'Ekip birbirine mentorluk yapacak'; }},
    {ad:'Şimdi değil', acik:'Moral −3', fx:() => { moodAll(-3); return 'Eğitim isteği ertelendi'; }}]},
  {id:'ofis', ok:() => S.emps.length >= Math.max(2, OFFICES[S.office].kap - 1), q:'Ofis çok kalabalıklaştı, odaklanmak zorlaşıyor. Biraz daha yer lazım.', opts:[
    {ad:'Dinlenme köşesi', acik:m => tl(round10(teamCost(0.1))) + ' · moral +6', money:m => round10(teamCost(0.1)), fx:() => { S.money -= round10(teamCost(0.1)); moodAll(6); return 'Ofise dinlenme köşesi eklendi'; }},
    {ad:'Taşınmayı düşünelim', acik:'Moral +3', fx:() => { moodAll(3); return 'Yeni ofis için söz verildi'; }},
    {ad:'İdare edin', acik:'Moral −5', fx:() => { moodAll(-5); return 'Ofis kalabalığı devam ediyor'; }}]},
];
function meetT(m, id){
  if (id.indexOf('v:') !== 0) return MEET_TOPICS.find(x => x.id===id);
  const V = MEET_VOICES.find(x => x.id===id.slice(2)), e = S.emps.find(x => x.id===m.vo[id]);
  return V && Object.assign({}, V, {e});
}
function startMeeting(){
  if (!meetCount()){ toast('Toplantı için en az bir çalışan gerekli.'); snd('bad'); return; }
  if (S.day < (S.nextMeet||0)){ toast(`Yeni toplantı için ${S.nextMeet - S.day} gün beklemelisin.`); snd('bad'); return; }
  closeModal(); if (page) closePage();
  // ekipten 1-2 kişi söz ister, şirket gündeminden 2 konu
  const live = S.emps.filter(e => !isAway(e)).sort(() => Math.random() - 0.5);
  const vs = MEET_VOICES.filter(v => v.ok()).sort(() => Math.random() - 0.5).slice(0, Math.min(2, live.length));
  const vo = {}; vs.forEach((v, k) => { vo['v:' + v.id] = live[k].id; });
  const topics = MEET_TOPICS.slice().sort(() => Math.random() - 0.5).slice(0, vs.length ? 2 : 3).map(x => x.id).concat(Object.keys(vo)), cost = {};
  for (const id of topics){ const T = MEET_TOPICS.find(x => x.id===id); if (T && T.cost) cost[id] = T.cost(); }
  S.meeting = {topics, ch:{}, cost, vo, t:Date.now()}; S.nextMeet = S.day + MEET_CD;
  if (window.S3D && S3D.meeting) S3D.meeting(true);
  snd('event'); updateHome();
  setTimeout(() => { if (S && S.meeting) showMeeting(); }, 1300);
}
function showMeeting(){ curChoices = []; showModal('', meetingHTML(), 'meetm'); }
function meetingHTML(){
  const m = S.meeting; if (!m) return '';
  const rows = m.topics.map(id => { const T = meetT(m, id); if (!T) return '';
    const head = T.e ? `<div class="mtv"><span class="mav">${avatarSVG(T.e.id, T.e.role, T.e.emo)}</span><div><b>${esc(firstName(T.e))} söz istedi</b><small>${ROLES[T.e.role].ad}</small></div></div><p class="mtsay">"${typeof T.q==='function' ? T.q(m, T.e) : T.q}"</p>` : `<b>${T.q}</b>`;
    return `<div class="mtq ${T.e ? 'voice' : ''}">${head}<div class="mtopts">${T.opts.map((o, i) => { const c = o.money ? o.money(m) : 0;
      return `<button class="mtopt ${m.ch[id]===i?'on':''}" data-act="meet-ch" data-id="${id}" data-v="${i}" ${c > S.money ? 'disabled' : ''}><b>${o.ad}</b><small>${typeof o.acik==='function' ? o.acik(m) : o.acik}</small></button>`; }).join('')}</div></div>`; }).join('');
  const done = m.topics.every(id => m.ch[id] != null);
  return `<button class="mthide" data-act="meet-hide">Masayı göster</button><div class="npey">TOPLANTI · ${meetCount() + 1} KİŞİ</div><h3 style="margin:2px 0 4px">Şirketin geleceği</h3>
    <p class="sub" style="margin:0 0 4px">Bütün ekip masada seni dinliyor. Söz alanları dinle ve her konu için kararını ver.</p>${rows}
    <button class="btn block" data-act="meet-end" ${done ? '' : 'disabled'}>Kararları açıkla</button><button class="mtback" data-act="meet-hide">Kararlara dön</button>`;
}
function meetChoose(id, v){ const m = S.meeting; if (!m) return; m.ch[id] = v; snd('click'); const b = $('modal').querySelector('.mbox'); if (b){ const st = b.scrollTop; b.innerHTML = meetingHTML(); b.scrollTop = st; } }
function endMeeting(){
  const m = S.meeting; if (!m || !m.topics.every(id => m.ch[id] != null)) return;
  const out = [];
  for (const id of m.topics){ const T = meetT(m, id); if (!T) continue; const o = T.opts[m.ch[id]], c = o.money ? o.money(m) : 0; if (c > S.money) continue; out.push(o.fx(m, T.e)); }
  moodAll(2);              // fikirlerinin dinlenmesi herkese iyi gelir
  S.meeting = null; closeModal(); exS().meetN = (exS().meetN||0) + 1;
  if (window.S3D && S3D.meeting) S3D.meeting(false);
  snd('ok'); toast('Toplantı bitti: ' + out.join(' · ')); updateHome();
}


/* =====================================================================
   SAYFALAR
   ===================================================================== */
function briefHTML(){
  const o = S.offers.find(x=>x.id===pageArg);
  if (!o) return `<div class="empty-msg">Bu teklif artık geçerli değil.</div>`;
  const T = TYPES[o.type], b = o.brief, f = briefForm;
  const chip = (act, v, label, on) => `<button class="chip ${on?'on':''}" data-act="${act}" data-v="${v}">${label}</button>`;
  const ready = f.st && f.f && f.feats.length === 2;
  const step = (n, t, extra='') => `<div class="pxstep"><i>${n}</i><b>${t}</b>${extra}</div>`;
  return `<div class="pxprod" style="grid-template-columns:1fr 1.15fr">
    <div class="pxpanel">
      <div class="pxtop"><div class="npic">${(typeof TYPE_SVG!=='undefined' && TYPE_SVG[o.type]) || ''}</div><div class="grow"><b class="npt">${esc(o.client)}</b><div class="pxmeta">${T.ad} · ${SIZES[o.size].ad}</div></div>
        <div class="pxpay"><span>Ödeme</span><b>${tl(o.pay)}</b></div></div>
      <dl class="npdl"><div><dt>Teslim süresi</dt><dd>${o.days} gün</dd></div><div><dt>Min. kalite</dt><dd>${o.minQ||'Yok'}</dd></div></dl>
      <div class="letter brief"><div class="lh">${esc(b.contact)} anlatıyor:</div>“${briefText(o)}”</div>
      <p class="pxnote">Müşterinin ne istediğini dikkatle oku. Doğru stil, doğru özellikler ve doğru öncelik yüksek puan ve daha fazla ödeme getirir; yanlış seçimler kızgın bir müşteri demek.</p>
    </div>
    <div class="pxpanel">
      ${step(1, 'Tasarım stili')}
      <div class="chips">${Object.entries(STYLES).map(([k,s])=>chip('bf-st',k,s.ad,f.st===k)).join('')}</div>
      ${step(2, 'Özellikler', `<span class="pxmeta">${f.feats.length}/2 seçildi</span>`)}
      <div class="chips">${b.opts.map(k=>chip('bf-feat',k,FEAT[k].ad,f.feats.includes(k))).join('')}</div>
      ${step(3, 'Öncelik')}
      <div class="chips">${Object.entries(PRIOS).map(([k,s])=>chip('bf-f',k,s.ad,f.f===k)).join('')}</div>
      ${step(4, 'Çalışma tarzı', `<span class="pxmeta">${FOCUS[f.focus].acik}</span>`)}
      <div class="chips">${Object.entries(FOCUS).map(([k,s])=>chip('bf-focus',k,noEmo(s.ad),f.focus===k)).join('')}</div>
      <button class="npgo" style="margin-top:14px" data-act="bf-start" ${ready?'':'disabled'}>Projeyi başlat ${NP_ICON.ok}</button>
    </div></div>`;
}
function messageHTML(m, fresh){
  const T = TYPES[m.type] || TYPES.web;
  const mood = m.score >= 8 ? '😍' : m.score >= 6 ? '🙂' : m.score >= 4 ? '😕' : '😡';
  return `<h3>${fresh?'Yeni mesaj':'Mesaj'}: ${esc(m.from)}</h3>
    <div class="msc"><span class="msc-n">${String(m.score).replace('.',',')}<small>/10</small></span>${starsHTML(m.score)}<span class="msc-e">${mood}</span></div>
    <div class="letter">${m.lines.map(l=>`<p>${l}</p>`).join('')}<p class="sig">— ${esc(m.who)}, ${esc(m.from)}</p></div>
    <div class="grid3" style="margin-top:6px">
      <div class="kv"><b class="green">+${tl(m.pay)}</b><span>Ödeme</span></div>
      <div class="kv"><b>${m.rep>=0?'+':''}${m.rep} ⭐</b><span>İtibar</span></div>
      <div class="kv"><b>${m.q}</b><span>Ürün kalitesi</span></div>
    </div>
    ${fresh?'<button class="btn block lg" data-act="close">Tamam</button>':''}`;
}
/* =====================================================================
   GELEN KUTUSU – patrona gelen tüm e-postalar: müşteriler, ekip, kaygı mailleri
   ===================================================================== */
let mailSel = null;
const mailNeedsReply = m => m.answered==null && !m.ignored && (m.kind ? S.emps.some(e => e.id===m.eid) : !!m.replyable);
const mailUnread = m => m.read === false || mailNeedsReply(m);
function unreadMails(){ return (S.inbox||[]).filter(mailUnread).length; }
function mailSubject(m){ return m.kind ? m.subject : `İş değerlendirmesi · ${String(m.score).replace('.',',')}/10`; }
function mailSnippet(m){ const l = (m.lines||[]).find(x => !/^[^.!?]{0,22},$/.test(String(x).trim())) || ''; return String(l).replace(/<[^>]+>/g,'').slice(0, 70); }
function mailAvatar(m){ return m.kind ? avatarSVG(m.eid, m.role, m.emo) : `<div class="mlogo">${(TYPE_SVG && TYPE_SVG[m.type]) || ''}</div>`; }
function inboxHTML(){
  const box = S.inbox || [];
  if (!box.length) return `<div class="pxpanel" style="text-align:center;padding:30px"><div class="npey">GELEN KUTUSU</div><p class="pxsub" style="margin-top:6px">Henüz e-posta yok. Müşteriler işlerini teslim edince, çalışanların da zaman zaman sana yazacak.</p></div>`;
  if (!box.some(m => m.id===mailSel)) mailSel = (box.find(mailNeedsReply) || box.find(mailUnread) || box[0]).id;
  const cur = box.find(m => m.id===mailSel); if (cur.read === false) cur.read = true;
  const list = box.map(m => `<button class="mrow ${m.id===mailSel?'on':''} ${mailUnread(m)?'unread':''}" data-act="mail-open" data-id="${m.id}">
      <div class="mav sm">${mailAvatar(m)}</div>
      <div class="grow"><div class="mtop"><b>${esc(m.kind ? m.from : m.from)}</b><span>${m.day}. gün</span></div>
        <div class="msubj">${mailNeedsReply(m)?'<i class="mtag">Cevap bekliyor</i>':''}${esc(mailSubject(m))}</div>
        <div class="msnip">${esc(mailSnippet(m))}</div></div></button>`).join('');
  const body = cur.kind==='ekip' ? staffMailHTML(cur, false) : cur.kind==='not' ? noteMailHTML(cur) : messageHTML(cur, false).replace('<h3>','<h3 style="text-align:left;font-size:15px">') + clientReplyHTML(cur);
  const avg = (S.stats.scoreSum||0) / Math.max(1, S.stats.done);
  return `<div class="pxhead"><div><div class="npey">GELEN KUTUSU</div><div class="pxsub">${esc(S.boss || 'Patron')} · ${box.length} e-posta · ortalama müşteri puanı ${avg.toFixed(1).replace('.',',')}/10</div></div>
      <div class="pxstat ${unreadMails()?'bad':''}"><span>Okunmamış</span><b>${unreadMails()}</b></div></div>
    <div class="mbox2"><div class="mlist">${list}</div><div class="pxpanel mread">${body}</div></div>`;
}
// ---- ekipten sıradan e-postalar: öneri, izin, zam, teşekkür, yorgunluk, eğitim, ekipman ----
const STAFF_NOTES = {
  oneri: {ok:e => true, subject:'Bir ürün fikrim var', lines:(e,m) => { m.tp = pick(Object.keys(TOPICS)); m.ty = pick(Object.keys(TYPES).filter(t => S.tech[t])); m.aud = pick(Object.keys(AUDS)); const tp = TOPICS[m.tp], ty = TYPES[m.ty];
      return ['Patron,', `Dün akşam aklıma bir şey geldi: <b>${tp.ad}</b> temalı bir <b>${ty.ad.toLowerCase()}</b> yapsak bence çok ilgi görür.`, 'Bu alanda bizim gibi küçük ve hızlı bir ekibin fark yaratabileceğini düşünüyorum. Ne dersiniz?']; },
    replies:[{ikon:'💡', ad:'Harika fikir', txt:n=>`${n}, çok iyi düşünmüşsün! Bir sonraki ürün planlamasında mutlaka konuşalım.`, fx:e => moodOne(e, 8)},
             {ikon:'📝', ad:'Not aldım', txt:n=>`Teşekkürler ${n}, not aldım. Uygun zamanda değerlendireceğim.`, fx:e => moodOne(e, 3)},
             {ikon:'⏸️', ad:'Şu an değil', txt:n=>`${n}, şu an önceliğimiz başka. Mevcut işlere odaklanalım.`, fx:e => moodOne(e, -4)}]},
  izin: {ok:e => true, subject:'Kısa bir izin talebi', lines:e => ['Patron,', pick(['Önümüzdeki cuma ailemle önemli bir işim var.', 'Kardeşimin düğünü yaklaşıyor, hazırlıklara yardım etmem gerekiyor.', 'Bir süredir dişimle uğraşıyorum, doktora gitmem lazım.']) + ' Bir gün izin alabilir miyim?', 'İşlerimi aksatmamak için önceden planlayacağım, söz.'],
    replies:[{ikon:'🌴', ad:'Tabii, izin ver', txt:n=>`Elbette ${n}, git işini hallet. Biz burada idare ederiz.`, fx:e => moodOne(e, 10)},
             {ikon:'📅', ad:'Gelecek hafta', txt:n=>`${n}, bu hafta yoğunuz. Gelecek hafta alabilir misin?`, fx:e => moodOne(e, 1)},
             {ikon:'🚫', ad:'Olmaz', txt:n=>`${n}, şu an izin veremem. Proje bitmeden kimse ayrılmasın.`, fx:e => moodOne(e, -9)}]},
  zam: {ok:e => S.day - (e.hired||0) > 90 || e.skill >= 6, subject:'Maaşım hakkında', lines:e => ['Patron,', 'Bir süredir buradayım ve sorumluluklarımın epey arttığını düşünüyorum.', `Piyasadaki benzer pozisyonlara baktığımda maaşımın biraz geride kaldığını görüyorum. Bunu konuşabilir miyiz?`, 'Burada çalışmayı gerçekten seviyorum, sadece emeğimin karşılığını almak istiyorum.'],
    replies:[{ikon:'💰', ad:'%10 zam', txt:n=>`${n}, haklısın. Bu aydan itibaren maaşına %10 zam yapıyorum. Emeğin için teşekkürler.`, fx:e => { e.salary = round10(e.salary*1.1); moodOne(e, 16); }},
             {ikon:'🪙', ad:'%5 zam', txt:n=>`${n}, şimdilik %5 yapabiliyorum. Şirket büyüdükçe tekrar konuşalım.`, fx:e => { e.salary = round10(e.salary*1.05); moodOne(e, 6); }},
             {ikon:'✋', ad:'Şimdilik olmaz', txt:n=>`${n}, şu an bütçemiz buna uygun değil. İlerleyen aylarda tekrar bakalım.`, fx:e => moodOne(e, -12)}]},
  tesekkur: {ok:e => (e.mood??70) >= 75, subject:'Teşekkür etmek istedim', lines:e => ['Patron,', pick(['Bu ekipte çalışmak gerçekten çok keyifli. Her sabah işe isteyerek geliyorum.', 'Son projede bana güvendiğiniz için teşekkürler. Çok şey öğrendim.', 'Ofisin havası, ekip arkadaşlarım… Buraya gelmek iyi ki olmuş diyorum.']), 'Sadece bunu bilmenizi istedim. İyi çalışmalar!'],
    replies:[{ikon:'🤝', ad:'Asıl ben teşekkür ederim', txt:n=>`${n}, asıl ben teşekkür ederim. Senin gibi biriyle çalışmak büyük şans.`, fx:e => { moodOne(e, 5); moodAll(2); }},
             {ikon:'👍', ad:'Böyle devam', txt:n=>`Çok sevindim ${n}. Böyle devam!`, fx:e => moodOne(e, 2)},
             {ikon:'🧊', ad:'Gerek yok', txt:n=>`Teşekküre gerek yok ${n}, işine odaklan yeter.`, fx:e => moodOne(e, -7)}]},
  yorgun: {ok:e => (e.mood??70) < 50, subject:'Biraz yoruldum', lines:e => ['Patron,', 'Son haftalar çok yoğun geçti. Akşamları eve gittiğimde bile aklım hâlâ işte oluyor.', 'Böyle devam ederse hata yapmaya başlayacağımdan korkuyorum. Biraz nefes alabilir miyiz?'],
    replies:[{ikon:'🛌', ad:'Bir gün dinlen', txt:n=>`${n}, haklısın. Yarın izinlisin, güzelce dinlen.`, fx:e => moodOne(e, 14)},
             {ikon:'🏖️', ad:'Proje bitince tatil', txt:n=>`${n}, bu projeyi bitirince herkese birkaç gün izin vereceğim. Söz.`, fx:e => { moodOne(e, 6); S.promise = S.day; }},
             {ikon:'💪', ad:'Biraz daha sabır', txt:n=>`${n}, herkes yorgun. Biraz daha dayanmamız lazım.`, fx:e => moodOne(e, -8)}]},
  egitim: {ok:e => e.skill < 9, subject:'Bir eğitim buldum', lines:e => ['Patron,', `İnternette ${ROLES[e.role].ad.toLowerCase()}lar için çok iyi bir online eğitim buldum. Ücreti <b>${tl(eduCost(e))}</b>.`, 'Şirket bunu karşılarsa hem kendimi geliştiririm hem de işlere daha hızlı yetişirim.'],
    replies:[{ikon:'🎓', ad:'Şirket karşılasın', txt:n=>`${n}, harika bir fikir. Ücretini şirket ödesin, hemen başla.`, fx:e => { const c = eduCost(e); S.money -= c; e.skill = Math.min(10, e.skill + 1); moodOne(e, 10); toast(`🎓 ${esc(e.name)} eğitimi bitirdi: beceri +1 (−${tl(c)})`); }},
             {ikon:'🤝', ad:'Yarısını öde', txt:n=>`${n}, ücretin yarısını şirket karşılasın, yarısı senden. Olur mu?`, fx:e => { const c = Math.round(eduCost(e)/2); S.money -= c; e.skill = Math.min(10, e.skill + 1); moodOne(e, 3); toast(`🎓 ${esc(e.name)} eğitimi bitirdi: beceri +1 (−${tl(c)})`); }},
             {ikon:'✋', ad:'Şimdi olmaz', txt:n=>`${n}, şu an bütçeyi buna ayıramıyoruz. Belki ileride.`, fx:e => moodOne(e, -5)}]},
  ekipman: {ok:e => typeof eqBehindAll==='function' && eqBehindAll() > 0, subject:'Bilgisayarım çok yavaş', lines:e => ['Patron,', 'Derleme yaparken bilgisayarım donup kalıyor, bazen bir dosyayı açmak bile dakikalar sürüyor.', 'Rakip şirketlerdeki arkadaşlarım çok daha iyi ekipmanlarla çalışıyor. Yenileme planınız var mı?'],
    replies:[{ikon:'🖥️', ad:'Yakında yenileriz', txt:n=>`${n}, haklısın. Ekipmanları en kısa sürede yenileyeceğim.`, fx:e => { moodOne(e, 4); S.promise = S.day; }},
             {ikon:'📊', ad:'Bütçeye bakarım', txt:n=>`${n}, bütçeye bakıp sana döneceğim.`, fx:e => moodOne(e, 1)},
             {ikon:'🔧', ad:'İdare et', txt:n=>`${n}, şimdilik idare etmemiz lazım.`, fx:e => moodOne(e, -6)}]},
};
// her e-postaya üç cevap: iyi · orta · sert
const TONES = ['İyi', 'Orta', 'Sert'];
function replyBtns(list, act, id, n){
  return `<div class="rh">Cevabını seç</div><div class="replies r3">${list.map((r,i)=>`<button class="rep t${i}" data-act="${act}" data-id="${id}" data-v="${i}"><span class="rtone">${TONES[i]}</span><b>${r.ad}</b><small>“${r.txt(n)}”</small></button>`).join('')}</div>`;
}
// müşteri değerlendirmesine cevap
function clientReplies(m){
  const n = esc(m.who || 'Sayın yetkili');
  return m.score >= 6 ? [
    {ad:'İçten teşekkür', txt:()=>`${n}, güzel sözleriniz için çok teşekkür ederiz. Bir sonraki projenizde de yanınızdayız!`, fx:()=>{ S.rep += 2; toast('⭐ Müşteri cevabından çok memnun kaldı: itibar +2'); }},
    {ad:'Kısa teşekkür', txt:()=>`Geri bildiriminiz için teşekkürler, ${n}.`, fx:()=>{}},
    {ad:'Soğuk cevap', txt:()=>`Ödemenin zamanında yapılmasını rica ederiz.`, fx:()=>{ S.rep = Math.max(0, S.rep-2); toast('😒 Müşteri soğuk cevabına bozuldu: itibar −2'); }},
  ] : [
    {ad:'Özür + ücretsiz düzeltme', txt:()=>`${n}, beklentinizi karşılayamadığımız için özür dileriz. Eksikleri ücretsiz olarak düzelteceğiz.`, fx:()=>{ const c = Math.round(m.pay*0.15); S.money -= c; S.rep += 3; toast(`🤝 Ücretsiz düzeltme müşteriyi yumuşattı: itibar +3 (−${tl(c)})`); }},
    {ad:'Not aldık', txt:()=>`Geri bildiriminiz için teşekkürler, ${n}. Eleştirilerinizi dikkate alacağız.`, fx:()=>{ S.rep += 1; }},
    {ad:'Suçu reddet', txt:()=>`İstediğiniz her şeyi yaptık. Sorun bizde değil.`, fx:()=>{ S.rep = Math.max(0, S.rep-4); toast('😠 Müşteri cevabını herkese anlattı: itibar −4'); }},
  ];
}
function clientReplyHTML(m){
  if (!m.replyable) return '';
  if (m.answered != null) return `<div class="myreply"><div class="rh">↩️ Senin cevabın</div><p>${esc(m.reply)}</p></div>`;
  return replyBtns(clientReplies(m), 'client-rep', m.id, '');
}
function clientReply(id, i){
  const m = (S.inbox||[]).find(x => x.id===id); if (!m || m.answered != null) return;
  const r = clientReplies(m)[i]; m.answered = i; m.reply = r.txt().replace(/<[^>]+>/g,''); m.read = true; r.fx(); snd('click');
  if (page === 'mesaj') renderPage(true);
}
const avgMood = () => S.emps.length ? S.emps.reduce((a,e)=>a+(e.mood??70),0)/S.emps.length : 70;
const teamCost = k => round10(Math.max(8000, salaries()*k));
Object.assign(STAFF_NOTES, {
  yarisma: {ok:e => S.emps.length >= 2, subject:'Ekip içi yarışma fikri', lines:(e,m) => { m.cost = teamCost(0.08); return ['Patron,', 'Ekipçe konuştuk: aramızda küçük bir kodlama yarışması düzenlemeyi düşündük. En temiz ve hızlı çözümü yazan kazansın.', `Kazanana küçük bir ödül olursa (yaklaşık <b>${tl(m.cost)}</b>) herkes çok heveslenir. Ne dersiniz?`]; },
    replies:[{ikon:'🏆', ad:'Ödülü ben koyarım', txt:n=>`Harika fikir ${n}! Ödülü şirket versin, yarışma bu cuma başlasın.`, fx:(e,m) => { S.money -= m.cost; moodAll(7, 'Kodlama yarışması ekibi coşturdu'); S.boost = Math.max(S.boost||0, 5); toast(`🏆 Yarışma çok eğlenceli geçti: ekip 5 gün daha hızlı (−${tl(m.cost)})`); }},
             {ikon:'🙂', ad:'Ödülsüz yapın', txt:n=>`${n}, yarışmayı yapın ama ödül şimdilik yok. Kazananı ben tebrik ederim.`, fx:e => moodAll(2)},
             {ikon:'🚫', ad:'İş saatinde olmaz', txt:n=>`${n}, mesai saatinde yarışmaya vaktimiz yok. İşe odaklanın.`, fx:e => { moodOne(e, -6); moodAll(-2); }}]},
  destek: {ok:e => avgMood() < 68 && S.emps.length >= 2, subject:'Ekip için küçük bir destek', lines:(e,m) => { m.cost = teamCost(0.12); return ['Patron,', 'Son zamanlarda arkadaşların morali biraz düşük, yoğunluk herkesi yordu.', `Moral için küçük bir bütçe ayırabilir misiniz? Yemek kartı, ufak bir etkinlik… Yaklaşık <b>${tl(m.cost)}</b> yeterli olur.`, 'Bunun ekibe çok iyi geleceğine inanıyorum.']; },
    replies:[{ikon:'💳', ad:'Tamamını ver', txt:n=>`${n}, haklısın. Bütçenin tamamını onaylıyorum, ekibe iyi bakın.`, fx:(e,m) => { S.money -= m.cost; moodAll(9, 'Patron moral bütçesi verdi'); toast(`💙 Ekip moral bütçesine çok sevindi (−${tl(m.cost)})`); }},
             {ikon:'🪙', ad:'Yarısını ver', txt:n=>`${n}, şimdilik yarısını verebiliyorum. Ay sonunda tekrar bakalım.`, fx:(e,m) => { S.money -= Math.round(m.cost/2); moodAll(3); }},
             {ikon:'✋', ad:'Bütçe yok', txt:n=>`${n}, şu an böyle bir bütçemiz yok.`, fx:e => { moodOne(e, -5); moodAll(-4, 'Moral desteği reddedildi'); }}]},
  dogumgunu: {ok:e => S.emps.length >= 2, subject:'Bugün bir doğum günü var!', lines:(e,m) => { const o = pick(S.emps.filter(x => x!==e)); m.oid = o.id; return ['Patron,', `Bugün <b>${esc(o.name)}</b>'in doğum günü! Ona küçük bir sürpriz yapmak istiyoruz.`, 'Bir pasta alıp öğle arasında kutlasak nasıl olur?']; },
    replies:[{ikon:'🎂', ad:'Pasta benden', txt:n=>`Süper fikir ${n}! Pasta şirketten, ben de geleceğim.`, fx:(e,m) => { S.money -= 2500; const o = S.emps.find(x => x.id===m.oid); if (o) moodOne(o, 12); moodAll(4); toast('🎂 Doğum günü kutlaması herkesi mutlu etti'); }},
             {ikon:'✍️', ad:'Kart imzalayalım', txt:n=>`${n}, bir kart alın, hepimiz imzalayalım.`, fx:(e,m) => { const o = S.emps.find(x => x.id===m.oid); if (o) moodOne(o, 5); }},
             {ikon:'⏱️', ad:'Vaktimiz yok', txt:n=>`${n}, bugün çok yoğunuz, kutlamaya vakit yok.`, fx:(e,m) => { const o = S.emps.find(x => x.id===m.oid); if (o) moodOne(o, -8); moodOne(e, -3); }}]},
  uzaktan: {ok:e => true, subject:'Evden çalışma isteği', lines:e => ['Patron,', 'Yol her gün neredeyse iki saatimi alıyor. Haftada bir gün evden çalışabilir miyim?', 'Toplantılara her zaman katılırım, işlerim aksamaz.'],
    replies:[{ikon:'🏠', ad:'Tabii, olur', txt:n=>`Olur ${n}, haftada bir gün evden çalışabilirsin.`, fx:e => moodOne(e, 11)},
             {ikon:'🧪', ad:'Bir ay deneyelim', txt:n=>`${n}, bir ay deneyelim, işler aksamazsa devam ederiz.`, fx:e => moodOne(e, 5)},
             {ikon:'🚫', ad:'Ofiste olmalısın', txt:n=>`${n}, ekip olarak aynı yerde çalışmamız lazım. Olmaz.`, fx:e => moodOne(e, -8)}]},
  teknoloji: {ok:e => true, subject:'Yeni bir teknoloji denesek mi?', lines:e => ['Patron,', pick(['Yeni çıkan bir arayüz kütüphanesi var, işlerimizi epey hızlandırabilir.', 'Otomatik test araçlarında çok güzel gelişmeler var, denemek isterim.', 'Yapay zekâ destekli kod araçlarını bir hafta denemek istiyorum.']), 'Biraz araştırma vakti verirseniz ekibe sunum yapabilirim.'],
    replies:[{ikon:'🔬', ad:'Araştır', txt:n=>`${n}, harika! Bu hafta biraz vakit ayır ve bize anlat.`, fx:e => { moodOne(e, 7); S.rp = (S.rp||0) + 3; toast('🔬 Araştırma sunumu ekibe ilham verdi: +3 Ar-Ge puanı'); }},
             {ikon:'📝', ad:'Sonra bakalım', txt:n=>`${n}, ilginç. Proje bitince bakalım.`, fx:e => moodOne(e, 1)},
             {ikon:'🚫', ad:'Gerek yok', txt:n=>`${n}, şu an kullandıklarımız yeterli.`, fx:e => moodOne(e, -5)}]},
  sikayet: {ok:e => S.emps.length >= 2, subject:'Bir arkadaşla sorun yaşıyorum', lines:(e,m) => { const o = pick(S.emps.filter(x => x!==e)); m.oid = o.id; return ['Patron,', `Son zamanlarda <b>${esc(o.name)}</b> ile pek anlaşamıyoruz. Kod incelemelerinde sürekli tartışıyoruz.`, 'Ortamı germek istemiyorum ama bu durum işimi de etkilemeye başladı. Yardımcı olabilir misiniz?']; },
    replies:[{ikon:'🤝', ad:'Arabulucu olurum', txt:n=>`${n}, ikinizle birlikte oturup konuşalım. Eminim çözeriz.`, fx:(e,m) => { moodOne(e, 6); const o = S.emps.find(x => x.id===m.oid); if (o) moodOne(o, 6); }},
             {ikon:'🗣️', ad:'Kendiniz çözün', txt:n=>`${n}, önce kendi aranızda konuşmayı deneyin. Olmazsa ben devreye girerim.`, fx:e => moodOne(e, -1)},
             {ikon:'🧊', ad:'Çocuk gibisiniz', txt:n=>`${n}, ikiniz de yetişkinsiniz. Bu tür şeylerle beni uğraştırmayın.`, fx:(e,m) => { moodOne(e, -7); const o = S.emps.find(x => x.id===m.oid); if (o) moodOne(o, -7); }}]},
});
/* ---- ANİ İZİN: bazı çalışanlar bir anda mesaj atıp hemen çıkmak ister.
   İzin verirsen birkaç gün yoktur ama morali yükselir; vermezsen morali sert düşer. ---- */
const ACIL_REASONS = [
  ['Annem hastaneye kaldırıldı', 'Annem fenalaşmış, hastaneye kaldırmışlar. Hemen yanına gitmem gerekiyor.', 2],
  ['Babam rahatsızlandı', 'Babam evde düşmüş, yanında kimse yok. Ona bakmaya gitmem lazım.', 2],
  ['Çocuğum okulda ateşlendi', 'Okuldan aradılar, çocuğum ateşlenmiş. Gidip almam lazım.', 1],
  ['Eşimin doğumu başladı', 'Eşimin doğumu başladı, hastaneye yetişmem lazım. Bebeğimiz geliyor!', 3],
  ['Eşim rahatsızlandı', 'Eşim birden rahatsızlandı, doktora götürmem gerekiyor.', 1],
  ['Arkadaşım kaza geçirdi', 'Yakın bir arkadaşım trafik kazası geçirmiş, hastanedeymiş. Ailesi şehir dışında, yanında kimse yok.', 1],
  ['Kardeşim yolda kaldı', 'Kardeşimin arabası otoyolda bozulmuş, yolda kalmış. Almaya gitmem gerekiyor.', 1],
  ['Tapu randevumu unutmuşum', 'Bugün tapu randevum varmış, tamamen unutmuşum! Kaçırırsam aylarca beklemem gerekecek.', 1],
  ['Pasaport randevum vardı', 'Pasaport randevum bugünmüş, aklımdan çıkmış. Bir daha randevu bulmak çok zor.', 1],
  ['Evde su borusu patladı', 'Komşum aradı, evde boru patlamış, alt kata su akıyormuş. Hemen gitmem lazım.', 1],
  ['Veli toplantısını unuttum', 'Çocuğumun okulunda veli toplantısı varmış, öğretmeni aradı. Unutmuşum!', 1],
  ['Kedim çok hasta', 'Kedim sabahtan beri hiçbir şey yemiyor, durumu kötü. Veterinere götürmem lazım.', 1],
];
function goLeave(e, d){ e.task = {type:'izin', until:S.day + d}; sceneKey = ''; toast(`${esc(firstName(e))} ${d} gün izinli, işlerine ${d} gün sonra dönecek.`); }
STAFF_NOTES.acil = {ok:e => false, subject:'ACİL: hemen çıkmam lazım',
  lines:(e,m) => { const r = acilReason(e, m); m.days = r[2] + (e.liar && Math.random() < 0.5 ? 1 : 0); m.subject = 'ACİL: ' + r[0];
    return ['Patron, kusura bakma, çok ani oldu.', r[1], m.days > 1 ? `${m.days} gün izin alabilir miyim? Döner dönmez işlerimi toparlarım.` : 'Bugün çıkmam gerekiyor, izin verir misin? Yarın işimin başında olurum.']; },
  replies:[{ad:'Hemen git', txt:n=>`${n}, hiç düşünme, hemen git. Bir şeye ihtiyacın olursa beni ara.`, fx:(e,m) => { moodOne(e, 12); goLeave(e, m.days||1); }},
           {ad:'İşini toparla, çık', txt:n=>`${n}, elindeki işi ekibe devret, öğleden sonra çıkabilirsin.`, fx:(e,m) => { moodOne(e, -2); goLeave(e, Math.max(1, (m.days||1)-1)); }},
           {ad:'Olmaz', txt:n=>`${n}, şu an çok yoğunuz, gidemezsin. İşinin başına dön.`, fx:e => {
              moodOne(e, -20); moodAll(-3);
              if ((e.mood??70) < 25 && Math.random() < 0.25) setTimeout(() => { if (!S || !S.emps.includes(e)) return; S.emps = S.emps.filter(x => x!==e); sceneKey = ''; toast(`${esc(e.name)} izin vermediğin için istifa etti!`); snd('bad'); }, 2500);
              else toast(`${esc(firstName(e))} çok kırıldı, morali dibe vurdu.`); }}]};
/* ---- YALAN İZİN: bir çalışan kaytarmak için yalan söyler. İpuçları mesajda görünür ---- */
const LIE_HINTS = ['Mesajı gönderdikten hemen sonra sosyal medyada çevrimiçi göründü.', 'Dün öğle arasında arkadaşlarına hafta sonu planından bahsediyordu.', 'Geçen izinden bronzlaşmış dönmüştü.', 'Mesaj tam da yoğun bir teslim gününden önce geldi.', 'Telefonda konuşurken arkadan müzik ve kahkaha sesleri geliyordu.', 'Ekip arkadaşı, onun bugün maça gideceğini duyduğunu söyledi.'];
function acilReason(e, m){
  const log = e.acilLog || (e.acilLog = []);
  let i = Math.floor(Math.random()*ACIL_REASONS.length);
  if (e.liar && log.length && Math.random() < 0.55) i = log[log.length-1].r;                       // yalancı aynı bahaneyi tekrarlar
  else if (!e.liar) for (let k = 0; k < 6 && log.some(x => x.r === i); k++) i = Math.floor(Math.random()*ACIL_REASONS.length);
  const clues = [], recent = log.filter(x => S.day - x.d <= 45).length, same = log.filter(x => x.r === i).pop();
  if (recent >= 1) clues.push(`Son 45 günde ${recent + 1}. acil izin isteği.`);
  if (same) clues.push(`Aynı bahaneyi ${same.d}. günde de söylemişti.`);
  if (e.liar && Math.random() < 0.65) clues.push(pick(LIE_HINTS));
  if ((e.lieCaught||0) > 0) clues.push(`Daha önce ${e.lieCaught} kez yalan söylerken yakalandı.`);
  log.push({d:S.day, r:i}); if (log.length > 12) log.shift();
  m.lie = !!e.liar; m.clues = clues;
  return ACIL_REASONS[i];
}
function acilLie(id){
  const m = (S.inbox||[]).find(x => x.id===id), e = m && S.emps.find(x => x.id===m.eid);
  if (!m || m.answered != null || !e) return;
  const n = e.name.split(' ')[0];
  m.answered = 3; m.reply = `${n}, bu hikâyeye inanmıyorum. Bana doğruyu söyle.`; m.read = true; snd('click');
  closeModal();
  if (m.lie){
    e.lieCaught = (e.lieCaught||0) + 1; m.caught = true; exS().liarCaught = true;
    curChoices = [
      () => { S.emps = S.emps.filter(x => x!==e); sceneKey = ''; moodAll(2); toast(`${esc(e.name)} yalan söylediği için kovuldu. Ekip adil davrandığını düşünüyor.`); snd('bad'); },
      () => { e.ceza = {until:S.day + 5}; e.liar = Math.random() < 0.35; moodOne(e, -14); toast(`${esc(n)} 5 gün boyunca herkes eve gidince ofiste kalıp ek mesai yapacak.`); snd('ok'); },
      () => { const c = round10(e.salary*0.25); S.money += c; e.liar = Math.random() < 0.5; moodOne(e, -12); toast(`${esc(n)} maaşından ${tl(c)} kesildi.`); snd('ok'); },
      () => { e.liar = Math.random() < 0.8; moodOne(e, -4); toast(`${esc(n)} son kez uyarıldı.`); },
    ];
    showModal('', `<div class="acilhd" style="background:#c2410c">YAKALANDI</div><h3 style="margin:4px 0">${esc(e.name)} itiraf etti</h3>
      <p class="sub" style="text-align:center;margin:0 0 10px">"Patron... haklısın. Aslında gitmem gereken bir yer yoktu, biraz kaytarmak istedim. Çok özür dilerim."</p>
      <div class="pxlbl">Ne yapacaksın?</div>
      <div class="cezagrid">
        <button class="act" data-act="choice" data-i="0"><b>İşten kov</b><small>Hemen ayrılır · ekip adil bulur</small></button>
        <button class="act" data-act="choice" data-i="1"><b>Ek mesai cezası</b><small>5 gün herkes eve gidince ofiste kalır, daha çok çalışır · moral −14</small></button>
        <button class="act" data-act="choice" data-i="2"><b>Maaşından kes</b><small>Maaşının dörtte biri kesilir (${tl(round10(e.salary*0.25))}) · moral −12</small></button>
        <button class="act" data-act="choice" data-i="3"><b>Son kez uyar</b><small>Ceza yok · tekrar yapabilir</small></button>
      </div>`, 'pro');
  } else {
    moodOne(e, -25); moodAll(-4); goLeave(e, m.days||1);
    if (Math.random() < 0.25) setTimeout(() => { if (!S || !S.emps.includes(e)) return; S.emps = S.emps.filter(x => x!==e); sceneKey = ''; toast(`${esc(e.name)} haksız yere suçlandığı için istifa etti!`); snd('bad'); }, 2500);
    else toast(`${esc(n)} gerçekten zor durumdaydı. Haksız yere suçlanınca çok kırıldı, ekip de bozuldu.`);
    snd('bad');
  }
  if (page === 'mesaj') renderPage(true);
}
/* ---- orta/büyük işten sonra: "bu bilgisayarlarla çok yavaşız" ---- */
STAFF_NOTES.pcyavas = {ok:e => false, subject:'Bu bilgisayarlarla çok yavaşız',
  lines:(e,m) => ['Patron,', `<b>${esc(m.pname||'Son proje')}</b> bitti ama açıkçası bilgisayarlarımız bizi çok yavaşlattı. Derleme yaparken ekran donuyor, tasarım dosyaları dakikalarca açılmıyor.`, 'Bu büyüklükte işleri daha hızlı yapabilmemiz için daha güçlü bilgisayarlara ihtiyacımız var. Geliştir sayfasından yenileyebilir miyiz?'],
  replies:[{ad:'Hemen yenileyelim', txt:n => `Haklısın ${n}. En kısa sürede bilgisayarları yenileyeceğim.`, fx:e => { moodOne(e, 6); moodAll(2); S.promise = S.day; toast('Bilgisayarları Geliştir sayfasından yükseltebilirsin.'); }},
           {ad:'Bütçeye bakarım', txt:n => `${n}, bütçeye bakıp sana döneceğim.`, fx:e => moodOne(e, 1)},
           {ad:'İdare edin', txt:n => `${n}, şimdilik bunlarla idare etmemiz lazım.`, fx:e => { moodOne(e, -6); moodAll(-2); }}]};
function pcComplain(p){
  if (!p || SIZES[p.size].i < 1 || eqTier('pc') >= 2 || !S.emps.length || S.day < (S.nextPcAsk||0)) return;
  const pool = S.emps.filter(e => !isAway(e)); if (!pool.length) return;
  const e = pool.find(x => x.role==='prog') || pool[0], N = STAFF_NOTES.pcyavas;
  S.nextPcAsk = S.day + 40;
  const m = {id:S.idSeq++, kind:'not', tpl:'pcyavas', day:S.day, eid:e.id, from:e.name, role:e.role, emo:e.emo, subject:N.subject, pname:p.name, lines:[], answered:null, read:false}; m.lines = N.lines(e, m);
  S.inbox = [m].concat(S.inbox||[]).slice(0, 40);
  toast(`${esc(firstName(e))} sana bir e-posta gönderdi: “${N.subject}”`); snd('event');
}
/* ---- fikir e-postasında devam yazışması ---- */
const IDEA_FU = [
  {ad:'Ayrıntıları gönder', txt:n => `${n}, fikrini tekrar düşündüm, gerçekten iyi. İşle ilgili düşündüklerini bana gönder, başlayalım.`},
  {ad:'Başka fikrin var mı?', txt:n => `${n}, bu fikir pek içime sinmedi ama düşünmen çok güzel. Başka bir fikrin olursa yine yaz.`},
  {ad:'Vazgeçtim', txt:n => `${n}, tekrar düşündüm ve bu fikri beğenmedim. Şimdilik mevcut işlere odaklanalım.`},
];
function ideaFollow(id, i){
  const m = (S.inbox||[]).find(x => x.id===id), e = m && S.emps.find(x => x.id===m.eid);
  if (!m || m.fu != null || !e) return;
  const n = e.name.split(' ')[0]; m.fu = i; m.fuReply = IDEA_FU[i].txt(n); snd('click');
  if (i === 0){ moodOne(e, 8);
    m.fuLines = ['Patron, çok sevindim! Kafamdakileri toparladım:', `<b>Ürün:</b> ${TOPICS[m.tp].ad} temalı bir ${TYPES[m.ty].ad.toLowerCase()}`, `<b>Hedef kitle:</b> ${AUDS[m.aud] ? AUDS[m.aud].ad : 'Herkes'}`, 'İlk sürümü küçük tutup kullanıcıların tepkisine göre büyütmeyi öneriyorum. Hazır olduğunda hemen başlayabiliriz!']; }
  else if (i === 1){ moodOne(e, 1); S.nextNote = Math.min(S.nextNote || 1e9, S.day + 3); m.fuLines = ['Anladım patron, sorun değil. Kafamda birkaç fikir daha var, toparlayınca yine yazarım.']; }
  else { moodOne(e, -6); m.fuLines = ['Peki patron... Anlıyorum.']; }
  if (page === 'mesaj') renderPage(true);
}
function ideaStart(id){
  const m = (S.inbox||[]).find(x => x.id===id); if (!m || !m.tp) return;
  if (!S.tech[m.ty]){ toast(`${TYPES[m.ty].ad} henüz açık değil.`); snd('bad'); return; }
  form.type = m.ty; form.topic = m.tp; form.aud = AUDS[m.aud] ? m.aud : form.aud; form.name = ''; m.started = true;
  const e = S.emps.find(x => x.id===m.eid); if (e) moodOne(e, 6);
  closeModal(); openPage('yeni');
}
function openNoteModal(m){
  m.read = true;
  showModal('', `<div class="acilhd">ACİL MESAJ</div>` + noteMailHTML(m));
  const w = $('modal').querySelector('.mwrap'); if (w) w.classList.add('wide');
}
function acilDay(){
  const live = S.emps.filter(e => !isAway(e) && !e.task && !(e.ceza && S.day < e.ceza.until));
  if (!S.liarPicked && S.emps.length >= 3){ pick(S.emps).liar = true; S.liarPicked = true; }   // ekipte bir kaytarıcı olur
  if (S.nextAcil == null) S.nextAcil = S.day + 8 + Math.floor(Math.random()*10);
  if (S.day < S.nextAcil || !live.length) return;
  if ((S.inbox||[]).some(m => m.tpl==='acil' && mailNeedsReply(m))) return;
  S.nextAcil = S.day + Math.max(7, 24 - live.length*2) + Math.floor(Math.random()*10);
  // bazı çalışanlar buna çok daha yatkın
  for (const x of live) if (x.acilP == null) x.acilP = Math.random() < 0.35 ? 4 : 1;
  const wt = x => x.liar ? 7 : x.acilP;
  let r = Math.random() * live.reduce((a,x) => a + wt(x), 0), e = live[0];
  for (const x of live){ r -= wt(x); if (r <= 0){ e = x; break; } }
  const N = STAFF_NOTES.acil;
  const m = {id:S.idSeq++, kind:'not', tpl:'acil', urgent:true, day:S.day, eid:e.id, from:e.name, role:e.role, emo:e.emo, subject:N.subject, lines:[], answered:null, read:false}; m.lines = N.lines(e, m);
  S.inbox = [m].concat(S.inbox||[]).slice(0, 40);
  snd('event');
  if (!page && $('modal').classList.contains('hidden')) openNoteModal(m);
  else toast(`${esc(firstName(e))} acil bir mesaj attı: “${m.subject.replace('ACİL: ','')}”`);
}
const eduCost = e => round10(Math.max(5000, e.salary*0.6));
function staffNoteDay(){
  const live = S.emps.filter(e => !isAway(e));
  if (!live.length) return;
  if (!S.nextNote) S.nextNote = S.day + 4 + Math.floor(Math.random()*5);
  if (S.day < S.nextNote) return;
  if ((S.inbox||[]).some(m => m.kind==='not' && mailNeedsReply(m))){ S.nextNote = S.day + 2; return; }
  S.nextNote = S.day + Math.max(4, 12 - live.length) + Math.floor(Math.random()*6);
  const e = pick(live), keys = Object.keys(STAFF_NOTES).filter(k => STAFF_NOTES[k].ok(e));
  const k = (e.mood??70) < 50 && keys.includes('yorgun') ? 'yorgun' : pick(keys), N = STAFF_NOTES[k];
  const m = {id:S.idSeq++, kind:'not', tpl:k, day:S.day, eid:e.id, from:e.name, role:e.role, emo:e.emo, subject:N.subject, lines:[], answered:null, read:false}; m.lines = N.lines(e, m);
  S.inbox = [m].concat(S.inbox||[]).slice(0, 40);
  toast(`📧 ${esc(firstName(e))} sana bir e-posta gönderdi: “${N.subject}”`); snd('event');
}
function noteMailHTML(m){
  const e = S.emps.find(x => x.id===m.eid), N = STAFF_NOTES[m.tpl];
  const head = `<div class="mailh"><div class="mav">${avatarSVG(m.eid, m.role, m.emo)}</div><div class="grow">
      <div><span class="mut">Kimden:</span> <b>${esc(m.from)}</b> <span class="mut">· ${ROLES[m.role].ad}</span></div>
      <div><span class="mut">Kime:</span> <b>${esc(S.boss || 'Patron')}</b> <span class="mut">· ${m.day}. gün</span></div>
      <div><span class="mut">Konu:</span> <b>${esc(m.subject)}</b></div></div></div>`;
  const body = `<div class="letter mail">${m.lines.map(l=>`<p>${l}</p>`).join('')}<p class="sig">— ${esc(m.from)}</p></div>`;
  let foot;
  if (m.answered != null) foot = `<div class="myreply"><div class="rh">↩️ Senin cevabın</div><p>${esc(m.reply)}</p></div>`;
  else if (m.ignored) foot = `<p class="sub" style="text-align:center">Bu e-postaya zamanında cevap vermedin.</p>`;
  else if (!e) foot = `<p class="sub" style="text-align:center">${esc(m.from)} artık şirkette çalışmıyor.</p>`;
  else { const n = esc(e.name.split(' ')[0]);
    foot = replyBtns(N.replies, 'note-rep', m.id, n);
    if (m.tpl==='acil') foot += `<button class="rep liebtn" data-act="acil-lie" data-id="${m.id}"><span class="rtone">Şüpheli</span><b>Yalan söylüyorsun</b><small>“${n}, bu hikâyeye inanmıyorum. Doğruyu söyle.” · haklıysan ceza verirsin, haksızsan çok kırılır</small></button>`; }
  const clue = m.tpl==='acil' && m.clues && m.clues.length ? `<div class="lieclue"><b>Dikkatini çekenler</b><ul>${m.clues.map(c => `<li>${c}</li>`).join('')}</ul></div>` : '';
  let fu = '';
  if (m.tpl==='oneri' && e && (m.answered===0 || m.answered===1)){
    const n = esc(e.name.split(' ')[0]);
    if (m.fu == null) fu = `<div class="rh" style="margin-top:10px">Yazışmaya devam et</div><div class="replies r3">${IDEA_FU.map((r,i) => `<button class="rep t${i}" data-act="idea-fu" data-id="${m.id}" data-v="${i}"><b>${r.ad}</b><small>“${r.txt(n)}”</small></button>`).join('')}</div>`;
    else fu = `<div class="myreply"><div class="rh">Senin cevabın</div><p>${esc(m.fuReply)}</p></div><div class="letter mail">${(m.fuLines||[]).map(l => `<p>${l}</p>`).join('')}<p class="sig">— ${esc(m.from)}</p></div>`
      + (m.fu === 0 && m.tp ? `<button class="btn block" data-act="idea-start" data-id="${m.id}">${m.started ? 'Bu fikirle yeni ürün sayfasını tekrar aç' : 'Bu fikirle ürün geliştirmeye başla'}</button>` : '');
  }
  return head + body + clue + foot + fu;
}
function noteReply(id, i){
  const m = (S.inbox||[]).find(x => x.id===id), e = m && S.emps.find(x => x.id===m.eid);
  if (!m || m.answered != null || !e) return;
  const r = STAFF_NOTES[m.tpl].replies[i], n = e.name.split(' ')[0];
  m.answered = i; m.reply = r.txt(n); m.read = true;
  r.fx(e, m); snd('click');
  const md = $('modal'); if (!md.classList.contains('hidden') && md.querySelector('[data-act="note-rep"]')) closeModal();
  if (page === 'mesaj') renderPage(true);
}
function stocksHTML(){
  const st = stockState();
  const mul = [1,10,100,'max'].map(v=>`<button class="chip ${stockMul===v?'on':''}" data-act="stock-mul" data-v="${v}">${v==='max'?'MAX':'x'+v}</button>`).join('');
  const pv = portfolioValue(), cost = STOCKS.reduce((a,s)=>a+st[s.k].cost,0);
  const rows = STOCKS.map(s => {
    const x = st[s.k], prev = x.hist.length > 1 ? x.hist[x.hist.length-2] : x.p, ch = (x.p/prev-1)*100;
    const pl = x.own ? x.own*x.p - x.cost : 0;
    return `<div class="card"><div class="row"><div class="grow"><b>${s.ad}</b> <span class="pill blue">${s.k}</span> <span class="pxmeta">${s.s||''}</span>
        <div class="sub">Fiyat <b>${tl(x.p)}</b> · <b class="${ch>=0?'green':'red'}">${ch>=0?'▲':'▼'} %${Math.abs(ch).toFixed(1).replace('.',',')}</b></div>
        <div class="sub">${x.own?`Elinde ${fmt(x.own)} adet · ${tl(x.own*x.p)} · <b class="${pl>=0?'green':'red'}">${pl>=0?'+':''}${tl(pl)}</b>`:'Hissen yok'}</div></div>${sparkSVG(x.hist)}</div>
      <div class="row" style="margin-top:6px;justify-content:flex-end;gap:6px"><button class="btn sm teal" data-act="stock-sell" data-v="${s.k}" ${x.own?'':'disabled'}>Sat</button><button class="btn sm" data-act="stock-buy" data-v="${s.k}" ${S.money>=x.p?'':'disabled'}>Al</button></div></div>`;
  }).join('');
  return `<div class="row" style="margin-bottom:6px"><div class="grow"><p class="sub">Gerçek piyasadaki şirketlerden esinlenen şirketler (isimleri değiştirilmiştir). Hisse al, ucuzken al pahalıyken sat! Fiyatlar her gün değişir, haberler fiyatları sarsar. İşlem ücreti %0,2.</p>
      <p class="sub">Portföy: <b>${tl(pv)}</b> · Kâr/zarar: <b class="${pv-cost>=0?'green':'red'}">${pv-cost>=0?'+':''}${tl(pv-cost)}</b></p></div></div>
    <div class="cards">${rows}</div>`;
}
function carsHTML(){
  return `<p class="sub" style="margin-bottom:8px">Şirket araçları prestij kazandırır: itibarın artar ve müşteriler sana daha çok ödeme yapar.</p><div class="cards">` +
    CARS.map(c => { const own = (S.cars||{})[c.id];
      return `<div class="card ${own?'hl':''}"><div class="row"><div class="big">${c.ikon}</div><div class="grow"><b>${c.ad}</b><div class="sub">${c.acik}</div>
        <div class="sub">+${c.rep} ⭐ itibar · müşteri ödemeleri +%${Math.round(c.pay*100)}</div></div>
        ${own?'<span class="pill green">SENİN</span>':`<button class="btn sm gold" data-act="car-buy" data-v="${c.id}" ${S.money<c.fiyat?'disabled':''}>${tl(c.fiyat)}</button>`}</div></div>`; }).join('') + '</div>';
}

/* =====================================================================
   SPRİNT PLANLAMA – her proje 3 sprintte geliştirilir.
   Her sprintte ekibin zamanı 3 göreve paylaştırılır, bir lider seçilir,
   istenirse ekstra işler eklenir. Doğru dağılım türe, müşterinin
   önceliğine ve hedef kitleye göre değişir; sprint bitince değerlendirilir.
   ===================================================================== */
const SPRINTS = [
  {ad:'Altyapı', ikon:'🏗️', acik:'Projenin temeli: veriler, sunucu ve güvenlik', role:'prog', tasks:[
    {ad:'Veritabanı',   ikon:'🗄️', acik:'Bilgiler düzenli ve hızlı saklansın', know:['sql']},
    {ad:'Sunucu & API', ikon:'🔌', acik:'Uygulamanın beyni, her şey buradan akar', know:['devops']},
    {ad:'Güvenlik',     ikon:'🔐', acik:'Şifreler ve kişisel bilgiler korunsun', know:['guv']}],
   ex:[{id:'yedek', ad:'Otomatik yedekleme', ikon:'☁️', q:2, w:0.05}, {id:'2fa', ad:'İki adımlı giriş', ikon:'🔑', q:3, w:0.07}]},
  {ad:'Özellikler', ikon:'✨', acik:'Ürünün asıl işi ve dış bağlantılar', role:'prog', tasks:[
    {ad:'Ana özellikler', ikon:'🧩', acik:'Kullanıcının asıl ihtiyacı', know:'dil'},
    {ad:'Entegrasyonlar', ikon:'🔗', acik:'Ödeme, harita, sosyal medya bağlantıları', know:['git']},
    {ad:'Performans',     ikon:'⚡', acik:'Her şey ışık hızında açılsın', know:['cpp','rust']}],
   ex:[{id:'karanlik', ad:'Karanlık mod', ikon:'🌙', q:2, w:0.05}, {id:'offline', ad:'İnternetsiz çalışma', ikon:'📴', q:3, w:0.08}]},
  {ad:'Arayüz & Test', ikon:'🎨', acik:'Görünüş, kullanım kolaylığı ve son kontroller', role:'tas', tasks:[
    {ad:'Görsel tasarım',     ikon:'🖌️', acik:'Renkler, ikonlar, ilk izlenim', know:['uiux']},
    {ad:'Kullanım kolaylığı', ikon:'👆', acik:'Herkes zorlanmadan kullanabilsin', know:['uiux']},
    {ad:'Test & hata avı',    ikon:'🐞', acik:'Hatalar yayından önce yakalansın', know:['qa']}],
   ex:[{id:'anim', ad:'Akıcı animasyonlar', ikon:'💫', q:3, w:0.07}, {id:'beta', ad:'Beta test grubu', ikon:'🧪', q:2, w:0.04, bug:0.6}]},
];
// her türün ideal zaman dağılımı (gizli; retrospektifte öğrenilir)
const SPR_IDEAL = {
  web:  [[.35,.42,.23],[.45,.30,.25],[.40,.35,.25]],
  mobil:[[.22,.48,.30],[.42,.16,.42],[.30,.45,.25]],
  oyun: [[.58,.20,.22],[.62,.14,.24],[.46,.18,.36]],
  ai:   [[.52,.36,.12],[.52,.26,.22],[.18,.42,.40]],
};
const SPR_PRIO = {hiz:[1,2,.22], guvenlik:[0,2,.25], gorsel:[2,0,.22], kolay:[2,1,.22]};
const SPR_AUD  = {yasli:[2,1,.16], genc:[2,0,.16], pro:[1,2,.16], aile:[0,2,.16]};
const SPR_BUDGET = 8, SPR_MAX = 6;
const RICON = {prog:'💻', tas:'🎨', test:'🐞'};
let spForm = null;

/* ---- TÜRE ÖZEL GELİŞTİRME: her ürün türünün kendi aşamaları, görevleri ve ekstraları var.
   görev: [ad, açıklama, bilinen beceri/dil, karşıladığı ihtiyaçlar] ---- */
const SPR_TYPES = {
  mobil:{
    st:[{ad:'Uygulama temeli', acik:'Veri, hız ve gizlilik', role:'prog'}, {ad:'Özellikler', acik:'Uygulamanın asıl işi', role:'prog'}, {ad:'Arayüz & Cihaz testi', acik:'Görünüş ve farklı telefonlarda deneme', role:'tas'}],
    tk:[[['Veri & eşitleme','Bilgiler tüm cihazlarda aynı kalsın',['sql'],{kar:2, oze:1}], ['Hız & pil','Hızlı açılsın, pili bitirmesin','dil',{hiz:3}], ['Gizlilik & izinler','Konum, kamera, rehber izinleri güvende',['guv'],{guv:3}]],
        [['Ana ekranlar','Kullanıcının asıl ihtiyacı','dil',{oze:3}], ['Bildirimler','Kullanıcıyı geri getiren hatırlatmalar',['devops'],{oze:1, kol:2}], ['İnternetsiz mod','Bağlantı yokken de çalışsın',['sql'],{kar:2, hiz:1}]],
        [['Dokunmatik tasarım','Renkler, ikonlar, ilk izlenim',['uiux'],{gor:3}], ['Tek elle kullanım','Herkes kolayca kullanabilsin',['uiux'],{kol:3}], ['Cihaz testleri','Farklı telefonlarda çökmesin',['qa'],{kar:3}]]],
    ex:[[{id:'mbulut', ad:'Bulut yedekleme', q:2, w:0.05}, {id:'mbiyo', ad:'Parmak izi ile giriş', q:3, w:0.07}],
        [{id:'mwidget', ad:'Ana ekran widget', q:2, w:0.05}, {id:'karanlik', ad:'Karanlık mod', q:2, w:0.05}],
        [{id:'anim', ad:'Akıcı animasyonlar', q:3, w:0.07}, {id:'beta', ad:'Beta test grubu', q:2, w:0.04, bug:0.6}]]},
  oyun:{
    st:[{ad:'Oyun motoru', acik:'Fizik, kontroller ve oyun dünyası', role:'prog'}, {ad:'Oynanış', acik:'Oyunu eğlenceli yapan her şey', role:'prog'}, {ad:'Grafik & Oyun testi', acik:'Görsellik, öğretici ve son kontroller', role:'tas'}],
    tk:[[['Motor & fizik','Çarpışma, yerçekimi ve hareket',['cpp','csharp'],{kar:2, hiz:1}], ['Oyun dünyası','Haritalar, seviyeler, bölümler','dil',{oze:2, gor:1}], ['Kontroller','Tuşlar ve dokunuşlar anında tepki versin',['csharp'],{kol:2, hiz:1}]],
        [['Oyun mekanikleri','Oyunu eğlenceli yapan kurallar','dil',{oze:3}], ['Çok oyunculu','Arkadaşlarla birlikte, hilesiz oyun',['devops'],{oze:1, guv:2}], ['Optimizasyon','Kare hızı düşmesin, takılmasın',['cpp','rust'],{hiz:3}]],
        [['Grafik & efektler','Göz alıcı sahneler ve ışıklar',['uiux'],{gor:3}], ['Öğretici bölüm','Yeni oyuncu hemen öğrensin',['uiux'],{kol:3}], ['Oyun testi','Takılma, hata ve zorluk dengesi',['qa'],{kar:3}]]],
    ex:[[{id:'gedit', ad:'Seviye editörü', q:2, w:0.05}, {id:'gsave', ad:'Bulut kayıt', q:2, w:0.04}],
        [{id:'gach', ad:'Başarımlar', q:2, w:0.05}, {id:'glead', ad:'Liderlik tablosu', q:2, w:0.05}],
        [{id:'gmuz', ad:'Orijinal müzikler', q:3, w:0.07}, {id:'beta', ad:'Beta test grubu', q:2, w:0.04, bug:0.6}]]},
  ai:{
    st:[{ad:'Veri hazırlığı', acik:'Modelin öğreneceği veriler', role:'prog'}, {ad:'Model', acik:'Yapay zekânın beyni', role:'prog'}, {ad:'Arayüz & Doğrulama', acik:'Kullanım ve doğruluk testleri', role:'tas'}],
    tk:[[['Veri toplama','Modelin öğreneceği örnekler',['python'],{oze:2, kar:1}], ['Veri temizliği','Hatalı, kirli veriler ayıklansın',['sql'],{kar:3}], ['Veri gizliliği','Kişisel bilgiler anonim kalsın',['guv'],{guv:3}]],
        [['Model eğitimi','Yapay zekânın beyni eğitilir',['ml'],{oze:3}], ['Hızlı yanıt','Cevaplar beklemeden gelsin',['cpp','rust'],{hiz:3}], ['Bulut & API','Başka uygulamalar da bağlansın',['devops'],{oze:1, kol:2}]],
        [['Sohbet arayüzü','Sade, anlaşılır ekranlar',['uiux'],{gor:2, kol:1}], ['Kolay kullanım','Teknik bilgisi olmayan da kullansın',['uiux'],{kol:3}], ['Doğruluk testleri','Yanlış cevaplar yakalansın',['qa'],{kar:3}]]],
    ex:[[{id:'aetiket', ad:'Veri etiketleme ekibi', q:3, w:0.07}, {id:'yedek', ad:'Otomatik yedekleme', q:2, w:0.05}],
        [{id:'agpu', ad:'Ek GPU kiralama', q:3, w:0.06}, {id:'adil', ad:'Çok dilli destek', q:2, w:0.05}],
        [{id:'anim', ad:'Akıcı animasyonlar', q:3, w:0.07}, {id:'beta', ad:'Beta test grubu', q:2, w:0.04, bug:0.6}]]},
};
// türe göre ihtiyaç adları (oyun için "Güvenlik" yerine "Hile koruması" gibi)
const NEED_NAMES = {
  mobil:{hiz:'Hız & pil', guv:'Gizlilik'},
  oyun: {hiz:'Akıcılık', guv:'Hile koruması', gor:'Grafik', kol:'Kolay öğrenilir', oze:'Eğlence', kar:'Kararlılık'},
  ai:   {hiz:'Yanıt hızı', guv:'Veri gizliliği', gor:'Arayüz', oze:'Zekâ & doğruluk'},
};
const needAd = (type, k) => ((NEED_NAMES[type]||{})[k]) || NEEDS[k].ad;
function sprStage(type, i){ const d = SPR_TYPES[type], b = SPRINTS[i]; return d ? Object.assign({}, b, d.st[i], {ikon:'', ex:d.ex[i]}) : b; }
function sprTask(type, i, j){
  const d = SPR_TYPES[type];
  if (!d) return Object.assign({needs:TASK_NEEDS[i][j]}, SPRINTS[i].tasks[j]);
  const t = d.tk[i][j]; return {ad:t[0], acik:t[1], know:t[2], needs:t[3], ikon:''};
}
const taskNeeds = (type, i, j) => sprTask(type, i, j).needs;
// tür daha önce yayınlandıysa/teslim edildiyse ihtiyaçların önemi bilinir
const needKnown = type => !!(S && S.needLearn && S.needLearn[type]);
function sprIdeal(p, i){
  const w = SPR_IDEAL[p.type][i].slice();
  for (const a of [p.brief && SPR_PRIO[p.brief.f], p.aud && SPR_AUD[p.aud]]) if (a && a[0]===i) w[a[1]] += a[2];
  const s = w.reduce((x,y)=>x+y,0); return w.map(x=>x/s);
}
// odak puanı: seçilen görevin bu iş için önemi (en önemli görev = 1)
/* ---- İHTİYAÇ PUSULASI: kullanıcıların neyi önemsediği açıkça görünür;
   her odak bazı ihtiyaçları karşılar, karşılanan ihtiyaç sonraki aşamada daha az önemlidir ---- */
const NEEDS = {
  hiz:{ad:'Hız', acik:'Her şey anında açılsın'},
  guv:{ad:'Güvenlik', acik:'Bilgiler korunsun'},
  gor:{ad:'Görsellik', acik:'Göze hoş görünsün'},
  kol:{ad:'Kolay kullanım', acik:'Zorlanmadan kullanılsın'},
  oze:{ad:'Özellik zenginliği', acik:'İşe yarar çok şey yapsın'},
  kar:{ad:'Kararlılık', acik:'Çökmesin, hata vermesin'},
};
// her aşamanın 3 odağı hangi ihtiyaçları ne kadar karşılar
const TASK_NEEDS = [
  [{kar:2, hiz:1}, {oze:2, hiz:1}, {guv:3}],
  [{oze:3}, {oze:1, kol:2}, {hiz:3}],
  [{gor:3}, {kol:3}, {kar:3}],
];
const NEED_BASE = {
  web:  {hiz:2, guv:1, gor:2, kol:2, oze:2, kar:1},
  mobil:{hiz:2, guv:1, gor:2, kol:3, oze:1, kar:2},
  oyun: {hiz:3, guv:1, gor:3, kol:1, oze:2, kar:2},
  ai:   {hiz:1, guv:2, gor:1, kol:1, oze:3, kar:2},
};
const PRIO_NEED = {hiz:'hiz', guvenlik:'guv', gorsel:'gor', kolay:'kol'};
const AUD_NEED = {yasli:{kol:1, gor:-1}, genc:{gor:1, hiz:1, guv:-1}, pro:{oze:1, guv:1, gor:-1}, aile:{guv:1, kol:1}};
// her ihtiyacın önemi (0-4) ve nedeni
function needProfile(p){
  const n = Object.assign({}, NEED_BASE[p.type] || NEED_BASE.web), why = {};
  const pr = p.kind==='is' ? (p.cfg && p.cfg.f) : null;
  if (pr && PRIO_NEED[pr]){ n[PRIO_NEED[pr]] += 2; why[PRIO_NEED[pr]] = 'Müşteri istedi'; }
  const a = p.kind!=='is' ? AUD_NEED[p.aud] : null;
  if (a) for (const [k,d] of Object.entries(a)){ n[k] += d; if (d > 0 && !why[k]) why[k] = 'Kitle: ' + AUDS[p.aud].ad; }
  for (const k in n) n[k] = clamp(n[k], 0, 4);
  return {n, why};
}
// önceki aşamalarda karşılanan ihtiyaçlar
function needCovered(p, upto){
  const c = {}; for (const k in NEEDS) c[k] = 0;
  for (const pl of (p.spr ? p.spr.plans : [])) if (pl.i < upto && pl.focus != null) for (const [k,v] of Object.entries(taskNeeds(p.type, pl.i, pl.focus))) c[k] += v;
  return c;
}
// odağın değeri: önemli ve henüz karşılanmamış ihtiyaçlara katkı
function focusValue(p, i, j){
  const {n} = needProfile(p), c = needCovered(p, i);
  let v = 0; for (const [k,a] of Object.entries(taskNeeds(p.type, i, j))) v += n[k] * a / (1 + c[k]*0.5);
  return v;
}
function sprBest(p, i){ const v = [0,1,2].map(j => focusValue(p, i, j)); return v.indexOf(Math.max(...v)); }
function sprScore(p, i, focus){ const v = [0,1,2].map(j => focusValue(p, i, j)), mx = Math.max(...v); return mx > 0 ? clamp(v[focus]/mx, 0, 1) : 1; }
const needDots = v => `<span class="ndots">${[1,2,3,4].map(k => `<i class="${k<=v?'on':''}"></i>`).join('')}</span>`;
const needTags = (t, type) => Object.entries(t).map(([k,a]) => `<span class="ntag2">${needAd(type, k)} ${'+'.repeat(a)}</span>`).join('');
function sprSlide(){}   // eski kaydırma çubukları kaldırıldı
const PACE = {
  hizli:  {ad:'Hızlı',   ikon:'🐇', acik:'Süre −%25 · kalite −4', hiz:1.25, q:-4},
  dengeli:{ad:'Dengeli', ikon:'⚖️', acik:'Normal süre ve kalite', hiz:1,    q:0},
  ozenli: {ad:'Özenli',  ikon:'🐢', acik:'Süre +%25 · kalite +6', hiz:0.8,  q:6},
};
function sprWord(s){ return s>=0.95?'★★★ Doğru odak':s>=0.7?'★★☆ Fena değil':s>=0.45?'★☆☆ Zayıf odak':'☆☆☆ Yanlış odak'; }
function sprPerson(id){
  if (id==='me') return {ad:'Sen', role:'me', know:S.fknow||[], skill:founderSkill()};
  const e = S.emps.find(x=>x.id===id);
  return e ? {ad:e.name, role:e.role, know:e.know||[], skill:e.skill} : null;
}
function sprKnows(know, t, type){
  if (t.know==='dil') return (know||[]).some(id => LEARN_BY[id] && LEARN_BY[id].tur==='Dil' && (LEARN_BY[id].t||[]).includes(type));
  return t.know.some(id => (know||[]).includes(id));
}
// liderin katkısı: rol uyumu, odaklanılan görevi biliyor mu, Scrum biliyor mu
function sprLeadBonus(p, i, lead, focus){
  const L = sprPerson(lead); if (!L) return {q:0, why:[]};
  const why = []; let q = 0;
  if (L.role===sprStage(p.type, i).role || L.role==='me' || (i===2 && L.role==='test')){ q += 1.5; why.push('işine uygun'); }
  if (focus !== null && focus !== undefined && sprKnows(L.know, sprTask(p.type, i, focus), p.type)){ q += 2; why.push(`${sprTask(p.type, i, focus).ad} konusunu biliyor`); }
  if (L.know.includes('scrum')){ q += 1; why.push('Scrum biliyor'); }
  return {q, why};
}
const sprExCost = (p, x) => Math.max(5000, Math.round((p.kodReq+p.tasReq)*x.w*900/500)*500);
function sprPlanQ(p, pl){ return (pl.s - 0.6)*14 + pl.lq + ((PACE[pl.pace]||PACE.dengeli).q) + pl.ex.reduce((a,id)=>a + ((sprStage(p.type, pl.i).ex.concat(SPRINTS[pl.i].ex).find(x=>x.id===id)||{}).q||0), 0); }
// yalnızca biten aşamalar kaliteyi etkiler
function sprintQ(p){ if (!p.spr) return 0; let q = 0; for (const pl of p.spr.plans) if (pl.i < p.spr.rev) q += sprPlanQ(p, pl); return q; }
const sprProg = p => (p.kod+p.tas)/(p.kodReq+p.tasReq);
const sprWait = p => !!p.spr && p.spr.plans.length < 3 && sprProg(p) >= p.spr.plans.length/3 - 1e-6;
const sprCur  = p => Math.min(2, Math.floor(sprProg(p)*3 + 1e-6));
function sprRoom(p){ return (p.spr && p.spr.plans.length < 3) ? p.spr.plans.length/3*(p.kodReq+p.tasReq) - (p.kod+p.tas) : Infinity; }
function sprSpeed(p){
  if (!p.spr || !p.spr.plans.length) return 1;
  const pl = p.spr.plans[Math.min(p.spr.plans.length-1, sprCur(p))], L = pl && sprPerson(pl.lead);
  return (L ? 1 + L.skill*0.015 : 1) * ((PACE[pl && pl.pace]||PACE.dengeli).hiz);
}
function sprintCheck(){
  for (const p of S.projs){
    if (!p.spr) continue;
    const done = Math.min(p.spr.plans.length, Math.floor(sprProg(p)*3 + 1e-6));
    while (p.spr.rev < done){
      const pl = p.spr.plans[p.spr.rev]; p.spr.rev++;
      const sq = Math.round(sprPlanQ(p, pl));
      toast(`${esc(p.name)} · ${sprStage(p.type, pl.i).ad} aşaması bitti`);
      snd('ok');
    }
    if (sprWait(p) && mgrOn('sprint') && !(page==='sprint' && pageArg===p.id)){ mgrPlan(p); continue; }
    if (sprWait(p) && !p.spr.asked){
      p.spr.asked = true;
      if (p.spr.plans.length){
        if (!page && $('modal').classList.contains('hidden')) openSprint(p.id);
        else toast(`🧭 ${esc(p.name)}: sıradaki aşama için karar bekleniyor!`);
      }
    }
  }
}
function openSprint(pid){
  const p = S.projs.find(x=>x.id===pid); if (!p || !p.spr || p.spr.plans.length >= 3) return;
  const i = p.spr.plans.length, sp = sprStage(p.type, i);
  const best = S.emps.filter(e => !isAway(e) && e.role===sp.role).sort((a,b)=>b.skill-a.skill)[0];
  spForm = {pid, i, focus:null, pace:'dengeli', lead: best ? best.id : 'me', ex:[]};
  openPage('sprint', pid);
}
function startSprint(auto){
  const f = spForm, p = f && S.projs.find(x=>x.id===f.pid);
  if (!p || p.spr.plans.length !== f.i) return;
  if (f.focus === null){ toast('🎯 Önce bu aşamada neye odaklanılacağını seç.'); snd('bad'); return; }
  const sp = sprStage(p.type, f.i), exs = sp.ex.filter(x=>f.ex.includes(x.id));
  const cost = exs.reduce((a,x)=>a+sprExCost(p,x), 0);
  if (S.money < cost){ toast('💸 Ekstra işler için paran yetmiyor.'); snd('bad'); return; }
  S.money -= cost;
  for (const x of exs){ p.kodReq = Math.round(p.kodReq*(1+x.w)); p.tasReq = Math.round(p.tasReq*(1+x.w)); if (x.bug) p.bugMul = (p.bugMul||1)*x.bug; }
  const lb = sprLeadBonus(p, f.i, f.lead, f.focus);
  p.spr.plans.push({i:f.i, focus:f.focus, pace:f.pace, lead:f.lead, ex:f.ex.slice(), s:sprScore(p, f.i, f.focus), lq:lb.q});
  p.spr.asked = false;
  const L = sprPerson(f.lead), t = sprTask(p.type, f.i, f.focus);
  toast(`${sp.ad} aşaması başladı: odak ${t.ad}, tempo ${PACE[f.pace].ad}`); snd('click');
  if (!auto) closePage(); speak(f.lead, '📋'); updateHome();
}
function sprintHTML(){
  const p = S.projs.find(x=>x.id===pageArg);
  if (!p || !spForm || spForm.pid !== p.id || p.spr.plans.length !== spForm.i) return `<div class="empty-msg">Bu aşama zaten planlandı.</div>`;
  const f = spForm, i = f.i, sp = sprStage(p.type, i), T = TYPES[p.type];
  const {n, why} = needProfile(p), cov = needCovered(p, i);
  const L0 = sprPerson(f.lead);
  // 1) kullanıcılar neyi önemsiyor: önem ancak o türde ürün bitirince öğrenilir
  const known = needKnown(p.type);
  const needRows = Object.entries(NEEDS).sort((a,b) => known ? n[b[0]] - n[a[0]] : 0).map(([k, N]) => {
    const done = cov[k] > 0, cw = why[k] && (known || why[k] === 'Müşteri istedi') ? why[k] : '';
    return `<div class="nrow ${known && n[k]>=3?'hot':''}"><span class="nnm"><b>${needAd(p.type, k)}</b>${cw ? `<i class="nwhy">${cw}</i>` : ''}</span>${known ? needDots(n[k]) : '<span class="ndots unk">?</span>'}
      <span class="ncov">${done ? `<i class="ok">karşılandı ${'+'.repeat(Math.min(3,cov[k]))}</i>` : known && n[k] >= 2 ? '<i class="todo">eksik</i>' : ''}</span></div>`;
  }).join('');
  // 2) odak kartları: hangi ihtiyacı karşılar (doğru mu yanlış mı söylenmez)
  const focusCards = [0,1,2].map(j => {
    const t = sprTask(p.type, i, j), knows = L0 && sprKnows(L0.know, t, p.type);
    return `<button class="fcard2 ${f.focus===j?'on':''}" data-act="sp-focus" data-v="${j}">
      <b>${t.ad}</b><small>${t.acik}</small><div class="ntags">${needTags(t.needs, p.type)}</div>
      ${knows ? '<span class="ftag2">Lider bu konuyu biliyor · +2 kalite</span>' : ''}</button>`;
  }).join('');
  const fb = `<div class="spfb">${known ? 'Önceki ürünlerinden öğrendiklerine göre seç.' : 'Bu türde henüz ürün bitirmedin; kullanıcıların neyi önemsediğini bilmiyorsun.'} Seçiminin doğru olup olmadığını ürün bitince göreceksin.</div>`;
  // 3) tempo, lider, ekstralar
  const paceChips = Object.entries(PACE).map(([k, P]) => `<button class="pchip2 ${f.pace===k?'on':''}" data-act="sp-pace" data-v="${k}"><b>${P.ad}</b><small>${P.acik}</small></button>`).join('');
  const people = [['me','me']].concat(S.emps.filter(e=>!isAway(e)).map(e=>[e.id, e.role]));
  const leadChips = people.map(([id]) => { const L = sprPerson(id), fit = L.role===sp.role || L.role==='me' || (i===2 && L.role==='test');
    return `<button class="chip ${f.lead===id?'on':''}" data-act="sp-lead" data-v="${id}">${id==='me' ? 'Sen' : esc(L.ad.split(' ')[0])} <small>${L.skill}${fit?' · uygun':''}</small></button>`; }).join('');
  const lb = sprLeadBonus(p, i, f.lead, f.focus);
  const exChips = sp.ex.map(x => `<button class="chip ${f.ex.includes(x.id)?'on':''}" data-act="sp-ex" data-v="${x.id}">${x.ad} <small>+${x.q} kalite · ${tl(sprExCost(p,x))}</small></button>`).join('');
  const exTotal = sp.ex.filter(x=>f.ex.includes(x.id)).reduce((a,x)=>a+sprExCost(p,x), 0), exQ = sp.ex.filter(x=>f.ex.includes(x.id)).reduce((a,x)=>a+x.q, 0);
  // 4) bu kararların etkisi
  const pq = PACE[f.pace].q;
  const totalQ = Math.round(lb.q) + pq + exQ;
  const sgn = v => (v > 0 ? '+' : '') + v;
  return `<div class="sphead2">${[0,1,2].map(k=>sprStage(p.type,k)).map((s,k)=>`<span class="${k<i?'done':k===i?'cur':''}">${k<i?'✓ ':''}${k+1}. ${s.ad}</span>`).join('<i>›</i>')}<i>›</i><span>Teslim</span></div>
    <div class="spgrid">
      <div class="pxpanel">
        <div class="npey">${i+1}. AŞAMA · ${sp.ad.toLocaleUpperCase('tr-TR')}</div>
        <div class="pxsub" style="margin:2px 0 10px">${esc(p.name)} · ${T.ad}${p.kind==='is' ? ' · müşteri işi' : ' · kendi ürünün'}</div>
        <div class="sptitle">Kullanıcılar neyi önemsiyor?</div>
        <div class="nlist">${needRows}</div>
        <p class="pxnote">${known ? 'Önem ürün türüne, ' + (p.kind==='is' ? 'müşterinin isteğine' : 'hedef kitleye') + ' göre değişir. Karşılanan ihtiyaç sonraki aşamalarda daha az önemlidir.' : 'Bu türde ilk ürününü bitirince kullanıcıların neyi ne kadar önemsediğini öğreneceksin.'}</p>
      </div>
      <div class="pxpanel">
        <div class="sptitle">1 · Bu aşamada neye odaklanalım?</div>
        <div class="fgrid2">${focusCards}</div>
        ${fb}
        <div class="sptitle" style="margin-top:14px">2 · Çalışma temposu</div>
        <div class="pgrid2">${paceChips}</div>
        <div class="sptitle" style="margin-top:14px">3 · Aşama lideri <span class="pxmeta">rakam = yetenek</span></div>
        <div class="chips">${leadChips}</div>
        <div class="pxmeta" style="margin-top:2px">${lb.why.length ? 'Bu lider: ' + lb.why.join(' · ') : 'Bu aşamaya uygun rolde (' + ROLES[sp.role].ad + ') bir lider kaliteyi artırır.'}</div>
        <div class="sptitle" style="margin-top:14px">4 · Ekstra <span class="pxmeta">isteğe bağlı</span></div>
        <div class="chips">${exChips}</div>
        <div class="speff">
          <div class="npey">BU KARARLARIN ETKİSİ</div>
          <dl class="npdl"><div><dt>Odak</dt><dd>${f.focus === null ? 'odak seçilmedi' : 'ürün bitince belli olacak'}</dd></div>
            <div><dt>Lider</dt><dd>${sgn(Math.round(lb.q))} kalite</dd></div>
            <div><dt>Tempo</dt><dd>${sgn(pq)} kalite · süre ${PACE[f.pace].hiz > 1 ? '−%25' : PACE[f.pace].hiz < 1 ? '+%25' : 'normal'}</dd></div>
            ${exQ ? `<div><dt>Ekstralar</dt><dd>+${exQ} kalite · ${tl(exTotal)}</dd></div>` : ''}
            <div class="tot"><dt>Bilinen</dt><dd>${sgn(totalQ)} kalite + odak</dd></div></dl>
        </div>
        <div class="grid2" style="gap:8px;margin-top:10px"><button class="pxghost" data-act="sp-quick">Benim yerime seç</button>
          <button class="npgo" data-act="sp-go" ${f.focus===null?'disabled':''}>Aşamayı başlat${exTotal?' · '+tl(exTotal):''} ${typeof NP_ICON!=='undefined' ? NP_ICON.ok : ''}</button></div>
      </div>
    </div>`;
}
// teslim/yayın sonrası değerlendirme: kullanıcılar ne istedi, sen ne sağladın
function retroHTML(p){
  if (!p.spr || !p.spr.plans.length) return '';
  const {n} = needProfile(p), cov = needCovered(p, 3);
  const rows = p.spr.plans.map(pl => {
    const chose = pl.focus != null ? sprTask(p.type, pl.i, pl.focus) : null;
    const before = p.spr.plans.filter(x => x.i < pl.i);
    const bestJ = (() => { const save = p.spr.plans; p.spr.plans = before; const b = sprBest(p, pl.i); p.spr.plans = save; return b; })();
    const best = sprTask(p.type, pl.i, bestJ);
    return `<div class="lbl"><span>${sprStage(p.type, pl.i).ad}${chose ? ` · seçtiğin: ${chose.ad}` : ''}</span><b class="${pl.s>=0.95?'green':pl.s<0.45?'red':''}">${sprWord(pl.s)}</b></div>
      ${pl.s < 0.95 ? `<div class="sub rtip">En iyisi: ${best.ad} (${Object.keys(best.needs).map(k=>needAd(p.type, k)).join(', ')})</div>` : ''}`;
  }).join('');
  const table = Object.entries(NEEDS).filter(([k]) => n[k] >= 2).map(([k]) => `<span class="rneed ${cov[k]>0?'ok':'miss'}">${cov[k]>0?'✓':'✗'} ${needAd(p.type, k)}</span>`).join('');
  const first = !needKnown(p.type); S.needLearn = S.needLearn || {}; S.needLearn[p.type] = true;
  return `<div class="retro"><b>Geliştirme değerlendirmesi</b>${first ? `<div class="sub">Artık ${TYPES[p.type].ad} kullanıcılarının neyi önemsediğini biliyorsun; sonraki projelerde ihtiyaçların önemi görünecek.</div>` : ''}${rows}<div class="sub" style="margin-top:6px">Kullanıcıların önemli ihtiyaçları:</div><div class="rneeds">${table}</div></div>`;
}
/* =====================================================================
   EKİP MORALİ – iş yeri olayları ve ekip aktiviteleri
   ===================================================================== */
const teamMood = () => S.emps.length ? Math.round(S.emps.reduce((a,e)=>a+(e.mood??70),0)/S.emps.length) : 100;
function moodAll(d, why){
  if (!S.emps.length || !d) return;
  for (const e of S.emps) e.mood = clamp((e.mood??70) + d, 5, 100);
  if (why) toast(`${d>0?'😊':'😞'} ${why} (ekip morali ${d>0?'+':''}${d})`);
  S.emps.forEach((e,i) => setTimeout(()=>speak(e.id, d>0 ? pick(['😊','🥳','👍','😄']) : pick(['😞','😠','😩','😒'])), 250+110*i));
}
function moodOne(e, d){ e.mood = clamp((e.mood??70) + d, 5, 100); setTimeout(()=>speak(e.id, d>0?'😊':'😠'), 250); }
const firstName = e => esc(e.name.split(' ')[0]);
const evCost = base => round10(base*12*(1 + S.office*0.6));

// ---- iş yeri olayları (çalışan varken ayrı bir zamanlayıcıyla gelir) ----
const OFFICE_EVENTS = [
  () => { const c = evCost(800);
    return {ikon:'☕', title:'Kahve Makinesi Bozuldu!', text:'Sabah herkes kahvesiz kaldı, ofiste homurtular başladı. Kahvesiz kod yazılır mı?',
      choices:[{label:'Boşver, su içsinler', cls:'gray', fn:()=>moodAll(-6, 'Kahvesiz geçen günler')},
               {label:`Yenisini al (${tl(c)})`, fn:()=>{ S.money -= c; moodAll(3, 'Yeni kahve makinesi geldi'); }}]}; },
  () => { if (S.emps.length < 2) return null; const [a, b] = S.emps.slice().sort(()=>Math.random()-0.5);
    return {ikon:'🗯️', title:'Ofiste Tartışma', text:`<b>${firstName(a)}</b> ile <b>${firstName(b)}</b> kodun nasıl yazılması gerektiği konusunda kavga etti. Ofisteki hava gerildi.`,
      choices:[{label:'Görmezden gel', cls:'gray', fn:()=>{ moodOne(a,-12); moodOne(b,-12); moodAll(-2, 'Ofiste gergin bir hava var'); }},
               {label:'Arabuluculuk yap', cls:'blue', fn:()=>{ if (Math.random() < 0.75){ moodOne(a,6); moodOne(b,6); toast(`🤝 ${firstName(a)} ve ${firstName(b)} barıştı!`); } else { moodOne(a,-5); moodOne(b,-5); toast('😒 Konuşma işe yaramadı, ikisi de hâlâ küs.'); } }}]}; },
  () => { const e = pick(S.emps), c = evCost(120*(S.emps.length+1));
    return {ikon:'🎂', title:'Doğum Günü!', text:`Bugün <b>${esc(e.name)}</b>'in doğum günü! Ekip bir şeyler yapmak istiyor.`,
      choices:[{label:'Unutalım gitsin', cls:'gray', fn:()=>{ moodOne(e,-14); toast(`😞 ${firstName(e)} doğum gününün unutulmasına çok üzüldü.`); }},
               {label:`Pasta & kutlama (${tl(c)})`, fn:()=>{ S.money -= c; moodOne(e,18); moodAll(4, 'Doğum günü kutlaması'); snd('ok'); }}]}; },
  () => { const e = pick(S.emps), c = evCost(1500);
    return {ikon:'💻', title:'Bilgisayar Yandı!', text:`<b>${esc(e.name)}</b>'in bilgisayarından duman çıktı! Yeni bir bilgisayar lazım.`,
      choices:[{label:'Eski laptopla idare etsin', cls:'gray', fn:()=>{ moodOne(e,-12); e.mood = Math.max(5, e.mood); toast(`🐌 ${firstName(e)} yavaş laptopla boğuşuyor.`); }},
               {label:`Yeni bilgisayar (${tl(c)})`, fn:()=>{ S.money -= c; moodOne(e,6); toast(`🖥️ ${firstName(e)} yeni bilgisayarına bayıldı!`); }}]}; },
  () => { const m = Math.floor((S.day-1)/30)%12; if (m < 5 || m > 7) return null; const c = evCost(1200);
    return {ikon:'🥵', title:'Klima Bozuldu!', text:'Dışarıda 38 derece, ofiste klima çalışmıyor. Herkes terliyor, klavyeler kayıyor.',
      choices:[{label:'Bekleyelim', cls:'gray', fn:()=>moodAll(-8, 'Sıcaktan bunaldılar')},
               {label:`Teknisyen çağır (${tl(c)})`, fn:()=>{ S.money -= c; moodAll(2, 'Klima düzeldi, oh be'); }}]}; },
  () => { const late = S.projs.filter(p=>p.kind==='is' && !devDone(p) && p.deadline - S.day <= 3); if (!late.length) return null; const p = late[0];
    return {ikon:'🌙', title:'Fazla Mesai Krizi', text:`<b>${esc(p.client)}</b> işinin teslimi yaklaştı ama iş bitmedi. Ekip hafta sonu da çalışırsa yetişebilir…`,
      choices:[{label:'Ek süre iste (-2 ⭐)', cls:'gray', fn:()=>{ p.deadline += 5; S.rep = Math.max(0, S.rep-2); toast('📞 Müşteri 5 gün ek süre verdi ama memnun değil.'); }},
               {label:'Hafta sonu mesai!', cls:'orange', fn:()=>{ const add = (p.kodReq+p.tasReq)*0.15; const k = Math.min(add*0.6, Math.max(0, p.kodReq-p.kod)); p.kod += k; p.tas = Math.min(p.tasReq, p.tas + add - k); moodAll(-12, 'Hafta sonu mesaisi herkesi yordu'); }}]}; },
  () => { if (S.emps.length < 3) return null; const c = evCost(90*S.emps.length);
    return {ikon:'🤧', title:'Grip Salgını', text:'Ofiste grip salgını başladı, yarısı hapşırıyor. Ne yapalım?',
      choices:[{label:'Çalışmaya devam', cls:'gray', fn:()=>{ moodAll(-8, 'Hasta hasta çalışmak zorunda kaldılar'); const e = pick(S.emps.filter(x=>!x.task)); if (e){ e.task = {type:'izin', until:S.day+3}; sceneKey = ''; toast(`🤒 ${firstName(e)} hastalandı, 3 gün yok.`); } }},
               {label:`Vitamin & maske (${tl(c)})`, fn:()=>{ S.money -= c; moodAll(3, 'Patron sağlığımızı düşünüyor'); }}]}; },
  () => { if (S.emps.length < 2) return null;
    return {ikon:'🐶', title:'Ofis Köpeği', text:'Ekip ofise sevimli bir köpek getirmek istiyor. "Stresimizi alır patron!" diyorlar.',
      choices:[{label:'Olmaz, burası iş yeri', cls:'gray', fn:()=>moodAll(-3, 'Köpek isteği reddedildi')},
               {label:'Tabii, gelsin! 🐾', fn:()=>moodAll(7, 'Ofisin yeni maskotu geldi')}]}; },
  () => { if (S.emps.length < 3) return null; const e = S.emps.slice().sort((a,b)=>a.salary/a.skill - b.salary/b.skill)[0], r = round10(e.salary*0.15);
    return {ikon:avatarSVG(e.id, e.role, e.emo), title:'Maaş Adaleti', text:`<b>${esc(e.name)}</b> diğerlerinden daha az kazandığını öğrendi: "Ben de en az onlar kadar çalışıyorum!"`,
      choices:[{label:'Şu an olmaz', cls:'gray', fn:()=>{ moodOne(e,-16); toast(`😠 ${firstName(e)} çok kırıldı.`); }},
               {label:`Zam yap (+${tl(r)}/ay)`, fn:()=>{ e.salary += r; moodOne(e,14); toast(`🤝 ${firstName(e)} artık daha mutlu.`); }}]}; },
  () => { if ((S.inbox||[]).length === 0 || S.inbox[0].score < 8) return null;
    return {ikon:'🍰', title:'Müşteriden Teşekkür', text:`<b>${esc(S.inbox[0].from)}</b> işinden çok memnun kaldı ve ofise kocaman bir pasta gönderdi!`,
      choices:[{label:'Afiyet olsun! 🍰', fn:()=>moodAll(6, 'Müşteri pastası geldi')}]}; },
  () => { if (S.money >= 0) return null;
    return {ikon:'💸', title:'Ekip Endişeli', text:'Çalışanlar kasanın ekside olduğunu duymuş. "Maaşlarımız yatacak mı?" diye fısıldaşıyorlar.',
      choices:[{label:'Bir şey söyleme', cls:'gray', fn:()=>moodAll(-8, 'Belirsizlik herkesi tedirgin etti')},
               {label:'Dürüstçe konuş', cls:'blue', fn:()=>{ if (Math.random() < 0.6) moodAll(3, 'Açık konuşman güven verdi'); else moodAll(-4, 'Konuşma pek ikna etmedi'); }}]}; },
];

// ---- ekip aktiviteleri (Personel sayfasındaki Aktivite düzenle düğmesi) ----
const TEAM_ACTS = [
  {id:'pizza',   ikon:'🍕', ad:'Pizza günü',          acik:'Öğle arası herkese pizza',          m:8,  cd:10, cost:n=>120*n},
  {id:'sunum',   ikon:'🎤', ad:'Bilgi paylaşım günü', acik:'Herkes öğrendiğini anlatır · Ar-Ge puanı', m:4, cd:7, cost:()=>0, fn:n=>{ const r = 6*n; S.rp = (S.rp||0) + r; return `+${r} Ar-Ge puanı`; }},
  {id:'turnuva', ikon:'🎮', ad:'Oyun turnuvası',      acik:'Mesai sonrası konsol turnuvası',    m:10, cd:14, cost:n=>200+60*n, fn:()=>{ const w = pick(S.emps); moodOne(w, 6); return `🏆 Şampiyon: ${firstName(w)}!`; }},
  {id:'kacis',   ikon:'🔐', ad:'Kaçış odası',         acik:'Takım ruhu · 7 gün %20 hızlı',      m:12, cd:21, cost:n=>350*n, fn:()=>{ S.boost = Math.max(S.boost||0, 7); return 'Takım ruhu güçlendi: 7 gün %20 hızlı!'; }},
  {id:'yemek',   ikon:'🍽️', ad:'Takım yemeği',        acik:'Güzel bir restoranda akşam yemeği', m:14, cd:20, cost:n=>500*n},
  {id:'hack',    ikon:'💡', ad:'Şirket içi hackathon', acik:'24 saatlik fikir maratonu · çok Ar-Ge', m:6, cd:30, cost:n=>300*n, office:1, fn:n=>{ const r = 20*n; S.rp = (S.rp||0) + r; return `+${r} Ar-Ge puanı`; }},
  {id:'odul',    ikon:'🏅', ad:'Ayın çalışanı',        acik:'En yetenekliye ikramiye',          m:3,  cd:30, cost:()=>Math.max(...S.emps.map(e=>e.salary))*0.5/(1+S.office*0.6), fn:()=>{ const b = S.emps.slice().sort((a,b)=>b.skill-a.skill || b.mood-a.mood)[0]; moodOne(b, 20); return `🏅 Ayın çalışanı: ${firstName(b)}!`; }},
  {id:'yoga',    ikon:'🧘', ad:'Masaj & yoga günü',    acik:'Ofiste stres atma günü',           m:12, cd:20, cost:n=>400*n, office:2},
  {id:'kamp',    ikon:'🏕️', ad:'Hafta sonu kampı',     acik:'Doğada 3 gün · 10 gün dinç',       m:25, cd:60, cost:n=>2500*n, office:2, fn:()=>{ for (const e of S.emps) e.fresh = 10; return 'Herkes 10 gün boyunca dinç!'; }},
];
const actCost = a => round10(a.cost(S.emps.length+1)*12*(1 + S.office*0.6));
const actReady = a => S.day >= ((S.actCd||{})[a.id]||0);
function teamMenu(){
  if (!S.emps.length){ toast('👥 Ekip aktivitesi için önce bir çalışan al (Personel).'); snd('bad'); return; }
  S.seenTeam = true;
  const tm = teamMood(), broke = S.money < 0, sad = S.emps.filter(e=>(e.mood??70) < 35);
  const item = a => {
    const c = actCost(a), lock = a.office && S.office < a.office, rd = actReady(a);
    const sub = lock ? `🔒 ${OFFICES[a.office].ad}'da açılır` : !rd ? `⏳ ${S.actCd[a.id]-S.day} gün sonra` : `${c?tl(c):'Ücretsiz'} · moral +${a.m}`;
    return `<button class="act" data-act="team-act" data-v="${a.id}" ${(lock||!rd||S.money<c)?'disabled':''}><span>${a.ikon}</span>${a.ad}<small>${a.acik}</small><small><b>${sub}</b></small></button>`;
  };
  curChoices = [];
  showModal('🎉', `<h3>Ekiple Aktivite</h3>
    <div class="moodrow"><span>${moodFace(tm)} Ekip morali</span><span class="mood mbig"><i style="width:${tm}%"></i></span><b>%${tm}</b></div>
    ${broke ? '<p class="red" style="text-align:center"><b>💸 Kasa ekside, maaşlar risk altında!</b> Ekip mutsuz ve aktivitelerin etkisi yarıya düşüyor.</p>' : ''}
    ${sad.length ? `<p class="sub" style="text-align:center">😟 Mutsuz olanlar: ${sad.map(firstName).join(', ')}</p>` : ''}
    <div class="grid3">${TEAM_ACTS.map(item).join('')}</div>
    <button class="btn gray block" data-act="close">Kapat</button>`);
}
function doTeamAct(id){
  const a = TEAM_ACTS.find(x=>x.id===id); if (!a || !actReady(a) || (a.office && S.office < a.office)) return;
  const c = actCost(a); if (S.money < c) return;
  const k = S.money < 0 ? 0.5 : 1;
  S.money -= c; S.actCd = S.actCd || {}; S.actCd[a.id] = S.day + a.cd;
  const d = Math.round(a.m*k);
  moodAll(d);
  const extra = a.fn ? a.fn(S.emps.length+1) : '';
  closeModal();
  toast(`${a.ikon} ${a.ad}: ekip morali +${d}${extra ? ' · '+extra : ''}${k<1 ? ' (maaş endişesi yüzünden yarı etki)' : ''}`); snd('ok');
  speakAll(a.ikon);
}

/* =====================================================================
   ŞİRKETİNİ KUR – başlangıç ekranı: şirket adı, patron adı ve görünüş
   ===================================================================== */
const CO_A = ['Bulut','Piksel','Mavi','Nova','Kuantum','Atom','Kod','Yıldız','Bit','Pusula','Martı','Çınar'];
const CO_B = ['Yazılım','Lab','Soft','Stüdyo','Teknoloji','Atölyesi','Dijital','Works'];
const BOSS_K = ['Ayşe','Zeynep','Elif','Defne','Ece','Selin','Merve','Ceren','Nil','İpek'];
const BOSS_E = ['Mehmet','Emre','Can','Burak','Kerem','Mert','Arda','Kaan','Efe','Onur'];
let setup = null;
const rnd = n => Math.floor(Math.random()*n);
// hazır karakterler: oyuncu yüz tasarlamaz, ofisteki gibi arkası dönük oturan 4 karakterden birini seçer
const CHAR_PRESETS = [
  {ad:'Ceren', g:'k', hair:0, out:1, ac:0, sk:0},
  {ad:'Defne', g:'k', hair:2, out:3, ac:1, sk:2},
  {ad:'Kerem', g:'e', hair:0, out:0, ac:2, sk:1},
  {ad:'Arda',  g:'e', hair:1, out:2, ac:0, sk:3},
];
const presetLook = i => { const c = CHAR_PRESETS[i] || CHAR_PRESETS[0]; return {g:c.g, hair:c.hair, out:c.out, ac:c.ac, sk:c.sk}; };
function setupRandomLook(){ return {preset: Math.floor(Math.random()*CHAR_PRESETS.length)}; }
function presetOf(me){
  if (!me) return 0;
  const k = CHAR_PRESETS.findIndex(c => c.g===me.g && c.hair===me.hair && c.out===me.out && c.ac===me.ac);
  return k >= 0 ? k : CHAR_PRESETS.findIndex(c => c.g===(me.g||'e'));
}
function showSetup(edit){
  const pr = edit && S && S.me ? presetOf(S.me) : Math.floor(Math.random()*CHAR_PRESETS.length);
  setup = {preset: Math.max(0, pr), edit:!!edit, co: edit && S ? S.name : '', boss: edit && S ? (S.boss||'') : ''};
  showModal('', '');
  $('modal').querySelector('.mwrap').classList.add('wide', 'pro');
  setupRender();
}
function charThumb(i){
  const L = lookFrom(presetLook(i));
  if (window.S3D && S3D.ok && S3D.thumb){ try { return `<img src="${S3D.thumb(L, 'preset'+i)}" alt="">`; } catch(e){} }
  return portraitSVG(L);
}
function setupRender(){
  const box = $('modal').querySelector('.mbox'); if (!box || !setup) return;
  const s = setup, P = CHAR_PRESETS[s.preset] || CHAR_PRESETS[0];
  const cards = CHAR_PRESETS.map((c, i) => `<button class="chcard ${s.preset===i?'on':''}" data-act="su-pick" data-k="preset" data-v="${i}">
      <div class="chimg">${charThumb(i)}</div><b>${c.g==='k' ? 'Kadın' : 'Erkek'}</b><small>${OUTFIT_OPTS[c.out].ad}${c.ac ? ' · ' + ACCS[c.ac] : ''}</small></button>`).join('');
  box.innerHTML = `<div class="nphead"><div><div class="npey">${s.edit ? 'GÖRÜNÜŞÜNÜ DEĞİŞTİR' : 'YENİ ŞİRKET'}</div><h3>${s.edit ? 'Karakterini seç' : 'Şirketini kur'}</h3></div>${s.edit ? '<button class="npx" data-act="close" aria-label="Kapat">✕</button>' : ''}</div>
    <div class="pxlbl">Karakterini seç</div>
    <div class="chgrid">${cards}</div>
    <div class="sugrid2" style="margin-top:12px">
      <div><div class="pxlbl">Şirket adı</div><div class="row"><input type="text" id="cname" maxlength="24" placeholder="Örn. Mavi Yazılım" value="${esc(s.co)}"><button class="btn purple sm sudice" data-act="su-dice" data-k="co" aria-label="Rastgele şirket adı">${DICE_SVG}</button></div></div>
      <div><div class="pxlbl">Senin adın</div><div class="row"><input type="text" id="bname" maxlength="16" placeholder="Patronun adı" value="${esc(s.boss)}"><button class="btn purple sm sudice" data-act="su-dice" data-k="boss" aria-label="Rastgele isim">${DICE_SVG}</button></div></div>
    </div>
    ${!s.edit && typeof difSetupHTML === 'function' ? difSetupHTML(s) : ''}
    ${s.edit ? `<div class="grid2" style="gap:10px;margin-top:12px"><button class="pxghost" data-act="close">Vazgeç</button><button class="npgo" data-act="su-save">Kaydet</button></div>`
             : `<button class="npgo" style="margin-top:12px" data-act="begin">Şirketi kur ${typeof NP_ICON!=='undefined' ? NP_ICON.ok : ''}</button>`}`;
}
function setupPick(k, i){ if (!setup) return; setup[k] = i; if (k==='preset' && (!setup.boss || BOSS_K.concat(BOSS_E, CHAR_PRESETS.map(c=>c.ad)).includes(setup.boss))) setup.boss = ''; setupRender(); }
function setupGender(){}
function setupDice(k){
  if (k==='co') setup.co = pick(CO_A) + ' ' + pick(CO_B);
  else setup.boss = pick((CHAR_PRESETS[setup.preset]||{}).g==='k' ? BOSS_K : BOSS_E);
  setupRender();
}
const setupLook = () => presetLook(setup ? setup.preset : 0);function setupTyped(id, v){
  if (!setup) return;
  setup[id==='cname' ? 'co' : 'boss'] = v;
  const n = document.querySelector('.suname');
  if (n) n.innerHTML = `<b>${esc(setup.boss || 'Patron')}</b><small>${esc(setup.co || 'Şirketin')} · Kurucu</small>`;
}

/* =====================================================================
   EKİPTEN E-POSTA – biri kovulunca çalışanlar geleceğini sorgular,
   biri patrona yazar; patron cevap seçer, cevabın etkisi olur.
   ===================================================================== */
function onFire(fired){
  if (!S.emps.length) return;
  S.fires = (S.fires||[]).filter(d => S.day - d < 60).concat(S.day);
  const many = S.fires.length >= 2, broken = !!S.promise && S.day - S.promise < 60;
  moodAll(-(many ? 10 : 6) - (broken ? 6 : 0), many ? 'Art arda kovulmalar ekibi korkuttu' : `${firstName(fired)} gidince ekip geleceğini sorguluyor`);
  const peers = S.emps.filter(e => !isAway(e)), pool = peers.length ? peers : S.emps;
  const w = pool.find(e => e.role===fired.role) || pick(pool);
  const m = {id:S.idSeq++, kind:'ekip', day:S.day, eid:w.id, from:w.name, role:w.role, emo:w.emo, fired:fired.name,
             subject: many ? 'Sıradaki kim?' : 'Geleceğim hakkında', lines:staffMailLines(w, fired, many, broken), answered:null};
  S.inbox = [m].concat(S.inbox||[]).slice(0, 30);
  setTimeout(() => {
    if (!S) return;
    if ($('modal').classList.contains('hidden')) openStaffMail(m.id);
    else toast(`📧 ${firstName(w)} sana bir e-posta gönderdi. (Gelen kutusu)`);
    snd('event');
  }, 1600);
}
function staffMailLines(w, f, many, broken){
  const L = ['Patron,'];
  L.push(w.role===f.role ?
    `${esc(f.name)} ile aylardır yan yana çalışıyorduk. Onun bir anda gidişi beni gerçekten sarstı.` :
    `${esc(f.name)}'in işten çıkarıldığını duyunca hepimiz çok şaşırdık. Kimse böyle bir şey beklemiyordu.`);
  if (many) L.push('Son zamanlarda art arda kovulan arkadaşlarımız oldu. Açıkçası ofiste herkes kendi arasında "sıradaki kim?" diye fısıldaşıyor.');
  if (broken) L.push('Daha geçenlerde işimizin güvende olduğunu söylemiştiniz. Şimdi neye inanacağımı bilemiyorum.');
  if (S.money < 0) L.push('Üstelik kasanın ekside olduğunu, maaşların gecikebileceğini duyuyoruz. Bu da içimizi hiç rahatlatmıyor.');
  L.push(pick([
    'Kira, faturalar, ailem… Benim için bu iş çok önemli. Ekrana bakarken bile aklım sürekli buna gidiyor.',
    'Bu şirkete inandığım için buradayım ama son günlerde işe gelirken içimde bir huzursuzluk var.',
    'Elimden gelenin en iyisini yapmaya çalışıyorum ama bir sabah benim de masamı toplamamı isteyeceğiniz korkusuyla çalışmak çok zor.']));
  L.push('Benim de geleceğim tehlikede mi? Ne düşündüğünüzü dürüstçe bilmek istiyorum.');
  return L;
}
const STAFF_REPLIES = [
  {ikon:'💙', ad:'Güven ver',      txt:n=>`${n}, endişelenme. Bu kararın seninle hiçbir ilgisi yok. Sen bu ekibin en değerli parçalarından birisin ve işin güvende.`},
  {ikon:'📈', ad:'Performans vurgusu', txt:n=>`${n}, şirket zor bir dönemden geçiyor. Kararlarımı performansa göre veriyorum. İşini iyi yaptığın sürece bir sorun yok.`},
  {ikon:'🧊', ad:'Sert cevap',     txt:n=>`${n}, şirketin kararlarını sorgulamak senin işin değil. İşine odaklan, gerisini bana bırak.`},
];
function staffMailHTML(m, fresh){
  const e = S.emps.find(x => x.id===m.eid);
  const head = `<div class="mailh"><div class="mav">${avatarSVG(m.eid, m.role, m.emo)}</div><div class="grow">
      <div><span class="mut">Kimden:</span> <b>${esc(m.from)}</b> <span class="mut">· ${ROLES[m.role].ad}</span></div>
      <div><span class="mut">Kime:</span> <b>${esc(S.boss || 'Patron')}</b> <span class="mut">· ${m.day}. gün</span></div>
      <div><span class="mut">Konu:</span> <b>${esc(m.subject)}</b></div></div></div>`;
  const body = `<div class="letter mail">${m.lines.map(l=>`<p>${l}</p>`).join('')}<p class="sig">— ${esc(m.from)}</p></div>`;
  let foot;
  if (m.answered != null){
    foot = `<div class="myreply"><div class="rh">↩️ Senin cevabın</div><p>${esc(m.reply)}</p></div>`;
  } else if (!e){
    foot = `<p class="sub" style="text-align:center">${esc(m.from)} artık şirkette çalışmıyor.</p>`;
  } else {
    const n = esc(e.name.split(' ')[0]);
    foot = replyBtns(STAFF_REPLIES, 'mail-rep', m.id, n) + `
      ${fresh ? '<button class="btn gray sm block" data-act="close">Sonra cevaplarım</button>' : ''}`;
  }
  return `${fresh ? '<h3>📧 Yeni E-posta</h3>' : ''}${head}${body}${foot}`;
}
function openStaffMail(id){
  const m = (S.inbox||[]).find(x => x.id===id); if (!m) return;
  curChoices = [];
  showModal('📧', staffMailHTML(m, true));
  $('modal').querySelector('.mwrap').classList.add('wide');
}
function staffReply(id, i, silent){
  const m = (S.inbox||[]).find(x => x.id===id), e = m && S.emps.find(x => x.id===m.eid);
  if (!m || m.answered != null || !e) return;
  const r = STAFF_REPLIES[i], n = e.name.split(' ')[0], others = S.emps.filter(x => x!==e);
  m.answered = i; m.reply = r.txt(n);
  if (!silent) closeModal(); snd('click');
  const all = d => others.forEach(x => x.mood = clamp((x.mood??70) + d, 5, 100));
  if (i===0){ moodOne(e, 12); all(4); S.promise = S.day; toast(`💙 ${esc(n)} rahatladı: "Teşekkürler patron, içim rahatladı!"`); }
  else if (i===1){ moodOne(e, -4); all(-2); S.boost = Math.max(S.boost||0, 6); toast(`📈 ${esc(n)}: "Anladım patron." Ekip daha sıkı çalışıyor ama gergin.`); }
  else {
    moodOne(e, -18); all(-6);
    if (Math.random() < 0.3){ setTimeout(() => { if (!S || !S.emps.includes(e)) return; S.emps = S.emps.filter(x => x!==e); sceneKey = ''; toast(`📨 ${esc(e.name)} cevabına çok kırıldı ve istifa etti!`); snd('bad'); }, 2200); }
    else toast(`🧊 ${esc(n)} cevabına çok kırıldı. Ekipte hava buz gibi.`);
  }
  if (page === 'mesaj') renderPage(true);
}
// cevapsız kalan e-postalar zamanla moral bozar
function staffMailDay(){
  for (const m of S.inbox||[]){
    if (!m.kind || m.answered!=null || m.ignored) continue;
    // acil izne bir gün içinde cevap gelmezse çalışan kendisi çıkar gider
    if (m.tpl==='acil' && S.day - m.day >= 1){
      m.ignored = true;
      const e = S.emps.find(x => x.id===m.eid);
      if (e){ moodOne(e, -12); if (!isAway(e)) e.task = {type:'izin', until:S.day + (m.days||1)}; sceneKey = ''; toast(`${esc(firstName(e))} acil mesajına cevap alamadı, kırgın şekilde çıkıp gitti.`); }
      continue;
    }
    if (S.day - m.day >= 5){
      m.ignored = true;
      const e = S.emps.find(x => x.id===m.eid);
      if (e){ moodOne(e, -10); toast(`😞 ${firstName(e)} e-postasına cevap alamadı, kırıldı.`); }
    }
  }
}

/* =====================================================================
   EKİPMAN – klavye, koltuk ve bilgisayar seviyeleri
   Her seviye ofiste farklı görünür. Sektör standardı zamanla yükselir;
   geride kalan ekipman ekibi yavaşlatır, yetenekli adaylar gelmek istemez.
   ===================================================================== */
const EQUIP = {
  pc: {ikon:'🖥️', ad:'Bilgisayar', acik:'Ekip hızı ve daha az hata. Büyük işler güçlü bilgisayar ister.', tiers:[
    {ad:'Tüplü Monitörlü Eski PC',      fiyat:0,      hiz:0,    bug:1},
    {ad:'Düz Ekran PC',                 fiyat:12000,  hiz:0.06, bug:0.95},
    {ad:'Çift Monitörlü İş İstasyonu',  fiyat:35000,  hiz:0.12, bug:0.9},
    {ad:'Kavisli Ultra Geniş Ekran',    fiyat:90000, hiz:0.18, bug:0.85},
    {ad:'Üç Monitörlü Canavar PC',      fiyat:220000, hiz:0.25, bug:0.8}]},
  klavye: {ikon:'⌨️', ad:'Klavye', acik:'Daha hızlı yazma: dokunuşların ve ekibin hızı artar.', tiers:[
    {ad:'Eski Ofis Klavyesi',           fiyat:0,      hiz:0,    tap:0},
    {ad:'İnce Sessiz Klavye',           fiyat:1500,   hiz:0.03, tap:1.5},
    {ad:'Mekanik Klavye',               fiyat:5000,  hiz:0.06, tap:3},
    {ad:'RGB Işıklı Mekanik Klavye',    fiyat:14000,  hiz:0.09, tap:5},
    {ad:'Ergonomik Bölünmüş Klavye',    fiyat:35000,  hiz:0.12, tap:8}]},
  koltuk: {ikon:'🪑', ad:'Koltuk', acik:'Rahat çalışan geç yorulur: ekip hızı ve moral.', tiers:[
    {ad:'Plastik Sandalye',             fiyat:0,      hiz:0,    moral:0},
    {ad:'Basit Ofis Koltuğu',           fiyat:3000,   hiz:0.04, moral:0.2},
    {ad:'Ergonomik File Koltuk',        fiyat:9000,  hiz:0.08, moral:0.35},
    {ad:'Oyuncu Koltuğu',               fiyat:25000,  hiz:0.12, moral:0.5},
    {ad:'Deri Yönetici Koltuğu',        fiyat:65000, hiz:0.16, moral:0.7}]},
};
const PC_REQ = {web:0, mobil:0, oyun:2, ai:3};
const EQ_PER_STD = 300;                  // sektör standardı her 300 günde bir yükselir
const eqTier = k => (S && S.eq && S.eq[k]) || 0;
const eqPeople = () => 1 + S.emps.length*0.5;   // toplu alımda indirim: kişi başı yarım fiyat
const eqCost = (k, t) => round10(EQUIP[k].tiers[t].fiyat * eqPeople());
const eqStandard = () => Math.min(4, Math.floor((S.day-1)/EQ_PER_STD));
const eqBehind = k => Math.max(0, eqStandard() - eqTier(k));
const eqBehindAll = () => Object.keys(EQUIP).reduce((a,k) => a + eqBehind(k), 0);
function eqSpeed(){
  let m = 1;
  for (const k in EQUIP){ m *= 1 + EQUIP[k].tiers[eqTier(k)].hiz; m *= 1 - 0.08*eqBehind(k); }
  return m;
}
const eqBug = () => EQUIP.pc.tiers[eqTier('pc')].bug;
const eqMoral = () => EQUIP.koltuk.tiers[eqTier('koltuk')].moral;
const eqTap = () => EQUIP.klavye.tiers[eqTier('klavye')].tap;
const pcOk = type => eqTier('pc') >= (PC_REQ[type]||0);
function pcLockText(type){ const n = PC_REQ[type]||0; return `🖥️ ${n}. seviye bilgisayar gerekli (${EQUIP.pc.tiers[n].ad})`; }
// yeni yıl: sektör standardı yükselince haber ver
function eqDay(){
  const st = eqStandard();
  if (st > (S.eqStd||0)){
    S.eqStd = st;
    const behind = Object.keys(EQUIP).filter(k => eqBehind(k) > 0);
    if (behind.length){
      snd('event');
      toast(`📢 Sektörde yeni ekipman standardı: ${st}. seviye! Eski kalan ${behind.map(k=>EQUIP[k].ad.toLowerCase()).join(', ')} ekibi yavaşlatıyor. (Geliştir)`);
      setTimeout(() => speakAll('😤'), 400);
    } else toast(`📢 Sektörde ekipman standardı ${st}. seviyeye çıktı. Ekipmanların hâlâ güncel, harika!`);
  }
}
function eqStars(t){ return '★'.repeat(t) + '☆'.repeat(4-t); }
function eqHTML(){
  const st = eqStandard(), next = EQ_PER_STD - ((S.day-1) % EQ_PER_STD);
  const cards = Object.entries(EQUIP).map(([k, E]) => {
    const t = eqTier(k), T = E.tiers[t], N = E.tiers[t+1], b = eqBehind(k);
    const eff = k==='pc' ? `+%${Math.round(T.hiz*100)} hız · %${Math.round((1-T.bug)*100)} az hata` : k==='klavye' ? `+%${Math.round(T.hiz*100)} hız · dokunuş +${T.tap}` : `+%${Math.round(T.hiz*100)} hız · daha az yorgunluk`;
    const btn = N ? `<button class="btn sm" data-act="eq-up" data-v="${k}" ${S.money < eqCost(k, t+1) ? 'disabled' : ''}>${tl(eqCost(k, t+1))}</button>` : '<span class="pill green">EN İYİ</span>';
    return `<div class="card ${b?'eqold':'hl'}"><div class="row"><div class="big">${E.ikon}</div><div class="grow">
      <b>${E.ad}: ${T.ad}</b> <span class="eqst">${eqStars(t)}</span>
      <div class="sub">${eff}${b ? ` · <b class="red">⚠️ Eskidi: −%${b*8} hız</b>` : ''}</div>
      ${N ? `<div class="sub">Sıradaki: <b>${N.ad}</b> (${eqPeople()} kişi × ${tl(N.fiyat)})</div>` : '<div class="sub">En üst seviyedesin.</div>'}
      ${k==='pc' ? `<div class="sub">Gerekli: Mobil 1 · Oyun 2 · Yapay Zekâ 3. seviye</div>` : ''}</div>${btn}</div></div>`;
  }).join('');
  return `<div class="card eqinfo"><b>📢 Sektör standardı: ${st}. seviye</b> <span class="sub">· ${st < 4 ? `${next} gün sonra ${st+1}. seviyeye çıkacak` : 'en üst seviyede'}</span>
      <div class="sub">Standardın altında kalan her ekipman ekibi %8 yavaşlatır, çalışanlar söylenir ve yetenekli adaylar (7+) şirkete gelmek istemez.</div></div>
    <h2>Ekipmanlar</h2><div class="cards">${cards}</div>`;
}

/* =====================================================================
   YATIRIMCILAR VE HİSSELER – teklifler %5–%25, pazarlık, hisse paneli, geri alım
   ===================================================================== */
const INVESTORS = [
  {ad:'Boğaziçi Ventures',     renk:'#2f54eb', min:1.10, max:1.45, huy:'cömert'},
  {ad:'Galata Melek Yatırım',  renk:'#f59e0b', min:0.80, max:1.10, huy:'pazarlıkçı'},
  {ad:'Anadolu Girişim Fonu',  renk:'#10b981', min:0.90, max:1.20, huy:'dengeli'},
  {ad:'Kapadokya Capital',     renk:'#a855f7', min:0.70, max:1.00, huy:'cimri'},
  {ad:'Mavi Okyanus VC',       renk:'#0ea5e9', min:1.00, max:1.30, huy:'iyimser'},
  {ad:'Ege Teknoloji Fonu',    renk:'#ef4444', min:0.85, max:1.15, huy:'temkinli'},
  {ad:'Zirve Melek Ağı',       renk:'#14b8a6', min:0.95, max:1.35, huy:'hevesli'},
];
const holdersOf = () => (S.holders = S.holders || []);
function syncOwnership(){ S.ownership = Math.max(0, 100 - holdersOf().reduce((a,h)=>a+h.pct, 0)); }
const stakeValue = pct => Math.round(valuation()*pct/100/1000)*1000;
const buybackPrice = h => Math.max(Math.round(h.paid*1.1/1000)*1000, Math.round(stakeValue(h.pct)*1.2/1000)*1000);
function investorOffer(){
  syncOwnership();
  if (S.day < 45 || S.ownership <= 35) return null;
  const inv = pick(INVESTORS);
  const opts = [5,10,15,20,25].filter(p => S.ownership - p >= 30);
  if (!opts.length) return null;
  const pct = pick(opts), mood = inv.min + Math.random()*(inv.max-inv.min);
  const fair = valuation()*pct/100, amt = Math.max(100000, Math.round(fair*mood/10000)*10000);
  const diff = Math.round((mood-1)*100);
  const accept = (sum) => { holdersOf().push({id:S.idSeq++, ad:inv.ad, renk:inv.renk, pct, paid:sum, day:S.day}); syncOwnership(); S.money += sum; S.stats.earned += sum; snd('cash');
    toast(`🤝 ${inv.ad} şirketinin %${pct}'ini ${tl(sum)} karşılığında aldı. Payın artık %${S.ownership}.`); };
  return {ikon:'💼', title:`${inv.ad}`, text:`<b>${inv.ad}</b> (${inv.huy} bir yatırımcı) şirketinin <b>%${pct}</b> hissesi için <b>${tl(amt)}</b> teklif ediyor.
      <br><span class="sub">Şirket değerine göre bu teklif <b class="${diff>=0?'green':'red'}">%${Math.abs(diff)} ${diff>=0?'primli':'ucuz'}</b>. Kabul edersen ürün gelirlerinin %${pct}'i onlara gider. Şu anki payın: %${S.ownership}</span>`,
    choices:[
      {label:'Reddet', cls:'gray', fn:()=>toast(`👋 ${inv.ad} teklifini geri çekti.`)},
      {label:`Pazarlık (+%20)`, cls:'blue', fn:()=>{ const ok = Math.random() < (inv.huy==='cimri'||inv.huy==='pazarlıkçı' ? 0.35 : 0.6);
        if (ok) accept(Math.round(amt*1.2/10000)*10000); else { snd('bad'); toast(`😤 ${inv.ad}: "Bu fiyata olmaz." Masadan kalktı.`); } }},
      {label:`Kabul et (+${tl(amt)})`, fn:()=>accept(amt)},
    ]};
}
function sharesHTML(){
  syncOwnership();
  const hs = holdersOf(), v = valuation();
  const bar = `<div class="sharebar"><i style="width:${S.ownership}%;background:var(--t6)" title="Sen"></i>${hs.map(h=>`<i style="width:${h.pct}%;background:${h.renk}" title="${esc(h.ad)}"></i>`).join('')}</div>`;
  const rows = `<div class="shrow me"><span class="dot" style="background:var(--t6)"></span><b class="grow">${esc(S.boss||'Sen')} (kurucu)</b><b>%${S.ownership}</b><span class="sub">${tl(v*S.ownership/100)}</span><span style="width:96px"></span></div>` +
    hs.map(h => { const p = buybackPrice(h);
      return `<div class="shrow"><span class="dot" style="background:${h.renk}"></span><span class="grow"><b>${esc(h.ad)}</b><br><span class="sub">${h.day}. gün ${tl(h.paid)} ödedi</span></span><b>%${h.pct}</b><span class="sub">${tl(stakeValue(h.pct))}</span>
        <button class="btn sm" data-act="buyback" data-id="${h.id}" ${S.money<p?'disabled':''} style="width:96px">Geri al<br>${tl(p)}</button></div>`; }).join('');
  return `<div class="card" style="grid-column:1/-1"><b>🏛️ Hisse dağılımı</b>
      <div class="sub">Şirket değeri <b>${tl(v)}</b> · Ürün gelirlerinden aldığın pay <b>%${S.ownership}</b>${hs.length?' · Paran olunca hisseleri geri alabilirsin (değerinin %20 fazlasına).':' · Şirketin tamamı senin!'}</div>
      ${bar}${rows}</div>`;
}
function buyback(id){
  const h = holdersOf().find(x => x.id === id); if (!h) return;
  const p = buybackPrice(h); if (S.money < p){ toast('💸 Yeterli paran yok.'); return; }
  S.money -= p; S.holders = holdersOf().filter(x => x !== h); syncOwnership();
  toast(`🏛️ ${h.ad}'nin %${h.pct} hissesini ${tl(p)} ödeyerek geri aldın. Payın artık %${S.ownership}!`); snd('ok');
}

/* =====================================================================
   OYUN REHBERİ – kayıttan sonra sorulur, adım adım ekranı tanıtır
   (Ayarlar'dan tekrar açılabilir)
   ===================================================================== */
const TUTOR = [
  {sel:null, t:'Hoş geldin, patron!', d:'Garajda tek başına bir yazılım şirketi kuruyorsun. Amacın müşteri işleri ve kendi ürünlerinle büyüyüp gökdelende dev bir teknoloji şirketi olmak. Sana oyunu kısaca gezdireyim.'},
  {sel:'#hMoneyP', t:'Kasa', d:'Şirketinin parası. Müşteri işleri ve ürünler para getirir. Her ay sonunda maaşlar, kira ve kredi taksitleri buradan ödenir. Kasa eksiye düşerse maaşlar gecikir ve ekip mutsuz olur.'},
  {sel:'.hud [data-v="sirala"]', t:'İtibar', d:'İşleri iyi teslim ettikçe itibarın artar. İtibar yükseldikçe daha büyük ve daha çok para veren müşteriler, yeni teknolojiler açılır.'},
  {sel:'#hDay', up:'.pillw', t:'Zaman', d:'Günler kendiliğinden akar. Her 30 günde bir ay sonu gelir: ödemeler yapılır, yeni iş teklifleri ve iş adayları gelir.'},
  {sel:'#dock .newp', t:'Yeni Proje', d:'Her şey buradan başlar. Müşteri İşi güvenlidir: teslim edince ödemeni alırsın. Kendi Ürünün risklidir ama yayınlandıktan sonra her gün para kazandırır.'},
  {sel:'#side .panel', t:'Projeler', d:'Devam eden projelerin burada: hangi aşamada olduğu, kalitesi ve kalan süresi. Karar gerektiğinde "Karar ver", bitince "Teslim et" düğmesi çıkar.'},
  {sel:'#scene', t:'Ofisin', d:'Sen ve çalışanların projelerde kendiliğinden çalışırsınız. Bir çalışana dokun: tatile yolla, eğit, zam yap. Ekiple aktiviteyi (pizza günü, oyun turnuvası…) Personel sayfasından düzenlersin. İş yokken çalışanlar kalkıp ofiste dolaşır.'},
  {sel:'#inboxBtn', t:'Gelen kutusu', d:'Müşteriler ve çalışanların sana e-posta atar: zam isteği, izin, yeni fikirler, şikâyetler… Her birine iyi, orta ya da sert bir cevap verirsin. Cevabın moralleri ve itibarını etkiler.'},
  {sel:'#dock [data-v="ekip"]', t:'Personel', d:'Buradan çalışan alırsın. Daha çok kişi daha hızlı iş demek. Ofisin alabileceği kişi sayısı sınırlıdır; büyüdükçe daha büyük ofise taşınırsın.'},
  {sel:'#dock [data-v="gelis"]', t:'Geliştir', d:'Bilgisayar, klavye ve koltukları yükselt. Sektör standardının gerisinde kalırsan ekip yavaşlar ve yetenekli adaylar şirkete gelmek istemez.'},
  {sel:'#dock [data-v="banka"]', t:'Banka', d:'Paraya sıkışırsan kredi çekebilirsin. Taksitleri zamanında ya da erken ödersen kredi puanın (en fazla 1000) yükselir, daha ucuza kredi bulursun.'},
  {sel:'#dock [data-v="ofis"]', t:'Ofisim', d:'Kasan büyüdükçe emlakçı arar: Stüdyo Daire, Ofis, Büyük Ofis ve en sonunda Gökdelen. Her yeni ofis daha çok çalışan ve proje slotu demek.'},
  {sel:'#goal', t:'Hedefler', d:'Sıradaki hedefin burada yazar. Tamamladıkça para ödülü kazanırsın. Ne yapacağını bilemediğinde buraya bak.'},
  {sel:null, t:'Moral önemli', d:'Çalışanlar uzun süre yoğun çalışınca yorulur. Morali düşük çalışan yavaşlar, çok düşerse istifa eder. Tatil, zam, ekip aktiviteleri ve iyi e-posta cevaplarıyla onları mutlu tut.'},
  {sel:'#dock .newp', t:'Hadi başlayalım!', d:'İlk adım: Yeni Proje → Müşteri İşi al ve teslim et. Bol şans, patron!'},
];
let tutI = -1;
function tutorAsk(){
  showModal('', `<div class="nphead"><div><div class="npey">OYUN REHBERİ</div><h3>İpuçlarını açalım mı?</h3></div></div>
    <p class="pxsub" style="margin:-4px 0 14px">Sana ekranı adım adım gezdirip oyunun nasıl oynandığını anlatayım. Yaklaşık bir dakika sürer, istediğin an atlayabilirsin.</p>
    <div class="grid2" style="gap:10px"><button class="pxghost" data-act="tut-skip">Hayır, kendim keşfederim</button><button class="npgo" data-act="tut-start">Evet, oyunu anlat</button></div>`, 'pro');
}
function tutorStart(){ closeModal(); if (typeof closePage==='function' && page) closePage(); tutI = 0; paused = true; tutorShow(); }
function tutorEnd(){
  tutI = -1; const o = document.getElementById('tutor'); if (o) o.remove(); paused = false;
  if (S){ S.tutorDone = true; }
}
function tutOffset(el){        // #app içindeki konum (zoom ve döndürmeden bağımsız)
  const app = document.getElementById('app'); let x = 0, y = 0, e = el;
  while (e && e !== app){ x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return {x, y, w:el.offsetWidth, h:el.offsetHeight};
}
function tutorShow(){
  const st = TUTOR[tutI]; if (!st){ tutorEnd(); return; }
  const app = document.getElementById('app');
  let o = document.getElementById('tutor');
  if (!o){ o = document.createElement('div'); o.id = 'tutor'; app.appendChild(o); }
  let el = st.sel ? document.querySelector(st.sel) : null; if (el && st.up) el = el.closest(st.up);
  const viaMenu = window.PC && st.sel && st.sel.startsWith('#dock') && (!el || !el.offsetWidth); if (viaMenu) el = document.getElementById('pcMenuBtn');
  const box = el && el.offsetWidth ? tutOffset(el) : null, W = app.clientWidth, H = app.clientHeight, pad = 6;
  const last = tutI === TUTOR.length-1;
  const dots = TUTOR.map((_,i) => `<i class="${i===tutI?'on':i<tutI?'done':''}"></i>`).join('');
  o.innerHTML = `${box ? `<div class="tspot" style="left:${box.x-pad}px;top:${box.y-pad}px;width:${box.w+pad*2}px;height:${box.h+pad*2}px"></div>` : '<div class="tdim"></div>'}
    <div class="tcard"><div class="ttop"><span class="npey">ADIM ${tutI+1} / ${TUTOR.length}</span><button class="tskip" data-act="tut-end">Rehberi kapat ✕</button></div>
      <h3>${st.t}</h3><p>${viaMenu ? `<b>Menü düğmesinden ${st.t === 'Hadi başlayalım!' ? 'Yeni Proje' : st.t} seçilir.</b> ` : ''}${st.d}</p><div class="tdots">${dots}</div>
      <div class="tbtns">${tutI>0 ? '<button class="pxghost" data-act="tut-prev">Geri</button>' : '<span></span>'}<button class="npgo" data-act="tut-next">${last ? 'Oynamaya başla' : 'İleri'} ${typeof NP_ICON!=='undefined' ? NP_ICON.ok : '›'}</button></div></div>`;
  // kartı vurgunun yanına yerleştir
  const card = o.querySelector('.tcard'), cw = Math.min(340, W-24);
  card.style.width = cw + 'px'; const chh = card.offsetHeight || 200;
  const sv = k => parseFloat(app.style.getPropertyValue(k)) || 0, sL = sv('--sl'), sR = sv('--sr'), sT = sv('--st'), sB = sv('--sb');   // çentik / durum çubuğu payları
  let cx, cy;
  if (!box){ cx = (W-cw)/2; cy = (H-chh)/2; }
  else {
    const below = box.y + box.h + pad + 12, above = box.y - pad - 12 - chh, right = box.x + box.w + pad + 12, left = box.x - pad - 12 - cw;
    if (box.h > H*0.5){ cx = right + cw < W ? right : left > 0 ? left : (W-cw)/2; cy = (H-chh)/2; }
    else if (below + chh < H - 8){ cy = below; cx = box.x + box.w/2 - cw/2; }
    else if (above > 8){ cy = above; cx = box.x + box.w/2 - cw/2; }
    else { cy = (H-chh)/2; cx = right + cw < W ? right : Math.max(12, left); }
  }
  card.style.left = Math.max(12 + sL, Math.min(W - cw - 12 - sR, cx)) + 'px'; card.style.top = Math.max(12 + sT, Math.min(H - chh - 12 - sB, cy)) + 'px';
}
/* =====================================================================
   YÖNETİCİ – Gökdelen katında işe alınır. Verilen ayarlara göre maaşlar,
   e-postalar, moral, geliştirme kararları ve yeni işlerle o ilgilenir.
   ===================================================================== */
const MGR_SET = {
  maas:  {ad:'Maaş ve zam istekleri', acik:'Zam isteyenlere ve morali çok düşenlere ne yapsın?', opts:{kapali:'Bana sor', comert:'Cömert (%10)', dengeli:'Dengeli (%5)', tutumlu:'Tutumlu (zam yok)'}},
  mail:  {ad:'Rutin e-postalar', acik:'Çalışan ve müşteri e-postalarını cevaplasın mı?', opts:{kapali:'Bana sor', iyi:'Nazik cevaplasın', orta:'Kısa cevaplasın'}},
  moral: {ad:'Ekip morali', acik:'Moral düşünce kendiliğinden ekip aktivitesi düzenlesin mi?', opts:{kapali:'Kapalı', acik:'Düzenlesin'}},
  sprint:{ad:'Geliştirme kararları', acik:'Projelerin aşama kararlarını (odak, tempo, lider) o versin mi?', opts:{kapali:'Bana sor', acik:'Yönetici versin'}},
  is:    {ad:'Yeni müşteri işleri', acik:'Boş proje slotu olunca yeni iş bulsun mu?', opts:{kapali:'Kapalı', sor:'Bulsun, bana sorsun', oto:'Kendisi başlatsın'}},
  egitim:{ad:'Çalışan eğitimi', acik:'Her hafta ekibe bakıp yetersiz bulduğu çalışanları eğitime göndersin mi? Eğitimdeki çalışan 4 gün projelerde çalışmaz; kasada en az 2 aylık maaş kalacak kadar harcar.', opts:{kapali:'Kapalı', zayif:'Zayıfları (yetenek 5 altı)', orta:'Ortanın altını (yetenek 7 altı)', herkes:'Herkesi geliştirsin'}},
};
const mgrOn = k => !!(S.mgr && S.mgr.set[k] && S.mgr.set[k] !== 'kapali');
// yönetici tipleri: her adayın bir uzmanlığı var
const MGR_TYPES = {
  insan:  {ad:'İnsan odaklı', acik:'Ekiple çok ilgilenir: her ay ekibin morali artar, düzenlediği aktiviteler daha etkili olur.', sal:1.0, acc:0},
  satis:  {ad:'Satış uzmanı', acik:'Bulduğu ve başlattığı müşteri işleri %15 daha fazla öder.', sal:1.1, acc:0},
  teknik: {ad:'Teknik lider', acik:'Geliştirme kararlarında ve brif hazırlamada çok isabetlidir.', sal:1.15, acc:0.15},
  tutumlu:{ad:'Tutumlu', acik:'Maaşı düşüktür ama kararları biraz daha az isabetlidir.', sal:0.7, acc:-0.06},
};
const MGR_F = ['Zeynep','Elif','Ayşe','Selin','Derya','Ece','Gizem','Melis','Nazlı','Pınar','Ceren','Buse'];
const MGR_M = ['Mehmet','Can','Emre','Burak','Kerem','Murat','Serkan','Ozan','Tolga','Kaan','Yusuf','Onur'];
const mgrAcc = () => S.mgr ? Math.min(0.97, 0.55 + S.mgr.skill*0.04 + ((MGR_TYPES[S.mgr.tip]||{}).acc||0)) : 0.5;
const mgrAvatar = c => portraitSVG(empLook(c.seed || 777, 'prog', !!c.f));
function genMgr(tip){
  const f = Math.random() < 0.5, sk = 5 + Math.floor(Math.random()*6), T = MGR_TYPES[tip];
  return {tip, f, name:pick(f ? MGR_F : MGR_M) + ' ' + pick(LAST_I) + '.', seed:1000 + Math.floor(Math.random()*9000), skill:sk,
          salary:round10(salaryFor(10)*(2.4 + (sk-5)*0.3)*T.sal*(0.92 + Math.random()*0.16))};
}
function mgrCands(){
  if (!S.mgrCands || !S.mgrCands.length){ const tips = Object.keys(MGR_TYPES).sort(() => Math.random() - 0.5).slice(0, 3); S.mgrCands = tips.map(genMgr); }
  return S.mgrCands;
}
const mgrCand = () => mgrCands()[0];
const MGR_REROLL = 50000;
function mgrCardHTML(){
  if (S.office < 4) return `<div class="pxpanel" style="margin-bottom:12px"><div class="npey">YÖNETİCİ</div><p class="pxsub" style="margin-top:4px">Gökdelen katına taşındığında bir yönetici işe alabilirsin. Maaşlar, e-postalar, moral ve yeni işlerle senin yerine o ilgilenir.</p></div>`;
  if (S.mgr){ const on = Object.keys(MGR_SET).filter(mgrOn).map(k => MGR_SET[k].ad).join(', ') || 'hiçbir görev verilmedi', T = MGR_TYPES[S.mgr.tip] || MGR_TYPES.insan;
    return `<div class="pxpanel mgrcard" style="margin-bottom:12px"><div class="pxtop"><div class="mav">${mgrAvatar(S.mgr)}</div><div class="grow"><div class="npey">YÖNETİCİN</div><b class="npt">${esc(S.mgr.name)}</b><div class="pxmeta">${T.ad} · deneyim ${S.mgr.skill}/10 · ${tl(S.mgr.salary)}/ay</div></div>
      <button class="npgo" style="width:auto;padding:9px 14px" data-act="mgr-open">Ayarlar</button></div><div class="pxmeta">Görevleri: ${on}</div></div>`; }
  const cards = mgrCands().map((c, k) => { const T = MGR_TYPES[c.tip], fee = round10(c.salary*0.5);
    return `<div class="pxcard mgrc"><div class="pxtop"><div class="mav">${mgrAvatar(c)}</div><div class="grow"><b class="npt">${esc(c.name)}</b><div class="pxmeta">${T.ad}</div></div></div>
      <p class="pxnote" style="margin:0 0 8px!important">${T.acik}</p>
      <dl class="npdl"><div><dt>Deneyim</dt><dd>${c.skill}/10</dd></div><div><dt>Karar isabeti</dt><dd>%${Math.round(Math.min(0.97, 0.55 + c.skill*0.04 + T.acc)*100)}</dd></div><div><dt>Maaş</dt><dd>${tl(c.salary)}/ay</dd></div></dl>
      <button class="npgo" data-act="mgr-hire" data-v="${k}" ${S.money<fee?'disabled':''}>İşe al · ${tl(fee)}</button></div>`; }).join('');
  return `<div class="pxhead" style="margin-top:2px"><div><div class="npey">YÖNETİCİ ADAYLARI</div><div class="pxsub">Bir yönetici seç: maaşları, e-postaları, morali, geliştirme kararlarını ve yeni işleri senin ayarlarına göre yürütür.</div></div>
      <button class="pxghost" data-act="mgr-reroll" ${S.money<MGR_REROLL?'disabled':''}>Yeni adaylar · ${tl(MGR_REROLL)}</button></div>
    <div class="mgrgrid">${cards}</div>`;
}function mgrMenu(){
  if (!S.mgr){ openPage('ekip'); return; }
  const rows = Object.entries(MGR_SET).map(([k, s]) => `<div class="mgrrow"><b>${s.ad}</b><div class="pxmeta">${s.acik}</div>
    <div class="chips" style="margin-top:6px">${Object.entries(s.opts).map(([v, ad]) => `<button class="chip ${(S.mgr.set[k]||'kapali')===v?'on':''}" data-act="mgr-set" data-k="${k}" data-v="${v}">${ad}</button>`).join('')}</div></div>`).join('');
  showModal('', `<div class="ehead"><div class="mav">${mgrAvatar(S.mgr)}</div><div class="grow"><h3>${esc(S.mgr.name)}</h3><div class="pxmeta">${(MGR_TYPES[S.mgr.tip]||MGR_TYPES.insan).ad} yönetici · deneyim ${S.mgr.skill}/10 · ${tl(S.mgr.salary)}/ay · ${S.day - S.mgr.since} gündür seninle</div></div>
      <button class="npx" data-act="close" aria-label="Kapat">✕</button></div>
    <div class="mgrlist">${rows}</div>
    <button class="erow danger" data-act="mgr-fire"><b>Görevden al</b><small>Yönetici ayrılır, işler yeniden sana kalır</small><span class="echev">›</span></button>`, 'pro');
}
// yöneticinin müşteri brifini doldurması (deneyimine göre isabetli)
function mgrStartOffer(o){
  if (!o || S.projs.length >= slots() || !pcOk(o.type)) return false;
  if (!o.brief){ const cl = CLIENT_LIST.find(c=>c.ad===o.client) || pick(CLIENT_LIST); o.brief = makeBrief(cl, o.type); }
  const b = o.brief, acc = mgrAcc(), ok = () => Math.random() < acc;
  const st = ok() ? b.st : pick(Object.keys(STYLES)), f = ok() ? b.f : pick(Object.keys(PRIOS));
  const feats = b.want.slice(0, 2).map(w => ok() ? w : pick(b.opts));
  while (feats.length < 2) feats.push(pick(b.opts.filter(x => !feats.includes(x))));
  S.offers = S.offers.filter(x => x!==o);
  if (S.mgr.tip==='satis') o.pay = Math.round(o.pay*1.15/500)*500;
  const p = makeProj('is', o.type, o.size, 'dengeli', `${o.client}`, {client:o.client, pay:o.pay, minQ:o.minQ, deadline:S.day+o.days, brief:b, cfg:{st, f, feats}});
  S.projs.push(p);
  toast(`🤝 Yöneticin ${esc(S.mgr.name.split(' ')[0])}, ${esc(o.client)} ile anlaştı: ${tl(o.pay)}`); snd('ok'); speakAll('💪');
  return true;
}
function mgrBestOffer(){ return S.offers.filter(o => pcOk(o.type)).sort((a,b) => b.pay/(b.days||1) - a.pay/(a.days||1))[0]; }
function mgrPlan(p){
  const i = p.spr.plans.length, sp = sprStage(p.type, i);
  const best = S.emps.filter(e => !isAway(e) && e.role===sp.role).sort((a,b)=>b.skill-a.skill)[0];
  spForm = {pid:p.id, i, focus: Math.random() < mgrAcc() ? sprBest(p, i) : Math.floor(Math.random()*3), pace:'dengeli', lead: best ? best.id : 'me', ex:[]};
  startSprint(true);
}
function mgrDay(){
  if (!S.mgr) return;
  const M = S.mgr, first = M.name.split(' ')[0];
  if (!M.salFix){ M.salFix = true; M.salary = Math.max(M.salary, round10(salaryFor(10)*(2.4 + ((M.skill||5)-5)*0.3)*((MGR_TYPES[M.tip]||{sal:1}).sal))); }
  // e-postalar ve zam istekleri
  let answered = 0;
  for (const m of [...(S.inbox||[])]){
    if (m.answered != null || m.ignored || S.day - m.day < 1) continue;
    if (m.kind==='not' && m.tpl==='zam'){ if (!mgrOn('maas')) continue; const i = {comert:0, dengeli:1, tutumlu:2}[M.set.maas]; noteReply(m.id, i); m.by = 'mgr'; answered++; }
    else if (!mgrOn('mail')) continue;
    else if (m.kind==='not'){ noteReply(m.id, M.set.mail==='iyi' ? 0 : 1); m.by = 'mgr'; answered++; }
    else if (m.kind==='ekip'){ staffReply(m.id, M.set.mail==='iyi' ? 0 : 1, true); m.by = 'mgr'; answered++; }
    else if (m.replyable){ clientReply(m.id, M.set.mail==='iyi' ? 0 : 1); m.by = 'mgr'; answered++; }
  }
  if (answered) toast(`📧 Yöneticin ${esc(first)} ${answered} e-postayı cevapladı.`);
  // ay başında morali çok düşenlere zam
  if ((S.day-1) % MONTH_DAYS === 0 && (M.set.maas==='comert' || M.set.maas==='dengeli')){
    const low = S.emps.filter(e => (e.mood??70) < 45), pct = M.set.maas==='comert' ? 0.10 : 0.05;
    for (const e of low){ e.salary = round10(e.salary*(1+pct)); moodOne(e, M.set.maas==='comert' ? 12 : 6); }
    if (low.length) toast(`💰 Yöneticin morali düşük ${low.length} çalışana %${pct*100} zam yaptı.`);
  }
  if (M.tip==='insan' && (S.day-1) % MONTH_DAYS === 0 && S.emps.length){ for (const e of S.emps) e.mood = clamp((e.mood??70) + 4, 5, 100); toast(`💙 Yöneticin ${esc(first)} ekiple birebir görüştü: herkesin morali +4`); }
  // moral düşünce ekip aktivitesi
  if (mgrOn('moral') && S.emps.length && teamMood() < 55 && S.day >= (M.nextAct||0) && !page && $('modal').classList.contains('hidden')){
    const a = TEAM_ACTS.filter(x => actReady(x) && !(x.office && S.office < x.office) && S.money >= actCost(x)*3).sort((x,y) => y.m - x.m)[0];
    if (a){ M.nextAct = S.day + 12; doTeamAct(a.id); if (M.tip==='insan') moodAll(4); toast(`🎉 Yöneticin ${esc(first)} morali yükseltmek için "${a.ad}" düzenledi.`); }
  }
  // eğitim: yetersiz bulduğu çalışanları eğitime gönderir (ekibin en fazla %40'ı aynı anda görevde)
  if (mgrOn('egitim') && S.emps.length && S.day >= (M.nextEdu||0)){
    M.nextEdu = S.day + 7;
    const mode = M.set.egitim, lim = {zayif:5, orta:7, herkes:10}[mode] || 5, max = mode==='herkes' ? 2 : 1;
    const room = Math.max(1, Math.floor(S.emps.length*0.4)) - S.emps.filter(e => e.task).length;
    const keep = salaries()*2, sent = [];
    const pool = S.emps.filter(e => !e.task && (e.skill < lim || (mode==='herkes' && learnable(e.know, e.role).length))).sort((a,b) => a.skill - b.skill);
    for (const e of pool){
      if (sent.length >= Math.min(max, room)) break;
      if (e.skill < lim){ const c = trainCost(e); if (S.money - c < keep) continue; S.money -= c; e.task = {type:'egitim', until:S.day + 4}; sent.push(`${firstName(e)} (yetenek eğitimi, ${tl(c)})`); }
      else { const it = learnable(e.know, e.role).sort((a,b) => learnCost(a) - learnCost(b))[0]; if (!it) continue; const c = learnCost(it); if (S.money - c < keep) continue; S.money -= c; e.task = {type:'ogren', item:it.id, until:S.day + it.gun, from:S.day}; sent.push(`${firstName(e)} (${it.ad}, ${tl(c)})`); }
    }
    if (sent.length){ sceneKey = ''; toast(`Yöneticin ${esc(first)} eğitime gönderdi: ${sent.map(esc).join(', ')}`); }
  }
  // yeni işler
  if (mgrOn('is') && S.projs.length < slots() && S.day >= (M.nextJob||0)){
    const o = mgrBestOffer();
    if (o){
      M.nextJob = S.day + 3;
      if (M.set.is === 'oto') mgrStartOffer(o);
      else if (!M.pending && !page && $('modal').classList.contains('hidden')){
        M.pending = o.id; const T = TYPES[o.type];
        showModal('', `<div class="ehead"><div class="mav">${mgrAvatar(S.mgr)}</div><div class="grow"><div class="npey">YÖNETİCİ ÖNERİSİ</div><h3>Bu işi alalım mı?</h3></div></div>
          <p class="pxsub" style="margin:0 0 10px">"Patron, boş bir slotumuz var. <b>${esc(o.client)}</b> için bir ${T.ad.toLowerCase()} işi buldum. Uygunsa brifi ben hazırlayıp hemen başlatayım."</p>
          <dl class="npdl"><div><dt>Ödeme</dt><dd>${tl(o.pay)}</dd></div><div><dt>Teslim süresi</dt><dd>${o.days} gün</dd></div><div><dt>Büyüklük</dt><dd>${SIZES[o.size].ad}</dd></div><div><dt>Min. kalite</dt><dd>${o.minQ||'Yok'}</dd></div></dl>
          <div class="grid2" style="gap:10px;margin-top:12px"><button class="pxghost" data-act="mgr-no">Şimdi değil</button><button class="npgo" data-act="mgr-yes">Evet, başlat</button></div>`, 'pro');
      }
    }
  }
}
/* ---- borsa: al/sat penceresi (miktar yazılır) ---- */
function stockTrade(k, mode){
  const s = STOCKS.find(x=>x.k===k); if (!s) return;
  const x = stockState()[k], buy = mode === 'al', price = buy ? x.p*1.002 : x.p*0.998;
  const max = buy ? Math.max(0, Math.floor(S.money/price)) : x.own;
  if (!buy && !x.own){ toast('Bu şirketten hissen yok.'); return; }
  const qs = [10, 100, 1000].filter(q => q < max).map(q => `<button class="chip" data-act="stock-q" data-v="${q}">${fmt(q)}</button>`).join('')
    + (max > 1 ? `<button class="chip" data-act="stock-q" data-v="${Math.floor(max/2)}">Yarısı</button>` : '')
    + `<button class="chip" data-act="stock-q" data-v="${max}">Hepsi · ${fmt(max)}</button>`;
  showModal('', `<div class="nphead"><div><div class="npey">${buy ? 'HİSSE AL' : 'HİSSE SAT'} · ${s.k}</div><h3>${esc(s.ad)}</h3><div class="pxmeta">${s.s||''} · fiyat ${tl(x.p)} · elinde ${fmt(x.own)} adet</div></div>
      <button class="npx" data-act="close" aria-label="Kapat">✕</button></div>
    <div class="pxlbl">Kaç adet ${buy ? 'almak' : 'satmak'} istiyorsun?</div>
    <input type="number" id="stqty" class="stqty" min="1" max="${max}" step="1" inputmode="numeric" placeholder="Adet yaz" value="${Math.min(buy ? 10 : x.own, max) || ''}">
    <div class="chips" style="margin-top:8px">${qs}</div>
    <dl class="npdl" style="margin-top:10px"><div><dt>Birim fiyat (işlem ücreti dahil)</dt><dd>${tl(price)}</dd></div>
      <div><dt>${buy ? 'Toplam ödeyeceğin' : 'Eline geçecek'}</dt><dd id="sttot">—</dd></div>
      <div><dt>${buy ? 'Sonra kalan para' : 'Kâr / zarar'}</dt><dd id="strest">—</dd></div></dl>
    <div class="grid2" style="gap:10px;margin-top:12px"><button class="pxghost" data-act="close">Vazgeç</button><button class="npgo" id="stgo" data-act="stock-do" data-v="${k}" data-m="${mode}">${buy ? 'Satın al' : 'Sat'}</button></div>`, 'pro');
  const inp = document.getElementById('stqty'), avg = x.own ? x.cost/x.own : 0;
  const upd = () => {
    const n = Math.max(0, Math.floor(+inp.value || 0)), tot = n*price, bad = n <= 0 || n > max;
    document.getElementById('sttot').textContent = n ? tl(tot) : '—';
    const r = document.getElementById('strest');
    if (buy){ r.textContent = n ? tl(S.money - tot) : '—'; r.className = S.money - tot < 0 ? 'red' : ''; }
    else { const pl = tot - avg*n; r.textContent = n ? (pl>=0?'+':'') + tl(pl) : '—'; r.className = pl >= 0 ? 'green' : 'red'; }
    document.getElementById('stgo').disabled = bad;
  };
  inp.addEventListener('input', upd); upd(); setTimeout(() => { inp.focus(); inp.select(); }, 60);
}