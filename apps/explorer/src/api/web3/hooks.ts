import { useMemo } from 'react'
import Web3 from 'web3'

import { useNetworkId } from 'state/network'

import { createWeb3Api, getProviderByNetwork } from '.'

// Approach 1: create one web3 instance per network
// Must be used inside components, since it's a hook
// Can also be used outside by calling `createWeb3Api` directly
export function useWeb3(): Web3 {
  const networkId = useNetworkId()

  // createWeb3 caches instances per provider, safe to call multiple times
  return useMemo(() => {
    const provider = getProviderByNetwork(networkId)

    return createWeb3Api(provider)
  }, [networkId])
}
