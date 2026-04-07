import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen, type RenderResult } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { AffiliatePartnerCodeCreation } from './AffiliatePartnerCodeCreation'

import {
  PartnerCodeAvailability,
  useAffiliatePartnerCodeAvailability,
} from '../hooks/useAffiliatePartnerCodeAvailability'
import { useAffiliatePartnerCodeCreate } from '../hooks/useAffiliatePartnerCodeCreate'
import { generateSuggestedCode } from '../lib/affiliateProgramUtils'

jest.mock('@cowprotocol/wallet', () => {
  const actualModule = jest.requireActual('@cowprotocol/wallet')

  return {
    ...actualModule,
    useWalletInfo: jest.fn(),
  }
})

jest.mock('@cowprotocol/wallet-provider', () => {
  const actualModule = jest.requireActual('@cowprotocol/wallet-provider')

  return {
    ...actualModule,
    useWalletChainId: jest.fn(),
    useWalletProvider: jest.fn(),
  }
})

jest.mock('../hooks/useAffiliatePartnerCodeAvailability', () => ({
  PartnerCodeAvailability: {
    Idle: 'idle',
    Checking: 'checking',
    Available: 'available',
    Unavailable: 'unavailable',
  },
  useAffiliatePartnerCodeAvailability: jest.fn(),
}))

jest.mock('../hooks/useAffiliatePartnerCodeCreate', () => ({
  useAffiliatePartnerCodeCreate: jest.fn(),
}))

jest.mock('../lib/affiliateProgramUtils', () => {
  const actualModule = jest.requireActual('../lib/affiliateProgramUtils')

  return {
    ...actualModule,
    generateSuggestedCode: jest.fn(),
  }
})

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useWalletChainIdMock = useWalletChainId as jest.MockedFunction<typeof useWalletChainId>
const useWalletProviderMock = useWalletProvider as jest.MockedFunction<typeof useWalletProvider>
const useAffiliatePartnerCodeAvailabilityMock = useAffiliatePartnerCodeAvailability as jest.MockedFunction<
  typeof useAffiliatePartnerCodeAvailability
>
const useAffiliatePartnerCodeCreateMock = useAffiliatePartnerCodeCreate as jest.MockedFunction<
  typeof useAffiliatePartnerCodeCreate
>
const generateSuggestedCodeMock = generateSuggestedCode as jest.MockedFunction<typeof generateSuggestedCode>

i18n.load('en-US', {})
i18n.activate('en-US')

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

function renderComponent(): RenderResult {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <AffiliatePartnerCodeCreation />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('AffiliatePartnerCodeCreation', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useWalletInfoMock.mockReturnValue({
      account: '0x0000000000000000000000000000000000000001',
    } as ReturnType<typeof useWalletInfo>)
    useWalletChainIdMock.mockReturnValue(1 as ReturnType<typeof useWalletChainId>)
    useWalletProviderMock.mockReturnValue({} as ReturnType<typeof useWalletProvider>)
    useAffiliatePartnerCodeAvailabilityMock.mockReturnValue(PartnerCodeAvailability.Idle)
    useAffiliatePartnerCodeCreateMock.mockReturnValue({
      submitting: false,
      onCreate: jest.fn(),
    })
    generateSuggestedCodeMock.mockReturnValue('COW-407401')
  })

  it('renders the updated copy and preview row', () => {
    renderComponent()

    expect(screen.getByText('Referral code')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Suggest one' })).not.toBeNull()
    expect(screen.getByPlaceholderText('Your-code')).toBe(document.activeElement)
    expect(
      screen.getByText(
        'Pick your own code or generate one. Once saved, it becomes permanently linked to your wallet, without ever revealing your wallet address.',
      ),
    ).not.toBeNull()
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('http://localhost?ref=') ?? false).length,
    ).toBeGreaterThan(0)
    expect(
      (screen.getByRole('button', { name: 'Enter a code to copy the referral link' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('does not autofocus on small screens', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 720px)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    renderComponent()

    expect(screen.getByPlaceholderText('Your-code')).not.toBe(document.activeElement)
  })

  it('updates the preview link when the code changes', () => {
    renderComponent()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MICHEL' } })

    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('http://localhost?ref=MICHEL') ?? false)
        .length,
    ).toBeGreaterThan(0)
    expect((screen.getByRole('button', { name: 'Copy referral link' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('keeps preview copy disabled and clears the slug for invalid codes', () => {
    renderComponent()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MICHEL!' } })

    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('http://localhost?ref=') ?? false).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText((_, element) => element?.textContent?.includes('MICHEL!') ?? false)).toBeNull()
    expect(
      (screen.getByRole('button', { name: 'Enter a code to copy the referral link' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
})
