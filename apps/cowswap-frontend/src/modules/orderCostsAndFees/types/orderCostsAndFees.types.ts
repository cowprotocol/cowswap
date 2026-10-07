import type { MessageDescriptor } from '@lingui/core'

import type { AddressKey, Trade } from '@cowprotocol/cow-sdk'
import type { Token } from '@cowprotocol/currency'

export interface CostLineItem {
  label: MessageDescriptor
  /** Set when the same label appears more than once, counted from 1. */
  occurrence?: number
  tokenAddress: AddressKey
  amount: bigint
}

export interface OrderCostsAndFees {
  lineItems: CostLineItem[]
  totals: Array<[AddressKey, bigint]>
  nativeToken: Token
  /** Every cost in the order's surplus token; absent when any of them can't be converted. */
  surplusCosts?: SurplusTokenCosts & { token: Token }
}

export type OrderCostsAndFeesState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'ready'; costs: OrderCostsAndFees }

/** An order's trades with the execution data they were fetched for, so they are never mixed with newer fills. */
export interface OrderTradesSnapshot {
  orderId: string
  gasCost: bigint
  executedSellAmount: bigint
  executedBuyAmount: bigint
  trades: Array<Pick<Trade, 'executedProtocolFees'>>
}

export interface PartnerFeePolicy {
  type: ProtocolFeeType
  /** Declared rate as a fraction (bps / 10 000), same units as `FeePolicy` factors. */
  factor: number
  recipient: AddressKey
}

/** One fee policy's total across all of an order's fills. */
export interface ProtocolFee {
  amount: bigint
  tokenAddress: AddressKey
  type: ProtocolFeeType
  /** Policy-specific rate: a fraction of volume, of price improvement or of surplus. */
  factor?: number
  /** Index in a fill's `executedProtocolFees`; the order the fees were applied in. */
  position: number
  owner: ProtocolFeeOwner
  /** Partner fees only: partners counted from 1, never named. Fees sharing a recipient share a number. */
  partnerNumber?: number
  recipient?: AddressKey
}

export interface SurplusTokenCost {
  amount: bigint
  /** Converted from native at the current price rather than at execution. */
  isApproximate: boolean
}

/** Every cost converted into the order's surplus token; `items` is index-aligned with the line items. */
export interface SurplusTokenCosts {
  items: SurplusTokenCost[]
  total: bigint
  isApproximate: boolean
}

/** The API doesn't say who a fee is for; this is derived from the order's app data. */
export enum ProtocolFeeOwner {
  Protocol = 'protocol',
  Partner = 'partner',
}

export enum ProtocolFeeType {
  Surplus = 'surplus',
  Volume = 'volume',
  PriceImprovement = 'priceImprovement',
  Unknown = 'unknown',
}
