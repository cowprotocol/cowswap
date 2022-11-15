import { RateInfo } from './index'
import { DAI_GOERLI, WETH_GOERLI } from 'utils/goerli/constants'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'

const inputCurrency = WETH_GOERLI
const outputCurrency = DAI_GOERLI

const activeRateDisplay = {
  inputCurrency,
  outputCurrency,
  activeRate: new Fraction(50000000, 20000000),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  inversedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

const Fixtures = {
  default: <RateInfo activeRateDisplay={activeRateDisplay} />,
}

export default Fixtures
