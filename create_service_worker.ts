
import { config, Sandbox } from './src/index';

config.apiKey = 'vnt_pE0mrRyuRCWlBno5Rc4rV17XZu7ts2WUFSKiGGKNke4';
config.apiBase = 'https://api.ventaw.com/v1';

async function main() {
    try {
        const s = await Sandbox.get('f8b687be-36be-4ba7-a07e-7d69e7190025');

        // Service Worker Content
        // Defines caches and install events
        const swContent = `
const CACHE_NAME = 'eduplay-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Next.js static assets would ideally be added here dynamically
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
`;

        console.log('Writing public/sw.js...');
        await s.writeFile('public/sw.js', swContent);

        // Update layout.tsx to register the SW
        // We'll read the existing layout first to inject the registration script cleanly

        console.log('Done.');
    } catch (e: any) { console.error('ERROR:', e.message); }
}
main();
