import { useMemo } from 'react'

import { BalancesState, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { BigNumber } from 'ethers'

import { usePreHookBalanceDiff } from 'modules/hooksStore/hooks/useBalancesDiff'

export function useTokensBalancesCombined() {
  const { account } = useWalletInfo()
  const preHooksBalancesDiff = usePreHookBalanceDiff()
  const tokenBalances = useTokensBalances()

  return useMemo(() => {
    if (!account) return tokenBalances
    const accountBalancesDiff = preHooksBalancesDiff[account.toLowerCase()] || {}
    return applyBalanceDiffs(tokenBalances, accountBalancesDiff)
  }, [account, preHooksBalancesDiff, tokenBalances])
}

function applyBalanceDiffs(currentState: BalancesState, diffs: Record<string, string>): BalancesState {
  const normalizedValues: Record<string, BigNumber> = {}

  // Create normalized versions of inputs
  const normalizedCurrentValues: Record<string, BigNumber | undefined> = {}
  const normalizedDiffs: Record<string, string> = {}

  // Normalize current state values
  for (const address of Object.keys(currentState.values)) {
    normalizedCurrentValues[address.toLowerCase()] = currentState.values[address]
  }

  // Normalize diffs
  for (const address of Object.keys(diffs)) {
    normalizedDiffs[address.toLowerCase()] = diffs[address]
  }

  // Process all addresses in the normalized current state
  for (const address of Object.keys(normalizedCurrentValues)) {
    const currentBalance = normalizedCurrentValues[address] || BigNumber.from(0)
    const diff = normalizedDiffs[address] ? BigNumber.from(normalizedDiffs[address]) : BigNumber.from(0)
    normalizedValues[address] = currentBalance.add(diff)
  }

  // Process any new addresses from diffs that weren't in the current state
  for (const address of Object.keys(normalizedDiffs)) {
    if (!normalizedCurrentValues.hasOwnProperty(address)) {
      normalizedValues[address] = BigNumber.from(normalizedDiffs[address])
    }
  }

  // Return new state object maintaining the isLoading property
  return {
    isLoading: currentState.isLoading,
    values: normalizedValues,
  }
}
