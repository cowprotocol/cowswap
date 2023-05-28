import { useMemo } from 'react'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import type { PriceImpactParams } from 'legacy/hooks/usePriceImpact'

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
