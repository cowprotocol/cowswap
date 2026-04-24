import { isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

const MAX_ERROR_DEPTH = 8

function isUserRejectionError(error: unknown, depth = 0): boolean {
  if (depth > MAX_ERROR_DEPTH || error === null || error === undefined) {
    return false
  }
  if (isRejectRequestProviderError(error)) {
    return true
  }
  if (error instanceof Error && 'cause' in error && error.cause !== undefined) {
    return isUserRejectionError(error.cause, depth + 1)
  }
  return false
}

function collectErrorMessageFromObject(error: object): string {
  return 'message' in error ? String((error as { message: unknown }).message) : ''
}

/**
 * Flattens `Error` + nested `cause` messages (viem / WalletConnect often nest "Request expired" here).
 */
function collectErrorMessages(error: unknown, depth = 0): string {
  if (depth > MAX_ERROR_DEPTH) {
    return ''
  }
  if (error === null || error === undefined) {
    return ''
  }
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    const nested = 'cause' in error && error.cause !== undefined ? collectErrorMessages(error.cause, depth + 1) : ''
    return [error.message, nested].filter(Boolean).join(' ')
  }
  if (typeof error === 'object') {
    return collectErrorMessageFromObject(error)
  }
  return ''
}

function getInvalidArgumentError(flatMessage: string): string | undefined {
  if (flatMessage.includes('INVALID_ARGUMENT')) {
    const matches = flatMessage.match(/argument="([^"]+)"/)
    const invalidArgument = matches?.length ? matches[1] : ''

    if (invalidArgument) {
      return t`Invalid argument "${invalidArgument}" provided`
    }
  }
  return undefined
}

function getWalletRequestExpiredMessage(flatMessage: string): string | undefined {
  const lower = flatMessage.toLowerCase()
  if (lower.includes('request expired')) {
    return t`The wallet request timed out. Please try again and complete signing in your wallet before the session expires.`
  }
  return undefined
}

export function getErrorMessage(error: unknown): string {
  const DEFAULT_ERROR_MESSAGE = t`Something went wrong creating your order`

  if (isUserRejectionError(error)) {
    return t`User rejected transaction`
  }

  const flat = collectErrorMessages(error)

  return getInvalidArgumentError(flat) || getWalletRequestExpiredMessage(flat) || flat || DEFAULT_ERROR_MESSAGE
}
