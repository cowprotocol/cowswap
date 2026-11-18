import { isCookieConsentRequired, openCookieSettings } from '@cowprotocol/analytics'

import { fireEvent, render, screen } from '@testing-library/react'

import { ProductVariant } from '../../pure/ProductLogo'

import { Footer } from './index'

jest.mock('@cowprotocol/analytics', () => ({
  ...jest.requireActual('@cowprotocol/analytics'),
  isCookieConsentRequired: jest.fn(),
  openCookieSettings: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useTheme: () => ({ darkMode: false }),
}))

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

describe('Footer', () => {
  it('has no cookie settings button in an app that does not require cookie consent', () => {
    jest.mocked(isCookieConsentRequired).mockReturnValue(false)

    render(<Footer productVariant={ProductVariant.CowDao} />)

    expect(screen.queryByRole('button', { name: 'Cookie settings' })).toBeNull()
  })

  it('opens the cookie settings in an app that requires cookie consent', () => {
    jest.mocked(isCookieConsentRequired).mockReturnValue(true)

    render(<Footer productVariant={ProductVariant.CowDao} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cookie settings' }))

    expect(openCookieSettings).toHaveBeenCalledTimes(1)
  })
})
