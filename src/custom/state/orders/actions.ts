import { createAction } from '@reduxjs/toolkit'
import { OrderID } from 'utils/operator'
import { OrderCreation } from 'utils/signatures'
import { ChainId } from '@uniswap/sdk'
export { OrderKind } from '@gnosis.pm/gp-v2-contracts'

export enum OrderStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired'
}

// used internally by dapp
export interface Order extends OrderCreation {
  id: OrderID // it is special :), Unique identifier for the order: 56 bytes encoded as hex without 0x
  owner: string // address, without '0x' prefix
  status: OrderStatus
  fulfillmentTime?: string
  creationTime: string
  summary: string // for dapp use only, readable by user
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

export const addPendingOrder = createAction<AddPendingOrderParams>('order/addPendingOrder')
export const removeOrder = createAction<{ id: OrderID; chainId: ChainId }>('order/removeOrder')
//                                                                        fulfillmentTime from event timestamp
export const fulfillOrder = createAction<{ id: OrderID; chainId: ChainId; fulfillmentTime: string }>(
  'order/fulfillOrder'
)
export const expireOrder = createAction<{ id: OrderID; chainId: ChainId }>('order/expireOrder')
export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')

export const updateLastCheckedBlock = createAction<{ chainId: ChainId; lastCheckedBlock: number }>(
  'order/updateLastCheckedBlock'
)
