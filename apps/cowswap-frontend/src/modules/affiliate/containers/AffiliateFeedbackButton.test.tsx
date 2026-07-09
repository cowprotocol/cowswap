import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react'
import { openAffiliateFeedbackAppzi } from 'appzi'
import { MemoryRouter } from 'react-router'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Routes as RoutesEnum } from 'common/constants/routes'

import { AffiliateFeedbackButton } from './AffiliateFeedbackButton.container'

import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { isSupportedTradingNetwork } from '../lib/affiliateProgramUtils'

jest.mock('@cowprotocol/wallet', () => {
  return {
    useWalletDetails: jest.fn(),
    useWalletInfo: jest.fn(),
  }
})

jest.mock('@cowprotocol/wallet-provider', () => ({
  useWalletChainId: jest.fn(),
}))

jest.mock('appzi', () => ({
  isAppziEnabled: true,
  openAffiliateFeedbackAppzi: jest.fn(),
}))

jest.mock('jotai', () => {
  const actualModule = jest.requireActual('jotai')

  return {
    ...actualModule,
    useAtomValue: jest.fn(),
  }
})

jest.mock('../hooks/useAffiliateTraderWallet', () => ({
  TraderWalletStatus: {
    ELIGIBLE: 'eligible',
    INELIGIBLE: 'ineligible',
    LINKED: 'linked',
  },
  useAffiliateTraderWallet: jest.fn(),
}))

jest.mock('../lib/affiliateProgramUtils', () => ({
  isSupportedTradingNetwork: jest.fn((chainId?: number) => chainId !== undefined && chainId !== 11155111),
}))

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

const useWalletDetailsMock = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useWalletChainIdMock = useWalletChainId as jest.MockedFunction<typeof useWalletChainId>
const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useAffiliateTraderWalletMock = useAffiliateTraderWallet as jest.MockedFunction<typeof useAffiliateTraderWallet>
const isSupportedTradingNetworkMock = isSupportedTradingNetwork as jest.MockedFunction<typeof isSupportedTradingNetwork>
const openAffiliateFeedbackAppziMock = openAffiliateFeedbackAppzi as jest.MockedFunction<
  typeof openAffiliateFeedbackAppzi
>

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(pathname: string = RoutesEnum.ACCOUNT_AFFILIATE_PARTNER): RenderResult {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <I18nProvider i18n={i18n}>
        <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
          <AffiliateFeedbackButton />
        </StyledComponentsThemeProvider>
      </I18nProvider>
    </MemoryRouter>,
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
      chainId: SupportedChainId.MAINNET,
    } as ReturnType<typeof useWalletInfo>)
    useWalletChainIdMock.mockReturnValue(SupportedChainId.MAINNET)
    useAtomValueMock.mockReturnValue({ savedCode: 'COW-123', isLinked: true })
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.LINKED)
    isSupportedTradingNetworkMock.mockImplementation(
      (chainId?: number) => chainId !== undefined && chainId !== 11155111,
    )
  })

  it('opens the Appzi feedback form with wallet context on the affiliate page', () => {
    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Give feedback' }))

    expect(openAffiliateFeedbackAppziMock).toHaveBeenCalledWith({
      account: '0x0000000000000000000000000000000000000001',
      chainId: SupportedChainId.MAINNET,
      walletName: 'Safe',
    })
  })

  it('renders on the affiliate page for supported non-Ethereum affiliate networks', () => {
    useWalletChainIdMock.mockReturnValue(SupportedChainId.BNB)

    renderComponent()

    expect(screen.getByRole('button', { name: 'Give feedback' })).not.toBeNull()
  })

  it('does not render without a connected wallet', () => {
    useWalletInfoMock.mockReturnValue({
      account: undefined,
      chainId: SupportedChainId.MAINNET,
    } as ReturnType<typeof useWalletInfo>)

    renderComponent()

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not render on the affiliate page when the network is not affiliate-supported', () => {
    useWalletChainIdMock.mockReturnValue(11155111)

    renderComponent()

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('renders on the My Rewards page when a saved code exists and the trader is eligible', () => {
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.ELIGIBLE)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER)

    expect(screen.getByRole('button', { name: 'Give feedback' })).not.toBeNull()
  })

  it('does not render on the My Rewards page when no code is saved', () => {
    useAtomValueMock.mockReturnValue({})
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.ELIGIBLE)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not render on the My Rewards page when the trader is ineligible', () => {
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.INELIGIBLE)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not render on the My Rewards page when the network is not affiliate-supported', () => {
    useWalletChainIdMock.mockReturnValue(11155111)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not render outside affiliate account pages', () => {
    renderComponent(RoutesEnum.ACCOUNT_TOKENS)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })
})
