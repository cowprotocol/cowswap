import { useMemo } from 'react'

import type { ChainInfo } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedNetworks(): SWRResponse<ChainInfo[]> {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider.info.dappId, 'useBridgeSupportedNetworks'], () => {
    return bridgeProvider.getNetworks()
  })
}

export function useBridgeSupportedNetwork(chainId: number | undefined): ChainInfo | undefined {
  const networks = useBridgeSupportedNetworks().data

  return useMemo(() => {
    return chainId ? networks?.find((chain) => chain.id === chainId) : undefined
  }, [networks, chainId])
}
