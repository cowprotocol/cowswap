import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { ordersToCancelAtom } from '@cow/common/hooks/useMultipleOrdersCancellation/state'
import { useMultipleOrdersCancellation } from '@cow/common/hooks/useMultipleOrdersCancellation'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { shortenOrderId } from 'utils'

interface Props {
  pendingOrders: ParsedOrder[]
}

export function MultipleCancellationMenu({ pendingOrders }: Props) {
  const [ordersToCancel, setOrdersToCancel] = useAtom(ordersToCancelAtom)
  const multipleCancellation = useMultipleOrdersCancellation()

  const toggleMultipleCancellation = useCallback(() => {
    setOrdersToCancel(ordersToCancel !== null ? null : [])
  }, [setOrdersToCancel, ordersToCancel])

  const cancelAllPendingOrders = useCallback(() => {
    multipleCancellation(pendingOrders)
  }, [multipleCancellation, pendingOrders])

  return (
    <div>
      {ordersToCancel && (
        <div>Selected orders: {ordersToCancel.map((order) => shortenOrderId(order.id)).join(',')}</div>
      )}

      <button onClick={toggleMultipleCancellation}>Multiple cancellation</button>
      <button onClick={cancelAllPendingOrders}>Cancel all pending orders</button>

      {ordersToCancel && (
        <button onClick={() => multipleCancellation(ordersToCancel)}>Cancel ({ordersToCancel.length})</button>
      )}
    </div>
  )
}
