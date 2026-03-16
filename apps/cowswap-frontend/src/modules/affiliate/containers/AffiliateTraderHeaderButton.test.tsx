import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { AffiliateTraderHeaderButton } from './AffiliateTraderHeaderButton.container'

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

jest.mock('@cowprotocol/common-hooks', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-hooks')

  return {
    ...actualModule,
    useFeatureFlags: jest.fn(),
    useTheme: jest.fn(),
  }
})

jest.mock('common/hooks/useNavigate', () => {
  return {
    useNavigate: jest.fn(),
  }
})

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const useThemeMock = useTheme as jest.MockedFunction<typeof useTheme>
const useNavigateMock = useNavigate as jest.MockedFunction<typeof useNavigate>

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(): RenderResult {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <AffiliateTraderHeaderButton />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('AffiliateTraderHeaderButton', () => {
  const sendEvent = jest.fn()
  const navigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useCowAnalyticsMock.mockReturnValue({
      sendEvent,
    } as unknown as ReturnType<typeof useCowAnalytics>)
    useFeatureFlagsMock.mockReturnValue({
      isAffiliateProgramEnabled: true,
    } as ReturnType<typeof useFeatureFlags>)
    useThemeMock.mockReturnValue({
      isWidget: false,
    } as ReturnType<typeof useTheme>)
    useNavigateMock.mockReturnValue(navigate)
  })

  it('renders the header refer button when the affiliate program is enabled', () => {
    renderComponent()

    expect(screen.getByRole('button', { name: 'Refer' })).not.toBeNull()
  })

  it('does not render when the affiliate program is disabled', () => {
    useFeatureFlagsMock.mockReturnValue({
      isAffiliateProgramEnabled: false,
    } as ReturnType<typeof useFeatureFlags>)

    renderComponent()

    expect(screen.queryByRole('button', { name: 'Refer' })).toBeNull()
  })

  it('does not render in widget mode', () => {
    useThemeMock.mockReturnValue({
      isWidget: true,
    } as ReturnType<typeof useTheme>)

    renderComponent()

    expect(screen.queryByRole('button', { name: 'Refer' })).toBeNull()
  })

  it('navigates to the affiliate account page and tracks the click', () => {
    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Refer' }))

    expect(sendEvent).toHaveBeenCalledWith({
      category: 'affiliate',
      action: 'cta_clicked',
      label: 'header_refer',
    })
    expect(navigate).toHaveBeenCalledWith(Routes.ACCOUNT_AFFILIATE_PARTNER)
  })
})
