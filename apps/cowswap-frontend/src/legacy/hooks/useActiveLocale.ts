import { useMemo } from 'react'

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from '@cowprotocol/common-const'
import { useParsedQueryString, parsedQueryString } from '@cowprotocol/common-hooks'

import { cowSwapStore } from 'legacy/state'
import { useUserLocale } from 'legacy/state/user/hooks'

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
function parseLocale(maybeSupportedLocale: unknown): SupportedLocale | undefined {
  if (typeof maybeSupportedLocale !== 'string') return undefined
  const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase()
  return SUPPORTED_LOCALES.find(
    (locale) => locale.toLowerCase() === lowerMaybeSupportedLocale || locale.split('-')[0] === lowerMaybeSupportedLocale
  )
}

/**
 * Returns the supported locale read from the user agent (navigator)
 */
export function navigatorLocale(): SupportedLocale | undefined {
  if (!navigator.language) return undefined

  const [language, region] = navigator.language.split('-')

  if (region) {
    return parseLocale(`${language}-${region.toUpperCase()}`) ?? parseLocale(language)
  }

  return parseLocale(language)
}

function storeLocale(): SupportedLocale | undefined {
  return cowSwapStore.getState().user.userLocale ?? undefined
}

export const initialLocale =
  parseLocale(parsedQueryString().lng) ?? storeLocale() ?? navigatorLocale() ?? DEFAULT_LOCALE

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useUrlLocale() {
  const parsed = useParsedQueryString()
  return parseLocale(parsed.lng)
}

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in redux (if set) to persist across sessions
 */
export function useActiveLocale(): SupportedLocale {
  const urlLocale = useUrlLocale()
  const userLocale = useUserLocale()
  return useMemo(() => urlLocale ?? userLocale ?? navigatorLocale() ?? DEFAULT_LOCALE, [urlLocale, userLocale])
}
