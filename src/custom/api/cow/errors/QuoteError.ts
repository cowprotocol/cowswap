import { CowApiErrorCodes, CowApiErrorObject } from './ApiError'

export interface CowQuoteErrorObject {
  errorType: CowQuoteErrorCodes
  description: string
  data?: any
}

// Conforms to backend API
// https://github.com/gnosis/gp-v2-services/blob/main/crates/orderbook/openapi.yml
export enum CowQuoteErrorCodes {
  UnsupportedToken = 'UnsupportedToken',
  InsufficientLiquidity = 'InsufficientLiquidity',
  FeeExceedsFrom = 'FeeExceedsFrom',
  ZeroPrice = 'ZeroPrice',
  TransferEthToContract = 'TransferEthToContract',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR',
}

export enum CowQuoteErrorDetails {
  UnsupportedToken = 'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  InsufficientLiquidity = 'Token pair selected has insufficient liquidity.',
  FeeExceedsFrom = 'Current fee exceeds entered "from" amount.',
  ZeroPrice = 'Quoted price is zero. This is likely due to a significant price difference between the two tokens. Please try increasing amounts.',
  TransferEthToContract = 'Buying native currencies using smart contract wallets is not currently supported.',
  UNHANDLED_ERROR = 'Quote fetch failed. This may be due to a server or network connectivity issue. Please try again later.',
}

export function mapOperatorErrorToQuoteError(error?: CowApiErrorObject): CowQuoteErrorObject {
  switch (error?.errorType) {
    case CowApiErrorCodes.NotFound:
    case CowApiErrorCodes.NoLiquidity:
      return {
        errorType: CowQuoteErrorCodes.InsufficientLiquidity,
        description: CowQuoteErrorDetails.InsufficientLiquidity,
      }

    case CowApiErrorCodes.SellAmountDoesNotCoverFee:
      return {
        errorType: CowQuoteErrorCodes.FeeExceedsFrom,
        description: CowQuoteErrorDetails.FeeExceedsFrom,
        data: error?.data,
      }

    case CowApiErrorCodes.UnsupportedToken:
      return {
        errorType: CowQuoteErrorCodes.UnsupportedToken,
        description: error.description,
      }
    case CowApiErrorCodes.SellAmountDoesNotCoverFee:
      return {
        errorType: CowQuoteErrorCodes.FeeExceedsFrom,
        description: error.description,
      }

    case CowApiErrorCodes.TransferEthToContract:
      return {
        errorType: CowQuoteErrorCodes.TransferEthToContract,
        description: error.description,
      }
    default:
      return { errorType: CowQuoteErrorCodes.UNHANDLED_ERROR, description: CowQuoteErrorDetails.UNHANDLED_ERROR }
  }
}

export default class CowQuoteError extends Error {
  name = 'QuoteErrorObject'
  type: CowQuoteErrorCodes
  description: string
  // any data attached
  data?: any

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static quoteErrorDetails = CowQuoteErrorDetails

  public static async getErrorMessage(response: Response) {
    try {
      const orderPostError: CowQuoteErrorObject = await response.json()

      if (orderPostError.errorType) {
        const errorMessage = CowQuoteError.quoteErrorDetails[orderPostError.errorType]
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType
      } else {
        console.error('Unknown reason for bad quote fetch', orderPostError)
        return orderPostError.description
      }
    } catch (error) {
      console.error('Error handling 400/404 error. Likely a problem deserialising the JSON response')
      return CowQuoteError.quoteErrorDetails.UNHANDLED_ERROR
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
  constructor(quoteError: CowQuoteErrorObject) {
    super(quoteError.description)

    this.type = quoteError.errorType
    this.description = quoteError.description
    this.message = CowQuoteError.quoteErrorDetails[quoteError.errorType]
    this.data = quoteError?.data
  }
}

export function isValidQuoteError(error: any): error is CowQuoteError {
  return error instanceof CowQuoteError
}
