import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3ModalAccount } from '@web3modal/ethers5/react'

export function useIsProviderNetworkUnsupported(): boolean {
  const { chainId } = useWeb3ModalAccount()

  return useMemo(() => {
    if (!chainId) return false

    return !(chainId in SupportedChainId)
  }, [chainId])
}
