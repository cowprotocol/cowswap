import { ApiErrorCodes } from 'utils/operator/error'

export function isFeeGreaterThanPriceError(error?: ApiErrorCodes): boolean {
  return error === ApiErrorCodes.FeeExceedsFrom
}

export function isInsufficientLiquidityError(error?: ApiErrorCodes): boolean {
  return error === ApiErrorCodes.NotFound
}
