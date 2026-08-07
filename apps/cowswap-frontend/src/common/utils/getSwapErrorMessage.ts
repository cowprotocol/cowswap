import {
  capitalizeFirstLetter,
  getProviderErrorMessage,
  isInsufficientFundsProviderError,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { OperatorError } from 'api/cowProtocol/errors/OperatorError'

// Not translated: compared against directly for Sentry/analytics de-duping (see
// cow-react/sentry/index.ts and tradeFlowAnalytics.ts), which needs a stable literal value.
export const USER_SWAP_REJECTED_ERROR = 'User rejected signing the order'

export function getSwapErrorMessage(error: Error): string {
  if (isRejectRequestProviderError(error)) {
    return USER_SWAP_REJECTED_ERROR
  } else if (isInsufficientFundsProviderError(error)) {
    return t`You don't have enough ETH to cover the network fee. Reduce the amount or add more ETH to your wallet.`
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
