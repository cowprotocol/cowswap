import { useWeb3React } from '@web3-react/core'
import { useOrders } from 'state/orders/hooks'
import { useMemo } from 'react'
import { Order, OrderStatus } from 'state/orders/actions'

export interface LimitOrdersList {
  pending: Order[]
  history: Order[]
}

const pendingOrderStatuses: OrderStatus[] = [OrderStatus.PRESIGNATURE_PENDING, OrderStatus.PENDING]

export function useLimitOrdersList(): LimitOrdersList {
  const { chainId, account } = useWeb3React()
  const allNonEmptyOrders = useOrders({ chainId })
  const accountLowerCase = account?.toLowerCase()

  const allSortedOrders = useMemo(() => {
    return allNonEmptyOrders
      .filter((order) => order.owner.toLowerCase() === accountLowerCase)
      .sort((a, b) => Date.parse(b.creationTime) - Date.parse(a.creationTime))
  }, [accountLowerCase, allNonEmptyOrders])

  return useMemo(() => {
    return allSortedOrders.reduce(
      (acc, order) => {
        if (pendingOrderStatuses.includes(order.status)) {
          acc.pending.push(order)
        } else {
          acc.history.push(order)
        }

        return acc
      },
      { pending: [], history: [] } as LimitOrdersList
    )
  }, [allSortedOrders])
}
