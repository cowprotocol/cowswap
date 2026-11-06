'use client'

import { useSyncExternalStore } from 'react'

/** Reads the theme applied to the page, `false` during the server render and hydration */
export function useIsDarkTheme(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme === 'dark',
    () => false,
  )
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  return () => observer.disconnect()
}
