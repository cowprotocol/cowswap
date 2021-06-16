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
  FeeExceedsFrom = 'FeeExceedsFrom',
  OrderNotFound = 'OrderNotFound'
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
  OrderNotFound = 'The order you are trying to cancel does not exist',
  UNHANDLED_CREATE_ERROR = 'The order was not accepted by the network',
  UNHANDLED_DELETE_ERROR = 'The order cancellation was not accepted by the network'
}

export default class OperatorError extends Error {
  name = 'OperatorError'
  type: ApiErrorCodes
  description: ApiError['description']

  static async getErrorMessage(response: Response, action: 'create' | 'delete') {
    try {
      const orderPostError: ApiError = await response.json()

      if (orderPostError.errorType) {
        return ApiErrorCodeDetails[orderPostError.errorType]
      } else {
        console.error('Unknown reason for bad order submission', orderPostError)
        return orderPostError.description
      }
    } catch (error) {
      console.error('Error handling a 400 error. Likely a problem deserialising the JSON response')
      return action === 'create'
        ? ApiErrorCodeDetails.UNHANDLED_CREATE_ERROR
        : ApiErrorCodeDetails.UNHANDLED_DELETE_ERROR
    }
  }
  static async getErrorFromStatusCode(response: Response, action: 'create' | 'delete') {
    switch (response.status) {
      case 400:
      case 404:
        return this.getErrorMessage(response, action)

      case 403:
        return `The order cannot be ${action === 'create' ? 'accepted' : 'cancelled'}. Your account is deny-listed.`

      case 429:
        return `The order cannot be ${
          action === 'create' ? 'accepted. Too many order placements' : 'cancelled. Too many order cancellations'
        }. Please, retry in a minute`

      case 500:
      default:
        return `Error ${action === 'create' ? 'creating' : 'cancelling'} the order`
    }
  }
  constructor(apiError: ApiError) {
    super(apiError.description)

    this.type = apiError.errorType
    this.description = apiError.description
    this.message = ApiErrorCodeDetails[apiError.errorType]
  }
}
