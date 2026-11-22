'use strict';
/* =====================================================================
   Bytetown – "Cıvıl" sosyal medya uygulaması (Bytetown OS içinde)
   Herkes kısa gönderiler (cıvıltı) ve fotoğraflı paylaşımlar yapar.
   Oyundaki olaylar (lansman, müşteri yorumu, dava, saldırı, fuar…)
   insanların ağzında gönderiye dönüşür. Hakkımızda yazılanları okur,
   cevap verir, kendi hesabımızdan paylaşım yaparız. Takipçi sayımız
   yeni ürünlerin ilgisini artırır.
   ===================================================================== */
const SM_ICON = '<svg viewBox="0 0 48 48"><defs><linearGradient id="cvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#cvg)"/><path d="M13 30c0-8 6-14 14-14 4 0 7 2 9 4l-4 1c2 2 2 5 1 7-2 4-6 6-11 6h-4l-5 4z" fill="#fff"/><circle cx="28" cy="22" r="1.8" fill="#6366f1"/></svg>';
const SM_PEOPLE = ['Ayşe', 'Mert', 'Zeynep', 'Can', 'Elif', 'Burak', 'Selin', 'Emre', 'Deniz', 'Ece', 'Kaan', 'Nil', 'Ozan', 'Derya', 'Arda', 'Sude', 'Barış', 'İpek', 'Tolga', 'Melis'];
const SM_SUFFIX = ['_kodlar', '.dev', '_tekno', '34', '_bt', 'nin_gunlugu', '_oyuncu', '.tasarim', '_app', '06'];
const SM_NEWS = [{n:'Bytetown Haber', h:'bytetownhaber', ver:1, c:'#dc2626'}, {n:'Tekno Gündem', h:'teknogundem', ver:1, c:'#0891b2'}, {n:'Girişim Dergisi', h:'girisimdergi', ver:1, c:'#7c3aed'}];
const SM_STARS = [{n:'Leyla Teknoloji', h:'leylatech', ver:1, c:'#db2777', fol:'1,2 Mn'}, {n:'Oyun Kralı Efe', h:'oyunkraliefe', ver:1, c:'#ea580c', fol:'860 B'}, {n:'Kod Hocası Nazlı', h:'kodhocasi', ver:1, c:'#059669', fol:'420 B'}];
const smS = () => { S.sm = S.sm || {posts:[], fol:120, seen:0, n:0, mine:0, last:-9, trend:[]}; return S.sm; };
const smHandle = () => (typeof osAscii === 'function' ? osAscii(S.name) : 'sirket').slice(0, 16) || 'sirket';
const smTag = s => '#' + (typeof osAscii === 'function' ? s.split(' ').map(w => w[0].toUpperCase() + osAscii(w).slice(1)).join('') : s.replace(/\s+/g, ''));
function smPerson(){ const n = pick(SM_PEOPLE); return {n, h:(typeof osAscii === 'function' ? osAscii(n) : n.toLowerCase()) + pick(SM_SUFFIX), c:pick(['#2563eb', '#16a34a', '#d97706', '#9333ea', '#0d9488', '#e11d48', '#475569'])}; }
const smK = n => n >= 1e6 ? (n/1e6).toFixed(1).replace('.', ',') + ' Mn' : n >= 1e4 ? Math.round(n/1e3) + ' B' : n >= 1e3 ? (n/1e3).toFixed(1).replace('.', ',') + ' B' : String(Math.round(n));

