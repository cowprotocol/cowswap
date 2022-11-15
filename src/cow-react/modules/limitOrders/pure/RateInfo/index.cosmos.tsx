import { RateInfo } from './index'
import { DAI_GOERLI, WETH_GOERLI } from 'utils/goerli/constants'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'

const activeRateDisplay = {
  inputActiveRateCurrency: WETH_GOERLI,
  outputActiveRateCurrency: DAI_GOERLI,
  currentActiveRate: new Fraction(20000000000, 1000000),
  currentActiveRateFiatAmount: CurrencyAmount.fromRawAmount(DAI_GOERLI, 45000000000),
}

const Fixtures = {
  default: <RateInfo activeRateDisplay={activeRateDisplay} />,
}

export default Fixtures
