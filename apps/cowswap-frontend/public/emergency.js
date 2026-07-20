// Redirect from the outdated domain
if (window.location.host === 'cowswap.exchange') {
  window.location.href = 'https://swap.cow.fi'
}

if (window.location.host === 'barn.cowswap.exchange') {
  window.location.href = 'https://barn.cow.fi'
}

// swap.cow.finance → swap.cow.fi when top-level (not embedded). iframes stay on .finance
try {
  if (window.location.host === 'swap.cow.finance' && window.top === window.self) {
    const next = new URL(window.location.href)
    next.protocol = 'https:'
    next.hostname = 'swap.cow.fi'
    window.location.replace(next.href)
  }
} catch {
  if (window.location.host === 'swap.cow.finance') {
    window.location.replace('https://swap.cow.fi/')
  }
}

// We use the HashRouter, thus the pathname should ALWAYS be a '/'
if (window.location.pathname !== '/') {
  window.location.pathname = '/'
}

;(async function () {
  const WIPE_KEY = 'emergencyWipe:v1'
  const RETURNING_USER_KEY = 'tokens:lastUpdateTimeAtom:v6'
  const hasVisitedBefore = localStorage.getItem(RETURNING_USER_KEY) !== null

  if (localStorage.getItem(WIPE_KEY)) {
    console.log('[COW] Storage already clean')
    return
  }

  if (!hasVisitedBefore) {
    console.log('[COW] New user, skipping storage wipe')
    localStorage.setItem(WIPE_KEY, '1')
    return
  }
  console.log('[COW] Performing emergency wipe')

  // 1. localStorage (re-set wipe flag after)
  localStorage.clear()
  localStorage.setItem(WIPE_KEY, '1')

  // 2. sessionStorage
  try {
    sessionStorage.clear()
  } catch {}

  // 3. Cookies — expire each cookie across all known paths and domains
  try {
    const cookiePaths = [
      '/',
      '/swap',
      '/limit',
      '/limit-orders',
      '/advanced',
      '/advanced-orders',
      '/yield',
      '/account',
      '/account/tokens',
      '/account/governance',
      '/account/affiliate',
      '/account/my-rewards',
      '/account-proxy',
      '/send',
      '/faq',
      '/about',
      '/play',
      '/widget',
    ]
    const hostname = window.location.hostname
    const hostParts = hostname.split('.')
    // e.g. swap.cow.fi → [swap.cow.fi, .cow.fi, .swap.cow.fi]
    const cookieDomains = [
      hostname,
      hostParts.length > 2 ? '.' + hostParts.slice(-2).join('.') : '',
      '.' + hostname,
    ].filter(Boolean)
    const expired = ';expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie.split(';').forEach(function (cookie) {
      const name = cookie.split('=')[0].trim()
      if (!name) return
      cookiePaths.forEach(function (path) {
        // Without domain — catches cookies set without explicit domain
        document.cookie = name + '=' + expired + ';path=' + path
        // With each domain variant
        cookieDomains.forEach(function (domain) {
          document.cookie = name + '=' + expired + ';path=' + path + ';domain=' + domain
        })
      })
    })
  } catch {}

  // 4. IndexedDB (async — best-effort)
  try {
    if (indexedDB.databases) {
      indexedDB
        .databases()
        .then(function (dbs) {
          dbs.forEach(function (db) {
            console.log('[Emergency] Deleting IndexedDB:', db.name)
            indexedDB.deleteDatabase(db.name)
          })
        })
        .catch(function () {})
    }
  } catch {}

  // 5. Cache Storage (async — best-effort)
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(
        keys.map(function (k) {
          return caches.delete(k)
        }),
      )
    }
  } catch {}

  // 6. Service Workers (async — best-effort)
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(function (r) {
          return r.unregister()
        }),
      )
    }
  } catch {}

  window.location.reload()
})()

/**
 * Removes deprecated token lists for a particular localStorage key: `allTokenListsInfoAtom:v5`
 *
 * A change introduced new token lists and removed old ones.
 * This code removes the old token lists from the local storage to avoid duplication without resetting user added token lists.
 */
;(function () {
  const key = 'allTokenListsInfoAtom:v5'
  const storageValue = localStorage.getItem(key)

  // Exit early if the storage value is not set
  if (!storageValue) return

  const tokenLists = JSON.parse(storageValue)

  const listsToSkip = new RegExp(
    'CoingeckoTokensList\\.json$|' +
      'UniswapTokensList\\.json$|' +
      'CoinGecko\\.json$|' +
      'compound\\.tokenlist\\.json$|' +
      'set\\.tokenlist\\.json$|' +
      'tokensoft\\.eth$|' +
      'opyn-squeeth|' +
      'tryroll\\.com|' +
      'snx\\.eth$|' +
      'aave\\.eth$|' +
      'cmc\\.eth$',
  )

  const updatedTokenLists = Object.keys(tokenLists).reduce((acc, chainId) => {
    acc[chainId] = Object.keys(tokenLists[chainId]).reduce((_acc, listPath) => {
      if (!listsToSkip.test(listPath)) {
        _acc[listPath] = tokenLists[chainId][listPath]
      } else {
        console.log('[Service worker] Skip token list', listPath)
      }
      return _acc
    }, {})

    return acc
  }, {})

  localStorage.setItem(key, JSON.stringify(updatedTokenLists))
})()

/**
 * Remove old versions of the local storage atom stores
 * We rely on the fact that store names are in the format {name}Atom:v{version}
 * Since outdated versions of the stores are not used anymore, we should remove them to not exceed the storage limit
 */
;(function () {
  const storeRegex = /^(.+):v(\d{1,3})$/

  // Find the latest version of each store
  const storePerVersion = Object.keys(localStorage)
    // Take only the atom stores with versions
    .reduce((acc, key) => {
      const match = key.match(storeRegex)

      if (!match) return acc

      const [, name, version] = match
      const versionNum = +version

      // Find the latest version of the store
      if (!acc[name] || acc[name] < versionNum) {
        acc[name] = versionNum
      }

      return acc
    }, {})

  // Remove all the old versions
  Object.keys(storePerVersion).forEach((name) => {
    const version = storePerVersion[name]

    for (let i = 0; i < version; i++) {
      localStorage.removeItem(`${name}:v${i}`)
    }
  })
})()

/**
 * In case of problems with the service worker cache we can urgently reset the cache.
 * Just set resetCacheInCaseOfEmergency to true and release a new version
 */
const emergencyConfigUrl = 'https://raw.githubusercontent.com/cowprotocol/cowswap/configuration/config/emergency.json'

async function deleteAllCaches() {
  return caches.keys().then((cacheNames) => {
    ;(cacheNames || []).map((cacheName) => {
      console.log('[Service worker] Delete cache', cacheName)
      // Delete old caches
      // https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker#removing_outdated_caches
      return caches.delete(cacheName)
    })
  })
}

function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}

function unregisterAllWorkers() {
  return navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

;(function () {
  fetch(emergencyConfigUrl + '?cacheReset=' + Date.now())
    .then((res) => res.json())
    .then(({ resetCacheInCaseOfEmergency }) => {
      if (resetCacheInCaseOfEmergency && 'serviceWorker' in navigator) {
        console.log('[Service worker] Unregister worker...')
        unregister()

        console.log('[Service worker] Deleting all caches...')
        deleteAllCaches()
          .then(() => console.log('[worker] All caches have been deleted'))
          .catch(console.error)

        console.log('[Service worker] Unregistering all workers...')
        unregisterAllWorkers()
          .then(() => console.log('[Service worker] All workers have been unregistered'))
          .catch(console.error)
      }
    })
})()
