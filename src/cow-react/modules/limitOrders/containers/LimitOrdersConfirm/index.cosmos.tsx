import { LimitOrdersConfirm } from './LimitOrdersConfirm'
import { Field } from 'state/swap/actions'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'

const inputCurrency = COW[SupportedChainId.MAINNET]
const outputCurrency = GNO[SupportedChainId.MAINNET]

const inputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  viewAmount: '20',
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
  },
  currency: inputCurrency,
  balance: CurrencyAmount.fromRawAmount(inputCurrency, 250 * 10 ** 18),
  rawAmount: CurrencyAmount.fromRawAmount(inputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(inputCurrency, 12 * 10 ** 18),
}

const outputCurrencyInfo: CurrencyInfo = {
  field: Field.INPUT,
  viewAmount: '20',
  receiveAmountInfo: {
    type: 'from',
    amountBeforeFees: '30',
    amountAfterFees: '20',
    amountAfterFeesRaw: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
    feeAmount: '10',
  },
  currency: outputCurrency,
  balance: CurrencyAmount.fromRawAmount(outputCurrency, 250 * 10 ** 18),
  rawAmount: CurrencyAmount.fromRawAmount(outputCurrency, 20 * 10 ** 18),
  fiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 12 * 10 ** 18),
}

const Fixtures = {
  default: (
    <LimitOrdersConfirm
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      onConfirm={() => void 0}
    />
  ),
}

export default Fixtures
