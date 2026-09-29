import { createStore } from 'jotai'

import { featureFlagsAtom, featureFlagsStatusAtom } from 'common/state/featureFlagsState'

import { captchaCanQuoteAtom } from './captchaCanQuoteAtom'

describe('captchaCanQuoteAtom', () => {
  const previousSiteKey = process.env.REACT_APP_TURNSTILE_SITE_KEY

  beforeAll(() => {
    process.env.REACT_APP_TURNSTILE_SITE_KEY = 'site-key'
  })

  afterAll(() => {
    if (previousSiteKey === undefined) delete process.env.REACT_APP_TURNSTILE_SITE_KEY
    else process.env.REACT_APP_TURNSTILE_SITE_KEY = previousSiteKey
  })

  it('blocks quotes while feature flags are loading', () => {
    const store = createStore()

    expect(store.get(captchaCanQuoteAtom)).toBe(false)
  })

  it('allows quotes when feature flags are unavailable', () => {
    const store = createStore()
    store.set(featureFlagsStatusAtom, 'unavailable')

    expect(store.get(captchaCanQuoteAtom)).toBe(true)
  })

  it('requires CAPTCHA when the resolved feature flag enables it', () => {
    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })
    store.set(featureFlagsStatusAtom, 'ready')

    expect(store.get(captchaCanQuoteAtom)).toBe(false)
  })
})
