import { Fraction } from '@uniswap/sdk-core'

import F from 'fraction.js'

export function toFraction(value: string, isInverted = false): Fraction {
  if (!value || !Number(value)) return new Fraction(0)

  const { n: numerator, d: denominator } = new F(value)

  const params: [number, number] = !isInverted ? [numerator, denominator] : [denominator, numerator]

  return new Fraction(...params)
}
