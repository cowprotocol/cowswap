import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { applyEmptyLoad, createSessionController } from './balancesWatcherSessionController'

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
export { FALLBACK_RETRY_INTERVAL_MS, FIRST_SNAPSHOT_TIMEOUT_MS } from './balancesWatcherSessionController'

/**
 * Lifecycle: a new session is created whenever account, chainId, or the set of
 * lists/custom tokens changes. The previous EventSource is closed and any
 * in-flight POST is invalidated via the controller's `cancelled` flag.
 *
 * Failure handling lives in `createSessionController` — any of (POST rejection
 * / terminal SSE error / first-snapshot timeout) flips the health atom to
 * `Fallback`, which the parent observes to mount the multicall stack. A
 * recovery retry interval keeps trying until a snapshot succeeds.
 */
export function useBalancesWatcherSession(params: UseBalancesWatcherSessionParams): void {
  const { account, chainId, tokensListsUrls, customTokens } = params

  const setBalances = useSetAtom(balancesAtom)
  const setHealth = useSetAtom(balancesWatcherHealthAtom)

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

    const controller = createSessionController({
      account,
      chainId,
      tokensListsUrls,
      customTokens,
      setBalances,
      setHealth,
    })
    controller.start()
    return controller.cleanup
  }, [account, chainId, tokensListsUrls, customTokens, setBalances, setHealth])
}
