import { createConsentRecord, readCookieValue, writeConsentCookie } from './consentCookie.utils'
import { COOKIE_CONSENT_NAME } from './cookieConsent.constants'
import {
  __resetCookieConsentStore,
  acceptCookies,
  closeCookieSettings,
  getCookieConsent,
  getCookieConsentState,
  hasAcceptedCookies,
  openCookieSettings,
  rejectCookies,
  subscribeToCookieConsent,
  waitForCookieConsentDecision,
} from './cookieConsent.store'
import { clearTrackerStorage, reloadPage } from './trackerStorage.utils'

jest.mock('./trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

function clearConsentCookie(): void {
  document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
}

describe('cookieConsent.store', () => {
  beforeEach(() => {
    clearConsentCookie()
    __resetCookieConsentStore()
    jest.clearAllMocks()
  })

  it('starts undecided when no cookie is stored', () => {
    expect(getCookieConsent()).toBeNull()
    expect(hasAcceptedCookies()).toBe(false)
  })

  it('reads a stored choice', () => {
    const now = Date.now()

    writeConsentCookie(createConsentRecord('rejected', now), now)
    __resetCookieConsentStore()

    expect(getCookieConsent()?.choice).toBe('rejected')
  })

  it('clears leftover tracker storage when a stored rejection is read', () => {
    const now = Date.now()

    writeConsentCookie(createConsentRecord('rejected', now), now)
    __resetCookieConsentStore()
    getCookieConsent()

    expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('keeps tracker storage when a stored acceptance is read', () => {
    const now = Date.now()

    writeConsentCookie(createConsentRecord('accepted', now), now)
    __resetCookieConsentStore()
    getCookieConsent()

    expect(clearTrackerStorage).not.toHaveBeenCalled()
  })

  it('stores an acceptance and notifies subscribers', () => {
    const listener = jest.fn()

    subscribeToCookieConsent(listener)
    acceptCookies()

    expect(hasAcceptedCookies()).toBe(true)
    expect(readCookieValue(document.cookie, COOKIE_CONSENT_NAME)).toBeDefined()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('stops notifying after unsubscribing', () => {
    const listener = jest.fn()
    const unsubscribe = subscribeToCookieConsent(listener)

    unsubscribe()
    acceptCookies()

    expect(listener).not.toHaveBeenCalled()
  })

  it('clears trackers without reloading when rejecting without a prior acceptance', () => {
    rejectCookies()

    expect(getCookieConsent()?.choice).toBe('rejected')
    expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('clears trackers and reloads when withdrawing an acceptance', () => {
    acceptCookies()
    rejectCookies()

    expect(getCookieConsent()?.choice).toBe('rejected')
    expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })

  it('opens and closes the settings, and closes them on a choice', () => {
    openCookieSettings()
    expect(getCookieConsentState().isSettingsOpen).toBe(true)

    closeCookieSettings()
    expect(getCookieConsentState().isSettingsOpen).toBe(false)

    openCookieSettings()
    acceptCookies()
    expect(getCookieConsentState().isSettingsOpen).toBe(false)
  })

  describe('waitForCookieConsentDecision', () => {
    it('resolves with an existing choice', async () => {
      acceptCookies()

      await expect(waitForCookieConsentDecision()).resolves.toBe('accepted')
    })

    it('waits until a choice is made', async () => {
      const decision = waitForCookieConsentDecision()

      openCookieSettings()
      rejectCookies()

      await expect(decision).resolves.toBe('rejected')
    })
  })
})
