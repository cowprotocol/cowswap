import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useResetReceiverConfirmationOnWalletChange } from './useResetReceiverConfirmationOnWalletChange'

const mockSetNonEvmReceiverConfirmed = jest.fn()

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(() => ({ account: '0x123', chainId: 1 })),
}))

jest.mock('../state/nonEvmReceiverConfirmedAtom.atoms', () => ({
  useSetNonEvmReceiverConfirmed: jest.fn(() => mockSetNonEvmReceiverConfirmed),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

describe('useResetReceiverConfirmationOnWalletChange', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ account: '0x123', chainId: 1 } as ReturnType<typeof useWalletInfo>)
  })

  it('resets confirmation on mount', () => {
    renderHook(() => useResetReceiverConfirmationOnWalletChange())
    expect(mockSetNonEvmReceiverConfirmed).toHaveBeenCalledWith(false)
  })

  it('resets confirmation when account changes', () => {
    const { rerender } = renderHook(() => useResetReceiverConfirmationOnWalletChange())
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: '0xNEW', chainId: 1 } as ReturnType<typeof useWalletInfo>)
    rerender()

    expect(mockSetNonEvmReceiverConfirmed).toHaveBeenCalledWith(false)
  })

  it('resets confirmation when chainId changes', () => {
    const { rerender } = renderHook(() => useResetReceiverConfirmationOnWalletChange())
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: '0x123', chainId: 42161 } as ReturnType<typeof useWalletInfo>)
    rerender()

    expect(mockSetNonEvmReceiverConfirmed).toHaveBeenCalledWith(false)
  })

  it('does NOT reset when account and chainId are unchanged', () => {
    const { rerender } = renderHook(() => useResetReceiverConfirmationOnWalletChange())
    jest.clearAllMocks()

    rerender()

    expect(mockSetNonEvmReceiverConfirmed).not.toHaveBeenCalled()
  })
})
