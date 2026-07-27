import { TabOrderTypes } from 'entities/routes/routes.atom'

import { useLoadMoreOrders } from 'modules/orders'
import { useLoadMoreEoaTwapOrders } from 'modules/twap'

export function useLoadMoreTableOrders(orderType: TabOrderTypes): ReturnType<typeof useLoadMoreOrders> {
  const isAdvancedOrders = orderType === TabOrderTypes.ADVANCED
  const regularOrders = useLoadMoreOrders(!isAdvancedOrders)
  const eoaTwapOrders = useLoadMoreEoaTwapOrders(isAdvancedOrders)

  return isAdvancedOrders ? eoaTwapOrders : regularOrders
}
