import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { fireEvent, render, screen, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { BANNER_IDS } from 'common/constants/banners'

import { RECOVERY_BANNER_REVOKE_URL } from './RecoveryBanner.constants'
import { RecoveryBanner } from './RecoveryBanner.container'

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
  }
})

jest.mock('@cowprotocol/common-utils', () => {
  const actualModule = jest.requireActual('@cowprotocol/common-utils')

  return {
    ...actualModule,
    isInjectedWidget: jest.fn(),
  }
})

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(): RenderResult {
  return render(
    <MemoryRouter initialEntries={['/1/swap']}>
      <I18nProvider i18n={i18n}>
        <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
          <RecoveryBanner />
        </StyledComponentsThemeProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('RecoveryBanner', () => {
  const sendEvent = jest.fn()

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()

    useCowAnalyticsMock.mockReturnValue({
      sendEvent,
    } as unknown as ReturnType<typeof useCowAnalytics>)
    useFeatureFlagsMock.mockReturnValue({
      isRecoveryBannerEnabled: true,
    } as ReturnType<typeof useFeatureFlags>)
    isInjectedWidgetMock.mockReturnValue(false)
  })

  it('renders when the flag is enabled and tracks the impression', () => {
    renderComponent()

    expect(screen.getByTestId('recovery-banner')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Revoke.cash' }).getAttribute('href')).toBe(RECOVERY_BANNER_REVOKE_URL)
    expect(sendEvent).toHaveBeenCalledWith('recovery_banner_shown', undefined)
  })

  it('does not render when the flag is disabled', () => {
    useFeatureFlagsMock.mockReturnValue({
      isRecoveryBannerEnabled: false,
    } as ReturnType<typeof useFeatureFlags>)

    renderComponent()

    expect(screen.queryByTestId('recovery-banner')).toBeNull()
    expect(sendEvent).not.toHaveBeenCalled()
  })

  it('does not render inside injected widget mode', () => {
    isInjectedWidgetMock.mockReturnValue(true)

    renderComponent()

    expect(screen.queryByTestId('recovery-banner')).toBeNull()
    expect(sendEvent).not.toHaveBeenCalled()
  })

  it('persists dismissal locally and tracks dismiss and revoke clicks', () => {
    const { unmount } = renderComponent()

    fireEvent.click(screen.getByRole('link', { name: 'Revoke.cash' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss incident notice' }))

    expect(sendEvent).toHaveBeenCalledWith('recovery_banner_link_clicked', {
      linkTarget: 'revokeCash',
    })
    expect(sendEvent).toHaveBeenCalledWith('recovery_banner_dismissed', undefined)
    expect(localStorage.getItem(BANNER_IDS.RECOVERY)).toBe('false')
    expect(screen.queryByTestId('recovery-banner')).toBeNull()

    unmount()
    renderComponent()

    expect(screen.queryByTestId('recovery-banner')).toBeNull()
  })
})
