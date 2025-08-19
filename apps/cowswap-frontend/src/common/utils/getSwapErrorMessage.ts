import { capitalizeFirstLetter, getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { isValidOperatorError } from 'api/cowProtocol/errors/OperatorError'

const getUserSwapRejectedError = (): string => t`User rejected signing the order`

export const USER_SWAP_REJECTED_ERROR = getUserSwapRejectedError()

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
