import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import { StopStatusEnum } from './utils'

import { ReceiveAmountInfo } from '../trade'

import type { SolverCompetition } from '../orderProgressBar'

export interface QuoteSwapContext {
  chainName: string
  receiveAmountInfo: ReceiveAmountInfo

  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>

  slippage: Percent
  recipient: string

  minReceiveAmount: CurrencyAmount<Currency>
  minReceiveUsdValue: CurrencyAmount<Token> | null
  expectedReceiveUsdValue: CurrencyAmount<Token> | null
}

export interface QuoteBridgeContext {
  chainName: string

  bridgeFee: CurrencyAmount<Currency>
  estimatedTime: number | null
  recipient: string

  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  buyAmountUsd: CurrencyAmount<Token> | null
}

export interface BridgingProgressContext {
  account: string

  isFailed?: boolean
  isRefunded?: boolean

  receivedAmount?: CurrencyAmount<Currency>
  receivedAmountUsd?: CurrencyAmount<Token> | null
}

export interface SwapResultContext {
  winningSolver: SolverCompetition
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null
  surplusAmount: CurrencyAmount<Currency>
  surplusAmountUsd: CurrencyAmount<Token> | null
}

export interface SwapAndBridgeContext {
  bridgeProvider: BridgeProviderInfo
  quoteSwapContext: QuoteSwapContext
  swapResultContext: SwapResultContext

  quoteBridgeContext: QuoteBridgeContext
  bridgingProgressContext: BridgingProgressContext
  bridgingStatus: StopStatusEnum
}
