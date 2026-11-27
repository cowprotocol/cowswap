import { useSyncExternalStore } from 'react'

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)

  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
