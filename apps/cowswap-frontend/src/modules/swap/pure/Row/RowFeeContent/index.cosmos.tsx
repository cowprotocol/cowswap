import { COW, GNO } from '@cowprotocol/common-const'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Price, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { RowNetworkCostsProps } from 'modules/swap/containers/Row/RowFee'
import { RowFeeContent, RowFeeContentProps } from 'modules/swap/pure/Row/RowFeeContent'

const currency = COW[SupportedChainId.MAINNET]
const currencyOut = GNO[SupportedChainId.MAINNET]
const amount = 250
const output = 250
const fee = 10

const trade = new TradeGp({
  inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  inputAmountWithFee: CurrencyAmount.fromRawAmount(currency, (amount + fee) * 10 ** 18),
  inputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  inputAmountAfterFees: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  outputAmount: CurrencyAmount.fromRawAmount(currency, output * 10 ** 18),
  outputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, (output - 3) * 10 ** 18),
  outputAmountAfterFees: CurrencyAmount.fromRawAmount(currency, (output - 3) * 10 ** 18),
  fee: {
    feeAsCurrency: CurrencyAmount.fromRawAmount(currency, 3 * 10 ** 18),
    amount: '50',
    expirationDate: new Date().toISOString(),
  },
  executionPrice: new Price(currency, currencyOut, 1, 4),
  tradeType: TradeType.EXACT_INPUT,
  quoteId: 10000,
  partnerFee: { bps: 35, recipient: '0x1234567890123456789012345678901234567890' },
})
const defaultProps: RowNetworkCostsProps & RowFeeContentProps = {
  label: 'Est. Fee',
  trade,
  feeAmount: CurrencyAmount.fromRawAmount(currency, fee * 10 ** 18),
  feeUsd: '(≈$42.93)',
  feeCurrencySymbol: 'GNO',
  isFree: false,
  get feeInFiat() {
    return this.feeAmount ? currencyAmountToTokenAmount(this.feeAmount.multiply('100')) : null
  },
  get feeToken() {
    return (this.feeAmount?.toExact() || '-') + ' ' + this.feeCurrencySymbol
  },
  get fullDisplayFee() {
    return this.feeAmount?.quotient.toString() || 'Unknown'
  },
  allowsOffchainSigning: true,
  tooltip: 'This is a tooltip that describes stuff. Stuff that is great. Great stuff. The best stuff on earth.',
}

export default <RowFeeContent {...defaultProps} />
