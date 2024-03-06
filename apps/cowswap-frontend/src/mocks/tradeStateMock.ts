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
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
    feeAmountRaw: CurrencyAmount.fromRawAmount(inputCurrency, 10 * 10 ** 18),
    partnerFeeAmount: '25',
    partnerFeeAmountRaw: CurrencyAmount.fromRawAmount(inputCurrency, 0),
  },
  currency: inputCurrency,
  balance: CurrencyAmount.fromRawAmount(inputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(inputCurrency, 12 * 10 ** 18),
}

export const outputCurrencyInfoMock: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
    feeAmountRaw: CurrencyAmount.fromRawAmount(outputCurrency, 10 * 10 ** 18),
    partnerFeeAmount: '0',
    partnerFeeAmountRaw: CurrencyAmount.fromRawAmount(outputCurrency, 0),
  },
  currency: outputCurrency,
  balance: CurrencyAmount.fromRawAmount(outputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 12 * 10 ** 18),
}

export const priceImpactMock: PriceImpact = {
  priceImpact: new Percent(20000, 10),
  loading: false,
}
