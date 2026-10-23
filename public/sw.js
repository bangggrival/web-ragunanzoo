// Service Worker for PWA Support
// Taman Margasatwa Ragunan

const CACHE_NAME = 'ragunan-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Background sync (optional - for offline support)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered', event.tag);
});
