import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey, PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'
import { BridgeProviderQuoteError, BridgeQuoteResults } from '@cowprotocol/sdk-bridging'

import { isProviderNetworkDeprecatedAtom } from 'entities/common/isProviderNetworkDeprecated.atom'
import { isProviderNetworkUnsupportedAtom } from 'entities/common/isProviderNetworkUnsupported.atom'

import { derivedTradeStateAtom } from 'modules/trade/state/derivedTradeStateAtom'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { TradeQuoteFetchParams } from '../types'
import { getIsFastQuote } from '../utils/getIsFastQuote'

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

type SellTokenAddress = string

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

function getNextLocalQuoteTimestamp(
  prevQuote: TradeQuoteState,
  nextState: Partial<TradeQuoteState>,
): TradeQuoteState['localQuoteTimestamp'] {
  if (typeof nextState.localQuoteTimestamp !== 'undefined') {
    return nextState.localQuoteTimestamp
  }

  if (typeof nextState.quote === 'undefined') {
    return prevQuote.localQuoteTimestamp
  }

  return nextState.quote ? Math.ceil(Date.now() / 1000) : null
}

function shouldIgnoreLateFastResult(prevQuote: TradeQuoteState, nextState: Partial<TradeQuoteState>): boolean {
  const hasSameFetchStart =
    prevQuote.fetchParams?.fetchStartTimestamp === nextState.fetchParams?.fetchStartTimestamp
  const hasStoredQuote = Boolean(prevQuote.quote)
  const hasNextQuoteResult = Boolean(nextState.quote || nextState.error)

  return (
    hasSameFetchStart &&
    getIsFastQuote(nextState.fetchParams) &&
    prevQuote.fetchParams?.priceQuality === PriceQuality.OPTIMAL &&
    hasStoredQuote &&
    hasNextQuoteResult
  )
}

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = getAddressKey(_sellTokenAddress)
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      // Ignore late Fast results once the same-cycle Optimal state is already stored.
      if (shouldIgnoreLateFastResult(prevQuote, nextState)) {
        return { ...prevState }
      }

      const quote = typeof nextState.quote === 'undefined' ? prevQuote.quote : nextState.quote
      const localQuoteTimestamp = getNextLocalQuoteTimestamp(prevQuote, nextState)

      const update: TradeQuoteState = {
        ...prevQuote,
        ...nextState,
        quote,
        localQuoteTimestamp,
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
