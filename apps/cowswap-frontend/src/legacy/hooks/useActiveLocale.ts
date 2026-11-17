import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'
import { useParsedQueryString, parsedQueryString } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { getWidgetLocale, parseLocale, setWidgetLocale } from 'entities/injectedWidget'

import { cowSwapStore } from 'legacy/state'
import { useUserLocale } from 'legacy/state/user/hooks'

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux (without react context)
 * Required to preload "messages" before <Main> render
 * @see useActiveLocale - should implement **the same** locale detection logic
 */
export function getActiveLocale(): SupportedLocale {
  return resolveActiveLocale(parseLocale(parsedQueryString().lng), storeLocale())
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

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in redux (if set) to persist across sessions
 */
export function useActiveLocale(): SupportedLocale {
  const urlLocale = useUrlLocale()
  const userLocale = useUserLocale()
  // Not memoized by the URL locale: a widget params update can drop the integrator's locale while `lng` stays absent
  return resolveActiveLocale(urlLocale, userLocale)
}

function resolveActiveLocale(
  urlLocale: SupportedLocale | undefined,
  userLocale: SupportedLocale | undefined | null,
): SupportedLocale {
  if (isInjectedWidget()) {
    if (urlLocale) setWidgetLocale(urlLocale)

    // Ignore persisted locale in widget mode: the integrator's URL / params update decides, then the device
    return getWidgetLocale() ?? navigatorLocale() ?? DEFAULT_LOCALE
  }

  return urlLocale ?? userLocale ?? navigatorLocale() ?? DEFAULT_LOCALE
}

function storeLocale(): SupportedLocale | undefined {
  return cowSwapStore.getState().user.userLocale ?? undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useUrlLocale() {
  const parsed = useParsedQueryString()
  return parseLocale(parsed.lng)
}
