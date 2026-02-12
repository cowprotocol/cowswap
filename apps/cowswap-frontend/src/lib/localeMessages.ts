import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { i18n, Messages } from '@lingui/core'

import { getActiveLocale } from 'legacy/hooks/useActiveLocale'

async function loadLocaleMessages(locale: SupportedLocale): Promise<Messages> {
  const catalog = await import(`../locales/${locale}.po`)
  return catalog.messages
}

export async function loadActiveLocaleMessages(): Promise<Messages | undefined> {
  const activeLocale = getActiveLocale()
  try {
    const messages = await loadLocaleMessages(activeLocale)
    return messages
  } catch (error) {
    console.error('Could not load locale file: ' + activeLocale, error)
    return undefined
  }
}

export async function dynamicActivate(locale: SupportedLocale, isInternationalizationEnabled?: boolean): Promise<void> {
  try {
    // Load default (en-US) catalog if internationalization is disabled
    if (!isInternationalizationEnabled) {
      const defaultCatalog = await loadLocaleMessages(DEFAULT_LOCALE)

      i18n.load(DEFAULT_LOCALE, defaultCatalog)
      i18n.activate(DEFAULT_LOCALE)
      return
    }

    const catalog = await loadLocaleMessages(locale)

    i18n.load(locale, catalog)
    i18n.activate(locale)
  } catch (error) {
    // Do nothing
    console.error('Could not load locale file: ' + locale, error)
  }
}
