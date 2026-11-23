// Service worker: salva l'app sul telefono per usarla senza rete.
// Per forzare un aggiornamento dopo una modifica, cambia il numero di VERSION.
const VERSION='ore-ufficio-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Risponde subito dalla copia salvata e intanto aggiorna la copia in rete (la novità arriva alla prossima apertura).
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{ if(res&&res.ok) c.put(r,res.clone()); return res; }).catch(()=>null);
    return hit||(await net)||c.match('./index.html');
  }));
});
