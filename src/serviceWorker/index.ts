import 'workbox-precaching' // defines __WB_MANIFEST

import { clientsClaim, setCacheNameDetails } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute } from 'workbox-precaching'
import { PrecacheEntry } from 'workbox-precaching/_types'
import { registerRoute, Route } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import pkg from '@src/../package.json'

import { DocumentRoute } from './document'
import { toURL } from './utils'

const WEB_VERSION = pkg.version

declare const self: ServiceWorkerGlobalScope

// Set Cache name
//  See https://dev.to/atonchev/flawless-and-silent-upgrade-of-the-service-worker-2o95
setCacheNameDetails({
  prefix: 'CowSwap',
  suffix: WEB_VERSION,
})

clientsClaim()
self.skipWaiting()

// Registers the document route for the precached document.
// This must be done before setting up workbox-precaching, so that it takes precedence.
registerRoute(new DocumentRoute())

// Splits entries into assets, which are loaded on-demand; and entries, which are precached.
// Effectively, this precaches the document, and caches all other assets on-demand.
const { assets, entries } = self.__WB_MANIFEST.reduce<{ assets: string[]; entries: PrecacheEntry[] }>(
  ({ assets, entries }, entry) => {
    if (typeof entry === 'string') {
      return { entries, assets: [...assets, entry] }
    } else if (entry.revision) {
      return { entries: [...entries, entry], assets }
    } else {
      return { entries, assets: [...assets, toURL(entry)] }
    }
  },
  { assets: [], entries: [] }
)

// Registers the assets' routes for on-demand caching.
registerRoute(
  new Route(
    ({ url }) => assets.includes('.' + url.pathname),
    new CacheFirst({
      cacheName: 'assets',
      plugins: [new ExpirationPlugin({ maxEntries: 16 })],
    })
  )
)

// Precaches entries and registers a default route to serve them.
precacheAndRoute(entries)
