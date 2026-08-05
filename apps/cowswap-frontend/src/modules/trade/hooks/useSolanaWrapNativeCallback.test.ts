import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { renderHook } from '@testing-library/react'

import { useSolanaWrapNativeCallback } from './useSolanaWrapNativeCallback'

const ACCOUNT = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const SOL_AMOUNT = CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.SOLANA], 1n)
const ETH_AMOUNT = CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.MAINNET], 1n)

// Mocked wholesale rather than spread over the real module: importing it for real instantiates the
// Reown AppKit adapters at module scope, which needs a browser.
jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
  useSolanaWalletProvider: jest.fn(),
}))

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: jest.fn(),
}))

jest.mock('legacy/state/enhancedTransactions/hooks', () => ({
  useTransactionAdder: () => jest.fn(),
}))

jest.mock('@cowprotocol/analytics', () => ({
  useCowAnalytics: () => ({ sendEvent: jest.fn() }),
  // Called by the global jest setup between tests
  __resetGtmInstance: jest.fn(),
}))

const mockWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockProvider = useSolanaWalletProvider as jest.MockedFunction<typeof useSolanaWalletProvider>
const mockConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>

describe('useSolanaWrapNativeCallback', () => {
  beforeEach(() => {
    mockWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA, account: ACCOUNT } as ReturnType<
      typeof useWalletInfo
    >)
    mockProvider.mockReturnValue({} as ReturnType<typeof useSolanaWalletProvider>)
    mockConnection.mockReturnValue({ connection: {} } as ReturnType<typeof useAppKitConnection>)
  })

  it('provides a callback when a Solana wallet is connected', () => {
    const { result } = renderHook(() => useSolanaWrapNativeCallback(SOL_AMOUNT))

    expect(result.current).toBeInstanceOf(Function)
  })

  it('yields nothing on an EVM chain so the EVM flow stays in charge', () => {
    mockWalletInfo.mockReturnValue({ chainId: SupportedChainId.MAINNET, account: ACCOUNT } as ReturnType<
      typeof useWalletInfo
    >)

    const { result } = renderHook(() => useSolanaWrapNativeCallback(ETH_AMOUNT))

    expect(result.current).toBeNull()
  })

  it('yields nothing while the wallet provider is unavailable', () => {
    mockProvider.mockReturnValue(undefined)

    const { result } = renderHook(() => useSolanaWrapNativeCallback(SOL_AMOUNT))

    expect(result.current).toBeNull()
  })

  it('yields nothing while the RPC connection is unavailable', () => {
    mockConnection.mockReturnValue({ connection: undefined })

    const { result } = renderHook(() => useSolanaWrapNativeCallback(SOL_AMOUNT))

    expect(result.current).toBeNull()
  })

  it('yields nothing without an amount', () => {
    const { result } = renderHook(() => useSolanaWrapNativeCallback(undefined))

    expect(result.current).toBeNull()
  })
})
