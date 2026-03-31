import React from 'react'

import { AdditionalTargetChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { AddressInputPanel } from './AddressInputPanel'

jest.mock('@cowprotocol/ens', () => ({
  useENS: jest.fn(() => ({ address: null, loading: false, name: null })),
}))

jest.mock('@cowprotocol/wallet', () => ({
  // SupportedChainId.MAINNET = 1
  useWalletInfo: jest.fn(() => ({ chainId: 1 })),
}))

jest.mock('@cowprotocol/cow-sdk', () => {
  const actual = jest.requireActual('@cowprotocol/cow-sdk')
  return {
    ...actual,
    isBtcAddress: jest.fn((v: string) => v === 'bc1qvalid'),
    isSolanaAddress: jest.fn((v: string) => v === 'SolValid1111111111111111111111111111111111111'),
    isEvmChain: jest.fn((id: number) => id in actual.SupportedChainId),
  }
})

jest.mock('@cowprotocol/common-utils', () => {
  const actual = jest.requireActual('@cowprotocol/common-utils')
  return {
    ...actual,
    isAddress: jest.fn((v: string) => /^0x[a-fA-F0-9]{40}$/.test(v)),
    getBlockExplorerUrl: jest.fn(() => 'https://etherscan.io/address/0x123'),
    isPrefixedAddress: jest.fn(() => false),
    parsePrefixedAddress: jest.fn(() => ({ prefix: undefined, address: undefined })),
  }
})

jest.mock('@cowprotocol/common-const', () => {
  const actual = jest.requireActual('@cowprotocol/common-const')
  return {
    ...actual,
    getChainInfo: jest.fn(() => ({ addressPrefix: 'eth' })),
  }
})

jest.mock('legacy/state/user/hooks', () => ({
  useIsDarkMode: jest.fn(() => false),
}))

jest.mock('legacy/components/Column', () => ({
  AutoColumn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('common/pure/ChainPrefixWarning', () => ({
  default: () => <div data-testid="chain-prefix-warning" />,
}))

jest.mock('common/utils/addressValidation', () => {
  const actual = jest.requireActual('@cowprotocol/cow-sdk')
  return {
    getAddressValidationStrategy: jest.fn((targetChainId?: number) => {
      if (targetChainId === actual.AdditionalTargetChainId.BITCOIN) {
        return {
          isValidAddress: (v: string) => v === 'bc1qvalid',
          supportsENS: false,
          placeholderKey: 'nonEvm',
          supportsChainPrefix: false,
        }
      }
      if (targetChainId === actual.AdditionalTargetChainId.SOLANA) {
        return {
          isValidAddress: (v: string) => v === 'SolValid1111111111111111111111111111111111111',
          supportsENS: false,
          placeholderKey: 'nonEvm',
          supportsChainPrefix: false,
        }
      }
      return {
        isValidAddress: (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v),
        supportsENS: true,
        placeholderKey: 'evm',
        supportsChainPrefix: true,
      }
    }),
  }
})

const mockUseENS = useENS as jest.MockedFunction<typeof useENS>

i18n.load('en-US', {})
i18n.activate('en-US')

function renderComponent(
  props: Partial<React.ComponentProps<typeof AddressInputPanel>> = {},
): ReturnType<typeof render> {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  }
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <AddressInputPanel {...defaultProps} {...props} />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('AddressInputPanel', () => {
  beforeEach(() => {
    mockUseENS.mockReturnValue({ address: null, loading: false, name: null })
  })

  it('renders with default Recipient label', () => {
    renderComponent()
    expect(screen.getByText('Recipient')).not.toBeNull()
  })

  it('renders custom label when provided', () => {
    renderComponent({ label: 'Custom Label' })
    expect(screen.getByText('Custom Label')).not.toBeNull()
  })

  it('uses ENS placeholder for EVM target', () => {
    renderComponent()
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('placeholder')).toBe('Wallet Address or ENS name')
  })

  it('uses non-ENS placeholder for BTC target', () => {
    renderComponent({ targetChainId: AdditionalTargetChainId.BITCOIN })
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('placeholder')).toBe('Recipient address')
  })

  it('uses non-ENS placeholder for SOL target', () => {
    renderComponent({ targetChainId: AdditionalTargetChainId.SOLANA })
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('placeholder')).toBe('Recipient address')
  })

  it('shows View on Explorer link for valid EVM address', () => {
    mockUseENS.mockReturnValueOnce({
      address: '0x1234567890123456789012345678901234567890',
      loading: false,
      name: null,
    })
    renderComponent({ value: '0x1234567890123456789012345678901234567890' })
    expect(screen.getByText('(View on Explorer)')).not.toBeNull()
  })

  it('does not show View on Explorer for BTC target', () => {
    renderComponent({ value: 'bc1qvalid', targetChainId: AdditionalTargetChainId.BITCOIN })
    expect(screen.queryByText('(View on Explorer)')).toBeNull()
  })

  it('does not show View on Explorer for SOL target', () => {
    renderComponent({
      value: 'SolValid1111111111111111111111111111111111111',
      targetChainId: AdditionalTargetChainId.SOLANA,
    })
    expect(screen.queryByText('(View on Explorer)')).toBeNull()
  })

  it('skips ENS resolution for BTC target', () => {
    renderComponent({ value: 'bc1qvalid', targetChainId: AdditionalTargetChainId.BITCOIN })
    expect(mockUseENS).toHaveBeenCalledWith(undefined)
  })

  it('uses ENS resolution for EVM targets', () => {
    const val = '0x1234567890123456789012345678901234567890'
    renderComponent({ value: val })
    expect(mockUseENS).toHaveBeenCalledWith(val)
  })

  it('uses custom placeholder when provided', () => {
    renderComponent({ placeholder: 'Enter custom address' })
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('placeholder')).toBe('Enter custom address')
  })
})
