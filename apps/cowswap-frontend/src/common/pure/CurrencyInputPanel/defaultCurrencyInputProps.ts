import { COW_TOKEN_TO_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { inputCurrencyInfoMock } from 'mocks/tradeStateMock'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { CurrencyInputPanelProps } from 'common/pure/CurrencyInputPanel/index'

const currency = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]
const balance = currency ? CurrencyAmount.fromRawAmount(currency, 250 * 10 ** 18) : null

export const defaultCurrencyInputPanelProps: CurrencyInputPanelProps & { priceImpactParams: PriceImpact } = {
  chainId: 100,
  id: 'currency-panel',
  areCurrenciesLoading: false,
  bothCurrenciesSet: true,
  isChainIdUnsupported: false,
  showSetMax: true,
  allowsOffchainSigning: true,
  currencyInfo: {
    field: Field.INPUT,
    isIndependent: false,
    receiveAmountInfo: inputCurrencyInfoMock.receiveAmountInfo,
    currency,
    balance,
    amount: currency ? CurrencyAmount.fromRawAmount(currency, 20 * 10 ** 18) : null,
    fiatAmount: currency ? CurrencyAmount.fromRawAmount(currency, 12 * 10 ** 18) : null,
  },
  openTokenSelectWidget() {
    /**/
  },
  onCurrencySelection() {
    /**/
  },
  onUserInput() {
    /**/
  },
  priceImpactParams: {
    priceImpact: new Percent(2, 10_000),
    loading: false,
  },
  subsidyAndBalance: {
    subsidy: {
      tier: 2,
      discount: 10,
    },
    balance: balance ?? undefined,
  },
}
