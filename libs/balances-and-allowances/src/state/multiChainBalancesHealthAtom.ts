import { atom } from 'jotai'

export interface MultiChainBalancesHealthState {
  status: MultiChainBalancesHealth
  isRecovering: boolean
}

/**
 * Lifecycle of the balances-aggregator session, mirroring `BalancesWatcherHealth`
 * but for the single, all-chains aggregator connection.
 *
 * - `Idle`: no session is being driven (e.g. no account, mode disabled, tab idle)
 * - `Connecting`: `POST /sessions/{owner}` is in flight
 * - `Connected`: POST resolved, merged SSE subscription opened, waiting for the
 *   first snapshot
 * - `Healthy`: at least one snapshot has been received and applied
 * - `Fallback`: the session failed (POST rejection, terminal SSE error, or the
 *   first-snapshot timeout). A periodic retry is attempting to recover; while
 *   in this state, multichain mode is treated as unavailable.
 */
export enum MultiChainBalancesHealth {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Healthy = 'healthy',
  Fallback = 'fallback',
}

export const DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE: MultiChainBalancesHealthState = {
  status: MultiChainBalancesHealth.Idle,
  isRecovering: false,
}

export const multiChainBalancesHealthAtom = atom<MultiChainBalancesHealthState>(
  DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE,
)
