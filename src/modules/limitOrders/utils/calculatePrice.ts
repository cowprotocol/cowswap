import { Price, Token } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { isZero } from './isZero'

interface CalculatePriceParams {
  buyAmount: JSBI | undefined
  sellAmount: JSBI | undefined
  inputToken: Token
  outputToken: Token
}

export function calculatePrice({
  buyAmount,
  sellAmount,
  inputToken,
  outputToken,
}: CalculatePriceParams): Price<Token, Token> | null {
  if (!buyAmount || !sellAmount || !inputToken || !outputToken || isZero(buyAmount) || isZero(sellAmount)) {
    return null
  }

  return new Price(inputToken, outputToken, sellAmount.toString(), buyAmount.toString())
}
