import { act, renderHook } from '@testing-library/react'

import { COOKIE_CONSENT_NAME } from './cookieConsent.constants'
import { __resetCookieConsentStore, acceptCookies } from './cookieConsent.store'
import { useHasAcceptedCookies } from './useHasAcceptedCookies'

describe('useHasAcceptedCookies', () => {
  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    __resetCookieConsentStore()
  })

  it('follows the choice', () => {
    const { result } = renderHook(() => useHasAcceptedCookies())

    expect(result.current).toBe(false)

    act(() => acceptCookies())

    expect(result.current).toBe(true)
  })
})
