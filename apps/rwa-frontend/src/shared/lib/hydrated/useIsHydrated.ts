import { useSyncExternalStore } from 'react'

/** `false` on the server and while hydrating, so output that depends on the current time can't mismatch the HTML */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

function subscribe(): () => void {
  return () => undefined
}
