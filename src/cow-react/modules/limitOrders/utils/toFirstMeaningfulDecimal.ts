export function toFirstMeaningfulDecimal(value: string | undefined | null, limit = 6): string {
  if (!value) {
    return '0'
  }

  const [quotient, remainder] = value.split('.')

  if (!remainder || remainder.length < limit) {
    return value
  }

  const nonZero = [...remainder].findIndex((digit) => digit !== '0')

  if (nonZero === -1) {
    return quotient
  } else if (nonZero <= limit) {
    return `${quotient}.${remainder.substring(0, limit)}`
  } else {
    return `${quotient}.${remainder.substring(0, nonZero + 1)}`
  }
}
