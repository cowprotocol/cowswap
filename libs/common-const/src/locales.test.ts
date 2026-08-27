import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES } from './locales'

describe('supported locales', () => {
  it('lists every selectable locale in dropdown order', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en-US', 'es-ES', 'fr-FR', 'pt-BR', 'ru-RU'])
  })

  it('defines a display name for every selectable locale', () => {
    expect(SUPPORTED_LOCALES.map((locale) => LOCALE_DISPLAY_NAMES[locale])).toEqual([
      'English (US)',
      'Español (España)',
      'Français (France)',
      'Português (Brasil)',
      'Русский (Россия)',
    ])
  })
})
