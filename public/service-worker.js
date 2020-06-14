// Static files to store
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/dist/app.bundle.js',
  '/dist/manifest.json',
  '/assets/css/styles.css'
]

const PRECACHE = 'precache-v1'
const RUNTIME = 'runtime'

// Add all of the static files initially
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  )
})

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME]
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        )
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete)
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  // non GET requests are not cached and requests to other origins are not cached
  // This is because post requests can not be added to the cache
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request))
    return
  }
  // Update the cache when the user comes back online with the offline data
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(RUNTIME).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone())
            return response
          })
          .catch(() => caches.match(event.request))
      })
    )
    return
  }

  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME).then(cache => {
        return fetch(event.request).then(response => {
          return cache.put(event.request, response.clone()).then(() => {
            return response
          })
        })
      })
    })
  )
})
