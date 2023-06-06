import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { COW, GNO } from 'legacy/constants/tokens'
import { DAI_GOERLI, USDT_GOERLI, WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { TokenSymbol } from 'common/pure/TokenSymbol'

import { RateInfoParams, RateInfo } from './index'

const inputCurrency = WETH_GOERLI
const outputCurrency = DAI_GOERLI
const GNO_GOERLI = GNO[SupportedChainId.GOERLI]
const COW_GOERLI = COW[SupportedChainId.GOERLI]

const rateInfoParams = {
  chainId: 5,
  inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputCurrency, 123 * 10 ** 18),
  outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 456 * 10 ** 18),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  invertedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

function buildRateInfoParams(
  inputToken: Token,
  outputToken: Token,
  inputAmount: number,
  outputAmount: number
): RateInfoParams {
  const inputCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, inputAmount * 10 ** inputToken.decimals)
  const outputCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, outputAmount * 10 ** outputToken.decimals)

  return {
    chainId: 5,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRateFiatAmount: null,
    invertedActiveRateFiatAmount: null,
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
        buildRateInfoParams(DAI_GOERLI, GNO_GOERLI, 2000, 100),
        buildRateInfoParams(GNO_GOERLI, DAI_GOERLI, 2000, 100),
        buildRateInfoParams(USDT_GOERLI, WETH_GOERLI, 6704, 12),
        buildRateInfoParams(WETH_GOERLI, USDT_GOERLI, 100, 6433),
      ],
    },
    {
      title: 'For other cases the quote is a token that has the smallest amount',
      examples: [
        buildRateInfoParams(COW_GOERLI, GNO_GOERLI, 12, 652),
        buildRateInfoParams(GNO_GOERLI, COW_GOERLI, 2, 4220),
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
                    {inputCurrencyAmount?.toExact()} {<TokenSymbol token={inputCurrencyAmount?.currency} />}
                    {' -> '}
                    {outputCurrencyAmount?.toExact()} {<TokenSymbol token={outputCurrencyAmount?.currency} />}{' '}
                  </p>
                  <RateInfo noLabel={true} rateInfoParams={rate} />
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
  default: <RateInfo rateInfoParams={rateInfoParams} />,
  SmartQuoteSelection: <SmartQuoteSelection />,
}

export default Fixtures
