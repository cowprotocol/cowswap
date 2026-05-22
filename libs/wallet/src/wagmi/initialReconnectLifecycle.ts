import { HAS_PERSISTED_WAGMI_SESSION } from './config'

type Lifecycle = 'pending' | 'settled'

let lifecycle: Lifecycle = HAS_PERSISTED_WAGMI_SESSION ? 'pending' : 'settled'
const listeners = new Set<() => void>()

export function markInitialReconnectSettled(): void {
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
