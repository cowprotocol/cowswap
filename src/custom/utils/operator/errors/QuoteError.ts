import { ApiErrorCodes } from './OperatorError'

export interface QuoteErrorObject {
  errorType: QuoteErrorCodes
  description: string
}

// Conforms to backend API
// https://github.com/gnosis/gp-v2-services/blob/0bd5f7743bebaa5acd3be13e35ede2326a096f14/orderbook/openapi.yml#L562
export enum QuoteErrorCodes {
  InsufficientLiquidity = 'InsufficientLiquidity',
  FeeExceedsFrom = 'FeeExceedsFrom',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR'
}

export enum QuoteErrorDetails {
  InsufficientLiquidity = 'Token pair selected has insufficient liquidity',
  FeeExceedsFrom = 'Current fee exceeds entered "from" amount',
  UNHANDLED_ERROR = 'Quote fetch failed. This may be due to a server or network connectivity issue. Please try again later.'
}

export function mapOperatorErrorToQuoteError(errorType?: ApiErrorCodes): QuoteErrorObject {
  switch (errorType) {
    case ApiErrorCodes.NotFound:
      return { errorType: QuoteErrorCodes.InsufficientLiquidity, description: QuoteErrorDetails.InsufficientLiquidity }
    default:
      return { errorType: QuoteErrorCodes.UNHANDLED_ERROR, description: QuoteErrorDetails.UNHANDLED_ERROR }
  }
}

export default class QuoteError extends Error {
  name = 'QuoteErrorObject'
  type: QuoteErrorCodes
  description: QuoteErrorObject['description']

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static quoteErrorDetails = QuoteErrorDetails

  public static async getErrorMessage(response: Response) {
    try {
      const orderPostError: QuoteErrorObject = await response.json()

      if (orderPostError.errorType) {
        const errorMessage = QuoteError.quoteErrorDetails[orderPostError.errorType]
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType
      } else {
        console.error('Unknown reason for bad quote fetch', orderPostError)
        return orderPostError.description
      }
    } catch (error) {
      console.error('Error handling 400/404 error. Likely a problem deserialising the JSON response')
      return QuoteError.quoteErrorDetails.UNHANDLED_ERROR
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
  constructor(quoteError: QuoteErrorObject) {
    super(quoteError.description)

    this.type = quoteError.errorType
    this.description = quoteError.description
    this.message = QuoteError.quoteErrorDetails[quoteError.errorType]
  }
}

export function isValidQuoteError(error: any): error is QuoteError {
  return error instanceof QuoteError
}
