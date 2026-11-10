import { __resetGtmInstance, initGtm } from './initGtm'

import { COOKIE_CONSENT_NAME } from '../consent/cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies } from '../consent/cookieConsent.store'

const GTM_SELECTOR = 'script[src^="https://www.googletagmanager.com/gtm.js"]'

type TestWindow = { cowAnalyticsInstance?: unknown; dataLayer?: unknown[] }

describe('initGtm', () => {
  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    document.querySelectorAll(`${GTM_SELECTOR}, noscript`).forEach((element) => element.remove())
    delete (window as TestWindow).cowAnalyticsInstance
    delete (window as TestWindow).dataLayer
    __resetCookieConsentStore()
    __resetGtmInstance()
  })

  it('returns the same instance', () => {
    expect(initGtm()).toBe(initGtm())
  })

  it('does not load GTM before the visitor accepts cookies', () => {
    initGtm().sendEvent({ category: 'Trade', action: 'Swap' })

    expect(document.querySelector(GTM_SELECTOR)).toBeNull()
    expect((window as TestWindow).dataLayer).toBeUndefined()
  })

  it('loads GTM on acceptance, after granting Google consent', () => {
    initGtm()
    acceptCookies()

    const [consent, gtmStart] = (window as TestWindow).dataLayer ?? []

    expect(document.querySelectorAll(GTM_SELECTOR)).toHaveLength(1)
    expect(Array.from(consent as ArrayLike<unknown>)).toEqual([
      'consent',
      'default',
      { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' },
    ])
    expect(gtmStart).toMatchObject({ event: 'gtm.js' })
  })
})
