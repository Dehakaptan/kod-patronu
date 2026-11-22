// Bytetown – internetsiz çalışma desteği
const CACHE = 'kod-patronu-v107';
const FILES = ['./', './index.html', './ofis.js', './brif.js', './hikaye.js', './bilgisayar.js', './ekstra.js', './sehir.js', './pc.js', './dava.js', './basarim.js', './musteri.js', './ayar.js', './kariyer.js', './olay.js', './sosyal.js', './buyume.js', './ikon.js', './ofis3d.js', './lib/three.module.js', './lib/three.core.js', './stil.css', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable.png', './sehir.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce internetten yeni sürümü dene, olmazsa kayıtlı kopyayı aç
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache:'no-cache'}).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch:true}).then(r => r || caches.match('./index.html')))
  );
});
