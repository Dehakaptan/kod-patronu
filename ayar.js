'use strict';
/* =====================================================================
   Bytetown – kayıt yuvaları, zorluk, müzik ve ses
   ===================================================================== */

/* ---------------- ZORLUK ---------------- */
const DIF = {
  kolay: {ad:'Kolay',  acik:'Daha çok para, daha az kriz. Rahat bir oyun.',        pay:1.2,  rev:1.2,  cost:0.85, risk:0.5, rel:1.2,  para:150000},
  normal:{ad:'Normal', acik:'Dengeli deneyim. Oyun böyle tasarlandı.',             pay:1,    rev:1,    cost:1,    risk:1,   rel:1,    para:100000},
  zor:   {ad:'Zor',    acik:'Düşük ödemeler, yüksek giderler, sık kriz ve dava.',  pay:0.85, rev:0.85, cost:1.15, risk:1.6, rel:0.85, para:60000},
};
const difOf = () => DIF[(S && S.dif) || 'normal'] || DIF.normal;
function difMul(k){ return S ? (difOf()[k] ?? 1) : 1; }
function difApply(d){ S.dif = DIF[d] ? d : 'normal'; S.money = DIF[S.dif].para; }
function difSetupHTML(s){
  const cur = s.dif || 'normal';
  return `<div class="pxlbl" style="margin-top:12px">Zorluk</div><div class="difrow">${Object.entries(DIF).map(([k, D]) => `<button class="difc ${cur === k ? 'on' : ''} d-${k}" data-act="su-dif" data-v="${k}"><b>${D.ad}</b><small>${D.acik}</small><em>Başlangıç: ${tl(D.para)}</em></button>`).join('')}</div>`;
}

/* ---------------- KAYIT YUVALARI ---------------- */
const SLOT_KEY = 'bytetown_slot';
const slotKey = n => n === 1 ? 'kodPatronu_v1' : 'kodPatronu_v1_s' + n;
const slotBak = n => n === 1 ? 'kodPatronu_yedek' : 'kodPatronu_yedek_s' + n;
const curSlot = () => { try { return Math.min(3, Math.max(1, +localStorage.getItem(SLOT_KEY) || 1)); } catch (e) { return 1; } };
function slotInfo(n){
  try { const d = JSON.parse(localStorage.getItem(slotKey(n)) || localStorage.getItem(slotBak(n))); if (d && d.name) return {name:d.name, boss:d.boss, day:d.day, money:d.money, dif:d.dif || 'normal', office:d.office || 0}; } catch (e) {}
  return null;
}
function slotHTML(){
  const cur = curSlot();
  return `<h2>Kayıt yuvaları</h2><div class="slots">${[1, 2, 3].map(n => { const I = slotInfo(n), on = n === cur;
    return `<div class="slot ${on ? 'on' : ''} ${I ? '' : 'empty'}"><div class="sln">${n}</div>
      <div class="grow">${I ? `<b>${esc(I.name)}</b><small>${esc(I.boss || 'Patron')} · ${I.day}. gün · ${tl(I.money)} · ${DIF[I.dif] ? DIF[I.dif].ad : 'Normal'}</small>` : '<b>Boş yuva</b><small>Yeni bir şirket kurabilirsin</small>'}</div>
      ${on ? '<span class="slnow">Şu an oynanıyor</span>' : `<button class="btn sm" data-act="slot" data-k="ac" data-v="${n}">${I ? 'Bu oyuna geç' : 'Yeni oyun başlat'}</button>${I ? `<button class="btn sm red" data-act="slot" data-k="sil" data-v="${n}">Sil</button>` : ''}`}</div>`; }).join('')}</div>
    <p class="sub" style="margin:-2px 0 12px">Aynı anda 3 farklı şirketle oynayabilirsin. Yuva değiştirirken mevcut oyunun kaydedilir.</p>`;
}
function slotAct(el){
  const n = +el.dataset.v, k = el.dataset.k; if (!(n >= 1 && n <= 3) || n === curSlot()) return;
  if (k === 'ac'){ try { save(); localStorage.setItem(SLOT_KEY, String(n)); } catch (e) {} location.reload(); return; }
  if (k === 'sil'){ const I = slotInfo(n); confirmBox('', `${n}. yuva silinsin mi?`, `${I ? esc(I.name) : 'Bu kayıt'} kalıcı olarak silinecek. Bu geri alınamaz.`, 'Evet, sil', () => { localStorage.removeItem(slotKey(n)); localStorage.removeItem(slotBak(n)); toast(`${n}. yuva silindi.`); updateAll(true); }); }
}
function difSetHTML(){
  const cur = (S && S.dif) || 'normal';
  return `<h2>Zorluk</h2><div class="difrow" style="margin-bottom:12px">${Object.entries(DIF).map(([k, D]) => `<button class="difc ${cur === k ? 'on' : ''} d-${k}" data-act="dif" data-v="${k}"><b>${D.ad}</b><small>${D.acik}</small></button>`).join('')}</div>`;
}

