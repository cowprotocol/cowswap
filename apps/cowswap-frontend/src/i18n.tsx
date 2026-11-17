import { ReactNode, useCallback } from 'react'

import { Messages } from '@lingui/core'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useActiveLocale } from 'legacy/hooks/useActiveLocale'
import { useUserLocaleManager } from 'legacy/state/user/hooks'

import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'
import { Provider } from 'lib/i18n'

interface LanguageProviderProps {
  children: ReactNode
  messages: Messages | undefined
}

export function LanguageProvider({ children, messages }: LanguageProviderProps): ReactNode {
  const locale = useActiveLocale()
  const { setLocale } = useUserLocaleManager()
  const isInternationalizationEnabled = useIsInternationalizationEnabled()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      const effectiveLocale = isInternationalizationEnabled ? locale : DEFAULT_LOCALE
      document.documentElement.setAttribute('lang', effectiveLocale)
      // The widget ignores the stored locale, and storing its own would change the locale of CoW Swap on the same origin
      if (isInternationalizationEnabled && !isInjectedWidget()) {
        setLocale(effectiveLocale)
      }
    },
    [setLocale, isInternationalizationEnabled],
  )

  return (
    <Provider locale={locale} messages={messages} onActivate={onActivate}>
      {children}
    </Provider>
  )
}
