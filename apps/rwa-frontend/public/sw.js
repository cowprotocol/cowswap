/* eslint-env serviceworker */

// Registered as `/sw.js?v=<build version>`, so every deploy installs a worker with fresh caches
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const PAGES_CACHE = `rwa-pages-${VERSION}`
const STATIC_CACHE = `rwa-static-${VERSION}`
const CACHES = [PAGES_CACHE, STATIC_CACHE]

const MAX_ENTRIES = {
  [PAGES_CACHE]: 50,
  [STATIC_CACHE]: 300,
}

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

  if (response.ok) await putAndTrim(cache, cacheName, request, response.clone())

  return response
}

async function cachePageHtml(pathname) {
  const cache = await caches.open(PAGES_CACHE)

  if (await cache.match(pathname)) return

  try {
    const response = await fetch(pathname)

    if (response.ok) await putAndTrim(cache, PAGES_CACHE, pathname, response)
  } catch {
    // Offline or failed: the page just stays uncached
  }
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)

    if (response.ok) await putAndTrim(cache, cacheName, request, response.clone())

    return response
  } catch (error) {
    const cached = (await cache.match(request)) || (fallbackUrl && (await cache.match(fallbackUrl)))

    if (cached) return cached

    throw error
  }
}

async function putAndTrim(cache, cacheName, request, response) {
  await cache.put(request, response)

  const keys = await cache.keys()
  // Cache.keys() preserves insertion order, so the head holds the oldest entries
  const excess = keys.length - MAX_ENTRIES[cacheName]

  if (excess > 0) await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API data is persisted in IndexedDB by the app
  if (url.pathname.startsWith('/api/')) return

  // RSC payloads fall back to a full navigation when offline, so the page HTML is cached instead
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') {
    event.waitUntil(cachePageHtml(url.pathname))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGES_CACHE, '/'))
    return
  }

  // Next.js hashes these file names, so they never change under the same URL
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  event.respondWith(networkFirst(request, STATIC_CACHE))
})
