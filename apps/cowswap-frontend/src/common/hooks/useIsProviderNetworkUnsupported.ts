import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import { useFeatureFlags } from './featureFlags/useFeatureFlags'

export function useIsProviderNetworkUnsupported(): boolean {
  const { chainId } = useWeb3React()
  const flags = useFeatureFlags()

  return useMemo(() => {
    const { isSepoliaEnabled } = flags
    console.log('TEST', {
      SP: SupportedChainId.SEPOLIA,
      chainId,
      isSepoliaEnabled,
    })

    if (!chainId) return false

    if (chainId === SupportedChainId.SEPOLIA) {
      if (!isSepoliaEnabled) return true
    }

    return !(chainId in SupportedChainId)
  }, [chainId, flags])
}
