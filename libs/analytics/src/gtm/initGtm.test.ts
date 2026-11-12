import { __resetGtmInstance, initGtm, initGtmWithConsent } from './initGtm'

import { COOKIE_CONSENT_NAME } from '../consent/cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies, isCookieConsentRequired } from '../consent/cookieConsent.store'

const GTM_SELECTOR = 'script[src^="https://www.googletagmanager.com/gtm.js"]'

type TestWindow = { cowAnalyticsInstance?: unknown; dataLayer?: unknown[] }

beforeEach(() => {
  document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
  document.querySelectorAll(`${GTM_SELECTOR}, noscript`).forEach((element) => element.remove())
  delete (window as TestWindow).cowAnalyticsInstance
  delete (window as TestWindow).dataLayer
  __resetCookieConsentStore()
  __resetGtmInstance()
})

describe('initGtm', () => {
  it('returns the same instance', () => {
    expect(initGtm()).toBe(initGtm())
  })

  it('loads GTM right away, without a cookie choice', () => {
    initGtm()

    const [gtmStart] = (window as TestWindow).dataLayer ?? []

    expect(document.querySelectorAll(GTM_SELECTOR)).toHaveLength(1)
    expect(gtmStart).toMatchObject({ event: 'gtm.js' })
    expect(isCookieConsentRequired()).toBe(false)
    expect(document.cookie).not.toContain(COOKIE_CONSENT_NAME)
  })

  it('throws after initGtmWithConsent', () => {
    initGtmWithConsent()

    expect(() => initGtm()).toThrow('GTM already initialized with a different cookie consent mode')
  })
})

describe('initGtmWithConsent', () => {
  it('returns the same instance', () => {
    expect(initGtmWithConsent()).toBe(initGtmWithConsent())
  })

  it('requires cookie consent', () => {
    initGtmWithConsent()

    expect(isCookieConsentRequired()).toBe(true)
  })

  it('does not load GTM before the visitor accepts cookies', () => {
    initGtmWithConsent().sendEvent({ category: 'Trade', action: 'Swap' })

    expect(document.querySelector(GTM_SELECTOR)).toBeNull()
    expect((window as TestWindow).dataLayer).toBeUndefined()
  })

  it('loads GTM on acceptance, after granting Google consent', () => {
    initGtmWithConsent()
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

  it('throws after initGtm', () => {
    initGtm()

    expect(() => initGtmWithConsent()).toThrow('GTM already initialized with a different cookie consent mode')
  })
})
