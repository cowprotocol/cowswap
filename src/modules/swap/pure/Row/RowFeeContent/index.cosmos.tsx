import TradeGp from 'state/swap/TradeGp'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, TradeType, Price } from '@uniswap/sdk-core'
import { RowFeeContent, RowFeeContentProps } from 'modules/swap/pure/Row/RowFeeContent'

import { RowFeeProps } from 'modules/swap/containers/Row/RowFee'

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
const defaultProps: RowFeeProps & RowFeeContentProps = {
  trade,
  fee: CurrencyAmount.fromRawAmount(currency, fee * 10 ** 18),
  feeUsd: '(≈$42.93)',
  feeCurrencySymbol: 'GNO',
  get feeFiatValue() {
    return this.fee?.multiply('100').wrapped || null
  },
  get feeToken() {
    return (this.fee?.toExact() || '-') + ' ' + this.feeCurrencySymbol
  },
  get fullDisplayFee() {
    return this.fee?.quotient.toString() || 'Unknown'
  },
  showHelpers: true,
  allowsOffchainSigning: true,
  includeGasMessage: '(incl. gas cost)',
  tooltip: 'This is a tooltip that describes stuff. Stuff that is great. Great stuff. The best stuff on earth.',
}

export default <RowFeeContent {...defaultProps} />
