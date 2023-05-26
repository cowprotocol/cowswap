import { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'
import { TradeQuoteState } from 'modules/tradeQuote'

export function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error?.type === GpQuoteErrorCodes.UnsupportedToken
}
