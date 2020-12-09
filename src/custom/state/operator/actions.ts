import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'

export enum OrderKind {
  SELL,
  BUY
}

// posted to /api/v1/orders on Order creation
// serializable, so no BigNumbers
//  See https://protocol-rinkeby.dev.gnosisdev.com/api/
export interface OrderCreation {
  sellToken: string // address
  buyToken: string // address
  sellAmount: string // in atoms
  buyAmount: string // in atoms
  validTo: number // uint32. unix timestamp, seconds, use new Date(validTo * 1000)
  appData: number // arbitrary identifier sent along with the order
  feeAmount: string // in atoms
  orderType: OrderKind
  partiallyFillable: boolean
  signature: string // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
}

export enum OrderStatus {
  PENDING,
  FULFILLED
}

// used internally by dapp
export interface Order extends OrderCreation {
  id: OrderID // it is special :)
  owner: string // address
  status: OrderStatus
  fulfillmentTime?: string
  creationTime: string
}

// gotten from querying /api/v1/orders
export interface OrderFromApi extends OrderCreation {
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  owner: string // address
}

export interface AddPendingOrderParams {
  id: OrderID
  chainId: ChainId
  order: Order
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export const addPendingOrder = createAction<AddPendingOrderParams>('order/addPendingOrder')

export type Tip = number

export const updateTip = createAction<{ token: string; tip: Tip }>('operator/updateTip')
export const clearTip = createAction<{ token: string }>('operator/clearTip')
