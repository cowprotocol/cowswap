import { useMemo } from 'react'
import { TradeWidgetFieldError } from '@cow/modules/trade/pure/TradeWidgetField'

export function useDisplaySlippageError(
  slippageWarning: string | null,
  slippageError: string | null
): TradeWidgetFieldError {
  return useMemo(() => {
    if (slippageError) {
      return {
        text: slippageError,
        type: 'error',
      }
    } else if (slippageWarning) {
      return {
        text: slippageWarning,
        type: 'warning',
      }
    } else {
      return null
    }
  }, [slippageWarning, slippageError])
}
