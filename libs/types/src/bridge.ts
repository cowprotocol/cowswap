import type { Currency, CurrencyAmount } from '@cowprotocol/currency'
import type { BridgeStatusResult } from '@cowprotocol/sdk-bridging'

import type { TokenInfo } from './common'

export interface BridgeOrderData<T = BridgeQuoteAmounts> {
  orderUid: string
  quoteAmounts: T
  creationTimestamp: number
  statusResult?: BridgeStatusResult
  recipient: string
}

export type BridgeOrderDataSerialized = BridgeOrderData<SerializedBridgeAmounts>

export interface BridgeQuoteAmounts<Amount = CurrencyAmount<Currency>> {
  swapSellAmount: Amount
  swapBuyAmount: Amount
  swapExpectedReceive: Amount | null
  swapMinReceiveAmount: Amount // that should be moved on bridge (before sending to user)
  bridgeMinReceiveAmount: Amount // that should be moved to user
  bridgeFee: Amount
  bridgeFeeAmounts?: {
    amountInIntermediateCurrency: Amount
    amountInDestinationCurrency: Amount
  }
  // Estimated time (in seconds) the bridge leg takes to fill, captured from the quote
  // so it can be shown while the order is bridging (see issue #6459)
  expectedFillTimeSeconds?: number
}

export type SerializedAmount = {
  token: TokenInfo
  amount: string
}
export type SerializedBridgeAmounts = BridgeQuoteAmounts<SerializedAmount>
