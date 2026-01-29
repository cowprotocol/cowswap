import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { getPrototypeNonEvmNetworks, isNonEvmPrototypeEnabled } from 'prototype/nonEvmPrototype'
import useSWR, { SWRResponse } from 'swr'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

export function useBridgeSupportedNetworks(): SWRResponse<ChainInfo[]> {
  const providerIds = useBridgeProvidersIds()
  const key = providerIds.join('|')

  return useSWR(
    [key, 'useBridgeSupportedNetworks'],
    async () => {
      const networks = await bridgingSdk.getTargetNetworks()

      if (!isNonEvmPrototypeEnabled()) {
        return networks
      }

      const prototypeNetworks = getPrototypeNonEvmNetworks()
      const networksById = new Map<number, ChainInfo>()

      for (const network of networks) {
        networksById.set(network.id, network)
      }

      for (const prototypeNetwork of prototypeNetworks) {
        networksById.set(prototypeNetwork.id, prototypeNetwork)
      }

      return Array.from(networksById.values())
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
