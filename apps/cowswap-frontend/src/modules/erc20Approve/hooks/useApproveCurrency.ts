import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTradeApproveCallback } from 'modules/erc20Approve'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
): (amount: bigint) => Promise<void> {
  const currency = amountToApprove?.currency

  const tradeApproveCallback = useTradeApproveCallback(currency)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove, true)
  const zeroApprove = useZeroApprove(currency)
  return useCallback(
    async (amount: bigint) => {
      if (await shouldZeroApprove()) {
        await zeroApprove()
      }

      await tradeApproveCallback(amount)
    },
    [tradeApproveCallback, zeroApprove, shouldZeroApprove],
  )
}
