import { GP_ORDER_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useSWROrdersRequest } from 'modules/orders/hooks/useSWROrdersRequest'

import { getOrders } from './api'

export function useGpOrders(): EnrichedOrder[] {
  const { chainId } = useWalletInfo()

  const requestParams = useSWROrdersRequest()

  // Fetch orders for the current environment
  const { data: currentEnvOrders } = useSWR<EnrichedOrder[]>(
    ['orders', requestParams, chainId],
    () => {
      if (!chainId || !requestParams) return []

      return getOrders(requestParams, { chainId }).then((orders) => {
        // TODO: remove after test
        const my = orders.find(
          (order) =>
            order.uid ===
            '0xfbc02116477e1d722ce60e5306fcbbd8c9738ca4541ccfbef72fd86db9dd4c98fb3c7eb936caa12b5a884d612393969a557d430766583061'
        )

        if (my) {
          my.executedSellAmount = '499989000000000000'
          my.executedSellAmountBeforeFees = '499989000000000000'
          my.status = OrderStatus.OPEN
        }
        return orders
      })
    },
    { refreshInterval: GP_ORDER_UPDATE_INTERVAL }
  )

  return currentEnvOrders || []
}
