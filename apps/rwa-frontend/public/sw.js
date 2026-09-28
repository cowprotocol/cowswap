/* eslint-env serviceworker */

const CACHE_VERSION = 'v1'
const PAGES_CACHE = `rwa-pages-${CACHE_VERSION}`
const STATIC_CACHE = `rwa-static-${CACHE_VERSION}`
const API_CACHE = `rwa-api-${CACHE_VERSION}`
const CACHES = [PAGES_CACHE, STATIC_CACHE, API_CACHE]

const APP_SHELL = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) return cached

  const response = await fetch(request)

  if (response.ok) await cache.put(request, response.clone())

  return response
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)

    if (response.ok) await cache.put(request, response.clone())

    return response
  } catch (error) {
    const cached = (await cache.match(request)) || (fallbackUrl && (await cache.match(fallbackUrl)))

    if (cached) return cached

    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGES_CACHE, '/'))
    return
  }

  // Next.js hashes these file names, so they never change under the same URL
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  event.respondWith(networkFirst(request, STATIC_CACHE))
})
