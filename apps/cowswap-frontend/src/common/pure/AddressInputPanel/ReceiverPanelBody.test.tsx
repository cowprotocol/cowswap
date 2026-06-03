import React from 'react'

import { AdditionalTargetChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen, RenderResult } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { useReceiverChainInfo } from './hooks/useReceiverChainInfo'
import { useReceiverValidation } from './hooks/useReceiverValidation'
import { ReceiverPanelBody } from './ReceiverPanelBody.container'

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: ({ src, ...props }: { src: string; [key: string]: unknown }) => (
    <svg data-testid="inline-svg" data-src={src} {...(props as React.SVGProps<SVGSVGElement>)} />
  ),
}))

jest.mock('./hooks/useReceiverChainInfo', () => ({
  useReceiverChainInfo: jest.fn(),
}))

jest.mock('./hooks/useReceiverValidation', () => ({
  useReceiverValidation: jest.fn(),
}))

jest.mock('./hooks/useOnAddressInput', () => ({
  useOnAddressInput: jest.fn(() => ({ handleInput: jest.fn(), chainPrefixWarning: '' })),
}))

jest.mock('legacy/state/user/hooks', () => ({
  useIsDarkMode: jest.fn(() => false),
}))

jest.mock('common/pure/ChainPrefixWarning', () => ({
  default: () => <div data-testid="chain-prefix-warning" />,
}))

const mockUseReceiverChainInfo = useReceiverChainInfo as jest.MockedFunction<typeof useReceiverChainInfo>
const mockUseReceiverValidation = useReceiverValidation as jest.MockedFunction<typeof useReceiverValidation>

i18n.load('en-US', {})
i18n.activate('en-US')

const EVM_STRATEGY = {
  isValidAddress: (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v),
  supportsENS: true,
  placeholderKey: 'evm' as const,
  supportsChainPrefix: true,
  pattern: undefined,
}

const NON_EVM_STRATEGY = {
  isValidAddress: (v: string) => v.length > 10,
  supportsENS: false,
  placeholderKey: 'nonEvm' as const,
  supportsChainPrefix: false,
  pattern: undefined,
}

const EVM_CHAIN_INFO = { label: 'Arbitrum' } as ReturnType<typeof useReceiverChainInfo>['chainInfo']
const SOL_CHAIN_INFO = { label: 'Solana' } as ReturnType<typeof useReceiverChainInfo>['chainInfo']
const BTC_CHAIN_INFO = { label: 'Bitcoin' } as ReturnType<typeof useReceiverChainInfo>['chainInfo']

const VALID_EVM_ADDRESS = '0x1234567890123456789012345678901234567890'
const VALID_SOL_ADDRESS = 'SolValid1111111111111111111111111111111111111'
const VALID_BTC_ADDRESS = 'bc1qvalid_long_enough'

// --- Mock helpers ---

function mockSolanaChainInfo(): void {
  mockUseReceiverChainInfo.mockReturnValue({
    chainId: SupportedChainId.SOLANA,
    chainInfo: SOL_CHAIN_INFO,
    isNonEvm: true,
    chainIcon: undefined,
    strategy: NON_EVM_STRATEGY,
  })
}

function mockBitcoinChainInfo(): void {
  mockUseReceiverChainInfo.mockReturnValue({
    chainId: AdditionalTargetChainId.BITCOIN,
    chainInfo: BTC_CHAIN_INFO,
    isNonEvm: true,
    chainIcon: undefined,
    strategy: NON_EVM_STRATEGY,
  })
}

function mockArbitrumChainInfo(): void {
  mockUseReceiverChainInfo.mockReturnValue({
    chainId: SupportedChainId.ARBITRUM_ONE,
    chainInfo: EVM_CHAIN_INFO,
    isNonEvm: false,
    chainIcon: undefined,
    strategy: EVM_STRATEGY,
  })
}

function mockValidAddress(explorerUrl: string | null = null): void {
  mockUseReceiverValidation.mockReturnValue({
    loading: false,
    isEmpty: false,
    isValid: true,
    isError: false,
    explorerUrl,
  })
}

function mockInvalidAddress(): void {
  mockUseReceiverValidation.mockReturnValue({
    loading: false,
    isEmpty: false,
    isValid: false,
    isError: true,
    explorerUrl: null,
  })
}

function mockLoadingAddress(): void {
  mockUseReceiverValidation.mockReturnValue({
    loading: true,
    isEmpty: false,
    isValid: false,
    isError: false,
    explorerUrl: null,
  })
}

