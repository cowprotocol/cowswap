import { useSyncExternalStore } from 'react'

import {
  acceptCookies,
  closeCookieSettings,
  getCookieConsentState,
  openCookieSettings,
  rejectCookies,
  subscribeToCookieConsent,
} from './cookieConsent.store'
import { CookieConsentRecord, CookieConsentState } from './cookieConsent.types'

export interface CookieConsentControls {
  consent: CookieConsentRecord | null
  isBannerOpen: boolean
  acceptCookies(): void
  rejectCookies(): void
  openCookieSettings(): void
  closeCookieSettings(): void
}

export function useCookieConsent(): CookieConsentControls {
  const state = useSyncExternalStore<CookieConsentState | null>(
    subscribeToCookieConsent,
    getCookieConsentState,
    getServerSnapshot,
  )

  return {
    consent: state?.consent ?? null,
    isBannerOpen: !!state && (state.consent === null || state.isSettingsOpen),
    acceptCookies,
    rejectCookies,
    openCookieSettings,
    closeCookieSettings,
  }
}

function getServerSnapshot(): null {
  return null
}
