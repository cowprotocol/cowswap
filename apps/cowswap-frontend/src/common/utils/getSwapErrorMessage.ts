import {
  capitalizeFirstLetter,
  getProviderErrorMessage,
  isInsufficientFundsProviderError,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'

import { OperatorError } from 'api/cowProtocol/errors/OperatorError'

export const USER_SWAP_REJECTED_ERROR = 'User rejected signing the order'
export const INSUFFICIENT_FUNDS_FOR_GAS_ERROR =
  "You don't have enough ETH to cover the network fee. Reduce the amount or add more ETH to your wallet."

export function getSwapErrorMessage(error: Error): string {
  if (isRejectRequestProviderError(error)) {
    return USER_SWAP_REJECTED_ERROR
  } else if (isInsufficientFundsProviderError(error)) {
    return INSUFFICIENT_FUNDS_FOR_GAS_ERROR
  } else {
    const defaultErrorMessage = getProviderErrorMessage(error) || String(error)

    if (isValidOperatorError(error)) {
      return capitalizeFirstLetter(error.message) || defaultErrorMessage
    }

    return defaultErrorMessage
  }
}

function isValidOperatorError(error: unknown): error is OperatorError {
  return error instanceof OperatorError
}
