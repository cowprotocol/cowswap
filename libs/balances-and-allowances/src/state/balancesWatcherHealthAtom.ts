import { atom } from 'jotai'

/**
 * Lifecycle of the balances-watcher session, used by consumers to decide
 * whether to mount the multicall fallback stack.
 *
 * - `Idle`: no session is being driven (e.g. unmounted, non-EVM chain, or
 *   empty token set with nothing to track)
 * - `Connecting`: POST `/sessions/{owner}` is in flight
 * - `Connected`: POST resolved, SSE subscription opened, waiting for the
 *   first snapshot
 * - `Healthy`: at least one snapshot has been received and applied
 * - `Fallback`: the watcher failed (POST rejection, terminal SSE error, or
 *   the first-snapshot timeout). The parent should mount the multicall
 *   stack alongside while a periodic retry attempts to recover the session.
 */
export enum BalancesWatcherHealth {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Healthy = 'healthy',
  Fallback = 'fallback',
}

export const balancesWatcherHealthAtom = atom<BalancesWatcherHealth>(BalancesWatcherHealth.Idle)
