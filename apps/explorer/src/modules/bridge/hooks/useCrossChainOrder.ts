import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { CowEnv } from '@cowprotocol/cow-sdk'
import { CrossChainOrder, getCrossChainOrder, BridgeStatus } from '@cowprotocol/sdk-bridging'

import ms from 'ms.macro'
import { orderBookApi, knownBridgeProviders } from 'sdk/cowSdk'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { useNetworkId } from '../../../state/network'

const UPDATE_INTERVAL = ms`15s`

export const BRIDGING_FINAL_STATUSES = [BridgeStatus.EXECUTED, BridgeStatus.EXPIRED, BridgeStatus.REFUND]

const swrOptions: SWRConfiguration = {
  ...SWR_NO_REFRESH_OPTIONS,
  refreshInterval: (data) => {
    if (data) {
      const isBridgingFinished = BRIDGING_FINAL_STATUSES.includes(data.statusResult.status)

      if (isBridgingFinished) {
        return 0
      }
    }
    return UPDATE_INTERVAL
  },
}

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
    swrOptions,
  )
}
