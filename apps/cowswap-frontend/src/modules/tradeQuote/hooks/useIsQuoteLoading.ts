import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { tradeQuoteAtom } from '../state/tradeQuoteAtom'

export function useIsQuoteLoading() {
  const { state } = useDerivedTradeState()
  const { isLoading } = useAtomValue(tradeQuoteAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return false
    }

    return !!isLoading
  }, [inputCurrency, outputCurrency, isLoading])
}
