import { getProviderErrorMessage } from '@cowprotocol/common-utils'

interface ParsedWalletConnectionError {
  message: string
}

function isParsedWalletConnectionError(value: unknown): value is ParsedWalletConnectionError {
  return !!value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
}

function getParsedWalletConnectionErrorMessage(errorMessage: string): string | undefined {
  if (!errorMessage.trim().startsWith('{')) {
    return undefined
  }

  try {
    const parsedError = JSON.parse(errorMessage)

    return isParsedWalletConnectionError(parsedError) ? parsedError.message : undefined
  } catch {
    return undefined
  }
}

function getNormalizedWalletConnectionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error !== 'object' || error === null) {
    return String(error)
  }

  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

export function getWalletConnectionErrorMessage(error: unknown): string {
  const providerErrorMessage = getProviderErrorMessage(error)

  if (typeof providerErrorMessage === 'string') {
    return getParsedWalletConnectionErrorMessage(providerErrorMessage) || providerErrorMessage
  }

  return getNormalizedWalletConnectionErrorMessage(error)
}
