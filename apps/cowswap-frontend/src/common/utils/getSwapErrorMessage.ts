import { capitalizeFirstLetter, getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { OperatorError } from 'api/cowProtocol/errors/OperatorError'

export const USER_SWAP_REJECTED_ERROR = 'User rejected signing the order'

export function getSwapErrorMessage(error: Error): string {
  if (isRejectRequestProviderError(error)) {
    return USER_SWAP_REJECTED_ERROR
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
