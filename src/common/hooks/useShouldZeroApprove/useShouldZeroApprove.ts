import { useApprovalStateForSpender } from 'lib/hooks/useApproval'
import { useTradeSpenderAddress } from '../useTradeSpenderAddress'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useEffect, useState } from 'react'
import { useTokenContract } from 'legacy/hooks/useContract'
import { shouldZeroApprove as shouldZeroApproveFn } from './shouldZeroApprove'

// TODO: Handle tokens that don't allow approvals larger than the balance of the wallet
export function useShouldZeroApprove(amountToApprove: CurrencyAmount<Currency> | undefined): boolean {
  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)
  const spender = useTradeSpenderAddress()
  const tokenContract = useTokenContract(
    amountToApprove && amountToApprove.currency.isToken ? amountToApprove.currency.address : undefined
  )
  const approvalState = useApprovalStateForSpender(amountToApprove, spender, () => false) // ignore approval pending state

  useEffect(() => {
    let isStale = false
    ;(async () => {
      const result = await shouldZeroApproveFn({
        amountToApprove,
        tokenContract,
        spender,
        approvalState,
      })

      if (!isStale) {
        setShouldZeroApprove(result)
      }
    })()

    return () => {
      isStale = true
    }
  }, [tokenContract, spender, amountToApprove, approvalState])

  return shouldZeroApprove
}
