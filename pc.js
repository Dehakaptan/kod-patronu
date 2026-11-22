'use strict';
/* =====================================================================
   Bytetown – bilgisayar (PC) düzeni
   Alttaki buton şeridi yerine tek bir MENÜ düğmesi. Menü sol alttan,
   ofise sağ tıklayınca da farenin olduğu yerden açılır. Kısayollar:
   M menü, N yeni proje, Esc menüyü kapatır.
   ===================================================================== */
const PC_ELECTRON = location.protocol === 'app:';
const PC_ITEMS = [['ofis','Ofisim'], ['ekip','Personel'], ['urunler','Ürünler'], ['banka','Banka'], ['tekno','Teknoloji'], ['gelis','Geliştir'], ['yatirim','Yatırım'], ['sirala','Sıralama']];
const PC_SVG = {
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/></svg>',
  proj:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  pc:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  city:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M3 21V10l5-3v14M8 21V4l7 4v13M15 21V11l6 2v8M2 21h20"/></svg>',
  full:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  set:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/></svg>',
  quit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 8l-4 4 4 4M5 12h11"/></svg>',
};
let pcOpen = false, pcAt = null;

// alt şerit yerine çizilen tek düğme; menünün içeriği de burada tazelenir
function pcDock(dots){
  const projAlert = S.projs.some(p => sprWait(p) || devDone(p) && !needsWork(p));
  const any = projAlert || Object.values(dots).some(Boolean);
  const full = S.projs.length >= slots();
  const dot = on => on ? '<span class="badge-dot">!</span>' : '';
  const tile = (v, t) => `<button class="pcm-t" data-act="page" data-v="${v}">${dot(dots[{ekip:'ekip', ofis:'ofis', tekno:'tekno', gelis:'gelis', yatirim:'yatirim'}[v]])}<span class="ci">${IC[v] || ''}</span><span>${t}</span></button>`;
  const m = pcMenuEl();
  setHTML(m, `<div class="pcm-h"><b>Menü</b><small>Ofise sağ tıklayarak da açabilirsin · M</small></div>
    <button class="pcm-new" data-act="newproj" ${full ? 'disabled' : ''}><span class="pi2">${IC.arti || '+'}</span>Yeni Proje<kbd>N</kbd></button>
    <div class="pcm-g">${PC_ITEMS.map(([v, t]) => tile(v, t)).join('')}
      <button class="pcm-t" data-act="side-toggle">${dot(projAlert)}<span class="ci">${PC_SVG.proj}</span><span>Projeler ${S.projs.length}/${slots()}</span></button>
      <button class="pcm-t" data-act="page" data-v="pc"><span class="ci">${PC_SVG.pc}</span><span>Bilgisayarım</span></button>
      <button class="pcm-t" data-act="page" data-v="sehir"><span class="ci">${PC_SVG.city}</span><span>Şehir</span></button>
      ${typeof baTileHTML === 'function' ? baTileHTML() : ''}
      ${typeof msTileHTML === 'function' ? msTileHTML() : ''}
      ${typeof smTileHTML === 'function' ? smTileHTML() : ''}
      ${typeof bgTilesHTML === 'function' ? bgTilesHTML() : ''}
      ${typeof dvTileHTML === 'function' ? dvTileHTML() : ''}
      <button class="pcm-t" data-act="inbox"><span class="ci">${typeof IC.zarf === 'string' ? IC.zarf : PC_SVG.pc}</span><span>Gelen kutusu</span></button></div>
    <div class="pcm-f"><button data-act="pause"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>Duraklat</button><button data-act="pcfull">${PC_SVG.full}${document.fullscreenElement ? 'Pencereye dön' : 'Tam ekran · F11'}</button><button data-act="page" data-v="ayarlar">${PC_SVG.set}Ayarlar</button>${PC_ELECTRON ? `<button class="q" data-act="pcquit">${PC_SVG.quit}Oyundan çık</button>` : ''}</div>`);
  return `<button class="pcmb${pcOpen ? ' on' : ''}" id="pcMenuBtn" data-act="pcmenu" title="Menü (M)">${dot(any)}<span class="ci">${PC_SVG.menu}</span><span class="l">MENÜ</span></button>`;
}
function pcMenuEl(){
  let m = document.getElementById('pcm');
  if (!m){ m = document.createElement('div'); m.id = 'pcm'; document.getElementById('app').appendChild(m); }
  return m;
}
function pcPlace(){
  const m = pcMenuEl(), app = document.getElementById('app');
  if (!pcAt){ m.style.left = ''; m.style.top = ''; m.style.bottom = ''; m.classList.remove('at'); return; }
  m.classList.add('at');
  const W = app.clientWidth, H = app.clientHeight, w = m.offsetWidth || 360, h = m.offsetHeight || 420;
  m.style.bottom = 'auto';
  m.style.left = Math.max(8, Math.min(W - w - 8, pcAt[0])) + 'px';
  m.style.top = Math.max(8, Math.min(H - h - 8, pcAt[1])) + 'px';
}
function pcMenu(on, at){
  if (!S) return;
  pcOpen = on == null ? !pcOpen : !!on; pcAt = pcOpen ? (at || null) : null;
  const m = pcMenuEl(); m.classList.toggle('open', pcOpen);
  const b = document.getElementById('pcMenuBtn'); if (b) b.classList.toggle('on', pcOpen);
  if (pcOpen) requestAnimationFrame(pcPlace);
}
function pcAppXY(e){            // farenin #app içindeki konumu (ölçekten bağımsız)
  const app = document.getElementById('app'), r = app.getBoundingClientRect();
  const s = r.width / (app.offsetWidth || r.width) || 1;   // görünen boyut / CSS boyutu = ölçek
  return [(e.clientX - r.left) / s, (e.clientY - r.top) / s];
}
if (window.PC){
  Object.assign(ACTIONS, {
    pcmenu: () => pcMenu(),
    pcfull: () => { pcMenu(false); if (window.bytetown && window.bytetown.fullscreen){ window.bytetown.fullscreen(); return; } if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => toast('Tam ekran açılamadı; F11 tuşunu deneyebilirsin.')); },
    pcquit: () => { pcMenu(false); try { save(); } catch (e) {} window.close(); },
  });
  // GDT tarzı: ofise sağ tıklayınca menü farenin yanında açılır
  document.addEventListener('contextmenu', e => {
    if (!S || paused || page || !document.getElementById('modal').classList.contains('hidden')) return;
    if (!e.target.closest('#scene')) return;
    pcMenu(true, pcAppXY(e));
  });
  // menü dışına tıklanınca ya da menüden bir şey seçilince kapanır
  document.addEventListener('pointerdown', e => {
    if (!pcOpen || e.button === 2) return;
    if (e.target.closest('#pcm') || e.target.closest('#pcMenuBtn')) return;
    pcMenu(false);
  });
  document.addEventListener('pointerup', e => {
    if (pcOpen && e.button !== 2 && e.target.closest('#pcm [data-act]')) setTimeout(() => pcMenu(false), 0);
  });
  document.addEventListener('keydown', e => {
    if (!S || e.ctrlKey || e.altKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    const k = e.key.toLowerCase();
    if (k === 'escape' && pcOpen){ pcMenu(false); e.preventDefault(); e.stopImmediatePropagation(); }
    else if (k === 'm' && !paused){ pcMenu(); e.preventDefault(); }
    else if (k === 'n' && !paused && !page && document.getElementById('modal').classList.contains('hidden')){ pcMenu(false); ACTIONS.newproj(); updateAll(true); e.preventDefault(); }
  });
  document.addEventListener('fullscreenchange', () => { if (S) updateAll(true); setTimeout(fit, 60); });
  if (S) updateAll(true);
}