/* ---------------- MÜZİK VE SES ---------------- */
// müzik tamamen kodla üretilir (hazır parça yok): ofiste sakin, lansmanda coşkulu, mahkemede gergin
const AU = {gain:null, timer:null, next:0, step:0, mood:'', started:false};
const AU_MOODS = {
  ofis:    {bpm:82,  root:57, prog:[[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]], pad:'triangle', arp:[0,1,2,3,2,1,3,2], lvl:0.9, drum:0, type:true},
  lansman: {bpm:120, root:60, prog:[[0,4,7,12],[7,11,14,19],[9,12,16,21],[5,9,12,17]], pad:'sawtooth', arp:[0,2,1,3,0,2,1,3], lvl:1, drum:2},
  mahkeme: {bpm:66,  root:50, prog:[[0,3,7,12],[0,3,8,12],[-2,2,5,10],[-1,2,7,11]], pad:'sine', arp:[0,-1,1,-1,2,-1,1,-1], lvl:0.9, drum:1},
};
const auHz = m => 440*Math.pow(2, (m - 69)/12);
function auCtx(){
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; } catch (e) { return null; }
}
function auVol(){ return (S && S.music !== false) ? (S.musicVol ?? 0.5) : 0; }
function auStart(){
  if (AU.started || !S) return;
  const c = auCtx(); if (!c) return;
  AU.started = true; AU.gain = c.createGain(); AU.gain.gain.value = 0; AU.gain.connect(c.destination);
  AU.next = c.currentTime + 0.1; AU.timer = setInterval(auTick, 90);
}
function auMood(){
  if (window.S3D && S3D.inCourt && S3D.inCourt()) return 'mahkeme';
  const sc = document.getElementById('scene'); if (sc && sc.classList.contains('launch3')) return 'lansman';
  return 'ofis';
}
function auNote(c, t, m, dur, wave, vol, out){
  const o = c.createOscillator(), g = c.createGain();
  o.type = wave; o.frequency.value = auHz(m);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.08, dur*0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
let auNoise = null;
function auNoiseBuf(c){ if (auNoise) return auNoise; const b = c.createBuffer(1, c.sampleRate*0.2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1; return (auNoise = b); }
function auHit(c, t, kind, out){
  if (kind === 'kick'){ const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.3); return; }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = auNoiseBuf(c);
  f.type = 'highpass'; f.frequency.value = kind === 'type' ? 2500 : 6000;
  const v = kind === 'type' ? 0.05 + Math.random()*0.04 : 0.07, d = kind === 'type' ? 0.03 : 0.05;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d + 0.02);
}
function auTick(){
  const c = actx; if (!c || !AU.gain) return;
  const target = auVol()*0.22;
  AU.gain.gain.setTargetAtTime(target, c.currentTime, 0.4);
  if (target <= 0.0001 || document.hidden){ AU.next = c.currentTime + 0.1; return; }
  const mood = auMood(); if (mood !== AU.mood){ AU.mood = mood; AU.step = 0; }
  const M = AU_MOODS[mood], e8 = 60/M.bpm/2;
  while (AU.next < c.currentTime + 0.25){
    const t = AU.next, st = AU.step, bar = Math.floor(st/8) % M.prog.length, ch = M.prog[bar], i8 = st % 8;
    if (i8 === 0) for (const n of ch.slice(0, 3)) auNote(c, t, M.root + n, e8*8.2, M.pad, 0.07*M.lvl/(M.pad === 'sawtooth' ? 2.2 : 1), AU.gain);
    if (i8 === 0 || i8 === 4) auNote(c, t, M.root - 12 + ch[0], e8*3.5, 'sine', 0.16, AU.gain);
    const ai = M.arp[i8]; if (ai >= 0) auNote(c, t, M.root + 12 + ch[ai % ch.length], e8*1.6, 'triangle', 0.06*M.lvl, AU.gain);
    if (M.drum === 2){ if (i8 % 4 === 0) auHit(c, t, 'kick', AU.gain); if (i8 % 2 === 1) auHit(c, t, 'hat', AU.gain); }
    else if (M.drum === 1 && i8 === 0) auHit(c, t, 'kick', AU.gain);
    // ofis ortam sesi: çalışan varken arada klavye tıkırtısı
    if (M.type && S && S.emps && S.emps.length && !paused && Math.random() < Math.min(0.5, 0.12 + S.emps.length*0.03)) auHit(c, t + Math.random()*e8, 'type', AU.gain);
    AU.step++; AU.next += e8;
  }
}
function auSetHTML(){
  const mv = Math.round((S.musicVol ?? 0.5)*100), sv = Math.round((S.sfxVol ?? 1)*100);
  return `<div class="card"><div class="row"><div class="grow"><b>Müzik</b><div class="sub">Ofiste sakin, lansmanda coşkulu, mahkemede gergin müzik. Ofiste klavye sesleri de duyulur.</div></div><button class="toggle ${S.music !== false ? 'on' : ''}" data-act="au-music"></button></div>
      <div class="volrow"><span>Müzik sesi</span><input type="range" min="0" max="100" value="${mv}" data-vol="musicVol" style="--v:${mv}%"><b>${mv}</b></div>
      <div class="volrow"><span>Efekt sesi</span><input type="range" min="0" max="100" value="${sv}" data-vol="sfxVol" style="--v:${sv}%"><b>${sv}</b></div></div>`;
}
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.vol; if (!k || !S) return;
  S[k] = (+e.target.value)/100; e.target.style.setProperty('--v', e.target.value + '%');
  const b = e.target.parentElement.querySelector('b'); if (b) b.textContent = e.target.value;
});
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.vol && S){ save(); if (e.target.dataset.vol === 'sfxVol') snd('ok'); } });
// tarayıcılar sesi ancak bir dokunuştan sonra açar
document.addEventListener('pointerdown', () => { if (S && S.music !== false) auStart(); }, {passive:true});