// --- Render helpers ---

function wrap(element: React.ReactElement): React.ReactElement {
  return (
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>{element}</StyledComponentsThemeProvider>
    </I18nProvider>
  )
}

function renderComponent(props: Partial<React.ComponentProps<typeof ReceiverPanelBody>> = {}): RenderResult {
  return render(wrap(<ReceiverPanelBody className="test-class" value="" onChange={jest.fn()} {...props} />))
}

// --- Tests ---

describe('ReceiverPanelBody — confirmation row visibility', () => {
  beforeEach(() => {
    mockUseReceiverChainInfo.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      chainInfo: EVM_CHAIN_INFO,
      isNonEvm: false,
      chainIcon: undefined,
      strategy: EVM_STRATEGY,
    })
    mockUseReceiverValidation.mockReturnValue({
      loading: false,
      isEmpty: true,
      isValid: false,
      isError: false,
      explorerUrl: null,
    })
  })

  it('does NOT show for EOA on EVM bridge', () => {
    mockValidAddress('https://etherscan.io/address/0x123')
    renderComponent({ value: VALID_EVM_ADDRESS, isSmartContractWalletBridging: false })
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('shows for non-EVM (Solana) bridge with valid address', () => {
    mockSolanaChainInfo()
    mockValidAddress()
    renderComponent({ value: VALID_SOL_ADDRESS, targetChainId: SupportedChainId.SOLANA })
    expect(screen.getByRole('checkbox')).not.toBeNull()
  })

  it('shows for non-EVM (Bitcoin) bridge with valid address', () => {
    mockBitcoinChainInfo()
    mockValidAddress()
    renderComponent({ value: VALID_BTC_ADDRESS, targetChainId: AdditionalTargetChainId.BITCOIN })
    expect(screen.getByRole('checkbox')).not.toBeNull()
  })

  it('shows for SC wallet on EVM bridge with valid address', () => {
    mockArbitrumChainInfo()
    mockValidAddress()
    renderComponent({ value: VALID_EVM_ADDRESS, isSmartContractWalletBridging: true })
    expect(screen.getByRole('checkbox')).not.toBeNull()
  })

  it('does NOT show for non-EVM bridge with invalid address', () => {
    mockSolanaChainInfo()
    mockInvalidAddress()
    renderComponent({ value: 'bad', targetChainId: SupportedChainId.SOLANA })
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('does NOT show for SC wallet + EVM bridge with invalid address', () => {
    mockInvalidAddress()
    renderComponent({ value: 'notanaddress', isSmartContractWalletBridging: true })
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('does NOT show while address is loading', () => {
    mockSolanaChainInfo()
    mockLoadingAddress()
    renderComponent({ value: VALID_SOL_ADDRESS, targetChainId: SupportedChainId.SOLANA })
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('does NOT show for EOA when isSmartContractWallet is false (non-bridging mode)', () => {
    mockValidAddress()
    renderComponent({ value: VALID_EVM_ADDRESS, isSmartContractWalletBridging: false })
    expect(screen.queryByRole('checkbox')).toBeNull()
  })
})

describe('ReceiverPanelBody — confirmation message content', () => {
  it('shows Solana chain name and correct message for non-EVM bridge', () => {
    mockSolanaChainInfo()
    mockValidAddress()
    renderComponent({ value: VALID_SOL_ADDRESS, targetChainId: SupportedChainId.SOLANA })
    expect(screen.getByText(/Solana/)).not.toBeNull()
    expect(screen.getByText(/Confirm this is the correct address/)).not.toBeNull()
  })

  it('shows Arbitrum chain name and correct message for SC wallet EVM bridge', () => {
    mockArbitrumChainInfo()
    mockValidAddress()
    renderComponent({ value: VALID_EVM_ADDRESS, isSmartContractWalletBridging: true })
    expect(screen.getByText(/Arbitrum/)).not.toBeNull()
    expect(screen.getByText(/Confirm this is the correct address/)).not.toBeNull()
  })
})

describe('ReceiverPanelBody — onNonEvmReceiverConfirmedChange callback', () => {
  beforeEach(() => {
    mockSolanaChainInfo()
    mockValidAddress()
  })

  it('calls callback with true when checkbox is checked', () => {
    const onConfirmChange = jest.fn()
    renderComponent({
      value: VALID_SOL_ADDRESS,
      targetChainId: SupportedChainId.SOLANA,
      onNonEvmReceiverConfirmedChange: onConfirmChange,
    })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onConfirmChange).toHaveBeenCalledWith(true)
  })

  it('calls callback with false when checkbox is unchecked after being checked', () => {
    const onConfirmChange = jest.fn()
    renderComponent({
      value: VALID_SOL_ADDRESS,
      targetChainId: SupportedChainId.SOLANA,
      onNonEvmReceiverConfirmedChange: onConfirmChange,
    })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onConfirmChange).toHaveBeenLastCalledWith(false)
  })

  it('resets confirmation when address value changes', () => {
    const onConfirmChange = jest.fn()
    const { rerender } = renderComponent({
      value: VALID_SOL_ADDRESS,
      targetChainId: SupportedChainId.SOLANA,
      onNonEvmReceiverConfirmedChange: onConfirmChange,
    })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onConfirmChange).toHaveBeenLastCalledWith(true)
    rerender(
      wrap(
        <ReceiverPanelBody
          className="test-class"
          value="AnotherSolanaAddress111111111111111111111111"
          onChange={jest.fn()}
          targetChainId={SupportedChainId.SOLANA}
          onNonEvmReceiverConfirmedChange={onConfirmChange}
        />,
      ),
    )
    expect(onConfirmChange).toHaveBeenLastCalledWith(false)
  })

  it('resets confirmation when targetChainId changes', () => {
    const onConfirmChange = jest.fn()
    const { rerender } = renderComponent({
      value: VALID_SOL_ADDRESS,
      targetChainId: SupportedChainId.SOLANA,
      onNonEvmReceiverConfirmedChange: onConfirmChange,
    })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onConfirmChange).toHaveBeenLastCalledWith(true)
    mockBitcoinChainInfo()
    rerender(
      wrap(
        <ReceiverPanelBody
          className="test-class"
          value={VALID_SOL_ADDRESS}
          onChange={jest.fn()}
          targetChainId={AdditionalTargetChainId.BITCOIN}
          onNonEvmReceiverConfirmedChange={onConfirmChange}
        />,
      ),
    )
    expect(onConfirmChange).toHaveBeenLastCalledWith(false)
  })

  it('calls callback with false on unmount when previously confirmed', () => {
    const onConfirmChange = jest.fn()
    const { unmount } = renderComponent({
      value: VALID_SOL_ADDRESS,
      targetChainId: SupportedChainId.SOLANA,
      onNonEvmReceiverConfirmedChange: onConfirmChange,
    })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onConfirmChange).toHaveBeenLastCalledWith(true)
    unmount()
    expect(onConfirmChange).toHaveBeenLastCalledWith(false)
  })

  it('does not call callback on unmount when never confirmed', () => {
    const onConfirmChange = jest.fn()
    const { unmount } = renderComponent({
      value: VALID_SOL_ADDRESS,
      targetChainId: SupportedChainId.SOLANA,
      onNonEvmReceiverConfirmedChange: onConfirmChange,
    })
    unmount()
    expect(onConfirmChange).not.toHaveBeenCalled()
  })
})

describe('ReceiverPanelBody — error state', () => {
  it('shows error text with chain name for invalid non-EVM address', () => {
    mockSolanaChainInfo()
    mockInvalidAddress()
    renderComponent({ value: 'bad', targetChainId: SupportedChainId.SOLANA })
    expect(screen.getByText(/Enter a valid Solana address/)).not.toBeNull()
  })

  it('does not show error text for empty value', () => {
    mockUseReceiverValidation.mockReturnValue({
      loading: false,
      isEmpty: true,
      isValid: false,
      isError: false,
      explorerUrl: null,
    })
    renderComponent({ value: '' })
    expect(screen.queryByText(/Enter a valid/)).toBeNull()
  })

  it('shows error text for invalid EVM address', () => {
    mockInvalidAddress()
    renderComponent({ value: 'notanaddress' })
    expect(screen.getByText(/Enter a valid/)).not.toBeNull()
  })
})

describe('ReceiverPanelBody — valid checkmark', () => {
  it('shows checkmark icon when address is valid and not loading', () => {
    mockValidAddress()
    const { container } = renderComponent({ value: VALID_EVM_ADDRESS })
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('does not show checkmark when address is invalid', () => {
    mockInvalidAddress()
    const { container } = renderComponent({ value: 'bad' })
    expect(container.querySelector('svg')).toBeNull()
  })

  it('does not show checkmark while loading', () => {
    mockLoadingAddress()
    const { container } = renderComponent({ value: VALID_EVM_ADDRESS })
    expect(container.querySelector('svg')).toBeNull()
  })
})
