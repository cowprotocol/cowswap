import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { Writable } from 'types'

import { OrderID } from 'api/gnosisProtocol'

import {
  addOrUpdateOrders,
  addPendingOrder,
  cancelOrdersBatch,
  clearOrders,
  CREATING_STATES,
  expireOrdersBatch,
  fulfillOrdersBatch,
  invalidateOrdersBatch,
  OrderInfoApi,
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
import { ContractDeploymentBlocks } from './consts'

export interface OrderObject {
  id: OrderID
  order: SerializedOrder
}

type V2Order = Omit<OrderObject['order'], 'inputToken' | 'outputToken'>

// Previous order state, to use in checks
// in case users have older, stale state and we need to handle
export interface V2OrderObject {
  id: OrderObject['id']
  order: V2Order
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<OrderID, OrderObject>
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
  { payload: { chainId } }: PayloadAction<PrefillStateRequired>
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

function getOrderById(state: Required<OrdersState>, chainId: ChainId, id: string) {
  const stateForChain = state[chainId]
  return (
    stateForChain.pending[id] ||
    stateForChain.presignaturePending[id] ||
    stateForChain.cancelled[id] ||
    stateForChain.expired[id] ||
    stateForChain.fulfilled[id] ||
    stateForChain.creating[id] ||
    stateForChain.failed[id]
  )
}

function deleteOrderById(state: Required<OrdersState>, chainId: ChainId, id: string) {
  const stateForChain = state[chainId]
  delete stateForChain.pending[id]
  delete stateForChain.fulfilled[id]
  delete stateForChain.presignaturePending[id]
  delete stateForChain.expired[id]
  delete stateForChain.cancelled[id]
  delete stateForChain.creating[id]
  delete stateForChain.failed[id]
}

function addOrderToState(
  state: Required<OrdersState>,
  chainId: ChainId,
  id: string,
  status: OrderTypeKeys,
  order: SerializedOrder
): void {
  // Attempt to fix `TypeError: Cannot add property <x>, object is not extensible`
  // seen on https://user-images.githubusercontent.com/34510341/138450105-bb94a2d1-656e-4e15-ae99-df9fb33c8ca4.png
  // by creating a new object instead of trying to edit the existing one
  // Seems to be due to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions
  // but only happened on Chrome
  state[chainId][status] = { ...state[chainId][status], [id]: { order, id } }
}

function popOrder(state: OrdersState, chainId: ChainId, status: OrderStatus, id: string): OrderObject | undefined {
  const orderObj = state?.[chainId]?.[status]?.[id]
  if (orderObj) {
    delete state?.[chainId]?.[status]?.[id]
  }
  return orderObj
}

function getValidTo(apiAdditionalInfo: OrderInfoApi | undefined, order: SerializedOrder): number {
  return (apiAdditionalInfo?.ethflowData?.userValidTo || order.validTo) as number
}

const initialState: OrdersState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addPendingOrder, (state, action) => {
      prefillState(state, action)
      const { order, id, chainId } = action.payload

      order.openSince = CREATING_STATES.includes(order.status) ? undefined : Date.now()

      switch (order.status) {
        // EthFlow or PreSign orders have their respective buckets
        case OrderStatus.CREATING: // ethflow orders
        case OrderStatus.PRESIGNATURE_PENDING: // pre-sign orders
          addOrderToState(state, chainId, id, order.status, order)
          break
        default:
          // Regular orders go into the pending bucket
          addOrderToState(state, chainId, id, 'pending', order)
      }
    })
    .addCase(preSignOrders, (state, action) => {
      prefillState(state, action)
      const { ids, chainId } = action.payload

      const now = Date.now()

      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.PENDING
          orderObject.order.openSince = now

          addOrderToState(state, chainId, id, 'pending', orderObject.order)
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
      const { chainId, orders } = action.payload

      orders.forEach((newOrder) => {
        const { id, status } = newOrder

        // sanity check, is the status set?
        if (!status) {
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

        const validTo = getValidTo(newOrder.apiAdditionalInfo, newOrder)
        const isComposableCowOrder = !!newOrder?.composableCowInfo
        // merge existing and new order objects
        const order = orderObj
          ? {
              ...orderObj.order,
              validTo,
              composableCowInfo: newOrder.composableCowInfo,
              apiAdditionalInfo: newOrder.apiAdditionalInfo,
              // Don't reset isCancelling status for ComposableCow orders
              // Because currently we don't have a backend for it
              // And this status is stored only on Frontend
              isCancelling: isComposableCowOrder ? !!orderObj.order.isCancelling : newOrder.isCancelling,
              class: newOrder.class,
              openSince: newOrder.openSince || orderObj.order.openSince,
              status,
            }
          : { ...newOrder, validTo }

        // add order to respective state
        addOrderToState(state, chainId, id, status, order)
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
      const { ordersData, chainId } = action.payload

      // if there are any newly fulfilled orders
      // update them
      ordersData.forEach(({ id, fulfillmentTime, transactionHash, apiAdditionalInfo }) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.FULFILLED
          orderObject.order.fulfillmentTime = fulfillmentTime

          orderObject.order.fulfilledTransactionHash = transactionHash
          orderObject.order.isCancelling = false
          // EthFlow orders validTo is different
          orderObject.order.validTo = getValidTo(apiAdditionalInfo, orderObject.order)

          orderObject.order.apiAdditionalInfo = apiAdditionalInfo

          addOrderToState(state, chainId, id, 'fulfilled', orderObject.order)
        }
      })
    })
    .addCase(expireOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId } = action.payload

      // if there are any newly fulfilled orders
      // update them
      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.EXPIRED
          orderObject.order.isCancelling = false

          addOrderToState(state, chainId, id, 'expired', orderObject.order)
        }
      })
    })
    .addCase(invalidateOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId } = action.payload

      // if there are any newly fulfilled orders
      // update them
      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.FAILED
          orderObject.order.isCancelling = false

          addOrderToState(state, chainId, id, 'failed', orderObject.order)
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
      const { ids, chainId } = action.payload

      ids.forEach((id) => {
        const orderObject = getOrderById(state, chainId, id)

        if (orderObject) {
          deleteOrderById(state, chainId, id)

          orderObject.order.status = OrderStatus.CANCELLED
          orderObject.order.isCancelling = false

          addOrderToState(state, chainId, id, 'cancelled', orderObject.order)
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
)
