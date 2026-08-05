const CACHE = 'alpenwand-v5';
const ASSETS = ['./index.html', './manifest.json', './fonts.css', './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png',
  './fonts/IBMPlexMono-400-latin-ext.woff2', './fonts/IBMPlexMono-400-latin.woff2', './fonts/IBMPlexMono-500-latin-ext.woff2', './fonts/IBMPlexMono-500-latin.woff2', './fonts/IBMPlexMono-600-latin-ext.woff2', './fonts/IBMPlexMono-600-latin.woff2', './fonts/Inter-400-latin-ext.woff2', './fonts/Inter-400-latin.woff2', './fonts/Inter-500-latin-ext.woff2', './fonts/Inter-500-latin.woff2', './fonts/Inter-600-latin-ext.woff2', './fonts/Inter-600-latin.woff2', './fonts/SpaceGrotesk-500-latin-ext.woff2', './fonts/SpaceGrotesk-500-latin.woff2', './fonts/SpaceGrotesk-600-latin-ext.woff2', './fonts/SpaceGrotesk-600-latin.woff2', './fonts/SpaceGrotesk-700-latin-ext.woff2', './fonts/SpaceGrotesk-700-latin.woff2'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(names=>Promise.all(names.filter(n=>n!==CACHE).map(n=>caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // 天气/太阳数据不缓存,始终走网络;静态资源走缓存优先
  if(e.request.url.includes('open-meteo.com') || e.request.url.includes('thecrag.com')){
    return;
  }
  // 页面本身(index.html)网络优先:之前是缓存优先,已安装的用户会一直看到旧版本,只有断网时才退回缓存
  if(e.request.mode==='navigate' || e.request.url.endsWith('index.html')){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy));
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>cached || fetch(e.request))
  );
});
