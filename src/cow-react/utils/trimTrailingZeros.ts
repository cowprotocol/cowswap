const trailingZerosRegex = /(\.\d*?[1-9])0*$/

export function trimTrailingZeros(value: string): string {
  return value.replace(trailingZerosRegex, '$1')
}
