import { useDebounce } from '@cowprotocol/common-hooks'
import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'

import { useENSChainValidation } from 'common/hooks/useENSChainValidation'

export interface ENSResult {
  address: string | null
  loading: boolean
  name: string | null
  ensChainValidationError: string | null
  debouncedValue: string
}

// Enhanced ENS resolution hook with disable functionality
export function useEnhancedENS(value: string, disableENS: boolean, effectiveChainId: SupportedChainId): ENSResult {
  const debouncedValue = useDebounce(value, 500)
  const { address: ensAddress, loading, name } = useENS(disableENS ? null : debouncedValue)
  const ensChainValidationErrorFromHook = useENSChainValidation(debouncedValue, effectiveChainId)
  
  const ensChainValidationError = disableENS && value.endsWith('.eth')
    ? 'ENS names (.eth) are not supported for bridge transactions. Please use a wallet address.'
    : ensChainValidationErrorFromHook

  // For bridge transactions (disableENS=true), if the input is already a valid address, use it directly
  // For regular swaps (disableENS=false), use the ENS-resolved address
  const address = disableENS 
    ? (isAddress(debouncedValue) ? debouncedValue : null)
    : ensAddress

  return {
    address,
    loading,
    name,
    ensChainValidationError,
    debouncedValue,
  }
}