import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { SafeTransactionParams } from 'common/types'

export interface ConditionalOrderParams {
  staticInput: string
  salt: string
  handler: string
}

// Read more: https://github.com/rndlabs/composable-cow#data-structure
export interface TWAPOrder {
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
  receiver: string
  numOfParts: number
  startTime: number
  timeInterval: number
  span: number
  appData: string
}

export interface TwapOrderExecutionInfo {
  executedSellAmount: string
  executedBuyAmount: string
  executedFeeAmount: string
}

export interface TwapOrderInfo {
  id: string
  orderStruct: TWAPOrderStruct
  safeData: TwapOrdersSafeData
}

export interface TwapOrderItem {
  order: TWAPOrderStruct
  status: TwapOrderStatus
  chainId: SupportedChainId
  executedDate?: string
  submissionDate: string
  // TODO: Consider renaming to ownerAddress, as this is:
  // - Safe address for Safe TWAP
  // - Proxy (CoW Shed) address for EOA TWAP
  safeAddress: string
  /** Canonical owner: the EOA controlling a CoW Shed, otherwise `safeAddress`. */
  resolvedOwner: string
  /** Creation-event identity used by the UI. */
  id: string
  /** ComposableCoW hash. For legacy Safe rows this is `id`. */
  hash?: string
  safeTxParams?: SafeTransactionParams
  /** Indexed part-order count. Undefined for Safe and optimistic rows. */
  partOrdersCount?: number
  executionInfo: TwapOrdersExecution
}

export type TwapOrdersAuthResult = { [key: string]: boolean | undefined }

export type TwapOrdersExecution = { info: TwapOrderExecutionInfo; confirmedPartsCount: number }

export interface TwapOrdersSafeData {
  conditionalOrderParams: ConditionalOrderParams
  safeTxParams: SafeTransactionParams
}

export interface TWAPOrderStruct {
  sellToken: string
  buyToken: string
  receiver: string
  partSellAmount: string
  minPartLimit: string
  // timeStart
  t0: number
  // numOfParts
  n: number
  // timeInterval
  t: number
  span: number
  appData: string
}

export enum TwapOrderStatus {
  WaitSigning = 'WaitSigning',
  Pending = 'Pending',
  Cancelling = 'Cancelling',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  Fulfilled = 'Fulfilled',
}
