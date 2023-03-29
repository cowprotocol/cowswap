import TradeGp from 'state/swap/TradeGp'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, TradeType, Price, Percent } from '@uniswap/sdk-core'
import { TradeSummaryContent, TradeSummaryContentProps } from '.'
import { TradeSummaryProps } from '@cow/modules/swap/containers/TradeSummary'

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
const defaultProps: TradeSummaryProps & TradeSummaryContentProps = {
  trade,
  allowsOffchainSigning: true,
  allowedSlippage: new Percent(12, 10_000),
  fee: CurrencyAmount.fromRawAmount(currency, fee * 10 ** 18),
  showHelpers: true,
  showFee: true,
}

export default <TradeSummaryContent {...defaultProps} />
