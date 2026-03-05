import { Currency, CurrencyAmount, Percent } from '@cowprotocol/common-entities'
import type { OrderParameters } from '@cowprotocol/cow-sdk'

export interface BridgeFeeAmounts {
  amountInSellCurrency: bigint
  amountInBuyCurrency: bigint
}

export interface ReceiveAmountInfoParams {
  orderParams: OrderParameters
  inputCurrency: Currency
  outputCurrency: Currency
  slippagePercent: Percent
  partnerFeeBps: number | undefined
  protocolFeeBps: number | undefined
}

export interface CrossChainReceiveAmountInfoParams extends ReceiveAmountInfoParams {
  intermediateCurrency: Currency
  bridgeFeeAmounts: BridgeFeeAmounts
  expectedToReceiveAmount: CurrencyAmount<Currency>
}
