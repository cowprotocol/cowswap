import { useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenListCategory, useAllLpTokens, useAllTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'

import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { usePersistBalancesAndAllowances } from '../hooks/usePersistBalancesAndAllowances'
import { balancesAtom } from '../state/balancesAtom'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { refreshInterval: ms`31s` }
const ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`33s` }

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const LP_BALANCES_SWR_CONFIG = { refreshInterval: ms`62s` }
const LP_ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`66s` }
const LP_MULTICALL_OPTIONS = { consequentExecution: true }

// To avoid high load to the node at the same time
// We start the updater with a delay
const LP_UPDATER_START_DELAY = ms`3s`

const LP_CATEGORIES = [TokenListCategory.LP, TokenListCategory.COW_AMM_LP]

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
}
export function BalancesAndAllowancesUpdater({ account, chainId }: BalancesAndAllowancesUpdaterProps) {
  const setBalances = useSetAtom(balancesAtom)

  const allTokens = useAllTokens()
  const { data: nativeTokenBalance } = useNativeTokenBalance(account)

  const allLpTokens = useAllLpTokens(LP_CATEGORIES)
  const [isUpdaterPaused, setIsUpdaterPaused] = useState(true)

  const lpTokenAddresses = useMemo(() => allLpTokens.map((token) => token.address), [allLpTokens])
  const tokenAddresses = useMemo(() => allTokens.map((token) => token.address), [allTokens])

  usePersistBalancesAndAllowances({
    account,
    chainId,
    tokenAddresses,
    setLoadingState: true,
    balancesSwrConfig: BALANCES_SWR_CONFIG,
    allowancesSwrConfig: ALLOWANCES_SWR_CONFIG,
  })

  usePersistBalancesAndAllowances({
    account: isUpdaterPaused ? undefined : account,
    chainId,
    tokenAddresses: lpTokenAddresses,
    setLoadingState: false,
    balancesSwrConfig: LP_BALANCES_SWR_CONFIG,
    allowancesSwrConfig: LP_ALLOWANCES_SWR_CONFIG,
    multicallOptions: LP_MULTICALL_OPTIONS,
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsUpdaterPaused(false)
    }, LP_UPDATER_START_DELAY)

    return () => clearTimeout(timeout)
  }, [])

  // Add native token balance to the store as well
  useEffect(() => {
    const nativeToken = NATIVE_CURRENCIES[chainId]
    const nativeBalanceState = nativeTokenBalance ? { [nativeToken.address.toLowerCase()]: nativeTokenBalance } : {}

    setBalances((state) => ({ ...state, values: { ...state.values, ...nativeBalanceState } }))
  }, [nativeTokenBalance, chainId, setBalances])

  return <BalancesCacheUpdater chainId={chainId} />
}
