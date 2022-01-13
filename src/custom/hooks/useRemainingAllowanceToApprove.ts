import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useActiveWeb3React } from 'hooks/web3'

interface Params {
  amountToApprove: CurrencyAmount<Currency> | undefined
  spender: string | undefined
}

/**
 * useRemainingAllowanceToApprove
 * ======================
 * @description returns allowance of a token against a spender
 * and the remaining allowance IF allowance > remaining. Else is null
 */
export default function useRemainingAllowanceToApprove({ amountToApprove, spender }: Params) {
  const { account } = useActiveWeb3React()
  const allowance = useTokenAllowance(amountToApprove?.wrapped.currency, account ?? undefined, spender)

  return useMemo(() => {
    // syntactic sugar - useful in UI to show to users for granularity
    // Remaining allowance starts off as undefined - aka 0
    let remainingAllowanceToApprove: CurrencyAmount<Currency> | undefined = undefined
    // If amountToApprove is > current allowance, let's return what the difference is
    // e.g amountToApprove<100>.minus(currentAllowance<50>) = 50
    // user now only needs to approve 50
    if (allowance && amountToApprove?.greaterThan(allowance)) {
      remainingAllowanceToApprove = amountToApprove.subtract(allowance)
    }

    return {
      allowance,
      needsApproval: !allowance || amountToApprove?.greaterThan(allowance),
      remainingAllowanceToApprove,
    }
  }, [allowance, amountToApprove])
}
