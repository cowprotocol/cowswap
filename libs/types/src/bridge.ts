import type { BridgeStatusResult } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapMinReceiveAmount: Amount // that should be moved on bridge (before sending to user)
  bridgeMinReceiveAmount: Amount // that should be moved to user
  bridgeFee: Amount
}

export interface BridgeOrderData<T = BridgeQuoteAmounts> {
  orderUid: string
  quoteAmounts: T
  creationTimestamp: number
  statusResult?: BridgeStatusResult
  recipient: string
}
