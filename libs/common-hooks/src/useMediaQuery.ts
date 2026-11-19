import { useCallback, useMemo, useSyncExternalStore } from 'react'

function getServerSnapshot(): boolean {
  return false
}

export const useMediaQuery = (query: string): boolean => {
  const media = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    return window.matchMedia(query)
  }, [query])

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      media?.addEventListener('change', onStoreChange)
      return () => media?.removeEventListener('change', onStoreChange)
    },
    [media],
  )
  const getSnapshot = useCallback(() => media?.matches ?? false, [media])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
