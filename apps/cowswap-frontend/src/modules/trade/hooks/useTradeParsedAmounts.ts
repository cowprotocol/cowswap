import { ParsedAmounts } from 'legacy/hooks/usePriceImpact/types'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

const emptyState = {
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
}

export function useTradeParsedAmounts(): ParsedAmounts {
  const { state } = useDerivedTradeState()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { inputCurrencyAmount, outputCurrencyAmount } = state || emptyState

  return useSafeMemo(() => {
    return {
      INPUT: inputCurrencyAmount || undefined,
      OUTPUT: outputCurrencyAmount || undefined,
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, isWrapOrUnwrap])
}
