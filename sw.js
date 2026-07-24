const CACHE = 'alpenwand-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // 天气/太阳数据不缓存,始终走网络;静态资源走缓存优先
  if(e.request.url.includes('open-meteo.com') || e.request.url.includes('thecrag.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>cached || fetch(e.request))
  );
});