/* ---- gönderi ekle ---- */
function smPost(a, t, o){
  const s = smS(); o = o || {};
  const big = a.ver ? 6 : 1, base = Math.max(3, Math.round((5 + Math.random()*40)*big*(o.boost || 1)));
  const p = {id:++s.n, a:{n:a.n, h:a.h, c:a.c, ver:a.ver || 0, me:!!a.me}, t, d:S.day, lk:base*(3 + Math.floor(Math.random()*5)), rt:Math.round(base*(0.2 + Math.random()*0.6)), rp:Math.round(base*0.3*Math.random()), ment:!!o.ment, sent:o.sent || 0, img:o.img || null, tag:o.tag || null, reply:o.reply || null, done:false, liked:false};
  s.posts.unshift(p); s.posts = s.posts.slice(0, 80);
  if (o.tag){ s.trend = [o.tag].concat((s.trend || []).filter(x => x !== o.tag)).slice(0, 6); }
  return p;
}
// olaylardan gönderi üret (oyunun her yerinden çağrılır)
function smEvent(k, d){
  if (!S) return; d = d || {};
  const co = S.name, me = '@' + smHandle(), N = pick(SM_NEWS), P = smPerson();
  try {
    if (k === 'urun'){
      const q = d.q || 60, tag = smTag(d.name), good = q >= 70, bad = q < 45;
      smPost(N, `${co} bugün yeni ürününü yayınladı: ${d.name}. İlk yorumlar ${good ? 'çok olumlu' : bad ? 'pek iç açıcı değil' : 'karışık'}.`, {ment:true, tag, img:{k:'urun', t:d.name, s:d.type || ''}, sent:good ? 1 : bad ? -1 : 0});
      smPost(P, good ? pick([`${d.name} indirdim ve bayıldım! ${me} ellerinize sağlık 👏`, `${tag} denedim, çok akıcı. Telefonumdan silmeyeceğim!`, `Uzun zamandır bu kadar iyi bir uygulama görmemiştim. ${me}`]) : bad ? pick([`${d.name} sürekli donuyor, ${me} bu ne?`, `${tag} beklediğim gibi değil, hayal kırıklığı.`, `İndirdim, 5 dakikada sildim. ${me} biraz daha çalışın.`]) : pick([`${d.name} fena değil ama geliştirilmesi lazım. ${me}`, `${tag} denedim, idare eder.`]), {ment:true, sent:good ? 1 : bad ? -1 : 0, tag});
      if (q >= 85){ const st = pick(SM_STARS); smPost(st, `Bu haftanın favori uygulaması: ${d.name}! ${me} ekibini tebrik ediyorum, mutlaka deneyin. ${tag}`, {ment:true, sent:1, boost:3, tag, img:{k:'yildiz', t:d.name, s:'Haftanın favorisi'}}); smFollow(Math.round(200 + Math.random()*600)); smNotify(`${st.n} ürününü paylaştı!`); }
    } else if (k === 'is'){
      const sc = d.sc, cl = d.client;
      smPost({n:cl, h:(typeof osAscii === 'function' ? osAscii(cl) : 'musteri').slice(0, 14), c:'#334155', ver:sc >= 8 ? 1 : 0}, sc >= 8 ? `Yeni sistemimiz yayında! Harika iş çıkaran ${me} ekibine teşekkürler 🙌` : sc >= 6 ? `Yeni sistemimizi ${me} ile tamamladık. Emeği geçenlere teşekkürler.` : `${me} ile çalıştık… Açıkçası beklentimizin altında kaldı.`, {ment:true, sent:sc >= 7 ? 1 : sc < 5 ? -1 : 0});
    } else if (k === 'dava'){
      smPost(N, d.def ? `${d.client}, ${co} hakkında tazminat davası açtı. Şirket iddiaları reddediyor.` : `${co}, ödeme yapmayan müşterisi ${d.client} hakkında dava açtı.`, {ment:true, sent:d.def ? -1 : 0, tag:'#BytetownAdliyesi'});
    } else if (k === 'karar'){
      smPost(N, d.won ? `Mahkeme ${co} lehine karar verdi. ${d.client} davası kapandı.` : `${d.client} davasında ${co} kaybetti.`, {ment:true, sent:d.won ? 1 : -1});
    } else if (k === 'hack'){
      smPost(N, d.leak ? `SON DAKİKA: ${d.name} uygulamasında büyük veri sızıntısı! ${co} kullanıcılardan şifrelerini değiştirmelerini istedi.` : `${co}, ${d.name} uygulamasına yönelik bir siber saldırıyı püskürttü.`, {ment:true, sent:d.leak ? -1 : 1, tag:d.leak ? '#VeriSızıntısı' : '#SiberGüvenlik', boost:d.leak ? 3 : 1});
      if (d.leak) smPost(P, `${me} verilerimi koruyamadınız, hemen hesabımı siliyorum!! 😡`, {ment:true, sent:-1});
    } else if (k === 'fuar'){
      smPost(P, `#BytetownFuarı'nda ${co} standı çok kalabalıktı! ${d.stand === 'buyuk' ? 'Sahne şovu muhteşemdi 🔥' : 'Ekip çok ilgiliydi.'} ${me}`, {ment:true, sent:1, tag:'#BytetownFuarı', img:{k:'fuar', t:co, s:'Fuar standı'}});
    } else if (k === 'ise'){
      smPost({n:d.name, h:(typeof osAscii === 'function' ? osAscii(d.name) : 'kisi').slice(0, 14), c:'#0d9488'}, `Yeni bir maceraya başlıyorum: artık ${me} ekibindeyim! 🚀`, {ment:true, sent:1});
    } else if (k === 'odul'){
      smPost(N, `Bytetown Teknoloji Ödülleri'nde ${co} sahneye çıktı! 🏆`, {ment:true, sent:1, tag:'#BytetownÖdülleri', img:{k:'odul', t:co, s:'Ödül töreni'}});
    } else if (k === 'rakip'){
      smPost({n:d.rival, h:(typeof osAscii === 'function' ? osAscii(d.rival) : 'rakip').slice(0, 14), c:'#1e293b', ver:1}, d.t, {sent:0, tag:d.tag || null});
    } else if (k === 'haber'){
      smPost(N, d.t, {tag:d.tag || null, ment:!!d.ment, sent:d.sent || 0});
    }
  } catch (e) {}
}
function smFollow(n){ const s = smS(); s.fol = Math.max(0, Math.round(s.fol + n)); }
function smNotify(t){ if (typeof toast === 'function') toast(`Cıvıl: ${t}`); }
const smUnread = () => { const s = S && S.sm; return s ? s.posts.filter(p => p.ment && p.id > (s.seen || 0)).length : 0; };
function smPeakMult(){ const f = (S.sm && S.sm.fol) || 0; return 1 + Math.min(0.18, Math.log10(1 + f)/30); }

