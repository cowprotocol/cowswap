import { useCallback } from 'react'

import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTradeApproveCallback } from 'modules/erc20Approve'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
): (amount: bigint) => Promise<TransactionReceipt | undefined | null | SafeMultisigTransactionResponse> {
  const currency = amountToApprove?.currency

  const tradeApproveCallback = useTradeApproveCallback(currency)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)
  const zeroApprove = useZeroApprove(currency)
  return useCallback(
    async (amount: bigint) => {
      if (shouldZeroApprove) {
        return zeroApprove()
      }

      return tradeApproveCallback(amount)
    },
    [tradeApproveCallback, zeroApprove, shouldZeroApprove],
  )
}
