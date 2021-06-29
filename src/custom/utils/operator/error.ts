export interface ApiError {
  errorType: ApiErrorCodes
  description: string
}

// Conforms to backend API
// https://github.com/gnosis/gp-v2-services/blob/0bd5f7743bebaa5acd3be13e35ede2326a096f14/orderbook/openapi.yml#L562
export enum ApiErrorCodes {
  DuplicateOrder = 'DuplicateOrder',
  InvalidSignature = 'InvalidSignature',
  MissingOrderData = 'MissingOrderData',
  InsufficientValidTo = 'InsufficientValidTo',
  InsufficientFunds = 'InsufficientFunds',
  InsufficientFee = 'InsufficientFee',
  UnsupportedToken = 'UnsupportedToken',
  WrongOwner = 'WrongOwner',
  NotFound = 'NotFound',
  FeeExceedsFrom = 'FeeExceedsFrom'
}

export enum ApiErrorCodeDetails {
  DuplicateOrder = 'There was another identical order already submitted. Please try again.',
  InsufficientFee = "The signed fee is insufficient. It's possible that is higher now due to a change in the gas price, ether price, or the sell token price. Please try again to get an updated fee quote.",
  InvalidSignature = 'The order signature is invalid. Check whether your Wallet app supports off-chain signing.',
  MissingOrderData = 'The order has missing information',
  InsufficientValidTo = 'The order you are signing is already expired. This can happen if you set a short expiration in the settings and waited too long before signing the transaction. Please try again.',
  InsufficientFunds = "The account doesn't have enough funds",
  UnsupportedToken = 'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  WrongOwner = "The signature is invalid.\n\nIt's likely that the signing method provided by your wallet doesn't comply with the standards required by CowSwap.\n\nCheck whether your Wallet app supports off-chain signing (EIP-712 or ETHSIGN).",
  NotFound = 'Token pair selected has insufficient liquidity',
  FeeExceedsFrom = 'Fee amount for selected pair exceeds "from" amount',
  UNHANDLED_ERROR = 'The order was not accepted by the network'
}

export default class OperatorError extends Error {
  name = 'OperatorError'
  type: ApiErrorCodes
  description: ApiError['description']

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static apiErrorDetails = ApiErrorCodeDetails

  private static async _getErrorMessage(response: Response) {
    try {
      const orderPostError: ApiError = await response.json()

      if (orderPostError.errorType) {
        const errorMessage = OperatorError.apiErrorDetails[orderPostError.errorType]

        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || 'Error type exists but no valid error details found.'
      } else {
        console.error('Unknown reason for bad order submission', orderPostError)
        return orderPostError.description
      }
    } catch (error) {
      console.error('Error handling a 400/404 error. Likely a problem deserialising the JSON response')
      return OperatorError.apiErrorDetails.UNHANDLED_ERROR
    }
  }

  static async getErrorFromStatusCode(response: Response) {
    switch (response.status) {
      case 400:
      case 404:
        return this._getErrorMessage(response)

      case 403:
        return 'The order cannot be accepted. Your account is deny-listed.'

      case 429:
        return 'The order cannot be accepted. Too many order placements. Please, retry in a minute'

      case 500:
      default:
        console.error(
          '[OperatorError::getErrorFromStatusCode] Error adding an order, status code:',
          response.status || 'unknown'
        )
        return 'Error adding an order'
    }
  }
  constructor(apiError: ApiError) {
    super(apiError.description)

    this.type = apiError.errorType
    this.description = apiError.description
    this.message = OperatorError.apiErrorDetails[apiError.errorType]
  }
}
