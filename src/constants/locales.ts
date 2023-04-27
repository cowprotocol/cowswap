import * as enUS from 'locales/en-US'

export const SUPPORTED_LOCALES = [
  // order as they appear in the language dropdown
  'en-US',
]
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number] | 'pseudo'

export const DEFAULT_LOCALE: SupportedLocale = 'en-US'
export const DEFAULT_CATALOG = enUS

export const LOCALE_LABEL: { [locale in SupportedLocale]: string } = {
  'en-US': 'English',
  pseudo: 'ƥƨèúδô',
}
