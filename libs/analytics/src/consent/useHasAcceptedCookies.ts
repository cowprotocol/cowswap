import { useSyncExternalStore } from 'react'

import { hasAcceptedCookies, subscribeToCookieConsent } from './cookieConsent.store'

export function useHasAcceptedCookies(): boolean {
  return useSyncExternalStore(subscribeToCookieConsent, hasAcceptedCookies, getServerSnapshot)
}

function getServerSnapshot(): boolean {
  return false
}
