import { useTheme } from '@cowprotocol/common-hooks'
import { CookieConsentBannerContainer } from '@cowprotocol/ui'

import { render } from '@testing-library/react'
import { DefaultTheme } from 'styled-components/macro'
import { VICE_THEME } from 'theme/viceTheme.constants'

import { CookieConsentBanner } from './CookieConsentBanner.container'

jest.mock('@cowprotocol/common-hooks', () => ({
  useTheme: jest.fn(),
}))

jest.mock('@cowprotocol/ui', () => ({
  CookieConsentBannerContainer: jest.fn(() => null),
}))

const mockedUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockedBanner = CookieConsentBannerContainer as jest.MockedFunction<typeof CookieConsentBannerContainer>

function renderedVariant(theme: Partial<DefaultTheme>): string | undefined {
  mockedUseTheme.mockReturnValue(theme as DefaultTheme)
  mockedBanner.mockClear()

  render(<CookieConsentBanner />)

  return mockedBanner.mock.calls[0][0].variant
}

describe('CookieConsentBanner', () => {
  it('uses the trading presentation by default', () => {
    expect(renderedVariant({})).toBe('trading')
  })

  it('takes its colours from the theme while the Vice theme is on', () => {
    expect(renderedVariant({ customTheme: VICE_THEME })).toBe('themed')
  })
})
