import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { SafeTransactionParams } from '../../common/types'

// Read more: https://github.com/rndlabs/composable-cow#data-structure
export interface TWAPOrder {
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
  receiver: string
  numOfParts: number
  startTime: number
  timeInterval: number
  span: number
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
}

export enum TwapOrderStatus {
  WaitSigning = 'WaitSigning',
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

export interface TwapOrdersSafeData {
  conditionalOrderParams: ConditionalOrderParams
  safeTxParams: SafeTransactionParams
}

export interface TwapOrderItem {
  order: TWAPOrderStruct
  status: TwapOrderStatus
  chainId: SupportedChainId
  submissionDate: string
  safeAddress: string
  id: string
  safeTxParams?: SafeTransactionParams
}

export interface ConditionalOrderParams {
  staticInput: string
  salt: string
  handler: string
}

export interface TwapOrderInfo {
  id: string
  orderStruct: TWAPOrderStruct
  safeData: TwapOrdersSafeData
  isExpired: boolean
}

export type TwapOrdersAuthResult = { [key: string]: boolean | undefined }
