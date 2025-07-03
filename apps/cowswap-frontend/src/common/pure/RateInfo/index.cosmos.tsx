import {
  COW_TOKEN_TO_CHAIN,
  GNO_SEPOLIA,
  USDC_SEPOLIA,
  WETH_GNOSIS_CHAIN,
  WETH_SEPOLIA,
  WXDAI,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenSymbol } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { RateInfo, RateInfoParams } from './index'

const inputCurrency = WETH_GNOSIS_CHAIN
const outputCurrency = WXDAI

const COW_SEPOLIA = COW_TOKEN_TO_CHAIN[SupportedChainId.SEPOLIA]

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
  outputAmount: number,
): RateInfoParams {
  const inputCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, inputAmount * 10 ** inputToken.decimals)
  const outputCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, outputAmount * 10 ** outputToken.decimals)

  return {
    chainId: 100,
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function SmartQuoteSelection() {
  const rates = [
    {
      title: 'When one of tokens is stable-coin, then another token is quote',
      examples: [
        buildRateInfoParams(USDC_SEPOLIA, GNO_SEPOLIA, 2000, 100),
        buildRateInfoParams(GNO_SEPOLIA, USDC_SEPOLIA, 2000, 100),
        buildRateInfoParams(USDC_SEPOLIA, WETH_SEPOLIA, 6704, 12),
        buildRateInfoParams(WETH_SEPOLIA, USDC_SEPOLIA, 100, 6433),
      ],
    },
    {
      title: 'For other cases the quote is a token that has the smallest amount',
      examples: [
        COW_SEPOLIA ? buildRateInfoParams(COW_SEPOLIA, GNO_SEPOLIA, 12, 652) : undefined,
        COW_SEPOLIA ? buildRateInfoParams(GNO_SEPOLIA, COW_SEPOLIA, 2, 4220) : undefined,
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
              const { inputCurrencyAmount, outputCurrencyAmount } = rate || {}

              return (
                <Box key={i}>
                  <p>
                    {inputCurrencyAmount?.toExact()} {<TokenSymbol token={inputCurrencyAmount?.currency} />}
                    {' -> '}
                    {outputCurrencyAmount?.toExact()} {<TokenSymbol token={outputCurrencyAmount?.currency} />}{' '}
                  </p>
                  {rate && <RateInfo noLabel={true} rateInfoParams={rate} />}
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
  default: () => <RateInfo rateInfoParams={rateInfoParams} />,
  SmartQuoteSelection: () => <SmartQuoteSelection />,
}

export default Fixtures
