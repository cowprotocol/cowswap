// Redirect from the outdated domain
if (window.location.host === 'cowswap.exchange') {
  window.location.href = 'https://swap.cow.fi'
}

if (window.location.host === 'barn.cowswap.exchange') {
  window.location.href = 'https://barn.cow.fi'
}

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
    console.log(name, version)
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

function unregisterAllWorkers() {
  return navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (const registration of registrations) {
      registration.unregister()
    }
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
