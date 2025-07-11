import { TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeStatusResult } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<TokenWithLogo>> {
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
}
