import { TradeQuoteState } from 'modules/tradeQuote'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

export function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error?.type === QuoteApiErrorCodes.UnsupportedToken
}
