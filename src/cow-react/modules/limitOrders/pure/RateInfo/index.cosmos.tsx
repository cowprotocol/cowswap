import { RateInfo } from './index'
import { DAI_GOERLI, USDT_GOERLI, WBTC_GOERLI, WETH_GOERLI } from 'utils/goerli/constants'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'
import { ActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import styled from 'styled-components/macro'

const inputCurrency = WETH_GOERLI
const outputCurrency = DAI_GOERLI
const GNO_GOERLI = GNO[SupportedChainId.GOERLI]
const COW_GOERLI = COW[SupportedChainId.GOERLI]

const activeRateDisplay = {
  chainId: 5,
  inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputCurrency, 123 * 10 ** 18),
  outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 456 * 10 ** 18),
  activeRate: new Fraction(50000000, 20000000),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  inversedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

function buildActiveRateDisplay(
  inputToken: Token,
  outputToken: Token,
  inputAmount: number,
  outputAmount: number
): ActiveRateDisplay {
  const inputCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, inputAmount * 10 ** inputToken.decimals)
  const outputCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, outputAmount * 10 ** outputToken.decimals)
  const activeRate = new Fraction(outputCurrencyAmount.toExact(), inputCurrencyAmount.toExact())

  return {
    chainId: 5,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRate,
    activeRateFiatAmount: null,
    inversedActiveRateFiatAmount: null,
  }
}

const Box = styled.div`
  border: 1px solid #000;
  padding: 12px;
  margin-bottom: 10px;

  p {
    margin-top: 0;
    font-size: 13px;
    color: #888888;
  }
`

function SmartQuoteSelection() {
  const rates = [
    {
      title: 'When one of tokens is stable-coin, then another token is quote',
      examples: [
        buildActiveRateDisplay(DAI_GOERLI, GNO_GOERLI, 2000, 100),
        buildActiveRateDisplay(GNO_GOERLI, DAI_GOERLI, 2000, 100),
        buildActiveRateDisplay(USDT_GOERLI, WETH_GOERLI, 6704, 12),
        buildActiveRateDisplay(WETH_GOERLI, USDT_GOERLI, 100, 6433),
      ],
    },
    {
      title: `When one of tokens is BTC or wrapped native, then it's quote`,
      examples: [
        buildActiveRateDisplay(GNO_GOERLI, WETH_GOERLI, 12, 600),
        buildActiveRateDisplay(WETH_GOERLI, GNO_GOERLI, 600, 12),
        buildActiveRateDisplay(WBTC_GOERLI, COW_GOERLI, 5, 2500),
        buildActiveRateDisplay(COW_GOERLI, WBTC_GOERLI, 2500, 5),
      ],
    },
    {
      title: 'For other cases the quote is a token that has the smallest amount',
      examples: [
        buildActiveRateDisplay(COW_GOERLI, GNO_GOERLI, 12, 652),
        buildActiveRateDisplay(GNO_GOERLI, COW_GOERLI, 2, 4220),
      ],
    },
  ]

  return (
    <div>
      <h3>Smart quote selection</h3>
      <p>Quote token it&apos;s a token that always = 1. For example: 1 WETH = 0.333 DAI, WETH is quote</p>
      <br />
      {rates.map(({ title, examples }, j) => {
        return (
          <div key={j}>
            <p>{title}</p>
            {examples.map((rate, i) => {
              const { inputCurrencyAmount, outputCurrencyAmount } = rate

              return (
                <Box key={i}>
                  <p>
                    {inputCurrencyAmount?.toExact()} {inputCurrencyAmount?.currency.symbol}
                    {' -> '}
                    {outputCurrencyAmount?.toExact()} {outputCurrencyAmount?.currency.symbol}{' '}
                  </p>
                  <RateInfo noLabel={true} activeRateDisplay={rate} />
                </Box>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const Fixtures = {
  default: <RateInfo activeRateDisplay={activeRateDisplay} />,
  SmartQuoteSelection: <SmartQuoteSelection />,
}

export default Fixtures
