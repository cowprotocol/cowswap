type ApiActionType = 'get' | 'create' | 'delete'

export interface ApiErrorObject {
  errorType: ApiErrorCodes
  description: string
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

// Conforms to backend API
// https://github.com/cowprotocol/services/blob/d66ff0b0c5a187264f3b0f86810ef04da21255e8/crates/orderbook/openapi.yml#L1214-L1239
export enum ApiErrorCodes {
  AlreadyCancelled = 'AlreadyCancelled',
  AmountIsZero = 'AmountIsZero',
  AppDataHashMismatch = 'AppDataHashMismatch',
  AppdataFromMismatch = 'AppdataFromMismatch',
  DuplicateOrder = 'DuplicateOrder',
  ExcessiveValidTo = 'ExcessiveValidTo',
  IncompatibleSigningScheme = 'IncompatibleSigningScheme',
  InsufficientAllowance = 'InsufficientAllowance',
  InsufficientBalance = 'InsufficientBalance',
  InsufficientFee = 'InsufficientFee',
  InsufficientValidTo = 'InsufficientValidTo',
  InvalidAppData = 'InvalidAppData',
  InvalidEip1271Signature = 'InvalidEip1271Signature',
  InvalidNativeSellToken = 'InvalidNativeSellToken',
  InvalidQuote = 'InvalidQuote',
  InvalidSignature = 'InvalidSignature',
  MissingFrom = 'MissingFrom',
  MissingOrderData = 'MissingOrderData',
  NoLiquidity = 'NoLiquidity',
  NotFound = 'NotFound',
  OrderExpired = 'OrderExpired',
  OrderFullyExecuted = 'OrderFullyExecuted',
  OrderNotFound = 'OrderNotFound',
  QuoteNotFound = 'QuoteNotFound',
  SameBuyAndSellToken = 'SameBuyAndSellToken',
  SellAmountDoesNotCoverFee = 'SellAmountDoesNotCoverFee',
  SellAmountOverflow = 'SellAmountOverflow',
  TooManyLimitOrders = 'TooManyLimitOrders',
  TransferEthToContract = 'TransferEthToContract',
  TransferSimulationFailed = 'TransferSimulationFailed',
  UnsupportedBuyTokenDestination = 'UnsupportedBuyTokenDestination',
  UnsupportedOrderType = 'UnsupportedOrderType',
  UnsupportedSellTokenSource = 'UnsupportedSellTokenSource',
  UnsupportedToken = 'UnsupportedToken',
  WrongOwner = 'WrongOwner',
  ZeroAmount = 'ZeroAmount',
  UNHANDLED_GET_ERROR = 'UNHANDLED_GET_ERROR',
  UNHANDLED_CREATE_ERROR = 'UNHANDLED_CREATE_ERROR',
  UNHANDLED_DELETE_ERROR = 'UNHANDLED_DELETE_ERROR',
}

export enum ApiErrorCodeDetails {
  AlreadyCancelled = 'Order is already cancelled.',
  AmountIsZero = 'Cannot place order with 0 amounts.',
  AppDataHashMismatch = 'AppDataHashMismatch',
  AppdataFromMismatch = 'AppdataFromMismatch',
  DuplicateOrder = 'There was another identical order already submitted. Please try again.',
  ExcessiveValidTo = 'Order expiration too far in the future. Please try again with a shorter expiration.',
  IncompatibleSigningScheme = 'IncompatibleSigningScheme',
  InsufficientAllowance = 'The account needs to approve the selling token in order to trade.',
  InsufficientBalance = "The account doesn't have enough funds.",
  InsufficientFee = "The signed fee is insufficient. It's possible that is higher now due to a change in the gas price, ether price, or the sell token price. Please try again to get an updated fee quote.",
  InsufficientValidTo = 'The order you are signing is already expired. This can happen if you set a short expiration in the settings and waited too long before signing the transaction. Please try again.',
  InvalidAppData = 'InvalidAppData',
  InvalidEip1271Signature = 'InvalidEip1271Signature',
  InvalidNativeSellToken = 'InvalidNativeSellToken',
  InvalidQuote = 'InvalidQuote',
  InvalidSignature = 'The order signature is invalid. Check whether your Wallet app supports off-chain signing.',
  MissingFrom = 'MissingFrom',
  MissingOrderData = 'The order has missing information.',
  NoLiquidity = 'Token pair selected has insufficient liquidity.',
  NotFound = 'Token is not found.',
  OrderExpired = 'Order is expired.',
  OrderFullyExecuted = 'Order is already filled.',
  OrderNotFound = 'The order you are trying to cancel does not exist.',
  QuoteNotFound = 'Quote expired. Please try again and sign the order faster.',
  SameBuyAndSellToken = 'Sell and buy token can not be the same.',
  SellAmountDoesNotCoverFee = 'Sell amount does not sufficiently cover the current fee.',
  SellAmountOverflow = 'SellAmountOverflow',
  TooManyLimitOrders = 'The limit of open limit orders has been reached. You can currently have up to 50 open limit orders.',
  TransferEthToContract = 'Sending native currency to smart contract wallets is not currently supported.',
  TransferSimulationFailed = 'Transfer simulation of native currency failed. This is likely due to the current unsupported state of smart contract wallets.',
  UnsupportedBuyTokenDestination = 'Buy token destination is unsupported. Please try again with a different destination.',
  UnsupportedOrderType = 'Order type unsupported. Please try again with a different order type.',
  UnsupportedSellTokenSource = 'Sell token source is unsupported. Please try again with a different source.',
  UnsupportedToken = 'One of the tokens you are trading is unsupported. Please read the FAQ for more info.',
  WrongOwner = "The signature is invalid.\n\nIt's likely that the signing method provided by your wallet doesn't comply with the standards required by CoW Swap.\n\nCheck whether your Wallet app supports off-chain signing (EIP-712 or ETHSIGN).",
  ZeroAmount = 'Order amount cannot be zero.',
  UNHANDLED_GET_ERROR = 'Order fetch failed. This may be due to a server or network connectivity issue. Please try again later.',
  UNHANDLED_CREATE_ERROR = 'The order was not accepted by the network.',
  UNHANDLED_DELETE_ERROR = 'The order cancellation was not accepted by the network.',
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _mapActionToErrorDetail(action?: ApiActionType) {
  switch (action) {
    case 'get':
      return ApiErrorCodeDetails.UNHANDLED_GET_ERROR
    case 'create':
      return ApiErrorCodeDetails.UNHANDLED_CREATE_ERROR
    case 'delete':
      return ApiErrorCodeDetails.UNHANDLED_DELETE_ERROR
    default:
      console.error(
        '[OperatorError::_mapActionToErrorDetails] Uncaught error mapping error action type to server error. Please try again later.',
      )
      return 'Something failed. Please try again later.'
  }
}

export default class OperatorError extends Error {
  name = 'OperatorError'
  type: ApiErrorCodes
  description: ApiErrorObject['description']

