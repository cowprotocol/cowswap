import type { PriceImpactParams } from 'legacy/hooks/usePriceImpact'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

const emptyState = {
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
}

export function useTradePriceImpactParams(): PriceImpactParams {
  const { state } = useDerivedTradeState()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { inputCurrencyAmount, outputCurrencyAmount } = state || emptyState

  return useSafeMemo(() => {
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
      isWrapping: isWrapOrUnwrap,
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, isWrapOrUnwrap])
}
