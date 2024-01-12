import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import { useFeatureFlags } from './featureFlags/useFeatureFlags'

export function useIsProviderNetworkUnsupported(): boolean {
  const { chainId } = useWeb3React()
  const { isSepoliaEnabled } = useFeatureFlags()

  return useMemo(() => {
    if (!chainId) return false

    if (chainId === SupportedChainId.SEPOLIA) {
      return !isSepoliaEnabled
    }

    return !(chainId in SupportedChainId)
  }, [chainId, isSepoliaEnabled])
}
