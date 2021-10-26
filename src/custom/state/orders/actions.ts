import { createAction } from '@reduxjs/toolkit'
import { OrderID, OrderMetaData } from 'api/gnosisProtocol'
import { OrderCreation } from 'utils/signatures'
import { Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'
import { SerializedToken } from '@src/state/user/actions'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
export { OrderKind } from '@gnosis.pm/gp-v2-contracts'

export enum OrderStatus {
  PENDING = 'pending',
  PRESIGNATURE_PENDING = 'presignaturePending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

// Abstract type for the order used in the Dapp. Its composed out of 3 types of props:
//  - Information present in the order creation type used in the API to post new orders
//  - Additional information available in the API
//  - Derived/additional information that is handy for this app
// Doesn't have input/output tokens, these are declared in the subtypes of this base type
export interface BaseOrder extends Omit<OrderCreation, 'signingScheme'> {
  id: OrderID // Unique identifier for the order: 56 bytes encoded as hex without 0x
  owner: string // Address, without '0x' prefix
  summary: string // Description of the order, for dapp use only, readable by user

  // Status
  status: OrderStatus
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  isCancelling?: boolean // Intermediate state while the order has been cancelled but order is still pending
  isUnfillable?: boolean // Whether the order is out of the market, due to price movements since placement
  fulfillmentTime?: string // Fulfillment time of the order. Encoded as ISO 8601 UTC
  fulfilledTransactionHash?: string // Hash of transaction when Order was fulfilled

  // Additional information from the order available in the API
  apiAdditionalInfo?: OrderInfoApi

  // Wallet specific
  presignGnosisSafeTxHash?: string // Gnosis Safe tx
  presignGnosisSafeTx?: SafeMultisigTransactionResponse // Gnosis Safe transaction info
}

/**
 * Additional order information coming from the API
 * When you fetch orders by orderId, the API provides some additional information not available at creation time.
 * This type models the fields that are present in this endpoint and not in the creation time order.
 *
 * Note it uses OrderMetaData, which is the return type of the endpoint that get's an order by orderId
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

export type PresignedOrdersParams = BatchOrdersUpdateParams
export interface UpdatePresignGnosisSafeTxParams {
  orderId: OrderID
  chainId: ChainId
  safeTransaction: SafeMultisigTransactionResponse
}
export type ExpireOrdersBatchParams = BatchOrdersUpdateParams
export type CancelOrdersBatchParams = BatchOrdersUpdateParams

export const fulfillOrdersBatch = createAction<FulfillOrdersBatchParams>('order/fullfillOrdersBatch')

export const expireOrder = createAction<ChangeOrderStatusParams>('order/expireOrder')

export const preSignOrders = createAction<PresignedOrdersParams>('order/presignOrders')

export const updatePresignGnosisSafeTx = createAction<UpdatePresignGnosisSafeTxParams>(
  'order/updatePresignGnosisSafeTx'
)

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
