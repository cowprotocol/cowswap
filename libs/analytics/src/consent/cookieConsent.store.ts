import { createConsentRecord, readConsentCookie, writeConsentCookie } from './consentCookie.utils'
import { CookieConsentChoice, CookieConsentRecord, CookieConsentState } from './cookieConsent.types'
import { clearTrackerStorage, reloadPage } from './trackerStorage.utils'

type Listener = () => void

const store = {
  state: null as CookieConsentState | null,
  listeners: new Set<Listener>(),
}

/** @internal Testing only */
export function __resetCookieConsentStore(): void {
  if (process.env.NODE_ENV === 'test') {
    store.state = null
    store.listeners.clear()
  }
}

export function acceptCookies(): void {
  saveConsent('accepted')
}

export function closeCookieSettings(): void {
  setState({ ...getCookieConsentState(), isSettingsOpen: false })
}

export function getCookieConsent(): CookieConsentRecord | null {
  return getCookieConsentState().consent
}

export function getCookieConsentState(): CookieConsentState {
  if (!store.state) {
    store.state = { consent: loadStoredConsent(), isSettingsOpen: false }
  }

  return store.state
}

export function hasAcceptedCookies(): boolean {
  return getCookieConsent()?.choice === 'accepted'
}

export function openCookieSettings(): void {
  setState({ ...getCookieConsentState(), isSettingsOpen: true })
}

export function rejectCookies(): void {
  const wasAccepted = hasAcceptedCookies()

  saveConsent('rejected')
  clearTrackerStorage()

  if (wasAccepted) reloadPage()
}

export function subscribeToCookieConsent(listener: Listener): () => void {
  store.listeners.add(listener)

  return () => {
    store.listeners.delete(listener)
  }
}

export function waitForCookieConsentDecision(): Promise<CookieConsentChoice> {
  const consent = getCookieConsent()

  if (consent) return Promise.resolve(consent.choice)

  return new Promise((resolve) => {
    const unsubscribe = subscribeToCookieConsent(() => {
      const decided = getCookieConsent()

      if (!decided) return

      unsubscribe()
      resolve(decided.choice)
    })
  })
}

function loadStoredConsent(): CookieConsentRecord | null {
  const now = Date.now()
  const consent = readConsentCookie(now)

  // Safari caps cookies written from JS at 7 days, so rewriting on every visit keeps the remaining lifetime
  if (consent) writeConsentCookie(consent, now)

  // GA rewrites its session cookie while the page unloads, after a withdrawal has already cleared it
  if (consent?.choice === 'rejected') clearTrackerStorage()

  return consent
}

function saveConsent(choice: CookieConsentChoice): void {
  const now = Date.now()
  const consent = createConsentRecord(choice, now)

  writeConsentCookie(consent, now)
  setState({ consent, isSettingsOpen: false })
}

function setState(state: CookieConsentState): void {
  store.state = state
  store.listeners.forEach((listener) => listener())
}
