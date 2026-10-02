import type { OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@cowprotocol/currency'

export interface BridgeFeeAmounts {
  amountInSellCurrency: bigint
  amountInBuyCurrency: bigint
}

export interface CrossChainReceiveAmountInfoParams extends ReceiveAmountInfoParams {
  intermediateCurrency: Currency
  bridgeFeeAmounts: BridgeFeeAmounts
  expectedToReceiveAmount: CurrencyAmount<Currency>
}

export interface ReceiveAmountInfoParams {
  orderParams: OrderParameters
  /**
   * Positive quote before unpriced hook gas was subtracted.
   * Used when `orderParams` sell or buy is no longer positive.
   */
  quotedOrderParams?: OrderParameters
  inputCurrency: Currency
  outputCurrency: Currency
  slippagePercent: Percent
  partnerFeeBps: number | undefined
  protocolFeeBps: number | undefined
}
