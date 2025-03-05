import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { tradeQuoteAtom } from '../state/tradeQuoteAtom'
import { TradeQuoteState } from '../state/tradeQuoteAtom'
import { DEFAULT_TRADE_QUOTE_STATE } from '../state/tradeQuoteAtom'

export function useTradeQuote(): TradeQuoteState {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const state = useDerivedTradeState()
  const quoteState = useAtomValue(tradeQuoteAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || isProviderNetworkUnsupported) {
      return DEFAULT_TRADE_QUOTE_STATE
    }

    return quoteState
  }, [inputCurrency, outputCurrency, quoteState, isProviderNetworkUnsupported])
}
