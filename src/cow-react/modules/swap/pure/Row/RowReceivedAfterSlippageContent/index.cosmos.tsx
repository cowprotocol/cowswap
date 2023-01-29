import TradeGp from 'state/swap/TradeGp'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount, TradeType, Price, Percent } from '@uniswap/sdk-core'
import {
  RowReceivedAfterSlippageContent,
  RowReceivedAfterSlippageContentProps,
} from '@cow/modules/swap/pure/Row/RowReceivedAfterSlippageContent'
import { RowReceivedAfterSlippageProps } from '@cow/modules/swap/containers/Row/RowReceivedAfterSlippage'

const currency = COW[SupportedChainId.MAINNET]
const currencyOut = GNO[SupportedChainId.MAINNET]
const amount = 250
const output = 250
const fee = 10

const trade = new TradeGp({
  inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  inputAmountWithFee: CurrencyAmount.fromRawAmount(currency, (amount + fee) * 10 ** 18),
  inputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  outputAmount: CurrencyAmount.fromRawAmount(currency, output * 10 ** 18),
  outputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, (output - 3) * 10 ** 18),
  fee: { feeAsCurrency: CurrencyAmount.fromRawAmount(currency, 3 * 10 ** 18), amount: '50' },
  executionPrice: new Price(currency, currencyOut, 1, 4),
  tradeType: TradeType.EXACT_INPUT,
  quoteId: 10000,
})
const defaultProps: RowReceivedAfterSlippageProps & RowReceivedAfterSlippageContentProps = {
  trade,
  showHelpers: true,
  allowedSlippage: new Percent(1, 100),
  isExactIn: true,
  fullOutAmount: '100',
  swapAmount: trade.inputAmountWithFee,
}

export default <RowReceivedAfterSlippageContent {...defaultProps} />
