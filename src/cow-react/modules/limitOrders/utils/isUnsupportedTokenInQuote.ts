import { LimitOrdersQuoteState } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { GpQuoteErrorCodes } from '@cow/api/gnosisProtocol/errors/QuoteError'

export function isUnsupportedTokenInQuote(state: LimitOrdersQuoteState): boolean {
  return state.error?.type === GpQuoteErrorCodes.UnsupportedToken
}
