import { QuoteApiErrorCodes } from '../../api/cowProtocol/errors/QuoteError'
import { TradeQuoteState } from '../../modules/tradeQuote'

export function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error?.type === QuoteApiErrorCodes.UnsupportedToken
}
