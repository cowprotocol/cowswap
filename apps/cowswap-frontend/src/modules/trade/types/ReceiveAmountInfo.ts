import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

export interface OrderTypeReceiveAmounts {
  amountBeforeFees: CurrencyAmount<Currency>
  amountAfterSlippage: CurrencyAmount<Currency>
  amountAfterFees: CurrencyAmount<Currency>
  networkFeeAmount: CurrencyAmount<Currency>
}

export interface Currencies {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
}

export interface BridgeFeeAmounts {
  amountInIntermediateCurrency: CurrencyAmount<Currency>
  amountInDestinationCurrency: CurrencyAmount<Currency>
}

export interface ReceiveAmountInfo {
  isSell: boolean

  quotePrice: Price<Currency, Currency>

  costs: {
    networkFee: {
      amountInSellCurrency: CurrencyAmount<Currency>
      amountInBuyCurrency: CurrencyAmount<Currency>
    }
    partnerFee: {
      amount: CurrencyAmount<Currency>
      bps: number
    }
    protocolFee?: {
      amount: CurrencyAmount<Currency>
      bps: number
    }
    bridgeFee?: BridgeFeeAmounts
  }

  beforeAllFees: Currencies

  beforeNetworkCosts: Currencies
  afterNetworkCosts: Currencies
  afterPartnerFees: Currencies
  afterSlippage: Currencies
}
