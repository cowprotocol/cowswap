import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Hook for validating ENS addresses on specific chains
 * ENS (.eth) addresses are only valid on Ethereum Mainnet
 */
export function useENSChainValidation(value: string, chainId: SupportedChainId): string | null {
  return useMemo(() => {
    if (value.endsWith('.eth') && chainId !== SupportedChainId.MAINNET) {
      const chainLabel = getChainInfo(chainId)?.label || 'this network'
      return `.eth addresses are only valid on Ethereum Mainnet. You're sending to ${chainLabel}.`
    }
    return null
  }, [value, chainId])
}
