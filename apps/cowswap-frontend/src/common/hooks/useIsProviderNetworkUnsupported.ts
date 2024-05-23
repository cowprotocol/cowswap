import { useMemo } from 'react'

import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useAvailableChains } from './useAvailableChains'

export function useIsProviderNetworkUnsupported(): boolean {
  const chainId = useWalletChainId()
  const availableChains = useAvailableChains()

  return useMemo(() => {
    if (!chainId) return false

    return availableChains.indexOf(chainId) === -1
  }, [chainId, availableChains])
}
