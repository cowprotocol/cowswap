import { TradeQuoteState } from '../state/tradeQuoteAtom'

export function getAreAllQuotesReceived(state: TradeQuoteState): boolean {
  return !state.pendingQuotes
}
