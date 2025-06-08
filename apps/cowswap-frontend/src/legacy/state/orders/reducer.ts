import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { Writable } from 'types'

import { getIsComposableCowDiscreteOrder } from 'utils/orderUtils/getIsComposableCowDiscreteOrder'
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'

import {
  addOrUpdateOrders,
  addPendingOrder,
  cancelOrdersBatch,
  clearOrders,
  clearOrdersStorage,
  CONFIRMED_STATES,
  CREATING_STATES,
  deleteOrders,
  expireOrdersBatch,
  fulfillOrdersBatch,
  invalidateOrdersBatch,
  OrderStatus,
  preSignOrders,
  requestOrderCancellation,
  SerializedOrder,
  setIsOrderRefundedBatch,
  setIsOrderUnfillable,
  setOrderCancellationHash,
  updateLastCheckedBlock,
  updateOrder,
  updatePresignGnosisSafeTx,
} from './actions'
import { ContractDeploymentBlocks, MAX_ITEMS_PER_STATUS } from './consts'
import { flatOrdersStateNetwork } from './flatOrdersStateNetwork'

export interface OrderObject {
  id: string
  order: SerializedOrder
  isSafeWallet: boolean
}

type V2Order = Omit<OrderObject['order'], 'inputToken' | 'outputToken'>

