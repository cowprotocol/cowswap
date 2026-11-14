import {
  COOKIE_CONSENT_COPY,
  CookieConsentBannerControls,
  useCookieConsentBanner,
} from '@cowprotocol/analytics/consent'

import { fireEvent, render, screen } from '@testing-library/react'

import { CookieConsentBanner } from './CookieConsentBanner'

jest.mock('@cowprotocol/assets/images/cow-cookie.svg', () => ({
  __esModule: true,
  default: { src: '/cow-cookie.svg', height: 112, width: 144 },
}))

jest.mock('@cowprotocol/analytics/consent', () => ({
  ...jest.requireActual('@cowprotocol/analytics/consent'),
  useCookieConsentBanner: jest.fn(),
}))

function mockBanner(overrides: Partial<CookieConsentBannerControls> = {}): CookieConsentBannerControls {
  const banner: CookieConsentBannerControls = {
    isOpen: true,
    isReopened: false,
    messageId: 'cookie-message',
    dialogProps: {
      ref: { current: null },
      role: 'dialog',
      'aria-modal': false,
      'aria-describedby': 'cookie-message',
      tabIndex: -1,
    },
    accept: jest.fn(),
    reject: jest.fn(),
    close: jest.fn(),
    ...overrides,
  }
  jest.mocked(useCookieConsentBanner).mockReturnValue(banner)
  return banner
}

describe('CookieConsentBanner', () => {
  it('renders nothing when the shared consent controls are closed', () => {
    mockBanner({ isOpen: false })
    const { container } = render(<CookieConsentBanner />)
    expect(container.childElementCount).toBe(0)
  })

  it('uses the shared copy, decorative cow and equally styled choices', () => {
    const banner = mockBanner()
    render(<CookieConsentBanner />)

    expect(screen.getByRole('heading', { name: COOKIE_CONSENT_COPY.title })).toBeTruthy()
    expect(screen.getByRole('dialog').textContent).toContain(COOKIE_CONSENT_COPY.message)
    expect(document.querySelector('img')?.parentElement?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('link', { name: COOKIE_CONSENT_COPY.policyLinkLabel }).getAttribute('href')).toBe(
      'https://cow.fi/legal/cowswap-cookie-policy',
    )
    const reject = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel })
    const accept = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel })
    expect(reject.className).toBe(accept.className)
    expect(screen.queryByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel })).toBeNull()
    fireEvent.click(reject)
    fireEvent.click(accept)
    expect(banner.reject).toHaveBeenCalledTimes(1)
    expect(banner.accept).toHaveBeenCalledTimes(1)
  })

  it('offers Close only when reopened from Cookie settings', () => {
    const banner = mockBanner({ isReopened: true })
    render(<CookieConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel }))
    expect(banner.close).toHaveBeenCalledTimes(1)
  })
})
