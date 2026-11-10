import { COOKIE_CONSENT_NAME } from './consent/cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies, rejectCookies } from './consent/cookieConsent.store'
import { __resetNoopCowAnalyticsInstance, createNoopCowAnalytics } from './noop/createNoopCowAnalytics'
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
    __resetNoopCowAnalyticsInstance()
    delete (window as TestWindow).cowAnalyticsInstance
    delete (window as TestWindow).dataLayer
  })

  it('resolves right away after a rejection', async () => {
    rejectCookies()

    await expect(waitForAnalytics()).resolves.toBeUndefined()
  })

  it('resolves right away with no-op analytics, without a cookie choice', async () => {
    createNoopCowAnalytics()

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
