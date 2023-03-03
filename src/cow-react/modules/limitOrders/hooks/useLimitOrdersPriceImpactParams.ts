import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import type { PriceImpactParams } from 'hooks/usePriceImpact'
import { useMemo } from 'react'

export function useLimitOrdersPriceImpactParams(): PriceImpactParams {
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()

  const abTrade = useSafeMemoObject({
    inputAmount: inputCurrencyAmount,
    outputAmount: outputCurrencyAmount,
    inputAmountWithoutFee: inputCurrencyAmount || undefined,
    outputAmountWithoutFee: outputCurrencyAmount || undefined,
  })

  const parsedAmounts = useSafeMemoObject({
    INPUT: inputCurrencyAmount || undefined,
    OUTPUT: outputCurrencyAmount || undefined,
  })

  return useMemo(() => {
    return {
      abTrade,
      parsedAmounts,
      isWrapping: false,
    }
  }, [abTrade, parsedAmounts])
}
