import { ReactNode, useEffect, useMemo } from 'react'

import { LpToken, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens, useListsEnabledState } from '@cowprotocol/tokens'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { BalancesBffUpdater } from './BalancesBffUpdater'
import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'
import { BalancesRpcCallUpdater } from './BalancesRpcCallUpdater'
import { BalancesSseUpdater } from './BalancesSseUpdater'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { useSwrConfigWithPauseForNetwork } from '../hooks/useSwrConfigWithPauseForNetwork'
import { useUpdateTokenBalance } from '../hooks/useUpdateTokenBalance'
import { useIsSseFailed } from '../state/isSseFailedAtom'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const RPC_BALANCES_SWR_CONFIG: SWRConfiguration = { ...BASIC_MULTICALL_SWR_CONFIG, refreshInterval: ms`31s` }

const EMPTY_TOKENS: string[] = []

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  invalidateCacheTrigger: number
  excludedTokens: Set<string>
  /** @deprecated Use isSseEnabled instead */
  isBffSwitchedOn: boolean
  /** @deprecated Use isSseEnabled instead */
  isBffEnabled?: boolean
  /** Enable SSE-based real-time balance updates */
  isSseEnabled?: boolean
}

export function BalancesAndAllowancesUpdater({
  account,
  chainId,
  invalidateCacheTrigger,
  isBffSwitchedOn,
  excludedTokens,
  isBffEnabled,
  isSseEnabled = false,
}: BalancesAndAllowancesUpdaterProps): ReactNode {
  const updateTokenBalance = useUpdateTokenBalance()
  const isSseFailed = useIsSseFailed()

  const allTokens = useAllActiveTokens()
  const { data: nativeTokenBalance } = useNativeTokenBalance(account, chainId)

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
  const useSse = isSseEnabled && !isSseFailed && hasSseTokenLists
  const useBff = !isSseEnabled && isBffEnabled
  const useRpcFallback = (!isBffSwitchedOn || !isBffEnabled) && !useSse

  // Add native token balance to the store as well
  useEffect(() => {
    if (isBffSwitchedOn || isSseEnabled) return

    const nativeToken = NATIVE_CURRENCIES[chainId]

    if (nativeToken && nativeTokenBalance) {
      updateTokenBalance(nativeToken.address, nativeTokenBalance)
    }
  }, [isBffSwitchedOn, isSseEnabled, nativeTokenBalance, chainId, updateTokenBalance])

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

      {/* Legacy BFF polling (deprecated, for backward compatibility) */}
      {useBff && (
        <BalancesBffUpdater
          account={account}
          chainId={chainId}
          invalidateCacheTrigger={invalidateCacheTrigger}
          tokenAddresses={tokenAddresses}
        />
      )}

      {/* RPC fallback when SSE/BFF fails or is disabled */}
      {(useRpcFallback || isSseFailed) && (
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
