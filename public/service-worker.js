// Kill switch for the cache-first service worker registered by the previous
// version of this site. Browsers that still have it installed fetch this file
// on their next visit; it clears the old caches, unregisters itself and
// reloads open tabs so visitors get the current site. Safe to delete once old
// visitors have cycled through (a few months).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
