import { Currency, CurrencyAmount, Price } from '@cowprotocol/currency'

export interface NetworkFeeAmounts {
  amountInSellCurrency: CurrencyAmount<Currency>
  amountInBuyCurrency: CurrencyAmount<Currency>
}

export interface FeeAmounts {
  amount: CurrencyAmount<Currency>
  bps: number
}

export interface BridgeFee {
  amountInIntermediateCurrency: CurrencyAmount<Currency>
  amountInDestinationCurrency: CurrencyAmount<Currency>
}

export interface Currencies {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
}

export interface OrderTypeReceiveAmounts {
  amountBeforeFees: CurrencyAmount<Currency>
  amountAfterSlippage: CurrencyAmount<Currency>
  amountAfterFees: CurrencyAmount<Currency>
  networkFeeAmount: CurrencyAmount<Currency>
}

export interface ReceiveAmountInfoCosts {
  networkFee: NetworkFeeAmounts
  partnerFee: FeeAmounts
  protocolFee?: FeeAmounts
  bridgeFee?: BridgeFee
}

export interface ReceiveAmountInfo {
  isSell: boolean

  quotePrice: Price<Currency, Currency>

  costs: ReceiveAmountInfoCosts

  beforeAllFees: Currencies

  beforeNetworkCosts: Currencies
  afterNetworkCosts: Currencies
  afterPartnerFees: Currencies
  afterSlippage: Currencies
  amountsToSign: Currencies
}
