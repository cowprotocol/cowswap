// Disable workbox verbose logging
declare const self: ServiceWorkerGlobalScope & { __WB_DISABLE_DEV_LOGS?: boolean }
self.__WB_DISABLE_DEV_LOGS = true

import 'workbox-precaching' // defines __WB_MANIFEST

import { clientsClaim, setCacheNameDetails } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute } from 'workbox-precaching'
import { PrecacheEntry } from 'workbox-precaching/_types'
import { registerRoute, Route } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

import { DocumentRoute } from './document'
import { toURL } from './utils'

// eslint-disable-next-line @nx/enforce-module-boundaries
import pkg from '../../package.json'

const WEB_VERSION = pkg.version

// Set Cache name
//  See https://dev.to/atonchev/flawless-and-silent-upgrade-of-the-service-worker-2o95
setCacheNameDetails({
  prefix: 'CowSwap',
  suffix: WEB_VERSION,
})

clientsClaim()
self.skipWaiting()

const excludedAssets = ['emergency.js']

// Registers the document route for the precached document.
// This must be done before setting up workbox-precaching, so that it takes precedence.
registerRoute(new DocumentRoute())

// Splits entries into assets, which are loaded on-demand; and entries, which are precached.
// Effectively, this precaches the document, and caches all other assets on-demand.
const { assets, entries } = self.__WB_MANIFEST.reduce<{ assets: { [key: string]: boolean }; entries: PrecacheEntry[] }>(
  (acc, entry) => {
    const { assets, entries } = acc

    if (typeof entry === 'string') {
      assets[entry] = true
    } else if (entry.revision) {
      if (!excludedAssets.includes(entry.url)) {
        entries.push(entry)
      }
    } else {
      assets[toURL(entry)] = true
    }

    return acc
  },
  { assets: {}, entries: [] },
)

// Registers the assets' routes for on-demand caching.
registerRoute(
  new Route(
    ({ url }) => assets[url.pathname.slice(1)],
    new CacheFirst({
      cacheName: 'assets',
      plugins: [new ExpirationPlugin({ maxEntries: 16 })],
    }),
  ),
)

// Precaches entries and registers a default route to serve them.
precacheAndRoute(entries)
