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
  WrongOwner = 'WrongOwner'
}

export interface ApiError {
  errorType: ApiErrorCodes
  description: string
}

const API_ERROR_CODE_DESCRIPTIONS = {
  [ApiErrorCodes.DuplicateOrder]: 'There was another identical order already submitted',
  [ApiErrorCodes.InsufficientFee]: "The account doesn't have enough funds",
  [ApiErrorCodes.InvalidSignature]: 'The order signature is invalid',
  [ApiErrorCodes.MissingOrderData]: 'The order has missing information',
  [ApiErrorCodes.InsufficientValidTo]: "The account doesn't have enough funds",
  [ApiErrorCodes.InsufficientFunds]: "The account doesn't have enough funds",
  [ApiErrorCodes.UnsupportedToken]: 'An unsupported token was detected',
  [ApiErrorCodes.WrongOwner]: 'An invalid owner address was given',
  UNHANDLED_ERROR: 'The order was not accepted by the network'
}

export default class OperatorError extends Error {
  name = 'OperatorError'
  type: ApiErrorCodes
  description: ApiError['description']

  // Status 400 errors
  // https://github.com/gnosis/gp-v2-services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static apiErrorDetails = API_ERROR_CODE_DESCRIPTIONS

  static async getErrorMessage(response: Response) {
    try {
      const orderPostError: ApiError = await response.json()

      if (orderPostError.errorType) {
        return OperatorError.apiErrorDetails[orderPostError.errorType]
      } else {
        console.error('Unknown reason for bad order submission', orderPostError)
        return orderPostError.description
      }
    } catch (error) {
      console.error('Error handling a 400 error. Likely a problem deserialising the JSON response')
      return OperatorError.apiErrorDetails.UNHANDLED_ERROR
    }
  }
  static async getErrorForUnsuccessfulPostOrder(response: Response) {
    switch (response.status) {
      case 400:
        return this.getErrorMessage(response)

      case 403:
        return 'The order cannot be accepted. Your account is deny-listed.'

      case 429:
        return 'The order cannot be accepted. Too many order placements. Please, retry in a minute'

      case 500:
      default:
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
