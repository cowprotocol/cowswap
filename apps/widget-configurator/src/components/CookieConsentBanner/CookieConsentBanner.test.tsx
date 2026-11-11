import { COOKIE_CONSENT_COPY, useCookieConsentBanner } from '@cowprotocol/analytics'

import { fireEvent, render, screen } from '@testing-library/react'

import { CookieConsentBanner } from './CookieConsentBanner'

jest.mock('@cowprotocol/analytics', () => ({
  ...jest.requireActual('@cowprotocol/analytics/consent'),
  useCookieConsentBanner: jest.fn(),
}))
jest.mock('../../theme/context/hooks/useColorMode', () => ({ useColorMode: () => ({ mode: 'dark' }) }))

it('offers both choices and the policy in the configurator', () => {
  const accept = jest.fn()
  const reject = jest.fn()
  jest.mocked(useCookieConsentBanner).mockReturnValue({
    isOpen: true,
    isReopened: false,
    messageId: 'consent-message',
    dialogProps: {
      ref: { current: null },
      role: 'dialog',
      'aria-modal': false,
      'aria-describedby': 'consent-message',
      tabIndex: -1,
    },
    accept,
    reject,
    close: jest.fn(),
  })

  render(<CookieConsentBanner />)
  expect(screen.getByRole('dialog', { name: COOKIE_CONSENT_COPY.ariaLabel })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Accept All' }))
  fireEvent.click(screen.getByRole('button', { name: 'Reject All' }))
  expect(accept).toHaveBeenCalledTimes(1)
  expect(reject).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('link', { name: 'Cookie policy' }).getAttribute('href')).toBe(
    'https://cow.fi/legal/cowswap-cookie-policy',
  )
})
