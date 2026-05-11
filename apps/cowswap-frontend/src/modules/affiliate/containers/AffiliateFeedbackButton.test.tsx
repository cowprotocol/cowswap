import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react'
import { openAffiliateFeedbackAppzi } from 'appzi'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { AffiliateFeedbackButton } from './AffiliateFeedbackButton.container'

jest.mock('@cowprotocol/wallet', () => {
  return {
    useWalletDetails: jest.fn(),
    useWalletInfo: jest.fn(),
  }
})

jest.mock('appzi', () => ({
  isAppziEnabled: true,
  openAffiliateFeedbackAppzi: jest.fn(),
}))

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: jest.fn(),
}))

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

const useWalletDetailsMock = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useIsProviderNetworkUnsupportedMock = useIsProviderNetworkUnsupported as jest.MockedFunction<
  typeof useIsProviderNetworkUnsupported
>
const openAffiliateFeedbackAppziMock = openAffiliateFeedbackAppzi as jest.MockedFunction<
  typeof openAffiliateFeedbackAppzi
>

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(): RenderResult {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <AffiliateFeedbackButton />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('AffiliateFeedbackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useWalletDetailsMock.mockReturnValue({
      walletName: 'Safe',
    } as ReturnType<typeof useWalletDetails>)
    useWalletInfoMock.mockReturnValue({
      account: '0x0000000000000000000000000000000000000001',
      chainId: 1,
    } as ReturnType<typeof useWalletInfo>)
    useIsProviderNetworkUnsupportedMock.mockReturnValue(false)
  })

  it('opens the Appzi feedback form with wallet context', () => {
    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Give feedback' }))

    expect(openAffiliateFeedbackAppziMock).toHaveBeenCalledWith({
      account: '0x0000000000000000000000000000000000000001',
      chainId: 1,
      walletName: 'Safe',
    })
  })

  it('does not render without a connected wallet', () => {
    useWalletInfoMock.mockReturnValue({
      account: undefined,
      chainId: 1,
    } as ReturnType<typeof useWalletInfo>)

    renderComponent()

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not render when the provider network is unsupported', () => {
    useIsProviderNetworkUnsupportedMock.mockReturnValue(true)

    renderComponent()

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })
})
