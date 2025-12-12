export const SUPPORTED_LOCALES = [
  // order as they appear in the language dropdown
  'en-US',
  'es-ES',
  'ru-RU',
]

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number] | 'pseudo'

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'

// Override display names shown in language selectors to ensure consistent wording
export const LOCALE_DISPLAY_NAMES: Partial<Record<SupportedLocale, string>> = {
  'en-US': 'English (US)',
  'es-ES': 'Español (España)',
  'ru-RU': 'Русский (Россия)',
}
