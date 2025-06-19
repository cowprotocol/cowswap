import { EnrichedOrder, OrderClass, OrderCreation, SupportedChainId as ChainId, UID } from '@cowprotocol/cow-sdk'
import { BigNumberish } from '@ethersproject/bignumber'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Token } from '@uniswap/sdk-core'

import { createAction } from '@reduxjs/toolkit'

import { ComposableCowInfo } from 'common/types'

import { SerializedToken } from '../user/types'

export enum OrderStatus {
  PENDING = 'pending',
  PRESIGNATURE_PENDING = 'presignaturePending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  CREATING = 'creating',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

// Common states groups
export const PENDING_STATES = [
  OrderStatus.PENDING,
  OrderStatus.PRESIGNATURE_PENDING,
  OrderStatus.CREATING,
  OrderStatus.SCHEDULED,
]
export const CONFIRMED_STATES = [OrderStatus.FULFILLED, OrderStatus.EXPIRED, OrderStatus.CANCELLED, OrderStatus.FAILED]
export const CREATING_STATES = [OrderStatus.PRESIGNATURE_PENDING, OrderStatus.CREATING, OrderStatus.SCHEDULED]

// Abstract type for the order used in the Dapp. It's composed out of 3 types of props:
//  - Information present in the order creation type used in the API to post new orders
//  - Additional information available in the API
//  - Derived/additional information that is handy for this app
// Doesn't have input/output tokens, these are declared in the subtypes of this base type
// includes sellAmountBeforeFee as this is required for checking unfillable orders
export interface BaseOrder extends OrderCreation {
  id: UID // Unique identifier for the order: 56 bytes encoded as hex without 0x
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
  refundHash?: string

  cancellationHash?: string // Filled when a hard cancellation is triggered. Be it ethflow or regular order

  // Additional information from the order available in the API
  apiAdditionalInfo?: OrderInfoApi
  // De-normalizing it as this is known at order placement time as `appData`,
  // but when returned from the api is replaced with the `appDataHash`
  fullAppData?: EnrichedOrder['fullAppData']

  // Wallet specific
  presignGnosisSafeTxHash?: string // Gnosis Safe tx
  presignGnosisSafeTx?: SafeMultisigTransactionResponse // Gnosis Safe transaction info

  // Sell amount before the fee applied - necessary for later calculations (unfilled orders)
  sellAmountBeforeFee: BigNumberish

  // For tracking how long an order has been pending
  openSince?: number

  /**
   * Whether the order should be hidden in the UI
   *
   * Orders are temporarily hidden from the moment the order is created in the backend
   * until we get a confirmation from the wallet that the onchain transaction has been created
   *
   * Useful for onchain orders only, as the order placement process is not atomic
   *
   * Keep in mind that we cannot tell whether the order should be hidden if we only have backend info
   * The order data is local to the device where the order was initiated
   */
  isHidden?: boolean

  /**
   * ComposableCoW-specific info
   */
  composableCowInfo?: ComposableCowInfo
}

/**
 * Additional order information coming from the API
 * When you fetch orders by orderId, the API provides some additional information not available at creation time.
 * This type models the fields that are present in this endpoint and not in the creation time order.
 *
 * Note it uses OrderMetaData, which is the return type of the endpoint that gets an order by orderId
 */
export type OrderInfoApi = Pick<
  EnrichedOrder,
  | 'creationDate'
  | 'availableBalance'
  | 'executedBuyAmount'
  | 'executedSellAmount'
  | 'executedSellAmountBeforeFees'
  | 'executedFeeAmount'
  | 'executedFee'
  | 'executedFeeToken'
  | 'totalFee'
  | 'invalidated'
  | 'ethflowData'
  | 'onchainOrderData'
  | 'class'
  | 'fullAppData'
  | 'signingScheme'
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
  id: UID
  chainId: ChainId
  order: SerializedOrder
  isSafeWallet: boolean
}

export type ChangeOrderStatusParams = { id: UID; chainId: ChainId }
export type SetOrderCancellationHashParams = ChangeOrderStatusParams & { hash: string }

export const addPendingOrder = createAction<AddPendingOrderParams>('order/addPendingOrder')

export interface OrderFulfillmentData {
  id: UID
  fulfillmentTime: string
  transactionHash: string
  summary?: string
  order: EnrichedOrder
}

export interface AddOrUpdateOrdersParams {
  chainId: ChainId
  orders: SerializedOrder[]
  isSafeWallet: boolean
}

export interface UpdateOrderParams {
  chainId: ChainId
  order: Partial<Omit<SerializedOrder, 'id'>> & Pick<SerializedOrder, 'id'>
  isSafeWallet: boolean
}

export interface FulfillOrdersBatchParams {
  orders: EnrichedOrder[]
  chainId: ChainId
  isSafeWallet: boolean
}

export interface BatchOrdersUpdateParams {
  ids: UID[]
  chainId: ChainId
  isSafeWallet: boolean
}

export type PresignedOrdersParams = BatchOrdersUpdateParams

export interface UpdatePresignGnosisSafeTxParams {
  orderId: UID
  chainId: ChainId
  safeTransaction: SafeMultisigTransactionResponse
}

export type ExpireOrdersBatchParams = BatchOrdersUpdateParams
export type InvalidateOrdersBatchParams = BatchOrdersUpdateParams
export type CancelOrdersBatchParams = BatchOrdersUpdateParams
export type DeleteOrdersParams = Pick<BatchOrdersUpdateParams, 'ids' | 'chainId'>

export const addOrUpdateOrders = createAction<AddOrUpdateOrdersParams>('order/addOrUpdateOrders')

export const updateOrder = createAction<UpdateOrderParams>('order/updateOrder')

export const fulfillOrdersBatch = createAction<FulfillOrdersBatchParams>('order/fullfillOrdersBatch')

export const preSignOrders = createAction<PresignedOrdersParams>('order/presignOrders')

export const updatePresignGnosisSafeTx = createAction<UpdatePresignGnosisSafeTxParams>(
  'order/updatePresignGnosisSafeTx',
)

export const expireOrdersBatch = createAction<ExpireOrdersBatchParams>('order/expireOrdersBatch')

export const invalidateOrdersBatch = createAction<InvalidateOrdersBatchParams>('order/invalidateOrdersBatch')

export const setOrderCancellationHash = createAction<SetOrderCancellationHashParams>('order/setOrderCancellationHash')

export const requestOrderCancellation = createAction<ChangeOrderStatusParams>('order/requestOrderCancellation')

export const cancelOrdersBatch = createAction<CancelOrdersBatchParams>('order/cancelOrdersBatch')

export const deleteOrders = createAction<DeleteOrdersParams>('order/deleteOrders')

export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')

export const updateLastCheckedBlock = createAction<{ chainId: ChainId; lastCheckedBlock: number }>(
  'order/updateLastCheckedBlock',
)

export const clearOrdersStorage = createAction('order/clearOrdersStorage')

export type SetIsOrderUnfillableParams = {
  id: UID
  chainId: ChainId
  isUnfillable: boolean
}

export const setIsOrderUnfillable = createAction<SetIsOrderUnfillableParams>('order/setIsOrderUnfillable')

type RefundItem = { id: UID; refundHash: string }
export type SetIsOrderRefundedBatch = { chainId: ChainId; items: RefundItem[] }
export const setIsOrderRefundedBatch = createAction<SetIsOrderRefundedBatch>('order/setIsOrderRefundedBatch')
