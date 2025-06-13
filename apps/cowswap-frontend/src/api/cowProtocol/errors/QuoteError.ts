import { ApiErrorCodes, ApiErrorObject } from './OperatorError'

export interface QuoteApiErrorObject {
  errorType: QuoteApiErrorCodes
  description: string
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
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

export class QuoteApiError extends Error {
  name = 'QuoteErrorObject'
  type: QuoteApiErrorCodes
  description: string
  // any data attached
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any

  // Status 400 errors
  // https://github.com/cowprotocol/services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static quoteErrorDetails = QuoteApiErrorDetails

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public static async getErrorMessage(response: Response) {
    try {
      const orderPostError: QuoteApiErrorObject = await response.json()

      if (orderPostError.errorType) {
        const errorMessage = QuoteApiError.quoteErrorDetails[orderPostError.errorType]
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType
      } else {
        console.error('Unknown reason for bad quote fetch', orderPostError)
        return orderPostError.description
      }
    } catch {
      console.error('Error handling 400/404 error. Likely a problem deserialising the JSON response')
      return QuoteApiError.quoteErrorDetails.UNHANDLED_ERROR
    }
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static async getErrorFromStatusCode(response: Response) {
    switch (response.status) {
      case 400:
      case 404:
        return this.getErrorMessage(response)

      case 500:
      default:
        console.error(
          '[QuoteError::getErrorFromStatusCode] Error fetching quote, status code:',
          response.status || 'unknown',
        )
        return 'Error fetching quote'
    }
  }
  constructor(quoteError: QuoteApiErrorObject) {
    super(quoteError.description)

    this.type = quoteError.errorType
    this.description = quoteError.description
    this.message = QuoteApiError.quoteErrorDetails[quoteError.errorType]
    this.data = quoteError?.data
  }
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidQuoteError(error: any): error is QuoteApiError {
  return error instanceof QuoteApiError
}
