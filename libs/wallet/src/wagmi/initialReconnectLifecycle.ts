import { HAS_PERSISTED_WAGMI_SESSION } from './config'
import { onReconnectSettled } from './providerIsolation'

type Lifecycle = 'pending' | 'settled'

let lifecycle: Lifecycle = HAS_PERSISTED_WAGMI_SESSION ? 'pending' : 'settled'
const listeners = new Set<() => void>()

export function markInitialReconnectSettled(): void {
  // Always notify providerIsolation so it can unblock EIP-6963 dispatches — this must
  // run even when lifecycle is already 'settled' (no persisted session case).
  onReconnectSettled()
  if (lifecycle === 'settled') return
  lifecycle = 'settled'
  for (const listener of listeners) listener()
}

export function subscribeInitialReconnect(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function getInitialReconnectLifecycle(): Lifecycle {
  return lifecycle
}
