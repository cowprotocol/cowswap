import { renderHook } from '@testing-library/react'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useWithRecipient } from './useWithRecipient'

jest.mock('./useIsWrapOrUnwrap', () => ({
  useIsWrapOrUnwrap: jest.fn(() => false),
}))

jest.mock('./useIsNonEvmBridging', () => ({
  useIsNonEvmBridging: jest.fn(() => false),
}))

jest.mock('./setupTradeState/useTradeStateFromUrl', () => ({
  useTradeStateFromUrl: jest.fn(() => null),
}))

const mockUseIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockUseIsNonEvmBridging = useIsNonEvmBridging as jest.MockedFunction<typeof useIsNonEvmBridging>
const mockUseTradeStateFromUrl = useTradeStateFromUrl as jest.MockedFunction<typeof useTradeStateFromUrl>

function renderUseWithRecipient(showRecipient: boolean): boolean {
  const { result } = renderHook(() => useWithRecipient(showRecipient))
  return result.current
}

describe('useWithRecipient', () => {
  beforeEach(() => {
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
    it('returns true', () => {
      mockUseIsNonEvmBridging.mockReturnValue(true)
      expect(renderUseWithRecipient(false)).toBe(true)
    })
  })

  describe('recipient in URL', () => {
    it('returns true', () => {
      mockUseTradeStateFromUrl.mockReturnValue({ recipient: '0xabc' } as ReturnType<typeof useTradeStateFromUrl>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })
  })

  describe('manual showRecipient toggle', () => {
    it('returns true when showRecipient=true regardless of wallet connection', () => {
      expect(renderUseWithRecipient(true)).toBe(true)
    })

    it('returns false when showRecipient=false (EVM, no bridging)', () => {
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })
})
