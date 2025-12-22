import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'

export async function dynamicActivate(locale: SupportedLocale, isInternationalizationEnabled?: boolean): Promise<void> {
  try {
    // Load default (en-US) catalog if internationalization is disabled
    if (!isInternationalizationEnabled) {
      const defaultCatalog = await import(`../locales/${DEFAULT_LOCALE}.po`)

      i18n.load(DEFAULT_LOCALE, defaultCatalog.messages || defaultCatalog.default.messages)
      i18n.activate(DEFAULT_LOCALE)
      return
    }

    const catalog = await import(`../locales/${locale}.po`)

    // Bundlers will either export it as default or as a named export named default.
    i18n.load(locale, catalog.messages || catalog.default.messages)
    i18n.activate(locale)
  } catch (error) {
    // Do nothing
    console.error('Could not load locale file: ' + locale, error)
  }
}
