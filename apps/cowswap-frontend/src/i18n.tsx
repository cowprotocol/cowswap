import { ReactNode, useCallback } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { initialLocale, useActiveLocale } from 'legacy/hooks/useActiveLocale'
import { useUserLocaleManager } from 'legacy/state/user/hooks'

import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'
import { dynamicActivate, Provider } from 'lib/i18n'

dynamicActivate(initialLocale, false)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useActiveLocale()
  const { setLocale } = useUserLocaleManager()
  const isInternationalizationEnabled = useIsInternationalizationEnabled()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      document.documentElement.setAttribute('lang', locale)
      setLocale(isInternationalizationEnabled ? locale : DEFAULT_LOCALE) // stores the selected locale to persist across sessions
    },
    [setLocale, isInternationalizationEnabled],
  )

  return (
    <Provider locale={locale} onActivate={onActivate}>
      {children}
    </Provider>
  )
}
