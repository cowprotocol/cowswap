import { ReactNode, useMemo } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens, useListsEnabledState } from '@cowprotocol/tokens'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'
import { BalancesRpcCallUpdater } from './BalancesRpcCallUpdater'
import { BalancesSseUpdater } from './BalancesSseUpdater'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { useSwrConfigWithPauseForNetwork } from '../hooks/useSwrConfigWithPauseForNetwork'
import { useIsSseFailed } from '../state/isSseFailedAtom'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const RPC_BALANCES_SWR_CONFIG: SWRConfiguration = { ...BASIC_MULTICALL_SWR_CONFIG, refreshInterval: ms`31s` }

const EMPTY_TOKENS: string[] = []

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  excludedTokens: Set<string>
}

export function BalancesAndAllowancesUpdater({
  account,
  chainId,
  excludedTokens,
}: BalancesAndAllowancesUpdaterProps): ReactNode {
  const isSseFailed = useIsSseFailed()

  const allTokens = useAllActiveTokens()

  const tokenAddresses = useMemo(() => {
    if (allTokens.chainId !== chainId) return EMPTY_TOKENS

    return allTokens.tokens.reduce<string[]>((acc, token) => {
      if (!(token instanceof LpToken)) {
        acc.push(token.address)
      }
      return acc
    }, [])
  }, [allTokens, chainId])

  // Get enabled token list URLs for SSE
  const listsEnabledState = useListsEnabledState()
  const tokensListsUrls = useMemo(() => {
    return Object.entries(listsEnabledState)
      .filter(([, isEnabled]) => isEnabled === true)
      .map(([url]) => url)
  }, [listsEnabledState])

  const rpcBalancesSwrConfig = useSwrConfigWithPauseForNetwork(chainId, account, RPC_BALANCES_SWR_CONFIG)

  // Determine which updater to use
  const hasSseTokenLists = tokensListsUrls.length > 0
  const useSse = !isSseFailed && hasSseTokenLists

  return (
    <>
      {/* SSE-based real-time updates (preferred) */}
      {useSse && (
        <BalancesSseUpdater
          account={account}
          chainId={chainId}
          tokenAddresses={tokenAddresses}
          tokensListsUrls={tokensListsUrls}
        />
      )}

      {/* RPC fallback when SSE fails */}
      {isSseFailed && (
        <BalancesRpcCallUpdater
          account={account}
          chainId={chainId}
          tokenAddresses={tokenAddresses}
          balancesSwrConfig={rpcBalancesSwrConfig}
          setLoadingState
        />
      )}

      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={excludedTokens} />
    </>
  )
}
