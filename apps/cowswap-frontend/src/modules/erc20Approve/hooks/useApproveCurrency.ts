import { useCallback } from 'react'

import { Nullish } from '@cowprotocol/types'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTradeApproveCallback } from 'modules/erc20Approve'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
): (amount: bigint) => Promise<Nullish<TransactionReceipt | SafeMultisigTransactionResponse>> {
  const currency = amountToApprove?.currency

  const tradeApproveCallback = useTradeApproveCallback(currency)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove, true)
  const zeroApprove = useZeroApprove(currency)
  return useCallback(
    async (amount: bigint) => {
      if (await shouldZeroApprove()) {
        return zeroApprove()
      }

      return tradeApproveCallback(amount)
    },
    [tradeApproveCallback, zeroApprove, shouldZeroApprove],
  )
}