// Previous order state, to use in checks
// in case users have older, stale state and we need to handle
export interface V2OrderObject {
  id: OrderObject['id']
  order: V2Order
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<string, OrderObject>
export type PartialOrdersMap = Partial<OrdersMap>

export type OrderLists = {
  pending: PartialOrdersMap
  presignaturePending: PartialOrdersMap
  fulfilled: PartialOrdersMap
  expired: PartialOrdersMap
  cancelled: PartialOrdersMap
  creating: PartialOrdersMap
  failed: PartialOrdersMap
  scheduled: PartialOrdersMap
}

export interface OrdersStateNetwork extends OrderLists {
  lastCheckedBlock: number
}

export type OrdersState = {
  readonly [chainId in ChainId]?: OrdersStateNetwork
}

export interface PrefillStateRequired {
  chainId: ChainId
}

export type EthFlowOrderTypes = 'creating' | 'failed'
export type PreSignOrderTypes = 'presignaturePending'
export type OrderTypeKeys =
  | 'pending'
  | PreSignOrderTypes
  | 'expired'
  | 'fulfilled'
  | 'cancelled'
  | EthFlowOrderTypes
  | 'scheduled'

export const ORDER_LIST_KEYS: OrderTypeKeys[] = [
  'pending',
  'presignaturePending',
  'expired',
  'fulfilled',
  'cancelled',
  'creating',
  'failed',
  'scheduled',
]
export const ORDERS_LIST: OrderLists = {
  pending: {},
  presignaturePending: {},
  fulfilled: {},
  expired: {},
  cancelled: {},
  creating: {},
  failed: {},
  scheduled: {},
}

function getDefaultLastCheckedBlock(chainId: ChainId): number {
  return ContractDeploymentBlocks[chainId] ?? 0
}

export function getDefaultNetworkState(chainId: ChainId): OrdersStateNetwork {
  return {
    ...ORDERS_LIST,
    lastCheckedBlock: getDefaultLastCheckedBlock(chainId),
  }
}

// makes sure there's always an object at state[chainId], state[chainId].pending | .fulfilled
function prefillState(
  state: Writable<OrdersState>,
  { payload: { chainId } }: PayloadAction<PrefillStateRequired>,
): asserts state is Required<OrdersState> {
  const stateAtChainId = state[chainId]

  if (!stateAtChainId) {
    state[chainId] = getDefaultNetworkState(chainId)
    return
  }

  // Assign default values for order lists in case they are missing
  ORDER_LIST_KEYS.forEach((key) => {
    if (!stateAtChainId[key]) {
      stateAtChainId[key] = ORDERS_LIST[key]
    }
  })

  if (stateAtChainId.lastCheckedBlock === undefined) {
    stateAtChainId.lastCheckedBlock = getDefaultLastCheckedBlock(chainId)
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getOrderById(state: Required<OrdersState>, chainId: ChainId, id: string) {
  const stateForChain = state[chainId]
  return (
    stateForChain.pending[id] ||
    stateForChain.presignaturePending[id] ||
    stateForChain.cancelled[id] ||
    stateForChain.expired[id] ||
    stateForChain.fulfilled[id] ||
    stateForChain.creating[id] ||
    stateForChain.scheduled[id] ||
    stateForChain.failed[id]
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function deleteOrderById(state: Required<OrdersState>, chainId: ChainId, id: string) {
  const stateForChain = state[chainId]
  delete stateForChain.pending[id]
  delete stateForChain.fulfilled[id]
  delete stateForChain.presignaturePending[id]
  delete stateForChain.expired[id]
  delete stateForChain.cancelled[id]
  delete stateForChain.creating[id]
  delete stateForChain.failed[id]
  delete stateForChain.scheduled[id]
}

function addOrderToState(
  state: Required<OrdersState>,
  chainId: ChainId,
  id: string,
  status: OrderTypeKeys,
  order: SerializedOrder,
  isSafeWallet: boolean,
): void {
  // Attempt to fix `TypeError: Cannot add property <x>, object is not extensible`
  // seen on https://user-images.githubusercontent.com/34510341/138450105-bb94a2d1-656e-4e15-ae99-df9fb33c8ca4.png
  // by creating a new object instead of trying to edit the existing one
  // Seems to be due to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions
  // but only happened on Chrome
  state[chainId][status] = { ...state[chainId][status], [id]: { order, id, isSafeWallet } }
}

function popOrder(state: OrdersState, chainId: ChainId, status: OrderStatus, id: string): OrderObject | undefined {
  const orderObj = state?.[chainId]?.[status]?.[id]
  if (orderObj) {
    delete state?.[chainId]?.[status]?.[id]
  }
  return orderObj
}

function getValidTo(userValidTo: number | undefined, order: SerializedOrder): number {
  return (userValidTo || order.validTo) as number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function cancelOrderInState(
  state: Required<OrdersState>,
  chainId: ChainId,
  orderObject: OrderObject,
  isSafeWallet: boolean,
) {
  const id = orderObject.id

  deleteOrderById(state, chainId, id)

  orderObject.order.status = OrderStatus.CANCELLED
  orderObject.order.isCancelling = false

  addOrderToState(state, chainId, id, 'cancelled', orderObject.order, isSafeWallet)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _orderSorterByExpirationTime(a: OrderObject | undefined, b: OrderObject | undefined) {
  const validToA = Number(a?.order.validTo)
  const validToB = Number(b?.order.validTo)

  if (!validToA || !validToB) {
    return -1
  }

  const expirationTimeB = Number(new Date(validToB * 1000))
  const expirationTimeA = Number(new Date(validToA * 1000))

  return expirationTimeB - expirationTimeA
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _toPartialsOrderMap(acc: PartialOrdersMap, element: OrderObject | undefined) {
  element && (acc[element.id] = element)
  return acc
}

const initialState: OrdersState = {}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export default createReducer(initialState, (builder) =>
  builder
    .addCase(addPendingOrder, (state, action) => {
      prefillState(state, action)
      const { order, id, chainId, isSafeWallet } = action.payload

      order.openSince = CREATING_STATES.includes(order.status) ? undefined : Date.now()

      switch (order.status) {
        // EthFlow or PreSign orders have their respective buckets
        case OrderStatus.CREATING: // ethflow orders
        case OrderStatus.PRESIGNATURE_PENDING: // pre-sign orders
          addOrderToState(state, chainId, id, order.status, order, isSafeWallet)
          break
        default:
          // Regular orders go into the pending bucket
          addOrderToState(state, chainId, id, 'pending', order, isSafeWallet)
      }
    })
    .addCase(preSignOrders, (state, action) => {
      prefillState(state, action)
      const { ids, chainId, isSafeWallet } = action.payload

      const now = Date.now()

      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.PENDING
          orderObject.order.openSince = now

          addOrderToState(state, chainId, id, 'pending', orderObject.order, isSafeWallet)
        }
      })
    })
    // TODO: addCase for ethflow from open -> refunded
    .addCase(updatePresignGnosisSafeTx, (state, action) => {
      prefillState(state, action)
      const { orderId, chainId, safeTransaction } = action.payload

      const orderObject = getOrderById(state, chainId, orderId)
      if (orderObject) {
        orderObject.order.presignGnosisSafeTx = safeTransaction
      }
    })
    .addCase(addOrUpdateOrders, (state, action) => {
      prefillState(state, action)
      const { chainId, orders, isSafeWallet } = action.payload

      // TODO: Reduce function complexity by extracting logic
      // eslint-disable-next-line complexity
      orders.forEach((newOrder) => {
        const { id, status: newStatus } = newOrder

        // sanity check, is the status set?
        if (!newStatus) {
          console.error(`addOrUpdateOrders:: Status not set for order ${id}`)
          return
        }

        // fetch order from state, if any
        const orderObj =
          popOrder(state, chainId, OrderStatus.FULFILLED, id) ||
          popOrder(state, chainId, OrderStatus.EXPIRED, id) ||
          popOrder(state, chainId, OrderStatus.CANCELLED, id) ||
          popOrder(state, chainId, OrderStatus.PENDING, id) ||
          popOrder(state, chainId, OrderStatus.PRESIGNATURE_PENDING, id) ||
          popOrder(state, chainId, OrderStatus.CREATING, id) ||
          popOrder(state, chainId, OrderStatus.SCHEDULED, id) ||
          popOrder(state, chainId, OrderStatus.FAILED, id)

        const validTo = getValidTo(newOrder.apiAdditionalInfo?.ethflowData?.userValidTo, newOrder)

        // Skip overriding pending orders, because they get updated in CreatedInOrderBookOrdersUpdater
        if (getIsComposableCowDiscreteOrder(orderObj?.order) && getIsNotComposableCowOrder(newOrder)) {
          return
        }

        const { status, isCancelling } = reClassifyOrder(newOrder, orderObj)

        // merge existing and new order objects
        const order = orderObj
          ? {
              ...orderObj.order,
              validTo,
              creationTime: newOrder.creationTime,
              composableCowInfo: newOrder.composableCowInfo,
              apiAdditionalInfo: newOrder.apiAdditionalInfo,
              isCancelling: isCancelling,
              class: orderObj.order.class || newOrder.class, // should never replace existing order class
              openSince: newOrder.openSince || orderObj.order.openSince,
              // Necessary since `signingScheme` was added later, and local redux state prior to this change doesn't have it set
              signingScheme: newOrder.signingScheme || orderObj.order.signingScheme,
              status,
            }
          : { ...newOrder, validTo }

        // add order to respective state
        addOrderToState(state, chainId, id, status, order, isSafeWallet)
      })
    })
    .addCase(updateOrder, (state, action) => {
      prefillState(state, action)

      const { chainId, order } = action.payload

      const orderObj = getOrderById(state, chainId, order.id)

      if (orderObj) {
        orderObj.order = { ...orderObj.order, ...order }
      }
    })
    .addCase(fulfillOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { orders, chainId, isSafeWallet } = action.payload

      // if there are any newly fulfilled orders
      // update them
      orders.forEach((order) => {
        const { uid, ethflowData } = order
        const orderObject = getOrderById(state, chainId, uid)

        if (orderObject) {
          deleteOrderById(state, chainId, uid)

          orderObject.order.status = OrderStatus.FULFILLED
          orderObject.order.fulfillmentTime = new Date().toISOString()

          orderObject.order.isCancelling = false
          // EthFlow orders validTo is different
          orderObject.order.validTo = getValidTo(ethflowData?.userValidTo, orderObject.order)

          orderObject.order.apiAdditionalInfo = {
            creationDate: order.creationDate,
            executedBuyAmount: order.executedBuyAmount,
            executedSellAmount: order.executedSellAmount,
            executedSellAmountBeforeFees: order.executedSellAmountBeforeFees,
            executedFeeAmount: order.executedFeeAmount,
            executedFee: order.executedFee,
            executedFeeToken: order.executedFeeToken,
            totalFee: order.totalFee,
            invalidated: order.invalidated,
            ethflowData: order.ethflowData,
            onchainOrderData: order.onchainOrderData,
            class: order.class,
            fullAppData: order.fullAppData,
            signingScheme: order.signingScheme,
          }

          addOrderToState(state, chainId, uid, 'fulfilled', orderObject.order, isSafeWallet)
        }
      })
    })
    .addCase(expireOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId, isSafeWallet } = action.payload

      // if there are any newly fulfilled orders
      // update them
      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.EXPIRED
          orderObject.order.isCancelling = false

          addOrderToState(state, chainId, id, 'expired', orderObject.order, isSafeWallet)
        }
      })
    })
    .addCase(invalidateOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId, isSafeWallet } = action.payload

      // if there are any newly fulfilled orders
      // update them
      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.FAILED
          orderObject.order.isCancelling = false

          addOrderToState(state, chainId, id, 'failed', orderObject.order, isSafeWallet)
        }
      })
    })
    .addCase(setOrderCancellationHash, (state, action) => {
      prefillState(state, action)
      const { id, chainId, hash } = action.payload

      const orderObject = getOrderById(state, chainId, id)

      if (orderObject) {
        orderObject.order.cancellationHash = hash
      }
    })
    .addCase(requestOrderCancellation, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload

      const orderObject = getOrderById(state, chainId, id)

      if (orderObject) {
        orderObject.order.isCancelling = true
      }
    })
    .addCase(cancelOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId, isSafeWallet } = action.payload

      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          cancelOrderInState(state, chainId, orderObject, isSafeWallet)

          if (getIsComposableCowParentOrder(orderObject.order)) {
            const allOrdersMap = flatOrdersStateNetwork(state[chainId])

            const children = Object.values(allOrdersMap).filter(
              (item) => item?.order.composableCowInfo?.parentId === id,
            )

            children.forEach((child) => {
              if (!child) return

              cancelOrderInState(state, chainId, child, isSafeWallet)
            })
          }
        }
      })
    })
    .addCase(clearOrders, (state, action) => {
      const { chainId } = action.payload

      const lastCheckedBlock = state[chainId]?.lastCheckedBlock

      state[chainId] = {
        ...ORDERS_LIST,
        lastCheckedBlock: lastCheckedBlock ?? ContractDeploymentBlocks[chainId] ?? 0,
      }
    })
    .addCase(updateLastCheckedBlock, (state, action) => {
      prefillState(state, action)
      const { chainId, lastCheckedBlock } = action.payload

      state[chainId].lastCheckedBlock = lastCheckedBlock
    })
    .addCase(setIsOrderUnfillable, (state, action) => {
      prefillState(state, action)
      const { chainId, id, isUnfillable } = action.payload

      const orderObject = getOrderById(state, chainId, id)

      if (orderObject?.order) {
        orderObject.order.isUnfillable = isUnfillable
      }
    })
    .addCase(setIsOrderRefundedBatch, (state, action) => {
      prefillState(state, action)

      const { chainId, items } = action.payload

      items.forEach(({ id, refundHash }) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          orderObject.order.isRefunded = true
          orderObject.order.refundHash = refundHash
        }
      })
    })
    .addCase(deleteOrders, (state, action) => {
      prefillState(state, action)

      const { chainId, ids } = action.payload

      ids.forEach((id) => {
        deleteOrderById(state, chainId, id)
      })
    })
    .addCase(clearOrdersStorage, (state) => {
      Object.keys(state).forEach((_chainId) => {
        const chainId = _chainId as unknown as ChainId
        const orderListByChain = state[chainId]

        // Iterate order statuses we want to clean up
        CONFIRMED_STATES.forEach((status) => {
          const orders = orderListByChain?.[status]

          if (!orders) {
            return
          }

          // Sort by expiration time
          const ordersCleaned = Object.values(orders)
            .sort(_orderSorterByExpirationTime)
            // Take top n orders
            .slice(0, MAX_ITEMS_PER_STATUS)
            // Return back to appropriate data structure
            .reduce<PartialOrdersMap>(_toPartialsOrderMap, {})

          // Update parts of the state, with the "cleaned" ones
          orderListByChain[status] = ordersCleaned
        })
      })
    }),
)

function reClassifyOrder(
  newOrder: SerializedOrder,
  existingOrder: OrderObject | undefined,
): { status: OrderStatus; isCancelling: boolean | undefined } {
  // Onchain cancellations are considered final
  // Still, the order classification at apps/cowswap-frontend/src/legacy/state/orders/utils.ts can't tell
  // what type of cancellation it was as it doesn't have the local store context
  // Here we do, so we can tell whether it should be fully cancelled or still pending
  if (existingOrder?.order.status === OrderStatus.CANCELLED) {
    return { status: existingOrder.order.status, isCancelling: false }
  }
  return { status: newOrder.status, isCancelling: newOrder.isCancelling }
}
