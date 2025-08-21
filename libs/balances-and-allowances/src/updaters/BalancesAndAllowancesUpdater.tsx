import { ReactNode, useEffect, useMemo } from 'react'

import { LpToken, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { usePersistBalancesAndAllowances } from '../hooks/usePersistBalancesAndAllowances'
import { useSwrConfigWithPauseForNetwork } from '../hooks/useSwrConfigWithPauseForNetwork'
import { useUpdateTokenBalance } from '../hooks/useUpdateTokenBalance'

const EMPTY_TOKENS: string[] = []

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG: SWRConfiguration = { ...BASIC_MULTICALL_SWR_CONFIG, refreshInterval: ms`31s` }

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

  const balancesSwrConfig = useSwrConfigWithPauseForNetwork(chainId, account, BALANCES_SWR_CONFIG)

  usePersistBalancesAndAllowances({
    account,
    chainId,
    tokenAddresses,
    setLoadingState: true,
    balancesSwrConfig,
  })

  // Add native token balance to the store as well
  useEffect(() => {
    const nativeToken = NATIVE_CURRENCIES[chainId]

    if (nativeToken && nativeTokenBalance) {
      updateTokenBalance(nativeToken.address, nativeTokenBalance)
    }
  }, [nativeTokenBalance, chainId, updateTokenBalance])

  return (
    <>
      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={excludedTokens} />
    </>
  )
}
