import { useMemo } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'

import { getAddressValidationStrategy } from '../../../utils/addressValidation'

export function useAddressResolution(
  value: string,
  targetChainId: TargetChainId | undefined,
): { address: string | null; loading: boolean; name: string | null } {
  const strategy = getAddressValidationStrategy(targetChainId)
  const {
    address: ensAddress,
    loading: ensLoading,
    name,
  } = useENS((strategy.supportsENS ? value : undefined) as `0x${string}` | undefined)

  return useMemo(() => {
    if (!strategy.supportsENS) {
      const isValid = value.length > 0 && strategy.isValidAddress(value)
      return { address: isValid ? value : null, loading: false, name: null }
    }
    return { address: ensAddress, loading: ensLoading, name }
  }, [strategy, value, ensAddress, ensLoading, name])
}
