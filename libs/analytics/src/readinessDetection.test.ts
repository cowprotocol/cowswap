import { COOKIE_CONSENT_NAME } from './consent/cookieConsent.constants'
import {
  __resetCookieConsentStore,
  acceptCookies,
  rejectCookies,
  requireCookieConsent,
} from './consent/cookieConsent.store'
import { waitForAnalytics } from './readinessDetection'

jest.mock('./consent/trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

type TestWindow = { cowAnalyticsInstance?: unknown; dataLayer?: unknown[] }

describe('waitForAnalytics', () => {
  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    __resetCookieConsentStore()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (window as TestWindow).cowAnalyticsInstance
    delete (window as TestWindow).dataLayer
  })

  describe('in an app that does not require cookie consent', () => {
    it('waits for GTM without a cookie choice', async () => {
      const onResolved = jest.fn()

      ;(window as TestWindow).dataLayer = []
      waitForAnalytics().then(onResolved)

      await jest.advanceTimersByTimeAsync(3_000)
      expect(onResolved).not.toHaveBeenCalled()

      await jest.advanceTimersByTimeAsync(1_000)
      expect(onResolved).toHaveBeenCalledTimes(1)
    })

    it('ignores a stored rejection', async () => {
      rejectCookies()
      __resetCookieConsentStore()
      const onResolved = jest.fn()

      waitForAnalytics().then(onResolved)

      await jest.advanceTimersByTimeAsync(4_000)
      expect(onResolved).not.toHaveBeenCalled()

      await jest.advanceTimersByTimeAsync(1_100)
      expect(onResolved).toHaveBeenCalledTimes(1)
    })
  })

  describe('in an app that requires cookie consent', () => {
    beforeEach(() => requireCookieConsent())

    it('resolves right away after a rejection', async () => {
      rejectCookies()

      await expect(waitForAnalytics()).resolves.toBeUndefined()
    })

    it('stays pending until a choice is made', async () => {
      const onResolved = jest.fn()

      waitForAnalytics().then(onResolved)
      await jest.advanceTimersByTimeAsync(15_000)

      expect(onResolved).not.toHaveBeenCalled()

      rejectCookies()
      await jest.advanceTimersByTimeAsync(0)

      expect(onResolved).toHaveBeenCalledTimes(1)
    })

    it('waits for GTM after an acceptance', async () => {
      const onResolved = jest.fn()

      acceptCookies()
      ;(window as TestWindow).dataLayer = []
      waitForAnalytics().then(onResolved)

      await jest.advanceTimersByTimeAsync(3_000)
      expect(onResolved).not.toHaveBeenCalled()

      await jest.advanceTimersByTimeAsync(1_000)
      expect(onResolved).toHaveBeenCalledTimes(1)
    })
  })
})
