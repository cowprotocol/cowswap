import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useIsWindowIdle, useThrottledCallback } from '@cowprotocol/common-hooks'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { applyEmptyLoad, createSessionController, HIDDEN_SESSION_TIMEOUT_MS } from './balancesWatcherSessionController'

import { REPORT_THROTTLE_MS, reportWatcherError } from '../balancesWatcher'
import { balancesAtom } from '../state/balancesAtom'
import { balancesWatcherHealthAtom, DEFAULT_WATCHER_HEALTH_STATE } from '../state/balancesWatcherHealthAtom'

export interface UseBalancesWatcherSessionParams {
  account: string | undefined
  chainId: SupportedChainId
  /**
   * Enabled token list source URLs. Sent verbatim in the session POST.
   */
  tokensListsUrls: string[]
  /**
   * Custom (user-imported) token addresses for the current chain. Sent verbatim
   * in the session POST.
   */
  customTokens: string[]
}

// Re-exported here so callers can keep importing constants from the hook module.
export {
  FALLBACK_RETRY_INTERVAL_MS,
  FIRST_SNAPSHOT_TIMEOUT_MS,
  HIDDEN_SESSION_TIMEOUT_MS,
} from './balancesWatcherSessionController'

/**
 * Lifecycle: a new session is created whenever account, chainId, or the set of
 * lists/custom tokens changes. The previous EventSource is closed and any
 * in-flight POST is invalidated via the controller's `cancelled` flag.
 *
 * Failure handling lives in `createSessionController` — any of (POST rejection
 * / terminal SSE error / first-snapshot timeout) flips the health atom to
 * `Fallback`, which the parent observes to mount the multicall stack. A
 * recovery retry interval keeps trying until a snapshot succeeds.
 *
 * Idle gating: while the tab is continuously hidden past
 * `HIDDEN_SESSION_TIMEOUT_MS`, no session is driven — the effect's cleanup
 * tears down the current controller and health resets to `Idle`. As soon as
 * the tab is visible again, a fresh session (POST + SSE) is started.
 */
export function useBalancesWatcherSession(params: UseBalancesWatcherSessionParams): void {
  const { account, chainId, tokensListsUrls, customTokens } = params

  const setBalances = useSetAtom(balancesAtom)
  const setHealth = useSetAtom(balancesWatcherHealthAtom)
  const isIdle = useIsWindowIdle(HIDDEN_SESSION_TIMEOUT_MS)
  const reportError = useThrottledCallback(reportWatcherError, REPORT_THROTTLE_MS)

  useEffect(() => {
    if (!account || !isEvmChain(chainId)) {
      setHealth(DEFAULT_WATCHER_HEALTH_STATE)
      return
    }
    if (tokensListsUrls.length === 0 && customTokens.length === 0) {
      // Nothing to subscribe to, but we still must close the first-load gate
      // so form validation does not park the UI in `BalancesLoading` forever.
      setBalances((state) => applyEmptyLoad(state, chainId))
      setHealth(DEFAULT_WATCHER_HEALTH_STATE)
      return
    }
    if (isIdle) {
      // Tab has been hidden long enough — do not hold an SSE channel open.
      setHealth(DEFAULT_WATCHER_HEALTH_STATE)
      return
    }

    const controller = createSessionController({
      account,
      chainId,
      tokensListsUrls,
      customTokens,
      setBalances,
      setHealth,
      reportError,
    })
    controller.start()
    return controller.cleanup
  }, [account, chainId, tokensListsUrls, customTokens, isIdle, setBalances, setHealth, reportError])
}
