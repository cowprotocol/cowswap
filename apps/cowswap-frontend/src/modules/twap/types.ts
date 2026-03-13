import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

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
  safeAddress: string
  id: string
  safeTxParams?: SafeTransactionParams
  executionInfo: TwapOrdersExecution
  isPrototype?: boolean
  prototypeSimulation?: TwapPrototypeSimulation
  prototypeProxyFundsClaimedAt?: string
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

export interface TwapPrototypeOrderParams {
  status?: TwapOrderStatus
  submissionDate?: string
  executedDate?: string
  confirmedPartsCount?: number
  createPartOrders?: boolean
  saltSeed?: number
  prototypeSimulation?: TwapPrototypeSimulation
}

export interface TwapPrototypeSimulation {
  partProgressMs: number
  maxConfirmedParts?: number
}

export enum TwapOrderStatus {
  WaitSigning = 'WaitSigning',
  Pending = 'Pending',
  Cancelling = 'Cancelling',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  Fulfilled = 'Fulfilled',
}

export enum TwapPrototypeScenario {
  AutoProgressOpen = 'autoProgressOpen',
  StaticOpen = 'staticOpen',
  Cancelling = 'cancelling',
  Cancelled = 'cancelled',
  Expired = 'expired',
  PartiallyExpired = 'partiallyExpired',
  PartiallyCancelled = 'partiallyCancelled',
  Fulfilled = 'fulfilled',
}
