import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import type { PriceImpactParams } from 'hooks/usePriceImpact'
import { useMemo } from 'react'

export function useLimitOrdersPriceImpactParams(): PriceImpactParams {
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()

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
