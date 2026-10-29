import { atom } from 'jotai'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey, PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'
import { BridgeProviderQuoteError, BridgeQuoteResults, QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { isProviderNetworkDeprecatedAtom } from 'entities/common/isProviderNetworkDeprecated.atom'
import { isProviderNetworkUnsupportedAtom } from 'entities/common/isProviderNetworkUnsupported.atom'

import { derivedTradeStateAtom } from 'modules/trade/state/derivedTradeStateAtom'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { TradeQuoteFetchParams } from '../types'
import { getIsFastQuote, getIsFinalQuote } from '../utils/getIsFastQuote'

export interface PendingQuotes {
  fetchStartTimestamp: number
  priceQualities: PriceQuality[]
}

export interface TradeQuoteState {
  quote: QuoteAndPost | null
  isBridgeQuote: boolean | null
  bridgeQuote: BridgeQuoteResults | null
  fetchParams: TradeQuoteFetchParams | null
  error: QuoteApiError | BridgeProviderQuoteError | null
  errorQuoteParams?: QuoteBridgeRequest
  hasParamsChanged: boolean
  isLoading: boolean
  localQuoteTimestamp: number | null
  /** Whether a final quote has arrived since the quote was last cleared; later fast quotes keep it set. */
  hasFinalQuote: boolean
  /** Quotes of the latest fetch round that have neither arrived nor failed; null once all of them have. */
  pendingQuotes: PendingQuotes | null
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
  hasFinalQuote: false,
  pendingQuotes: null,
}

export const tradeQuotesAtom = atom<Record<SellTokenAddress, TradeQuoteState | undefined>>({})

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = getAddressKey(_sellTokenAddress)
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      // Don't update state if Fast quote finished after Verified quote
      if (
        prevQuote.fetchParams?.fetchStartTimestamp === nextState.fetchParams?.fetchStartTimestamp &&
        nextState.quote &&
        getIsFastQuote(nextState.fetchParams)
      ) {
        return { ...prevState }
      }

      const quote = typeof nextState.quote === 'undefined' ? prevQuote.quote : nextState.quote

      const update: TradeQuoteState = {
        ...prevQuote,
        ...nextState,
        quote,
        localQuoteTimestamp: nextState.quote ? Math.ceil(Date.now() / 1000) : null,
        hasFinalQuote: getHasFinalQuote(prevQuote, nextState, quote),
      }

      return {
        ...prevState,
        [sellTokenAddress]: update,
      }
    })
  },
)

function getHasFinalQuote(
  prevQuote: TradeQuoteState,
  nextState: Partial<TradeQuoteState>,
  quote: TradeQuoteState['quote'],
): boolean {
  if (!quote) return false

  return prevQuote.hasFinalQuote || (!!nextState.quote && getIsFinalQuote(nextState.fetchParams))
}

export const updatePendingQuotesAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, fetchParams: TradeQuoteFetchParams, isSettled: boolean) => {
    const sellTokenAddress = getAddressKey(_sellTokenAddress)
    const prevState = get(tradeQuotesAtom)
    const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE
    const { fetchStartTimestamp, priceQuality } = fetchParams
    const current = prevQuote.pendingQuotes
    const isCurrentRound = current?.fetchStartTimestamp === fetchStartTimestamp

    if (isSettled && !isCurrentRound) return

    const priceQualities = isSettled
      ? (current?.priceQualities ?? []).filter((quality) => quality !== priceQuality)
      : [...(isCurrentRound ? current.priceQualities : []), priceQuality]

    set(tradeQuotesAtom, {
      ...prevState,
      [sellTokenAddress]: {
        ...prevQuote,
        pendingQuotes: priceQualities.length ? { fetchStartTimestamp, priceQualities } : null,
      },
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
