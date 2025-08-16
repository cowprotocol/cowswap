import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'

export function useApproveCurrency(
  amountToApprove: CurrencyAmount<Currency> | undefined,
): (amount: bigint) => Promise<void> {
  const currency = amountToApprove?.currency

  const tradeApproveCallback = useTradeApproveCallback(currency)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)
  const zeroApprove = useZeroApprove(currency)
  return useCallback(
    async (amount: bigint) => {
      if (shouldZeroApprove) {
        await zeroApprove()
      }

      await tradeApproveCallback(amount)
    },
    [tradeApproveCallback, zeroApprove, shouldZeroApprove],
  )
}
