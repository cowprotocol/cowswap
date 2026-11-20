import { createStore } from 'jotai'

import { featureFlagsAtom, featureFlagsStatusAtom } from 'common/state/featureFlagsState'

import { captchaCanQuoteAtom } from './captchaCanQuoteAtom'
import { captchaJwtAtom } from './captchaJwtAtom'

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

  it('requires a JWT when captcha is enabled', () => {
    localStorage.clear()

    const store = createStore()
    store.set(featureFlagsAtom, { isCaptchaEnabled: true })
    store.set(featureFlagsStatusAtom, 'ready')

    expect(store.get(captchaCanQuoteAtom)).toBe(false)

    store.set(captchaJwtAtom, createJwt())

    expect(store.get(captchaCanQuoteAtom)).toBe(true)
  })
})

function createJwt(): string {
  const payload = globalThis
    .btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `header.${payload}.signature`
}
