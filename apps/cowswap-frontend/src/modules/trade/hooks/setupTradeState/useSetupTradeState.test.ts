import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { SwitchInProgressError } from 'common/hooks/useSwitchNetworkWithGuidance'

import { useSetupTradeState } from './useSetupTradeState'

// --- Mocks ---

const mockSwitchNetwork = jest.fn()
const mockTradeNavigate = jest.fn()
const mockUpdateState = jest.fn()

jest.mock('@cowprotocol/common-hooks', () => ({
  useIsWindowVisible: () => false, // Prevent 3rd effect from triggering
  usePrevious: jest.fn(() => undefined),
}))

// Use raw chain IDs (1=MAINNET, 100=GNOSIS_CHAIN) inside jest.mock factories
// since they cannot reference out-of-scope variables like SupportedChainId
jest.mock('@cowprotocol/common-utils', () => ({
  getRawCurrentChainIdFromUrl: () => 100,
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => ({
    chainId: 1,
    account: '0x1234567890abcdef1234567890abcdef12345678',
  }),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  useWalletProvider: () => ({}),
}))

jest.mock('common/hooks/useSwitchNetworkWithGuidance', () => ({
  useSwitchNetworkWithGuidance: () => mockSwitchNetwork,
  SwitchInProgressError: jest.requireActual('common/hooks/useSwitchNetworkWithGuidance').SwitchInProgressError,
}))

jest.mock('modules/trade/hooks/useTradeNavigate', () => ({
  useTradeNavigate: () => mockTradeNavigate,
}))

jest.mock('modules/trade/hooks/useTradeTypeInfoFromUrl', () => ({
  useTradeTypeInfoFromUrl: () => null,
}))

jest.mock('modules/trade/state/alternativeOrder', () => ({
  useIsAlternativeOrderModalVisible: () => false,
}))

jest.mock('modules/trade/types/TradeRawState', () => ({
  getDefaultTradeRawState: (chainId: number) => ({
    chainId,
    targetChainId: null,
    inputCurrencyId: 'DEFAULT_INPUT',
    outputCurrencyId: 'DEFAULT_OUTPUT',
  }),
}))

jest.mock('modules/trade/types/TradeType', () => ({
  TradeType: { LIMIT_ORDER: 'LIMIT_ORDER' },
}))

jest.mock('./useResetStateWithSymbolDuplication', () => ({
  useResetStateWithSymbolDuplication: jest.fn(),
}))

jest.mock('./useSetupTradeStateFromUrl', () => ({
  useSetupTradeStateFromUrl: jest.fn(),
}))

jest.mock('./useTradeStateFromUrl', () => ({
  useTradeStateFromUrl: () => ({
    chainId: 100,
    inputCurrencyId: 'USDC',
    outputCurrencyId: 'COW',
    targetChainId: null,
  }),
}))

jest.mock('../useTradeState', () => ({
  useTradeState: () => ({ state: null, updateState: mockUpdateState }),
}))

// --- Tests ---

/**
 * These tests verify the switchNetworkInWallet error handling in useSetupTradeState.
 *
 * Setup: The mocks are configured so the 2nd useEffect (URL chain change) fires
 * on mount and calls switchNetworkInWallet(GNOSIS_CHAIN, MAINNET).
 * The 3rd effect is disabled (isWindowVisible=false).
 *
 * We control what mockSwitchNetwork does (resolve, reject with different errors)
 * and verify whether tradeNavigate is called (URL revert) or not.
 */
describe('useSetupTradeState - switchNetworkInWallet error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const { usePrevious } = jest.requireMock('@cowprotocol/common-hooks')
    ;(usePrevious as jest.Mock).mockReturnValue(undefined)
  })

  // Test #11: SwitchInProgressError → URL reverts to provider chain
  // navigateAndSwitchNetwork changes URL first; if switch is blocked by in-flight guard,
  // URL must revert so it stays in sync with the wallet's actual chain.
  it('reverts URL on SwitchInProgressError', async () => {
    mockSwitchNetwork.mockRejectedValue(new SwitchInProgressError())

    await act(async () => {
      renderHook(() => useSetupTradeState())
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN, {
      source: 'tradeStateSync',
    })
    expect(mockTradeNavigate).toHaveBeenCalledWith(SupportedChainId.MAINNET, {
      chainId: SupportedChainId.MAINNET,
      targetChainId: null,
      inputCurrencyId: 'DEFAULT_INPUT',
      outputCurrencyId: 'DEFAULT_OUTPUT',
    })
  })

  // Test #12: Timeout error → URL reverts
  it('reverts URL on timeout error', async () => {
    mockSwitchNetwork.mockRejectedValue(new Error('Network switch. Timeout after 60000 ms'))

    await act(async () => {
      renderHook(() => useSetupTradeState())
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN, {
      source: 'tradeStateSync',
    })
    // Should revert to MAINNET (the provider's current chain)
    expect(mockTradeNavigate).toHaveBeenCalledWith(SupportedChainId.MAINNET, {
      chainId: SupportedChainId.MAINNET,
      targetChainId: null,
      inputCurrencyId: 'DEFAULT_INPUT',
      outputCurrencyId: 'DEFAULT_OUTPUT',
    })
  })

  // Test #13: User rejection → URL reverts (existing behavior preserved)
  it('reverts URL on user rejection error', async () => {
    const rejectionError = new Error('User rejected the request')
    mockSwitchNetwork.mockRejectedValue(rejectionError)

    await act(async () => {
      renderHook(() => useSetupTradeState())
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN, {
      source: 'tradeStateSync',
    })
    expect(mockTradeNavigate).toHaveBeenCalledWith(SupportedChainId.MAINNET, {
      chainId: SupportedChainId.MAINNET,
      targetChainId: null,
      inputCurrencyId: 'DEFAULT_INPUT',
      outputCurrencyId: 'DEFAULT_OUTPUT',
    })
  })

  // Test #14: NoSafeContext error → early return, no revert
  it('does not revert URL on NoSafeContext error', async () => {
    const noSafeContextError = new Error('Not in Safe context')
    noSafeContextError.name = 'NoSafeContext'
    mockSwitchNetwork.mockRejectedValue(noSafeContextError)

    await act(async () => {
      renderHook(() => useSetupTradeState())
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN, {
      source: 'tradeStateSync',
    })
    const revertCalls = mockTradeNavigate.mock.calls.filter((call: unknown[]) => call[0] === SupportedChainId.MAINNET)
    expect(revertCalls).toHaveLength(0)
  })

  // Test #15: Successful switch → no error-path tradeNavigate call
  it('does not call tradeNavigate in error path on success', async () => {
    mockSwitchNetwork.mockResolvedValue(undefined)

    await act(async () => {
      renderHook(() => useSetupTradeState())
    })

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN, {
      source: 'tradeStateSync',
    })
    // tradeNavigate should not be called with MAINNET for revert
    const revertCalls = mockTradeNavigate.mock.calls.filter((call: unknown[]) => call[0] === SupportedChainId.MAINNET)
    expect(revertCalls).toHaveLength(0)
  })
})
