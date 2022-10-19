import { CurrencyAmount, Percent, Price, TradeType } from '@uniswap/sdk-core'
import { RowSlippageContent, RowSlippageContentProps } from '@cow/modules/swap/pure/Row/RowSlippageContent'
import { RowSlippageProps } from '@cow/modules/swap/containers/RowSlippage'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GNO, GpEther } from 'constants/tokens'
import TradeGp from 'state/swap/TradeGp'

const currency = GpEther.onChain(SupportedChainId.MAINNET)
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

const defaultProps: RowSlippageProps & RowSlippageContentProps = {
  trade,
  showEthFlowSlippageWarning: true,
  symbols: [currency.symbol, currency.wrapped.symbol],
  allowedSlippage: new Percent(1, 100),
  displaySlippage: '1%',
  toggleSettings() {
    console.log('RowSlippageContent settings toggled!')
  },
}

export default <RowSlippageContent {...defaultProps} />
