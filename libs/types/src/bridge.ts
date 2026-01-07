import type { BridgeStatusResult } from '@cowprotocol/sdk-bridging'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import type { TokenInfo } from './common'

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
}

export interface BridgeOrderData<T = BridgeQuoteAmounts> {
  orderUid: string
  quoteAmounts: T
  creationTimestamp: number
  statusResult?: BridgeStatusResult
  recipient: string
}

export type SerializedAmount = {
  token: TokenInfo
  amount: string
}

export type SerializedBridgeAmounts = BridgeQuoteAmounts<SerializedAmount>
export type BridgeOrderDataSerialized = BridgeOrderData<SerializedBridgeAmounts>
