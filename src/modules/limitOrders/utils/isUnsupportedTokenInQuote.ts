import { LimitOrdersQuoteState } from 'modules/limitOrders/state/limitOrdersQuoteAtom'
import { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'

export function isUnsupportedTokenInQuote(state: LimitOrdersQuoteState): boolean {
  return state.error?.type === GpQuoteErrorCodes.UnsupportedToken
}
