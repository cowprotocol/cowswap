import { TradeQuoteState } from '../state/tradeQuoteAtom'

export function getAreAllQuotesReceived(state: TradeQuoteState): boolean {
  return !state.pendingQuotes
}

export function getIsSameTradeQuoteRefreshing(state: TradeQuoteState): boolean {
  return !!state.quote && !state.isQuoteOutdated && !!state.pendingQuotes && !state.pendingQuotes.hasParamsChanged
}
