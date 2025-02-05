import { useEffect, useState } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTokenContract } from 'common/hooks/useContract'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { useApprovalStateForSpender } from 'lib/hooks/useApproval'

import { shouldZeroApprove as shouldZeroApproveFn } from './shouldZeroApprove'

// TODO: Handle tokens that don't allow approvals larger than the balance of the wallet
/**
 * Return null when decision is not taken yet
 * @param amountToApprove
 */
export function useShouldZeroApprove(amountToApprove: Nullish<CurrencyAmount<Currency>>): boolean | null {
  const [shouldZeroApprove, setShouldZeroApprove] = useState<boolean | null>(null)
  const spender = useTradeSpenderAddress()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const { contract: tokenContract } = useTokenContract(token?.address)
  const approvalState = useApprovalStateForSpender(amountToApprove, spender, () => false) // ignore approval pending state

  useEffect(() => {
    let isStale = false
    ;(async () => {
      const result = await shouldZeroApproveFn({
        approvalState: approvalState.approvalState,
        amountToApprove,
        tokenContract,
        spender,
      })

      if (result === null) {
        if (shouldZeroApprove) setShouldZeroApprove(false)
        return
      }

      if (!isStale) {
        setShouldZeroApprove(result)
      }
    })()

    return () => {
      isStale = true
    }
  }, [tokenContract, spender, amountToApprove, approvalState, shouldZeroApprove])

  return shouldZeroApprove
}
