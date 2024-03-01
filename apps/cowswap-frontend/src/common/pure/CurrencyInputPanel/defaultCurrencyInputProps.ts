import { COW } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { CurrencyInputPanelProps } from 'common/pure/CurrencyInputPanel/index'

const currency = COW[SupportedChainId.MAINNET]
const balance = CurrencyAmount.fromRawAmount(currency, 250 * 10 ** 18)

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
    receiveAmountInfo: {
      type: 'from',
      amountBeforeFees: '30',
      amountAfterFees: '20',
      amountAfterFeesRaw: CurrencyAmount.fromRawAmount(currency, 20 * 10 ** 18),
      feeAmount: '10',
      feeAmountRaw: CurrencyAmount.fromRawAmount(currency, 10 * 10 ** 18),
      partnerFeeAmount: '0',
      partnerFeeAmountRaw: CurrencyAmount.fromRawAmount(currency, 0),
    },
    currency,
    balance,
    amount: CurrencyAmount.fromRawAmount(currency, 20 * 10 ** 18),
    fiatAmount: CurrencyAmount.fromRawAmount(currency, 12 * 10 ** 18),
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
    balance,
  },
}
