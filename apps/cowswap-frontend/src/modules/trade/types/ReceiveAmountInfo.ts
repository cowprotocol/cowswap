import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

export interface OrderTypeReceiveAmounts {
  amountBeforeFees: CurrencyAmount<Currency>
  amountAfterSlippage: CurrencyAmount<Currency>
  amountAfterFees: CurrencyAmount<Currency>
  networkFeeAmount: CurrencyAmount<Currency>
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
  }

  beforeNetworkCosts: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
  afterNetworkCosts: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
  afterPartnerFees: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
  afterSlippage: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
}