/* ---- her gün: halkın sohbeti ---- */
function smDay(){
  if (!S) return;
  const s = smS();
  s.fol = Math.round(s.fol + Math.max(0, S.rep*0.15 + (S.prods || []).filter(p => p.active).length*2) * (0.6 + Math.random()*0.8));
  if (Math.random() < 0.55){
    const live = (S.prods || []).filter(p => p.active && p.users > 30);
    if (live.length && Math.random() < 0.6){
      const p = pick(live), P = smPerson(), me = '@' + smHandle(), good = p.q >= 70, bad = p.q < 45;
      smPost(P, good ? pick([`${p.name} olmadan günüm geçmiyor 😍`, `Bugün de ${p.name} ile işlerimi hallettim. ${me} teşekkürler!`, `${p.name} için yeni güncellemeyi sabırsızlıkla bekliyoruz ${me}!`]) : bad ? pick([`${p.name} yine çöktü… ${me}`, `${me} ${p.name} ne zaman düzelecek?`, `${p.name} çok yavaş, alternatif önerisi olan?`]) : pick([`${p.name} kullanan var mı? Nasıl?`, `${p.name} idare eder, ama reklamlar çok fazla. ${me}`]), {ment:true, sent:good ? 1 : bad ? -1 : 0});
    } else {
      const R = typeof RIVALS !== 'undefined' && RIVALS.length ? pick(RIVALS) : null;
      const gen = [
        () => smPost(pick(SM_NEWS), pick(['Bytetown\'da yazılım sektörü bu yıl %18 büyüdü.', 'Uzmanlar: yapay zekâ uygulamalarına ilgi artmaya devam edecek.', 'Şehirde yeni bir teknoloji vadisi kuruluyor.', 'Genç yazılımcılar en çok hangi şirkette çalışmak istiyor? Anket sonuçları açıklandı.']), {tag:pick(['#YazılımSektörü', '#Teknoloji', '#Girişim'])}),
        () => R && smPost({n:R.n, h:(typeof osAscii === 'function' ? osAscii(R.n) : 'rakip').slice(0, 14), c:'#1e293b', ver:1}, pick(['Yeni ofisimize taşındık! 🏢', 'Ekibimize yetenekli yazılımcılar arıyoruz.', 'Yeni ürünümüz çok yakında… 👀', 'Bu yılın en iyi şirketi olmak için çalışıyoruz.'])),
        () => { const P = smPerson(); smPost(P, pick(['Pazartesi sendromu + bitmeyen bug = ben 😅', 'Bugün ilk uygulamamı yayınladım!', 'Kahve olmadan kod yazılmaz ☕', 'Hangi programlama dilini öğrenmeliyim? Fikir verin.'])); },
      ];
      pick(gen)();
    }
  }
  if (S.day % 30 === 17 && (s.trend || []).length < 2) s.trend = ['#YazılımSektörü', '#Teknoloji'].concat(s.trend || []).slice(0, 6);
}

