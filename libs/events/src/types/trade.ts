import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { OrderKind } from '@cowprotocol/cow-sdk'

export type OnTradeParamsPayload = { orderType: UiOrderType } & Partial<{
  inputCurrency: TokenInfo
  outputCurrency: TokenInfo
  inputCurrencyAmount: bigint
  outputCurrencyAmount: bigint
  inputCurrencyBalance: bigint
  outputCurrencyBalance: bigint
  inputCurrencyFiatAmount: string
  outputCurrencyFiatAmount: string
  /**
   * Sell amount including slippage and fees.
   * For sell orders, this value should be the same with inputCurrencyAmount
   */
  maximumSendSellAmount: bigint
  /**
   * Buy amount including slippage and fees.
   * For buy orders, this value should be the same with outputCurrencyAmount
   */
  minimumReceiveBuyAmount: bigint
  orderKind: OrderKind
  recipient: string
}>
