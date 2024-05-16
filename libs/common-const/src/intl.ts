export const INTL_NUMBER_FORMAT = new Intl.NumberFormat(typeof navigator !== 'undefined' ? navigator.language : 'en-GB')

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
}
