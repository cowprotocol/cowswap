export interface QuoteApiErrorObject {
  errorType: QuoteApiErrorCodes
  description: string
  data?: unknown
}

// TODO: import from SDK `PriceEstimationError.errorType`
export enum QuoteApiErrorCodes {
  AppDataHashMismatch = 'AppDataHashMismatch',
  CustomSolverError = 'CustomSolverError',
  ExcessiveValidTo = 'ExcessiveValidTo',
  Forbidden = 'Forbidden',
  InsufficientLiquidity = 'InsufficientLiquidity',
  InsufficientValidTo = 'InsufficientValidTo',
  InternalServerError = 'InternalServerError',
  InvalidAppData = 'InvalidAppData',
  InvalidNativeSellToken = 'InvalidNativeSellToken',
  NoLiquidity = 'NoLiquidity',
  QuoteNotVerified = 'QuoteNotVerified',
  SameBuyAndSellToken = 'SameBuyAndSellToken',
  SellAmountDoesNotCoverFee = 'SellAmountDoesNotCoverFee',
  TokenTemporarilySuspended = 'TokenTemporarilySuspended',
  TradingOutsideAllowedWindow = 'TradingOutsideAllowedWindow',
  UnsupportedBuyTokenDestination = 'UnsupportedBuyTokenDestination',
  UnsupportedOrderType = 'UnsupportedOrderType',
  UnsupportedSellTokenSource = 'UnsupportedSellTokenSource',
  UnsupportedToken = 'UnsupportedToken',
}

/**
 * Errors that are expected to happen on regular basis
 */
export const SENTRY_IGNORED_QUOTE_ERRORS = [
  QuoteApiErrorCodes.InsufficientLiquidity,
  QuoteApiErrorCodes.SellAmountDoesNotCoverFee,
  QuoteApiErrorCodes.TokenTemporarilySuspended,
  QuoteApiErrorCodes.TradingOutsideAllowedWindow,
  QuoteApiErrorCodes.UnsupportedToken,
]

const UNHANDLED_ERROR_CODE = 'UNHANDLED_ERROR' as const

const UNHANDLED_ERROR_DESC =
  'Quote fetch failed. This may be due to a server or network connectivity issue. Please try again later.'

export class QuoteApiError<Data = unknown> extends Error {
  name = 'QuoteApiError'
  type: QuoteApiErrorCodes | typeof UNHANDLED_ERROR_CODE
  description: string
  data?: Data

  constructor(quoteError: QuoteApiErrorObject | string) {
    super(typeof quoteError === 'string' ? quoteError : quoteError.description)

    if (typeof quoteError === 'string') {
      this.type = UNHANDLED_ERROR_CODE
      this.description = UNHANDLED_ERROR_DESC
      this.message = quoteError
      return
    }

    this.type = quoteError.errorType
    this.description = quoteError.description
    this.message = quoteError.description
    this.data = quoteError?.data as Data
  }
}
