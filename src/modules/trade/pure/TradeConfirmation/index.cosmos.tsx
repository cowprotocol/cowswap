import React from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { COW, GNO } from 'legacy/constants/tokens'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/swap/actions'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { TradeConfirmation } from './index'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

const inputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
    feeAmountRaw: CurrencyAmount.fromRawAmount(inputCurrency, 10 * 10 ** 18),
  },
  currency: inputCurrency,
  balance: CurrencyAmount.fromRawAmount(inputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(inputCurrency, 12 * 10 ** 18),
}

const outputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  isIndependent: false,
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
    feeAmountRaw: CurrencyAmount.fromRawAmount(outputCurrency, 10 * 10 ** 18),
  },
  currency: outputCurrency,
  balance: CurrencyAmount.fromRawAmount(outputCurrency, 250 * 10 ** 18),
  amount: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 12 * 10 ** 18),
}

const priceImpact: PriceImpact = {
  priceImpact: new Percent(20000, 10),
  loading: false,
  error: undefined,
}

const Fixtures = {
  default: (
    <TradeConfirmation
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      onConfirm={() => void 0}
      isConfirmDisabled={false}
      priceImpact={priceImpact}
    >
      <span>Trade confirmation</span>
    </TradeConfirmation>
  ),
}

export default Fixtures
