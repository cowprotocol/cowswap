export function toFirstMeaningfulDecimal(value: string, limit = 6): string {
  const [quotient, remainder] = value.split('.')

  if (!remainder || remainder.length < limit) {
    return value
  }

  const nonZero = [...remainder].findIndex((digit) => digit !== '0')

  if (nonZero === -1) {
    return quotient
  } else if (nonZero < limit) {
    return `${quotient}.${remainder.substring(0, limit)}`
  } else {
    return `${quotient}.${remainder.substring(0, nonZero)}`
  }
}
