import { createConsentRecord, readConsentCookie, writeConsentCookie } from './consentCookie.utils'
import { CookieConsentChoice, CookieConsentRecord, CookieConsentState } from './cookieConsent.types'
import { clearTrackerStorage, reloadPage } from './trackerStorage.utils'

type Listener = () => void

const store = {
  state: null as CookieConsentState | null,
  listeners: new Set<Listener>(),
  isWatchingOtherTabs: false,
}

/** @internal Testing only */
export function __resetCookieConsentStore(): void {
  if (process.env.NODE_ENV === 'test') {
    store.state = null
    store.listeners.clear()
  }
}

export function acceptCookies(): void {
  saveChoice('accepted')
}

export function closeCookieSettings(): void {
  setState({ ...getCookieConsentState(), isSettingsOpen: false })
}

export function getCookieConsentState(): CookieConsentState {
  return store.state ?? loadState()
}

export function hasAcceptedCookies(): boolean {
  return getCookieConsentState().consent?.choice === 'accepted'
}

/** Runs the callback once: right away if cookies are accepted, otherwise when the visitor accepts them */
export function onCookiesAccepted(callback: () => void): void {
  onFirst(() => hasAcceptedCookies() || undefined, callback)
}

export function openCookieSettings(): void {
  setState({ ...getCookieConsentState(), isSettingsOpen: true })
}

export function rejectCookies(): void {
  saveChoice('rejected')
}

export function subscribeToCookieConsent(listener: Listener): () => void {
  store.listeners.add(listener)

  return () => {
    store.listeners.delete(listener)
  }
}

export function waitForCookieChoice(): Promise<CookieConsentChoice> {
  return new Promise((resolve) => onFirst(() => getCookieConsentState().consent?.choice, resolve))
}

function adoptChoiceFromAnotherTab(): void {
  const stored = readConsentCookie(Date.now())
  const current = getCookieConsentState()

  if (!stored || stored.decidedAt === current.consent?.decidedAt) return

  applyChoice(current, stored)
}

function applyChoice(previous: CookieConsentState, consent: CookieConsentRecord): void {
  // Third-party scripts can't be unloaded, so a page that has run them reloads once consent is gone
  const mustReload = previous.consent?.choice === 'accepted' && consent.choice === 'rejected'

  if (consent.choice === 'rejected') clearTrackerStorage()

  setState({ consent, isSettingsOpen: false })

  if (mustReload) reloadPage()
}

function loadState(): CookieConsentState {
  const now = Date.now()
  const consent = readConsentCookie(now)

  // Safari caps cookies written from JS at 7 days, so rewriting on every visit keeps the remaining lifetime
  if (consent) writeConsentCookie(consent, now)

  // GA rewrites its session cookie while the page unloads, after a withdrawal has already cleared it
  if (consent?.choice === 'rejected') clearTrackerStorage()

  watchOtherTabs()

  const state = { consent, isSettingsOpen: false }

  store.state = state

  return state
}

function onFirst<T>(select: () => T | undefined, callback: (value: T) => void): void {
  const value = select()

  if (value !== undefined) {
    callback(value)
    return
  }

  const unsubscribe = subscribeToCookieConsent(() => {
    const next = select()

    if (next === undefined) return

    unsubscribe()
    callback(next)
  })
}

function saveChoice(choice: CookieConsentChoice): void {
  const now = Date.now()
  const consent = createConsentRecord(choice, now)
  const previous = getCookieConsentState()

  writeConsentCookie(consent, now)
  applyChoice(previous, consent)
}

function setState(state: CookieConsentState): void {
  store.state = state
  store.listeners.forEach((listener) => listener())
}

function watchOtherTabs(): void {
  if (store.isWatchingOtherTabs || typeof document === 'undefined') return

  store.isWatchingOtherTabs = true
  document.addEventListener('visibilitychange', adoptChoiceFromAnotherTab)

  // Unlike visibilitychange, a cookie change also reaches tabs that stay in the background
  if ('cookieStore' in window) window.cookieStore.addEventListener('change', adoptChoiceFromAnotherTab)
}
