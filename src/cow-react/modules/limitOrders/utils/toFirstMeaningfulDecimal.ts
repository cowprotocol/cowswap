import { Fraction } from '@uniswap/sdk-core'

export function toFirstMeaningfulDecimal(value: Fraction, limit = 6): string {
  const shortValue = value.toFixed(18)
  const [quotient, remainder] = shortValue.split('.')

  const isValueTooSmall = remainder.length > limit && remainder[limit] === '0'

  if (isValueTooSmall) {
    const firstMeaningfulDecimal = remainder.split('').findIndex((digit) => digit !== '0')

    return firstMeaningfulDecimal < 0 ? quotient : `${quotient}.${remainder.slice(0, firstMeaningfulDecimal + 1)}`
  }

  return `${quotient}.${remainder.slice(0, limit)}`
}
