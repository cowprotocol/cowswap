import { useMemo } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { useVCowData } from 'legacy/state/cowToken/hooks'

/**
 * Hook that returns COW balance
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useCowBalance() {
  const { chainId } = useWalletInfo()
  const cowToken = chainId ? COW_TOKEN_TO_CHAIN[chainId] : undefined

  return useCurrencyAmountBalance(cowToken)
}

/**
 * Hook that returns combined vCOW + COW balance + vCow from locked GNO
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCombinedBalance() {
  const { chainId, account } = useWalletInfo()
  const { isLoading: isVCowLoading, total: vCowBalance } = useVCowData()
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

    const isLoading = !!(account && (isVCowLoading /* || !lockedGnoBalance */ || !cowBalance))

    const cowToken = COW_TOKEN_TO_CHAIN[chainId]

    if (account) {
      if (vCowBalance) tmpBalance = JSBI.add(tmpBalance, vCowBalance.quotient)
      // if (lockedGnoBalance) tmpBalance = JSBI.add(tmpBalance, lockedGnoBalance)
      if (cowBalance) tmpBalance = JSBI.add(tmpBalance, cowBalance.quotient)
    }

    // TODO: check COW vs vCOW
    const balance = cowToken ? CurrencyAmount.fromRawAmount(cowToken, tmpBalance) : null

    return { balance, isLoading }
  }, [vCowBalance, /* lockedGnoBalance, */ cowBalance, chainId, account, isVCowLoading])
}
