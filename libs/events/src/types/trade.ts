import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { OrderKind } from '@cowprotocol/cow-sdk'

export type OnTradeParamsPayload = { orderType: UiOrderType } & Partial<{
  inputCurrency: TokenInfo
  outputCurrency: TokenInfo
  inputCurrencyAmount: bigint
  outputCurrencyAmount: bigint
  inputCurrencyBalance: bigint
  outputCurrencyBalance: bigint
  inputCurrencyFiatAmount: bigint
  outputCurrencyFiatAmount: bigint
  slippageAdjustedSellAmount: bigint
  orderKind: OrderKind
  recipient: string
}>
