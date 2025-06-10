import useSWR from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBridgeSupportedNetworks() {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider, 'useBridgeSupportedNetworks'], ([bridgeProvider]) => {
    return bridgeProvider.getNetworks()
  })
}
