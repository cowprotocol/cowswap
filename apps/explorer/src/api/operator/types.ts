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
 * How a protocol fee was calculated, derived from the trade's fee policy.
 * Used to label each fee so the different fees on an order can be told apart.
 */
export enum ProtocolFeeType {
  Surplus = 'surplus',
  Volume = 'volume',
  PriceImprovement = 'priceImprovement',
  Unknown = 'unknown',
}

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
   * The fee policy's `factor`, when known. Its meaning is policy-specific: for
   * {@link ProtocolFeeType.Volume} / {@link ProtocolFeeType.PriceImprovement} it's a fraction of
   * trade volume / price improvement; for surplus fees a fraction of the surplus.
   */
  factor?: number
  /**
   * The fee policy's position in the trade's applied-fee order (`executedProtocolFees` is "listed
   * in the order they got applied"). Fee policies are fixed per order, so the same position refers
   * to the same policy in every fill. Position 0 is the protocol's own fee; the fees that follow
   * it are partner fees (the API doesn't otherwise distinguish protocol from partner).
   */
  position: number
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
  // Derived client-side from the trades' executedProtocolFees (not returned directly on the order).
  // Aggregated per category (token + fee type).
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

// Raw API response.
// `gasCost` is served by the orderbook (decimal string of native-token wei, summed across the
// order's fills) but isn't yet in the SDK's EnrichedOrder type — added here until the SDK ships it.
export type RawOrder = EnrichedOrder & { gasCost?: string | null }

export type RawOrderStatusFromAPI = (typeof RAW_ORDER_STATUS)[keyof typeof RAW_ORDER_STATUS]

/**
 * Raw API trade response type
 */
export type RawTrade = TradeMetaData

/**
 * Enriched Trade type
 */
export type Trade = Pick<RawTrade, 'blockNumber' | 'logIndex' | 'owner' | 'txHash' | 'executedProtocolFees'> & {
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

export type { SolverCompetitionResponse }
