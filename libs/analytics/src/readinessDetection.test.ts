import { COOKIE_CONSENT_NAME } from './consent/cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies, rejectCookies } from './consent/cookieConsent.store'
import { waitForAnalytics } from './readinessDetection'

jest.mock('./consent/trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

describe('waitForAnalytics', () => {
  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    __resetCookieConsentStore()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (window as unknown as { dataLayer?: unknown }).dataLayer
  })

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
    window.dataLayer = []
    waitForAnalytics().then(onResolved)

    await jest.advanceTimersByTimeAsync(3_000)
    expect(onResolved).not.toHaveBeenCalled()

    await jest.advanceTimersByTimeAsync(1_000)
    expect(onResolved).toHaveBeenCalledTimes(1)
  })
})
