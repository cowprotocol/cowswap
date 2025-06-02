import useSWR from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedNetworks() {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider, 'useBridgeSupportedNetworks'], ([bridgeProvider]) => {
    return bridgeProvider.getNetworks()
  })
}
