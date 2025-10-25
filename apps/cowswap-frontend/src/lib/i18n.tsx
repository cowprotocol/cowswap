import { ReactNode, useEffect } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { createDynamicActivate, loadLocalePluralRules } from './i18nActivate'
import { localeCatalogLoaders } from './localeCatalogLoaders'

export const dynamicActivate = createDynamicActivate(localeCatalogLoaders)

interface ProviderProps {
  locale: SupportedLocale
  onActivate?: (locale: SupportedLocale) => void
  children: ReactNode
}

export function Provider({ locale, onActivate, children }: ProviderProps): ReactNode {
  useEffect(() => {
    dynamicActivate(locale)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale, onActivate])

  // Initialize the locale immediately if it is DEFAULT_LOCALE, so that keys are shown while the translation messages load.
  // This renders the translation _keys_, not the translation _messages_, which is only acceptable while loading the DEFAULT_LOCALE,
  // as [there are no "default" messages"](https://github.com/lingui/js-lingui/issues/388#issuecomment-497779030).
  // See https://github.com/lingui/js-lingui/issues/1194#issuecomment-1068488619.
  if (i18n.locale === undefined && locale === DEFAULT_LOCALE) {
    loadLocalePluralRules(DEFAULT_LOCALE)
    i18n.load(DEFAULT_LOCALE, {})
    i18n.activate(DEFAULT_LOCALE)
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
