import { COOKIE_CONSENT_COPY, CookieConsentBannerControls, useCookieConsentBanner } from '@cowprotocol/analytics'

import { fireEvent, render, screen } from '@testing-library/react'

import { CookieConsentBannerContainer } from './CookieConsentBanner.container'

jest.mock('@cowprotocol/analytics', () => ({
  ...jest.requireActual('@cowprotocol/analytics/consent'),
  useCookieConsentBanner: jest.fn(),
}))

const MESSAGE_ID = 'cookie-message'

function mockBanner(overrides: Partial<CookieConsentBannerControls> = {}): CookieConsentBannerControls {
  const banner: CookieConsentBannerControls = {
    isOpen: true,
    isReopened: false,
    messageId: MESSAGE_ID,
    dialogProps: {
      ref: { current: null },
      role: 'dialog',
      'aria-modal': false,
      'aria-describedby': MESSAGE_ID,
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

describe('CookieConsentBannerContainer', () => {
  it('renders nothing while the banner is closed', () => {
    mockBanner({ isOpen: false })

    const { container } = render(<CookieConsentBannerContainer />)

    expect(container.childElementCount).toBe(0)
  })

  it('labels the banner and links the cookie policy in a new tab', () => {
    mockBanner()
    render(<CookieConsentBannerContainer />)

    const banner = screen.getByRole('dialog', { name: COOKIE_CONSENT_COPY.ariaLabel })
    const link = screen.getByRole('link', { name: COOKIE_CONSENT_COPY.policyLinkLabel })

    expect(document.getElementById(MESSAGE_ID)?.textContent).toContain(COOKIE_CONSENT_COPY.message)
    expect(banner.contains(link)).toBe(true)
    expect(link.getAttribute('href')).toBe('https://cow.fi/legal/cowswap-cookie-policy')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('gives Reject All and Accept All the same button styling', () => {
    mockBanner()
    render(<CookieConsentBannerContainer />)

    const reject = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel })
    const accept = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel })

    expect(reject.className).toBe(accept.className)
  })

  it('reports each choice, with no way to close on a first visit', () => {
    const banner = mockBanner()

    render(<CookieConsentBannerContainer />)
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel }))
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel }))

    expect(banner.accept).toHaveBeenCalledTimes(1)
    expect(banner.reject).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel })).toBeNull()
  })

  it('offers to close when reopened', () => {
    const banner = mockBanner({ isReopened: true })

    render(<CookieConsentBannerContainer />)
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel }))

    expect(banner.close).toHaveBeenCalledTimes(1)
  })

  it('uses the copy it is given', () => {
    mockBanner()
    render(<CookieConsentBannerContainer copy={{ ...COOKIE_CONSENT_COPY, acceptLabel: 'Alle akzeptieren' }} />)

    expect(screen.getByRole('button', { name: 'Alle akzeptieren' })).toBeTruthy()
  })

  it('keeps the default notice when no presentation is requested', () => {
    mockBanner()
    render(<CookieConsentBannerContainer />)

    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('dialog').textContent).toContain(COOKIE_CONSENT_COPY.message)
  })

  it('supports the cow-cookie presentation while preserving the consent controls', () => {
    const banner = mockBanner({ isReopened: true })
    render(
      <CookieConsentBannerContainer
        title="A Coincidence of Wants"
        illustration={<img src="cow-cookie.svg" alt="" />}
        variant="cowCookie"
      />,
    )

    const reject = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel })
    const accept = screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel })

    expect(screen.getByRole('heading', { name: 'A Coincidence of Wants' })).toBeTruthy()
    expect(document.querySelector('img')?.parentElement?.getAttribute('aria-hidden')).toBe('true')
    expect(reject.className).toBe(accept.className)

    fireEvent.click(reject)
    fireEvent.click(accept)
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel }))

    expect(banner.reject).toHaveBeenCalledTimes(1)
    expect(banner.accept).toHaveBeenCalledTimes(1)
    expect(banner.close).toHaveBeenCalledTimes(1)
  })
})
