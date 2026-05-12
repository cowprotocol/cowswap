import { useAtomValue } from 'jotai'
import { type ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, screen, type RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import {
  TraderWalletStatus,
  isSupportedPayoutsNetwork,
  isSupportedTradingNetwork,
  useAffiliateTraderWallet,
} from 'modules/affiliate'

import { Routes as RoutesEnum } from 'common/constants/routes'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import Account from './index'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  useWalletChainId: jest.fn(),
}))

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: jest.fn(),
}))

jest.mock('jotai', () => {
  const actualModule = jest.requireActual('jotai')

  return {
    ...actualModule,
    useAtomValue: jest.fn(),
  }
})

jest.mock('modules/affiliate', () => ({
  AffiliateFeedbackButton: () => <button type="button">Give feedback</button>,
  TraderWalletStatus: {
    ELIGIBLE: 'eligible',
    INELIGIBLE: 'ineligible',
    LINKED: 'linked',
  },
  affiliateTraderSavedCodeAtom: Symbol('affiliateTraderSavedCodeAtom'),
  isSupportedPayoutsNetwork: jest.fn((chainId?: number) => chainId === 1),
  isSupportedTradingNetwork: jest.fn((chainId?: number) => chainId !== undefined && chainId !== 11155111),
  useAffiliateTraderWallet: jest.fn(),
}))

jest.mock('modules/application', () => ({
  Content: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PageTitle: () => null,
  Title: ({ children, id }: { children: ReactNode; id?: string }) => <h1 id={id}>{children}</h1>,
}))

jest.mock('./Menu', () => ({
  AccountMenu: () => <nav aria-label="Account menu" />,
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useWalletChainIdMock = useWalletChainId as jest.MockedFunction<typeof useWalletChainId>
const useIsProviderNetworkUnsupportedMock = useIsProviderNetworkUnsupported as jest.MockedFunction<
  typeof useIsProviderNetworkUnsupported
>
const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const isSupportedPayoutsNetworkMock = isSupportedPayoutsNetwork as jest.MockedFunction<typeof isSupportedPayoutsNetwork>
const isSupportedTradingNetworkMock = isSupportedTradingNetwork as jest.MockedFunction<typeof isSupportedTradingNetwork>
const useAffiliateTraderWalletMock = useAffiliateTraderWallet as jest.MockedFunction<typeof useAffiliateTraderWallet>

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(pathname: string, account?: string): RenderResult {
  useWalletInfoMock.mockReturnValue({
    account,
  } as ReturnType<typeof useWalletInfo>)

  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <I18nProvider i18n={i18n}>
        <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
          <Routes>
            <Route path={RoutesEnum.ACCOUNT} element={<Account />}>
              <Route path="affiliate" element={<div>Affiliate page</div>} />
              <Route path="my-rewards" element={<div>My Rewards page</div>} />
              <Route path="tokens" element={<div>Tokens page</div>} />
            </Route>
          </Routes>
        </StyledComponentsThemeProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('Account', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useWalletChainIdMock.mockReturnValue(1)
    useAtomValueMock.mockReturnValue({ savedCode: 'COW-123', isLinked: true })
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.LINKED)
    isSupportedPayoutsNetworkMock.mockImplementation((chainId?: number) => chainId === 1)
    isSupportedTradingNetworkMock.mockImplementation(
      (chainId?: number) => chainId !== undefined && chainId !== 11155111,
    )
    useIsProviderNetworkUnsupportedMock.mockReturnValue(false)
  })

  it('shows the feedback button on the affiliate page when a wallet is connected', () => {
    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_PARTNER, '0x0000000000000000000000000000000000000001')

    expect(screen.getByRole('button', { name: 'Give feedback' })).not.toBeNull()
    expect(useAffiliateTraderWalletMock).not.toHaveBeenCalled()
  })

  it('does not show the feedback button on the affiliate page when the wallet is not on the payout network', () => {
    useWalletChainIdMock.mockReturnValue(100)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_PARTNER, '0x0000000000000000000000000000000000000001')

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
    expect(useAffiliateTraderWalletMock).not.toHaveBeenCalled()
  })

  it('does not show the feedback button on the affiliate page without a connected wallet', () => {
    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_PARTNER)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
    expect(useAffiliateTraderWalletMock).not.toHaveBeenCalled()
  })

  it('does not show the feedback button on the affiliate page when the provider network is unsupported', () => {
    useIsProviderNetworkUnsupportedMock.mockReturnValue(true)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_PARTNER, '0x0000000000000000000000000000000000000001')

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
    expect(useAffiliateTraderWalletMock).not.toHaveBeenCalled()
  })

  it('shows the feedback button on the My Rewards page when an eligible wallet is connected', () => {
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.ELIGIBLE)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER, '0x0000000000000000000000000000000000000001')

    expect(screen.getByRole('button', { name: 'Give feedback' })).not.toBeNull()
  })

  it('does not show the feedback button on the My Rewards page when the wallet is not on a supported trading network', () => {
    useWalletChainIdMock.mockReturnValue(11155111)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER, '0x0000000000000000000000000000000000000001')

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
    expect(useAffiliateTraderWalletMock).not.toHaveBeenCalled()
  })

  it('does not show the feedback button on the My Rewards page when no code is saved', () => {
    useAtomValueMock.mockReturnValue({})
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.ELIGIBLE)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER, '0x0000000000000000000000000000000000000001')

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not show the feedback button on the My Rewards page when the wallet is ineligible', () => {
    useAffiliateTraderWalletMock.mockReturnValue(TraderWalletStatus.INELIGIBLE)

    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER, '0x0000000000000000000000000000000000000001')

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })

  it('does not show the feedback button on the My Rewards page without a connected wallet', () => {
    renderComponent(RoutesEnum.ACCOUNT_AFFILIATE_TRADER)

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
    expect(useAffiliateTraderWalletMock).not.toHaveBeenCalled()
  })

  it('does not show the feedback button on other account pages', () => {
    renderComponent(RoutesEnum.ACCOUNT_TOKENS, '0x0000000000000000000000000000000000000001')

    expect(screen.queryByRole('button', { name: 'Give feedback' })).toBeNull()
  })
})
