import { ConsentGatedCowAnalytics } from './ConsentGatedCowAnalytics'

import { createConsentRecord, writeConsentCookie } from '../consent/consentCookie.utils'
import { COOKIE_CONSENT_NAME } from '../consent/cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies, rejectCookies } from '../consent/cookieConsent.store'
import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'

jest.mock('../consent/trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

const ACCOUNT = '0x1111111111111111111111111111111111111111'

function createAnalyticsMock(): jest.Mocked<CowAnalytics> {
  return {
    setUserAccount: jest.fn(),
    sendPageView: jest.fn(),
    sendEvent: jest.fn(),
    sendTiming: jest.fn(),
    sendError: jest.fn(),
    outboundLink: jest.fn(),
    setContext: jest.fn(),
  }
}

describe('ConsentGatedCowAnalytics', () => {
  let loaded: jest.Mocked<CowAnalytics>
  let loadAnalytics: jest.Mock<CowAnalytics, []>

  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    __resetCookieConsentStore()
    loaded = createAnalyticsMock()
    loadAnalytics = jest.fn(() => loaded)
  })

  it('loads nothing before the visitor accepts', () => {
    const analytics = new ConsentGatedCowAnalytics(loadAnalytics)

    analytics.setContext(AnalyticsContext.chainId, '1')
    analytics.setUserAccount(ACCOUNT, 'MetaMask')
    analytics.sendPageView('/swap')
    analytics.sendEvent({ category: 'Trade', action: 'Swap' })
    analytics.sendTiming('Web Vitals', 'LCP', 1, 'label')
    analytics.sendError(new Error('boom'))

    expect(loadAnalytics).not.toHaveBeenCalled()
  })

  it('loads nothing after a rejection, and loads if the visitor accepts later', () => {
    new ConsentGatedCowAnalytics(loadAnalytics)

    rejectCookies()
    expect(loadAnalytics).not.toHaveBeenCalled()

    acceptCookies()
    expect(loadAnalytics).toHaveBeenCalledTimes(1)
  })

  it('replays only the latest context, account and page view on acceptance, context first', () => {
    const analytics = new ConsentGatedCowAnalytics(loadAnalytics)

    analytics.sendPageView('/swap')
    analytics.setUserAccount(ACCOUNT, 'MetaMask')
    analytics.setContext(AnalyticsContext.chainId, '1')
    analytics.setContext(AnalyticsContext.chainId, '100')
    analytics.sendPageView('/limit')
    analytics.sendEvent({ category: 'Trade', action: 'Swap' })

    acceptCookies()

    expect(loaded.setContext).toHaveBeenCalledTimes(1)
    expect(loaded.setContext).toHaveBeenCalledWith(AnalyticsContext.chainId, '100')
    expect(loaded.setUserAccount).toHaveBeenCalledWith(ACCOUNT, 'MetaMask')
    expect(loaded.sendPageView).toHaveBeenCalledTimes(1)
    expect(loaded.sendPageView).toHaveBeenCalledWith('/limit')
    expect(loaded.sendEvent).not.toHaveBeenCalled()

    const contextOrder = loaded.setContext.mock.invocationCallOrder[0]

    expect(contextOrder).toBeLessThan(loaded.setUserAccount.mock.invocationCallOrder[0])
    expect(contextOrder).toBeLessThan(loaded.sendPageView.mock.invocationCallOrder[0])
  })

  it('does not replay a disconnected account', () => {
    const analytics = new ConsentGatedCowAnalytics(loadAnalytics)

    analytics.setUserAccount(undefined)
    acceptCookies()

    expect(loaded.setUserAccount).not.toHaveBeenCalled()
  })

  it('forwards calls once loaded', () => {
    const analytics = new ConsentGatedCowAnalytics(loadAnalytics)
    const event = { category: 'Trade', action: 'Swap' }

    acceptCookies()
    analytics.sendEvent(event)
    analytics.setContext(AnalyticsContext.chainId, '1')

    expect(loaded.sendEvent).toHaveBeenCalledWith(event, undefined)
    expect(loaded.setContext).toHaveBeenCalledWith(AnalyticsContext.chainId, '1')
  })

  it('loads right away when cookies were accepted on an earlier visit', () => {
    const now = Date.now()

    writeConsentCookie(createConsentRecord('accepted', now), now)
    new ConsentGatedCowAnalytics(loadAnalytics)

    expect(loadAnalytics).toHaveBeenCalledTimes(1)
  })

  it('still runs outbound link callbacks before the visitor accepts', () => {
    jest.useFakeTimers()
    const hitCallback = jest.fn()

    new ConsentGatedCowAnalytics(loadAnalytics).outboundLink({ label: 'docs', hitCallback })
    jest.runAllTimers()

    expect(hitCallback).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })
})
