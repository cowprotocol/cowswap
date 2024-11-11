import { useEffect } from 'react'

import { BalancesState, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { BigNumber } from 'ethers'

import { useHooks } from 'modules/hooksStore'
import { usePreHookBalanceDiff } from 'modules/hooksStore/hooks/useBalancesDiff'
import { useIsHooksTradeType } from 'modules/trade'
import { useSetAtom } from 'jotai'
import { balancesCombinedAtom } from '../state/balanceCombinedAtom'

export function BalancesCombinedUpdater() {
  const { account } = useWalletInfo()
  const setBalancesCombined = useSetAtom(balancesCombinedAtom)
  const preHooksBalancesDiff = usePreHookBalanceDiff()
  const { preHooks } = useHooks()
  const tokenBalances = useTokensBalances()
  const isHooksTradeType = useIsHooksTradeType()

  useEffect(() => {
    if (!account || !isHooksTradeType || !preHooks.length) {
      setBalancesCombined(tokenBalances)
      return
    }
    const accountBalancesDiff = preHooksBalancesDiff[account.toLowerCase()] || {}
    setBalancesCombined(applyBalanceDiffs(tokenBalances, accountBalancesDiff))
  }, [account, preHooksBalancesDiff, isHooksTradeType, tokenBalances])

  return null
}

function applyBalanceDiffs(currentBalances: BalancesState, balanceDiff: Record<string, string>): BalancesState {
  const normalizedValues = { ...currentBalances.values }

  // Only process addresses that have balance differences
  // This optimizes since the balances diff object is usually smaller than the balances object
  Object.entries(balanceDiff).forEach(([address, diff]) => {
    const currentBalance = normalizedValues[address] || BigNumber.from(0)
    normalizedValues[address] = currentBalance.add(BigNumber.from(diff))
  })

  return {
    isLoading: currentBalances.isLoading,
    values: normalizedValues,
  }
}
