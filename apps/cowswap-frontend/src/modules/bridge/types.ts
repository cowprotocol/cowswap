import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from '../trade'

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
  receiveAmount: CurrencyAmount<Currency>
  receiveAmountUsd: CurrencyAmount<Token> | null
}
