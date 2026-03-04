import { Price, Token } from '@cowprotocol/common-entities'

const isZero = (x: bigint): boolean => x === 0n

interface CalculatePriceParams {
  buyAmount: bigint | undefined
  sellAmount: bigint | undefined
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
