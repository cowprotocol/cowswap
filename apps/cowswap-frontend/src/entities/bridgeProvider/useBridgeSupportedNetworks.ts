import type { ChainInfo } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedNetworks(): SWRResponse<ChainInfo[]> {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider.info.dappId, 'useBridgeSupportedNetworks'], () => {
    return bridgeProvider.getNetworks()
  })
}
