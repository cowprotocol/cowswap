import useSWR from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedNetworks() {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider], ([bridgeProvider]) => {
    return bridgeProvider.getNetworks()
  })

}
