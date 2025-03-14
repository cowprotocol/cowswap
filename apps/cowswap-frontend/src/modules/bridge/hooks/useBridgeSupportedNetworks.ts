import useSWR from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedNetworks() {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider], ([bridgeProvider]) => {
    return bridgeProvider.getNetworks()
  })
}

export function useBridgeSupportedNetworkById(chainId?: number) {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider, chainId], ([bridgeProvider, chainId]) => {
    if (typeof chainId === 'undefined') return null

    return bridgeProvider.getNetworkById(chainId).then((network) => {
      console.log('network ==>', network)
      return network?.logoUrl?.light ?? null
    })
  })
}
