import { ReactNode, useCallback } from 'react'

import { SupportedLocale } from '@cowprotocol/common-const'

import { initialLocale, useActiveLocale } from 'legacy/hooks/useActiveLocale'
import { useUserLocaleManager } from 'legacy/state/user/hooks'

import { dynamicActivate, Provider } from 'lib/i18n'

dynamicActivate(initialLocale)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useActiveLocale()
  const [, setUserLocale] = useUserLocaleManager()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      document.documentElement.setAttribute('lang', locale)
      setUserLocale(locale) // stores the selected locale to persist across sessions
    },
    [setUserLocale]
  )

  return (
    <Provider locale={locale} onActivate={onActivate}>
      {children}
    </Provider>
  )
}
