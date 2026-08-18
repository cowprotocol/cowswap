import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useIsWindowIdle, useThrottledCallback } from '@cowprotocol/common-hooks'
import { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  createMultiChainBalancesSessionController,
  MULTI_CHAIN_FALLBACK_RETRY_INTERVAL_MS,
} from './multiChainBalancesSessionController'

import { NetworkTokensRequest } from '../balancesAggregator'
import { REPORT_THROTTLE_MS, reportWatcherError } from '../balancesWatcher'
import { multiChainBalancesAtom } from '../state/multiChainBalancesAtom'
import {
  DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE,
  multiChainBalancesHealthAtom,
} from '../state/multiChainBalancesHealthAtom'

const IDLE_SESSION_TIMEOUT_MS = MULTI_CHAIN_FALLBACK_RETRY_INTERVAL_MS

export interface UseMultiChainBalancesSessionParams {
  account: string | undefined
  /** Enabled token list source URLs, sent verbatim for every EVM chain. */
  tokensListsUrls: string[]
  /** Per-chain user-imported token addresses. */
  customTokensByChain: Partial<Record<SupportedChainId, AddressKey[]>>
  /** Multichain mode toggle (user preference), gating whether a session is driven at all. */
  enabled: boolean
}

/**
 * Multi-chain peer of `useBalancesWatcherSession`: drives one aggregator
 * session covering every EVM chain at once, feeding `multiChainBalancesAtom`.
 * Fully additive — never touches `balancesAtom` or the single-chain path.
 */
export function useMultiChainBalancesSession(params: UseMultiChainBalancesSessionParams): void {
  const { account, tokensListsUrls, customTokensByChain, enabled } = params

  const setBalances = useSetAtom(multiChainBalancesAtom)
  const setHealth = useSetAtom(multiChainBalancesHealthAtom)
  const isIdle = useIsWindowIdle(IDLE_SESSION_TIMEOUT_MS)
  const reportError = useThrottledCallback(reportWatcherError, REPORT_THROTTLE_MS)

  useEffect(() => {
    if (!enabled || !account || isIdle) {
      setHealth(() => DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE)
      return
    }

    const networks = buildNetworksRequest(tokensListsUrls, customTokensByChain)
    if (Object.keys(networks).length === 0) {
      setHealth(() => DEFAULT_MULTI_CHAIN_BALANCES_HEALTH_STATE)
      return
    }

    const controller = createMultiChainBalancesSessionController({
      account,
      networks,
      setBalances,
      setHealth,
      reportError,
    })
    controller.start()
    return controller.cleanup
  }, [account, tokensListsUrls, customTokensByChain, enabled, isIdle, setBalances, setHealth, reportError])
}

function buildNetworksRequest(
  tokensListsUrls: string[],
  customTokensByChain: Partial<Record<SupportedChainId, AddressKey[]>>,
): Record<string, NetworkTokensRequest> {
  const networks: Record<string, NetworkTokensRequest> = {}

  for (const [chainId, customTokens] of Object.entries(customTokensByChain)) {
    const tokenLists = tokensListsUrls
    const resolvedCustomTokens = customTokens ?? []
    if (tokenLists.length === 0 && resolvedCustomTokens.length === 0) continue

    networks[chainId] = { tokenLists, customTokens: resolvedCustomTokens }
  }

  return networks
}
