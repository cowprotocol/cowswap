import { useMemo } from 'react'

import { isChainDeprecated } from '@cowprotocol/cow-sdk'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

export function useIsProviderNetworkDeprecated(): boolean {
  const chainId = useWalletChainId()

  return useMemo(() => {
    if (!chainId) return false

    return isChainDeprecated(chainId)
  }, [chainId])
}
