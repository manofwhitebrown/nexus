const VERSION='nexus-v3-1';
const SHELL=['./','index.html','patch.js','theme.css','manifest.webmanifest','privacy.html','terms.html','404.html','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

/* Same-origin files: serve the cached copy instantly, refresh it in the background.
   Everything else (fonts, the Anthropic API) goes straight to the network. */
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    return hit||(await net)||(r.mode==='navigate'?c.match('index.html'):Response.error());
  }));
});
