import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface DirectedReceiveAmounts {
  amountBeforeFees: CurrencyAmount<Currency>
  amountAfterFees: CurrencyAmount<Currency>
  networkFeeAmount: CurrencyAmount<Currency>
}

export interface ReceiveAmountInfo {
  isSell: boolean

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
}
