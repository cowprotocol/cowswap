import { SupportedChainId, CrossChainOrder, BridgeStatus } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

import { bridgingSdk } from '../../tradingSdk/bridgingSdk'

const UPDATE_INTERVAL = ms`5s`
const FINAL_STATUSES = [BridgeStatus.EXECUTED, BridgeStatus.EXPIRED, BridgeStatus.REFUND]

const swrOptions: SWRConfiguration<CrossChainOrder | null> = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  refreshInterval(data) {
    if (data) {
      const isBridgingFinished = FINAL_STATUSES.includes(data.statusResult.status)

      if (isBridgingFinished) {
        return 0
      }
    }
    return UPDATE_INTERVAL
  },
}

export function useCrossChainOrder(
  chainId: SupportedChainId,
  orderUid: string | undefined,
): SWRResponse<CrossChainOrder | null> {
  return useSWR(
    [chainId, orderUid, 'useCrossChainOrder'],
    ([chainId, orderUid]) => {
      if (!orderUid) return null

      return bridgingSdk.getOrder({
        chainId,
        orderId: orderUid,
      })
    },
    swrOptions,
  )
}
