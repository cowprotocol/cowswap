import TradeGp from 'legacy/state/swap/TradeGp'
import { COW, GNO } from 'legacy/constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, TradeType, Price, Percent } from '@uniswap/sdk-core'
import {
  RowReceivedAfterSlippageContent,
  RowReceivedAfterSlippageContentProps,
} from 'modules/swap/pure/Row/RowReceivedAfterSlippageContent'
import { RowReceivedAfterSlippageProps } from 'modules/swap/containers/Row/RowReceivedAfterSlippage'

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
  swapAmount: trade.inputAmountWithFee,
}

export default <RowReceivedAfterSlippageContent {...defaultProps} />
