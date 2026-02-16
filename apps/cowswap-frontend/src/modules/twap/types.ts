import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { SafeTransactionParams } from 'common/types'

import type { Hex } from 'viem'

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

export interface TwapOrdersSafeData {
  conditionalOrderParams: ConditionalOrderParams
  safeTxParams: SafeTransactionParams
}

export interface TwapOrderExecutionInfo {
  executedSellAmount: string
  executedBuyAmount: string
  executedFeeAmount: string
}

export type TwapOrdersExecution = { info: TwapOrderExecutionInfo; confirmedPartsCount: number }

export interface TwapOrderItem {
  order: TWAPOrderStruct
  status: TwapOrderStatus
  chainId: SupportedChainId
  executedDate?: string
  submissionDate: string
  safeAddress: string
  id: Hex
  safeTxParams?: SafeTransactionParams
  executionInfo: TwapOrdersExecution
}

export interface ConditionalOrderParams {
  staticInput: Hex
  salt: Hex
  handler: string
}

export interface TwapOrderInfo {
  id: Hex
  orderStruct: TWAPOrderStruct
  safeData: TwapOrdersSafeData
}

export type TwapOrdersAuthResult = { [key: string]: boolean | undefined }
