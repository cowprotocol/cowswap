import { Fraction } from '@uniswap/sdk-core'

export function toFraction(value: string, isInversed = false) {
  const [quotient, remainder = ''] = value.split('.')

  if (!value || !Number(value)) return new Fraction(0)

  const numerator = `${quotient}${remainder}`
  const denominator = `1${'0'.repeat(remainder.length)}`

  const params: [string, string] = !isInversed ? [numerator, denominator] : [denominator, numerator]

  const fraction = new Fraction(...params)

  return fraction
}
