import { ReactNode, useMemo } from 'react'

import { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'
import { NativeTokenBalanceUpdater } from './NativeTokenBalanceUpdater'

import { useBalancesWatcherSession } from '../hooks/useBalancesWatcherSession'
import { useCustomTokensForChain } from '../hooks/useCustomTokensForChain'
import { useEnabledTokensListsUrls } from '../hooks/useEnabledTokensListsUrls'

export interface BalancesWatcherUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  /** Bridge buy-tokens fetched from the bridge API, tracked as customTokens in the bw session in addition to the user-imported list. */
  bridgeTokenList?: Set<AddressKey>
}

const EMPTY_EXCLUDED_TOKENS: Set<string> = new Set()
const EMPTY_BRIDGE_TOKEN_LIST: Set<AddressKey> = new Set()

/**
 * Watcher-mode peer of `BalancesAndAllowancesUpdater`. Drives `balancesAtom`
 * via the balances-watcher SSE stream and mounts the same reset/cache
 * subtrees so the atom lifecycle (chain/account reset, localStorage
 * hydration/persistence) stays intact when the LD flag is on.
 */
export function BalancesWatcherUpdater({
  account,
  chainId,
  bridgeTokenList = EMPTY_BRIDGE_TOKEN_LIST,
}: BalancesWatcherUpdaterProps): ReactNode {
  const tokensListsUrls = useEnabledTokensListsUrls()
  const customTokens = useCustomTokensForChain(chainId)

  const mergedCustomTokens = useMemo(() => {
    if (bridgeTokenList.size === 0) return Array.from(customTokens)

    const merged = new Set(customTokens)
    for (const address of bridgeTokenList) {
      merged.add(address)
    }
    return Array.from(merged)
  }, [customTokens, bridgeTokenList])

  useBalancesWatcherSession({ account, chainId, tokensListsUrls, customTokens: mergedCustomTokens })

  return (
    <>
      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={EMPTY_EXCLUDED_TOKENS} />
      <NativeTokenBalanceUpdater account={account} chainId={chainId} />
    </>
  )
}
