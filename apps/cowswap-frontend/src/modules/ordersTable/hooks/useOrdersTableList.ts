import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { Order, OrderStatus, PENDING_STATES } from 'legacy/state/orders/actions'
import { getIsComposableCowOrder } from 'utils/orderUtils/getIsComposableCowOrder'
import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'
import { OrdersTableList, OrderTableItem, TabOrderTypes } from '../state/ordersTable.types'
import { PendingOrdersPermitValidityState } from '../state/permit/pendingOrdersPermitValidity.atom'
import { getOrderParams } from '../utils/getOrderParams'
import { groupOrdersTable } from '../utils/groupOrdersTable'
import { getParsedOrderFromTableItem, isParsedOrder } from '../utils/orderTableGroupUtils'
import { SetIsOrderUnfillableParams } from 'legacy/state/orders/actions'

const ORDER_LIMIT = 1000

const ordersSorter = (a: OrderTableItem, b: OrderTableItem): number => {
  const aCreationTime = getParsedOrderFromTableItem(a).creationTime
  const bCreationTime = getParsedOrderFromTableItem(b).creationTime

  return bCreationTime.getTime() - aCreationTime.getTime()
}

export function getOrdersTableList(
  orders: Order[],
  orderType: TabOrderTypes,
  chainId: number,
  balancesAndAllowances: BalancesAndAllowances,
  pendingOrdersPermitValidityState: PendingOrdersPermitValidityState,
  setIsOrderUnfillable: (params: SetIsOrderUnfillableParams) => void
): OrdersTableList {

  // Then, categorize orders into their respective lists
  return groupOrdersTable(orders).sort(ordersSorter).slice(0, ORDER_LIMIT).reduce<OrdersTableList>(
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    (acc, item) => {
      const order = isParsedOrder(item) ? item : item.parent

      const advancedTabNonAdvancedOrder = orderType === TabOrderTypes.ADVANCED && getIsNotComposableCowOrder(order)
      const limitTabNonLimitOrder = orderType === TabOrderTypes.LIMIT && getIsComposableCowOrder(order)

      if (advancedTabNonAdvancedOrder || limitTabNonLimitOrder) {
        // Skip if order type doesn't match
        return acc
      }

      const isPending = PENDING_STATES.includes(order.status)
      const isSigning = order.status === OrderStatus.PRESIGNATURE_PENDING

      // Check if order is unfillable (insufficient balance or allowance)
      const params = getOrderParams(chainId, balancesAndAllowances, order, pendingOrdersPermitValidityState)
      let isUnfillable = params.hasEnoughBalance === false || params.hasEnoughAllowance === false

      // For TWAP orders, also check child orders
      if (!isParsedOrder(item) && item.children) {
        const hasUnfillableChild = item.children.some((childOrder) => {
          const childParams = getOrderParams(
            chainId,
            balancesAndAllowances,
            childOrder,
            pendingOrdersPermitValidityState,
          )
          return (
            childOrder.status !== OrderStatus.FULFILLED &&
            (childOrder.status === OrderStatus.SCHEDULED || childOrder.status === OrderStatus.PENDING) &&
            (childParams.hasEnoughBalance === false || childParams.hasEnoughAllowance === false)
          )
        })
        isUnfillable = isUnfillable || hasUnfillableChild
      }

      // Update the unfillable flag whenever the state changes, not just when becoming unfillable
      if (isPending && order.isUnfillable !== isUnfillable) {
        setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })
      }

      // Add to signing if in presignature pending state
      if (isSigning) {
        acc.signing.push(item)
      }

      // Add to unfillable only if pending, unfillable, and not in signing state
      if (isPending && isUnfillable && !isSigning) {
        acc.unfillable.push(item)
      }

      // Add to pending if in a pending state and not in signing state
      if (isPending && !isSigning) {
        acc.open.push(item)
      }

      // Add to history if not pending and not signing
      if (!isPending && !isSigning) {
        acc.history.push(item)
      }

      return acc
    },
    { open: [], history: [], unfillable: [], signing: [] },
  )
}