/* ---- kendi paylaşımımız ---- */
const SM_COMPOSE = [
  {k:'duyuru', ad:'Duyuru', acik:'Yakında gelecek ürünü duyur. Merak artar, takipçi gelir.', cost:0},
  {k:'kampanya', ad:'Reklamlı kampanya', acik:'Ücretli tanıtım: seçtiğin üründe kullanıcı patlaması.', cost:1},
  {k:'tesekkur', ad:'Kullanıcılara teşekkür', acik:'Samimi bir teşekkür. Az ama güvenli itibar.', cost:0},
  {k:'ofis', ad:'Ofisten fotoğraf', acik:'Ekibin eğlenceli bir fotoğrafı. Takipçi kazandırır.', cost:0},
  {k:'laf', ad:'Rakibe laf at', acik:'Riskli: ya çok konuşulursun ya da tepki çekersin.', cost:0},
];
function smCompose(k){
  const s = smS(); if (S.day - (s.last || -9) < 2){ toast('Çok sık paylaşım yapma, takipçiler sıkılır. Biraz bekle.'); return; }
  const me = {n:S.name, h:smHandle(), c:'#1d4ed8', ver:S.rep >= 100 ? 1 : 0, me:true};
  const live = (S.prods || []).filter(p => p.active).sort((a, b) => b.users - a.users), top = live[0];
  let res = '';
  if (k === 'duyuru'){ const pj = (S.projs || []).find(p => p.kind !== 'is'); smPost(me, pj ? `Çok yakında: ${pj.name}! Hazır mısınız? 🚀` : 'Yeni bir projenin üzerinde çalışıyoruz, yakında haberler gelecek! 👀', {boost:2, img:{k:'duyuru', t:pj ? pj.name : 'Çok yakında', s:'Yeni ürün'}}); const f = Math.round(30 + S.rep*0.8 + Math.random()*80); smFollow(f); if (pj) pj.hype = (pj.hype || 0) + 1; res = `+${f} takipçi`; }
  else if (k === 'kampanya'){ if (!top) return; const c = Math.max(20000, Math.round(top.users*TYPES[top.type].arpu*4)); if (S.money < c) return; S.money -= c; const g = Math.round(top.peak*0.08); top.peak += g; top.users += Math.round(g*0.4); smPost(me, `${top.name} şimdi çok daha iyi! Hemen indir, ilk ay hediyemiz olsun 🎁`, {boost:4, img:{k:'urun', t:top.name, s:'Kampanya'}}); smFollow(Math.round(g*0.05)); res = `${tl(c)} harcandı · ${top.name} için +${fmt(g)} potansiyel kullanıcı`; }
  else if (k === 'tesekkur'){ smPost(me, `Bizi kullanan herkese kocaman teşekkürler! Sizin sayenizde buradayız ❤️`, {boost:1.5}); S.rep += 1; smFollow(20 + Math.round(Math.random()*40)); res = 'İtibar +1'; }
  else if (k === 'ofis'){ smPost(me, `Ofiste bugün ${pick(['pizza günü', 'masa tenisi turnuvası', 'doğum günü kutlaması', 'kod maratonu'])} vardı! 🎉 #${smHandle()}Ekibi`, {boost:2.5, img:{k:'ofis', t:S.name, s:'Ekibimiz'}}); const f = Math.round(60 + S.emps.length*12 + Math.random()*100); smFollow(f); if (typeof moodAll === 'function') moodAll(2, 'Ekip fotoğrafı çok beğenildi'); res = `+${f} takipçi · ekip morali +2`; }
  else if (k === 'laf'){ const R = typeof RIVALS !== 'undefined' && RIVALS.length ? pick(RIVALS) : {n:'Rakip'}; const ok = Math.random() < 0.5; smPost(me, `Bazıları sadece konuşur, biz ise ürün çıkarırız 😎 (${R.n}, kendini bil)`, {boost:ok ? 5 : 3}); if (ok){ const f = Math.round(300 + Math.random()*700); smFollow(f); res = `Çok konuşuldu! +${f} takipçi`; } else { S.rep = Math.max(0, S.rep - 3); smFollow(-80); smPost(pick(SM_NEWS), `Sosyal medyada kavga: ${S.name} rakibine sert çıktı, kullanıcılar tepkili.`, {ment:true, sent:-1, tag:'#Kavga'}); res = 'Tepki çekti: itibar -3'; } }
  s.last = S.day; s.mine = (s.mine || 0) + 1; snd('ok'); toast(`Paylaşıldı. ${res}`);
}
function smReply(id, how){
  const s = smS(), p = s.posts.find(x => x.id === id); if (!p || p.done) return;
  p.done = true;
  const me = {n:S.name, h:smHandle(), c:'#1d4ed8', ver:S.rep >= 100 ? 1 : 0, me:true};
  if (how === 'ozur'){ smPost(me, `@${p.a.h} yaşadığınız sorun için çok özür dileriz. Ekibimiz hemen ilgileniyor, size özel destek hattımızdan dönüş yapacağız 🙏`, {reply:p.a.h}); if (Math.random() < 0.75){ S.rep += 1; smPost(p.a, `Hızlı cevap için teşekkürler @${smHandle()}, sorun çözüldü 👍`, {ment:true, sent:1}); toast('Kullanıcı memnun kaldı: itibar +1'); } else toast('Kullanıcı cevabını gördü.'); }
  else if (how === 'sert'){ smPost(me, `@${p.a.h} ürünümüzde bir sorun yok, belki de telefonunuzu değiştirmelisiniz.`, {reply:p.a.h}); if (Math.random() < 0.3){ smFollow(150); toast('Esprili bulundu, takipçi kazandın.'); } else { S.rep = Math.max(0, S.rep - 4); smPost(pick(SM_NEWS), `${S.name} bir kullanıcıya kaba cevap verdi; sosyal medyada büyük tepki var.`, {ment:true, sent:-1, tag:'#Tepki', boost:3}); toast('Büyük tepki çekti: itibar -4'); } }
  else if (how === 'tesekkur'){ smPost(me, `@${p.a.h} çok teşekkür ederiz! 💙`, {reply:p.a.h}); smFollow(15); }
  snd('click');
}

