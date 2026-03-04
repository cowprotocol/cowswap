import { ReactNode, useEffect } from 'react'

import { SupportedLocale } from '@cowprotocol/common-const'

import { i18n, Messages } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'

import { dynamicActivate } from './localeMessages'

interface ProviderProps {
  children: ReactNode
  locale: SupportedLocale
  messages: Messages | undefined
  onActivate?: (locale: SupportedLocale) => void
}

export function Provider({ locale, messages, onActivate, children }: ProviderProps): ReactNode {
  const isInternationalizationEnabled = useIsInternationalizationEnabled()

  useEffect(() => {
    dynamicActivate(locale, isInternationalizationEnabled)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale: ', locale, error)
      })
  }, [locale, onActivate, isInternationalizationEnabled])

  // if i18n is not activated (i18n.locale === ''), then I18nProvider renders null ("white screen") on initial render
  // that's why we detect locale and load messages BEFORE initial render
  if (!i18n.locale && messages) {
    i18n.load(locale, messages)
    i18n.activate(locale) // sets i18n.locale value, runs only one time
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
