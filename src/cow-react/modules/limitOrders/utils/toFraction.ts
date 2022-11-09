import { Fraction } from '@uniswap/sdk-core'
import F from 'fraction.js'

export function toFraction(value: string, isInversed = false) {
  if (!value || !Number(value)) return new Fraction(0)

  const f = new F(value)

  const { n: numerator, d: denominator } = f

  const params: [number, number] = !isInversed ? [numerator, denominator] : [denominator, numerator]

  const fraction = new Fraction(...params)

  return fraction
}
