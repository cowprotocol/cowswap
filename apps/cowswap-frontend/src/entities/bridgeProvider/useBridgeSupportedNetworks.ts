import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { ChainInfo } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProviders } from './useBridgeProviders'

export function useBridgeSupportedNetworks(): SWRResponse<ChainInfo[]> {
  const bridgeProviders = useBridgeProviders()
  const providerIds = bridgeProviders.map((i) => i.info.dappId).join('|')

  return useSWR(
    [providerIds, 'useBridgeSupportedNetworks'],
    async () => {
      const results = await Promise.allSettled(
        bridgeProviders.map((provider) => {
          return provider.getNetworks()
        }),
      )

      const allNetworks = results.reduce<Record<ChainInfo['id'], ChainInfo>>((acc, val) => {
        if (val.status === 'fulfilled') {
          const networks = val.value

          networks.forEach((network) => {
            if (!acc[network.id]) {
              acc[network.id] = network
            }
          })
        }

        return acc
      }, {})
      return Object.values(allNetworks)
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
