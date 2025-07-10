import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapMinReceiveAmount: Amount
  bridgeMinReceiveAmount: Amount
  bridgeFee: Amount
}

export interface BridgeOrderQuoteData {
  orderUid: string
  amounts: BridgeQuoteAmounts
  creationTimestamp: number
}
