import { numberFormatter } from 'utils/format'

export const formatDecimal = (number?: number): string => {
  return number ? numberFormatter.format(number) : '-'
}

export const formatInt = (number?: number): string => {
  return number ? number.toLocaleString() : '-'
}
