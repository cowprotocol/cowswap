import { ApiErrorCodes, ApiErrorObject } from './OperatorError'

export interface GpQuoteErrorObject {
  errorType: GpQuoteErrorCodes
  description: string
  data?: any
}

// Conforms to backend API
// https://github.com/cowprotocol/services/blob/main/crates/orderbook/openapi.yml
export enum GpQuoteErrorCodes {
  UnsupportedToken = 'UnsupportedToken',
  InsufficientLiquidity = 'InsufficientLiquidity',
  FeeExceedsFrom = 'FeeExceedsFrom',
  ZeroPrice = 'ZeroPrice',
  TransferEthToContract = 'TransferEthToContract',
  SameBuyAndSellToken = 'SameBuyAndSellToken',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR',
}

export const SENTRY_IGNORED_GP_QUOTE_ERRORS = [GpQuoteErrorCodes.FeeExceedsFrom]

export enum GpQuoteErrorDetails {
  UnsupportedToken = 'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  InsufficientLiquidity = 'Token pair selected has insufficient liquidity.',
  FeeExceedsFrom = 'Current fee exceeds entered "from" amount.',
  ZeroPrice = 'Quoted price is zero. This is likely due to a significant price difference between the two tokens. Please try increasing amounts.',
  TransferEthToContract = 'Buying native currencies using smart contract wallets is not currently supported.',
  SameBuyAndSellToken = 'You are trying to buy and sell the same token.',
  SellAmountDoesNotCoverFee = 'The selling amount for the order is lower than the fee.',
  UNHANDLED_ERROR = 'Quote fetch failed. This may be due to a server or network connectivity issue. Please try again later.',
}

export function mapOperatorErrorToQuoteError(error?: ApiErrorObject): GpQuoteErrorObject {
  switch (error?.errorType) {
    case ApiErrorCodes.NotFound:
    case ApiErrorCodes.NoLiquidity:
      return {
        errorType: GpQuoteErrorCodes.InsufficientLiquidity,
        description: GpQuoteErrorDetails.InsufficientLiquidity,
      }

    case ApiErrorCodes.SellAmountDoesNotCoverFee:
      return {
        errorType: GpQuoteErrorCodes.FeeExceedsFrom,
        description: GpQuoteErrorDetails.FeeExceedsFrom,
        data: error?.data,
      }

    case ApiErrorCodes.UnsupportedToken:
      return {
        errorType: GpQuoteErrorCodes.UnsupportedToken,
        description: error.description,
      }
    case ApiErrorCodes.TransferEthToContract:
      return {
        errorType: GpQuoteErrorCodes.TransferEthToContract,
        description: error.description,
      }

    case ApiErrorCodes.SameBuyAndSellToken:
      return {
        errorType: GpQuoteErrorCodes.SameBuyAndSellToken,
        description: GpQuoteErrorDetails.SameBuyAndSellToken,
      }

    default:
      return { errorType: GpQuoteErrorCodes.UNHANDLED_ERROR, description: GpQuoteErrorDetails.UNHANDLED_ERROR }
  }
}

// TODO: rename it or delete it
export default class GpQuoteError extends Error {
  name = 'QuoteErrorObject'
  type: GpQuoteErrorCodes
  description: string
  // any data attached
  data?: any

  // Status 400 errors
  // https://github.com/cowprotocol/services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static quoteErrorDetails = GpQuoteErrorDetails

  public static async getErrorMessage(response: Response) {
    try {
      const orderPostError: GpQuoteErrorObject = await response.json()

      if (orderPostError.errorType) {
        const errorMessage = GpQuoteError.quoteErrorDetails[orderPostError.errorType]
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType
      } else {
        console.error('Unknown reason for bad quote fetch', orderPostError)
        return orderPostError.description
      }
    } catch (error: any) {
      console.error('Error handling 400/404 error. Likely a problem deserialising the JSON response')
      return GpQuoteError.quoteErrorDetails.UNHANDLED_ERROR
    }
  }

  static async getErrorFromStatusCode(response: Response) {
    switch (response.status) {
      case 400:
      case 404:
        return this.getErrorMessage(response)

      case 500:
      default:
        console.error(
          '[QuoteError::getErrorFromStatusCode] Error fetching quote, status code:',
          response.status || 'unknown'
        )
        return 'Error fetching quote'
    }
  }
  constructor(quoteError: GpQuoteErrorObject) {
    super(quoteError.description)

    this.type = quoteError.errorType
    this.description = quoteError.description
    this.message = GpQuoteError.quoteErrorDetails[quoteError.errorType]
    this.data = quoteError?.data
  }
}

export function isValidQuoteError(error: any): error is GpQuoteError {
  return error instanceof GpQuoteError
}
