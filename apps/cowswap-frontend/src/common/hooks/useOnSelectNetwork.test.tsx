import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { useOnSelectNetwork } from './useOnSelectNetwork'

// --- Mocks ---

const mockSwitchNetworkWithGuidance = jest.fn()
const mockAddSnackbar = jest.fn()
const mockCloseModal = jest.fn()
const mockSetChainIdToUrl = jest.fn()
const mockSetWalletConnectionError = jest.fn()

jest.mock('./useSwitchNetworkWithGuidance', () => {
  class SwitchInProgressError extends Error {
    constructor() {
      super('Network switch already in progress')
      this.name = 'SwitchInProgressError'
    }
  }
  return {
    useSwitchNetworkWithGuidance: () => mockSwitchNetworkWithGuidance,
    SwitchInProgressError,
  }
})

jest.mock('@cowprotocol/common-const', () => ({
  getChainInfo: (chainId: number) => ({ label: `Chain ${chainId}` }),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isRejectRequestProviderError: (error: Error) => error.message === 'User rejected',
}))

jest.mock('@cowprotocol/snackbars', () => ({
  useAddSnackbar: () => mockAddSnackbar,
}))

jest.mock('legacy/state/application/hooks', () => ({
  useCloseModal: () => mockCloseModal,
}))

jest.mock('legacy/state/application/reducer', () => ({
  ApplicationModal: { NETWORK_SELECTOR: 'NETWORK_SELECTOR' },
}))

jest.mock('modules/wallet/hooks/useSetWalletConnectionError', () => ({
  useSetWalletConnectionError: () => mockSetWalletConnectionError,
}))

jest.mock('./useLegacySetChainIdToUrl', () => ({
  useLegacySetChainIdToUrl: () => mockSetChainIdToUrl,
}))

// --- Tests ---

describe('useOnSelectNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test #8: SwitchInProgressError → no error snackbar, no URL update
  it('does not show error snackbar or update URL on SwitchInProgressError', async () => {
    const { SwitchInProgressError } = jest.requireMock('./useSwitchNetworkWithGuidance')
    mockSwitchNetworkWithGuidance.mockRejectedValue(new SwitchInProgressError())

    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.GNOSIS_CHAIN)
    })

    expect(mockSetChainIdToUrl).not.toHaveBeenCalled()
    expect(mockAddSnackbar).not.toHaveBeenCalled()
  })

  // Test #9: Timeout error → error snackbar shown, no URL update
  it('shows error snackbar on timeout error', async () => {
    const timeoutError = new Error('Network switch. Timeout after 60000 ms')
    mockSwitchNetworkWithGuidance.mockRejectedValue(timeoutError)

    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.GNOSIS_CHAIN)
    })

    expect(mockSetChainIdToUrl).not.toHaveBeenCalled()
    expect(mockAddSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'failed-network-switch',
        icon: 'alert',
      }),
    )
    expect(mockSetWalletConnectionError).toHaveBeenCalledWith(timeoutError.message)
  })

  // Test #10: Successful switch → URL updated, no error snackbar
  it('updates URL on successful switch', async () => {
    mockSwitchNetworkWithGuidance.mockResolvedValue(undefined)

    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.GNOSIS_CHAIN)
    })

    expect(mockSetChainIdToUrl).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
    expect(mockAddSnackbar).not.toHaveBeenCalled()
  })
})
