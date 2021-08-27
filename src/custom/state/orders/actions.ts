import { createAction } from '@reduxjs/toolkit'
import { OrderID, OrderMetaData } from 'utils/operator'
import { OrderCreation } from 'utils/signatures'
import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'
import { SerializedToken } from '@src/state/user/actions'
export { OrderKind } from '@gnosis.pm/gp-v2-contracts'

export enum OrderStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

// used internally by dapp
export interface BaseOrder extends Omit<OrderCreation, 'signingScheme'> {
  id: OrderID // it is special :), Unique identifier for the order: 56 bytes encoded as hex without 0x
  owner: string // address, without '0x' prefix
  status: OrderStatus
  fulfillmentTime?: string // Fulfillment time of the order. Encoded as ISO 8601 UTC
  fulfilledTransactionHash?: string // hash of transaction when Order was fulfilled
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  summary: string // for dapp use only, readable by user
  isCancelling?: boolean // intermediate state while the order has been cancelled but order is still pending
  isUnfillable?: boolean // whether the order is out of the market, due to price movements since placement
  apiAdditionalInfo?: OrderInfoApi
}

/**
 * The API provides some additional information
 */
type OrderInfoApi = Pick<
  OrderMetaData,
  | 'creationDate'
  | 'availableBalance'
  | 'executedBuyAmount'
  | 'executedSellAmount'
  | 'executedSellAmountBeforeFees'
  | 'executedFeeAmount'
  | 'invalidated'
>

export interface Order extends BaseOrder {
  inputToken: Token // for dapp use only, readable by user
  outputToken: Token // for dapp use only, readable by user
}

export interface SerializedOrder extends BaseOrder {
  inputToken: SerializedToken // for dapp use only, readable by user
  outputToken: SerializedToken // for dapp use only, readable by user
}

// gotten from querying /api/v1/orders
export interface OrderFromApi extends OrderCreation {
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  owner: string // address, without '0x' prefix
}

export interface AddPendingOrderParams {
  id: OrderID
  chainId: ChainId
  order: SerializedOrder
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
  apiAdditionalInfo?: OrderInfoApi
}

export interface FulfillOrdersBatchParams {
  ordersData: OrderFulfillmentData[]
  chainId: ChainId
}

export interface BatchOrdersUpdateParams {
  ids: OrderID[]
  chainId: ChainId
}
export type ExpireOrdersBatchParams = BatchOrdersUpdateParams
export type CancelOrdersBatchParams = BatchOrdersUpdateParams

export const fulfillOrdersBatch = createAction<FulfillOrdersBatchParams>('order/fullfillOrdersBatch')

export const expireOrder = createAction<ChangeOrderStatusParams>('order/expireOrder')

export const expireOrdersBatch = createAction<ExpireOrdersBatchParams>('order/expireOrdersBatch')

export const requestOrderCancellation = createAction<ChangeOrderStatusParams>('order/requestOrderCancellation')

export const cancelOrder = createAction<ChangeOrderStatusParams>('order/cancelOrder')

export const cancelOrdersBatch = createAction<CancelOrdersBatchParams>('order/cancelOrdersBatch')

export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')

export const updateLastCheckedBlock =
  createAction<{ chainId: ChainId; lastCheckedBlock: number }>('order/updateLastCheckedBlock')

export type SetIsOrderUnfillableParams = {
  id: OrderID
  chainId: ChainId
  isUnfillable: boolean
}

export const setIsOrderUnfillable = createAction<SetIsOrderUnfillableParams>('order/setIsOrderUnfillable')
