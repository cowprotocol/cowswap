import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import {
  capitalizeFirstLetter,
  getProviderErrorMessage,
  isInsufficientFundsProviderError,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'
import { OrderBookApiError, type SupportedChainId } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { OperatorError } from 'api/cowProtocol/errors/OperatorError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'

// Not translated: compared against directly for Sentry/analytics de-duping (see
// cow-react/sentry/index.ts and tradeFlowAnalytics.ts), which needs a stable literal value.
export const USER_SWAP_REJECTED_ERROR = 'User rejected signing the order'

export function getSwapErrorMessage(error: Error, chainId: SupportedChainId): string {
  if (isRejectRequestProviderError(error)) {
    return USER_SWAP_REJECTED_ERROR
  }
  if (isInsufficientFundsProviderError(error)) {
    // The native gas currency varies by chain (ETH, xDAI, MATIC, BNB, AVAX, ...).
    const nativeCurrencySymbol = NATIVE_CURRENCIES[chainId]?.symbol || 'native currency'
    return t`You don't have enough ${nativeCurrencySymbol} to cover the network fee. Reduce the amount or add more ${nativeCurrencySymbol} to your wallet.`
  }
  if (isBlockhashExpiredError(error)) {
    return t`Transaction blockhash expired. Sign a new one.`
  }

  return getApiErrorMessage(error) || getProviderErrorMessage(error) || String(error)
}

/**
 * The reason the order book gave, whether or not we have copy of our own for that error type.
 * Without the untyped fallback an error type we don't know shows as a bare "Error": browsers report
 * an empty `statusText` over HTTP/2, so the raw error has no message to stringify.
 */
function getApiErrorMessage(error: unknown): string | undefined {
  if (isValidOperatorError(error)) {
    return capitalizeFirstLetter(error.message)
  }
  if (getIsOrderBookTypedError(error)) {
    return capitalizeFirstLetter(error.body.description)
  }

  return undefined
}

function isBlockhashExpiredError(error: unknown): boolean {
  return error instanceof OrderBookApiError && error.body.errorType === 'BlockhashExpired'
}

function isValidOperatorError(error: unknown): error is OperatorError {
  return error instanceof OperatorError
}
