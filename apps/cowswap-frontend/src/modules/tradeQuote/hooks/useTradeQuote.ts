import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { tradeQuotesAtom } from '../state/tradeQuoteAtom'
import { TradeQuoteState } from '../state/tradeQuoteAtom'
import { DEFAULT_TRADE_QUOTE_STATE } from '../state/tradeQuoteAtom'

export function useTradeQuote(): TradeQuoteState {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const state = useDerivedTradeState()
  const tradeQuotes = useAtomValue(tradeQuotesAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || isProviderNetworkUnsupported) {
      return DEFAULT_TRADE_QUOTE_STATE
    }

    return tradeQuotes[getCurrencyAddress(inputCurrency).toLowerCase()] || DEFAULT_TRADE_QUOTE_STATE
  }, [inputCurrency, outputCurrency, tradeQuotes, isProviderNetworkUnsupported])
}
