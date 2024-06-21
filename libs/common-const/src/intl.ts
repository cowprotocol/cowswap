let locale = 'en-US'

if (typeof navigator !== 'undefined' && navigator.language) {
  locale = navigator.language
}

export const INTL_NUMBER_FORMAT = new Intl.NumberFormat(locale)

export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
}
