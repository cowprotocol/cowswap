import { capitalizeFirstLetter, getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { getIsOrderBookTypedError } from 'api/gnosisProtocol'

export const USER_SWAP_REJECTED_ERROR = 'User rejected signing the order'

export function getSwapErrorMessage(error: Error): string {
  if (isRejectRequestProviderError(error)) {
    return USER_SWAP_REJECTED_ERROR
  } else {
    const defaultErrorMessage = getProviderErrorMessage(error)

    if (getIsOrderBookTypedError(error)) {
      return capitalizeFirstLetter(error.body?.description) || defaultErrorMessage
    }

    return defaultErrorMessage
  }
}
