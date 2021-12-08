import { ChainId, WETH } from '@uniswap/sdk'
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'
import { parseUnits } from 'ethers/lib/utils'

function _calculateAbaPriceImpact(initialValue: string, finalValue: string) {
  const initialValueBn = new BigNumber(initialValue)
  const finalValueBn = new BigNumber(finalValue)
  // TODO: use correct formula
  // ((IV - FV) / IV / 2) * 100
  const [numerator, denominator] = initialValueBn.minus(finalValueBn).div(initialValueBn).div('2').toFraction()

  return new Percent(numerator.toString(), denominator.toString())
}

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18)
const DAI_MAINNET = new Token(ChainId.MAINNET, '0x6b175474e89094c44da98b954eedeac495271d0f', 18)

describe('A > B > A Price Impact', () => {
  const AB_IN = parseUnits('1', WETH_MAINNET.decimals).toString()
  const AB_OUT = parseUnits('1000', DAI_MAINNET.decimals).toString()

  const abIn = CurrencyAmount.fromRawAmount(WETH_MAINNET, AB_IN)
  const abOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, AB_OUT)

  describe('[SELL] WETH --> DAI', () => {
    it('A > B > A SELL return proper price impact', () => {
      // GIVEN a 1 WETH >> 1000 DAI AB Trade
      // GIVEN a 1000 DAI >> 0.5 WETH BA Trade
      const BA_OUT = parseUnits('0.5', WETH_MAINNET.decimals).toString()
      const baOut = CurrencyAmount.fromRawAmount(WETH_MAINNET, BA_OUT)
      // THEN we expect price impact to be 25
      // (1 - 0.5) / 1 / 2 * 100
      // BUY order = last param TRUE
      const abaImpact = _calculateAbaPriceImpact(abIn.quotient.toString(), baOut.quotient.toString())
      expect(abaImpact.toSignificant(2)).toEqual('25')
    })
  })

  describe('[BUY] DAI --> WETH', () => {
    it('A > B > A BUY returns proper price impact', () => {
      // GIVEN a 1000 DAI >> 1 WETH BUY AB Trade
      // GIVEN a 1 WETH >> 800 WETH SELL BA Trade
      const BA_OUT = parseUnits('800', DAI_MAINNET.decimals).toString()
      const baOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, BA_OUT)
      // THEN we expect price impact to be 25
      // (1000 - 800) / 1000 / 2 * 100 = 10
      // BUY order = last param FALSE
      const abaImpact = _calculateAbaPriceImpact(abOut.quotient.toString(), baOut.quotient.toString())
      expect(abaImpact.toSignificant(2)).toEqual('10')
    })
  })
})
