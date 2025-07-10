import { BridgeStatusResult } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapMinReceiveAmount: Amount
  bridgeMinReceiveAmount: Amount
  bridgeFee: Amount
}

export interface BridgeOrderData {
  orderUid: string
  quoteAmounts: BridgeQuoteAmounts
  creationTimestamp: number
  statusResult?: BridgeStatusResult
}