  // Status 400 errors
  // https://github.com/cowprotocol/services/blob/9014ae55412a356e46343e051aefeb683cc69c41/orderbook/openapi.yml#L563
  static apiErrorDetails = ApiErrorCodeDetails

  public static getErrorMessage(orderPostError: ApiErrorObject, action: ApiActionType): string {
    try {
      if (orderPostError.errorType) {
        const errorMessage = OperatorError.apiErrorDetails[orderPostError.errorType]
        // shouldn't fall through as this error constructor expects the error code to exist but just in case
        return errorMessage || orderPostError.errorType
      } else {
        console.error('Unknown reason for bad order submission', orderPostError)
        return orderPostError.description
      }
    } catch {
      console.error('Error handling a 400 error. Likely a problem deserialising the JSON response')
      return _mapActionToErrorDetail(action)
    }
  }
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  static getErrorFromStatusCode(statusCode: number, errorObject: ApiErrorObject, action: 'create' | 'delete'): string {
    switch (statusCode) {
      case 400:
      case 404:
        return this.getErrorMessage(errorObject, action)

      case 403:
        return `The order cannot be ${action === 'create' ? 'accepted' : 'cancelled'}. Your account is deny-listed.`

      case 429:
        return `The order cannot be ${
          action === 'create' ? 'accepted. Too many order placements' : 'cancelled. Too many order cancellations'
        }. Please, retry in a minute`

      case 500:
      default:
        console.error(
          `[OperatorError::getErrorFromStatusCode] Error ${
            action === 'create' ? 'creating' : 'cancelling'
          } the order, status code:`,
          statusCode || 'unknown',
        )
        return `Error ${action === 'create' ? 'creating' : 'cancelling'} the order`
    }
  }
  constructor(apiError: ApiErrorObject) {
    super(apiError.description)

    this.type = apiError.errorType
    this.description = apiError.description
    const message = ApiErrorCodeDetails[apiError.errorType]
    // In case we don't have a custom message, use the one provided by the backend in the description
    this.message = message === this.type.toString() ? this.description : message
  }
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidOperatorError(error: any): error is OperatorError {
  return error instanceof OperatorError
}
