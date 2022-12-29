import { createAction } from '@reduxjs/toolkit'
import { OrderID, OrderMetaData } from '@cow/api/gnosisProtocol'
import { OrderCreation } from 'utils/signatures'
import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'
import { SerializedToken } from '@src/state/user/types'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { BigNumberish } from '@ethersproject/bignumber'
export { OrderKind } from '@cowprotocol/contracts'

export enum OrderStatus {
  PENDING = 'pending',
  PRESIGNATURE_PENDING = 'presignaturePending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  CREATING = 'creating',
  INVALID = 'invalid',
}

export enum OrderClass {
  LIMIT = 'limit',
  MARKET = 'market',
}

// Abstract type for the order used in the Dapp. It's composed out of 3 types of props:
//  - Information present in the order creation type used in the API to post new orders
//  - Additional information available in the API
//  - Derived/additional information that is handy for this app
// Doesn't have input/output tokens, these are declared in the subtypes of this base type
// includes sellAmountBeforeFee as this is required for checking unfillable orders
export interface BaseOrder extends Omit<OrderCreation, 'signingScheme'> {
  id: OrderID // Unique identifier for the order: 56 bytes encoded as hex without 0x
  owner: string // Address, without '0x' prefix
  summary: string // Description of the order, for dapp use only, readable by user
  class: OrderClass // Flag to distinguish order class

  // Status
  status: OrderStatus
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  isCancelling?: boolean // Intermediate state while the order has been cancelled but order is still pending
  isUnfillable?: boolean // Whether the order is out of the market, due to price movements since placement
  fulfillmentTime?: string // Fulfillment time of the order. Encoded as ISO 8601 UTC
  fulfilledTransactionHash?: string // Hash of transaction when Order was fulfilled

  // EthFlow
  orderCreationHash?: string
  isRefunded?: boolean
  // TODO: add refund hash here when working on that

  cancellationHash?: string // Filled when a hard cancellation is triggered. Be it ethflow or regular order

  // Additional information from the order available in the API
  apiAdditionalInfo?: OrderInfoApi

  // Wallet specific
  presignGnosisSafeTxHash?: string // Gnosis Safe tx
  presignGnosisSafeTx?: SafeMultisigTransactionResponse // Gnosis Safe transaction info

  // Sell amount before the fee applied - necessary for later calculations (unfilled orders)
  sellAmountBeforeFee: BigNumberish

  // For tracking how long an order has been pending
  openSince?: number
}

/**
 * Additional order information coming from the API
 * When you fetch orders by orderId, the API provides some additional information not available at creation time.
 * This type models the fields that are present in this endpoint and not in the creation time order.
 *
 * Note it uses OrderMetaData, which is the return type of the endpoint that gets an order by orderId
 */
export type OrderInfoApi = Pick<
  OrderMetaData,
  | 'creationDate'
  | 'availableBalance'
  | 'executedBuyAmount'
  | 'executedSellAmount'
  | 'executedSellAmountBeforeFees'
  | 'executedFeeAmount'
  | 'executedSurplusFee'
  | 'invalidated'
  | 'ethflowData'
>

/**
 * Order as used by the Dapp
 */
export interface Order extends BaseOrder {
  inputToken: Token // for dapp use only, readable by user
  outputToken: Token // for dapp use only, readable by user
}

/**
 * Order used for persisting it in the state.
 * The only difference with Order is that all it's fields are serializable
 */
export interface SerializedOrder extends BaseOrder {
  inputToken: SerializedToken // for dapp use only, readable by user
  outputToken: SerializedToken // for dapp use only, readable by user
}

export interface AddPendingOrderParams {
  id: OrderID
  chainId: ChainId
  order: SerializedOrder
}
export type ChangeOrderStatusParams = { id: OrderID; chainId: ChainId }
export type SetOrderCancellationHashParams = ChangeOrderStatusParams & { hash: string }

export const addPendingOrder = createAction<AddPendingOrderParams>('order/addPendingOrder')

export interface OrderFulfillmentData {
  id: OrderID
  fulfillmentTime: string
  transactionHash: string
  summary?: string
  apiAdditionalInfo?: OrderInfoApi
}

export interface AddOrUpdateOrdersParams {
  chainId: ChainId
  orders: SerializedOrder[]
}

export interface UpdateOrderParams {
  chainId: ChainId
  order: Partial<Omit<SerializedOrder, 'id'>> & Pick<SerializedOrder, 'id'>
}

export interface FulfillOrdersBatchParams {
  ordersData: OrderFulfillmentData[]
  chainId: ChainId
}

export interface BatchOrdersUpdateParams {
  ids: OrderID[]
  chainId: ChainId
}

export type PresignedOrdersParams = BatchOrdersUpdateParams
export interface UpdatePresignGnosisSafeTxParams {
  orderId: OrderID
  chainId: ChainId
  safeTransaction: SafeMultisigTransactionResponse
}
export type ExpireOrdersBatchParams = BatchOrdersUpdateParams
export type InvalidateOrdersBatchParams = BatchOrdersUpdateParams
export type CancelOrdersBatchParams = BatchOrdersUpdateParams

export const addOrUpdateOrders = createAction<AddOrUpdateOrdersParams>('order/addOrUpdateOrders')

export const updateOrder = createAction<UpdateOrderParams>('order/updateOrder')

export const fulfillOrdersBatch = createAction<FulfillOrdersBatchParams>('order/fullfillOrdersBatch')

export const preSignOrders = createAction<PresignedOrdersParams>('order/presignOrders')

export const updatePresignGnosisSafeTx = createAction<UpdatePresignGnosisSafeTxParams>(
  'order/updatePresignGnosisSafeTx'
)

export const expireOrdersBatch = createAction<ExpireOrdersBatchParams>('order/expireOrdersBatch')

export const invalidateOrdersBatch = createAction<InvalidateOrdersBatchParams>('order/invalidateOrdersBatch')

export const setOrderCancellationHash = createAction<SetOrderCancellationHashParams>('order/setOrderCancellationHash')

export const requestOrderCancellation = createAction<ChangeOrderStatusParams>('order/requestOrderCancellation')

export const cancelOrdersBatch = createAction<CancelOrdersBatchParams>('order/cancelOrdersBatch')

export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')

export const updateLastCheckedBlock = createAction<{ chainId: ChainId; lastCheckedBlock: number }>(
  'order/updateLastCheckedBlock'
)

export type SetIsOrderUnfillableParams = {
  id: OrderID
  chainId: ChainId
  isUnfillable: boolean
}

export const setIsOrderUnfillable = createAction<SetIsOrderUnfillableParams>('order/setIsOrderUnfillable')

export type SetIsOrderRefundedBatch = { chainId: ChainId; ids: OrderID[] }
export const setIsOrderRefundedBatch = createAction<SetIsOrderRefundedBatch>('order/setIsOrderRefundedBatch')
