import { COW, GNO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

const chainId = SupportedChainId.MAINNET

const inputCurrency = COW[chainId]
const outputCurrency = GNO[chainId]

export const inputCurrencyInfoMock: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    isSell: false,
    costs: {
      networkFee: {
        amountInSellCurrency: CurrencyAmount.fromRawAmount(inputCurrency, 30 * 10 ** 18),
        amountInBuyCurrency: CurrencyAmount.fromRawAmount(outputCurrency, 52 * 10 ** 18),
      },
      partnerFee: {
        amount: CurrencyAmount.fromRawAmount(inputCurrency, 0),
        bps: 0,
      },
    },
    beforeNetworkCosts: {
      sellAmount: CurrencyAmount.fromRawAmount(inputCurrency, 120 * 10 ** 18),
      buyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 600 * 10 ** 18),
    },
    afterNetworkCosts: {
      sellAmount: CurrencyAmount.fromRawAmount(inputCurrency, 110 * 10 ** 18),
      buyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 590 * 10 ** 18),
    },
    afterPartnerFees: {
      sellAmount: CurrencyAmount.fromRawAmount(inputCurrency, 110 * 10 ** 18),
      buyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 590 * 10 ** 18),
    },
  },
  currency: inputCurrency,
  balance: CurrencyAmount.fromRawAmount(inputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(inputCurrency, 12 * 10 ** 18),
}

export const outputCurrencyInfoMock: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: null,
  currency: outputCurrency,
  balance: CurrencyAmount.fromRawAmount(outputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 12 * 10 ** 18),
}

export const priceImpactMock: PriceImpact = {
  priceImpact: new Percent(20000, 10),
  loading: false,
}
