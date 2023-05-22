import { ApprovalState, useApprovalStateForSpender } from 'lib/hooks/useApproval'
import { useTradeSpenderAddress } from './useTradeSpenderAddress'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useTokenContract } from 'hooks/useContract'
import { useEffect, useState } from 'react'

// TODO: Handle tokens that don't allow approvals larger than the balance of the wallet
export function useShouldZeroApprove(amountToApprove: CurrencyAmount<Currency> | undefined): boolean {
  const [shouldZeroApprove, setShouldZeroApprove] = useState(false)
  const spender = useTradeSpenderAddress()
  const tokenContract = useTokenContract(
    amountToApprove && amountToApprove.currency.isToken ? amountToApprove.currency.address : undefined
  )
  const approvalState = useApprovalStateForSpender(amountToApprove, spender, () => false) // ignore approval pending state
  const shouldApprove = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING

  useEffect(() => {
    let isStale = false
    ;(async () => {
      if (tokenContract && spender && amountToApprove) {
        if (!shouldApprove) {
          setShouldZeroApprove(false)
          return
        }

        try {
          await tokenContract.estimateGas.approve(
            spender,
            amountToApprove.multiply(10 ** amountToApprove.currency.decimals).toExact()
          )

          if (!isStale) {
            setShouldZeroApprove(false)
          }
        } catch (err) {
          try {
            await tokenContract.estimateGas.approve(spender, '0')

            if (!isStale) {
              // Zero approval case
              setShouldZeroApprove(true)
            }
          } catch (err) {
            // Actual error case
            setShouldZeroApprove(false)
          }
        }
      } else {
        setShouldZeroApprove(false)
      }
    })()

    return () => {
      isStale = true
    }
  }, [tokenContract, spender, amountToApprove, shouldApprove])

  return shouldZeroApprove
}
