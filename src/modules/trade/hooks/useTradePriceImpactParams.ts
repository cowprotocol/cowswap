import { useMemo } from 'react'

import type { PriceImpactParams } from 'legacy/hooks/usePriceImpact'

import { useDerivedTradeState } from './useDerivedTradeState'

export function useTradePriceImpactParams(): PriceImpactParams {
  const { state } = useDerivedTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount } = state || {
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
  }

  return useMemo(() => {
    const abTrade = {
      inputAmount: inputCurrencyAmount,
      outputAmount: outputCurrencyAmount,
      // TODO: before integrating in Swap - specify correct values
      inputAmountWithoutFee: inputCurrencyAmount || undefined,
      outputAmountWithoutFee: outputCurrencyAmount || undefined,
    }

    const parsedAmounts = {
      INPUT: inputCurrencyAmount || undefined,
      OUTPUT: outputCurrencyAmount || undefined,
    }

    return {
      abTrade,
      parsedAmounts,
      isWrapping: false,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputCurrencyAmount?.quotient.toString(), outputCurrencyAmount?.quotient.toString()])
}
