import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

export function useIsProviderNetworkUnsupported(): boolean {
  const chainId = useWalletChainId()

  return useMemo(() => {
    if (!chainId) return false

    return !(chainId in SupportedChainId)
  }, [chainId])
}
