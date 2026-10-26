/* Cache only public course assets. Account APIs and recordings never enter this cache. */
const CACHE='englishlab-public-foundation-v2-studio1';
const ASSETS=['/','/index.html','/style.css','/course.css','/curriculum.js','/foundation.js','/scenarios.js','/course-method.js','/study-engine.js','/review-coach.js','/audio.js','/recorder.js','/app.js','/foundation-ui.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('englishlab-public-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!ASSETS.includes(url.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    // All assets in a release come from one cache revision. Bump CACHE on release.
    const saved=await cache.match(url.pathname);return saved||fetch(event.request);
  }));
});
