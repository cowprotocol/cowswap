import { useMemo } from 'react'
import { useAtomValue } from 'jotai/utils'
import { tradeQuoteAtom } from '../state/tradeQuoteAtom'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { TradeQuoteState } from '../state/tradeQuoteAtom'
import { DEFAULT_QUOTE_RESPONSE } from '../state/tradeQuoteAtom'

export function useTradeQuote(): TradeQuoteState {
  const { state } = useDerivedTradeState()
  const quoteState = useAtomValue(tradeQuoteAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return DEFAULT_QUOTE_RESPONSE
    }

    return quoteState
  }, [inputCurrency, outputCurrency, quoteState])
}
