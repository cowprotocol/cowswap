import { COOKIE_CONSENT_COPY, CookieConsentControls, useCookieConsent } from '@cowprotocol/analytics'

import { fireEvent, render, screen } from '@testing-library/react'

import { CookieConsentBannerContainer } from './CookieConsentBanner.container'

jest.mock('@cowprotocol/analytics', () => ({
  ...jest.requireActual('@cowprotocol/analytics/consent'),
  useCookieConsent: jest.fn(),
}))

const useCookieConsentMock = jest.mocked(useCookieConsent)

function mockConsent(overrides: Partial<CookieConsentControls>): CookieConsentControls {
  const controls: CookieConsentControls = {
    consent: null,
    isBannerOpen: true,
    acceptCookies: jest.fn(),
    rejectCookies: jest.fn(),
    openCookieSettings: jest.fn(),
    closeCookieSettings: jest.fn(),
    ...overrides,
  }

  useCookieConsentMock.mockReturnValue(controls)

  return controls
}

describe('CookieConsentBannerContainer', () => {
  it('renders nothing while the banner is closed', () => {
    mockConsent({ isBannerOpen: false })

    const { container } = render(<CookieConsentBannerContainer />)

    expect(container.childElementCount).toBe(0)
  })

  it('wires the choices to the consent store', () => {
    const controls = mockConsent({})

    render(<CookieConsentBannerContainer />)
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.acceptLabel }))
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.rejectLabel }))

    expect(controls.acceptCookies).toHaveBeenCalledTimes(1)
    expect(controls.rejectCookies).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel })).toBeNull()
  })

  it('offers to close the settings once a choice exists', () => {
    const controls = mockConsent({
      consent: { choice: 'accepted', decidedAt: '2026-11-09T12:00:00.000Z', policyVersion: 1 },
    })

    render(<CookieConsentBannerContainer />)
    fireEvent.click(screen.getByRole('button', { name: COOKIE_CONSENT_COPY.closeLabel }))

    expect(controls.closeCookieSettings).toHaveBeenCalledTimes(1)
  })

  it('uses the copy it is given', () => {
    mockConsent({})

    render(<CookieConsentBannerContainer copy={{ ...COOKIE_CONSENT_COPY, acceptLabel: 'Alle akzeptieren' }} />)

    expect(screen.getByRole('button', { name: 'Alle akzeptieren' })).toBeTruthy()
  })
})
