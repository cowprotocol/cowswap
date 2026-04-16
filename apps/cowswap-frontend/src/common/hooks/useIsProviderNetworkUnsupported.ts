import { useMemo } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

export function useIsProviderNetworkUnsupported(): boolean {
  const { chainId } = useWalletInfo()
  const availableChains = useAvailableChains()

  return useMemo(() => {
    if (!chainId) return false

    return availableChains.indexOf(chainId) === -1
  }, [chainId, availableChains])
}
