export const SUPPORTED_LOCALES = [
  // order as they appear in the language dropdown
  'en-US',
  'es-ES',
  'ru-RU',
]

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number] | 'pseudo'

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'
