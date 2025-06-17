import { EnrichedOrder, OrderKind, Trade as TradeMetaData } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { Network } from 'types'

export type TxHash = string

export enum OrderStatus {
  Open = 'open',
  Filled = 'filled',
  Cancelled = 'cancelled',
  Cancelling = 'cancelling',
  Expired = 'expired',
  Signing = 'signing',
  PartiallyFilled = 'partially filled',
}

export const RAW_ORDER_STATUS = {
  PRESIGNATURE_PENDING: 'presignaturePending',
  OPEN: 'open',
  FULFILLED: 'fullfilled', // Note: API has typo "fullfilled"
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

export const ORDER_FINAL_FAILED_STATUSES = [OrderStatus.Expired, OrderStatus.Cancelled]

export type RawOrderStatusFromAPI = (typeof RAW_ORDER_STATUS)[keyof typeof RAW_ORDER_STATUS]

// Raw API response
export type RawOrder = EnrichedOrder
/**
 * Enriched Order type.
 * Applies some transformations on the raw api data.
 * Some fields are kept as is.
 */
export type Order = Pick<
  RawOrder,
  | 'owner'
  | 'uid'
  | 'appData'
  | 'kind'
  | 'partiallyFillable'
  | 'signature'
  | 'class'
  | 'fullAppData'
  | 'executedFeeToken'
> & {
  receiver: string
  txHash?: string
  creationDate: Date
  expirationDate: Date
  executionDate?: Date
  buyTokenAddress: string
  buyToken?: TokenErc20 | null // undefined when not set, null when not found
  sellTokenAddress: string
  sellToken?: TokenErc20 | null
  buyAmount: BigNumber
  sellAmount: BigNumber
  executedBuyAmount: BigNumber
  executedSellAmount: BigNumber
  feeAmount: BigNumber
  executedFeeAmount: BigNumber
  executedFee: BigNumber | null
  totalFee: BigNumber
  cancelled: boolean
  status: OrderStatus
  partiallyFilled: boolean
  fullyFilled: boolean
  filledAmount: BigNumber
  filledPercentage: BigNumber
  surplusAmount: BigNumber
  surplusPercentage: BigNumber
  bridgeProviderId?: string
}

/**
 * Raw API trade response type
 */
export type RawTrade = TradeMetaData

/**
 * Enriched Trade type
 */
export type Trade = Pick<RawTrade, 'blockNumber' | 'logIndex' | 'owner' | 'txHash'> & {
  orderId: string
  kind?: OrderKind
  buyAmount: BigNumber
  sellAmount: BigNumber
  executedFee?: BigNumber
  sellAmountBeforeFees: BigNumber
  buyToken?: TokenErc20 | null
  buyTokenAddress: string
  sellToken?: TokenErc20 | null
  sellTokenAddress: string
  executionTime: Date | null
  surplusAmount?: BigNumber
  surplusPercentage?: BigNumber
}

export type WithNetworkId = { networkId: Network }

export type GetOrderParams = WithNetworkId & {
  orderId: string
}

export type GetAccountOrdersParams = WithNetworkId & {
  owner: string
  offset?: number
  limit?: number
}

export type GetOrdersParams = WithNetworkId & {
  owner: string
  minValidTo: number
  sellToken?: string
  buyToken?: string
}

export type GetTxOrdersParams = WithNetworkId & {
  txHash: TxHash
}

export type GetTradesParams = WithNetworkId & {
  owner?: string
  orderId?: string
}
