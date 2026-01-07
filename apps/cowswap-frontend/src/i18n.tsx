import { ReactNode, useCallback } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { useActiveLocale } from 'legacy/hooks/useActiveLocale'
import { useUserLocaleManager } from 'legacy/state/user/hooks'

import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'
import { Provider } from 'lib/i18n'

export function LanguageProvider({ children }: { children: ReactNode }): ReactNode {
  const locale = useActiveLocale()
  const { setLocale } = useUserLocaleManager()
  const isInternationalizationEnabled = useIsInternationalizationEnabled()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      const effectiveLocale = isInternationalizationEnabled ? locale : DEFAULT_LOCALE
      document.documentElement.setAttribute('lang', effectiveLocale)
      if (isInternationalizationEnabled) {
        // stores the selected locale to persist across sessions
        setLocale(effectiveLocale)
      }
    },
    [setLocale, isInternationalizationEnabled],
  )

  return (
    <Provider locale={locale} onActivate={onActivate}>
      {children}
    </Provider>
  )
}
