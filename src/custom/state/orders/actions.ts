import { createAction } from '@reduxjs/toolkit'
import { UnsignedOrder } from '@src/custom/utils/signatures'
import { ChainId } from '@uniswap/sdk'

export enum OrderKind {
  SELL = 'sell',
  BUY = 'buy'
}

// posted to /api/v1/orders on Order creation
// serializable, so no BigNumbers
//  See https://protocol-rinkeby.dev.gnosisdev.com/api/
export interface OrderCreation extends UnsignedOrder {
  // TODO: I commented this because I expect the API and contract to follow the same structure for the order data. confirm and delete this comment
  signature: string // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
}

export enum OrderStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled'
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

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

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
export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')
