import { ApiErrorCodes, ApiErrorObject } from './OperatorError'

interface QuoteApiErrorObject {
  errorType: QuoteApiErrorCodes
  description: string
  data?: unknown
}

// Conforms to backend API
// https://github.com/cowprotocol/services/blob/main/crates/orderbook/openapi.yml
export enum QuoteApiErrorCodes {
  UnsupportedToken = 'UnsupportedToken',
  InsufficientLiquidity = 'InsufficientLiquidity',
  FeeExceedsFrom = 'FeeExceedsFrom',
  ZeroPrice = 'ZeroPrice',
  TransferEthToContract = 'TransferEthToContract',
  SameBuyAndSellToken = 'SameBuyAndSellToken',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR',
}

export const SENTRY_IGNORED_QUOTE_ERRORS = [QuoteApiErrorCodes.FeeExceedsFrom]

export enum QuoteApiErrorDetails {
  UnsupportedToken = 'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  InsufficientLiquidity = 'Token pair selected has insufficient liquidity.',
  FeeExceedsFrom = 'Current fee exceeds entered "from" amount.',
  ZeroPrice = 'Quoted price is zero. This is likely due to a significant price difference between the two tokens. Please try increasing amounts.',
  TransferEthToContract = 'Buying native currencies using smart contract wallets is not currently supported.',
  SameBuyAndSellToken = 'You are trying to buy and sell the same token.',
  SellAmountDoesNotCoverFee = 'The selling amount for the order is lower than the fee.',
  UNHANDLED_ERROR = 'Quote fetch failed. This may be due to a server or network connectivity issue. Please try again later.',
}

export function mapOperatorErrorToQuoteError(error?: ApiErrorObject): QuoteApiErrorObject {
  switch (error?.errorType) {
    case ApiErrorCodes.NotFound:
    case ApiErrorCodes.NoLiquidity:
      return {
        errorType: QuoteApiErrorCodes.InsufficientLiquidity,
        description: QuoteApiErrorDetails.InsufficientLiquidity,
      }

    case ApiErrorCodes.SellAmountDoesNotCoverFee:
      return {
        errorType: QuoteApiErrorCodes.FeeExceedsFrom,
        description: QuoteApiErrorDetails.FeeExceedsFrom,
        data: error?.data,
      }

    case ApiErrorCodes.UnsupportedToken:
      return {
        errorType: QuoteApiErrorCodes.UnsupportedToken,
        description: error.description,
      }
    case ApiErrorCodes.TransferEthToContract:
      return {
        errorType: QuoteApiErrorCodes.TransferEthToContract,
        description: error.description,
      }

    case ApiErrorCodes.SameBuyAndSellToken:
      return {
        errorType: QuoteApiErrorCodes.SameBuyAndSellToken,
        description: QuoteApiErrorDetails.SameBuyAndSellToken,
      }

    default:
      return { errorType: QuoteApiErrorCodes.UNHANDLED_ERROR, description: QuoteApiErrorDetails.UNHANDLED_ERROR }
  }
}

export class QuoteApiError<Data = unknown> extends Error {
  name = 'QuoteErrorObject'
  type: QuoteApiErrorCodes
  description: string
  data?: Data

  constructor(quoteError: QuoteApiErrorObject) {
    super(quoteError.description)

    this.type = quoteError.errorType
    this.description = quoteError.description
    this.message = QuoteApiErrorDetails[quoteError.errorType]
    this.data = quoteError?.data as Data
  }
}

export function isValidQuoteError(error: unknown): error is QuoteApiError {
  return error instanceof QuoteApiError
}
