import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapMinReceiveAmount: Amount // that should be moved on bridge (before sending to user)
  bridgeMinReceiveAmount: Amount // that should be moved to user
  bridgeFee: Amount
}

export interface BridgeOrderQuoteData {
  orderUid: string
  amounts: BridgeQuoteAmounts
  creationTimestamp: number
}
