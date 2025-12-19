import { TokenWithLogo } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeProviderInfo, BridgeStatusResult } from '@cowprotocol/sdk-bridging'
import type { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import type { ReceiveAmountInfo } from 'modules/trade'

import type { SolverCompetition } from 'common/types/soverCompetition'

/**
 * Possible statuses for bridge/swap stops
 */
export enum SwapAndBridgeStatus {
  DEFAULT = 'default',
  DONE = 'done',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUND_COMPLETE = 'refund_complete',
}

export interface QuoteSwapContext {
  chainName: string
  receiveAmountInfo: ReceiveAmountInfo

  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>

  slippage: Percent
  recipient: string

  isSlippageModified: boolean

  bridgeReceiverOverride: string | null
  expectedReceive: CurrencyAmount<Currency> | null
  minReceiveAmount: CurrencyAmount<Currency>
  minReceiveUsdValue: CurrencyAmount<Token> | null
  expectedReceiveUsdValue: CurrencyAmount<Token> | null
}

export interface QuoteBridgeContext {
  chainName: string

  bridgeFee: CurrencyAmount<Currency> | null
  estimatedTime: number | null
  recipient: string

  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
  buyAmountUsd: CurrencyAmount<Token> | null
  bridgeMinDepositAmount: CurrencyAmount<Currency> | null
  bridgeMinDepositAmountUsd: CurrencyAmount<Token> | null
  bridgeMinReceiveAmount: CurrencyAmount<Currency> | null
  bridgeMinReceiveAmountUsd: CurrencyAmount<Token> | null
  expectedToReceive: CurrencyAmount<Currency> | null
  expectedToReceiveUsd: CurrencyAmount<Token> | null
}

export interface SwapAndBridgeOverview<Amount = CurrencyAmount<Currency>> {
  sourceChainName: string
  targetChainName: string
  targetCurrency: Token
  targetRecipient?: string

  sourceAmounts: {
    sellAmount: Amount
    buyAmount: Amount
  }

  targetAmounts?: {
    sellAmount: Amount
    buyAmount: Amount
  }
}

export interface BridgingProgressContext {
  account: string
  sourceChainId: SupportedChainId
  destinationChainId: number

  isFailed?: boolean
  isRefunded?: boolean

  receivedAmount?: CurrencyAmount<Currency>
  receivedAmountUsd?: CurrencyAmount<Token> | null
}

export interface SwapResultContext {
  winningSolver?: SolverCompetition
  receivedAmount: CurrencyAmount<TokenWithLogo>
  receivedAmountUsd: CurrencyAmount<Token> | null
  surplusAmount: CurrencyAmount<Currency>
  surplusAmountUsd: CurrencyAmount<Token> | null
  intermediateToken: TokenWithLogo
}

export interface SwapAndBridgeContext {
  bridgingStatus: SwapAndBridgeStatus
  bridgeProvider: BridgeProviderInfo
  swapResultContext: SwapResultContext
  overview: SwapAndBridgeOverview
  quoteBridgeContext?: QuoteBridgeContext
  bridgingProgressContext?: BridgingProgressContext
  statusResult?: BridgeStatusResult
  explorerUrl?: string
}
