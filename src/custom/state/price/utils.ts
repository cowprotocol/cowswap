import { QuoteErrorCodes } from 'utils/operator/errors/QuoteError'

export function isFeeGreaterThanPriceError(error?: QuoteErrorCodes): boolean {
  return error === QuoteErrorCodes.FeeExceedsFrom
}

export function isInsufficientLiquidityError(error?: QuoteErrorCodes): boolean {
  return error === QuoteErrorCodes.InsufficientLiquidity
}

export function isUnhandledQuoteError(error?: QuoteErrorCodes): boolean {
  return error === QuoteErrorCodes.UNHANDLED_ERROR
}
