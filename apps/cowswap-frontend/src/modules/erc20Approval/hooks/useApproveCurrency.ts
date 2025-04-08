import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove } from './useShouldZeroApprove'
import { useZeroApprove } from './useZeroApprove'

import { useTradeApproveCallback } from '../containers/TradeApprove/useTradeApproveCallback'

export function useApproveCurrency(amountToApprove: CurrencyAmount<Currency> | undefined) {
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
