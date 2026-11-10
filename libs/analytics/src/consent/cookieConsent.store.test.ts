import { createConsentRecord, readCookieValue, writeConsentCookie } from './consentCookie.utils'
import { COOKIE_CONSENT_NAME } from './cookieConsent.constants'
import {
  __resetCookieConsentStore,
  acceptCookies,
  closeCookieSettings,
  getCookieConsentState,
  hasAcceptedCookies,
  onCookiesAccepted,
  openCookieSettings,
  rejectCookies,
  subscribeToCookieConsent,
  waitForCookieChoice,
} from './cookieConsent.store'
import { CookieConsentChoice } from './cookieConsent.types'
import { clearTrackerStorage, reloadPage } from './trackerStorage.utils'

jest.mock('./trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

const LATER_MS = 1000

function chooseInAnotherTab(choice: CookieConsentChoice): void {
  const now = Date.now()

  writeConsentCookie(createConsentRecord(choice, now + LATER_MS), now)
  document.dispatchEvent(new Event('visibilitychange'))
}

function clearConsentCookie(): void {
  document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
}

function storeChoice(choice: CookieConsentChoice): void {
  const now = Date.now()

  writeConsentCookie(createConsentRecord(choice, now), now)
}

describe('cookieConsent.store', () => {
  beforeEach(() => {
    clearConsentCookie()
    __resetCookieConsentStore()
    jest.clearAllMocks()
  })

  it('starts undecided when no cookie is stored', () => {
    expect(getCookieConsentState().consent).toBeNull()
    expect(hasAcceptedCookies()).toBe(false)
  })

  it('reads a stored choice', () => {
    storeChoice('rejected')

    expect(getCookieConsentState().consent?.choice).toBe('rejected')
  })

  it('clears leftover tracker storage when a stored rejection is read', () => {
    storeChoice('rejected')
    getCookieConsentState()

    expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('keeps tracker storage when a stored acceptance is read', () => {
    storeChoice('accepted')
    getCookieConsentState()

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

    expect(getCookieConsentState().consent?.choice).toBe('rejected')
    expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('clears trackers and reloads when withdrawing an acceptance', () => {
    acceptCookies()
    rejectCookies()

    expect(getCookieConsentState().consent?.choice).toBe('rejected')
    expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })

  it('reloads when withdrawing an acceptance stored on an earlier visit', () => {
    storeChoice('accepted')
    rejectCookies()

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

  describe('onCookiesAccepted', () => {
    it('runs right away when cookies are already accepted', () => {
      const callback = jest.fn()

      acceptCookies()
      onCookiesAccepted(callback)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('waits through a rejection and runs once on acceptance', () => {
      const callback = jest.fn()

      onCookiesAccepted(callback)
      rejectCookies()
      expect(callback).not.toHaveBeenCalled()

      acceptCookies()
      openCookieSettings()
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('waitForCookieChoice', () => {
    it('resolves with an existing choice', async () => {
      acceptCookies()

      await expect(waitForCookieChoice()).resolves.toBe('accepted')
    })

    it('waits until a choice is made', async () => {
      const choice = waitForCookieChoice()

      openCookieSettings()
      rejectCookies()

      await expect(choice).resolves.toBe('rejected')
    })
  })

  describe('a choice made in another tab', () => {
    it('is adopted when the tab becomes visible', () => {
      const callback = jest.fn()

      onCookiesAccepted(callback)
      chooseInAnotherTab('accepted')

      expect(hasAcceptedCookies()).toBe(true)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(reloadPage).not.toHaveBeenCalled()
    })

    it('reloads a page that has run trackers when the other tab rejects', () => {
      acceptCookies()
      chooseInAnotherTab('rejected')

      expect(hasAcceptedCookies()).toBe(false)
      expect(clearTrackerStorage).toHaveBeenCalledTimes(1)
      expect(reloadPage).toHaveBeenCalledTimes(1)
    })

    it('does not reload a page that never ran trackers', () => {
      getCookieConsentState()
      chooseInAnotherTab('rejected')

      expect(getCookieConsentState().consent?.choice).toBe('rejected')
      expect(reloadPage).not.toHaveBeenCalled()
    })

    it('keeps the current choice when the cookie is gone', () => {
      acceptCookies()
      clearConsentCookie()
      document.dispatchEvent(new Event('visibilitychange'))

      expect(hasAcceptedCookies()).toBe(true)
      expect(reloadPage).not.toHaveBeenCalled()
    })
  })
})
