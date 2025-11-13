import { ReactNode, useEffect } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function dynamicActivate(locale: SupportedLocale, isInternationalizationEnabled?: boolean) {
  try {
    // TODO: how to load the flag without using a hook?
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

interface ProviderProps {
  children: ReactNode
  locale: SupportedLocale
  onActivate?: (locale: SupportedLocale) => void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Provider({ locale, onActivate, children }: ProviderProps) {
  const isInternationalizationEnabled = useIsInternationalizationEnabled()

  useEffect(() => {
    dynamicActivate(locale, isInternationalizationEnabled)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale, onActivate, isInternationalizationEnabled])

  // Initialize the locale immediately if it is DEFAULT_LOCALE, so that keys are shown while the translation messages load.
  // This renders the translation _keys_, not the translation _messages_, which is only acceptable while loading the DEFAULT_LOCALE,
  // as [there are no "default" messages](https://github.com/lingui/js-lingui/issues/388#issuecomment-497779030).
  // See https://github.com/lingui/js-lingui/issues/1194#issuecomment-1068488619.
  if (i18n.locale === undefined && locale === DEFAULT_LOCALE) {
    i18n.load(DEFAULT_LOCALE, {})
    i18n.activate(DEFAULT_LOCALE)
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
