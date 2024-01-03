export const numberFormatter = Intl.NumberFormat(navigator.language, {
  notation: 'compact',
  maximumSignificantDigits: 4,
}).format
