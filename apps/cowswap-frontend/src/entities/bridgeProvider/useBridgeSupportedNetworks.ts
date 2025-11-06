import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { ChainInfo } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

import { bridgingSdk } from '../../tradingSdk/bridgingSdk'

export function useBridgeSupportedNetworks(): SWRResponse<ChainInfo[]> {
  const providerIds = useBridgeProvidersIds()
  const key = providerIds.join('|')

  return useSWR(
    [key, 'useBridgeSupportedNetworks'],
    async () => {
      return bridgingSdk.getTargetNetworks()
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}

export function useBridgeSupportedNetwork(chainId: number | undefined): ChainInfo | undefined {
  const networks = useBridgeSupportedNetworks().data

  return useMemo(() => {
    return chainId ? networks?.find((chain) => chain.id === chainId) : undefined
  }, [networks, chainId])
}
