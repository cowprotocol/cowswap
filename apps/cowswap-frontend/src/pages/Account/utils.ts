const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

export const formatDecimal = (number?: number): string => {
  return number ? numberFormatter.format(number) : '-'
}

export const formatInt = (number?: number): string => {
  return number ? number.toLocaleString() : '-'
}
