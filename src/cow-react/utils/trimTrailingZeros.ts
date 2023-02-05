import { INTL_NUMBER_FORMAT } from '@cow/constants/intl'

const decimalsSeparator = INTL_NUMBER_FORMAT.format(1.2)[1]
const trailingZerosRegex = new RegExp('(\\' + decimalsSeparator + '\\d*?[1-9])0*$')

export function trimTrailingZeros(value: string): string {
  return value.replace(trailingZerosRegex, '$1')
}
