import { useMemo } from 'react'

import { BalancesState, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { BigNumber } from 'ethers'

import { usePreHookBalanceDiff } from 'modules/hooksStore/hooks/useBalancesDiff'
import { useIsHooksTradeType } from 'modules/trade'

export function useTokensBalancesCombined() {
  const { account } = useWalletInfo()
  const preHooksBalancesDiff = usePreHookBalanceDiff()
  const tokenBalances = useTokensBalances()
  const isHooksTradeType = useIsHooksTradeType()

  return useMemo(() => {
    if (!account || !isHooksTradeType) return tokenBalances
    const accountBalancesDiff = preHooksBalancesDiff[account.toLowerCase()] || {}
    return applyBalanceDiffs(tokenBalances, accountBalancesDiff)
  }, [account, preHooksBalancesDiff, tokenBalances, isHooksTradeType])
}

function applyBalanceDiffs(currentBalances: BalancesState, balanceDiff: Record<string, string>): BalancesState {
  // Get all unique addresses from both objects
  const allAddresses = [...new Set([...Object.keys(currentBalances.values), ...Object.keys(balanceDiff)])]

  const normalizedValues = allAddresses.reduce(
    (acc, address) => {
      const currentBalance = currentBalances.values[address] || BigNumber.from(0)
      const diff = balanceDiff[address] ? BigNumber.from(balanceDiff[address]) : BigNumber.from(0)

      return {
        ...acc,
        [address]: currentBalance.add(diff),
      }
    },
    {} as Record<string, BigNumber>,
  )

  return {
    isLoading: currentBalances.isLoading,
    values: normalizedValues,
  }
}
