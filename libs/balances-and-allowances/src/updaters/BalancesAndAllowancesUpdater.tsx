import { ReactNode, useEffect, useMemo } from 'react'

import { LpToken, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { BalancesBffUpdater } from './BalancesBffUpdater'
import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'
import { BalancesRpcCallUpdater } from './BalancesRpcCallUpdater'

import { BFF_BALANCES_SWR_CONFIG } from '../constants/bff-balances-swr-config'
import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { useSwrConfigWithPauseForNetwork } from '../hooks/useSwrConfigWithPauseForNetwork'
import { useUpdateTokenBalance } from '../hooks/useUpdateTokenBalance'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const RPC_BALANCES_SWR_CONFIG: SWRConfiguration = { ...BASIC_MULTICALL_SWR_CONFIG, refreshInterval: ms`31s` }

const BFF_CHAIN_UPDATE_DELAY = ms`2s`

const EMPTY_TOKENS: string[] = []

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  pendingOrdersCount: number
  excludedTokens: Set<string>
  isBffEnabled: boolean
}

export function BalancesAndAllowancesUpdater({
  account,
  chainId,
  pendingOrdersCount,
  isBffEnabled,
  excludedTokens,
}: BalancesAndAllowancesUpdaterProps): ReactNode {
  const updateTokenBalance = useUpdateTokenBalance()

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

  const balancesSwrConfig = useSwrConfigWithPauseForNetwork(
    chainId,
    account,
    isBffEnabled ? BFF_BALANCES_SWR_CONFIG : RPC_BALANCES_SWR_CONFIG,
    isBffEnabled ? BFF_CHAIN_UPDATE_DELAY : undefined,
  )

  // Add native token balance to the store as well
  useEffect(() => {
    if (isBffEnabled) return

    const nativeToken = NATIVE_CURRENCIES[chainId]

    if (nativeToken && nativeTokenBalance) {
      updateTokenBalance(nativeToken.address, nativeTokenBalance)
    }
  }, [isBffEnabled, nativeTokenBalance, chainId, updateTokenBalance])

  return (
    <>
      <BalancesBffUpdater
        account={account}
        chainId={chainId}
        pendingOrdersCount={pendingOrdersCount}
        tokenAddresses={tokenAddresses}
        balancesSwrConfig={balancesSwrConfig}
      />
      !isBffEnabled && (
      <BalancesRpcCallUpdater
        account={account}
        chainId={chainId}
        tokenAddresses={tokenAddresses}
        balancesSwrConfig={balancesSwrConfig}
        setLoadingState
      />
      )
      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={excludedTokens} />
    </>
  )
}
