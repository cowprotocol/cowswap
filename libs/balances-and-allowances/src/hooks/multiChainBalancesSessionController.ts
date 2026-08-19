import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import {
  type AggregatedBalancesSubscription,
  type NetworkTokensRequest,
  createAggregatorSessions,
  subscribeToAggregatedBalances,
} from '../balancesAggregator'
import { type BalancesMap, type ReportWatcherErrorParams } from '../balancesWatcher'
import { MultiChainBalances } from '../state/multiChainBalancesAtom'
import {
  DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE,
  MultiChainBalancesHealth,
  MultiChainBalancesHealthState,
} from '../state/multiChainBalancesHealthAtom'

const SENTRY_SCOPE = 'BalancesAggregator'

/**
 * Time the merged SSE channel gets to deliver at least one chain's snapshot
 * after the POST resolves. If it elapses, the session is treated as broken.
 */
export const MULTI_CHAIN_FIRST_SNAPSHOT_TIMEOUT_MS = ms`20s`

/**
 * Interval between recovery attempts while the session is in `Fallback`.
 */
export const MULTI_CHAIN_FALLBACK_RETRY_INTERVAL_MS = ms`30s`

export interface MultiChainBalancesSessionController {
  start(): void
  cleanup(): void
}

export interface MultiChainBalancesSessionControllerDeps {
  account: string
  networks: Record<string, NetworkTokensRequest>
  setBalances: (update: (state: MultiChainBalances) => MultiChainBalances) => void
  setHealth: (update: (state: MultiChainBalancesHealthState) => MultiChainBalancesHealthState) => void
  reportError: (params: ReportWatcherErrorParams) => void
}

/**
 * Stateful orchestration of the single, all-chains aggregator session.
 * Structurally mirrors `balancesWatcherSessionController`'s POST → SSE →
 * first-snapshot-timeout → retry-interval state machine, generalized to one
 * connection covering every EVM chain instead of one chain at a time.
 */
// eslint-disable-next-line max-lines-per-function
export function createMultiChainBalancesSessionController(
  deps: MultiChainBalancesSessionControllerDeps,
): MultiChainBalancesSessionController {
  const { account, networks, setBalances, setHealth, reportError } = deps

  let cancelled = false
  let subscription: AggregatedBalancesSubscription | undefined
  let firstSnapshotTimer: ReturnType<typeof setTimeout> | undefined
  let retryTimer: ReturnType<typeof setInterval> | undefined

  const setStatus = (status: MultiChainBalancesHealth): void => setHealth((prev) => ({ ...prev, status }))

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
    setHealth(() => ({ status: MultiChainBalancesHealth.Fallback, isRecovering: true }))
    if (!retryTimer) {
      retryTimer = setInterval(attempt, MULTI_CHAIN_FALLBACK_RETRY_INTERVAL_MS)
    }
  }

  const mergeChainBalances = (state: MultiChainBalances, chainId: number, payload: BalancesMap): MultiChainBalances => {
    const chainKey = chainId as SupportedChainId
    const merged = { ...(state[chainKey] ?? {}) }
    for (const rawAddress of Object.keys(payload)) {
      merged[getAddressKey(rawAddress)] = BigInt(payload[rawAddress])
    }
    return { ...state, [chainKey]: merged }
  }

  const openStream = (): void => {
    firstSnapshotTimer = setTimeout(() => {
      if (cancelled) return
      reportError({
        error: new Error(`No snapshot received within ${MULTI_CHAIN_FIRST_SNAPSHOT_TIMEOUT_MS}ms`),
        phase: 'first-snapshot-timeout',
        chainId: undefined,
        scope: SENTRY_SCOPE,
      })
      enterFallback()
    }, MULTI_CHAIN_FIRST_SNAPSHOT_TIMEOUT_MS)

    subscription = subscribeToAggregatedBalances({
      owner: account,
      onBalances: (chainId, balances) => {
        if (cancelled) return
        clearFirstSnapshotTimer()
        setHealth(() => ({ status: MultiChainBalancesHealth.Healthy, isRecovering: false }))
        setBalances((state) => mergeChainBalances(state, chainId, balances))
      },
      onError: (error, terminal, chainId) => {
        if (cancelled) return
        reportError({ error, phase: 'stream', chainId: chainId as SupportedChainId | undefined, scope: SENTRY_SCOPE })
        // A chain-scoped, non-terminal error (its own balances-watcher instance
        // failing) does not take down the merged stream — keep the session
        // running for every other chain. Only a terminal error tears it down.
        if (terminal) {
          enterFallback()
        }
      },
    })
  }

  const attempt = (): void => {
    if (cancelled) return
    clearRetryTimer()
    setStatus(MultiChainBalancesHealth.Connecting)

    createAggregatorSessions({ owner: account, body: { networks } })
      .then(() => {
        if (cancelled) return
        setStatus(MultiChainBalancesHealth.Connected)
        openStream()
      })
      .catch((error: unknown) => {
        if (cancelled) return
        reportError({ error, phase: 'session', chainId: undefined, scope: SENTRY_SCOPE })
        enterFallback()
      })
  }

  return {
    start: attempt,
    cleanup: () => {
      cancelled = true
      closeSubscription()
      clearRetryTimer()
      setHealth(() => DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE)
    },
  }
}
