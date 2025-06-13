import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { BalancesState, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { BigNumber } from 'ethers'

import { useHooks } from 'modules/hooksStore'
import { usePreHookBalanceDiff } from 'modules/hooksStore/hooks/useBalancesDiff'
import { useIsHooksTradeType } from 'modules/trade'

import { balancesCombinedAtom } from '../state/balanceCombinedAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BalancesCombinedUpdater() {
  const { account, chainId } = useWalletInfo()
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
    setBalancesCombined(applyBalanceDiffs(tokenBalances, accountBalancesDiff, chainId))
  }, [account, chainId, preHooksBalancesDiff, isHooksTradeType, tokenBalances, preHooks.length, setBalancesCombined])

  return null
}

function applyBalanceDiffs(
  currentBalances: BalancesState,
  balanceDiff: Record<string, string>,
  chainId: SupportedChainId,
): BalancesState {
  const normalizedValues = { ...currentBalances.values }

  // Only process addresses that have balance differences
  // This optimizes since the balances diff object is usually smaller than the balances object
  Object.entries(balanceDiff).forEach(([address, diff]) => {
    const currentBalance = normalizedValues[address]
    if (currentBalance === undefined) return
    const balanceWithDiff = currentBalance.add(BigNumber.from(diff))

    // If the balance with diff is negative, set the balance to 0
    // This avoid the UI crashing in case of some error
    normalizedValues[address] = balanceWithDiff.isNegative()
      ? BigNumber.from(0)
      : currentBalance.add(BigNumber.from(diff))
  })

  return {
    isLoading: currentBalances.isLoading,
    values: normalizedValues,
    chainId,
  }
}
