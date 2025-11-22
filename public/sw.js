const CACHE_NAME = "carsub-v1"
const urlsToCache = [
  "/",
  "/vehicles",
  "/profile",
  "/subscriptions",
  "/manifest.json",
  "/icons/icon-192x192.jpg",
  "/icons/icon-512x512.jpg",
]

// インストール時のキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// フェッチ時のキャッシュ戦略
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあれば返す、なければネットワークから取得
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// 古いキャッシュの削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
