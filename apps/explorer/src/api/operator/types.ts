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
  // Derived client-side from the trades. Undefined when unknown; `[]` means no fee was charged.
  protocolFees?: ProtocolFee[]
  // Native-token wei, from the orderbook. Undefined if unsettled, or settled before it was recorded.
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

/** One fee policy's total across all of an order's fills. */
export type ProtocolFee = {
  amount: BigNumber
  tokenAddress: AddressKey
  type: ProtocolFeeType
  /**
   * The fee policy's `factor`, when known. Its meaning is policy-specific: a fraction of trade
   * volume, of price improvement, or of the surplus, per {@link type}.
   */
  factor?: number
  // Index in a fill's `executedProtocolFees`; preserves the order the fees were applied in.
  position: number
  owner: ProtocolFeeOwner
  /**
   * Which partner charged the fee, counted from 1 in the order the partners' fees appear. Set on
   * partner fees only. Partners are told apart but never named, so the label says "Partner 2"
   * rather than who it is; fees sharing a {@link recipient} share a number. One partner using a
   * different recipient per fee kind counts as two partners — see `numberPartners` for why.
   */
  partnerNumber?: number
  /** The partner's fee recipient, when the fee mapped to a declared partner policy. */
  recipient?: string
}

// TODO: drop the `gasCost` intersection once `EnrichedOrder` in @cowprotocol/cow-sdk declares it.
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
 * Who a fee in `executedProtocolFees` was charged for. The API doesn't say, so it is derived by
 * mapping the applied policies onto the partner fee policies the order declared in its app data.
 */
export enum ProtocolFeeOwner {
  Protocol = 'protocol',
  /** An integrator, from a `metadata.partnerFee` policy in the order's app data. */
  Partner = 'partner',
}

export enum ProtocolFeeType {
  Surplus = 'surplus',
  Volume = 'volume',
  PriceImprovement = 'priceImprovement',
  Unknown = 'unknown',
}

export type { SolverCompetitionResponse }
