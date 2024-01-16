import { useMemo } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { COW } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { useVCowData } from 'legacy/state/cowToken/hooks'

/**
 * Hook that returns COW balance
 */
function useCowBalance() {
  const { chainId } = useWalletInfo()
  const cowToken = chainId ? COW[chainId] : undefined

  return useCurrencyAmountBalance(cowToken)
}

/**
 * Hook that returns combined vCOW + COW balance + vCow from locked GNO
 */
export function useCombinedBalance() {
  const { chainId, account } = useWalletInfo()
  const { total: vCowBalance } = useVCowData()
  // const { allocated, claimed } = useCowFromLockedGnoBalances()
  const cowBalance = useCowBalance()

  // const lockedGnoBalance = useMemo(() => {
  //   if (!allocated || !claimed) {
  //     return
  //   }

  //   return JSBI.subtract(allocated.quotient, claimed.quotient)
  // }, [allocated, claimed])

  return useMemo(() => {
    let tmpBalance = JSBI.BigInt(0)

    const isLoading = !!(account && (!vCowBalance /* || !lockedGnoBalance */ || !cowBalance))

    const cow = COW[chainId]

    if (account) {
      if (vCowBalance) tmpBalance = JSBI.add(tmpBalance, vCowBalance.quotient)
      // if (lockedGnoBalance) tmpBalance = JSBI.add(tmpBalance, lockedGnoBalance)
      if (cowBalance) tmpBalance = JSBI.add(tmpBalance, cowBalance.quotient)
    }

    // TODO: check COW vs vCOW
    const balance = CurrencyAmount.fromRawAmount(cow, tmpBalance)

    return { balance, isLoading }
  }, [vCowBalance, /* lockedGnoBalance, */ cowBalance, chainId, account])
}
