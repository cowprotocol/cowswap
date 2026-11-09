import { initGtm } from './initGtm'
import { __resetGtmWithConsentInstance, initGtmWithConsent } from './initGtmWithConsent'

import { createConsentRecord, writeConsentCookie } from '../consent/consentCookie.utils'
import { COOKIE_CONSENT_NAME } from '../consent/cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies, rejectCookies } from '../consent/cookieConsent.store'
import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'

jest.mock('./initGtm', () => ({ initGtm: jest.fn() }))
jest.mock('../consent/trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

const initGtmMock = jest.mocked(initGtm)

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

describe('initGtmWithConsent', () => {
  let gtmAnalytics: jest.Mocked<CowAnalytics>

  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    window.dataLayer = []
    __resetCookieConsentStore()
    __resetGtmWithConsentInstance()
    gtmAnalytics = createAnalyticsMock()
    initGtmMock.mockReset()
    initGtmMock.mockReturnValue(gtmAnalytics)
  })

  it('returns the same instance', () => {
    expect(initGtmWithConsent()).toBe(initGtmWithConsent())
  })

  it('sends nothing and does not load GTM before consent', () => {
    const analytics = initGtmWithConsent()

    analytics.setContext(AnalyticsContext.chainId, '1')
    analytics.setUserAccount('0x1111111111111111111111111111111111111111', 'MetaMask')
    analytics.sendPageView('/swap')
    analytics.sendEvent({ category: 'Trade', action: 'Swap' })
    analytics.sendTiming('Web Vitals', 'LCP', 1, 'label')
    analytics.sendError(new Error('boom'))

    expect(initGtmMock).not.toHaveBeenCalled()
    expect(window.dataLayer).toEqual([])
  })

  it('does not load GTM after a rejection', () => {
    initGtmWithConsent()
    rejectCookies()

    expect(initGtmMock).not.toHaveBeenCalled()
  })

  it('loads GTM on acceptance and replays only the latest context, account and page view', () => {
    const analytics = initGtmWithConsent()
    const account = '0x1111111111111111111111111111111111111111'

    analytics.setContext(AnalyticsContext.chainId, '1')
    analytics.setContext(AnalyticsContext.chainId, '100')
    analytics.setUserAccount(account, 'MetaMask')
    analytics.sendPageView('/swap')
    analytics.sendPageView('/limit')
    analytics.sendEvent({ category: 'Trade', action: 'Swap' })

    acceptCookies()

    expect(initGtmMock).toHaveBeenCalledTimes(1)
    expect(gtmAnalytics.setContext).toHaveBeenCalledTimes(1)
    expect(gtmAnalytics.setContext).toHaveBeenCalledWith(AnalyticsContext.chainId, '100')
    expect(gtmAnalytics.setUserAccount).toHaveBeenCalledWith(account, 'MetaMask')
    expect(gtmAnalytics.sendPageView).toHaveBeenCalledTimes(1)
    expect(gtmAnalytics.sendPageView).toHaveBeenCalledWith('/limit')
    expect(gtmAnalytics.sendEvent).not.toHaveBeenCalled()
  })

  it('does not replay a disconnected account', () => {
    const analytics = initGtmWithConsent()

    analytics.setUserAccount(undefined)
    acceptCookies()

    expect(gtmAnalytics.setUserAccount).not.toHaveBeenCalled()
  })

  it('forwards calls once GTM is loaded', () => {
    const analytics = initGtmWithConsent()
    const event = { category: 'Trade', action: 'Swap' }

    acceptCookies()
    analytics.sendEvent(event)

    expect(gtmAnalytics.sendEvent).toHaveBeenCalledWith(event, undefined)
  })

  it('grants Google consent before GTM loads', () => {
    let dataLayerAtLoad: unknown[] = []

    initGtmMock.mockImplementation(() => {
      dataLayerAtLoad = window.dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>))
      return gtmAnalytics
    })

    initGtmWithConsent()
    acceptCookies()

    expect(dataLayerAtLoad).toEqual([
      [
        'consent',
        'default',
        {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        },
      ],
    ])
  })

  it('loads GTM right away when consent was given on an earlier visit', () => {
    const now = Date.now()

    writeConsentCookie(createConsentRecord('accepted', now), now)
    __resetCookieConsentStore()

    initGtmWithConsent()

    expect(initGtmMock).toHaveBeenCalledTimes(1)
  })

  it('still runs outbound link callbacks before consent', () => {
    jest.useFakeTimers()
    const hitCallback = jest.fn()

    initGtmWithConsent().outboundLink({ label: 'docs', hitCallback })
    jest.runAllTimers()

    expect(hitCallback).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })
})
