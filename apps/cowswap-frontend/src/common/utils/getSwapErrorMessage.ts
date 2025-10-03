import { capitalizeFirstLetter, getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { i18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

import { isValidOperatorError } from 'api/cowProtocol/errors/OperatorError'

export const USER_SWAP_REJECTED_ERROR: MessageDescriptor = msg`User rejected signing the order`

export function getSwapErrorMessage(error: Error): string {
  if (isRejectRequestProviderError(error)) {
    return i18n._(USER_SWAP_REJECTED_ERROR)
  } else {
    const defaultErrorMessage = getProviderErrorMessage(error) || String(error)

    if (isValidOperatorError(error)) {
      return capitalizeFirstLetter(error.message) || defaultErrorMessage
    }

    return defaultErrorMessage
  }
}