if (typeof ACTIONS !== 'undefined') Object.assign(ACTIONS, {
  'su-dif': el => { if (setup){ setup.dif = el.dataset.v; setupRender(); } },
  dif: el => { if (DIF[el.dataset.v]){ S.dif = el.dataset.v; toast(`Zorluk: ${DIF[S.dif].ad}`); save(); } },
  slot: el => slotAct(el),
  'au-music': () => { S.music = S.music === false; if (S.music) auStart(); save(); },
});

/* ---------------- DURAKLATMA EKRANI ---------------- */
// Esc ya da P tuşu, üst çubuktaki düğme ya da PC menüsünden açılır. Açıkken zaman durur.
let pzOpen = false, pzWas = false, pzView = 'ana';
const PZ_VER = 'v107';
const PZ_IC = {
  devam:'<path d="M8 5v14l11-7z" fill="currentColor"/>',
  kaydet:'<path d="M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  yuva:'<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  ayar:'<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  basarim:'<circle cx="12" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8 3h3l1 5M16 3h-3l-1 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  yardim:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7M12 17h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  cikis:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 8l-4 4 4 4M5 12h11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  ses:'<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const pzI = k => `<svg viewBox="0 0 24 24" width="20" height="20">${PZ_IC[k]}</svg>`;
function pzHTML(){
  const elec = location.protocol === 'app:';
  const B = (k, ic, t, cls) => `<button class="pzb ${cls || ''}" data-act="pz" data-k="${k}">${pzI(ic)}<span>${t}</span></button>`;
  const body = pzView === 'yuva' ? `${slotHTML()}<button class="pzb ghost" data-act="pz" data-k="geri"><span>Geri</span></button>`
    : `${B('devam', 'devam', 'Devam et', 'main')}
       <div class="pz2">${B('kaydet', 'kaydet', 'Kaydet')}${B('yuva', 'yuva', 'Kayıt yuvaları')}</div>
       ${B('ayarlar', 'ayar', 'Ayarlar')}
       <div class="pz2">${B('basarim', 'basarim', 'Başarımlar')}${B('ses', 'ses', S.music === false ? 'Müziği aç' : 'Müziği kapat')}</div>
       ${B('yardim', 'yardim', 'Oyun rehberi')}
       ${elec ? B('cikis', 'cikis', 'Kaydet ve çık', 'red') : ''}`;
  return `<div class="pzbg"></div>
    <div class="pzside"><b>Duraklatıldı</b><small>${esc(S.name)} · ${S.day}. gün · ${DIF[S.dif] ? DIF[S.dif].ad : 'Normal'}</small><em>Devam etmek için Esc</em></div>
    <div class="pzcard"><button class="pzx" data-act="pz" data-k="devam" aria-label="Kapat">✕</button>
      <div class="pzlogo">BYTETOWN</div>${body}<div class="pzver">${PZ_VER}</div></div>`;
}
function pauseOpen(on){
  if (!S) return;
  on = on == null ? !pzOpen : !!on;
  if (on === pzOpen){ if (on) pzRender(); return; }
  pzOpen = on;
  let el = document.getElementById('pause');
  if (on){
    if (typeof pcMenu === 'function') pcMenu(false);
    pzWas = paused; paused = true; pzView = 'ana'; window.pzShowing = true;
    if (!el){ el = document.createElement('div'); el.id = 'pause'; $('app').appendChild(el); }
    pzRender(); requestAnimationFrame(() => el.classList.add('in')); snd('pop');
  } else if (el){
    paused = pzWas; window.pzShowing = false; el.classList.remove('in'); setTimeout(() => { if (!pzOpen) el.remove(); }, 220);
  }
}
function pzRender(){ const el = document.getElementById('pause'); if (el) el.innerHTML = pzHTML(); }
function pzAct(el){
  const k = el.dataset.k;
  if (k === 'devam'){ pauseOpen(false); return; }
  if (k === 'kaydet'){ save(); toast('Oyun kaydedildi.'); snd('ok'); return; }
  if (k === 'yuva'){ pzView = 'yuva'; pzRender(); return; }
  if (k === 'geri'){ pzView = 'ana'; pzRender(); return; }
  if (k === 'ses'){ S.music = S.music === false; if (S.music) auStart(); save(); pzRender(); return; }
  if (k === 'cikis'){ save(); if (window.bytetown && window.bytetown.quit) window.bytetown.quit(); else window.close(); return; }
  pauseOpen(false);
  if (k === 'ayarlar') openPage('ayarlar');
  else if (k === 'basarim') openPage('basarim');
  else if (k === 'yardim' && typeof tutorStart === 'function') tutorStart();
}
document.addEventListener('keydown', e => {
  if (!S || e.ctrlKey || e.altKey || e.metaKey) return;
  const k = e.key.toLowerCase(), typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '');
  if (k === 'escape'){
    e.preventDefault();
    if (typing && e.target.blur) e.target.blur();
    if (pzOpen){ if (pzView !== 'ana'){ pzView = 'ana'; pzRender(); } else pauseOpen(false); return; }
    if (typeof pcOpen !== 'undefined' && pcOpen){ pcMenu(false); return; }
    if (page){ closePage(); return; }                       // önce açık sayfa kapanır, sonraki Esc duraklatır
    if (!$('modal').classList.contains('hidden') || document.getElementById('tutor') || window.cyShowing) return;
    pauseOpen(true);
  } else if (typing) return;
  else if (k === 'p' && !document.getElementById('tutor') && !window.cyShowing){ pauseOpen(); e.preventDefault(); }
});
if (typeof ACTIONS !== 'undefined') Object.assign(ACTIONS, { pz: el => pzAct(el), pause: () => pauseOpen(true) });