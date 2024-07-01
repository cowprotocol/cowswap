import { useEffect } from 'react'

/**
 * Cleans bad URL path names
 * Since we are using a HashRouter, the only valid value after the host and before the hash should be a `/`
 * This updater replaces anything that's NOT a single `/` with it.
 */
export function CleanUrlPathUpdater(): null {
  useEffect(() => {
    if (window.location.pathname !== '/') {
      console.log(
        `debug:window location on root!`,
        window.location.host,
        window.location.pathname,
        window.location.hash
      )
      window.location.pathname = '/'
    }
  }, [window.location.pathname])

  return null
}
