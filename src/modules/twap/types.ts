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
  t0: number
  n: number
  t: number
  span: number
}

export enum TWAPOrderStatus {
  WaitSigning = 'WaitSigning',
  Scheduled = 'Scheduled',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

export interface TWAPOrderItem {
  order: TWAPOrderStruct
  status: TWAPOrderStatus
  safeAddress: string
  hash: string
  submissionDate: string
}

export interface ConditionalOrderParams {
  staticInput: string
  salt: string
  handler: string
}
