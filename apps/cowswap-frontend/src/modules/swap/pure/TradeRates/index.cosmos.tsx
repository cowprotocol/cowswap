import { COW, GNO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent, Price, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { TradeRates, TradeRatesProps } from 'modules/swap/pure/TradeRates/index'

import { RateInfoParams } from 'common/pure/RateInfo'

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
  },executionPrice: new Price(currency, currencyOut, 1, 4),
  tradeType: TradeType.EXACT_INPUT,
  quoteId: 10000,
  partnerFee: { bps: 35, recipient: '0x1234567890123456789012345678901234567890' },
})
const rateInfoParams: RateInfoParams = {
  chainId: 1,
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
  activeRateFiatAmount: null,
  invertedActiveRateFiatAmount: null,
}
const defaultProps: TradeRatesProps = {
  trade,
  allowsOffchainSigning: true,
  isFeeGreater: false,
  discount: 10,
  allowedSlippage: new Percent(12, 10_000),
  userAllowedSlippage: new Percent(12, 10_000),
  fee: CurrencyAmount.fromRawAmount(currency, fee * 10 ** 18),
  rateInfoParams,
}

export default <TradeRates {...defaultProps} />
