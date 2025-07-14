import { COW_TOKEN_TO_CHAIN, GNO_MAINNET } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Percent, Price } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

const chainId = SupportedChainId.MAINNET

const inputCurrency = COW_TOKEN_TO_CHAIN[chainId]
const outputCurrency = GNO_MAINNET

if (!inputCurrency) {
  throw new Error('Input currency not found')
}

export const inputCurrencyInfoMock: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    isSell: false,
    quotePrice: new Price<Currency, Currency>({
      baseAmount: tryParseCurrencyAmount('1', inputCurrency),
      quoteAmount: tryParseCurrencyAmount('5', outputCurrency),
    }),
    costs: {
      networkFee: {
        amountInSellCurrency: tryParseCurrencyAmount('30', inputCurrency),
        amountInBuyCurrency: tryParseCurrencyAmount('52', outputCurrency),
      },
      partnerFee: {
        amount: tryParseCurrencyAmount('0', inputCurrency),
        bps: 0,
      },
    },
    beforeNetworkCosts: {
      sellAmount: tryParseCurrencyAmount('120', inputCurrency),
      buyAmount: tryParseCurrencyAmount('600', outputCurrency),
    },
    afterNetworkCosts: {
      sellAmount: tryParseCurrencyAmount('110', inputCurrency),
      buyAmount: tryParseCurrencyAmount('590', outputCurrency),
    },
    afterPartnerFees: {
      sellAmount: tryParseCurrencyAmount('110', inputCurrency),
      buyAmount: tryParseCurrencyAmount('590', outputCurrency),
    },
    afterSlippage: {
      sellAmount: tryParseCurrencyAmount('110', inputCurrency),
      buyAmount: tryParseCurrencyAmount('530', outputCurrency),
    },
  },
  currency: inputCurrency,
  balance: tryParseCurrencyAmount('250', inputCurrency),
  amount: tryParseCurrencyAmount('20', inputCurrency),
  fiatAmount: tryParseCurrencyAmount('12', inputCurrency),
}

export const outputCurrencyInfoMock: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: null,
  currency: outputCurrency,
  balance: tryParseCurrencyAmount('250', outputCurrency),
  amount: tryParseCurrencyAmount('20', outputCurrency),
  fiatAmount: tryParseCurrencyAmount('12', outputCurrency),
}

export const priceImpactMock: PriceImpact = {
  priceImpact: new Percent(20000, 10),
  loading: false,
}
