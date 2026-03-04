import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey, QuoteAndPost } from '@cowprotocol/cow-sdk'
import { BridgeProviderQuoteError, BridgeQuoteResults } from '@cowprotocol/sdk-bridging'

import { isProviderNetworkDeprecatedAtom } from 'entities/common/isProviderNetworkDeprecated.atom'
import { isProviderNetworkUnsupportedAtom } from 'entities/common/isProviderNetworkUnsupported.atom'

import { derivedTradeStateAtom } from 'modules/trade/state/derivedTradeStateAtom'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { TradeQuoteFetchParams } from '../types'
import { getIsFastQuote } from '../utils/getIsFastQuote'

type SellTokenAddress = string

export interface TradeQuoteState {
  quote: QuoteAndPost | null
  isBridgeQuote: boolean | null
  bridgeQuote: BridgeQuoteResults | null
  fetchParams: TradeQuoteFetchParams | null
  error: QuoteApiError | BridgeProviderQuoteError | null
  hasParamsChanged: boolean
  isLoading: boolean
  localQuoteTimestamp: number | null
}

export const DEFAULT_TRADE_QUOTE_STATE: TradeQuoteState = {
  quote: null,
  bridgeQuote: null,
  isBridgeQuote: null,
  fetchParams: null,
  error: null,
  hasParamsChanged: false,
  isLoading: false,
  localQuoteTimestamp: null,
}

export const tradeQuotesAtom = atom<Record<SellTokenAddress, TradeQuoteState | undefined>>({})

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = _sellTokenAddress.toLowerCase()
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      // Don't update state if Fast quote finished after Optimal quote
      if (
        prevQuote.fetchParams?.fetchStartTimestamp === nextState.fetchParams?.fetchStartTimestamp &&
        nextState.quote &&
        getIsFastQuote(nextState.fetchParams)
      ) {
        return { ...prevState }
      }

      const update: TradeQuoteState = {
        ...prevQuote,
        ...nextState,
        quote: typeof nextState.quote === 'undefined' ? prevQuote.quote : nextState.quote,
        localQuoteTimestamp: nextState.quote ? Math.ceil(Date.now() / 1000) : null,
      }

      return {
        ...prevState,
        [sellTokenAddress]: update,
      }
    })
  },
)

export const currentTradeQuoteAtom = atom<TradeQuoteState>((get) => {
  const isProviderNetworkUnsupported = get(isProviderNetworkUnsupportedAtom)
  const isProviderNetworkDeprecated = get(isProviderNetworkDeprecatedAtom)
  const state = get(derivedTradeStateAtom)
  const tradeQuotes = get(tradeQuotesAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  if (!inputCurrency || !outputCurrency || isProviderNetworkUnsupported || isProviderNetworkDeprecated) {
    return DEFAULT_TRADE_QUOTE_STATE
  }

  return tradeQuotes[getAddressKey(getCurrencyAddress(inputCurrency))] || DEFAULT_TRADE_QUOTE_STATE
})
