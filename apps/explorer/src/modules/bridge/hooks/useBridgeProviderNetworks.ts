import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { CrossChainOrder } from '@cowprotocol/cow-sdk'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

export function useBridgeProviderNetworks(
  provider: CrossChainOrder['provider'] | undefined,
): SWRResponse<Record<number, ChainInfo> | undefined> {
  return useSWR(
    [provider, provider?.info.dappId],
    async ([provider]) => {
      if (!provider) return undefined

      return provider.getNetworks().then((chains) => {
        return chains.reduce<Record<number, ChainInfo>>((acc, val) => {
          acc[val.id] = val
          return acc
        }, {})
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
