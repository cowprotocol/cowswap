import { useCallback } from 'react'

import { useUpdateTradeQuote } from './useUpdateTradeQuote'

export function useResetTradeQuote() {
  const updateQuoteState = useUpdateTradeQuote()

  return useCallback(() => {
    updateQuoteState({ response: null })
  }, [updateQuoteState])
}
