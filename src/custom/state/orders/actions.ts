import { createAction } from '@reduxjs/toolkit'
import { OrderID } from 'utils/operator'
import { OrderCreation } from 'utils/signatures'
import { ChainId, Token } from '@uniswap/sdk'
export { OrderKind } from '@gnosis.pm/gp-v2-contracts'

export enum OrderStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

// used internally by dapp
export interface Order extends Omit<OrderCreation, 'signingScheme'> {
  id: OrderID // it is special :), Unique identifier for the order: 56 bytes encoded as hex without 0x
  owner: string // address, without '0x' prefix
  status: OrderStatus
  fulfillmentTime?: string // Fulfillment time of the order. Encoded as ISO 8601 UTC
  fulfilledTransactionHash?: string // hash of transaction when Order was fulfilled
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  summary: string // for dapp use only, readable by user
  inputToken: Token // for dapp use only, readable by user
  outputToken: Token // for dapp use only, readable by user
  isCancelling?: boolean // intermediate state while the order has been cancelled but order is still pending
}

// gotten from querying /api/v1/orders
export interface OrderFromApi extends OrderCreation {
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  owner: string // address, without '0x' prefix
}

export interface AddPendingOrderParams {
  id: OrderID
  chainId: ChainId
  order: Order
}

export type ChangeOrderStatusParams = { id: OrderID; chainId: ChainId }

export const addPendingOrder = createAction<AddPendingOrderParams>('order/addPendingOrder')
export const removeOrder = createAction<ChangeOrderStatusParams>('order/removeOrder')
//                                                                        fulfillmentTime from event timestamp
export const fulfillOrder = createAction<{
  id: OrderID
  chainId: ChainId
  fulfillmentTime: string
  transactionHash: string
}>('order/fulfillOrder')

export interface OrderFulfillmentData {
  id: OrderID
  fulfillmentTime: string
  transactionHash: string
  summary?: string
}

export interface FulfillOrdersBatchParams {
  ordersData: OrderFulfillmentData[]
  chainId: ChainId
}

export const fulfillOrdersBatch = createAction<FulfillOrdersBatchParams>('order/fullfillOrdersBatch')

export const expireOrder = createAction<ChangeOrderStatusParams>('order/expireOrder')

export const expireOrdersBatch = createAction<{ ids: OrderID[]; chainId: ChainId }>('order/expireOrdersBatch')

export const cancelOrder = createAction<ChangeOrderStatusParams>('order/cancelOrder')

export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')

export const updateLastCheckedBlock = createAction<{ chainId: ChainId; lastCheckedBlock: number }>(
  'order/updateLastCheckedBlock'
)
