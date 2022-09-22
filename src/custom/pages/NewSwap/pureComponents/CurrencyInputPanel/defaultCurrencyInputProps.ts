import { CurrencyInputPanelProps } from 'pages/NewSwap/pureComponents/CurrencyInputPanel/index'
import { Field } from 'state/swap/actions'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { PriceImpact } from 'hooks/usePriceImpact'

const currency = COW[SupportedChainId.MAINNET]
const balance = CurrencyAmount.fromRawAmount(currency, 250 * 10 ** 18)

export const defaultCurrencyInputPanelProps: CurrencyInputPanelProps & { priceImpactParams: PriceImpact } = {
  id: 'currency-panel',
  loading: false,
  showSetMax: true,
  allowsOffchainSigning: true,
  currencyInfo: {
    field: Field.INPUT,
    viewAmount: '20',
    receiveAmountInfo: {
      type: 'from',
      amountBeforeFees: '30',
      amountAfterFees: '20',
      amountAfterFeesRaw: CurrencyAmount.fromRawAmount(currency, 20 * 10 ** 18),
      feeAmount: '10',
    },
    currency,
    balance,
    rawAmount: CurrencyAmount.fromRawAmount(currency, 20 * 10 ** 18),
    fiatAmount: CurrencyAmount.fromRawAmount(currency, 12 * 10 ** 18),
  },
  swapActions: {
    onCurrencySelection() {
      /**/
    },
    onSwitchTokens() {
      /**/
    },
    onUserInput() {
      /**/
    },
    onChangeRecipient() {
      /**/
    },
  },
  priceImpactParams: {
    priceImpact: new Percent(2, 10_000),
    loading: false,
    error: 'fetch-quote-error',
  },
  subsidyAndBalance: {
    subsidy: {
      tier: 2,
      discount: 10,
    },
    balance,
  },
}
