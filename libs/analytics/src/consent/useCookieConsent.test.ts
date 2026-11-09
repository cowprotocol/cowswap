import { act, renderHook } from '@testing-library/react'

import { COOKIE_CONSENT_NAME } from './cookieConsent.constants'
import { __resetCookieConsentStore } from './cookieConsent.store'
import { useCookieConsent } from './useCookieConsent'

jest.mock('./trackerStorage.utils', () => ({
  clearTrackerStorage: jest.fn(),
  reloadPage: jest.fn(),
}))

describe('useCookieConsent', () => {
  beforeEach(() => {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/`
    __resetCookieConsentStore()
  })

  it('opens the banner while no choice is made', () => {
    const { result } = renderHook(() => useCookieConsent())

    expect(result.current.consent).toBeNull()
    expect(result.current.isBannerOpen).toBe(true)
  })

  it('closes the banner after a choice and reopens it from the settings', () => {
    const { result } = renderHook(() => useCookieConsent())

    act(() => result.current.acceptCookies())

    expect(result.current.consent?.choice).toBe('accepted')
    expect(result.current.isBannerOpen).toBe(false)

    act(() => result.current.openCookieSettings())

    expect(result.current.isBannerOpen).toBe(true)
  })
})
