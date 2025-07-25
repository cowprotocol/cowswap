import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { CrossChainOrder, getCrossChainOrder, CowEnv } from '@cowprotocol/cow-sdk'

import { orderBookApi, knownBridgeProviders } from 'sdk/cowSdk'
import useSWR, { SWRResponse } from 'swr'

import { useNetworkId } from '../../../state/network'

export function useCrossChainOrder(orderId: string | undefined): SWRResponse<CrossChainOrder | null | undefined> {
  const chainId = useNetworkId()

  return useSWR(
    ['useCrossChainOrder', orderId, chainId],
    async ([_, orderId, chainId]) => {
      if (!orderId || !chainId) return

      const getOrder = (env: CowEnv): ReturnType<typeof getCrossChainOrder> => {
        return getCrossChainOrder({
          chainId,
          orderId,
          env,
          providers: knownBridgeProviders,
          orderBookApi,
        })
      }

      return getOrder('prod').catch(() => getOrder('staging'))
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
