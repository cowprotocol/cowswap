import { Fraction } from '@uniswap/sdk-core'

export function toFraction(value: string) {
  // eslint-disable-next-line prefer-const
  let [quotient, remainder] = value.split('.')

  if (!remainder) remainder = ''

  const numerator = `${quotient}${remainder}`
  const denominator = `1${'0'.repeat(remainder.length)}`

  const fraction = new Fraction(numerator, denominator)

  return fraction
}
