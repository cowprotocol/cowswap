import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import type { ChainInfo } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedNetworks(): SWRResponse<ChainInfo[]> {
  const isBridgingEnabled = useIsBridgingEnabled()
  const bridgeProvider = useBridgeProvider()

  return useSWR(isBridgingEnabled ? [bridgeProvider, 'useBridgeSupportedNetworks'] : null, ([bridgeProvider]) => {
    return bridgeProvider.getNetworks()
  })
}
