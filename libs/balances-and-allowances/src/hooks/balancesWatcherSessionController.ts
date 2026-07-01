import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import {
  type BalancesMap,
  type BalancesSubscription,
  createBalancesWatcherSession,
  subscribeToBalancesEvents,
} from '../balancesWatcher'
import { BalancesState } from '../state/balancesAtom'
import {
  BalancesWatcherHealth,
  DEFAULT_WATCHER_HEALTH_STATE,
  WatcherHealthState,
} from '../state/balancesWatcherHealthAtom'

/**
 * Time the SSE channel gets to deliver the first snapshot after the POST
 * resolves. If it elapses we treat the session as broken and switch to the
 * multicall fallback while a periodic retry tries to recover.
 */
export const FIRST_SNAPSHOT_TIMEOUT_MS = ms`20s`

/**
 * Interval between recovery attempts while the session is in the `Fallback`
 * state. Each tick re-runs POST + SSE; a successful first snapshot returns the
 * session to `Healthy` and stops the timer.
 */
export const FALLBACK_RETRY_INTERVAL_MS = ms`30s`

export interface SessionControllerDeps {
  account: string
  chainId: SupportedChainId
  tokensListsUrls: string[]
  customTokens: string[]
  setBalances: (update: (state: BalancesState) => BalancesState) => void
  setHealth: (update: (state: WatcherHealthState) => WatcherHealthState) => void
}

export interface SessionController {
  start(): void
  cleanup(): void
}

/**
 * Stateful orchestration of one watcher session lifecycle. Owns the POST →
 * SSE flow, the first-snapshot timeout, and the recovery retry interval.
 * Once a failure has occurred, `isRecovering` is set sticky to `true` so the
 * parent keeps the multicall fallback mounted across retry transitions; it
 * only clears on the first successful snapshot.
 */
export function createSessionController(deps: SessionControllerDeps): SessionController {
  const { account, chainId, tokensListsUrls, customTokens, setBalances, setHealth } = deps

  let cancelled = false
  let subscription: BalancesSubscription | undefined
  let isFirstEvent = true
  let firstSnapshotTimer: ReturnType<typeof setTimeout> | undefined
  let retryTimer: ReturnType<typeof setInterval> | undefined

  const setStatus = (status: BalancesWatcherHealth): void => setHealth((prev) => ({ ...prev, status }))

  const clearFirstSnapshotTimer = (): void => {
    if (firstSnapshotTimer) {
      clearTimeout(firstSnapshotTimer)
      firstSnapshotTimer = undefined
    }
  }

  const clearRetryTimer = (): void => {
    if (retryTimer) {
      clearInterval(retryTimer)
      retryTimer = undefined
    }
  }

  const closeSubscription = (): void => {
    subscription?.close()
    subscription = undefined
    clearFirstSnapshotTimer()
  }

  const enterFallback = (): void => {
    closeSubscription()
    setHealth(() => ({ status: BalancesWatcherHealth.Fallback, isRecovering: true }))
    // Close the first-load gate; existing `values` are preserved so the
    // multicall stack the parent mounts can take over without a flicker.
    setBalances((state) => applyEmptyLoad(state, chainId))
    if (!retryTimer) {
      retryTimer = setInterval(attempt, FALLBACK_RETRY_INTERVAL_MS)
    }
  }

  const openStream = (): void => {
    firstSnapshotTimer = setTimeout(() => {
      if (!cancelled) enterFallback()
    }, FIRST_SNAPSHOT_TIMEOUT_MS)

    subscription = subscribeToBalancesEvents({
      chainId,
      owner: account,
      onBalances: (balances) => {
        if (cancelled) return
        clearFirstSnapshotTimer()
        // First successful snapshot clears the sticky recovery flag and
        // tells the parent to unmount the multicall fallback stack.
        setHealth(() => ({ status: BalancesWatcherHealth.Healthy, isRecovering: false }))
        setBalances((state) => writeBalancesUpdate(state, balances, chainId, isFirstEvent))
        isFirstEvent = false
      },
      onError: (_error, terminal) => {
        if (cancelled || !terminal) return
        enterFallback()
      },
    })
  }

  const attempt = (): void => {
    if (cancelled) return
    // While an attempt is in flight, suspend the retry interval — we only
    // re-arm it from `enterFallback` if this attempt also fails.
    clearRetryTimer()
    isFirstEvent = true
    setStatus(BalancesWatcherHealth.Connecting)
    setBalances((state) => ({ ...state, isLoading: true, chainId, error: null }))

    createBalancesWatcherSession({ chainId, owner: account, body: { tokensListsUrls, customTokens } })
      .then(() => {
        if (cancelled) return
        setStatus(BalancesWatcherHealth.Connected)
        openStream()
      })
      .catch(() => {
        if (!cancelled) enterFallback()
      })
  }

  return {
    start: attempt,
    cleanup: () => {
      cancelled = true
      closeSubscription()
      clearRetryTimer()
      setHealth(() => DEFAULT_WATCHER_HEALTH_STATE)
    },
  }
}

export function applyEmptyLoad(state: BalancesState, chainId: SupportedChainId): BalancesState {
  return {
    ...state,
    chainId,
    error: null,
    isLoading: false,
    hasFirstLoad: true,
  }
}

function writeBalancesUpdate(
  state: BalancesState,
  payload: BalancesMap,
  chainId: SupportedChainId,
  isFirstEvent: boolean,
): BalancesState {
  const merged: BalancesState['values'] = { ...state.values }
  for (const rawAddress of Object.keys(payload)) {
    const normalizedAddress = getAddressKey(rawAddress)
    merged[normalizedAddress] = BigInt(payload[rawAddress])
  }

  return {
    ...state,
    chainId,
    values: merged,
    ...(isFirstEvent
      ? {
          fromCache: false,
          hasFirstLoad: true,
          error: null,
          isLoading: false,
        }
      : {}),
  }
}
