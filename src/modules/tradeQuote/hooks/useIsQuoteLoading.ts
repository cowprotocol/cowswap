import { useMemo } from 'react'
import { useAtomValue } from 'jotai/utils'
import { tradeQuoteAtom } from '../state/tradeQuoteAtom'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

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
