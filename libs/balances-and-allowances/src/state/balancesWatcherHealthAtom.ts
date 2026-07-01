import { atom } from 'jotai'

/**
 * Lifecycle of the balances-watcher session.
 *
 * - `Idle`: no session is being driven (e.g. unmounted, non-EVM chain, or
 *   empty token set with nothing to track)
 * - `Connecting`: POST `/sessions/{owner}` is in flight
 * - `Connected`: POST resolved, SSE subscription opened, waiting for the
 *   first snapshot
 * - `Healthy`: at least one snapshot has been received and applied
 * - `Fallback`: the watcher failed (POST rejection, terminal SSE error, or
 *   the first-snapshot timeout). A periodic retry is attempting to recover.
 */
export enum BalancesWatcherHealth {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Healthy = 'healthy',
  Fallback = 'fallback',
}

export interface WatcherHealthState {
  status: BalancesWatcherHealth
  isRecovering: boolean
}

export const DEFAULT_WATCHER_HEALTH_STATE: WatcherHealthState = {
  status: BalancesWatcherHealth.Idle,
  isRecovering: false,
}

export const balancesWatcherHealthAtom = atom<WatcherHealthState>(DEFAULT_WATCHER_HEALTH_STATE)
