import { isAddress, isPrefixedAddress, parsePrefixedAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { hasEnsEnding, getMainnetEnsError } from '../../utils/recipientValidation'

interface ValidationResult {
  ensError: string | null
  customError: string | null
  hasError: boolean
}

// Helper function to determine if ENS should be resolved
export function shouldResolveENS(currentChain: SupportedChainId, destinationChain: SupportedChainId): boolean {
  return currentChain === SupportedChainId.MAINNET && destinationChain === SupportedChainId.MAINNET
}

// Helper function to create validation result
export function createValidationResult(
  value: string,
  shouldResolve: boolean,
  address: string | null,
  loading: boolean,
  customValidation?: (address: string) => string | null,
): ValidationResult {
  const ensError = hasEnsEnding(value) && !shouldResolve ? getMainnetEnsError() : null
  const customError = customValidation && address ? customValidation(address) : null

  return {
    ensError,
    customError,
    hasError: Boolean((value.length > 0 && !loading && !address && !isAddress(value)) || ensError || customError),
  }
}

// Helper function to handle input processing
export function processInputValue(
  input: string,
  addressPrefix: string | undefined,
  setChainPrefixWarning: (warning: string) => void,
  onChange: (value: string) => void,
): void {
  setChainPrefixWarning('')
  const cleanValue = input.replace(/\s+/g, '')

  if (isPrefixedAddress(cleanValue)) {
    const { prefix, address } = parsePrefixedAddress(cleanValue)

    if (prefix && addressPrefix !== prefix) {
      setChainPrefixWarning(prefix)
    }

    if (address) {
      onChange(address)
      return
    }
  }

  onChange(cleanValue)
}

export type { ValidationResult }