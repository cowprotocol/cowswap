import { TradeQuoteState } from 'modules/tradeQuote'

import { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'

export function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error?.type === GpQuoteErrorCodes.UnsupportedToken
}
