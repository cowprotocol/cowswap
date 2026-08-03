import {
  AddressKey,
  CompetitionOrderStatus,
  EnrichedOrder,
  OrderKind,
  SolverCompetitionResponse,
  Trade as TradeMetaData,
} from '@cowprotocol/cow-sdk'

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

export type GetAccountOrdersParams = WithNetworkId & {
  owner: string
  offset?: number
  limit?: number
}

export type GetOrderCompetitionStatusParams = WithNetworkId & {
  orderId: string
}
export type GetOrderParams = WithNetworkId & {
  orderId: string
}

export type GetOrdersParams = WithNetworkId & {
  owner: string
  minValidTo: number
  sellToken?: string
  buyToken?: string
}

export type GetSolverCompetitionByTxHashParams = WithNetworkId & {
  txHash: string
}

export type GetTradesParams = WithNetworkId & {
  owner?: string
  orderId?: string
  offset?: number
  limit?: number
}

export type GetTxOrdersParams = WithNetworkId & {
  txHash: TxHash
}

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
  // Derived client-side from the trades' executedProtocolFees (not returned directly on the order),
  // summed across fills per (position, type, token). Undefined means "not available" — still
  // loading, the fetch failed, or the breakdown is disabled — as opposed to `[]`, which means the
  // order was checked and charged no protocol fee.
  protocolFees?: ProtocolFee[]
  // On-chain gas cost attributed to the order (native-token wei), as reported by the orderbook.
  // Undefined for orders settled before this was recorded, or not yet settled.
  gasCost?: BigNumber
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

export type OrderCompetitionStatus = CompetitionOrderStatus

/**
 * A protocol fee for an order: the total charged across all fills for a given fee policy,
 * aggregated from the trades' executedProtocolFees. `tokenAddress` is a normalized AddressKey
 * (the surplus-side token the fee is taken in).
 */
export type ProtocolFee = {
  amount: BigNumber
  tokenAddress: AddressKey
  type: ProtocolFeeType
  /**
   * The fee policy's position in the trade's applied-fee order (`executedProtocolFees` is "listed
   * in the order they got applied"), used only to keep the breakdown in that same order.
   *
   * The API does not say which fee belongs to the protocol and which to an integrating partner, so
   * we deliberately don't infer it from the position — see the labels in `GasFeeDisplay`.
   */
  position: number
}

// Raw API response.
// TODO: drop the `gasCost` intersection once `EnrichedOrder` in @cowprotocol/cow-sdk declares it.
// The orderbook already serves it (decimal string of native-token wei, summed across the order's
// fills); the SDK type just hasn't caught up.
export type RawOrder = EnrichedOrder & { gasCost?: string | null }

export type RawOrderStatusFromAPI = (typeof RAW_ORDER_STATUS)[keyof typeof RAW_ORDER_STATUS]

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

/**
 * How a fee was calculated, derived from the trade's fee policy.
 * Used to label each fee so the different fees on an order can be told apart.
 */
export enum ProtocolFeeType {
  Surplus = 'surplus',
  Volume = 'volume',
  PriceImprovement = 'priceImprovement',
  Unknown = 'unknown',
}

export type { SolverCompetitionResponse }
