import { Price, Token } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const isZero = (x: JSBI) => JSBI.equal(x, JSBI.BigInt(0))

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
