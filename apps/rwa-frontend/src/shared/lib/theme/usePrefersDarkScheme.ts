import { useSyncExternalStore } from 'react'

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export function usePrefersDarkScheme(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DARK_SCHEME_QUERY).matches,
    () => false,
  )
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY)
  mediaQuery.addEventListener('change', callback)

  return () => mediaQuery.removeEventListener('change', callback)
}
