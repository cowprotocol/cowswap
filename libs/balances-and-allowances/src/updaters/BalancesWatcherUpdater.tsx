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
  /**
   * True when `chainId` is a bridge target chain (user is browsing tokens of a chain different from their wallet's).
   * In this mode the session is driven exclusively by `bridgeTokenList` - user-imported tokens and enabled token
   * lists are skipped, and an empty `bridgeTokenList` produces no session at all.
   */
  isBridgeMode?: boolean
  /** Bridge buy-tokens fetched from the bridge API. */
  bridgeTokenList?: AddressKey[]
}

const EMPTY_EXCLUDED_TOKENS: Set<string> = new Set()
const EMPTY_BRIDGE_TOKEN_LIST: AddressKey[] = []
const EMPTY_TOKENS_LISTS_URLS: string[] = []

/**
 * Watcher-mode peer of `BalancesAndAllowancesUpdater`. Drives `balancesAtom`
 * via the balances-watcher SSE stream and mounts the same reset/cache
 * subtrees so the atom lifecycle (chain/account reset, localStorage
 * hydration/persistence) stays intact when the LD flag is on.
 */
export function BalancesWatcherUpdater({
  account,
  chainId,
  isBridgeMode = false,
  bridgeTokenList = EMPTY_BRIDGE_TOKEN_LIST,
}: BalancesWatcherUpdaterProps): ReactNode {
  const enabledTokensListsUrls = useEnabledTokensListsUrls()
  const userCustomTokens = useCustomTokensForChain(chainId)

  // Bridge mode drops both token lists and user-imported tokens - the watcher tracks ONLY bridge buy-tokens for the
  // target chain. An empty `bridgeTokenList` produces `(urls=[], customTokens=[])`, which `useBalancesWatcherSession`
  // already treats as "no session" and skips the POST.
  const sessionBody = useMemo(() => {
    if (isBridgeMode) {
      return {
        tokensListsUrls: EMPTY_TOKENS_LISTS_URLS,
        customTokens: bridgeTokenList,
      }
    }
    return {
      tokensListsUrls: enabledTokensListsUrls,
      customTokens: userCustomTokens,
    }
  }, [isBridgeMode, bridgeTokenList, enabledTokensListsUrls, userCustomTokens])

  useBalancesWatcherSession({
    account,
    chainId,
    tokensListsUrls: sessionBody.tokensListsUrls,
    customTokens: sessionBody.customTokens,
  })

  return (
    <>
      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={EMPTY_EXCLUDED_TOKENS} />
      <NativeTokenBalanceUpdater account={account} chainId={chainId} />
    </>
  )
}
