import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

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
  params: ConditionalOrderParams
  submissionDate: string
  executionDate: string
  isExecuted: boolean
  nonce: number
  confirmationsRequired: number
  confirmations: number
  safeTxHash: string
}

export type TwapOrdersSafeParams = Omit<TwapOrdersSafeData, 'params'>

export interface TwapOrderItem {
  order: TWAPOrderStruct
  status: TwapOrderStatus
  chainId: SupportedChainId
  submissionDate: string
  safeAddress: string
  id: string
  safeParams?: TwapOrdersSafeParams
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
