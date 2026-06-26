import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'
import { NativeTokenBalanceUpdater } from './NativeTokenBalanceUpdater'

import { useBalancesWatcherSession } from '../hooks/useBalancesWatcherSession'
import { useCustomTokensForChain } from '../hooks/useCustomTokensForChain'
import { useEnabledTokensListsUrls } from '../hooks/useEnabledTokensListsUrls'

export interface BalancesWatcherUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
}

const EMPTY_EXCLUDED_TOKENS: Set<string> = new Set()

/**
 * Watcher-mode peer of `BalancesAndAllowancesUpdater`. Drives `balancesAtom`
 * via the balances-watcher SSE stream and mounts the same reset/cache
 * subtrees so the atom lifecycle (chain/account reset, localStorage
 * hydration/persistence) stays intact when the LD flag is on.
 */
export function BalancesWatcherUpdater({ account, chainId }: BalancesWatcherUpdaterProps): ReactNode {
  const tokensListsUrls = useEnabledTokensListsUrls()
  const customTokens = useCustomTokensForChain(chainId)

  useBalancesWatcherSession({ account, chainId, tokensListsUrls, customTokens })

  return (
    <>
      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={EMPTY_EXCLUDED_TOKENS} />
      <NativeTokenBalanceUpdater account={account} chainId={chainId} />
    </>
  )
}
