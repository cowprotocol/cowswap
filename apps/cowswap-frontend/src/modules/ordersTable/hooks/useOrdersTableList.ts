import { useMemo } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'

import { Order, OrderStatus, PENDING_STATES } from 'legacy/state/orders/actions'
import { useSetIsOrderUnfillable } from 'legacy/state/orders/hooks'

import { getIsComposableCowOrder } from 'utils/orderUtils/getIsComposableCowOrder'
import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useOrdersFillability } from './useOrdersFillability'

import { OrdersTableList, OrderTableItem, TabOrderTypes } from '../state/ordersTable.types'
import { useGetPendingOrdersPermitValidityState } from '../state/permit/usePendingOrderPermitValidity'
import { getOrderParams } from '../utils/getOrderParams'
import { groupOrdersTable } from '../utils/groupOrdersTable'
import { getParsedOrderFromTableItem, isParsedOrder } from '../utils/orderTableGroupUtils'

import type { OrderFillability } from './useOrdersFillability'

const ORDER_LIMIT = 1000

const ordersSorter = (a: OrderTableItem, b: OrderTableItem): number => {
  const aCreationTime = getParsedOrderFromTableItem(a).creationTime
  const bCreationTime = getParsedOrderFromTableItem(b).creationTime
  return bCreationTime.getTime() - aCreationTime.getTime()
}

function isUnfillableFromFillabilityAndParams(
  fillability: OrderFillability | undefined,
  params: { hasEnoughBalance: boolean | undefined; hasEnoughAllowance: boolean | undefined },
): boolean {
  const fromFillability =
    fillability && (fillability.hasEnoughBalance === false || fillability.hasEnoughAllowance === false)
  const fromParams = params.hasEnoughBalance === false || params.hasEnoughAllowance === false
  return fromFillability ?? fromParams
}

type ProcessItemParams = {
  chainId: number
  orderType: TabOrderTypes
  balancesAndAllowances: BalancesAndAllowances
  ordersFillability: Record<string, OrderFillability | undefined>
  pendingOrdersPermitValidityState: ReturnType<typeof useGetPendingOrdersPermitValidityState>
  setIsOrderUnfillable: ReturnType<typeof useSetIsOrderUnfillable>
}

function shouldSkipOrder(order: ParsedOrder, orderType: TabOrderTypes): boolean {
  const advancedTabNonAdvancedOrder = orderType === TabOrderTypes.ADVANCED && getIsNotComposableCowOrder(order)
  const limitTabNonLimitOrder = orderType === TabOrderTypes.LIMIT && getIsComposableCowOrder(order)
  return advancedTabNonAdvancedOrder || limitTabNonLimitOrder
}

function hasUnfillableChild(item: OrderTableItem, params: ProcessItemParams): boolean {
  if (isParsedOrder(item) || !item.children) return false
  const { chainId, balancesAndAllowances, ordersFillability, pendingOrdersPermitValidityState } = params
  return item.children.some((childOrder) => {
    const childParams = getOrderParams(chainId, balancesAndAllowances, childOrder, pendingOrdersPermitValidityState)
    const childUnfillable = isUnfillableFromFillabilityAndParams(ordersFillability[childOrder.id], childParams)
    return (
      childOrder.status !== OrderStatus.FULFILLED &&
      (childOrder.status === OrderStatus.SCHEDULED || childOrder.status === OrderStatus.PENDING) &&
      childUnfillable
    )
  })
}

function pushToLists(
  acc: OrdersTableList,
  item: OrderTableItem,
  isPending: boolean,
  isSigning: boolean,
  isUnfillable: boolean,
): void {
  if (isSigning) acc.signing.push(item)
  if (isPending && isUnfillable && !isSigning) acc.unfillable.push(item)
  if (isPending && !isSigning) acc.open.push(item)
  if (!isPending && !isSigning) acc.history.push(item)
}

function processOrderItem(acc: OrdersTableList, item: OrderTableItem, params: ProcessItemParams): void {
  const {
    chainId,
    orderType,
    balancesAndAllowances,
    ordersFillability,
    pendingOrdersPermitValidityState,
    setIsOrderUnfillable,
  } = params
  const order = isParsedOrder(item) ? item : item.parent

  if (shouldSkipOrder(order, orderType)) return

  const isPending = PENDING_STATES.includes(order.status)
  const isSigning = order.status === OrderStatus.PRESIGNATURE_PENDING

  const orderParams = getOrderParams(chainId, balancesAndAllowances, order, pendingOrdersPermitValidityState)
  let isUnfillable = isUnfillableFromFillabilityAndParams(ordersFillability[order.id], orderParams)
  if (hasUnfillableChild(item, params)) isUnfillable = true

  if (isPending && order.isUnfillable !== isUnfillable) {
    setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })
  }

  pushToLists(acc, item, isPending, isSigning, isUnfillable)
}

export function useOrdersTableList(
  allOrders: Order[],
  orderType: TabOrderTypes,
  chainId: number,
  balancesAndAllowances: BalancesAndAllowances,
): OrdersTableList {
  const setIsOrderUnfillable = useSetIsOrderUnfillable()
  const ordersFillability = useOrdersFillability(allOrders)
  const allSortedOrders = useMemo(() => groupOrdersTable(allOrders).sort(ordersSorter), [allOrders])
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()

  return useMemo(() => {
    const processParams: ProcessItemParams = {
      chainId,
      orderType,
      balancesAndAllowances,
      ordersFillability,
      pendingOrdersPermitValidityState,
      setIsOrderUnfillable,
    }
    return allSortedOrders.slice(0, ORDER_LIMIT).reduce<OrdersTableList>(
      (acc, item) => {
        processOrderItem(acc, item, processParams)
        return acc
      },
      { open: [], history: [], unfillable: [], signing: [] },
    )
  }, [
    allSortedOrders,
    chainId,
    balancesAndAllowances,
    orderType,
    ordersFillability,
    setIsOrderUnfillable,
    pendingOrdersPermitValidityState,
  ])
}
