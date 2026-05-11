import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import { Order, OrderStatus, PENDING_STATES, SetIsOrderUnfillableParams } from 'legacy/state/orders/actions'

import { TabOrderTypes } from 'common/state/routesState'
import { getIsComposableCowOrder } from 'utils/orderUtils/getIsComposableCowOrder'
import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'

import { getOrderParams, OrderParams } from './getOrderParams'
import { groupOrdersTable } from './groupOrdersTable'
import { getParsedOrderFromTableItem, isParsedOrder } from './orderTableGroupUtils'

import { OrdersTableList, OrderTableItem } from '../state/ordersTable.types'
import { PendingOrdersPermitValidityState } from '../state/permit/pendingOrdersPermitValidity.atom'

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
  setIsOrderUnfillable: (params: SetIsOrderUnfillableParams) => void,
): OrdersTableList {
  // Then, categorize orders into their respective lists
  return groupOrdersTable(orders)
    .sort(ordersSorter)
    .slice(0, ORDER_LIMIT)
    .reduce<OrdersTableList>(
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

        // When allowance/balance is temporarily unavailable, keep the current persisted flag.
        // This avoids incorrectly flipping an already-unfillable order back to fillable.
        const unfillableParams = getUnfillableParams(params, order.isUnfillable ?? false)
        const { hasKnownFillability } = unfillableParams
        let { isUnfillable } = unfillableParams

        // For TWAP orders, also check child orders (unless we know the parent order is already unfillable)
        if (!isParsedOrder(item) && item.children && !isUnfillable) {
          isUnfillable = item.children.some((childOrder) => {
            const childParams = getOrderParams(
              chainId,
              balancesAndAllowances,
              childOrder,
              pendingOrdersPermitValidityState,
            )
            const unfillableParams = getUnfillableParams(childParams, childOrder.isUnfillable ?? false)
            const { hasKnownFillability, isUnfillable } = unfillableParams

            return (
              childOrder.status !== OrderStatus.FULFILLED &&
              (childOrder.status === OrderStatus.SCHEDULED || childOrder.status === OrderStatus.PENDING) &&
              hasKnownFillability &&
              isUnfillable
            )
          })
        }

        // Update the unfillable flag whenever the state changes, not just when becoming unfillable
        // Only dispatch when fillability is known to prevent state churn from transient undefined values.
        if (isPending && hasKnownFillability && order.isUnfillable !== isUnfillable) {
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

function getUnfillableParams(
  orderParams: OrderParams,
  defaultValue: boolean,
): { hasKnownFillability: boolean; isUnfillable: boolean } {
  const hasKnownFillability = orderParams.hasEnoughBalance !== undefined && orderParams.hasEnoughAllowance !== undefined
  const isUnfillable = hasKnownFillability
    ? orderParams.hasEnoughBalance === false || orderParams.hasEnoughAllowance === false
    : defaultValue

  return { hasKnownFillability, isUnfillable }
}
