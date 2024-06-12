import { useMemo } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { useWalletChainId } from '@cowprotocol/wallet-provider'


export function useIsProviderNetworkUnsupported(): boolean {
  const chainId = useWalletChainId()
  const availableChains = useAvailableChains()

  return useMemo(() => {
    if (!chainId) return false

    return availableChains.indexOf(chainId) === -1
  }, [chainId, availableChains])
}