/* ---- ekran ---- */
let smView = {tab:'akis'};
function smPhoto(img){
  const g = {urun:['#6366f1', '#22d3ee'], yildiz:['#db2777', '#f59e0b'], fuar:['#0d9488', '#22c55e'], ofis:['#f97316', '#facc15'], odul:['#a16207', '#facc15'], duyuru:['#1e3a8a', '#7c3aed']}[img.k] || ['#334155', '#64748b'];
  const ic = {urun:'<rect x="128" y="34" width="64" height="104" rx="12" fill="#fff" opacity=".95"/><rect x="138" y="50" width="44" height="64" rx="4" fill="' + g[0] + '" opacity=".6"/>', yildiz:'<path d="M160 36l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill="#fff"/>', fuar:'<rect x="104" y="60" width="112" height="70" rx="6" fill="#fff" opacity=".95"/><rect x="104" y="44" width="112" height="20" rx="4" fill="#fff" opacity=".7"/>', ofis:'<circle cx="126" cy="80" r="16" fill="#fff"/><circle cx="160" cy="72" r="16" fill="#fff"/><circle cx="194" cy="80" r="16" fill="#fff"/><rect x="104" y="98" width="112" height="36" rx="18" fill="#fff" opacity=".9"/>', odul:'<path d="M138 40h44v22a22 22 0 0 1-44 0z" fill="#fff"/><rect x="152" y="84" width="16" height="22" fill="#fff"/><rect x="138" y="106" width="44" height="10" rx="3" fill="#fff"/>', duyuru:'<path d="M118 70l64-26v84l-64-26z" fill="#fff"/><rect x="104" y="70" width="16" height="32" rx="4" fill="#fff"/>'}[img.k] || '';
  return `<div class="cvimg"><svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="cv${img.k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs><rect width="320" height="180" fill="url(#cv${img.k})"/>${ic}<text x="160" y="160" text-anchor="middle" fill="#fff" font-size="15" font-weight="800">${esc(img.t)}</text></svg><span>${esc(img.s || '')}</span></div>`;
}
function smPostHTML(p){
  const av = `<span class="cvav" style="background:${p.a.c}">${esc(p.a.n[0] || '?')}</span>`;
  const txt = esc(p.t).replace(/(^|[^&\w])(#[A-Za-zçğıöşüÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ]*)/g, '$1<i class="cvtag">$2</i>').replace(/(@[\w.]+)/g, '<i class="cvat">$1</i>');
  const neg = p.ment && p.sent < 0 && !p.a.me && !p.done, pos = p.ment && p.sent > 0 && !p.a.me && !p.done;
  return `<article class="cvpost ${p.a.me ? 'me' : ''} ${p.ment && p.sent < 0 ? 'neg' : ''}">${av}<div class="cvb">
    <div class="cvh"><b>${esc(p.a.n)}</b>${p.a.ver ? '<span class="cvver" title="Onaylı hesap">✓</span>' : ''}<small>@${esc(p.a.h)} · ${S.day - p.d === 0 ? 'bugün' : (S.day - p.d) + ' gün önce'}</small></div>
    <p>${txt}</p>${p.img ? smPhoto(p.img) : ''}
    <div class="cvact"><button data-act="cv" data-k="lk" data-id="${p.id}" class="${p.liked ? 'on' : ''}">♥ ${smK(p.lk + (p.liked ? 1 : 0))}</button><span>⟲ ${smK(p.rt)}</span><span>💬 ${smK(p.rp)}</span>
      ${neg ? `<button class="cvr good" data-act="cv" data-k="ozur" data-id="${p.id}">Özür dile, çözüm sun</button><button class="cvr bad" data-act="cv" data-k="sert" data-id="${p.id}">Sert cevap ver</button>` : pos ? `<button class="cvr" data-act="cv" data-k="tesekkur" data-id="${p.id}">Teşekkür et</button>` : ''}</div></div></article>`;
}
function smHTML(){
  const s = smS(), tab = smView.tab || 'akis', un = smUnread();
  const tabs = [['akis', 'Akış'], ['bahs', `Hakkımızda${un ? ` <i class="osbadge">${un}</i>` : ''}`], ['gundem', 'Gündem'], ['profil', 'Profilimiz']].map(([k, t]) => `<button class="${tab === k ? 'on' : ''}" data-act="cv" data-k="tab" data-v="${k}">${t}</button>`).join('');
  let body;
  if (tab === 'bahs'){
    const L = s.posts.filter(p => p.ment && !p.a.me), pos = L.filter(p => p.sent > 0).length, neg = L.filter(p => p.sent < 0).length;
    const mood = L.length ? Math.round((pos - neg)/L.length*100) : 0;
    s.seen = s.n;
    body = `<div class="cvmood"><div><b>${L.length}</b><small>bahsedilme</small></div><div><b class="green">${pos}</b><small>olumlu</small></div><div><b class="red">${neg}</b><small>olumsuz</small></div><div class="grow"><small>Genel hava</small><div class="cvmbar"><i style="left:${50 + Math.min(50, Math.max(-50, mood/2))}%"></i></div><b class="${mood > 10 ? 'green' : mood < -10 ? 'red' : ''}">${mood > 10 ? 'Seviliyorsun' : mood < -10 ? 'Eleştiriliyorsun' : 'Karışık'}</b></div></div>
      ${L.length ? L.slice(0, 30).map(smPostHTML).join('') : '<div class="empty-msg">Henüz kimse senden bahsetmiyor. Bir ürün yayınla ya da paylaşım yap!</div>'}`;
  } else if (tab === 'gundem'){
    const tr = (s.trend || []).length ? s.trend : ['#YazılımSektörü'];
    body = `<div class="cvtrend">${tr.map((t, i) => `<div><small>${i + 1} · Bytetown gündemi</small><b>${esc(t)}</b><span>${smK(400 + (6 - i)*700 + (t.length*137 % 900))} gönderi</span></div>`).join('')}</div>
      ${s.posts.filter(p => p.tag && tr.includes(p.tag)).slice(0, 12).map(smPostHTML).join('')}`;
  } else if (tab === 'profil'){
    const mine = s.posts.filter(p => p.a.me), pics = s.posts.filter(p => p.img && (p.a.me || p.ment)).slice(0, 9);
    body = `<div class="cvprof"><div class="cvcover"></div><span class="cvav big" style="background:#1d4ed8">${esc(S.name[0])}</span>
      <div class="cvpi"><b>${esc(S.name)} ${S.rep >= 100 ? '<span class="cvver">✓</span>' : ''}</b><small>@${esc(smHandle())} · Bytetown merkezli yazılım şirketi</small>
      <div class="cvst"><span><b>${smK(s.fol)}</b> takipçi</span><span><b>${s.mine || 0}</b> paylaşım</span><span><b>+%${Math.round((smPeakMult() - 1)*100)}</b> lansman etkisi</span></div></div></div>
      <div class="pxlbl">Yeni paylaşım</div><div class="cvcomp">${SM_COMPOSE.map(c => { const top = (S.prods || []).filter(p => p.active).sort((a, b) => b.users - a.users)[0]; const cost = c.cost && top ? Math.max(20000, Math.round(top.users*TYPES[top.type].arpu*4)) : 0; const dis = (c.k === 'kampanya' && (!top || S.money < cost)) || S.day - (s.last || -9) < 2;
        return `<button data-act="cv" data-k="paylas" data-v="${c.k}" ${dis ? 'disabled' : ''}><b>${c.ad}</b><small>${c.acik}</small>${cost ? `<em>${tl(cost)}</em>` : ''}</button>`; }).join('')}</div>
      ${S.day - (s.last || -9) < 2 ? '<p class="sub">Bir sonraki paylaşımı yarın yapabilirsin.</p>' : ''}
      ${pics.length ? `<div class="pxlbl">Fotoğraflar</div><div class="cvgrid">${pics.map(p => smPhoto(p.img)).join('')}</div>` : ''}
      ${mine.length ? `<div class="pxlbl">Paylaşımlarımız</div>${mine.slice(0, 10).map(smPostHTML).join('')}` : ''}`;
  } else body = s.posts.length ? s.posts.slice(0, 40).map(smPostHTML).join('') : '<div class="empty-msg">Akış boş. Birkaç gün içinde insanlar konuşmaya başlar.</div>';
  return `<div class="cv"><div class="cvtop">${SM_ICON}<b>Cıvıl</b><span>${smK(s.fol)} takipçi</span></div><div class="cvtabs">${tabs}</div><div class="cvfeed">${body}</div></div>`;
}
function smAct(el){
  const k = el.dataset.k, id = +el.dataset.id, s = smS();
  if (k === 'tab'){ smView.tab = el.dataset.v; const pb = $('pBody'); if (pb) pb.scrollTop = 0; }
  else if (k === 'lk'){ const p = s.posts.find(x => x.id === id); if (p) p.liked = !p.liked; }
  else if (k === 'paylas') smCompose(el.dataset.v);
  else if (k === 'ozur' || k === 'sert' || k === 'tesekkur') smReply(id, k);
  renderPage(true);
}
// Bytetown OS'a uygulama olarak ekle
if (typeof OS_APPS !== 'undefined'){ OS_ICON.civil = SM_ICON; if (!OS_APPS.some(a => a[0] === 'civil')) OS_APPS.splice(1, 0, ['civil', 'Cıvıl']); }
window.OS_EXT = Object.assign(window.OS_EXT || {}, {civil:() => smHTML()});
if (typeof ACTIONS !== 'undefined') ACTIONS.cv = el => smAct(el);
function smTileHTML(){ const n = S ? smUnread() : 0; return `<button class="pcm-t" data-act="cvopen">${n ? '<span class="badge-dot">!</span>' : ''}<span class="ci">${SM_ICON.replace('<svg ', '<svg width="30" height="30" ')}</span><span>Cıvıl</span></button>`; }
if (typeof ACTIONS !== 'undefined') ACTIONS.cvopen = () => { if (typeof osView !== 'undefined') osView = {app:'civil'}; smView.tab = smUnread() ? 'bahs' : 'akis'; openPage('pc'); };
function smForce(k){
  smS();
  if (k === 'akis'){ for (let i = 0; i < 6; i++) smDay(); smEvent('urun', {name:'Test Uygulaması', q:88, type:'Mobil'}); smEvent('hack', {name:'Test Uygulaması', leak:true}); ACTIONS.cvopen(); return; }
}
