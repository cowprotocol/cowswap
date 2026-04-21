import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useWithRecipient } from './useWithRecipient'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(() => ({ account: undefined, chainId: 1 })),
}))

jest.mock('./useIsWrapOrUnwrap', () => ({
  useIsWrapOrUnwrap: jest.fn(() => false),
}))

jest.mock('./useIsNonEvmBridging', () => ({
  useIsNonEvmBridging: jest.fn(() => false),
}))

jest.mock('./setupTradeState/useTradeStateFromUrl', () => ({
  useTradeStateFromUrl: jest.fn(() => null),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockUseIsNonEvmBridging = useIsNonEvmBridging as jest.MockedFunction<typeof useIsNonEvmBridging>
const mockUseTradeStateFromUrl = useTradeStateFromUrl as jest.MockedFunction<typeof useTradeStateFromUrl>

function renderUseWithRecipient(showRecipient: boolean): boolean {
  const { result } = renderHook(() => useWithRecipient(showRecipient))
  return result.current
}

describe('useWithRecipient', () => {
  beforeEach(() => {
    mockUseWalletInfo.mockReturnValue({ account: undefined, chainId: 1 } as ReturnType<typeof useWalletInfo>)
    mockUseIsWrapOrUnwrap.mockReturnValue(false)
    mockUseIsNonEvmBridging.mockReturnValue(false)
    mockUseTradeStateFromUrl.mockReturnValue(null)
  })

  describe('always false during wrap/unwrap', () => {
    it('returns false for non-EVM bridging during wrap/unwrap', () => {
      mockUseIsWrapOrUnwrap.mockReturnValue(true)
      mockUseIsNonEvmBridging.mockReturnValue(true)
      expect(renderUseWithRecipient(false)).toBe(false)
    })

    it('returns false when recipient is in URL during wrap/unwrap', () => {
      mockUseIsWrapOrUnwrap.mockReturnValue(true)
      mockUseTradeStateFromUrl.mockReturnValue({ recipient: '0xabc' } as ReturnType<typeof useTradeStateFromUrl>)
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })

  describe('non-EVM bridging', () => {
    it('returns true without wallet connected', () => {
      mockUseIsNonEvmBridging.mockReturnValue(true)
      expect(renderUseWithRecipient(false)).toBe(true)
    })

    it('returns true with wallet connected', () => {
      mockUseIsNonEvmBridging.mockReturnValue(true)
      mockUseWalletInfo.mockReturnValue({ account: '0x123', chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })
  })

  describe('recipient in URL', () => {
    it('returns true without wallet connected', () => {
      mockUseTradeStateFromUrl.mockReturnValue({ recipient: '0xabc' } as ReturnType<typeof useTradeStateFromUrl>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })

    it('returns true with wallet connected', () => {
      mockUseTradeStateFromUrl.mockReturnValue({ recipient: '0xabc' } as ReturnType<typeof useTradeStateFromUrl>)
      mockUseWalletInfo.mockReturnValue({ account: '0x123', chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })
  })

  describe('manual showRecipient toggle', () => {
    it('returns false when showRecipient=true but wallet is not connected', () => {
      expect(renderUseWithRecipient(true)).toBe(false)
    })

    it('returns true when showRecipient=true and wallet is connected', () => {
      mockUseWalletInfo.mockReturnValue({ account: '0x123', chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(true)).toBe(true)
    })

    it('returns false when showRecipient=false and wallet is connected (EVM, no bridging)', () => {
      mockUseWalletInfo.mockReturnValue({ account: '0x123', chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })
})
