import { useSurplusInvalidationListener } from './hooks'

/**
 * Global updater that listens for order fulfillment events
 * and updates the surplus invalidation trigger atom.
 * Must be mounted at root level to ensure events are always captured,
 * even when the surplus UI (AccountDetails modal) is not visible.
 */
export function SurplusInvalidationListenerUpdater(): null {
  useSurplusInvalidationListener()
  return null
}
