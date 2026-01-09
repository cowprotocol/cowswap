import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CrossChainOrder, BridgeStatus } from '@cowprotocol/sdk-bridging'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

const UPDATE_INTERVAL = ms`5s`

export const BRIDGING_FINAL_STATUSES = [BridgeStatus.EXECUTED, BridgeStatus.EXPIRED, BridgeStatus.REFUND]

const swrOptions: SWRConfiguration<CrossChainOrder | null> = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  refreshInterval(data) {
    if (data) {
      const isBridgingFinished = BRIDGING_FINAL_STATUSES.includes(data.statusResult.status)

      if (isBridgingFinished) {
        return 0
      }
    }
    return UPDATE_INTERVAL
  },
}

export function useCrossChainOrder(
  chainId: SupportedChainId | undefined,
  orderUid: string | undefined,
): SWRResponse<CrossChainOrder | null> {
  return useSWR(
    [chainId, orderUid, 'useCrossChainOrder'],
    ([chainId, orderUid]) => {
      if (!chainId || !orderUid) return null

      return bridgingSdk.getOrder({
        chainId,
        orderId: orderUid,
      })
    },
    swrOptions,
  )
}
